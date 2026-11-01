// Деревенский пейзаж вдоль трассы: живые изгороди, лесополосы, фермы, заборы.
// Всё это растёт не «как попало», а по сетке полей — именно сетка читается как
// обжитая Европа, а не как бесконечный газон с редкими ёлками.
import * as THREE from 'three';

/** Двускатная крыша: призма с коньком вдоль Z. Основание 1×1, высота 1. */
export function gableGeometry() {
  const p = [];
  const push = (...v) => p.push(...v);
  const A = [-0.5, 0, 0.5];
  const B = [0.5, 0, 0.5];
  const C = [0.5, 0, -0.5];
  const D = [-0.5, 0, -0.5];
  const E = [0, 1, 0.5];
  const F = [0, 1, -0.5];
  // передний и задний фронтоны
  push(...A, ...B, ...E);
  push(...C, ...D, ...F);
  // скаты
  push(...A, ...E, ...F, ...A, ...F, ...D);
  push(...B, ...C, ...F, ...B, ...F, ...E);
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(p, 3));
  geo.computeVertexNormals();
  return geo;
}

/**
 * @param {object} ctx
 * @param {object} ctx.route   трасса (`pointAt`, `marks`)
 * @param {number} ctx.s0      начало окна по дуге
 * @param {number} ctx.s1      конец окна по дуге
 * @param {THREE.Object3D} ctx.group контейнер трассы
 * @param {object} ctx.mats    материалы (см. materials.js)
 * @param {(s:number, lat:number)=>number} ctx.terrainOffset профиль рельефа
 * @param {() => void} [ctx.onEmpty]
 */
export function buildCountryside(ctx) {
  const { route, s0, s1, group, mats, terrainOffset } = ctx;
  const span = Math.max(1, s1 - s0);
  const rnd = (a, b) => {
    const x = Math.sin(a * 127.1 + b * 311.7) * 43758.5453;
    return x - Math.floor(x);
  };
  const pos = (ss, lat) => {
    const p = route.pointAt(ss);
    return {
      x: p.x + Math.cos(p.hdg) * lat,
      y: p.y + terrainOffset(ss, lat),
      z: p.z - Math.sin(p.hdg) * lat,
      hdg: p.hdg,
    };
  };
  const dummy = new THREE.Object3D();
  const color = new THREE.Color();

  // --- 1. Живые изгороди по межам. Европейское поле — это клетка в зелёной рамке.
  {
    const bodyGeo = new THREE.BoxGeometry(1.15, 1, 1);
    bodyGeo.translate(0, 0.5, 0);
    const hedgeMats = [mats.leaves[0], mats.leaves[2]];
    // Ближняя полоса отодвинута от обочины: изгородь не должна нависать над трассой.
    const bounds = [-62, -86, -118, -158, -208, -276, 64, 88, 120, 166, 224];
    const step = 5.2;
    const perBound = Math.ceil(span / step) + 4;
    const total = Math.ceil(perBound * bounds.length * 0.75);
    const hedges = [];
    let count = 0;
    // два инстанс-меша: тело изгороди и её тень-основание
    const bodies = new THREE.InstancedMesh(bodyGeo, hedgeMats[0], total);
    bodies.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(total * 3), 3);
    for (let bi = 0; bi < bounds.length; bi++) {
      const lat = bounds[bi];
      const start = Math.floor(s0 / step) * step;
      // изгородь идёт полосами: 60–200 м, потом прорыв (ворота, проезд).
      let runLeft = 0;
      for (let ss = start; ss < s1 + step; ss += step) {
        if (runLeft <= 0) {
          if (rnd(bi, Math.floor(ss / step)) > 0.42) continue;
          runLeft = 8 + Math.floor(rnd(bi + 1, Math.floor(ss / step)) * 20);
        }
        runLeft--;
        if (count >= total) break;
        const p = pos(ss, lat + (rnd(ss, bi) - 0.5) * 1.2);
        const h = 0.7 + rnd(ss * 0.7, bi + 3) * 0.85;
        dummy.position.set(p.x, p.y - 0.15, p.z);
        dummy.rotation.set(0, p.hdg + (rnd(ss, bi + 7) - 0.5) * 0.22, 0);
        dummy.scale.set(0.9 + rnd(ss, bi + 9) * 0.45, h, step * 1.06);
        dummy.updateMatrix();
        bodies.setMatrixAt(count, dummy.matrix);
        const hue = 0.24 + rnd(ss, bi + 11) * 0.07;
        color.setHSL(hue, 0.13 + rnd(ss, bi + 13) * 0.11, 0.6 + rnd(ss, bi + 17) * 0.2);
        bodies.setColorAt(count, color);
        count++;
      }
    }
    bodies.count = count;
    bodies.instanceMatrix.needsUpdate = true;
    if (bodies.instanceColor) bodies.instanceColor.needsUpdate = true;
    if (count) group.add(bodies);
  }

  // --- 2. Лесополосы и перелески: закрывают пустой горизонт, дают глубину.
  {
    const trunkGeo = new THREE.CylinderGeometry(0.14, 0.26, 2.6, 5);
    const crownGeo = new THREE.ConeGeometry(1.5, 4.2, 7);
    const blobGeo = new THREE.IcosahedronGeometry(1.7, 0);
    const cell = 78;
    const cellS0 = Math.floor(s0 / cell) - 1;
    const cellS1 = Math.ceil(s1 / cell) + 1;
    const latBands = [-420, -340, -260, -190, -150, -118, -92, -74, -58, 70, 100, 140, 190, 250, 330, 420];
    const list = [];
    for (let ci = cellS0; ci <= cellS1; ci++) {
      for (let li = 0; li < latBands.length; li++) {
        if (rnd(ci * 1.7, li * 3.1) < 0.62) continue;
        const trees = 6 + Math.floor(rnd(ci, li + 5) * 13);
        for (let t = 0; t < trees; t++) {
          const ss = ci * cell + rnd(ci + t, li) * cell;
          const lat = latBands[li] + (rnd(ci + t * 2, li) - 0.5) * 34;
          if (ss < s0 - 120 || ss > s1 + 120) continue;
          list.push({ ss, lat, seed: ci * 37 + li * 11 + t * 3 });
        }
      }
    }
    if (list.length) {
      const trunks = new THREE.InstancedMesh(trunkGeo, mats.bark, list.length);
      const pines = new THREE.InstancedMesh(crownGeo, mats.leaves[0], list.length);
      const blobs = new THREE.InstancedMesh(blobGeo, mats.leaves[1], list.length);
      pines.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(list.length * 3), 3);
      blobs.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(list.length * 3), 3);
      let pin = 0;
      let blo = 0;
      list.forEach((t, i) => {
        const p = pos(t.ss, t.lat);
        const s = 0.85 + rnd(t.seed, 3) * 0.9;
        dummy.position.set(p.x, p.y + 1.3 * s, p.z);
        dummy.rotation.set(0, rnd(t.seed, 5) * 6.28, 0);
        dummy.scale.setScalar(s);
        dummy.updateMatrix();
        trunks.setMatrixAt(i, dummy.matrix);
        const conifer = rnd(t.seed, 7) > 0.45;
        if (conifer) {
          dummy.position.set(p.x, p.y + (2.4 + 2.1) * s, p.z);
          dummy.scale.set(s * (0.9 + rnd(t.seed, 9) * 0.3), s * (0.9 + rnd(t.seed, 11) * 0.45), s);
          dummy.updateMatrix();
          pines.setMatrixAt(pin, dummy.matrix);
          color.setHSL(0.29 + rnd(t.seed, 13) * 0.05, 0.22 + rnd(t.seed, 15) * 0.14, 0.34 + rnd(t.seed, 17) * 0.16);
          pines.setColorAt(pin++, color);
        } else {
          dummy.position.set(p.x, p.y + 4.1 * s, p.z);
          dummy.scale.set(s * 1.25, s * 0.95, s * 1.2);
          dummy.rotation.set(rnd(t.seed, 19) * 0.3, rnd(t.seed, 21) * 6.28, rnd(t.seed, 23) * 0.3);
          dummy.updateMatrix();
          blobs.setMatrixAt(blo, dummy.matrix);
          color.setHSL(0.25 + rnd(t.seed, 25) * 0.06, 0.24 + rnd(t.seed, 27) * 0.16, 0.42 + rnd(t.seed, 29) * 0.16);
          blobs.setColorAt(blo++, color);
        }
      });
      pines.count = pin;
      blobs.count = blo;
      pines.instanceMatrix.needsUpdate = true;
      blobs.instanceMatrix.needsUpdate = true;
      if (pines.instanceColor) pines.instanceColor.needsUpdate = true;
      if (blobs.instanceColor) blobs.instanceColor.needsUpdate = true;
      trunks.instanceMatrix.needsUpdate = true;
      group.add(trunks, pines, blobs);
    }
  }

  // --- 3. Фермы: дом с двускатной крышей, амбар, силосная башня, забор.
  {
    const roofGeo = gableGeometry();
    const wallGeo = new THREE.BoxGeometry(1, 1, 1);
    const siloGeo = new THREE.CylinderGeometry(0.5, 0.5, 1, 12);
    const postGeo = new THREE.BoxGeometry(0.12, 1, 0.12);
    const wallMat = mats.wall;
    const houses = [];
    const barns = [];
    const silos = [];
    const posts = [];
    const farmSites = [];
    const stepF = 360;
    for (let ss = Math.floor(s0 / stepF) * stepF; ss < s1; ss += stepF) {
      const k = Math.floor(ss / stepF);
      if (rnd(k, 31) < 0.34) continue;
      const side = rnd(k, 33) > 0.5 ? -1 : 1;
      const lat = -side * (110 + rnd(k, 35) * 120);
      const p = pos(ss + rnd(k, 37) * 120, lat);
      const rot = p.hdg + (rnd(k, 39) - 0.5) * 0.7;
      farmSites.push({ p, rot, k });
      houses.push({ x: p.x, y: p.y, z: p.z, rot, w: 8 + rnd(k, 41) * 4, h: 4.4 + rnd(k, 43) * 1.6, d: 7 + rnd(k, 45) * 3 });
      barns.push({ x: p.x + Math.cos(rot) * 14, y: p.y, z: p.z - Math.sin(rot) * 14, rot: rot + 0.2, w: 12 + rnd(k, 47) * 8, h: 3.6 + rnd(k, 49) * 1.4, d: 7 + rnd(k, 51) * 5 });
      if (rnd(k, 53) > 0.45) silos.push({ x: p.x - Math.cos(rot) * 11, y: p.y, z: p.z + Math.sin(rot) * 11, r: 1.6 + rnd(k, 55), h: 9 + rnd(k, 57) * 7 });
      // забор вдоль дороги от фермы к трассе
      const postsN = 22;
      for (let i = 0; i < postsN; i++) {
        const t = i / postsN;
        const px = p.x - Math.cos(rot) * t * 46;
        const pz = p.z + Math.sin(rot) * t * 46;
        posts.push({ x: px, y: terrainOffset(ss, lat) + 0.5, z: pz });
      }
    }
    if (houses.length) {
      const walls = new THREE.InstancedMesh(wallGeo, wallMat, houses.length + barns.length);
      const roofs = new THREE.InstancedMesh(roofGeo, mats.roof, houses.length + barns.length);
      let wi = 0;
      const place = (o, roofColor) => {
        dummy.position.set(o.x, o.y + o.h / 2, o.z);
        dummy.rotation.set(0, o.rot, 0);
        dummy.scale.set(o.w, o.h, o.d);
        dummy.updateMatrix();
        walls.setMatrixAt(wi, dummy.matrix);
        // крыша: фронтоны смотрят на торцы дома
        dummy.position.set(o.x, o.y + o.h, o.z);
        dummy.rotation.set(0, o.rot, 0);
        dummy.scale.set(o.w * 1.1, 2.1 + o.w * 0.08, o.d * 1.06);
        dummy.updateMatrix();
        roofs.setMatrixAt(wi, dummy.matrix);
        if (roofColor) roofs.setColorAt(wi, roofColor);
        wi++;
      };
      for (const h of houses) place(h);
      const barnRoof = new THREE.Color(0x6d5a4c);
      for (const b of barns) place(b, barnRoof);
      walls.count = wi;
      roofs.count = wi;
      walls.instanceMatrix.needsUpdate = true;
      roofs.instanceMatrix.needsUpdate = true;
      if (roofs.instanceColor) roofs.instanceColor.needsUpdate = true;
      group.add(walls, roofs);
    }
    if (silos.length) {
      const siloMesh = new THREE.InstancedMesh(siloGeo, mats.concrete, silos.length);
      silos.forEach((s, i) => {
        dummy.position.set(s.x, s.y + s.h / 2, s.z);
        dummy.rotation.set(0, 0, 0);
        dummy.scale.set(s.r * 2, s.h, s.r * 2);
        dummy.updateMatrix();
        siloMesh.setMatrixAt(i, dummy.matrix);
      });
      siloMesh.instanceMatrix.needsUpdate = true;
      group.add(siloMesh);
    }
    if (posts.length) {
      const postMesh = new THREE.InstancedMesh(postGeo, mats.trunk, posts.length);
      posts.forEach((p, i) => {
        dummy.position.set(p.x, p.y, p.z);
        dummy.rotation.set(0, 0, 0);
        dummy.scale.set(1, 1.1, 1);
        dummy.updateMatrix();
        postMesh.setMatrixAt(i, dummy.matrix);
      });
      postMesh.instanceMatrix.needsUpdate = true;
      group.add(postMesh);
    }
  }
}
