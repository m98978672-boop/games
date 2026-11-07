// ============================================================
// ПРЕДПРОСМОТР В МЕНЮ: маленькое живое окно с текущей моделью.
// Второй WebGL-рендерер рисует ту же сцену, но своей камерой —
// она кадрирует модель целиком и повторяет направление основной камеры.
// Так видно, что меняешь, даже когда фон затемнён подложкой меню.
// ============================================================
import * as THREE from 'three';

const DIR_DEFAULT = new THREE.Vector3(0.82, 0.42, -1).normalize();

/**
 * @param {HTMLCanvasElement} canvas
 * @returns {{draw:Function, resize:Function, dispose:Function}|null}
 *   null — если WebGL недоступен (тогда меню показывает заглушку).
 */
export function createPreview(canvas) {
  // сначала честная проверка: без WebGL three.js сыплет ошибкой в консоль,
  // а нам достаточно показать заглушку
  let hasGL = false;
  try {
    hasGL = !!(canvas.getContext('webgl2') || canvas.getContext('webgl') || canvas.getContext('experimental-webgl'));
  } catch { hasGL = false; }
  if (!hasGL) return null;
  let renderer = null;
  try {
    renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'low-power',
      preserveDrawingBuffer: false,
    });
  } catch {
    return null;
  }
  renderer.setPixelRatio(Math.min(2, (typeof window !== 'undefined' && window.devicePixelRatio) || 1));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.02;
  // тени в миниатюре не нужны: они дорогие и почти не видны в мелком окне
  renderer.shadowMap.enabled = false;

  const camera = new THREE.PerspectiveCamera(32, 1.4, 0.05, 500);
  const boxes = new WeakMap();
  const vCenter = new THREE.Vector3();
  const vSize = new THREE.Vector3();
  const vDir = new THREE.Vector3();

  /** Габариты модели считаем один раз: геометрия за время показа не меняется. */
  function boxOf(root) {
    if (!root) return null;
    let box = boxes.get(root);
    if (!box) {
      root.updateMatrixWorld(true);
      box = new THREE.Box3().setFromObject(root);
      if (!box.isEmpty()) boxes.set(root, box);
    }
    return box && !box.isEmpty() ? box : null;
  }

  let lastW = 0;
  let lastH = 0;
  /** Размер меняется только при ресайзе окна — не дёргаем layout каждый кадр. */
  function resize(force = false) {
    const rect = canvas.getBoundingClientRect();
    const w = Math.max(80, Math.round(rect.width || canvas.clientWidth || 320));
    const h = Math.max(60, Math.round(rect.height || canvas.clientHeight || 200));
    if (!force && w === lastW && h === lastH) return { w, h };
    lastW = w;
    lastH = h;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    return { w, h };
  }

  /**
   * Рисует кадр.
   * @param {THREE.Scene} scene
   * @param {THREE.Object3D} root — корень модели (для кадрирования)
   * @param {THREE.Vector3} [fromPos] — где стоит основная камера: миниатюра
   *   смотрит на модель с той же стороны, что и большой вид
   */
  function draw(scene, root, fromPos) {
    const box = boxOf(root);
    if (!scene || !box) return false;
    resize();
    box.getCenter(vCenter);
    box.getSize(vSize);
    const radius = Math.max(vSize.length() * 0.5, 0.4);
    const fov = THREE.MathUtils.degToRad(camera.fov);
    const distance = (radius / Math.sin(fov / 2)) * 1.02;
    if (fromPos) vDir.copy(fromPos).sub(vCenter);
    else vDir.set(0, 0, 0);
    if (vDir.lengthSq() > 0.0025) vDir.normalize();
    else vDir.copy(DIR_DEFAULT);
    camera.position.copy(vCenter).addScaledVector(vDir, distance);
    camera.near = Math.max(0.05, distance - radius * 2.5);
    camera.far = distance + radius * 4;
    camera.up.set(0, 1, 0);
    camera.lookAt(vCenter);
    camera.updateProjectionMatrix();
    renderer.render(scene, camera);
    return true;
  }

  function dispose() {
    try {
      renderer.dispose();
      renderer.forceContextLoss?.();
    } catch { /* уже закрыт */ }
    renderer = null;
  }

  return { draw, resize, dispose };
}
