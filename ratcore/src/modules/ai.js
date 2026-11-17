// RatCore Module [ai] — Игровой ИИ (Utility AI, GOAP-планировщик и локальный NLU, Уровень 1 Opt-In)

import { clamp } from '../core/math.js';
import { parseNaturalCommand } from '../packs/companion.js';

export class GameAiSystem {
  constructor() {
    this.agents = new Map();
  }

  registerAgent({ id = 'npc-1', role = 'guard', hp = 100, ammo = 30, energy = 100 } = {}) {
    const agent = {
      id: String(id),
      role: String(role),
      hp: clamp(Number(hp), 0, 100),
      ammo: Math.max(0, Number(ammo)),
      energy: clamp(Number(energy), 0, 100),
      lastAction: 'idle',
    };
    this.agents.set(agent.id, agent);
    return { ...agent };
  }

  // Utility AI: выбирает оптимальное действие по кривым полезности
  evaluateUtility({ id = 'npc-1', enemyDist = 30, coverDist = 6, medkitDist = 12 } = {}) {
    const a = this.agents.get(id) || this.registerAgent({ id });
    const hpNorm = a.hp / 100;
    const ammoNorm = clamp(a.ammo / 30, 0, 1);
    const threat = clamp(1 - enemyDist / 45, 0, 1);

    const scores = {
      retreat_heal: clamp((1 - hpNorm) * 1.15 - medkitDist * 0.015, 0, 1),
      take_cover: clamp(threat * (1.1 - hpNorm * 0.5) - coverDist * 0.02, 0, 1),
      engage: clamp(threat * ammoNorm * hpNorm * 1.1, 0, 1),
      reload: clamp((1 - ammoNorm) * 0.95, 0, 1),
      patrol: clamp((1 - threat) * (a.energy / 100) * 0.65, 0, 1),
    };

    let bestAction = 'patrol';
    let bestScore = -1;
    for (const [act, sc] of Object.entries(scores)) {
      if (sc > bestScore) {
        bestScore = sc;
        bestAction = act;
      }
    }
    a.lastAction = bestAction;
    return {
      agentId: a.id,
      chosenAction: bestAction,
      score: Number(bestScore.toFixed(3)),
      scores: Object.fromEntries(Object.entries(scores).map(([k, v]) => [k, Number(v.toFixed(3))])),
    };
  }

  // Простой GOAP-планировщик цепочки действий (BFS по булеву состоянию мира)
  planGoal({ state = {}, goal = {}, actions = [] } = {}) {
    const startKey = JSON.stringify(state);
    const queue = [{ state: { ...state }, plan: [] }];
    const visited = new Set([startKey]);

    const matchesGoal = (st) => Object.entries(goal).every(([k, v]) => st[k] === v);

    while (queue.length > 0 && visited.size < 256) {
      const cur = queue.shift();
      if (matchesGoal(cur.state)) {
        return { found: true, steps: cur.plan.length, plan: cur.plan };
      }
      for (const act of actions) {
        const pre = act.pre || {};
        if (!Object.entries(pre).every(([k, v]) => cur.state[k] === v)) continue;
        const nextState = { ...cur.state, ...(act.effect || {}) };
        const key = JSON.stringify(nextState);
        if (visited.has(key)) continue;
        visited.add(key);
        queue.push({ state: nextState, plan: [...cur.plan, act.name] });
      }
    }
    return { found: false, steps: 0, plan: [] };
  }

  nluParse({ text = '' } = {}) {
    return parseNaturalCommand(text);
  }
}
