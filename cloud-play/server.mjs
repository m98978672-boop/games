import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

export const STEAM_OPENID_ENDPOINT = 'https://steamcommunity.com/openid/login';
export const STEAM_OPENID_NAMESPACE = 'http://specs.openid.net/auth/2.0';
export const STEAM_IDENTIFIER_SELECT = 'http://specs.openid.net/auth/2.0/identifier_select';
const STEAM_API_GAMES = 'https://api.steampowered.com/IPlayerService/GetOwnedGames/v1/';
const STATE_COOKIE = 'pb_openid_state';
const SESSION_COOKIE = 'pb_session';
const SESSION_TTL_SECONDS = 12 * 60 * 60;
const STATE_TTL_SECONDS = 10 * 60;
const HERE = path.dirname(fileURLToPath(import.meta.url));
const STATIC_FILES = new Map([
  ['', ['index.html', 'text/html; charset=utf-8']],
  ['index.html', ['index.html', 'text/html; charset=utf-8']],
  ['styles.css', ['styles.css', 'text/css; charset=utf-8']],
  ['app.js', ['app.js', 'text/javascript; charset=utf-8']],
  ['cover.svg', ['cover.svg', 'image/svg+xml']],
  ['README.md', ['README.md', 'text/markdown; charset=utf-8']],
]);

function publicOriginFrom(raw) {
  try {
    const url = new URL(raw);
    if (!['http:', 'https:'].includes(url.protocol)) return '';
    if (url.username || url.password || url.pathname !== '/' || url.search || url.hash) return '';
    return url.origin;
  } catch {
    return '';
  }
}

function configFrom(env = process.env) {
  const port = Number.parseInt(env.PORT || '4174', 10);
  const publicOrigin = publicOriginFrom(env.PUBLIC_ORIGIN || `http://localhost:${Number.isFinite(port) ? port : 4174}`);
  const sessionSecret = typeof env.SESSION_SECRET === 'string' ? env.SESSION_SECRET : '';
  const production = env.NODE_ENV === 'production';
  const secureOrigin = publicOrigin.startsWith('https://');
  const loginReady = sessionSecret.length >= 32 && Boolean(publicOrigin) && (!production || secureOrigin);
  const steamApiKey = typeof env.STEAM_WEB_API_KEY === 'string' ? env.STEAM_WEB_API_KEY.trim() : '';
  return {
    port: Number.isFinite(port) && port > 0 && port <= 65535 ? port : 4174,
    publicOrigin,
    sessionSecret,
    secureCookie: secureOrigin,
    loginReady,
    libraryReady: steamApiKey.length > 0,
    steamApiKey,
  };
}

function hmac(secret, value) {
  return createHmac('sha256', secret).update(value).digest();
}

export function createSignedToken(value, secret, purpose) {
  if (!secret || typeof purpose !== 'string' || !purpose) throw new Error('A signing secret and purpose are required.');
  const payload = Buffer.from(JSON.stringify(value)).toString('base64url');
  const signature = hmac(secret, `${purpose}.${payload}`).toString('base64url');
  return `${payload}.${signature}`;
}

export function verifySignedToken(token, secret, purpose, now = Date.now()) {
  if (!token || !secret || !purpose) return null;
  const parts = token.split('.');
  if (parts.length !== 2 || !parts[0] || !parts[1]) return null;
  const expected = hmac(secret, `${purpose}.${parts[0]}`);
  let received;
  try {
    received = Buffer.from(parts[1], 'base64url');
  } catch {
    return null;
  }
  if (received.length !== expected.length || !timingSafeEqual(received, expected)) return null;
  try {
    const value = JSON.parse(Buffer.from(parts[0], 'base64url').toString('utf8'));
    if (!value || typeof value !== 'object' || !Number.isFinite(value.exp) || value.exp <= Math.floor(now / 1000)) return null;
    return value;
  } catch {
    return null;
  }
}

export function extractSteamId(claimedId, identity = claimedId) {
  const pattern = /^https:\/\/steamcommunity\.com\/openid\/id\/(\d{17})$/;
  const claimedMatch = typeof claimedId === 'string' ? claimedId.match(pattern) : null;
  const identityMatch = typeof identity === 'string' ? identity.match(pattern) : null;
  if (!claimedMatch || !identityMatch || claimedMatch[1] !== identityMatch[1]) return null;
  return claimedMatch[1];
}

function sameCallbackUrl(actualValue, expectedValue) {
  try {
    const actual = new URL(actualValue);
    const expected = new URL(expectedValue);
    return actual.origin === expected.origin
      && actual.pathname === expected.pathname
      && actual.searchParams.get('state') === expected.searchParams.get('state')
      && [...actual.searchParams.keys()].every((key) => key === 'state')
      && actual.searchParams.getAll('state').length === 1;
  } catch {
    return false;
  }
}

function nonceIsFresh(nonce, now = Date.now()) {
  if (typeof nonce !== 'string' || nonce.length < 20) return false;
  const timestamp = Date.parse(nonce.slice(0, 20));
  if (!Number.isFinite(timestamp)) return false;
  const maxAge = 15 * 60 * 1000;
  return timestamp <= now + 60 * 1000 && timestamp >= now - maxAge;
}

export async function verifySteamOpenId(params, expectedReturnTo, fetchImpl = globalThis.fetch, now = Date.now()) {
  const fields = new URLSearchParams();
  const seen = new Set();
  for (const [key, value] of params.entries()) {
    if (!key.startsWith('openid.')) continue;
    if (seen.has(key)) return false;
    seen.add(key);
    fields.set(key, value);
  }

  const required = [
    'openid.ns', 'openid.mode', 'openid.op_endpoint', 'openid.claimed_id', 'openid.identity',
    'openid.return_to', 'openid.response_nonce', 'openid.assoc_handle', 'openid.signed', 'openid.sig',
  ];
  if (required.some((key) => !fields.get(key))) return false;
  if (fields.get('openid.ns') !== STEAM_OPENID_NAMESPACE || fields.get('openid.mode') !== 'id_res') return false;
  if (fields.get('openid.op_endpoint') !== STEAM_OPENID_ENDPOINT) return false;
  if (!sameCallbackUrl(fields.get('openid.return_to'), expectedReturnTo)) return false;
  if (!nonceIsFresh(fields.get('openid.response_nonce'), now)) return false;
  if (!extractSteamId(fields.get('openid.claimed_id'), fields.get('openid.identity'))) return false;

  fields.set('openid.mode', 'check_authentication');
  try {
    const response = await fetchImpl(STEAM_OPENID_ENDPOINT, {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded', accept: 'text/plain' },
      body: fields.toString(),
      signal: AbortSignal.timeout(10_000),
      redirect: 'error',
    });
    if (!response.ok) return false;
    const text = await response.text();
    return /(?:^|\r?\n)is_valid:true(?:\r?\n|$)/m.test(text);
  } catch {
    return false;
  }
}

function readCookies(request) {
  const result = new Map();
  for (const part of (request.headers.cookie || '').split(';')) {
    const separator = part.indexOf('=');
    if (separator < 1) continue;
    const name = part.slice(0, separator).trim();
    const raw = part.slice(separator + 1).trim();
    try { result.set(name, decodeURIComponent(raw)); } catch { /* Ignore malformed cookie values. */ }
  }
  return result;
}

function cookieHeader(name, value, { secure, maxAge }) {
  return `${name}=${encodeURIComponent(value)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${secure ? '; Secure' : ''}`;
}

function clearCookieHeader(name, secure) {
  return `${name}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secure ? '; Secure' : ''}`;
}

function sendJson(response, status, body, extraHeaders = {}) {
  response.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store',
    'x-content-type-options': 'nosniff',
    ...extraHeaders,
  });
  response.end(JSON.stringify(body));
}

function sendError(response, status, code, message, extraHeaders = {}) {
  sendJson(response, status, { error: { code, message } }, extraHeaders);
}

function sendRedirect(response, location, status = 303, extraHeaders = {}) {
  response.writeHead(status, { location, 'cache-control': 'no-store', ...extraHeaders });
  response.end();
}

function securityHeaders(response) {
  response.setHeader('x-content-type-options', 'nosniff');
  response.setHeader('x-frame-options', 'DENY');
  response.setHeader('referrer-policy', 'no-referrer');
  response.setHeader('permissions-policy', 'camera=(), microphone=(), geolocation=()');
  response.setHeader('content-security-policy', "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; connect-src 'self'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'; form-action 'self'");
}

function sessionFor(request, config) {
  if (!config.sessionSecret) return null;
  const token = readCookies(request).get(SESSION_COOKIE);
  const value = verifySignedToken(token, config.sessionSecret, 'session');
  if (!value || !/^\d{17}$/.test(value.steamId || '')) return null;
  return { steamId: value.steamId, exp: value.exp };
}

function createSteamLoginUrl(returnTo) {
  const url = new URL(STEAM_OPENID_ENDPOINT);
  url.searchParams.set('openid.ns', STEAM_OPENID_NAMESPACE);
  url.searchParams.set('openid.mode', 'checkid_setup');
  url.searchParams.set('openid.return_to', returnTo);
  url.searchParams.set('openid.realm', `${new URL(returnTo).origin}/`);
  url.searchParams.set('openid.identity', STEAM_IDENTIFIER_SELECT);
  url.searchParams.set('openid.claimed_id', STEAM_IDENTIFIER_SELECT);
  return url;
}

async function serveGames(request, response, config, fetchImpl) {
  const session = sessionFor(request, config);
  if (!session) return sendError(response, 401, 'steam_login_required', 'Войди через Steam OpenID перед запросом библиотеки.');
  if (!config.libraryReady) return sendError(response, 503, 'steam_web_api_key_missing', 'На сервере не задан STEAM_WEB_API_KEY.');

  const url = new URL(STEAM_API_GAMES);
  url.searchParams.set('key', config.steamApiKey);
  url.searchParams.set('steamid', session.steamId);
  url.searchParams.set('include_appinfo', 'true');
  url.searchParams.set('include_played_free_games', 'true');
  url.searchParams.set('format', 'json');

  try {
    const upstream = await fetchImpl(url, {
      headers: { accept: 'application/json' },
      signal: AbortSignal.timeout(10_000),
      redirect: 'error',
    });
    if (upstream.status === 401 || upstream.status === 403) {
      return sendError(response, 403, 'games_not_public', 'Steam API не разрешил прочитать сведения об играх. Проверь настройки приватности профиля.');
    }
    if (!upstream.ok) return sendError(response, 502, 'steam_api_unavailable', 'Steam Web API временно недоступен.');

    const payload = await upstream.json();
    const sourceGames = payload?.response?.games;
    if (!Array.isArray(sourceGames)) {
      return sendError(response, 403, 'games_not_public', 'Steam не вернул список игр. Проверь настройки «Сведения об играх» в профиле.');
    }
    const games = sourceGames.flatMap((item) => {
      const appId = Number(item.appid);
      if (!Number.isSafeInteger(appId) || appId <= 0 || typeof item.name !== 'string') return [];
      return [{
        appId,
        name: item.name.slice(0, 200),
        playtimeMinutes: Number.isFinite(Number(item.playtime_forever)) ? Math.max(0, Math.floor(Number(item.playtime_forever))) : 0,
        iconHash: typeof item.img_icon_url === 'string' && /^[a-f0-9]{40}$/i.test(item.img_icon_url) ? item.img_icon_url : null,
      }];
    }).sort((a, b) => b.playtimeMinutes - a.playtimeMinutes || a.name.localeCompare(b.name));

    sendJson(response, 200, {
      games,
      totalCount: Number.isFinite(Number(payload.response.game_count)) ? Number(payload.response.game_count) : games.length,
      notice: games.length ? null : 'Steam API вернул пустой список. Он может быть пустым или скрытым настройками приватности.',
    });
  } catch {
    sendError(response, 502, 'steam_api_unavailable', 'Не удалось связаться со Steam Web API. Попробуй позже.');
  }
}

function serveStatic(response, pathname, method) {
  const prefix = '/cloud-play/';
  if (pathname === '/' || pathname === '/cloud-play') return sendRedirect(response, prefix, 302);
  if (!pathname.startsWith(prefix)) return sendError(response, 404, 'not_found', 'Страница не найдена.');
  let relative;
  try { relative = decodeURIComponent(pathname.slice(prefix.length)); } catch { return sendError(response, 400, 'bad_path', 'Некорректный путь.'); }
  const entry = STATIC_FILES.get(relative);
  if (!entry) return sendError(response, 404, 'not_found', 'Файл не найден.');
  const [filename, contentType] = entry;
  readFile(path.join(HERE, filename)).then((content) => {
    response.writeHead(200, {
      'content-type': contentType,
      'cache-control': filename === 'index.html' ? 'no-cache' : 'public, max-age=300',
      'content-length': content.length,
    });
    response.end(method === 'HEAD' ? undefined : content);
  }).catch(() => sendError(response, 500, 'static_file_error', 'Не удалось прочитать файл приложения.'));
}

export function createHandler({ env = process.env, fetchImpl = globalThis.fetch } = {}) {
  const config = configFrom(env);
  return async (request, response) => {
    securityHeaders(response);
    const base = config.publicOrigin || `http://localhost:${config.port}`;
    let requestUrl;
    try { requestUrl = new URL(request.url, base); } catch { return sendError(response, 400, 'bad_request', 'Некорректный запрос.'); }
    const pathname = requestUrl.pathname;

    if (pathname === '/api/status' && request.method === 'GET') {
      return sendJson(response, 200, {
        backend: 'online',
        steam: {
          loginReady: config.loginReady,
          loginMethod: 'openid',
          libraryReady: config.libraryReady,
          libraryRequiresPublicGameDetails: true,
        },
        installation: {
          handler: 'steam-client',
          automaticDepotDownload: false,
          localNetworkTransfer: 'Steam built-in feature; controlled by Steam client settings',
          thirdPartyCache: false,
        },
        cloud: {
          ready: false,
          provider: null,
          reason: 'No licensed GPU streaming provider is configured.',
        },
      });
    }

    if (pathname === '/api/session' && request.method === 'GET') {
      const session = sessionFor(request, config);
      return sendJson(response, 200, session
        ? { authenticated: true, steamId: session.steamId }
        : { authenticated: false, steamId: null });
    }

    if (pathname === '/api/games' && request.method === 'GET') return serveGames(request, response, config, fetchImpl);

    if (pathname === '/api/logout') {
      if (request.method !== 'POST') return sendError(response, 405, 'method_not_allowed', 'Используй POST.');
      const requestOrigin = request.headers.origin;
      if (requestOrigin && config.publicOrigin && requestOrigin !== config.publicOrigin) {
        return sendError(response, 403, 'origin_rejected', 'Источник запроса не совпадает с адресом сервиса.');
      }
      response.setHeader('set-cookie', clearCookieHeader(SESSION_COOKIE, config.secureCookie));
      return sendJson(response, 200, { ok: true });
    }

    if (pathname === '/auth/steam/start' && request.method === 'GET') {
      if (!config.loginReady) return sendError(response, 503, 'steam_login_not_configured', 'Настрой PUBLIC_ORIGIN и SESSION_SECRET (не короче 32 символов) на сервере.');
      const state = randomBytes(32).toString('base64url');
      const expires = Math.floor(Date.now() / 1000) + STATE_TTL_SECONDS;
      const stateToken = createSignedToken({ state, exp: expires }, config.sessionSecret, 'openid-state');
      const returnToUrl = new URL('/auth/steam/callback', config.publicOrigin);
      returnToUrl.searchParams.set('state', state);
      const loginUrl = createSteamLoginUrl(returnToUrl.toString());
      response.setHeader('set-cookie', cookieHeader(STATE_COOKIE, stateToken, { secure: config.secureCookie, maxAge: STATE_TTL_SECONDS }));
      return sendRedirect(response, loginUrl.toString(), 302);
    }

    if (pathname === '/auth/steam/callback' && request.method === 'GET') {
      if (!config.loginReady) return sendError(response, 503, 'steam_login_not_configured', 'Steam OpenID не настроен на сервере.');
      const state = requestUrl.searchParams.get('state') || '';
      const stateToken = readCookies(request).get(STATE_COOKIE);
      const statePayload = verifySignedToken(stateToken, config.sessionSecret, 'openid-state');
      const clearState = clearCookieHeader(STATE_COOKIE, config.secureCookie);
      if (!state || !statePayload || statePayload.state !== state) {
        return sendRedirect(response, '/cloud-play/?auth_error=invalid_state', 303, { 'set-cookie': clearState });
      }

      const expectedReturnTo = new URL('/auth/steam/callback', config.publicOrigin);
      expectedReturnTo.searchParams.set('state', state);
      const steamId = extractSteamId(requestUrl.searchParams.get('openid.claimed_id'), requestUrl.searchParams.get('openid.identity'));
      if (!steamId || !(await verifySteamOpenId(requestUrl.searchParams, expectedReturnTo.toString(), fetchImpl))) {
        return sendRedirect(response, '/cloud-play/?auth_error=assertion_failed', 303, { 'set-cookie': clearState });
      }

      const sessionToken = createSignedToken({ steamId, exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS }, config.sessionSecret, 'session');
      response.setHeader('set-cookie', [
        cookieHeader(SESSION_COOKIE, sessionToken, { secure: config.secureCookie, maxAge: SESSION_TTL_SECONDS }),
        clearState,
      ]);
      return sendRedirect(response, '/cloud-play/', 303);
    }

    if (pathname === '/' || pathname === '/cloud-play' || pathname.startsWith('/cloud-play/')) {
      if (request.method !== 'GET' && request.method !== 'HEAD') return sendError(response, 405, 'method_not_allowed', 'Метод не поддерживается.');
      return serveStatic(response, pathname, request.method);
    }

    return sendError(response, 404, 'not_found', 'Endpoint не найден.');
  };
}

const launchedDirectly = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (launchedDirectly) {
  const config = configFrom();
  const server = createServer(createHandler());
  server.listen(config.port, '0.0.0.0', () => {
    console.log(`PLAYBRIDGE listening on 0.0.0.0:${config.port}`);
    console.log(`Open http://localhost:${config.port}/cloud-play/`);
    console.log(`Steam OpenID: ${config.loginReady ? 'configured' : 'disabled — set SESSION_SECRET and PUBLIC_ORIGIN'}`);
    console.log(`Steam library API: ${config.libraryReady ? 'configured' : 'disabled — set STEAM_WEB_API_KEY'}`);
    console.log('Cloud gaming: disabled — no licensed provider configured');
  });
}
