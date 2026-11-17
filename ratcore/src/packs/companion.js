// RatCore Pack [pack:companion] — Локальный ИИ-Напарник (NLU RU/EN + зрение see + слух hear + доверие, F-161..F-162, A-107)
// Подключается строго по выбору (Zero-Cost Opt-In, RC-108 когда пакет выключен).

import { clamp } from '../core/math.js';
import { RatCoreError } from '../core/seal.js';

const INTENT_RULES = [
  { intent: 'cover', re: /(прикрой|защит|охраняй|cover|guard|defend)/i },
  { intent: 'build', re: /(построй|возвед|мост|укреп|build|construct|bridge)/i },
  { intent: 'follow', re: /(иди за мной|следом|рядом|follow|come with)/i },
  { intent: 'scout', re: /(развед|проверь|осмотр|scout|recon|check)/i },
  { intent: 'gather', re: /(добудь|собери|принеси|дерев|камн|gather|collect|chop|mine)/i },
  { intent: 'hold', re: /(стой|держи|жди|позиц|hold|stay|wait)/i },
  { intent: 'heal', re: /(лечи|аптечк|помоги|heal|medkit|revive)/i },
];

const DIR_RULES = [
  { dir: 'left', dx: -1, dy: 0, re: /(слева|налево|левый|left|west|запад)/i },
  { dir: 'right', dx: 1, dy: 0, re: /(справа|направо|правый|right|east|восток)/i },
  { dir: 'north', dx: 0, dy: 1, re: /(север|вперёд|вперед|прямо|north|ahead|front)/i },
  { dir: 'south', dx: 0, dy: -1, re: /(юг|сзади|назад|тыл|south|back|behind)/i },
];

export function parseNaturalCommand(text = '') {
  const raw = String(text || '').trim();
  let intent = 'assist';
  let confidence = 0.45;
  for (const r of INTENT_RULES) {
    if (r.re.test(raw)) {
      intent = r.intent;
      confidence = 0.92;
      break;
    }
  }
  let direction = 'here';
  let dirVec = { dx: 0, dy: 0 };
  for (const d of DIR_RULES) {
    if (d.re.test(raw)) {
      direction = d.dir;
      dirVec = { dx: d.dx, dy: d.dy };
      confidence = Math.min(0.99, confidence + 0.05);
      break;
    }
  }
  const targetMatch = raw.match(/(мост|дерево|камень|башню|север|базу|bridge|wood|stone|tower|base)/i);
  return {
    raw,
    intent,
    direction,
    dirVec,
    target: targetMatch ? targetMatch[1].toLowerCase() : null,
    confidence: Number(confidence.toFixed(2)),
  };
}

export class CompanionAiSystem {
  constructor() {
    this.companions = new Map();
  }

  spawn({ id = 'buddy-1', name = 'Барсик', personality = 'tactical', x = 0, y = 0, h = 1, skills = ['scout', 'build', 'cover'] } = {}) {
    const comp = {
      id: String(id),
      name: String(name),
      personality: String(personality),
      x: Number(x),
      y: Number(y),
      h: Number(h),
      skills: [...skills],
      trust: 0.72, // F-161: индекс доверия 0..1
      morale: 0.85,
      state: 'idle',
      activePlan: [],
      lastDecision: null,
      memory: [],
    };
    this.companions.set(comp.id, comp);
    return { ...comp };
  }

  order({ companionId = 'buddy-1', text = '', playerPos = { x: 0, y: 0, h: 1 }, visibleEntities = [], heardEvents = [] } = {}) {
    const comp = this.companions.get(companionId);
    if (!comp) {
      throw new RatCoreError('RC-104', `Напарник "${companionId}" не найден`, 'Сначала создай напарника через coopAi.spawn().');
    }
    const parsed = parseNaturalCommand(text);
    const hasSkill = comp.skills.includes(parsed.intent) || parsed.intent === 'follow' || parsed.intent === 'hold' || parsed.intent === 'assist';

    // F-161..F-162: оценка опасности по зрению/слуху и готовности выполнить приказ
    const loudThreat = heardEvents.find((e) => (e.perceivedDb ?? 0) >= 65 || /explosion|shot|alarm/i.test(String(e.kind || '')));
    const threatLevel = loudThreat ? 0.65 : (visibleEntities.length > 8 ? 0.35 : 0.12);
    const complianceScore = clamp(comp.trust * 0.7 + (hasSkill ? 0.3 : 0.1) - threatLevel * 0.25, 0.1, 1.0);

    const targetX = Number((playerPos.x + parsed.dirVec.dx * 6).toFixed(2));
    const targetY = Number((playerPos.y + parsed.dirVec.dy * 6).toFixed(2));
    const steps = [];
    if (loudThreat && parsed.intent !== 'cover') {
      steps.push({ action: 'alert-check', note: `Зафиксирован громкий звук (${loudThreat.kind || 'шум'}) — повышенная осторожность` });
    }
    steps.push({ action: `move-to`, x: targetX, y: targetY });
    steps.push({ action: parsed.intent, direction: parsed.direction, target: parsed.target || 'area' });

    comp.state = `executing:${parsed.intent}`;
    comp.activePlan = steps;
    comp.trust = clamp(Number((comp.trust + 0.03).toFixed(3)), 0, 1);

    const reasonParts = [
      `Понял команду «${parsed.raw || parsed.intent}» (уверенность ${Math.round(parsed.confidence * 100)}%).`,
      `Направление: ${parsed.direction}, целевая точка (${targetX}; ${targetY}).`,
      loudThreat
        ? `Слышу «${loudThreat.kind}» (${loudThreat.perceivedDb ?? '?'} дБ), поэтому сначала прикрываю фланг.`
        : `В поле зрения ${visibleEntities.length} объектов, путь чист.`,
    ];

    comp.lastDecision = {
      intent: parsed.intent,
      direction: parsed.direction,
      complianceScore: Number(complianceScore.toFixed(3)),
      trust: comp.trust,
      plan: steps,
      explanation: reasonParts.join(' '),
    };
    comp.memory.push({ at: Date.now(), cmd: parsed.raw, intent: parsed.intent });
    if (comp.memory.length > 32) comp.memory.shift();

    return {
      companionId: comp.id,
      parsed,
      state: comp.state,
      ...comp.lastDecision,
    };
  }

  step({ companionId = 'buddy-1', dt = 0.5, speed = 4 } = {}) {
    const comp = this.companions.get(companionId);
    if (!comp) throw new RatCoreError('RC-104', `Напарник "${companionId}" не найден`, 'Сначала вызови coopAi.spawn().');
    if (comp.activePlan.length === 0) {
      comp.state = 'idle';
      return { companionId: comp.id, state: comp.state, x: comp.x, y: comp.y, remainingSteps: 0 };
    }
    const step = comp.activePlan[0];
    if (step.action === 'move-to') {
      const dx = step.x - comp.x;
      const dy = step.y - comp.y;
      const dist = Math.hypot(dx, dy);
      const maxMove = Math.max(0.1, Number(speed) * Number(dt));
      if (dist <= maxMove) {
        comp.x = step.x;
        comp.y = step.y;
        comp.activePlan.shift();
      } else {
        comp.x = Number((comp.x + (dx / dist) * maxMove).toFixed(3));
        comp.y = Number((comp.y + (dy / dist) * maxMove).toFixed(3));
      }
    } else {
      comp.activePlan.shift();
    }
    if (comp.activePlan.length === 0) comp.state = 'ready';
    return {
      companionId: comp.id,
      state: comp.state,
      x: comp.x,
      y: comp.y,
      remainingSteps: comp.activePlan.length,
    };
  }

  explainLastAction({ companionId = 'buddy-1' } = {}) {
    const comp = this.companions.get(companionId);
    if (!comp) throw new RatCoreError('RC-104', `Напарник "${companionId}" не найден`, 'Сначала вызови coopAi.spawn().');
    if (!comp.lastDecision) {
      return { companionId: comp.id, explanation: `${comp.name} ждёт твоих указаний.`, trust: comp.trust };
    }
    return { companionId: comp.id, name: comp.name, ...comp.lastDecision };
  }
}
