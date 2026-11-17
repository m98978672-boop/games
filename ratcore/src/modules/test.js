// RatCore Module [test] — Автотесты, проверка инвариантов сцены, фаззер и автобалансировщик (Уровень 1 Opt-In)

import { createRng } from '../core/math.js';
import { runAutoBalance, findBalanceExploits } from '../packs/studio.js';

export class TestAutomationSuite {
  constructor() {
    this.runsCompleted = 0;
  }

  // Проверка геометрических и структурных инвариантов мира
  checkInvariants({ entities = [], heightField, vault } = {}) {
    const violations = [];
    for (const e of entities) {
      if (!Number.isFinite(e.x) || !Number.isFinite(e.y) || !Number.isFinite(e.h)) {
        violations.push({ entityId: e.id, code: 'RC-403', reason: 'NaN/Infinity в координатах сущности' });
      }
      if (heightField) {
        const ground = heightField.sampleHeight(e.x, e.y);
        if (e.h < ground - 0.5) {
          violations.push({ entityId: e.id, code: 'RC-402', reason: `Сущность провалилась под рельеф (h=${e.h.toFixed(2)} < H=${ground.toFixed(2)})` });
        }
      }
      if (vault && e.mesh && !vault.isSealedMesh(e.mesh)) {
        violations.push({ entityId: e.id, code: 'RC-101', reason: 'Неподписанный меш в сцене' });
      }
    }
    this.runsCompleted++;
    return { ok: violations.length === 0, entitiesChecked: entities.length, violations };
  }

  // Детерминированный фаззер перемещений по сцене
  fuzzWalk({ steps = 50, seed = 777, heightField } = {}) {
    const rng = createRng(seed);
    let x = 0;
    let y = 0;
    let maxSlope = 0;
    let minH = Infinity;
    let maxH = -Infinity;
    for (let i = 0; i < steps; i++) {
      const prevH = heightField ? heightField.sampleHeight(x, y) : 1;
      const dx = (rng.next() * 2 - 1) * 2.5;
      const dy = (rng.next() * 2 - 1) * 2.5;
      x = Math.max(-14, Math.min(14, x + dx));
      y = Math.max(-14, Math.min(14, y + dy));
      const h = heightField ? heightField.sampleHeight(x, y) : 1;
      const dist = Math.hypot(dx, dy) || 1;
      maxSlope = Math.max(maxSlope, Math.abs(h - prevH) / dist);
      minH = Math.min(minH, h);
      maxH = Math.max(maxH, h);
    }
    this.runsCompleted++;
    return {
      ok: Number.isFinite(minH) && Number.isFinite(maxH),
      steps,
      seed,
      finalPos: [Number(x.toFixed(2)), Number(y.toFixed(2))],
      minH: Number(minH.toFixed(3)),
      maxH: Number(maxH.toFixed(3)),
      maxSlope: Number(maxSlope.toFixed(3)),
    };
  }

  autoBalance(args = {}) {
    this.runsCompleted++;
    return runAutoBalance(args);
  }

  findExploits(args = {}) {
    this.runsCompleted++;
    return findBalanceExploits(args);
  }
}
