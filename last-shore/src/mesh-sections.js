// Геометрические сектора для неподвижных непрозрачных частей моделей.
// Соединённые треугольники одного меша обрабатываются отдельно, чтобы
// не заливать пустоту между отдельными камнями или ветками одной оболочкой.
import { convexHull2D } from './shells.js';

export function meshSections(geometries, { bandHeight = 0.45 } = {}) {
  const result = [];
  for (const geometry of geometries) {
    const pos = geometry?.attributes?.position;
    if (!pos) continue;
    const idx = geometry.index;
    const count = idx ? idx.count : pos.count;
    if (count % 3 !== 0) continue;
    const vertexIds = new Map(), vertices = [], parent = [], triangles = [];
    const vertex = (n) => {
      const x = pos.getX(n), y = pos.getY(n), z = pos.getZ(n);
      // В мешах соседние грани часто имеют отдельные вершины для нормалей/UV.
      const key = `${Math.round(x * 100000)},${Math.round(y * 100000)},${Math.round(z * 100000)}`;
      let id = vertexIds.get(key);
      if (id === undefined) { id = vertices.length; vertexIds.set(key, id); vertices.push({ x, y, z }); parent.push(id); }
      return id;
    };
    const find = (i) => { while (parent[i] !== i) { parent[i] = parent[parent[i]]; i = parent[i]; } return i; };
    for (let n = 0; n < count; n += 3) {
      const a = vertex(idx ? idx.getX(n) : n), b = vertex(idx ? idx.getX(n + 1) : n + 1), c = vertex(idx ? idx.getX(n + 2) : n + 2);
      parent[find(b)] = find(a); parent[find(c)] = find(a);
      triangles.push([a, b, c]);
    }
    const groups = new Map();
    for (const tri of triangles) {
      const root = find(tri[0]);
      let group = groups.get(root);
      if (!group) groups.set(root, group = { triangles: [], minY: Infinity, maxY: -Infinity });
      group.triangles.push(tri);
      for (const id of tri) { const y = vertices[id].y; group.minY = Math.min(group.minY, y); group.maxY = Math.max(group.maxY, y); }
    }
    // Отрезаем каждую грань по вертикальным границам пояса: простого выбора
    // только исходных вершин недостаточно для наклонных и вытянутых граней.
    const clip = (poly, bound, above) => {
      const out = [];
      for (let i = 0; i < poly.length; i++) {
        const a = poly[i], b = poly[(i + 1) % poly.length];
        const ai = above ? a.y >= bound : a.y <= bound;
        const bi = above ? b.y >= bound : b.y <= bound;
        if (ai) out.push(a);
        if (ai !== bi) {
          const t = (bound - a.y) / (b.y - a.y);
          out.push({ x: a.x + (b.x - a.x) * t, y: bound, z: a.z + (b.z - a.z) * t });
        }
      }
      return out;
    };
    for (const group of groups.values()) {
      const span = group.maxY - group.minY;
      if (span < 0.025) continue;
      const bands = Math.max(1, Math.ceil(span / bandHeight));
      for (let i = 0; i < bands; i++) {
        const minY = group.minY + span * i / bands, maxY = group.minY + span * (i + 1) / bands;
        const points = [];
        for (const tri of group.triangles) {
          const [a,b,c] = tri.map(id => vertices[id]);
          if (Math.max(a.y,b.y,c.y) < minY || Math.min(a.y,b.y,c.y) > maxY) continue;
          const poly = clip(clip([a,b,c], minY, true), maxY, false);
          for (const p of poly) points.push({ x: p.x, z: p.z });
        }
        const poly = convexHull2D(points);
        if (poly.length >= 3) result.push({ poly, minY, maxY });
      }
    }
  }
  return result;
}
