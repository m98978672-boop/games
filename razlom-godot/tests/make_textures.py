"""Original seamless pixel materials. Pillow 11.1; no external art or weights."""
from pathlib import Path
import random
from PIL import Image, ImageDraw

OUT = Path(__file__).resolve().parents[1] / 'assets' / 'textures'
OUT.mkdir(parents=True, exist_ok=True)
PALETTE = {
    'concrete': (122, 128, 119), 'brick': (140, 85, 58),
    'metal': (59, 91, 89), 'wood': (116, 87, 54),
    'ground': (76, 83, 63), 'rust': (146, 79, 43),
    'cloth': (92, 107, 88), 'asphalt': (52, 60, 58),
}
for index, (name, base) in enumerate(PALETTE.items()):
    rng = random.Random(820 + index)
    image = Image.new('RGB', (64, 64))
    for y in range(64):
        for x in range(64):
            n = rng.randrange(-9, 10)
            if name == 'wood': n += (x % 8 == 0) * -20
            if name == 'metal': n += (y % 16 == 0) * 14
            if name == 'cloth': n += ((x + y) % 2) * 6
            c = tuple(max(0, min(255, v + n)) for v in base)
            image.putpixel((x, y), c)
    d = ImageDraw.Draw(image)
    if name == 'brick':
        for y in range(0, 64, 16):
            d.line((0, y, 63, y), fill=(62, 65, 56), width=2)
            for x in range(-16, 80, 32):
                xx = x + (16 if y % 32 else 0)
                d.line((xx, y, xx, y + 15), fill=(65, 66, 57), width=2)
    if name == 'metal':
        for x in (4, 59):
            for y in (4, 59):
                d.rectangle((x-1, y-1, x+1, y+1), fill=(130, 148, 132))
    if name in ('concrete', 'rust', 'asphalt'):
        for _ in range(25):
            x, y = rng.randrange(64), rng.randrange(64)
            d.rectangle((x, y, x+1, y+1), fill=tuple(max(0, v-28) for v in base))
    image.save(OUT / f'{name}.png')
print('Generated 8 original 64x64 albedo textures')
