"""Timezone-aware minimum cadence: two daily Shorts and one long video every 48h."""
from __future__ import annotations

import argparse
from datetime import date, datetime, time, timedelta, timezone
from zoneinfo import ZoneInfo

CHANNEL_TZ = ZoneInfo("Europe/Moscow")
SHORT_POST_TIMES = (time(8, 0), time(12, 0))
LONG_POST_TIME = time(6, 0)
# Fixed parity anchor keeps the 48-hour cadence stable across month/year boundaries.
LONG_VIDEO_ANCHOR = date(2026, 11, 24)
MIN_LEAD = timedelta(minutes=45)


def long_video_is_due(now: datetime | None = None) -> bool:
    current = now or datetime.now(timezone.utc)
    if current.tzinfo is None:
        raise ValueError("now must include a timezone")
    local_day = current.astimezone(CHANNEL_TZ).date()
    return (local_day - LONG_VIDEO_ANCHOR).days % 2 == 0


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
            if (candidate_date - LONG_VIDEO_ANCHOR).days % 2:
                continue
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
    args = parser.parse_args()
    now = datetime.fromisoformat(args.now.replace("Z", "+00:00")) if args.now else None
    if args.check_long_due:
        print("true" if long_video_is_due(now) else "false")
    else:
        print(next_publish_slot(now, video_format=args.format).isoformat().replace("+00:00", "Z"))


if __name__ == "__main__":
    main()
