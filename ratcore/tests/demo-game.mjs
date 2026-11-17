#!/usr/bin/env node
// RatCore v1.0.0 Test Suite — Core input/ui + Первая полноценная 3D-игра «Стража Цитадели» (Citadel Watch)
// Проверяет:
//   1. Полноценные ветки ядра tools.input.* (9 методов: bind/remap/pushEvent/poll/buffer/record/replay) и tools.ui.* (7 методов: widgets/toasts/dialogs)
//   2. Чистоту кода игры game-core.js через Барьер 4 ToolGuard (auditSourceCode === 0 нарушений!)
//   3. Полный игровой сценарий: спавн волн, стрельба, постройка башни (sim.craft), ИИ-напарник Барсик, 3-формантная рация, зима/лёд, COW откат времени, RCW2 сохранение и экспорт в автономный .html с 10/10 чистым вердиктом антивируса Games!

import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
import { createEngine, auditSourceCode } from '../ratcore.js';
import { createCitadelWatchGame } from '../demos/citadel-watch/game-core.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '../..');

// 1. Проверка полноценных веток ядра tools.input.* и tools.ui.*
{
  const engine = createEngine({ preset: 'minimal-2d' });
  assert.equal(engine.tools.input.bind({ action: 'dash', keys: ['ShiftLeft'] }).data.bound, true);
  assert.equal(engine.tools.input.remap({ action: 'fire', keys: ['KeyJ'] }).data.keys[0], 'KeyJ');
  assert.equal(engine.tools.input.startRecord().data.recording, true);

  const p1 = engine.tools.input.pushEvent({ keyCode: 'KeyW', pressed: true, tick: 1 });
  assert.equal(p1.data.moveY, 1);
  const p2 = engine.tools.input.pushEvent({ keyCode: 'KeyJ', pressed: true, tick: 2 });
  assert.equal(p2.data.buttons & 1, 1, 'Кнопка fire должна выставлять бит 0');
  const buf = engine.tools.input.consumeBuffered({ action: 'fire', tick: 4 });
  assert.equal(buf.data.consumed, true, 'Буфер нажатия должен сработать в пределах 6 тиков');

  const stopped = engine.tools.input.stopRecord().data;
  assert.equal(stopped.frames, 2);
  const rep = engine.tools.input.replayAt({ tick: 2 }).data;
  assert.equal(rep.found, true);
  assert.equal(rep.frame.buttons & 1, 1);

  // Декларативный HUD (виджеты, тосты, диалоги)
  const w = engine.tools.ui.setWidget({ id: 'hp', kind: 'bar', label: 'HP', value: 75, max: 100 }).data;
  assert.equal(w.pct, 75);
  assert.equal(engine.tools.ui.notify({ text: 'Привет!', level: 'info', ttlSec: 1.0 }).ok, true);
  const dlg = engine.tools.ui.openDialog({ id: 'intro', speaker: 'Барсик', text: 'Идём?', choices: ['Да', 'Позже'] }).data;
  assert.equal(dlg.open, true);
  const ch = engine.tools.ui.chooseDialog({ id: 'intro', choiceIndex: 0 }).data;
  assert.equal(ch.chosen.label, 'Да');
  assert.equal(engine.tools.ui.tick({ dt: 1.5 }).data.activeToasts, 0, 'Просроченный тост должен исчезнуть');
  assert.equal(engine.tools.ui.removeWidget({ id: 'hp' }).data.removed, true);
}

// 2. Барьер 4 ToolGuard на исходном коде игры game-core.js
{
  const src = fs.readFileSync(path.join(repoRoot, 'ratcore/demos/citadel-watch/game-core.js'), 'utf8');
  const audit = auditSourceCode(src, 'ratcore/demos/citadel-watch/game-core.js');
  assert.equal(audit.ok, true, `game-core.js нарушил ToolGuard: ${JSON.stringify(audit.violations)}`);
}

// 3. Полный прогон 3D-игры «Стража Цитадели»
{
  const game = createCitadelWatchGame({ seed: 2026 });

  // Проматываем 2 секунды, чтобы заспавнились первые дроны
  let lastTick;
  for (let i = 0; i < 60; i++) lastTick = game.step(1 / 30);
  assert.ok(lastTick.dronesAlive >= 1, 'К 2-й секунде на карте должны появиться вражеские дроны');
  assert.ok(lastTick.hud.widgetCount >= 6, 'Декларативный HUD должен содержать >= 6 виджетов');

  // Проверка рендера 3D-сцены игры
  const cap = game.engine.tools.look.capture({ includePixels: true }).data;
  assert.ok(cap.drawnTris > 20 && cap.nonEmptyRatio > 0.05, '3D-сцена игры не должна быть пустой');

  // Строим башню (тратит 6 дерева и 4 камня из sim)
  const tur = game.buildTurret();
  assert.equal(tur.ok, true);
  assert.equal(game.state.turrets.length, 1);

  // Стреляем залпом по ближайшему дрону
  const shot = game.fireCannon();
  assert.equal(shot.fired, true);
  assert.equal(shot.hit, true);

  // Приказ ИИ-напарнику Барсику
  const ord = game.orderCompanion('Прикрой слева!');
  assert.equal(ord.parsed.intent, 'cover');

  // Радиопередача через 3-формантный синтезатор (0 КБ файлов)
  const sp = game.speakRadio('Держим рубеж, приём!');
  assert.equal(sp.externalAssetBytes, 0);
  assert.ok(sp.peakAmplitude > 0.15);

  // Стили, дальтонизм, зима/лёд, COW откат времени и RCW2 сохранение
  assert.equal(game.cycleStyle().activePreset, 'ps1');
  assert.equal(game.cycleColorblind().colorblind, 'protanopia');
  const winter = game.freezeRiverWinter();
  assert.ok(winter.ice.iceThicknessCm > 0);
  const rew = game.rewindTimeline();
  assert.equal(rew.restoredFromKeyframeTick, 0);
  const w2 = game.saveWire2();
  assert.ok(w2.wireBytes > 0 && w2.wireBytes <= w2.rawBytes);

  // Экспорт своей крепости в 1 автономный .html + 10-проходный антивирус Games
  const exp = game.exportFortressHtml();
  assert.equal(exp.under300KB, true);
  const avCode = fs.readFileSync(path.join(repoRoot, 'site/game-antivirus.js'), 'utf8');
  const sandbox = { window: {} };
  vm.runInNewContext(avCode, sandbox);
  const scan = sandbox.window.GamesAntivirus.scanGameSync({
    title: exp.title,
    html: exp.html,
    files: [{ name: 'index.html', content: exp.html }],
  });
  assert.equal(scan.verdict, 'clean');
  assert.equal(scan.passCount, 10);
  assert.equal(scan.riskScore, 0);

  console.log('RATCORE_DEMO_GAME_PASS', JSON.stringify({
    game: 'Стража Цитадели (Citadel Watch)',
    toolGuardAudit: '0 violations',
    drawnTris: cap.drawnTris,
    dronesSeen: lastTick.dronesAlive,
    turretsBuilt: game.state.turrets.length,
    score: game.state.score,
    wire2Bytes: w2.wireBytes,
    exportKB: exp.sizeKB,
    avVerdict: `${scan.verdict} (${scan.passCount}/10)`,
  }));
}
