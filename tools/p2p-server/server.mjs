#!/usr/bin/env node
/* ============================================================
   Games P2P — СВОЙ СЕРВЕР (tools/p2p-server/server.mjs)
   ------------------------------------------------------------
   Один процесс, три роли, как у настоящего торрент-трекера:

     1. ТРЕКЕР      — кто в раздаче, у кого какие куски (bitmap),
                      журнал отклонённых файлов, статистика сети;
     2. СИГНАЛИНГ   — обмен offer/answer/ice между браузерами,
                      чтобы они соединились напрямую по WebRTC;
     3. РЕЗЕРВНЫЙ СИД — отдаёт ЛЮБОЙ диапазон байт игры
                      (`GET /seed/:gameId?from=…&to=…`) и готовые
                      чанки (`GET /chunk/:gameId/:index`). Поэтому
                      игра качается, даже если живых пиров нет.

   Плюс раздаёт сам сайт: `GET /` и `/torrent/` открывают портал,
   `/api/*` — API витрины. Так сервер можно запустить на своём
   компьютере или в контейнере, и вкладка «Торрент» работает
   полностью на своих ресурсах, без GitHub.

   Запуск:
     node tools/p2p-server/server.mjs                 # порт 8787
     PORT=9000 node tools/p2p-server/server.mjs
     node tools/p2p-server/server.mjs --print-config   # JSON для клиента

   Безопасность:
     • отдаются ТОЛЬКО файлы из каталога раздач (белый список путей);
     • никакого выхода за пределы папки игры (path traversal закрыт);
     • перебирать файлы репозитория через сервер нельзя.
   ============================================================ */
import crypto from 'node:crypto';
import fs from 'node:fs';
import fsp from 'node:fs/promises';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const P2P = require('../../shared/p2p/manifest.js');
const TOUR = require('../../shared/p2p/torrentfile.js');
const SAN = require('../../shared/p2p/sanitize.js');

const CATALOG_PATH = path.join(repoRoot, 'site/torrent-catalog.json');
const PORT = Number(process.env.PORT || process.argv.find((a) => /^--port=/.test(a))?.split('=')[1] || 8787);
const HOST = process.env.HOST || '0.0.0.0';
const MAX_BODY = 8 * 1024 * 1024;
const PEER_TTL_MS = 90 * 1000;

// ---------------------------------------------------------------- состояние
const state = {
  catalog: null,
  loadedAt: 0,
  torrents: new Map(), // gameId -> { torrent, manifest, chunks: Map }
  peers: new Map(), // peerId -> { peerId, gameId, role, bitmap, uploaded, downloaded, lastSeen }
  signals: [], // { id, gameId, from, to, kind, payload, at }
  nextSignalId: 1,
  rejections: [], // что автоочистка удалила у игроков
  startedAt: Date.now(),
  servedBytes: 0,
  servedChunks: 0,
};

// ------------------------------------------------------------- HTTP-помощники
function json(res, status, payload) {
  const body = JSON.stringify(payload);
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(body),
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'content-type, apikey, authorization, x-peer-id',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Cache-Control': 'no-store',
  });
  res.end(body);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const parts = [];
    req.on('data', (chunk) => {
      size += chunk.length;
      if (size > MAX_BODY) {
        reject(new Error('тело запроса слишком большое'));
        req.destroy();
        return;
      }
      parts.push(chunk);
    });
    req.on('end', () => {
      const raw = Buffer.concat(parts).toString('utf8');
      if (!raw) return resolve({});
      try {
        resolve(JSON.parse(raw));
      } catch (err) {
        reject(new Error('невалидный JSON: ' + err.message));
      }
    });
    req.on('error', reject);
  });
}

// ------------------------------------------------------------- каталог раздач
async function loadCatalog() {
  const raw = await fsp.readFile(CATALOG_PATH, 'utf8');
  const catalog = JSON.parse(raw);
  state.catalog = catalog;
  state.loadedAt = Date.now();
  state.torrents.clear();
  for (const game of catalog.games || []) state.torrents.set(game.gameId, { game, chunks: new Map() });
  return catalog;
}

async function ensureCatalog() {
  const stale = Date.now() - state.loadedAt > 5 * 60 * 1000;
  if (!state.catalog || stale) await loadCatalog();
  return state.catalog;
}

// Полный путь к файлу игры — только если он есть в манифесте раздачи.
function resolveGameFile(entry, relPath) {
  const clean = P2P.normalizePath(relPath);
  const known = (entry.game.files || []).find((f) => f.path === clean);
  if (!known) return null;
  const abs = path.resolve(repoRoot, entry.game.dir, clean);
  const inside = path.resolve(repoRoot, entry.game.dir);
  if (!abs.startsWith(inside + path.sep)) return null;
  return { abs, size: known.size, sha256: known.sha256 };
}

// Чанк «упакованного потока»: собирается из диапазонов файлов.
async function readPackedChunk(entry, index) {
  if (entry.chunks.has(index)) return entry.chunks.get(index);
  const { game } = entry;
  const { from, to, size } = TOUR.pieceRange(game, index);
  if (size <= 0) return null;
  const layout = TOUR.layoutOf(game);
  const buffer = Buffer.alloc(size);
  let filled = 0;
  for (const file of layout) {
    if (filled >= size) break;
    const fileEnd = file.offset + file.size;
    if (fileEnd <= from || file.offset >= to) continue;
    const resolved = resolveGameFile(entry, file.path);
    if (!resolved) continue;
    const readFrom = Math.max(from, file.offset) - file.offset;
    const readTo = Math.min(to, fileEnd) - file.offset;
    const length = readTo - readFrom;
    if (length <= 0) continue;
    const handle = await fsp.open(resolved.abs, 'r');
    try {
      const slice = Buffer.alloc(length);
      await handle.read(slice, 0, length, readFrom);
      buffer.set(slice, Math.max(0, file.offset + readFrom - from));
      filled += length;
    } finally {
      await handle.close();
    }
  }
  entry.chunks.set(index, buffer);
  return buffer;
}

// Быстрая проверка «каталог не отстал от игр». Нужна и серверу (чтобы не
// раздавать битые куски), и CI: молчаливое устаревание ломает скачивание.
async function catalogDrift(maxFiles) {
  const limit = Number(maxFiles) || 4000;
  const drift = [];
  let checked = 0;
  for (const game of state.catalog.games) {
    for (const file of game.files || []) {
      if (checked >= limit) return { ok: true, drift, checked, truncated: true };
      checked += 1;
      try {
        const stat = await fsp.stat(path.join(repoRoot, game.dir, file.path));
        if (stat.size !== file.size) drift.push({ gameId: game.gameId, path: file.path, expected: file.size, actual: stat.size });
      } catch {
        drift.push({ gameId: game.gameId, path: file.path, expected: file.size, actual: null });
      }
    }
  }
  return { ok: drift.length === 0, drift, checked, truncated: false };
}

async function buildTorrentFor(gameId) {
  const entry = state.torrents.get(gameId);
  if (!entry) return null;
  if (entry.torrent) return entry.torrent;
  const { game } = entry;
  const torrent = await TOUR.buildTorrent(game, {
    version: game.version,
    announce: [`/api/p2p`],
    webSeeds: [`/seed/${game.gameId}`],
    hasPiece: async (index) => {
      const chunk = await readPackedChunk(entry, index);
      return chunk ? crypto.createHash('sha256').update(chunk).digest('hex') : '0'.repeat(64);
    },
  });
  entry.torrent = torrent;
  return torrent;
}

// --------------------------------------------------------------- трекер
function prunePeers() {
  const cutoff = Date.now() - PEER_TTL_MS;
  for (const [id, peer] of state.peers) {
    if (peer.lastSeen < cutoff) state.peers.delete(id);
  }
  state.signals = state.signals.filter((s) => Date.now() - s.at < 60 * 1000);
}

function peersOf(gameId, exceptId) {
  return [...state.peers.values()]
    .filter((p) => p.gameId === gameId && p.peerId !== exceptId)
    .map((p) => ({
      peer_id: p.peerId,
      role: p.role,
      have_bitmap: p.bitmap,
      uploaded: p.uploaded,
      downloaded: p.downloaded,
    }));
}

function announce(peerId, payload) {
  const gameId = String(payload.gameId || '');
  if (!state.torrents.has(gameId)) return { error: 'неизвестная раздача', notFound: true };
  const bitmap = String(payload.haveBitmap || '');
  const role = payload.role === 'seeder' ? 'seeder' : 'leecher';
  // Валидация bitmap: только 0/1, не длиннее числа чанков раздачи.
  if (bitmap && !/^[01]+$/.test(bitmap)) return { error: 'битая карта кусков' };
  state.peers.set(peerId, {
    peerId,
    gameId,
    role,
    bitmap: bitmap.slice(0, TOUR.pieceCountOf(state.torrents.get(gameId).game)),
    uploaded: Math.max(0, Number(payload.uploaded) || 0),
    downloaded: Math.max(0, Number(payload.downloaded) || 0),
    lastSeen: Date.now(),
  });
  return { ok: true, peers: peersOf(gameId, peerId), now: Date.now() };
}

// ------------------------------------------------------------ автоочистка
// Сервер повторно проверяет файлы раздачи и запоминает, что удалено.
function auditGame(gameId) {
  const entry = state.torrents.get(gameId);
  if (!entry) return null;
  const { game } = entry;
  const blocked = [];
  for (const file of entry.game.files || []) {
    // Повторная проверка по имени: исполняемые и мусор не должны быть в раздаче.
    const verdict = SAN.judgeFile({ path: file.path, size: file.size, text: null });
    if (verdict.action === 'block') {
      blocked.push({ path: file.path, rule: verdict.rule, kind: verdict.kind, size: file.size });
    }
  }
  return { gameId, blocked, checked: (game.files || []).length, at: new Date().toISOString() };
}

// ------------------------------------------------- статика: белый список
// Статикой отдаём ТОЛЬКО сайт (site/), корень репозитория, игровые папки из
// каталога витрины и саму вкладку «Торрент». Всё остальное (исходники движка,
// tools/, .git, package.json, скрипты CI) наружу не выходит.
const STATIC_ROOTS = new Set(['site', 'torrent', 'shared', 'ratcore', 'news', 'ratmes', 'developers']);
const STATIC_FILES = new Set(['index.html', 'sw.js', 'robots.txt', 'sitemap.xml', 'opensearch.xml']);
const DENY_RE = /(^|\/)(\.git|\.github|tools|node_modules|\.arena)(\/|$)|\.(mjs|env|log|sql|pem|key)$|\.gitignore$|package(-lock)?\.json$/i;

function gameDirs() {
  const dirs = new Set();
  for (const entry of state.torrents.values()) {
    if (entry.game && entry.game.dir) dirs.add(entry.game.dir);
  }
  return dirs;
}

function staticAllowed(rel) {
  const clean = String(rel || '').replace(/^\/+/, '').replace(/\\/g, '/');
  if (!clean || clean.includes('..') || clean.startsWith('.') || path.isAbsolute(clean)) return false;
  if (DENY_RE.test(clean)) return false;
  const first = clean.split('/')[0];
  if (!clean.includes('/')) return STATIC_FILES.has(first);
  if (STATIC_ROOTS.has(first)) return true;
  return gameDirs().has(first);
}

// ---------------------------------------------------------------- роутинг
const MIME = {
  '.html': 'text/html; charset=utf-8', '.htm': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
  '.webp': 'image/webp', '.gif': 'image/gif', '.ico': 'image/x-icon',
  '.mp3': 'audio/mpeg', '.ogg': 'audio/ogg', '.wav': 'audio/wav', '.mp4': 'video/mp4',
  '.webm': 'video/webm', '.woff': 'font/woff', '.woff2': 'font/woff2', '.ttf': 'font/ttf',
  '.wasm': 'application/wasm', '.glb': 'model/gltf-binary', '.txt': 'text/plain; charset=utf-8',
  '.md': 'text/plain; charset=utf-8',
};

function sendFile(res, abs, opts) {
  const ext = path.extname(abs).toLowerCase();
  let stat;
  try {
    stat = fs.statSync(abs);
  } catch {
    json(res, 404, { error: 'файл не найден' });
    return;
  }
  const headers = {
    'Content-Type': MIME[ext] || 'application/octet-stream',
    'Access-Control-Allow-Origin': '*',
    'Cache-Control': 'no-cache',
    'Content-Length': stat.size,
  };
  if (opts && opts.download) {
    headers['Content-Disposition'] = `attachment; filename="${path.basename(abs).replace(/"/g, '')}"`;
  }
  res.writeHead(200, headers);
  fs.createReadStream(abs).pipe(res);
}

// ---------------------------------------------------------------- сервер
const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);

  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'content-type, apikey, authorization, x-peer-id',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Max-Age': '600',
    });
    res.end();
    return;
  }

  try {
    await ensureCatalog();

    // ---- API трекера/сигналинга -------------------------------------
    if (url.pathname === '/api/p2p' && req.method === 'POST') {
      const body = await readBody(req);
      const peerId = String(body.peerId || req.headers['x-peer-id'] || '').slice(0, 80);
      if (!/^[a-z0-9:_-]{3,80}$/i.test(peerId)) {
        json(res, 400, { error: 'плохой peerId' });
        return;
      }
      prunePeers();
      const action = String(body.action || '');

      if (action === 'announce') {
        const out = announce(peerId, body);
        return json(res, out.notFound ? 404 : 200, out);
      }
      if (action === 'stats') {
        const gameId = String(body.gameId || '');
        if (gameId && !state.torrents.has(gameId)) return json(res, 404, { error: 'неизвестная раздача' });
        const games = [...state.torrents.values()].map((entry) => {
          const peers = [...state.peers.values()].filter((p) => p.gameId === entry.game.gameId);
          return {
            gameId: entry.game.gameId,
            title: entry.game.title,
            peers: peers.length,
            seeders: peers.filter((p) => p.role === 'seeder').length,
          };
        });
        return json(res, 200, {
          ok: true,
          peers: state.peers.size,
          games: gameId ? games.filter((g) => g.gameId === gameId) : games,
          servedChunks: state.servedChunks,
          servedBytes: state.servedBytes,
          uptimeSec: Math.round((Date.now() - state.startedAt) / 1000),
        });
      }
      if (action === 'signal') {
        const gameId = String(body.gameId || '');
        const toPeer = String(body.toPeer || '').slice(0, 80);
        if (!state.torrents.has(gameId)) return json(res, 404, { error: 'неизвестная раздача' });
        if (toPeer === peerId) return json(res, 400, { error: 'сигнал самому себе' });
        state.signals.push({
          id: state.nextSignalId++,
          gameId,
          from: peerId,
          to: toPeer,
          kind: String(body.kind || '').slice(0, 12),
          payload: body.payload && typeof body.payload === 'object' ? body.payload : {},
          at: Date.now(),
        });
        // Хвост сигналов не копим.
        if (state.signals.length > 4000) state.signals.splice(0, state.signals.length - 4000);
        return json(res, 200, { ok: true });
      }
      if (action === 'poll') {
        const since = Math.max(0, Number(body.since) || 0);
        const gameId = String(body.gameId || '');
        const signals = state.signals
          .filter((s) => s.id > since && s.to === peerId && (!gameId || s.gameId === gameId))
          .map((s) => ({ id: s.id, game_id: s.gameId, from_peer: s.from, kind: s.kind, payload: s.payload }));
        return json(res, 200, { signals });
      }
      if (action === 'reject') {
        const gameId = String(body.gameId || '');
        const files = Array.isArray(body.files) ? body.files.slice(0, 200) : [];
        for (const file of files) {
          state.rejections.push({
            gameId,
            path: String(file.path || '').slice(0, 300),
            rule: String(file.rule || '').slice(0, 120),
            severity: file.severity === 'clean' ? 'clean' : 'block',
            sha256: String(file.sha256 || '').slice(0, 64),
            at: new Date().toISOString(),
          });
        }
        if (state.rejections.length > 5000) state.rejections.splice(0, state.rejections.length - 5000);
        return json(res, 200, { ok: true, stored: files.length });
      }
      if (action === 'fetchChunk') {
        // Резервный сид: клиент просит готовый кусок потока (base64).
        const gameId = String(body.gameId || '');
        const entry = state.torrents.get(gameId);
        if (!entry) return json(res, 404, { error: 'неизвестная раздача' });
        const index = Number(body.chunkIndex);
        const count = TOUR.pieceCountOf(entry.game);
        if (!Number.isInteger(index) || index < 0 || index >= count) {
          return json(res, 416, { error: 'нет такого куска' });
        }
        const chunk = await readPackedChunk(entry, index);
        if (!chunk) return json(res, 500, { error: 'кусок не читается' });
        state.servedChunks += 1;
        state.servedBytes += chunk.length;
        return json(res, 200, {
          ok: true,
          index,
          size: chunk.length,
          sha256: crypto.createHash('sha256').update(chunk).digest('hex'),
          chunk: { data: chunk.toString('base64') },
        });
      }
      if (action === 'leave') {
        state.peers.delete(peerId);
        return json(res, 200, { ok: true });
      }
      if (action === 'drift') {
        /* У отчёта два разных «ок»: запрос выполнен (HTTP 200) и каталог
           совпадает с диском. Раньше поле ok из отчёта перетирало флаг
           успешного запроса, и клиент не мог отличить «всё хорошо» от
           «каталог отстал, но сервер ответил». Теперь они раздельные. */
        const report = await catalogDrift(body.limit);
        return json(res, 200, {
          ok: true,
          catalogFresh: report.ok,
          drift: report.drift,
          checked: report.checked,
          truncated: report.truncated,
          hint: report.ok ? 'каталог актуален' : 'пересоберите: node tools/torrent/build-catalog.mjs',
        });
      }
      if (action === 'catalog') {
        return json(res, 200, { ok: true, catalog: state.catalog });
      }
      return json(res, 400, { error: 'неизвестное действие: ' + action });
    }

    // ---- чанки потока (резервный сид) -------------------------------
    const chunkMatch = url.pathname.match(/^\/chunk\/([a-z0-9-]+)\/(\d+)$/);
    if (chunkMatch && req.method === 'GET') {
      const entry = state.torrents.get(chunkMatch[1]);
      if (!entry) return json(res, 404, { error: 'неизвестная раздача' });
      const index = Number(chunkMatch[2]);
      if (!Number.isInteger(index) || index < 0 || index >= TOUR.pieceCountOf(entry.game)) {
        return json(res, 416, { error: 'нет такого куска' });
      }
      const chunk = await readPackedChunk(entry, index);
      if (!chunk) return json(res, 500, { error: 'кусок не читается' });
      state.servedChunks += 1;
      state.servedBytes += chunk.length;
      res.writeHead(200, {
        'Content-Type': 'application/octet-stream',
        'Content-Length': chunk.length,
        'Access-Control-Allow-Origin': '*',
        'X-Chunk-Index': String(index),
        'X-Chunk-Sha256': crypto.createHash('sha256').update(chunk).digest('hex'),
      });
      res.end(chunk);
      return;
    }

    // ---- диапазон байт игры (HTTP Range, как web-seed) -------------
    const seedMatch = url.pathname.match(/^\/seed\/([a-z0-9-]+)(?:\/(.*))?$/);
    if (seedMatch && req.method === 'GET') {
      const entry = state.torrents.get(seedMatch[1]);
      if (!entry) return json(res, 404, { error: 'неизвестная раздача' });
      let rel = seedMatch[2] || 'index.html';
      // Путь из URL декодируем и нормализуем ДО проверки белого списка:
      // «../../package.json» не должен превращаться в валидный путь.
      try { rel = decodeURIComponent(rel); } catch { /* уже декодирован */ }
      if (rel.includes('..') || rel.startsWith('/') || path.isAbsolute(rel)) {
        return json(res, 403, { error: 'выход за пределы папки раздачи запрещён' });
      }
      // Жёсткая проверка канонического пути: даже если что-то выше пропустим,
      // итоговый файл обязан лежать внутри папки игры и быть в манифесте.
      const gameDir = path.resolve(repoRoot, entry.game.dir);
      const candidate = path.resolve(gameDir, rel);
      if (!candidate.startsWith(gameDir + path.sep) || !(entry.game.files || []).some((f) => f.path === P2P.normalizePath(rel))) {
        return json(res, 403, { error: 'файл не входит в раздачу' });
      }
      const resolved = resolveGameFile(entry, rel);
      if (!resolved) return json(res, 404, { error: 'файл не входит в раздачу' });
      const range = req.headers.range;
      const ext = path.extname(resolved.abs).toLowerCase();
      if (range) {
        const m = /^bytes=(\d*)-(\d*)$/.exec(String(range));
        if (!m) return json(res, 416, { error: 'плохой Range' });
        let start = m[1] === '' ? null : Number(m[1]);
        let end = m[2] === '' ? null : Number(m[2]);
        if (start === null) start = Math.max(0, resolved.size - (end || 0));
        if (end === null || end >= resolved.size) end = resolved.size - 1;
        if (start > end || start >= resolved.size) return json(res, 416, { error: 'Range вне файла' });
        const length = end - start + 1;
        res.writeHead(206, {
          'Content-Type': MIME[ext] || 'application/octet-stream',
          'Content-Range': `bytes ${start}-${end}/${resolved.size}`,
          'Accept-Ranges': 'bytes',
          'Content-Length': length,
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Expose-Headers': 'content-range, x-chunk-sha256',
        });
        state.servedBytes += length;
        fs.createReadStream(resolved.abs, { start, end }).pipe(res);
        return;
      }
      res.writeHead(200, {
        'Content-Type': MIME[ext] || 'application/octet-stream',
        'Accept-Ranges': 'bytes',
        'Content-Length': resolved.size,
        'Access-Control-Allow-Origin': '*',
      });
      state.servedBytes += resolved.size;
      fs.createReadStream(resolved.abs).pipe(res);
      return;
    }

    // ---- .torrent, magnet, каталог ---------------------------------
    const torrentMatch = url.pathname.match(/^\/torrent\/([a-z0-9-]+)\.torrent$/);
    if (torrentMatch && req.method === 'GET') {
      const torrent = await buildTorrentFor(torrentMatch[1]);
      if (!torrent) return json(res, 404, { error: 'неизвестная раздача' });
      res.writeHead(200, {
        'Content-Type': 'application/json; charset=utf-8',
        'Content-Disposition': `attachment; filename="${torrent.gameId}.torrent"`,
        'Access-Control-Allow-Origin': '*',
      });
      res.end(`${JSON.stringify(torrent, null, 2)}\n`);
      return;
    }
    const magnetMatch = url.pathname.match(/^\/magnet\/([a-z0-9-]+)$/);
    if (magnetMatch && req.method === 'GET') {
      const torrent = await buildTorrentFor(magnetMatch[1]);
      if (!torrent) return json(res, 404, { error: 'неизвестная раздача' });
      return json(res, 200, { ok: true, gameId: torrent.gameId, infoHash: torrent.infoHash, magnet: TOUR.buildMagnet(torrent) });
    }
    if (url.pathname === '/api/torrent-catalog.json' || url.pathname === '/torrent-catalog.json') {
      return json(res, 200, await ensureCatalog());
    }
    if (url.pathname === '/api/audit' && req.method === 'POST') {
      const body = await readBody(req);
      const report = auditGame(String(body.gameId || ''));
      if (!report) return json(res, 404, { error: 'неизвестная раздача' });
      return json(res, 200, { ok: true, report });
    }
    if (url.pathname === '/api/health') {
      return json(res, 200, {
        ok: true,
        service: 'games-p2p',
        version: '1.0.0',
        games: state.catalog ? state.catalog.stats.games : 0,
        peers: state.peers.size,
        uptimeSec: Math.round((Date.now() - state.startedAt) / 1000),
      });
    }

    // ---- статика сайта (витрина, вкладка «Торрент», игры) -----------
    if (req.method === 'GET' || req.method === 'HEAD') {
      let rel = decodeURIComponent(url.pathname);
      if (rel === '/' || rel === '') rel = '/site/index.html';
      if (rel === '/torrent' || rel === '/torrent/') rel = '/torrent/index.html';
      if (rel.endsWith('/')) rel += 'index.html';
      // URL уже схлопнул «..» — поэтому проверяем НОРМАЛИЗОВАННЫЙ путь
      // по белому списку, а не только префикс корня репозитория.
      if (!staticAllowed(rel.replace(/^\/+/, ''))) {
        return json(res, 403, { error: 'этот путь не раздаётся' });
      }
      const abs = path.resolve(repoRoot, `.${rel}`);
      if (!abs.startsWith(repoRoot + path.sep)) return json(res, 403, { error: 'выход за пределы сайта' });
      if (fs.existsSync(abs) && fs.statSync(abs).isFile()) return sendFile(res, abs);
      // Витрина живёт в site/, но корневые ссылки ведут на ../games/ — проксируем.
      const alt = path.resolve(repoRoot, `site${rel}`);
      if (fs.existsSync(alt) && fs.statSync(alt).isFile()) return sendFile(res, alt);
      if (fs.existsSync(path.join(repoRoot, 'site/404.html'))) {
        return sendFile(res, path.join(repoRoot, 'site/404.html'));
      }
      json(res, 404, { error: 'не найдено' });
      return;
    }

    json(res, 405, { error: 'метод не поддерживается' });
  } catch (err) {
    json(res, 500, { error: String(err && err.message ? err.message : err) });
  }
});

function localAddresses() {
  const out = [];
  for (const [name, list] of Object.entries(os.networkInterfaces())) {
    for (const item of list || []) {
      if (item.family === 'IPv4' && !item.internal) out.push({ name, address: item.address });
    }
  }
  return out;
}

async function main() {
  const printConfig = process.argv.includes('--print-config');
  await loadCatalog();
  const stats = state.catalog.stats;
  if (printConfig) {
    process.stdout.write(`${JSON.stringify({
      endpoint: `http://localhost:${PORT}/api/p2p`,
      port: PORT,
      games: stats.games,
      pieces: stats.chunks,
      totalBytes: stats.totalBytes,
    }, null, 2)}\n`);
    return;
  }
  server.listen(PORT, HOST, () => {
    console.log('Games P2P сервер запущен');
    console.log(`  API трекера:    http://localhost:${PORT}/api/p2p`);
    console.log(`  Торрент-вкладка: http://localhost:${PORT}/torrent/`);
    console.log(`  Витрина:        http://localhost:${PORT}/`);
    console.log(`  Раздач: ${stats.games} · файлов ${stats.files} · кусков ${stats.chunks} · ${P2P.formatBytes(stats.totalBytes)}`);
    for (const addr of localAddresses()) console.log(`  В сети:         http://${addr.address}:${PORT}/`);
  });
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await main();
}

export { server, state, loadCatalog, readPackedChunk, buildTorrentFor, auditGame, resolveGameFile, staticAllowed };
