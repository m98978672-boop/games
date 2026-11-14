/* Рельеф: чанки 100 × 100 м, генерация в воркерах, сборка геометрии в главном потоке.
   В кадре ничего не считается — только рисуется (R-36.15). */
import * as THREE from 'three';
import { WORLD, HALF, generateChunk } from './heightfield.js';
import { terrainColor } from './palette.js';

const CHUNK = WORLD.chunkSize;
const CONTOUR_STEP = 5;

export class Terrain {
  constructor(scene) {
    this.scene = scene;
    this.group = new THREE.Group();
    this.group.name = 'terrain';
    scene.add(this.group);
    this.chunks = new Map();
    this.contourGroup = new THREE.Group();
    this.contourGroup.name = 'contours';
    this.group.add(this.contourGroup);
    this.colorsOn = true;
  }

  key(cx, cy) { return cx + ':' + cy; }

  /* ---------- воркеры ---------- */
  makePool() {
    if (typeof Worker === 'undefined' || location.protocol === 'file:') return null;
    try {
      const url = new URL('terrain-worker.min.js', document.baseURI);
      const count = Math.max(1, Math.min(4, (navigator.hardwareConcurrency || 4) - 1));
      const workers = [];
      for (let i = 0; i < count; i++) {
        const w = new Worker(url.toString());
        w.onerror = () => {};
        workers.push(w);
      }
      return workers;
    } catch (e) {
      return null;
    }
  }

  async init(onProgress) {
    const total = WORLD.chunks * WORLD.chunks;
    let done = 0;
    const report = () => { done++; if (onProgress) onProgress(done, total); };

    const pool = this.makePool();
    const jobs = [];
    for (let cy = 0; cy < WORLD.chunks; cy++) {
      for (let cx = 0; cx < WORLD.chunks; cx++) jobs.push({ cx, cy });
    }

    const handle = (job) => {
      this.addChunk(job);
      report();
    };

    if (pool && pool.length) {
      await new Promise((resolve) => {
        let next = 0, active = 0;
        const run = (w) => {
          if (next >= jobs.length) { if (active === 0) resolve(); return; }
          const job = jobs[next++];
          active++;
          w.onmessage = (e) => {
            handle(e.data);
            active--;
            run(w);
          };
          w.postMessage(job);
        };
        // если воркер не ответил за 8 с — падаем на локальную генерацию
        const failsafe = setTimeout(() => {
          if (next < jobs.length) {
            console.warn('воркеры медленные — досчитываю локально');
            while (next < jobs.length) handle(localChunk(jobs[next++]));
            resolve();
          }
        }, 8000);
        pool.forEach((w) => run(w));
        const check = setInterval(() => {
          if (next >= jobs.length && active === 0) { clearInterval(check); clearTimeout(failsafe); resolve(); }
        }, 30);
      });
    } else {
      for (const job of jobs) {
        handle(localChunk(job));
        await new Promise((r) => setTimeout(r, 0));
      }
    }

    this.buildWater();
    return this;
  }

  /* ---------- геометрия чанка ---------- */
  addChunk(job) {
    const { cx, cy, heights, n, cell, x0, z0, min, max } = job;
    this.chunks.set(this.key(cx, cy), { cx, cy, heights, n, cell, x0, z0, min, max });

    const verts = n * n;
    const pos = new Float32Array(verts * 3);
    const nor = new Float32Array(verts * 3);
    const col = new Float32Array(verts * 3);

    for (let j = 0; j < n; j++) {
      for (let i = 0; i < n; i++) {
        const k = j * n + i;
        const h = heights[k];
        pos[k * 3] = x0 + i * cell;
        pos[k * 3 + 1] = h;
        pos[k * 3 + 2] = z0 + j * cell;

        const hL = heights[j * n + Math.max(0, i - 1)];
        const hR = heights[j * n + Math.min(n - 1, i + 1)];
        const hU = heights[Math.max(0, j - 1) * n + i];
        const hD = heights[Math.min(n - 1, j + 1) * n + i];
        let nx = (hL - hR) / (2 * cell), ny = 1, nz = (hU - hD) / (2 * cell);
        const len = Math.hypot(nx, ny, nz) || 1;
        nx /= len; ny /= len; nz /= len;
        nor[k * 3] = nx; nor[k * 3 + 1] = ny; nor[k * 3 + 2] = nz;

        const rgb = terrainColor(h, 1 - ny, WORLD.waterLevel);
        col[k * 3] = rgb[0]; col[k * 3 + 1] = rgb[1]; col[k * 3 + 2] = rgb[2];
      }
    }

    const idx = new Uint32Array((n - 1) * (n - 1) * 6);
    let p = 0;
    for (let j = 0; j < n - 1; j++) {
      for (let i = 0; i < n - 1; i++) {
        const a = j * n + i, b = a + 1, c = a + n, d = c + 1;
        idx[p++] = a; idx[p++] = c; idx[p++] = b;
        idx[p++] = b; idx[p++] = c; idx[p++] = d;
      }
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('normal', new THREE.BufferAttribute(nor, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
    geo.setIndex(new THREE.BufferAttribute(idx, 1));
    geo.computeBoundingSphere();

    const mat = new THREE.MeshLambertMaterial({ vertexColors: this.colorsOn });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.receiveShadow = true;
    mesh.castShadow = false;
    mesh.name = 'chunk ' + cx + ':' + cy;
    this.group.add(mesh);

    this.contourGroup.add(this.buildContours(job));
    return mesh;
  }

  buildContours({ cx, cy, heights, n, cell, x0, z0, min, max }) {
    const pts = [];
    const at = (i, j) => heights[j * n + i];
    const start = Math.ceil(Math.max(min, 0) / CONTOUR_STEP) * CONTOUR_STEP;
    for (let level = start; level <= max; level += CONTOUR_STEP) {
      for (let j = 0; j < n - 1; j++) {
        for (let i = 0; i < n - 1; i++) {
          const hs = [at(i, j), at(i + 1, j), at(i + 1, j + 1), at(i, j + 1)];
          const cs = [[i, j], [i + 1, j], [i + 1, j + 1], [i, j + 1]];
          const cross = [];
          for (let e = 0; e < 4; e++) {
            const a = e, b = (e + 1) % 4;
            if ((hs[a] - level) * (hs[b] - level) < 0) {
              const t = (level - hs[a]) / (hs[b] - hs[a]);
              cross.push({
                x: x0 + (cs[a][0] + (cs[b][0] - cs[a][0]) * t) * cell,
                z: z0 + (cs[a][1] + (cs[b][1] - cs[a][1]) * t) * cell
              });
            }
          }
          if (cross.length >= 2) {
            pts.push(cross[0].x, level + 0.12, cross[0].z, cross[1].x, level + 0.12, cross[1].z);
          }
        }
      }
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(pts), 3));
    const mat = new THREE.LineBasicMaterial({ color: 0x2b2b2b, transparent: true, opacity: 0.28 });
    const lines = new THREE.LineSegments(geo, mat);
    lines.name = 'contours ' + cx + ':' + cy;
    return lines;
  }

  buildWater() {
    const size = WORLD.chunks * CHUNK;
    const geo = new THREE.PlaneGeometry(size, size, 1, 1);
    geo.rotateX(-Math.PI / 2);
    const mat = new THREE.MeshLambertMaterial({
      color: 0x3f86a3, transparent: true, opacity: 0.55, depthWrite: false
    });
    const water = new THREE.Mesh(geo, mat);
    water.position.y = WORLD.waterLevel;
    water.name = 'water';
    this.group.add(water);
    this.water = water;
  }

  /* ---------- высота в любой точке ---------- */
  heightAtWorld(x, z) {
    const cx = Math.floor((x + HALF) / CHUNK);
    const cy = Math.floor((z + HALF) / CHUNK);
    const c = this.chunks.get(this.key(cx, cy));
    if (!c) return WORLD.waterLevel;
    const fx = (x - c.x0) / c.cell, fz = (z - c.z0) / c.cell;
    const i = Math.max(0, Math.min(c.n - 2, Math.floor(fx)));
    const j = Math.max(0, Math.min(c.n - 2, Math.floor(fz)));
    const u = Math.max(0, Math.min(1, fx - i)), v = Math.max(0, Math.min(1, fz - j));
    const h = (a, b) => c.heights[b * c.n + a];
    return (h(i, j) * (1 - u) + h(i + 1, j) * u) * (1 - v) + (h(i, j + 1) * (1 - u) + h(i + 1, j + 1) * u) * v;
  }

  setContours(visible) { this.contourGroup.visible = visible; }
  setColors(on) {
    this.colorsOn = on;
    for (const child of this.group.children) {
      if (child.isMesh && child.material && child.material.vertexColors !== undefined) {
        child.material.vertexColors = on;
        child.material.needsUpdate = true;
      }
    }
  }
  setWater(visible) { if (this.water) this.water.visible = visible; }
}

function localChunk(job) {
  return generateChunk(job.cx, job.cy);
}
