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
        agent=StrategyQwen(menu_scanner=lambda image:[], observer=lambda image:'test screen', generator=lambda image,prompt,allowed:'LAA')
        self.assertEqual(agent.choose(screenshot()),('LAA', {'type':'click','at':(80,50),'button':'left'}))
        self.assertEqual(center('FE'),(720,550))
    def test_drag_has_two_model_decisions_no_scripted_target(self):
        seq=iter(['SAA','DCD'])
        agent=StrategyQwen(menu_scanner=lambda image:[], observer=lambda image:'test screen', generator=lambda image,prompt,allowed:next(seq))
        agent.menu_actions = 4
        self.assertEqual(agent.choose(screenshot())[1],{'type':'wait'})
        self.assertEqual(agent.choose(screenshot())[1],{'type':'drag','start':(80,50),'end':(560,250)})
    def test_menu_cannot_start_by_dragging(self):
        agent=StrategyQwen(menu_scanner=lambda image:[], observer=lambda image:'test screen', generator=lambda image,prompt,allowed:'SAD')
        with self.assertRaises(ValueError): agent.choose(screenshot())
        self.assertEqual(agent.menu_actions, 0)
        agent.generator = lambda image,prompt,allowed:'LAA'
        agent.choose(screenshot())
        self.assertEqual(agent.menu_actions, 1)

    def test_model_must_choose_detected_menu_token(self):
        choices = [{'label':'single player', 'at':(402, 275)}, {'label':'tutorial', 'at':(398,350)}]
        agent = StrategyQwen(menu_scanner=lambda image:choices, observer=lambda image:'menu',
                             generator=lambda image,prompt,allowed:'MAB')
        self.assertEqual(agent.choose(screenshot()), ('MAB', {'type':'click', 'at':(398,350), 'button':'left'}))
        agent.generator = lambda image,prompt,allowed:'LAA'
        with self.assertRaises(ValueError): agent.choose(screenshot())

    def test_repeated_drag_anchor_is_not_reused(self):
        selected = []
        agent=StrategyQwen(menu_scanner=lambda image:[], observer=lambda image:'test screen',
                           generator=lambda image,prompt,allowed:(selected.extend(allowed) or 'LAA'))
        agent.menu_actions = 4
        agent.history = ['SAA', 'DAA', 'SAA', 'DAA']
        agent.choose(screenshot())
        self.assertNotIn('SAA', selected)
        self.assertIn('SAB', selected)

    def test_probe_disables_drag_and_filters_recent_inputs_after_static_frame(self):
        selected = []
        agent = StrategyQwen(menu_scanner=lambda image:[], observer=lambda image:'map', allow_drag=False,
                             generator=lambda image,prompt,allowed:(selected.extend(allowed) or 'LAB'))
        agent.menu_actions = 10
        agent.history = ['LAA','RAB']
        agent.frame_feedback = 'little_visible_change'
        self.assertEqual(agent.choose(screenshot())[0], 'LAB')
        self.assertNotIn('SAA', selected)
        self.assertNotIn('LAA', selected)
        self.assertNotIn('RAB', selected)
        self.assertIn('RAC', selected)

    def test_semantic_mission_actions_are_two_model_choices(self):
        replies = iter(['SELECT', 'CC', 'MOVE', 'CD'])
        agent = StrategyQwen(menu_scanner=lambda image:[], observer=lambda image:'map',
                             generator=lambda image,prompt,allowed:next(replies),
                             allow_drag=False, semantic_mission=True)
        agent.campaign_selected = True
        self.assertEqual(agent.choose(screenshot()), ('SELECT_CC', {'type':'click','at':(400,250),'button':'left'}))
        self.assertEqual(agent.choose(screenshot()), ('MOVE_CD', {'type':'click','at':(560,250),'button':'right'}))
    def test_repeated_semantic_intent_is_temporarily_removed(self):
        seen = []
        def choose(image, prompt, allowed):
            seen.append(allowed)
            return 'MOVE' if 'MOVE' in allowed else 'CC'
        agent = StrategyQwen(menu_scanner=lambda image:[], observer=lambda image:'map',
                             generator=choose, allow_drag=False, semantic_mission=True)
        agent.campaign_selected = True
        agent.history = ['SELECT_BB', 'SELECT_CC']
        self.assertEqual(agent.choose(screenshot())[0], 'MOVE_CC')
        self.assertNotIn('SELECT', seen[0])
        self.assertIn('MOVE', seen[0])

    def test_semantic_selection_rejects_unpermitted_target(self):
        replies = iter(['SELECT', 'AA'])  # The top margin is outside the map area.
        agent = StrategyQwen(menu_scanner=lambda image:[], observer=lambda image:'map',
                             generator=lambda image,prompt,allowed:next(replies),
                             allow_drag=False, semantic_mission=True)
        agent.campaign_selected = True
        with self.assertRaises(ValueError): agent.choose(screenshot())
        self.assertEqual(agent.history, [])

    def test_invalid_or_unallowed_answer_never_executes(self):
        agent=StrategyQwen(menu_scanner=lambda image:[], observer=lambda image:'test screen', generator=lambda image,prompt,allowed:'DELETE /')
        with self.assertRaises(ValueError): agent.choose(screenshot())
        self.assertEqual(agent.history,[])
        with self.assertRaises(ValueError): marked_image(screenshot((80,60)))
