// ЕДИНЫЙ Command API: все приказы игрока, автопилота и ИИ врага идут здесь, с задержкой радио.
import { dist, clamp } from '../core/mathx.js';
import { orderLabel } from './squads.js';

export const SOURCE_LABEL = {
  player: 'игрок', autopilot: 'автопилот', enemyAI: 'ИИ врага',
  rules: 'правило', system: 'система',
};

export class CommandAPI {
  constructor(game) {
    this.game = game;
    this.nextId = 1;
    this.orders = [];
    this.journal = [];
    this.seq = 0;
    this.stats = { issued: 0, accepted: 0, refused: 0, cancelled: 0 };
  }

  issue({ source = 'system', type, faction = 0, squadIds = [], unitIds = [], target = null, params = {}, priority = 1, reason = '' }) {
    const game = this.game;
    const order = {
      id: this.nextId++, source, type, faction,
      squadIds: [...squadIds], unitIds: [...unitIds],
      target, params, priority, reason,
      issuedAt: game.time, delay: this.computeDelay(source, faction, squadIds, target, unitIds),
      status: 'queued', result: '', accepted: null, doneAt: null,
    };
    order.deliverAt = game.time + order.delay;
    this.orders.push(order);
    this.stats.issued++;
    this.seq++;
    game.events.emit('orderIssued', { order, t: game.time });
    return order;
  }

  computeDelay(source, faction, squadIds, target, unitIds) {
    const game = this.game;
    const cfg = game.cfg.ai.radio;
    let from = null;
    if (squadIds.length) {
      const sq = game.squads.get(squadIds[0]);
      if (sq) from = sq.centroid();
    } else if (unitIds.length) {
      const u = game.unitById(unitIds[0]);
      if (u) from = { x: u.x, y: u.y };
    } else if (game.world && game.world.hqOf) {
      const hq = game.world.hqOf(faction);
      if (hq) from = { x: hq.x, y: hq.y };
    }
    let d = 0;
    if (from && target && target.x != null) d = dist(from.x, from.y, target.x, target.y);
    const radio = (game.modsFor(faction).radio_speed_mult || 1);
    const reaction = game.difficulty.reaction || 1;
    let delay = (d / (cfg.speedPxPerSec * radio)) + cfg.baseReaction * reaction + game.rng.range(0, 0.4);
    if (source === 'rules') delay *= 0.8;
    return clamp(delay, 0.2, cfg.maxDelay);
  }

  update() {
    const game = this.game;
    for (const order of this.orders) {
      if (order.status !== 'queued' || game.time < order.deliverAt) continue;
      this.deliver(order);
    }
    if (this.orders.length > 400) {
      const done = this.orders.filter((o) => o.status !== 'queued');
      this.orders = this.orders.filter((o) => o.status === 'queued').concat(done.slice(-120));
    }
  }

  deliver(order) {
    const game = this.game;
    order.deliveredAt = game.time;
    let results = [];
    if (order.squadIds.length) {
      for (const id of order.squadIds) {
        const sq = game.squads.get(id);
        if (!sq || sq.state === 'destroyed') { results.push({ accepted: false, reason: 'отряд расформирован' }); continue; }
        results.push(sq.receiveOrder(order, this));
      }
    } else if (order.type === 'create_squad' || order.type === 'produce' || order.type === 'build_profile'
      || order.type === 'set_autopilot' || order.type === 'upgrade' || order.type === 'place_build' || order.type === 'demolish') {
      results.push(game.executeCommand(order));
    } else if (order.unitIds.length) {
      results = this.deliverToUnits(order);
    } else {
      results.push({ accepted: false, reason: 'нет исполнителей' });
    }
    const ok = results.length > 0 && results.every((r) => r.accepted);
    order.accepted = ok;
    order.status = ok ? 'accepted' : 'refused';
    order.result = ok ? (results[0]?.reason || '') : (results.find((r) => !r.accepted)?.reason || 'отказ');
    if (ok) this.stats.accepted++; else this.stats.refused++;
    const entry = {
      t: game.time, orderId: order.id, source: order.source, sourceLabel: SOURCE_LABEL[order.source] || order.source,
      type: order.type, label: orderLabel(order.type), faction: order.faction,
      result: order.status, reason: order.result, delay: order.delay,
      actors: order.squadIds.map((id) => game.squads.get(id)?.name).filter(Boolean),
    };
    this.journal.push(entry);
    if (this.journal.length > 240) this.journal.shift();
    game.events.emit(ok ? 'orderAccepted' : 'orderRefused', { order, entry, t: game.time });
    if (order.squadIds.length) {
      game.sound(ok ? 'radio_ack' : 'radio_refuse', order.target?.x ?? 0, order.target?.y ?? 0);
    }
    game.alertLog.push({
      kind: ok ? 'order' : 'refusal',
      text: `${SOURCE_LABEL[order.source] || order.source}: ${orderLabel(order.type)} — ${ok ? 'принято' : order.result}`,
      x: order.target?.x, y: order.target?.y, t: game.time,
    });
    if (game.alertLog.length > 120) game.alertLog.shift();
  }

  deliverToUnits(order) {
    const game = this.game;
    const results = [];
    for (const id of order.unitIds) {
      const u = game.unitById(id);
      if (!u || !u.alive) { results.push({ accepted: false, reason: 'юнит недоступен' }); continue; }
      switch (order.type) {
        case 'move':
        case 'build':
        case 'repair':
        case 'supply':
          u.goal = { x: order.target.x, y: order.target.y };
          u.order = order;
          u.stuck = 0;
          results.push({ accepted: true, reason: '' });
          break;
        case 'hold':
          u.goal = null;
          results.push({ accepted: true, reason: '' });
          break;
        default:
          results.push({ accepted: false, reason: 'тип приказа не для юнита' });
      }
    }
    return results;
  }

  cancel(orderId, by = 'player') {
    const order = this.orders.find((o) => o.id === orderId);
    if (!order || order.status !== 'queued') return false;
    order.status = 'cancelled';
    order.result = 'отменён';
    this.stats.cancelled++;
    this.journal.push({ t: this.game.time, orderId, source: order.source, sourceLabel: SOURCE_LABEL[order.source], type: order.type, label: orderLabel(order.type), faction: order.faction, result: 'cancelled', reason: `отменён (${by})`, delay: order.delay, actors: [] });
    return true;
  }

  queueFor(faction) {
    return this.orders.filter((o) => o.faction === faction && o.status === 'queued');
  }

  recent(n = 12) { return this.journal.slice(-n).reverse(); }
}
