/* =============================================================================
   СЕКТОР «ПЕПЕЛ» — модели и геометрия, собранные с нуля
   -----------------------------------------------------------------------------
   • Риг солдата: 22 анимируемые кости, примитивы Box/Capsule/Cylinder/Lathe
   • Пять видов оружия, ящики, контейнеры, вышки, мешки — всё процедурное
   • Оптимизация: кэш материалов, склейка статики по материалу (draw call ↓),
     InstancedMesh для повторов, LOD-версия рига для дальних бойцов
   ============================================================================= */
(function (root) {
  'use strict';
  const SH2 = (root.SH2 = root.SH2 || {});
  const D = SH2.data;
  const THREE = () => root.THREE;

  /* ---------------------------- кэш материалов ------------------------------ */
  const matCache = new Map();
  /* «Выцветание» карты: карта должна читаться светлой, но переписывать
     каждый hex в данных (здания, контейнеры, техника задают свои цвета)
     бессмысленно. Поэтому на время сборки уровня включается общий подъём
     яркости: цвет подмешивается к белому, контраст при этом сохраняется —
     тени остаются тенями, просто светлее. */
  let mapLift = 0;
  function lift(color) {
    if (!mapLift) return color;
    const r = (color >> 16) & 255, g = (color >> 8) & 255, b = color & 255;
    const L = (v) => Math.round(v + (255 - v) * mapLift);
    return (L(r) << 16) | (L(g) << 8) | L(b);
  }

  /* Материал по цвету и настройкам. Кэш один на игру, поэтому материал,
     выданный отсюда, считается ОБЩИМ: менять его цвет на месте нельзя —
     потемнеет всё, что этим цветом нарисовано (так «серела» вся карта от
     рёбер контейнеров). Процедурный шум поверхности — mapNoise. */
  const noiseCache = new Map();

  /* Мягкий процедурный шум в canvas-текстуре: даёт «материальность» без
     внешних файлов. Один и тот же шум переиспользуется всеми материалами
     с этим ключом, поэтому на всю карту приходится 2–3 текстуры. */
  function noiseTexture(kind) {
    if (noiseCache.has(kind)) return noiseCache.get(kind);
    const T = THREE();
    const doc = root.document;
    let tex = null;
    if (doc && doc.createElement) {
      const cv = doc.createElement('canvas');
      const size = kind === 'grain' ? 64 : 128;
      cv.width = cv.height = size;
      const g = cv.getContext && cv.getContext('2d');
      if (g) {
        /* крупное пятно + мелкое зерно: так читается и вблизи, и вдали */
        g.fillStyle = '#ffffff';
        g.fillRect(0, 0, size, size);
        for (let i = 0; i < size * size * 0.28; i++) {
          const x = Math.random() * size, y = Math.random() * size;
          const v = 200 + Math.random() * 55;
          g.fillStyle = 'rgba(' + v + ',' + v + ',' + v + ',' + (0.35 + Math.random() * 0.4) + ')';
          g.fillRect(x, y, 1 + Math.random() * 2, 1 + Math.random() * 2);
        }
        tex = new T.CanvasTexture(cv);
        tex.wrapS = tex.wrapT = T.RepeatWrapping;
        tex.repeat.set(kind === 'grain' ? 4 : 2, kind === 'grain' ? 4 : 2);
      }
    }
    if (!tex) tex = null;
    noiseCache.set(kind, tex);
    return tex;
  }

  function mat(color, opts) {
    const key = lift(color) + '|' + mapLift + '|' + JSON.stringify(opts || {});
    let m = matCache.get(key);
    if (m) return m;
    const o = opts || {};
    /* mapNoise: 'grain' — мелкое зерно (металл, бетон), 'blotch' — пятна
       (ткань, грунт). Без него материал остаётся ровной заливкой. */
    const map = o.mapNoise ? noiseTexture(o.mapNoise) : null;
    m = new (THREE().MeshLambertMaterial)({
      color: lift(color),
      /* при наличии карты шума цвет умножается на неё — компенсируем */
      map,
      flatShading: !!o.flat,
      transparent: !!o.transparent,
      opacity: o.opacity === undefined ? 1 : o.opacity,
      emissive: o.emissive || 0x000000,
      emissiveIntensity: o.emissiveIntensity === undefined ? 1 : o.emissiveIntensity,
      side: o.side || THREE().FrontSide,
      depthWrite: o.depthWrite === undefined ? true : o.depthWrite
    });
    if (map) m.color.multiplyScalar(1.12);
    matCache.set(key, m);
    return m;
  }

  /* ------------------------ ручное слияние геометрий ------------------------- */
  // BufferGeometryUtils в three.min.js нет, поэтому пишем своё слияние
  function mergeGeometries(geoms) {
    const T = THREE();
    let vCount = 0, iCount = 0, hasUV = true, hasNorm = true;
    geoms.forEach((g) => {
      vCount += g.attributes.position.count;
      iCount += g.index ? g.index.count : g.attributes.position.count;
      if (!g.attributes.uv) hasUV = false;
      if (!g.attributes.normal) hasNorm = false;
    });
    const pos = new Float32Array(vCount * 3);
    const nor = hasNorm ? new Float32Array(vCount * 3) : null;
    const uv = hasUV ? new Float32Array(vCount * 2) : null;
    const idx = vCount > 65535 ? new Uint32Array(iCount) : new Uint16Array(iCount);
    let vo = 0, io = 0;
    geoms.forEach((g) => {
      const p = g.attributes.position.array;
      pos.set(p, vo * 3);
      if (nor) nor.set(g.attributes.normal.array, vo * 3);
      if (uv) uv.set(g.attributes.uv.array, vo * 2);
      const n = g.attributes.position.count;
      if (g.index) {
        const a = g.index.array;
        for (let i = 0; i < a.length; i++) idx[io + i] = a[i] + vo;
        io += a.length;
      } else {
        for (let i = 0; i < n; i++) idx[io + i] = i + vo;
        io += n;
      }
      vo += n;
    });
    const out = new T.BufferGeometry();
    out.setAttribute('position', new T.BufferAttribute(pos, 3));
    if (nor) out.setAttribute('normal', new T.BufferAttribute(nor, 3));
    if (uv) out.setAttribute('uv', new T.BufferAttribute(uv, 2));
    out.setIndex(new T.BufferAttribute(idx, 1));
    out.computeBoundingSphere();
    return out;
  }

  // Собирает список {geometry, matrix, color, flat} в массив мешей по цвету
  function bakeStatic(list, name) {
    const byColor = new Map();
    list.forEach((item) => {
      const key = item.color + (item.flat ? '|f' : '');
      if (!byColor.has(key)) byColor.set(key, []);
      const g = item.geometry.clone();
      g.applyMatrix4(item.matrix);
      byColor.get(key).push({ g, flat: item.flat, color: item.color });
    });
    return Array.from(byColor.entries()).map(([key, items]) => {
      const merged = mergeGeometries(items.map((i) => i.g));
      items.forEach((i) => i.g.dispose());
      const mesh = new (THREE().Mesh)(merged, mat(items[0].color, { flat: items[0].flat }));
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      mesh.name = name + ':' + key;
      return mesh;
    });
  }

  /* --------------------------- помощники примитивов ------------------------- */
  const _m = new (function () {})();
  function xform(geo, x, y, z, rx, ry, rz, sx, sy, sz) {
    const T = THREE();
    const m = new T.Matrix4();
    const q = new T.Quaternion().setFromEuler(new T.Euler(rx || 0, ry || 0, rz || 0, 'XYZ'));
    m.compose(new T.Vector3(x || 0, y || 0, z || 0), q,
      new T.Vector3(sx === undefined ? 1 : sx, sy === undefined ? 1 : sy, sz === undefined ? 1 : sz));
    return m;
  }
  function box(w, h, d) { return new (THREE().BoxGeometry)(w, h, d); }

  /* ============================== РИГ СОЛДАТА ============================== */
  // Кости: имя -> позиция в родителе. Порядок важен: родитель раньше ребёнка.
  const BONE_DEF = [
    ['pelvis', null, 0, 0.92, 0],
    ['spine', 'pelvis', 0, 0.16, 0],
    ['chest', 'spine', 0, 0.16, 0],
    ['neck', 'chest', 0, 0.20, 0],
    ['head', 'neck', 0, 0.085, 0],
    ['shoulderL', 'chest', 0.195, 0.125, 0],
    ['upperArmL', 'shoulderL', 0.03, -0.035, 0],
    ['lowerArmL', 'upperArmL', 0, -0.30, 0],
    ['handL', 'lowerArmL', 0, -0.275, 0],
    ['shoulderR', 'chest', -0.195, 0.125, 0],
    ['upperArmR', 'shoulderR', -0.03, -0.035, 0],
    ['lowerArmR', 'upperArmR', 0, -0.30, 0],
    ['handR', 'lowerArmR', 0, -0.275, 0],
    ['hipL', 'pelvis', 0.105, -0.06, 0],
    ['upperLegL', 'hipL', 0, 0, 0],
    ['lowerLegL', 'upperLegL', 0, -0.44, 0],
    ['footL', 'lowerLegL', 0, -0.42, 0],
    ['hipR', 'pelvis', -0.105, -0.06, 0],
    ['upperLegR', 'hipR', 0, 0, 0],
    ['lowerLegR', 'upperLegR', 0, -0.44, 0],
    ['footR', 'lowerLegR', 0, -0.42, 0]
  ];

  // Деталь=1 — полная модель; деталь=0 — LOD для дальних (меньше мешей)
  function buildRig(type, opts) {
    const T = THREE();
    const E = D.ENEMY_BY_ID[type] || D.ENEMY_BY_ID.grunt;
    const o = opts || {};
    const lowDetail = o.lowDetail;
    const isPlayer = o.player;
    const skin = isPlayer ? 0xd8b394 : E.skin;
    const body = isPlayer ? 0x2f3a4a : E.bodyColor;
    const gear = isPlayer ? 0x1a2230 : E.gearColor;
    const accent = isPlayer ? 0x6fc8ff : 0xb2483a;
    const scale = o.scale || E.scale || 1;

    const root = new T.Group();
    root.name = 'soldier:' + type;
    const bones = {};
    const boneList = [];
    BONE_DEF.forEach(([name, parent, x, y, z]) => {
      const b = new T.Group();
      b.name = name;
      b.position.set(x, y, z);
      b.rotation.order = 'YXZ';
      (parent ? bones[parent] : root).add(b);
      bones[name] = b;
      boneList.push(b);
    });

    const add = (boneName, geo, color, x, y, z, rx, ry, rz, flat) => {
      const mesh = new T.Mesh(geo, mat(color, { flat: !!flat }));
      mesh.position.set(x || 0, y || 0, z || 0);
      mesh.rotation.set(rx || 0, ry || 0, rz || 0);
      mesh.castShadow = !lowDetail;
      mesh.receiveShadow = !lowDetail;
      bones[boneName].add(mesh);
      return mesh;
    };

    /* --- всё тело строится по контурам и сечениям (src/soldier.js) --- */
    const PAL = { skin, body, gear, accent };
    SH2.soldier.buildBody(add, bones, PAL, { low: !!lowDetail });

    /* --- оружие: крепится к груди, руки дотягиваются IK-хватом --- */
    /* --- оружие: крепится к груди, руки дотягиваются IK-хватом --- */
    const weaponSlot = new T.Group();
    weaponSlot.name = 'weapon';
    weaponSlot.position.set(0.135, 0.010, 0.235);
    weaponSlot.rotation.set(-0.05, 0.09, 0);
    bones.chest.add(weaponSlot);
    const gripR = new T.Object3D();
    const gripL = new T.Object3D();
    weaponSlot.add(gripR);
    weaponSlot.add(gripL);
    rig_grips(gripR, gripL, 'rifle');

    function rig_grips(gr, gl, weaponId) {
      const g = D.GRIPS[weaponId] || D.GRIPS.rifle;
      gr.position.set(g.r[0], g.r[1], g.r[2]);
      gl.position.set(g.l[0], g.l[1], g.l[2]);
      rig_grips.shoulder = g.shoulder;
    }

    bones.weapon = weaponSlot;
    const rig = {
      root, bones, boneList, weaponSlot, gripR, gripL,
      setGrips: (weaponId) => rig_grips(gripR, gripL, weaponId),
      ikEnabled: true,
      lowDetail: !!lowDetail, type, isPlayer,
      scale, eyeHeight: 1.62 * scale, height: 1.78 * scale,
      headBone: bones.head, chestBone: bones.chest,
      weaponId: null,
      meshes: []
    };
    root.traverse((c) => {
      if (c.isMesh) {
        rig.meshes.push(c);
        // локальные трансформации деталей не меняются: не считаем их каждый кадр
        c.matrixAutoUpdate = false;
        c.updateMatrix();
      }
    });
    rig.armLengths = { upper: 0.30, lower: 0.275 };
    root.scale.setScalar(scale);
    // базовые позиции костей — по ИМЕНИ кости (порядок частей и костей разный!)
    rig.basePositions = {};
    boneList.forEach((b) => { rig.basePositions[b.name] = b.position.clone(); });
    return rig;
  }

  /* ============================== ОРУЖИЕ ================================== */
  // Оружие целиком строится по чертежам: контур сбоку -> выдавливание с фаской,
  // стволы и оптика -> тела вращения (src/gunblueprints.js).
  function buildWeaponModel(id, opts) {
    const o = opts || {};
    const g = SH2.gunblueprints.buildFromBlueprint(id, { noShadow: o.noShadow });
    // сглаживание силы света: те же материалы, что и у персонажа
    g.traverse((c) => {
      if (c.isMesh) {
        c.castShadow = !o.noShadow;
        c.receiveShadow = !o.noShadow;
        c.matrixAutoUpdate = false;
        c.updateMatrix();
      }
    });
    return g;
  }

  /* ======================== ПРОПСЫ КАРТЫ (по контурам) ==================== */
  // Бочка/цистерна — тело вращения по профилю, камень — контур с фаской,
  // мешки — тела вращения с лёгким сжатием.
  /* Бочка: корпус-клёпка с «пузом», два обруча, утопленная крышка и пробка.
     Раньше это был гладкий цилиндр — на светлой карте он читался «стаканом»
     и не давал масштаба рядом с бойцом. Профили задаются парами [высота,
     радиус]: так строит LatheGeometry в outline.revolve. */
  function propBarrel(s, color) {
    const T = THREE();
    const O = SH2.outline;
    const g = new T.Group();
    const H = s * 0.93, R = s * 0.44;
    const m = mat(color || 0x6a4a2c, { flat: true, mapNoise: 'grain' });
    /* 24 сегмента вместо 14: на близком плане бочка больше не «ведро»;
       рёбра профиля остаются, меняется только гладкость силуэта */
    const body = new T.Mesh(O.revolve([
      [0, 0], [0.015 * s, R * 0.88], [H * 0.10, R * 1.00],
      [H * 0.50, R * 1.05], [H * 0.90, R * 1.00], [H * 0.985, R * 0.93], [H, 0]
    ], { segments: 24 }), m);
    body.castShadow = true; body.receiveShadow = true;
    g.add(body);
    // обручи: узкие обода чуть шире корпуса, тёмный металл
    const hoopM = mat(0x3b3a36, { flat: true });
    [0.18, 0.76].forEach((t) => {
      const hoop = new T.Mesh(O.revolve([
        [0, R * 1.03], [0.010 * s, R * 1.075], [0.030 * s, R * 1.075], [0.038 * s, R * 1.03]
      ], { segments: 14 }), hoopM);
      hoop.position.y = H * t;
      hoop.castShadow = true;
      g.add(hoop);
    });
    // горловина и пробка на крышке
    const cap = new T.Mesh(O.revolve([
      [0, 0], [0, R * 0.26], [0.018 * s, R * 0.24], [0.018 * s, 0]
    ], { segments: 10 }), mat(0x2a2a28, { flat: true }));
    cap.position.set(R * 0.36, H - 0.004 * s, 0);
    g.add(cap);
    return g;
  }

  function propRock(s, color) {
    const T = THREE();
    const geo = SH2.outline.outlineMesh(SH2.outline.smoothOutline([
      [-0.5, 0.02], [-0.34, 0.34], [-0.10, 0.60], [0.22, 0.52], [0.44, 0.26], [0.50, 0.02]
    ], 2), { depth: s * 0.9, bevel: s * 0.10, bevelSegments: 2 });
    geo.scale(s * 1.1, s * 1.1, s * 1.1);
    return new T.Mesh(geo, mat(color || 0x585349, { flat: true, mapNoise: 'blotch' }));
  }
  function propSandbags(count, color) {
    const T = THREE();
    const g = new T.Group();
    const bagGeo = SH2.outline.revolve([[0, 0.22], [0.10, 0.30], [0.24, 0.30], [0.30, 0.20], [0.31, 0.0]], { segments: 8 });
    bagGeo.scale(1.0, 1.0, 0.62);
    for (let i = 0; i < count; i++) {
      const m = new T.Mesh(bagGeo, mat(color || 0x6b6247, { flat: true }));
      const row = i < count / 2 ? 0 : 1;
      const k = row === 0 ? i : i - Math.floor(count / 2);
      m.position.set(-0.62 + k * 0.46, 0.10 + row * 0.19, row === 0 ? 0 : 0.06);
      m.rotation.y = (row ? 0.08 : -0.05);
      m.castShadow = true; m.receiveShadow = true;
      g.add(m);
    }
    return g;
  }

  /* ============================== ОКРУЖЕНИЕ =============================== */
  function cssColor(v) {
    if (typeof v === 'string') return v;
    return '#' + ('000000' + (v >>> 0).toString(16)).slice(-6);
  }

  function makeGroundTexture(baseRaw, accentRaw, seed) {
    const T = THREE();
    // В данные карт цвета пишутся числами (0x4a3a28), а canvas ждёт строку.
    // Раньше число молча игнорировалось, и «акцентные» пятна не рисовались —
    // земля получалась однотонной.
    const base = cssColor(baseRaw);
    const accent = cssColor(accentRaw);
    const c = document.createElement('canvas');
    c.width = c.height = 256;
    const ctx = c.getContext('2d');
    const rand = D.rng(seed || 7);
    // Бетон/земля крупными пятнами: сначала база, потом влажные разводы,
    // масляные лужи и выцветшие полосы — так плита не выглядит однотонной.
    ctx.fillStyle = base;
    ctx.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 90; i++) {
      const x = rand() * 256, y = rand() * 256, r = 10 + rand() * 40;
      ctx.globalAlpha = 0.05 + rand() * 0.10;
      ctx.fillStyle = rand() > 0.5 ? accent : 'rgba(0,0,0,0.5)';
      ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
    }
    // гравий
    for (let i = 0; i < 4200; i++) {
      const x = rand() * 256, y = rand() * 256, r = 0.5 + rand() * 2.2;
      ctx.fillStyle = rand() > 0.52 ? accent : 'rgba(0,0,0,0.20)';
      ctx.globalAlpha = 0.10 + rand() * 0.34;
      ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
    }
    ctx.globalAlpha = 1;
    // стыки плит и трещины
    ctx.strokeStyle = 'rgba(0,0,0,0.30)';
    for (let i = 0; i < 11; i++) {
      ctx.lineWidth = 1 + rand() * 2;
      ctx.beginPath();
      let x = rand() * 256, y = 0;
      ctx.moveTo(x, y);
      while (y < 256) { x += (rand() - 0.5) * 26; y += 14 + rand() * 22; ctx.lineTo(x, y); }
      ctx.stroke();
    }
    // редкие светлые сколы
    for (let i = 0; i < 220; i++) {
      ctx.globalAlpha = 0.05 + rand() * 0.12;
      ctx.fillStyle = 'rgba(255,235,200,0.9)';
      ctx.fillRect(rand() * 256, rand() * 256, 1 + rand() * 3, 1 + rand() * 2);
    }
    ctx.globalAlpha = 1;
    const tex = new T.CanvasTexture(c);
    tex.wrapS = tex.wrapT = T.RepeatWrapping;
    tex.repeat.set(14, 14);
    tex.anisotropy = 4;
    return tex;
  }

  /* проёмы в стенах здания: окна по периметру на высоте пояса/груди.
     Возвращает прямоугольники { dy0, dy1, du0, du1, dv0, dv1 } относительно
     центра здания — их проверяет world.hitHole для пуль и обзора. */
  function windowHoles(pb, b) {
    if ((b.windows === false)) return [];
    const holes = [];
    const h = b.h || 4;
    // окно: от 1.05 до 1.95 м (в приседе — ниже подоконника, стоя — в уровень)
    const dy0 = Math.min(h - 0.6, 1.02), dy1 = Math.min(h - 0.25, 1.92);
    if (dy1 - dy0 < 0.35) return holes;
    // шаг окон вдоль стены — как у настоящих зданий, без окон в углах
    const step = (b.windowStep || 3.4);
    const margin = 1.0;
    const halfW = 0.28;  // полуширина окна, м
    const alongX = (len) => {
      const n = Math.max(1, Math.floor((len - margin * 2) / step));
      for (let i = 0; i < n; i++) {
        const u = -len / 2 + margin + step * (i + 0.5);
        holes.push({ dy0, dy1, du0: u - halfW, du1: u + halfW, dv0: -pb.hd - 0.01, dv1: pb.hd + 0.01 });
      }
    };
    const alongZ = (len) => {
      const n = Math.max(1, Math.floor((len - margin * 2) / step));
      for (let i = 0; i < n; i++) {
        const v = -len / 2 + margin + step * (i + 0.5);
        holes.push({ dy0, dy1, du0: -pb.hw - 0.01, du1: pb.hw + 0.01, dv0: v - halfW, dv1: v + halfW });
      }
    };
    alongX(pb.hw * 2);
    alongZ(pb.hd * 2);
    return holes;
  }

  function buildLevel(mapId) {
    const T = THREE();
    const M = D.MAPS[mapId];
    // подъём яркости всей карты (см. lift/mat): данные карт писались под
    // тёмный туман, теперь день — и цвета надо поднять синхронно
    const prevLift = mapLift;
    mapLift = M.colorLift === undefined ? 0.26 : M.colorLift;
    const group = new T.Group();
    const colliders = [];   // {x,z,hw,hd,h,y}
    const statics = [];
    const addStatic = (color, geometry, m, flat) => statics.push({ color, geometry, matrix: m, flat });

    // земля: две текстуры — обычная и сетка дорог/разметки (blend по UV)
    // земля — от цвета грунта, а не от неба: иначе после осветления карты
    // плита становилась голубой (раньше ошибка маскировалась тёмным туманом)
    const groundTex = makeGroundTexture(M.ground, M.accent, D.hash(mapId));
    const ground = new T.Mesh(new T.PlaneGeometry(M.size, M.size, 1, 1),
      new T.MeshLambertMaterial({ map: groundTex, color: 0xffffff }));
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    group.add(ground);

    /* ---------------- здания: полигоны в плане, выдавливание --------------- */
    const LV = SH2.level;
    (M.buildings || []).forEach((b, i) => {
      const xf = b.xf || {};
      const g = LV.building(b.poly, b.h, {
        roof: b.roof || 'flat', wallColor: b.wall || (M.wallColors && M.wallColors.wall),
        roofColor: b.roofColor || (M.wallColors && M.wallColors.roof), ridge: b.ridge,
        windowColor: b.windowColor, windowEmissive: b.windowEmissive
      });
      group.add(g);
      // Коллизия: один AABB на здание — движение останавливается, но в стенах
      // есть проёмы по высоте: окна (можно стрелять и видеть) и бойницы.
      // Луч пули проходит через проём, луч обзора — тоже (hitHole в world.js).
      const pb = LV.planBounds(b.poly);
      colliders.push({
        x: pb.cx, z: pb.cz, hw: pb.hw, hd: pb.hd, h: b.h, y: 0, kind: 'building',
        holes: windowHoles(pb, b)
      });
      // мешки у стены (визуальный акцент, коллизия отдельная)
      void xf; void i;
    });

    /* --------------------------- решётчатые вышки --------------------------- */
    (M.towers || []).forEach((t) => {
      group.add(LV.tower(t.x, t.z, t.w, t.h, M.wallColors && M.wallColors.trim));
      colliders.push({ x: t.x, z: t.z, hw: t.w * 0.36, hd: t.w * 0.36, h: t.h, y: 0, kind: 'tower' });
    });

    /* ---------------------- бетонные блоки со скосом ------------------------ */
    (M.barriers || []).forEach((b) => {
      group.add(LV.barrier(b.x, b.z, b.a, b.len, 0x565b60));
      const c = Math.abs(Math.cos(b.a || 0)), sn = Math.abs(Math.sin(b.a || 0));
      const hw = (b.len / 2) * c + 0.3 * sn;
      const hd = (b.len / 2) * sn + 0.3 * c;
      colliders.push({ x: b.x, z: b.z, hw, hd, h: 1.18, y: 0, kind: 'barrier' });
    });

    /* ------------------------------- мешки ---------------------------------- */
    (M.sandbags || []).forEach((sb) => {
      const g = SH2.level.sandbagRow(sb.len, 0x6f6547);
      g.position.set(sb.x, 0, sb.z);
      g.rotation.y = sb.a || 0;
      group.add(g);
      /* Коллайдер мешков = реальная кладка, без припуска «на всякий случай».
         Полутощина стены 0.16 м (мешок 0.30 м + запас 1 см), торцы — по длине.
         Именно припуск 0.3 м раньше не давал подойти к мешкам вплотную. */
      const c = Math.abs(Math.cos(sb.a || 0)), sn = Math.abs(Math.sin(sb.a || 0));
      colliders.push({ x: sb.x, z: sb.z, hw: (sb.len / 2) * c + 0.16 * sn,
        hd: (sb.len / 2) * sn + 0.16 * c, h: 0.72, y: 0, kind: 'sandbag', standLow: true });
    });

    /* --------------------- бочки, камни, штабели труб ----------------------- */
    (M.barrels || []).forEach((p) => {
      const b = propBarrel(1.0, 0x6a4a2c);
      b.position.set(p[0], 0, p[1]);
      b.castShadow = true; b.receiveShadow = true;
      group.add(b);
      colliders.push({ x: p[0], z: p[1], hw: 0.48, hd: 0.48, h: 1.15, y: 0, kind: 'barrel' });
    });
    (M.rocks || []).forEach((p) => {
      const r = propRock(p[2] || 1.1, M.accent);
      r.position.set(p[0], 0, p[1]);
      r.rotation.y = p[0] * 0.7;
      group.add(r);
      colliders.push({ x: p[0], z: p[1], hw: 0.7 * (p[2] || 1.1), hd: 0.65 * (p[2] || 1.1), h: 1.1 * (p[2] || 1.1), y: 0, kind: 'rock', standLow: true });
    });
    (M.stacks || []).forEach((st) => {
      const g = new T.Group();
      const pipe = SH2.outline.revolve([[0, 0.34], [0.04, 0.36], [0.9, 0.36], [0.94, 0.34], [0.94, 0.30], [0.02, 0.30]], { segments: 10 });
      pipe.rotateZ(Math.PI / 2);
      for (let layer = 0; layer < 3; layer++) {
        for (let k = 0; k < 2; k++) {
          const m = new T.Mesh(pipe, mat(0x5a5348, { flat: true }));
          m.position.set(0, 0.36 + layer * 0.60, (k ? 1 : -1) * 0.34);
          m.castShadow = true; m.receiveShadow = true;
          g.add(m);
        }
      }
      g.position.set(st[0], 0, st[1]);
      g.rotation.y = st[2] || 0;
      group.add(g);
      colliders.push({ x: st[0], z: st[1], hw: 1.0, hd: 0.85, h: 1.9, y: 0, kind: 'stack' });
    });

    /* ------------------- новые пропсы карты (контурами) --------------------- */
    const LV2 = SH2.level;
    (M.containers || []).forEach((c) => {
      const len = c.len || 6.1, h = c.h || 2.6;
      const g = LV2.container(len, h, c.color || 0x4a5a52);
      g.position.set(c.x, 0, c.z);
      g.rotation.y = c.a || 0;
      group.add(g);
      // коллизия: повёрнутый прямоугольник -> AABB по габаритам
      const ca = Math.abs(Math.cos(c.a || 0)), sa = Math.abs(Math.sin(c.a || 0));
      colliders.push({ x: c.x, z: c.z, hw: (len / 2) * ca + 0.61 * sa, hd: (len / 2) * sa + 0.61 * ca,
        h, y: 0, kind: 'container' });
    });

    (M.trucks || []).forEach((t) => {
      const g = LV2.truck(t.color || 0x4a5138);
      g.position.set(t.x, 0, t.z);
      g.rotation.y = t.a || 0;
      group.add(g);
      const ca = Math.abs(Math.cos(t.a || 0)), sa = Math.abs(Math.sin(t.a || 0));
      colliders.push({ x: t.x, z: t.z, hw: 2.3 * ca + 1.0 * sa, hd: 2.3 * sa + 1.0 * ca,
        h: 1.9, y: 0, kind: 'truck', standLow: false });
    });

    (M.lamps || []).forEach((p) => {
      const g = LV2.lamp(0x3e4348);
      g.position.set(p[0], 0, p[1]);
      g.rotation.y = p[0] * 0.3;
      group.add(g);
      colliders.push({ x: p[0], z: p[1], hw: 0.14, hd: 0.14, h: 4.6, y: 0, kind: 'lamp' });
    });

    (M.watchtowers || []).forEach((t) => {
      const g = LV2.watchtower(t.w || 2.4, t.h || 6, 0x4a4136);
      g.position.set(t.x, 0, t.z);
      group.add(g);
      colliders.push({ x: t.x, z: t.z, hw: (t.w || 2.4) * 0.42, hd: (t.w || 2.4) * 0.42,
        h: t.h || 6, y: 0, kind: 'watchtower' });
    });

    (M.wrecks || []).forEach((w) => {
      const g = LV2.wreck(0x3b3a30);
      g.position.set(w.x, 0, w.z);
      g.rotation.y = w.a || 0;
      group.add(g);
      const ca = Math.abs(Math.cos(w.a || 0)), sa = Math.abs(Math.sin(w.a || 0));
      colliders.push({ x: w.x, z: w.z, hw: 2.0 * ca + 1.3 * sa, hd: 2.0 * sa + 1.3 * ca,
        h: 2.2, y: 0, kind: 'wreck' });
    });

    (M.fences || []).forEach((f) => {
      const g = LV2.fence(f.a, f.b, 0x554a38);
      group.add(g);
      const dx = f.b[0] - f.a[0], dz = f.b[1] - f.a[1];
      const len = Math.hypot(dx, dz);
      const ca = Math.abs(dx / len), sa = Math.abs(dz / len);
      const mid = [(f.a[0] + f.b[0]) / 2, (f.a[1] + f.b[1]) / 2];
      // забор непроходим, но пули проходят — высокий? нет: 1.05 м, значит
      // присевший укрыт, стоящий нет
      colliders.push({ x: mid[0], z: mid[1], hw: (len / 2) * ca + 0.2 * sa, hd: (len / 2) * sa + 0.2 * ca,
        h: 1.05, y: 0, kind: 'fence', standLow: true });
    });

    (M.trenches || []).forEach((t) => {
      const g = LV2.trench(t.len || 8, 0x453c2f);
      g.position.set(t.x, 0, t.z);
      g.rotation.y = t.a || 0;
      group.add(g);
      const ca = Math.abs(Math.cos(t.a || 0)), sa = Math.abs(Math.sin(t.a || 0));
      colliders.push({ x: t.x, z: t.z, hw: 0.75 * ca + (t.len || 8) / 2 * sa,
        hd: 0.75 * sa + (t.len || 8) / 2 * ca, h: 0.55, y: 0, kind: 'trench', standLow: true });
    });

    (M.craters || []).forEach((c) => {
      const g = LV2.crater(c.r || 2.6);
      g.position.set(c.x, 0, c.z);
      group.add(g);
    });

    (M.bushes || []).forEach((b) => {
      const g = LV2.bush(b[2] || 0.8, 0x4a5133);
      g.position.set(b[0], 0, b[1]);
      group.add(g);
    });

    (M.rubble || []).forEach((r) => {
      const x = Array.isArray(r) ? r[0] : r.x;
      const z = Array.isArray(r) ? r[1] : r.z;
      const size = r.s || 1.4;
      const g = LV2.rubble(size, 0x6a6157);
      g.position.set(x, 0, z);
      group.add(g);
      colliders.push({ x, z, hw: size * 0.8, hd: size * 0.7, h: 0.5, y: 0, kind: 'rubble', standLow: true });
    });

    (M.mgNests || []).forEach((n) => {
      const g = LV2.mgNest();
      g.position.set(n.x, 0, n.z);
      g.rotation.y = n.a || 0;
      group.add(g);
      const ca = Math.abs(Math.cos(n.a || 0)), sa = Math.abs(Math.sin(n.a || 0));
      colliders.push({ x: n.x, z: n.z, hw: 1.9 * ca + 1.0 * sa, hd: 1.9 * sa + 1.0 * ca,
        h: 0.78, y: 0, kind: 'sandbag', standLow: true });
    });

    (M.camoNets || []).forEach((n) => {
      const g = LV2.camoNet(n.w || 4, n.d || 3, n.h || 2.1);
      g.position.set(n.x, 0, n.z);
      group.add(g);
      // сеть не блокирует ни движение, ни пули — только столбы
      for (const sx of [-1, 1]) {
        for (const sz of [-1, 1]) {
          colliders.push({ x: n.x + sx * (n.w || 4) / 2, z: n.z + sz * (n.d || 3) / 2,
            hw: 0.1, hd: 0.1, h: n.h || 2.1, y: 0, kind: 'netpost' });
        }
      }
    });

    (M.shells || []).forEach((sh) => {
      const g = LV2.shells(sh.x, sh.z, sh.a || 0);
      group.add(g);
    });

    (M.crateStacks || []).forEach((c) => {
      const g = LV2.crates(c.n || 4, 0x5b4a33);
      g.position.set(c.x, 0, c.z);
      g.rotation.y = (c.x * 0.17 + c.z * 0.31) % 3.14;
      group.add(g);
      colliders.push({ x: c.x, z: c.z, hw: 0.9, hd: 0.9, h: 1.9, y: 0, kind: 'crates' });
    });

    /* -------------------- полосы дороги (полигоны) --------------------- */
    (M.road || []).forEach((rd) => {
      const w = rd.w / 2, l = rd.l / 2;
      const geo = SH2.level.extrudePlan([[-l, -w], [l, -w], [l, w], [-l, w]], 0.06, { bevel: 0.02 });
      // асфальт светлее «чёрного»: в дневном свете старый тёмный смотрелся
      // провалом в земле и читался как тень, а не как дорога
      const m = new T.Mesh(geo, mat(0x4d4a45, { flat: true }));
      m.position.set(rd.x, 0.006, rd.z);
      m.rotation.y = rd.a || 0;
      m.receiveShadow = true;
      group.add(m);
    });

    // свет: солнце + небо (графика без потери качества после оптимизации)
    // Яркость карты задаётся здесь: раньше всё решал тёмный туман, и сцена
    // читалась как ночная. Теперь свет сильный, а карта остаётся светлой даже
    // в тенях (ambient/hemi отвечают за заполнение).
    const bright = M.brightness || 1.35;
    const sun = new T.DirectionalLight(M.sun, 1.15 * bright);
    sun.position.set(M.sunPos[0], M.sunPos[1], M.sunPos[2]);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    const sc = sun.shadow.camera;
    sc.left = -M.size * 0.55; sc.right = M.size * 0.55; sc.top = M.size * 0.55; sc.bottom = -M.size * 0.55;
    sc.near = 1; sc.far = 220;
    sun.shadow.bias = -0.0006;
    sun.shadow.normalBias = 0.02;
    group.add(sun);
    group.add(sun.target);
    const hemi = new T.HemisphereLight(M.sun, M.ground, 0.66 * bright);
    group.add(hemi);
    const amb = new T.AmbientLight(M.ambient, 0.52 * bright);
    group.add(amb);
    // контровой «отскок» от земли: без него нижние грани моделей проваливаются
    // в чёрное, и детализация, которую мы добавляем, просто не видна
    const bounce = new T.DirectionalLight(M.ground, 0.22 * bright);
    bounce.position.set(-M.sunPos[0] * 0.4, 12, -M.sunPos[2] * 0.4);
    group.add(bounce);

    // склейка статики -> 2-4 draw call вместо сотен
    // статики больше нет: всё построено полигонами, счётчик оставлен для HUD
    const baked = [];
    void statics;
    let props = 0;
    (M.buildings || []).forEach(() => props++);
    props += (M.towers || []).length + (M.barriers || []).length + (M.sandbags || []).length;
    props += (M.barrels || []).length + (M.rocks || []).length + (M.stacks || []).length + (M.road || []).length;
    props += (M.containers || []).length + (M.trucks || []).length + (M.lamps || []).length;
    props += (M.watchtowers || []).length + (M.wrecks || []).length + (M.fences || []).length;
    props += (M.trenches || []).length + (M.crateStacks || []).length + (M.shells || []).length;
    props += (M.craters || []).length + (M.bushes || []).length + (M.rubble || []).length;
    props += (M.mgNests || []).length + (M.camoNets || []).length;

    /* ---------------------- граница сектора (периметр) ---------------------- */
    /* Раньше карта просто обрывалась: за краем — пустота и невидимая стенка.
       Теперь по периметру стоит ограждение с колючей проволокой, воротами и
       табличкой, так что граница читается как граница объекта. */
    if (M.border !== false) {
      const bd = SH2.level.boundary(mapId, M.size / 2 - 0.6, {
        gate: M.borderGate === undefined ? 3 : M.borderGate,
        gateWidth: 5.6,
        signColor: M.borderSign
      });
      group.add(bd.group);
      bd.colliders.forEach((c) => colliders.push(c));
    }

    /* ------------------ точки опоры, нормали и опорные точки ---------------
       Для каждого коллайдера вычисляем:
         anchor   — точка на поверхности, к которой боец встаёт вплотную (для ИИ);
         normalX/Z — наружная нормаль этой точки (направление, от которого укрывает);
         open     — открытая сторона, куда можно стрелять и смотреть поверх;
       Это те же данные, что использует ИИ для укрытия — рисуются на карте. */
    colliders.forEach((c, ci) => {
      c.id = ci;
      if (c.anchor) return;
      const tall = (c.h || 1) > 1.3;
      // ставим точку на стороне, обращённой к центру карты: там чаще бой
      const toCenterX = -c.x, toCenterZ = -c.z;
      const len = Math.hypot(toCenterX, toCenterZ) || 1;
      const nx = toCenterX / len, nz = toCenterZ / len;
      const ex = c.hw * Math.abs(nx) + c.hd * Math.abs(nz);
      c.anchor = { x: c.x + nx * (ex + 0.62), z: c.z + nz * (ex + 0.62) };
      c.normalX = nx; c.normalZ = nz;
      c.coverHeight = tall ? 3 : (c.h || 1) > 0.7 ? 2 : 1;
      c.open = Math.abs(nx) > Math.abs(nz) ? (nx > 0 ? 'east' : 'west') : (nz > 0 ? 'south' : 'north');
    });

    mapLift = prevLift;
    return { group, colliders, sun, hemi, amb, map: M, mapId, groundTex,
      staticsCount: props, props, bakedCount: baked.length };
  }

  /* ------------------------- пункт эвакуации / objective ------------------- */
  function buildExtractMarker(radius, color) {
    const T = THREE();
    const g = new T.Group();
    const ring = new T.Mesh(new T.RingGeometry(radius * 0.82, radius, 32),
      mat(color || 0x5cff9d, { transparent: true, opacity: 0.55, side: T.DoubleSide, depthWrite: false }));
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.03;
    g.add(ring);
    const beam = new T.Mesh(new T.CylinderGeometry(radius * 0.34, radius * 0.96, 9, 14, 1, true),
      mat(color || 0x5cff9d, { transparent: true, opacity: 0.10, side: T.DoubleSide, depthWrite: false }));
    beam.position.y = 4.5;
    g.add(beam);
    g.userData.ring = ring; g.userData.beam = beam;
    return g;
  }

  function buildObjectiveBox(size) {
    const T = THREE();
    const g = new T.Group();
    const s = size || 1.1;
    const body = new T.Mesh(box(s, s * 1.15, s), mat(0x6b4a24, { flat: true }));
    body.position.y = s * 0.575;
    body.castShadow = true; body.receiveShadow = true;
    g.add(body);
    const stripe = new T.Mesh(box(s * 1.02, s * 0.16, s * 1.02), mat(0xffb347, { emissive: 0x5a3000 }));
    stripe.position.y = s * 0.75;
    g.add(stripe);
    const glow = new T.Mesh(new T.OctahedronGeometry(s * 0.22),
      mat(0xffd166, { emissive: 0xffb347, emissiveIntensity: 1.6, transparent: true, opacity: 0.9 }));
    glow.position.y = s * 1.65;
    g.add(glow);
    g.userData.glow = glow;
    g.userData.size = s;
    return g;
  }

  SH2.model = {
    mat, mergeGeometries, bakeStatic, buildRig, buildWeaponModel, buildLevel, windowHoles,
    propBarrel, propRock, propSandbags,
    buildExtractMarker, buildObjectiveBox, makeGroundTexture, xform, box, BONE_DEF,
    matCacheSize: () => matCache.size
  };
})(typeof window !== 'undefined' ? window : globalThis);
