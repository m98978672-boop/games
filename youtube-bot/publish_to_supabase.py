"""Upload a generated Short to the protected Supabase publisher using GitHub OIDC."""
from __future__ import annotations

import json
import os
import sys
import urllib.error
import urllib.parse
import urllib.request
import uuid
from pathlib import Path
from typing import Any

PUBLISH_URL = "https://cuhfnzgytndyntpbnbda.supabase.co/functions/v1/youtube-bot/autopilot/publish"
MAX_VIDEO_BYTES = 5 * 1024 * 1024


def github_oidc_token() -> str:
    supplied = os.environ.get("GITHUB_OIDC_TOKEN", "")
    if supplied:
        print(f"::add-mask::{supplied}")
        return supplied
    request_url = os.environ.get("ACTIONS_ID_TOKEN_REQUEST_URL", "")
    request_token = os.environ.get("ACTIONS_ID_TOKEN_REQUEST_TOKEN", "")
    if not request_url or not request_token:
        raise RuntimeError("GitHub Actions OIDC is unavailable; refusing unauthenticated publish.")
    separator = "&" if "?" in request_url else "?"
    url = request_url + separator + urllib.parse.urlencode({"audience": "youtube-bot"})
    request = urllib.request.Request(url, headers={"Authorization": f"Bearer {request_token}"})
    try:
        with urllib.request.urlopen(request, timeout=20) as response:
            payload = json.loads(response.read().decode("utf-8"))
    except Exception as exc:
        raise RuntimeError("Could not obtain a GitHub OIDC identity token.") from exc
    token = payload.get("value")
    if not isinstance(token, str) or len(token) < 100:
        raise RuntimeError("GitHub returned an invalid OIDC token.")
    print(f"::add-mask::{token}")
    return token


def _multipart(metadata: dict[str, Any], video_path: Path) -> tuple[bytes, str]:
    data = video_path.read_bytes()
    if len(data) < 1024 or len(data) > MAX_VIDEO_BYTES:
        raise RuntimeError(f"Rendered video must be 1 KiB–5 MiB for this Edge upload; got {len(data)} bytes.")
    boundary = "----GamesShorts" + uuid.uuid4().hex
    parts = [
        f"--{boundary}\r\nContent-Disposition: form-data; name=\"metadata\"\r\nContent-Type: application/json; charset=utf-8\r\n\r\n".encode(),
        json.dumps(metadata, ensure_ascii=False, separators=(",", ":")).encode("utf-8"),
        f"\r\n--{boundary}\r\nContent-Disposition: form-data; name=\"video\"; filename=\"review.mp4\"\r\nContent-Type: video/mp4\r\n\r\n".encode(),
        data,
        f"\r\n--{boundary}--\r\n".encode(),
    ]
    return b"".join(parts), boundary


def publish(result_path: Path) -> dict[str, Any]:
    result = json.loads(result_path.read_text(encoding="utf-8"))
    metadata = dict(result.get("metadata", {}))
    video_path = Path(metadata.pop("video_path", ""))
    made_for_kids = os.environ.get("YOUTUBE_MADE_FOR_KIDS", "").strip().lower()
    if made_for_kids not in {"true", "false"}:
        raise RuntimeError(
            "Autopublish is paused: set the repository variable YOUTUBE_MADE_FOR_KIDS to true or false explicitly."
        )
    metadata["made_for_kids"] = made_for_kids == "true"
    if not video_path.is_file():
        raise RuntimeError("Rendered video file is missing.")
    body, boundary = _multipart(metadata, video_path)
    request = urllib.request.Request(
        PUBLISH_URL,
        data=body,
        headers={
            "Authorization": f"Bearer {github_oidc_token()}",
            "Content-Type": f"multipart/form-data; boundary={boundary}",
        },
        method="POST",
    )
    try:
        with urllib.request.urlopen(request, timeout=180) as response:
            payload = json.loads(response.read().decode("utf-8"))
    except urllib.error.HTTPError as exc:
        message = exc.read().decode("utf-8", errors="replace")[:700]
        raise RuntimeError(f"Supabase publisher returned HTTP {exc.code}: {message}") from exc
    except Exception as exc:
        raise RuntimeError("Could not reach the Supabase YouTube publisher.") from exc
    if payload.get("status") != "scheduled" or not payload.get("video_id"):
        raise RuntimeError("Supabase did not confirm the scheduled YouTube video.")
    print(json.dumps({
        "status": payload["status"],
        "game_id": metadata.get("game_id"),
        "publish_at": metadata.get("publish_at"),
        "video_id": payload["video_id"],
        "watch_url": payload.get("watch_url"),
    }, ensure_ascii=False))

    # Persist model's recent-game memory in the Actions cache only after the
    # server confirms the upload was scheduled.
    history_path = Path(os.getenv("DATA_DIR", "data")) / "recent-games.json"
    history_path.parent.mkdir(parents=True, exist_ok=True)
    try:
        history = json.loads(history_path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError):
        history = []
    if not isinstance(history, list):
        history = []
    game_id = metadata.get("game_id")
    if isinstance(game_id, str):
        history.append(game_id)
    history_path.write_text(json.dumps(history[-12:], ensure_ascii=False), encoding="utf-8")
    return payload


if __name__ == "__main__":
    if len(sys.argv) != 2:
        raise SystemExit("Usage: python publish_to_supabase.py path/to/review.result.json")
    try:
        publish(Path(sys.argv[1]))
    except Exception as exc:
        print(f"Safe publish stop: {exc}", file=sys.stderr)
        raise SystemExit(1)
