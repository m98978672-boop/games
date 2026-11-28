import io
import sys
import unittest
from pathlib import Path
from PIL import Image
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from strategy_qwen import StrategyQwen, center, marked_image


def screenshot(size=(800,600)):
    data=io.BytesIO(); Image.new('RGB',size).save(data,format='PNG'); return data.getvalue()

class StrategyQwenTests(unittest.TestCase):
    def test_grid_click_is_model_choice(self):
        agent=StrategyQwen(generator=lambda image,prompt,allowed:'LAA')
        self.assertEqual(agent.choose(screenshot()),('LAA', {'type':'click','at':(80,50),'button':'left'}))
        self.assertEqual(center('FE'),(720,550))
    def test_drag_has_two_model_decisions_no_scripted_target(self):
        seq=iter(['SAA','DCD'])
        agent=StrategyQwen(generator=lambda image,prompt,allowed:next(seq))
        agent.menu_actions = 4
        self.assertEqual(agent.choose(screenshot())[1],{'type':'wait'})
        self.assertEqual(agent.choose(screenshot())[1],{'type':'drag','start':(80,50),'end':(560,250)})
    def test_menu_cannot_start_by_dragging(self):
        agent=StrategyQwen(generator=lambda image,prompt,allowed:'SAD')
        with self.assertRaises(ValueError): agent.choose(screenshot())
        self.assertEqual(agent.menu_actions, 0)
        agent.generator = lambda image,prompt,allowed:'LAA'
        agent.choose(screenshot())
        self.assertEqual(agent.menu_actions, 1)

    def test_invalid_or_unallowed_answer_never_executes(self):
        agent=StrategyQwen(generator=lambda image,prompt,allowed:'DELETE /')
        with self.assertRaises(ValueError): agent.choose(screenshot())
        self.assertEqual(agent.history,[])
        with self.assertRaises(ValueError): marked_image(screenshot((80,60)))
