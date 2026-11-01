/* ============================================================
   БАЗА — отрисовка (render.js): canvas на весь экран.
   «Ручная» подача: светлячки с мерцающими крылышками,
   лёгкое плёночное зерно и тёплая виньетка поверх сцены.
   ============================================================ */
(function () {
  const render = {
    canvas: null,
    ctx: null,
    w: 0,
    h: 0,
    dpr: 1,
    stars: [],
    grain: null,

    init(canvas) {
      render.canvas = canvas;
      render.ctx = canvas.getContext('2d');
      render.makeGrain();
      render.resize();
      window.addEventListener('resize', () => render.resize());
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

      if (!s) { render.finishFx(); return; }

      // --- светлячки: свечение + крылышки + тельце ---
      for (const f of s.flies) {
        const fadeIn = Math.min(1, f.age / 220);
        const fadeOut = Math.min(1, (f.ttl - f.age) / 1100);
        const alpha = Math.min(fadeIn, fadeOut);
        if (alpha <= 0) continue;
        const pulse = reduced ? 1 : 0.82 + Math.sin(t * 5 + f.x * 0.05) * 0.18;
        const r = f.r * (0.9 + pulse * 0.1);
        // свечение чуть смещено — «живое», не идеально по центру
        const gx = f.x + (reduced ? 0 : Math.sin(t * 1.7 + f.y) * 2.5);
        const gy = f.y + (reduced ? 0 : Math.cos(t * 1.3 + f.x) * 2);

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
          ctx.ellipse(f.x - r * 0.75, f.y - r * 0.35, wa, r * 0.42, -0.6, 0, Math.PI * 2);
          ctx.ellipse(f.x + r * 0.75, f.y - r * 0.35, wa, r * 0.42, 0.6, 0, Math.PI * 2);
          ctx.fill();
        }

        // тельце — чуть вытянутый овал, а не идеальный круг
        ctx.save();
        ctx.translate(f.x, f.y);
        ctx.rotate(Math.sin(t * 2 + f.x * 0.1) * 0.25);
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
