#!/usr/bin/env python3
# Мини-3D-движок для «Бориса»: software-рендер с ригом кота и настоящей
# анимацией (ходьба, прыжок, поза, хвост, блинки, орбита камеры).
# Пишет boris/build/seg{k}.mp4; сборка озвучки/склейки — build.py.
import math, os, subprocess, sys
from PIL import Image, ImageDraw
import build as B

W, H, FPS = B.W, B.H, B.FPS
FF = B.FF
TMP = B.TMP
F = 1500.0
MODE = "wide"

def set_fps(f):
    global FPS
    FPS = f

def set_mode(m):
    global MODE, W, H, F
    MODE = m
    if m == "shorts":
        W, H, F = 1080, 1920, 1350.0
    else:
        W, H, F = 1920, 1080, 1500.0
    SKY.clear()

CLAY = (212, 206, 198); ORANGE = (232, 138, 58); PINK = (238, 150, 170)
GREEN = (70, 200, 70); BLACK = (15, 15, 15); PURP = (150, 40, 190)
GREY = (178, 178, 180); GREY_D = (150, 150, 152); WHITE = (235, 235, 230)
BROWN = (186, 148, 100); RED = (190, 60, 55); KIB = (150, 105, 60)
MUZZ = (228, 223, 217)
LIGHT = (0.45, 0.8, -0.4)
LN = math.sqrt(sum(c * c for c in LIGHT)); LIGHT = tuple(c / LN for c in LIGHT)

# ---------- вектора ----------
def sub(a, b): return (a[0]-b[0], a[1]-b[1], a[2]-b[2])
def cross(a, b): return (a[1]*b[2]-a[2]*b[1], a[2]*b[0]-a[0]*b[2], a[0]*b[1]-a[1]*b[0])
def dot(a, b): return a[0]*b[0]+a[1]*b[1]+a[2]*b[2]
def rx(p, a, pv=(0,0,0)):
    q = sub(p, pv); c, s = math.cos(a), math.sin(a)
    return (q[0]+pv[0], q[1]*c-q[2]*s+pv[1], q[1]*s+q[2]*c+pv[2])
def ry(p, a, pv=(0,0,0)):
    q = sub(p, pv); c, s = math.cos(a), math.sin(a)
    return (q[0]*c+q[2]*s+pv[0], q[1]+pv[1], -q[0]*s+q[2]*c+pv[2])
def rz(p, a, pv=(0,0,0)):
    q = sub(p, pv); c, s = math.cos(a), math.sin(a)
    return (q[0]*c-q[1]*s+pv[0], q[0]*s+q[1]*c+pv[1], q[2]+pv[2])

def box(c, s, col):
    x, y, z = s[0]/2, s[1]/2, s[2]/2
    p = [(c[0]-x,c[1]-y,c[2]-z),(c[0]+x,c[1]-y,c[2]-z),(c[0]+x,c[1]+y,c[2]-z),(c[0]-x,c[1]+y,c[2]-z),
         (c[0]-x,c[1]-y,c[2]+z),(c[0]+x,c[1]-y,c[2]+z),(c[0]+x,c[1]+y,c[2]+z),(c[0]-x,c[1]+y,c[2]+z)]
    f = [(p[0],p[1],p[2],p[3]),(p[4],p[5],p[6],p[7]),(p[0],p[1],p[5],p[4]),
         (p[2],p[3],p[7],p[6]),(p[1],p[2],p[6],p[5]),(p[0],p[3],p[7],p[4])]
    return [(list(q), col, False) for q in f]

def quad(a, b, c, d, col, emis=False):
    return [([a, b, c, d], col, emis)]

def scale_pts(pts, c, s):
    return [(c[0]+(p[0]-c[0])*s, c[1]+p[1]*s, c[2]+(p[2]-c[2])*s) for p in pts]

def clamp01(x): return max(0.0, min(1.0, x))
def smooth(a, b, t):
    x = clamp01((t-a)/(b-a)); return x*x*(3-2*x)
def eob(x):  # easeOutBack
    c1 = 1.70158; c3 = c1+1
    return 1 + c3*(x-1)**3 + c1*(x-1)**2
def blink(t): return 0.15 if (t % 3.7) < 0.14 else 1.0

# ---------- кот ----------
def octa(z, yc, r, squash=0.92):
    pts = []
    for k in range(8):
        a = math.radians(22.5 + 45*k)
        pts.append((r*math.cos(a), yc + r*math.sin(a)*squash, z))
    return pts

def loft(rings, col, ol=True, caps=True):
    faces = []
    for i in range(len(rings)-1):
        A, Bn = rings[i], rings[i+1]
        for k in range(len(A)):
            k2 = (k+1) % len(A)
            faces.append(([A[k], A[k2], Bn[k2], Bn[k]], col, False, ol))
    if caps:
        faces.append((list(rings[0]), col, False, ol))
        faces.append((list(reversed(rings[-1])), col, False, ol))
    return faces

def disc(cx, cy, cz, r, squash=1.0):
    pts = []
    for k in range(8):
        a = math.radians(22.5 + 45*k)
        pts.append((cx + r*math.cos(a), cy + r*math.sin(a)*squash, cz))
    return pts

def B4(c, s, col):
    return [(q, col, False, True) for q, _c, _e in box(c, s, col)]

def cat_faces(P):
    """P: x,z,yaw,lift,pitch,walk,head_yaw,head_pitch,sit,rear,tp,tail_t,blink,detach,paper,crouch,grey,ear_tw"""
    faces, lines = [], []
    lift = P.get("lift", 0.0) + (0.015*abs(math.sin(P["walk"]*math.pi*2)) if P.get("walk") else 0.0)
    lift += 0.010*math.sin(P.get("breath", P.get("tail_t", 0.0))*2.3)   # дыхание
    if P.get("crouch"): lift -= 0.13
    bp = P.get("pitch", 0.0)
    def body(p):
        p = rx(p, bp, (0, 0.30, 0))
        p = ry(p, P.get("yaw", 0.0))
        return (p[0]+P.get("x", 0), p[1]+lift, p[2]+P.get("z", 0))
    # тело — округлый лофт из восьмигранных сечений
    BS = [(-0.22, 0.295, 0.068), (-0.12, 0.310, 0.090), (0.04, 0.317, 0.088),
          (0.15, 0.327, 0.074), (0.22, 0.337, 0.056)]
    rings = [octa(z, yc, r) for z, yc, r in BS]
    faces += [([body(p) for p in q], c, e, ol) for q, c, e, ol in loft(rings, CLAY)]
    pr = [octa(z, yc, r*1.06) for z, yc, r in BS]
    for i in (1, 2):
        faces += [([body(p) for p in [pr[i][1], pr[i][2], pr[i+1][2], pr[i+1][1]]], ORANGE, False, False)]
    faces += [([body(p) for p in q], c, e, ol) for q, c, e, ol in B4((0, 0.385, 0.14), (0.10, 0.12, 0.14), CLAY)]
    # ноги: бедро тоньше к низу + подушечка-лапка
    legs = {"FL": (0.070, 0.26, 0.14), "FR": (-0.070, 0.26, 0.14), "HL": (0.070, 0.26, -0.14), "HR": (-0.070, 0.26, -0.14)}
    a = 0.5*math.sin(P["walk"]*math.pi*2) if P.get("walk") else 0.0
    ang = {"FL": a, "HR": a, "FR": -a, "HL": -a}
    if P.get("sit"): ang.update({"HL": 1.25, "HR": 1.25, "FL": 0.0, "FR": 0.0})
    if P.get("rear"): r = P["rear"]; ang.update({"FL": -1.15*r, "FR": -1.15*r, "HL": 0.5*r, "HR": 0.5*r})
    if P.get("crouch"): ang = {"FL": 0.7, "FR": 0.7, "HL": 0.9, "HR": 0.9}
    if P.get("knead") is not None:
        kn = P["knead"]
        ang["FL"] = 0.45*math.sin(kn*6.0)
        ang["FR"] = 0.45*math.sin(kn*6.0 + 3.14)
    for name, pv in legs.items():
        parts = B4((pv[0], pv[1]-0.075, pv[2]), (0.062, 0.14, 0.066), CLAY)
        parts += B4((pv[0], pv[1]-0.185, pv[2]), (0.048, 0.13, 0.052), CLAY)
        parts += B4((pv[0], pv[1]-0.24, pv[2]+0.02), (0.055, 0.05, 0.08), CLAY)
        for q, col, e, ol in parts:
            qq = [rx(p, ang[name], pv) for p in q]
            if P.get("tp"):
                sgn = 1.0 if name.endswith("L") else -1.0
                qq = [rz(p, sgn*1.5708, pv) for p in qq]
                qq = [(p[0], pv[1], p[2]) for p in qq]
            faces.append(([body(p) for p in qq], col, e, ol))
    # голова — округлый лофт, чуть крупнее тела (чиби)
    HP = (0, 0.40, 0.20)
    hy, hp = P.get("head_yaw", 0.0), P.get("head_pitch", 0.0)
    def head(p):
        p = ry(p, hy, HP); p = rx(p, hp, HP)
        return body(p)
    HS = [(0.155, 0.465, 0.070), (0.225, 0.475, 0.096), (0.315, 0.480, 0.090), (0.375, 0.472, 0.062)]
    hr = [octa(z, yc, r, 0.95) for z, yc, r in HS]
    faces += [([head(p) for p in q], c, e, ol) for q, c, e, ol in loft(hr, CLAY)]
    ph = [octa(z, yc, r*1.05, 0.95) for z, yc, r in HS]
    for i in (1, 2):
        faces += [([head(p) for p in [ph[i][1], ph[i][2], ph[i+1][2], ph[i+1][1]]], ORANGE, False, False)]
    faces += [([head(p) for p in q], c, e, ol) for q, c, e, ol in B4((0, 0.442, 0.390), (0.062, 0.048, 0.055), MUZZ)]
    faces += [([head(p) for p in [(-0.012, 0.456, 0.420), (0.012, 0.456, 0.420), (0, 0.442, 0.420)]], PINK, True, False)]
    # ушки-конусы
    tw = P.get("ear_tw", 0.0)
    for sgn, ext in ((1, tw), (-1, 0.0)):
        base = [(sgn*0.052-0.034, 0.545, 0.22), (sgn*0.052+0.034, 0.545, 0.22), (sgn*0.052, 0.545, 0.285)]
        tip = [(sgn*0.052-0.009, 0.620, 0.225), (sgn*0.052+0.009, 0.620, 0.225), (sgn*0.052, 0.620, 0.250)]
        pv = (sgn*0.052, 0.545, 0.20)
        ear = loft([base, tip], ORANGE if (sgn > 0 or P.get("painted")) else CLAY)
        faces += [([head(rz(p, sgn*0.16+ext, pv)) for p in q], c, e, ol) for q, c, e, ol in ear]
    # глаза-круги с зрачком и бликом
    bl = P.get("blink", 1.0)
    for sgn in (1, -1):
        ex = sgn*0.046
        faces += [( [head(p) for p in disc(ex, 0.492, 0.378, 0.034, bl)], GREEN, True, False)]
        faces += [( [head(p) for p in disc(ex, 0.492, 0.382, 0.016, bl)], (25, 25, 25), True, False)]
        faces += [( [head(p) for p in disc(ex-0.010, 0.492+0.012*bl, 0.386, 0.0065, bl)], (250, 250, 250), True, False)]
    if P.get("paper"):
        faces += [([head(p) for p in [(-0.09, 0.40, 0.42), (0.09, 0.40, 0.42), (0.11, 0.52, 0.48), (-0.11, 0.52, 0.48)]], WHITE, False, False)]
    # усы
    for sgn in (1, -1):
        for dy, dz in ((0.014, 0.30), (0.0, 0.345), (-0.014, 0.39)):
            lines.append((head((sgn*0.030, 0.442, 0.40)), head((sgn*0.13, 0.442+dy, dz))))
    # хвост-«missing texture», сужающийся и плавный
    tb = (0, 0.36, -0.14)
    if P.get("detach"):
        w = P["tail_t"]
        tb = (0.12+0.03*math.sin(w*5), 0.46+0.04*math.sin(w*3.1), -0.30)
    pos = tb
    w = P["tail_t"]
    for i in range(7):
        eb = -0.35 if P.get("tail_down") else 0.75
        elev = eb + 0.22*math.sin(w*2.0 + i*0.55)
        azim = 0.45*math.sin(w*2.6 + i*0.40)
        d = (math.sin(azim)*0.048, math.sin(elev)*0.048, -math.cos(azim)*0.048)
        pos = (pos[0]+d[0], pos[1]+d[1], pos[2]+d[2])
        s = 0.050 - 0.024*(i/6.0)
        if P.get("painted"):
            col = ORANGE if i % 2 == 0 else (205, 115, 45)
            faces += [([body(p) for p in q], col, False, True) for q, c2, e in box(pos, (s, s, s*1.1), col)]
        else:
            col = PURP if i % 2 == 0 else BLACK
            faces += [([body(p) for p in q], col, True, False) for q, c2, e in box(pos, (s, s, s*1.1), col)]
    if P.get("painted"):
        # нормальные текстуры: белая шерсть + рыжие полоски табби
        for i in (0, 3):
            faces += [([body(p) for p in [pr[i][1], pr[i][2], pr[i+1][2], pr[i+1][1]]], (200, 110, 45), False, False)]
        for i in (1, 2):
            faces += [([head(p) for p in [ph[i][1], ph[i][2], ph[i+1][2], ph[i+1][1]]], (200, 110, 45), False, False)]
        pm = {CLAY: (244, 240, 233)}
        faces = [(q, pm.get(c, c), e, ol) for q, c, e, ol in faces]
    if P.get("grey"):
        gm = {CLAY: (172, 172, 174), ORANGE: (172, 172, 174), MUZZ: (182, 182, 184),
              GREEN: (95, 95, 97), BLACK: (120, 120, 122), PINK: (150, 150, 152), PURP: (150, 150, 152)}
        faces = [(q, gm.get(c, c), e, ol) for q, c, e, ol in faces]
    if P.get("black"):
        bm = {CLAY: (56, 54, 60), ORANGE: (66, 62, 70), MUZZ: (84, 80, 88),
              GREEN: (242, 202, 74), BLACK: (34, 32, 38), PINK: (140, 100, 110),
              PURP: (46, 44, 52), WHITE: (84, 80, 88)}
        faces = [(q, bm.get(c, c), e, ol) for q, c, e, ol in faces]
    return faces, lines

# ---------- камера/рендер ----------
def make_cam(pos, target):
    d = sub(target, pos)
    yaw = math.atan2(d[0], d[2])
    pitch = math.atan2(d[1], math.hypot(d[0], d[2]))
    return pos, yaw, pitch

def project(p, cam):
    pos, yaw, pitch = cam
    v = sub(p, pos)
    c, s = math.cos(yaw), math.sin(yaw)
    x1 = v[0]*c - v[2]*s; z1 = v[0]*s + v[2]*c; y1 = v[1]
    c2, s2 = math.cos(pitch), math.sin(pitch)
    y2 = y1*c2 - z1*s2; z2 = y1*s2 + z1*c2
    if z2 < 0.15: return None
    return (W/2 + F*x1/z2, H/2 - F*y2/z2, z2)

def shade(face):
    pts, col, emis = face
    if emis: return col
    a, b, c = pts[0], pts[1], pts[2]
    n = cross(sub(b, a), sub(c, a))
    ln = math.sqrt(dot(n, n)) or 1.0
    k = abs(dot(n, LIGHT)) / ln
    f = 0.42 + 0.58*k
    return tuple(min(255, int(ch*f)) for ch in col)

SKY = {}
def sky_img(key, top, bot):
    if key in SKY: return SKY[key]
    im = Image.new("RGB", (1, H))
    px = im.load()
    for y in range(H):
        t = y/H
        px[0, y] = tuple(int(top[i]+(bot[i]-top[i])*t) for i in range(3))
    im = im.resize((W, H))
    SKY[key] = im
    return im

def draw_grid(dr, cam, n=7, step=1.0, zmax=16):
    for i in range(-n, n+1):
        a, b = project((i*step, 0, 0), cam), project((i*step, 0, zmax), cam)
        if a and b: dr.line([a[0], a[1], b[0], b[1]], fill=(105, 105, 107), width=2)
    for z in range(0, zmax+1, 2):
        a, b = project((-n*step, 0, z), cam), project((n*step, 0, z), cam)
        if a and b: dr.line([a[0], a[1], b[0], b[1]], fill=(105, 105, 107), width=2)

def draw_shadow(dr, cam, x, z, r=0.35):
    c = project((x, 0.012, z), cam)
    e = project((x+r, 0.012, z), cam)
    if c and e:
        rx_ = abs(e[0]-c[0]); dr.ellipse([c[0]-rx_, c[1]-rx_*0.32, c[0]+rx_, c[1]+rx_*0.32], fill=(95, 95, 97))

# ---------- пролог: голуби, рука, лавка, сердечки, краска ----------
PGREY = (152, 158, 170); PGREY_D = (110, 116, 130); PBEAK = (228, 178, 92)
SKIN = (226, 190, 160); SLEEVE = (96, 110, 148); PAINT = (240, 242, 246)
WET = (58, 64, 78)

def _xform(items, fn):
    return [tuple([[fn(p) for p in it[0]]] + list(it[1:])) for it in items]

def pigeon_faces(x, z, yaw, t, fly=0.0, peck=0.0, scale=1.0, y=None):
    """Низкополигональный голубь: тело, голова, клюв, хвост, лапки, машущие крылья."""
    s = scale
    y0 = (0.14*s if y is None else y) + fly*1.45
    def T_(p):
        q = ry(p, yaw)
        return (q[0]+x, q[1]+y0, q[2]+z)
    hp = 0.10*peck
    f = _xform(B4((0, 0, 0), (0.16*s, 0.13*s, 0.24*s), PGREY), T_)
    f += _xform(B4((0, 0.075*s, 0.150*s - hp*0.09*s), (0.085*s, 0.085*s, 0.085*s), PGREY), T_)
    f += _xform(B4((0, 0.062*s - hp*0.02*s, 0.205*s - hp*0.15*s), (0.035*s, 0.032*s, 0.062*s), PBEAK), T_)
    f += _xform(B4((0, 0.020*s, -0.16*s), (0.07*s, 0.022*s, 0.13*s), PGREY_D), T_)
    for sgn in (1, -1):
        f += _xform(B4((sgn*0.040*s, -0.075*s, 0.0), (0.018*s, 0.08*s, 0.018*s), (196, 126, 112)), T_)
        piv = (sgn*0.055*s, 0.03*s, -0.02*s)
        if fly > 0.02:
            wa = 0.95*math.sin(t*21.0 + sgn*0.2)
            wbox = B4((sgn*0.140*s, 0.030*s, -0.02*s), (0.20*s, 0.022*s, 0.22*s), PGREY_D)
        else:
            wa = 0.06*math.sin(t*1.7 + sgn)
            wbox = B4((sgn*0.082*s, 0.020*s, -0.03*s), (0.035*s, 0.09*s, 0.17*s), PGREY_D)
        wing = [([rz(p, sgn*wa, piv) for p in q], c, e, ol) for q, c, e, ol in wbox]
        f += _xform(wing, T_)
    return f

def hand_faces(hx, hy, hz, s=1.0, ang=0.0, side=1, can=False, bowl=False):
    """Рука из-за кадра: рукав, кулак, большой палец + баллончик или миска."""
    def T_(p):
        q = (hx + side*(p[0]-hx), p[1], p[2])
        return rz(q, side*ang, (hx, hy, hz))
    f = _xform(B4((hx + side*0.55*s, hy - 0.02*s, hz), (1.20*s, 0.16*s, 0.16*s), SLEEVE), T_)
    f += _xform(B4((hx + side*0.05*s, hy, hz), (0.21*s, 0.19*s, 0.18*s), SKIN), T_)
    f += _xform(B4((hx + side*0.01*s, hy + 0.075*s, hz + 0.055*s), (0.10*s, 0.075*s, 0.06*s), SKIN), T_)
    if can:
        f += _xform(B4((hx - side*0.03*s, hy + 0.03*s, hz), (0.115*s, 0.30*s, 0.115*s), (70, 96, 150)), T_)
        f += _xform(B4((hx - side*0.03*s, hy + 0.20*s, hz), (0.075*s, 0.05*s, 0.075*s), (212, 214, 218)), T_)
        f += _xform(B4((hx - side*0.03*s, hy - 0.05*s, hz), (0.10*s, 0.09*s, 0.10*s), PAINT), T_)
    if bowl:
        f += _xform(box((hx - side*0.02*s, hy - 0.16*s, hz), (0.30*s, 0.13*s, 0.30*s), RED), T_)
        f += _xform(box((hx - side*0.02*s, hy - 0.095*s, hz), (0.22*s, 0.05*s, 0.22*s), KIB), T_)
    return f

def bench_faces(x, z, yaw=0.0, s=1.0):
    def T_(p):
        q = ry(p, yaw)
        return (q[0]+x, q[1], q[2]+z)
    f = _xform(box((0, 0.54*s, 0), (1.75*s, 0.07*s, 0.54*s), BROWN), T_)
    f += _xform(box((0, 0.82*s, -0.25*s), (1.75*s, 0.44*s, 0.06*s), BROWN), T_)
    for sx in (-0.74, 0.74):
        f += _xform(box((sx*s, 0.26*s, 0.17*s), (0.08*s, 0.52*s, 0.08*s), (72, 74, 80)), T_)
        f += _xform(box((sx*s, 0.26*s, -0.17*s), (0.08*s, 0.52*s, 0.08*s), (72, 74, 80)), T_)
    return f

def spray_puff(nx, ny, nz, d, t, t0, n=26, spread=0.30, col=PAINT):
    """Струя краски из баллончика: разлетающиеся квадратики."""
    f = []
    if t < t0: return f
    for i in range(n):
        u = ((t - t0)*1.55 + i*0.137) % 1.0
        sp = 0.45 + 1.05*(i % 7)/7.0
        px = nx + d[0]*u*sp + spread*math.sin(i*2.3 + t*3.0)*u
        py = ny + d[1]*u*sp + spread*math.cos(i*1.7 + t*2.6)*u - 0.16*u*u
        pz = nz + d[2]*u*sp + spread*math.sin(i*3.1)*u
        sz = (0.030 + 0.085*u)*(1.0 - 0.35*u)
        f += box((px, py, pz), (sz, sz, sz*0.6), col if i % 3 else ORANGE)
    return f

def paint_cloud(t, on, k=14):
    """Облако краски, которое прячет кота в момент превращения."""
    f = []
    if on <= 0.02: return f
    for i in range(k):
        a2 = i*0.45 + t*0.7
        rr = (0.28 + 0.40*((i*37 % 10)/10.0))*on
        yy = 0.16 + 0.52*((i*53 % 10)/10.0)
        sz = (0.20 + 0.18*math.sin(i*2.1))*on
        f += box((rr*math.cos(a2), yy, rr*math.sin(a2)), (sz, sz, sz*0.7),
                 PAINT if i % 3 else (250, 214, 170))
    return f

def heart_faces(cx, cy, cz, s):
    f = box((cx - 0.15*s, cy + 0.10*s, cz), (0.22*s, 0.22*s, 0.07*s), PINK)
    f += box((cx + 0.15*s, cy + 0.10*s, cz), (0.22*s, 0.22*s, 0.07*s), PINK)
    f += box((cx, cy - 0.11*s, cz), (0.30*s, 0.24*s, 0.07*s), PINK)
    return f

def car_faces(x, z, yaw=0.0, s=1.0, col=(72, 92, 122), y=0.0, shake=0.0):
    def T_(q):
        r = ry(q, yaw)
        j = shake*math.sin(r[0]*31.0 + r[2]*17.0)
        return (r[0]+x, r[1]+y+j, r[2]+z)
    f = _xform(box((0, 0.52*s, 0), (2.1*s, 0.40*s, 1.0*s), col), T_)
    f += _xform(box((0, 0.70*s, 0), (2.14*s, 0.06*s, 1.02*s), (64, 82, 110)), T_)          # молдинг
    f += _xform(box((-0.25*s, 0.92*s, 0), (1.05*s, 0.38*s, 0.90*s), (58, 74, 100)), T_)
    f += _xform(box((-0.25*s, 1.12*s, 0), (1.0*s, 0.04*s, 0.86*s), (52, 66, 90)), T_)       # крыша
    for wz in (-0.46, 0.46):                                                               # стёкла боков
        f += _xform([([(-0.68*s, 0.80*s, wz*s), (0.16*s, 0.80*s, wz*s), (0.10*s, 1.06*s, wz*s), (-0.60*s, 1.06*s, wz*s)], (168, 196, 214), False)], T_)
    f += _xform([([(0.24*s, 0.80*s, -0.44*s), (0.24*s, 0.80*s, 0.44*s), (0.30*s, 1.06*s, 0.40*s), (0.30*s, 1.06*s, -0.40*s)], (178, 204, 220), False)], T_)  # лобовое
    f += _xform([([(-0.74*s, 0.80*s, -0.44*s), (-0.74*s, 0.80*s, 0.44*s), (-0.80*s, 1.06*s, 0.40*s), (-0.80*s, 1.06*s, -0.40*s)], (178, 204, 220), False)], T_)  # заднее
    f += _xform(box((0.10*s, 0.62*s, -0.50*s), (0.02*s, 0.26*s, 0.02*s), (40, 52, 70)), T_)  # шов двери
    f += _xform(box((0.28*s, 0.66*s, -0.51*s), (0.10*s, 0.03*s, 0.02*s), (200, 204, 210)), T_)  # ручка
    f += _xform(box((1.08*s, 0.50*s, 0), (0.10*s, 0.16*s, 1.02*s), (190, 194, 200)), T_)    # бампер пер.
    f += _xform(box((-1.08*s, 0.50*s, 0), (0.10*s, 0.16*s, 1.02*s), (190, 194, 200)), T_)   # бампер зад.
    f += _xform(box((1.06*s, 0.62*s, 0), (0.05*s, 0.10*s, 0.72*s), (244, 236, 190)), T_)    # фары
    f += _xform(box((-1.06*s, 0.62*s, 0), (0.05*s, 0.10*s, 0.72*s), (190, 60, 55)), T_)     # фонари
    f += _xform(box((0.30*s, 1.02*s, -0.52*s), (0.10*s, 0.06*s, 0.10*s), (58, 74, 100)), T_)  # зеркало
    for wx in (-0.72, 0.72):
        for wz in (-0.54, 0.54):
            f += _xform(box((wx*s, 0.26*s, wz*s), (0.36*s, 0.36*s, 0.14*s), (28, 28, 30)), T_)
            f += _xform(box((wx*s, 0.26*s, wz*s + (0.08*s if wz > 0 else -0.08*s)), (0.16*s, 0.16*s, 0.04*s), (176, 178, 182)), T_)  # hub
    return f

def cat_house(x, z, yaw=0.0, s=1.0, glow=1.0, night=False, snow_roof=0.0):
    def T_(q):
        r = ry(q, yaw)
        return (r[0]+x, r[1], r[2]+z)
    col = (150, 96, 56) if not night else (118, 78, 50)
    f = _xform(box((0, 0.02*s, 0), (0.84*s, 0.04*s, 0.84*s), (90, 66, 44)), T_)
    f += _xform(box((-0.36*s, 0.30*s, 0), (0.12*s, 0.56*s, 0.80*s), col), T_)
    f += _xform(box((0.36*s, 0.30*s, 0), (0.12*s, 0.56*s, 0.80*s), col), T_)
    f += _xform(box((0, 0.30*s, 0.36*s), (0.60*s, 0.56*s, 0.12*s), col), T_)
    f += _xform(box((-0.27*s, 0.30*s, -0.36*s), (0.14*s, 0.56*s, 0.12*s), col), T_)
    f += _xform(box((0.27*s, 0.30*s, -0.36*s), (0.14*s, 0.56*s, 0.12*s), col), T_)
    f += _xform(box((0, 0.52*s, -0.36*s), (0.40*s, 0.12*s, 0.12*s), col), T_)
    f += _xform(box((0, 0.30*s, 0.06*s), (0.58*s, 0.50*s, 0.54*s), (34, 30, 28)), T_)
    f += _xform([([(-0.52*s, 0.56*s, -0.52*s), (0, 0.94*s, -0.52*s), (0, 0.94*s, 0.52*s), (-0.52*s, 0.56*s, 0.52*s)], (122, 62, 48), False)], T_)
    f += _xform([([(0.52*s, 0.56*s, -0.52*s), (0, 0.94*s, -0.52*s), (0, 0.94*s, 0.52*s), (0.52*s, 0.56*s, 0.52*s)], (122, 62, 48), False)], T_)
    f += _xform(box((0, 0.95*s, 0), (0.10*s, 0.06*s, 1.06*s), (96, 48, 38)), T_)          # конёк
    # фронтоны: треугольные торцы между половинами крыши (иначе сквозит)
    for zz in (-0.36, 0.36):
        f += _xform([([(-0.52*s, 0.56*s, zz*s), (0.52*s, 0.56*s, zz*s), (0, 0.94*s, zz*s)], col, False)], T_)
    for i in (-1, 0, 1):                                                                  # доски стен
        f += _xform(box((i*0.14*s, 0.30*s, -0.425*s), (0.02*s, 0.54*s, 0.02*s), (120, 76, 44)), T_)
        f += _xform(box((i*0.14*s, 0.30*s, 0.425*s), (0.02*s, 0.54*s, 0.02*s), (120, 76, 44)), T_)
    f += _xform(box((-0.425*s, 0.30*s, 0), (0.02*s, 0.54*s, 0.5*s), (120, 76, 44)), T_)
    f += _xform(box((0.425*s, 0.30*s, 0), (0.02*s, 0.54*s, 0.5*s), (120, 76, 44)), T_)
    f += _xform([([(-0.21*s, 0.04*s, -0.44*s), (0.21*s, 0.04*s, -0.44*s), (0.21*s, 0.48*s, -0.44*s), (-0.21*s, 0.48*s, -0.44*s)], (176, 128, 84), False)], T_)  # наличник
    f += _xform([([(-0.13*s, 0.08*s, -0.445*s), (0.13*s, 0.08*s, -0.445*s), (0.13*s, 0.44*s, -0.445*s), (-0.13*s, 0.44*s, -0.445*s)], (26, 22, 20), False)], T_)   # проём
    f += _xform([([(0.30*s, 0.34*s, -0.43*s), (0.40*s, 0.34*s, -0.43*s), (0.40*s, 0.44*s, -0.43*s), (0.30*s, 0.44*s, -0.43*s)], (250, 200, 120), True)], T_)      # окошко-сердечко
    if snow_roof > 0.02:
        sn = snow_roof
        ex, ey = (0.02 + 0.48*sn)*s, (0.99 - 0.37*sn)*s
        f += _xform([([(-0.02*s, 0.99*s, -0.50*s), (-0.02*s, 0.99*s, 0.50*s), (-ex, ey, 0.50*s), (-ex, ey, -0.50*s)], (242, 246, 252), False)], T_)
        f += _xform([([(0.02*s, 0.99*s, -0.50*s), (0.02*s, 0.99*s, 0.50*s), (ex, ey, 0.50*s), (ex, ey, -0.50*s)], (236, 240, 248), False)], T_)
        f += _xform(box((0, 0.995*s, 0), (0.055*s, 0.03*s, 1.02*s), (246, 249, 254)), T_)  # снежная шапка конька
    gcol = tuple(int(200 + 50*glow) if i == 0 else int(150 + 45*glow) if i == 1 else int(80 + 30*glow) for i in range(3))
    f += _xform([([(-0.17*s, 0.06*s, -0.435*s), (0.17*s, 0.06*s, -0.435*s), (0.17*s, 0.46*s, -0.435*s), (-0.17*s, 0.46*s, -0.435*s)], gcol, True)], T_)
    return f

def render_frame(k, t, ovl_imgs, ot=None):
    S = B.scenes[k] if k < len(B.scenes) else {}
    faces, grid, shadow, lines = [], True, None, []
    rain = False
    snow = False
    if k == 0:
        sky = sky_img("dawn", (72, 76, 84), (152, 154, 157))
        wz = 4.6 - 2.4*smooth(0, 7, t)
        walking = t < 7
        P = dict(x=0, z=wz, yaw=math.pi, walk=t*1.8 if walking else None,
                 head_yaw=0.0 if walking else 0.35*math.sin(t*0.8),
                 head_pitch=0.0, tail_t=t, blink=blink(t))
        shadow = (0, wz)
        faces += box((3.6, 1.2, 6), (2.2, 2.4, 3), GREY) + box((-3.8, 1.5, 8), (2.6, 3.0, 3), GREY_D)
        faces += box((-3.4, 1.0, 4), (2.0, 2.0, 2.4), GREY) + box((3.9, 0.9, 2.5), (1.6, 1.8, 2), GREY_D)
        faces += box((2.6, 0.35, 3.4), (0.6, 0.7, 0.5), GREY_D)
        faces += box((2.9, 1.4, 5.0), (0.08, 2.8, 0.08), GREY) + box((2.9, 2.85, 5.0), (0.5, 0.14, 0.3), (230, 225, 190))
        cf, cl = cat_faces(P); faces += cf; lines += cl
        cam = make_cam((0.15*math.sin(t*0.3), 0.75, -0.4), (0, 0.45, wz-0.2))
    elif k == 1:
        sky = sky_img("dawn", (72, 76, 84), (152, 154, 157))
        P = dict(x=0, z=0, yaw=0.6, walk=None, head_yaw=0.5*math.sin(t*0.9),
                 head_pitch=0.12*math.sin(t*1.3), tail_t=t, blink=blink(t),
                 ear_tw=0.5 if 3.0 < t < 3.4 else 0.0)
        shadow = (0, 0)
        faces += box((3.6, 1.2, 6), (2.2, 2.4, 3), GREY) + box((-3.8, 1.5, 8), (2.6, 3.0, 3), GREY_D)
        faces += box((-3.4, 1.0, 4), (2.0, 2.0, 2.4), GREY)
        cf, cl = cat_faces(P); faces += cf; lines += cl
        hx = 0.9*math.sin(0.5+0.12*math.sin(t*0.5)); hz = 1.05*math.cos(0.5+0.12*math.sin(t*0.5))
        cam = make_cam((hx, 0.62, hz), (0, 0.50, 0.24))
    elif k == 2:
        sky = sky_img("day", (96, 99, 105), (168, 170, 172))
        rear = smooth(6, 8, t) - smooth(15, 16.5, t)
        dip = smooth(8, 10, t) - smooth(12, 13, t)
        up = smooth(12.5, 14, t) - smooth(16.5, 18, t)
        sit = smooth(15.5, 17, t)
        wx = -2.6 + 2.65*smooth(0, 6, t)
        walking = t < 6
        chew = 0.10*math.sin(t*11) if 15 < t < 17.5 else 0.0
        P = dict(x=wx, z=0.0, yaw=math.pi/2, walk=t*1.8 if walking else None,
                 rear=rear*(1-sit), sit=sit, pitch=-0.30*rear*(1-sit),
                 lift=0.05*rear + 0.25*up*(1-sit),
                 head_pitch=0.9*dip - 0.35*up + 0.15*rear + chew,
                 head_yaw=0.4*sit*math.sin(t*0.9),
                 tail_t=t, blink=blink(t), paper=12.5 < t < 16.5)
        shadow = (wx, 0.0)
        faces += box((0.6, 0.35, 0), (0.55, 0.7, 0.45), GREY_D)
        faces += box((-3.5, 1.4, 3), (2.4, 2.8, 3), GREY) + box((3.8, 1.2, 5), (2.2, 2.4, 3), GREY_D)
        faces += [ ( [ (p[0], p[1], p[2]+3.5) for p in q ], c, e) for q, c, e in box((-3.0, 0.35, 0), (0.6, 0.7, 0.5), GREY_D) ]
        cf, cl = cat_faces(P); faces += cf; lines += cl
        cam = make_cam((2.3, 0.95, 3.2-0.5*smooth(0, 18, t)), (0.2, 0.5, 0.4))
    elif k == 3:
        sky = sky_img("dusk", (92, 72, 84), (205, 145, 95))
        jump = smooth(4.5, 5.6, t)
        inb = t > 5.6
        arc = 0.55*math.sin(clamp01((t-4.5)/1.1)*math.pi) if 4.5 < t < 5.6 else 0.0
        wx = -2.8 + 2.8*smooth(0, 5.6, t)
        walking = t < 4.5
        P = dict(x=wx, z=0, yaw=math.pi/2 if not inb else math.pi*0.93,
                 walk=t*1.8 if walking else None, lift=arc - 0.02*jump,
                 crouch=inb, head_yaw=0.55*math.sin(t*0.7) if inb else 0.0,
                 head_pitch=0.1*math.sin(t*1.1), tail_t=t*1.6, blink=blink(t))
        shadow = (wx, 0)
        bs = box((0, 0.17, 0), (0.62, 0.34, 0.5), BROWN)
        faces += [bs[i] for i in (0, 1, 4, 5)]
        faces += box((0, 0.02, 0), (0.6, 0.04, 0.48), BROWN)
        faces += box((-3.6, 1.3, 4), (2.4, 2.6, 3), GREY_D) + box((3.7, 1.4, 6), (2.2, 2.8, 3), GREY)
        faces += box((3.0, 1.5, 2.0), (0.08, 3.0, 0.08), GREY) + box((3.0, 3.05, 2.0), (0.5, 0.14, 0.3), (240, 220, 170))
        cf, cl = cat_faces(P); faces += cf; lines += cl
        cam = make_cam((0.0, 0.9, -2.4+0.3*smooth(0, 14, t)), (0, 0.35, 0))
    elif k == 4:
        sky = sky_img("night", (22, 26, 40), (64, 70, 92))
        P = dict(x=0, z=-0.5, yaw=0.0, walk=None, sit=1.0, head_pitch=0.22+0.05*math.sin(t*0.7),
                 head_yaw=0.12*math.sin(t*0.5), tail_t=t*0.8, blink=blink(t))
        shadow = (0, -0.5)
        grid = True
        faces += box((0.4, 1.6, 7.05), (3.4, 3.2, 0.3), GREY_D)
        faces += quad((-0.15,1.15,6.88),(0.95,1.15,6.88),(0.95,2.05,6.88),(-0.15,2.05,6.88), (250, 210, 120), True)
        sw = 0.06*math.sin(t*0.8)
        faces += box((0.4+sw, 1.42, 6.82), (0.3, 0.5, 0.08), (60, 55, 50))
        faces += box((0.4+sw, 1.78, 6.82), (0.16, 0.16, 0.08), (70, 62, 55))
        faces += box((0.62+sw, 1.55, 6.80), (0.1, 0.05, 0.05), PINK)
        faces += box((-3.2, 1.5, 5), (2.4, 3.0, 3), (52, 55, 66)) + box((3.6, 1.2, 4), (2.2, 2.4, 3), (46, 49, 60))
        faces += box((2.6, 1.5, 2.2), (0.08, 3.0, 0.08), (60, 62, 70)) + box((2.6, 3.05, 2.2), (0.5, 0.14, 0.3), (250, 235, 180))
        cf, cl = cat_faces(P); faces += cf; lines += cl
        if MODE == "shorts":
            cam = make_cam((0.0, 0.62, -1.9), (0.4, 1.05, 6.0))
        else:
            cam = make_cam((-1.05, 0.55, -2.1), (0.25, 1.05, 6.0))
    elif k == 5:
        sky = sky_img("studio", (118, 118, 121), (162, 162, 164))
        seq = [(1.5, -0.55), (5.5, 0.0), (9.5, 0.55)]
        hy = 0.0
        for t0, ang in seq:
            if t > t0: hy = ang
        P = dict(x=0, z=0, yaw=math.pi, walk=None, sit=1.0, head_yaw=hy*0.9,
                 head_pitch=0.30, tail_t=t*0.9, blink=blink(t))
        shadow = (0, 0)
        objs = [(-1.3, 1.5, "bowl"), (0.0, 5.5, "house"), (1.3, 9.5, "cat")]
        for ox0, t0, kind in objs:
            ox = ox0 * (0.72 if MODE == "shorts" else 1.0)
            s = 0.85*eob(clamp01((t-t0)/0.6)) if t > t0 else 0.0
            if s <= 0.01: continue
            oz = -0.8
            if kind == "bowl":
                fs = box((ox, 0.09, oz), (0.30, 0.14, 0.30), RED) + box((ox, 0.17, oz), (0.22, 0.06, 0.22), KIB)
            elif kind == "house":
                fs = box((ox, 0.13, oz), (0.42, 0.26, 0.4), BROWN)
                fs += quad((ox-0.26,0.26,oz-0.24),(ox+0.26,0.26,oz-0.24),(ox+0.26,0.44,oz),(ox-0.26,0.44,oz), BROWN)
                fs += quad((ox-0.26,0.26,oz+0.24),(ox+0.26,0.26,oz+0.24),(ox+0.26,0.44,oz),(ox-0.26,0.44,oz), BROWN)
            else:
                fs, lsr = cat_faces(dict(x=ox, z=oz, yaw=-0.5+math.pi, walk=None, head_yaw=0.3*math.sin(t),
                                         head_pitch=0, tail_t=t*1.3, blink=blink(t+1), grey=True))
                lines += [(tuple(scale_pts([q], (ox, 0, oz), s))[0], tuple(scale_pts([q2], (ox, 0, oz), s))[0]) for q, q2 in lsr]
            faces += [tuple([scale_pts(it[0], (ox, 0, oz), s)] + list(it[1:])) for it in fs]
        cf, cl = cat_faces(P); faces += cf; lines += cl
        cam = make_cam((0, 1.15, -3.6), (0, 0.30, 0.1))
    elif k == 6:
        sky = sky_img("studio", (118, 118, 121), (162, 162, 164))
        P = dict(x=0, z=0, yaw=0.0, walk=None, tp=1.0, detach=1.0, tail_t=t,
                 blink=blink(t), head_yaw=0.0, head_pitch=0.0)
        shadow = (0, 0)
        cf, cl = cat_faces(P); faces += cf; lines += cl
        a = 0.3 + (t/B.scenes[6]["D"])*math.pi*1.7
        cam = make_cam((2.3*math.sin(a), 0.68, 2.3*math.cos(a)), (0, 0.45, 0))
    elif k == 7:
        # ПРОЛОГ · утро: потягушки на люке и голубь-сосед
        sky = sky_img("dawn2", (78, 82, 94), (162, 162, 164))
        lying = 1.0 - smooth(1.3, 2.1, t)
        stretch = smooth(1.9, 2.7, t) * (1.0 - smooth(3.5, 4.2, t))
        sit = smooth(3.9, 4.9, t)
        px = 1.55 - 0.72*smooth(3.2, 8.0, t)
        pz = 0.95
        peck = (0.5 + 0.5*math.sin(t*6.2)) * (1.0 if 5.2 < t < 10.4 else 0.0)
        flyoff = smooth(10.8, 11.8, t)
        track = clamp01((px - 0.10)/1.5)
        P = dict(x=0, z=0, yaw=math.pi, walk=None, crouch=lying, stretch=stretch*(1-sit), sit=sit,
                 pitch=0.20*stretch*(1-sit),
                 head_yaw=(0.50*track*sit + 0.25*math.sin(t*0.7)*(1-sit)),
                 head_pitch=(-0.28*stretch + 0.30*lying + 0.08*sit*math.sin(t*1.3)),
                 tail_t=t*(0.45 + 0.85*sit), blink=blink(t),
                 ear_tw=0.45 if (5.4 < t < 5.8 or 8.3 < t < 8.7) else 0.0)
        shadow = (0, 0)
        faces += box((0, 0.006, 0), (1.20, 0.020, 1.20), GREY_D)
        faces += box((0, 0.014, 0), (0.88, 0.014, 0.88), (126, 126, 130))
        faces += box((-3.6, 1.3, 4.2), (2.4, 2.6, 3), GREY) + box((3.7, 1.4, 6.2), (2.2, 2.8, 3), GREY_D)
        faces += box((2.85, 1.5, 2.2), (0.08, 3.0, 0.08), GREY) + box((2.85, 3.05, 2.2), (0.5, 0.14, 0.3), (240, 222, 172))
        cf, cl = cat_faces(P); faces += cf; lines += cl
        faces += pigeon_faces(px + 1.1*flyoff, pz - 0.6*flyoff, math.pi*0.82, t, fly=flyoff, peck=peck)
        if MODE == "shorts":
            cam = make_cam((0.10*math.sin(t*0.25), 0.80, -2.10), (0.05, 0.50, 0.40))
        else:
            cam = make_cam((1.45 - 0.95*smooth(0, 12, t), 0.72, -2.40), (0.25, 0.44, 0.32))
    elif k == 8:
        # ПРОЛОГ · охота на голубей: три секунды славы
        sky = sky_img("day2", (100, 103, 110), (174, 176, 178))
        stalk = smooth(0.8, 4.6, t)
        wig = 0.11*math.sin(t*7.5)*smooth(3.2, 4.2, t)*(1 - smooth(4.6, 5.0, t))
        pounce = smooth(4.6, 5.2, t)
        arc = 0.66*math.sin(clamp01((t-4.6)/1.0)*math.pi) if 4.6 < t < 5.6 else 0.0
        sitb = smooth(6.6, 7.6, t)
        lick = 1.0 if 8.2 < t < 12.0 else 0.0
        SX = 0.55 if MODE == "shorts" else 1.0
        cx = (-1.75 + 1.35*stalk + 0.80*pounce)*SX
        flyoff = smooth(4.8, 6.0, t)
        P = dict(x=cx, z=0, yaw=math.pi/2 + wig, walk=(t*1.05 if t < 4.6 else None),
                 crouch=(1.0 if 3.2 < t < 5.6 else 0.0), lift=arc - 0.02*pounce, sit=sitb,
                 head_pitch=(0.42*lick + 0.10*math.sin(t*1.5)*(1-lick)),
                 head_yaw=(-0.60*lick + 0.30*math.sin(t*0.85)*(1-sitb)*(1-lick)),
                 tail_t=t*(1.6 if t < 5.6 else 0.75), blink=blink(t),
                 ear_tw=0.5 if 1.8 < t < 2.2 else 0.0)
        shadow = (cx, 0)
        faces += box((1.6, 0.006, -0.9), (1.1, 0.02, 1.1), GREY_D)
        faces += box((-3.5, 1.4, 3.2), (2.4, 2.8, 3), GREY) + box((3.8, 1.2, 5.2), (2.2, 2.4, 3), GREY_D)
        faces += box((-2.9, 1.5, 1.6), (0.08, 3.0, 0.08), GREY) + box((-2.9, 3.05, 1.6), (0.5, 0.14, 0.3), (240, 222, 172))
        cf, cl = cat_faces(P); faces += cf; lines += cl
        for i, (bx, bz) in enumerate(((0.95, 0.45), (1.55, -0.30), (1.25, 1.05))):
            bx, bz = bx*SX, bz*SX
            fx = bx + (2.4 + 0.8*i)*flyoff
            faces += pigeon_faces(fx, bz - 0.6*flyoff, math.pi*0.55, t + i*0.8,
                                  fly=flyoff*(1.0 + 0.30*i),
                                  peck=(0.5+0.5*math.sin(t*5.0+i))*(1-flyoff), scale=0.95)
        if MODE == "shorts":
            tx = (cx + 0.70)/2
            cam = make_cam((tx + 0.10, 0.82, -2.40), (tx, 0.38, 0.10))
        else:
            cam = make_cam((-0.9 + 1.5*smooth(0, 14, t), 0.78, -2.80), (0.10 + 0.55*smooth(0, 9, t), 0.42, 0.15))
    elif k == 11:
        # ПРОЛОГ · автор сжалился: нормальные текстуры
        sky = sky_img("studio2", (128, 128, 132), (178, 178, 182))
        hand_in = smooth(1.6, 2.8, t)
        spraying = 1.0 if 3.0 < t < 4.5 else 0.0
        hand_out = smooth(4.6, 5.8, t)
        cloud = smooth(3.0, 3.7, t) * (1.0 - smooth(4.5, 5.3, t))
        painted = t > 4.4
        turn = smooth(5.4, 9.6, t)
        tada = math.sin(clamp01((t-9.8)/1.0)*math.pi) if 9.8 < t < 10.8 else 0.0
        P = dict(x=0, z=0, yaw=math.pi + 2*math.pi*turn, walk=None, sit=1.0,
                 head_pitch=0.10 + 0.05*math.sin(t*1.2), head_yaw=0.14*math.sin(t*0.75),
                 tail_t=t*(0.9 + (1.6 if painted else 0.0)), blink=blink(t), painted=painted,
                 lift=0.07*tada, pitch=-0.10*tada)
        shadow = (0, 0)
        if MODE == "shorts":
            hx = 1.15 - 0.35*hand_in + 0.55*hand_out; hy = 1.38; hs, ha = 0.85, 0.55
        else:
            hx = 1.95 - 0.60*hand_in + 0.85*hand_out; hy = 1.06; hs, ha = 1.0, 0.30
        hz = 0.30
        faces += hand_faces(hx, hy, hz, hs, ang=ha, side=1, can=True)
        nz = (hx - 0.10*hs, hy - 0.12*hs, hz)
        d = sub((0, 0.42, 0.05), nz)
        dl = math.sqrt(dot(d, d)) or 1.0
        d = (d[0]/dl, d[1]/dl, d[2]/dl)
        if spraying:
            faces += spray_puff(nz[0], nz[1], nz[2], d, t, 3.0, n=30, spread=0.26)
        faces += paint_cloud(t, cloud)
        cf, cl = cat_faces(P); faces += cf; lines += cl
        if painted:
            ymax = 1.85 if MODE == "shorts" else 1.02
            for i in range(5):
                u = clamp01((t - 5.0 - i*0.34)/2.9)
                if u <= 0.0 or u >= 1.0: continue
                hxx = -0.62 + 0.31*i + 0.10*math.sin(t*1.6 + i)
                faces += heart_faces(hxx, 0.50 + (ymax-0.5)*u, 0.40 + 0.12*math.cos(t*1.3 + i),
                                     (0.52 - 0.14*u)*(0.85 if MODE == "shorts" else 1.0))
        a = 0.25 + (t/16.0)*math.pi*1.45
        cam = make_cam((2.45*math.sin(a), 0.72, 2.45*math.cos(a)), (0, 0.42, 0))
    elif k == 9:
        # ПРОЛОГ · дождь: переждал под лавкой, будто так и планировал
        rain = t < 11.0
        sky = sky_img("rain", (56, 60, 70), (104, 110, 122)) if rain else sky_img("clear", (96, 100, 108), (158, 160, 164))
        come = smooth(0.4, 3.2, t)
        hide = smooth(3.2, 4.2, t)
        shake = 1.0 if 11.0 < t < 12.2 else 0.0
        out = smooth(12.4, 14.6, t)
        cx = -2.5 + 2.5*come + 1.95*out
        P = dict(x=cx, z=0.05, yaw=math.pi/2, walk=(t*1.9 if (t < 3.2 or t > 12.4) else None),
                 crouch=hide*(1-out), tail_down=(1 if (hide > .5 and out < .5) else 0),
                 head_yaw=(0.55*math.sin(t*26.0)*shake + 0.15*math.sin(t*0.8)*(1-shake)),
                 head_pitch=(0.14*hide + 0.10*math.sin(t*1.6) - 0.12*shake),
                 lift=0.05*math.sin(t*22.0)*shake - 0.05*hide*(1-out),
                 tail_t=t*(0.5 if hide > .5 else 1.3), blink=blink(t))
        shadow = (cx, 0.05)
        faces += bench_faces(0.0, -0.05)
        faces += box((1.40, 0.008, 0.80), (0.90, 0.016, 0.62), WET)
        faces += box((-3.4, 1.4, 3.6), (2.4, 2.8, 3), (74, 78, 88)) + box((3.7, 1.3, 5.4), (2.2, 2.6, 3), (64, 68, 80))
        faces += box((2.7, 1.5, 1.8), (0.08, 3.0, 0.08), (70, 74, 84)) + box((2.7, 3.05, 1.8), (0.5, 0.14, 0.3), (226, 214, 176))
        cf, cl = cat_faces(P); faces += cf; lines += cl
        if MODE == "shorts":
            cam = make_cam((cx*0.35, 0.55, -2.00), (cx*0.55, 0.28, 0.05))
        else:
            cam = make_cam((-1.55 + 1.0*smooth(0, 15, t), 0.52, -2.40), (0.10, 0.30, 0.05))
    elif k == 10:
        # ПРОЛОГ · вечер: человек вынес миску
        sky = sky_img("night2", (20, 24, 38), (58, 64, 88))
        hin = smooth(1.4, 3.0, t)
        hlow = smooth(3.0, 4.3, t)
        hout = smooth(5.4, 7.0, t)
        bx = -0.55 if MODE == "shorts" else -1.05
        bz = 0.55
        hx = (bx - 1.30) + 1.30*hin - 1.45*hout
        hy = 0.62 - 0.39*hlow*(1.0 - 0.55*hout)
        placed = t > 4.35
        go = smooth(7.4, 9.2, t)
        eat = smooth(9.4, 10.0, t) * (1.0 - smooth(13.4, 14.0, t))
        back = smooth(14.0, 15.2, t)
        cx0, cz0 = 0.35, -0.45
        cx1, cz1 = bx + 0.45, bz - 0.20
        cx = cx0 + (cx1 - cx0)*go + (cx0 - cx1)*back
        cz = cz0 + (cz1 - cz0)*go + (cz0 - cz1)*back
        yaw = 0.10*(1-go) + (-0.95 if bx < 0 else 0.95)*go*(1-back) + math.pi*back
        chew = 0.09*math.sin(t*12.0)*eat
        look = smooth(4.6, 5.4, t)*(1 - go)
        P = dict(x=cx, z=cz, yaw=yaw, walk=(t*1.5 if (7.4 < t < 9.2 or t > 14.0) else None),
                 sit=(1.0 - go) if back < 0.5 else back,
                 head_pitch=(0.20*(1-go) + 0.78*eat + chew + 0.10*math.sin(t*0.9)*(1-eat)),
                 head_yaw=(0.30*math.sin(t*0.6)*(1-eat)*(1-look) - 0.70*look*(1-eat) - 0.25*eat),
                 tail_t=t*(0.7 + 1.1*eat + 0.6*back), blink=blink(t),
                 ear_tw=0.4 if 2.0 < t < 2.4 else 0.0)
        shadow = (cx, cz)
        grid = True
        faces += box((0.4, 1.6, 7.05), (3.4, 3.2, 0.3), GREY_D)
        faces += quad((-0.15,1.15,6.88),(0.95,1.15,6.88),(0.95,2.05,6.88),(-0.15,2.05,6.88), (250, 210, 120), True)
        sw = 0.06*math.sin(t*0.8)
        faces += box((0.4+sw, 1.42, 6.82), (0.3, 0.5, 0.08), (60, 55, 50))
        faces += box((-3.2, 1.5, 5), (2.4, 3.0, 3), (52, 55, 66)) + box((3.6, 1.2, 4), (2.2, 2.4, 3), (46, 49, 60))
        faces += box((2.6, 1.5, 2.2), (0.08, 3.0, 0.08), (60, 62, 70)) + box((2.6, 3.05, 2.2), (0.5, 0.14, 0.3), (250, 235, 180))
        if not placed:
            faces += hand_faces(hx, hy, bz, 0.95, ang=0.10, side=1, bowl=True)
        else:
            faces += box((bx, 0.07, bz), (0.32, 0.14, 0.32), RED) + box((bx, 0.145, bz), (0.24, 0.05, 0.24), KIB)
        cf, cl = cat_faces(P); faces += cf; lines += cl
        if MODE == "shorts":
            cam = make_cam((cx*0.30, 0.62, -1.95), (cx*0.45, 0.40, 0.25))
        else:
            cam = make_cam((-1.15, 0.58, -2.30), (0.05, 0.40, 0.30))
    elif k == 12:
        # ЭП2 · итоги голосования: Борис делает вид, что не обрадовался
        sky = sky_img("dawn3", (80, 84, 96), (164, 164, 166))
        joy = math.sin(clamp01((t-6.4)/0.9)*math.pi) if 6.4 < t < 7.3 else 0.0
        away = smooth(7.4, 8.4, t)
        P = dict(x=0, z=0, yaw=math.pi, walk=None, sit=1.0, lift=0.22*joy, pitch=-0.12*joy,
                 head_yaw=0.55*away + 0.10*math.sin(t*0.8)*(1-away),
                 head_pitch=-0.18*joy + 0.06*math.sin(t*1.1),
                 tail_t=t*(1.2 + 1.6*joy), blink=blink(t), painted=True,
                 ear_tw=0.5 if (2.2 < t < 2.6 or 5.1 < t < 5.5) else 0.0)
        shadow = (0, 0)
        faces += box((0, 0.006, 0), (1.2, 0.02, 1.2), GREY_D)
        faces += box((-2.6, 1.5, 2.0), (0.08, 3.0, 0.08), GREY) + box((-2.6, 3.05, 2.0), (0.5, 0.14, 0.3), (240, 222, 172))
        faces += box((3.4, 1.4, 5.0), (2.4, 2.8, 3), GREY) + box((-3.8, 1.2, 6.0), (2.2, 2.4, 3), GREY_D)
        cf, cl = cat_faces(P); faces += cf; lines += cl
        faces += pigeon_faces(1.5, 1.2, math.pi*0.8, t, peck=(0.5+0.5*math.sin(t*5.5))*(1 if t > 3 else 0), scale=0.9)
        if MODE == "shorts":
            cam = make_cam((0.05, 0.74, -2.05), (0.0, 0.50, 0.30))
        else:
            cam = make_cam((1.25 - 0.5*smooth(0, 12, t), 0.66, -2.35), (0.1, 0.46, 0.25))
    elif k == 13:
        # ЭП2 · смотр жилья: коробка (проходили) и машина (сигналят)
        sky = sky_img("day3", (102, 105, 112), (176, 178, 180))
        inbox = smooth(2.4, 3.2, t)
        outbox = smooth(4.6, 5.4, t)
        shake = 1.0 if 3.6 < t < 4.5 else 0.0
        tocar = smooth(5.4, 7.2, t)
        under = smooth(7.4, 8.0, t)
        outcar = smooth(9.6, 10.4, t)
        arc = 0.5*math.sin(clamp01((t-4.6)/0.8)*math.pi) if 4.6 < t < 5.4 else (0.6*math.sin(clamp01((t-9.6)/0.8)*math.pi) if 9.6 < t < 10.4 else 0.0)
        x0 = -3.0 + 1.4*smooth(0, 2.4, t)
        x1 = x0*(1-inbox) + (-1.6)*inbox
        x2 = x1*(1-outbox) + 0.2*outbox
        x3 = x2*(1-tocar) + 1.9*tocar
        cx = x3*(1-outcar) + 1.2*outcar
        P = dict(x=cx, z=0.0, yaw=math.pi/2, walk=(t*1.6 if (t < 2.4 or 5.4 < t < 7.4 or t > 9.6) else None),
                 crouch=inbox*(1-outbox)*0.6 + under*(1-outcar),
                 head_yaw=(0.7*math.sin(t*16.0)*shake),
                 head_pitch=(0.25*inbox*(1-outbox) + 0.15*under*(1-outcar) - 0.20*outcar),
                 tail_t=t*(1.4 if outcar > .5 else 0.8), blink=blink(t), painted=True,
                 lift=arc - 0.06*under*(1-outcar) - 0.05*under*(1-outcar),
                 ear_tw=0.6 if 9.8 < t < 10.2 else 0.0)
        shadow = (cx, 0)
        bs = box((-1.6, 0.17, 0), (0.62, 0.34, 0.5), BROWN)
        faces += [bs[i] for i in (0, 1, 4, 5)] + box((-1.6, 0.02, 0), (0.6, 0.04, 0.48), BROWN)
        faces += car_faces(1.9, 0.0, 0.0, 1.0, shake=0.010 if 8.0 < t < 9.6 else 0.0)
        faces += box((-3.6, 1.4, 3.4), (2.4, 2.8, 3), GREY) + box((3.9, 1.2, 5.4), (2.2, 2.4, 3), GREY_D)
        cf, cl = cat_faces(P); faces += cf; lines += cl
        if MODE == "shorts":
            cam = make_cam((cx*0.45 + 0.15, 0.74, -2.35), (cx*0.6, 0.36, 0.2))
        else:
            cam = make_cam((-1.2 + 2.2*smooth(0, 12, t), 0.72, -2.75), (cx*0.5, 0.40, 0.2))
    elif k == 14:
        # ЭП2 · дом у двери: осмотр и новоселье
        sky = sky_img("dusk3", (94, 74, 86), (206, 146, 96))
        walk1 = smooth(0.0, 4.0, t)
        sniff = smooth(4.0, 4.8, t)*(1 - smooth(6.4, 7.0, t))
        circle = smooth(6.6, 8.6, t)
        enter = smooth(8.6, 10.6, t)
        peek = smooth(10.6, 11.4, t)
        cx = -2.6 + 2.9*walk1 - 0.5*circle
        cz = 0.2 + 1.0*circle
        cx = cx*(1-enter) + 0.6*enter
        cz = cz*(1-enter) + 2.0*enter
        yaw = math.pi/2*(1-circle) + 0.68*circle*(1-enter) + 0.20*enter*(1-peek) + math.pi*peek
        P = dict(x=cx, z=cz, yaw=yaw, walk=(t*1.5 if (t < 4.0 or 8.6 < t < 10.6) else None),
                 crouch=peek, head_pitch=(0.32*sniff + 0.08*math.sin(t*1.2)*(1-sniff)),
                 head_yaw=(0.5*math.sin(t*1.5)*sniff + 0.2*math.sin(t*0.7)*(1-peek)),
                 tail_t=t*(1.3 + 0.8*peek), blink=blink(t), painted=True,
                 ear_tw=0.4 if 5.0 < t < 5.4 else 0.0)
        shadow = None if peek > .5 else (cx, cz)
        faces += box((0, 1.5, 3.35), (6.4, 3.0, 0.3), (128, 112, 100))
        faces += box((-1.3, 1.0, 3.16), (0.95, 2.0, 0.1), (92, 70, 54))
        faces += box((-1.3, 0.06, 2.95), (1.1, 0.12, 0.5), (110, 96, 84))
        faces += cat_house(0.6, 2.2, 0.0, 1.0, glow=0.5 + 0.5*smooth(9.5, 11.0, t))
        faces += box((-3.4, 1.3, 1.0), (2.2, 2.6, 2.6), (112, 98, 88))
        cf, cl = cat_faces(P); faces += cf; lines += cl
        if MODE == "shorts":
            cam = make_cam((0.35, 0.60, -1.35), (0.5, 0.42, 1.9))
        else:
            cam = make_cam((-0.85, 0.62, -1.55), (0.45, 0.40, 1.95))
    elif k == 15:
        # ЭП2 · внутри тепло: плед, батарея, снег за окном
        sky = sky_img("room", (96, 84, 76), (128, 112, 100))
        grid = False
        knead = t if 2.0 < t < 6.5 else None
        lie = smooth(6.5, 8.0, t)
        bl = 0.4 if (t % 4.3) < 0.5 else 1.0
        P = dict(x=0.2, z=2.6, yaw=math.pi*0.85, walk=None, sit=1.0 - 0.7*lie, crouch=0.5*lie,
                 knead=knead, pitch=0.10*lie,
                 head_pitch=0.30*(1 if knead else 0)*math.sin(t*6.0)*0.3 + 0.12*lie,
                 head_yaw=0.15*math.sin(t*0.6),
                 tail_t=t*0.5, blink=bl, painted=True, lift=0.10 - 0.05*lie,
                 ear_tw=0.35 if 9.2 < t < 9.6 else 0.0)
        shadow = (0.2, 2.6)
        faces += quad((-3.2, 0, 4.2), (3.2, 0, 4.2), (3.2, 3.2, 4.2), (-3.2, 3.2, 4.2), (134, 118, 104))
        faces += quad((-3.2, 0, 0.4), (-3.2, 3.2, 0.4), (-3.2, 3.2, 4.2), (-3.2, 0, 4.2), (120, 104, 92))
        faces += quad((-3.2, 0.0, 0.4), (3.2, 0.0, 0.4), (3.2, 0.0, 4.2), (-3.2, 0.0, 4.2), (106, 94, 86))
        faces += quad((-0.75, 1.15, 4.15), (0.75, 1.15, 4.15), (0.75, 2.25, 4.15), (-0.75, 2.25, 4.15), (206, 217, 233), True)
        faces += box((0, 1.7, 4.10), (1.66, 0.10, 0.08), (230, 226, 218)) + box((0, 1.15, 4.10), (1.66, 0.10, 0.08), (230, 226, 218))
        faces += box((0, 1.70, 4.10), (0.08, 1.2, 0.08), (230, 226, 218))
        for sgn in (-1, 1):
            swy = 0.05*math.sin(t*1.4 + sgn)
            faces += [([ (sgn*0.72, 1.18, 4.12), (sgn*0.72, 2.22, 4.12), (sgn*0.72 - 0.16 + swy, 2.22, 4.12), (sgn*0.72 - 0.20 + swy, 1.18, 4.12) ], (176, 96, 92), False)]
        for i in range(9):
            fx = -0.66 + i*0.165
            fy = 2.2 - ((t*0.35 + i*0.23) % 1.0)
            faces += [([ (fx-0.015, fy, 4.14), (fx+0.015, fy, 4.14), (fx+0.015, fy+0.03, 4.14), (fx-0.015, fy+0.03, 4.14) ], (250, 252, 255), True)]
        faces += box((0, 0.38, 3.80), (1.35, 0.72, 0.14), (216, 216, 210))
        for i in range(5):
            faces += box((-0.52 + i*0.26, 0.38, 3.70), (0.07, 0.66, 0.06), (204, 204, 198))
        faces += box((0.2, 0.05, 2.6), (1.15, 0.10, 0.85), (152, 72, 70))
        faces += box((0.52, 0.11, 2.38), (0.45, 0.05, 0.35), (168, 86, 82))
        faces += box((-1.7, 0.8, 3.5), (0.05, 1.6, 0.05), (70, 66, 62))
        faces += [(q, (250, 220, 160), True) for q, c, e in box((-1.7, 1.72, 3.5), (0.36, 0.30, 0.36), (250, 220, 160))]
        cf, cl = cat_faces(P); faces += cf; lines += cl
        if MODE == "shorts":
            cam = make_cam((0.55, 0.52, 0.85), (0.2, 0.36, 2.6))
        else:
            cam = make_cam((1.05, 0.50, 0.75), (0.2, 0.34, 2.6))
    elif k == 16:
        # ЭП2 · финал: из домика торчит довольный хвост
        sky = sky_img("night3", (18, 22, 36), (54, 60, 84))
        snow = True
        glow = 0.75 + 0.25*math.sin(t*1.3)
        wag = t*2.2
        P = dict(x=0.6, z=2.12, yaw=0.0, walk=None, crouch=1.0, tail_t=wag, painted=True,
                 blink=blink(t), head_yaw=0.0, head_pitch=0.0)
        shadow = None
        faces += box((0, 1.5, 3.35), (6.4, 3.0, 0.3), (74, 66, 62))
        faces += box((-1.3, 1.0, 3.16), (0.95, 2.0, 0.1), (58, 46, 38))
        faces += box((-1.3, 0.06, 2.95), (1.1, 0.12, 0.5), (66, 58, 52))
        faces += cat_house(0.6, 2.2, 0.0, 1.0, glow=glow, night=True, snow_roof=smooth(0, 9, t))
        faces += pigeon_faces(0.6 + 0.30*math.sin(t*0.22), 2.35, math.pi*0.9 + 0.3*math.sin(t*0.3),
                              t, fly=0.0, peck=(0.5+0.5*math.sin(t*4.0))*(1 if 4.0 < t < 7.0 else 0), scale=0.8, y=0.98)
        faces += pigeon_faces(-0.05, 2.35, math.pi*0.6, t+1.3, fly=smooth(8.0, 9.0, t), peck=0.0, scale=0.75)
        faces += box((-3.4, 1.3, 1.0), (2.2, 2.6, 2.6), (60, 54, 50))
        faces += box((2.9, 1.5, 1.4), (0.08, 3.0, 0.08), (64, 62, 66)) + box((2.9, 3.05, 1.4), (0.5, 0.14, 0.3), (250, 232, 178), )
        cf, cl = cat_faces(P); faces += cf; lines += cl
        if MODE == "shorts":
            cam = make_cam((0.5, 0.52, -1.55), (0.6, 0.40, 2.0))
        else:
            cam = make_cam((0.15 + 0.25*smooth(0, 12, t), 0.55, -1.85), (0.6, 0.42, 2.0))
    elif k == 17:
        # ЭП3 · утро: Борис сделал вид, что не рад; умывается дважды
        sky = sky_img("dawn4", (72, 76, 84), (152, 154, 157))
        groom = 1.0 if 3.0 < t < 6.5 else 0.0
        P = dict(x=0.6, z=1.55, yaw=0.10, walk=None, sit=1.0,
                 head_pitch=0.34*groom*abs(math.sin(t*3.2)) + 0.06*math.sin(t*1.1)*(1-groom),
                 head_yaw=0.25*math.sin(t*0.7), tail_t=t*1.4, blink=blink(t), painted=True,
                 ear_tw=0.4 if 7.5 < t < 7.9 else 0.0)
        shadow = (0.6, 1.55)
        faces += box((0, 1.5, 3.35), (6.4, 3.0, 0.3), (128, 112, 100))
        faces += box((-1.3, 1.0, 3.16), (0.95, 2.0, 0.1), (92, 70, 54))
        faces += box((-1.3, 0.06, 2.95), (1.1, 0.12, 0.5), (110, 96, 84))
        faces += cat_house(0.6, 2.2, 0.0, 1.0, glow=0.35)
        faces += pigeon_faces(-1.7, 2.5, 0.6, t, fly=0.0, peck=0.4 + 0.4*math.sin(t*3.0), scale=0.8)
        faces += box((-3.4, 1.3, 1.0), (2.2, 2.6, 2.6), (112, 98, 88))
        cf, cl = cat_faces(P); faces += cf; lines += cl
        if MODE == "shorts":
            cam = make_cam((0.6, 0.60, -1.25), (0.6, 0.42, 1.8))
        else:
            cam = make_cam((0.1, 0.62, -1.5), (0.6, 0.44, 1.8))
    elif k == 18:
        # ЭП3 · переговоры с голубями: крошки как аргумент
        sky = sky_img("dawn4", (72, 76, 84), (152, 154, 157))
        P = dict(x=0.55, z=1.35, yaw=0.0, walk=None, crouch=0.4*smooth(1.0, 2.0, t),
                 head_pitch=0.10 + 0.10*math.sin(t*1.4), head_yaw=0.35*math.sin(t*0.9),
                 tail_t=t*2.0, blink=blink(t), painted=True,
                 ear_tw=0.4 if 4.4 < t < 4.8 else 0.0)
        shadow = (0.55, 1.35)
        for i, px in enumerate((-0.35, 0.05, 0.45)):
            faces += pigeon_faces(px, 2.15 + 0.12*(i % 2), math.pi + 0.3*math.sin(t*0.5 + i),
                                  t + i*0.7, fly=1.0 if (i == 2 and t > 7.5) else 0.0,
                                  peck=0.5 + 0.5*math.sin(t*3.4 + i*2.0), scale=0.85)
        cr = smooth(6.0, 6.8, t)
        if 6.0 < t < 9.0:
            faces += box((0.05, 0.9*(1 - cr) + 0.03, 2.0), (0.03, 0.03, 0.03), (214, 186, 140))
        faces += box((-3.4, 1.3, 1.0), (2.2, 2.6, 2.6), (112, 98, 88))
        faces += box((3.2, 1.4, 2.0), (1.8, 2.8, 2.2), (120, 106, 96))
        cf, cl = cat_faces(P); faces += cf; lines += cl
        if MODE == "shorts":
            cam = make_cam((0.5, 0.62, -0.85), (0.1, 0.34, 2.0))
        else:
            cam = make_cam((1.7, 0.72, -0.7), (0.1, 0.34, 2.0))
    elif k == 19:
        # ЭП3 · друг приходит: чёрный кот, бодание головами
        sky = sky_img("day4", (88, 102, 120), (170, 178, 188))
        ap = smooth(0, 5, t)
        fx, fz = 1.7 - 0.55*ap, 6.4 - 4.95*ap
        bump = smooth(9.5, 10.0, t)*(1 - smooth(10.6, 11.3, t))
        F = dict(x=fx - 0.10*bump, z=fz, yaw=math.pi + 1.45*smooth(5, 6.5, t), walk=(t*1.6 if t < 5.2 else None),
                 sit=smooth(6.0, 6.8, t), head_yaw=0.0,
                 head_pitch=0.15*bump, tail_t=t*1.2, blink=blink(t + 0.7), black=True,
                 lift=0.02*bump)
        bx = 0.55 + 0.05*smooth(6.5, 8.5, t)
        bz = 1.35 + 0.10*smooth(6.5, 8.5, t)
        P = dict(x=bx + 0.10*bump, z=bz, yaw=1.35*smooth(6.5, 8.5, t), walk=(t*1.5 if 6.5 < t < 8.5 else None),
                 sit=1.0 - 0.5*smooth(6.5, 8.5, t), head_yaw=0.0,
                 head_pitch=0.15*bump + 0.15*smooth(7.0, 8.0, t)*(1 - bump),
                 tail_t=t*1.5, blink=blink(t), painted=True, lift=0.02*bump,
                 ear_tw=0.4 if 9.6 < t < 10.0 else 0.0)
        shadow = (bx, bz)
        faces += box((0, 1.5, 3.35), (6.4, 3.0, 0.3), (132, 116, 104))
        faces += box((-1.3, 1.0, 3.16), (0.95, 2.0, 0.1), (92, 70, 54))
        faces += box((-1.3, 0.06, 2.95), (1.1, 0.12, 0.5), (110, 96, 84))
        faces += cat_house(0.6, 2.2, 0.0, 1.0, glow=0.3)
        faces += box((-3.4, 1.3, 1.0), (2.2, 2.6, 2.6), (112, 98, 88))
        faces += box((3.4, 1.4, 2.4), (1.6, 2.8, 2.0), (120, 106, 96))
        cf, cl = cat_faces(F); faces += cf; lines += cl
        cf, cl = cat_faces(P); faces += cf; lines += cl
        if MODE == "shorts":
            cam = make_cam((0.85, 0.60, -1.35), (0.85, 0.42, 1.5))
        else:
            cam = make_cam((2.2, 0.72, -1.15), (0.85, 0.40, 1.5))
    elif k == 20:
        # ЭП3 · двое на пледе: дуэт вымешивания
        sky = sky_img("room", (96, 84, 76), (128, 112, 100))
        grid = False
        kn1 = t if 2.0 < t < 6.5 else None
        kn2 = t + 1.1 if 3.0 < t < 7.5 else None
        lie = smooth(7.5, 9.0, t)
        bl = 0.4 if (t % 4.3) < 0.5 else 1.0
        P = dict(x=0.0, z=2.55, yaw=math.pi*0.80, walk=None, sit=1.0 - 0.6*lie, crouch=0.5*lie,
                 knead=kn1, pitch=0.10*lie,
                 head_pitch=0.10*(1 if kn1 else 0)*math.sin(t*6.0) + 0.12*lie,
                 head_yaw=0.15*math.sin(t*0.6), tail_t=t*0.5, blink=bl, painted=True,
                 lift=0.10 - 0.05*lie, ear_tw=0.35 if 9.2 < t < 9.6 else 0.0)
        F = dict(x=0.62, z=2.72, yaw=math.pi*1.15, walk=None, sit=1.0 - 0.6*lie, crouch=0.5*lie,
                 knead=kn2, pitch=0.10*lie,
                 head_pitch=0.10*(1 if kn2 else 0)*math.sin(t*6.0 + 1.1) + 0.12*lie,
                 head_yaw=0.15*math.sin(t*0.5 + 2.0), tail_t=t*0.5 + 1.3, blink=bl, black=True,
                 lift=0.10 - 0.05*lie)
        shadow = (0.3, 2.6)
        faces += quad((-3.2, 0, 4.2), (3.2, 0, 4.2), (3.2, 3.2, 4.2), (-3.2, 3.2, 4.2), (134, 118, 104))
        faces += quad((-3.2, 0, 0.4), (-3.2, 3.2, 0.4), (-3.2, 3.2, 4.2), (-3.2, 0, 4.2), (120, 104, 92))
        faces += quad((-3.2, 0.0, 0.4), (3.2, 0.0, 0.4), (3.2, 0.0, 4.2), (-3.2, 0.0, 4.2), (106, 94, 86))
        faces += quad((-0.75, 1.15, 4.15), (0.75, 1.15, 4.15), (0.75, 2.25, 4.15), (-0.75, 2.25, 4.15), (206, 217, 233), True)
        faces += box((0, 1.7, 4.10), (1.66, 0.10, 0.08), (230, 226, 218)) + box((0, 1.15, 4.10), (1.66, 0.10, 0.08), (230, 226, 218))
        faces += box((0, 1.70, 4.10), (0.08, 1.2, 0.08), (230, 226, 218))
        for sgn in (-1, 1):
            swy = 0.05*math.sin(t*1.4 + sgn)
            faces += [([( sgn*0.72, 1.18, 4.12), (sgn*0.72, 2.22, 4.12), (sgn*0.72 - 0.16 + swy, 2.22, 4.12), (sgn*0.72 - 0.20 + swy, 1.18, 4.12)], (176, 96, 92), False)]
        for i in range(9):
            fx2 = -0.66 + i*0.165
            fy2 = 2.2 - ((t*0.35 + i*0.23) % 1.0)
            faces += [([(fx2-0.015, fy2, 4.14), (fx2+0.015, fy2, 4.14), (fx2+0.015, fy2+0.03, 4.14), (fx2-0.015, fy2+0.03, 4.14)], (250, 252, 255), True)]
        faces += box((0, 0.38, 3.80), (1.35, 0.72, 0.14), (216, 216, 210))
        for i in range(5):
            faces += box((-0.52 + i*0.26, 0.38, 3.70), (0.07, 0.66, 0.06), (204, 204, 198))
        faces += box((0.3, 0.05, 2.6), (1.35, 0.10, 0.95), (152, 72, 70))
        faces += box((0.72, 0.11, 2.32), (0.45, 0.05, 0.35), (168, 86, 82))
        faces += box((-1.7, 0.8, 3.5), (0.05, 1.6, 0.05), (70, 66, 62))
        faces += [(q, (250, 220, 160), True) for q, c, e in box((-1.7, 1.72, 3.5), (0.36, 0.30, 0.36), (250, 220, 160))]
        cf, cl = cat_faces(P); faces += cf; lines += cl
        cf, cl = cat_faces(F); faces += cf; lines += cl
        if MODE == "shorts":
            cam = make_cam((0.68, 0.52, 0.8), (0.3, 0.36, 2.6))
        else:
            cam = make_cam((1.25, 0.52, 0.7), (0.3, 0.34, 2.6))
    elif k == 21:
        # ЭП3 · финал: из домика торчит два довольных хвоста
        sky = sky_img("night4", (18, 22, 36), (54, 60, 84))
        snow = True
        glow = 0.75 + 0.25*math.sin(t*1.3)
        P = dict(x=0.52, z=2.12, yaw=0.0, walk=None, crouch=1.0, tail_t=t*2.2, painted=True,
                 blink=blink(t), head_yaw=0.0, head_pitch=0.0)
        F = dict(x=0.70, z=2.16, yaw=0.0, walk=None, crouch=1.0, tail_t=t*2.2 + 1.3, black=True,
                 blink=blink(t + 1.1), head_yaw=0.0, head_pitch=0.0)
        shadow = None
        faces += box((0, 1.5, 3.35), (6.4, 3.0, 0.3), (74, 66, 62))
        faces += box((-1.3, 1.0, 3.16), (0.95, 2.0, 0.1), (58, 46, 38))
        faces += box((-1.3, 0.06, 2.95), (1.1, 0.12, 0.5), (66, 58, 52))
        faces += cat_house(0.6, 2.2, 0.0, 1.0, glow=glow, night=True, snow_roof=smooth(0, 9, t))
        faces += pigeon_faces(0.6 + 0.30*math.sin(t*0.22), 2.35, math.pi*0.9 + 0.3*math.sin(t*0.3),
                              t, fly=0.0, peck=(0.5+0.5*math.sin(t*4.0))*(1 if 4.0 < t < 7.0 else 0), scale=0.8, y=0.98)
        faces += pigeon_faces(-0.05, 2.35, math.pi*0.6, t+1.3, fly=smooth(8.0, 9.0, t), peck=0.0, scale=0.75)
        faces += box((-3.4, 1.3, 1.0), (2.2, 2.6, 2.6), (60, 54, 50))
        faces += box((2.9, 1.5, 1.4), (0.08, 3.0, 0.08), (64, 62, 66)) + box((2.9, 3.05, 1.4), (0.5, 0.14, 0.3), (250, 232, 178))
        cf, cl = cat_faces(P); faces += cf; lines += cl
        cf, cl = cat_faces(F); faces += cf; lines += cl
        if MODE == "shorts":
            cam = make_cam((0.5, 0.52, -1.55), (0.6, 0.40, 2.0))
        else:
            cam = make_cam((0.15 + 0.25*smooth(0, 12, t), 0.55, -1.85), (0.6, 0.42, 2.0))
    else:
        sky = sky_img("studio", (118, 118, 121), (162, 162, 164))
        cam = make_cam((0, 0.8, -2.6), (0, 0.4, 0))
    img = sky.copy()
    dr = ImageDraw.Draw(img)
    if grid: draw_grid(dr, cam)
    if shadow: draw_shadow(dr, cam, shadow[0], shadow[1])
    proj = []
    for item in faces:
        q, col, emis = item[0], item[1], item[2]
        ol = item[3] if len(item) > 3 else False
        pp = [project(p, cam) for p in q]
        if any(p is None for p in pp): continue
        depth = sum(p[2] for p in pp)/len(pp)
        proj.append((depth, [(p[0], p[1]) for p in pp], shade((q, col, emis)), ol))
    proj.sort(key=lambda x: -x[0])
    for depth, poly, col, ol in proj:
        dr.polygon(poly, fill=col, outline=col)
        if ol:
            dr.line(poly + [poly[0]], fill=(36, 36, 40), width=2, joint="curve")
    for pa, pb in lines:
        qa, qb = project(pa, cam), project(pb, cam)
        if qa and qb:
            dr.line([qa[0], qa[1], qb[0], qb[1]], fill=(238, 238, 238), width=2)
    if rain:
        for i in range(70):
            xi = ((i*137) % 100)/100.0*8 - 4
            zi = ((i*71) % 100)/100.0*9 - 2.0
            yy = 2.3 - ((t*3.0 + i*0.37) % 2.3)
            pa, pb = project((xi, yy, zi), cam), project((xi-0.03, yy+0.28, zi), cam)
            if pa and pb:
                dr.line([pa[0], pa[1], pb[0], pb[1]], fill=(205, 215, 230), width=1)
    tt = t if ot is None else ot
    if snow:
        for i in range(46):
            xi = ((i*97) % 100)/100.0*7.0 - 3.5
            zi = ((i*53) % 100)/100.0*8.0 - 1.5
            yy = 2.4 - ((t*0.55 + i*0.21) % 2.4)
            xx = xi + 0.18*math.sin(t*0.9 + i)
            pa = project((xx, yy, zi), cam)
            if pa:
                dr.ellipse([pa[0]-2, pa[1]-2, pa[0]+2, pa[1]+2], fill=(246, 249, 253))
    for im, ta, tb in ovl_imgs:
        if ta <= tt <= tb:
            img = img.convert("RGBA")
            img.alpha_composite(im)
            img = img.convert("RGB")
            dr = ImageDraw.Draw(img)
    return img

def render_scene(k, ovl, out_path, only_t=None, D=None, tscale=1.0):
    S = B.scenes[k] if k < len(B.scenes) else {}
    Dl = D if D is not None else S.get("D", 10.0)
    ovl_imgs = [(Image.open(p).convert("RGBA"), a, b) for p, a, b in ovl]
    if only_t is not None:
        img = render_frame(k, only_t, ovl_imgs)
        img.save(out_path)
        return
    N = int(round(Dl*FPS))
    proc = subprocess.Popen([FF, "-y", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W}x{H}",
                             "-r", str(FPS), "-i", "-", "-c:v", "libx264", "-preset", "fast",
                             "-crf", "20", "-pix_fmt", "yuv420p", out_path],
                            stdin=subprocess.PIPE, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    for i in range(N):
        img = render_frame(k, i/FPS*tscale, ovl_imgs, ot=i/FPS)
        proc.stdin.write(img.tobytes())
    proc.stdin.close(); proc.wait()
    print("scene", k, "rendered", N, "frames ->", out_path)

if __name__ == "__main__":
    ovl = B.make_overlays()
    if len(sys.argv) > 1 and sys.argv[1] == "preview":
        ts = [5.0, 5.0, 11.0, 8.0, 8.0, 12.0, 4.0]
        for k in range(len(B.scenes)):
            render_scene(k, ovl[k], os.path.join(TMP, f"prev_{k}.png"), only_t=ts[k])
        print("previews done")
    else:
        for k in range(len(B.scenes)):
            render_scene(k, ovl[k], os.path.join(TMP, f"seg{k}.mp4"))
        B.assemble()
