// Программный растеризатор для офлайн-превью: z-буфер, отсечение по ближней плоскости,
// упрощённое освещение. Нужен потому, что SVGRenderer сортирует грани по средней глубине.
import zlib from 'node:zlib';
import fs from 'node:fs';
const THREE = await import('three');

export function encodePNG(width, height, rgba) {
  const raw = Buffer.alloc((width * 4 + 1) * height);
  for (let y = 0; y < height; y++) {
    raw[y * (width * 4 + 1)] = 0;
    rgba.copy(raw, y * (width * 4 + 1) + 1, y * width * 4, (y + 1) * width * 4);
  }
  const chunk = (type, data) => {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length);
    const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
    const crc = Buffer.alloc(4);
    crc.writeUInt32BE(crc32(body) >>> 0);
    return Buffer.concat([len, body, crc]);
  };
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', zlib.deflateSync(raw, { level: 6 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

let crcTable = null;
function crc32(buf) {
  if (!crcTable) {
    crcTable = new Int32Array(256);
    for (let n = 0; n < 256; n++) {
      let c = n;
      for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      crcTable[n] = c;
    }
  }
  let c = -1;
  for (let i = 0; i < buf.length; i++) c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return c ^ -1;
}

const LIGHT = new THREE.Vector3(0.45, 0.82, 0.35).normalize();

const texCache = new WeakMap();
function texData(map) {
  if (!map) return null;
  if (texCache.has(map)) return texCache.get(map);
  let data = null;
  const img = map.image;
  if (img && img.__c) {
    const ctx = img.__c.getContext('2d');
    const w = img.__c.width;
    const h = img.__c.height;
    data = { px: ctx.getImageData(0, 0, w, h).data, w, h, flipY: map.flipY !== false };
  }
  texCache.set(map, data);
  return data;
}

/** Все видимые треугольники сцены в clip-координатах с готовым цветом. */
export function collect(scene, camera) {
  const tris = [];
  scene.updateMatrixWorld(true);
  camera.updateMatrixWorld(true);
  const viewProj = new THREE.Matrix4().multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
  const tmp = new THREE.Vector3();
  scene.traverseVisible((obj) => {
    if (!obj.isMesh) return;
    const geo = obj.geometry;
    const pos = geo.attributes.position;
    if (!pos) return;
    const index = geo.index;
    const uvAttr = geo.attributes.uv;
    const nAttr = geo.attributes.normal;
    const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
    const groups = geo.groups && geo.groups.length ? geo.groups : null;
    const triCount = (index ? index.count : pos.count) / 3;
    const nm = new THREE.Matrix3().getNormalMatrix(obj.matrixWorld);
    const v = [new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3()];
    for (let t = 0; t < triCount; t++) {
      let mat = mats[0];
      if (groups) {
        const triIndex = t * 3; // позиция в индексном буфере, а не номер вершины
        for (const gr of groups) {
          if (triIndex >= gr.start && triIndex < gr.start + gr.count) {
            mat = mats[gr.materialIndex] || mats[0];
            break;
          }
        }
      }
      for (let k = 0; k < 3; k++) {
        const i = index ? index.getX(t * 3 + k) : t * 3 + k;
        v[k].fromBufferAttribute(pos, i).applyMatrix4(obj.matrixWorld);
      }
      // Нормаль берём из атрибутов геометрии: у PlaneGeometry порядок обхода
      // противоположен вычисленному через cross, и грани «пропадали».
      const worldN = new THREE.Vector3();
      if (nAttr) {
        for (let k = 0; k < 3; k++) {
          const i = index ? index.getX(t * 3 + k) : t * 3 + k;
          worldN.x += nAttr.getX(i);
          worldN.y += nAttr.getY(i);
          worldN.z += nAttr.getZ(i);
        }
        worldN.normalize().applyMatrix3(nm).normalize();
      } else {
        worldN.subVectors(v[1], v[0]).cross(new THREE.Vector3().subVectors(v[2], v[0])).normalize().applyMatrix3(nm).normalize();
      }
      const doubleSide = mat.side === THREE.DoubleSide;
      tmp.subVectors(camera.position, v[0]);
      if (worldN.dot(tmp) < 0) {
        if (!doubleSide) continue;
        worldN.negate();
      }
      const base = mat.color || { r: 1, g: 1, b: 1 };
      const em = mat.emissive ? mat.emissiveIntensity ?? 1 : 0;
      const emissive = mat.emissive || { r: 0, g: 0, b: 0 };
      const lambert = Math.max(0, worldN.dot(LIGHT));
      const hemi = 0.46 + 0.3 * (worldN.y * 0.5 + 0.5);
      const shade = hemi + lambert * 0.6;
      // блик
      const viewDir = new THREE.Vector3().subVectors(camera.position, v[0]).normalize();
      const half = LIGHT.clone().add(viewDir).normalize();
      const spec = Math.min(0.55, (mat.metalness || 0) * Math.pow(Math.max(0, worldN.dot(half)), 30) * 0.55);
      const color = [
        Math.min(1, base.r * shade + emissive.r * em + spec),
        Math.min(1, base.g * shade + emissive.g * em + spec),
        Math.min(1, base.b * shade + emissive.b * em + spec),
      ];
      const uvs = [];
      const poly = [];
      for (let k = 0; k < 3; k++) {
        const c = new THREE.Vector4(v[k].x, v[k].y, v[k].z, 1).applyMatrix4(viewProj);
        if (uvAttr) {
          const i = index ? index.getX(t * 3 + k) : t * 3 + k;
          uvs.push({ u: uvAttr.getX(i), v: uvAttr.getY(i) });
        }
        poly.push({ x: c.x, y: c.y, z: c.z, w: c.w, u: uvs[k]?.u || 0, v: uvs[k]?.v || 0 });
      }
      tris.push({
        clip: poly,
        uv: uvs.length === 3 ? uvs : null,
        tex: texData(mat.map),
        shade: [shade, spec, emissive.r * em, emissive.g * em, emissive.b * em],
        baseColor: [base.r, base.g, base.b],
        unlit: mat.type === 'MeshBasicMaterial',
        color,
        opacity: mat.transparent ? mat.opacity : 1,
        depth: v[0].distanceTo(camera.position),
      });
    }
  });
  return tris;
}

const NEAR = 0.05;

/** Отсечение многоугольника по ближней плоскости (w >= NEAR). */
function clipNear(poly) {
  const out = [];
  for (let i = 0; i < poly.length; i++) {
    const a = poly[i];
    const b = poly[(i + 1) % poly.length];
    const ain = a.w >= NEAR;
    const bin = b.w >= NEAR;
    if (ain) out.push(a);
    if (ain !== bin) {
      const t = (NEAR - a.w) / (b.w - a.w);
      out.push({
        x: a.x + (b.x - a.x) * t,
        y: a.y + (b.y - a.y) * t,
        z: a.z + (b.z - a.z) * t,
        w: a.w + (b.w - a.w) * t,
        u: (a.u || 0) + ((b.u || 0) - (a.u || 0)) * t,
        v: (a.v || 0) + ((b.v || 0) - (a.v || 0)) * t,
      });
    }
  }
  return out;
}

export function render(scene, camera, width, height, ss = 2) {
  const W = width * ss;
  const H = height * ss;
  const color = new Float32Array(W * H * 3);
  const depth = new Float32Array(W * H).fill(Infinity);
  const bg = scene.background || { r: 0.6, g: 0.7, b: 0.8 };
  for (let i = 0; i < W * H; i++) {
    color[i * 3] = bg.r;
    color[i * 3 + 1] = bg.g;
    color[i * 3 + 2] = bg.b;
  }
  const tris = collect(scene, camera);
  const opaque = tris.filter((t) => t.opacity >= 0.999);
  const transparent = tris.filter((t) => t.opacity < 0.999).sort((a, b) => b.depth - a.depth);

  const draw = (tri, blend) => {
    const poly = clipNear(tri.clip);
    if (poly.length < 3) return;
    // для текстурированных граней нужны барицентрические веса исходных вершин
    const pts = poly.map((c) => ({
      x: (c.x / c.w * 0.5 + 0.5) * W,
      y: (1 - (c.y / c.w * 0.5 + 0.5)) * H,
      invW: 1 / c.w,
      orig: c.orig || 0,
      u: c.u ?? 0,
      v: c.v ?? 0,
    }));
    for (let f = 1; f < pts.length - 1; f++) {
      const p = [pts[0], pts[f], pts[f + 1]];
      const minX = Math.max(0, Math.floor(Math.min(p[0].x, p[1].x, p[2].x)));
      const maxX = Math.min(W - 1, Math.ceil(Math.max(p[0].x, p[1].x, p[2].x)));
      const minY = Math.max(0, Math.floor(Math.min(p[0].y, p[1].y, p[2].y)));
      const maxY = Math.min(H - 1, Math.ceil(Math.max(p[0].y, p[1].y, p[2].y)));
      if (maxX < minX || maxY < minY) continue;
      const area = (p[1].x - p[0].x) * (p[2].y - p[0].y) - (p[2].x - p[0].x) * (p[1].y - p[0].y);
      if (Math.abs(area) < 1e-9) continue;
      for (let y = minY; y <= maxY; y++) {
        for (let x = minX; x <= maxX; x++) {
          const w0 = ((p[1].x - x) * (p[2].y - y) - (p[2].x - x) * (p[1].y - y)) / area;
          const w1 = ((p[2].x - x) * (p[0].y - y) - (p[0].x - x) * (p[2].y - y)) / area;
          const w2 = 1 - w0 - w1;
          if (w0 < -1e-6 || w1 < -1e-6 || w2 < -1e-6) continue;
          const invW = w0 * p[0].invW + w1 * p[1].invW + w2 * p[2].invW;
          if (invW <= 0) continue;
          const z = 1 / invW;
          const idx = y * W + x;
          if (z >= depth[idx]) continue;
          let cr = tri.color[0];
          let cg = tri.color[1];
          let cb = tri.color[2];
          if (tri.tex && tri.uv) {
            const uu = w0 * p[0].u + w1 * p[1].u + w2 * p[2].u;
            const vv = w0 * p[0].v + w1 * p[1].v + w2 * p[2].v;
            const t = tri.tex;
            const tx = Math.floor(((uu % 1) + 1) % 1 * t.w);
            // flipY=true: строка 0 изображения соответствует v=1
            const ty = Math.floor((1 - (((vv % 1) + 1) % 1)) * t.h);
            const ti = ((ty & (t.h - 1)) * t.w + (tx & (t.w - 1))) * 4;
            const tr = t.px[ti] / 255;
            const tg = t.px[ti + 1] / 255;
            const tb = t.px[ti + 2] / 255;
            const sh = tri.shade[0];
            cr = tr * tri.baseColor[0] * sh + tri.shade[2];
            cg = tg * tri.baseColor[1] * sh + tri.shade[3];
            cb = tb * tri.baseColor[2] * sh + tri.shade[4];
            if (tri.unlit) {
              cr = tr * tri.baseColor[0];
              cg = tg * tri.baseColor[1];
              cb = tb * tri.baseColor[2];
            }
          }
          if (blend) {
            const a = tri.opacity;
            color[idx * 3] = color[idx * 3] * (1 - a) + cr * a;
            color[idx * 3 + 1] = color[idx * 3 + 1] * (1 - a) + cg * a;
            color[idx * 3 + 2] = color[idx * 3 + 2] * (1 - a) + cb * a;
          } else {
            depth[idx] = z;
            color[idx * 3] = cr;
            color[idx * 3 + 1] = cg;
            color[idx * 3 + 2] = cb;
          }
        }
      }
    }
  };
  for (const t of opaque) draw(t, false);
  for (const t of transparent) draw(t, true);

  const out = Buffer.alloc(width * height * 4);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let r = 0;
      let g = 0;
      let b = 0;
      for (let sy = 0; sy < ss; sy++) {
        for (let sx = 0; sx < ss; sx++) {
          const i = ((y * ss + sy) * W + (x * ss + sx)) * 3;
          r += color[i];
          g += color[i + 1];
          b += color[i + 2];
        }
      }
      const n = ss * ss;
      const o = (y * width + x) * 4;
      out[o] = Math.min(255, Math.round(Math.sqrt(r / n) * 255 * 0.98));
      out[o + 1] = Math.min(255, Math.round(Math.sqrt(g / n) * 255 * 0.98));
      out[o + 2] = Math.min(255, Math.round(Math.sqrt(b / n) * 255 * 0.98));
      out[o + 3] = 255;
    }
  }
  return out;
}

export function savePNG(path, scene, camera, width = 960, height = 540, ss = 2) {
  fs.writeFileSync(path, encodePNG(width, height, render(scene, camera, width, height, ss)));
}
