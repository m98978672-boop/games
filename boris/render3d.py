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
        ear = loft([base, tip], ORANGE if sgn > 0 else CLAY)
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
        elev = 0.75 + 0.22*math.sin(w*2.0 + i*0.55)
        azim = 0.45*math.sin(w*2.6 + i*0.40)
        d = (math.sin(azim)*0.048, math.sin(elev)*0.048, -math.cos(azim)*0.048)
        pos = (pos[0]+d[0], pos[1]+d[1], pos[2]+d[2])
        s = 0.050 - 0.024*(i/6.0)
        col = PURP if i % 2 == 0 else BLACK
        faces += [([body(p) for p in q], col, True, False) for q, c2, e in box(pos, (s, s, s*1.1), col)]
    if P.get("grey"):
        gm = {CLAY: (172, 172, 174), ORANGE: (172, 172, 174), MUZZ: (182, 182, 184),
              GREEN: (95, 95, 97), BLACK: (120, 120, 122), PINK: (150, 150, 152), PURP: (150, 150, 152)}
        faces = [(q, gm.get(c, c), e, ol) for q, c, e, ol in faces]
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

def render_frame(k, t, ovl_imgs):
    S = B.scenes[k]
    faces, grid, shadow, lines = [], True, None, []
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
        for ox, t0, kind in objs:
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
    else:
        sky = sky_img("studio", (118, 118, 121), (162, 162, 164))
        P = dict(x=0, z=0, yaw=0.0, walk=None, tp=1.0, detach=1.0, tail_t=t,
                 blink=blink(t), head_yaw=0.0, head_pitch=0.0)
        shadow = (0, 0)
        cf, cl = cat_faces(P); faces += cf; lines += cl
        a = 0.3 + (t/B.scenes[6]["D"])*math.pi*1.7
        cam = make_cam((2.3*math.sin(a), 0.68, 2.3*math.cos(a)), (0, 0.45, 0))
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
    for im, ta, tb in ovl_imgs:
        if ta <= t <= tb:
            img = img.convert("RGBA")
            img.alpha_composite(im)
            img = img.convert("RGB")
            dr = ImageDraw.Draw(img)
    return img

def render_scene(k, ovl, out_path, only_t=None):
    S = B.scenes[k]
    Dl = S["D"]
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
        img = render_frame(k, i/FPS, ovl_imgs)
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
