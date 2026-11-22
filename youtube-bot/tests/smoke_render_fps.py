"""Real FFmpeg regression: AAC-padded chapters must yield continuous 50 fps."""
import json
import subprocess
import sys
import tempfile
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from renderer import concat_long_segments, verify_video_profile

with tempfile.TemporaryDirectory(prefix="fps-smoke-") as temp:
    root = Path(temp)
    parts = []
    for index, color in enumerate(("red", "blue", "green")):
        segment = root / f"chapter-{index}.mp4"
        subprocess.run([
            "ffmpeg", "-v", "error", "-y", "-f", "lavfi", "-i", f"color={color}:size=1920x1080:rate=50",
            "-f", "lavfi", "-i", "sine=frequency=440:sample_rate=44100", "-t", "1.137",
            "-c:v", "libx264", "-preset", "ultrafast", "-pix_fmt", "yuv420p", "-r", "50", "-fps_mode", "cfr",
            "-c:a", "aac", str(segment),
        ], check=True, timeout=60)
        parts.append(segment)
    output = root / "result.mp4"
    concat_long_segments("ffmpeg", parts, output, root)
    profile = verify_video_profile(output)
    assert profile["fps"] == 50.0 and profile["width"] == 1920 and profile["height"] == 1080, profile
    result = subprocess.run([
        "ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries",
        "frame=best_effort_timestamp_time", "-of", "json", str(output),
    ], check=True, capture_output=True, text=True)
    frames = json.loads(result.stdout)["frames"]
    timestamps = [float(frame["best_effort_timestamp_time"]) for frame in frames]
    assert len(timestamps) > 100
    assert all(abs((b-a) - 0.02) < 0.00001 for a, b in zip(timestamps, timestamps[1:])), "non-CFR timestamps"
    audio = subprocess.run(["ffprobe", "-v", "error", "-select_streams", "a:0", "-show_entries", "stream=codec_type", "-of", "json", str(output)],
                           check=True, capture_output=True, text=True)
    assert json.loads(audio.stdout)["streams"], "audio stream missing"
    print("Real FFmpeg 50-fps concatenation and audio smoke passed:", profile, len(timestamps), "frames")
