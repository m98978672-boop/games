// Локальный ПК-помощник RatMes Agent (нулевые внешние зависимости, Node.js 22).
// - Раздаёт веб-клиент / PWA (ratmes/index.html + src/**).
// - Хранит все чаты, медиа и Outbox в реальной папке RatMes-Vault/ на диске (NodeDiskVault).
// - Работает строго по протоколу ratcore-bridge/1: HTTP /api/tool + SSE /api/events + настоящий RFC 6455 WebSocket /ws.
// - Слушает 0.0.0.0 и принимает любые preview-хосты (совместимо с Arena Live Preview и локальным LAN).

import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

import { createNodeDiskVault } from '../engine/vault-store.mjs';
import { createRatMesEngine } from '../engine/ratmes-engine.mjs';
import { auditDirectory } from '../core/code-auditor.mjs';
import { createLiveBridgeManager } from './live-bridges.mjs';
import { createLanMesh } from './lan-mesh.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const RATMES_ROOT = path.resolve(__dirname, '..', '..');
const GAMES_ROOT = path.resolve(RATMES_ROOT, '..');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.wav': 'audio/wav',
  '.ogg': 'audio/ogg',
  '.webm': 'audio/webm',
  '.mp3': 'audio/mpeg',
  '.mp4': 'video/mp4',
  '.txt': 'text/plain; charset=utf-8',
  '.jsonl': 'application/x-ndjson; charset=utf-8',
};

// ---------------- Минимальный RFC 6455 WebSocket-фреймер (0 зависимостей) ----------------
function wsEncodeFrame(text, opcode = 0x1) {
  const payload = Buffer.from(text, 'utf8');
  const len = payload.length;
  let header;
  if (len < 126) {
    header = Buffer.alloc(2);
    header[0] = 0x80 | opcode;
    header[1] = len;
  } else if (len < 65536) {
    header = Buffer.alloc(4);
    header[0] = 0x80 | opcode;
    header[1] = 126;
    header.writeUInt16BE(len, 2);
  } else {
    header = Buffer.alloc(10);
    header[0] = 0x80 | opcode;
    header[1] = 127;
    header.writeBigUInt64BE(BigInt(len), 2);
  }
  return Buffer.concat([header, payload]);
}

function wsDecodeFrames(buffer) {
  const frames = [];
  let offset = 0;
  while (offset + 2 <= buffer.length) {
    const b0 = buffer[offset];
    const b1 = buffer[offset + 1];
    const opcode = b0 & 0x0f;
    const masked = (b1 & 0x80) !== 0;
    let payloadLen = b1 & 0x7f;
    let pos = offset + 2;

    if (payloadLen === 126) {
      if (pos + 2 > buffer.length) break;
      payloadLen = buffer.readUInt16BE(pos);
      pos += 2;
    } else if (payloadLen === 127) {
      if (pos + 8 > buffer.length) break;
      payloadLen = Number(buffer.readBigUInt64BE(pos));
      pos += 8;
    }

    const maskLen = masked ? 4 : 0;
    if (pos + maskLen + payloadLen > buffer.length) break;

    let payload = buffer.subarray(pos + maskLen, pos + maskLen + payloadLen);
    if (masked) {
      const mask = buffer.subarray(pos, pos + 4);
      const unmasked = Buffer.alloc(payloadLen);
      for (let i = 0; i < payloadLen; i += 1) {
        unmasked[i] = payload[i] ^ mask[i % 4];
      }
      payload = unmasked;
    }

    frames.push({ opcode, payload });
    offset = pos + maskLen + payloadLen;
  }
  return { frames, remaining: buffer.subarray(offset) };
}

function readJsonBody(req, limitBytes = 25 * 1024 * 1024) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let total = 0;
    req.on('data', (chunk) => {
      total += chunk.length;
      if (total > limitBytes) {
        reject(new Error('Body too large'));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on('end', () => {
      try {
        const raw = Buffer.concat(chunks).toString('utf8');
        resolve(raw ? JSON.parse(raw) : {});
      } catch {
        reject(new Error('Invalid JSON'));
      }
    });
    req.on('error', reject);
  });
}

function sendJson(res, statusCode, payload) {
  const body = JSON.stringify(payload);
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  });
  res.end(body);
}

export async function startRatMesAgent({
  port = Number(process.env.PORT || 8787),
  host = '0.0.0.0',
  vaultDir = process.env.RATMES_VAULT_DIR || path.join(RATMES_ROOT, 'RatMes-Vault'),
  seedDemoChats = true,
  country = 'RU',
  nodeId = null,
  nodeLabel = null,
  sharedMeshSecret = 'ratmes-lan-default-mesh-v1',
  enableUdpBeacon = false,
  serveGames = process.env.RATMES_SERVE_GAMES === '1',
} = {}) {
  const diskVault = await createNodeDiskVault(vaultDir);
  const engine = createRatMesEngine({ vault: diskVault, country, seedDemoChats });
  await engine.ensureStarterChats();

  const liveBridges = createLiveBridgeManager({ engine });
  const resolvedNodeId = nodeId || `node-${crypto.randomBytes(4).toString('hex')}`;
  const lanMesh = createLanMesh({
    nodeId: resolvedNodeId,
    label: nodeLabel || `RatMes (${resolvedNodeId})`,
    listenPort: port,
    engine,
    sharedMeshSecret,
    enableUdpBeacon,
  });
  engine.attachLanMesh(lanMesh);

  // Автоматический насос Outbox (каждые 4 сек пытается прокачать очередь, если не DEEP_SLEEP)
  const outboxPumpTimer = setInterval(async () => {
    try {
      const pending = engine.scheduler.pendingCounts().total;
      if (pending > 0) {
        await engine.tools.transfer.pumpOutbox({ maxPerTick: 4 });
      }
    } catch { /* ignore background pump error */ }
  }, 4000);
  if (outboxPumpTimer.unref) outboxPumpTimer.unref();

  const sseClients = new Set();
  const wsClients = new Set();

  function broadcastEvent(eventName, data) {
    const packet = JSON.stringify({
      protocol: 'ratcore-bridge/1',
      kind: 'event',
      event: eventName,
      tick: engine.core.clock.tick,
      stateHash: engine.getStateHash(),
      data,
      ts: Date.now(),
    });
    for (const res of sseClients) {
      try {
        res.write(`event: ratmes\ndata: ${packet}\n\n`);
      } catch {
        sseClients.delete(res);
      }
    }
    const wsFrame = wsEncodeFrame(packet);
    for (const socket of wsClients) {
      try {
        socket.write(wsFrame);
      } catch {
        wsClients.delete(socket);
      }
    }
  }

  engine.core.watch.subscribe((evt) => {
    broadcastEvent(evt.type, evt.payload);
  });

  async function executeToolRequest(body) {
    const actor = body.actorId && body.role
      ? engine.tools.asActor(body.actorId, body.role)
      : engine.tools;

    if (body.pipeline && Array.isArray(body.pipeline)) {
      const res = await actor.pipeline(body.pipeline);
      broadcastEvent('tool.pipeline', { ok: res.ok, steps: body.pipeline.length, traceId: res.traceId });
      return res;
    }

    if (body.tool === 'help') return actor.help(body.args?.group || null);
    if (body.tool === 'whoami') return actor.whoami();
    if (body.tool === 'trace') return actor.trace(body.args?.limit || 30);

    const res = await actor.call(body.tool, body.args || {});
    if (res.ok && body.tool && !body.tool.startsWith('diag.') && !body.tool.startsWith('vault.list') && !body.tool.startsWith('vault.read')) {
      broadcastEvent('tool.done', { tool: body.tool, traceId: res.traceId });
    }
    return res;
  }

  const server = http.createServer(async (req, res) => {
    const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
    const rawPathname = decodeURIComponent(url.pathname);
    // Поддерживаем работу RatMes как на корне (/api/*), так и встроенным в портал Games (/ratmes/api/*)
    const isRatMesPrefixed = rawPathname === '/ratmes' || rawPathname.startsWith('/ratmes/');
    const pathname = rawPathname.startsWith('/ratmes/api/')
      ? rawPathname.slice('/ratmes'.length)
      : rawPathname;

    if (req.method === 'OPTIONS') {
      res.writeHead(204, {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      });
      res.end();
      return;
    }

    // 1. Здоровье агента
    if (pathname === '/api/health' && req.method === 'GET') {
      const summary = (await engine.tools.diag.summary()).data;
      sendJson(res, 200, {
        ok: true,
        agent: 'RatMes Local PC Agent',
        protocol: 'ratcore-bridge/1',
        vaultDir: diskVault.rootDir,
        stateHash: summary.stateHash,
        country: summary.country,
        phase: summary.chrono.phase,
        bridgesRamMb: summary.bridgesRamMb,
        outboxPending: summary.outboxPending,
      });
      return;
    }

    // 2. Единый шлюз вызова инструментов RatMes.tools.*
    if (pathname === '/api/tool' && req.method === 'POST') {
      try {
        const body = await readJsonBody(req);
        const result = await executeToolRequest(body);
        sendJson(res, result.ok ? 200 : 400, result);
      } catch (err) {
        sendJson(res, 400, { ok: false, error: { code: 'RM-105', message: err.message } });
      }
      return;
    }

    // 3. Статический аудит TransferGuard (RM-107) исходного кода ratmes/
    if (pathname === '/api/audit/code' && (req.method === 'GET' || req.method === 'POST')) {
      const report = auditDirectory(RATMES_ROOT);
      sendJson(res, 200, { ok: true, tool: 'diag.auditGuards.static', data: report });
      return;
    }

    // 4. Прямое скачивание или inline-просмотр (аудио/фото) любого файла из RatMes-Vault/
    if ((pathname === '/api/vault/download' || pathname === '/api/vault/media') && req.method === 'GET') {
      const rel = url.searchParams.get('path') || '';
      const full = path.resolve(diskVault.rootDir, rel);
      if (!rel || !full.startsWith(diskVault.rootDir) || !fs.existsSync(full) || fs.statSync(full).isDirectory()) {
        sendJson(res, 404, { ok: false, error: { code: 'RM-202', message: 'Файл не найден в RatMes-Vault/' } });
        return;
      }
      const ext = path.extname(full).toLowerCase();
      const content = fs.readFileSync(full);
      const headers = {
        'Content-Type': MIME_TYPES[ext] || 'application/octet-stream',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'private, max-age=60',
      };
      if (pathname === '/api/vault/download') {
        headers['Content-Disposition'] = `attachment; filename="${path.basename(full)}"`;
      }
      res.writeHead(200, headers);
      res.end(content);
      return;
    }

    // 4b. Живые мосты (Telegram Bot API / Discord / Matrix / VK / Webhook)
    if (pathname === '/api/bridges' && req.method === 'GET') {
      sendJson(res, 200, { ok: true, data: { bridges: liveBridges.listStatuses() } });
      return;
    }
    if (pathname === '/api/bridges/configure' && req.method === 'POST') {
      try {
        const body = await readJsonBody(req);
        const result = await liveBridges.configureBridge(body);
        broadcastEvent('bridges.updated', { network: body.network });
        sendJson(res, result.ok ? 200 : 400, result);
      } catch (err) {
        sendJson(res, 400, { ok: false, error: { code: 'RM-105', message: err.message } });
      }
      return;
    }
    if (pathname === '/api/bridges/disable' && req.method === 'POST') {
      try {
        const body = await readJsonBody(req);
        const result = liveBridges.disableBridge(body.network);
        broadcastEvent('bridges.updated', { network: body.network });
        sendJson(res, 200, result);
      } catch (err) {
        sendJson(res, 400, { ok: false, error: { code: 'RM-105', message: err.message } });
      }
      return;
    }
    if (pathname.startsWith('/api/hooks/') && req.method === 'POST') {
      try {
        const net = pathname.slice('/api/hooks/'.length).split('/')[0];
        const body = await readJsonBody(req);
        const result = await liveBridges.ingestWebhook(net, body);
        sendJson(res, result.ok ? 200 : 400, result);
      } catch (err) {
        sendJson(res, 400, { ok: false, error: { code: 'RM-105', message: err.message } });
      }
      return;
    }

    // 4c. Прямой P2P / LAN Mesh между живыми узлами RatMes Agent (AES-256-GCM + HMAC)
    if (pathname === '/api/p2p/peers' && req.method === 'GET') {
      sendJson(res, 200, { ok: true, data: { nodeId: lanMesh.nodeId, label: lanMesh.label, peers: lanMesh.listPeers() } });
      return;
    }
    if (pathname === '/api/p2p/hello' && req.method === 'POST') {
      try {
        const body = await readJsonBody(req);
        sendJson(res, 200, lanMesh.handleIncomingHello(body));
      } catch (err) {
        sendJson(res, 400, { ok: false, error: { code: 'RM-105', message: err.message } });
      }
      return;
    }
    if (pathname === '/api/p2p/connect' && req.method === 'POST') {
      try {
        const body = await readJsonBody(req);
        const r = await lanMesh.handshakePeer(body.endpoint);
        broadcastEvent('p2p.peerConnected', { peerId: r.peer.peerId, label: r.peer.label });
        sendJson(res, 200, { ok: true, data: r });
      } catch (err) {
        sendJson(res, 400, { ok: false, error: { code: 'RM-303', message: err.message } });
      }
      return;
    }
    if (pathname === '/api/p2p/envelope' && req.method === 'POST') {
      try {
        const body = await readJsonBody(req);
        const r = await lanMesh.handleIncomingEnvelope(body);
        sendJson(res, r.ok ? 200 : 400, r);
      } catch (err) {
        sendJson(res, 400, { ok: false, error: { code: 'RM-602', message: err.message } });
      }
      return;
    }
    if (pathname === '/api/p2p/send' && req.method === 'POST') {
      try {
        const body = await readJsonBody(req);
        const r = await lanMesh.sendEncryptedToPeer(body);
        sendJson(res, 200, { ok: true, data: r });
      } catch (err) {
        sendJson(res, 400, { ok: false, error: { code: 'RM-303', message: err.message } });
      }
      return;
    }

    // 5. SSE поток событий в реальном времени
    if (pathname === '/api/events' && req.method === 'GET') {
      res.writeHead(200, {
        'Content-Type': 'text/event-stream; charset=utf-8',
        'Cache-Control': 'no-cache, no-transform',
        Connection: 'keep-alive',
        'Access-Control-Allow-Origin': '*',
      });
      res.write(`event: ratmes\ndata: ${JSON.stringify({ protocol: 'ratcore-bridge/1', kind: 'hello', stateHash: engine.getStateHash() })}\n\n`);
      sseClients.add(res);
      const pingTimer = setInterval(() => {
        try { res.write(': ping\n\n'); } catch { clearInterval(pingTimer); sseClients.delete(res); }
      }, 25000);
      req.on('close', () => {
        clearInterval(pingTimer);
        sseClients.delete(res);
      });
      return;
    }

    // 6. Статические файлы: либо единый портал Games + встроенный /ratmes/, либо автономный RatMes
    if (serveGames && rawPathname === '/ratmes') {
      res.writeHead(302, { Location: '/ratmes/' });
      res.end();
      return;
    }

    let staticRoot = RATMES_ROOT;
    let relStatic = rawPathname === '/' ? 'index.html' : rawPathname.replace(/^\/+/, '');
    if (serveGames) {
      if (isRatMesPrefixed) {
        staticRoot = RATMES_ROOT;
        const stripped = rawPathname.slice('/ratmes'.length);
        relStatic = (!stripped || stripped === '/') ? 'index.html' : stripped.replace(/^\/+/, '');
      } else {
        staticRoot = GAMES_ROOT;
        relStatic = rawPathname === '/' ? 'index.html' : rawPathname.replace(/^\/+/, '');
      }
    }

    let fullStatic = path.resolve(staticRoot, relStatic);
    if (fs.existsSync(fullStatic) && fs.statSync(fullStatic).isDirectory()) {
      fullStatic = path.join(fullStatic, 'index.html');
    }

    const forbiddenSegment = /(^|\/)(\.git|node_modules)(\/|$)/.test(relStatic);
    if (forbiddenSegment || !fullStatic.startsWith(staticRoot) || fullStatic.startsWith(diskVault.rootDir)) {
      res.writeHead(403);
      res.end('Forbidden');
      return;
    }
    if (fs.existsSync(fullStatic) && fs.statSync(fullStatic).isFile()) {
      const ext = path.extname(fullStatic).toLowerCase();
      res.writeHead(200, {
        'Content-Type': MIME_TYPES[ext] || 'application/octet-stream',
        'Cache-Control': ext === '.html' ? 'no-cache' : 'public, max-age=60',
        'Access-Control-Allow-Origin': '*',
      });
      fs.createReadStream(fullStatic).pipe(res);
      return;
    }

    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Not found');
  });

  // 7. Настоящий RFC 6455 WebSocket-шлюз /ws и /ratmes/ws (ratcore-bridge/1)
  server.on('upgrade', (req, socket) => {
    const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
    if (url.pathname !== '/ws' && url.pathname !== '/ratmes/ws') {
      socket.destroy();
      return;
    }
    const key = req.headers['sec-websocket-key'];
    if (!key) {
      socket.destroy();
      return;
    }
    const accept = crypto
      .createHash('sha1')
      .update(`${key}258EAFA5-E914-47DA-95CA-C5AB0DC85B11`)
      .digest('base64');

    socket.write([
      'HTTP/1.1 101 Switching Protocols',
      'Upgrade: websocket',
      'Connection: Upgrade',
      `Sec-WebSocket-Accept: ${accept}`,
      '',
      '',
    ].join('\r\n'));

    wsClients.add(socket);
    socket.write(wsEncodeFrame(JSON.stringify({
      protocol: 'ratcore-bridge/1',
      kind: 'hello',
      stateHash: engine.getStateHash(),
      ts: Date.now(),
    })));

    let leftover = Buffer.alloc(0);
    socket.on('data', async (chunk) => {
      leftover = Buffer.concat([leftover, chunk]);
      const { frames, remaining } = wsDecodeFrames(leftover);
      leftover = remaining;
      for (const frame of frames) {
        if (frame.opcode === 0x8) {
          wsClients.delete(socket);
          socket.end();
          return;
        }
        if (frame.opcode === 0x9) {
          socket.write(wsEncodeFrame(frame.payload.toString('utf8'), 0xA));
          continue;
        }
        if (frame.opcode === 0x1) {
          try {
            const msg = JSON.parse(frame.payload.toString('utf8'));
            const result = await executeToolRequest(msg);
            socket.write(wsEncodeFrame(JSON.stringify({
              protocol: 'ratcore-bridge/1',
              kind: 'response',
              reqId: msg.reqId || null,
              result,
            })));
          } catch (err) {
            socket.write(wsEncodeFrame(JSON.stringify({
              protocol: 'ratcore-bridge/1',
              kind: 'error',
              message: err.message,
            })));
          }
        }
      }
    });

    socket.on('close', () => wsClients.delete(socket));
    socket.on('error', () => wsClients.delete(socket));
  });

  await new Promise((resolve) => server.listen(port, host, resolve));
  const addr = server.address();
  const actualPort = typeof addr === 'object' && addr ? addr.port : port;

  return {
    server,
    engine,
    liveBridges,
    lanMesh,
    vaultDir: diskVault.rootDir,
    port: actualPort,
    host,
    async close() {
      clearInterval(outboxPumpTimer);
      liveBridges.closeAll();
      lanMesh.close();
      for (const res of sseClients) {
        try { res.end(); } catch { /* ignore */ }
      }
      sseClients.clear();
      for (const s of wsClients) {
        try { s.destroy(); } catch { /* ignore */ }
      }
      wsClients.clear();
      await new Promise((resolve) => server.close(resolve));
    },
  };
}

// CLI запуск: node src/agent/server.mjs
if (process.argv[1] && path.resolve(process.argv[1]) === __filename) {
  startRatMesAgent().then((agent) => {
    console.log(`[RatMes Agent] Запущен на http://${agent.host}:${agent.port}`);
    console.log(`[RatMes Agent] Хранилище RatMes-Vault/: ${agent.vaultDir}`);
    console.log('[RatMes Agent] Протокол: ratcore-bridge/1 (HTTP + SSE + WebSocket /ws)');
  }).catch((err) => {
    console.error('[RatMes Agent] Ошибка запуска:', err);
    process.exit(1);
  });
}
