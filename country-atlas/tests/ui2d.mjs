/* Проверки интерфейса §72 (R-72.1…R-72.6, F-222…F-224): в видимом тексте нет номеров
   параграфов, у каждой галочки есть подпись и обработчик, у каждой строки HUD — место,
   легенда свёрнута и разложена по группам, значения в HUD короткие.
   Запуск: node tests/ui2d.mjs */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { formatReport } from '../src/offline2d.js';

let checks = 0;
const ok = (cond, msg) => { assert.ok(cond, msg); checks++; };

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const main = readFileSync(new URL('../src/main2d.js', import.meta.url), 'utf8');
const map = readFileSync(new URL('../src/map2d.js', import.meta.url), 'utf8');

/* видимый текст: без <style>, <script>, комментариев и тегов */
const visible = html
  .replace(/<style[\s\S]*?<\/style>/gi, ' ')
  .replace(/<script[\s\S]*?<\/script>/gi, ' ')
  .replace(/<!--[\s\S]*?-->/g, ' ')
  .replace(/<[^>]+>/g, ' ')
  .replace(/&[a-z]+;/gi, ' ');

/* F-222: в видимом тексте нет ссылок на спецификацию */
{
  ok(!visible.includes('§'), 'F-222: в интерфейсе нет знака §');
  ok(!/\b[FR]-\d/.test(visible), 'F-222: нет кодов правил вида F-207 / R-70.3');
  ok(!/\bF-\d{3}\b/.test(visible), 'F-222: нет номеров формул');
  const rows = visible.split('\n').map((l) => l.trim()).filter(Boolean);
  ok(rows.length > 30, 'видимого текста хватает: ' + rows.length + ' строк');
  for (const row of rows.slice(0, 40)) {
    ok(!/§|\bF-\d/.test(row), 'строка без ссылок: ' + row.slice(0, 40));
  }
  // служебные слова тоже не для игрока
  ok(!/промт/i.test(visible), 'нет слова «промт»');
  ok(!/MVP/.test(visible), 'нет пометок MVP');
  ok(!/IDM/.test(visible), 'нет аббревиатуры IDM в интерфейсе');
  ok(/РАТГРАД/i.test(visible), 'название игры на месте');
  ok(/7000 × 7000 км/.test(visible), 'размер мира подписан');
}

/* R-72.2: строки HUD простые и короткие */
{
  const hudIds = [];
  for (const m of html.matchAll(/<td id="(hud-[a-z]+)">/g)) hudIds.push(m[1]);
  ok(hudIds.length >= 16, 'строк HUD много: ' + hudIds.length);
  ok(new Set(hudIds).size === hudIds.length, 'id строк HUD не повторяются');

  const labels = {};
  for (const m of html.matchAll(/<tr><td>([^<]+)<\/td><td id="(hud-[a-z]+)">/g)) labels[m[2]] = m[1].trim();
  ok(Object.keys(labels).length >= 16, 'у каждой строки есть подпись');
  for (const [id, label] of Object.entries(labels)) {
    ok(label.length > 0 && label.length <= 18, 'подпись короткая: «' + label + '» (' + id + ')');
    ok(!/§/.test(label), 'подпись без §: ' + label);
    ok(/^[а-яё ]+$/i.test(label), 'подпись — русские слова: ' + label);
  }
  ok(labels['hud-trains'] === 'поезда', 'поезда подписаны по-человечески');
  ok(labels['hud-sea'] === 'суда', 'суда подписаны по-человечески');
  ok(labels['hud-offline'] === 'без вас', 'строка «без вас» на месте');
  ok(labels['hud-fps'] === 'кадров в секунду', 'FPS подписан словами');

  // все элементы, которые ищет main2d, есть в разметке
  const wanted = [...main.matchAll(/(\w+):\s*document\.getElementById\('([\w-]+)'\)/g)];
  ok(wanted.length >= 20, 'main2d ищет ' + wanted.length + ' элементов');
  for (const [, name, id] of wanted) {
    ok(html.includes('id="' + id + '"'), 'элемент ' + id + ' (' + name + ') есть в разметке');
  }
  // каждая строка, в которую пишет hudLine, объявлена в таблице HUD
  const lines = new Set([...map.matchAll(/hudLine\('([a-zA-Z]+)'/g)].map((m) => m[1]));
  ok(lines.size >= 8, 'коротких строк HUD: ' + lines.size);
  for (const name of lines) {
    ok(hudIds.includes('hud-' + name), 'строка hud-' + name + ' есть в таблице HUD');
  }
  ok(hudIds.includes('hud-why') === false, 'журнал решений не притворяется строкой HUD');
  ok(/id="why-list"/.test(html), 'журнал решений на месте');
}

/* R-72.3: у каждого тумблера есть подпись и обработчик */
{
  const toggles = [];
  for (const m of html.matchAll(/<input type="checkbox" id="(toggle-[a-z]+)"/g)) toggles.push(m[1]);
  ok(toggles.length >= 18, 'тумблеров много: ' + toggles.length);
  ok(new Set(toggles).size === toggles.length, 'id тумблеров не повторяются');
  const labels = [];
  for (const m of html.matchAll(/id="(toggle-[a-z]+)"[^>]*>([^<]+)</g)) labels.push([m[1], m[2].trim()]);
  ok(labels.length === toggles.length, 'у каждого тумблера есть подпись');
  for (const [id, label] of labels) {
    ok(label.length > 2 && label.length <= 32, 'подпись тумблера короткая: «' + label + '»');
    ok(!/§/.test(label), 'подпись тумблера без §: ' + label);
    ok(main.includes("'" + id + "'"), 'у тумблера ' + id + ' есть обработчик в main2d');
  }
  ok(toggles.includes('toggle-trains') && toggles.includes('toggle-airport') && toggles.includes('toggle-seatraffic'),
    'три тумблера микро-слоя на месте');
  ok(toggles.includes('toggle-ai') && toggles.includes('toggle-growth') && toggles.includes('toggle-pedai'),
    'тумблеры мэров, роста и толпы на месте');

  // группы тумблеров
  const groups = [...html.matchAll(/<div class="group">([^<]+)<\/div>/g)].map((m) => m[1].trim());
  ok(groups.length >= 3, 'тумблеры разложены по группам: ' + groups.join(' · '));
  ok(groups.every((g) => g.length > 2 && g.length <= 16), 'название группы короткое');
  ok(groups.every((g) => !/§/.test(g)), 'в названиях групп нет §');
  ok(groups.includes('карта') && groups.includes('жизнь'), 'есть группы «карта» и «жизнь»');
}

/* R-72.4: легенда свёрнута и разложена по группам */
{
  ok(/<details class="panel" id="legend">/.test(html), 'легенда — раскрывающийся блок');
  ok(!/<details[^>]*id="legend"[^>]*open/.test(html), 'легенда по умолчанию свёрнута');
  ok(/<summary>легенда<\/summary>/.test(html), 'у легенды есть заголовок «легенда»');
  const caps = [...html.matchAll(/<div class="cap">([^<]+)<\/div>/g)].map((m) => m[1].trim());
  ok(caps.length >= 5, 'в легенде есть группы: ' + caps.join(' · '));
  ok(caps.includes('вода') && caps.includes('дороги') && caps.includes('рельсы и небо'),
    'вода, дороги и рельсы подписаны');
  const rows = [...html.matchAll(/<div class="cap">[^<]+<\/div>\s*(?:<div class="row">[\s\S]*?<\/div>\s*)+/g)];
  ok(rows.length === caps.length, 'каждая группа не пустая');
  ok(!/§/.test(html.slice(html.indexOf('id="legend"'), html.indexOf('</details>', html.indexOf('id="legend"')))), 'в легенде нет §');
  // старые дубли убраны
  ok(!/транспорт: легковая \/ грузовик/.test(html), 'дубль «транспорт: легковая / грузовик» убран');
}

/* R-72.5: панели подписаны по-человечески */
{
  ok(/<h2 id="country-title">страна<\/h2>/.test(html), 'панель страны подписана «страна»');
  ok(/<h2>что решили мэры<\/h2>/.test(html), 'панель решений подписана «что решили мэры»');
  ok(/полигон вождения/.test(map), 'панель полигона подписана по-русски');
  ok(!/ИИ §16\.4/.test(map), 'старый заголовок полигона убран');
  ok(/тяните — сдвиг/.test(visible), 'подсказка управления на месте');
}

/* F-223: отчёт «без вас» короткий в строке и полный в подсказке */
{
  const rep = { days: 7, minutes: 10080, decisions: 188, houses: 118, parks: 28, civic: 43, industry: 32, bypass: 0, ms: 4 };
  const full = formatReport(rep);
  ok(full.includes('+7 дней'), 'полный отчёт называет срок');
  ok(full.length < 140, 'полный отчёт помещается в подсказку: ' + full.length + ' символов');
  const short = '+' + rep.days + ' дн · ' + rep.decisions + ' решений';
  ok(short.length <= 24, 'короткая строка HUD не длиннее 24 символов: ' + short.length);
  ok(/^\+\d+ дн · \d+ решений$/.test(short), 'формат короткой строки постоянный');
}

/* F-224: в собранном бандле тоже нет § в тексте интерфейса */
{
  const raw = readFileSync(new URL('../bundle.js', import.meta.url), 'utf8');
  // esbuild может писать кириллицу через \uXXXX — раскодируем, иначе проверка слепая
  const bundle = raw
    .replace(/\\u([0-9a-fA-F]{4})/g, (m, h) => String.fromCharCode(parseInt(h, 16)))
    .replace(/\\x([0-9a-fA-F]{2})/g, (m, h) => String.fromCharCode(parseInt(h, 16)));
  ok(bundle.length > 10000, 'бандл собран: ' + Math.round(raw.length / 1024) + ' kb');
  ok(!bundle.includes('§'), 'F-224: в бандле нет §');
  ok(!/ИИ §16\.4/.test(bundle), 'старый заголовок полигона не попал в бандл');
  ok(bundle.includes('полигон вождения'), 'новый заголовок полигона в бандле');
  ok(bundle.includes('что решили мэры') === false, 'заголовки панелей остались в разметке, а не в коде');
  ok(bundle.includes(' составов · '), 'короткая строка поездов в бандле: «8 составов · 110 377 км»');
  ok(bundle.includes(' судна · у моста '), 'короткая строка судов в бандле');
  ok(bundle.includes(' бортов · сели '), 'короткая строка авиации в бандле');
}

console.log('OK: 5 групп проверок интерфейса §72 (F-222…F-224, проверок ' + checks + ')');
