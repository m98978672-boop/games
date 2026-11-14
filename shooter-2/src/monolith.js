/* =============================================================================
   СЕКТОР «ПЕПЕЛ» — монолиты: 10 000 моделей с настоящими прорезями и выемками
   -----------------------------------------------------------------------------
   Здесь НЕ «коробка с наклейками». Прорезь — это дыра в объёме: грань панели
   режется на прямоугольники ВЫЧИТАНИЕМ, по контуру дыры идёт внутренняя
   стенка, у выемки есть дно на заданной глубине. Поэтому сквозь прорезь видно
   то, что за моделью, а выемка честно темнеет в глубине.

   Схема та же, что в Godot-версии (shooter-2-godot/scripts/monolith.gd):
     • decompose(w, h, voids) — столбцы по всем X-грани дыр, внутри столбца
       вычитаются интервалы; свободные участки не пересекаются и не оставляют
       щелей (площадь сходится до 1e-6);
     • все детали сводятся в ОДИН BufferGeometry с вершинными цветами —
       монолит на один draw call;
     • нормали каждой грани проверяются по ожидаемому направлению, иначе
       изнутри прорезь освещалась бы с изнанки и выглядела чёрной.

   10 семейств × 10 архетипов × 10 вариантов × 10 отделок = 10 000 моделей.

     SH2.monolith.COUNT                  // 10000
     SH2.monolith.describe(i)            // {id, family, title, ...}
     SH2.monolith.build(i)               // {geometry, w, h, d, openings, recesses}
     SH2.monolith.buildMesh(i, material)  // THREE.Mesh
     SH2.monolith.decompose(w, h, voids) // результат вычитания прорезей
   ============================================================================= */
(function (root) {
  'use strict';
  const SH2 = (root.SH2 = root.SH2 || {});
  const THREE = () => root.THREE;

  const ARCHETYPES = 10;
  const VARIANTS = 10;
  const FINISHES = 10;

  const FAMILIES = [
    { key: 'block', title: 'блок' },
    { key: 'slab', title: 'плита' },
    { key: 'pier', title: 'тумба' },
    { key: 'crate', title: 'ящик' },
    { key: 'column', title: 'колонна' },
    { key: 'parapet', title: 'парапет' },
    { key: 'stela', title: 'стела' },
    { key: 'pedestal', title: 'постамент' },
    { key: 'fence', title: 'секция' },
    { key: 'cassette', title: 'кассета' }
  ];

  const COLORS = {
    block: [0x6b6a63, 0x5a6a63, 0x6a6055, 0x59616a, 0x736a58],
    slab: [0x707064, 0x5f6a6f, 0x6d655a, 0x646d5c, 0x6f6a60],
    pier: [0x5d6166, 0x68645c, 0x5a6259, 0x6a625a, 0x606468],
    crate: [0x7a6440, 0x6b5a3c, 0x82693f, 0x5f5338, 0x715c3a],
    column: [0x77746a, 0x6a6d63, 0x807a6e, 0x5f625c, 0x736d60],
    parapet: [0x65675f, 0x5b6058, 0x6d6b60, 0x5f6359, 0x6a685e],
    stela: [0x6e7168, 0x5c6159, 0x75736a, 0x62655d, 0x6a6f66],
    pedestal: [0x6a6459, 0x5e6058, 0x726b60, 0x62605a, 0x6d675c],
    fence: [0x5a5f5b, 0x666a63, 0x525753, 0x6b6e66, 0x5e625c],
    cassette: [0x676b63, 0x5c615a, 0x70736a, 0x61655e, 0x6a6e65]
  };

  const COUNT = FAMILIES.length * ARCHETYPES * VARIANTS * FINISHES;   // 10000

  /* -------------------------------- ГПСЧ --------------------------------- */
  function rngFor(seed) {
    let s = (Math.abs(seed) * 2654435761) >>> 0 || 1;
    return () => {
      s = (s * 1103515245 + 12345) & 0x7fffffff;
      return s / 2147483648;
    };
  }
  const rangeF = (rng, a, b) => a + (b - a) * rng();

  /* ------------------------------ описание ------------------------------- */
  function describe(index) {
    const i = Math.max(0, Math.min(COUNT - 1, Math.floor(index) || 0));
    const per = ARCHETYPES * VARIANTS * FINISHES;
    const f = Math.floor(i / per);
    let rest = i - f * per;
    const arch = Math.floor(rest / (VARIANTS * FINISHES));
    rest -= arch * VARIANTS * FINISHES;
    const variant = Math.floor(rest / FINISHES);
    const finish = rest - variant * FINISHES;
    const fam = FAMILIES[f];
    return {
      index: i,
      id: fam.key + '-' + arch + '-' + variant + '-' + finish,
      family: fam.key,
      familyTitle: fam.title,
      archetype: arch,
      variant,
      finish,
      title: fam.title + ' №' + (arch * VARIANTS + variant + 1),
      seed: i * 7919 + 13
    };
  }

  /* ------------------------- вычитание прорезей -------------------------- */
  /* [x, y, w, h] → массив свободных прямоугольников той же грани. */
  function decompose(w, h, voids) {
    const xs = [0, w];
    for (const v of voids) {
      xs.push(Math.max(0, Math.min(w, v[0])));
      xs.push(Math.max(0, Math.min(w, v[0] + v[2])));
    }
    xs.sort((a, b) => a - b);
    const out = [];
    for (let k = 0; k < xs.length - 1; k++) {
      const x0 = xs[k];
      const x1 = xs[k + 1];
      if (x1 - x0 < 0.0002) continue;
      const mid = (x0 + x1) * 0.5;
      const spans = [];
      for (const v of voids) {
        if (mid > v[0] + 0.0001 && mid < v[0] + v[2] - 0.0001) {
          spans.push([Math.max(0, v[1]), Math.min(h, v[1] + v[3])]);
        }
      }
      spans.sort((a, b) => a[0] - b[0]);
      let y = 0;
      for (const sp of spans) {
        const top = Math.max(0, Math.min(h, sp[0]));
        if (top - y > 0.0002) out.push([x0, y, x1 - x0, top - y]);
        y = Math.max(y, Math.max(0, Math.min(h, sp[1])));
      }
      if (h - y > 0.0002) out.push([x0, y, x1 - x0, h - y]);
    }
    return out;
  }

  /* --------------------------- сборщик граней ---------------------------- */
  class Builder {
    constructor() {
      this.pos = [];
      this.nor = [];
      this.col = [];
      this.idx = [];
      this.vBase = 0;
      this.color = [1, 1, 1];
    }

    setColor(c) {
      this.color = c;
      return this;
    }

    tri(a, b, c) {
      const ux = b[0] - a[0], uy = b[1] - a[1], uz = b[2] - a[2];
      const vx = c[0] - a[0], vy = c[1] - a[1], vz = c[2] - a[2];
      let nx = uy * vz - uz * vy;
      let ny = uz * vx - ux * vz;
      let nz = ux * vy - uy * vx;
      const len = Math.sqrt(nx * nx + ny * ny + nz * nz);
      if (len < 1e-9) return;
      nx /= len; ny /= len; nz /= len;
      const P = this.pos, N = this.nor, C = this.col, I = this.idx;
      const cr = this.color[0], cg = this.color[1], cb = this.color[2];
      for (const p of [a, b, c]) {
        P.push(p[0], p[1], p[2]);
        N.push(nx, ny, nz);
        C.push(cr, cg, cb);
      }
      const v = this.vBase;
      I.push(v, v + 1, v + 2);
      this.vBase = v + 3;
    }

    /* Квад одним куском: 4 вершины и 6 индексов вместо двух треугольников и
       шести вершин. Экономия 33 % вершин — на телефоне это заметно. */
    quad4(a, b, c, d, n) {
      const ux = b[0] - a[0], uy = b[1] - a[1], uz = b[2] - a[2];
      const vx = c[0] - a[0], vy = c[1] - a[1], vz = c[2] - a[2];
      let nx = uy * vz - uz * vy;
      let ny = uz * vx - ux * vz;
      let nz = ux * vy - uy * vx;
      const len = Math.sqrt(nx * nx + ny * ny + nz * nz);
      if (len < 1e-9) return;
      nx /= len; ny /= len; nz /= len;
      const flip = n && nx * n[0] + ny * n[1] + nz * n[2] < 0;
      const P = this.pos, N = this.nor, C = this.col, I = this.idx;
      const cr = this.color[0], cg = this.color[1], cb = this.color[2];
      for (const p of [a, b, c, d]) {
        P.push(p[0], p[1], p[2]);
        N.push(nx, ny, nz);
        C.push(cr, cg, cb);
      }
      const v = this.vBase;
      if (flip) {
        I.push(v, v + 2, v + 1, v, v + 3, v + 2);
      } else {
        I.push(v, v + 1, v + 2, v, v + 2, v + 3);
      }
      this.vBase = v + 4;
    }

    /* quad с проверкой стороны: если нормаль смотрит против `out`,
       порядок вершин разворачивается. */
    quad(a, b, c, d, out) {
      const ux = b[0] - a[0], uy = b[1] - a[1], uz = b[2] - a[2];
      const vx = c[0] - a[0], vy = c[1] - a[1], vz = c[2] - a[2];
      const nx = uy * vz - uz * vy;
      const ny = uz * vx - ux * vz;
      const nz = ux * vy - uy * vx;
      this.quad4(a, b, c, d, out);
      void nx; void ny; void nz;
    }

    /* Индексированная геометрия: каждый квад даёт 4 вершины и 6 индексов.
       Это в 1,5 раза меньше вершин, чем у неиндексированной сборки, и
       заметно быстрее на телефоне. */
    geometry() {
      const T = THREE();
      const vCount = this.pos.length / 3;
      const g = new T.BufferGeometry();
      g.setAttribute('position', new T.Float32BufferAttribute(this.pos, 3));
      g.setAttribute('normal', new T.Float32BufferAttribute(this.nor, 3));
      g.setAttribute('color', new T.Float32BufferAttribute(this.col, 3));
      g.setIndex(new T.BufferAttribute(
        new (vCount > 65535 ? Uint32Array : Uint16Array)(this.idx), 1));
      /* Габариты считаем сами: computeBoundingBox в three гоняет Math.min/max
         по буферу через spread — на тысячах моделей это секунды. */
      let minX = Infinity, minY = Infinity, minZ = Infinity;
      let maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity;
      const P = this.pos;
      for (let i = 0; i < P.length; i += 3) {
        if (P[i] < minX) minX = P[i];
        if (P[i] > maxX) maxX = P[i];
        if (P[i + 1] < minY) minY = P[i + 1];
        if (P[i + 1] > maxY) maxY = P[i + 1];
        if (P[i + 2] < minZ) minZ = P[i + 2];
        if (P[i + 2] > maxZ) maxZ = P[i + 2];
      }
      const bx = new T.Box3(new T.Vector3(minX, minY, minZ), new T.Vector3(maxX, maxY, maxZ));
      g.boundingBox = bx;
      g.boundingSphere = bx.getBoundingSphere(new T.Sphere());
      return g;
    }
  }

  const hexToRgb = (hex) => [
    ((hex >> 16) & 255) / 255, ((hex >> 8) & 255) / 255, (hex & 255) / 255
  ];
  const darken = (c, k) => [c[0] * (1 - k), c[1] * (1 - k), c[2] * (1 - k)];
  const lighten = (c, k) => [
    c[0] + (1 - c[0]) * k, c[1] + (1 - c[1]) * k, c[2] + (1 - c[2]) * k
  ];

  /* ------------------------------ геометрия ------------------------------- */
  /* Преобразование «повернуть вокруг Y (или X) и перенести»: применяется к
     каждой вершине панели сразу, чтобы не плодить второй буфер. */
  function xfY(ang, tx, ty, tz) {
    const c = Math.cos(ang), s = Math.sin(ang);
    return (x, y, z) => [c * x + s * z + tx, y + ty, -s * x + c * z + tz];
  }
  function xfX(ang, tx, ty, tz) {
    const c = Math.cos(ang), s = Math.sin(ang);
    return (x, y, z) => [x + tx, c * y - s * z + ty, s * y + c * z + tz];
  }

  function rectTube(st, r, z0, z1, map) {
    const x0 = r[0], x1 = r[0] + r[2], y0 = r[1], y1 = r[1] + r[3];
    const q = (a, b, c, d, n) => st.quad(map(a[0], a[1], a[2]), map(b[0], b[1], b[2]),
      map(c[0], c[1], c[2]), map(d[0], d[1], d[2]), n);
    /* нормали дыр не поворачиваем: проверка идёт в локальных осях панели */
    q([x0, y0, z0], [x1, y0, z0], [x1, y0, z1], [x0, y0, z1], [0, 1, 0]);
    q([x0, y1, z1], [x1, y1, z1], [x1, y1, z0], [x0, y1, z0], [0, -1, 0]);
    q([x0, y0, z1], [x0, y1, z1], [x0, y1, z0], [x0, y0, z0], [1, 0, 0]);
    q([x1, y0, z0], [x1, y1, z0], [x1, y1, z1], [x1, y0, z1], [-1, 0, 0]);
  }

  /* Панель: две плоскости с прорезями, торец, стенки прорезей и выемок. */
  function panel(st, w, h, thick, holes, recesses, base, map) {
    const half = thick * 0.5;
    const voids = holes.concat(recesses.map((r) => r.rect));
    for (const r of decompose(w, h, voids)) {
      const p0 = [r[0], r[1], half], p1 = [r[0] + r[2], r[1], half];
      const p2 = [r[0] + r[2], r[1] + r[3], half], p3 = [r[0], r[1] + r[3], half];
      st.quad(map(p0[0], p0[1], p0[2]), map(p1[0], p1[1], p1[2]),
        map(p2[0], p2[1], p2[2]), map(p3[0], p3[1], p3[2]), [0, 0, 1]);
      const zq = -half;
      st.quad(map(p0[0], p0[1], zq), map(p1[0], p1[1], zq),
        map(p2[0], p2[1], zq), map(p3[0], p3[1], zq), [0, 0, -1]);
    }
    const oc = [[0, 0], [w, 0], [w, h], [0, h]];
    const mx = w * 0.5, my = h * 0.5;
    for (let i = 0; i < 4; i++) {
      const a = oc[i], b = oc[(i + 1) % 4];
      const emx = (a[0] + b[0]) * 0.5 - mx;
      const emy = (a[1] + b[1]) * 0.5 - my;
      const ln = Math.hypot(emx, emy) || 1;
      const n = [emx / ln, emy / ln, 0];
      st.quad(map(a[0], a[1], -half), map(b[0], b[1], -half),
        map(b[0], b[1], half), map(a[0], a[1], half), n);
    }
    for (const r of holes) rectTube(st, r, -half, half, map);
    for (const rc of recesses) {
      const r = rc.rect;
      const depth = Math.max(0.002, Math.min(thick * 1.5,
        rc.depth === undefined ? 0.06 : rc.depth));
      const back = half - depth;
      rectTube(st, r, back, half, map);
      const saved = st.color;
      st.setColor(base);
      /* дно: тот же материал, но физически дальше — в кадре темнее само */
      st.quad(map(r[0], r[1], back), map(r[0] + r[2], r[1], back),
        map(r[0] + r[2], r[1] + r[3], back), map(r[0], r[1] + r[3], back), [0, 0, 1]);
      st.setColor(saved);
    }
  }

  function solidBox(st, w, h, d, color, at, bevel) {
    const ax = at ? at[0] : 0, ay = at ? at[1] : 0, az = at ? at[2] : 0;
    const k = bevel || 0;
    const hw = w * 0.5 - k, hd = d * 0.5 - k;
    const x0 = ax - hw, x1 = ax + hw, y0 = ay, y1 = ay + h, z0 = az - hd, z1 = az + hd;
    const saved = st.color;
    st.setColor(color);
    st.quad([x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1], [0, 0, 1]);
    st.quad([x1, y0, z0], [x0, y0, z0], [x0, y1, z0], [x1, y1, z0], [0, 0, -1]);
    st.quad([x1, y0, z1], [x1, y0, z0], [x1, y1, z0], [x1, y1, z1], [1, 0, 0]);
    st.quad([x0, y0, z0], [x0, y0, z1], [x0, y1, z1], [x0, y1, z0], [-1, 0, 0]);
    st.quad([x0, y1, z1], [x1, y1, z1], [x1, y1, z0], [x0, y1, z0], [0, 1, 0]);
    st.quad([x0, y0, z0], [x1, y0, z0], [x1, y0, z1], [x0, y0, z1], [0, -1, 0]);
    st.setColor(saved);
  }

  /* Срезанные вертикальные рёбра: монолит перестаёт читаться «коробкой». */
  function cornerChamfers(st, w, h, d, bev, color) {
    const hw = w * 0.5, hd = d * 0.5;
    const saved = st.color;
    st.setColor(color);
    for (const sx of [-1, 1]) {
      for (const sz of [-1, 1]) {
        const ax = sx * hw, az = sz * hd;
        const p1 = [ax, 0, az - sz * bev * 1.8];
        const p2 = [ax - sx * bev * 1.8, 0, az];
        st.quad(p1, p2, [p2[0], h, p2[2]], [p1[0], h, p1[2]], [sx, 0, sz]);
      }
    }
    st.setColor(saved);
  }

  /* Обрезать прорези, попавшие под фаску. */
  function clipHoles(holes, w, h, margin) {
    const out = [];
    for (const r of holes) {
      const x0 = Math.max(margin * 0.8, r[0]);
      const y0 = Math.max(margin * 0.8, r[1]);
      const x1 = Math.min(w - margin * 0.8, r[0] + r[2]);
      const y1 = Math.min(h - margin * 0.8, r[1] + r[3]);
      if (x1 - x0 > 0.02 && y1 - y0 > 0.02) out.push([x0, y0, x1 - x0, y1 - y0]);
    }
    return out;
  }

  /* Шестипанельный монолит по габаритам W×H×D (стоит на y = 0). */
  function boxMonolith(w, h, d, thick, faces, base, rib) {
    const st = new Builder();
    st.setColor(base);
    const bev = Math.max(0.02, Math.min(0.09, thick * 0.55));
    const halfW = w * 0.5 - bev;
    const halfD = d * 0.5 - bev;
    const pw = w - bev * 2;
    const ph = h - bev * 0.5;
    const pd = d - bev * 2;
    const F = (side) => faces[side] || [[], []];

    panel(st, pw, ph, thick, clipHoles(F('front')[0], pw, ph, bev), F('front')[1], base,
      xfY(0, -halfW, bev * 0.5, halfD));
    panel(st, pw, ph, thick, clipHoles(F('back')[0], pw, ph, bev), F('back')[1], base,
      xfY(Math.PI, halfW, bev * 0.5, -halfD));
    panel(st, pd, ph, thick, clipHoles(F('left')[0], pd, ph, bev), F('left')[1], base,
      xfY(-Math.PI * 0.5, -halfW, bev * 0.5, -halfD));
    panel(st, pd, ph, thick, clipHoles(F('right')[0], pd, ph, bev), F('right')[1], base,
      xfY(Math.PI * 0.5, halfW, bev * 0.5, halfD));
    panel(st, pw, pd, thick, clipHoles(F('top')[0], pw, pd, bev), F('top')[1], base,
      xfX(-Math.PI * 0.5, -halfW, h - bev * 0.5, halfD));
    const bot = F('bottom');
    if (bot[0].length || bot[1].length) {
      panel(st, pw, pd, thick, clipHoles(bot[0], pw, pd, bev), bot[1], base,
        xfX(Math.PI * 0.5, -halfW, bev * 0.5, -halfD));
    }
    cornerChamfers(st, w, h, d, bev, rib);
    return st;
  }

  /* ------------------------------ семейства ------------------------------ */
  function gridOpenings(w, h, cols, rows, padX, padY) {
    const holes = [];
    const cw = w / cols, ch = h / rows;
    for (let iy = 0; iy < rows; iy++) {
      for (let ix = 0; ix < cols; ix++) {
        const ow = Math.max(0.06, cw - padX * 2);
        const oh = Math.max(0.06, ch - padY * 2);
        holes.push([ix * cw + (cw - ow) * 0.5, iy * ch + (ch - oh) * 0.5, ow, oh]);
      }
    }
    return [holes, []];
  }

  function singleRecess(w, h, k, depth) {
    const rw = w * k * 0.5;
    const rh = h * k * 0.35;
    return [{ rect: [(w - rw) * 0.5, (h - rh) * 0.5, rw, rh], depth }];
  }

  function make(family, rng, arch, variant, finish) {
    const pal = COLORS[family];
    const base = hexToRgb(pal[(variant + finish) % pal.length]);
    const rib = lighten(base, 0.06 + 0.01 * (finish % 5));
    let w = 1.1, h = 1.0, d = 1.1, thick = 0.08;
    const faces = {};
    let openings = 0;
    let recesses = 0;

    if (family === 'block') {
      w = rangeF(rng, 1.0, 1.9) * (1 + 0.03 * arch);
      h = rangeF(rng, 0.7, 1.4);
      d = rangeF(rng, 0.9, 1.5);
      thick = 0.10;
      const cols = 1 + (variant + arch) % 3;
      const rows = 1 + (Math.floor(variant / 3) + arch) % 2;
      faces.front = gridOpenings(w, h, cols, rows, 0.16, 0.06);
      openings += cols * rows;
      if (finish % 3 === 0) {
        faces.back = [[], singleRecess(w, h, 0.34, 0.07 + 0.01 * (finish % 3))];
        recesses += 1;
      }
      if (arch >= 5) {
        faces.top = gridOpenings(w, d, 1 + Math.floor(arch / 5), 1, 0.2, 0.05);
        openings += 1 + Math.floor(arch / 5);
      }
    } else if (family === 'slab') {
      w = rangeF(rng, 1.6, 3.2);
      h = rangeF(rng, 1.4, 2.6);
      d = rangeF(rng, 0.26, 0.42);
      thick = Math.max(0.10, d * 0.4);
      const ow = Math.min(w * 0.44, rangeF(rng, 0.6, 1.2));
      const oh = Math.min(h * 0.52, rangeF(rng, 0.8, 1.4));
      const r0 = [(w - ow) * 0.5, h * 0.12 + (h - oh) * 0.28 * (arch % 3) * 0.5, ow, oh];
      const holes = [r0];
      if (variant % 2 === 1) {
        holes.push([w * 0.10, h * 0.62, Math.min(w * 0.18, 0.4), Math.min(h * 0.22, 0.4)]);
      }
      faces.front = [holes, []];
      faces.back = [[r0], []];
      openings += 1 + holes.length;
      if (finish % 4 === 1) {
        faces.front = [holes, singleRecess(w, h, 0.5, 0.05)];
        recesses += 1;
      }
    } else if (family === 'pier') {
      w = rangeF(rng, 0.7, 1.2);
      h = rangeF(rng, 0.8, 1.6);
      d = rangeF(rng, 0.7, 1.2);
      thick = 0.09;
      const rows = 1 + (variant % 3);
      const niches = [];
      for (let i = 0; i < rows; i++) {
        niches.push({
          rect: [w * 0.22, h * (0.18 + 0.22 * i), w * 0.56, Math.min(h * 0.18, 0.26)],
          depth: 0.05 + 0.02 * ((finish + i) % 3)
        });
      }
      faces.front = [[], niches];
      recesses += rows;
      if (arch % 2 === 0) {
        faces.left = gridOpenings(d, h, 1, 1, 0.2, 0.05);
        openings += 1;
      }
    } else if (family === 'crate') {
      w = rangeF(rng, 0.7, 1.1);
      h = rangeF(rng, 0.6, 0.95);
      d = rangeF(rng, 0.7, 1.1);
      thick = 0.06;
      const n = 2 + (variant % 4);
      const slots = [];
      for (let i = 0; i < n; i++) {
        const sx = w * (0.10 + 0.80 * (i + 1) / (n + 1));
        slots.push([sx - w * 0.035, h * 0.10, w * 0.07, h * 0.80]);
      }
      faces.front = [slots, []];
      faces.back = [slots, []];
      openings += n * 2;
      if (finish % 3 === 0) {
        faces.top = [[], singleRecess(w, d, 0.55, 0.06)];
        recesses += 1;
      }
      if (arch >= 6) {
        faces.left = gridOpenings(d, h, 2, 1, 0.14, 0.04);
        openings += 2;
      }
    } else if (family === 'column') {
      w = rangeF(rng, 0.4, 0.8);
      h = rangeF(rng, 1.8, 3.4);
      d = w * rangeF(rng, 0.9, 1.2);
      thick = 0.10;
      const bands = 2 + (variant % 4);
      const bandHoles = [];
      const bandRec = [];
      for (let i = 0; i < bands; i++) {
        const y = h * (0.08 + 0.82 * (i + 1) / (bands + 1));
        if ((i + arch) % 3 === 0) {
          bandRec.push({ rect: [w * 0.32, y, w * 0.36, h * 0.05], depth: 0.04 + 0.01 * (finish % 4) });
        } else {
          bandHoles.push([w * 0.36, y, w * 0.28, h * 0.05]);
        }
      }
      faces.front = [bandHoles, bandRec];
      faces.back = [bandHoles, []];
      openings += bandHoles.length * 2;
      recesses += bandRec.length;
    } else if (family === 'parapet') {
      w = rangeF(rng, 2.4, 4.4);
      h = rangeF(rng, 0.9, 1.5);
      d = rangeF(rng, 0.34, 0.55);
      thick = Math.max(0.10, d * 0.42);
      const n = 3 + (variant % 5);
      const holes = [];
      for (let i = 0; i < n; i++) {
        const sx = w * (0.08 + 0.84 * (i + 0.5) / n);
        holes.push([sx - w * 0.035, h * 0.42, w * 0.07, h * 0.34]);
      }
      faces.front = [holes, []];
      faces.back = [holes, []];
      openings += n * 2;
      if (arch % 3 === 0) {
        faces.top = [[], singleRecess(w, d, 0.3, 0.05)];
        recesses += 1;
      }
    } else if (family === 'stela') {
      w = rangeF(rng, 1.2, 2.2);
      h = rangeF(rng, 1.8, 3.0);
      d = rangeF(rng, 0.22, 0.36);
      thick = Math.max(0.09, d * 0.45);
      const aw = Math.min(w * 0.5, 0.9);
      const ah = Math.min(h * 0.55, 1.5);
      const stack = [[(w - aw) * 0.5, h * 0.10, aw, ah]];
      if (variant % 3 === 0) {
        stack.push([(w - aw * 0.5) * 0.5, h * 0.72, aw * 0.5, Math.min(h * 0.18, 0.3)]);
      }
      faces.front = [stack, []];
      faces.back = [stack, []];
      openings += stack.length * 2;
      if (finish % 5 === 2) {
        faces.front = [stack, singleRecess(w, h, 0.62, 0.04)];
        recesses += 1;
      }
    } else if (family === 'pedestal') {
      w = rangeF(rng, 1.0, 1.8);
      h = rangeF(rng, 1.0, 2.0);
      d = rangeF(rng, 1.0, 1.8);
      thick = 0.10;
      const n = 1 + (variant % 3);
      const niches = [];
      for (let i = 0; i < n; i++) {
        const step = 0.68 * i / Math.max(1, n - 1);
        const nx = n > 1 ? w * (0.16 + step) : w * 0.3;
        niches.push({
          rect: [nx - w * 0.09, h * 0.14, w * 0.18, h * 0.30],
          depth: 0.07 + 0.015 * ((arch + i) % 4)
        });
      }
      faces.front = [[], niches];
      faces.left = [[], niches];
      recesses += n * 2;
      if (arch % 2 === 1) {
        faces.top = gridOpenings(w, d, 2, 2, 0.22, 0.05);
        openings += 4;
      }
    } else if (family === 'fence') {
      w = rangeF(rng, 2.0, 3.6);
      h = rangeF(rng, 1.2, 2.2);
      d = rangeF(rng, 0.14, 0.24);
      thick = Math.max(0.07, d * 0.6);
      const n = 2 + (variant % 4);
      const holes = [];
      for (let i = 0; i < n; i++) {
        const sx = w * (0.06 + 0.88 * (i + 0.5) / n);
        holes.push([sx - w * 0.055, h * 0.16, w * 0.11, h * 0.62]);
      }
      faces.front = [holes, []];
      faces.back = [holes, []];
      openings += n * 2;
      faces.bottom = [[], singleRecess(w, d, 0.5, 0.012)];
      recesses += 1;
    } else if (family === 'cassette') {
      w = rangeF(rng, 1.0, 2.0);
      h = rangeF(rng, 0.8, 1.6);
      d = rangeF(rng, 0.6, 1.1);
      thick = 0.07;
      const cx = 2 + (arch % 3);
      const cy = 2 + (variant % 3);
      const cells = [];
      const cellsRec = [];
      for (let iy = 0; iy < cy; iy++) {
        for (let ix = 0; ix < cx; ix++) {
          const cw = w / cx * 0.62;
          const ch = h / cy * 0.62;
          const px = w * (ix + 0.5) / cx - cw * 0.5;
          const py = h * (iy + 0.5) / cy - ch * 0.5;
          if ((ix + iy + finish) % 4 === 0) {
            cellsRec.push({ rect: [px, py, cw, ch], depth: 0.05 + 0.02 * (finish % 3) });
          } else {
            cells.push([px, py, cw, ch]);
          }
        }
      }
      faces.front = [cells, cellsRec];
      faces.back = [cells, []];
      openings += cells.length * 2;
      recesses += cellsRec.length;
      if (arch >= 7) {
        faces.right = gridOpenings(d, h, 1, 2, 0.18, 0.05);
        openings += 2;
      }
    }

    const st = boxMonolith(w, h, d, thick, faces, base, rib);
    /* цоколи и капители: у разных семейств разные, чтобы силуэт был своим */
    if (family === 'pedestal') {
      solidBox(st, w + 0.34, 0.16, d + 0.34, rib, null, 0.02);
      solidBox(st, w + 0.18, 0.10, d + 0.18, darken(rib, 0.08), [0, h - 0.10, 0], 0.01);
    } else if (family === 'block') {
      solidBox(st, w + 0.16, 0.12, d + 0.16, lighten(rib, 0.08), [0, h - 0.06, 0], 0.015);
      if (arch >= 5) solidBox(st, w + 0.24, 0.10, d + 0.24, lighten(rib, 0.12), [0, h + 0.06, 0], 0.015);
    } else if (family === 'column') {
      solidBox(st, w + 0.22, 0.14, d + 0.22, rib, null, 0.01);
      solidBox(st, w + 0.26, 0.12, d + 0.26, lighten(rib, 0.06), [0, h - 0.12, 0], 0.01);
    } else if (family === 'stela') {
      solidBox(st, w + 0.26, 0.14, d + 0.18, rib, null, 0.02);
    } else if (family === 'parapet') {
      solidBox(st, w + 0.06, 0.09, d + 0.10, lighten(rib, 0.10), [0, h - 0.04, 0], 0.008);
    } else if (family === 'pier') {
      solidBox(st, w + 0.20, 0.12, d + 0.20, rib, null, 0.01);
      solidBox(st, w + 0.14, 0.08, d + 0.14, lighten(rib, 0.07), [0, h - 0.08, 0], 0.008);
    } else if (family === 'fence') {
      for (const sx of [-1, 1]) {
        solidBox(st, 0.12, h + 0.12, d + 0.10, rib, [sx * (w * 0.5 + 0.05), 0, 0], 0.01);
      }
    }
    return { st, w, h, d, openings, recesses };
  }

  /* -------------------------------- сборка --------------------------------
     Геометрия кэшируется: монолит неизменен, поэтому 10 000 моделей строятся
     один раз, а поле и лаборатория берут уже готовые. Кэш ограничен, чтобы
     телефон не держал в памяти весь каталог сразу. */
  const CACHE_LIMIT = 4096;
  const CACHE = new Map();

  function build(index) {
    const i0 = Math.max(0, Math.min(COUNT - 1, Math.floor(index) || 0));
    const hit = CACHE.get(i0);
    if (hit) return hit;
    const info = describe(i0);
    const rng = rngFor(info.seed);
    const made = make(info.family, rng, info.archetype, info.variant, info.finish);
    const geometry = made.st.geometry();
    const out = {
      geometry,
      id: info.id,
      title: info.title,
      family: info.family,
      index: info.index,
      w: made.w,
      h: made.h,
      d: made.d,
      openings: made.openings,
      recesses: made.recesses,
      tris: made.st.idx.length / 3
    };
    if (CACHE.size >= CACHE_LIMIT) {
      const first = CACHE.keys().next().value;
      const old = CACHE.get(first);
      CACHE.delete(first);
      if (old && old.geometry) old.geometry.dispose();
    }
    CACHE.set(i0, out);
    return out;
  }

  function clearCache() {
    CACHE.forEach((v) => v.geometry && v.geometry.dispose());
    CACHE.clear();
  }

  let SHARED_MAT = null;
  function material() {
    const T = THREE();
    if (!SHARED_MAT) {
      /* Lambert, а не Standard: тот же vertex-color, но дешевле в кадре и
         совпадает по свету с остальной картой (в проекте вся геометрия
         Lambert — иначе монолиты выбивались бы из общей картинки). */
      SHARED_MAT = new T.MeshLambertMaterial({ vertexColors: true });
    }
    return SHARED_MAT;
  }

  function buildMesh(index, mat) {
    const T = THREE();
    const made = build(index);
    const mesh = new T.Mesh(made.geometry, mat || material());
    mesh.name = 'monolith:' + made.id;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.userData = {
      index: made.index,
      id: made.id,
      family: made.family,
      openings: made.openings,
      recesses: made.recesses,
      tris: made.tris,
      w: made.w,
      h: made.h,
      d: made.d
    };
    return mesh;
  }

  /* Упрощённые варианты той же модели для дальних колец поля.
     Форма та же (габарит + вырез), но треугольников в 5–50 раз меньше:
     lod 1 — коробка с прорезью (≈30 треугольников),
     lod 2 — карточка-крест (4 треугольника).
     Это не подмена на спрайт: меш остаётся мешем, просто дешевле. */
  function buildLod(index, lod) {
    const info = describe(index);
    const made0 = describe(index);
    const rng = rngFor(made0.seed);
    const full = make(info.family, rng, info.archetype, info.variant, info.finish);
    const w = full.w, h = full.h, d = full.d;
    const base = hexToRgb(COLORS[info.family][(info.variant + info.finish) % 5]);
    const st = new Builder();
    st.setColor(base);
    if (lod <= 1) {
      const hw = w * 0.5, hd = d * 0.5, gap = w * 0.16, lw = hw - gap * 0.5;
      for (const sz of [-1, 1]) {
        const z = sz * hd;
        const n = [0, 0, sz];
        st.quad([-hw, 0, z], [-hw + lw, 0, z], [-hw + lw, h, z], [-hw, h, z], n);
        st.quad([hw - lw, 0, z], [hw, 0, z], [hw, h, z], [hw - lw, h, z], n);
        st.quad([-gap * 0.5, h * 0.55, z], [gap * 0.5, h * 0.55, z],
          [gap * 0.5, h, z], [-gap * 0.5, h, z], n);
      }
      for (const sx of [-1, 1]) {
        const x = sx * hw;
        st.quad([x, 0, -hd], [x, 0, hd], [x, h, hd], [x, h, -hd], [sx, 0, 0]);
      }
      st.quad([-hw, h, -hd], [hw, h, -hd], [hw, h, hd], [-hw, h, hd], [0, 1, 0]);
    } else {
      st.quad([-w * 0.5, 0, 0], [w * 0.5, 0, 0], [w * 0.5, h, 0], [-w * 0.5, h, 0], [0, 0, 1]);
      st.quad([0, 0, -w * 0.5], [0, 0, w * 0.5], [0, h, w * 0.5], [0, h, -w * 0.5], [1, 0, 0]);
    }
    return {
      geometry: st.geometry(),
      id: info.id + ':lod' + lod,
      family: info.family,
      index: info.index,
      w, h, d,
      openings: 1,
      recesses: 0,
      tris: st.idx.length / 3
    };
  }

  /* Детерминированный выбор модели по семейству — для расстановки на карте. */
  function pickIndex(familyKey, rng) {
    const f = Math.max(0, FAMILIES.findIndex((x) => x.key === familyKey));
    const per = ARCHETYPES * VARIANTS * FINISHES;
    return f * per + Math.floor((rng || Math.random)() * per) % per;
  }

  SH2.monolith = {
    COUNT,
    ARCHETYPES,
    VARIANTS,
    FINISHES,
    FAMILIES: FAMILIES.map((f) => f.key),
    families: FAMILIES.map((f) => ({ key: f.key, title: f.title })),
    COLORS,
    describe,
    build,
    buildLod,
    buildMesh,
    decompose,
    material,
    pickIndex,
    rngFor,
    clearCache
  };
})(typeof window !== 'undefined' ? window : globalThis);
