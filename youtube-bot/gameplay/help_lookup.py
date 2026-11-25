"""Ask the outside world for help — under an allowlist, and never by default.

The autopilot may look up a *fixed* question ("how is the jump bound in game X")
on a small set of documentation hosts. Three rules keep that from becoming an
open proxy for untrusted screen text:

1. the query is built here from a trusted objective plus digits/letters only, so a
   game cannot smuggle a URL, a shell fragment or an instruction into it;
2. only the hosts in ``ALLOWED_HOSTS`` over HTTPS, no redirects, bounded body
   size and timeout;
3. results are reduced to a title, a URL and a short plain-text snippet, and are
   cached on disk so repeated lookups cost nothing and stay auditable.

The network is opt-in: ``HelpDesk(allow_network=False)`` is the default and the
bridge container runs with ``--network none``, so offline runs simply miss the
cache and continue with the reflex layer.
"""
from __future__ import annotations

import hashlib
import json
import re
import time
import urllib.parse
import urllib.request
from dataclasses import dataclass
from html import unescape
from pathlib import Path

ALLOWED_HOSTS = frozenset({
    "en.wikipedia.org",
    "ru.wikipedia.org",
    "store.steampowered.com",
})
MAX_BODY_BYTES = 200_000
MAX_HINTS = 3
MAX_SNIPPET = 240
TIMEOUT_S = 5.0
CACHE_TTL_S = 7 * 24 * 3600

_QUESTION = re.compile(r"[A-Za-z0-9 ,.'-]{1,80}")
_TAG = re.compile(r"<[^>]+>")
_SPACE = re.compile(r"\s+")


class HelpLookupError(ValueError):
    """Raised for a query or host that violates the allowlist."""


@dataclass(frozen=True)
class Hint:
    title: str
    url: str
    snippet: str

    def as_dict(self) -> dict:
        return {"title": self.title, "url": self.url, "snippet": self.snippet}

    def prompt_line(self) -> str:
        """One bounded line to add to a slow advisor's prompt."""
        return f"hint[{self.title}]: {self.snippet}"[:300]


def clean_question(text: str) -> str:
    """Reject anything that is not a short, plain-language question."""
    if not isinstance(text, str):
        raise HelpLookupError("question must be text")
    text = _SPACE.sub(" ", text).strip()
    if not _QUESTION.fullmatch(text) or "://" in text or "@" in text:
        raise HelpLookupError("question contains characters outside the allowlist")
    return text


def search_url(question: str, host: str = "en.wikipedia.org") -> str:
    if host not in ALLOWED_HOSTS:
        raise HelpLookupError(f"host {host!r} is not allowlisted")
    return f"https://{host}/w/index.php?search=" + urllib.parse.quote(clean_question(question))


def strip_html(body: str) -> str:
    """Crude, deliberately dependency-free reduction to readable text."""
    body = re.sub(r"(?is)<(script|style)[^>]*>.*?</\1>", " ", body)
    text = _SPACE.sub(" ", unescape(_TAG.sub(" ", body))).strip()
    return text


class HelpDesk:
    """Cached, allowlisted lookup; injectable fetcher keeps tests offline."""

    def __init__(self, cache_path: Path | str | None = None, *, allow_network: bool = False,
                 fetcher=None, ttl_s: int = CACHE_TTL_S, timeout_s: float = TIMEOUT_S):
        self.cache_path = Path(cache_path) if cache_path is not None else None
        self.allow_network = bool(allow_network)
        self.fetcher = fetcher or self._fetch
        self.ttl_s = ttl_s
        self.timeout_s = min(float(timeout_s), 10.0)
        self.cache: dict[str, dict] = {}
        self.requests = 0
        self.cache_hits = 0
        if self.cache_path is not None and self.cache_path.exists():
            try:
                loaded = json.loads(self.cache_path.read_text(encoding="utf-8"))
                if isinstance(loaded, dict) and loaded.get("version") == 1:
                    self.cache = {k: v for k, v in loaded.get("entries", {}).items()
                                  if isinstance(v, dict)}
            except (ValueError, OSError):
                self.cache = {}

    # -- network ---------------------------------------------------------
    def _fetch(self, url: str) -> str:
        if not self.allow_network:
            raise HelpLookupError("network access is disabled for help lookup")
        parsed = urllib.parse.urlsplit(url)
        if parsed.scheme != "https" or parsed.hostname not in ALLOWED_HOSTS:
            raise HelpLookupError("refusing a non-allowlisted URL")
        request = urllib.request.Request(url, headers={"User-Agent": "games-autopilot/1"})
        with urllib.request.urlopen(request, timeout=self.timeout_s) as response:  # noqa: S310
            if response.geturl() != url:
                raise HelpLookupError("redirects are not followed")
            body = response.read(MAX_BODY_BYTES + 1)
        if len(body) > MAX_BODY_BYTES:
            raise HelpLookupError("response too large")
        return body.decode("utf-8", "replace")

    # -- cache -----------------------------------------------------------
    def _key(self, question: str, host: str) -> str:
        return hashlib.sha256(f"{host}\n{question}".encode()).hexdigest()[:24]

    def _save(self) -> None:
        if self.cache_path is None:
            return
        self.cache_path.parent.mkdir(parents=True, exist_ok=True)
        payload = json.dumps({"version": 1, "entries": self.cache}, ensure_ascii=False, indent=1)
        self.cache_path.write_text(payload, encoding="utf-8")

    # -- public API ------------------------------------------------------
    def ask(self, question: str, host: str = "en.wikipedia.org", *, now: float | None = None) -> list[Hint]:
        """Return at most ``MAX_HINTS`` hints, from cache when fresh."""
        question = clean_question(question)
        url = search_url(question, host)
        key = self._key(question, host)
        now = time.time() if now is None else now
        cached = self.cache.get(key)
        if cached and now - cached.get("at", 0) <= self.ttl_s:
            self.cache_hits += 1
            return [Hint(**h) for h in cached.get("hints", [])][:MAX_HINTS]
        if not self.allow_network:
            return []
        self.requests += 1
        try:
            body = self.fetcher(url)
        except Exception:
            return []
        if not isinstance(body, str):
            return []
        hints = self._parse(body, host)
        self.cache[key] = {"at": now, "question": question, "hints": [h.as_dict() for h in hints]}
        if len(self.cache) > 200:
            oldest = sorted(self.cache, key=lambda k: self.cache[k].get("at", 0))[:-200]
            for stale in oldest:
                self.cache.pop(stale, None)
        self._save()
        return hints

    @staticmethod
    def _parse(body: str, host: str) -> list[Hint]:
        """Extract result titles/URLs from a search page conservatively."""
        hints: list[Hint] = []
        for match in re.finditer(r'<a[^>]+href="(/wiki/[^"#?]{1,120})"[^>]*>(.*?)</a>', body, re.S):
            title = strip_html(match.group(2))
            if not title or title.lower().startswith("help:"):
                continue
            url = f"https://{host}{match.group(1)}"
            hints.append(Hint(title[:120], url, f"See '{title[:80]}' on {host}"))
            if len(hints) >= MAX_HINTS:
                break
        if not hints:
            text = strip_html(body)
            if text:
                hints.append(Hint("search results", f"https://{host}/", text[:MAX_SNIPPET]))
        return hints

    def hint_lines(self, question: str, host: str = "en.wikipedia.org") -> list[str]:
        return [h.prompt_line() for h in self.ask(question, host)]


def question_for_objective(objective: str, *, game: str = "") -> str:
    """Deterministic, sanitised question for a trusted objective string.

    Truncation happens before validation so a long objective degrades into a
    shorter legal question instead of failing the whole lookup.
    """
    goal = clean_question(objective.strip()[:60])
    name = clean_question(game.strip()[:24]) if game.strip() else ""
    return _SPACE.sub(" ", f"{name} controls {goal}").strip()[:80]
