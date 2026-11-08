// Детерминированная проверка команд Canvas, не замена скриншота в браузере.
import assert from 'node:assert/strict';
import { loadConfig } from '../src/core/config.js';
import { Game } from '../src/sim/game.js';
import { Renderer } from '../src/render/renderer.js';

const cfg = await loadConfig();
const game = new Game({ cfg, seed: 7, difficulty: 'regular', aiVsAi: true });
const walls = game.walls;
const building = game.world.buildings.find((b) => b.type === 'hq' && walls.state(b));
assert.ok(building, 'штаб с контуром существует');
const st = walls.state(building);
// Отдельный контур, чтобы другие здания не влияли на проверяемые команды.
walls.instances = new Map([[building.id, st]]);
const calls = [];
let path = [];
const ctx = {
  beginPath() { path = []; },
  moveTo(x, y) { path.push(['moveTo', x, y]); },
  lineTo(x, y) { path.push(['lineTo', x, y]); },
  arc(...args) { path.push(['arc', ...args]); },
  stroke() { calls.push({ op: 'stroke', color: this.strokeStyle, alpha: this.globalAlpha, path: [...path] }); },
  fill() { calls.push({ op: 'fill', color: this.fillStyle, alpha: this.globalAlpha, path: [...path] }); },
  fillRect(...args) { calls.push({ op: 'fillRect', color: this.fillStyle, args }); },
  fillText(...args) { calls.push({ op: 'fillText', args }); },
  setLineDash() {},
};
const renderer = Object.create(Renderer.prototype);
Object.assign(renderer, {
  game, ctx, canvas: { width: 800, height: 600 }, dpr: 1,
  camera: { x: building.x, y: building.y, zoom: 1 }, showWallsDebug: false,
  isVisible: () => true,
});
const render = () => { calls.length = 0; renderer.drawWalls(); return [...calls]; };
const line = (calls, color, start) => calls.find((c) => c.op === 'stroke' && c.color === color &&
  c.path[0]?.[0] === 'moveTo' && c.path[0][1] === start.x && c.path[0][2] === start.y);
const segment = st.outline.segments[0];
const segState = st.segs.find((s) => s.id === segment.id);
const start = renderer.worldToScreen(building.x + segment.points[0][0], building.y + segment.points[0][1]);
const material = walls.materials[segment.material];
let frame = render();
assert.equal(line(frame, material.color, start)?.alpha, 1, 'целый сегмент нарисован');
assert.ok(frame.some((c) => c.op === 'stroke' && c.color === '#c9d3da'), 'окно нарисовано');
assert.ok(!frame.some((c) => c.op === 'fillText'), 'отладочные подписи выключены');

segState.hp = segState.maxHp * 0.4;
frame = render();
assert.equal(line(frame, material.color, start)?.alpha, 0.8, 'повреждённый сегмент полупрозрачен');
assert.equal(frame.filter((c) => c.op === 'stroke' && c.color === '#1b1a18').length, 2, 'на сегменте две трещины');
segState.hp = segState.maxHp * 0.1;
frame = render();
assert.equal(line(frame, material.color, start)?.alpha, 0.55, 'критический сегмент полупрозрачен');
assert.equal(frame.filter((c) => c.op === 'stroke' && c.color === '#1b1a18').length, 4, 'на критическом сегменте четыре трещины');
// Пролом и проёмы не должны наследовать alpha предыдущего повреждённого сегмента.
const nextState = st.segs.find((s) => s.id === st.outline.segments[1].id);
nextState.breached = true;
const lastState = st.segs.find((s) => s.id === st.outline.segments.at(-1).id);
lastState.hp = lastState.maxHp * 0.1;
frame = render();
assert.equal(frame.filter((c) => c.op === 'fill' && c.color === material.rubble).length, 2, 'пролом нарисован обломками');
assert.ok(frame.filter((c) => c.op === 'fill' && c.color === material.rubble).every((c) => c.alpha === 1), 'обломки не наследуют alpha трещин');
assert.equal(frame.find((c) => c.op === 'stroke' && c.color === '#c9d3da')?.alpha, 1, 'проём не наследует alpha стены');

const door = st.outline.openings.find((o) => o.type === 'door');
const doorState = st.doors[door.id];
const doorStart = renderer.worldToScreen(building.x + door.p1[0], building.y + door.p1[1]);
const doorEnd = renderer.worldToScreen(building.x + door.p2[0], building.y + door.p2[1]);
assert.equal(doorState.anim, 1, 'дверь изначально открыта');
walls.closeDoor(building, door.id);
walls.update(cfg.wallMaterials.doorAnimSeconds / 2);
assert.ok(Math.abs(doorState.anim - 0.5) < 1e-9, 'дверь закрывается плавно за заданное время');
frame = render();
let leaf = line(frame, '#5b4529', doorStart);
assert.ok(leaf, 'створка появляется при закрытии');
assert.equal(leaf.path[1][1], (doorStart.x + doorEnd.x) / 2, 'створка наполовину закрыта');
walls.update(cfg.wallMaterials.doorAnimSeconds / 2);
assert.equal(doorState.anim, 0, 'дверь полностью закрыта');
walls.openDoor(building, door.id);
walls.update(cfg.wallMaterials.doorAnimSeconds);
assert.equal(doorState.anim, 1, 'дверь открывается за заданное время');
assert.ok(!line(render(), '#7c6a4a', doorStart), 'открытая створка скрыта');

walls.closeDoor(building, door.id);
const saved = walls.serialize();
walls.openDoor(building, door.id);
walls.applySaved(saved);
assert.equal(doorState.state, 'closed', 'состояние двери загружено');
assert.equal(doorState.anim, 0, 'загруженная дверь отображается в правильном состоянии');
renderer.showWallsDebug = true;
frame = render();
assert.ok(frame.some((c) => c.op === 'fillText' && c.args[0].startsWith(segment.id + ' ')), 'F4-оверлей рисует id и HP');
assert.ok(frame.some((c) => c.op === 'fillRect' && c.color === '#d9b45a'), 'F4-оверлей рисует точки укрытия');
cfg.flags.wall_collision_v2 = false;
assert.equal(render().length, 0, 'при выключенном флаге стены и отладка не рисуются');
console.log('рендер стен: стадии, пролом, проёмы, анимация, загрузка, F4 и флаг — OK');
