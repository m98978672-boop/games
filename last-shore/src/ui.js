// ============================================================
//  Интерфейс: шкалы, часы, хотбар, сумка, крафт, подсказки, оверлеи.
//  Никакой логики игры — только отображение и вызовы колбэков.
//
//  Хотбар пустой: игрок сам перетаскивает в него предметы из сумки.
// ============================================================

const $ = (id) => document.getElementById(id);

export class UI {
  constructor(items, hotbarSize, bagOrder) {
    this.items = items;
    this.hotbarSize = hotbarSize;
    this.bagOrder = bagOrder;

    this.hotbar = new Array(hotbarSize).fill(null);
    this.inv = {};
    this.selectedSlot = 0;

    // колбэки ставит игра
    this.onAssign = null;      // (id, индекс слота) — положить предмет в слот
    this.onClear = null;       // (индекс слота) — убрать предмет из слота
    this.onClickItem = null;   // (id) — клик по предмету в сумке

    this.el = {
      hud: $('hud'),
      day: $('hud-day'),
      clock: $('hud-clock'),
      weather: $('hud-weather'),
      fps: $('hud-fps'),
      prompt: $('prompt'),
      toasts: $('toasts'),
      hint: $('hint'),
      inv: $('inventory'),
      invList: $('inv-list'),
      invHotbar: $('inv-hotbar'),
      craft: $('crafting'),
      craftList: $('craft-list'),
      hotbar: $('hotbar'),
      start: $('start'),
      pause: $('pause'),
      death: $('death'),
      deathText: $('death-text'),
      pauseStats: $('pause-stats'),
      nogl: $('nogl'),
      fatal: $('fatal'),
      fuel: $('hud-fuel'),
    };
    this.bars = {
      health: { fill: $('bar-health'), value: $('val-health'), node: document.querySelector('.bar-health') },
      thirst: { fill: $('bar-thirst'), value: $('val-thirst'), node: document.querySelector('.bar-thirst') },
      hunger: { fill: $('bar-hunger'), value: $('val-hunger'), node: document.querySelector('.bar-hunger') },
      warmth: { fill: $('bar-warmth'), value: $('val-warmth'), node: document.querySelector('.bar-warmth') },
      stamina: { fill: $('bar-stamina'), value: $('val-stamina'), node: document.querySelector('.bar-stamina') },
    };

    this._lastPrompt = null;
    this._lastBagSig = '';
    this._lastCraftSig = '';
    this._hintTimer = setTimeout(() => this.el.hint && this.el.hint.classList.add('hidden'), 26000);

    this.drag = null;
    this.ghost = null;

    this.buildHotbar();
    this.buildInvHotbar();
    this.bindDrag();
  }

  // ------------------------------------------------------------
  //  Хотбар
  // ------------------------------------------------------------

  _slotMarkup(index, cls) {
    return `<div class="${cls}" data-index="${index}" data-drop="slot">
      <span class="slot-key">${(index + 1) % 10}</span>
      <span class="slot-icon"></span>
      <span class="slot-name"></span>
      <span class="slot-count"></span>
    </div>`;
  }

  buildHotbar() {
    const bar = this.el.hotbar;
    if (!bar) return;
    bar.innerHTML = Array.from({ length: this.hotbarSize }, (_, i) => this._slotMarkup(i, 'slot')).join('');
  }

  buildInvHotbar() {
    const bar = this.el.invHotbar;
    if (!bar) return;
    bar.innerHTML = Array.from({ length: this.hotbarSize }, (_, i) => this._slotMarkup(i, 'mini-slot')).join('');
  }

  bindHotbar(onSelect, onUse) {
    this.el.hotbar.querySelectorAll('.slot').forEach((slot) => {
      slot.addEventListener('click', () => {
        onSelect(Number(slot.dataset.index));
        onUse?.();
      });
    });
  }

  /** id — предмет в слоте, active — выбран ли он, big — крупный слот HUD */
  _paintSlot(slot, id, optional = {}) {
    if (!slot) return;
    const inv = this.inv;
    const item = id && this.items[id] ? this.items[id] : null;
    const count = item ? (inv[id] || 0) : 0;

    slot.classList.toggle('active', !!optional.active);
    slot.classList.toggle('empty', !item || count === 0);
    slot.dataset.item = item ? id : '';
    slot.title = item
      ? `${item.name} · ${count} шт.`
      : 'Пусто — открой сумку (I) и перетащи предмет';

    const icon = slot.querySelector('.slot-icon');
    const name = slot.querySelector('.slot-name');
    const counter = slot.querySelector('.slot-count');
    if (icon) icon.innerHTML = item ? item.icon : '';
    if (name) name.textContent = item ? item.name : '';
    if (counter) counter.textContent = item && count > 1 ? count : '';
  }

  setHotbar(inv, hotbar, selected) {
    if (inv) this.inv = inv;
    if (hotbar) this.hotbar = hotbar;
    if (typeof selected === 'number') this.selectedSlot = selected;

    this.el.hotbar.querySelectorAll('.slot').forEach((slot, i) => {
      this._paintSlot(slot, this.hotbar[i], { active: i === this.selectedSlot });
    });
    if (this.el.invHotbar) {
      this.el.invHotbar.querySelectorAll('.mini-slot').forEach((slot, i) => {
        this._paintSlot(slot, this.hotbar[i], { active: i === this.selectedSlot });
      });
    }
  }

  setFuel(fire) {
    if (!this.el.fuel) return;
    if (!fire) {
      this.el.fuel.classList.add('hidden');
      return;
    }
    const pct = Math.round((fire.fuel / fire.maxFuel) * 100);
    this.el.fuel.classList.remove('hidden');
    this.el.fuel.innerHTML = `<span>🔥</span><div class="fuel-track"><i style="width:${pct}%"></i></div><b>${Math.ceil(fire.fuel)}с</b>`;
  }

  // ------------------------------------------------------------
  //  Шкалы и верхняя строка
  // ------------------------------------------------------------

  setBars(s) {
    const pairs = [
      ['health', s.health], ['thirst', s.thirst], ['hunger', s.hunger],
      ['warmth', s.warmth], ['stamina', s.stamina],
    ];
    for (const [key, value] of pairs) {
      const b = this.bars[key];
      if (!b) continue;
      const v = Math.max(0, Math.min(100, value));
      b.fill.style.width = v.toFixed(1) + '%';
      b.value.textContent = Math.round(v);
      b.node.classList.toggle('critical', v < 20);
    }
  }

  setTop({ day, clock, weather, fps }) {
    if (day !== undefined) this.el.day.textContent = day;
    if (clock !== undefined) this.el.clock.textContent = clock;
    if (weather !== undefined) this.el.weather.textContent = weather;
    if (fps !== undefined) this.el.fps.textContent = fps + ' fps';
  }

  setPrompt(html) {
    if (html === this._lastPrompt) return;
    this._lastPrompt = html;
    if (!html) this.el.prompt.classList.add('hidden');
    else {
      this.el.prompt.innerHTML = html;
      this.el.prompt.classList.remove('hidden');
    }
  }

  toast(text, warn = false) {
    const node = document.createElement('div');
    node.className = 'toast' + (warn ? ' warn' : '');
    node.textContent = text;
    this.el.toasts.appendChild(node);
    setTimeout(() => node.classList.add('out'), 2600);
    setTimeout(() => node.remove(), 3100);
    while (this.el.toasts.children.length > 5) this.el.toasts.firstChild.remove();
  }

  // ------------------------------------------------------------
  //  Сумка
  // ------------------------------------------------------------

  renderBag(inv, hotbar) {
    if (inv) this.inv = inv;
    if (hotbar) this.hotbar = hotbar;
    if (!this.el.invList) return;

    const ids = this.bagOrder.filter((id) => (this.inv[id] || 0) > 0);
    const sig = ids.map((id) => `${id}:${this.inv[id]}`).join('|') + '#' + this.hotbar.join(',');
    if (sig === this._lastBagSig) return;
    this._lastBagSig = sig;

    if (!ids.length) {
      this.el.invList.innerHTML = '<li class="inv-empty">Пусто. Добывай палки (ЛКМ по дереву), камни и волокно.</li>';
      return;
    }

    this.el.invList.innerHTML = ids
      .map((id) => {
        const item = this.items[id];
        const inHand = this.hotbar.includes(id);
        return `<li class="inv-card${inHand ? ' in-hand' : ''}" data-item="${id}">
          <span class="card-icon">${item.icon}</span>
          <span class="card-name">${item.name}</span>
          <span class="card-count">${this.inv[id]}</span>
        </li>`;
      })
      .join('');
  }

  // ------------------------------------------------------------
  //  Перетаскивание предметов в слоты
  // ------------------------------------------------------------

  bindDrag() {
    document.addEventListener('pointerdown', (e) => {
      if (e.button !== 0) return;
      const el = e.target instanceof Element ? e.target : null;
      if (!el) return;

      const mini = el.closest('.mini-slot');
      if (mini && this.el.inv && !this.el.inv.classList.contains('hidden')) {
        const index = Number(mini.dataset.index);
        const id = this.hotbar[index];
        if (id) {
          this._startDrag(e, { id, from: 'slot', index });
          return;
        }
      }

      const card = el.closest('.inv-card');
      if (card && this.el.inv && !this.el.inv.classList.contains('hidden')) {
        const id = card.dataset.item;
        if (id && (this.inv[id] || 0) > 0) this._startDrag(e, { id, from: 'bag' });
      }
    });

    document.addEventListener('pointermove', (e) => {
      if (!this.drag) return;
      if (Math.abs(e.clientX - this.drag.x0) + Math.abs(e.clientY - this.drag.y0) > 4) this.drag.moved = true;
      this._moveGhost(e);
      const slot = document.elementFromPoint(e.clientX, e.clientY)?.closest('[data-drop="slot"]');
      document.querySelectorAll('.slot.hover, .mini-slot.hover').forEach((n) => n.classList.remove('hover'));
      if (slot) slot.classList.add('hover');
    });

    document.addEventListener('pointerup', (e) => {
      if (!this.drag) return;
      const drag = this.drag;
      const target = document.elementFromPoint(e.clientX, e.clientY);
      const slot = target?.closest('[data-drop="slot"]');
      this._endDrag();

      if (slot) {
        this.onAssign?.(drag.id, Number(slot.dataset.index), drag);
      } else if (drag.from === 'slot' && target?.closest('#inventory')) {
        this.onClear?.(drag.index);
      } else if (!drag.moved) {
        this.onClickItem?.(drag.id);
      }
    });

    document.addEventListener('pointercancel', () => this._endDrag());
  }

  _startDrag(e, drag) {
    this.drag = { ...drag, x0: e.clientX, y0: e.clientY, moved: false };
    const item = this.items[drag.id];
    const ghost = document.createElement('div');
    ghost.className = 'drag-ghost';
    ghost.innerHTML = `${item.icon}<b>${item.name}</b>`;
    document.body.appendChild(ghost);
    this.ghost = ghost;
    this._moveGhost(e);
    document.body.classList.add('dragging-item');
  }

  _moveGhost(e) {
    if (!this.ghost) return;
    this.ghost.style.left = e.clientX + 'px';
    this.ghost.style.top = e.clientY + 'px';
  }

  _endDrag() {
    if (this.ghost) this.ghost.remove();
    this.ghost = null;
    this.drag = null;
    document.body.classList.remove('dragging-item');
    document.querySelectorAll('.slot.hover, .mini-slot.hover').forEach((n) => n.classList.remove('hover'));
  }

  // ------------------------------------------------------------
  //  Крафт
  // ------------------------------------------------------------

  renderCraft(recipes, inv, onCraft) {
    if (inv) this.inv = inv;
    const sig = recipes.map((r) => Object.entries(r.need).map(([k, v]) => ((this.inv[k] || 0) >= v ? 1 : 0)).join('')).join('');
    if (sig === this._lastCraftSig) return;
    this._lastCraftSig = sig;

    this.el.craftList.innerHTML = recipes
      .map((r) => {
        const can = Object.entries(r.need).every(([k, v]) => (this.inv[k] || 0) >= v);
        const cost = Object.entries(r.need)
          .map(([k, v]) => {
            const has = (this.inv[k] || 0) >= v;
            return `<span class="cost ${has ? 'ok' : 'lack'}">${this.items[k].name} ${this.inv[k] || 0}/${v}</span>`;
          })
          .join('');
        return `<li class="recipe ${can ? 'can' : 'cannot'}" data-recipe="${r.id}">
          <span class="row-icon">${this.items[r.id].icon}</span>
          <div class="recipe-body">
            <b>${r.name}${r.needFire ? ' <span class="prompt-warn">🔥 у костра</span>' : ''}</b>
            <em>${r.note}</em>
            <div class="costs">${cost}</div>
          </div>
          <button class="craft-btn" data-craft="${r.id}" ${can ? '' : 'disabled'}>${can ? 'Сделать' : '—'}</button>
        </li>`;
      })
      .join('');

    this.el.craftList.querySelectorAll('[data-craft]').forEach((btn) => {
      btn.addEventListener('click', () => onCraft(btn.dataset.craft));
    });
  }

  toggleBag(force) {
    const show = force !== undefined ? force : this.el.inv.classList.contains('hidden');
    this.el.inv.classList.toggle('hidden', !show);
    if (show) this.el.craft.classList.add('hidden');
    return show;
  }

  toggleCraft(force, recipes, inv, onCraft) {
    const show = force !== undefined ? force : this.el.craft.classList.contains('hidden');
    this.el.craft.classList.toggle('hidden', !show);
    if (show) {
      this.el.inv.classList.add('hidden');
      this._lastCraftSig = '';
      this.renderCraft(recipes, inv, onCraft);
    }
    return show;
  }

  isPanelOpen() {
    return !this.el.inv.classList.contains('hidden') || !this.el.craft.classList.contains('hidden');
  }

  closePanels() {
    this.el.inv.classList.add('hidden');
    this.el.craft.classList.add('hidden');
    this._endDrag();
  }

  // ------------------------------------------------------------
  //  Экраны
  // ------------------------------------------------------------

  showScreen(name) {
    for (const id of ['start', 'pause', 'death', 'nogl']) {
      this.el[id].classList.toggle('hidden', id !== name);
    }
    this.el.hud.classList.toggle('hidden', name !== null);
    if (name !== null) this.closePanels();
  }

  hideScreens() {
    for (const id of ['start', 'pause', 'death', 'nogl', 'fatal']) this.el[id].classList.add('hidden');
    this.el.hud.classList.remove('hidden');
  }

  showDeath(days, cause) {
    this.el.deathText.textContent = `Ты продержался ${days} ${plural(days, 'день', 'дня', 'дней')}. ${cause}`;
    this.showScreen('death');
  }

  setPauseStats(text) {
    this.el.pauseStats.textContent = text;
  }
}

export function plural(n, one, few, many) {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return one;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return few;
  return many;
}
