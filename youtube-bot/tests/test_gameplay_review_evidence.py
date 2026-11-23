import sys
import unittest
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[1]))
from gameplay_review_evidence import session_evidence, spoken_review, release_gate

class EvidenceTests(unittest.TestCase):
    def report(self):
        steps=[{'step':i+1,'recording_elapsed_ms':i*70000,'action':'LOOKLEFT',
                'game_reported_camera_delta':0.2,'game_reported_target_before':'none',
                'game_reported_wood':False,'scripted_initial_approach':i==0} for i in range(8)]
        return {'recorded':True,'published':False,'trained':False,'model_actions':steps,
                'supervisor_interventions':[{'type':'hint'}],'stop_reason':'step_limit'}
    def test_report_distinguishes_model_failure_from_game_bug(self):
        ev=session_evidence(self.report())
        self.assertEqual(ev['game_reported_rotations'],8)
        self.assertEqual(ev['scripted_actions'],1)
        text=spoken_review(ev)
        self.assertIn('не доказывает ошибку игры',text)
        self.assertIn('внешние подсказки',text)
    def test_unknown_diagnostics_are_not_presented_as_observations(self):
        r=self.report()
        for step in r['model_actions']:
            step['game_reported_target_before']=None
            step['game_reported_wood']=None
        summary=spoken_review(session_evidence(r))
        self.assertIn('Диагностики недостаточно',summary)
        self.assertNotIn('Ствол был отмечен',summary)

    def test_seven_minute_gate_and_narration(self):
        ev=session_evidence(self.report())
        self.assertEqual(release_gate(ev,{'duration_seconds':500,'max_silence_seconds':10,'spoken_seconds':200}),
                         ['rights_fact_and_editorial_review_required'])
        blockers=release_gate(ev,{'duration_seconds':419,'max_silence_seconds':30,'spoken_seconds':20})
        self.assertIn('video_shorter_than_seven_minutes_or_invalid',blockers)
        self.assertIn('action_clock_does_not_match_video',blockers)
        self.assertIn('insufficient_measured_narration',blockers)
        self.assertIn('long_silence_or_invalid_measurement',blockers)
    def test_refuses_bad_clock_and_unmarked_help(self):
        r=self.report(); r['model_actions'][2]['recording_elapsed_ms']=0
        with self.assertRaises(ValueError): session_evidence(r)
        r=self.report(); r['model_actions'][0]['scripted_initial_approach']=None
        with self.assertRaises(ValueError): session_evidence(r)
        r=self.report(); r['model_actions'][0]['game_reported_camera_delta']=True
        with self.assertRaises(ValueError): session_evidence(r)

if __name__ == '__main__': unittest.main()
