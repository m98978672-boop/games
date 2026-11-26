"""Play the original 3D experiment using only its visible radar pixels."""
import base64
import io
import json
import sys
from collections import deque
from pathlib import Path

from PIL import Image
from gameplay_bridge import BrowserBridge
from gameplay_voiceover import probe_capture

SOURCE = Path(__file__).resolve().parents[1] / 'collection' / 'relay-3d'
DIRS = [(1, 0), (0, 1), (-1, 0), (0, -1)]
COLORS = {'wall': (86, 112, 140), 'beacon': (255, 166, 52), 'exit': (72, 223, 203), 'player': (255, 255, 255)}


def radar(png):
    with Image.open(io.BytesIO(png)) as file:
        picture = file.convert('RGB')
    def pixel(x, y):
        return picture.getpixel((int((x+.5)*2), int((y+.5)*2)))
    walls, targets, player = set(), [], None
    for y in range(9):
        for x in range(9):
            if pixel(307+x*9, 6+y*9) == COLORS['wall']:
                walls.add((x,y))
                continue
            color = pixel(310+x*9, 9+y*9)
            if color == COLORS['beacon']:
                targets.append((x,y))
            if color == COLORS['player']:
                player = x,y
    if player is None or len(walls) < 25:
        raise ValueError('The visual radar could not be read')
    return player, walls, set(targets)


def path(start, walls, targets):
    queue = deque([(start, [])])
    visited = {start}
    while queue:
        (x,y), route = queue.popleft()
        if (x,y) in targets:
            return route
        for h, (dx,dy) in enumerate(DIRS):
            point = x+dx,y+dy
            if not (0 <= point[0] < 9 and 0 <= point[1] < 9) or point in walls or point in visited:
                continue
            visited.add(point)
            queue.append((point, route+[h]))
    raise ValueError('No route visible on radar')


def record(folder):
    actions = []
    with BrowserBridge(SOURCE, rights_acknowledged=True, record_dir=folder) as bridge:
        obs = bridge.receive(timeout=120)
        heading = 0
        outcome = 'time_limit'
        try:
            for _ in range(160):
                frame = base64.b64decode(obs['screenshot_png_base64'], validate=True)
                player, walls, targets = radar(frame)
                if not targets and player == (7,7):
                    outcome = 'game_reported_victory'
                    bridge.step({'duration_ms': 1500})
                    break
                route = path(player, walls, targets or {(7,7)})
                desired = route[0]
                if desired == heading:
                    key = 'ArrowUp'
                elif (desired - heading) % 4 == 3:
                    key = 'ArrowLeft'
                    heading = (heading-1) % 4
                else:
                    key = 'ArrowRight'
                    heading = (heading+1) % 4
                obs = bridge.step({'keys':[key], 'duration_ms': 600})
                if obs.get('type') != 'observation':
                    raise RuntimeError('Invalid gameplay observation')
                actions.append(dict(choice=key, position=player, remaining_beacons=len(targets),
                                    recording_elapsed_ms=obs.get('recording_elapsed_ms')))
        finally:
            video = bridge.finish_recording()
            trace = dict(game='Ретранслятор 3D', short=True, duration_seconds=probe_capture(video),
                         outcome=outcome, actions=actions, published=False)
            (folder/'trace.json').write_text(json.dumps(trace, ensure_ascii=False, indent=2), encoding='utf-8')
            print(f'::notice title=Relay result::{outcome}; {len(actions)} actions; {trace["duration_seconds"]:.2f} seconds')


if __name__ == '__main__':
    record(Path(sys.argv[1]))
