const KEY = 'lastshore.settings.v1';
const defaults = { quality: 'auto', touch: 'auto', volume: 0.55, language: 'ru' };
export function getSettings() {
  try {
    const s = JSON.parse(localStorage.getItem(KEY) || '{}');
    return {
      quality: ['auto', 'high', 'low'].includes(s.quality) ? s.quality : defaults.quality,
      touch: ['auto', 'on', 'off'].includes(s.touch) ? s.touch : defaults.touch,
      volume: typeof s.volume === 'number' && Number.isFinite(s.volume) ? Math.max(0, Math.min(1, s.volume)) : defaults.volume,
      language: ['ru', 'en'].includes(s.language) ? s.language : defaults.language,
    };
  } catch { return { ...defaults }; }
}
export function saveSettings(s) { localStorage.setItem(KEY, JSON.stringify(s)); }
