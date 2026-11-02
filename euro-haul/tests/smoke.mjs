// Интеграционный смоук-тест: запускает игру в jsdom с заглушкой WebGL.
import { JSDOM } from 'jsdom';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const bundle = path.join(root, 'tests', 'game.test.bundle.js');

console.log('· сборка тестового бандла…');
execFileSync(
  path.join(root, 'node_modules', '.bin', 'esbuild'),
  ['src/main.js', '--bundle', '--format=iife', '--alias:three=./tests/three-stub.js', '--outfile=tests/game.test.bundle.js'],
  { cwd: root, stdio: 'inherit' }
);

const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const code = fs.readFileSync(bundle, 'utf8');

const dom = new JSDOM(html, { runScripts: 'dangerously', pretendToBeVisual: true, url: 'https://example.com/' });
const { window } = dom;
const errors = [];
window.addEventListener('error', (e) => errors.push(e.message || String(e.error)));
window.addEventListener('unhandledrejection', (e) => errors.push('promise: ' + (e.reason?.message || e.reason)));

// --- Заглушка 2D-канваса.
function fakeContext(type) {
  if (type !== '2d') return null;
  const gradient = { addColorStop() {} };
  const target = {
    canvas: { width: 512, height: 512 },
    createLinearGradient: () => gradient,
    createRadialGradient: () => gradient,
    createPattern: () => null,
    measureText: () => ({ width: 10 }),
    getImageData: (x, y, w, h) => ({ data: new Uint8ClampedArray(Math.max(1, w * h * 4)), width: w, height: h }),
    createImageData: (w, h) => ({ data: new Uint8ClampedArray(Math.max(1, w * h * 4)), width: w, height: h }),
    putImageData() {},
    drawImage() {},
    setTransform() {},
    resetTransform() {},
  };
  return new Proxy(target, {
    get(obj, prop) {
      if (prop in obj) return obj[prop];
      if (typeof prop === 'string') {
        obj[prop] = () => undefined;
        return obj[prop];
      }
      return undefined;
    },
    set(obj, prop, value) {
      obj[prop] = value;
      return true;
    },
  });
}
window.HTMLCanvasElement.prototype.getContext = function (type) {
  return fakeContext(type);
};
window.HTMLCanvasElement.prototype.toDataURL = () => 'data:image/png;base64,';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const assert = (cond, msg) => {
  if (!cond) throw new Error('ПРОВАЛ: ' + msg);
  console.log('  ✓ ' + msg);
};

async function run() {
  window.eval(code);
  await sleep(120);
  const g = window.__game;
  assert(g, 'игра загрузилась и создала объект Game');
  assert(g.state === 'menu', 'стартовый экран — меню');
  assert(window.document.getElementById('screen-menu').className.indexOf('hidden') === -1, 'меню видно');

  // Новая карьера.
  g.createCareer('Тестер', 'berlin', 0);
  await sleep(100);
  assert(g.profile && g.profile.name === 'Тестер', 'профиль создан');
  assert(g.state === 'garage', 'после создания карьеры открыт гараж');
  assert(g.offers.length >= 6, `сгенерировано контрактов: ${g.offers.length}`);
  const jobsHtml = window.document.getElementById('garage-main').innerHTML;
  assert(jobsHtml.includes('Рынок грузов'), 'вкладка рынка грузов отрисована');

  // Другие вкладки.
  for (const tab of ['garage', 'dealer', 'drivers', 'map', 'stats', 'settings']) {
    g.openGarageTab(tab);
    await sleep(20);
    assert(window.document.getElementById('garage-main').innerHTML.length > 50, `вкладка «${tab}» отрисована`);
  }
  g.openGarageTab('jobs');

  // Приём заказа и старт рейса.
  const offer = g.offers.find((o) => o.distance < 200) || g.offers[0];
  g.acceptJob(offer);
  await new Promise((r) => setTimeout(r, 400));
  assert(g.state === 'driving', 'игра перешла в режим вождения');
  assert(g.route && g.route.km > 0, `маршрут построен: ${g.route?.km?.toFixed(1)} км`);
  assert(g.truck, 'физика тягача инициализирована');
  assert(g.road && g.road.group.children.length > 0, `дорожная сцена собрана (${g.road?.group?.children?.length} объектов)`);
  assert(g.traffic && g.traffic.vehicles.length > 0, 'трафик создан');

  // Едем вперёд несколько секунд.
  g.input.keys.add('KeyW');
  await sleep(2500);
  assert(g.truck.speed > 1, `грузовик разогнался до ${(g.truck.speed * 3.6).toFixed(1)} км/ч`);
  assert(g.truck.gear >= 1, 'коробка переключилась на передачу ' + g.truck.gear);
  g.input.keys.delete('KeyW');

  // Погрузка.
  g.truck.s = g.pickupS;
  g.truck.speed = 0;
  await sleep(120);
  g.interact();
  assert(g.work, 'началась погрузка');
  g.work.elapsed = g.work.duration + 0.1;
  await sleep(120);
  assert(g.phase === 'delivery', 'после погрузки фаза — доставка');
  assert(g.truck.cargoMass > 0, 'масса груза перешла в физику');

  // Доставка.
  g.truck.s = g.deliveryS;
  g.truck.speed = 0;
  await sleep(120);
  const moneyBefore = g.profile.money;
  g.finishDelivery();
  await sleep(200);
  assert(g.profile.money > moneyBefore, `выплата зачислена: +${Math.round(g.profile.money - moneyBefore)} €`);
  assert(g.profile.stats.deliveries === 1, 'статистика доставки обновилась');
  assert(g.profile.activeJob === null, 'активный рейс закрыт');
  assert(g.profile.currentCity === offer.to, 'текущий город — пункт доставки');

  // Сохранение/загрузка.
  g.saveNow();
  const raw = JSON.parse(window.localStorage.getItem('eurotrak.saves.v1'));
  assert(raw.slots[0] && raw.slots[0].name === 'Тестер', 'профиль сохранён в localStorage');
  g.returnToMenu();
  await sleep(80);
  g.loadSlot(0);
  await sleep(120);
  assert(g.profile.money === raw.slots[0].money, 'профиль загружен с теми же деньгами');

  // Экономика.
  const before = g.profile.money;
  g.profile.money = 200000;
  g.profile.xp = 20000;
  g.profile.level = 10;
  g.buyTruck('auriga-5');
  assert(g.profile.truck.modelId === 'auriga-5', 'куплен новый тягач');
  assert(g.profile.money < 200000, 'деньги списаны');
  g.profile.money = 500000;
  g.buyGarage('berlin');
  assert(g.profile.garages.includes('berlin'), 'гараж куплен');
  g.hireDriverDialog();
  assert(g.profile.drivers.length === 1, 'водитель нанят');
  g.buySkill('long');
  assert(g.profile.skills.long === 1, 'навык прокачан');
  g.profile.money = before;

  // Дополнительные сценарии вождения: штраф, столкновение, заправка, отдых, пауза.
  g.acceptJob(g.offers[0]);
  await new Promise((r) => setTimeout(r, 400));
  assert(g.state === 'driving', 'повторный рейс начался');

  // Превышение скорости в городе -> штраф.
  const moneyBeforeFine = g.profile.money;
  const zone = g.route.zones[0];
  g.truck.s = zone.from + 5;
  g.truck.speed = 22;
  g.currentLimit = 50;
  g.checkCameras();
  assert(g.profile.money < moneyBeforeFine, 'камера выписала штраф за превышение');

  // Столкновение с трафиком.
  const beforeCollisions = g.profile.stats.collisions;
  const victim = g.traffic.vehicles.find((v) => v.active && v.dir > 0);
  if (victim) {
    victim.s = g.truck.s + 3;
    victim.lat = g.truck.lat;
    victim.speed = 8;
    g.truck.speed = 24;
    g.collisionCooldown = 0;
    g.checkCollisions(0.016);
    assert(g.profile.stats.collisions > beforeCollisions, 'столкновение зафиксировано');
  }

  // Руль: собран из деталей, шильд и текстуры на месте.
  assert(g.truckView?.wheelPivot && g.truckView.wheelPivot.children.length >= 22, 'штурвал собран из деталей');
  assert(g.truckView.badgeTexture() !== null, 'шильд на ступице нарисован');
  assert(g.truckView.stalks?.length === 2, 'подрулевые переключатели на месте');

  // Поломки: прокол → предупреждение → ремонт у обочины.
  g.profile.truck.condition.tires = 4;
  g.truck.tires = 4;
  g.truck.pushEvent('blowout', { side: 1 });
  g.handleTruckEvents();
  assert(g.breakdown && g.breakdown.type === 'tire', 'прокол зафиксирован как поломка');
  assert(/ПРОКОЛ/i.test(g.breakdownMessage() || ''), 'HUD подсказывает про поломку');
  assert(g.truck.damageSpeedLimit === 45, 'на спущенном колесе ограничена скорость');
  g.truck.speed = 0;
  g.roadsideRepair();
  assert(g.work && g.work.title.includes('Ремонт'), 'начат ремонт у обочины');
  g.work.elapsed = g.work.duration + 0.1;
  await sleep(160);
  assert(!g.breakdown && g.truck.tires === 100, 'ремонт восстановил шины и снял поломку');
  g.truck.repair('all');
  assert(g.truck.gearbox === 100 && g.truck.coolant === 1, 'сервисный ремонт восстанавливает узлы');

  // Заправка через диалог.
  const fuelBefore = g.truck.fuel;
  g.profile.money = 5000;
  g.truck.fuel = 40;
  g.fuelPrice = 1.7;
  g.refuel(100);
  assert(g.truck.fuel > fuelBefore || g.truck.fuel > 40, 'заправка добавляет топливо');

  // Отдых.
  g.profile.fatigue = 80;
  const clockBefore = g.clock.minutes;
  g.rest();
  assert(g.profile.fatigue === 0, 'отдых сбрасывает усталость');

  // Пауза и продолжение.
  g.togglePause();
  assert(g.paused === true, 'пауза включается');
  g.ui.closeModal();
  g.paused = false;

  // Справка по управлению.
  g.togglePause();
  assert(g.paused === true, 'пауза перед справкой');
  g.ui.closeModal();
  g.showHelp();
  const modalBody = window.document.getElementById('modal-body').innerHTML;
  assert(/\(F1\)|F1/.test(modalBody) && modalBody.includes('Телефон'), 'справка описывает клавиши и телефон');
  assert(window.document.querySelector('[data-act="resume"]') !== null, 'в справке есть кнопка продолжения');
  window.document.querySelector('[data-act="resume"]').click();
  assert(window.document.getElementById('modal-root').classList.contains('hidden'), 'справка закрывается');
  g.ui.closeModal();
  g.paused = false;

  // Горный тормоз и подсказки HUD.
  g.truck.retarder = 1;
  g.toggleRetarder();
  assert(g.truck.exhaustBrake === true, 'горный тормоз включается');
  g.toggleRetarder();
  assert(g.truck.exhaustBrake !== true, 'горный тормоз выключается');
  assert(window.document.getElementById('bar-air') !== null, 'в приборах есть давление воздуха');

  // Раздельная громкость слоёв.
  g.setSetting('mixEngine', 0.4);
  assert(g.settings.mixEngine === 0.4, 'громкость мотора сохраняется в настройках');
  g.audio.setMix({ engine: 0.4, ambience: 0.7 });
  assert(g.audio.mix.engine === 0.4 && g.audio.mix.ambience === 0.7, 'микшер принимает слои');

  // Погода меняется без ошибок.
  g.setWeather('storm', true);
  await sleep(300);
  assert(g.sky.weather.id === 'storm', 'погода переключилась на грозу');

  // Сохранение активного рейса и продолжение.
  g.syncProfileFromTruck();
  g.saveNow();
  const savedJob = JSON.parse(window.localStorage.getItem('eurotrak.saves.v1')).slots[0].activeJob;
  assert(savedJob && savedJob.id, 'активный рейс сохранён');
  g.returnToMenu();
  await sleep(60);
  g.loadSlot(0);
  await sleep(100);
  assert(g.profile.activeJob, 'активный рейс восстановлен из сохранения');
  g.continueActiveJob();
  await new Promise((r) => setTimeout(r, 400));
  assert(g.state === 'driving' && g.truck.s > 0, 'рейс продолжается с сохранённой точки');
  g.returnToMenu();
  await sleep(60);

  // Свободная поездка.
  g.openGarageTab('map');
  g.freeDrive('munich');
  await new Promise((r) => setTimeout(r, 400));
  assert(g.job && g.job.free, 'свободная поездка запущена');
  assert(g.phase === 'free', 'фаза свободной поездки');
  g.returnToMenu();
  await sleep(60);

  // Сохранения: слоты с датой, быстрый сейв (F5) и загрузка (F9).
  g.loadSlot(0);
  await sleep(120);
  assert(g.profile && g.profile.savedAt > 0, 'у слота есть время сохранения');
  assert(/сегодня|\d{2}\.\d{2}/.test(g.fmtSavedAt(g.profile.savedAt)), 'время сохранения читается по-русски');
  const wallet = g.profile.money;
  g.quickSave();
  const quick = JSON.parse(window.localStorage.getItem('eurotrak.quick.v1'));
  assert(quick && quick.profile && quick.profile.money === wallet, 'быстрое сохранение записано (F5)');
  g.profile.money += 7777;
  g.quickLoad();
  await sleep(150);
  assert(g.profile.money === wallet, 'загрузка (F9) вернула состояние из снимка');
  g.saveToSlot(2);
  assert(g.saves.slots[2] && g.saves.slots[2].money === wallet, 'сохранение записывается в выбранный слот');
  g.savesManager();
  assert(window.document.getElementById('modal-body').innerHTML.includes('Быстрое сохранение'), 'экран сохранений показывает снимки');
  g.ui.closeModal();

  // Поддержка разных устройств: ПК, телефон, планшет.
  assert(g.device === 'desktop', 'устройство по умолчанию — компьютер');
  assert(g.resolveQuality() === 'high', 'на ПК качество высокое');
  assert(window.document.body.classList.contains('device-desktop'), 'класс устройства на body');
  g.device = 'phone';
  g.settings.quality = 'auto';
  g.applyDeviceSettings();
  assert(window.document.body.classList.contains('device-phone'), 'телефон определяется классом body');
  assert(g.resolveQuality() === 'low', 'на телефоне автоматически низкое качество');
  assert(g.trafficCount() === 14, 'на телефоне меньше трафика');
  assert(window.document.body.classList.contains('is-touch'), 'на телефоне включается сенсорное управление');
  g.device = 'tablet';
  g.applyDeviceSettings();
  assert(g.resolveQuality() === 'medium' && window.document.body.classList.contains('device-tablet'), 'планшет: среднее качество');
  g.settings.touchControls = 'off';
  g.applyDeviceSettings();
  assert(!window.document.body.classList.contains('is-touch'), 'сенсорное управление можно отключить');
  g.settings.touchControls = 'on';
  g.applyDeviceSettings();
  assert(window.document.body.classList.contains('is-touch'), 'сенсорное управление можно включить принудительно');
  g.device = 'desktop';
  g.settings.quality = 'auto';
  g.settings.touchControls = 'auto';
  g.applyDeviceSettings();
  assert(window.document.body.classList.contains('device-desktop') && !window.document.body.classList.contains('is-touch'), 'возврат к ПК');
  assert(window.document.getElementById('btn-fullscreen') !== null, 'кнопка полного экрана есть в HUD');
  assert(window.document.getElementById('rotate-hint') !== null, 'есть подсказка поворота экрана');
  const touchButtons = [...window.document.querySelectorAll('[data-touch]')].map((b) => b.dataset.touch);
  assert(['gas', 'brake'].every((k) => touchButtons.includes(k)), 'экранные педали на месте');
  assert(window.document.getElementById('steer-pad') !== null, 'сенсорный руль на месте');
  assert(window.document.getElementById('steer-knob') !== null, 'ползунок руля на месте');

  // Проверка отрисовки кадров.
  assert(g.renderer && g.renderer.calls > 10, `кадры рендерятся (${g.renderer?.calls})`);

  if (errors.length) {
    console.error('Ошибки в процессе:', errors);
  }
  assert(errors.length === 0, 'нет ошибок выполнения');
  console.log('\n✅ Все проверки пройдены');
  dom.window.close();
  process.exit(0);
}

run().catch((err) => {
  console.error("\n❌", err.stack);
  if (errors.length) console.error('Ошибки окна:', errors);
  process.exit(1);
});
