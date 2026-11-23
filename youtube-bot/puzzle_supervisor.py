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


def feedback(before, after):
    delta = distance(before) - distance(after)
    if delta > 0:
        return 1, 'Bonus: the reported board is closer to ordered positions.'
    if delta < 0:
        return -1, 'Penalty: the reported board is farther from ordered positions; reconsider the move.'
    return 0, 'No measured progress on this action.'
