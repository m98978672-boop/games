// Дорожный поток: легковые, фургоны, автобусы и грузовики в обе стороны.
import * as THREE from 'three';
import { clamp, rng } from '../core/math.js';
import { materials, trailerTexture, trailerRearTexture } from './materials.js';
import { mergeStatic } from '../core/merge-static.js';

const CAR_COLORS = [0xd8d8d2, 0x2f3a45, 0x8c2f2a, 0x2f5c8c, 0x6f7c4a, 0xb0b4b8, 0x1f2225, 0xc9a23a, 0x4a4f7a, 0x7a2f4a];
// Ливреи «чужих» тягачей: цвет кабины + цвет кузова + надпись на борту.
const TRUCK_LIVERIES = [
  { cab: 0x2f6ea8, body: '#e9e7df', name: 'NORDCARGO' },
  { cab: 0xb03a2e, body: '#dedbd2', name: 'TRANS EUROPA' },
  { cab: 0x2f7a52, body: '#e4e2d8', name: 'GREEN LINE' },
  { cab: 0xd9d9d3, body: '#dcdad1', name: 'BALTIC HAUL' },
  { cab: 0x2a3441, body: '#e6e4da', name: 'ALPINE FREIGHT' },
];

/** Местный помощник: коробка с поворотом. */
function tb(parent, w, h, d, mat, x, y, z, rot = null) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
  mesh.position.set(x, y, z);
  if (rot) mesh.rotation.set(rot[0] || 0, rot[1] || 0, rot[2] || 0);
  parent.add(mesh);
  return mesh;
}

/** Колёса с покрышкой и диском; возвращает список вращаемых мешей. */
function addWheels(g, m, spots, radius = 0.36, width = 0.26) {
  const geo = new THREE.CylinderGeometry(radius, radius, width, 12);
  const rimGeo = new THREE.CylinderGeometry(radius * 0.62, radius * 0.62, width + 0.02, 10);
  const wheels = [];
  for (const [x, z] of spots) {
    const w = new THREE.Mesh(geo, m.tyres);
    w.rotation.z = Math.PI / 2;
    w.position.set(x, radius, z);
    g.add(w);
    const rim = new THREE.Mesh(rimGeo, m.rim);
    rim.rotation.z = Math.PI / 2;
    rim.position.set(x * 1.02, radius, z);
    g.add(rim);
    wheels.push(w);
  }
  return wheels;
}

function makeCar(m, type) {
  const g = new THREE.Group();
  const livery = TRUCK_LIVERIES[Math.floor(Math.random() * TRUCK_LIVERIES.length)];
  const paint = new THREE.MeshStandardMaterial({
    color: type === 'truck' ? livery.cab : CAR_COLORS[Math.floor(Math.random() * CAR_COLORS.length)],
    metalness: 0.45,
    roughness: 0.34,
  });
  const glass = m.glass;
  const dark = m.darkMetal;
  const headMat = m.lamp.clone();
  const tailMat = m.redLight.clone();
  let wheels = [];

  if (type === 'truck') {
    // Кабина-вагон: плоский перед, наклонное лобовое, спойлер на крыше.
    tb(g, 2.44, 1.92, 2.15, paint, 0, 1.92, 2.95);
    const ws = tb(g, 2.3, 0.95, 0.06, glass, 0, 2.55, 4.02, [-0.16, 0, 0]);
    void ws;
    tb(g, 2.36, 0.28, 0.18, paint, 0, 3.02, 3.98);
    const deflector = tb(g, 2.25, 0.3, 0.95, paint, 0, 3.12, 3.35, [-0.28, 0, 0]);
    void deflector;
    tb(g, 2.3, 0.5, 0.12, dark, 0, 1.62, 4.06); // решётка
    tb(g, 2.44, 0.32, 0.24, paint, 0, 1.02, 4.02); // бампер
    for (const sx of [-1, 1]) {
      tb(g, 0.12, 0.75, 0.92, glass, sx * 1.2, 2.42, 3.35); // боковые стёкла
      tb(g, 0.36, 0.06, 0.06, dark, sx * 1.32, 2.86, 3.9); // кронштейн зеркала
      tb(g, 0.1, 0.5, 0.22, dark, sx * 1.52, 2.6, 3.86); // зеркало
      tb(g, 0.34, 0.16, 0.09, headMat, sx * 0.9, 1.12, 4.14);
      tb(g, 0.4, 0.22, 0.06, dark, sx * 1.0, 0.62, 3.9);
    }
    tb(g, 2.1, 0.34, 2.4, dark, 0, 0.86, 2.4); // рама
    // Полуприцеп: белый борт с ливреей, задние двери и юбка.
    const sideTex = trailerTexture(livery.name, livery.body);
    const boxMat = new THREE.MeshStandardMaterial({ map: sideTex, roughness: 0.75, metalness: 0.05 });
    const plain = new THREE.MeshStandardMaterial({ color: new THREE.Color(livery.body).multiplyScalar(0.92), roughness: 0.8 });
    const body = new THREE.Mesh(new THREE.BoxGeometry(2.55, 2.72, 11.4), [boxMat, boxMat, plain, plain, plain, plain]);
    body.position.set(0, 2.66, -4.2);
    g.add(body);
    tb(g, 2.56, 0.14, 11.4, dark, 0, 1.3, -4.2);
    for (const sx of [-1, 1]) tb(g, 0.06, 0.55, 5.0, dark, sx * 1.24, 0.95, -6.0);
    const rear = new THREE.Mesh(new THREE.PlaneGeometry(2.5, 2.66), new THREE.MeshStandardMaterial({ map: trailerRearTexture(livery.name, livery.body), roughness: 0.75 }));
    rear.position.set(0, 2.66, -9.92);
    rear.rotation.y = Math.PI;
    g.add(rear);
    tb(g, 2.44, 0.12, 0.14, dark, 0, 1.02, -9.95);
    for (const sx of [-0.92, -0.5, 0.5, 0.92]) tb(g, 0.2, 0.16, 0.07, tailMat, sx, 1.2, -9.98);
    wheels = addWheels(g, m, [
      [-1.02, 2.5], [1.02, 2.5],
      [-1.02, -1.1], [1.02, -1.1],
      [-1.02, -1.95], [1.02, -1.95],
      [-1.02, -6.0], [1.02, -6.0],
      [-1.02, -6.9], [1.02, -6.9],
      [-1.02, -7.85], [1.02, -7.85],
    ], 0.38, 0.28);
  } else if (type === 'bus') {
    const body = tb(g, 2.55, 2.35, 11.8, paint, 0, 1.95, 0);
    void body;
    // скруглённая крыша
    const roof = new THREE.Mesh(new THREE.CylinderGeometry(1.28, 1.28, 11.8, 16, 1, false, 0, Math.PI), paint);
    roof.rotation.z = Math.PI / 2;
    roof.rotation.y = Math.PI / 2;
    roof.position.set(0, 3.12, 0);
    roof.scale.set(1, 1, 0.28);
    g.add(roof);
    tb(g, 2.57, 0.95, 10.4, glass, 0, 2.62, 0.1); // окна по борту
    tb(g, 2.2, 1.3, 0.06, glass, 0, 2.5, 5.92); // лобовое
    tb(g, 2.56, 0.5, 11.82, dark, 0, 0.92, 0); // юбка
    tb(g, 2.0, 0.4, 0.1, headMat, 0, 1.35, 5.95);
    for (const sx of [-0.9, 0.9]) {
      tb(g, 0.34, 0.18, 0.08, headMat, sx, 1.1, 5.96);
      tb(g, 0.34, 0.18, 0.08, tailMat, sx, 1.1, -5.96);
      tb(g, 0.1, 0.06, 0.05, dark, sx * 1.36, 2.85, 5.4);
    }
    // дверные проёмы
    for (const z of [3.6, -0.4]) tb(g, 2.58, 1.5, 0.08, glass, 0, 1.9, z);
    wheels = addWheels(g, m, [
      [-1.08, 3.6], [1.08, 3.6],
      [-1.08, -3.4], [1.08, -3.4],
      [-1.08, -4.5], [1.08, -4.5],
    ], 0.46, 0.3);
  } else if (type === 'van') {
    tb(g, 2.12, 1.85, 5.0, paint, 0, 1.42, -0.4);
    tb(g, 2.06, 0.72, 1.1, paint, 0, 1.06, 2.35); // капот
    tb(g, 2.0, 0.72, 0.08, glass, 0, 1.86, 2.62, [-0.22, 0, 0]); // лобовое
    for (const sx of [-1, 1]) {
      tb(g, 0.1, 0.5, 1.5, glass, sx * 1.03, 1.94, 1.55);
      tb(g, 0.14, 0.12, 0.1, dark, sx * 1.14, 1.75, 2.3);
      tb(g, 0.28, 0.14, 0.08, headMat, sx * 0.72, 0.86, 2.9);
      tb(g, 0.28, 0.16, 0.08, tailMat, sx * 0.8, 1.0, -2.92);
    }
    tb(g, 2.0, 0.22, 0.16, dark, 0, 0.62, 2.94);
    tb(g, 2.04, 0.3, 0.14, dark, 0, 0.6, -2.94);
    wheels = addWheels(g, m, [[-0.92, 1.7], [0.92, 1.7], [-0.92, -1.6], [0.92, -1.6]], 0.34, 0.22);
  } else {
    tb(g, 1.84, 0.56, 4.32, paint, 0, 0.74, 0); // низ
    tb(g, 1.78, 0.3, 1.15, paint, 0, 1.08, 1.35); // капот
    tb(g, 1.7, 0.66, 2.2, paint, 0, 1.16, -0.35); // салон
    tb(g, 1.66, 0.44, 0.9, paint, 0, 1.18, -2.0); // багажник
    tb(g, 1.66, 0.42, 2.1, glass, 0, 1.24, -0.35);
    tb(g, 1.62, 0.62, 0.08, glass, 0, 1.2, 0.86, [-0.55, 0, 0]); // лобовое
    tb(g, 1.6, 0.5, 0.08, glass, 0, 1.2, -1.55, [0.5, 0, 0]); // заднее
    for (const sx of [-1, 1]) {
      tb(g, 0.16, 0.09, 0.1, dark, sx * 0.92, 1.02, 0.9);
      tb(g, 0.3, 0.16, 0.06, headMat, sx * 0.66, 0.82, 2.16);
      tb(g, 0.32, 0.14, 0.06, tailMat, sx * 0.66, 0.86, -2.16);
    }
    tb(g, 1.86, 0.2, 0.16, dark, 0, 0.55, 2.16);
    tb(g, 1.86, 0.2, 0.16, dark, 0, 0.55, -2.16);
    wheels = addWheels(g, m, [[-0.86, 1.32], [0.86, 1.32], [-0.86, -1.42], [0.86, -1.42]], 0.33, 0.22);
  }

  // Габариты: подсветка номерного знака и «усы» сзади.
  if (type !== 'car') {
    const plate = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.12), new THREE.MeshStandardMaterial({ color: 0xf0f0e6, roughness: 0.5 }));
    plate.position.set(0, 0.62, type === 'truck' ? -9.99 : type === 'bus' ? -6.0 : -2.97);
    plate.rotation.y = Math.PI;
    g.add(plate);
  }

  g.userData.wheels = wheels;
  g.userData.headMat = headMat;
  g.userData.tailMat = tailMat;
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
      // Кузов машины статичен — склеиваем, крутятся только колёса.
      mergeStatic(mesh, mesh.userData.wheels);
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
    v.lat = dir > 0 ? (this.rand() > 0.75 ? -1.85 : 1.85) : this.rand() > 0.5 ? 7.15 : 10.85;
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
