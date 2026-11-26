"""Minimal screenshot/action bridge to a static HTML game in an isolated container.

No model, YouTube access, game download, live web access or publication is provided.
Use on a dedicated sandbox host: Docker is defense in depth, not a security boundary
for adversarial code. Treat screenshots as untrusted input to any vision model.
"""
from __future__ import annotations

import json
import os
import re
import selectors
import shutil
import subprocess
import time
import uuid
from pathlib import Path

IMAGE = "games-playthrough-2048-experiment:1"
MAX_LINE = 3_000_000


def docker_command(game_dir: Path, container_name: str, entry: str = "index.html", record_dir: Path | None = None,
                   telemetry: str | None = None, bootstrap: str | None = None, voxel_fast: bool = False) -> list[str]:
    game = game_dir.resolve(strict=True)
    if not isinstance(entry, str) or not re.fullmatch(r"(?:[a-zA-Z0-9_-]+/)*index\.html", entry):
        raise ValueError("Invalid game entry path")
    if not game.is_dir() or not (game / entry).is_file():
        raise ValueError("A static game directory with the selected index.html is required")
    if not re.fullmatch(r"games-bridge-[a-f0-9]{32}", container_name):
        raise ValueError("Invalid container name")
    if any(c in str(game) for c in (",", "\n", "\r")):
        raise ValueError("Unsupported mount path")
    # A symlink anywhere in the tree can escape the approved source directory.
    for root, dirs, files in os.walk(game, followlinks=False):
        if any((Path(root) / name).is_symlink() for name in dirs + files):
            raise ValueError("Game directory must not contain symlinks")
    if record_dir is not None:
        if record_dir.is_symlink() or not record_dir.is_dir() or any(record_dir.iterdir()):
            raise ValueError("Recording directory must be a new empty regular directory")
        record = record_dir.resolve(strict=True)
        if any(c in str(record) for c in (",", "\n", "\r")) or record == game or game in record.parents or record in game.parents:
            raise ValueError("Recording directory must be separate from the game")
    if type(voxel_fast) is not bool or (voxel_fast and bootstrap != "voxel"):
        raise ValueError("Fast quality requires voxel setup")
    if bootstrap not in (None, "voxel", "viewport"):
        raise ValueError("Unsupported bootstrap mode")
    if telemetry not in (None, "2048", "voxel", "adventure", "puzzle"):
        raise ValueError("Unsupported telemetry mode")
    command = ["docker", "run", "--rm", "-i", "--name", container_name, "--network", "none", "--read-only",
            "--cap-drop", "ALL", "--security-opt", "no-new-privileges", "--pids-limit", "256",
            "--memory", "2g", "--cpus", "2", "--user", f"{os.getuid()}:{os.getgid()}",
            "--tmpfs", "/tmp:rw,nosuid,nodev,size=512m", "--shm-size", "256m",
            "--mount", f"type=bind,src={game},dst=/game,readonly", "--env", f"BRIDGE_ENTRY={entry}"]
    if record_dir is not None:
        command.extend(["--mount", f"type=bind,src={record},dst=/record", "--env", "BRIDGE_RECORD=1"])
    if telemetry is not None:
        command.extend(["--env", f"BRIDGE_TELEMETRY={telemetry}"])
    if bootstrap == "viewport":
        command.extend(["--env", "BRIDGE_VIEWPORT_RESIZE=1"])
    elif bootstrap == "voxel":
        command.extend(["--env", "BRIDGE_BOOTSTRAP=voxel"])
    if voxel_fast:
        command.extend(["--env", "BRIDGE_VOXEL_FAST=1"])
    return command + ["--entrypoint", "node", IMAGE, "/runner/browser_bridge.cjs"]


class BrowserBridge:
    def __init__(self, game_dir: Path, *, rights_acknowledged: bool = False, entry: str = "index.html", record_dir: Path | None = None,
                 telemetry: str | None = None, bootstrap: str | None = None, voxel_fast: bool = False):
        if not rights_acknowledged:
            raise ValueError("Review game, assets and recording rights before starting")
        if shutil.which("docker") is None:
            raise RuntimeError("Docker is required; never run the game on the host")
        self.name = "games-bridge-" + uuid.uuid4().hex
        command = docker_command(game_dir, self.name, entry, record_dir, telemetry, bootstrap, voxel_fast)
        self.record_dir = record_dir
        self.recording_finalized = False
        self.process = subprocess.Popen(command, stdin=subprocess.PIPE, stdout=subprocess.PIPE,
                                        stderr=subprocess.DEVNULL, bufsize=0)
        self.buffer = b""
        self.started = time.monotonic()

    def receive(self, timeout: float = 30) -> dict:
        if not 0 < timeout <= 180:
            raise ValueError("timeout must be 0..180 seconds")
        deadline = time.monotonic() + timeout
        assert self.process.stdout is not None
        with selectors.DefaultSelector() as selector:
            selector.register(self.process.stdout, selectors.EVENT_READ)
            while b"\n" not in self.buffer:
                if len(self.buffer) > MAX_LINE:
                    raise RuntimeError("Bridge response too large")
                remaining = deadline - time.monotonic()
                if remaining <= 0 or not selector.select(remaining):
                    raise TimeoutError("Bridge did not respond")
                chunk = os.read(self.process.stdout.fileno(), 65536)
                if not chunk:
                    raise RuntimeError("Bridge exited unexpectedly")
                self.buffer += chunk
        line, self.buffer = self.buffer.split(b"\n", 1)
        if len(line) > MAX_LINE:
            raise RuntimeError("Bridge response too large")
        data = json.loads(line)
        if not isinstance(data, dict) or data.get("type") not in ("observation", "error", "recording"):
            raise RuntimeError("Invalid bridge response")
        return data

    def step(self, action: dict) -> dict:
        if time.monotonic() - self.started > 3600:
            raise RuntimeError("Bridge session exceeded one hour")
        message = json.dumps({"type": "step", "action": action}, separators=(",", ":")).encode() + b"\n"
        if len(message) > 4096:
            raise ValueError("Action too large")
        assert self.process.stdin is not None
        self.process.stdin.write(message)
        return self.receive()

    def finish_recording(self) -> Path:
        """Flush a single browser recording; no upload or claim of gameplay success."""
        if self.record_dir is None or self.recording_finalized:
            raise RuntimeError("Recording was not enabled or is already finalized")
        assert self.process.stdin is not None
        self.process.stdin.write(b'{"type":"close"}\n')
        response = self.receive(timeout=60)
        if response.get("type") != "recording" or response.get("filename") != "recording.webm":
            raise RuntimeError("Bridge failed to finalize recording")
        video = self.record_dir / "recording.webm"
        if video.is_symlink() or not video.is_file() or not 1000 <= video.stat().st_size <= 512 * 1024 * 1024:
            raise RuntimeError("Invalid finalized recording")
        self.recording_finalized = True
        return video

    def close(self) -> None:
        # Explicitly remove even if the Docker client exited or a request timed out.
        try:
            subprocess.run(["docker", "rm", "-f", self.name], timeout=15,
                           stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, check=False)
        finally:
            if self.process.poll() is None:
                self.process.kill()
            self.process.wait(timeout=10)
            for stream in (self.process.stdin, self.process.stdout):
                if stream:
                    stream.close()

    def __enter__(self):
        return self

    def __exit__(self, *_args):
        self.close()


def run_agent(game_dir: Path, agent, *, rights_acknowledged: bool = False,
              max_steps: int = 100, entry: str = "index.html", record_dir: Path | None = None):
    """Run a step-synchronous agent, optionally recording a video and its events.

    Recording timestamps are estimates from the browser bridge's monotonic clock,
    not video presentation timestamps. Save the playbook even on an interrupted
    run; emit an event report only after the recording is finalized successfully.
    The final observation at the step limit is not processed as another decision.
    """
    import base64
    import math
    if type(max_steps) is not int or not 1 <= max_steps <= 10000:
        raise ValueError("max_steps must be 1..10000")
    if record_dir is not None:
        record_dir = Path(record_dir)
        if not callable(getattr(agent, "set_recording_offset", None)) or not hasattr(getattr(agent, "stats", None), "events"):
            raise ValueError("recording requires an agent that accepts recording timestamps and exposes events")
    book = getattr(agent, "playbook", None)
    if record_dir is not None and book is not None and book.path is not None:
        record_root = record_dir.resolve()
        book_path = book.path.resolve()
        if book_path == record_root or record_root in book_path.parents:
            raise ValueError("playbook must be outside the recording directory")
    processed = False
    try:
        with BrowserBridge(game_dir, rights_acknowledged=rights_acknowledged, entry=entry,
                           record_dir=record_dir) as bridge:
            start_session = getattr(agent, "start_session", None)
            if callable(start_session):
                start_session()
            event_start = len(agent.stats.events) if record_dir is not None else 0
            observation = bridge.receive()
            steps = 0
            status = "step_limit"
            last_timestamp = -1.0
            while steps < max_steps:
                if observation.get("type") != "observation" or observation.get("step") != steps:
                    raise RuntimeError("Game bridge returned an error or out-of-order frame")
                png = base64.b64decode(observation["screenshot_png_base64"], validate=True)
                if not png.startswith(b"\x89PNG\r\n\x1a\n"):
                    raise ValueError("Invalid screenshot")
                if record_dir is not None:
                    ms = observation.get("recording_capture_ms")
                    if (isinstance(ms, bool) or not isinstance(ms, (int, float))
                            or not math.isfinite(ms) or not last_timestamp <= ms <= 3600000):
                        raise RuntimeError("Bridge did not supply a valid recording timestamp")
                    last_timestamp = ms
                    agent.set_recording_offset(ms / 1000.0)
                processed = True
                action = agent(png, steps)
                if action is None:
                    status = "agent_stopped"
                    break
                if not isinstance(action, dict):
                    raise ValueError("Agent action must be an object or None")
                observation = bridge.step(action)
                steps += 1
                if observation.get("type") != "observation" or observation.get("step") != steps:
                    raise RuntimeError("Game bridge returned an error or out-of-order frame")
            result = {"steps": steps, "status": status, "uploaded": False}
            if record_dir is not None:
                video = bridge.finish_recording()
                result.update({"video": str(video), "events": list(agent.stats.events[event_start:]),
                               "timing": "approximate browser clock relative to page creation; not video PTS"})
                report = record_dir / "events.json"
                with report.open("x", encoding="utf-8") as output:
                    json.dump(result, output, ensure_ascii=False, indent=2)
                result["report"] = str(report)
            return result
    finally:
        if book is not None and processed:
            book.save()
