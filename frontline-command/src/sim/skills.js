// Прокачка: дерево навыков, агрегация модификаторов и эквивалентная «кривая» для ИИ.
// Единственное, что различает стороны — источник модификаторов, правила для всех одинаковы.
export class Skills {
  constructor(cfg, meta = {}) {
    this.cfg = cfg;
    this.learned = new Set(meta.learned || []);
    this.xp = meta.xp || 0;
    this.spent = meta.spent || 0;
    this.nodes = new Map(cfg.skills.nodes.map((n) => [n.id, n]));
    this.warCount = meta.warCount || 0;
  }

  node(id) { return this.nodes.get(id); }
  isLearned(id) { return this.learned.has(id); }
  requiresMet(id) {
    const n = this.nodes.get(id);
    if (!n) return false;
    return (n.requires || []).every((r) => this.learned.has(r));
  }
  canBuy(id) {
    const n = this.nodes.get(id);
    if (!n) return { ok: false, reason: 'нет такого навыка' };
    if (this.learned.has(id)) return { ok: false, reason: 'уже изучен' };
    if (!this.requiresMet(id)) return { ok: false, reason: 'не открыт: нужны предыдущие навыки' };
    if (this.xp < n.cost) return { ok: false, reason: `нужно ${n.cost} XP, есть ${Math.floor(this.xp)}` };
    return { ok: true };
  }
  buy(id) {
    const check = this.canBuy(id);
    if (!check.ok) return check;
    const n = this.nodes.get(id);
    this.xp -= n.cost;
    this.spent += n.cost;
    this.learned.add(id);
    return { ok: true, node: n };
  }

  mods() {
    const out = { spreads: {}, adds: {}, flags: {}, unlocks: [] };
    const agg = {};
    for (const id of this.learned) {
      const n = this.nodes.get(id);
      if (!n) continue;
      for (const [k, v] of Object.entries(n.effects || {})) {
        if (k.endsWith('_mult')) agg[k] = (agg[k] ?? 1) * v;
        else if (k.endsWith('_add')) agg[k] = (agg[k] ?? 0) + v;
        else if (k.startsWith('unlock_')) {
          const cur = agg[k];
          agg[k] = Array.isArray(v) ? [...(Array.isArray(cur) ? cur : []), ...v] : v;
        } else agg[k] = typeof v === 'number' ? Math.max(agg[k] ?? 0, v) : v;
      }
    }
    return agg;
  }

  serialize() {
    return { xp: this.xp, spent: this.spent, learned: [...this.learned], warCount: this.warCount };
  }

  branches() { return this.cfg.skills.branches; }
  nodesOf(branch) { return this.cfg.skills.nodes.filter((n) => n.branch === branch); }
}

// Эквивалент прокачки для ИИ-фракции: та же «стоимость» лимитов по кривой времени войны.
export function techMods(level) {
  const t = Math.max(0, Math.min(3, level));
  const mult = (base, step) => Math.pow(base, step);
  return {
    hp_add: 6 * t,
    spread_mult: mult(0.96, t),
    damage_mult: mult(1.04, t),
    squad_limit_add: t,
    directive_limit_add: t,
    rules_slots_add: t,
    radio_speed_mult: 1 + 0.12 * t,
    build_speed_mult: 1 + 0.12 * t,
    heal_speed_mult: 1 + 0.1 * t,
    drive_speed_mult: 1 + 0.08 * t,
    tank_armor_add: t,
  };
}

export function xpFor(cfg, kind, amount = 1) {
  return (cfg.skills.xpRewards[kind] || 0) * amount;
}
