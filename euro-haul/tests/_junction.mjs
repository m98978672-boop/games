// Развилки сети и отмена рейса: съезд перестраивает маршрут по дорогам,
// отмена рейса списывает неустойку и возвращает в гараж.
import { JSDOM } from 'jsdom';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const bundle = path.join(root, 'tests', 'game.test.bundle.js');

execFileSync(
  path.join(root, 'node_modules', '.bin', 'esbuild'),
  [
    'src/main.js',
    '--bundle',
    '--format=iife',
    '--alias:three=./tests/three-stub.js',
    '--alias:three/examples/jsm/loaders/EXRLoader.js=./tests/exr-stub.js',
    '--outfile=tests/game.test.bundle.js',
  ],
  { cwd: root, stdio: 'inherit' }
);

const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const code = fs.readFileSync(bundle, 'utf8');

const dom = new JSDOM(html, { runScripts: 'dangerously', pretendToBeVisual: true, url: 'https://example.com/' });
const { window } = dom;
const errors = [];
window.addEventListener('error', (e) => errors.push(e.message || String(e.error)));
window.addEventListener('unhandledrejection', (e) => errors.push('promise: ' + (e.reason?.message || e.reason)));

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
window.HTMLCanvasElement.prototype.getContext = (type) => fakeContext(type);
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
  assert(g, 'игра загрузилась');
  g.createCareer('Тестер', 'berlin', 0);
  await sleep(120);

  // Настоящий контракт, чтобы проверить неустойку.
  const offer = g.offers[0];
  g.acceptJob(offer);
  await new Promise((r) => setTimeout(r, 500));
  assert(g.state === 'driving' && g.route, 'рейс запущен');
  assert(g.route.junctions.length > 0, 'на маршруте есть развилки');

  // Подъезжаем к первой развилке.
  const j = g.route.junctions[0];
  g.truck.s = Math.max(20, j.s - 250);
  g.truck.speed = 5;
  g.updateJunction();
  const card = window.document.getElementById('junction-card');
  assert(!card.classList.contains('hidden'), 'карточка развилки показана');
  assert(window.document.getElementById('jc-city').textContent === j.cityName, 'название города развилки верное');
  const buttons = card.querySelectorAll('.jc-opt');
  assert(buttons.length === j.options.length && buttons.length > 0, 'направления съезда перечислены');

  // Слишком быстро — съезд не выполняется.
  g.truck.speed = 22;
  const before = g.route.cityIds.join('>');
  g.takeJunction(0);
  assert(g.route.cityIds.join('>') === before, 'на скорости съезд не выполняется');

  // На нормальной скорости — маршрут перестраивается через выбранный город.
  g.truck.speed = 6;
  const target = j.options[0];
  g.updateJunction();
  g.takeJunction(0);
  await new Promise((r) => setTimeout(r, 900));
  assert(g.state === 'driving', 'после съезда снова можно ехать');
  assert(g.route.cityIds.includes(target.to), `маршрут идёт через ${target.name}`);
  assert(g.route.cityIds[0] === j.cityId, 'новый маршрут начинается в городе съезда');
  assert(g.job.routeCities.join('>') === g.route.cityIds.join('>'), 'городa рейса обновлены');
  assert(g.truck.s > 0 && g.truck.s < g.route.length, 'тягач стоит на новой трассе');
  assert(g.deliveryS > 0 && g.deliveryS < g.route.length, 'новая точка выгрузки в пределах трассы');
  assert(g.job.detours === 1, 'съезд учтён в рейсе');
  assert(window.document.getElementById('junction-card').classList.contains('hidden'), 'карточка скрыта вне развилки');

  // Отмена рейса: неустойка и возврат в гараж.
  const money = g.profile.money;
  const cancelled = g.profile.stats.cancelled || 0;
  g.confirmCancelJob();
  assert(!window.document.getElementById('modal-root').classList.contains('hidden'), 'диалог отмены открыт');
  assert(/неустойк/i.test(window.document.getElementById('modal-body').textContent), 'в диалоге есть неустойка');
  g.abandonJob();
  await sleep(120);
  assert(g.profile.activeJob === null, 'активный рейс снят');
  assert(g.state === 'garage', 'игра вернулась в гараж');
  assert(g.profile.stats.cancelled === cancelled + 1, 'отмена учтена в статистике');
  assert(g.profile.money < money, 'неустойка списана');

  // В конце трассы с грузом съезда нет: сначала выгрузка.
  g.openGarageTab?.('map');
  g.freeDrive('munich');
  await new Promise((r) => setTimeout(r, 600));
  assert(g.state === 'driving' && g.job.free, 'свободная поездка запущена');
  g.truck.s = g.route.length - 10;
  g.truck.speed = 4;
  g.updateJunction();
  assert(!window.document.getElementById('junction-card').classList.contains('hidden'), 'на конце трассы предложено продолжение');
  const lastJ = g.route.junctions[g.route.junctions.length - 1];
  const nextCity = lastJ.options[0];
  g.takeJunction(0);
  await new Promise((r) => setTimeout(r, 900));
  assert(g.route.to === nextCity.to, `трасса продолжается на ${nextCity.name}`);
  assert(g.job.toName === nextCity.name, 'цель свободной поездки обновилась');

  assert(errors.length === 0, 'нет ошибок выполнения' + (errors.length ? ': ' + errors[0] : ''));
  console.log('\n✅ Проверки развилок и отмены рейса пройдены');
  process.exit(0);
}

run().catch((err) => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
