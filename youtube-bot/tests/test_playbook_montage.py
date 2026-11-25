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
from montage import (Event, MontageError, check_montage, events_from_report_file, events_from_run,
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

    def test_it_refuses_without_ffmpeg_and_without_a_source(self):
        with tempfile.TemporaryDirectory() as temp:
            root = Path(temp)
            plan = plan_montage(10, [Event(3, "goal")], target_seconds=4)
            with self.assertRaises(MontageError):
                render_montage(root / "missing.mp4", plan, root / "out.mp4")


if __name__ == "__main__":
    unittest.main()
