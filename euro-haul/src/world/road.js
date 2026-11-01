// Дорога вокруг игрока: асфальт, разметка, отбойники, обочина, деревья, знаки и объекты трассы.
import * as THREE from 'three';
import { hash2, lerp, smoothstep, rng } from '../core/math.js';
import { materials, setNightIntensity, textures } from './materials.js';

import { CITY_BY_ID, COUNTRIES } from '../data/cities.js';

const STEP = 12;
const AHEAD = 2400;
const BEHIND = 380;

export function terrainOffset(s, lat) {
  const d = Math.abs(lat);
  const k = smoothstep((d - 5.5) / 34);
  const h =
    2.9 * Math.sin(s * 0.0031 + lat * 0.0068) +
    1.8 * Math.sin(s * 0.0081 - lat * 0.0102 + 1.3) +
    0.8 * Math.sin(s * 0.019 + lat * 0.021 + 2.2);
  const rise = d > 60 ? (d - 60) * 0.045 : 0;
  return k * (h + rise);
}

function stripGeometry(route, s0, s1, lats, opts = {}) {
  const { step = STEP, yOffset = 0, yFn = null, tile = 8 } = opts;
  const rows = Math.max(2, Math.ceil((s1 - s0) / step));
  const cols = lats.length;
  const pos = [];
  const uv = [];
  const idx = [];
  for (let r = 0; r <= rows; r++) {
    const s = s0 + ((s1 - s0) * r) / rows;
    const p = route.pointAt(s);
    const nx = Math.cos(p.hdg);
    const nz = -Math.sin(p.hdg);
    for (let c = 0; c < cols; c++) {
      const lat = lats[c];
      const extra = yFn ? yFn(s, lat) : 0;
      pos.push(p.x + nx * lat, p.y + yOffset + extra, p.z + nz * lat);
      // UV в метрах: текстура тайлится одинаково по ширине и длине.
      uv.push(lat / tile, s / tile);
    }
  }
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols - 1; c++) {
      const a = r * cols + c;
      const b = a + 1;
      const d = (r + 1) * cols + c;
      const e = d + 1;
      idx.push(a, d, b, b, d, e);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}

function verticalStrip(route, s0, s1, lat, y0, y1, step = STEP) {
  const rows = Math.max(2, Math.ceil((s1 - s0) / step));
  const pos = [];
  const idx = [];
  for (let r = 0; r <= rows; r++) {
    const s = s0 + ((s1 - s0) * r) / rows;
    const p = route.pointAt(s);
    const nx = Math.cos(p.hdg);
    const nz = -Math.sin(p.hdg);
    pos.push(p.x + nx * lat, p.y + y0, p.z + nz * lat);
    pos.push(p.x + nx * lat, p.y + y1, p.z + nz * lat);
  }
  for (let r = 0; r < rows; r++) {
    const a = r * 2;
    idx.push(a, a + 2, a + 1, a + 1, a + 2, a + 3);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}

function quadStrip(route, s0, s1, lat, width, y) {
  return stripGeometry(route, s0, s1, [lat - width / 2, lat + width / 2], { yOffset: y, step: Math.min(s1 - s0, 3) });
}

const SIGN_CACHE = new Map();

function signTexture(text, sub, color = '#1f5c3a') {
  const key = 'sign:' + text + sub + color;
  if (SIGN_CACHE.has(key)) return SIGN_CACHE.get(key);
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const c = canvas.getContext('2d');
  c.fillStyle = color;
  c.fillRect(0, 0, 512, 256);
  c.strokeStyle = '#f2f2ea';
  c.lineWidth = 10;
  c.strokeRect(14, 14, 484, 228);
  c.fillStyle = '#ffffff';
  c.textAlign = 'center';
  c.font = 'bold 62px system-ui, Arial';
  c.fillText(text, 256, sub ? 120 : 150, 460);
  if (sub) {
    c.font = 'bold 30px system-ui, Arial';
    c.fillStyle = '#dbe6dd';
    c.fillText(sub, 256, 178);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.userData.key = key;
  SIGN_CACHE.set(key, tex);
  return tex;
}

function cameraSignTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const c = canvas.getContext('2d');
  c.fillStyle = '#f7f5ec';
  c.beginPath();
  c.roundRect ? c.roundRect(10, 48, 236, 160, 14) : c.rect(10, 48, 236, 160);
  c.fill();
  c.strokeStyle = '#c8362c';
  c.lineWidth = 10;
  c.beginPath();
  c.roundRect ? c.roundRect(16, 54, 224, 148, 12) : c.rect(16, 54, 224, 148);
  c.stroke();
  c.fillStyle = '#2a2f33';
  c.fillRect(44, 106, 84, 58);
  c.beginPath();
  c.moveTo(128, 118);
  c.lineTo(176, 96);
  c.lineTo(176, 174);
  c.lineTo(128, 152);
  c.closePath();
  c.fill();
  c.fillStyle = '#c8362c';
  c.font = 'bold 30px system-ui, Arial';
  c.textAlign = 'center';
  c.fillText('ФОТО', 128, 210);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function speedSignTexture(limit) {
  const key = 'speed:' + limit;
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const c = canvas.getContext('2d');
  c.clearRect(0, 0, 256, 256);
  c.fillStyle = '#f7f5ec';
  c.beginPath();
  c.arc(128, 128, 118, 0, Math.PI * 2);
  c.fill();
  c.lineWidth = 26;
  c.strokeStyle = '#c8362c';
  c.beginPath();
  c.arc(128, 128, 105, 0, Math.PI * 2);
  c.stroke();
  c.fillStyle = '#1e1e1c';
  c.font = 'bold 120px system-ui, Arial';
  c.textAlign = 'center';
  c.textBaseline = 'middle';
  c.fillText(String(limit), 128, 136);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export class RoadWorld {
  constructor(scene, route, depots = []) {
    this.scene = scene;
    this.route = route;
    this.depots = depots;
    this.group = new THREE.Group();
    this.group.name = 'road-world';
    scene.add(this.group);
    this.mats = materials();
    this.lastBuild = -1e9;
    this.signTex = new Map();
    this.railMat = this.mats.metal.clone();
    this.railMat.side = THREE.DoubleSide;
    this.railMat.__keep = true;
    this.weatherWetness = 0;
    this.night = 0;
    this.rebuild(0);
  }

  disposeChildren() {
    this.group.traverse((obj) => {
      if (obj.geometry) obj.geometry.dispose();
      if (obj.material && obj.material.dispose && !obj.material.__keep) {
        // Материалы из общего кэша не уничтожаем.
        const shared = Object.values(this.mats);
        if (!shared.includes(obj.material) && !Array.isArray(obj.material)) obj.material.dispose();
      }
    });
    this.group.clear();
  }

  update(s, dt) {
    if (Math.abs(s - this.lastBuild) > 300) this.rebuild(s);
    setNightIntensity(this.mats, this.night);
    const wet = this.weatherWetness;
    this.mats.asphalt.roughness = lerp(0.94, 0.42, wet);
    this.mats.asphalt.color.setHex(wet > 0.3 ? 0x7c8489 : 0x9aa0a4);
  }

  rebuildS(s) {
    return this.rebuild(s);
  }

  rebuild(s) {
    const route = this.route;
    this.lastBuild = s;
    this.disposeChildren();
    const s0 = Math.max(0, s - BEHIND);
    const s1 = Math.min(route.length - 1, s + AHEAD);
    if (s1 - s0 < 50) return;
    const m = this.mats;
    const add = (geo, mat) => {
      const mesh = new THREE.Mesh(geo, mat);
      mesh.matrixAutoUpdate = false;
      this.group.add(mesh);
      return mesh;
    };

    // --- Асфальт: своя проезжая часть, встречная, обочины, разделитель.
    add(stripGeometry(route, s0, s1, [-3.7, 3.7], { tile: 7 }), m.asphalt);
    add(stripGeometry(route, s0, s1, [-12.7, -5.3], { tile: 7 }), m.asphalt);
    add(stripGeometry(route, s0, s1, [3.7, 5.2], { tile: 7 }), m.asphalt);
    add(stripGeometry(route, s0, s1, [-14.2, -12.7], { tile: 7 }), m.asphalt);
    add(stripGeometry(route, s0, s1, [-5.3, -3.7], { yOffset: 0.14 }), m.concrete);

    // --- Разметка.
    const lineMat = m.whiteLine;
    const lineY = 0.035;
    // сплошные краевые
    add(stripGeometry(route, s0, s1, [3.52, 3.68], { yOffset: lineY }), lineMat);
    add(stripGeometry(route, s0, s1, [-3.68, -3.52], { yOffset: lineY }), lineMat);
    add(stripGeometry(route, s0, s1, [-12.62, -12.46], { yOffset: lineY }), lineMat);
    add(stripGeometry(route, s0, s1, [-5.54, -5.38], { yOffset: lineY }), lineMat);
    // прерывистая между полосами
    const dashStart = Math.floor(s0 / 9) * 9;
    for (let d = dashStart; d < s1; d += 9) {
      const a = Math.max(s0, d);
      const b = Math.min(s1, d + 3.2);
      if (b - a < 0.4) continue;
      add(quadStrip(route, a, b, 0, 0.15, lineY), lineMat);
      add(quadStrip(route, a, b, -9.0, 0.15, lineY), lineMat);
    }

    // --- Отбойники (правая обочина и разделитель).
    const railMat = this.railMat;
    // Отбойник: профиль из двух горизонтальных полос + стойки.
    add(verticalStrip(route, s0, s1, 5.35, 0.34, 0.62), railMat);
    add(verticalStrip(route, s0, s1, 5.35, 0.68, 0.9), railMat);
    add(verticalStrip(route, s0, s1, -4.45, 0.3, 0.58), railMat);
    add(verticalStrip(route, s0, s1, -4.45, 0.66, 0.9), railMat);
    add(verticalStrip(route, s0, s1, -14.35, 0.34, 0.62), railMat);
    add(verticalStrip(route, s0, s1, -14.35, 0.68, 0.9), railMat);
    const postGeo = new THREE.BoxGeometry(0.1, 1.0, 0.12);
    const postCount = Math.ceil((s1 - s0) / 4);
    const posts = new THREE.InstancedMesh(postGeo, m.darkMetal, Math.max(1, postCount));
    const pd = new THREE.Object3D();
    let pi = 0;
    for (let ps = Math.floor(s0 / 4) * 4; ps < s1 && pi < postCount; ps += 4) {
      const pp = route.pointAt(ps);
      for (const lat of [5.35, -4.45, -14.35]) {
        if (pi >= postCount) break;
        pd.position.set(pp.x + Math.cos(pp.hdg) * (lat + (lat > 0 ? 0.06 : -0.06)), pp.y + 0.42, pp.z - Math.sin(pp.hdg) * (lat + (lat > 0 ? 0.06 : -0.06)));
        pd.rotation.set(0, pp.hdg, 0);
        pd.updateMatrix();
        posts.setMatrixAt(pi++, pd.matrix);
      }
    }
    posts.count = pi;
    posts.instanceMatrix.needsUpdate = true;
    this.group.add(posts);

    // Столбики со светоотражателем по обочине.
    const markerGeo = new THREE.BoxGeometry(0.12, 0.9, 0.12);
    const markerMat = new THREE.MeshStandardMaterial({ color: 0xe8e6dc, roughness: 0.7, emissive: 0x333333 });
    const markerCount = Math.ceil((s1 - s0) / 26) * 2 + 2;
    const markers = new THREE.InstancedMesh(markerGeo, markerMat, markerCount);
    let mi = 0;
    for (let ms = Math.floor(s0 / 26) * 26; ms < s1 && mi < markerCount; ms += 26) {
      const pp = route.pointAt(ms);
      for (const lat of [5.9, -14.9]) {
        if (mi >= markerCount) break;
        pd.position.set(pp.x + Math.cos(pp.hdg) * lat, pp.y + 0.45, pp.z - Math.sin(pp.hdg) * lat);
        pd.rotation.set(0, pp.hdg, 0);
        pd.updateMatrix();
        markers.setMatrixAt(mi++, pd.matrix);
      }
    }
    markers.count = mi;
    markers.instanceMatrix.needsUpdate = true;
    this.group.add(markers);

    // --- Обочина и рельеф.
    const latsRight = [5.2, 9, 16, 30, 52, 88, 140, 210, 320, 470];
    // Слева lat убывает — разворачиваем порядок, иначе грани смотрят вниз и отсекаются.
    const latsLeft = [-470, -320, -210, -145, -95, -62, -40, -26, -18, -14.2];
    add(
      stripGeometry(route, s0, s1, latsRight, { yFn: (ss, la) => terrainOffset(ss, la) - 0.06, tile: 9 }),
      m.grass
    );
    add(
      stripGeometry(route, s0, s1, latsLeft, { yFn: (ss, la) => terrainOffset(ss, la) - 0.06, tile: 9 }),
      m.grassDark
    );

    // --- Деревья вдоль трассы.
    const treeCount = 150;
    const trunkGeo = new THREE.CylinderGeometry(0.16, 0.3, 2.6, 5);
    const crownGeo = new THREE.ConeGeometry(1.7, 4.2, 6);
    const trunks = new THREE.InstancedMesh(trunkGeo, m.trunk, treeCount);
    const crowns = new THREE.InstancedMesh(crownGeo, m.leaves[0], treeCount);
    crowns.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(treeCount * 3), 3);
    const dummy = new THREE.Object3D();
    const color = new THREE.Color();
    let placed = 0;
    const spacing = 11;
    const baseIndex = Math.floor(s0 / spacing);
    for (let i = 0; i < treeCount; i++) {
      const idx = baseIndex + i;
      const ss = idx * spacing + hash2(idx, 3) * 5;
      if (ss < s0 - 30 || ss > s1 + 30) continue;
      const side = hash2(idx, 7) > 0.5 ? 1 : -1;
      const dist = 12 + hash2(idx, 11) * 120;
      const lat = side * dist;
      const p = route.pointAt(ss);
      const y = p.y + terrainOffset(ss, lat) + 1.3;
      const scale = 0.7 + hash2(idx, 13) * 1.1;
      dummy.position.set(p.x + Math.cos(p.hdg) * lat, y, p.z - Math.sin(p.hdg) * lat);
      dummy.rotation.set(0, hash2(idx, 17) * 6.28, 0);
      dummy.scale.set(scale, scale, scale);
      dummy.updateMatrix();
      trunks.setMatrixAt(placed, dummy.matrix);
      dummy.position.y = y + 2.2 * scale;
      dummy.updateMatrix();
      crowns.setMatrixAt(placed, dummy.matrix);
      color.setHSL(0.25 + hash2(idx, 23) * 0.09, 0.35 + hash2(idx, 29) * 0.2, 0.3 + hash2(idx, 31) * 0.14);
      crowns.setColorAt(placed, color);
      placed++;
    }
    trunks.count = placed;
    crowns.count = placed;
    trunks.instanceMatrix.needsUpdate = true;
    crowns.instanceMatrix.needsUpdate = true;
    if (crowns.instanceColor) crowns.instanceColor.needsUpdate = true;
    this.group.add(trunks, crowns);

    // --- Фонарные столбы.
    const lampSpacing = 115;
    const lampStart = Math.floor(s0 / lampSpacing) * lampSpacing;
    for (let ls = lampStart; ls < s1; ls += lampSpacing) {
      const p = route.pointAt(ls);
      const lat = 6.6;
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.16, 9, 5), m.darkMetal);
      pole.position.set(p.x + Math.cos(p.hdg) * lat, p.y + 4.5, p.z - Math.sin(p.hdg) * lat);
      const arm = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.14, 0.14), m.darkMetal);
      arm.position.set(p.x + Math.cos(p.hdg) * (lat - 1.2), p.y + 8.9, p.z - Math.sin(p.hdg) * (lat - 1.2));
      arm.rotation.y = p.hdg;
      const head = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.18, 0.34), this.night > 0.3 ? m.lamp : m.lampOff);
      head.position.set(p.x + Math.cos(p.hdg) * (lat - 2.4), p.y + 8.8, p.z - Math.sin(p.hdg) * (lat - 2.4));
      head.rotation.y = p.hdg;
      this.group.add(pole, arm, head);
    }

    // --- Знаки и указатели.
    this.buildSigns(s0, s1);

    // --- Заправки и стоянки.
    for (const st of route.stations) {
      if (st.s < s0 - 80 || st.s > s1 + 80) continue;
      this.buildStation(st);
    }
    for (const rest of route.rests) {
      if (rest.s < s0 - 80 || rest.s > s1 + 80) continue;
      this.buildRest(rest);
    }
    this.buildCitiesNear(s0, s1);
    for (const depot of this.depots) {
      if (depot.s < s0 - 100 || depot.s > s1 + 100) continue;
      this.buildDepot(depot);
    }
  }

  buildDepot(depot) {
    const route = this.route;
    const p = route.pointAt(depot.s);
    const nx = Math.cos(p.hdg);
    const nz = -Math.sin(p.hdg);
    const group = new THREE.Group();
    const m = this.mats;
    const at = (lat, y) => new THREE.Vector3(p.x + nx * lat, p.y + y, p.z + nz * lat);
    // Склад ангарного типа.
    const hall = new THREE.Mesh(new THREE.BoxGeometry(26, 9, 34), m.wall);
    hall.position.copy(at(34, 4.5));
    hall.rotation.y = p.hdg;
    group.add(hall);
    const roof = new THREE.Mesh(new THREE.BoxGeometry(27, 0.8, 35), m.roofLight);
    roof.position.copy(at(34, 9.2));
    roof.rotation.y = p.hdg;
    group.add(roof);
    // Ворота.
    for (let i = -1; i <= 1; i++) {
      const gate = new THREE.Mesh(new THREE.BoxGeometry(6, 5.6, 0.4), m.darkMetal);
      gate.position.copy(at(21.1, 2.8)).add(new THREE.Vector3(i * 8, 0, 0).applyAxisAngle(new THREE.Vector3(0, 1, 0), p.hdg));
      gate.rotation.y = p.hdg;
      group.add(gate);
    }
    // Площадка и разметка.
    const yard = new THREE.Mesh(new THREE.BoxGeometry(30, 0.06, 26), m.concrete);
    yard.position.copy(at(18, 0.02));
    yard.rotation.y = p.hdg;
    group.add(yard);
    // Указатель.
    const signTex = signTexture(depot.label, depot.sub || '', depot.color || '#1f5c3a');
    const signMat = new THREE.MeshBasicMaterial({ map: signTex, transparent: true, side: THREE.DoubleSide });
    const sign = new THREE.Mesh(new THREE.PlaneGeometry(6.4, 3.2), signMat);
    sign.position.copy(at(12, 6.4));
    sign.rotation.y = p.hdg + Math.PI;
    group.add(sign);
    for (const dx of [-2.2, 2.2]) {
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 6.4, 6), m.darkMetal);
      post.position.copy(at(12, 3.2)).add(new THREE.Vector3(dx, 0, 0).applyAxisAngle(new THREE.Vector3(0, 1, 0), p.hdg));
      group.add(post);
    }
    // Световой столб-маркер на обочине.
    const beamMat = new THREE.MeshBasicMaterial({
      color: depot.color === '#1f5c3a' ? 0x49d7b0 : 0xf2b544,
      transparent: true,
      opacity: 0.22,
      depthWrite: false,
      side: THREE.DoubleSide,
    });
    const beam = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 1.6, 26, 12, 1, true), beamMat);
    beam.position.copy(at(6.4, 13));
    group.add(beam);
    const ring = new THREE.Mesh(
      new THREE.RingGeometry(2.3, 2.8, 24),
      new THREE.MeshBasicMaterial({ color: depot.color === '#1f5c3a' ? 0x49d7b0 : 0xf2b544, transparent: true, opacity: 0.8, side: THREE.DoubleSide })
    );
    ring.position.copy(at(4.6, 0.09));
    ring.rotation.x = -Math.PI / 2;
    group.add(ring);
    this.group.add(group);
  }

  buildSigns(s0, s1) {
    const route = this.route;
    const addSign = (s, lat, tex, w = 4.4, h = 2.2, y = 4.6) => {
      const p = route.pointAt(s);
      const mat = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.7, transparent: true });
      const panel = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat);
      panel.position.set(p.x + Math.cos(p.hdg) * lat, p.y + y, p.z - Math.sin(p.hdg) * lat);
      panel.rotation.y = p.hdg + Math.PI;
      const postGeo = new THREE.CylinderGeometry(0.09, 0.09, y, 5);
      const post1 = new THREE.Mesh(postGeo, this.mats.darkMetal);
      post1.position.set(panel.position.x - Math.cos(p.hdg) * (w * 0.35), p.y + y / 2, panel.position.z + Math.sin(p.hdg) * (w * 0.35));
      const post2 = post1.clone();
      post2.position.set(panel.position.x + Math.cos(p.hdg) * (w * 0.35), p.y + y / 2, panel.position.z - Math.sin(p.hdg) * (w * 0.35));
      this.group.add(panel, post1, post2);
    };
    for (const mark of route.marks) {
      const dist = mark.s - s0;
      if (dist > 0 && dist < s1 - s0) {
        const tex = signTexture(mark.name, COUNTRIES[mark.country]?.name || '', '#1f5c3a');
        addSign(mark.s - 420, 7.8, tex, 5.6, 2.6, 5.2);
      }
    }
    // Границы стран.
    let prevCountry = null;
    for (let i = 0; i < route.samples.length; i += 3) {
      const sm = route.samples[i];
      if (sm.s < s0 - 600 || sm.s > s1) continue;
      const c = sm.country;
      if (c && prevCountry && c !== prevCountry && sm.s > s0) {
        const meta = COUNTRIES[c];
        const tex = signTexture('ГРАНИЦА', (meta?.flag || '') + ' ' + (meta?.name || c), '#1c3f6e');
        addSign(sm.s, 8.6, tex, 4.6, 2.3, 4.4);
      }
      prevCountry = c || prevCountry;
    }

    // Ограничения скорости на городских участках и работах.
    const checkpoints = [];
    for (const z of route.zones) {
      checkpoints.push({ s: z.from - 90, limit: 50 });
      checkpoints.push({ s: z.to + 90, limit: 80 });
    }
    for (const w of route.works) {
      checkpoints.push({ s: w.from - 110, limit: 30 });
      checkpoints.push({ s: w.to + 40, limit: 80 });
    }
    if (!this.cameraSign) this.cameraSign = cameraSignTexture();
    for (const cp of checkpoints) {
      if (cp.s < s0 || cp.s > s1) continue;
      const tex = this.signTextures().speed.get(cp.limit) || this.speedTexture(cp.limit);
      addSign(cp.s, 7.0, tex, 1.7, 1.7, 3.4);
      if (cp.limit < 80) addSign(cp.s - 220, 7.0, this.cameraSign, 2.0, 2.0, 3.6);
    }
  }

  signTextures() {
    if (!this.speedSigns) this.speedSigns = new Map();
    return { speed: this.speedSigns };
  }

  speedTexture(limit) {
    const tex = speedSignTexture(limit);
    this.speedSigns.set(limit, tex);
    return tex;
  }

  buildStation(st) {
    const route = this.route;
    const p = route.pointAt(st.s);
    const nx = Math.cos(p.hdg);
    const nz = -Math.sin(p.hdg);
    const pos = (lat, y) => new THREE.Vector3(p.x + nx * lat, p.y + y, p.z + nz * lat);
    const group = new THREE.Group();
    const m = this.mats;
    const canopy = new THREE.Mesh(new THREE.BoxGeometry(16, 0.7, 11), m.concrete);
    canopy.position.copy(pos(st.side * 20, 6.2));
    canopy.rotation.y = p.hdg;
    const columnGeo = new THREE.CylinderGeometry(0.22, 0.22, 6.2, 8);
    for (const dx of [-6, 6]) {
      for (const dz of [-4, 4]) {
        const col = new THREE.Mesh(columnGeo, m.metal);
        const off = new THREE.Vector3(dx, 3.1, dz).applyAxisAngle(new THREE.Vector3(0, 1, 0), p.hdg);
        col.position.copy(pos(st.side * 20, 0)).add(off);
        group.add(col);
      }
    }
    group.add(canopy);
    const kiosk = new THREE.Mesh(new THREE.BoxGeometry(7, 3.4, 5), m.wall);
    kiosk.position.copy(pos(st.side * 32, 1.7));
    kiosk.rotation.y = p.hdg;
    group.add(kiosk);
    for (const dz of [-2.5, 2.5]) {
      const pump = new THREE.Mesh(new THREE.BoxGeometry(1.1, 1.9, 0.7), m.redLight);
      pump.position.copy(pos(st.side * 20, 0.95)).add(new THREE.Vector3(0, 0, dz).applyAxisAngle(new THREE.Vector3(0, 1, 0), p.hdg));
      pump.rotation.y = p.hdg;
      group.add(pump);
    }
    if (st.side > 0) {
      const fsSign = new THREE.Mesh(
        new THREE.PlaneGeometry(3.2, 1.6),
        new THREE.MeshBasicMaterial({ map: signTexture('АЗС', st.brand, '#12395f'), transparent: true, side: THREE.DoubleSide })
      );
      fsSign.position.copy(pos(7.0, 3.2));
      fsSign.rotation.y = p.hdg + Math.PI;
      group.add(fsSign);
      const fsPost = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 3.2, 5), m.darkMetal);
      fsPost.position.copy(pos(7.0, 1.6));
      group.add(fsPost);
    }
    const brand = new THREE.Mesh(new THREE.PlaneGeometry(10, 2.4), new THREE.MeshBasicMaterial({ map: signTexture(st.brand, '', '#12395f'), transparent: true }));
    brand.position.copy(pos(st.side * 20, 7.1));
    brand.rotation.y = p.hdg + Math.PI;
    group.add(brand);
    this.group.add(group);
  }

  buildRest(rest) {
    const route = this.route;
    const p = route.pointAt(rest.s);
    const nx = Math.cos(p.hdg);
    const nz = -Math.sin(p.hdg);
    const group = new THREE.Group();
    const park = new THREE.Mesh(new THREE.BoxGeometry(30, 0.08, 42), this.mats.concrete);
    park.position.set(p.x + nx * rest.side * 30, p.y + 0.03, p.z + nz * rest.side * 30);
    park.rotation.y = p.hdg;
    group.add(park);
    const hut = new THREE.Mesh(new THREE.BoxGeometry(9, 3.6, 6), this.mats.wall);
    hut.position.set(p.x + nx * rest.side * 52, p.y + 1.8, p.z + nz * rest.side * 52);
    hut.rotation.y = p.hdg;
    group.add(hut);
    const sign = new THREE.Mesh(new THREE.PlaneGeometry(4, 2), new THREE.MeshBasicMaterial({ map: signTexture('P', 'ЗОНА ОТДЫХА', '#1b4a74'), transparent: true }));
    sign.position.set(p.x + nx * rest.side * 52, p.y + 5.4, p.z + nz * rest.side * 52);
    sign.rotation.y = p.hdg + Math.PI;
    group.add(sign);
    this.group.add(group);
  }

  buildCitiesNear(s0, s1) {
    const route = this.route;
    const m = this.mats;
    const skylineTex = textures.skyline();
    m.skyline = m.skyline || new THREE.MeshBasicMaterial({
      map: skylineTex,
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
      opacity: 0.9,
    });
    for (const mark of route.marks) {
      if (mark.s < s0 - 2000 || mark.s > s1 + 2500) continue;
      const around = Math.min(1500, Math.max(500, 420 * (CITY_BY_ID.get(mark.id)?.size || 1)));
      const r = rng(mark.s * 31 + 7);
      const count = Math.round(around / 46);
      const wallGeo = new THREE.BoxGeometry(1, 1, 1);
      const walls = new THREE.InstancedMesh(wallGeo, m.building, count);
      const roofs = new THREE.InstancedMesh(wallGeo, m.roofLight, count);
      const dummy = new THREE.Object3D();
      const color = new THREE.Color();
      let placed = 0;
      for (let i = 0; i < count; i++) {
        const ds = (r() - 0.35) * around;
        const ss = mark.s + ds;
        if (ss < 0 || ss > route.length) continue;
        const side = r() > 0.5 ? 1 : -1;
        const lat = side * (16 + r() * 95);
        const p = route.pointAt(ss);
        const w = 7 + r() * 20;
        const h = 7 + r() * (26 + (CITY_BY_ID.get(mark.id)?.size || 1) * 18);
        const d = 7 + r() * 20;
        const y = p.y + terrainOffset(ss, lat);
        dummy.position.set(p.x + Math.cos(p.hdg) * lat, y + h / 2, p.z - Math.sin(p.hdg) * lat);
        dummy.rotation.set(0, p.hdg + (r() - 0.5) * 0.4, 0);
        dummy.scale.set(w, h, d);
        dummy.updateMatrix();
        walls.setMatrixAt(placed, dummy.matrix);
        dummy.position.y = y + h + 0.6;
        dummy.scale.set(w * 1.04, 1.2, d * 1.04);
        dummy.updateMatrix();
        roofs.setMatrixAt(placed, dummy.matrix);
        color.setHSL(0.09 + r() * 0.05, 0.1 + r() * 0.2, 0.55 + r() * 0.25);
        walls.setColorAt(placed, color);
        placed++;
      }
      // Дальний силуэт города.
      if ((CITY_BY_ID.get(mark.id)?.size || 1) >= 2) {
        for (const side of [-1, 1]) {
          const sk = new THREE.Mesh(new THREE.PlaneGeometry(900, 120), m.skyline);
          const sp = route.pointAt(mark.s + side * 420);
          sk.position.set(sp.x + Math.cos(sp.hdg) * side * 260, sp.y + 46, sp.z - Math.sin(sp.hdg) * side * 260);
          sk.rotation.y = sp.hdg + Math.PI / 2;
          this.group.add(sk);
        }
      }
      walls.count = placed;
      roofs.count = placed;
      walls.instanceMatrix.needsUpdate = true;
      roofs.instanceMatrix.needsUpdate = true;
      if (walls.instanceColor) walls.instanceColor.needsUpdate = true;
      this.group.add(walls, roofs);
    }
  }

  dispose() {
    this.disposeChildren();
    this.scene.remove(this.group);
  }
}
