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
  function mat(color, opts) {
    const key = color + '|' + JSON.stringify(opts || {});
    let m = matCache.get(key);
    if (m) return m;
    const o = opts || {};
    m = new (THREE().MeshLambertMaterial)({
      color: color,
      flatShading: !!o.flat,
      transparent: !!o.transparent,
      opacity: o.opacity === undefined ? 1 : o.opacity,
      emissive: o.emissive || 0x000000,
      emissiveIntensity: o.emissiveIntensity === undefined ? 1 : o.emissiveIntensity,
      side: o.side || THREE().FrontSide,
      depthWrite: o.depthWrite === undefined ? true : o.depthWrite
    });
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
  function propBarrel(s, color) {
    const T = THREE();
    const geo = SH2.outline.revolve([
      [0.0, s * 0.40], [0.02 * s, s * 0.44], [0.10 * s, s * 0.46], [0.48 * s, s * 0.46],
      [0.55 * s, s * 0.44], [0.58 * s, s * 0.39], [0.585 * s, s * 0.0]
    ], { segments: 12, scale: [1, 1, 1] });
    geo.computeVertexNormals();
    return new T.Mesh(geo, mat(color || 0x6a4a2c, { flat: true }));
  }
  function propRock(s, color) {
    const T = THREE();
    const geo = SH2.outline.outlineMesh(SH2.outline.smoothOutline([
      [-0.5, 0.02], [-0.34, 0.34], [-0.10, 0.60], [0.22, 0.52], [0.44, 0.26], [0.50, 0.02]
    ], 2), { depth: s * 0.9, bevel: s * 0.10, bevelSegments: 2 });
    geo.scale(s * 1.1, s * 1.1, s * 1.1);
    return new T.Mesh(geo, mat(color || 0x585349, { flat: true }));
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
  function makeGroundTexture(base, accent, seed) {
    const T = THREE();
    const c = document.createElement('canvas');
    c.width = c.height = 256;
    const ctx = c.getContext('2d');
    const rand = D.rng(seed || 7);
    ctx.fillStyle = base;
    ctx.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 2600; i++) {
      const x = rand() * 256, y = rand() * 256, r = 0.6 + rand() * 3.4;
      ctx.fillStyle = rand() > 0.5 ? accent : 'rgba(0,0,0,0.16)';
      ctx.globalAlpha = 0.10 + rand() * 0.30;
      ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
    }
    ctx.globalAlpha = 1;
    // трещины/стыки плит
    ctx.strokeStyle = 'rgba(0,0,0,0.28)';
    for (let i = 0; i < 9; i++) {
      ctx.lineWidth = 1 + rand() * 2;
      ctx.beginPath();
      let x = rand() * 256, y = 0;
      ctx.moveTo(x, y);
      while (y < 256) { x += (rand() - 0.5) * 26; y += 18 + rand() * 20; ctx.lineTo(x, y); }
      ctx.stroke();
    }
    const tex = new T.CanvasTexture(c);
    tex.wrapS = tex.wrapT = T.RepeatWrapping;
    tex.repeat.set(14, 14);
    tex.anisotropy = 4;
    return tex;
  }

  function buildLevel(mapId) {
    const T = THREE();
    const M = D.MAPS[mapId];
    const group = new T.Group();
    const colliders = [];   // {x,z,hw,hd,h,y}
    const statics = [];
    const addStatic = (color, geometry, m, flat) => statics.push({ color, geometry, matrix: m, flat });

    // земля
    const groundTex = makeGroundTexture(M.sky, M.accent, D.hash(mapId));
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
      // коллизия: один AABB на здание (в него попадают все лучи и пули)
      const pb = LV.planBounds(b.poly);
      colliders.push({ x: pb.cx, z: pb.cz, hw: pb.hw, hd: pb.hd, h: b.h, y: 0, kind: 'building' });
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
      const c = Math.abs(Math.cos(sb.a || 0)), sn = Math.abs(Math.sin(sb.a || 0));
      colliders.push({ x: sb.x, z: sb.z, hw: (sb.len / 2) * c + 0.3 * sn,
        hd: (sb.len / 2) * sn + 0.3 * c, h: 0.72, y: 0, kind: 'sandbag' });
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
      colliders.push({ x: p[0], z: p[1], hw: 0.7 * (p[2] || 1.1), hd: 0.65 * (p[2] || 1.1), h: 1.1 * (p[2] || 1.1), y: 0, kind: 'rock' });
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

    /* ------------------------- полосы дороги (полигоны) --------------------- */
    (M.road || []).forEach((rd) => {
      const w = rd.w / 2, l = rd.l / 2;
      const geo = SH2.level.extrudePlan([[-l, -w], [l, -w], [l, w], [-l, w]], 0.06, { bevel: 0.02 });
      const m = new T.Mesh(geo, mat(0x272421, { flat: true }));
      m.position.set(rd.x, 0.006, rd.z);
      m.rotation.y = rd.a || 0;
      m.receiveShadow = true;
      group.add(m);
    });

    // свет: солнце + небо (графика без потери качества после оптимизации)
    const sun = new T.DirectionalLight(M.sun, 1.35);
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
    const hemi = new T.HemisphereLight(M.sun, M.ground, 0.55);
    group.add(hemi);
    const amb = new T.AmbientLight(M.ambient, 0.42);
    group.add(amb);

    // склейка статики -> 2-4 draw call вместо сотен
    // статики больше нет: всё построено полигонами, счётчик оставлен для HUD
    const baked = [];
    void statics;
    let props = 0;
    (M.buildings || []).forEach(() => props++);
    props += (M.towers || []).length + (M.barriers || []).length + (M.sandbags || []).length;
    props += (M.barrels || []).length + (M.rocks || []).length + (M.stacks || []).length + (M.road || []).length;

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
    mat, mergeGeometries, bakeStatic, buildRig, buildWeaponModel, buildLevel,
    propBarrel, propRock, propSandbags,
    buildExtractMarker, buildObjectiveBox, makeGroundTexture, xform, box, BONE_DEF,
    matCacheSize: () => matCache.size
  };
})(typeof window !== 'undefined' ? window : globalThis);
