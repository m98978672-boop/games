import json
import sys
import tempfile
import unittest
from datetime import datetime, timezone
from pathlib import Path
from unittest.mock import patch

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from review_batch import plan, run_queue


class ReviewBatchTests(unittest.TestCase):
    def test_plan(self):
        now = datetime(2026, 11, 24, 12, tzinfo=timezone.utc)
        self.assertEqual(plan(2, 'long', '2026-11-25 20:30', now=now), ['2026-11-25 20:30', '2026-11-26 20:30'])
        self.assertEqual(plan(1, 'short', '', now=now), [''])
        for args in [(0, 'short', ''), (6, 'short', ''), (3, 'long', ''), (2, 'short', ''), (1, 'other', '')]:
            with self.subTest(args=args), self.assertRaises(ValueError):
                plan(*args, now=now)

    def test_two_items_are_rendered_and_uploaded_in_order(self):
        with tempfile.TemporaryDirectory() as tmp, patch('review_batch.subprocess.run') as run, patch('review_batch.manual_publish_time'):
            run.return_value.returncode = 0
            for i in (1, 2):
                Path(tmp, f'games-review-{i}.result.json').write_text(json.dumps({'metadata': {'manual_time_adjusted': False}}))
            run_queue(['first', 'second'], 'short', Path(tmp))
            self.assertEqual(len(run.call_args_list), 4)
            self.assertIn('run_game_review.py', run.call_args_list[0].args[0][1])
            self.assertIn('publish_to_supabase.py', run.call_args_list[1].args[0][1])
            self.assertEqual(run.call_args_list[2].kwargs['env']['MANUAL_PUBLISH_AT'], 'second')
            self.assertTrue(run.call_args_list[3].kwargs['check'])

    def test_stops_after_ambiguous_upload(self):
        with tempfile.TemporaryDirectory() as tmp, patch('review_batch.subprocess.run') as run, patch('review_batch.manual_publish_time'):
            run.side_effect = [type('R', (), {'returncode': 0})(), RuntimeError('upload failed')]
            Path(tmp, 'games-review-1.result.json').write_text(json.dumps({'metadata': {'manual_time_adjusted': False}}))
            with self.assertRaises(RuntimeError):
                run_queue(['a', 'b'], 'short', Path(tmp))
            self.assertEqual(run.call_count, 2)

    def test_renderer_retry_occurs_only_before_upload(self):
        with tempfile.TemporaryDirectory() as tmp, patch('review_batch.subprocess.run') as run, patch('review_batch.time.sleep'):
            failed = type('R', (), {'returncode': 1})()
            success = type('R', (), {'returncode': 0})()
            run.side_effect = [failed, success, success]
            run_queue([''], 'short', Path(tmp))
            self.assertEqual(len(run.call_args_list), 3)
            self.assertIn('run_game_review.py', run.call_args_list[0].args[0][1])
            self.assertIn('run_game_review.py', run.call_args_list[1].args[0][1])
            self.assertIn('publish_to_supabase.py', run.call_args_list[2].args[0][1])

    def test_missing_adjustment_flag_never_uploads_batch(self):
        with tempfile.TemporaryDirectory() as tmp, patch('review_batch.subprocess.run') as run, patch('review_batch.manual_publish_time'):
            run.return_value.returncode = 0
            Path(tmp, 'games-review-1.result.json').write_text(json.dumps({'metadata': {}}))
            with self.assertRaises(RuntimeError):
                run_queue(['a', 'b'], 'short', Path(tmp))
            self.assertEqual(run.call_count, 1)

    def test_adjusted_batch_slot_never_uploads(self):
        with tempfile.TemporaryDirectory() as tmp, patch('review_batch.subprocess.run') as run, patch('review_batch.manual_publish_time'):
            run.return_value.returncode = 0
            Path(tmp, 'games-review-1.result.json').write_text(json.dumps({'metadata': {'manual_time_adjusted': True}}))
            with self.assertRaises(RuntimeError):
                run_queue(['a', 'b'], 'long', Path(tmp))
            self.assertEqual(run.call_count, 1)

if __name__ == '__main__':
    unittest.main()
