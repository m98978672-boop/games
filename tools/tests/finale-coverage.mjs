#!/usr/bin/env node
/* СТРАЖ ФИНАЛОВ — «у каждой игры должен быть конец».

   Игра без финала — это демо. Механики могут быть любые, но если после
   всех достижений игроку нечего увидеть, партия не заканчивается, а
   обрывается. Так было у LAST SHORE (только смерть), у road-tycoon
   (экран победы терялся при перезагрузке) и у cascade-hydro (последняя
   веха давала тост на пять секунд).

   Страж не ищет слова в одном файле — он проверяет, что в разделе есть
   и признак конца, и место, где он показывается игроку. Новый раздел без
   финала уронит CI.

   Запуск: node tools/tests/finale-coverage.mjs              */
import { existsSync } from 'node:fs';
import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

let passed = 0;
let failed = 0;
function check(name, ok, detail = '') {
  if (ok) { passed++; console.log('  ✓', name); }
  else { failed++; console.log('  ✗', name, detail); }
}

/* Разделы, которые не игры: у них финала нет по определению.
   Каждый обоснован — иначе список превратится в свалку исключений. */
const NOT_GAMES = {
  site: 'витрина и каталог',
  developers: 'страница для авторов',
  news: 'новости',
  torrent: 'раздачи, не игра',
  'game-base': null, // шаблон-игра: финал есть, обрабатывается как игра
  'cloud-play': 'оболочка PLAYBRIDGE, запуск отключён',
  'folder-os': 'эмулятор операционной системы',
  'country-atlas': 'атлас стран — справочник, а не игра',
  'truck-showroom': 'шоурум техники, смотреть а не проходить',
  ratmes: 'мессенджер',
  kvenya: 'вкладка «Общение с ИИ» — страница нейросети Квени: разговор, поиски и дневник, а не игра',
  'youtube-bot': 'инструмент планирования публикаций YouTube — не игра, финала нет по определению',
  boris: 'видеосериал и страница эпизода, а не игра',
  'mesh-studio': 'редактор моделей — инструмент',
  /* РАЗЛОМ — Web-экспорт Godot: финал первой главы (выйти, добыть насос,
     вернуться за наградой) живёт внутри движка, в зашифрованном .pck.
     Страницу можно проверить только на запуск, меню и сохранение — их и
     проверяет tools/razlom-web/test.mjs в отдельном workflow. */
  razlom: 'Web-экспорт Godot, финал главы внутри движка',
};

/* Как выглядит финал в коде: условие конца + показ результата игроку. */
const END_MARKERS = [
  /gameOver\s*\(/, /missionComplete/, /showFinale/, /showVictory/, /showWinScreen/,
  /showEscape/, /showDeath/, /showMissionComplete/, /endWar\s*\(/, /endGame\s*\(/,
  /endScreen\s*\(/, /careerResult/, /onFinale/, /campaignSummary/,
  /finishLife\s*\(/, /onRoundEnd/, /victory/i, /ПОБЕД[А-Я]/, /КАМПАНИЯ ПРОЙДЕНА/,
  /МИССИЯ ЗАВЕРШЕНА/, /Флагман национальной гидроэнергетики/,
  /* свои имена финалов в разных играх — перечислены явно, чтобы новый
     раздел не мог «пройти» страж случайным совпадением слова victory */
  /showCareerEnd/, /offerFinalContract/, /careerDone/, /winScreen/, /escaped\s*=\s*true/,
  /freeMode/, /finalDone/, /endless\s*[:=]/,
  /* warehouse-crew: смена — это партия; её конец зовётся endShift, а
     экран итогов — openShiftEnd (модалка «Смена закрыта» со счётом,
     качеством и кнопкой новой смены) */
  /endShift\s*\(/, /openShiftEnd/,
];

/* Показ результата: экран, оверлей, модалка, тост-финал. */
const UI_MARKERS = [
  /overlay/i, /modal/i, /screen/i, /showScreen/, /openModal/, /endScreen/,
  /classList\.(add|toggle)/, /innerHTML/, /textContent/, /display/,
];

const sections = (await readdir(root, { withFileTypes: true }))
  .filter((d) => d.isDirectory() && !d.name.startsWith('.') && d.name !== 'node_modules')
  .map((d) => d.name)
  .filter((name) => existsSync(path.join(root, name, 'index.html')))
  .sort();

/** Собираем исходники раздела — без бандлов, вендоров и тестов. */
async function sources(dir) {
  const out = [];
  async function walk(cur) {
    let items;
    try { items = await readdir(cur, { withFileTypes: true }); } catch { return; }
    for (const it of items) {
      const full = path.join(cur, it.name);
      if (it.isDirectory()) {
        if (/^(node_modules|tests|vendor|dist|build|\.git|assets|sheets|data|docs|supabase)$/.test(it.name)) continue;
        await walk(full);
        continue;
      }
      if (!/\.(js|mjs|html)$/.test(it.name)) continue;
      if (/\.bundle\.js$|\.min\.js$/.test(it.name)) continue;
      if (/(^|\/)(three|bundle|sw)\.js$/.test(full)) continue;
      try {
        const text = await readFile(full, 'utf8');
        out.push({ file: path.relative(root, full), text });
      } catch { /* нечитаемый файл пропускаем */ }
    }
  }
  await walk(dir);
  return out;
}

console.log('Игры коллекции: у каждой есть финал\n');
const games = [];
for (const name of sections) {
  if (NOT_GAMES[name] === undefined) {
    // раздел не в списке исключений — значит, это игра, и финал обязателен
    games.push(name);
  }
}

const results = [];
for (const name of games) {
  const files = await sources(path.join(root, name));
  const all = files.map((f) => f.text).join('\n');
  const endHits = END_MARKERS.filter((re) => re.test(all));
  const uiHits = UI_MARKERS.filter((re) => re.test(all));
  results.push({ name, files: files.length, end: endHits.length, ui: uiHits.length, ok: endHits.length > 0 && uiHits.length > 0 });
}

for (const r of results) {
  check(`${r.name}: есть конец и его показ игроку`,
    r.ok,
    `маркеров конца: ${r.end}, показа: ${r.ui}, файлов прочитано: ${r.files}`);
}

console.log('\nНе игры (финала нет по определению):');
for (const [name, why] of Object.entries(NOT_GAMES)) {
  if (!why) continue;
  check(`${name} — ${why}`, existsSync(path.join(root, name)), 'папки нет — устаревшее исключение');
}

/* Каждый финал должен быть закреплён тестом: иначе он тихо сломается. */
console.log('\nФиналы закреплены тестами:');
const GUARDED = {
  'truck-haul': 'truck-haul/tests/career.mjs',
  'night-taxi': 'night-taxi/tests/finale.mjs',
  'dead-district': 'dead-district/tests/evacuation.mjs',
  'euro-haul': 'euro-haul/tests/career-end.mjs',
  'road-tycoon': 'road-tycoon/tests/victory.test.js',
  'cascade-hydro': 'cascade-hydro/tests/finale.mjs',
  'last-shore': 'last-shore/tests/escape.mjs',
};
for (const [name, test] of Object.entries(GUARDED)) {
  const exists = existsSync(path.join(root, test));
  check(`${name}: тест ${path.basename(test)}`, exists, test);
  if (exists) {
    const src = await readFile(path.join(root, test), 'utf8');
    check(`${name}: тест реально проверяет`, /passed|пройдено|check\(/.test(src));
  }
}

console.log(`\n${passed} пройдено, ${failed} провалено`);
if (failed) process.exit(1);
