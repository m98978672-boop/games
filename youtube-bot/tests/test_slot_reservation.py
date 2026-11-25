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
        # 01:05 Moscow: the 06:00 long review and the 09:00 Short are both far
        # enough ahead to be fixed before rendering starts.
        now = datetime(2026, 11, 24, 22, 5, tzinfo=timezone.utc)
        self.assertEqual(reserve_slot_before_render('long', now=now).astimezone(CHANNEL_TZ).strftime('%d.%m %H:%M'), '25.11 06:00')
        self.assertEqual(reserve_slot_before_render('short', now=now).astimezone(CHANNEL_TZ).strftime('%d.%m %H:%M'), '25.11 09:00')
        self.assertGreaterEqual(SCHEDULE_LEAD, timedelta(hours=1))

    def test_a_taken_slot_is_skipped_before_rendering(self):
        # Two runs started an hour apart used to aim at the same slot and the
        # second one failed after rendering. Now each takes a free slot.
        taken = [datetime(2026, 11, 25, 6, tzinfo=timezone.utc)]  # 09:00 Moscow
        now = datetime(2026, 11, 25, 3, tzinfo=timezone.utc)      # 06:00 Moscow
        self.assertEqual(reserve_slot_before_render('short', now=now).astimezone(CHANNEL_TZ).strftime('%d.%m %H:%M'), '25.11 09:00')
        self.assertEqual(reserve_slot_before_render('short', now=now, occupied=taken).astimezone(CHANNEL_TZ).strftime('%d.%m %H:%M'), '25.11 13:00')

    def test_reserved_slot_is_reused_when_rendering_finishes_in_time(self):
        reserved = datetime(2026, 11, 25, 6, tzinfo=timezone.utc)  # 09:00 Moscow
        kept, adjusted = settle_slot_after_render(reserved, 'short', now=datetime(2026, 11, 25, 4, tzinfo=timezone.utc))
        self.assertEqual(kept, reserved)
        self.assertFalse(adjusted)

    def test_a_late_run_moves_once_to_the_next_regular_slot(self):
        # Rendering overran 09:00: the video must not publish at a random hour
        # and must not silently lose the day either.
        reserved = datetime(2026, 11, 25, 6, tzinfo=timezone.utc)  # 09:00 Moscow
        moved, adjusted = settle_slot_after_render(reserved, 'short', now=reserved - MIN_LEAD / 2)
        self.assertTrue(adjusted)
        self.assertEqual(moved.astimezone(CHANNEL_TZ).strftime('%d.%m %H:%M'), '25.11 13:00')
        self.assertGreater(moved, reserved)

    def test_multi_day_delay_never_selects_a_past_slot(self):
        reserved = datetime(2026, 11, 25, 5, tzinfo=timezone.utc)
        now = datetime(2026, 11, 28, 8, 40, tzinfo=timezone.utc)
        for kind in ('short', 'long'):
            with self.subTest(kind=kind):
                moved, adjusted = settle_slot_after_render(reserved, kind, now=now)
                self.assertTrue(adjusted)
                self.assertGreaterEqual(moved, now + MIN_LEAD)
                self.assertGreater(moved, reserved)

    def test_late_long_review_keeps_its_own_format(self):
        reserved = datetime(2026, 11, 25, 3, tzinfo=timezone.utc)  # 06:00 Moscow
        moved, adjusted = settle_slot_after_render(reserved, 'long', now=reserved)
        self.assertTrue(adjusted)
        self.assertEqual(moved.astimezone(CHANNEL_TZ).strftime('%d.%m %H:%M'), '25.11 11:00')

    def test_served_slot_follows_the_cron_not_the_runner_clock(self):
        # Every firing serves exactly one documented slot; a delayed run keeps
        # its own slot instead of drifting to a neighbour's.
        first_long = '0 0 * * *'
        self.assertEqual(served_slot(first_long, now=datetime(2026, 11, 25, 0, 30, tzinfo=timezone.utc)).astimezone(CHANNEL_TZ).strftime('%d.%m %H:%M'), '25.11 06:00')
        # A run that starts hours late still serves its own slot, not tomorrow's.
        self.assertEqual(served_slot(first_long, now=datetime(2026, 11, 25, 3, 30, tzinfo=timezone.utc)).astimezone(CHANNEL_TZ).strftime('%d.%m %H:%M'), '25.11 06:00')
        pairs = [
            ('0 3 * * *', datetime(2026, 11, 25, 3, 0, tzinfo=timezone.utc), '25.11 09:00'),
            ('0 7 * * *', datetime(2026, 11, 25, 7, 0, tzinfo=timezone.utc), '25.11 13:00'),
            ('0 11 * * *', datetime(2026, 11, 25, 11, 0, tzinfo=timezone.utc), '25.11 17:00'),
            ('0 15 * * *', datetime(2026, 11, 25, 15, 0, tzinfo=timezone.utc), '25.11 21:00'),
            ('0 0 * * *', datetime(2026, 11, 25, 0, 0, tzinfo=timezone.utc), '25.11 06:00'),
            ('0 5 * * *', datetime(2026, 11, 25, 5, 0, tzinfo=timezone.utc), '25.11 11:00'),
            ('0 9 * * *', datetime(2026, 11, 25, 9, 0, tzinfo=timezone.utc), '25.11 15:00'),
            ('0 13 * * *', datetime(2026, 11, 25, 13, 0, tzinfo=timezone.utc), '25.11 19:00'),
        ]
        for cron, now, expected in pairs:
            with self.subTest(cron=cron):
                self.assertEqual(served_slot(cron, now=now).astimezone(CHANNEL_TZ).strftime('%d.%m %H:%M'), expected)

    def test_delayed_shorts_run_still_serves_the_slot_it_missed(self):
        # 21:00 Moscow is already past; a run started for it must not quietly
        # claim tomorrow, otherwise today's missed slot looks covered.
        late = served_slot('0 15 * * *', now=datetime(2026, 11, 25, 18, 30, tzinfo=timezone.utc))
        self.assertEqual(late.astimezone(CHANNEL_TZ).strftime('%d.%m %H:%M'), '25.11 21:00')

    def test_unknown_cron_and_naive_time_fail_closed(self):
        with self.assertRaises(ValueError):
            served_slot('0 8 * * *', now=datetime(2026, 11, 25, 1, tzinfo=timezone.utc))
        with self.assertRaises(ValueError):
            served_slot('0 0 * * *', now=datetime(2026, 11, 25, 1))
        with self.assertRaises(ValueError):
            settle_slot_after_render(datetime(2026, 11, 25, 5), 'short')


if __name__ == '__main__':
    unittest.main()
