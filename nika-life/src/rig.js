/* =============================================================================
   НИКА: ЖИВАЯ — отрисовка: минималистичная квартира + скелетная девушка
   + отдельные визуальные сцены: переодевание, купание, сон, работа, разговор, санузел
   Поза приходит из NIKA.anim.Animator.pose(); одежда — из state.outfit.
   ============================================================================= */
(function (root) {
  'use strict';
  const NIKA = (root.NIKA = root.NIKA || {});
  const data = NIKA.data;

  const RAD = Math.PI / 180;
  const SKIN = '#f4cdb0', SKIN_SHADE = '#e0ac8d', SKIN_LIGHT = '#ffe4cc';
  const HAIR = '#392733', HAIR_MID = '#573a45', HAIR_LIGHT = '#8d5f68';
  const INK = '#2b2230', LIP = '#a85462', LIP_DARK = '#7f3b4b';

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

  function drawApartment(ctx, w, h, state) {
    const p = palette(state);
    /* стены */
    const wall = ctx.createLinearGradient(0, 0, 0, h * 0.74);
    wall.addColorStop(0, p.wall1); wall.addColorStop(1, p.wall2);
    ctx.fillStyle = wall; ctx.fillRect(0, 0, w, h * 0.74);
    for (let i = 1; i < 9; i++) line(ctx, (i * w) / 9, 0, (i * w) / 9, h * 0.74, p.line, 1);
    /* пол */
    const floor = ctx.createLinearGradient(0, h * 0.74, 0, h);
    floor.addColorStop(0, p.floor1); floor.addColorStop(1, p.floor2);
    ctx.fillStyle = floor; ctx.fillRect(0, h * 0.74, w, h * 0.26);
    for (let i = 1; i < 9; i++) line(ctx, 0, h * 0.74 + i * h * 0.029, w, h * 0.74 + i * h * 0.029, p.line, 1);
    line(ctx, 0, h * 0.74, w, h * 0.74, p.night ? 'rgba(0,0,0,.3)' : 'rgba(90,70,50,.22)', 3);

    drawWindow(ctx, w, h, p, state);
    drawArt(ctx, w * 0.585, h * 0.13, w * 0.115, h * 0.21, p);

    /* --- прихожая --- */
    fillRR(ctx, w * 0.025, h * 0.29, w * 0.085, h * 0.45, 4, p.night ? '#3c3a3c' : '#d9cdbd', p.frame);
    circle(ctx, w * 0.093, h * 0.52, 2.6, p.night ? '#e8b45a' : '#8c7a63');
    line(ctx, w * 0.125, h * 0.33, w * 0.125, h * 0.42, p.frame, 2);
    circle(ctx, w * 0.125, h * 0.43, 4, p.wood);
    /* круглое зеркало */
    ctx.beginPath(); ctx.arc(w * 0.155, h * 0.43, w * 0.032, 0, Math.PI * 2);
    ctx.fillStyle = p.night ? '#3d4b58' : '#cfdbd8'; ctx.fill();
    ctx.strokeStyle = p.frame; ctx.lineWidth = 3; ctx.stroke();
    drawPlant(ctx, w * 0.13, h * 0.735, Math.max(0.7, w / 1400), p);

    /* --- кухня: остров, табуреты, подвесной светильник --- */
    fillRR(ctx, w * 0.175, h * 0.55, w * 0.155, h * 0.17, 5, p.night ? '#4a423c' : '#efe7da', p.frame);
    fillRR(ctx, w * 0.17, h * 0.542, w * 0.165, h * 0.022, 4, p.wood);
    for (let i = 0; i < 2; i++) {
      const sx = w * (0.205 + i * 0.075);
      line(ctx, sx, h * 0.72, sx, h * 0.79, p.frame, 3);
      fillRR(ctx, sx - w * 0.017, h * 0.705, w * 0.034, h * 0.018, 6, p.fabric2);
    }
    line(ctx, w * 0.255, h * 0.02, w * 0.255, h * 0.42, p.frame, 2);
    ctx.beginPath(); ctx.ellipse(w * 0.255, h * 0.435, w * 0.026, h * 0.018, 0, 0, Math.PI * 2);
    ctx.fillStyle = p.night ? '#e8c78a' : '#e6cf9f'; ctx.fill();
    if (p.night) glow(ctx, w * 0.255, h * 0.46, 150, 'rgba(255,210,140,ALPHA)', 0.20);
    fillRR(ctx, w * 0.29, h * 0.513, w * 0.022, h * 0.032, 4, p.ceramic, p.frame);

    /* --- гостиная: диван, ковёр, журнальный столик, торшер --- */
    fillRR(ctx, w * 0.345, h * 0.795, w * 0.225, h * 0.062, 16, p.night ? '#4b3f4a' : '#d9c9b6');
    fillRR(ctx, w * 0.36, h * 0.605, w * 0.175, h * 0.135, 9, p.fabric, p.frame);
    fillRR(ctx, w * 0.368, h * 0.595, w * 0.075, h * 0.055, 8, p.fabric2);
    fillRR(ctx, w * 0.452, h * 0.595, w * 0.075, h * 0.055, 8, p.fabric2);
    line(ctx, w * 0.375, h * 0.74, w * 0.375, h * 0.765, p.frame, 3);
    line(ctx, w * 0.52, h * 0.74, w * 0.52, h * 0.765, p.frame, 3);
    fillRR(ctx, w * 0.415, h * 0.725, w * 0.085, h * 0.022, 4, p.wood);
    line(ctx, w * 0.43, h * 0.747, w * 0.43, h * 0.775, p.frame, 3);
    line(ctx, w * 0.485, h * 0.747, w * 0.485, h * 0.775, p.frame, 3);
    line(ctx, w * 0.558, h * 0.44, w * 0.558, h * 0.745, p.frame, 3);
    ctx.beginPath(); ctx.moveTo(w * 0.542, h * 0.44); ctx.lineTo(w * 0.574, h * 0.44);
    ctx.lineTo(w * 0.568, h * 0.475); ctx.lineTo(w * 0.548, h * 0.475); ctx.closePath();
    ctx.fillStyle = p.night ? '#e8c78a' : '#e6cf9f'; ctx.fill();
    if (p.night) glow(ctx, w * 0.558, h * 0.48, 170, 'rgba(255,208,138,ALPHA)', 0.18);

    /* --- рабочая зона --- */
    fillRR(ctx, w * 0.59, h * 0.585, w * 0.125, h * 0.022, 3, p.wood);
    line(ctx, w * 0.598, h * 0.607, w * 0.598, h * 0.75, p.frame, 3);
    line(ctx, w * 0.707, h * 0.607, w * 0.707, h * 0.75, p.frame, 3);
    fillRR(ctx, w * 0.625, h * 0.515, w * 0.075, h * 0.06, 4, p.frame);
    fillRR(ctx, w * 0.629, h * 0.519, w * 0.067, h * 0.05, 2, p.night ? '#4a7fa0' : '#9cc8d4');
    line(ctx, w * 0.615, h * 0.578, w * 0.71, h * 0.578, p.frame, 3);
    /* полка с книгами */
    fillRR(ctx, w * 0.60, h * 0.30, w * 0.10, h * 0.012, 2, p.wood);
    for (let i = 0; i < 4; i++) fillRR(ctx, w * (0.607 + i * 0.018), h * (0.268 + (i % 2) * 0.008), w * 0.012, h * 0.03, 1, i % 2 ? '#a9836f' : '#7e9098');

    /* --- спальня: платформа, подушки, одеяло, тумба --- */
    fillRR(ctx, w * 0.725, h * 0.625, w * 0.155, h * 0.125, 7, p.night ? '#4a4149' : '#cfc0ae', p.frame);
    fillRR(ctx, w * 0.732, h * 0.632, w * 0.141, h * 0.075, 6, p.night ? '#5d5663' : '#f2ece2');
    fillRR(ctx, w * 0.738, h * 0.638, w * 0.045, h * 0.045, 6, p.ceramic);
    fillRR(ctx, w * 0.792, h * 0.638, w * 0.045, h * 0.045, 6, p.ceramic);
    fillRR(ctx, w * 0.732, h * 0.688, w * 0.141, h * 0.055, 5, p.night ? '#6a5f77' : '#d9c8c4');
    line(ctx, w * 0.725, h * 0.75, w * 0.725, h * 0.768, p.frame, 3);
    line(ctx, w * 0.88, h * 0.75, w * 0.88, h * 0.768, p.frame, 3);
    fillRR(ctx, w * 0.887, h * 0.655, w * 0.032, h * 0.075, 3, p.wood);
    circle(ctx, w * 0.903, h * 0.643, 9, p.night ? '#f0cf92' : '#e8d3a8');
    if (p.night) glow(ctx, w * 0.903, h * 0.645, 130, 'rgba(255,210,145,ALPHA)', 0.18);

    /* --- ванная и санузел: матовая перегородка, ванна, раковина, унитаз --- */
    line(ctx, w * 0.875, h * 0.16, w * 0.875, h * 0.745, p.frame, 3);
    ctx.fillStyle = p.night ? 'rgba(190,205,215,.05)' : 'rgba(225,235,235,.14)';
    ctx.fillRect(w * 0.878, h * 0.20, w * 0.122, h * 0.54);
    /* ванна */
    ctx.beginPath(); ctx.ellipse(w * 0.925, h * 0.715, w * 0.055, h * 0.052, 0, 0, Math.PI * 2);
    ctx.fillStyle = p.ceramic; ctx.fill(); ctx.strokeStyle = p.frame; ctx.lineWidth = 2; ctx.stroke();
    ctx.beginPath(); ctx.ellipse(w * 0.925, h * 0.712, w * 0.046, h * 0.039, 0, 0, Math.PI * 2);
    ctx.fillStyle = p.night ? '#3d6072' : '#a9cfd8'; ctx.fill();
    /* раковина и зеркало */
    fillRR(ctx, w * 0.958, h * 0.545, w * 0.032, h * 0.018, 8, p.ceramic, p.frame);
    circle(ctx, w * 0.974, h * 0.44, w * 0.018, p.night ? '#3b4a58' : '#cbdad9');
    /* унитаз */
    fillRR(ctx, w * 0.958, h * 0.635, w * 0.030, h * 0.026, 5, p.ceramic, p.frame);
    ctx.beginPath(); ctx.ellipse(w * 0.973, h * 0.648, w * 0.015, h * 0.016, 0, 0, Math.PI * 2);
    ctx.fillStyle = p.night ? '#8f959c' : '#e9e6e0'; ctx.fill();
    ctx.strokeStyle = p.frame; ctx.lineWidth = 1.4; ctx.stroke();
    /* табличка WC */
    circle(ctx, w * 0.892, h * 0.30, w * 0.013, p.night ? '#3c414a' : '#f4f0e8');
    label(ctx, 'WC', w * 0.892, h * 0.303, 9, p.ink);

    /* мягкие тени под мебелью */
    ctx.fillStyle = p.night ? 'rgba(0,0,0,.18)' : 'rgba(80,62,45,.09)';
    fillRR(ctx, w * 0.36, h * 0.742, w * 0.175, h * 0.012, 6, p.night ? 'rgba(0,0,0,.18)' : 'rgba(80,62,45,.09)');
    fillRR(ctx, w * 0.725, h * 0.752, w * 0.155, h * 0.012, 6, p.night ? 'rgba(0,0,0,.18)' : 'rgba(80,62,45,.09)');

    /* ночной общий приглушённый свет */
    if (p.night) { ctx.fillStyle = 'rgba(12,18,36,.10)'; ctx.fillRect(0, 0, w, h); }
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

  /* =============================== КОНЕЧНОСТИ ============================== */
  function limb(ctx, x, y, len, angle, width, color) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(angle * RAD);
    fillRR(ctx, -width / 2, 0, width, len, width / 2, color, shade(color, -22));
    ctx.restore();
  }
  function drawArm(ctx, sx, sy, pose, side, sleeve) {
    const isL = side === 'L', dir = isL ? 1 : -1;
    const sh = pose['shoulder' + side], el = pose['elbow' + side], wr = pose['wrist' + side];
    const upper = 38, lower = 34;
    ctx.save(); ctx.translate(sx, sy); ctx.rotate(sh * dir * RAD);
    fillRR(ctx, -7, -4, 14, upper, 7, sleeve, shade(sleeve, -30));
    circle(ctx, 0, upper - 2, 6.5, SKIN);
    ctx.translate(0, upper - 2); ctx.rotate(el * dir * RAD);
    fillRR(ctx, -6, 0, 12, lower, 6, SKIN, SKIN_SHADE);
    ctx.translate(0, lower - 2); ctx.rotate(wr * dir * RAD);
    drawHand(ctx, pose, side);
    ctx.restore();
  }
  function drawHand(ctx, pose, side) {
    const fist = pose['fist' + side], point = pose['point' + side], palm = pose['palm' + side];
    const spread = pose['fingerSpread' + side] === undefined ? 0.3 : pose['fingerSpread' + side];
    const nails = pose.nailShine === undefined ? 0.4 : pose.nailShine;
    ctx.save();
    if (palm > 0.5) {
      ctx.beginPath(); ctx.ellipse(0, 5, 8, 10, 0, 0, Math.PI * 2);
      ctx.fillStyle = SKIN; ctx.fill(); ctx.strokeStyle = SKIN_SHADE; ctx.lineWidth = 1; ctx.stroke();
    } else circle(ctx, 0, 6, 7 - fist * 1.4, SKIN);
    /* пальцы */
    for (let i = 0; i < 4; i++) {
      const fx = -4.5 + i * 3;
      const fl = 6 + spread * 6 - fist * 3;
      line(ctx, fx, 8, fx + spread * (i - 1.5) * 1.4, 8 + fl, SKIN, 2.4);
      if (nails > 0.15) circle(ctx, fx + spread * (i - 1.5) * 1.4, 8 + fl, 1.1, 'rgba(255,236,224,' + (0.3 + nails * 0.6).toFixed(2) + ')');
    }
    if (point > 0.4) fillRR(ctx, -2, 4, 4, 13, 2, SKIN, SKIN_SHADE);
    if (fist > 0.7) for (let i = 0; i < 3; i++) line(ctx, -4 + i * 4, 3, -4 + i * 4, 9, 'rgba(180,120,95,.5)', 1);
    ctx.restore();
  }
  function drawLeg(ctx, hx, hy, pose, side, pants, shoes) {
    const isL = side === 'L', dir = isL ? 1 : -1;
    const hip = pose['hip' + side], knee = pose['knee' + side], ankle = pose['ankle' + side];
    const fp = pose['footPoint' + side] || 0, toe = pose.toeCurl || 0;
    const upper = 54, lower = 52;
    ctx.save(); ctx.translate(hx, hy); ctx.rotate(hip * dir * RAD);
    fillRR(ctx, -9, -4, 18, upper, 8, pants, shade(pants, -25));
    circle(ctx, 0, upper - 3, 7, pants);
    circle(ctx, 0, upper - 3, 3, shade(pants, 18));
    ctx.translate(0, upper - 3); ctx.rotate(knee * dir * RAD);
    fillRR(ctx, -7.5, 0, 15, lower, 7, pants, shade(pants, -25));
    ctx.translate(0, lower); ctx.rotate(ankle * dir * RAD);
    /* стопа / носочек */
    ctx.save(); ctx.rotate(fp * 16 * RAD);
    fillRR(ctx, -9, -3, 19 + fp * 4, 12, 5, shoes, shade(shoes, -25));
    fillRR(ctx, -9, 9 - toe * 2, 20 + fp * 4, 4, 2, '#2d2a2e');
    line(ctx, 4, 1, 10 + fp * 3, 1 + toe * 2, shade(shoes, 22), 1.2);
    ctx.restore();
    ctx.restore();
  }

  /* ================================= ВОЛОСЫ ================================= */
  function drawHairBack(ctx, hipY, pose) {
    const gloss = pose.hairGloss === undefined ? 0.5 : pose.hairGloss;
    ctx.save(); ctx.translate(0, hipY - 112);
    ctx.translate(pose.hairSway * 0.42, pose.hairBounce * 0.55);
    /* длинные слоистые волосы */
    ctx.beginPath();
    ctx.moveTo(-27, -8);
    ctx.bezierCurveTo(-42, 26, -38, 90, -22, 122);
    ctx.quadraticCurveTo(0, 138, 22, 122);
    ctx.bezierCurveTo(38, 90, 42, 26, 27, -8);
    ctx.closePath();
    ctx.fillStyle = HAIR; ctx.fill();
    /* средний слой */
    ctx.beginPath();
    ctx.moveTo(-24, 0);
    ctx.bezierCurveTo(-33, 34, -29, 88, -15, 116);
    ctx.quadraticCurveTo(0, 128, 15, 116);
    ctx.bezierCurveTo(29, 88, 33, 34, 24, 0);
    ctx.closePath();
    ctx.fillStyle = HAIR_MID; ctx.globalAlpha = 0.65; ctx.fill(); ctx.globalAlpha = 1;
    /* блики прядей */
    ctx.globalAlpha = 0.25 + gloss * 0.45;
    for (let i = -2; i <= 2; i++) {
      ctx.beginPath();
      ctx.moveTo(i * 8, 6);
      ctx.bezierCurveTo(i * 11 + 3, 46, i * 10 + 2, 88, i * 7, 112);
      ctx.strokeStyle = HAIR_LIGHT; ctx.lineWidth = i === 0 ? 3 : 2; ctx.stroke();
    }
    ctx.globalAlpha = 1;
    ctx.restore();
  }
  function drawHairFront(ctx, pose) {
    const gloss = pose.hairGloss === undefined ? 0.5 : pose.hairGloss;
    const sway = pose.hairSway || 0;
    /* гладкая чёлка с боковым пробором — без «двух рожек» */
    ctx.beginPath();
    ctx.moveTo(-26, -4);
    ctx.bezierCurveTo(-30, -34, -8, -36, 6, -28);
    ctx.bezierCurveTo(18, -23, 26, -15, 26, -4);
    ctx.bezierCurveTo(19, -9, 13, -13, 8, -18);
    ctx.bezierCurveTo(0, -8, -14, -6, -26, -4);
    ctx.closePath(); ctx.fillStyle = HAIR; ctx.fill();
    /* мягкая боковая прядь через лоб */
    ctx.beginPath();
    ctx.moveTo(5, -27);
    ctx.bezierCurveTo(17, -20, 21, -6, 16, 5);
    ctx.bezierCurveTo(12, -3, 9, -13, 2, -21);
    ctx.closePath(); ctx.fillStyle = HAIR_MID; ctx.globalAlpha = 0.85; ctx.fill(); ctx.globalAlpha = 1;
    /* боковые локоны */
    ctx.save(); ctx.translate(sway * 0.25, 0);
    ctx.beginPath(); ctx.moveTo(-25, -4);
    ctx.bezierCurveTo(-34, 24, -30, 66, -19, 78);
    ctx.quadraticCurveTo(-12, 80, -11, 68);
    ctx.bezierCurveTo(-20, 40, -19, 12, -17, -6);
    ctx.closePath(); ctx.fillStyle = HAIR; ctx.fill();
    ctx.beginPath(); ctx.moveTo(25, -4);
    ctx.bezierCurveTo(34, 24, 30, 66, 19, 78);
    ctx.quadraticCurveTo(12, 80, 11, 68);
    ctx.bezierCurveTo(20, 40, 19, 12, 17, -6);
    ctx.closePath(); ctx.fill();
    ctx.restore();
    /* глянец */
    ctx.globalAlpha = 0.3 + gloss * 0.5;
    ctx.beginPath(); ctx.moveTo(-18, -20); ctx.quadraticCurveTo(-4, -29, 8, -21);
    ctx.strokeStyle = HAIR_LIGHT; ctx.lineWidth = 3; ctx.lineCap = 'round'; ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-22, 6); ctx.bezierCurveTo(-27, 30, -25, 54, -19, 68);
    ctx.lineWidth = 2; ctx.stroke();
    ctx.globalAlpha = 1;
  }

  /* ================================== ЛИЦО ================================== */
  function drawFace(ctx, pose, outfit) {
    const blink = Math.max(0, Math.min(1, pose.blink || 0));
    const eyeH = Math.max(0.8, (7 + (pose.eyeWide || 0) * 3) * (1 - blink * 0.92));
    const lx = (pose.lookX || 0) * 3.2, ly = (pose.lookY || 0) * 2.2;
    const lash = pose.lash === undefined ? 0.6 : pose.lash;
    const arch = pose.browArch === undefined ? 0.25 : pose.browArch;
    const brow = pose.brow || 0;
    const glowA = 0.10 + (pose.skinGlow === undefined ? 0.3 : pose.skinGlow) * 0.28;
    const freckle = pose.freckle === undefined ? 0.35 : pose.freckle;
    const earTilt = pose.earTilt || 0, earRing = pose.earRing === undefined ? 0.6 : pose.earRing;
    const smile = pose.smile || 0, mouth = Math.round(pose.mouth || 0), pout = pose.lipPout === undefined ? 0.3 : pose.lipPout;

    /* уши с серёжками */
    [-25, 25].forEach(function (ex) {
      ctx.save(); ctx.translate(ex, 2); ctx.rotate(earTilt * 0.12 * (ex < 0 ? 1 : -1));
      ctx.beginPath(); ctx.ellipse(0, 0, 5, 7, 0, 0, Math.PI * 2);
      ctx.fillStyle = SKIN; ctx.fill(); ctx.strokeStyle = SKIN_SHADE; ctx.lineWidth = 1; ctx.stroke();
      if (earRing > 0.1) {
        ctx.globalAlpha = Math.min(1, earRing + 0.15);
        ctx.beginPath(); ctx.arc(0, 9, 3.4, 0, Math.PI * 2);
        ctx.strokeStyle = '#e8b45a'; ctx.lineWidth = 1.8; ctx.stroke();
        circle(ctx, 0, 12, 1.7, '#ffd98a');
        ctx.globalAlpha = 1;
      }
      ctx.restore();
    });

    /* лицо */
    ctx.beginPath(); ctx.ellipse(0, 0, 25, 28, 0, 0, Math.PI * 2);
    ctx.fillStyle = SKIN; ctx.fill(); ctx.strokeStyle = SKIN_SHADE; ctx.lineWidth = 1.1; ctx.stroke();
    /* мягкое сияние кожи */
    const sg = ctx.createRadialGradient(-8, -8, 2, 0, 4, 30);
    sg.addColorStop(0, 'rgba(255,246,232,' + glowA.toFixed(2) + ')');
    sg.addColorStop(1, 'rgba(255,246,232,0)');
    ctx.fillStyle = sg; ctx.fill();
    /* веснушки */
    if (freckle > 0.05) {
      ctx.globalAlpha = Math.min(0.7, freckle * 0.7);
      for (let i = 0; i < 8; i++) circle(ctx, -13 + (i % 4) * 4, 5 + Math.floor(i / 4) * 3.5, 0.9, '#b97a62');
      ctx.globalAlpha = 1;
    }
    /* румянец */
    if (pose.blush > 0.05) {
      ctx.globalAlpha = Math.min(0.6, pose.blush * 0.6);
      circle(ctx, -14, 8, 6, '#e77e8e'); circle(ctx, 14, 8, 6, '#e77e8e');
      ctx.globalAlpha = 1;
    }
    /* глаза */
    [-9.5, 9.5].forEach(function (ex, idx) {
      ctx.beginPath(); ctx.ellipse(ex, -2, 4.8, eyeH, 0, 0, Math.PI * 2);
      ctx.fillStyle = '#fdfaf4'; ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = 1; ctx.stroke();
      if (blink < 0.7) {
        circle(ctx, ex + lx, -2 + ly, 2.6, '#3b3040');
        circle(ctx, ex + lx - 0.8, -3 + ly, 0.9, '#ffffff');
      }
      /* ресницы */
      ctx.strokeStyle = INK; ctx.lineWidth = 1.1;
      const ln = 3 + lash * 4;
      line(ctx, ex - 4.8, -5, ex - 4.8 - ln * 0.35, -5 - ln, INK, 1.1);
      line(ctx, ex + 4.8, -5, ex + 4.8 + ln * 0.35, -5 - ln, INK, 1.1);
      /* брови с изгибом */
      ctx.beginPath();
      ctx.moveTo(ex - 5.5, -11 - brow * 2.2);
      ctx.quadraticCurveTo(ex, -13 - brow * 2.2 - arch * 3, ex + 5.5, -11 - brow * 2.2 + arch * 1.5);
      ctx.strokeStyle = HAIR_MID; ctx.lineWidth = 2.1; ctx.stroke();
    });
    /* нос */
    line(ctx, 0, 2, 1.5, 6, SKIN_SHADE, 1.5);
    circle(ctx, -1.5, 5.5, 1.2, SKIN_LIGHT);
    /* губы */
    if (mouth === 2 || mouth === 4 || (mouth === 3 && smile < -0.3)) {
      ctx.beginPath(); ctx.ellipse(0, 12, mouth === 4 ? 5 : 6, mouth === 4 ? 7 : 5, 0, 0, Math.PI * 2);
      ctx.fillStyle = LIP_DARK; ctx.fill();
      ctx.beginPath(); ctx.ellipse(0, 14, 3, 2, 0, 0, Math.PI * 2); ctx.fillStyle = '#d9777f'; ctx.fill();
    } else {
      const lift = smile * 6;
      ctx.beginPath();
      ctx.moveTo(-7 - pout * 2, 11);
      ctx.quadraticCurveTo(-3, 8 - pout * 2, 0, 10 - pout);
      ctx.quadraticCurveTo(3, 8 - pout * 2, 7 + pout * 2, 11);
      ctx.quadraticCurveTo(0, 12 + lift, -7 - pout * 2, 11);
      ctx.closePath();
      ctx.fillStyle = LIP; ctx.fill();
      ctx.beginPath(); ctx.moveTo(-7 - pout * 2, 11);
      ctx.quadraticCurveTo(0, 12 + lift, 7 + pout * 2, 11);
      ctx.strokeStyle = LIP_DARK; ctx.lineWidth = 1; ctx.stroke();
    }
    /* очки */
    if (outfit.accessory && outfit.accessory.id === 'glasses') {
      ctx.strokeStyle = outfit.accessory.color; ctx.lineWidth = 2;
      rr(ctx, -15, -8, 12, 11, 4); ctx.stroke();
      rr(ctx, 3, -8, 12, 11, 4); ctx.stroke();
      line(ctx, -3, -3, 3, -3, outfit.accessory.color, 2);
    }
    /* волосы спереди */
    drawHairFront(ctx, pose);
    /* головной убор */
    if (outfit.head) {
      const hc = outfit.head.color;
      if (outfit.head.id === 'cap') {
        ctx.beginPath(); ctx.ellipse(0, -21, 26, 14, 0, Math.PI, Math.PI * 2); ctx.fillStyle = hc; ctx.fill();
        fillRR(ctx, 4, -23, 24, 5, 3, hc);
      } else {
        ctx.beginPath(); ctx.arc(0, -14, 26, Math.PI * 1.05, Math.PI * 1.95);
        ctx.strokeStyle = hc; ctx.lineWidth = 6; ctx.stroke();
      }
    }
  }

  /* ================================ ДЕВУШКА ================================ */
  function drawGirl(ctx, cx, groundY, S, pose, outfit, state) {
    const o = outfit || {};
    const dress = o.dress;
    const topColor = dress ? dress.color : (o.top ? o.top.color : '#c9c1d6');
    const bottomColor = dress ? dress.color : (o.bottom ? o.bottom.color : '#3f5680');
    const outerColor = o.outer ? o.outer.color : null;
    const shoesColor = o.shoes ? o.shoes.color : '#ece7dc';
    const squat = pose.squat || 0;
    const hipY = -118 + squat * 34;
    const lean = (pose.torsoLean || 0) * 0.45;
    const twist = pose.torsoTwist || 0;
    const neckTilt = pose.neckTilt || 0, neckTurn = pose.neckTurn || 0;

    /* тень */
    ctx.save(); ctx.translate(cx, groundY);
    ctx.beginPath(); ctx.ellipse(0, 4, 46 * S, 9 * S, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(40,30,25,.22)'; ctx.fill(); ctx.restore();

    ctx.save();
    ctx.translate(cx + (pose.bodyX || 0) * S, groundY + (pose.bodyY || 0) * S);
    ctx.scale((pose.facing || 1) * S, S);
    drawHairBack(ctx, hipY, pose);
    drawLeg(ctx, -11, hipY, pose, 'L', bottomColor, shoesColor);
    drawLeg(ctx, 11, hipY, pose, 'R', bottomColor, shoesColor);

    /* подол / юбка */
    ctx.save(); ctx.translate(0, hipY - 12); ctx.rotate((pose.skirtSway || 0) * RAD);
    const hem = 66 + (pose.skirtLift || 0) - (pose.hemWave || 0) * 5;
    ctx.beginPath(); ctx.moveTo(-20, -8); ctx.lineTo(20, -8);
    ctx.lineTo(33 + (pose.hemWave || 0) * 4, hem);
    ctx.quadraticCurveTo(16, hem + 8 + (pose.hemWave || 0) * 4, 0, hem + 2);
    ctx.quadraticCurveTo(-16, hem + 8 + (pose.hemWave || 0) * 4, -33 - (pose.hemWave || 0) * 4, hem);
    ctx.closePath(); ctx.fillStyle = bottomColor; ctx.fill();
    ctx.strokeStyle = shade(bottomColor, -28); ctx.lineWidth = 1.4; ctx.stroke();
    for (let i = -2; i <= 2; i++) line(ctx, i * 7, 4, i * 10, hem - 4, shade(bottomColor, -16), 1);
    ctx.restore();

    /* корпус */
    ctx.save();
    ctx.translate(0, hipY + (pose.torsoY || 0));
    ctx.rotate(lean * RAD);
    ctx.transform(1 - Math.abs(twist) / 90, 0, 0, 1, twist * 0.28, 0);
    ctx.beginPath();
    ctx.moveTo(-19, -6); ctx.lineTo(-22, -72); ctx.quadraticCurveTo(0, -84, 22, -72); ctx.lineTo(19, -6);
    ctx.closePath(); ctx.fillStyle = topColor; ctx.fill();
    ctx.strokeStyle = shade(topColor, -30); ctx.lineWidth = 1.4; ctx.stroke();
    /* ключицы */
    ctx.globalAlpha = 0.32;
    line(ctx, -12, -70, -3, -64, SKIN_SHADE, 1.6);
    line(ctx, 12, -70, 3, -64, SKIN_SHADE, 1.6);
    ctx.beginPath(); ctx.moveTo(-11, -71); ctx.quadraticCurveTo(0, -60, 11, -71);
    ctx.strokeStyle = SKIN_SHADE; ctx.lineWidth = 1.8; ctx.stroke();
    ctx.globalAlpha = 1;
    if (outerColor) {
      ctx.beginPath(); ctx.moveTo(-25, -4); ctx.lineTo(-27, -72); ctx.lineTo(-9, -76); ctx.lineTo(-4, -10);
      ctx.closePath(); ctx.fillStyle = outerColor; ctx.fill();
      ctx.beginPath(); ctx.moveTo(25, -4); ctx.lineTo(27, -72); ctx.lineTo(9, -76); ctx.lineTo(4, -10);
      ctx.closePath(); ctx.fill();
    }
    if (o.accessory && o.accessory.id === 'scarf') {
      fillRR(ctx, -14, -76, 28, 9, 4, o.accessory.color);
      fillRR(ctx, 6, -72, 8, 34, 3, o.accessory.color);
    }
    if (o.accessory && o.accessory.id === 'bag') {
      fillRR(ctx, 18, -30, 20, 22, 6, o.accessory.color, shade(o.accessory.color, -25));
      line(ctx, 22, -30, 22, -58, shade(o.accessory.color, -30), 2);
    }
    drawArm(ctx, -21, -70, pose, 'L', outerColor || topColor);
    drawArm(ctx, 21, -70, pose, 'R', outerColor || topColor);
    /* шея */
    ctx.save(); ctx.translate(neckTurn * 0.15, 0); ctx.rotate(neckTilt * 0.35 * RAD);
    fillRR(ctx, -6, -86, 12, 14, 4, SKIN_SHADE);
    ctx.restore();
    /* голова */
    ctx.save();
    ctx.translate((pose.headTurn || 0) * 0.18 + neckTurn * 0.12, -100 + (pose.headNod || 0) * 0.12);
    ctx.rotate((pose.headTilt || 0) * RAD + neckTilt * 0.25 * RAD);
    ctx.scale(1 - Math.abs(pose.headTurn || 0) / 130, 1 - Math.abs(pose.headNod || 0) / 260);
    drawFace(ctx, pose, o);
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
      const dx = w * 0.66, dy = h * 0.545;
      const g = ctx.createRadialGradient(dx, dy, 4, dx, dy, 110);
      g.addColorStop(0, 'rgba(120,200,235,.22)'); g.addColorStop(1, 'rgba(120,200,235,0)');
      ctx.fillStyle = g; ctx.fillRect(dx - 110, dy - 110, 220, 220);
      for (let i = 0; i < 3; i++) {
        const yy = h * (0.37 + i * 0.055) + Math.sin(t + i) * 5;
        const xx = w * 0.535 + i * 6;
        fillRR(ctx, xx, yy, 52, 14, 4, 'rgba(255,253,247,.94)', 'rgba(70,90,105,.45)');
        circle(ctx, xx + 8, yy + 7, 2.6, '#e78fa6');
        line(ctx, xx + 15, yy + 7, xx + 44, yy + 7, 'rgba(70,90,105,.55)', 2);
      }
    }
    if (act === 'sleep') { ctx.fillStyle = 'rgba(12,18,36,.12)'; ctx.fillRect(0, 0, w, h); }
    if (act === 'wash' || act === 'toilet') {
      drawSteam(ctx, w * 0.925, h * 0.60, t, 3, p.night ? 'rgba(220,230,235,.5)' : 'rgba(255,255,255,.7)');
    }
  }

  function drawDressing(ctx, w, h, state, pose, S, progress) {
    const d = state.dressing || {};
    const oldC = d.oldColor || '#c9c1d6', newC = d.newColor || '#d9575f';
    const cx = state.x * w, groundY = h * (w < 760 ? 0.74 : 0.83);
    const slide = progress > 0.72 ? ((progress - 0.72) / 0.28) * 190 * S : 0;
    const t = state.minutes / 3;
    /* плавающие образцы ткани: старый цвет уходит, новый приходит */
    for (let i = 0; i < 3; i++) {
      const yy = h * 0.30 + i * 26 + Math.sin(t + i) * 6;
      const c = i === 0 ? oldC : mixColor(oldC, newC, Math.min(1, progress * 1.4 - i * 0.15));
      ctx.save(); ctx.translate(cx - 150 * S + i * 22 + Math.sin(t + i) * 5, yy);
      ctx.rotate(Math.sin(t + i) * 0.18);
      fillRR(ctx, -14, -9, 28, 18, 4, c, 'rgba(60,50,45,.35)');
      ctx.restore();
      ctx.globalAlpha = 0.25 + 0.35 * Math.abs(Math.sin(t + i));
      circle(ctx, cx - 150 * S + i * 22 + 26, yy - 12, 2.2, '#fff4d6');
      ctx.globalAlpha = 1;
    }
    /* вешалка с платьем, меняющим цвет */
    ctx.save();
    ctx.translate(cx + 150 * S, h * 0.34 + Math.sin(t) * 6);
    ctx.globalAlpha = 0.85;
    line(ctx, 0, -18, 0, -26, '#6b5a4a', 2);
    ctx.beginPath(); ctx.arc(0, -30, 4, 0, Math.PI * 2); ctx.strokeStyle = '#6b5a4a'; ctx.lineWidth = 2; ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-16, -14); ctx.lineTo(-10, -20); ctx.lineTo(10, -20); ctx.lineTo(16, -14);
    ctx.lineTo(23, 40); ctx.quadraticCurveTo(0, 48, -23, 40); ctx.closePath();
    ctx.fillStyle = mixColor(oldC, newC, progress); ctx.fill();
    ctx.strokeStyle = 'rgba(60,50,45,.4)'; ctx.lineWidth = 1.5; ctx.stroke();
    ctx.restore();
    ctx.globalAlpha = 1;
    /* ширма */
    ctx.save();
    ctx.translate(slide, 0);
    const px = cx - 100 * S, py = groundY - 158 * S, pw = 200 * S, ph = 152 * S;
    for (let i = 0; i < 3; i++) {
      const x = px + i * (pw / 3);
      fillRR(ctx, x + 2, py, pw / 3 - 4, ph, 3,
        i % 2 ? (palette(state).night ? '#5c5760' : '#f0e8dc') : (palette(state).night ? '#4e4a55' : '#e6ddcf'),
        'rgba(70,58,48,.5)');
      line(ctx, x + pw / 6, py + 12, x + pw / 6, py + ph - 12, 'rgba(120,100,80,.25)', 1);
    }
    line(ctx, px, py, px + pw, py, '#6b5a4a', 3);
    line(ctx, px, py + ph, px + pw, py + ph, '#6b5a4a', 2);
    ctx.restore();
    /* подпись */
    fillRR(ctx, cx - 92, h * 0.19, 184, 24, 12, 'rgba(20,24,28,.72)', 'rgba(255,255,255,.15)');
    label(ctx, '✦ ПЕРЕОДЕВАНИЕ', cx, h * 0.19 + 16, 11, '#ffe2e9');
  }

  function drawBathing(ctx, w, h, state, pose, S) {
    const p = palette(state), t = state.minutes / 4;
    const cx = w * 0.90, gy = h * 0.755;
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
    ctx.beginPath(); ctx.ellipse(0, 12 * S, 30 * S, 42 * S, 0, 0, Math.PI * 2);
    ctx.fillStyle = HAIR; ctx.fill();
    ctx.save();
    ctx.beginPath(); ctx.ellipse(0, 12 * S, 30 * S, 42 * S, 0, 0, Math.PI * 2); ctx.clip();
    ctx.strokeStyle = HAIR_MID; ctx.lineWidth = 3 * S;
    for (let i = -3; i <= 3; i++) {
      ctx.beginPath(); ctx.moveTo(i * 9 * S, -18 * S);
      ctx.quadraticCurveTo(i * 10 * S, 4 * S, i * 9 * S, 46 * S);
      ctx.stroke();
    }
    ctx.restore();
    ctx.beginPath(); ctx.ellipse(0, 0, 22 * S, 25 * S, 0, 0, Math.PI * 2);
    ctx.fillStyle = SKIN; ctx.fill(); ctx.strokeStyle = SKIN_SHADE; ctx.lineWidth = 1.2; ctx.stroke();
    /* чёлка поверх лба */
    ctx.beginPath(); ctx.moveTo(-22 * S, -8 * S);
    ctx.bezierCurveTo(-24 * S, -30 * S, -6 * S, -30 * S, 2 * S, -20 * S);
    ctx.bezierCurveTo(12 * S, -31 * S, 24 * S, -26 * S, 22 * S, -8 * S);
    ctx.bezierCurveTo(10 * S, -16 * S, -10 * S, -16 * S, -22 * S, -8 * S);
    ctx.closePath(); ctx.fillStyle = HAIR; ctx.fill();
    /* закрытые глаза и улыбка */
    [-8, 8].forEach(function (ex) {
      ctx.beginPath(); ctx.moveTo((ex - 4) * S, -2 * S);
      ctx.quadraticCurveTo(ex * S, 2 * S, (ex + 4) * S, -2 * S);
      ctx.strokeStyle = INK; ctx.lineWidth = 1.8; ctx.stroke();
    });
    ctx.beginPath(); ctx.moveTo(-5 * S, 9 * S); ctx.quadraticCurveTo(0, 13 * S, 5 * S, 9 * S);
    ctx.strokeStyle = LIP_DARK; ctx.lineWidth = 2; ctx.stroke();
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
    const bx = w * 0.725, by = h * 0.625, bw = w * 0.155, bh = h * 0.125;
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
    ctx.beginPath(); ctx.ellipse(0, 0, bw * 0.062, bh * 0.20, 0, 0, Math.PI * 2);
    ctx.fillStyle = SKIN; ctx.fill(); ctx.strokeStyle = SKIN_SHADE; ctx.lineWidth = 1.2; ctx.stroke();
    [-6, 7].forEach(function (ex) {
      ctx.beginPath(); ctx.moveTo(ex - 4, -3); ctx.quadraticCurveTo(ex, 1, ex + 4, -3);
      ctx.strokeStyle = INK; ctx.lineWidth = 1.8; ctx.stroke();
      ctx.beginPath(); ctx.moveTo(ex - 4, -5); ctx.quadraticCurveTo(ex, -8, ex + 4, -5);
      ctx.strokeStyle = HAIR_MID; ctx.lineWidth = 1.5; ctx.stroke();
    });
    ctx.beginPath(); ctx.moveTo(-4, 9); ctx.quadraticCurveTo(0, 12, 4, 9);
    ctx.strokeStyle = LIP; ctx.lineWidth = 1.8; ctx.stroke();
    ctx.restore();
    /* Zzz */
    for (let i = 0; i < 3; i++) {
      ctx.globalAlpha = 0.4 + 0.5 * Math.abs(Math.sin(t + i));
      label(ctx, 'z', bx + bw * (0.33 + i * 0.11) + Math.sin(t + i) * 6,
        by - bh * (0.18 + i * 0.22) - ((t * 5 + i * 12) % 20), 16 + i * 6, '#ffd0dc');
    }
    ctx.globalAlpha = 1;
    fillRR(ctx, w * 0.79 - 92, h * 0.19, 184, 24, 12, 'rgba(20,24,28,.72)', 'rgba(255,255,255,.15)');
    label(ctx, '✦ РЕЖИМ СНА', w * 0.79, h * 0.19 + 16, 11, '#ffe2e9');
  }

  function drawToiletFront(ctx, w, h, state, pose, S, progress) {
    const p = palette(state);
    const x = w * 0.878, y = h * 0.30, ww = w * 0.122, wh = h * 0.50;
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
    fillRR(ctx, w * 0.885, h * 0.255, 92, 22, 11, 'rgba(24,28,32,.78)', 'rgba(255,255,255,.18)');
    circle(ctx, w * 0.895, h * 0.255 + 11, 3.5, '#e2604f');
    label(ctx, 'ЗАНЯТО', w * 0.885 + 56, h * 0.255 + 15, 10, '#ffe2e9');
    fillRR(ctx, w * 0.90 - 92, h * 0.19, 184, 24, 12, 'rgba(20,24,28,.72)', 'rgba(255,255,255,.15)');
    label(ctx, '✦ САНУЗЕЛ', w * 0.90, h * 0.19 + 16, 11, '#ffe2e9');
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
    const bw = Math.min(600, w - 40);
    fillRR(ctx, w / 2 - bw / 2, h * 0.892, bw, 48, 12, 'rgba(16,20,24,.74)', 'rgba(255,255,255,.10)');
    label(ctx, 'ДЕНЬ ' + state.day + ' · ' + NIKA.world.clock(state) + ' · ' + (loc ? loc.name : 'квартира') + ' · ' +
      (state.action ? state.action.label : 'думает, чем заняться'), w / 2, h * 0.892 + 20, 13, '#f7f1e8');
    label(ctx, state.autonomy ? '◆ автономный ИИ включён — Ника живёт сама' : '◆ ждёт только твоих команд',
      w / 2, h * 0.892 + 38, 11, 'rgba(242,236,223,.72)');
  }

  /* ================================ РЕНДЕР ================================= */
  function render(ctx, canvas, state, pose, dpr) {
    dpr = dpr || 1;
    const w = canvas.width / dpr, h = canvas.height / dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    const S = Math.max(0.62, Math.min(1.42, h / 470));
    const groundY = h * (w < 760 ? 0.74 : 0.83);
    const act = state.action && state.action.intent;
    const progress = progressOf(state);
    drawApartment(ctx, w, h, state);
    drawActivityBack(ctx, w, h, state, pose, S, progress);
    /* покадровая смена одежды: цвет ткани на самой Нике перетекает от старого к новому */
    let drawOutfit = state.outfit;
    if (act === 'dress' && state.dressing) {
      const dr = state.dressing;
      const eased = Math.max(0, Math.min(1, (progress - 0.12) / 0.72));
      const flowing = mixColor(dr.oldColor || '#c9c1d6', dr.newColor || '#d9575f', eased);
      const copy = Object.assign({}, state.outfit);
      ['dress', 'top', 'bottom', 'outer'].forEach(function (slot) {
        if (copy[slot]) copy[slot] = Object.assign({}, copy[slot], { color: flowing });
      });
      drawOutfit = copy;
    }
    if (act === 'sleep') drawSleeping(ctx, w, h, state, pose);
    else if (act === 'wash') drawBathing(ctx, w, h, state, pose, S);
    else drawGirl(ctx, state.x * w, groundY, S, pose, drawOutfit, state);
    if (act === 'dress') drawDressing(ctx, w, h, state, pose, S, progress);
    if (act === 'toilet') drawToiletFront(ctx, w, h, state, pose, S, progress);
    if (act === 'talk') drawTalkBubble(ctx, w, h, state, S);
    drawZonePill(ctx, w, h, state);
    drawOverlay(ctx, w, h, state);
  }

  NIKA.rig = { render: render, drawGirl: drawGirl, drawRoom: drawApartment, shade: shade, mixColor: mixColor };
})(typeof globalThis !== 'undefined' ? globalThis : this);
