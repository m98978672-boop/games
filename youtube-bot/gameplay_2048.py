"""Prepare and run a sandboxed, non-publishing 2048 recording experiment.

Requires Docker on the host. This experiment is game-specific, uses a simple
heuristic rather than a trained general AI, and does not pad short runs, supply
voice/audio, prove recording rights, or upload anything.
"""
from __future__ import annotations

import argparse
import hashlib
import io
import json
import os
import re
import shutil
import subprocess
import tarfile
import tempfile
import urllib.request
import uuid
from pathlib import Path, PurePosixPath

ROOT = Path(__file__).resolve().parent
DATA = ROOT / "data" / "gameplay-2048"
COMMIT = "478b6ec346e3787f589e4af751378d06ded4cbbc"
ARCHIVE_SHA256 = "4f3e35b3b9124c5a5c16231b71684288d8d781c2d534754f6b36119336231e2e"
URL = f"https://codeload.github.com/gabrielecirulli/2048/tar.gz/{COMMIT}"
PREFIX = f"2048-{COMMIT}"
MAX_ARCHIVE = 10_000_000
MAX_UNPACKED = 20_000_000
IMAGE = "games-playthrough-2048-experiment:1"
ALLOWED_EXTENSIONS = {".html", ".js", ".css", ".png", ".woff", ".svg", ".ico", ".txt", ".md"}


def unpack_archive(data: bytes, destination: Path) -> int:
    """Extract only expected regular assets after a pinned archive hash check."""
    if len(data) > MAX_ARCHIVE or hashlib.sha256(data).hexdigest() != ARCHIVE_SHA256:
        raise ValueError("Archive size or SHA-256 does not match the pinned source.")
    if destination.exists() and any(destination.iterdir()):
        raise ValueError("Extraction destination must be empty.")
    destination.mkdir(parents=True, exist_ok=True)
    total = count = 0
    with tarfile.open(fileobj=io.BytesIO(data), mode="r:gz") as archive:
        members = archive.getmembers()
        if len(members) > 500:
            raise ValueError("Too many archive entries.")
        for member in members:
            parts = PurePosixPath(member.name).parts
            if not parts or parts[0] != PREFIX or any(p in ("..", ".") for p in parts):
                raise ValueError("Unsafe archive path.")
            if member.isdir():
                continue
            if not member.isfile():
                raise ValueError("Archive links and special files are prohibited.")
            rel = PurePosixPath(*parts[1:])
            if rel.suffix.lower() not in ALLOWED_EXTENSIONS:
                continue
            total += member.size
            if member.size > 5_000_000 or total > MAX_UNPACKED:
                raise ValueError("Archive exceeds extraction limit.")
            source = archive.extractfile(member)
            if source is None:
                raise ValueError("Archive member could not be read.")
            target = destination.joinpath(*rel.parts)
            target.parent.mkdir(parents=True, exist_ok=True)
            with target.open("xb") as out:
                shutil.copyfileobj(source, out, length=64 * 1024)
            count += 1
    if not (destination / "index.html").is_file() or not (destination / "js" / "game_manager.js").is_file():
        raise ValueError("Required 2048 game files are missing.")
    return count


def download_archive() -> bytes:
    request = urllib.request.Request(URL, headers={"User-Agent": "GamesGameplayExperiment/1.0"})
    with urllib.request.urlopen(request, timeout=30) as response:
        if response.geturl() != URL:
            raise ValueError("Unexpected archive redirect.")
        data = response.read(MAX_ARCHIVE + 1)
    if len(data) > MAX_ARCHIVE:
        raise ValueError("Archive too large.")
    return data


def docker_command(game_dir: Path, output_dir: Path, seconds: int, *, container_name: str) -> list[str]:
    if not 1 <= seconds <= 3600:
        raise ValueError("Duration must be between 1 and 3600 seconds.")
    if not re.fullmatch(r"games-playthrough-[a-f0-9]{32}", container_name):
        raise ValueError("Invalid container name.")
    game = game_dir.resolve(strict=True)
    output = output_dir.resolve(strict=True)
    if not game.is_dir() or not output.is_dir() or game == output or game in output.parents or output in game.parents:
        raise ValueError("Game and output must be separate directories.")
    # --mount fails rather than creating paths. Only the pinned source and an
    # isolated output directory are shared, never the workspace, home or tokens.
    if any("," in str(p) or "\n" in str(p) for p in (game, output)):
        raise ValueError("Unsupported mount path.")
    return [
        "docker", "run", "--rm", "--name", container_name, "--network", "none", "--read-only", "--cap-drop", "ALL",
        "--security-opt", "no-new-privileges", "--pids-limit", "256", "--memory", "2g",
        "--cpus", "2", "--user", f"{os.getuid()}:{os.getgid()}",
        "--tmpfs", "/tmp:rw,nosuid,nodev,size=512m", "--shm-size", "256m",
        "--mount", f"type=bind,src={game},dst=/game,readonly",
        "--mount", f"type=bind,src={output},dst=/output",
        "--env", f"GAMEPLAY_SECONDS={seconds}", IMAGE,
    ]


def main() -> None:
    parser = argparse.ArgumentParser(description="Run an experimental, silent 2048 capture; no publication.")
    parser.add_argument("--acknowledge-rights", action="store_true", help="Confirm that code and asset recording rights have been checked")
    parser.add_argument("--seconds", type=int, default=60, help="Experiment length: 1..3600 seconds (default 60)")
    args = parser.parse_args()
    if not args.acknowledge_rights:
        parser.error("Review rights and game safety first, then pass --acknowledge-rights.")
    if not 1 <= args.seconds <= 3600:
        parser.error("--seconds must be between 1 and 3600")
    if shutil.which("docker") is None:
        parser.error("Docker is required; refusing to run the downloaded game on the host.")
    DATA.mkdir(parents=True, exist_ok=True, mode=0o700)
    # Unique private directory; never clobber an older recording or state.
    work = Path(tempfile.mkdtemp(prefix="run-", dir=DATA))
    work.chmod(0o700)
    game, output = work / "game", work / "output"
    output.mkdir(mode=0o700)
    unpack_archive(download_archive(), game)
    manifest = {"repository": "https://github.com/gabrielecirulli/2048", "commit": COMMIT,
                "archive_sha256": ARCHIVE_SHA256, "rights_confirmation": "operator-asserted"}
    (work / "source.json").write_text(json.dumps(manifest, indent=2), encoding="utf-8")
    subprocess.run(["docker", "build", "-t", IMAGE, str(ROOT / "gameplay")], check=True)
    container_name = "games-playthrough-" + uuid.uuid4().hex
    try:
        result = subprocess.run(docker_command(game, output, args.seconds, container_name=container_name), check=False, timeout=args.seconds + 120)
    finally:
        # Killing the Docker CLI alone does not necessarily stop its container.
        subprocess.run(["docker", "rm", "-f", container_name], check=False, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, timeout=30)
    print(f"Experiment directory: {work}. No video was uploaded.")
    if result.returncode:
        raise SystemExit(result.returncode)
    if not (output / "report.json").is_file():
        raise SystemExit("No recording report was produced; do not publish.")
    report = json.loads((output / "report.json").read_text(encoding="utf-8"))
    video = report.get("video")
    if not isinstance(video, str) or not re.fullmatch(r"[A-Za-z0-9_-]+\.webm", video) or not (output / video).is_file():
        raise SystemExit("No valid local video was produced; do not publish.")
    print(json.dumps(report, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
