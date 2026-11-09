// F8: безопасная проверка снимка текущей игры. Инспектор ничего не меняет
// в мире и не утверждает, что один снимок заменяет прогон приёмочных тестов.
const finite = Number.isFinite;
const faction = (n) => n === 0 || n === 1;
export const requiredImages = [
  ...['grass_0','grass_1','grass_2','dirt_0','dirt_1','forest_0','forest_1','forest_2','water_0','water_1','road_0','road_1','city_0','city_1'].map((n) => `tiles/${n}`),
  ...['infantry','mg','medic','engineer','scout','driver','tanker','tank','truck'].flatMap((r) => [0,1].flatMap((f) => [0,1,2,3].map((d) => `sprites/${r}_${f}_${d}`))),
  ...['sandbags','wire','trench','mg_nest','bunker','watchtower','depot','factory','farm','hq','city','bridge'].flatMap((t) => ['0','1','n'].map((f) => `sprites/${t}_${f}`)),
  ...['muzzle','explosion','smoke','blood'].map((n) => `fx/${n}`),
  ...['role_infantry','role_mg','role_medic','role_engineer','role_scout','role_tank','role_truck','role_driver','res_ammo','res_materials','res_fuel','res_meds','order_move','order_attack','order_hold','order_build','order_supply','alert_capture','pause','play','logo'].map((n) => `ui/${n}`),
];
const details = (items) => items.slice(0, 8).join('; ') + (items.length > 8 ? `; ещё ${items.length - 8}` : '');

// Ограниченное наблюдение за движением: координаты читаются, а не меняются.
// Нет доступа к траектории между выборками, поэтому ни один результат не
// называется доказанным застреванием или полноценной приёмкой ходьбы.
export class MovementObserver {
  constructor() { this.reset(); }
  reset() { this.game = null; this.startTime = null; this.samples = new Map(); this.last = null; }
  eligible(u) {
    return u?.alive && !u.downed && !u.arrived && !u.pathFailed && !u.perception?.hasContact &&
      u.goal && [u.x,u.y,u.goal.x,u.goal.y,u.speed].every(finite) && u.speed > 0 &&
      Math.hypot(u.x - u.goal.x, u.y - u.goal.y) > 34;
  }
  snapshot(game) {
    const out = new Map();
    for (const [id, u] of game.units) if (this.eligible(u)) out.set(id, { unit: u, x: u.x, y: u.y, gx: u.goal.x, gy: u.goal.y, faction: u.faction });
    return out;
  }
  update(game) {
    if (!game || !(game.units instanceof Map) || !finite(game.time)) { this.reset(); return null; }
    if (this.game !== game || this.startTime === null || game.time < this.startTime) {
      this.reset(); this.game = game; this.startTime = game.time; this.samples = this.snapshot(game); return null;
    }
    if (game.time - this.startTime < 5) return this.last;
    const current = this.snapshot(game), slow = []; let compared = 0;
    for (const [id, first] of this.samples) {
      const now = current.get(id);
      if (!now || now.unit !== first.unit || Math.hypot(now.gx - first.gx, now.gy - first.gy) > 1) continue;
      compared++;
      const displacement = Math.hypot(now.x - first.x, now.y - first.y);
      if (displacement < 6) slow.push({ id, faction: now.faction, displacement: +displacement.toFixed(2) });
    }
    this.last = { compared, slow, seconds: +(game.time - this.startTime).toFixed(2), at: +game.time.toFixed(2) };
    this.startTime = game.time; this.samples = current;
    return this.last;
  }
}

export function inspectGame({ game, renderer, bank, hud, audio, motion } = {}) {
  const entries = [];
  function check(code, name, expected, run) {
    try {
      const result = run();
      entries.push({ code, name, expected, ...result });
    } catch (error) {
      entries.push({ code, name, expected, status: 'unverified', fact: `Проверку не удалось выполнить: ${error?.message || String(error)}` });
    }
  }
  const yes = (fact) => ({ status: 'pass', fact });
  const no = (fact) => ({ status: 'fail', fact });
  const unknown = (fact) => ({ status: 'unverified', fact });
  check(700, 'Игровая сцена', 'Запущена война с игровым миром', () =>
    game?.world && game.units instanceof Map ? yes(`seed ${game.seed}, время ${game.time.toFixed(1)} с`) : unknown('Запустите войну; в меню мира ещё нет.'));
  check(701, 'Canvas и камера', 'Доступен 2D Canvas ненулевого размера и корректная камера', () => {
    if (!game) return unknown('Игра не запущена.');
    if (!renderer?.canvas || !renderer.ctx || !renderer.camera) return no('Нет рендерера, Canvas или камеры.');
    const c = renderer.camera;
    return renderer.canvas.width > 0 && renderer.canvas.height > 0 && finite(c.x) && finite(c.y) && finite(c.zoom) && c.zoom > 0
      ? yes(`Canvas ${renderer.canvas.width}×${renderer.canvas.height}`) : no('Некорректный размер Canvas или координаты камеры.');
  });
  check(702, 'Спрайты и текстуры', 'Изображения загружены; базовые тайлы, объекты, интерфейс и модели обеих сторон присутствуют', () => {
    if (!bank?.ready || !(bank.images instanceof Map)) return unknown('Банк изображений ещё не загружен.');
    const missing = [...bank.images].filter(([, image]) => !image).map(([name]) => name);
    for (const name of requiredImages) if (!bank.images.get(name) && !missing.includes(name)) missing.push(name);
    return missing.length ? no(`Отсутствуют изображения (${missing.length}): ${details(missing)}`)
      : yes(`Загружено ${bank.images.size} изображений; модели обеих фракций по 4 направления.`);
  });
  check(703, 'Бойцы и техника', 'У живых юнитов корректные ID, фракция, положение, здоровье и скорость', () => {
    if (!game?.units || !game.world) return unknown('Игра не запущена.');
    const bad = [];
    for (const [id, u] of game.units) {
      if (!u?.alive) continue;
      if (u.id !== id || !faction(u.faction) || !finite(u.x) || !finite(u.y) || !finite(u.hp) ||
          !finite(u.maxHp) || u.maxHp <= 0 || !finite(u.speed) || u.speed < 0 || !finite(u.radius) || u.radius <= 0)
        bad.push(`юнит ${id}`);
    }
    return bad.length ? no(`Некорректные данные: ${details(bad)}`) : yes(`Проверены данные ${[...game.units.values()].filter((u) => u.alive).length} живых юнитов.`);
  });
  check(704, 'Состав отрядов', 'Ссылки живых бойцов и их отрядов согласованы', () => {
    if (!game?.squads || !game?.units) return unknown('Игра не запущена.');
    const bad = [];
    for (const [id, s] of game.squads) {
      if (!(s.memberIds instanceof Set)) { bad.push(`отряд ${id}: нет состава`); continue; }
      for (const uid of s.memberIds) {
        const u = game.units.get(uid);
        // Убитые бойцы могут оставаться в составе до штатной очистки.
        if (u?.alive && (u.squadId !== id || u.faction !== s.faction)) bad.push(`отряд ${id}, боец ${uid}`);
      }
    }
    for (const [id, u] of game.units) if (u.alive && u.squadId != null) {
      const s = game.squads.get(u.squadId);
      if (!s || !s.memberIds.has(id)) bad.push(`боец ${id}: отряд ${u.squadId}`);
    }
    return bad.length ? no(`Нарушены ссылки: ${details(bad)}`) : yes(`Проверены ${game.squads.size} отрядов и ссылки живых бойцов.`);
  });
  check(705, 'Точки и постройки', 'Координаты и здоровье точек и живых построек — конечные числа', () => {
    if (!game?.world) return unknown('Игра не запущена.');
    const bad = [];
    for (const p of game.world.points) if (![p.x,p.y,p.hp,p.maxHp].every(finite)) bad.push(`точка ${p.id}`);
    for (const b of game.world.buildings) if (!b.dead && ![b.x,b.y,b.hp,b.maxHp].every(finite)) bad.push(`постройка ${b.id}`);
    return bad.length ? no(`Некорректные данные: ${details(bad)}`) : yes(`Проверено точек: ${game.world.points.length}, построек: ${game.world.buildings.filter((b) => !b.dead).length}.`);
  });
  check(706, 'Снабжение', 'Запасы обеих фракций — конечные неотрицательные числа', () => {
    const stock = game?.logistics?.stock;
    if (!Array.isArray(stock) || stock.length !== 2) return unknown('Нет доступных данных снабжения двух фракций.');
    const bad = [];
    for (let f = 0; f < 2; f++) for (const resource of ['ammo','materials','fuel','meds'])
      if (!finite(stock[f]?.[resource]) || stock[f][resource] < 0) bad.push(`${f}/${resource}: ${stock[f]?.[resource]}`);
    return bad.length ? no(`Некорректный запас: ${details(bad)}`) : yes('Четыре запаса каждой фракции проверены.');
  });
  check(707, 'Очередь приказов', 'У ожидающих приказов корректны ID, сторона и время доставки', () => {
    if (!Array.isArray(game?.api?.orders)) return unknown('Очередь приказов недоступна.');
    const queued = game.api.orders.filter((o) => o?.status === 'queued');
    const bad = queued.filter((o) => !Number.isSafeInteger(o.id) || !faction(o.faction) || !finite(o.deliverAt));
    return bad.length ? no(`Некорректные приказы: ${details(bad.map((o) => String(o.id)))}`) : yes(`Ожидающих приказов: ${queued.length}.`);
  });
  check(708, 'Карта и навигационная сетка', 'Размер карты и сетки больше нуля, массив проходимости существует', () => {
    if (!game?.world || !game.nav) return unknown('Мир или навигация недоступны.');
    const w = game.world, n = game.nav;
    return finite(w.W) && w.W > 0 && finite(w.H) && w.H > 0 && n.cols > 0 && n.rows > 0 && w.walk?.length > 0
      ? yes(`Карта ${w.W}×${w.H}, навигация ${n.cols}×${n.rows}.`) : no('Некорректные размеры карты или сетки.');
  });
  check(709, 'Звук', 'Конфигурация звуковых событий доступна', () => {
    const events = game?.cfg?.audio?.events;
    if (!events) return unknown('Звуковая конфигурация недоступна.');
    const bad = Object.entries(events).filter(([, e]) => !finite(e?.dur) || e.dur <= 0 || !finite(e.gain) || e.gain < 0).map(([k]) => k);
    return bad.length ? no(`Некорректные параметры: ${details(bad)}`) : yes(`Параметры ${Object.keys(events).length} событий; воспроизведение и качество не проверялись${audio?.ctx ? '' : ' (звук ещё не разблокирован)'}.`);
  });
  check(710, 'Интерфейс', 'HUD и его корневой элемент существуют во время войны', () => {
    if (!game) return unknown('Игра не запущена.');
    return hud && hud.root ? yes('HUD создан; фактическое управление и вёрстка не проверялись.') : unknown('Не удалось проверить корневой элемент HUD.');
  });
  check(711, 'Ограничения проверки', 'Настоящие испытания ходьбы, боя, сохранений, звука, браузера и ресурсов', () => unknown(
    'Снимок не проверяет движение во времени, баланс, воспроизведение звука, качество картинок, лицензии, всю кодовую базу и все ветви игры. Для проверок репозитория и блока 1 запускайте npm run audit:all:human.'));
  check(712, 'Наблюдение движения', 'Набрать не менее 5 игровых секунд наблюдения с одной целью', () => {
    if (!motion) return unknown('Откройте панель и дождитесь 5 игровых секунд. Во время паузы игровое время не идёт.');
    if (!motion.compared) return unknown(`Окно ${motion.seconds} игровых секунд: нет подходящих бойцов для сравнения.`);
    const sample = motion.slow.slice(0, 8).map((u) => `${u.id} (сторона ${u.faction}, ${u.displacement} px)`);
    return unknown(`Окно ${motion.seconds} игровых секунд до ${motion.at} с: сопоставлено ${motion.compared}, ` +
      `смещено менее 6 px: ${motion.slow.length}${sample.length ? `; ${sample.join('; ')}` : ''}. ` +
      'Это эвристика по двум снимкам, а не доказательство застревания или отсутствия проблем.');
  });
  return { version: 1, kind: 'live_snapshot', gameStarted: !!game, seed: game?.seed ?? null,
    gameSeconds: finite(game?.time) ? game.time : null, entries };
}

export function formatInspectorReport(report) {
  const lines = ['FRONTLINE COMMAND — БОТ-ИНСПЕКТОР F8', 'Это снимок текущей игры, не полная приёмка и не сканирование файлов репозитория.',
    `Seed: ${report.seed ?? 'нет'}, игровое время: ${report.gameSeconds == null ? 'нет' : report.gameSeconds.toFixed(1) + ' с'}.`];
  for (const e of report.entries) lines.push('', `[${String(e.code).padStart(3,'0')}] ${e.name} — ${e.status === 'pass' ? 'проверено' : e.status === 'fail' ? 'ошибка' : 'не проверено'}`,
    `Ожидание: ${e.expected}`, `Факт: ${e.fact}`);
  return lines.join('\n');
}

export class InspectorPanel {
  constructor(getContext) {
    this.getContext = getContext;
    this.report = null;
    this.motion = new MovementObserver();
    this.root = document.createElement('section');
    this.root.id = 'inspector-panel';
    this.root.className = 'inspector-panel';
    this.root.hidden = true;
    this.root.setAttribute('aria-label', 'Отчёт бота-инспектора');
    this.root.innerHTML = '<div class="inspector-head"><strong>БОТ-ИНСПЕКТОР · F8</strong><button type="button" data-action="close" aria-label="Закрыть отчёт">✕</button></div><p>Снимок текущей игры; не полная проверка репозитория.</p><div class="inspector-actions"><button type="button" data-action="refresh">Проверить снова</button><button type="button" data-action="copy">Скопировать отчёт</button></div><p class="inspector-feedback" aria-live="polite"></p><pre class="inspector-report" tabindex="0"></pre>';
    document.body.appendChild(this.root);
    this.timer = setInterval(() => { if (!this.root.hidden) this.refresh(); }, 1000);
    this.root.querySelector('[data-action="close"]').addEventListener('click', () => this.close());
    this.root.querySelector('[data-action="refresh"]').addEventListener('click', () => this.refresh());
    this.root.querySelector('[data-action="copy"]').addEventListener('click', () => this.copy());
  }
  toggle() { if (this.root.hidden) this.open(); else this.close(); }
  open() { this.root.hidden = false; this.refresh(); }
  close() { this.root.hidden = true; this.motion.reset(); }
  refresh() {
    const context = this.getContext();
    const motion = this.motion.update(context.game);
    this.report = inspectGame({ ...context, motion });
    const output = this.root.querySelector('.inspector-report');
    const top = output.scrollTop;
    // Не разрушаем выделение, если пользователь копирует отчёт вручную.
    const selection = window.getSelection?.();
    if (!selection || selection.isCollapsed || !selection.containsNode(output, true)) {
      output.textContent = formatInspectorReport(this.report);
      output.scrollTop = top;
    }
  }
  async copy() {
    const feedback = this.root.querySelector('.inspector-feedback');
    try {
      if (!navigator.clipboard?.writeText) throw new Error('нет доступа к буферу');
      await navigator.clipboard.writeText(formatInspectorReport(this.report));
      feedback.textContent = 'Отчёт скопирован.';
    } catch { feedback.textContent = 'Не удалось скопировать автоматически: выделите текст отчёта и скопируйте вручную.'; }
  }
}
