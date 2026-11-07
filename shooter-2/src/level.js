/* =============================================================================
   СЕКТОР «ПЕПЕЛ» — карта уровня из полигонов
   -----------------------------------------------------------------------------
   Карта задаётся полигонами (обведёнными точками), а не набором кубов:

   • здания      — многоугольник в плане + высота + двускатная/плоская крыша;
                   стены выдавливаются полигоном, крыша — лофт по скатам;
   • укрытия     — «мешки», бочки, камни и бетонные блоки со скошенными гранями;
   • вышки       — решётчатая опора из наклонных балок + площадка;
   • дорога      — полоса полигонов по карте;
   • небо        — купол тела вращения с градиентом.

   Для физики каждый полигон даёт один или несколько AABB в списке colliders —
   ИИ и пули работают так же, как раньше, но геометрия настоящая.
   ============================================================================= */
(function (root) {
  'use strict';
  const SH2 = (root.SH2 = root.SH2 || {});
  const THREE = () => root.THREE;

  /* --------------------------- вспомогательное ---------------------------- */
  function polyShape(pts) {
    const T = THREE();
    const s = new T.Shape();
    pts.forEach((p, i) => (i === 0 ? s.moveTo(p[0], p[1]) : s.lineTo(p[0], p[1])));
    s.closePath();
    return s;
  }

  // Экструзия полигона в плане (X,Z) на высоту h — стены здания
  function extrudePlan(pts, h, opts) {
    const T = THREE();
    const o = opts || {};
    const geo = new T.ExtrudeGeometry(polyShape(pts), {
      depth: h,
      bevelEnabled: o.bevel !== 0,
      bevelThickness: o.bevel === undefined ? 0.06 : o.bevel,
      bevelSize: o.bevel === undefined ? 0.06 : o.bevel,
      bevelSegments: 1,
      steps: 1
    });
    // Shape лежит в XY, выдавливание по +Z -> переводим в план XZ
    geo.rotateX(-Math.PI / 2);
    return geo;
  }

  // Лофт между двумя полигонами одинаковой длины (скат крыши / откос)
  function loftBetween(lower, upper, y0, y1) {
    const T = THREE();
    const n = lower.length;
    const verts = [], idx = [];
    for (let i = 0; i < n; i++) verts.push(lower[i][0], y0, lower[i][1]);
    for (let i = 0; i < n; i++) verts.push(upper[i][0], y1, upper[i][1]);
    for (let i = 0; i < n; i++) {
      const j = (i + 1) % n;
      idx.push(i, j, n + j, i, n + j, n + i);
    }
    const geo = new T.BufferGeometry();
    geo.setAttribute('position', new T.Float32BufferAttribute(verts, 3));
    geo.setIndex(idx);
    geo.computeVertexNormals();
    return geo;
  }

  // Вписанный/описанный многоугольник вокруг точки (для коллайдеров)
  function planBounds(pts) {
    let minX = 1e9, maxX = -1e9, minZ = 1e9, maxZ = -1e9;
    pts.forEach((p) => {
      minX = Math.min(minX, p[0]); maxX = Math.max(maxX, p[0]);
      minZ = Math.min(minZ, p[1]); maxZ = Math.max(maxZ, p[1]);
    });
    return { cx: (minX + maxX) / 2, cz: (minZ + maxZ) / 2, hw: (maxX - minX) / 2, hd: (maxZ - minZ) / 2 };
  }

  /* ------------------------------- мешки ---------------------------------- */
  function sandbagRow(len, color) {
    const T = THREE();
    const g = new T.Group();
    const R = SH2.outline;
    const bag = R.revolve([[0, 0.30], [0.05, 0.34], [0.16, 0.34], [0.26, 0.30], [0.30, 0.18], [0.305, 0.0]], { segments: 8 });
    bag.scale(1.0, 1.0, 0.66);
    const m = SH2.model.mat(color || 0x6f6547, { flat: true });
    const n = Math.max(3, Math.round(len / 0.52));
    for (let row = 0; row < 3; row++) {
      const count = n - row;
      for (let i = 0; i < count; i++) {
        const mesh = new T.Mesh(bag, m);
        mesh.position.set(-len / 2 + 0.26 + i * 0.52 + row * 0.13, 0.112 + row * 0.185, row * 0.02);
        mesh.rotation.y = (i % 2 ? 0.05 : -0.04) + row * 0.03;
        mesh.castShadow = true; mesh.receiveShadow = true;
        g.add(mesh);
      }
    }
    return g;
  }

  /* ------------------------------ здание ----------------------------------- */
  // plan — [[x,z], ...] по часовой стрелке; h — высота; roof: 'gable'|'flat'
  function building(plan, h, opts) {
    const T = THREE();
    const o = opts || {};
    const g = new T.Group();
    const M = SH2.model.mat;
    const b = planBounds(plan);

    // стены: полигон в плане выдавливается на высоту
    const wall = new T.Mesh(extrudePlan(plan, h, { bevel: o.bevel === undefined ? 0.05 : o.bevel }),
      M(o.wallColor || 0x4a4238, { flat: true }));
    wall.castShadow = true; wall.receiveShadow = true;
    g.add(wall);

    if (o.roof === 'gable') {
      // двускатная крыша по самому контуру: свес наружу, конёк вдоль длинной оси
      const rh = Math.min(b.hw, b.hd) * (o.ridge === undefined ? 0.34 : o.ridge) + 0.4;
      const over = 0.34;
      const cx = b.cx, cz = b.cz;
      const lower = plan.map((p) => {
        const dx = p[0] - cx, dz = p[1] - cz;
        const l = Math.hypot(dx, dz) || 1;
        return [p[0] + (dx / l) * over, p[1] + (dz / l) * over];
      });
      const alongX = b.hw >= b.hd; // конёк вдоль X, если здание шире по X
      const upper = lower.map((p) => {
        const k = 0.86;
        return alongX ? [p[0] + (cx - p[0]) * 0.02, cz + (p[1] - cz) * (1 - k)]
                      : [cx + (p[0] - cx) * (1 - k), p[1] + (cz - p[1]) * 0.02];
      });
      const roofMat = M(o.roofColor || 0x2f2b26, { flat: true, side: T.DoubleSide });
      const roof = new T.Mesh(loftBetween(lower, upper, h, h + rh), roofMat);
      roof.castShadow = true; roof.receiveShadow = true;
      g.add(roof);
      // свес снизу (зашивка карниза), чтобы не было дыры под скатом
      const soffit = new T.Mesh(loftBetween(lower, lower, h, h - 0.10),
        M(o.roofColor || 0x2f2b26, { flat: true }));
      soffit.material.side = T.DoubleSide;
      g.add(soffit);
      addWindows(g, plan, h, o);
    } else if (o.roof !== 'none') {
      // плоская крыша: тонкая плита + парапет из полигонов
      const cap = new T.Mesh(extrudePlan(plan, 0.20, { bevel: 0.06 }),
        M(o.roofColor || 0x33302b, { flat: true }));
      cap.position.y = h;
      cap.castShadow = true; cap.receiveShadow = true;
      g.add(cap);
      const bw = 0.18;
      const ring = [
        [b.cx - b.hw, b.cz - b.hd], [b.cx + b.hw, b.cz - b.hd],
        [b.cx + b.hw, b.cz + b.hd], [b.cx - b.hw, b.cz + b.hd]
      ];
      for (let i = 0; i < 4; i++) {
        const a1 = ring[i], a2 = ring[(i + 1) % 4];
        const dx = a2[0] - a1[0], dz = a2[1] - a1[1];
        const len = Math.hypot(dx, dz);
        const par = new T.Mesh(extrudePlan([[-len / 2, -bw / 2], [len / 2, -bw / 2],
          [len / 2, bw / 2], [-len / 2, bw / 2]], 0.62, { bevel: 0.03 }),
          M(0x2b2824, { flat: true }));
        par.position.set((a1[0] + a2[0]) / 2, h + 0.20, (a1[1] + a2[1]) / 2);
        par.rotation.y = Math.atan2(dz, dx) * -1;
        g.add(par);
      }
      addWindows(g, plan, h, o);
    }
    return g;
  }

  function addWindows(g, plan, h, o) {
    const T = THREE();
    const M = SH2.model.mat;
    const dark = M(0x11161a, { flat: true });
    const glow = M(o.windowColor || 0x2c3f4a, { emissive: o.windowEmissive || 0x101f28, emissiveIntensity: 1 });
    for (let i = 0; i < plan.length; i++) {
      const a = plan[i], b = plan[(i + 1) % plan.length];
      const dx = b[0] - a[0], dz = b[1] - a[1];
      const len = Math.hypot(dx, dz);
      if (len < 3) continue;
      const ux = dx / len, uz = dz / len;
      const nx = uz, nz = -ux; // нормаль наружу (plan по часовой)
      const cols = Math.floor(len / 2.6);
      const rows = Math.max(1, Math.floor((h - 1.6) / 2.6));
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const t = 0.9 + c * 2.6 + 1.2;
          if (t > len - 0.9) break;
          const px = a[0] + ux * t + nx * 0.055;
          const pz = a[1] + uz * t + nz * 0.055;
          const geo = new T.PlaneGeometry(0.95, 1.15);
          const m = new T.Mesh(geo, (c + r) % 5 === 0 ? glow : dark);
          m.position.set(px, 1.9 + r * 2.6, pz);
          m.rotation.y = Math.atan2(ux, uz) + Math.PI / 2;
          m.matrixAutoUpdate = false;
          m.updateMatrix();
          g.add(m);
        }
      }
    }
  }

  /* ------------------------------ вышка ----------------------------------- */
  function tower(x, z, w, h, color) {
    const T = THREE();
    const M = SH2.model.mat;
    const g = new T.Group();
    const legMat = M(color || 0x3c3a33, { flat: true });
    const legGeo = new T.CylinderGeometry(0.11, 0.14, h, 6);
    const half = w / 2;
    for (let i = 0; i < 4; i++) {
      const sx = (i & 1 ? 1 : -1) * (half - 0.35), sz = (i & 2 ? 1 : -1) * (half - 0.35);
      const leg = new T.Mesh(legGeo, legMat);
      leg.position.set(sx, h / 2, sz);
      // ноги слегка завалены внутрь
      leg.rotation.z = -sx * 0.012;
      leg.rotation.x = sz * 0.012;
      leg.castShadow = true;
      g.add(leg);
    }
    // раскосы
    const braceGeo = new T.CylinderGeometry(0.045, 0.045, half * 1.6, 4);
    for (let lvl = 0; lvl < Math.floor(h / 2.4); lvl++) {
      for (let side = 0; side < 4; side++) {
        const b = new T.Mesh(braceGeo, legMat);
        const y = 1.4 + lvl * 2.4;
        if (side < 2) {
          b.position.set(0, y, (side ? 1 : -1) * (half - 0.35));
          b.rotation.z = Math.PI / 2;
          b.rotation.y = (lvl % 2 ? 0.6 : -0.6);
        } else {
          b.position.set((side === 2 ? 1 : -1) * (half - 0.35), y, 0);
          b.rotation.x = Math.PI / 2;
          b.rotation.z = (lvl % 2 ? 0.6 : -0.6);
        }
        g.add(b);
      }
    }
    // площадка
    const deck = new T.Mesh(extrudePlan(
      [[-half, -half], [half, -half], [half, half], [-half, half]], 0.22, { bevel: 0.05 }),
      M(0x4a473c, { flat: true }));
    deck.position.y = h;
    deck.castShadow = true; deck.receiveShadow = true;
    g.add(deck);
    // перила
    const rail = new T.Mesh(new T.TorusGeometry(half * 1.02, 0.045, 4, 4), legMat);
    rail.rotation.x = Math.PI / 2;
    rail.position.y = h + 0.95;
    g.add(rail);
    g.position.set(x, 0, z);
    return g;
  }

  /* ---------------------------- бетонный блок ------------------------------ */
  // скошенный блок: лофт двух прямоугольников (низ шире верха)
  function barrier(x, z, angle, len, color) {
    const T = THREE();
    const M = SH2.model.mat;
    const g = new T.Group();
    const L = len || 5.2, thick = 0.52, hgt = 1.18;
    const low = [[-L / 2, -thick / 2], [L / 2, -thick / 2], [L / 2, thick / 2], [-L / 2, thick / 2]];
    const high = [[-L / 2 * 0.96, -thick * 0.30], [L / 2 * 0.96, -thick * 0.30],
                  [L / 2 * 0.96, thick * 0.30], [-L / 2 * 0.96, thick * 0.30]];
    const geo = new T.BufferGeometry();
    const n = 4, verts = [], idx = [];
    for (let i = 0; i < n; i++) verts.push(low[i][0], 0, low[i][1]);
    for (let i = 0; i < n; i++) verts.push(high[i][0], hgt, high[i][1]);
    for (let i = 0; i < n; i++) {
      const j = (i + 1) % n;
      idx.push(i, j, n + j, i, n + j, n + i);
    }
    // верхняя крышка
    idx.push(n, n + 1, n + 2, n, n + 2, n + 3);
    // низ
    idx.push(0, 2, 1, 0, 3, 2);
    geo.setAttribute('position', new T.Float32BufferAttribute(verts, 3));
    geo.setIndex(idx);
    geo.computeVertexNormals();
    const body = new T.Mesh(geo, M(color || 0x53575c, { flat: true }));
    body.castShadow = true; body.receiveShadow = true;
    g.add(body);
    // верхняя жёлтая полоса
    const stripe = new T.Mesh(extrudePlan([[-L / 2 * 0.9, -thick * 0.26], [L / 2 * 0.9, -thick * 0.26],
      [L / 2 * 0.9, thick * 0.26], [-L / 2 * 0.9, thick * 0.26]], 0.03, { bevel: 0.01 }),
      M(0xb99a4e, { flat: true }));
    stripe.position.y = hgt - 0.14;
    g.add(stripe);
    g.position.set(x, 0, z);
    g.rotation.y = angle || 0;
    return g;
  }


  /* ============================ ПРОПСЫ КАРТ ============================== */
  /* Каждый пропс строится контурами, а не примитивами: силуэт задаётся
     точками, выдавливается outlineMesh или вращается revolve. */

  function polyPrism(plan, h, color, opts) {
    const T = THREE();
    const o = opts || {};
    const geo = extrudePlan(plan, h, { bevel: o.bevel === undefined ? 0.02 : o.bevel });
    const mesh = new T.Mesh(geo, SH2.model.mat(color, { flat: true }));
    mesh.castShadow = true; mesh.receiveShadow = true;
    return mesh;
  }

  /* морской контейнер: рёбра жёсткости по бортам, рифлёный */
  function container(len, h, color) {
    const T = THREE();
    const g = new T.Group();
    const w = 1.22;
    g.add(polyPrism([[-len / 2, -w / 2], [len / 2, -w / 2], [len / 2, w / 2], [-len / 2, w / 2]], h, color, { bevel: 0.05 }));
    const rib = SH2.outline.outlineMesh([
      [-0.02, h - 0.10], [0.02, h - 0.10], [0.02, 0.10], [-0.02, 0.10]
    ], { depth: 0.04, bevel: 0.008 });
    const ribMat = SH2.model.mat(0xffffff, { flat: true });
    ribMat.color.offsetHSL(0, 0, -0.06);
    const n = Math.max(3, Math.round(len / 0.62));
    for (let i = 0; i < n; i++) {
      const x = -len / 2 + (i + 0.5) * (len / n);
      for (const side of [-1, 1]) {
        const m = new T.Mesh(rib, ribMat);
        m.position.set(x, 0, side * (w / 2 + 0.01));
        m.castShadow = true;
        g.add(m);
      }
    }
    // торцевые двери
    for (const side of [-1, 1]) {
      const m = polyPrism([[-0.02, -w / 2 * 0.86], [0.02, -w / 2 * 0.86], [0.02, w / 2 * 0.86], [-0.02, w / 2 * 0.86]],
        h * 0.86, 0x3a3f43, { bevel: 0.01 });
      m.position.set(side * (len / 2 + 0.02), 0.06, 0);
      g.add(m);
    }
    return g;
  }

  /* крытый грузовик: рама, кабина со скосом лобового, тент-лофт, колёса */
  function truck(color) {
    const T = THREE();
    const g = new T.Group();
    const body = color || 0x4a5138;
    // рама
    const frame = polyPrism([[-2.3, -0.55], [2.3, -0.55], [2.3, 0.55], [-2.3, 0.55]], 0.42, 0x2c2f2a);
    frame.position.y = 0.42;
    g.add(frame);
    // кабина: выдавливаем контур вбок (depth по Z и поворот на π/2)
    const cab = SH2.outline.outlineMesh([
      [0.0, 0.0], [0.55, 0.0], [0.68, 0.42], [1.55, 0.48], [1.56, 1.02],
      [0.32, 1.10], [0.02, 0.66]
    ], { depth: 1.9, bevel: 0.07 });
    cab.translate(-0.95, 0, 0);
    const cabMesh = new T.Mesh(cab, SH2.model.mat(body, { flat: true }));
    cabMesh.castShadow = true;
    cabMesh.position.set(0.80, 0.84, 0);
    cabMesh.rotation.y = Math.PI / 2;
    g.add(cabMesh);
    // лобовое стекло
    const glass = SH2.outline.outlineMesh([[0.12, 0.70], [0.72, 0.76], [0.74, 1.01], [0.20, 0.97]],
      { depth: 1.72, bevel: 0.02 });
    glass.translate(-0.86, 0, 0);
    const gm = new T.Mesh(glass, SH2.model.mat(0x24303a, { flat: false }));
    gm.position.set(0.82, 0.86, 0);
    gm.rotation.y = Math.PI / 2;
    g.add(gm);
    // тент: труба-лофт вдоль кузова, приплюснутая сверху
    const tarp = SH2.outline.loftSections([
      { at: [0, 0.90, 2.0], pts: SH2.outline.circleSection(0.92, 0.60, 12) },
      { at: [0, 0.94, 0.0], pts: SH2.outline.circleSection(0.96, 0.64, 12) },
      { at: [0, 0.90, -2.0], pts: SH2.outline.circleSection(0.92, 0.60, 12) }
    ]);
    const tm = new T.Mesh(tarp, SH2.model.mat(0x5a5f46, { flat: true }));
    tm.position.set(0, 0.02, 0.95);
    tm.scale.set(1, 0.82, 1);
    tm.castShadow = true;
    g.add(tm);
    // колёса — тела вращения
    const tyre = SH2.outline.revolve([[0, 0.44], [0.04, 0.46], [0.20, 0.46], [0.26, 0.42], [0.27, 0.0]], { segments: 12 });
    tyre.rotateZ(Math.PI / 2);
    for (const x of [-1.35, 1.15]) {
      for (const z of [-0.98, 0.98]) {
        const w = new T.Mesh(tyre, SH2.model.mat(0x1e2022, { flat: true }));
        w.position.set(x, 0.46, z);
        w.castShadow = true;
        g.add(w);
      }
    }
    return g;
  }

  /* фонарь: столб-лофт, кронштейн-контур, плафон */
  function lamp(color) {
    const T = THREE();
    const g = new T.Group();
    const pole = SH2.outline.loftSections([
      { at: [0, 0, 0], pts: SH2.outline.circleSection(0.11, 0.11, 8) },
      { at: [0, 2.8, 0], pts: SH2.outline.circleSection(0.085, 0.085, 8) },
      { at: [0, 4.6, 0], pts: SH2.outline.circleSection(0.07, 0.07, 8) }
    ]);
    const pm = new T.Mesh(pole, SH2.model.mat(color || 0x3e4348, { flat: true }));
    pm.castShadow = true;
    g.add(pm);
    const armGeo = SH2.outline.outlineMesh([[0, 0.0], [0.62, 0.10], [0.66, 0.02], [0.06, -0.10]], { depth: 0.07, bevel: 0.012 });
    const arm = new T.Mesh(armGeo, SH2.model.mat(color || 0x3e4348, { flat: true }));
    arm.position.set(0.02, 4.5, 0);
    arm.rotation.y = Math.PI / 2;
    g.add(arm);
    const head = SH2.outline.revolve([[0, 0.26], [0.03, 0.30], [0.11, 0.26], [0.14, 0.12], [0.15, 0.0]], { segments: 10 });
    const hm = new T.Mesh(head, SH2.model.mat(0xffd9a0, { flat: false, emissive: 0x2a1a08 }));
    hm.position.set(0.62, 4.36, 0);
    hm.rotation.x = Math.PI;
    g.add(hm);
    return g;
  }

  /* наблюдательная вышка: четыре опоры, площадка, перила, крыша */
  function watchtower(w, h, color) {
    const T = THREE();
    const g = new T.Group();
    const leg = SH2.outline.outlineMesh([[-0.09, 0], [0.09, 0], [0.06, h], [-0.06, h]], { depth: 0.18, bevel: 0.02 });
    const lm = SH2.model.mat(color || 0x4a4136, { flat: true });
    for (const sx of [-1, 1]) {
      for (const sz of [-1, 1]) {
        const m = new T.Mesh(leg, lm);
        m.position.set(sx * w * 0.42, 0, sz * w * 0.42);
        m.rotation.y = Math.PI / 4 * (sx * sz > 0 ? 1 : -1);
        m.rotation.z = -sx * 0.06;
        m.castShadow = true;
        g.add(m);
      }
    }
    // распорки
    const brace = SH2.outline.outlineMesh([[-w * 0.4, -0.05], [w * 0.4, -0.05], [w * 0.4, 0.05], [-w * 0.4, 0.05]],
      { depth: 0.10, bevel: 0.01 });
    const bm = SH2.model.mat(0x3b342b, { flat: true });
    for (let i = 1; i <= 3; i++) {
      for (const sz of [-1, 1]) {
        const m = new T.Mesh(brace, bm);
        m.position.set(0, h * i / 4, sz * w * 0.42);
        m.castShadow = true;
        g.add(m);
      }
    }
    // площадка и перила
    const deck = polyPrism([[-w * 0.52, -w * 0.52], [w * 0.52, -w * 0.52], [w * 0.52, w * 0.52], [-w * 0.52, w * 0.52]],
      0.16, color || 0x4a4136);
    deck.position.y = h;
    g.add(deck);
    const rail = SH2.outline.outlineMesh([[-w * 0.5, -0.5], [w * 0.5, -0.5], [w * 0.5, 0.5], [-w * 0.5, 0.5]], { depth: 0.06, bevel: 0.01 });
    const rm = SH2.model.mat(0x3b342b, { flat: true });
    for (const [x, z, ry] of [[0, -w * 0.5, 0], [0, w * 0.5, 0], [-w * 0.5, 0, Math.PI / 2], [w * 0.5, 0, Math.PI / 2]]) {
      const m = new T.Mesh(rail, rm);
      m.position.set(x, h + 0.55, z);
      m.rotation.y = ry;
      g.add(m);
    }
    // крыша-скат
    const roof = polyPrism([[-w * 0.62, -w * 0.62], [w * 0.62, -w * 0.62], [w * 0.62, w * 0.62], [-w * 0.62, w * 0.62]],
      0.12, 0x35302a);
    roof.position.y = h + 1.9;
    g.add(roof);
    return g;
  }

  /* подбитая техника: корпус-контур, башня, ствол, катки */
  function wreck(color) {
    const T = THREE();
    const g = new T.Group();
    const hull = SH2.outline.outlineMesh([
      [-1.9, 1.05], [-1.95, 1.55], [-1.1, 1.85], [0.6, 1.9], [1.75, 1.65],
      [1.9, 1.20], [1.5, 0.95], [-1.2, 0.92]
    ], { depth: 2.6, bevel: 0.14 });
    const hullMesh = new T.Mesh(hull, SH2.model.mat(color || 0x3b3a30, { flat: true }));
    hullMesh.position.y = 0.30;
    hullMesh.rotation.z = 0.04;
    hullMesh.castShadow = true;
    g.add(hullMesh);
    const turret = SH2.outline.revolve([[0, 0.62], [0.10, 0.70], [0.46, 0.62], [0.58, 0.30], [0.60, 0.0]], { segments: 10 });
    const tm = new T.Mesh(turret, SH2.model.mat(0x353428, { flat: true }));
    tm.position.set(-0.15, 2.05, 0);
    tm.rotation.z = 0.12;
    g.add(tm);
    const barrel = SH2.outline.revolve([[0, 0.09], [1.4, 0.08], [1.5, 0.06], [1.52, 0]], { segments: 10 });
    barrel.rotateZ(Math.PI / 2);
    const bm = new T.Mesh(barrel, SH2.model.mat(0x2e2d24, { flat: true }));
    bm.position.set(1.1, 2.12, 0);
    bm.rotation.y = 0.16;
    g.add(bm);
    const wheel = SH2.outline.revolve([[0, 0.30], [0.03, 0.33], [0.14, 0.33], [0.19, 0.29], [0.20, 0]], { segments: 10 });
    wheel.rotateZ(Math.PI / 2);
    for (const x of [-1.4, -0.45, 0.5, 1.4]) {
      for (const z of [-1.05, 1.05]) {
        const w = new T.Mesh(wheel, SH2.model.mat(0x232520, { flat: true }));
        w.position.set(x, 0.30, z);
        g.add(w);
      }
    }
    return g;
  }


  /* след боя: горка гильз, обломки, пятно гари (только графика) */
  function shells(x, z, a) {
    const T = THREE();
    const g = new T.Group();
    const caseGeo = SH2.outline.revolve([[0, 0.012], [0.004, 0.013], [0.05, 0.012], [0.056, 0.0]], { segments: 6 });
    caseGeo.rotateZ(Math.PI / 2);
    const cm = SH2.model.mat(0xb08a3c, { flat: true });
    const debris = SH2.outline.outlineMesh([[-0.18, 0], [0.18, 0], [0.10, 0.12], [-0.12, 0.10]], { depth: 0.10, bevel: 0.02 });
    const dm = SH2.model.mat(0x3a352c, { flat: true });
    for (let i = 0; i < 22; i++) {
      const c = new T.Mesh(caseGeo, cm);
      c.position.set((Math.random() - 0.5) * 1.5, 0.02, (Math.random() - 0.5) * 1.5);
      c.rotation.y = Math.random() * 3.14;
      g.add(c);
    }
    for (let i = 0; i < 5; i++) {
      const d = new T.Mesh(debris, dm);
      d.position.set((Math.random() - 0.5) * 2.0, 0.02, (Math.random() - 0.5) * 2.0);
      d.rotation.set((Math.random() - 0.5) * 0.5, Math.random() * 3.14, (Math.random() - 0.5) * 0.5);
      g.add(d);
    }
    g.position.set(x, 0, z);
    g.rotation.y = a || 0;
    return g;
  }


  /* воронка: кольцо выброса + тёмное дно (плоские полигоны, дёшево) */
  function crater(r) {
    const T = THREE();
    const g = new T.Group();
    const rings = [
      { rr: r, y: 0.012, col: 0x2b241c },
      { rr: r * 0.72, y: 0.02, col: 0x1d1813 },
      { rr: r * 0.42, y: 0.028, col: 0x120f0b }
    ];
    rings.forEach((ring) => {
      const pts = [];
      for (let i = 0; i < 14; i++) {
        const a = i / 14 * Math.PI * 2;
        const k = 0.82 + ((i * 37) % 11) / 30;
        pts.push([Math.cos(a) * ring.rr * k, Math.sin(a) * ring.rr * k]);
      }
      const m = new T.Mesh(extrudePlan(pts, 0.02, { bevel: 0.0 }), SH2.model.mat(ring.col, { flat: true }));
      m.position.y = ring.y;
      m.receiveShadow = true;
      g.add(m);
    });
    // комья земли по краю
    const clod = SH2.outline.outlineMesh([[-0.12, 0], [0.12, 0], [0.08, 0.10], [-0.10, 0.08]], { depth: 0.12, bevel: 0.02 });
    const cm = SH2.model.mat(0x362d22, { flat: true });
    for (let i = 0; i < 8; i++) {
      const a = i / 8 * Math.PI * 2 + 0.3;
      const c = new T.Mesh(clod, cm);
      c.position.set(Math.cos(a) * r * 0.95, 0.0, Math.sin(a) * r * 0.95);
      c.rotation.y = Math.random() * 3.14;
      g.add(c);
    }
    return g;
  }

  /* куст / сухая трава: несколько тел вращения, разной высоты */
  function bush(size, color) {
    const T = THREE();
    const g = new T.Group();
    const s0 = size || 0.8;
    const geo = SH2.outline.revolve([[0, 0.30], [0.05, 0.34], [0.16, 0.32], [0.24, 0.20], [0.26, 0.0]], { segments: 8 });
    const m = SH2.model.mat(color || 0x4a5133, { flat: true });
    const n = 3 + Math.floor(Math.random() * 3);
    for (let i = 0; i < n; i++) {
      const b = new T.Mesh(geo, m);
      const a = Math.random() * 6.28, rr = Math.random() * s0 * 0.5;
      b.position.set(Math.cos(a) * rr, 0.0, Math.sin(a) * rr);
      b.scale.setScalar(s0 * (0.7 + Math.random() * 0.6));
      b.rotation.y = Math.random() * 3.14;
      b.castShadow = true;
      g.add(b);
    }
    return g;
  }

  /* обломки: битый кирпич и куски бетона в куче */
  function rubble(size, color) {
    const T = THREE();
    const g = new T.Group();
    const chunk = SH2.outline.outlineMesh([
      [-0.20, 0.0], [-0.06, 0.10], [0.16, 0.06], [0.22, 0.0], [0.10, -0.10], [-0.12, -0.10]
    ], { depth: 0.18, bevel: 0.03 });
    const m = SH2.model.mat(color || 0x6a6157, { flat: true });
    const s0 = size || 1.4;
    for (let i = 0; i < 12; i++) {
      const c = new T.Mesh(chunk, m);
      const a = Math.random() * 6.28, rr = Math.random() * s0;
      c.position.set(Math.cos(a) * rr, Math.random() * 0.18, Math.sin(a) * rr);
      c.rotation.set((Math.random() - 0.5) * 0.6, Math.random() * 3.14, (Math.random() - 0.5) * 0.6);
      c.scale.setScalar(0.5 + Math.random() * 0.8);
      c.castShadow = true;
      g.add(c);
    }
    // пятно пыли под кучей
    const dust = new T.Mesh(extrudePlan([[-s0, -s0 * 0.7], [s0, -s0 * 0.5], [s0 * 0.8, s0 * 0.7], [-s0 * 0.9, s0 * 0.5]], 0.01, { bevel: 0 }),
      SH2.model.mat(0x574e42, { flat: true }));
    dust.position.y = 0.004;
    g.add(dust);
    return g;
  }

  /* пулемётное гнездо: кольцо мешков + станок и ствол */
  function mgNest() {
    const T = THREE();
    const g = new T.Group();
    const bags = sandbagRow(3.4, 0x6f6547);
    bags.rotation.y = 0.2;
    g.add(bags);
    const bags2 = sandbagRow(2.6, 0x6a6044);
    bags2.position.set(0.6, 0, 1.2);
    bags2.rotation.y = 1.2;
    g.add(bags2);
    // станок
    const tripod = SH2.outline.outlineMesh([[-0.04, 0], [0.04, 0], [0.03, 0.42], [-0.03, 0.42]], { depth: 0.06, bevel: 0.01 });
    const tm = SH2.model.mat(0x33383c, { flat: true });
    for (const a of [0, 2.09, 4.19]) {
      const l = new T.Mesh(tripod, tm);
      l.position.set(Math.cos(a) * 0.16, 0, Math.sin(a) * 0.16);
      l.rotation.set(Math.cos(a) * 0.4, 0, Math.sin(a) * 0.4);
      g.add(l);
    }
    const receiver = SH2.outline.outlineMesh([[-0.30, 0.42], [0.30, 0.44], [0.32, 0.56], [-0.28, 0.56]], { depth: 0.14, bevel: 0.02 });
    const rm = new T.Mesh(receiver, SH2.model.mat(0x2b3034, { flat: true }));
    rm.castShadow = true;
    g.add(rm);
    const barrel = SH2.outline.revolve([[0, 0.030], [0.72, 0.026], [0.78, 0.020], [0.80, 0]], { segments: 10 });
    barrel.rotateX(Math.PI / 2);
    const bm = new T.Mesh(barrel, SH2.model.mat(0x24292d, { flat: true }));
    bm.position.set(0.06, 0.50, 0.30);
    g.add(bm);
    return g;
  }

  /* маскировочная сеть на стойках: провисающая плоскость */
  function camoNet(w, d, h) {
    const T = THREE();
    const g = new T.Group();
    const pole = SH2.outline.revolve([[0, 0.05], [0.02, 0.06], [h, 0.045], [h + 0.06, 0.0]], { segments: 6 });
    const pm = SH2.model.mat(0x4a4436, { flat: true });
    const corners = [[-w / 2, -d / 2], [w / 2, -d / 2], [w / 2, d / 2], [-w / 2, d / 2]];
    corners.forEach((c, i) => {
      const p = new T.Mesh(pole, pm);
      p.position.set(c[0], 0, c[1]);
      p.scale.y = i % 2 ? 1 : 0.92;   // провис
      g.add(p);
    });
    // полотно сети — четыре треугольника с провисом в центре
    const sag = h * 0.82;
    const verts = [];
    const idx = [];
    const push = (x, y, z) => { verts.push(x, y, z); return verts.length / 3 - 1; };
    const c0 = push(0, sag, 0);
    corners.forEach((c) => push(c[0], h, c[1]));
    for (let i = 0; i < 4; i++) {
      const a = 1 + i, b = 1 + (i + 1) % 4;
      idx.push(c0, b, a);
      idx.push(c0, a, b);
    }
    const geo = new T.BufferGeometry();
    geo.setAttribute('position', new T.Float32BufferAttribute(verts, 3));
    geo.setIndex(idx);
    geo.computeVertexNormals();
    const net = new T.Mesh(geo, SH2.model.mat(0x4d5238, { flat: true }));
    net.material.side = T.DoubleSide !== undefined ? T.DoubleSide : 2;
    g.add(net);
    return g;
  }

  /* забор: столбы + две доски, пробиваемый */
  function fence(a, b, color) {
    const T = THREE();
    const g = new T.Group();
    const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
    const ang = Math.atan2(b[1] - a[1], b[0] - a[0]);
    const plank = SH2.outline.outlineMesh([[-0.06, 0.10], [0.06, 0.10], [0.06, 0.92], [-0.06, 0.92]], { depth: 0.03, bevel: 0.006 });
    const pm = SH2.model.mat(color || 0x554a38, { flat: true });
    const post = SH2.outline.revolve([[0, 0.06], [0.02, 0.07], [1.05, 0.06], [1.1, 0.0]], { segments: 6 });
    const posMat = SH2.model.mat(0x4a4034, { flat: true });
    const n = Math.max(2, Math.round(len / 2.6));
    for (let i = 0; i <= n; i++) {
      const x = -len / 2 + (len / n) * i;
      const p = new T.Mesh(post, posMat);
      p.position.set(x, 0, 0);
      p.castShadow = true;
      g.add(p);
    }
    const boards = Math.max(2, Math.floor(len / 0.62));
    for (let i = 0; i < boards; i++) {
      const x = -len / 2 + (i + 0.5) * (len / boards);
      const m = new T.Mesh(plank, pm);
      m.position.set(x, 0, 0);
      m.castShadow = true;
      g.add(m);
    }
    g.position.set((a[0] + b[0]) / 2, 0, (a[1] + b[1]) / 2);
    g.rotation.y = -ang;
    return g;
  }

  /* траншея: три сегмента стенки, выкопанный жёлоб (визуально) */
  function trench(len, color) {
    const T = THREE();
    const g = new T.Group();
    const wall = SH2.outline.outlineMesh([[-0.16, 0.0], [0.16, 0.0], [0.10, 0.52], [-0.20, 0.52]], { depth: len, bevel: 0.05 });
    const m = new T.Mesh(wall, SH2.model.mat(color || 0x453c2f, { flat: true }));
    m.position.set(0, -0.22, 0);
    m.rotation.y = Math.PI / 2;
    m.receiveShadow = true;
    g.add(m);
    const lip = SH2.outline.outlineMesh([[-0.30, 0.0], [0.30, 0.0], [0.22, 0.12], [-0.22, 0.12]], { depth: len * 0.98, bevel: 0.03 });
    const lm = new T.Mesh(lip, SH2.model.mat(0x5a4e3c, { flat: true }));
    lm.position.set(0.34, -0.06, 0);
    lm.rotation.y = Math.PI / 2;
    g.add(lm);
    return g;
  }

  /* ящики: сложенный штабель, каждый ящик чуть повёрнут */
  function crates(n, color) {
    const T = THREE();
    const g = new T.Group();
    const geo = SH2.outline.outlineMesh([[-0.32, 0], [0.32, 0], [0.32, 0.62], [-0.32, 0.62]], { depth: 0.62, bevel: 0.05 });
    const m = SH2.model.mat(color || 0x5b4a33, { flat: true });
    let placed = 0;
    for (let layer = 0; layer < 3 && placed < n; layer++) {
      const k = Math.min(n - placed, 3 - layer);
      for (let i = 0; i < k; i++) {
        const mesh = new T.Mesh(geo, m);
        mesh.position.set((i - (k - 1) / 2) * 0.68, layer * 0.64, (Math.random() - 0.5) * 0.05);
        mesh.rotation.y = (Math.random() - 0.5) * 0.12;
        mesh.castShadow = true; mesh.receiveShadow = true;
        g.add(mesh);
        placed++;
      }
    }
    return g;
  }

  SH2.level = {
    building, tower, barrier, sandbagRow, extrudePlan, loftBetween, planBounds, polyShape,
    container, truck, lamp, watchtower, wreck, fence, trench, crates, shells, crater, bush, rubble, mgNest, camoNet, polyPrism
  };
})(typeof window !== 'undefined' ? window : globalThis);
