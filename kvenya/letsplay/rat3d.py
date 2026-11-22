# -*- coding: utf-8 -*-
"""Крыска в 3D: маскот канала (крыс в наушниках и потёртом кресле, жёлтый коридор).
Низкополигональная комедийная модель в стиле boris/render3d.py.
Настроения: idle, lean, nod, scared, facepalm, excited, laugh."""
import json
import math
import os
import sys

from PIL import Image, ImageDraw

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..', 'boris'))
import render3d as R

SIZE = 640
R.W, R.H = SIZE, SIZE
R.F = 780.0

FUR = (124, 108, 94)
FUR_D = (98, 84, 72)
BELLY = (172, 156, 140)
PINK = (214, 150, 148)
BLACK = (26, 26, 28)
LEATH = (56, 46, 42)
LEATH_L = (74, 62, 55)


def ring_y(y, r, sq=1.0, cx=0.0, cz=0.0):
    pts = []
    for k in range(8):
        a = math.radians(22.5 + 45 * k)
        pts.append((cx + r * math.cos(a), y, cz + r * math.sin(a) * sq))
    return pts


def ring4(c, rad, w, h):
    """квадратное кольцо вокруг точки c: rad — радиальное направление (x,y,0), w,h — полуширины"""
    rx, ry = rad[0], rad[1]
    n = math.hypot(rx, ry) or 1.0
    ux, uy = rx / n, ry / n
    return [(c[0] + ux * w, c[1] + uy * w, c[2] + h), (c[0] - ux * w, c[1] - uy * w, c[2] + h),
            (c[0] - ux * w, c[1] - uy * w, c[2] - h), (c[0] + ux * w, c[1] + uy * w, c[2] - h)]


def xform(pts, pitch=0.0, yaw=0.0, dy=0.0, pivot=(0, 0.7, 0)):
    out = []
    cp, sp = math.cos(pitch), math.sin(pitch)
    cy, sy = math.cos(yaw), math.sin(yaw)
    for p in pts:
        x, y, z = p[0] - pivot[0], p[1] - pivot[1], p[2] - pivot[2]
        y2, z2 = y * cp - z * sp, y * sp + z * cp
        x3, z3 = x * cy + z2 * sy, -x * sy + z2 * cy
        out.append((x3 + pivot[0], y2 + pivot[1] + dy, z3 + pivot[2]))
    return out


BG = None
def background():
    global BG
    if BG:
        return BG
    im = Image.new('RGB', (SIZE, SIZE))
    dr = ImageDraw.Draw(im)
    for y in range(SIZE):
        k = y / SIZE
        c = (int(132 - 44 * k), int(128 - 42 * k), int(82 - 30 * k))
        dr.line([(0, y), (SIZE, y)], fill=c)
    # обои в звёздочки
    for gy in range(0, SIZE, 46):
        for gx in range(0, SIZE, 46):
            ox = 23 if (gy // 46) % 2 else 0
            dr.point((gx + ox + 8, gy + 12), fill=(112, 108, 68))
            dr.point((gx + ox + 9, gy + 13), fill=(112, 108, 68))
            dr.point((gx + ox + 8, gy + 14), fill=(112, 108, 68))
    # потолочная лампа
    dr.rectangle([SIZE * 0.55, SIZE * 0.06, SIZE * 0.92, SIZE * 0.10], fill=(246, 244, 214))
    for i in range(14):
        a = 40 - i * 3
        dr.rectangle([SIZE * 0.55 - i * 3, SIZE * 0.06 - i, SIZE * 0.92 + i * 3, SIZE * 0.10 + i * 2],
                     outline=(200 + a // 4, 198 + a // 4, 160 + a // 4))
    # пол
    dr.rectangle([0, SIZE * 0.86, SIZE, SIZE], fill=(96, 92, 62))
    dr.line([(0, SIZE * 0.86), (SIZE, SIZE * 0.86)], fill=(70, 66, 44), width=2)
    # виньетка
    for i in range(60):
        a = int(70 * (1 - i / 60))
        dr.rectangle([i, i, SIZE - i, SIZE - i], outline=(40 + a // 3, 38 + a // 3, 24 + a // 3))
    BG = im
    return im


def rat_faces(mood, t):
    faces, lines = [], []
    br = math.sin(t * 1.3) * 0.015
    pitch = {'idle': 0.04 + br, 'lean': 0.24, 'nod': 0.10, 'scared': -0.20,
             'facepalm': 0.17, 'excited': 0.09, 'laugh': 0.06}[mood]
    bounce = 0.0
    if mood == 'excited':
        bounce = abs(math.sin(t * 6.0)) * 0.09
        pitch += 0.03 * math.sin(t * 6.0)
    if mood == 'laugh':
        bounce = abs(math.sin(t * 9.0)) * 0.045
    yaw = {'idle': 0.22 * math.sin(t * 0.5), 'lean': 0.10 * math.sin(t * 0.7), 'nod': 0.06 * math.sin(t * 0.9),
           'scared': 0.0, 'facepalm': -0.08, 'excited': 0.30 * math.sin(t * 2.2), 'laugh': 0.22 * math.sin(t * 8.0)}[mood]
    # кресло
    faces += R.box((0, 0.50, 0.05), (1.7, 0.30, 1.5), LEATH)
    faces += R.box((0, 1.15, -0.80), (1.8, 1.5, 0.35), LEATH)
    faces += R.box((-0.95, 0.80, 0.15), (0.30, 0.55, 1.5), LEATH_L)
    faces += R.box((0.95, 0.80, 0.15), (0.30, 0.55, 1.5), LEATH_L)
    for px, py, pz in ((-0.5, 1.5, -0.62), (0.4, 0.9, -0.62), (-0.95, 0.95, 0.6), (0.6, 0.62, 0.7)):
        faces += R.box((px, py, pz), (0.22, 0.16, 0.05), (86, 72, 62))
    # тело
    body = [ring_y(0.62, 0.66), ring_y(0.80, 0.72 + br), ring_y(1.00, 0.70 + br), ring_y(1.18, 0.58), ring_y(1.30, 0.42)]
    faces += R.loft(body, FUR, caps=True)
    faces += R.loft([ring_y(0.70, 0.48, cz=0.28), ring_y(0.95, 0.46, cz=0.34), ring_y(1.12, 0.34, cz=0.32)], BELLY, caps=True)
    # голова
    hp = 0.0
    if mood == 'nod':
        hp = 0.22 * max(0.0, math.sin(t * 3.4))
    if mood == 'laugh':
        hp = 0.10 * math.sin(t * 10.0)
    if mood == 'facepalm':
        hp = 0.14
    head = []
    for y, r in ((1.36, 0.30), (1.46, 0.40), (1.58, 0.42), (1.70, 0.34), (1.78, 0.20)):
        head.append(ring_y(y, r, cz=0.18))
    head = xform([p for ring in head for p in ring], pitch=hp, yaw=yaw * 0.6, pivot=(0, 1.42, 0.18))
    rings = [head[i * 8:(i + 1) * 8] for i in range(5)]
    faces += R.loft(rings, FUR, caps=True)
    # морда
    mz = []
    for z, r in ((0.48, 0.20), (0.60, 0.15), (0.68, 0.09)):
        ring = []
        for k in range(8):
            a = math.radians(22.5 + 45 * k)
            ring.append((r * math.cos(a), 1.46 + r * math.sin(a), z))
        mz.append(ring)
    mz = xform([p for ring in mz for p in ring], pitch=hp, yaw=yaw * 0.6, pivot=(0, 1.42, 0.18))
    faces += R.loft([mz[i * 8:(i + 1) * 8] for i in range(3)], FUR_D, caps=True)
    nose = xform([(0, 1.47, 0.70), (0.05, 1.50, 0.69), (0, 1.53, 0.70), (-0.05, 1.50, 0.69)], pitch=hp, yaw=yaw * 0.6, pivot=(0, 1.42, 0.18))
    faces += [(nose, PINK, True, False)]
    # уши + наушники
    ear_flat = 1.0 if mood != 'scared' else 0.45
    wig = 0.18 * math.sin(t * 8.0) if mood == 'excited' else 0.0
    for side in (-1, 1):
        ex, ey = side * 0.32, 1.86
        ear = [(ex + 0.20 * math.cos(math.radians(22.5 + 45 * k)), ey + 0.20 * ear_flat * math.sin(math.radians(22.5 + 45 * k)) + wig * side, 0.06) for k in range(8)]
        ear = xform(ear, pitch=hp, yaw=yaw * 0.6, pivot=(0, 1.42, 0.18))
        faces += [(ear, FUR_D, False, True)]
        inner = [(ex + 0.11 * math.cos(math.radians(22.5 + 45 * k)), ey + 0.11 * ear_flat * math.sin(math.radians(22.5 + 45 * k)) + wig * side, 0.08) for k in range(8)]
        inner = xform(inner, pitch=hp, yaw=yaw * 0.6, pivot=(0, 1.42, 0.18))
        faces += [(inner, PINK, False, False)]
        cup = []
        for z in (-0.14, 0.02):
            ring = [(ex * 1.02 + 0.28 * math.cos(math.radians(15 + 30 * k)), ey - 0.02 + 0.28 * math.sin(math.radians(15 + 30 * k)), z) for k in range(12)]
            cup.append(ring)
        cup = [xform(ring, pitch=hp, yaw=yaw * 0.6, pivot=(0, 1.42, 0.18)) for ring in cup]
        faces += R.loft(cup, BLACK, caps=True)
        gl = [(ex * 1.06 - 0.10, ey + 0.10, -0.03), (ex * 1.06 + 0.02, ey + 0.14, -0.03), (ex * 1.06 + 0.02, ey + 0.06, -0.03), (ex * 1.06 - 0.10, ey + 0.02, -0.03)]
        faces += [(xform(gl, pitch=hp, yaw=yaw * 0.6, pivot=(0, 1.42, 0.18)), (58, 58, 62), True, False)]
    band = []
    for a in range(-64, 65, 16):
        ar = math.radians(a)
        c = (0.52 * math.sin(ar), 1.66 + 0.50 * math.cos(ar), 0.10)
        band.append(ring4(c, (math.sin(ar), math.cos(ar)), 0.055, 0.075))
    band = [xform(ring, pitch=hp, yaw=yaw * 0.6, pivot=(0, 1.42, 0.18)) for ring in band]
    faces += R.loft(band, BLACK, caps=True)
    # глаза
    blinkv = R.blink(t) if mood in ('idle', 'lean', 'nod') else (1.3 if mood == 'scared' else 0.28)
    for side in (-1, 1):
        e = [(side * 0.17 + 0.055 * math.cos(math.radians(22.5 + 45 * k)), 1.60 + 0.055 * blinkv * math.sin(math.radians(22.5 + 45 * k)), 0.55) for k in range(8)]
        e = xform(e, pitch=hp, yaw=yaw * 0.6, pivot=(0, 1.42, 0.18))
        faces += [(e, (18, 14, 12), True, False)]
        g = [(side * 0.17 + 0.018 + 0.016 * math.cos(math.radians(45 * k)), 1.62 + 0.016 * math.sin(math.radians(45 * k)), 0.58) for k in range(8)]
        g = xform(g, pitch=hp, yaw=yaw * 0.6, pivot=(0, 1.42, 0.18))
        if blinkv > 0.5:
            faces += [(g, (240, 240, 235), True, False)]
    # лапы
    paw_pos = {'facepalm': [(0.10, 1.48, 0.74), (-0.30, 0.98, 0.78)], 'scared': [(0.24, 1.26, 0.72), (-0.24, 1.26, 0.72)],
               'excited': [(0.38, 1.34, 0.62), (-0.28, 0.98, 0.78)]}.get(mood, [(0.28, 0.98, 0.80), (-0.28, 0.98, 0.80)])
    for i, (px, py, pz) in enumerate(paw_pos):
        w0 = 0.16 if (i == 0 and mood == 'facepalm') else 0.13
        pw = [ring4((px, py, pz - 0.10), (1, 0), w0, w0 - 0.03), ring4((px, py, pz + 0.10), (1, 0), w0 - 0.02, w0 - 0.04)]
        faces += R.loft(pw, FUR_D, caps=True)
    # хвост
    sw = 0.25 * math.sin(t * (4.0 if mood == 'excited' else 1.2))
    tp = [(0.30, 0.55, -0.55), (0.85 + sw * 0.2, 0.85, -0.15), (0.99 + sw * 0.5, 1.12, 0.30), (0.96 + sw, 0.78, 0.98)]
    tr = []
    for i, c in enumerate(tp):
        w = 0.095 - i * 0.02
        tr.append(ring4(c, (1, 0.2), w, w))
    faces += R.loft(tr, (186, 148, 138), caps=True)
    # усы
    for side in (-1, 1):
        for k in (-1, 0, 1):
            a = xform([(side * 0.16, 1.46 + k * 0.03, 0.62)], pitch=hp, yaw=yaw * 0.6, pivot=(0, 1.42, 0.18))[0]
            b = xform([(side * 0.52, 1.48 + k * 0.07, 0.55)], pitch=hp, yaw=yaw * 0.6, pivot=(0, 1.42, 0.18))[0]
            lines.append((a, b))
    return faces, lines


def draw(mood, t):
    im = background().copy()
    dr = ImageDraw.Draw(im)
    faces, lines = rat_faces(mood, t)
    cam = R.make_cam((0.0, 1.42, 3.1), (0, 1.22, 0.1))
    proj = []
    for f in faces:
        pts, col = f[0], f[1]
        emis = f[2] if len(f) > 2 else False
        ol = f[3] if len(f) > 3 else True
        pp = [R.project(p, cam) for p in pts]
        if any(p is None for p in pp):
            continue
        depth = sum(p[2] for p in pp) / len(pp)
        proj.append((depth, pp, col, emis, ol))
    proj.sort(key=lambda q: -q[0])
    for depth, pp, col, emis, ol in proj:
        if emis:
            c = col
        else:
            n = _normal(pp)
            c = tuple(min(255, int(ch * (0.55 + 0.45 * n))) for ch in col)
        poly = [(p[0], p[1]) for p in pp]
        dr.polygon(poly, fill=c, outline=tuple(max(0, ch - 26) for ch in c) if ol else None)
    for a, b in lines:
        pa, pb = R.project(a, cam), R.project(b, cam)
        if pa and pb:
            dr.line([(pa[0], pa[1]), (pb[0], pb[1])], fill=(226, 220, 205), width=1)
    return im


def _normal(pp):
    (x1, y1, _), (x2, y2, _), (x3, y3, _) = pp[0], pp[1], pp[2]
    ax, ay = x2 - x1, y2 - y1
    bx, by = x3 - x1, y3 - y1
    cr = ax * by - ay * bx
    return 0.75 if cr > 0 else 0.45


if __name__ == '__main__':
    cmd = sys.argv[1]
    if cmd == 'still':
        mood, t, out = sys.argv[2], float(sys.argv[3]), sys.argv[4]
        draw(mood, t).save(out)
        print('saved', out)
    elif cmd == 'seq':
        tl = json.load(open(sys.argv[2]))
        outdir, fps = sys.argv[3], float(sys.argv[4])
        os.makedirs(outdir, exist_ok=True)
        n = 0
        for seg in tl:
            dur = seg['dur']
            frames = int(dur * fps)
            for i in range(frames):
                lt = i / fps
                draw(seg['mood'], seg['t0'] + lt).save(os.path.join(outdir, f'{n:05d}.png'))
                n += 1
        print('rat frames:', n)
