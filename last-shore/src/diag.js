// ============================================================
//  Диагностика: что за браузер, есть ли WebGL, что сломалось.
//  Показывается на экране, чтобы не гадать «почему не работает».
// ============================================================

export const BUILD = typeof __BUILD_TIME__ !== 'undefined' ? __BUILD_TIME__ : 'dev';

let probeResult = null;

/** Пробуем создать WebGL-контекст отдельно от игры и записываем причину отказа */
export function probeWebGL() {
  if (probeResult) return probeResult;
  const result = {
    webgl2: false, webgl: false, vendor: '—', renderer: '—', reason: null, error: null,
  };

  const canvas = document.createElement('canvas');
  canvas.width = 32;
  canvas.height = 32;

  const tryCtx = (name, attrs) => {
    try {
      return canvas.getContext(name, attrs);
    } catch (err) {
      result.error = `${name}: ${err.message}`;
      return null;
    }
  };

  let ctx = tryCtx('webgl2', { failIfMajorPerformanceCaveat: false });
  if (ctx) result.webgl2 = true;
  if (!ctx) ctx = tryCtx('webgl', { failIfMajorPerformanceCaveat: false });
  if (!ctx) ctx = tryCtx('experimental-webgl', {});
  if (ctx) result.webgl = true;

  if (!ctx) {
    result.reason = 'Браузер не выдал WebGL-контекст (аппаратное ускорение выключено или драйвер в блок-листе)';
    probeResult = result;
    return result;
  }

  try {
    const dbg = ctx.getExtension('WEBGL_debug_renderer_info');
    if (dbg) {
      result.vendor = ctx.getParameter(dbg.UNMASKED_VENDOR_WEBGL) || '—';
      result.renderer = ctx.getParameter(dbg.UNMASKED_RENDERER_WEBGL) || '—';
    } else {
      result.vendor = ctx.getParameter(ctx.VENDOR) || '—';
      result.renderer = ctx.getParameter(ctx.RENDERER) || '—';
    }
  } catch (err) {
    result.error = err.message;
  }

  probeResult = result;
  return result;
}

export function collectDiag(extra = {}) {
  const gl = probeWebGL();
  const lines = [
    `LAST SHORE · сборка ${BUILD}`,
    `WebGL2: ${gl.webgl2 ? 'да' : 'нет'} · WebGL1: ${gl.webgl ? 'да' : 'нет'}`,
    `Видео: ${gl.renderer}`,
    `Драйвер: ${gl.vendor}`,
    `Экран: ${window.innerWidth}×${window.innerHeight} @${(window.devicePixelRatio || 1).toFixed(2)}x`,
    `Загрузка: ${window.location ? window.location.origin + window.location.pathname : '—'}`,
    `В iframe: ${(() => { try { return window.top !== window.self ? 'да' : 'нет'; } catch (e) { return 'да (доступ закрыт)'; } })()}`,
    `Pointer lock: ${('requestPointerLock' in Element.prototype) ? 'есть' : 'нет'}`,
    `localStorage: ${isStorageOk() ? 'работает' : 'заблокирован'}`,
    `Браузер: ${(window.navigator && window.navigator.userAgent) || '—'}`,
  ];

  if (gl.reason) lines.push(`Причина: ${gl.reason}`);
  if (gl.error) lines.push(`Ошибка контекста: ${gl.error}`);

  const errors = window.__errors || [];
  if (errors.length) {
    lines.push('', 'Ошибки страницы:');
    for (const e of errors.slice(0, 8)) lines.push(`· ${e}`);
  }

  for (const [key, value] of Object.entries(extra)) {
    if (value !== undefined && value !== null && value !== '') lines.push(`${key}: ${value}`);
  }

  return lines.join('\n');
}

export function isStorageOk() {
  try {
    window.localStorage.setItem('lastshore.probe', '1');
    window.localStorage.removeItem('lastshore.probe');
    return true;
  } catch (err) {
    return false;
  }
}

/** Низкое качество графики: для слабых GPU, ставится автоматически или через ?safe=1 */
export function wantsSafeMode() {
  const search = (window.location && window.location.search) || '';
  const params = new URLSearchParams(search);
  return params.get('safe') === '1' || params.get('safe') === '';
}
