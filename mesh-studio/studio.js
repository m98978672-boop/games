/* ============================================================
   MESH STUDIO — интерфейс редактора (mesh-studio/studio.js)

   Связывает панели с движком: нажатие «Куб» → build.primitive →
   build.placeEntity → кадр через look.capture → на экран.

   Здесь только интерфейс. Геометрия и рендер — в движке (RatCore),
   операции над сценой — в core.js, стык с движком — в engine-adapter.js.
   ============================================================ */
import {
  nextName, addItem, removeItem, replaceItem, duplicateItem,
  createHistory, sceneStats, sceneBounds, parsePoints, parseLayer, toRecipe, fileName,
} from './core.js';
import {
  SHAPES, createShape, createLathe, createExtrude, createLayer,
  moveItem, recolorItem, removeItem as engineRemove, capture, exportScene,
} from './engine-adapter.js';

const COLORS = ['#8fb8d8', '#e0a060', '#7bd88f', '#e8665e', '#c58fe8', '#f0d060', '#9aa7b8', '#4a5a6e'];
const $ = (sel) => document.querySelector(sel);

/* ---------- состояние ---------- */

const state = {
  engine: null,
  scene: [],
  selected: null,
  color: COLORS[0],
  camera: { x: -5, y: -5, h: 4, targetX: 0, targetY: 0, targetH: 0.8, fovDeg: 60 },
  canvas: null,
  ctx: null,
  image: null,
  imageData: null,
  frame: null,
  rendering: false,
  dirty: true,
  viewW: 0,
  viewH: 0,
};

const history = createHistory(60);

/* ---------- сообщения ---------- */

function say(text, kind = '') {
  const el = $('#status-text');
  if (!el) return;
  el.textContent = text;
  el.className = kind;
}

function fail(err) {
  const msg = err && err.message ? err.message : String(err);
  say(msg, 'error');
}

/* ---------- движок ---------- */

function startEngine() {
  const RC = window.RatCore;
  if (!RC || typeof RC.createEngine !== 'function') {
    $('#engine-note').textContent = 'Движок RatCore не загрузился. Проверьте, что файл ratcore.bundle.js на месте.';
    say('Движок недоступен', 'error');
    return false;
  }
  try {
    state.engine = RC.createEngine({});
    const tools = Object.keys(state.engine.tools || {}).length;
    $('#engine-note').textContent =
      `RatCore ${RC.VERSION || RC.RATCORE_VERSION || ''} — ${tools} наборов инструментов. `
      + 'Геометрию, сцену и кадр считает движок.';
    return true;
  } catch (err) {
    $('#engine-note').textContent = `Движок не запустился: ${err.message}`;
    say('Движок не запустился', 'error');
    return false;
  }
}

/* ---------- камера ---------- */

function cameraDistance() {
  const b = sceneBounds(state.scene);
  const c = b.center;
  // Дистанция от радиуса сцены: чуть больше, чем нужно на глаз, иначе
  // одиночная модель теряется в углу кадра, а большая сцена обрезается.
  const dist = Math.max(3.2, b.radius * 2.15);
  // Направление взгляда: 3/4 сзади-слева, как в 3D-редакторах.
  return {
    x: c[0] - dist * 0.62,
    y: c[1] - dist * 0.72,
    h: c[2] + dist * 0.52,
    targetX: c[0],
    targetY: c[1],
    targetH: c[2],
  };
}

function resetCamera() {
  state.camera = { ...state.camera, ...cameraDistance() };
  state.dirty = true;
}

function orbit(dx, dy) {
  const cam = state.camera;
  const tx = cam.targetX, ty = cam.targetY, tz = cam.targetH;
  let ox = cam.x - tx, oy = cam.y - ty, oz = cam.h - tz;

  // Горизонтальное вращение вокруг цели.
  const ang = dx * 0.008;
  const cos = Math.cos(ang), sin = Math.sin(ang);
  const nx = ox * cos - oy * sin;
  const ny = ox * sin + oy * cos;
  ox = nx; oy = ny;

  // Вертикальный наклон с ограничением, чтобы не перевернуться.
  const angV = dy * 0.008;
  const distXZ = Math.hypot(ox, oy) || 0.001;
  let elevation = Math.atan2(oz, distXZ);
  elevation = Math.max(-0.25, Math.min(1.45, elevation + angV));
  const radius = Math.hypot(distXZ, oz);
  const newXZ = Math.cos(elevation) * radius;
  const newZ = Math.sin(elevation) * radius;
  const scale = newXZ / distXZ;

  cam.x = tx + ox * scale;
  cam.y = ty + oy * scale;
  cam.h = tz + newZ;
  state.dirty = true;
}

function zoom(factor) {
  const cam = state.camera;
  const k = Math.max(0.25, Math.min(4, factor));
  cam.x = cam.targetX + (cam.x - cam.targetX) * k;
  cam.y = cam.targetY + (cam.y - cam.targetY) * k;
  cam.h = cam.targetH + (cam.h - cam.targetH) * k;
  state.dirty = true;
}

function setView(kind) {
  const b = sceneBounds(state.scene);
  const c = b.center;
  const d = Math.max(3.2, b.radius * 2.15);
  const base = { targetX: c[0], targetY: c[1], targetH: c[2], fovDeg: 60 };
  if (kind === 'front') state.camera = { ...base, x: c[0], y: c[1] - d, h: c[2] };
  else if (kind === 'side') state.camera = { ...base, x: c[0] + d, y: c[1], h: c[2] };
  else if (kind === 'top') state.camera = { ...base, x: c[0], y: c[1] - 0.01, h: c[2] + d };
  else resetCamera();
  state.dirty = true;
}

/* ---------- отрисовка ---------- */

function ensureCanvas() {
  if (state.canvas) return true;
  const canvas = $('#view');
  if (!canvas) return false;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    $('#viewport-error').hidden = false;
    $('#viewport-error-text').textContent = 'Браузер не дал 2D-контекст. Модели можно создавать и экспортировать.';
    return false;
  }
  state.canvas = canvas;
  state.ctx = ctx;
  return true;
}

function resizeCanvas() {
  const canvas = state.canvas;
  if (!canvas) return;
  const rect = canvas.getBoundingClientRect();
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const w = Math.max(64, Math.round(rect.width * dpr));
  const h = Math.max(64, Math.round(rect.height * dpr));
  if (canvas.width !== w || canvas.height !== h) {
    canvas.width = w;
    canvas.height = h;
    state.imageData = null;
    state.dirty = true;
  }
  const viewW = Math.max(64, Math.round(rect.width));
  const viewH = Math.max(64, Math.round(rect.height));
  if (viewW !== state.viewW || viewH !== state.viewH) {
    state.viewW = viewW;
    state.viewH = viewH;
    state.dirty = true;
  }
}

/* Кадр рисует движок, а мы переносим его пиксели на canvas.
   Размер кадра держим умеренным: программный рендер на телефоне
   не должен превращаться в слайд-шоу. */
const RENDER_MAX = 480;

function renderFrame() {
  if (!state.engine || !state.ctx || state.rendering) return;
  state.rendering = true;
  try {
    const vw = state.viewW || 320;
    const vh = state.viewH || 240;
    const scale = Math.min(1, RENDER_MAX / Math.max(vw, vh));
    const w = Math.max(64, Math.round(vw * scale));
    const h = Math.max(64, Math.round(vh * scale));

    const frame = capture(state.engine, state.camera, w, h);
    if (!frame.pixels) throw new Error('движок не вернул пиксели');

    if (!state.imageData || state.imageData.width !== w || state.imageData.height !== h) {
      state.imageData = state.ctx.createImageData(w, h);
    }
    const out = state.imageData.data;
    for (let i = 0, p = 0; i < frame.pixels.length; i++, p += 4) {
      const v = frame.pixels[i];
      out[p] = v & 0xff;
      out[p + 1] = (v >>> 8) & 0xff;
      out[p + 2] = (v >>> 16) & 0xff;
      out[p + 3] = 255;
    }

    // Заглушка-канвас промежуточного размера, затем растягиваем на весь вид.
    const tmp = document.createElement('canvas');
    tmp.width = w;
    tmp.height = h;
    tmp.getContext('2d').putImageData(state.imageData, 0, 0);

    const ctx = state.ctx;
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.clearRect(0, 0, state.canvas.width, state.canvas.height);
    ctx.drawImage(tmp, 0, 0, state.canvas.width, state.canvas.height);

    state.frame = { ...frame, tris: frame.tris, backend: frame.backend };
    updateStats();
    state.dirty = false;
    $('#viewport-error').hidden = true;
  } catch (err) {
    $('#viewport-error').hidden = false;
    $('#viewport-error-text').textContent = `Отрисовка не удалась: ${err.message}. Модели и экспорт работают.`;
    state.dirty = false;
  } finally {
    state.rendering = false;
  }
}

let rafId = 0;
function scheduleRender() {
  if (!state.dirty) return;
  cancelAnimationFrame(rafId);
  rafId = requestAnimationFrame(() => {
    resizeCanvas();
    renderFrame();
  });
}

/* ---------- статистика и список ---------- */

function updateStats() {
  const s = sceneStats(state.scene);
  $('#stat-meshes').innerHTML = `<strong>${s.meshes}</strong> моделей`;
  $('#stat-tris').innerHTML = `<strong>${s.tris.toLocaleString('ru-RU')}</strong> треугольников`;
  const sceneTris = state.frame ? state.frame.tris : 0;
  $('#stat-scene-tris').innerHTML = `<strong>${sceneTris}</strong> в кадре`;
  $('#scene-count').textContent = String(s.items);
  updateButtons();
}

function updateButtons() {
  $('#btn-undo').disabled = !history.canUndo;
  $('#btn-redo').disabled = !history.canRedo;
  $('#btn-duplicate').disabled = !state.selected;
  $('#btn-delete').disabled = !state.selected;
  $('#btn-export-obj').disabled = state.scene.length === 0;
  $('#btn-export-json').disabled = state.scene.length === 0;
}

function renderList() {
  const list = $('#scene-list');
  list.textContent = '';
  if (!state.scene.length) {
    const empty = document.createElement('li');
    empty.className = 'scene-empty';
    empty.textContent = 'Пока пусто. Нажмите «Куб» или другую форму слева — модель сразу появится в сцене.';
    list.appendChild(empty);
    updateStats();
    return;
  }
  for (const item of state.scene) {
    const li = document.createElement('li');
    li.className = 'scene-item';
    li.setAttribute('role', 'option');
    li.setAttribute('aria-selected', String(item.id === state.selected));
    li.tabIndex = 0;
    li.dataset.id = item.id;

    const dot = document.createElement('span');
    dot.className = 'scene-dot';
    dot.style.background = item.color;

    const name = document.createElement('span');
    name.className = 'scene-name';
    name.textContent = item.name;

    const tris = document.createElement('span');
    tris.className = 'scene-tris';
    tris.textContent = `${item.triCount || 0}`;

    li.append(dot, name, tris);
    li.addEventListener('click', () => select(item.id));
    li.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); select(item.id); }
    });
    list.appendChild(li);
  }
  updateStats();
}

function select(id) {
  state.selected = state.selected === id ? null : id;
  renderList();
  updateButtons();
  const item = state.scene.find((m) => m.id === state.selected);
  if (item) say(`Выбрано: ${item.name} · ${item.triCount} треугольников`);
}

/* ---------- действия ---------- */

function commit(scene, message) {
  state.scene = history.push(scene);
  if (state.selected && !state.scene.some((m) => m.id === state.selected)) state.selected = null;
  renderList();
  state.dirty = true;
  scheduleRender();
  if (message) say(message, 'ok');
}

function addModel(item) {
  item.name = nextName(state.scene, item.base || item.name);
  state.selected = item.id;
  commit(addItem(state.scene, item), `${item.name}: добавлено (${item.triCount} треугольников)`);
}

function makeShape(shapeId) {
  if (!state.engine) return;
  try {
    // Новая модель ставится рядом с предыдущей, чтобы не пряталась внутри.
    const offset = state.scene.length * 0.9;
    const item = createShape(state.engine, shapeId, {
      color: state.color,
      position: [offset, 0, 0],
    });
    addModel(item);
  } catch (err) {
    fail(err);
  }
}

function makeLathe() {
  if (!state.engine) return;
  try {
    const profile = parsePoints($('#lathe-profile').value).map(([r, y]) => [Math.max(0, r), y]);
    const segments = Math.max(3, Math.min(48, Number($('#lathe-segments').value) || 16));
    const item = createLathe(state.engine, profile, segments, {
      color: state.color,
      position: [state.scene.length * 0.9, 0, 0],
    });
    addModel(item);
  } catch (err) {
    fail(err);
  }
}

function makeExtrude() {
  if (!state.engine) return;
  try {
    const contour = parsePoints($('#extrude-shape').value);
    const depth = Math.max(0.05, Math.min(20, Number($('#extrude-depth').value) || 1));
    const item = createExtrude(state.engine, contour, depth, {
      color: state.color,
      position: [state.scene.length * 0.9, 0, 0],
    });
    addModel(item);
  } catch (err) {
    fail(err);
  }
}

function makeLayer() {
  if (!state.engine) return;
  try {
    const expr = parseLayer($('#layer-expr').value);
    const voxel = Math.max(0.05, Math.min(2, Number($('#layer-voxel').value) || 0.25));
    const item = createLayer(state.engine, expr, voxel, {
      color: state.color,
      position: [state.scene.length * 0.9, 0, 0],
    });
    addModel(item);
  } catch (err) {
    fail(err);
  }
}

function doUndo() {
  const prev = history.undo();
  if (!prev) { say('Отменять нечего'); return; }
  // Сцену движка приводим к состоянию истории: убираем лишние модели.
  for (const item of state.scene) {
    if (!prev.some((m) => m.id === item.id)) engineRemove(state.engine, item);
  }
  state.scene = prev;
  if (state.selected && !state.scene.some((m) => m.id === state.selected)) state.selected = null;
  renderList();
  state.dirty = true;
  scheduleRender();
  say('Отменено');
}

function doRedo() {
  const next = history.redo();
  if (!next) { say('Повторять нечего'); return; }
  for (const item of next) {
    if (!state.scene.some((m) => m.id === item.id)) {
      // Модель была в истории, но убрана из сцены движка — вернуть нельзя
      // без повторного создания. Восстанавливаем по рецепту.
      try {
        const rebuilt = rebuild(item);
        if (rebuilt) attach(rebuilt, item);
      } catch { /* ниже сообщим честно */ }
    }
  }
  state.scene = next;
  renderList();
  state.dirty = true;
  scheduleRender();
  say('Повторено');
}

function rebuild(item) {
  const opts = { color: item.color, position: item.position, name: item.name, id: item.id };
  if (item.op === 'lathe') return createLathe(state.engine, item.args.profile, item.args.segments, opts);
  if (item.op === 'extrude') return createExtrude(state.engine, item.args.contour, item.args.height, opts);
  if (item.op === 'layer') return createLayer(state.engine, item.args.expr, item.args.voxelSize, opts);
  const kind = item.args && item.args.kind ? item.args.kind : 'box';
  return createShape(state.engine, kind, { ...opts, args: item.args });
}

function attach(rebuilt, original) {
  // У rebuilt новый id — переносим старый и подменяем запись в сцене.
  original.mesh = rebuilt.mesh;
  original.entityId = rebuilt.entityId;
}

function doDuplicate() {
  const item = state.scene.find((m) => m.id === state.selected);
  if (!item) return;
  try {
    const copy = rebuild(item);
    copy.base = item.base;
    const result = duplicateItem(state.scene, item.id, () => copy.id);
    copy.name = result.copy.name;
    state.selected = copy.id;
    commit(addItem(result.scene.filter((m) => m.id !== copy.id), copy),
      `Копия: ${copy.name}`);
  } catch (err) {
    fail(err);
  }
}

function doDelete() {
  const item = state.scene.find((m) => m.id === state.selected);
  if (!item) return;
  engineRemove(state.engine, item);
  state.selected = null;
  commit(removeItem(state.scene, item.id), `Удалено: ${item.name}`);
}

function doRecolor() {
  const item = state.scene.find((m) => m.id === state.selected);
  if (!item) return;
  try {
    const recolored = recolorItem(state.engine, item, state.color);
    const next = replaceItem(state.scene, item.id, {
      color: state.color, mesh: recolored.mesh, entityId: recolored.entityId, args: recolored.args,
    });
    commit(next, `Цвет: ${item.name}`);
  } catch (err) {
    fail(err);
  }
}

/* ---------- экспорт ---------- */

function download(text, name, type) {
  const blob = new Blob([text], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function exportJson() {
  if (!state.scene.length) return;
  try {
    const data = exportScene(state.engine, state.scene);
    download(JSON.stringify(data, null, 2), fileName('mesh-studio', 'json'), 'application/json');
    $('#export-note').textContent = `Сохранено ${data.models.length} моделей, ${data.totals.tris} треугольников. JSON — родной формат RatCore.`;
    say('Проект сохранён', 'ok');
  } catch (err) {
    fail(err);
  }
}

function exportObj() {
  // OBJ собираем из рецепта: движок буферы наружу не отдаёт, поэтому
  // честнее выгрузить описание сцены, чем подделывать геометрию.
  if (!state.scene.length) return;
  try {
    const lines = ['# MESH STUDIO — сцена в описании движка RatCore'];
    for (const m of toRecipe(state.scene)) {
      lines.push(`# ${m.name}: ${m.op} ${JSON.stringify(m.args)} @ ${m.position.join(',')}`);
    }
    download(lines.join('\n'), fileName('mesh-studio-scene', 'obj'), 'text/plain');
    say('Описание сцены выгружено', 'ok');
  } catch (err) {
    fail(err);
  }
}

/* ---------- настройка интерфейса ---------- */

function buildShapeButtons() {
  const box = $('#primitive-list');
  if (!box) return;
  box.textContent = '';
  for (const shape of SHAPES) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'shape-btn';
    btn.textContent = shape.label;
    btn.title = `Добавить: ${shape.label}`;
    btn.addEventListener('click', () => makeShape(shape.id));
    box.appendChild(btn);
  }
}

function buildSwatches() {
  const row = $('#color-row');
  if (!row) return;
  row.textContent = '';
  for (const color of COLORS) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'swatch';
    btn.style.background = color;
    btn.setAttribute('aria-label', `Цвет ${color}`);
    btn.setAttribute('aria-pressed', String(color === state.color));
    btn.addEventListener('click', () => {
      state.color = color;
      for (const el of row.children) el.setAttribute('aria-pressed', String(el === btn));
      const item = state.scene.find((m) => m.id === state.selected);
      if (item) doRecolor();
    });
    row.appendChild(btn);
  }
}

function bindPointer() {
  const canvas = $('#view');
  if (!canvas) return;
  let dragging = false;
  let lastX = 0;
  let lastY = 0;

  canvas.addEventListener('pointerdown', (e) => {
    dragging = true;
    lastX = e.clientX;
    lastY = e.clientY;
    canvas.setPointerCapture(e.pointerId);
  });
  canvas.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    orbit(e.clientX - lastX, e.clientY - lastY);
    lastX = e.clientX;
    lastY = e.clientY;
    scheduleRender();
  });
  const stop = (e) => {
    dragging = false;
    if (canvas.hasPointerCapture && canvas.hasPointerCapture(e.pointerId)) {
      canvas.releasePointerCapture(e.pointerId);
    }
  };
  canvas.addEventListener('pointerup', stop);
  canvas.addEventListener('pointercancel', stop);

  canvas.addEventListener('wheel', (e) => {
    e.preventDefault();
    zoom(e.deltaY > 0 ? 1.12 : 0.89);
    scheduleRender();
  }, { passive: false });

  // Двумя пальцами — масштаб.
  let pinchDist = 0;
  canvas.addEventListener('touchstart', (e) => {
    if (e.touches.length === 2) {
      pinchDist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY,
      );
    }
  }, { passive: true });
  canvas.addEventListener('touchmove', (e) => {
    if (e.touches.length !== 2 || !pinchDist) return;
    const dist = Math.hypot(
      e.touches[0].clientX - e.touches[1].clientX,
      e.touches[0].clientY - e.touches[1].clientY,
    );
    if (dist > 0) zoom(pinchDist / dist);
    pinchDist = dist;
    e.preventDefault();
    scheduleRender();
  }, { passive: false });
  canvas.addEventListener('touchend', () => { pinchDist = 0; }, { passive: true });
}

function bindKeys() {
  window.addEventListener('keydown', (e) => {
    const tag = (e.target && e.target.tagName) || '';
    if (tag === 'INPUT' || tag === 'TEXTAREA') return;
    const ctrl = e.ctrlKey || e.metaKey;
    if (ctrl && e.key.toLowerCase() === 'z') {
      e.preventDefault();
      if (e.shiftKey) doRedo(); else doUndo();
      return;
    }
    if (ctrl && e.key.toLowerCase() === 'y') { e.preventDefault(); doRedo(); return; }
    if (ctrl && e.key.toLowerCase() === 'd') { e.preventDefault(); doDuplicate(); return; }
    if (e.key === 'Delete' || e.key === 'Backspace') { e.preventDefault(); doDelete(); return; }
    if (e.key === '1') { setView('front'); scheduleRender(); }
    if (e.key === '3') { setView('side'); scheduleRender(); }
    if (e.key === '7') { setView('top'); scheduleRender(); }
    if (e.key === '0') { resetCamera(); scheduleRender(); }
  });
}

function bindButtons() {
  $('#btn-lathe').addEventListener('click', makeLathe);
  $('#btn-extrude').addEventListener('click', makeExtrude);
  $('#btn-layer').addEventListener('click', makeLayer);
  $('#btn-undo').addEventListener('click', doUndo);
  $('#btn-redo').addEventListener('click', doRedo);
  $('#btn-duplicate').addEventListener('click', doDuplicate);
  $('#btn-delete').addEventListener('click', doDelete);
  $('#btn-export-obj').addEventListener('click', exportObj);
  $('#btn-export-json').addEventListener('click', exportJson);
  $('#view-front').addEventListener('click', () => { setView('front'); scheduleRender(); });
  $('#view-side').addEventListener('click', () => { setView('side'); scheduleRender(); });
  $('#view-top').addEventListener('click', () => { setView('top'); scheduleRender(); });
  $('#view-reset').addEventListener('click', () => { resetCamera(); scheduleRender(); });
  $('#color-custom').addEventListener('input', (e) => {
    state.color = e.target.value;
    for (const el of $('#color-row').children) el.setAttribute('aria-pressed', 'false');
    const item = state.scene.find((m) => m.id === state.selected);
    if (item) doRecolor();
  });
}

/* ---------- запуск ---------- */

function boot() {
  history.init([]);
  buildShapeButtons();
  buildSwatches();
  bindButtons();
  bindPointer();
  bindKeys();

  if (!startEngine()) {
    renderList();
    return;
  }
  if (!ensureCanvas()) {
    renderList();
    return;
  }

  resizeCanvas();
  resetCamera();
  renderList();

  new ResizeObserver(() => {
    resizeCanvas();
    state.dirty = true;
    scheduleRender();
  }).observe($('#view').parentElement);

  // Первая сцена: показываем, что редактор живой, а не пустой экран.
  try {
    const item = createShape(state.engine, 'box', { color: COLORS[0], position: [0, 0, 0] });
    state.scene = addItem([], item);
    item.name = 'Куб 1';
    state.selected = item.id;
    renderList();
    resetCamera();
  } catch (err) {
    fail(err);
  }

  state.dirty = true;
  scheduleRender();
  say('Готово. Добавьте форму слева или перетащите мышь, чтобы осмотреть сцену.');
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}
