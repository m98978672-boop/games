/* Проверки К11: как вода и дома читаются в масштабе (§52).
   Пять правил по 20 значений — ширина русла, квота генерализации, видимость русла,
   глубина суши и обводка дома. */
import assert from 'node:assert/strict';
import { riverStrokePx, riverKeepCount, riverVisibleAt } from '../src/rivers2d.js';
import { landDepth01, heightKm, settlements } from '../src/world2d.js';
import { buildingOutlinePx } from '../src/city2d.js';

const near = (a, b, eps = 1e-9) => Math.abs(a - b) <= eps;

/* F-146: ширина русла в пикселях: w = widthM/1000 · s, кромка 0.9/0.45, потолок 6 px */
{
  let n = 0;
  for (let i = 0; i < 20; i++) {
    const widthM = 3 + i * 31;                 // 3…592 м
    const s = 0.13 * Math.pow(1.35, i);        // 0.13…30 px/км
    const px = (widthM / 1000) * s;
    const main = i % 3 === 0;
    const want = Math.min(6, Math.max(main ? 0.9 : 0.45, px));
    assert.ok(near(riverStrokePx(widthM, s, main), want), 'ширина русла ' + widthM + ' м при ' + s.toFixed(2) + ' px/км');
    assert.ok(riverStrokePx(widthM, s, main) <= 6, 'не толще 6 px');
    assert.ok(riverStrokePx(widthM, s, main) >= 0.45, 'не тоньше 0.45 px');
    n++;
  }
  assert.equal(n, 20, 'двадцать значений ширины русла');
  // русло в 600 м на обзоре страны не должно быть шире 1 px — это и были «синие круги»
  assert.ok(riverStrokePx(600, 0.13, false) <= 1, 'на обзоре река тоньше пикселя');
  assert.ok(riverStrokePx(600, 30, true) === 6, 'в глубоком зуме потолок 6 px');
}

/* F-147: квота русел по масштабу — 420 / 1100 / 2400 / 4400 / все */
{
  const steps = [
    [0.1, 420], [0.29, 420], [0.3, 1100], [0.5, 1100], [0.79, 1100],
    [0.8, 2400], [1.2, 2400], [1.99, 2400], [2, 4400], [3.5, 4400],
    [5.99, 4400], [6, 5499], [8, 5499], [12, 5499], [20, 5499],
    [0.13, 420], [1.5, 2400], [4, 4400], [0.6, 1100], [30, 5499]
  ];
  let n = 0;
  for (const [s, want] of steps) {
    assert.equal(riverKeepCount(s, 5499), want, 'квота русел при ' + s + ' px/км');
    n++;
  }
  assert.equal(n, 20, 'двадцать значений квоты');
  assert.equal(riverKeepCount(0.1, 100), 100, 'квота не больше числа русел');
}

/* F-148: русло видно — ранг в квоте, а на обзоре ещё и длина от 30 точек (~90 км) */
{
  let n = 0;
  for (let i = 0; i < 20; i++) {
    const s = [0.13, 0.5, 1.5, 4][i % 4];
    const keep = riverKeepCount(s, 5499);
    const rank = [0, 39, 40, 419, 420, 1099, 1100, 2399, 2400, 4399][i % 10];
    const points = [5, 29, 30, 80, 217][i % 5];
    const want = rank < keep && !(s < 0.3 && points < 30);
    assert.equal(riverVisibleAt(s, points, rank, keep), want,
      'видимость: s=' + s + ', ранг=' + rank + ', точек=' + points);
    n++;
  }
  assert.equal(n, 20, 'двадцать значений видимости');
  assert.equal(riverVisibleAt(0.13, 12, 3, 420), false, 'короткий ручей на обзоре скрыт');
  assert.equal(riverVisibleAt(0.13, 200, 3, 420), true, 'длинное русло на обзоре видно');
}

/* F-149: глубина суши: 0 у уреза и в море, 1 в глубине; монотонна */
{
  let n = 0, prev = -1;
  for (let i = 0; i < 20; i++) {
    const h = -250 + i * 40;                    // −250…510 м
    const d = landDepth01(h);
    assert.ok(d >= 0 && d <= 1, 'глубина суши в 0…1 при h=' + h);
    assert.ok(d >= prev - 1e-12, 'глубина суши не убывает: h=' + h);
    prev = d;
    if (h <= -30) assert.equal(d, 0, 'в море глубина суши 0');
    if (h >= 340) assert.equal(d, 1, 'в глубине материка 1');
    n++;
  }
  assert.equal(n, 20, 'двадцать значений глубины суши');
  assert.ok(landDepth01(0) < 0.05, 'у самого уреза рельеф ещё плоский');
}

/* F-150: обводка дома — 0 до 1.6 px, 0.35 до 3 px, 0.6 дальше */
{
  let n = 0;
  for (let i = 0; i < 20; i++) {
    const span = 0.3 + i * 0.45;                // 0.3…8.85 px
    const want = span >= 3 ? 0.6 : span >= 1.6 ? 0.35 : 0;
    assert.ok(near(buildingOutlinePx(span), want), 'обводка дома при ' + span.toFixed(2) + ' px');
    n++;
  }
  assert.equal(n, 20, 'двадцать значений обводки');
  assert.equal(buildingOutlinePx(1.59), 0, 'мельче 1.6 px не обводим');
  assert.equal(buildingOutlinePx(3), 0.6, 'с 3 px рисуем крышу');
}

/* Связка с миром: поселения стоят на суше, а в глубине материка нет «синих луж» —
   вода проступает только у настоящего берега (R-52.2, R-52.3).
   Двадцать точек в глубине суши: все восемь соседей на 20 км — тоже суша. */
{
  const towns = settlements();
  assert.equal(towns.length, 120, 'сто двадцать поселений');
  for (const t of towns) assert.ok(heightKm(t.x, t.y) > 0, 'поселение на суше: ' + t.name);

  let checked = 0, puddles = 0;
  for (let gy = -7; gy <= 7 && checked < 20; gy++) {
    for (let gx = -7; gx <= 7 && checked < 20; gx++) {
      const x = gx * 400, y = gy * 400;
      const h = heightKm(x, y);
      if (h < 400) continue;                    // берём только глубину материка
      for (const [dx, dy] of [[20, 0], [-20, 0], [0, 20], [0, -20], [14, 14], [-14, 14], [14, -14], [-14, -14]]) {
        if (heightKm(x + dx, y + dy) < 0) puddles++;
      }
      checked++;
    }
  }
  assert.equal(checked, 20, 'двадцать точек в глубине суши');
  assert.equal(puddles, 0, 'ни одной «лужи» в глубине материка');
}

console.log('OK: 5 групп проверок чтения карты (§52, F-146…F-150 по 20 значений)');
