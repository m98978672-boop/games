// Полный набор модульных и интеграционных тестов RatMes Engine + TransferGuard + Code Auditor.
// Запуск: node tests/engine.mjs

import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { createRatMesEngine } from '../src/engine/ratmes-engine.mjs';
import { auditDirectory, auditSource } from '../src/core/code-auditor.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const RATMES_ROOT = path.resolve(__dirname, '..');

let passed = 0;
async function test(name, fn) {
  try {
    await fn();
    passed += 1;
    console.log(`  ✓ ${name}`);
  } catch (err) {
    console.error(`  ✗ ${name}`);
    console.error(err);
    process.exitCode = 1;
  }
}

console.log('=== RatMes Engine & TransferGuard Tests ===');

await test('Все 15 веток RatMes.tools.* и 5 корневых методов соответствуют контракту', async () => {
  const engine = createRatMesEngine({ seed: 1001, country: 'RU', seedDemoChats: true });
  await engine.ensureStarterChats();

  const help = engine.tools.help();
  assert.equal(help.ok, true);
  assert.equal(Object.keys(help.data.ratMesGroups).length, 15);
  for (const g of ['pack', 'transfer', 'relay', 'gap', 'vault', 'crypto', 'route', 'connect', 'chrono', 'cache', 'presence', 'diag', 'search', 'workspace', 'cloud']) {
    assert.ok(engine.tools[g], `Ветка ${g} должна существовать`);
  }

  const who = engine.tools.whoami();
  assert.equal(who.ok, true);
  assert.equal(who.data.country, 'RU');

  // Проверяем 15-ю ветку tools.cloud.* (9 подключённых сервисов + дедупликация Supabase ingestRemote)
  const cloudSt = await engine.tools.cloud.status();
  assert.equal(cloudSt.ok, true);
  assert.equal(cloudSt.data.totalConnected, 9);
  assert.equal(cloudSt.data.supabase.projectRef, 'cuhfnzgytndyntpbnbda');
  assert.equal(cloudSt.data.gamesRooms.length, 3);

  const ing1 = await engine.tools.cloud.ingestRemote({
    messages: [
      { msg_id: 'sb-test-1', room_id: 'games-lobby', network: 'ratmes', sender_name: 'Игрок А', body_text: 'Проверка облачной синхронизации Games!' },
    ],
    onlinePeers: [{ peer_id: 'p1', display_name: 'Игрок А', room_id: 'games-lobby', status: 'online' }],
  });
  assert.equal(ing1.ok, true);
  assert.equal(ing1.data.ingested, 1);

  const ing2 = await engine.tools.cloud.ingestRemote({
    messages: [
      { msg_id: 'sb-test-1', room_id: 'games-lobby', network: 'ratmes', sender_name: 'Игрок А', body_text: 'Проверка облачной синхронизации Games!' },
    ],
  });
  assert.equal(ing2.ok, true);
  assert.equal(ing2.data.deduplicated, 1);

  const manifest = await engine.tools.cloud.exportManifest();
  assert.equal(manifest.ok, true);
  assert.equal(manifest.data.schema, 'ratmes-cloud-backup/1');
  assert.equal(manifest.data.targets.googleDriveFolderId, '1tQi82o2fHBMpBDq-0Zg5hSM4DkLOANxB');
});

await test('Файл из другого устройства: вложение из Supabase восстанавливается в Vault с рабочей ссылкой', async () => {
  const engine = createRatMesEngine({ seed: 1003, country: 'RU', seedDemoChats: false });
  const ing = await engine.tools.cloud.ingestRemote({
    messages: [
      {
        msg_id: 'sb-file-1',
        room_id: 'games-lobby',
        network: 'ratmes',
        sender_id: 'u-peer-file',
        sender_name: 'Игрок с телефона',
        body_text: '',
        kind: 'file',
        attachment: {
          filename: 'смета на ремонт.pdf',
          mimeType: 'application/pdf',
          sizeBytes: 48213,
          mediaKind: 'binary',
          sha256: 'a'.repeat(64),
          storagePath: 'games-lobby/abcdef0123456789_smeta-na-remont.pdf',
        },
      },
    ],
  });
  assert.equal(ing.ok, true);
  assert.equal(ing.data.ingested, 1);

  const page = await engine.tools.vault.readPage({ chatId: 'games-lobby', limit: 20 });
  assert.equal(page.ok, true);
  const withFile = page.data.messages.find((m) => m.msgId === 'sb-file-1');
  assert.ok(withFile, 'Сообщение с файлом должно попасть в Vault');
  assert.equal(withFile.attachment.filename, 'смета на ремонт.pdf');
  assert.ok(withFile.attachment.publicUrl.includes('/storage/v1/object/public/ratmes-media/games-lobby/'));
  assert.ok(withFile.attachment.storagePath.includes('_smeta-na-remont.pdf'));
  assert.deepEqual(withFile.text, '📎 смета на ремонт.pdf');

  // Поиск по вложениям находит облачный файл
  const q = await engine.tools.search.query({ q: 'has:file' });
  assert.equal(q.ok, true);
  assert.equal(q.data.totalMatches, 1);
  assert.equal(q.data.hits[0].msgId, 'sb-file-1');
});

await test('TransferGuard: 5 барьеров блокируют обход инструментов (RM-101, RM-103, RM-105, RM-106, RC-603)', async () => {
  const engine = createRatMesEngine({ seed: 1002, country: 'RU' });

  // Барьер 1: повторный захват полномочий запрещён (RC-105)
  assert.throws(() => engine.guard.claimAuthority(), (e) => e.rcError?.code === 'RC-105');

  // Барьер 2: поддельный (незапечатанный) конверт отклоняется (RM-105)
  const forged = await engine.tools.transfer.enqueue({
    envelope: { handleId: 'env-fake', chatId: 'c1', text: 'bypass!' },
  });
  assert.equal(forged.ok, false);
  assert.equal(forged.error.code, 'RM-105');

  // Барьер 3: запечатанный, но НЕ прошедший pack.validate отклоняется (RM-106)
  const packed = await engine.tools.pack.text({ chatId: 'c1', network: 'ratmes', text: 'Привет' });
  assert.equal(packed.ok, true);
  assert.equal(Object.isFrozen(packed.data.envelope), true);
  const unval = await engine.tools.transfer.enqueue({ envelope: packed.data.envelope });
  assert.equal(unval.ok, false);
  assert.equal(unval.error.code, 'RM-106');

  // Барьер 3b: прошедший validate, но НЕ сохранённый в vault.append отклоняется (RM-103)
  const val = await engine.tools.pack.validate({ envelope: packed.data.envelope, targetNetwork: 'ratmes' });
  assert.equal(val.ok, true);
  const noVault = await engine.tools.transfer.enqueue({ envelope: packed.data.envelope });
  assert.equal(noVault.ok, false);
  assert.equal(noVault.error.code, 'RM-103');

  // Барьер 4: SecretVault хранит токен внутри WeakMap и НЕ отдаёт его наружу
  const rawSecret = 'SUPER_SECRET_TOKEN_XYZ_999';
  const stored = await engine.tools.crypto.storeSession({ network: 'vk', secretToken: rawSecret });
  assert.equal(stored.ok, true);
  assert.equal(Object.isFrozen(stored.data.sessionHandle), true);
  assert.equal(JSON.stringify(stored).includes(rawSecret), false);

  // Барьер 5: плагин с ролью plugin не может вызывать crypto или transfer (RC-603)
  const pluginTools = engine.tools.asActor('ext-plugin', 'plugin');
  const denied = await pluginTools.crypto.rotateKeys({});
  assert.equal(denied.ok, false);
  assert.equal(denied.error.code, 'RC-603');
});

await test('Полный конвейер отправки (pipeline) + идемпотентность без дублей + честный бейдж MAX (RM-603)', async () => {
  const engine = createRatMesEngine({ seed: 1003, country: 'RU' });

  const pipe = await engine.tools.pipeline([
    { tool: 'pack.text', args: { chatId: 'max-1', network: 'max', text: 'Проверка MAX', idempotencyKey: 'idem-same-1' } },
    { tool: 'pack.validate', args: { handleId: '$envelopeId', targetNetwork: 'max' } },
    { tool: 'vault.append', args: { handleId: '$envelopeId' } },
    { tool: 'transfer.enqueue', args: { handleId: '$envelopeId' } },
    { tool: 'transfer.dispatch', args: { transferId: '$transferId' } },
  ]);
  assert.equal(pipe.ok, true);
  assert.equal(pipe.data.completedSteps, 5);
  assert.equal(pipe.data.results[1].data.warnings[0].code, 'RM-603');
  assert.equal(pipe.data.results[4].data.routeUsed, 'direct');

  // Повторный enqueue с тем же конвертом идемпотентен — не создаёт дубль!
  const dup = await engine.tools.transfer.enqueue({ handleId: pipe.data.vars.envelopeId });
  assert.equal(dup.ok, true);
  assert.equal(dup.data.deduplicated, true);
  assert.equal(dup.data.transferId, pipe.data.vars.transferId);
});

await test('Профиль стран RU -> RM-301 для WhatsApp без VPN -> привязка VPN -> доставка -> переключение на EU', async () => {
  const engine = createRatMesEngine({ seed: 1004, country: 'RU' });

  const pipe = await engine.tools.pipeline([
    { tool: 'pack.text', args: { chatId: 'wa-1', network: 'whatsapp', text: 'Тест WhatsApp в RU' } },
    { tool: 'pack.validate', args: { handleId: '$envelopeId', targetNetwork: 'whatsapp' } },
    { tool: 'vault.append', args: { handleId: '$envelopeId' } },
    { tool: 'transfer.enqueue', args: { handleId: '$envelopeId' } },
    { tool: 'transfer.dispatch', args: { transferId: '$transferId' }, continueOnError: true },
  ]);
  assert.equal(pipe.ok, true);
  assert.equal(pipe.data.results[4].ok, false);
  assert.equal(pipe.data.results[4].error.code, 'RM-301');

  // Сообщение уже безопасно лежит в Vault!
  const page = await engine.tools.vault.readPage({ chatId: 'wa-1' });
  assert.equal(page.data.messages.length, 1);

  // Привязываем VPN и повторяем отправку
  await engine.tools.route.bindProxy({ network: 'whatsapp', primaryRoute: 'vpn-eu-1', backupRoute: 'vpn-nl-2' });
  const retry = await engine.tools.transfer.dispatch({ transferId: pipe.data.vars.transferId });
  assert.equal(retry.ok, true);
  assert.equal(retry.data.routeUsed, 'vpn-eu-1');

  // Переключаемся на EU — WhatsApp идёт напрямую
  await engine.tools.route.setCountry({ countryCode: 'EU' });
  const explain = await engine.tools.route.explain({ network: 'whatsapp' });
  assert.equal(explain.data.activeRoute, 'direct');
});

await test('Шифрование AES-256-GCM Ratchet (sealEnvelope / openEnvelope) и отлов подделки (RM-602)', async () => {
  const engine = createRatMesEngine({ seed: 1005 });
  const k = await engine.tools.crypto.ensureChatKey({ chatId: 'secret-chat' });
  const p = await engine.tools.pack.text({ chatId: 'secret-chat', network: 'ratmes', text: 'Секретное сообщение 42' });
  const sealed = await engine.tools.crypto.sealEnvelope({ envelope: p.data.envelope, keyHandle: k.data.keyHandle });
  assert.equal(sealed.ok, true);
  assert.ok(sealed.data.cipherPacket.ciphertextB64);

  const opened = await engine.tools.crypto.openEnvelope({ cipherPacket: sealed.data.cipherPacket, keyHandle: k.data.keyHandle });
  assert.equal(opened.ok, true);
  assert.equal(opened.data.plaintext.text, 'Секретное сообщение 42');

  const tampered = await engine.tools.crypto.openEnvelope({
    cipherPacket: { ...sealed.data.cipherPacket, ciphertextB64: 'AAAA' + sealed.data.cipherPacket.ciphertextB64.slice(4) },
    keyHandle: k.data.keyHandle,
  });
  assert.equal(tampered.ok, false);
  assert.equal(tampered.error.code, 'RM-602');
});

await test('Чанковая передача файла + обрыв VPN (RM-302) + План Б + докачка с того же чанка', async () => {
  const engine = createRatMesEngine({ seed: 1006, country: 'RU' });
  const bytes = new Uint8Array(70 * 1024);
  for (let i = 0; i < bytes.length; i += 1) bytes[i] = i & 0xff;

  const p = await engine.tools.pack.media({
    chatId: 'tg-files',
    network: 'telegram',
    filename: 'archive.bin',
    bytes,
    chunkSize: 16384,
  });
  assert.equal(p.data.attachment.totalChunks, 5);

  await engine.tools.pack.validate({ envelope: p.data.envelope, targetNetwork: 'telegram' });
  await engine.tools.vault.append({ envelope: p.data.envelope });
  const stored = await engine.tools.vault.storeMedia({ attachmentHandle: p.data.attachment });
  assert.equal(stored.ok, true);
  const q = await engine.tools.transfer.enqueue({ envelope: p.data.envelope });

  const dropped = await engine.tools.transfer.streamChunk({
    transferId: q.data.transferId,
    attachmentHandle: p.data.attachment,
    simulateDropAtChunk: 2,
  });
  assert.equal(dropped.ok, false);
  assert.equal(dropped.error.code, 'RM-302');
  assert.equal(dropped.error.details.resumeFromChunk, 2);

  await engine.tools.transfer.reroute({ transferId: q.data.transferId, fallbackMode: 'backup-vpn' });
  const resumed = await engine.tools.transfer.resume({ transferId: q.data.transferId });
  assert.equal(resumed.ok, true);
  assert.equal(resumed.data.done, true);
  assert.equal(resumed.data.sentChunks, 5);
});

await test('3-фазный движок (Марков + Backpressure RM-501 + DAG-уборка + DEEP_SLEEP) и S3-FIFO', async () => {
  const engine = createRatMesEngine({ seed: 1007 });
  await engine.tools.chrono.recordPast({ kind: 'chat-switch', chatId: 'a' });
  await engine.tools.chrono.recordPast({ kind: 'chat-switch', chatId: 'b' });
  await engine.tools.chrono.recordPast({ kind: 'chat-switch', chatId: 'a' });
  await engine.tools.chrono.recordPast({ kind: 'chat-switch', chatId: 'b' });
  await engine.tools.chrono.recordPast({ kind: 'chat-switch', chatId: 'a' });

  const pred = await engine.tools.chrono.predictFuture({ currentChatId: 'a' });
  assert.equal(pred.data.candidates[0], 'b');

  // Backpressure при низкой батарее останавливает warmUp!
  await engine.tools.chrono.setBackpressure({ batteryPct: 14 });
  const blocked = await engine.tools.chrono.warmUp();
  assert.equal(blocked.data.skippedByBackpressure, true);
  assert.equal(blocked.data.code, 'RM-501');

  await engine.tools.chrono.setBackpressure({ batteryPct: 95 });
  const warmed = await engine.tools.chrono.warmUp();
  assert.equal(warmed.data.skippedByBackpressure, false);

  // DAG-уборка
  const hk = await engine.tools.chrono.runHousekeeping();
  assert.equal(hk.ok, true);
  assert.equal(hk.data.stepsRun.length, 6);

  // S3-FIFO: прогоняем 12 «однодневок» — они не должны вымыть HOT-чат
  await engine.tools.cache.admit({ key: 'hot-family', forceHot: true, bytes: 8192 });
  for (let i = 0; i < 12; i += 1) {
    await engine.tools.cache.admit({ key: `channel-scroll-${i}`, bytes: 4096 });
  }
  const st = await engine.tools.cache.budgetStatus();
  assert.ok(st.data.cache.stats.oneHitRejected >= 5);
});

await test('Gap Engine (дыра seq -> repair -> CRDT merge) и Let-it-crash изоляция моста', async () => {
  const engine = createRatMesEngine({ seed: 1008 });
  await engine.tools.transfer.receive({ chatId: 'g1', network: 'vk', text: 'msg 1', incomingSeq: 1 });
  const gCheck = await engine.tools.gap.check({ chatId: 'g1', incomingSeq: 4 });
  assert.equal(gCheck.data.contiguous, false);
  assert.deepEqual(gCheck.data.missingRange, { fromSeq: 2, toSeq: 3 });

  const rep = await engine.tools.gap.repair({ chatId: 'g1', network: 'vk', fromSeq: 2, toSeq: 3 });
  assert.equal(rep.data.recoveredCount, 2);

  const merged = await engine.tools.gap.merge({
    localOps: [{ msgId: 'm1', hlc: '100:0001', text: 'old', deleted: false }],
    remoteOps: [{ msgId: 'm1', hlc: '100:0002', text: 'edited', deleted: true }],
  });
  assert.equal(merged.data.merged[0].deleted, true);

  // Изолированный краш моста Discord (Let it crash)
  const sim = await engine.tools.diag.simulateOutage({ scenario: 'bridge-crash' });
  assert.equal(sim.data.passed, true);
  assert.equal(sim.data.messagesLost, 0);
});

await test('Статический аудитор TransferGuard (RM-107): 0 нарушений в ratmes/ и отлов обходов', async () => {
  const report = auditDirectory(RATMES_ROOT);
  assert.equal(report.clean, true, `Обнаружены нарушения RM-107: ${JSON.stringify(report.violations)}`);
  assert.ok(report.filesScanned >= 10);

  const badViolations = auditSource('src/web/bad-example.js', 'const r = fetch("https://evil.test"); const x = Math.random();');
  assert.ok(badViolations.length >= 2);
  assert.equal(badViolations[0].code, 'RM-107');
});

if (!process.exitCode) {
  console.log(`\n✅ Все ${passed} тестов RatMes Engine пройдены!`);
}
