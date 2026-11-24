"""Run one bounded queue of reviews sequentially; never retry an upload.

Each invocation is one GitHub Actions job for one format. Jobs for different
formats may run concurrently. A failed or ambiguous upload stops this queue.

Bad workflow inputs (a queue of several videos without a starting time, an
unknown format or a non-numeric count) are configuration mistakes: they are
reported as one readable line before any rendering starts, never as a raw
traceback. Nothing is rendered or uploaded in that case.
"""
from __future__ import annotations

import argparse
import json
import os
import subprocess
import sys
import time
from datetime import timedelta
from pathlib import Path

from schedule_policy import CHANNEL_TZ, manual_publish_time, next_publish_slot

LIMITS = {"short": 5, "long": 2}


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
    slot = next_publish_slot(now, video_format=video_format).astimezone(CHANNEL_TZ)
    return slot.strftime("%Y-%m-%d %H:%M")


def plan(count: int, video_format: str, start: str, *, now=None) -> list[str]:
    maximum = LIMITS.get(video_format)
    if maximum is None or not 1 <= count <= maximum:
        raise ValueError("Queue limit: 1–5 Shorts or 1–2 long reviews per run.")
    text = "" if start is None else str(start).strip()
    if not text:
        if count != 1:
            # A queue of several videos publishes one item per day at the same
            # wall time, so it needs an explicit first slot. Guessing dates
            # would move publications the owner never approved.
            raise ValueError(
                f"A queue of {count} needs a starting Moscow publication time: fill "
                f"publish_at (format YYYY-MM-DD HH:MM, for example {suggest_start(video_format, now=now)}) "
                f"or set batch_count to 1 to use the regular schedule."
            )
        return [""]
    first = manual_publish_time(text, now=now).astimezone(CHANNEL_TZ)
    return [(first + timedelta(days=index)).strftime("%Y-%m-%d %H:%M") for index in range(count)]


def run_queue(times: list[str], video_format: str, output_dir: Path) -> None:
    for index, publish_at in enumerate(times, 1):
        # Validate before doing expensive work; never silently reschedule an overdue batch item.
        if publish_at:
            manual_publish_time(publish_at)
        env = os.environ.copy()
        env["MANUAL_PUBLISH_AT"] = publish_at
        output = output_dir / f"games-review-{index}.mp4"
        print(f"Queue {video_format}: {index}/{len(times)}, requested MSK {publish_at or 'automatic'}", flush=True)
        for attempt in range(2):
            result = subprocess.run([sys.executable, "youtube-bot/run_game_review.py", str(output), "--format", video_format], env=env)
            if result.returncode == 0:
                break
            if attempt == 0:
                print("Rendering failed; one retry before upload.", flush=True)
                time.sleep(20)
        else:
            raise RuntimeError("Rendering failed twice; queue stopped before upload.")
        result_path = output.with_suffix('.result.json')
        if len(times) > 1:
            metadata = json.loads(result_path.read_text(encoding='utf-8'))['metadata']
            if metadata.get('manual_time_adjusted') is not False:
                raise RuntimeError('Batch slot was adjusted or cannot be verified; queue stopped before upload.')
        # Upload exactly once; any failure or interruption requires Studio inspection.
        subprocess.run([sys.executable, "youtube-bot/publish_to_supabase.py", str(result_path)], env=env, check=True)


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


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Run one bounded queue of YouTube reviews.")
    parser.add_argument(
        "--check", action="store_true",
        help="Validate the workflow inputs and print the planned times without rendering.",
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
    runner_temp = os.environ.get("RUNNER_TEMP", "").strip()
    if not runner_temp:
        print("::error::RUNNER_TEMP is not set; this queue is meant to run inside GitHub Actions.", flush=True)
        return 1
    run_queue(times, video_format, Path(runner_temp))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
