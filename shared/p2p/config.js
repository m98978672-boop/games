/* ============================================================
   Games P2P — АВТООПРЕДЕЛЕНИЕ СЕРВЕРА (shared/p2p/config.js)
   ------------------------------------------------------------
   Вкладке «Торрент» нужен адрес трекера/сида. Ищем его так:

     1. ?p2p=<адрес> в строке страницы — ручное указание (для
        своего компьютера, VPS, туннеля);
     2. сохранённый адрес в localStorage (если игрок уже вводил);
     3. этот же хост, если страницу отдал наш сервер
        (tools/p2p-server/server.mjs) — /api/p2p живой;
     4. публичный адрес из site/p2p-endpoints.json (если владелец
        репозитория вписал свой сервер);
     5. иначе — резервный режим «HTTPS-сид»: файлы идут напрямую
        с GitHub Pages, автоочистка и проверка кусков работают.

   Ничего не ломается, если сервера нет: игра всё равно скачается,
   режим честно показывается в интерфейсе.
   ============================================================ */
(function (root) {
  'use strict';
  const P2P = (root.GamesP2P = root.GamesP2P || {});
  const STORAGE_KEY = 'games-p2p-endpoint-v1';

  function readStorage() {
    try {
      return root.localStorage ? root.localStorage.getItem(STORAGE_KEY) : null;
    } catch {
      return null;
    }
  }

  function writeStorage(value) {
    try {
      if (root.localStorage && value) root.localStorage.setItem(STORAGE_KEY, value);
    } catch { /* приватный режим — просто не запоминим */ }
  }

  function normalizeEndpoint(value) {
    const raw = String(value || '').trim();
    if (!raw) return '';
    // Полный адрес API или только хост — приводим к /api/p2p.
    if (/^https?:\/\/[^/]+$/i.test(raw)) return `${raw}/api/p2p`;
    if (/^https?:\/\//i.test(raw)) return raw.replace(/\/+$/, '');
    if (/^[\w.-]+(:\d+)?$/.test(raw)) return `http://${raw}/api/p2p`;
    return '';
  }

  function fromQuery() {
    try {
      const loc = root.location || {};
      const params = new URLSearchParams(String(loc.search || ''));
      return normalizeEndpoint(params.get('p2p') || params.get('endpoint'));
    } catch {
      return '';
    }
  }

  function sameHostEndpoint() {
    const loc = root.location || {};
    const protocol = String(loc.protocol || '').replace(':', '');
    if (!loc.host || (protocol !== 'http' && protocol !== 'https')) return '';
    // GitHub Pages — статический хостинг, своего API там быть не может,
    // поэтому единственный быстрый кандидат — этот же хост на http(s).
    if (/\.github\.io$/i.test(String(loc.hostname || ''))) return '';
    return `${loc.protocol}//${loc.host}/api/p2p`;
  }

  async function isAlive(endpoint, timeoutMs) {
    if (!endpoint) return false;
    const ctrl = typeof AbortController === 'function' ? new AbortController() : null;
    const timer = setTimeout(() => ctrl && ctrl.abort(), timeoutMs || 2500);
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'stats', peerId: 'probe' }),
        signal: ctrl ? ctrl.signal : undefined,
      });
      if (!res.ok) return false;
      const data = await res.json();
      return Boolean(data && (data.ok || typeof data.peers === 'number'));
    } catch {
      return false;
    } finally {
      clearTimeout(timer);
    }
  }

  async function loadPublicEndpoints() {
    try {
      const res = await fetch(new URL('../site/p2p-endpoints.json', root.location ? root.location.href : './'), { cache: 'no-cache' });
      if (!res.ok) return [];
      const data = await res.json();
      return Array.isArray(data && data.endpoints)
        ? data.endpoints.map((e) => normalizeEndpoint(typeof e === 'string' ? e : e.url)).filter(Boolean)
        : [];
    } catch {
      return [];
    }
  }

  /**
   * Находит живой сервер. Возвращает:
   * { endpoint, source, online, candidates, fallback }
   */
  async function resolveServer(options) {
    const o = options || {};
    const candidates = [];
    const push = (url, source) => {
      if (url && !candidates.some((c) => c.url === url)) candidates.push({ url, source });
    };

    push(fromQuery(), 'ссылка (?p2p=)');
    if (o.endpoint) push(normalizeEndpoint(o.endpoint), 'настройки');
    push(normalizeEndpoint(readStorage()), 'сохранённый адрес');

    // Наш собственный сервер на этом же хосте — самый быстрый путь.
    const same = sameHostEndpoint();
    if (same && !/\.github\.io$/i.test((root.location || {}).hostname || '')) push(same, 'свой сервер на этом хосте');

    for (const item of candidates) {
      // eslint-disable-next-line no-await-in-loop
      if (await isAlive(item.url, o.timeoutMs)) {
        writeStorage(item.url);
        return { endpoint: item.url, source: item.source, online: true, candidates, fallback: false };
      }
    }

    // Публичные адреса из репозитория — вдруг владелец поднял свой сервер.
    for (const url of await loadPublicEndpoints()) {
      // eslint-disable-next-line no-await-in-loop
      if (await isAlive(url, o.timeoutMs)) {
        return { endpoint: url, source: 'публичный сервер Games', online: true, candidates, fallback: false };
      }
    }

    const first = candidates[0] ? candidates[0].url : (same || '');
    return {
      endpoint: first,
      source: 'резерв: HTTPS-сид',
      online: false,
      candidates,
      fallback: true,
    };
  }

  function saveEndpoint(value) {
    const url = normalizeEndpoint(value);
    if (url) writeStorage(url);
    return url;
  }

  function forgetEndpoint() {
    try {
      if (root.localStorage) root.localStorage.removeItem(STORAGE_KEY);
    } catch { /* нечего забывать */ }
  }

  P2P.resolveServer = resolveServer;
  P2P.saveEndpoint = saveEndpoint;
  P2P.forgetEndpoint = forgetEndpoint;
  P2P.normalizeEndpoint = normalizeEndpoint;
})(typeof globalThis !== 'undefined' ? globalThis : this);
