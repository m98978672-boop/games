"""The owner's gameplay rules: one a day, until done, 3 minutes decides the shelf."""
import sys
import unittest
from datetime import datetime, timedelta, timezone
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from gameplay_policy import (PlaythroughState, assess_outcome, finished_after_search,
                             next_gameplay_slot, plan_gameplay_day, posted_today_from_rows,
                             video_kind_for_duration)
from schedule_policy import CHANNEL_TZ

NOW = datetime(2026, 11, 26, 10, 0, tzinfo=timezone.utc)  # 13:00 Moscow


class DurationTests(unittest.TestCase):
    def test_three_minutes_is_the_boundary(self):
        # At or under three minutes is a Short, over is a full video. This is
        # the boundary the renderer already applies (adventure_personality.
        # SHORT_SECONDS), and it is pinned here so the two cannot drift apart.
        self.assertEqual(video_kind_for_duration(179), 'short')
        self.assertEqual(video_kind_for_duration(60), 'short')
        self.assertEqual(video_kind_for_duration(180), 'short')
        self.assertEqual(video_kind_for_duration(181), 'long')
        self.assertEqual(video_kind_for_duration(1800), 'long')

    def test_the_cutoff_matches_the_renderer(self):
        # Two constants, one meaning. If either moves, this fails.
        from adventure_personality import SHORT_SECONDS
        from schedule_policy import GAMEPLAY_SHORT_MAX_SECONDS
        self.assertEqual(SHORT_SECONDS, GAMEPLAY_SHORT_MAX_SECONDS)
        self.assertEqual(video_kind_for_duration(SHORT_SECONDS), 'short')
        self.assertEqual(video_kind_for_duration(SHORT_SECONDS + 1), 'long')

    def test_impossible_durations_are_rejected(self):
        for value in (0, -1, True, '120', None):
            with self.subTest(value=value), self.assertRaises(ValueError):
                video_kind_for_duration(value)


class DailyCeilingTests(unittest.TestCase):
    def test_one_video_a_day_while_the_playthrough_is_open(self):
        state = PlaythroughState('adventure')
        first = plan_gameplay_day(state, now=NOW, recorded_seconds=400)
        self.assertTrue(first.publish)
        self.assertEqual(first.video_kind, 'long')
        self.assertEqual(first.publish_at.astimezone(CHANNEL_TZ).strftime('%d.%m %H:%M'),
                         '26.11 18:00')

    def test_a_second_video_on_the_same_day_waits(self):
        # The ceiling is one a day, not "one per recording".
        state = PlaythroughState('adventure')
        second = plan_gameplay_day(state, now=NOW, recorded_seconds=400,
                                   already_published_today=True)
        self.assertFalse(second.publish)
        self.assertIn('уже вышло', second.reason)

    def test_nothing_is_published_without_a_recording(self):
        decision = plan_gameplay_day(PlaythroughState('adventure'), now=NOW)
        self.assertFalse(decision.publish)
        self.assertIsNone(decision.video_kind)
        self.assertIn('записи нет', decision.reason)


class PlaythroughLifecycleTests(unittest.TestCase):
    def test_a_finished_playthrough_publishes_nothing(self):
        decision = plan_gameplay_day(PlaythroughState('adventure', finished=True),
                                     now=NOW, recorded_seconds=400)
        self.assertFalse(decision.publish)
        self.assertIn('завершено', decision.reason)

    def test_the_ai_closes_the_playthrough_when_no_missions_remain(self):
        self.assertEqual(finished_after_search(0, had_new=False), 'exhausted')
        self.assertEqual(finished_after_search(2, had_new=False), 'playing')
        self.assertEqual(finished_after_search(0, had_new=True), 'playing')

    def test_a_viewer_hint_reopens_a_finished_playthrough(self):
        # The owner's own rule: viewers may know about content the AI missed.
        finished = PlaythroughState('adventure', finished=True)
        self.assertFalse(finished.is_open)
        reopened = assess_outcome(finished, 'viewer_hint')
        self.assertTrue(reopened.is_open)
        self.assertTrue(plan_gameplay_day(reopened, now=NOW, recorded_seconds=400).publish)

    def test_a_playing_session_reopens_after_an_earlier_close(self):
        state = finish = PlaythroughState('adventure', finished=True)
        self.assertEqual(assess_outcome(finish, 'playing').is_open, True)

    def test_unknown_outcome_is_rejected(self):
        with self.assertRaises(ValueError):
            assess_outcome(PlaythroughState('adventure'), 'finished')


class SlotTests(unittest.TestCase):
    def test_gameplay_slot_is_eighteen_moscow(self):
        slot = next_gameplay_slot(NOW).astimezone(CHANNEL_TZ)
        self.assertEqual(slot.strftime('%d.%m %H:%M'), '26.11 18:00')

    def test_a_run_after_eighteen_waits_for_tomorrow(self):
        late = datetime(2026, 11, 26, 16, 0, tzinfo=timezone.utc)  # 19:00 Moscow
        self.assertEqual(next_gameplay_slot(late).astimezone(CHANNEL_TZ).strftime('%d.%m %H:%M'),
                         '27.11 18:00')

    def test_gameplay_never_collides_with_a_review_or_a_short(self):
        from schedule_policy import LONG_POST_TIMES, SHORT_POST_TIMES
        taken = set(SHORT_POST_TIMES) | set(LONG_POST_TIMES)
        self.assertNotIn(next_gameplay_slot(NOW).astimezone(CHANNEL_TZ).time(), taken)

    def test_naive_time_is_rejected(self):
        with self.assertRaises(ValueError):
            next_gameplay_slot(datetime(2026, 11, 26, 10))


class RecallTests(unittest.TestCase):
    def test_state_survives_a_restart(self):
        from gameplay_policy import states_from_rows
        rows = [{'game_id': 'adventure', 'finished': True},
                {'game_id': 'adventure', 'finished': False},
                {'game_id': 'puzzle', 'finished': False}]
        states = states_from_rows(rows)
        # Newest row wins, so a restart does not reopen a finished game.
        self.assertTrue(states['adventure'].finished)
        self.assertFalse(states['puzzle'].finished)

    def test_todays_publication_is_recognised_per_game(self):
        rows = [{'game_id': 'adventure', 'publish_at': '2026-11-26T15:00:00Z'}]
        self.assertTrue(posted_today_from_rows(rows, 'adventure', NOW))
        self.assertFalse(posted_today_from_rows(rows, 'puzzle', NOW))
        self.assertFalse(posted_today_from_rows([], 'adventure', NOW))

    def test_yesterdays_publication_does_not_block_today(self):
        rows = [{'game_id': 'adventure', 'publish_at': '2026-11-25T15:00:00Z'}]
        self.assertFalse(posted_today_from_rows(rows, 'adventure', NOW))

    def test_broken_rows_are_ignored_rather_than_crashing(self):
        rows = [{'game_id': 'adventure', 'publish_at': 'not a date'},
                {'game_id': 'adventure', 'publish_at': '2026-11-26T15:00:00'},
                {'publish_at': '2026-11-26T15:00:00Z'}]
        self.assertFalse(posted_today_from_rows(rows, 'adventure', NOW))


if __name__ == '__main__':
    unittest.main()
