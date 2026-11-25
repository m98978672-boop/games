"""Bounded IDA* fallback for the finite sliding puzzle."""
from puzzle_supervisor import distance

ADJ = tuple(tuple(j for j in range(16) if abs(i//4-j//4) + abs(i%4-j%4) == 1) for i in range(16))
COST = tuple(tuple(abs(i//4-(n-1)//4) + abs(i%4-(n-1)%4) for i in range(16)) for n in range(16))


def solve(board, *, max_nodes=2_000_000):
    """Return legal tile indices, or None when unsolvable or out of budget."""
    initial_cost = bound = distance(board)
    pieces = [n for n in board if n]
    blank = board.index(0)
    if (sum(a > b for i, a in enumerate(pieces) for b in pieces[i+1:]) + 4 - blank//4) % 2 != 1:
        return None
    state, path = board[:], []
    nodes = 0

    def search(empty, prev, depth, cost):
        nonlocal nodes
        nodes += 1
        if nodes > max_nodes:
            return None
        score = depth + cost
        if score > bound:
            return score
        if cost == 0:
            return True
        next_bound = float('inf')
        for tile in ADJ[empty]:
            if tile == prev:
                continue
            value = state[tile]
            state[tile], state[empty] = 0, value
            path.append(tile)
            found = search(tile, empty, depth + 1, cost + COST[value][empty] - COST[value][tile])
            if found is True or found is None:
                return found
            path.pop()
            state[tile], state[empty] = value, 0
            next_bound = min(next_bound, found)
        return next_bound

    while bound <= 80:
        found = search(blank, -1, 0, initial_cost)
        if found is True:
            return path
        if found is None:
            break
        bound = found
    return None
