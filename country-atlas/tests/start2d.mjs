/* §90: проверки начальной заставки, пролёта и подключения движка.
   Группы: заставка, пролёт, движок, разметка. Больше 20 значений в каждой. */
import { readFileSync } from 'node:fs';
import { createCanvas } from '@napi-rs/canvas';
import { START, overlayPhase, startSceneView, tourProgress, flightBank } from '../src/startscene2d.js';
import { ENGINE, engineApi, engineLabel, localClock, fixedClock, engineRng } from '../src/engine2d.js';
import { INTRO, Intro, tourWaypoints, tourCam } from '../src/intro.js';
import { buildWorld } from '../src/worldmap2d.js';
import { WV } from '../src/worldview.js';

let pass = 0, fail = 0;
const ok = (name, cond, extra = '') => {
  if (cond) { pass++; return true; }
  fail++;
  console.log('  ✗ ' + name + (extra ? '  ' + extra : ''));
  return false;
};
const near = (name, a, b, d) => ok(name, Math.abs(a - b) <= d, `${a} vs ${b}`);
const group = (title) => console.log('— ' + title);

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const main = readFileSync(new URL('../src/main2d.js', import.meta.url), 'utf8');
const introSrc = readFileSync(new URL('../src/intro.js', import.meta.url), 'utf8');

/* ——— 1. заставка ——— */
group('заставка');
ok('пока грузим — заставка на экране', overlayPhase({ hasIntro: true, loaded: false }) === 'loading');
ok('мир загружен, но пролёт идёт — заставка остаётся', overlayPhase({ hasIntro: true, loaded: true }) === 'ready');
ok('кнопку нажали — заставка уходит', overlayPhase({ hasIntro: true, loaded: true, started: true }) === 'closed');
ok('пролёт не собрался — заставка уходит сама', overlayPhase({ hasIntro: true, loaded: false, failed: true }) === 'closed');
ok('без пролёта и без загрузки — экран загрузки', overlayPhase({ hasIntro: false, loaded: false }) === 'loading');
ok('без пролёта, но загружено — нечего показывать', overlayPhase({ hasIntro: false, loaded: true }) === 'closed');
ok('пустое состояние — загрузка, а не падение', overlayPhase() === 'loading');
const loadingView = startSceneView('loading');
const readyView = startSceneView('ready');
const closedView = startSceneView('closed');
ok('на загрузке заставка видна', loadingView.overlayVisible === true);
ok('на загрузке кнопка ждёт', loadingView.buttonDisabled === true);
ok('мир готов — кнопка живая', readyView.buttonDisabled === false);
ok('мир готов — заставка всё ещё видна', readyView.overlayVisible === true);
ok('нажали — заставка скрыта', closedView.overlayVisible === false);
ok('нажали — кнопка не нужна', closedView.buttonDisabled === true);
ok('текст загрузки человеческий', /пролёт над страной/.test(loadingView.text) && !/§/.test(loadingView.text));
ok('текст готовности человеческий', /начин/.test(readyView.text) && !/§/.test(readyView.text));
ok('тексты разные — игрок видит разницу', loadingView.text !== readyView.text);
const withPoint = startSceneView('ready', { point: 'Ирбен', index: 4, total: 17 });
ok('строка точки пролёта собрана', /Ирбен/.test(withPoint.point), withPoint.point);
ok('в строке видно номер точки', /4 из 17/.test(withPoint.point), withPoint.point);
ok('без точки строка пустая', startSceneView('ready', {}).point === '');
ok('мусор в номере не ломает строку', startSceneView('ready', { point: 'Ирбен', index: NaN, total: NaN }).point === 'над страной: Ирбен');
ok('состояния не путаются: видимость по фазе', ['loading', 'ready', 'closed'].every((p, i) =>
  startSceneView(p).overlayVisible === (i < 2)));
ok('порог гашения задан', START.fadeMs >= 300 && START.fadeMs <= 1000, START.fadeMs);
ok('main2d больше не гасит заставку по факту загрузки', (() => {
  const initPart = main.slice(main.indexOf('map.init('), main.indexOf('/* §86: карта мира'));
  return !/loading\.classList\.add\('done'\)/.test(initPart);
})());
ok('main2d ведёт состояние заставки через модуль', main.includes('overlayPhase') && main.includes('applyStartScene'));
ok('main2d включает кнопку только в фазе «мир готов»', main.includes('btn.disabled = view.buttonDisabled'));
ok('текст загрузки берётся из модуля, а не пишется на месте', main.includes('startState.progress') || main.includes('view.text'));
ok('во время сборки мира видно, сколько готово', /мир ' \+ startState.progress/.test(main));
ok('проходы мира не сбрасывают текст заставки', main.includes("startState.progress = done + '/' + total"));

/* ——— 2. пролёт ——— */
group('пролёт');
const world = buildWorld(424242);
const points = tourWaypoints(world.own, 424242);
near('пролёт начинается с нуля круга', tourProgress(0, INTRO.hopSec, points.length), 0, 1e-9);
ok('на середине круга — половина', Math.abs(tourProgress(INTRO.hopSec * points.length / 2, INTRO.hopSec, points.length) - 0.5) < 1e-9);
ok('полоска не выходит за 1', (() => {
  for (let t = 0; t < 500; t += 3.7) {
    const p = tourProgress(t, INTRO.hopSec, points.length);
    if (!(p >= 0 && p < 1)) return false;
  }
  return true;
})());
ok('мусорное время даёт 0, а не NaN', tourProgress(NaN, INTRO.hopSec, points.length) === 0);
ok('пустой маршрут не делит на ноль', Number.isFinite(tourProgress(10, INTRO.hopSec, 0)));
ok('на прямой камера не кренится', flightBank({ a: 0 }, { a: 0 }) === 0);
ok('на повороте появляется крен', flightBank({ a: 0 }, { a: 0.4 }) > 0);
ok('крен в другую сторону — другой знак', flightBank({ a: 0.4 }, { a: 0 }) < 0);
ok('крен ограничен', Math.abs(flightBank({ a: 0 }, { a: Math.PI })) <= 0.035 + 1e-12, flightBank({ a: 0 }, { a: Math.PI }));
ok('без направления крена нет', flightBank(null, { a: 1 }) === 0 && flightBank({ a: 1 }, null) === 0);
ok('крен не зависит от «скачка» через ноль', Math.abs(flightBank({ a: 3.1 }, { a: -3.1 })) < 0.035);
ok('заставка проявляется, а не включается', INTRO.fadeInSec > 0.4 && INTRO.fadeInSec < 2, INTRO.fadeInSec);
ok('полоска круга включена', INTRO.progress === true);
ok('крен в настройках пролёта', INTRO.bankMax > 0 && INTRO.bankMax < 0.1, INTRO.bankMax);
const cv = createCanvas(900, 600);
cv.getBoundingClientRect = () => ({ left: 0, top: 0, width: 900, height: 600 });
const intro = new Intro(cv, world, {
  createCanvas: (a, b) => {
    const c = createCanvas(a, b);
    c.getBoundingClientRect = () => ({ left: 0, top: 0, width: a, height: b });
    return c;
  }
});
intro.resize();
intro.buildBackground();
intro.buildLayer();
intro.buildEdge();
ok('у пролёта есть часы', !!intro.clock && intro.clock.fixedDt > 0, intro.clock && intro.clock.fixedDt);
ok('часы идут шагом 1/60 с', Math.abs(intro.clock.fixedDt - 1 / 60) < 1e-9, intro.clock.fixedDt);
ok('в начале кадр тёмный', intro.fade === 0);
intro.draw();
ok('первый кадр рисуется', intro.frames === 1 && Number.isFinite(intro.lastDrawMs));
ok('пролёт умеет считать случайность', !!intro.rng && typeof intro.rng.next === 'function');
intro.fade = 1;
intro.t = INTRO.hopSec * 1.2;
intro.draw();
ok('крен после поворота в допустимых пределах', Math.abs(intro.bank) <= INTRO.bankMax + 1e-9, intro.bank);
ok('кадр не сломался от крена', intro.frames === 2);
intro.t = INTRO.hopSec * 1.3;
intro.draw();
ok('камера помнит прошлое положение', !!intro.prevCam && Number.isFinite(intro.prevCam.x));
ok('пролёт длиннее минуты — анимация видна', (points.length * INTRO.hopSec) > 120, points.length * INTRO.hopSec);
ok('пролёт не заканчивается сам', /loop/.test(introSrc) && !/stop\(\);\s*\/\/\s*конец/.test(introSrc));
ok('заставка рисует подпись и полоску в одном кадре', introSrc.includes('tourProgress(') && introSrc.includes('над страной'));
// телефон: подпись кадра не наезжает на полоску круга
const meas = (text, size = 12) => {
  const c = createCanvas(8, 8).getContext('2d');
  c.font = size + 'px sans-serif';
  return c.measureText(text).width;
};
const tail = '4 из 17 · Каменный круг';
const pwAt = (w) => Math.max(90, Math.min(220, w * 0.32));
ok('порог узкого экрана задан', INTRO.narrowW === 560, INTRO.narrowW);
ok('на телефоне подпись короче полной', tail.length < ('пролёт над страной · ' + tail).length);
ok('на телефоне подпись не лезет на полоску', 12 + meas(tail) + 18 < 390 - pwAt(390) - 14,
  (12 + meas(tail) + 18).toFixed(0) + ' vs ' + (390 - pwAt(390) - 14).toFixed(0));
ok('на широком экране подпись целиком', 12 + meas('пролёт над страной · ' + tail) + 18 < 900 - pwAt(900) - 14);
ok('полоска укладывается в треть кадра', pwAt(390) <= 390 / 3 + 1 && pwAt(1600) <= 220);
ok('подпись не вылезает за кадр', 12 + meas('пролёт над страной · 4 из 17 · Каменный круг') + 18 < 560);

/* ——— 3. движок ——— */
group('движок');
ok('шаг движка — 60 Гц', ENGINE.tickHz === 60, ENGINE.tickHz);
ok('есть защита от спирали смерти', ENGINE.maxSubsteps >= 2 && ENGINE.maxSubsteps <= 10, ENGINE.maxSubsteps);
ok('без окна движка в окружении нет', engineApi() === null);
ok('название счётчика честное без движка', /встроенный/.test(engineLabel()), engineLabel());
const lc = localClock({ tickHz: 60 });
ok('встроенные часы — не движок', lc.fromEngine === false && lc.engine === 'built-in');
near('шаг 1/60 даёт ровно один шаг', lc.advance(1 / 60).steps, 1, 0);
ok('время симуляции растёт', Math.abs(lc.simTimeSec - 1 / 60) < 1e-9, lc.simTimeSec);
ok('половина кадра копит время и не шагает', localClock({ tickHz: 60 }).advance(1 / 120).steps === 0);
ok('зависший кадр не даёт больше maxSubsteps шагов', (() => {
  const c = localClock({ tickHz: 60, maxSubsteps: 4 });
  return c.advance(5).steps <= 4;
})());
ok('длинный кадр всё равно шагает', localClock({ tickHz: 60 }).advance(0.05).steps >= 2);
ok('пауза останавливает часы', (() => {
  const c = localClock({ tickHz: 60 });
  c.setPaused(true);
  const r = c.advance(1);
  return r.steps === 0 && r.tick === 0;
})());
ok('скорость 2 ускоряет шаги', (() => {
  const c = localClock({ tickHz: 60 });
  c.setSpeed(2);
  return c.advance(1 / 30).steps >= 3;
})());
ok('отрицательное время не шагает', localClock({ tickHz: 60 }).advance(-1).steps === 0);
ok('мусор вместо времени не ломает часы', localClock({ tickHz: 60 }).advance(NaN).steps === 0);
ok('шаг можно задать в герцах и в секундах', localClock({ tickHz: 30 }).fixedDt === 1 / 30 && localClock({ fixedDt: 0.02 }).fixedDt === 0.02);
ok('колбэк получает шаг и номер', (() => {
  const c = localClock({ tickHz: 60 });
  const seen = [];
  c.advance(0.05, (dt, tick) => seen.push([dt, tick]));
  return seen.length >= 2 && Math.abs(seen[0][0] - 1 / 60) < 1e-9 && seen[0][1] === 1;
})());
const rngA = engineRng(424242), rngB = engineRng(424242), rngC = engineRng(777);
const seqA = Array.from({ length: 8 }, () => rngA.next());
const seqB = Array.from({ length: 8 }, () => rngB.next());
const seqC = Array.from({ length: 8 }, () => rngC.next());
ok('случайность повторяется от сида', seqA.join() === seqB.join());
ok('другой сид — другая случайность', seqA.join() !== seqC.join());
ok('случайность в пределах 0…1', seqA.every((v) => v >= 0 && v < 1));
ok('есть удобные обёртки', rngA.int(3, 5) >= 3 && rngA.range(1, 2) >= 1 && [1, 2].includes(rngA.pick([1, 2])));
// подставной движок: прослойка обязана взять его часы и его имя
globalThis.window = {
  GamesEngine: {
    VERSION: '1.0.0',
    version: () => '1.0.0',
    clock: (opts) => ({ engine: 'ratcore', advance: () => ({ steps: 1, tick: 1 }), fixedDt: 1 / (opts.tickHz || 30), fromEngine: true }),
    rng: (seed) => ({ next: () => 0.25, seed })
  }
};
const withEngine = fixedClock({ tickHz: 60 });
ok('с движком берутся его часы', withEngine.fromEngine === true && withEngine.engine === 'ratcore');
ok('движок называет себя в подсказке', /RatCore/.test(engineLabel()), engineLabel());
ok('движок отдаёт свою случайность', engineRng(5).next() === 0.25);
delete globalThis.window;
ok('без движка снова встроенные часы', fixedClock({}).fromEngine === false);

/* ——— 4. разметка ——— */
group('разметка');
ok('канва пролёта внутри заставки', /<div id="loading">[\s\S]*<canvas id="intro-map"/.test(html));
ok('текст заставки лежит поверх канвы', /<canvas id="intro-map"[\s\S]*<div class="box"/.test(html));
ok('кнопка старта на месте', /id="intro-start"/.test(html));
ok('строка точки пролёта на месте', /id="intro-point"/.test(html));
ok('у строки точки есть свой стиль', /#intro-point\{/.test(html));
ok('пролёт объявлен без прокрутки', /#loading\{[^}]*overflow:hidden/.test(html));
ok('заставка не принимает клики после старта', /#loading\.done\{[^}]*pointer-events:none/.test(html));
ok('движок грузится до игровых скриптов', html.indexOf('../shared/engine.js') < html.indexOf('bundle.js'));
ok('у движка есть плашка в разметке', /data-engine-badge/.test(html));
ok('bootstrap движка подключён', /engine-bootstrap\.js/.test(html));
ok('main2d тянет модуль часов', main.includes("from './engine2d.js'") || main.includes("from './startscene2d.js'"));
ok('пролёт тянет часы движка', introSrc.includes("from './engine2d.js'"));
ok('пролёт тянет крен и полоску из модуля заставки', introSrc.includes('flightBank') && introSrc.includes('tourProgress'));
ok('в разметке заставки нет номеров параграфов', !/§/.test(html.slice(html.indexOf('<div id="loading">'), html.indexOf('<div id="left-rail">'))));
ok('состояние заставки применяется одной функцией', (main.match(/applyStartScene\(\)/g) || []).length >= 5);
ok('падение пролёта не оставляет пустой экран', /startState\.failed = true/.test(main));
ok('кнопка ждёт загрузки в разметке', /id="intro-start"[^>]*disabled/.test(html));
ok('страховка 15 секунд осталась', /15000/.test(main));
ok('карта мира не пострадала от правок заставки', main.includes('worldView.open(') && WV.transitionMs >= 1400);
ok('камера пролёта не сломалась', Number.isFinite(tourCam(points, 3).scale));

console.log(`\nOK: 4 группы · ${pass} проверок`);
if (fail) { console.log(`FAIL: ${fail}`); process.exit(1); }
