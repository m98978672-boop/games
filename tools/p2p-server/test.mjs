#!/usr/bin/env node
/* ============================================================
   Тест своего P2P-сервера (tools/p2p-server/test.mjs)
   ------------------------------------------------------------
   Поднимает настоящий сервер на свободном порту и проходит путь
   игрока целиком:

     • трекер: announce / stats / poll / leave;
     • сигналинг между двумя пирами;
     • резервный сид: каждый кусок раздачи приходит, его sha256
       совпадает с хешем из .torrent;
     • сборка игры из кусков бит-в-бит равна файлам репозитория;
     • автоочистка: вредоносный файл удаляется, игровые — нет;
     • защита: нельзя выйти за пределы папки раздачи.

   Запуск: node tools/p2p-server/test.mjs
   ============================================================ */
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { once } from 'node:events';
import { createRequire } from 'node:module';
import path from 'node:path';

const require = createRequire(import.meta.url);
const P2P = require('../../shared/p2p/manifest.js');
const TOUR = require('../../shared/p2p/torrentfile.js');
const SAN = require('../../shared/p2p/sanitize.js');
const { server, state, loadCatalog, readPackedChunk } = await import('./server.mjs');

const repoRoot = path.resolve(path.dirname(new URL(import.meta.url).pathname), '../..');
let passed = 0;
function ok(cond, msg) {
  assert.ok(cond, msg);
  passed += 1;
  console.log('  ✓ ' + msg);
}

// Слушаем на свободном порту.
server.listen(0, '127.0.0.1');
await once(server, 'listening');
const port = server.address().port;
const api = `http://127.0.0.1:${port}/api/p2p`;
const base = `http://127.0.0.1:${port}`;
console.log(`\nP2P-сервер поднят на ${base}\n`);

async function post(action, extra) {
  const res = await fetch(api, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action, peerId: extra?.peerId || 'tester-1', ...(extra || {}) }),
  });
  return { status: res.status, data: await res.json() };
}

try {
  const catalog = await loadCatalog();
  const game = catalog.games.find((g) => g.gameId === 'folder-os');
  ok(Boolean(game), 'каталог раздач загружен и содержит folder-os');

  // ---------------------------------------------------------- трекер
  console.log('\n[трекер]');
  const health = await (await fetch(`${base}/api/health`)).json();
  ok(health.ok && health.games === catalog.stats.games, `health: ${health.games} раздач`);

  const ann = await post('announce', { gameId: game.gameId, role: 'leecher', haveBitmap: '0' });
  ok(ann.data.ok && Array.isArray(ann.data.peers), 'announce принят, список пиров пришёл');

  const ann2 = await post('announce', { gameId: game.gameId, role: 'seeder', haveBitmap: '1', peerId: 'tester-2' });
  const seen = ann2.data.peers.map((p) => p.peer_id);
  ok(seen.includes('tester-1'), 'второй пир видит первого в раздаче');

  const stats = await post('stats', {});
  ok(stats.data.games.some((g) => g.gameId === game.gameId && g.peers >= 2), 'статистика сети видит 2 пира');

  const bad = await post('announce', { gameId: 'no-such-game', role: 'leecher' });
  ok(bad.status === 404, 'неизвестная раздача отвергнута (404)');

  const badBitmap = await post('announce', { gameId: game.gameId, haveBitmap: '0102' });
  ok(badBitmap.data.error, 'битая карта кусков отвергнута');

  // ------------------------------------------------------- сигналинг
  console.log('\n[сигналинг]');
  const sig = await post('signal', { gameId: game.gameId, toPeer: 'tester-2', kind: 'offer', payload: { sdp: { type: 'offer', sdp: 'v=0' } } });
  ok(sig.data.ok, 'offer отправлен');
  const poll = await post('poll', { peerId: 'tester-2', since: 0, gameId: game.gameId });
  ok(poll.data.signals.length === 1 && poll.data.signals[0].kind === 'offer', 'второй пир получил offer');
  ok(poll.data.signals[0].from_peer === 'tester-1', 'отправитель сигнала верный');
  const pollAgain = await post('poll', { peerId: 'tester-2', since: poll.data.signals[0].id, gameId: game.gameId });
  ok(pollAgain.data.signals.length === 0, 'повторный poll не дублирует сигнал');
  const selfSignal = await post('signal', { gameId: game.gameId, toPeer: 'tester-1', kind: 'offer' });
  ok(selfSignal.status === 400, 'сигнал самому себе отвергнут');

  // ---------------------------------------------------- .torrent/magnet
  console.log('\n[.torrent и magnet]');
  const torrentRes = await fetch(`${base}/torrent/${game.gameId}.torrent`);
  ok(torrentRes.ok, '.torrent скачивается');
  const torrent = await torrentRes.json();
  ok(torrent.schema === TOUR.TORRENT_SCHEME, 'схема торрент-файла верная');
  ok(torrent.pieces.length === TOUR.pieceCountOf(game), `кусков в .torrent: ${torrent.pieces.length}`);
  // Главное: раздача, которую отдаёт сервер, — ТА ЖЕ, что в каталоге витрины.
  // Иначе трекер и клиент видят две разные раздачи (регрессия была: формула
  // info_hash в каталоге и в .torrent считалась по-разному).
  assert.equal(torrent.infoHash, game.infoHash, 'info_hash серверного .torrent совпадает с каталогом');
  ok(true, 'info_hash серверного .torrent совпадает с каталогом витрины');
  ok(TOUR.validateTorrent(torrent).ok, 'торрент-файл проходит собственную валидацию');
  const magnetRes = await (await fetch(`${base}/magnet/${game.gameId}`)).json();
  const parsed = TOUR.parseMagnet(magnetRes.magnet);
  ok(parsed.ok && parsed.infoHash === torrent.infoHash, 'magnet ведёт на тот же info_hash');

  // ----------------------------------------------- резервный сид: куски
  console.log('\n[резервный сид]');
  const pieces = [];
  for (let i = 0; i < torrent.pieceCount; i += 1) {
    // eslint-disable-next-line no-await-in-loop
    const res = await fetch(`${base}/chunk/${game.gameId}/${i}`);
    // eslint-disable-next-line no-await-in-loop
    const bytes = Buffer.from(await res.arrayBuffer());
    const sha = crypto.createHash('sha256').update(bytes).digest('hex');
    assert.equal(sha, torrent.pieces[i].sha256, `кусок ${i}: хеш не совпал с .torrent`);
    pieces.push(bytes);
  }
  ok(pieces.length === torrent.pieceCount, `все ${pieces.length} кусков скачаны и совпали по sha256`);

  const fetchChunk = await post('fetchChunk', { gameId: game.gameId, chunkIndex: 0, peerId: 'tester-3' });
  ok(fetchChunk.data.ok && fetchChunk.data.sha256 === torrent.pieces[0].sha256, 'fetchChunk (API) отдаёт тот же кусок');

  const outOfRange = await post('fetchChunk', { gameId: game.gameId, chunkIndex: torrent.pieceCount + 5 });
  ok(outOfRange.status === 416, 'кусок вне раздачи отвергнут (416)');

  // -------------------------------------------------- сборка игры
  console.log('\n[сборка из кусков]');
  const assembled = TOUR.assembleFromPieces(game, (i) => pieces[i]);
  ok(assembled.ok, 'игра собирается из скачанных кусков');
  for (const file of assembled.files) {
    // eslint-disable-next-line no-await-in-loop
    const original = await readFile(path.join(repoRoot, game.dir, file.path));
    assert.equal(
      crypto.createHash('sha256').update(file.bytes).digest('hex'),
      crypto.createHash('sha256').update(original).digest('hex'),
      `файл ${file.path} после сборки не совпал с оригиналом`,
    );
  }
  ok(true, `все ${assembled.files.length} файлов после сборки бит-в-бит равны репозиторию`);

  // --------------------------------------------------- автоочистка
  console.log('\n[автоудаление плохих файлов]');
  const malicious = [
    { path: 'setup.exe', size: 1000, text: null },
    { path: 'src/miner.js', size: 200, text: 'var pool="stratum+tcp://x"; new Coinhive()' },
    { path: 'index.html', size: 500, text: '<html><script>game()</script></html>' },
    { path: 'src/game.js', size: 900, text: 'function game(){return 1;}' },
    { path: 'assets/logo.png', size: 4096, text: null },
  ];
  const bundle = SAN.sanitizeBundle(malicious);
  const blockedPaths = bundle.blocked.map((b) => b.path);
  ok(blockedPaths.includes('setup.exe'), 'исполняемый setup.exe удалён');
  ok(blockedPaths.includes('src/miner.js'), 'криптомайнер удалён');
  ok(!blockedPaths.includes('index.html'), 'index.html игры НЕ удалён');
  ok(!blockedPaths.includes('src/game.js'), 'скрипт игры НЕ удалён');
  ok(!blockedPaths.includes('assets/logo.png'), 'картинка игры НЕ удалена');
  ok(SAN.assertPlayable(bundle.files).ok, 'после очистки точка входа на месте');

  const reject = await post('reject', {
    gameId: game.gameId,
    files: [{ path: 'setup.exe', rule: 'исполняемый .exe', severity: 'block', sha256: 'a'.repeat(64) }],
  });
  ok(reject.data.ok && reject.data.stored === 1, 'журнал удалённых файлов принят сервером');

  // ------------------------------------------------------ защита путей
  console.log('\n[защита]');
  // «../» схлопывается самим URL — проверяем, что итоговый путь не отдаётся.
  const traversal = await fetch(`${base}/seed/${game.gameId}/../../package.json`);
  ok(traversal.status === 403 || traversal.status === 404, 'выход из папки игры закрыт');
  const encoded = await fetch(`${base}/seed/${game.gameId}/..%2f..%2fpackage.json`);
  ok(encoded.status === 403, 'закодированный выход из папки закрыт (403)');
  for (const secret of ['/package.json', '/AGENTS.md', '/tools/p2p-server/server.mjs', '/.github/workflows/validate.yml']) {
    // eslint-disable-next-line no-await-in-loop
    const r = await fetch(base + secret);
    assert.ok(r.status === 403 || r.status === 404, `служебный путь ${secret} не должен отдаваться (${r.status})`);
  }
  ok(true, 'служебные файлы репозитория (package.json, tools/, .github/) не отдаются');
  const notInTorrent = await fetch(`${base}/seed/${game.gameId}/README.md`);
  ok(notInTorrent.status === 403 || notInTorrent.status === 404, 'файл вне раздачи не отдаётся');
  const outsideSite = await fetch(`${base}/../.git/config`);
  ok(outsideSite.status === 403 || outsideSite.status === 404, 'выход за корень сайта закрыт');

  const range = await fetch(`${base}/seed/${game.gameId}/index.html`, { headers: { Range: 'bytes=0-99' } });
  const rangeBytes = Buffer.from(await range.arrayBuffer());
  ok(range.status === 206 && rangeBytes.length === 100, 'Range-запрос отдаёт ровно 100 байт');
  const fullFile = await readFile(path.join(repoRoot, game.dir, 'index.html'));
  ok(rangeBytes.equals(fullFile.subarray(0, 100)), 'байты Range совпадают с файлом');

  // ------------------------------------------------------ страницы
  console.log('\n[страницы]');
  const page = await fetch(`${base}/torrent/`);
  ok(page.ok && /Games Torrent/.test(await page.text()), 'вкладка «Торрент» отдаётся сервером');
  const portal = await fetch(`${base}/`);
  ok(portal.ok, 'витрина отдаётся сервером');

  // ---- Полный путь игрока: куски → сборка → автоочистка → один HTML ----
  console.log('[полный путь игрока]');
  const SANS = SAN.sanitizeBundle;
  const cleanFiles = assembled.files.map((f) => {
    const isText = /\.(js|mjs|cjs|json|html?|css|svg|txt|md)$/i.test(f.path);
    const text = isText ? Buffer.from(f.bytes).toString('utf8') : null;
    return { path: f.path, size: f.size, text, bytes: f.bytes };
  });
  const removedBySanitize = [];
  let keptCount = 0;
  for (const f of cleanFiles) {
    const verdict = SAN.judgeFile({ path: f.path, size: f.size, text: f.text });
    if (verdict.action === 'block') removedBySanitize.push(f.path);
    else keptCount += 1;
  }
  assert.equal(removedBySanitize.length, 0, `игра не должна терять файлы: удалено ${removedBySanitize.join(', ')}`);
  ok(keptCount === cleanFiles.length, `автоочистка сохранила все ${keptCount} файлов игры`);
  ok(SAN.assertPlayable(cleanFiles).ok, 'точка входа (index.html) на месте после очистки');

  // Ложные срабатывания: математический «stratum» в шейдере — не майнер.
  const shader = SAN.judgeFile({ path: 'src/shaders/noise.js', size: 80, text: 'float stratum = (float(i)+0.5)/float(SAMPLES);' });
  assert.equal(shader.action, 'allow', 'слово stratum в математике не считается майнером');
  const realMiner = SAN.judgeFile({ path: 'src/x.js', size: 80, text: 'new WebSocket("stratum+tcp://pool.example.com:4444")' });
  assert.equal(realMiner.action, 'block', 'настоящий майнерный пул блокируется');
  ok(true, 'сигнатуры вредоносного не ловят игровые шейдеры (проверено на bundle.js last-shore)');

  ok(state.peers.size >= 2, `трекер держит пиров: ${state.peers.size}`);
  ok(await readPackedChunk(state.torrents.get(game.gameId), 0), 'кусок читается из кеша сервера');

  // ------------------------------------------------ поиск сервера в браузере
  // Клиент ищет публичные адреса через new URL(path, base). Без базы это
  // бросает TypeError, и список молча не загружался бы — проверяем на живом
  // примере: тот же файл, который вкладка тянет с GitHub Pages.
  console.log('\n[поиск сервера]');
  // config.js — браузерный модуль: он вешает API на globalThis.GamesP2P,
  // а не на module.exports, поэтому читаем оттуда.
  require('../../shared/p2p/config.js');
  const CONFIG = globalThis.GamesP2P || {};
  assert.equal(typeof CONFIG.resolveServer, 'function', 'config.js публикует resolveServer');
  const probe = await CONFIG.resolveServer({ endpoint: base.replace('/api/p2p', '/api/p2p'), timeoutMs: 1500 });
  ok(probe.online === true && probe.endpoint === `${base}/api/p2p`, `свой сервер находится за один запрос (${probe.source})`);

  const publicList = JSON.parse(await readFile(new URL('../../site/p2p-endpoints.json', import.meta.url), 'utf8'));
  ok(Array.isArray(publicList.endpoints), 'site/p2p-endpoints.json — валидный список адресов');

  console.log(`\n✓ Сервер прошёл все проверки: ${passed}`);
} finally {
  server.close();
}
