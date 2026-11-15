/* Лёд и иней §5.11 в 2D. Зимой северные озёра и мелкие реки тайги встают, на юге — только
   иней по утрам, южное море открыто круглый год. Всё привязано к тому же календарю и солнцу,
   что и время суток (§14): снег идёт от `snowCover01`, иней — от высоты солнца на рассвете. */
import { snowCover01, sunAltitudeDeg, START_DAY_OF_YEAR } from './light2d.js';

/* Крайние широты страны: берег тёплого моря на юге, тайга на севере. */
export const ICE = {
  southY: -2400,        // южный берег: иней, но не лёд
  northY: 3200,         // тайга: лёд встаёт каждую зиму
  frostNorthMax: 0.55,  // севернее — иней не редкость, а норма, отдельно не показываем
  lakeFreezeNorth: 0.45,// с какой «северности» озёра встают
  lakeFreezeSnow: 0.2,  // и при каком снежном покрове
  riverFreezeWidthM: 120,  // шире — река не встаёт целиком (вода течёт подо льдом)
  riverFreezeSnow: 0.3,
  maxIceCm: 70,
  breakerMinAreaKm2: 800,  // ледокол работает на большом северном озере
  breakerSpeedKmH: 9
};

/* F-177: «северность» точки — 0 на тёплом берегу, 1 в тайге. */
export function north01(y) {
  return Math.max(0, Math.min(1, (y - ICE.southY) / (ICE.northY - ICE.southY)));
}

/* F-178: толщина льда, см. Растёт со снегом и северностью; у реки — тоньше, чем на озере. */
export function iceThicknessCm(snow01, north, river = false) {
  const base = ICE.maxIceCm * Math.max(0, Math.min(1, snow01)) * (0.15 + 0.85 * Math.max(0, Math.min(1, north)));
  return Math.round(base * (river ? 0.55 : 1) * 10) / 10;
}

/* F-179: озеро встало? Север + снег; мелкие озёра встают раньше крупных. */
export function lakeFreezes(lake, snow01, north) {
  if (north < ICE.lakeFreezeNorth || snow01 < ICE.lakeFreezeSnow) return false;
  const bigLake = (lake.areaKm2 || 0) > 3500;      // очень большому озеру нужен мороз покрепче
  return bigLake ? snow01 >= 0.45 : true;
}

/* F-180: река встала? Только мелкая таёжная: широкое русло течёт подо льдом. */
export function riverFreezes(widthM, snow01, north) {
  return widthM <= ICE.riverFreezeWidthM && north >= 0.4 && snow01 >= ICE.riverFreezeSnow;
}

/* F-181: иней по утрам на юге. Утро — солнце от −2° до +12°, снега ещё нет:
   белый налёт держится до первого тепла. */
export function frost01(altDeg, snow01, north) {
  if (north >= ICE.frostNorthMax) return 0;         // на севере это лёд, а не иней
  const dawn = Math.max(0, Math.min(1, (12 - altDeg) / 14));
  const cold = 1 - Math.max(0, Math.min(1, snow01)) * 0.8;
  const south = 1 - north / ICE.frostNorthMax;      // чем южнее, тем чаще иней
  return Math.round(dawn * cold * south * 1000) / 1000;
}

/* F-182: ледокол на северном озере. Берёт самое крупное вставшее озеро и ходит по кольцу
   внутри него; положение зависит от игровых минут, поэтому в кадре он не дёргается. */
export function pickIcebreaker(lakes, snow01, north) {
  if (north < ICE.lakeFreezeNorth || snow01 < 0.4) return null;
  const frozen = lakes.filter((l) => l.areaKm2 >= ICE.breakerMinAreaKm2 && lakeFreezes(l, snow01, north));
  if (!frozen.length) return null;
  frozen.sort((a, b) => (b.areaKm2 || 0) - (a.areaKm2 || 0));
  return frozen[0];
}

export function icebreakerAt(lake, minutes, speedKmH = ICE.breakerSpeedKmH) {
  if (!lake) return null;
  const ring = lake.ring || [];
  if (ring.length < 4) return null;
  // радиус кольца — четверть характерного размера озера, ход — по кругу
  let r = 0;
  for (const p of ring) r = Math.max(r, Math.hypot(p[0] - lake.x, p[1] - lake.y));
  const radius = r * 0.45;
  const lapKm = 2 * Math.PI * radius;
  const phase = (minutes / 60) * speedKmH / Math.max(0.1, lapKm);
  const a = phase * Math.PI * 2;
  return { x: lake.x + Math.cos(a) * radius, y: lake.y + Math.sin(a) * radius * 0.7, heading: a + Math.PI / 2 };
}

/* F-183: приливы §5.10 — два прилива за игровые сутки, ±1.2 м. */
export function tideM(minutes) {
  return 1.2 * Math.sin((2 * Math.PI * (minutes - 180)) / 720);
}

/* Сводка состояния: что сейчас со льдом и инеем — одним объектом для карты и HUD. */
export function iceState(water, light, opts = {}) {
  const minutes = opts.minutes || 0;
  const doy = opts.doy != null ? opts.doy : START_DAY_OF_YEAR;
  const snow = snowCover01(doy);
  const alt = sunAltitudeDeg(minutes, doy) ;
  const lakes = (water && water.lakes) || [];
  const northOf = (y) => north01(y);
  let frozenLakes = 0, frozenRivers = 0, maxIce = 0;
  const iceByLake = new Map();
  for (const lake of lakes) {
    const n = northOf(lake.y);
    if (lakeFreezes(lake, snow, n)) {
      frozenLakes++;
      const cm = iceThicknessCm(snow, n);
      iceByLake.set(lake, cm);
      if (cm > maxIce) maxIce = cm;
    }
  }
  const lines = (water && water.rivers && water.rivers.lines) || [];
  for (const l of lines) {
    const n = northOf(l.pts[0].y);
    if (riverFreezes(l.widthM, snow, n)) frozenRivers++;
  }
  const frost = frost01(alt, snow, northOf(opts.centerY != null ? opts.centerY : ICE.southY + 400));
  const breaker = pickIcebreaker(lakes, snow, 1);
  return {
    snow, alt, frost, frozenLakes, frozenRivers, maxIce, iceByLake,
    breaker, breakerPos: breaker ? icebreakerAt(breaker, minutes) : null,
    tide: tideM(minutes),
    any: frozenLakes > 0 || frost > 0.25 || frozenRivers > 0
  };
}
