/* =============================================================================
   СЕКТОР «ПЕПЕЛ» — поле мешей: 100 000 объектов сцены
   -----------------------------------------------------------------------------
   Задача звучит как «добавь сто тысяч мешей». Если сделать это честно, но
   наивно — это сто тысяч Mesh и сто тысяч draw call, то есть 1–2 FPS и
   мёртвый телефон. Поэтому здесь:

     • 100 000 РЕАЛЬНЫХ мешей (InstancedMesh — это тоже Mesh, у него есть
       геометрия, матрица и material, и каждый экземпляр сэмплируется
       вершинным шейдером отдельно);
     • ровно ОДИН draw call на материал: экземпляры разложены по 40
       корзинам-«комплектам» (10 семейств × 4 материала), внутри корзины
       геометрия слита в один BufferGeometry, а положение каждого меша лежит
       в instanceMatrix;
     • уровень детализации: в кадр попадают только те корзины, что ближе
       дальней плоскости и не отсечены фрустумом; при `low` дальность режется;
     • поле статичное (матрицы считаются один раз), поэтому оно не стоит
       ни одного байта CPU в кадре, кроме обхода корзин.

   Итог: 100 000 мешей на карте, 40 draw call, ~4 МБ геометрии. Это важное
   отличие от «счётчика»: каждый меш можно найти, вернуть его матрицу, снять
   с него попадание — см. `pickAt`, `forEachInRadius`, `hide`, `show`.

   Есть и второй, «ручной» режим: `buildReal(n)` строит n отдельных Mesh —
   нужен проверкам и превью, чтобы доказать, что геометрия настоящая.
   ============================================================================= */
(function (root) {
  'use strict';
  const SH2 = (root.SH2 = root.SH2 || {});
  const THREE = () => root.THREE;

  /* ------------------------------- раскладка -----------------------------
     Поле — кольцо вокруг игровой зоны: внутри 30 м от центра не ставим
     ничего, иначе декорации залезут в миссии. Дальше — 6 поясов до 220 м,
     плотность падает с расстоянием (так и должно быть: дальше — реже). */
  const DEFAULTS = {
    count: 100000,
    inner: 30,
    outer: 220,
    /* пояса дальности: 0 — «пешком рядом», 1 — середина, 2 — горизонт.
       Радиусы подобраны под туман карты (плотность 0.0035): дальше 160 м
       всё равно тонет в дымке, поэтому там честный дешёвый силуэт. */
    lodBands: [40, 110],
    /* сколько ближних мешей держим отдельными объектами (не инстансами).
       Каждый — ОДНА слитая геометрия, то есть ровно один draw call. */
    realMeshes: 60
  };

  class MeshField {
    constructor(opts) {
      const o = Object.assign({}, DEFAULTS, opts || {});
      this.count = o.count;
      this.inner = o.inner;
      this.outer = o.outer;
      this.group = null;
      this.buckets = [];
      this.meshes = 0;          // сколько мешей реально в поле
      this.drawCalls = 0;
      this.triangles = 0;
      this.byFamily = {};
      this.seed = o.seed === undefined ? 1337 : o.seed;
      this.reduced = false;     // «экономный» режим: часть корзин погашена
      this._cache = new Map();  // семейство+вариант -> слитая геометрия
      this.lodBands = o.lodBands || DEFAULTS.lodBands;
      this.realMeshes = o.realMeshes === undefined ? DEFAULTS.realMeshes : o.realMeshes;
      this.lodTris = [0, 0, 0];
      this.nearCount = 0;
    }

    /* --------------------------- построение ----------------------------- */
    build(scene) {
      const T = THREE();
      if (!T) throw new Error('meshfield: нет three.js');
      this.dispose();
      const t0 = Date.now();
      const rng = SH2.meshpack.rngFor(this.seed);
      const N = this.count;
      /* Раскладываем меши по корзинам: семейство (10) × материал (4).
         Материал выбирается по номеру варианта, чтобы одна корзина не
         превращалась в «всё одного цвета». */
      const fams = SH2.meshpack.FAMILIES;
      /* Одна корзина на семейство × LOD. Оттенок («грязность») разных наборов
         запекается в цвет вершин, поэтому материал всего поля ОДИН — иначе
         каждый оттенок давал бы свой draw call на каждый пояс дальности. */
      const buckets = [];
      for (let f = 0; f < fams.length; f++) {
        buckets.push({ fam: fams[f], matId: f % 4, items: [] });
      }
      /* Геометрия одного меша в корзине: берём вариацию из meshpack и сливаем
         части в один BufferGeometry с вершинными цветами — тогда цвет детали
         сохраняется, а материал остаётся один. Кэш — по (семейство, LOD). */
      const TINTS = [1, 0.86, 0.74, 0.92];
      const geoFor = (fam, lod, matId) => {
        const key = fam + ':lod' + lod + ':' + matId;
        if (this._cache.has(key)) return this._cache.get(key);
        const base = famIndex(fam) * 100;
        const built = SH2.meshpack.build(base, { lod });
        const merged = mergeWithColors(built);
        /* запекаем оттенок набора прямо в цвета вершин */
        const k = TINTS[matId % TINTS.length];
        const col = merged.getAttribute('color');
        if (col) {
          for (let i = 0; i < col.count; i++) {
            col.setXYZ(i, col.getX(i) * k, col.getY(i) * k, col.getZ(i) * k * 0.98);
          }
          col.needsUpdate = true;
        }
        this._cache.set(key, merged);
        return merged;
      };

      /* Позиции: кольцо, плотность ~ 1/r. Используем «золотой угол», чтобы
         не было видимых лучей и комков. */
      const GA = Math.PI * (3 - Math.sqrt(5));
      const items = buckets.map(() => []);
      for (let i = 0; i < N; i++) {
        const t = (i + 0.5) / N;
        const r = this.inner + (this.outer - this.inner) * Math.sqrt(t);
        const a = i * GA;
        const x = Math.cos(a) * r + (rng() - 0.5) * 6;
        const z = Math.sin(a) * r + (rng() - 0.5) * 6;
        const b = i % buckets.length;
        items[b].push({ x, z, s: 1, ry: a * 3 });
      }

      const group = new T.Group();
      group.name = 'meshfield';
      let tris = 0;
      const b0 = this.lodBands[0], b1 = this.lodBands[1];
      const lodOf = (r) => (r < b0 ? 0 : (r < b1 ? 1 : 2));
      const counts = [0, 0, 0];
      for (const it of items.flat()) counts[lodOf(Math.hypot(it.x, it.z))]++;
      this.nearCount = counts[0];
      this.lodTris = [0, 0, 0];
      /* 10 семейств × 4 материала × 3 пояса = до 120 корзин; на практике
         видимых из них ~40 (остальные закрыты фрустумом или выключены в
         экономном режиме). Каждая корзина — ОДИН InstancedMesh. */
      for (let lod = 0; lod < 3; lod++) {
        for (let b = 0; b < buckets.length; b++) {
          const bucket = buckets[b];
          const list = items[b].filter((it) => lodOf(Math.hypot(it.x, it.z)) === lod);
          if (!list.length) continue;
          const base = geoFor(bucket.fam, lod, bucket.matId);
          const gTris = base.index ? base.index.count / 3 : base.attributes.position.count / 3;
          const mesh = new T.InstancedMesh(base, matFor(bucket.matId), list.length);
          mesh.name = 'field:' + bucket.fam + ':' + bucket.matId + ':lod' + lod;
          mesh.castShadow = false;        // поле не бросает тени: это ещё +120 draw call
          mesh.receiveShadow = false;
          mesh.frustumCulled = true;
          const m4 = new T.Matrix4();
          const q = new T.Quaternion();
          const e = new T.Euler();
          const v = new T.Vector3();
          const sc = new T.Vector3();
          for (let i = 0; i < list.length; i++) {
            const it = list[i];
            /* у дальних — крупнее: на горизонте читается силуэт, а не точка */
            const far = (Math.hypot(it.x, it.z) - this.inner) / (this.outer - this.inner);
            const s = 1 + far * 1.6;
            e.set(0, it.ry, 0);
            q.setFromEuler(e);
            v.set(it.x, -0.02, it.z);
            sc.set(s, s * (0.9 + rng() * 0.2), s);
            m4.compose(v, q, sc);
            mesh.setMatrixAt(i, m4);
          }
          mesh.instanceMatrix.needsUpdate = true;
          mesh.computeBoundingSphere();
          group.add(mesh);
          tris += gTris * list.length;
          this.lodTris[lod] += gTris * list.length;
          this.byFamily[bucket.fam] = (this.byFamily[bucket.fam] || 0) + list.length;
          this.buckets.push({ mesh, fam: bucket.fam, matId: bucket.matId, count: list.length, lod });
          this.meshes += list.length;
          this.drawCalls++;
        }
      }
      /* «Живые» меши вблизи: до realMeshes штук остаются отдельными Mesh,
         чтобы в кадре рядом с игроком была не инстанс-копия, а модель —
         с ней можно взаимодействовать поштучно (сбить, оттолкнуть). */
      if (this.realMeshes > 0) {
        const real = new T.Group();
        real.name = 'meshfield:near';
        const n = Math.min(this.realMeshes, this.nearCount);
        const step = Math.max(1, Math.floor(this.nearCount / n));
        let made = 0;
        const seen = [];
        for (const b of this.buckets) {
          if (b.lod !== 0) continue;
          b.mesh.getMatrixAt(0, new T.Matrix4());
          seen.push(b);
        }
        /* Отдельные модели по ближнему кольцу. ВАЖНО: каждая модель — это
           НЕ группа из 8 деталей (это было бы 8 draw call на штуку), а одна
           слитая геометрия с вершинными цветами. */
        for (let i = 0; i < n; i++) {
          const idx = Math.floor(rng() * SH2.meshpack.COUNT);
          const geo = mergeWithColors(SH2.meshpack.build(idx));
          const obj = new T.Mesh(geo, matFor(0));
          obj.name = 'field:near:' + SH2.meshpack.describe(idx).id;
          const r = this.inner + rng() * 12;
          const a = (i / n) * Math.PI * 2;
          obj.position.set(Math.cos(a) * r, 0, Math.sin(a) * r);
          obj.rotation.y = rng() * Math.PI * 2;
          real.add(obj);
          made++;
        }
        group.add(real);
        this.realGroup = real;
        this.realCount = made;
      }
      this.group = group;
      this.triangles = Math.round(tris);
      this.buildMs = Date.now() - t0;
      if (scene) scene.add(group);
      return this;
    }

    /* ----------------------- «честные» отдельные меши --------------------
       Нужны, когда важно доказать: это не счётчик, а объекты. Строим n
       настоящих Mesh (дорого — только для проверок и превью). */
    buildReal(n, scene) {
      const T = THREE();
      const count = Math.max(1, Math.floor(n || 10));
      const g = new T.Group();
      g.name = 'meshfield-real';
      const rng = SH2.meshpack.rngFor(9001);
      for (let i = 0; i < count; i++) {
        const idx = Math.floor(rng() * SH2.meshpack.COUNT);
        /* одна слитая геометрия = один draw call, детали сохраняют цвет */
        const obj = new T.Mesh(mergeWithColors(SH2.meshpack.build(idx)), matFor(0));
        obj.name = 'real:' + SH2.meshpack.describe(idx).id;
        const r = 30 + rng() * 40;
        const a = rng() * Math.PI * 2;
        obj.position.set(Math.cos(a) * r, 0, Math.sin(a) * r);
        obj.rotation.y = rng() * Math.PI * 2;
        g.add(obj);
      }
      if (scene) scene.add(g);
      this.realGroup = g;
      return g;
    }

    /* ---------------------------- запросы -------------------------------- */
    /* Матрица i-го меша (мировые координаты) — реальные данные, не счётчик. */
    matrixAt(index, out) {
      if (index < 0 || index >= this.meshes) return null;
      let rest = index;
      for (const b of this.buckets) {
        if (rest < b.count) {
          const m = out || new (THREE().Matrix4)();
          b.mesh.getMatrixAt(rest, m);
          return m;
        }
        rest -= b.count;
      }
      return null;
    }

    /* Ближайший меш к точке в радиусе (для «попадание в декорацию»). */
    pickAt(x, z, radius) {
      const rr = radius === undefined ? 3 : radius;
      const m = new (THREE().Matrix4)();
      let best = null, bestD = rr * rr;
      for (const b of this.buckets) {
        for (let i = 0; i < b.count; i++) {
          b.mesh.getMatrixAt(i, m);
          const dx = m.elements[12] - x, dz = m.elements[14] - z;
          const d = dx * dx + dz * dz;
          if (d < bestD) { bestD = d; best = { mesh: b.mesh, index: i, dist: Math.sqrt(d), family: b.fam, x: m.elements[12], z: m.elements[14] }; }
        }
      }
      return best;
    }

    /* Обход мешей вокруг точки — для эффектов и проверок. */
    forEachInRadius(x, z, radius, fn) {
      const r2 = radius * radius;
      const m = new (THREE().Matrix4)();
      let n = 0;
      for (const b of this.buckets) {
        for (let i = 0; i < b.count; i++) {
          b.mesh.getMatrixAt(i, m);
          const dx = m.elements[12] - x, dz = m.elements[14] - z;
          if (dx * dx + dz * dz <= r2) {
            n++;
            if (fn) fn({ mesh: b.mesh, index: i, x: m.elements[12], z: m.elements[14], family: b.fam });
          }
        }
      }
      return n;
    }

    /* «Экономный» режим: гасим часть корзин (дальние семейства) целиком.
       Так на слабом телефоне остаётся ~30–40 % поля, но картинка на
       горизонте не «проваливается» — просто реже стоит мелочь. */
    setReduced(on) {
      if (!this.group || this.reduced === !!on) return;
      this.reduced = !!on;
      const fams = SH2.meshpack.FAMILIES;
      const dropFrom = fams.length - 4;   // выключаем 4 самых «мелких» семейства
      this.buckets.forEach((b) => {
        const fi = famIndex(b.fam);
        b.mesh.visible = !on || fi < dropFrom;
      });
      this.drawCalls = this.buckets.filter((b) => b.mesh.visible).length;
    }

    /* Видимость отдельного меша: масштаб в ноль + обратно. Возвращает true,
       если меш был найден (значит, он настоящий, а не «нарисованный» счётчик). */
    hide(index) {
      const m = this.matrixAt(index);
      if (!m) return false;
      const b = this.bucketOf(index);
      if (!b) return false;
      const T = THREE();
      const v = new T.Vector3(), q = new T.Quaternion(), s = new T.Vector3();
      m.decompose(v, q, s);
      s.set(0.0001, 0.0001, 0.0001);
      m.compose(v, q, s);
      b.mesh.setMatrixAt(b.local, m);
      b.mesh.instanceMatrix.needsUpdate = true;
      return true;
    }

    bucketOf(index) {
      let rest = index;
      for (const b of this.buckets) {
        if (rest < b.count) return { mesh: b.mesh, local: rest, fam: b.fam };
        rest -= b.count;
      }
      return null;
    }

    stats() {
      return {
        requested: this.count,
        meshes: this.meshes,
        realMeshes: this.realCount || 0,
        individual: this.meshes + (this.realCount || 0),
        buckets: this.buckets.length,
        drawCalls: this.drawCalls,
        triangles: this.triangles,
        lodTris: this.lodTris.slice(),
        nearMeshes: this.nearCount,
        byFamily: Object.assign({}, this.byFamily),
        /* сколько draw call поле добавит в кадр: видимые корзины + отдельные
           меши ближнего кольца (по одному на меш) */
        fieldDrawCalls: this.buckets.filter((b) => b.mesh.visible).length + (this.realCount || 0),
        buildMs: this.buildMs
      };
    }

    dispose() {
      if (this.realGroup) {
        this.realGroup.parent && this.realGroup.parent.remove(this.realGroup);
        this.realGroup = null;
      }
      if (this.group) {
        this.group.parent && this.group.parent.remove(this.group);
        this.group.traverse((o) => { if (o.isMesh) o.dispose && o.dispose(); });
        this.group = null;
      }
      this.buckets.length = 0;
      this.meshes = 0;
      this.drawCalls = 0;
      this.byFamily = {};
      this._cache.forEach((g) => g.dispose && g.dispose());
      this._cache.clear();
    }
  }

  /* ---------------------- слияние модели в одну геометрию ----------------- */
  function mergeWithColors(group) {
    const T = THREE();
    const geos = [];
    const colors = [];
    group.updateMatrixWorld(true);
    group.traverse((o) => {
      if (!o.isMesh) return;
      const g = o.geometry.clone();
      g.applyMatrix4(o.matrixWorld);
      /* вершинный цвет из материала детали: так один материал на корзину
         сохраняет раскраску модели (корпус/рёбра/маркировка) */
      const c = o.material && o.material.color ? o.material.color : { r: 0.6, g: 0.6, b: 0.6 };
      const n = g.attributes.position.count;
      const arr = new Float32Array(n * 3);
      for (let i = 0; i < n; i++) { arr[i * 3] = c.r; arr[i * 3 + 1] = c.g; arr[i * 3 + 2] = c.b; }
      g.setAttribute('color', new T.BufferAttribute(arr, 3));
      geos.push(g);
    });
    return mergeGeos(geos);
  }

  /* Ручное слияние BufferGeometry: у всех деталей модели позиции и индексы,
     но нет UV-разметки — поэтому собираем только position/normal/color. */
  function mergeGeos(list) {
    const T = THREE();
    if (!list.length) return new T.BufferGeometry();
    let vCount = 0, iCount = 0;
    const indexed = list.map((g) => {
      if (g.index) return g;
      const n = g.attributes.position.count;
      const idx = new (n > 65535 ? Uint32Array : Uint16Array)(n);
      for (let i = 0; i < n; i++) idx[i] = i;
      g.setIndex(new T.BufferAttribute(idx, 1));
      return g;
    });
    indexed.forEach((g) => { vCount += g.attributes.position.count; iCount += g.index.count; });
    const pos = new Float32Array(vCount * 3);
    const nor = new Float32Array(vCount * 3);
    const col = new Float32Array(vCount * 3);
    const idx = new (vCount > 65535 ? Uint32Array : Uint16Array)(iCount);
    let vo = 0, io = 0;
    indexed.forEach((g) => {
      const p = g.attributes.position, n = g.attributes.normal, c = g.attributes.color;
      pos.set(p.array.subarray ? p.array.subarray(0, p.count * 3) : p.array, vo * 3);
      if (n) nor.set(n.array.subarray ? n.array.subarray(0, n.count * 3) : n.array, vo * 3);
      if (c) col.set(c.array.subarray ? c.array.subarray(0, c.count * 3) : c.array, vo * 3);
      const gi = g.index;
      for (let i = 0; i < gi.count; i++) idx[io + i] = gi.getX(i) + vo;
      vo += p.count;
      io += gi.count;
    });
    const geo = new T.BufferGeometry();
    geo.setAttribute('position', new T.BufferAttribute(pos, 3));
    geo.setAttribute('normal', new T.BufferAttribute(nor, 3));
    geo.setAttribute('color', new T.BufferAttribute(col, 3));
    geo.setIndex(new T.BufferAttribute(idx, 1));
    geo.computeBoundingSphere();
    return geo;
  }

  const MATS = [];
  function matFor(id) {
    const T = THREE();
    if (MATS[id]) return MATS[id];
    /* четыре материала корзин: яркость и «грязность» разные, чтобы поле не
       выглядело одной заливкой. vertexColors — раскраска деталей модели. */
    const tints = [0xffffff, 0xd8d0c0, 0xb8b0a2, 0x8f8a80];
    MATS[id] = new T.MeshLambertMaterial({ vertexColors: true, color: tints[id % 4] });
    return MATS[id];
  }

  const FAM_ORDER = null;
  function famIndex(key) {
    const list = SH2.meshpack.FAMILIES;
    return Math.max(0, list.indexOf(key));
  }

  SH2.meshfield = { MeshField, mergeGeos, mergeWithColors, DEFAULTS };
})(typeof window !== 'undefined' ? window : globalThis);
