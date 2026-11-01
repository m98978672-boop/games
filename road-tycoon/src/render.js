/* Отрисовка карты: процедурный рельеф, города, дороги, объекты, трафик, ночь. */
(function () {
  const TR = (window.TR = window.TR || {});
  const U = TR.Util;
  const C = TR.CONFIG;
  const R = (TR.Render = {});

  const PX_PER_KM = 9;         // базовый масштаб при zoom = 1
  const TERRAIN_PPK = 10;      // разрешение подготовки рельефа

  const V = {
    canvas: null, ctx: null, w: 0, h: 0, dpr: 1,
    terrain: null, time: 0,
    hover: null,
  };

  R.init = function (canvas, world) {
    V.canvas = canvas;
    V.ctx = canvas.getContext('2d');
    R.resize();
    R.buildTerrain(world);
  };

  R.resize = function () {
    const c = V.canvas;
    if (!c) return;
    V.dpr = Math.min(window.devicePixelRatio || 1, 2);
    V.w = c.clientWidth;
    V.h = c.clientHeight;
    c.width = Math.floor(V.w * V.dpr);
    c.height = Math.floor(V.h * V.dpr);
    V.ctx.setTransform(V.dpr, 0, 0, V.dpr, 0, 0);
  };

  R.ppk = (zoom) => PX_PER_KM * zoom;
  R.facilityPos = (f, road) => facilityWorldPos(f, road);

  R.toScreen = function (app, x, y) {
    const ppk = R.ppk(app.camera.zoom);
    return { x: (x - app.camera.x) * ppk + V.w / 2, y: (y - app.camera.y) * ppk + V.h / 2 };
  };
  R.toWorld = function (app, sx, sy) {
    const ppk = R.ppk(app.camera.zoom);
    return { x: (sx - V.w / 2) / ppk + app.camera.x, y: (sy - V.h / 2) / ppk + app.camera.y };
  };

  /* ============================================================ рельеф */

  R.buildTerrain = function (world) {
    const k = TERRAIN_PPK;
    const cv = document.createElement('canvas');
    cv.width = Math.round(C.worldW * k);
    cv.height = Math.round(C.worldH * k);
    const g = cv.getContext('2d');
    const W = cv.width, H = cv.height;

    // базовая трава с шумом
    const img = g.createImageData(W, H);
    const data = img.data;
    const noise = world.noise;
    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        const wx = x / k, wy = y / k;
        const n1 = noise(wx * 0.055, wy * 0.055);
        const n2 = noise(wx * 0.17, wy * 0.17);
        const n = n1 * 0.65 + n2 * 0.35;
        const f = U.clamp(0.5 + n * 0.5, 0, 1);
        const idx = (y * W + x) * 4;
        data[idx] = 96 + f * 25;
        data[idx + 1] = 122 + f * 20;
        data[idx + 2] = 72 + f * 20;
        data[idx + 3] = 255;
      }
    }
    g.putImageData(img, 0, 0);

    // поля
    for (const field of world.fields) {
      g.save();
      g.translate(field.x * k, field.y * k);
      g.rotate(field.rot);
      const grad = g.createLinearGradient(-field.w * k / 2, 0, field.w * k / 2, 0);
      const colors = [['#b2a05e', '#9c8a4d'], ['#9dae62', '#8a9c53'], ['#c0a868', '#a89153']][field.kind];
      grad.addColorStop(0, colors[0]);
      grad.addColorStop(1, colors[1]);
      g.globalAlpha = 0.55;
      U.roundRect(g, (-field.w * k) / 2, (-field.h * k) / 2, field.w * k, field.h * k, 4);
      g.fillStyle = grad;
      g.fill();
      g.globalAlpha = 0.22;
      g.strokeStyle = colors[1];
      g.lineWidth = 1;
      for (let i = -field.h * k / 2; i < field.h * k / 2; i += 4) {
        g.beginPath();
        g.moveTo(-field.w * k / 2, i);
        g.lineTo(field.w * k / 2, i);
        g.stroke();
      }
      g.restore();
    }

    // холмы
    for (const hill of world.hills) {
      const rad = hill.r * k;
      const grad = g.createRadialGradient(hill.x * k - rad * 0.25, hill.y * k - rad * 0.3, rad * 0.1, hill.x * k, hill.y * k, rad);
      grad.addColorStop(0, 'rgba(146,166,102,0.85)');
      grad.addColorStop(0.55, 'rgba(120,142,84,0.5)');
      grad.addColorStop(1, 'rgba(96,116,70,0)');
      g.fillStyle = grad;
      g.beginPath();
      g.arc(hill.x * k, hill.y * k, rad, 0, Math.PI * 2);
      g.fill();
      g.strokeStyle = 'rgba(72,90,54,0.28)';
      g.lineWidth = 1;
      for (let i = 1; i <= 3; i++) {
        g.beginPath();
        g.ellipse(hill.x * k, hill.y * k, rad * (0.3 + i * 0.18), rad * (0.24 + i * 0.15), 0.3, 0, Math.PI * 2);
        g.stroke();
      }
    }

    // леса
    for (const forest of world.forests) {
      const rand = U.mulberry32(forest.seed);
      const rad = forest.r * k;
      const grad = g.createRadialGradient(forest.x * k, forest.y * k, rad * 0.2, forest.x * k, forest.y * k, rad);
      grad.addColorStop(0, 'rgba(58,86,50,0.92)');
      grad.addColorStop(0.7, 'rgba(62,90,52,0.75)');
      grad.addColorStop(1, 'rgba(62,90,52,0)');
      g.fillStyle = grad;
      g.beginPath();
      g.arc(forest.x * k, forest.y * k, rad, 0, Math.PI * 2);
      g.fill();
      const count = Math.round(18 + rad * 0.55);
      for (let i = 0; i < count; i++) {
        const ang = rand() * Math.PI * 2;
        const rr = Math.sqrt(rand()) * rad * 0.92;
        const tx = forest.x * k + Math.cos(ang) * rr;
        const ty = forest.y * k + Math.sin(ang) * rr;
        const tr = 1.6 + rand() * 2.4;
        g.fillStyle = rand() < 0.5 ? '#36573a' : '#40663f';
        g.beginPath();
        g.arc(tx, ty, tr, 0, Math.PI * 2);
        g.fill();
        if (forest.type === 'pine' && rand() < 0.35) {
          g.fillStyle = 'rgba(48,74,48,0.8)';
          g.beginPath();
          g.moveTo(tx, ty - tr * 2.1);
          g.lineTo(tx + tr * 1.1, ty + tr * 0.7);
          g.lineTo(tx - tr * 1.1, ty + tr * 0.7);
          g.closePath();
          g.fill();
        }
      }
    }

    // реки
    for (const river of world.rivers) {
      const pts = river.map((p) => ({ x: p.x * k, y: p.y * k }));
      drawSmooth(g, pts, k * 2.6, 'rgba(120,128,92,0.55)');
      drawSmooth(g, pts, k * 1.9, '#6f97ad');
      drawSmooth(g, pts, k * 1.25, '#5c8fa9');
      drawSmooth(g, pts, k * 0.5, 'rgba(146,196,214,0.55)');
    }

    // озёра
    for (const lake of world.lakes) {
      g.save();
      g.translate(lake.x * k, lake.y * k);
      g.rotate(lake.rot);
      g.fillStyle = 'rgba(120,128,92,0.5)';
      g.beginPath();
      g.ellipse(0, 0, lake.rx * k * 1.14, lake.ry * k * 1.2, 0, 0, Math.PI * 2);
      g.fill();
      g.fillStyle = '#5b8ea8';
      g.beginPath();
      g.ellipse(0, 0, lake.rx * k, lake.ry * k, 0, 0, Math.PI * 2);
      g.fill();
      g.fillStyle = 'rgba(140,190,210,0.4)';
      g.beginPath();
      g.ellipse(-lake.rx * k * 0.2, -lake.ry * k * 0.2, lake.rx * k * 0.55, lake.ry * k * 0.45, 0, 0, Math.PI * 2);
      g.fill();
      g.restore();
    }

    // города
    C.cities.forEach((city, i) => drawCityBase(g, city, i, k));

    // затемнение к краям карты, чтобы не было резкой границы
    const edge = 9 * k;
    const strips = [
      { x: 0, y: 0, w: W, h: edge, x0: 0, y0: 0, x1: 0, y1: edge },
      { x: 0, y: H - edge, w: W, h: edge, x0: 0, y0: H, x1: 0, y1: H - edge },
      { x: 0, y: 0, w: edge, h: H, x0: 0, y0: 0, x1: edge, y1: 0 },
      { x: W - edge, y: 0, w: edge, h: H, x0: W, y0: 0, x1: W - edge, y1: 0 },
    ];
    for (const st of strips) {
      const lg = g.createLinearGradient(st.x0, st.y0, st.x1, st.y1);
      lg.addColorStop(0, 'rgba(22,32,21,0.92)');
      lg.addColorStop(0.55, 'rgba(22,32,21,0.35)');
      lg.addColorStop(1, 'rgba(22,32,21,0)');
      g.fillStyle = lg;
      g.fillRect(st.x, st.y, st.w, st.h);
    }

    // лёгкая виньетка
    const vg = g.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.3, W / 2, H / 2, Math.max(W, H) * 0.75);
    vg.addColorStop(0, 'rgba(20,28,20,0)');
    vg.addColorStop(1, 'rgba(16,24,18,0.35)');
    g.fillStyle = vg;
    g.fillRect(0, 0, W, H);

    V.terrain = cv;
    V.world = world;
    V.bridges = null;
    V.bridgesKey = '';
  };

  function segHit(ax, ay, bx, by, cx, cy, dx, dy) {
    const r1x = bx - ax, r1y = by - ay, r2x = dx - cx, r2y = dy - cy;
    const den = r1x * r2y - r1y * r2x;
    if (Math.abs(den) < 1e-6) return null;
    const t = ((cx - ax) * r2y - (cy - ay) * r2x) / den;
    const u = ((cx - ax) * r1y - (cy - ay) * r1x) / den;
    if (t < 0 || t > 1 || u < 0 || u > 1) return null;
    return { x: ax + r1x * t, y: ay + r1y * t };
  }

  function buildBridges(app) {
    const s = app.state;
    const world = V.world;
    if (!world) return [];
    const out = [];
    for (const road of s.roads) {
      const c = U.curve(road);
      const pts = [];
      for (let i = 0; i <= 40; i++) pts.push(U.curvePoint(c, i / 40));
      for (const river of world.rivers) {
        for (let i = 0; i < pts.length - 1; i++) {
          for (let j = 0; j < river.length - 1; j++) {
            const hit = segHit(pts[i].x, pts[i].y, pts[i + 1].x, pts[i + 1].y,
              river[j].x, river[j].y, river[j + 1].x, river[j + 1].y);
            if (hit) {
              out.push({ x: hit.x, y: hit.y, angle: Math.atan2(pts[i + 1].y - pts[i].y, pts[i + 1].x - pts[i].x), road });
            }
          }
        }
      }
    }
    return out;
  }

  function drawSmooth(g, pts, width, color) {
    if (pts.length < 2) return;
    g.strokeStyle = color;
    g.lineWidth = width;
    g.lineJoin = 'round';
    g.lineCap = 'round';
    g.beginPath();
    g.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i < pts.length - 1; i++) {
      const mid = { x: (pts[i].x + pts[i + 1].x) / 2, y: (pts[i].y + pts[i + 1].y) / 2 };
      g.quadraticCurveTo(pts[i].x, pts[i].y, mid.x, mid.y);
    }
    const last = pts[pts.length - 1];
    g.lineTo(last.x, last.y);
    g.stroke();
  }

  function drawCityBase(g, city, index, k) {
    const rand = U.mulberry32(4242 + index * 991);
    const cx = city.x * k, cy = city.y * k;
    const rad = 4.1 * k;

    // пригород
    g.fillStyle = 'rgba(126,128,96,0.35)';
    g.beginPath();
    g.arc(cx, cy, rad * 1.22, 0, Math.PI * 2);
    g.fill();

    // кварталы
    for (let ring = 0; ring < 3; ring++) {
      const r = rad * (0.42 + ring * 0.28);
      const blocks = 5 + ring * 4;
      for (let i = 0; i < blocks; i++) {
        const ang = (i / blocks) * Math.PI * 2 + ring * 0.4;
        const rr = r * (0.72 + rand() * 0.3);
        const bx = cx + Math.cos(ang) * rr;
        const by = cy + Math.sin(ang) * rr;
        const bw = 3 + rand() * 5, bh = 3 + rand() * 5;
        g.fillStyle = 'rgba(52,54,46,0.28)';
        g.fillRect(bx - bw / 2 + 1.2, by - bh / 2 + 1.2, bw, bh);
        const palette = ['#d9d3c4', '#c8c3b6', '#e2d9c4', '#b9b4a8', '#cfb9a2', '#a9b3a8'];
        g.fillStyle = palette[Math.floor(rand() * palette.length)];
        g.fillRect(bx - bw / 2, by - bh / 2, bw, bh);
        g.fillStyle = 'rgba(120,90,70,0.35)';
        g.fillRect(bx - bw / 2, by - bh / 2, bw, bh * 0.32);
      }
    }
    // центр
    g.fillStyle = '#b9b3a2';
    g.beginPath();
    g.arc(cx, cy, rad * 0.34, 0, Math.PI * 2);
    g.fill();
    g.strokeStyle = 'rgba(255,255,255,0.5)';
    g.lineWidth = 1.4;
    g.beginPath();
    g.arc(cx, cy, rad * 0.34, 0, Math.PI * 2);
    g.stroke();
    // зелёный скверик в центре
    g.fillStyle = '#79995a';
    g.beginPath();
    g.arc(cx, cy, rad * 0.16, 0, Math.PI * 2);
    g.fill();
  }

  /* ========================================================== отрисовка */

  R.draw = function (app, dt) {
    const s = app.state;
    V.time += dt;
    const ctx = V.ctx;
    ctx.save();
    ctx.clearRect(0, 0, V.w, V.h);

    // фон за пределами карты
    ctx.fillStyle = '#26301f';
    ctx.fillRect(0, 0, V.w, V.h);

    // рельеф
    if (V.terrain) {
      const ppk = R.ppk(app.camera.zoom);
      const tl = R.toScreen(app, 0, 0);
      ctx.imageSmoothingEnabled = true;
      ctx.drawImage(V.terrain, tl.x, tl.y, C.worldW * ppk, C.worldH * ppk);
    }

    // рамка карты
    const tl = R.toScreen(app, 0, 0);
    const br = R.toScreen(app, C.worldW, C.worldH);
    ctx.strokeStyle = 'rgba(240,184,64,0.18)';
    ctx.lineWidth = 2;
    ctx.strokeRect(tl.x, tl.y, br.x - tl.x, br.y - tl.y);

    drawRoads(app, ctx);
    drawBridges(app, ctx);
    drawFacilities(app, ctx);
    drawVehicles(app, ctx);
    drawCityLabels(app, ctx);
    drawToolPreview(app, ctx);
    drawFloats(app, ctx, dt);
    drawNight(app, ctx);
    drawWeather(app, ctx);
    drawSelection(app, ctx);
    drawCursorHint(app, ctx);

    ctx.restore();
  };

  /* ------------------------------------------------------------- дороги */

  function roadPath(ctx, app, road) {
    const c = U.curve(road);
    const steps = 26;
    ctx.beginPath();
    for (let i = 0; i <= steps; i++) {
      const p = U.curvePoint(c, i / steps);
      const sp = R.toScreen(app, p.x, p.y);
      if (i === 0) ctx.moveTo(sp.x, sp.y);
      else ctx.lineTo(sp.x, sp.y);
    }
  }

  function drawRoads(app, ctx) {
    const s = app.state;
    const ppk = R.ppk(app.camera.zoom);
    const hoverId = app.hover && app.hover.road ? app.hover.road.id : null;
    const selId = app.selection && app.selection.kind === 'road' ? app.selection.id : null;

    for (const road of s.roads) {
      const type = C.roadTypes[road.quality];
      const w = Math.max(2.4, type.width * ppk);
      const open = road.open && !road.building;

      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';

      // тень
      ctx.strokeStyle = 'rgba(30,36,26,0.35)';
      ctx.lineWidth = w + Math.max(2, ppk * 0.7);
      roadPath(ctx, app, road);
      ctx.stroke();

      // обочина
      ctx.strokeStyle = type.edge;
      ctx.lineWidth = w + Math.max(1.2, ppk * 0.32);
      roadPath(ctx, app, road);
      ctx.stroke();

      // покрытие
      if (open) {
        ctx.strokeStyle = type.color;
        ctx.lineWidth = w;
        roadPath(ctx, app, road);
        ctx.stroke();

        // разметка
        if (road.quality >= 2) {
          ctx.save();
          ctx.setLineDash([Math.max(4, ppk * 1.5), Math.max(4, ppk * 1.7)]);
          ctx.strokeStyle = road.quality === 3 ? 'rgba(240,200,90,0.75)' : 'rgba(232,232,220,0.55)';
          ctx.lineWidth = Math.max(0.8, ppk * 0.13);
          roadPath(ctx, app, road);
          ctx.stroke();
          ctx.restore();
        } else {
          ctx.save();
          ctx.setLineDash([Math.max(2, ppk * 0.4), Math.max(3, ppk * 0.8)]);
          ctx.strokeStyle = 'rgba(60,50,35,0.45)';
          ctx.lineWidth = Math.max(0.8, ppk * 0.12);
          roadPath(ctx, app, road);
          ctx.stroke();
          ctx.restore();
        }

        // освещение
        if (road.light) drawLamps(app, ctx, road, ppk);

        // перекрытие
        if (road.blockedUntil > s.time) {
          const mid = U.curvePoint(U.curve(road), 0.5);
          const sp = R.toScreen(app, mid.x, mid.y);
          drawBadge(ctx, sp.x, sp.y, ppk, '#e2604f', '⚠');
        }
      } else {
        // строящаяся дорога — пунктир
        ctx.save();
        ctx.setLineDash([Math.max(4, ppk * 0.9), Math.max(4, ppk * 0.8)]);
        ctx.strokeStyle = 'rgba(240,184,64,0.75)';
        ctx.lineWidth = Math.max(1.6, ppk * 0.28);
        roadPath(ctx, app, road);
        ctx.stroke();
        ctx.restore();

        // прогресс
        const frac = road.totalKm > 0 ? road.builtKm / road.totalKm : 0;
        const c = U.curve(road);
        const steps = Math.max(2, Math.round(frac * 26));
        ctx.strokeStyle = type.color;
        ctx.lineWidth = w;
        ctx.beginPath();
        for (let i = 0; i <= steps; i++) {
          const pp = U.curvePoint(c, (i / steps) * frac);
          const sp = R.toScreen(app, pp.x, pp.y);
          if (i === 0) ctx.moveTo(sp.x, sp.y);
          else ctx.lineTo(sp.x, sp.y);
        }
        ctx.stroke();
        // техника на конце стройки
        const endT = road.builtKm / Math.max(1, road.totalKm);
        const p = U.curvePoint(c, U.clamp(endT, 0, 1));
        const sp = R.toScreen(app, p.x, p.y);
        drawWorker(ctx, sp.x, sp.y, ppk, road);
        // подпись прогресса
        const pct = Math.round(frac * 100);
        drawChip(ctx, sp.x, sp.y - ppk * 1.6, `${pct}%`, 'rgba(16,20,16,0.82)', '#f0b840', Math.max(9, ppk * 0.62));
      }

      // подсветка выбранной/под курсором
      if (hoverId === road.id || selId === road.id) {
        ctx.strokeStyle = selId === road.id ? 'rgba(240,184,64,0.95)' : 'rgba(240,184,64,0.5)';
        ctx.lineWidth = Math.max(2, ppk * 0.34);
        ctx.setLineDash([Math.max(3, ppk * 0.7), Math.max(2, ppk * 0.5)]);
        roadPath(ctx, app, road);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    }
  }

  function drawLamps(app, ctx, road, ppk) {
    const c = U.curve(road);
    const n = Math.max(2, Math.round(road.totalKm / 4));
    for (let i = 1; i < n; i++) {
      const t = i / n;
      const p = U.curvePoint(c, t);
      const sp = R.toScreen(app, p.x, p.y);
      ctx.fillStyle = 'rgba(240,207,106,0.85)';
      ctx.beginPath();
      ctx.arc(sp.x, sp.y, Math.max(1, ppk * 0.16), 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function drawWorker(ctx, x, y, ppk, road) {
    const size = Math.max(7, ppk * 0.9);
    ctx.save();
    ctx.translate(x, y);
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.beginPath();
    ctx.ellipse(0, size * 0.5, size * 0.7, size * 0.25, 0, 0, Math.PI * 2);
    ctx.fill();
    // каток
    ctx.fillStyle = '#e9b23f';
    U.roundRect(ctx, -size * 0.6, -size * 0.35, size * 1.2, size * 0.6, 2);
    ctx.fill();
    ctx.fillStyle = '#3a3d33';
    ctx.beginPath();
    ctx.arc(-size * 0.35, size * 0.32, size * 0.22, 0, Math.PI * 2);
    ctx.arc(size * 0.35, size * 0.32, size * 0.22, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#2f3327';
    ctx.fillRect(-size * 0.22, -size * 0.62, size * 0.44, size * 0.3);
    ctx.restore();
  }

  /* ----------------------------------------------------------- объекты */

  function facilityWorldPos(f, road) {
    const c = U.curve(road);
    const p = U.curvePoint(c, f.t);
    const ang = U.curveAngle(c, f.t);
    const off = 3.4;
    return { x: p.x + Math.cos(ang + Math.PI / 2) * off * (f.side || 1), y: p.y + Math.sin(ang + Math.PI / 2) * off * (f.side || 1) };
  }

  function drawBridges(app, ctx) {
    const s = app.state;
    const key = s.graphVersion + ':' + s.roads.length;
    if (V.bridgesKey !== key) {
      V.bridges = buildBridges(app);
      V.bridgesKey = key;
    }
    if (!V.bridges || !V.bridges.length) return;
    const ppk = R.ppk(app.camera.zoom);
    for (const b of V.bridges) {
      const sp = R.toScreen(app, b.x, b.y);
      if (sp.x < -40 || sp.x > V.w + 40 || sp.y < -40 || sp.y > V.h + 40) continue;
      const len = Math.max(12, ppk * 3.2);
      const w = C.roadTypes[b.road.quality].width * ppk + ppk * 1.1;
      ctx.save();
      ctx.translate(sp.x, sp.y);
      ctx.rotate(b.angle);
      ctx.fillStyle = 'rgba(20,26,20,0.28)';
      U.roundRect(ctx, -len / 2 + 1, -w / 2 + 1.5, len, w, 2);
      ctx.fill();
      ctx.fillStyle = '#9a978a';
      U.roundRect(ctx, -len / 2, -w / 2, len, w, 2);
      ctx.fill();
      ctx.strokeStyle = '#6f6c60';
      ctx.lineWidth = Math.max(1, ppk * 0.16);
      ctx.beginPath();
      ctx.moveTo(-len / 2, -w / 2); ctx.lineTo(len / 2, -w / 2);
      ctx.moveTo(-len / 2, w / 2); ctx.lineTo(len / 2, w / 2);
      ctx.moveTo(0, -w / 2); ctx.lineTo(0, w / 2);
      ctx.stroke();
      ctx.restore();
    }
  }

  function drawFacilities(app, ctx) {
    const s = app.state;
    const ppk = R.ppk(app.camera.zoom);
    const sel = app.selection && app.selection.kind === 'facility' ? app.selection.id : null;
    const hovered = app.hover && app.hover.facility ? app.hover.facility.id : null;
    const k = Math.max(24, Math.min(52, ppk * 3.4));

    for (const f of s.facilities) {
      const road = TR.Sim.roadById(s, f.roadId);
      if (!road) continue;
      const pos = facilityWorldPos(f, road);
      const sp = R.toScreen(app, pos.x, pos.y);
      if (sp.x < -80 || sp.x > V.w + 80 || sp.y < -80 || sp.y > V.h + 80) continue;
      const def = C.facilityByKey[f.type];
      const scale = f.id === sel || f.id === hovered ? 1.12 : 1;

      drawFacilityIcon(ctx, f, def, sp.x, sp.y, k * scale, ppk);
      if (!f.ready) drawProgress(ctx, sp.x, sp.y, k, f.progress);
      if (f.ready && f.type !== 'trees' && f.type !== 'lights') drawLevelPips(ctx, sp.x, sp.y, k, f.level, def.color);
      if (f.id === sel) {
        ctx.strokeStyle = 'rgba(240,184,64,0.95)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(sp.x, sp.y, k * 0.72, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
  }

  function drawFacilityIcon(ctx, f, def, x, y, k, ppk) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(k / 100, k / 100);
    // тень и площадка
    ctx.fillStyle = 'rgba(18,24,18,0.3)';
    ctx.beginPath();
    ctx.ellipse(0, 36, 42, 13, 0, 0, Math.PI * 2);
    ctx.fill();
    const pad = ctx.createLinearGradient(0, -44, 0, 44);
    pad.addColorStop(0, 'rgba(248,244,233,0.96)');
    pad.addColorStop(1, 'rgba(226,220,204,0.92)');
    ctx.fillStyle = pad;
    U.roundRect(ctx, -44, -44, 88, 88, 16);
    ctx.fill();
    ctx.strokeStyle = 'rgba(38,48,36,0.45)';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    switch (f.type) {
      case 'cafe': {
        ctx.fillStyle = '#f0e6d2';
        U.roundRect(ctx, -30, -14, 60, 34, 5); ctx.fill();
        ctx.fillStyle = '#c95b3f';
        ctx.beginPath(); ctx.moveTo(-38, -12); ctx.lineTo(0, -40); ctx.lineTo(38, -12); ctx.closePath(); ctx.fill();
        ctx.fillStyle = '#f3c14b';
        ctx.fillRect(-34, -14, 68, 6);
        ctx.fillStyle = '#5b4432';
        U.roundRect(ctx, -10, 2, 20, 18, 3); ctx.fill();
        ctx.fillStyle = '#7fc0dd';
        ctx.fillRect(-25, -2, 12, 10); ctx.fillRect(13, -2, 12, 10);
        // чашка
        ctx.fillStyle = '#fff';
        U.roundRect(ctx, 22, -34, 14, 12, 3); ctx.fill();
        ctx.fillStyle = '#8a5a3b';
        ctx.beginPath(); ctx.arc(29, -28, 5, 0, Math.PI * 2); ctx.fill();
        break;
      }
      case 'fuel': {
        ctx.fillStyle = '#e8e6da';
        U.roundRect(ctx, -20, -8, 40, 30, 4); ctx.fill();
        ctx.fillStyle = '#3f8a54';
        U.roundRect(ctx, -40, -30, 80, 14, 4); ctx.fill();
        ctx.fillStyle = '#2c6b41';
        ctx.fillRect(-6, -16, 12, 10);
        ctx.fillStyle = '#c9d3c2';
        ctx.fillRect(-30, -16, 7, 38); ctx.fillRect(23, -16, 7, 38);
        ctx.fillStyle = '#f0f0e6';
        U.roundRect(ctx, 12, -2, 20, 18, 3); ctx.fill();
        ctx.fillStyle = '#3f8a54';
        ctx.fillRect(15, 1, 14, 5);
        ctx.fillStyle = '#e2604f';
        ctx.fillRect(15, 8, 14, 3);
        break;
      }
      case 'shop': {
        ctx.fillStyle = '#f2ede0';
        U.roundRect(ctx, -32, -18, 64, 40, 4); ctx.fill();
        for (let i = 0; i < 5; i++) {
          ctx.fillStyle = i % 2 ? '#e7e0cf' : '#cf5c46';
          ctx.fillRect(-32 + i * 13, -24, 13, 8);
        }
        ctx.fillStyle = '#8fc7e0';
        ctx.fillRect(-24, -6, 18, 16);
        ctx.fillStyle = '#5b4a38';
        U.roundRect(ctx, 4, -6, 20, 26, 2); ctx.fill();
        break;
      }
      case 'ad': {
        ctx.fillStyle = '#8b8577';
        ctx.fillRect(-4, -6, 8, 40);
        ctx.fillStyle = '#5b6470';
        U.roundRect(ctx, -36, -42, 72, 38, 4); ctx.fill();
        ctx.fillStyle = '#f2c14e';
        U.roundRect(ctx, -30, -36, 60, 26, 2); ctx.fill();
        ctx.fillStyle = '#3a3f45';
        ctx.font = 'bold 20px system-ui';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('АЗС →', 0, -22);
        break;
      }
      case 'tire': {
        ctx.fillStyle = '#d7d2c5';
        U.roundRect(ctx, -30, -20, 60, 44, 4); ctx.fill();
        ctx.fillStyle = '#4a4f55';
        ctx.fillRect(-22, -6, 44, 26);
        ctx.fillStyle = '#2f3338';
        ctx.beginPath(); ctx.arc(14, 26, 11, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#8e969d';
        ctx.beginPath(); ctx.arc(14, 26, 4, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#d94f3d';
        U.roundRect(ctx, -30, -30, 60, 9, 3); ctx.fill();
        break;
      }
      case 'wash': {
        ctx.fillStyle = '#cfe3ec';
        U.roundRect(ctx, -32, -18, 64, 40, 4); ctx.fill();
        ctx.fillStyle = '#5aa8cc';
        U.roundRect(ctx, -26, -26, 52, 12, 3); ctx.fill();
        ctx.fillStyle = '#3d6f86';
        ctx.fillRect(-24, -10, 20, 26);
        ctx.fillStyle = '#cfe3ec';
        ctx.font = 'bold 18px system-ui';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('✧', 16, 4);
        break;
      }
      case 'motel': {
        ctx.fillStyle = '#e7dcc9';
        U.roundRect(ctx, -32, -34, 64, 56, 4); ctx.fill();
        ctx.fillStyle = '#9a8f7a';
        ctx.fillRect(-32, -34, 64, 6);
        for (let i = 0; i < 3; i++) {
          ctx.fillStyle = '#f0c96a';
          ctx.fillRect(-26 + i * 20, -22, 11, 12);
          ctx.fillStyle = '#f0c96a';
          ctx.fillRect(-26 + i * 20, -2, 11, 12);
        }
        ctx.fillStyle = '#d95e4a';
        U.roundRect(ctx, -30, -46, 60, 12, 3); ctx.fill();
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 16px system-ui';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('МОТЕЛЬ', 0, -40);
        break;
      }
      case 'camp': {
        ctx.fillStyle = '#6f9a58';
        ctx.beginPath(); ctx.ellipse(0, 20, 42, 16, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#e8b45a';
        ctx.beginPath(); ctx.moveTo(-26, 20); ctx.lineTo(-6, -22); ctx.lineTo(14, 20); ctx.closePath(); ctx.fill();
        ctx.fillStyle = '#d89a42';
        ctx.beginPath(); ctx.moveTo(-6, -22); ctx.lineTo(14, 20); ctx.lineTo(-14, 20); ctx.closePath(); ctx.fill();
        for (let i = 0; i < 3; i++) {
          const tx = 16 + i * 9, ty = 8 + (i % 2) * 5;
          ctx.fillStyle = '#4d7a48';
          ctx.beginPath(); ctx.arc(tx, ty, 7, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = '#6b4a2e';
          ctx.fillRect(tx - 1.5, ty + 5, 3, 5);
        }
        break;
      }
      case 'repair': {
        ctx.fillStyle = '#d9d4c6';
        U.roundRect(ctx, -34, -24, 68, 48, 4); ctx.fill();
        ctx.fillStyle = '#57606a';
        ctx.fillRect(-28, -6, 56, 26);
        ctx.fillStyle = '#3b4148';
        for (let i = 0; i < 4; i++) ctx.fillRect(-26 + i * 14, -4, 10, 22);
        ctx.fillStyle = '#cf5d4e';
        U.roundRect(ctx, -34, -32, 68, 9, 3); ctx.fill();
        ctx.fillStyle = '#e8e3d6';
        ctx.beginPath(); ctx.arc(22, -26, 7, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#57606a';
        ctx.fillRect(20, -30, 4, 8);
        break;
      }
      case 'charge': {
        ctx.fillStyle = '#e6f2ee';
        U.roundRect(ctx, -28, -16, 56, 36, 4); ctx.fill();
        ctx.fillStyle = '#2e9c88';
        U.roundRect(ctx, -28, -28, 56, 12, 3); ctx.fill();
        ctx.fillStyle = '#1c6d60';
        ctx.fillRect(-22, -10, 18, 26);
        ctx.fillStyle = '#55d9c2';
        ctx.beginPath();
        ctx.moveTo(14, -8); ctx.lineTo(4, 6); ctx.lineTo(11, 6);
        ctx.lineTo(5, 20); ctx.lineTo(19, 2); ctx.lineTo(11, 2); ctx.closePath();
        ctx.fill();
        break;
      }
      case 'toll': {
        ctx.fillStyle = '#e8e2d2';
        U.roundRect(ctx, -34, -22, 20, 30, 3); ctx.fill();
        U.roundRect(ctx, 14, -22, 20, 30, 3); ctx.fill();
        ctx.fillStyle = '#e0c14c';
        ctx.fillRect(-34, -30, 68, 9);
        ctx.fillStyle = '#c9553f';
        ctx.fillRect(-14, -26, 26, 5);
        ctx.fillStyle = '#f4f1e7';
        ctx.fillRect(-3, -14, 6, 16);
        ctx.fillStyle = '#f4f1e7';
        ctx.font = 'bold 15px system-ui';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('₽', 0, 18);
        break;
      }
      case 'busstop': {
        ctx.fillStyle = '#cfcabc';
        ctx.fillRect(-26, -14, 6, 38);
        ctx.fillRect(20, -14, 6, 38);
        ctx.fillStyle = '#e9e4d4';
        U.roundRect(ctx, -34, -32, 68, 20, 4); ctx.fill();
        ctx.fillStyle = '#4e7fa8';
        U.roundRect(ctx, -34, -32, 68, 8, 3); ctx.fill();
        ctx.fillStyle = '#8a8577';
        U.roundRect(ctx, -20, 4, 40, 8, 3); ctx.fill();
        break;
      }
      case 'trees': {
        for (let i = 0; i < 3; i++) {
          const tx = -22 + i * 22, ty = i === 1 ? -14 : 2;
          ctx.fillStyle = '#5a4028';
          ctx.fillRect(tx - 2, ty + 4, 4, 18);
          ctx.fillStyle = i === 1 ? '#4f8a4a' : '#5da055';
          ctx.beginPath(); ctx.arc(tx, ty, 15, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = 'rgba(255,255,255,0.14)';
          ctx.beginPath(); ctx.arc(tx - 4, ty - 5, 6, 0, Math.PI * 2); ctx.fill();
        }
        break;
      }
      case 'lights': {
        for (let i = 0; i < 2; i++) {
          const lx = -16 + i * 32;
          ctx.fillStyle = '#7d8078';
          ctx.fillRect(lx - 2, -26, 4, 48);
          ctx.fillStyle = '#b9b3a0';
          U.roundRect(ctx, lx - 8, -34, 16, 8, 3); ctx.fill();
          const glow = ctx.createRadialGradient(lx, -28, 1, lx, -28, 22);
          glow.addColorStop(0, 'rgba(255,224,140,0.85)');
          glow.addColorStop(1, 'rgba(255,224,140,0)');
          ctx.fillStyle = glow;
          ctx.beginPath(); ctx.arc(lx, -28, 22, 0, Math.PI * 2); ctx.fill();
        }
        break;
      }
      case 'square': {
        ctx.fillStyle = '#6f9a58';
        U.roundRect(ctx, -38, -26, 76, 52, 12); ctx.fill();
        ctx.fillStyle = '#8fb47a';
        ctx.beginPath(); ctx.ellipse(0, 4, 28, 16, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#6e9fc4';
        ctx.beginPath(); ctx.ellipse(0, 4, 12, 8, 0, 0, Math.PI * 2); ctx.fill();
        for (let i = 0; i < 6; i++) {
          const ang = (i / 6) * Math.PI * 2;
          ctx.fillStyle = ['#e06a8a', '#f0c14b', '#e88ab0', '#f3e0a0'][i % 4];
          ctx.beginPath(); ctx.arc(Math.cos(ang) * 26, 4 + Math.sin(ang) * 14, 5, 0, Math.PI * 2); ctx.fill();
        }
        break;
      }
      default: {
        ctx.fillStyle = def.color || '#c9b26a';
        U.roundRect(ctx, -26, -26, 52, 52, 8); ctx.fill();
      }
    }
    ctx.restore();
  }

  function drawLevelPips(ctx, x, y, k, level, color) {
    if (level <= 1) return;
    const r = Math.max(1.4, k * 0.055);
    const total = level - 1;
    let startX = x - (total * (r * 2.6)) / 2 + r * 1.3;
    for (let i = 0; i < total; i++) {
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(startX + i * r * 2.6, y + k * 0.47, r, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function drawProgress(ctx, x, y, k, p) {
    ctx.save();
    ctx.translate(x, y);
    ctx.fillStyle = 'rgba(18,22,18,0.6)';
    U.roundRect(ctx, -k * 0.9, -k * 0.9, k * 1.8, k * 1.8, 8);
    ctx.fill();
    ctx.strokeStyle = 'rgba(240,184,64,0.28)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, k * 0.5, 0, Math.PI * 2);
    ctx.stroke();
    ctx.strokeStyle = '#f0b840';
    ctx.lineWidth = Math.max(2, k * 0.09);
    ctx.beginPath();
    ctx.arc(0, 0, k * 0.5, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * U.clamp(p, 0, 1));
    ctx.stroke();
    ctx.fillStyle = '#f4eddc';
    ctx.font = `bold ${Math.max(8, k * 0.3)}px system-ui`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(Math.round(p * 100) + '%', 0, 0);
    ctx.restore();
  }

  function drawBadge(ctx, x, y, ppk, color, text) {
    const r = Math.max(7, ppk * 0.72);
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#12140f';
    ctx.font = `bold ${r * 1.2}px system-ui`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, x, y + 1);
  }

  /* ------------------------------------------------------------ машины */

  function drawVehicles(app, ctx) {
    const s = app.state;
    const ppk = R.ppk(app.camera.zoom);
    const night = U.isNight(s.time);
    for (const v of s.vehicles) {
      const sp = R.toScreen(app, Math.round(v.x * 100) / 100, Math.round(v.y * 100) / 100);
      if (sp.x < -30 || sp.x > V.w + 30 || sp.y < -30 || sp.y > V.h + 30) continue;
      const len = Math.max(4, (v.kind === 'truck' ? 3.0 : v.kind === 'bus' ? 2.7 : 1.9) * ppk * 0.55);
      const wid = Math.max(2.6, len * (v.kind === 'truck' ? 0.42 : 0.5));
      ctx.save();
      ctx.translate(sp.x, sp.y);
      ctx.rotate(v.angle);
      // тень
      ctx.fillStyle = 'rgba(16,20,14,0.35)';
      U.roundRect(ctx, -len / 2 + 1, -wid / 2 + 1.5, len, wid, wid * 0.35);
      ctx.fill();
      // кузов
      ctx.fillStyle = v.color;
      U.roundRect(ctx, -len / 2, -wid / 2, len, wid, wid * 0.32);
      ctx.fill();
      // кабина / стёкла
      ctx.fillStyle = 'rgba(30,40,50,0.75)';
      U.roundRect(ctx, len * 0.05, -wid * 0.34, len * 0.3, wid * 0.68, wid * 0.2);
      ctx.fill();
      if (v.kind === 'truck') {
        ctx.fillStyle = 'rgba(240,238,228,0.85)';
        U.roundRect(ctx, -len * 0.5, -wid * 0.36, len * 0.42, wid * 0.72, 1.5);
        ctx.fill();
      }
      if (night) {
        ctx.fillStyle = 'rgba(255,236,170,0.9)';
        ctx.beginPath();
        ctx.arc(len * 0.5, 0, Math.max(0.6, wid * 0.18), 0, Math.PI * 2);
        ctx.fill();
        const glow = ctx.createRadialGradient(len * 0.7, 0, 0, len * 0.7, 0, len * 1.1);
        glow.addColorStop(0, 'rgba(255,232,160,0.22)');
        glow.addColorStop(1, 'rgba(255,232,160,0)');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.moveTo(len * 0.45, 0);
        ctx.lineTo(len * 1.7, -len * 0.5);
        ctx.lineTo(len * 1.7, len * 0.5);
        ctx.closePath();
        ctx.fill();
      }
      ctx.restore();
    }
  }

  /* -------------------------------------------------------------- города */

  function drawCityLabels(app, ctx) {
    const s = app.state;
    const ppk = R.ppk(app.camera.zoom);
    for (let i = 0; i < C.cities.length; i++) {
      const city = C.cities[i];
      const dyn = s.cities[i];
      const sp = R.toScreen(app, city.x, city.y);
      if (sp.x < -120 || sp.x > V.w + 120 || sp.y < -80 || sp.y > V.h + 80) continue;
      const selected = app.selection && app.selection.kind === 'city' && app.selection.id === i;
      const sat = dyn ? dyn.sat : 1;
      const size = Math.max(9, Math.min(15, ppk * 0.72));

      // кольцо города
      ctx.strokeStyle = selected ? 'rgba(240,184,64,0.95)' : 'rgba(255,255,255,0.35)';
      ctx.lineWidth = selected ? 2.4 : 1.2;
      ctx.beginPath();
      ctx.arc(sp.x, sp.y, Math.max(6, 4.1 * ppk), 0, Math.PI * 2);
      ctx.stroke();

      // довольство — дуга
      ctx.strokeStyle = sat > 1.12 ? 'rgba(111,206,143,0.9)' : sat > 0.9 ? 'rgba(240,193,75,0.9)' : 'rgba(226,96,79,0.9)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(sp.x, sp.y, Math.max(6, 4.1 * ppk) + 5, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * U.clamp((sat - 0.45) / 1.2, 0.06, 1));
      ctx.stroke();

      // плашка с названием
      const label = city.name;
      ctx.font = `600 ${size}px "Segoe UI", system-ui, sans-serif`;
      const tw = ctx.measureText(label).width;
      const pad = size * 0.5;
      const boxW = tw + pad * 2;
      const boxH = size * 1.9;
      const bx = sp.x - boxW / 2;
      const by = sp.y - Math.max(6, 4.1 * ppk) - boxH - 6;
      ctx.fillStyle = 'rgba(14,18,14,0.82)';
      U.roundRect(ctx, bx, by, boxW, boxH, boxH * 0.32);
      ctx.fill();
      ctx.strokeStyle = selected ? 'rgba(240,184,64,0.8)' : 'rgba(240,230,200,0.18)';
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.fillStyle = '#f2ecdf';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(label, sp.x, by + boxH / 2 + 0.5);

      // население и довольство
      if (ppk > 6.2) {
        const sub = `${U.num(dyn ? dyn.pop : city.pop)} чел.`;
        ctx.font = `500 ${Math.max(8, size * 0.72)}px system-ui, sans-serif`;
        ctx.fillStyle = 'rgba(240,236,223,0.6)';
        ctx.fillText(sub, sp.x, by - Math.max(6, size * 0.6));
      }
      if (app.tool === 'road' && app.roadFrom === i) {
        ctx.strokeStyle = '#f0b840';
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.arc(sp.x, sp.y, Math.max(9, 4.1 * ppk) + 9, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    }
  }

  /* ------------------------------------------------------- вспом. элементы */

  function drawChip(ctx, x, y, text, bg, color, fontPx) {
    ctx.font = `600 ${fontPx}px "Segoe UI", system-ui, sans-serif`;
    const tw = ctx.measureText(text).width;
    const padX = fontPx * 0.55;
    const w = tw + padX * 2;
    const h = fontPx * 1.9;
    ctx.fillStyle = bg;
    U.roundRect(ctx, x - w / 2, y - h / 2, w, h, h / 2);
    ctx.fill();
    ctx.fillStyle = color;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, x, y + 0.5);
  }

  function drawFloats(app, ctx, dt) {
    const s = app.state;
    const ppk = R.ppk(app.camera.zoom);
    for (let i = s.floats.length - 1; i >= 0; i--) {
      const f = s.floats[i];
      f.life -= (dt || 0.016) * 1.15;
      if (f.life <= 0) { s.floats.splice(i, 1); continue; }
      const sp = R.toScreen(app, f.x, f.y);
      const rise = (1 - f.life / f.max) * ppk * 2.2;
      const a = U.clamp(f.life / f.max * 1.6, 0, 1);
      ctx.globalAlpha = a;
      drawChip(ctx, sp.x, sp.y - ppk * 1.2 - rise, f.text,
        f.kind === 'good' ? 'rgba(40,80,50,0.9)' : 'rgba(18,24,18,0.9)',
        f.kind === 'good' ? '#a9f0bd' : '#ffe08a', Math.max(9, Math.min(15, ppk * 0.82)));
      ctx.globalAlpha = 1;
    }
  }

  function drawNight(app, ctx) {
    const s = app.state;
    const h = U.timeHours(s.time);
    let dark = 0;
    if (h < 5) dark = 0.55;
    else if (h < 7) dark = 0.55 * (1 - (h - 5) / 2);
    else if (h < 19) dark = 0;
    else if (h < 21.5) dark = 0.62 * ((h - 19) / 2.5);
    else dark = 0.62;

    if (dark <= 0.01) return;
    ctx.save();
    ctx.fillStyle = `rgba(10,20,44,${dark})`;
    ctx.fillRect(0, 0, V.w, V.h);
    ctx.globalCompositeOperation = 'lighter';
    const ppk = R.ppk(app.camera.zoom);

    // огни городов
    for (let i = 0; i < C.cities.length; i++) {
      const city = C.cities[i];
      const sp = R.toScreen(app, city.x, city.y);
      const rad = Math.max(30, 6.5 * ppk);
      const g = ctx.createRadialGradient(sp.x, sp.y, 2, sp.x, sp.y, rad);
      g.addColorStop(0, `rgba(255,205,120,${0.32 * dark})`);
      g.addColorStop(0.5, `rgba(255,190,110,${0.12 * dark})`);
      g.addColorStop(1, 'rgba(255,190,110,0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(sp.x, sp.y, rad, 0, Math.PI * 2);
      ctx.fill();
    }
    // огни объектов
    const sel = s.facilities;
    for (let i = 0; i < sel.length; i++) {
      const f = sel[i];
      if (!f.ready) continue;
      const road = TR.Sim.roadById(s, f.roadId);
      if (!road) continue;
      const pos = facilityWorldPos(f, road);
      const sp = R.toScreen(app, pos.x, pos.y);
      const rad = Math.max(12, ppk * 1.7);
      const g = ctx.createRadialGradient(sp.x, sp.y, 1, sp.x, sp.y, rad);
      g.addColorStop(0, `rgba(255,214,130,${0.3 * dark})`);
      g.addColorStop(1, 'rgba(255,214,130,0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(sp.x, sp.y, rad, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  function drawWeather(app, ctx) {
    const s = app.state;
    const rainy = s.effects.some((e) => e.title && e.title.indexOf('Дожд') === 0);
    if (!rainy) return;
    ctx.save();
    ctx.strokeStyle = 'rgba(180,205,225,0.22)';
    ctx.lineWidth = 1;
    const t = V.time;
    for (let i = 0; i < 90; i++) {
      const x = ((i * 137 + t * 260) % (V.w + 100)) - 50;
      const y = ((i * 271 + t * 620) % (V.h + 100)) - 50;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x - 3, y + 12);
      ctx.stroke();
    }
    ctx.restore();
  }

  /* ------------------------------------------------------ выделение и курс */

  function drawSelection(app, ctx) {
    const s = app.state;
    const sel = app.selection;
    if (!sel) return;
    if (sel.kind === 'facility') {
      const f = s.facilities.find((x) => x.id === sel.id);
      if (!f) return;
      const road = TR.Sim.roadById(s, f.roadId);
      if (!road) return;
      const pos = facilityWorldPos(f, road);
      const sp = R.toScreen(app, pos.x, pos.y);
      ctx.strokeStyle = 'rgba(240,184,64,0.8)';
      ctx.setLineDash([3, 3]);
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(sp.x, sp.y, Math.max(14, R.ppk(app.camera.zoom) * 2.2), 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
    }
  }

  function drawToolPreview(app, ctx) {
    const s = app.state;
    const ppk = R.ppk(app.camera.zoom);
    const mouse = app.mouse;

    if (app.tool === 'road' && app.roadFrom != null && mouse) {
      const a = C.cities[app.roadFrom];
      const sp = R.toScreen(app, a.x, a.y);
      const q = app.roadPreview;
      ctx.save();
      ctx.setLineDash([8, 7]);
      ctx.lineWidth = 3;
      ctx.strokeStyle = q && q.ok ? 'rgba(240,184,64,0.9)' : 'rgba(226,96,79,0.9)';
      const target = app.hover && app.hover.city != null ? C.cities[app.hover.city] : null;
      const end = target ? R.toScreen(app, target.x, target.y) : { x: mouse.x, y: mouse.y };
      ctx.beginPath();
      ctx.moveTo(sp.x, sp.y);
      ctx.lineTo(end.x, end.y);
      ctx.stroke();
      ctx.restore();

      if (q) {
        const label = q.ok
          ? `${U.km(q.len)} · ${U.money(q.cost)}`
          : q.error;
        drawChip(ctx, end.x, end.y - 26, label, q.ok ? 'rgba(18,24,18,0.92)' : 'rgba(70,24,20,0.92)',
          q.ok ? '#f0d9a0' : '#ffb0a4', Math.max(10, Math.min(15, ppk * 0.78)));
      }
    }

    if (app.tool && app.tool.startsWith('fac:') && mouse && app.placePreview) {
      const def = C.facilityByKey[app.tool.slice(4)];
      if (!def) return;
      const p = app.placePreview;
      const road = p.roadId ? TR.Sim.roadById(s, p.roadId) : null;
      if (!road) return;
      const wp = facilityWorldPos({ t: p.t, side: p.side }, road);
      const sp = R.toScreen(app, wp.x, wp.y);
      const k = Math.max(24, Math.min(52, ppk * 3.4));
      ctx.save();
      ctx.globalAlpha = 0.8;
      drawFacilityIcon(ctx, { type: def.key, level: 1 }, def, sp.x, sp.y, k, ppk);
      ctx.restore();
      // зона притяжения
      ctx.strokeStyle = p.ok ? 'rgba(110,220,150,0.5)' : 'rgba(226,96,79,0.6)';
      ctx.setLineDash([4, 4]);
      ctx.lineWidth = 1.5;
      const rad = 1.9 * ppk;
      ctx.beginPath();
      ctx.moveTo(sp.x, sp.y);
      ctx.lineTo(sp.x, sp.y);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(sp.x, sp.y, Math.max(16, rad), 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
      if (!p.ok) {
        drawChip(ctx, sp.x, sp.y - k * 0.9, p.error || 'Нельзя', 'rgba(70,24,20,0.92)', '#ffb0a4', Math.max(10, Math.min(14, ppk * 0.72)));
      }
    }
  }

  function drawCursorHint(app, ctx) {
    const s = app.state;
    if (app.hover && app.hover.facility && (!app.tool || app.tool === 'select')) {
      const f = s.facilities.find((x) => x.id === app.hover.facility.id);
      if (!f) return;
      const road = TR.Sim.roadById(s, f.roadId);
      if (!road) return;
      const def = C.facilityByKey[f.type];
      const pos = facilityWorldPos(f, road);
      const sp = R.toScreen(app, pos.x, pos.y);
      const k = Math.max(24, Math.min(52, R.ppk(app.camera.zoom) * 3.4));
      const income = Math.round(f.revenueLastDay);
      const text = !f.ready
        ? `${def.name} · стройка ${Math.round(f.progress * 100)}%`
        : `${def.name}${f.level > 1 ? ' · ур.' + f.level : ''} · ${income > 0 ? U.money(income) + '/день' : 'ждёт клиентов'}`;
      ctx.font = '600 11px system-ui, sans-serif';
      const tw = ctx.measureText(text).width;
      const bx = sp.x - tw / 2 - 7;
      const by = sp.y - k * 0.75 - 24;
      ctx.fillStyle = 'rgba(12,16,12,0.92)';
      U.roundRect(ctx, bx, by, tw + 14, 20, 6);
      ctx.fill();
      ctx.strokeStyle = 'rgba(240,184,64,0.35)';
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.fillStyle = '#f2ecdf';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(text, sp.x, by + 10.5);
    }
  }
})();
