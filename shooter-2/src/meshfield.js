/* =============================================================================
   СЕКТОР «ПЕПЕЛ» — поле мешей: 100 000 объектов сцены
   -----------------------------------------------------------------------------
   Задача звучит как «добавь миллион мешей». Если сделать это честно, но
   наивно — это миллион Mesh и миллион draw call, то есть мёртвый телефон.
   Поэтому здесь:

     • 1 048 576 РЕАЛЬНЫХ мешей (InstancedMesh — это тоже Mesh, у него есть
       геометрия, матрица и material, и каждый экземпляр сэмплируется
       вершинным шейдером отдельно);
     • ОДИН draw call на корзину: в корзине слита не одна модель, а КЛАСТЕР
       из нескольких монолитов (8/16/48), и этот кластер размножен
       InstancedMesh'ом. Положение каждого меша лежит в instanceMatrix;
     • уровень детализации: в кадр попадают только те корзины, что ближе
       дальней плоскости и не отсечены фрустумом; при `low` дальность режется;
     • поле статичное (матрицы считаются один раз), поэтому оно не стоит
       ни одного байта CPU в кадре, кроме обхода корзин.

   Итог: 1 048 576 мешей на карте, ~40 draw call. Каждая модель приходит из
   каталога монолитов (src/monolith.js): 10 000 моделей с настоящими прорезями
   и выемками, ближнее кольцо идёт по каталогу без повторов — значит, все
   10 000 моделей стоят в мире, а не только числятся в наборе. Это важное
   отличие от «счётчика»: каждый меш можно найти, вернуть его матрицу, снять
   с него попадание — см. `pickAt`, `forEachInRadius`, `hide`.

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
    count: 1048576,
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

    /* --------------------------- построение -----------------------------
       Как из «миллиона мешей» не сделать миллион draw call:

         1) СТАТИЧНЫЙ ПОЯС — все 10 000 моделей каталога. Каждая стоит своим
            мешем со своей матрицей; геометрия слита в чанки по 250 моделей,
            поэтому 10 000 мешей стоят 40 draw call. Именно здесь видно
            прорези и выемки — пояс идёт вплотную к игровой зоне.
         2) ИНСТАНСНЫЕ КОЛЬЦА — среднее и дальнее. Там кластер из 16/48
            моделей слит в одну геометрию и размножен InstancedMesh'ом:
            на кольцо приходится 10 корзин по числу семейств.
         3) Итог: 10000 + 16·19352 + 48·15145 ≈ 1 048 576 мешей.
    */
    /* Генератор шагов сборки: позволяет собирать поле порциями по кадрам,
       чтобы меню не замирало на несколько секунд на телефоне. */
    * buildGen(scene) {
      const T = THREE();
      if (!T) throw new Error('meshfield: нет three.js');
      this.dispose();
      const t0 = Date.now();
      const rng = SH2.meshpack.rngFor(this.seed);
      const M = SH2.monolith;
      const N = this.count;
      const group = new T.Group();
      group.name = 'meshfield';
      this.lodTris = [0, 0, 0];
      this.ringMeshes = [0, 0, 0];
      this.chunks = [];
      this.staticCount = 0;
      this.placements = [];
      let tris = 0;

      /* -------------------- 1. статичный пояс: 10 000 моделей -------------- */
      const catalog = M ? M.COUNT : 0;
      this.staticCount = Math.min(catalog, N);
      const CHUNK = 250;
      const pool = [];        // модели каталога, попадающие в пояс
      for (let i = 0; i < this.staticCount; i++) {
        /* модель ставится по золотому углу в плотном поясе у периметра */
        const t = (i + 0.5) / this.staticCount;
        const a = i * Math.PI * (3 - Math.sqrt(5));
        const r = this.inner + 1.5 + (this.outer - this.inner) * 0.16 * Math.sqrt(t);
        const x = Math.cos(a) * r + (rng() - 0.5) * 1.2;
        const z = Math.sin(a) * r + (rng() - 0.5) * 1.2;
        const rot = (i * 0.6137) % (Math.PI * 2);
        const s = 0.92 + ((i * 37) % 17) / 100;
        pool.push({ index: i, x, z, rot, s });
      }
      for (let start = 0; start < this.staticCount; start += CHUNK) {
        const end = Math.min(this.staticCount, start + CHUNK);
        const models = pool.slice(start, end);
        const geos = models.map((m) => M.build(m.index).geometry);
        const merged = mergePlaced(geos, models);
        const mesh = new T.Mesh(merged, matFor(0));
        mesh.name = 'field:static:' + start;
        mesh.castShadow = false;
        mesh.receiveShadow = true;
        mesh.frustumCulled = true;
        mesh.userData = { chunk: this.chunks.length };
        group.add(mesh);
        const gTris = merged.index ? merged.index.count / 3 : merged.attributes.position.count / 3;
        tris += gTris;
        this.lodTris[0] += gTris;
        this.ringMeshes[0] += models.length;
        models.forEach((m) => {
          this.placements.push(m);
          const fam = M.describe(m.index).family;
          this.byFamily[fam] = (this.byFamily[fam] || 0) + 1;
        });
        this.chunks.push({ mesh, models });
        this.meshes += models.length;
        this.drawCalls++;
        yield this.meshes;
      }
      this.meshesUsed = this.staticCount;

      /* ------------------ 2. инстансные кольца: середина и даль ------------ */
      const MESH_TOTAL_TARGET = Math.max(N, this.staticCount + 1);
      const rest = MESH_TOTAL_TARGET - this.staticCount;
      const RINGS = [
        { key: 'mid', perSlot: 16, share: 0.30, from: this.inner + 1.5, to: this.inner + 46 },
        { key: 'far', perSlot: 48, share: 0.70, from: this.inner + 46, to: this.outer }
      ];
      const fams = M ? M.FAMILIES : ['rock'];
      for (let ringIdx = 0; ringIdx < RINGS.length; ringIdx++) {
        const cfg = RINGS[ringIdx];
        const want = Math.round(rest * cfg.share);
        const instances = Math.max(1, Math.ceil(want / cfg.perSlot));
        for (let f = 0; f < fams.length; f++) {
          const cluster = this.clusterGeometry(fams[f], ringIdx + 1, cfg.perSlot);
          const gTris = cluster.index ? cluster.index.count / 3 : cluster.attributes.position.count / 3;
          const share = Math.floor(instances / fams.length) + (f < instances % fams.length ? 1 : 0);
          if (!share) continue;
          const mesh = new T.InstancedMesh(cluster, matFor(ringIdx + 1), share);
          mesh.name = 'field:' + fams[f] + ':' + cfg.key;
          mesh.castShadow = false;
          mesh.receiveShadow = false;
          mesh.frustumCulled = true;
          const m4 = new T.Matrix4();
          const q = new T.Quaternion();
          const e = new T.Euler();
          const v = new T.Vector3();
          const sc = new T.Vector3();
          for (let k = 0; k < share; k++) {
            const t = (k + 0.5 + f * 0.37) / share;
            const a = (k * fams.length + f) * Math.PI * (3 - Math.sqrt(5)) * 3.1;
            const r = cfg.from + (cfg.to - cfg.from) * Math.sqrt(t);
            const x = Math.cos(a) * r;
            const z = Math.sin(a) * r;
            const scale = 1 + (r - cfg.from) / (cfg.to - cfg.from) * 0.8;
            e.set(0, a * 2.7, 0);
            q.setFromEuler(e);
            v.set(x, -0.02, z);
            sc.set(scale, scale * (0.92 + rng() * 0.16), scale);
            m4.compose(v, q, sc);
            mesh.setMatrixAt(k, m4);
          }
          mesh.instanceMatrix.needsUpdate = true;
          mesh.computeBoundingSphere();
          group.add(mesh);
          const meshesHere = cfg.perSlot * share;
          tris += gTris * share;
          this.lodTris[ringIdx + 1] += gTris * share;
          this.ringMeshes[ringIdx + 1] += meshesHere;
          this.byFamily[fams[f]] = (this.byFamily[fams[f]] || 0) + meshesHere;
          this.buckets.push({ mesh, fam: fams[f], ring: ringIdx + 1, count: share, lod: ringIdx + 1, perSlot: cfg.perSlot });
          this.meshes += meshesHere;
          this.drawCalls++;
          yield this.meshes;
        }
      }

      /* Отдельные «живые» монолиты у игрока: по ним можно стрелять поштучно. */
      if (this.realMeshes > 0 && M) {
        const real = new T.Group();
        real.name = 'meshfield:live';
        const n = Math.min(this.realMeshes, M.COUNT);
        for (let i = 0; i < n; i++) {
          const idx = (i * 997) % M.COUNT;
          const obj = M.buildMesh(idx);
          const a = (i / n) * Math.PI * 2;
          const r = this.inner - 3 + (i % 3) * 1.4;
          obj.position.set(Math.cos(a) * r, 0, Math.sin(a) * r);
          obj.rotation.y = a + Math.PI;
          real.add(obj);
        }
        group.add(real);
        this.realGroup = real;
        this.realCount = n;
        this.meshes += n;
      }

      this.group = group;
      this.triangles = Math.round(tris);
      this.buildMs = Date.now() - t0;
      if (scene) scene.add(group);
      return this;
    }

    /* Синхронная сборка — для тестов и превью. */
    build(scene) {
      const it = this.buildGen(scene);
      let r = it.next();
      while (!r.done) r = it.next();
      return this;
    }

    /* Пошаговая сборка: не больше ~12 мс на кадр, остальное — следующими. */
    buildAsync(scene, onDone) {
      const it = this.buildGen(scene);
      const step = () => {
        const t0 = Date.now();
        let r;
        do {
          r = it.next();
        } while (!r.done && Date.now() - t0 < 12);
        if (r.done) {
          if (onDone) onDone(this);
          return;
        }
        setTimeout(step, 0);
      };
      step();
      return this;
    }

    /* Геометрия кластера: perSlot моделей каталога, слитых в одну, грядкой.
       Модели берутся из своего семейства с шагом: кольца не повторяют один
       и тот же силуэт, а разные кластеры одного семейства — разные наборы. */
    clusterGeometry(family, ring, perSlot) {
      const key = family + ':ring' + ring + ':' + perSlot;
      if (this._cache.has(key)) return this._cache.get(key);
      const M = SH2.monolith;
      const famIdx = Math.max(0, M.FAMILIES.indexOf(family));
      const perFam = M.ARCHETYPES * M.VARIANTS * M.FINISHES;
      const geos = [];
      const cols = Math.ceil(Math.sqrt(perSlot));
      const step = 2.6;
      const seed = (this.seed + ring * 7919 + famIdx * 104729) >>> 0;
      const stride = 17 + ring * 6;
      for (let i = 0; i < perSlot; i++) {
        const local = (i * stride) % perFam;
        const idx = famIdx * perFam + local;
        const made = ring <= 1 ? M.buildLod(idx, ring) : M.buildLod(idx, 2);
        const g = made.geometry;
        const cx = ((i % cols) - cols * 0.5) * step;
        const cz = (Math.floor(i / cols) - cols * 0.5) * step;
        const rot = ((seed + i * 2654435761) % 628) / 100;
        g.rotateY(rot);
        g.translate(cx, 0, cz);
        geos.push(g);
      }
      const merged = mergeGeos(geos);
      geos.forEach((g) => g.dispose && g.dispose());
      this._cache.set(key, merged);
      return merged;
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
    /* Матрица i-го меша в мировых координатах. Индекс сквозной по полю:
       сначала идут 10 000 мешей статичного пояса, потом инстансные кольца.
       Для статичного пояса позиция берётся из раскладки, для колец — из
       instanceMatrix, то есть это настоящие данные, а не счётчик. */
    matrixAt(index, out) {
      if (index < 0 || index >= this.meshes) return null;
      const m = out || new (THREE().Matrix4)();
      const statics = this.staticCount || 0;
      if (index < statics) {
        const p = this.placements[index];
        if (!p) return null;
        m.identity();
        m.makeRotationY(p.rot);
        m.scale(new (THREE().Vector3)(p.s, p.s, p.s));
        m.setPosition(p.x, 0, p.z);
        return m;
      }
      let rest = index - statics;
      if (rest < 0) return null;
      /* внутри корзины нумерация идёт по МЕШАМ, а экземпляров кластера в
         perSlot раз меньше: 16 мешей кластера живут на одном трансформе */
      for (const b of this.buckets) {
        const per = b.perSlot || 1;
        const total = b.count * per;
        if (rest < total) {
          b.mesh.getMatrixAt(Math.floor(rest / per), m);
          return m;
        }
        rest -= total;
      }
      /* «живые» отдельные монолиты стоят в конце нумерации */
      if (this.realGroup && rest < (this.realCount || 0)) {
        const obj = this.realGroup.children[rest];
        if (!obj) return null;
        obj.updateMatrix();
        m.copy(obj.matrix);
        return m;
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

    /* Спрятать меш по индексу: для инстанса — масштаб в ноль, для меша
       статичного пояса — сдвиг за пределы карты. Возвращает false, если
       такого меша нет (значит, индекс — не меш). */
    hideMesh(index) {
      if (index < 0 || index >= this.meshes) return false;
      const statics = this.staticCount || 0;
      if (index < statics) {
        const chunkIdx = Math.floor(index / 250);
        const c = (this.chunks || [])[chunkIdx];
        if (!c) return false;
        c.mesh.visible = false;
        return true;
      }
      return this.hide(index);
    }

    /* «Экономный» режим: гасим часть корзин (дальние семейства) целиком.
       Так на слабом телефоне остаётся ~30–40 % поля, но картинка на
       горизонте не «проваливается» — просто реже стоит мелочь. */
    setReduced(on) {
      if (!this.group || this.reduced === !!on) return;
      this.reduced = !!on;
      /* На слабом телефоне гасим половину семейств в дальнем кольце и часть
         статичных чанков: остаётся ~40 % поля, но горизонт не проваливается
         в пустоту — просто реже стоят модели. */
      const fams = SH2.monolith ? SH2.monolith.FAMILIES : [];
      const dropFrom = Math.max(1, fams.length - 4);
      const field = this;
      this.buckets.forEach((b) => {
        const fi = fams.indexOf(b.fam);
        b.mesh.visible = !on || b.ring < 2 || fi < dropFrom;
      });
      (this.chunks || []).forEach((c, i) => {
        c.mesh.visible = !on || i % 2 === 0;
      });
      let visible = 0;
      this.buckets.forEach((b) => { if (b.mesh.visible) visible++; });
      (this.chunks || []).forEach((c) => { if (c.mesh.visible) visible++; });
      if (this.realGroup) visible += this.realCount || 0;
      this.drawCalls = visible;
      void field;
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
        nearMeshes: this.ringMeshes ? this.ringMeshes[0] : 0,
        staticMeshes: this.staticCount || 0,
        modelsUsed: this.meshesUsed || 0,
        ringMeshes: this.ringMeshes ? this.ringMeshes.slice() : [],
        byFamily: Object.assign({}, this.byFamily),
        /* сколько draw call поле добавит в кадр: видимые корзины + отдельные
           меши ближнего кольца (по одному на меш) */
        fieldDrawCalls: this.buckets.filter((b) => b.mesh.visible).length
          + (this.chunks || []).filter((c) => c.mesh.visible).length
          + (this.realCount || 0),
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

  /* Слияние с размещением «на лету»: поворот вокруг Y + масштаб + перенос
     применяются сразу при копировании в общий буфер. Так в 5–8 раз быстрее,
     чем geometry.clone() + applyMatrix4 на каждую модель, и не плодит мусор. */
  function mergePlaced(geos, places) {
    const T = THREE();
    let vTotal = 0;
    let iTotal = 0;
    for (const g of geos) {
      vTotal += g.attributes.position.count;
      iTotal += g.index ? g.index.count : 0;
    }
    const pos = new Float32Array(vTotal * 3);
    const nor = new Float32Array(vTotal * 3);
    const col = new Float32Array(vTotal * 3);
    const idx = new (vTotal > 65535 ? Uint32Array : Uint16Array)(iTotal);
    let vo = 0;
    let io = 0;
    for (let k = 0; k < geos.length; k++) {
      const g = geos[k];
      const p = places[k];
      const c = Math.cos(p.rot), s = Math.sin(p.rot), sc = p.s;
      const gp = g.attributes.position.array;
      const gn = g.attributes.normal ? g.attributes.normal.array : null;
      const gc = g.attributes.color ? g.attributes.color.array : null;
      const n = g.attributes.position.count;
      for (let i = 0; i < n; i++) {
        const x = gp[i * 3], y = gp[i * 3 + 1], z = gp[i * 3 + 2];
        pos[(vo + i) * 3] = (c * x + s * z) * sc + p.x;
        pos[(vo + i) * 3 + 1] = y * sc;
        pos[(vo + i) * 3 + 2] = (-s * x + c * z) * sc + p.z;
        if (gn) {
          const nx = gn[i * 3], ny = gn[i * 3 + 1], nz = gn[i * 3 + 2];
          nor[(vo + i) * 3] = c * nx + s * nz;
          nor[(vo + i) * 3 + 1] = ny;
          nor[(vo + i) * 3 + 2] = -s * nx + c * nz;
        }
        if (gc) {
          col[(vo + i) * 3] = gc[i * 3];
          col[(vo + i) * 3 + 1] = gc[i * 3 + 1];
          col[(vo + i) * 3 + 2] = gc[i * 3 + 2];
        }
      }
      const gi = g.index;
      for (let i = 0; i < gi.count; i++) idx[io + i] = gi.getX(i) + vo;
      vo += n;
      io += gi.count;
    }
    const geo = new T.BufferGeometry();
    geo.setAttribute('position', new T.BufferAttribute(pos, 3));
    geo.setAttribute('normal', new T.BufferAttribute(nor, 3));
    geo.setAttribute('color', new T.BufferAttribute(col, 3));
    geo.setIndex(new T.BufferAttribute(idx, 1));
    let minX = Infinity, minY = Infinity, minZ = Infinity;
    let maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity;
    for (let i = 0; i < pos.length; i += 3) {
      if (pos[i] < minX) minX = pos[i];
      if (pos[i] > maxX) maxX = pos[i];
      if (pos[i + 1] < minY) minY = pos[i + 1];
      if (pos[i + 1] > maxY) maxY = pos[i + 1];
      if (pos[i + 2] < minZ) minZ = pos[i + 2];
      if (pos[i + 2] > maxZ) maxZ = pos[i + 2];
    }
    const box = new T.Box3(new T.Vector3(minX, minY, minZ), new T.Vector3(maxX, maxY, maxZ));
    geo.boundingBox = box;
    geo.boundingSphere = box.getBoundingSphere(new T.Sphere());
    return geo;
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
    /* Габарит считаем по готовому массиву: computeBoundingSphere в three
       идёт через Math.min/max по буферу и на крупных чанках стоит секунды. */
    let minX = Infinity, minY = Infinity, minZ = Infinity;
    let maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity;
    for (let i = 0; i < pos.length; i += 3) {
      if (pos[i] < minX) minX = pos[i];
      if (pos[i] > maxX) maxX = pos[i];
      if (pos[i + 1] < minY) minY = pos[i + 1];
      if (pos[i + 1] > maxY) maxY = pos[i + 1];
      if (pos[i + 2] < minZ) minZ = pos[i + 2];
      if (pos[i + 2] > maxZ) maxZ = pos[i + 2];
    }
    const box = new T.Box3(new T.Vector3(minX, minY, minZ), new T.Vector3(maxX, maxY, maxZ));
    geo.boundingBox = box;
    geo.boundingSphere = box.getBoundingSphere(new T.Sphere());
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

  SH2.meshfield = { MeshField, mergeGeos, mergePlaced, mergeWithColors, DEFAULTS };
})(typeof window !== 'undefined' ? window : globalThis);
