// Геометрическая герметичность всех исходных контуров: без рендера и без случайности.
import assert from 'node:assert/strict';
import { loadConfig } from '../src/core/config.js';
import { Walls } from '../src/sim/walls.js';

const cfg = await loadConfig();
let rings = 0, checks = 0;
for (const [type, outline] of Object.entries(cfg.outlines)) {
  if (outline.mode !== 'ring') continue;
  rings++;
  const half = outline.size / 2;
  for (const side of ['north', 'east', 'south', 'west']) {
    const horizontal = side === 'north' || side === 'south';
    const fixed = side === 'north' || side === 'west' ? -half : half;
    const pieces = [
      ...outline.segments.filter((s) => s.side === side).map((s) => ({ points: s.points, name: s.id })),
      ...outline.openings.filter((o) => o.side === side).map((o) => ({ points: [o.p1, o.p2], name: o.id })),
    ];
    const intervals = pieces.map(({ points, name }) => {
      for (const p of points) assert.ok(Math.abs(p[horizontal ? 1 : 0] - fixed) < 0.02, `${type}/${side}/${name}: не на стороне`);
      const a = points[0][horizontal ? 0 : 1], b = points[1][horizontal ? 0 : 1];
      return { start: Math.min(a, b), end: Math.max(a, b), name };
    }).sort((a, b) => a.start - b.start);
    assert.ok(intervals.length, `${type}/${side}: нет элементов`);
    let end = -half;
    for (const p of intervals) {
      assert.ok(Math.abs(p.start - end) < 0.02, `${type}/${side}/${p.name}: щель или наложение`);
      assert.ok(p.end > p.start, `${type}/${side}/${p.name}: нулевая длина`);
      end = p.end;
    }
    assert.ok(Math.abs(end - half) < 0.02, `${type}/${side}: сторона не замкнута`);
  }
  for (const seg of outline.segments) {
    const [[x1, y1], [x2, y2]] = seg.points;
    const length = Math.hypot(x2 - x1, y2 - y1);
    const nx = -(y2 - y1) / length, ny = (x2 - x1) / length;
    for (let i = 0; i < 1000; i++) {
      const t = (i + 0.5) / 1000, x = x1 + (x2 - x1) * t, y = y1 + (y2 - y1) * t;
      for (const sign of [-1, 1]) {
        assert.ok(Walls.segIntersect(x + nx * sign * 20, y + ny * sign * 20,
          x - nx * sign * 20, y - ny * sign * 20, x1, y1, x2, y2), `${type}/${seg.id}: пропущен луч`);
        checks++;
      }
    }
  }
}
assert.ok(rings > 0 && checks > 0);
console.log(`контуры: ${rings} зданий, ${checks} пересечений сегментов с двух сторон; щелей и наложений на сторонах нет`);
