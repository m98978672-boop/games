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


def docker_command(game_dir: Path, container_name: str, entry: str = "index.html", record_dir: Path | None = None) -> list[str]:
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
    command = ["docker", "run", "--rm", "-i", "--name", container_name, "--network", "none", "--read-only",
            "--cap-drop", "ALL", "--security-opt", "no-new-privileges", "--pids-limit", "256",
            "--memory", "2g", "--cpus", "2", "--user", f"{os.getuid()}:{os.getgid()}",
            "--tmpfs", "/tmp:rw,nosuid,nodev,size=512m", "--shm-size", "256m",
            "--mount", f"type=bind,src={game},dst=/game,readonly", "--env", f"BRIDGE_ENTRY={entry}"]
    if record_dir is not None:
        command.extend(["--mount", f"type=bind,src={record},dst=/record", "--env", "BRIDGE_RECORD=1"])
    return command + ["--entrypoint", "node", IMAGE, "/runner/browser_bridge.cjs"]


class BrowserBridge:
    def __init__(self, game_dir: Path, *, rights_acknowledged: bool = False, entry: str = "index.html", record_dir: Path | None = None):
        if not rights_acknowledged:
            raise ValueError("Review game, assets and recording rights before starting")
        if shutil.which("docker") is None:
            raise RuntimeError("Docker is required; never run the game on the host")
        self.name = "games-bridge-" + uuid.uuid4().hex
        command = docker_command(game_dir, self.name, entry, record_dir)
        self.record_dir = record_dir
        self.recording_finalized = False
        self.process = subprocess.Popen(command, stdin=subprocess.PIPE, stdout=subprocess.PIPE,
                                        stderr=subprocess.DEVNULL, bufsize=0)
        self.buffer = b""
        self.started = time.monotonic()

    def receive(self, timeout: float = 30) -> dict:
        if not 0 < timeout <= 60:
            raise ValueError("timeout must be 0..60 seconds")
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


def run_agent(game_dir: Path, agent, *, rights_acknowledged: bool = False, max_steps: int = 100, entry: str = "index.html"):
    """Call agent(png_bytes, step) outside the container; return None to stop.

    No game-provided text is passed as instructions and no model is supplied.
    The caller must isolate its model, credentials and all untrusted screenshots.
    """
    import base64
    if type(max_steps) is not int or not 1 <= max_steps <= 10000:
        raise ValueError("max_steps must be 1..10000")
    with BrowserBridge(game_dir, rights_acknowledged=rights_acknowledged, entry=entry) as bridge:
        observation = bridge.receive()
        steps = 0
        while steps < max_steps:
            if observation.get("type") != "observation" or observation.get("step") != steps:
                raise RuntimeError("Game bridge returned an error or out-of-order frame")
            png = base64.b64decode(observation["screenshot_png_base64"], validate=True)
            if not png.startswith(b"\x89PNG\r\n\x1a\n"):
                raise ValueError("Invalid screenshot")
            action = agent(png, steps)
            if action is None:
                return {"steps": steps, "status": "agent_stopped", "uploaded": False}
            if not isinstance(action, dict):
                raise ValueError("Agent action must be an object or None")
            observation = bridge.step(action)
            steps += 1
            if observation.get("type") != "observation" or observation.get("step") != steps:
                raise RuntimeError("Game bridge returned an error or out-of-order frame")
        return {"steps": steps, "status": "step_limit", "uploaded": False}
