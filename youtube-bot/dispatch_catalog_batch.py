"""Dispatch a manifest of ready-made catalog videos to the authorized workflow.

The workflow must already be present on ``main`` (the Supabase publisher only
accepts the main-branch OIDC identity). This script only calls the GitHub CLI;
it never reads a YouTube token or uploads video bytes itself.

Usage:
    python youtube-bot/dispatch_catalog_batch.py \
        --manifest youtube-bot/manifests/boris-10.json --dry-run
"""
from __future__ import annotations

import argparse
import json
import subprocess
import sys
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from catalog_upload import slugify_game_id
from schedule_policy import manual_publish_time

REQUIRED_FIELDS = {"video", "title", "description", "tags", "format", "game_id", "publish_at"}


def load_manifest(path: Path) -> dict[str, Any]:
    data = json.loads(path.read_text(encoding="utf-8"))
    if not isinstance(data, dict) or not isinstance(data.get("videos"), list):
        raise ValueError("Manifest must be an object with a videos array.")
    return data


def validate_manifest(data: dict[str, Any], *, limit: int, now: datetime | None = None) -> list[dict[str, Any]]:
    if not isinstance(data.get("made_for_kids"), bool):
        raise ValueError("made_for_kids must be explicitly set to true or false by the channel owner.")
    videos = data["videos"]
    if not videos:
        raise ValueError("Manifest contains no videos.")
    if limit < 1:
        raise ValueError("limit must be at least 1.")
    selected = videos[:limit]
    seen_paths: set[str] = set()
    seen_times: set[str] = set()
    seen_ids: set[str] = set()
    for index, item in enumerate(selected):
        missing = REQUIRED_FIELDS - set(item)
        if missing:
            raise ValueError(f"Video #{index + 1} is missing fields: {', '.join(sorted(missing))}")
        if item["format"] not in {"short", "long"}:
            raise ValueError(f"Video #{index + 1} has invalid format {item['format']!r}.")
        if item["video"] in seen_paths:
            raise ValueError(f"Duplicate video path: {item['video']}")
        if item["publish_at"] in seen_times:
            raise ValueError(f"Duplicate publish time: {item['publish_at']}")
        game_id = slugify_game_id(item["game_id"])
        if game_id in seen_ids:
            raise ValueError(f"Duplicate game_id: {game_id}")
        seen_paths.add(item["video"])
        seen_times.add(item["publish_at"])
        seen_ids.add(game_id)
        manual_publish_time(item["publish_at"], now=now)
    return selected


def build_command(data: dict[str, Any], item: dict[str, Any], workflow: str, branch: str) -> list[str]:
    return [
        "gh", "workflow", "run", workflow,
        "--ref", branch,
        "-f", f"made_for_kids={str(data['made_for_kids']).lower()}",
        "-f", f"video_format={item['format']}",
        "-f", f"catalog_video={item['video']}",
        "-f", f"catalog_title={item['title']}",
        "-f", f"catalog_description={item['description']}",
        "-f", f"catalog_tags={item['tags']}",
        "-f", f"catalog_category_id={data.get('category_id', '24')}",
        "-f", f"catalog_publish_at={item['publish_at']}",
        "-f", f"catalog_game_id={item['game_id']}",
    ]


def main() -> None:
    parser = argparse.ArgumentParser(description="Dispatch catalog videos to the authorized YouTube workflow.")
    parser.add_argument("--manifest", type=Path, required=True)
    parser.add_argument("--workflow", default=None, help="Workflow file name; defaults to the manifest value.")
    parser.add_argument("--branch", default=None, help="Branch to run; defaults to the manifest value.")
    parser.add_argument("--limit", type=int, default=10)
    parser.add_argument("--dry-run", action="store_true", help="Print commands without dispatching.")
    args = parser.parse_args()

    data = load_manifest(args.manifest)
    workflow = args.workflow or str(data.get("workflow") or "youtube-shorts-autopilot.yml")
    branch = args.branch or str(data.get("branch") or "main")
    selected = validate_manifest(data, limit=args.limit)

    print(f"Prepared {len(selected)} catalog upload(s) for {workflow} @ {branch}:")
    for index, item in enumerate(selected, 1):
        command = build_command(data, item, workflow, branch)
        print(f"  {index:2d}. {item['publish_at']} MSK  {item['format']:5s}  {item['title']}")
        if args.dry_run:
            print("      " + " ".join(command))
            continue
        result = subprocess.run(command, capture_output=True, text=True)
        if result.returncode != 0:
            print(result.stdout.strip(), file=sys.stderr)
            print(result.stderr.strip(), file=sys.stderr)
            raise SystemExit(f"Dispatch failed for {item['title']!r}. No further runs were started.")
        print(f"      dispatched")
    if args.dry_run:
        print("Dry run: no workflow runs were created.")
    else:
        print(f"Dispatched {len(selected)} run(s). Monitor: gh run list --workflow {workflow} --branch {branch}")


if __name__ == "__main__":
    main()
