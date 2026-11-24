"""Measure the reflex layer on this machine: how fast can it *see*?

Run:  python -m gameplay.benchmark_reflex            (from youtube-bot/)
      python youtube-bot/gameplay/benchmark_reflex.py 40
      python -m gameplay.benchmark_reflex --compare  # new layer vs frozen baseline

It renders synthetic 800x600 frames that look roughly like a game HUD (buttons,
a moving sprite, text) and reports p50/p95/max for:

* ``perceive``            - decode + downscale + signature + change box + buttons
* ``detect_targets``      - the button search alone
* ``profile.action``      - intent -> bridge action

``--compare`` runs the frozen first version (``gameplay/_reflex_legacy.py``) on
the same frames and prints the speed-up, so "faster" is a measured number rather
than a claim. Exit code is 1 if the p95 of a full perception exceeds the 300 ms
budget, so the step can be wired into CI without hiding a regression.
"""
from __future__ import annotations

import io
import sys
import time
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from PIL import Image, ImageDraw  # noqa: E402

from gameplay.input_profiles import keyboard_profile, virtual_joystick_profile  # noqa: E402
from gameplay.reflex_layer import (PERCEPTION_BUDGET_MS, TargetCache, detect_targets,  # noqa: E402
                                   perceive, summarise)

W, H = 800, 600


def make_frame(index: int) -> bytes:
    """Deterministic pseudo-game frame with text, HUD boxes and a moving blob."""
    img = Image.new('RGB', (W, H), (22 + index % 5, 26, 34))
    draw = ImageDraw.Draw(img)
    draw.rectangle([0, 0, W, 22], fill=(48, 52, 60))
    draw.text((8, 6), f'HUD frame {index} | hp 20/20 | wood 3', fill=(210, 214, 220))
    for i in range(6):
        x, y = 40 + i * 120, H - 90
        draw.rectangle([x, y, x + 96, y + 56], fill=(70 + i * 8, 74, 82))
        draw.text((x + 8, y + 8), f'btn {i}', fill=(230, 230, 230))
    cx = 120 + (index * 17) % 560
    cy = 180 + (index * 11) % 260
    draw.ellipse([cx - 46, cy - 46, cx + 60, cy + 60], fill=(196, 64, 64))
    draw.text((cx - 30, cy - 8), 'target', fill=(255, 255, 255))
    out = io.BytesIO()
    img.save(out, format='PNG')
    return out.getvalue()


def _stats(values):
    values = sorted(values)
    pick = lambda q: values[max(0, min(len(values) - 1, int(round(len(values) * q)) - 1))]
    return {'p50_ms': round(pick(0.50), 2), 'p95_ms': round(pick(0.95), 2),
            'max_ms': round(values[-1], 2)}


def measure(count: int = 60, *, cache: TargetCache | None = None) -> dict:
    frames = [make_frame(i) for i in range(count)]
    perception_ms, detect_ms, action_ms = [], [], []
    previous = None
    for png in frames:
        started = time.perf_counter()
        perception = perceive(png, previous, target_cache=cache)
        perception_ms.append((time.perf_counter() - started) * 1000.0)
        previous = perception
    small = perceive(frames[0], None)._small
    for _ in range(count):
        started = time.perf_counter()
        detect_targets(small)
        detect_ms.append((time.perf_counter() - started) * 1000.0)
    for profile in (keyboard_profile(), virtual_joystick_profile()):
        for intent in profile.intents():
            started = time.perf_counter()
            profile.action(intent)
            action_ms.append((time.perf_counter() - started) * 1000.0)
    return {'frames': count, 'perceive': _stats(perception_ms),
            'detect_targets': _stats(detect_ms), 'action': _stats(action_ms),
            'budget_ms': PERCEPTION_BUDGET_MS}


def measure_repeat(count: int = 60) -> dict:
    """Repeated screens (menus, HUD): the signature cache should win here."""
    frames = [make_frame(i % 6) for i in range(count)]
    cache = TargetCache(max_entries=64)
    started = time.perf_counter()
    previous = None
    for png in frames:
        previous = perceive(png, previous, target_cache=cache)
    total_ms = (time.perf_counter() - started) * 1000.0
    return {'frames': count, 'perceive': _stats([total_ms / count]),
            'cache': cache.stats()}


def quality_fixtures() -> list[tuple[str, bytes, list[tuple[int, int, int, int]]]]:
    """Synthetic screens with known rectangles: buttons, text+bar, mixed HUD."""
    from PIL import ImageDraw as _Draw

    fixtures = []

    img = Image.new('RGB', (W, H), (26, 30, 38))
    draw = _Draw.Draw(img)
    truth = []
    for i, (x, y, w, h) in enumerate([(40, 60, 160, 60), (560, 480, 180, 70), (300, 250, 120, 50)]):
        draw.rectangle([x, y, x + w, y + h], fill=(70 + i * 10, 74, 82))
        draw.text((x + 8, y + 8), f'btn {i}', fill=(230, 230, 230))
        truth.append((x, y, x + w, y + h))
    buffer = io.BytesIO(); img.save(buffer, format='PNG'); fixtures.append(('buttons', buffer.getvalue(), truth))

    img = Image.new('RGB', (W, H), (26, 30, 38))
    draw = _Draw.Draw(img)
    draw.text((40, 40), 'Score 1234  hp 20/20  level 3', fill=(220, 220, 220))
    draw.text((40, 80), 'press E to open the inventory', fill=(180, 180, 180))
    draw.rectangle([40, 140, 340, 160], fill=(90, 90, 90))
    buffer = io.BytesIO(); img.save(buffer, format='PNG')
    fixtures.append(('text', buffer.getvalue(), [(40, 140, 340, 160)]))

    img = Image.new('RGB', (W, H), (26, 30, 38))
    draw = _Draw.Draw(img)
    draw.rectangle([0, 0, W, 24], fill=(48, 52, 60))
    draw.text((8, 6), 'hp 20/20  wood 3', fill=(210, 214, 220))
    draw.ellipse([330, 220, 410, 300], fill=(196, 64, 64))
    draw.rectangle([600, 480, 720, 540], fill=(70, 74, 82))
    buffer = io.BytesIO(); img.save(buffer, format='PNG')
    fixtures.append(('game', buffer.getvalue(), [(600, 480, 720, 540)]))
    return fixtures


def _iou(a, b) -> float:
    ix0, iy0 = max(a[0], b[0]), max(a[1], b[1])
    ix1, iy1 = min(a[2], b[2]), min(a[3], b[3])
    if ix1 <= ix0 or iy1 <= iy0:
        return 0.0
    inter = (ix1 - ix0) * (iy1 - iy0)
    return inter / float((a[2] - a[0]) * (a[3] - a[1]) + (b[2] - b[0]) * (b[3] - b[1]) - inter)


def measure_quality() -> dict:
    """Hit rate and mean IoU against known rectangles, old layer vs now."""
    from gameplay import _reflex_legacy as legacy
    rows = {}
    for label, module in (('legacy', legacy), ('now', None)):
        hits = total = 0
        ious: list[float] = []
        extra = 0
        for name, png, truth in quality_fixtures():
            found = (module or __import__('gameplay.reflex_layer', fromlist=['perceive'])).perceive(png, None)
            boxes = [(t.x, t.y, t.x + t.w, t.y + t.h) for t in found.targets]
            for rect in truth:
                best = max((_iou(rect, b) for b in boxes), default=0.0)
                total += 1
                hits += 1 if best >= 0.5 else 0
                ious.append(best)
            extra += max(0, len(boxes) - len(truth))
        rows[label] = {'hit_rate': round(hits / total, 3) if total else None,
                       'mean_iou': round(sum(ious) / len(ious), 3) if ious else None,
                       'false_positives': extra}
    return rows


def measure_decision(count: int = 60) -> dict:
    """Full tick and the two decision paths (memory hit / reflex)."""
    import tempfile
    from pathlib import Path as _Path

    from gameplay.reflex_layer import Perception, ReflexController
    from gameplay.skill_memory import SkillMemory
    from reflex_agent import ReflexAgent

    frames = [make_frame(i) for i in range(count)]
    agent = ReflexAgent('keyboard')
    tick = []
    for i, png in enumerate(frames):
        started = time.perf_counter()
        agent(png, i)
        tick.append((time.perf_counter() - started) * 1000.0)

    with tempfile.TemporaryDirectory() as temp:
        memory = SkillMemory(_Path(temp) / 'skills.sqlite3')
        controller = ReflexController('EXPLORE', memory=memory)
        known = Perception(signature='a' * 16, changed=True, change_ratio=0.1, roi=None)
        memory.record('a' * 16, 'INTERACT', True)
        memory.record('a' * 16, 'INTERACT', True)
        memory.recall('a' * 16)
        decided = []
        for _ in range(count):
            started = time.perf_counter()
            controller.decide(known, 0)
            decided.append((time.perf_counter() - started) * 1000.0)
        memory.close()
    return {'frames': count, 'tick': _stats(tick), 'decision_memory': _stats(decided)}


def measure_legacy(count: int = 60) -> dict:
    """The frozen first version, timed on the same frames for comparison."""
    from gameplay import _reflex_legacy as legacy
    frames = [make_frame(i) for i in range(count)]
    values = []
    previous = None
    for png in frames:
        started = time.perf_counter()
        previous = legacy.perceive(png, previous)
        values.append((time.perf_counter() - started) * 1000.0)
    small = legacy.perceive(frames[0], None)._small
    detect = []
    for _ in range(count):
        started = time.perf_counter()
        legacy.detect_targets(small)
        detect.append((time.perf_counter() - started) * 1000.0)
    return {'frames': count, 'perceive': _stats(values), 'detect_targets': _stats(detect)}


def _row(label: str, row: dict) -> str:
    return f'  {label:<16} p50 {row["p50_ms"]:>7.2f} ms   p95 {row["p95_ms"]:>7.2f} ms   max {row["max_ms"]:>7.2f} ms'


def main(argv: list[str] | None = None) -> int:
    argv = sys.argv[1:] if argv is None else argv
    compare = '--compare' in argv
    rest = [a for a in argv if not a.startswith('--')]
    count = int(rest[0]) if rest else 60
    # Warm both paths once so a one-off numpy/Pillow import is not reported as a
    # slow frame (the live loop pays that cost once, before the first game frame).
    measure(2)
    result = measure(count)
    print(f'reflex benchmark — {result["frames"]} frames of 800x600, budget {result["budget_ms"]:.0f} ms')
    print(_row('perceive', result['perceive']))
    print(_row('detect_targets', result['detect_targets']))
    print(_row('action', result['action']))
    decision = measure_decision(count)
    print(_row('agent tick', decision['tick']))
    print(_row('decision(mem)', decision['decision_memory']))
    repeat = measure_repeat(count)
    print(f'  repeated screens  avg {repeat["perceive"]["p50_ms"]:>7.2f} ms   '
          f'cache hit rate {repeat["cache"]["hit_rate"]}')
    over = result['perceive']['p95_ms'] > result['budget_ms']
    print(f'  perception p95 {"OVER" if over else "within"} budget')
    quality = measure_quality()
    print(f'  target hit rate  legacy {quality["legacy"]["hit_rate"]}   now {quality["now"]["hit_rate"]}'
          f'   mean IoU legacy {quality["legacy"]["mean_iou"]} → now {quality["now"]["mean_iou"]}')
    if compare:
        measure_legacy(2)
        legacy = measure_legacy(count)
        print('\nbaseline (frozen first version) vs now — same frames, same machine')
        print(_row('legacy perceive', legacy['perceive']))
        print(_row('now perceive', result['perceive']))
        print(_row('legacy targets', legacy['detect_targets']))
        print(_row('now targets', result['detect_targets']))
        for key in ('p50_ms', 'p95_ms', 'max_ms'):
            old, new = legacy['perceive'][key], result['perceive'][key]
            print(f'  perceive {key}: x{old / new:.2f} faster' if new else '')
        for key in ('p50_ms', 'p95_ms'):
            old, new = legacy['detect_targets'][key], result['detect_targets'][key]
            print(f'  targets  {key}: x{old / new:.2f} faster' if new else '')
    _ = summarise
    return 1 if over else 0


if __name__ == '__main__':
    raise SystemExit(main())
