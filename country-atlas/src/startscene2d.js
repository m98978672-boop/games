/* §90: жизнь начальной заставки (F-341…F-344).
   Раньше пролёт гас вместе с загрузкой: карта была готова — и заставка исчезала через
   пять секунд, а кнопку «начать игру» нажать было уже некому. Здесь одно место, которое
   решает, когда заставка видна: пока идёт пролёт — она на экране, даже если мир давно
   загружен. Гаснет только по кнопке (или если пролёт вообще не собрался).
   Модуль чистый: ни DOM, ни канвы — только состояние, поэтому его легко проверять. */

export const START = {
  fadeMs: 500,                                            // сколько гаснет заставка
  waiting: 'пролёт над страной · карта мира загружается',
  ready: 'можно начинать · пролёт идёт по кругу',
  hint: 'над страной'
};

/* F-341: в каком состоянии заставка. loading — идёт загрузка, ready — мир готов и ждёт
   кнопку, closed — заставки больше нет. */
export function overlayPhase(state = {}) {
  if (state.failed) return 'closed';
  if (state.started) return 'closed';
  if (!state.hasIntro) return state.loaded ? 'closed' : 'loading';
  return state.loaded ? 'ready' : 'loading';
}

/* F-342: что именно показать при этом состоянии: видна ли заставка, ждёт ли кнопка,
   какой текст в строке загрузки и какая точка пролёта названа. */
export function startSceneView(phase, ctx = {}) {
  const point = typeof ctx.point === 'string' ? ctx.point : '';
  const total = Number(ctx.total) || 0;
  const index = Number(ctx.index) || 0;
  const dots = total > 0 && index > 0 ? ' · точка ' + index + ' из ' + total : '';
  return {
    phase,
    overlayVisible: phase !== 'closed',
    buttonDisabled: phase !== 'ready',
    text: phase === 'ready' ? START.ready : START.waiting,
    point: point ? START.hint + ': ' + point + dots : ''
  };
}

/* F-343: до какой доли круга дошёл пролёт — по ней рисуется полоска и считается,
   что показать дальше. 0 — только начали, 1 — круг замкнулся. */
export function tourProgress(t, hopSec, points) {
  const n = Math.max(1, Number(points) || 1);
  const hop = Number(hopSec) > 0 ? Number(hopSec) : 1;
  const time = Number.isFinite(t) ? t : 0;
  const pos = ((time / hop) % n + n) % n;
  return pos / n;
}

/* F-344: крен камеры в пролёте. На повороте маршрута аппарат «закладывает вираж»:
   маленький угол в радианах, ноль на прямой. Только украшение кадра. */
export function flightBank(prevDir, dir, maxRad = 0.035) {
  if (!prevDir || !dir) return 0;
  const a = Number.isFinite(prevDir.a) ? prevDir.a : 0;
  const b = Number.isFinite(dir.a) ? dir.a : 0;
  let d = b - a;
  while (d > Math.PI) d -= Math.PI * 2;
  while (d < -Math.PI) d += Math.PI * 2;
  const k = Math.max(-1, Math.min(1, d * 6));
  return k * maxRad;
}
