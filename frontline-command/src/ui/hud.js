// HUD: ресурсы, отряды, приказы, директивы, автопилот, стройка, лента событий и журнал приказов.
// Вся информация берётся из симуляции; ничего не дублируется и не «дорисовывается».
import { clamp, dist } from '../core/mathx.js';

const RES = [
  { key: 'ammo', icon: 'res_ammo', name: 'Боеприпасы' },
  { key: 'materials', icon: 'res_materials', name: 'Материалы' },
  { key: 'fuel', icon: 'res_fuel', name: 'Топливо' },
  { key: 'meds', icon: 'res_meds', name: 'Медикаменты' },
];

const ORDER_BUTTONS = [
  { type: 'move', icon: 'order_move', label: 'Двигаться', key: 'ПКМ' },
  { type: 'attack', icon: 'order_attack', label: 'Атаковать', key: 'ПКМ' },
  { type: 'hold', icon: 'order_hold', label: 'Держать', key: 'H' },
  { type: 'build', icon: 'order_build', label: 'Строить', key: 'B' },
  { type: 'supply', icon: 'order_supply', label: 'Снабдить', key: 'S' },
];

export class HUD {
  constructor(root, game, bank) {
    this.root = root;
    this.game = game;
    this.bank = bank;
    this.handlers = {};
    this.selectedSquadIds = [];
    this.updateTimer = 0;
    this.lastFeed = 0;
    this.lastJournal = 0;
    this.buildMode = null;
    this.directiveOpen = false;
    this.hint = null;
    this.hintTimer = 0;
    this._build();
  }

  on(handlers) { this.handlers = handlers; return this; }

  icon(name, size = 16) {
    const img = this.bank.get('ui/' + name);
    return img ? `<img src="${img.src}" width="${size}" height="${size}" alt="">` : '';
  }

  _build() {
    this.root.innerHTML = `
      <div class="hud-top">
        <a class="hud-back" href="../index.html" title="Все игры">← Все игры</a>
        <div class="faction-tag ally" id="hud-faction"><span class="dot"></span><span id="hud-faction-name">Альянс</span></div>
        <div id="hud-res" style="display:flex;gap:6px"></div>
        <div class="res" title="Контроль ключевых точек"><b id="hud-points">0 / 0</b></div>
        <div class="spacer"></div>
        <div class="res" title="Убито / потеряно"><span style="color:var(--text-dim)">убито/потери</span> <b id="hud-kills">0 / 0</b></div>
        <div class="speed-group">
          <button class="hud-btn" data-speed="0" title="Пауза (Пробел)">❚❚</button>
          <button class="hud-btn" data-speed="1">×1</button>
          <button class="hud-btn" data-speed="2">×2</button>
          <button class="hud-btn" data-speed="4">×4</button>
        </div>
        <div class="clock" id="hud-clock">00:00</div>
        <button class="hud-btn" id="hud-mode" title="Переключить уровень управления (Tab)">Солдат</button>
        <button class="hud-btn" id="hud-self" title="Дополнительные приказы">Приказы</button>
        <button class="hud-btn" id="hud-menu" title="Меню (Esc)">Меню</button>
      </div>

      <div class="hud-left panel">
        <div class="panel-head"><span>Отряды</span><span id="hud-squad-count">0/0</span></div>
        <div class="squad-list" id="hud-squads"></div>
        <div style="display:flex;gap:4px;padding:6px;border-top:1px solid var(--line-soft)">
          <button class="hud-btn" id="hud-create" title="Создать отряд на базе (Ctrl+G)">+ Отряд</button>
          <button class="hud-btn" id="hud-directive" title="Директива (T)">Директива</button>
          <button class="hud-btn" id="hud-autopilot" title="Автопилот (P)">Авто</button>
        </div>
      </div>

      <div class="hud-right">
        <div class="panel">
          <div class="panel-head"><span>События</span><span id="hud-alert-count"></span></div>
          <div class="feed" id="hud-feed"></div>
        </div>
        <div class="panel">
          <div class="panel-head"><span>Журнал приказов</span><span style="color:#6f7a66">Command API</span></div>
          <div class="journal" id="hud-journal"></div>
        </div>
      </div>

      <div class="hud-bottom">
        <div class="panel sel-info" id="hud-selection">
          <div class="title">Нет выбранных отрядов</div>
          <div class="row"><span>ЛКМ — выделить, ПКМ — приказ</span></div>
        </div>
        <div class="panel orders" id="hud-orders"></div>
      </div>

      <div class="hud-minimap" id="hud-minimap"><canvas width="200" height="200"></canvas></div>
      <div class="hud-hint" id="hud-hint"></div>
      <div class="toast" id="hud-toast"></div>

      <div class="build-menu" id="hud-build">
        <div class="panel-head"><span>Стройка</span><span id="hud-build-hint">ЛКМ — поставить, ПКМ — отменить</span></div>
        <div class="items" id="hud-build-items"></div>
      </div>

      <div class="directive-panel" id="hud-directive-panel">
        <div class="panel-head"><span>Директива отряду</span><button class="hud-btn" id="hud-directive-close">×</button></div>
        <div style="padding:10px">
          <div class="form-row"><label>Цель</label>
            <select id="dir-goal"></select></div>
          <div class="form-row"><label>Алгоритм</label>
            <select id="dir-strategy"></select></div>
          <div class="form-row"><label>Стойка</label>
            <select id="dir-behavior">
              <option value="attack">Наступать</option>
              <option value="defend">Оборонять</option>
              <option value="hold">Держать</option>
              <option value="recon">Разведка</option>
            </select></div>
          <div class="form-row"><label>После выполнения</label>
            <select id="dir-after">
              <option value="hold">Удерживать</option>
              <option value="defend">Окопаться</option>
              <option value="return">Вернуться на базу</option>
              <option value="patrol">Патрулировать</option>
            </select></div>
          <div style="font-size:12px;color:var(--text-dim);margin:6px 0">
            Отряд выполнит приказ сам: цель, правила поведения и действия после — из data/strategies.json.
          </div>
          <div class="btn-row"><button class="btn primary" id="dir-apply">Выдать директиву</button>
            <button class="btn" id="dir-cancel">Отмена</button></div>
        </div>
      </div>

      <div class="autopilot-panel" id="hud-autopilot-panel">
        <div class="panel-head"><span>Автопилот</span><span style="color:#6f7a66">по сферам</span></div>
        <div style="padding:8px" id="hud-ap-list"></div>
      </div>
    `;

    this.el = {
      faction: this.root.querySelector('#hud-faction'),
      factionName: this.root.querySelector('#hud-faction-name'),
      res: this.root.querySelector('#hud-res'),
      points: this.root.querySelector('#hud-points'),
      kills: this.root.querySelector('#hud-kills'),
      clock: this.root.querySelector('#hud-clock'),
      mode: this.root.querySelector('#hud-mode'),
      squads: this.root.querySelector('#hud-squads'),
      squadCount: this.root.querySelector('#hud-squad-count'),
      feed: this.root.querySelector('#hud-feed'),
      journal: this.root.querySelector('#hud-journal'),
      selection: this.root.querySelector('#hud-selection'),
      orders: this.root.querySelector('#hud-orders'),
      minimap: this.root.querySelector('#hud-minimap canvas'),
      hint: this.root.querySelector('#hud-hint'),
      toast: this.root.querySelector('#hud-toast'),
      build: this.root.querySelector('#hud-build'),
      buildItems: this.root.querySelector('#hud-build-items'),
      buildHint: this.root.querySelector('#hud-build-hint'),
      directivePanel: this.root.querySelector('#hud-directive-panel'),
      apPanel: this.root.querySelector('#hud-autopilot-panel'),
      apList: this.root.querySelector('#hud-ap-list'),
    };

    // ресурсы
    this.el.res.innerHTML = RES.map((r) => `<div class="res" title="${r.name}" data-res="${r.key}">${this.icon(r.icon)}<b>0</b></div>`).join('');
    this.resEls = {};
    for (const r of RES) this.resEls[r.key] = this.el.res.querySelector(`[data-res="${r.key}"]`);

    // приказы
    this.el.orders.innerHTML = ORDER_BUTTONS.map((o) => `
      <button class="hud-btn order-btn" data-order="${o.type}">${this.icon(o.icon, 18)}<span>${o.label}</span><kbd>${o.key}</kbd></button>
    `).join('') + `<button class="hud-btn order-btn" data-order="stance">${this.icon('order_hold', 18)}<span>Стойки</span><kbd>F</kbd></button>`;

    // обработчики
    this.el.orders.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-order]');
      if (!btn) return;
      const type = btn.dataset.order;
      if (type === 'stance') this.cycleStance();
      else this.handlers.onOrder?.(type);
    });
    this.root.querySelectorAll('[data-speed]').forEach((b) => b.addEventListener('click', () => this.handlers.onSpeed?.(Number(b.dataset.speed))));
    this.root.querySelector('#hud-menu').addEventListener('click', () => this.handlers.onMenu?.());
    this.root.querySelector('#hud-mode').addEventListener('click', () => this.handlers.onMode?.());
    this.el.squads.addEventListener('click', (e) => {
      const item = e.target.closest('[data-squad]');
      if (!item) return;
      this.handlers.onSelectSquad?.(Number(item.dataset.squad), e.shiftKey);
    });
    this.root.querySelector('#hud-create').addEventListener('click', () => this.handlers.onCreateSquad?.());
    this.root.querySelector('#hud-directive').addEventListener('click', () => this.toggleDirective());
    this.root.querySelector('#hud-autopilot').addEventListener('click', () => this.toggleAutopilot());
    this.root.querySelector('#hud-directive-close').addEventListener('click', () => this.toggleDirective(false));
    this.root.querySelector('#dir-cancel').addEventListener('click', () => this.toggleDirective(false));
    this.root.querySelector('#dir-apply').addEventListener('click', () => this.applyDirective());
    this.el.minimap.addEventListener('click', (e) => {
      const r = this.el.minimap.getBoundingClientRect();
      this.handlers.onMinimapClick?.(((e.clientX - r.left) / r.width) * this.game.world.W, ((e.clientY - r.top) / r.height) * this.game.world.H);
    });

    this._buildInventory();
    this._buildAutopilotPanel();
  }

  _buildInventory() {
    const game = this.game;
    const list = ['sandbags', 'wire', 'trench', 'mg_nest', 'bunker', 'watchtower'];
    this.el.buildItems.innerHTML = list.map((type) => {
      const def = game.cfg.building(type);
      const cost = Object.entries(def.cost || {}).map(([k, v]) => `${v} ${this.shortRes(k)}`).join(', ');
      return `<div class="build-item" data-build="${type}">
        <div><b>${def.name}</b></div>
        <div class="cost">${cost}${def.cover ? ` · укрытие ${Math.round(def.cover * 100)}%` : ''}</div>
      </div>`;
    }).join('');
    this.el.buildItems.addEventListener('click', (e) => {
      const item = e.target.closest('[data-build]');
      if (!item) return;
      this.setBuildMode(item.dataset.build);
    });
  }

  _buildAutopilotPanel() {
    const game = this.game;
    const areas = game.cfg.autopilot.areas;
    this.el.apList.innerHTML = areas.map((a) => `
      <label class="form-row" style="margin:4px 0;justify-content:space-between">
        <span style="color:#c2ccb6">${a.name}</span>
        <input type="checkbox" data-ap="${a.id}">
      </label>`).join('') + `<div style="font-size:11px;color:var(--text-dim);margin-top:6px">В режиме солдата все сферы включены — иначе армия без командующего не воюет.</div>`;
    this.el.apList.addEventListener('change', (e) => {
      const cb = e.target.closest('[data-ap]');
      if (!cb) return;
      this.handlers.onAutopilotToggle?.(cb.dataset.ap, cb.checked);
    });
  }

  shortRes(k) {
    return { ammo: 'б/п', materials: 'мат', fuel: 'топ', meds: 'мед' }[k] || k;
  }

  setBuildMode(type) {
    this.buildMode = type;
    this.el.build.classList.toggle('show', !!type);
    this.el.buildItems.querySelectorAll('[data-build]').forEach((el) => el.classList.toggle('active', el.dataset.build === type));
    this.handlers.onBuildMode?.(type);
  }

  toggleBuildMenu() { this.setBuildMode(this.buildMode ? null : 'sandbags'); }

  // Esc закрывает открытые панели до открытия меню
  closePanels() {
    let closed = false;
    if (this.buildMode) { this.setBuildMode(null); closed = true; }
    if (this.directiveOpen) { this.toggleDirective(false); closed = true; }
    if (this.el.apPanel.classList.contains('show')) { this.el.apPanel.classList.remove('show'); closed = true; }
    return closed;
  }

  toggleDirective(force) {
    const open = force != null ? force : !this.directiveOpen;
    this.directiveOpen = open;
    this.el.directivePanel.classList.toggle('show', open);
    if (!open) return;
    const game = this.game;
    const goals = game.world.points.map((p) => `<option value="${p.id}">${p.name}${p.owner === game.playerFaction ? ' (свой)' : p.owner >= 0 ? ' (враг)' : ''}</option>`).join('')
      + game.world.sectors.map((s) => `<option value="sector:${s.id}">Сектор: ${s.name}</option>`).join('');
    this.root.querySelector('#dir-goal').innerHTML = goals;
    this.root.querySelector('#dir-strategy').innerHTML = Object.entries(game.cfg.strategies)
      .map(([id, s]) => `<option value="${id}">${s.name} — ${s.desc}</option>`).join('');
  }

  applyDirective() {
    const goal = this.root.querySelector('#dir-goal').value;
    const strategy = this.root.querySelector('#dir-strategy').value;
    const behavior = this.root.querySelector('#dir-behavior').value;
    const after = this.root.querySelector('#dir-after').value;
    this.handlers.onDirective?.({ goal, strategy, behavior, after });
    this.toggleDirective(false);
  }

  toggleAutopilot() {
    const show = !this.el.apPanel.classList.contains('show');
    this.el.apPanel.classList.toggle('show', show);
    if (show) this.refreshAutopilot();
  }

  refreshAutopilot() {
    const game = this.game;
    const areas = game.autopilot.areas(game.playerFaction);
    this.el.apList.querySelectorAll('[data-ap]').forEach((cb) => {
      cb.checked = !!areas[cb.dataset.ap];
      cb.disabled = game.mode === 'soldier' && game.cfg.autopilot.soldierModeForcesAll;
    });
  }

  cycleStance() {
    const ids = [...this.game.selectedSquads];
    if (!ids.length) { this.toast('Сначала выберите отряд', 'bad'); return; }
    const order = ['attack', 'hold', 'defend', 'recon'];
    for (const id of ids) {
      const sq = this.game.squads.get(id);
      if (!sq) continue;
      const next = order[(order.indexOf(sq.behavior) + 1) % order.length];
      sq.setStance('behavior', next);
      this.toast(`Стойка отряда «${sq.name}»: ${this.behaviorLabel(next)}`, 'good');
    }
  }

  behaviorLabel(b) { return { attack: 'наступление', hold: 'удержание', defend: 'оборона', recon: 'разведка' }[b] || b; }

  toast(text, kind = '') {
    const el = this.el.toast;
    el.textContent = text;
    el.className = `toast show ${kind}`;
    clearTimeout(this._toastT);
    this._toastT = setTimeout(() => el.classList.remove('show'), 2400);
  }

  showHint(text, seconds = 6) {
    this.el.hint.textContent = text;
    this.el.hint.classList.add('show');
    this.hintTimer = seconds;
  }

  update(dt) {
    const game = this.game;
    this.hintTimer -= dt;
    if (this.hintTimer <= 0 && this.el.hint.classList.contains('show')) this.el.hint.classList.remove('show');

    this.updateTimer -= dt;
    if (this.updateTimer > 0) {
      this.renderMinimap();
      return;
    }
    this.updateTimer = 0.15;
    this.renderTop();
    this.renderSquads();
    this.renderSelection();
    this.renderFeed();
    this.renderJournal();
    this.renderMinimap();
    if (this.el.apPanel.classList.contains('show')) this.refreshAutopilot();
    if (this.buildMode) this.updateBuildAffordability();
  }

  renderTop() {
    const game = this.game;
    const f = game.playerFaction ?? 0;
    const def = game.cfg.faction(f);
    this.el.faction.className = `faction-tag ${f === 0 ? 'ally' : 'leg'}`;
    this.el.factionName.textContent = game.aiVsAi ? 'ИИ против ИИ' : def.name;
    const stock = game.logistics.stock[f];
    for (const r of RES) {
      const b = this.resEls[r.key].querySelector('b');
      b.textContent = Math.round(stock[r.key]);
      this.resEls[r.key].classList.toggle('warn', stock[r.key] < 60);
    }
    const own = game.world.points.filter((p) => p.owner === f && (p.type === 'city' || p.type === 'hq')).length;
    const all = game.world.points.filter((p) => p.type === 'city' || p.type === 'hq').length;
    this.el.points.textContent = `${own} / ${all}`;
    this.el.kills.textContent = `${game.stats.kills[f]} / ${game.stats.losses[f]}`;
    const t = Math.floor(game.time);
    this.el.clock.textContent = `${String(Math.floor(t / 60)).padStart(2, '0')}:${String(t % 60).padStart(2, '0')}`;
    this.el.mode.textContent = game.mode === 'soldier' ? 'Солдат' : 'Командир';
    this.root.querySelectorAll('[data-speed]').forEach((b) => {
      const v = Number(b.dataset.speed);
      b.classList.toggle('active', v === 0 ? game.paused : (!game.paused && game.speed === v));
    });
  }

  renderSquads() {
    const game = this.game;
    const f = game.playerFaction ?? 0;
    const squads = [...game.squads.values()].filter((s) => s.faction === f && s.state !== 'destroyed');
    const limit = game.squadLimit(f);
    this.el.squadCount.textContent = `${squads.length}/${limit}`;
    const html = squads.map((s) => {
      const n = s.count();
      const ammo = Math.round(s.ammoRatio() * 100);
      const morale = Math.round(s.morale());
      const lowAmmo = ammo < 30;
      return `<div class="squad-item ${game.selectedSquads.has(s.id) ? 'selected' : ''} ${f === 1 ? 'leg' : ''}" data-squad="${s.id}">
        <div class="stripe"></div>
        <div>
          <div class="name">${s.name} <span style="font-size:11px;color:#8c9585">${s.template?.name || ''}</span></div>
          <div class="sub">${s.stateLabel} · ${n} бойцов · ${s.objective?.pointId ? s.objective.pointId : s.objective?.sectorId != null ? 'сектор' : 'без задачи'}</div>
          <div class="bars">
            <div class="bar"><i style="width:${Math.round(s.hpRatio() * 100)}%"></i></div>
            <div class="bar ammo"><i style="width:${ammo}%"></i></div>
            <div class="bar morale"><i style="width:${morale}%"></i></div>
          </div>
        </div>
        <div class="badge ${lowAmmo ? 'low' : ''}">${ammo}%</div>
      </div>`;
    }).join('');
    this.el.squads.innerHTML = html || `<div style="padding:10px;color:#8c9585;font-size:12px">Отрядов нет. Нажмите «+ Отряд».</div>`;
  }

  renderSelection() {
    const game = this.game;
    const ids = [...game.selectedSquads];
    const squads = ids.map((id) => game.squads.get(id)).filter(Boolean);
    if (!squads.length) {
      this.el.selection.innerHTML = `<div class="title">Нет выбранных отрядов</div>
        <div class="row"><span>ЛКМ — выделить, ПКМ — приказ, Tab — командовать</span></div>`;
      return;
    }
    const s = squads[0];
    const more = squads.length > 1 ? ` +${squads.length - 1}` : '';
    this.el.selection.innerHTML = `
      <div class="title">${s.name}${more}</div>
      <div class="row">
        <span>${s.template?.name || ''}</span>
        <span>${s.count()} чел.</span>
        <span>HP ${Math.round(s.hpRatio() * 100)}%</span>
        <span>БК ${Math.round(s.ammoRatio() * 100)}%</span>
        <span>Мораль ${Math.round(s.morale())}</span>
      </div>
      <div class="row" style="margin-top:3px;font-size:11px">
        <span>${s.stateLabel}</span>
        <span>${this.behaviorLabel(s.behavior)}</span>
        <span>${s.strategyId ? game.cfg.strategies[s.strategyId]?.name || '' : ''}</span>
        <span>${s.directiveId ? 'директива активна' : ''}</span>
      </div>`;
  }

  renderFeed() {
    const game = this.game;
    const alerts = game.alertLog.slice(-14).reverse();
    this.el.feed.innerHTML = alerts.map((a) => `<div class="kind-${a.kind}"><time>${Math.floor(a.t / 60)}:${String(Math.floor(a.t % 60)).padStart(2, '0')}</time>${a.text}</div>`).join('');
  }

  renderJournal() {
    const game = this.game;
    const rows = game.api.recent(12);
    this.el.journal.innerHTML = rows.map((j) => `<div class="${j.result === 'refused' || j.result === 'cancelled' ? 'refused' : ''}">
      <span class="src">${j.sourceLabel}</span> · ${j.label} ${j.actors?.length ? `[${j.actors.join(', ')}]` : ''} — ${j.result || 'в очереди'}${j.delay ? ` (${j.delay.toFixed(1)} с)` : ''}
    </div>`).join('');
  }

  renderMinimap() {
    const game = this.game;
    if (!this.minimapRenderer) return;
    this.minimapRenderer(this.el.minimap, game);
  }

  updateBuildAffordability() {
    const game = this.game;
    const stock = game.logistics.stock[game.playerFaction];
    this.el.buildItems.querySelectorAll('[data-build]').forEach((el) => {
      const def = game.cfg.building(el.dataset.build);
      const can = Object.entries(def.cost || {}).every(([k, v]) => (stock[k] || 0) >= v);
      el.classList.toggle('cant', !can);
    });
    this.el.buildHint.textContent = this.buildMode ? 'ЛКМ — поставить чертёж, ESC — отменить' : 'Выберите постройку';
  }
}
