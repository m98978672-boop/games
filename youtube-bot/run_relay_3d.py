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
def radar(png):
    # Read contrast and symbols, not exact RGB values. The same frame works in grayscale.
    with Image.open(io.BytesIO(png)) as file:
        picture = file.convert('L')

    def pixel(x, y):
        return picture.getpixel((int((x+.5)*2), int((y+.5)*2)))

    floors = [pixel(307+x*9, 6+y*9) for y in range(1, 8) for x in range(1, 8)]
    floor = min(floors)
    border = sorted(pixel(307+x*9, 6+y*9) for y in range(9) for x in range(9) if x in (0,8) or y in (0,8))
    wall = border[len(border)//2]
    contrast = wall - floor
    if contrast < 32:
        raise ValueError('Radar contrast is too low to tell walls from passages')
    threshold = floor + contrast * .45
    walls, targets, players = set(), set(), []
    for y in range(9):
        for x in range(9):
            left, top = 307+x*9, 6+y*9
            if pixel(left, top) > threshold:
                walls.add((x,y))
                continue
            center = pixel(left+3, top+3)
            horizontal = pixel(left+1, top+3) > threshold and pixel(left+6, top+3) > threshold
            vertical = pixel(left+3, top+1) > threshold and pixel(left+3, top+6) > threshold
            if center > threshold and horizontal and vertical:
                targets.add((x,y))
            elif center > threshold and pixel(left+2, top+2) > threshold:
                players.append((x,y))
    if len(players) != 1 or len(walls) < 25:
        raise ValueError('The visual radar could not be read')
    return players[0], walls, targets


def path(start, walls, targets, blocked=()):
    queue = deque([(start, [])])
    visited = {start}
    while queue:
        (x,y), route = queue.popleft()
        if (x,y) in targets:
            return route
        for h, (dx,dy) in enumerate(DIRS):
            point = x+dx,y+dy
            if not (0 <= point[0] < 9 and 0 <= point[1] < 9) or point in walls or point in visited or ((x,y), point) in blocked:
                continue
            visited.add(point)
            queue.append((point, route+[h]))
    raise ValueError('No route visible on radar')


def record(folder):
    actions = []
    with BrowserBridge(SOURCE, rights_acknowledged=True, record_dir=folder) as bridge:
        obs = bridge.receive(timeout=120)
        heading = 0
        blocked = set()
        outcome = 'time_limit'
        try:
            for _ in range(160):
                frame = base64.b64decode(obs['screenshot_png_base64'], validate=True)
                player, walls, targets = radar(frame)
                if not targets and player == (7,7):
                    outcome = 'game_reported_victory'
                    bridge.step({'duration_ms': 1500})
                    break
                route = path(player, walls, targets or {(7,7)}, blocked)
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
                after, _, _ = radar(base64.b64decode(obs['screenshot_png_base64'], validate=True))
                hit_wall = key == 'ArrowUp' and after == player
                if hit_wall:
                    dx, dy = DIRS[heading]
                    blocked.add((player, (player[0]+dx, player[1]+dy)))
                actions.append(dict(choice=key, position=player, remaining_beacons=len(targets), hit_wall=hit_wall,
                                    recording_elapsed_ms=obs.get('recording_elapsed_ms')))
        finally:
            video = bridge.finish_recording()
            trace = dict(game='Ретранслятор 3D', short=True, duration_seconds=probe_capture(video),
                         outcome=outcome, actions=actions, published=False)
            (folder/'trace.json').write_text(json.dumps(trace, ensure_ascii=False, indent=2), encoding='utf-8')
            print(f'::notice title=Relay result::{outcome}; {len(actions)} actions; {trace["duration_seconds"]:.2f} seconds')


if __name__ == '__main__':
    record(Path(sys.argv[1]))
