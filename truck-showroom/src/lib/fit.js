// ============================================================
// Подгонка ракурса под габариты модели.
//
// Зачем: ракурсы (views) заданы «на глаз» под широкий экран. На вертикальном
// телефоне горизонтальный угол обзора меньше втрое, и модель обрезается по
// краям; у длинных сцепок (B-double) и высоких зданий (котельная с трубой,
// бизнес-центр) кадр тесный даже на десктопе.
//
// Решение: если габариты не влезают, камера отъезжает от target по той же
// линии взгляда — ровно настолько, чтобы влезли. Направление и fov не меняются,
// поэтому «лицо» ракурса сохраняется.
// ============================================================
import * as THREE from 'three';

const CORNERS = [
  [0, 0, 0], [0, 0, 1], [0, 1, 0], [0, 1, 1],
  [1, 0, 0], [1, 0, 1], [1, 1, 0], [1, 1, 1],
];

const probe = new THREE.PerspectiveCamera(40, 1.6, 0.05, 5000);
const mvp = new THREE.Matrix4();
const point = new THREE.Vector3();

/** Габариты модели в мировых координатах. */
export function boundsOf(root) {
  if (!root) return null;
  root.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(root);
  return box.isEmpty() ? null : box;
}

/**
 * Насколько габариты вылезают за кадр: 1.0 — ровно по кромке,
 * больше — обрезано, меньше — есть запас.
 */
export function frameFill(box, pos, target, fov, aspect) {
  probe.fov = fov;
  probe.aspect = aspect > 0 ? aspect : 1;
  probe.updateProjectionMatrix();
  probe.position.copy(pos);
  probe.lookAt(target);
  probe.updateMatrixWorld(true);
  mvp.multiplyMatrices(probe.projectionMatrix, probe.matrixWorldInverse);
  let worst = 0;
  for (const c of CORNERS) {
    point.set(
      c[0] ? box.max.x : box.min.x,
      c[1] ? box.max.y : box.min.y,
      c[2] ? box.max.z : box.min.z,
    ).applyMatrix4(mvp);
    if (!Number.isFinite(point.x) || !Number.isFinite(point.y)) return Infinity;
    worst = Math.max(worst, Math.abs(point.x), Math.abs(point.y));
  }
  return worst;
}

/**
 * Возвращает вид с отодвинутой камерой, если модель не влезает в кадр.
 * Если влезает — возвращает тот же объект (никаких изменений в кадре).
 *
 * @param {object} view  {pos, target, fov}
 * @param {THREE.Box3} box габариты модели
 * @param {number} aspect отношение сторон кадра (ширина / высота)
 * @param {{margin?: number, maxScale?: number}} opts
 */
export function fitView(view, box, aspect, opts = {}) {
  const margin = opts.margin ?? 0.94;
  const maxScale = opts.maxScale ?? 2.6;
  // Сначала пробуем расширить угол обзора: это сохраняет размер модели на экране.
  // Пределы разные — на вертикальном экране широкий угол смотрится нормально,
  // на большом мониторе «ширик» искажает пропорции.
  const maxFov = opts.maxFov ?? (aspect < 1 ? 62 : 46);
  if (!box || !view || !Array.isArray(view.pos) || !Array.isArray(view.target)) return view;

  const target = new THREE.Vector3(...view.target);
  const pos = new THREE.Vector3(...view.pos);
  let fov = view.fov || 40;
  const offset = pos.clone().sub(target);
  if (offset.length() < 1e-3) return view;

  let fill = frameFill(box, pos, target, fov, aspect);
  if (fill <= margin) return view;

  // 1) угол обзора: проекция примерно обратна тангенсу половины угла
  if (fov < maxFov) {
    const needed = 2 * THREE.MathUtils.radToDeg(Math.atan(Math.tan(THREE.MathUtils.degToRad(fov / 2)) * (fill / margin)));
    const nextFov = Math.min(maxFov, Math.max(fov, needed));
    if (nextFov > fov + 0.1) {
      fov = nextFov;
      fill = frameFill(box, pos, target, fov, aspect);
      if (fill <= margin) return { ...view, fov, fitted: 1 };
    }
  }

  // 2) остаток добираем расстоянием до target
  let scale = 1;
  let next = pos;
  for (let i = 0; i < 10; i += 1) {
    scale *= Math.min(maxScale, Math.max(1.02, fill / margin));
    if (scale > maxScale) scale = maxScale;
    next = target.clone().add(offset.clone().multiplyScalar(scale));
    fill = frameFill(box, next, target, fov, aspect);
    if (fill <= margin) break;
    if (scale >= maxScale) break;
  }
  return { ...view, fov, pos: next.toArray(), fitted: +scale.toFixed(3) };
}

/** Можно ли подгонять этот вид: салон, «место водителя» и точечный осмотр — нельзя. */
export function canFitView(view) {
  if (!view) return false;
  if (view.seat) return false;
  if (view.group === 'interior') return false;
  if (view.id === 'anchor') return false;
  return true;
}

