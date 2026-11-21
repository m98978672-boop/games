"""One autonomous pilot cycle: measure, select, write, render, and optionally queue.

Publishing stays opt-in until the channel owner has explicitly configured both
its audience classification and an ISO-8601 future schedule in environment vars.
"""
from __future__ import annotations

import argparse
import json
import os
import shutil
import sys
import tempfile
import uuid
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Any

from audience import choose_topic
from script_contract import build_prompt, generate_with_qwen, validate_script
from youtube_api import TOPIC_TAG_PREFIX, fetch_topic_metrics

BASE_DIR = Path(__file__).resolve().parent
DATA_DIR = Path(os.getenv("DATA_DIR", str(BASE_DIR / "data"))).resolve()
MEDIA_DIR = DATA_DIR / "media"
TOKEN_FILE = DATA_DIR / "token.json"
SCOPES = [
    "https://www.googleapis.com/auth/youtube.upload",
    "https://www.googleapis.com/auth/youtube.readonly",
    "https://www.googleapis.com/auth/yt-analytics.readonly",
]


def load_youtube_credentials():
    from google.auth.transport.requests import Request
    from google.oauth2.credentials import Credentials

    if not TOKEN_FILE.is_file():
        raise RuntimeError(f"No OAuth token at {TOKEN_FILE}; connect YouTube first.")
    try:
        token_info = json.loads(TOKEN_FILE.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as exc:
        raise RuntimeError("OAuth token file is unreadable; reconnect YouTube.") from exc
    granted = set(token_info.get("scopes", []))
    if not set(SCOPES).issubset(granted):
        raise RuntimeError("OAuth token predates YouTube Analytics consent. Reconnect Google through the local panel.")
    credentials = Credentials.from_authorized_user_file(str(TOKEN_FILE), SCOPES)
    if credentials.expired and credentials.refresh_token:
        credentials.refresh(Request())
        TOKEN_FILE.write_text(credentials.to_json(), encoding="utf-8")
        try:
            TOKEN_FILE.chmod(0o600)
        except OSError:
            pass
    if not credentials.valid:
        raise RuntimeError("OAuth token is invalid or missing permissions; reconnect YouTube.")
    missing = set(SCOPES) - set(credentials.scopes or [])
    if missing:
        raise RuntimeError("YouTube consent needs updating. Reconnect Google OAuth so Analytics read access is granted.")
    return credentials


def _publication_time() -> str:
    raw = os.getenv("AUTOPILOT_PUBLISH_AT", "").strip()
    if not raw:
        raise RuntimeError("AUTOPILOT_AUTO_PUBLISH requires AUTOPILOT_PUBLISH_AT as a future ISO-8601 timestamp.")
    try:
        value = datetime.fromisoformat(raw.replace("Z", "+00:00"))
    except ValueError as exc:
        raise RuntimeError("AUTOPILOT_PUBLISH_AT must be an ISO-8601 timestamp with timezone.") from exc
    if value.tzinfo is None or value < datetime.now(timezone.utc) + timedelta(minutes=15):
        raise RuntimeError("AUTOPILOT_PUBLISH_AT must be at least 15 minutes in the future and include a timezone.")
    return value.astimezone(timezone.utc).isoformat().replace("+00:00", "Z")


def queue_for_scheduled_upload(video_path: Path, script: dict[str, Any], topic_id: str) -> dict[str, Any]:
    """Move rendered file into the existing uploader's private queue atomically."""
    if os.getenv("AUTOPILOT_AUTO_PUBLISH", "false").lower() != "true":
        raise RuntimeError("Automatic upload is not enabled (AUTOPILOT_AUTO_PUBLISH=true required).")
    kids = os.getenv("YOUTUBE_MADE_FOR_KIDS", "").strip().lower()
    if kids not in {"true", "false"}:
        raise RuntimeError("Set YOUTUBE_MADE_FOR_KIDS=true or false explicitly for the channel.")
    publish_at = _publication_time()
    MEDIA_DIR.mkdir(parents=True, exist_ok=True)
    job_id = uuid.uuid4().hex[:12]
    filename = f"{job_id}.mp4"
    destination = MEDIA_DIR / filename
    shutil.copy2(video_path, destination)
    now = datetime.now(timezone.utc).isoformat()
    job = {
        "id": job_id, "title": script["title"][:100],
        "description": f"{script['hook']}\n\nКороткая оригинальная мульт-история.",
        "tags": [TOPIC_TAG_PREFIX + topic_id, "мультфильм", "shorts"],
        "category_id": "24", "publish_at": publish_at,
        "made_for_kids": kids == "true", "filename": filename,
        "original_filename": filename, "size_bytes": destination.stat().st_size,
        "status": "queued", "video_id": None, "watch_url": None, "error": None,
        "created_at": now, "updated_at": now,
    }
    queue_path = DATA_DIR / "queue.json"
    try:
        queue = json.loads(queue_path.read_text(encoding="utf-8")) if queue_path.exists() else []
        if not isinstance(queue, list):
            raise RuntimeError("Uploader queue file is malformed; refusing to overwrite it.")
        queue.append(job)
        temp = queue_path.with_suffix(".tmp")
        temp.write_text(json.dumps(queue, ensure_ascii=False, indent=2), encoding="utf-8")
        temp.replace(queue_path)
        try:
            queue_path.chmod(0o600)
        except OSError:
            pass
    except Exception:
        destination.unlink(missing_ok=True)
        raise
    return job


def render_demo(output: Path) -> dict[str, Any]:
    """Create a short local demo without OAuth, model downloads, or audio binaries."""
    from renderer import render_silent_short

    script = validate_script({
        "schema_version": 1,
        "topic_id": "animal-comedy",
        "title": "Кто спрятал луну?",
        "hook": "Кролик нашёл коробку, из которой светилась луна!",
        "scenes": [
            {"speaker": "Кролик Лёва", "dialogue": "Я нашёл луну в коробке! Но как она туда поместилась?", "visual": "Кролик приоткрывает коробку, и серебряный свет заливает поляну.", "emotion": "surprised"},
            {"speaker": "Сова Мира", "dialogue": "Погоди, Лёва. Почему луна отражается ещё и у твоих лап?", "visual": "Сова замечает круглое отражение в маленькой луже рядом.", "emotion": "curious"},
            {"speaker": "Кролик Лёва", "dialogue": "Это фонарик! А настоящая луна всё это время была над нами!", "visual": "Друзья смеются: в коробке лежал фонарик, направленный в лужу.", "emotion": "happy"},
        ],
    }, expected_topic_id="animal-comedy")
    output.parent.mkdir(parents=True, exist_ok=True)
    script_path = output.with_suffix(".json")
    script_path.write_text(json.dumps(script, ensure_ascii=False, indent=2), encoding="utf-8")
    with tempfile.TemporaryDirectory(prefix="youtube-short-render-") as temporary:
        result = render_silent_short(script, output, Path(temporary))
    result.update({"script_path": str(script_path), "status": "demo_rendered_no_audio_no_upload"})
    return result


def run_once(*, auto_publish: bool | None = None) -> dict[str, Any]:
    credentials = load_youtube_credentials()
    metrics = fetch_topic_metrics(credentials)
    topic_id, topic_name = choose_topic(metrics)
    evidence = metrics.get(topic_id)
    if evidence and evidence.views:
        retention = min(100.0, evidence.watch_seconds / max(evidence.video_seconds, 1.0) * 100)
        engagement = (evidence.likes + evidence.comments) / evidence.views * 100
        audience_summary = (
            f"Агрегаты темы: {evidence.videos} роликов, {evidence.views} просмотров, "
            f"удержание примерно {retention:.0f}%, реакций (лайки и комментарии) {engagement:.1f}% просмотров, "
            f"прирост подписчиков {evidence.subscribers_gained}. Используй это только как общий сигнал."
        )
    else:
        audience_summary = "По выбранной теме данных пока нет; это исследовательский пилот."
    messages = build_prompt(topic_id, topic_name, audience_summary=audience_summary)
    raw_script = generate_with_qwen(messages)
    script = validate_script(raw_script, expected_topic_id=topic_id)

    episode_id = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ") + "-" + uuid.uuid4().hex[:6]
    episode_dir = DATA_DIR / "episodes" / episode_id
    episode_dir.mkdir(parents=True, exist_ok=False)
    script_path = episode_dir / "script.json"
    script_path.write_text(json.dumps(script, ensure_ascii=False, indent=2), encoding="utf-8")
    from renderer import render_short

    rendered = render_short(script, episode_dir / "short.mp4", episode_dir / "render-work")
    result: dict[str, Any] = {
        "episode_id": episode_id, "topic_id": topic_id,
        "script_path": str(script_path), "video_path": rendered["path"],
        "duration_seconds": rendered["duration_seconds"], "status": "rendered_review_required",
    }
    should_publish = auto_publish if auto_publish is not None else os.getenv("AUTOPILOT_AUTO_PUBLISH", "false").lower() == "true"
    if should_publish:
        result["job"] = queue_for_scheduled_upload(Path(rendered["path"]), script, topic_id)
        result["status"] = "queued_for_scheduled_upload"
    result_path = episode_dir / "result.json"
    result_path.write_text(json.dumps(result, ensure_ascii=False, indent=2), encoding="utf-8")
    return result


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Run one YouTube Shorts autopilot cycle.")
    parser.add_argument("--demo", action="store_true", help="Render a built-in sample Short without OAuth or Qwen.")
    parser.add_argument("--output", type=Path, default=DATA_DIR / "episodes" / "demo-short.mp4", help="Demo MP4 output path.")
    args = parser.parse_args()
    try:
        result = render_demo(args.output) if args.demo else run_once()
        print(json.dumps(result, ensure_ascii=False, indent=2))
    except Exception as exc:
        print(f"Autopilot stopped safely: {exc}", file=sys.stderr)
        raise SystemExit(1)
