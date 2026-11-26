import json
import sys
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
import gameplay_edit


class GameplayEditTests(unittest.TestCase):
    def test_split_builds_captions_and_metadata_without_publication(self):
        with tempfile.TemporaryDirectory() as temp:
            root = Path(temp)
            video = root / 'recording.mp4'; video.write_bytes(b'video')
            cues = root / 'cues.json'; cues.write_text(json.dumps([[1799, 1801, 'Комментарий'], [1802, 1803, 'Итог']]))
            def fake_run(command, **kwargs):
                Path(command[-1]).write_bytes(b'encoded')
            with patch.object(gameplay_edit, 'probe', side_effect=[1804, 1800, 4]), \
                 patch.object(gameplay_edit.subprocess, 'run', side_effect=fake_run):
                parts = gameplay_edit.edit(video, cues, root / 'result', game='Игра', author='Автор',
                                           repository_url='https://github.com/owner/game')
            self.assertEqual(len(parts), 2)
            self.assertTrue(all(not p['uploaded'] for p in parts))
            self.assertIn('00:00:00,000 --> 00:00:01,000', (root / 'result/part-2.ru.srt').read_text())
            self.assertIn('ссылка на игру в описании', parts[0]['title'])
            self.assertTrue((root / 'result/release-plan.json').is_file())

    def test_does_not_overwrite_and_invalid_cues_fail_before_render(self):
        with tempfile.TemporaryDirectory() as temp:
            root = Path(temp); video = root / 'video.mp4'; video.write_bytes(b'x')
            cues = root / 'cues.json'; cues.write_text(json.dumps([[0, 3, 'one'], [2, 4, 'two']]))
            output = root / 'result'
            with patch.object(gameplay_edit, 'probe', return_value=10), patch.object(gameplay_edit.subprocess, 'run') as runner:
                with self.assertRaises(ValueError):
                    gameplay_edit.edit(video, cues, output, game='Игра', author='Автор', repository_url='https://github.com/a/b')
                runner.assert_not_called()
            self.assertFalse(output.exists())
            output.mkdir()
            with self.assertRaises(ValueError):
                gameplay_edit.edit(video, cues, output, game='Игра', author='Автор', repository_url='https://github.com/a/b')

    def test_failed_part_does_not_leave_final_directory(self):
        with tempfile.TemporaryDirectory() as temp:
            root = Path(temp); video = root / 'v.mp4'; video.write_bytes(b'x')
            cues = root / 'c.json'; cues.write_text(json.dumps([[0, 2, 'слова']]))
            with patch.object(gameplay_edit, 'probe', side_effect=[10, 2]), patch.object(gameplay_edit.subprocess, 'run'):
                with self.assertRaises(ValueError):
                    gameplay_edit.edit(video, cues, root / 'out', game='Игра', author='Автор', repository_url='https://github.com/a/b')
            self.assertFalse((root / 'out').exists())

    def test_auto_translate_before_render_keeps_timing_and_source_audio(self):
        with tempfile.TemporaryDirectory() as temp:
            root = Path(temp); video = root / 'v.mp4'; video.write_bytes(b'x')
            cues = root / 'c.json'; cues.write_text(json.dumps([[0.25, 1.5, 'Open the door.']]))
            commands = []
            def fake_run(command, **kwargs):
                commands.append(command)
                Path(command[-1]).write_bytes(b'encoded')
            with patch.object(gameplay_edit, 'probe', side_effect=[2, 2]), \
                 patch.object(gameplay_edit.subprocess, 'run', side_effect=fake_run), \
                 patch.object(gameplay_edit, 'russian_game_text', return_value='Открой дверь.') as translate:
                parts = gameplay_edit.edit(video, cues, root / 'out', game='Игра', author='Автор',
                    repository_url='https://github.com/a/b', translate_from='en', translation_context='Dungeon')
            self.assertEqual(translate.call_args.kwargs['source_language'], 'en')
            self.assertEqual(translate.call_args.kwargs['context'], 'Dungeon')
            self.assertIn('00:00:00,250 --> 00:00:01,500\nОткрой дверь.', (root / 'out/part-1.ru.srt').read_text())
            self.assertEqual(commands[0][commands[0].index('-map', commands[0].index('-map') + 1) + 1], '0:a:0')
            self.assertTrue(parts[0]['translation_requires_review'])
            self.assertIn('Open the door.', cues.read_text())

    def test_translation_failure_does_not_render_or_create_output(self):
        with tempfile.TemporaryDirectory() as temp:
            root = Path(temp); video = root / 'v.mp4'; video.write_bytes(b'x')
            cues = root / 'c.json'; cues.write_text(json.dumps([[0, 2, 'Open the door.']]))
            with patch.object(gameplay_edit, 'probe', return_value=3), \
                 patch.object(gameplay_edit.subprocess, 'run') as runner, \
                 patch.object(gameplay_edit, 'russian_game_text', return_value=None):
                with self.assertRaises(ValueError):
                    gameplay_edit.edit(video, cues, root / 'out', game='Игра', author='Автор',
                        repository_url='https://github.com/a/b', translate_from='en')
            runner.assert_not_called()
            self.assertFalse((root / 'out').exists())

if __name__ == '__main__': unittest.main()
