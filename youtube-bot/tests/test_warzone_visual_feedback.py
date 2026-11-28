import io
import sys
import unittest
from pathlib import Path
from PIL import Image
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from warzone_probe.visual_feedback import compare_frames

def png(color, size=(800, 600)):
    result = io.BytesIO()
    Image.new('RGB', size, color).save(result, 'PNG')
    return result.getvalue()

class VisualFeedbackTests(unittest.TestCase):
    def test_static_frame_is_only_a_heuristic(self):
        report = compare_frames(png('black'), png('black'))
        self.assertEqual(report['assessment'], 'little_visible_change')
        self.assertIs(report['action_success_verified'], False)
    def test_changed_frame_does_not_prove_success(self):
        report = compare_frames(png('black'), png('white'))
        self.assertEqual(report['assessment'], 'visible_change')
        self.assertIs(report['action_success_verified'], False)
    def test_unexpected_sizes_are_rejected(self):
        with self.assertRaises(ValueError): compare_frames(png('black'), png('black', (20,20)))
