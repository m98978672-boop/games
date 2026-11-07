// ============================================================
// ТОЧЕЧНЫЙ ТРАФАРЕТ (dots): любая модель превращается в облако точек.
// Сначала обводим точками рёбра каждого треугольника — получается
// «трафарет» контура, — потом добиваем поверхность редкими точками.
// Из этого облака можно собрать модель заново (режим «Точки»), а можно
// рисовать превью-трафареты для меню.
// Никаких внешних файлов и текстур: только геометрия модели.
// ============================================================
import * as THREE from 'three';

/** Детерминированный ГПСЧ: одна и та же модель → одно и то же облако. */
function rngFrom(seed) {
  let s = seed >>> 0 || 1;
  return () => {
    s ^= s << 13; s >>>= 0;
    s ^= s >> 17;
    s ^= s << 5; s >>>= 0;
    return s / 4294967296;
  };
}

const _a = new THREE.Vector3();
const _b = new THREE.Vector3();
const _c = new THREE.Vector3();
const _e1 = new THREE.Vector3();
const _e2 = new THREE.Vector3();
const _n = new THREE.Vector3();

/**
 * Собирает меши модели в один список треугольников (мировые координаты).
 * @returns {{tris:Array, length:number, area:number, color:THREE.Color}}
 */
function collect(root, opts = {}) {
  const angleLimit = opts.angleLimit ?? 0.55; // радианы: 22° — всё острее считаем контуром
  const tris = [];
  let length = 0;
  let area = 0;
  const edges = [];
  root.updateMatrixWorld(true);
  root.traverseVisible((o) => {
    if (!o.isMesh || o.isInstancedMesh || !o.geometry) return;
    const g = o.geometry;
    const pos = g.attributes.position;
    if (!pos) return;
    const idx = g.index;
    const count = idx ? idx.count : pos.count;
    const mat = (Array.isArray(o.material) ? o.material[0] : o.material) || {};
    const base = new THREE.Color(mat.color ? mat.color : 0xcfd6da);
    // стекло и тонкие детали — приглушаем, иначе трафарет «звенит»
    const seeThrough = !!(mat.transparent && (mat.opacity ?? 1) < 0.85);
    const vcol = mat.vertexColors && g.attributes.color ? g.attributes.color : null;
    const tint = new THREE.Color();
    // рёбра сшиваем по координатам: у плоскости внутренние линии не нужны,
    // контуром остаются только перегибы и границы панелей
    const map = new Map();
    const key = (v) => `${Math.round(v.x * 1000)},${Math.round(v.y * 1000)},${Math.round(v.z * 1000)}`;
    for (let i = 0; i < count; i += 3) {
      const ia = idx ? idx.getX(i) : i;
      const ib = idx ? idx.getX(i + 1) : i + 1;
      const ic = idx ? idx.getX(i + 2) : i + 2;
      _a.fromBufferAttribute(pos, ia).applyMatrix4(o.matrixWorld);
      _b.fromBufferAttribute(pos, ib).applyMatrix4(o.matrixWorld);
      _c.fromBufferAttribute(pos, ic).applyMatrix4(o.matrixWorld);
      _e1.subVectors(_b, _a);
      _e2.subVectors(_c, _a);
      _n.crossVectors(_e1, _e2);
      const triArea = _n.length() * 0.5;
      if (!(triArea > 1e-7)) continue;
      const per = _e1.length() + _e2.length() + _c.distanceTo(_b);
      length += per;
      area += triArea;
      let col = base;
      if (vcol) {
        tint.setRGB(
          (vcol.getX(ia) + vcol.getX(ib) + vcol.getX(ic)) / 3,
          (vcol.getY(ia) + vcol.getY(ib) + vcol.getY(ic)) / 3,
          (vcol.getZ(ia) + vcol.getZ(ib) + vcol.getZ(ic)) / 3,
        );
        col = base.clone().multiply(tint);
      }
      const normal = _n.normalize().clone();
      const color = seeThrough ? col.clone().multiplyScalar(0.6) : col.clone();
      tris.push({
        a: _a.clone(), b: _b.clone(), c: _c.clone(),
        n: normal, area: triArea, color,
      });
      // рёбра треугольника
      const vs = [[ia, ib], [ib, ic], [ic, ia]];
      for (const [u, v] of vs) {
        const p = new THREE.Vector3().fromBufferAttribute(pos, u).applyMatrix4(o.matrixWorld);
        const q = new THREE.Vector3().fromBufferAttribute(pos, v).applyMatrix4(o.matrixWorld);
        const ku = key(p);
        const kv = key(q);
        const ek = ku < kv ? `${ku}|${kv}` : `${kv}|${ku}`;
        const found = map.get(ek);
        if (found) { found.n2 = normal; found.count = 2; } else {
          map.set(ek, { a: p, b: q, n1: normal, n2: null, count: 1, color });
        }
      }
    }
    for (const e of map.values()) {
      // граница панели или перегиб — это и есть линия трафарета
      const sharp = e.count === 1 || (e.n1 && e.n2 && e.n1.dot(e.n2) < Math.cos(angleLimit));
      if (!sharp) continue;
      // выпуклое ребро обводим как контур, вогнутое — как ямку:
      // знак считается по направлению ребра и нормалям соседних граней
      let kind = 1;
      if (e.n1 && e.n2) {
        const dir = new THREE.Vector3().subVectors(e.b, e.a).normalize();
        const cross = new THREE.Vector3().crossVectors(e.n1, e.n2);
        if (cross.dot(dir) < 0) kind = 2;
      }
      e.kind = kind;
      edges.push(e);
    }
  });
  return { tris, edges, length, area };
}

/** Круглая точка вместо квадратика: без неё облако выглядит «пикселями». */
export function dotSprite() {
  if (typeof document === 'undefined') return null;
  const S = 32;
  const cv = document.createElement('canvas');
  cv.width = S;
  cv.height = S;
  const c = cv.getContext('2d');
  if (!c) return null;
  const g = c.createRadialGradient(S / 2, S / 2, 0, S / 2, S / 2, S / 2);
  g.addColorStop(0, 'rgba(255,255,255,1)');
  g.addColorStop(0.55, 'rgba(255,255,255,0.95)');
  g.addColorStop(1, 'rgba(255,255,255,0)');
  c.fillStyle = g;
  c.fillRect(0, 0, S, S);
  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/**
 * Строит облако точек по модели.
 * @param {THREE.Object3D} root — корень модели (уже с мировыми матрицами)
 * @param {object} opts — { target, seed, size, sprite }
 * @returns {THREE.Points}
 */
export function buildDots(root, opts = {}) {
  const target = Math.max(4000, Math.min(220000, opts.target || 46000));
  const seed = opts.seed || 20260101;
  const inkMix = opts.inkMix ?? 0.5;
  const INK = new THREE.Color(opts.ink || '#e6eef4');
  const { tris, edges, length, area } = collect(root, { angleLimit: opts.angleLimit });
  let edgeLen = 0;
  for (const e of edges) edgeLen += e.a.distanceTo(e.b);
  const points = new THREE.BufferGeometry();
  if (!tris.length || !(length > 0)) {
    points.setAttribute('position', new THREE.Float32BufferAttribute([], 3));
    points.setAttribute('color', new THREE.Float32BufferAttribute([], 3));
    points.setAttribute('normal', new THREE.Float32BufferAttribute([], 3));
    const empty = new THREE.Points(points, dotMaterial(opts));
    empty.name = 'dots';
    empty.visible = false;
    return empty;
  }

  // шаг подбираем так, чтобы на рёбрах и площади вышло ~target точек:
  //   target ≈ L / step + A / (1.5·step)²
  const k = 3.1;
  const outline = edgeLen * 0.55 || length * 0.2;
  const step = Math.min(0.34, Math.max(0.016,
    (outline + Math.sqrt(outline * outline + (4 * target * area) / (k * k))) / (2 * target)));
  const edgeStep = step;
  const areaStep = step * k;

  const rand = rngFrom(seed);
  const max = Math.ceil(target * 2.4) + 8192;
  const posArr = new Float32Array(max * 3);
  const colArr = new Float32Array(max * 3);
  const nrmArr = new Float32Array(max * 3);
  let n = 0;
  const kindArr = new Float32Array(max);
  const push = (x, y, z, col, boost, nrm, kind = 0) => {
    if (n >= max) return;
    const i = n * 3;
    posArr[i] = x; posArr[i + 1] = y; posArr[i + 2] = z;
    colArr[i] = Math.min(1, col.r * boost);
    colArr[i + 1] = Math.min(1, col.g * boost);
    colArr[i + 2] = Math.min(1, col.b * boost);
    if (nrm) { nrmArr[i] = nrm.x; nrmArr[i + 1] = nrm.y; nrmArr[i + 2] = nrm.z; }
    kindArr[n] = kind;
    n += 1;
  };

  const p = new THREE.Vector3();
  const edgeCol = new THREE.Color();
  const fillCol = new THREE.Color();
  // 1) контур и ямки: выпуклые перегибы — светлой тушью,
  //    вогнутые (там, где поверхность уходит внутрь) — золотым акцентом
  const DENT = new THREE.Color(opts.dentColor || '#e8b45a');
  for (const e of edges) {
    const len = e.a.distanceTo(e.b);
    if (len < 0.014) continue; // фаски и микрорёбра только шумят
    const steps = Math.max(2, Math.ceil(len / edgeStep));
    if (e.kind === 2) edgeCol.copy(e.color).lerp(DENT, opts.dentMix ?? 0.72);
    else edgeCol.copy(e.color).lerp(INK, Math.min(0.8, inkMix + 0.12));
    const lifts = e.kind === 2 ? 1.25 : 1.22;
    for (let i = 0; i < steps; i++) {
      p.lerpVectors(e.a, e.b, i / steps);
      push(p.x, p.y, p.z, edgeCol, lifts, e.n1 || null, e.kind || 1);
    }
  }
  // 2) поверхность: редкие точки по площади — «заливка» штриховкой
  for (const t of tris) {
    fillCol.copy(t.color).lerp(INK, inkMix * 0.22);
    const inside = Math.round(t.area / (areaStep * areaStep));
    for (let i = 0; i < inside; i++) {
      let r1 = rand();
      let r2 = rand();
      if (r1 + r2 > 1) { r1 = 1 - r1; r2 = 1 - r2; }
      const f = 1 - r1 - r2;
      p.set(
        t.a.x * f + t.b.x * r1 + t.c.x * r2,
        t.a.y * f + t.b.y * r1 + t.c.y * r2,
        t.a.z * f + t.b.z * r1 + t.c.z * r2,
      );
      push(p.x, p.y, p.z, fillCol, 0.55 + rand() * 0.2, t.n, 0);
    }
  }

  // ---- «ямки»: точка спрятана в нише, если прямо перед ней (по нормали)
  // есть другая поверхность — там арка колеса, решётка, откос окна, козырёк.
  const markRecess = opts.recess !== false;
  if (markRecess && n > 0) {
    const CELL = 0.09;
    const grid = new Map();
    const gk = (x, y, z) => `${Math.round(x / CELL)},${Math.round(y / CELL)},${Math.round(z / CELL)}`;
    for (let i = 0; i < n; i++) {
      const k = gk(posArr[i * 3], posArr[i * 3 + 1], posArr[i * 3 + 2]);
      let arr = grid.get(k);
      if (!arr) { arr = []; grid.set(k, arr); }
      arr.push(i);
    }
    for (let i = 0; i < n; i++) {
      if (kindArr[i] !== 1) continue; // ищем ниши только вдоль контуров
      const nx = nrmArr[i * 3];
      const ny = nrmArr[i * 3 + 1];
      const nz = nrmArr[i * 3 + 2];
      if (!nx && !ny && !nz) continue;
      const px = posArr[i * 3];
      const py = posArr[i * 3 + 1];
      const pz = posArr[i * 3 + 2];
      const ci = Math.round(px / CELL);
      const cj = Math.round(py / CELL);
      const ck = Math.round(pz / CELL);
      let recessed = false;
      for (let a = -1; a <= 1 && !recessed; a++) {
        for (let b = -1; b <= 1 && !recessed; b++) {
          for (let d = -1; d <= 1 && !recessed; d++) {
            const arr = grid.get(`${ci + a},${cj + b},${ck + d}`);
            if (!arr) continue;
            for (const j of arr) {
              if (j === i) continue;
              const dx = posArr[j * 3] - px;
              const dy = posArr[j * 3 + 1] - py;
              const dz = posArr[j * 3 + 2] - pz;
              const along = dx * nx + dy * ny + dz * nz;
              if (along < 0.045 || along > 0.11) continue;
              const perp = dx * dx + dy * dy + dz * dz - along * along;
              if (perp > 0.0004) continue; // сосед должен быть почти прямо перед точкой
              recessed = true;
              break;
            }
          }
        }
      }
      if (recessed) {
        kindArr[i] = 2;
        // золотой акцент вместо светлой туши
        const dm = opts.dentMix ?? 0.72;
        const r0 = colArr[i * 3];
        const g0 = colArr[i * 3 + 1];
        const b0 = colArr[i * 3 + 2];
        colArr[i * 3] = r0 * (1 - dm) + 0.91 * dm;
        colArr[i * 3 + 1] = g0 * (1 - dm) + 0.71 * dm;
        colArr[i * 3 + 2] = b0 * (1 - dm) + 0.35 * dm;
      }
    }
  }

  // если вышло больше цели — прореживаем равномерно по всему облаку,
  // а не обрезаем хвост (иначе верх кабины оставался без точек)
  let count = n;
  let kindsOut = null;
  let positions = null;
  let colors = null;
  let normals = null;
  if (n > target) {
    const keep = target / n;
    positions = new Float32Array(target * 3);
    colors = new Float32Array(target * 3);
    normals = new Float32Array(target * 3);
    kindsOut = new Float32Array(target);
    let k = 0;
    for (let i = 0; i < n && k < target; i++) {
      if (rand() > keep) continue;
      const src = i * 3;
      const dst = k * 3;
      positions[dst] = posArr[src]; positions[dst + 1] = posArr[src + 1]; positions[dst + 2] = posArr[src + 2];
      colors[dst] = colArr[src]; colors[dst + 1] = colArr[src + 1]; colors[dst + 2] = colArr[src + 2];
      normals[dst] = nrmArr[src]; normals[dst + 1] = nrmArr[src + 1]; normals[dst + 2] = nrmArr[src + 2];
      kindsOut[k] = kindArr[i];
      k += 1;
    }
    count = k;
    positions = positions.subarray(0, count * 3);
    colors = colors.subarray(0, count * 3);
    normals = normals.subarray(0, count * 3);
  }
  points.setAttribute('position', new THREE.BufferAttribute(positions || posArr.subarray(0, n * 3), 3));
  points.setAttribute('color', new THREE.BufferAttribute(colors || colArr.subarray(0, n * 3), 3));
  points.setAttribute('normal', new THREE.BufferAttribute(normals || nrmArr.subarray(0, n * 3), 3));
  const kinds = new Float32Array(count);
  for (let i = 0; i < count; i++) kinds[i] = kindsOut ? kindsOut[i] : kindArr[i];
  points.setAttribute('kind', new THREE.BufferAttribute(kinds, 1));
  // сколько точек обводки-контура и сколько золотых ямок — для подписи
  let contour = 0;
  let dents = 0;
  for (let i = 0; i < kinds.length; i++) {
    if (kinds[i] === 1) contour += 1;
    else if (kinds[i] === 2) dents += 1;
  }
  points.computeBoundingSphere();
  const obj = new THREE.Points(points, dotMaterial(opts));
  obj.name = 'dots';
  obj.userData.count = count;
  obj.userData.contour = contour;
  obj.userData.dents = dents;
  obj.visible = false;
  obj.frustumCulled = false;
  return obj;
}

/** Материал точек: круглые, с перспективным размером и лёгким свечением. */
export function dotMaterial(opts = {}) {
  const mat = new THREE.PointsMaterial({
    size: opts.size || 0.022,
    sizeAttenuation: true,
    vertexColors: true,
    transparent: true,
    opacity: opts.opacity ?? 0.94,
    depthWrite: true,
    alphaTest: 0.3,
  });
  const tex = opts.sprite === undefined ? dotSprite() : opts.sprite;
  if (tex) { mat.map = tex; mat.needsUpdate = true; }
  return mat;
}

/**
 * Переключает «точки ↔ поверхности» одним вызовом.
 * Базовая видимость меша запоминается при первом переключении,
 * поэтому пятна повреждений и скрытые детали возвращаются как были.
 */
export function applyDots(root, on) {
  if (!root) return false;
  root.traverse((o) => {
    if (o.isMesh || o.isInstancedMesh) {
      if (o.userData.dotsBase === undefined) o.userData.dotsBase = o.visible;
      o.visible = on ? false : o.userData.dotsBase;
    }
  });
  const cloud = root.getObjectByName('dots');
  if (cloud) cloud.visible = !!on;
  return !!on;
}

/** Сколько точек в облаке (для подписи в интерфейсе). */
export function dotsCount(root) {
  const cloud = root?.getObjectByName('dots');
  return cloud?.userData?.count || 0;
}
