"""Read-only external Steam Store sources for source-grounded game reviews.

No Steam key or third-party inference API is used. The local Qwen model still
writes the review; every factual input comes from Steam's public store/reviews
JSON and is linked in the resulting YouTube description.
"""
from __future__ import annotations

import hashlib
import html
import json
import re
import urllib.error
import urllib.parse
import urllib.request
from html.parser import HTMLParser
from pathlib import Path
from typing import Any

STEAM_HOST = "store.steampowered.com"
FEATURED_URL = f"https://{STEAM_HOST}/api/featuredcategories/"
APPDETAILS_URL = f"https://{STEAM_HOST}/api/appdetails/"
APPREVIEWS_URL = f"https://{STEAM_HOST}/appreviews/"
MAX_CANDIDATES = 8
MAX_SCREENSHOT_BYTES = 8 * 1024 * 1024


class SteamSourceError(RuntimeError):
    """Steam data was unavailable or failed validation; no local-game fallback."""


class _TextExtractor(HTMLParser):
    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.parts: list[str] = []

    def handle_data(self, data: str) -> None:
        if data.strip():
            self.parts.append(data.strip())


def _plain_text(value: Any, limit: int = 1200) -> str:
    parser = _TextExtractor()
    parser.feed(html.unescape(str(value or "")))
    return re.sub(r"\s+", " ", " ".join(parser.parts)).strip()[:limit]


def _safe_get_json(url: str, *, timeout: int = 20) -> Any:
    parsed = urllib.parse.urlsplit(url)
    if parsed.scheme != "https" or parsed.hostname != STEAM_HOST or parsed.username or parsed.password:
        raise SteamSourceError("Steam source URL failed its HTTPS host allowlist.")
    request = urllib.request.Request(url, headers={"Accept": "application/json", "User-Agent": "GamesReviewBot/1.0"})
    try:
        with urllib.request.urlopen(request, timeout=timeout) as response:
            if response.status != 200:
                raise SteamSourceError(f"Steam returned HTTP {response.status}.")
            return json.loads(response.read().decode("utf-8"))
    except (urllib.error.URLError, TimeoutError, OSError, UnicodeDecodeError, json.JSONDecodeError) as exc:
        raise SteamSourceError("Steam public data could not be retrieved.") from exc


def _cyrillic_ratio(text: str) -> float:
    letters = [char for char in text if char.isalpha()]
    if not letters:
        return 0.0
    return sum("\u0400" <= char <= "\u04ff" for char in letters) / len(letters)


def _localized_featured_games(payload: Any) -> list[dict[str, Any]]:
    if not isinstance(payload, dict):
        return []
    items: list[dict[str, Any]] = []
    for shelf in ("top_sellers", "new_releases", "coming_soon", "specials"):
        section = payload.get(shelf)
        section_items = section.get("items", []) if isinstance(section, dict) else []
        if isinstance(section_items, list):
            for item in section_items:
                if isinstance(item, dict) and str(item.get("id", "")).isdigit() and item.get("name"):
                    items.append(item)
    deduped: dict[str, dict[str, Any]] = {}
    for item in items:
        deduped.setdefault(str(item["id"]), item)
    return list(deduped.values())


def _game_from_app(app_id: str, listing: dict[str, Any]) -> dict[str, Any] | None:
    params = urllib.parse.urlencode({"appids": app_id, "cc": "nl", "l": "russian"})
    detail_response = _safe_get_json(f"{APPDETAILS_URL}?{params}")
    item = detail_response.get(app_id) if isinstance(detail_response, dict) else None
    if not isinstance(item, dict) or not item.get("success") or not isinstance(item.get("data"), dict):
        return None
    data = item["data"]
    if data.get("type") != "game":
        return None
    title = _plain_text(data.get("name") or listing.get("name"), 140)
    summary = _plain_text(data.get("short_description"), 900)
    if not title or len(summary) < 40 or _cyrillic_ratio(summary) < 0.35:
        return None

    genres = [
        _plain_text(genre.get("description"), 50)
        for genre in (data.get("genres") or [])
        if isinstance(genre, dict) and genre.get("description")
    ][:6]
    raw_platforms = data.get("platforms") if isinstance(data.get("platforms"), dict) else {}
    platforms = [name for name in ("windows", "mac", "linux") if raw_platforms.get(name)]
    platform_names = {"windows": "Windows", "mac": "macOS", "linux": "Linux"}
    developer_names = [_plain_text(name, 80) for name in data.get("developers", []) if name]
    release_data = data.get("release_date") if isinstance(data.get("release_date"), dict) else {}
    release = _plain_text(release_data.get("date"), 80)

    features = [f"Описание Steam: {summary}"]
    if genres:
        features.append("Жанры, указанные в Steam: " + ", ".join(genres))
    if platforms:
        features.append("Платформы из карточки Steam: " + ", ".join(platform_names[p] for p in platforms))
    if release:
        features.append(f"Дата релиза из Steam: {release}")
    if developer_names:
        features.append("Разработчик в карточке Steam: " + ", ".join(developer_names[:3]))

    reviews_url = f"https://{STEAM_HOST}/appreviews/{app_id}/?json=1&filter=all&language=all&num_per_page=0"
    review_data = _safe_get_json(reviews_url)
    query_summary = review_data.get("query_summary", {}) if isinstance(review_data, dict) else {}
    total = int(query_summary.get("total_reviews", 0) or 0)
    positive = int(query_summary.get("total_positive", 0) or 0)
    negative = int(query_summary.get("total_negative", 0) or 0)
    if total > 0 and positive + negative > 0:
        pct = round(100 * positive / (positive + negative))
        score_desc = _plain_text(query_summary.get("review_score_desc"), 80).lower()
        rating_names = {
            "overwhelmingly positive": "крайне положительные",
            "very positive": "очень положительные",
            "mostly positive": "в основном положительные",
            "mixed": "смешанные",
            "mostly negative": "в основном отрицательные",
            "very negative": "очень отрицательные",
            "overwhelmingly negative": "крайне отрицательные",
        }
        score_desc = rating_names.get(score_desc, "оценка по сводке Steam")
        features.append(f"Отзывы Steam: {score_desc}; положительные {pct}% из {total} отзывов")

    store_url = f"https://{STEAM_HOST}/app/{app_id}/"
    screenshot_urls = [
        str(screenshot.get("path_full"))
        for screenshot in (data.get("screenshots") or [])[:6]
        if isinstance(screenshot, dict) and str(screenshot.get("path_full", "")).startswith("https://")
    ]
    return {
        "id": app_id,
        "title": title,
        "subtitle": summary[:300],
        "description": summary,
        "version": release,
        "features": features[:12],
        "source": "Steam Store API (ru-RU)",
        "public_url": store_url,
        "review_url": reviews_url,
        "sources": [
            {"name": "Страница игры в Steam", "url": store_url},
            {"name": "Сводка отзывов Steam", "url": reviews_url},
        ],
        "screenshots": screenshot_urls,
        "source_facts": {
            "genres": genres,
            "platforms": [platform_names[p] for p in platforms],
            "release_date": release,
            "developers": developer_names[:3],
            "steam_review_total": total,
            "steam_review_positive": positive,
            "steam_review_negative": negative,
        },
    }


def load_steam_games(*, recent_game_ids: tuple[str, ...] | list[str] = (), limit: int = MAX_CANDIDATES,
                     featured_payload: Any | None = None) -> list[dict[str, Any]]:
    """Return Russian-localized, source-linked real games from Steam shelves."""
    payload = featured_payload
    if payload is None:
        params = urllib.parse.urlencode({"cc": "nl", "l": "russian"})
        payload = _safe_get_json(f"{FEATURED_URL}?{params}")
    listings = _localized_featured_games(payload)
    if not listings:
        raise SteamSourceError("Steam returned no games in its public feature shelves.")
    recent = set(map(str, recent_game_ids))
    fresh = [item for item in listings if str(item["id"]) not in recent] or listings
    seed = __import__("datetime").datetime.now().strftime("%Y-%m-%d")
    start = int(hashlib.sha256(seed.encode()).hexdigest()[:8], 16) % len(fresh)
    ordered = fresh[start:] + fresh[:start]
    games: list[dict[str, Any]] = []
    for listing in ordered:
        try:
            game = _game_from_app(str(listing["id"]), listing)
        except SteamSourceError:
            continue
        if game:
            games.append(game)
        if len(games) >= max(1, min(int(limit), MAX_CANDIDATES)):
            break
    if not games:
        raise SteamSourceError("Steam shelves had no games with verified Russian-language descriptions and review data.")
    return games


def download_screenshots(urls: list[str], destination: Path, *, limit: int = 6) -> list[str]:
    """Fetch only public Steam image assets; gracefully skip unavailable artwork."""
    destination.mkdir(parents=True, exist_ok=True)
    paths: list[str] = []
    for index, url in enumerate(urls[:limit]):
        parsed = urllib.parse.urlsplit(url)
        host = (parsed.hostname or "").lower().rstrip(".")
        if parsed.scheme != "https" or not (host == "steamstatic.com" or host.endswith(".steamstatic.com")):
            continue
        request = urllib.request.Request(url, headers={"User-Agent": "GamesReviewBot/1.0"})
        try:
            with urllib.request.urlopen(request, timeout=15) as response:
                content_type = response.headers.get("Content-Type", "").split(";", 1)[0].lower()
                data = response.read(MAX_SCREENSHOT_BYTES + 1)
            if content_type not in {"image/jpeg", "image/png", "image/webp"} or len(data) > MAX_SCREENSHOT_BYTES:
                continue
            suffix = {"image/jpeg": ".jpg", "image/png": ".png", "image/webp": ".webp"}[content_type]
            path = destination / f"steam-shot-{index:02d}{suffix}"
            path.write_bytes(data)
            paths.append(str(path))
        except (urllib.error.URLError, TimeoutError, OSError):
            continue
    return paths
