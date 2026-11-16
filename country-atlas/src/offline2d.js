/* Автономная жизнь страны: пока окно свёрнуто или вкладка закрыта, мир продолжает идти
   числами — без кадров, без отрисовки, только счётчики и расписания. Основа — детерминизм
   §16.1: всё считается от номера игрового дня, поэтому «догнать» время можно тем же кодом,
   что и живой цикл, и результат будет ровно тем же.

   Сохраняем в localStorage только отметку времени и игровые минуты: остальное восстанавливается
   из сида мира. Так сейв весит сотню байт и не ломается при смене версии. */

export const OFFLINE = {
  key: 'ratgrad.save.v1',
  version: 1,
  gameMinPerRealSec: 6,      // F-120: 1 реальная секунда = 6 игровых минут
  maxDays: 14,               // две недели «догонять» — предел: дальше мир удивит сильнее, чем обрадует
  minRealSec: 45,            // короче — не считается отсутствием
  autosaveSec: 10,
  hiddenTickSec: 1           // скрытая вкладка живёт раз в секунду, а не 60 раз
};

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

/* Слепок: игровые минуты и реальное время. Больше ничего не нужно — мир детерминирован. */
export function snapshot(transport, now = Date.now()) {
  return {
    v: OFFLINE.version,
    savedAt: now,
    minutes: transport ? transport.minutes : 8 * 60,
    day: transport ? Math.floor(transport.minutes / 1440) : 0
  };
}

export function saveTo(storage, transport, now = Date.now()) {
  if (!storage) return null;
  const snap = snapshot(transport, now);
  try {
    storage.setItem(OFFLINE.key, JSON.stringify(snap));
  } catch (e) {
    // приватный режим и переполненное хранилище: играть можно, сейва не будет
    saveTo.failed = (saveTo.failed || 0) + 1;
  }
  return snap;
}

export function loadFrom(storage) {
  if (!storage) return null;
  try {
    const raw = storage.getItem(OFFLINE.key);
    if (!raw) return null;
    const s = JSON.parse(raw);
    if (!s || s.v !== OFFLINE.version) return null;
    if (!Number.isFinite(s.savedAt) || !Number.isFinite(s.minutes)) return null;
    return s;
  } catch (e) { return null; }
}

/* F-218: сколько игровых минут прошло, пока окна не было. Верхний предел — 21 день,
   снизу — 45 реальных секунд (короче — это не отсутствие, а просто переключение вкладки). */
export function elapsedMinutes(saved, now = Date.now(), opts = {}) {
  if (!saved) return { realSec: 0, minutes: 0, days: 0, capped: false };
  const realSec = Math.max(0, (now - saved.savedAt) / 1000);
  const perSec = opts.gameMinPerRealSec ?? OFFLINE.gameMinPerRealSec;
  const raw = realSec * perSec;
  const maxMin = (opts.maxDays ?? OFFLINE.maxDays) * 1440;
  const minutes = realSec < (opts.minRealSec ?? OFFLINE.minRealSec) ? 0 : Math.min(raw, maxMin);
  return { realSec, minutes, days: Math.floor(minutes / 1440), capped: raw > maxMin };
}

/* F-219: догон по числам. Ни одного кадра отрисовки: только минуты, дни, решения и стройка.
   Возвращает отчёт, который и показывается в HUD. */
export function catchUp(state, days, opts = {}) {
  const report = {
    days: 0, minutes: 0, decisions: 0, houses: 0, parks: 0, civic: 0, industry: 0,
    bypass: 0, waitTrains: 0, landed: 0, ms: 0
  };
  if (!days || days <= 0) return report;
  const t0 = typeof performance !== 'undefined' ? performance.now() : Date.now();
  const n = Math.min(days, opts.maxDays ?? OFFLINE.maxDays);
  if (state.transport) state.transport.minutes += n * 1440;
  if (state.economy && state.advanceEconomy) state.advanceEconomy(state.economy, n);
  if (state.mayors && state.advanceMayors) {
    const events = state.advanceMayors(state.mayors, state.journal || [], n);
    report.decisions = events.length;
    if (state.applyGrowth) {
      for (const e of events) {
        const made = state.applyGrowth(e.index, e.action) || [];
        for (const item of made) {
          if (item.kind === 'bypass') report.bypass++;
          else if (item.kind === 'road') continue;
          else if (item.kind === 'civic') report.civic++;
          else if (item.kind === 'park') report.parks++;
          else if (item.kind === 'industry') report.industry++;
          else if (item.kind === 'house') report.houses++;
        }
      }
    }
  }
  report.days = n;
  report.minutes = n * 1440;
  report.ms = Math.round(((typeof performance !== 'undefined' ? performance.now() : Date.now()) - t0) * 10) / 10;
  return report;
}

/* Строка для HUD: что случилось, пока вас не было. */
export function formatReport(report) {
  if (!report || !report.days) return '';
  const parts = ['пока вас не было: +' + report.days + (report.days === 1 ? ' день' : report.days < 5 ? ' дня' : ' дней')];
  if (report.decisions) parts.push('решений ' + report.decisions);
  if (report.houses) parts.push('домов ' + report.houses);
  if (report.parks) parts.push('парков ' + report.parks);
  if (report.civic) parts.push('общественных ' + report.civic);
  if (report.bypass) parts.push('объездных ' + report.bypass);
  return parts.join(' · ');
}

/* F-220: видимость окна. Скрытая вкладка живёт реже, но не умирает. */
export function hiddenTick(dtSec = OFFLINE.hiddenTickSec) {
  return clamp(dtSec, 0, 5);
}
