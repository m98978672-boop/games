import subprocess
import sys
import unittest
from pathlib import Path
from types import SimpleNamespace
from unittest.mock import patch
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from strategy_desktop import IsolatedStrategyDesktop, validate_action

class StrategyDesktopTests(unittest.TestCase):
    def test_action_whitelist_and_bounds(self):
        self.assertEqual(validate_action({'type':'click','at':[0,599],'button':'right'})['at'],(0,599))
        for action in ({'type':'click','at':[800,0],'button':'left'},
                       {'type':'click','at':[True,0],'button':'left'},
                       {'type':'key','key':'ctrl+alt+t'}, {'type':'wait','command':'rm'},
                       {'type':'drag','start':[0,0],'end':[-1,1]}):
            with self.subTest(action=action), self.assertRaises(ValueError): validate_action(action)
    def test_refuses_default_display_and_missing_isolation(self):
        for kw in ({'display':':0','window_id':1,'game_pid':2,'isolation_acknowledged':True},
                   {'display':':93','window_id':1,'game_pid':2}):
            with self.assertRaises(ValueError): IsolatedStrategyDesktop(**kw)
    def test_window_verified_and_click_never_interpreted_as_shell(self):
        def runner(command, **kwargs):
            self.assertNotIn('shell',kwargs)
            self.assertEqual(kwargs['env']['DISPLAY'],':93')
            if 'getwindowpid' in command: return SimpleNamespace(stdout='42\n')
            if 'getwindowgeometry' in command: return SimpleNamespace(stdout='X=0\nY=0\nWIDTH=800\nHEIGHT=600\n')
            return SimpleNamespace(stdout='')
        with patch('strategy_desktop.subprocess.run', side_effect=runner) as run:
            desktop=IsolatedStrategyDesktop(display=':93',window_id=123,game_pid=42,isolation_acknowledged=True)
            desktop.act({'type':'click','at':[400,300],'button':'left'})
            self.assertEqual(run.call_args.args[0],['xdotool','click','--window','123','1'])
            from PIL import Image, ImageGrab
            with patch('PIL.ImageGrab.grab', return_value=Image.new('RGB',(800,600))) as grab:
                self.assertTrue(desktop.screenshot().startswith(b'\x89PNG'))
                grab.assert_called_once_with(xdisplay=':93')
            with patch('PIL.ImageGrab.grab', return_value=Image.new('RGB',(1024,768))):
                with self.assertRaisesRegex(RuntimeError,'dimensions'): desktop.screenshot()
    def test_wrong_pid_or_size_fails_before_action(self):
        with patch('strategy_desktop.subprocess.run', return_value=SimpleNamespace(stdout='99')):
            with self.assertRaisesRegex(RuntimeError,'expected process'):
                IsolatedStrategyDesktop(display=':93',window_id=123,game_pid=42,isolation_acknowledged=True)
    def test_drag_releases_mouse_even_on_failure(self):
        calls=[]
        def runner(command, **kwargs):
            calls.append(command)
            if 'getwindowpid' in command: return SimpleNamespace(stdout='42')
            if 'getwindowgeometry' in command: return SimpleNamespace(stdout='X=0\nY=0\nWIDTH=800\nHEIGHT=600')
            if command[-2:]==['40','50']: raise subprocess.CalledProcessError(1,command)
            return SimpleNamespace(stdout='')
        with patch('strategy_desktop.subprocess.run',side_effect=runner):
            desktop=IsolatedStrategyDesktop(display=':93',window_id=123,game_pid=42,isolation_acknowledged=True)
            with self.assertRaises(subprocess.CalledProcessError): desktop.act({'type':'drag','start':[1,2],'end':[40,50]})
        self.assertIn(['xdotool','mouseup','1'],calls)
