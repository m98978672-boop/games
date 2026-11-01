/* Интерфейс: панели, карточки, инспектор, новости, модальные окна. */
(function () {
  const TR = (window.TR = window.TR || {});
  const C = TR.CONFIG;
  const U = TR.Util;
  const Sim = TR.Sim;

  const UI = (TR.UI = {});
  const S = {
    app: null, tab: 'road', lastHud: 0, lastSide: 0, hintOverride: '',
    dailyShown: null, dailyTimer: 0, newsIndex: 0, newsTimer: 0,
    modalOpen: false, tooltipTimer: 0, lastLevel: 1, winShown: false,
  };

  const $ = (id) => document.getElementById(id);

  UI.init = function (app) {
    S.app = app;
    $('tool-tabs').addEventListener('click', (e) => {
      const btn = e.target.closest('[data-tab]');
      if (!btn) return;
      S.tab = btn.dataset.tab;
      document.querySelectorAll('#tool-tabs [data-tab]').forEach((b) => b.classList.toggle('on', b.dataset.tab === S.tab));
      app.tool = 'select';
      app.roadFrom = null;
      app.selection = null;
      buildTools();
      UI.refresh();
      UI.setHint();
    });

    $('tool-body').addEventListener('click', onToolClick);
    $('side').addEventListener('click', onSideClick);
    $('modal-root').addEventListener('click', onModalClick);

    document.querySelectorAll('#speed-group button').forEach((b) => {
      b.addEventListener('click', () => app.setSpeed(Number(b.dataset.speed)));
    });
    $('btn-pause').addEventListener('click', () => app.togglePause());
    $('btn-report').addEventListener('click', showReport);
    $('btn-bank').addEventListener('click', showBank);
    $('btn-help').addEventListener('click', showHelp);
    $('btn-save').addEventListener('click', () => app.save());
    $('btn-side').addEventListener('click', () => document.body.classList.toggle('side-open'));
    $('btn-sound').addEventListener('click', (e) => {
      const on = TR.Audio.toggle();
      e.currentTarget.classList.toggle('off', !on);
      e.currentTarget.textContent = on ? '🔊' : '🔇';
    });
    $('btn-fit').addEventListener('click', () => app.fitCamera());

    $('daily').addEventListener('click', showReport);

    buildTools();
    UI.refreshAll();
    UI.setHint();
  };

  /* ------------------------------------------------------------ вкладки */

  function levelLocked(unlock) {
    return S.app.state.level < unlock;
  }

  function buildTools() {
    const s = S.app.state;
    const body = $('tool-body');
    let html = '';

    if (S.tab === 'road') {
      html += `<p class="tool-note">Выберите класс трассы, затем нажмите на <b>два города</b> на карте. Стоимость зависит от длины и рельефа.</p>`;
      html += `<div class="road-list">`;
      C.roadTypes.forEach((rt, i) => {
        const locked = levelLocked(rt.unlock);
        const active = S.app.tool === 'road' && S.app.buildQuality === i;
        html += `
          <button class="road-card${active ? ' active' : ''}${locked ? ' locked' : ''}" data-tool="road" data-quality="${i}">
            <span class="road-swatch" style="background:${rt.color}"></span>
            <span class="road-main">
              <span class="road-name">${rt.name}</span>
              <span class="road-meta">${U.num(rt.cost)} ₽/км · ${rt.speed} км/ч</span>
            </span>
            ${locked ? `<span class="lock">ур. ${rt.unlock}</span>` : `<span class="road-arrow">→</span>`}
          </button>`;
      });
      html += `</div>`;
      html += `<p class="tool-note subtle">Реконструкция участка — в карточке дороги после клика по ней. Пункт оплаты ставится только на асфальт.</p>`;
    } else if (S.tab === 'service' || S.tab === 'city') {
      const cat = S.tab;
      const list = C.facilities.filter((f) => f.cat === cat);
      html += `<p class="tool-note">${cat === 'service'
        ? 'Кликните по дороге, чтобы поставить объект. Машины будут заворачивать и платить.'
        : 'Украшайте трассы у городов: довольство растёт, город приводит больше машин и платит субсидию.'}</p>`;
      html += `<div class="obj-grid">`;
      for (const def of list) {
        const locked = levelLocked(def.unlock);
        const active = S.app.tool === 'fac:' + def.key;
        html += `
          <button class="obj-card${locked ? ' locked' : ''}${active ? ' active' : ''}" data-tool="fac:${def.key}"
                  title="${esc(def.desc)}">
            <span class="obj-emoji">${def.emoji}</span>
            <span class="obj-name">${def.name}</span>
            <span class="obj-cost">${U.money(def.cost)}</span>
            <span class="obj-fx">${effectLine(def)}</span>
            ${locked ? `<span class="obj-lock">🔒 уровень ${def.unlock}</span>` : ''}
          </button>`;
      }
      html += `</div>`;
    } else {
      // компания
      html += `<div class="company-stats">
        <div><span>Капитал</span><b>${U.money(Sim.companyValue(s))}</b></div>
        <div><span>Дорог</span><b>${Math.round(s.roads.reduce((a, r) => a + (r.open ? r.totalKm : 0), 0))} км</b></div>
        <div><span>Объектов</span><b>${s.facilities.length}</b></div>
        <div><span>Уровень</span><b>${s.level}</b></div>
      </div>`;
      html += `<p class="tool-note">Улучшения компании действуют сразу.</p><div class="upg-list">`;
      for (const info of Sim.upgradeList(s)) {
        const u = info.def;
        html += `
          <div class="upg-card">
            <div class="upg-head"><span class="upg-icon">${u.icon}</span><b>${u.name}</b>
              <span class="upg-lvl">${dots(info.lvl, u.max)}</span></div>
            <p>${u.desc}</p>
            <div class="upg-foot">
              <span class="upg-fx">${u.effect(info.lvl)}</span>
              <button class="btn small" data-act="buy-upgrade" data-key="${u.key}" ${info.maxed || s.money < info.cost ? 'disabled' : ''}>
                ${info.maxed ? 'макс.' : U.money(info.cost)}
              </button>
            </div>
          </div>`;
      }
      html += `</div>`;
      html += `<div class="bank-block">
        <div class="bank-row"><span>Кредит</span><b>${U.money(s.debt)}</b></div>
        <div class="bank-row"><span>Лимит</span><b>${U.money(Sim.loanLimit(s))}</b></div>
        <div class="bank-row"><span>Ставка</span><b>${(C.loanRate * 100).toFixed(1)}% / день</b></div>
        <div class="bank-actions">
          <button class="btn small" data-act="loan">Взять ${U.money(25000)}</button>
          <button class="btn small ghost" data-act="repay" ${s.debt <= 0 ? 'disabled' : ''}>Погасить ${U.money(25000)}</button>
        </div>
      </div>`;
    }
    body.innerHTML = html;
  }

  function effectLine(def) {
    if (def.cat === 'city') return `уют +${Math.round(def.beauty * 100)}% · ${def.subsidy} ₽/день`;
    if (def.key === 'toll') return `${C.tollPrice} ₽ с машины`;
    if (def.key === 'ad') return `${def.perPass} ₽ за машину`;
    return `+${def.income} ₽/клиент`;
  }

  function dots(lvl, max) {
    let out = '';
    for (let i = 0; i < max; i++) out += `<i class="${i < lvl ? 'on' : ''}"></i>`;
    return `<span class="dots">${out}</span>`;
  }

  function onToolClick(e) {
    const btn = e.target.closest('[data-tool]');
    if (btn) {
      const tool = btn.dataset.tool;
      if (btn.classList.contains('locked')) {
        const key = tool.indexOf('fac:') === 0 ? tool.slice(4) : null;
        const def = key ? C.facilityByKey[key] : C.roadTypes[Number(btn.dataset.quality)];
        toast(`Откроется на ${def.unlock} уровне компании`, 'info');
        TR.Audio.play('error');
        return;
      }
      if (tool === 'road') {
        S.app.buildQuality = Number(btn.dataset.quality);
        S.app.setTool('road');
        buildTools();
        return;
      }
      if (S.app.tool === tool) S.app.setTool('select');
      else S.app.setTool(tool);
      buildTools();
      return;
    }
    const act = e.target.closest('[data-act]');
    if (!act) return;
    if (act.dataset.act === 'buy-upgrade') {
      const res = Sim.buyUpgrade(S.app.state, act.dataset.key);
      if (!res.ok) toast(res.error, 'bad');
      else toast('Улучшение куплено', 'good');
      buildTools();
      UI.refresh();
    } else if (act.dataset.act === 'loan') {
      const res = Sim.takeLoan(S.app.state, 25000);
      if (!res.ok) toast(res.error, 'bad');
      buildTools();
      UI.refresh();
    } else if (act.dataset.act === 'repay') {
      const res = Sim.repayLoan(S.app.state, 25000);
      if (!res.ok) toast(res.error, 'bad');
      buildTools();
      UI.refresh();
    }
  }

  /* -------------------------------------------------------- инспектор */

  function onSideClick(e) {
    const btn = e.target.closest('[data-act]');
    if (!btn) return;
    const s = S.app.state;
    const act = btn.dataset.act;
    if (act === 'upgrade-fac') {
      const res = Sim.upgradeFacility(s, Number(btn.dataset.id));
      if (!res.ok) toast(res.error, 'bad');
      else toast('Объект улучшен', 'good');
    } else if (act === 'demolish-fac') {
      const f = s.facilities.find((x) => x.id === Number(btn.dataset.id));
      if (f && confirm(`Снести «${C.facilityByKey[f.type].name}»?`)) {
        const res = Sim.demolishFacility(s, f.id);
        if (res.ok) toast(`Снесено, возврат ${U.money(res.refund)}`, 'info');
      }
    } else if (act === 'upgrade-road') {
      const res = Sim.upgradeRoad(s, Number(btn.dataset.id), Number(btn.dataset.q));
      if (!res.ok) toast(res.error, 'bad');
    } else if (act === 'demolish-road') {
      if (confirm('Разобрать участок дороги? Объекты на нём тоже исчезнут.')) {
        const res = Sim.demolishRoad(s, Number(btn.dataset.id));
        if (res.ok) {
          toast(`Участок разобран, возврат ${U.money(res.refund)}`, 'info');
          S.app.selection = null;
        }
      }
    } else if (act === 'focus-fac') {
      const f = s.facilities.find((x) => x.id === Number(btn.dataset.id));
      if (f) {
        const road = Sim.roadById(s, f.roadId);
        if (road) {
          const p = U.curvePoint(U.curve(road), f.t);
          S.app.camera.x = p.x;
          S.app.camera.y = p.y;
          S.app.camera.zoom = Math.max(S.app.camera.zoom, 1.3);
        }
      }
    } else if (act === 'close-sel') {
      S.app.selection = null;
    } else if (act === 'show-report') {
      showReport();
    }
    buildTools();
    UI.refresh();
  }

  function sideHTML() {
    const app = S.app;
    const s = app.state;
    const sel = app.selection;
    let html = '';

    if (sel && sel.kind === 'facility') {
      const f = s.facilities.find((x) => x.id === sel.id);
      if (f) html += facilityCard(s, f);
    } else if (sel && sel.kind === 'road') {
      const road = s.roads.find((r) => r.id === sel.id);
      if (road) html += roadCard(s, road);
    } else if (sel && sel.kind === 'city') {
      html += cityCard(s, sel.id);
    }

    if (!html) html += summaryCard(s);
    html += objectivesCard(s);
    html += contractsCard(s);
    html += newsCard(s);
    return html;
  }

  function facilityCard(s, f) {
    const def = C.facilityByKey[f.type];
    const road = Sim.roadById(s, f.roadId);
    const upCost = Sim.facilityUpgradeCost(f);
    const capacity = def.capacity * (1 + 0.3 * (f.level - 1));
    const upkeep = def.upkeep * (1 + 0.35 * (f.level - 1)) * (1 - s.upgrades.maintenance * 0.09);
    return `
      <section class="card sel-card">
        <div class="card-head">
          <div class="card-title"><span class="big-emoji">${def.emoji}</span>
            <div><h2>${def.name}</h2><p>${def.cat === 'city' ? 'Благоустройство' : 'Придорожный сервис'}${f.level > 1 ? ' · уровень ' + f.level : ''}</p></div>
          </div>
          <button class="x" data-act="close-sel" aria-label="Закрыть">✕</button>
        </div>
        ${!f.ready ? `<div class="notice-line">Строится: ${Math.round(f.progress * 100)}%</div>` : ''}
        <div class="stat-grid">
          <div><span>Выручка сегодня</span><b>${U.money(f.revenueToday)}</b></div>
          <div><span>Вчера</span><b>${U.money(f.revenueLastDay)}</b></div>
          <div><span>Клиентов</span><b>${f.visitsToday} / ${Math.round(capacity)}</b></div>
          <div><span>Содержание</span><b>−${U.money(upkeep)}/день</b></div>
          <div><span>Трафик участка</span><b>${road ? road.trafficToday : 0} авто</b></div>
          <div><span>Всего заработано</span><b>${U.money(f.totalRevenue)}</b></div>
        </div>
        <div class="card-actions">
          <button class="btn small" data-act="upgrade-fac" data-id="${f.id}" ${f.level >= 5 || s.money < upCost ? 'disabled' : ''}>
            ${f.level >= 5 ? 'Максимум' : 'Улучшить · ' + U.money(upCost)}
          </button>
          <button class="btn small ghost" data-act="focus-fac" data-id="${f.id}">Показать</button>
          <button class="btn small danger" data-act="demolish-fac" data-id="${f.id}">Снести</button>
        </div>
      </section>`;
  }

  function roadCard(s, road) {
    const type = C.roadTypes[road.quality];
    const upkeep = road.totalKm * type.upkeep * (1 - s.upgrades.maintenance * 0.09);
    let upgrades = '';
    C.roadTypes.forEach((rt, i) => {
      if (i <= road.quality) return;
      const cost = Sim.upgradeCost(road, i);
      const locked = s.level < rt.unlock;
      upgrades += `<button class="btn small${locked ? ' locked' : ''}" data-act="upgrade-road" data-id="${road.id}" data-q="${i}"
        ${locked || road.building ? 'disabled' : ''}>${rt.name}${locked ? ' · ур. ' + rt.unlock : ' · ' + U.money(cost)}</button>`;
    });
    return `
      <section class="card sel-card">
        <div class="card-head">
          <div class="card-title"><span class="big-emoji">${road.building ? '🚧' : '🛣️'}</span>
            <div><h2>${C.cities[road.a].name} — ${C.cities[road.b].name}</h2>
            <p>${type.name} · ${U.km(road.totalKm)}</p></div>
          </div>
          <button class="x" data-act="close-sel" aria-label="Закрыть">✕</button>
        </div>
        ${road.building ? `<div class="notice-line">Стройка: ${Math.round((road.builtKm / road.totalKm) * 100)}% · осталось ${U.km(Math.max(0, road.totalKm - road.builtKm))}</div>` : ''}
        ${road.blockedUntil > s.time ? `<div class="notice-line bad">Перекрыто из-за ДТП</div>` : ''}
        <div class="stat-grid">
          <div><span>Скорость</span><b>${type.speed} км/ч</b></div>
          <div><span>Трафик сегодня</span><b>${road.trafficToday} авто</b></div>
          <div><span>Содержание</span><b>−${U.money(upkeep)}/день</b></div>
          <div><span>Стоимость</span><b>${U.money(road.totalKm * type.cost * 0.5)}</b></div>
        </div>
        <div class="stat-grid">
          <div><span>Покрытие</span><b>${road.open ? 'готово' : 'строится'}</b></div>
          <div><span>Освещение</span><b>${road.light ? 'есть' : 'нет'}</b></div>
        </div>
        <div class="upgrade-row">${upgrades || '<span class="muted">Максимальный класс покрытия</span>'}</div>
        <div class="card-actions">
          <button class="btn small danger" data-act="demolish-road" data-id="${road.id}" ${road.building ? 'disabled' : ''}>Разобрать</button>
        </div>
      </section>`;
  }

  function cityCard(s, id) {
    const city = C.cities[id];
    const dyn = s.cities[id];
    const near = s.facilities.filter((f) => {
      const road = Sim.roadById(s, f.roadId);
      if (!road) return false;
      const p = U.curvePoint(U.curve(road), f.t);
      return U.dist(city.x, city.y, p.x, p.y) < 24;
    }).length;
    const sat = dyn.sat;
    return `
      <section class="card sel-card">
        <div class="card-head">
          <div class="card-title"><span class="big-emoji">🏙️</span>
            <div><h2>${city.name}</h2><p>${U.num(Math.round(dyn.pop))} жителей</p></div>
          </div>
          <button class="x" data-act="close-sel" aria-label="Закрыть">✕</button>
        </div>
        <div class="stat-grid">
          <div><span>Довольство</span><b>${Math.round(sat * 100)}%</b></div>
          <div><span>Объектов рядом</span><b>${near}</b></div>
          <div><span>Трафик города</span><b>≈ ${Math.round((dyn.pop / 1000) * 3.2 * sat)} авто/день</b></div>
          <div><span>Вклад в сеть</span><b>${Sim.neighbors(s).get(id).length} дорог</b></div>
        </div>
        <p class="muted small-text">Благоустройство в радиусе 24 км повышает довольство: город растит население и приводит больше машин.</p>
      </section>`;
  }

  function summaryCard(s) {
    const f = Sim.forecast(s);
    const fullExpense = Sim.dailyExpense(s) + s.stats.incomeToday * C.taxRate;
    const expense = fullExpense * U.clamp(U.timeHours(s.time) / 24, 0.02, 1);
    const net = s.stats.incomeToday - expense;
    return `
      <section class="card summary-card">
        <div class="card-head">
          <div class="card-title"><span class="big-emoji">🏗️</span>
            <div><h2>Компания «Трасса»</h2><p>уровень ${s.level} · капитал ${U.money(Sim.companyValue(s))}</p></div>
          </div>
        </div>
        <div class="money-row">
          <span>Сегодня</span><b class="${net >= 0 ? 'pos' : 'neg'}">${net >= 0 ? '+' : ''}${U.money(net)}</b>
        </div>
        <div class="stat-grid">
          <div><span>Выручка</span><b class="pos">${U.money(s.stats.incomeToday)}</b></div>
          <div><span>Расходы</span><b class="neg">−${U.money(expense)}</b></div>
          <div><span>Прогноз/день</span><b>${f.net >= 0 ? '+' : ''}${U.money(f.net)}</b></div>
          <div><span>Сервисов</span><b>${s.stats.servicesToday}</b></div>
        </div>
        ${s.debt > 0 ? `<div class="notice-line">Кредит: ${U.money(s.debt)} · проценты ${U.money(Sim.interest(s))}/день</div>` : ''}
        ${topEarners(s)}
        <div class="card-actions">
          <button class="btn small ghost" data-act="show-report">Отчёт по дням</button>
        </div>
      </section>`;
  }

  function topEarners(s) {
    const list = s.facilities
      .filter((f) => f.ready && f.revenueToday > 0)
      .sort((a, b) => b.revenueToday - a.revenueToday)
      .slice(0, 3);
    if (!list.length) return '';
    let rows = '';
    for (const f of list) {
      rows += `<div class="earner"><span>${C.facilityByKey[f.type].emoji} ${C.facilityByKey[f.type].name}</span><b>+${U.money(f.revenueToday)}</b></div>`;
    }
    return `<div class="earners"><span class="earners-title">Заработали сегодня</span>${rows}</div>`;
  }

  function objectivesCard(s) {
    const list = C.objectives;
    const done = s.objDone.length;
    const current = Sim.currentObjective(s);
    let html = `<section class="card"><div class="card-head"><div class="card-title"><span class="big-emoji">🎯</span>
      <div><h2>Цели</h2><p>${done} из ${list.length} выполнено</p></div></div></div>`;
    if (current) {
      html += `<div class="objective current">
        <b>${current.title}</b><p>${current.desc}</p>
        <span class="reward">Награда: ${U.money(current.reward)}</span>
      </div>`;
    } else {
      html += `<div class="objective current done"><b>Все цели выполнены!</b><p>Продолжайте развивать сеть — деньги и трафик никуда не делись.</p></div>`;
    }
    const finished = list.filter((o) => s.objDone.includes(o.id));
    if (finished.length) {
      html += `<div class="obj-done">${finished.slice(-3).map((o) => `<span>✓ ${o.title}</span>`).join('')}</div>`;
    }
    html += `</section>`;
    return html;
  }

  function contractsCard(s) {
    let html = `<section class="card"><div class="card-head"><div class="card-title"><span class="big-emoji">📋</span>
      <div><h2>Заказы</h2><p>${s.contracts.length ? 'выполняйте и получайте оплату' : 'пока нет активных заказов'}</p></div></div></div>`;
    if (!s.contracts.length) {
      html += `<p class="muted small-text">Новые заказы приходят от администраций городов. Стройте и благоустраивайте — заказов станет больше.</p>`;
    }
    for (const c of s.contracts) {
      const p = Sim.contractProgress(s, c);
      const days = Math.max(0, c.expires - s.time);
      html += `<div class="contract">
        <div class="contract-head"><b>${c.title}</b><span>${U.money(c.reward)}</span></div>
        <p>${c.desc}</p>
        <div class="progress"><i style="width:${Math.round(p.ratio * 100)}%"></i></div>
        <div class="contract-foot"><span>${p.text}</span><span>${days.toFixed(1)} дн.</span></div>
      </div>`;
    }
    html += `</section>`;
    return html;
  }

  function newsCard(s) {
    const items = s.news.slice(0, 5);
    let html = `<section class="card"><div class="card-head"><div class="card-title"><span class="big-emoji">📰</span>
      <div><h2>События</h2><p>жизнь трассы</p></div></div></div><div class="news-list">`;
    for (const n of items) {
      html += `<div class="news-item ${n.kind || ''}"><span class="news-day">Д${n.day}</span><p>${esc(n.text)}</p></div>`;
    }
    html += `</div></section>`;
    return html;
  }

  /* ------------------------------------------------------------- HUD */

  function updateHUD() {
    const s = S.app.state;
    $('hud-money').textContent = U.money(s.money);
    $('hud-money').classList.toggle('neg', s.money < 0);
    $('hud-day').textContent = `День ${U.dayNumber(s.time)} · ${U.clock(s.time)}`;
    const fullExpense = Sim.dailyExpense(s) + s.stats.incomeToday * C.taxRate;
    const dayPart = U.clamp(U.timeHours(s.time) / 24, 0.02, 1);
    const expense = fullExpense * dayPart;
    const net = s.stats.incomeToday - expense;
    const todayEl = $('hud-today');
    todayEl.textContent = (net >= 0 ? '+' : '') + U.money(net);
    todayEl.className = 'val ' + (net >= 0 ? 'pos' : 'neg');
    $('hud-level').textContent = s.level;
    const lvlStart = C.levelXp[s.level - 1] || 0;
    const lvlNext = C.levelXp[s.level] || lvlStart + 1;
    const pct = U.clamp(((s.xp - lvlStart) / (lvlNext - lvlStart)) * 100, 0, 100);
    $('hud-xp').style.width = pct + '%';
    $('hud-xp-label').textContent = s.level >= C.levelXp.length ? 'макс.' : `${U.num(s.xp)} / ${U.num(lvlNext)} XP`;

    // индикатор времени суток
    const h = U.timeHours(s.time);
    $('hud-sun').textContent = h < 6 ? '🌙' : h < 9 ? '🌅' : h < 18 ? '☀️' : h < 21 ? '🌇' : '🌙';
    $('hud-debt').textContent = s.debt > 0 ? `Долг: ${U.money(s.debt)}` : '';
    $('hud-debt').style.display = s.debt > 0 ? 'block' : 'none';
  }

  UI.refresh = function () {
    const body = $('tool-body');
    if (body) buildTools();
    $('side').innerHTML = sideHTML();
    updateHUD();
  };

  UI.refreshAll = function () {
    buildTools();
    UI.refresh();
    UI.resetView();
  };

  UI.resetView = function () {
    S.dailyShown = null;
    S.dailyTimer = 0;
    S.winShown = false;
    S.lastLevel = 1;
    const d = $('daily');
    if (d) d.classList.add('hidden');
    const root = $('modal-root');
    if (root) { root.classList.remove('open'); root.innerHTML = ''; }
    S.modalOpen = false;
  };

  UI.refreshSpeed = function () {
    const app = S.app;
    document.querySelectorAll('#speed-group button').forEach((b) => {
      b.classList.toggle('on', !app.paused && Number(b.dataset.speed) === app.speed);
    });
    $('btn-pause').classList.toggle('on', app.paused);
    $('pause-flag').style.display = app.paused ? 'flex' : 'none';
  };

  UI.setHint = function (custom) {
    const app = S.app;
    const hint = custom !== undefined && custom !== null ? custom : autoHint();
    $('hint').innerHTML = hint;
    document.body.classList.toggle('placing', app.tool !== 'select');
  };

  function autoHint() {
    const app = S.app;
    if (app.paused) return 'Пауза · <kbd>Пробел</kbd> — продолжить';
    if (app.tool === 'road') {
      if (app.roadFrom != null) return `Ведём трассу из <b>${C.cities[app.roadFrom].name}</b> · клик по городу — построить · <kbd>Esc</kbd> — отмена`;
      return `Дороги: выберите класс слева, затем город на карте · ${C.roadTypes[app.buildQuality].name}`;
    }
    if (app.tool.startsWith('fac:')) {
      const def = C.facilityByKey[app.tool.slice(4)];
      return `Ставим «${def.name}» · клик по дороге · <kbd>Esc</kbd> — отмена`;
    }
    if (app.selection) return 'Клик по карте — выбрать другой объект · перетаскивание — карта · колесо — масштаб';
    return 'Клик — выбрать объект или дорогу · перетаскивание — двигать карту · колесо — масштаб · <kbd>Пробел</kbd> — пауза';
  }

  UI.tick = function (dt) {
    const app = S.app;
    const s = app.state;
    S.lastHud += dt;
    S.lastSide += dt;

    if (S.lastHud > 0.18) {
      S.lastHud = 0;
      updateHUD();
      const badge = $('speed-badge');
      badge.textContent = app.paused ? 'ПАУЗА' : app.speed + '×';
      badge.classList.toggle('paused', app.paused);
      if (s.level !== S.lastLevel) {
        S.lastLevel = s.level;
        buildTools();
      }
    }

    if (S.lastSide > 1.1) {
      S.lastSide = 0;
      $('side').innerHTML = sideHTML();
      if (S.tab === 'company') buildTools();
    }

    // новости внизу
    S.newsTimer += dt;
    if (S.newsTimer > 7 && s.news.length) {
      S.newsTimer = 0;
      S.newsIndex = (S.newsIndex + 1) % s.news.length;
      const n = s.news[S.newsIndex];
      $('news').innerHTML = `<span class="news-tag">Д${n.day}</span> ${esc(n.text)}`;
      $('news').classList.remove('fade');
      void $('news').offsetWidth;
      $('news').classList.add('fade');
    }
    if (s.news.length && !$('news').dataset.init) {
      $('news').dataset.init = '1';
      $('news').innerHTML = `<span class="news-tag">Д${s.news[0].day}</span> ${esc(s.news[0].text)}`;
    }

    // итоги дня
    if (s.dailyReport && S.dailyShown !== s.dailyReport.day) {
      S.dailyShown = s.dailyReport.day;
      showDaily(s.dailyReport);
    }
    if (S.dailyTimer > 0) {
      S.dailyTimer -= dt;
      if (S.dailyTimer <= 0) $('daily').classList.add('hidden');
    }

    if (s.won && !S.winShown) {
      S.winShown = true;
      showVictory();
    }
  };

  function showDaily(r) {
    const el = $('daily');
    el.innerHTML = `
      <div class="daily-head"><b>День ${r.day}</b><span>${r.net >= 0 ? '📈' : '📉'} ${r.net >= 0 ? '+' : ''}${U.money(r.net)}</span></div>
      <div class="daily-grid">
        <div><span>Выручка</span><b class="pos">+${U.money(r.income)}</b></div>
        <div><span>Расходы</span><b class="neg">−${U.money(r.expense)}</b></div>
        <div><span>Клиентов</span><b>${r.services}</b></div>
        <div><span>Машин</span><b>${r.vehicles}</b></div>
      </div>
      <div class="daily-foot">Нажмите, чтобы открыть подробный отчёт</div>`;
    el.classList.remove('hidden');
    S.dailyTimer = 7.5;
  }

  /* ------------------------------------------------------------ тосты */

  UI.toast = toast;
  function toast(text, kind) {
    const root = $('toasts');
    if (!root) return;
    const el = document.createElement('div');
    el.className = 'toast ' + (kind || 'info');
    const icon = {
      good: '✅', bad: '⚠️', info: 'ℹ️', objective: '🎯', contract: '📋',
      levelup: '⭐', win: '🏆', error: '⛔',
    }[kind] || '•';
    el.innerHTML = `<span class="toast-icon">${icon}</span><span>${esc(text)}</span>`;
    root.appendChild(el);
    while (root.children.length > 5) root.removeChild(root.firstChild);
    setTimeout(() => {
      el.classList.add('out');
      setTimeout(() => el.remove(), 400);
    }, 4200);
  }

  /* ----------------------------------------------------------- модалки */

  function openModal(html, opts) {
    const root = $('modal-root');
    root.innerHTML = `<div class="modal-backdrop"><div class="modal ${opts && opts.wide ? 'wide' : ''}">${html}</div></div>`;
    root.classList.add('open');
    S.modalOpen = true;
  }

  UI.closeModal = function () {
    if (!S.modalOpen) return false;
    const root = $('modal-root');
    root.classList.remove('open');
    root.innerHTML = '';
    S.modalOpen = false;
    return true;
  };

  function onModalClick(e) {
    const btn = e.target.closest('[data-modal]');
    if (btn) {
      const act = btn.dataset.modal;
      if (act === 'close') UI.closeModal();
      else if (act === 'help') showHelp();
      else if (act === 'reset') {
        if (confirm('Начать новую игру? Текущий прогресс будет удалён.')) {
          UI.closeModal();
          S.app.reset();
          S.winShown = false;
        }
      } else if (act === 'save') {
        S.app.save();
      } else if (act === 'start') {
        UI.closeModal();
        S.app.setTool('road');
        S.tab = 'road';
        document.querySelectorAll('#tool-tabs [data-tab]').forEach((b) => b.classList.toggle('on', b.dataset.tab === 'road'));
        buildTools();
        toast('Первый шаг: проведите трассу между городами', 'info');
      }
      return;
    }
    if (e.target.classList.contains('modal-backdrop')) UI.closeModal();
  }

  UI.showIntro = function () {
    openModal(`
      <div class="modal-hero">
        <span class="hero-badge">дорожная компания</span>
        <h1>ТРАССА</h1>
        <p class="hero-sub">Дорожная империя: стройте трассы между городами и зарабатывайте на мелочах — кофе, заправках, шиномонтаже.</p>
      </div>
      <div class="intro-steps">
        <div><b>1</b><span>Проложите дорогу<br><small>между двумя городами</small></span></div>
        <div><b>2</b><span>Поставьте кафе и АЗС<br><small>прямо у трассы</small></span></div>
        <div><b>3</b><span>Следите за потоком<br><small>и расширяйте сеть</small></span></div>
      </div>
      <p class="modal-note">Игра идёт сама: машины едут между городами и платят за сервис. Ваша задача — выбрать удачные места. День длится около 1,5 минуты, скорость можно ускорить.</p>
      <div class="modal-actions">
        <button class="btn primary" data-modal="start">Начать стройку</button>
        <button class="btn ghost" data-modal="help">Как играть</button>
      </div>
    `, { wide: true });
  };

  function showHelp() {
    openModal(`
      <div class="modal-head"><h2>Как играть</h2><button class="x" data-modal="close">✕</button></div>
      <div class="help-grid">
        <div>
          <h3>Дороги</h3>
          <p>Выберите класс покрытия, затем два города. Дорога строится во времени: чем больше бригада, тем быстрее. Гравий и асфальт ускоряют машины — поток растёт.</p>
          <h3>Объекты</h3>
          <p>Кликните по готовой дороге и поставьте кафе, АЗС, СТО, мотель, щит. Каждый проезжающий водитель может заехать и заплатить — это и есть доход «с мелочей».</p>
          <h3>Благоустройство</h3>
          <p>Остановки, деревья, освещение и скверы поднимают довольство ближайшего города. Довольный город приводит больше машин и платит субсидию.</p>
        </div>
        <div>
          <h3>Управление</h3>
          <p><kbd>Перетаскивание</kbd> — карта · <kbd>колесо</kbd> — масштаб · <kbd>клик</kbd> — выбрать · <kbd>Esc</kbd> — отмена · <kbd>Пробел</kbd> — пауза · <kbd>1</kbd> / <kbd>2</kbd> / <kbd>3</kbd> — скорость · <kbd>R</kbd> — дороги · <kbd>F</kbd> — вся карта · <kbd>S</kbd> — сохранить.</p>
          <h3>Деньги</h3>
          <p>Каждый день списываются содержание дорог, зарплаты, налог и проценты по кредиту. Следите за отчётом: если расходы больше выручки — расширяйте поток или урезайте лишнее.</p>
          <h3>Заказы и цели</h3>
          <p>Администрации городов дают заказы с разовой оплатой. Цели кампании ведут вас от первой дороги до капитала в миллион.</p>
          <p class="modal-note">Прогресс сохраняется в браузере автоматически.</p>
        </div>
      </div>
      <div class="modal-actions">
        <button class="btn" data-modal="save">Сохранить сейчас</button>
        <button class="btn ghost" data-modal="reset">Новая игра</button>
        <button class="btn primary" data-modal="close">Продолжить</button>
      </div>
    `, { wide: true });
  }
  UI.showHelp = showHelp;

  function showBank() {
    const s = S.app.state;
    openModal(`
      <div class="modal-head"><h2>Банк</h2><button class="x" data-modal="close">✕</button></div>
      <p>Кредит помогает пережить кассовый разрыв или ускорить стройку. Проценты списываются каждый день.</p>
      <div class="bank-modal">
        <div><span>Текущий долг</span><b>${U.money(s.debt)}</b></div>
        <div><span>Лимит</span><b>${U.money(Sim.loanLimit(s))}</b></div>
        <div><span>Ставка</span><b>${(C.loanRate * 100).toFixed(1)}% в день</b></div>
        <div><span>Проценты сегодня</span><b>${U.money(Sim.interest(s))}</b></div>
      </div>
      <div class="modal-actions">
        <button class="btn primary" data-modal="loan25">Взять 25 000 ₽</button>
        <button class="btn" data-modal="loan100">Взять 100 000 ₽</button>
        <button class="btn ghost" data-modal="repay25">Погасить 25 000 ₽</button>
      </div>
    `);
  }

  function showReport() {
    const s = S.app.state;
    const hist = s.stats.history.slice(0, 12);
    const max = Math.max(1, ...hist.map((h) => Math.max(h.income, h.expense)));
    let rows = '';
    for (const h of hist) {
      rows += `<div class="report-row">
        <span>День ${h.day}</span>
        <div class="bars">
          <i class="inc" style="width:${(h.income / max) * 100}%"></i>
          <i class="exp" style="width:${(h.expense / max) * 100}%"></i>
        </div>
        <b class="${h.net >= 0 ? 'pos' : 'neg'}">${h.net >= 0 ? '+' : ''}${U.money(h.net)}</b>
      </div>`;
    }
    const r = s.dailyReport;
    openModal(`
      <div class="modal-head"><h2>Отчёт компании</h2><button class="x" data-modal="close">✕</button></div>
      <div class="stat-grid wide-grid">
        <div><span>Касса</span><b>${U.money(s.money)}</b></div>
        <div><span>Капитал</span><b>${U.money(Sim.companyValue(s))}</b></div>
        <div><span>Дорог</span><b>${Math.round(s.roads.reduce((a, x) => a + (x.open ? x.totalKm : 0), 0))} км</b></div>
        <div><span>Объектов</span><b>${s.facilities.length}</b></div>
        <div><span>Всего заработано</span><b>${U.money(s.stats.totalIncome)}</b></div>
        <div><span>Всего потрачено</span><b>−${U.money(s.stats.totalExpense)}</b></div>
      </div>
      ${r ? `<p class="modal-note">Последний день: выручка ${U.money(r.income)}, содержание ${U.money(r.upkeep)}, зарплаты ${U.money(r.salaries)}, налог ${U.money(r.tax)}, проценты ${U.money(r.interest)}.</p>` : ''}
      <h3>Дни <span class="legend"><i class="inc"></i>выручка <i class="exp"></i>расходы</span></h3>
      <div class="report-list">${rows || '<p class="muted">Первый день ещё не закончился.</p>'}</div>
      <div class="modal-actions"><button class="btn primary" data-modal="close">Закрыть</button></div>
    `, { wide: true });
  }

  function showVictory() {
    const s = S.app.state;
    openModal(`
      <div class="modal-hero victory">
        <span class="hero-badge">кампания пройдена</span>
        <h1>ДОРОЖНАЯ ИМПЕРИЯ</h1>
        <p class="hero-sub">Все цели выполнены. Компания «Трасса» связала города, построила сервис и заработала миллион на мелочах.</p>
      </div>
      <div class="stat-grid wide-grid">
        <div><span>Капитал</span><b>${U.money(Sim.companyValue(s))}</b></div>
        <div><span>Дней в игре</span><b>${U.dayNumber(s.time)}</b></div>
        <div><span>Дорог</span><b>${Math.round(s.roads.reduce((a, x) => a + (x.open ? x.totalKm : 0), 0))} км</b></div>
        <div><span>Объектов</span><b>${s.facilities.length}</b></div>
        <div><span>Сервисов оказано</span><b>${U.num(s.stats.totalServices)}</b></div>
        <div><span>Заработано</span><b>${U.money(s.stats.totalIncome)}</b></div>
      </div>
      <div class="modal-actions">
        <button class="btn ghost" data-modal="reset">Новая игра</button>
        <button class="btn primary" data-modal="close">Продолжить развитие</button>
      </div>
    `, { wide: true });
  }

  // обработчики кнопок внутри модальных окон
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-modal]');
    if (!btn) return;
    const act = btn.dataset.modal;
    if (act === 'loan25' || act === 'loan100') {
      const sum = act === 'loan25' ? 25000 : 100000;
      const res = Sim.takeLoan(S.app.state, sum);
      if (!res.ok) toast(res.error, 'bad');
      else toast(`Кредит: ${U.money(res.sum)}`, 'info');
      showBank();
    } else if (act === 'repay25') {
      const res = Sim.repayLoan(S.app.state, 25000);
      if (!res.ok) toast(res.error, 'bad');
      else toast(`Погашено: ${U.money(res.sum)}`, 'good');
      showBank();
    }
  });

  UI.saveIndicator = function () {
    const el = $('save-indicator');
    if (!el) return;
    el.textContent = '● сохранено';
    el.classList.add('flash');
    setTimeout(() => el.classList.remove('flash'), 1200);
  };

  UI.closeTooltip = function () {};

  function esc(str) {
    return String(str).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }
  UI.esc = esc;
})();
