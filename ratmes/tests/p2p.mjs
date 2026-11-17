// Интеграционный тест живой P2P LAN Mesh сети (2 настоящих процесса RatMes Agent с AES-256-GCM + HMAC)
// + живые внешние мосты (Webhook outbound & Telegram/VK/Discord inbound hooks) с защитой токена в SecretVault.
// Запуск: node tests/p2p.mjs

import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import http from 'node:http';

import { startRatMesAgent } from '../src/agent/server.mjs';

console.log('=== RatMes 2-Node Live E2EE P2P Mesh & Live Bridges Tests ===');

const vaultAlice = fs.mkdtempSync(path.join(os.tmpdir(), 'ratmes-alice-'));
const vaultBob = fs.mkdtempSync(path.join(os.tmpdir(), 'ratmes-bob-'));

const alice = await startRatMesAgent({
  port: 0,
  host: '127.0.0.1',
  vaultDir: vaultAlice,
  seedDemoChats: false,
  nodeId: 'node-alice',
  nodeLabel: 'ПК Алисы',
  sharedMeshSecret: 'shared-lan-test-secret-42',
});

const bob = await startRatMesAgent({
  port: 0,
  host: '127.0.0.1',
  vaultDir: vaultBob,
  seedDemoChats: false,
  nodeId: 'node-bob',
  nodeLabel: 'Ноутбук Боба',
  sharedMeshSecret: 'shared-lan-test-secret-42',
});

// Мини HTTP-приёмник для проверки настоящего исходящего живого webhook-моста
const receivedByHook = [];
const mockHookServer = http.createServer((req, res) => {
  const chunks = [];
  req.on('data', (c) => chunks.push(c));
  req.on('end', () => {
    receivedByHook.push({
      auth: req.headers.authorization || null,
      body: JSON.parse(Buffer.concat(chunks).toString('utf8')),
    });
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ ok: true }));
  });
});
await new Promise((r) => mockHookServer.listen(0, '127.0.0.1', r));
const hookPort = mockHookServer.address().port;

const aliceUrl = `http://127.0.0.1:${alice.port}`;
const bobUrl = `http://127.0.0.1:${bob.port}`;

try {
  // 1. Рукопожатие между двумя живыми узлами RatMes Agent (ratcore-bridge/1)
  const connRes = await (await fetch(`${aliceUrl}/api/p2p/connect`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ endpoint: bobUrl }),
  })).json();
  assert.equal(connRes.ok, true);
  assert.equal(connRes.data.peer.peerId, 'node-bob');
  console.log('  ✓ Два живых узла RatMes Agent успешно выполнили P2P handshake (ratcore-bridge/1)');

  // 2. Прямая AES-256-GCM + HMAC отправка от Алисы к Бобу
  const sendRes = await (await fetch(`${aliceUrl}/api/p2p/send`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      peerId: 'node-bob',
      chatId: 'lan-family',
      chatTitle: 'LAN · Дом',
      text: 'Секретный привет напрямую по домашнему Wi-Fi без интернета!',
    }),
  })).json();
  assert.equal(sendRes.ok, true);
  assert.equal(sendRes.data.encrypted, true);
  assert.equal(sendRes.data.alg, 'AES-256-GCM-RATCHET');

  // Проверяем, что у Боба сообщение физически расшифровано и легло в readable.txt на диске!
  const bobTxtPath = path.join(vaultBob, 'chats', 'ratmes', 'lan-family', 'readable.txt');
  assert.equal(fs.existsSync(bobTxtPath), true);
  assert.ok(fs.readFileSync(bobTxtPath, 'utf8').includes('Секретный привет напрямую по домашнему Wi-Fi'));
  console.log('  ✓ AES-256-GCM конверт доставлен от Алисы к Бобу и записан в RatMes-Vault/ Боба');

  // 3. Проверка защиты от поддельной HMAC-подписи (RM-602)
  const forgedRes = await (await fetch(`${bobUrl}/api/p2p/envelope`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fromNode: 'evil-node',
      chatId: 'lan-family',
      nonce: 'forged-1',
      signature: 'rm-sig-v1:00000000000000000000000000000000',
      cipherPacket: { alg: 'AES-256-GCM-RATCHET', epoch: 1, step: 1, ivB64: 'AAAAAAAAAAAAAAAA', ciphertextB64: 'AAAA' },
    }),
  })).json();
  assert.equal(forgedRes.ok, false);
  assert.equal(forgedRes.error.code, 'RM-602');
  console.log('  ✓ Поддельный P2P-пакет с неверной подписью отклонён с RM-602');

  // 4. Отправка через инструмент relay.lanSend поверх живого LAN Mesh!
  const lanPipe = await (await fetch(`${aliceUrl}/api/tool`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      pipeline: [
        { tool: 'pack.text', args: { chatId: 'lan-family', network: 'ratmes', text: 'Отправлено строго через tools.relay.lanSend!' } },
        { tool: 'pack.validate', args: { handleId: '$envelopeId', targetNetwork: 'ratmes' } },
        { tool: 'relay.lanSend', args: { peerId: 'node-bob', envelope: '$envelopeId' } },
      ],
    }),
  })).json();
  assert.equal(lanPipe.ok, true);
  assert.equal(lanPipe.data.results[2].data.transport, 'lan-p2p-live');
  assert.ok(fs.readFileSync(bobTxtPath, 'utf8').includes('tools.relay.lanSend!'));
  console.log('  ✓ Инструмент tools.relay.lanSend реально доставил E2EE-пакет второму агенту');

  // 5. Настройка живого внешнего webhook-моста с токеном в SecretVault + проверка что токен не утекает!
  const secretTok = 'LIVE_BRIDGE_SECRET_999888';
  const cfgRes = await (await fetch(`${aliceUrl}/api/bridges/configure`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      network: 'vk',
      kind: 'webhook',
      endpoint: `http://127.0.0.1:${hookPort}/deliver`,
      targetId: 'vk-peer-77',
      secretToken: secretTok,
      enabled: true,
    }),
  })).json();
  assert.equal(cfgRes.ok, true);
  assert.equal(JSON.stringify(cfgRes).includes(secretTok), false);

  const liveList = await (await fetch(`${aliceUrl}/api/bridges`)).json();
  assert.equal(JSON.stringify(liveList).includes(secretTok), false);

  // Отправляем сообщение через обычный конвейер — оно уходит реально на mockHookServer!
  const livePipe = await (await fetch(`${aliceUrl}/api/tool`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      pipeline: [
        { tool: 'pack.text', args: { chatId: 'vk-live-chat', network: 'vk', text: 'Живой мост работает!' } },
        { tool: 'pack.validate', args: { handleId: '$envelopeId', targetNetwork: 'vk' } },
        { tool: 'vault.append', args: { handleId: '$envelopeId' } },
        { tool: 'transfer.enqueue', args: { handleId: '$envelopeId' } },
        { tool: 'transfer.dispatch', args: { transferId: '$transferId' } },
      ],
    }),
  })).json();
  assert.equal(livePipe.ok, true);
  assert.equal(receivedByHook.length, 1);
  assert.equal(receivedByHook[0].auth, `Bearer ${secretTok}`);
  assert.equal(receivedByHook[0].body.text, 'Живой мост работает!');
  console.log('  ✓ Живой мост VK->Webhook доставил реальный HTTP POST, а токен остался закрыт в SecretVault');

  // 6. Приём входящих вебхуков Telegram и VK -> сразу в RatMes-Vault/ и BM25 индекс
  const tgHook = await (await fetch(`${aliceUrl}/api/hooks/telegram`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      update_id: 501,
      message: { message_id: 88, chat: { id: 12345, title: 'TG Live Room' }, from: { username: 'dmitry' }, text: 'Входящий хук из реального Telegram!' },
    }),
  })).json();
  assert.equal(tgHook.ok, true);
  const searchAfterHook = await (await fetch(`${aliceUrl}/api/tool`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tool: 'search.query', args: { q: 'net:telegram реального' } }),
  })).json();
  assert.equal(searchAfterHook.ok, true);
  assert.equal(searchAfterHook.data.totalMatches, 1);
  console.log('  ✓ Входящий webhook /api/hooks/telegram сохранён в Vault и мгновенно найден через BM25');

  console.log('\n✅ Все тесты P2P LAN Mesh и живых мостов пройдены!');
} finally {
  await alice.close();
  await bob.close();
  await new Promise((r) => mockHookServer.close(r));
  fs.rmSync(vaultAlice, { recursive: true, force: true });
  fs.rmSync(vaultBob, { recursive: true, force: true });
}
