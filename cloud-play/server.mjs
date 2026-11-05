import { createCipheriv, createDecipheriv, createHash, createHmac, randomBytes, timingSafeEqual } from 'node:crypto';
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
const DROPBOX_STATE_COOKIE = 'pb_dropbox_state';
const DROPBOX_TOKEN_COOKIE = 'pb_dropbox';
const DROPBOX_AUTHORIZE_ENDPOINT = 'https://www.dropbox.com/oauth2/authorize';
const DROPBOX_TOKEN_ENDPOINT = 'https://api.dropboxapi.com/oauth2/token';
const DROPBOX_UPLOAD_ENDPOINT = 'https://content.dropboxapi.com/2/files/upload';
const DROPBOX_DOWNLOAD_ENDPOINT = 'https://content.dropboxapi.com/2/files/download';
const SESSION_TTL_SECONDS = 12 * 60 * 60;
const STATE_TTL_SECONDS = 10 * 60;
const DROPBOX_TOKEN_TTL_SECONDS = 180 * 24 * 60 * 60;
const MAX_DROPBOX_BODY_BYTES = 4 * 1024 * 1024;
const HERE = path.dirname(fileURLToPath(import.meta.url));
const STATIC_FILES = new Map([
  ['', ['index.html', 'text/html; charset=utf-8']],
  ['index.html', ['index.html', 'text/html; charset=utf-8']],
  ['styles.css', ['styles.css', 'text/css; charset=utf-8']],
  ['app.js', ['app.js', 'text/javascript; charset=utf-8']],
  ['manifest.webmanifest', ['manifest.webmanifest', 'application/manifest+json; charset=utf-8']],
  ['sw.js', ['sw.js', 'text/javascript; charset=utf-8']],
  ['icons/icon.svg', ['icons/icon.svg', 'image/svg+xml']],
  ['icons/icon-192.png', ['icons/icon-192.png', 'image/png']],
  ['icons/icon-512.png', ['icons/icon-512.png', 'image/png']],
  ['icons/icon-maskable-512.png', ['icons/icon-maskable-512.png', 'image/png']],
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
  const dropboxAppKey = typeof env.DROPBOX_APP_KEY === 'string' ? env.DROPBOX_APP_KEY.trim() : '';
  const dropboxAppSecret = typeof env.DROPBOX_APP_SECRET === 'string' ? env.DROPBOX_APP_SECRET.trim() : '';
  const dropboxTokenSecret = typeof env.DROPBOX_TOKEN_SECRET === 'string' ? env.DROPBOX_TOKEN_SECRET : '';
  const dropboxReady = Boolean(loginReady && dropboxAppKey && dropboxAppSecret && dropboxTokenSecret.length >= 32
    && publicOrigin && (!production || secureOrigin));
  return {
    port: Number.isFinite(port) && port > 0 && port <= 65535 ? port : 4174,
    publicOrigin,
    sessionSecret,
    secureCookie: secureOrigin,
    loginReady,
    libraryReady: steamApiKey.length > 0,
    steamApiKey,
    dropboxAppKey,
    dropboxAppSecret,
    dropboxTokenSecret,
    dropboxReady,
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

export function encryptDropboxRefreshToken(value, secret) {
  if (!secret || secret.length < 32) throw new Error('A Dropbox token-encryption secret of at least 32 characters is required.');
  if (!value || !/^\d{17}$/.test(value.steamId || '') || typeof value.refreshToken !== 'string'
    || value.refreshToken.length < 16 || value.refreshToken.length > 2048) {
    throw new Error('A valid SteamID and Dropbox refresh token are required.');
  }
  const iv = randomBytes(12);
  const key = createHash('sha256').update(secret).digest();
  const cipher = createCipheriv('aes-256-gcm', key, iv);
  cipher.setAAD(Buffer.from('playbridge-dropbox-token-v1'));
  const plaintext = Buffer.from(JSON.stringify({
    steamId: value.steamId,
    refreshToken: value.refreshToken,
    exp: Number.isFinite(value.exp) ? value.exp : Date.now() + DROPBOX_TOKEN_TTL_SECONDS * 1000,
  }));
  const encrypted = Buffer.concat([cipher.update(plaintext), cipher.final()]);
  return [iv, cipher.getAuthTag(), encrypted].map((part) => part.toString('base64url')).join('.');
}

export function decryptDropboxRefreshToken(encoded, secret, now = Date.now()) {
  if (!encoded || !secret || secret.length < 32) return null;
  const parts = String(encoded).split('.');
  if (parts.length !== 3) return null;
  try {
    const [iv, tag, encrypted] = parts.map((part) => Buffer.from(part, 'base64url'));
    if (iv.length !== 12 || tag.length !== 16 || encrypted.length < 1) return null;
    const key = createHash('sha256').update(secret).digest();
    const decipher = createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAAD(Buffer.from('playbridge-dropbox-token-v1'));
    decipher.setAuthTag(tag);
    const plaintext = Buffer.concat([decipher.update(encrypted), decipher.final()]).toString('utf8');
    const value = JSON.parse(plaintext);
    if (!value || !/^\d{17}$/.test(value.steamId || '')
      || typeof value.refreshToken !== 'string' || value.refreshToken.length < 16
      || !Number.isFinite(value.exp) || value.exp <= now) return null;
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

function dropboxSessionFor(request, session, config) {
  if (!config.dropboxReady || !session) return null;
  const encrypted = readCookies(request).get(DROPBOX_TOKEN_COOKIE);
  const token = decryptDropboxRefreshToken(encrypted, config.dropboxTokenSecret);
  return token && token.steamId === session.steamId ? token : null;
}

async function readJsonBody(request, maxBytes = MAX_DROPBOX_BODY_BYTES) {
  const chunks = [];
  let size = 0;
  for await (const chunk of request) {
    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    size += buffer.length;
    if (size > maxBytes) {
      const error = new Error('request_too_large');
      error.statusCode = 413;
      throw error;
    }
    chunks.push(buffer);
  }
  if (size === 0) return null;
  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8'));
  } catch {
    const error = new Error('invalid_json');
    error.statusCode = 400;
    throw error;
  }
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

function secureRequestOrigin(request, config) {
  return !config.publicOrigin || request.headers.origin === config.publicOrigin;
}

function safeDropboxReturnPath(raw) {
  if (typeof raw !== 'string') return '/cloud-play/';
  try {
    const url = new URL(raw, 'https://playbridge.invalid');
    if (url.origin !== 'https://playbridge.invalid' || !url.pathname.startsWith('/cloud-play/')) return '/cloud-play/';
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return '/cloud-play/';
  }
}

function addDropboxResult(pathname, key, value) {
  const safePath = safeDropboxReturnPath(pathname);
  const url = new URL(safePath, 'https://playbridge.invalid');
  url.searchParams.set(key, value);
  return `${url.pathname}${url.search}${url.hash}`;
}

function normalizeSnapshotGames(games) {
  if (!Array.isArray(games) || games.length > 10_000) return null;
  const normalized = [];
  const seenIds = new Set();
  for (const item of games) {
    const appId = Number(item?.appId);
    const name = typeof item?.name === 'string' ? item.name.trim() : '';
    const playtimeMinutes = Number(item?.playtimeMinutes ?? 0);
    if (!Number.isSafeInteger(appId) || appId <= 0 || !name || !Number.isFinite(playtimeMinutes) || playtimeMinutes < 0) return null;
    if (seenIds.has(appId)) continue;
    seenIds.add(appId);
    normalized.push({
      appId,
      name: name.slice(0, 200),
      playtimeMinutes: Math.min(1_000_000_000, Math.floor(playtimeMinutes)),
      iconHash: typeof item?.iconHash === 'string' && /^[a-f0-9]{40}$/i.test(item.iconHash) ? item.iconHash : null,
    });
  }
  return normalized;
}

function createDropboxSnapshot(input, steamId) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) return null;
  const games = normalizeSnapshotGames(input.games);
  if (!games) return null;
  const totalCount = Number(input.totalCount);
  return {
    schemaVersion: 1,
    provider: 'playbridge-steam-library',
    steamId,
    updatedAt: new Date().toISOString(),
    totalCount: Number.isSafeInteger(totalCount) && totalCount >= games.length ? Math.min(totalCount, 100_000) : games.length,
    games,
  };
}

function validateDropboxSnapshot(input, steamId) {
  if (!input || typeof input !== 'object' || Array.isArray(input)
    || input.schemaVersion !== 1 || input.provider !== 'playbridge-steam-library' || input.steamId !== steamId
    || typeof input.updatedAt !== 'string' || !Number.isFinite(Date.parse(input.updatedAt))) return null;
  const games = normalizeSnapshotGames(input.games);
  if (!games) return null;
  const totalCount = Number(input.totalCount);
  return {
    schemaVersion: 1,
    provider: 'playbridge-steam-library',
    steamId,
    updatedAt: input.updatedAt,
    totalCount: Number.isSafeInteger(totalCount) && totalCount >= games.length ? Math.min(totalCount, 100_000) : games.length,
    games,
  };
}

async function getDropboxAccessToken(refreshToken, config, fetchImpl) {
  const form = new URLSearchParams({ grant_type: 'refresh_token', refresh_token: refreshToken });
  const basicAuth = Buffer.from(`${config.dropboxAppKey}:${config.dropboxAppSecret}`).toString('base64');
  const response = await fetchImpl(DROPBOX_TOKEN_ENDPOINT, {
    method: 'POST',
    headers: { authorization: `Basic ${basicAuth}`, 'content-type': 'application/x-www-form-urlencoded', accept: 'application/json' },
    body: form.toString(),
    signal: AbortSignal.timeout(10_000),
    redirect: 'error',
  });
  if (!response.ok) {
    const error = new Error('dropbox_refresh_failed');
    error.upstreamStatus = response.status;
    throw error;
  }
  const payload = await response.json();
  if (typeof payload?.access_token !== 'string' || payload.access_token.length < 16) throw new Error('dropbox_refresh_failed');
  return payload.access_token;
}

async function authorizeDropboxCode(code, redirectUri, config, fetchImpl) {
  const form = new URLSearchParams({ grant_type: 'authorization_code', code, redirect_uri: redirectUri });
  const basicAuth = Buffer.from(`${config.dropboxAppKey}:${config.dropboxAppSecret}`).toString('base64');
  const response = await fetchImpl(DROPBOX_TOKEN_ENDPOINT, {
    method: 'POST',
    headers: { authorization: `Basic ${basicAuth}`, 'content-type': 'application/x-www-form-urlencoded', accept: 'application/json' },
    body: form.toString(),
    signal: AbortSignal.timeout(10_000),
    redirect: 'error',
  });
  if (!response.ok) throw new Error('dropbox_authorization_failed');
  const payload = await response.json();
  if (typeof payload?.refresh_token !== 'string' || payload.refresh_token.length < 16) throw new Error('dropbox_offline_access_missing');
  return payload.refresh_token;
}

function dropboxSnapshotPath(steamId) {
  return `/library-${steamId}.json`;
}

async function uploadDropboxSnapshot(snapshot, accessToken, fetchImpl) {
  const response = await fetchImpl(DROPBOX_UPLOAD_ENDPOINT, {
    method: 'POST',
    headers: {
      authorization: `Bearer ${accessToken}`,
      'content-type': 'application/octet-stream',
      'dropbox-api-arg': JSON.stringify({ path: dropboxSnapshotPath(snapshot.steamId), mode: 'overwrite', autorename: false, mute: true }),
    },
    body: JSON.stringify(snapshot),
    signal: AbortSignal.timeout(15_000),
    redirect: 'error',
  });
  if (!response.ok) throw new Error('dropbox_upload_failed');
  return response.json();
}

async function readDropboxJsonResponse(response) {
  const contentLength = Number(response.headers?.get?.('content-length'));
  if (Number.isFinite(contentLength) && contentLength > MAX_DROPBOX_BODY_BYTES) {
    const error = new Error('dropbox_snapshot_too_large');
    error.upstreamStatus = 413;
    throw error;
  }

  if (!response.body?.getReader) {
    if (typeof response.text !== 'function') return response.json();
    const text = await response.text();
    if (Buffer.byteLength(text) > MAX_DROPBOX_BODY_BYTES) {
      const error = new Error('dropbox_snapshot_too_large');
      error.upstreamStatus = 413;
      throw error;
    }
    return JSON.parse(text);
  }

  const reader = response.body.getReader();
  const chunks = [];
  let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = Buffer.from(value);
      size += chunk.length;
      if (size > MAX_DROPBOX_BODY_BYTES) {
        await reader.cancel();
        const error = new Error('dropbox_snapshot_too_large');
        error.upstreamStatus = 413;
        throw error;
      }
      chunks.push(chunk);
    }
  } finally {
    reader.releaseLock();
  }
  return JSON.parse(Buffer.concat(chunks).toString('utf8'));
}

async function downloadDropboxSnapshot(accessToken, steamId, fetchImpl) {
  const response = await fetchImpl(DROPBOX_DOWNLOAD_ENDPOINT, {
    method: 'POST',
    headers: {
      authorization: `Bearer ${accessToken}`,
      'dropbox-api-arg': JSON.stringify({ path: dropboxSnapshotPath(steamId) }),
    },
    signal: AbortSignal.timeout(15_000),
    redirect: 'error',
  });
  if (!response.ok) {
    const error = new Error('dropbox_download_failed');
    error.upstreamStatus = response.status;
    throw error;
  }
  return readDropboxJsonResponse(response);
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
      'cache-control': ['index.html', 'styles.css', 'app.js', 'manifest.webmanifest', 'sw.js'].includes(filename) || filename.startsWith('icons/')
        ? 'no-cache'
        : 'public, max-age=300',
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
          reason: 'No self-hosted host agent or licensed GPU streaming provider is configured.',
        },
        cloudStorage: {
          provider: 'dropbox',
          enabled: config.dropboxReady,
          content: 'Steam library metadata snapshot only; no game files or save files.',
          reason: config.dropboxReady ? null : 'Dropbox OAuth is not configured on the server.',
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

    if (pathname === '/api/dropbox/status' && request.method === 'GET') {
      const session = sessionFor(request, config);
      return sendJson(response, 200, {
        enabled: config.dropboxReady,
        connected: Boolean(dropboxSessionFor(request, session, config)),
        provider: 'dropbox',
        destination: 'Dropbox App Folder/library-<SteamID>.json',
      });
    }

    if (pathname === '/api/dropbox/disconnect') {
      if (request.method !== 'POST') return sendError(response, 405, 'method_not_allowed', 'Используй POST.');
      if (!secureRequestOrigin(request, config)) return sendError(response, 403, 'origin_rejected', 'Источник запроса не совпадает с адресом сервиса.');
      return sendJson(response, 200, { ok: true, connected: false }, {
        'set-cookie': [
          clearCookieHeader(DROPBOX_TOKEN_COOKIE, config.secureCookie),
          clearCookieHeader(DROPBOX_STATE_COOKIE, config.secureCookie),
        ],
      });
    }

    if (pathname === '/api/dropbox/snapshot' && request.method === 'POST') {
      if (!secureRequestOrigin(request, config)) return sendError(response, 403, 'origin_rejected', 'Источник запроса не совпадает с адресом сервиса.');
      if (!config.dropboxReady) return sendError(response, 503, 'dropbox_not_configured', 'Настрой Dropbox OAuth на сервере.');
      const session = sessionFor(request, config);
      if (!session) return sendError(response, 401, 'steam_login_required', 'Войди через Steam перед резервным копированием библиотеки.');
      const dropboxToken = dropboxSessionFor(request, session, config);
      if (!dropboxToken) return sendError(response, 409, 'dropbox_not_linked', 'Сначала подключи Dropbox к этому Steam-аккаунту.');
      if (!/^application\/json(?:;|$)/i.test(request.headers['content-type'] || '')) {
        return sendError(response, 415, 'json_required', 'Ожидается JSON-снимок библиотеки.');
      }

      let input;
      try {
        input = await readJsonBody(request);
      } catch (error) {
        const status = error.statusCode || 400;
        return sendError(response, status, status === 413 ? 'snapshot_too_large' : 'invalid_json', status === 413 ? 'Снимок слишком велик.' : 'Не удалось прочитать JSON-снимок.');
      }
      const snapshot = createDropboxSnapshot(input, session.steamId);
      if (!snapshot) return sendError(response, 400, 'invalid_snapshot', 'Снимок должен содержать корректный список игр Steam.');

      let accessToken;
      try {
        accessToken = await getDropboxAccessToken(dropboxToken.refreshToken, config, fetchImpl);
      } catch (error) {
        if (error.upstreamStatus === 400 || error.upstreamStatus === 401) {
          return sendError(response, 401, 'dropbox_reconnect_required', 'Dropbox-токен отозван или истёк. Подключи Dropbox заново.', {
            'set-cookie': clearCookieHeader(DROPBOX_TOKEN_COOKIE, config.secureCookie),
          });
        }
        return sendError(response, 502, 'dropbox_unavailable', 'Не удалось получить доступ к Dropbox. Попробуй позже.');
      }

      try {
        await uploadDropboxSnapshot(snapshot, accessToken, fetchImpl);
        return sendJson(response, 200, {
          ok: true,
          updatedAt: snapshot.updatedAt,
          gameCount: snapshot.games.length,
          totalCount: snapshot.totalCount,
          destination: `Dropbox App Folder${dropboxSnapshotPath(session.steamId)}`,
        });
      } catch {
        return sendError(response, 502, 'dropbox_upload_failed', 'Dropbox не принял снимок. Проверь разрешения Dropbox App и попробуй позже.');
      }
    }

    if (pathname === '/api/dropbox/snapshot' && request.method === 'GET') {
      if (!config.dropboxReady) return sendError(response, 503, 'dropbox_not_configured', 'Настрой Dropbox OAuth на сервере.');
      const session = sessionFor(request, config);
      if (!session) return sendError(response, 401, 'steam_login_required', 'Войди через Steam перед восстановлением снимка.');
      const dropboxToken = dropboxSessionFor(request, session, config);
      if (!dropboxToken) return sendError(response, 409, 'dropbox_not_linked', 'Сначала подключи Dropbox к этому Steam-аккаунту.');

      let accessToken;
      try {
        accessToken = await getDropboxAccessToken(dropboxToken.refreshToken, config, fetchImpl);
      } catch (error) {
        if (error.upstreamStatus === 400 || error.upstreamStatus === 401) {
          return sendError(response, 401, 'dropbox_reconnect_required', 'Dropbox-токен отозван или истёк. Подключи Dropbox заново.', {
            'set-cookie': clearCookieHeader(DROPBOX_TOKEN_COOKIE, config.secureCookie),
          });
        }
        return sendError(response, 502, 'dropbox_unavailable', 'Не удалось получить доступ к Dropbox. Попробуй позже.');
      }

      try {
        const stored = await downloadDropboxSnapshot(accessToken, session.steamId, fetchImpl);
        if (stored?.steamId !== session.steamId) return sendError(response, 409, 'dropbox_snapshot_account_mismatch', 'Этот Dropbox-снимок привязан к другому Steam-аккаунту.');
        const snapshot = validateDropboxSnapshot(stored, session.steamId);
        if (!snapshot) return sendError(response, 502, 'dropbox_snapshot_invalid', 'Файл снимка в Dropbox имеет неизвестный или повреждённый формат.');
        return sendJson(response, 200, { snapshot });
      } catch (error) {
        if (error.upstreamStatus === 409) return sendError(response, 404, 'dropbox_snapshot_missing', 'В Dropbox пока нет сохранённого снимка библиотеки.');
        return sendError(response, 502, 'dropbox_download_failed', 'Не удалось скачать снимок из Dropbox. Проверь разрешения и попробуй позже.');
      }
    }

    if (pathname === '/api/logout') {
      if (request.method !== 'POST') return sendError(response, 405, 'method_not_allowed', 'Используй POST.');
      const requestOrigin = request.headers.origin;
      if (requestOrigin && config.publicOrigin && requestOrigin !== config.publicOrigin) {
        return sendError(response, 403, 'origin_rejected', 'Источник запроса не совпадает с адресом сервиса.');
      }
      response.setHeader('set-cookie', [
        clearCookieHeader(SESSION_COOKIE, config.secureCookie),
        clearCookieHeader(DROPBOX_TOKEN_COOKIE, config.secureCookie),
        clearCookieHeader(DROPBOX_STATE_COOKIE, config.secureCookie),
      ]);
      return sendJson(response, 200, { ok: true });
    }

    if (pathname === '/auth/dropbox/start' && request.method === 'GET') {
      if (!config.dropboxReady) return sendError(response, 503, 'dropbox_not_configured', 'Настрой DROPBOX_APP_KEY, DROPBOX_APP_SECRET и DROPBOX_TOKEN_SECRET на сервере.');
      const session = sessionFor(request, config);
      if (!session) return sendError(response, 401, 'steam_login_required', 'Сначала войди через Steam.');

      const state = randomBytes(32).toString('base64url');
      const stateToken = createSignedToken({
        state,
        steamId: session.steamId,
        returnTo: safeDropboxReturnPath(requestUrl.searchParams.get('return_to')),
        exp: Math.floor(Date.now() / 1000) + STATE_TTL_SECONDS,
      }, config.sessionSecret, 'dropbox-state');
      const redirectUri = new URL('/auth/dropbox/callback', config.publicOrigin).toString();
      const authorizeUrl = new URL(DROPBOX_AUTHORIZE_ENDPOINT);
      authorizeUrl.searchParams.set('client_id', config.dropboxAppKey);
      authorizeUrl.searchParams.set('response_type', 'code');
      authorizeUrl.searchParams.set('redirect_uri', redirectUri);
      authorizeUrl.searchParams.set('state', state);
      authorizeUrl.searchParams.set('token_access_type', 'offline');
      authorizeUrl.searchParams.set('include_granted_scopes', 'user');
      authorizeUrl.searchParams.set('scope', 'files.content.read files.content.write');
      response.setHeader('set-cookie', cookieHeader(DROPBOX_STATE_COOKIE, stateToken, { secure: config.secureCookie, maxAge: STATE_TTL_SECONDS }));
      return sendRedirect(response, authorizeUrl.toString(), 302);
    }

    if (pathname === '/auth/dropbox/callback' && request.method === 'GET') {
      const clearState = clearCookieHeader(DROPBOX_STATE_COOKIE, config.secureCookie);
      if (!config.dropboxReady) return sendRedirect(response, addDropboxResult('/cloud-play/', 'dropbox_error', 'not_configured'), 303, { 'set-cookie': clearState });
      const state = requestUrl.searchParams.get('state') || '';
      const stateToken = readCookies(request).get(DROPBOX_STATE_COOKIE);
      const statePayload = verifySignedToken(stateToken, config.sessionSecret, 'dropbox-state');
      const session = sessionFor(request, config);
      if (!state || !statePayload || statePayload.state !== state || !session || statePayload.steamId !== session.steamId) {
        return sendRedirect(response, addDropboxResult(statePayload?.returnTo || '/cloud-play/', 'dropbox_error', 'invalid_state'), 303, { 'set-cookie': clearState });
      }
      const returnTo = statePayload.returnTo || '/cloud-play/';
      if (requestUrl.searchParams.has('error')) {
        return sendRedirect(response, addDropboxResult(returnTo, 'dropbox_error', 'denied'), 303, { 'set-cookie': clearState });
      }
      const code = requestUrl.searchParams.get('code') || '';
      if (!code || code.length > 4096) {
        return sendRedirect(response, addDropboxResult(returnTo, 'dropbox_error', 'authorization_failed'), 303, { 'set-cookie': clearState });
      }

      try {
        const redirectUri = new URL('/auth/dropbox/callback', config.publicOrigin).toString();
        const refreshToken = await authorizeDropboxCode(code, redirectUri, config, fetchImpl);
        const encrypted = encryptDropboxRefreshToken({ steamId: session.steamId, refreshToken }, config.dropboxTokenSecret);
        return sendRedirect(response, addDropboxResult(returnTo, 'dropbox', 'connected'), 303, {
          'set-cookie': [
            cookieHeader(DROPBOX_TOKEN_COOKIE, encrypted, { secure: config.secureCookie, maxAge: DROPBOX_TOKEN_TTL_SECONDS }),
            clearState,
          ],
        });
      } catch {
        return sendRedirect(response, addDropboxResult(returnTo, 'dropbox_error', 'authorization_failed'), 303, { 'set-cookie': clearState });
      }
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
    console.log(`Open ${config.publicOrigin || `http://localhost:${config.port}`}/cloud-play/`);
    console.log(`Steam OpenID: ${config.loginReady ? 'configured' : 'disabled — set SESSION_SECRET and PUBLIC_ORIGIN'}`);
    console.log(`Steam library API: ${config.libraryReady ? 'configured' : 'disabled — set STEAM_WEB_API_KEY'}`);
    console.log(`Dropbox library backup: ${config.dropboxReady ? 'configured' : 'disabled — set Dropbox app credentials and DROPBOX_TOKEN_SECRET'}`);
    console.log('Cloud gaming: disabled — no self-hosted host agent or licensed provider configured');
  });
}
