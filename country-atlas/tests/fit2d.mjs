/* Проверки телефона и авто-масштаба §83 (F-279…F-286): масштаб считается из кадра,
   поворот не обрезает карту, панели на телефоне стоят сверху и снизу и не наезжают,
   кнопки не мельче пальца. Запуск: node tests/fit2d.mjs */
import assert from 'node:assert/strict';
import {
  FIT, fitScale, spanKmAt, clampScale, chooseMode, autoScale, isPhone, touchSize, layoutFor, startCenter
} from '../src/fit2d.js';

let checks = 0;
const ok = (cond, msg) => { assert.ok(cond, msg); checks++; };

const phoneP = { w: 390, h: 844 };     // телефон книзу
const phoneL = { w: 844, h: 390 };     // телефон боком
const desk = { w: 1440, h: 900 };      // ноутбук

/* 1. F-279: масштаб под кадр */
{
  const s = fitScale(phoneP, 7000, FIT.phonePadPx);
  const usable = 390 - FIT.phonePadPx * 2;
  ok(Math.abs(s - usable / 7000) < 1e-9, 'страна влезает по короткой стороне: ' + s.toFixed(4));
  ok(s * 7000 <= usable + 1e-9, 'участок не шире экрана');
  ok(fitScale(desk, 7000) > s, 'на большом экране та же страна крупнее по px');
  ok(fitScale(desk, 26) > fitScale(desk, 7000), 'город крупнее страны');
  ok(fitScale(desk, 1) > fitScale(desk, 100), 'чем меньше участок — тем крупнее масштаб');
  ok(spanKmAt(fitScale(desk, 500), desk) >= 490, 'обратная задача сходится: ' + spanKmAt(fitScale(desk, 500), desk).toFixed(0));
  ok(Math.abs(spanKmAt(fitScale(desk, 500), desk) - 500) < 1, 'обратная задача точна');
  ok(fitScale({ w: 0, h: 0 }, 7000) >= FIT.minScale, 'вырожденный кадр не даёт ноль');
  ok(fitScale(null, 7000) >= FIT.minScale, 'без кадра масштаб всё равно положителен');
  ok(fitScale(desk, 0) === FIT.maxScale, 'нулевой участок упирается в предел');
  ok(fitScale(desk, 1e9) === FIT.minScale, 'гигантский участок упирается в минимум');
  ok(clampScale(-5) === FIT.minScale, 'отрицательный масштаб подтягивается');
  ok(clampScale(1e6) === FIT.maxScale, 'огромный масштаб подтягивается');
  ok(clampScale(NaN) >= FIT.minScale, 'NaN не ломает масштаб');
  ok(clampScale(1.5) === 1.5, 'нормальный масштаб не трогается');
  ok(FIT.padPx > FIT.phonePadPx, 'на телефоне поля меньше');
  ok(FIT.minScale < FIT.maxScale, 'пределы масштаба в правильном порядке');
  ok(fitScale(phoneL, 7000, FIT.phonePadPx) > 0, 'боком страна тоже влезает');
  ok(Math.abs(fitScale(phoneL, 7000, FIT.phonePadPx) * 7000 - (390 - 32)) < 1e-9, 'боком считаем по высоте');
  ok(fitScale(desk, 900) < fitScale(desk, 12), 'область мельче города');
}

/* 2. F-281/F-282: режимы */
{
  ok(chooseMode(autoScale(desk, 'country'), desk) === 'country', 'страна опознаётся как страна');
  ok(chooseMode(autoScale(desk, 'city'), desk) === 'city', 'город опознаётся как город');
  ok(chooseMode(autoScale(desk, 'region'), desk) === 'region', 'область опознаётся как область');
  ok(autoScale(desk, 'country') < autoScale(desk, 'region'), 'страна мельче области');
  ok(autoScale(desk, 'region') < autoScale(desk, 'city'), 'область мельче города');
  ok(autoScale(desk, 'город') === autoScale(desk, 'region'), 'неизвестный режим — область');
  ok(autoScale(phoneP, 'country', true) !== autoScale(phoneP, 'country', false), 'телефон считает с другими полями');
  ok(autoScale(desk, 'city') <= FIT.maxScale, 'город не выходит за предел');
  ok(Object.keys(FIT.modes).length === 3, 'режимов три');
  ok(FIT.modes.country.km === 7000, 'страна — 7000 км');
  ok(FIT.modes.city.km === 12, 'город — 12 км');
  ok(FIT.modes.region.km > FIT.modes.city.km, 'область больше города');
  ok(chooseMode(0.05, desk) === 'country', 'крошечный масштаб — страна');
  ok(chooseMode(200, desk) === 'city', 'крупный масштаб — город');
  ok(chooseMode(FIT.minScale) === 'country', 'минимум — страна');
  ok(chooseMode(FIT.maxScale, { w: 100, h: 100 }) === 'city', 'максимум — город');
  ok(autoScale(phoneP, 'region') > autoScale(phoneP, 'country'), 'на телефоне область крупнее страны');
  ok(spanKmAt(autoScale(phoneP, 'city'), phoneP) < 60, 'город на телефоне — меньше 60 км в кадре');
  ok(spanKmAt(autoScale(desk, 'country', false), desk) > 6500, 'страна занимает весь кадр');
  ok(autoScale({ w: 1, h: 1 }, 'country') >= FIT.minScale, 'кадр в пиксель не ломает режим');
}

/* 3. F-283/F-284: телефон и палец */
{
  ok(isPhone(390), '390 px — телефон');
  ok(isPhone(820), '820 px — ещё телефон');
  ok(!isPhone(821), '821 px — уже нет');
  ok(!isPhone(1440), 'ноутбук не телефон');
  ok(!isPhone(0), 'нулевая ширина не телефон');
  ok(touchSize() === FIT.minTouchPx, 'по умолчанию кнопка под палец');
  ok(touchSize(20) === FIT.minTouchPx, 'мелкую кнопку поднимаем до 40');
  ok(touchSize(64) === 64, 'большую не уменьшаем');
  ok(FIT.minTouchPx >= 40, 'минимум не меньше 40 px');
  ok(FIT.phoneWidth === 820, 'граница телефона — 820 px');
}

/* 4. F-285: раскладка и отсутствие наложений */
{
  const p = layoutFor(390, 844);
  ok(p.phone === true, 'портрет — телефонная раскладка');
  ok(p.hudMaxVh + p.rightMaxVh <= 100, 'высоты реек не пересекаются: ' + (p.hudMaxVh + p.rightMaxVh));
  ok(p.overlap === false, 'наложения нет');
  ok(p.mapPx.w === 390 && p.mapPx.h === 844, 'карта на весь экран');
  const pl = layoutFor(844, 390);
  ok(pl.phone === true, 'боком — тоже телефон');
  ok(pl.rails !== p.rails, 'боком рейки стоят по-другому: ' + pl.rails);
  ok(pl.rightMaxVh + pl.hudMaxVh <= 100, 'боком тоже без наложений');
  const d = layoutFor(1440, 900);
  ok(d.phone === false, 'ноутбук — обычная раскладка');
  ok(d.rails === 'sides', 'на ноутбуке рейки по бокам');
  ok(d.hudMaxVh === 62, 'HUD на ноутбуке занимает не больше 62 %');
  ok(layoutFor(820, 900).phone === true, 'на границе — телефон');
  ok(layoutFor(821, 900).phone === false, 'за границей — нет');
  ok(layoutFor(320, 480).hudMaxVh <= 52, 'на маленьком экране HUD ниже');
  ok(layoutFor(390, 844).rails.includes('bottom'), 'снизу есть рейка');
  ok(layoutFor(390, 844).rails.includes('top'), 'сверху тоже есть панель');
}

/* 5. F-286: стартовый центр */
{
  const towns = [{ x: 100, y: 50, pop: 10 }, { x: -100, y: -50, pop: 900 }, { x: 0, y: 0, pop: 300 }];
  const c = startCenter(towns, 'country');
  ok(c.x === 0 && c.y === 0, 'центр страны — среднее по городам');
  const cap = startCenter(towns, 'city');
  ok(cap.x === -100 && cap.y === -50, 'город — самый населённый');
  ok(startCenter([], 'country').x === 0, 'без городов — центр мира');
  ok(startCenter([], 'city').y === 0, 'без городов город тоже в нуле');
  ok(startCenter([{ x: 5, y: 7, pop: 1 }], 'country').x === 5, 'один город — он и есть центр');
  ok(startCenter([{ x: 5, y: 7, pop: 1 }], 'city').y === 7, 'один город — он и есть столица');
  ok(startCenter(towns).x === 0, 'по умолчанию — страна');
  const far = [{ x: 3000, y: 3000, pop: 1 }, { x: 3000, y: 3000, pop: 2 }];
  ok(startCenter(far, 'country').x === 3000, 'центр не уезжает, если города в одном месте');
  ok(Number.isFinite(startCenter(towns, 'region').x), 'режим области даёт число');
  ok(startCenter(towns, 'region').x === -100, 'область смотрит на столицу');
}

console.log('OK: 5 групп проверок телефона и авто-масштаба §83 (F-279…F-286, проверок ' + checks + ')');
