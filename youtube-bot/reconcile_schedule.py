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
    """Every regular publication slot for the next `days` Moscow days, in order."""
    from schedule_policy import CHANNEL_TZ, GAMEPLAY_POST_TIME, LONG_POST_TIMES, SHORT_POST_TIMES
    current = now or datetime.now(timezone.utc)
    if current.tzinfo is None:
        raise ValueError("now must include a timezone")
    today = current.astimezone(CHANNEL_TZ).date()
    slots = [
        datetime.combine(today + timedelta(days=offset), wall_time, CHANNEL_TZ)
        for offset in range(max(1, days))
        for wall_time in (*LONG_POST_TIMES, *SHORT_POST_TIMES, GAMEPLAY_POST_TIME)
    ]
    # Sort by the real moment: a 06:00 long review comes before the 09:00 Short.
    return sorted(slot.astimezone(timezone.utc) for slot in slots)


def _video_format(wall_time) -> str:
    from schedule_policy import slot_format
    return slot_format(wall_time)


# Gameplay is not rendered by the review workflow: it is recorded by the AI
# playthrough job, so its command is different in kind, not just in wording.
_LABELS = {"short": "Shorts", "long": "длинный обзор", "gameplay": "игровой обзор"}


def _command(slot_local, video_format: str) -> str:
    """The exact one-line dispatch that fills this slot.

    Gameplay is not a review: it is recorded by the AI playthrough job, so its
    command names that workflow and the same publish time instead of pretending
    a review run could produce it.
    """
    if video_format == "gameplay":
        raise ValueError("Gameplay is not eligible for automatic publication yet.")
    return (f"gh workflow run youtube-shorts-autopilot.yml --ref main "
            f"-f video_format={video_format} -f made_for_kids=false -f batch_count=1 "
            f"-f publish_at='{slot_local:%Y-%m-%d %H:%M}'")


def render_report(missing: list[datetime], booked: list[datetime], *, error: str | None,
                  now: datetime | None = None, days: int = 2) -> str:
    """A plan for the next days, grouped by day, safe to paste into an issue."""
    from schedule_policy import CHANNEL_TZ
    current = now or datetime.now(timezone.utc)
    lines = ["## Что выйдет в ближайшие дни", ""]
    if error:
        lines += [
            "Состояние очереди **неизвестно**: прочитать её не удалось.",
            f"Причина: {error}",
            "",
            "Ничего не запущено и не загружено. Пустой слот нельзя считать свободным, "
            "пока очередь не прочитана: иначе в него уйдёт второе видео.",
            "",
        ]
        return "\n".join(lines)

    booked_set = {moment.astimezone(CHANNEL_TZ) for moment in booked}
    missing_set = {moment.astimezone(CHANNEL_TZ) for moment in missing}
    everything = sorted(booked_set | missing_set)
    ready = sum(1 for slot in everything if slot in booked_set)
    counts = {"short": 0, "long": 0, "gameplay": 0}
    for slot in everything:
        counts[_video_format(slot.time())] += 1
    lines += [
        f"Слотов на {days} дня: **{len(everything)}** — готово **{ready}**, "
        f"без видео **{len(missing_set)}**.",
        "",
        f"Из них: Shorts **{counts['short']}**, длинных обзоров **{counts['long']}**, "
        f"игровых обзоров **{counts['gameplay']}**.",
        "Запись очереди не доказывает публикацию на YouTube и не подтверждает формат видео.",
        "",
    ]
    if not everything:
        lines += ["Слотов не найдено.", ""]
        return "\n".join(lines)

    day = None
    for index, slot in enumerate(everything):
        if slot.date() != day:
            day = slot.date()
            weekday = ("Понедельник", "Вторник", "Среда", "Четверг", "Пятница",
                       "Суббота", "Воскресенье")[day.weekday()]
            # The first day follows the summary line directly; later days get a
            # blank line before the heading.
            lines += ([f"### {weekday}, {day:%d.%m}"] if index == 0
                      else ["", f"### {weekday}, {day:%d.%m}"])
            lines.append("")
            lines.append("| Время МСК | Формат | Статус |")
            lines.append("|---|---|---|")
        video_format = _video_format(slot.time())
        label = _LABELS[video_format]
        status = "✅ запись очереди с ID видео" if slot in booked_set else "❌ нет подтверждения в очереди"
        lines.append(f"| {slot:%H:%M} | {label} | {status} |")

    if missing_set:
        lines += ["", "### Чем закрыть пропуски", ""]
        lines.append("Команды приведены только для будущих слотов обзоров; сначала проверьте YouTube Studio.")
        lines.append("")
        for slot in sorted(missing_set):
            video_format = _video_format(slot.time())
            lines.append(f"- **{slot:%d.%m %H:%M}** ({_LABELS[video_format]}):")
            lines.append("")
            if video_format == 'gameplay':
                lines.append('  Публикация прохождения заблокирована до проверки требований; команды нет.')
            elif slot <= current.astimezone(CHANNEL_TZ) + timedelta(minutes=45):
                lines.append('  Время прошло или слишком близко: сначала проверьте YouTube Studio и очередь.')
            else:
                lines.append('  Сначала проверьте YouTube Studio и очередь: предыдущая загрузка могла остаться без записи.')
                lines.append("")
                lines.append("  ```")
                lines.append(f"  {_command(slot, video_format)}")
                lines.append("  ```")
            lines.append("")
    else:
        lines += ["", "Все слоты на эти дни уже заняты. Ничего запускать не нужно.", ""]
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
        reason = str(exc)[:200]
        # An unresolved reservation is not a free slot: offering a command here
        # would put a second video next to one that may already be uploading.
        if type(exc).__name__ == "UncertainSlot":
            reason = ("слот в неопределённом состоянии — сначала проверьте YouTube Studio "
                      "и очередь публикаций, повтор не предлагается")
        print(render_report([], [], error=reason))
        # The report is the deliverable of this step; a read failure must be
        # visible, not hidden behind a green check.
        return 1
    print(render_report(missing, booked, error=None))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
