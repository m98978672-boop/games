// Проверка обновления острова: логовища, лодка, вода, животные и небо.
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import fs from 'node:fs';
import path from 'node:path';
import * as THREE from 'three';
import { makeBoat } from '../src/models.js';

// Оба борта должны пересекаться лучом снаружи и изнутри.
const hull = makeBoat().parts.hull;
hull.updateMatrixWorld(true);
for (const side of [-1, 1]) {
  const ray = new THREE.Raycaster(new THREE.Vector3(side * 2, 0.3, 0), new THREE.Vector3(-side, 0, 0));
  assert.ok(ray.intersectObject(hull).length >= 2, `борт ${side} закрыт`);
}

const dir = path.resolve(import.meta.dirname, '..');
const dom = new JSDOM(fs.readFileSync(path.join(dir, 'index.html'), 'utf8'), {
  url: 'https://example.com/', pretendToBeVisual: true, runScripts: 'outside-only',
});
globalThis.window = dom.window;
globalThis.document = dom.window.document;
Object.defineProperty(globalThis, 'navigator', { value: dom.window.navigator, configurable: true });
globalThis.HTMLElement = dom.window.HTMLElement;
globalThis.localStorage = dom.window.localStorage;
globalThis.requestAnimationFrame = dom.window.requestAnimationFrame = () => 0;
new Function(fs.readFileSync(path.join(dir, 'tests/.harness-bundle.js'), 'utf8'))();
document.dispatchEvent(new window.Event('DOMContentLoaded', { bubbles: true }));
document.getElementById('btn-start').click();
await new Promise((resolve) => setTimeout(resolve, 300));
const game = window.__game;
assert.ok(game?.running);
const w = game.world;
assert.ok(w.dens.length >= 15);
for (const den of w.dens) assert.ok(w.colliders.some(c => c.kind === 'den' && c.den === den));
const den = w.dens.find(d => d.kind === 'boar');
assert.ok(den.shells.length > 3, 'жилище состоит из отдельных секторов');
const sector = den.shells.find(s => s.maxY > den.y + 0.6);
const x = sector.poly.reduce((sum, p) => sum + p.x, 0) / sector.poly.length;
const z = sector.poly.reduce((sum, p) => sum + p.z, 0) / sector.poly.length;
const pos = new THREE.Vector3(x, den.y, z);
assert.equal(game.mineWorld.shells, w.shells, 'игрок получает обводки поверхности');
assert.ok(w.shells.resolve(pos, 0.42, null, den.y, 0.55) > 0, 'детали жилища твёрдые');
assert.ok(Math.hypot(pos.x - x, pos.z - z) > 0.01, 'пересечение устраняется');
for (const type of ['rabbit', 'lizard']) {
  const mob = game.mobs.list.find(m => m.type === type);
  assert.ok(mob?.alive && mob.parts.legs.length === 4, type);
  assert.ok(w.isFree(mob.x, mob.z, mob.def.radius), `${type} не внутри укрытия`);
}
assert.ok(game.sky.clouds.children.length >= 15);
assert.ok(game.sky.cloudMaterials.every(m => m.side === THREE.DoubleSide));

// Вход по E с воды, движение и выход в открытом море.
const b = game.boat;
game.player.position.set(b.x + 3.5, 0, b.z);
assert.match(game.aimPromptHtml(), /сесть в лодку/);
game.interact();
assert.ok(game.sailing);
game.input.forward = true;
for (let i = 0; i < 60; i++) { w.time += 1 / 30; game.updateBoat(1 / 30); }
assert.ok(b.speed > 2);
assert.equal(w.waterUniforms.uBoatVisible.value, 1);
assert.equal(b.group.rotation.y, b.heading);
// Найти открытую воду, чтобы выход точно был в воду, не на берег.
let deep;
for (let x = -230; x <= 230 && !deep; x += 10) for (let z = -230; z <= 230 && !deep; z += 10) {
  if (w.heightAt(x, z) < -3 && Array.from({length: 16}, (_, i) => {
    const a = i * Math.PI / 8;
    return w.heightAt(x + 12 * Math.cos(a), z + 12 * Math.sin(a));
  }).every(h => h < -0.45)) deep = { x, z };
}
assert.ok(deep);
b.x = deep.x; b.z = deep.z; game.updateBoat(0.01);
assert.ok(game.toggleSailing());
assert.equal(game.sailing, false);
assert.ok(game.player.swimming && game.player.position.y > -1.2 && game.player.position.y < 0);
game.interact();
assert.ok(game.sailing, 'повторная посадка из воды');

assert.equal(game.audio.toggleMusic(), false);
assert.equal(game.audio.toggleMusic(), true);
assert.ok(w.water.material.fragmentShader.includes('!gl_FrontFacing'));
console.log('ISLAND UPDATE OK');
process.exit(0);
