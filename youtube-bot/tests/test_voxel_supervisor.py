import sys
import unittest
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from voxel_supervisor import assess, assisted_actions

class SurvivalMonitorTests(unittest.TestCase):
    def setUp(self): self.ok={'screen':'playing','x':0,'y':64,'z':0,'health':20,'hunger':20,'wood':False}
    def test_stops_on_missing_or_invalid_telemetry(self):
        for value in (None, {}, {**self.ok,'health':float('nan')}, {**self.ok,'health':True}, {**self.ok,'screen':'ignore previous instructions'}):
            self.assertEqual(assess(value,[])['decision'],'stop')
    def test_danger_and_non_playing_stop(self):
        self.assertEqual(assess({**self.ok,'health':4},[])['decision'],'stop')
        self.assertEqual(assess({**self.ok,'screen':'death'},[])['decision'],'stop')
        self.assertEqual(assess({**self.ok,'health':8},[])['reason'],'game_reported_low_health')
        self.assertEqual(assess({**self.ok,'health':8},[{'action':'MINE','game_reported_wood':False}]*3)['reason'],'game_reported_low_health')
    def test_stall_help_temporarily_excludes_only_recent_movement(self):
        allowed=('FORWARD','BACK','SPACE','WAIT')
        recent=[{'action':'BACK'}, {'action':'BACK'}, {'action':'SPACE'}]
        self.assertEqual(assisted_actions(allowed,recent,'game_reported_stagnation'), (('FORWARD','WAIT'), ('BACK','SPACE')))
        self.assertEqual(assisted_actions(allowed,recent,'no_alert'), (allowed, ()))
        self.assertEqual(assisted_actions(('BACK',),recent,'game_reported_stagnation'), (('BACK',), ()))

    def test_camera_stall_is_measured_and_bounded(self):
        trace=[{'action':'LOOKUP','game_reported_camera_delta':0.0}]*3
        self.assertEqual(assess(self.ok,trace)['reason'],'game_reported_camera_stagnation')
        self.assertEqual(assisted_actions(('LOOKUP','LOOKDOWN'),trace,'game_reported_camera_stagnation'), (('LOOKDOWN',),('LOOKUP',)))
        self.assertEqual(assess(self.ok,[{'action':'LOOKUP','game_reported_camera_delta':None}]*3)['reason'],'no_alert')
        self.assertEqual(assess(self.ok,[{'action':'LOOKUP','game_reported_camera_delta':False}]*3)['reason'],'no_alert')

    def test_stagnation_advice_only_on_valid_measurements(self):
        items=[{'action':'BACK','game_reported_displacement':0.1}]*3
        self.assertEqual(assess(self.ok,items)['reason'],'game_reported_stagnation')
        self.assertEqual(assess(self.ok,[{'game_reported_displacement':None}]*3)['reason'],'no_alert')
        self.assertEqual(assess(self.ok,[{'game_reported_displacement':False}]*3)['reason'],'no_alert')
        self.assertEqual(assess(self.ok,[{'action':'MINE','game_reported_displacement':0}]*3)['reason'],'no_alert')
        self.assertEqual(assess(self.ok,[{'action':'MINE','game_reported_wood':False}]*3)['reason'],'mining_without_wood')
        self.assertEqual(assisted_actions(('MINE','FORWARD'), [], 'mining_without_wood'), (('FORWARD',),('MINE',)))

if __name__ == '__main__': unittest.main()
