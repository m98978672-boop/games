// RatCore Pack [pack:studio] — RatStudio dev-оверлей, «Машина времени» (COW Timeline) и Автобалансировщик (F-143..F-148, F-169, A-96..A-98, A-112..A-113)
// Только для dev/authoring (полностью вырезается в релизном экспорте: 0 Б в финальной игре!).

import { clamp, createRng } from '../core/math.js';
import { RatCoreError } from '../core/seal.js';

function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

// 1. «Машина времени» с ветвлением истории (COW-снимки, F-143..F-144, A-96)
export class TimelineDebugger {
  constructor() {
    this.keyframeInterval = 10;
    this.maxBranchRamMB = 24;
    this.branches = new Map();
    this.activeBranchId = 'main';
    this.nextBranchNum = 1;
    this.init();
  }

  init({ keyframeInterval = 10, maxBranchRamMB = 24 } = {}) {
    // F-143: оптимальный интервал K*
    this.keyframeInterval = keyframeInterval === 'auto' ? 12 : Math.max(1, Number(keyframeInterval) | 0);
    this.maxBranchRamMB = clamp(Number(maxBranchRamMB), 4, 256);
    this.branches.clear();
    this.branches.set('main', {
      id: 'main',
      label: 'Основная ветка',
      parentId: null,
      forkTick: 0,
      patchParams: {},
      keyframes: new Map(), // tick -> snapshot
      ticks: [],
    });
    this.activeBranchId = 'main';
    return {
      initialized: true,
      keyframeInterval: this.keyframeInterval,
      maxBranchRamMB: this.maxBranchRamMB,
      activeBranchId: this.activeBranchId,
    };
  }

  record({ tick = 0, snapshot, branchId = this.activeBranchId, forceKeyframe = false } = {}) {
    const br = this.branches.get(branchId);
    if (!br) throw new RatCoreError('RC-104', `Ветка таймлайна "${branchId}" не найдена`, 'Вызови save.timelineInit() или проверь branchId.');
    const t = Number(tick) | 0;
    const shouldStore = forceKeyframe || br.keyframes.size === 0 || (t % this.keyframeInterval === 0);
    if (shouldStore && snapshot) {
      br.keyframes.set(t, deepClone(snapshot));
    }
    if (!br.ticks.includes(t)) {
      br.ticks.push(t);
      br.ticks.sort((a, b) => a - b);
    }
    return { branchId: br.id, tick: t, storedKeyframe: shouldStore, totalKeyframes: br.keyframes.size };
  }

  // Находит ближайший снимок <= tick, поднимаясь по COW-цепочке предков с соблюдением forkTick (A-96)
  _resolveKeyframe(branchId, targetTick) {
    let curId = branchId;
    let capTick = targetTick;
    let bestTick = -Infinity;
    let bestSnap = null;
    let ownerBranch = branchId;

    while (curId) {
      const br = this.branches.get(curId);
      if (!br) break;
      for (const [kfTick, snap] of br.keyframes) {
        if (kfTick <= capTick && kfTick > bestTick) {
          bestTick = kfTick;
          bestSnap = snap;
          ownerBranch = curId;
        }
      }
      if (br.parentId) {
        capTick = Math.min(capTick, br.forkTick);
      }
      curId = br.parentId;
    }
    return bestSnap ? { tick: bestTick, ownerBranch, snapshot: deepClone(bestSnap) } : null;
  }

  scrubTo({ tick = 0, branchId = this.activeBranchId } = {}) {
    const br = this.branches.get(branchId);
    if (!br) throw new RatCoreError('RC-104', `Ветка таймлайна "${branchId}" не найдена`, 'Проверь branchId.');
    const t = Number(tick) | 0;
    const resolved = this._resolveKeyframe(branchId, t);
    if (!resolved) {
      throw new RatCoreError('RC-104', `Нет записанных COW-снимков до тика ${t}`, 'Запиши минимум 1 снимок перед перемоткой.');
    }
    this.activeBranchId = branchId;
    return {
      branchId,
      requestedTick: t,
      restoredFromKeyframeTick: resolved.tick,
      replayDeltaTicks: Math.max(0, t - resolved.tick),
      inheritedFromBranch: resolved.ownerBranch,
      patchParams: { ...br.patchParams },
      snapshot: resolved.snapshot,
    };
  }

  // F-144: создание альтернативной ветки истории без копирования всей истории (Copy-On-Write)
  branchFrom({ tick = 0, fromBranchId = this.activeBranchId, patchParams = {}, label } = {}) {
    const parent = this.branches.get(fromBranchId);
    if (!parent) throw new RatCoreError('RC-104', `Родительская ветка "${fromBranchId}" не найдена`, 'Проверь fromBranchId.');
    const base = this._resolveKeyframe(fromBranchId, Number(tick) | 0);
    if (!base) throw new RatCoreError('RC-104', `Невозможно ответвиться от тика ${tick}: нет снимка`, 'Сначала запиши снимок.');

    const id = `branch-${this.nextBranchNum++}`;
    const snap = deepClone(base.snapshot);
    snap.meta = { ...(snap.meta || {}), patchParams: { ...patchParams }, forkedFrom: fromBranchId, forkTick: Number(tick) | 0 };
    const child = {
      id,
      label: String(label || `Ветка #${this.nextBranchNum - 1}`),
      parentId: fromBranchId,
      forkTick: Number(tick) | 0,
      patchParams: { ...patchParams },
      keyframes: new Map([[Number(tick) | 0, snap]]),
      ticks: [Number(tick) | 0],
    };
    this.branches.set(id, child);
    this.activeBranchId = id;
    return {
      branchId: id,
      label: child.label,
      parentId: fromBranchId,
      forkTick: child.forkTick,
      patchParams: child.patchParams,
      totalBranches: this.branches.size,
    };
  }

  compareBranches({ branchA = 'main', branchB, tick = 0 } = {}) {
    const a = this._resolveKeyframe(branchA, Number(tick) | 0);
    const b = this._resolveKeyframe(branchB || this.activeBranchId, Number(tick) | 0);
    if (!a || !b) throw new RatCoreError('RC-104', 'Не удалось сравнить ветки: отсутствует снимок', 'Проверь идентификаторы веток.');
    const entA = (a.snapshot.entities || []).length;
    const entB = (b.snapshot.entities || []).length;
    return {
      tick: Number(tick) | 0,
      branchA: { id: branchA, entities: entA, keyframeTick: a.tick },
      branchB: { id: branchB || this.activeBranchId, entities: entB, keyframeTick: b.tick },
      entityCountDelta: entB - entA,
      patchA: this.branches.get(branchA)?.patchParams || {},
      patchB: this.branches.get(branchB || this.activeBranchId)?.patchParams || {},
    };
  }

  summary() {
    return {
      activeBranchId: this.activeBranchId,
      keyframeInterval: this.keyframeInterval,
      branches: [...this.branches.values()].map((b) => ({
        id: b.id,
        label: b.label,
        parentId: b.parentId,
        forkTick: b.forkTick,
        keyframes: b.keyframes.size,
      })),
    };
  }
}

// 2. Автобалансировщик игр и детектор эксплойтов (F-145..F-148, A-97..A-98)
export function runAutoBalance({
  runs = 200,
  seed = 1337,
  strategies = ['aggro', 'defense', 'economy', 'stealth'],
  params = { aggroDmg: 1.45, defenseArmor: 1.0, economyRate: 1.05, stealthCrit: 0.95 },
  evaluator = null,
} = {}) {
  const nRuns = clamp(Number(runs) | 0, 20, 2000);
  const stratList = Array.isArray(strategies) && strategies.length >= 2 ? strategies : ['aggro', 'defense', 'economy', 'stealth'];
  const paramKeys = Object.keys(params);
  const rng = createRng(seed);

  function simulateBatch(pObj, localRng, count) {
    const wins = Object.fromEntries(stratList.map((s) => [s, 0]));
    for (let i = 0; i < count; i++) {
      let bestS = stratList[0];
      let bestScore = -Infinity;
      for (let si = 0; si < stratList.length; si++) {
        const s = stratList[si];
        const sScore = typeof evaluator === 'function'
          ? evaluator(s, pObj, localRng)
          : ((Number(pObj[paramKeys[si % paramKeys.length]] ?? 1.0)) * (0.72 + localRng.next() * 0.56));
        if (sScore > bestScore) {
          bestScore = sScore;
          bestS = s;
        }
      }
      wins[bestS]++;
    }
    const rates = {};
    for (const s of stratList) rates[s] = wins[s] / count;
    return { wins, rates };
  }

  function computeMetrics(rates) {
    const vals = Object.values(rates);
    const maxRate = Math.max(...vals);
    const ideal = 1 / vals.length;
    // F-145: Индекс доминирования стратегий (0 = идеальный баланс, 1 = полная автопобеда)
    const dominanceIndex = clamp((maxRate - ideal) / Math.max(1e-6, 1 - ideal), 0, 1);
    // F-146: Нормализованная энтропия мета-игры Шеннона (1 = все стратегии равножизнеспособны)
    let h = 0;
    for (const p of vals) if (p > 1e-9) h -= p * Math.log2(p);
    const metaEntropy = h / Math.log2(vals.length);
    // F-148: Сводный фитнес баланса (0..1)
    const balanceFitness = clamp(0.55 * metaEntropy + 0.45 * (1 - dominanceIndex), 0, 1);
    return {
      dominanceIndex: Number(dominanceIndex.toFixed(4)),
      metaEntropy: Number(metaEntropy.toFixed(4)),
      balanceFitness: Number(balanceFitness.toFixed(4)),
    };
  }

  const baseSim = simulateBatch(params, rng, nRuns);
  const baseMetrics = computeMetrics(baseSim.rates);

  // F-147: оценка чувствительности и поиск рекомендуемого дифф-патча баланса
  const suggestedParams = { ...params };
  const sensitivity = {};
  const ideal = 1 / stratList.length;
  for (let i = 0; i < paramKeys.length; i++) {
    const key = paramKeys[i];
    const strat = stratList[i % stratList.length];
    const rate = baseSim.rates[strat];
    const delta = rate - ideal;
    sensitivity[key] = Number((delta * 2.0).toFixed(4));
    // Корректируем доминирующие параметры вниз, слабые — вверх
    const currentVal = Number(params[key]);
    if (Number.isFinite(currentVal)) {
      const factor = clamp(1 - delta * 0.72, 0.55, 1.45);
      suggestedParams[key] = Number((currentVal * factor).toFixed(3));
    }
  }

  const afterSim = simulateBatch(suggestedParams, createRng(seed ^ 0x55aa), nRuns);
  const afterMetrics = computeMetrics(afterSim.rates);

  return {
    runs: nRuns,
    seed,
    winRates: Object.fromEntries(Object.entries(baseSim.rates).map(([k, v]) => [k, Number(v.toFixed(4))])),
    ...baseMetrics,
    sensitivity,
    suggestedPatch: suggestedParams,
    projectedWinRates: Object.fromEntries(Object.entries(afterSim.rates).map(([k, v]) => [k, Number(v.toFixed(4))])),
    projectedFitness: afterMetrics.balanceFitness,
    improved: afterMetrics.balanceFitness >= baseMetrics.balanceFitness,
  };
}

export function findBalanceExploits(options = {}) {
  const report = runAutoBalance(options);
  const exploits = [];
  const stratCount = Object.keys(report.winRates).length;
  const threshold = Math.min(0.85, (1 / stratCount) + 0.22);
  for (const [strategy, rate] of Object.entries(report.winRates)) {
    if (rate >= threshold) {
      exploits.push({
        kind: 'auto-win-strategy',
        strategy,
        winRate: rate,
        severity: rate >= 0.65 ? 'critical' : 'warning',
        recommendation: `Снизь эффективность параметров стратегии «${strategy}» (см. suggestedPatch).`,
      });
    }
  }
  return {
    exploitsFound: exploits.length,
    exploits,
    dominanceIndex: report.dominanceIndex,
    metaEntropy: report.metaEntropy,
    suggestedPatch: report.suggestedPatch,
    projectedFitness: report.projectedFitness,
    seed: report.seed,
  };
}

// 3. Контроллер оверлея RatStudio (F-169, A-112..A-113)
export class RatStudioController {
  constructor() {
    this.isOpen = false;
    this.panels = ['inspector', 'timeline', 'balancer', 'exporter'];
    this.frameOverheadBudgetMs = 0.8; // F-169
    this.timeline = new TimelineDebugger();
  }

  open({ panels = ['inspector', 'timeline', 'balancer', 'exporter'] } = {}) {
    const allowed = ['inspector', 'timeline', 'balancer', 'exporter'];
    this.panels = (Array.isArray(panels) ? panels : allowed).filter((p) => allowed.includes(p));
    if (this.panels.length === 0) this.panels = ['inspector'];
    this.isOpen = true;
    return {
      open: true,
      panels: [...this.panels],
      frameOverheadBudgetMs: this.frameOverheadBudgetMs,
      devOnlyStripInRelease: true,
    };
  }

  close() {
    this.isOpen = false;
    return { open: false };
  }

  inspectScene({ entities = [], vaultStats = {}, governorStats = {}, profile = {} } = {}) {
    let totalTris = 0;
    const inspected = entities.map((e) => {
      const tris = e.mesh?.triCount || 0;
      totalTris += tris;
      return { id: e.id, tag: e.tag, pos: [e.x, e.y, e.h], triCount: tris, sealedMeshId: e.mesh?.id || null };
    });
    return {
      entityCount: entities.length,
      totalTris,
      vaultStats,
      governorCpuCapPct: governorStats?.profile?.targetCpuPct ?? 75,
      estBundleKB: profile.estBundleKB ?? 32,
      savingsPct: profile.savingsPct ?? 0,
      entities: inspected,
    };
  }
}
