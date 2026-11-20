"""Original seamless, restrained material albedos. Run with Pillow; no external art."""
from pathlib import Path
import math
import random
from PIL import Image

OUT = Path(__file__).resolve().parents[1] / 'assets/textures'
PALETTE = dict(brick=(125, 85, 65), concrete=(149, 151, 141), ground=(112, 119, 89), asphalt=(68, 75, 76), metal=(112, 127, 128), rust=(139, 96, 65), wood=(118, 101, 75), cloth=(106, 122, 101))
for index, (name, base) in enumerate(PALETTE.items()):
    rng = random.Random(1700 + index)
    image = Image.new('RGB', (256, 256))
    for y in range(256):
        for x in range(256):
            # Periodic broad variation, with very low amplitude surface grain.
            value = 2.5 * math.sin(x * math.tau / 256) * math.cos(y * math.tau / 128) + rng.uniform(-2, 2)
            color = base
            if name == 'brick':
                row = y // 32
                seam = y % 32 < 2 or (x + (32 if row % 2 else 0)) % 64 < 2
                if seam:
                    color = (111, 109, 97)
                else:
                    value += 4 * math.sin((x // 64 + row * 3) * 2)
            elif name == 'wood':
                value += 4 * math.sin(x * math.tau / 32 + math.sin(y * math.tau / 256))
                if x % 64 < 2:
                    value -= 12
            elif name == 'cloth':
                value += 1.5 * ((x % 2) + (y % 2) - 1)
            elif name == 'metal':
                value += math.sin(y * math.tau / 4)
            elif name == 'rust':
                value += 5 * math.sin(x * math.tau / 64) * math.sin(y * math.tau / 64)
            image.putpixel((x, y), tuple(max(0, min(255, round(c + value))) for c in color))
    image.save(OUT / (name + '.png'), optimize=True)
