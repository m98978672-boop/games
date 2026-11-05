/* =============================================================================
   НИКА: ЖИВАЯ — отрисовка мира и скелетной девушки на Canvas 2D
   Поза приходит из NIKA.anim.Animator.pose(); одежда — из state.outfit.
   ============================================================================= */
(function (root) {
  'use strict';
  const NIKA = (root.NIKA = root.NIKA || {});
  const data = NIKA.data;

  const RAD = Math.PI / 180;
  const SKIN = '#f3c9a8', SKIN_SHADE = '#e0ac8a', HAIR = '#3d2b34', HAIR_LIGHT = '#6a4650';
  const LINE = '#2a222b', INK = '#241d26';

  function rr(ctx, x, y, w, h, r) {
    r = Math.min(r, Math.abs(w) / 2, Math.abs(h) / 2);
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
    if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = 1.2; ctx.stroke(); }
  }
  function circle(ctx, x, y, r, color) {
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fillStyle = color; ctx.fill();
  }
  function line(ctx, x1, y1, x2, y2, color, width) {
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2);
    ctx.strokeStyle = color; ctx.lineWidth = width || 2; ctx.lineCap = 'round'; ctx.stroke();
  }
  function shade(hex, amount) {
    const h = String(hex || '#888888').replace('#', '');
    const full = h.length === 3 ? h.split('').map(function (c) { return c + c; }).join('') : h;
    const n = parseInt(full, 16);
    const r = Math.max(0, Math.min(255, (n >> 16) + amount));
    const g = Math.max(0, Math.min(255, ((n >> 8) & 255) + amount));
    const b = Math.max(0, Math.min(255, (n & 255) + amount));
    return 'rgb(' + r + ',' + g + ',' + b + ')';
  }

  /* --- комната -------------------------------------------------------------- */
  function drawRoom(ctx, w, h, state) {
    const hour = state.hour;
    const night = hour >= 21 || hour < 6;
    const dusk = (hour >= 18 && hour < 21) || (hour >= 5 && hour < 8);
    const wallTop = night ? '#202637' : dusk ? '#5a4a52' : '#6b7f86';
    const wallBottom = night ? '#2b3040' : dusk ? '#8b6e65' : '#a9b7ad';
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, wallTop); grad.addColorStop(0.72, wallBottom); grad.addColorStop(0.721, night ? '#3a3340' : '#6c5b50'); grad.addColorStop(1, night ? '#241f2a' : '#43372f');
    ctx.fillStyle = grad; ctx.fillRect(0, 0, w, h);

    /* окно */
    const wx = w * 0.34, wy = h * 0.09, ww = Math.min(220, w * 0.22), wh = h * 0.30;
    fillRR(ctx, wx - 8, wy - 8, ww + 16, wh + 16, 10, night ? '#1a1d27' : '#46545a', '#d9d1bd');
    const sky = ctx.createLinearGradient(0, wy, 0, wy + wh);
    if (night) { sky.addColorStop(0, '#101c3b'); sky.addColorStop(1, '#304067'); }
    else if (dusk) { sky.addColorStop(0, '#e79f78'); sky.addColorStop(1, '#7d6b9c'); }
    else { sky.addColorStop(0, '#8ec9e8'); sky.addColorStop(1, '#dcecc9'); }
    ctx.fillStyle = sky; ctx.fillRect(wx, wy, ww, wh);
    if (night) {
      circle(ctx, wx + ww * 0.72, wy + wh * 0.25, 15, '#f5e8b8');
      for (let i = 0; i < 18; i++) {
        const sx = wx + ((i * 73) % (ww - 12)) + 6, sy = wy + ((i * 41) % (wh - 20)) + 8;
        circle(ctx, sx, sy, i % 4 === 0 ? 1.6 : 1, 'rgba(255,255,255,.75)');
      }
    } else {
      circle(ctx, wx + ww * 0.25, wy + wh * 0.28, 22, dusk ? '#ffd39a' : '#fff3c4');
      ctx.fillStyle = 'rgba(255,255,255,.35)';
      fillRR(ctx, wx + ww * 0.08, wy + wh * 0.56, ww * 0.38, 12, 6, 'rgba(255,255,255,.45)');
      fillRR(ctx, wx + ww * 0.53, wy + wh * 0.66, ww * 0.4, 10, 5, 'rgba(255,255,255,.32)');
    }
    /* город за окном */
    ctx.fillStyle = night ? '#1b2437' : '#6c8577';
    for (let i = 0; i < 9; i++) {
      const bh = 14 + (i * 17) % 38;
      ctx.fillRect(wx + i * (ww / 9), wy + wh - bh, ww / 9 - 2, bh);
    }
    line(ctx, wx + ww / 2, wy, wx + ww / 2, wy + wh, '#cfc6b3', 4);
    line(ctx, wx, wy + wh / 2, wx + ww, wy + wh / 2, '#cfc6b3', 4);
    /* подоконник и шторы */
    fillRR(ctx, wx - 14, wy + wh, ww + 28, 10, 3, '#9a7b62');
    ctx.fillStyle = night ? 'rgba(120,80,110,.55)' : 'rgba(226,198,162,.7)';
    fillRR(ctx, wx - 24, wy - 10, 22, wh + 24, 8, night ? 'rgba(120,80,110,.55)' : 'rgba(226,198,162,.7)');
    fillRR(ctx, wx + ww + 2, wy - 10, 22, wh + 24, 8, night ? 'rgba(120,80,110,.55)' : 'rgba(226,198,162,.7)');

    /* пол и ковёр */
    ctx.fillStyle = night ? 'rgba(0,0,0,.18)' : 'rgba(0,0,0,.08)';
    ctx.fillRect(0, h * 0.72, w, h * 0.28);
    for (let i = 0; i < 12; i++) line(ctx, 0, h * 0.72 + i * h * 0.024, w, h * 0.72 + i * h * 0.024, 'rgba(255,255,255,.045)', 1);
    fillRR(ctx, w * 0.28, h * 0.84, w * 0.44, h * 0.09, 18, night ? '#50394a' : '#8b5f5a');
    fillRR(ctx, w * 0.30, h * 0.855, w * 0.40, h * 0.06, 14, night ? '#68485c' : '#a87568');

    /* кухня слева */
    fillRR(ctx, w * 0.03, h * 0.40, w * 0.13, h * 0.32, 8, '#52636a', '#2c3940');
    fillRR(ctx, w * 0.035, h * 0.415, w * 0.12, h * 0.10, 4, '#6f8187');
    circle(ctx, w * 0.075, h * 0.465, 5, '#e8b45a');
    fillRR(ctx, w * 0.04, h * 0.545, w * 0.11, h * 0.16, 5, '#42525a');
    fillRR(ctx, w * 0.15, h * 0.44, w * 0.14, h * 0.28, 6, '#a38269', '#6c5040');
    fillRR(ctx, w * 0.155, h * 0.45, w * 0.13, h * 0.06, 3, '#c4a184');
    fillRR(ctx, w * 0.19, h * 0.405, w * 0.045, h * 0.05, 3, '#8d99a1'); // чайник
    circle(ctx, w * 0.212, h * 0.405, 5, '#e8b45a');

    /* рабочий стол */
    fillRR(ctx, w * 0.40, h * 0.56, w * 0.20, h * 0.16, 6, '#8a6c54', '#58402f');
    fillRR(ctx, w * 0.435, h * 0.485, w * 0.13, h * 0.08, 4, '#2f3a46', '#151c25');
    fillRR(ctx, w * 0.442, h * 0.492, w * 0.116, h * 0.062, 2, night ? '#3f6a8a' : '#7fbfd0');
    fillRR(ctx, w * 0.47, h * 0.565, w * 0.06, h * 0.015, 2, '#20262c');
    fillRR(ctx, w * 0.46, h * 0.72, w * 0.08, h * 0.10, 4, '#4a3c39');

    /* кровать справа */
    fillRR(ctx, w * 0.70, h * 0.55, w * 0.27, h * 0.18, 10, '#6b5560', '#443640');
    fillRR(ctx, w * 0.71, h * 0.555, w * 0.25, h * 0.11, 8, '#e6d9cf');
    fillRR(ctx, w * 0.715, h * 0.56, w * 0.07, h * 0.055, 5, '#f3e9df');
    fillRR(ctx, w * 0.70, h * 0.50, w * 0.035, h * 0.23, 5, '#53403a');
    fillRR(ctx, w * 0.955, h * 0.50, w * 0.035, h * 0.23, 5, '#53403a');

    /* шкаф и зеркало */
    fillRR(ctx, w * 0.615, h * 0.30, w * 0.075, h * 0.42, 5, '#7b5c4b', '#4b362c');
    line(ctx, w * 0.6525, h * 0.31, w * 0.6525, h * 0.71, '#4b362c', 2);
    circle(ctx, w * 0.64, h * 0.51, 2.5, '#e8b45a'); circle(ctx, w * 0.665, h * 0.51, 2.5, '#e8b45a');
    fillRR(ctx, w * 0.895, h * 0.33, w * 0.07, h * 0.24, 22, '#b9c7c9', '#6c7d80');
    fillRR(ctx, w * 0.902, h * 0.34, w * 0.056, h * 0.22, 18, night ? '#2c3b52' : '#9bbdcb');

    /* растения, лампа, книги */
    fillRR(ctx, w * 0.30, h * 0.63, w * 0.035, h * 0.09, 3, '#a8704d');
    for (let i = 0; i < 6; i++) {
      ctx.save(); ctx.translate(w * 0.3175, h * 0.63); ctx.rotate((i - 2.5) * 0.42);
      ctx.beginPath(); ctx.ellipse(0, -16, 6, 16, 0, 0, Math.PI * 2); ctx.fillStyle = i % 2 ? '#4f8a5c' : '#65a46b'; ctx.fill(); ctx.restore();
    }
    fillRR(ctx, w * 0.665, h * 0.55, w * 0.02, h * 0.17, 3, '#6b5a4a');
    circle(ctx, w * 0.675, h * 0.545, 12, night ? '#f7d98a' : '#e8cfa0');
    if (night) { const g = ctx.createRadialGradient(w * 0.675, h * 0.545, 4, w * 0.675, h * 0.545, 130); g.addColorStop(0, 'rgba(255,214,130,.24)'); g.addColorStop(1, 'rgba(255,214,130,0)'); ctx.fillStyle = g; ctx.fillRect(w * 0.5, h * 0.4, w * 0.35, h * 0.4); }

    /* подписи зон (разнесены, чтобы не накладывались) */
    ctx.font = '600 10px system-ui, sans-serif'; ctx.textAlign = 'center';
    const labels = [
      { name: 'УЛИЦА', x: 0.08 }, { name: 'КУХНЯ', x: 0.21 },
      { name: 'РАБОЧИЙ СТОЛ', x: 0.44 }, { name: 'ГОСТИНАЯ', x: 0.60 },
      { name: 'СПАЛЬНЯ', x: 0.80 }, { name: 'ВАННАЯ', x: 0.94 },
    ];
    labels.forEach(function (l) {
      ctx.fillStyle = 'rgba(242,236,223,.38)';
      ctx.fillText(l.name, l.x * w, h * 0.755);
    });
  }

  /* --- сон: Ника лежит в кровати под одеялом ------------------------------- */
  function drawSleeping(ctx, w, h, state) {
    const bx = w * 0.70, by = h * 0.55, bw = w * 0.27, bh = h * 0.18;
    /* одеяло */
    fillRR(ctx, bx + bw * 0.24, by + bh * 0.20, bw * 0.74, bh * 0.62, 14, '#8f7f9c', '#5d4e68');
    fillRR(ctx, bx + bw * 0.30, by + bh * 0.24, bw * 0.66, bh * 0.18, 9, '#a794b0');
    /* подушка */
    fillRR(ctx, bx + bw * 0.015, by + bh * 0.16, bw * 0.26, bh * 0.60, 12, '#f3e9df', '#cfc0b4');
    /* волосы на подушке */
    ctx.beginPath();
    ctx.ellipse(bx + bw * 0.14, by + bh * 0.46, bw * 0.105, bh * 0.23, -0.15, 0, Math.PI * 2);
    ctx.fillStyle = HAIR; ctx.fill();
    /* лицо */
    ctx.save();
    ctx.translate(bx + bw * 0.155, by + bh * 0.46);
    ctx.beginPath(); ctx.ellipse(0, 0, bw * 0.065, bh * 0.19, 0, 0, Math.PI * 2);
    ctx.fillStyle = SKIN; ctx.fill(); ctx.strokeStyle = SKIN_SHADE; ctx.lineWidth = 1.2; ctx.stroke();
    /* закрытые глаза */
    ctx.strokeStyle = INK; ctx.lineWidth = 1.8; ctx.lineCap = 'round';
    [-6, 7].forEach(function (ex) {
      ctx.beginPath(); ctx.moveTo(ex - 4, -3); ctx.quadraticCurveTo(ex, 1, ex + 4, -3); ctx.stroke();
    });
    ctx.beginPath(); ctx.moveTo(-4, 9); ctx.quadraticCurveTo(0, 12, 4, 9); ctx.stroke();
    ctx.restore();
    /* Zzz */
    ctx.textAlign = 'center';
    const t = state.minutes / 3;
    for (let i = 0; i < 3; i++) {
      ctx.globalAlpha = 0.4 + 0.5 * Math.abs(Math.sin(t + i));
      ctx.fillStyle = '#ffd0dc';
      ctx.font = '700 ' + (16 + i * 6) + 'px system-ui, sans-serif';
      ctx.fillText('z', bx + bw * (0.22 + i * 0.10) + Math.sin(t + i) * 6, by - bh * (0.15 + i * 0.20) - (t * 4 + i * 10) % 18);
    }
    ctx.globalAlpha = 1;
  }

  /* --- конечности ----------------------------------------------------------- */
  function limb(ctx, x, y, len, angle, width, color) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(angle * RAD);
    fillRR(ctx, -width / 2, 0, width, len, width / 2, color, shade(color, -22));
    ctx.restore();
  }
  function drawArm(ctx, sx, sy, pose, side, sleeve, skin) {
    const isL = side === 'L';
    const dir = isL ? 1 : -1;
    const sh = pose['shoulder' + side], el = pose['elbow' + side], wr = pose['wrist' + side];
    const upper = 38, lower = 34;
    ctx.save();
    ctx.translate(sx, sy);
    ctx.rotate(sh * dir * RAD);
    fillRR(ctx, -7, -4, 14, upper, 7, sleeve, shade(sleeve, -30));
    /* локоть */
    circle(ctx, 0, upper - 2, 6.5, skin);
    ctx.translate(0, upper - 2);
    ctx.rotate(el * dir * RAD);
    fillRR(ctx, -6, 0, 12, lower, 6, skin, SKIN_SHADE);
    ctx.translate(0, lower - 2);
    ctx.rotate(wr * dir * RAD);
    drawHand(ctx, pose, side, skin);
    ctx.restore();
  }
  function drawHand(ctx, pose, side, skin) {
    const fist = pose['fist' + side], point = pose['point' + side], palm = pose['palm' + side];
    ctx.save();
    if (palm > 0.5) {
      ctx.beginPath(); ctx.ellipse(0, 5, 8, 10, 0, 0, Math.PI * 2); ctx.fillStyle = skin; ctx.fill();
      ctx.strokeStyle = SKIN_SHADE; ctx.lineWidth = 1; ctx.stroke();
    } else {
      circle(ctx, 0, 6, 7 - fist * 1.4, skin);
    }
    if (point > 0.4) {
      fillRR(ctx, -2, 4, 4, 13, 2, skin, SKIN_SHADE);
    }
    if (fist > 0.7) {
      for (let i = 0; i < 3; i++) line(ctx, -4 + i * 4, 3, -4 + i * 4, 9, 'rgba(180,120,95,.5)', 1);
    }
    ctx.restore();
  }
  function drawLeg(ctx, hx, hy, pose, side, pants, shoes) {
    const isL = side === 'L';
    const dir = isL ? 1 : -1;
    const hip = pose['hip' + side], knee = pose['knee' + side], ankle = pose['ankle' + side];
    const upper = 54, lower = 52;
    ctx.save(); ctx.translate(hx, hy); ctx.rotate(hip * dir * RAD);
    fillRR(ctx, -9, -4, 18, upper, 8, pants, shade(pants, -25));
    circle(ctx, 0, upper - 3, 7, pants);
    ctx.translate(0, upper - 3); ctx.rotate(knee * dir * RAD);
    fillRR(ctx, -7.5, 0, 15, lower, 7, pants, shade(pants, -25));
    ctx.translate(0, lower); ctx.rotate(ankle * dir * RAD);
    /* обувь */
    fillRR(ctx, -9, -3, 19, 12, 5, shoes, shade(shoes, -25));
    fillRR(ctx, -9, 9, 20, 4, 2, '#2d2a2e');
    ctx.restore();
  }

  /* --- девушка -------------------------------------------------------------- */
  function drawGirl(ctx, cx, groundY, S, pose, outfit, state) {
    const o = outfit || {};
    const dress = o.dress;
    const topColor = dress ? dress.color : (o.top ? o.top.color : '#c9c1d6');
    const bottomColor = dress ? dress.color : (o.bottom ? o.bottom.color : '#3f5680');
    const outerColor = o.outer ? o.outer.color : null;
    const shoesColor = o.shoes ? o.shoes.color : '#ece7dc';
    const skin = SKIN;
    const squat = pose.squat;
    const hipY = -118 + squat * 34;
    const lean = pose.torsoLean * 0.45;
    const twist = pose.torsoTwist;
    const sleeping = state.action && state.action.intent === 'sleep';

    /* тень */
    ctx.save(); ctx.translate(cx, groundY);
    ctx.beginPath(); ctx.ellipse(0, 4, 46 * S, 9 * S, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0,0,0,.28)'; ctx.fill(); ctx.restore();

    ctx.save();
    ctx.translate(cx + pose.bodyX * S, groundY + pose.bodyY * S);
    ctx.scale((pose.facing || 1) * S, S);

    /* задние волосы */
    ctx.save();
    ctx.translate(0, hipY - 118);
    ctx.translate(pose.hairSway * 0.35, pose.hairBounce * 0.5);
    ctx.beginPath();
    ctx.moveTo(-25, -6); ctx.bezierCurveTo(-34, 14, -30, 62, -18, 78);
    ctx.quadraticCurveTo(0, 88, 18, 78); ctx.bezierCurveTo(30, 62, 34, 14, 25, -6);
    ctx.closePath(); ctx.fillStyle = HAIR; ctx.fill();
    ctx.fillStyle = HAIR_LIGHT;
    ctx.beginPath(); ctx.moveTo(-20, 6); ctx.bezierCurveTo(-25, 34, -20, 62, -12, 72); ctx.lineTo(-7, 72);
    ctx.bezierCurveTo(-14, 44, -13, 20, -14, 4); ctx.closePath(); ctx.fill();
    ctx.restore();

    /* ноги */
    drawLeg(ctx, -11, hipY, pose, 'L', bottomColor, shoesColor);
    drawLeg(ctx, 11, hipY, pose, 'R', bottomColor, shoesColor);

    /* юбка / низ платья */
    ctx.save();
    ctx.translate(0, hipY - 12);
    ctx.rotate(pose.skirtSway * RAD);
    const hem = 66 + pose.skirtLift - pose.hemWave * 5;
    ctx.beginPath();
    ctx.moveTo(-20, -8); ctx.lineTo(20, -8);
    ctx.lineTo(33 + pose.hemWave * 4, hem);
    ctx.quadraticCurveTo(16, hem + 8 + pose.hemWave * 4, 0, hem + 2);
    ctx.quadraticCurveTo(-16, hem + 8 + pose.hemWave * 4, -33 - pose.hemWave * 4, hem);
    ctx.closePath();
    ctx.fillStyle = bottomColor; ctx.fill();
    ctx.strokeStyle = shade(bottomColor, -28); ctx.lineWidth = 1.4; ctx.stroke();
    /* складки */
    ctx.strokeStyle = shade(bottomColor, -18); ctx.lineWidth = 1;
    for (let i = -2; i <= 2; i++) line(ctx, i * 7, 4, i * 10, hem - 4, shade(bottomColor, -16), 1);
    ctx.restore();

    /* корпус */
    ctx.save();
    ctx.translate(0, hipY + pose.torsoY);
    ctx.rotate(lean * RAD);
    ctx.transform(1 - Math.abs(twist) / 90, 0, 0, 1, twist * 0.28, 0);
    /* талия + torso */
    ctx.beginPath();
    ctx.moveTo(-19, -6); ctx.lineTo(-22, -72); ctx.quadraticCurveTo(0, -84, 22, -72); ctx.lineTo(19, -6);
    ctx.closePath(); ctx.fillStyle = topColor; ctx.fill();
    ctx.strokeStyle = shade(topColor, -30); ctx.lineWidth = 1.4; ctx.stroke();
    /* воротник */
    ctx.beginPath(); ctx.moveTo(-11, -71); ctx.quadraticCurveTo(0, -60, 11, -71);
    ctx.strokeStyle = shade(topColor, 28); ctx.lineWidth = 3; ctx.stroke();
    /* верхняя одежда */
    if (outerColor) {
      ctx.beginPath();
      ctx.moveTo(-25, -4); ctx.lineTo(-27, -72); ctx.lineTo(-9, -76); ctx.lineTo(-4, -10);
      ctx.closePath(); ctx.fillStyle = outerColor; ctx.fill();
      ctx.beginPath();
      ctx.moveTo(25, -4); ctx.lineTo(27, -72); ctx.lineTo(9, -76); ctx.lineTo(4, -10);
      ctx.closePath(); ctx.fill();
    }
    /* шарф */
    if (o.accessory && o.accessory.id === 'scarf') {
      fillRR(ctx, -14, -76, 28, 9, 4, o.accessory.color);
      fillRR(ctx, 6, -72, 8, 34, 3, o.accessory.color);
    }
    /* сумка */
    if (o.accessory && o.accessory.id === 'bag') {
      fillRR(ctx, 18, -30, 20, 22, 6, o.accessory.color, shade(o.accessory.color, -25));
      line(ctx, 22, -30, 22, -58, shade(o.accessory.color, -30), 2);
    }
    /* руки */
    drawArm(ctx, -21, -70, pose, 'L', outerColor || topColor, skin);
    drawArm(ctx, 21, -70, pose, 'R', outerColor || topColor, skin);
    /* шея */
    fillRR(ctx, -6, -84, 12, 12, 4, SKIN_SHADE);

    /* голова */
    ctx.save();
    ctx.translate(pose.headTurn * 0.18, -98 + pose.headNod * 0.12);
    ctx.rotate(pose.headTilt * RAD);
    ctx.scale(1 - Math.abs(pose.headTurn) / 130, 1 - Math.abs(pose.headNod) / 260);
    /* лицо */
    ctx.beginPath(); ctx.ellipse(0, 0, 25, 28, 0, 0, Math.PI * 2);
    ctx.fillStyle = skin; ctx.fill(); ctx.strokeStyle = SKIN_SHADE; ctx.lineWidth = 1.2; ctx.stroke();
    /* уши */
    circle(ctx, -25, 2, 4.5, skin); circle(ctx, 25, 2, 4.5, skin);
    /* румянец */
    if (pose.blush > 0.05) {
      ctx.globalAlpha = Math.min(0.65, pose.blush * 0.6);
      circle(ctx, -14, 8, 6, '#e77e8e'); circle(ctx, 14, 8, 6, '#e77e8e');
      ctx.globalAlpha = 1;
    }
    /* глаза */
    const blink = Math.max(0, Math.min(1, pose.blink));
    const eyeH = Math.max(0.8, (7 + pose.eyeWide * 3) * (1 - blink * 0.92));
    const lx = pose.lookX * 3.2, ly = pose.lookY * 2.2;
    [-9.5, 9.5].forEach(function (ex) {
      ctx.beginPath(); ctx.ellipse(ex, -2, 4.6, eyeH, 0, 0, Math.PI * 2);
      ctx.fillStyle = '#fbf7ef'; ctx.fill();
      ctx.strokeStyle = INK; ctx.lineWidth = 1; ctx.stroke();
      if (blink < 0.7) {
        circle(ctx, ex + lx, -2 + ly, 2.5, '#3b3040');
        circle(ctx, ex + lx - 0.8, -3 + ly, 0.9, '#ffffff');
      }
      /* брови */
      line(ctx, ex - 5, -11 - pose.brow * 2.2, ex + 5, -11 + pose.brow * 2.2, HAIR, 2);
      /* ресницы */
      line(ctx, ex - 5, -8, ex - 6.5, -10, INK, 1.2);
    });
    /* очки */
    if (o.accessory && o.accessory.id === 'glasses') {
      ctx.strokeStyle = o.accessory.color; ctx.lineWidth = 2;
      rr(ctx, -15, -8, 12, 11, 4); ctx.stroke();
      rr(ctx, 3, -8, 12, 11, 4); ctx.stroke();
      line(ctx, -3, -3, 3, -3, o.accessory.color, 2);
    }
    /* нос */
    line(ctx, 0, 2, 1.5, 6, SKIN_SHADE, 1.5);
    /* рот */
    const smile = pose.smile, mouth = Math.round(pose.mouth || 0);
    ctx.strokeStyle = '#9b4f57'; ctx.lineWidth = 2; ctx.lineCap = 'round';
    if (mouth === 2 || mouth === 4 || mouth === 3 && smile < -0.3) {
      ctx.beginPath(); ctx.ellipse(0, 12, mouth === 4 ? 5 : 6, mouth === 4 ? 7 : 5, 0, 0, Math.PI * 2);
      ctx.fillStyle = '#8c4350'; ctx.fill();
      ctx.beginPath(); ctx.ellipse(0, 14, 3, 2, 0, 0, Math.PI * 2); ctx.fillStyle = '#d9777f'; ctx.fill();
    } else {
      ctx.beginPath(); ctx.moveTo(-7, 11);
      ctx.quadraticCurveTo(0, 11 + smile * 7 + (mouth === 3 ? -4 : 0), 7, 11);
      ctx.stroke();
    }
    /* чёлка и передние пряди */
    ctx.beginPath();
    ctx.moveTo(-25, -3); ctx.bezierCurveTo(-27, -30, -8, -33, 0, -26);
    ctx.bezierCurveTo(12, -34, 26, -27, 25, -3);
    ctx.bezierCurveTo(18, -13, 10, -12, 5, -19);
    ctx.bezierCurveTo(-2, -10, -12, -10, -25, -3);
    ctx.closePath(); ctx.fillStyle = HAIR; ctx.fill();
    ctx.beginPath(); ctx.moveTo(-23, -2); ctx.bezierCurveTo(-28, 20, -25, 48, -17, 58);
    ctx.lineTo(-10, 54); ctx.bezierCurveTo(-18, 34, -18, 12, -16, -4); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(23, -2); ctx.bezierCurveTo(28, 20, 25, 48, 17, 58);
    ctx.lineTo(10, 54); ctx.bezierCurveTo(18, 34, 18, 12, 16, -4); ctx.closePath(); ctx.fill();
    ctx.fillStyle = HAIR_LIGHT;
    ctx.beginPath(); ctx.moveTo(-18, -20); ctx.quadraticCurveTo(-6, -27, 2, -21);
    ctx.quadraticCurveTo(-7, -22, -18, -17); ctx.closePath(); ctx.fill();
    /* головной убор */
    if (o.head) {
      const hc = o.head.color;
      if (o.head.id === 'cap') {
        ctx.beginPath(); ctx.ellipse(0, -20, 26, 15, 0, Math.PI, Math.PI * 2); ctx.fillStyle = hc; ctx.fill();
        fillRR(ctx, 4, -22, 24, 5, 3, hc);
      } else {
        ctx.beginPath(); ctx.arc(0, -14, 26, Math.PI * 1.05, Math.PI * 1.95);
        ctx.strokeStyle = hc; ctx.lineWidth = 6; ctx.stroke();
      }
    }
    ctx.restore();
    ctx.restore(); /* корпус */

    /* сон: Zzz (координаты уже relative to root of the girl) */
    if (sleeping) {
      ctx.save();
      ctx.fillStyle = 'rgba(242,236,223,.85)';
      const t = state.minutes / 4;
      for (let i = 0; i < 3; i++) {
        ctx.globalAlpha = 0.35 + 0.55 * Math.abs(Math.sin(t + i));
        ctx.font = '700 ' + (13 + i * 5) + 'px system-ui';
        ctx.fillText('z', 28 + i * 14 + Math.sin(t + i) * 5, -205 - i * 22 - (t * 6 + i * 15) % 26);
      }
      ctx.restore();
    }
    ctx.restore();
  }

  /* --- подпись действия и часы --------------------------------------------- */
  function drawOverlay(ctx, w, h, state) {
    const loc = data.findLocation(state.location);
    ctx.textAlign = 'center';
    const bw = Math.min(560, w - 40);
    fillRR(ctx, w / 2 - bw / 2, h * 0.892, bw, 48, 12, 'rgba(10,14,18,.66)', 'rgba(255,255,255,.08)');
    ctx.font = '700 13px system-ui, sans-serif';
    ctx.fillStyle = 'rgba(242,236,223,.96)';
    const label = state.action ? state.action.label : 'думает, чем заняться';
    ctx.fillText('ДЕНЬ ' + state.day + ' · ' + NIKA.world.clock(state) + ' · ' + (loc ? loc.name : 'дом') + ' · ' + label, w / 2, h * 0.892 + 20);
    ctx.font = '11px system-ui, sans-serif';
    ctx.fillStyle = 'rgba(242,236,223,.65)';
    ctx.fillText(state.autonomy ? '◆ автономный ИИ включён — Ника живёт сама' : '◆ ждёт только твоих команд', w / 2, h * 0.892 + 38);
  }

  function render(ctx, canvas, state, pose, dpr) {
    dpr = dpr || state.dpr || 1;
    const w = canvas.width / dpr, h = canvas.height / dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    drawRoom(ctx, w, h, state);
    const S = Math.max(0.62, Math.min(1.42, h / 470));
    const groundY = h * (w < 760 ? 0.74 : 0.83);
    const sleeping = !!(state.action && state.action.intent === 'sleep');
    if (sleeping) drawSleeping(ctx, w, h, state);
    else drawGirl(ctx, state.x * w, groundY, S, pose, state.outfit, state);
    drawOverlay(ctx, w, h, state);
  }

  NIKA.rig = { render: render, drawGirl: drawGirl, drawRoom: drawRoom, shade: shade };
})(typeof globalThis !== 'undefined' ? globalThis : this);
