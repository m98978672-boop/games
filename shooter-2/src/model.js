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

    /* --- голова (центр 1.60, макушка 1.73) --- */
    if (!lowDetail) {
      add('head', new T.SphereGeometry(0.104, 12, 10), skin, 0, 0.055, 0.012);
      add('head', box(0.15, 0.07, 0.055), 0x23282c, 0, 0.048, 0.078);        // маска
      add('head', box(0.032, 0.012, 0.014), accent, 0.042, 0.068, 0.104);    // индикатор
      add('head', box(0.035, 0.045, 0.035), 0x1b1f22, 0.105, 0.03, 0.0);     // наушник
      add('head', box(0.035, 0.045, 0.035), 0x1b1f22, -0.105, 0.03, 0.0);
    } else {
      add('head', box(0.16, 0.17, 0.15), skin, 0, 0.05, 0.01);
    }
    // каска с полями
    add('head', new T.SphereGeometry(0.121, 12, 8, 0, Math.PI * 2, 0, Math.PI * 0.60), gear, 0, 0.072, 0.004);
    add('head', box(0.20, 0.026, 0.055), gear, 0, 0.055, -0.078);             // козырёк
    add('head', box(0.055, 0.032, 0.03), 0x2a2a2a, 0, 0.098, 0.10);           // крепление ПНВ

    /* --- шея --- */
    add('neck', new T.CylinderGeometry(0.05, 0.058, 0.12, 7), skin, 0, 0.005, 0);

    /* --- корпус: грудь 1.06–1.44, талия/поясница 0.92–1.08 --- */
    // грудная клетка: низ уже, верх шире — живая трапеция
    add('chest', box(0.30, 0.17, 0.205), body, 0, -0.085, 0);
    add('chest', box(0.345, 0.20, 0.225), body, 0, 0.075, 0);
    add('chest', box(0.20, 0.055, 0.20), body, 0, 0.185, 0);                  // трапеция к шее
    if (!lowDetail) {
      add('chest', new T.SphereGeometry(0.075, 8, 6), body, 0.175, 0.12, 0);  // дельта-накладки
      add('chest', new T.SphereGeometry(0.075, 8, 6), body, -0.175, 0.12, 0);
    }
    // бронежилет
    add('chest', box(0.275, 0.30, 0.255), gear, 0, 0.035, 0);
    add('chest', box(0.20, 0.055, 0.245), accent, 0, 0.135, 0);
    add('chest', box(0.075, 0.30, 0.02), accent, 0.135, 0.03, 0.13);
    add('chest', box(0.075, 0.30, 0.02), accent, -0.135, 0.03, 0.13);
    add('chest', box(0.235, 0.20, 0.055), gear, 0, 0.05, -0.135);             // спинная пластина
    if (!lowDetail) {
      add('chest', box(0.06, 0.085, 0.045), 0x35393c, 0.085, -0.075, 0.14);   // подсумки
      add('chest', box(0.06, 0.085, 0.045), 0x35393c, -0.085, -0.075, 0.14);
      add('chest', box(0.04, 0.04, 0.026), 0xffb347, -0.15, 0.20, 0.06);      // маячок
      add('chest', box(0.13, 0.05, 0.02), 0xdadada, -0.055, 0.16, 0.145);     // нашивка
    }
    // поясница (мягкая)
    add('spine', lowDetail ? box(0.26, 0.17, 0.185) : new T.CapsuleGeometry(0.115, 0.02, 3, 9), body, 0, -0.01, 0);
    // таз + ремень
    add('pelvis', box(0.335, 0.19, 0.215), gear, 0, -0.03, 0);
    add('pelvis', box(0.345, 0.055, 0.225), 0x1b1f22, 0, 0.045, 0);
    add('pelvis', box(0.07, 0.07, 0.03), 0xb9a05a, 0, 0.045, 0.12);            // пряжка
    if (!lowDetail) {
      add('pelvis', box(0.10, 0.13, 0.09), 0x2a2e31, 0.135, -0.10, 0.06);
      add('pelvis', box(0.10, 0.13, 0.09), 0x2a2e31, -0.135, -0.10, 0.06);
    }

    /* --- руки --- */
    [['L', 1], ['R', -1]].forEach(([s, sign]) => {
      add('shoulder' + s, lowDetail ? box(0.13, 0.12, 0.14) : new T.SphereGeometry(0.072, 8, 6), body, sign * 0.01, -0.015, 0);
      add('upperArm' + s, new T.CapsuleGeometry(0.055, 0.19, 2, 8), body, 0, -0.15, 0);
      add('upperArm' + s, new T.SphereGeometry(0.056, 7, 6), gear, 0, -0.055, 0);   // рукав
      add('lowerArm' + s, new T.CapsuleGeometry(0.047, 0.17, 2, 8), body, 0, -0.135, 0);
      if (!lowDetail) add('lowerArm' + s, box(0.06, 0.075, 0.065), gear, 0, -0.20, 0.015);
      add('hand' + s, box(0.072, 0.085, 0.08), 0x1e2226, 0, -0.045, 0.008);
    });

    /* --- ноги: бедро 0.44–0.86, голень 0.02–0.42, стопа на полу --- */
    [['L', 1], ['R', -1]].forEach(([s, sign]) => {
      add('hip' + s, new T.SphereGeometry(0.088, 8, 6), gear, 0, -0.005, 0);
      add('upperLeg' + s, new T.CapsuleGeometry(0.079, 0.235, 2, 8), body, 0, -0.21, 0);
      add('upperLeg' + s, box(0.115, 0.14, 0.09), gear, 0, -0.10, 0.055);      // набедренная сумка
      add('lowerLeg' + s, new T.SphereGeometry(0.073, 8, 6), gear, 0, 0.0, 0.005); // колено
      add('lowerLeg' + s, new T.CapsuleGeometry(0.063, 0.235, 2, 8), body, 0, -0.20, 0);
      if (!lowDetail) add('lowerLeg' + s, box(0.10, 0.11, 0.06), gear, 0, -0.155, 0.055); // наколенник
      add('foot' + s, new T.CylinderGeometry(0.062, 0.058, 0.06, 8), 0x25292c, 0, 0.05, 0); // голеностоп
      add('foot' + s, box(0.112, 0.085, 0.26), 0x1a1e21, sign * 0.004, 0.043, 0.055);
      add('foot' + s, box(0.122, 0.032, 0.09), 0x101315, sign * 0.004, 0.016, 0.155);
    });

    /* --- оружие: крепится к груди, руки дотягиваются IK-хватом --- */
    const weaponSlot = new T.Group();
    weaponSlot.name = 'weapon';
    weaponSlot.position.set(0.15, -0.08, 0.20);
    weaponSlot.rotation.set(-0.06, 0.10, 0);
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
  function buildWeaponModel(id, opts) {
    const T = THREE();
    const o = opts || {};
    const g = new T.Group();
    const dark = 0x25292c, mid = 0x3a4147, wood = 0x5b3a26, accent = 0xffb347;
    const add = (geo, color, x, y, z, rx) => {
      const m = new T.Mesh(geo, mat(color, { flat: !o.smooth }));
      m.position.set(x || 0, y || 0, z || 0);
      if (rx) m.rotation.x = rx;
      m.castShadow = !o.noShadow;
      g.add(m);
      return m;
    };
    const muzzle = new T.Object3D();
    if (id === 'pistol') {
      add(box(0.045, 0.075, 0.20), dark, 0, 0.02, 0.03);
      add(box(0.035, 0.05, 0.115), mid, 0, 0.055, 0.10);
      add(box(0.042, 0.10, 0.055), 0x1b1f22, 0, -0.055, -0.03, 0.28);
      add(box(0.018, 0.018, 0.02), accent, 0, 0.082, -0.02);
      muzzle.position.set(0, 0.05, 0.16);
    } else if (id === 'smg') {
      add(box(0.055, 0.10, 0.30), dark, 0, 0.02, 0.04);
      add(box(0.022, 0.022, 0.17), mid, 0, 0.065, 0.14);
      add(box(0.04, 0.19, 0.05), 0x1b1f22, 0, -0.10, 0.09);   // магазин
      add(box(0.035, 0.08, 0.05), 0x1b1f22, 0, -0.055, -0.09, 0.2);
      add(box(0.05, 0.035, 0.14), mid, 0, 0.045, -0.14);       // приклад
      add(box(0.016, 0.024, 0.02), accent, 0, 0.085, -0.02);
      muzzle.position.set(0, 0.065, 0.24);
    } else if (id === 'rifle') {
      add(box(0.06, 0.105, 0.42), dark, 0, 0.02, 0.05);
      add(box(0.026, 0.026, 0.30), mid, 0, 0.07, 0.24);
      add(box(0.045, 0.22, 0.075), 0x6b4a2c, 0, -0.12, 0.13);  // изогнутый магазин
      add(box(0.04, 0.09, 0.055), wood, 0, -0.06, -0.10);
      add(box(0.055, 0.045, 0.22), wood, 0, 0.02, -0.24);       // приклад
      add(box(0.03, 0.05, 0.16), wood, 0, 0.02, 0.30);          // цевьё
      add(box(0.02, 0.028, 0.024), accent, 0, 0.088, 0.0);
      muzzle.position.set(0, 0.07, 0.40);
    } else if (id === 'shotgun') {
      add(box(0.07, 0.11, 0.34), dark, 0, 0.02, 0.04);
      add(new T.CylinderGeometry(0.026, 0.026, 0.44, 8), mid, 0, 0.07, 0.28, Math.PI / 2);
      add(new T.CylinderGeometry(0.021, 0.021, 0.34, 8), 0x1b1f22, 0, 0.028, 0.26, Math.PI / 2);
      add(box(0.06, 0.05, 0.16), wood, 0, 0.0, 0.20);
      add(box(0.045, 0.09, 0.06), wood, 0, -0.06, -0.08);
      add(box(0.06, 0.055, 0.20), wood, 0, 0.01, -0.22);
      muzzle.position.set(0, 0.07, 0.50);
    } else if (id === 'dmr') {
      add(box(0.055, 0.10, 0.46), dark, 0, 0.02, 0.05);
      add(new T.CylinderGeometry(0.018, 0.018, 0.44, 8), mid, 0, 0.075, 0.30, Math.PI / 2);
      add(new T.CylinderGeometry(0.036, 0.03, 0.28, 10), 0x15181a, 0, 0.145, 0.05, Math.PI / 2); // оптика
      add(box(0.045, 0.16, 0.06), 0x4a3320, 0, -0.085, 0.09);
      add(box(0.05, 0.045, 0.24), 0x4a3320, 0, 0.01, -0.24);
      add(box(0.03, 0.06, 0.14), 0x4a3320, 0, 0.0, 0.28);
      muzzle.position.set(0, 0.075, 0.52);
    }
    g.add(muzzle);
    g.userData.muzzle = muzzle;
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

    // стены
    M.walls.forEach((w) => {
      addStatic(M.ground, box(w.w, w.h, w.d), xform(w.x, w.h / 2, w.z));
      // верхняя кромка (визуальная деталь, не влияет на коллизию)
      addStatic(M.accent, box(w.w + 0.22, 0.22, w.d + 0.22), xform(w.x, w.h + 0.06, w.z));
      colliders.push({ x: w.x, z: w.z, hw: w.w / 2, hd: w.d / 2, h: w.h, y: 0 });
    });

    // вышки
    (M.towers || []).forEach((t) => {
      addStatic(M.accent, box(t.w, t.h, t.d), xform(t.x, t.h / 2, t.z));
      addStatic(0x0d0f11, box(t.w * 0.72, 0.9, t.d * 0.72), xform(t.x, t.h + 0.5, t.z));
      for (let i = 0; i < 4; i++) {
        const sx = (i & 1 ? 1 : -1) * (t.w / 2 - 0.3), sz = (i & 2 ? 1 : -1) * (t.d / 2 - 0.3);
        addStatic(0x121416, box(0.3, t.h, 0.3), xform(t.x + sx, t.h / 2, t.z + sz));
      }
      colliders.push({ x: t.x, z: t.z, hw: t.w / 2, hd: t.d / 2, h: t.h, y: 0 });
    });

    // баррикады
    (M.barricades || []).forEach((b) => {
      addStatic(0x53575c, box(5.4, 1.15, 0.5), xform(b[0], 0.58, b[1], 0, b[2], 0));
      addStatic(0x35393d, box(5.6, 0.16, 0.7), xform(b[0], 1.18, b[1], 0, b[2], 0));
      colliders.push({ x: b[0], z: b[1], hw: 2.7, hd: 0.4, h: 1.25, y: 0, ry: b[2] });
    });

    // ящики (по одному мешу, потом инстансим)
    (M.crates || []).forEach((c, i) => {
      const s = 1.2, hs = s / 2;
      const rot = (i % 3) * 0.35;
      addStatic(M.accent, box(s, s, s), xform(c[0], hs, c[1], 0, rot, 0));
      addStatic(0x1a140f, box(s * 1.03, 0.12, s * 1.03), xform(c[0], s - 0.06, c[1], 0, rot, 0));
      colliders.push({ x: c[0], z: c[1], hw: hs, hd: hs, h: s, y: 0 });
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
    const baked = bakeStatic(statics, 'level');
    baked.forEach((m) => group.add(m));

    return { group, colliders, sun, hemi, amb, map: M, mapId, groundTex, staticsCount: statics.length, bakedCount: baked.length };
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
    buildExtractMarker, buildObjectiveBox, makeGroundTexture, xform, box, BONE_DEF,
    matCacheSize: () => matCache.size
  };
})(typeof window !== 'undefined' ? window : globalThis);
