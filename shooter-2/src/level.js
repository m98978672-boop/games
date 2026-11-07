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

  SH2.level = {
    building, tower, barrier, sandbagRow, extrudePlan, loftBetween, planBounds, polyShape
  };
})(typeof window !== 'undefined' ? window : globalThis);
