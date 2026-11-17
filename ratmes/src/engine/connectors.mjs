// Изолированные акторы-мосты (Let it crash + супервизор + Lazy Wake + гибернация 50–200 МБ <-> 64 Б).
// Поддерживает единый контракт для всех 12 сетей (свой RatMes + VK, MAX, Telegram, WhatsApp, Discord, Viber, Signal, WeChat, LINE, KakaoTalk, Zalo).

import { MESSENGERS, getMessengerSpec } from './countries.mjs';
import { makeError } from '../core/errors.mjs';

export class BridgeSupervisor {
  constructor({ ratCoreApp }) {
    this.ratCoreApp = ratCoreApp;
    this.actors = new Map();

    // Изначально регистрируем все 12 сетей: родной RatMes и VK бодрствуют, редкие спят (Lazy Wake!)
    for (const spec of Object.values(MESSENGERS)) {
      const startActive = spec.id === 'ratmes' || spec.id === 'vk' || spec.id === 'max';
      this.register(spec.id, {
        mode: 'sandbox',
        startActive,
      });
    }
  }

  register(networkId, adapterSpec = {}) {
    const spec = getMessengerSpec(networkId);
    if (!spec) {
      return { ok: false, error: makeError('RM-405', `Неизвестный мессенджер: ${networkId}`) };
    }
    const startActive = Boolean(adapterSpec.startActive);
    const actor = {
      bridgeId: `bridge:${spec.id}`,
      network: spec.id,
      name: spec.name,
      state: startActive ? 'ACTIVE' : 'HIBERNATED',
      ramMb: startActive ? spec.ramIdleMb : 0.000064, // 64 байта сводки во сне
      accountState: 'ok',
      sessionHandleId: null,
      crashes: 0,
      restarts: 0,
      lastSeq: 0,
      sentCount: 0,
      rateLimit429: false,
      faultInjected: null, // 'crash' | '429' | 'session-expired' | 'account-check'
      customTransport: adapterSpec.customTransport || null,
    };
    this.actors.set(spec.id, actor);
    if (!startActive) {
      this.ratCoreApp.stream.sleepRegion(actor.bridgeId, { lastSeq: 0, unread: 0, ramFreedMb: spec.ramIdleMb });
    }
    return { ok: true, actor, capabilities: spec };
  }

  getActor(networkId) {
    return this.actors.get(networkId) || null;
  }

  listActors() {
    return Array.from(this.actors.values()).map((a) => ({
      bridgeId: a.bridgeId,
      network: a.network,
      name: a.name,
      state: a.state,
      ramMb: a.ramMb,
      accountState: a.accountState,
      crashes: a.crashes,
      restarts: a.restarts,
      lastSeq: a.lastSeq,
      sentCount: a.sentCount,
      rateLimit429: a.rateLimit429,
      faultInjected: a.faultInjected,
    }));
  }

  wake(networkId, reason = 'demand') {
    const actor = this.actors.get(networkId);
    const spec = getMessengerSpec(networkId);
    if (!actor || !spec) return { ok: false, error: makeError('RM-405', `Мост ${networkId} не найден`) };
    if (actor.state === 'ACTIVE') {
      return { ok: true, bridgeId: actor.bridgeId, ramMb: actor.ramMb, wakeMs: 0, alreadyActive: true };
    }
    const started = performance.now();
    const catchup = this.ratCoreApp.stream.catchupRegion(actor.bridgeId);
    actor.state = 'ACTIVE';
    actor.ramMb = spec.ramIdleMb;
    this.ratCoreApp.watch.emit('bridge.woke', { bridgeId: actor.bridgeId, reason, deltaTicks: catchup.deltaTicks });
    return {
      ok: true,
      bridgeId: actor.bridgeId,
      ramMb: actor.ramMb,
      wakeMs: Number((performance.now() - started).toFixed(3)),
      deltaTicks: catchup.deltaTicks,
    };
  }

  hibernate(networkId) {
    const actor = this.actors.get(networkId);
    const spec = getMessengerSpec(networkId);
    if (!actor || !spec) return { ok: false, error: makeError('RM-405', `Мост ${networkId} не найден`) };
    if (actor.network === 'ratmes') {
      return { ok: true, bridgeId: actor.bridgeId, freedMb: 0, summaryBytes: 64, keptHot: true };
    }
    const freedMb = actor.state === 'ACTIVE' ? actor.ramMb : 0;
    actor.state = 'HIBERNATED';
    actor.ramMb = 0.000064;
    this.ratCoreApp.stream.sleepRegion(actor.bridgeId, { lastSeq: actor.lastSeq, unread: 0, ramFreedMb: freedMb });
    this.ratCoreApp.watch.emit('bridge.hibernated', { bridgeId: actor.bridgeId, freedMb });
    return { ok: true, bridgeId: actor.bridgeId, freedMb, summaryBytes: 64 };
  }

  injectFault(networkId, fault) {
    const actor = this.actors.get(networkId);
    if (!actor) return false;
    actor.faultInjected = fault;
    if (fault === '429') actor.rateLimit429 = true;
    if (fault === 'session-expired') actor.accountState = 'expired';
    if (fault === 'account-check') actor.accountState = 'check_required';
    if (!fault) {
      actor.rateLimit429 = false;
      actor.accountState = 'ok';
    }
    return true;
  }

  authCheck(networkId, sessionHandle) {
    const actor = this.actors.get(networkId);
    if (!actor) return { ok: false, error: makeError('RM-405', `Мост ${networkId} не найден`) };
    if (actor.accountState === 'expired') {
      return { ok: false, error: makeError('RM-401', `Сессия ${actor.name} истекла — обнови авторизацию`) };
    }
    if (actor.accountState === 'check_required') {
      return { ok: false, error: makeError('RM-402', `Требуется проверка аккаунта ${actor.name}`) };
    }
    if (sessionHandle?.handleId) {
      actor.sessionHandleId = sessionHandle.handleId;
    }
    return {
      ok: true,
      valid: true,
      accountState: actor.accountState,
      sessionBound: Boolean(actor.sessionHandleId || networkId === 'ratmes'),
    };
  }

  // Let it crash: изолированный перезапуск упавшего моста без влияния на остальные сети
  supervise(networkId, faultReason = 'actor-exception') {
    const actor = this.actors.get(networkId);
    const spec = getMessengerSpec(networkId);
    if (!actor || !spec) return { ok: false, error: makeError('RM-405', `Мост ${networkId} не найден`) };
    actor.crashes += 1;
    actor.state = 'RESTARTING';
    const backoffMs = Math.min(8000, Math.round(250 * (2 ** Math.min(actor.crashes - 1, 5)) + this.ratCoreApp.rand() * 150));
    actor.faultInjected = null;
    actor.restarts += 1;
    actor.state = 'ACTIVE';
    actor.ramMb = spec.ramIdleMb;
    this.ratCoreApp.watch.emit('bridge.restarted', {
      bridgeId: actor.bridgeId,
      faultReason,
      crashes: actor.crashes,
      restarts: actor.restarts,
      backoffMs,
    });
    return {
      ok: true,
      restarted: true,
      bridgeId: actor.bridgeId,
      crashes: actor.crashes,
      restarts: actor.restarts,
      backoffMs,
    };
  }

  async deliverSealed({ networkId, envelopeRecord, routePlan, signedHeader }) {
    const actor = this.actors.get(networkId);
    if (!actor) return { ok: false, error: makeError('RM-405', `Мост ${networkId} не найден`) };

    if (actor.state === 'HIBERNATED') {
      this.wake(networkId, 'outbound-delivery');
    }

    if (actor.faultInjected === 'crash') {
      const recovery = this.supervise(networkId, 'injected-bridge-crash');
      return {
        ok: false,
        error: makeError('RM-403', `Мост ${actor.name} аварийно упал и был изолированно перезапущен супервизором`, {
          details: recovery,
        }),
      };
    }

    if (actor.faultInjected === '429' || actor.rateLimit429) {
      return {
        ok: false,
        error: makeError('RM-404', `${actor.name} вернул 429 Rate Limit — включён Backpressure`, {
          details: { retryAfterSec: 15 },
        }),
      };
    }

    if (actor.accountState === 'expired') {
      return { ok: false, error: makeError('RM-401', `Сессия ${actor.name} истекла`) };
    }

    if (actor.customTransport) {
      return actor.customTransport({ envelopeRecord, routePlan, signedHeader });
    }

    actor.lastSeq += 1;
    actor.sentCount += 1;
    const remoteId = `${networkId}-srv-${actor.lastSeq}-${envelopeRecord.handleId.slice(-4)}`;
    return {
      ok: true,
      remoteId,
      serverSeq: actor.lastSeq,
      routeUsed: routePlan?.activeRoute || 'direct',
      signed: Boolean(signedHeader),
    };
  }

  totalRamMb() {
    let sum = 0;
    for (const a of this.actors.values()) sum += a.ramMb;
    return Number(sum.toFixed(3));
  }
}
