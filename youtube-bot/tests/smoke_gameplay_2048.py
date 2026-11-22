"""Actual private browser capture smoke test; no OAuth, uploads or retained video."""
import json
from array import array
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
    assert set(report["training"]["parameters"]) == {"emptyWeight", "positionalWeight"}, report
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
    # Validate a separately narrated recap using actual recorded gameplay.
    subprocess.run([sys.executable, str(Path(__file__).resolve().parents[1] / "gameplay_finalize.py"), str(output)], check=True, timeout=180)
    final = json.loads((output / "final-report.json").read_text())
    assert final["uploaded"] is False and final["capture_seconds"] >= 10
    assert final["commentary_clips"] >= 1, final
    movie = output / final["video"]
    streams = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "stream=codec_type", "-of", "json", str(movie)], check=True, capture_output=True, text=True)
    kinds = {item["codec_type"] for item in json.loads(streams.stdout)["streams"]}
    assert {"audio", "video"} <= kinds, kinds
    # Inspect only the original gameplay interval, excluding the spoken outro.
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", str(movie), "-t", str(final["capture_seconds"]),
                          "-vn", "-ac", "1", "-ar", "8000", "-f", "s16le", "-"],
                         check=True, capture_output=True, timeout=30).stdout
    samples = array("h")
    samples.frombytes(raw)
    assert samples and max(abs(value) for value in samples) > 100, "Gameplay interval has no audible commentary"
    print("Narrated gameplay and recap smoke passed:", json.dumps(final))
