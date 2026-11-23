import sys
import unittest
import json
import shutil
import subprocess
import tempfile
import types
import wave
from unittest.mock import patch
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from voxel_voiceover import narration_events

class VoxelVoiceTests(unittest.TestCase):
    def setUp(self):
        self.report = {'recorded':True,'published':False,'trained':False,'supervisor_interventions':[], 'stop_reason':'game_reported_death',
                       'model_actions':[{'step':1,'action':'FORWARD','recording_elapsed_ms':5000,'scripted_initial_approach':True},
                                        {'step':2,'action':'MINE','recording_elapsed_ms':11000,'scripted_initial_approach':False}]}
    def test_honest_actions_and_ending(self):
        events=narration_events(self.report,30)
        self.assertIn('Привет',events[0][1]); self.assertIn('помощью',events[1][1])
        self.assertIn('пробуем добывать',events[2][1]); self.assertIn('гибели',events[-1][1])
        self.assertIn('Баг не подтверждён',events[-1][1])
    @unittest.skipUnless(shutil.which('ffmpeg') and shutil.which('ffprobe'), 'ffmpeg required')
    def test_renders_video_and_matching_subtitles(self):
        from voxel_voiceover import voiceover
        def fake_speech(text, out, **kwargs):
            with wave.open(str(out), 'wb') as w:
                w.setnchannels(1); w.setsampwidth(2); w.setframerate(24000)
                w.writeframes((1000).to_bytes(2, 'little', signed=True) * 24000)
            return 1.0
        with tempfile.TemporaryDirectory() as temp:
            p=Path(temp); video=p/'in.mp4'; trace=p/'trace.json'
            subprocess.run(['ffmpeg','-v','error','-f','lavfi','-i','color=c=blue:s=64x64:r=5:d=30',
                            '-c:v','libx264','-pix_fmt','yuv420p',str(video)],check=True)
            trace.write_text(json.dumps(self.report),encoding='utf-8')
            with patch.dict(sys.modules, {'renderer':types.SimpleNamespace(synthesize=fake_speech)}):
                result=voiceover(video,trace,p/'out')
            self.assertFalse(result['published']); self.assertEqual(result['spoken_clips'],4)
            self.assertIn('гибели', (p/'out'/'voiced.ru.srt').read_text(encoding='utf-8'))
            self.assertTrue((p/'out'/'voiced.mp4').is_file())

    def test_rejects_bad_action_and_timestamps(self):
        for change in ({'recording_elapsed_ms':True}, {'recording_elapsed_ms':40000}, {'action':'SHELL'}, {'action':[]}, {'scripted_initial_approach':1}):
            r={**self.report,'model_actions':[{**self.report['model_actions'][0],**change}]}
            with self.subTest(change=change), self.assertRaises(ValueError): narration_events(r,30)
        with self.assertRaises(ValueError): narration_events({**self.report,'recorded':False},30)
        with self.assertRaises(ValueError): narration_events(self.report,float('nan'))

if __name__ == '__main__': unittest.main()
