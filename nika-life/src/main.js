/* =============================================================================
   НИКА: ЖИВАЯ — точка входа: состояние, игровой цикл, события ИИ, сохранение
   ============================================================================= */
(function (root) {
  'use strict';
  const NIKA = root.NIKA;
  const world = NIKA.world, anim = NIKA.anim, rig = NIKA.rig, data = NIKA.data;
  const canvas = document.getElementById('stage');
  const ctx = canvas.getContext('2d');
  let dpr = 1;

  const app = {
    state: null,
    animator: new anim.Animator(),
    manual: {},
    demo: null,
  };
  root.NIKA.app = app; // удобно для отладки в консоли

  /* --- загрузка сохранения -------------------------------------------------- */
  function load() {
    try {
      const raw = root.localStorage && root.localStorage.getItem(world.SAVE_KEY);
      return world.deserialize(raw);
    } catch (e) { return world.freshState(); }
  }
  app.state = load();

  function setupAnimator() {
    app.animator = new anim.Animator();
    app.animator.setBase([
      { clip: anim.findClip('torso', 'breathe'), weight: 0.7 },
      { clip: anim.findClip('hair', 'shimmer'), weight: 0.35 },
      { clip: anim.findClip('skirt', 'sway'), weight: 0.22 },
    ]);
  }
  setupAnimator();

  /* --- сохранение / сброс --------------------------------------------------- */
  function save(silent) {
    try {
      root.localStorage.setItem(world.SAVE_KEY, JSON.stringify(world.serialize(app.state)));
      if (!silent) { ui.flashSave(); ui.toast('Прогресс сохранён', 'good'); }
      else ui.flashSave();
    } catch (e) { if (!silent) ui.toast('Не удалось сохранить (браузер запретил localStorage)', 'bad'); }
  }
  function reset() {
    try { root.localStorage.removeItem(world.SAVE_KEY); } catch (e) { /* ignore */ }
    stopDemo();
    app.state = world.freshState();
    Object.keys(app.manual).forEach(function (k) { delete app.manual[k]; });
    setupAnimator();
    ui.rebuildChat();
    ui.refresh(true);
    ui.toast('Новая жизнь началась', 'good');
  }

  /* --- интерфейс ------------------------------------------------------------ */
  const ui = NIKA.ui.createUI(app);

  /* --- события от симуляции ------------------------------------------------- */
  function drain() {
    const events = app.state.events.splice(0);
    events.forEach(function (e) {
      switch (e.type) {
        case 'play': app.animator.play(e.part, e.id, e); break;
        case 'clearAction':
          app.animator.clearTag('action');
          app.animator.clearPrefix('scene');
          app.animator.clearPrefix('dress-');
          break;
        case 'clearTag': app.animator.clearPrefix(e.prefix); break;
        case 'say': ui.appendLog(e.entry); break;
        case 'toast': ui.toast(e.text, e.kind); break;
        case 'tab': ui.setTab(e.tab); break;
        case 'motor':
          if (e.program && e.program.learned) ui.toast('Движение из выученной программы: ' + e.program.label);
          break;
        case 'save': save(false); break;
        case 'reset': reset(); break;
        default: break;
      }
    });
  }

  /* --- публичные действия для UI -------------------------------------------- */
  app.command = async function (text) {
    app.state.lastCommand = text;
    const result = await world.command(text, app.state);
    drain();
    ui.refresh(true);
    return result;
  };
  app.playClip = function (part, id) {
    world.playClip(app.state, part, id);
    drain();
  };
  app.wearItem = function (item, color) {
    world.wear(app.state, item, color);
    world.say(app.state, 'Надела ' + item.name + (color ? ' в ' + color.name + ' цвете' : '') + '. Сама управляю гардеробом.', 'nika');
    world.emit(app.state, { type: 'play', part: 'skirt', id: 'settle', replace: true });
    drain();
    ui.toast('Надела: ' + item.name, 'good');
  };
  app.removeSlot = function (slot) {
    if (!app.state.outfit[slot]) return;
    app.state.outfit[slot] = null;
    world.say(app.state, 'Сняла ' + (data.SLOT_LABELS[slot] || 'вещь').toLowerCase() + '.', 'nika');
    drain();
    ui.toast('Снято');
  };
  app.recolor = function (color) {
    const s = app.state;
    const slot = ['dress', 'top', 'outer'].find(function (k) { return s.outfit[k]; });
    if (!slot) { ui.toast('Сначала надень что-нибудь', 'bad'); return; }
    s.outfit[slot].color = color.hex;
    world.say(app.state, 'Поменяла цвет наряда на ' + color.name + '.', 'nika');
    drain();
  };
  app.randomOutfit = function () {
    const s = app.state;
    const pool = data.ITEMS.filter(function (i) { return s.owned.indexOf(i.id) !== -1 && (i.slot === 'dress' || i.slot === 'top' || i.slot === 'bottom'); });
    if (!pool.length) return;
    const item = pool[Math.floor(Math.random() * pool.length)];
    world.wear(s, item, null);
    world.say(s, 'Сама выбрала наряд: ' + item.name + '. Мне идёт?', 'nika', 'ai');
    world.emit(s, { type: 'play', part: 'skirt', id: 'twirl', replace: true });
    drain();
    ui.toast('Ника выбрала: ' + item.name, 'good');
  };
  /* --- обучение ИИ из интерфейса ------------------------------------------- */
  app.learnText = function (text) {
    const res = NIKA.ai.learnFromText(text);
    app.state.learned = NIKA.ai.info().learned;
    ui.toast('Выучено фраз: ' + res.added, res.added ? 'good' : 'bad');
    ui.refresh(true);
    return res;
  };
  app.feedback = function (phrase, intentId) {
    const ok = NIKA.ai.feedback(phrase, intentId);
    if (ok) {
      app.state.learned = NIKA.ai.info().learned;
      world.say(app.state, 'Исправила: «' + phrase + '» теперь значит «' + NIKA.ai.INTENT_BY_ID[intentId].label + '». Спасибо, я умнее!', 'nika', 'ai');
      ui.toast('ИИ дообучен на твоей фразе', 'good');
      drain(); ui.refresh(true);
    }
    return ok;
  };
  app.exportKnowledge = function () {
    return JSON.stringify({ version: 1, examples: NIKA.ai.learnedExamples() }, null, 2);
  };
  app.setSpeed = function (n) { app.state.speed = n; ui.refresh(true); };
  app.setPaused = function (v) { app.state.paused = !!v; ui.refresh(true); };
  app.save = function () { save(false); };

  /* --- камера, устройства и внешний вид ------------------------------------ */
  app.setZoom = function (value) {
    app.state.zoom = Math.max(0.75, Math.min(1.8, value));
    world.clampCamera(app.state);
    ui.refresh(true);
  };
  app.pan = function (screenDx) {
    const W = Math.max(320, root.innerWidth) * data.WORLD_WIDTH;
    app.state.cameraX -= screenDx / (app.state.zoom * W);
    app.state.settings.cameraFollow = false;
    world.clampCamera(app.state);
  };
  app.centerCamera = function () {
    app.state.cameraX = app.state.x;
    app.state.zoom = 1;
    app.state.settings.cameraFollow = true;
    world.clampCamera(app.state);
    ui.toast('Камера у Ники', 'good');
    ui.refresh(true);
  };
  app.moveZone = function (dir) {
    const next = world.moveToZone(app.state, dir);
    if (next) ui.toast('Иду в «' + next.name + '»');
    drain(); ui.refresh(true);
  };
  app.setSetting = function (key, value) {
    app.state.settings[key] = value;
    if (key === 'cameraFollow' && value) app.state.cameraX = app.state.x;
    ui.refresh(true);
  };
  app.psyAction = function (kind) {
    const s = app.state;
    if (kind === 'compliment') {
      world.psyEvent(s, 'compliment');
      world.say(s, 'Спасибо… я покраснела, но приятно.', 'nika');
      ui.toast('Комплимент принят', 'good');
    } else if (kind === 'reassure') {
      world.psyEvent(s, 'reassure');
      world.say(s, 'Ладно. Спасибо, что не торопишь — мне правда спокойнее.', 'nika');
      ui.toast('Ника успокоилась', 'good');
    } else if (kind === 'space') {
      s.settings.privacy = true;
      world.psyUpdate(s, { trust: 3, shyness: -2 });
      world.say(s, 'Спасибо. Я уйду за ширму, когда буду переодеваться.', 'nika');
      ui.toast('Приватность включена', 'good');
    }
    drain(); ui.refresh(true);
  };
  app.setLook = function (group, index) {
    app.state.look[group] = ((index % 20) + 20) % 20;
    ui.toast('Образ обновлён: ' + group, 'good');
    ui.refresh(true);
  };
  app.randomLook = function () {
    const keys = NIKA.assets.BODY_KEYS;
    keys.forEach(function (k) { app.state.look[k] = Math.floor(Math.random() * 20); });
    ui.toast('Новый образ из библиотеки ассетов', 'good');
    ui.refresh(true);
  };

  /* --- интернет-обучение (только по явному запросу игрока) ----------------- */
  app.setInternetOptIn = function (value) {
    const on = world.setInternetOptIn(value);
    app.state.settings.internetOptIn = on;
    ui.refresh(true);
    return on;
  };
  app.webLearn = async function (url) {
    const res = await world.webLearn(url);
    app.state.webStats = world.netInfo().last;
    ui.toast('Загружено с ' + res.host + ': +' + res.ai + ' фраз, +' + res.motor + ' движений, +' + res.skills + ' шагов', 'good');
    ui.refresh(true);
    return res;
  };
  app.learnPasted = function (text, source) {
    const res = world.learnPasted(text);
    app.state.webStats = world.netInfo().last;
    ui.toast('Дообучено локально: +' + res.ai + ' фраз, +' + res.motor + ' движений', 'good');
    ui.refresh(true);
    return res;
  };

  /* --- тело: тысячи точек, моторные программы, температура ----------------- */
  app.meshSetOffset = function (id, dx, dy) { return NIKA.mesh.setOffset(id, dx, dy); };
  app.meshClear = function () { NIKA.mesh.clearOffsets(); ui.refresh(true); };
  app.motorLearn = function (text) {
    const res = NIKA.mesh.learnFromText(text, 'текст игрока');
    ui.toast('Выучено движений: ' + res.added, res.added ? 'good' : 'bad');
    ui.refresh(true);
    return res;
  };
  app.setWarmth = function (value) {
    app.state.settings.warmth = Math.max(data.HEAT.min, Math.min(data.HEAT.max, Number(value) || 22));
    ui.refresh(true);
  };
  app.setUiSetting = function (key, value) {
    app.state.settings[key] = value;
    ui.applyUiSettings();
    ui.refresh(true);
  };
  app.toggleWatch = function () { return ui.toggleWatch(); };
  app.toggleChat = function () { return ui.toggleChat(); };
  app.showPoints = function (value) { app.setSetting('showPoints', !!value); };

  /* --- демо всех анимаций --------------------------------------------------- */
  function stopDemo() {
    if (app.demo && app.demo.timer) clearTimeout(app.demo.timer);
    app.demo = null;
    app.animator.clearTag('demo');
  }
  app.stopDemo = stopDemo;
  app.startDemo = function () {
    stopDemo();
    const all = anim.allClips();
    app.demo = { index: 0, timer: null };
    ui.setTab('animations');
    const step = function () {
      if (!app.demo) return;
      const entry = all[app.demo.index % all.length];
      const select = document.getElementById('part-select');
      if (select) { select.value = entry.part; select.dispatchEvent(new Event('change')); }
      app.animator.clearTag('demo');
      app.animator.play(entry.part, entry.clip.id, { tag: 'demo', weight: 1.05, replace: false });
      app.demo.index++;
      app.demo.timer = setTimeout(step, Math.max(700, entry.clip.duration * 1000 + 120));
    };
    step();
  };

  /* --- размер canvas: desktop, телефон, планшет, поворот экрана ------------- */
  function resize() {
    const vv = root.visualViewport;
    const w = Math.max(320, Math.round(vv ? vv.width : root.innerWidth));
    const h = Math.max(320, Math.round(vv ? vv.height : root.innerHeight));
    dpr = Math.min(2, root.devicePixelRatio || 1);
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
  }
  root.addEventListener('resize', resize);
  root.addEventListener('orientationchange', function () { setTimeout(resize, 120); });
  if (root.visualViewport) root.visualViewport.addEventListener('resize', resize);
  resize();

  /* --- единое управление: мышь, палец, колесо, клавиатура, геймпад --------- */
  const pointers = new Map();
  let pinchDistance = 0;
  function distance() {
    const p = Array.from(pointers.values());
    return p.length > 1 ? Math.hypot(p[0].x - p[1].x, p[0].y - p[1].y) : 0;
  }
  canvas.addEventListener('pointerdown', function (e) {
    if (canvas.setPointerCapture) { try { canvas.setPointerCapture(e.pointerId); } catch (err) { /* не все браузеры */ } }
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    pinchDistance = distance();
    e.preventDefault();
  });
  canvas.addEventListener('pointermove', function (e) {
    if (!pointers.has(e.pointerId)) return;
    const prev = pointers.get(e.pointerId);
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.size === 1) app.pan(e.clientX - prev.x);
    else if (pointers.size === 2) {
      const d = distance();
      if (pinchDistance > 0 && d > 0) app.setZoom(app.state.zoom * (d / pinchDistance));
      pinchDistance = d;
    }
    e.preventDefault();
  });
  function release(e) {
    pointers.delete(e.pointerId);
    pinchDistance = distance();
  }
  canvas.addEventListener('pointerup', release);
  canvas.addEventListener('pointercancel', release);
  canvas.addEventListener('dblclick', function () { app.centerCamera(); });
  canvas.addEventListener('wheel', function (e) {
    e.preventDefault();
    app.setZoom(app.state.zoom * (e.deltaY < 0 ? 1.11 : 0.90));
  }, { passive: false });
  document.addEventListener('keydown', function (e) {
    const tag = ((e.target && e.target.tagName) || '').toLowerCase();
    if (tag === 'input' || tag === 'textarea' || tag === 'select') return;
    const step = 0.055;
    if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A' || e.key === 'ф') {
      app.pan(70); app.state.settings.cameraFollow = false; e.preventDefault();
    } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D' || e.key === 'в') {
      app.pan(-70); app.state.settings.cameraFollow = false; e.preventDefault();
    } else if (e.key === 'ArrowUp' || e.key === '+') { app.setZoom(app.state.zoom + step * 2); e.preventDefault(); }
    else if (e.key === 'ArrowDown' || e.key === '-') { app.setZoom(app.state.zoom - step * 2); e.preventDefault(); }
    else if (e.key === '0') { app.centerCamera(); e.preventDefault(); }
  });
  let padLast = 0;
  function pollGamepad(now) {
    if (!app.state.settings.gamepad || !root.navigator || !root.navigator.getGamepads) return;
    if (now - padLast < 90) return;
    padLast = now;
    const pads = root.navigator.getGamepads();
    const pad = pads && Array.from(pads).find(function (p) { return p && p.connected; });
    if (!pad) return;
    const ax = pad.axes[0] || 0, ay = pad.axes[1] || 0;
    if (Math.abs(ax) > 0.25) { app.pan(-ax * 16); app.state.settings.cameraFollow = false; }
    if (Math.abs(ay) > 0.35) app.setZoom(app.state.zoom - ay * 0.035);
    if (pad.buttons[0] && pad.buttons[0].pressed) app.centerCamera();
    if (pad.buttons[4] && pad.buttons[4].pressed) app.moveZone(-1);
    if (pad.buttons[5] && pad.buttons[5].pressed) app.moveZone(1);
  }

  /* --- игровой цикл --------------------------------------------------------- */
  let last = performance.now(), lastSave = last, blinkTimer = 2.2;
  function frame(now) {
    const dt = Math.min(0.09, Math.max(0, (now - last) / 1000));
    last = now;
    if (!app.state.paused) {
      world.tick(app.state, dt);
      app.animator.tick(dt);
      blinkTimer -= dt;
      if (blinkTimer <= 0) {
        app.animator.play('eyes', 'blink', { weight: 0.95 });
        blinkTimer = 2.4 + Math.random() * 2.6;
      }
    }
    drain();
    pollGamepad(now);
    const pose = app.animator.pose(app.manual);
    rig.render(ctx, canvas, app.state, pose, dpr);
    ui.refresh();
    if (now - lastSave > 15000) { lastSave = now; save(true); }
    root.requestAnimationFrame(frame);
  }
  root.requestAnimationFrame(frame);

  /* приветствие */
  if (!app.state.commands) {
    ui.toast('Ника проснулась. Напиши ей команду!', 'good');
  }
})(typeof globalThis !== 'undefined' ? globalThis : this);
