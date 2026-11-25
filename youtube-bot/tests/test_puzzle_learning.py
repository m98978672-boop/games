import sys
import tempfile
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from gameplay.skill_memory import SkillMemory
from puzzle_learning import GOAL, learn_win, recall_move


class PuzzleLearningTests(unittest.TestCase):
    def test_only_confirmed_win_is_saved_and_recalled_after_reopen(self):
        before = GOAL[:-2] + [0, 15]
        route = [(before, 15, GOAL)]
        with tempfile.TemporaryDirectory() as temp:
            path = Path(temp) / 'skills.sqlite3'
            memory = SkillMemory(path)
            self.assertEqual(learn_win(memory, route, reported_win=False), 0)
            self.assertIsNone(recall_move(memory, before, [15]))
            self.assertEqual(learn_win(memory, route, reported_win=True), 1)
            memory.close()
            memory = SkillMemory(path)
            self.assertIsNone(recall_move(memory, before, [10]))
            self.assertEqual(recall_move(memory, before, [10, 15]), 15)
            memory.close()

    def test_disconnected_route_is_not_partially_saved(self):
        before = GOAL[:-2] + [0, 15]
        memory = SkillMemory()
        self.assertEqual(learn_win(memory, [(before, 15, GOAL)] * 2, reported_win=True), 0)
        self.assertEqual(memory.dump(), [])
