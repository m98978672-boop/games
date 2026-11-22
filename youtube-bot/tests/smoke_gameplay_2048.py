"""Actual private browser capture smoke test; no OAuth, uploads or retained video."""
import json
import subprocess
import sys
import tempfile
import uuid
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
import gameplay_2048 as game

with tempfile.TemporaryDirectory(prefix="gameplay-smoke-") as temp:
    work = Path(temp)
    source, output = work / "game", work / "output"
    output.mkdir()
    game.unpack_archive(game.download_archive(), source)
    name = "games-playthrough-" + uuid.uuid4().hex
    try:
        subprocess.run(game.docker_command(source, output, 12, container_name=name), check=True, timeout=120)
    finally:
        subprocess.run(["docker", "rm", "-f", name], check=False, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    report = json.loads((output / "report.json").read_text())
    assert report["moves"] > 0 and report["elapsed_seconds"] >= 10, report
    assert report["outcome"] == "time_limit" and report["uploaded"] is False, report
    video = output / Path(report["video"]).name
    assert video.is_file() and video.stat().st_size > 1000
    probe = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "json", str(video)],
                           check=True, capture_output=True, text=True)
    seconds = float(json.loads(probe.stdout)["format"]["duration"])
    assert 9 <= seconds <= 40, seconds
    state = json.loads((output / "gameState.json").read_text())
    assert state["grid"]["size"] == 4 and state["score"] > 0, state
    print("Gameplay smoke passed; actual video duration:", seconds, "report:", json.dumps(report))

    # A second isolated browser must load the exact saved score and make moves.
    resumed_output = work / "resumed-output"
    resumed_output.mkdir()
    saved = game.validate_resume_state((output / "gameState.json").read_bytes())
    (resumed_output / "resume.json").write_text(json.dumps(saved))
    name = "games-playthrough-" + uuid.uuid4().hex
    try:
        subprocess.run(game.docker_command(source, resumed_output, 5, container_name=name), check=True, timeout=120)
    finally:
        subprocess.run(["docker", "rm", "-f", name], check=False, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    resumed = json.loads((resumed_output / "report.json").read_text())
    assert resumed["resumed"] is True and resumed["initial_score"] == saved["score"] and resumed["moves"] > 0, resumed
    print("Resume smoke passed:", json.dumps(resumed))
