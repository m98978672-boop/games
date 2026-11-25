"""Read-only reconciliation of the planned review slots.

Answers one question per planned slot: does a real video already sit there?
It never renders, reserves or uploads anything. When a slot has no video, the
report states the exact start command, because a missed publication needs the
owner's decision (and a check in YouTube Studio) before it is retried.

The queue table is private, so it is read with the same OIDC identity the
publisher uses. An unreadable queue is reported as unknown, never as "empty":
an empty queue would look like a free slot and invite a duplicate render.
"""
from __future__ import annotations

import argparse
import sys
from datetime import datetime, timedelta, timezone
from pathlib import Path


def _import_publisher():
    """Import the publisher lazily so the report works without its network stack."""
    sys.path.insert(0, str(Path(__file__).resolve().parent))
    from publish_to_supabase import read_queue
    return read_queue


def planned_slots(*, now: datetime | None = None, days: int = 2) -> list[datetime]:
    """Regular publication slots for today and tomorrow, Moscow wall time."""
    from schedule_policy import CHANNEL_TZ, LONG_POST_TIME, SHORT_POST_TIMES
    current = now or datetime.now(timezone.utc)
    if current.tzinfo is None:
        raise ValueError("now must include a timezone")
    today = current.astimezone(CHANNEL_TZ).date()
    slots = [
        datetime.combine(today + timedelta(days=offset), wall_time, CHANNEL_TZ)
        for offset in range(max(1, days))
        for wall_time in (LONG_POST_TIME, *SHORT_POST_TIMES)
    ]
    return [slot.astimezone(timezone.utc) for slot in slots]


def render_report(missing: list[datetime], booked: list[datetime], *, error: str | None,
                  now: datetime | None = None) -> str:
    """A short Markdown report; safe to paste into a public issue."""
    from schedule_policy import CHANNEL_TZ
    lines = ["## Сверка слотов обзоров (только чтение)", ""]
    if error:
        lines += [
            "Состояние очереди неизвестно: очередь публикаций прочитать не удалось или бронирование остаётся неопределённым.",
            f"Причина: {error}",
            "",
            "Ничего не запущено и не загружено. Пропуск нельзя считать свободным слотом, "
            "пока очередь не прочитана: иначе один слот получит второе видео.",
            "",
        ]
        return "\n".join(lines)
    lines += [
        f"Сверено слотов: {len(missing) + len(booked)}. Без видео: {len(missing)}. "
        f"Уже с видео: {len(booked)}.",
        "",
    ]
    if booked:
        lines.append("Занятые слоты (видео подтверждено строкой очереди):")
        for slot in booked:
            lines.append(f"- {slot.astimezone(CHANNEL_TZ):%Y-%m-%d %H:%M} МСК — видео уже есть")
        lines.append("")
    if missing:
        lines += [
            "Слоты без видео. Автоматически ничего не повторяется: сначала проверьте YouTube Studio "
            "и очередь, затем запустите нужный слот вручную.",
            "",
        ]
        from schedule_policy import LONG_POST_TIME
        for slot in missing:
            local = slot.astimezone(CHANNEL_TZ)
            video_format = "long" if local.time() == LONG_POST_TIME else "short"
            label = "длинный обзор" if video_format == "long" else "Shorts"
            command = (f"gh workflow run youtube-shorts-autopilot.yml --ref main "
                       f"-f video_format={video_format} -f made_for_kids=false -f batch_count=1 "
                       f"-f publish_at='{local:%Y-%m-%d %H:%M}'")
            lines.append(f"- {local:%Y-%m-%d %H:%M} МСК ({label}) — `{command}`")
        lines.append("")
    else:
        lines += ["Все сверенные слоты уже имеют видео. Ничего запускать не нужно.", ""]
    return "\n".join(lines)


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Report planned review slots without changing anything.")
    parser.add_argument("--days", type=int, default=2, help="How many days ahead to compare (default 2).")
    args = parser.parse_args(argv)
    from review_slot_state import assess
    slots = planned_slots(days=args.days)
    try:
        jobs = _import_publisher()()
        missing, booked = assess(slots, jobs)
    except Exception as exc:  # noqa: BLE001 - the report must survive every failure
        print(render_report([], [], error=str(exc)[:200]))
        # The report is the deliverable of this step; a read failure must be
        # visible, not hidden behind a green check.
        return 1
    print(render_report(missing, booked, error=None))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
