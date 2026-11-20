"""Original seamless, restrained material albedos. Run with Pillow; no external art."""
from pathlib import Path
import math
import random
from PIL import Image

( Path(__file__).resolve().parents[1] / 'assets/textures/surface').mkdir(exist_ok=True)

OUT = Path(__file__).resolve().parents[1] / 'assets/textures'
PALETTE = dict(brick=(125, 85, 65), concrete=(149, 151, 141), ground=(112, 119, 89), asphalt=(68, 75, 76), metal=(112, 127, 128), rust=(139, 96, 65), wood=(118, 101, 75), cloth=(106, 122, 101))
for index, (name, base) in enumerate(PALETTE.items()):
    rng = random.Random(1700 + index)
    image = Image.new('RGB', (256, 256))
    relief = Image.new('L', (256, 256))
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
            # Material-specific mid-scale detail, periodic across tile boundaries.
            detail = 0.0
            if name == 'concrete':
                detail = -9 if ((x * 17 + y * 31) % 997 < 3) else 1.8 * math.sin((x + y) * math.tau / 16)
            elif name == 'asphalt':
                detail = 4 if ((x * 13 + y * 23) % 41 < 2) else -1
            elif name == 'ground':
                detail = 3 * math.sin(x * math.tau / 32) * math.cos(y * math.tau / 16)
            elif name == 'wood':
                detail = 3 * math.sin(x * math.tau / 8 + 0.6 * math.sin(y * math.tau / 128))
            elif name == 'metal':
                detail = 5 if (y % 64 == 19 and x % 128 < 30) else 0
            elif name == 'rust':
                detail = 8 * math.sin(x * math.tau / 32) * math.cos(y * math.tau / 16)
            elif name == 'cloth':
                if x % 128 < 3 or y % 128 < 3:
                    value -= 12
                elif (x % 128 < 7 or y % 128 < 7) and (x + y) % 8 < 4:
                    value += 10
                detail = 3 * math.sin(x * math.tau / 4) * math.cos(y * math.tau / 4)
            elif name == 'brick' and not seam:
                detail = 2 * math.sin(x * math.tau / 8) * math.cos(y * math.tau / 8)
            value += detail
            height = 90 if name == 'brick' and seam else 145 + value * 2
            relief.putpixel((x, y), max(0, min(255, round(height))))
            image.putpixel((x, y), tuple(max(0, min(255, round(c + value))) for c in color))
    image.save(OUT / (name + '.png'), optimize=True)

    normal = Image.new('RGB', (256, 256))
    rough = Image.new('L', (256, 256))
    for y in range(256):
        for x in range(256):
            dx = (relief.getpixel(((x+1)%256, y)) - relief.getpixel(((x-1)%256, y))) / 100.0
            dy = (relief.getpixel((x, (y+1)%256)) - relief.getpixel((x, (y-1)%256))) / 100.0
            length = math.sqrt(dx*dx + dy*dy + 1)
            normal.putpixel((x,y), (round(127.5 - dx/length*127), round(127.5 + dy/length*127), round(127.5 + 127/length)))
            rough.putpixel((x,y), max(100, min(250, (150 if name == 'metal' else 220) + round((relief.getpixel((x,y))-128)*0.25))))
    normal.save(OUT / 'surface' / (name + '_normal.png'), optimize=True)
    rough.save(OUT / 'surface' / (name + '_roughness.png'), optimize=True)

# Vera's washed medical canvas is deliberately distinct from military olive cloth.
canvas = Image.new('RGB', (256, 256))
rng = random.Random(712)
for y in range(256):
    for x in range(256):
        grain = rng.uniform(-2, 2) + math.sin(x * math.tau / 4) * math.cos(y * math.tau / 4)
        seam = -13 if x % 128 < 2 else (5 if x % 128 < 5 and y % 8 < 4 else 0)
        canvas.putpixel((x, y), tuple(round(c + grain + seam) for c in (182, 202, 198)))
canvas.save(OUT / 'surface' / 'vera_canvas.png', optimize=True)
