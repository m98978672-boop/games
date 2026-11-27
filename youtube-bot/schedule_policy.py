"""Moscow cadence: two Shorts, one long review, and one gameplay slot per day.

The gameplay slot does not imply that a recording satisfies release rules.
Regular slots are not an atomic cross-run daily publication limit.
"""
from __future__ import annotations

import argparse
from datetime import datetime, time, timedelta, timezone
from zoneinfo import ZoneInfo

CHANNEL_TZ = ZoneInfo("Europe/Moscow")
# The owner requested two Shorts per day and two long reviews per two days.
SHORT_POST_TIMES = (time(9, 0), time(13, 0))
LONG_POST_TIMES = (time(6, 0),)
# Gameplay sits at 18:00 so it never shares a minute with a review or a Short.
GAMEPLAY_POST_TIME = time(18, 0)
# A playthrough cut up to this many seconds is a Short; longer is a full video.
# This mirrors adventure_personality.SHORT_SECONDS, which the renderer already
# uses, so the render and the upload stamp cannot disagree at exactly 180s.
GAMEPLAY_SHORT_MAX_SECONDS = 180
# Kept for callers that still ask for "the" long slot; the first one serves the
# nightly scheduled run. Anything that must handle all long slots uses
# LONG_POST_TIMES and all_planned_slots().
LONG_POST_TIME = LONG_POST_TIMES[0]
MIN_LEAD = timedelta(minutes=45)


def manual_publish_time(value: str, *, now: datetime | None = None) -> datetime:
    """Parse a one-off Moscow wall time, returning UTC without changing cadence."""
    import re
    if not re.fullmatch(r"\d{4}-\d{2}-\d{2} \d{2}:\d{2}", value):
        raise ValueError("Use Moscow time in the format YYYY-MM-DD HH:MM.")
    try:
        local = datetime.strptime(value, "%Y-%m-%d %H:%M").replace(tzinfo=CHANNEL_TZ)
    except ValueError as exc:
        raise ValueError("Invalid Moscow date or time; use YYYY-MM-DD HH:MM.") from exc
    current = now or datetime.now(timezone.utc)
    if current.tzinfo is None:
        raise ValueError("now must include a timezone")
    result = local.astimezone(timezone.utc)
    if result < current.astimezone(timezone.utc) + MIN_LEAD:
        raise ValueError("Chosen publication time must be at least 45 minutes in the future; allow extra time for rendering and upload.")
    return result



def resolve_manual_after_render(requested: datetime, *, now: datetime | None = None) -> tuple[datetime, bool]:
    """Keep a valid selection, or choose a transparent safe delay after slow rendering.

    The caller must validate the manual wall time before rendering. Only this
    post-render delay is automatic; it never changes future recurring slots.
    An hour of lead time leaves extra room for the upload reservation.
    """
    current = now or datetime.now(timezone.utc)
    if requested.tzinfo is None or current.tzinfo is None:
        raise ValueError("requested and now must include a timezone")
    current = current.astimezone(timezone.utc)
    requested = requested.astimezone(timezone.utc)
    if requested >= current + MIN_LEAD:
        return requested, False
    earliest = current + timedelta(minutes=60)
    if earliest.second or earliest.microsecond:
        earliest = earliest.replace(second=0, microsecond=0) + timedelta(minutes=1)
    return earliest, True


def long_video_is_due(now: datetime | None = None) -> bool:
    current = now or datetime.now(timezone.utc)
    if current.tzinfo is None:
        raise ValueError("now must include a timezone")
    return True


def slot_format(slot_at: time) -> str:
    """Which category a Moscow publication time belongs to."""
    if slot_at == GAMEPLAY_POST_TIME:
        return "gameplay"
    if slot_at in LONG_POST_TIMES:
        return "long"
    if slot_at in SHORT_POST_TIMES:
        return "short"
    raise ValueError(f"not a regular publication slot: {slot_at}")


def slot_sequence(first: datetime, video_format: str, count: int) -> list[datetime]:
    """`count` publication slots of one format, starting at `first`.

    Derived from SHORT_POST_TIMES / LONG_POST_TIMES rather than from arithmetic,
    so doubling the schedule never silently keeps the old two-a-day step. Times
    are Moscow wall-clock; a slot already equal to `first` is kept, later ones
    move forward to the next regular slot of the same format.
    """
    if video_format not in {"short", "long"}:
        raise ValueError("video_format must be short or long")
    if count < 1:
        raise ValueError("count must be at least 1")
    times = SHORT_POST_TIMES if video_format == "short" else LONG_POST_TIMES
    local = first.astimezone(CHANNEL_TZ)
    slots = [local]
    probe = local
    while len(slots) < count:
        nxt = next_publish_slot(probe, video_format=video_format, min_lead=timedelta(0))
        if nxt.astimezone(CHANNEL_TZ) <= probe.astimezone(CHANNEL_TZ):
            # next_publish_slot is inclusive of an exact slot; step past it.
            probe = probe + timedelta(minutes=1)
            continue
        slots.append(nxt.astimezone(CHANNEL_TZ))
        probe = nxt
    return slots


def next_publish_slot(now: datetime | None = None, *, video_format: str = "short",
                      min_lead: timedelta = MIN_LEAD) -> datetime:
    current = now or datetime.now(timezone.utc)
    if current.tzinfo is None:
        raise ValueError("now must include a timezone")
    if video_format not in {"short", "long"}:
        raise ValueError("video_format must be short or long")
    local_now = current.astimezone(CHANNEL_TZ)
    earliest = local_now + min_lead
    for offset in range(16):
        candidate_date = local_now.date() + timedelta(days=offset)
        times = SHORT_POST_TIMES if video_format == "short" else LONG_POST_TIMES
        for slot_time in times:
            candidate = datetime.combine(candidate_date, slot_time, CHANNEL_TZ)
            if candidate >= earliest:
                return candidate.astimezone(timezone.utc)
    raise RuntimeError("could not find a publishing slot in the next 16 days")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--now", help="Optional ISO-8601 time for testing")
    parser.add_argument("--format", choices=("short", "long"), default="short")
    parser.add_argument("--check-long-due", action="store_true")
    parser.add_argument("--manual-publish-at", help="One-off Moscow time, YYYY-MM-DD HH:MM")
    args = parser.parse_args()
    now = datetime.fromisoformat(args.now.replace("Z", "+00:00")) if args.now else None
    if args.manual_publish_at:
        print(manual_publish_time(args.manual_publish_at, now=now).isoformat().replace("+00:00", "Z"))
    elif args.check_long_due:
        print("true" if long_video_is_due(now) else "false")
    else:
        print(next_publish_slot(now, video_format=args.format).isoformat().replace("+00:00", "Z"))


if __name__ == "__main__":
    main()
