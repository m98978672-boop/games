"""Run one bounded queue of reviews sequentially; never retry an upload.

Each invocation is one GitHub Actions job for one format. Jobs for different
formats may run concurrently. A failed or ambiguous upload stops this queue.

An empty publish_at means "use the regular schedule": one video takes the next
slot, a batch of several walks the daily Shorts/long cadence. Bad workflow
inputs (an unknown format, a non-numeric count, an unusable time) are reported
as one readable line before any rendering starts, never as a raw traceback.
Nothing is rendered or uploaded in that case.
"""
from __future__ import annotations

import argparse
from review_slot_state import OCCUPIED_SLOT_EXIT, OccupiedReviewSlot
import json
import os
import subprocess
import sys
import time
from datetime import timedelta
from pathlib import Path

from schedule_policy import CHANNEL_TZ, manual_publish_time, next_publish_slot, served_slot
LIMITS = {"short": 5, "long": 2}
# Batch rendering can take hours; the first automatic slot keeps this much lead.
BATCH_LEAD = timedelta(hours=8)


def parse_count(value: object) -> int:
    """Read the workflow's text input; an empty value means one item."""
    text = "" if value is None else str(value).strip()
    if not text:
        return 1
    try:
        return int(text)
    except ValueError:
        raise ValueError(
            "batch_count must be a whole number: 1–5 Shorts or 1–2 long reviews per run."
        ) from None


def parse_format(value: object) -> str:
    text = "" if value is None else str(value).strip()
    if text not in LIMITS:
        raise ValueError("video_format must be short or long.")
    return text


def suggest_start(video_format: str, *, now=None) -> str:
    """A concrete Moscow time the owner can paste into publish_at."""
    slot = next_publish_slot(now, video_format=video_format, min_lead=BATCH_LEAD).astimezone(CHANNEL_TZ)
    return slot.strftime("%Y-%m-%d %H:%M")


def plan(count: int, video_format: str, start: str, *, now=None) -> list[str]:
    maximum = LIMITS.get(video_format)
    if maximum is None or not 1 <= count <= maximum:
        raise ValueError("Queue limit: 1–5 Shorts or 1–2 long reviews per run.")
    text = "" if start is None else str(start).strip()
    # An empty start means "let the regular schedule decide": one item takes the
    # next slot (reserved before rendering inside run_game_review.py), a batch
    # walks the short/long cadence with a generous lead.
    if not text and count == 1:
        return [""]
    # Batch rendering can take hours. Choose the first regular slot with a
    # generous lead, but never assume it is free: the publisher must reserve it.
    first = (manual_publish_time(text, now=now) if text else
             next_publish_slot(now, video_format=video_format, min_lead=BATCH_LEAD)).astimezone(CHANNEL_TZ)
    if video_format == 'short':
        times = (first + timedelta(days=index // 2, hours=4 * (index % 2)) for index in range(count))
    else:
        times = (first + timedelta(days=index) for index in range(count))
    return [slot.strftime("%Y-%m-%d %H:%M") for slot in times]


def _usable_slot(publish_at: str) -> str:
    """Return an empty string when the slot is still usable, or the reason it is not.

    A queued wall time that has already gone by (a slow previous item, a delayed
    runner) cannot be published at its slot, so it is reported instead of being
    shifted blindly.
    """
    if not publish_at:
        return ""
    try:
        manual_publish_time(publish_at)
    except ValueError as exc:
        return str(exc)
    return ""


def _render(index: int, publish_at: str, video_format: str, output_dir: Path) -> Path:
    """Render one queued review; retried once, always before any upload."""
    env = os.environ.copy()
    env["MANUAL_PUBLISH_AT"] = publish_at
    output = output_dir / f"games-review-{index}.mp4"
    for attempt in range(2):
        result = subprocess.run([sys.executable, "youtube-bot/run_game_review.py", str(output),
                                 "--format", video_format], env=env)
        if result.returncode == 0:
            return output
        if result.returncode == OCCUPIED_SLOT_EXIT:
            raise OccupiedReviewSlot(publish_at)
        if attempt == 0:
            print("::warning::Review generation failed; retrying once before any upload.", flush=True)
            time.sleep(20)
    raise RuntimeError("review generation failed twice")


class SlotUnverifiable(RuntimeError):
    """The batch slot cannot be verified, so this item must not be uploaded."""


def _publish(index: int, publish_at: str, output: Path, batch: bool) -> None:
    """Upload exactly once; any failure or interruption requires Studio inspection.

    Only an unverifiable slot is reported as a skip. Every other failure - an
    ambiguous upload above all - propagates, because only a human can clear it.
    """
    env = os.environ.copy()
    env["MANUAL_PUBLISH_AT"] = publish_at
    result_path = output.with_suffix(".result.json")
    if batch:
        metadata = json.loads(result_path.read_text(encoding="utf-8"))["metadata"]
        if metadata.get("manual_time_adjusted") is not False:
            raise SlotUnverifiable("slot was adjusted or cannot be verified")
    subprocess.run([sys.executable, "youtube-bot/publish_to_supabase.py", str(result_path)],
                   env=env, check=True)


def run_queue(times: list[str], video_format: str, output_dir: Path) -> tuple[int, list[str]]:
    """Render and upload each queued review; never retry an upload.

    Returns (published_count, skipped). A review that fails before any upload
    is skipped and reported, so one bad Steam/Qwen draw cannot kill the whole
    run and the remaining slots still publish. A failed or ambiguous upload
    stops the queue immediately, because only a human can clear the doubt.

    The queue stays strictly sequential. An upload waits for its render, and the
    next render waits for that upload to confirm, so a doubtful upload never has
    a second review rendering behind it and no two uploads can interleave.
    Rendering is now minutes rather than tens of minutes, so the sequential cost
    is small compared with the risk the server-side slot reservation removes.
    """
    published = 0
    skipped: list[str] = []
    batch = len(times) > 1
    for index, publish_at in enumerate(times, 1):
        # Validate before doing expensive work; never silently reschedule an
        # overdue batch item. If the queued wall time has already gone by (a
        # slow previous item, a delayed runner), this item cannot be published
        # at its slot, so it is skipped and reported instead of shifted blindly.
        reason = _usable_slot(publish_at)
        if reason:
            skipped.append(f"{publish_at}: {reason}")
            print(f"::warning::Queued slot {publish_at} is no longer usable ({reason}); "
                  "this review is skipped before rendering.", flush=True)
            continue
        print(f"Queue {video_format}: {index}/{len(times)}, "
              f"requested MSK {publish_at or 'automatic'}", flush=True)
        try:
            output = _render(index, publish_at, video_format, output_dir)
        except OccupiedReviewSlot:
            skipped.append(f"{publish_at}: publication slot already occupied")
            print(f"::warning::Slot {publish_at} is occupied; skipped without retry or upload.", flush=True)
            continue
        except RuntimeError:
            skipped.append(f"{publish_at or 'automatic'}: review generation failed twice")
            print(f"::warning::Review generation failed twice for slot "
                  f"{publish_at or 'automatic'}; nothing was uploaded for it. "
                  "Continuing with the next queued review.", flush=True)
            continue
        try:
            _publish(index, publish_at, output, batch)
        except SlotUnverifiable:
            skipped.append(f"{publish_at}: slot was adjusted or cannot be verified")
            print("::warning::Batch slot was adjusted or cannot be verified; "
                  "nothing was uploaded for it. Continuing with the next queued review.", flush=True)
            continue
        published += 1
    return published, skipped


def validate_inputs() -> tuple[str, list[str]]:
    """Check the workflow inputs before any work; raise ValueError with the fix."""
    video_format = parse_format(os.environ.get("VIDEO_FORMAT"))
    count = parse_count(os.environ.get("REVIEW_BATCH_COUNT", "1"))
    start = os.environ.get("MANUAL_PUBLISH_AT", "")
    try:
        return video_format, plan(count, video_format, start)
    except ValueError as exc:
        if str(start).strip():
            raise ValueError(f"publish_at {str(start).strip()!r}: {exc}") from None
        raise


def scheduled_plan() -> list[str]:
    """The single slot a scheduled run serves, or [] when it already has a video.

    A scheduled run is daily maintenance, not a batch: it serves exactly the
    slot its cron belongs to (06:00 long, 08:00 Short). If that slot already
    holds a confirmed video, this run does no work at all. Reading the queue
    fails closed: if the answer is unknown, the run renders nothing rather than
    risk a second video in the same slot.
    """
    from publish_to_supabase import read_queue
    from review_slot_state import assess
    slot = served_slot(os.environ.get("REVIEW_SCHEDULE", ""))
    jobs = read_queue()
    missing, booked = assess([slot], jobs)
    if not missing:
        print(f"Scheduled slot {slot.astimezone(CHANNEL_TZ):%Y-%m-%d %H:%M} Moscow already has "
              "a video; nothing to render. No upload was started.", flush=True)
        return []
    print(f"Scheduled slot {slot.astimezone(CHANNEL_TZ):%Y-%m-%d %H:%M} Moscow has no video yet; "
          f"rendering one review. Queue rows read: {len(jobs)}.", flush=True)
    return [slot.astimezone(CHANNEL_TZ).strftime("%Y-%m-%d %H:%M")]


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Run one bounded queue of YouTube reviews.")
    parser.add_argument(
        "--check", action="store_true",
        help="Validate the workflow inputs and print the planned times without rendering.",
    )
    parser.add_argument(
        "--check-queue", action="store_true",
        help="Scheduled run only: check whether this run's slot already has a video.",
    )
    args = parser.parse_args(argv)
    try:
        video_format, times = validate_inputs()
    except ValueError as exc:
        # One actionable line instead of a traceback; nothing is rendered.
        print(f"::error::Queue not started; nothing was rendered or uploaded. {exc}", flush=True)
        return 1
    if args.check:
        print(f"Validated queue: format={video_format}, count={len(times)}, times={times}", flush=True)
        return 0
    if args.check_queue:
        if os.environ.get("GITHUB_EVENT_NAME") != "schedule":
            # Manual runs keep their explicit plan; they are never skipped.
            print(f"Not a scheduled run; keeping the requested queue {times}.", flush=True)
            return 0
        try:
            times = scheduled_plan()
        except Exception as exc:
            # Unknown queue state must never look like "nothing to do": stop
            # before rendering and let the owner check the publisher.
            print(f"::error::Could not confirm scheduled slot state; nothing was rendered or uploaded. {exc}", flush=True)
            return 1
        if not times:
            # Tell the workflow to stop here: rendering this slot again would
            # only produce a video the publisher must reject as a duplicate.
            if output_path := os.environ.get("GITHUB_OUTPUT"):
                try:
                    with open(output_path, "a", encoding="utf-8") as output:
                        output.write("skip=true\n")
                except OSError:
                    pass
            if summary_path := os.environ.get("GITHUB_STEP_SUMMARY"):
                try:
                    with open(summary_path, "a", encoding="utf-8") as output:
                        output.write("Scheduled slot already has a video; nothing was rendered or uploaded.\n")
                except OSError:
                    pass
            return 0
        print(f"Planned queue after the queue check: format={video_format}, times={times}", flush=True)
    runner_temp = os.environ.get("RUNNER_TEMP", "").strip()
    if not runner_temp:
        print("::error::RUNNER_TEMP is not set; this queue is meant to run inside GitHub Actions.", flush=True)
        return 1
    published, skipped = run_queue(times, video_format, Path(runner_temp))
    summary = f"Queue finished: {published} of {len(times)} {video_format} review(s) uploaded."
    print(summary, flush=True)
    if summary_path := os.environ.get("GITHUB_STEP_SUMMARY"):
        try:
            with open(summary_path, "a", encoding="utf-8") as output:
                output.write(summary + "\n")
                for item in skipped:
                    output.write(f"- skipped before upload: {item}\n")
        except OSError:
            pass
    if not published and times and len(skipped) == len(times) and all(
        item.endswith(": publication slot already occupied") for item in skipped
    ):
        print("All requested slots already have videos. Nothing new was uploaded; choose other times for new videos.", flush=True)
        return 0
    if not published and times:
        print("::error::No review from this queue was uploaded; every item was skipped before upload.", flush=True)
        return 1
    if skipped:
        print(f"::warning::{len(skipped)} review(s) skipped before upload; the rest were published.", flush=True)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
