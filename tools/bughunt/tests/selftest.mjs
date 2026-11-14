/* Самопроверка бота-багоискателя.

   Половина теста — «подсадная игра» со специально сделанными ошибками:
   бот обязан найти каждую. Вторая половина — «честная игра», написанная
   в стиле репозитория (русские имена, регулярки с кириллицей, шаблонные
   строки, собранная чужая библиотека): здесь бот обязан промолчать.

   Запуск: node tools/bughunt/tests/selftest.mjs */

import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { walk, projects } from '../lib/scan.mjs';
import { STATIC_RULES } from '../lib/rules.mjs';
import { playGame } from '../lib/play.mjs';

let failed = 0;
const ok = (cond, msg) => {
  if (cond) console.log('  ✓ ' + msg);
  else { console.error('  ✗ ' + msg); failed++; }
};

function build(root, name, files) {
  mkdirSync(join(root, name, 'src'), { recursive: true });
  for (const [path, body] of Object.entries(files)) {
    const full = join(root, name, path);
    mkdirSync(join(full, '..'), { recursive: true });
    writeFileSync(full, body, 'utf8');
  }
}

function findingsFor(root, name) {
  const files = walk(root);
  const p = projects(root, files).find((x) => x.name === name);
  const out = [];
  for (const rule of STATIC_RULES) {
    /* синтаксис проверяется отдельно, правила репозитория — в конце файла */
    if (rule.async || rule.repo) continue;
    out.push(...rule.fn(root, p));
  }
  return { findings: out, project: p };
}

const root = mkdtempSync(join(tmpdir(), 'bughunt-'));
console.log('САМОПРОВЕРКА БОТА-БАГОИСКАТЕЛЯ');
console.log('Песочница: ' + root);

/* ------------------------- 1. игра с ошибками ------------------------- */

build(root, 'сломанная', {
  'index.html': [
    '<!doctype html><html lang="ru"><head><meta name="viewport" content="width=device-width">',
    '<link rel="stylesheet" href="нет-такого.css">',
    '</head><body>',
    '<button id="btn-start">Играть</button>',
    '<div id="hud"></div><div id="hud"></div>',
    '<script src="src/game.js"></script>',
    '</body></html>',
  ].join('\n'),
  'src/game.js': [
    "(function () {",
    "  var G = { счёт: 0 };",
    "  var стaрт = 1;                      /* тут кириллическая а в латинском слове */",
    "  function начать() { return стaрт; }",
    "  function начать() { return 2; }",
    "  function шаг(x) { if (x = 1) { return NaN; } return x; }",
    "  function сравни(a, b) { return a === a ? b : a; }",
    "  function сбить(x) { x = x; return x; }",
    "  function сохранить() { localStorage.setItem('игра', JSON.stringify(G)); }",
    "  function загрузить() { return JSON.parse(localStorage.getItem('игра')); }",
    "  window.addEventListener('load', function () {",
    "    document.getElementById('нет-кнопки').textContent = 'ой';",
    "  });",
    "  document.getElementById('btn-start').addEventListener('click', function () {",
    "    G.счёт = undefined.length;        /* падение по нажатию */",
    "  });",
    "  document.getElementById('btn-start').addEventListener('dblclick', function () {",
    "    if (confirm('Точно?')) { G.счёт = 0; }   /* модальное окно вместо своего диалога */",
    "  });",
    "  window.G = G; window.шаг = шаг; window.сохранить = сохранить; window.загрузить = загрузить;",
    "  try { null.x; } catch (e) {}",
    "})();",
  ].join('\n'),
  'data.json': '{ "а": 1, "а": 2 }',
});

{
  const { findings, project } = findingsFor(root, 'сломанная');
  const has = (rule) => findings.some((x) => x.rule === rule);
  console.log('\nПодсадная игра: бот обязан найти');
  ok(has('ссылка'), 'ссылку на несуществующий файл');
  ok(has('дубль-id'), 'повторяющийся id в разметке');
  ok(has('нет-узла'), 'обращение к узлу, которого нет');
  ok(has('кириллица-в-коде'), 'кириллическую букву внутри латинского имени');
  ok(has('дубль-функции'), 'функцию, объявленную дважды в одной области');
  ok(has('присваивание-в-условии'), 'присваивание вместо сравнения');
  ok(has('дубль-ключа-json') || has('дубль-ключа'), 'повторяющийся ключ в JSON');
  ok(has('пустой-catch'), 'молча проглоченную ошибку');
  ok(has('разбор-без-защиты') || has('хранилище-без-защиты'), 'разбор сохранения без защиты');
  ok(has('тавтология'), 'сравнение переменной с самой собой');
  ok(has('самоприсваивание'), 'присваивание переменной самой себе');
  ok(has('alert'), 'модальное окно, блокирующее игру');
  ok(!has('нечисло-в-json'), 'не выдумывает нечисла в обычном JSON');

  const play = playGame(root, project, {});
  ok(play.findings.some((x) => /кнопк/i.test(x.msg)), 'падение игры при нажатии кнопки');
}

/* ------------------------- 2. честная игра ---------------------------- */

build(root, 'честная', {
  'index.html': [
    '<!doctype html><html lang="ru"><head><meta name="viewport" content="width=device-width">',
    '<title>Честная игра</title></head><body>',
    '<button id="btn-go">Ход</button><div id="экран"></div>',
    '<select id="сложность"><option value="лёгкая">Лёгкая</option><option value="трудная">Трудная</option></select>',
    '<script src="src/lib.bundle.js?v=2"></script>',
    '<script src="src/игра.js"></script>',
    '</body></html>',
  ].join('\n'),
  /* чужая собранная библиотека: минифицированный стиль не должен возмущать бота */
  'src/lib.bundle.js': 'var L=(function(){function a(t){if(t=t||0,t<0)t=0;return t}return{a:a}})();window.L=L;',
  'src/игра.js': [
    "(function () {",
    "  /* свой генератор по зерну — в игре не должно быть Math.random */",
    "  function зерно(строка) { var h = 2166136261; for (var i = 0; i < строка.length; i++) { h ^= строка.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }",
    "  function mulberry32(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; var t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }",
    "  var rnd = mulberry32(зерно('игра'));",
    "  var падеж = /(ая|ый|ое)$/;            /* кириллица в регулярке — это текст */",
    "  var экран = document.getElementById('экран');",
    "  var нет = document.getElementById('нет-такого-узла');",
    "  if (нет) нет.textContent = 'есть';    /* проверено — значит, не падение */",
    "  function показать(о) { экран.innerHTML = `<b>${о.имя}</b> · ${о.очки} очк${падеж.test(о.имя) ? 'а' : 'ов'}`; }",
    "  function ход() { показать({ имя: 'Игрок', очки: Math.floor(rnd() * 10) }); }",
    "  function сохранить(о) { try { localStorage.setItem('честная', JSON.stringify(о)); } catch (e) { console.warn(e); } }",
    "  function загрузить() { try { return JSON.parse(localStorage.getItem('честная') || '{}'); } catch (e) { return {}; } }",
    "  document.getElementById('btn-go').addEventListener('click', ход);",
    "  window.ЧЕСТНАЯ = { ход: ход, сохранить: сохранить, загрузить: загрузить };",
    "})();",
  ].join('\n'),
  'data.json': '{ "имя": "честная", "очки": [1, 2, 3] }',
});

{
  const { findings, project } = findingsFor(root, 'честная');
  const bad = findings.filter((x) => x.severity !== 'мелочь');
  console.log('\nЧестная игра: бот обязан промолчать');
  ok(bad.length === 0, 'ни одной придирки важнее мелочи' +
    (bad.length ? ': ' + bad.map((x) => x.rule + ' (' + x.file + ':' + x.line + ')').join(', ') : ''));
  ok(!findings.some((x) => x.rule === 'кириллица-в-коде'), 'русские имена и регулярки — не ошибка');
  ok(!findings.some((x) => x.rule === 'случайность-без-зерна'), 'свой генератор по зерну засчитан');
  ok(!findings.some((x) => x.rule === 'присваивание-в-условии'), 'минифицированную библиотеку бот не трогает');

  const play = playGame(root, project, {});
  ok(play.findings.length === 0, 'игра проходит прогон без падений' +
    (play.findings.length ? ': ' + play.findings[0].msg : ''));
  ok(play.loaded === 2, 'загружены оба скрипта страницы, в том числе с версией в URL');
}

rmSync(root, { recursive: true, force: true });

console.log('');
if (failed) { console.error('✗ Провалено проверок: ' + failed); process.exit(1); }
console.log('✓ Бот ловит подложенные ошибки и не придирается к честному коду');
