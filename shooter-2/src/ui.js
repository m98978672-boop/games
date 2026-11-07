/* =============================================================================
   СЕКТОР «ПЕПЕЛ» — интерфейс: меню, брифинг, HUD, пауза, результаты, лаборатория
   -----------------------------------------------------------------------------
   Никаких библиотек: только DOM и canvas. Лаборатория анимаций позволяет
   выбрать любую из 22 частей, любую из 20 анимаций и любой из 4 вариантов —
   то есть увидеть все 1760 клипов вживую.
   ============================================================================= */
(function (root) {
  'use strict';
  const SH2 = (root.SH2 = root.SH2 || {});
  const D = SH2.data;
  const $ = (id) => document.getElementById(id);
  const el = (tag, cls, text) => {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text !== undefined) e.textContent = text;
    return e;
  };

  class UI {
    constructor() {
      this.game = null;
      this.helpOpen = false;
      this.debugOpen = true;
      this.screens = {
        menu: $('scr-menu'),
        brief: $('scr-brief'),
        pause: $('scr-pause'),
        death: $('scr-death'),
        win: $('scr-win'),
        lab: $('scr-lab'),
        settings: $('scr-settings')
      };
      this.hud = $('hud');
      this.buildLab();
      this.buildSettings();
      this.bindButtons();
      this.toastTimer = 0;
      this.damageTimer = 0;
      this.killFeedItems = [];
      this.damageNumbers = [];
    }

    /* ------------------------------- утилиты ------------------------------ */
    show(name) {
      Object.keys(this.screens).forEach((k) => {
        const s = this.screens[k];
        if (!s) return;
        s.classList.toggle('active', k === name);
      });
      if (this.hud) this.hud.classList.toggle('hidden', name !== null && name !== 'hud');
    }
    hideAll() {
      Object.keys(this.screens).forEach((k) => {
        const s = this.screens[k];
        if (s) s.classList.remove('active');
      });
      if (this.hud) this.hud.classList.remove('hidden');
    }

    bindGame(game) {
      this.game = game;
      this.loadProgress();
      this.refreshMenuStats();
    }

    /* ------------------------------ прогресс ------------------------------ */
    loadProgress() {
      let p = null;
      try { p = JSON.parse(localStorage.getItem('shooter2.progress') || 'null'); } catch (e) { p = null; }
      this.progress = p && typeof p === 'object' ? p : { unlocked: 0, best: {}, total: 0 };
      if (!this.progress.best) this.progress.best = {};
      if (!Array.isArray(this.progress.unlocked)) this.progress.unlocked = 0;
    }

    saveProgress() {
      try { localStorage.setItem('shooter2.progress', JSON.stringify(this.progress)); } catch (e) {}
    }

    unlockMission(i) {
      if (i > this.progress.unlocked) {
        this.progress.unlocked = i;
        this.saveProgress();
      }
    }

    recordMission(m, stats) {
      const prev = this.progress.best[m.id] || 0;
      if (stats && stats.score > prev) {
        this.progress.best[m.id] = stats.score;
        this.saveProgress();
      }
      this.progress.total = (this.progress.total || 0) + (stats ? stats.score : 0);
      this.saveProgress();
    }

    ready(game) {
      this.game = game;
      this.show('menu');
      this.refreshMenuStats();
    }

    bindButtons() {
      const on = (id, fn) => { const b = $(id); if (b) b.addEventListener('click', fn); };
      on('btn-start', () => this.openBriefing(0));
      on('btn-continue', () => this.openBriefing(this.game.missionIndex));
      on('btn-lab', () => this.openLab());
      on('btn-settings', () => { this.show('settings'); this.syncSettings(); });
      on('btn-settings-back', () => this.show(this.game && this.game.level ? 'pause' : 'menu'));
      on('btn-brief-go', () => this.startFromBrief());
      on('btn-brief-back', () => this.show('menu'));
      on('btn-resume', () => this.game.resume());
      on('btn-pause-settings', () => { this.show('settings'); this.syncSettings(); });
      on('btn-pause-menu', () => { this.game.state = 'menu'; this.show('menu'); this.game.unlock(); });
      on('btn-retry', () => { this.hideAll(); this.game.retry(); });
      on('btn-death-menu', () => { this.game.state = 'menu'; this.show('menu'); });
      on('btn-next', () => { this.hideAll(); this.game.nextMission(); });
      on('btn-win-menu', () => { this.game.state = 'menu'; this.show('menu'); });
      on('btn-lab-back', () => {
        const g = this.game;
        if (g && g.state === 'paused') this.show('pause');
        else this.show('menu');
      });
      on('btn-help', () => this.toggleHelp());
      on('btn-hud-menu', () => this.game.pause());
      const missionCards = $('mission-cards');
      if (missionCards) this.buildMissionCards(missionCards);
    }

    buildMissionCards(container) {
      D.MISSIONS.forEach((m, i) => {
        const card = el('div', 'mission-card');
        card.dataset.index = i;
        const num = el('div', 'mc-num', String(m.index).padStart(2, '0'));
        const body = el('div', 'mc-body');
        body.appendChild(el('h3', '', m.name));
        body.appendChild(el('p', '', m.briefing));
        const tags = el('div', 'mc-tags');
        tags.appendChild(el('span', 'tag tag-type', this.typeLabel(m.type)));
        tags.appendChild(el('span', 'tag', m.map === 'depot' ? 'Склады' : m.map === 'convoy' ? 'Конвой' : 'Порт'));
        tags.appendChild(el('span', 'tag', m.enemies.length + ' боевиков'));
        body.appendChild(tags);
        card.appendChild(num);
        card.appendChild(body);
        card.addEventListener('click', () => this.openBriefing(i));
        container.appendChild(card);
      });
    }

    typeLabel(t) {
      return { eliminate: 'Зачистка', destroy: 'Диверсия', survive: 'Оборона', extract: 'Эвакуация', boss: 'Босс' }[t] || t;
    }

    refreshMenuStats() {
      const library = SH2.anim.library.totals();
      const map = {
        'menu-parts': library.parts,
        'menu-clips': library.clips,
        'menu-variants': library.variants,
        'menu-per-part': library.perPart,
        'menu-total': library.total,
        'lab-total': library.total
      };
      Object.keys(map).forEach((id) => { const e = $(id); if (e) e.textContent = map[id]; });
      const parts = $('menu-part-list');
      if (parts && !parts.children.length) {
        D.PARTS.forEach((p) => {
          const chip = el('span', 'chip');
          chip.textContent = p.label;
          parts.appendChild(chip);
        });
      }
      const cont = $('btn-continue');
      if (cont && this.game) {
        const next = Math.min(this.progress.unlocked || 0, D.MISSIONS.length - 1);
        cont.style.display = (this.progress.unlocked || 0) > 0 ? '' : 'none';
        cont.textContent = 'ПРОДОЛЖИТЬ · МИССИЯ ' + (next + 1);
        cont.onclick = () => this.openBriefing(next);
      }
      // метки на карточках: рекорд/замок
      const cards = document.querySelectorAll('#mission-cards .mission-card');
      if (cards && cards.forEach) {
        cards.forEach((card, i) => {
          const locked = i > (this.progress.unlocked || 0);
          card.classList.toggle('locked', locked);
          let badge = card.querySelector('.mc-best');
          if (!badge) {
            badge = el('span', 'mc-best');
            const num = card.querySelector('.mc-num');
            if (num) num.appendChild(badge);
          }
          const best = this.progress.best[D.MISSIONS[i].id];
          badge.textContent = locked ? '🔒' : best ? best : '';
        });
      }
      const total = $('menu-total-score');
      if (total) total.textContent = (this.progress.total || 0).toLocaleString('ru-RU');
    }

    /* ------------------------------- брифинг ----------------------------- */
    openBriefing(index) {
      const g = this.game;
      // открываем только доступные миссии
      if (index > (this.progress.unlocked || 0)) {
        this.toast('Сначала пройдите предыдущую миссию', 2);
        return;
      }
      g.missionIndex = index;
      this.briefIndex = index;
      const m = D.MISSIONS[index];
      const set = (id, v) => { const e = $(id); if (e) e.textContent = v; };
      set('brief-num', 'МИССИЯ ' + m.index + ' / ' + D.MISSIONS.length);
      set('brief-name', m.name);
      set('brief-text', m.briefing);
      set('brief-tip', m.tip);
      set('brief-loadout', m.loadout.map((id) => D.WEAPON_BY_ID[id].name).join(' · '));
      set('brief-enemies', m.enemies.map((t) => D.ENEMY_BY_ID[t].name).filter((v, i, a) => a.indexOf(v) === i).join(' · '));
      set('brief-type', this.typeLabel(m.type));
      this.show('brief');
    }

    startFromBrief() {
      this.hideAll();
      this.game.startMission(this.briefIndex || 0);
    }

    /* ------------------------------- HUD --------------------------------- */
    missionStart(m, game) {
      this.hideAll();
      this.objectives = game.objectives;
      this.killFeedItems.length = 0;
      const t = $('killfeed');
      if (t) t.innerHTML = '';
      const name = $('mission-name');
      if (name) name.textContent = m.index + '. ' + m.name;
      this.hudAmmo(game.player);
      this.hudGrenades(game.player.grenadeCount || 0);
      this.toast('Миссия ' + m.index + ': ' + m.name, 3.2);
      this.renderObjectives();
      this.helpTip();
    }

    // короткая подсказка по управлению при первом запуске
    helpTip() {
      let seen = false;
      try { seen = localStorage.getItem('shooter2.help') === '1'; } catch (e) { seen = false; }
      if (seen) return;
      try { localStorage.setItem('shooter2.help', '1'); } catch (e) {}
      this.helpOpen = true;
      const h = $('help-panel');
      if (h) h.classList.add('open');
      setTimeout(() => {
        this.helpOpen = false;
        if (h) h.classList.remove('open');
      }, 9000);
    }

    toggleHelp() {
      this.helpOpen = !this.helpOpen;
      const h = $('help-panel');
      if (h) h.classList.toggle('open', this.helpOpen);
    }

    renderObjectives() {
      const box = $('objectives');
      if (!box) return;
      box.innerHTML = '';
      this.objectives.forEach((o) => {
        const row = el('div', 'obj' + (o.done ? ' done' : ''));
        const mark = el('span', 'obj-mark', o.done ? '✓' : '▸');
        const text = el('span', 'obj-text');
        if (o.id === 'survive') text.textContent = 'Продержаться ' + Math.max(0, Math.ceil(o.max - o.current)) + ' с';
        else if (o.id === 'box0' || o.id === 'box1' || o.id === 'box2') text.textContent = o.text;
        else text.textContent = o.text + ' ' + Math.min(o.current, o.max) + '/' + o.max;
        row.appendChild(mark); row.appendChild(text);
        box.appendChild(row);
      });
    }

    objectiveDone(o) { this.renderObjectives(); this.toast('Цель выполнена: ' + o.text, 2.2); }

    hudAmmo(p) {
      const a = $('hud-ammo');
      if (a) a.textContent = p.ammoInMag;
      const r = $('hud-reserve');
      if (r) r.textContent = p.reserve;
      const wn = $('hud-weapon');
      if (wn) wn.textContent = p.weapon.name;
    }
    hudGrenades(n) { const g = $('hud-grenades'); if (g) g.textContent = n; }

    waveStarted(n, total) { this.toast('Волна ' + n + ' из ' + total, 2.2); }

    killFeed(agent, head) {
      const feed = $('killfeed');
      if (!feed) return;
      const item = el('div', 'kf' + (head ? ' kf-head' : ''));
      item.textContent = (head ? 'В ГОЛОВУ · ' : '') + agent.cfg.name;
      feed.appendChild(item);
      setTimeout(() => { item.classList.add('fade'); }, 1800);
      setTimeout(() => { if (item.parentNode) item.parentNode.removeChild(item); }, 2600);
      while (feed.children.length > 5) feed.removeChild(feed.firstChild);
    }

    hitmarker(kind, killed) {
      const h = $('hitmarker');
      if (!h) return;
      h.className = 'show ' + (kind === 'head' ? 'head' : 'body') + (killed ? ' kill' : '');
      clearTimeout(this._hm);
      this._hm = setTimeout(() => { h.className = ''; }, 130);
    }

    damageNumber(worldPos, amount, head) {
      // мировые координаты -> экран
      const g = this.game;
      if (!g || !g.camera) return;
      const v = worldPos.clone().project(g.camera);
      if (v.z > 1) return;
      const x = (v.x * 0.5 + 0.5) * root.innerWidth;
      const y = (-v.y * 0.5 + 0.5) * root.innerHeight;
      const layer = $('dmg-layer');
      if (!layer) return;
      const d = el('div', 'dmgnum' + (head ? ' head' : ''), String(amount));
      d.style.left = x + 'px';
      d.style.top = y + 'px';
      layer.appendChild(d);
      setTimeout(() => { if (d.parentNode) d.parentNode.removeChild(d); }, 620);
    }

    damage(from, kind, amount) {
      const f = $('dmg-flash');
      if (f) {
        f.style.opacity = Math.min(0.85, 0.35 + amount / 90);
        clearTimeout(this._dmg);
        this._dmg = setTimeout(() => { f.style.opacity = 0; }, 90);
      }
      const dir = $('dmg-dir');
      if (dir && from) {
        const g = this.game, P = g.player;
        const ang = Math.atan2(from.x - P.x, from.z - P.z) - P.yaw;
        dir.style.transform = 'rotate(' + (-ang) + 'rad)';
        dir.style.opacity = 0.9;
        clearTimeout(this._dir);
        this._dir = setTimeout(() => { dir.style.opacity = 0; }, 420);
      }
      // вспышка по низкому здоровью
      const low = $('low-hp');
      if (low) low.classList.toggle('active', this.game.player.hp < 35);
    }

    toast(text, dur) {
      const t = $('toast');
      if (!t) return;
      t.textContent = text;
      t.classList.add('show');
      clearTimeout(this._toast);
      this._toast = setTimeout(() => t.classList.remove('show'), (dur || 2.4) * 1000);
    }

    showPause() {
      const g = this.game;
      this.show('pause');
      const s = $('pause-stats');
      if (s) s.innerHTML = '<div>Миссия: <b>' + (g.mission ? g.mission.name : '—') + '</b></div>' +
        '<div>Убийств: <b>' + g.kills + '</b></div>' +
        '<div>Очки: <b>' + g.score + '</b></div>';
    }
    hidePause() { this.hideAll(); }

    showDeath(g) {
      this.show('death');
      const s = $('death-stats');
      const acc = g.player.shots ? Math.round(g.player.hits / g.player.shots * 100) : 0;
      if (s) s.innerHTML = '<div>Причина: <b>огневое поражение</b></div>' +
        '<div>Убийств: <b>' + g.kills + '</b></div>' +
        '<div>Точность: <b>' + acc + '%</b></div>' +
        '<div>Получено урона: <b>' + Math.round(g.player.damageTaken) + '</b></div>';
    }

    showMissionComplete(g, m, stats) {
      this.unlockMission(Math.min(D.MISSIONS.length - 1, g.missionIndex + 1));
      this.recordMission(m, { score: g.score });
      stats = Object.assign({ score: g.score }, stats);
      this.show('win');
      const set = (id, v) => { const e = $(id); if (e) e.textContent = v; };
      set('win-title', stats.last ? 'КАМПАНИЯ ПРОЙДЕНА' : 'МИССИЯ ВЫПОЛНЕНА');
      set('win-name', m.name);
      const body = $('win-stats');
      if (body) {
        body.innerHTML =
          '<div class="row"><span>Время</span><b>' + stats.time.toFixed(1) + ' с</b></div>' +
          '<div class="row"><span>Точность</span><b>' + stats.accuracy + '%</b></div>' +
          '<div class="row"><span>Убийств</span><b>' + stats.kills + '</b></div>' +
          '<div class="row"><span>Урон по себе</span><b>' + stats.damageTaken + '</b></div>' +
          '<div class="row"><span>Бонус за время</span><b>+' + stats.timeBonus + '</b></div>' +
          '<div class="row total"><span>Очки</span><b>' + g.score + '</b></div>';
      }
      const next = $('btn-next');
      if (next) next.textContent = stats.last ? 'В МЕНЮ' : 'СЛЕДУЮЩАЯ МИССИЯ';
      if (next) next.onclick = stats.last ? () => { this.game.state = 'menu'; this.show('menu'); } : () => { this.hideAll(); this.game.nextMission(); };
    }

    toggleThoughts() {
      this.game.settings.showThoughts = !this.game.settings.showThoughts;
      this.toast('Мысли боевиков: ' + (this.game.settings.showThoughts ? 'вкл' : 'выкл'));
    }
    toggleDebug() {
      const d = $('debug-panel');
      if (d) d.classList.toggle('hidden');
    }
    toggleScore() {
      const s = $('score-panel');
      if (!s) return;
      const open = s.classList.contains('hidden');
      s.classList.toggle('hidden', !open);
      if (!open) return;
      const g = this.game;
      const P = g.player;
      const acc = P.shots ? Math.round(P.hits / P.shots * 100) : 0;
      s.innerHTML = '<div class="sp-title">ТАБЛИЦА БОЯ</div>' +
        '<div class="sp-grid">' +
        '<span>Миссия</span><b>' + (g.mission ? g.mission.name : '—') + '</b>' +
        '<span>Убийств</span><b>' + g.kills + '</b>' +
        '<span>В голову</span><b>' + P.headshots + '</b>' +
        '<span>Выстрелов</span><b>' + P.shots + '</b>' +
        '<span>Точность</span><b>' + acc + '%</b>' +
        '<span>Урон нанесён</span><b>' + Math.round(P.damageDealt) + '</b>' +
        '<span>Урон получен</span><b>' + Math.round(P.damageTaken) + '</b>' +
        '<span>Очки</span><b>' + g.score + '</b>' +
        '<span>Время</span><b>' + g.missionTimer.toFixed(1) + ' с</b>' +
        '</div>';
    }

    /* -------------------------- обновление кадра ------------------------- */
    frame(g, dt) {
      if (g.state !== 'playing') return;
      const P = g.player;
      // здоровье/броня
      const hp = $('hp-fill');
      if (hp) hp.style.width = Math.max(0, P.hp / P.maxHp * 100) + '%';
      const hpv = $('hp-val');
      if (hpv) hpv.textContent = Math.ceil(P.hp);
      const ar = $('ar-fill');
      if (ar) ar.style.width = Math.max(0, P.armor / P.maxArmor * 100) + '%';
      const arv = $('ar-val');
      if (arv) arv.textContent = Math.ceil(P.armor);
      const st = $('st-fill');
      if (st) st.style.width = Math.max(0, P.stamina / P.maxStamina * 100) + '%';
      // патроны
      this.hudAmmo(P);
      this.hudGrenades(P.grenadeCount || 0);
      // прицел: разброс
      const cross = $('crosshair');
      if (cross) {
        const spread = (P.ads ? P.weapon.adsSpread : P.weapon.spread) * (1 + P.spreadHeat * 1.4) * 260;
        cross.style.setProperty('--gap', Math.max(3, Math.min(26, 4 + spread * 0.5)) + 'px');
        cross.classList.toggle('ads', !!P.ads);
        cross.classList.toggle('scope', !!P.scoped);
      }
      // подпись врага под прицелом
      const tag = $('aim-tag');
      if (tag) {
        const aim = g.aim;
        if (aim && aim.enemy) {
          const e = aim.enemy;
          tag.textContent = e.cfg.short + ' · ' + Math.round(aim.dist) + ' м · ' + Math.ceil(e.hp) + ' HP';
          tag.classList.add('show');
          tag.classList.toggle('lowhp', e.hp < e.maxHp * 0.35);
        } else tag.classList.remove('show');
      }
      const scope = $('scope-overlay');
      if (scope) scope.classList.toggle('active', !!P.scoped);
      const low = $('low-hp');
      if (low) low.classList.toggle('active', P.hp < 35);
      // цели
      this._objTimer = (this._objTimer || 0) + dt;
      if (this._objTimer > 0.2) {
        this._objTimer = 0;
        this.renderObjectives();
        const timer = $('mission-timer');
        if (timer) timer.textContent = g.mission && g.mission.type === 'survive'
          ? Math.max(0, Math.ceil(g.mission.time - g.missionTimer)) + ' с'
          : g.missionTimer.toFixed(0) + ' с';
      }
      // мысли боевиков над головами
      if (g.settings.showThoughts && this._thoughtTimer === undefined) this._thoughtTimer = 0;
      this._thoughtTimer = (this._thoughtTimer || 0) + dt;
      if (this._thoughtTimer > 0.12) {
        this._thoughtTimer = 0;
        this.drawThoughts(g);
      }
      // мини-карта
      this._mapTimer = (this._mapTimer || 0) + dt;
      if (this._mapTimer > 0.12) { this._mapTimer = 0; this.drawMinimap(g); }
      // отладочная панель
      this._dbgTimer = (this._dbgTimer || 0) + dt;
      if (this._dbgTimer > 0.25) {
        this._dbgTimer = 0;
        this.renderDebug(g);
      }
    }

    drawMinimap(g) {
      const cv = $('minimap');
      if (!cv || !cv.getContext) return;
      const ctx = cv.getContext('2d');
      if (!ctx || !g.world) return;
      const W = cv.width, H = cv.height;
      const half = g.world.half;
      const k = (W - 8) / (half * 2);
      const toX = (x) => W / 2 + x * k;
      const toY = (z) => H / 2 + z * k;
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = 'rgba(8,12,17,0.55)';
      ctx.fillRect(0, 0, W, H);
      // стены
      ctx.fillStyle = 'rgba(150,170,190,0.30)';
      for (const c of g.world.colliders) {
        ctx.fillRect(toX(c.x - c.hw), toY(c.z - c.hd), c.hw * 2 * k, c.hd * 2 * k);
      }
      // точка эвакуации
      if (g.extract) {
        ctx.strokeStyle = 'rgba(92,255,157,0.7)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(toX(g.extract.x), toY(g.extract.z), g.extract.r * k, 0, Math.PI * 2);
        ctx.stroke();
      }
      // бойцы: видимые — красные, остальные — приглушённые
      for (const e of g.enemies) {
        if (!e.alive) continue;
        const seen = e.brain && (e.brain.seenNow || e.brain.alert > 0.3);
        const d = Math.hypot(e.x - g.player.x, e.z - g.player.z);
        if (!seen && d > 26) continue;
        ctx.fillStyle = seen ? 'rgba(255,85,96,0.95)' : 'rgba(255,85,96,0.35)';
        ctx.beginPath();
        ctx.arc(toX(e.x), toY(e.z), seen ? 2.6 : 1.8, 0, Math.PI * 2);
        ctx.fill();
      }
      // игрок и конус взгляда
      const px = toX(g.player.x), py = toY(g.player.z);
      const yaw = g.player.yaw;
      ctx.fillStyle = 'rgba(111,200,255,0.22)';
      ctx.beginPath();
      ctx.moveTo(px, py);
      ctx.arc(px, py, 20, Math.PI / 2 - yaw - 0.5, Math.PI / 2 - yaw + 0.5);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#6fc8ff';
      ctx.beginPath();
      ctx.arc(px, py, 3, 0, Math.PI * 2);
      ctx.fill();
    }

    drawThoughts(g) {
      const layer = $('thoughts');
      if (!layer) return;
      if (!g.settings.showThoughts) { if (layer.children.length) layer.innerHTML = ''; return; }
      const cam = g.camera;
      const items = [];
      for (const e of g.enemies) {
        if (!e.alive || !e.brain || !e.brain.thought || e.brain.thoughtTimer <= 0) continue;
        const d = Math.hypot(e.x - g.player.x, e.z - g.player.z);
        if (d > 42) continue;
        const v = new (root.THREE.Vector3)(e.x, 2.05 * e.cfg.scale, e.z);
        v.project(cam);
        if (v.z > 1) continue;
        items.push({ text: e.brain.thought, x: (v.x * 0.5 + 0.5) * root.innerWidth, y: (-v.y * 0.5 + 0.5) * root.innerHeight, d });
      }
      layer.innerHTML = '';
      items.slice(0, 6).forEach((it) => {
        const b = el('div', 'thought');
        b.textContent = it.text;
        b.style.left = it.x + 'px';
        b.style.top = it.y + 'px';
        b.style.opacity = String(Math.max(0.25, 1 - it.d / 48));
        layer.appendChild(b);
      });
    }

    renderDebug(g) {
      const box = $('debug-panel');
      if (!box || box.classList.contains('hidden')) return;
      const pf = g.perf;
      const cur = g.enemies.filter((e) => e.alive);
      const lod0 = cur.filter((e) => e.lod === 0).length;
      const lod1 = cur.filter((e) => e.lod === 1).length;
      const lod2 = cur.filter((e) => e.lod === 2).length;
      const rdSteps = g.deadBodies.reduce((s, b) => s + (b.ragdoll ? b.ragdoll.totalSubsteps : 0), 0);
      const props = g.level ? (g.level.props || 0) : 0;
      const rows = [
        ['FPS', pf.fps + ' (' + pf.frameMsSmooth.toFixed(1) + ' мс)'],
        ['Draw calls', pf.counters.drawCalls],
        ['Треугольники', (pf.counters.triangles / 1000).toFixed(1) + 'k'],
        ['Геометрии', pf.counters.geometries],
        ['Бойцов', cur.length + ' · LOD 0/1/2: ' + lod0 + '/' + lod1 + '/' + lod2],
        ['Регдол-шагов', rdSteps],
        ['Частиц', pf.counters.particles],
        ['Полигонов карты', props + ' · коллайдеров ' + (g.level ? g.level.colliders.length : 0)],
        ['Анимаций в кэше', SH2.anim.library.cacheSize()],
        ['Качество', pf.preset + ' · render ' + Math.round(pf.scale * 100) + '%'],
        ['Гранаты', g.combat.grenades.length + ' · пули ' + g.combat.bullets.length]
      ];
      box.innerHTML = rows.map((r) => '<div class="dbg-row"><span>' + r[0] + '</span><b>' + r[1] + '</b></div>').join('');
      const feet = $('hud-fps');
      if (feet) feet.textContent = pf.fps + ' FPS';
    }

    /* ---------------------------- настройки ------------------------------ */
    buildSettings() {
      const q = $('set-quality');
      if (q && !q.children.length) {
        Object.keys(SH2.perf.PRESETS).forEach((k) => {
          const b = el('button', 'opt', SH2.perf.PRESETS[k].label);
          b.dataset.q = k;
          b.addEventListener('click', () => {
            this.game.settings.quality = k;
            this.game.setQuality(k);
            this.syncSettings();
          });
          q.appendChild(b);
        });
      }
      const d = $('set-difficulty');
      if (d && !d.children.length) {
        [['Лёгкая', 0], ['Обычная', 1], ['Жёсткая', 2]].forEach(([label, val]) => {
          const b = el('button', 'opt', label);
          b.dataset.d = val;
          b.addEventListener('click', () => {
            this.game.settings.difficulty = val;
            this.game.difficulty = val;
            this.syncSettings();
          });
          d.appendChild(b);
        });
      }
      const r = $('set-ragdoll');
      if (r) r.addEventListener('click', () => {
        this.game.settings.ragdoll = !this.game.settings.ragdoll;
        this.syncSettings();
      });
      const sens = $('set-sens');
      if (sens) sens.addEventListener('input', () => {
        this.game.settings.mouseSens = parseFloat(sens.value);
        const v = $('set-sens-val'); if (v) v.textContent = sens.value;
      });
    }

    syncSettings() {
      const g = this.game;
      document.querySelectorAll('#set-quality .opt').forEach((b) => b.classList.toggle('on', b.dataset.q === g.settings.quality));
      document.querySelectorAll('#set-difficulty .opt').forEach((b) => b.classList.toggle('on', +b.dataset.d === +g.settings.difficulty));
      const r = $('set-ragdoll');
      if (r) { r.textContent = g.settings.ragdoll ? 'Кукла из точек: включена' : 'Кукла из точек: выключена'; r.classList.toggle('on', g.settings.ragdoll); }
      const sens = $('set-sens');
      if (sens) sens.value = g.settings.mouseSens;
      const v = $('set-sens-val'); if (v) v.textContent = g.settings.mouseSens;
    }

    /* --------------------------- лаборатория ----------------------------- */
    buildLab() {
      const partsBox = $('lab-parts');
      const clipsBox = $('lab-clips');
      const variantsBox = $('lab-variants');
      if (!partsBox || !clipsBox || !variantsBox) return;
      this.lab = { part: 'chest', clip: 'shoot', variant: 0 };
      D.PARTS.forEach((p) => {
        const b = el('button', 'lab-part', p.label);
        b.dataset.part = p.id;
        b.addEventListener('click', () => {
          this.lab.part = p.id;
          this.markLab();
          const canvas = $('lab-canvas');
          if (canvas && this.labDraw) this.labDraw();
        });
        partsBox.appendChild(b);
      });
      this.renderLabClips();
      D.VARIANTS.forEach((v, i) => {
        const b = el('button', 'lab-var', v.label);
        b.dataset.v = i;
        b.style.setProperty('--vc', v.color);
        b.addEventListener('click', () => { this.lab.variant = i; this.markLab(); });
        variantsBox.appendChild(b);
      });
      this.markLab();
    }

    renderLabClips() {
      const clipsBox = $('lab-clips');
      if (!clipsBox) return;
      clipsBox.innerHTML = '';
      D.CLIPS.forEach((c) => {
        const b = el('button', 'lab-clip', c.label);
        b.dataset.clip = c.id;
        const badge = el('span', 'lab-clip-dur', c.dur.toFixed(2) + 'с');
        b.appendChild(badge);
        b.addEventListener('click', () => { this.lab.clip = c.id; this.markLab(); });
        clipsBox.appendChild(b);
      });
    }

    markLab() {
      document.querySelectorAll('#lab-parts .lab-part').forEach((b) => b.classList.toggle('on', b.dataset.part === this.lab.part));
      document.querySelectorAll('#lab-clips .lab-clip').forEach((b) => b.classList.toggle('on', b.dataset.clip === this.lab.clip));
      document.querySelectorAll('#lab-variants .lab-var').forEach((b) => b.classList.toggle('on', +b.dataset.v === this.lab.variant));
      const info = $('lab-info');
      if (info) {
        const p = D.PART_BY_ID[this.lab.part], c = D.CLIP_BY_ID[this.lab.clip], v = D.VARIANTS[this.lab.variant];
        info.innerHTML = '<b>' + p.label + '</b> · ' + c.label + ' · <span style="color:' + v.color + '">' + v.label + '</span>' +
          '<br><span class="dim">амплитуда ×' + v.amp.toFixed(2) + ', темп ×' + v.speed.toFixed(2) +
          ', наклон ' + (v.lean >= 0 ? '+' : '') + v.lean.toFixed(2) + ', хромота ' + v.limp.toFixed(2) + '</span>';
      }
    }

    openLab() {
      this.show('lab');
      this.startLabRenderer();
    }

    startLabRenderer() {
      const canvas = $('lab-canvas');
      if (!canvas) return;
      if (this.labStarted) return;
      this.labStarted = true;
      const T = root.THREE;
      const renderer = new T.WebGLRenderer({ canvas, antialias: true, alpha: true });
      renderer.setPixelRatio(Math.min(root.devicePixelRatio || 1, 2));
      const resize = () => {
        const w = canvas.clientWidth || 640, h = canvas.clientHeight || 480;
        renderer.setSize(w, h, false);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
      };
      const scene = new T.Scene();
      const camera = new T.PerspectiveCamera(42, 1, 0.1, 60);
      camera.position.set(2.3, 1.55, 3.1);
      camera.lookAt(0, 1.0, 0);
      scene.add(new T.HemisphereLight(0x9fc6ff, 0x2a2018, 0.85));
      const key = new T.DirectionalLight(0xfff0d8, 1.25);
      key.position.set(3, 5, 4);
      key.castShadow = true;
      key.shadow.mapSize.set(1024, 1024);
      scene.add(key);
      const rim = new T.DirectionalLight(0x6fa8ff, 0.75);
      rim.position.set(-3, 2, -3);
      scene.add(rim);
      const floor = new T.Mesh(new T.CircleGeometry(3.2, 40), new T.MeshLambertMaterial({ color: 0x232a33 }));
      floor.rotation.x = -Math.PI / 2;
      floor.receiveShadow = true;
      scene.add(floor);
      const grid = new T.GridHelper(6, 12, 0x3a4a5a, 0x2a343e);
      grid.position.y = 0.002;
      scene.add(grid);

      const rig = SH2.model.buildRig('grunt', { scale: 1, player: false });
      scene.add(rig.root);
      const weapon = SH2.model.buildWeaponModel('rifle');
      weapon.scale.setScalar(1.22);
      rig.weaponSlot.add(weapon);
      rig.setGrips('rifle');
      const ik = new SH2.ik.ArmIK(rig);
      // кость-маркер выбранной части
      const marker = new T.Mesh(new T.SphereGeometry(0.045, 10, 8), new T.MeshBasicMaterial({ color: 0xffd166 }));
      scene.add(marker);
      const pivot = new T.Group();
      scene.add(pivot);

      const anim = new SH2.anim.Animator(rig, { smooth: 1000 });
      let t = 0, last = performance.now();
      const self = this;
      this.labDraw = () => { self.labInfoRefresh && self.labInfoRefresh(); };
      const tick = (now) => {
        if (!this.screens.lab.classList.contains('active')) { requestAnimationFrame(tick); last = now; return; }
        requestAnimationFrame(tick);
        const dt = Math.min(0.05, (now - last) / 1000);
        last = now;
        resize();
        const lab = this.lab;
        const clip = D.CLIP_BY_ID[lab.clip];
        t += dt;
        const phase = clip.loop ? (t / (clip.dur / D.VARIANTS[lab.variant].speed)) % 1 : Math.min(1, (t / (clip.dur / D.VARIANTS[lab.variant].speed)));
        anim.poseAt(lab.clip, lab.variant, phase);
        SH2.anim.groundLock(rig, anim, 1);
        ik.update({ raise: (lab.clip === 'aim' || lab.clip === 'shoot') ? 1 : 0.3, tilt: 0 });
        rig.root.rotation.y = Math.sin(t * 0.35) * 0.55;
        rig.root.updateMatrixWorld(true);
        // маркер на выбранной части
        const part = D.PART_BY_ID[lab.part];
        const bone = rig.bones[part.bone];
        if (bone) {
          const v = new T.Vector3();
          bone.getWorldPosition(v);
          marker.position.copy(v);
          marker.visible = true;
        }
        renderer.render(scene, camera);
        // полоса прогресса
        const prog = $('lab-progress');
        if (prog) prog.style.width = (phase * 100) + '%';
        const pt = $('lab-phase');
        if (pt) pt.textContent = phase.toFixed(2);
      };
      requestAnimationFrame(tick);
    }
  }

  SH2.ui = { UI };
})(typeof window !== 'undefined' ? window : globalThis);
