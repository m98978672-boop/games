import sys
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from verify_review_artifact import validate_media


class ReviewArtifactTests(unittest.TestCase):
    def test_verify_final_video_and_audio(self):
        video = {'codec_type': 'video', 'width': 1920, 'height': 1080, 'avg_frame_rate': '50/1'}
        audio = {'codec_type': 'audio', 'duration': '203.98'}
        info = {'streams': [video, audio], 'format': {'duration': '204'}}
        self.assertEqual(validate_media(info, 'long')['duration_seconds'], 204)
        for bad_audio in ({}, {**audio, 'duration': '100'}, {**audio, 'duration': 'nan'}):
            with self.assertRaisesRegex(ValueError, 'audio'):
                validate_media({**info, 'streams': [video, bad_audio]}, 'long')
        with self.assertRaisesRegex(ValueError, '50 fps'):
            validate_media({**info, 'streams': [{**video, 'avg_frame_rate': '25/1'}, audio]}, 'long')
