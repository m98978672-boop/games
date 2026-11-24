"""Measure the reflex layer on this machine: how fast can it *see*?

Run:  python -m gameplay.benchmark_reflex          (from youtube-bot/)
      python youtube-bot/gameplay/benchmark_reflex.py

It renders synthetic 800x600 frames that look roughly like a game HUD (buttons,
a moving sprite, text) and reports p50/p95/max for:

* ``perceive``            - decode + downscale + signature + change box + buttons
* ``detect_targets``      - the button search alone
* ``profile.action``      - intent -> bridge action

Exit code is 1 if the p95 of a full perception exceeds the 300 ms budget, so the
step can be wired into CI without hiding a regression on a slow runner.
"""
from __future__ import annotations

import io
import sys
import time
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from PIL import Image, ImageDraw  # noqa: E402

from gameplay.input_profiles import keyboard_profile, virtual_joystick_profile  # noqa: E402
from gameplay.reflex_layer import (PERCEPTION_BUDGET_MS, detect_targets, perceive,  # noqa: E402
                                   summarise)

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


def measure(count: int = 60) -> dict:
    frames = [make_frame(i) for i in range(count)]
    perception_ms, detect_ms, action_ms = [], [], []
    previous = None
    for png in frames:
        started = time.perf_counter()
        perception = perceive(png, previous)
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

    def stats(values):
        values = sorted(values)
        pick = lambda q: values[max(0, min(len(values) - 1, int(round(len(values) * q)) - 1))]
        return {'p50_ms': round(pick(0.50), 2), 'p95_ms': round(pick(0.95), 2),
                'max_ms': round(values[-1], 2)}

    return {'frames': count, 'perceive': stats(perception_ms),
            'detect_targets': stats(detect_ms), 'action': stats(action_ms),
            'budget_ms': PERCEPTION_BUDGET_MS}


def main(argv: list[str] | None = None) -> int:
    argv = sys.argv[1:] if argv is None else argv
    count = int(argv[0]) if argv else 60
    result = measure(count)
    print(f'reflex benchmark — {result["frames"]} frames of 800x600, budget {result["budget_ms"]:.0f} ms')
    for key in ('perceive', 'detect_targets', 'action'):
        row = result[key]
        print(f'  {key:<15} p50 {row["p50_ms"]:>7.2f} ms   p95 {row["p95_ms"]:>7.2f} ms   max {row["max_ms"]:>7.2f} ms')
    over = result['perceive']['p95_ms'] > result['budget_ms']
    print(f'  perception p95 {"OVER" if over else "within"} budget')
    _ = summarise
    return 1 if over else 0


if __name__ == '__main__':
    raise SystemExit(main())
