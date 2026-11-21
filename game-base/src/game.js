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

    /* Режимы мини-игры. Один и тот же каркас (HUD, рендер, звук, сохранения)
       держит три разные механики — это и есть смысл БАЗЫ как шаблона. */
    MODES: {
      fireflies: {
        title: 'Светлячки',
        hint: 'Лови светлячков!',
        note: 'Светлячки дрейфуют и гаснут. Клик по светлячку — очко.',
      },
      stars: {
        title: 'Падающие звёзды',
        hint: 'Лови падающие звёзды!',
        note: 'Звёзды падают вниз быстрее светлячков: успей кликнуть, пока не ушли за край.',
      },
      shadow: {
        title: 'Поймай тень',
        hint: 'Поймай тень — она убегает от курсора!',
        note: 'Тень сама уходит от прицела. Загоняй её в угол — так интереснее.',
      },
    },

    newRound(modeId) {
      const mode = game.MODES[modeId] ? modeId : (GB.save.load().mode || 'fireflies');
      try { localStorage.setItem('gb-base-mode', mode); } catch (e) { /* приватный режим */ }
      const saved = GB.save.load();
      game.state = {
        mode,
        running: true,       // идёт раунд
        paused: false,
        over: false,
        score: 0,
        streak: 0,           // серия попаданий без промаха
        bestStreak: saved.bestStreak || 0,
        dailyGoal: 60,       // сколько светлячков поймать за сегодня
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
        bannerUntil: performance.now() + 2600, // рукописный баннер в начале раунда
        bannerText: game.MODES[mode].hint,
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
      GB.ui.setHint('Ну что, погнали? Лови светлячков!');
      GB.ui.setNews('');
    },

    spawnFly(w, h) {
      const c = C(), u = U();
      const m = 40; // отступ от краёв и HUD
      const s = game.state;
      const mode = s.mode || 'fireflies';

      if (mode === 'stars') {
        // Звезда входит сверху и падает вниз: успевай кликнуть.
        const speed = u.rand(120, 190) * (1 + (1 - s.timeLeftMs / (c.roundSeconds * 1000)) * 0.5);
        s.flies.push({
          x: u.rand(m, Math.max(m + 1, w - m)),
          y: u.rand(90, 120),
          vx: u.rand(-35, 35),
          vy: speed,
          r: u.rand(c.flyRMin, c.flyRMax) * 0.9,
          age: 0,
          ttl: Math.max(1400, ((h - 120) / speed) * 1000),
          phase: u.rand(0, Math.PI * 2),
        });
        return;
      }

      if (mode === 'shadow') {
        // Тень медленно крадётся, но убегает от курсора — её надо загнать.
        s.flies.push({
          x: u.rand(m, Math.max(m + 1, w - m)),
          y: u.rand(90, Math.max(91, h - m)),
          vx: u.rand(-26, 26),
          vy: u.rand(-20, 20),
          r: u.rand(c.flyRMin, c.flyRMax) * 1.15,
          age: 0,
          ttl: u.rand(c.flyTtlMinMs, c.flyTtlMaxMs) * 1.6,
          phase: u.rand(0, Math.PI * 2),
        });
        return;
      }

      s.flies.push({
        x: u.rand(m, Math.max(m + 1, w - m)),
        y: u.rand(90, Math.max(91, h - m)),
        vx: u.rand(-14, 14),
        vy: u.rand(-10, 10),
        r: u.rand(c.flyRMin, c.flyRMax),
        age: 0,
        ttl: u.rand(c.flyTtlMinMs, c.flyTtlMaxMs),
        phase: u.rand(0, Math.PI * 2), // фаза покачивания
      });
    },

    // Тень убегает от указателя: чем ближе курсор, тем сильнее рывок.
    dodgeShadows(px, py, w, h) {
      const s = game.state;
      if (!s || s.mode !== 'shadow') return;
      for (const f of s.flies) {
        const dx = f.x - px, dy = f.y - py;
        const d2 = dx * dx + dy * dy;
        const radius = f.r + 120;
        if (d2 > radius * radius || d2 < 0.01) continue;
        const d = Math.sqrt(d2);
        const push = (1 - d / radius) * 900 * 0.016;
        f.vx += (dx / d) * push;
        f.vy += (dy / d) * push;
        // не даём разогнаться до телепорта
        const cap = 170;
        const sp = Math.hypot(f.vx, f.vy);
        if (sp > cap) { f.vx = (f.vx / sp) * cap; f.vy = (f.vy / sp) * cap; }
      }
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
          s.streak += 1;
          if (s.streak > s.bestStreak) s.bestStreak = s.streak;
          s.combo = Math.min(c.comboMax, s.combo + 1);
          s.comboLeftMs = c.comboWindowMs;
          game.burst(f.x, f.y, s.combo >= 5);
          GB.audio.play('catch');
          GB.ui.flashCombo();
          const maxed = s.combo >= c.comboMax;
          GB.ui.setNews(maxed ? `+${pts} · МАКС комбо ×${c.comboMax}!` : `+${pts} · комбо ×${s.combo}`);
          return true;
        }
      }
      // промах: комбо сгорает, серия начинается заново
      s.streak = 0;
      if (s.combo > 1) {
        s.combo = 1;
        s.comboLeftMs = 0;
        GB.audio.play('miss');
        GB.ui.setNews('Упс, промах — комбо сгорело…');
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
      const prevSave = GB.save.load();
      GB.save.write({
        best: s.best,
        totalCaught: (prevSave.totalCaught || 0) + s.caught,
        bestStreak: Math.max(prevSave.bestStreak || 0, s.bestStreak || 0),
        muted: GB.audio.isMuted(),
        mode: s.mode,
      });
      GB.audio.play(s.isNewRecord ? 'record' : 'end');
      GB.ui.onRoundEnd(s, prevBest);
    },

    update(dtMs, w, h) {
      const s = game.state;
      if (!s || !s.running || s.paused) return;
      // NaN и отрицательный шаг приходят из requestAnimationFrame после
      // сворачивания вкладки. NaN <= 0 — ложь, поэтому без этой проверки
      // таймер раунда превращался в NaN и раунд шёл вечно.
      if (!Number.isFinite(dtMs) || dtMs <= 0) return;
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
        // У тени рывки от курсора затухают — иначе она улетает за экран.
        if (s.mode === 'shadow') { f.vx *= 0.985; f.vy *= 0.985; }
        // мягко отталкиваемся от краёв
        if (f.x < f.r) { f.x = f.r; f.vx = Math.abs(f.vx); }
        if (f.x > w - f.r) { f.x = w - f.r; f.vx = -Math.abs(f.vx); }
        if (f.y < 90 + f.r) { f.y = 90 + f.r; f.vy = Math.abs(f.vy); }
        if (s.mode === 'stars') {
          // Падающая звезда не отскакивает: ушла за нижний край — потеряна.
          if (f.y > h - f.r) {
            s.flies.splice(i, 1);
            s.missed++;
            s.streak = 0;
            if (s.combo > 1) { s.combo = 1; s.comboLeftMs = 0; }
            GB.audio.play('expire');
            GB.ui.setNews('Звезда упала за край…');
            continue;
          }
        } else if (f.y > h - f.r - 10) { f.y = h - f.r - 10; f.vy = -Math.abs(f.vy); }
        if (f.age >= f.ttl) {
          s.flies.splice(i, 1);
          s.missed++;
          if (s.combo > 1) { s.combo = 1; s.comboLeftMs = 0; }
          GB.audio.play('expire');
          GB.ui.setNews('Светлячок сбежал…');
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
