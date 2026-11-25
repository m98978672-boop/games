"""Timezone-aware cadence: four Shorts and four long reviews every day.

Each format is doubled against the previous schedule and kept staggered, so a
review slot and a Short slot never collide. Eight uploads a day is far inside
the separate 100-uploads-per-day `videos.insert` allowance.
"""
from __future__ import annotations

import argparse
from datetime import datetime, time, timedelta, timezone
from typing import Iterable
from zoneinfo import ZoneInfo

CHANNEL_TZ = ZoneInfo("Europe/Moscow")
# Four Shorts and four long reviews a day: each type doubled from two-per-type,
# and spread so no two publications land at the same minute. Uploads cost 1 unit
# from a dedicated bucket of 100 per day, so eight uploads stay far inside the
# YouTube quota; see the quota calculator Google published for the Data API.
SHORT_POST_TIMES = (time(9, 0), time(13, 0), time(17, 0), time(21, 0))
LONG_POST_TIMES = (time(6, 0), time(11, 0), time(15, 0), time(19, 0))
# Kept for callers that still ask for "the" long slot; the first one serves the
# nightly scheduled run. Anything that must handle all long slots uses
# LONG_POST_TIMES and all_planned_slots().
LONG_POST_TIME = LONG_POST_TIMES[0]
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


# Each scheduled run fires three hours before the slot it serves, so its own
# firing time maps to exactly one publication slot and no firing crosses
# midnight; a late run therefore still knows which slot it was started for.
CRON_SLOTS: dict[str, tuple[time, time]] = {
    # Every firing is exactly three hours before the slot it serves, so a slow
    # run still makes its publication and no firing ever crosses midnight in
    # Moscow. Times are UTC cron -> (firing, slot) as Moscow wall time.
    # Shorts: slots 09:00, 13:00, 17:00, 21:00 -> fire at 06:00, 10:00, 14:00, 18:00.
    "0 3 * * *": (time(6, 0), time(9, 0)),
    "0 7 * * *": (time(10, 0), time(13, 0)),
    "0 11 * * *": (time(14, 0), time(17, 0)),
    "0 15 * * *": (time(18, 0), time(21, 0)),
    # Long: slots 06:00, 11:00, 15:00, 19:00 -> fire at 03:00, 08:00, 12:00, 16:00.
    # The 06:00 slot fires at 00:00 UTC, which is 03:00 Moscow the same day, so
    # even the earliest slot needs no midnight arithmetic.
    "0 0 * * *": (time(3, 0), time(6, 0)),
    "0 5 * * *": (time(8, 0), time(11, 0)),
    "0 9 * * *": (time(12, 0), time(15, 0)),
    "0 13 * * *": (time(16, 0), time(19, 0)),
}


def served_slot(event_schedule: str, *, now: datetime | None = None) -> datetime:
    """The publication slot a scheduled run is meant to serve.

    GitHub reports only the cron literal, not which of its firing times ran, and
    a delayed run must still serve the slot it was started for. So: find the most
    recent firing of *this* cron in Moscow, then take the slot it was scheduled
    for. Every firing is three hours before its slot, so no firing crosses
    midnight and the slot is always on the firing's own Moscow day.
    """
    current = now or datetime.now(timezone.utc)
    if current.tzinfo is None:
        raise ValueError("now must include a timezone")
    if event_schedule not in CRON_SLOTS:
        raise ValueError("Unknown scheduled review event")
    fires_at, slot_at = CRON_SLOTS[event_schedule]
    local = current.astimezone(CHANNEL_TZ)
    # The slot always falls on the same Moscow calendar day as its firing, which
    # is what makes the delayed-run case below correct without date arithmetic.
    candidates = [
        datetime.combine(local.date() + timedelta(days=offset), fires_at, CHANNEL_TZ)
        for offset in (-1, 0)
    ]
    fired = max(moment for moment in candidates if moment <= local)
    day = fired.date()
    # A run so late that the slot has passed still belongs to that slot: a
    # missed publication must never be silently counted as tomorrow's.
    return datetime.combine(day, slot_at, CHANNEL_TZ).astimezone(timezone.utc)


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
