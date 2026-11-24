"""Remember verified routes to the finish, not arbitrary screen changes."""
import hashlib

from puzzle_supervisor import verify_transition

GOAL = list(range(1, 16)) + [0]


def signature(board):
    return hashlib.sha256(b'puzzle-v1:' + bytes(board)).hexdigest()[:16]


def recall_move(memory, board, allowed):
    intent = memory.recall(signature(board)) or ''
    return next((i for i in allowed if intent == f'TILE{i}'), None)


def learn_win(memory, transitions, *, reported_win):
    if not reported_win or not transitions or transitions[-1][2] != GOAL:
        return 0
    route = {}
    expected = GOAL
    for before, move, after in reversed(transitions):
        if after != expected or not verify_transition(before, after, move):
            return 0
        # Walking backwards keeps the last exit from any repeated state.
        route.setdefault(signature(before), move)
        expected = before
    for key, move in route.items():
        memory.record(key, f'TILE{move}', True)
    return len(route)
