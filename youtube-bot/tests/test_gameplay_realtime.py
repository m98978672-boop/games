import base64
import io
import sys
import time
import unittest
from pathlib import Path

from PIL import Image

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from gameplay.input_profiles import validate_action
from gameplay.realtime_loop import RealtimeReport, run_realtime
from reflex_agent import ReflexAgent

W, H = 800, 600


def frame(shade=30):
    buffer = io.BytesIO()
    Image.new('RGB', (W, H), (shade, 20, 20)).save(buffer, format='PNG')
    return buffer.getvalue()


class FakeBridge:
    """Same contract as the real bridge: numbered frames, refuses bad actions."""

    def __init__(self):
        self.sent = []
        self.shade = 20

    def _observation(self):
        self.shade = (self.shade + 9) % 80
        return {'type': 'observation', 'step': len(self.sent), 'width': W, 'height': H,
                'screenshot_png_base64': base64.b64encode(frame(self.shade)).decode(),
                'screenshot_ms': 11.0,
                'browser_frame_timing': {'samples': 30, 'fps': 60.0, 'p95_ms': 16.6,
                                         'max_ms': 21.0, 'stalled_ms': 0}}

    def receive(self, timeout=30):
        return self._observation()

    def step(self, action):
        validate_action(action)
        self.sent.append(action)
        return self._observation()


class SlowAgent(ReflexAgent):
    """A stand-in for Qwen: each decision costs real time in a worker thread."""

    def __init__(self, delay_s=0.25, **kwargs):
        super().__init__('keyboard', **kwargs)
        self.delay_s = delay_s
        self.calls = 0

    def __call__(self, png, step):
        self.calls += 1
        time.sleep(self.delay_s)
        return super().__call__(png, step)


class RealtimeTests(unittest.TestCase):
    def test_input_continues_while_the_model_thinks(self):
        bridge = FakeBridge()
        agent = SlowAgent(0.25)
        report = run_realtime(bridge, agent, max_steps=4, max_seconds=30)
        summary = report.summary()
        self.assertEqual(summary['decisions'], 4)
        self.assertFalse(summary['paused_during_inference'])
        self.assertGreater(summary['actions_sent'], summary['decisions'],
                           'the pacer must keep sending while a decision is pending')
        self.assertLessEqual(summary['decision_max_ms'], 2000.0)
        self.assertEqual(summary['deadline_misses'], 0)
        self.assertEqual(report.errors, [])

    def test_slow_model_is_reported_as_a_deadline_miss_not_hidden(self):
        bridge = FakeBridge()
        agent = SlowAgent(0.05)
        report = run_realtime(bridge, agent, max_steps=3, max_seconds=30, deadline_ms=1.0)
        summary = report.summary()
        self.assertGreaterEqual(summary['deadline_misses'], 1)
        self.assertEqual(summary['errors'], [])
        self.assertGreater(summary['actions_sent'], 0)

    def test_wall_clock_stop_leaves_a_consistent_report(self):
        bridge = FakeBridge()
        agent = SlowAgent(0.05)
        report = run_realtime(bridge, agent, max_steps=1000, max_seconds=0.4)
        summary = report.summary()
        self.assertIn(summary['stopped_by'], ('wall_clock', 'step_limit'))
        self.assertLess(summary['wall_seconds'], 3.0)
        self.assertGreater(summary['actions_sent'], 0)

    def test_stop_condition_and_step_limit(self):
        bridge = FakeBridge()
        agent = SlowAgent(0.01)
        report = run_realtime(bridge, agent, max_steps=10, stop=lambda obs, a: True)
        self.assertEqual(report.stopped_by, 'stop_condition')
        self.assertEqual(report.summary()['decisions'], 1)

    def test_broken_bridge_stops_with_an_error(self):
        class Broken(FakeBridge):
            def step(self, action):
                validate_action(action)
                self.sent.append(action)
                return {'type': 'error', 'error': 'invalid click'}
        report = run_realtime(Broken(), SlowAgent(0.01), max_steps=3)
        self.assertEqual(report.stopped_by, 'bridge_error')
        self.assertTrue(report.errors)

    def test_report_shape_is_json_safe(self):
        import json
        bridge = FakeBridge()
        report = run_realtime(bridge, SlowAgent(0.01), max_steps=3)
        payload = json.dumps({"summary": report.summary(), "rows": report.rows})
        self.assertIn('input_rate_per_s', payload)
        self.assertFalse(RealtimeReport().summary()['paused_during_inference'])


if __name__ == '__main__':
    unittest.main()
