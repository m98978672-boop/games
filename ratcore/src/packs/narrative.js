// RatCore Pack [pack:narrative] — ИИ-Режиссёр темпа + Летопись мира + Квесты без софтлоков (F-136..F-137, F-154..F-155, A-92, A-102..A-103)
// Подключается строго по выбору (Zero-Cost Opt-In, RC-108 когда пакет выключен).

import { clamp, createRng } from '../core/math.js';

const PHASES = Object.freeze(['build-up', 'peak', 'sustain', 'relax']);

export class NarrativeSuite {
  constructor(seed = 1337) {
    this.rng = createRng(seed);
    this.phaseIdx = 0;
    this.phaseTicks = 0;
    this.tension = 0.25;
    this.chronicle = [];
    this.factions = new Map();
    this.quests = new Map();
  }

  // F-136 / A-92: Шаг ИИ-Режиссёра темпа (Build-Up -> Peak -> Sustain -> Relax)
  directorTick({ playerHealthRatio = 1, activeThreats = 0, resourcesRatio = 0.7 } = {}) {
    this.phaseTicks++;
    const stress = clamp((1 - playerHealthRatio) * 0.55 + Math.min(1, activeThreats / 6) * 0.45, 0, 1);
    this.tension = Number(clamp(this.tension * 0.7 + stress * 0.3, 0, 1).toFixed(3));

    const currentPhase = PHASES[this.phaseIdx];
    let directive = 'ambient-calm';

    if (currentPhase === 'build-up') {
      directive = activeThreats < 2 ? 'spawn-scout-or-clue' : 'raise-atmosphere';
      if (this.tension >= 0.65 || this.phaseTicks >= 4) { this.phaseIdx = 1; this.phaseTicks = 0; }
    } else if (currentPhase === 'peak') {
      directive = playerHealthRatio > 0.35 ? 'trigger-climax-event' : 'ease-pressure';
      if (this.phaseTicks >= 3 || playerHealthRatio < 0.25) { this.phaseIdx = 2; this.phaseTicks = 0; }
    } else if (currentPhase === 'sustain') {
      directive = 'hold-tension';
      if (this.phaseTicks >= 2) { this.phaseIdx = 3; this.phaseTicks = 0; }
    } else {
      directive = resourcesRatio < 0.5 ? 'grant-supply-cache' : 'safe-breather';
      if (this.phaseTicks >= 3) { this.phaseIdx = 0; this.phaseTicks = 0; }
    }

    return { phase: PHASES[this.phaseIdx], tension: this.tension, directive };
  }

  addChronicle({ tick = 0, kind = 'event', summary = '', impact = 1 } = {}) {
    const entry = { id: `chr_${this.chronicle.length + 1}`, tick, kind, summary: String(summary), impact: Number(impact) };
    this.chronicle.push(entry);
    if (this.chronicle.length > 200) this.chronicle.shift();
    return entry;
  }

  setFactionRelation({ factionA, factionB, delta = 0 } = {}) {
    const key = [String(factionA), String(factionB)].sort().join('::');
    const prev = this.factions.get(key) ?? 0;
    const next = clamp(prev + Number(delta), -100, 100);
    this.factions.set(key, next);
    const stance = next >= 40 ? 'allied' : (next <= -40 ? 'hostile' : 'neutral');
    return { pair: key, relation: next, stance };
  }

  // F-154..F-155 / A-102..A-103: Генератор квеста + математическая проверка отсутствия софтлоков (BFS по графу состояний)
  generateQuest({ id, title, stages = null } = {}) {
    const qid = String(id || `quest_${this.quests.size + 1}`);
    const defaultStages = [
      { id: 'start', text: 'Найти зацепку в секторе', next: ['investigate', 'negotiate'] },
      { id: 'investigate', text: 'Осмотреть маяк и собрать данные', next: ['finale'] },
      { id: 'negotiate', text: 'Договориться с фракцией', next: ['finale'] },
      { id: 'finale', text: 'Завершить задание и получить награду', isGoal: true, next: [] },
    ];
    const nodes = Array.isArray(stages) && stages.length > 0 ? stages : defaultStages;
    const audit = this.verifyNoSoftlocks(nodes);
    const quest = {
      id: qid,
      title: String(title || `Операция #${this.quests.size + 1}`),
      stages: nodes,
      currentStage: nodes[0].id,
      softlockFree: audit.ok,
      audit,
    };
    this.quests.set(qid, quest);
    return quest;
  }

  // Математическая верификация графа квеста: каждая достижимая вершина обязана иметь путь к хотя бы одной цели isGoal!
  verifyNoSoftlocks(stages) {
    const byId = new Map(stages.map((s) => [s.id, s]));
    const goals = stages.filter((s) => s.isGoal).map((s) => s.id);
    if (!stages.length || !goals.length) {
      return { ok: false, reason: 'no-goal-stage', deadEnds: stages.map((s) => s.id) };
    }

    // 1. Прямой BFS от старта — какие состояния достижимы
    const reachable = new Set([stages[0].id]);
    const q = [stages[0].id];
    while (q.length) {
      const cur = byId.get(q.shift());
      if (!cur) continue;
      for (const nxt of cur.next || []) {
        if (byId.has(nxt) && !reachable.has(nxt)) {
          reachable.add(nxt);
          q.push(nxt);
        }
      }
    }

    // 2. Обратный BFS от всех целей — из каких состояний можно дойти до победы
    const rev = new Map();
    for (const s of stages) {
      for (const nxt of s.next || []) {
        if (!rev.has(nxt)) rev.set(nxt, []);
        rev.get(nxt).push(s.id);
      }
    }
    const canFinish = new Set(goals);
    const rq = [...goals];
    while (rq.length) {
      const cur = rq.shift();
      for (const prev of rev.get(cur) || []) {
        if (!canFinish.has(prev)) {
          canFinish.add(prev);
          rq.push(prev);
        }
      }
    }

    const deadEnds = [...reachable].filter((id) => !canFinish.has(id));
    const goalReachable = goals.some((g) => reachable.has(g));
    return {
      ok: goalReachable && deadEnds.length === 0,
      goalReachable,
      reachableCount: reachable.size,
      deadEnds,
    };
  }
}
