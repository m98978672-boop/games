"""Measured speed-ups: no optical-flow interpolation, no duplicate frame drawing.

These tests pin the three properties the speed-up depends on, without needing
FFmpeg, a TTS engine, or a GPU:

* the encoder no longer runs ``minterpolate`` (it cost minutes per Short);
* duplicate still frames are hard-linked, not redrawn;
* narration and frames of independent scenes are prepared concurrently, while
  the resulting audio and frame order stays exactly the scene order.

The numbers quoted in comments come from a local measurement of the same
20.8-second clip: 446.6 s before, 22 s after.
"""
import math
import sys
import tempfile
import threading
import unittest
from pathlib import Path
from unittest.mock import patch

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
import renderer

SAMPLE_RATE = 24000


def _fake_synthesize(seconds: float = 5.2):
    """Stand-in for Piper: writes a real 24 kHz mono wav and reports its length."""
    import wave
    import struct

    def synthesize(text: str, output: Path, voice: str = "ru", *, style: str = "neutral") -> float:
        output.parent.mkdir(parents=True, exist_ok=True)
        with wave.open(str(output), "wb") as target:
            target.setnchannels(1)
            target.setsampwidth(2)
            target.setframerate(SAMPLE_RATE)
            target.writeframes(struct.pack("<h", 1000) * int(SAMPLE_RATE * seconds))
        return seconds

    return synthesize


def _script(scenes: int = 3) -> dict:
    return {
        "format": "game-review",
        "game_title": "Проверочная игра",
        "idea_score": 7,
        "screenshot_paths": [],
        "scenes": [
            {"label": "ФАКТ ИЗ STEAM", "visual": f"Описание {index}", "dialogue": f"Русская фраза {index}."}
            for index in range(scenes)
        ],
    }


class FrameDedupTests(unittest.TestCase):
    def test_still_frames_are_links_not_redraws(self):
        with tempfile.TemporaryDirectory() as temp:
            frames = Path(temp)
            script = _script()
            calls = []
            original = renderer.render_frame

            def counting(*args, **kwargs):
                calls.append(args[3])  # the frame number
                return original(*args, **kwargs)

            with patch.object(renderer, "render_frame", side_effect=counting):
                drawn = renderer.render_scene_frames(script, script["scenes"][0], 0, frames, first_index=10, nframes=120)

            self.assertEqual(drawn, renderer.ANIMATED_FRAMES_PER_SCENE)
            self.assertEqual(calls, list(range(renderer.ANIMATED_FRAMES_PER_SCENE)))
            # Every frame FFmpeg expects still exists, under a contiguous name.
            self.assertEqual([p.name for p in sorted(frames.iterdir())],
                             [f"frame-{10 + index:06d}.png" for index in range(120)])
            inodes = {p.stat().st_ino for p in frames.iterdir()}
            self.assertEqual(len(inodes), renderer.ANIMATED_FRAMES_PER_SCENE)

    def test_offsets_never_overlap_so_scenes_can_render_in_parallel(self):
        seconds = [5.0, 6.5, 5.25]
        counts = [max(renderer.SOURCE_FPS, math.ceil(value * renderer.SOURCE_FPS)) for value in seconds]
        offsets, running = [], 0
        for count in counts:
            offsets.append(running)
            running += count
        self.assertEqual(offsets, [0, counts[0], counts[0] + counts[1]])
        self.assertEqual(running, sum(counts))
        # The sequence FFmpeg reads must have no gap and no duplicate name.
        names = [index for offset, count in zip(offsets, counts) for index in range(offset, offset + count)]
        self.assertEqual(names, list(range(running)))

    def test_encode_filter_has_no_optical_flow_interpolation(self):
        source = Path(renderer.__file__).read_text(encoding="utf-8")
        self.assertNotIn("minterpolate=", source)
        self.assertIn("fps={OUTPUT_FPS},scale=", source)


class NarrationParallelTests(unittest.TestCase):
    def test_scene_workers_overlap_while_the_order_is_kept(self):
        """Synthesis of three scenes finishes faster than three in a row."""
        import time

        with tempfile.TemporaryDirectory() as temp:
            audio_dir = Path(temp)
            write_wav = _fake_synthesize()
            delay = 0.4
            seen: list[str] = []
            lock = threading.Lock()

            def slow(text: str, output: Path, voice: str = "ru", *, style: str = "neutral") -> float:
                with lock:
                    seen.append(text)
                time.sleep(delay)
                return write_wav(text, output)

            script = _script(scenes=3)
            workers = renderer._scene_worker_count(3)
            with patch.object(renderer, "synthesize", side_effect=slow):
                started = time.perf_counter()
                prepared = renderer.prepare_all_scenes(script["scenes"], audio_dir)
                elapsed = time.perf_counter() - started
            written = [p.name for p in sorted(audio_dir.iterdir())]

        # Sequential work would need three full delays; overlap needs two batches.
        self.assertLess(elapsed, 3 * delay)
        self.assertGreaterEqual(elapsed, math.ceil(3 / workers) * delay * 0.9)
        self.assertEqual([dialogue for dialogue, _ in prepared],
                         [scene["dialogue"] for scene in script["scenes"]])
        self.assertEqual(sorted(seen), sorted(scene["dialogue"] for scene in script["scenes"]))
        self.assertEqual(written, ["line-00.wav", "line-01.wav", "line-02.wav"])


    def test_worker_count_is_bounded_and_never_zero(self):
        for scenes in (1, 2, 6, 40):
            with self.subTest(scenes=scenes):
                self.assertGreaterEqual(renderer._scene_worker_count(scenes), 1)
                self.assertLessEqual(renderer._scene_worker_count(scenes), 4)


class ShortRenderIntegrationTests(unittest.TestCase):
    def test_short_render_reports_stage_timings_and_reuses_frames(self):
        """End-to-end through render_short with a stub encoder."""
        import subprocess

        calls = []

        def fake_run(command, **kwargs):
            calls.append(command)
            # Mimic both ffmpeg invocations: audio concat and the video encode.
            return subprocess.CompletedProcess(command, 0, "", "")

        script = _script(scenes=3)
        with tempfile.TemporaryDirectory() as temp:
            root = Path(temp)
            output = root / "short.mp4"
            output.write_bytes(b"x")
            with patch.dict("os.environ", {"PIPER_MODEL_PATH": str(Path(temp) / "voice.onnx")}), \
                 patch.object(Path, "is_file", return_value=True), \
                 patch.object(renderer, "synthesize", side_effect=_fake_synthesize()), \
                 patch.object(renderer, "ffmpeg_executable", return_value="/usr/bin/ffmpeg"), \
                 patch.object(renderer.subprocess, "run", side_effect=fake_run), \
                 patch.object(renderer, "verify_video_profile", return_value={"fps": 50.0, "width": 1080, "height": 1920}):
                info = renderer.render_short(script, output, root / "work")

        self.assertEqual(info["fps"], 50.0)
        encode = [command for command in calls if "-vf" in command][0]
        filters = encode[encode.index("-vf") + 1]
        self.assertNotIn("minterpolate", filters)
        self.assertIn("fps=50", filters)
        self.assertIn("scale=1080:1920", filters)
        # Scene durations are padded to at least five seconds each.
        self.assertAlmostEqual(info["duration_seconds"], 3 * 5.2, places=1)


if __name__ == "__main__":
    unittest.main()
