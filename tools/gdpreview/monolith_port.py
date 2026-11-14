"""Порт генератора монолитов из shooter-2-godot/scripts/monolith.gd.

Нужен, чтобы проверять геометрию БЕЗ Godot: считаем треугольники, ориентацию
нормалей, площади и рисуем превью в PNG софтверным растеризатором.

Порт держится один в один с GDScript-версией: те же функции, те же числа,
тот же порядок вершин. Если разойдутся — это ошибка порта, а не «другой
взгляд на модель».
"""

import math
import struct
import zlib

COUNT_OF = lambda a, b, c, d: a * b * c * d  # noqa: E731
ARCHETYPES = 10
VARIANTS = 10
FINISHES = 10

FAMILIES = [
    ("block", "блок"),
    ("slab", "плита"),
    ("pier", "тумба"),
    ("crate", "ящик"),
    ("column", "колонна"),
    ("parapet", "парапет"),
    ("stela", "стела"),
    ("pedestal", "постамент"),
    ("fence", "секция"),
    ("cassette", "кассета"),
]
COUNT = len(FAMILIES) * ARCHETYPES * VARIANTS * FINISHES

COLORS = {
    "block": ["#6b6a63", "#5a6a63", "#6a6055", "#59616a", "#736a58"],
    "slab": ["#707064", "#5f6a6f", "#6d655a", "#646d5c", "#6f6a60"],
    "pier": ["#5d6166", "#68645c", "#5a6259", "#6a625a", "#606468"],
    "crate": ["#7a6440", "#6b5a3c", "#82693f", "#5f5338", "#715c3a"],
    "column": ["#77746a", "#6a6d63", "#807a6e", "#5f625c", "#736d60"],
    "parapet": ["#65675f", "#5b6058", "#6d6b60", "#5f6359", "#6a685e"],
    "stela": ["#6e7168", "#5c6159", "#75736a", "#62655d", "#6a6f66"],
    "pedestal": ["#6a6459", "#5e6058", "#726b60", "#62605a", "#6d675c"],
    "fence": ["#5a5f5b", "#666a63", "#525753", "#6b6e66", "#5e625c"],
    "cassette": ["#676b63", "#5c615a", "#70736a", "#61655e", "#6a6e65"],
}


# ------------------------------- вектора ----------------------------------
class V3:
    __slots__ = ("x", "y", "z")

    def __init__(self, x=0.0, y=0.0, z=0.0):
        self.x, self.y, self.z = float(x), float(y), float(z)

    def __add__(self, o):
        return V3(self.x + o.x, self.y + o.y, self.z + o.z)

    def __sub__(self, o):
        return V3(self.x - o.x, self.y - o.y, self.z - o.z)

    def __mul__(self, k):
        return V3(self.x * k, self.y * k, self.z * k)

    def dot(self, o):
        return self.x * o.x + self.y * o.y + self.z * o.z

    def cross(self, o):
        return V3(self.y * o.z - self.z * o.y,
                  self.z * o.x - self.x * o.z,
                  self.x * o.y - self.y * o.x)

    def length(self):
        return math.sqrt(self.dot(self))

    def norm(self):
        n = self.length()
        return V3(self.x / n, self.y / n, self.z / n) if n > 1e-12 else V3()


class Rect:
    __slots__ = ("x", "y", "w", "h")

    def __init__(self, x, y, w, h):
        self.x, self.y, self.w, self.h = float(x), float(y), float(w), float(h)


def color_from_hex(s):
    return (int(s[1:3], 16) / 255.0, int(s[3:5], 16) / 255.0, int(s[5:7], 16) / 255.0)


def darken(c, k):
    return (c[0] * (1 - k), c[1] * (1 - k), c[2] * (1 - k))


def lighten(c, k):
    return (c[0] + (1 - c[0]) * k, c[1] + (1 - c[1]) * k, c[2] + (1 - c[2]) * k)


# --------------------------------- ГПСЧ -----------------------------------
class Rng:
    def __init__(self, seed):
        self.s = (seed * 2654435761) & 0x7FFFFFFF or 1

    def next(self):
        self.s = (self.s * 1103515245 + 12345) & 0x7FFFFFFF
        return self.s / 2147483648.0

    def range_f(self, a, b):
        return a + (b - a) * self.next()

    def range_i(self, a, b):
        if b <= a:
            return a
        return a + int(self.next() * float(b - a + 1)) % (b - a + 1)


# ------------------------------- описание ----------------------------------
def describe(index):
    i = max(0, min(COUNT - 1, index))
    per_fam = ARCHETYPES * VARIANTS * FINISHES
    f = i // per_fam
    rest = i - f * per_fam
    arch = rest // (VARIANTS * FINISHES)
    rest -= arch * VARIANTS * FINISHES
    variant = rest // FINISHES
    finish = rest - variant * FINISHES
    key, title = FAMILIES[f]
    return {
        "index": i,
        "id": "%s-%d-%d-%d" % (key, arch, variant, finish),
        "family": key,
        "family_title": title,
        "archetype": arch,
        "variant": variant,
        "finish": finish,
        "title": "%s №%d" % (title, arch * VARIANTS + variant + 1),
        "seed": i * 7919 + 13,
    }


# --------------------------- панель с прорезями -----------------------------
def decompose(w, h, voids):
    xs = [0.0, w]
    for v in voids:
        xs.append(max(0.0, min(w, v.x)))
        xs.append(max(0.0, min(w, v.x + v.w)))
    xs.sort()
    out = []
    for k in range(len(xs) - 1):
        x0, x1 = xs[k], xs[k + 1]
        if x1 - x0 < 0.0002:
            continue
        mid = (x0 + x1) * 0.5
        spans = []
        for v in voids:
            if mid > v.x + 0.0001 and mid < v.x + v.w - 0.0001:
                spans.append((max(0.0, v.y), min(h, v.y + v.h)))
        spans.sort()
        y = 0.0
        for sp in spans:
            top = max(0.0, min(h, sp[0]))
            if top - y > 0.0002:
                out.append(Rect(x0, y, x1 - x0, top - y))
            y = max(y, max(0.0, min(h, sp[1])))
        if h - y > 0.0002:
            out.append(Rect(x0, y, x1 - x0, h - y))
    return out


class Tris:
    def __init__(self):
        self.verts = []
        self.colors = []
        self.color = (0.5, 0.5, 0.5)

    def set_color(self, c):
        self.color = c

    def tri(self, a, b, c):
        n = b.__sub__(a).cross(c.__sub__(a))
        if n.dot(n) < 1e-14:
            return
        self.verts.append((a, b, c))
        self.colors.append(self.color)

    def quad_n(self, a, b, c, d, out):
        n = b.__sub__(a).cross(c.__sub__(a))
        if n.dot(out) < 0.0:
            self.tri(a, d, c)
            self.tri(a, c, b)
            return
        self.tri(a, b, c)
        self.tri(a, c, d)

    def extend(self, other, xf=None):
        for (a, b, c), col in zip(other.verts, other.colors):
            if xf is None:
                self.verts.append((a, b, c))
            else:
                self.verts.append((xf(a), xf(b), xf(c)))
            self.colors.append(col)


def rect_tube(st, r, z0, z1):
    x0, x1 = r.x, r.x + r.w
    y0, y1 = r.y, r.y + r.h
    st.quad_n(V3(x0, y0, z0), V3(x1, y0, z0), V3(x1, y0, z1), V3(x0, y0, z1), V3(0, 1, 0))
    st.quad_n(V3(x0, y1, z1), V3(x1, y1, z1), V3(x1, y1, z0), V3(x0, y1, z0), V3(0, -1, 0))
    st.quad_n(V3(x0, y0, z1), V3(x0, y1, z1), V3(x0, y1, z0), V3(x0, y0, z0), V3(1, 0, 0))
    st.quad_n(V3(x1, y0, z0), V3(x1, y1, z0), V3(x1, y1, z1), V3(x1, y0, z1), V3(-1, 0, 0))


def panel_mesh(w, h, thick, holes, recesses, base, xf=None):
    st = Tris()
    st.set_color(base)
    half = thick * 0.5
    voids = list(holes) + [r["rect"] for r in recesses]
    free = decompose(w, h, voids)

    for r in free:
        p0 = V3(r.x, r.y, half)
        p1 = V3(r.x + r.w, r.y, half)
        p2 = V3(r.x + r.w, r.y + r.h, half)
        p3 = V3(r.x, r.y + r.h, half)
        st.quad_n(p0, p1, p2, p3, V3(0, 0, 1))
        q0 = V3(p0.x, p0.y, -half)
        q1 = V3(p1.x, p1.y, -half)
        q2 = V3(p2.x, p2.y, -half)
        q3 = V3(p3.x, p3.y, -half)
        st.quad_n(q0, q1, q2, q3, V3(0, 0, -1))

    oc = [V3(0, 0, 0), V3(w, 0, 0), V3(w, h, 0), V3(0, h, 0)]
    mid2x, mid2y = w * 0.5, h * 0.5
    for i in range(4):
        a = oc[i]
        b = oc[(i + 1) % 4]
        a0 = V3(a.x, a.y, -half)
        a1 = V3(a.x, a.y, half)
        b0 = V3(b.x, b.y, -half)
        b1 = V3(b.x, b.y, half)
        emx = (a.x + b.x) * 0.5 - mid2x
        emy = (a.y + b.y) * 0.5 - mid2y
        ln = math.hypot(emx, emy) or 1.0
        st.quad_n(a0, b0, b1, a1, V3(emx / ln, emy / ln, 0))

    for r in holes:
        rect_tube(st, r, -half, half)

    for rc in recesses:
        r = rc["rect"]
        depth = max(0.002, min(thick * 1.5, rc.get("depth", 0.06)))
        back = half - depth
        rect_tube(st, r, back, half)
        sb = Tris()
        sb.set_color(darken(base, 0.22))
        b0 = V3(r.x, r.y, back)
        b1 = V3(r.x + r.w, r.y, back)
        b2 = V3(r.x + r.w, r.y + r.h, back)
        b3 = V3(r.x, r.y + r.h, back)
        sb.quad_n(b0, b1, b2, b3, V3(0, 0, 1))
        st.extend(sb)

    if xf is not None:
        st2 = Tris()
        st2.set_color(base)
        st2.extend(st, xf)
        return st2
    return st


def rib_column(st, at, h, size):
    half = size * 0.5
    a = V3(at.x - half, 0, at.z - half)
    b = V3(at.x + half, 0, at.z - half)
    c = V3(at.x + half, 0, at.z + half)
    d = V3(at.x - half, 0, at.z + half)
    up = V3(0, h, 0)
    a2, b2, c2, d2 = a + up, b + up, c + up, d + up
    st.quad_n(a, b, b2, a2, V3(0, 0, -1))
    st.quad_n(b, c, c2, b2, V3(1, 0, 0))
    st.quad_n(c, d, d2, c2, V3(0, 0, 1))
    st.quad_n(d, a, a2, d2, V3(-1, 0, 0))


def _rot_y(ang, p):
    c, s = math.cos(ang), math.sin(ang)
    return V3(c * p.x + s * p.z, p.y, -s * p.x + c * p.z)


def _rot_x(ang, p):
    c, s = math.cos(ang), math.sin(ang)
    return V3(p.x, c * p.y - s * p.z, s * p.y + c * p.z)


def _place(rotdeg, tx, ty, tz):
    """Поворот вокруг Y на угол (в радианах), затем перенос — так же, как
    Transform3D(Basis(UP, a), at) в GDScript."""
    def f(p):
        return _rot_y(rotdeg, p) + V3(tx, ty, tz)
    return f


def _place_x(rotdeg, tx, ty, tz):
    """Поворот вокруг X (крышка и дно), затем перенос — Basis(RIGHT, a)."""
    def f(p):
        return _rot_x(rotdeg, p) + V3(tx, ty, tz)
    return f


def solid_box(w, h, d, color, at=None):
    st = Tris()
    st.set_color(color)
    ax, ay, az = (0.0, 0.0, 0.0) if at is None else (at.x, at.y, at.z)
    hw, hd = w * 0.5, d * 0.5
    x0, x1, y0, y1, z0, z1 = ax - hw, ax + hw, ay, ay + h, az - hd, az + hd
    st.quad_n(V3(x0, y0, z1), V3(x1, y0, z1), V3(x1, y1, z1), V3(x0, y1, z1), V3(0, 0, 1))
    st.quad_n(V3(x1, y0, z0), V3(x0, y0, z0), V3(x0, y1, z0), V3(x1, y1, z0), V3(0, 0, -1))
    st.quad_n(V3(x1, y0, z1), V3(x1, y0, z0), V3(x1, y1, z0), V3(x1, y1, z1), V3(1, 0, 0))
    st.quad_n(V3(x0, y0, z0), V3(x0, y0, z1), V3(x0, y1, z1), V3(x0, y1, z0), V3(-1, 0, 0))
    st.quad_n(V3(x0, y1, z1), V3(x1, y1, z1), V3(x1, y1, z0), V3(x0, y1, z0), V3(0, 1, 0))
    st.quad_n(V3(x0, y0, z0), V3(x1, y0, z0), V3(x1, y0, z1), V3(x0, y0, z1), V3(0, -1, 0))
    return st


def box_monolith(w, h, d, thick, faces, base, bevel):
    st = Tris()
    st.set_color(base)
    bev = max(0.02, min(0.09, thick * 0.55))
    half_w, half_d = w * 0.5 - bev, d * 0.5 - bev
    pw, ph, pd = w - bev * 2.0, h - bev * 0.5, d - bev * 2.0

    front = faces.get("front", ([], []))
    st.extend(panel_mesh(pw, ph, thick, _clip_holes(front[0], pw, ph, bev),
                         front[1], base, _place(0.0, -half_w, bev * 0.5, half_d)))
    back = faces.get("back", ([], []))
    st.extend(panel_mesh(pw, ph, thick, _clip_holes(back[0], pw, ph, bev), back[1], base,
                         _place(math.pi, half_w, bev * 0.5, -half_d)))
    left = faces.get("left", ([], []))
    st.extend(panel_mesh(pd, ph, thick, _clip_holes(left[0], pd, ph, bev), left[1], base,
                         _place(-math.pi * 0.5, -half_w, bev * 0.5, -half_d)))
    right = faces.get("right", ([], []))
    st.extend(panel_mesh(pd, ph, thick, _clip_holes(right[0], pd, ph, bev), right[1], base,
                         _place(math.pi * 0.5, half_w, bev * 0.5, half_d)))
    top = faces.get("top", ([], []))
    st.extend(panel_mesh(pw, pd, thick, _clip_holes(top[0], pw, pd, bev), top[1], base,
                         _place_x(-math.pi * 0.5, -half_w, h - bev * 0.5, half_d)))
    bottom = faces.get("bottom", ([], []))
    if bottom[0] or bottom[1]:
        st.extend(panel_mesh(pw, pd, thick, _clip_holes(bottom[0], pw, pd, bev),
                             bottom[1], base,
                             _place_x(math.pi * 0.5, -half_w, bev * 0.5, -half_d)))

    st.extend(_corners(w, h, d, bev, bevel))
    return st


def _corners(w, h, d, bev, color):
    st = Tris()
    st.set_color(color)
    hw, hd = w * 0.5, d * 0.5
    for sx in (-1.0, 1.0):
        for sz in (-1.0, 1.0):
            ax, az = sx * hw, sz * hd
            p1 = V3(ax, 0.0, az - sz * bev * 1.8)
            p2 = V3(ax - sx * bev * 1.8, 0.0, az)
            p3 = V3(p2.x, h, p2.z)
            p4 = V3(p1.x, h, p1.z)
            st.quad_n(p1, p2, p3, p4, V3(sx, 0.0, sz))
    return st


def _clip_holes(holes, w, h, margin):
    out = []
    for r in holes:
        x0 = max(margin * 0.8, r.x)
        y0 = max(margin * 0.8, r.y)
        x1 = min(w - margin * 0.8, r.x + r.w)
        y1 = min(h - margin * 0.8, r.y + r.h)
        if x1 - x0 > 0.02 and y1 - y0 > 0.02:
            out.append(Rect(x0, y0, x1 - x0, y1 - y0))
    return out


def grid_openings(w, h, cols, rows, pad_x, pad_y):
    holes = []
    cell_w, cell_h = w / cols, h / rows
    for iy in range(rows):
        for ix in range(cols):
            ow = max(0.06, cell_w - pad_x * 2.0)
            oh = max(0.06, cell_h - pad_y * 2.0)
            holes.append(Rect(ix * cell_w + (cell_w - ow) * 0.5,
                              iy * cell_h + (cell_h - oh) * 0.5, ow, oh))
    return (holes, [])


def single_recess(w, h, k, depth):
    rw = w * k * 0.5
    rh = h * k * 0.35
    return [{"rect": Rect((w - rw) * 0.5, (h - rh) * 0.5, rw, rh), "depth": depth}]


def make(family, rng, arch, variant, finish):
    palette = COLORS[family]
    base = color_from_hex(palette[(variant + finish) % len(palette)])
    rib = lighten(base, 0.06 + 0.01 * (finish % 5))
    w = h = d = 1.0
    thick = 0.08
    faces = {}
    openings = 0
    recesses = 0

    if family == "block":
        w = rng.range_f(1.0, 1.9) * (1.0 + 0.03 * arch)
        h = rng.range_f(0.7, 1.4)
        d = rng.range_f(0.9, 1.5)
        thick = 0.10
        cols = 1 + (variant + arch) % 3
        rows = 1 + (variant // 3 + arch) % 2
        faces["front"] = grid_openings(w, h, cols, rows, 0.16, 0.06)
        openings += cols * rows
        if finish % 3 == 0:
            faces["back"] = ([], single_recess(w, h, 0.34, 0.07 + 0.01 * (finish % 3)))
            recesses += 1
        if arch >= 5:
            faces["top"] = grid_openings(w, d, 1 + arch // 5, 1, 0.20, 0.05)
            openings += 1 + arch // 5
    elif family == "slab":
        w = rng.range_f(1.6, 3.2)
        h = rng.range_f(1.4, 2.6)
        d = rng.range_f(0.26, 0.42)
        thick = max(0.10, d * 0.4)
        ow = min(w * 0.44, rng.range_f(0.6, 1.2))
        oh = min(h * 0.52, rng.range_f(0.8, 1.4))
        r = Rect((w - ow) * 0.5, h * 0.12 + (h - oh) * 0.28 * (arch % 3) * 0.5, ow, oh)
        faces["front"] = ([r], [])
        faces["back"] = ([r], [])
        openings += 1
        if variant % 2 == 1:
            small = Rect(w * 0.10, h * 0.62, min(w * 0.18, 0.4), min(h * 0.22, 0.4))
            faces["front"] = ([r, small], [])
            openings += 1
        if finish % 4 == 1:
            faces["front"] = (faces["front"][0], single_recess(w, h, 0.5, 0.05))
            recesses += 1
    elif family == "pier":
        w = rng.range_f(0.7, 1.2)
        h = rng.range_f(0.8, 1.6)
        d = rng.range_f(0.7, 1.2)
        thick = 0.09
        niches = []
        rows2 = 1 + variant % 3
        for i in range(rows2):
            ny = h * (0.18 + 0.22 * i)
            niches.append({"rect": Rect(w * 0.22, ny, w * 0.56, min(h * 0.18, 0.26)),
                           "depth": 0.05 + 0.02 * ((finish + i) % 3)})
        faces["front"] = ([], niches)
        recesses += rows2
        if arch % 2 == 0:
            faces["left"] = grid_openings(d, h, 1, 1, 0.2, 0.05)
            openings += 1
    elif family == "crate":
        w = rng.range_f(0.7, 1.1)
        h = rng.range_f(0.6, 0.95)
        d = rng.range_f(0.7, 1.1)
        thick = 0.06
        slots = []
        n_slots = 2 + variant % 4
        for i in range(n_slots):
            sx = w * (0.10 + 0.80 * (i + 1) / (n_slots + 1))
            slots.append(Rect(sx - w * 0.035, h * 0.10, w * 0.07, h * 0.80))
        faces["front"] = (slots, [])
        faces["back"] = (slots, [])
        openings += n_slots * 2
        if finish % 3 == 0:
            faces["top"] = ([], single_recess(w, d, 0.55, 0.06))
            recesses += 1
        if arch >= 6:
            faces["left"] = grid_openings(d, h, 2, 1, 0.14, 0.04)
            openings += 2
    elif family == "column":
        w = rng.range_f(0.4, 0.8)
        h = rng.range_f(1.8, 3.4)
        d = w * rng.range_f(0.9, 1.2)
        thick = 0.10
        bands = 2 + variant % 4
        band_holes, band_rec = [], []
        for i in range(bands):
            y = h * (0.08 + 0.82 * (i + 1) / (bands + 1))
            if (i + arch) % 3 == 0:
                band_rec.append({"rect": Rect(w * 0.5 - w * 0.18, y, w * 0.36, h * 0.05),
                                 "depth": 0.04 + 0.01 * (finish % 4)})
            else:
                band_holes.append(Rect(w * 0.5 - w * 0.14, y, w * 0.28, h * 0.05))
        faces["front"] = (band_holes, band_rec)
        openings += len(band_holes)
        recesses += len(band_rec)
        faces["back"] = (band_holes, [])
        openings += len(band_holes)
    elif family == "parapet":
        w = rng.range_f(2.4, 4.4)
        h = rng.range_f(0.9, 1.5)
        d = rng.range_f(0.34, 0.55)
        thick = max(0.10, d * 0.42)
        embrasures = 3 + variant % 5
        holes = []
        for i in range(embrasures):
            sx = w * (0.08 + 0.84 * (i + 0.5) / embrasures)
            holes.append(Rect(sx - w * 0.035, h * 0.42, w * 0.07, h * 0.34))
        faces["front"] = (holes, [])
        faces["back"] = (holes, [])
        openings += embrasures * 2
        if arch % 3 == 0:
            faces["top"] = ([], single_recess(w, d, 0.30, 0.05))
            recesses += 1
    elif family == "stela":
        w = rng.range_f(1.2, 2.2)
        h = rng.range_f(1.8, 3.0)
        d = rng.range_f(0.22, 0.36)
        thick = max(0.09, d * 0.45)
        arch_w = min(w * 0.5, 0.9)
        arch_h = min(h * 0.55, 1.5)
        r2 = Rect((w - arch_w) * 0.5, h * 0.10, arch_w, arch_h)
        stack = [r2]
        if variant % 3 == 0:
            stack.append(Rect((w - arch_w * 0.5) * 0.5, h * 0.72,
                              arch_w * 0.5, min(h * 0.18, 0.3)))
        faces["front"] = (stack, [])
        faces["back"] = (stack, [])
        openings += len(stack) * 2
        if finish % 5 == 2:
            faces["front"] = (stack, single_recess(w, h, 0.62, 0.04))
            recesses += 1
    elif family == "pedestal":
        w = rng.range_f(1.0, 1.8)
        h = rng.range_f(1.0, 2.0)
        d = rng.range_f(1.0, 1.8)
        thick = 0.10
        n_niches = 1 + variant % 3
        niches2 = []
        for i in range(n_niches):
            step = 0.68 * i / max(1, n_niches - 1)
            nx = w * (0.16 + step) if n_niches > 1 else w * 0.3
            niches2.append({"rect": Rect(nx - w * 0.09, h * 0.14, w * 0.18, h * 0.30),
                            "depth": 0.07 + 0.015 * ((arch + i) % 4)})
        faces["front"] = ([], niches2)
        recesses += n_niches
        faces["left"] = ([], niches2)
        recesses += n_niches
        if arch % 2 == 1:
            faces["top"] = grid_openings(w, d, 2, 2, 0.22, 0.05)
            openings += 4
    elif family == "fence":
        w = rng.range_f(2.0, 3.6)
        h = rng.range_f(1.2, 2.2)
        d = rng.range_f(0.14, 0.24)
        thick = max(0.07, d * 0.6)
        win = 2 + variant % 4
        wh = []
        for i in range(win):
            sx = w * (0.06 + 0.88 * (i + 0.5) / win)
            wh.append(Rect(sx - w * 0.055, h * 0.16, w * 0.11, h * 0.62))
        faces["front"] = (wh, [])
        faces["back"] = (wh, [])
        openings += win * 2
        faces["bottom"] = ([], single_recess(w, d, 0.5, 0.012))
        recesses += 1
    elif family == "cassette":
        w = rng.range_f(1.0, 2.0)
        h = rng.range_f(0.8, 1.6)
        d = rng.range_f(0.6, 1.1)
        thick = 0.07
        cx = 2 + arch % 3
        cy = 2 + variant % 3
        cells, cells_rec = [], []
        for iy in range(cy):
            for ix in range(cx):
                cw = w / cx * 0.62
                ch = h / cy * 0.62
                px = w * (ix + 0.5) / cx - cw * 0.5
                py = h * (iy + 0.5) / cy - ch * 0.5
                if (ix + iy + finish) % 4 == 0:
                    cells_rec.append({"rect": Rect(px, py, cw, ch),
                                      "depth": 0.05 + 0.02 * (finish % 3)})
                else:
                    cells.append(Rect(px, py, cw, ch))
        faces["front"] = (cells, cells_rec)
        openings += len(cells)
        recesses += len(cells_rec)
        faces["back"] = (cells, [])
        openings += len(cells)
        if arch >= 7:
            faces["right"] = grid_openings(d, h, 1, 2, 0.18, 0.05)
            openings += 2

    body = box_monolith(w, h, d, thick, faces, base, rib)
    extras = []
    if family == "pedestal":
        extras.append(solid_box(w + 0.34, 0.16, d + 0.34, darken(rib, 0.12)))
        extras.append(solid_box(w + 0.18, 0.10, d + 0.18, darken(rib, 0.06),
                                V3(0, h - 0.10, 0)))
    elif family == "block":
        extras.append(solid_box(w + 0.16, 0.12, d + 0.16, darken(rib, 0.10),
                                V3(0, h - 0.06, 0)))
        if arch >= 5:
            extras.append(solid_box(w + 0.24, 0.10, d + 0.24, darken(rib, 0.14),
                                    V3(0, h + 0.06, 0)))
    elif family == "column":
        extras.append(solid_box(w + 0.22, 0.14, d + 0.22, darken(rib, 0.10)))
        extras.append(solid_box(w + 0.26, 0.12, d + 0.26, lighten(rib, 0.04),
                                V3(0, h - 0.12, 0)))
    elif family == "stela":
        extras.append(solid_box(w + 0.26, 0.14, d + 0.18, darken(rib, 0.12)))
    elif family == "parapet":
        extras.append(solid_box(w + 0.06, 0.09, d + 0.10, lighten(rib, 0.05),
                                V3(0, h - 0.04, 0)))
    elif family == "pier":
        extras.append(solid_box(w + 0.20, 0.12, d + 0.20, darken(rib, 0.10)))
        extras.append(solid_box(w + 0.14, 0.08, d + 0.14, darken(rib, 0.04),
                                V3(0, h - 0.08, 0)))
    elif family == "fence":
        for sx2 in (-1.0, 1.0):
            extras.append(solid_box(0.12, h + 0.12, d + 0.10, darken(rib, 0.10),
                                    V3(sx2 * (w * 0.5 + 0.05), 0, 0)))
    tris = body
    if extras:
        for e in extras:
            tris.extend(e)
    return {"tris": tris, "w": w, "h": h, "d": d, "openings": openings,
            "recesses": recesses, "base": base}


def build(index):
    d = describe(index)
    rng = Rng(int(d["seed"]))
    made = make(d["family"], rng, d["archetype"], d["variant"], d["finish"])
    made["id"] = d["id"]
    made["title"] = d["title"]
    made["family"] = d["family"]
    made["index"] = d["index"]
    return made


# ------------------------------- растеризация ------------------------------
class Canvas:
    def __init__(self, w, h, bg):
        self.w, self.h = w, h
        self.color = bytearray()
        for _ in range(w * h):
            self.color += bytes((bg[0], bg[1], bg[2]))
        self.depth = [1e9] * (w * h)

    def plot(self, x, y, z, rgb):
        if x < 0 or y < 0 or x >= self.w or y >= self.h:
            return
        i = y * self.w + x
        if z < self.depth[i]:
            self.depth[i] = z
            self.color[i * 3:i * 3 + 3] = bytes((
                max(0, min(255, int(rgb[0] * 255.0))),
                max(0, min(255, int(rgb[1] * 255.0))),
                max(0, min(255, int(rgb[2] * 255.0)))))

    def tri(self, a, b, c, rgb, shade):
        x0, y0 = int(a[0]), int(a[1])
        x1, y1 = int(b[0]), int(b[1])
        x2, y2 = int(c[0]), int(c[1])
        minx, maxx = max(0, min(x0, x1, x2)), min(self.w - 1, max(x0, x1, x2))
        miny, maxy = max(0, min(y0, y1, y2)), min(self.h - 1, max(y0, y1, y2))
        if minx > maxx or miny > maxy:
            return
        denom = (y1 - y2) * (x0 - x2) + (x2 - x1) * (y0 - y2)
        if abs(denom) < 1e-9:
            return
        col = (rgb[0] * shade, rgb[1] * shade, rgb[2] * shade)
        for py in range(miny, maxy + 1):
            for px in range(minx, maxx + 1):
                l0 = ((y1 - py) * (x2 - px) - (x2 - px) * (y1 - py)) / denom
                # корректные барицентрики
                l0 = ((y1 - y2) * (px - x2) + (x2 - x1) * (py - y2)) / denom
                l1 = ((y2 - y0) * (px - x2) + (x0 - x2) * (py - y2)) / denom
                l2 = 1.0 - l0 - l1
                if l0 < -1e-6 or l1 < -1e-6 or l2 < -1e-6:
                    continue
                z = l0 * a[2] + l1 * b[2] + l2 * c[2]
                self.plot(px, py, z, col)


def render(items, cell=300, cols=4, cam=(1.05, 0.5, 1.75)):
    """Ортографическое превью с отсечением задних граней — так же, как это
    делает Godot: лицевая грань та, у которой нормаль (по правилу правой руки)
    смотрит в сторону камеры."""
    rows = int(math.ceil(len(items) / cols))
    W, H = cell * cols, cell * rows
    canvas = Canvas(W, H, (16, 19, 24))
    d = V3(*cam).norm()
    fwd = d * -1.0
    right = fwd.cross(V3(0, 1, 0)).norm()
    if right.length() < 1e-6:
        right = V3(1, 0, 0)
    up = right.cross(fwd).norm()
    l1 = V3(0.45, 0.9, 0.55).norm()
    l2 = V3(-0.5, 0.35, -0.6).norm()
    for idx, made in enumerate(items):
        tris = made["tris"]
        verts = [v for tri in tris.verts for v in tri]
        minx = min(v.x for v in verts)
        maxx = max(v.x for v in verts)
        miny = min(v.y for v in verts)
        maxy = max(v.y for v in verts)
        minz = min(v.z for v in verts)
        maxz = max(v.z for v in verts)
        center = V3((minx + maxx) * 0.5, (miny + maxy) * 0.5, (minz + maxz) * 0.5)
        span = max(maxx - minx, maxy - miny, maxz - minz, 0.2)
        scale = cell * 0.42 / span
        cx = (idx % cols) * cell + cell * 0.5
        cy = (idx // cols) * cell + cell * 0.5
        cells = []
        for (a, b, c), col in zip(tris.verts, tris.colors):
            n = (b - a).cross(c - a)
            if n.dot(d) <= 0.0:
                continue
            ln = n.length() or 1.0
            n = V3(n.x / ln, n.y / ln, n.z / ln)
            pts = []
            for v in (a, b, c):
                rel = v - center
                sx = cx + rel.dot(right) * scale
                sy = cy - rel.dot(up) * scale
                depth = rel.dot(fwd)
                pts.append((sx, sy, depth))
            lam = 0.42 + 0.78 * max(0.0, n.dot(l1)) + 0.28 * max(0.0, n.dot(l2))
            cells.append((pts, col, min(1.55, lam)))
        # дальние треугольники сначала — внутри ячейки painter-сортировка поверх z-буфера
        cells.sort(key=lambda t: -(t[0][0][2] + t[0][1][2] + t[0][2][2]) / 3.0)
        for pts, col, lam in cells:
            canvas.tri(pts[0], pts[1], pts[2], col, lam)
    return canvas


def write_png(path, canvas):
    raw = bytearray()
    for y in range(canvas.h):
        raw.append(0)
        raw += canvas.color[y * canvas.w * 3:(y + 1) * canvas.w * 3]

    def chunk(tag, data):
        c = struct.pack(">I", len(data)) + tag + data
        return c + struct.pack(">I", zlib.crc32(tag + data) & 0xFFFFFFFF)

    png = b"\x89PNG\r\n\x1a\n"
    png += chunk(b"IHDR", struct.pack(">IIBBBBB", canvas.w, canvas.h, 8, 2, 0, 0, 0))
    png += chunk(b"IDAT", zlib.compress(bytes(raw), 9))
    png += chunk(b"IEND", b"")
    with open(path, "wb") as fh:
        fh.write(png)
