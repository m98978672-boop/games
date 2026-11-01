// Проекция географических координат в игровые метры.
// Масштаб 1:20 — 100 км реальной дороги превращаются в 5 км игровых.
import { CITIES, CITY_BY_ID, COUNTRIES } from '../data/cities.js';
import { haversine, rad, clamp } from '../core/math.js';

export const SCALE = 0.05;
export const LON0 = 10;
export const LAT0 = 50;

const KX = 111320 * Math.cos(rad(LAT0)) * SCALE; // м на градус долготы
const KZ = 110540 * SCALE; // м на градус широты

export function project(lat, lon) {
  return { x: (lon - LON0) * KX, z: -(lat - LAT0) * KZ };
}

export function unproject(x, z) {
  return { lat: LAT0 - z / KZ, lon: LON0 + x / KX };
}

export const CITY_POS = new Map(
  CITIES.map((c) => {
    const p = project(c.lat, c.lon);
    return [c.id, { ...c, x: p.x, z: p.z }];
  })
);

export function nearestCity(x, z) {
  let best = null;
  let bestD = Infinity;
  for (const c of CITY_POS.values()) {
    const d = (c.x - x) ** 2 + (c.z - z) ** 2;
    if (d < bestD) {
      bestD = d;
      best = c;
    }
  }
  return { city: best, dist: Math.sqrt(bestD) };
}

export function countryAt(x, z) {
  const { city } = nearestCity(x, z);
  return COUNTRIES[city.country] || COUNTRIES.DE;
}

/** Расстояние между городами по прямой в игровых километрах. */
export function cityDistanceKm(a, b) {
  return haversine(a.lat, a.lon, b.lat, b.lon) * SCALE;
}

export function routeDistanceKm(route) {
  return route.km;
}

/** Стоимость топлива в стране, ближайшей к точке. */
export function fuelPriceAt(x, z) {
  const c = countryAt(x, z);
  return c.fuel * (0.94 + 0.12 * (Math.abs(Math.sin(x * 0.013 + z * 0.007))));
}

export function clampToEurope(x, z) {
  return { x: clamp(x, -400000, 400000), z: clamp(z, -400000, 400000) };
}

export { CITY_BY_ID, COUNTRIES };
