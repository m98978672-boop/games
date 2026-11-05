import { buildTruck } from './truck.js';
import { buildTrailer } from './trailer.js';
import { buildCar } from './car.js';

export function buildUnit(unit, M) {
  if (unit.category === 'trucks') return buildTruck(unit, M);
  if (unit.category === 'trailers') return buildTrailer(unit, M);
  return buildCar(unit, M);
}

export { buildTruck, buildTrailer, buildCar };
