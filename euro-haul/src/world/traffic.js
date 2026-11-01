// Дорожный поток: легковые, фургоны, автобусы и грузовики в обе стороны.
import * as THREE from 'three';
import { clamp, rng } from '../core/math.js';
import { materials } from './materials.js';

const CAR_COLORS = [0xd8d8d2, 0x2f3a45, 0x8c2f2a, 0x2f5c8c, 0x6f7c4a, 0xb0b4b8, 0x1f2225, 0xc9a23a, 0x4a4f7a, 0x7a2f4a];

function makeCar(m, type) {
  const g = new THREE.Group();
  const paint = new THREE.MeshStandardMaterial({
    color: CAR_COLORS[Math.floor(Math.random() * CAR_COLORS.length)],
    metalness: 0.5,
    roughness: 0.35,
  });
  const dark = m.darkMetal;
  if (type === 'truck') {
    const cab = new THREE.Mesh(new THREE.BoxGeometry(2.5, 2.6, 2.2), paint);
    cab.position.set(0, 1.6, 3.2);
    g.add(cab);
    const boxBody = new THREE.Mesh(new THREE.BoxGeometry(2.5, 3.0, 8.6), new THREE.MeshStandardMaterial({ color: 0xe4e4dd, roughness: 0.8 }));
    boxBody.position.set(0, 2.1, -2.4);
    g.add(boxBody);
    const bumper = new THREE.Mesh(new THREE.BoxGeometry(2.5, 0.5, 0.3), dark);
    bumper.position.set(0, 0.8, 4.35);
    g.add(bumper);
  } else if (type === 'bus') {
    const body = new THREE.Mesh(new THREE.BoxGeometry(2.55, 3.1, 11.5), paint);
    body.position.set(0, 1.9, 0);
    g.add(body);
    const win = new THREE.Mesh(new THREE.BoxGeometry(2.57, 1.0, 9.8), m.glass);
    win.position.set(0, 2.5, 0.2);
    g.add(win);
  } else if (type === 'van') {
    const body = new THREE.Mesh(new THREE.BoxGeometry(2.1, 2.2, 5.4), paint);
    body.position.set(0, 1.35, 0);
    g.add(body);
    const win = new THREE.Mesh(new THREE.BoxGeometry(2.12, 0.7, 1.6), m.glass);
    win.position.set(0, 1.95, 1.5);
    g.add(win);
  } else {
    const lower = new THREE.Mesh(new THREE.BoxGeometry(1.86, 0.62, 4.4), paint);
    lower.position.set(0, 0.72, 0);
    g.add(lower);
    const upper = new THREE.Mesh(new THREE.BoxGeometry(1.72, 0.6, 2.3), paint);
    upper.position.set(0, 1.25, -0.25);
    g.add(upper);
    const win = new THREE.Mesh(new THREE.BoxGeometry(1.74, 0.5, 2.1), m.glass);
    win.position.set(0, 1.27, -0.25);
    g.add(win);
    for (const x of [-0.95, 0.95]) {
      const mirror = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.1, 0.12), dark);
      mirror.position.set(x, 1.18, 1.0);
      g.add(mirror);
    }
  }
  // Колёса.
  const wheelGeo = new THREE.CylinderGeometry(0.34, 0.34, 0.24, 10);
  const wheels = [];
  const zs = type === 'bus' ? [-4, -2.6, 3.2, 4.2] : type === 'truck' ? [3.2, -1.2, -2.4] : [-1.4, 1.35];
  for (const z of zs) {
    for (const side of [-1, 1]) {
      const w = new THREE.Mesh(wheelGeo, m.tyres);
      w.rotation.z = Math.PI / 2;
      w.position.set(side * (type === 'car' ? 0.86 : 1.0), 0.34, z);
      g.add(w);
      wheels.push(w);
    }
  }
  const head = new THREE.MeshStandardMaterial({ color: 0xfff4d0, emissive: 0xffe9a8, emissiveIntensity: 1.6 });
  const tail = new THREE.MeshStandardMaterial({ color: 0xd83a2c, emissive: 0xa8180c, emissiveIntensity: 1.2 });
  for (const side of [-0.65, 0.65]) {
    const hl = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.16, 0.08), head);
    hl.position.set(side, type === 'truck' ? 1.0 : 0.78, type === 'car' ? 2.2 : 4.35);
    g.add(hl);
    const tl = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.14, 0.08), tail);
    tl.position.set(side, type === 'truck' ? 1.0 : 0.8, type === 'car' ? -2.2 : -7.4);
    g.add(tl);
  }
  g.userData.wheels = wheels;
  g.userData.headMat = head;
  g.userData.tailMat = tail;
  return g;
}

export class Traffic {
  constructor(scene, route, count = 26) {
    this.scene = scene;
    this.route = route;
    this.mats = materials();
    this.vehicles = [];
    this.group = new THREE.Group();
    scene.add(this.group);
    this.rand = rng(4711);
    for (let i = 0; i < count; i++) {
      const type = ['car', 'car', 'car', 'van', 'truck', 'bus'][Math.floor(this.rand() * 6)];
      const mesh = makeCar(this.mats, type);
      mesh.visible = false;
      this.group.add(mesh);
      this.vehicles.push({
        mesh,
        active: false,
        s: 0,
        lat: 0,
        targetLat: 0,
        speed: 0,
        dir: 1,
        length: type === 'truck' ? 10 : type === 'bus' ? 12 : 4.6,
        type,
        laneTimer: 0,
        spin: 0,
      });
    }
    this.count = count;
    this.playerS = 0;
    this.headlights = false;
  }

  reset(route) {
    this.route = route;
    for (const v of this.vehicles) {
      v.active = false;
      v.mesh.visible = false;
    }
  }

  spawn(playerS, dir, dist) {
    const v = this.vehicles.find((x) => !x.active);
    if (!v) return;
    v.active = true;
    v.dir = dir;
    v.s = playerS + dist;
    v.lat = dir > 0 ? (this.rand() > 0.75 ? -1.85 : 1.85) : this.rand() > 0.5 ? -7.15 : -10.85;
    v.targetLat = v.lat;
    v.speed = dir > 0 ? 19 + this.rand() * 8 : 21 + this.rand() * 7;
    if (v.type === 'truck') v.speed = 19 + this.rand() * 4;
    v.laneTimer = 2 + this.rand() * 6;
    v.mesh.visible = true;
  }

  update(dt, playerS, playerLat, playerSpeed, night) {
    this.playerS = playerS;
    this.headlights = night > 0.35;
    // Пополнение потока.
    let sameDir = 0;
    for (const v of this.vehicles) if (v.active && v.dir > 0) sameDir++;
    if (sameDir < 9 && this.rand() < dt * 1.6) this.spawn(playerS, 1, 220 + this.rand() * 900);
    let oncoming = 0;
    for (const v of this.vehicles) if (v.active && v.dir < 0) oncoming++;
    if (oncoming < 7 && this.rand() < dt * 1.3) this.spawn(playerS, -1, 260 + this.rand() * 1100);

    for (const v of this.vehicles) {
      if (!v.active) continue;
      // Управление скоростью и полосами.
      if (v.dir > 0) {
        // торможение перед попутной машиной
        let blocked = null;
        for (const o of this.vehicles) {
          if (o === v || !o.active || o.dir !== v.dir) continue;
          if (Math.abs(o.lat - v.lat) < 2.2 && o.s > v.s && o.s - v.s < 35) {
            if (!blocked || o.s < blocked.s) blocked = o;
          }
        }
        const playerAhead = playerS > v.s && playerS - v.s < 40 && Math.abs(playerLat - v.lat) < 2.4;
        if ((blocked && blocked.speed < v.speed - 0.5) || playerAhead) {
          v.speed = Math.max(14, v.speed - dt * 3.4);
          v.laneTimer -= dt;
          if (v.laneTimer <= 0 && Math.abs(v.lat - 1.85) < 0.4) {
            v.targetLat = -1.85;
            v.laneTimer = 5 + this.rand() * 5;
          }
        } else {
          v.speed = Math.min(v.type === 'truck' ? 24 : 31, v.speed + dt * 1.6);
          v.laneTimer -= dt;
          if (v.laneTimer <= 0) {
            v.targetLat = this.rand() > 0.5 ? 1.85 : -1.85;
            v.laneTimer = 6 + this.rand() * 8;
          }
        }
        v.lat += clamp(v.targetLat - v.lat, -1.8 * dt, 1.8 * dt);
        v.s += v.speed * dt;
      } else {
        v.s -= (v.speed + 2) * dt;
        v.lat = v.targetLat;
      }
      // Переиспользование и видимость.
      const rel = v.s - playerS;
      if (rel > 1600 || rel < -500 || v.s < 0 || v.s > this.route.length - 1) {
        v.active = false;
        v.mesh.visible = false;
        continue;
      }
      const p = this.route.worldPos(v.s, v.lat);
      v.mesh.position.set(p.x, p.y + 0.02, p.z);
      v.mesh.rotation.y = p.hdg + (v.dir < 0 ? Math.PI : 0);
      const spin = (v.speed / 0.34) * dt;
      for (const w of v.mesh.userData.wheels) w.rotation.x -= spin;
      v.mesh.userData.headMat.emissiveIntensity = this.headlights ? 2.4 : 0.5;
      v.mesh.userData.tailMat.emissiveIntensity = this.headlights ? 1.9 : 0.8;
    }
  }

  /** Проверка столкновения с игроком. Возвращает описание удара или null. */
  collide(playerS, playerLat) {
    for (const v of this.vehicles) {
      if (!v.active || v.dir < 0) continue;
      const ds = Math.abs(v.s - playerS);
      const dl = Math.abs(v.lat - playerLat);
      if (ds < (v.length + 16.5) / 2 && dl < 2.6) {
        return v;
      }
    }
    return null;
  }

  dispose() {
    const shared = new Set(Object.values(this.mats));
    this.group.traverse((o) => {
      if (o.geometry) o.geometry.dispose();
      if (o.material && !shared.has(o.material) && !Array.isArray(o.material)) {
        o.material.map && o.material.map.dispose && o.material.map.dispose();
        o.material.dispose();
      }
    });
    this.scene.remove(this.group);
  }
}
