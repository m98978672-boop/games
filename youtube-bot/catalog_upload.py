"""Build a publish result for a ready-made catalog video.

The review autopilot renders a Steam-sourced episode and then hands a result
JSON to ``publish_to_supabase.py``. This module does the same for an existing
MP4 that already lives in the repository (for example the Boris animated
series). It deliberately reuses the review publisher's metadata contract so a
catalog upload gets the same slot reservation, resumable upload, owner-chosen
audience flag and completion confirmation as a generated review.

The script never uploads anything itself. It only validates the inputs and
writes the result JSON that the already-authorized GitHub Actions workflow
passes to ``publish_to_supabase.py``.
"""
from __future__ import annotations

import argparse
import json
import re
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Iterable

from schedule_policy import manual_publish_time

MAX_TITLE = 100
MAX_DESCRIPTION = 5000
MAX_TAGS = 30
MAX_TAG_LENGTH = 100
MAX_VIDEO_BYTES = 512 * 1024 * 1024
MIN_VIDEO_BYTES = 1024


def slugify_game_id(value: str) -> str:
    """Return a stable lowercase ID accepted by the publisher (1-60 chars)."""
    slug = re.sub(r"[^a-z0-9-]+", "-", str(value or "").strip().lower()).strip("-")
    slug = re.sub(r"-{2,}", "-", slug)[:60].strip("-")
    return slug or "catalog-video"


def parse_tags(value: str | Iterable[str]) -> list[str]:
    raw = value.split(",") if isinstance(value, str) else list(value)
    tags: list[str] = []
    for item in raw:
        tag = str(item).strip()
        if not tag or tag in tags:
            continue
        if len(tag) > MAX_TAG_LENGTH:
            raise ValueError(f"Tag is longer than {MAX_TAG_LENGTH} characters.")
        tags.append(tag)
    if len(tags) > MAX_TAGS:
        raise ValueError(f"At most {MAX_TAGS} tags are allowed.")
    return tags


def _video_path(value: str, root: Path) -> Path:
    path = Path(value).expanduser()
    if not path.is_absolute():
        path = (root / path).resolve()
    path = path.resolve()
    try:
        path.relative_to(root.resolve())
    except ValueError as exc:
        raise ValueError("Catalog video must live inside the repository checkout.") from exc
    if not path.is_file():
        raise ValueError(f"Catalog video does not exist: {path}")
    size = path.stat().st_size
    if size < MIN_VIDEO_BYTES or size > MAX_VIDEO_BYTES:
        raise ValueError(f"Catalog video must be 1 KiB-512 MiB; got {size} bytes.")
    return path


def build_metadata(
    *,
    video: str,
    title: str,
    description: str = "",
    tags: str | Iterable[str] = "",
    category_id: str,
    publish_at: str,
    game_id: str,
    video_format: str,
    root: Path,
    now: datetime | None = None,
) -> dict[str, Any]:
    """Validate catalog inputs and return the publisher metadata object."""
    if video_format not in {"short", "long"}:
        raise ValueError("video_format must be short or long")
    clean_title = str(title or "").strip()
    if not clean_title or len(clean_title) > MAX_TITLE:
        raise ValueError(f"Title is required and must be at most {MAX_TITLE} characters.")
    clean_description = str(description or "").strip()
    if len(clean_description) > MAX_DESCRIPTION:
        raise ValueError(f"Description must be at most {MAX_DESCRIPTION} characters.")
    clean_tags = parse_tags(tags)
    if not str(category_id).isdigit():
        raise ValueError("category_id must contain digits only.")
    scheduled = manual_publish_time(publish_at, now=now)
    path = _video_path(video, root)
    publish_iso = scheduled.astimezone(timezone.utc).isoformat().replace("+00:00", "Z")
    return {
        "job_id": str(uuid.uuid4()),
        "game_id": slugify_game_id(game_id),
        "title": clean_title,
        "description": clean_description,
        "tags": clean_tags,
        "category_id": str(category_id),
        "publish_at": publish_iso,
        "video_format": video_format,
        "requested_publish_at": publish_iso,
        "manual_time_adjusted": False,
        "idea_score": 0,
        "made_for_kids": None,  # The publisher requires the owner's explicit true/false setting.
        "video_path": str(path),
    }


def write_result(metadata: dict[str, Any], output: Path) -> dict[str, Any]:
    result = {
        "episode_id": metadata["game_id"],
        "game_id": metadata["game_id"],
        "format": metadata["video_format"],
        "metadata": metadata,
        "status": "catalog_ready_for_upload",
    }
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(json.dumps(result, ensure_ascii=False, indent=2), encoding="utf-8")
    return result


def main() -> None:
    parser = argparse.ArgumentParser(description="Prepare a ready-made catalog video for the YouTube publisher.")
    parser.add_argument("--video", required=True, help="Repository path to the MP4.")
    parser.add_argument("--title", required=True)
    parser.add_argument("--description", default="")
    parser.add_argument("--tags", default="", help="Comma-separated YouTube tags.")
    parser.add_argument("--category-id", default="24")
    parser.add_argument("--publish-at", required=True, help="Moscow time YYYY-MM-DD HH:MM.")
    parser.add_argument("--game-id", default="catalog-video")
    parser.add_argument("--format", choices=("short", "long"), required=True)
    parser.add_argument("--output", required=True, type=Path)
    parser.add_argument("--root", type=Path, default=Path.cwd())
    args = parser.parse_args()

    metadata = build_metadata(
        video=args.video,
        title=args.title,
        description=args.description,
        tags=args.tags,
        category_id=args.category_id,
        publish_at=args.publish_at,
        game_id=args.game_id,
        video_format=args.format,
        root=args.root,
    )
    result = write_result(metadata, args.output)
    # Print only non-secret publish metadata. The access token never reaches this script.
    print(json.dumps({
        "status": result["status"],
        "game_id": metadata["game_id"],
        "title": metadata["title"],
        "format": metadata["video_format"],
        "publish_at": metadata["publish_at"],
        "video_bytes": Path(metadata["video_path"]).stat().st_size,
        "output": str(args.output),
    }, ensure_ascii=False))


if __name__ == "__main__":
    main()
