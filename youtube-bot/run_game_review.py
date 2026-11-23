"""Generate a source-linked Russian Steam review as a Short or long-form video."""
from __future__ import annotations

import argparse
import json
import os
import sys
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from game_reviews import generate_game_review, generate_long_narration, youtube_description, ensure_editorial_quality
from renderer import render_long_review, render_short
from schedule_policy import manual_publish_time, next_publish_slot, resolve_manual_after_render, CHANNEL_TZ
from steam_catalog import download_screenshots, load_steam_games

BASE_DIR = Path(__file__).resolve().parent
DATA_DIR = Path(os.getenv("DATA_DIR", str(BASE_DIR / "data"))).resolve()


def recent_games(path: Path) -> list[str]:
    try:
        value = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError):
        return []
    return [str(item) for item in value if isinstance(item, str)][-24:] if isinstance(value, list) else []


def remember_game(path: Path, game_id: str) -> list[str]:
    history = recent_games(path)
    updated = [item for item in history if item != game_id] + [game_id]
    updated = updated[-24:]
    path.parent.mkdir(parents=True, exist_ok=True)
    temp = path.with_suffix(".tmp")
    temp.write_text(json.dumps(updated, ensure_ascii=False, indent=2), encoding="utf-8")
    temp.replace(path)
    return updated


def run(output: Path, *, video_format: str = "short") -> dict[str, Any]:
    if video_format not in {"short", "long"}:
        raise ValueError("video_format must be short or long")
    manual_time = os.getenv("MANUAL_PUBLISH_AT", "").strip()
    requested = manual_publish_time(manual_time) if manual_time else None  # Validate before rendering.
    history_path = DATA_DIR / "recent-games.json"
    previous = recent_games(history_path)
    # Deliberately source only games listed by Steam's live public shelves; never
    # silently switch back to the repository's own community games.
    games = load_steam_games(recent_game_ids=previous)
    review = generate_game_review(
        games,
        recent_game_ids=previous,
        seed=datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC"),
    )
    output = output.resolve()
    output.parent.mkdir(parents=True, exist_ok=True)
    workdir = output.parent / f"{output.stem}-work"
    if video_format == "long":
        review["scenes"] = generate_long_narration(review)
        ensure_editorial_quality(review["scenes"])
    review["screenshot_paths"] = download_screenshots(
        list(review.get("screenshots", [])), workdir / "steam-assets", limit=6,
    )
    if video_format == "long":
        review["format"] = "game-review-long"
        rendered = render_long_review(review, output, workdir)
        title = f"Полный обзор: {review['game_title']} — разбор по источникам"[:100]
    else:
        review["format"] = "game-review"
        rendered = render_short(review, output, workdir)
        title = review["title"][:100]
    remember_game(history_path, review["game_id"])
    # Slow rendering may consume the lead time. Preserve the chosen slot if it
    # still works; otherwise explicitly report a safe one-off delay. Never
    # change the recurring cadence.
    adjusted = False
    if requested is not None:
        scheduled, adjusted = resolve_manual_after_render(requested)
        if adjusted:
            print(f"Requested Moscow time {manual_time} became too close during rendering; "
                  f"rescheduled once to {scheduled.astimezone(CHANNEL_TZ):%Y-%m-%d %H:%M} Moscow.", file=sys.stderr)
    else:
        scheduled = next_publish_slot(video_format=video_format)
    source_description = youtube_description(review)
    description = (
        source_description
        + f"\n\nФормат: {'длинный видеообзор' if video_format == 'long' else 'Shorts'}."
        + "\nОценка основана на открытых данных Steam; личное прохождение не заявляется."
        + ("\nСценарий создан по шаблону из открытых источников: ИИ не смог подготовить корректный текст."
           if any(scene.get("generation") == "source-template" for scene in review.get("scenes", [])) else "")
    )
    metadata = {
        "job_id": str(uuid.uuid4()),
        "game_id": review["game_id"],
        "title": title,
        "description": description[:5000],
        "tags": ["games", "steam", "game-review", f"bot-topic:game-review", f"steam-app:{review['game_id']}", video_format],
        "category_id": "20",
        "publish_at": scheduled.isoformat().replace("+00:00", "Z"),
        "video_format": video_format,
        "requested_publish_at": requested.isoformat().replace("+00:00", "Z") if requested else None,
        "manual_time_adjusted": adjusted,
        "idea_score": review["idea_score"],
        "made_for_kids": None,  # The publisher requires the owner's explicit false/true setting.
        "video_path": str(output),
    }
    result = {
        "episode_id": output.stem,
        "game_id": review["game_id"],
        "game_title": review["game_title"],
        "format": video_format,
        "sources": review.get("sources", []),
        "review": review,
        "metadata": metadata,
        "video": rendered,
        "status": "rendered_waiting_for_explicit_audience_setting",
    }
    result_path = output.with_suffix(".result.json")
    result_path.write_text(json.dumps(result, ensure_ascii=False, indent=2), encoding="utf-8")
    result["result_path"] = str(result_path)
    print(json.dumps(result, ensure_ascii=False, indent=2))
    return result


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Generate a locally inferred Steam game review.")
    parser.add_argument("output", nargs="?", type=Path, default=DATA_DIR / "episodes" / "game-review.mp4")
    parser.add_argument("--format", choices=("short", "long"), default="short")
    args = parser.parse_args()
    try:
        run(args.output, video_format=args.format)
    except Exception as exc:
        print(f"Game-review cycle stopped safely: {exc}", file=sys.stderr)
        raise SystemExit(1)
