import json
import sys
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
import publish_adventure_draft as uploader


class AdventureDurationTests(unittest.TestCase):
    def test_padding_or_short_mp4_does_not_qualify(self):
        with tempfile.TemporaryDirectory() as temp:
            folder = Path(temp)
            (folder / 'trace.json').write_text(json.dumps({'game': 'The Lost Artifact', 'outcome': 'game_reported_victory'}))
            (folder / 'zuza-pilot.mp4').touch()
            for gameplay, actual in ((1.6, 620), (599.99, 650), (600, 599.99), (None, 650)):
                with self.subTest(gameplay=gameplay, actual=actual):
                    (folder / 'pilot.json').write_text(json.dumps({'draft': 'zuza-pilot.mp4', 'needs_continuation': False,
                                                                  'edited_gameplay_seconds': gameplay}))
                    with patch.object(uploader, 'probe_capture', return_value=actual), self.assertRaisesRegex(ValueError, '10 minutes'):
                        uploader.prepare(folder, '123', '', rights_verified=True)
