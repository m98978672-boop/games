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
        case 'clearAction': app.animator.clearTag('action'); break;
        case 'say': ui.appendLog(e.entry); break;
        case 'toast': ui.toast(e.text, e.kind); break;
        case 'tab': ui.setTab(e.tab); break;
        case 'save': save(false); break;
        case 'reset': reset(); break;
        default: break;
      }
    });
  }

  /* --- публичные действия для UI -------------------------------------------- */
  app.command = async function (text) {
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
  app.setSpeed = function (n) { app.state.speed = n; ui.refresh(true); };
  app.setPaused = function (v) { app.state.paused = !!v; ui.refresh(true); };
  app.save = function () { save(false); };

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

  /* --- размер canvas -------------------------------------------------------- */
  function resize() {
    dpr = Math.min(2, root.devicePixelRatio || 1);
    const w = Math.max(320, root.innerWidth), h = Math.max(320, root.innerHeight);
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
  }
  root.addEventListener('resize', resize);
  resize();

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
