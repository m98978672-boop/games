/* ============================================================
   БАЗА — отрисовка (render.js): canvas на весь экран.
   «Ручная красота»: туманности, тёплый «фонарь» за курсором,
   светлячки с крылышками и покачиванием, pop при появлении,
   рукописный баннер в начале раунда, зерно и виньетка.
   ============================================================ */
(function () {
  const HAND_FONT = '"Segoe Script", "Bradley Hand", "Apple Chancery", "Comic Sans MS", cursive';

  function easeOutBack(t) {
    const c1 = 1.70158, c3 = c1 + 1;
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
  }

  const render = {
    canvas: null,
    ctx: null,
    w: 0,
    h: 0,
    dpr: 1,
    stars: [],
    nebulae: [],
    grain: null,
    mouse: null, // {x, y} — за ним тянется тёплый свет

    init(canvas) {
      render.canvas = canvas;
      render.ctx = canvas.getContext('2d');
      render.makeGrain();
      render.resize();
      window.addEventListener('resize', () => render.resize());
      window.addEventListener('pointermove', (e) => {
        render.mouse = { x: e.clientX, y: e.clientY };
      });
    },

    // маленькая канвка с шумом -> паттерн «зерна»
    makeGrain() {
      const nc = document.createElement('canvas');
      nc.width = nc.height = 140;
      const nctx = nc.getContext('2d');
      const img = nctx.createImageData(140, 140);
      for (let i = 0; i < img.data.length; i += 4) {
        img.data[i] = 255;
        img.data[i + 1] = 238;
        img.data[i + 2] = 205;
        img.data[i + 3] = Math.random() < 0.55 ? 0 : 13;
      }
      nctx.putImageData(img, 0, 0);
      render.grain = render.ctx.createPattern(nc, 'repeat');
    },

    resize() {
      const c = render.canvas;
      if (!c) return;
      render.dpr = Math.min(window.devicePixelRatio || 1, 2);
      render.w = window.innerWidth;
      render.h = window.innerHeight;
      c.width = Math.floor(render.w * render.dpr);
      c.height = Math.floor(render.h * render.dpr);
      render.ctx.setTransform(render.dpr, 0, 0, render.dpr, 0, 0);
      render.makeStars();
      render.makeNebulae();
      if (!render.mouse) render.mouse = { x: render.w / 2, y: render.h / 2 };
    },

    makeStars() {
      render.stars = [];
      const n = Math.min(150, Math.round(render.w * render.h / 11000));
      for (let i = 0; i < n; i++) {
        render.stars.push({
          x: Math.random() * render.w,
          y: Math.random() * render.h,
          r: 0.4 + Math.random() * 1.2,
          a: 0.08 + Math.random() * 0.3,
          s: 0.3 + Math.random() * 0.9,
        });
      }
    },

    // мягкие цветные пятна-туманности (медленно дрейфуют)
    makeNebulae() {
      const defs = [
        { x: 0.18, y: 0.28, r: 0.42, c: '226, 162, 79', a: 0.055 },
        { x: 0.82, y: 0.22, r: 0.36, c: '126, 112, 204', a: 0.05 },
        { x: 0.62, y: 0.85, r: 0.5, c: '74, 158, 148', a: 0.045 },
        { x: 0.35, y: 0.65, r: 0.3, c: '204, 112, 120', a: 0.04 },
      ];
      render.nebulae = defs.map((d, i) => ({ ...d, ph: i * 1.7 }));
    },

    draw(nowMs) {
      const { ctx, w, h } = render;
      if (!ctx) return;
      const s = GB.game.state;
      const t = nowMs / 1000;
      const accent = GB.CONFIG.accent;
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      // --- фон: тёплое тёмное небо ---
      const bg = ctx.createLinearGradient(0, 0, 0, h);
      bg.addColorStop(0, '#0e120e');
      bg.addColorStop(0.6, '#0b0d0c');
      bg.addColorStop(1, '#080908');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);

      // --- туманности ---
      const R = Math.max(w, h);
      for (const nb of render.nebulae) {
        const nx = (nb.x + (reduced ? 0 : Math.sin(t * 0.05 + nb.ph) * 0.02)) * w;
        const ny = (nb.y + (reduced ? 0 : Math.cos(t * 0.04 + nb.ph) * 0.02)) * h;
        const nr = nb.r * R;
        const g = ctx.createRadialGradient(nx, ny, 0, nx, ny, nr);
        g.addColorStop(0, `rgba(${nb.c}, ${nb.a})`);
        g.addColorStop(1, `rgba(${nb.c}, 0)`);
        ctx.fillStyle = g;
        ctx.fillRect(nx - nr, ny - nr, nr * 2, nr * 2);
      }

      // --- звёзды ---
      for (const st of render.stars) {
        const tw = reduced ? 1 : 0.65 + Math.sin(t * 2 * st.s + st.x) * 0.35;
        ctx.globalAlpha = st.a * tw;
        ctx.fillStyle = '#e6ecff';
        ctx.beginPath();
        ctx.arc(st.x, st.y, st.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      // --- «фонарь» за курсором ---
      if (render.mouse) {
        const m = render.mouse;
        const lr = 200;
        const lg = ctx.createRadialGradient(m.x, m.y, 0, m.x, m.y, lr);
        lg.addColorStop(0, 'rgba(255, 205, 130, 0.10)');
        lg.addColorStop(0.6, 'rgba(255, 195, 115, 0.04)');
        lg.addColorStop(1, 'rgba(255, 195, 115, 0)');
        ctx.fillStyle = lg;
        ctx.fillRect(m.x - lr, m.y - lr, lr * 2, lr * 2);
      }

      if (!s) { render.finishFx(); return; }

      // --- светлячки: свечение + крылышки + тельце, с покачиванием и pop ---
      for (const f of s.flies) {
        const fadeIn = Math.min(1, f.age / 220);
        const fadeOut = Math.min(1, (f.ttl - f.age) / 1100);
        const alpha = Math.min(fadeIn, fadeOut);
        if (alpha <= 0) continue;
        const pulse = reduced ? 1 : 0.82 + Math.sin(t * 5 + f.x * 0.05) * 0.18;
        const pop = reduced ? 1 : easeOutBack(Math.min(1, f.age / 240));
        const r = f.r * (0.9 + pulse * 0.1) * pop;
        // «живое» покачивание вокруг логической позиции
        const wx = reduced ? 0 : Math.sin(t * 2.6 + f.phase) * 4;
        const wy = reduced ? 0 : Math.cos(t * 2.1 + f.phase) * 3;
        const fx = f.x + wx, fy = f.y + wy;
        // свечение чуть смещено
        const gx = fx + (reduced ? 0 : Math.sin(t * 1.7 + f.y) * 2.5);
        const gy = fy + (reduced ? 0 : Math.cos(t * 1.3 + f.x) * 2);

        const glow = ctx.createRadialGradient(gx, gy, 0, gx, gy, r * 3.4);
        glow.addColorStop(0, hexA(accent, 0.5 * alpha * pulse));
        glow.addColorStop(0.4, hexA(accent, 0.16 * alpha * pulse));
        glow.addColorStop(1, hexA(accent, 0));
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(gx, gy, r * 3.4, 0, Math.PI * 2);
        ctx.fill();

        // крылышки: два овала, быстро мерцают
        if (!reduced) {
          const flap = Math.abs(Math.sin(t * 26 + f.x * 0.7));
          ctx.fillStyle = hexA('#fff3d6', 0.34 * alpha * (0.3 + flap * 0.7));
          const wa = r * (0.9 + flap * 0.5);
          ctx.beginPath();
          ctx.ellipse(fx - r * 0.75, fy - r * 0.35, wa, r * 0.42, -0.6, 0, Math.PI * 2);
          ctx.ellipse(fx + r * 0.75, fy - r * 0.35, wa, r * 0.42, 0.6, 0, Math.PI * 2);
          ctx.fill();
        }

        // тельце — чуть вытянутый овал
        ctx.save();
        ctx.translate(fx, fy);
        ctx.rotate(reduced ? 0 : Math.sin(t * 2 + f.x * 0.1) * 0.25);
        const core = ctx.createRadialGradient(0, 0, 0, 0, 0, r);
        core.addColorStop(0, `rgba(255, 247, 226, ${0.95 * alpha})`);
        core.addColorStop(0.55, hexA('#ffd98a', 0.85 * alpha * pulse));
        core.addColorStop(1, hexA(accent, 0.9 * alpha * pulse));
        ctx.fillStyle = core;
        ctx.beginPath();
        ctx.ellipse(0, 0, r, r * 0.86, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // --- частицы-искры ---
      for (const p of s.particles) {
        const a = 1 - p.age / p.ttl;
        ctx.globalAlpha = a;
        ctx.fillStyle = hexA('#ffd98a', 0.9);
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * a + 0.4, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      if (s.over) {
        ctx.fillStyle = 'rgba(6, 7, 5, 0.45)';
        ctx.fillRect(0, 0, w, h);
      }

      // --- рукописный баннер в начале раунда ---
      if (s.bannerUntil && nowMs < s.bannerUntil) {
        const total = 2600;
        const left = s.bannerUntil - nowMs;
        const k = 1 - left / total; // 0 → 1
        const aIn = Math.min(1, k / 0.15);
        const aOut = Math.min(1, left / (total * 0.45));
        const a = Math.min(aIn, aOut);
        const sc = reduced ? 1 : easeOutBack(Math.min(1, k / 0.35));
        ctx.save();
        ctx.translate(w / 2, h * 0.36);
        ctx.rotate(-0.03);
        ctx.scale(sc, sc);
        ctx.globalAlpha = a;
        ctx.font = `700 ${Math.round(Math.min(84, w * 0.09))}px ${HAND_FONT}`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.shadowColor = 'rgba(255, 207, 125, 0.55)';
        ctx.shadowBlur = 34;
        ctx.fillStyle = '#ffcf7d';
        ctx.fillText(s.bannerText || 'Лови!', 0, 0);
        ctx.restore();
        ctx.globalAlpha = 1;
      }

      render.finishFx();
    },

    // виньетка + зерно поверх всей сцены
    finishFx() {
      const { ctx, w, h } = render;
      const vg = ctx.createRadialGradient(
        w / 2, h / 2, Math.min(w, h) * 0.35,
        w / 2, h / 2, Math.max(w, h) * 0.78
      );
      vg.addColorStop(0, 'rgba(0,0,0,0)');
      vg.addColorStop(1, 'rgba(5, 4, 2, 0.42)');
      ctx.fillStyle = vg;
      ctx.fillRect(0, 0, w, h);
      if (render.grain) {
        ctx.globalAlpha = 0.55;
        ctx.fillStyle = render.grain;
        ctx.fillRect(0, 0, w, h);
        ctx.globalAlpha = 1;
      }
    },
  };

  // '#rrggbb' + alpha -> 'rgba(...)'
  function hexA(hex, a) {
    const n = parseInt(hex.slice(1), 16);
    return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${Math.max(0, Math.min(1, a))})`;
  }

  GB.render = render;
})();
