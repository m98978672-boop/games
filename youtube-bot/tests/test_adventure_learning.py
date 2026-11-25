import sys
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from adventure_learning import learn_choices, recall_choice, screen_key
from gameplay.skill_memory import SkillMemory


class AdventureLearningTests(unittest.TestCase):
    def test_only_victory_teaches_and_old_build_or_disabled_choice_cannot_replay(self):
        memory = SkillMemory()
        start, end = (screen_key(b'build-a', png) for png in (b'start', b'end'))
        route = [(start, 'CHOICEONE', start), (start, 'CHOICETWO', end)]
        self.assertEqual(learn_choices(memory, route, outcome='game_reported_death'), 0)
        self.assertEqual(learn_choices(memory, route, outcome='game_reported_victory'), 1)
        self.assertEqual(recall_choice(memory, start, ['CHOICEONE', 'CHOICETWO']), 'CHOICETWO')
        self.assertIsNone(recall_choice(memory, start, ['CHOICEONE']))
        self.assertIsNone(recall_choice(memory, screen_key(b'build-b', b'start'), ['CHOICETWO']))
