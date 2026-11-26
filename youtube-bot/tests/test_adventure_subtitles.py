"""Captions must follow the actual synthesized narration after edits."""
import json
import sys
import tempfile
import unittest
import wave
from pathlib import Path
from unittest.mock import patch

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
import adventure_draft


def fake_voice(text, wav):
    # Exactly one second, 1 kHz mono PCM. The subtitle timings should use the
    # samples actually written to the combined track, not estimates from text.
    with wave.open(str(wav), 'wb') as out:
        out.setnchannels(1)
        out.setsampwidth(2)
        out.setframerate(1000)
        out.writeframes(b'\0\0' * 1000)


class AdventureSubtitleTests(unittest.TestCase):
    def test_cut_and_serial_narration_create_timed_srt(self):
        trace = {'game': 'The Lost Artifact', 'outcome': 'game_reported_victory',
                 'actions': [{'choice': 'CHOICEONE', 'screen_unchanged': True,
                              'recording_elapsed_ms': 5000,
                              'verified_thinking_only_ms': [1000, 3000]}]}
        with tempfile.TemporaryDirectory() as temp:
            folder = Path(temp)
            (folder / 'trace.json').write_text(json.dumps(trace), encoding='utf-8')
            (folder / 'recording.webm').touch()
            # FFmpeg is mocked, so the encode step has to leave the file that a
            # real run would produce: the builder now hashes its outputs.
            def fake_ffmpeg(*args, **kwargs):
                Path(args[0][-1]).write_bytes(b'\x00' * 1024)
            with patch.object(adventure_draft, 'narrate', side_effect=fake_voice), \
                 patch.object(adventure_draft, 'probe_capture', side_effect=[10.0, 8.0]), \
                 patch.object(adventure_draft.subprocess, 'run', side_effect=fake_ffmpeg):
                adventure_draft.build(folder)
            report = json.loads((folder / 'pilot.json').read_text(encoding='utf-8'))
            captions = (folder / report['captions']).read_text(encoding='utf-8')
            self.assertIn('00:00:00,000 --> 00:00:01,000\nЯ ищу потерянный артефакт.', captions)
            self.assertIn('00:00:01,120 --> 00:00:02,120\nВыбираю первый вариант.', captions)
            self.assertIn('00:00:03,000 --> 00:00:04,000\nАртефакт найден.', captions)
            self.assertEqual(report['captions_scope'], 'synthesized_narration_only')
            self.assertEqual(report['minimum_gameplay_seconds'], 1200)
            self.assertFalse(report['duration_eligible'])
            self.assertFalse(report['published'])

    def test_empty_voice_clip_never_yields_captions(self):
        def silent_file(text, wav):
            with wave.open(str(wav), 'wb') as out:
                out.setnchannels(1); out.setsampwidth(2); out.setframerate(1000)
        trace = {'game': 'The Lost Artifact', 'outcome': 'time_limit', 'actions': []}
        with tempfile.TemporaryDirectory() as temp:
            folder = Path(temp)
            (folder / 'trace.json').write_text(json.dumps(trace), encoding='utf-8')
            (folder / 'recording.webm').touch()
            with patch.object(adventure_draft, 'narrate', side_effect=silent_file), \
                 patch.object(adventure_draft, 'probe_capture', return_value=10), \
                 patch.object(adventure_draft.subprocess, 'run') as ffmpeg:
                with self.assertRaisesRegex(ValueError, 'empty'):
                    adventure_draft.build(folder)
                ffmpeg.assert_not_called()
                self.assertEqual(list(folder.glob('*.srt')), [])


if __name__ == '__main__':
    unittest.main()
