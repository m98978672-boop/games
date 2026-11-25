"""Exact-screen replay for a fixed game build; never learn from failed runs."""
from hashlib import sha256

CHOICES = ('CHOICEONE', 'CHOICETWO', 'CHOICETHREE')


def screen_key(build: bytes, png: bytes) -> str:
    return sha256(build + png).hexdigest()[:16]


def recall_choice(memory, key, allowed):
    choice = memory.recall(key)
    return choice if choice in CHOICES and choice in allowed else None


def learn_choices(memory, transitions, *, outcome):
    if outcome != 'game_reported_victory' or not transitions:
        return 0
    expected = transitions[-1][2]
    route = {}
    for before, choice, after in reversed(transitions):
        if after != expected or choice not in CHOICES:
            return 0
        if before != after:
            route.setdefault(before, choice)
        expected = before
    for key, choice in route.items():
        memory.record(key, choice, True)
    return len(route)
