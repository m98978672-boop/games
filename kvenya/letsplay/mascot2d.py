# -*- coding: utf-8 -*-
"""Зуза, маскот канала: нарисованный 2D-крыс в наушниках и потёртом кресле.
Гладкий мультяшный стиль: градиенты, блики, живые эмоции. Быстро: база кешируется."""
import math

import numpy as np
from PIL import Image, ImageDraw, ImageFilter

_CACHE = {}


def _radial(size, cx, cy, r, col, alpha=255):
    yy, xx = np.mgrid[0:size, 0:size].astype(np.float32)
    d = np.sqrt((xx - cx) ** 2 + (yy - cy) ** 2) / max(1.0, r)
    a = np.clip(1 - d, 0, 1) ** 1.6 * alpha
    im = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    arr = np.zeros((size, size, 4), np.uint8)
    arr[..., 0], arr[..., 1], arr[..., 2] = col
    arr[..., 3] = a.astype(np.uint8)
    im.frombytes(arr.tobytes())
    return im


def _base(S):
    """Фон + кресло + тело + хвост (статика), 2x суперсемплинг."""
    X = S * 2
    im = Image.new('RGB', (X, X))
    dr = ImageDraw.Draw(im)
    yy = np.mgrid[0:X, 0:X][0].astype(np.float32) / X
    g = np.stack([138 - 46 * yy, 132 - 44 * yy, 84 - 32 * yy], -1).astype(np.uint8)
    im.frombytes(g.tobytes())
    dr = ImageDraw.Draw(im)
    # обои в звёздочки
    for row in range(0, X, 92):
        for colx in range(0, X, 92):
            ox = 46 if (row // 92) % 2 else 0
            cx, cy = colx + ox + 16, row + 24
            dr.line([(cx - 5, cy), (cx + 5, cy)], fill=(116, 112, 72), width=2)
            dr.line([(cx, cy - 5), (cx, cy + 5)], fill=(116, 112, 72), width=2)
    # лампа сверху
    dr.rounded_rectangle([X * 0.56, X * 0.05, X * 0.94, X * 0.10], radius=18, fill=(248, 246, 216))
    im.paste(_radial(X, X * 0.75, X * 0.08, X * 0.42, (250, 244, 190), 90), (0, 0), _radial(X, X * 0.75, X * 0.08, X * 0.42, (250, 244, 190), 90).split()[3])
    # пол
    dr.rectangle([0, X * 0.87, X, X], fill=(98, 94, 64))
    dr.line([(0, X * 0.87), (X, X * 0.87)], fill=(72, 68, 46), width=3)
    # кресло: спинка
    dr.rounded_rectangle([X * 0.14, X * 0.24, X * 0.86, X * 0.86], radius=X * 0.09, fill=(64, 52, 46))
    dr.rounded_rectangle([X * 0.18, X * 0.28, X * 0.82, X * 0.80], radius=X * 0.08, fill=(78, 64, 56))
    rng = np.random.default_rng(5)
    for _ in range(140):
        px, py = rng.uniform(X * 0.2, X * 0.8), rng.uniform(X * 0.3, X * 0.78)
        dr.ellipse([px, py, px + 5, py + 4], fill=(96, 82, 70))
    # подлокотники
    for sx in (0.06, 0.78):
        dr.rounded_rectangle([X * sx, X * 0.56, X * (sx + 0.16), X * 0.92], radius=X * 0.07, fill=(70, 57, 50))
        dr.rounded_rectangle([X * (sx + 0.015), X * 0.58, X * (sx + 0.145), X * 0.66], radius=X * 0.05, fill=(88, 73, 63))
    # сиденье
    dr.rounded_rectangle([X * 0.16, X * 0.74, X * 0.84, X * 0.96], radius=X * 0.08, fill=(74, 60, 52))
    # тень под крысом
    sh = _radial(X, X * 0.5, X * 0.78, X * 0.34, (20, 16, 14), 110)
    im.paste(sh, (0, 0), sh.split()[3])
    # тело
    dr = ImageDraw.Draw(im)
    dr.ellipse([X * 0.24, X * 0.46, X * 0.76, X * 0.88], fill=(126, 110, 96))
    body_g = _radial(X, X * 0.42, X * 0.56, X * 0.34, (178, 160, 142), 120)
    msk = Image.new('L', (X, X), 0)
    ImageDraw.Draw(msk).ellipse([X * 0.24, X * 0.46, X * 0.76, X * 0.88], fill=255)
    im.paste(body_g, (0, 0), Image.composite(body_g.split()[3], Image.new('L', (X, X), 0), msk))
    dr = ImageDraw.Draw(im)
    dr.ellipse([X * 0.34, X * 0.58, X * 0.66, X * 0.86], fill=(176, 160, 144))
    dr.ellipse([X * 0.37, X * 0.61, X * 0.63, X * 0.83], fill=(188, 172, 156))
    # хвост через подлокотник
    pts = [(0.72, 0.80), (0.84, 0.74), (0.90, 0.62), (0.88, 0.50)]
    for i in range(30):
        u = i / 29
        bx = (1 - u) ** 3 * pts[0][0] + 3 * (1 - u) ** 2 * u * pts[1][0] + 3 * (1 - u) * u ** 2 * pts[2][0] + u ** 3 * pts[3][0]
        by = (1 - u) ** 3 * pts[0][1] + 3 * (1 - u) ** 2 * u * pts[1][1] + 3 * (1 - u) * u ** 2 * pts[2][1] + u ** 3 * pts[3][1]
        r = (0.030 - 0.016 * u) * X
        c = int(168 - 30 * u)
        dr.ellipse([bx * X - r, by * X - r, bx * X + r, by * X + r], fill=(c, c - 34, c - 44))
    # лапы на животе
    for sx in (0.40, 0.56):
        dr.ellipse([X * sx, X * 0.76, X * (sx + 0.09), X * 0.83], fill=(140, 122, 106))
        for k in range(3):
            dr.line([(X * (sx + 0.02 + k * 0.025), X * 0.79), (X * (sx + 0.02 + k * 0.025), X * 0.82)], fill=(110, 94, 80), width=2)
    out = im.resize((S, S), Image.LANCZOS)
    return out


def _head(S, mood, t):
    """Голова с эмоцией, 2x суперсемплинг, возвращает S x S RGBA."""
    X = S * 2
    im = Image.new('RGBA', (X, X), (0, 0, 0, 0))
    dr = ImageDraw.Draw(im)
    bounce = 0.0
    tilt = 0.0
    hy = 0.0
    if mood == 'excited':
        bounce = -abs(math.sin(t * 6.0)) * 0.05
    if mood == 'laugh':
        bounce = -abs(math.sin(t * 9.0)) * 0.025
        tilt = 4 * math.sin(t * 9.0)
    if mood == 'nod':
        hy = 0.05 * max(0.0, math.sin(t * 3.4))
    if mood == 'scared':
        hy = -0.03
    if mood == 'lean':
        hy = 0.03
    if mood == 'facepalm':
        tilt = -5
    cy = 0.52 + hy + bounce
    # уши
    ear_flat = 0.45 if mood == 'scared' else 1.0
    wig = 6 * math.sin(t * 8) if mood == 'excited' else 0
    for side in (-1, 1):
        ex, ey = 0.5 + side * 0.235, cy - 0.20 * ear_flat + 0.02
        ex += side * (0.05 if ear_flat < 1 else 0) + wig / X * side
        dr.ellipse([X * (ex - 0.115), X * (ey - 0.115 * ear_flat), X * (ex + 0.115), X * (ey + 0.115 * ear_flat)], fill=(112, 96, 84))
        dr.ellipse([X * (ex - 0.070), X * (ey - 0.070 * ear_flat), X * (ex + 0.070), X * (ey + 0.070 * ear_flat)], fill=(224, 158, 156))
    # голова
    dr.ellipse([X * 0.26, X * (cy - 0.24), X * 0.74, X * (cy + 0.24)], fill=(130, 114, 100))
    hg = _radial(X, X * 0.42, X * (cy - 0.10), X * 0.30, (186, 168, 150), 110)
    msk = Image.new('L', (X, X), 0)
    ImageDraw.Draw(msk).ellipse([X * 0.26, X * (cy - 0.24), X * 0.74, X * (cy + 0.24)], fill=255)
    im.paste(hg, (0, 0), Image.composite(hg.split()[3], Image.new('L', (X, X), 0), msk))
    dr = ImageDraw.Draw(im)
    # щёки
    for side in (-1, 1):
        dr.ellipse([X * (0.5 + side * 0.16 - 0.075), X * (cy + 0.05), X * (0.5 + side * 0.16 + 0.075), X * (cy + 0.16)], fill=(150, 132, 116))
    # морда
    dr.ellipse([X * 0.40, X * (cy + 0.02), X * 0.60, X * (cy + 0.19)], fill=(168, 150, 134))
    # нос
    dr.ellipse([X * 0.465, X * (cy + 0.045), X * 0.535, X * (cy + 0.105)], fill=(226, 148, 148))
    dr.ellipse([X * 0.478, X * (cy + 0.055), X * 0.500, X * (cy + 0.075)], fill=(248, 200, 200))
    # рот
    if mood in ('laugh', 'excited'):
        dr.ellipse([X * 0.44, X * (cy + 0.115), X * 0.56, X * (cy + 0.185)], fill=(70, 40, 42))
        dr.ellipse([X * 0.465, X * (cy + 0.145), X * 0.535, X * (cy + 0.182)], fill=(214, 120, 122))
    elif mood == 'scared':
        dr.ellipse([X * 0.465, X * (cy + 0.125), X * 0.535, X * (cy + 0.170)], fill=(70, 40, 42))
    elif mood == 'facepalm':
        dr.line([(X * 0.455, X * (cy + 0.150)), (X * 0.545, X * (cy + 0.150))], fill=(90, 70, 60), width=4)
    else:
        dr.arc([X * 0.44, X * (cy + 0.10), X * 0.56, X * (cy + 0.18)], 15, 165, fill=(90, 70, 60), width=4)
    # глаза
    blink = (t % 3.7) < 0.13 and mood in ('idle', 'lean', 'nod')
    wide = 1.22 if mood == 'scared' else 1.0
    happy = mood in ('laugh',)
    for side in (-1, 1):
        ex, ey = 0.5 + side * 0.115, cy - 0.045
        if happy:
            dr.arc([X * (ex - 0.055), X * (ey - 0.05), X * (ex + 0.055), X * (ey + 0.05)], 200, 340, fill=(24, 18, 16), width=7)
            continue
        if blink:
            dr.line([(X * (ex - 0.05), X * ey), (X * (ex + 0.05), X * ey)], fill=(24, 18, 16), width=6)
            continue
        rw = 0.052 * wide
        dr.ellipse([X * (ex - rw), X * (ey - rw * 1.12), X * (ex + rw), X * (ey + rw * 1.12)], fill=(26, 20, 18))
        dr.ellipse([X * (ex - rw * 0.42), X * (ey - rw * 0.62), X * (ex - rw * 0.02), X * (ey - rw * 0.22)], fill=(250, 250, 246))
        dr.ellipse([X * (ex + rw * 0.18), X * (ey + rw * 0.22), X * (ex + rw * 0.40), X * (ey + rw * 0.44)], fill=(210, 205, 200))
        # брови
        if mood == 'scared':
            dr.arc([X * (ex - 0.06), X * (ey - 0.115), X * (ex + 0.06), X * (ey - 0.02)], 200, 340, fill=(70, 56, 48), width=5)
        elif mood == 'facepalm':
            dr.line([(X * (ex - 0.05), X * (ey - 0.075)), (X * (ex + 0.05), X * (ey - 0.055))], fill=(70, 56, 48), width=5)
    # усы
    for side in (-1, 1):
        for k in (-1, 0, 1):
            x0, y0 = 0.5 + side * 0.09, cy + 0.10 + k * 0.018
            x1, y1 = 0.5 + side * 0.30, cy + 0.075 + k * 0.045
            dr.line([(X * x0, X * y0), (X * (x0 + (x1 - x0) * 0.5), X * (y0 + (y1 - y0) * 0.35)), (X * x1, X * y1)],
                    fill=(236, 230, 216), width=3)
    # наушники: дуга + чашки
    dr.arc([X * 0.245, X * (cy - 0.30), X * 0.755, X * (cy + 0.20)], 200, 340, fill=(28, 28, 30), width=int(X * 0.045))
    dr.arc([X * 0.265, X * (cy - 0.285), X * 0.735, X * (cy + 0.185)], 210, 330, fill=(70, 70, 76), width=int(X * 0.012))
    for side in (-1, 1):
        cxp = 0.5 + side * 0.245
        dr.rounded_rectangle([X * (cxp - 0.075), X * (cy - 0.115), X * (cxp + 0.075), X * (cy + 0.115)], radius=X * 0.05, fill=(24, 24, 26))
        dr.ellipse([X * (cxp - 0.055), X * (cy - 0.085), X * (cxp + 0.055), X * (cy + 0.085)], fill=(40, 40, 44))
        dr.ellipse([X * (cxp - 0.030), X * (cy - 0.055), X * (cxp - 0.005), X * (cy - 0.020)], fill=(96, 96, 104))
        if side == 1:
            dr.ellipse([X * (cxp + 0.02), X * (cy + 0.06), X * (cxp + 0.038), X * (cy + 0.078)], fill=(120, 220, 140))
    # лапа у лица (facepalm) / поднята (excited)
    if mood == 'facepalm':
        dr.ellipse([X * 0.44, X * (cy - 0.10), X * 0.62, X * (cy + 0.10)], fill=(140, 122, 106))
        for k in range(3):
            dr.line([(X * (0.47 + k * 0.045), X * (cy - 0.08)), (X * (0.47 + k * 0.045), X * (cy + 0.06))], fill=(110, 94, 80), width=4)
    if mood == 'excited':
        dr.ellipse([X * 0.66, X * (cy + 0.16), X * 0.80, X * (cy + 0.30)], fill=(140, 122, 106))
        for k in range(3):
            dr.line([(X * (0.69 + k * 0.032), X * (cy + 0.18)), (X * (0.69 + k * 0.032), X * (cy + 0.26))], fill=(110, 94, 80), width=3)
    out = im.resize((S, S), Image.LANCZOS)
    if tilt:
        out = out.rotate(tilt, resample=Image.BICUBIC, expand=False)
    return out


def frame(mood, t, size):
    key = ('base', size)
    if key not in _CACHE:
        _CACHE.clear()
        _CACHE[key] = _base(size)
        grade = Image.new('RGBA', (size, size), (0, 0, 0, 0))
        gd = ImageDraw.Draw(grade)
        for i in range(int(size * 0.09)):
            a = int(90 * (1 - i / (size * 0.09)))
            gd.rectangle([i, i, size - i, size - i], outline=(10 + a // 5, 10 + a // 5, 12 + a // 5))
        gd.ellipse([-size * 0.3, -size * 0.4, size * 0.75, size * 0.55], fill=(255, 216, 150, 20))
        _CACHE[('grade', size)] = grade
    base = _CACHE[key]
    head = _head(int(size * 0.92), mood, t)
    im = base.copy()
    im.paste(head, (size // 2 - head.width // 2, int(size * 0.02)), head)
    im = Image.alpha_composite(im.convert('RGBA'), _CACHE[('grade', size)])
    return im.convert('RGB')
