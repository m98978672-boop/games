// Глобальная шина событий: системы общаются сигналами, а не прямыми ссылками.
export class EventBus {
  constructor(limit = 240) { this.handlers = new Map(); this.log = []; this.limit = limit; }
  on(name, fn) {
    if (!this.handlers.has(name)) this.handlers.set(name, new Set());
    this.handlers.get(name).add(fn);
    return () => this.off(name, fn);
  }
  off(name, fn) { this.handlers.get(name)?.delete(fn); }
  emit(name, payload) {
    const set = this.handlers.get(name);
    if (set) for (const fn of set) { try { fn(payload); } catch (e) { console.warn('[event]', name, e); } }
    this.log.push({ name, payload, t: payload && payload.t != null ? payload.t : 0 });
    if (this.log.length > this.limit) this.log.splice(0, this.log.length - this.limit);
  }
  clear() { this.handlers.clear(); this.log.length = 0; }
}
