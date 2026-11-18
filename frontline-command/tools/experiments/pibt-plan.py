"""Call the unmodified upstream pypibt solver for one sampled game scene."""
import json
import sys
from pathlib import Path
import numpy as np
sys.path.insert(0, str(Path(__file__).resolve().parents[1] / 'vendor'))
from pypibt import PIBT

s = json.load(sys.stdin)
grid = np.asarray(s['grid'], dtype=bool)
starts = [tuple(v) for v in s['starts']]
goals = [tuple(v) for v in s['goals']]
if len(set(starts)) != len(starts) or len(set(goals)) != len(goals):
    print(json.dumps({'ok': False, 'reason': 'duplicate grid start or goal'})); sys.exit(0)
if any(not grid[p] for p in starts + goals):
    print(json.dumps({'ok': False, 'reason': 'start or goal blocked on sampled grid'})); sys.exit(0)
solver = PIBT(grid, starts, goals, seed=s['seed'])
steps = solver.run(max_timestep=120)
# Check independently; no grid collisions, swaps or illegal jumps.
def valid():
    for a, b in zip(steps, steps[1:]):
        if len(set(b)) != len(b): return False
        for i, (x,y) in enumerate(zip(a,b)):
            if not grid[y] or abs(x[0]-y[0])+abs(x[1]-y[1])>1: return False
            if any(i!=j and x==b[j] and y==a[j] for j in range(len(a))): return False
    return True
print(json.dumps({'ok': steps[-1] == goals and valid(), 'solved': steps[-1] == goals, 'valid': valid(), 'steps': steps}))
