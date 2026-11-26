"""Private adventure artifacts must not bypass the owner's gameplay rules."""
import sys
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
import publish_adventure_draft as uploader


class GameplayReleaseTests(unittest.TestCase):
    def test_draft_upload_is_blocked_before_metadata_or_network(self):
        # A folder with no release evidence proves nothing about real
        # 20-minute gameplay, subtitles or same-day splitting. There is no flag
        # left to bypass it: the gate either finds the evidence or refuses.
        with tempfile.TemporaryDirectory() as temp, \
             patch.object(uploader, 'probe_capture') as probe, \
             patch.object(uploader, 'publish') as publish:
            folder = Path(temp)
            with self.assertRaisesRegex(ValueError, 'nothing is proven'):
                uploader.prepare(folder, '123', '2026-11-26 18:00')
            probe.assert_not_called()
            publish.assert_not_called()
            self.assertFalse((folder / 'publish.result.json').exists())


if __name__ == '__main__':
    unittest.main()
