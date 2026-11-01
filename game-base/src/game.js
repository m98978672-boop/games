/* ============================================================
   БАЗА — игровая логика (game.js).
   Мини-игра «Светлячки»: светлячки появляются на поле, медленно
   дрейфуют и гаснут. Клик по светлячку ловит его: +очки × комбо.
   Промах или упущенный светлячок сбрасывают комбо.
   Весь остальной «каркас» (HUD, рендер, звук) от этой логики не зависит.
   ============================================================ */
(function () {
  const C = () => GB.CONFIG;
  const U = () => GB.util;

  const game = {
    state: null,

    newRound() {
      game.state = {
        running: true,       // идёт раунд
        paused: false,
        over: false,
        score: 0,
        combo: 1,
        comboLeftMs: 0,      // сколько осталось окну комбо
        timeLeftMs: C().roundSeconds * 1000,
        flies: [],           // {x,y,vx,vy,r,age,ttl}
        particles: [],       // {x,y,vx,vy,age,ttl,r}
        caught: 0,
        missed: 0,
        spawnInMs: 500,      // первый светлячок появится быстро
        best: (GB.save.load().best || 0),
        isNewRecord: false,
      };
      return game.state;
    },

    togglePause(force) {
      const s = game.state;
      if (!s || s.over) return;
      const next = typeof force === 'boolean' ? force : !s.paused;
      if (next === s.paused) return;
      s.paused = next;
      GB.audio.play('pause');
      GB.ui.setPauseFlag(next);
    },

    restart() {
      game.newRound();
      GB.ui.closeModal();
      GB.ui.renderSide();
      GB.ui.setHint('Кликай по светлячкам, пока они не погасли!');
      GB.ui.setNews('');
    },

    spawnFly(w, h) {
      const c = C(), u = U();
      const m = 40; // отступ от краёв и HUD
      const s = game.state;
      s.flies.push({
        x: u.rand(m, Math.max(m + 1, w - m)),
        y: u.rand(90, Math.max(91, h - m)),
        vx: u.rand(-14, 14),
        vy: u.rand(-10, 10),
        r: u.rand(c.flyRMin, c.flyRMax),
        age: 0,
        ttl: u.rand(c.flyTtlMinMs, c.flyTtlMaxMs),
      });
    },

    burst(x, y, big) {
      const u = U();
      const n = big ? 16 : 10;
      for (let i = 0; i < n; i++) {
        const a = u.rand(0, Math.PI * 2);
        const sp = u.rand(40, big ? 190 : 130);
        game.state.particles.push({
          x, y,
          vx: Math.cos(a) * sp,
          vy: Math.sin(a) * sp - 30,
          age: 0,
          ttl: u.rand(380, 750),
          r: u.rand(1.5, 3.4),
        });
      }
    },

    // клик по полю: ловим верхнего светлячка под курсором
    click(x, y) {
      const s = game.state;
      if (!s || !s.running || s.paused || s.over) return false;
      const c = C();
      for (let i = s.flies.length - 1; i >= 0; i--) {
        const f = s.flies[i];
        const dx = x - f.x, dy = y - f.y;
        if (dx * dx + dy * dy <= (f.r + c.hitGrace) * (f.r + c.hitGrace)) {
          s.flies.splice(i, 1);
          const pts = c.pointsBase * s.combo;
          s.score += pts;
          s.caught++;
          s.combo = Math.min(c.comboMax, s.combo + 1);
          s.comboLeftMs = c.comboWindowMs;
          game.burst(f.x, f.y, s.combo >= 5);
          GB.audio.play('catch');
          GB.ui.flashCombo();
          GB.ui.setNews(`+${pts} · комбо ×${Math.min(s.combo, c.comboMax)}`);
          return true;
        }
      }
      // промах: комбо сгорает
      if (s.combo > 1) {
        s.combo = 1;
        s.comboLeftMs = 0;
        GB.audio.play('miss');
        GB.ui.setNews('Промах — комбо сгорело');
      } else {
        GB.audio.play('miss');
      }
      return false;
    },

    endRound() {
      const s = game.state;
      s.over = true;
      s.running = false;
      const prevBest = s.best || 0;
      s.isNewRecord = s.score > prevBest;
      if (s.isNewRecord) s.best = s.score;
      GB.save.write({ best: s.best, totalCaught: (GB.save.load().totalCaught || 0) + s.caught, muted: GB.audio.isMuted() });
      GB.audio.play(s.isNewRecord ? 'record' : 'end');
      GB.ui.onRoundEnd(s, prevBest);
    },

    update(dtMs, w, h) {
      const s = game.state;
      if (!s || !s.running || s.paused) return;
      const c = C(), u = U();

      // таймер раунда
      s.timeLeftMs -= dtMs;
      if (s.timeLeftMs <= 0) {
        s.timeLeftMs = 0;
        game.endRound();
        return;
      }

      // спавн светлячков (чуть чаще к концу раунда)
      const progress = 1 - s.timeLeftMs / (c.roundSeconds * 1000);
      s.spawnInMs -= dtMs;
      if (s.spawnInMs <= 0 && s.flies.length < c.maxFlies) {
        game.spawnFly(w, h);
        const k = 1 - progress * 0.35;
        s.spawnInMs = u.rand(c.spawnMinMs, c.spawnMaxMs) * k;
      }

      // движение и старение светлячков
      for (let i = s.flies.length - 1; i >= 0; i--) {
        const f = s.flies[i];
        f.age += dtMs;
        f.x += f.vx * dtMs / 1000;
        f.y += f.vy * dtMs / 1000;
        // мягко отталкиваемся от краёв
        if (f.x < f.r) { f.x = f.r; f.vx = Math.abs(f.vx); }
        if (f.x > w - f.r) { f.x = w - f.r; f.vx = -Math.abs(f.vx); }
        if (f.y < 90 + f.r) { f.y = 90 + f.r; f.vy = Math.abs(f.vy); }
        if (f.y > h - f.r - 10) { f.y = h - f.r - 10; f.vy = -Math.abs(f.vy); }
        if (f.age >= f.ttl) {
          s.flies.splice(i, 1);
          s.missed++;
          if (s.combo > 1) { s.combo = 1; s.comboLeftMs = 0; }
          GB.audio.play('expire');
          GB.ui.setNews('Светлячок улетел…');
        }
      }

      // окно комбо
      if (s.comboLeftMs > 0) {
        s.comboLeftMs -= dtMs;
        if (s.comboLeftMs <= 0) { s.combo = 1; s.comboLeftMs = 0; }
      }

      // частицы
      for (let i = s.particles.length - 1; i >= 0; i--) {
        const p = s.particles[i];
        p.age += dtMs;
        p.x += p.vx * dtMs / 1000;
        p.y += p.vy * dtMs / 1000;
        p.vy += 160 * dtMs / 1000;
        if (p.age >= p.ttl) s.particles.splice(i, 1);
      }
    },
  };

  GB.game = game;
})();
