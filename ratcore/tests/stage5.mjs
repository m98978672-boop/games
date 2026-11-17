#!/usr/bin/env node
// RatCore Stage 5 (v1.0.0) Test Suite:
// Проверяет оставшиеся 5 опциональных пакетов (pack:mods, pack:cinema, pack:voice, pack:companion, pack:assist),
// полный pack:studio (RatStudio оверлей, COW «Машина времени», Автобалансировщик + поиск эксплойтов),
// все 5 оставшихся стандартных модулей (anim, fx, ai, sim, test) и 100 % полноту 36+ веток ai-dev-full.

import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
import {
  RATCORE_VERSION,
  createEngine,
  CORE_BRANCHES,
  STANDARD_MODULES,
  OPTIONAL_PACKS,
} from '../ratcore.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '../..');
const manifest = JSON.parse(fs.readFileSync(path.join(repoRoot, 'ratcore/tools-manifest.json'), 'utf8'));

assert.equal(RATCORE_VERSION, '1.0.0', 'Версия должна быть 1.0.0');

// 1. Zero-Cost Opt-In: без включения пакетов и модулей все ветки Этапа 5 возвращают RC-108
{
  const minimal = createEngine({ preset: 'minimal-2d', manifest });
  for (const [b, m] of [
    ['mod', 'pack'],
    ['cutscene', 'createTrack'],
    ['voice', 'speak'],
    ['coopAi', 'spawn'],
    ['assist', 'trackPlayer'],
    ['studio', 'open'],
    ['anim', 'solveTwoBoneIK'],
    ['fx', 'emitBurst'],
    ['ai', 'evaluateUtility'],
    ['sim', 'craft'],
    ['test', 'checkInvariants'],
  ]) {
    const r = minimal.tools[b][m]({});
    assert.equal(r.ok, false, `Ветка ${b}.${m} должна быть отключена в minimal-2d`);
    assert.equal(r.error.code, 'RC-108', `Ожидался RC-108 для ${b}.${m}`);
  }
  const tlBlocked = minimal.tools.save.timelineInit({});
  assert.equal(tlBlocked.ok, false);
  assert.equal(tlBlocked.error.code, 'RC-108', 'save.timelineInit без pack:studio обязан возвращать RC-108');
}

// 2. pack:mods — .ratmod.rcw2, ToolGuard (RC-101/RC-102), топологическая сортировка, ModQuota, Hot-Reload
let modsSummary;
{
  const engine = createEngine({ preset: 'minimal-2d', packs: ['pack:mods'] });

  const basePacked = engine.tools.mod.pack({
    manifest: { id: 'rat-base-pack', name: 'Базовый мод', version: '1.0.0', author: 'RatCore' },
    recipes: [{ id: 'watchtower', op: 'build.primitive', kind: 'cylinder' }],
    scripts: ['const bonus = 12;'],
  });
  assert.equal(basePacked.ok, true);
  assert.equal(basePacked.data.fileName, 'rat-base-pack.ratmod.rcw2');
  assert.ok(basePacked.data.packageBytes instanceof Uint8Array);

  // Грязный мод с eval() и сырыми вершинами отклоняется валидацией
  const dirtyEval = engine.tools.mod.pack({
    manifest: { id: 'evil-eval', version: '0.1.0' },
    scripts: ['eval("alert(1)")'],
  });
  const checkEval = engine.tools.mod.validate({ packageBytes: dirtyEval.data.packageBytes });
  assert.equal(checkEval.data.valid, false);
  assert.equal(checkEval.data.code, 'RC-102');

  const dirtyRawMesh = engine.tools.mod.pack({
    manifest: { id: 'evil-raw-mesh', version: '0.1.0' },
    recipes: [{ id: 'bad', rawVertices: [0, 0, 0, 1, 0, 0, 0, 1, 0] }],
  });
  const checkRaw = engine.tools.mod.validate({ packageBytes: dirtyRawMesh.data.packageBytes });
  assert.equal(checkRaw.data.valid, false);
  assert.equal(checkRaw.data.code, 'RC-101');

  // Зависимый мод без базового отклоняется RC-106
  const addonPacked = engine.tools.mod.pack({
    manifest: { id: 'rat-addon-bridges', version: '1.0.0', requires: ['rat-base-pack'] },
    recipes: [{ id: 'arch-bridge', op: 'build.extrude' }],
  });
  const prematureMount = engine.tools.mod.mount({ packageBytes: addonPacked.data.packageBytes, quotaPct: 8 });
  assert.equal(prematureMount.ok, false);
  assert.equal(prematureMount.error.code, 'RC-106');

  // Подключаем базу -> затем аддон -> проверяем топологический порядок
  const m1 = engine.tools.mod.mount({ packageBytes: basePacked.data.packageBytes, quotaPct: 10 });
  assert.equal(m1.ok, true);
  const m2 = engine.tools.mod.mount({ packageBytes: addonPacked.data.packageBytes, quotaPct: 8 });
  assert.equal(m2.ok, true);
  assert.deepEqual(m2.data.loadOrder, ['rat-base-pack', 'rat-addon-bridges']);

  // Превышение ModQuota ставит мод на паузу без краша
  const quotaHit = engine.tools.mod.recordCpu({ modId: 'rat-addon-bridges', spentMs: 4.5 });
  assert.equal(quotaHit.ok, true);
  assert.equal(quotaHit.data.paused, true);

  // Hot-Reload обновляет версию и сбрасывает паузу
  const addonV2 = engine.tools.mod.pack({
    manifest: { id: 'rat-addon-bridges', version: '1.1.0', requires: ['rat-base-pack'] },
    recipes: [{ id: 'arch-bridge-v2', op: 'build.extrude' }],
  });
  const hr = engine.tools.mod.hotReload({ modId: 'rat-addon-bridges', packageBytes: addonV2.data.packageBytes });
  assert.equal(hr.ok, true);
  assert.equal(hr.data.version, '1.1.0');
  assert.equal(hr.data.reloads, 1);

  // Нельзя выгрузить базу, пока от неё зависит аддон
  const blockedUnmount = engine.tools.mod.unmount({ modId: 'rat-base-pack' });
  assert.equal(blockedUnmount.ok, false);
  assert.equal(blockedUnmount.error.code, 'RC-106');

  assert.equal(engine.tools.mod.unmount({ modId: 'rat-addon-bridges' }).ok, true);
  assert.equal(engine.tools.mod.unmount({ modId: 'rat-base-pack' }).ok, true);
  modsSummary = { packedBytes: basePacked.data.packedBytes, topoOrder: m2.data.loadOrder, hotReloads: hr.data.reloads };
}

// 3. pack:cinema — дуговая рельса Catmull-Rom, таймлапс и реальная авто-обложка 16:9
let cinemaSummary;
{
  const engine = createEngine({ preset: 'minimal-2d', packs: ['pack:cinema'] });
  const box = engine.tools.build.primitive({ kind: 'box', width: 3, depth: 3, height: 4 }).data;
  const roof = engine.tools.build.primitive({ kind: 'roof', width: 3.4, depth: 3.4, height: 1.8 }).data;
  assert.equal(engine.tools.build.placeEntity({ id: 'hero-tower', mesh: box, x: 0, y: 0, h: 1 }).ok, true);
  assert.equal(engine.tools.build.placeEntity({ id: 'hero-roof', mesh: roof, x: 0, y: 0, h: 5 }).ok, true);

  const track = engine.tools.cutscene.createTrack({
    id: 'intro-flyby',
    durationSec: 10,
    keyframes: [
      { x: -12, y: -12, h: 6, targetX: 0, targetY: 0, targetH: 2 },
      { x: 0, y: -14, h: 8, targetX: 0, targetY: 0, targetH: 2.5 },
      { x: 12, y: -6, h: 5, targetX: 0, targetY: 0, targetH: 2 },
    ],
    subtitles: [{ fromSec: 2, toSec: 7, text: 'Добро пожаловать в RatCore v1.0' }],
    weatherEvents: [{ atSec: 4, kind: 'fog' }],
  });
  assert.equal(track.ok, true);
  assert.ok(track.data.totalLength > 15);

  const sMid = engine.tools.cutscene.seek({ trackId: 'intro-flyby', timeSec: 5 });
  assert.equal(sMid.ok, true);
  assert.equal(sMid.data.subtitle, 'Добро пожаловать в RatCore v1.0');
  assert.equal(sMid.data.weatherEvent.kind, 'fog');
  assert.ok(Math.abs(sMid.data.arcDistance - track.data.totalLength * 0.5) < 0.05, 'Дуговая параметризация должна быть равномерной');

  assert.equal(engine.tools.cutscene.timelapseStart({ everyTicks: 5, maxFrames: 20 }).ok, true);
  assert.equal(engine.tools.cutscene.timelapseCapture({ tick: 0 }).data.captured, true);
  assert.equal(engine.tools.cutscene.timelapseCapture({ tick: 2 }).data.captured, false);
  assert.equal(engine.tools.cutscene.timelapseCapture({ tick: 10 }).data.captured, true);
  const tlEnd = engine.tools.cutscene.timelapseFinish();
  assert.equal(tlEnd.data.frames, 2);

  const cover = engine.tools.cutscene.autoCover({ target: { x: 0, y: 0, h: 2.5 }, radius: 11, candidates: 12 });
  assert.equal(cover.ok, true);
  assert.equal(cover.data.candidatesEvaluated, 12);
  assert.ok(cover.data.bestScore > 0.25, `Оценка обложки слишком мала: ${cover.data.bestScore}`);
  cinemaSummary = { totalLength: track.data.totalLength, bestCoverScore: cover.data.bestScore, timelapseFrames: tlEnd.data.frames };
}

// 4. pack:voice — 3-формантный синтез PCM (0 КБ сэмплов) + виземы рта
let voiceSummary;
{
  const engine = createEngine({ preset: 'minimal-2d', packs: ['pack:voice'] });
  const prof = engine.tools.voice.createProfile({ id: 'droid-7', pitchHz: 145, formants: [0.95, 1.12, 1.05], style: 'robot' });
  assert.equal(prof.ok, true);

  const spRadio = engine.tools.voice.speak({ profileId: 'commander-radio', text: 'Сектор чист, приём!', emotion: 'urgent' });
  assert.equal(spRadio.ok, true);
  assert.equal(spRadio.data.externalAssetBytes, 0);
  assert.ok(spRadio.data.samples instanceof Float32Array && spRadio.data.sampleCount > 2000);
  assert.ok(spRadio.data.peakAmplitude > 0.15, 'PCM-сигнал не должен быть тишиной');

  const vis = engine.tools.voice.getViseme({ voiceId: spRadio.data.voiceId, timeSec: spRadio.data.durationSec * 0.35 });
  assert.equal(vis.ok, true);
  assert.ok(typeof vis.data.viseme === 'string');

  const spRobot = engine.tools.voice.speak({ profileId: 'droid-7', text: 'Система готова', emotion: 'calm' });
  assert.equal(spRobot.ok, true);
  voiceSummary = { radioSamples: spRadio.data.sampleCount, peak: spRadio.data.peakAmplitude, visemes: spRadio.data.visemeCount };
}

// 5. pack:companion — локальный ИИ-напарник со зрением see, слухом hear и NLU RU/EN
let companionSummary;
{
  const engine = createEngine({ preset: 'minimal-2d', packs: ['pack:companion'] });
  // Зависимости ai + hear должны подключиться автоматически по F-167
  assert.equal(engine.tools.hear.emit({ kind: 'explosion', x: -8, y: 2, h: 1, volumeDb: 95 }).ok, true);
  const sp = engine.tools.coopAi.spawn({ id: 'barsik', name: 'Барсик', x: 0, y: 0, h: 1 });
  assert.equal(sp.ok, true);

  const ord = engine.tools.coopAi.order({ companionId: 'barsik', text: 'Прикрой слева у моста!', playerPos: { x: 0, y: 0, h: 1 } });
  assert.equal(ord.ok, true);
  assert.equal(ord.data.parsed.intent, 'cover');
  assert.equal(ord.data.parsed.direction, 'left');
  assert.ok(ord.data.plan.length >= 2);

  const step1 = engine.tools.coopAi.step({ companionId: 'barsik', dt: 1.0, speed: 4 });
  assert.equal(step1.ok, true);
  assert.ok(step1.data.x < 0, 'Напарник должен сместиться влево (-X)');

  const exp = engine.tools.coopAi.explainLastAction({ companionId: 'barsik' });
  assert.equal(exp.ok, true);
  assert.ok(exp.data.explanation.includes('Слышу «explosion»'), 'Напарник обязан учитывать услышанный взрыв');
  companionSummary = { intent: ord.data.parsed.intent, direction: ord.data.parsed.direction, trust: ord.data.trust };
}

// 6. pack:assist — детектор застревания > 20 с, реальная дальтоническая матрица, аудио-субтитры, 1 рука
let assistSummary;
{
  const engine = createEngine({ preset: 'minimal-2d', modules: ['hear'], packs: ['pack:assist'] });
  const box = engine.tools.build.primitive({ kind: 'box', width: 4, depth: 4, height: 4, color: [230, 50, 45, 255] }).data;
  assert.equal(engine.tools.build.placeEntity({ id: 'red-crate', mesh: box, x: 0, y: 0, h: 1 }).ok, true);

  // До включения дальтонизма снимаем кадр
  const rawFrame = engine.tools.look.capture({ includePixels: true }).data;
  const rawCopy = new Uint32Array(rawFrame.pixels);

  assert.equal(engine.tools.assist.setVisualMode({ colorblind: 'protanopia', highContrast: true, fontScale: 1.35 }).ok, true);
  const daltonFrame = engine.tools.look.capture({ includePixels: true }).data;
  let changedPixels = 0;
  for (let i = 0; i < rawCopy.length; i++) if (rawCopy[i] !== daltonFrame.pixels[i]) changedPixels++;
  assert.ok(changedPixels > 200, `Коррекция дальтонизма должна реально изменять пиксели (изменено ${changedPixels})`);

  // Детектор застревания: 0 -> 1 -> 2 -> 3 уровни подсказок
  let tRes;
  for (let s = 0; s <= 42; s += 5) {
    tRes = engine.tools.assist.trackPlayer({ playerPos: { x: 0, y: 0 }, goalPos: { x: 25, y: 0 }, activeGoalId: 'gate', dt: 5 });
  }
  assert.equal(tRes.data.hintLevel, 3);
  assert.ok(tRes.data.stuckScore === 1);

  // Направленные аудио-субтитры (hear -> UI)
  assert.equal(engine.tools.assist.setAudioSubtitles({ enabled: true, showDirection: true }).ok, true);
  assert.equal(engine.tools.hear.emit({ kind: 'Шаги', x: -10, y: 0, h: 1, volumeDb: 72 }).ok, true);
  const subs = engine.tools.assist.audioSubtitles({ listenerPos: { x: 0, y: 0, h: 1 } });
  assert.equal(subs.ok, true);
  assert.ok(subs.data.captions.length >= 1 && subs.data.captions[0].arrow === '←');

  const oneHand = engine.tools.assist.setOneHandMobile({ enabled: true, dominantHand: 'left' });
  assert.equal(oneHand.data.layout.joystickCenter.xPct, 22);
  assistSummary = { changedPixels, hintLevel: tRes.data.hintLevel, subtitle: subs.data.captions[0].text };
}

// 7. pack:studio — RatStudio оверлей, COW «Машина времени», Автобалансировщик + поиск эксплойтов + 10/10 AV экспорт
let studioSummary;
{
  const engine = createEngine({ preset: 'minimal-2d', packs: ['pack:studio'] });
  const opened = engine.tools.studio.open({ panels: ['inspector', 'timeline', 'balancer', 'exporter'] });
  assert.equal(opened.ok, true);
  assert.equal(opened.data.devOnlyStripInRelease, true);
  assert.ok(opened.data.frameOverheadBudgetMs <= 0.8);

  const m = engine.tools.build.primitive({ kind: 'box', width: 2, depth: 2, height: 2 }).data;
  assert.equal(engine.tools.build.placeEntity({ id: 'base-1', mesh: m, x: 0, y: 0, h: 1 }).ok, true);

  // Машина времени (COW Timeline + ветвление + сравнение веток)
  assert.equal(engine.tools.save.timelineInit({ keyframeInterval: 5 }).ok, true);
  engine.clock.advance(5 * engine.clock.fixedDt, () => {});
  assert.equal(engine.tools.build.placeEntity({ id: 'base-2', mesh: m, x: 4, y: 0, h: 1 }).ok, true);
  assert.equal(engine.tools.save.timelineRecord({ tick: 5, forceKeyframe: true }).ok, true);

  const br = engine.tools.save.branchFrom({ tick: 0, patchParams: { gravity: -4.5 }, label: 'Низкая гравитация' });
  assert.equal(br.ok, true);
  const scrubbed = engine.tools.save.scrubTo({ tick: 5, branchId: 'main' });
  assert.equal(scrubbed.ok, true);
  assert.equal(scrubbed.data.snapshot.entities.length, 2);

  const cmp = engine.tools.save.timelineCompare({ branchA: 'main', branchB: br.data.branchId, tick: 5 });
  assert.equal(cmp.ok, true);
  assert.equal(cmp.data.entityCountDelta, -1);

  // Автобалансировщик на перекошенной игре: находит эксплойт и улучшает фитнес баланса
  const exploits = engine.tools.studio.findExploits({
    runs: 300,
    params: { aggroDmg: 2.3, defenseArmor: 0.9, economyRate: 0.95, stealthCrit: 0.9 },
  });
  assert.equal(exploits.ok, true);
  assert.ok(exploits.data.exploitsFound >= 1, 'Должен обнаружить автопобедную стратегию aggro');
  assert.ok(exploits.data.suggestedPatch.aggroDmg < 2.3, 'Патч должен ослабить имбовый aggroDmg');

  const inspect = engine.tools.studio.inspectScene();
  assert.equal(inspect.data.entityCount, 2);

  // Экспорт автономного HTML + 10-проходная антивирусная проверка Games
  const exported = engine.tools.studio.exportSingleHtml({ title: 'RatCore v1.0 Showcase' });
  assert.equal(exported.ok, true);
  assert.ok(exported.data.sizeBytes < 300 * 1024 && exported.data.under300KB === true);

  const avCode = fs.readFileSync(path.join(repoRoot, 'site/game-antivirus.js'), 'utf8');
  const sandbox = { window: {} };
  vm.runInNewContext(avCode, sandbox);
  const scan = sandbox.window.GamesAntivirus.scanGameSync({
    title: 'RatCore v1.0 Showcase',
    html: exported.data.html,
    files: [{ name: 'index.html', content: exported.data.html }],
  });
  assert.equal(scan.verdict, 'clean');
  assert.equal(scan.passCount, 10);
  assert.equal(scan.riskScore, 0);
  assert.equal(engine.tools.studio.close().data.open, false);

  studioSummary = {
    timelineBranches: 2,
    exploitsFound: exploits.data.exploitsFound,
    projectedFitness: exploits.data.projectedFitness,
    exportBytes: exported.data.sizeBytes,
    avVerdict: `${scan.verdict} (${scan.passCount}/10)`,
  };
}

// 8. Все 5 новых стандартных модулей (anim, fx, ai, sim, test) + 100 % полнота ai-dev-full
let stdSummary;
{
  const full = createEngine({ preset: 'ai-dev-full', manifest });
  assert.equal(full.getProfile().modules.length, STANDARD_MODULES.length, 'Все 10 стандартных модулей должны быть активны');
  assert.equal(full.getProfile().packs.length, Object.keys(OPTIONAL_PACKS).length, 'Все 14 опциональных пакетов должны быть активны');

  // Проверка, что НИ ОДНА ветка не осталась заглушкой с одним методом status
  const allBranches = [
    ...CORE_BRANCHES,
    ...STANDARD_MODULES,
    ...Object.values(OPTIONAL_PACKS).flatMap((p) => p.branches),
  ];
  for (const b of allBranches) {
    assert.equal(Boolean(full.tools[b].__disabled), false, `Ветка ${b} должна быть активна в ai-dev-full`);
    const methods = Object.keys(full.tools[b]);
    assert.ok(methods.length >= 1, `Ветка ${b} не должна быть пустой`);
    if (b !== 'input' && b !== 'ui') {
      assert.ok(methods.length >= 2, `Ветка ${b} должна иметь реальные методы, а не только status (найдено: ${methods.join(', ')})`);
    }
  }

  // anim: 2-костная IK + клип + Verlet
  const ik = full.tools.anim.solveTwoBoneIK({ root: [0, 0], target: [1.2, 0.8], len1: 1, len2: 1 });
  assert.equal(ik.ok, true);
  assert.equal(ik.data.reachable, true);
  assert.ok(Math.hypot(ik.data.end[0] - 1.2, ik.data.end[1] - 0.8) < 0.01, 'Конец 2-костной IK должен попасть в цель');
  assert.equal(full.tools.anim.defineClip({ id: 'walk', durationSec: 2, keyframes: [{ t: 0, value: 0 }, { t: 2, value: 10 }] }).ok, true);
  assert.equal(full.tools.anim.sampleClip({ id: 'walk', timeSec: 1 }).data.value, 5);
  assert.equal(full.tools.anim.createVerletChain({ id: 'banner', nodes: 5, segmentLen: 0.5 }).ok, true);
  assert.equal(full.tools.anim.stepVerletChain({ id: 'banner', dt: 0.05, windX: 6 }).ok, true);

  // fx: частицы + декаль + тряска камеры
  const burst = full.tools.fx.emitBurst({ count: 32, speed: 5, lifeSec: 1 });
  assert.equal(burst.data.spawned, 32);
  assert.equal(full.tools.fx.addDecal({ kind: 'crater', radius: 2 }).ok, true);
  assert.equal(full.tools.fx.addCameraShake({ trauma: 0.6 }).ok, true);
  const fxStep = full.tools.fx.step({ dt: 0.1 });
  assert.ok(fxStep.data.activeParticles === 32 && fxStep.data.shake.trauma < 0.6);

  // ai: Utility AI + GOAP + NLU
  assert.equal(full.tools.ai.registerAgent({ id: 'scout-1', hp: 18, ammo: 20 }).ok, true);
  const util = full.tools.ai.evaluateUtility({ id: 'scout-1', enemyDist: 10, medkitDist: 4 });
  assert.equal(util.data.chosenAction, 'retreat_heal', 'При 18 HP агент обязан выбрать отступление за аптечкой');
  const goap = full.tools.ai.planGoal({
    state: { hasAxe: false, hasWood: false, hasBridge: false },
    goal: { hasBridge: true },
    actions: [
      { name: 'grab-axe', pre: { hasAxe: false }, effect: { hasAxe: true } },
      { name: 'chop-wood', pre: { hasAxe: true }, effect: { hasWood: true } },
      { name: 'build-bridge', pre: { hasWood: true }, effect: { hasBridge: true } },
    ],
  });
  assert.equal(goap.data.found, true);
  assert.deepEqual(goap.data.plan, ['grab-axe', 'chop-wood', 'build-bridge']);

  // sim: ресурсы, лимит веса RC-603, крафт, демография
  assert.equal(full.tools.sim.setResource({ id: 'wood', amount: 10, unitWeight: 2 }).ok, true);
  assert.equal(full.tools.sim.setResource({ id: 'food', amount: 20, unitWeight: 1 }).ok, true);
  const overweight = full.tools.sim.setResource({ id: 'lead', amount: 200, unitWeight: 5 });
  assert.equal(overweight.ok, false);
  assert.equal(overweight.error.code, 'RC-603');
  assert.equal(full.tools.sim.defineRecipe({ id: 'planks', inputs: { wood: 4 }, outputs: { plank: 8 } }).ok, true);
  const crafted = full.tools.sim.craft({ recipeId: 'planks', times: 2 });
  assert.equal(crafted.data.inventory.wood, 2);
  assert.equal(crafted.data.inventory.plank, 16);
  const pop = full.tools.sim.tickEconomy();
  assert.equal(pop.data.status, 'growing');

  // test: инварианты + фаззер + discover v1.0
  const inv = full.tools.test.checkInvariants();
  assert.equal(inv.data.ok, true);
  const fuzz = full.tools.test.fuzzWalk({ steps: 40 });
  assert.equal(fuzz.data.ok, true);
  const disc = full.tools.discover({ intent: 'машина времени перемотка', limit: 3 });
  assert.ok(disc.data.matches.some((x) => x.id.startsWith('save.')));

  stdSummary = {
    totalBranchesActive: allBranches.length,
    manifestTools: manifest.tools.length,
    goapPlan: goap.data.plan,
    utilityChosen: util.data.chosenAction,
  };
}

console.log('RATCORE_STAGE5_V1_PASS', JSON.stringify({
  version: RATCORE_VERSION,
  mods: modsSummary,
  cinema: cinemaSummary,
  voice: voiceSummary,
  companion: companionSummary,
  assist: assistSummary,
  studio: studioSummary,
  fullProfile: stdSummary,
}));
