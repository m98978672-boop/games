// ============================================================
// ГАРАЖ 3D — точка входа: каталог, сцена, камера и интерфейс.
// ============================================================
import * as THREE from 'three';
import { createStage, createFallbackStage } from './stage.js';
import { createMaterials, clamp, rad, lerp } from './lib/kit.js';
import { ShowroomCamera } from './lib/camera.js';
import { buildUnit } from './models/index.js';
import { icon } from './lib/icons.js';
import { CATEGORIES, TRUCKS, TRAILERS, CARS, BUILDINGS, findUnit } from './data/units.js';
import { placePanel, rectOf, viewportRect, overlaps, rect } from './lib/layout.js';
import { damageReport } from './lib/damage.js';
import { buildDots, dotsCount } from './lib/dots.js';
import { buildVoxel, voxelStats } from './lib/reconstruct.js';
import { createPreview } from './lib/preview.js';
import { deviceProfile, installGestures, installShake, haptic } from './lib/device.js';

const $ = (id) => document.getElementById(id);
const CAT_LISTS = { trucks: TRUCKS, trailers: TRAILERS, cars: CARS, buildings: BUILDINGS };
const CAT_META = Object.fromEntries(CATEGORIES.map((c) => [c.id, c]));
const PAINTS = ['#e9ecec', '#b9c0c6', '#2f5d8a', '#16233f', '#a4241d', '#7d1a2e', '#cf5a13', '#e0b528', '#1f6b45', '#37a58c', '#0f6b70', '#4b3c85', '#6d2a6b', '#7a3b2a', '#5a3c25', '#c2a878', '#2f353b', '#101214'];
const SAVE_KEY = 'garage3d-showroom-v1';
const VIEW_ICONS = {
  exterior: 'globe', side: 'side', rear: 'rear', front: 'front',
  driver: 'driver', passenger: 'passenger', salon: 'salon', bunk: 'bunk',
  back: 'rear', left: 'side', right: 'side',
};

// Удерживаемые клавиши свободного полёта камеры (W/A/S/D + Q/E по высоте).
const FLY_KEYS = new Set(['KeyW', 'KeyA', 'KeyS', 'KeyD', 'KeyQ', 'KeyE']);
const held = new Set();
const FLY_SPEED = 3.4; // м/с
const FLY_BOOST = 2.8; // множитель по Shift

const state = {
  cat: 'trucks',
  id: 'atlas-vision',
  view: 'exterior',
  preset: 'studio',
  color: null,
  fav: [],
  favOnly: false,
  autoRotate: true,
  search: '',
  compare: null,
  damage: false, // true, если у модели добавлено хотя бы одно пятно
  dmgKind: 'any', // выбранный в меню тип повреждения
  lastDmg: null, // индекс последнего добавленного пятна — для текста
  dots: false, // точечный трафарет: модель собрана из точек
  look: 'solid', // как показана модель: solid | dots | voxel (реконструкция)
};

// Пятна добавляются ПОШТУЧНО: у каждой модели свой набор индексов.
// Кнопка ✷ / X — «все сразу», клик по строке в карточке — одно пятно.
const damageOn = new Map();
function damageKey() {
  return `${state.cat}:${state.id}`;
}
function damageSet() {
  const key = damageKey();
  if (!damageOn.has(key)) damageOn.set(key, new Set());
  return damageOn.get(key);
}

let saved = {};
try { saved = JSON.parse(localStorage.getItem(SAVE_KEY) || '{}') || {}; } catch { saved = {}; }
if (saved.cat && CAT_LISTS[saved.cat]) state.cat = saved.cat;
if (saved.id) state.id = saved.id;
state.fav = Array.isArray(saved.fav) ? saved.fav : [];
state.preset = saved.preset || 'studio';
state.dots = !!saved.dots;
state.look = saved.look === 'dots' || saved.look === 'voxel' ? saved.look : (saved.dots ? 'dots' : 'solid');
const colors = saved.colors && typeof saved.colors === 'object' ? saved.colors : {};

function saveState() {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify({ cat: state.cat, id: state.id, fav: state.fav, preset: state.preset, colors, dots: state.dots, look: state.look }));
  } catch { /* приватный режим */ }
}

function currentUnit() {
  return findUnit(state.cat, state.id);
}

// ------------------------------------------------------------ сцена
// Если WebGL нет — не оставляем пользователя с пустой страницей:
// каталог, спецификации, виды и покраска продолжают работать.
let stage;
let webglOk = true;
// заранее проверяем контекст: так мы не пугаем консоль ошибкой three.js
function hasWebGL() {
  try {
    const probe = document.createElement('canvas');
    return !!(probe.getContext('webgl2') || probe.getContext('webgl'));
  } catch { return false; }
}
try {
  if (!hasWebGL()) throw new Error('WebGL context is not available');
  stage = createStage($('gl'));
} catch (e) {
  webglOk = false;
  stage = createFallbackStage();
  const box = document.createElement('div');
  box.className = 'webgl-error';
  box.innerHTML = '<b>3D недоступно в этом браузере</b><span>Не удалось создать WebGL-контекст: включите аппаратное ускорение. Каталог, характеристики и список видов ниже работают и без 3D.</span>';
  $('viewport').appendChild(box);
  $('gl').classList.add('hidden');
  console.warn('ГАРАЖ 3D: WebGL недоступен, включён режим каталога.', e);
}
const M = createMaterials(stage.renderer);
const device = deviceProfile();
const cam = new ShowroomCamera(stage.camera, $('gl'), { touch: device.touch });
// камера доступна из консоли и из тестов: window.__garageCam.orbit(0.2, 0)
if (typeof window !== 'undefined') window.__garageCam = cam;
// класс устройства — в <html class>, чтобы CSS знал, что перед ним:
// телефон, планшет или десктоп (тач-цели крупнее, подсказки другие)
document.documentElement.classList.toggle('is-touch', device.touch);
document.documentElement.classList.toggle('is-phone', device.phone);
document.documentElement.classList.toggle('is-tablet', device.tablet);
document.documentElement.classList.toggle('is-desktop', device.desktop);
document.documentElement.classList.toggle('is-coarse', device.coarse);
document.documentElement.classList.toggle('is-portrait', device.portrait);
const syncOrientation = () => {
  const portrait = (window.innerHeight || 0) >= (window.innerWidth || 0);
  document.documentElement.classList.toggle('is-portrait', portrait);
  document.documentElement.classList.toggle('is-landscape', !portrait);
};
syncOrientation();
window.addEventListener('orientationchange', () => setTimeout(syncOrientation, 120));
window.addEventListener('resize', syncOrientation);
const scene = stage.scene;

let shown = null;
// views/anchors появляются только после сборки геометрии — держим их
// на самой модели, чтобы каталог, док и хоткеи работали сразу.
const builtCache = new Map();
function cacheKey(unit) {
  return `${unit.category}:${unit.id}`;
}
function viewsOf(unit) {
  if (Array.isArray(unit.views) && unit.views.length) return unit.views;
  const key = cacheKey(unit);
  if (!builtCache.has(key)) rememberBuilt(unit, buildUnit(unit, M));
  const built = builtCache.get(key);
  unit.views = built.views;
  unit.anchors = built.anchors;
  return unit.views;
}
function takeBuilt(unit) {
  const key = cacheKey(unit);
  const built = builtCache.get(key);
  if (built) builtCache.delete(key);
  return built;
}
// кэш держим маленьким: одна модель — это десятки тысяч треугольников
const CACHE_LIMIT = 6;
function rememberBuilt(unit, built) {
  const key = cacheKey(unit);
  if (builtCache.has(key)) builtCache.delete(key);
  builtCache.set(key, built);
  while (builtCache.size > CACHE_LIMIT) {
    const [oldKey, oldBuilt] = builtCache.entries().next().value;
    builtCache.delete(oldKey);
    oldBuilt.root.traverse((o) => {
      o.geometry?.dispose?.();
    });
  }
}
let pending = null;
let busy = false;
let compareGroup = null;
let autoRotateWanted = true;

const live = (text) => {
  const el = $('stage-live');
  el.textContent = text;
  el.classList.add('show');
  clearTimeout(live.t);
  live.t = setTimeout(() => el.classList.remove('show'), 1800);
};

/** Вмятины — часть кузова: при перекраске они меняют цвет вместе с панелью. */
function paintDamage(built, hex) {
  built?.root?.traverse?.((o) => {
    if (o.userData?.damage && o.userData.takesPaint && o.material?.color) o.material.color.set(hex);
  });
}

function clearShown() {
  if (shown) {
    scene.remove(shown.root);
    shown.root.traverse((o) => {
      if (o.geometry) o.geometry.dispose?.();
      if (o.material) {
        const mats = Array.isArray(o.material) ? o.material : [o.material];
        for (const m of mats) {
          if (m && m.__shared !== true) m.dispose?.();
        }
      }
    });
    shown = null;
  }
}

// ---------- повреждение: пятно на кузове, у каждой модели своё
// ------------------------------------------------------------ точечный трафарет
// «Точки» рисуют ту же модель, но собранную из точек: сначала по рёбрам
// (контур-трафарет), потом по поверхности. Считается лениво — при первом
// включении, дальше облако живёт рядом с моделью и переживает кэш.
function ensureDots(built) {
  if (!built?.root) return null;
  if (!built.dots) {
    const profile = deviceProfile();
    built.dots = buildDots(built.root, {
      target: profile.mobile ? 30000 : 62000,
      size: profile.mobile ? 0.03 : 0.022,
    });
    built.root.add(built.dots);
  }
  return built.dots;
}

function ensureVoxel(built) {
  if (!built?.root) return null;
  if (!built.voxel) {
    const profile = deviceProfile();
    built.voxel = buildVoxel(built.root, { target: profile.mobile ? 30000 : 62000 });
    if (built.voxel) built.root.add(built.voxel);
  }
  return built.voxel;
}

/** Показ модели: поверхности, точки или реконструкция из точек. */
function applyLook() {
  const built = shown;
  if (!built?.root) return;
  const look = state.look;
  built.root.traverse((o) => {
    if (o.name === 'dots' || o.name === 'voxel') return;
    if (o.isMesh || o.isInstancedMesh) {
      if (o.userData.lookBase === undefined) o.userData.lookBase = o.visible;
      o.visible = look === 'solid' ? o.userData.lookBase : false;
    }
  });
  const dots = built.root.getObjectByName('dots');
  if (dots) dots.visible = look === 'dots';
  const vox = built.root.getObjectByName('voxel');
  if (vox) vox.visible = look === 'voxel';
  document.body.dataset.look = look;
  document.body.dataset.dots = look === 'dots' ? 'on' : 'off';
  const dbtn = $('dots-btn');
  if (dbtn) {
    dbtn.classList.toggle('active', look === 'dots');
    dbtn.setAttribute('aria-pressed', look === 'dots' ? 'true' : 'false');
  }
  const vbtn = $('voxel-btn');
  if (vbtn) {
    vbtn.classList.toggle('active', look === 'voxel');
    vbtn.setAttribute('aria-pressed', look === 'voxel' ? 'true' : 'false');
  }
}

function setLook(look, { announce = true, rebuild = false } = {}) {
  const next = look === 'dots' || look === 'voxel' ? look : 'solid';
  state.look = next;
  state.dots = next === 'dots';
  const built = shown;
  if (built?.root) {
    if (next === 'dots') {
      if (rebuild && built.dots) {
        built.root.remove(built.dots);
        built.dots.geometry.dispose();
        built.dots.material.dispose();
        built.dots = null;
      }
      ensureDots(built);
    }
    if (next === 'voxel' && rebuild && built.voxel) {
      built.root.remove(built.voxel);
      built.voxel.geometry.dispose();
      built.voxel.material.dispose();
      built.voxel = null;
    }
    if (next === 'voxel') ensureVoxel(built);
    applyLook();
    if (next === 'solid') applyDamage();
  }
  refreshPreviewCaption();
  saveState();
  if (announce) {
    if (next === 'solid') live('Обычный вид: поверхности');
    else if (next === 'dots') live(`Точки: ${dotsCount(shown?.root).toLocaleString('ru-RU')} точек — модель собрана из трафарета`);
    else {
      const st = voxelStats(shown?.voxel);
      live(`Реконструкция: ${st.cells.toLocaleString('ru-RU')} клеток по ${(st.cell * 100).toFixed(0)} см — модель собрана заново из точек`);
    }
  }
  haptic(6);
  return next;
}

function setDots(on, opts = {}) {
  return setLook(on ? 'dots' : 'solid', opts);
}

function setVoxel(on) {
  return setLook(on ? 'voxel' : 'solid');
}

function toggleDots() {
  setDots(state.look !== 'dots');
}

function toggleVoxel() {
  setVoxel(state.look !== 'voxel');
}

function applyDamage() {
  const list = shown?.damage?.list || [];
  const set = damageSet();
  // пятно видно только если его добавили; группа прячется, когда не добавлено ни одного
  list.forEach((item, i) => {
    item.patch.visible = set.has(i);
  });
  const any = set.size > 0;
  state.damage = any;
  if (shown?.damage?.group) shown.damage.group.visible = any;
  for (const id of ['damage-btn', 'damage-btn-2']) $(id)?.classList.toggle('on', any);
  $('damage-btn')?.classList.toggle('active', any);
  // в режиме точек/реконструкции поверхности скрыты — пятна тоже
  if (state.look !== 'solid' && shown?.root) applyLook();
  refreshPreviewCaption();
}

function toggleDamage() {
  if (!shown || !shown.damage) {
    live('У этой модели нет повреждений');
    return;
  }
  const set = damageSet();
  if (set.size) {
    set.clear();
    live('Все повреждения убраны');
  } else {
    shown.damage.list.forEach((_, i) => set.add(i));
    live(`Добавлены все повреждения: ${set.size} шт.`);
  }
  applyDamage();
  renderDetails(currentUnit());
}

/** Добавить/убрать ОДНО повреждение по индексу. */
function toggleDamageAt(index) {
  if (!shown?.damage?.list?.[index]) return;
  const set = damageSet();
  const item = shown.damage.list[index];
  const has = set.has(index);
  if (has) set.delete(index);
  else set.add(index);
  applyDamage();
  renderDetails(currentUnit());
  live(has ? `Убрано: ${item.spec.label}` : `Добавлено: ${item.spec.label}`);
}

/** Добавить одно случайное ещё не добавленное повреждение (кнопка «ещё»). */
function addRandomDamage() {
  const list = shown?.damage?.list || [];
  const set = damageSet();
  const free = list.map((_, i) => i).filter((i) => !set.has(i));
  if (!free.length) {
    live('Все пятна уже добавлены');
    return;
  }
  const pick = free[Math.floor(Math.random() * free.length)];
  set.add(pick);
  applyDamage();
  renderDetails(currentUnit());
  live(`Добавлено: ${list[pick].spec.label}`);
}

function showUnit(unit, { instant = false, view = null } = {}) {
  busy = true;
  $('loader').classList.remove('hidden');
  clearShown();
  // даём браузеру перерисовать оверлей, затем строим
  setTimeout(() => {
    const built = takeBuilt(unit) || buildUnit(unit, M);
    // уникальная краска для этой модели
    const colorHex = colors[unit.id] || unit.paint;
    for (const m of built.paintMats) {
      if (m && m.color) m.color.set(colorHex);
    }
    paintDamage(built, colorHex);
    scene.add(built.root);
    shown = built;
    if (state.look === 'dots') ensureDots(built);
    if (state.look === 'voxel') ensureVoxel(built);
    applyDamage();
    setLook(state.look, { announce: false });
    // счётчик треугольников
    let tris = 0;
    built.root.traverse((o) => {
      if (o.isMesh && o.geometry) {
        const g = o.geometry;
        const idx = g.index ? g.index.count : g.attributes.position?.count || 0;
        tris += idx / 3;
      }
    });
    $('poly-badge').textContent = `${Math.round(tris / 1000)}K полигонов`;
    const v = view || viewsOf(unit).find((x) => x.id === (instant ? 'exterior' : state.view)) || viewsOf(unit)[0];
    state.view = v.id;
    cam.controls.autoRotate = !!v.autoRotate && autoRotateWanted && state.view === 'exterior';
    cam.setView(v, { instant });
    renderViewSwitch(unit);
    setActiveChips(unit);
    $('mode-badge').textContent = modeLabel(unit, v);
    $('loader').classList.add('hidden');
    busy = false;
    renderDetails(unit);
    $('compare-btn')?.classList.toggle('on', !!state.compare);
    $('compare-btn-2')?.classList.toggle('active', !!state.compare);
    applyDamage();
    if (pending) {
      const p = pending;
      pending = null;
      showUnit(p.unit, p.opts);
    }
  }, 60);
}

function select(cat, id, { instant = false } = {}) {
  state.cat = cat;
  state.id = id;
  saveState();
  const unit = currentUnit();
  renderList();
  renderDetails(unit);
  renderDamageMenu();
  renderViewMenu();
  guardStage();
  setActiveChips(unit);
  const rootName = `${unit.category === 'trailers' ? 'trailer' : unit.category === 'cars' ? 'car' : 'truck'}:${unit.id}`;
  if (!shown || shown.root.name !== rootName) {
    if (busy) {
      pending = { unit, opts: { instant } };
      return;
    }
    showUnit(unit, { instant, view: viewsOf(unit)[0] });
  }
}

// ------------------------------------------------------------ слои интерфейса
// Правило шоурума: никакие два видимых слоя не пересекаются. Меню — плавающие:
// встают под своей кнопкой, прижимаются к краям и уезжают, если место занято
// навпадом, доком, шапкой или другой панелью (расчёт — в lib/layout.js).
// Размеры панелей: меню — крупные окна по центру экрана, а не «попапы» у кнопки
const POPS = {
  catalog: { pop: 'panel-catalog', btn: 'catalog-toggle', size: { w: 760, h: 620 } },
  view: { pop: 'menu-view', btn: 'menu-view-btn', size: { w: 620, h: 460 } },
  damage: { pop: 'menu-damage', btn: 'menu-damage-btn', size: { w: 820, h: 600 } },
  light: { pop: 'light-pop', btn: 'light-btn', size: { w: 560, h: 320 } },
  more: { pop: 'menu-more', btn: 'menu-more-btn', size: { w: 620, h: 460 } },
};
let openPop = null;
let openDrawer = null;

// Меню нельзя держать внутри шапки: у неё backdrop-filter, а он превращает
// position: fixed в «привязку к родителю». Переносим все меню в отдельный
// слой поверх страницы — тогда координаты считаются от угла экрана.
function ensurePopLayer() {
  let layer = document.getElementById('pop-layer');
  if (!layer) {
    layer = document.createElement('div');
    layer.id = 'pop-layer';
    document.body.appendChild(layer);
  }
  for (const key of Object.keys(POPS)) {
    const el = $(POPS[key].pop);
    if (el && el.parentElement !== layer) layer.appendChild(el);
  }
  return layer;
}

function sizeOf(el, fallback) {
  const box = el.getBoundingClientRect ? el.getBoundingClientRect() : {};
  const w = el.offsetWidth || box.width || 0;
  const h = el.offsetHeight || box.height || 0;
  return { w: Math.round(w) || fallback.w, h: Math.round(h) || fallback.h };
}

/** Прямоугольники, на которые меню не имеет права лечь. */
function busyRects(self) {
  const out = [];
  const add = (sel) => {
    const el = document.querySelector(sel);
    if (!el || el === self) return;
    const r = rectOf(el);
    if (r) out.push(r);
  };
  for (const sel of ['.hud-top', '.hud-bottom', '.stage-top', '.stage-actions', '#navpad', '#dock-views-wrap', '#stage-live', '#panel-details.open']) add(sel);
  for (const key of Object.keys(POPS)) {
    const el = $(POPS[key].pop);
    if (!el || el === self || el.classList.contains('hidden')) continue;
    const r = rectOf(el);
    if (r) out.push(r);
  }
  return out;
}

/** Поставить открытое меню так, чтобы оно ничего не перекрывало. */
/** Затемнение под меню: панель читается как окно, а не как «прилипшая» плашка. */
function popBackdrop() {
  let el = document.getElementById('pop-backdrop');
  if (!el) {
    el = document.createElement('div');
    el.id = 'pop-backdrop';
    el.className = 'pop-backdrop hidden';
    document.getElementById('pop-layer')?.appendChild(el) || document.body.appendChild(el);
    el.onclick = () => closePop();
  }
  return el;
}

function syncPopBackdrop() {
  const el = popBackdrop();
  el.classList.toggle('hidden', !openPop);
}

/**
 * Меню ставится ПО ЦЕНТРУ экрана между шапкой и нижней панелью — как обычное
 * окно приложения. Ширина фиксированная, чтобы панель не «прыгала», высота
 * ограничена свободным местом, внутри остаётся своя прокрутка.
 */
function positionPop(name) {
  const conf = POPS[name];
  const el = conf && $(conf.pop);
  if (!el || el.classList.contains('hidden')) return null;
  const view = viewportRect();
  const wide = view.w >= 900;
  const margin = wide ? 24 : 8;
  const w = Math.max(260, Math.min(conf.size.w, view.w - margin * 2));
  const topLimit = wide ? 66 : 62;
  const bottomLimit = view.h - (wide ? 24 : 76);
  const avail = Math.max(200, bottomLimit - topLimit);
  el.style.width = `${w}px`;
  el.style.maxWidth = `${w}px`;
  el.style.maxHeight = `${avail}px`;
  const natural = sizeOf(el, conf.size).h;
  const h = Math.min(natural, avail);
  const x = Math.round((view.w - w) / 2);
  // если панель ниже свободного места — прижимаем к верху, иначе центрируем
  const y = Math.round(natural <= avail ? topLimit + (avail - h) / 2 : topLimit);
  el.style.left = `${x}px`;
  el.style.top = `${y}px`;
  el.dataset.side = 'center';
  el.dataset.wide = wide ? '1' : '0';
  return { x, y, w, h, side: 'center', free: h >= natural };
}

function closePops(except = null) {
  for (const key of Object.keys(POPS)) {
    if (key === except) continue;
    const el = $(POPS[key].pop);
    if (!el || el.classList.contains('hidden')) continue;
    el.classList.add('hidden');
    el.classList.remove('open');
    $(POPS[key].btn)?.setAttribute('aria-expanded', 'false');
  }
  if (openPop && openPop !== except) {
    openPop = null;
    unmountPreview();
  }
  syncPopBackdrop();
}

function closePop() {
  closePops();
  openPop = null;
  unmountPreview();
}

// ------------------------------------------------------------ предпросмотр в меню
// Меню затемняет сцену, поэтому внутри окна живёт своё маленькое окно:
// второй рендерер рисует ту же сцену своей камерой и кадрирует модель целиком.
let preview = null;
let previewBroken = false;
let previewAt = 0;

function previewBlock() {
  let el = $('pop-preview');
  if (el) return el;
  el = document.createElement('div');
  el.className = 'pop-preview';
  el.id = 'pop-preview';
  el.innerHTML = '<div class="pp-frame">'
    + '<canvas id="pp-canvas" width="480" height="270" aria-label="Предпросмотр модели" role="img"></canvas>'
    + '<span class="pp-hint">предпросмотр недоступен без 3D</span>'
    + '</div>'
    + '<div class="pp-cap"><b id="pp-name">—</b><span id="pp-sub"></span></div>';
  return el;
}

function previewCaption(unit = currentUnit()) {
  const name = $('pp-name');
  if (!name) return;
  const view = viewsOf(unit).find((v) => v.id === state.view) || viewsOf(unit)[0];
  const preset = { studio: 'Студия', dark: 'Ночь', show: 'Выставка', garage: 'Гараж' }[state.preset] || '';
  const bits = [view?.label || view?.id || '', preset];
  if (state.look === 'dots') bits.push('точки');
  if (state.look === 'voxel') bits.push('реконструкция');
  const dmg = damageSet().size;
  if (dmg) bits.push(`${dmg} поврежд.`);
  name.textContent = unit.name || unit.id;
  const sub = $('pp-sub');
  if (sub) sub.textContent = bits.filter(Boolean).join(' · ');
}

/** Рисуем кадр «сейчас»: при открытии меню и после каждого изменения. */
function drawPreview() {
  const el = openPop ? $(POPS[openPop]?.pop) : null;
  if (!el || el.classList.contains('hidden')) return;
  // подпись обновляем всегда — она нужна и когда 3D недоступно
  previewCaption();
  if (!preview || !shown?.root) return;
  preview.draw(scene, shown.root, stage.camera.position);
}

/** Ставим окно предпросмотра в открытое меню (перед содержимым). */
function mountPreview(popEl) {
  if (!popEl) return null;
  const el = previewBlock();
  el.classList.remove('hidden');
  popEl.classList.add('has-preview');
  const head = popEl.querySelector('.pop-head');
  if (head) head.insertAdjacentElement('afterend', el);
  else popEl.insertBefore(el, popEl.firstChild);
  if (!preview && !previewBroken) {
    const canvas = el.querySelector('#pp-canvas');
    preview = canvas ? createPreview(canvas) : null;
    if (!preview) {
      previewBroken = true;
      el.classList.add('no-webgl');
    }
  }
  drawPreview();
  return el;
}

/** Подпись обновляем сразу, кадр — следующим тиком цикла. */
function refreshPreviewCaption() {
  if (openPop && !$('pop-preview')?.classList.contains('hidden')) previewCaption();
}

function unmountPreview() {
  $('pop-preview')?.classList.add('hidden');
}

function openPopover(name) {
  const conf = POPS[name];
  if (!conf) return;
  const el = $(conf.pop);
  if (!el) return;
  const wasOpen = openPop === name && !el.classList.contains('hidden');
  closePops(name);
  // карточка модели — тоже слой: открывая меню, убираем её, чтобы не легли друг на друга
  setDrawer(null);
  if (wasOpen) {
    closePop();
    return;
  }
  if (name === 'damage') renderDamageMenu();
  if (name === 'view') renderViewMenu();
  el.classList.remove('hidden');
  el.classList.add('open');
  $(conf.btn)?.setAttribute('aria-expanded', 'true');
  openPop = name;
  mountPreview(el);
  syncPopBackdrop();
  positionPop(name);
  if (name === 'catalog') {
    setTimeout(() => positionPop('catalog'), 40);
    setTimeout(() => $('search')?.focus({ preventScroll: true }), 220);
  }
}

/** Правая карточка модели — единственная «настоящая» шторка. */
function setDrawer(name) {
  const next = name === 'details' ? 'details' : null;
  openDrawer = next;
  const el = $('panel-details');
  el?.classList.toggle('open', next === 'details');
  $('details-toggle')?.setAttribute('aria-expanded', String(next === 'details'));
  $('backdrop')?.classList.toggle('show', next === 'details');
  if (next === 'details') {
    closePop();
    renderDetails(currentUnit());
  }
}

function closeDrawer() {
  if (!openDrawer) return false;
  setDrawer(null);
  return true;
}

/** Если элементы сцены всё-таки сошлись (очень узкий экран) — поднимаем док. */
function guardStage() {
  const dock = document.querySelector('.dock');
  const pad = $('navpad');
  const acts = document.querySelector('.stage-actions');
  if (!dock) return;
  const d = rectOf(dock);
  const blocked = !!d && (overlaps(d, rectOf(pad), 6) || overlaps(d, rectOf(acts), 6));
  dock.classList.toggle('dock-lift', blocked);
  document.documentElement.classList.toggle('no-room', window.innerWidth < 380);
}

// ------------------------------------------------------------ список каталога
function iconFor(unit) {
  if (unit.category === 'buildings') return 'building';
  if (unit.category === 'cars') return 'car';
  if (unit.category === 'trailers') return 'trailer';
  return 'truck';
}

function renderList() {
  const list = $('unit-list');
  const q = state.search.trim().toLowerCase();
  const units = CAT_LISTS[state.cat].filter((u) => {
    if (state.favOnly && !state.fav.includes(u.id)) return false;
    if (!q) return true;
    return [u.name, u.brand, u.tagline, u.type, ...(u.tags || []), ...(u.specs || []).flat()].join(' ').toLowerCase().includes(q);
  });
  list.innerHTML = '';
  // число уже стоит в шапке — в подсказке оставляем только описание
  const hintText = String(CAT_META[state.cat].hint || '').replace(/^[^·]*·\s*/, '');
  $('cat-hint').textContent = hintText + (state.favOnly ? ' · только избранное' : '');
  $('catalog-count').textContent = units.length;
  if ($('cat-count')) {
    const total = CAT_LISTS[state.cat].length;
    $('cat-count').textContent = units.length === total ? `${total}` : `${units.length} / ${total}`;
  }
  if (!units.length) {
    list.innerHTML = '<p class="mini" style="padding:14px">Ничего не найдено. Очистите поиск или избранное.</p>';
    return;
  }
  units.forEach((u, i) => {
    const btn = document.createElement('button');
    btn.className = 'unit' + (u.id === state.id && u.category === state.cat ? ' active' : '');
    btn.setAttribute('role', 'option');
    btn.setAttribute('aria-selected', String(u.id === state.id));
    const color = colors[u.id] || u.color || u.paint || '#888';
    btn.innerHTML = `
      <span class="thumb">${icon(iconFor(u))}</span>
      <span>
        <span class="u-name"><i class="swatch" style="background:${color}"></i>${u.name}</span>
        <span class="u-sub">${u.tagline || ''}</span>
      </span>
      <span class="u-idx">${String(CAT_LISTS[state.cat].indexOf(u) + 1).padStart(2, '0')}</span>
      ${state.fav.includes(u.id) ? '<span class="fav-dot">★</span>' : ''}
    `;
    btn.onclick = () => {
      if (u.id === state.id && u.category === state.cat) {
        // повторный клик — смена вида внутрь/наружу
        toggleInside();
        return;
      }
      select(state.cat, u.id);
      // На узком экране (телефон, планшет, дробное окно) после выбора
      // каталог закрываем — иначе сцену не видно. Ширину берём фактическую:
      // matchMedia есть не везде и в тестах его подменяют.
      if (window.innerWidth <= 900 || window.matchMedia?.('(max-width: 900px)').matches) closePop();
    };
    list.appendChild(btn);
  });
  const activeEl = list.querySelector('.unit.active');
  if (activeEl && typeof activeEl.scrollIntoView === 'function') activeEl.scrollIntoView({ block: 'nearest' });
}

function catLabel(unit) {
  const cat = unit.category;
  if (cat === 'trucks') return 'ТЯГАЧ';
  if (cat === 'trailers') return 'ПРИЦЕП';
  if (cat === 'buildings') return 'ЗДАНИЕ';
  return 'АВТОМОБИЛЬ';
}

function renderDetails(unit) {
  $('d-brand').textContent = `${unit.brand || '—'} · 2026`;
  $('d-name').textContent = unit.name;
  $('d-cat').textContent = catLabel(unit);
  $('d-desc').textContent = unit.desc || unit.tagline || '';
  $('unit-kind').textContent = catLabel(unit) + (unit.meta ? ` · ${unit.meta}` : '');
  if ($('dock-cat-name')) $('dock-cat-name').textContent = CAT_META[state.cat]?.short || '';
  $('unit-name').textContent = unit.name;
  $('unit-tagline').textContent = unit.tagline || '';
  const tags = $('d-tags');
  tags.innerHTML = '';
  for (const t of unit.tags || []) {
    const s = document.createElement('span');
    s.className = 'tag';
    s.textContent = t;
    tags.appendChild(s);
  }
  const grid = $('spec-grid');
  grid.innerHTML = '';
  for (const [k, v] of unit.specs || []) {
    const d = document.createElement('div');
    d.className = 'spec';
    d.innerHTML = `<span>${k}</span><b>${v}</b>`;
    grid.appendChild(d);
  }
  // покраска
  const row = $('paint-row');
  row.innerHTML = '';
  const custom = colors[unit.id] || unit.paint || unit.color;
  const palette = [...new Set([unit.paint || unit.color || '#e9ecec', ...PAINTS])];
  palette.forEach((hex) => {
    const b = document.createElement('button');
    b.className = 'paint-dot' + (hex.toLowerCase() === String(custom).toLowerCase() ? ' active' : '');
    b.style.background = hex;
    b.title = hex;
    b.onclick = () => recolor(unit, hex);
    row.appendChild(b);
  });
  // повреждение: подпись + кнопка показа
  const dmgRow = $('damage-row');
  const dmgList = $('damage-list');
  const countEl = $('damage-count');
  if (dmgRow && dmgList) {
    dmgRow.innerHTML = '';
    dmgList.innerHTML = '';
    const dmg = shown && shown.damage ? shown.damage : null;
    const set = damageSet();
    const total = dmg ? dmg.count || dmg.list.length : 0;
    if (countEl) countEl.textContent = `${set.size} / ${total}`;
    if ($('damage-count-2')) $('damage-count-2').textContent = `${set.size} / ${total}`;
    if ($('damage-menu-count')) $('damage-menu-count').textContent = `${set.size} / ${total}`;
    // мастер-кнопка: добавить/убрать все пятна этой модели
    const b = document.createElement('button');
    b.className = 'damage-btn' + (dmg && set.size ? ' on' : '');
    b.innerHTML = dmg
      ? `<span class="damage-dot"></span><span class="damage-text">${set.size} шт. · ${total} на кузове</span><span class="damage-key">X</span>`
      : '<span class="damage-text">Повреждения не заданы</span>';
    b.disabled = !dmg;
    b.onclick = () => toggleDamage();
    dmgRow.appendChild(b);
    const more = document.createElement('button');
    more.className = 'damage-btn damage-more';
    more.innerHTML = '<span class="damage-text">＋ ещё одно</span>';
    more.disabled = !dmg || set.size >= total;
    more.onclick = () => addRandomDamage();
    dmgRow.appendChild(more);
    // поштучно: каждое пятно отдельной строкой
    if (dmg) {
      dmg.list.forEach((item, i) => {
        const chip = document.createElement('button');
        chip.className = `dmg-chip ${item.spec.kind}` + (set.has(i) ? ' on' : '');
        chip.dataset.index = String(i);
        chip.dataset.kind = item.spec.kind;
        chip.title = item.spec.label;
        chip.innerHTML = `<span class="dmg-kind"></span><span class="dmg-name">${item.spec.label}</span>`;
        chip.onclick = () => toggleDamageAt(i);
        dmgList.appendChild(chip);
      });
    }
    renderDamageReport();
    renderDamageMenu();
  }
  // точки осмотра
  const anchors = $('anchor-row');
  anchors.innerHTML = '';
  if (shown && shown.anchors) {
    // пятна повреждений не выводим в список осмотра — их 15 на машину,
    // они включаются кнопкой «Повреждение», а в списке остаются узлы
    const listed = shown.anchors.filter((a) => !a.damage);
    $('anchor-count').textContent = listed.length;
    listed.forEach((a) => {
      const b = document.createElement('button');
      b.className = 'anchor-btn';
      b.textContent = a.label + (a.side ? ` (${a.side})` : '');
      b.onclick = () => focusAnchor(a);
      anchors.appendChild(b);
    });
  } else {
    $('anchor-count').textContent = '0';
  }
  // счётчик
  const idx = CAT_LISTS[state.cat].findIndex((u) => u.id === unit.id);
  $('counter').textContent = `${idx + 1} / ${CAT_LISTS[state.cat].length}`;
}

/**
 * «Буквальная» часть повреждений: каждый включённый дефект описан словами —
 * деталь, вид, серьёзность, что нарушено и во что станет ремонт.
 */
function renderDamageReport() {
  const box = $('damage-report');
  if (!box) return;
  const dmg = shown?.damage || null;
  const set = damageSet();
  box.innerHTML = '';
  if (!dmg) {
    box.innerHTML = '<p class="mini">У зданий повреждений нет — дефекты заданы только технике.</p>';
    return;
  }
  const report = damageReport(dmg, [...set]);
  const head = document.createElement('p');
  head.className = 'dmg-summary' + (report.count ? ' on' : '');
  head.textContent = report.text;
  box.appendChild(head);
  for (const item of report.items) {
    const row = document.createElement('div');
    row.className = `dmg-note ${item.spec.kind}`;
    const b = document.createElement('b');
    b.textContent = `${item.spec.kindTitle} · ${item.spec.where}`;
    const span = document.createElement('span');
    span.textContent = `${item.spec.severity} · ${item.spec.effect} · ${item.spec.fix}`;
    const cost = document.createElement('i');
    cost.textContent = `≈ ${item.spec.cost.toLocaleString('ru-RU')} ₽`;
    row.append(b, span, cost);
    box.appendChild(row);
  }
}

/**
 * Меню повреждений: сверху тип, ниже — места. Ткнул тип — пятно встало на
 * свободную деталь; ткнул место — включил/убрал конкретный дефект.
 */
/** Кузов делится на понятные зоны: 15 строк подряд читать невозможно.
 *  Правила идут от частного к общему — «крышка багажника» это корма,
 *  а не крыша, «боковина бака» — бак, а не борт. */
const DMG_ZONES = [
  { id: 'frame', title: 'Рама, низ и бак', re: /рам[аеыу]|лонжерон|брызгов|порог|юбк|настил|бак|седло|тележ|ось|диск|ящик/i },
  { id: 'ends', title: 'Перед и корма', re: /бампер|капот|решёт|решет|фар|фонар|крышк|багажник|отбойник|номер/i },
  { id: 'cabin', title: 'Кабина и крыша', re: /кабин|крыш|стойк|лобов|стекл|зеркал|спальн/i },
  { id: 'body', title: 'Двери и борта', re: /двер|борт|боковин|крыл|лючок|тент|штор|кузов|фургон|реф|стенк|сетк|щит/i },
];
// порядок правил — от частного к общему, а порядок показа — сверху вниз по машине
const DMG_ZONE_ORDER = ['cabin', 'body', 'ends', 'frame', 'other'];

function zoneOf(spec) {
  const where = `${spec.part || ''} ${spec.where || ''}`;
  for (const z of DMG_ZONES) if (z.re.test(where)) return z.id;
  return 'other';
}

function renderDamageMenu() {
  const places = $('dmg-place-list');
  const dmg = shown?.damage || null;
  const set = damageSet();
  const list = dmg?.list || [];
  const typeRow = $('damage-type-row');
  if (typeRow) {
    typeRow.querySelectorAll('.dmg-type').forEach((b) => {
      b.classList.toggle('is-on', b.dataset.kind === state.dmgKind);
      b.disabled = !dmg;
    });
  }
  if ($('damage-menu-count')) $('damage-menu-count').textContent = `${set.size} / ${dmg ? list.length : 0}`;
  if ($('damage-all')) $('damage-all').disabled = !dmg;
  if ($('damage-clear')) $('damage-clear').disabled = !dmg || set.size === 0;
  if (!places) return;
  places.innerHTML = '';
  if (!dmg) {
    places.innerHTML = '<p class="mini">У этой модели нет повреждений — здания осматриваем по фасадам.</p>';
    return;
  }
  // раскладываем дефекты по зонам, внутри зоны — как в спецификации
  const buckets = new Map();
  list.forEach((item, i) => {
    const id = zoneOf(item.spec);
    if (!buckets.has(id)) buckets.set(id, []);
    buckets.get(id).push(i);
  });
  const order = DMG_ZONE_ORDER;
  for (const id of order) {
    const idx = buckets.get(id);
    if (!idx || !idx.length) continue;
    const title = DMG_ZONES.find((z) => z.id === id)?.title || 'Прочее';
    const onCount = idx.filter((i) => set.has(i)).length;
    const grp = document.createElement('div');
    grp.className = 'dmg-group';
    grp.dataset.zone = id;
    const head = document.createElement('button');
    head.className = 'dmg-group-t';
    head.setAttribute('aria-expanded', 'true');
    head.innerHTML = `<span class="caret">▾</span><span class="n">${title}</span>`
      + `<span class="cnt">${onCount} из ${idx.length}</span>`;
    const body = document.createElement('div');
    body.className = 'dmg-group-body';
    head.onclick = () => {
      const open = head.getAttribute('aria-expanded') !== 'true';
      head.setAttribute('aria-expanded', open ? 'true' : 'false');
      body.classList.toggle('folded', !open);
    };
    for (const i of idx) {
      const item = list[i];
      const kindMatch = state.dmgKind === 'any' || item.spec.kind === state.dmgKind;
      const b = document.createElement('button');
      b.className = `dmg-place ${item.spec.kind}` + (set.has(i) ? ' on' : '') + (kindMatch ? '' : ' dim');
      b.dataset.index = String(i);
      b.dataset.kind = item.spec.kind;
      b.setAttribute('aria-pressed', set.has(i) ? 'true' : 'false');
      b.title = item.spec.text;
      b.innerHTML = `<span class="dmg-kind"></span><span class="dmg-place-name">${item.spec.where}</span>`
        + `<span class="dmg-place-tag">${item.spec.severity}</span>`;
      b.onclick = () => {
        toggleDamageAt(i);
        rememberDamage(i);
        positionPop('damage');
      };
      body.appendChild(b);
    }
    grp.append(head, body);
    places.appendChild(grp);
  }
  const note = $('damage-note');
  if (note) {
    const last = state.lastDmg != null && list[state.lastDmg];
    note.textContent = last
      ? list[state.lastDmg].spec.text
      : 'Выбери тип — пятно появится на свободной детали. Потом можно ткнуть в конкретное место.';
  }
}

function rememberDamage(index) {
  state.lastDmg = index;
  const note = $('damage-note');
  const item = shown?.damage?.list?.[index];
  if (note && item) note.textContent = item.spec.text;
}

/** Добавить одно повреждение выбранного типа. */
function addDamageOfKind(kind) {
  const list = shown?.damage?.list || [];
  if (!list.length) {
    live('У этой модели нет повреждений');
    return;
  }
  const set = damageSet();
  const free = list.map((_, i) => i).filter((i) => !set.has(i));
  const pool = kind === 'any' ? free : free.filter((i) => list[i].spec.kind === kind);
  if (!pool.length) {
    const shownKind = list.map((_, i) => i).filter((i) => set.has(i) && (kind === 'any' || list[i].spec.kind === kind));
    live(shownKind.length && kind !== 'any'
      ? `Такое пятно уже стоит: ${list[shownKind[0]].spec.where}`
      : 'Свободных мест не осталось');
    return;
  }
  // «любое» берём не первое попавшееся, а из середины — так пятна расходились
  // бы по разным деталям, а не липли к одной
  const pick = kind === 'any' ? pool[Math.floor(pool.length / 2)] : pool[0];
  set.add(pick);
  applyDamage();
  rememberDamage(pick);
  renderDetails(currentUnit());
  positionPop('damage');
  const spec = list[pick].spec;
  live(`${spec.kindTitle}: ${spec.where}`);
}

/** Меню ракурсов: список видов строками — как пункты меню, а не «чипсы». */
function renderViewMenu() {
  const row = $('menu-view-row');
  if (!row) return;
  row.innerHTML = '';
  const unit = currentUnit();
  const groups = [
    { id: 'exterior', title: 'Снаружи' },
    { id: 'interior', title: 'Внутри' },
  ];
  for (const gr of groups) {
    const items = viewsOf(unit).filter((v) => (v.group || 'exterior') === gr.id);
    if (!items.length) continue;
    const sec = document.createElement('div');
    sec.className = 'view-sec';
    sec.dataset.group = gr.id;
    const t = document.createElement('div');
    t.className = 'view-sec-t';
    t.textContent = gr.title;
    const box = document.createElement('div');
    box.className = 'view-sec-items';
    for (const v of items) {
      const b = document.createElement('button');
      b.className = 'pop-item' + (v.id === state.view ? ' is-on' : '');
      b.dataset.view = v.id;
      b.innerHTML = `<span class="i">${icon(VIEW_ICONS[v.id] || 'view')}</span><span class="n">${v.label}</span>`;
      b.onclick = () => {
        goView(v.id);
        closePop();
      };
      box.appendChild(b);
    }
    sec.append(t, box);
    row.appendChild(sec);
  }
  const cur = viewsOf(unit).find((v) => v.id === state.view);
  if ($('view-current')) {
    const inside = cur?.group === 'interior';
    $('view-current').textContent = inside ? 'внутри' : 'снаружи';
    $('view-current').classList.toggle('is-inside', inside);
  }
  $('menu-orbit')?.classList.toggle('is-on', autoRotateWanted);
}

function recolor(unit, hex) {
  colors[unit.id] = hex;
  saveState();
  if (shown) {
    for (const m of shown.paintMats) if (m?.color) m.color.set(hex);
    paintDamage(shown, hex);
    if (state.look !== 'solid') setLook(state.look, { announce: false, rebuild: true });
  }
  renderList();
  renderDetails(unit);
  refreshPreviewCaption();
  live(`Цвет: ${hex.toUpperCase()}`);
}

function setActiveChips(unit) {
  const wrap = $('dock-views');
  wrap.innerHTML = '';
  const groups = [
    { title: 'СНАРУЖИ', items: viewsOf(unit).filter((v) => v.group === 'exterior') },
    { title: 'ВНУТРИ', items: viewsOf(unit).filter((v) => v.group === 'interior') },
  ];
  for (const gr of groups) {
    if (!gr.items.length) continue;
    const label = document.createElement('span');
    label.className = 'eyebrow';
    label.textContent = gr.title;
    wrap.appendChild(label);
    for (const v of gr.items) {
      const b = document.createElement('button');
      b.className = 'chip' + (v.id === state.view ? ' active' : '');
      b.innerHTML = `${icon(VIEW_ICONS[v.id] || 'view')}<span>${v.label}</span>`;
      b.dataset.view = v.id;
      b.onclick = () => goView(v.id);
      wrap.appendChild(b);
    }
  }
}

function modeLabel(unit, view) {
  if (!view || view.group !== 'interior') return 'СНАРУЖИ';
  if (view.id === 'bunk') return 'СПАЛЬНИК';
  if (unit.category === 'cars') return view.id === 'salon' ? 'ИЗ САЛОНА' : 'ЗА РУЛЁМ';
  return view.id === 'passenger' ? 'МЕСТО ПАССАЖИРА' : 'В КАБИНЕ';
}
function renderViewSwitch(unit) {
  const wrap = $('view-switch');
  wrap.innerHTML = '';
  const order = ['exterior', 'side', 'rear', 'front', 'driver', 'passenger', 'salon', 'bunk'];
  const views = [...viewsOf(unit)].sort((a, b) => order.indexOf(a.id) - order.indexOf(b.id));
  views.forEach((v) => {
    const b = document.createElement('button');
    b.className = 'view-btn' + (v.group === 'interior' ? ' interior' : '') + (v.id === state.view ? ' active' : '');
    b.dataset.view = v.id;
    b.innerHTML = `<span>${VIEW_ICONS[v.id] || '📷'}</span>${v.label}`;
    b.onclick = () => goView(v.id);
    wrap.appendChild(b);
  });
}

/**
 * Навпад: кнопки вращения и зума под сценой. Удержание кнопки — плавное
 * непрерывное движение (как зажатая мышь в 3D-редакторе), одиночный
 * тап — один шаг. Работает мышью, пальцем и с клавиатуры (Tab + Enter).
 */
function installNavpad() {
  const pad = $('navpad');
  if (!pad) return;
  const actions = {
    up: () => cam.orbit(0, 0.075),
    down: () => cam.orbit(0, -0.075),
    left: () => cam.orbit(-0.1, 0),
    right: () => cam.orbit(0.1, 0),
    zin: () => cam.zoomBy(1.05),
    zout: () => cam.zoomBy(1 / 1.05),
    reset: () => resetCamera(),
  };
  pad.querySelectorAll('[data-act]').forEach((btn) => {
    const act = actions[btn.dataset.act];
    if (!act) return;
    let holdTimer = null;
    let raf = null;
    const stop = () => {
      if (holdTimer) { clearTimeout(holdTimer); holdTimer = null; }
      if (raf) { cancelAnimationFrame(raf); raf = null; }
      btn.classList.remove('holding');
    };
    const start = (e) => {
      e.preventDefault();
      if (btn.dataset.act !== 'reset') haptic(5);
      act();
      stop();
      btn.classList.add('holding');
      // через 0.28 с начинаем «крутить», пока кнопку держат
      if (btn.dataset.act !== 'reset') {
        holdTimer = setTimeout(() => {
          const tick = () => { act(); raf = requestAnimationFrame(tick); };
          tick();
        }, 280);
      }
    };
    btn.addEventListener('pointerdown', start);
    btn.addEventListener('pointerup', stop);
    btn.addEventListener('pointerleave', stop);
    btn.addEventListener('pointercancel', stop);
    btn.addEventListener('blur', stop);
    btn.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); act(); }
    });
  });
}

function goView(viewId) {
  const unit = currentUnit();
  const view = viewsOf(unit).find((v) => v.id === viewId) || viewsOf(unit)[0];
  state.view = view.id;
  cam.controls.autoRotate = !!view.autoRotate && autoRotateWanted;
  cam.setView(view, { instant: false });
  document.querySelectorAll('.view-btn').forEach((b) => b.classList.toggle('active', b.dataset.view === viewId));
  document.querySelectorAll('#dock-views .chip').forEach((b) => b.classList.toggle('active', b.dataset.view === viewId));
  $('mode-badge').textContent = modeLabel(unit, view);
  $('orbit-btn').classList.toggle('active', !!view.autoRotate && autoRotateWanted);
  refreshPreviewCaption();
  saveState();
}

// Ctrl / Home / ⌂ — вернуть камеру в штатное положение текущего вида
function resetCamera() {
  const unit = currentUnit();
  const view = viewsOf(unit).find((v) => v.id === state.view) || viewsOf(unit)[0];
  cam.setView(view, { instant: true });
  cam.controls.autoRotate = !!view.autoRotate && autoRotateWanted;
  live(`Камера: ${view.label || 'исходный вид'}`);
  haptic(8);
}
window.__garageReset = resetCamera;

function toggleInside() {
  const unit = currentUnit();
  const views = viewsOf(unit);
  const inside = views.some((v) => v.group === 'interior' && v.id === state.view);
  if (inside) {
    goView((views.find((v) => v.id === 'exterior') || views[0]).id);
    live('Вид снаружи');
    return;
  }
  const seat = views.find((v) => v.id === 'driver') || views.find((v) => v.id === 'salon') || views.find((v) => v.group === 'interior');
  if (!seat) {
    live('У прицепов салона нет — осмотр только снаружи');
    return;
  }
  goView(seat.id);
  live(seat.id === 'salon' ? 'Смотрим из салона' : 'Садимся в кабину');
}

function focusAnchor(a) {
  const [x, y, z] = a.pos;
  const dist = shown?.kind === 'car' ? 2.6 : 3.4;
  const target = new THREE.Vector3(x, y, z);
  const dir = new THREE.Vector3(1, 0.55, -0.9).normalize();
  const view = {
    id: 'anchor', label: a.label, group: 'exterior', seat: false, orbit: true, fov: 34,
    pos: [x + dir.x * dist, Math.max(y + dir.y * dist, 0.4), z + dir.z * dist],
    target: [x, y, z],
  };
  cam.setView(view, { instant: false });
  $('mode-badge').textContent = 'ОСМОТР';
  live(a.label + (a.side ? ` · ${a.side}` : ''));
  document.querySelectorAll('.view-btn').forEach((b) => b.classList.remove('active'));
}

// ------------------------------------------------------------ сравнение
function toggleCompare() {
  const unit = currentUnit();
  const prev = state.compare;
  if (!prev) {
    // сравниваем с «соседом по каталогу»
    const list = CAT_LISTS[state.cat];
    const idx = list.findIndex((u) => u.id === unit.id);
    const other = list[(idx + 1) % list.length];
    if (other.id === unit.id) {
      live('В категории одна модель — сравнивать не с чем');
      return;
    }
    state.compare = other.id;
    buildCompare(unit, other);
    $('compare-btn').classList.add('on');
    $('compare-btn-2').classList.add('active');
    live(`Рядом: ${other.name}`);
  } else {
    state.compare = null;
    removedCompare();
    $('compare-btn').classList.remove('on');
    $('compare-btn-2').classList.remove('active');
    live('Сравнение выключено');
  }
}

function buildCompare(unit, other) {
  removedCompare();
  const g = new THREE.Group();
  const compareUnit = { ...other, category: unit.category };
  const built = takeBuilt(compareUnit) || buildUnit(compareUnit, M);
  const colorHex = colors[other.id] || other.paint;
  for (const m of built.paintMats) if (m?.color) m.color.set(colorHex);
  const offset = (unit.category === 'cars' ? 3.6 : 4.6) * (built.kind === 'car' ? 1 : 1.15);
  built.root.position.set(offset, 0, 0);
  built.root.rotation.y = -0.4;
  g.add(built.root);
  scene.add(g);
  compareGroup = { group: g, built };
}

function removedCompare() {
  if (!compareGroup) return;
  scene.remove(compareGroup.group);
  compareGroup.group.traverse((o) => {
    if (o.geometry) o.geometry.dispose?.();
  });
  compareGroup = null;
}

// ------------------------------------------------------------ кнопки и клавиши
function step(dir) {
  const list = CAT_LISTS[state.cat];
  const idx = list.findIndex((u) => u.id === state.id);
  const next = list[(idx + dir + list.length) % list.length];
  select(state.cat, next.id);
}

function randomUnit() {
  const pools = [
    ...TRUCKS.map((u) => ['trucks', u.id]),
    ...TRAILERS.map((u) => ['trailers', u.id]),
    ...CARS.map((u) => ['cars', u.id]),
    ...BUILDINGS.map((u) => ['buildings', u.id]),
  ];
  const [cat, id] = pools[Math.floor(Math.random() * pools.length)];
  if (cat !== state.cat) {
    state.cat = cat;
    document.querySelectorAll('.cat-tab').forEach((t) => {
      const on = t.dataset.cat === cat;
      t.classList.toggle('active', on);
      t.setAttribute('aria-selected', String(on));
    });
  }
  select(cat, id);
  live('Случайный экспонат');
}

function setCategory(cat) {
  if (!CAT_LISTS[cat]) return;
  state.cat = cat;
  state.id = CAT_LISTS[cat][0].id;
  state.dmgKind = 'any';
  state.lastDmg = null;
  document.querySelectorAll('.cat-tab').forEach((t) => {
    const on = t.dataset.cat === cat;
    t.classList.toggle('active', on);
    t.setAttribute('aria-selected', String(on));
  });
  select(cat, state.id, { instant: false });
}

function shot() {
  if (!webglOk) {
    live('Скриншот недоступен без 3D');
    return;
  }
  // рендер «сейчас», затем сохраняем
  stage.renderer.render(scene, stage.camera);
  const a = document.createElement('a');
  const unit = currentUnit();
  a.download = `garage3d-${unit.id}-${state.view}.png`;
  a.href = stage.renderer.domElement.toDataURL('image/png');
  a.click();
  live('Скриншот сохранён');
}

function fullscreen() {
  const el = document.documentElement;
  if (!document.fullscreenElement) el.requestFullscreen?.().catch(() => live('Полный экран недоступен'));
  else document.exitFullscreen?.();
}

// верхняя и нижняя панели имеют разную высоту на разных экранах —
// прокидываем реальные размеры в CSS, чтобы выдвижные панели не перекрывали их
function syncLayout() {
  const top = document.querySelector('.hud-top');
  const bottom = document.querySelector('.hud-bottom');
  if (!top || !bottom) return;
  const root = document.documentElement;
  root.style.setProperty('--hud-h', `${Math.round(top.getBoundingClientRect().height) || 54}px`);
  root.style.setProperty('--dock-h', `${Math.round(bottom.getBoundingClientRect().height) || 64}px`);
  // открытое меню переставляем: экран изменился — место под кнопкой тоже
  if (openPop) positionPop(openPop);
  guardStage();
}

function wireUI() {
  ensurePopLayer();
  document.querySelectorAll('.cat-tab').forEach((t) => {
    t.onclick = () => setCategory(t.dataset.cat);
  });
  document.querySelectorAll('#dock-env .pop-item').forEach((b) => {
    b.onclick = () => {
      state.preset = b.dataset.preset;
      stage.setPreset(state.preset);
      document.querySelectorAll('#dock-env .pop-item').forEach((x) => x.classList.toggle('is-on', x.dataset.preset === state.preset));
      saveState();
      live(`Свет: ${b.textContent}`);
    };
  });
  $('prev-btn').onclick = () => step(-1);
  $('next-btn').onclick = () => step(1);
  $('random-btn').onclick = randomUnit;
  $('shot-btn').onclick = shot;
  $('full-btn').onclick = fullscreen;
  // ---- меню: одно открыто за раз, каждое встаёт под своей кнопкой
  const POP_BUTTONS = {
    catalog: 'catalog-toggle', view: 'menu-view-btn', damage: 'menu-damage-btn',
    light: 'light-btn', more: 'menu-more-btn',
  };
  for (const [name, id] of Object.entries(POP_BUTTONS)) {
    const btn = $(id);
    if (btn) btn.onclick = (e) => { e.stopPropagation(); openPopover(name); };
  }
  for (const key of Object.keys(POPS)) {
    $(POPS[key].pop)?.addEventListener('click', (e) => e.stopPropagation());
  }
  document.addEventListener('click', () => closePop());
  $('details-toggle').onclick = (e) => {
    e.stopPropagation();
    setDrawer(openDrawer === 'details' ? null : 'details');
  };
  $('catalog-close').onclick = () => closePop();
  document.querySelectorAll('[data-close-pop]').forEach((b) => {
    b.onclick = (e) => { e.stopPropagation(); closePop(); };
  });
  $('details-close').onclick = () => setDrawer(null);
  $('backdrop').onclick = () => setDrawer(null);
  // ---- меню повреждений
  document.querySelectorAll('#damage-type-row .dmg-type').forEach((b) => {
    b.onclick = () => {
      state.dmgKind = b.dataset.kind;
      addDamageOfKind(state.dmgKind);
      renderDamageMenu();
      positionPop('damage');
    };
  });
  $('damage-all').onclick = () => {
    if (!shown?.damage) return live('У этой модели нет повреждений');
    const set = damageSet();
    shown.damage.list.forEach((_, i) => set.add(i));
    applyDamage();
    renderDetails(currentUnit());
    state.lastDmg = 0;
    positionPop('damage');
    live('Все повреждения показаны');
  };
  $('damage-clear').onclick = () => {
    damageSet().clear();
    applyDamage();
    renderDetails(currentUnit());
    state.lastDmg = null;
    positionPop('damage');
    live('Кузов чистый');
  };
  // ---- меню ракурсов
  $('menu-inside').onclick = () => {
    const unit = currentUnit();
    const target = viewsOf(unit).find((v) => v.id === 'driver' || v.id === 'salon');
    if (target) goView(target.id);
    else live('У этой модели нет салона');
    closePop();
  };
  $('menu-outside').onclick = () => { goView('exterior'); closePop(); };
  $('menu-orbit').onclick = () => { $('orbit-btn').onclick(); renderViewMenu(); };
  $('menu-reset').onclick = () => { $('reset-btn').onclick(); closePop(); };
  $('help-btn').onclick = () => $('help-modal').classList.remove('hidden');
  $('help-close').onclick = () => $('help-modal').classList.add('hidden');
  $('help-modal').onclick = (e) => { if (e.target.id === 'help-modal') $('help-modal').classList.add('hidden'); };
  $('d-inside').onclick = () => {
    const unit = currentUnit();
    const target = viewsOf(unit).find((v) => v.id === 'driver' || v.id === 'salon');
    if (target) goView(target.id);
    else live('У этой модели нет салона — прицеп только снаружи');
  };
  $('d-outside').onclick = () => goView('exterior');
  $('orbit-btn').onclick = () => {
    const view = viewsOf(currentUnit()).find((v) => v.id === state.view);
    autoRotateWanted = !autoRotateWanted;
    cam.controls.autoRotate = autoRotateWanted && !!view?.autoRotate;
    $('orbit-btn').classList.toggle('active', autoRotateWanted);
    live(autoRotateWanted ? 'Автовращение включено' : 'Автовращение выключено');
  };
  $('reset-btn').onclick = () => {
    const unit = currentUnit();
    goView(viewsOf(unit)[0].id);
  };
  $('look-btn').onclick = () => {
    const unit = currentUnit();
    const view = viewsOf(unit).find((v) => v.id === state.view);
    if (view?.seat) {
      // уже в салоне: сбрасываем направление взгляда вперёд
      goView(view.id);
      live('Взгляд вперёд — тяните мышью, чтобы осмотреться');
      return;
    }
    const seat = viewsOf(unit).find((v) => v.id === 'driver') || viewsOf(unit).find((v) => v.group === 'interior');
    if (!seat) {
      live('У этой модели нет салона — осмотр только снаружи');
      return;
    }
    goView(seat.id);
    live('Свободный взгляд: тяните мышью/пальцем');
  };
  $('damage-btn').onclick = toggleDamage;
  $('damage-btn-2').onclick = toggleDamage;
  $('compare-btn').onclick = toggleCompare;
  $('compare-btn-2').onclick = toggleCompare;
  $('dots-btn').onclick = toggleDots;
  $('voxel-btn').onclick = toggleVoxel;
  $('compare-btn-3').onclick = () => { toggleCompare(); closePop(); };
  $('fav-filter').onclick = () => {
    state.favOnly = !state.favOnly;
    $('fav-filter').classList.toggle('on', state.favOnly);
    renderList();
    live(state.favOnly ? 'Только избранное' : 'Все модели');
  };
  $('search').oninput = (e) => {
    state.search = e.target.value;
    renderList();
  };
  // ---------------------------------------------- навпад и фокус по клику
  installNavpad();
  // Клик по детали наводит на неё камеру. Одиночный клик ждёт 220 мс:
  // иначе двойной клик («в салон») срабатывал бы ещё и как два фокуса.
  const gl = $('gl');
  const ray = new THREE.Raycaster();
  let clickTimer = null;
  const setDrag = (on) => gl.classList.toggle('is-dragging', on);
  gl.addEventListener('pointerdown', () => setDrag(true));
  window.addEventListener('pointerup', () => setDrag(false));
  window.addEventListener('pointercancel', () => setDrag(false));
  gl.addEventListener('dblclick', () => {
    clearTimeout(clickTimer);
    toggleInside();
  });
  gl.addEventListener('click', (e) => {
    if (e.detail > 1) return;
    const rect = gl.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const ny = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    clearTimeout(clickTimer);
    clickTimer = setTimeout(() => {
      if (!shown?.root || !cam.controls.enabled) return;
      ray.setFromCamera(new THREE.Vector2(nx, ny), stage.camera);
      const hit = ray.intersectObject(shown.root, true)
        .find((h) => h.object.isMesh && h.object.visible !== false && h.object.material?.transparent !== true);
      if (!hit) return;
      const point = hit.point.clone();
      cam.focusOn(point);
      // если рядом есть «точка осмотра» — называем её
      let near = null;
      let best = 1.1;
      for (const a of shown.anchors || []) {
        const d = point.distanceTo(new THREE.Vector3(...a.pos));
        if (d < best) { best = d; near = a.label; }
      }
      haptic(6);
      live(near ? `Фокус: ${near}` : 'Фокус на детали · кнопка ⌂ вернёт вид');
    }, 220);
  });
  // ---------------------------------------------- тач-жесты
  // Смахивание влево/вправо листает модели, двойной тап сажает в салон,
  // щипок сбрасывает зум «по размеру модели».
  if (device.touch) {
    installGestures($('gl'), {
      onSwipe: (dir) => {
        haptic(10);
        step(dir > 0 ? 1 : -1);
        live(dir > 0 ? 'Следующая модель →' : '← Предыдущая модель');
      },
      onDoubleTap: () => {
        haptic(12);
        toggleInside();
      },
      onPinch: () => {
        haptic(6);
        const v = viewsOf(currentUnit()).find((x) => x.id === state.view);
        if (v) goView(v.id);
      },
    });
    // встряхнуть телефон — случайная модель
    installShake(() => {
      if (device.phone) {
        haptic([14, 40, 14]);
        randomUnit();
      }
    }, { threshold: 26 });
  }
  // клавиатура в меню: ↑/↓ ходят по пунктам, Home/End — к краям
  const MENU_ITEM = '.pop-item, .dmg-place, .cat-tab, .mini-btn, .pop-x, .unit';
  function menuKey(e) {
    const pop = e.target.closest?.('.hud-pop');
    if (!pop) return false;
    // offsetParent в jsdom всегда null — проверяем только свёрнутые группы
    const items = [...pop.querySelectorAll(MENU_ITEM)]
      .filter((el) => !el.disabled && !el.closest('.folded') && !el.closest('.hidden'));
    if (!items.length) return false;
    const at = items.indexOf(document.activeElement);
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      const dir = e.key === 'ArrowDown' ? 1 : -1;
      const next = items[(at + dir + items.length) % items.length] || items[0];
      next.focus({ preventScroll: false });
      e.preventDefault();
      return true;
    }
    if (e.key === 'Home' || e.key === 'End') {
      (e.key === 'Home' ? items[0] : items[items.length - 1]).focus();
      e.preventDefault();
      return true;
    }
    return false;
  }

  window.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'INPUT') return;
    if (menuKey(e)) return;
    // внутри открытого меню глобальные стрелки не должны листать модели
    if (e.target.closest?.('.hud-pop') && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) return;
    // полёт камеры: клавиши удерживаются, движение считаем в цикле кадров
    if (FLY_KEYS.has(e.code)) {
      held.add(e.code);
      e.preventDefault();
      return;
    }
    if (e.key === 'Shift') { held.add('ShiftLeft'); return; }
    if (e.key === 'Control' || e.key === 'Home') {
      // Ctrl — вернуть камеру в штатное положение текущего вида
      resetCamera();
      return;
    }
    switch (e.key) {
      case 'ArrowRight': step(1); break;
      case 'ArrowLeft': step(-1); break;
      case '+': case '=': case 'ю': cam.zoomBy(1.16); break;
      case '-': case '_': case 'ж': cam.zoomBy(1 / 1.16); break;
      case 'r': case 'R': case 'к': case 'К': randomUnit(); break;
      case 'f': case 'F': case 'а': case 'А': fullscreen(); break;
      case 'c': case 'C': case 'с': case 'С': shot(); break;
      case 'h': case 'H': case 'р': case 'Р': $('help-modal').classList.toggle('hidden'); break;
      case 'i': case 'I': case 'ш': case 'Ш': toggleInside(); break;
      case 'x': case 'X': case 'ч': case 'Ч': toggleDamage(); break;
      case 'p': case 'P': case 'з': case 'З': toggleDots(); break;
      case 'v': case 'V': case 'м': case 'М': toggleVoxel(); break;
      case 'Escape': {
        $('help-modal').classList.add('hidden');
        closePop();
        closeDrawer();
        break;
      }
      case ' ': {
        e.preventDefault();
        $('orbit-btn').onclick();
        break;
      }
      case '0': goView((viewsOf(currentUnit()).find((v) => v.group === 'exterior') || viewsOf(currentUnit())[0]).id); break;
      case '1': case '2': case '3': case '4': case '5': {
        const n = Number(e.key);
        const order = viewsOf(currentUnit()).slice(0, 5);
        if (order[n - 1]) goView(order[n - 1].id);
        break;
      }
      default: break;
    }
  });
  window.addEventListener('keyup', (e) => {
    held.delete(e.code);
    if (e.key === 'Shift') held.delete('ShiftLeft');
  });
  window.addEventListener('blur', () => held.clear());
  // звёздочка на карточке по двойному клику на заголовок
  $('d-name').ondblclick = () => {
    const id = currentUnit().id;
    state.fav = state.fav.includes(id) ? state.fav.filter((x) => x !== id) : [...state.fav, id];
    saveState();
    renderList();
    live(state.fav.includes(id) ? 'Добавлено в избранное ★' : 'Убрано из избранного');
  };
}

// ------------------------------------------------------------ запуск
const clock = new THREE.Clock();
let frames = 0;
let fpsClock = 0;
let lowFpsStrikes = 0;
function loop() {
  requestAnimationFrame(loop);
  const dt = Math.min(0.06, clock.getDelta());
  cam.update(dt);
  // свободный полёт камеры: W — вперёд, S — назад, A/D — влево/вправо,
  // Q/E — вниз/вверх, Shift — ускорение
  if (held.size && cam) {
    const boost = held.has('ShiftLeft') || held.has('ShiftRight') ? FLY_BOOST : 1;
    const step = FLY_SPEED * boost * dt;
    const fwd = (held.has('KeyW') ? 1 : 0) - (held.has('KeyS') ? 1 : 0);
    const side = (held.has('KeyD') ? 1 : 0) - (held.has('KeyA') ? 1 : 0);
    const up = (held.has('KeyE') ? 1 : 0) - (held.has('KeyQ') ? 1 : 0);
    if (fwd || side || up) cam.fly(fwd, side, up, step);
  }
  // лёгкое «дыхание» юбки подиума и огней
  stage.renderer.render(scene, stage.camera);
  // предпросмотр в открытом меню: отдельный маленький кадр, не чаще 22 к/с
  if (openPop && preview && shown?.root) {
    const now = performance.now();
    if (now - previewAt >= 45) {
      previewAt = now;
      drawPreview();
    }
  }

  // раз в секунду смотрим на фактический FPS: на слабых телефонах
  // автоматически опускаем разрешение, чтобы не было «слайд-шоу»
  frames += 1;
  fpsClock += dt;
  if (fpsClock >= 1) {
    const fps = frames / fpsClock;
    frames = 0;
    fpsClock = 0;
    if (fps < 30) {
      lowFpsStrikes += 1;
      if (lowFpsStrikes >= 2) {
        stage.adaptQuality?.(fps);
        lowFpsStrikes = 0;
      }
    } else {
      lowFpsStrikes = 0;
    }
  }
}

function boot() {
  // Подсказки внизу сцены: на десктопе про мышь, на тач-устройстве про пальцы
  const hint = document.querySelector('.stage-hint');
  if (hint) {
    hint.innerHTML = device.touch
      ? '<span><kbd>1 палец</kbd> вращать</span><span><kbd>2 пальца</kbd> зум</span>'
        + '<span><kbd>Тап по детали</kbd> фокус</span><span><kbd>Свайп</kbd> модель</span>'
        + '<span><kbd>Двойной тап</kbd> салон</span>'
      : '<span><kbd>ЛКМ</kbd> вращать</span><span><kbd>Колесо</kbd> зум к курсору</span>'
        + '<span><kbd>Клик</kbd> фокус на детали</span><span><kbd>A D W S</kbd> камера</span>'
        + '<span><kbd>I</kbd> салон</span><span><kbd>← →</kbd> модель</span>';
  }
  const note = document.querySelector('.foot-note');
  if (note && device.touch) note.textContent = '62 модели · 10 / 20 / 10 / 22';
  stage.setPreset(state.preset);
  document.querySelectorAll('#dock-env .pop-item').forEach((x) => x.classList.toggle('is-on', x.dataset.preset === state.preset));
  document.querySelectorAll('.cat-tab').forEach((t) => {
    const on = t.dataset.cat === state.cat;
    t.classList.toggle('active', on);
    t.setAttribute('aria-selected', String(on));
  });
  wireUI();
  syncLayout();
  window.addEventListener('resize', syncLayout);
  const unit = currentUnit();
  renderList();
  renderDetails(unit);
  renderDamageMenu();
  renderViewMenu();
  guardStage();
  setActiveChips(unit);
  renderViewSwitch(unit);
  $('mode-badge').textContent = 'СНАРУЖИ';
  showUnit(unit, { instant: true, view: viewsOf(unit)[0] });
  loop();
  // приветственная подсказка
  setTimeout(() => live(device.touch
    ? 'Свайп — другая модель · двойной тап — салон'
    : 'Каталог и карточка — кнопки сверху · I — салон'), 900);
}

boot();
