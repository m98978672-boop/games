"""Build a non-publishing release plan for a verified gameplay recording.

This module does not download, play, edit, render, or upload anything. It never
asserts that a repository license clears its assets or recording rights.
"""
from __future__ import annotations

from dataclasses import dataclass
import math
import re
from urllib.parse import urlsplit

MAX_PART_SECONDS = 30 * 60
MAX_SESSION_SECONDS = 2 * MAX_PART_SECONDS
REPO_NAME = re.compile(r"[A-Za-z0-9_.-]+\Z")


@dataclass(frozen=True)
class Part:
    number: int
    start_seconds: float
    end_seconds: float
    title: str
    description: str


def make_plan(*, duration_seconds: float, game: str, author: str, repository_url: str) -> list[Part]:
    """Split into one or two parts; refuse sessions that need three or more.

    Caller must separately verify capture, gameplay, recording rights, author
    identity, captions, speech, and scheduling. User-supplied metadata is data,
    never an instruction to execute code.
    """
    if (isinstance(duration_seconds, bool) or not isinstance(duration_seconds, (int, float))
            or not math.isfinite(duration_seconds) or not 0 < duration_seconds <= MAX_SESSION_SECONDS):
        raise ValueError("Recording duration must be greater than zero and at most 60 minutes")
    if not isinstance(game, str) or not isinstance(author, str):
        raise ValueError("Game and author must be text")
    game = ' '.join(game.split())
    author = ' '.join(author.split())
    if (not game or not author or len(game) > 65 or len(author) > 150
            or any(ord(c) < 32 or ord(c) == 127 for c in game + author)):
        raise ValueError("Invalid game or author")
    if not isinstance(repository_url, str):
        raise ValueError("A GitHub repository URL is required")
    u = urlsplit(repository_url)
    parts = u.path.strip('/').split('/')
    if (u.scheme != 'https' or u.netloc != 'github.com' or len(parts) != 2
            or not all(REPO_NAME.fullmatch(p) and p not in ('.', '..') for p in parts)
            or u.query or u.fragment or repository_url != f'https://github.com/{parts[0]}/{parts[1]}'):
        raise ValueError("Use an exact https://github.com/owner/repository URL")
    total = float(duration_seconds)
    bounds = [(0.0, min(total, float(MAX_PART_SECONDS)))]
    if total > MAX_PART_SECONDS:
        bounds.append((float(MAX_PART_SECONDS), total))
    description = f"Игра: {game}\nАвтор / владелец источника: {author}\nСсылка на игру: {repository_url}"
    result = []
    for i, (start, end) in enumerate(bounds, 1):
        suffix = f" — часть {i}" if len(bounds) > 1 else ''
        title = f"{game}{suffix} — ссылка на игру в описании"
        if len(title) > 100:
            raise ValueError("Game title is too long for the video title")
        result.append(Part(i, start, end, title, description))
    return result
