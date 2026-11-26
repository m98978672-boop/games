"""A slot is only skipped when a real video is confirmed there."""
import sys
import unittest
from datetime import datetime, timezone
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from reconcile_schedule import planned_slots, render_report
from review_slot_state import assess, queue_rows, UncertainSlot, booked_slots

SLOT = datetime(2026, 11, 25, 6, tzinfo=timezone.utc)  # 09:00 Moscow


class SlotStateTests(unittest.TestCase):
    def test_slot_with_a_confirmed_video_is_not_rendered_again(self):
        missing, booked = assess([SLOT], [
            {'publish_at': '2026-11-25T06:00:00+00:00', 'status': 'scheduled', 'video_id': 'abc'},
        ])
        self.assertEqual((missing, booked), ([], [SLOT]))

    def test_unresolved_reservation_never_looks_free_or_confirmed(self):
        for status, video_id in [('failed', None), ('processing', None), ('processing', 'abc'), ('scheduled', None)]:
            jobs = [{'publish_at': '2026-11-25T06:00:00+00:00', 'status': status, 'video_id': video_id}]
            with self.subTest(status=status, video_id=video_id):
                self.assertEqual(booked_slots(jobs), [])
                with self.assertRaisesRegex(UncertainSlot, 'check YouTube Studio'):
                    assess([SLOT], jobs)
        # Uncertain reservations at another time need not stop this slot.
        # 10:00 UTC is 13:00 Moscow, a different slot from SLOT at 09:00.
        self.assertEqual(assess([SLOT], [{'publish_at': '2026-11-25T10:00:00Z', 'status': 'failed', 'video_id': None}]), ([SLOT], []))

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
        good = {'publish_at': '2026-11-25T06:00:00Z', 'status': 'scheduled', 'video_id': 'abc'}
        self.assertEqual(queue_rows({'status': 'ok', 'jobs': [good]}), [good])
        for jobs in ([good, 'junk'], [dict(good, status='unknown')], [dict(good, publish_at='bad')],
                     [dict(good, publish_at='2026-11-25T06:00:00')], [dict(good, video_id='')], [good] * 100):
            with self.subTest(jobs=jobs[:2]), self.assertRaises(ValueError):
                queue_rows({'status': 'ok', 'jobs': jobs})

    def test_planned_slots_are_regular_and_ordered(self):
        slots = planned_slots(now=datetime(2026, 11, 24, 22, 5, tzinfo=timezone.utc), days=1)
        from schedule_policy import CHANNEL_TZ
        # Three categories: two Shorts, one long review and one gameplay slot.
        self.assertEqual([s.astimezone(CHANNEL_TZ).strftime('%H:%M') for s in slots],
                         ['06:00', '09:00', '13:00', '18:00'])

    def test_report_names_the_manual_command_and_never_claims_a_retry(self):
        now = datetime(2026, 11, 24, 0, tzinfo=timezone.utc)
        text = render_report([SLOT], [], error=None, now=now)
        self.assertIn('Shorts', text)
        self.assertIn('нет подтверждения', text)
        self.assertIn('gh workflow run youtube-shorts-autopilot.yml', text)
        # The command must name the exact slot and the right format.
        self.assertIn("publish_at='2026-11-25 09:00'", text)
        self.assertIn('video_format=short', text)
        self.assertIn('Все слоты на эти дни уже заняты', render_report([], [SLOT], error=None))
        # Gameplay is blocked until the full release requirements are verified.
        gameplay = render_report([datetime(2026, 11, 25, 15, tzinfo=timezone.utc)], [], error=None, now=now)
        self.assertIn('игровой обзор', gameplay)
        self.assertIn('заблокирована', gameplay)
        self.assertNotIn('gh workflow run', gameplay)
        past = render_report([SLOT], [], error=None, now=datetime(2026, 11, 25, 7, tzinfo=timezone.utc))
        self.assertNotIn('gh workflow run', past)
        self.assertIn('YouTube Studio', past)
        unknown = render_report([], [], error='publisher unreachable')
        self.assertIn('неизвестно', unknown)

    def test_reconciliation_reports_ambiguous_slot_without_retry_command(self):
        import contextlib
        import io
        from unittest.mock import patch
        from reconcile_schedule import main
        jobs = [{'publish_at': '2026-11-25T06:00:00Z', 'status': 'failed', 'video_id': None}]
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
