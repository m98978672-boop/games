// ============================================================
//  Интерфейс: шкалы, часы, хотбар, сумка, подсказки, оверлеи.
//  Никакой логики игры — только отображение.
// ============================================================

const $ = (id) => document.getElementById(id);

const ITEM_NAMES = {
  wood: 'Палки',
  stone: 'Камни',
  fiber: 'Волокно',
  coconut: 'Кокосы',
  berries: 'Ягоды',
};

export class UI {
  constructor() {
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
      start: $('start'),
      pause: $('pause'),
      death: $('death'),
      deathText: $('death-text'),
      pauseStats: $('pause-stats'),
      nogl: $('nogl'),
    };
    this.bars = {
      health: { fill: $('bar-health'), value: $('val-health'), node: document.querySelector('.bar-health') },
      thirst: { fill: $('bar-thirst'), value: $('val-thirst'), node: document.querySelector('.bar-thirst') },
      hunger: { fill: $('bar-hunger'), value: $('val-hunger'), node: document.querySelector('.bar-hunger') },
      warmth: { fill: $('bar-warmth'), value: $('val-warmth'), node: document.querySelector('.bar-warmth') },
      stamina: { fill: $('bar-stamina'), value: $('val-stamina'), node: document.querySelector('.bar-stamina') },
    };
    this.counts = { coconut: $('count-coconut'), berries: $('count-berries') };
    this._lastPrompt = null;
    this._lastInv = '';
    this._hintTimer = setTimeout(() => this.el.hint && this.el.hint.classList.add('hidden'), 22000);
  }

  setBars(s) {
    const pairs = [
      ['health', s.health],
      ['thirst', s.thirst],
      ['hunger', s.hunger],
      ['warmth', s.warmth],
      ['stamina', s.stamina],
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
    if (!html) {
      this.el.prompt.classList.add('hidden');
    } else {
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
    // не копим больше 5 сообщений
    while (this.el.toasts.children.length > 5) this.el.toasts.firstChild.remove();
  }

  setCounts(inv) {
    for (const key of Object.keys(this.counts)) {
      const n = inv[key] || 0;
      this.counts[key].textContent = n;
      const slot = this.counts[key].closest('.slot');
      if (slot) slot.classList.toggle('empty', n === 0);
    }
  }

  setInventory(inv) {
    const entries = Object.entries(ITEM_NAMES)
      .map(([key, name]) => [name, inv[key] || 0])
      .filter(([, n]) => n > 0);

    const signature = entries.map(([n, c]) => `${n}:${c}`).join('|');
    if (signature === this._lastInv) return;
    this._lastInv = signature;

    if (!entries.length) {
      this.el.invList.innerHTML = '<li class="empty-row">Пусто. Подойди к предмету и нажми E.</li>';
      return;
    }
    this.el.invList.innerHTML = entries
      .map(([name, n]) => `<li><span>${name}</span><span>${n}</span></li>`)
      .join('');
  }

  toggleInventory(force) {
    const isHidden = this.el.inv.classList.contains('hidden');
    const show = force !== undefined ? force : isHidden;
    this.el.inv.classList.toggle('hidden', !show);
    return show;
  }

  isInventoryOpen() {
    return !this.el.inv.classList.contains('hidden');
  }

  showScreen(name) {
    for (const id of ['start', 'pause', 'death', 'nogl']) {
      this.el[id].classList.toggle('hidden', id !== name);
    }
    this.el.hud.classList.toggle('hidden', name !== null);
    if (name !== null) this.el.inv.classList.add('hidden');
  }

  hideScreens() {
    for (const id of ['start', 'pause', 'death', 'nogl']) this.el[id].classList.add('hidden');
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
