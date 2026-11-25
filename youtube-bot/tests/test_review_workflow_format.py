import sys
import unittest
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from review_workflow_format import choose_format, SHORT_CRON, LONG_CRON

class ReviewWorkflowFormatTests(unittest.TestCase):
    def test_schedule_uses_event_cron_not_current_time(self):
        self.assertEqual(choose_format('schedule', SHORT_CRON, ''), 'short')
        self.assertEqual(choose_format('schedule', LONG_CRON, ''), 'long')
        self.assertEqual(choose_format('schedule', LONG_CRON, 'short'), 'long')
    def test_manual_format_and_fail_closed(self):
        for kind in ('short', 'long'):
            self.assertEqual(choose_format('workflow_dispatch', '', kind), kind)
        for args in (('schedule', '0 23 * * *', ''), ('push', '', 'long'), ('workflow_dispatch', '', 'bad')):
            with self.subTest(args=args), self.assertRaises(ValueError): choose_format(*args)
    def test_single_long_schedule_and_auth_path_are_coordinated(self):
        root = Path(__file__).resolve().parents[2]
        authorized = (root / '.github/workflows/youtube-shorts-autopilot.yml').read_text()
        legacy = (root / '.github/workflows/youtube-longform-autopilot.yml').read_text()
        self.assertIn(f'cron: "{LONG_CRON}"', authorized)
        self.assertIn(f'cron: "{SHORT_CRON}"', authorized)
        self.assertIn('review_workflow_format.py', authorized)
        self.assertIn('timeout-minutes: 360', authorized)
        self.assertIn('youtube-bot/review_batch.py', authorized)
        self.assertIn('batch_count:', authorized)
        # The pre-render check must be the readable one-line validator, not an
        # inline int() cast that dies with a traceback on a bad batch_count.
        self.assertIn('youtube-bot/review_batch.py --check', authorized)
        self.assertNotIn('from review_batch import plan', authorized)
        self.assertIn('github.event.schedule == \'0 22 * * *\'', authorized)
        batch = (root / 'youtube-bot/review_batch.py').read_text()
        self.assertLess(batch.index('run_game_review.py'), batch.index('publish_to_supabase.py'))
        self.assertNotIn('schedule:', legacy)
        self.assertNotIn('publish_to_supabase.py', legacy)
        self.assertIn('youtube-shorts-autopilot.yml', legacy)

    def test_monitor_reports_but_does_not_retry_upload(self):
        root = Path(__file__).resolve().parents[2]
        monitor = (root / '.github/workflows/youtube-autopilot-monitor.yml').read_text()
        self.assertIn('YouTube reviews autopilot (Shorts and long)', monitor)
        self.assertIn("github.event.workflow_run.conclusion)", monitor)
        self.assertIn('"timed_out"', monitor)
        self.assertIn('"startup_failure"', monitor)
        self.assertIn('gh issue create', monitor)
        self.assertNotIn('publish_to_supabase.py', monitor)
        self.assertNotIn('gh run rerun', monitor)
        self.assertNotIn('gh workflow run', monitor)

if __name__ == '__main__': unittest.main()
