import io
import sys
import unittest
from pathlib import Path

from PIL import Image

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from run_relay_3d import COLORS, path, radar


class Relay3DTests(unittest.TestCase):
    def test_read_visible_radar_and_detour_around_wall(self):
        picture = Image.new('RGB', (800, 600))
        border = {(x, y) for x in range(9) for y in range(9) if x in (0, 8) or y in (0, 8)}
        for x, y in border | {(2, 1)}:
            picture.putpixel((615+18*x, 13+18*y), (86, 110, 140))
        picture.putpixel((639, 37), COLORS['player'])
        picture.putpixel((675, 37), COLORS['beacon'])
        data = io.BytesIO()
        picture.save(data, format='PNG')
        position, walls, targets = radar(data.getvalue())
        self.assertEqual(position, (1, 1))
        self.assertEqual(targets, {(3, 1)})
        self.assertEqual(path(position, walls, targets), [1, 0, 0, 3])
