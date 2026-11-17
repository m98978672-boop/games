// RatCore — Полная проверка Этапа 2 (v0.2): RCW2, FastCDC, XOR-FEC, CoreGovernor 75%, phys/nav/env/audio/hear, pack:ai-team, Cloud Sync
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  createEngine,
  crc32,
  encodeVarints,
  decodeVarints,
  encodeDeltaInt32,
  decodeDeltaInt32,
  rleCompress,
  rleDecompress,
  lzCompress,
  lzDecompress,
  encodeWire2Frame,
  decodeWire2Frame,
  fastCdcSplit,
  diffFastCdcChunks,
  xorFecParity,
  xorFecRecover,
  Wire2StreamWindow,
  RatCoreCloudSync,
} from '../ratcore.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const manifest = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'tools-manifest.json'), 'utf8'));

// 1. Базовые кодеки (CRC32, ZigZag/Varint, Delta, RLE, LZ + словарь ratcore-dict-v1)
assert.equal(crc32(new TextEncoder().encode('123456789')), 0xcbf43926, 'CRC32 IEEE 802.3 контрольный вектор обязан совпасть');

const sampleInts = new Int32Array([0, -1, 1, -128, 255, -10000, 987654]);
assert.deepEqual(decodeVarints(encodeVarints(sampleInts)), sampleInts);

const monotonic = new Int32Array([100, 102, 105, 107, 111, 115, 120, 121]);
const deltaPacked = encodeDeltaInt32(monotonic);
assert.ok(deltaPacked.length < monotonic.byteLength, 'Delta+Varint обязан сжимать плавные ряды');
assert.deepEqual(decodeDeltaInt32(deltaPacked), monotonic);

const repeated = new Uint8Array(200).fill(42);
const rle = rleCompress(repeated);
assert.ok(rle.length < 20);
assert.deepEqual(rleDecompress(rle), repeated);

const jsonSample = new TextEncoder().encode(JSON.stringify({
  schema: 'ratcore-save/1',
  entities: Array.from({ length: 20 }, (_, i) => ({ id: `ent_${i}`, x: i * 2, y: i, h: 1, yaw: 0, scale: 1, tag: 'object', meshId: 'mesh_1' })),
}));
const lz = lzCompress(jsonSample, { useDict: true });
assert.ok(lz.length < jsonSample.length * 0.45, `LZ+словарь обязан сжимать JSON более чем в 2 раза (${lz.length}/${jsonSample.length})`);
assert.deepEqual(lzDecompress(lz, { useDict: true }), jsonSample);

// 2. ratcore-wire/2: RCW2 + CRC32 защита + FastCDC дедупликация + XOR-FEC + AIMD окно <= 256 КБ
const wire = encodeWire2Frame(jsonSample, { seq: 7 });
assert.ok(wire.wireBytes < wire.rawBytes, 'RCW2 фрейм обязан быть меньше исходного JSON');
const decoded = decodeWire2Frame(wire.frame, { asJson: true });
assert.equal(decoded.seq, 7);
assert.equal(decoded.data.entities.length, 20);

// Повреждение 1 бита внутри фрейма обязано ловиться CRC32 (RC-704)
const corrupted = wire.frame.slice();
corrupted[corrupted.length - 1] ^= 0xff;
assert.throws(() => decodeWire2Frame(corrupted), (err) => err && err.code === 'RC-704');

// FastCDC: при повторной пересылке почти того же буфера дедупликация экономит > 50% трафика
const bigDoc = new Uint8Array(12000);
let s = 123456789;
for (let i = 0; i < bigDoc.length; i++) {
  s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
  bigDoc[i] = (s >>> 24) & 0xff;
}
const known = new Set();
const d1 = diffFastCdcChunks(fastCdcSplit(bigDoc), known);
assert.equal(d1.sentChunks, d1.totalChunks);
const bigDocEdited = bigDoc.slice();
bigDocEdited[bigDocEdited.length - 5] ^= 0xaa;
const d2 = diffFastCdcChunks(fastCdcSplit(bigDocEdited), known);
assert.ok(d2.dedupSavedPct >= 50, `FastCDC обязан экономить трафик при малой правке (получено ${d2.dedupSavedPct}%)`);

// XOR-FEC: восстановление 1 потерянного пакета без переповтора
const p0 = new Uint8Array([10, 20, 30, 40]);
const p1 = new Uint8Array([55, 66, 77, 88]);
const p2 = new Uint8Array([99, 11, 22, 33]);
const parity = xorFecParity([p0, p1, p2]);
const rec = xorFecRecover([p0, null, p2], parity, p1.length);
assert.equal(rec.index, 1);
assert.deepEqual(rec.packet, p1);

// Потоковое окно AIMD <= 256 КБ + resumeBitmap
const win = new Wire2StreamWindow();
assert.equal(win.canSend(16384), true);
win.onSend(0, 16384);
win.onAck(0, 16384);
assert.equal(win.buildResumeBitmap(8)[0], 1);
const beforeLoss = win.cwndBytes;
win.onLoss(4096);
assert.ok(win.cwndBytes < beforeLoss, 'AIMD должен снижать окно вдвое при потере');

// 3. CoreGovernor 75 % CPU, Power & Thermal Guard, Watchdog RC-906, Memory Leak Sentinel RC-907
const engMin = createEngine({ preset: 'minimal-2d', seed: 99, logicalCores: 8, manifest });
assert.equal(engMin.tools.stream.setPowerProfile({ mode: 'turbo' }).data.targetWorkers, 6, '75% от 8 ядер = ровно 6 воркеров');
assert.equal(engMin.tools.stream.setPowerProfile({ mode: 'eco' }).data.targetWorkers, 3, '40% от 8 ядер = 3 воркера');
assert.equal(engMin.tools.stream.setVisibilityHidden({ hidden: true }).data.effectiveWorkers, 0, 'Скрытая вкладка обязана усыплять все воркеры (0)');
engMin.tools.stream.setVisibilityHidden({ hidden: false });
engMin.tools.stream.setPowerProfile({ mode: 'turbo' });

// Изоляция падающей подсистемы (Self-Healing Watchdog RC-906)
let p0Ran = false;
engMin.tools.stream.governorEnqueue({ priority: 0, name: 'critical_tick', fn: () => { p0Ran = true; } });
engMin.tools.stream.governorEnqueue({ priority: 2, name: 'broken_mod', fn: () => { throw new Error('boom'); } });
const frameRes = engMin.tools.stream.governorTick({ simulatedFrameMs: 18.0 }); // > 92% от 16.6 мс -> троттлинг + Dynamic Resolution
assert.equal(p0Ran, true);
assert.ok(frameRes.data.throttleLevel >= 1);
assert.ok(frameRes.data.dynResScale < 1.0, 'Dynamic Resolution должен плавно снизить масштаб при лаге');
assert.ok(engMin.tools.stream.governorStats().data.isolatedSubsystems.includes('broken_mod'));

// Memory Leak Sentinel (RC-907)
let leakWarn = null;
for (let i = 1; i <= 7; i++) {
  const r = engMin.tools.stream.sampleMemory({ usedBytes: i * 10000 });
  if (r.data.warning) leakWarn = r.data.warning;
}
assert.ok(leakWarn && leakWarn.code === 'RC-907', 'Memory Leak Sentinel обязан поймать непрерывный рост памяти');

// Zero-Cost Opt-In: в minimal-2d модули phys/nav/env/audio/hear и pack:ai-team возвращают RC-108
assert.equal(engMin.tools.phys.step().error.code, 'RC-108');
assert.equal(engMin.tools.think.start({ topic: 'x' }).error.code, 'RC-108');

// 4. Включаем модули phys, nav, env, audio, hear и пакет pack:ai-team
const eng = createEngine({
  preset: 'survival',
  packs: ['pack:ai-team'],
  seed: 555,
  manifest,
});

// 4a. Физика: падение тела на рельеф + коллизия + CCD raycast
const crate = eng.tools.build.primitive({ shape: 'box', w: 1, h: 1, d: 1 });
eng.tools.build.placeEntity({ id: 'crate_1', mesh: crate.data, x: 0, y: 0, h: 6, allowWater: true });
eng.tools.phys.addBody({ id: 'crate_1', x: 0, y: 0, h: 6, radius: 0.5, restitution: 0.3 });
for (let i = 0; i < 60; i++) eng.tools.phys.step({ dt: 1 / 30 });
const bodyAfter = eng.tools.phys.getBody({ id: 'crate_1' }).data;
assert.ok(bodyAfter.grounded && bodyAfter.h < 2.0, 'Физика обязана уронить тело на землю HeightField');
const physHit = eng.tools.phys.raycast({ origin: [-5, 0, bodyAfter.h], dir: [1, 0, 0], maxDist: 20 });
assert.equal(physHit.data.id, 'crate_1');

// 4b. Навигация: сеточный A* + RVO уклонение
const navRes = eng.tools.nav.findPath({ from: [-4, -4], to: [4, 4], step: 1 });
assert.equal(navRes.ok, true);
assert.equal(navRes.data.found, true);
assert.ok(navRes.data.path.length >= 2);
const rvo = eng.tools.nav.rvoStep({ x: 0, y: 0, goalX: 5, goalY: 0, neighbors: [{ x: 0.8, y: 0.1, radius: 0.6 }] });
assert.ok(rvo.data.speed > 0);

// 4c. Среда: день/ночь, погода, температура по высоте
const noon = eng.tools.env.setTime({ hours: 12 }).data;
assert.equal(noon.phase, 'day');
const night = eng.tools.env.setTime({ hours: 2 }).data;
assert.equal(night.phase, 'night');
eng.tools.env.setWeather({ kind: 'snow', intensity: 0.8, windSpeedMs: 12 });
const mountainTemp = eng.tools.env.sampleTemp({ h: 2000 }).data.tempC;
const valleyTemp = eng.tools.env.sampleTemp({ h: 0 }).data.tempC;
assert.ok(mountainTemp < valleyTemp - 10, 'На высоте 2000 м должно быть холоднее на ~13°C');

// 4d. Процедурный звук (0 КБ ассетов) + 3D-слух ИИ (hear.listen)
const shotPcm = eng.tools.audio.synthesize({ preset: 'shot' }).data;
assert.ok(shotPcm.samples > 1000 && shotPcm.rms > 0.05);
eng.tools.audio.emit({ kind: 'shot', x: 8, y: 0, h: 1, loudnessDb: 95, sourceId: 'guard' });
const heard = eng.tools.hear.listen({ x: 0, y: 0, h: 1.5, thresholdDb: 30 }).data;
assert.equal(heard.length, 1);
assert.equal(heard[0].kind, 'shot');
assert.ok(Math.abs(heard[0].azimuthDeg - 90) < 1, 'Звук на востоке (+X) должен слышаться под азимутом ~90°');

// 4e. Пакет pack:ai-team: think, guess (Байес), comm (CRDT), bugs (ddmin), bridge (Three.js + Godot .tscn + RCW2)
const th = eng.tools.think.start({ topic: 'Оптимизация рендера', goal: '60 FPS' }).data;
eng.tools.think.branch({ thoughtId: th.id, label: 'Greedy Meshing', score: 0.95 });
eng.tools.think.branch({ thoughtId: th.id, label: 'Наивные кубы', score: 0.2 });
assert.equal(eng.tools.think.conclude({ thoughtId: th.id }).data.decision, 'Greedy Meshing');

eng.tools.guess.propose({ id: 'h1', statement: 'Утечка в кэше', prior: 0.3 });
const afterEv = eng.tools.guess.evidence({ id: 'h1', note: 'Рост памяти на каждом тике', likelihoodIfTrue: 0.9, likelihoodIfFalse: 0.1 }).data;
assert.ok(afterEv.probability > 0.75, 'Формула Байеса обязана поднять вероятность после сильного свидетельства');

eng.tools.comm.post({ channel: 'general', from: 'ai-architect', to: 'ai-qa', text: 'Проверь сцену' });
assert.equal(eng.tools.comm.read({ inboxOf: 'ai-qa' }).data.length, 1);
const t1 = eng.tools.comm.upsertTask({ id: 'T-1', title: 'Собрать Этап 2', status: 'in-progress', version: 2 }).data;
const tOld = eng.tools.comm.upsertTask({ id: 'T-1', title: 'Старое', status: 'open', version: 1 }).data;
assert.equal(t1.merged, true);
assert.equal(tOld.merged, false, 'CRDT LWW не должен перезаписывать более новую версию задачи');

// A-86 ddmin минимизирует 12 шагов до 2 ключевых
const dd = eng.tools.bugs.minimize({
  steps: ['s0', 's1', 'TRIGGER_A', 's3', 's4', 's5', 's6', 'TRIGGER_B', 's8', 's9', 's10', 's11'],
  testFails: (seq) => seq.includes('TRIGGER_A') && seq.includes('TRIGGER_B'),
}).data;
assert.deepEqual(dd.minimized, ['TRIGGER_A', 'TRIGGER_B']);

const threeExp = eng.tools.bridge.exportScene({ format: 'three-json' }).data;
assert.equal(threeExp.objectCount, 1);
const godotExp = eng.tools.bridge.exportScene({ format: 'godot-tscn' }).data;
assert.ok(godotExp.text.includes('[gd_scene format=3]') && godotExp.text.includes('crate_1'));

// 5. Интеграция save.exportWire2 / importWire2 + CloudSync (офлайн-first адаптер под Supabase ratcore_cloud_snapshots)
const expWire = eng.tools.save.exportWire2().data;
const impWire = eng.tools.save.importWire2({ frame: expWire.frame }).data;
assert.equal(impWire.data.entities[0].id, 'crate_1');

const cloud = new RatCoreCloudSync();
const pushed = await cloud.pushSnapshot('world-alpha', 'slot-1', eng.tools.save.exportJson().data);
assert.equal(pushed.ok, true);
assert.equal(pushed.record.wire_version, 2);
const pulled = await cloud.pullSnapshot('world-alpha', 'slot-1');
assert.equal(pulled.ok, true);
assert.equal(pulled.snapshot.entities[0].id, 'crate_1');

console.log('RatCore Stage 2 (v0.2) full verification: OK (RCW2/FastCDC/XOR-FEC, CoreGovernor 75%, phys/nav/env/audio/hear, AI-Team, CloudSync)');
