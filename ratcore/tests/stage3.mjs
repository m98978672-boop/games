// RatCore Stage 3 Test Suite — pack:destruction, pack:multiplayer (Rollback Netcode), pack:narrative (no softlocks),
// pack:ecology (Stefan/Gold ice), pack:styles (PS1/CRT/Thermal/NV/Cel), pack:studio (exportSingleHtml + 10-pass Antivirus!).

import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { createEngine, RATCORE_VERSION, encodeInput12, decodeInput12, fnv1a32Bytes } from '../ratcore.js';

function loadGamesAntivirus() {
  const code = fs.readFileSync(new URL('../../site/game-antivirus.js', import.meta.url), 'utf8');
  const sandbox = { window: {}, URL, TextEncoder, Uint8Array, ArrayBuffer, Math, Date, RegExp, Object, Array, String, Number, Set, Map, JSON };
  sandbox.self = sandbox.window;
  vm.runInNewContext(code, sandbox);
  return sandbox.window.GamesAntivirus;
}

function test(name, fn) {
  try {
    fn();
    console.log(`  [PASS] ${name}`);
  } catch (err) {
    console.error(`  [FAIL] ${name}:`, err.message);
    throw err;
  }
}

console.log(`=== RatCore Stage 3 Tests (${RATCORE_VERSION}) ===`);

test('1. Zero-Cost Opt-In: все 6 пакетов Этапа 3 выдают RC-108 пока не подключены', () => {
  const engine = createEngine({ seed: 301, preset: 'minimal-2d' });
  for (const branch of ['destroy', 'net', 'story', 'quest', 'eco', 'shader', 'studio']) {
    const res = engine.tools[branch].status();
    assert.equal(res.ok, false, `Branch ${branch} must be disabled`);
    assert.equal(res.error?.code, 'RC-108', `Branch ${branch} must return RC-108 when disabled`);
  }
});

test('2. pack:destruction: обрушение неподпёртой крыши по BFS-графу опор и огонь по ветру', () => {
  const engine = createEngine({
    seed: 302,
    preset: 'minimal-2d',
    modules: ['env'],
    packs: ['pack:destruction'],
  });
  const reg = engine.tools.destroy.registerStructure({
    id: 'bridge-1',
    blocks: [
      { id: 'pillar-a', x: 0, y: 0, h: 0, isFoundation: true, hp: 100, neighbors: ['beam-mid'] },
      { id: 'beam-mid', x: 1, y: 0, h: 2, isFoundation: false, hp: 80, neighbors: ['pillar-a', 'roof-top'] },
      { id: 'roof-top', x: 1, y: 0, h: 4, isFoundation: false, hp: 60, neighbors: ['beam-mid'] },
    ],
  });
  assert.equal(reg.ok, true);
  assert.equal(reg.data.blockCount, 3);

  const dmg = engine.tools.destroy.damage({ structureId: 'bridge-1', blockId: 'pillar-a', amount: 150 });
  assert.equal(dmg.ok, true);
  assert.equal(dmg.data.collapsedCount, 3);
  assert.deepEqual([...dmg.data.collapsed].sort(), ['beam-mid', 'pillar-a', 'roof-top']);
  assert.equal(dmg.data.intactRemaining, 0);
  assert.ok(engine.tools.destroy.debris().data.count >= 3);

  engine.tools.destroy.ignite({ x: 0, y: 0, intensity: 0.9 });
  const spread = engine.tools.destroy.tickFire({ dt: 1, windDx: 4, windDy: 0, isRaining: false });
  assert.ok(spread.data.activeFires >= 2, 'Wind must spread fire');
  const damped = engine.tools.destroy.tickFire({ dt: 4, windDx: 0, windDy: 0, isRaining: true });
  assert.ok(damped.data.activeFires < spread.data.activeFires, 'Rain must extinguish fires');
});

test('3. pack:multiplayer: 12-байтный кодек ввода + Rollback Netcode + статистика RTT/jitter', () => {
  const bytes = encodeInput12({ tick: 123456, peerId: 7, buttons: 0b101011, moveX: 0.5, moveY: -0.75 });
  assert.equal(bytes.length, 12);
  const dec = decodeInput12(bytes);
  assert.equal(dec.tick, 123456);
  assert.equal(dec.peerId, 7);
  assert.equal(dec.buttons, 0b101011);
  assert.ok(Math.abs(dec.moveX - 0.5) < 0.01);
  assert.ok(Math.abs(dec.moveY - (-0.75)) < 0.01);

  const engine = createEngine({ seed: 303, preset: 'minimal-2d', packs: ['pack:multiplayer'] });
  const room = engine.tools.net.createRoom({ roomId: 'arena-1', maxPlayers: 4 });
  assert.equal(room.ok, true);
  assert.equal(room.data.maxPlayers, 4);
  engine.tools.net.joinRoom({ roomId: 'arena-1', peerId: 1, name: 'Host' });
  const joined = engine.tools.net.joinRoom({ roomId: 'arena-1', peerId: 2, name: 'Guest' });
  assert.equal(joined.data.ok, true);
  assert.equal(joined.data.peerCount, 2);

  engine.tools.net.commitTick({ tick: 10, state: { x: 0 }, input: { tick: 10, peerId: 1, buttons: 1, moveX: 1, moveY: 0 } });
  engine.tools.net.commitTick({ tick: 11, state: { x: 1 }, input: { tick: 11, peerId: 1, buttons: 1, moveX: 1, moveY: 0 } });
  const lateFrame = encodeInput12({ tick: 10, peerId: 2, buttons: 4, moveX: 0.5, moveY: 0 });
  const rb = engine.tools.net.receiveRemoteInput({
    frame12: lateFrame,
    simulateStep: (st, inputs) => ({ x: st.x + inputs.reduce((s, i) => s + i.moveX, 0) }),
  });
  assert.equal(rb.data.rolledBack, true);
  assert.equal(rb.data.fromTick, 10);
  assert.equal(rb.data.replayedTicks, 2);
  assert.ok(rb.data.state.x > 2.4, 'Rollback must re-simulate with late remote input');

  engine.tools.net.recordRtt({ rttMs: 28 });
  const netStats = engine.tools.net.recordRtt({ rttMs: 36 }).data;
  assert.equal(netStats.avgRttMs, 32);
  assert.equal(netStats.jitterMs, 4);
});

test('4. pack:narrative: AI-режиссёр, хроника, фракции и автопроверка квестов на отсутствие софтлоков', () => {
  const engine = createEngine({ seed: 304, preset: 'minimal-2d', packs: ['pack:narrative'] });
  const beat = engine.tools.story.directorTick({ playerHealthRatio: 0.25, activeThreats: 5, resourcesRatio: 0.3 }).data;
  assert.ok(['build-up', 'peak', 'sustain', 'relax'].includes(beat.phase));
  assert.ok(beat.tension > 0.25);

  engine.tools.story.addChronicle({ kind: 'battle', summary: 'Отразил атаку на мост', impact: 5 });
  assert.equal(engine.tools.story.chronicle().data.length, 1);
  const rel = engine.tools.story.setFactionRelation({ factionA: 'rangers', factionB: 'traders', delta: 45 }).data;
  assert.equal(rel.stance, 'allied');

  const q = engine.tools.quest.generate({ id: 'q-main', title: 'Переправа через реку' }).data;
  assert.equal(q.softlockFree, true, 'Generated quest must have zero softlocks');
  assert.equal(q.audit.deadEnds.length, 0);

  const broken = engine.tools.quest.verifyNoSoftlocks({
    stages: [
      { id: 'start', next: ['dead-end', 'goal'] },
      { id: 'dead-end', next: [] },
      { id: 'goal', isGoal: true, next: [] },
    ],
  }).data;
  assert.equal(broken.ok, false);
  assert.deepEqual(broken.deadEnds, ['dead-end']);
});

test('5. pack:ecology: формула Стефана + формула Гольда P_max = A*h^2 + эрозия HeightField + фауна', () => {
  const engine = createEngine({ seed: 305, preset: 'minimal-2d', packs: ['pack:ecology'] });
  engine.tools.build.mapGenerate({ seed: 305 });
  const truckThin = engine.tools.eco.iceStressTest({ massKg: 5000, iceThicknessCm: 12 }).data;
  assert.equal(truckThin.holds, false);
  assert.equal(truckThin.status, 'crack-collapse');
  const humanThin = engine.tools.eco.iceStressTest({ massKg: 90, iceThicknessCm: 12 }).data;
  assert.equal(humanThin.holds, true);

  const iceBefore = engine.tools.eco.status().data.iceThicknessCm;
  const frozen = engine.tools.eco.stepIce({ tempC: -22, hours: 48 }).data;
  assert.ok(frozen.iceThicknessCm > iceBefore, 'Sub-zero temp must thicken river ice');
  const truckThick = engine.tools.eco.iceStressTest({ massKg: 5000, iceThicknessCm: 35 }).data;
  assert.equal(truckThick.holds, true);

  const erosion = engine.tools.eco.erodeTerrain({ iterations: 2, strength: 0.1 }).data;
  assert.equal(erosion.ok, true);
  assert.ok(erosion.sedimentMoved > 0);

  const fauna = engine.tools.eco.tickFauna().data;
  assert.ok(fauna.populations.deer >= 2);
});

test('6. pack:styles: пост-обработка PS1 / CRT / Thermal / Nightvision / Cel меняет буфер RasterSurface', () => {
  const engine = createEngine({
    seed: 306,
    preset: 'minimal-2d',
    packs: ['pack:styles'],
    viewport: { width: 120, height: 80 },
  });
  const mesh = engine.tools.build.primitive({ shape: 'box', w: 2.5, h: 2.5, d: 2.5, color: '#d27846' }).data;
  engine.tools.build.placeEntity({ id: 'cube', mesh, x: 0, y: 0, h: 1, allowWater: true });
  engine.tools.look.at({ x: 0, y: -7, h: 3, targetX: 0, targetY: 0, targetH: 1 });

  const baseCap = engine.tools.look.capture({ includePixels: true }).data;
  const baseHash = fnv1a32Bytes(new Uint8Array(baseCap.pixels.buffer));

  for (const preset of ['ps1', 'crt', 'thermal', 'nightvision', 'cel']) {
    const res = engine.tools.shader.applyPreset({ preset });
    assert.equal(res.ok, true);
    assert.equal(res.data.activePreset, preset);
    const styledCap = engine.tools.look.capture({ includePixels: true }).data;
    const styledHash = fnv1a32Bytes(new Uint8Array(styledCap.pixels.buffer));
    assert.notEqual(styledHash, baseHash, `Style preset ${preset} must alter rendered pixels`);
  }
});

test('7. pack:studio: экспорт в 1 автономный офлайн .html (< 300 КБ) проходит 10-проходный антивирус Games с 0 угроз!', () => {
  const engine = createEngine({ seed: 307, preset: 'minimal-2d', packs: ['pack:studio'] });
  const mesh = engine.tools.build.primitive({ shape: 'box', w: 1.5, h: 1.5, d: 1.5, color: '#38bdf8' }).data;
  engine.tools.build.placeEntity({ id: 'hero', mesh, x: 1, y: 2, h: 1, allowWater: true });

  const exp = engine.tools.studio.exportSingleHtml({ title: 'RatCore Offline Demo', author: 'RatCore QA' }).data;
  assert.equal(exp.under300KB, true);
  assert.ok(exp.html.includes('<!DOCTYPE html>'));
  assert.ok(exp.html.includes('RCW2_HEX'));

  // Прогоняем сгенерированный HTML через реальный 10-проходный антивирус Games!
  const av = loadGamesAntivirus();
  const avReport = av.scanGameSync({
    mode: 'code',
    title: exp.title,
    desc: 'Автономный экспорт из RatCore Studio',
    code: exp.html,
  });
  assert.equal(avReport.verdict, 'clean', `Exported single HTML must be clean: ${JSON.stringify(avReport.blockedReasons.concat(avReport.warnReasons))}`);
  assert.equal(avReport.passCount, 10);
  assert.equal(avReport.riskScore, 0);
  assert.equal(avReport.blockedReasons.length, 0);
  assert.equal(avReport.warnReasons.length, 0);
});

console.log('ALL STAGE 3 TESTS PASSED!\n');
