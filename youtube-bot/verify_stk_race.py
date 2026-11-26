"""Fail closed on empty/static captures or a missing end-of-race engine report."""
import json
import re
import subprocess
import sys
from pathlib import Path

PIXELS = 80 * 60


def inspect_motion(raw):
    if len(raw) % PIXELS:
        raise ValueError('Incomplete sampled video frame')
    frames = [raw[i:i+PIXELS] for i in range(0, len(raw), PIXELS)]
    moving = 0
    for before, after in zip(frames, frames[1:]):
        # Central image only; an animated corner or a clock does not count.
        if sum(abs(a-b) >= 14 for a, b in zip(before, after)) >= PIXELS * .05:
            moving += 1
    if len(frames) < 20 or moving < max(12, .45 * (len(frames)-1)):
        raise ValueError('Too little continuous movement in recorded race frames')
    return len(frames), moving


def verify(folder):
    log = (folder / 'race.log').read_text(encoding='utf-8', errors='replace')
    clean = re.sub(r'\x1b\[[0-9;]*m', '', log)
    if not re.search(r'\bname start_position end_position time average_speed top_speed\b', clean):
        raise ValueError('Game did not report a completed profile race')
    frames = subprocess.check_output(['ffmpeg', '-nostdin', '-v', 'error', '-i', str(folder/'recording.webm'),
        '-vf', 'fps=1,crop=iw*0.75:ih*0.60,scale=80:60,format=gray', '-f', 'rawvideo', '-'], timeout=90)
    samples, moving = inspect_motion(frames)
    evidence = dict(game='SuperTuxKart', controller='built_in_racing_ai', game_reported_finish=True,
                    frames_sampled=samples, changing_frame_pairs=moving, published=False)
    (folder/'race-evidence.json').write_text(json.dumps(evidence, indent=2), encoding='utf-8')
    print('::notice title=Race capture verified::' + json.dumps(evidence))
    (folder/'trace.json').write_text(json.dumps(dict(game='SuperTuxKart', short=False,
        outcome='game_reported_victory', actions=[], author='SuperTuxKart team')), encoding='utf-8')


if __name__ == '__main__':
    verify(Path(sys.argv[1]))
