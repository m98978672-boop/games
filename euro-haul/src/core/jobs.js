// Рынок грузов: генерация контрактов, оплата, сроки и требования.
import { CARGOS, TRAILERS, companyName } from '../data/cargo.js';
import { CITIES, CITY_BY_ID } from '../data/cities.js';
import { networkRouteKm } from '../world/roadnet.js';
import { clamp, rng, hashString, fmtMoney } from './math.js';

export const CATEGORY_LABEL = {
  general: 'Обычный',
  fragile: 'Хрупкий',
  fridge: 'Рефрижератор',
  heavy: 'Тяжёлый',
  valuable: 'Ценный',
  adr: 'ADR · опасный',
};

const CATEGORY_TAG = {
  general: 'ОБЫЧНЫЙ',
  fragile: 'ХРУПКИЙ',
  fridge: 'РЕФ',
  heavy: 'ТЯЖЁЛЫЙ',
  valuable: 'ЦЕННЫЙ',
  adr: 'ADR',
};

const RATE_SCALE = 15; // игровые € на км при базовой ставке 1.0

function skillBonus(profile, cargo) {
  const s = profile.skills || {};
  let bonus = 1;
  if (cargo.category === 'valuable') bonus += 0.12 * (s.value || 0);
  if (cargo.category === 'fragile') bonus += 0.1 * (s.fragile || 0);
  if (cargo.category === 'adr') bonus += 0.14 * (s.adr || 0);
  if (cargo.category === 'heavy') bonus += 0.06 * (s.long || 0);
  return bonus;
}

export function cargoAllowed(profile, cargo, distanceKm) {
  const s = profile.skills || {};
  if (cargo.category === 'adr' && (s.adr || 0) < 1) return false;
  if (cargo.category === 'valuable' && (s.value || 0) < 1) return false;
  if (distanceKm > 400 && (s.long || 0) < 1) return false;
  if ((profile.level || 1) < cargo.minLevel) return false;
  return true;
}

export function makeOffer(profile, fromId, seed, nowMinutes) {
  const r = rng(seed);
  const from = CITY_BY_ID.get(fromId);
  const pool = CITIES.filter((c) => c.id !== fromId);
  // Предпочитаем близкие города, но иногда даём дальний рейс.
  let target = null;
  let distance = 0;
  for (let attempt = 0; attempt < 26; attempt++) {
    const cand = pool[Math.floor(r() * pool.length)];
    const { km } = networkRouteKm(fromId, cand.id);
    const bias = r();
    if (bias < 0.55 ? km < 90 : bias < 0.85 ? km < 260 : true) {
      target = cand;
      distance = km;
      break;
    }
  }
  if (!target) {
    target = pool[Math.floor(r() * pool.length)];
    distance = networkRouteKm(fromId, target.id).km;
  }
  distance = Math.max(9, distance);

  const eligible = CARGOS.filter((c) =>
    cargoAllowed(profile, { category: c[1], minLevel: c[6] }, distance)
  );
  const cargoRow = (eligible.length ? eligible : CARGOS.filter((c) => c[1] === 'general'))[
    Math.floor(r() * (eligible.length || 1))
  ];
  const [, category, trailer, massMin, massMax, rate, minLevel] = cargoRow;
  const mass = Math.round((massMin + r() * (massMax - massMin)) * 10) / 10;
  const urgent = r() < 0.18 + 0.05 * (profile.skills?.urgent || 0);
  const fragile = category === 'fragile' || category === 'valuable';
  const weightFactor = 0.85 + mass / 55;
  const skillMul = skillBonus(profile, { category });
  const urgencyMul = urgent ? 1.28 : 1;
  let pay = distance * rate * weightFactor * skillMul * urgencyMul * RATE_SCALE;
  pay = Math.round(pay / 5) * 5;

  // Время в пути в игровых минутах (ускорение времени ×3) плюс запас.
  const driveMinutes = (distance / 70) * 60 * 3 * 1.15;
  const buffer = urgent ? 40 + r() * 40 : 90 + r() * 150;
  const deadlineMin = Math.round(driveMinutes + buffer);
  const company = companyName(r());
  const expires = Math.round(nowMinutes + 240 + r() * 720);

  return {
    id: 'job-' + seed.toString(36),
    from: fromId,
    to: target.id,
    fromName: from.name,
    toName: target.name,
    fromCountry: from.country,
    toCountry: target.country,
    cargo: cargoRow[0],
    category,
    tag: CATEGORY_TAG[category] || 'ГРУЗ',
    trailer,
    trailerName: TRAILERS[trailer]?.name || 'Полуприцеп',
    mass,
    distance,
    pay,
    deadlineMin,
    urgent,
    fragile,
    adr: category === 'adr',
    company,
    expires,
    acceptedAt: null,
    minLevel,
  };
}

export function makeOffers(profile, cityId, count, nowMinutes, seedBase = 1) {
  const out = [];
  for (let i = 0; i < count; i++) {
    const seed = hashString(cityId + ':' + Math.floor(nowMinutes / 180) + ':' + i + ':' + seedBase);
    out.push(makeOffer(profile, cityId, seed, nowMinutes));
  }
  return out;
}

export function payoutFor(job, damage, minutesLate, penalties) {
  let pay = job.pay;
  const notes = [];
  if (minutesLate > 0) {
    const cut = Math.min(0.45, minutesLate / Math.max(60, job.deadlineMin) * 0.9);
    pay *= 1 - cut;
    notes.push(`Просрочка: −${Math.round(cut * 100)}%`);
  }
  if (damage > 0.5) {
    const cut = Math.min(0.3, damage / 200);
    pay *= 1 - cut;
    notes.push(`Повреждение: −${Math.round(cut * 100)}%`);
  }
  if (penalties) {
    pay -= penalties;
    notes.push(`Штрафы: −${fmtMoney(penalties)}`);
  }
  return { total: Math.max(0, Math.round(pay / 5) * 5), notes };
}

export function jobXp(job, damage, late) {
  let xp = 40 + job.distance * 3.2 + (job.urgent ? 40 : 0) + (job.adr ? 30 : 0);
  if (damage > 20) xp *= 0.8;
  if (late > 0) xp *= 0.75;
  return Math.round(xp);
}

export function cargoMeta(cargo) {
  return CARGOS.find((c) => c[0] === cargo);
}

export function offerRating(profile, job) {
  // Простая оценка выгодности для подсказки в интерфейсе.
  const perKm = job.pay / Math.max(1, job.distance);
  const hours = job.deadlineMin / 60;
  const score = clamp(perKm / 22 + (hours > 4 ? 0.2 : 0), 0, 1.4);
  return score;
}

export { CARGOS, TRAILERS };
