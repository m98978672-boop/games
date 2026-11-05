// ============================================================
// ГАРАЖ 3D — точка входа: каталог, сцена, камера и интерфейс.
// ============================================================
import * as THREE from 'three';
import { createStage, createFallbackStage } from './stage.js';
import { createMaterials, clamp, rad, lerp } from './lib/kit.js';
import { ShowroomCamera } from './lib/camera.js';
import { buildUnit } from './models/index.js';
import { CATEGORIES, TRUCKS, TRAILERS, CARS, findUnit } from './data/units.js';

const $ = (id) => document.getElementById(id);
const CAT_LISTS = { trucks: TRUCKS, trailers: TRAILERS, cars: CARS };
const CAT_META = Object.fromEntries(CATEGORIES.map((c) => [c.id, c]));
const PAINTS = ['#e9ecec', '#b9c0c6', '#2f5d8a', '#16233f', '#a4241d', '#7d1a2e', '#cf5a13', '#e0b528', '#1f6b45', '#37a58c', '#0f6b70', '#4b3c85', '#6d2a6b', '#7a3b2a', '#5a3c25', '#c2a878', '#2f353b', '#101214'];
const SAVE_KEY = 'garage3d-showroom-v1';
const VIEW_ICONS = { exterior: '🌐', side: '◧', rear: '▣', front: '◍', driver: '🧑‍✈️', passenger: '🪑', salon: '🚘', bunk: '🛏' };

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
};

let saved = {};
try { saved = JSON.parse(localStorage.getItem(SAVE_KEY) || '{}') || {}; } catch { saved = {}; }
if (saved.cat && CAT_LISTS[saved.cat]) state.cat = saved.cat;
if (saved.id) state.id = saved.id;
state.fav = Array.isArray(saved.fav) ? saved.fav : [];
state.preset = saved.preset || 'studio';
const colors = saved.colors && typeof saved.colors === 'object' ? saved.colors : {};

function saveState() {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify({ cat: state.cat, id: state.id, fav: state.fav, preset: state.preset, colors }));
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
const cam = new ShowroomCamera(stage.camera, $('gl'));
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
    scene.add(built.root);
    shown = built;
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

// ------------------------------------------------------------ список каталога
function iconFor(unit) {
  if (unit.category === 'trucks') return '🚛';
  if (unit.category === 'cars') return unit.style === 'sport' ? '🏎' : unit.style === 'van' ? '🚐' : unit.style === 'pickup' ? '🛻' : '🚗';
  const map = {
    tanker: '🛢', adr: '☣', silo: '🏗', tipper: '🚧', livestock: '🐄', logging: '🌲',
    container: '🧱', refcontainer: '❄', carrier: '🚗', bdouble: '🚚', boat: '⛵',
    glass: '🪟', crane: '🏗', sidetip: '🚛', dolly: '🪵', lowboy: '🦾', reefer: '❄', curtain: '🎭', van: '📦', flatbed: '▭',
  };
  return map[unit.type] || '📦';
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
  $('cat-hint').textContent = CAT_META[state.cat].hint + (state.favOnly ? ' · только избранное' : '');
  $('catalog-count').textContent = units.length;
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
      <span class="thumb">${iconFor(u)}</span>
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
    };
    list.appendChild(btn);
  });
  const activeEl = list.querySelector('.unit.active');
  if (activeEl && typeof activeEl.scrollIntoView === 'function') activeEl.scrollIntoView({ block: 'nearest' });
}

function renderDetails(unit) {
  $('d-brand').textContent = `${unit.brand || '—'} · 2026`;
  $('d-name').textContent = unit.name;
  $('d-cat').textContent = unit.category === 'trucks' ? 'ТЯГАЧ' : unit.category === 'trailers' ? 'ПРИЦЕП' : 'АВТОМОБИЛЬ';
  $('d-desc').textContent = unit.desc || unit.tagline || '';
  $('unit-kind').textContent = (unit.category === 'trucks' ? 'ТЯГАЧ' : unit.category === 'trailers' ? 'ПРИЦЕП' : 'АВТОМОБИЛЬ') + (unit.meta ? ` · ${unit.meta}` : '');
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
  // точки осмотра
  const anchors = $('anchor-row');
  anchors.innerHTML = '';
  if (shown && shown.anchors) {
    $('anchor-count').textContent = shown.anchors.length;
    shown.anchors.forEach((a) => {
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

function recolor(unit, hex) {
  colors[unit.id] = hex;
  saveState();
  if (shown) {
    for (const m of shown.paintMats) if (m?.color) m.color.set(hex);
  }
  renderList();
  renderDetails(unit);
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
      b.textContent = `${VIEW_ICONS[v.id] || ''} ${v.label}`.trim();
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
  saveState();
}

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

function wireUI() {
  document.querySelectorAll('.cat-tab').forEach((t) => {
    t.onclick = () => setCategory(t.dataset.cat);
  });
  document.querySelectorAll('#dock-env .chip').forEach((b) => {
    b.onclick = () => {
      state.preset = b.dataset.preset;
      stage.setPreset(state.preset);
      document.querySelectorAll('#dock-env .chip').forEach((x) => x.classList.toggle('active', x.dataset.preset === state.preset));
      saveState();
      live(`Свет: ${b.textContent}`);
    };
  });
  $('prev-btn').onclick = () => step(-1);
  $('next-btn').onclick = () => step(1);
  $('random-btn').onclick = randomUnit;
  $('shot-btn').onclick = shot;
  $('full-btn').onclick = fullscreen;
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
  $('compare-btn').onclick = toggleCompare;
  $('compare-btn-2').onclick = toggleCompare;
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
  // двойной клик по сцене — в салон/наружу
  $('gl').addEventListener('dblclick', toggleInside);
  window.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'INPUT') return;
    switch (e.key) {
      case 'ArrowRight': step(1); break;
      case 'ArrowLeft': step(-1); break;
      case 'r': case 'R': case 'к': case 'К': randomUnit(); break;
      case 'f': case 'F': case 'а': case 'А': fullscreen(); break;
      case 'c': case 'C': case 'с': case 'С': shot(); break;
      case 'h': case 'H': case 'р': case 'Р': $('help-modal').classList.toggle('hidden'); break;
      case 'i': case 'I': case 'ш': case 'Ш': toggleInside(); break;
      case 'Escape': $('help-modal').classList.add('hidden'); break;
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
function loop() {
  requestAnimationFrame(loop);
  const dt = Math.min(0.06, clock.getDelta());
  cam.update(dt);
  // лёгкое «дыхание» юбки подиума и огней
  stage.renderer.render(scene, stage.camera);
}

function boot() {
  stage.setPreset(state.preset);
  document.querySelectorAll('#dock-env .chip').forEach((x) => x.classList.toggle('active', x.dataset.preset === state.preset));
  document.querySelectorAll('.cat-tab').forEach((t) => {
    const on = t.dataset.cat === state.cat;
    t.classList.toggle('active', on);
    t.setAttribute('aria-selected', String(on));
  });
  wireUI();
  const unit = currentUnit();
  renderList();
  renderDetails(unit);
  setActiveChips(unit);
  renderViewSwitch(unit);
  $('mode-badge').textContent = 'СНАРУЖИ';
  showUnit(unit, { instant: true, view: viewsOf(unit)[0] });
  loop();
  // приветственная подсказка
  setTimeout(() => live('Мышь — вращать · I — сесть в салон'), 900);
}

boot();
