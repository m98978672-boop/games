import json
import sys
import tempfile
import unittest
import wave
from pathlib import Path
from types import SimpleNamespace
from unittest.mock import patch

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
import renderer


class RenderQualityTests(unittest.TestCase):
    def test_render_targets_full_hd_50fps(self):
        self.assertEqual(renderer.SOURCE_FPS, 25)
        self.assertEqual(renderer.OUTPUT_FPS, 50)
        self.assertEqual((renderer.OUTPUT_WIDTH, renderer.OUTPUT_HEIGHT), (1080, 1920))

    def test_verifier_rejects_video_below_50fps(self):
        with tempfile.TemporaryDirectory() as temp, patch.object(
            renderer.subprocess, "run", side_effect=[
                SimpleNamespace(stdout="/usr/bin/ffprobe"),
                SimpleNamespace(stdout=json.dumps({"streams": [{"width": 1080, "height": 1920, "avg_frame_rate": "25/1"}]})),
            ],
        ):
            with self.assertRaisesRegex(RuntimeError, "below requirement"):
                renderer.verify_video_profile(Path(temp) / "clip.mp4")

    def test_verifier_accepts_fullhd_50fps(self):
        with tempfile.TemporaryDirectory() as temp, patch.object(
            renderer.subprocess, "run", side_effect=[
                SimpleNamespace(stdout="/usr/bin/ffprobe"),
                SimpleNamespace(stdout=json.dumps({"streams": [{"width": 1920, "height": 1080, "avg_frame_rate": "50/1"}]})),
            ],
        ):
            result = renderer.verify_video_profile(Path(temp) / "clip.mp4")
        self.assertEqual(result, {"fps": 50.0, "width": 1920, "height": 1080})

    def test_piper_voice_is_local_and_rejects_non_russian_narration(self):
        with tempfile.TemporaryDirectory() as temp:
            model = Path(temp) / "ru.onnx"
            model.write_bytes(b"local test model marker")
            output = Path(temp) / "voice.wav"

            def fake_run(command, **kwargs):
                self.assertEqual(command[0], "piper")
                self.assertEqual(kwargs["input"], "Это русская проверочная фраза.")
                self.assertNotIn("https://", str(command))
                with wave.open(str(output), "wb") as target:
                    target.setnchannels(1)
                    target.setsampwidth(2)
                    target.setframerate(22050)
                    target.writeframes(b"\0\0" * 2205)
                return SimpleNamespace(returncode=0)

            with patch.dict("os.environ", {"PIPER_MODEL_PATH": str(model)}), patch.object(renderer.subprocess, "run", side_effect=fake_run):
                duration = renderer.synthesize("Это русская проверочная фраза.", output)
            self.assertAlmostEqual(duration, 0.1)
            with patch.object(renderer.subprocess, "run") as run:
                with self.assertRaisesRegex(ValueError, "Russian Cyrillic"):
                    renderer.synthesize("This is English only.", output)
                run.assert_not_called()


if __name__ == "__main__":
    unittest.main()
