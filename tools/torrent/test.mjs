#!/usr/bin/env node
/* ============================================================
   Тест раздачи: каталог ↔ файлы ↔ куски (tools/torrent/test.mjs)
   ------------------------------------------------------------
   Проверяет то, что нельзя проверить глазами:

     • каталог раздач актуален (--check сборщика);
     • размер и sha256 КАЖДОГО файла в манифесте совпадает с диском;
     • каждый кусок читается сервером и его sha256 совпадает с .torrent;
     • каждая игра собирается из кусков БИТ-В-БИТ (витрина + коллекция);
     • автоочистка на собранных файлах не удаляет ничего нужного
       и не портит бинарники (EXR/PNG/звук);
     • вредоносное по-прежнему блокируется (контрольный пример);
     • точка входа (index.html) есть после сборки всегда.

   Запуск: node tools/torrent/test.mjs
   ============================================================ */
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import path from 'node:path';

const require = createRequire(import.meta.url);
const repoRoot = path.resolve(path.dirname(new URL(import.meta.url).pathname), '../..');
const TOUR = require('../../shared/p2p/torrentfile.js');
const SAN = require('../../shared/p2p/sanitize.js');

let passed = 0;
function ok(cond, msg) {
  assert.ok(cond, msg);
  passed += 1;
  console.log('  ✓ ' + msg);
}

const catalog = JSON.parse(await readFile(path.join(repoRoot, 'site/torrent-catalog.json'), 'utf8'));
// Витрина games-data.js — обычный IIFE, читаем так же, как сборщик каталога.
function parseCatalog(source) {
  const box = {};
  const fn = new Function('window', 'globalThis', `${source}\nreturn window.GAMES_CATALOG;`);
  return fn(box, box) || [];
}
console.log(`\nРаздачи: ${catalog.games.length} игр, ${catalog.stats.files} файлов, ${catalog.stats.chunks} кусков\n`);

// ------------------------------------------------- 1. Манифест = диск
console.log('[манифест ↔ диск]');
// Каталог мог отстать от игр (кто-то поправил игру и не пересобрал раздачи).
// Молча падать здесь невежливо: сначала собираем список, печатаем его и
// ПРЕДЛАГАЕМ команду. Если каталог отстал — дальше проверять нечего.
let sizeMismatch = 0;
let hashMismatch = 0;
const staleExamples = [];
let staleCount = 0;
for (const game of catalog.games) {
  for (const file of game.files || []) {
    let bytes;
    try {
      bytes = await readFile(path.join(repoRoot, game.dir, file.path));
    } catch {
      staleCount += 1;
      if (staleExamples.length < 5) staleExamples.push(`${game.dir}/${file.path} — файла нет`);
      continue;
    }
    if (bytes.length !== file.size) {
      sizeMismatch += 1;
      staleCount += 1;
      if (staleExamples.length < 5) staleExamples.push(`${game.dir}/${file.path} — ${file.size} → ${bytes.length} Б`);
      continue;
    }
    const sha = crypto.createHash('sha256').update(bytes).digest('hex');
    if (sha !== file.sha256) {
      hashMismatch += 1;
      staleCount += 1;
      if (staleExamples.length < 5) staleExamples.push(`${game.dir}/${file.path} — содержимое изменилось`);
    }
  }
}
if (staleCount > 0) {
  console.error(`\n✗ Каталог раздач отстал от игр: ${staleCount} файл(ов) не совпадают.`);
  for (const line of staleExamples) console.error('   • ' + line);
  console.error('\n  Пересоберите раздачи:  node tools/torrent/build-catalog.mjs\n');
  process.exit(1);
}
ok(true, 'размер и sha256 каждого файла в манифесте совпадают с диском');

// ------------------------------------- 2. Куски читаются и совпадают
console.log('\n[куски]');
// Тот же алгоритм, что в сервере: файл кладём по смещению внутри куска.
function buildPiece(game, index) {
  const range = TOUR.pieceRange(game, index);
  if (range.size <= 0) return null;
  const buffer = Buffer.alloc(range.size);
  for (const file of TOUR.layoutOf(game)) {
    const fileEnd = file.offset + file.size;
    if (fileEnd <= range.from) continue;
    if (file.offset >= range.to) break;
    const source = require(`node:fs`).readFileSync(path.join(repoRoot, game.dir, file.path));
    const readFrom = Math.max(range.from, file.offset) - file.offset;
    const readTo = Math.min(range.to, fileEnd) - file.offset;
    if (readTo <= readFrom) continue;
    source.copy(buffer, Math.max(0, file.offset + readFrom - range.from), readFrom, readTo);
  }
  return buffer;
}

let piecesOk = 0;
let piecesTotal = 0;
for (const game of catalog.games) {
  const pieces = new Map();
  for (let i = 0; i < TOUR.pieceCountOf(game); i += 1) {
    const piece = buildPiece(game, i);
    pieces.set(i, piece);
    piecesTotal += 1;
    assert.equal(piece.length, TOUR.pieceRange(game, i).size, `${game.gameId}: кусок ${i} неполный`);
    piecesOk += 1;
  }
  // 3. Сборка бит-в-бит.
  const assembled = TOUR.assembleFromPieces(game, (i) => pieces.get(i));
  assert.ok(assembled.ok, `${game.gameId}: сборка не удалась (кусок ${assembled.missing})`);
  for (const file of assembled.files) {
    const original = await readFile(path.join(repoRoot, game.dir, file.path));
    assert.equal(
      crypto.createHash('sha256').update(file.bytes).digest('hex'),
      crypto.createHash('sha256').update(original).digest('hex'),
      `${game.gameId}/${file.path}: после сборки файл отличается`,
    );
  }
}
ok(piecesOk === piecesTotal, `все ${piecesTotal} кусков собраны и имеют ожидаемый размер`);
const storefrontCount = catalog.games.filter((g) => g.source !== 'collection').length;
const collectionCount = catalog.games.length - storefrontCount;
ok(true, `все ${catalog.games.length} игр собираются из кусков бит-в-бит ` +
  `(витрина ${storefrontCount} + коллекция ${collectionCount})`);

// ---------------------------------------- 4. Автоочистка не портит игру
console.log('\n[автоудаление плохих файлов]');
let removedNeeded = 0;
let playableMissing = 0;
for (const game of catalog.games) {
  const pieces = new Map();
  for (let i = 0; i < TOUR.pieceCountOf(game); i += 1) pieces.set(i, buildPiece(game, i));
  const assembled = TOUR.assembleFromPieces(game, (i) => pieces.get(i));
  const removed = [];
  for (const file of assembled.files) {
    const isText = /\.(js|mjs|cjs|json|html?|css|svg|txt|md|xml|csv)$/i.test(file.path);
    const text = isText ? Buffer.from(file.bytes).toString('utf8') : null;
    const verdict = SAN.judgeFile({ path: file.path, size: file.size, text });
    if (verdict.action === 'block') removed.push(`${file.path} (${verdict.rule})`);
  }
  if (removed.length) {
    removedNeeded += removed.length;
    console.error(`  ✗ ${game.gameId}: автоочистка удалила бы нужное: ${removed.join(', ')}`);
  }
  if (!SAN.assertPlayable(assembled.files).ok) playableMissing += 1;
}
ok(removedNeeded === 0, `ни один нужный игре файл не попадает под автоудаление (${catalog.games.length} игр)`);
ok(playableMissing === 0, 'у каждой игры после очистки остаётся точка входа index.html');

// ------------------- 4b. info_hash один и тот же и в каталоге, и в .torrent
// Иначе трекер и клиент видят ДВЕ разные раздачи: .torrent с сервера не
// совпадает с каталогом, magnet ведёт в пустоту, а пиры не находят друг друга.
console.log('\n[info_hash]');
let hashMismatchGames = 0;
for (const game of catalog.games) {
  const torrent = await TOUR.buildTorrent(game, {
    version: game.version,
    announce: ['/api/p2p'],
    webSeeds: [`/seed/${game.gameId}`],
    hasPiece: async (i) => crypto.createHash('sha256').update(buildPiece(game, i)).digest('hex'),
  });
  if (torrent.infoHash !== game.infoHash) {
    hashMismatchGames += 1;
    console.error(`  ✗ ${game.gameId}: .torrent ${torrent.infoHash.slice(0, 12)}… ≠ каталог ${game.infoHash.slice(0, 12)}…`);
  }
  assert.equal(torrent.info['piece length'], game.chunkSize, `${game.gameId}: размер куска в .torrent`);
  assert.equal(torrent.info['piece count'], game.chunkCount, `${game.gameId}: число кусков в .torrent`);
  assert.equal(torrent.pieces.length, game.chunkCount, `${game.gameId}: хешей кусков в .torrent`);
  // Хеш каждого куска в .torrent должен совпасть с реальными байтами с диска.
  for (let i = 0; i < game.chunkCount; i += 1) {
    assert.equal(torrent.pieces[i].sha256, torrent.info.pieces[i], `${game.gameId}: pieces[${i}] согласован`);
  }
}
ok(hashMismatchGames === 0, `info_hash в каталоге и в .torrent совпадает у всех ${catalog.games.length} игр`);

// Разные версии игры — разные раздачи (magnet не должен вести на старые куски).
const sample = catalog.games[0];
const v1 = await TOUR.buildTorrent({ ...sample, version: 'v1' }, { version: 'v1' });
const v2 = await TOUR.buildTorrent({ ...sample, version: 'v2' }, { version: 'v2' });
ok(v1.infoHash !== v2.infoHash, 'новая версия игры даёт новый info_hash');

// ------- 4c. Скачанное переходит в библиотеку, коллекция — только в торренте
// Правило владельца: в библиотеке Games появляется ТОЛЬКО то, что игрок
// скачал. Проверяем главное: пакет игры упаковывается в один HTML и
// принимается библиотекой (тот же путь, что и «Добавить свою игру»).
console.log('\n[импорт в библиотеку]');
const vmMod = await import('node:vm');
const browserBox = (() => {
  const store = new Map();
  const sandbox = {
    console,
    localStorage: {
      getItem: (k) => (store.has(k) ? store.get(k) : null),
      setItem: (k, v) => {
        if (v.length > 5 * 1024 * 1024) { const e = new Error('QuotaExceededError'); e.name = 'QuotaExceededError'; throw e; }
        store.set(k, v);
      },
      removeItem: (k) => store.delete(k),
    },
    location: { href: 'https://example.test/games/', origin: 'https://example.test', host: 'example.test', protocol: 'https:', search: '', pathname: '/games/' },
    navigator: { userAgent: 'node-test', onLine: true },
    setTimeout, clearTimeout,
    btoa: (s) => Buffer.from(s, 'binary').toString('base64'),
    atob: (s) => Buffer.from(s, 'base64').toString('binary'),
    TextDecoder, TextEncoder, URL, Blob: function () { this.size = 1; },
  };
  sandbox.window = sandbox; sandbox.globalThis = sandbox; sandbox.self = sandbox;
  vmMod.createContext(sandbox);
  for (const f of ['site/game-antivirus.js', 'site/user-games.js', 'shared/p2p/manifest.js', 'shared/p2p/fetch.js']) {
    vmMod.runInContext(require('node:fs').readFileSync(path.join(repoRoot, f), 'utf8'), sandbox, { filename: f });
  }
  return sandbox;
})();
const F2P = browserBox.GamesP2P;
ok(Boolean(F2P && F2P.packAsStandalone && browserBox.GamesUserHub), 'библиотека и упаковщик доступны в браузерном контексте');

const libGame = catalog.games.find((g) => g.source === 'collection' && g.totalSize > 3000) || catalog.games[0];
const libFiles = TOUR.layoutOf(libGame).map((f) => ({
  path: f.path,
  bytes: require('node:fs').readFileSync(path.join(repoRoot, libGame.dir, f.path)),
  size: f.size,
}));
const libPack = F2P.packAsStandalone({ files: libFiles });
ok(libPack && libPack.ok, `игра «${libGame.title}» упакована в один HTML (${Math.round((libPack?.html?.length || 0) / 1024)} КБ)`);

const libRecord = {
  id: `usr-torrent-${libGame.gameId}`.slice(0, 52),
  slug: libGame.gameId.slice(0, 48),
  sourceType: 'html',
  htmlCode: libPack.html,
  title: libGame.title,
  subtitle: 'Скачано из торрента',
  description: 'Скачано из P2P-раздачи «Торрент»',
  author: libGame.author || 'Открытая коллекция Games',
  version: 'v1', category: '2d', icon: '🧲',
  features: ['Скачано из торрента'],
};
const saved = browserBox.GamesUserHub.upsert(libRecord);
assert.ok(saved.ok, `игра принимается библиотекой Games: ${saved.error || ''}`);
ok(true, 'скачанное из торрента попадает в библиотеку Games');
ok(saved.game && saved.game.avSummary && saved.game.avSummary.verdict !== 'blocked', 'игра прошла 10 проходов антивируса библиотеки');
browserBox.GamesUserHub.upsert(libRecord);
ok(browserBox.GamesUserHub.getAll().length === 1, 'повторное скачивание не создаёт дубликат в библиотеке');

// Коллекция не должна попадать в витрину сама по себе.
const storefrontIds = new Set(parseCatalog(require('node:fs').readFileSync(path.join(repoRoot, 'site/games-data.js'), 'utf8')).map((g) => g.id));
const collectionInStorefront = catalog.games.filter((g) => g.source === 'collection' && storefrontIds.has(g.gameId));
ok(collectionInStorefront.length === 0, 'коллекция не просачивается в витрину — только в торрент');

// ------------------------------------------- 5. Вредоносное ловится
console.log('\n[контрольные образцы]');
const malware = [
  ['setup.exe', null, 'исполняемый .exe'],
  ['crack.apk', null, 'исполняемый .apk'],
  ['src/payload.js', 'new WebSocket("stratum+tcp://pool.evil.example:4444")', 'майнерный пул'],
  ['src/steal.js', 'const seed_phrase = readWallet();', 'похититель ключей'],
  ['index.html', '<meta http-equiv="refresh" content="0;url=https://evil.example">', 'мета-редирект'],
];
for (const [file, text, label] of malware) {
  const verdict = SAN.judgeFile({ path: file, size: text ? text.length : 1024, text });
  assert.ok(verdict.action !== 'allow', `${label}: должен быть заблокирован или почищен`);
}
ok(true, `все ${malware.length} контрольных образцов вредоносного не проходят как «чистые»`);

// Ложные срабатывания на игровом коде (проверено на bundle.js last-shore).
const falsePositives = [
  ['src/shaders/noise.js', 'float stratum = (float(i)+0.5)/float(SAMPLES);'],
  ['src/game.js', 'function update(dt){ player.x += dt * speed; }'],
  ['bundle.js', 'const ctx = canvas.getContext("webgl2"); shader(evalAllowed);'],
];
for (const [file, text] of falsePositives) {
  const verdict = SAN.judgeFile({ path: file, size: text.length, text });
  assert.equal(verdict.action, 'allow', `${file}: игровой код не должен блокироваться`);
}
ok(true, 'игровой код (шейдеры, цикл игры, бандл) не считается вредоносным');

// ------------- 5b. Каталог замечает изменения игры — но не документации
// Тест «мутационный»: портим каталог и смотрим, что --check это ловит.
// Иначе легко получить каталог, который «всегда свежий» и молча раздаёт старые
// файлы (куски не сойдутся с хешами, и скачивание сломается у игрока).
console.log('\n[свежесть каталога]');
const { execFileSync } = await import('node:child_process');
const fsPromises = await import('node:fs/promises');
const catalogPath = path.join(repoRoot, 'site/torrent-catalog.json');
const originalCatalog = await readFile(catalogPath, 'utf8');
const checkCatalog = () => {
  try {
    execFileSync(process.execPath, [path.join(repoRoot, 'tools/torrent/build-catalog.mjs'), '--check'], { cwd: repoRoot, stdio: 'pipe' });
    return true;
  } catch {
    return false;
  }
};

// а) файл игры «пропал» из каталога → каталог обязан стать устаревшим.
try {
  const targetGame = catalog.games.find((g) => (g.files || []).some((f) => /\.js$/i.test(f.path)));
  const targetFile = targetGame.files.find((f) => /\.js$/i.test(f.path));
  const injected = JSON.parse(originalCatalog);
  const injectedGame = injected.games.find((g) => g.gameId === targetGame.gameId);
  injectedGame.files = injectedGame.files.filter((f) => f.path !== targetFile.path);
  injectedGame.fileCount = injectedGame.files.length;
  await fsPromises.writeFile(catalogPath, JSON.stringify(injected, null, 2));
  const caught = checkCatalog() === false;
  ok(caught, 'изменение файлов игры делает каталог устаревшим (--check ловит)');

  // б) изменилась только документация → каталог остаётся свежим.
  const docPath = path.join(repoRoot, targetGame.dir, 'PLAN.md');
  const hadDoc = await fsPromises.readFile(docPath, 'utf8').then(() => true).catch(() => false);
  if (hadDoc) {
    const before = await fsPromises.readFile(docPath, 'utf8');
    try {
      await fsPromises.writeFile(docPath, before + '\n\n<!-- тест: документация не входит в раздачу -->\n');
      ok(checkCatalog(), 'правка PLAN.md не делает каталог устаревшим (документация вне раздачи)');
    } finally {
      await fsPromises.writeFile(docPath, before);
    }
  } else {
    ok(true, 'правка документации не делает каталог устаревшим (PLAN.md нет — пропущено)');
  }
} finally {
  // Всегда возвращаем каталог как было — тест не должен оставлять следов.
  await fsPromises.writeFile(catalogPath, originalCatalog);
}

// --------------------------------------- 6. Каталог свежий (--check)
console.log('\n[актуальность каталога]');
try {
  execFileSync(process.execPath, [path.join(repoRoot, 'tools/torrent/build-catalog.mjs'), '--check'], { cwd: repoRoot, stdio: 'pipe' });
  ok(true, 'каталог раздач актуален (node tools/torrent/build-catalog.mjs --check)');
} catch (err) {
  ok(false, 'каталог устарел — запустите node tools/torrent/build-catalog.mjs');
}

console.log(`\n✓ Раздача проверена: ${passed} проверок`);
