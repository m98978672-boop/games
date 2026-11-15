/* Проверки разметки и развязок §8.9–8.14 (F-163…F-170). Каждая группа — 20 значений.
   Запуск: node tests/markings2d.mjs */
import assert from 'node:assert/strict';
import {
  MARK_LOD, JUNCTION_LOD, ASPHALT_LOD, LANES, MIN_RADIUS_M,
  markingWidthPx, dashPattern, roadFill, turnRadiusM, isSolidAt,
  junctionType, ringDiameterM, zebra, junctions, clipPolyline
} from '../src/markings2d.js';

let checks = 0;
const ok = (cond, msg) => { assert.ok(cond, msg); checks++; };

/* F-163: линия разметки в пикселях — не тоньше 1.1 px и растёт с масштабом */
{
  for (let i = 0; i < 20; i++) {
    const s = 5 + i * 40;
    const w = markingWidthPx(s);
    ok(w >= 1.1, 'разметка видна всегда: ' + s);
    if (s > 12000) ok(w > 1.1, 'в очень глубоком зуме линия толще минимума: ' + s);
    ok(markingWidthPx(s * 2) >= w, 'с ростом масштаба линия не тоньше: ' + s);
  }
  ok(markingWidthPx(600) === 1.1, 'при 600 px/км 15 см — это 0.09 px, работает минимум');
}

/* F-164: штрих и промежуток. Настоящая осевая — 4 м / 8 м, в пикселях не короче 1.6 / 2.2 */
{
  for (let i = 0; i < 20; i++) {
    const s = 10 + i * 50;
    const d = dashPattern(s);
    ok(d.stroke >= 1.6, 'штрих не короче пикселя: ' + s);
    ok(d.gap >= 2.2, 'промежуток не меньше двух пикселей: ' + s);
    ok(Math.abs(d.period - (d.stroke + d.gap)) < 1e-9, 'период = штрих + промежуток');
    if (s >= 1000) ok(Math.abs(d.gap / d.stroke - 2) < 0.01, 'на глубоком зуме 1:2 как в жизни: ' + s);
  }
  const deep = dashPattern(1000);
  ok(Math.abs(deep.stroke - 4) < 0.001, 'на 1000 px/км штрих ровно 4 м');
}

/* F-165: радиус поворота по трём точкам и сплошная на повороте (R-8.7, R-8.14) */
{
  const straight = turnRadiusM([0, 0], [1, 0], [2, 0]);
  ok(straight === Infinity, 'на прямой радиус бесконечен');
  const sharp = turnRadiusM([0, 0], [1, 0], [1, 1]);
  ok(sharp > 500 && sharp < 900, 'прямой угол из двух километровых отрезков — около 707 м: ' + Math.round(sharp));
  for (let i = 0; i < 20; i++) {
    const bendKm = 0.02 + i * 0.05;                    // чем больше излом, тем меньше радиус
    const r = turnRadiusM([0, 0], [1, 0], [1, bendKm]);
    ok(Number.isFinite(r) && r > 0, 'радиус конечен: ' + i);
    ok(isSolidAt('M', r) === (r < MIN_RADIUS_M.M), 'сплошная ровно там, где радиус меньше порога M: ' + i);
    ok(isSolidAt('L', r) === (r < MIN_RADIUS_M.L), 'у местной свой порог: ' + i);
  }
  ok(isSolidAt('M', 60) === true && isSolidAt('M', 120) === false, 'порог магистрали 80 м');
}

/* F-166: тип развязки по R-8.9 */
{
  const cases = [
    ['M', 'M', 90, 2, 'clover'], ['M', 'M', 40, 2, 'trumpet'], ['M', 'M', 90, 0.2, 'ring'],
    ['M', 'R', 90, 2, 'trumpet'], ['R', 'M', 90, 2, 'trumpet'], ['M', 'R', 30, 2, 'trumpet'],
    ['R', 'R', 90, 2, 'crossing'], ['L', 'G', 90, 2, 'crossing'],
    ['M', 'R', 80, 0.1, 'ring'], ['M', 'M', 61, 1, 'clover'], ['M', 'M', 59, 1, 'trumpet']
  ];
  for (const [a, b, ang, space, want] of cases) {
    ok(junctionType(a, b, ang, space) === want, 'тип развязки ' + a + '×' + b + ' ' + ang + '° ' + space + ' км = ' + want);
  }
  for (let i = 0; i < 20; i++) {
    const t = junctionType(i % 2 ? 'M' : 'R', i % 3 ? 'R' : 'L', 10 + i * 8, 0.1 + i * 0.2);
    ok(['clover', 'trumpet', 'ring', 'crossing'].includes(t), 'тип всегда из четырёх: ' + i);
    if (i % 2 === 0 && i % 3 === 0) ok(t === 'crossing', 'региональные и местные — обычный перекрёсток');
  }
}

/* F-167: диаметр кольца 26…60 м (R-8.11) */
{
  let prev = 0;
  for (let lanes = 1; lanes <= 20; lanes++) {
    const d = ringDiameterM(lanes);
    ok(d >= 26 && d <= 60, 'кольцо в допустимых 26…60 м при ' + lanes + ' полосах: ' + d);
    ok(d >= prev, 'чем больше полос, тем шире кольцо');
    prev = d;
  }
  ok(ringDiameterM(1) === 28 && ringDiameterM(4) === 46 && ringDiameterM(9) === 60, 'крайние значения');
}

/* F-168: «зебра» — только в зуме, полос 3…12, полосы одной ширины (R-8.14) */
{
  ok(zebra(MARK_LOD - 1, 21) === null, 'до порога перехода не рисуем');
  for (let i = 0; i < 20; i++) {
    const s = MARK_LOD + i * 30;
    const z = zebra(s, 5 + (i % 4) * 6);
    ok(z !== null, 'в глубоком зуме зебра есть: ' + s);
    ok(z.count >= 3 && z.count <= 12, 'полос от 3 до 12: ' + z.count);
    ok(z.stripe >= 0.8, 'полоса не тоньше 0.8 px');
    ok(Math.abs(z.widthPx - z.count * z.stripe * 2) < 1e-9, 'ширина зебры = полосы × 2');
  }
  ok(zebra(90, 21).count === 3, 'на 90 px/км в 21 м влезает три полосы');
}

/* R-58.1: асфальт только в глубоком зуме, классы различаются тоном */
{
  ok(roadFill('M', ASPHALT_LOD - 1) === null, 'до порога дорога остаётся картографической лентой');
  const tones = new Set();
  for (let i = 0; i < 20; i++) {
    const cls = ['M', 'R', 'L', 'G'][i % 4];
    const tone = roadFill(cls, ASPHALT_LOD + i * 20);
    ok(typeof tone === 'string' && tone.startsWith('rgba'), 'покрытие задано цветом: ' + cls);
    tones.add(tone);
  }
  ok(tones.size === 4, 'четыре класса — четыре тона покрытия');
  ok(LANES.M === 4 && LANES.R === 2 && LANES.G === 1, 'полосы по классам');
}

/* F-169: отсечение ломаной по кадру (R-58.2) — без него кадр в глубоком зуме встаёт */
{
  const inside = clipPolyline([[-5, -5], [5, 5], [5, -5]], -10, -10, 10, 10);
  ok(inside.length === 3, 'ломаная внутри кадра не меняется');
  const outside = clipPolyline([[-100, -100], [-50, -50]], -10, -10, 10, 10);
  ok(outside.length === 0, 'ломаная вне кадра отбрасывается');
  for (let i = 0; i < 20; i++) {
    const y = -40 + i * 4;
    const seg = clipPolyline([[-100, y], [100, y]], -10, -10, 10, 10);
    for (const p of seg) {
      ok(p[0] >= -10.0001 && p[0] <= 10.0001, 'точка отсечения в кадре по X: ' + i);
      ok(p[1] >= -10.0001 && p[1] <= 10.0001, 'точка отсечения в кадре по Y: ' + i);
    }
    if (y > -10 && y < 10) ok(seg.length === 2, 'горизонталь через кадр даёт один отрезок: ' + i);
    else ok(seg.length === 0, 'горизонталь мимо кадра пуста: ' + i);
  }
  ok(JUNCTION_LOD < MARK_LOD, 'значки развязок появляются раньше разметки');
}

/* F-170: узлы дорожной сети — общие концы рёбер (§8.9) */
{
  const mk = (cls, a, b) => ({ cls, points: [a, b] });
  const edges = [
    mk('M', [0, 0], [10, 0]), mk('M', [0, 0], [0, 10]),      // узел в нуле: 90°
    mk('R', [10, 0], [10, 8]), mk('L', [30, 30], [31, 31])    // одиночное ребро — не узел
  ];
  const js = junctions(edges);
  ok(js.length === 2, 'узлов два: в нуле и в (10,0)');
  const at0 = js.find((j) => Math.abs(j.x) < 0.5 && Math.abs(j.y) < 0.5);
  ok(at0 && at0.arms === 2, 'в нуле два подхода');
  ok(Math.abs(at0.angleDeg - 90) < 0.001, 'угол между дорогами прямой: ' + at0.angleDeg.toFixed(2));
  for (let i = 0; i < 20; i++) {
    const ang = (i / 20) * Math.PI;                            // вторая дорога под углом
    const net = [mk('M', [0, 0], [10, 0]), mk('R', [0, 0], [10 * Math.cos(ang), 10 * Math.sin(ang)])];
    const [j] = junctions(net);
    const want = 180 - Math.min(Math.abs(ang * 180 / Math.PI), 360 - Math.abs(ang * 180 / Math.PI));
    ok(Math.abs(j.angleDeg - want) < 0.05, 'угол между дорогами ' + want.toFixed(1) + '°, получено ' + j.angleDeg.toFixed(1));
    ok(j.arms === 2, 'две руки у узла: ' + i);
  }
}

console.log('OK: 8 групп проверок разметки и развязок §8.9–8.14 (F-163…F-170, проверок ' + checks + ')');
