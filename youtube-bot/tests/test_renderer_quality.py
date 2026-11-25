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

    def test_verifier_rejects_4999_average_without_lowering_requirement(self):
        with tempfile.TemporaryDirectory() as temp, patch.object(
            renderer.subprocess, "run", side_effect=[
                SimpleNamespace(stdout="/usr/bin/ffprobe"),
                SimpleNamespace(stdout=json.dumps({"streams": [{"width": 1920, "height": 1080, "avg_frame_rate": "4999/100", "r_frame_rate": "50/1"}]})),
            ],
        ):
            with self.assertRaisesRegex(RuntimeError, "49.99 fps"):
                renderer.verify_video_profile(Path(temp) / "clip.mp4")

    def test_concat_encodes_real_cfr_video_and_copies_audio(self):
        with tempfile.TemporaryDirectory() as temp, patch.object(renderer.subprocess, "run") as run:
            root = Path(temp)
            renderer.concat_long_segments("ffmpeg", [root / "chapter.mp4"], root / "out.mp4", root)
            args = run.call_args.args[0]
            self.assertIn("fps=50,format=yuv420p", args)
            self.assertEqual(args[args.index("-fps_mode") + 1], "cfr")
            self.assertEqual(args[args.index("-c:a") + 1], "copy")
            self.assertEqual(args[args.index("-c:v") + 1], "libx264")
            with self.assertRaises(ValueError): renderer.concat_long_segments("ffmpeg", [], root / "out.mp4", root)

    def test_verifier_accepts_fullhd_50fps(self):
        with tempfile.TemporaryDirectory() as temp, patch.object(
            renderer.subprocess, "run", side_effect=[
                SimpleNamespace(stdout="/usr/bin/ffprobe"),
                SimpleNamespace(stdout=json.dumps({"streams": [{"width": 1920, "height": 1080, "avg_frame_rate": "50/1"}]})),
            ],
        ):
            result = renderer.verify_video_profile(Path(temp) / "clip.mp4")
        self.assertEqual(result, {"fps": 50.0, "width": 1920, "height": 1080})

    def test_short_long_narration_fails_before_any_video_encoding(self):
        def fake_speech(_text, path, **_kwargs):
            with wave.open(str(path), "wb") as target:
                target.setnchannels(1)
                target.setsampwidth(2)
                target.setframerate(1000)
                target.writeframes(b"\0\0" * 1000)
            return 1.0
        script = {"scenes": [{"dialogue": "Проверка."} for _ in range(10)]}
        with tempfile.TemporaryDirectory() as temp, \
             patch.object(renderer, "ffmpeg_executable", return_value="ffmpeg"), \
             patch.object(renderer, "synthesize", side_effect=fake_speech), \
             patch.object(renderer.subprocess, "run") as run:
            with self.assertRaisesRegex(ValueError, "3–10 minutes"):
                renderer.render_long_review(script, Path(temp) / "out.mp4", Path(temp) / "work")
            run.assert_not_called()

    def test_piper_voice_is_local_and_rejects_non_russian_narration(self):
        import shutil
        with tempfile.TemporaryDirectory() as temp:
            model = Path(temp) / "ru.onnx"
            model.write_bytes(b"local test model marker")
            output = Path(temp) / "voice.wav"

            def fake_run(command, **kwargs):
                self.assertEqual(command[0], "piper")
                self.assertEqual(kwargs["input"], "Это русская проверочная фраза.")
                self.assertIn("--sentence_silence", command)
                raw = Path(command[command.index("--output_file") + 1])
                with wave.open(str(raw), "wb") as target:
                    target.setnchannels(1)
                    target.setsampwidth(2)
                    target.setframerate(22050)
                    target.writeframes(b"\0\0" * 2205)
                return SimpleNamespace(returncode=0)

            with patch.dict("os.environ", {"PIPER_MODEL_PATH": str(model)}), \
                 patch.object(renderer.subprocess, "run", side_effect=fake_run), \
                 patch.object(renderer, "normalize_narration", side_effect=shutil.copyfile) as normalize:
                duration = renderer.synthesize("Это русская проверочная фраза.", output)
            self.assertAlmostEqual(duration, 0.1)
            normalize.assert_called_once()
            self.assertTrue(output.is_file())
            with patch.object(renderer.subprocess, "run") as run:
                with self.assertRaisesRegex(ValueError, "Russian Cyrillic"):
                    renderer.synthesize("This is English only.", output)
                run.assert_not_called()

    def test_piper_scene_styles_change_cadence_without_pitch_shift(self):
        import shutil
        with tempfile.TemporaryDirectory() as temp:
            root = Path(temp); model = root / 'ru.onnx'; model.write_bytes(b'model')
            commands = []
            def fake_run(command, **kwargs):
                commands.append(command)
                raw = Path(command[command.index('--output_file') + 1])
                with wave.open(str(raw), 'wb') as target:
                    target.setnchannels(1); target.setsampwidth(2); target.setframerate(22050)
                    target.writeframes(b'\0\0' * 2205)
                return SimpleNamespace(returncode=0)
            with patch.dict('os.environ', {'PIPER_MODEL_PATH': str(model)}), \
                 patch.object(renderer.subprocess, 'run', side_effect=fake_run), \
                 patch.object(renderer, 'normalize_narration', side_effect=shutil.copyfile):
                for style in ('bright', 'reflective'):
                    renderer.synthesize('Привет, это проверка.', root / f'{style}.wav', style=style)
            self.assertNotEqual(commands[0][commands[0].index('--length_scale') + 1],
                                commands[1][commands[1].index('--length_scale') + 1])
            self.assertNotIn('--pitch', commands[0])

    def test_platform_name_is_pronounced_in_russian_without_changing_other_words(self):
        self.assertEqual(renderer.pronunciation_text("По данным Steam: Steamworks"), "По данным Стим: Steamworks")

    def test_spoken_score_and_punctuation_leave_other_numbers_and_ellipsis_intact(self):
        self.assertEqual(renderer.pronunciation_text('Оценка — 7 из 10 .Steam...Далее!'),
                         'Оценка — семь из десяти. Стим... Далее!')
        self.assertEqual(renderer.pronunciation_text('Цена 10 евро, версия 1.2.'), 'Цена 10 евро, версия 1.2.')
        self.assertEqual(renderer.pronunciation_text('10 из 10!'), 'десять из десяти!')

    def test_audio_processing_is_bounded_and_does_not_adjust_pitch(self):
        with patch.object(renderer, "ffmpeg_executable", return_value="ffmpeg"), patch.object(renderer.subprocess, "run") as run:
            renderer.normalize_narration(Path("in.wav"), Path("out.wav"))
        command = run.call_args.args[0]
        audio_filter = command[command.index("-af") + 1]
        self.assertIn("loudnorm=I=-16:TP=-2", audio_filter)
        self.assertIn("highpass=f=75", audio_filter)
        self.assertNotIn("atempo", audio_filter)
        self.assertNotIn("asetrate", audio_filter)

    def test_temporary_png_compression_keeps_exact_frame_pixels(self):
        from PIL import Image
        original_save = Image.Image.save
        script = {'format': 'game-review', 'game_title': 'Проверочная игра',
                  'idea_score': 7, 'scenes': [{}] * 5, 'screenshot_paths': []}
        scene = {'label': 'ФАКТ ИЗ STEAM', 'visual': 'Сведения об игре',
                 'dialogue': 'Русская проверочная фраза.'}
        with tempfile.TemporaryDirectory() as temp:
            root = Path(temp)
            for frame in (0, 13):
                baseline = root / f'baseline-{frame}.png'
                new = root / f'new-{frame}.png'
                def force_old_compression(image, path, *args, **kwargs):
                    kwargs['optimize'] = True
                    return original_save(image, path, *args, **kwargs)
                with patch.object(Image.Image, 'save', force_old_compression):
                    renderer.render_frame(script, scene, 1, frame, baseline)
                renderer.render_frame(script, scene, 1, frame, new)
                with Image.open(baseline) as old_image, Image.open(new) as new_image:
                    self.assertEqual(old_image.size, new_image.size)
                    self.assertEqual(old_image.convert('RGB').tobytes(), new_image.convert('RGB').tobytes())

    def test_review_layouts_render_at_required_dimensions_and_fit_long_words(self):
        from PIL import Image, ImageDraw
        with tempfile.TemporaryDirectory() as temp:
            root = Path(temp)
            script = {"format": "game-review", "game_title": "Очень длинное название " * 5,
                      "idea_score": 7, "scenes": [{}] * 5, "screenshot_paths": []}
            scene = {"label": "ФАКТ ИЗ STEAM", "visual": "описание " * 12,
                     "dialogue": "Русская фраза для проверки оформления и читаемости."}
            short, long = root / "short.png", root / "long.png"
            renderer.render_frame(script, scene, 1, 12, short)
            renderer._render_long_card(script, scene, 1, long)
            with Image.open(short) as image:
                self.assertEqual(image.size, (1080, 1920))
            with Image.open(long) as image:
                self.assertEqual(image.size, (1920, 1080))
            draw = ImageDraw.Draw(Image.new("RGB", (720, 100)))
            selected, lines = renderer._fitted_lines(draw, "Оченьдлинноенеразрывноеназвание" * 8,
                                                     width=600, max_lines=1, sizes=(30, 24))
            self.assertTrue(lines[0].endswith("…"))
            self.assertLessEqual(draw.textlength(lines[0], font=selected), 600)


if __name__ == "__main__":
    unittest.main()
