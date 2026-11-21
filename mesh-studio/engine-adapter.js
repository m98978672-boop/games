/* ============================================================
   MESH STUDIO — адаптер к движку RatCore (mesh-studio/engine-adapter.js)

   Мост между редактором и движком. Геометрию создаёт только движок
   (tools.build.*), сцену держит тоже он (build.placeEntity / move.entity),
   а кадр отдаёт look.capture. Редактор не рисует свою 3D-математику:
   он просит движок и показывает результат.

   Почему так: у движка закрытое хранилище мешей, и это правильно — оно не
   даёт подсунуть неподписанную геометрию (RC-101). Поэтому редактор не
   лезет внутрь, а пользуется сценой, камерой и рендером движка.
   ============================================================ */

/* Ответ инструмента: отказ приходит в поле error, а не исключением. */
function unwrap(res, what) {
  if (!res) throw new Error(`${what}: движок не ответил`);
  if (res.ok === false) {
    const code = res.error && res.error.code ? ` (${res.error.code})` : '';
    const msg = (res.error && (res.error.message || res.error.detail)) || 'инструмент вернул отказ';
    throw new Error(`${what}: ${msg}${code}`);
  }
  return res.data;
}

function meshOf(data) {
  if (!data) return null;
  if (data.mesh) return data.mesh;
  if (data.__kind === 'RatCoreMeshHandle' || data.triCount != null) return data;
  return null;
}

function newId() {
  return `m-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

export const SHAPES = [
  { id: 'box', label: 'Куб', args: { kind: 'box', width: 1, height: 1, depth: 1 }, base: 'Куб' },
  { id: 'sphere', label: 'Сфера', args: { kind: 'sphere', radius: 0.6, segments: 16 }, base: 'Сфера' },
  { id: 'cylinder', label: 'Цилиндр', args: { kind: 'cylinder', radius: 0.45, height: 1.4, segments: 16 }, base: 'Цилиндр' },
  { id: 'cone', label: 'Конус', args: { kind: 'cone', radius: 0.6, height: 1.4, segments: 16 }, base: 'Конус' },
  { id: 'torus', label: 'Тор', args: { kind: 'torus', radius: 0.6, tube: 0.18, segments: 24, tubeSegments: 12 }, base: 'Тор' },
  { id: 'plane', label: 'Плоскость', args: { kind: 'plane', width: 2, depth: 2 }, base: 'Плоскость' },
  { id: 'roof', label: 'Крыша', args: { kind: 'roof', width: 1.4, height: 0.7, depth: 1.4 }, base: 'Крыша' },
];

/* Создать модель и сразу поставить её в сцену движка.
   Возвращает запись, которую хранит редактор (id, имя, цвет, меш). */
export function createShape(engine, shapeId, opts = {}) {
  const shape = SHAPES.find((s) => s.id === shapeId);
  if (!shape) throw new Error(`Неизвестная форма: ${shapeId}`);
  const build = engine && engine.tools && engine.tools.build;
  if (!build) throw new Error('Движок не загрузился: нет tools.build');

  const color = opts.color || '#8fb8d8';
  const args = { ...shape.args, ...(opts.args || {}), color };

  const started = Date.now();
  const mesh = meshOf(unwrap(build.primitive(args), `Создание «${shape.label}»`));
  if (!mesh) throw new Error(`Создание «${shape.label}»: движок не вернул меш`);

  const pos = opts.position || [0, 0, 0];
  const placed = placeMesh(engine, mesh, pos, opts);
  return {
    id: newId(),
    name: opts.name || shape.label,
    base: shape.base,
    color,
    mesh,
    entityId: placed.id,
    position: [placed.x, placed.y, placed.h],
    yaw: placed.yaw || 0,
    scale: placed.scale || 1,
    triCount: mesh.triCount,
    bounds: mesh.bounds,
    op: 'primitive',
    args,
    ms: Date.now() - started,
  };
}

/* Поставить меш в сцену. Рельеф по умолчанию не учитываем: в редакторе
   модели ставятся на ровную плоскость, а не на землю карты. */
export function placeMesh(engine, mesh, position, opts = {}) {
  const build = engine.tools.build;
  const [x, y, h] = position || [0, 0, 0];
  const data = unwrap(build.placeEntity({
    mesh,
    x, y, h,
    yaw: opts.yaw || 0,
    scale: opts.scale || 1,
    allowUnderground: true,
    allowWater: true,
    snapToTerrain: false,
  }), 'Размещение модели');
  return data;
}

/* Тело вращения: профиль [[r, h], …] прокручивается вокруг оси Y. */
export function createLathe(engine, profile, segments, opts = {}) {
  const build = engine.tools.build;
  const color = opts.color || '#8fb8d8';
  const mesh = meshOf(unwrap(build.lathe({ profile, segments, color }), 'Тело вращения'));
  if (!mesh) throw new Error('Тело вращения: движок не вернул меш');
  const placed = placeMesh(engine, mesh, opts.position || [0, 0, 0], opts);
  return {
    id: newId(), name: opts.name || 'Тело вращения', base: 'Тело вращения', color,
    mesh, entityId: placed.id, position: [placed.x, placed.y, placed.h],
    yaw: placed.yaw || 0, scale: placed.scale || 1,
    triCount: mesh.triCount, bounds: mesh.bounds,
    op: 'lathe', args: { profile, segments },
  };
}

/* Экструзия: контур [[x, y], …] выдавливается на высоту. */
export function createExtrude(engine, contour, height, opts = {}) {
  const build = engine.tools.build;
  const color = opts.color || '#8fb8d8';
  const mesh = meshOf(unwrap(build.extrude({ contour, height, color }), 'Экструзия'));
  if (!mesh) throw new Error('Экструзия: движок не вернул меш');
  const placed = placeMesh(engine, mesh, opts.position || [0, 0, 0], opts);
  return {
    id: newId(), name: opts.name || 'Экструзия', base: 'Экструзия', color,
    mesh, entityId: placed.id, position: [placed.x, placed.y, placed.h],
    yaw: placed.yaw || 0, scale: placed.scale || 1,
    triCount: mesh.triCount, bounds: mesh.bounds,
    op: 'extrude', args: { contour, height },
  };
}

/* Воксельный слой: «1x1, 3x3» + размер вокселя. */
export function createLayer(engine, expr, voxelSize, opts = {}) {
  const build = engine.tools.build;
  const color = opts.color || '#8fb8d8';
  const res = unwrap(build.layer({ expr, voxelSize, color }), 'Воксельный слой');
  const mesh = meshOf(res);
  if (!mesh) throw new Error('Воксельный слой: движок не вернул меш');
  const placed = placeMesh(engine, mesh, opts.position || [0, 0, 0], opts);
  return {
    id: newId(), name: opts.name || 'Слой', base: 'Слой', color,
    mesh, entityId: placed.id, position: [placed.x, placed.y, placed.h],
    yaw: placed.yaw || 0, scale: placed.scale || 1,
    triCount: mesh.triCount, bounds: mesh.bounds,
    op: 'layer', args: { expr, voxelSize },
  };
}

/* Сдвинуть модель. Движок обновляет сцену и проверяет высоту. */
export function moveItem(engine, item, pos) {
  const data = unwrap(engine.tools.move.entity({
    id: item.entityId,
    x: pos[0], y: pos[1], h: pos[2],
    allowUnderground: true,
    allowWater: true,
  }), 'Перемещение');
  return { ...item, position: [data.x, data.y, data.h] };
}

/* Сделать модель полупрозрачной нельзя: движок рисует свои поверхности.
   Зато можно сменить цвет при создании заново — этим пользуется редактор. */
export function recolorItem(engine, item, color) {
  const build = engine.tools.build;
  const args = { ...item.args, color };
  const rebuild = {
    primitive: () => build.primitive(args),
    lathe: () => build.lathe(args),
    extrude: () => build.extrude(args),
    layer: () => build.layer(args),
  }[item.op];
  if (!rebuild) return item;
  const mesh = meshOf(unwrap(rebuild(), 'Перекраска'));
  if (!mesh) return item;
  removeItem(engine, item);
  const placed = placeMesh(engine, mesh, item.position, item);
  return { ...item, color, mesh, entityId: placed.id, args };
}

export function removeItem(engine, item) {
  try {
    unwrap(engine.tools.remove.entity({ id: item.entityId }), 'Удаление');
  } catch {
    /* Модель могли уже убрать: редактор не должен падать из-за этого. */
  }
  return item;
}

/* Кадр. Движок рисует сцену программно и отдаёт пиксели — тогда 3D работает
   даже без WebGL, что важно для слабых машин и офлайна. */
export function capture(engine, camera, width, height) {
  engine.tools.look.at({
    x: camera.x, y: camera.y, h: camera.h,
    targetX: camera.targetX, targetY: camera.targetY, targetH: camera.targetH,
    fovDeg: camera.fovDeg || 60,
  });
  const data = unwrap(engine.tools.look.capture({ width, height, includePixels: true }), 'Кадр');
  // Движок переиспользует один и тот же буфер кадра: следующий вызов затрёт
  // пиксели предыдущего. Копируем сразу, иначе сравнение кадров всегда даст
  // «ноль различий», а сохранённый кадр — чужую картинку.
  const pixels = data.pixels ? Uint32Array.from(data.pixels) : null;
  const objectId = data.objectIdBuffer ? Uint32Array.from(data.objectIdBuffer) : null;
  return {
    width: data.width,
    height: data.height,
    pixels,
    objectId,
    tris: data.drawnTris,
    filled: data.nonEmptyRatio,
    backend: data.backend,
  };
}

/* Снимок сцены для сохранения и экспорта. */
export function exportScene(engine, scene, meta = {}) {
  return {
    schema: 'mesh-studio/1',
    app: 'MESH STUDIO',
    engine: 'RatCore',
    created: new Date().toISOString(),
    note: meta.note || '',
    models: scene.map((m) => ({
      name: m.name,
      color: m.color,
      position: m.position,
      yaw: m.yaw || 0,
      scale: m.scale || 1,
      op: m.op,
      args: m.args,
      tris: m.triCount || 0,
    })),
    totals: {
      models: scene.length,
      tris: scene.reduce((sum, m) => sum + (m.triCount || 0), 0),
    },
  };
}

export default {
  SHAPES, createShape, createLathe, createExtrude, createLayer,
  placeMesh, moveItem, recolorItem, removeItem, capture, exportScene,
};
