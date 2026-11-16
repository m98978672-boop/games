/* Ночь §14 в 2D — не серое наложение, а состояние мира.

   Днём карта читается цветом земли, ночью — светом: в окнах горят лампы, улицы светятся
   пятнами фонарей, по дорогам идут конусы фар, у поезда впереди прожектор, на полосе горят
   огни ВПП, у судов — ходовые огни, у самолётов мигают стробы, а над миром видно звёзды.
   Всё считается от игрового времени и хешей, поэтому мигание детерминировано (R-16.1).

   Раньше свет считался заново каждый кадр: для каждого квартала пересчитывались хеши,
   координаты окон и фонарей. §98 кэширует эти точки на городе — они неподвижны, меняется
   только порог «горит / не горит». Картинка от этого не меняется ни на пиксель. */

export const NIGHT = {
  veilMax: 0.74,          // самая плотная ночь
  shade: 0.62,            // насколько гасим цвет земли под наложением
  starCount: 320,         // звёзд над миром
  starFrom: 0.55,         // сила ночи, с которой проступают звёзды
  windowGlowM: 7,         // световое пятно окна, м
  lampPoolM: 26,          // пятно фонаря, м
  lampGlowFrom: 0.25,     // доля включённых фонарей, с которой рисуем пятна
  beamM: 58,              // длина конуса фар, м
  beamHalf: 0.34,         // половина угла фар, рад
  beamFrom: 0.4,          // сила ночи, с которой видны фары
  trainBeamM: 420,        // прожектор поезда, м
  runwayM: 62,            // шаг огней ВПП, м
  runwayFrom: 0.3,
  strobeSec: 1.4,         // период строба, с реального времени
  lighthouseSec: 9,       // оборот луча маяка, с реального времени
  lighthouseM: 26,        // длина луча маяка, км
  maxDots: 2400           // сколько точек света рисуем в кадре
};

const TAU = Math.PI * 2;

/* Тот же хеш, что в карте: свет в квартале не мигает от кадра к кадру. */
export function h01(n) {
  let x = Math.imul(n | 0, 2246822519) ^ 0x9e3779b9;
  x = Math.imul(x ^ (x >>> 15), 3266489917);
  return ((x ^ (x >>> 13)) >>> 0) / 4294967296;
}

/* F-225: сколько света в кадре. 1 — глухая ночь, 0 — день. */
export function nightAmount(light) {
  if (!light) return 0;
  const glow = 1 - Math.max(0, Math.min(1, light.strength));
  return Math.max(0, Math.min(1, glow * 1.12));
}

/* F-226: точки света города — окна и фонари. Считаются один раз и живут на городе;
   координаты в километрах мира, чтобы рисовать их при любом масштабе. */
export function lightPoints(city, index) {
  if (city.__lights) return city.__lights;
  city.__lights = buildLightPoints(city, index);
  return city.__lights;
}

/* Тот же расчёт без кэша — им пользуется тест, чтобы доказать равенство. */
export function buildLightPoints(city, index) {
  const windows = [];
  const lamps = [];
  const blocks = (city && city.blocks) || [];
  const i = index;
  for (let b = 0; b < blocks.length; b++) {
    const bl = blocks[b];
    if (bl.zone === 'park') continue;
    const c = bl.corners;
    let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
    for (const q of c) {
      if (q[0] < x0) x0 = q[0]; if (q[0] > x1) x1 = q[0];
      if (q[1] < y0) y0 = q[1]; if (q[1] > y1) y1 = q[1];
    }
    const on = h01(b * 131 + i * 17);
    const pts = [];
    for (let k = 0; k < 2; k++) {
      const fx = 0.2 + 0.6 * h01(b * 977 + k * 37 + i * 5);
      const fy = 0.2 + 0.6 * h01(b * 613 + k * 91 + i * 29);
      pts.push({ x: x0 + (x1 - x0) * fx, y: y0 + (y1 - y0) * fy, h: h01(b * 541 + k * 233 + i * 13) });
    }
    windows.push({ x0, y0, x1, y1, on, pts, center: bl.zone === 'center' });
  }
  const streets = (city && city.streets) || [];
  for (const st of streets) {
    if (!st.major || !st.pts || st.pts.length < 2) continue;
    for (let k = 1; k < st.pts.length; k++) {
      const [x1, y1] = st.pts[k - 1], [x2, y2] = st.pts[k];
      const len = Math.hypot(x2 - x1, y2 - y1);
      for (let d = 0.18; d < len; d += 0.18) {
        const u = d / len;
        lamps.push({ x: x1 + (x2 - x1) * u, y: y1 + (y2 - y1) * u });
      }
    }
  }
  return { windows, lamps };
}

/* F-227: звёзды над миром. Экранные координаты 0…1 и яркость — от одного сида. */
export function starField(seed = 20260101, count = NIGHT.starCount) {
  let s = seed >>> 0;
  const next = () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 4294967296;
  };
  const out = [];
  for (let k = 0; k < count; k++) {
    out.push({ u: next(), v: next(), b: 0.25 + 0.75 * next(), tw: next() * TAU });
  }
  return out;
}

/* F-228: конус фар — треугольник от носа машины вперёд по курсу. */
export function headlightPoly(x, y, angle, scale, lenM = NIGHT.beamM, half = NIGHT.beamHalf) {
  const len = (lenM / 1000) * scale;
  const near = 0.9;
  const p = (a, d) => [x + Math.cos(angle + a) * d, y + Math.sin(angle + a) * d];
  return [p(0, near), p(half, len), p(-half, len), p(0, near)];
}

/* F-229: строб самолёта мигает по реальному времени, а не по кадру. */
export function strobeOn(seconds) {
  return (Math.floor(seconds / (NIGHT.strobeSec / 2)) % 2) === 0;
}

/* F-230: маяк в порту — луч вращается по кругу за lighthouseSec. */
export function lighthouseAngle(seconds) {
  return ((seconds % NIGHT.lighthouseSec) / NIGHT.lighthouseSec) * TAU;
}

/* Сколько окон и фонарей рисуем при таком свете и масштабе. Одинаково для кэша и теста. */
export function lightsBudget(artificial, scale, citiesInFrame = 1) {
  const windows = artificial ? artificial.windows : 0;
  const lamps = artificial ? artificial.lamps : 0;
  const radiusPx = scale >= 60 ? 1.1 : scale >= 20 ? 0.8 : 0.55;
  const perCity = Math.max(60, Math.round(1600 / Math.max(1, citiesInFrame)));
  return {
    windows, lamps, radiusPx, perCity,
    pools: scale >= 18 && lamps >= NIGHT.lampGlowFrom && windows > 0.4,
    windowsFrom: windows * 0.85,
    dotCount: windows > 0.6 ? 2 : 1
  };
}

/* Сколько звёзд видно при такой ночи: 0 днём, 1 в глухую ночь. */
export function starsVisibility(night) {
  const k = (night - NIGHT.starFrom) / Math.max(1e-6, 1 - NIGHT.starFrom);
  return Math.max(0, Math.min(1, k));
}

/* Цвет ночи: глубокий сине-фиолетовый, без зелени. */
export function nightVeilCss(night) {
  const a = Math.min(NIGHT.veilMax, night * NIGHT.veilMax);
  const r = 6 + 10 * (1 - night), g = 10 + 16 * (1 - night), b = 34 + 22 * (1 - night);
  return 'rgba(' + Math.round(r) + ',' + Math.round(g) + ',' + Math.round(b) + ',' + a.toFixed(3) + ')';
}
