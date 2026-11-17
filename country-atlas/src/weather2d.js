/* Погода 2D (§76): облака, дождь, снег, туман и ветер — не картинка поверх карты, а состояние
   мира. Поле погоды детерминировано сидом и временем: циклоны идут с запада на восток,
   в горах холоднее, на юге суше. Всё считается из шума, поэтому погода идёт и без нашего
   окна (догон §70.9 ничего не хранит), а рисунок можно кэшировать по минуте.

   Модуль ничего не знает о канве: рисует map2d, а здесь — числа и функции. */

import { noise2, fbm, heightKm, temperature01, moistureKm, WORLD2D } from './world2d.js';
import { packKey } from './dormant2d.js';
import { seasonOf, snowCover01, dayOfYearOf } from './light2d.js';

export const WEATHER = {
  seed: 907,
  cellKm: 190,              // размер ячейки поля погоды
  fronts: 5,                // сколько циклонов живёт в мире одновременно
  windKmh: 26,              // средний ветер
  windMaxKmh: 74,
  driftKmPerHour: 11,       // поле смещается за игровой час
  minTempC: -24,            // север и горы зимой
  maxTempC: 34,             // юг летом
  snowTempC: 0.6,           // ниже этой температуры осадки идут снегом
  kinds: ['clear', 'cloudy', 'rain', 'snow', 'fog'],
  visibilityKm: { clear: 48, cloudy: 26, rain: 9, snow: 3.6, fog: 1.4 },
  grip: { clear: 1, cloudy: 1, rain: 0.82, snow: 0.56, fog: 0.88 },   // доля от сухой дороги
  cloudAlpha: 0.16,         // тень облака на земле
  fogAlpha: 0.34,
  rainDrops: 260,           // капель на кадр в городе
  snowFlakes: 220,
  minFlyVisibilityKm: 3.0,  // ниже этого самолёты не садятся и не взлетают
  shipSlow: 0.78,           // суда в тумане
  cacheMinutes: 5           // шаг кэша поля: погода не меняется за 5 игровых минут
};

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const smooth = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };

/* F-237: смещение поля погоды за игровое время. Ветер дует с запада на восток, поле идёт
   вместе с ним — поэтому погода «приходит», а не мигает на месте. */
export function driftKm(minutes) {
  return (minutes / 60) * WEATHER.driftKmPerHour;
}

/* F-238: облачность в точке. 0 — чисто, 1 — сплошной фронт. */
export function cloud01(x, y, minutes) {
  const dx = driftKm(minutes);
  const n = fbm((x + dx) / WEATHER.cellKm, (y - dx * 0.12) / WEATHER.cellKm, WEATHER.seed, 3);
  return clamp(smooth(0.34, 0.72, n), 0, 1);
}

/* F-239: температура в точке. Юг теплее, горы холоднее, зимой сдвиг вниз. */
export function tempCAt(x, y, day) {
  const h = Math.max(0, heightKm(x, y));
  const t01 = temperature01(x, y, h);
  const winter = seasonOf(dayOfYearOf(day)) === 'winter';
  const shift = winter ? -9 : 0;
  return WEATHER.minTempC + (WEATHER.maxTempC - WEATHER.minTempC) * t01 + shift;
}

/* F-240: сила тумана. Утром и ночью, у воды и в низинах туман гуще; ветер его разгоняет. */
export function fog01(x, y, minutes, windKmh) {
  const hour = (minutes % 1440) / 60;
  const night = hour < 6 || hour > 22 ? 1 : hour < 9 ? 1 - (hour - 6) / 3 : 0;
  const h = heightKm(x, y);
  const lowland = h < 60 ? 1 : h < 300 ? 1 - (h - 60) / 240 : 0;
  const wet = moistureKm(x, y);
  const calm = clamp(1 - windKmh / (WEATHER.windMaxKmh * 1.1), 0, 1);
  return clamp(night * lowland * (0.35 + 0.65 * wet) * calm * 1.35, 0, 1);
}

/* F-241: ветер. Скорость и направление берутся из того же поля, что и облака. */
export function windAt(x, y, minutes) {
  const dx = driftKm(minutes);
  const n = noise2((x + dx) / (WEATHER.cellKm * 1.7), y / (WEATHER.cellKm * 1.7), WEATHER.seed + 51);
  const m = noise2((x + dx) / (WEATHER.cellKm * 1.1) + 13, y / (WEATHER.cellKm * 1.1) - 7, WEATHER.seed + 77);
  return {
    kmh: clamp(WEATHER.windKmh + (n - 0.5) * 2 * (WEATHER.windMaxKmh - WEATHER.windKmh) * 0.8,
      2, WEATHER.windMaxKmh),
    dirRad: (m - 0.5) * 0.9            // в основном с запада, с отклонениями
  };
}

/* F-242: вид погоды в точке. Осадки — там, где облачно; снег или дождь решает температура. */
export function weatherAt(x, y, minutes, day) {
  const cloud = cloud01(x, y, minutes);
  const tempC = tempCAt(x, y, day);
  const wind = windAt(x, y, minutes);
  const fog = fog01(x, y, minutes, wind.kmh);
  let kind = 'clear';
  let intensity = 0;
  if (cloud > 0.62) { kind = 'cloudy'; intensity = (cloud - 0.62) / 0.38 * 0.55; }
  if (cloud > 0.78) {
    const precip = (cloud - 0.78) / 0.22;
    kind = tempC < WEATHER.snowTempC ? 'snow' : 'rain';
    intensity = precip;
  }
  if (fog > 0.55 && intensity < 0.45) { kind = 'fog'; intensity = fog; }
  const base = WEATHER.visibilityKm[kind];
  const visibilityKm = clamp(base * (1 - 0.55 * intensity), 0.4, base);
  return {
    kind, intensity: clamp(intensity, 0, 1), cloud01: cloud, tempC, fog01: fog,
    windKmh: wind.kmh, dirRad: wind.dirRad, visibilityKm,
    grip: WEATHER.grip[kind], snow: kind === 'snow', rain: kind === 'rain'
  };
}

/* F-243: кэш поля на клетку и пятиминутку. Погода за 5 минут не меняется, а спрашивают её
   каждый кадр и для каждого города — без кэша это 0.31 мс на кадр. */
export function weatherCached(x, y, minutes, day, cache) {
  // F-268: ключ клетки — одно число (48 бит), а не строка из четырёх полей:
  // на 4000 записях это меньше памяти и быстрее сравнение.
  const key = packKey(Math.round(x / (WEATHER.cellKm / 2)), Math.round(y / (WEATHER.cellKm / 2)),
    Math.floor(minutes / WEATHER.cacheMinutes), day);
  if (cache && cache.map.has(key)) { cache.hits++; return cache.map.get(key); }
  const w = weatherAt(x, y, minutes, day);
  if (cache) {
    if (cache.map.size > 4000) cache.map.clear();
    cache.map.set(key, w);
    cache.misses++;
  }
  return w;
}

/* F-244: сколько дней подряд стоит зима и лежит снег — нужно рисунку и HUD. */
export function weatherStats(weather, minutes, day, towns) {
  const list = towns && towns.length ? towns : [{ x: 0, y: 0 }];
  let rain = 0, snow = 0, fog = 0, clear = 0, vis = 0, temp = 0, wind = 0;
  for (const t of list) {
    const w = weatherCached(t.x, t.y, minutes, day, weather || null);
    if (w.kind === 'rain') rain++;
    else if (w.kind === 'snow') snow++;
    else if (w.kind === 'fog') fog++;
    else if (w.kind === 'clear') clear++;
    vis += w.visibilityKm; temp += w.tempC; wind += w.windKmh;
  }
  const n = list.length;
  return {
    towns: n, rain, snow, fog, clear,
    visibilityKm: vis / n, tempC: temp / n, windKmh: wind / n,
    season: seasonOf(dayOfYearOf(day)), snowCover: snowCover01(dayOfYearOf(day))
  };
}

/* F-245: множитель скорости для машин и пешеходов. Мокрая дорога — минус 18 %, снег — 44 %. */
export function gripFactor(w) {
  return clamp(WEATHER.grip[w && w.kind ? w.kind : 'clear'] || 1, 0.4, 1);
}

/* F-246: самолёты не летают в туман. Возвращает true, если вышка закрыта. */
export function airfieldClosed(w) {
  return !!w && w.visibilityKm < WEATHER.minFlyVisibilityKm;
}

/* Тень облака: одна и та же картинка на все облака, поэтому рисуется один раз.
   Возвращает готовый спрайт (в браузере — канвас, в тестах — null). */
export function cloudSprite(makeCanvas, size = 128) {
  if (typeof makeCanvas !== 'function') return null;
  const c = makeCanvas(size);
  const ctx = c.getContext('2d');
  const g = ctx.createRadialGradient(size / 2, size / 2, size * 0.06, size / 2, size / 2, size / 2);
  g.addColorStop(0, 'rgba(12,18,26,0.55)');
  g.addColorStop(0.55, 'rgba(12,18,26,0.28)');
  g.addColorStop(1, 'rgba(12,18,26,0)');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
  ctx.fill();
  return c;
}

/* F-247: положение капли/снежинки в кадре. Без состояния и без аллокаций: всё из хеша
   номера капли и времени — поэтому дождь не «дёргается» и не зависит от fps. */
export function dropAt(i, w, h, seconds, windKmh, isSnow) {
  const a = noise2(i * 0.7391, 11.37, 1201);
  const b = noise2(i * 0.5713, 4.19, 1307);
  const speed = isSnow ? 34 + 46 * b : 900 + 620 * b;      // px в секунду
  const fall = (a * h + seconds * speed) % h;
  const slant = (windKmh / WEATHER.windMaxKmh) * (isSnow ? 0.55 : 0.32);
  const x = (b * w + fall * slant + w) % w;
  return { x, y: fall, len: isSnow ? 1.6 : 7 + 9 * a, drift: slant };
}
