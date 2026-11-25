"""Decide whether a gameplay playthrough continues, and where its video goes.

The owner's rules, in one place:

- A gameplay video is one category of its own: at most one a day.
- It keeps coming every day until the playthrough is finished.
- A cut shorter than three minutes is a Short; anything longer is a full video.
- The playthrough counts as finished when the AI has searched for new story
  missions and found none. If viewers say in the comments that something is
  left, the playthrough reopens and continues.

This module is pure decisions: no capture, no upload, no network. The recorder
supplies an observation, the publisher supplies what already exists, and the
answer says what to do next. That keeps the rules testable without a browser.
"""
from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime, timedelta, timezone
from typing import Iterable, Literal

from schedule_policy import CHANNEL_TZ, GAMEPLAY_POST_TIME, GAMEPLAY_SHORT_MAX_SECONDS

# What the recorder reports after a session.
#   playing     the game is still open and had new content
#   exhausted   every reachable mission was visited and nothing new appeared
#   viewer_hint a viewer named content the AI has not reached yet
Outcome = Literal["playing", "exhausted", "viewer_hint"]

# The owner's threshold, named for readability at call sites.
SHORT_MAX_SECONDS = GAMEPLAY_SHORT_MAX_SECONDS


def video_kind_for_duration(duration_seconds: float) -> str:
    """`short` below three minutes, `long` at three minutes or more."""
    if isinstance(duration_seconds, bool) or not isinstance(duration_seconds, (int, float)):
        raise ValueError("duration_seconds must be a number")
    if duration_seconds <= 0:
        raise ValueError("duration_seconds must be greater than zero")
    return "short" if duration_seconds < SHORT_MAX_SECONDS else "long"


@dataclass(frozen=True)
class PlaythroughState:
    """What we know about one game being played."""

    game_id: str
    finished: bool = False
    # A viewer named something the AI has not reached, so "finished" is void.
    reopened: bool = False
    last_published: datetime | None = None

    @property
    def is_open(self) -> bool:
        return not self.finished or self.reopened


@dataclass(frozen=True)
class GameplayDecision:
    """What to do about gameplay today, and why."""

    publish: bool
    reason: str
    # Scheduled Moscow time when publish is True, otherwise None.
    publish_at: datetime | None = None
    # `short`, `long`, or None when nothing is published today.
    video_kind: str | None = None


def assess_outcome(state: PlaythroughState, outcome: Outcome) -> PlaythroughState:
    """Fold one recorded session's outcome into the playthrough state.

    `exhausted` is the AI's own answer to "are there new story missions?"; it
    closes the playthrough. A viewer hint reopens it even after that, because
    the owner explicitly allowed viewers to know about missed content.
    """
    if outcome not in ("playing", "exhausted", "viewer_hint"):
        raise ValueError("unknown gameplay outcome")
    if outcome == "exhausted":
        return PlaythroughState(state.game_id, finished=True, reopened=False,
                                last_published=state.last_published)
    if outcome == "viewer_hint":
        return PlaythroughState(state.game_id, finished=state.finished, reopened=True,
                                last_published=state.last_published)
    return PlaythroughState(state.game_id, finished=False, reopened=False,
                            last_published=state.last_published)


def next_gameplay_slot(now: datetime) -> datetime:
    """The next 18:00 Moscow that is still ahead, as a UTC instant."""
    if now.tzinfo is None or now.utcoffset() is None:
        raise ValueError("now must include a timezone")
    local = now.astimezone(CHANNEL_TZ)
    candidate = local.replace(hour=GAMEPLAY_POST_TIME.hour, minute=0, second=0, microsecond=0)
    if candidate <= local:
        candidate += timedelta(days=1)
    return candidate.astimezone(timezone.utc)


def plan_gameplay_day(state: PlaythroughState, *, now: datetime | None = None,
                      recorded_seconds: float | None = None,
                      already_published_today: bool = False) -> GameplayDecision:
    """Decide today's gameplay publication.

    One a day is a ceiling, not a quota: a finished playthrough publishes
    nothing, and a second video on the same Moscow day waits for tomorrow.
    """
    current = now or datetime.now(timezone.utc)
    if current.tzinfo is None:
        raise ValueError("now must include a timezone")
    if not state.is_open:
        return GameplayDecision(False, "прохождение завершено, новых сюжетных миссий нет")
    if already_published_today:
        return GameplayDecision(False, "на сегодня игровое видео уже вышло")
    if recorded_seconds is None:
        return GameplayDecision(False, "сегодня ещё нечего публиковать: свежей записи нет")
    kind = video_kind_for_duration(recorded_seconds)
    slot = next_gameplay_slot(current)
    word = "Shorts" if kind == "short" else "полное видео"
    return GameplayDecision(True, f"прохождение продолжается, запись → {word}", slot, kind)


def finished_after_search(missions_found: int, *, had_new: bool) -> Outcome:
    """Translate a mission search into an outcome.

    The AI looks for story missions it has not visited. Finding none is the
    owner's definition of "the game is finished"; finding any means keep going.
    """
    if isinstance(missions_found, bool) or not isinstance(missions_found, int):
        raise ValueError("missions_found must be an integer")
    if missions_found < 0:
        raise ValueError("missions_found must not be negative")
    if missions_found == 0 and not had_new:
        return "exhausted"
    return "playing"


def published_today(state: PlaythroughState, now: datetime) -> bool:
    """Whether this playthrough already published on the same Moscow day."""
    if state.last_published is None:
        return False
    return state.last_published.astimezone(CHANNEL_TZ).date() == now.astimezone(CHANNEL_TZ).date()


def states_from_rows(rows: Iterable[dict]) -> dict[str, PlaythroughState]:
    """Rebuild states from stored rows, newest first.

    Rows are how the queue remembers a playthrough across runs, so a restart
    never silently treats a finished game as open again.
    """
    states: dict[str, PlaythroughState] = {}
    for row in rows:
        game_id = str(row.get("game_id") or "")
        if not game_id or game_id in states:
            continue
        finished = bool(row.get("finished"))
        reopened = bool(row.get("reopened"))
        states[game_id] = PlaythroughState(game_id, finished, reopened)
    return states


def posted_today_from_rows(rows: Iterable[dict], game_id: str, now: datetime) -> bool:
    """Whether this playthrough already published on `now`'s Moscow day.

    One a day is a ceiling. Rows carry `publish_at`; a row for another game does
    not count, because each playthrough has its own daily video.
    """
    today = now.astimezone(CHANNEL_TZ).date()
    for row in rows:
        if str(row.get("game_id") or "") != game_id:
            continue
        raw = row.get("publish_at")
        if not isinstance(raw, str) or not raw:
            continue
        try:
            moment = datetime.fromisoformat(raw.replace("Z", "+00:00"))
        except ValueError:
            continue
        if moment.tzinfo is None:
            continue
        if moment.astimezone(CHANNEL_TZ).date() == today:
            return True
    return False
