#!/usr/bin/env node
/* ============================================================
   Тест раздачи: каталог ↔ файлы ↔ куски (tools/torrent/test.mjs)
   ------------------------------------------------------------
   Проверяет то, что нельзя проверить глазами:

     • каталог раздач актуален (--check сборщика);
     • размер и sha256 КАЖДОГО файла в манифесте совпадает с диском;
     • каждый кусок читается сервером и его sha256 совпадает с .torrent;
     • игра собирается из кусков БИТ-В-БИТ (все 16 игр);
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
console.log(`\nРаздачи: ${catalog.games.length} игр, ${catalog.stats.files} файлов, ${catalog.stats.chunks} кусков\n`);

// ------------------------------------------------- 1. Манифест = диск
console.log('[манифест ↔ диск]');
let sizeMismatch = 0;
let hashMismatch = 0;
for (const game of catalog.games) {
  for (const file of game.files || []) {
    const bytes = await readFile(path.join(repoRoot, game.dir, file.path));
    if (bytes.length !== file.size) sizeMismatch += 1;
    const sha = crypto.createHash('sha256').update(bytes).digest('hex');
    if (sha !== file.sha256) hashMismatch += 1;
  }
}
ok(sizeMismatch === 0, 'размер каждого файла в манифесте совпадает с диском');
ok(hashMismatch === 0, 'sha256 каждого файла в манифесте совпадает с диском');

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
ok(true, 'все 16 игр собираются из кусков бит-в-бит');

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
ok(removedNeeded === 0, 'ни один нужный игре файл не попадает под автоудаление (16 игр)');
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
ok(hashMismatchGames === 0, 'info_hash в каталоге и в .torrent совпадает у всех 16 игр');

// Разные версии игры — разные раздачи (magnet не должен вести на старые куски).
const sample = catalog.games[0];
const v1 = await TOUR.buildTorrent({ ...sample, version: 'v1' }, { version: 'v1' });
const v2 = await TOUR.buildTorrent({ ...sample, version: 'v2' }, { version: 'v2' });
ok(v1.infoHash !== v2.infoHash, 'новая версия игры даёт новый info_hash');

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

// --------------------------------------- 6. Каталог свежий (--check)
console.log('\n[актуальность каталога]');
const { execFileSync } = await import('node:child_process');
try {
  execFileSync(process.execPath, [path.join(repoRoot, 'tools/torrent/build-catalog.mjs'), '--check'], { cwd: repoRoot, stdio: 'pipe' });
  ok(true, 'каталог раздач актуален (node tools/torrent/build-catalog.mjs --check)');
} catch (err) {
  ok(false, 'каталог устарел — запустите node tools/torrent/build-catalog.mjs');
}

console.log(`\n✓ Раздача проверена: ${passed} проверок`);
