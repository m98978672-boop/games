"""Small observable progress signal for the private, finite 15-puzzle test.

It is privileged outside help, not weight training. Never asserts game victory
from its own calculation; the running game must separately report completion.
"""

def validate_board(diag):
    if not isinstance(diag, dict) or type(diag.get('won')) is not bool:
        raise ValueError('Invalid puzzle diagnostic')
    cells = diag.get('cells')
    if not isinstance(cells, list) or len(cells) != 16:
        raise ValueError('Invalid puzzle cells')
    values = []
    for i, cell in enumerate(cells):
        if (not isinstance(cell, dict) or type(cell.get('index')) is not int or cell['index'] != i
                or type(cell.get('value')) is not int or not 0 <= cell['value'] <= 15
                or type(cell.get('x')) is not int or not 0 <= cell['x'] < 800
                or type(cell.get('y')) is not int or not 0 <= cell['y'] < 600):
            raise ValueError('Invalid puzzle cell')
        values.append(cell['value'])
    if sorted(values) != list(range(16)):
        raise ValueError('Puzzle is not a permutation')
    return values


def legal_indices(board):
    if not isinstance(board, list) or len(board) != 16 or any(type(n) is not int for n in board) or sorted(board) != list(range(16)):
        raise ValueError('Invalid puzzle board')
    empty = board.index(0)
    y, x = divmod(empty, 4)
    return [i for i in range(16) if abs(i//4-y) + abs(i%4-x) == 1]


def distance(board):
    if not isinstance(board, list) or len(board) != 16 or any(type(n) is not int for n in board) or sorted(board) != list(range(16)):
        raise ValueError('Invalid puzzle board')
    return sum(abs(i//4-(n-1)//4) + abs(i%4-(n-1)%4) for i,n in enumerate(board) if n)


def avoid_immediate_undo(legal, before, previous):
    """One-step external intervention; never exclude the only legal move."""
    if previous is None or len(legal) <= 1:
        return legal, None
    distance(before)  # Validate both observations before applying assistance.
    distance(previous)
    reverse = previous.index(0)
    if reverse in legal:
        return [i for i in legal if i != reverse], reverse
    return legal, None



def avoid_recent_states(legal, before, history):
    """Avoid short cycles when a different legal move exists; external assistance."""
    distance(before)
    if not isinstance(history, list) or len(history) > 16:
        raise ValueError('Invalid bounded state history')
    for board in history:
        distance(board)
    recent = {tuple(board) for board in history}
    empty = before.index(0)
    candidates = []
    blocked = []
    for index in legal:
        if index not in legal_indices(before):
            raise ValueError('Illegal candidate')
        after = before[:]
        after[empty], after[index] = after[index], after[empty]
        (blocked if tuple(after) in recent else candidates).append(index)
    if not candidates:
        return legal, []
    return candidates, blocked


def verify_transition(before, after, chosen):
    """Reject false or inconsistent game telemetry; a click may also do nothing."""
    distance(before)
    distance(after)
    if type(chosen) is not int or chosen not in legal_indices(before):
        raise ValueError('Chosen puzzle move is not legal')
    if after == before:
        return False
    expected = before[:]
    empty = before.index(0)
    expected[empty], expected[chosen] = expected[chosen], expected[empty]
    if after != expected:
        raise ValueError('Puzzle telemetry does not match the chosen move')
    return True


def board_hint(board):
    """Trusted bounded textual summary of untrusted but validated telemetry."""
    distance(board)
    return 'Reported tiles A-P: ' + ','.join(str(value) for value in board) + ' (0 is blank).'


def feedback(before, after, *, best=None, previous=None, history=None):
    before_distance = distance(before)
    after_distance = distance(after)
    if (previous is not None and after == previous) or (history is not None and after in history):
        return -2, 'Penalty: this returns to a recent board. Try a different route.'
    threshold = before_distance if best is None else best
    if type(threshold) is not int or threshold < 0:
        raise ValueError('Invalid best distance')
    if after_distance < threshold:
        return 1, 'Bonus: the reported board reached a new best distance.'
    if after_distance > before_distance:
        return -1, 'Penalty: the reported board is farther from ordered positions; reconsider the move.'
    return 0, 'No new best progress on this action.'
