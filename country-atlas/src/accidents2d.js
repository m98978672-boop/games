/* §78: ошибки водителя и ДТП (R-78.1…R-78.6, F-248…F-258).
   Авария здесь — не украшение: она отнимает полосу у потока, а риск зависит от
   характера водителя, скорости и сцепления (§76). Всё решается хешем от номера
   машины и игровой минуты, поэтому событие одно и то же при любом fps и не
   хранится в сейве: закрыли окно, открыли — страна пришла к тому же состоянию. */
import { DRIVER } from './ai2d.js';
import { VEHICLE } from './transport2d.js';

export const ACCIDENT = {
  perMinute: 2.2e-5,      // F-248: базовый шанс на машину за игровую минуту
  kinds: [                // F-249: что именно случилось (вес — как часто)
    { id: 'rear', name: 'сзади в бампер', weight: 44, min: 6, max: 14 },
    { id: 'side', name: 'боковой удар', weight: 26, min: 8, max: 18 },
    { id: 'road', name: 'съезд с полосы', weight: 18, min: 10, max: 24 },
    { id: 'ped', name: 'наезд на переходе', weight: 8, min: 12, max: 26 },
    { id: 'cargo', name: 'упавший груз', weight: 4, min: 14, max: 30 }
  ],
  kindScale: 60,          // F-250: минуты в таблице выше — на скорости 60 км/ч
  speedCap: 130,
  gripRisk: { clear: 1, cloudy: 1.05, rain: 2.1, snow: 3.6, fog: 1.7 },  // F-251
  carelessSpread: 0.7,    // F-252: разброс «невнимательности» вокруг 1
  jamKm: 1.6,             // F-253: затор тянется на 1.6 км позади места
  jamSlow: 0.35,          // F-254: в заторе едем 35 % от своей скорости
  jamMinGapKm: 0.02,
  dayMinutes: 1440,
  reportKinds: 3
};

/* mulberry-хеш: два 32-битных числа → 0…1 без состояния. */
export function hash01(a, b) {
  let h = Math.imul((a >>> 0) ^ 0x9e3779b1, 0x85ebca6b);
  h = Math.imul(h ^ (b >>> 0) ^ (h >>> 13), 0x7feb352d) >>> 0;
  h = Math.imul(h ^ (h >>> 15), 0x846ca68b) >>> 0;
  h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
}

/* F-252: характер водителя — «невнимательность» 0.3…1.7, постоянная для машины. */
export function carelessOf(id) {
  const seed = typeof id === 'string' ? idToInt(id) : (id | 0);
  return 1 + (hash01(seed, 0x9e3779b9) * 2 - 1) * ACCIDENT.carelessSpread;
}

export function idToInt(id) {
  let h = 7;
  for (let i = 0; i < id.length; i++) h = (Math.imul(h, 31) + id.charCodeAt(i)) >>> 0;
  return h;
}

/* F-251: во сколько раз погода повышает риск. */
export function weatherRisk(wx) {
  if (!wx) return 1;
  return ACCIDENT.gripRisk[wx.kind] || 1;
}

/* F-255: шанс на игровую минуту для одной машины.
   Скорость входит нелинейно: на ровном ходу риска больше, чем в пробке,
   но и стоящая машина не попадает в ДТП вовсе (v < 2 км/ч — ноль). */
export function riskPerMinute(vehicle, wx = null) {
  const kmh = Math.max(0, (vehicle.speedKmh || 0) * (vehicle.freeFlow === false ? 0.35 : 1));
  if (kmh < 2) return 0;
  const v = Math.min(ACCIDENT.speedCap, kmh) / ACCIDENT.speedCap;
  const speedF = 0.35 + 1.65 * v * v;                // 0.35 в городе, 2.0 на трассе
  const profile = DRIVER[vehicle.profile && vehicle.profile.id] || DRIVER.normal;
  // F-255: характер входит степенью — агрессивный (T=1.0) рискует в 2.3 раза больше спокойного (T=2.0)
  const temper = 2.5 / Math.pow(profile.T || 1.6, 1.2);
  const heavy = vehicle.kind === 'truck' ? 0.8 : vehicle.kind === 'bus' ? 0.9 : 1;
  return ACCIDENT.perMinute * speedF * temper * heavy * (vehicle.careless || 1) * weatherRisk(wx);
}

/* F-249: вид аварии по весам — тоже детерминированно. */
export function pickKind(u) {
  const total = ACCIDENT.kinds.reduce((a, k) => a + k.weight, 0);
  let acc = 0;
  const x = u * total;
  for (const k of ACCIDENT.kinds) {
    acc += k.weight;
    if (x <= acc) return k;
  }
  return ACCIDENT.kinds[0];
}

/* F-250: сколько минут полоса закрыта — тяжелее на быстром ходу. */
export function blockMinutes(kind, speedKmh) {
  const k = Math.min(1.8, Math.max(0.6, (speedKmh || 60) / ACCIDENT.kindScale));
  const mid = (kind.min + kind.max) / 2;
  return Math.round(Math.min(kind.max, Math.max(kind.min, mid * k)));
}

/* F-256: шаг аварий. Возвращает число новых ДТП за шаг.
   Машины, у которых уже стоит полоса, пропускаются: пока не уберут — не попадают. */
export function stepAccidents(transport, dtSec, wx = null, day = null) {
  if (!transport || !transport.vehicles) return 0;
  const minutes = Math.max(0, dtSec) * 360 / 60;      // реальные секунды → игровые минуты
  if (!transport.accidents) transport.accidents = { events: [], today: 0, day: day == null ? 0 : day, total: 0, kinds: {} };
  const st = transport.accidents;
  if (day != null && day !== st.day) { st.day = day; st.today = 0; }
  if (minutes <= 0) return 0;

  // F-253: затор считаем до шага — по машинам, что уже стоят
  const blocked = new Map();                          // route → [{t, minGap}]
  for (const v of transport.vehicles) {
    if (!v.blockedMin || v.blockedMin <= 0) continue;
    const list = blocked.get(v.route) || [];
    list.push(v.t);
    blocked.set(v.route, list);
  }
  applyJam(transport, blocked);

  const minute = Math.floor(transport.minutes);
  let fresh = 0;
  for (const v of transport.vehicles) {
    if (v.blockedMin > 0) continue;
    const p = riskPerMinute(v, wx);
    if (p <= 0) { v.careless = v.careless || carelessOf(v.id || 0); continue; }
    if (!v.careless) v.careless = carelessOf(v.id || 0);
    // шанс пересчитываем на реальный шаг: 1 − (1 − p)^минут
    const pStep = 1 - Math.pow(1 - p, minutes);
    const u = hash01(idToInt(v.id || 'v'), minute * 977 + 13);
    if (u >= pStep) continue;
    const kind = pickKind(hash01(idToInt(v.id || 'v'), minute * 31 + 7));
    const block = blockMinutes(kind, v.speedKmh);
    v.blockedMin = block;
    v.blockedTotal = (v.blockedTotal || 0) + block;
    v.accident = { kind: kind.id, name: kind.name, min: transport.minutes, minutes: block };
    v.slow = ACCIDENT.jamSlow;
    st.today++; st.total++;
    st.kinds[kind.id] = (st.kinds[kind.id] || 0) + 1;
    st.events.push({ id: v.id, kind: kind.id, name: kind.name, at: transport.minutes, minutes: block });
    if (st.events.length > 200) st.events.shift();
    fresh++;
  }
  return fresh;
}

/* F-253/F-254: кто стоит — тот тормозит тех, кто сзади на той же дороге.
   Смотрим только вперёд по ходу (t меньше — это позади), зазор — до 1.6 км. */
export function applyJam(transport, blocked) {
  for (const v of transport.vehicles) {
    if (v.blockedMin > 0) { v.slow = ACCIDENT.jamSlow; continue; }
    const list = blocked.get(v.route);
    if (!list || !list.length) { v.slow = 1; continue; }
    let near = false;
    for (const t of list) {
      // «позади» — тот, кто дойдёт до места позже: при dir=+1 это меньший t, при −1 больший
      const gap = v.dir > 0 ? (t - v.t) : (v.t - t);
      if (gap > 0 && gap * v.route.lengthKm <= ACCIDENT.jamKm) { near = true; break; }
    }
    v.slow = near ? ACCIDENT.jamSlow : 1;
  }
}

/* F-257: сводка по стране — для строки HUD и подсказки. */
export function accidentStats(transport) {
  const st = (transport && transport.accidents) || { events: [], today: 0, kinds: {}, total: 0 };
  let active = 0, blockedMin = 0, slowest = 0, jammed = 0;
  const vehicles = (transport && transport.vehicles) || [];
  for (const v of vehicles) {
    if (v.blockedMin > 0) { active++; blockedMin += v.blockedMin; slowest = Math.max(slowest, v.blockedMin); }
    else if (v.slow && v.slow < 1) jammed++;
  }
  const kinds = Object.keys(st.kinds || {});
  let worst = null;
  for (const k of kinds) if (!worst || st.kinds[k] > st.kinds[worst]) worst = k;
  return {
    active, jammed, today: st.today || 0, total: st.total || 0,
    avgBlockMin: active ? blockedMin / active : 0,
    worstBlockMin: slowest,
    worstKind: worst,
    kinds: st.kinds || {},
    jamKm: Number((jammed * ACCIDENT.jamKm / 4).toFixed(2)),   // грубая длина затора, км
    recent: (st.events || []).slice(-ACCIDENT.reportKinds)
  };
}

/* F-258: средний риск по парку — одна цифра для панели страны. */
export function fleetRisk(transport, wx = null) {
  const vehicles = (transport && transport.vehicles) || [];
  if (!vehicles.length) return 0;
  let sum = 0;
  for (const v of vehicles) sum += riskPerMinute(v, wx);
  return sum / vehicles.length;
}
