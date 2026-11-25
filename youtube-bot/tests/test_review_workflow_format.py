import sys
import unittest
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from review_workflow_format import choose_format
from schedule_policy import CRON_SLOTS

class ReviewWorkflowFormatTests(unittest.TestCase):
    def test_schedule_uses_event_cron_not_current_time(self):
        # The category comes from the slot the cron serves, never from the clock.
        from schedule_policy import slot_format
        for cron, (_, slot_at) in CRON_SLOTS.items():
            with self.subTest(cron=cron):
                self.assertEqual(choose_format('schedule', cron, ''), slot_format(slot_at))
        # A manual format input never overrides a scheduled lane.
        self.assertEqual(choose_format('schedule', '0 13 * * *', 'short'), 'long')

    def test_every_scheduled_cron_maps_to_the_right_format(self):
        # The old build recognised only two literals, so 7 of 8 scheduled runs
        # died on "Unknown scheduled review event". Every known cron must work.
        self.assertEqual(len(CRON_SLOTS), 9)
        kinds = [choose_format('schedule', cron, '') for cron in CRON_SLOTS]
        self.assertEqual(kinds.count('short'), 4)
        self.assertEqual(kinds.count('long'), 4)
        # One gameplay firing a day, recognised as its own category.
        self.assertEqual(kinds.count('gameplay'), 1)
    def test_manual_format_and_fail_closed(self):
        for kind in ('short', 'long'):
            self.assertEqual(choose_format('workflow_dispatch', '', kind), kind)
        for args in (('schedule', '0 23 * * *', ''), ('push', '', 'long'), ('workflow_dispatch', '', 'bad')):
            with self.subTest(args=args), self.assertRaises(ValueError): choose_format(*args)
    def test_single_long_schedule_and_auth_path_are_coordinated(self):
        root = Path(__file__).resolve().parents[2]
        authorized = (root / '.github/workflows/youtube-shorts-autopilot.yml').read_text()
        legacy = (root / '.github/workflows/youtube-longform-autopilot.yml').read_text()
        # Every cron in the policy table must actually be in the workflow, and
        # the workflow must not schedule anything the policy does not know.
        for cron in CRON_SLOTS:
            self.assertIn(f'cron: "{cron}"', authorized)

        self.assertIn('review_workflow_format.py', authorized)
        self.assertIn('timeout-minutes: 360', authorized)
        self.assertIn('youtube-bot/review_batch.py', authorized)
        self.assertIn('batch_count:', authorized)
        # The pre-render check must be the readable one-line validator, not an
        # inline int() cast that dies with a traceback on a bad batch_count.
        self.assertIn('youtube-bot/review_batch.py --check', authorized)
        self.assertNotIn('from review_batch import plan', authorized)
        self.assertIn('github.event.schedule', authorized)
        batch = (root / 'youtube-bot/review_batch.py').read_text()
        self.assertLess(batch.index('run_game_review.py'), batch.index('publish_to_supabase.py'))
        self.assertNotIn('schedule:', legacy)
        self.assertNotIn('publish_to_supabase.py', legacy)
        self.assertIn('youtube-shorts-autopilot.yml', legacy)

    def test_gameplay_firing_is_isolated_from_the_review_lane(self):
        # The 18:00 gameplay firing is a third category. If it is not excluded,
        # it renders a tenth review and takes the Shorts lane, so a Short waits
        # behind a gameplay run.
        root = Path(__file__).resolve().parents[2]
        workflow = (root / '.github/workflows/youtube-shorts-autopilot.yml').read_text(encoding='utf-8')
        self.assertIn("github.event.schedule == '0 14 * * *'", workflow)
        # Its own concurrency lane, checked before the review lanes.
        group = workflow[workflow.index('group: youtube-review-'):]
        group = group[:group.index('\n')]
        self.assertIn("'gameplay'", group)
        self.assertLess(group.index("'gameplay'"), group.index("'long'"))
        # And the review render is explicitly skipped for it.
        start = workflow.index('  create-and-schedule:')
        condition = workflow[start:workflow.index('runs-on', start)]
        self.assertIn('0 14 * * *', condition)

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
        # Annotations must be read from the check run: the Actions job endpoint
        # answers 404, which used to put a raw "Not Found" JSON blob into the
        # issue instead of the failed step's message.
        self.assertIn('/$1/${job_id}/annotations', monitor)
        self.assertIn('read_annotations check-runs', monitor)
        # The 404 body is valid JSON but not an array; the reader must require
        # an array, otherwise the fallback never runs and the blob is kept.
        self.assertIn('if type == "array"', monitor)
        # Report the job that actually failed, not jobs[0]: the workflow also
        # has a read-only reconciliation job that normally succeeds.
        self.assertIn('select(.conclusion == "failure")][0].id', monitor)

if __name__ == '__main__': unittest.main()
