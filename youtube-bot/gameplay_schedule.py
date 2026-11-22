"""Proposed two-day calendar for a future gameplay workflow, not a scheduler."""
from __future__ import annotations

from datetime import date, datetime, time, timedelta, timezone
from zoneinfo import ZoneInfo

MOSCOW = ZoneInfo("Europe/Moscow")
ANCHOR = date(2026, 11, 24)
GAMEPLAY_TIME = time(18, 0)



def gameplay_is_due(now: datetime) -> bool:
    """True on the anchored Moscow calendar date, independent of month length."""
    if now.tzinfo is None or now.utcoffset() is None:
        raise ValueError("now must include a timezone")
    return (now.astimezone(MOSCOW).date() - ANCHOR).days % 2 == 0


def next_gameplay_slot(now: datetime, *, min_lead: timedelta = timedelta(minutes=45)) -> datetime:
    """Pick 18:00 Moscow on every second local date, with a future lead time.

    This is a calendar calculation only. It does not create or publish a video.
    """
    if now.tzinfo is None or now.utcoffset() is None:
        raise ValueError("now must include a timezone")
    if min_lead < timedelta(0):
        raise ValueError("min_lead cannot be negative")
    current = now.astimezone(MOSCOW)
    for offset in range(5):
        day = current.date() + timedelta(days=offset)
        if (day - ANCHOR).days % 2:
            continue
        candidate = datetime.combine(day, GAMEPLAY_TIME, MOSCOW)
        if candidate >= current + min_lead:
            return candidate.astimezone(timezone.utc)
    raise RuntimeError("No gameplay slot found")
