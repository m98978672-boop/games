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


class WiringTests(unittest.TestCase):
    """The rule is only real if something executes it."""

    def test_the_decision_reaches_a_job_that_records(self):
        import yaml
        root = Path(__file__).resolve().parents[2]
        workflow = (root / '.github/workflows/youtube-shorts-autopilot.yml').read_text(encoding='utf-8')
        parsed = yaml.safe_load(workflow)
        gate = parsed['jobs']['gameplay-gate']
        # Without job-level outputs the recorder receives empty strings and
        # records even when the gate said no.
        self.assertEqual(set(gate['outputs']), {'publish', 'video_kind', 'publish_at'})
        recorder = parsed['jobs']['record-gameplay']
        self.assertEqual(recorder['needs'], 'gameplay-gate')
        # The recording is a reusable workflow, so it must be its own job; a step
        # cannot declare `uses: ./.github/workflows/...`. Without it the chain
        # stops at a decision again.
        capture = parsed['jobs']['capture-gameplay']
        self.assertEqual(capture['needs'], 'record-gameplay')
        self.assertTrue(capture['uses'].startswith('./.github/workflows/'))
        self.assertIn('record', recorder['outputs'])
        # And the recording must reach the channel, or the lane ends at a file
        # nobody watches. The gate inside the publisher decides whether it may.
        publish = parsed['jobs']['publish-gameplay']
        self.assertEqual(sorted(publish['needs']), ['capture-gameplay', 'record-gameplay'])
        text = workflow[workflow.index('  publish-gameplay:'):]
        text = text[:text.index('\n  check-topic-history:')]
        self.assertIn('release.evidence.json', text)
        for uploader in ('publish_adventure_short.py', 'publish_adventure_draft.py'):
            self.assertIn(uploader, text)
        tail = workflow[workflow.index('  record-gameplay:'):]
        self.assertIn('GATE_PUBLISH', tail)
        self.assertIn('record=false', tail)

    def test_the_workflow_does_not_promise_a_release_that_is_blocked(self):
        # Publication is blocked until the release requirements are verifiable.
        # A summary line saying a video "will be released at 18:00" would be a
        # promise the pipeline cannot keep.
        root = Path(__file__).resolve().parents[2]
        workflow = (root / '.github/workflows/youtube-shorts-autopilot.yml').read_text(encoding='utf-8')
        tail = workflow[workflow.index('  record-gameplay:'):workflow.index('  capture-gameplay:')]
        self.assertNotIn('выйдет в', tail)
        self.assertIn('публикация ждёт проверки', tail)

    def test_a_manual_gameplay_run_exists(self):
        # Nothing could fill the 18:00 slot by hand before this input existed.
        import yaml
        root = Path(__file__).resolve().parents[2]
        parsed = yaml.safe_load((root / '.github/workflows/youtube-shorts-autopilot.yml').read_text(encoding='utf-8'))
        self.assertIn('gameplay_episode', parsed[True]['workflow_dispatch']['inputs'])

    def test_the_suggested_command_points_at_a_real_workflow(self):
        # Gameplay publication is deliberately blocked, so the honest report
        # offers no command rather than one pointing at a workflow that does not
        # exist. If a command appears, it must name a real workflow file.
        from datetime import datetime, timezone
        import reconcile_schedule
        root = Path(__file__).resolve().parents[2]
        workflows = {path.name for path in (root / '.github/workflows').glob('*.yml')}
        report = reconcile_schedule.render_report(
            [datetime(2026, 11, 26, 15, tzinfo=timezone.utc)], [], error=None, days=1)
        commands = [line for line in report.splitlines() if 'gh workflow run' in line]
        if not commands:
            self.assertIn('заблокирована', report)
            return
        named = commands[0].split('gh workflow run ')[1].split()[0]
        self.assertIn(named, workflows)


class PublicationTests(unittest.TestCase):

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
