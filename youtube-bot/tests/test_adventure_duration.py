"""Where a gameplay cut lands: Shorts below three minutes, a full video above.

The old rule refused anything at or under ten minutes, which quietly meant a
short playthrough could never be published. The owner replaced it with a
three-minute boundary: a short cut belongs in Shorts instead of being dropped.
"""
import json
import sys
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
import publish_adventure_draft as uploader


def _folder(temp: str, *, gameplay: float | None) -> Path:
    folder = Path(temp)
    (folder / 'trace.json').write_text(json.dumps({'game': 'The Lost Artifact',
                                                  'outcome': 'game_reported_victory'}))
    (folder / 'zuza-pilot.mp4').touch()
    (folder / 'pilot.json').write_text(json.dumps({'draft': 'zuza-pilot.mp4',
                                                   'needs_continuation': False,
                                                   'edited_gameplay_seconds': gameplay}))
    return folder


class GameplayShelfTests(unittest.TestCase):
    def _prepare(self, folder: Path, measured: float) -> dict:
        with patch.object(uploader, 'probe_capture', return_value=measured), \
                patch.object(uploader, 'manual_publish_time') as when:
            when.return_value.isoformat.return_value = '2026-11-26T15:00:00+00:00'
            result = uploader.prepare(folder, '123', '2026-11-26 18:00', rights_verified=True)
        return json.loads(result.read_text(encoding='utf-8'))['metadata']

    def test_a_short_cut_publishes_as_a_short(self):
        with tempfile.TemporaryDirectory() as temp:
            metadata = self._prepare(_folder(temp, gameplay=150), measured=150)
        self.assertEqual(metadata['video_format'], 'short')

    def test_a_long_cut_publishes_as_a_full_video(self):
        with tempfile.TemporaryDirectory() as temp:
            metadata = self._prepare(_folder(temp, gameplay=900), measured=900)
        self.assertEqual(metadata['video_format'], 'long')

    def test_the_boundary_is_three_minutes(self):
        for measured, expected in ((179.9, 'short'), (180, 'long')):
            with self.subTest(measured=measured), tempfile.TemporaryDirectory() as temp:
                metadata = self._prepare(_folder(temp, gameplay=measured), measured=measured)
                self.assertEqual(metadata['video_format'], expected)

    def test_a_cut_with_no_measured_gameplay_is_refused(self):
        # Zero or unreadable length is a broken artifact, not a Short.
        for gameplay, measured in ((0, 600), (None, 600), (600, 0)):
            with self.subTest(gameplay=gameplay, measured=measured), \
                    tempfile.TemporaryDirectory() as temp:
                folder = _folder(temp, gameplay=gameplay)
                with patch.object(uploader, 'probe_capture', return_value=measured), \
                        self.assertRaises(ValueError):
                    uploader.prepare(folder, '123', '2026-11-26 18:00', rights_verified=True)

    def test_rights_must_still_be_explicitly_verified(self):
        with tempfile.TemporaryDirectory() as temp:
            folder = _folder(temp, gameplay=600)
            with self.assertRaises(ValueError):
                uploader.prepare(folder, '123', '2026-11-26 18:00', rights_verified=False)


if __name__ == '__main__':
    unittest.main()
