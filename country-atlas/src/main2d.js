/* РАТГРАД 2D: карта 700 × 700 км, простое движение, без поворотов и без 3D. */
import { Map2D } from './map2d.js';
import { WORLD2D } from './world2d.js';

const canvas = document.getElementById('map');
const hud = {
  pos: document.getElementById('hud-pos'),
  height: document.getElementById('hud-height'),
  zoom: document.getElementById('hud-zoom'),
  fps: document.getElementById('hud-fps'),
  center: document.getElementById('hud-center'),
  roads: document.getElementById('hud-roads'),
  loading: document.getElementById('loading'),
  loadingText: document.getElementById('loading-text')
};

const map = new Map2D(canvas, hud);
map.center = { x: 0, y: 0 };
map.scale = 1.6;

function boot() {
  map.resize();
  map.draw();

  map.init((done, total) => {
    if (hud.loadingText) hud.loadingText.textContent = 'рисую мир 700 × 700 км… ' + done + '/' + total;
  }).then(() => {
    map.draw();
    if (hud.loading) hud.loading.classList.add('done');
    window.__ratgrad = { map };
  });
}

/* ---------- управление: простое, без инерции ---------- */
const touches = new Map();   // pointerId → { x, y }
let pinch = null;            // { dist, cx, cy }

function local(e) {
  const rect = canvas.getBoundingClientRect();
  return { x: e.clientX - rect.left, y: e.clientY - rect.top };
}

canvas.addEventListener('pointerdown', (e) => {
  canvas.setPointerCapture?.(e.pointerId);
  touches.set(e.pointerId, local(e));
  canvas.classList.add('dragging');
  if (touches.size === 2) pinch = pinchStart();
});

canvas.addEventListener('pointermove', (e) => {
  const p = local(e);
  map.pointer = { x: p.x, y: p.y, inside: true };

  const prev = touches.get(e.pointerId);
  touches.set(e.pointerId, p);

  if (touches.size >= 2) {
    // два пальца: расстояние — зум, середина — сдвиг
    const now = pinchStart();
    if (pinch && now.dist > 0) {
      const factor = now.dist / pinch.dist;
      map.setZoom(map.scale * factor, now);
    }
    if (pinch) {
      map.shift(now.cx - pinch.cx, now.cy - pinch.cy);
      map.clampCenter();
    }
    pinch = now;
    map.draw();
    map.requestDetail();
    map.updateHud();
    return;
  }

  if (prev) {
    map.shift(p.x - prev.x, p.y - prev.y);
    map.clampCenter();
    map.draw();
    map.requestDetail();
  }
  map.updateHud();
});

function endPointer(e) {
  touches.delete(e.pointerId);
  if (touches.size < 2) pinch = null;
  if (touches.size === 0) canvas.classList.remove('dragging');
  canvas.releasePointerCapture?.(e.pointerId);
}
canvas.addEventListener('pointerup', endPointer);
canvas.addEventListener('pointercancel', endPointer);
canvas.addEventListener('pointerleave', (e) => {
  if (e.pointerType === 'mouse') map.pointer.inside = false;
});

function pinchStart() {
  const [a, b] = [...touches.values()];
  return { dist: Math.hypot(a.x - b.x, a.y - b.y), cx: (a.x + b.x) / 2, cy: (a.y + b.y) / 2 };
}

canvas.addEventListener('dblclick', (e) => {
  e.preventDefault();
  map.center = { x: 0, y: 0 };
  map.clampCenter();
  map.draw();
});

canvas.addEventListener('wheel', (e) => {
  e.preventDefault();
  const anchor = local(e);
  const factor = e.deltaY > 0 ? 1 / 1.18 : 1.18;
  map.setZoom(map.scale * factor, anchor);
  map.requestDetail();
}, { passive: false });

document.getElementById('zoom-in').addEventListener('click', () => {
  map.setZoom(map.scale * 1.5, { x: map.view.w / 2, y: map.view.h / 2 });
  map.requestDetail();
});
document.getElementById('zoom-out').addEventListener('click', () => {
  map.setZoom(map.scale / 1.5, { x: map.view.w / 2, y: map.view.h / 2 });
});
document.getElementById('center').addEventListener('click', () => {
  map.center = { x: 0, y: 0 };
  map.clampCenter();
  map.draw();
});

const toggles = {
  'toggle-grid': (v) => { map.showGrid = v; map.draw(); },
  'toggle-roads': (v) => { map.showRoads = v; map.draw(); },
  'toggle-towns': (v) => { map.showSettlements = v; map.draw(); },
  'toggle-q': (v) => { map.showQ = v; map.draw(); }
};
for (const [id, fn] of Object.entries(toggles)) {
  const el = document.getElementById(id);
  if (el) el.addEventListener('change', () => fn(el.checked));
}

window.addEventListener('resize', () => { map.resize(); map.draw(); map.requestDetail(); });
window.addEventListener('keydown', (e) => {
  // стрелка показывает, куда смотрит игрок: вправо — на восток, вверх — на север
  if (e.key === 'ArrowLeft') map.shift(40, 0);
  else if (e.key === 'ArrowRight') map.shift(-40, 0);
  else if (e.key === 'ArrowUp') map.shift(0, 40);
  else if (e.key === 'ArrowDown') map.shift(0, -40);
  else return;
  map.draw(); map.requestDetail();
});

if (hud.loadingText) hud.loadingText.textContent = 'мир ' + WORLD2D.sizeKm + ' × ' + WORLD2D.sizeKm + ' км…';
boot();
