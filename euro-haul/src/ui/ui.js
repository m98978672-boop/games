// Интерфейс: гараж, рынок грузов, автосалон, карта, настройки, HUD и уведомления.
import { COUNTRIES, CITY_BY_ID, CITIES } from '../data/cities.js';
import { TRUCK_MODELS, PAINT_COLORS, UPGRADES, SKILLS, levelForXp } from '../data/trucks.js';
import { ACHIEVEMENTS } from '../data/achievements.js';
import { fmt, fmtMoney, fmtDuration, fmtTime, clamp, fmtDistance } from '../core/math.js';
import { skillPrice } from '../core/save.js';

const $ = (id) => document.getElementById(id);

export function truckSvg(color = '#2f7fa8', trailer = true) {
  return `<svg class="truck-svg" viewBox="0 0 260 110" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <ellipse cx="130" cy="101" rx="118" ry="6" fill="rgba(0,0,0,.35)"/>
    ${trailer ? `<rect x="6" y="30" width="118" height="52" rx="4" fill="#e7e2d4" stroke="#b9b3a4"/>
    <rect x="6" y="64" width="118" height="7" fill="#2f4a3c" opacity=".8"/>
    <rect x="16" y="40" width="70" height="8" rx="2" fill="#8d9488" opacity=".55"/>
    <circle cx="28" cy="88" r="10" fill="#1d2225"/><circle cx="28" cy="88" r="4" fill="#aab2b6"/>
    <circle cx="52" cy="88" r="10" fill="#1d2225"/><circle cx="52" cy="88" r="4" fill="#aab2b6"/>
    <circle cx="104" cy="88" r="10" fill="#1d2225"/><circle cx="104" cy="88" r="4" fill="#aab2b6"/>` : ''}
    <path d="M126 32 h44 l10 10 h30 a6 6 0 0 1 6 6 v40 h-90 z" fill="${color}" stroke="rgba(0,0,0,.25)"/>
    <path d="M172 38 l9 8 h-9 z" fill="#9fd0e0" opacity=".9"/>
    <rect x="176" y="48" width="32" height="18" rx="2" fill="#9fd0e0" opacity=".75"/>
    <rect x="126" y="74" width="90" height="8" fill="rgba(0,0,0,.22)"/>
    <rect x="206" y="60" width="12" height="5" rx="1" fill="#ffe9a8"/>
    <circle cx="142" cy="88" r="11" fill="#1d2225"/><circle cx="142" cy="88" r="4.5" fill="#aab2b6"/>
    <circle cx="198" cy="88" r="11" fill="#1d2225"/><circle cx="198" cy="88" r="4.5" fill="#aab2b6"/>
    <circle cx="222" cy="88" r="11" fill="#1d2225"/><circle cx="222" cy="88" r="4.5" fill="#aab2b6"/>
  </svg>`;
}

export class UI {
  constructor(game) {
    this.game = game;
    this.navTab = 'jobs';
    this.jobFilter = 'all';
    this.toastTimers = [];
    this.lastHud = 0;
    this.bindEvents();
    this.buildTouchZones();
  }

  bindEvents() {
    $('btn-continue').addEventListener('click', () => this.game.continueCareer());
    $('btn-new').addEventListener('click', () => this.game.newCareerDialog());
    $('btn-profiles').addEventListener('click', () => this.game.profilesDialog());
    $('btn-settings').addEventListener('click', () => this.showSettings(true));
    $('btn-about').addEventListener('click', () => this.showAbout());
    $('btn-pause').addEventListener('click', () => this.game.togglePause());
    $('btn-fullscreen').addEventListener('click', () => this.game.toggleFullscreen());
    $('g-menu').addEventListener('click', () => this.game.togglePause());
    $('modal-close').addEventListener('click', () => this.closeModal());

    document.querySelectorAll('.garage-nav button').forEach((btn) => {
      btn.addEventListener('click', () => {
        this.navTab = btn.dataset.nav;
        document.querySelectorAll('.garage-nav button').forEach((b) => b.classList.toggle('active', b === btn));
        this.renderGarage();
      });
    });

    // Делегирование кликов по data-act.
    document.body.addEventListener('click', (e) => {
      const el = e.target.closest('[data-act]');
      if (!el) return;
      const act = el.dataset.act;
      const arg = el.dataset.arg;
      this.handleAction(act, arg, el);
      this.game.audio.click();
    });

    // Динамические поля.
    document.body.addEventListener('input', (e) => {
      const el = e.target;
      if (el.dataset.input === 'fuel') {
        $('fuel-amount').textContent = fmt(clamp(+el.value, 0, +el.max)) + ' л';
        const price = this.game.currentFuelPrice || 1.7;
        $('fuel-total').textContent = fmtMoney(clamp(+el.value, 0, +el.max) * price);
      }
      if (el.dataset.input === 'volume') {
        this.game.setSetting('volume', +el.value / 100);
        const label = $('volume-value');
        if (label) label.textContent = el.value + '%';
      }
    });
    document.body.addEventListener('change', (e) => {
      const el = e.target;
      if (el.dataset.setting) this.game.setSetting(el.dataset.setting, el.type === 'checkbox' ? el.checked : el.value);
      if (el.dataset.select === 'truck') this.game.selectTruck(el.value);
      if (el.dataset.select === 'paint') this.game.setPaint(el.value);
      if (el.dataset.select === 'mapcity') this.game.freeDrive(el.value);
    });

    window.addEventListener('keydown', (e) => this.onKey(e));
  }

  onKey(e) {
    const modalOpen = !$('modal-root').classList.contains('hidden');
    if (modalOpen && e.key === 'Enter') {
      const primary = $('modal-foot').querySelector('.btn-primary');
      if (primary) primary.click();
    }
  }

  buildTouchZones() {
    document.querySelectorAll('[data-touch]').forEach((btn) => {
      const key = btn.dataset.touch;
      const map = { left: 'KeyA', right: 'KeyD', gas: 'KeyW', brake: 'KeyS' };
      const code = map[key];
      const down = (ev) => {
        ev.preventDefault();
        this.game.input.touch[code] = true;
        btn.classList.add('active');
      };
      const up = (ev) => {
        ev.preventDefault();
        this.game.input.touch[code] = false;
        btn.classList.remove('active');
      };
      btn.addEventListener('pointerdown', down);
      btn.addEventListener('pointerup', up);
      btn.addEventListener('pointercancel', up);
      btn.addEventListener('pointerleave', up);
    });
  }

  handleAction(act, arg, el) {
    const g = this.game;
    switch (act) {
      case 'accept-job': {
        const job = g.offers?.find((o) => o.id === arg);
        if (job) g.acceptJob(job);
        break;
      }
      case 'continue-job':
        g.continueActiveJob();
        break;
      case 'abandon-job':
        g.abandonJob();
        break;
      case 'service': {
        if (arg === 'fuel') g.refuelDialog();
        else if (arg === 'repair') g.repairDialog();
        else if (arg === 'rest') g.restDialog();
        else if (arg === 'all') g.fullService();
        break;
      }
      case 'buy-truck': {
        const model = TRUCK_MODELS.find((m) => m.id === arg);
        if (model) g.buyTruckDialog(model);
        break;
      }
      case 'buy-truck-confirm':
        this.closeModal();
        g.buyTruck(arg);
        break;
      case 'filter':
        this.jobFilter = arg;
        this.renderGarage();
        break;
      case 'select-truck':
        g.selectTruck(arg);
        break;
      case 'take-owned':
        g.takeOwnedTruck(Number(arg));
        break;
      case 'sell-truck':
        g.sellTruckDialog();
        break;
      case 'paint':
        g.setPaint(arg);
        break;
      case 'upgrade': {
        const [kind, id] = arg.split(':');
        g.buyUpgrade(kind, +id);
        break;
      }
      case 'fuel-confirm': {
        const amount = +$('fuel-range').value;
        this.closeModal();
        g.refuel(amount);
        break;
      }
      case 'repair-confirm': {
        this.closeModal();
        g.repair(arg);
        break;
      }
      case 'rest-confirm':
        this.closeModal();
        g.rest();
        break;
      case 'buy-garage':
        g.buyGarage(arg);
        break;
      case 'hire-driver':
        g.hireDriverDialog();
        break;
      case 'fire-driver':
        g.fireDriver(arg);
        break;
      case 'skill':
        g.buySkill(arg);
        break;
      case 'reset-save':
        g.resetDialog();
        break;
      case 'delete-slot':
        g.deleteSlot(+arg);
        break;
      case 'load-slot':
        g.loadSlot(+arg);
        break;
      case 'new-slot':
        g.newCareerDialog(+arg);
        break;
      case 'quit-menu':
        this.closeModal();
        g.returnToMenu();
        break;
      case 'free-drive':
        g.freeDrive(arg);
        break;
      case 'goto-jobs':
        this.closeModal();
        g.openGarageTab('jobs');
        break;
      case 'photo':
        g.takeScreenshot();
        break;
      case 'help-driving':
        this.closeModal();
        g.showHelp();
        break;
      case 'toggle-setting': {
        const key = arg;
        const cur = g.settings[key];
        g.setSetting(key, !cur);
        this.showSettings(true);
        break;
      }
      case 'reset-settings':
        g.resetSettings();
        this.showSettings(true);
        break;
      case 'interact':
        g.interact();
        break;
      case 'camera':
        g.cycleCamera();
        break;
      case 'touch-cruise':
        g.toggleCruise();
        break;
      case 'touch-lights':
        g.toggleLights();
        break;
      case 'fullscreen':
        g.toggleFullscreen();
        break;
      case 'free-drive-select': {
        const v = document.querySelector('[data-select="mapcity"]')?.value;
        if (v) g.freeDrive(v);
        break;
      }
      case 'close':
        this.closeModal();
        break;
      default:
        break;
    }
  }

  setScreen(name) {
    $('screen-menu').classList.toggle('hidden', name !== 'menu');
    $('screen-garage').classList.toggle('hidden', name !== 'garage');
    $('screen-loading').classList.toggle('hidden', name !== 'loading');
    $('hud').classList.toggle('hidden', name !== 'driving');
    if (name !== 'driving') this.closeModal();
  }

  loading(title = 'Загрузка…', sub = '') {
    $('loading-title').textContent = title;
    $('loading-sub').textContent = sub;
    this.setScreen('loading');
  }

  // ---------- HUD ----------
  updateHud(state) {
    const p = this.game.profile;
    if (!p) return;
    $('hud-money').textContent = fmtMoney(p.money);
    const lvl = levelForXp(p.xp || 0);
    $('hud-level').textContent = lvl.level;
    $('hud-xp').style.width = `${clamp((lvl.current / lvl.need) * 100, 0, 100)}%`;
    $('hud-clock').textContent = fmtTime(this.game.clock.minutes);
    $('hud-day').textContent = 'День ' + this.game.clock.day;
    $('hud-weather').textContent = state.weatherName || '—';
    $('hud-temp').textContent = Math.round(state.airTemp ?? 17) + '°';

    $('dash-speed').textContent = Math.round(state.speedKmh);
    $('dash-gear').textContent = state.gear === -1 ? 'R' : state.gear === 0 ? 'N' : state.gear;
    $('dash-mode').textContent = state.autoGearbox ? 'АВТО' : 'РУЧН.';
    $('bar-rpm').style.width = `${clamp((state.rpm / 2400) * 100, 0, 100)}%`;
    $('val-rpm').textContent = Math.round(state.rpm);
    $('bar-fuel').style.width = `${clamp(state.fuelPct * 100, 0, 100)}%`;
    $('val-fuel').textContent = Math.round(state.fuel) + ' л';
    $('bar-temp').style.width = `${clamp(((state.temp - 40) / 80) * 100, 0, 100)}%`;
    $('val-temp').textContent = Math.round(state.temp) + '°C';
    $('bar-cond').style.width = `${clamp(state.condition, 0, 100)}%`;
    $('val-cond').textContent = Math.round(state.condition) + '%';
    $('bar-fatigue').style.width = `${clamp(state.fatigue, 0, 100)}%`;
    $('val-fatigue').textContent = Math.round(state.fatigue) + '%';
    $('speed-limit').textContent = Math.round(state.speedLimit);
    $('speed-limit').style.borderColor = state.speedLimit <= 50 ? '#f2b544' : '#c8362c';
    $('speed-limit').style.color = '#1b1b18';

    const cruise = $('cruise-indicator');
    if (state.cruise) {
      cruise.classList.remove('hidden');
      $('cruise-speed').textContent = Math.round(state.cruise);
    } else cruise.classList.add('hidden');

    if (state.speedKmh > state.speedLimit + 8) {
      $('speed-limit').classList.add('over-speed');
    } else $('speed-limit').classList.remove('over-speed');

    // Маршрут.
    if (this.game.route && this.game.job) {
      const job = this.game.job;
      const phase = this.game.phase;
      $('ra-phase').textContent =
        phase === 'pickup' ? 'ЗАБРАТЬ ГРУЗ' : phase === 'delivery' ? 'ДОСТАВКА' : phase === 'unloading' ? 'ВЫГРУЗКА' : 'РЕЙС';
      const remains = this.game.remainingMeters();
      const target = phase === 'pickup' ? 'Пункт погрузки' : job.toName;
      $('ra-from').textContent = job.fromName;
      $('ra-to').textContent = target;
      $('ra-left').textContent = fmtDistance(Math.abs(remains));
      const etaMin = this.game.etaMinutes();
      $('ra-eta').textContent = 'ETA ' + fmtTime(this.game.clock.minutes + etaMin);
      const deadlineLeft = job.deadlineMin - this.game.jobElapsed();
      $('ra-deadline').textContent = phase === 'pickup' ? '—' : fmtDuration(deadlineLeft);
      $('ra-deadline').style.color = deadlineLeft < 60 ? 'var(--red)' : '';
      $('ra-cargo').textContent = job.cargo;
      const pct = clamp((1 - Math.abs(remains) / Math.max(1, this.game.phaseDistance())) * 100, 0, 100);
      $('ra-progress').style.width = pct + '%';

      const action = $('ra-action');
      if (this.game.interaction) {
        action.innerHTML = `<span class="arrive-hint">${this.game.interaction.hint}</span>`;
      } else if (this.game.parkedAtDepot) {
        action.innerHTML = `<button class="btn btn-primary btn-sm" data-act="${this.game.parkedAtDepot.act}" data-arg="${this.game.parkedAtDepot.arg || ''}">${this.game.parkedAtDepot.label}</button>`;
      } else {
        action.innerHTML = '';
      }
    }
    if (state.fps && this.game.settings.showFps) {
      $('hud-weather').textContent += ` · ${Math.round(state.fps)} FPS`;
    }
    this.drawMinimap(state);
  }

  drawMinimap(state) {
    const canvas = $('minimap');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);
    ctx.save();
    ctx.beginPath();
    ctx.arc(w / 2, h / 2, w / 2 - 2, 0, Math.PI * 2);
    ctx.clip();
    ctx.fillStyle = '#0a1216';
    ctx.fillRect(0, 0, w, h);
    const route = this.game.route;
    const player = this.game.truck;
    if (!route || !player) {
      ctx.restore();
      return;
    }
    const scale = 0.13; // метров в пиксель
    const p = route.pointAt(player.s);
    const toScreen = (x, z) => [w / 2 + (x - p.x) * scale, h / 2 - (z - p.z) * scale];
    // дорога
    ctx.strokeStyle = 'rgba(140, 190, 200, 0.32)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    for (let i = 0; i < route.samples.length; i += 6) {
      const sm = route.samples[i];
      if (Math.abs(sm.s - player.s) > 2600) continue;
      const [sx, sy] = toScreen(sm.x, sm.z);
      if (i === 0) ctx.moveTo(sx, sy);
      else ctx.lineTo(sx, sy);
    }
    ctx.stroke();
    ctx.strokeStyle = 'rgba(78, 201, 176, 0.85)';
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    let first = true;
    for (let i = 0; i < route.samples.length; i += 5) {
      const sm = route.samples[i];
      if (sm.s < player.s - 500 || sm.s > player.s + 2800) continue;
      const [sx, sy] = toScreen(sm.x, sm.z);
      if (first) {
        ctx.moveTo(sx, sy);
        first = false;
      } else ctx.lineTo(sx, sy);
    }
    ctx.stroke();

    // цели
    const marks = [];
    if (this.game.job) {
      marks.push({ s: this.game.targetS(), color: '#f2b544', label: this.game.phase === 'pickup' ? 'ГРУЗ' : 'ФИНИШ' });
    }
    for (const st of route.stations) {
      if (Math.abs(st.s - player.s) < 2400) marks.push({ s: st.s, color: '#6fb6e8', label: 'АЗС' });
    }
    for (const m of marks) {
      const pp = route.pointAt(m.s);
      const [mx, my] = toScreen(pp.x, pp.z);
      ctx.fillStyle = m.color;
      ctx.beginPath();
      ctx.arc(mx, my, 4.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(230,240,240,.85)';
      ctx.font = 'bold 8px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText(m.label, mx, my - 7);
    }

    // игрок
    const hdg = p.hdg + (player.yawRel || 0);
    ctx.save();
    ctx.translate(w / 2, h / 2);
    ctx.rotate(-hdg + Math.PI);
    ctx.fillStyle = '#f2b544';
    ctx.beginPath();
    ctx.moveTo(0, -9);
    ctx.lineTo(6.5, 7);
    ctx.lineTo(0, 4);
    ctx.lineTo(-6.5, 7);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
    ctx.strokeStyle = 'rgba(150, 180, 190, 0.25)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(w / 2, h / 2, w / 2 - 2, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  // ---------- Гараж ----------
  renderGarage() {
    const g = this.game;
    const p = g.profile;
    if (!p || g.state !== 'garage') return;
    const level = levelForXp(p.xp || 0);
    $('g-name').textContent = p.name;
    $('g-company').textContent = p.companyName || 'Auriga Logistics';
    $('g-level').textContent = level.level;
    $('g-xp').style.width = `${clamp((level.current / level.need) * 100, 0, 100)}%`;
    $('g-money').textContent = fmtMoney(p.money);
    const city = CITY_BY_ID.get(p.currentCity) || CITY_BY_ID.get('berlin');
    $('g-city').textContent = city.name;
    $('g-country').textContent = (COUNTRIES[city.country]?.flag || '') + ' ' + (COUNTRIES[city.country]?.name || '');
    $('g-clock').textContent = fmtTime(g.clock.minutes);
    $('g-day').textContent = g.clock.day;
    this.renderActiveJob();
    document.querySelectorAll('.garage-nav button').forEach((b) => b.classList.toggle('active', b.dataset.nav === this.navTab));
    const main = $('garage-main');
    switch (this.navTab) {
      case 'jobs':
        main.innerHTML = this.jobsHtml();
        break;
      case 'garage':
        main.innerHTML = this.truckHtml();
        break;
      case 'dealer':
        main.innerHTML = this.dealerHtml();
        break;
      case 'drivers':
        main.innerHTML = this.driversHtml();
        break;
      case 'map':
        main.innerHTML = this.mapHtml();
        this.drawFullMap();
        break;
      case 'stats':
        main.innerHTML = this.statsHtml();
        break;
      case 'settings':
        main.innerHTML = this.settingsHtml();
        break;
      default:
        main.innerHTML = '';
    }
  }

  renderActiveJob() {
    const g = this.game;
    const box = $('garage-active');
    if (g.profile?.activeJob) {
      const job = g.profile.activeJob;
      box.innerHTML = `<div class="card">
        <div class="card-company">АКТИВНЫЙ РЕЙС</div>
        <div class="card-route">${job.fromName} <i>→</i> ${job.toName}</div>
        <div class="card-cargo">${job.cargo} · ${fmt(job.mass)} т</div>
        <div class="card-stats">
          <div><small>ОСТАЛОСЬ</small><b>${fmtDistance(job.distance * 1000)}</b></div>
          <div><small>ОПЛАТА</small><b style="color:var(--green)">${fmtMoney(job.pay)}</b></div>
        </div>
        <button class="btn btn-primary btn-sm" data-act="continue-job">Продолжить рейс</button>
      </div>`;
    } else {
      box.innerHTML = '';
    }
  }

  jobsHtml() {
    const g = this.game;
    const offers = g.offers || [];
    const filtered = offers.filter((o) => {
      if (this.jobFilter === 'all') return true;
      if (this.jobFilter === 'urgent') return o.urgent;
      if (this.jobFilter === 'adr') return o.adr;
      if (this.jobFilter === 'fridge') return o.category === 'fridge';
      if (this.jobFilter === 'heavy') return o.category === 'heavy';
      if (this.jobFilter === 'fragile') return o.fragile;
      return true;
    });
    const fuel = g.profile.truck.fuel;
    return `
      <div class="section-title">
        <div><h2>Рынок грузов</h2><p class="sub">Свежие контракты из ${CITY_BY_ID.get(g.profile.currentCity)?.name}. Обновление каждый час.</p></div>
        <button class="btn btn-sm" data-act="service" data-arg="fuel">⛽ Заправиться (${Math.round(fuel)} л)</button>
      </div>
      <div class="filter-bar">
        ${[
          ['all', 'Все'],
          ['urgent', 'Срочные'],
          ['heavy', 'Тяжёлые'],
          ['fridge', 'Реф'],
          ['fragile', 'Хрупкие'],
          ['adr', 'ADR'],
        ]
          .map(([id, label]) => `<button class="${this.jobFilter === id ? 'active' : ''}" data-act="filter" data-arg="${id}">${label}</button>`)
          .join('')}
      </div>
      <div class="cards">${filtered.map((job) => this.jobCard(job)).join('') || '<div class="empty-state"><b>Нет подходящих контрактов</b>Попробуйте другой фильтр или обновите список.</div>'}</div>
    `;
  }

  jobCard(job) {
    const p = this.game.profile;
    const locked = (p.level || 1) < (job.minLevel || 1);
    const hours = Math.round(job.deadlineMin / 60);
    const perKm = job.pay / Math.max(1, job.distance);
    return `<article class="card">
      <div class="card-head">
        <div>
          <div class="card-company">${job.company}</div>
          <div class="card-route">${job.fromName} <i>→</i> ${job.toName}</div>
        </div>
        <div class="card-tag ${job.adr ? 'adr' : job.urgent ? 'urgent' : ''}">${job.tag}</div>
      </div>
      <div class="card-cargo">${job.cargo} <small>· ${job.trailerName} · ${fmt(job.mass)} т</small></div>
      <div class="card-stats">
        <div><small>РАССТОЯНИЕ</small><b>${fmt(job.distance)} км</b></div>
        <div><small>СРОК</small><b>${hours} ч</b></div>
        <div><small>€/КМ</small><b>${perKm.toFixed(1)}</b></div>
      </div>
      <div class="card-pay">${fmtMoney(job.pay)}<small>${job.urgent ? 'надбавка за срочность' : 'фиксированная оплата'}</small></div>
      <div class="card-actions">
        <button class="btn btn-primary btn-sm" data-act="accept-job" data-arg="${job.id}" ${locked ? 'disabled' : ''}>Принять рейс</button>
      </div>
      ${locked ? `<div class="pill bad">Нужен ${job.minLevel}-й уровень</div>` : ''}
    </article>`;
  }

  truckHtml() {
    const g = this.game;
    const p = g.profile;
    const model = TRUCK_MODELS.find((m) => m.id === p.truck.modelId) || TRUCK_MODELS[0];
    const paint = PAINT_COLORS.find((c) => c.id === p.truck.paint) || PAINT_COLORS[1];
    const cond = p.truck.condition;
    const avg = (cond.engine + cond.tires + cond.brakes) / 3;
    const fuelPct = (p.truck.fuel / model.tank) * 100;
    return `
      <div class="section-title"><div><h2>Мой тягач</h2><p class="sub">${model.name} · ${model.hp} л.с. · пробег ${fmt(p.truck.odometer)} км</p></div>
      <button class="btn btn-sm" data-act="service" data-arg="all">🔧 Полное ТО</button></div>
      <div class="card" style="margin-bottom:14px">
        <div class="truck-visual">
          ${truckSvg('#' + hexStr(paint.hex))}
          <div style="flex:1;min-width:200px">
            <div class="field-row"><label>Состояние<small>двигатель · шины · тормоза</small></label><b>${Math.round(avg)}%</b></div>
            <div class="field-row"><label>Топливо</label><b>${Math.round(p.truck.fuel)} / ${model.tank} л</b></div>
            <div class="field-row"><label>Бак</label>
              <div class="bar" style="width:140px"><i style="width:${clamp(fuelPct, 0, 100)}%;background:linear-gradient(90deg,#e2a44a,#ffe08a)"></i></div>
            </div>
            <div class="field-row"><label>Мощность</label><b>${Math.round(model.hp * UPGRADES.engine[p.truck.engine || 0].power)} л.с.</b></div>
            <div class="field-row"><label>Расход</label><b>${model.consumption} л/100 км</b></div>
          </div>
        </div>
      </div>
      <div class="cards">
        <div class="card">
          <div class="card-company">СОСТОЯНИЕ УЗЛОВ</div>
          ${[
            ['Двигатель', cond.engine],
            ['Шины', cond.tires],
            ['Тормоза', cond.brakes],
          ]
            .map(
              ([n, v]) => `<div class="field-row"><label>${n}</label>
              <div class="bar" style="width:120px"><i style="width:${clamp(v, 0, 100)}%;background:linear-gradient(90deg,#e2564a,#e2b64a,#6fd08c)"></i></div>
              <b>${Math.round(v)}%</b></div>`
            )
            .join('')}
          <button class="btn btn-sm" data-act="service" data-arg="repair">🔧 Ремонт и обслуживание</button>
        </div>
        <div class="card">
          <div class="card-company">ТЮНИНГ</div>
          ${Object.entries(UPGRADES)
            .map(([kind, list]) => {
              const current = p.truck[kind] || 0;
              const next = list[current + 1];
              return `<div class="field-row"><label>${list[0].name.replace('Стандартный ', '').replace('Всесезонные ', '').replace('Без ', '')}
                <small>${list[current].name}</small></label>
                ${next ? `<button class="btn btn-sm" data-act="upgrade" data-arg="${kind}:${next.id}">${next.name.split(' ')[0]} · ${fmtMoney(next.price)}</button>` : '<span class="pill good">Максимум</span>'}
              </div>`;
            })
            .join('')}
        </div>
        <div class="card">
          <div class="card-company">ОКРАСКА</div>
          <div class="badge-row">
            ${PAINT_COLORS.map(
              (c) => `<button title="${c.name}" data-act="paint" data-arg="${c.id}"
                style="width:34px;height:34px;border-radius:9px;background:#${hexStr(c.hex)};
                border:2px solid ${c.id === p.truck.paint ? '#f2b544' : 'rgba(255,255,255,.15)'}"></button>`
            ).join('')}
          </div>
          <p style="font-size:12px;color:var(--muted)">Перекраска бесплатна в собственном гараже.</p>
          <button class="btn btn-sm btn-danger" data-act="sell-truck">Продать тягач</button>
        </div>
        ${(p.owned || []).length ? `<div class="card">
          <div class="card-company">ТЯГАЧИ В ГАРАЖЕ</div>
          ${(p.owned || [])
            .map((t, i) => {
              const mm = TRUCK_MODELS.find((m) => m.id === t.modelId);
              return `<div class="field-row"><label>${mm?.name || t.modelId}<small>пробег ${fmt(t.odometer || 0)} км</small></label>
                <button class="btn btn-sm" data-act="take-owned" data-arg="${i}">Пересесть</button></div>`;
            })
            .join('')}
        </div>` : ''}
      </div>
    `;
  }

  dealerHtml() {
    const g = this.game;
    const p = g.profile;
    return `
      <div class="section-title"><div><h2>Автосалон AURIGA</h2><p class="sub">Новые и подержанные тягачи. Ваш текущий: ${TRUCK_MODELS.find((m) => m.id === p.truck.modelId)?.name}</p></div></div>
      <div class="cards">
        ${TRUCK_MODELS.map((model) => {
          const owned = p.truck.modelId === model.id;
          const locked = (p.level || 1) < model.level;
          return `<article class="card">
            <div class="card-head">
              <div class="card-route">${model.name}</div>
              ${owned ? '<span class="pill good">Ваш</span>' : locked ? `<span class="pill bad">${model.level} ур.</span>` : model.used ? '<span class="pill warn">Б/У</span>' : ''}
            </div>
            ${truckSvg('#' + hexStr(model.color), false)}
            <p style="font-size:12px;color:var(--muted);margin:0">${model.desc}</p>
            <div class="card-stats">
              <div><small>МОЩНОСТЬ</small><b>${model.hp} л.с.</b></div>
              <div><small>БАК</small><b>${model.tank} л</b></div>
              <div><small>РАСХОД</small><b>${model.consumption}</b></div>
            </div>
            <div class="card-actions">
              ${owned ? '<button class="btn btn-sm" disabled>В гараже</button>' : `<button class="btn btn-primary btn-sm" data-act="buy-truck" data-arg="${model.id}" ${locked ? 'disabled' : ''}>Купить · ${fmtMoney(model.price)}</button>`}
            </div>
          </article>`;
        }).join('')}
      </div>`;
  }

  driversHtml() {
    const g = this.game;
    const p = g.profile;
    const city = CITY_BY_ID.get(p.currentCity);
    const hasGarageHere = p.garages.includes(p.currentCity);
    const garagePrice = 24000 + (city?.size || 1) * 12000;
    const drivers = p.drivers || [];
    const income = drivers.reduce((a, d) => a + d.rate, 0);
    return `
      <div class="section-title"><div><h2>Гаражи и водители</h2><p class="sub">Пассивный доход, пока вы за рулём.</p></div>
      <span class="pill ${drivers.length ? 'good' : ''}">${drivers.length} водителей · ${fmtMoney(income)}/час</span></div>
      <div class="cards">
        <div class="card">
          <div class="card-company">ГАРАЖ В ${city.name.toUpperCase()}</div>
          <div class="card-route">${hasGarageHere ? 'Уже куплен' : fmtMoney(garagePrice)}</div>
          <p style="font-size:12px;color:var(--muted);margin:0">Гараж позволяет нанимать водителей и менять тягач в этом городе.</p>
          ${hasGarageHere ? '<span class="pill good">Готов к работе</span>' : `<button class="btn btn-primary btn-sm" data-act="buy-garage" data-arg="${p.currentCity}" ${p.money < garagePrice ? 'disabled' : ''}>Купить гараж</button>`}
        </div>
        <div class="card">
          <div class="card-company">НАЁМ</div>
          <div class="card-route">Водитель за 12 000 €</div>
          <p style="font-size:12px;color:var(--muted);margin:0">Водитель приносит 220–400 € в час игрового времени и постепенно набирает опыт.</p>
          <button class="btn btn-sm" data-act="hire-driver" ${hasGarageHere && p.money >= 12000 && drivers.length < 5 ? '' : 'disabled'}>Нанять водителя</button>
        </div>
      </div>
      <div class="section-title" style="margin-top:22px"><h3>Мои гаражи</h3></div>
      <div class="badge-row">${p.garages.length ? p.garages.map((id) => `<span class="badge-item">🏠 ${CITY_BY_ID.get(id)?.name || id}</span>`).join('') : '<span class="pill">Пока нет гаражей</span>'}</div>
      <div class="section-title" style="margin-top:22px"><h3>Водители</h3></div>
      <div class="cards">
        ${
          drivers.length
            ? drivers
                .map(
                  (d) => `<div class="card">
            <div class="card-head"><div class="card-route">${d.name}</div><span class="pill">${d.city ? CITY_BY_ID.get(d.city)?.name : '—'}</span></div>
            <div class="card-stats">
              <div><small>ОПЫТ</small><b>${d.exp} рейсов</b></div>
              <div><small>ДОХОД</small><b>${fmtMoney(d.rate)}/ч</b></div>
              <div><small>ЗАРАБОТАНО</small><b>${fmtMoney(d.earned)}</b></div>
            </div>
            <button class="btn btn-sm btn-ghost" data-act="fire-driver" data-arg="${d.id}">Уволить</button>
          </div>`
                )
                .join('')
            : '<div class="empty-state"><b>Нет водителей</b>Купите гараж и наймите первого водителя.</div>'
        }
      </div>`;
  }

  mapHtml() {
    const g = this.game;
    const p = g.profile;
    const options = CITIES.map((c) => `<option value="${c.id}">${c.name} · ${COUNTRIES[c.country]?.name || ''}</option>`).join('');
    return `
      <div class="section-title"><div><h2>Карта Европы</h2><p class="sub">139 городов в 26 странах. Зелёным — текущий маршрут.</p></div>
      <div class="range-row"><select data-select="mapcity" style="background:rgba(255,255,255,.06);border:1px solid var(--line);color:var(--text);padding:9px 12px;border-radius:9px;font-family:inherit">${options}</select>
      <button class="btn btn-sm" data-act="free-drive-select">Свободная поездка</button></div></div>
      <div class="map-wrap"><canvas id="map-canvas" width="1200" height="860"></canvas></div>
      <div class="map-legend">
        <span><i style="background:#6fb6e8"></i> города</span>
        <span><i style="background:#4ec9b0"></i> текущий маршрут</span>
        <span><i style="background:#f2b544"></i> вы здесь</span>
        <span><i style="background:#8ba0a8"></i> дороги</span>
      </div>`;
  }

  drawFullMap() {
    const canvas = $('map-canvas');
    if (!canvas) return;
    const g = this.game;
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = '#081014';
    ctx.fillRect(0, 0, w, h);
    const net = g.network;
    if (!net) return;
    const xs = [...net.list.map((c) => c.x)];
    const zs = [...net.list.map((c) => c.z)];
    const minX = Math.min(...xs) - 4000;
    const maxX = Math.max(...xs) + 4000;
    const minZ = Math.min(...zs) - 4000;
    const maxZ = Math.max(...zs) + 4000;
    const scale = Math.min(w / (maxX - minX), h / (maxZ - minZ)) * 0.94;
    const ox = w / 2 - ((minX + maxX) / 2) * scale;
    const oy = h / 2 + ((minZ + maxZ) / 2) * scale;
    const tx = (x) => ox + x * scale;
    const ty = (z) => oy - z * scale;

    // сетка
    ctx.strokeStyle = 'rgba(120,160,170,.08)';
    ctx.lineWidth = 1;
    for (let i = 0; i < w; i += 60) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, h);
      ctx.stroke();
    }
    for (let i = 0; i < h; i += 60) {
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(w, i);
      ctx.stroke();
    }

    // дороги
    ctx.strokeStyle = 'rgba(140,170,180,.35)';
    ctx.lineWidth = 1.5;
    for (const [id, edges] of net.adj) {
      const a = CITY_BY_ID.get(id);
      if (!a) continue;
      const pa = g.cityPos(id);
      for (const e of edges) {
        if (id > e.to) continue;
        const pb = g.cityPos(e.to);
        ctx.beginPath();
        ctx.moveTo(tx(pa.x), ty(pa.z));
        ctx.lineTo(tx(pb.x), ty(pb.z));
        ctx.stroke();
      }
    }

    // маршрут
    if (g.route) {
      ctx.strokeStyle = '#4ec9b0';
      ctx.lineWidth = 3;
      ctx.beginPath();
      g.route.samples.forEach((p, i) => {
        if (i % 4) return;
        const sx = tx(p.x);
        const sy = ty(p.z);
        if (i === 0) ctx.moveTo(sx, sy);
        else ctx.lineTo(sx, sy);
      });
      ctx.stroke();
    }

    // города
    for (const c of net.list) {
      const sx = tx(c.x);
      const sy = ty(c.z);
      ctx.fillStyle = c.size === 3 ? '#6fb6e8' : c.size === 2 ? 'rgba(111,182,232,.8)' : 'rgba(111,182,232,.55)';
      ctx.beginPath();
      ctx.arc(sx, sy, 2 + c.size, 0, Math.PI * 2);
      ctx.fill();
      if (c.size >= 2) {
        ctx.fillStyle = 'rgba(220,235,238,.65)';
        ctx.font = '11px system-ui';
        ctx.fillText(c.name, sx + 6, sy - 6);
      }
    }
    // маркер игрока
    if (g.profile) {
      const city = CITY_BY_ID.get(g.profile.currentCity);
      if (city) {
        const p = g.cityPos(city.id);
        ctx.fillStyle = '#f2b544';
        ctx.beginPath();
        ctx.arc(tx(p.x), ty(p.z), 7, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = 'rgba(242,181,68,.4)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(tx(p.x), ty(p.z), 14, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
  }

  statsHtml() {
    const g = this.game;
    const p = g.profile;
    const level = levelForXp(p.xp || 0);
    const s = p.stats;
    const skills = SKILLS.map((sk) => {
      const lvl = p.skills[sk.id] || 0;
      const cost = skillPrice(p, sk.id);
      const max = 5;
      return `<div class="card">
        <div class="card-head"><div class="card-route" style="font-size:14px">${sk.name}</div><span class="pill ${lvl ? 'good' : ''}">${lvl}/${max}</span></div>
        <p style="font-size:12px;color:var(--muted);margin:0">${sk.desc}</p>
        <button class="btn btn-sm" data-act="skill" data-arg="${sk.id}" ${lvl >= max || p.money < cost ? 'disabled' : ''}>${lvl >= max ? 'Максимум' : 'Обучиться · ' + fmtMoney(cost)}</button>
      </div>`;
    }).join('');
    return `
      <div class="section-title"><div><h2>Статистика и навыки</h2><p class="sub">Уровень ${level.level} · ${fmt(p.xp)} опыта · до следующего ${fmt(level.need - level.current)} XP</p></div></div>
      <div class="stat-grid">
        <div class="stat-box"><small>ДОСТАВЛЕНО ГРУЗОВ</small><b>${fmt(s.deliveries)}</b></div>
        <div class="stat-box"><small>ОБЩИЙ ПРОБЕГ</small><b>${fmt(s.distance)} км</b></div>
        <div class="stat-box"><small>ЗАРАБОТАНО</small><b>${fmtMoney(s.earnings)}</b></div>
        <div class="stat-box"><small>ШТРАФЫ</small><b style="color:var(--red)">${fmtMoney(s.fines)}</b></div>
        <div class="stat-box"><small>АВАРИИ</small><b>${fmt(s.collisions)}</b></div>
        <div class="stat-box"><small>МАКС. СКОРОСТЬ</small><b>${fmt(s.topSpeed)} км/ч</b></div>
      </div>
      <div class="section-title" style="margin-top:24px"><h3>Навыки</h3><span class="pill">${fmtMoney(p.money)}</span></div>
      <div class="cards">${skills}</div>
      <div class="section-title" style="margin-top:24px"><h3>Достижения</h3><span class="pill">${p.achievements.length} / ${ACHIEVEMENTS.length}</span></div>
      <div class="badge-row">
        ${ACHIEVEMENTS.map(
          (a) => `<div class="badge-item ${p.achievements.includes(a.id) ? '' : 'locked'}" title="${a.desc}">
            <span class="badge-icon">${a.icon}</span><span>${a.name}</span></div>`
        ).join('')}
      </div>`;
  }

  settingsHtml() {
    const g = this.game;
    const st = g.settings;
    const devLabel =
      g.device === 'phone' ? '📱 Телефон' : g.device === 'tablet' ? '📲 Планшет' : '🖥 Компьютер';
    return `
      <div class="section-title"><div><h2>Настройки</h2><p class="sub">Применяются сразу.</p></div></div>
      <div class="card">
        <div class="field-row"><label>Звук<small>двигатель, дождь, сигналы</small></label>
          <button class="btn btn-sm" data-act="toggle-setting" data-arg="sound">${st.sound ? 'Включён' : 'Выключен'}</button></div>
        <div class="field-row"><label>Громкость</label>
          <div class="range-row"><input type="range" min="0" max="100" value="${Math.round(st.volume * 100)}" data-input="volume">
          <span class="range-label" id="volume-value">${Math.round(st.volume * 100)}%</span></div></div>
        <div class="field-row"><label>Камера по умолчанию<small>V переключает в игре</small></label>
          <select data-setting="camera">
            <option value="" ${!st.camera ? 'selected' : ''}>Авто (телефон — сзади, ПК — из кабины)</option>
            ${['interior', 'hood', 'chase', 'far'].map((c) => `<option value="${c}" ${st.camera === c ? 'selected' : ''}>${c === 'interior' ? 'Из кабины' : c === 'hood' ? 'С капота' : c === 'chase' ? 'Сзади' : 'Сверху сзади'}</option>`).join('')}
          </select></div>
        <div class="field-row"><label>Скорость времени</label>
          <select data-setting="timeScale">
            ${[[1, 'Обычная'], [3, 'Ускоренная ×3'], [6, 'Быстрая ×6']].map(([v, n]) => `<option value="${v}" ${String(st.timeScale) === String(v) ? 'selected' : ''}>${n}</option>`).join('')}
          </select></div>
        <div class="field-row"><label>Устройство<small>определяется автоматически</small></label>
          <b>${devLabel}</b></div>
        <div class="field-row"><label>Качество графики<small>сейчас: ${g.resolveQuality() === 'low' ? 'низкое' : g.resolveQuality() === 'medium' ? 'среднее' : 'высокое'}</small></label>
          <select data-setting="quality">
            ${[['auto', 'Авто под устройство'], ['high', 'Высокое'], ['medium', 'Среднее'], ['low', 'Низкое']].map(([v, n]) => `<option value="${v}" ${String(st.quality) === v ? 'selected' : ''}>${n}</option>`).join('')}
          </select></div>
        <div class="field-row"><label>Сенсорное управление<small>кнопки газа, тормоза и руля на экране</small></label>
          <select data-setting="touchControls">
            ${[['auto', 'Авто'], ['on', 'Всегда'], ['off', 'Выключено']].map(([v, n]) => `<option value="${v}" ${String(st.touchControls) === v ? 'selected' : ''}>${n}</option>`).join('')}
          </select></div>
        <div class="field-row"><label>Полный экран</label>
          <button class="btn btn-sm" data-act="fullscreen">⛶ Включить</button></div>
        <div class="field-row"><label>Показывать FPS</label>
          <button class="btn btn-sm" data-act="toggle-setting" data-arg="showFps">${st.showFps ? 'Вкл' : 'Выкл'}</button></div>
        <div class="field-row"><label>Сбросить настройки</label><button class="btn btn-sm" data-act="reset-settings">Сбросить</button></div>
      </div>
      <div class="section-title" style="margin-top:24px"><h3>Управление</h3></div>
      <div class="card" style="font-size:13px;line-height:1.9">
        <div><b>W / ↑</b> — газ · <b>S / ↓</b> — тормоз · <b>A D / ← →</b> — руль</div>
        <div><b>Пробел</b> — ручник · <b>Shift / Ctrl</b> — выше/ниже передача (в ручном режиме)</div>
        <div><b>C</b> — круиз-контроль · <b>M</b> — авто/ручная КПП · <b>L</b> — фары</div>
        <div><b>E</b> — взаимодействие (погрузка, заправка, отдых) · <b>H</b> — сигнал</div>
        <div><b>V</b> — камера · <b>P</b> — снимок экрана · <b>Esc</b> — пауза</div>
        <div style="margin-top:8px;color:var(--muted)">На телефоне и планшете: экранные педали и руль, кнопки <b>E</b> (погрузка/заправка), 📷, «КР» и 💡. Поверните устройство горизонтально — интерфейс станет крупнее.</div>
      </div>
      <div class="section-title" style="margin-top:24px"><h3>Сохранение</h3></div>
      <div class="card">
        <div class="field-row"><label>Сохранить сейчас</label><button class="btn btn-sm" onclick="window.__eurotrakSave && window.__eurotrakSave()">💾 Сохранить</button></div>
        <div class="field-row"><label>Удалить текущую карьеру<small>Слот будет свободен</small></label><button class="btn btn-danger btn-sm" data-act="reset-save">Удалить</button></div>
      </div>`;
  }

  showSettings(fromMenu = false) {
    if (fromMenu && (!this.game.profile || this.game.state !== 'garage')) {
      this.openModal({
        eyebrow: 'НАСТРОЙКИ',
        title: 'Настройки игры',
        body: this.settingsHtml(false),
        actions: [{ label: 'Закрыть', primary: true, act: 'close' }],
      });
      return;
    }
    this.navTab = 'settings';
    this.renderGarage();
  }

  showAbout() {
    this.openModal({
      eyebrow: 'ОБ ИГРЕ',
      title: 'ЕВРОТРАК',
      body: `
        <p><b>ЕВРОТРАК</b> — самостоятельный браузерный симулятор грузоперевозок, вдохновлённый жанром дальнобойных симуляторов. Тягачи марки AURIGA и все грузовики вымышлены: это не копии реальных машин.</p>
        <h4>Что доступно</h4>
        <p>139 городов в 26 странах, 30 видов груза и 6 типов прицепов, карьера с уровнем и навыками, экономика с топливом, ремонтом, штрафами и кредитом, гаражи, наёмные водители, достижения и автосохранение в браузере.</p>
        <h4>Управление</h4>
        <p>W/S — газ и тормоз, A/D — руль, E — взаимодействие, C — круиз, M — режим КПП, V — камера, Esc — пауза. На телефоне — экранные кнопки.</p>
        <h4>Настройки графики</h4>
        <p>Игра рассчитана на слабые устройства: низкая детализация и меньшее разрешение включаются в настройках браузера или уменьшением окна.</p>`,
      actions: [{ label: 'Понятно', primary: true, act: 'close' }],
    });
  }

  // ---------- Модальные окна ----------
  openModal({ eyebrow = 'ИНФОРМАЦИЯ', title = '', body = '', actions = [] }) {
    $('modal-eyebrow').textContent = eyebrow;
    $('modal-title').textContent = title;
    $('modal-body').innerHTML = body;
    $('modal-foot').innerHTML = actions
      .map((a) => `<button class="btn ${a.primary ? 'btn-primary' : ''} ${a.danger ? 'btn-danger' : ''}" data-act="${a.act || 'close'}" data-arg="${a.arg || ''}">${a.label}</button>`)
      .join('');
    $('modal-root').classList.remove('hidden');
  }

  closeModal() {
    $('modal-root').classList.add('hidden');
    if (this.game.onModalClosed) this.game.onModalClosed();
  }

  showWork(title, pct, visible = true) {
    const el = $('work-overlay');
    if (!el) return;
    if (!visible) {
      el.classList.add('hidden');
      return;
    }
    el.classList.remove('hidden');
    $('work-title').textContent = title;
    $('work-bar').style.width = Math.round(clamp(pct, 0, 1) * 100) + '%';
  }

  toast(text, type = '', ms = 3200) {
    const stack = $('toast-stack');
    const el = document.createElement('div');
    el.className = 'toast ' + type;
    el.textContent = text;
    stack.appendChild(el);
    while (stack.children.length > 4) stack.removeChild(stack.firstChild);
    setTimeout(() => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(-6px)';
      el.style.transition = 'all .3s';
      setTimeout(() => el.remove(), 320);
    }, ms);
  }

  flashDamage() {
    const el = $('damage-flash');
    el.classList.add('on');
    setTimeout(() => el.classList.remove('on'), 140);
  }

  fuelDialog(price, current, capacity, money) {
    const maxLiters = Math.max(0, Math.floor(capacity - current));
    const affordable = Math.max(0, Math.min(maxLiters, Math.floor(money / price)));
    const defaultAmount = Math.min(affordable, Math.ceil(maxLiters * 0.7));
    this.game.currentFuelPrice = price;
    this.openModal({
      eyebrow: 'АЗС',
      title: 'Заправка',
      body: `<div class="fuel-dialog">
        <div class="fuel-price"><span>Цена за литр</span><b>${price.toFixed(2)} €</b></div>
        <div class="fuel-price"><span>В баке</span><b>${Math.round(current)} / ${capacity} л</b></div>
        <input class="fuel-slider" id="fuel-range" type="range" min="0" max="${Math.max(1, affordable)}" value="${defaultAmount}" data-input="fuel">
        <div class="fuel-price"><span>Залить</span><b id="fuel-amount">${defaultAmount} л</b></div>
        <div class="fuel-total"><span>Итого</span><b id="fuel-total">${fmtMoney(defaultAmount * price)}</b></div>
        ${affordable < maxLiters ? '<p style="color:var(--amber);font-size:12px">Недостаточно денег на полный бак.</p>' : ''}
      </div>`,
      actions: [
        { label: 'Отмена', act: 'close' },
        { label: 'Заправить', primary: true, act: 'fuel-confirm' },
      ],
    });
  }

  confirmRest() {
    const g = this.game;
    this.openModal({
      eyebrow: 'ЗОНА ОТДЫХА',
      title: 'Отдохнуть 9 часов',
      body: `<p>Отдых восстановит силы и сдвинет игровое время на 9 часов. Сейчас ${fmtTime(g.clock.minutes)}, день ${g.clock.day}.</p>
        <p>Стоимость стоянки — <b>45 €</b>.</p>`,
      actions: [
        { label: 'Отмена', act: 'close' },
        { label: 'Отдохнуть', primary: true, act: 'rest-confirm' },
      ],
    });
  }

  confirmRepair(cost, items) {
    const g = this.game;
    this.openModal({
      eyebrow: 'СЕРВИС',
      title: 'Ремонт и обслуживание',
      body: `<p>${items}</p>
        <div class="field-row"><label>Стоимость работ</label><b>${fmtMoney(cost)}</b></div>
        <div class="field-row"><label>В кошельке</label><b>${fmtMoney(g.profile.money)}</b></div>`,
      actions: [
        { label: 'Отмена', act: 'close' },
        { label: 'Оплатить', primary: true, act: 'repair-confirm', arg: 'all' },
      ],
    });
  }

  confirmBuyTruck(model, tradeIn) {
    this.openModal({
      eyebrow: 'АВТОСАЛОН',
      title: model.name,
      body: `<p>${model.desc}</p>
        <div class="field-row"><label>Стоимость</label><b>${fmtMoney(model.price)}</b></div>
        <div class="field-row"><label>Trade-in текущего тягача</label><b style="color:var(--green)">− ${fmtMoney(tradeIn)}</b></div>
        <div class="field-row"><label>Итого к оплате</label><b>${fmtMoney(Math.max(0, model.price - tradeIn))}</b></div>`,
      actions: [
        { label: 'Отмена', act: 'close' },
        { label: 'Купить', primary: true, act: 'buy-truck-confirm', arg: model.id },
      ],
    });
  }

  deliveryResult({ job, pay, notes, xp, stats, levelUp }) {
    this.openModal({
      eyebrow: 'ДОСТАВКА ВЫПОЛНЕНА',
      title: 'Груз доставлен',
      body: `<div class="result-hero"><div class="money">${fmtMoney(pay)}</div><span class="pill good">${job.fromName} → ${job.toName}</span></div>
        <div class="result-rows">
          <div><span>Груз</span><span>${job.cargo} · ${fmt(job.mass)} т</span></div>
          <div><span>Расстояние</span><span>${fmt(job.distance)} км</span></div>
          ${notes.map((n) => `<div><span>${n}</span><span></span></div>`).join('')}
          <div><span>Опыт</span><span>+${xp} XP</span></div>
          <div><span>Пробег</span><span>+${fmt(stats.distance)} км</span></div>
        </div>
        ${levelUp ? `<p style="color:var(--amber);font-weight:700;text-align:center;margin-top:14px">Новый уровень: ${levelUp}!</p>` : ''}`,
      actions: [
        { label: 'В гараж', primary: true, act: 'goto-jobs' },
      ],
    });
  }
}

function hexStr(hex) {
  return '#' + hex.toString(16).padStart(6, '0');
}
