// Influence map, захват точек и линия фронта. Правила одинаковы для обеих фракций.
import { clamp, dist, dist2 } from '../core/mathx.js';

export class InfluenceSystem {
  constructor(game) {
    this.game = game;
    this.acc = 0;
    this.front = [];
    this.captures = [];
    this.ownerSnapshot = game.world.points.map((p) => p.owner);
  }

  update(dt) {
    this.acc += dt;
    let guard = 0;
    while (this.acc >= this.game.cfg.ai.influence.interval && guard++ < 6) {
      this.acc -= this.game.cfg.ai.influence.interval;
      this.tick();
    }
  }

  tick() {
    const game = this.game;
    const world = game.world;
    const cfg = game.cfg.ai.influence;
    const power = this.collectSectorPower();
    for (const s of world.sectors) {
      const p = power.get(s.id) || { a: 0, b: 0 };
      const presence = Math.tanh((p.a - p.b) / 7);
      let buildings = 0, points = 0;
      for (const b of world.buildings) {
        if (!b.built || b.dead) continue;
        const sec = world.sectorAt(b.x, b.y);
        if (!sec || sec.id !== s.id) continue;
        if (b.faction === 0) buildings += 1;
        else if (b.faction === 1) buildings -= 1;
      }
      for (const pt of world.points) {
        const sec = world.sectorAt(pt.x, pt.y);
        if (!sec || sec.id !== s.id) continue;
        if (pt.owner === 0) points += 1;
        else if (pt.owner === 1) points -= 1;
      }
      let target = presence * 0.55 + clamp(buildings * cfg.buildingWeight, -0.4, 0.4) + clamp(points * cfg.pointWeight, -0.6, 0.6);
      // снабжение: отрезанный сектор слабеет (штраф ×0.5 к вкладу присутствия)
      const supplyA = game.logistics ? game.logistics.sectorSupplyFor(0, s.id) : 1;
      const supplyB = game.logistics ? game.logistics.sectorSupplyFor(1, s.id) : 1;
      if (supplyA < game.cfg.resources.supply.lowThreshold) target -= (1 - supplyA) * cfg.smoothing * 2;
      if (supplyB < game.cfg.resources.supply.lowThreshold) target += (1 - supplyB) * cfg.smoothing * 2;
      target = clamp(target, -1, 1);
      s.target = target;
      s.influence += (target - s.influence) * cfg.smoothing;
      s.influence = clamp(s.influence, -1, 1);
      s.units = [p.a, p.b];
      s.strength = [p.a, p.b];
      const prevOwner = s.owner;
      s.owner = s.influence > 0.15 ? 0 : s.influence < -0.15 ? 1 : -1;
      if (prevOwner !== s.owner && s.owner !== -1) {
        game.events.emit('sectorCaptured', { sector: s, faction: s.owner, t: game.time });
      }
      s.supplied = [supplyA, supplyB];
    }
    this.updateCapture();
    this.buildFront();
    this.ownerSnapshot = world.points.map((p) => p.owner);
  }

  collectSectorPower() {
    const map = new Map();
    const world = this.game.world;
    for (const u of this.game.units.values()) {
      if (!u.alive || u.downed) continue;
      const sec = world.sectorAt(u.x, u.y);
      if (!sec) continue;
      let e = map.get(sec.id);
      if (!e) { e = { a: 0, b: 0 }; map.set(sec.id, e); }
      if (u.faction === 0) e.a += u.power(); else e.b += u.power();
    }
    return map;
  }

  updateCapture() {
    const game = this.game;
    const cfg = game.cfg.ai.capture;
    for (const pt of game.world.points) {
      if (pt.structure && pt.structure.dead) continue;
      if (pt.type === 'bridge' && pt.hp <= 0) continue;
      let a = 0, b = 0;
      for (const u of game.unitsNear(pt.x, pt.y, pt.radius + 60)) {
        if (!u.alive || u.downed) continue;
        if (u.faction === 0) a += u.power(); else b += u.power();
      }
      let attacker = -1;
      if (a > 0 && a >= b * cfg.ratio) attacker = 0;
      else if (b > 0 && b >= a * cfg.ratio) attacker = 1;
      if (attacker === pt.owner) { pt.capture = Math.max(0, pt.capture - 0.5); pt.capturer = -1; continue; }
      if (attacker < 0) { pt.capture = Math.max(0, pt.capture - 0.35); continue; }
      if (pt.capturer !== attacker) { pt.capturer = attacker; pt.capture = 0; }
      // Крупные объекты держатся дольше мелких: штаб и город нельзя «пробежать» за семь секунд.
      // Ключевые города держатся дольше: их потеря = проигранная война, «пробежать» их нельзя.
      const secs = (cfg.secondsByType?.[pt.type] ?? cfg.seconds) * (pt.key ? (cfg.keyCityMult ?? 1) : 1);
      pt.capture = clamp(pt.capture + 1 / Math.max(1, secs), 0, 1);
      if (pt.capture >= 1) this.flipPoint(pt, attacker);
    }
  }

  flipPoint(pt, faction) {
    const game = this.game;
    const prev = pt.owner;
    pt.owner = faction;
    pt.capture = 0;
    pt.capturer = -1;
    pt.lastOwnerChange = game.time;
    this.lastCapture = { point: pt, faction, t: game.time };
    if (pt.structure) pt.structure.faction = faction;
    for (const b of game.world.buildings) {
      if (b.pointId === pt.id && !b.dead) b.faction = faction;
    }
    game.events.emit('pointCaptured', { point: pt, faction, prev, t: game.time });
    game.awardXP(faction, 'infantry', 'capture', 1);
    game.alertLog.push({
      kind: faction === game.playerFaction ? 'capture' : 'loss',
      text: `${pt.name}: ${faction === game.playerFaction ? 'захвачен' : 'потерян'}`,
      x: pt.x, y: pt.y, t: game.time,
    });
    if (game.alertLog.length > 120) game.alertLog.shift();
    game.sound(faction === game.playerFaction ? 'alert_capture' : 'alert_loss', pt.x, pt.y);
    if (game.logistics) game.logistics.onPointCaptured(pt, faction);
    // активная директива на эту точку считается выполненной
    if (game.strategic) for (const ai of game.strategic) ai.onPointCaptured(pt, faction);
  }

  buildFront() {
    const world = this.game.world;
    const front = [];
    const seen = new Set();
    for (const s of world.sectors) {
      for (const nid of s.neighbors) {
        const n = world.sectorById(nid);
        if (!n || n.id < s.id) continue;
        const key = s.id + ':' + n.id;
        if (seen.has(key)) continue;
        seen.add(key);
        const sa = Math.sign(s.influence), sb = Math.sign(n.influence);
        if (sa === 0 || sb === 0 || sa === sb) continue;
        const mx = (s.cx + n.cx) / 2, my = (s.cy + n.cy) / 2;
        const dx = n.cx - s.cx, dy = n.cy - s.cy;
        const len = Math.hypot(dx, dy) || 1;
        const px = -dy / len, py = dx / len;
        const half = this.game.cfg.sectors.hex.size * 0.52;
        front.push({
          ax: mx + px * half, ay: my + py * half,
          bx: mx - px * half, by: my - py * half,
          intensity: Math.min(1, Math.abs(s.influence - n.influence)),
        });
      }
    }
    this.front = front;
  }

  // Проверка линии фронта для стратегического ИИ: сектор на границе?
  isFrontSector(s) {
    if (!s) return false;
    if (Math.abs(s.influence) > 0.05) return true;
    return s.neighbors.some((nid) => {
      const n = this.game.world.sectorById(nid);
      return n && Math.abs(n.influence) > 0.2;
    });
  }
}
