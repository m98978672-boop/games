"""Benchmark temporary PNG compression only; never loads a model or uploads.

This microbenchmark is not an end-to-end video speed measurement.
"""
import hashlib
import sys
import tempfile
import time
from pathlib import Path
from unittest.mock import patch

from PIL import Image

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
import renderer

script = {'format': 'game-review', 'game_title': 'Проверочная игра', 'idea_score': 7,
          'scenes': [{}] * 5, 'screenshot_paths': []}
scene = {'label': 'ФАКТ ИЗ STEAM', 'visual': 'Сведения об игре',
         'dialogue': 'Русская фраза для проверки качества видео.'}
save = Image.Image.save


def benchmark(root: Path, optimize: bool) -> tuple[float, list[str], int]:
    def configured_save(image, path, *args, **kwargs):
        kwargs['optimize'] = optimize
        return save(image, path, *args, **kwargs)
    prefix = 'old' if optimize else 'new'
    start = time.perf_counter()
    with patch.object(Image.Image, 'save', configured_save):
        for frame in range(12):
            renderer.render_frame(script, scene, 1, frame, root / f'{prefix}-{frame}.png')
    seconds = time.perf_counter() - start
    hashes = []
    total_bytes = 0
    for frame in range(12):
        path = root / f'{prefix}-{frame}.png'
        total_bytes += path.stat().st_size
        with Image.open(path) as image:
            hashes.append(hashlib.sha256(image.convert('RGB').tobytes()).hexdigest())
    return seconds, hashes, total_bytes


with tempfile.TemporaryDirectory(prefix='review-frame-bench-') as temp:
    root = Path(temp)
    old, old_hashes, old_bytes = benchmark(root, True)
    new, new_hashes, new_bytes = benchmark(root, False)
    if old_hashes != new_hashes:
        raise RuntimeError('Decoded frame pixels differ')
    print(f'12 frames: old={old:.3f}s new={new:.3f}s speedup={old / new:.2f}x; '
          f'PNG sizes old={old_bytes} new={new_bytes} bytes; decoded pixels identical')
    print('This is a synthetic frame-preparation benchmark, not total video production time.')
