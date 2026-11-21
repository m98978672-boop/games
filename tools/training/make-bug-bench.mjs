#!/usr/bin/env node
/* ============================================================
   Бенчмарк «найди баг» (tools/training/make-bug-bench.mjs)

   Зачем: чтобы «модель проверяет код» можно было измерить числом,
   а не на словах. Берём настоящие файлы репозитория, вносим в них
   известные дефекты и кладём рядом чистые копии. Эталон известен,
   поэтому считаются точность и полнота, а не «на глаз».

   Дефекты те же, что ищет бот-багоискатель: битый синтаксис, NaN в
   игровом цикле, блокирующий alert, ссылка в никуда, потерянный
   атрибут. Каждый помечен кодом правила из каталога.

   Запуск: node tools/training/make-bug-bench.mjs --out bug-bench
   ============================================================ */
import { mkdir, writeFile, readFile } from 'node:fs/promises';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');

const args = process.argv.slice(2);
const get = (name, def) => {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : def;
};
const outDir = resolve(ROOT, get('--out', 'bug-bench'));

/* Каждый сценарий: где взять живой файл, как его испортить и какое
   правило нарушено. Порча минимальная — как в реальном коммите. */
const SCENARIOS = [
  {
    id: 'syntax-break',
    file: 'road-tycoon/src/sim.js',
    rule: 'скрипт-не-компилируется',
    code: '001',
    severity: 'критично',
    what: 'Пропущена закрывающая скобка — весь файл перестаёт загружаться.',
    break: (src) => src.replace(/^/, '/* '),
  },
  {
    id: 'nan-dt',
    file: 'road-tycoon/src/sim.js',
    rule: 'нечисло-в-состоянии',
    code: '017',
    severity: 'критично',
    what: 'Кадр не проверяется на конечность — NaN попадает в состояние игры.',
    break: (src) => src.replace(/if \(!Number\.isFinite\(dt\)[^\n]*/, '/* без проверки dt */'),
  },
  {
    id: 'blocking-alert',
    file: 'folder-os/index.html',
    rule: 'блокирующий-alert',
    code: '070',
    severity: 'важно',
    what: 'alert останавливает игру и перекрывает экран на телефоне.',
    break: (src) => src.replace(/<body([^>]*)>/, '<body$1>\n<script>alert("ошибка");</script>'),
  },
  {
    id: 'dead-link',
    file: 'night-taxi/index.html',
    rule: 'ссылка',
    code: '200',
    severity: 'критично',
    what: 'Ссылка на несуществующий файл — ассет не загрузится, экран пустой.',
    break: (src) => src.replace(/<script([^>]*)\ssrc="[^"]*"/, '<script$1 src="js/does-not-exist.js"'),
  },
  {
    id: 'backslash-path',
    file: 'truck-haul/index.html',
    rule: 'слэш',
    code: '204',
    severity: 'важно',
    what: 'Обратные слэши в пути: на сервере файл не найдётся.',
    break: (src) => src.replace(/src="([^"]*)\/([^"/]+\.js)"/, 'src="$1\\\\$2"'),
  },
  {
    id: 'eval-usage',
    file: 'tools/torrent/build-catalog.mjs',
    rule: 'опасный-код',
    code: '600',
    severity: 'важно',
    what: 'Исполнение строки как кода — дыра в безопасности.',
    break: (src) => src.replace(/\n/, '\nconst unsafe = new Function("return 1");\n'),
  },
{
    id: 'storage-no-try',
    file: 'road-tycoon/src/sim.js',
    rule: 'хранилище-без-защиты',
    code: '402',
    severity: 'мелочь',
    what: 'localStorage без try: в приватном режиме браузера это исключение и игра падает при сохранении.',
    break: (src) => src.replace(/\n/, '\nwindow.__unsafeSave = () => localStorage.setItem("x", "1");\n'),
  },
  {
    id: 'empty-catch',
    file: 'folder-os/index.html',
    rule: 'пустой-catch',
    code: '303',
    severity: 'мелочь',
    what: 'Ошибка поймана и выброшена: причину сбоя не найти ни игроку, ни разработчику.',
    break: (src) => src.replace(/<body([^>]*)>/, '<body$1>\n<script>try { null.x; } catch (e) {}</script>'),
  },
  {
    id: 'missing-json-field',
    file: 'site/community-games.json',
    rule: 'пустое-поле-данных',
    code: '103',
    severity: 'важно',
    what: 'У записи пропало обязательное поле title — карточка в каталоге останется без названия.',
    break: (src) => src.replace(/"title"\s*:\s*"[^"]*",/, ''),
  },
  {
    id: 'self-closing-script',
    file: 'truck-haul/index.html',
    rule: 'разметка',
    code: '700',
    severity: 'критично',
    what: 'Самозакрывающийся тег script: браузер не исполнит скрипт, игра не запустится.',
    break: (src) => src.replace(/<script([^>]*)><\/script>/, '<script$1 />'),
  },
{
    id: 'async-without-await',
    file: 'road-tycoon/src/sim.js',
    rule: 'обещание-без-обработки',
    code: '610',
    severity: 'важно',
    what: 'Промис создан без await и без catch: ошибка внутри потеряется, а вызывающий код продолжит работу, будто всё хорошо.',
    break: (src) => src.replace(/\n/, '\nconst lost = Promise.reject(new Error("x"));\n'),
  },
  {
    id: 'hardcoded-port',
    file: 'tools/p2p-server/server.mjs',
    rule: 'жёсткий-адрес',
    code: '801',
    severity: 'важно',
    what: 'Порт вшит числом: на хостинге порт выдаёт платформа, и сервер не поднимется.',
    break: (src) => src.replace(/const PORT = [^;]+;/, 'const PORT = 8080;'),
  },
  {
    id: 'missing-return',
    file: 'shared/p2p/torrentfile.js',
    rule: 'функция-ничего-не-возвращает',
    code: '601',
    severity: 'важно',
    what: 'Функция считает значение, но не возвращает его: вызывающий получает undefined и падает дальше по цепочке.',
    break: (src) => src.replace(/\n(\s+)return (P2P\.sha256Hex\(bytes\));/, '\n$1void ($2);'),
  },
  {
    id: 'broken-json',
    file: 'site/community-games.json',
    rule: 'json-разбор',
    code: '100',
    severity: 'критично',
    what: 'Висячая запятая — JSON не разбирается, каталог игр пустой.',
    break: (src) => src.replace(/\}\s*\]/, '},\n]'),
  },
  {
    id: 'dup-id',
    file: 'site/community-games.json',
    rule: 'дубль-id-данных',
    code: '102',
    severity: 'важно',
    what: 'Повторяющийся id: одна игра перетирает другую в списке.',
    break: (src) => {
      const m = src.match(/"id"\s*:\s*"([^"]+)"/);
      if (!m) return null;
      return src.replace(/"id"\s*:\s*"[^"]+"/, (x) => x) + `\n/* duplicate id ${m[1]} */\n`;
    },
  },
];

async function main() {
  await mkdir(outDir, { recursive: true });
  const cases = [];

  for (const sc of SCENARIOS) {
    let original;
    try {
      original = await readFile(join(ROOT, sc.file), 'utf8');
    } catch (e) {
      console.log('пропуск (нет файла):', sc.file);
      continue;
    }
    if (original.length > 200_000) original = original.slice(0, 200_000);

    let broken;
    try { broken = sc.break(original); } catch (e) { broken = null; }
    if (!broken || broken === original) {
      console.log('пропуск (порча не применилась):', sc.id);
      continue;
    }

    /* Проверка, что порча именно сломала файл, а не «переставила байты»:
       файл должен отличаться, но остаться того же порядка длины. Иначе
       дефект мог стереть весь файл, и чистый/битый станут несравнимы. */
    const delta = Math.abs(broken.length - original.length);
    if (delta > Math.max(400, original.length * 0.1)) {
      console.log('пропуск (порча изменила слишком много):', sc.id, 'delta', delta);
      continue;
    }

    // Чистый контроль: тот же файл без дефекта. Модель не должна «находить»
    // баг там, где его нет — иначе она просто всегда говорит «есть баг».
    for (const [variant, text, hasBug] of [['clean', original, false], ['broken', broken, true]]) {
      const name = `${sc.id}-${variant}.txt`;
      await writeFile(join(outDir, name), text, 'utf8');
      cases.push({
        id: `${sc.id}-${variant}`,
        scenario: sc.id,
        file: sc.file,
        name,
        hasBug,
        rule: hasBug ? sc.rule : null,
        code: hasBug ? sc.code : null,
        severity: hasBug ? sc.severity : null,
        what: hasBug ? sc.what : 'Дефекта нет — правильный ответ «чисто».',
        sha256: createHash('sha256').update(text).digest('hex'),
      });
    }
    console.log('сценарий готов:', sc.id);
  }

  if (!cases.length) {
    console.error('Ни один сценарий не собран.');
    process.exit(1);
  }

  const manifest = {
    schema: 'games-bug-bench-v1',
    madeAt: new Date().toISOString(),
    counts: {
      cases: cases.length,
      withBug: cases.filter((c) => c.hasBug).length,
      clean: cases.filter((c) => !c.hasBug).length,
    },
    howToScore: {
      metric: 'Точность = верно классифицированных / всего; полнота = найденных багов / всех багов; '
        + 'ложные тревоги = «баг» на чистом файле.',
      answerFormat: 'Ответ одним JSON: {"bug":true|false,"rule":"короткое-имя","severity":"критично|важно|мелочь"}',
    },
    cases,
  };
  await writeFile(join(outDir, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n', 'utf8');

  console.log('\nГотово');
  console.log('  случаев:', manifest.counts.cases,
    '· с багом:', manifest.counts.withBug,
    '· чистых:', manifest.counts.clean);
  console.log('  папка:', outDir);
}

await main();
