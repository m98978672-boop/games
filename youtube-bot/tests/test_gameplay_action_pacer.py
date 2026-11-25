import io
import sys
import unittest
from pathlib import Path

from PIL import Image

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from gameplay.action_pacer import ActionPacer, PaceStats
from gameplay.input_profiles import (arrows_profile, keyboard_profile, validate_action,
                                     virtual_joystick_profile)
from gameplay.reflex_layer import Tick
from gameplay.reflex_runner import LiveReport, png_of, run_live
from reflex_agent import ReflexAgent

W, H = 800, 600


def frame(shade=30):
    buffer = io.BytesIO()
    Image.new('RGB', (W, H), (shade, 20, 20)).save(buffer, format='PNG')
    return buffer.getvalue()


class SplitTests(unittest.TestCase):
    def test_short_action_is_split_into_legal_bursts(self):
        pacer = ActionPacer(keyboard_profile(), cadence_ms=1000)
        action = {'keys': ['KeyW'], 'duration_ms': 250}
        bursts = pacer.split(action)
        self.assertGreater(len(bursts), 1)
        for burst in bursts:
            validate_action(burst)
            self.assertEqual(burst['duration_ms'], 250)
        self.assertEqual(len(bursts), 4, 'cadence is capped by MAX_BURSTS')

    def test_long_action_is_left_whole(self):
        pacer = ActionPacer(keyboard_profile())
        bursts = pacer.split({'click': [400, 300], 'hold_ms': 1500, 'duration_ms': 250})
        self.assertEqual(bursts, [{'click': [400, 300], 'hold_ms': 1500, 'duration_ms': 250}])

    def test_window_reports_stats_and_accepts_targets(self):
        pacer = ActionPacer(virtual_joystick_profile())
        bursts = pacer.window('INTERACT')
        self.assertEqual(bursts[0]['click'], [700, 520])
        self.assertEqual(pacer.stats.windows, 1)
        self.assertEqual(pacer.stats.bursts, len(bursts))

    def test_illegal_cadence_is_refused(self):
        with self.assertRaises(ValueError):
            ActionPacer(keyboard_profile(), cadence_ms=100, min_cadence_ms=250)
        with self.assertRaises(ValueError):
            ActionPacer(keyboard_profile(), cadence_ms=9000)


class AdaptTests(unittest.TestCase):
    def test_stalls_and_late_decisions_shorten_the_cadence(self):
        pacer = ActionPacer(keyboard_profile(), cadence_ms=1000, min_cadence_ms=250)
        result = pacer.observe({'browser_frame_timing': {'stalled_ms': 4500}})
        self.assertEqual(result['stalled_ms'], 4500.0)
        self.assertEqual(result['cadence_ms'], 500)
        self.assertEqual(pacer.stats.stalls, 1)
        tick = Tick(1, 10.0, 1500.0, 'FORWARD', {}, 'reflex', 0.0, True)
        result = pacer.observe({}, tick=tick)
        self.assertTrue(result['late'])
        self.assertEqual(result['cadence_ms'], 250, 'never below min_cadence_ms')

    def test_headroom_grows_the_cadence_back_slowly(self):
        pacer = ActionPacer(keyboard_profile(), cadence_ms=1000)
        pacer.cadence = 300
        pacer.window('FORWARD')
        pacer.observe({}, tick=Tick(1, 5.0, 10.0, 'FORWARD', {}, 'reflex', 0.0, False))
        self.assertEqual(pacer.cadence, 400)

    def test_malformed_telemetry_is_ignored(self):
        pacer = ActionPacer(keyboard_profile())
        for observation in ({}, None, {'browser_frame_timing': None},
                            {'browser_frame_timing': {'stalled_ms': 'long'}}):
            result = pacer.observe(observation)
            self.assertEqual(result['cadence_ms'], 1000)


class AgentPacingTests(unittest.TestCase):
    def test_agent_keeps_a_window_and_hands_back_bursts(self):
        agent = ReflexAgent('keyboard')
        actions = [agent(frame(30 + i), i) for i in range(20)]
        for action in actions:
            validate_action(action)
        self.assertGreaterEqual(agent.windows, 1)
        self.assertEqual(len(agent.stats.ticks), 20)
        total = sum(a.get('hold_ms') or a.get('duration_ms') for a in actions)
        self.assertGreater(total, 0)
        self.assertEqual(agent.pending_bursts, [])

    def test_bursts_come_back_after_a_window(self):
        agent = ReflexAgent('keyboard')
        agent(frame(), 0)
        agent.pending_bursts = [{'keys': ['KeyW'], 'duration_ms': 400}] * 3
        taken = agent.take_bursts(2)
        self.assertEqual(len(taken), 2)
        self.assertEqual(len(agent.pending_bursts), 1)
        self.assertEqual(len(agent.take_bursts(10)), 1)
        self.assertEqual(agent.take_bursts(10), [])

    def test_arrows_profile_also_paces(self):
        agent = ReflexAgent('arrows')
        action = agent(frame(), 0)
        self.assertEqual(action['keys'], ['ArrowUp'])
        validate_action(action)


class FakeBridge:
    """Minimal bridge stand-in with the same request/response contract."""

    def __init__(self):
        self.sent = []
        self.shade = 30

    def receive(self, timeout=30):
        self.shade = (self.shade + 7) % 60
        return {'type': 'observation', 'step': len(self.sent), 'width': W, 'height': H,
                'screenshot_png_base64': __import__('base64').b64encode(frame(self.shade)).decode(),
                'screenshot_ms': 12.5,
                'browser_frame_timing': {'samples': 60, 'fps': 60.0, 'p95_ms': 16.6,
                                         'max_ms': 20.0, 'stalled_ms': 0}}

    def step(self, action):
        validate_action(action)
        self.sent.append(action)
        self.shade = (self.shade + 7) % 60
        return {'type': 'observation', 'step': len(self.sent), 'width': W, 'height': H,
                'screenshot_png_base64': __import__('base64').b64encode(frame(self.shade)).decode(),
                'screenshot_ms': 11.0,
                'browser_frame_timing': {'samples': 60, 'fps': 59.0, 'p95_ms': 17.0,
                                         'max_ms': 21.0, 'stalled_ms': 0}}


class RunnerTests(unittest.TestCase):
    def test_live_runner_sends_bursts_and_reports(self):
        bridge = FakeBridge()
        # A 1 s cadence with 250 ms clicks gives several bursts per window.
        agent = ReflexAgent('joystick')
        report = run_live(bridge, agent, max_steps=6)
        self.assertEqual(report.steps, 6)
        self.assertEqual(report.stopped_by, 'step_limit')
        summary = report.summary()
        self.assertEqual(summary['stopped_by'], 'step_limit')
        self.assertTrue(all(row['sent_bursts'] >= 1 for row in report.rows))
        self.assertGreaterEqual(summary['bursts_sent'], 6)
        self.assertLessEqual(summary['perception_max_ms'], 300.0)
        self.assertLessEqual(summary['decision_max_ms'], 2000.0)
        self.assertEqual(summary['published'], False)

    def test_agent_learns_from_the_following_frame(self):
        from gameplay.skill_memory import SkillMemory
        memory = SkillMemory()
        agent = ReflexAgent('keyboard', memory=memory)
        for step in range(4):
            agent(frame(20 * step), step)
        self.assertTrue(memory.dump(), 'outcomes must be recorded from real frames')

    def test_runner_stops_when_the_condition_fires(self):
        bridge = FakeBridge()
        agent = ReflexAgent('keyboard')
        report = run_live(bridge, agent, max_steps=10, stop=lambda obs, a: True)
        self.assertEqual(report.stopped_by, 'stop_condition')
        self.assertEqual(report.steps, 1)

    def test_runner_refuses_a_broken_frame(self):
        with self.assertRaises(RuntimeError):
            png_of({'type': 'error', 'error': 'boom'})
        with self.assertRaises(RuntimeError):
            png_of(None)

    def test_empty_report_is_honest(self):
        summary = LiveReport().summary()
        self.assertIsNone(summary['perception_p95_ms'])
        self.assertEqual(summary['steps'], 0)


if __name__ == '__main__':
    unittest.main()
