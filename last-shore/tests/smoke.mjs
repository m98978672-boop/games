// Быстрая проверка мира и физики без браузера (только three, без WebGL).
import * as THREE from 'three';
import { World } from '../src/world.js';
import { Sky } from '../src/sky.js';
import { Player } from '../src/player.js';
import { CONFIG } from '../src/config.js';

const scene = new THREE.Scene();
let t0 = performance.now();
const world = new World(scene);
console.log('world build ms:', Math.round(performance.now() - t0));

// --- рельеф ---
let min = Infinity, max = -Infinity, land = 0, sea = 0, samples = 0;
for (let i = 0; i < 20000; i++) {
  const x = (Math.random() - 0.5) * CONFIG.world.size;
  const z = (Math.random() - 0.5) * CONFIG.world.size;
  const h = world.heightAt(x, z);
  if (!Number.isFinite(h)) throw new Error('NaN height at ' + x + ',' + z);
  min = Math.min(min, h); max = Math.max(max, h);
  h > 0.4 ? land++ : sea++;
  samples++;
}
console.log('height min/max:', min.toFixed(2), max.toFixed(2), 'land%:', ((land / samples) * 100).toFixed(1));
console.log('colliders:', world.colliders.length, 'pickups:', world.pickups.length);
console.log('scene children:', scene.children.length);
const instanced = scene.children.filter((c) => c.isInstancedMesh);
console.log('instanced meshes:', instanced.length, 'instances:', instanced.reduce((a, c) => a + c.count, 0));

// --- ищем точку спавна ---
function findLand() {
  for (let i = 0; i < 200000; i++) {
    const x = (Math.random() - 0.5) * CONFIG.world.size * 0.7;
    const z = (Math.random() - 0.5) * CONFIG.world.size * 0.7;
    const h = world.heightAt(x, z);
    if (h > 1.5 && h < 8 && world.slopeAt(x, z) < 0.5) return { x, z };
  }
  throw new Error('no land');
}

// --- игрок: ходьба ---
const player = new Player(scene);
const spawn = findLand();
player.setPosition(spawn.x, spawn.z, world);
const start = player.position.clone();
const input = { forward: true, back: false, left: false, right: false, sprint: false, jump: false };
for (let i = 0; i < 600; i++) {
  player.update(1 / 60, input, world);
  if (!Number.isFinite(player.position.x) || !Number.isFinite(player.position.y)) throw new Error('player NaN');
}
const moved = player.position.distanceTo(start);
console.log('walked 10s ->', moved.toFixed(2), 'm; speed m/s:', (moved / 10).toFixed(2), 'grounded:', player.grounded, 'y:', player.position.y.toFixed(2));

// --- столкновения не затаскивают в воду ---
let deep = 0;
for (let i = 0; i < 3000; i++) {
  player.update(1 / 60, { ...input, forward: true, sprint: true }, world);
  if (world.heightAt(player.position.x, player.position.z) < -CONFIG.player.maxDepth - 0.1) deep++;
}
console.log('frames in deep water:', deep, 'stamina:', player.stamina.toFixed(1));

// --- небо и сутки ---
const sky = new Sky(scene, null);
let nightMin = 1, nightMax = 0, hoursSeen = new Set();
for (let i = 0; i < 3000; i++) {
  const info = sky.update(1 / 60, player.position);
  nightMin = Math.min(nightMin, info.night);
  nightMax = Math.max(nightMax, info.night);
  hoursSeen.add(Math.floor(sky.hour));
}
console.log('days:', sky.day, 'hours covered:', hoursSeen.size, 'night range:', nightMin.toFixed(2), nightMax.toFixed(2), 'clock:', sky.clockString());

// --- подбор ---
const pick = world.pickups[0];
const before = world.pickups.length;
world.removePickup(pick);
console.log('pickup removed:', world.pickups.length === before - 1);

// --- камера ---
const cam = new THREE.PerspectiveCamera(64, 1.6, 0.1, 1000);
player.applyCamera(cam, world, 1);
console.log('camera pos:', cam.position.toArray().map((v) => v.toFixed(1)).join(','), 'finite:', cam.position.toArray().every(Number.isFinite));
console.log('OK');

// --- профиль высот по радиусу ---
const rows = [];
for (let rr = 0; rr <= 1.0; rr += 0.05) {
  let sum = 0, n = 0, mx = -1e9;
  for (let a = 0; a < Math.PI * 2; a += 0.1) {
    for (let k = 0; k < 5; k++) {
      const rad = rr * CONFIG.world.size * 0.5;
      const h = world.heightAt(Math.cos(a) * rad, Math.sin(a) * rad);
      sum += h; n++; mx = Math.max(mx, h);
    }
  }
  rows.push(`r=${rr.toFixed(2)} avg=${(sum / n).toFixed(1)} max=${mx.toFixed(1)}`);
}
console.log(rows.join('\n'));
