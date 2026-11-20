// Compact, side-local experience for the normal strategic AI. Events are own
// squad retreats and own captures only; no enemy location or hidden state is
// stored. Sector statistics describe past events, not a prediction of victory.
const PREFIX = 'frontline.battle-memory.v1.side-';
const RECENT_SECONDS = 180, MAX_COUNT = 64;

function fingerprint(world) {
  // Never apply sector IDs from a different map geometry.
  let h = 2166136261;
  const text = `${world.W}|${world.H}|` + world.sectors.map(s => `${s.id},${s.cx},${s.cy}`).join(';');
  for (let i = 0; i < text.length; i++) { h ^= text.charCodeAt(i); h = Math.imul(h, 16777619); }
  return (h >>> 0).toString(16);
}

export class BattleMemory {
  constructor(game, { storage = null, enabled = true } = {}) {
    this.game = game;
    this.enabled = [!!enabled, !!enabled];
    this.storage = storage;
    this.persistent = !!storage;
    this.map = fingerprint(game.world);
    this.history = [new Map(), new Map()];
    this.recent = [new Map(), new Map()];
    // Avoid learning the same squad's old losses repeatedly if its retreat
    // state oscillates or it is reissued another order.
    this.recordedLosses = [new Map(), new Map()];
    for (const f of [0, 1]) this.load(f);
  }
  storageFailed() {
    this.storage = null; this.persistent = false;
    this.game.alertLog?.push({ kind: 'refusal', text: 'Память ИИ не сохраняется: доступна только в текущем бою', t: this.game.time });
  }
  load(f) {
    if (!this.storage) return;
    let raw;
    try { raw = this.storage.getItem(PREFIX + f); } catch { this.storageFailed(); return; }
    if (!raw || raw.length > 16000) return;
    let data;
    try { data = JSON.parse(raw); } catch { return; }
    if (data?.version !== 1 || data.map !== this.map || !Array.isArray(data.entries) || data.entries.length > this.game.world.sectors.length) return;
    for (const e of data.entries) {
      if (!Number.isSafeInteger(e?.id) || !this.game.world.sectorById(e.id) || this.history[f].has(e.id)) continue;
      if (!Number.isSafeInteger(e.retreats) || e.retreats < 0 || e.retreats > MAX_COUNT || !Number.isSafeInteger(e.captures) || e.captures < 0 || e.captures > MAX_COUNT) continue;
      this.history[f].set(e.id, { retreats: e.retreats, captures: e.captures });
    }
  }
  record(f, id, type) {
    if (!this.enabled[f] || !this.game.world.sectorById(id)) return;
    const h = this.history[f].get(id) || { retreats: 0, captures: 0 };
    if (h.retreats + h.captures >= MAX_COUNT) {
      h.retreats = Math.floor(h.retreats / 2); h.captures = Math.floor(h.captures / 2);
    }
    h[type]++; this.history[f].set(id, h);
    try {
      if (this.storage) this.storage.setItem(PREFIX + f, JSON.stringify({ version: 1, map: this.map, entries: [...this.history[f]].map(([id, v]) => ({ id, ...v })) }));
    } catch { this.storageFailed(); }
  }
  onRetreat(sq) {
    if (!sq || ![0, 1].includes(sq.faction) || !this.enabled[sq.faction] || sq.objective?.type !== 'capture') return;
    if (!['enemyAI', 'autopilot'].includes(sq.order?.source) || sq.order.faction !== sq.faction || sq.losses() < 0.3) return;
    const p = sq.centroid(), target = sq.objective;
    // Do not attribute losses on the way across the map to a distant target.
    if (!Number.isFinite(target.x) || !Number.isFinite(target.y) || Math.hypot(p.x - target.x, p.y - target.y) > 600) return;
    const sector = this.game.world.sectorAt(target.x, target.y); if (!sector) return;
    const losses = sq.stats?.losses;
    if (!Number.isSafeInteger(losses) || losses <= (this.recordedLosses[sq.faction].get(sq.id) || 0)) return;
    const seen = this.recordedLosses[sq.faction];
    seen.delete(sq.id); seen.set(sq.id, losses);
    if (seen.size > 256) seen.delete(seen.keys().next().value);
    const r = this.recent[sq.faction].get(sector.id);
    const count = r && this.game.time - r.at <= RECENT_SECONDS ? Math.min(4, r.count + 1) : 1;
    this.recent[sq.faction].set(sector.id, { count, at: this.game.time });
    this.record(sq.faction, sector.id, 'retreats');
  }
  onCapture(point, faction) {
    if (![0, 1].includes(faction) || !this.enabled[faction] || !point) return;
    const sector = this.game.world.sectorAt(point.x, point.y); if (!sector) return;
    this.recent[faction].delete(sector.id);
    this.record(faction, sector.id, 'captures');
  }
  attackPenalty(faction, id) {
    if (!this.enabled[faction]) return 0;
    const r = this.recent[faction].get(id);
    const recent = r && this.game.time >= r.at && this.game.time - r.at <= RECENT_SECONDS ? r.count : 0;
    const h = this.history[faction].get(id);
    // Historical events alone are weak evidence: conditions can change between
    // battles. Prefer alternatives, never forbid attack, and let old evidence
    // shrink as new observations arrive.
    const history = h && h.retreats >= 2 ? Math.max(0, (h.retreats - h.captures) / (h.retreats + h.captures + 2)) : 0;
    return Math.min(0.45, recent * 0.12 + history * 0.15);
  }
  saveRecent() {
    return { version: 1, map: this.map, sides: this.recent.map(m => [...m].map(([id, r]) => ({ id, ...r }))),
      recordedLosses: this.recordedLosses.map(m => [...m].map(([id, losses]) => ({ id, losses }))) };
  }
  restoreRecent(data) {
    if (data?.version !== 1 || data.map !== this.map || !Array.isArray(data.sides) || data.sides.length !== 2) return;
    for (const f of [0, 1]) {
      if (!Array.isArray(data.sides[f]) || data.sides[f].length > this.game.world.sectors.length) continue;
      const valid = new Map();
      for (const e of data.sides[f]) {
        if (!Number.isSafeInteger(e?.id) || !this.game.world.sectorById(e.id) || valid.has(e.id) || !Number.isSafeInteger(e.count) || e.count < 1 || e.count > 4 || !Number.isFinite(e.at) || e.at < 0 || e.at > this.game.time) continue;
        if (this.game.time - e.at <= RECENT_SECONDS) valid.set(e.id, { count: e.count, at: e.at });
      }
      this.recent[f] = valid;
      const recorded = data.recordedLosses?.[f];
      if (Array.isArray(recorded) && recorded.length <= 256) {
        const seen = new Map();
        for (const e of recorded) {
          const squad = this.game.squads.get(e?.id);
          if (!squad || squad.faction !== f || !Number.isSafeInteger(e.losses) || e.losses < 1 || e.losses > squad.stats.losses || seen.has(e.id)) continue;
          seen.set(e.id, e.losses);
        }
        this.recordedLosses[f] = seen;
      }
    }
  }
}
