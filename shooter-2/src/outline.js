/* =============================================================================
   СЕКТОР «ПЕПЕЛ» — построение моделей по обведённым точкам
   -----------------------------------------------------------------------------
   Никаких коробок: силуэт детали обводится точками (как трассировка по
   референсу), и по этим точкам строится объёмная модель.

   Три инструмента:
     outlineMesh(pts, opts)  — выдавливание контура с фаской и переменной
                               толщиной (ствол, магазин, приклад, ложа);
     loftSections(sections)  — спиной лофт по сечениям (торс, конечности,
                               цевьё, оптика, стволы);
     revolve(pts, opts)      — тело вращения по контуру (шлем, дуло, колба).
   Контуры хранятся в метрах, поэтому оружие и персонаж сразу в масштабе мира.
   ============================================================================= */
(function (root) {
  'use strict';
  const SH2 = (root.SH2 = root.SH2 || {});
  const THREE = () => root.THREE;

  /* ---------------------------------------------------------------------------
     1. Выдавливание обведённого контура
     pts  — [[z, y], ...] против часовой стрелки; профиль сбоку
     opts.depth — толщина (по X), opts.bevel — скругление рёбер,
     opts.taper — [[t, k], ...] множитель толщины вдоль Z (0..1)
     --------------------------------------------------------------------------- */
  function outlineMesh(pts, opts) {
    const T = THREE();
    const o = opts || {};
    const depth = o.depth === undefined ? 0.02 : o.depth;
    const bevel = o.bevel === undefined ? Math.min(0.004, depth * 0.35) : o.bevel;
    const shape = new T.Shape();
    pts.forEach((p, i) => {
      if (i === 0) shape.moveTo(p[0], p[1]);
      else shape.lineTo(p[0], p[1]);
    });
    shape.closePath();
    const geo = new T.ExtrudeGeometry(shape, {
      depth: Math.max(0.002, depth - bevel * 2),
      bevelEnabled: bevel > 0,
      bevelThickness: bevel,
      bevelSize: bevel * 0.9,
      bevelSegments: o.bevelSegments === undefined ? 2 : o.bevelSegments,
      curveSegments: 4,
      steps: 1
    });
    // контур лежит в (X=z_оружия, Y=высота), выдавливание идёт по Z -> разворачиваем
    geo.translate(0, 0, -(depth - bevel * 2) / 2);
    geo.rotateY(-Math.PI / 2);
    // толщина вдоль Z (после разворота ось X стала толщиной)
    const pos = geo.attributes.position;
    if (o.taper) {
      for (let i = 0; i < pos.count; i++) {
        const z = pos.getZ(i);
        let k = 1;
        for (let j = 0; j < o.taper.length; j++) {
          const [tz, tk] = o.taper[j];
          if (z <= tz) { k = tk; break; }
          k = tk;
        }
        pos.setX(i, pos.getX(i) * k);
      }
    }
    if (o.scale) {
      for (let i = 0; i < pos.count; i++) {
        pos.setXYZ(i, pos.getX(i) * o.scale[0], pos.getY(i) * o.scale[1], pos.getZ(i) * o.scale[2]);
      }
    }
    pos.needsUpdate = true;
    geo.computeVertexNormals();
    geo.computeBoundingSphere();
    return geo;
  }

  /* ---------------------------------------------------------------------------
     2. Лофт по сечениям
     sections: [{ at:[x,y,z], pts:[[a,b], ...], color }], pts — контур сечения.
     Все сечения должны иметь одинаковое число точек (первая точка — «верх»).
     --------------------------------------------------------------------------- */
  function loftSections(sections, opts) {
    const T = THREE();
    const o = opts || {};
    const n = sections.length;
    const m = sections[0].pts.length;
    const verts = [];
    const idx = [];
    // сечения лежат в горизонтальной плоскости (X, Z), высота задаётся at[1]
    for (let s = 0; s < n; s++) {
      const sec = sections[s];
      const c = sec.at;
      const sx = sec.scale ? sec.scale[0] : 1;
      const sz = sec.scale ? sec.scale[1] : 1;
      for (let i = 0; i < m; i++) {
        const p = sec.pts[i];
        verts.push(c[0] + p[0] * sx, c[1], c[2] + p[1] * sz);
      }
    }
    for (let s = 0; s < n - 1; s++) {
      for (let i = 0; i < m; i++) {
        const i2 = (i + 1) % m;
        const a = s * m + i, b = s * m + i2, c = (s + 1) * m + i2, d = (s + 1) * m + i;
        idx.push(a, b, c, a, c, d);
      }
    }
    // заглушки веером от центра сечения
    const capStart = verts.length / 3;
    const f = sections[0];
    verts.push(f.at[0], f.at[1], f.at[2]);
    for (let i = 0; i < m; i++) {
      const i2 = (i + 1) % m;
      idx.push(capStart, i2, i);
    }
    const capEnd = verts.length / 3;
    const l = sections[n - 1];
    verts.push(l.at[0], l.at[1], l.at[2]);
    const base = (n - 1) * m;
    for (let i = 0; i < m; i++) {
      const i2 = (i + 1) % m;
      idx.push(capEnd, base + i, base + i2);
    }
    const geo = new T.BufferGeometry();
    geo.setAttribute('position', new T.Float32BufferAttribute(verts, 3));
    geo.setIndex(idx);
    geo.computeVertexNormals();
    geo.computeBoundingSphere();
    return geo;
  }

  // сечение-«капсула» (скруглённый прямоугольник) для лофта
  function section(halfW, top, bottom, segs) {
    const n = segs || 12;
    const pts = [];
    const r = Math.min(halfW, (top - bottom) / 2);
    const cy = (top + bottom) / 2;
    const hh = (top - bottom) / 2;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      const ca = Math.cos(a), sa = Math.sin(a);
      // суперэллипс: сглаженный прямоугольник
      const p = 0.62;
      const x = Math.sign(ca) * Math.pow(Math.abs(ca), p) * halfW;
      const y = Math.sign(sa) * Math.pow(Math.abs(sa), p) * hh;
      pts.push([x, cy + y]);
    }
    return pts;
  }

  // сечение-круг/эллипс
  function circleSection(rx, ry, segs) {
    const n = segs || 10;
    const pts = [];
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      pts.push([Math.cos(a) * rx, Math.sin(a) * ry]);
    }
    return pts;
  }

  /* ---------------------------------------------------------------------------
     3. Тело вращения по контуру (шлем, дульный тормоз, граната)
     pts: [[y, r], ...] снизу вверх
     --------------------------------------------------------------------------- */
  function revolve(pts, opts) {
    const T = THREE();
    const o = opts || {};
    const segs = o.segments || 14;
    const geo = new T.LatheGeometry(pts.map((p) => new T.Vector2(Math.max(0.0005, p[1]), p[0])), segs);
    if (o.scale) geo.scale(o.scale[0], o.scale[1], o.scale[2]);
    geo.computeVertexNormals();
    return geo;
  }

  /* ---------------------------------------------------------------------------
     3b. Труба по 3D-пути
     points: [{ p: [x, y, z], r: радиус, ry: радиус по второму направлению }]
     Даёт изогнутые пальцы, предплечья и провода без коробок: кольца
     строятся в плоскости, перпендикулярной касательной, и соединяются в лофт.
     --------------------------------------------------------------------------- */
  function tubePath(points, opts) {
    const T = THREE();
    const o = opts || {};
    const seg = o.segments || 8;
    const n = points.length;
    if (n < 2) return new T.BufferGeometry();
    const verts = [];
    const idx = [];
    const up = new T.Vector3(0, 1, 0);
    const alt = new T.Vector3(1, 0, 0);
    const tangent = new T.Vector3();
    const normal = new T.Vector3();
    const binormal = new T.Vector3();
    const cur = new T.Vector3();
    for (let i = 0; i < n; i++) {
      const pt = points[i];
      const prev = points[Math.max(0, i - 1)].p;
      const next = points[Math.min(n - 1, i + 1)].p;
      tangent.set(next[0] - prev[0], next[1] - prev[1], next[2] - prev[2]);
      if (tangent.lengthSq() < 1e-10) tangent.set(0, 1, 0);
      tangent.normalize();
      // опорный вектор не должен быть параллелен касательной
      const ref = Math.abs(tangent.dot(up)) > 0.94 ? alt : up;
      normal.copy(ref).cross(tangent).normalize();
      binormal.copy(tangent).cross(normal).normalize();
      const rx = Math.max(0.0006, pt.r);
      const ry = Math.max(0.0006, pt.ry === undefined ? rx : pt.ry);
      cur.set(pt.p[0], pt.p[1], pt.p[2]);
      for (let s = 0; s < seg; s++) {
        const a = (s / seg) * Math.PI * 2;
        const ca = Math.cos(a), sa = Math.sin(a);
        verts.push(
          cur.x + normal.x * ca * rx + binormal.x * sa * ry,
          cur.y + normal.y * ca * rx + binormal.y * sa * ry,
          cur.z + normal.z * ca * rx + binormal.z * sa * ry
        );
      }
    }
    for (let i = 0; i < n - 1; i++) {
      for (let s = 0; s < seg; s++) {
        const s2 = (s + 1) % seg;
        const a = i * seg + s, b = i * seg + s2;
        const c = (i + 1) * seg + s2, d = (i + 1) * seg + s;
        idx.push(a, b, c, a, c, d);
      }
    }
    // заглушки на концах: веер от центра крайнего кольца
    if (o.caps !== false) {
      const capA = verts.length / 3;
      verts.push(points[0].p[0], points[0].p[1], points[0].p[2]);
      for (let s = 0; s < seg; s++) idx.push(capA, (s + 1) % seg, s);
      const capB = verts.length / 3;
      const last = points[n - 1].p;
      verts.push(last[0], last[1], last[2]);
      const base = (n - 1) * seg;
      for (let s = 0; s < seg; s++) idx.push(capB, base + s, base + (s + 1) % seg);
    }
    const geo = new T.BufferGeometry();
    geo.setAttribute('position', new T.Float32BufferAttribute(verts, 3));
    geo.setIndex(idx);
    geo.computeVertexNormals();
    geo.computeBoundingSphere();
    return geo;
  }

  /* ---------------------------------------------------------------------------
     4. Сглаживание контура (Catmull-Rom по точкам обводки)
     --------------------------------------------------------------------------- */
  function smoothOutline(pts, samples) {
    const T = THREE();
    const n = pts.length;
    const out = [];
    const steps = samples || 4;
    for (let i = 0; i < n; i++) {
      const p0 = pts[(i - 1 + n) % n], p1 = pts[i], p2 = pts[(i + 1) % n], p3 = pts[(i + 2) % n];
      for (let s = 0; s < steps; s++) {
        const t = s / steps;
        const t2 = t * t, t3 = t2 * t;
        const x = 0.5 * ((2 * p1[0]) + (-p0[0] + p2[0]) * t +
          (2 * p0[0] - 5 * p1[0] + 4 * p2[0] - p3[0]) * t2 +
          (-p0[0] + 3 * p1[0] - 3 * p2[0] + p3[0]) * t3);
        const y = 0.5 * ((2 * p1[1]) + (-p0[1] + p2[1]) * t +
          (2 * p0[1] - 5 * p1[1] + 4 * p2[1] - p3[1]) * t2 +
          (-p0[1] + 3 * p1[1] - 3 * p2[1] + p3[1]) * t3);
        out.push([x, y]);
      }
    }
    return out;
  }

  /* ---------------------------------------------------------------------------
     5. Кузов машины по контуру (для конвоя на карте)
     --------------------------------------------------------------------------- */
  function vehicleBody(profile, opts) {
    const o = opts || {};
    const depth = o.depth || 1.9;
    const taper = o.taper || [[-2.4, 0.72], [-2.0, 0.95], [2.0, 0.95], [2.4, 0.72]];
    return outlineMesh(smoothOutline(profile, 2), { depth, bevel: 0.10, taper, bevelSegments: 3 });
  }

  SH2.outline = { outlineMesh, loftSections, section, circleSection, revolve, tubePath, smoothOutline, vehicleBody };
})(typeof window !== 'undefined' ? window : globalThis);
