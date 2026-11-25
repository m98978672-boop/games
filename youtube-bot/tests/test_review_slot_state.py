"""A slot is only skipped when a real video is confirmed there."""
import sys
import unittest
from datetime import datetime, timezone
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from reconcile_schedule import planned_slots, render_report
from review_slot_state import assess, queue_rows, UncertainSlot, booked_slots

SLOT = datetime(2026, 11, 25, 5, tzinfo=timezone.utc)  # 08:00 Moscow


class SlotStateTests(unittest.TestCase):
    def test_slot_with_a_confirmed_video_is_not_rendered_again(self):
        missing, booked = assess([SLOT], [
            {'publish_at': '2026-11-25T05:00:00+00:00', 'status': 'scheduled', 'video_id': 'abc'},
        ])
        self.assertEqual((missing, booked), ([], [SLOT]))

    def test_unresolved_reservation_never_looks_free_or_confirmed(self):
        for status, video_id in [('failed', None), ('processing', None), ('processing', 'abc'), ('scheduled', None)]:
            jobs = [{'publish_at': '2026-11-25T05:00:00+00:00', 'status': status, 'video_id': video_id}]
            with self.subTest(status=status, video_id=video_id):
                self.assertEqual(booked_slots(jobs), [])
                with self.assertRaisesRegex(UncertainSlot, 'check YouTube Studio'):
                    assess([SLOT], jobs)
        # Uncertain reservations at another time need not stop this slot.
        self.assertEqual(assess([SLOT], [{'publish_at': '2026-11-25T06:00:00Z', 'status': 'failed', 'video_id': None}]), ([SLOT], []))

    def test_a_video_at_another_hour_does_not_cover_this_slot(self):
        missing, _ = assess([SLOT], [
            {'publish_at': '2026-11-25T02:00:00+00:00', 'status': 'scheduled', 'video_id': 'other'},
        ])
        self.assertEqual(missing, [SLOT])

    def test_unreadable_publisher_response_is_an_error_not_an_empty_queue(self):
        # An empty queue would look like a free slot and invite a duplicate.
        for bad in (None, {}, {'status': 'error'}, {'status': 'ok'}, {'status': 'ok', 'jobs': 'nope'}):
            with self.subTest(bad=bad), self.assertRaises(ValueError):
                queue_rows(bad)

    def test_queue_rejects_bad_or_potentially_truncated_rows(self):
        good = {'publish_at': '2026-11-25T05:00:00Z', 'status': 'scheduled', 'video_id': 'abc'}
        self.assertEqual(queue_rows({'status': 'ok', 'jobs': [good]}), [good])
        for jobs in ([good, 'junk'], [dict(good, status='unknown')], [dict(good, publish_at='bad')],
                     [dict(good, publish_at='2026-11-25T05:00:00')], [dict(good, video_id='')], [good] * 100):
            with self.subTest(jobs=jobs[:2]), self.assertRaises(ValueError):
                queue_rows({'status': 'ok', 'jobs': jobs})

    def test_planned_slots_are_regular_and_ordered(self):
        slots = planned_slots(now=datetime(2026, 11, 24, 22, 5, tzinfo=timezone.utc), days=1)
        from schedule_policy import CHANNEL_TZ
        # Four slots per format per day, in real chronological order.
        self.assertEqual([s.astimezone(CHANNEL_TZ).strftime('%H:%M') for s in slots],
                         ['06:00', '09:00', '11:00', '13:00', '15:00', '17:00', '19:00', '21:00'])

    def test_report_names_the_manual_command_and_never_claims_a_retry(self):
        text = render_report([SLOT], [], error=None)
        self.assertIn('Shorts', text)
        self.assertIn('нет видео', text)
        self.assertIn('gh workflow run youtube-shorts-autopilot.yml', text)
        # The command must name the exact slot and the right format.
        self.assertIn("publish_at='2026-11-25 08:00'", text)
        self.assertIn('video_format=short', text)
        self.assertIn('Все слоты на эти дни уже заняты', render_report([], [SLOT], error=None))
        unknown = render_report([], [], error='publisher unreachable')
        self.assertIn('неизвестно', unknown)

    def test_reconciliation_reports_ambiguous_slot_without_retry_command(self):
        import contextlib
        import io
        from unittest.mock import patch
        from reconcile_schedule import main
        jobs = [{'publish_at': '2026-11-25T05:00:00Z', 'status': 'failed', 'video_id': None}]
        output = io.StringIO()
        with patch('reconcile_schedule.planned_slots', return_value=[SLOT]), \
             patch('reconcile_schedule._import_publisher', return_value=lambda: jobs), \
             contextlib.redirect_stdout(output):
            self.assertEqual(main([]), 1)
        self.assertIn('неопределён', output.getvalue())
        self.assertNotIn('gh workflow run', output.getvalue())

    def test_report_never_republishes_a_runner_protocol_line(self):
        # An OIDC token once reached a public issue because a captured log was
        # pasted as Markdown: "::add-mask::<token>" is a runner command, not text.
        from pathlib import Path as _Path
        workflow = (_Path(__file__).resolve().parents[2]
                    / ".github/workflows/youtube-shorts-autopilot.yml").read_text(encoding="utf-8")
        self.assertIn("grep -v -e '^::'", workflow)
        self.assertIn('^eyJ', workflow)

    def test_a_naive_planned_slot_is_rejected(self):
        with self.assertRaises(ValueError):
            assess([datetime(2026, 11, 25, 5)], [])


if __name__ == '__main__':
    unittest.main()
