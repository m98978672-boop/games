// Диагностика WebGL, производительности и оптимизаций (F3)
export const BUILD = typeof __BUILD_TIME__ !== 'undefined' ? __BUILD_TIME__ : 'dev';

let cachedProbe = null;

export function probeWebGL() {
  if (cachedProbe) return cachedProbe;
  const res = {
    webgl2: false,
    webgl: false,
    floatTex: false,
    halfFloatTex: false,
    vendor: '—',
    renderer: '—',
    reason: null,
  };
  try {
    const canvas = document.createElement('canvas');
    canvas.width = 16;
    canvas.height = 16;
    let ctx = canvas.getContext('webgl2', { failIfMajorPerformanceCaveat: false });
    if (ctx) {
      res.webgl2 = true;
      res.webgl = true;
      res.floatTex = !!ctx.getExtension('EXT_color_buffer_float');
      res.halfFloatTex = true;
    } else {
      ctx = canvas.getContext('webgl', { failIfMajorPerformanceCaveat: false }) ||
            canvas.getContext('experimental-webgl', {});
      if (ctx) {
        res.webgl = true;
        res.floatTex = !!ctx.getExtension('OES_texture_float');
        res.halfFloatTex = !!ctx.getExtension('OES_texture_half_float');
      }
    }
    if (!ctx) {
      res.reason = 'Браузер не выдал WebGL-контекст (выключено аппаратное ускорение).';
      cachedProbe = res;
      return res;
    }
    const dbg = ctx.getExtension('WEBGL_debug_renderer_info');
    if (dbg) {
      res.vendor = ctx.getParameter(dbg.UNMASKED_VENDOR_WEBGL) || '—';
      res.renderer = ctx.getParameter(dbg.UNMASKED_RENDERER_WEBGL) || '—';
    } else {
      res.vendor = ctx.getParameter(ctx.VENDOR) || '—';
      res.renderer = ctx.getParameter(ctx.RENDERER) || '—';
    }
  } catch (err) {
    res.reason = err.message;
  }
  cachedProbe = res;
  return res;
}

export function formatDiagReport(stats = {}) {
  const gl = probeWebGL();
  const lines = [
    `КАСКАД: Живая Вода · сборка ${BUILD}`,
    `GPU: ${gl.renderer} (${gl.vendor})`,
    `WebGL2: ${gl.webgl2 ? 'да' : 'нет'} · FloatTex: ${gl.floatTex ? 'RGBA32F' : (gl.halfFloatTex ? 'RGBA16F' : 'Uint8 fallback')}`,
    `Кадр: ${stats.fps || 0} FPS · Физика воды: ${(stats.hydroMs || 0).toFixed(2)} мс/кадр`,
    `Сетка воды: ${stats.grid || '—'} · Активные тайлы 8×8: ${stats.activeTiles || 0}/${stats.totalTiles || 0} (пропуск сухих склонов)`,
    `Подшаги CFL: ${stats.substeps || 0} · Масса воды: ${((stats.waterVolumeM3 || 0) / 1000).toFixed(1)} тыс. м³`,
    `Draw calls: ${stats.drawCalls || 0} · Треугольники: ${stats.triangles || 0} · Инстансы зданий: ${stats.cityBuildings || 0}`,
    `Ядро экономики: FixedClock 30 Гц (Переплёт) · Тени: ${stats.shadows || 'выкл'}`,
  ];
  return lines.join('\n');
}
