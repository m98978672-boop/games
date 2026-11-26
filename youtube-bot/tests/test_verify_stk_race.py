import sys
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from verify_stk_race import PIXELS, inspect_motion


class RaceEvidenceTests(unittest.TestCase):
    def test_black_screen_or_tiny_clock_change_rejected(self):
        for frames in (bytes(PIXELS * 30), b''.join(bytes([n * 8]) + bytes(PIXELS-1) for n in range(30))):
            with self.assertRaisesRegex(ValueError, 'continuous movement'):
                inspect_motion(frames)

    def test_full_frame_changing_samples(self):
        self.assertEqual(inspect_motion((bytes(PIXELS) + bytes([100])*PIXELS) * 15), (30, 29))
