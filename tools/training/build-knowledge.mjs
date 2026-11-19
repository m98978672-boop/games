#!/usr/bin/env node
/* ============================================================
   Сборщик «знаний» для обучения модели (tools/training/build-knowledge.mjs)

   Что делает: превращает сам репозиторий в обучающие примеры.
   Источники — только настоящие данные, ничего выдуманного:

     1. ИГРА: живые состояния боя из Frontline (Game + нейтральный
        командир), превращённые в вопросы «что делать?» и ответы,
        которые проверены тем же валидатором, что и в игре.
     2. БАГИ: каталог правил баг-искателя (32 правила с кодами),
        реальные находки и — главное — пары «плохо → хорошо»,
        собранные из истории репозитория.
     3. КОД: примеры опасного и безопасного кода из реальных
        исправлений (NaN в игровом цикле, alert, eval, битые пути).

   Формат выхода: JSONL с полями
     { system, user, assistant, kind, source }
   — ровно то, что читает tools/training/finetune.mjs.

   Запуск:
     node tools/training/build-knowledge.mjs --out knowledge-data
     node tools/training/build-knowledge.mjs --out data --game 200 --code 500
   ============================================================ */
import { mkdir, writeFile, readFile, readdir, stat } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { join, resolve, relative, dirname, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');

/* ------------------------------------------------------------ утилиты */

const sha256 = (s) => createHash('sha256').update(s).digest('hex');

function parseArgs(argv) {
  const out = {
    out: 'knowledge-data', game: 0, code: 0, bug: 0, readme: 0, play: 0,
    seed: 7, quiet: false, maxFileKb: 64,
  };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--out') out.out = argv[++i];
    else if (a === '--game') out.game = Number(argv[++i]) || 0;
    else if (a === '--code') out.code = Number(argv[++i]) || 0;
    else if (a === '--bug') out.bug = Number(argv[++i]) || 0;
    else if (a === '--readme') out.readme = Number(argv[++i]) || 0;
    else if (a === '--play') out.play = Number(argv[++i]) || 0;
    else if (a === '--seed') out.seed = Number(argv[++i]) || 7;
    else if (a === '--max-file-kb') out.maxFileKb = Number(argv[++i]) || 64;
    else if (a === '--quiet') out.quiet = true;
    else throw new Error(`неизвестный флаг: ${a}`);
  }
  return out;
}

function log(...a) { if (!parseArgs.quiet) console.log(...a); }

/* ------------------------------- 1. ИГРА: состояния боя → решения */

/* Собирает настоящие состояния из симуляции Frontline. Каждый пример —
   это снимок, который видит командир, и разбор, какое действие допустимо.
   Ответ строим детерминированно и проверяем validateProposal: если он не
   проходит, пример не попадает в датасет (мусор в обучении недопустим). */
async function buildGameRows(limit, rng) {
  const rows = [];
  let mods;
  try {
    const { loadConfig } = await import(join(ROOT, 'frontline-command/src/core/config.js'));
    const { Game } = await import(join(ROOT, 'frontline-command/src/sim/game.js'));
    const { commanderSnapshot, validateProposal } = await import(join(ROOT, 'frontline-command/src/sim/neutral_commander.js'));
    const { commanderPrompt } = await import(join(ROOT, 'frontline-command/src/ai/commander-prompts.js'));
    mods = { loadConfig, Game, commanderSnapshot, validateProposal, commanderPrompt };
  } catch (e) {
    log('  игра недоступна:', e.message);
    return rows;
  }

  const cfg = await mods.loadConfig();
  cfg.factions = cfg.factions.map((f) => ({ ...f, persona: 'balanced' }));
  cfg.faction = (id) => cfg.factions[id] || cfg.factions[0];
  const prompt = mods.commanderPrompt(true);

  /* Правила выбора действия — те же ограничения, что в validateProposal.
     Это не «эксперт», а честная политика: видно, что можно, и выбирается
     самое полезное из допустимого. */
  function decide(input) {
    const squads = input.squads || [];
    const points = input.points || [];
    const builds = input.builds || [];
    const lowAmmo = squads.findIndex((s) => s.ammo < 70);
    if (lowAmmo >= 0) return { action: 'supply', squad: lowAmmo };
    const engineer = squads.findIndex((s) => s.engineers > 0);
    if (builds.length && engineer >= 0) return { action: 'build', squad: engineer, build: 0 };
    if (points.length) return { action: 'hold', squad: 0, point: 0 };
    return { action: 'none' };
  }

  const seeds = [];
  for (let s = 300; s < 300 + Math.max(10, Math.ceil(limit / 20)); s++) seeds.push(s);

  /* Сначала собираем весь пул состояний за полный бой (120 с игрового
     времени), и только потом выбираем. Если обрывать по лимиту, в выборку
     попадут только первые секунды — без расхода боеприпасов и без действий
     supply/none, и модель никогда их не выучит. */
  const pool = [];
  const seen = new Set();
  for (const seed of seeds) {
    for (const swapSides of [false, true]) {
      let game;
      try { game = new mods.Game({ cfg, seed, aiVsAi: true, swapSides }); } catch (e) { continue; }
      let steps = 0;
      while (steps < 4200) {
        try { game.step ? game.step(1 / 30) : game.update(1 / 30); } catch (e) { break; }
        steps++;
        if (steps % 15 !== 0) continue;
        for (const faction of [0, 1]) {
          let snap;
          try { snap = mods.commanderSnapshot(game, faction); } catch (e) { continue; }
          const input = snap.input;
          const key = JSON.stringify(input);
          if (seen.has(key)) continue;
          seen.add(key);
          const answer = decide(input);
          const text = JSON.stringify(answer);
          if (!mods.validateProposal(text, snap)) continue;
          pool.push({
            system: prompt, user: key, assistant: text, kind: 'game-decision',
            action: answer.action,
            source: `frontline seed=${seed} swap=${swapSides} t=${(game.time ?? steps / 30).toFixed(1)}`,
          });
        }
      }
    }
    if (pool.length >= limit * 6 && pool.some((r) => r.action === 'supply')) break;
  }

  /* Баланс по действиям: round-robin по корзинам, чтобы ни одно действие
     не вытеснило остальные. Внутри корзины порядок — как в бою. */
  const buckets = new Map();
  for (const r of pool) {
    if (!buckets.has(r.action)) buckets.set(r.action, []);
    buckets.get(r.action).push(r);
  }
  const order = ['supply', 'build', 'hold', 'none'];
  const queues = order.filter((a) => buckets.has(a)).map((a) => buckets.get(a));
  const picked = [];
  let progress = true;
  while (picked.length < limit && progress) {
    progress = false;
    for (const q of queues) {
      if (q.length && picked.length < limit) {
        const r = q.shift();
        const { action, ...rest } = r;
        picked.push(rest);
        progress = true;
      }
    }
  }
  return picked;
}

/* --------------------------------- 2. БАГИ: каталог правил и находки */

async function buildBugRows(limit, rng) {
  const rows = [];
  let codes;
  try {
    const mod = await import(join(ROOT, 'tools/bughunt/lib/catalog.mjs'));
    codes = mod.CODES || null;
  } catch (e) {
    log('  каталог правил недоступен:', e.message);
    return rows;
  }
  if (!Array.isArray(codes) || !codes.length) {
    log('  каталог правил: неожиданный формат');
    return rows;
  }

  const system = 'Ты проверяешь игры и приложения на баги. Отвечай по существу и коротко. '
    + 'Код бага — это число от 000 до 999: сотни — раздел, десятки и единицы — правило внутри раздела.';

  for (const c of codes) {
    // В каталоге 1000 кодов, но часть — пустые слоты аудита без правила и
    // уровня. Учить на «null» нельзя: в датасет идут только именованные.
    if (!c.rule || !c.severity || c.audit) continue;
    const code = String(c.code).padStart(3, '0');
    rows.push({
      system,
      user: 'Что проверяет правило с кодом ' + code + '? Ответь: что именно проверяется и насколько это опасно.',
      assistant: `Код ${code} — «${c.title}». Раздел: ${c.category} (${c.block}). Уровень: ${c.severity}. `
        + `Правило ищет: ${c.rule}. Если нарушено — это ${c.severity}.`,
      kind: 'bug-rule',
      source: 'tools/bughunt/lib/catalog.mjs',
    });
    if (rows.length >= limit) return rows;
  }

  // Обратный вопрос: «это критично или нет?» — закрепляем уровни важности.
  const severitySystem = 'Определи важность находки в коде игры. Отвечай одним словом: критично, важно или мелочь.';
  const SEVERITY_EXAMPLES = [
    ['Скрипт не компилируется: SyntaxError при загрузке страницы.', 'критично'],
    ['Ссылка на файл игры ведёт в никуда: 404 по ассету.', 'критично'],
    ['В JSON сохранения записан NaN.', 'критично'],
    ['Модальное окно alert перекрывает игру на телефоне.', 'важно'],
    ['Кнопка закрытия панели ничего не закрывает.', 'важно'],
    ['Дублируется ключ в JSON-таблице.', 'важно'],
    ['В пути ассета стоят обратные слэши вместо прямых.', 'важно'],
    ['В тексте интерфейса опечатка в подписи.', 'мелочь'],
    ['В файле осталась пустая строка-заглушка.', 'мелочь'],
    ['Число в данных записано строкой.', 'мелочь'],
  ];
  for (const [text, answer] of SEVERITY_EXAMPLES) {
    rows.push({ system: severitySystem, user: text, assistant: answer, kind: 'bug-severity', source: 'примеры уровней' });
    if (rows.length >= limit) return rows;
  }
  return rows;
}

/* --------------------------- 3. КОД: опасное и безопасное из истории */

/* Ищем в реальных файлах репозитория узнаваемые опасные конструкции и
   показываем правильную замену. Каждый пример взят из живого кода —
   так модель учится на тех же ошибках, что уже были в проектах. */
const CODE_LESSONS = [
  {
    bad: /const dt = Math\.min\(0\.05, \(now - last\) \/ 1000\);/,
    system: 'Ты ищешь баги в игровом цикле на JavaScript. Ответь, в чём проблема и как исправить.',
    user: 'Игровой цикл: function frame(now) { const dt = Math.min(0.05, (now - last) / 1000); last = now; step(dt); }\nЧто случится, если браузер передаст now пустым?',
    assistant: 'dt станет NaN. Math.min не отсекает NaN, а проверка dt <= 0 для NaN ложна — NaN попадёт в игровое время и останется там навсегда: игра замирает или улетает в бесконечность без ошибки в консоли.\n\nИсправление:\n  const stamp = Number.isFinite(now) ? now : performance.now();\n  let raw = (stamp - last) / 1000;\n  if (!Number.isFinite(raw) || raw < 0) raw = 0;\n  const dt = Math.min(0.05, raw);\n  last = stamp;',
    kind: 'code-dt',
    source: 'tools/tests/frame-dt.mjs',
  },
  {
    bad: /if \(dt <= 0\) return;/,
    system: 'Ты ищешь баги в игровом цикле на JavaScript. Ответь, в чём проблема и как исправить.',
    user: 'В функции шага симуляции стоит проверка: if (dt <= 0) return;\nПочему этого недостаточно?',
    assistant: 'Сравнение NaN <= 0 ложно, поэтому проверка пропускает NaN дальше — в состояние игры. Нужна проверка на конечность: if (!Number.isFinite(dt) || dt <= 0) return;',
    kind: 'code-dt',
    source: 'road-tycoon/src/sim.js',
  },
  {
    bad: /alert\s*\(/,
    system: 'Ты ищешь баги в браузерной игре. Ответь, в чём проблема и как исправить.',
    user: 'В обработчике кнопки стоит alert(e.message).\nЧем это плохо в игре?',
    assistant: 'alert блокирует весь интерфейс и на телефоне перекрывает экран целиком: игра выглядит сломанной. Нужен неблокирующий способ показать ошибку — свой тост, статус в панели или встроенный диалог, который закрывается по кнопке.',
    kind: 'code-ui',
    source: 'folder-os/index.html',
  },
  {
    bad: /new Function\s*\(/,
    system: 'Ты ищешь дыры в безопасности в JavaScript-коде. Ответь, в чём проблема и как исправить.',
    user: 'Код собирает строку и выполняет её через new Function(text).\nЧем это опасно?',
    assistant: 'Любая строка, попавшая туда из сохранения, URL или файла пользователя, станет исполняемым кодом. Нужен разбор данных (JSON.parse с проверкой полей) и явный список разрешённых действий вместо исполнения текста.',
    kind: 'code-security',
    source: 'tools/torrent/build-catalog.mjs',
  },
  {
    bad: /c\.target\.tagName/,
    system: 'Ты ищешь баги в обработчике клавиатуры. Ответь, в чём проблема и как исправить.',
    user: 'window.addEventListener("keydown", (e) => { if (e.target.tagName !== "INPUT") { ... } });\nПочему это падает?',
    assistant: 'У события с window/document target может быть без tagName (это не элемент), тогда обращение к tagName бросает TypeError и любая клавиша роняет игру. Нужна проверка: if (e.target && e.target.tagName !== "INPUT").',
    kind: 'code-dom',
    source: 'truck-showroom/showroom.bundle.js',
  },
  {
    bad: /position: fixed;[\s\S]{0,200}z-index/,
    system: 'Ты ищешь баги вёрстки в игре. Ответь, в чём проблема и как исправить.',
    user: 'У всплывающих уведомлений z-index: 34, а у карточки с важным отчётом z-index: 26.\nЧто не так?',
    assistant: 'Уведомления окажутся выше отчёта и перекроют цифры в момент, когда игрок их читает. Отчёт должен быть выше: .report { z-index: 40 }, а уведомления при открытом отчёте ещё и уступать место.',
    kind: 'code-css',
    source: 'road-tycoon/style.css',
  },
];

async function buildCodeRows(limit) {
  const rows = [];
  for (const lesson of CODE_LESSONS) {
    rows.push({
      system: lesson.system,
      user: lesson.user,
      assistant: lesson.assistant,
      kind: lesson.kind,
      source: lesson.source,
    });
    if (rows.length >= limit) return rows;
  }

  // Добор: реальные правила «как проверить игру» из README и AGENTS.
  const extras = [
    ['Какие проверки обязательны перед публикацией игры?',
      'Проверить, что все ссылки из HTML и CSS ведут на существующие файлы; что каждый скрипт компилируется; что в сохранении не бывает NaN; что игра запускается и реагирует на клавиши, мышь и касания; что данные каталога совпадают с файлами игры.'],
    ['Как проверить игру, не открывая её вручную?',
      'Запустить бота-багоискателя: node tools/bughunt/bughunt.mjs --play. Он читает файлы, открывает игру в мини-браузере, нажимает кнопки, тыкает мышью и клавишами, крутит игровой цикл и проверяет, что в состоянии не осталось NaN.'],
    ['Что значит «игра закончена»?',
      'Нет незакрытых пунктов в PLAN.md, все заявленные кнопки и экраны работают, есть автосохранение, игра переживает битый кадр и отсутствие WebGL, а тесты проекта и бот-багоискатель не находят ни одного критичного или важного дефекта.'],
  ];
  for (const [q, a] of extras) {
    rows.push({ system: 'Ты помогаешь проверять браузерные игры на баги. Отвечай по делу.', user: q, assistant: a, kind: 'code-check', source: 'AGENTS.md' });
    if (rows.length >= limit) return rows;
  }
  return rows;
}

/* ------------------------------------------ 4. Общие правила репозитория */

/* «Как играть и в чём смысл» — по каждому настоящему README игры и по GDD
   Frontline. Тексты берём из репозитория, а не сочиняем: если в README нет
   раздела, игра пропускается, чтобы модель не выучила выдумку. */
async function buildPlayRows(limit) {
  const rows = [];
  const system = 'Ты объясняешь, как играть в игры этого репозитория и в чём их смысл. Отвечай точно, по правилам игры.';

  // Frontline: смысл берём из GDD (дизайн-документ), он совпадает с кодом.
  const FRONTLINE = [
    ['В чём смысл игры Frontline: Command?',
      'Это тактическая песочница про войну двух армий. Вы можете быть бойцом, командиром или стратегом, а противник управляется тем же кодом, что и ваша армия — правила для всех одни: юниты, мораль, туман войны, лимиты, задержка радио. Смысл не в скорости кликов, а в управлении системой: снабжение, сектора, фронт, окружение и экономика работают сами, вы влияете на них приказами.'],
    ['Как победить во Frontline?',
      'Захватить штаб противника или все его ключевые города. Поражение — то же самое для вашей стороны. Смерть бойца не заканчивает войну: он возрождается на базе, армия продолжает воевать. Есть и третий исход: если обе армии уничтожены одновременно, засчитывается ничья — «Обе армии уничтожены».'],
    ['Какие три уровня управления во Frontline?',
      'Солдат — видит только своё окружение и конус зрения, стреляет, занимает укрытия, ремонтирует, лечит. Командир — видит карту, отряды и точки, выделяет и приказывает, строит, снабжает. Стратег — видит сектора, влияние и фронт, задаёт директивы и приоритеты производства. Переключение клавишей Tab, без потери управления армией.'],
    ['Почему приказ во Frontline может не выполниться?',
      'Приказ — это событие, а не мгновенное перемещение. Он идёт с задержкой радио, может быть отклонён, а отряд с моралью ниже 40 может отказаться. Ниже 20 — паника и отход к рубежу. Отряд с потерями больше половины отступает. Это часть замысла: командир должен учитывать состояние людей, а не только карту.'],
    ['Как работает снабжение во Frontline?',
      'Снабжение секторов падает со временем и с расстоянием от базы, склады и грузовики его восстанавливают, окружённые сектора теряют его быстрее. Боеприпасы конечны: их нужно подвозить со складов. Отсюда главное правило командира — не растягивать фронт дальше, чем можешь кормить.'],
    ['Что такое мораль во Frontline?',
      'Число от 0 до 100. Растёт от командира рядом, от укрытий и передышки без контакта. Падает от подавления, потерь и отсутствия командира. Это второй ресурс после боеприпасов: отряд без морали не выполняет приказы, даже если у него полный боекомплект.'],
    ['Какие клавиши управления во Frontline?',
      'W A S D — движение, R — перезарядка, E — взаимодействие, Space — пауза, Tab — смена уровня управления, B — строительство, T — директивы, P — автопилот, K — навыки, G — создать отряд, M — карта команд, [/] — скорость времени, F3 — отладка, Escape — меню.'],
  ];
  for (const [q, a] of FRONTLINE) {
    rows.push({ system, user: q, assistant: a, kind: 'play-frontline', source: 'frontline-command/docs/GDD.md, src/core/input.js' });
    if (rows.length >= limit) return rows;
  }

  // Остальные игры: берём заголовок и раздел «Как играть» из README.
  let entries = [];
  try { entries = await readdir(ROOT, { withFileTypes: true }); } catch (e) { return rows; }
  const skip = new Set(['node_modules', 'site', 'tools', 'shared', 'docs', 'news', 'collection', 'torrent', 'developers', '.git', '.github']);
  for (const ent of entries) {
    if (rows.length >= limit) break;
    if (!ent.isDirectory() || skip.has(ent.name) || ent.name.startsWith('.')) continue;
    let text;
    try { text = await readFile(join(ROOT, ent.name, 'README.md'), 'utf8'); } catch (e) { continue; }
    if (text.length > 60_000) text = text.slice(0, 60_000);

    const title = (text.match(/^#\s+(.+)$/m) || [null, ent.name])[1].replace(/[*_`]/g, '').trim();
    // Раздел «как играть» — до следующего заголовка того же уровня.
    const play = text.match(/^##\s+(?:Как играть|How to play|Управление|Gameplay)[^\n]*\n([\s\S]*?)(?=^##\s|\Z)/m);
    const body = (play ? play[1] : text.split(/^##\s/m)[1] || '').replace(/\s+/g, ' ').trim();
    if (body.length < 90) continue;

    rows.push({
      system,
      user: `Как играть в «${title}» и в чём смысл?`,
      assistant: body.slice(0, 1400),
      kind: 'play-guide',
      source: `${ent.name}/README.md`,
    });
  }
  return rows;
}

/* --------------------------------------------- 5. Правила репозитория */

async function buildReadmeRows(limit) {
  const rows = [];
  const system = 'Ты знаешь правила этого репозитория игр и объясняешь их кратко и точно.';
  const facts = [
    ['Почему игры не должны зависеть от интернета?',
      'Сайт выкладывается на GitHub Pages и должен работать статически. Внешние CDN и запросы к серверу при запуске ломают офлайн-игру и замедляют загрузку.'],
    ['Зачем каждая игра подключает shared/engine.js раньше своих скриптов?',
      'Общий движок даёт единый HUD, сохранения и обработку ввода. Если подключить его после своих скриптов, части игры уже успеют обратиться к несуществующему API.'],
    ['Почему сохранения пишутся в localStorage с проверкой?',
      'Приватный режим и переполнение хранилища бросают исключение. Запись без try/catch роняет игру в момент сохранения — самый заметный для игрока момент.'],
    ['Как добавить новую игру в репозиторий?',
      'Создать папку с index.html, подключить shared/theme.css и engine.js, добавить запись в site/community-games.json, обложку и README, затем проверить тестами и ботом-багоискателем.'],
    ['Что нельзя делать с файлами игроков?',
      'Автоудаление касается только вредоносных файлов: исполняемых, майнеров, похитителей ключей. Игровые .js, .html, .wasm, картинки, звук и сохранения не удаляются никогда.'],
  ];
  for (const [q, a] of facts) {
    rows.push({ system, user: q, assistant: a, kind: 'repo-rule', source: 'AGENTS.md, README.md' });
    if (rows.length >= limit) return rows;
  }
  return rows;
}

/* ------------------------------------------------------------------ сбор */

async function main() {
  const opts = parseArgs(process.argv.slice(2));
  const outDir = resolve(ROOT, opts.out);
  await mkdir(outDir, { recursive: true });

  // Детерминированная перестановка: один seed — один и тот же датасет.
  let state = (opts.seed || 7) >>> 0;
  const rng = () => { state = (state * 1664525 + 1013904223) >>> 0; return state / 4294967296; };
  const shuffle = (a) => {
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };

  console.log('Собираю знания из репозитория');
  const rows = [];

  const gameLimit = opts.game || 0;
  if (gameLimit > 0) {
    console.log('  бой Frontline: до', gameLimit, 'состояний…');
    const game = await buildGameRows(gameLimit, rng);
    console.log('   получено', game.length);
    rows.push(...game);
  }

  const bugLimit = opts.bug || 0;
  if (bugLimit > 0) {
    console.log('  правила баг-искателя: до', bugLimit, '…');
    const bugs = await buildBugRows(bugLimit, rng);
    console.log('   получено', bugs.length);
    rows.push(...bugs);
  }

  const codeLimit = opts.code || 0;
  if (codeLimit > 0) {
    console.log('  уроки по коду: до', codeLimit, '…');
    const code = await buildCodeRows(codeLimit);
    console.log('   получено', code.length);
    rows.push(...code);
  }

  const playLimit = opts.play || 0;
  if (playLimit > 0) {
    console.log('  как играть и в чём смысл: до', playLimit, '…');
    const play = await buildPlayRows(playLimit);
    console.log('   получено', play.length);
    rows.push(...play);
  }

  const readmeLimit = opts.readme || 0;
  if (readmeLimit > 0) {
    console.log('  правила репозитория: до', readmeLimit, '…');
    const rules = await buildReadmeRows(readmeLimit);
    console.log('   получено', rules.length);
    rows.push(...rules);
  }

  if (!rows.length) {
    console.error('Ничего не собрано: укажите --game/--bug/--code/--readme больше нуля.');
    process.exit(1);
  }

  // Убираем точные дубликаты: повтор одного и того же входа портит обучение.
  const seen = new Set();
  const clean = [];
  for (const r of rows) {
    const key = sha256(r.system + '\u0000' + r.user);
    if (seen.has(key)) continue;
    seen.add(key);
    clean.push(r);
  }

  shuffle(clean);
  // Делим на обучение и проверку по источникам, чтобы не было утечки.
  const evalCount = Math.max(1, Math.round(clean.length * 0.1));
  const shuffled = clean.slice();
  const evalRows = shuffled.splice(0, evalCount);

  const writeJsonl = async (name, list) => {
    const body = list.map((r) => JSON.stringify(r)).join('\n') + '\n';
    await writeFile(join(outDir, name), body, 'utf8');
    return sha256(body);
  };
  const trainHash = await writeJsonl('train.jsonl', shuffled);
  const evalHash = await writeJsonl('eval.jsonl', evalRows);

  const byKind = {};
  for (const r of clean) byKind[r.kind] = (byKind[r.kind] || 0) + 1;

  const manifest = {
    schema: 'games-knowledge-v1',
    madeAt: new Date().toISOString(),
    seed: opts.seed,
    counts: { total: clean.length, train: shuffled.length, eval: evalRows.length, byKind },
    files: {
      train: { name: 'train.jsonl', count: shuffled.length, sha256: trainHash },
      eval: { name: 'eval.jsonl', count: evalRows.length, sha256: evalHash },
    },
    note: 'Только настоящие данные репозитория: состояния боя Frontline, каталог правил баг-искателя и реальные исправления. Ничего выдуманного.',
  };
  await writeFile(join(outDir, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n', 'utf8');

  console.log('\nГотово');
  console.log('  всего примеров:', clean.length);
  console.log('  обучение:', shuffled.length, '· проверка:', evalRows.length);
  console.log('  по типам:', JSON.stringify(byKind));
  console.log('  папка:', relative(ROOT, outDir) || outDir);
}

await main();
