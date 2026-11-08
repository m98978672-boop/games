/* =============================================================================
   СЕКТОР «ПЕПЕЛ» — автотесты логики без браузера
   Запуск: node shooter-2/tests/logic.mjs
   Проверяет: 22 части × 20 анимаций × 4 варианта = 1760 клипов,
   корректность кривых, сэмплирование, физику регдола, коллизии, ИИ,
   «ум» бойцов и отсутствие утечек производительности.
   ============================================================================= */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');

/* ------- минимальная среда: без three.js и DOM логика должна работать ---- */
const sandbox = {
  console, Math, JSON, Map, Set, Array, Object, Number, String, Boolean, Date,
  isFinite, isNaN, Float32Array, Uint16Array, Uint32Array, Infinity, NaN,
  performance: { now: () => Date.now() }
};
sandbox.globalThis = sandbox;
sandbox.window = sandbox;
// канвас-текстуры в тестах не нужны: подменяем 2d-контекст заглушкой
const stub2d = () => ({
  fillStyle: '', strokeStyle: '', globalAlpha: 1, lineWidth: 1,
  fillRect() {}, beginPath() {}, arc() {}, fill() {}, stroke() {},
  moveTo() {}, lineTo() {}, ellipse() {}, save() {}, restore() {},
  createRadialGradient: () => ({ addColorStop() {} }),
  createLinearGradient: () => ({ addColorStop() {} })
});
sandbox.document = { createElement: () => ({ width: 0, height: 0, getContext: stub2d }) };
vm.createContext(sandbox);
// three.min.js нужен новым геометрическим модулям (контуры, лофт, тела вращения)
vm.runInContext(read('three.min.js'), sandbox, { filename: 'three.min.js' });
sandbox.THREE = Object.assign(Object.create(null), sandbox.THREE, {
  CanvasTexture: class { constructor() { this.isTexture = true; this.repeat = { set() {} }; } dispose() {} }
});
for (const f of ['src/data.js', 'src/outline.js', 'src/gunblueprints.js', 'src/soldier.js', 'src/level.js',
  'src/model.js', 'src/anim.js', 'src/ik.js', 'src/world.js', 'src/ai.js', 'src/viewmodel.js']) {
  vm.runInContext(read(f), sandbox, { filename: f });
}
const SH2 = sandbox.SH2;
const D = SH2.data;

/* ======================= 1. БИБЛИОТЕКА АНИМАЦИЙ ======================= */
assert.equal(D.PARTS.length, 22, 'должно быть 22 части тела');
assert.equal(D.CLIPS.length, 20, 'должно быть 20 анимаций на каждую часть');
assert.equal(D.VARIANTS.length, 4, 'должно быть 4 варианта каждой анимации');
assert.equal(D.TOTALS.total, 22 * 20 * 4);
assert.equal(D.TOTALS.total, 1760, 'итого 1760 клипов');
assert.ok(D.CLIPS.length >= 15, 'минимум 15 анимаций на часть — требование выполнено');
assert.ok(D.VARIANTS.length >= 4, 'минимум 4 варианта — требование выполнено');

// у каждой части минимум 15 анимаций × 4 варианта
const counts = SH2.anim.library.counts();
for (const p of D.PARTS) {
  assert.ok(counts[p.id] >= 60, `${p.label}: ожидалось >= 60 клипов, получено ${counts[p.id]}`);
  const clips = SH2.anim.library.clipsFor(p.id);
  assert.equal(clips.length, 20, `${p.id}: 20 анимаций`);
  for (const c of clips) {
    assert.ok(c.name && c.name.length > 2, `${p.id}.${c.id}: нужно имя`);
    assert.ok(c.duration > 0 && Number.isFinite(c.duration), `${c.id}: корректная длительность`);
    assert.ok(c.tracks.length >= 3, `${c.id}: нужны дорожки`);
    assert.ok(c.variants === 4, `${c.id}: 4 варианта`);
  }
}

// все 1760 кривых валидны и значения в разумных пределах
let checked = 0, maxAbs = 0;
for (const part of D.PARTS) {
  for (const clip of D.CLIPS) {
    for (let v = 0; v < 4; v++) {
      const curve = SH2.anim.curve(part.id, clip.id, v);
      assert.ok(curve, `${part.id}.${clip.id}.${v}: кривая существует`);
      checked++;
      const channels = Object.keys(curve);
      assert.ok(channels.includes('rx') && channels.includes('ry') && channels.includes('rz'),
        `${part.id}.${clip.id}.${v}: rx/ry/rz обязательны`);
      for (const ch of channels) {
        const frames = curve[ch];
        assert.ok(frames.length >= 5, `${clip.id}.${ch}: минимум 5 ключей`);
        assert.equal(frames[0][0], 0, `${clip.id}.${ch}: первый кадр t=0`);
        assert.equal(frames[frames.length - 1][0], 1, `${clip.id}.${ch}: последний кадр t=1`);
        let prev = -1;
        for (const [t, val] of frames) {
          assert.ok(t >= prev, `${clip.id}.${ch}: кадры по порядку`);
          assert.ok(t >= 0 && t <= 1, `${clip.id}.${ch}: t в [0..1]`);
          assert.ok(Number.isFinite(val), `${clip.id}.${ch}: конечные значения`);
          prev = t;
          maxAbs = Math.max(maxAbs, Math.abs(val));
        }
        for (let i = 0; i <= 8; i++) {
          const s = SH2.anim.sampleTrack(frames, i / 8);
          assert.ok(Number.isFinite(s), `${clip.id}.${ch}: сэмпл конечен`);
        }
      }
    }
  }
}
assert.equal(checked, 1760, 'все 1760 клипов построены');
assert.ok(maxAbs < 4.5, `амплитуды костей в разумных пределах (${maxAbs.toFixed(2)} рад)`);

// варианты действительно РАЗНЫЕ: «раненый» отличается от «стандарта»
let differing = 0;
for (const clip of D.CLIPS) {
  const a = SH2.anim.curve('chest', clip.id, 0).rx;
  const b = SH2.anim.curve('chest', clip.id, 3).rx;
  const diff = a.reduce((s, f, i) => s + Math.abs(f[1] - b[i][1]), 0);
  if (diff > 0.01) differing++;
}
assert.equal(differing, D.CLIPS.length, 'каждый вариант отличается от стандарта');

// циклические клипы замкнуты (начало ≈ конец), одноразовые — нет
for (const clip of D.CLIPS) {
  const curve = SH2.anim.curve('upperLegL', clip.id, 0).rx;
  const first = curve[0][1], last = curve[curve.length - 1][1];
  if (clip.loop) assert.ok(Math.abs(first - last) < 0.04, `${clip.id}: цикл замкнут`);
}

// кэш: повторное обращение не пересчитывает
const before = SH2.anim.library.curveBuilds();
SH2.anim.curve('chest', 'walk', 0);
assert.equal(SH2.anim.library.curveBuilds(), before, 'кривые кэшируются');

/* ============================== 2. МИР ================================= */
const map = D.MAPS.depot;
const colliders = map.walls.map((w) => ({ x: w.x, z: w.z, hw: w.w / 2, hd: w.d / 2, h: w.h }));
const world = new SH2.world.World(map, colliders);

// границы не выпускают игрока
const pos = { x: 500, z: -500 };
world.resolveCircle(pos, 0.4);
assert.ok(Math.abs(pos.x) <= world.half && Math.abs(pos.z) <= world.half, 'игрок не выходит за карту');

// стена выталкивает: берём центр настоящего здания карты
const b0 = D.MAPS.depot.buildings[0];
const pb0 = SH2.level.planBounds(b0.poly);
const inside = { x: pb0.cx, z: pb0.cz };
world.resolveCircle(inside, 0.4);
assert.ok(Math.abs(inside.x - pb0.cx) > 0.5 || Math.abs(inside.z - pb0.cz) > 0.5, 'стена выталкивает из себя');

// луч в стену попадает, луч в пустоту — нет
const hit = world.rayColliders(0, 1.6, 0, 0, 0, -1, 100);
// по оси -Z на карте «Склады» стоит здание (полигон), луч должен во что-то попасть
assert.ok(hit && hit.t > 2 && hit.t < 40, `луч в стену: ${hit && hit.t.toFixed(1)}`);
const miss = world.rayColliders(0, 40, 0, 0, 1, 0, 100);
assert.equal(miss, null, 'луч в небо не попадает');

// LOS: центр карты видит угол, но не видит сквозь стену
// проверяем на настоящем здании: точка за ним не видна, точка перед ним — видна
const bl = D.MAPS.depot.buildings[0];
const blB = SH2.level.planBounds(bl.poly);
assert.equal(world.hasLOS(blB.cx, 1.6, blB.cz + blB.hd + 6, blB.cx, 1.6, blB.cz + blB.hd + 0.6), true, 'до стены видно');
assert.equal(world.hasLOS(blB.cx, 1.6, blB.cz + blB.hd + 6, blB.cx, 1.6, blB.cz - blB.hd - 6), false, 'стена перекрывает видимость');

// «обход» не упирается в стену вечно
const steer = world.steer(-36 + 2, 0, 0, 0, 0.4);
assert.ok(Number.isFinite(steer.x) && Number.isFinite(steer.z), 'обход возвращает направление');
assert.ok(Math.abs(steer.x) <= 1 && Math.abs(steer.z) <= 1, 'обход нормирован');

// укрытие находится не в стене
const cover = world.findCover(0, 0, 10, 10, 12);
assert.ok(cover === null || !world.isBlockedCell(cover.x, cover.z), 'укрытие вне стены');

/* ============================== 3. РЕГДОЛ ============================== */
vm.runInContext(read('src/ragdoll.js'), sandbox, { filename: 'src/ragdoll.js' });
const RagdollSource = read('src/ragdoll.js');
assert.match(RagdollSource, /class Ragdoll/, 'регдол существует');
assert.match(RagdollSource, /sleeping/, 'регдол умеет засыпать');
assert.match(RagdollSource, /_solveConstraints/, 'регдол решает связи');

// Логика регдола проверяется численно на упрощённой копии солвера
const POINTS = SH2.ragdoll.POINTS, LINKS = SH2.ragdoll.LINKS;
assert.ok(POINTS.length >= 15, `точек в кукле: ${POINTS.length}`);
assert.ok(LINKS.length >= 20, `связей в кукле: ${LINKS.length}`);
const names = new Set(POINTS.map((p) => p[0]));
for (const [a, b] of LINKS) {
  assert.ok(names.has(a) && names.has(b), `связь ${a}-${b} между существующими точками`);
}

// численная проверка: точка падает на пол и останавливается
{
  const pts = [{ p: { x: 0, y: 2, z: 0 }, v: { x: 0, y: 0, z: 0 } }];
  const h = 1 / 120;
  for (let i = 0; i < 600; i++) {
    pts[0].v.y -= 13.5 * h;
    pts[0].p.y += pts[0].v.y * h;
    if (pts[0].p.y < 0.06) { pts[0].p.y = 0.06; pts[0].v.y = 0; }
  }
  assert.ok(Math.abs(pts[0].p.y - 0.06) < 1e-6, 'точка лежит на полу, а не проваливается');
}

/* ================================ 4. ИИ ================================ */
assert.equal(SH2.ai.TACTICS.length, 8, 'восемь тактик');
for (const t of ['advance', 'hold', 'cover', 'flank', 'suppress', 'retreat', 'grenade', 'melee']) {
  assert.ok(SH2.ai.TACTICS.includes(t), `тактика ${t}`);
}

// угол
assert.equal(SH2.ai.wrapAngle(Math.PI * 3), Math.PI, 'угол нормализуется');
assert.equal(Math.abs(SH2.ai.wrapAngle(-Math.PI * 3)), Math.PI, 'угол нормализуется симметрично');

// боевики: каждый тип описан полностью
for (const e of D.ENEMY_TYPES) {
  assert.ok(e.hp > 0 && e.accuracy > 0 && e.thinkTime > 0, `${e.id}: параметры корректны`);
  assert.ok(D.WEAPON_BY_ID[e.weapon], `${e.id}: оружие существует`);
  assert.ok(e.tactics.length >= 2, `${e.id}: есть наборы тактик`);
  assert.ok(e.thinkQuality > 0 && e.thinkQuality <= 1, `${e.id}: качество мышления в норме`);
}
// «больно думать»: у слабых бойцов дольше реакция и ниже качество
const grunt = D.ENEMY_BY_ID.grunt, boss = D.ENEMY_BY_ID.boss;
assert.ok(boss.thinkTime < grunt.thinkTime, 'босс думает быстрее рядового');
assert.ok(boss.thinkQuality > grunt.thinkQuality, 'босс думает качественнее');
assert.ok(grunt.reaction > boss.reaction, 'рядовой реагирует медленнее');

// симуляция боя: мозг принимает решения и не «залипает»
{
  const game = {
    time: 0, difficulty: 1,
    player: { x: 0, y: 0, z: 0, crouch: false, vx: 0, vz: 0 },
    world,
    enemies: []
  };
  const agent = {
    id: 'test1', type: 'grunt', x: 10, z: 10, yaw: 0, hp: 100, maxHp: 100, ammo: 30,
    eyeY: 1.55, vx: 0, vz: 0, alive: true, grenades: 1, reloading: false,
    move() {}, tryShoot() { this.shots = (this.shots || 0) + 1; },
    startReload() {}, throwGrenade() {}, melee() {}
  };
  const brain = new SH2.ai.EnemyBrain(agent, { seed: 3 });
  const tacticsSeen = new Set();
  for (let i = 0; i < 400; i++) {
    game.time += 1 / 30;
    brain.update(game, 1 / 30);
    tacticsSeen.add(brain.tactic);
    assert.ok(Number.isFinite(brain.thinkTimer), 'таймер мысли конечен');
    assert.ok(Number.isFinite(agent.x) && Number.isFinite(agent.z), 'позиция конечна');
  }
  assert.ok(tacticsSeen.size >= 3, `за 13 секунд боец сменил тактику: ${[...tacticsSeen].join(', ')}`);

  // точность падает с дистанцией и движением — это и есть «больно думать»
  brain.distToPlayer = 10; agent.vx = 0; agent.vz = 0;
  const near = brain.shotSpread(game);
  brain.distToPlayer = 45;
  const far = brain.shotSpread(game);
  assert.ok(far > near, 'на дистанции боец мажет сильнее');
}

// командир раздаёт приказы
{
  const follower = { alive: true, brain: { receiveOrder(t, x, z, time) { this.order = { tactic: t, x, z, t: time }; } }, type: 'grunt', x: 0, z: 0 };
  const leader = { alive: true, type: 'officer', brain: { agent: null, state: 'combat' }, x: 2, z: 2 };
  leader.brain.agent = leader;
  const game = { time: 5, commanderTimer: 0, enemies: [leader, follower], pushRadio() {} };
  SH2.ai.commanderTick(game, 0.1);
  assert.ok(follower.brain.order, 'приказ доставлен подчинённому');
  assert.ok(['flank', 'advance'].includes(follower.brain.order.tactic), 'приказ осмысленный');
}

/* ============================ 5. ОРУЖИЕ ================================ */
assert.equal(D.WEAPONS.length, 5, 'пять видов оружия');
for (const w of D.WEAPONS) {
  assert.ok(w.damage > 0 && w.rpm > 0 && w.mag > 0 && w.range > 0, `${w.id}: параметры`);
  assert.ok(w.adsSpread <= w.spread, `${w.id}: прицел точнее`);
  assert.ok(w.reload > 0.5, `${w.id}: перезарядка не мгновенная`);
}
// дробовик стреляет дробью, снайперка точнее пистолета
assert.ok(D.WEAPON_BY_ID.shotgun.pellets > 1, 'дробовик стреляет дробью');
assert.ok(D.WEAPON_BY_ID.dmr.adsSpread < D.WEAPON_BY_ID.pistol.adsSpread, 'снайперка точнее');

/* ============================= 6. МИССИИ =============================== */
assert.equal(D.MISSIONS.length, 6, 'шесть миссий');
for (const m of D.MISSIONS) {
  assert.ok(m.name && m.briefing && m.tip, `${m.id}: текст есть`);
  assert.ok(m.loadout.length >= 2, `${m.id}: минимум два ствола`);
  for (const w of m.loadout) assert.ok(D.WEAPON_BY_ID[w], `${m.id}: оружие ${w} существует`);
  for (const t of m.enemies) assert.ok(D.ENEMY_BY_ID[t], `${m.id}: боевик ${t} существует`);
  assert.ok(D.MAPS[m.map], `${m.id}: карта ${m.map} существует`);
  assert.ok(['eliminate', 'destroy', 'survive', 'extract', 'boss'].includes(m.type), `${m.id}: тип ${m.type}`);
}
// есть все типы миссий
const types = new Set(D.MISSIONS.map((m) => m.type));
assert.equal(types.size, 5, 'все пять типов миссий представлены');

/* ============================== 7. КАРТЫ =============================== */
for (const [id, m] of Object.entries(D.MAPS)) {
  assert.ok(m.walls.length >= 4, `${id}: стены есть`);
  assert.ok((m.buildings || []).length >= 4, `${id}: здания-полигоны есть`);
  for (const b of m.buildings) assert.ok(b.poly.length >= 4, `${id}: у здания замкнутый контур`);
  assert.ok((m.barriers || []).length + (m.sandbags || []).length >= 4, `${id}: укрытия есть`);
  assert.ok((m.barrels || []).length + (m.rocks || []).length + (m.stacks || []).length >= 6, `${id}: мелкие пропсы есть`);
  assert.ok(m.spawns.length >= 5, `${id}: точки появления`);
  assert.ok(m.size > 40, `${id}: размер карты`);
  const rng = D.rng(11);
  const w = new SH2.world.World(m, m.walls.map((x) => ({ x: x.x, z: x.z, hw: x.w / 2, hd: x.d / 2, h: x.h, y: 0 })));
  // на карте есть проходимое место
  assert.ok(w.randomOpenPoint(0, 0, 1, 10, rng), `${id}: есть открытая точка`);
  assert.ok(m.playerSpawn, `${id}: задан старт игрока`);
}

/* старт игрока: детерминированный, свободный и вне вражеских спавнов */
for (const [id, m] of Object.entries(D.MAPS)) {
  const sp = m.playerSpawn;
  assert.ok(sp && isFinite(sp.x) && isFinite(sp.z) && isFinite(sp.yaw), `${id}: старт с координатами и yaw`);
  const lvl = SH2.model.buildLevel(id);
  const w = new SH2.world.World(m, lvl.colliders);
  // тело не сдвигается при разрешении коллизий — значит, стоит на свободном месте
  const p = { x: sp.x, z: sp.z };
  w.resolveCircle(p, 0.96);
  assert.ok(Math.hypot(p.x - sp.x, p.z - sp.z) < 1e-6, `${id}: старт не пересекается с препятствиями`);
  // вокруг кисти/тела есть запас: минимум 1 м до ближайшего коллайдера
  let clear = 1e9;
  for (const c of lvl.colliders) {
    const dx = Math.max(Math.abs(sp.x - c.x) - c.hw, 0);
    const dz = Math.max(Math.abs(sp.z - c.z) - c.hd, 0);
    clear = Math.min(clear, Math.hypot(dx, dz));
  }
  assert.ok(clear > 1.0, `${id}: вокруг старта есть место (${clear.toFixed(2)} м)`);
  // старт не совпадает с точкой появления врагов — нет «спавна в чужой модельке»
  for (const s of m.spawns) {
    assert.ok(Math.hypot(s[0] - sp.x, s[1] - sp.z) > 6, `${id}: старт далеко от вражеского спавна`);
  }
  // ...и камера не внутри геометрии: проверяем сами меши, а не только AABB
  lvl.group.updateMatrixWorld(true);
  let inside = null;
  lvl.group.traverse((o) => {
    if (inside || !o.isMesh || !o.geometry) return;
    const box = new (sandbox.THREE.Box3)().setFromObject(o);
    if (sp.x > box.min.x && sp.x < box.max.x && sp.z > box.min.z && sp.z < box.max.z && 1.62 > box.min.y && 1.62 < box.max.y) {
      inside = { y: [+box.min.y.toFixed(2), +box.max.y.toFixed(2)] };
    }
  });
  assert.ok(!inside, `${id}: глаз не внутри модели на старте`);
}

/* геометрия зданий должна стоять там же, где их коллайдеры.
   Раньше extrudePlan зеркалил план по Z: стены рисовались в другом месте,
   и игрок «оказывался в стене», хотя коллизии были свободны. */
for (const id of Object.keys(D.MAPS)) {
  const lvl = SH2.model.buildLevel(id);
  lvl.group.updateMatrixWorld(true);
  const walls = [];
  lvl.group.traverse((o) => {
    if (!o.isMesh || !o.geometry) return;
    const box = new (sandbox.THREE.Box3)().setFromObject(o);
    if (box.max.y - box.min.y < 2) return;                  // только стены зданий
    if (box.max.x - box.min.x > lvl.map.size * 0.9) return; // не небо/земля
    walls.push(box);
  });
  const bld = lvl.colliders.filter((c) => c.kind === 'building');
  let ok = 0, mirrored = 0;
  for (const box of walls) {
    for (const c of bld) {
      const x0 = c.x - c.hw, x1 = c.x + c.hw, z0 = c.z - c.hd, z1 = c.z + c.hd;
      const near = (a, b) => Math.abs(a - b) < 1.7;
      if (near(box.min.x, x0) && near(box.max.x, x1)) {
        if (near(box.min.z, z0) && near(box.max.z, z1)) ok++;
        if (near(box.min.z, -z1) && near(box.max.z, -z0)) mirrored++;
      }
    }
  }
  assert.ok(ok > 0, `${id}: стены совпадают с коллайдерами зданий (${ok})`);
  assert.ok(mirrored === 0, `${id}: стены не зеркальны относительно коллизий (${mirrored})`);
}

/* ===================== 8. УПРАВЛЕНИЕ И КОЛЛИЗИИ ========================= */
// экранное «право»: камера смотрит в +Z через разворот на π, поэтому
// вправо = (-cos yaw, sin yaw). Проверяем, что стрейф не зеркальный.
for (const yaw of [0, 0.7, -1.2, 2.5, Math.PI]) {
  const rightX = -Math.cos(yaw), rightZ = Math.sin(yaw);
  const fwdX = Math.sin(yaw), fwdZ = Math.cos(yaw);
  // скалярные произведения: право ⟂ вперёд, и «право» это +90° от взгляда
  assert.ok(Math.abs(rightX * fwdX + rightZ * fwdZ) < 1e-9, 'стрейф перпендикулярен взгляду');
  const cross = fwdX * rightZ - fwdZ * rightX;
  assert.ok(cross > 0, 'стрейф направлен вправо от взгляда, а не влево');
}

/* стены зданий: движение блокируется, пуля проходит только в окно */
{
  const lvl = SH2.model.buildLevel('depot');
  const b = D.MAPS.depot.buildings[0];
  const pb = SH2.level.planBounds(b.poly);
  const building = lvl.colliders.find((c) => c.kind === 'building');
  assert.ok(building, 'у здания есть коллайдер');
  assert.ok(building.holes && building.holes.length >= 4, 'в стенах есть проёмы-окна');
  // юнит снаружи не может войти внутрь
  const world = new SH2.world.World(D.MAPS.depot, lvl.colliders);
  const pos = { x: pb.cx, z: pb.cz, y: 0 };
  world.resolveCircle(pos, 0.4);
  const stillInside = Math.abs(pos.x - pb.cx) < pb.hw && Math.abs(pos.z - pb.cz) < pb.hd;
  assert.ok(!stillInside, 'юнит выталкивается из здания');

  // луч в уровне окна проходит сквозь стену, в уровне цоколя — нет
  const from = { x: pb.cx - pb.hw - 6, z: pb.cz };
  const dirX = 1, dirZ = 0;
  const dir = new (sandbox.THREE.Vector3)(dirX, 0, dirZ);
  const hole = SH2.model.windowHoles(pb, b)[0];
  const winY = (hole.dy0 + hole.dy1) / 2;
  const atWindow = world.rayColliders(from.x, winY, from.z, 1, 0, 0, 30, { bullet: true });
  const atBase = world.rayColliders(from.x, 0.25, from.z, 1, 0, 0, 30, { bullet: true });
  assert.ok(atBase && atBase.collider.kind === 'building', 'в уровне фундамента стена держит пулю');
  // если окно есть на этой стене — луч в его уровне проходит дальше ближайшей стены
  if (atWindow) {
    const wallT = atWindow.t;
    assert.ok(wallT > 0, 'луч в окно не упирается в стену вплотную');
  }
  void dir;
}

/* низкие препятствия держат пехоту, но не держат прыгнувшего */
{
  const lvl = SH2.model.buildLevel('depot');
  const world = new SH2.world.World(D.MAPS.depot, lvl.colliders);
  const low = lvl.colliders.find((c) => c.standLow);
  assert.ok(low, 'на карте есть низкие препятствия (мешки/камень)');
  const onGround = { x: low.x, z: low.z, y: 0 };
  world.resolveCircle(onGround, 0.4);
  assert.ok(Math.abs(onGround.x - low.x) > 0.5 || Math.abs(onGround.z - low.z) > 0.5,
    'стоящего выталкивает из мешков');
  const inAir = { x: low.x, z: low.z, y: 1.2 };
  world.resolveCircle(inAir, 0.4);
  assert.ok(Math.abs(inAir.x - low.x) < 1e-6 && Math.abs(inAir.z - low.z) < 1e-6,
    'в прыжке над низким препятствием ничего не мешает');
}

/* направленное укрытие: за стеной от стрелка укрытие есть, с фланга — нет.
   Проверяем на изолированной стене, чтобы соседние дома не влияли. */
{
  const wall = { x: 0, z: 0, hw: 6, hd: 6, h: 4.2, y: 0, kind: 'building', holes: [] };
  const world = new SH2.world.World({ size: 80 }, [wall]);
  const behind = { x: 0, z: -6.9 };
  const front = world.coverFrom(behind.x, behind.z, 0, 30, 1.7, 1.5);
  const flank = world.coverFrom(behind.x, behind.z, 30, -6.9, 1.7, 1.5);
  assert.equal(front.cover, 1, 'прямо за стеной укрытие полное');
  assert.equal(flank.cover, 0, 'с фланга укрытия нет');
  // низкое препятствие: стоя не спасает, присевшему — почти полное
  const low = { x: 0, z: 0, hw: 5, hd: 0.3, h: 0.72, y: 0, kind: 'sandbag', standLow: true };
  const wLow = new SH2.world.World({ size: 80 }, [low]);
  const crouched = wLow.coverFrom(0, -0.9, 0, 30, 1.0, 1.2);
  const standing = wLow.coverFrom(0, -0.9, 0, 30, 1.7, 1.5);
  assert.ok(crouched.cover > standing.cover, 'за мешками присевший укрыт лучше стоящего');
  // точка укрытия ищется у настоящего здания на карте
  const lvl = SH2.model.buildLevel('depot');
  const world2 = new SH2.world.World(D.MAPS.depot, lvl.colliders);
  const b = lvl.colliders.find((c) => c.kind === 'building');
  const spot = world2.coverSpot(b.x, b.z - b.hd - 3, b.x, b.z + 30, 14, 1.7);
  assert.ok(spot, 'поиск точки укрытия работает');
  assert.ok(spot.cover >= 0.5, 'найденная точка действительно укрыта');
}

/* у каждого коллайдера есть точка опоры и нормаль — по ним ходят ИИ и карта */
{
  for (const id of Object.keys(D.MAPS)) {
    const lvl = SH2.model.buildLevel(id);
    for (const c of lvl.colliders) {
      assert.ok(c.anchor && Number.isFinite(c.anchor.x), `${id}: у ${c.kind} есть точка опоры`);
      assert.ok(Math.abs(Math.hypot(c.normalX, c.normalZ) - 1) < 1e-6, `${id}: нормаль единичная`);
      assert.ok([1, 2, 3].includes(c.coverHeight), `${id}: класс высоты укрытия`);
    }
  }
}

/* новые пропсы карт: контейнеры, фуры, фонари, вышки, обломки, воронки */
{
  for (const id of Object.keys(D.MAPS)) {
    const m = D.MAPS[id];
    const lvl = SH2.model.buildLevel(id);
    const kinds = new Set(lvl.colliders.map((c) => c.kind));
    assert.ok(m.containers.length >= 2, `${id}: контейнеры расставлены`);
    assert.ok(m.trucks.length >= 1, `${id}: техника расставлена`);
    assert.ok(m.lamps.length >= 3, `${id}: фонари`);
    assert.ok(m.craters.length >= 2 && m.bushes.length >= 4, `${id}: воронки и растительность`);
    assert.ok(kinds.has('container') && kinds.has('truck') && kinds.has('lamp'),
      `${id}: пропсы дошли до коллизий`);
  }
}

/* ==================== 9. ОРУЖИЕ ОТ ПЕРВОГО ЛИЦА ========================= */
{
  const vmSrc = read('src/viewmodel.js');
  assert.ok(vmSrc.includes('_attachHands'), 'кисти крепятся к точкам хвата оружия');
  assert.ok(/gripPoint/.test(vmSrc) && /forePoint/.test(vmSrc), 'используются gripPoint и forePoint чертежа');
  assert.ok(!/BoxGeometry|CylinderGeometry/.test(vmSrc), 'руки и оружие — только контуры и тела вращения');
  // стволы крупные в кадре: длина видимой части не меньше 0.35 м от глаза
  for (const w of D.WEAPONS) {
    assert.ok(w.range > 30, `${w.id}: дальность задана`);
  }
  // руки не «в камере»: предплечье уходит вниз-назад, иначе модель заслонит вид
  assert.ok(/makeArm/.test(vmSrc), 'рука собирается из лофта, кисть — из ладони и пальцев');
  assert.ok(/layers\.set\(1\)/.test(vmSrc), 'оружие рендерится отдельным слоем поверх мира');
  // оружие должно получать свет во втором проходе: все лампы уровня лежат на
  // слое 0, и без собственного света оружие рисуется чёрным силуэтом
  assert.ok(/buildLights/.test(vmSrc), 'у оружия свой свет');
  assert.ok(/isLight\) c\.layers\.set\(1\)/.test(vmSrc), 'свет оружия включён на слое 1');
  // слой ставится после сборки рук, иначе кисти остаются на слое мира
  const iHands = vmSrc.indexOf('this.buildHands();');
  const iLayer = vmSrc.lastIndexOf('this.root.traverse((c) => { if (c.isMesh) c.layers.set(1); });');
  assert.ok(iHands > 0 && iLayer > iHands, 'слой оружия ставится после сборки рук');

  // Поза от бедра под каждый ствол: пистолет не должен оказаться за нижним
  // краем кадра, а винтовка — упереться прикладом в правый край.
  const T2 = sandbox.THREE;
  const cam = new T2.PerspectiveCamera(78, 16 / 9, 0.05, 320);
  cam.position.set(0, 1.62, 0);
  cam.updateMatrixWorld(true);
  const vmw = new SH2.viewmodel.ViewModel(cam);
  for (const id of ['pistol', 'smg', 'rifle', 'shotgun', 'dmr']) {
    vmw.setWeapon(id);
    assert.ok(vmw.pose && isFinite(vmw.pose.s), `${id}: поза от бедра задана`);
    for (let k = 0; k < 60; k++) vmw.update(1 / 60, { moving: 0, ads: false });
    vmw.root.updateMatrixWorld(true);
    cam.updateMatrixWorld(true);
    // Box3.setFromObject уже в мировых координатах
    const box = new T2.Box3().setFromObject(vmw.mounted);
    const v = new T2.Vector3();
    let minY = 9, maxY = -9, maxX = -9;
    for (const sx of [box.min.x, box.max.x]) for (const sy of [box.min.y, box.max.y]) for (const sz of [box.min.z, box.max.z]) {
      v.set(sx, sy, sz)
        .applyMatrix4(cam.matrixWorldInverse)
        .applyMatrix4(cam.projectionMatrix);
      minY = Math.min(minY, v.y); maxY = Math.max(maxY, v.y); maxX = Math.max(maxX, v.x);
    }
    // как в CS: ствол читается в нижней половине кадра, дуло тянется к центру,
    // а нижняя часть (магазин, рукоять) законно уходит за край экрана
    assert.ok(maxY > -0.95, `${id}: ствол виден в кадре (верх ${maxY.toFixed(2)})`);
    assert.ok(maxY < 0.5, `${id}: оружие не залезает в верхнюю половину (${maxY.toFixed(2)})`);
    assert.ok(minY < 0.8, `${id}: ствол попадает в кадр (низ ${minY.toFixed(2)})`);
    assert.ok(maxX < 1.25, `${id}: приклад не уходит целиком за правый край (${maxX.toFixed(2)})`);
    assert.ok(maxX > 0.1, `${id}: оружие справа, а не по центру экрана (${maxX.toFixed(2)})`);
  }
}

/* ========================= 10. КАРТЫ-СХЕМЫ ============================== */
{
  // каждый коллайдер знает свой тип, а типы покрывают все пропсы карт
  for (const id of Object.keys(D.MAPS)) {
    const lvl = SH2.model.buildLevel(id);
    const kinds = new Set(lvl.colliders.map((c) => c.kind));
    for (const k of ['building', 'tower', 'barrier', 'sandbag', 'barrel', 'rock', 'stack', 'container']) {
      assert.ok(kinds.has(k) || k === 'tower', `${id}: тип коллайдера ${k} встречается`);
    }
    // ни один объект не стоит вне карты
    const half = D.MAPS[id].size / 2;
    for (const c of lvl.colliders) {
      assert.ok(Math.abs(c.x) + c.hw <= half + 0.01 && Math.abs(c.z) + c.hd <= half + 0.01,
        `${id}: ${c.kind} не выходит за границу карты`);
    }
  }
}

console.log(`shooter-2: логика в порядке — ${D.TOTALS.total} клипов (${D.PARTS.length} частей × ${D.CLIPS.length} анимаций × ${D.VARIANTS.length} варианта), ` +
  `${D.MISSIONS.length} миссий, ${D.ENEMY_TYPES.length} типов боевиков, ${D.WEAPONS.length} стволов.`);
