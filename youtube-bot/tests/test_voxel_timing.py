import sys
import unittest
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from voxel_timing import decide_with_game_paused, summarize_performance

class MockBridge:
    def __init__(self, replies): self.replies = iter(replies); self.actions=[]
    def step(self, action): self.actions.append(action); return next(self.replies)

def obs(step, screen, health=20, x=0):
    return {'step':step, 'voxel_telemetry':{'screen':screen, 'health':health, 'x':x, 'y':64, 'z':0}}

class TimingTests(unittest.TestCase):
    def test_pause_model_resume_and_observe_time(self):
        bridge=MockBridge([obs(1,'pause'),obs(2,'playing')]); times=iter([10,13.5]); calls=[]
        action, resumed, seconds = decide_with_game_paused(bridge,lambda png,step:(calls.append(step) or {'duration_ms':250}), b'image', 0, obs(0,'playing'), clock=lambda:next(times))
        self.assertEqual(action, {'duration_ms':250}); self.assertEqual(resumed['step'],2)
        self.assertEqual(seconds,3.5); self.assertEqual(calls,[0]); self.assertEqual(len(bridge.actions),2)
    def test_fails_closed_without_model_or_resume_if_pause_failed(self):
        bridge=MockBridge([obs(1,'playing')]); calls=[]
        with self.assertRaises(RuntimeError): decide_with_game_paused(bridge,lambda *_:calls.append(1), b'image', 0, obs(0,'playing'))
        self.assertEqual(calls,[]); self.assertEqual(len(bridge.actions),1)
    def test_fails_closed_when_health_or_position_change(self):
        for state in (obs(1,'pause',health=19),obs(1,'pause',x=2),obs(3,'pause')):
            bridge=MockBridge([state]); calls=[]
            with self.assertRaises(RuntimeError): decide_with_game_paused(bridge,lambda *_:calls.append(1), b'x', 0, obs(0,'playing'))
            self.assertEqual(calls,[])
    def test_inference_error_never_resumes_or_executes_action(self):
        bridge=MockBridge([obs(1,'pause')])
        def fail(*_): raise ValueError('bad action')
        with self.assertRaises(ValueError): decide_with_game_paused(bridge,fail,b'x',0,obs(0,'playing'))
        self.assertEqual(len(bridge.actions),1)
    def test_performance_filters_unknown_and_booleans(self):
        stats=summarize_performance([{'game_reported_fps':10,'model_inference_seconds':4},
                                     {'game_reported_fps':20,'model_inference_seconds':6},
                                     {'game_reported_fps':True,'model_inference_seconds':float('nan')}])
        self.assertEqual(stats['median_game_reported_fps'],15)
        self.assertEqual(stats['median_inference_seconds'],5)
        self.assertEqual(stats['fps_samples'],2)

if __name__ == '__main__': unittest.main()
