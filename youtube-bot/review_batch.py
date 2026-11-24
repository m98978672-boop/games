"""Run one bounded queue of reviews sequentially; never retry an upload.

Each invocation is one GitHub Actions job for one format. Jobs for different
formats may run concurrently. A failed or ambiguous upload stops this queue.
"""
from __future__ import annotations

import json
import os
import subprocess
import sys
import time
from datetime import timedelta
from pathlib import Path

from schedule_policy import CHANNEL_TZ, manual_publish_time, next_publish_slot


def plan(count: int, video_format: str, start: str, *, now=None) -> list[str]:
    maximum = {"short": 5, "long": 2}.get(video_format)
    if maximum is None or not 1 <= count <= maximum:
        raise ValueError("Queue limit: 1–5 Shorts or 1–2 long reviews per run.")
    start = start.strip()
    if not start and count == 1:
        return [""]
    # Batch rendering can take hours. Choose the first regular slot with a
    # generous lead, but never assume it is free: the publisher must reserve it.
    first = (manual_publish_time(start, now=now) if start else
             next_publish_slot(now, video_format=video_format, min_lead=timedelta(hours=8))).astimezone(CHANNEL_TZ)
    if video_format == 'short':
        times = (first + timedelta(days=index // 2, hours=4 * (index % 2)) for index in range(count))
    else:
        times = (first + timedelta(days=index) for index in range(count))
    return [slot.strftime("%Y-%m-%d %H:%M") for slot in times]


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


def main() -> None:
    fmt = os.environ["VIDEO_FORMAT"]
    count = int(os.environ.get("REVIEW_BATCH_COUNT", "1"))
    times = plan(count, fmt, os.environ.get("MANUAL_PUBLISH_AT", ""))
    run_queue(times, fmt, Path(os.environ["RUNNER_TEMP"]))


if __name__ == "__main__":
    main()
