// ============================================================
// ЧЕТВЁРТОЕ ИЗМЕРЕНИЕ ДЛЯ ОБЛАКА ТОЧЕК.
// У каждой точки появляется координата w — четвёртая ось. Дальше облако
// вращается в плоскости XW (и чуть в ZW), а на экран проецируется обратно
// в 3D с мягкой перспективой. Модель не деформируется руками: она просто
// поворачивается в 4D, и её тень в нашем мире «дышит».
// ============================================================
import * as THREE from 'three';

/**
 * Готовит облако: запоминает исходные координаты и считает w для каждой точки.
 * @param {THREE.Points} points
 */
export function prepareFourD(points) {
  if (!points?.geometry) return null;
  if (points.userData.fourD) return points.userData.fourD;
  const attr = points.geometry.attributes.position;
  if (!attr) return null;
  const base = Float32Array.from(attr.array);
  const box = new THREE.Box3().setFromBufferAttribute(attr);
  const center = box.getCenter(new THREE.Vector3());
  const size = box.getSize(new THREE.Vector3());
  const span = Math.max(size.x, size.y, size.z, 1e-3);
  const wy = Math.max(size.y, 1e-3);
  const wz = Math.max(size.z, 1e-3);
  const w = new Float32Array(attr.count);
  for (let i = 0; i < attr.count; i++) {
    // w — это «глубина» точки по высоте и длине: верх кузова уходит
    // в четвёртую ось дальше, чем днище, поэтому поворот читается объёмно
    const yn = (base[i * 3 + 1] - center.y) / wy;
    const zn = (base[i * 3 + 2] - center.z) / wz;
    w[i] = (yn * 0.62 + zn * 0.22) * span * 0.26;
  }
  points.userData.fourD = { base, w, center, span };
  return points.userData.fourD;
}

/**
 * Поворачивает облако в 4D на угол phase и проецирует обратно в 3D.
 * @param {THREE.Points} points
 * @param {number} phase — угол в радианах
 */
export function tickFourD(points, phase) {
  const fd = points?.userData?.fourD;
  if (!fd) return false;
  const attr = points.geometry.attributes.position;
  const arr = attr.array;
  const { base, w, center, span } = fd;
  const c1 = Math.cos(phase);
  const s1 = Math.sin(phase);
  const c2 = Math.cos(phase * 0.6);
  const s2 = Math.sin(phase * 0.6);
  const dist = span * 2.6; // «камера» четвёртого измерения
  for (let i = 0; i < w.length; i++) {
    const j = i * 3;
    const x = base[j] - center.x;
    const z = base[j + 2] - center.z;
    const wi = w[i];
    // поворот в плоскости XW
    let x1 = x * c1 - wi * s1;
    let w1 = x * s1 + wi * c1;
    // и немного в плоскости ZW — так поворот не выглядит плоским
    const z1 = z * c2 - w1 * s2;
    w1 = z * s2 + w1 * c2;
    const k = 1 / (1 + w1 / dist);
    arr[j] = center.x + x1 * k;
    arr[j + 1] = base[j + 1];
    arr[j + 2] = center.z + z1 * k;
  }
  attr.needsUpdate = true;
  points.geometry.computeBoundingSphere();
  return true;
}

/** Возвращает точки на исходные места. */
export function resetFourD(points) {
  const fd = points?.userData?.fourD;
  if (!fd) return false;
  points.geometry.attributes.position.array.set(fd.base);
  points.geometry.attributes.position.needsUpdate = true;
  points.geometry.computeBoundingSphere();
  return true;
}

/** Забыть 4D-подготовку (например, перед пересборкой облака). */
export function clearFourD(points) {
  if (points?.userData) delete points.userData.fourD;
}
