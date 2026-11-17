// Интеграционный тест ПК-агента RatMes Agent: HTTP /api/tool + реальный RatMes-Vault/ на диске
// + лечение битого хвоста .jsonl (healTail) + настоящий RFC 6455 WebSocket /ws (ratcore-bridge/1).
// Запуск: node tests/server.mjs

import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import net from 'node:net';
import crypto from 'node:crypto';

import { startRatMesAgent } from '../src/agent/server.mjs';

function makeClientWsFrame(text) {
  const payload = Buffer.from(text, 'utf8');
  const mask = crypto.randomBytes(4);
  const masked = Buffer.alloc(payload.length);
  for (let i = 0; i < payload.length; i += 1) masked[i] = payload[i] ^ mask[i % 4];
  let header;
  if (payload.length < 126) {
    header = Buffer.from([0x81, 0x80 | payload.length]);
  } else {
    header = Buffer.alloc(4);
    header[0] = 0x81;
    header[1] = 0x80 | 126;
    header.writeUInt16BE(payload.length, 2);
  }
  return Buffer.concat([header, mask, masked]);
}

function testWebSocketRpc(port) {
  return new Promise((resolve, reject) => {
    const socket = net.createConnection({ host: '127.0.0.1', port }, () => {
      const key = crypto.randomBytes(16).toString('base64');
      socket.write([
        'GET /ws HTTP/1.1',
        `Host: 127.0.0.1:${port}`,
        'Upgrade: websocket',
        'Connection: Upgrade',
        `Sec-WebSocket-Key: ${key}`,
        'Sec-WebSocket-Version: 13',
        '',
        '',
      ].join('\r\n'));
    });

    let upgraded = false;
    let buf = Buffer.alloc(0);
    const messages = [];

    socket.on('data', (chunk) => {
      buf = Buffer.concat([buf, chunk]);
      if (!upgraded) {
        const idx = buf.indexOf('\r\n\r\n');
        if (idx === -1) return;
        const head = buf.subarray(0, idx).toString('utf8');
        if (!head.includes('101 Switching Protocols')) {
          socket.destroy();
          reject(new Error(`WS handshake failed: ${head}`));
          return;
        }
        upgraded = true;
        buf = buf.subarray(idx + 4);
        socket.write(makeClientWsFrame(JSON.stringify({ reqId: 'ws-test-1', tool: 'diag.summary' })));
      }

      while (buf.length >= 2) {
        let len = buf[1] & 0x7f;
        let offset = 2;
        if (len === 126) {
          if (buf.length < 4) break;
          len = buf.readUInt16BE(2);
          offset = 4;
        }
        if (buf.length < offset + len) break;
        const text = buf.subarray(offset, offset + len).toString('utf8');
        buf = buf.subarray(offset + len);
        messages.push(JSON.parse(text));
        const found = messages.find((m) => m.reqId === 'ws-test-1');
        if (found) {
          socket.end();
          resolve(found);
          return;
        }
      }
    });

    socket.on('error', reject);
    setTimeout(() => {
      socket.destroy();
      reject(new Error('WS timeout'));
    }, 5000);
  });
}

console.log('=== RatMes Local PC Agent & Disk Vault Integration Tests ===');

const tmpVault = fs.mkdtempSync(path.join(os.tmpdir(), 'ratmes-vault-test-'));
const agent = await startRatMesAgent({ port: 0, host: '127.0.0.1', vaultDir: tmpVault, seedDemoChats: true });
const baseUrl = `http://127.0.0.1:${agent.port}`;

try {
  // 1. Проверка раздачи HTML и /api/health
  const htmlRes = await fetch(`${baseUrl}/`);
  assert.equal(htmlRes.status, 200);
  assert.ok((await htmlRes.text()).includes('RatMes'));
  console.log('  ✓ Статический UI index.html отдаётся корректно');

  const health = await (await fetch(`${baseUrl}/api/health`)).json();
  assert.equal(health.ok, true);
  assert.equal(health.protocol, 'ratcore-bridge/1');
  assert.equal(health.country, 'RU');
  console.log('  ✓ /api/health подтверждает протокол ratcore-bridge/1 и профиль RU');

  // 2. Полный конвейер отправки через POST /api/tool -> реальные файлы на диске!
  const pipeRes = await (await fetch(`${baseUrl}/api/tool`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      pipeline: [
        { tool: 'pack.text', args: { chatId: 'disk-proof', network: 'ratmes', text: 'Живая запись в обычный .txt файл!' } },
        { tool: 'pack.validate', args: { handleId: '$envelopeId', targetNetwork: 'ratmes' } },
        { tool: 'vault.append', args: { handleId: '$envelopeId' } },
        { tool: 'transfer.enqueue', args: { handleId: '$envelopeId' } },
        { tool: 'transfer.dispatch', args: { transferId: '$transferId' } },
      ],
    }),
  })).json();
  assert.equal(pipeRes.ok, true);
  assert.equal(pipeRes.data.completedSteps, 5);

  const jsonlPath = path.join(tmpVault, 'chats', 'ratmes', 'disk-proof', 'messages.jsonl');
  const txtPath = path.join(tmpVault, 'chats', 'ratmes', 'disk-proof', 'readable.txt');
  assert.equal(fs.existsSync(jsonlPath), true);
  assert.equal(fs.existsSync(txtPath), true);
  assert.ok(fs.readFileSync(txtPath, 'utf8').includes('Живая запись в обычный .txt файл!'));
  console.log('  ✓ Сообщение физически записано в messages.jsonl и читаемый readable.txt на диске');

  // 3. Проверка скачивания plain-файла через /api/vault/download
  const dlRes = await fetch(`${baseUrl}/api/vault/download?path=${encodeURIComponent('chats/ratmes/disk-proof/readable.txt')}`);
  assert.equal(dlRes.status, 200);
  assert.ok((await dlRes.text()).includes('Живая запись в обычный .txt файл!'));
  console.log('  ✓ /api/vault/download отдаёт обычный текстовый файл из RatMes-Vault/');

  // 4. Имитируем внезапное выключение света: дописываем оборванный JSON-хвост и лечим через vault.healTail!
  fs.appendFileSync(jsonlPath, '{"msgId":"broken-power-loss","text":"оборв', 'utf8');
  const healRes = await (await fetch(`${baseUrl}/api/tool`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tool: 'vault.healTail', args: {} }),
  })).json();
  assert.equal(healRes.ok, true);
  assert.equal(healRes.data.tailsHealed, 1);
  assert.equal(healRes.data.noticeCode, 'RM-201');
  console.log('  ✓ vault.healTail (RM-201) автоматически вылечил оборванный хвост .jsonl без потери истории');

  // 5. Проверка статического аудита через /api/audit/code
  const auditRes = await (await fetch(`${baseUrl}/api/audit/code`, { method: 'POST' })).json();
  assert.equal(auditRes.ok, true);
  assert.equal(auditRes.data.clean, true);
  assert.equal(auditRes.data.violationsCount, 0);
  console.log(`  ✓ /api/audit/code подтвердил 0 нарушений RM-107 (${auditRes.data.filesScanned} файлов)`);

  // 6. Настоящий RFC 6455 WebSocket /ws
  const wsReply = await testWebSocketRpc(agent.port);
  assert.equal(wsReply.protocol, 'ratcore-bridge/1');
  assert.equal(wsReply.result.ok, true);
  assert.equal(wsReply.result.data.country, 'RU');
  console.log('  ✓ RFC 6455 WebSocket /ws (ratcore-bridge/1) принял запрос и вернул diag.summary');

  // 7. Проверка объединённого режима Games + вкладка «Общение» (/ + /ratmes/ + /ratmes/api/health)
  const tmpGamesVault = fs.mkdtempSync(path.join(os.tmpdir(), 'ratmes-games-portal-'));
  const portalAgent = await startRatMesAgent({
    port: 0,
    host: '127.0.0.1',
    vaultDir: tmpGamesVault,
    seedDemoChats: true,
    serveGames: true,
  });
  try {
    const portalBase = `http://127.0.0.1:${portalAgent.port}`;
    const gamesHtml = await (await fetch(`${portalBase}/`)).text();
    assert.ok(gamesHtml.includes('data-portal-tab="chat"'), 'Главная Games должна содержать вкладку «Общение»');
    assert.ok(gamesHtml.includes('ratmes/index.html?embed=games'), 'Главная Games должна встраивать RatMes');
    const rmHtml = await (await fetch(`${portalBase}/ratmes/`)).text();
    assert.ok(rmHtml.includes('Инспектор RatMes Engine'), '/ratmes/ должен отдавать RatMes UI');
    const rmHealth = await (await fetch(`${portalBase}/ratmes/api/health`)).json();
    assert.equal(rmHealth.ok, true);
    const cloudTool = await (await fetch(`${portalBase}/ratmes/api/tool`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tool: 'cloud.status', args: {} }),
    })).json();
    assert.equal(cloudTool.ok, true);
    assert.equal(cloudTool.data.totalConnected, 9);
    console.log('  ✓ Единый режим Games + /ratmes/ + /ratmes/api/* (9 подключённых облаков) работает');
  } finally {
    await portalAgent.close();
    fs.rmSync(tmpGamesVault, { recursive: true, force: true });
  }

  console.log('\n✅ Все интеграционные тесты RatMes Agent пройдены!');
} finally {
  await agent.close();
  fs.rmSync(tmpVault, { recursive: true, force: true });
}
