/* Точка входа: камера, ввод, игровой цикл, сохранения. */
(function () {
  const TR = (window.TR = window.TR || {});
  const C = TR.CONFIG;
  const U = TR.Util;
  const Sim = TR.Sim;
  const Render = TR.Render;

  const app = (TR.App = {
    state: null,
    world: null,
    camera: { x: 188, y: 580, zoom: 2.4 },
    tool: 'select',
    buildQuality: 1,
    roadFrom: null,
    roadPreview: null,
    placePreview: null,
    hover: { facility: null, city: null, road: null, world: { x: 0, y: 0 } },
    selection: null,
    mouse: null,
    paused: false,
    speed: 1,
    saveTimer: 0,
    lastToastAt: 0,
    hintsSeen: {},
  });

  let canvas = null;
  let down = null;
  const MAX_ZOOM = 6;
  const pointers = new Map();
  let pinch = null;
  let spaceHeld = false;
  const keys = new Set();
  const panVel = { x: 0, y: 0 };

  /* ------------------------------------------------------------ запуск */

  function readSave() {
    try {
      const raw = localStorage.getItem(C.saveKey);
      if (!raw) return null;
      const data = JSON.parse(raw);
      return Sim.deserialize(data);
    } catch (e) {
      return null;
    }
  }

  function boot() {
    canvas = document.getElementById('map');
    const saved = readSave();
    const seed = saved ? saved.seed : (Date.now() % 1000000) + 7;
    app.state = saved || Sim.newGame(seed);
    app.world = TR.World.build(app.state.seed);
    Sim.setWorld(app.world);

    // стартовая камера
    const screenWide = window.innerWidth > 1200;
    app.camera.zoom = screenWide ? 1.02 : 0.95;
    app.camera.x = 52;
    app.camera.y = 50;
    // возвращаем камеру туда, где игрок оставил карту
    let viewRestored = false;
    try {
      const v = JSON.parse(localStorage.getItem(VIEW_KEY) || 'null');
      if (v && isFinite(v.zoom) && isFinite(v.x) && isFinite(v.y)) {
        app.camera.zoom = U.clamp(v.zoom, 0.03, MAX_ZOOM);
        app.camera.x = v.x;
        app.camera.y = v.y;
        viewRestored = true;
      }
    } catch (e) { /* приватный режим */ }
    if (!viewRestored && window.innerWidth < 820) {
      app.camera.zoom = 1.6;
      app.camera.x = app.state.roads.length ? (C.cities[app.state.roads[0].a].x + C.cities[app.state.roads[0].b].x) / 2 : C.worldW / 2;
      app.camera.y = app.state.roads.length ? (C.cities[app.state.roads[0].a].y + C.cities[app.state.roads[0].b].y) / 2 : C.worldH / 2;
    }

    if (canvas) {
      canvas.style.touchAction = 'none';
      canvas.style.userSelect = 'none';
      canvas.style.webkitUserSelect = 'none';
    }
    Render.init(canvas, app.world);
    TR.UI.init(app);
    bindInput();
    initDevice();
    const zi = document.getElementById('btn-zoom-in');
    const zo = document.getElementById('btn-zoom-out');
    const zf = document.getElementById('btn-zoom-fit');
    if (zi) zi.addEventListener('click', () => zoomBy(1.35));
    if (zo) zo.addEventListener('click', () => zoomBy(1 / 1.35));
    if (zf) zf.addEventListener('click', fitMap);
    resize();
    window.addEventListener('resize', resize);
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) app.save(true);
    });

    if (!saved) {
      setTimeout(() => TR.UI.showIntro(), 350);
    } else {
      TR.UI.toast('Прогресс восстановлен. День ' + U.dayNumber(app.state.time), 'info');
    }

    let last = performance.now();
    function frame(now) {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      step(dt);
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  function step(dt) {
    const s = app.state;
    if (!app.paused) Sim.tick(s, dt * app.speed);

    // инерция после свайпа
    if (!down && !pinch && (Math.abs(panVel.x) > 0.5 || Math.abs(panVel.y) > 0.5)) {
      app.camera.x += panVel.x * dt;
      app.camera.y += panVel.y * dt;
      const damp = Math.exp(-4.2 * dt);
      panVel.x *= damp; panVel.y *= damp;
      clampCamera();
    }

    // панорамирование клавиатурой: WASD и стрелки
    let px = 0, py = 0;
    if (keys.has('ArrowLeft') || keys.has('KeyA')) px -= 1;
    if (keys.has('ArrowRight') || keys.has('KeyD')) px += 1;
    if (keys.has('ArrowUp') || keys.has('KeyW')) py -= 1;
    if (keys.has('ArrowDown')) py += 1;
    if (px || py) {
      const ppk = Render.ppk(app.camera.zoom);
      const speedKm = 700 / ppk;
      app.camera.x += px * speedKm * dt;
      app.camera.y += py * speedKm * dt;
      clampCamera();
    }

    // звуки и уведомления из симуляции
    while (s.sfx.length) TR.Audio.play(s.sfx.shift());
    while (s.notices.length) {
      const n = s.notices.shift();
      TR.UI.toast(n.text, n.kind);
    }

    // выбранный объект мог исчезнуть
    if (app.selection) {
      if (app.selection.kind === 'facility' && !s.facilities.some((f) => f.id === app.selection.id)) app.selection = null;
      if (app.selection.kind === 'road' && !s.roads.some((r) => r.id === app.selection.id)) app.selection = null;
    }

    // автосохранение: обычное — раз в 25 секунд, плюс сразу после любого изменения
    const sig = stateSignature(s);
    if (sig !== app._saveSig) {
      app._saveSig = sig;
      app._savePending = 0.6;
    }
    app.saveTimer += dt;
    if (app._savePending > 0) {
      app._savePending -= dt;
      if (app._savePending <= 0) app.save(true);
    }
    if (app.saveTimer > 25) {
      app.saveTimer = 0;
      app.save(true);
    }

    Render.draw(app, dt);
    TR.UI.tick(dt);

    if (app.roadPreview === null && app.tool === 'road' && app.roadFrom != null) updateRoadPreview();
    if (app.tool !== 'select' && app.mouse) {
      updateHover(app.mouse.x, app.mouse.y);
      if (app.tool.startsWith('fac:')) updatePlacePreview();
    }
  }

  function stateSignature(s) {
    return [
      Math.round(s.money), Math.round(s.debt), s.roads.length, s.facilities.length, s.level,
      s.upgrades.crew, s.upgrades.fleet, s.upgrades.marketing, s.upgrades.quality, s.upgrades.maintenance,
      s.objDone.length, s.contracts.length, s.crisis ? s.crisis.id : '-',
    ].join('|');
  }

  const DEVICE_KEY = 'trassa-device';
  // положение камеры храним отдельно от прогресса, чтобы не менять формат сейва
  const VIEW_KEY = 'trassa-road-empire-view-v1';

  function setDevice(mode) {
    document.documentElement.setAttribute('data-device', mode);
    const btn = document.getElementById('btn-device');
    if (btn) {
      btn.textContent = mode === 'mobile' ? 'ТЕЛ' : 'ПК';
      btn.title = mode === 'mobile' ? 'Раскладка для телефона — включена' : 'Раскладка для компьютера — включена';
    }
    try { localStorage.setItem(DEVICE_KEY, mode); } catch (e) { /* приватный режим */ }
    if (TR.Render && TR.Render.resize) TR.Render.resize();
  }

  function initDevice() {
    let saved = null;
    try { saved = localStorage.getItem(DEVICE_KEY); } catch (e) { saved = null; }
    const mode = saved || (window.innerWidth <= 1040 ? 'mobile' : 'desktop');
    setDevice(mode);
    const btn = document.getElementById('btn-device');
    if (btn) {
      btn.addEventListener('click', () => {
        const next = document.documentElement.getAttribute('data-device') === 'mobile' ? 'desktop' : 'mobile';
        setDevice(next);
        TR.UI.toast(next === 'mobile' ? 'Раскладка для телефона: большие кнопки и панели снизу' : 'Раскладка для компьютера: панели по краям', 'info');
      });
    }
  }

  app.setDevice = setDevice;

  function initSheet() {
    const menu = document.getElementById('btn-menu');
    const close = document.getElementById('sheet-close');
    const openSheet = (on) => document.body.classList.toggle('sheet-open', on);
    if (menu) menu.addEventListener('click', () => openSheet(!document.body.classList.contains('sheet-open')));
    if (close) close.addEventListener('click', () => openSheet(false));
    // тап по карте закрывает меню, чтобы освободить экран
    if (canvas) {
      canvas.addEventListener('pointerdown', () => {
        if (document.body.classList.contains('sheet-open')) openSheet(false);
      }, true);
    }
    const panel = document.querySelector('.panel.tools');
    if (panel) {
      panel.addEventListener('click', (e) => {
        if (e.target.closest('[data-tool], .road-card, .obj-card')) openSheet(false);
      });
    }
    app.openSheet = openSheet;
  }

  function resize() {
    Render.resize();
    app.camera.zoom = U.clamp(app.camera.zoom, minZoom(), MAX_ZOOM);
    clampCamera();
  }

  function minZoom() {
    const fit = Math.min(window.innerWidth / (C.worldW * 9), (window.innerHeight - 120) / (C.worldH * 9));
    return U.clamp(Math.min(1.1, fit), 0.05, 1.1);
  }

  function zoomBy(factor) {
    app.camera.zoom = U.clamp(app.camera.zoom * factor, minZoom(), MAX_ZOOM);
    clampCamera();
  }
  app.zoomBy = zoomBy;

  function clampCamera() {
    const ppk = Render.ppk(app.camera.zoom);
    const vw = window.innerWidth, vh = window.innerHeight;
    const halfW = vw / 2 / ppk, halfH = vh / 2 / ppk;
    // Свободная панорама: карту всегда можно утащить в любую сторону.
    // Ограничение только одно — не отпустить карту дальше половины экрана за край.
    const padL = vw > 1040 ? 300 / ppk : 0;
    const padR = vw > 1040 ? 336 / ppk : 0;
    const overX = halfW * 0.75, overY = halfH * 0.75;
    const minX = -overX - padL;
    const maxX = C.worldW + overX + padR;
    const minY = -overY;
    const maxY = C.worldH + overY;
    if (isFinite(minX) && isFinite(maxX) && maxX > minX) {
      app.camera.x = U.clamp(app.camera.x, minX, maxX);
    }
    if (isFinite(minY) && isFinite(maxY) && maxY > minY) {
      app.camera.y = U.clamp(app.camera.y, minY, maxY);
    }
  }

  /* ------------------------------------------------------------- ввод */

  function bindInput() {
    canvas.addEventListener('pointerdown', onPointerDown);
    canvas.addEventListener('pointermove', onPointerMove);
    canvas.addEventListener('pointerup', onPointerUp);
    canvas.addEventListener('pointercancel', onPointerUp);
    canvas.addEventListener('pointerleave', () => { if (!down) { app.mouse = null; app.hover.facility = null; app.hover.city = null; app.hover.road = null; } });
    canvas.addEventListener('wheel', onWheel, { passive: false });
    canvas.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      if (down && down.moved) return;
      cancelTool();
    });

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', (e) => {
      if (e.code === 'Space') spaceHeld = false;
      keys.delete(e.code);
    });
    canvas.addEventListener('dblclick', (e) => {
      const p = screenPoint(e);
      const w = Render.toWorld(app, p.x, p.y);
      app.camera.zoom = U.clamp(app.camera.zoom * 1.8, minZoom(), MAX_ZOOM);
      app.camera.x = w.x;
      app.camera.y = w.y;
      clampCamera();
    });
  }

  function screenPoint(e) {
    const r = canvas.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  }

  function onPointerDown(e) {
    TR.UI.closeTooltip();
    const p = screenPoint(e);
    canvas.setPointerCapture(e.pointerId);
    pointers.set(e.pointerId, p);
    if (pointers.size === 2) {
      const pts = [...pointers.values()];
      pinch = {
        dist: Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y),
        zoom: app.camera.zoom,
        mid: { x: (pts[0].x + pts[1].x) / 2, y: (pts[0].y + pts[1].y) / 2 },
      };
      down = null;
      return;
    }
    if (pointers.size > 2) return;
    down = { x: p.x, y: p.y, startX: p.x, startY: p.y, moved: false, button: e.button };
    app.mouse = p;
    updateHover(p.x, p.y);
  }

  function onPointerMove(e) {
    const p = screenPoint(e);
    app.mouse = p;
    // на тач-экранах тянем карту сразу и не даём браузеру перехватить жест
    if (e.pointerType === 'touch' && (down || pinch)) { try { e.preventDefault(); } catch (err) { /* пассивный слушатель */ } }

    if (pointers.has(e.pointerId)) pointers.set(e.pointerId, p);

    if (pinch && pointers.size === 2) {
      const pts = [...pointers.values()];
      const dist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
      if (pinch.dist > 12) {
        const before = Render.toWorld(app, pinch.mid.x, pinch.mid.y);
        app.camera.zoom = U.clamp((pinch.zoom * dist) / pinch.dist, minZoom(), MAX_ZOOM);
        const after = Render.toWorld(app, pinch.mid.x, pinch.mid.y);
        app.camera.x += before.x - after.x;
        app.camera.y += before.y - after.y;
        const mid = { x: (pts[0].x + pts[1].x) / 2, y: (pts[0].y + pts[1].y) / 2 };
        const dx = mid.x - pinch.mid.x, dy = mid.y - pinch.mid.y;
        const ppk = Render.ppk(app.camera.zoom);
        app.camera.x -= dx / ppk;
        app.camera.y -= dy / ppk;
        pinch.mid = mid;
        clampCamera();
      }
      down = null;
      return;
    }

    if (down) {
      const dx = p.x - down.startX, dy = p.y - down.startY;
      if (!down.moved && Math.hypot(dx, dy) > 2) down.moved = true;
      if (down.moved) {
        const ppk = Render.ppk(app.camera.zoom);
        const ddx = (p.x - down.x) / ppk, ddy = (p.y - down.y) / ppk;
        app.camera.x -= ddx;
        app.camera.y -= ddy;
        // скорость для инерции (км/с)
        const nowT = performance.now();
        const dtMove = Math.max(8, nowT - (down.t || nowT - 16)) / 1000;
        panVel.x = U.clamp(-ddx / dtMove, -400, 400);
        panVel.y = U.clamp(-ddy / dtMove, -400, 400);
        down.t = nowT;
        clampCamera();
        down.x = p.x;
        down.y = p.y;
        return;
      }
    }

    updateHover(p.x, p.y);
  }

  function onPointerUp(e) {
    pointers.delete(e.pointerId);
    if (pointers.size < 2) pinch = null;
    const p = screenPoint(e);
    if (down && !down.moved && e.button === 0) {
      app.mouse = p;
      updateHover(p.x, p.y);
      handleClick(p);
    }
    if (pointers.size === 0) down = null;
  }

  function onWheel(e) {
    e.preventDefault();
    const p = screenPoint(e);
    const before = Render.toWorld(app, p.x, p.y);
    const factor = Math.exp(-e.deltaY * 0.0016);
    app.camera.zoom = U.clamp(app.camera.zoom * factor, minZoom(), MAX_ZOOM);
    const after = Render.toWorld(app, p.x, p.y);
    app.camera.x += before.x - after.x;
    app.camera.y += before.y - after.y;
    clampCamera();
    app.mouse = p;
    updateHover(p.x, p.y);
  }

  function onKeyDown(e) {
    const tag = (e.target && e.target.tagName) || '';
    if (tag === 'INPUT' || tag === 'TEXTAREA') return;
    if (e.code === 'Space') {
      e.preventDefault();
      spaceHeld = true;
      togglePause();
    } else if (e.key === 'Escape') {
      if (TR.UI.closeModal()) return;
      cancelTool();
    } else if (e.code.startsWith('Arrow') || e.code === 'KeyW' || e.code === 'KeyA' || e.code === 'KeyD') {
      keys.add(e.code);
      if (e.code.startsWith('Arrow')) e.preventDefault();
      return;
    } else if (e.key === '+' || e.key === '=') zoomBy(1.25);
    else if (e.key === '-' || e.key === '_') zoomBy(1 / 1.25);
    else if (e.code === 'KeyQ') zoomBy(1 / 1.25);
    else if (e.code === 'KeyE') zoomBy(1.25);
    else if (e.key === '1') setSpeed(1);
    else if (e.key === '2') setSpeed(2);
    else if (e.key === '3') setSpeed(4);
    else if (e.key === '0') togglePause();
    else if (e.key === 'r' || e.key === 'R') setTool('road');
    else if (e.key === 's' || e.key === 'S') app.save();
    else if (e.key === 'h' || e.key === 'H' || e.key === '?') TR.UI.showHelp();
    else if (e.key === 'f' || e.key === 'F') fitMap();
  }

  /* ------------------------------------------------------- камера/хиты */

  app.fitMap = fitMap;
  function fitMap() {
    const zx = (window.innerWidth - 60) / (C.worldW * 9);
    const zy = (window.innerHeight - 160) / (C.worldH * 9);
    app.camera.zoom = U.clamp(Math.min(zx, zy), minZoom(), MAX_ZOOM);
    app.camera.x = C.worldW / 2;
    app.camera.y = C.worldH / 2;
    clampCamera();
  }

  function updateHover(sx, sy) {
    const w = Render.toWorld(app, sx, sy);
    app.hover.world = w;
    const ppk = Render.ppk(app.camera.zoom);

    // объекты
    let bestF = null, bestD = Infinity;
    for (const f of app.state.facilities) {
      const road = Sim.roadById(app.state, f.roadId);
      if (!road) continue;
      const pos = Render.facilityPos(f, road);
      const d = U.dist(pos.x, pos.y, w.x, w.y);
      const r = Math.max(2.4, 17 / ppk);
      if (d < r && d < bestD) { bestD = d; bestF = f; }
    }
    app.hover.facility = bestF;

    // города
    let bestC = null, bestCD = Infinity;
    for (let i = 0; i < C.cities.length; i++) {
      const c = C.cities[i];
      const d = U.dist(c.x, c.y, w.x, w.y);
      if (d < Math.max(5.5, 40 / ppk) && d < bestCD) { bestCD = d; bestC = i; }
    }
    app.hover.city = bestC;

    // дороги
    let bestR = null, bestRD = Infinity;
    for (const road of app.state.roads) {
      const pr = U.roadProjection(road, w.x, w.y);
      const r = Math.max(1.6, 12 / ppk);
      if (pr.dist < r && pr.dist < bestRD) { bestRD = pr.dist; bestR = road; }
    }
    app.hover.road = bestR;

    if (app.tool === 'road') updateRoadPreview();
    if (app.tool.startsWith('fac:')) updatePlacePreview();
  }

  /* --------------------------------------------------------- инструменты */

  app.setTool = setTool;
  function setTool(tool, opts) {
    if (opts && opts.quality) app.buildQuality = opts.quality;
    app.tool = tool;
    app.roadFrom = null;
    app.roadPreview = null;
    app.placePreview = null;
    app.selection = null;
    canvas.style.cursor = tool === 'select' ? 'grab' : 'crosshair';
    TR.UI.refresh();
    TR.UI.setHint();
  }

  app.cancelTool = cancelTool;
  function cancelTool() {
    if (app.roadFrom != null) {
      app.roadFrom = null;
      app.roadPreview = null;
      TR.UI.setHint();
      return;
    }
    if (app.tool !== 'select') {
      setTool('select');
    } else {
      app.selection = null;
      TR.UI.refresh();
    }
  }

  app.select = function (kind, id) {
    app.selection = { kind, id };
    if (window.innerWidth <= 1040) document.body.classList.add('side-open');
    app.tool = 'select';
    app.roadFrom = null;
    TR.UI.refresh();
    TR.UI.setHint();
  };

  function handleClick(p) {
    const w = Render.toWorld(app, p.x, p.y);

    if (app.tool === 'road') {
      handleRoadClick();
      return;
    }
    if (app.tool.startsWith('fac:')) {
      placeFacility(app.tool.slice(4));
      return;
    }

    // выбор
    if (app.hover.facility) {
      app.selection = { kind: 'facility', id: app.hover.facility.id };
      if (window.innerWidth <= 1040) document.body.classList.add('side-open');
      TR.UI.refresh();
      return;
    }
    if (app.hover.city != null) {
      app.selection = { kind: 'city', id: app.hover.city };
      TR.UI.refresh();
      return;
    }
    if (app.hover.road) {
      app.selection = { kind: 'road', id: app.hover.road.id };
      TR.UI.refresh();
      return;
    }
    app.selection = null;
    TR.UI.refresh();
  }

  function handleRoadClick() {
    const city = app.hover.city;
    if (app.roadFrom == null) {
      if (city == null) {
        TR.UI.toast('Выберите город на карте — отсюда начнётся трасса', 'info');
        return;
      }
      app.roadFrom = city;
      app.roadPreview = null;
      TR.UI.setHint(`Трасса из ${C.cities[city].name}: выберите второй город · класс ${C.roadTypes[app.buildQuality].name}`);
      TR.UI.refresh();
      return;
    }
    if (city == null) {
      TR.UI.toast('Нужно нажать на город, к которому ведём дорогу', 'info');
      return;
    }
    if (city === app.roadFrom) {
      app.roadFrom = null;
      TR.UI.setHint();
      return;
    }
    const res = Sim.buildRoad(app.state, app.world, app.roadFrom, city, app.buildQuality);
    if (!res.ok) {
      TR.UI.toast(res.error, 'bad');
      TR.Audio.play('error');
      return;
    }
    app.selection = { kind: 'road', id: res.road.id };
    if (window.innerWidth <= 1040) document.body.classList.add('side-open');
    app.roadFrom = null;
    app.roadPreview = null;
    TR.UI.refresh();
    TR.UI.setHint();
  }

  function updateRoadPreview() {
    if (app.tool !== 'road' || app.roadFrom == null) { app.roadPreview = null; return; }
    const target = app.hover.city;
    if (target == null || target === app.roadFrom) { app.roadPreview = null; return; }
    app.roadPreview = Sim.roadQuote(app.state, app.world, app.roadFrom, target, app.buildQuality);
  }

  function updatePlacePreview() {
    if (!app.tool.startsWith('fac:') || !app.mouse) { app.placePreview = null; return; }
    const key = app.tool.slice(4);
    const w = Render.toWorld(app, app.mouse.x, app.mouse.y);
    const ppk = Render.ppk(app.camera.zoom);
    let best = null;
    for (const road of app.state.roads) {
      if (!road.open || road.building) continue;
      const pr = U.roadProjection(road, w.x, w.y);
      if (!best || pr.dist < best.pr.dist) best = { road, pr };
    }
    if (!best || best.pr.dist > Math.max(3.5, 24 / ppk)) { app.placePreview = null; return; }
    const chk = Sim.canPlace(app.state, key, best.road.id, best.pr.t);
    app.placePreview = {
      roadId: best.road.id, t: best.pr.t, side: best.pr.side, ok: chk.ok,
      error: chk.error || '',
    };
  }

  function placeFacility(key) {
    const preview = app.placePreview;
    if (!preview) {
      TR.UI.toast('Наведите на готовую дорогу, чтобы поставить объект', 'info');
      return;
    }
    const res = Sim.placeFacility(app.state, key, preview.roadId, preview.t, preview.side);
    if (!res.ok) {
      TR.UI.toast(res.error, 'bad');
      TR.Audio.play('error');
      return;
    }
    app.selection = { kind: 'facility', id: res.facility.id };
    if (window.innerWidth <= 1040) document.body.classList.add('side-open');
    TR.UI.refresh();
    updatePlacePreview();
  }

  /* ------------------------------------------------------------- сервис */

  app.setSpeed = setSpeed;
  function setSpeed(n) {
    app.speed = n;
    app.paused = false;
    TR.UI.refreshSpeed();
  }
  app.togglePause = togglePause;
  function togglePause() {
    app.paused = !app.paused;
    TR.UI.refreshSpeed();
  }
  app.fitCamera = fitMap;

  function saveView() {
    try {
      localStorage.setItem(VIEW_KEY, JSON.stringify({
        zoom: app.camera.zoom, x: app.camera.x, y: app.camera.y,
      }));
    } catch (e) { /* приватный режим */ }
  }
  app.saveView = saveView;

  app.save = function (silent) {
    try {
      localStorage.setItem(C.saveKey, JSON.stringify(Sim.serializable(app.state)));
      saveView();
      TR.UI.saveIndicator();
      if (!silent) TR.UI.toast('Прогресс сохранён в браузере', 'good');
    } catch (e) {
      TR.UI.toast('Не удалось сохранить: хранилище переполнено', 'bad');
    }
  };

  app.reset = function () {
    const seed = (Date.now() % 900000) + 11;
    app.state = Sim.newGame(seed);
    app.world = TR.World.build(seed);
    Sim.setWorld(app.world);
    Render.buildTerrain(app.world);
    app.selection = null;
    app.tool = 'select';
    app.camera = { x: 52, y: 50, zoom: window.innerWidth > 1200 ? 1.02 : 0.9 };
    try { localStorage.removeItem(C.saveKey); } catch (e) { /* ignore */ }
    TR.UI.refreshAll();
    TR.UI.toast('Новая игра начата', 'good');
    TR.UI.showIntro();
  };

  app.toast = (text, kind) => TR.UI.toast(text, kind);

  window.addEventListener('load', boot);
})();
