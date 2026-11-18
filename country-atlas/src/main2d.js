/* РАТГРАД 2D: карта 7000 × 7000 км, простое движение, без поворотов и без 3D. */
import { Map2D } from './map2d.js';
import { isPhone, startCenter, FIT } from './fit2d.js';
import { WorldView, overviewScale } from './worldview.js';
import { buildWorld, advanceWars, worldStats, hottestWar, diplomacyStats, WM } from './worldmap2d.js';
import { techStats } from './tech2d.js';
import { START, overlayPhase, startSceneView } from './startscene2d.js';
import { Intro } from './intro.js';
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
  newsList: document.getElementById('news-list'),
  newsCount: document.getElementById('news-count'),
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

/* §90: заставка живёт по своему состоянию, а не по «карта готова — гасим всё».
   Пролёт должен быть виден и после загрузки, иначе анимации просто нет. */
const startState = { hasIntro: false, loaded: false, started: false, failed: false, point: '', index: 0, total: 0, hidden: false, progress: '' };

function applyStartScene() {
  const view = startSceneView(overlayPhase(startState), {
    point: startState.point, index: startState.index, total: startState.total
  });
  if (hud.loading) {
    hud.loading.classList.toggle('done', !view.overlayVisible);
    if (!view.overlayVisible && !startState.hidden) {
      startState.hidden = true;
      setTimeout(() => { if (hud.loading) hud.loading.style.display = 'none'; }, START.fadeMs);
    }
  }
  const btn = document.getElementById('intro-start');
  if (btn) btn.disabled = view.buttonDisabled;
  // пока мир рисуется — показываем, сколько уже готово, а не только «загружается»
  const text = view.phase === 'loading' && startState.progress
    ? 'пролёт над страной · мир ' + startState.progress
    : view.text;
  if (hud.loadingText) hud.loadingText.textContent = text;
  const pointEl = document.getElementById('intro-point');
  if (pointEl && view.point) pointEl.textContent = view.point;
  return view;
}

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
wireButton('fit', () => { map.autoFit = false; map.fitWorld(); });
wireButton('center', () => { map.center = { x: 0, y: 0 }; });

/* §83: авто-масштаб. Три режима и выключатель: «авто» держит масштаб под экран,
   поворот телефона пересчитывает кадр, а не обрезает карту. */
const fitButtons = [
  ['auto', null],
  ['fit-country', 'country'],
  ['fit-region', 'region'],
  ['fit-city', 'city']
];
for (const [id, mode] of fitButtons) {
  const el = document.getElementById(id);
  if (!el) continue;
  el.addEventListener('click', () => {
    if (!mode) {
      map.autoFit = !map.autoFit;
      if (map.autoFit) map.applyFit(map.fitMode);
    } else {
      map.applyFit(mode);
      if (mode === 'country') map.center = startCenter(map.settlements, 'country');
    }
    map.clampCenter();
    map.draw();
    map.requestDetail();
    map.updateHud();
  });
}
function refreshAutoFit() {
  map.resize();
  if (map.autoFit) map.applyFit(map.fitMode);
  map.clampCenter();
  map.draw();
  map.updateHud();
}
/* телефон: стартуем страной, а не «0.16 px/км» — иначе видно четыре километра мира */
if (isPhone(window.innerWidth, window.innerHeight)) {
  map.applyFit('country');
  map.center = startCenter(map.settlements, 'country');
}

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
    startState.progress = done + '/' + total;
    if (hud.loadingText) hud.loadingText.textContent = 'пролёт над страной · мир ' + done + '/' + total;
  }).then(() => {
    map.draw();
    // §90: карта готова — но заставку не гасим: пролёт идёт, кнопка ждёт игрока
    startState.loaded = true;
    applyStartScene();
    window.__ratgrad = { map };
    // границы §7 и экономика §31.33 считаются следом, чтобы карта появилась сразу.
    // F-352: каждый слой собирается отдельно: раньше одна ошибка (например, моря)
    // обрывала весь блок — и кнопка «карта мира» оставалась без обработчика.
    setTimeout(() => {
      const step = (name, fn) => {
        try { fn(); } catch (err) {
          if (hud.status) hud.status.textContent = name + ' не собрались: ' + err.message;
        }
      };
      step('границы', () => map.buildBorders());
      // F-354: вода считается по одной задаче за кадр — вместо 1.3 с подряд
      const afterWater = () => {
        step('экономика', () => { map.buildEconomy(); map.updateEconomyPanel(); });
        step('железная дорога', () => map.buildRailLayer());
        step('аэродромы', () => map.buildAirLayer());
        step('морские пути', () => { if (map.water) map.buildSeaLayer(); });
        step('рисунок', () => map.draw());
        step('сейв', () => restoreOffline());
        step('карта мира', () => setupWorld());
        // карта страны готова — кнопка «начать игру» оживает, пролёт идёт дальше
        if (intro) {
          intro.ready = true;
          startState.loaded = true;
          applyStartScene();
        }
      };
      step('вода', () => map.buildWaterDeferred(afterWater));
    }, 30);
  });
}

/* §86: карта мира. Отдельный экран со своей камерой; игрок здесь ничего не решает —
   войны идут сами, а он смотрит. Переход — анимация: камера улетает от страны к планете,
   и ровно в это время базовый слой мира дорисовывается по проходам. */
let worldView = null, world = null, worldScreen = null;
let worldRaf = 0, worldLast = 0, worldStatsT = 0;
let sharedWorld = null, intro = null;

/* §87: начальная сцена. Пролёт над своей страной идёт, пока грузится карта;
   кнопка «начать игру» появляется только когда всё готово. */
function setupIntro() {
  const canvas = document.getElementById('intro-map');
  const startBtn = document.getElementById('intro-start');
  if (!canvas) { startState.failed = true; applyStartScene(); return; }
  // мир для пролёта тот же, что откроется по кнопке «карта мира» — второго не строим
  try {
    sharedWorld = buildWorld(424242);
    intro = new Intro(canvas, sharedWorld, {
      // F-306: подпись точки пролёта видна и в заставке — над чем летим
      onPoint: (pt, i, n) => {
        startState.point = pt.name;
        startState.index = i;
        startState.total = n;
        applyStartScene();
      }
    });
    intro.start();
    startState.hasIntro = true;
  } catch (err) {
    // без пролёта игра открывается как раньше — заставка просто гаснет
    startState.hasIntro = false;
    startState.failed = true;
    if (intro) intro.stop();
    intro = null;
    applyStartScene();
    if (hud.status) hud.status.textContent = 'пролёт не собрался: ' + err.message;
    return;
  }
  window.__ratgradIntro = intro;
  const begin = () => {
    if (!intro || !intro.ready) return;
    intro.stop();
    startState.started = true;
    applyStartScene();
    map.draw();
  };
  if (startBtn) {
    startBtn.addEventListener('click', begin);
    startBtn.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') begin(); });
  }
  window.addEventListener('resize', () => { if (intro && intro.running) { intro.resize(); intro.draw(); } });
  // страховка: если загрузка почему-то не дошла, кнопка всё равно оживёт
  setTimeout(() => {
    if (!intro || intro.ready) return;
    intro.ready = true;
    startState.loaded = true;
    applyStartScene();
  }, 15000);
  applyStartScene();
  return { intro, begin };
}

function setupWorld() {
  if (worldView) return;                     // уже подключено — второй раз не нужно
  worldScreen = document.getElementById('world-screen');
  const canvas = document.getElementById('world-map');
  const back = document.getElementById('world-back');
  const sat = document.getElementById('world-satellite');
  const openBtn = document.getElementById('world-open');
  const statsEl = document.getElementById('world-stats');
  const contactsEl = document.getElementById('world-contacts');
  const techEl = document.getElementById('world-tech');
  const loadEl = document.getElementById('world-load');
  if (!worldScreen || !canvas || !openBtn) return;

  worldView = new WorldView(canvas, {});
  worldView.onStats = (text) => { if (statsEl) statsEl.textContent = text; };

  /* мир считается один раз и дальше идёт вместе с часами игры */
  const ensureWorld = () => {
    if (world) return world;
    world = sharedWorld || buildWorld(424242);
    const target = map.transport ? map.transport.minutes : 0;
    // догоняем войну до текущего часа: шагами по 45 игровых минут
    while (world.minutes + 45 <= target) advanceWars(world, world.minutes + 45);
    if (target > world.minutes) advanceWars(world, target);
    worldView.setWorld(world);
    if (window.__ratgrad) { window.__ratgrad.worldView = worldView; window.__ratgrad.getWorld = ensureWorld; }
    return world;
  };

  const drawStats = () => {
    if (!world) return null;
    const st = worldStats(world);
    const hot = hottestWar(world);
    const nf = (n) => n.toLocaleString('ru-RU');
    const lines = [
      'стран ' + st.countries + ' · войн сейчас ' + st.wars + ' · боёв ' + nf(st.battles),
      'взрывов на карте ' + st.explosions + ' · всего ' + nf(st.explosionsTotal),
      'разрушено: городов ' + st.destroyedCities + ', дорог ' + st.destroyedRoads + ', мостов ' + st.destroyedBridges,
      'оккупировано: ' + st.occupiedZones + ' зон · ' + nf(st.occupiedKm2) + ' км²',
      'потери ' + nf(st.killed) + ' · армий видно ' + st.armiesVisible,
      hot ? 'бои: ' + hot.a + ' — ' + hot.b + ' · ' + hot.battles + ' боёв' : 'сейчас тихо',
      st.ownAtWar ? 'наша страна воюет' : 'наша страна не воюет'
    ];
    const tech = techStats(world);
    lines.push('технологии: ' + tech.count + ' из ' + tech.catalog.toLocaleString('ru-RU') + ' · наука +' + tech.perDay.toLocaleString('ru-RU') + ' в сутки');
    lines.push('спутник: ' + (tech.satellite ? 'видит армии · точность ' + tech.accuracy.toFixed(2) : 'ещё не готов'));
    const dip = diplomacyStats(world);
    lines.push('контакты: союз ' + dip.union + ' · дружба ' + dip.friend + ' · вражда ' + dip.enmity + ' · посольств ' + dip.embassies);
    lines.push('помощь: ' + dip.aidTotal + (dip.aidLast ? ' · последняя ' + dip.aidLast : ''));
    if (statsEl) statsEl.textContent = lines.join('\n');
    if (statsEl) statsEl.style.whiteSpace = 'pre-line';
    if (contactsEl) {
      // в панели — только близкие контакты: дальше список не нужен и мешает
      const near = dip.list.filter((c) => c.neighbour).slice(0, 6);
      contactsEl.textContent = near.map((c) =>
        c.name + ' — ' + c.level + (c.war ? ' · война' : '') + (c.embassy ? ' · посольство' : '')).join('\n');
      contactsEl.style.whiteSpace = 'pre-line';
    }
    if (techEl) {
      // в панели — свои последние разработки и кто из соседей впереди по науке
      const mine = tech.last.slice(-3).reverse();
      const leaders = tech.leaders.map((c) => c.name + ' ' + c.count).join(' · ');
      techEl.textContent = [
        'открыто ' + tech.count + ' · следующая: ' + (tech.next || 'всё открыто') + ' (' + Math.round(tech.progress * 100) + '%)',
        mine.length ? 'последние: ' + mine.join('; ') : 'пока ничего не открыто',
        leaders ? 'впереди по науке: ' + leaders : ''
      ].filter(Boolean).join('\n');
      techEl.style.whiteSpace = 'pre-line';
    }
    if (loadEl) loadEl.textContent = worldView.loading ? 'рисуем мир…' : 'мир: ' + WM.countries + ' стран · ' + world.own.tech.count + ' технологий';
    return st;
  };

  const isOpen = () => !!(worldScreen && worldScreen.classList && worldScreen.classList.contains('open'));
  const loop = (now) => {
    if (!isOpen() || !worldView) { worldRaf = 0; return; }
    worldRaf = requestAnimationFrame(loop);
    const dt = Math.min(0.1, (now - worldLast) / 1000 || 0.016);
    worldLast = now;
    // часы игры продолжают идти: война живёт и пока мы смотрим.
    // F-351: шагаем только когда игра прожила новую минуту, а не каждый кадр.
    const target = map.transport ? map.transport.minutes : 0;
    if (world && target - world.minutes >= 1) advanceWars(world, target);
    try {
      worldView.step(dt);
      // F-351: если кадр мира дороже бюджета — рисуем реже, но время идёт так же
      const budget = worldView.lastDrawMs > 12 ? 33 : 16;
      if (now - (worldView.drawnAt || 0) >= budget - 3 || !worldView.drawnAt) {
        worldView.drawnAt = now;
        worldView.draw();
      }
    } catch (err) {
      if (hud.status) hud.status.textContent = 'карта мира не нарисовалась: ' + err.message;
      worldRaf = 0;
      return;
    }
    worldStatsT += dt;
    if (worldStatsT > 0.4) { worldStatsT = 0; drawStats(); }
  };

  const openWorld = () => {
    if (!worldScreen || !worldView) return;
    try {
      ensureWorld();
    } catch (err) {
      if (hud.status) hud.status.textContent = 'мир не собрался: ' + err.message;
      return;
    }
    worldScreen.classList.add('open');
    worldScreen.setAttribute('aria-hidden', 'false');
    worldView.resize();
    // камера стартует от игрового кадра — отсюда и «пролёт» к планете
    const start = map.center || { x: 0, y: 0 };
    const scale = Number.isFinite(map.scale) ? Math.max(0.05, map.scale) : 0.05;
    worldView.open({ x: start.x || 0, y: start.y || 0, scale });
    drawStats();
    worldLast = performance.now();
    if (!worldRaf) worldRaf = requestAnimationFrame(loop);
  };
  const closeWorld = () => {
    if (!worldScreen || !worldView) return;
    worldScreen.classList.remove('open');
    worldScreen.setAttribute('aria-hidden', 'true');
    worldView.close();
    if (worldRaf) { cancelAnimationFrame(worldRaf); worldRaf = 0; }
    try { map.draw(); } catch (err) { /* карта страны могла ещё не собраться — это не повод падать */ }
  };

  openBtn.addEventListener('click', openWorld);
  if (back) back.addEventListener('click', closeWorld);
  if (sat) sat.addEventListener('click', () => {
    worldView.showArmies = !worldView.showArmies;
    const ready = !!(world && world.own && world.own.tech && world.own.tech.eff.satellite);
    sat.textContent = 'спутник: ' + (worldView.showArmies ? (ready ? 'вкл' : 'нужна наука') : 'выкл');
    drawStats();
    worldView.draw();
  });

  /* указатели: панорама одним пальцем, щипок и колесо — масштаб */
  const touches = new Map();
  let drag = null, pinch = null;
  const local = (e) => {
    const r = canvas.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };
  canvas.addEventListener('pointerdown', (e) => {
    if (!worldView) return;
    const p = local(e);
    touches.set(e.pointerId, p);
    drag = { x: p.x, y: p.y, id: e.pointerId };
    if (touches.size === 2) {
      const [a, b] = [...touches.values()];
      pinch = { d: Math.hypot(a.x - b.x, a.y - b.y), scale: worldView.cam.scale };
    }
    canvas.setPointerCapture && canvas.setPointerCapture(e.pointerId);
  });
  canvas.addEventListener('pointermove', (e) => {
    if (!worldView) return;
    const p = local(e);
    if (!touches.has(e.pointerId)) return;
    touches.set(e.pointerId, p);
    if (touches.size >= 2 && pinch) {
      const [a, b] = [...touches.values()];
      const d = Math.max(1, Math.hypot(a.x - b.x, a.y - b.y));
      worldView.cam.scale = Math.max(0.004, Math.min(0.9, pinch.scale * (d / Math.max(1, pinch.d))));
      worldView.clampCam();
      return;
    }
    if (drag && e.pointerId === drag.id) {
      worldView.panBy(p.x - drag.x, p.y - drag.y);
      drag.x = p.x; drag.y = p.y;
    }
  });
  const up = (e) => {
    touches.delete(e.pointerId);
    if (touches.size < 2) pinch = null;
    if (drag && e.pointerId === drag.id) drag = null;
  };
  canvas.addEventListener('pointerup', up);
  canvas.addEventListener('pointercancel', up);
  canvas.addEventListener('wheel', (e) => {
    if (!worldView) return;
    e.preventDefault();
    const p = local(e);
    worldView.zoomAt(p.x, p.y, e.deltaY < 0 ? 1.18 : 1 / 1.18);
  }, { passive: false });
  window.addEventListener('keydown', (e) => {
    try { if (e.key === 'Escape' && isOpen()) closeWorld(); } catch (err) { /* клавиша не должна ронять игру */ }
  });
  window.addEventListener('resize', () => {
    if (isOpen()) { worldView.resize(); worldView.draw(); }
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

window.addEventListener('resize', () => refreshAutoFit());
window.addEventListener('orientationchange', () => setTimeout(refreshAutoFit, 120));
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
let drawCost = 16;                  // сколько стоит кадр страны — мерим, а не гадаем
function liveLoop(now) {
  requestAnimationFrame(liveLoop);
  if (document.hidden || !map.transport || !map.showVehicles) { lastTick = now; return; }
  const dt = Math.min(0.5, (now - lastTick) / 1000);
  lastTick = now;
  map.tick(dt);                     // мир живёт всегда: числа не зависят от отрисовки
  // F-350: не рисуем то, что не видно. Раньше карта страны перерисовывалась 20 раз
  // в секунду даже под заставкой и под открытой картой мира — на телефоне это и был
  // «лагает»: два отрисовщика работали одновременно.
  if (worldScreen && worldScreen.classList.contains && worldScreen.classList.contains('open')) return;
  if (overlayPhase(startState) !== 'closed') return;
  // F-350: и не чаще, чем успеваем: кадр в 30 мс не должен идти 20 раз в секунду
  const interval = Math.max(50, Math.min(200, drawCost * 2.5));
  if (now - lastDraw < interval) return;
  lastDraw = now;
  const t0 = performance.now();
  try { map.draw(); } catch (err) { /* кадр не должен убивать цикл */ }
  drawCost = drawCost * 0.8 + (performance.now() - t0) * 0.2;
}
if (typeof requestAnimationFrame === 'function') {
  lastTick = performance.now();
  requestAnimationFrame(liveLoop);
}

if (hud.loadingText) hud.loadingText.textContent = 'мир ' + WORLD2D.sizeKm + ' × ' + WORLD2D.sizeKm + ' км…';
setupIntro();
// F-353: «карта мира» подключается сразу, а не после сборки страны: даже если
// сборка где-то упадёт, кнопка обязана открывать карту мира
setupWorld();
boot();
