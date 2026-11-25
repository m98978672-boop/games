"""The reserved slot must be fixed before render and never silently doubled."""
import sys
import unittest
from datetime import datetime, timedelta, timezone
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from schedule_policy import (CHANNEL_TZ, MIN_LEAD, SCHEDULE_LEAD, reserve_slot_before_render,
                             served_slot, settle_slot_after_render)


class SlotReservationTests(unittest.TestCase):
    def test_automatic_slot_reserves_at_least_the_lead_before_render(self):
        # 01:05 Moscow: the 06:00 long review and the 08:00 Short are both far
        # enough ahead to be fixed before rendering starts.
        now = datetime(2026, 11, 24, 22, 5, tzinfo=timezone.utc)
        self.assertEqual(reserve_slot_before_render('long', now=now).astimezone(CHANNEL_TZ).strftime('%d.%m %H:%M'), '25.11 06:00')
        self.assertEqual(reserve_slot_before_render('short', now=now).astimezone(CHANNEL_TZ).strftime('%d.%m %H:%M'), '25.11 08:00')
        self.assertGreaterEqual(SCHEDULE_LEAD, timedelta(hours=1))

    def test_a_taken_slot_is_skipped_before_rendering(self):
        # Two runs started an hour apart used to aim at the same 08:00 slot and
        # the second one failed after rendering. Now each takes a free slot.
        taken = [datetime(2026, 11, 25, 5, tzinfo=timezone.utc)]
        now = datetime(2026, 11, 24, 14, 1, tzinfo=timezone.utc)
        self.assertEqual(reserve_slot_before_render('short', now=now).astimezone(CHANNEL_TZ).strftime('%d.%m %H:%M'), '25.11 08:00')
        self.assertEqual(reserve_slot_before_render('short', now=now, occupied=taken).astimezone(CHANNEL_TZ).strftime('%d.%m %H:%M'), '25.11 12:00')

    def test_reserved_slot_is_reused_when_rendering_finishes_in_time(self):
        reserved = datetime(2026, 11, 25, 5, tzinfo=timezone.utc)  # 08:00 Moscow
        kept, adjusted = settle_slot_after_render(reserved, 'short', now=datetime(2026, 11, 25, 3, tzinfo=timezone.utc))
        self.assertEqual(kept, reserved)
        self.assertFalse(adjusted)

    def test_a_late_run_moves_once_to_the_next_regular_slot(self):
        # Rendering overran 08:00: the video must not publish at a random hour
        # and must not silently lose the day either.
        reserved = datetime(2026, 11, 25, 5, tzinfo=timezone.utc)
        moved, adjusted = settle_slot_after_render(reserved, 'short', now=reserved - MIN_LEAD / 2)
        self.assertTrue(adjusted)
        self.assertEqual(moved.astimezone(CHANNEL_TZ).strftime('%d.%m %H:%M'), '25.11 12:00')
        self.assertGreater(moved, reserved)

    def test_late_long_review_keeps_its_own_format(self):
        reserved = datetime(2026, 11, 25, 3, tzinfo=timezone.utc)  # 06:00 Moscow
        moved, adjusted = settle_slot_after_render(reserved, 'long', now=reserved)
        self.assertTrue(adjusted)
        self.assertEqual(moved.astimezone(CHANNEL_TZ).strftime('%d.%m %H:%M'), '26.11 06:00')

    def test_served_slot_follows_the_cron_not_the_runner_clock(self):
        # Each cron firing serves the next documented slot: 01:00 -> 06:00,
        # 04:00 -> 08:00, 08:00 -> 12:00. A delayed run keeps its own slot.
        cron = '0 22 * * *'
        self.assertEqual(served_slot(cron, now=datetime(2026, 11, 24, 22, 30, tzinfo=timezone.utc)).astimezone(CHANNEL_TZ).strftime('%d.%m %H:%M'), '25.11 06:00')
        self.assertEqual(served_slot(cron, now=datetime(2026, 11, 25, 15, 0, tzinfo=timezone.utc)).astimezone(CHANNEL_TZ).strftime('%d.%m %H:%M'), '25.11 06:00')
        shorts = '0 1,5 * * *'
        self.assertEqual(served_slot(shorts, now=datetime(2026, 11, 25, 1, 0, tzinfo=timezone.utc)).astimezone(CHANNEL_TZ).strftime('%d.%m %H:%M'), '25.11 08:00')
        self.assertEqual(served_slot(shorts, now=datetime(2026, 11, 25, 5, 0, tzinfo=timezone.utc)).astimezone(CHANNEL_TZ).strftime('%d.%m %H:%M'), '25.11 12:00')

    def test_delayed_shorts_run_still_serves_the_slot_it_missed(self):
        # 12:00 Moscow is already past; a run started for it must not quietly
        # claim tomorrow, otherwise today's missed slot looks covered.
        late = served_slot('0 1,5 * * *', now=datetime(2026, 11, 25, 12, 0, tzinfo=timezone.utc))
        self.assertEqual(late.astimezone(CHANNEL_TZ).strftime('%d.%m %H:%M'), '25.11 12:00')

    def test_unknown_cron_and_naive_time_fail_closed(self):
        with self.assertRaises(ValueError):
            served_slot('0 3 * * *', now=datetime(2026, 11, 25, 1, tzinfo=timezone.utc))
        with self.assertRaises(ValueError):
            served_slot('0 22 * * *', now=datetime(2026, 11, 25, 1))
        with self.assertRaises(ValueError):
            settle_slot_after_render(datetime(2026, 11, 25, 5), 'short')


if __name__ == '__main__':
    unittest.main()
