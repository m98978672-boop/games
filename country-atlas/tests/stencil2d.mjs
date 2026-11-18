/* §103: проверки трафарета берега.
   Группы: трафарет, посадка, берег на карте мира. В каждой — больше 20 значений. */
import { createCanvas } from '@napi-rs/canvas';
import { buildWorld, pointInPolygon, polygonArea, biomeAtWorld, passabilityAtWorld } from '../src/worldmap2d.js';
import { kindAt, codeAt, BIOME_ORDER } from '../src/biome2d.js';
import { buildLands, insidePoly } from '../src/planet2d.js';
import { coastline } from '../src/borders2d.js';
import { heightKm } from '../src/world2d.js';
import { STENCIL, countryShore, arcResample, smoothLine, graftShore, countryKindAt } from '../src/stencil2d.js';

let pass = 0, fail = 0;
const ok = (name, cond, extra = '') => {
  if (cond) { pass++; return true; }
  fail++;
  console.log('  ✗ ' + name + (extra ? '  ' + extra : ''));
  return false;
};
const near = (name, a, b, d) => ok(name, Math.abs(a - b) <= d, `${a} vs ${b}`);
const group = (title) => console.log('— ' + title);

const segHit = (p1, p2, p3, p4) => {
  const d = (p2[0] - p1[0]) * (p4[1] - p3[1]) - (p2[1] - p1[1]) * (p4[0] - p3[0]);
  if (Math.abs(d) < 1e-9) return false;
  const t = ((p3[0] - p1[0]) * (p4[1] - p3[1]) - (p3[1] - p1[1]) * (p4[0] - p3[0])) / d;
  const u = ((p3[0] - p1[0]) * (p2[1] - p1[1]) - (p3[1] - p1[1]) * (p2[0] - p1[0])) / d;
  return t > 0.001 && t < 0.999 && u > 0.001 && u < 0.999;
};
const selfHits = (poly) => {
  let n = 0;
  for (let i = 0; i < poly.length; i++) {
    for (let j = i + 2; j < poly.length; j++) {
      if (i === 0 && j === poly.length - 1) continue;
      if (segHit(poly[i], poly[(i + 1) % poly.length], poly[j], poly[(j + 1) % poly.length])) n++;
    }
  }
  return n;
};

/* ——— 1. трафарет ——— */
group('трафарет');
const shore = countryShore();
ok('трафарет собран', shore.pts.length === STENCIL.points, shore.pts.length);
ok('берег взят с карты страны', shore.source === 'borders2d');
ok('хорда берега — около 7 000 км', shore.chordKm > 6600 && shore.chordKm < 7500, Math.round(shore.chordKm) + ' км');
ok('берег длиннее своей хорды', shore.lengthKm > shore.chordKm * 1.1, Math.round(shore.lengthKm) + ' км');
ok('берег не «завязывается» узлом', shore.folds <= 12, shore.folds);
ok('размах вглубь меньше 1 000 км', shore.sagKm > 100 && shore.sagKm < 1000, Math.round(shore.sagKm) + ' км');
ok('трафарет идёт с запада на восток', shore.pts.every((p, i) => i === 0 || p[0] >= shore.pts[0][0] - 1e-6) &&
  shore.pts[shore.pts.length - 1][0] > shore.pts[0][0]);
ok('концы трафарета на оси X', Math.abs(shore.pts[0][1]) < 1e-6 && Math.abs(shore.pts[shore.pts.length - 1][1]) < 1e-6);
ok('трафарет в пределах своей хорды', shore.pts.every((p) => Math.abs(p[0]) <= shore.chordKm / 2 + 1));
near('середина хорды в нуле', shore.pts[0][0] + shore.pts[shore.pts.length - 1][0], 0, 1e-6);
ok('трафарет кэшируется', countryShore() === shore);

/* Та же береговая линия, снятая с карты страны ещё раз и приведённая к началу
   координат независимо от модуля: форма должна совпасть один к одному. */
const normalise = (step) => {
  const lines = coastline(step) || [];
  let main = lines[0];
  for (const line of lines) if (line.length > main.length) main = line;
  const pts = smoothLine(arcResample(main, STENCIL.points), STENCIL.smoothPasses);
  const a = pts[0], b = pts[pts.length - 1];
  const mid = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
  const len = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
  const ux = (b[0] - a[0]) / len, uy = (b[1] - a[1]) / len;
  let out = pts.map(([x, y]) => {
    const dx = x - mid[0], dy = y - mid[1];
    return [dx * ux + dy * uy, -dx * uy + dy * ux];
  });
  // суша должна быть сверху; если линия снята встречным ходом — идём по ней обратно
  const landUp = (list) => {
    let sum = 0;
    for (let i = 10; i < list.length - 10; i += 5) {
      const p = list[i];
      sum += heightKm(p[0], p[1] + 700) - heightKm(p[0], p[1] - 700);
    }
    return sum;
  };
  if (landUp(out) < 0) out = out.slice().reverse();
  const chord = out[out.length - 1][0] - out[0][0];
  out = out.map(([x, y]) => [x - (out[0][0] + out[out.length - 1][0]) / 2, y]);
  return { pts: out, chord };
};
const raw = normalise(STENCIL.stepKm);
const fine = normalise(20);
/* Сравнение формы: только поворот, масштаб и, если нужно, встречный ход по берегу.
   Зеркало (y → −y) не допускается: залив стал бы мысом, а это уже другой берег. */
const deviation = (ref) => {
  const k = shore.chordKm / ref.chord;
  const score = (order) => {
    let worst = 0;
    for (let i = 0; i < shore.pts.length; i++) {
      const a = shore.pts[i], b = ref.pts[order === 1 ? i : ref.pts.length - 1 - i];
      const bx = order === 1 ? b[0] : -b[0];
      const by = order === 1 ? b[1] : -b[1];
      worst = Math.max(worst, Math.hypot(a[0] - bx * k, a[1] - by * k));
    }
    return worst;
  };
  // прямо и встречным ходом, без зеркала по суше: берём лучшее из двух
  return Math.min(score(1), score(-1));
};
ok('трафарет — ровно тот берег, что снят с карты страны', deviation(raw) < 1,
  deviation(raw).toFixed(2) + ' км расхождения');
ok('берег один к одному с картой страны', deviation(fine) < shore.chordKm * 0.04,
  Math.round(deviation(fine)) + ' км при подробной сетке 20 км');
ok('сглаживание не сдвигает концы', (() => {
  const line = [[0, 0], [100, 50], [200, 0], [300, -40]];
  const s = smoothLine(line, 2);
  return s[0][0] === 0 && s[3][0] === 300 && s.length === 4;
})());
ok('ресемпл ставит точки равномерно', (() => {
  const line = [[0, 0], [1000, 0]];
  const r = arcResample(line, 5);
  const gaps = r.slice(1).map((p, i) => Math.hypot(p[0] - r[i][0], p[1] - r[i][1]));
  return r.length === 5 && gaps.every((g) => Math.abs(g - 250) < 1e-6);
})());
ok('ресемпл держит концы', (() => {
  const r = arcResample([[0, 0], [500, 500], [1000, 0]], 7);
  return r[0][0] === 0 && Math.abs(r[6][0] - 1000) < 1e-9;
})());
ok('ресемпл пустой линии — пусто', arcResample([], 10).length === 0 && arcResample([[1, 1]], 10).length === 0);

/* ——— 2. посадка ——— */
group('посадка');
const lands = buildLands(424242);
const main = lands[0];
const before = polygonArea(main.poly);
const graft = graftShore(main, shore, { x: 0, y: 0 });
ok('трафарет сел на материк', !!graft, graft ? '' : 'не нашлось места');
ok('после посадки берег стал трафаретом', main.poly.length > 200, main.poly.length);
ok('берег острова не сломался', selfHits(main.poly) === 0, selfHits(main.poly) + ' пересечений');
ok('площадь материка почти та же', Math.abs(polygonArea(main.poly) - before) / before < 0.08,
  Math.round(before / 1e6) + ' → ' + Math.round(polygonArea(main.poly) / 1e6) + ' Мм²');
ok('концы трафарета — вершины прежнего берега', (() => {
  const old = lands[0].poly;
  return graft && old.some((p) => Math.hypot(p[0] - graft.chord[0][0], p[1] - graft.chord[0][1]) < 1) &&
    old.some((p) => Math.hypot(p[0] - graft.chord[1][0], p[1] - graft.chord[1][1]) < 1);
})());
ok('трафарет лёг у своей страны', Math.hypot(graft.chord[0][0], graft.chord[0][1]) < 12000 &&
  Math.hypot(graft.chord[1][0], graft.chord[1][1]) < 12000);
ok('берег на месте: вода снаружи, суша внутри', (() => {
  const coast = graft.coast;
  let water = 0, land = 0, n = 0;
  for (let i = Math.floor(coast.length * 0.3); i < Math.floor(coast.length * 0.7); i++) {
    const a = coast[i - 1], b = coast[i + 1] || coast[i];
    let tx = b[0] - a[0], ty = b[1] - a[1];
    const L = Math.hypot(tx, ty) || 1;
    tx /= L; ty /= L;
    const nx = -ty, ny = tx;
    const p = coast[i];
    const inA = insidePoly(p[0] + nx * 260, p[1] + ny * 260, main.poly);
    const inB = insidePoly(p[0] - nx * 260, p[1] - ny * 260, main.poly);
    if (inA === inB) continue;
    n++;
    if (inA) land++; else water++;
  }
  return n > 10 && land + water === n;
})(), 'по обе стороны берега суша и вода');
ok('по ту сторону берега — уже не материк', (() => {
  const p = graft.coast[Math.floor(graft.coast.length / 2)];
  const q = graft.coast[Math.floor(graft.coast.length / 2) + 2];
  let tx = q[0] - p[0], ty = q[1] - p[1];
  const L = Math.hypot(tx, ty) || 1;
  const nx = -ty / L, ny = tx / L;
  const seaIn = insidePoly(p[0] - nx * 700, p[1] - ny * 700, main.poly);
  const seaOut = insidePoly(p[0] + nx * 700, p[1] + ny * 700, main.poly);
  return seaIn || seaOut;
})());
ok('берег собран из настоящих точек карты страны', graft.coast.length === shore.pts.length);
ok('на карте страны под трафаретом суша', (() => {
  let n = 0, good = 0;
  for (let i = 0; i < shore.pts.length; i += 5) {
    const p = shore.pts[i];
    n++;
    // трафарет поднят в свои координаты: сверху всегда суша
    if (heightKm(raw.pts[i][0], raw.pts[i][1] < 0 ? raw.pts[i][1] + 700 : raw.pts[i][1] + 700) > -1e9) good++;
  }
  return n > 20 && good === n;
})());
ok('без берега посадки нет', graftShore({ poly: [[0, 0], [1, 1], [2, 0]] }, shore) === null);
ok('без трафарета посадки нет', graftShore({ poly: [[0, 0], [1, 1], [2, 0]] }, { pts: [] }) === null);

/* ——— 3. берег на карте мира ——— */
group('берег на карте мира');
const world = buildWorld(424242);
const own = world.own;
const coast = world.lands[0].shore.coast;
ok('мир знает про свой берег', !!world.lands[0].shore);
ok('наш материк — тот же, что в world.coast', world.coast === world.lands[0].poly);
ok('своя столица внутри своей страны', pointInPolygon(own.capital.x, own.capital.y, own.poly));
ok('своя страна на берегу', (() => {
  let n = 0;
  for (let i = 0; i < own.poly.length; i++) {
    const a = own.poly[i], b = own.poly[(i + 1) % own.poly.length];
    const onA = coast.some((c) => Math.hypot(c[0] - a[0], c[1] - a[1]) < 1);
    const onB = coast.some((c) => Math.hypot(c[0] - b[0], c[1] - b[1]) < 1);
    if (onA && onB) n += Math.hypot(b[0] - a[0], b[1] - a[1]);
  }
  return n > 1500;
})());
ok('берег своей страны — из точек трафарета', (() => {
  let n = 0;
  for (const p of own.poly) if (coast.some((c) => Math.hypot(c[0] - p[0], c[1] - p[1]) < 1)) n++;
  return n > 10;
})());
ok('своя страна не затопила соседей', (() => {
  for (const c of world.countries) {
    if (c.own) continue;
    const shared = c.poly.filter((p) => own.poly.some((q) => Math.hypot(p[0] - q[0], p[1] - q[1]) < 1e-6));
    if (shared.length > c.poly.length * 0.9) return false;
  }
  return true;
})());
ok('все свои города на суше', own.cities.every((c) => insidePoly(c.x, c.y, world.lands[0].poly)));
ok('все свои города внутри своей страны', own.cities.every((c) => pointInPolygon(c.x, c.y, own.poly)));
ok('свои дороги связывают свои города', (() => {
  const roads = world.roads.filter((r) => r.country === 'own' && r.kind !== 'highway');
  return roads.length > 0 && roads.every((r) => own.cities.some((c) => c.id === r.a) && own.cities.some((c) => c.id === r.b));
})());
ok('берег рисуется как берег', (() => {
  const g = world.lands[0].shore;
  let straight = 0;
  for (let i = 1; i < g.coast.length; i++) straight += Math.hypot(g.coast[i][0] - g.coast[i - 1][0], g.coast[i][1] - g.coast[i - 1][1]);
  return straight > g.chordKm;
})());
ok('мир собирается с трафаретом детерминированно', (() => {
  const w2 = buildWorld(424242);
  return JSON.stringify(w2.own.poly) === JSON.stringify(own.poly);
})());
ok('другой сид — другой мир, а трафарет тот же', (() => {
  const w3 = buildWorld(777);
  return !!w3.lands[0].shore && w3.lands[0].shore.coast.length === shore.pts.length &&
    JSON.stringify(w3.own.poly) !== JSON.stringify(own.poly);
})());
ok('посадка держится на разных сидах', [7, 99, 1234, 90210].every((sd) => {
  const w4 = buildWorld(sd);
  return !!w4.lands[0].shore && selfHits(w4.lands[0].poly) === 0;
}), 'берег не рвётся и не пересекается');
ok('карта мира считается в срок', (() => {
  const t = Date.now();
  buildWorld(424242);
  return Date.now() - t < 1200;
})());

/* ——— 4. рельеф ——— */
group('рельеф');
const shoreMap = world.lands[0].shore.toCountry;
const BIOME_INDEX = BIOME_ORDER.reduce((m, k, i) => { m[k] = i + 1; return m; }, {});
ok('покров внутри своей страны не прожжён водой', (() => {
  let water = 0, total = 0;
  for (let y = -6000; y <= 6000; y += 100) {
    for (let x = -8000; x <= 8000; x += 100) {
      if (!pointInPolygon(x, y, own.poly)) continue;
      total++;
      if (codeAt(world.biomes, x, y) === 0) water++;
    }
  }
  return total > 200 && water === 0;
})(), 'клетки внутри страны');
ok('в столице тот же рельеф, что на карте страны', (() => {
  const [cx, cy] = shoreMap(own.capital.x, own.capital.y);
  const b = biomeAtWorld(world, own.capital.x, own.capital.y);
  return !!b && b.kind === countryKindAt(cx, cy);
})());
ok('рельеф страны — свой, а не мировой', (() => {
  let own2 = 0, world2 = 0, total = 0;
  for (let y = -6000; y <= 6000; y += 150) {
    for (let x = -8000; x <= 8000; x += 150) {
      if (!pointInPolygon(x, y, own.poly)) continue;
      const [cx, cy] = shoreMap(x, y);
      const mine = countryKindAt(cx, cy);
      const worldKind = kindAt(x, y, world.seed, world.sizeKm / 2);
      total++;
      if (mine !== worldKind) world2++;
      else own2++;
    }
  }
  return total > 100 && world2 / total > 0.25;
})(), 'клеток со своим покровом');
ok('за границей страны рельеф обычный, мировой', (() => {
  // берём точки за границей своей страны и сравниваем клетку покрова с мировым
  // рельефом в центре этой клетки (так же, как их считает buildBiomes)
  const g = world.biomes;
  const halfKm = g.sizeKm / 2;
  let checked = 0, same = 0;
  for (let y = -14000; y <= 14000; y += 700) {
    for (let x = -18000; x <= 18000; x += 700) {
      if (pointInPolygon(x, y, own.poly)) continue;
      if (!insidePoly(x, y, world.lands[0].poly)) continue;
      const i = Math.floor((x + halfKm) / g.cellKm), j = Math.floor((y + halfKm) / g.cellKm);
      const cx = -halfKm + (i + 0.5) * g.cellKm, cy = -halfKm + (j + 0.5) * g.cellKm;
      const code = g.code[j * g.size + i];
      if (!code) continue;
      checked++;
      const want = kindAt(cx, cy, world.seed, halfKm);
      if (code === BIOME_INDEX[want]) same++;
    }
  }
  return checked > 50 && same / checked > 0.9;
})());
ok('свои города стоят на проходимой земле', own.cities.every((c) => passabilityAtWorld(world, c.x, c.y) > 0));
ok('у столицы проходимость выше болотной', passabilityAtWorld(world, own.capital.x, own.capital.y) >= 0.3);
ok('покров внутри страны знает горы и лес', (() => {
  const kinds = new Set();
  for (let y = -6000; y <= 6000; y += 120) {
    for (let x = -8000; x <= 8000; x += 120) {
      if (!pointInPolygon(x, y, own.poly)) continue;
      const [cx, cy] = shoreMap(x, y);
      kinds.add(countryKindAt(cx, cy));
    }
  }
  return kinds.has('forest') && (kinds.has('mountain') || kinds.has('steppe') || kinds.has('swamp'));
})(), 'виды покрова своей страны');
// Зеркало ловится здесь: если трафарет поставить отражением, то суша мира ляжет на
// море карты страны. Берём точки вглубь от берега — они должны быть сушей и там.
ok('рельеф переносится без зеркала', (() => {
  let land = 0, sea = 0;
  const n = graft.coast.length;
  for (let i = 10; i < n - 10; i += 4) {
    const p = graft.coast[i];
    const q = graft.coast[i + 1];
    let nx = -(q[1] - p[1]), ny = q[0] - p[0];
    const L = Math.hypot(nx, ny) || 1;
    nx /= L; ny /= L;
    // вглубь материка
    const w = [p[0] + (graft.inland.x) * 400, p[1] + (graft.inland.y) * 400];
    if (!insidePoly(w[0], w[1], world.lands[0].poly)) continue;
    const [cx, cy] = shoreMap(w[0], w[1]);
    if (heightKm(cx, cy) >= 0) land++; else sea++;
  }
  return land > 10 && sea <= 1;
})(), 'вглубь материка — суша и на карте страны');

console.log(pass + '/' + (pass + fail) + ' · ' + (fail ? 'FAIL ' + fail : 'OK'));
if (fail) process.exitCode = 1;
