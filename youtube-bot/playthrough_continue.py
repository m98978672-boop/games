"""One-host opt-in continuation from a saved 2048 state, never an upload.

The operator must associate the video with the correct save, have approved the
source rights, and use one durable local database. An uncertain attempt is not
retried automatically, even after failure or restart.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import os
import sqlite3
import shutil
import tempfile
import subprocess
import sys
from pathlib import Path
from datetime import datetime, timezone
from typing import Any

from comment_assistant import DATA, _youtube
from gameplay_2048 import ARCHIVE_SHA256, COMMIT, DATA as GAME_DATA, validate_resume_state
from gameplay_schedule import gameplay_is_due
from playthrough_feedback_youtube import assess_video

LEDGER = DATA / "gameplay-continuations.sqlite3"
GAME_TAG = "bot-topic:gameplay-2048"


def validated_save(path: Path) -> bytes:
    if path.is_symlink() or not path.is_file() or path.name != "gameState.json" or path.parent.name != "output":
        raise ValueError("Resume must be output/gameState.json from the pinned capture")
    source = path.parent.parent / "source.json"
    if source.is_symlink() or not source.is_file() or source.stat().st_size > 10_000:
        raise ValueError("Missing pinned capture source manifest")
    manifest = json.loads(source.read_text(encoding="utf-8"))
    if manifest.get("commit") != COMMIT or manifest.get("archive_sha256") != ARCHIVE_SHA256:
        raise ValueError("Save belongs to a different game or source")
    if manifest.get("rights_confirmation") != "operator-asserted":
        raise ValueError("Source rights were not acknowledged")
    with path.open("rb") as file:
        data = file.read(100_001)
    validate_resume_state(data)
    return data


def reserve(ledger: Path, video_id: str, save_digest: str) -> bool:
    ledger.parent.mkdir(parents=True, exist_ok=True, mode=0o700)
    with sqlite3.connect(ledger, timeout=30) as db:
        os.chmod(ledger, 0o600)
        db.execute("CREATE TABLE IF NOT EXISTS continuations (video_id TEXT PRIMARY KEY, save_hash TEXT NOT NULL UNIQUE, state TEXT NOT NULL)")
        try:
            db.execute("INSERT INTO continuations (video_id,save_hash,state) VALUES (?,?,'started')", (video_id, save_digest))
            db.commit()
        except sqlite3.IntegrityError:
            return False
    return True


def maybe_continue(youtube: Any, *, video_id: str, state: Path, ledger: Path = LEDGER, seconds: int = 3600) -> str:
    if not 10 <= seconds <= 3600:
        raise ValueError("seconds must be between 10 and 3600")
    data = validated_save(state)
    feedback = assess_video(youtube, video_id, required_tag=GAME_TAG)
    if feedback.get("decision") != "continue":
        return "wait"
    if shutil.which("docker") is None:
        raise RuntimeError("Docker is required before reserving a continuation")
    if not reserve(ledger, video_id, hashlib.sha256(data).hexdigest()):
        return "already_attempted"
    # The Docker command mounts the source and a separate output only, never
    # the OAuth token or parent process environment as container env vars.
    # No retry on timeout, crash or nonzero status: outcome is ambiguous.
    with tempfile.TemporaryDirectory(prefix="resume-", dir=ledger.parent) as temp:
        snapshot = Path(temp) / "gameState.json"
        snapshot.write_bytes(data)
        snapshot.chmod(0o600)
        result_file = Path(temp) / "result.json"
        subprocess.run([sys.executable, str(Path(__file__).with_name("gameplay_2048.py")),
                        "--acknowledge-rights", "--resume", str(snapshot), "--seconds", str(seconds),
                        "--result-path", str(result_file)], check=True, timeout=seconds + 1200)
        result = json.loads(result_file.read_text(encoding="utf-8"))
        work_dir = Path(result["work_dir"]).resolve(strict=True)
        if not work_dir.is_relative_to(GAME_DATA.resolve()) or not work_dir.name.startswith("run-"):
            raise RuntimeError("Unexpected capture location; refusing finalization")
        subprocess.run([sys.executable, str(Path(__file__).with_name("gameplay_finalize.py")), str(work_dir / "output")],
                       check=True, timeout=1800)
    return "captured_not_uploaded"


def main() -> None:
    parser = argparse.ArgumentParser(description="Resume one tagged owned 2048 episode after positive feedback; never uploads.")
    parser.add_argument("video_id", help="Public first-episode ID; must have bot-topic:gameplay-2048 tag")
    parser.add_argument("state", type=Path, help="gameState.json belonging to that exact episode")
    parser.add_argument("--acknowledge-rights", action="store_true", required=True)
    parser.add_argument("--enable-continuation", action="store_true", required=True)
    parser.add_argument("--seconds", type=int, default=3600)
    parser.add_argument("--schedule", action="store_true", help="Skip non-due Moscow calendar days")
    args = parser.parse_args()
    if args.schedule and not gameplay_is_due(datetime.now(timezone.utc)):
        print(json.dumps({"status": "not_due"}))
        return
    print(json.dumps({"status": maybe_continue(_youtube(), video_id=args.video_id, state=args.state, seconds=args.seconds)}))


if __name__ == "__main__":
    main()
