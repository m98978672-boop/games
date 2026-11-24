"""Bounded, inspectable skill memory: the autopilot "learns" without training.

Two things are stored and both are plain data on local disk so an operator can
read, diff and delete them:

* **screen -> intent** table: the intent that previously produced a visible
  change on a screen with this coarse signature. A hit skips the slow model,
  which is what makes repeated situations cheap;
* **outcome log**: ``(signature, intent, changed)`` triples used to rank intents
  per screen and to report how often the reflex layer guessed right.

No gradients, no network, no free text from the game. A miss simply falls back
to the advisor, so a wrong memory entry costs one wasted action at worst.
"""
from __future__ import annotations

import json
import os
import re
import sqlite3
import tempfile
from dataclasses import dataclass
from pathlib import Path

SIGNATURE_PATTERN = r"[0-9a-f]{16}"
signature_pattern = re.compile(SIGNATURE_PATTERN)
MAX_ENTRIES = 5_000
MIN_CONFIDENCE = 0.6


@dataclass(frozen=True)
class Skill:
    signature: str
    intent: str
    hits: int
    misses: int

    @property
    def confidence(self) -> float:
        total = self.hits + self.misses
        return self.hits / total if total else 0.0


class SkillMemory:
    """SQLite-backed memory; one row per (signature, intent) pair."""

    def __init__(self, path: Path | str | None = None, *, max_entries: int = MAX_ENTRIES,
                 min_confidence: float = MIN_CONFIDENCE):
        self.path = Path(path) if path is not None else None
        self.max_entries = max_entries
        self.min_confidence = min_confidence
        self._rows: dict[tuple[str, str], list[int]] = {}
        # Hot cache of the last lookups: with a disk database every recall() would
        # be a query, and the reflex loop does one per frame. Bounded on purpose.
        self._hot: dict[str, str | None] = {}
        self._hot_limit = 512
        # A connection is cheap to open but 10x dearer than reusing one, and the
        # reflex loop reads and writes once per tick. WAL keeps readers fast.
        self._conn = None
        if self.path is not None:
            self.path.parent.mkdir(parents=True, exist_ok=True, mode=0o700)
            with self._connect() as db:
                db.execute(
                    "CREATE TABLE IF NOT EXISTS skills ("
                    " signature TEXT NOT NULL, intent TEXT NOT NULL,"
                    " hits INTEGER NOT NULL DEFAULT 0, misses INTEGER NOT NULL DEFAULT 0,"
                    " last_seen REAL NOT NULL, PRIMARY KEY (signature, intent))")
                # recall() runs once per frame, so the lookup must be indexed.
                db.execute(
                    "CREATE INDEX IF NOT EXISTS skills_signature ON skills (signature)")

    def _connect(self):
        assert self.path is not None
        if self._conn is None:
            self._conn = sqlite3.connect(self.path, timeout=30, isolation_level=None)
            self._conn.execute("PRAGMA journal_mode=WAL")
            self._conn.execute("PRAGMA synchronous=NORMAL")
        return self._conn

    def close(self) -> None:
        if self._conn is not None:
            self._conn.close()
            self._conn = None

    # -- writes -----------------------------------------------------------
    def record(self, signature: str, intent: str, changed: bool) -> None:
        intent = (intent or "").strip().upper()
        if not signature_pattern.fullmatch(signature or ""):
            raise ValueError("invalid screen signature")
        if not isinstance(intent, str) or not intent or len(intent) > 32 or not intent.isalnum():
            raise ValueError("invalid intent")
        if type(changed) is not bool:
            raise ValueError("changed must be boolean")
        self._hot.pop(signature, None)
        if self.path is None:
            hits, misses = self._rows.setdefault((signature, intent), [0, 0])
            if changed:
                hits += 1
            else:
                misses += 1
            self._rows[(signature, intent)] = [hits, misses]
            self._trim()
            return
        with self._connect() as db:
            column = "hits" if changed else "misses"
            db.execute(
                "INSERT INTO skills (signature, intent, hits, misses, last_seen) VALUES (?,?,?,?, strftime('%s','now'))"
                f" ON CONFLICT(signature, intent) DO UPDATE SET {column} = {column} + 1,"
                " last_seen = strftime('%s','now')",
                (signature, intent, 1 if changed else 0, 0 if changed else 1))
            count = db.execute("SELECT COUNT(*) FROM skills").fetchone()[0]
            if count > self.max_entries:
                db.execute("DELETE FROM skills WHERE rowid IN ("
                           " SELECT rowid FROM skills ORDER BY last_seen ASC, hits ASC LIMIT ?)",
                           (count - self.max_entries,))

    # -- reads ------------------------------------------------------------
    def _trim(self) -> None:
        """Keep the in-memory table bounded the same way SQLite is."""
        while len(self._rows) > self.max_entries:
            weakest = min(self._rows, key=lambda k: (self._rows[k][0], sum(self._rows[k])))
            del self._rows[weakest]

    def best(self, signature: str, *, min_confidence: float | None = None) -> Skill | None:
        """Highest-confidence intent for a screen (single indexed query)."""
        if self.path is None:
            candidates = [Skill(signature, intent, h, m) for (sig, intent), (h, m) in self._rows.items()
                          if sig == signature]
        else:
            with self._connect() as db:
                candidates = [Skill(signature, intent, h, m) for intent, h, m in db.execute(
                    "SELECT intent, hits, misses FROM skills WHERE signature = ?", (signature,))]
        floor = self.min_confidence if min_confidence is None else min_confidence
        ranked = [s for s in candidates if s.confidence >= floor]
        if not ranked:
            return None
        return max(ranked, key=lambda s: (s.confidence, s.hits))

    def recall(self, signature: str) -> str | None:
        if signature in self._hot:
            return self._hot[signature]
        best = self.best(signature)
        intent = best.intent if best is not None else None
        if len(self._hot) >= self._hot_limit:
            self._hot.pop(next(iter(self._hot)))
        self._hot[signature] = intent
        return intent

    # -- file transfer ---------------------------------------------------
    def load_json(self, source: Path | str) -> int:
        """Merge a JSON snapshot produced by ``export``; returns rows merged."""
        try:
            payload = json.loads(Path(source).read_text(encoding="utf-8"))
        except (OSError, ValueError):
            return 0
        if not isinstance(payload, dict) or payload.get("version") != 1:
            return 0
        merged = 0
        for row in payload.get("skills") or []:
            if not isinstance(row, dict):
                continue
            signature, intent = row.get("signature"), row.get("intent")
            hits, misses = row.get("hits"), row.get("misses")
            if (not isinstance(signature, str) or not isinstance(intent, str)
                    or type(hits) is not int or type(misses) is not int
                    or hits < 0 or misses < 0 or hits + misses == 0):
                continue
            try:
                for _ in range(min(hits, 100)):
                    self.record(signature, intent, True)
                for _ in range(min(misses, 100)):
                    self.record(signature, intent, False)
            except ValueError:
                continue
            merged += 1
        return merged

    def forget(self, signature: str | None = None) -> int:
        """Delete one screen's entry (or everything); returns rows removed."""
        if signature is not None and not signature_pattern.fullmatch(signature or ""):
            raise ValueError("invalid screen signature")
        self._hot.clear()
        if self.path is None:
            victims = [k for k in self._rows if signature is None or k[0] == signature]
            for key in victims:
                del self._rows[key]
            return len(victims)
        with self._connect() as db:
            if signature is None:
                removed = db.execute("DELETE FROM skills").rowcount
            else:
                removed = db.execute("DELETE FROM skills WHERE signature = ?", (signature,)).rowcount
        return max(0, removed)

    def dump(self) -> list[dict]:
        if self.path is None:
            return [{"signature": s, "intent": i, "hits": h, "misses": m}
                    for (s, i), (h, m) in sorted(self._rows.items())]
        with self._connect() as db:
            return [{"signature": s, "intent": i, "hits": h, "misses": m}
                    for s, i, h, m in db.execute(
                        "SELECT signature, intent, hits, misses FROM skills"
                        " ORDER BY hits DESC, signature ASC LIMIT ?", (self.max_entries,))]

    def export(self, destination: Path) -> Path:
        """Atomically write a JSON snapshot (operator-readable backup)."""
        destination = Path(destination)
        destination.parent.mkdir(parents=True, exist_ok=True)
        payload = json.dumps({"version": 1, "skills": self.dump()}, ensure_ascii=False, indent=1)
        fd, tmp = tempfile.mkstemp(dir=str(destination.parent), prefix=".skills-")
        try:
            with os.fdopen(fd, "w", encoding="utf-8") as file:
                file.write(payload)
            os.replace(tmp, destination)
        except BaseException:
            Path(tmp).unlink(missing_ok=True)
            raise
        return destination
