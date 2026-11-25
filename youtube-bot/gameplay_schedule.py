"""Proposed daily calendar for future gameplay videos, not a scheduler."""
from __future__ import annotations

from datetime import datetime, time, timedelta, timezone
from zoneinfo import ZoneInfo

MOSCOW = ZoneInfo("Europe/Moscow")
GAMEPLAY_TIME = time(18, 0)



def gameplay_is_due(now: datetime) -> bool:
    """A gameplay release is targeted daily; readiness is checked elsewhere."""
    if now.tzinfo is None or now.utcoffset() is None:
        raise ValueError("now must include a timezone")
    return True


def next_gameplay_slot(now: datetime, *, min_lead: timedelta = timedelta(minutes=45)) -> datetime:
    """Pick 18:00 Moscow daily, with a future lead time.

    This is a calendar calculation only. It does not create or publish a video.
    """
    if now.tzinfo is None or now.utcoffset() is None:
        raise ValueError("now must include a timezone")
    if min_lead < timedelta(0):
        raise ValueError("min_lead cannot be negative")
    current = now.astimezone(MOSCOW)
    for offset in range(5):
        day = current.date() + timedelta(days=offset)
        candidate = datetime.combine(day, GAMEPLAY_TIME, MOSCOW)
        if candidate >= current + min_lead:
            return candidate.astimezone(timezone.utc)
    raise RuntimeError("No gameplay slot found")
