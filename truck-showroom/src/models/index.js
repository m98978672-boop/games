import { buildTruck } from './truck.js';
import { buildTrailer } from './trailer.js';
import { buildCar } from './car.js';
import { buildBuilding } from './building.js';

export function buildUnit(unit, M) {
  if (unit.category === 'trucks') return buildTruck(unit, M);
  if (unit.category === 'trailers') return buildTrailer(unit, M);
  if (unit.category === 'buildings') return buildBuilding(unit, M);
  return buildCar(unit, M);
}

export { buildTruck, buildTrailer, buildCar, buildBuilding };
