"""A slot is only skipped when a real video is confirmed there."""
import sys
import unittest
from datetime import datetime, timezone
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from reconcile_schedule import planned_slots, render_report
from review_slot_state import assess, queue_rows

SLOT = datetime(2026, 11, 25, 5, tzinfo=timezone.utc)  # 08:00 Moscow


class SlotStateTests(unittest.TestCase):
    def test_slot_with_a_confirmed_video_is_not_rendered_again(self):
        missing, booked = assess([SLOT], [
            {'publish_at': '2026-11-25T05:00:00+00:00', 'status': 'scheduled', 'video_id': 'abc'},
        ])
        self.assertEqual((missing, booked), ([], [SLOT]))

    def test_failed_or_empty_rows_keep_the_slot_missing(self):
        jobs = [
            {'publish_at': '2026-11-25T05:00:00+00:00', 'status': 'failed', 'video_id': None},
            {'publish_at': '2026-11-25T05:00:00+00:00', 'status': 'processing', 'video_id': None},
        ]
        missing, booked = assess([SLOT], jobs)
        self.assertEqual((missing, booked), ([SLOT], []))

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

    def test_queue_rows_keeps_only_objects(self):
        self.assertEqual(queue_rows({'status': 'ok', 'jobs': [{'id': 1}, 'junk']}), [{'id': 1}])

    def test_planned_slots_are_regular_and_ordered(self):
        slots = planned_slots(now=datetime(2026, 11, 24, 22, 5, tzinfo=timezone.utc), days=1)
        from schedule_policy import CHANNEL_TZ
        self.assertEqual([s.astimezone(CHANNEL_TZ).strftime('%H:%M') for s in slots], ['06:00', '08:00', '12:00'])

    def test_report_names_the_manual_command_and_never_claims_a_retry(self):
        text = render_report([SLOT], [], error=None)
        self.assertIn('08:00', text)
        self.assertIn('gh workflow run youtube-shorts-autopilot.yml', text)
        self.assertIn('проверьте YouTube Studio', text)
        self.assertIn('Все сверенные слоты уже имеют видео', render_report([], [SLOT], error=None))
        unknown = render_report([], [], error='publisher unreachable')
        self.assertIn('очередь публикаций прочитать не удалось', unknown)

    def test_a_naive_planned_slot_is_rejected(self):
        with self.assertRaises(ValueError):
            assess([datetime(2026, 11, 25, 5)], [])


if __name__ == '__main__':
    unittest.main()
