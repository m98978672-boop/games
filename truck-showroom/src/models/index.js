import { buildTruck } from './truck.js';
import { buildTrailer } from './trailer.js';
import { buildCar } from './car.js';
import { buildBuilding } from './building.js';
import { boundsOf, fitView, canFitView } from '../lib/fit.js';

// Ширина кадра, под которую рассчитаны ракурсы моделей (десктоп).
// На телефоне камера подгоняет вид ещё раз — уже под фактический аспект.
const BASE_ASPECT = 1.6;

/** Ракурс не должен обрезать модель: длинные сцепки и высокие здания не влезали. */
function fitModelViews(built) {
  if (!built || !built.root || !Array.isArray(built.views)) return built;
  const box = boundsOf(built.root);
  if (!box) return built;
  built.views = built.views.map((view) => (canFitView(view) ? fitView(view, box, BASE_ASPECT) : view));
  return built;
}

export function buildUnit(unit, M) {
  const built = unit.category === 'trucks' ? buildTruck(unit, M)
    : unit.category === 'trailers' ? buildTrailer(unit, M)
      : unit.category === 'buildings' ? buildBuilding(unit, M)
        : buildCar(unit, M);
  return fitModelViews(built);
}

export { buildTruck, buildTrailer, buildCar, buildBuilding };
