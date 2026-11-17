/* РАТГРАД 2D: карта 7000 × 7000 км, простое движение, без поворотов и без 3D. */
import { Map2D } from './map2d.js';
import { WORLD2D } from './world2d.js';
import { loadFrom, saveTo, elapsedMinutes, formatReport, OFFLINE } from './offline2d.js';

const canvas = document.getElementById('map');
const hud = {
  pos: document.getElementById('hud-pos'),
  height: document.getElementById('hud-height'),
  zoom: document.getElementById('hud-zoom'),
  fps: document.getElementById('hud-fps'),
  center: document.getElementById('hud-center'),
  roads: document.getElementById('hud-roads'),
  town: document.getElementById('hud-town'),
  cars: document.getElementById('hud-cars'),
  accidents: document.getElementById('hud-accidents'),
  hidden: document.getElementById('hud-hidden'),
  peds: document.getElementById('hud-peds'),
  mayors: document.getElementById('hud-mayors'),
  crowd: document.getElementById('hud-crowd'),
  growth: document.getElementById('hud-growth'),
  trains: document.getElementById('hud-trains'),
  air: document.getElementById('hud-air'),
  sea: document.getElementById('hud-sea'),
  weather: document.getElementById('hud-weather'),
  offline: document.getElementById('hud-offline'),
  whyList: document.getElementById('why-list'),
  hint: document.getElementById('hint'),
  clock: document.getElementById('hud-clock'),
  country: document.getElementById('hud-country'),
  status: document.getElementById('hud-status'),
  loading: document.getElementById('loading'),
  loadingText: document.getElementById('loading-text')
};

const map = new Map2D(canvas, hud);
map.center = { x: 0, y: 0 };
map.scale = 0.16;

function boot() {
  map.resize();
  map.draw();

  /* кнопки карты: + − ⤢ ⌂ */
function wireButton(id, fn) {
  const el = document.getElementById(id);
  if (!el) return;
  el.addEventListener('click', () => {
    fn();
    map.clampCenter();
    map.draw();
    map.requestDetail();
    map.updateHud();
  });
}
const mid = () => ({ x: map.view.w / 2, y: map.view.h / 2 });
wireButton('zoom-in', () => map.setZoom(map.scale * 1.6, mid()));
wireButton('zoom-out', () => map.setZoom(map.scale / 1.6, mid()));
wireButton('fit', () => map.fitWorld());
wireButton('center', () => { map.center = { x: 0, y: 0 }; });

/* R-72.5: панель карты складывается — на маленьком экране игрок оставляет только заголовок. */
{
  const fold = document.getElementById('fold-hud');
  const panel = document.getElementById('hud');
  if (fold && panel) {
    fold.addEventListener('click', () => {
      const folded = panel.classList.toggle('folded');
      fold.textContent = folded ? '+' : '—';
      fold.title = folded ? 'показать подсказки' : 'свернуть подсказки';
    });
  }
}

/* §14: прыжки по времени суток. «Утро» и «вечер» ищут час по сезону — зимой и летом
   рассвет и закат в разное время; «день» и «ночь» — фиксированные 13:00 и 01:00. */
const times = [
  ['time-morning', 'dawn'], ['time-day', 13], ['time-evening', 'dusk'], ['time-night', 1]
];
for (const [id, when] of times) {
  const el = document.getElementById(id);
  if (!el) continue;
  el.addEventListener('click', () => (typeof when === 'number' ? map.setClockHour(when) : map.setClockPhase(when)));
}

map.init((done, total) => {
    if (hud.loadingText) hud.loadingText.textContent = 'рисую мир ' + WORLD2D.sizeKm + ' × ' + WORLD2D.sizeKm + ' км… ' + done + '/' + total;
  }).then(() => {
    map.draw();
    if (hud.loading) hud.loading.classList.add('done');
    window.__ratgrad = { map };
    // границы §7 и экономика §31.33 считаются следом, чтобы карта появилась сразу
    setTimeout(() => {
      try {
        map.buildBorders();
        map.buildWater();
        map.buildEconomy();
        map.updateEconomyPanel();
        map.buildRailLayer();
        map.buildAirLayer();
        if (map.water) map.buildSeaLayer();
        map.draw();
        restoreOffline();
      } catch (err) {
        if (hud.status) hud.status.textContent = 'границы не собрались: ' + err.message;
      }
    }, 30);
  });
}

/* §16.7 и §16.8 без нас: страна живёт числами, когда окно свёрнуто или закрыто.
   Пока вкладка открыта, но не видна — тик раз в секунду; пока закрыта — догоняем по сейву. */
function restoreOffline() {
  const saved = loadFrom(window.localStorage);
  if (!saved || !map.transport) return;
  const el = elapsedMinutes(saved);
  if (el.minutes <= 0) { saveTo(window.localStorage, map.transport); return; }
  map.transport.minutes = Math.max(map.transport.minutes, saved.minutes);
  const before = map.transport.minutes;
  const report = map.catchUpOffline(el.minutes);
  map.transport.minutes = Math.max(map.transport.minutes, before + el.minutes);
  map.catchUpReport = { ...report, capped: el.capped };
  if (hud.offline) hud.offline.textContent = formatReport(map.catchUpReport) || '—';
  saveTo(window.localStorage, map.transport);
  map.draw();
  map.updateHud();
}

if (typeof window !== 'undefined' && typeof window.setInterval === 'function') {
  setInterval(() => {
    if (document.hidden) return;
    saveTo(window.localStorage, map.transport);
  }, OFFLINE.autosaveSec * 1000);

  // скрытая вкладка: мир идёт раз в секунду, но рисуется только HUD-числами
  setInterval(() => {
    if (!document.hidden || !map.transport) return;
    map.tick(OFFLINE.hiddenTickSec);
    saveTo(window.localStorage, map.transport);
    if (hud.offline) {
      const total = Math.floor(map.transport.minutes / 1440);
      hud.offline.textContent = 'идёт фоном · день ' + (total + 1);
    }
  }, OFFLINE.hiddenTickSec * 1000);

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { saveTo(window.localStorage, map.transport); return; }
    map.draw();
    map.updateHud();
  });
}

/* ---------- управление: как в обычной карте ---------- */
const touches = new Map();   // pointerId → { x, y }
let pinch = null;            // { dist, cx, cy }
let drag = null;             // { x, y, moved, button } — тяга начинается только после сдвига
const DRAG_START_PX = 5;     // мышь не «зажимается» на первом же пикселе

function local(e) {
  const rect = canvas.getBoundingClientRect();
  return { x: e.clientX - rect.left, y: e.clientY - rect.top };
}

canvas.addEventListener('contextmenu', (e) => e.preventDefault());

canvas.addEventListener('pointerdown', (e) => {
  const p = local(e);
  touches.set(e.pointerId, p);
  map.pointer = { x: p.x, y: p.y, inside: true };
  drag = { x: p.x, y: p.y, moved: false, button: e.button, id: e.pointerId };
  if (touches.size === 2) pinch = pinchStart();
  if (e.button === 1) e.preventDefault();
});

canvas.addEventListener('pointermove', (e) => {
  const p = local(e);
  map.pointer = { x: p.x, y: p.y, inside: true };
  const prev = touches.get(e.pointerId);
  touches.set(e.pointerId, p);

  // два пальца: расстояние — зум, середина — сдвиг
  if (touches.size >= 2) {
    const now = pinchStart();
    if (pinch && now.dist > 0) map.setZoom(map.scale * (now.dist / pinch.dist), now);
    if (pinch) map.shift(now.cx - pinch.cx, now.cy - pinch.cy);
    pinch = now;
    drag = null;
    map.draw();
    map.requestDetail();
    map.updateHud();
    return;
  }

  if (drag) {
    const dx = p.x - drag.x, dy = p.y - drag.y;
    if (!drag.moved && Math.hypot(dx, dy) >= DRAG_START_PX) {
      drag.moved = true;
      canvas.setPointerCapture?.(e.pointerId);
      canvas.classList.add('dragging');
    }
    if (drag.moved) {
      drag.x = p.x; drag.y = p.y;
      map.shift(dx, dy);
      map.draw();
      map.requestDetail();
      map.updateHud();
    }
  }
});

function endPointer(e) {
  const p = local(e);
  touches.delete(e.pointerId);
  if (touches.size < 2) pinch = null;
  if (drag && !drag.moved && drag.button === 0) {
    // клик без протяжки — выбор города
    const town = map.townAt(p.x, p.y);
    map.selected = town;
    if (hud.town) hud.town.textContent = town ? town.name + ' · ' + Math.round(town.h) + ' м' : '—';
    map.draw();
  }
  drag = null;
  canvas.classList.remove('dragging');
  canvas.releasePointerCapture?.(e.pointerId);
}
canvas.addEventListener('pointerup', endPointer);
canvas.addEventListener('pointercancel', endPointer);
// отпускание вне холста не теряется: те же обработчики слушают окно
window.addEventListener('pointerup', endPointer);
window.addEventListener('pointercancel', endPointer);
canvas.addEventListener('pointerleave', () => {
  if (!drag) map.pointer.inside = false;
});

function pinchStart() {
  const [a, b] = [...touches.values()];
  return { dist: Math.hypot(a.x - b.x, a.y - b.y), cx: (a.x + b.x) / 2, cy: (a.y + b.y) / 2 };
}

/* колесо: плавный шаг, точка под курсором стоит на месте */
canvas.addEventListener('wheel', (e) => {
  e.preventDefault();
  const unit = e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? 400 : 1;
  const k = Math.max(0.5, Math.min(2, Math.exp(-e.deltaY * unit * 0.0016)));
  map.setZoom(map.scale * k, local(e));
  map.requestDetail();
  map.updateHud();
}, { passive: false });

/* двойной клик — ближе к точке, с Shift — дальше */
canvas.addEventListener('dblclick', (e) => {
  e.preventDefault();
  map.setZoom(map.scale * (e.shiftKey ? 1 / 2 : 2), local(e));
  map.requestDetail();
  map.updateHud();
});

const toggles = {
  'toggle-grid': (v) => { map.showGrid = v; map.draw(); },
  'toggle-roads': (v) => { map.showRoads = v; map.draw(); },
  'toggle-markings': (v) => { map.showMarkings = v; map.draw(); },
  'toggle-dams': (v) => { map.showDams = v; map.draw(); },
  'toggle-ice': (v) => { map.showIce = v; map.iceKey = null; map.draw(); },
  'toggle-tides': (v) => { map.showTides = v; map.draw(); },
  'toggle-ai': (v) => { map.showAI = v; if (v) map.buildMayorsLayer(); map.draw(); map.updateHud(); },
  'toggle-accidents': (v) => { map.showAccidents = v; map.draw(); map.updateHud(); },
  'toggle-pedai': (v) => { map.showPedAI = v; map.draw(); map.updateHud(); },
  'toggle-growth': (v) => { map.showGrowth = v; map.draw(); map.updateHud(); },
  'toggle-trains': (v) => { map.showTrains = v; map.draw(); map.updateHud(); },
  'toggle-airport': (v) => { map.showAir = v; map.draw(); map.updateHud(); },
  'toggle-seatraffic': (v) => { map.showSeaTraffic = v; map.draw(); map.updateHud(); },
  'toggle-weather': (v) => { map.showWeather = v; map.draw(); map.updateHud(); },
  'toggle-towns': (v) => { map.showSettlements = v; map.draw(); },
  'toggle-q': (v) => { map.showQ = v; map.draw(); },
  'toggle-cars': (v) => { map.showVehicles = v; map.draw(); },
  'toggle-borders': (v) => { map.showBorders = v; map.draw(); },
  'toggle-cities': (v) => { map.showCities = v; map.draw(); },
  'toggle-water': (v) => { map.showWater = v; map.draw(); },
  'toggle-peds': (v) => { map.showPeds = v; map.draw(); }
};
for (const [id, fn] of Object.entries(toggles)) {
  const el = document.getElementById(id);
  if (el) el.addEventListener('change', () => fn(el.checked));
}

window.addEventListener('resize', () => { map.resize(); map.draw(); map.requestDetail(); });
window.addEventListener('keydown', (e) => {
  if (e.target && /INPUT|TEXTAREA/.test(e.target.tagName)) return;
  const step = 40 * (e.shiftKey ? 3 : 1);
  const zoom = e.key === '+' || e.key === '=' ? 1.4 : e.key === '-' ? 1 / 1.4 : 0;
  if (zoom) {
    map.setZoom(map.scale * zoom, { x: map.view.w / 2, y: map.view.h / 2 });
  } else if (e.key === 'ArrowLeft') map.shift(step, 0);
  else if (e.key === 'ArrowRight') map.shift(-step, 0);
  else if (e.key === 'ArrowUp') map.shift(0, step);
  else if (e.key === 'ArrowDown') map.shift(0, -step);
  else if (e.key === 'Home' || e.key === '0') map.fitWorld();
  else return;
  e.preventDefault();
  map.draw();
  map.requestDetail();
  map.updateHud();
});

/* Живой слой §44: пока включён транспорт, мир идёт своими часами.
   Кадр рисуется не чаще 20 раз в секунду, в скрытой вкладке — ни одного. */
let lastTick = 0;
let lastDraw = 0;
function liveLoop(now) {
  requestAnimationFrame(liveLoop);
  if (document.hidden || !map.transport || !map.showVehicles) { lastTick = now; return; }
  const dt = Math.min(0.5, (now - lastTick) / 1000);
  lastTick = now;
  map.tick(dt);
  if (now - lastDraw < 50) return;
  lastDraw = now;
  map.draw();
}
if (typeof requestAnimationFrame === 'function') {
  lastTick = performance.now();
  requestAnimationFrame(liveLoop);
}

if (hud.loadingText) hud.loadingText.textContent = 'мир ' + WORLD2D.sizeKm + ' × ' + WORLD2D.sizeKm + ' км…';
boot();
