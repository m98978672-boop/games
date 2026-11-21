"""Generate one source-grounded Games review Short for the scheduled workflow."""
from __future__ import annotations

import json
import os
import sys
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from game_reviews import generate_game_review, load_game_catalog, youtube_description
from renderer import render_short
from schedule_policy import next_publish_slot

BASE_DIR = Path(__file__).resolve().parent
DATA_DIR = Path(os.getenv("DATA_DIR", str(BASE_DIR / "data"))).resolve()


def recent_games(path: Path) -> list[str]:
    try:
        value = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError):
        return []
    return [str(item) for item in value if isinstance(item, str)][-12:] if isinstance(value, list) else []


def run(output: Path) -> dict[str, Any]:
    history_path = DATA_DIR / "recent-games.json"
    previous = recent_games(history_path)
    games = load_game_catalog()
    review = generate_game_review(
        games,
        recent_game_ids=previous,
        seed=datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC"),
    )
    output = output.resolve()
    output.parent.mkdir(parents=True, exist_ok=True)
    workdir = output.parent / f"{output.stem}-work"
    rendered = render_short(review, output, workdir)
    game = next(item for item in games if item["id"] == review["game_id"])
    scheduled = next_publish_slot()
    metadata = {
        "job_id": str(uuid.uuid4()),
        "game_id": review["game_id"],
        "title": review["title"],
        "description": youtube_description(review) + f"\n\nСтраница игры: {game['public_url']}",
        "tags": ["shorts", "games", "game-review", f"bot-topic:game-review", f"game:{review['game_id']}"],
        "category_id": "20",
        "publish_at": scheduled.isoformat().replace("+00:00", "Z"),
        "idea_score": review["idea_score"],
        "made_for_kids": None,  # The publisher must get an explicit owner setting.
        "video_path": str(output),
    }
    result = {
        "episode_id": output.stem,
        "game_id": review["game_id"],
        "game_title": review["game_title"],
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
    output = Path(sys.argv[1]) if len(sys.argv) > 1 else DATA_DIR / "episodes" / "game-review.mp4"
    try:
        run(output)
    except Exception as exc:
        print(f"Game-review cycle stopped safely: {exc}", file=sys.stderr)
        raise SystemExit(1)
