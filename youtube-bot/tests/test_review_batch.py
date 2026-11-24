import contextlib
import io
import json
import os
import sys
import tempfile
import unittest
from datetime import datetime, timedelta, timezone
from pathlib import Path
from unittest.mock import patch

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from review_batch import main, parse_count, parse_format, plan, run_queue, suggest_start, validate_inputs
from schedule_policy import CHANNEL_TZ


class ReviewBatchTests(unittest.TestCase):
    def test_plan(self):
        now = datetime(2026, 11, 24, 12, tzinfo=timezone.utc)
        self.assertEqual(plan(2, 'long', '2026-11-25 20:30', now=now), ['2026-11-25 20:30', '2026-11-26 20:30'])
        self.assertEqual(plan(1, 'short', '', now=now), [''])
        self.assertEqual(plan(5, 'short', '2026-11-25 08:00', now=now), ['2026-11-25 08:00', '2026-11-25 12:00', '2026-11-26 08:00', '2026-11-26 12:00', '2026-11-27 08:00'])
        self.assertEqual(plan(2, 'short', '', now=now), ['2026-11-25 08:00', '2026-11-25 12:00'])
        self.assertEqual(plan(2, 'long', '', now=now), ['2026-11-25 06:00', '2026-11-26 06:00'])
        for args in [(0, 'short', ''), (6, 'short', ''), (3, 'long', ''), (1, 'other', '')]:
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

    def test_empty_start_uses_regular_cadence_for_a_batch(self):
        # main's staggered plan: an empty publish_at is not a mistake any more,
        # a batch simply walks the regular slots with a long lead.
        now = datetime(2026, 11, 24, 21, tzinfo=timezone(timedelta(hours=3))).astimezone(timezone.utc)
        shorts = plan(4, 'short', '', now=now)
        self.assertEqual(len(shorts), 4)
        self.assertEqual(shorts, sorted(shorts))
        self.assertTrue(all('08:00' in s or '12:00' in s for s in shorts), shorts)
        longs = plan(2, 'long', '', now=now)
        self.assertEqual(len(longs), 2)
        self.assertTrue(all(s.endswith('06:00') for s in longs), longs)
        # Blank and padded input behaves like an empty one.
        self.assertEqual(plan(2, 'short', '   ', now=now), shorts[:2])

    def test_blank_and_whitespace_inputs_are_one_item(self):
        now = datetime(2026, 11, 24, 12, tzinfo=timezone.utc)
        self.assertEqual(parse_count(''), 1)
        self.assertEqual(parse_count('  '), 1)
        self.assertEqual(parse_count('2'), 2)
        self.assertEqual(plan(1, 'short', '   ', now=now), [''])
        self.assertEqual(plan(1, 'short', ' 2026-11-25 20:30 ', now=now), ['2026-11-25 20:30'])
        self.assertEqual(parse_format(' long '), 'long')
        # Syntax is checked by parse_count, ranges by plan: 0 and 6 are numbers,
        # but "два" and "1.5" are not whole numbers at all.
        for bad in ('два', '1.5', 'two'):
            with self.subTest(bad=bad), self.assertRaises(ValueError):
                parse_count(bad)
        for out_of_range in (0, 6, 3):
            with self.subTest(out_of_range=out_of_range), self.assertRaises(ValueError):
                plan(out_of_range, 'long' if out_of_range == 3 else 'short', '', now=now)
        for bad in ('', 'video', None):
            with self.subTest(bad=bad), self.assertRaises(ValueError):
                parse_format(bad)

    def test_check_mode_reports_bad_input_in_one_readable_line(self):
        # The run #45484226931 failure showed a raw traceback; now every bad
        # input is one ::error:: line and nothing is rendered.
        for env in (
            {'VIDEO_FORMAT': 'short', 'REVIEW_BATCH_COUNT': 'два', 'MANUAL_PUBLISH_AT': ''},
            {'VIDEO_FORMAT': 'short', 'REVIEW_BATCH_COUNT': '6', 'MANUAL_PUBLISH_AT': ''},
            {'VIDEO_FORMAT': 'short', 'REVIEW_BATCH_COUNT': '1', 'MANUAL_PUBLISH_AT': '2020-01-01 10:00'},
            {'VIDEO_FORMAT': 'short', 'REVIEW_BATCH_COUNT': '1', 'MANUAL_PUBLISH_AT': 'завтра'},
            {'VIDEO_FORMAT': 'video', 'REVIEW_BATCH_COUNT': '1', 'MANUAL_PUBLISH_AT': ''},
        ):
            with self.subTest(env=env), patch.dict(os.environ, {**env, 'RUNNER_TEMP': ''}, clear=True), \
                    patch('review_batch.subprocess.run') as run, \
                    contextlib.redirect_stdout(io.StringIO()) as output:
                self.assertEqual(main(['--check']), 1)
                run.assert_not_called()
            text = output.getvalue()
            self.assertIn('::error::', text)
            self.assertIn('nothing was rendered or uploaded', text)
            self.assertNotIn('Traceback', text)

    def test_bad_publish_at_is_quoted_back(self):
        bad = '2026-01-01 10:00'
        with patch.dict(os.environ, {'VIDEO_FORMAT': 'short', 'REVIEW_BATCH_COUNT': '1', 'MANUAL_PUBLISH_AT': bad}, clear=True):
            with self.assertRaises(ValueError) as caught:
                validate_inputs()
        self.assertIn(bad, str(caught.exception))

    def test_check_mode_accepts_a_valid_queue(self):
        now = datetime(2026, 11, 24, 12, tzinfo=timezone.utc)
        with patch('review_batch.manual_publish_time', side_effect=lambda value, now=None: datetime.fromisoformat(value).replace(tzinfo=CHANNEL_TZ)), \
                patch.dict(os.environ, {'VIDEO_FORMAT': 'long', 'REVIEW_BATCH_COUNT': '2', 'MANUAL_PUBLISH_AT': '2026-11-25 20:30'}, clear=True), \
                contextlib.redirect_stdout(io.StringIO()) as output:
            self.assertEqual(main(['--check']), 0)
        self.assertIn("format=long, count=2", output.getvalue())

    def test_missing_runner_temp_stops_before_rendering(self):
        with patch('review_batch.run_queue') as queue, patch.dict(os.environ, {'VIDEO_FORMAT': 'short', 'REVIEW_BATCH_COUNT': '1', 'MANUAL_PUBLISH_AT': '', 'RUNNER_TEMP': ''}, clear=True), \
                contextlib.redirect_stdout(io.StringIO()):
            self.assertEqual(main([]), 1)
        queue.assert_not_called()

if __name__ == '__main__':
    unittest.main()
