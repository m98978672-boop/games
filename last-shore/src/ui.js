// ============================================================
//  Интерфейс: шкалы, часы, хотбар, сумка, крафт, подсказки, оверлеи.
//  Никакой логики игры — только отображение и вызовы колбэков.
// ============================================================

const $ = (id) => document.getElementById(id);

export class UI {
  constructor(items, hotbarOrder, bagOrder) {
    this.items = items;
    this.hotbarOrder = hotbarOrder;
    this.bagOrder = bagOrder;

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

    this.buildHotbar();
  }

  // ------------------------------------------------------------
  //  Хотбар
  // ------------------------------------------------------------

  buildHotbar() {
    const bar = this.el.hotbar;
    if (!bar) return;
    bar.innerHTML = this.hotbarOrder
      .map((id, i) => {
        const item = this.items[id];
        return `<div class="slot" data-index="${i}" data-item="${id}" title="${item.name}">
          <span class="slot-key">${i + 1}</span>
          <span class="slot-icon">${item.icon}</span>
          <span class="slot-name">${item.name}</span>
          <span class="slot-count" data-count="${id}"></span>
        </div>`;
      })
      .join('');
  }

  bindHotbar(onSelect, onUse) {
    this.el.hotbar.querySelectorAll('.slot').forEach((slot) => {
      slot.addEventListener('click', () => {
        onSelect(Number(slot.dataset.index));
        onUse?.(slot.dataset.item);
      });
    });
  }

  setHotbar(inv, selected, toolDurability = null) {
    this.hotbarOrder.forEach((id, i) => {
      const slot = this.el.hotbar.querySelector(`.slot[data-index="${i}"]`);
      if (!slot) return;
      const count = inv[id] || 0;
      const counter = slot.querySelector('[data-count]');
      if (counter) counter.textContent = count > 0 ? count : '';
      slot.classList.toggle('empty', count === 0);
      slot.classList.toggle('active', i === selected);
    });
    if (this.el.fuel) this.el.fuel.classList.add('hidden');
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
  //  Сумка и крафт
  // ------------------------------------------------------------

  renderBag(inv) {
    const rows = this.bagOrder
      .filter((id) => (inv[id] || 0) > 0)
      .map((id) => {
        const item = this.items[id];
        return `<li><span class="row-icon">${item.icon}</span><span class="row-name">${item.name}</span><span class="row-count">${inv[id]}</span></li>`;
      });
    const sig = rows.join('|');
    if (sig === this._lastBagSig) return;
    this._lastBagSig = sig;
    this.el.invList.innerHTML = rows.length
      ? rows.join('')
      : '<li class="empty-row">Пусто. Добывай палки (ЛКМ по дереву), камни и волокно.</li>';
  }

  renderCraft(recipes, inv, onCraft) {
    const sig = recipes.map((r) => Object.entries(r.need).map(([k, v]) => (inv[k] || 0) >= v).join('')).join('');
    if (sig === this._lastCraftSig) return;
    this._lastCraftSig = sig;

    this.el.craftList.innerHTML = recipes
      .map((r) => {
        const can = Object.entries(r.need).every(([k, v]) => (inv[k] || 0) >= v);
        const cost = Object.entries(r.need)
          .map(([k, v]) => {
            const has = (inv[k] || 0) >= v;
            return `<span class="cost ${has ? 'ok' : 'lack'}">${this.items[k].name} ${inv[k] || 0}/${v}</span>`;
          })
          .join('');
        return `<li class="recipe ${can ? 'can' : 'cannot'}" data-recipe="${r.id}">
          <span class="row-icon">${this.items[r.id].icon}</span>
          <div class="recipe-body">
            <b>${r.name}</b>
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
