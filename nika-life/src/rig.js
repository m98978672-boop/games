/* =============================================================================
   НИКА: ЖИВАЯ — отрисовка: минималистичная квартира + мягкая иллюстративная Ника
   + отдельные визуальные сцены: переодевание, купание, сон, работа, разговор, санузел
   Поза приходит из NIKA.anim.Animator.pose(); одежда — из state.outfit.
   ============================================================================= */
(function (root) {
  'use strict';
  const NIKA = (root.NIKA = root.NIKA || {});
  const data = NIKA.data;
  const assets = NIKA.assets;
  const mesh = NIKA.mesh;

  const RAD = Math.PI / 180;
  const SKIN = '#f7d6bd', SKIN_SHADE = '#dfa98c', SKIN_LIGHT = '#fff0dd';
  const HAIR = '#3b2830', HAIR_MID = '#5c3b3d', HAIR_LIGHT = '#a97363';
  const INK = '#3f3040', LIP = '#c76a7a', LIP_DARK = '#9b4a5b';

  function rr(ctx, x, y, w, h, r) {
    r = Math.max(0, Math.min(r, Math.abs(w) / 2, Math.abs(h) / 2));
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y); ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r); ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h); ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r); ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }
  function fillRR(ctx, x, y, w, h, r, color, stroke) {
    rr(ctx, x, y, w, h, r);
    ctx.fillStyle = color; ctx.fill();
    if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = 1.1; ctx.stroke(); }
  }
  function circle(ctx, x, y, r, color) {
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fillStyle = color; ctx.fill();
  }
  function line(ctx, x1, y1, x2, y2, color, width) {
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2);
    ctx.strokeStyle = color; ctx.lineWidth = width || 2; ctx.lineCap = 'round'; ctx.stroke();
  }
  function hexToRgb(color) {
    const str = String(color || '#888888').trim();
    if (str.indexOf('rgb') === 0) {
      const nums = str.match(/[\d.]+/g);
      if (nums && nums.length >= 3) return [Number(nums[0]), Number(nums[1]), Number(nums[2])];
    }
    const h = str.replace('#', '');
    const s = h.length === 3 ? h.split('').map(function (c) { return c + c; }).join('') : h;
    const n = parseInt(s, 16);
    if (!Number.isFinite(n)) return [136, 136, 136];
    return [n >> 16, (n >> 8) & 255, n & 255];
  }
  function shade(hex, amount) {
    const c = hexToRgb(hex);
    return 'rgb(' + c.map(function (v) { return Math.max(0, Math.min(255, v + amount)); }).join(',') + ')';
  }
  function mixColor(a, b, t) {
    const x = hexToRgb(a), y = hexToRgb(b);
    return 'rgb(' + x.map(function (v, i) { return Math.round(v + (y[i] - v) * Math.max(0, Math.min(1, t))); }).join(',') + ')';
  }
  function glow(ctx, x, y, r, color, alpha) {
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, color.replace('ALPHA', String(alpha)));
    g.addColorStop(1, color.replace('ALPHA', '0'));
    ctx.fillStyle = g; ctx.fillRect(x - r, y - r, r * 2, r * 2);
  }
  function label(ctx, text, x, y, size, color, align) {
    ctx.font = '600 ' + size + 'px system-ui, -apple-system, "Segoe UI", sans-serif';
    ctx.textAlign = align || 'center'; ctx.fillStyle = color; ctx.fillText(text, x, y);
  }
  /* Закрасить текущий путь цветом и (если доступна) процедурной текстурой */
  function fillWith(ctx, color, pattern, alpha) {
    ctx.fillStyle = color; ctx.fill();
    if (pattern) {
      ctx.save();
      ctx.globalAlpha = alpha === undefined ? 0.32 : alpha;
      ctx.fillStyle = pattern; ctx.fill();
      ctx.restore();
    }
  }
  function lookIds(state) {
    return assets ? assets.idsFor(state.look || assets.defaultLook()) : {};
  }
  function pattern(ctx, id) {
    return assets ? assets.texture(ctx, id) : null;
  }
  function modelParams(id) {
    return assets && assets.model(id) ? assets.model(id) : null;
  }
  function profile(state) {
    return NIKA.world && NIKA.world.psyProfile
      ? NIKA.world.psyProfile(state)
      : { screen: true, turnAway: false, blush: 0.3, gazeDown: false, hemAdjust: 0.5, mirrorCheck: false, hesitate: false, seekApproval: false, modesty: 70, trust: 40 };
  }

  /* ============================ ПАЛИТРА И КВАРТИРА ========================== */
  function palette(state) {
    const hour = state.hour;
    const night = hour >= 21 || hour < 6;
    const dusk = (hour >= 18 && hour < 21) || (hour >= 5 && hour < 8);
    return {
      night: night, dusk: dusk,
      wall1: night ? '#282c35' : dusk ? '#eee3d6' : '#f7f2ea',
      wall2: night ? '#20242c' : dusk ? '#e2d5c5' : '#ece2d4',
      floor1: night ? '#4b423b' : dusk ? '#cdbba2' : '#dfccb1',
      floor2: night ? '#332d2a' : dusk ? '#b8a58d' : '#c9b394',
      line: night ? 'rgba(255,255,255,.10)' : 'rgba(70,58,45,.13)',
      frame: night ? '#3a3d45' : '#3b3631',
      wood: night ? '#5d4b3e' : '#bb9570',
      fabric: night ? '#4a4c56' : '#e9e1d5',
      fabric2: night ? '#3b3d47' : '#d8cfc1',
      ceramic: night ? '#8d929a' : '#f7f4ef',
      plant: night ? '#3f6b55' : '#5f9670',
      plant2: night ? '#355b49' : '#78ad82',
      ink: night ? '#d8d1c6' : '#4b433c',
      sky1: night ? '#101a33' : dusk ? '#e9a877' : '#a9d3e8',
      sky2: night ? '#2c3e64' : dusk ? '#8c78a4' : '#e1efdd',
      sun: night ? '#f2e6b8' : dusk ? '#ffd39a' : '#fff2c8',
      accent: '#e78fa6',
    };
  }

  function drawPlant(ctx, x, y, s, p) {
    fillRR(ctx, x - 11 * s, y - 4 * s, 22 * s, 22 * s, 5 * s, p.night ? '#6a5a4d' : '#c8a487');
    for (let i = 0; i < 6; i++) {
      ctx.save(); ctx.translate(x, y - 4 * s); ctx.rotate((i - 2.5) * 0.44);
      ctx.beginPath(); ctx.ellipse(0, -22 * s, 9 * s, 22 * s, 0, 0, Math.PI * 2);
      ctx.fillStyle = i % 2 ? p.plant : p.plant2; ctx.fill();
      ctx.restore();
    }
  }
  function drawArt(ctx, x, y, w, h, p) {
    fillRR(ctx, x, y, w, h, 3, p.night ? '#3a3e47' : '#fbf8f2', p.frame);
    ctx.save();
    ctx.beginPath(); rr(ctx, x + 3, y + 3, w - 6, h - 6, 2); ctx.clip();
    ctx.fillStyle = p.night ? '#2f333c' : '#efe8dc'; ctx.fillRect(x + 3, y + 3, w - 6, h - 6);
    circle(ctx, x + w * 0.36, y + h * 0.42, Math.min(w, h) * 0.22, p.night ? '#8a6f7a' : '#d7a98f');
    ctx.fillStyle = p.night ? '#5c6b74' : '#8fa89b';
    ctx.fillRect(x + w * 0.48, y + h * 0.22, w * 0.38, h * 0.12);
    ctx.fillStyle = p.night ? '#7b6252' : '#c9b394';
    ctx.fillRect(x + w * 0.18, y + h * 0.66, w * 0.55, h * 0.10);
    ctx.restore();
  }
  function drawWindow(ctx, w, h, p, state) {
    const x = w * 0.285, y = h * 0.07, ww = w * 0.235, wh = h * 0.52;
    fillRR(ctx, x - 7, y - 7, ww + 14, wh + 14, 4, p.night ? '#33363e' : '#e8e2d8', p.frame);
    const sky = ctx.createLinearGradient(0, y, 0, y + wh);
    sky.addColorStop(0, p.sky1); sky.addColorStop(1, p.sky2);
    ctx.fillStyle = sky; ctx.fillRect(x, y, ww, wh);
    if (p.night) {
      circle(ctx, x + ww * 0.74, y + wh * 0.22, 15, p.sun);
      for (let i = 0; i < 22; i++) {
        circle(ctx, x + ((i * 71) % (ww - 14)) + 7, y + ((i * 43) % (wh * 0.6)) + 8, i % 4 === 0 ? 1.7 : 1, 'rgba(255,255,255,.7)');
      }
      ctx.fillStyle = 'rgba(255,214,130,.55)';
      for (let i = 0; i < 16; i++) ctx.fillRect(x + ((i * 53) % (ww - 8)) + 3, y + wh * 0.72 + ((i * 17) % 22), 2, 3);
    } else {
      circle(ctx, x + ww * 0.24, y + wh * 0.23, 24, p.sun);
      ctx.fillStyle = 'rgba(255,255,255,.30)';
      fillRR(ctx, x + ww * 0.08, y + wh * 0.48, ww * 0.42, 11, 6, 'rgba(255,255,255,.34)');
      fillRR(ctx, x + ww * 0.55, y + wh * 0.60, ww * 0.38, 9, 5, 'rgba(255,255,255,.26)');
    }
    /* минималистичный силуэт города */
    ctx.fillStyle = p.night ? '#182238' : p.dusk ? '#7c7286' : '#9fb8a8';
    for (let i = 0; i < 10; i++) {
      const bh = 16 + ((i * 19) % 46);
      ctx.fillRect(x + i * (ww / 10), y + wh - bh, ww / 10 - 2, bh);
    }
    line(ctx, x + ww / 2, y, x + ww / 2, y + wh, p.frame, 3);
    line(ctx, x, y + wh * 0.52, x + ww, y + wh * 0.52, p.frame, 3);
    /* лёгкая штора */
    const curtain = ctx.createLinearGradient(x + ww * 0.80, 0, x + ww, 0);
    curtain.addColorStop(0, 'rgba(255,255,255,0)');
    curtain.addColorStop(1, p.night ? 'rgba(210,205,220,.16)' : 'rgba(255,252,245,.55)');
    ctx.fillStyle = curtain; ctx.fillRect(x + ww * 0.78, y, ww * 0.22, wh);
    fillRR(ctx, x - 12, y + wh + 2, ww + 24, 9, 3, p.wood);
  }

  /* ---- БОЛЬШАЯ КВАРТИРА: 13 зон на мире шириной W = w * WORLD_WIDTH ------ */
  function drawApartment(ctx, W, H, state) {
    const p = palette(state);
    const X = function (f) { return W * f; };
    const Y = function (f) { return H * f; };

    /* стены, пол, вертикальные швы-панели */
    const wall = ctx.createLinearGradient(0, 0, 0, Y(0.74));
    wall.addColorStop(0, p.wall1); wall.addColorStop(1, p.wall2);
    ctx.fillStyle = wall; ctx.fillRect(0, 0, W, Y(0.74));
    for (let i = 1; i < 26; i++) line(ctx, (i * W) / 26, 0, (i * W) / 26, Y(0.74), p.line, 1);
    const floor = ctx.createLinearGradient(0, Y(0.74), 0, H);
    floor.addColorStop(0, p.floor1); floor.addColorStop(1, p.floor2);
    ctx.fillStyle = floor; ctx.fillRect(0, Y(0.74), W, H);
    for (let i = 1; i < 9; i++) line(ctx, 0, Y(0.74) + i * Y(0.029), W, Y(0.74) + i * Y(0.029), p.line, 1);
    line(ctx, 0, Y(0.74), W, Y(0.74), p.night ? 'rgba(0,0,0,.3)' : 'rgba(90,70,50,.22)', 3);

    /* большие окна: одно в гостиной, второе — балконная дверь */
    function windowAt(x, y, ww, wh, nightSky) {
      fillRR(ctx, x - 7, y - 7, ww + 14, wh + 14, 4, p.night ? '#33363e' : '#e8e2d8', p.frame);
      const sky = ctx.createLinearGradient(0, y, 0, y + wh);
      sky.addColorStop(0, p.sky1); sky.addColorStop(1, p.sky2);
      ctx.fillStyle = sky; ctx.fillRect(x, y, ww, wh);
      if (p.night) {
        circle(ctx, x + ww * 0.74, y + wh * 0.22, 13, p.sun);
        for (let i = 0; i < 18; i++) circle(ctx, x + ((i * 71) % (ww - 14)) + 7, y + ((i * 43) % (wh * 0.6)) + 8, i % 4 === 0 ? 1.6 : 1, 'rgba(255,255,255,.7)');
        ctx.fillStyle = 'rgba(255,214,130,.5)';
        for (let i = 0; i < 14; i++) ctx.fillRect(x + ((i * 53) % (ww - 8)) + 3, y + wh * 0.74 + ((i * 17) % 20), 2, 3);
      } else {
        circle(ctx, x + ww * 0.24, y + wh * 0.23, 21, p.sun);
        fillRR(ctx, x + ww * 0.08, y + wh * 0.48, ww * 0.42, 10, 5, 'rgba(255,255,255,.34)');
        fillRR(ctx, x + ww * 0.55, y + wh * 0.60, ww * 0.38, 8, 4, 'rgba(255,255,255,.26)');
      }
      ctx.fillStyle = p.night ? '#182238' : p.dusk ? '#7c7286' : '#9fb8a8';
      for (let i = 0; i < 9; i++) { const bh = 14 + ((i * 19) % 42); ctx.fillRect(x + i * (ww / 9), y + wh - bh, ww / 9 - 2, bh); }
      line(ctx, x + ww / 2, y, x + ww / 2, y + wh, p.frame, 3);
      line(ctx, x, y + wh * 0.52, x + ww, y + wh * 0.52, p.frame, 3);
      const curtain = ctx.createLinearGradient(x + ww * 0.80, 0, x + ww, 0);
      curtain.addColorStop(0, 'rgba(255,255,255,0)');
      curtain.addColorStop(1, p.night ? 'rgba(210,205,220,.16)' : 'rgba(255,252,245,.52)');
      ctx.fillStyle = curtain; ctx.fillRect(x + ww * 0.78, y, ww * 0.22, wh);
      fillRR(ctx, x - 12, y + wh + 2, ww + 24, 9, 3, p.wood);
      if (nightSky) glow(ctx, x + ww / 2, y + wh * 0.5, 180, 'rgba(150,200,230,ALPHA)', 0.10);
    }
    windowAt(X(0.283), Y(0.07), X(0.075), Y(0.52), false);
    windowAt(X(0.615), Y(0.06), X(0.072), Y(0.60), true);
    drawArt(ctx, X(0.205), Y(0.13), X(0.05), Y(0.20), p);
    drawArt(ctx, X(0.445), Y(0.12), X(0.05), Y(0.19), p);
    drawArt(ctx, X(0.755), Y(0.13), X(0.045), Y(0.18), p);

    /* подписи зон на стене */
    function plaque(text, fx, fy) {
      ctx.font = '700 10px system-ui, sans-serif';
      const tw = ctx.measureText(text).width + 18;
      fillRR(ctx, X(fx) - tw / 2, Y(fy), tw, 19, 9, p.night ? 'rgba(20,24,30,.55)' : 'rgba(255,252,245,.72)', p.line);
      label(ctx, text, X(fx), Y(fy) + 13, 10, p.ink);
    }
    data.LOCATIONS.forEach(function (loc, i) {
      if (i % 2 === 0) plaque(loc.name.toUpperCase(), loc.x, 0.045 + (i % 3) * 0.018);
      if (i > 0) line(ctx, X(loc.x - 0.035), Y(0.30), X(loc.x - 0.035), Y(0.74), p.line, 1);
    });

    /* --- 1. прихожая: входная дверь, зеркало, растение --- */
    fillRR(ctx, X(0.008), Y(0.29), X(0.042), Y(0.45), 4, p.night ? '#3c3a3c' : '#d9cdbd', p.frame);
    circle(ctx, X(0.044), Y(0.52), 2.4, p.night ? '#e8b45a' : '#8c7a63');
    ctx.beginPath(); ctx.arc(X(0.062), Y(0.43), X(0.016), 0, Math.PI * 2);
    ctx.fillStyle = p.night ? '#3d4b58' : '#cfdbd8'; ctx.fill();
    ctx.strokeStyle = p.frame; ctx.lineWidth = 3; ctx.stroke();
    drawPlant(ctx, X(0.088), Y(0.735), Math.max(0.7, W / 3000), p);

    /* --- 2. коридор: консоль, коврик, вешалка --- */
    fillRR(ctx, X(0.075), Y(0.57), X(0.05), Y(0.022), 3, p.wood);
    line(ctx, X(0.082), Y(0.592), X(0.082), Y(0.73), p.frame, 2);
    line(ctx, X(0.118), Y(0.592), X(0.118), Y(0.73), p.frame, 2);
    fillRR(ctx, X(0.078), Y(0.78), X(0.045), Y(0.04), 8, p.night ? '#4b3f4a' : '#d9c9b6');
    line(ctx, X(0.13), Y(0.30), X(0.13), Y(0.46), p.frame, 2);
    circle(ctx, X(0.13), Y(0.47), 4, p.wood);

    /* --- 3. кухня: остров, подвесной свет, чайник --- */
    fillRR(ctx, X(0.145), Y(0.55), X(0.062), Y(0.17), 5, p.night ? '#4a423c' : '#efe7da', p.frame);
    fillRR(ctx, X(0.142), Y(0.542), X(0.068), Y(0.022), 4, p.wood);
    line(ctx, X(0.176), Y(0.02), X(0.176), Y(0.42), p.frame, 2);
    ctx.beginPath(); ctx.ellipse(X(0.176), Y(0.435), X(0.012), Y(0.018), 0, 0, Math.PI * 2);
    ctx.fillStyle = p.night ? '#e8c78a' : '#e6cf9f'; ctx.fill();
    if (p.night) glow(ctx, X(0.176), Y(0.46), 130, 'rgba(255,210,140,ALPHA)', 0.18);
    fillRR(ctx, X(0.196), Y(0.513), X(0.010), Y(0.032), 3, p.ceramic, p.frame);

    /* --- 4. столовая: стол, два стула, ваза --- */
    fillRR(ctx, X(0.215), Y(0.60), X(0.052), Y(0.022), 3, p.wood);
    line(ctx, X(0.222), Y(0.622), X(0.222), Y(0.73), p.frame, 3);
    line(ctx, X(0.260), Y(0.622), X(0.260), Y(0.73), p.frame, 3);
    fillRR(ctx, X(0.208), Y(0.565), X(0.012), Y(0.055), 4, p.fabric2);
    fillRR(ctx, X(0.262), Y(0.565), X(0.012), Y(0.055), 4, p.fabric2);
    fillRR(ctx, X(0.238), Y(0.575), X(0.008), Y(0.025), 3, p.ceramic, p.frame);

    /* --- 5. гостиная: диван, ковёр, столик --- */
    fillRR(ctx, X(0.288), Y(0.795), X(0.085), Y(0.062), 14, p.night ? '#4b3f4a' : '#d9c9b6');
    fillRR(ctx, X(0.295), Y(0.605), X(0.070), Y(0.135), 8, p.fabric, p.frame);
    fillRR(ctx, X(0.300), Y(0.595), X(0.028), Y(0.055), 7, p.fabric2);
    fillRR(ctx, X(0.334), Y(0.595), X(0.028), Y(0.055), 7, p.fabric2);
    fillRR(ctx, X(0.312), Y(0.725), X(0.034), Y(0.022), 4, p.wood);
    line(ctx, X(0.318), Y(0.747), X(0.318), Y(0.775), p.frame, 2);
    line(ctx, X(0.340), Y(0.747), X(0.340), Y(0.775), p.frame, 2);

    /* --- 6. уголок чтения: кресло, стеллаж, торшер --- */
    fillRR(ctx, X(0.375), Y(0.615), X(0.042), Y(0.12), 10, p.night ? '#565061' : '#e0d5c6', p.frame);
    fillRR(ctx, X(0.378), Y(0.60), X(0.036), Y(0.05), 8, p.fabric2);
    fillRR(ctx, X(0.420), Y(0.34), X(0.038), Y(0.012), 2, p.wood);
    for (let i = 0; i < 5; i++) fillRR(ctx, X(0.423 + i * 0.006), Y(0.305 + (i % 2) * 0.008), X(0.004), Y(0.033), 1, i % 2 ? '#a9836f' : '#7e9098');
    line(ctx, X(0.462), Y(0.44), X(0.462), Y(0.745), p.frame, 2);
    ctx.beginPath(); ctx.moveTo(X(0.452), Y(0.44)); ctx.lineTo(X(0.472), Y(0.44));
    ctx.lineTo(X(0.468), Y(0.472)); ctx.lineTo(X(0.456), Y(0.472)); ctx.closePath();
    ctx.fillStyle = p.night ? '#e8c78a' : '#e6cf9f'; ctx.fill();
    if (p.night) glow(ctx, X(0.462), Y(0.48), 130, 'rgba(255,208,138,ALPHA)', 0.16);

    /* --- 7. рабочий стол --- */
    fillRR(ctx, X(0.455), Y(0.585), X(0.05), Y(0.022), 3, p.wood);
    line(ctx, X(0.460), Y(0.607), X(0.460), Y(0.75), p.frame, 3);
    line(ctx, X(0.500), Y(0.607), X(0.500), Y(0.75), p.frame, 3);
    fillRR(ctx, X(0.468), Y(0.515), X(0.030), Y(0.06), 3, p.frame);
    fillRR(ctx, X(0.470), Y(0.519), X(0.026), Y(0.05), 2, p.night ? '#4a7fa0' : '#9cc8d4');
    line(ctx, X(0.462), Y(0.578), X(0.498), Y(0.578), p.frame, 2);

    /* --- 8. ГАРДЕРОБНАЯ: открытый шкаф с плечиками и зеркало (сцена поиска) --- */
    fillRR(ctx, X(0.532), Y(0.30), X(0.058), Y(0.45), 4, p.night ? '#4a3f3a' : '#e5d8c8', p.frame);
    fillRR(ctx, X(0.536), Y(0.315), X(0.024), Y(0.42), 2, p.night ? '#383038' : '#f3ece0');
    fillRR(ctx, X(0.562), Y(0.315), X(0.024), Y(0.42), 2, p.night ? '#383038' : '#f3ece0');
    line(ctx, X(0.560), Y(0.31), X(0.560), Y(0.74), p.frame, 2);
    line(ctx, X(0.537), Y(0.345), X(0.585), Y(0.345), p.wood, 3);
    for (let i = 0; i < 7; i++) {
      const hx = X(0.539 + i * 0.0065), hy = Y(0.35 + (i % 2) * 0.006);
      line(ctx, hx, Y(0.345), hx, hy, '#8a7a68', 1);
      ctx.beginPath(); ctx.moveTo(hx - 5, hy); ctx.lineTo(hx, hy - 5); ctx.lineTo(hx + 5, hy);
      ctx.strokeStyle = '#8a7a68'; ctx.lineWidth = 1.4; ctx.stroke();
      fillRR(ctx, hx - 4, hy, 8, 16 + (i % 3) * 4, 2,
        ['#d9575f', '#5b86cf', '#65a978', '#9b7fd0', '#e8b45a', '#e79bb4', '#ece7dc'][i]);
    }
    fillRR(ctx, X(0.596), Y(0.38), X(0.018), Y(0.30), 8, p.night ? '#3b4a58' : '#cbdad9', p.frame);

    /* --- 9. балкон: перила, растения, кресло --- */
    fillRR(ctx, X(0.605), Y(0.70), X(0.075), Y(0.06), 6, p.night ? '#3c4048' : '#cbbba2');
    for (let i = 0; i < 6; i++) line(ctx, X(0.607 + i * 0.012), Y(0.66), X(0.607 + i * 0.012), Y(0.71), p.frame, 2);
    line(ctx, X(0.603), Y(0.66), X(0.682), Y(0.66), p.frame, 3);
    drawPlant(ctx, X(0.615), Y(0.70), Math.max(0.6, W / 3200), p);
    drawPlant(ctx, X(0.672), Y(0.70), Math.max(0.6, W / 3200), p);
    fillRR(ctx, X(0.640), Y(0.675), X(0.022), Y(0.035), 5, p.fabric);

    /* --- 10. спальня --- */
    fillRR(ctx, X(0.700), Y(0.625), X(0.062), Y(0.125), 6, p.night ? '#4a4149' : '#cfc0ae', p.frame);
    fillRR(ctx, X(0.704), Y(0.632), X(0.054), Y(0.075), 5, p.night ? '#5d5663' : '#f2ece2');
    fillRR(ctx, X(0.706), Y(0.638), X(0.018), Y(0.045), 5, p.ceramic);
    fillRR(ctx, X(0.730), Y(0.638), X(0.018), Y(0.045), 5, p.ceramic);
    fillRR(ctx, X(0.704), Y(0.688), X(0.054), Y(0.055), 4, p.night ? '#6a5f77' : '#d9c8c4');
    fillRR(ctx, X(0.766), Y(0.655), X(0.014), Y(0.075), 3, p.wood);
    circle(ctx, X(0.773), Y(0.643), 7, p.night ? '#f0cf92' : '#e8d3a8');
    if (p.night) glow(ctx, X(0.773), Y(0.645), 110, 'rgba(255,210,145,ALPHA)', 0.16);

    /* --- 11. спортивный угол --- */
    fillRR(ctx, X(0.785), Y(0.755), X(0.05), Y(0.05), 10, p.night ? '#47565a' : '#b7cfc2');
    fillRR(ctx, X(0.792), Y(0.70), X(0.010), Y(0.02), 4, p.frame);
    fillRR(ctx, X(0.818), Y(0.70), X(0.010), Y(0.02), 4, p.frame);
    drawPlant(ctx, X(0.838), Y(0.735), Math.max(0.6, W / 3200), p);

    /* --- 12. ванная --- */
    ctx.beginPath(); ctx.ellipse(X(0.868), Y(0.715), X(0.026), Y(0.052), 0, 0, Math.PI * 2);
    ctx.fillStyle = p.ceramic; ctx.fill(); ctx.strokeStyle = p.frame; ctx.lineWidth = 2; ctx.stroke();
    ctx.beginPath(); ctx.ellipse(X(0.868), Y(0.712), X(0.021), Y(0.039), 0, 0, Math.PI * 2);
    ctx.fillStyle = p.night ? '#3d6072' : '#a9cfd8'; ctx.fill();
    fillRR(ctx, X(0.898), Y(0.545), X(0.014), Y(0.018), 6, p.ceramic, p.frame);
    circle(ctx, X(0.905), Y(0.44), X(0.010), p.night ? '#3b4a58' : '#cbdad9');

    /* --- 13. санузел --- */
    fillRR(ctx, X(0.938), Y(0.635), X(0.014), Y(0.026), 4, p.ceramic, p.frame);
    ctx.beginPath(); ctx.ellipse(X(0.945), Y(0.648), X(0.007), Y(0.016), 0, 0, Math.PI * 2);
    ctx.fillStyle = p.night ? '#8f959c' : '#e9e6e0'; ctx.fill();
    ctx.strokeStyle = p.frame; ctx.lineWidth = 1.4; ctx.stroke();
    circle(ctx, X(0.918), Y(0.30), X(0.006), p.night ? '#3c414a' : '#f4f0e8');
    label(ctx, 'WC', X(0.918), Y(0.303), 8, p.ink);

    /* ночной общий свет */
    if (p.night) { ctx.fillStyle = 'rgba(12,18,36,.10)'; ctx.fillRect(0, 0, W, H); }
  }

  function drawZonePill(ctx, w, h, state) {
    const loc = data.findLocation(state.location) || { name: 'квартира', x: 0.5 };
    const text = loc.name.toUpperCase();
    ctx.font = '700 10px system-ui, sans-serif';
    const tw = ctx.measureText(text).width + 24;
    const x = Math.max(tw / 2 + 8, Math.min(w - tw / 2 - 8, loc.x * w));
    const y = h * 0.852;
    fillRR(ctx, x - tw / 2, y, tw, 20, 10, 'rgba(20,24,28,.62)', 'rgba(255,255,255,.14)');
    label(ctx, text, x, y + 13.5, 10, '#ffe2e9');
  }

  /* ============================ МЯГКИЕ ГРАДИЕНТЫ ============================ */
  function grad(ctx, x0, y0, x1, y1, stops) {
    if (typeof ctx.createLinearGradient !== 'function') return stops[stops.length - 1][1];
    const g = ctx.createLinearGradient(x0, y0, x1, y1);
    for (let i = 0; i < stops.length; i++) g.addColorStop(stops[i][0], stops[i][1]);
    return g;
  }
  function radial(ctx, x, y, r0, r1, stops) {
    if (typeof ctx.createRadialGradient !== 'function') return stops[0][1];
    const g = ctx.createRadialGradient(x, y, r0, x, y, r1);
    for (let i = 0; i < stops.length; i++) g.addColorStop(stops[i][0], stops[i][1]);
    return g;
  }
  /* Заливка текущего пути: мягкий градиент кожи + очень лёгкая процедурная текстура */
  function skinFill(ctx, pattern, alpha, x0, y0, x1, y1) {
    ctx.fillStyle = grad(ctx,
      x0 === undefined ? -24 : x0, y0 === undefined ? -28 : y0,
      x1 === undefined ? 24 : x1, y1 === undefined ? 28 : y1,
      [[0, '#fff2e0'], [0.32, '#f9dac1'], [0.70, '#f1c5a7'], [1, '#dfa98c']]);
    ctx.fill();
    if (pattern) {
      ctx.save(); ctx.globalAlpha = alpha === undefined ? 0.055 : alpha;
      ctx.fillStyle = pattern; ctx.fill(); ctx.restore();
    }
  }
  function tintFill(ctx, base, pattern, alpha) {
    ctx.fillStyle = grad(ctx, -30, -40, 30, 40,
      [[0, shade(base, 20)], [0.45, base], [1, shade(base, -20)]]);
    ctx.fill();
    if (pattern) {
      ctx.save(); ctx.globalAlpha = alpha === undefined ? 0.13 : alpha;
      ctx.fillStyle = pattern; ctx.fill(); ctx.restore();
    }
  }

  /* =============================== КОНЕЧНОСТИ ============================== */
  function limb(ctx, x, y, len, angle, width, color) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(angle * RAD);
    fillRR(ctx, -width / 2, 0, width, len, width / 2, color, shade(color, -22));
    ctx.restore();
  }
  /* Текущий «образ» из 400 ассетов; выставляется в drawGirl */
  let currentLook = {};
  let currentPatterns = {};
  let currentModels = {};
  function m(id, fallback) { return (currentModels[id] || fallback || {}); }
  function pat(id) { return currentPatterns[id] || null; }

  function drawArm(ctx, sx, sy, pose, side, sleeve) {
    const isL = side === 'L', dir = isL ? 1 : -1;
    const sh = pose['shoulder' + side], el = pose['elbow' + side], wr = pose['wrist' + side];
    const twist = pose['wristTwist' + side] || 0;
    const shrug = pose.shoulderShrug || 0;
    const cross = pose.armCross || 0;
    const upper = 38, lower = 34;
    ctx.save();
    ctx.translate(sx, sy - shrug * 0.55);
    ctx.rotate((sh + (cross > 0.5 ? (isL ? 68 : -68) : 0)) * dir * RAD);
    /* рукав: мягкий трапециевидный, а не прямоугольник */
    ctx.beginPath();
    ctx.moveTo(-7.5, -5);
    ctx.quadraticCurveTo(-8.5, upper * 0.45, -6.2, upper);
    ctx.lineTo(6.2, upper);
    ctx.quadraticCurveTo(8.5, upper * 0.45, 7.5, -5);
    ctx.closePath();
    tintFill(ctx, sleeve, pat('fabric'), 0.11);
    ctx.strokeStyle = shade(sleeve, -24); ctx.lineWidth = 0.9; ctx.stroke();
    /* свет по краю рукава */
    ctx.globalAlpha = 0.32;
    line(ctx, -5.6, 2, -5, upper - 5, shade(sleeve, 34), 1.6);
    ctx.globalAlpha = 1;
    ctx.translate(0, upper - 2); ctx.rotate(el * dir * RAD);
    /* предплечье сужается к запястью */
    ctx.beginPath();
    ctx.moveTo(-6.2, -1);
    ctx.quadraticCurveTo(-6, lower * 0.5, -4.6, lower);
    ctx.lineTo(4.6, lower);
    ctx.quadraticCurveTo(6, lower * 0.5, 6.2, -1);
    ctx.closePath();
    skinFill(ctx, pat('skin'), 0.05, -7, 0, 7, lower);
    ctx.strokeStyle = 'rgba(198,132,108,.45)'; ctx.lineWidth = 0.8; ctx.stroke();
    ctx.globalAlpha = 0.28;
    line(ctx, -4, 2, -3.2, lower - 4, '#fff0d9', 1.5);
    ctx.globalAlpha = 1;
    ctx.translate(0, lower - 2); ctx.rotate((wr * dir + twist * 0.6) * RAD);
    drawHand(ctx, pose, side);
    ctx.restore();
  }
  function drawHand(ctx, pose, side) {
    const fist = pose['fist' + side], point = pose['point' + side], palm = pose['palm' + side];
    const spread = pose['fingerSpread' + side] === undefined ? 0.3 : pose['fingerSpread' + side];
    const nails = pose.nailShine === undefined ? 0.4 : pose.nailShine;
    const hm = m('hand', { length: 1, width: 1 });
    const w = 6.6 * (hm.width || 1);
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(-w, -1);
    ctx.quadraticCurveTo(-w - 0.6, 8, -w * 0.55, 12);
    ctx.quadraticCurveTo(0, 15, w * 0.55, 12);
    ctx.quadraticCurveTo(w + 0.6, 8, w, -1);
    ctx.closePath();
    skinFill(ctx, pat('skin'), 0.05, -7, 0, 7, 14);
    ctx.strokeStyle = 'rgba(198,132,108,.45)'; ctx.lineWidth = 0.8; ctx.stroke();
    /* пять аккуратных пальцев с закруглёнными кончиками */
    for (let i = 0; i < 5; i++) {
      const thumb = i === 0;
      const fx = thumb ? -w - 1.5 : -3.6 + (i - 1) * 2.7;
      const fl = (7.5 + spread * 5 - fist * 3.2) * (hm.length || 1) * (thumb ? 0.62 : 1);
      const fx2 = fx + (thumb ? -3.2 : spread * (i - 2.5) * 1.0);
      ctx.save();
      ctx.translate(fx, 10);
      ctx.rotate((thumb ? -0.5 : (i - 2.5) * 0.07) + (fist > 0.6 ? 0.3 : 0));
      ctx.beginPath();
      ctx.moveTo(-1.4, 0);
      ctx.quadraticCurveTo(-1.6, fl * 0.6, -1.1, fl);
      ctx.quadraticCurveTo(0, fl + 1.8, 1.1, fl);
      ctx.quadraticCurveTo(1.6, fl * 0.6, 1.4, 0);
      ctx.closePath();
      ctx.fillStyle = grad(ctx, -1.5, 0, 1.5, fl, [[0, '#f6cfb1'], [1, '#f9dcc4']]);
      ctx.fill();
      ctx.restore();
      if (nails > 0.15) {
        ctx.globalAlpha = 0.3 + nails * 0.45;
        circle(ctx, fx2, 10 + fl - 0.6, 1.05, '#fff0e8');
        ctx.globalAlpha = 1;
      }
    }
    if (point > 0.4) {
      ctx.beginPath(); ctx.moveTo(-1.8, 9); ctx.quadraticCurveTo(0, 22, 1.8, 9);
      ctx.closePath(); ctx.fillStyle = '#f7d3b8'; ctx.fill();
    }
    if (fist > 0.7) for (let i = 0; i < 3; i++) line(ctx, -3 + i * 3, 5, -3 + i * 3, 10, 'rgba(180,120,95,.35)', 0.9);
    ctx.restore();
  }
  function drawLeg(ctx, hx, hy, pose, side, pants, shoes) {
    const isL = side === 'L', dir = isL ? 1 : -1;
    const hip = pose['hip' + side], knee = pose['knee' + side], ankle = pose['ankle' + side];
    const roll = pose['ankleRoll' + side] || 0;
    const fp = pose['footPoint' + side] || 0, toe = pose.toeCurl || 0;
    const lm = m('leg', { width: 1, length: 1 });
    const upper = 54, lower = 52;
    const w = 8.6 * (lm.width || 1);
    ctx.save(); ctx.translate(hx, hy); ctx.rotate(hip * dir * RAD);
    ctx.beginPath();
    ctx.moveTo(-w, -4);
    ctx.quadraticCurveTo(-w - 0.7, upper * 0.5, -w * 0.78, upper);
    ctx.lineTo(w * 0.78, upper);
    ctx.quadraticCurveTo(w + 0.7, upper * 0.5, w, -4);
    ctx.closePath();
    tintFill(ctx, pants, pat('denim'), 0.12);
    ctx.strokeStyle = shade(pants, -20); ctx.lineWidth = 0.9; ctx.stroke();
    ctx.globalAlpha = 0.25;
    line(ctx, -w * 0.6, 2, -w * 0.5, upper - 6, shade(pants, 32), 1.6);
    ctx.globalAlpha = 1;
    ctx.translate(0, upper - 3); ctx.rotate(knee * dir * RAD);
    ctx.beginPath();
    ctx.moveTo(-w * 0.78, 0);
    ctx.quadraticCurveTo(-w * 0.8, lower * 0.55, -w * 0.62, lower);
    ctx.lineTo(w * 0.62, lower);
    ctx.quadraticCurveTo(w * 0.8, lower * 0.55, w * 0.78, 0);
    ctx.closePath();
    tintFill(ctx, pants, pat('denim'), 0.12);
    ctx.strokeStyle = shade(pants, -20); ctx.lineWidth = 0.9; ctx.stroke();
    ctx.translate(0, lower); ctx.rotate((ankle * dir + roll * 0.5) * RAD);
    ctx.save(); ctx.rotate(fp * 16 * RAD);
    ctx.beginPath();
    ctx.moveTo(-8.5, -3);
    ctx.quadraticCurveTo(-9, 7, -7, 10);
    ctx.quadraticCurveTo(1, 13, 12 + fp * 4, 9);
    ctx.quadraticCurveTo(13, 2, 8, -3);
    ctx.closePath();
    tintFill(ctx, shoes, pat('shoe'), 0.14);
    ctx.strokeStyle = shade(shoes, -22); ctx.lineWidth = 0.9; ctx.stroke();
    fillRR(ctx, -8, 9 - toe * 2, 20 + fp * 4, 3.4, 2, '#2d2a2e');
    line(ctx, 1, 1, 9 + fp * 3, 1 + toe * 2, shade(shoes, 26), 1.1);
    ctx.restore();
    ctx.restore();
  }

  /* ================================= ВОЛОСЫ ================================= */
  function hairGradient(ctx, top, bottom) {
    return grad(ctx, -32, -44, 30, 110,
      [[0, '#6d4642'], [0.22, '#503339'], [0.58, top || '#392630'], [1, bottom || '#2b1f28']]);
  }
  function drawHairBack(ctx, hipY, pose) {
    const gloss = pose.hairGloss === undefined ? 0.5 : pose.hairGloss;
    const hm = m('hairstyle', { length: 1, width: 1, curve: 0 });
    const len = 0.86 + (hm.length || 1) * 0.34;
    const wid = 0.92 + (hm.width || 1) * 0.13;
    const end = 124 * len;
    ctx.save(); ctx.translate(0, hipY - 112);
    ctx.translate(pose.hairSway * 0.42, pose.hairBounce * 0.55);
    /* волнистая масса волос до пояса */
    ctx.beginPath();
    ctx.moveTo(-27 * wid, -10);
    ctx.bezierCurveTo(-40 * wid, 18, -34 * wid, end * 0.55, -40 * wid, end * 0.80);
    ctx.bezierCurveTo(-41 * wid, end * 0.96, -30 * wid, end + 8, -22 * wid, end + 2);
    ctx.bezierCurveTo(-12 * wid, end + 14, 12 * wid, end + 14, 22 * wid, end + 2);
    ctx.bezierCurveTo(30 * wid, end + 8, 41 * wid, end * 0.96, 40 * wid, end * 0.80);
    ctx.bezierCurveTo(34 * wid, end * 0.55, 40 * wid, 18, 27 * wid, -10);
    ctx.closePath();
    ctx.fillStyle = hairGradient(ctx); ctx.fill();
    if (pat('hair')) {
      ctx.save(); ctx.globalAlpha = 0.09; ctx.fillStyle = pat('hair'); ctx.fill(); ctx.restore();
    }
    /* внутренняя тень у шеи */
    ctx.beginPath();
    ctx.moveTo(-20 * wid, -6);
    ctx.bezierCurveTo(-27 * wid, 32, -24 * wid, end * 0.72, -17 * wid, end - 8);
    ctx.quadraticCurveTo(0, end + 6, 17 * wid, end - 8);
    ctx.bezierCurveTo(24 * wid, end * 0.72, 27 * wid, 32, 20 * wid, -6);
    ctx.closePath();
    ctx.fillStyle = 'rgba(24,16,22,.42)'; ctx.fill();
    /* мягкие пряди и блики */
    ctx.globalAlpha = 0.16 + gloss * 0.30;
    for (let i = -3; i <= 3; i++) {
      ctx.beginPath();
      ctx.moveTo(i * 9 * wid, 4);
      ctx.bezierCurveTo(i * 12 * wid + 3, 44, i * 11 * wid - 2, end * 0.72, i * 8 * wid, end - 12);
      ctx.strokeStyle = i % 2 ? '#a9715f' : '#c08a6d';
      ctx.lineWidth = i === 0 ? 2.6 : 1.5;
      ctx.lineCap = 'round'; ctx.stroke();
    }
    ctx.globalAlpha = 1;
    ctx.restore();
  }
  function drawHairFront(ctx, pose) {
    const gloss = pose.hairGloss === undefined ? 0.5 : pose.hairGloss;
    const sway = pose.hairSway || 0;
    const hm = m('hairstyle', { length: 1, width: 1, curve: 0 });
    const wid = 0.94 + (hm.width || 1) * 0.10;
    const lock = 76 * (0.86 + (hm.length || 1) * 0.28);

    /* объёмная шапка волос с боковым пробором */
    ctx.beginPath();
    ctx.moveTo(-28 * wid, -2);
    ctx.bezierCurveTo(-35 * wid, -25, -26 * wid, -45, -4 * wid, -44);
    ctx.bezierCurveTo(18 * wid, -44, 33 * wid, -31, 29 * wid, -6);
    ctx.bezierCurveTo(26 * wid, -15, 21 * wid, -21, 15 * wid, -23);
    ctx.bezierCurveTo(4 * wid, -18, -10 * wid, -13, -28 * wid, -2);
    ctx.closePath();
    ctx.fillStyle = grad(ctx, -30, -46, 28, 2,
      [[0, '#794e45'], [0.30, '#55373a'], [0.70, '#3c2830'], [1, '#2e212a']]);
    ctx.fill();
    if (pat('hair')) {
      ctx.save(); ctx.globalAlpha = 0.08; ctx.fillStyle = pat('hair'); ctx.fill(); ctx.restore();
    }
    /* косая чёлка — мягкая прядь через лоб */
    ctx.save(); ctx.translate(sway * 0.22, 0);
    ctx.beginPath();
    ctx.moveTo(-9 * wid, -42);
    ctx.bezierCurveTo(8 * wid, -41, 25 * wid, -30, 26 * wid, -11);
    ctx.bezierCurveTo(22 * wid, -19, 15 * wid, -21, 6 * wid, -18);
    ctx.bezierCurveTo(-6 * wid, -14, -18 * wid, -9, -27 * wid, -2);
    ctx.bezierCurveTo(-24 * wid, -20, -19 * wid, -34, -9 * wid, -42);
    ctx.closePath();
    ctx.fillStyle = grad(ctx, -24, -42, 26, -6,
      [[0, '#5e3d3c'], [0.5, '#432c33'], [1, '#33232c']]);
    ctx.fill();
    /* блики по прядям — тонкие и приглушённые */
    ctx.globalAlpha = 0.13 + gloss * 0.24;
    ctx.beginPath();
    ctx.moveTo(-12 * wid, -38);
    ctx.bezierCurveTo(4 * wid, -37, 17 * wid, -30, 21 * wid, -19);
    ctx.strokeStyle = '#a9715f'; ctx.lineWidth = 1.7; ctx.lineCap = 'round'; ctx.stroke();
    ctx.globalAlpha = 1;
    ctx.restore();

    /* пряди у лица лежат СНАРУЖИ от щёк, не срезают лицо */
    function faceLock(sign) {
      const x0 = 27 * wid;
      const sw = sway * 0.03;
      ctx.beginPath();
      ctx.moveTo(sign * (x0 - 2), -6);
      ctx.bezierCurveTo(sign * (x0 + 7 + sw), 18, sign * (x0 + 5), lock * 0.55, sign * (x0 + 7), lock - 10);
      ctx.quadraticCurveTo(sign * (x0 + 5), lock + 4, sign * (x0 - 1), lock + 1);
      ctx.bezierCurveTo(sign * (x0 - 5), lock * 0.62, sign * (x0 - 8), 22, sign * (x0 - 2), -6);
      ctx.closePath();
      ctx.fillStyle = grad(ctx, sign * (x0 - 6), 0, sign * (x0 + 8), lock,
        [[0, '#4b3136'], [0.5, '#382530'], [1, '#2b1f28']]);
      ctx.fill();
      ctx.globalAlpha = 0.14 + gloss * 0.20;
      ctx.beginPath();
      ctx.moveTo(sign * (x0 + 2), 8);
      ctx.bezierCurveTo(sign * (x0 + 4), 30, sign * (x0 + 3), lock * 0.6, sign * (x0 + 3), lock - 12);
      ctx.strokeStyle = '#a97460'; ctx.lineWidth = 1.5; ctx.lineCap = 'round'; ctx.stroke();
      ctx.globalAlpha = 1;
    }
    faceLock(-1); faceLock(1);

    /* мягкое световое пятно на макушке */
    ctx.save();
    ctx.globalAlpha = 0.10 + gloss * 0.14;
    ctx.beginPath(); ctx.ellipse(-9 * wid, -33, 17, 5, -0.42, 0, Math.PI * 2);
    ctx.fillStyle = radial(ctx, -12 * wid, -34, 1, 20,
      [[0, 'rgba(214,160,124,.55)'], [1, 'rgba(214,160,124,0)']]);
    ctx.fill(); ctx.restore();
  }

  /* ================================== ЛИЦО ================================== */
  function drawFace(ctx, pose, outfit, opts) {
    opts = opts || {};
    outfit = outfit || {};
    const blink = Math.max(0, Math.min(1, pose.blink || 0));
    const closed = !!opts.closedEyes || blink > 0.93;
    const eyeWide = pose.eyeWide || 0;
    const lx = ((pose.lookX || 0) + (pose.gazeX || 0) * 0.6) * 2.6;
    const ly = ((pose.lookY || 0) + (pose.gazeY || 0) * 0.6) * 1.8;
    const lash = pose.lash === undefined ? 0.6 : pose.lash;
    const arch = pose.browArch === undefined ? 0.25 : pose.browArch;
    const brow = pose.brow || 0;
    const glowA = 0.10 + (pose.skinGlow === undefined ? 0.3 : pose.skinGlow) * 0.22;
    const freckle = pose.freckle === undefined ? 0.35 : pose.freckle;
    const earTilt = pose.earTilt || 0, earRing = pose.earRing === undefined ? 0.6 : pose.earRing;
    const smile = pose.smile || 0, mouth = Math.round(pose.mouth || 0), pout = pose.lipPout === undefined ? 0.3 : pose.lipPout;
    const fm = m('face', { width: 1, height: 1, cheek: 0.5, jaw: 0.5 });
    const em = m('ear', { size: 1 });
    const bm = m('brow', { arch: 1 });
    const nm = m('nose', { tip: 1 });
    const fw = 24 * (0.94 + (fm.width || 1) * 0.06);
    const fh = 28.5 * (0.94 + (fm.height || 1) * 0.06);
    const jaw = fm.jaw === undefined ? 0.5 : fm.jaw;
    const EYE_X = 9.2, EYE_Y = -2.4;

    function facePath() {
      ctx.beginPath();
      ctx.moveTo(0, -fh);
      ctx.bezierCurveTo(fw * 0.70, -fh * 1.03, fw * 1.02, -fh * 0.58, fw * 0.98, -1);
      ctx.bezierCurveTo(fw * 0.95, fh * 0.50, fw * (0.42 + jaw * 0.08), fh * 0.88, fw * 0.16, fh);
      ctx.quadraticCurveTo(0, fh * 1.07, -fw * 0.16, fh);
      ctx.bezierCurveTo(-fw * (0.42 + jaw * 0.08), fh * 0.88, -fw * 0.95, fh * 0.50, -fw * 0.98, -1);
      ctx.bezierCurveTo(-fw * 1.02, -fh * 0.58, -fw * 0.70, -fh * 1.03, 0, -fh);
      ctx.closePath();
    }

    /* уши с маленькими серёжками */
    [-1, 1].forEach(function (s) {
      const ex = s * fw * 0.97;
      const eSize = em.size || 1;
      ctx.save(); ctx.translate(ex, 1.5); ctx.rotate(earTilt * 0.1 * s);
      ctx.beginPath(); ctx.ellipse(0, 0, 4.5 * eSize, 6.3 * eSize, 0, 0, Math.PI * 2);
      ctx.fillStyle = grad(ctx, -4, -6, 4, 6, [[0, '#f9dcc2'], [1, '#dcA48a']]);
      ctx.fill();
      ctx.strokeStyle = 'rgba(184,124,101,.5)'; ctx.lineWidth = 0.9; ctx.stroke();
      ctx.beginPath(); ctx.ellipse(0, 0.6, 2.1, 3.5, 0, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(190,120,100,.24)'; ctx.fill();
      if (earRing > 0.1) {
        ctx.globalAlpha = Math.min(1, earRing + 0.15);
        ctx.beginPath(); ctx.arc(0, 8.5, 2.9, 0, Math.PI * 2);
        ctx.strokeStyle = '#d8ac63'; ctx.lineWidth = 1.4; ctx.stroke();
        circle(ctx, 0, 11, 1.3, '#ffe6a8');
        ctx.globalAlpha = 1;
      }
      ctx.restore();
    });

    /* лицо: мягкая овальная форма с узким подбородком */
    facePath();
    skinFill(ctx, pat('skin'), 0.05, -fw, -fh, fw, fh);
    ctx.strokeStyle = 'rgba(186,126,103,.5)'; ctx.lineWidth = 0.95; ctx.stroke();

    ctx.save(); facePath(); ctx.clip();
    /* тень по правой стороне и под скулами */
    ctx.fillStyle = radial(ctx, fw * 0.78, 1, 2, fw * 1.5,
      [[0, 'rgba(158,94,76,.20)'], [1, 'rgba(158,94,76,0)']]);
    ctx.fillRect(-fw, -fh, fw * 2, fh * 2);
    ctx.fillStyle = radial(ctx, -fw * 0.42, -fh * 0.55, 1, fh * 1.2,
      [[0, 'rgba(255,248,230,' + glowA.toFixed(2) + ')'], [1, 'rgba(255,248,230,0)']]);
    ctx.fillRect(-fw, -fh, fw * 2, fh * 2);
    ctx.fillStyle = radial(ctx, 0, fh * 0.86, 1, fw * 0.8,
      [[0, 'rgba(176,108,88,.16)'], [1, 'rgba(176,108,88,0)']]);
    ctx.fillRect(-fw, -fh, fw * 2, fh * 2);
    if (freckle > 0.05) {
      ctx.globalAlpha = Math.min(0.32, freckle * 0.35);
      for (let i = 0; i < 9; i++) circle(ctx, -12 + (i % 5) * 4.2, 5.5 + Math.floor(i / 5) * 3, 0.75, '#b87c66');
      ctx.globalAlpha = 1;
    }
    /* румянец — мягкий, без резких кругов */
    const blush = Math.max(pose.blush || 0, (pose.bodyBlush || 0) * 0.8, 0.10);
    if (blush > 0.03) {
      const a = Math.min(0.46, blush * 0.52 + 0.05);
      [-fw * 0.56, fw * 0.56].forEach(function (bx) {
        ctx.fillStyle = radial(ctx, bx, 7.5, 0, 11,
          [[0, 'rgba(231,120,141,' + a.toFixed(2) + ')'],
           [0.55, 'rgba(231,120,141,' + (a * 0.35).toFixed(2) + ')'],
           [1, 'rgba(231,120,141,0)']]);
        ctx.beginPath(); ctx.arc(bx, 7.5, 11, 0, Math.PI * 2); ctx.fill();
      });
    }
    ctx.restore();

    /* глаза */
    const ew = 6.4;
    const eh = Math.max(0.55, (4.6 + eyeWide * 1.8) * (1 - blink * 0.94));
    [-EYE_X, EYE_X].forEach(function (ex) {
      const s = ex < 0 ? -1 : 1;
      /* тень под бровью и тёплый хайлайтер на веке */
      ctx.fillStyle = radial(ctx, ex, EYE_Y - 3, 0, 9,
        [[0, 'rgba(150,96,88,.14)'], [1, 'rgba(150,96,88,0)']]);
      ctx.beginPath(); ctx.ellipse(ex, EYE_Y - 2.5, 9, 5.5, 0, 0, Math.PI * 2); ctx.fill();

      if (!closed) {
        function eyePath() {
          ctx.beginPath();
          ctx.moveTo(ex - ew, EYE_Y + 0.4);
          ctx.bezierCurveTo(ex - ew * 0.72, EYE_Y - eh * 1.08, ex - ew * 0.05, EYE_Y - eh * 1.16, ex + ew * 0.62, EYE_Y - eh * 0.74);
          ctx.quadraticCurveTo(ex + ew, EYE_Y - eh * 0.50, ex + ew, EYE_Y + 0.2);
          ctx.quadraticCurveTo(ex + ew * 0.55, EYE_Y + eh * 0.78, ex, EYE_Y + eh * 0.82);
          ctx.quadraticCurveTo(ex - ew * 0.65, EYE_Y + eh * 0.72, ex - ew, EYE_Y + 0.4);
          ctx.closePath();
        }
        eyePath();
        ctx.fillStyle = grad(ctx, ex - ew, EYE_Y - eh, ex + ew, EYE_Y + eh,
          [[0, '#fffaf4'], [0.62, '#fbf1e9'], [1, '#e8dbd4']]);
        ctx.fill();
        ctx.save(); eyePath(); ctx.clip();
        const ix = ex + lx * 0.55, iy = EYE_Y + ly * 0.32;
        const ir = Math.min(eh * 1.16 + 0.7, 6.1);
        ctx.fillStyle = radial(ctx, ix - ir * 0.25, iy - ir * 0.3, 0.3, ir,
          [[0, '#e6ca92'], [0.33, '#bb9d61'], [0.61, '#8b9463'], [0.85, '#4c5a3e'], [1, '#2e3929']]);
        ctx.beginPath(); ctx.arc(ix, iy, ir, 0, Math.PI * 2); ctx.fill();
        ctx.globalAlpha = 0.22;
        for (let k = 0; k < 10; k++) {
          const a = k * Math.PI / 5;
          line(ctx, ix + Math.cos(a) * ir * 0.55, iy + Math.sin(a) * ir * 0.55,
            ix + Math.cos(a) * ir * 0.95, iy + Math.sin(a) * ir * 0.95, '#f2dda6', 0.6);
        }
        ctx.globalAlpha = 1;
        circle(ctx, ix, iy, ir * 0.44, '#241f26');
        circle(ctx, ix - ir * 0.36, iy - ir * 0.42, ir * 0.30, 'rgba(255,255,255,.94)');
        circle(ctx, ix + ir * 0.40, iy + ir * 0.36, ir * 0.14, 'rgba(255,255,255,.60)');
        ctx.restore();
        /* верхнее веко */
        ctx.beginPath();
        ctx.moveTo(ex - ew, EYE_Y + 0.4);
        ctx.bezierCurveTo(ex - ew * 0.72, EYE_Y - eh * 1.08, ex - ew * 0.05, EYE_Y - eh * 1.16, ex + ew * 0.62, EYE_Y - eh * 0.74);
        ctx.quadraticCurveTo(ex + ew, EYE_Y - eh * 0.50, ex + ew, EYE_Y + 0.2);
        ctx.strokeStyle = 'rgba(58,42,48,.72)'; ctx.lineWidth = 1.2; ctx.lineCap = 'round'; ctx.stroke();
        /* нижнее веко — мягкое */
        ctx.beginPath();
        ctx.moveTo(ex - ew, EYE_Y + 0.4);
        ctx.quadraticCurveTo(ex, EYE_Y + eh * 0.82, ex + ew, EYE_Y + 0.2);
        ctx.strokeStyle = 'rgba(186,126,106,.5)'; ctx.lineWidth = 0.85; ctx.stroke();
        /* складка века */
        ctx.globalAlpha = 0.30;
        ctx.beginPath();
        ctx.moveTo(ex - ew * 0.8, EYE_Y - eh - 2.2);
        ctx.quadraticCurveTo(ex, EYE_Y - eh - 4.4, ex + ew * 0.9, EYE_Y - eh - 1.4);
        ctx.strokeStyle = '#b9817a'; ctx.lineWidth = 0.9; ctx.stroke();
        ctx.globalAlpha = 1;
        /* ресницы у внешнего угла */
        for (let i = 0; i < 2; i++) {
          const px = ex + s * (ew * 0.70 + i * 1.2);
          const py = EYE_Y - eh * (0.48 - i * 0.16);
          line(ctx, px, py, px + s * (1.3 + lash * 1.4), py - 1.3 - lash * 1.1,
            'rgba(58,42,48,.58)', 0.95 - i * 0.12);
        }
      } else {
        ctx.beginPath();
        ctx.moveTo(ex - ew, EYE_Y - 0.5);
        ctx.quadraticCurveTo(ex, EYE_Y + 2.4 + eh * 0.4, ex + ew, EYE_Y - 0.5);
        ctx.strokeStyle = 'rgba(58,42,48,.85)'; ctx.lineWidth = 1.5; ctx.lineCap = 'round'; ctx.stroke();
        for (let i = 0; i < 3; i++) {
          line(ctx, ex + s * (ew * 0.45 + i * 1.2), EYE_Y + 0.8,
            ex + s * (ew * 0.45 + i * 1.2 + 1.4), EYE_Y + 2.5 + lash, 'rgba(48,36,44,.6)', 0.9);
        }
      }
      /* бровь — мягкая изогнутая форма */
      const by = EYE_Y - 9.8 - brow * 2.3;
      const bmArch = bm.arch || 1;
      ctx.beginPath();
      ctx.moveTo(ex - 6.3, by + 1.3);
      ctx.quadraticCurveTo(ex - 1.4, by - 2.6 - arch * 2.2 * bmArch, ex + 6.2, by - 0.5 + brow * 1.1);
      ctx.quadraticCurveTo(ex + 1.4, by + 0.7 - arch * 0.9, ex - 6.3, by + 2.2);
      ctx.closePath();
      ctx.fillStyle = grad(ctx, ex - 6, by - 3, ex + 6, by + 2,
        [[0, '#5d3e3b'], [1, '#3d2a30']]);
      ctx.fill();
    });

    /* нос: мягкая тень и блик, без жёсткой линии */
    const tip = nm.tip || 1;
    ctx.beginPath();
    ctx.moveTo(1.1, 1.6); ctx.quadraticCurveTo(2.8, 4.8, 0.6, 6.2);
    ctx.strokeStyle = 'rgba(186,124,101,.38)'; ctx.lineWidth = 1.25; ctx.stroke();
    ctx.beginPath(); ctx.ellipse(-1.2, 5.6, 1.7 * tip, 1.1, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,244,226,.5)'; ctx.fill();
    ctx.globalAlpha = 0.2;
    ctx.beginPath(); ctx.ellipse(-1.6, 1.2, 1.3, 4, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#fff6e8'; ctx.fill();
    ctx.globalAlpha = 1;

    /* губы с «луком Купидона» */
    if (mouth === 2 || mouth === 4 || (mouth === 3 && smile < -0.3)) {
      ctx.beginPath(); ctx.ellipse(0, 12.4, mouth === 4 ? 4 : 5.2, mouth === 4 ? 6 : 4.2, 0, 0, Math.PI * 2);
      ctx.fillStyle = grad(ctx, 0, 7, 0, 18, [[0, '#7d3947'], [0.6, '#a34858'], [1, '#6d2e3b']]);
      ctx.fill();
      ctx.beginPath(); ctx.ellipse(0, 14.3, 2.6, 1.6, 0, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(216,112,124,.75)'; ctx.fill();
    } else {
      const lift = smile * 2.4 + 0.55;
      const widen = 1 + pout * 0.12;
      ctx.beginPath();
      ctx.moveTo(-5.6 * widen, 11.4);
      ctx.quadraticCurveTo(-3.4, 9.2, -1.4, 10.6);
      ctx.quadraticCurveTo(0, 11.5, 1.4, 10.6);
      ctx.quadraticCurveTo(3.4, 9.2, 5.6 * widen, 11.4);
      ctx.quadraticCurveTo(3.6, 14.2 + lift, 0, 14.6 + lift);
      ctx.quadraticCurveTo(-3.6, 14.2 + lift, -5.6 * widen, 11.4);
      ctx.closePath();
      ctx.fillStyle = grad(ctx, 0, 9, 0, 15,
        [[0, '#b85f6e'], [0.48, '#d47f8b'], [1, '#bd6374']]);
      ctx.fill();
      if (pat('lip')) {
        ctx.save(); ctx.globalAlpha = 0.10; ctx.fillStyle = pat('lip'); ctx.fill(); ctx.restore();
      }
      ctx.beginPath(); ctx.ellipse(-1.6, 12.5, 2.1, 0.75, -0.2, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,228,222,.32)'; ctx.fill();
      ctx.beginPath(); ctx.moveTo(-5.6 * widen, 11.4);
      ctx.quadraticCurveTo(0, 11.9 + lift, 5.6 * widen, 11.4);
      ctx.strokeStyle = 'rgba(122,52,64,.55)'; ctx.lineWidth = 0.8; ctx.stroke();
    }
    if (outfit.accessory && outfit.accessory.id === 'glasses') {
      ctx.globalAlpha = 0.8;
      ctx.strokeStyle = outfit.accessory.color; ctx.lineWidth = 1.7;
      rr(ctx, -15.5, -8.5, 12, 11, 4); ctx.stroke();
      rr(ctx, 3.5, -8.5, 12, 11, 4); ctx.stroke();
      line(ctx, -3.5, -3.5, 3.5, -3.5, outfit.accessory.color, 1.7);
      ctx.globalAlpha = 1;
    }
    if (opts.hair !== false) drawHairFront(ctx, pose);
    if (outfit.head) {
      const hc = outfit.head.color;
      if (outfit.head.id === 'cap') {
        ctx.beginPath(); ctx.ellipse(0, -23, 27, 14, 0, Math.PI, Math.PI * 2); ctx.fillStyle = hc; ctx.fill();
        fillRR(ctx, 4, -25, 24, 5, 3, hc);
      } else {
        ctx.beginPath(); ctx.arc(0, -16, 27, Math.PI * 1.05, Math.PI * 1.95);
        ctx.strokeStyle = hc; ctx.lineWidth = 5; ctx.stroke();
      }
    }
  }

  /* ================================ ДЕВУШКА ================================ */
  function drawGirl(ctx, cx, groundY, S, pose, outfit, state) {
    const o = outfit || {};
    const dress = o.dress;
    const outerVisible = !!(o.dress || o.top || o.bottom || o.outer);
    const under = o.underwear || { id: 'slip', color: '#e9e1d6' };
    let topColor = dress ? dress.color : (o.top ? o.top.color : '#c9c1d6');
    let bottomColor = dress ? dress.color : (o.bottom ? o.bottom.color : '#3f5680');
    if (!outerVisible) { topColor = under.color; bottomColor = under.color; }
    const outerColor = o.outer ? o.outer.color : null;
    const shoesColor = o.shoes ? o.shoes.color : '#ece7dc';

    /* --- подключаем 400 ассетов к телу ------------------------------------- */
    const lk = (state && state.look) || {};
    const ids = lookIds(state);
    currentLook = ids;
    const assetId = function (group, key) {
      return ids[key] || (assets.find(group, Number(lk[key]) || 4) || {}).id;
    };
    currentPatterns = {
      skin: pattern(ctx, assetId('skin', 'skin')),
      hair: pattern(ctx, assetId('hairtex', 'hairtex')),
      eye: pattern(ctx, assetId('eyetex', 'eyetex')),
      lip: pattern(ctx, assetId('liptex', 'liptex')),
      blush: pattern(ctx, assetId('blushtex', 'blushtex')),
      nail: pattern(ctx, assetId('nailtex', 'nailtex')),
      fabric: pattern(ctx, assetId('fabric', 'fabric')),
      knit: pattern(ctx, (assets.find('knit', Number(lk.knit) || 4) || {}).id),
      denim: pattern(ctx, (assets.find('denim', Number(lk.denim) || 4) || {}).id),
      shoe: pattern(ctx, (assets.find('shoetex', Number(lk.shoetex) || 4) || {}).id),
    };
    currentModels = {
      face: modelParams(assetId('face', 'face')),
      brow: modelParams(assetId('brow', 'brow')),
      nose: modelParams(assetId('nose', 'nose')),
      ear: modelParams(assetId('ear', 'ear')),
      neck: modelParams(assetId('neck', 'neck')),
      hand: modelParams(assetId('hand', 'hand')),
      foot: modelParams(assetId('foot', 'foot')),
      torso: modelParams(assetId('torso', 'torso')),
      leg: modelParams(assetId('leg', 'leg')),
      hairstyle: modelParams(assetId('hairstyle', 'hairstyle')),
    };
    if (currentModels.face) { currentModels.face.cheek = currentModels.face.round; currentModels.face.jaw = currentModels.face.curve; }
    if (currentModels.brow) { currentModels.brow.arch = 0.7 + (currentModels.brow.curve || 0); currentModels.brow.thick = 1.6 * (currentModels.brow.round || 0.5); }
    if (currentModels.nose) currentModels.nose.tip = 0.7 + (currentModels.nose.round || 0.5);
    if (currentModels.ear) currentModels.ear.size = 0.8 + (currentModels.ear.width || 1) * 0.25;
    if (currentModels.hand) currentModels.hand.length = 0.85 + (currentModels.hand.length || 1) * 0.2;

    /* характер влияет на позу и лицо */
    const pr = profile(state);
    const warmth = Number.isFinite((state.settings || {}).warmth) ? state.settings.warmth : 22;
    const viewPose = Object.assign({}, pose, {
      bodyBlush: Math.max(pose.blush || 0, pr.blush * 0.55, Math.min(0.42, Math.max(0, (warmth - 24) / 18))),
      breath: (pose.breath || 0) + (warmth > 26 ? 3 : 0),
      gazeY: (pose.gazeY || 0) + (pr.gazeDown ? 0.45 : 0),
      headTurn: (pose.headTurn || 0) + (pr.mirrorCheck && (pose.mirrorCheck || 0) > 0.5 ? 20 : 0),
      shoulderShrug: (pose.shoulderShrug || 0) + pr.blush * 4,
    });
    const P = viewPose;
    const squat = P.squat || 0;
    const hipY = -118 + squat * 34;
    const lean = (P.torsoLean || 0) * 0.45 + (P.spineBend || 0) * 0.22;
    const twist = (P.torsoTwist || 0) + (P.hipTwist || 0) * 0.12;
    const breath = 1 + (P.breath || 0) * 0.012;
    const chest = 1 + (P.chestLift || 0) * 0.004;
    const turn = P.bodyTurn || 0;
    const facing = (P.facing || 1) * (1 - Math.min(0.35, Math.abs(turn) / 220));
    const arch = (P.poseArch || 0) * 0.06;
    const tM = m('torso', { width: 1, height: 1, round: 0.5 });
    const torsoW = 18.5 * (0.9 + (tM.width || 1) * 0.12) * chest;

    /* тень */
    ctx.save(); ctx.translate(cx, groundY);
    ctx.beginPath(); ctx.ellipse(0, 4, 44 * S, 8 * S, 0, 0, Math.PI * 2);
    ctx.fillStyle = radial(ctx, 0, 4, 0, 46 * S,
      [[0, 'rgba(40,30,25,.24)'], [1, 'rgba(40,30,25,0)']]);
    ctx.fill(); ctx.restore();

    ctx.save();
    ctx.translate(cx + (P.bodyX || 0) * S, groundY + (P.bodyY || 0) * S);
    ctx.rotate(arch * RAD);
    ctx.scale(facing * S, S * breath);
    drawHairBack(ctx, hipY, P);
    drawLeg(ctx, -10.5, hipY, P, 'L', bottomColor, shoesColor);
    drawLeg(ctx, 10.5, hipY, P, 'R', bottomColor, shoesColor);

    /* подол / юбка: мягкая ткань со складками */
    ctx.save(); ctx.translate(0, hipY - 12);
    ctx.rotate(((P.skirtSway || 0) + (P.hemSpin || 0) * 0.35 + (P.hipTwist || 0) * 0.08) * RAD);
    const hem = 66 + (P.skirtLift || 0) - (P.hemWave || 0) * 5 + (P.fabricDrape || 0) * 0.18;
    function skirtPath() {
      ctx.beginPath();
      ctx.moveTo(-19, -8);
      ctx.quadraticCurveTo(-24, hem * 0.45, -33 - (P.hemWave || 0) * 4, hem);
      ctx.quadraticCurveTo(-16, hem + 8 + (P.hemWave || 0) * 4, 0, hem + 2);
      ctx.quadraticCurveTo(16, hem + 8 + (P.hemWave || 0) * 4, 33 + (P.hemWave || 0) * 4, hem);
      ctx.quadraticCurveTo(24, hem * 0.45, 19, -8);
      ctx.closePath();
    }
    skirtPath();
    ctx.fillStyle = grad(ctx, -32, -8, 30, hem,
      [[0, shade(bottomColor, 22)], [0.42, bottomColor], [1, shade(bottomColor, -20)]]);
    ctx.fill();
    if (pat('fabric')) {
      ctx.save(); ctx.globalAlpha = 0.14; ctx.fillStyle = pat('fabric'); ctx.fill(); ctx.restore();
    }
    ctx.strokeStyle = shade(bottomColor, -22); ctx.lineWidth = 1.1; ctx.stroke();
    ctx.save(); skirtPath(); ctx.clip();
    for (let i = -2; i <= 2; i++) {
      ctx.globalAlpha = 0.20;
      ctx.beginPath();
      ctx.moveTo(i * 7, 2);
      ctx.quadraticCurveTo(i * 9 + 2, hem * 0.5, i * 10, hem);
      ctx.strokeStyle = shade(bottomColor, -24); ctx.lineWidth = 1.2; ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(i * 8 + 3, 2);
      ctx.quadraticCurveTo(i * 10 + 4, hem * 0.5, i * 11 + 3, hem);
      ctx.strokeStyle = shade(bottomColor, 24); ctx.lineWidth = 0.9; ctx.stroke();
    }
    ctx.globalAlpha = 1;
    ctx.restore();
    ctx.globalAlpha = 0.4;
    line(ctx, -30, hem - 2, 0, hem + 1, shade(bottomColor, 34), 1.8);
    ctx.globalAlpha = 1;
    ctx.restore();

    /* корпус */
    ctx.save();
    ctx.translate(0, hipY + (P.torsoY || 0));
    ctx.rotate(lean * RAD);
    ctx.transform(1 - Math.abs(twist) / 90, 0, 0, 1, twist * 0.28, 0);
    const bust = (P.bustLift || 0) * 0.06;
    const waist = (P.waistTwist || 0) * 0.02;
    function torsoPath() {
      ctx.beginPath();
      ctx.moveTo(-torsoW * 0.82, -6);
      ctx.bezierCurveTo(-torsoW * 0.70, -26 + waist, -torsoW * 0.58, -44, -torsoW - 3, -72);
      ctx.quadraticCurveTo(0, -85 - (P.chestLift || 0) * 0.06 - bust, torsoW + 3, -72);
      ctx.bezierCurveTo(torsoW * 0.58, -44, torsoW * 0.70, -26 - waist, torsoW * 0.82, -6);
      ctx.quadraticCurveTo(0, -1, -torsoW * 0.82, -6);
      ctx.closePath();
    }
    torsoPath();
    ctx.fillStyle = grad(ctx, -torsoW, -78, torsoW, 0,
      [[0, shade(topColor, 24)], [0.45, topColor], [1, shade(topColor, -18)]]);
    ctx.fill();
    if (pat('knit')) {
      ctx.save(); ctx.globalAlpha = 0.12; ctx.fillStyle = pat('knit'); ctx.fill(); ctx.restore();
    }
    ctx.save(); torsoPath(); ctx.clip();
    /* мягкий женственный силуэт под тканью: только контур, без анатомии */
    ctx.globalAlpha = outerVisible ? 0.10 : 0.07;
    ctx.beginPath(); ctx.ellipse(-8.5, -57 - bust * 0.2, 8, 6, -0.25, 0, Math.PI * 2);
    ctx.fillStyle = shade(topColor, -20); ctx.fill();
    ctx.beginPath(); ctx.ellipse(8.5, -57 - bust * 0.2, 8, 6, 0.25, 0, Math.PI * 2); ctx.fill();
    /* боковая тень и свет */
    ctx.globalAlpha = 0.13;
    ctx.fillStyle = radial(ctx, torsoW * 0.9, -36, 2, torsoW * 1.5,
      [[0, 'rgba(30,20,30,.65)'], [1, 'rgba(30,20,30,0)']]);
    ctx.fillRect(-torsoW - 5, -88, torsoW * 2 + 10, 90);
    ctx.globalAlpha = 0.22;
    ctx.fillStyle = radial(ctx, -torsoW * 0.5, -66, 1, torsoW * 1.4,
      [[0, 'rgba(255,255,255,.8)'], [1, 'rgba(255,255,255,0)']]);
    ctx.fillRect(-torsoW - 5, -88, torsoW * 2 + 10, 90);
    ctx.globalAlpha = 1;
    ctx.restore();
    torsoPath(); ctx.strokeStyle = shade(topColor, -24); ctx.lineWidth = 1.1; ctx.stroke();
    /* ключицы — тонкие и мягкие */
    ctx.globalAlpha = 0.24;
    line(ctx, -11, -70, -3, -65, SKIN_SHADE, 1.5);
    line(ctx, 11, -70, 3, -65, SKIN_SHADE, 1.5);
    ctx.beginPath(); ctx.moveTo(-10, -71); ctx.quadraticCurveTo(0, -61, 10, -71);
    ctx.strokeStyle = SKIN_SHADE; ctx.lineWidth = 1.5; ctx.stroke();
    ctx.globalAlpha = 1;
    if (outerColor) {
      ctx.fillStyle = grad(ctx, -27, -70, 27, 0,
        [[0, shade(outerColor, 16)], [1, shade(outerColor, -14)]]);
      ctx.beginPath(); ctx.moveTo(-25, -4); ctx.lineTo(-27, -72); ctx.lineTo(-9, -76); ctx.lineTo(-4, -10); ctx.closePath(); ctx.fill();
      ctx.beginPath(); ctx.moveTo(25, -4); ctx.lineTo(27, -72); ctx.lineTo(9, -76); ctx.lineTo(4, -10); ctx.closePath(); ctx.fill();
    }
    /* нижний слой: бретели видны у ворота, а при переодевании — целиком */
    if (o.underwear) {
      ctx.globalAlpha = 0.62;
      line(ctx, -11, -76, -13, -86, shade(under.color, -18), 1.8);
      line(ctx, 11, -76, 13, -86, shade(under.color, -18), 2.2);
      ctx.beginPath(); ctx.moveTo(-12, -76); ctx.quadraticCurveTo(0, -70, 12, -76);
      ctx.strokeStyle = shade(under.color, -12); ctx.lineWidth = 1.3; ctx.stroke();
      ctx.globalAlpha = 1;
      if (!outerVisible) {
        ctx.globalAlpha = 0.45;
        line(ctx, -19, -40, 19, -40, shade(under.color, -10), 1.3);
        ctx.globalAlpha = 1;
      }
    }
    if (o.accessory && o.accessory.id === 'scarf') {
      fillRR(ctx, -14, -76, 28, 9, 4, o.accessory.color);
      fillRR(ctx, 6, -72, 8, 34, 3, o.accessory.color);
    }
    if (o.accessory && o.accessory.id === 'bag') {
      fillRR(ctx, 18, -30, 20, 22, 6, o.accessory.color, shade(o.accessory.color, -25));
      line(ctx, 22, -30, 22, -58, shade(o.accessory.color, -30), 2);
    }
    drawArm(ctx, -torsoW - 2, -70, P, 'L', outerColor || topColor);
    drawArm(ctx, torsoW + 2, -70, P, 'R', outerColor || topColor);
    /* шея с мягкой тенью под подбородком */
    const neckTilt = P.neckTilt || 0, neckTurn = P.neckTurn || 0;
    ctx.save(); ctx.translate(neckTurn * 0.15, 0); ctx.rotate(neckTilt * 0.35 * RAD);
    ctx.beginPath();
    ctx.moveTo(-6, -86); ctx.quadraticCurveTo(-6.5, -77, -7, -72);
    ctx.lineTo(7, -72); ctx.quadraticCurveTo(6.5, -77, 6, -86);
    ctx.closePath();
    ctx.fillStyle = grad(ctx, -7, -86, 7, -72, [[0, '#f6d2b6'], [1, '#dfa98c']]); ctx.fill();
    ctx.beginPath(); ctx.ellipse(0, -84, 6.5, 3.4, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(176,108,88,.28)'; ctx.fill();
    ctx.restore();
    /* голова */
    ctx.save();
    ctx.translate((P.headTurn || 0) * 0.18 + neckTurn * 0.12,
      -100 + (P.headNod || 0) * 0.12 + (P.headDuck || 0) * 0.12);
    ctx.rotate((P.headTilt || 0) * RAD + neckTilt * 0.25 * RAD);
    ctx.scale(1 - Math.abs(P.headTurn || 0) / 130, 1 - Math.abs(P.headNod || 0) / 260);
    drawFace(ctx, P, o);
    ctx.restore();
    ctx.restore();
    ctx.restore();
  }

  /* ============================ БЫТОВЫЕ СЦЕНЫ ============================== */
  function progressOf(state) {
    if (!state.action) return 1;
    return Math.max(0, Math.min(1, 1 - state.action.remaining / Math.max(1, state.action.total)));
  }
  function lastNikaText(state) {
    for (let i = state.log.length - 1; i >= 0; i--) if (state.log[i].who === 'nika') return state.log[i].text;
    return 'Привет!';
  }
  function drawSteam(ctx, x, y, t, count, color) {
    ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.lineCap = 'round';
    for (let i = 0; i < count; i++) {
      ctx.beginPath();
      const xx = x + (i - count / 2) * 16 + Math.sin(t + i) * 5;
      ctx.moveTo(xx, y);
      ctx.bezierCurveTo(xx - 8, y - 18, xx + 9, y - 32, xx, y - 52 - (i % 2) * 10);
      ctx.globalAlpha = 0.20 + 0.22 * Math.abs(Math.sin(t * 0.7 + i));
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }

  function drawActivityBack(ctx, w, h, state, pose, S, progress) {
    const act = state.action && state.action.intent;
    const t = state.minutes / 5;
    const p = palette(state);
    if (act === 'work') {
      /* подсветка ноутбука и карточки задач */
      const dx = w * 0.480, dy = h * 0.50;
      const g = ctx.createRadialGradient(dx, dy, 4, dx, dy, 110);
      g.addColorStop(0, 'rgba(120,200,235,.22)'); g.addColorStop(1, 'rgba(120,200,235,0)');
      ctx.fillStyle = g; ctx.fillRect(dx - 110, dy - 110, 220, 220);
      for (let i = 0; i < 3; i++) {
        const yy = h * (0.37 + i * 0.055) + Math.sin(t + i) * 5;
        const xx = w * 0.455 + i * 6;
        fillRR(ctx, xx, yy, 52, 14, 4, 'rgba(255,253,247,.94)', 'rgba(70,90,105,.45)');
        circle(ctx, xx + 8, yy + 7, 2.6, '#e78fa6');
        line(ctx, xx + 15, yy + 7, xx + 44, yy + 7, 'rgba(70,90,105,.55)', 2);
      }
    }
    if (act === 'sleep') { ctx.fillStyle = 'rgba(12,18,36,.12)'; ctx.fillRect(0, 0, w, h); }
    if (act === 'wash' || act === 'toilet') {
      drawSteam(ctx, w * 0.868, h * 0.60, t, 3, p.night ? 'rgba(220,230,235,.5)' : 'rgba(255,255,255,.7)');
    }
  }

  /* ---- ПЕРЕОДЕВАНИЕ В ТРИ ФАЗЫ ------------------------------------------- */
  function dressPhases() {
    return (NIKA.anim && NIKA.anim.DRESS_SEQUENCE) || [
      { id: 'remove', label: 'Снимает одежду', from: 0, to: 0.30 },
      { id: 'search', label: 'Ищет одежду в шкафу', from: 0.30, to: 0.64 },
      { id: 'wear', label: 'Надевает новый наряд', from: 0.64, to: 1 },
    ];
  }
  function dressPhase(state, progress) {
    const list = dressPhases();
    const id = (state.dressing && state.dressing.phase) || 'remove';
    for (let i = 0; i < list.length; i++) if (list[i].id === id) return list[i];
    for (let i = 0; i < list.length; i++) if (progress >= list[i].from && progress < list[i].to) return list[i];
    return list[list.length - 1];
  }
  function baseSlip(state) {
    const u = (state.outfit && state.outfit.underwear) || { id: 'slip', color: '#e9e1d6' };
    return { underwear: u, dress: null, top: null, bottom: null, outer: null,
      shoes: { id: 'sneakers', color: '#ece7dc' }, head: null, accessory: null };
  }
  function outfitForDress(state, phase, progress) {
    const d = state.dressing || {};
    /* в фазах «снять» и «найти» виден только скромный нижний слой */
    if (phase.id === 'remove' || phase.id === 'search') return baseSlip(state);
    if (phase.id === 'wear') {
      const copy = Object.assign({}, d.to || state.outfit);
      const start = (baseSlip(state).underwear || {}).color || '#e9e1d6';
      const local = Math.max(0, Math.min(1, (progress - phase.from) / Math.max(0.01, phase.to - phase.from)));
      const c = mixColor(start, d.newColor || '#d9575f', local);
      ['dress', 'top', 'bottom', 'outer'].forEach(function (slot) {
        if (copy[slot]) copy[slot] = Object.assign({}, copy[slot], { color: c });
      });
      return copy;
    }
    return state.outfit;
  }
  function phaseBanner(ctx, W, H, state, phase) {
    const x = state.x * W, y = H * 0.135;
    const list = dressPhases();
    const idx = list.map(function (q) { return q.id; }).indexOf(phase.id);
    /* тёмная подложка под ВСЕМ баннером, чтобы подпись не терялась на светлой стене */
    fillRR(ctx, x - 132, y - 30, 264, 62, 14, 'rgba(18,22,28,.82)', 'rgba(255,255,255,.18)');
    label(ctx, phase.label.toUpperCase(), x, y - 10, 11, '#ffe2e9');
    for (let i = 0; i < list.length; i++) {
      const px = x - 108 + i * 108;
      circle(ctx, px, y + 14, 6, i === idx ? '#ffd98a' : i < idx ? '#8fd3a2' : 'rgba(255,255,255,.35)');
      label(ctx, String(i + 1), px, y + 17.5, 8, '#20242a');
    }
  }
  function drawDressingBack(ctx, W, H, state, pose, S, progress) {
    const d = state.dressing || {};
    const phase = dressPhase(state, progress);
    const cx = state.x * W;
    const oldC = d.oldColor || '#c9c1d6', newC = d.newColor || '#d9575f';
    const t = state.minutes / 3;
    const pr = profile(state);

    /* подсветка гардеробной и открытые дверцы */
    const wx = W * 0.560;
    const glow = ctx.createRadialGradient(wx, H * 0.50, 8, wx, H * 0.50, 150 * S);
    glow.addColorStop(0, phase.id === 'search' ? 'rgba(255,222,150,.30)' : 'rgba(255,222,150,.10)');
    glow.addColorStop(1, 'rgba(255,222,150,0)');
    ctx.fillStyle = glow; ctx.fillRect(wx - 160 * S, H * 0.28, 320 * S, 260 * S);
    if (phase.id === 'search') {
      /* Ника тянется к плечику: луч внимания и выбранная вещь */
      ctx.save(); ctx.globalAlpha = 0.55 + 0.25 * Math.sin(t * 2);
      circle(ctx, wx - 10, H * 0.365, 12, '#ffe6a8');
      ctx.restore();
      /* «что надеть?» — пузырь над шкафом */
      fillRR(ctx, wx - 76, H * 0.25, 152, 26, 12, 'rgba(255,252,246,.94)', 'rgba(70,58,48,.35)');
      label(ctx, pr.hesitate ? 'Мне идёт?..' : 'Выбираю наряд', wx, H * 0.25 + 17, 11, '#3b3238');
    }

    /* 1. СНЯТЬ: старая ткань улетает в корзину для белья */
    if (phase.id === 'remove') {
      const local = Math.max(0, Math.min(1, (progress - phase.from) / (phase.to - phase.from)));
      for (let i = 0; i < 4; i++) {
        ctx.save();
        ctx.translate(cx - 120 * S + i * 26 + local * 34 * S, H * 0.30 + i * 20 + Math.sin(t + i) * 6 + local * 90 * S);
        ctx.rotate(Math.sin(t + i) * 0.24 + local * 1.6);
        ctx.globalAlpha = 1 - local * 0.75;
        fillRR(ctx, -16, -11, 32, 22, 5, oldC, 'rgba(60,50,45,.4)');
        ctx.restore(); ctx.globalAlpha = 1;
      }
      /* корзина */
      fillRR(ctx, cx - 150 * S, H * 0.68, 46 * S, 34 * S, 5, 'rgba(120,108,96,.55)', 'rgba(60,50,45,.5)');
    }
    /* 2. НАЙТИ: вешалка с тканью, которая переливается к новому цвету */
    if (phase.id === 'search') {
      ctx.save(); ctx.translate(wx - 0.021 * W, H * 0.355 + Math.sin(t) * 5);
      line(ctx, 0, -18, 0, -28, '#6b5a4a', 2);
      ctx.beginPath(); ctx.arc(0, -32, 4, 0, Math.PI * 2);
      ctx.strokeStyle = '#6b5a4a'; ctx.lineWidth = 2; ctx.stroke();
      ctx.beginPath(); ctx.moveTo(-17, -14); ctx.lineTo(-10, -22); ctx.lineTo(10, -22); ctx.lineTo(17, -14);
      ctx.lineTo(24, 44); ctx.quadraticCurveTo(0, 52, -24, 44); ctx.closePath();
      fillWith(ctx, mixColor(oldC, newC, 0.65), pat('fabric'), 0.35);
      ctx.strokeStyle = 'rgba(60,50,45,.4)'; ctx.lineWidth = 1.5; ctx.stroke();
      ctx.restore();
    }
    /* 3. НАДЕТЬ: ткань опускается сверху, застёжка и примерка */
    if (phase.id === 'wear') {
      const local = Math.max(0, Math.min(1, (progress - phase.from) / (phase.to - phase.from)));
      ctx.save();
      ctx.globalAlpha = (1 - local) * 0.75;
      ctx.translate(cx, H * 0.83 - 155 * S + local * 90 * S);
      ctx.beginPath(); ctx.moveTo(-34 * S, 0); ctx.lineTo(34 * S, 0);
      ctx.lineTo(26 * S, 70 * S); ctx.quadraticCurveTo(0, 80 * S, -26 * S, 70 * S); ctx.closePath();
      fillWith(ctx, newC, pat('fabric'), 0.35);
      ctx.restore(); ctx.globalAlpha = 1;
      if (pr.mirrorCheck && local > 0.55) {
        /* зеркальце и взгляд в него */
        const mx = W * 0.596;
        fillRR(ctx, mx - 12, H * 0.38, 24, 42, 10, 'rgba(200,220,220,.55)', '#8a7a68');
        label(ctx, 'ↀ', mx, H * 0.38 + 26, 20, '#fff');
      }
      if (local > 0.8) {
        ctx.strokeStyle = 'rgba(255,255,255,.65)'; ctx.lineWidth = 1.4;
        line(ctx, cx - 8 * S, H * 0.83 - 150 * S, cx - 8 * S, H * 0.83 - 118 * S, 'rgba(255,255,255,.65)', 1.4);
      }
    }
    phaseBanner(ctx, W, H, state, phase);
  }
  function drawDressingFront(ctx, W, H, state, pose, S, progress) {
    const pr = profile(state);
    if (!pr.screen) return;              /* игрок выключил приватность */
    const phase = dressPhase(state, progress);
    const cx = state.x * W;
    const groundY = H * 0.83;
    /* ширма закрывает в первой и третьей фазе, во второй приоткрыта */
    let open = phase.id === 'search' ? 0.72 : 0.18;
    if (phase.id === 'wear') {
      const local = Math.max(0, Math.min(1, (progress - phase.from) / (phase.to - phase.from)));
      open = 0.18 + local * 0.62;
    }
    const pw = 210 * S, ph = 158 * S;
    const px = cx - pw / 2, py = groundY - ph - 6 * S;
    for (let i = 0; i < 3; i++) {
      const shift = (i - 1) * (pw / 3) * open;
      const x = px + i * (pw / 3) + shift;
      fillRR(ctx, x + 2, py, pw / 3 - 4, ph, 3,
        i % 2 ? (palette(state).night ? '#5c5760' : '#f0e8dc') : (palette(state).night ? '#4e4a55' : '#e6ddcf'),
        'rgba(70,58,48,.5)');
      line(ctx, x + pw / 6, py + 12, x + pw / 6, py + ph - 12, 'rgba(120,100,80,.25)', 1);
    }
    line(ctx, px - 6, py, px + pw + 6, py, '#6b5a4a', 3);
    line(ctx, px - 6, py + ph, px + pw + 6, py + ph, '#6b5a4a', 2);
    /* табличка «не смотри» */
    if (phase.id !== 'search') {
      fillRR(ctx, cx - 68, py - 30, 136, 22, 11, 'rgba(20,24,28,.72)', 'rgba(255,255,255,.15)');
      label(ctx, pr.turnAway ? 'НЕ СМОТРИ 🙈' : 'Я ЗА ШИРМОЙ', cx, py - 15, 10, '#ffe2e9');
    }
  }

  function drawBathing(ctx, w, h, state, pose, S) {
    const p = palette(state), t = state.minutes / 4;
    const cx = w * 0.868, gy = h * 0.715;
    /* ванна */
    ctx.beginPath(); ctx.ellipse(cx, gy, 92 * S, 42 * S, 0, 0, Math.PI * 2);
    ctx.fillStyle = p.ceramic; ctx.fill(); ctx.strokeStyle = p.frame; ctx.lineWidth = 3; ctx.stroke();
    ctx.beginPath(); ctx.ellipse(cx, gy - 4 * S, 80 * S, 32 * S, 0, 0, Math.PI * 2);
    ctx.fillStyle = p.night ? '#3d6072' : '#a9cfd8'; ctx.fill();
    /* пена */
    for (let i = 0; i < 14; i++) {
      const a = (i / 14) * Math.PI * 2;
      const bx = cx + Math.cos(a) * 78 * S, by = gy - 4 * S + Math.sin(a) * 30 * S;
      circle(ctx, bx, by + Math.sin(t + i) * 2.5 * S, (7 + (i % 3) * 3) * S, 'rgba(255,255,255,.88)');
    }
    /* плечи и руки над пеной */
    const shL = pose.shoulderL || 8, shR = pose.shoulderR || 8;
    fillRR(ctx, cx - 34 * S, gy - 62 * S, 68 * S, 46 * S, 20 * S, SKIN);
    ctx.save(); ctx.translate(cx - 26 * S, gy - 52 * S); ctx.rotate(shL * RAD);
    fillRR(ctx, -8 * S, 0, 16 * S, 38 * S, 8 * S, SKIN, SKIN_SHADE); ctx.restore();
    ctx.save(); ctx.translate(cx + 26 * S, gy - 52 * S); ctx.rotate(-shR * RAD);
    fillRR(ctx, -8 * S, 0, 16 * S, 38 * S, 8 * S, SKIN, SKIN_SHADE); ctx.restore();
    /* голова с мокрыми прядями (волосы рисуются ДО лица) */
    ctx.save(); ctx.translate(cx, gy - 92 * S);
    ctx.scale(S, S);
    ctx.beginPath(); ctx.ellipse(0, 12, 30, 42, 0, 0, Math.PI * 2);
    ctx.fillStyle = hairGradient(ctx); ctx.fill();
    ctx.save();
    ctx.beginPath(); ctx.ellipse(0, 12, 30, 42, 0, 0, Math.PI * 2); ctx.clip();
    ctx.strokeStyle = HAIR_MID; ctx.lineWidth = 2.6;
    for (let i = -3; i <= 3; i++) {
      ctx.beginPath(); ctx.moveTo(i * 9, -18);
      ctx.quadraticCurveTo(i * 10, 4, i * 9, 46);
      ctx.stroke();
    }
    ctx.restore();
    drawFace(ctx, Object.assign({}, pose, { blink: 1, smile: 0.35, blush: 0.16, brow: -0.1 }),
      {}, { closedEyes: true, hair: false });
    /* мокрая чёлка поверх лба */
    ctx.beginPath(); ctx.moveTo(-24, -12);
    ctx.bezierCurveTo(-26, -36, -6, -36, 3, -22);
    ctx.bezierCurveTo(13, -33, 25, -28, 24, -10);
    ctx.bezierCurveTo(11, -18, -10, -17, -24, -12);
    ctx.closePath();
    ctx.fillStyle = grad(ctx, -24, -36, 24, -10, [[0, '#5a3a39'], [1, '#33232c']]); ctx.fill();
    ctx.restore();
    /* пузыри и пар */
    for (let i = 0; i < 8; i++) {
      const bx = cx - 70 * S + i * 20 * S + Math.sin(t + i) * 6 * S;
      const by = gy - 70 * S - ((t * 22 + i * 25) % 90) * S;
      ctx.globalAlpha = 0.35 + 0.4 * Math.abs(Math.sin(t + i));
      circle(ctx, bx, by, (3 + (i % 3) * 2) * S, '#ffffff');
    }
    ctx.globalAlpha = 1;
    drawSteam(ctx, cx, gy - 120 * S, t, 3, p.night ? 'rgba(220,230,235,.45)' : 'rgba(255,255,255,.65)');
    fillRR(ctx, cx - 92, h * 0.19, 184, 24, 12, 'rgba(20,24,28,.72)', 'rgba(255,255,255,.15)');
    label(ctx, '✦ КУПАНИЕ', cx, h * 0.19 + 16, 11, '#ffe2e9');
  }

  function drawSleeping(ctx, w, h, state, pose) {
    const p = palette(state), t = state.minutes / 3;
    const breath = (pose.torsoY || 0) * 0.8;
    const bx = w * 0.700, by = h * 0.625, bw = w * 0.062, bh = h * 0.125;
    /* одеяло дышит */
    fillRR(ctx, bx + bw * 0.30, by + bh * 0.50 + breath, bw * 0.70, bh * 0.50, 8,
      p.night ? '#6a5f77' : '#d9c8c4', 'rgba(70,58,48,.35)');
    fillRR(ctx, bx + bw * 0.34, by + bh * 0.54 + breath, bw * 0.62, bh * 0.14, 6,
      p.night ? '#7a6d86' : '#e7d8d2');
    /* подушка */
    fillRR(ctx, bx + bw * 0.02, by + bh * 0.14, bw * 0.30, bh * 0.60, 10, p.ceramic, 'rgba(70,58,48,.3)');
    /* волосы на подушке */
    ctx.beginPath(); ctx.ellipse(bx + bw * 0.17, by + bh * 0.44, bw * 0.105, bh * 0.26, -0.15, 0, Math.PI * 2);
    ctx.fillStyle = HAIR; ctx.fill();
    ctx.globalAlpha = 0.35;
    ctx.beginPath(); ctx.ellipse(bx + bw * 0.15, by + bh * 0.40, bw * 0.08, bh * 0.22, -0.2, 0, Math.PI * 2);
    ctx.fillStyle = HAIR_LIGHT; ctx.fill(); ctx.globalAlpha = 1;
    /* лицо */
    ctx.save(); ctx.translate(bx + bw * 0.185, by + bh * 0.44);
    ctx.rotate((pose.headTurn || 0) * 0.02);
    const sleepScale = Math.max(0.34, Math.min(0.62, (bw * 0.062) / 24));
    ctx.scale(sleepScale, sleepScale);
    drawFace(ctx, Object.assign({}, pose, { blink: 1, smile: 0.18, blush: 0.10, brow: -0.15 }),
      {}, { closedEyes: true, hair: false });
    /* прядь на лбу */
    ctx.beginPath(); ctx.moveTo(-24, -12);
    ctx.bezierCurveTo(-25, -34, -5, -38, 6, -26);
    ctx.bezierCurveTo(16, -32, 25, -26, 24, -10);
    ctx.bezierCurveTo(10, -18, -10, -17, -24, -12);
    ctx.closePath();
    ctx.fillStyle = grad(ctx, -24, -38, 24, -10, [[0, '#55383a'], [1, '#2e212a']]); ctx.fill();
    ctx.restore();
    /* Zzz */
    for (let i = 0; i < 3; i++) {
      ctx.globalAlpha = 0.4 + 0.5 * Math.abs(Math.sin(t + i));
      label(ctx, 'z', bx + bw * (0.33 + i * 0.11) + Math.sin(t + i) * 6,
        by - bh * (0.18 + i * 0.22) - ((t * 5 + i * 12) % 20), 16 + i * 6, '#ffd0dc');
    }
    ctx.globalAlpha = 1;
    fillRR(ctx, w * 0.731 - 92, h * 0.19, 184, 24, 12, 'rgba(20,24,28,.72)', 'rgba(255,255,255,.15)');
    label(ctx, '✦ РЕЖИМ СНА', w * 0.731, h * 0.19 + 16, 11, '#ffe2e9');
  }

  function drawToiletFront(ctx, w, h, state, pose, S, progress) {
    const p = palette(state);
    const x = w * 0.925, y = h * 0.30, ww = w * 0.066, wh = h * 0.50;
    /* матовая дверца санузла: Ника видна только мягким силуэтом */
    ctx.fillStyle = p.night ? 'rgba(196,214,226,.30)' : 'rgba(244,249,247,.66)';
    ctx.fillRect(x, y, ww, wh);
    const g = ctx.createLinearGradient(x, y, x + ww, y);
    g.addColorStop(0, 'rgba(255,255,255,.16)'); g.addColorStop(0.5, 'rgba(255,255,255,0)');
    g.addColorStop(1, 'rgba(255,255,255,.12)');
    ctx.fillStyle = g; ctx.fillRect(x, y, ww, wh);
    for (let i = 1; i < 7; i++) line(ctx, x + (i * ww) / 7, y, x + (i * ww) / 7, y + wh, 'rgba(255,255,255,.22)', 1);
    line(ctx, x, y, x + ww, y, p.frame, 3);
    line(ctx, x, y, x, y + wh, p.frame, 3);
    line(ctx, x + ww, y, x + ww, y + wh, p.frame, 3);
    circle(ctx, x + ww * 0.86, y + wh * 0.52, 3.5, p.frame);
    /* табличка «занято» */
    fillRR(ctx, w * 0.940, h * 0.255, 92, 22, 11, 'rgba(24,28,32,.78)', 'rgba(255,255,255,.18)');
    circle(ctx, w * 0.949, h * 0.255 + 11, 3.5, '#e2604f');
    label(ctx, 'ЗАНЯТО', w * 0.940 + 56, h * 0.255 + 15, 10, '#ffe2e9');
    fillRR(ctx, w * 0.960 - 92, h * 0.19, 184, 24, 12, 'rgba(20,24,28,.72)', 'rgba(255,255,255,.15)');
    label(ctx, '✦ САНУЗЕЛ', w * 0.960, h * 0.19 + 16, 11, '#ffe2e9');
  }

  function drawTalkBubble(ctx, w, h, state, S) {
    const text = lastNikaText(state).replace(/\s+/g, ' ').slice(0, 52);
    const cx = state.x * w, groundY = h * (w < 760 ? 0.74 : 0.83);
    const by = groundY - 292 * S;
    ctx.font = '600 11px system-ui, sans-serif';
    const tw = Math.min(w - 40, Math.max(160, ctx.measureText(text).width + 28));
    fillRR(ctx, cx - tw / 2, by - 34, tw, 42, 12, 'rgba(255,252,246,.95)', 'rgba(70,58,48,.35)');
    ctx.beginPath(); ctx.moveTo(cx - 8, by + 8); ctx.lineTo(cx, by + 20); ctx.lineTo(cx + 8, by + 8);
    ctx.fillStyle = 'rgba(255,252,246,.95)'; ctx.fill();
    label(ctx, text, cx, by - 10, 11, '#3b3238');
    label(ctx, '● ● ●', cx, by + 2, 9, '#e78fa6');
    fillRR(ctx, cx - 92, h * 0.19, 184, 24, 12, 'rgba(20,24,28,.72)', 'rgba(255,255,255,.15)');
    label(ctx, '✦ РАЗГОВОР', cx, h * 0.19 + 16, 11, '#ffe2e9');
  }

  /* ============================== НИЖНЯЯ ПАНЕЛЬ ============================ */
  function drawOverlay(ctx, w, h, state) {
    const loc = data.findLocation(state.location);
    const bw = Math.min(620, w - 32);
    fillRR(ctx, w / 2 - bw / 2, h * 0.888, bw, 50, 12, 'rgba(16,20,24,.74)', 'rgba(255,255,255,.10)');
    label(ctx, 'ДЕНЬ ' + state.day + ' · ' + NIKA.world.clock(state) + ' · ' + (loc ? loc.name : 'квартира') + ' · ' +
      (state.action ? state.action.label : 'думает, чем заняться'), w / 2, h * 0.888 + 20, 13, '#f7f1e8');
    label(ctx, state.autonomy ? '◆ автономный ИИ включён — Ника живёт сама' : '◆ ждёт только твоих команд',
      w / 2, h * 0.888 + 38, 11, 'rgba(242,236,223,.72)');
  }

  /* ---- ТЫСЯЧИ ТОЧЕК УПРАВЛЕНИЯ ТЕЛОМ ------------------------------------- */
  function drawMeshPoints(ctx, cx, groundY, S, state, pose) {
    if (!mesh) return;
    const t = (state.minutes || 0) / 5;
    const d = mesh.deform(pose, state, t);
    const scale = 105 * S;
    const colors = ['#ffd98a', '#e78fa6', '#9b8cf0', '#8fd3a2', '#8fc7e8', '#f0b27a'];
    ctx.save();
    ctx.globalAlpha = 0.72;
    for (let i = 0; i < mesh.POINTS.length; i += 2) {
      const p = mesh.POINTS[i];
      const x = cx + (p.x + d[i * 2] / 105) * scale;
      const y = groundY + (p.y + d[i * 2 + 1] / 105) * scale;
      ctx.fillStyle = colors[p.id % colors.length];
      const r = 0.8 + p.w * 0.9;
      ctx.fillRect(x, y, r, r);
    }
    ctx.globalAlpha = 1;
    ctx.restore();
  }

  /* ---- МИНИ-КАРТА 13 ЗОН + видимая область камеры ------------------------- */
  function drawMinimap(ctx, w, h, state) {
    const compact = w < 720;
    const mw = Math.min(compact ? 210 : 360, w - 32), mh = 30;
    const x = 16, y = h * 0.888 - 44;
    fillRR(ctx, x, y, mw, mh, 9, 'rgba(16,20,24,.66)', 'rgba(255,255,255,.12)');
    /* окно камеры */
    const V = 1 / (data.WORLD_WIDTH * (state.zoom || 1));
    const vx = x + Math.max(0, (state.cameraX || 0) - V / 2) * mw;
    fillRR(ctx, vx, y + 3, Math.max(10, V * mw), mh - 6, 6, 'rgba(255,222,150,.22)');
    data.LOCATIONS.forEach(function (loc) {
      const px = x + loc.x * mw;
      line(ctx, px, y + 6, px, y + mh - 6, 'rgba(255,255,255,.16)', 1);
      circle(ctx, px, y + mh / 2, loc.id === state.location ? 4 : 2.2,
        loc.id === state.location ? '#ffd98a' : 'rgba(255,255,255,.5)');
    });
    label(ctx, 'КАМЕРА · ' + Math.round((state.zoom || 1) * 100) + '%', x + mw / 2, y - 5, 9, 'rgba(255,255,255,.72)');
  }
  /* ---- ПОДСКАЗКА ПО УПРАВЛЕНИЮ ДЛЯ РАЗНЫХ УСТРОЙСТВ ---------------------- */
  function drawDeviceHints(ctx, w, h, state) {
    const touch = w < 760;
    const text = touch
      ? '⇆ веди пальцем · 🤏 два пальца — зум · ⊕ вернуть камеру'
      : '← → / A D — камера · колесо / ↑ ↓ — зум · 0 — к Нике · двойной клик — центр';
    ctx.font = '600 10px system-ui, sans-serif';
    const tw = ctx.measureText(text).width + 20;
    fillRR(ctx, w - tw - 14, h * 0.888 - 30, tw, 20, 10, 'rgba(16,20,24,.55)', 'rgba(255,255,255,.10)');
    label(ctx, text, w - tw / 2 - 14, h * 0.888 - 16, 10, 'rgba(242,236,223,.8)');
  }

  /* ================================ РЕНДЕР ================================= */
  function render(ctx, canvas, state, pose, dpr) {
    dpr = dpr || 1;
    const w = canvas.width / dpr, h = canvas.height / dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    const p = palette(state);
    ctx.fillStyle = p.wall2; ctx.fillRect(0, 0, w, h);

    const zoom = Math.max(0.75, Math.min(1.8, state.zoom || 1));
    const W = w * (data.WORLD_WIDTH || 2.3);
    const H = h / zoom;
    const V = w / zoom;
    const C = (state.cameraX === undefined ? 0.32 : state.cameraX) * W;
    const offsetX = Math.max(0, Math.min(W - V, C - V / 2));
    const S = Math.max(0.62, Math.min(1.42, h / 470));
    const groundY = H * 0.83;
    const act = state.action && state.action.intent;
    const progress = progressOf(state);

    ctx.save();
    ctx.scale(zoom, zoom);
    ctx.translate(-offsetX, 0);

    drawApartment(ctx, W, H, state);
    drawActivityBack(ctx, W, H, state, pose, S, progress);

    let drawOutfit = state.outfit;
    let phase = null;
    if (act === 'dress' && state.dressing) {
      phase = dressPhase(state, progress);
      drawOutfit = outfitForDress(state, phase, progress);
      drawDressingBack(ctx, W, H, state, pose, S, progress);
    }

    if (act === 'sleep') drawSleeping(ctx, W, H, state, pose);
    else if (act === 'wash') drawBathing(ctx, W, H, state, pose, S);
    else drawGirl(ctx, state.x * W, groundY, S, pose, drawOutfit, state);

    if (state.settings && state.settings.showPoints) {
      drawMeshPoints(ctx, state.x * W, groundY, S, state, pose);
    }
    if (act === 'dress') drawDressingFront(ctx, W, H, state, pose, S, progress);
    if (act === 'toilet') drawToiletFront(ctx, W, H, state, pose, S, progress);
    if (act === 'talk') drawTalkBubble(ctx, W, H, state, S);
    drawZonePill(ctx, W, H, state);
    ctx.restore();

    drawOverlay(ctx, w, h, state);
    drawMinimap(ctx, w, h, state);
    if (w > 560) drawDeviceHints(ctx, w, h, state);
  }

  NIKA.rig = { render: render, drawGirl: drawGirl, drawRoom: drawApartment, shade: shade, mixColor: mixColor };
})(typeof globalThis !== 'undefined' ? globalThis : this);
