"""Проверка и превью монолитов без Godot.

Запуск:
  python3 tools/gdpreview/monolith_check.py            # цифры
  python3 tools/gdpreview/monolith_check.py --png out  # + PNG-лист
"""

import argparse
import math
import sys

sys.path.insert(0, __file__.rsplit('/', 1)[0])

import monolith_port as mp  # noqa: E402


def normals_stats(made):
    """Сколько треугольников смотрят «наизнанку»: нормаль против направления
    от центра модели. У монолита почти всё должно смотреть наружу."""
    tris = made["tris"]
    verts = [v for tri in tris.verts for v in tri]
    cx = sum(v.x for v in verts) / len(verts)
    cy = sum(v.y for v in verts) / len(verts)
    cz = sum(v.z for v in verts) / len(verts)
    bad = 0
    for (a, b, c) in tris.verts:
        n = (b - a).cross(c - a)
        mid = a + b + c
        mid = mp.V3(mid.x / 3 - cx, mid.y / 3 - cy, mid.z / 3 - cz)
        if mid.length() > 1e-6 and n.dot(mid) < 0:
            bad += 1
    return bad


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--png")
    ap.add_argument("--from", dest="start", type=int, default=0)
    ap.add_argument("--grid", type=int, default=25)
    ap.add_argument("--step", type=int, default=0,
                    help="шаг выборки по каталогу")
    args = ap.parse_args()

    total_tris = 0
    empty = 0
    with_holes = 0
    with_rec = 0
    bad_normals = 0
    checked = 0
    sample = 400
    for i in range(sample):
        idx = (i * 37 + args.start) % mp.COUNT
        made = mp.build(idx)
        t = len(made["tris"].verts)
        total_tris += t
        if t < 8:
            empty += 1
        if made["openings"] > 0:
            with_holes += 1
        if made["recesses"] > 0:
            with_rec += 1
        if i % 20 == 0:
            if normals_stats(made) > t * 0.5:
                bad_normals += 1
        checked += 1

    print("каталог: %d моделей" % mp.COUNT)
    print("проверено выборкой: %d" % checked)
    print("среднее треугольников на модель: %.1f" % (total_tris / checked))
    print("пустых моделей: %d" % empty)
    print("с прорезями: %d из %d" % (with_holes, checked))
    print("с выемками: %d из %d" % (with_rec, checked))
    print("моделей с вывернутыми нормалями (больше половины): %d" % bad_normals)

    # геометрия декомпозиции: площадь свободных участков
    holes = [mp.Rect(0.2, 0.2, 0.2, 0.6), mp.Rect(0.6, 0.4, 0.2, 0.2)]
    free = mp.decompose(1.0, 1.0, holes)
    area = sum(r.w * r.h for r in free)
    expect = 1.0 - 0.2 * 0.6 - 0.2 * 0.2
    print("площадь грани после вычитания прорезей: %.4f (ожидалось %.4f)"
          % (area, expect))
    ok = abs(area - expect) < 1e-6 and empty == 0
    print("итог:", "OK" if ok else "ПРОВАЛ")

    if args.png:
        picks = []
        for i in range(args.grid):
            idx = (args.start + i * (args.step or 397)) % mp.COUNT
            picks.append(mp.build(idx))
        canvas = mp.render(picks)
        mp.write_png(args.png, canvas)
        print("превью:", args.png)

    return 0 if ok else 1


if __name__ == "__main__":
    raise SystemExit(main())
