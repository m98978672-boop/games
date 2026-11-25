"""Timezone-aware minimum cadence: two daily Shorts and one long video every day."""
from __future__ import annotations

import argparse
from datetime import datetime, time, timedelta, timezone
from typing import Iterable
from zoneinfo import ZoneInfo

CHANNEL_TZ = ZoneInfo("Europe/Moscow")
SHORT_POST_TIMES = (time(8, 0), time(12, 0))
LONG_POST_TIME = time(6, 0)
MIN_LEAD = timedelta(minutes=45)
# A review is rendered before its publication time is fixed, and a run takes
# from five minutes to over an hour. A slot chosen with less than this headroom
# may pass by during rendering, so automatic plans keep this far ahead instead.
SCHEDULE_LEAD = timedelta(hours=2)


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


def served_slot(event_schedule: str, *, now: datetime | None = None) -> datetime:
    """The publication slot a scheduled run is meant to serve.

    GitHub reports only the cron literal, not which of its firing times ran, and
    a delayed run must still serve the slot it was started for. So: find the most
    recent firing time of that cron in Moscow, then take the first regular slot
    strictly after it. That reproduces the documented intent - 01:00 serves the
    06:00 long review, 04:00 serves the 08:00 Short, 08:00 serves the 12:00 Short.
    """
    current = now or datetime.now(timezone.utc)
    if current.tzinfo is None:
        raise ValueError("now must include a timezone")
    if event_schedule == "0 22 * * *":
        firings, times = (time(1, 0),), (LONG_POST_TIME,)
    elif event_schedule == "0 1,5 * * *":
        firings, times = (time(4, 0), time(8, 0)), SHORT_POST_TIMES
    else:
        raise ValueError("Unknown scheduled review event")
    local = current.astimezone(CHANNEL_TZ)
    candidates = [datetime.combine(local.date() + timedelta(days=offset), moment, CHANNEL_TZ)
                  for offset in (-1, 0) for moment in firings]
    fired = max(moment for moment in candidates if moment <= local)
    for offset in range(3):
        day = (fired + timedelta(days=offset)).date()
        for moment in times:
            slot = datetime.combine(day, moment, CHANNEL_TZ)
            if slot > fired:
                return slot.astimezone(timezone.utc)
    raise RuntimeError("could not match a cron firing to a regular slot")


def reserve_slot_before_render(video_format: str, *, now: datetime | None = None,
                               occupied: Iterable[datetime] = ()) -> datetime:
    """Pick the slot a review will target *before* the long rendering starts.

    A slot fixed before rendering cannot be double-booked by two runs that both
    finish at a different moment. SCHEDULE_LEAD keeps the usual short render
    from overrunning the slot. ``occupied`` lets an owner who starts several
    runs at once let each one take a different regular slot instead of all of
    them aiming at the same time and failing after the render.
    """
    if video_format not in {"short", "long"}:
        raise ValueError("video_format must be short or long")
    taken = {moment.astimezone(timezone.utc) for moment in occupied}
    probe = now
    for _ in range(16):
        slot = next_publish_slot(probe, video_format=video_format, min_lead=SCHEDULE_LEAD)
        if slot.astimezone(timezone.utc) not in taken:
            return slot
        # Search again strictly after the slot that is already taken.
        probe = slot
    raise RuntimeError("every regular slot in the next days is already booked")


def settle_slot_after_render(reserved: datetime, video_format: str, *,
                             now: datetime | None = None) -> tuple[datetime, bool]:
    """Keep the reserved slot, or move it once if rendering consumed its lead.

    The delayed slot stays at a regular wall time (08:00/12:00 for Shorts,
    06:00 for a long review) so a slow run never publishes at an arbitrary hour
    and never silently skips the day. A manual publish_at is not handled here:
    its own explicit rule is resolve_manual_after_render().
    """
    if video_format not in {"short", "long"}:
        raise ValueError("video_format must be short or long")
    current = now or datetime.now(timezone.utc)
    if reserved.tzinfo is None or current.tzinfo is None:
        raise ValueError("reserved and now must include a timezone")
    current = current.astimezone(timezone.utc)
    reserved = reserved.astimezone(timezone.utc)
    if reserved >= current + MIN_LEAD:
        return reserved, False
    # Search strictly after the reserved slot, so a late run moves to the next
    # regular slot of the same format instead of reusing the one it missed.
    return next_publish_slot(reserved, video_format=video_format), True


def long_video_is_due(now: datetime | None = None) -> bool:
    current = now or datetime.now(timezone.utc)
    if current.tzinfo is None:
        raise ValueError("now must include a timezone")
    return True


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
        if video_format == "short":
            times = SHORT_POST_TIMES
        else:
            times = (LONG_POST_TIME,)
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
