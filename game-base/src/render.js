/* ============================================================
   БАЗА — отрисовка (render.js): canvas на весь экран.
   Тёмный фон + звёзды + светящиеся светлячки + частицы.
   ============================================================ */
(function () {
  const render = {
    canvas: null,
    ctx: null,
    w: 0,
    h: 0,
    dpr: 1,
    stars: [],

    init(canvas) {
      render.canvas = canvas;
      render.ctx = canvas.getContext('2d');
      render.resize();
      window.addEventListener('resize', () => render.resize());
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

      // --- фон: тёмное небо с едва заметным свечением сверху ---
      const bg = ctx.createLinearGradient(0, 0, 0, h);
      bg.addColorStop(0, '#0d1210');
      bg.addColorStop(0.6, '#0b0d0c');
      bg.addColorStop(1, '#080a09');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);

      // --- звёзды ---
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      for (const st of render.stars) {
        const tw = reduced ? 1 : 0.65 + Math.sin(t * 2 * st.s + st.x) * 0.35;
        ctx.globalAlpha = st.a * tw;
        ctx.fillStyle = '#dfe9ff';
        ctx.beginPath();
        ctx.arc(st.x, st.y, st.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      if (!s) return;

      // --- светлячки ---
      for (const f of s.flies) {
        const fadeIn = Math.min(1, f.age / 220);
        const fadeOut = Math.min(1, (f.ttl - f.age) / 1100);
        const alpha = Math.min(fadeIn, fadeOut);
        if (alpha <= 0) continue;
        const pulse = reduced ? 1 : 0.82 + Math.sin(t * 5 + f.x * 0.05) * 0.18;
        const r = f.r * (0.9 + pulse * 0.1);

        // свечение
        const glow = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, r * 3.4);
        glow.addColorStop(0, hexA(accent, 0.5 * alpha * pulse));
        glow.addColorStop(0.4, hexA(accent, 0.16 * alpha * pulse));
        glow.addColorStop(1, hexA(accent, 0));
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(f.x, f.y, r * 3.4, 0, Math.PI * 2);
        ctx.fill();

        // ядро
        const core = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, r);
        core.addColorStop(0, `rgba(255, 246, 224, ${0.95 * alpha})`);
        core.addColorStop(0.55, hexA('#ffd98a', 0.85 * alpha * pulse));
        core.addColorStop(1, hexA(accent, 0.9 * alpha * pulse));
        ctx.fillStyle = core;
        ctx.beginPath();
        ctx.arc(f.x, f.y, r, 0, Math.PI * 2);
        ctx.fill();
      }

      // --- частицы (искры пойманного светлячка) ---
      for (const p of s.particles) {
        const a = 1 - p.age / p.ttl;
        ctx.globalAlpha = a;
        ctx.fillStyle = hexA('#ffd98a', 0.9);
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * a + 0.4, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      // --- затемнение, когда раунд окончен ---
      if (s.over) {
        ctx.fillStyle = 'rgba(6, 8, 7, 0.45)';
        ctx.fillRect(0, 0, w, h);
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
