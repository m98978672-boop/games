// Мини-рендерер без WebGL: собирает треугольники сцены, проецирует их камерой
// и заливает плоским цветом с z-буфером, затем пишет PNG. Нужен, чтобы глазами
// проверять геометрию моделей в песочнице, где нет ни браузера, ни растеризатора SVG.
import { JSDOM } from 'jsdom';
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));

// --- заглушки DOM и канваса (текстуры и canvas в моделях создаются через него).
const dom = new JSDOM('<!doctype html><html><body></body></html>', { pretendToBeVisual: true });
global.window = dom.window;
global.document = dom.window.document;
Object.defineProperty(global, 'navigator', { value: dom.window.navigator, configurable: true });
global.HTMLCanvasElement = dom.window.HTMLCanvasElement;
global.performance = dom.window.performance;
function fakeContext() {
  const gradient = { addColorStop() {} };
  const target = {
    canvas: { width: 512, height: 512 },
    createLinearGradient: () => gradient,
    createRadialGradient: () => gradient,
    createPattern: () => null,
    measureText: () => ({ width: 10 }),
    getImageData: (x, y, w, h) => ({ data: new Uint8ClampedArray(Math.max(1, w * h * 4)), width: w, height: h }),
    createImageData: (w, h) => ({ data: new Uint8ClampedArray(Math.max(1, w * h * 4)), width: w, height: h }),
    putImageData() {},
  };
  return new Proxy(target, {
    get(obj, prop) {
      if (prop in obj) return obj[prop];
      if (typeof prop === 'string') {
        obj[prop] = () => undefined;
        return obj[prop];
      }
      return undefined;
    },
    set(obj, prop, v) {
      obj[prop] = v;
      return true;
    },
  });
}
dom.window.HTMLCanvasElement.prototype.getContext = () => fakeContext();

const THREE = await import('three');
const { TruckView } = await import('../src/world/truck3d.js');
const { TRUCK_MODELS, PAINT_COLORS } = await import('../src/data/trucks.js');

// ------------------------------------------------------------------ PNG
const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();
function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}
function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([len, body, crc]);
}
function writePng(file, w, h, rgb) {
  const raw = Buffer.alloc((w * 3 + 1) * h);
  for (let y = 0; y < h; y++) {
    raw[y * (w * 3 + 1)] = 0;
    rgb.copy(raw, y * (w * 3 + 1) + 1, y * w * 3, (y + 1) * w * 3);
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0);
  ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8;
  ihdr[9] = 2;
  const png = Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', zlib.deflateSync(raw, { level: 6 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
  fs.writeFileSync(file, png);
}

// ------------------------------------------------------------------ рендер
const W = 720;
const H = 480;

function renderTruck(modelId, paintHex, views, outName, withTrailer = true, onlyGlass = false, trailerType = 'curtain') {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x9fb4c4);
  scene.add(new THREE.HemisphereLight(0xffffff, 0x445533, 2));
  const sun = new THREE.DirectionalLight(0xffffff, 2.2);
  sun.position.set(-60, 120, 90);
  scene.add(sun);

  const view = new TruckView(scene, paintHex, modelId);
  view.setInteriorVisible(false);
  if (onlyGlass) {
    scene.traverse((o) => {
      if (!o.isMesh) return;
      const mat = Array.isArray(o.material) ? o.material[0] : o.material;
      o.visible = mat === view.mats.glass;
    });
  }
  if (withTrailer || trailerType) view.buildTrailer(trailerType, 'NordTrans');
  else {
    view.trailerGroup.visible = false;
  }
  scene.updateMatrixWorld(true);

  const camera = new THREE.PerspectiveCamera(38, W / H, 0.5, 800);
  const baseTarget = new THREE.Vector3(0, 1.9, 0.5);

  const cols = views.length;
  const rows = 1;
  const outW = W * cols;
  const outH = H * rows;
  const rgb = Buffer.alloc(outW * outH * 3, 0x88);
  const light = new THREE.Vector3(-0.45, 0.78, 0.44).normalize();

  views.forEach((v, vi) => {
    camera.position.set(v.pos[0], v.pos[1], v.pos[2]);
    const target = v.target ? new THREE.Vector3(v.target[0], v.target[1], v.target[2]) : baseTarget;
    camera.lookAt(target);
    camera.updateProjectionMatrix();
    camera.updateMatrixWorld(true);
    const img = trace(scene, camera, light);
    // копируем в общий лист
    for (let y = 0; y < H; y++) {
      const src = y * W * 3;
      const dst = (y * outW + vi * W) * 3;
      img.copy(rgb, dst, src, src + W * 3);
    }
  });
  writePng(path.join(root, 'tests', outName), outW, outH, rgb);
  console.log('·', outName, `${outW}x${outH}`);
}

function trace(scene, camera, light) {
  const rgb = Buffer.alloc(W * H * 3, 0x9f);
  for (let i = 0; i < W * H; i++) {
    rgb[i * 3] = 0x9f;
    rgb[i * 3 + 1] = 0xb4;
    rgb[i * 3 + 2] = 0xc4;
  }
  // В пространстве камеры ближние точки имеют БОЛЬШИЙ z (ближе к нулю),
  // поэтому в буфере храним максимум, а не минимум.
  const depth = new Float32Array(W * H).fill(-Infinity);
  const a = new THREE.Vector3();
  const b = new THREE.Vector3();
  const c = new THREE.Vector3();
  const n = new THREE.Vector3();
  const e1 = new THREE.Vector3();
  const e2 = new THREE.Vector3();
  const view = new THREE.Matrix4().copy(camera.matrixWorldInverse);
  const proj = camera.projectionMatrix;

  const tris = [];
  scene.traverse((o) => {
    if (!o.isMesh) return;
    for (let n = o; n; n = n.parent) if (!n.visible) return;
    const geo = o.geometry;
    if (!geo?.attributes?.position) return;
    const pos = geo.attributes.position;
    const idx = geo.index;
    const mat = Array.isArray(o.material) ? o.material[0] : o.material;
    if (!mat) return;
    const col = mat.color || new THREE.Color(0.6, 0.6, 0.62);
    const emissive = mat.emissiveIntensity > 0.6 && mat.emissive ? 1 : 0;
    const count = idx ? idx.count : pos.count;
    for (let i = 0; i < count; i += 3) {
      const i0 = idx ? idx.getX(i) : i;
      const i1 = idx ? idx.getX(i + 1) : i + 1;
      const i2 = idx ? idx.getX(i + 2) : i + 2;
      a.fromBufferAttribute(pos, i0).applyMatrix4(o.matrixWorld);
      b.fromBufferAttribute(pos, i1).applyMatrix4(o.matrixWorld);
      c.fromBufferAttribute(pos, i2).applyMatrix4(o.matrixWorld);
      e1.copy(b).sub(a);
      e2.copy(c).sub(a);
      n.copy(e1).cross(e2).normalize();
      const shade = 0.34 + 0.66 * Math.max(0, Math.abs(n.dot(light)));
      const r = Math.min(255, Math.round(255 * Math.pow(col.r * shade, 1 / 2.2)));
      const g = Math.min(255, Math.round(255 * Math.pow(col.g * shade, 1 / 2.2)));
      const bl = Math.min(255, Math.round(255 * Math.pow(col.b * shade, 1 / 2.2)));
      for (const p of [a, b, c]) p.applyMatrix4(view);
      tris.push([
        [a.x, a.y, a.z, (a.clone().applyMatrix4(proj).x + 1) / 2 * W, (1 - a.clone().applyMatrix4(proj).y) / 2 * H],
        [b.x, b.y, b.z, (b.clone().applyMatrix4(proj).x + 1) / 2 * W, (1 - b.clone().applyMatrix4(proj).y) / 2 * H],
        [c.x, c.y, c.z, (c.clone().applyMatrix4(proj).x + 1) / 2 * W, (1 - c.clone().applyMatrix4(proj).y) / 2 * H],
        [r, g, bl, emissive],
      ]);
    }
  });

  const EPS = 0.05;
  for (const [p0, p1, p2, color] of tris) {
    // Отсечение по ближней плоскости: если хоть одна вершина за камерой — пропуск.
    if (p0[2] > -EPS || p1[2] > -EPS || p2[2] > -EPS) continue;
    if (Math.min(p0[3], p1[3], p2[3]) > W || Math.max(p0[3], p1[3], p2[3]) < 0) continue;
    if (Math.min(p0[4], p1[4], p2[4]) > H || Math.max(p0[4], p1[4], p2[4]) < 0) continue;
    const minX = Math.max(0, Math.floor(Math.min(p0[3], p1[3], p2[3])));
    const maxX = Math.min(W - 1, Math.ceil(Math.max(p0[3], p1[3], p2[3])));
    const minY = Math.max(0, Math.floor(Math.min(p0[4], p1[4], p2[4])));
    const maxY = Math.min(H - 1, Math.ceil(Math.max(p0[4], p1[4], p2[4])));
    const d = (p1[4] - p2[4]) * (p0[3] - p2[3]) + (p2[3] - p1[3]) * (p0[4] - p2[4]);
    if (Math.abs(d) < 1e-9) continue;
    for (let y = minY; y <= maxY; y++) {
      for (let x = minX; x <= maxX; x++) {
        const px = x + 0.5;
        const py = y + 0.5;
        const w0 = ((p1[4] - p2[4]) * (px - p2[3]) + (p2[3] - p1[3]) * (py - p2[4])) / d;
        const w1 = ((p2[4] - p0[4]) * (px - p2[3]) + (p0[3] - p2[3]) * (py - p2[4])) / d;
        const w2 = 1 - w0 - w1;
        if (w0 < -0.001 || w1 < -0.001 || w2 < -0.001) continue;
        const z = w0 * p0[2] + w1 * p1[2] + w2 * p2[2];
        const i = y * W + x;
        if (z <= depth[i]) continue;
        depth[i] = z;
        rgb[i * 3] = color[0];
        rgb[i * 3 + 1] = color[1];
        rgb[i * 3 + 2] = color[2];
      }
    }
  }
  return rgb;
}

const PAINT = PAINT_COLORS.find((c) => c.id === 'ocean')?.hex || 0x2f7fa8;

const viewsFront = [
  { pos: [0.2, 2.1, 10.5] },
  { pos: [7.4, 3.3, 10.4] },
];
// Боковой вид: снимаем с расстояния, куда влезает вся сцепка. Раньше камера
// стояла в 15.5 м и длинные модели (auriga-5/-6) упирались прицепом в край кадра.
// центр кадра — середина сцепки (тягач спереди + прицеп позади),
// иначе длинный прицеп уезжает за правый край.
const viewsSide = [{ pos: [24.5, 3.0, -4.2], target: [0, 1.8, -4.4] }];

if (process.env.TRAILERS) {
  const views = [{ pos: [19, 3.6, 13.5] }];
  for (const type of ['curtain', 'fridge', 'tank', 'flatbed', 'container', 'log', 'tipper', 'lowboy']) {
    renderTruck('auriga-5', PAINT, views, `trailer-${type}.png`, false, false, type);
  }
} else if (process.env.GLASS_ONLY) {
  renderTruck('auriga-5', PAINT, viewsFront, '_glass.png', false, true);
} else {
  for (const model of TRUCK_MODELS) {
    const color = model.color || PAINT;
    renderTruck(model.id, color, viewsFront, `model-${model.id}.png`, false);
    renderTruck(model.id, color, viewsSide, `model-${model.id}-side.png`, false);
  }
}
console.log('готово');
process.exit(0);
