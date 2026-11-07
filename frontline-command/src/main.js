// Точка входа: загрузка конфигов и спрайтов, игровой цикл, ввод, экраны, сохранение.
import { loadConfig } from './core/config.js';
import { Game } from './sim/game.js';
import { Skills } from './sim/skills.js';
import { Renderer, SpriteBank } from './render/renderer.js';
import { HUD } from './ui/hud.js';
import { Menus } from './ui/menus.js';
import { Save } from './core/save.js';
import { Audio } from './core/audio.js';
import { Input } from './core/input.js';
import { clamp } from './core/mathx.js';

const canvas = document.getElementById('game');
const hudRoot = document.getElementById('hud');
const overlay = document.getElementById('overlay');

const boot = document.createElement('div');
boot.style.cssText = 'position:fixed;inset:0;display:flex;align-items:center;justify-content:center;background:#0d0f0b;color:#cfd6c6;font-family:Trebuchet MS,sans-serif;z-index:50;letter-spacing:0.08em';
boot.textContent = 'Загрузка фронта…';
document.body.appendChild(boot);

const cfg = await loadConfig();
const bank = await new SpriteBank('assets/').loadAll();
Save.loadSettings();
Save.loadMeta();

const audio = new Audio(cfg, Save.settings);
const input = new Input(canvas, bindingsFor('commander'));

let game = null;
let renderer = null;
let hud = null;
let menus = null;
let last = performance.now();
let acc = 0;
let autosaveTimer = 0;
let hintIndex = 0;
let hintTimer = 10;
let buildType = null;
let dragRect = null;
let wasLeft = false;

const state = {
  difficulty: 'regular',
  seed: Math.floor(Math.random() * 100000),
  screen: 'menu',
};


let menusReady = false;

function bindingsFor(mode) {
  return mode === 'soldier'
    ? { ...cfg.input.both, ...cfg.input.commander, ...cfg.input.soldier }
    : { ...cfg.input.both, ...cfg.input.commander };
}

// ---------- создание игры ----------
function newGame({ mode = 'soldier', aiVsAi = false, difficulty = state.difficulty, seed = state.seed, loadSave = false } = {}) {
  const saved = loadSave ? Save.loadWar() : null;
  game = new Game({
    cfg,
    seed: saved ? saved.seed : seed,
    difficulty: saved ? saved.difficultyId : difficulty,
    meta: Save.meta,
    settings: Save.settings,
    aiVsAi,
    mode,
  });
  if (saved && !saved.aiVsAi) {
    try {
      Save.applyWar(game, saved);
      game.alertLog.push({ kind: 'order', text: 'Война восстановлена из сохранения', t: game.time });
    } catch (e) {
      console.warn('не удалось применить сохранение', e);
    }
  }
  if (aiVsAi) {
    game.mode = 'commander';
    game.camera.zoom = 0.36;
    game.camera.x = game.world.W / 2;
    game.camera.y = game.world.H / 2;
  } else {
    game.mode = mode;
  }

  overlay.className = '';
  overlay.innerHTML = '';
  renderer = new Renderer(canvas, game, bank);
  renderer.camera.x = game.camera.x;
  renderer.camera.y = game.camera.y;
  renderer.camera.zoom = aiVsAi ? 0.32 : mode === 'soldier' ? 1.15 : 0.72;
  renderer.fogEnabled = !aiVsAi;
  hud = new HUD(hudRoot, game, bank);
  menus = new Menus(overlay, game);
  hud.renderMinimap = () => renderer.drawMinimap(hud.el.minimap, game);
  hudRoot.classList.remove('hidden');
  bindHud();
  bindMenus();
  bindGameEvents();
  applySettings(Save.settings);
  input.bindings = bindingsFor(game.mode);
  state.screen = 'game';
  missionMs = 0;
  hintIndex = 0;
  hintTimer = 3;
  buildType = null;
  dragRect = null;
  hud.showHint(game.mode === 'soldier'
    ? 'Вы — солдат. WASD — движение, мышь — прицел, ЛКМ — огонь, Tab — командование.'
    : 'Вы — командир. ЛКМ — выделение отрядов, ПКМ — приказ, B — стройка, T — директива.', 9);
  audio.music('combat');
  return game;
}

let missionMs = 0;

function bindGameEvents() {
  game.events.on('warOver', () => {
    setTimeout(() => {
      if (state.screen !== 'game' && state.screen !== 'death') return;
      const f = game.playerFaction ?? 0;
      const won = game.outcome && game.outcome.winner === f;
      if (game.playerFaction != null) {
        game.awardXP(f, 'command', won ? 'warWin' : 'warLoss', won ? 30 : 10);
        Save.saveMeta(game.skills.serialize());
      }
      state.screen = 'result';
      menus.result(game);
      audio.stopMusic();
      Save.clearWar();
    }, 800);
  });
  game.events.on('playerDied', () => {
    if (state.screen !== 'game') return;
    state.screen = 'death';
    menus.death(game);
    audio.play('alert_loss');
  });
  game.events.on('orderRefused', ({ entry }) => {
    if (game.playerFaction != null && entry.faction === game.playerFaction) hud.toast(`Отказ: ${entry.reason}`, 'bad');
  });
  game.events.on('pointCaptured', ({ faction, point }) => {
    if (game.playerFaction != null && faction === game.playerFaction) hud.toast(`Захвачено: ${point.name}`, 'good');
  });
  game.events.on('unitKilled', ({ unit }) => {
    if (unit === game.playerUnit) return;
  });
}

// ---------- HUD ----------
function bindHud() {
  hud.on({
    onOrder: (type) => orderAtMouse(type),
    onSelectSquad: (id, additive) => {
      if (!additive) game.selectedSquads.clear();
      if (game.selectedSquads.has(id)) game.selectedSquads.delete(id);
      else game.selectedSquads.add(id);
    },
    onSpeed: (v) => {
      if (v === 0) game.paused = !game.paused;
      else { game.paused = false; game.speed = v; }
    },
    onMenu: () => openPause(),
    onMode: () => switchMode(),
    onCreateSquad: () => createSquad(),
    onDirective: (data) => issueDirective(data),
    onAutopilotToggle: (area, on) => {
      game.api.issue({ source: 'player', type: 'set_autopilot', faction: game.playerFaction, params: { area, on }, reason: 'настройка автопилота' });
      hud.toast(`Автопилот «${cfg.autopilot.areas.find((a) => a.id === area)?.name || area}»: ${on ? 'вкл' : 'выкл'}`, 'good');
    },
    onBuildMode: (type) => { buildType = type; canvas.classList.toggle('build-mode', !!type); },
    onMinimapClick: (x, y) => { renderer.camera.x = x; renderer.camera.y = y; },
  });
}

// ---------- экраны ----------
function bindMenus() {
  menusReady = true;
  menus.on({
    onMenuAction: (act, opts) => onMenuAction(act, opts),
    onBuySkill: (id) => {
      const res = game ? game.skills.buy(id) : { ok: false, reason: 'война не идёт' };
      hud?.toast(res.ok ? `Изучено: ${res.node.name}` : res.reason, res.ok ? 'good' : 'bad');
      if (res.ok) { Save.saveMeta(game.skills.serialize()); menus.skills(game); }
      return res;
    },
    onSettings: (partial) => { Save.saveSettings(partial); applySettings(Save.settings); if (game) game.settings = Save.settings; },
    onClose: () => (game && state.screen !== 'menu' ? openPause() : showMainMenu()),
    onResetMeta: () => {
      Save.resetMeta();
      if (game) game.skills = new Skills(cfg, Save.meta);
      hud?.toast('Прогресс навыков сброшен', 'good');
    },
  });
}

function onMenuAction(act, opts = {}) {
  audio.unlock();
  audio.play('ui_click');
  switch (act) {
    case 'new-soldier':
    case 'new-commander':
      state.seed = opts.seed || state.seed;
      state.difficulty = opts.difficulty || state.difficulty;
      Save.clearWar();
      newGame({ mode: act === 'new-soldier' ? 'soldier' : 'commander', difficulty: state.difficulty, seed: state.seed });
      break;
    case 'continue': newGame({ mode: 'soldier', loadSave: true }); break;
    case 'ai-vs-ai': newGame({ mode: 'commander', aiVsAi: true, seed: opts.seed || state.seed }); break;
    case 'skills':
      if (game) { state.screen = 'skills'; menus.skills(game); } else showSkillsFromMeta();
      break;
    case 'settings':
      state.screen = 'settings';
      menus.settings(Save.settings, menus.handlers);
      break;
    case 'help': state.screen = 'help'; menus.help(); break;
    case 'resume': state.screen = 'game'; menus.hide(); game.paused = false; break;
    case 'save': Save.saveWar(game); hud.toast('Война сохранена', 'good'); state.screen = 'game'; menus.hide(); game.paused = false; break;
    case 'back': if (game && state.screen !== 'menu') openPause(); else showMainMenu(); break;
    case 'menu': if (game && game.playerFaction != null && !game.warOver) Save.saveWar(game); showMainMenu(); break;
    case 'restart': Save.clearWar(); newGame({ mode: game?.mode || 'soldier', difficulty: state.difficulty, seed: Math.floor(Math.random() * 100000) }); break;
    case 'next-war': Save.clearWar(); newGame({ mode: 'soldier', difficulty: state.difficulty, seed: Math.floor(Math.random() * 100000) }); break;
    case 'respawn': respawnPlayer(); break;
    case 'commander': game.mode = 'commander'; game.playerUnit = null; state.screen = 'game'; menus.hide(); game.paused = false; input.bindings = bindingsFor('commander'); break;
    default: break;
  }
}

function showSkillsFromMeta() {
  const stub = {
    cfg,
    skills: {
      isLearned: (id) => Save.meta.learned.includes(id),
      requiresMet: (id) => {
        const n = cfg.skills.nodes.find((x) => x.id === id);
        return !n || (n.requires || []).every((r) => Save.meta.learned.includes(r));
      },
      xp: Save.meta.xp,
      spent: Save.meta.spent,
      learned: new Set(Save.meta.learned),
      buy: (id) => {
        const n = cfg.skills.nodes.find((x) => x.id === id);
        if (!n) return { ok: false, reason: 'нет навыка' };
        if (Save.meta.learned.includes(id)) return { ok: false, reason: 'уже изучен' };
        if (!(n.requires || []).every((r) => Save.meta.learned.includes(r))) return { ok: false, reason: 'не открыт' };
        if (Save.meta.xp < n.cost) return { ok: false, reason: `нужно ${n.cost} XP` };
        Save.meta.xp -= n.cost;
        Save.meta.spent += n.cost;
        Save.meta.learned.push(id);
        Save.saveMeta(Save.meta);
        return { ok: true, node: n };
      },
    },
  };
  stub.skills.serialize = () => Save.meta;
  state.screen = 'skills';
  menus.skills(stub);
}

function showMainMenu() {
  state.screen = 'menu';
  hudRoot.classList.add('hidden');
  if (!menusReady) { menus = new Menus(overlay, { cfg }); bindMenus(); }
  menus.hide();
  menus.main({ hasSave: Save.hasWar(), seed: state.seed, difficulty: state.difficulty, mode: 'soldier', meta: Save.meta });
  audio.stopMusic();
}

function openPause() {
  if (!game || state.screen === 'result') return;
  state.screen = 'pause';
  game.paused = true;
  menus.pause(game);
}

function applySettings(s) {
  if (!s) return;
  document.documentElement.style.setProperty('font-size', `${14 * (s.uiScale || 1)}px`);
  document.body.classList.toggle('colorblind', !!s.colorblind);
  audio.setVolumes({ volume: s.volume, music: s.music });
}

// ---------- приказы ----------
function orderAtMouse(type) {
  if (game.playerFaction == null) { hud.toast('В режиме ИИ против ИИ приказы недоступны', 'bad'); return; }
  if (!game.selectedSquads.size) { hud.toast('Сначала выделите отряд', 'bad'); return; }
  const world = renderer.screenToWorld(input.mouse.x, input.mouse.y);
  if (type === 'supply') {
    const res = game.issuePlayerOrder('resupply', { x: world.x, y: world.y });
    hud.toast(res.ok ? 'Отряд идёт за снабжением' : res.reason, res.ok ? 'good' : 'bad');
    return;
  }
  const ctx = game.contextOrderAt(world.x, world.y);
  if (!ctx.ok) { hud.toast(ctx.reason, 'bad'); return; }
  const finalType = type === 'hold' ? 'hold' : type === 'attack' ? 'attack' : ctx.type;
  const res = game.issuePlayerOrder(finalType, ctx.target, { params: ctx.params || {} });
  if (res.ok) hud.showHint(`${ctx.hint || 'Приказ'} — задержка ${res.order.delay.toFixed(1)} с`, 3.5);
}

function issueDirective({ goal, strategy, behavior, after }) {
  if (game.playerFaction == null) return;
  if (!game.selectedSquads.size) { hud.toast('Выберите отряд для директивы', 'bad'); return; }
  let target;
  if (goal.startsWith('sector:')) {
    const sector = game.world.sectorById(Number(goal.split(':')[1]));
    if (!sector) return;
    target = { x: sector.cx, y: sector.cy, sectorId: sector.id };
  } else {
    const p = game.world.pointById(goal);
    if (!p) return;
    target = { x: p.x, y: p.y, pointId: p.id };
  }
  const type = behavior === 'hold' ? 'hold' : 'directive';
  const res = game.issuePlayerOrder(type, target, {
    params: { goalType: behavior === 'hold' ? 'hold' : 'capture', strategy, after, behavior },
  });
  if (res.ok) hud.showHint(`Директива: ${cfg.strategies[strategy]?.name || strategy}, после — ${after}`, 4);
  else hud.toast(res.reason, 'bad');
}

function createSquad() {
  if (game.playerFaction == null) return;
  const ids = [...game.selectedUnits].filter((id) => {
    const u = game.unitById(id);
    return u && u.alive && !u.squadId && !u.isVehicle;
  });
  if (ids.length >= 2) {
    const res = game.createSquadFromUnits(ids);
    hud.toast(res.ok ? `Отряд ${res.squad.name} создан` : res.reason, res.ok ? 'good' : 'bad');
    if (res.ok) game.selectedSquads.add(res.squad.id);
    return;
  }
  const order = game.api.issue({ source: 'player', type: 'create_squad', faction: game.playerFaction, target: { x: 0, y: 0 }, params: { templateId: 'assault' }, reason: 'заказ отряда на базе' });
  hud.toast(`Заказ отряда на базе: доставка ${order.delay.toFixed(1)} с`, 'good');
}

function switchMode() {
  if (!game || game.aiVsAi) return;
  if (game.mode === 'soldier') {
    game.mode = 'commander';
    renderer.camera.zoom = 0.72;
    hud.showHint('Командир: ЛКМ — выделение, ПКМ — приказ, B — стройка, T — директива', 6);
  } else {
    game.mode = 'soldier';
    if (!game.playerUnit || !game.playerUnit.alive) respawnPlayer();
    if (game.playerUnit) { renderer.camera.x = game.playerUnit.x; renderer.camera.y = game.playerUnit.y; }
    renderer.camera.zoom = 1.15;
    hud.showHint('Солдат: WASD — движение, мышь — прицел, ЛКМ — огонь, R — перезарядка', 6);
  }
  input.bindings = bindingsFor(game.mode);
}

function respawnPlayer() {
  const hq = game.world.hqOf(game.playerFaction);
  if (!hq) return;
  game.spawnPlayerAt(hq, game.playerRole, game.playerWeapon);
  if (game.playerUnit) { renderer.camera.x = game.playerUnit.x; renderer.camera.y = game.playerUnit.y; }
  state.screen = 'game';
  menus.hide();
  game.paused = false;
}

// ---------- ввод ----------
function handleInput(dt) {
  if (!game) return;
  const m = input.mouse;
  const world = renderer.screenToWorld(m.x, m.y);

  if (input.keyHit('Escape') && state.screen === 'game') {
    if (buildType) { hud.setBuildMode(null); buildType = null; }
    else if (hud.closePanels()) { /* панель закрыта */ }
    else openPause();
    return;
  }
  if (state.screen !== 'game') return;

  if (input.hit('pause')) game.paused = !game.paused;
  if (input.keyHit('F3')) renderer.showDebug = !renderer.showDebug;
  if (input.keyHit('Tab')) switchMode();
  if (input.keyHit('KeyT')) hud.toggleDirective();
  if (input.keyHit('KeyP')) hud.toggleAutopilot();
  if (input.keyHit('KeyB')) hud.toggleBuildMenu();
  if (input.hit('speedUp')) { game.paused = false; game.speed = Math.min(4, game.speed * 2); }
  if (input.hit('speedDown')) game.speed = Math.max(1, game.speed / 2);

  if (game.mode === 'soldier' && game.playerUnit && game.playerUnit.alive) {
    const u = game.playerUnit;
    const mx = (input.down('moveRight') ? 1 : 0) - (input.down('moveLeft') ? 1 : 0);
    const my = (input.down('moveDown') ? 1 : 0) - (input.down('moveUp') ? 1 : 0);
    const len = Math.hypot(mx, my) || 1;
    u.input.mx = mx / len;
    u.input.my = my / len;
    u.input.aim = Math.atan2(world.y - u.y, world.x - u.x);
    u.input.fire = m.left;
    u.input.reload = input.hit('reload');
    u.input.interact = input.hit('interact');
    renderer.camera.x += (u.x - renderer.camera.x) * Math.min(1, dt * 6);
    renderer.camera.y += (u.y - renderer.camera.y) * Math.min(1, dt * 6);
    renderer.camera.zoom += (1.15 - renderer.camera.zoom) * Math.min(1, dt * 4);
    if (u.downed) hud.showHint('Вы ранены: медик рядом поднимет, иначе смерть через несколько секунд.', 3);
    return;
  }

  // ---------- камера командира ----------
  const pan = 900 / renderer.camera.zoom;
  if (input.down('moveLeft') || input.key('ArrowLeft')) renderer.camera.x -= pan * dt;
  if (input.down('moveRight') || input.key('ArrowRight')) renderer.camera.x += pan * dt;
  if (input.down('moveUp') || input.key('ArrowUp')) renderer.camera.y -= pan * dt;
  if (input.down('moveDown') || input.key('ArrowDown')) renderer.camera.y += pan * dt;
  if (m.middle) {
    renderer.camera.x -= (m.x - (input.lastX ?? m.x)) / renderer.camera.zoom;
    renderer.camera.y -= (m.y - (input.lastY ?? m.y)) / renderer.camera.zoom;
  }
  if (m.wheel) renderer.camera.zoom = clamp(renderer.camera.zoom * (m.wheel > 0 ? 0.88 : 1.14), 0.28, 1.8);
  renderer.camera.x = clamp(renderer.camera.x, 0, game.world.W);
  renderer.camera.y = clamp(renderer.camera.y, 0, game.world.H);

  // выделение рамкой: ЛКМ тянем — рамка, отпускаем — выбор
  if (m.left) {
    if (!wasLeft) dragRect = { x0: m.x, y0: m.y, x1: m.x, y1: m.y };
    if (dragRect) { dragRect.x1 = m.x; dragRect.y1 = m.y; }
    wasLeft = true;
  } else if (wasLeft) {
    wasLeft = false;
    if (dragRect) finishSelection(dragRect);
    dragRect = null;
  }
  renderer.drag = dragRect;

  if (input.pressed.has('MouseRight')) {
    if (buildType) { hud.setBuildMode(null); buildType = null; }
    else {
      const ctx = game.contextOrderAt(world.x, world.y);
      if (ctx.ok) {
        const res = game.issuePlayerOrder(ctx.type, ctx.target, { params: ctx.params || {} });
        if (res.ok) hud.showHint(`${ctx.hint} · задержка ${res.order.delay.toFixed(1)} с`, 3);
        else hud.toast(res.reason, 'bad');
      } else hud.toast(ctx.reason, 'bad');
    }
  }

  if (buildType) {
    const check = game.build.canPlace(buildType, world.x, world.y, game.playerFaction);
    game.buildPreview = { type: buildType, x: world.x, y: world.y, ok: check.ok };
    if (input.pressed.has('MouseLeft')) placeBuilding(world.x, world.y);
  } else {
    game.buildPreview = null;
  }
  input.lastX = m.x;
  input.lastY = m.y;
}

function finishSelection(rect) {
  const a = renderer.screenToWorld(rect.x0, rect.y0);
  const b = renderer.screenToWorld(rect.x1, rect.y1);
  const x0 = Math.min(a.x, b.x), x1 = Math.max(a.x, b.x);
  const y0 = Math.min(a.y, b.y), y1 = Math.max(a.y, b.y);
  const additive = input.key('ShiftLeft');
  if (Math.abs(rect.x1 - rect.x0) > 6 || Math.abs(rect.y1 - rect.y0) > 6) {
    if (!additive) game.selectedSquads.clear();
    for (const sq of game.squads.values()) {
      if (sq.faction !== game.playerFaction || sq.state === 'destroyed') continue;
      const c = sq.centroid();
      if (c.x >= x0 && c.x <= x1 && c.y >= y0 && c.y <= y1) game.selectedSquads.add(sq.id);
    }
    if (game.selectedSquads.size) hud.showHint(`Выбрано отрядов: ${game.selectedSquads.size}`, 2.5);
  } else {
    const unit = game.unitsNear((a.x + b.x) / 2, (a.y + b.y) / 2, 30)
      .find((u) => u.alive && u.faction === game.playerFaction);
    if (!additive) { game.selectedSquads.clear(); game.selectedUnits.clear(); }
    if (unit) {
      game.selectedUnits.add(unit.id);
      if (unit.squadId != null) game.selectedSquads.add(unit.squadId);
    }
  }
}

function placeBuilding(x, y) {
  if (game.playerFaction == null) return;
  const order = game.api.issue({
    source: 'player', type: 'place_build', faction: game.playerFaction,
    target: { x, y }, params: { buildType }, reason: 'постройка по приказу игрока',
  });
  hud.toast(`Чертёж: ${cfg.building(buildType).name} · задержка ${order.delay.toFixed(1)} с`, 'good');
}

// ---------- цикл ----------
function loop(now) {
  const dtReal = Math.min(0.05, (now - last) / 1000);
  last = now;
  if (game && renderer) {
    handleInput(dtReal);
    if (state.screen === 'game' || state.screen === 'death') {
      if (!game.paused) {
        acc = Math.min(acc + dtReal, 0.2);
        const step = 1 / 60;
        let guard = 0;
        while (acc >= step && guard++ < 16) {
          game.step(step);
          acc -= step;
        }
      }
      for (const s of game.drainSounds()) audio.play(s.name, s.x, s.y);
      audio.listener.x = renderer.camera.x;
      audio.listener.y = renderer.camera.y;
      renderer.draw(dtReal);
      hud.update(dtReal);
      autosaveTimer += dtReal;
      if (autosaveTimer > 30 && Save.settings.autosave && game.playerFaction != null && !game.warOver && state.screen === 'game') {
        autosaveTimer = 0;
        Save.saveWar(game);
      }
      hintTimer -= dtReal;
      if (hintTimer <= 0 && Save.settings.showHints && state.screen === 'game') {
        const hints = cfg.hints?.hints || [];
        if (hints.length) {
          const h = hints[hintIndex % hints.length];
          hintIndex++;
          hud.showHint(h.text, h.seconds || 8);
          hintTimer = Math.max(22, (h.seconds || 8) + 12);
        }
      }
    } else {
      renderer.draw(dtReal);
    }
  }
  input.endFrame();
  requestAnimationFrame(loop);
}

// Отладочный доступ из консоли (не влияет на игру)
window.__frontline = {
  get game() { return game; },
  get renderer() { return renderer; },
  get hud() { return hud; },
  cfg,
  state,
  newGame,
};

// первый жест разблокирует звук (политика браузеров)
window.addEventListener('pointerdown', () => audio.unlock(), { once: true });

boot.remove();
showMainMenu();
requestAnimationFrame(loop);
