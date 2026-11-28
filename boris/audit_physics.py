#!/usr/bin/env python3
# Аудит физики пересечений (v6): коты vs стенки коробки, коты между собой, посадка на крышу.
# Прогоняет все сцены эпизода по кадрам и печатает нарушения. Запуск: audit_physics.py
import math
import render3d as R

R.set_fps(25); R.set_mode("shorts")

def smooth(a, b, t):
    return R.smooth(a, b, t)

BOXES = {
    48: lambda t: (-3.0 + 3.3*smooth(0.6, 3.2, t), 2.10, 0.80, None),
    49: lambda t: (0.30, 2.10, 0.80, None),
    50: lambda t: (0.30, 2.10, 0.80, None),
    51: lambda t: (0.30, 2.10, 0.80, None),
    52: lambda t: (0.30, 2.10, 0.80, None),
    53: lambda t: (0.30 + 1.30*smooth(1.2, 4.0, t) - 0.30*smooth(4.0, 4.8, t)*(1-smooth(4.8, 5.6, t)), 2.10, 0.80, None),
    54: lambda t: (0.30, 2.10, 0.80, 0.81 if smooth(1.0, 2.4, t) > 0.8 else None),
    55: lambda t: (0.30, 2.10, 0.80, 0.81),
    56: lambda t: (0.30, 2.10, 0.80, 0.81),
}
ANIM = {48: 16, 49: 16, 50: 15, 51: 16, 52: 17, 53: 16, 54: 16, 55: 16, 56: 16}
HW, HD, WALL = 0.55, 0.50, 0.06

def circle_ring_hit(cx, cz, r, bx, bz):
    """круг кота касается кольца стенок (не полностью внутри полости и не полностью снаружи)"""
    in_outer = abs(cx-bx) < HW + r and abs(cz-bz) < HD + r
    in_inner = abs(cx-bx) < HW - WALL - r and abs(cz-bz) < HD - WALL - r
    out_full = abs(cx-bx) > HW + r or abs(cz-bz) > HD + r
    return in_outer and not in_inner and not out_full

def inside_cavity(cx, cz, r, bx, bz):
    return abs(cx-bx) < HW - WALL - r + 0.02 and abs(cz-bz) < HD - WALL - r + 0.02

bad = []
for k, D in ANIM.items():
    t = 0.0
    while t <= D:
        R.AUDIT = True
        R.CAT_BOXES.clear()
        R.render_frame(k, t, [])
        cats = R.CAT_BOXES[:]
        R.AUDIT = False
        bx, bz, rim, roof = BOXES[k](t)
        for i, (x0, x1, y0, y1, z0, z1) in enumerate(cats):
            cx, cz = (x0+x1)/2, (z0+z1)/2
            r = max((x1-x0)/2, (z1-z0)/2) * 0.62
            if circle_ring_hit(cx, cz, r, bx, bz):
                if not (y0 > rim + 0.04) and not (inside_cavity(cx, cz, r, bx, bz) and y0 > 0.05):
                    bad.append((k, round(t, 1), f"cat{i} clips wall ring at ({cx:.2f},{cz:.2f}) y0={y0:.2f} rim={rim}"))
            if roof is not None and abs(cx-bx) < HW and abs(cz-bz) < HD and y0 > rim:
                if y0 < roof - 0.02 or y0 > roof + 0.10:
                    bad.append((k, round(t, 1), f"cat{i} roof contact y0={y0:.2f} roof={roof}"))
        for i in range(len(cats)):
            for j in range(i+1, len(cats)):
                a, b = cats[i], cats[j]
                dx = (a[0]+a[1])/2 - (b[0]+b[1])/2
                dz = (a[4]+a[5])/2 - (b[4]+b[5])/2
                dy_ok = a[2] > b[3] + 0.04 or b[2] > a[3] + 0.04
                if math.hypot(dx, dz) < 0.42 and not dy_ok:
                    bad.append((k, round(t, 1), f"cat{i} overlaps cat{j} dist={math.hypot(dx, dz):.2f}"))
        t += 0.5
if bad:
    for row in bad:
        print("VIOLATION", row)
    print("total:", len(bad))
else:
    print("PHYSICS OK: no intersections in k48-k56")
