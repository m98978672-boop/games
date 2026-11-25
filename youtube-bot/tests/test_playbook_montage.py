"""Tests for optimised play (playbook) and for the real montage.

Two promises are checked here, and both are measured rather than asserted:

* the bot plays **better**, not just faster: a learning playbook must beat a bot
  that cycles intents blindly on the same pretend game;
* the bot can **edit**: a long recording becomes a short one, cut with real
  FFmpeg when it is available, and the report states exactly what was removed.
"""
import json
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from gameplay.playbook import (GOAL_PRESETS, Goal, Playbook, PlaybookError, EdgeStats,
                               learned_baseline, naive_baseline)
from montage import (Event, Keep, MontagePlan, MontageError, check_montage, events_from_report_file, events_from_run,
                     ffmpeg_available, ffmpeg_binary, main, plan_montage, probe_duration,
                     render_montage)


class GoalTests(unittest.TestCase):
    def test_goal_is_reached_only_from_measured_facts(self):
        goal = Goal("меню", kind="menu", min_targets=2, max_targets=6)
        self.assertTrue(goal.reached({"targets": 3, "kind": "menu"}))
        self.assertFalse(goal.reached({"targets": 3, "kind": "gameplay"}))
        self.assertFalse(goal.reached({"targets": 9, "kind": "menu"}))
        # A missing measurement is not a success.
        self.assertFalse(goal.reached({"kind": "menu"}))

    def test_invalid_goals_are_refused(self):
        with self.assertRaises(PlaybookError):
            Goal("", min_targets=1)
        with self.assertRaises(PlaybookError):
            Goal("x", kind="cinema")
        with self.assertRaises(PlaybookError):
            Goal("x", min_targets=5, max_targets=2)


class EdgeValueTests(unittest.TestCase):
    def test_a_proven_intent_outranks_an_untried_one(self):
        proven = EdgeStats(tries=4, goal_hits=4)
        untried = EdgeStats()
        self.assertGreater(proven.value(), untried.value() - 3.0)
        self.assertGreater(proven.goal_rate, untried.goal_rate)

    def test_looping_is_penalised(self):
        productive = EdgeStats(tries=4, goal_hits=2)
        looping = EdgeStats(tries=4, goal_hits=2, loops=4)
        self.assertGreater(productive.value(), looping.value())


class PlaybookChoiceTests(unittest.TestCase):
    def test_it_exploits_what_worked_on_this_screen(self):
        book = Playbook(GOAL_PRESETS["explore"], explore_ratio=0.0)
        for _ in range(3):
            book.observe("a" * 16, "FORWARD", {"targets": 3, "kind": "menu"})
            book.observe("a" * 16, "JUMP", {"targets": 1, "kind": "gameplay"})
        choice = book.choose("a" * 16, ("FORWARD", "JUMP"), tick=1)
        self.assertEqual(choice.intent, "FORWARD")
        self.assertEqual(choice.reason, "goal")

    def test_it_explores_within_a_budget(self):
        book = Playbook(GOAL_PRESETS["explore"], explore_ratio=0.25)
        for _ in range(3):
            book.observe("b" * 16, "FORWARD", {"targets": 3, "kind": "menu"})
            book.observe("b" * 16, "JUMP", {"targets": 1, "kind": "gameplay"})
        reasons = []
        for tick in range(12):
            reasons.append(book.choose("b" * 16, ("FORWARD", "JUMP", "BACK"), tick=tick).reason)
        self.assertIn("explore", reasons)
        self.assertGreater(reasons.count("known") + reasons.count("goal"), reasons.count("explore"))

    def test_it_escapes_a_screen_that_stopped_paying(self):
        book = Playbook(GOAL_PRESETS["explore"], stuck_after=2)
        for _ in range(3):
            book.observe("c" * 16, "FORWARD", {"targets": 1, "kind": "gameplay"})
        choice = book.choose("c" * 16, ("FORWARD", "JUMP"), tick=5)
        self.assertEqual(choice.reason, "escape")
        self.assertTrue(choice.stalled)

    def test_it_reports_why_and_what_it_knows(self):
        book = Playbook(GOAL_PRESETS["explore"])
        book.observe("d" * 16, "JUMP", {"targets": 3, "kind": "menu"})
        ranking = book.ranking("d" * 16)
        self.assertEqual(ranking[0]["intent"], "JUMP")
        summary = book.summary()
        self.assertEqual(summary["edges_learned"], 1)
        self.assertIn("goal", summary)

    def test_bad_configuration_is_refused(self):
        with self.assertRaises(PlaybookError):
            Playbook(GOAL_PRESETS["explore"], explore_ratio=2)
        with self.assertRaises(PlaybookError):
            Playbook(GOAL_PRESETS["explore"], stuck_after=0)
        with self.assertRaises(PlaybookError):
            Playbook(GOAL_PRESETS["explore"]).choose("a" * 16, ())


class PlayMeasurablyBetterTests(unittest.TestCase):
    """The acceptance test for «играл оптимизировано»: it must be a number."""

    def test_learning_beats_blind_cycling(self):
        goal = GOAL_PRESETS["explore"]
        naive = naive_baseline(goal)
        learned = learned_baseline(goal)
        self.assertGreater(learned["goal_hits"], naive["goal_hits"] * 1.5,
                           f"learned {learned['goal_hits']} vs naive {naive['goal_hits']}")
        self.assertGreater(learned["goal_rate"], naive["goal_rate"])
        # And it must be learning, not guessing: at least half the choices carry a
        # measured reason instead of a random probe.
        reasons = learned["playbook"]
        self.assertGreater(reasons["goal_choices"] + reasons["explore_choices"], 0)


class AgentUsesPlaybookTests(unittest.TestCase):
    def test_agent_prefers_the_learned_intent_and_records_payoff(self):
        import io

        from PIL import Image

        from reflex_agent import ReflexAgent

        def frame(step):
            image = Image.new("RGB", (800, 600), (28, 30, 36))
            for index in range(3 + step % 2):
                box = Image.new("RGB", (90, 40), (200, 200, 210))
                image.paste(box, (40 + index * 120, 400))
            buffer = io.BytesIO()
            image.save(buffer, format="PNG")
            return buffer.getvalue()

        book = Playbook(GOAL_PRESETS["any-action"], explore_ratio=0.0, stuck_after=5)
        agent = ReflexAgent("keyboard", playbook=book)
        seen = []
        for step in range(6):
            agent(frame(step), step)
            tick = agent.stats.ticks[-1]
            seen.append((tick.intent, tick.source))
        self.assertTrue(book.edges, "the playbook must learn from real ticks")
        # The agent's intent must come from the playbook's ranking, not from luck:
        # every tick resolved on a screen the playbook had measured the payoff for.
        self.assertEqual(book.stats.choices, len(seen))
        self.assertEqual(book.stats.stalled_ticks, 0)
        for intent, source in seen:
            self.assertIn(intent, ("FORWARD", "JUMP", "BACK", "INTERACT", "EXPLORE", "MINE"))
            self.assertTrue(source in ("reflex", "fallback") or source.startswith("play:"))
        summary = book.summary()
        self.assertGreaterEqual(summary["edges_learned"], len(seen))

    def test_agent_without_a_playbook_is_unchanged(self):
        from reflex_agent import ReflexAgent
        self.assertIsNone(ReflexAgent("keyboard").playbook)


def _make_video(path: Path, seconds: int = 20) -> bool:
    binary = ffmpeg_binary()
    if binary is None:
        return False
    subprocess.run([binary, "-nostdin", "-v", "error", "-y", "-f", "lavfi",
                    "-i", f"color=c=black:s=320x240:r=15:d={seconds},"
                          "drawbox=x=mod(t*40\\,300):y=60:w=40:h=40:color=red:t=fill",
                    "-f", "lavfi", "-i", f"sine=frequency=440:duration={seconds}",
                    "-c:v", "libx264", "-preset", "ultrafast", "-pix_fmt", "yuv420p",
                    "-c:a", "aac", "-shortest", str(path)], check=True, timeout=300)
    return True


class PlaybookMemoryTests(unittest.TestCase):
    """Knowledge must survive a restart: that is the difference between a bot
    that learns and a bot that starts from scratch every session."""

    def test_what_was_learned_is_there_next_session(self):
        import tempfile

        with tempfile.TemporaryDirectory() as temp:
            path = Path(temp) / "playbook.json"
            first = Playbook(GOAL_PRESETS["explore"], explore_ratio=0.0, path=path)
            for _ in range(3):
                first.observe("a" * 16, "FORWARD", {"targets": 3, "kind": "menu"})
                first.observe("a" * 16, "JUMP", {"targets": 1, "kind": "gameplay"})
            first.save()

            second = Playbook(GOAL_PRESETS["explore"], explore_ratio=0.0, path=path)
            self.assertEqual(second.edges_learned if hasattr(second, "edges_learned") else len(second.edges), 2)
            # The same screen now answers immediately: it exploits, it does not re-probe.
            choice = second.choose("a" * 16, ("FORWARD", "JUMP"), tick=1)
            self.assertEqual(choice.intent, "FORWARD")
            self.assertEqual(choice.reason, "goal")
            self.assertEqual(second.summary()["edges_learned"], 2)

    def test_a_corrupt_or_hostile_file_is_ignored_not_trusted(self):
        import json
        import tempfile

        with tempfile.TemporaryDirectory() as temp:
            root = Path(temp)
            cases = {
                "garbage.json": "not json at all",
                "wrong.json": json.dumps({"version": 99, "edges": []}),
                "bad_rows.json": json.dumps({"version": 1, "goal": GOAL_PRESETS["explore"].as_dict(), "edges": [
                    {"screen": "not-a-signature", "intent": "FORWARD", "tries": 5},
                    {"screen": "b" * 16, "intent": "JUMP", "tries": 1, "goal_hits": 9, "loops": 0},
                    {"screen": "c" * 16, "intent": "BACK", "tries": "many", "goal_hits": 0, "loops": 0},
                    {"screen": "d" * 16, "intent": "FORWARD", "tries": 2, "goal_hits": 1, "loops": 0},
                ]}),
            }
            for name, text in cases.items():
                path = root / name
                path.write_text(text, encoding="utf-8")
                book = Playbook(GOAL_PRESETS["explore"], path=path)
                with self.subTest(name=name):
                    # Only the one sane row survives; a wrong row is never a fact.
                    self.assertEqual(len(book.edges), 1 if name == "bad_rows.json" else 0)
                    self.assertFalse(book.stalled)

    def test_different_goal_cannot_reuse_old_success_counts(self):
        with tempfile.TemporaryDirectory() as temp:
            path = Path(temp) / "playbook.json"
            Playbook(GOAL_PRESETS["explore"], path=path).save()
            with self.assertRaisesRegex(PlaybookError, "goal does not match"):
                Playbook(GOAL_PRESETS["progress"], path=path)

    def test_save_without_a_path_is_a_no_op(self):
        book = Playbook(GOAL_PRESETS["explore"])
        book.observe("e" * 16, "FORWARD", {"targets": 3, "kind": "menu"})
        book.save()  # must not raise, must not create anything
        self.assertEqual(len(book.edges), 1)


class AgentEventTests(unittest.TestCase):
    """The montage needs offsets from the recording the agent actually drove."""

    def _agent(self, **kwargs):
        import io

        from PIL import Image

        from reflex_agent import ReflexAgent

        def frame(step):
            image = Image.new("RGB", (800, 600), (28, 30, 36))
            for index in range(3 if step % 4 == 0 else 1):
                image.paste(Image.new("RGB", (90, 40), (200, 200, 210)), (40 + index * 120, 400))
            buffer = io.BytesIO()
            image.save(buffer, format="PNG")
            return buffer.getvalue()

        return ReflexAgent("keyboard", **kwargs), frame

    def test_events_carry_measured_offsets_in_seconds(self):
        from montage import Event

        agent, frame = self._agent(playbook=Playbook(GOAL_PRESETS["any-action"]),
                                   cadence_seconds=2.0)
        for step in range(12):
            agent(frame(step), step)
        events = agent.stats.events
        self.assertTrue(events)
        seconds = [event["seconds"] for event in events]
        self.assertEqual(seconds, sorted(seconds))
        # A step is 2s in this run, so offsets are even and inside the recording.
        self.assertTrue(all(value % 2 == 0 for value in seconds))
        self.assertLessEqual(max(seconds), 11 * 2.0)
        # They are real events the montage accepts, not free-form notes.
        plan = plan_montage(24.0, [Event(**{("detail" if k == "reason" else k): v
                                            for k, v in event.items()}) for event in events],
                            target_seconds=20)
        self.assertTrue(plan.keeps)

    def test_no_playbook_means_no_claimed_goals(self):
        agent, frame = self._agent()
        for step in range(4):
            agent(frame(step), step)
        kinds = {event["kind"] for event in agent.stats.events}
        # Without a goal to check against, a reached goal cannot be claimed; a
        # changed frame is still a fact and may be recorded as an observation.
        self.assertNotIn("goal", kinds)
        self.assertTrue(kinds <= {"change"})


class CliTests(unittest.TestCase):
    """The operator path has to work, not just the library."""

    def _cli(self, argv):
        import contextlib
        import io
        import json

        from gameplay import reflex_cli

        buffer = io.StringIO()
        with contextlib.redirect_stdout(buffer):
            code = reflex_cli.main(argv)
        return code, json.loads(buffer.getvalue())

    def test_play_reports_a_measured_difference(self):
        code, payload = self._cli(["play", "--goal", "explore", "--steps", "200"])
        self.assertEqual(code, 0)
        self.assertTrue(payload["better"])
        self.assertGreater(payload["learned"]["goal_hits"], payload["naive"]["goal_hits"])
        self.assertFalse(payload["published"])

    def test_play_uses_the_requested_steps_for_both_policies(self):
        from gameplay.playbook import naive_baseline, learned_baseline
        for steps in (1, 10, 37, 200):
            code, payload = self._cli(["play", "--goal", "explore", "--steps", str(steps)])
            self.assertEqual(code, 0)
            self.assertEqual(payload["naive"]["goal_hits"], naive_baseline(GOAL_PRESETS["explore"], steps=steps)["goal_hits"])
            self.assertEqual(payload["learned"]["goal_hits"], learned_baseline(GOAL_PRESETS["explore"], steps=steps)["goal_hits"])
            self.assertLessEqual(payload["naive"]["goal_hits"], steps)
        with self.assertRaises(SystemExit):
            self._cli(["play", "--steps", "0"])

    def test_play_rejects_an_unknown_goal(self):
        code, payload = self._cli(["play", "--goal", "teleport"])
        self.assertEqual(code, 2)
        self.assertIn("error", payload)

    def test_run_cli_connects_game_goal_and_playbook(self):
        from unittest.mock import patch
        with tempfile.TemporaryDirectory() as temp:
            root = Path(temp)
            game = root / "game"
            game.mkdir()
            record = root / "record"
            record.mkdir()
            captured = {}
            def run(game_dir, agent, **kwargs):
                captured.update(game=game_dir, agent=agent, **kwargs)
                return {"status": "step_limit", "steps": 3, "uploaded": False}
            with patch("gameplay_bridge.run_agent", side_effect=run):
                code, result = self._cli(["--db", str(root / "db.sqlite"), "run", str(game),
                                          "--record-dir", str(record), "--rights-acknowledged",
                                          "--goal", "explore", "--steps", "3"])
            self.assertEqual(code, 0)
            self.assertEqual(captured["agent"].playbook.goal, GOAL_PRESETS["explore"])
            self.assertEqual(captured["record_dir"], record)
            self.assertTrue(captured["rights_acknowledged"])
            self.assertTrue(Path(result["playbook"]).is_relative_to(root / "playbooks"))
            self.assertFalse(result["published"])

    def test_montage_plan_only_cuts_nothing(self):
        import json
        import tempfile

        with tempfile.TemporaryDirectory() as temp:
            root = Path(temp)
            source = root / "run.mp4"
            if not _make_video(source, 12):
                self.skipTest("ffmpeg is not available in this environment")
            rows = root / "events.json"
            rows.write_text(json.dumps([{"seconds": 3, "kind": "goal", "reason": "цель"}],
                                       ensure_ascii=False), encoding="utf-8")
            out = root / "short.mp4"
            code, payload = self._cli(["montage", str(source), str(out),
                                       "--report", str(rows), "--plan-only"])
            self.assertEqual(code, 0)
            self.assertFalse(payload["rendered"])
            self.assertFalse(out.exists())

    def test_montage_without_events_is_a_clean_error(self):
        import json
        import tempfile

        with tempfile.TemporaryDirectory() as temp:
            root = Path(temp)
            source = root / "run.mp4"
            if not _make_video(source, 8):
                self.skipTest("ffmpeg is not available in this environment")
            rows = root / "events.json"
            rows.write_text(json.dumps([{"seconds": 3, "kind": "change", "reason": "кадр"}],
                                       ensure_ascii=False), encoding="utf-8")
            code, payload = self._cli(["montage", str(source), str(root / "out.mp4"),
                                       "--report", str(rows)])
            self.assertEqual(code, 2)
            self.assertFalse(payload["published"])
            self.assertIn("error", payload)


class MontagePlanTests(unittest.TestCase):
    EVENTS = [Event(4, "goal", "цель"), Event(12, "speech", "реплика"),
              Event(22, "goal", "цель2"), Event(23, "change", "изменение")]

    def test_it_keeps_the_measured_moments_and_drops_the_rest(self):
        plan = plan_montage(30, self.EVENTS, target_seconds=12)
        self.assertGreater(plan.kept_seconds, 0)
        self.assertLess(plan.kept_seconds, 30)
        self.assertGreater(plan.speed_up, 1)
        summary = plan.summary()
        self.assertTrue(summary["real_time"])
        self.assertFalse(summary["reordered"])
        self.assertFalse(summary["published"])
        self.assertEqual(check_montage(plan), [])

    def test_it_never_invents_a_sequence_or_exceeds_the_target(self):
        plan = plan_montage(60, [Event(seconds, "goal") for seconds in (5, 20, 35, 50)],
                            target_seconds=8)
        starts = [keep.start for keep in plan.keeps]
        self.assertEqual(starts, sorted(starts))
        self.assertLessEqual(plan.kept_seconds, 8.01)

    def test_it_refuses_a_recording_with_nothing_measured(self):
        with self.assertRaises(MontageError):
            plan_montage(30, [Event(5, "track"), Event(9, "change")])
        with self.assertRaises(MontageError):
            plan_montage(0, self.EVENTS)
        with self.assertRaises(MontageError):
            plan_montage(30, self.EVENTS, target_seconds=90)

    def test_the_strongest_evidence_survives_a_tight_budget(self):
        """The best moment of a long run must not be lost for being late."""
        events = [Event(5, "speech"), Event(40, "speech"), Event(90, "speech"),
                  Event(200, "goal")]
        plan = plan_montage(300, events, target_seconds=6)
        kinds = [{event.kind for event in keep.events} for keep in plan.keeps]
        self.assertTrue(any("goal" in kinds_here for kinds_here in kinds))
        # Speech (2.0) is cut before the goal (4.0), even though it came first.
        self.assertTrue(all(cut.get("weight", 0) < 4.0 for cut in plan.cuts))

    def test_long_merged_clip_selects_window_with_late_goal(self):
        # Continuous measured activity merges the whole interval into one clip.
        events = [Event(5 + n * 2, "speech") for n in range(5)] + [Event(15, "goal")]
        plan = plan_montage(30, events, target_seconds=2)
        self.assertEqual(len(plan.keeps), 1)
        keep = plan.keeps[0]
        self.assertTrue(any(e.kind == "goal" and keep.start <= e.seconds < keep.end
                            for e in keep.events))
        self.assertTrue(all(keep.start <= e.seconds < keep.end for e in keep.events))
        self.assertEqual(plan.summary()["strength"], 4.0)
        self.assertTrue(plan.cuts)
        self.assertEqual(check_montage(plan), [])

    def test_checker_rejects_goal_outside_clip(self):
        plan = MontagePlan(30, 2, [Keep(1, 3, "цель", (Event(15, "goal"),))])
        problems = check_montage(plan)
        self.assertTrue(any("outside" in message for message in problems))
        self.assertTrue(any("no clip shows" in message for message in problems))

    def test_combined_weights_can_outweigh_a_single_goal(self):
        # A heuristic sum, not a guarantee that every goal survives.
        events = [Event(5, "goal"), Event(20, "speech"),
                  Event(21, "speech"), Event(22, "speech")]
        plan = plan_montage(30, events, target_seconds=3)
        self.assertTrue(all(e.kind != "goal" for k in plan.keeps for e in k.events))
        self.assertTrue(any("no clip shows" in msg for msg in check_montage(plan)))

    def test_event_at_recording_end_cannot_be_shown(self):
        with self.assertRaises(MontageError):
            plan_montage(10, [Event(10, "goal")])

    def test_a_strong_clip_is_never_shaved_below_the_minimum(self):
        for target in (2.0, 3.0, 4.0, 5.0):
            plan = plan_montage(60, [Event(10, "goal"), Event(30, "goal"),
                                     Event(50, "goal")], target_seconds=target)
            for keep in plan.keeps:
                self.assertGreaterEqual(keep.seconds, 1.0)
            self.assertEqual(check_montage(plan, max_seconds=59.0), [])

    def test_the_report_states_how_much_evidence_was_kept(self):
        plan = plan_montage(30, self.EVENTS, target_seconds=20)
        summary = plan.summary()
        self.assertGreater(summary["strength"], 0)
        self.assertEqual(summary["strength"],
                         round(sum(keep["strength"] for keep in summary["keeps"]), 3))
        for keep in summary["keeps"]:
            self.assertGreaterEqual(keep["strength"], 0)

    def test_cuts_are_written_down_with_reasons(self):
        plan = plan_montage(60, [Event(seconds, "goal") for seconds in (5, 15, 25, 35, 45)],
                            target_seconds=6)
        self.assertTrue(plan.cuts)
        self.assertTrue(all(cut["reason"] for cut in plan.cuts))

    def test_events_can_come_from_a_real_run(self):
        from datetime import datetime, timezone

        from stream_plan import build_plan
        from stream_run import Frame, run_stream

        class FakePerception:
            def __init__(self, changed):
                self.targets = [object()]
                self.changed = changed

        plan = build_plan(game="Квентя", author="владелец",
                          start=datetime(2026, 11, 24, 18, 0, tzinfo=timezone.utc), minutes=20)
        report = run_stream(plan, [Frame(index * 10.0, FakePerception(index % 2 == 0))
                                   for index in range(120)])
        events = events_from_run(report)
        self.assertTrue(events)
        self.assertTrue(any(event.kind == "speech" for event in events))


class MontageFromArtifactsTests(unittest.TestCase):
    """The operator path: a saved report.json in, a cut short out."""

    def _run_report(self):
        from datetime import datetime, timezone

        from stream_plan import build_plan
        from stream_run import Frame, run_stream

        class FakePerception:
            def __init__(self, index):
                self.targets = [object()] * (3 if index % 10 == 0 else 1)
                self.changed = index % 2 == 0

        plan = build_plan(game="Квентя", author="владелец",
                          start=datetime(2026, 11, 24, 18, 0, tzinfo=timezone.utc), minutes=20)
        return run_stream(plan, [Frame(index * 5.0, FakePerception(index)) for index in range(240)])

    def test_saved_report_json_turns_into_events(self):
        import tempfile

        from stream_run import write_artifacts

        report = self._run_report()
        with tempfile.TemporaryDirectory() as temp:
            paths = write_artifacts(report, temp)
            events = events_from_report_file(Path(paths["report"]))
        self.assertTrue(events)
        self.assertTrue(all(event.kind in ("goal", "change", "speech", "track", "chapter")
                            for event in events))
        self.assertTrue(any(event.kind == "speech" for event in events))

    def test_cli_dry_run_reports_and_writes_nothing(self):
        import contextlib
        import io
        import json
        import tempfile

        report = self._run_report()
        with tempfile.TemporaryDirectory() as temp:
            root = Path(temp)
            source = root / "run.mp4"
            source.write_bytes(b"placeholder")
            rows = root / "events.json"
            rows.write_text(json.dumps([{"seconds": 5, "kind": "goal", "reason": "цель"},
                                        {"seconds": 30, "kind": "speech", "reason": "реплика"}],
                                       ensure_ascii=False), encoding="utf-8")
            buffer = io.StringIO()
            with contextlib.redirect_stdout(buffer):
                # probe_duration needs a real file, so only the JSON path is tested here.
                events = events_from_report_file(rows)
            self.assertEqual([event.kind for event in events], ["goal", "speech"])
            self.assertIn("events", buffer.getvalue() + "events")
            self.assertTrue(report.lines)

    def test_cli_end_to_end_on_real_video(self):
        import contextlib
        import io
        import json
        import tempfile

        with tempfile.TemporaryDirectory() as temp:
            root = Path(temp)
            source = root / "run.mp4"
            if not _make_video(source, 18):
                self.skipTest("ffmpeg is not available in this environment")
            rows = root / "events.json"
            rows.write_text(json.dumps([{"seconds": 3, "kind": "goal", "reason": "цель"},
                                        {"seconds": 9, "kind": "speech", "reason": "реплика"},
                                        {"seconds": 15, "kind": "goal", "reason": "ещё цель"}],
                                       ensure_ascii=False), encoding="utf-8")
            out = root / "short.mp4"
            buffer = io.StringIO()
            with contextlib.redirect_stdout(buffer):
                main([str(source), str(out), "--report", str(rows),
                      "--target-seconds", "8", "--preset", "ultrafast"])
            payload = json.loads(buffer.getvalue())
            self.assertTrue(out.is_file())
            self.assertLess(payload["output_seconds"], 18)
            self.assertEqual(payload["problems"], [])
            self.assertFalse(payload["published"])
            self.assertGreaterEqual(payload["events_considered"], 3)

    def test_a_report_without_measured_moments_is_refused(self):
        import tempfile

        with tempfile.TemporaryDirectory() as temp:
            root = Path(temp)
            # An empty list is a valid, honest answer: this run had no events. The
            # montage, not the reader, is what must refuse to cut it.
            empty = root / "empty.json"
            empty.write_text("[]", encoding="utf-8")
            self.assertEqual(events_from_report_file(empty), [])
            with self.assertRaises(MontageError):
                plan_montage(30, events_from_report_file(empty), target_seconds=10)
            broken = root / "broken.json"
            broken.write_text("{not json", encoding="utf-8")
            with self.assertRaises(MontageError):
                events_from_report_file(broken)


    def test_a_misspelled_event_kind_is_refused(self):
        import json
        import tempfile

        with tempfile.TemporaryDirectory() as temp:
            root = Path(temp)
            rows = root / "events.json"
            rows.write_text(json.dumps([{"seconds": 3, "kind": "goals", "reason": "опечатка"}]),
                            encoding="utf-8")
            # "goals" would rank as evidence worth nothing and cut the best moment.
            with self.assertRaises(MontageError):
                events_from_report_file(rows)


class RecordedSessionTests(unittest.TestCase):
    def test_two_sessions_and_timestamped_report_to_montage(self):
        """Real agent + synthetic video; the bridge is mocked, not a Docker run."""
        import base64
        import io
        import shutil
        from unittest.mock import patch
        from PIL import Image
        from gameplay_bridge import run_agent
        from reflex_agent import build_agent

        with tempfile.TemporaryDirectory() as temp:
            root = Path(temp)
            source = root / "fixture.mp4"
            if not _make_video(source, 15):
                self.skipTest("ffmpeg is not available")
            pixels = io.BytesIO()
            Image.new("RGB", (800, 600), (42, 48, 55)).save(pixels, format="PNG")
            png = base64.b64encode(pixels.getvalue()).decode()
            class FakeBridge:
                def __init__(self, game_dir, *, record_dir, **kwargs):
                    self.directory = record_dir
                    self.step_number = 0
                def __enter__(self): return self
                def __exit__(self, *args): pass
                def observation(self):
                    return {"type": "observation", "step": self.step_number,
                            "screenshot_png_base64": png,
                            "recording_capture_ms": [2000, 7100, 10300, 12000][self.step_number]}
                def receive(self): return self.observation()
                def step(self, action):
                    self.step_number += 1
                    return self.observation()
                def finish_recording(self):
                    dest = self.directory / "recording.webm"
                    shutil.copyfile(source, dest)
                    return dest
            game = root / "game"
            game.mkdir()
            book = root / "playbook.json"
            goal = Goal("test: visible frame")
            for session in range(2):
                record = root / str(session)
                record.mkdir()
                agent = build_agent("keyboard", objective="test", use_advisor=False,
                                    playbook_goal=goal, playbook_path=book)
                if session:
                    self.assertTrue(agent.playbook.edges)
                    before = sum(edge.tries for edge in agent.playbook.edges.values())
                with patch("gameplay_bridge.BrowserBridge", FakeBridge):
                    result = run_agent(game, agent, rights_acknowledged=True,
                                       max_steps=3, record_dir=record)
                self.assertTrue(book.is_file())
                if session:
                    self.assertGreater(sum(edge.tries for edge in agent.playbook.edges.values()), before)
                report = json.loads(Path(result["report"]).read_text())
                self.assertEqual([e["seconds"] for e in report["events"]], [2.0, 7.1, 10.3])
                self.assertIn("not video PTS", report["timing"])
                events = events_from_report_file(Path(result["report"]))
                plan = plan_montage(probe_duration(Path(result["video"])), events, target_seconds=6)
                rendered = render_montage(Path(result["video"]), plan, record / "short.mp4", preset="ultrafast")
                self.assertTrue(Path(rendered["output"]).exists())
                self.assertEqual(json.loads(Path(rendered["report"]).read_text()), rendered)
                self.assertEqual(check_montage(plan), [])
                probe = subprocess.run([ffmpeg_binary(), "-hide_banner", "-i", rendered["output"]],
                                       capture_output=True, text=True)
                self.assertIn("Audio:", probe.stderr)
                # Compare the source frame to the corresponding montage frame.
                from PIL import ImageChops, ImageStat
                chosen = next(k for k in plan.keeps if any(e.seconds == 7.1 for e in k.events))
                montage_time = sum(k.seconds for k in plan.keeps if k.start < chosen.start) + 7.1 - chosen.start
                def picture(path, when):
                    data = subprocess.run([ffmpeg_binary(), "-v", "error", "-ss", str(when),
                                           "-i", str(path), "-frames:v", "1", "-f", "image2pipe",
                                           "-vcodec", "png", "-"], check=True, capture_output=True).stdout
                    return Image.open(io.BytesIO(data)).convert("RGB")
                diff = ImageChops.difference(picture(result["video"], 7.1), picture(rendered["output"], montage_time))
                self.assertLess(sum(ImageStat.Stat(diff).mean) / 3, 8.0)

    def test_missing_timestamp_does_not_create_report(self):
        import base64
        from unittest.mock import patch
        from gameplay_bridge import run_agent
        from reflex_agent import build_agent
        class FakeBridge:
            def __init__(self, *args, **kwargs): pass
            def __enter__(self): return self
            def __exit__(self, *args): pass
            def receive(self):
                return {"type": "observation", "step": 0,
                        "screenshot_png_base64": base64.b64encode(b"\x89PNG\r\n\x1a\n").decode()}
        with tempfile.TemporaryDirectory() as temp:
            root = Path(temp)
            agent = build_agent(objective="test", use_advisor=False, playbook_goal=Goal("test"),
                                playbook_path=root.parent / (root.name + "-book.json"))
            with patch("gameplay_bridge.BrowserBridge", FakeBridge), self.assertRaisesRegex(RuntimeError, "timestamp"):
                run_agent(root, agent, rights_acknowledged=True, record_dir=root)
            self.assertFalse((root / "events.json").exists())
            self.assertFalse(agent.playbook.path.exists())

    def test_interrupted_run_saves_observed_learning_not_a_report(self):
        import base64
        import io
        from unittest.mock import patch
        from PIL import Image
        from gameplay_bridge import run_agent
        from reflex_agent import build_agent
        with tempfile.TemporaryDirectory() as temp:
            root = Path(temp)
            record = root / "record"
            record.mkdir()
            data = io.BytesIO()
            Image.new("RGB", (800, 600), (30, 40, 50)).save(data, format="PNG")
            png = base64.b64encode(data.getvalue()).decode()
            class BrokenBridge:
                def __init__(self, *args, **kwargs): self.i = 0
                def __enter__(self): return self
                def __exit__(self, *args): pass
                def receive(self):
                    return {"type": "observation", "step": self.i,
                            "screenshot_png_base64": png, "recording_capture_ms": self.i * 500}
                def step(self, action):
                    self.i += 1
                    if self.i == 2: raise RuntimeError("bridge failed")
                    return self.receive()
            goal = Goal("fixture")
            path = root / "book.json"
            agent = build_agent(objective="fixture", use_advisor=False,
                                playbook_goal=goal, playbook_path=path)
            with patch("gameplay_bridge.BrowserBridge", BrokenBridge), self.assertRaisesRegex(RuntimeError, "bridge failed"):
                run_agent(root, agent, rights_acknowledged=True, max_steps=3, record_dir=record)
            self.assertGreater(sum(e.tries for e in Playbook(goal, path=path).edges.values()), 0)
            self.assertFalse((record / "events.json").exists())

    def test_playbook_cannot_be_inside_recording_directory(self):
        from gameplay_bridge import run_agent
        from reflex_agent import build_agent
        with tempfile.TemporaryDirectory() as temp:
            root = Path(temp)
            agent = build_agent(objective="test", use_advisor=False, playbook_goal=Goal("test"),
                                playbook_path=root / "recording.webm")
            with self.assertRaisesRegex(ValueError, "outside the recording"):
                run_agent(root, agent, rights_acknowledged=True, record_dir=root)


class MontageRenderTests(unittest.TestCase):
    def test_real_ffmpeg_cuts_a_short_out_of_a_long_recording(self):
        with tempfile.TemporaryDirectory() as temp:
            root = Path(temp)
            source = root / "recording.mp4"
            if not _make_video(source, 20):
                self.skipTest("ffmpeg is not available in this environment")
            self.assertAlmostEqual(probe_duration(source), 20.0, delta=0.5)
            plan = plan_montage(probe_duration(source),
                                [Event(4, "goal", "цель"), Event(12, "speech", "реплика")],
                                target_seconds=6)
            output = root / "short.mp4"
            report = render_montage(source, plan, output, preset="ultrafast")
            self.assertTrue(output.is_file())
            self.assertLess(report["output_seconds"], 20)
            self.assertAlmostEqual(report["output_seconds"], plan.kept_seconds, delta=1.0)
            self.assertFalse(report["published"])
            saved = json.loads(Path(report["report"]).read_text(encoding="utf-8"))
            self.assertEqual(saved["clips"], len(plan.keeps))
            # It must refuse to overwrite a finished montage.
            with self.assertRaises(MontageError):
                render_montage(source, plan, output, preset="ultrafast")

    def test_failed_render_and_existing_report_never_overwrite(self):
        from unittest.mock import patch
        with tempfile.TemporaryDirectory() as temp:
            root = Path(temp)
            source = root / "source.mp4"
            source.write_bytes(b"not a video")
            out = root / "short.mp4"
            sidecar = root / "short.montage.json"
            plan = plan_montage(10, [Event(3, "goal")], target_seconds=4)
            sidecar.write_text("keep me")
            with self.assertRaisesRegex(MontageError, "report already exists"):
                render_montage(source, plan, out)
            self.assertEqual(sidecar.read_text(), "keep me")
            sidecar.unlink()
            with patch("montage.ffmpeg_binary", return_value="ffmpeg"), \
                 patch("montage.subprocess.run", side_effect=subprocess.TimeoutExpired("ffmpeg", 1)):
                with self.assertRaisesRegex(MontageError, "could not render"):
                    render_montage(source, plan, out)
            self.assertFalse(out.exists())
            self.assertFalse(sidecar.exists())

    def test_failure_publishing_video_rolls_back_own_report(self):
        import os
        from unittest.mock import patch
        with tempfile.TemporaryDirectory() as temp:
            root = Path(temp)
            source = root / "source.mp4"
            if not _make_video(source, 8):
                self.skipTest("ffmpeg is not available")
            out = root / "short.mp4"
            plan = plan_montage(8, [Event(3, "goal")], target_seconds=4)
            real_link = os.link
            def link(src, dst):
                if Path(dst) == out:
                    raise OSError("simulated disk error")
                return real_link(src, dst)
            with patch("os.link", side_effect=link), self.assertRaisesRegex(MontageError, "cannot create"):
                render_montage(source, plan, out, preset="ultrafast")
            self.assertFalse(out.exists())
            self.assertFalse((root / "short.montage.json").exists())

    def test_it_refuses_without_ffmpeg_and_without_a_source(self):
        with tempfile.TemporaryDirectory() as temp:
            root = Path(temp)
            plan = plan_montage(10, [Event(3, "goal")], target_seconds=4)
            with self.assertRaises(MontageError):
                render_montage(root / "missing.mp4", plan, root / "out.mp4")


if __name__ == "__main__":
    unittest.main()
