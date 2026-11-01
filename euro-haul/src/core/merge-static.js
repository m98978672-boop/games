// Склейка статичных мешей по материалам: сотни коробок превращаются в десятки
// draw call. Нужна ради частоты кадров — от неё напрямую зависит отзывчивость руля.
import * as THREE from 'three';

const ALLOWED = new Set(['position', 'normal', 'uv', 'color']);

/** Простая склейка однотипных геометрий без внешних утилит. */
function mergeGeometries(list) {
  if (!list.length) return null;
  const indexed = list.every((g) => g.index);
  const colored = list.every((g) => g.attributes.color);
  let verts = 0;
  let indices = 0;
  for (const g of list) {
    verts += g.attributes.position.count;
    indices += g.index ? g.index.count : g.attributes.position.count;
  }
  const pos = new Float32Array(verts * 3);
  const nor = new Float32Array(verts * 3);
  const uv = new Float32Array(verts * 2);
  const col = colored ? new Float32Array(verts * 3) : null;
  const idx = new Uint32Array(indices);
  let vo = 0;
  let io = 0;
  for (const g of list) {
    const p = g.attributes.position;
    pos.set(p.array, vo * 3);
    nor.set(g.attributes.normal.array, vo * 3);
    uv.set(g.attributes.uv.array, vo * 2);
    if (col) col.set(g.attributes.color.array, vo * 3);
    if (g.index) {
      const src = g.index.array;
      for (let i = 0; i < src.length; i++) idx[io + i] = src[i] + vo;
      io += src.length;
    } else {
      for (let i = 0; i < p.count; i++) idx[io + i] = i + vo;
      io += p.count;
    }
    vo += p.count;
  }
  const out = new THREE.BufferGeometry();
  out.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  out.setAttribute('normal', new THREE.BufferAttribute(nor, 3));
  out.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
  if (col) out.setAttribute('color', new THREE.BufferAttribute(col, 3));
  if (indexed) out.setIndex(new THREE.BufferAttribute(idx, 1));
  else out.setIndex(new THREE.BufferAttribute(idx, 1));
  return out;
}

/**
 * @param {THREE.Object3D} root контейнер, внутри которого всё статично
 * @param {THREE.Object3D[]} keep поддеревья, которые нельзя склеивать (руль, колёса)
 * @returns {{merged:number, removed:number}}
 */
export function mergeStatic(root, keep = []) {
  if (!root) return { merged: 0, removed: 0 };
  root.updateMatrixWorld(true);
  const inv = new THREE.Matrix4().copy(root.matrixWorld).invert();
  const local = new THREE.Matrix4();
  const buckets = new Map();
  const keepSet = new Set(keep);

  root.traverse((o) => {
    if (!o.isMesh || o.isInstancedMesh || o.isSkinnedMesh) return;
    if (keepSet.has(o)) return;
    let insideKept = false;
    for (let p = o.parent; p; p = p.parent) {
      if (keepSet.has(p)) { insideKept = true; break; }
    }
    if (insideKept) return;
    const mat = o.material;
    const geo = o.geometry;
    if (!mat || Array.isArray(mat) || mat.transparent || mat.isShaderMaterial || !geo?.attributes?.position) return;
    for (const name of Object.keys(geo.attributes)) if (!ALLOWED.has(name)) geo.deleteAttribute(name);
    if (!geo.attributes.normal) geo.computeVertexNormals();
    if (!geo.attributes.uv) {
      geo.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(geo.attributes.position.count * 2), 2));
    }
    const key = [mat.uuid, geo.index ? 1 : 0, geo.attributes.color ? 1 : 0, o.castShadow ? 1 : 0, o.receiveShadow ? 1 : 0].join('|');
    let bucket = buckets.get(key);
    if (!bucket) {
      bucket = { mat, cast: o.castShadow, receive: o.receiveShadow, items: [] };
      buckets.set(key, bucket);
    }
    local.multiplyMatrices(inv, o.matrixWorld);
    const clone = geo.clone();
    clone.applyMatrix4(local);
    bucket.items.push({ mesh: o, geo: clone });
  });

  let merged = 0;
  let removed = 0;
  for (const bucket of buckets.values()) {
    if (bucket.items.length < 2) {
      for (const it of bucket.items) it.geo.dispose();
      continue;
    }
    const geometry = mergeGeometries(bucket.items.map((it) => it.geo), false);
    for (const it of bucket.items) it.geo.dispose();
    if (!geometry) continue;
    geometry.computeBoundingSphere();
    const mesh = new THREE.Mesh(geometry, bucket.mat);
    mesh.castShadow = bucket.cast;
    mesh.receiveShadow = bucket.receive;
    mesh.matrixAutoUpdate = false;
    root.add(mesh);
    merged++;
    for (const it of bucket.items) {
      if (!it.mesh.parent) continue;
      it.mesh.parent.remove(it.mesh);
      it.mesh.geometry?.dispose?.();
      removed++;
    }
  }
  return { merged, removed };
}
