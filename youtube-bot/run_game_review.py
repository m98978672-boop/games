"""Generate a source-linked Russian Steam review as a Short or long-form video."""
from __future__ import annotations

import argparse
from review_slot_state import OCCUPIED_SLOT_EXIT, OccupiedReviewSlot
import json
import os
import re
import sys
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from game_reviews import generate_game_review, generate_long_narration, youtube_description, ensure_editorial_quality, make_review_title, occasionally_ask_viewers
from renderer import render_long_review, render_short
from schedule_policy import manual_publish_time, next_publish_slot, resolve_manual_after_render, CHANNEL_TZ
from steam_catalog import download_screenshots, load_steam_games
from review_slot_state import QueueStateUnknown, UncertainSlot

BASE_DIR = Path(__file__).resolve().parent
DATA_DIR = Path(os.getenv("DATA_DIR", str(BASE_DIR / "data"))).resolve()


def recent_games(path: Path) -> list[str]:
    try:
        value = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError):
        return []
    return [str(item) for item in value if isinstance(item, str)][-24:] if isinstance(value, list) else []


def authoritative_topic_history() -> list[str]:
    """Fetch the complete shared ledger; fail closed on malformed/unavailable data."""
    from publish_to_supabase import _supabase_post
    result = _supabase_post('/autopilot/topic-history', {})
    ids = result.get('game_ids')
    if (type(result.get('version')) is not int or result['version'] != 1 or
            not isinstance(ids, list) or len(ids) > 20000 or
            any(not isinstance(item, str) or not re.fullmatch(r'[a-z0-9-]{1,60}', item) for item in ids) or
            len(set(ids)) != len(ids)):
        raise ValueError('Shared topic history is incomplete or malformed; refusing to render.')
    return ids


def remember_game(path: Path, game_id: str) -> list[str]:
    history = recent_games(path)
    updated = [item for item in history if item != game_id] + [game_id]
    updated = updated[-24:]
    path.parent.mkdir(parents=True, exist_ok=True)
    temp = path.with_suffix(".tmp")
    temp.write_text(json.dumps(updated, ensure_ascii=False, indent=2), encoding="utf-8")
    temp.replace(path)
    return updated


def run(output: Path, *, video_format: str = "short", preview: bool = False) -> dict[str, Any]:
    if video_format not in {"short", "long"}:
        raise ValueError("video_format must be short or long")
    manual_time = os.getenv("MANUAL_PUBLISH_AT", "").strip()
    requested = manual_publish_time(manual_time) if manual_time else None  # Validate before rendering.
    history_path = DATA_DIR / "recent-games.json"
    previous = recent_games(history_path)
    if not preview and os.getenv('REQUIRE_SHARED_TOPIC_HISTORY') == 'true':
        previous = list(set(previous) | set(authoritative_topic_history()))
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
        title = make_review_title(review["game_title"], video_format="long")
    else:
        review["format"] = "game-review"
        rendered = render_short(review, output, workdir)
        title = review["title"][:100]
    # Selection memory is updated only by the publisher after confirmed upload.
    # Slow rendering may consume the lead time. Preserve the chosen slot if it
    # still works; otherwise explicitly report a safe one-off delay. Never
    # change the recurring cadence.
    adjusted = False
    if preview:
        scheduled = None
    elif requested is not None:
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
    if occasionally_ask_viewers(str(review["game_id"])):
        description += "\n\nА вам интересен такой формат игры? Поделитесь мнением, если хотите."
    metadata = {
        "job_id": str(uuid.uuid4()),
        "game_id": review["game_id"],
        "title": title,
        "description": description[:5000],
        "tags": ["games", "steam", "game-review", f"bot-topic:game-review", f"steam-app:{review['game_id']}", video_format],
        "category_id": "20",
        "publish_at": scheduled.isoformat().replace("+00:00", "Z") if scheduled else None,
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
        "status": "private_preview" if preview else "rendered_waiting_for_explicit_audience_setting",
    }
    if preview:
        from renderer import pronunciation_text
        result['speech_aliases_applied'] = [
            {'scene': index, 'original': dialogue, 'spoken': spoken}
            for index, scene in enumerate(review.get('scenes', []), 1)
            if isinstance(dialogue := scene.get('dialogue'), str)
            and (spoken := pronunciation_text(dialogue)) != dialogue
        ]
    result_path = output.with_suffix(".result.json")
    result_path.write_text(json.dumps(result, ensure_ascii=False, indent=2), encoding="utf-8")
    result["result_path"] = str(result_path)
    print(json.dumps(result, ensure_ascii=False, indent=2))
    return result


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Generate a locally inferred Steam game review.")
    parser.add_argument("output", nargs="?", type=Path, default=DATA_DIR / "episodes" / "game-review.mp4")
    parser.add_argument("--format", choices=("short", "long"), default="short")
    parser.add_argument("--preview", action="store_true", help="Render without reserving or checking a publication slot.")
    args = parser.parse_args()
    try:
        run(args.output, video_format=args.format, preview=args.preview)
    except OccupiedReviewSlot as exc:
        print(f"Game-review cycle stopped safely: {exc}", file=sys.stderr)
        raise SystemExit(OCCUPIED_SLOT_EXIT) from None
    except (QueueStateUnknown, UncertainSlot) as exc:
        print(f"Queue state uncertain; stop and check YouTube Studio: {exc}", file=sys.stderr)
        raise SystemExit(75)
    except Exception as exc:
        print(f"Game-review cycle stopped safely: {exc}", file=sys.stderr)
        raise SystemExit(1)
