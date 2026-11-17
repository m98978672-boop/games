// Фирменные векторные SVG-логотипы для всех мессенджеров и облачных сервисов RatMes.
// Строится строго через DOM API (createElementNS) — без innerHTML и внешних CDN.

const SVG_NS = 'http://www.w3.org/2000/svg';

export const BRAND_THEMES = Object.freeze({
  ratmes:    { c1: '#f5c469', c2: '#d97724', glow: 'rgba(232, 180, 90, 0.34)',  ink: '#13100a' },
  max:       { c1: '#8b5cf6', c2: '#4f46e5', glow: 'rgba(139, 92, 246, 0.38)', ink: '#ffffff' },
  telegram:  { c1: '#38bdf8', c2: '#0284c7', glow: 'rgba(56, 189, 248, 0.36)', ink: '#ffffff' },
  vk:        { c1: '#3b82f6', c2: '#1d4ed8', glow: 'rgba(59, 130, 246, 0.36)', ink: '#ffffff' },
  discord:   { c1: '#818cf8', c2: '#4f46e5', glow: 'rgba(129, 140, 248, 0.36)', ink: '#ffffff' },
  whatsapp:  { c1: '#4ade80', c2: '#16a34a', glow: 'rgba(74, 222, 128, 0.36)', ink: '#06210f' },
  matrix:    { c1: '#34d399', c2: '#059669', glow: 'rgba(52, 211, 153, 0.34)', ink: '#041d15' },
  viber:     { c1: '#a855f7', c2: '#7e22ce', glow: 'rgba(168, 85, 247, 0.36)', ink: '#ffffff' },
  signal:    { c1: '#60a5fa', c2: '#2563eb', glow: 'rgba(96, 165, 250, 0.36)', ink: '#ffffff' },
  wechat:    { c1: '#4ade80', c2: '#15803d', glow: 'rgba(74, 222, 128, 0.34)', ink: '#05200e' },
  line:      { c1: '#22c55e', c2: '#16a34a', glow: 'rgba(34, 197, 94, 0.34)',  ink: '#ffffff' },
  kakaotalk: { c1: '#fde047', c2: '#eab308', glow: 'rgba(250, 204, 21, 0.36)', ink: '#2b1e00' },
  zalo:      { c1: '#38bdf8', c2: '#0068ff', glow: 'rgba(0, 104, 255, 0.36)',  ink: '#ffffff' },
});

const ICON_PATHS = Object.freeze({
  // RatMes — стилизованный щит-молния
  ratmes: [
    { tag: 'path', d: 'M12 2.5L4.5 5.6v5.5c0 5.1 3.2 9.4 7.5 10.9 4.3-1.5 7.5-5.8 7.5-10.9V5.6L12 2.5z', fill: 'none', stroke: 'currentColor', strokeWidth: '1.9', strokeLinejoin: 'round' },
    { tag: 'path', d: 'M12.8 7.2L8.9 12.6h3.1l-.8 4.2 3.9-5.4H12l.8-4.2z', fill: 'currentColor' },
  ],
  // MAX — современное округлое облачко с искрой/буквой M
  max: [
    { tag: 'path', d: 'M12 3.2c-4.9 0-8.8 3.6-8.8 8.1 0 2.5 1.2 4.7 3.1 6.2l-.7 3.3 3.4-1.6c1 .3 2 .4 3 .4 4.9 0 8.8-3.6 8.8-8.1S16.9 3.2 12 3.2z', fill: 'none', stroke: 'currentColor', strokeWidth: '1.9', strokeLinejoin: 'round' },
    { tag: 'path', d: 'M7.8 14.3V8.8l4.2 3.5 4.2-3.5v5.5', fill: 'none', stroke: 'currentColor', strokeWidth: '2.0', strokeLinecap: 'round', strokeLinejoin: 'round' },
  ],
  // Telegram — бумажный самолётик
  telegram: [
    { tag: 'path', d: 'M20.6 4.4L3.4 11.1c-.9.4-.9 1.6.1 1.9l4.3 1.4 1.7 5.1c.3.8 1.3.9 1.8.3l2.4-2.8 4.5 3.3c.8.6 1.9.1 2.1-.8l2.5-13.4c.2-1.1-.9-2.1-2.2-1.7z', fill: 'currentColor' },
    { tag: 'path', d: 'M8.5 14.2l8.9-6.1-6.5 7.6-.4 2.7', fill: 'none', stroke: '#0284c7', strokeWidth: '1.3', strokeLinecap: 'round', strokeLinejoin: 'round' },
  ],
  // VK — лаконичный знак волны/галочки V
  vk: [
    { tag: 'path', d: 'M4.3 7.6c.2 5.4 3 8.8 7.9 8.8h.5v-3.1c1.8.2 3.2 1.5 3.8 3.1h3.1c-.8-2.6-2.7-4.1-3.9-4.7 1.2-.7 2.9-2.4 3.4-4.1h-2.8c-.6 1.6-2.1 3.3-3.6 3.5V7.6H9.9v6c-1.5-.4-3-2.2-3.1-6H4.3z', fill: 'currentColor' },
  ],
  // Discord — фирменный шлем/контроллер
  discord: [
    { tag: 'path', d: 'M18.9 5.9A13.8 13.8 0 0015.4 4.8l-.4.9a12.5 12.5 0 00-6 0l-.4-.9A13.8 13.8 0 005.1 5.9C2.9 9.2 2.3 12.4 2.6 15.6a14 14 0 004.3 2.2l.9-1.5c-.5-.2-1-.4-1.5-.7l.4-.3c2.9 1.3 6.1 1.3 8.9 0l.4.3c-.5.3-1 .5-1.5.7l.9 1.5a14 14 0 004.3-2.2c.4-3.7-.6-6.9-2.8-9.7z', fill: 'currentColor' },
    { tag: 'circle', cx: '9.2', cy: '12.2', r: '1.35', fill: '#4f46e5' },
    { tag: 'circle', cx: '14.8', cy: '12.2', r: '1.35', fill: '#4f46e5' },
  ],
  // WhatsApp — круг с телефонной трубкой
  whatsapp: [
    { tag: 'path', d: 'M12 3.3a8.5 8.5 0 00-7.4 12.7L3.5 20.5l4.7-1.2A8.5 8.5 0 1012 3.3z', fill: 'none', stroke: 'currentColor', strokeWidth: '1.9', strokeLinejoin: 'round' },
    { tag: 'path', d: 'M9.2 8.7c-.3 0-.7.4-.8.9-.2.8.3 2.1 1.5 3.3 1.2 1.2 2.4 1.7 3.3 1.6.5-.1 1-.5 1.1-.9.1-.3 0-.6-.2-.7l-1.3-.6c-.2-.1-.5 0-.7.2l-.4.5c-.6-.3-1.4-1.1-1.7-1.7l.4-.4c.2-.2.2-.5.1-.7l-.5-1.2c-.1-.2-.3-.3-.6-.3z', fill: 'currentColor' },
  ],
  // Matrix — квадратные скобки [m]
  matrix: [
    { tag: 'path', d: 'M6.8 4.5H4.5v15h2.3M17.2 4.5h2.3v15h-2.3', fill: 'none', stroke: 'currentColor', strokeWidth: '2.1', strokeLinecap: 'round', strokeLinejoin: 'round' },
    { tag: 'path', d: 'M8.2 15.2V9.5c0-.6.5-1 1.1-1 .8 0 1.4.6 1.5 1.3.4-.8 1.1-1.3 1.9-1.3 1.1 0 1.8.8 1.8 2v4.7M11.4 15.2V10.5', fill: 'none', stroke: 'currentColor', strokeWidth: '1.8', strokeLinecap: 'round' },
  ],
  // Viber — облачко с волнами и трубкой
  viber: [
    { tag: 'path', d: 'M12 3.5c-4.7 0-8.2 3.2-8.2 7.5 0 2.4 1.1 4.4 2.8 5.7v3.4l3.1-1.8c.7.2 1.5.3 2.3.3 4.7 0 8.2-3.2 8.2-7.6S16.7 3.5 12 3.5z', fill: 'none', stroke: 'currentColor', strokeWidth: '1.8', strokeLinejoin: 'round' },
    { tag: 'path', d: 'M12.2 7.7a3.4 3.4 0 013.4 3.4M12.2 9.8a1.4 1.4 0 011.4 1.4', fill: 'none', stroke: 'currentColor', strokeWidth: '1.6', strokeLinecap: 'round' },
    { tag: 'path', d: 'M8.8 9.2c-.1 2.2 1.8 4.2 4 4.4', fill: 'none', stroke: 'currentColor', strokeWidth: '2.1', strokeLinecap: 'round' },
  ],
  // Signal — пунктирное кольцо вокруг облачка
  signal: [
    { tag: 'circle', cx: '12', cy: '12', r: '8.7', fill: 'none', stroke: 'currentColor', strokeWidth: '1.5', strokeDasharray: '2.7 2.2' },
    { tag: 'path', d: 'M12 6.2a5.7 5.7 0 00-4.9 8.6l-.6 2.5 2.6-.6A5.7 5.7 0 1012 6.2z', fill: 'currentColor' },
  ],
  // WeChat — два наложенных облачка
  wechat: [
    { tag: 'path', d: 'M9.8 5.2C6.4 5.2 3.7 7.4 3.7 10.2c0 1.6.9 3 2.3 3.9l-.5 1.9 2.1-1c.7.2 1.4.3 2.2.3 3.4 0 6.1-2.2 6.1-5.1s-2.7-5-6.1-5z', fill: 'currentColor' },
    { tag: 'path', d: 'M15.4 10.2c-2.6 0-4.7 1.7-4.7 3.9s2.1 3.9 4.7 3.9c.6 0 1.2-.1 1.7-.3l1.7.9-.4-1.5c1.1-.7 1.8-1.8 1.8-3 0-2.2-2.2-3.9-4.8-3.9z', fill: 'currentColor', opacity: '0.88' },
  ],
  // LINE — ровное облачко с полоской
  line: [
    { tag: 'path', d: 'M12 4.2c-4.7 0-8.5 3.1-8.5 6.9 0 3.4 3 6.2 7 6.8.3.1.7.2.8.5l-.1 1.6c0 .3.2.5.6.3 2.4-1.3 6.2-3.6 7.7-6.1.7-1 .9-2 .9-3.1C20.5 7.3 16.7 4.2 12 4.2z', fill: 'currentColor' },
    { tag: 'path', d: 'M8 11.2h8', fill: 'none', stroke: '#15803d', strokeWidth: '2', strokeLinecap: 'round' },
  ],
  // KakaoTalk — тёплое облачко диалога
  kakaotalk: [
    { tag: 'path', d: 'M12 4.4c-4.8 0-8.6 3-8.6 6.8 0 2.4 1.6 4.5 4 5.7l-.9 3.2 3.7-2.4c.6.1 1.2.1 1.8.1 4.8 0 8.6-3 8.6-6.6S16.8 4.4 12 4.4z', fill: 'currentColor' },
  ],
  // Zalo — Z в облачке
  zalo: [
    { tag: 'rect', x: '3.6', y: '4.2', width: '16.8', height: '15.6', rx: '4.8', fill: 'none', stroke: 'currentColor', strokeWidth: '1.9' },
    { tag: 'path', d: 'M8.2 8.7h7.6l-7.6 6.6h7.6', fill: 'none', stroke: 'currentColor', strokeWidth: '2.1', strokeLinecap: 'round', strokeLinejoin: 'round' },
  ],
});

export function getBrandTheme(networkId) {
  const id = String(networkId || 'ratmes').toLowerCase();
  const t = BRAND_THEMES[id] || BRAND_THEMES.ratmes;
  return {
    ...t,
    accent: t.c1,
    gradient: `linear-gradient(145deg, ${t.c1}, ${t.c2})`,
  };
}

export function createBrandSvg(networkId, size = 20) {
  const id = String(networkId || 'ratmes').toLowerCase();
  const shapes = ICON_PATHS[id] || ICON_PATHS.ratmes;
  const svg = document.createElementNS(SVG_NS, 'svg');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('width', String(size));
  svg.setAttribute('height', String(size));
  svg.setAttribute('aria-hidden', 'true');
  svg.style.display = 'block';
  svg.style.flexShrink = '0';

  for (const s of shapes) {
    const node = document.createElementNS(SVG_NS, s.tag);
    for (const [k, v] of Object.entries(s)) {
      if (k === 'tag') continue;
      const attr = k === 'strokeWidth' ? 'stroke-width'
        : k === 'strokeLinecap' ? 'stroke-linecap'
          : k === 'strokeLinejoin' ? 'stroke-linejoin'
            : k === 'strokeDasharray' ? 'stroke-dasharray'
              : k;
      node.setAttribute(attr, String(v));
    }
    svg.appendChild(node);
  }
  return svg;
}

export function applyBrandBadge(el, networkId, iconSize = 20) {
  if (!el) return;
  const theme = getBrandTheme(networkId);
  el.style.background = `linear-gradient(145deg, ${theme.c1}, ${theme.c2})`;
  el.style.color = theme.ink;
  el.style.boxShadow = `0 4px 14px ${theme.glow}`;
  el.replaceChildren(createBrandSvg(networkId, iconSize));
}
