"""Cold-start posting policy for the Games Shorts channel.

Three weekly slots are an initial experiment, not a claim about a universal
"best time". Slots use Europe/Amsterdam so DST changes are handled correctly.
"""
from __future__ import annotations

import argparse
from datetime import date, datetime, time, timedelta, timezone
from zoneinfo import ZoneInfo

CHANNEL_TZ = ZoneInfo("Europe/Amsterdam")
PUBLISH_DAYS = (1, 3, 5)  # Tuesday, Thursday, Saturday
PUBLISH_TIME = time(18, 30)


def next_publish_slot(now: datetime | None = None, *, min_lead: timedelta = timedelta(minutes=30)) -> datetime:
    current = now or datetime.now(timezone.utc)
    if current.tzinfo is None:
        raise ValueError("now must include a timezone")
    local_now = current.astimezone(CHANNEL_TZ)
    earliest = local_now + min_lead
    for offset in range(15):
        candidate_date = local_now.date() + timedelta(days=offset)
        if candidate_date.weekday() not in PUBLISH_DAYS:
            continue
        candidate = datetime.combine(candidate_date, PUBLISH_TIME, CHANNEL_TZ)
        if candidate >= earliest:
            return candidate.astimezone(timezone.utc)
    raise RuntimeError("could not find a publishing slot in the next two weeks")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--now", help="Optional ISO-8601 time for testing")
    args = parser.parse_args()
    now = datetime.fromisoformat(args.now.replace("Z", "+00:00")) if args.now else None
    print(next_publish_slot(now).isoformat().replace("+00:00", "Z"))


if __name__ == "__main__":
    main()
