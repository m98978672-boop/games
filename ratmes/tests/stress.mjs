// Стресс-тест и бенчмарк подсистем RatMes:
// 1. 1,000 сообщений + полнотекстовый BM25 поиск с фильтрами (net:, has:file, has:voice, pinned:, "точная фраза").
// 2. Планировщик приоритетов (urgent/high обгоняют bulk), AIMD окно перегрузки и Circuit Breaker (CLOSED -> OPEN -> HALF_OPEN -> CLOSED).
// 3. Голосовые WAV-заметки (проверка RIFF/WAVE заголовка и пиков волны) + безопасный Markdown-lite AST.
// 4. Папки, черновики, реакции, правки, CRDT tombstone удаление, экспорт Deflate Bundle и дедуплицированный импорт.
// Запуск: node tests/stress.mjs

import assert from 'node:assert/strict';

import { createRatMesEngine } from '../src/engine/ratmes-engine.mjs';
import { PriorityTransferScheduler } from '../src/engine/net-scheduler.mjs';
import { parseMarkdownLite, synthesizeDemoVoiceWav } from '../src/engine/media-pipeline.mjs';

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

console.log('=== RatMes Stress, Search BM25, Scheduler, Voice & Workspace Tests ===');

await test('Бенчмарк 1,000 сообщений + BM25 поиск с фильтрами (net:, has:voice, pinned:, "точная фраза")', async () => {
  const engine = createRatMesEngine({ seed: 7777, country: 'RU', seedDemoChats: false });
  const nets = ['ratmes', 'vk', 'max', 'telegram', 'discord'];
  const started = performance.now();

  for (let i = 0; i < 1000; i += 1) {
    const net = nets[i % nets.length];
    const special = i === 555 ? ' секретный алгоритм квантового резерва архива' : '';
    await engine.tools.transfer.receive({
      sourceChannel: 'stress',
      network: net,
      chatId: `chat-${net}`,
      chatTitle: `Чат ${net.toUpperCase()}`,
      senderName: i % 2 === 0 ? 'Алексей' : 'Мария',
      text: `Сообщение номер ${i} по проекту RatMes в сети ${net}${special}`,
    });
  }
  const ingestMs = performance.now() - started;

  // Проверяем голосовое сообщение WAV + закрепление
  const voicePipe = await engine.tools.pipeline([
    { tool: 'pack.voice', args: { chatId: 'chat-ratmes', network: 'ratmes', durationSec: 1.8 } },
    { tool: 'pack.validate', args: { handleId: '$envelopeId', targetNetwork: 'ratmes' } },
    { tool: 'vault.append', args: { handleId: '$envelopeId' } },
    { tool: 'vault.storeMedia', args: { handleId: '$attachmentId' } },
  ]);
  assert.equal(voicePipe.ok, true);
  const voiceMsgId = voicePipe.data.vars.msgId;
  await engine.tools.workspace.togglePin({ chatId: 'chat-ratmes', msgId: voiceMsgId });

  // BM25 точная фраза
  const q1 = await engine.tools.search.query({ q: '"квантового резерва"' });
  assert.equal(q1.ok, true);
  assert.equal(q1.data.totalMatches, 1);
  assert.ok(q1.data.durationMs < 80, `BM25 поиск должен быть быстрым (${q1.data.durationMs} мс)`);

  // Фильтр по сети + автору
  const q2 = await engine.tools.search.query({ q: 'net:telegram from:Мария номер' });
  assert.equal(q2.ok, true);
  assert.ok(q2.data.totalMatches > 50);
  assert.ok(q2.data.hits.every((h) => h.network === 'telegram'));

  // Фильтр по голосу + закреплённым
  const q3 = await engine.tools.search.query({ q: 'has:voice pinned:true' });
  assert.equal(q3.ok, true);
  assert.equal(q3.data.totalMatches, 1);
  assert.equal(q3.data.hits[0].msgId, voiceMsgId);

  console.log(`    [метрика] 1,000 сообщений: запись+индекс ${ingestMs.toFixed(1)} мс, BM25 поиск ${q1.data.durationMs} мс`);
});

await test('PriorityTransferScheduler: high/urgent обгоняют bulk + AIMD + Circuit Breaker (CLOSED->OPEN->HALF_OPEN->CLOSED)', async () => {
  const sched = new PriorityTransferScheduler({ randFn: () => 0.42 });

  // Ставим сначала большой файл (bulk), потом текст (high), потом ACK (urgent)
  sched.schedule({ transferId: 'file-bulk-1', network: 'telegram', priority: 'bulk' });
  sched.schedule({ transferId: 'msg-high-1', network: 'telegram', priority: 'high' });
  sched.schedule({ transferId: 'ack-urgent-1', network: 'telegram', priority: 'urgent' });

  assert.equal(sched.popReady().transferId, 'ack-urgent-1');
  assert.equal(sched.popReady().transferId, 'msg-high-1');
  assert.equal(sched.popReady().transferId, 'file-bulk-1');
  assert.ok(sched.telemetry.bulkPreemptedByHigh >= 2);

  // AIMD: рост окна на ACK и уменьшение вдвое на перегрузке
  const acq1 = sched.congestion.tryAcquire('telegram', 1);
  assert.equal(acq1.allowed, true);
  const afterAck = sched.congestion.onAck('telegram');
  assert.ok(afterAck.cwnd > 4);
  sched.congestion.tryAcquire('telegram', 1);
  const afterDrop = sched.congestion.onCongestion('telegram');
  assert.ok(afterDrop.cwnd < afterAck.cwnd);

  // Circuit Breaker: 3 отказа открывают контур -> после cooldown HALF_OPEN -> 2 успеха возвращают CLOSED
  const t0 = 100000;
  sched.breaker.recordFailure('telegram', 'vpn-1', 'RM-302', t0);
  sched.breaker.recordFailure('telegram', 'vpn-1', 'RM-302', t0 + 10);
  const tripped = sched.breaker.recordFailure('telegram', 'vpn-1', 'RM-302', t0 + 20);
  assert.equal(tripped.state, 'OPEN');
  assert.equal(sched.breaker.canPass('telegram', 'vpn-1', t0 + 500).allowed, false);

  const probe = sched.breaker.canPass('telegram', 'vpn-1', t0 + 20000);
  assert.equal(probe.allowed, true);
  assert.equal(probe.state, 'HALF_OPEN');
  sched.breaker.recordSuccess('telegram', 'vpn-1', 40);
  const closed = sched.breaker.recordSuccess('telegram', 'vpn-1', 38);
  assert.equal(closed.state, 'CLOSED');
});

await test('Синтезатор голосовых WAV (RIFF/WAVE PCM 16-bit) и безопасный Markdown-lite AST', async () => {
  const { wavBytes, durationSec, peaks } = synthesizeDemoVoiceWav({ durationSec: 1.5, sampleRate: 16000 });
  assert.equal(durationSec, 1.5);
  assert.equal(peaks.length, 32);
  const header = new TextDecoder().decode(wavBytes.subarray(0, 12));
  assert.ok(header.startsWith('RIFF') && header.endsWith('WAVE'));
  assert.equal(wavBytes.byteLength, 44 + 1.5 * 16000 * 2);

  const ast = parseMarkdownLite('Привет **мир** и `код` с https://example.com @alex #ratmes\n```js\nconst x = 1;\n```');
  assert.equal(ast.length, 2);
  assert.equal(ast[0].type, 'paragraph');
  assert.ok(ast[0].spans.some((s) => s.type === 'bold' && s.value === 'мир'));
  assert.ok(ast[0].spans.some((s) => s.type === 'code' && s.value === 'код'));
  assert.ok(ast[0].spans.some((s) => s.type === 'link' && s.href === 'https://example.com'));
  assert.ok(ast[0].spans.some((s) => s.type === 'mention' && s.value === '@alex'));
  assert.ok(ast[0].spans.some((s) => s.type === 'tag' && s.value === '#ratmes'));
  assert.equal(ast[1].type, 'codeblock');
  assert.equal(ast[1].lang, 'js');
});

await test('Workspace (папки, черновики, реакции, правка, tombstone удаление) + Deflate Bundle экспорт/импорт', async () => {
  const engineA = createRatMesEngine({ seed: 8888, country: 'RU', seedDemoChats: false });
  const p = await engineA.tools.pipeline([
    { tool: 'pack.text', args: { chatId: 'ws-1', network: 'ratmes', text: 'Черновая версия' } },
    { tool: 'pack.validate', args: { handleId: '$envelopeId', targetNetwork: 'ratmes' } },
    { tool: 'vault.append', args: { handleId: '$envelopeId' } },
    { tool: 'transfer.enqueue', args: { handleId: '$envelopeId' } },
    { tool: 'transfer.dispatch', args: { transferId: '$transferId' } },
  ]);
  const msgId = p.data.vars.msgId;

  // Папка + черновик + реакция + правка
  const fld = await engineA.tools.workspace.createFolder({ name: 'Семья', icon: '🏠', chatIds: ['ws-1'] });
  assert.equal(fld.ok, true);
  await engineA.tools.workspace.setDraft({ chatId: 'ws-1', text: 'Недописанный текст' });
  const draft = await engineA.tools.workspace.getDraft({ chatId: 'ws-1' });
  assert.equal(draft.data.text, 'Недописанный текст');

  const r1 = await engineA.tools.workspace.toggleReaction({ msgId, emoji: '🔥' });
  assert.equal(r1.data.added, true);
  const ed = await engineA.tools.workspace.editMessage({ chatId: 'ws-1', msgId, newText: 'Исправленная версия' });
  assert.equal(ed.data.editCount, 1);

  // Экспорт Deflate Bundle и импорт в чистый engineB с проверкой дедупликации
  const bnd = await engineA.tools.pack.bundle({ scope: 'vault' });
  assert.equal(bnd.ok, true);
  const exported = await engineA.tools.vault.exportReadable();

  const engineB = createRatMesEngine({ seed: 9999, country: 'RU', seedDemoChats: false });
  const imp1 = await engineB.tools.vault.importBundle({ files: exported.data.files });
  assert.equal(imp1.ok, true);
  assert.equal(imp1.data.importedMessages, 1);

  const imp2 = await engineB.tools.vault.importBundle({ files: exported.data.files });
  assert.equal(imp2.data.importedMessages, 0);
  assert.equal(imp2.data.deduplicated, 1);

  // Мягкое удаление (tombstone) убирает сообщение из поиска и блокирует повторное редактирование
  const del = await engineA.tools.workspace.deleteMessage({ chatId: 'ws-1', msgId });
  assert.equal(del.data.tombstone, true);
  const editAfterDel = await engineA.tools.workspace.editMessage({ chatId: 'ws-1', msgId, newText: 'Попытка' });
  assert.equal(editAfterDel.ok, false);
});

if (!process.exitCode) {
  console.log(`\n✅ Все ${passed} стресс-тестов и бенчмарков RatMes пройдены!`);
}
