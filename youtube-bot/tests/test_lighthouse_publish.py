import json
import sys
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from publish_adventure_short import prepare


class LighthousePublishTests(unittest.TestCase):
    def test_lighthouse_and_short_publication_are_blocked(self):
        from publish_adventure_short import publish_checked
        with tempfile.TemporaryDirectory() as root, \
             patch('publish_adventure_short.publish') as upload, \
             patch('publish_adventure_short.read_queue') as queue:
            folder = Path(root)
            for lighthouse in (True, False):
                with self.subTest(lighthouse=lighthouse), self.assertRaisesRegex(ValueError, 'Gameplay publication blocked'):
                    prepare(folder, '123', lighthouse=lighthouse)
                with self.subTest(checked=lighthouse), self.assertRaisesRegex(ValueError, 'Gameplay publication blocked'):
                    publish_checked(folder / 'metadata.json', lighthouse=lighthouse)
            upload.assert_not_called()
            queue.assert_not_called()

    def test_decimal_score_is_a_rating_not_a_count_of_tests(self):
        from game_reviews import parse_idea_score, score_label
        self.assertEqual(score_label(parse_idea_score('9,9')), '9,9')
        for invalid in (True, 9.99, 0.9, '10,1', '99/100'):
            with self.assertRaises(ValueError):
                parse_idea_score(invalid)

    def test_preflight_skips_many_busy_slots_but_never_retries_own_reservation(self):
        from datetime import datetime, timezone
        from publish_adventure_short import publish_checked, PublishError
        from schedule_policy import next_publish_slot
        now = datetime(2026, 11, 26, tzinfo=timezone.utc)
        probe = now
        busy = []
        for i in range(7):
            probe = next_publish_slot(probe, video_format='short')
            busy.append(dict(id=str(i), status='scheduled', publish_at=probe.isoformat()))
        with tempfile.TemporaryDirectory() as root:
            path = Path(root) / 'result.json'
            path.write_text(json.dumps({'metadata': {'job_id': 'ours', 'video_format': 'short'}}))
            with patch('gameplay_release_gate.require_verified_gameplay_release'), patch('publish_adventure_short.read_queue', return_value=busy), patch('publish_adventure_short.publish') as upload:
                publish_checked(path, lighthouse=True, now=now)
                upload.assert_called_once_with(path)
                expected = next_publish_slot(probe, video_format='short').isoformat().replace('+00:00', 'Z')
                self.assertEqual(json.loads(path.read_text())['metadata']['publish_at'], expected)
            with patch('gameplay_release_gate.require_verified_gameplay_release'), patch('publish_adventure_short.read_queue', return_value=[dict(id='ours', status='processing')]), patch('publish_adventure_short.publish') as upload:
                with self.assertRaises(PublishError):
                    publish_checked(path, lighthouse=True, now=now)
                upload.assert_not_called()
