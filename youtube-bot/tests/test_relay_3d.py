import io
import sys
import unittest
from pathlib import Path

from PIL import Image, ImageDraw

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from run_relay_3d import path, radar


class Relay3DTests(unittest.TestCase):
    def test_grayscale_radar_and_unexpected_wall_detour(self):
        frame = Image.new('L', (400, 300), 20)
        draw = ImageDraw.Draw(frame)
        wall = {(x,y) for x in range(9) for y in range(9) if x in (0,8) or y in (0,8)}
        for x,y in wall:
            draw.rectangle((307+x*9, 6+y*9, 314+x*9, 13+y*9), fill=150)
        draw.rectangle((318, 17, 321, 20), fill=240)
        draw.rectangle((335, 18, 340, 19), fill=150)
        draw.rectangle((337, 16, 338, 21), fill=150)
        data = io.BytesIO()
        frame.resize((800, 600), Image.Resampling.NEAREST).save(data, format='PNG')
        position, walls, targets = radar(data.getvalue())
        self.assertEqual(position, (1,1))
        self.assertEqual(targets, {(3,1)})
        self.assertEqual(walls, wall)
        self.assertEqual(path(position, walls, targets, {((1,1),(2,1))}), [1,0,0,3])
