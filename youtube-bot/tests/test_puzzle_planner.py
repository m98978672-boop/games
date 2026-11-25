import random
import sys
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from puzzle_planner import recovery_route, solve
from puzzle_learning import GOAL
from puzzle_supervisor import legal_indices, verify_transition


def apply(board, move):
    blank = board.index(0)
    after = board[:]
    after[blank], after[move] = after[move], after[blank]
    assert verify_transition(board, after, move)
    return after


class PuzzlePlannerTests(unittest.TestCase):
    def test_solves_scrambled_boards_using_legal_moves(self):
        for seed in range(8):
            rng = random.Random(seed)
            board, previous = GOAL[:], -1
            for _ in range(36):
                move = rng.choice([i for i in legal_indices(board) if i != previous])
                previous = board.index(0)
                board = apply(board, move)
            route = solve(board)
            self.assertIsNotNone(route, seed)
            for move in route:
                board = apply(board, move)
            self.assertEqual(board, GOAL)

    def test_recovery_undoes_real_moves_then_finishes_original_board(self):
        start = apply(GOAL, 14)
        detour = apply(start, 10)
        steps = recovery_route([(start, 10, detour)], solve(start))
        self.assertEqual(steps, [14, 15])
        for move in steps:
            detour = apply(detour, move)
        self.assertEqual(detour, GOAL)
        self.assertIsNone(recovery_route([], None))

    def test_rejects_unsolvable_and_honors_search_budget(self):
        self.assertIsNone(solve([2, 1, *GOAL[2:]]))
        self.assertIsNone(solve([*GOAL[:14], 0, 15], max_nodes=1))
