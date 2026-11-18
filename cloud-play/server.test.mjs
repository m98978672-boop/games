import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { compareVersions, gitBlobSha, parseVersion, validateRelativePath } from './portable-launcher.mjs';
import {
  createHandler,
  createSignedToken,
  decryptDropboxRefreshToken,
  encryptDropboxRefreshToken,
  extractSteamId,
  STEAM_OPENID_ENDPOINT,
  STEAM_OPENID_NAMESPACE,
  verifySignedToken,
  verifySteamOpenId,
} from './server.mjs';

const steamId = '76561198000000000';
const secret = 'test-session-secret-with-at-least-32-characters';

test('portable updater compares semantic versions and validates Git blob paths', () => {
  assert.deepEqual(parseVersion('0.5.0'), [0, 5, 0]);
  assert.equal(compareVersions('0.5.0', '0.4.9'), 1);
  assert.equal(compareVersions('0.5.0', '0.5.0'), 0);
  assert.equal(compareVersions('0.4.9', '0.5.0'), -1);
  assert.equal(compareVersions('invalid', '0.5.0'), null);
  assert.equal(gitBlobSha(Buffer.from('foo')), '19102815663d23f8b75a47e7a01965dcdc96468c');
  assert.equal(validateRelativePath('icons/icon.svg').relativePath, 'icons/icon.svg');
  assert.throws(() => validateRelativePath('../settings.json'));
  assert.throws(() => validateRelativePath('.env'));
});

test('signed tokens reject changes, wrong purpose and expired sessions', () => {
  const now = 1_800_000_000_000;
  const token = createSignedToken({ steamId, exp: Math.floor(now / 1000) + 60 }, secret, 'session');
  assert.deepEqual(verifySignedToken(token, secret, 'session', now), { steamId, exp: Math.floor(now / 1000) + 60 });
  assert.equal(verifySignedToken(token, secret, 'openid-state', now), null);
  assert.equal(verifySignedToken(`${token}x`, secret, 'session', now), null);
  assert.equal(verifySignedToken(createSignedToken({ steamId, exp: 1 }, secret, 'session'), secret, 'session', now), null);
});

test('Dropbox refresh tokens are encrypted, Steam-account-bound, and expire', () => {
  const tokenSecret = 'test-dropbox-token-secret-with-more-than-32-characters';
  const refreshToken = 'dropbox-refresh-token-that-is-never-plain-in-cookie';
  const now = 1_800_000_000_000;
  const encrypted = encryptDropboxRefreshToken({ steamId, refreshToken, exp: now + 60_000 }, tokenSecret);
  assert.equal(encrypted.includes(refreshToken), false);
  assert.deepEqual(decryptDropboxRefreshToken(encrypted, tokenSecret, now), { steamId, refreshToken, exp: now + 60_000 });
  assert.equal(decryptDropboxRefreshToken(encrypted, `${tokenSecret}-wrong`, now), null);
  assert.equal(decryptDropboxRefreshToken(encrypted, tokenSecret, now + 60_001), null);
  const [iv, tag, cipherText] = encrypted.split('.');
  const tampered = `${iv}.${tag}.${cipherText[0] === 'A' ? 'B' : 'A'}${cipherText.slice(1)}`;
  assert.equal(decryptDropboxRefreshToken(tampered, tokenSecret, now), null);
  assert.throws(() => encryptDropboxRefreshToken({ steamId: '1234', refreshToken }, tokenSecret));
});

test('SteamID is extracted only from canonical Steam OpenID URLs', () => {
  assert.equal(extractSteamId(`https://steamcommunity.com/openid/id/${steamId}`), steamId);
  assert.equal(extractSteamId(`https://steamcommunity.com/openid/id/${steamId}`, 'https://example.com/openid/id/76561198000000000'), null);
  assert.equal(extractSteamId(`https://evil.example/openid/id/${steamId}`), null);
  assert.equal(extractSteamId('https://steamcommunity.com/openid/id/1234'), null);
});

test('Steam OpenID assertion is checked server-to-server before accepting identity', async () => {
  const now = Date.now();
  const state = 'test-state-abc123';
  const expectedReturnTo = `https://playbridge.example/auth/steam/callback?state=${state}`;
  const responseNonce = `${new Date(Math.floor(now / 1000) * 1000).toISOString().replace('.000Z', 'Z')}randomnonce`;
  const claimedId = `https://steamcommunity.com/openid/id/${steamId}`;
  const assertion = new URLSearchParams({
    'openid.ns': STEAM_OPENID_NAMESPACE,
    'openid.mode': 'id_res',
    'openid.op_endpoint': STEAM_OPENID_ENDPOINT,
    'openid.claimed_id': claimedId,
    'openid.identity': claimedId,
    'openid.return_to': expectedReturnTo,
    'openid.response_nonce': responseNonce,
    'openid.assoc_handle': 'test-association',
    'openid.signed': 'op_endpoint,claimed_id,identity,return_to,response_nonce,assoc_handle',
    'openid.sig': 'signed-by-steam',
  });
  let checkedBySteam = false;
  const fakeSteamVerification = async (url, options) => {
    checkedBySteam = true;
    assert.equal(String(url), STEAM_OPENID_ENDPOINT);
    assert.equal(options.method, 'POST');
    assert.equal(new URLSearchParams(options.body).get('openid.mode'), 'check_authentication');
    return { ok: true, text: async () => `ns:${STEAM_OPENID_NAMESPACE}\nis_valid:true\n` };
  };

  assert.equal(await verifySteamOpenId(assertion, expectedReturnTo, fakeSteamVerification, now), true);
  assert.equal(checkedBySteam, true);
});

test('invalid Steam OpenID return_to is rejected before any upstream request', async () => {
  const now = Date.now();
  const expectedReturnTo = 'https://playbridge.example/auth/steam/callback?state=one';
  const claimedId = `https://steamcommunity.com/openid/id/${steamId}`;
  const assertion = new URLSearchParams({
    'openid.ns': STEAM_OPENID_NAMESPACE,
    'openid.mode': 'id_res',
    'openid.op_endpoint': STEAM_OPENID_ENDPOINT,
    'openid.claimed_id': claimedId,
    'openid.identity': claimedId,
    'openid.return_to': 'https://attacker.example/auth/steam/callback?state=one',
    'openid.response_nonce': `${new Date(Math.floor(now / 1000) * 1000).toISOString().replace('.000Z', 'Z')}randomnonce`,
    'openid.assoc_handle': 'test-association',
    'openid.signed': 'op_endpoint,claimed_id,identity,return_to,response_nonce,assoc_handle',
    'openid.sig': 'invalid',
  });
  let called = false;
  const fakeFetch = async () => { called = true; return { ok: true, text: async () => 'is_valid:true' }; };
  assert.equal(await verifySteamOpenId(assertion, expectedReturnTo, fakeFetch, now), false);
  assert.equal(called, false);
});

test('HTTP app exposes real readiness, redirects to Steam and rejects anonymous library reads', async (t) => {
  const app = createServer(createHandler({
    env: {
      PORT: '4174',
      PUBLIC_ORIGIN: 'http://localhost:4174',
      SESSION_SECRET: secret,
      STEAM_WEB_API_KEY: '',
      NODE_ENV: 'development',
    },
    fetchImpl: async () => { throw new Error('Unexpected upstream request in this test.'); },
  }));
  await new Promise((resolve) => app.listen(0, '127.0.0.1', resolve));
  t.after(() => new Promise((resolve, reject) => app.close((error) => error ? reject(error) : resolve())));
  const address = app.address();
  const base = `http://127.0.0.1:${address.port}`;

  const statusResponse = await fetch(`${base}/api/status`);
  assert.equal(statusResponse.status, 200);
  const status = await statusResponse.json();
  assert.equal(status.backend, 'online');
  assert.match(statusResponse.headers.get('content-security-policy'), /connect-src 'self' https:\/\/api\.github\.com/);
  assert.equal(status.steam.loginReady, true);
  assert.equal(status.steam.libraryReady, false);
  assert.equal(status.installation.automaticDepotDownload, false);
  assert.equal(status.cloud.ready, false);
  assert.equal(status.cloudStorage.provider, 'dropbox');
  assert.equal(status.cloudStorage.enabled, false);
  assert.deepEqual(status.settings, { localSetupAvailable: false, autoLoginEnabled: false });

  const sessionResponse = await fetch(`${base}/api/session`);
  assert.deepEqual(await sessionResponse.json(), { authenticated: false, steamId: null });

  const gamesResponse = await fetch(`${base}/api/games`);
  assert.equal(gamesResponse.status, 401);
  assert.equal((await gamesResponse.json()).error.code, 'steam_login_required');

  const loginResponse = await fetch(`${base}/auth/steam/start`, { redirect: 'manual' });
  assert.equal(loginResponse.status, 302);
  assert.match(loginResponse.headers.get('location'), /^https:\/\/steamcommunity\.com\/openid\/login\?/);
  assert.match(loginResponse.headers.get('set-cookie'), /HttpOnly/);
  assert.match(loginResponse.headers.get('set-cookie'), /SameSite=Lax/);
});

test('portable mode configures Steam Web API only from the loopback UI and persists no key in responses', async (t) => {
  const dataDirectory = await mkdtemp(path.join(tmpdir(), 'playbridge-local-'));
  const settingsFile = path.join(dataDirectory, 'settings.json');
  const app = createServer(createHandler({
    env: {
      PORT: '4174',
      PUBLIC_ORIGIN: 'http://localhost:4174',
      SESSION_SECRET: secret,
      LOCAL_SETUP_MODE: '1',
      PLAYBRIDGE_CONFIG_FILE: settingsFile,
      NODE_ENV: 'development',
    },
    fetchImpl: async () => { throw new Error('Unexpected upstream request in this test.'); },
  }));
  await new Promise((resolve) => app.listen(0, '127.0.0.1', resolve));
  t.after(async () => {
    await new Promise((resolve, reject) => app.close((error) => error ? reject(error) : resolve()));
    await rm(dataDirectory, { recursive: true, force: true });
  });
  const base = `http://127.0.0.1:${app.address().port}`;
  const initialStatus = await (await fetch(`${base}/api/status`)).json();
  assert.equal(initialStatus.settings.localSetupAvailable, true);
  assert.equal(initialStatus.settings.autoLoginEnabled, true);
  assert.equal(initialStatus.steam.libraryReady, false);

  const apiKey = 'abcdef0123456789abcdef0123456789';
  const saveResponse = await fetch(`${base}/api/settings/steam`, {
    method: 'POST',
    headers: { Origin: 'http://localhost:4174', 'Content-Type': 'application/json' },
    body: JSON.stringify({ steamApiKey: apiKey }),
  });
  assert.equal(saveResponse.status, 200);
  assert.deepEqual(await saveResponse.json(), { libraryReady: true, autoLoginEnabled: true });
  const saved = JSON.parse(await readFile(settingsFile, 'utf8'));
  assert.equal(saved.sessionSecret, secret);
  assert.equal(saved.steamApiKey, apiKey);
  assert.equal(saved.autoLoginEnabled, true);

  const statusResponse = await fetch(`${base}/api/status`);
  const status = await statusResponse.json();
  assert.equal(status.steam.libraryReady, true);
  assert.doesNotMatch(JSON.stringify(status), new RegExp(apiKey));

  const autoLoginResponse = await fetch(`${base}/api/settings/steam`, {
    method: 'POST',
    headers: { Origin: 'http://localhost:4174', 'Content-Type': 'application/json' },
    body: JSON.stringify({ autoLoginEnabled: false }),
  });
  assert.deepEqual(await autoLoginResponse.json(), { libraryReady: true, autoLoginEnabled: false });
  const autoLoginSaved = JSON.parse(await readFile(settingsFile, 'utf8'));
  assert.equal(autoLoginSaved.steamApiKey, apiKey);
  assert.equal(autoLoginSaved.autoLoginEnabled, false);

  const rejected = await fetch(`${base}/api/settings/steam`, {
    method: 'POST',
    headers: { Origin: 'https://attacker.example', 'Content-Type': 'application/json' },
    body: JSON.stringify({ steamApiKey: '0'.repeat(32) }),
  });
  assert.equal(rejected.status, 403);
});

test('authenticated library request only calls Steam Web API server-side and returns sanitized game metadata', async (t) => {
  const apiKey = 'server-only-test-key';
  const now = Math.floor(Date.now() / 1000);
  const sessionToken = createSignedToken({ steamId, exp: now + 300 }, secret, 'session');
  let requestedUrl;
  const app = createServer(createHandler({
    env: {
      PORT: '4174',
      PUBLIC_ORIGIN: 'http://localhost:4174',
      SESSION_SECRET: secret,
      STEAM_WEB_API_KEY: apiKey,
      NODE_ENV: 'development',
    },
    fetchImpl: async (url) => {
      requestedUrl = new URL(String(url));
      return {
        ok: true,
        status: 200,
        json: async () => ({ response: { game_count: 2, games: [
          { appid: 10, name: 'Game Two', playtime_forever: 240 },
          { appid: 11, name: '<script>Game One</script>', playtime_forever: 30 },
        ] } }),
      };
    },
  }));
  await new Promise((resolve) => app.listen(0, '127.0.0.1', resolve));
  t.after(() => new Promise((resolve, reject) => app.close((error) => error ? reject(error) : resolve())));
  const response = await fetch(`http://127.0.0.1:${app.address().port}/api/games`, {
    headers: { cookie: `pb_session=${encodeURIComponent(sessionToken)}` },
  });
  assert.equal(response.status, 200);
  assert.equal(requestedUrl.hostname, 'api.steampowered.com');
  assert.equal(requestedUrl.searchParams.get('key'), apiKey);
  assert.equal(requestedUrl.searchParams.get('steamid'), steamId);
  assert.equal(requestedUrl.searchParams.get('include_appinfo'), 'true');
  const body = await response.json();
  assert.equal(body.totalCount, 2);
  assert.equal(body.games[0].appId, 10);
  assert.equal(body.games[0].playtimeMinutes, 240);
  assert.equal(body.games[1].name, '<script>Game One</script>');
});

test('Dropbox OAuth binds to the signed Steam session and saves/loads a sanitized snapshot', async (t) => {
  const tokenSecret = 'test-dropbox-token-secret-with-more-than-32-characters';
  const appKey = 'dropbox-test-app-key';
  const appSecret = 'dropbox-test-app-secret';
  const refreshToken = 'dropbox-refresh-token-for-test-only-123456';
  const sessionToken = createSignedToken({ steamId, exp: Math.floor(Date.now() / 1000) + 3600 }, secret, 'session');
  let uploadedSnapshot;
  const upstreamRequests = [];
  const jsonResponse = (payload, status = 200) => ({ ok: status >= 200 && status < 300, status, json: async () => payload });
  const fetchDropbox = async (input, options = {}) => {
    const url = new URL(String(input));
    upstreamRequests.push({ url, options });
    if (url.hostname === 'api.dropboxapi.com' && url.pathname === '/oauth2/token') {
      assert.equal(options.headers.authorization, `Basic ${Buffer.from(`${appKey}:${appSecret}`).toString('base64')}`);
      const form = new URLSearchParams(options.body);
      if (form.get('grant_type') === 'authorization_code') {
        assert.equal(form.get('code'), 'test-authorization-code');
        assert.equal(form.get('redirect_uri'), 'https://playbridge.example/auth/dropbox/callback');
        return jsonResponse({ refresh_token: refreshToken });
      }
      assert.equal(form.get('grant_type'), 'refresh_token');
      assert.equal(form.get('refresh_token'), refreshToken);
      return jsonResponse({ access_token: 'dropbox-access-token-long-enough' });
    }
    if (url.hostname === 'content.dropboxapi.com' && url.pathname === '/2/files/upload') {
      assert.equal(options.headers.authorization, 'Bearer dropbox-access-token-long-enough');
      assert.deepEqual(JSON.parse(options.headers['dropbox-api-arg']), {
        path: `/library-${steamId}.json`, mode: 'overwrite', autorename: false, mute: true,
      });
      uploadedSnapshot = JSON.parse(options.body);
      return jsonResponse({ name: `library-${steamId}.json` });
    }
    if (url.hostname === 'content.dropboxapi.com' && url.pathname === '/2/files/download') {
      assert.equal(options.headers.authorization, 'Bearer dropbox-access-token-long-enough');
      assert.deepEqual(JSON.parse(options.headers['dropbox-api-arg']), { path: `/library-${steamId}.json` });
      return jsonResponse(uploadedSnapshot);
    }
    throw new Error(`Unexpected Dropbox endpoint: ${url}`);
  };

  const app = createServer(createHandler({
    env: {
      PORT: '4174',
      PUBLIC_ORIGIN: 'https://playbridge.example',
      SESSION_SECRET: secret,
      DROPBOX_APP_KEY: appKey,
      DROPBOX_APP_SECRET: appSecret,
      DROPBOX_TOKEN_SECRET: tokenSecret,
      NODE_ENV: 'production',
    },
    fetchImpl: fetchDropbox,
  }));
  await new Promise((resolve) => app.listen(0, '127.0.0.1', resolve));
  t.after(() => new Promise((resolve, reject) => app.close((error) => error ? reject(error) : resolve())));
  const base = `http://127.0.0.1:${app.address().port}`;
  const steamCookie = `pb_session=${encodeURIComponent(sessionToken)}`;

  const statusResponse = await fetch(`${base}/api/dropbox/status`, { headers: { cookie: steamCookie } });
  assert.deepEqual(await statusResponse.json(), {
    enabled: true,
    connected: false,
    provider: 'dropbox',
    destination: 'Dropbox App Folder/library-<SteamID>.json',
  });

  const start = await fetch(`${base}/auth/dropbox/start?return_to=%2Fcloud-play%2F%23library`, {
    headers: { cookie: steamCookie },
    redirect: 'manual',
  });
  assert.equal(start.status, 302);
  const authorizeUrl = new URL(start.headers.get('location'));
  assert.equal(authorizeUrl.hostname, 'www.dropbox.com');
  assert.equal(authorizeUrl.searchParams.get('client_id'), appKey);
  assert.equal(authorizeUrl.searchParams.get('response_type'), 'code');
  assert.equal(authorizeUrl.searchParams.get('token_access_type'), 'offline');
  assert.equal(authorizeUrl.searchParams.get('scope'), 'files.content.read files.content.write');
  assert.equal(authorizeUrl.searchParams.get('redirect_uri'), 'https://playbridge.example/auth/dropbox/callback');
  const stateCookieHeader = start.headers.getSetCookie().find((cookie) => cookie.startsWith('pb_dropbox_state='));
  assert.ok(stateCookieHeader);
  assert.match(stateCookieHeader, /HttpOnly/);
  assert.match(stateCookieHeader, /Secure/);
  const stateCookiePair = stateCookieHeader.split(';', 1)[0];

  const callback = await fetch(`${base}/auth/dropbox/callback?state=${encodeURIComponent(authorizeUrl.searchParams.get('state'))}&code=test-authorization-code`, {
    headers: { cookie: `${steamCookie}; ${stateCookiePair}` },
    redirect: 'manual',
  });
  assert.equal(callback.status, 303);
  assert.equal(callback.headers.get('location'), '/cloud-play/?dropbox=connected#library');
  const callbackCookies = callback.headers.getSetCookie();
  const tokenCookieHeader = callbackCookies.find((cookie) => cookie.startsWith('pb_dropbox='));
  assert.ok(tokenCookieHeader);
  assert.match(tokenCookieHeader, /HttpOnly/);
  assert.match(tokenCookieHeader, /Secure/);
  const tokenCookiePair = tokenCookieHeader.split(';', 1)[0];
  const encryptedToken = decodeURIComponent(tokenCookiePair.slice('pb_dropbox='.length));
  assert.deepEqual(decryptDropboxRefreshToken(encryptedToken, tokenSecret).refreshToken, refreshToken);
  const linkedCookies = `${steamCookie}; ${tokenCookiePair}`;

  const connectedStatus = await fetch(`${base}/api/dropbox/status`, { headers: { cookie: linkedCookies } });
  assert.equal((await connectedStatus.json()).connected, true);
  const otherSession = createSignedToken({ steamId: '76561198000000001', exp: Math.floor(Date.now() / 1000) + 3600 }, secret, 'session');
  const crossAccountStatus = await fetch(`${base}/api/dropbox/status`, {
    headers: { cookie: `pb_session=${encodeURIComponent(otherSession)}; ${tokenCookiePair}` },
  });
  assert.equal((await crossAccountStatus.json()).connected, false);

  const snapshotInput = {
    totalCount: 2,
    games: [
      { appId: 10, name: 'Example Game', playtimeMinutes: 120, iconHash: 'a'.repeat(40), ignored: 'not stored' },
      { appId: 11, name: 'Another Game', playtimeMinutes: 0, iconHash: null },
    ],
  };
  const rejectedOrigin = await fetch(`${base}/api/dropbox/snapshot`, {
    method: 'POST',
    headers: { cookie: linkedCookies, origin: 'https://attacker.example', 'content-type': 'application/json' },
    body: JSON.stringify(snapshotInput),
  });
  assert.equal(rejectedOrigin.status, 403);
  assert.equal(uploadedSnapshot, undefined);

  const saved = await fetch(`${base}/api/dropbox/snapshot`, {
    method: 'POST',
    headers: { cookie: linkedCookies, origin: 'https://playbridge.example', 'content-type': 'application/json' },
    body: JSON.stringify(snapshotInput),
  });
  assert.equal(saved.status, 200);
  const savedBody = await saved.json();
  assert.equal(savedBody.gameCount, 2);
  assert.equal(savedBody.destination, `Dropbox App Folder/library-${steamId}.json`);
  assert.deepEqual(uploadedSnapshot.games[0], {
    appId: 10, name: 'Example Game', playtimeMinutes: 120, iconHash: 'a'.repeat(40),
  });
  assert.equal(uploadedSnapshot.steamId, steamId);
  assert.equal(JSON.stringify(uploadedSnapshot).includes(refreshToken), false);

  const restored = await fetch(`${base}/api/dropbox/snapshot`, { headers: { cookie: linkedCookies } });
  assert.equal(restored.status, 200);
  const restoredBody = await restored.json();
  assert.equal(restoredBody.snapshot.steamId, steamId);
  assert.equal(restoredBody.snapshot.games.length, 2);
  assert.ok(upstreamRequests.some(({ url }) => url.pathname === '/2/files/upload'));
  assert.ok(upstreamRequests.some(({ url }) => url.pathname === '/2/files/download'));

  const logout = await fetch(`${base}/api/logout`, {
    method: 'POST',
    headers: { cookie: linkedCookies, origin: 'https://playbridge.example', 'content-type': 'application/json' },
    body: '{}',
  });
  assert.equal(logout.status, 200);
  assert.ok(logout.headers.getSetCookie().some((cookie) => cookie.startsWith('pb_dropbox=') && cookie.includes('Max-Age=0')));
});

test('PWA shell metadata, update worker, and install icons are served with correct types', async (t) => {
  const app = createServer(createHandler({
    env: {
      PORT: '4174',
      PUBLIC_ORIGIN: 'http://localhost:4174',
      SESSION_SECRET: secret,
      NODE_ENV: 'development',
    },
  }));
  await new Promise((resolve) => app.listen(0, '127.0.0.1', resolve));
  t.after(() => new Promise((resolve, reject) => app.close((error) => error ? reject(error) : resolve())));
  const base = `http://127.0.0.1:${app.address().port}/cloud-play/`;

  const manifestResponse = await fetch(`${base}manifest.webmanifest`);
  assert.equal(manifestResponse.status, 200);
  assert.match(manifestResponse.headers.get('content-type'), /^application\/manifest\+json/);
  assert.equal(manifestResponse.headers.get('cache-control'), 'no-cache');
  const manifest = await manifestResponse.json();
  assert.equal(manifest.name, 'PLAYBRIDGE');
  assert.equal(manifest.version, '0.7.0');
  assert.equal(manifest.start_url, './');
  assert.ok(manifest.icons.some((icon) => icon.sizes === '192x192' && icon.purpose === 'any'));
  assert.ok(manifest.icons.some((icon) => icon.sizes === '512x512' && icon.purpose === 'maskable'));

  const workerResponse = await fetch(`${base}sw.js`);
  assert.equal(workerResponse.status, 200);
  assert.match(workerResponse.headers.get('content-type'), /^text\/javascript/);
  assert.equal(workerResponse.headers.get('cache-control'), 'no-cache');
  const worker = await workerResponse.text();
  assert.match(worker, /registration\.scope/);
  assert.match(worker, /self\.skipWaiting\(\)/);
  assert.match(worker, /playbridge-shell-0\.7\.0/);
  assert.match(worker, /url\.pathname\.includes\('\/api\/'\) \|\| url\.pathname\.includes\('\/auth\/'\)/);
  assert.match(worker, /fresh\.ok && !url\.search/);

  const stylesResponse = await fetch(`${base}styles.css`);
  assert.equal(stylesResponse.status, 200);
  const styles = await stylesResponse.text();
  assert.match(styles, /env\(safe-area-inset-bottom\)/);
  assert.match(styles, /position: fixed; inset: auto 0 0/);
  assert.match(styles, /\.nav-link::after/);
  assert.match(styles, /@media \(max-width: 680px\)/);
  assert.match(styles, /@media \(max-width: 560px\)/);
  assert.match(styles, /min-height: 44px/);
  assert.match(styles, /\.faq-item summary/);
  assert.match(styles, /\.remote-pad \{/);
  assert.match(styles, /\.pad-key \{[^}]*min-height: 52px/);
  assert.match(styles, /\.remote-stage \{[^}]*aspect-ratio: 16 \/ 9/);
  assert.match(styles, /@media \(max-width: 900px\)/);

  const appJsResponse = await fetch(`${base}app.js`);
  assert.equal(appJsResponse.status, 200);
  const appJs = await appJsResponse.text();
  assert.match(appJs, /navigator\.serviceWorker\.register/);
  assert.match(appJs, /registration\.update\(\)/);
  assert.match(appJs, /window\.location\.reload\(\)/);
  assert.match(appJs, /await api\('\/api\/session'\)/);
  assert.match(appJs, /loadGames\(\)/);
  assert.match(appJs, /api\('\/api\/dropbox\/snapshot'/);
  assert.match(appJs, /api\('\/api\/settings\/steam'/);
  assert.match(appJs, /localSettingsDialog\.showModal\(\)/);
  assert.match(appJs, /AUTO_LOGIN_RETRY_MS = 10 \* 60 \* 1000/);
  assert.match(appJs, /status\.settings\?\.autoLoginEnabled/);
  assert.match(appJs, /new IntersectionObserver/);
  assert.match(appJs, /setAttribute\('aria-current', 'location'\)/);
  assert.match(appJs, /api\('\/api\/remote\/session'\)/);
  assert.match(appJs, /remotePost\('\/api\/remote\/pair'/);
  assert.match(appJs, /\/api\/remote\/screen\?ts=/);
  assert.match(appJs, /\/api\/remote\/input/);
  assert.match(appJs, /\/api\/remote\/launch/);
  assert.match(appJs, /updateStatus\.addEventListener\('click'/);
  assert.match(appJs, /15 \* 60 \* 1000/);
  assert.match(appJs, /window\.addEventListener\('online'/);
  assert.match(appJs, /api\.github\.com\/repos\/m98978672-boop\/games\/contents\/cloud-play\/manifest\.webmanifest\?ref=main/);
  assert.match(appJs, /compareAppVersions\(githubVersion, installedVersion\)/);
  assert.match(appJs, /GITHUB_VERSION_CACHE_TTL_MS = 15 \* 60 \* 1000/);
  assert.match(appJs, /credentials: 'omit'/);
  assert.doesNotMatch(appJs, /raw\.githubusercontent\.com/);
  const versionHelpers = appJs.match(/function parseAppVersion\(version\) \{[\s\S]*?\n\}\n\nfunction compareAppVersions\(left, right\) \{[\s\S]*?\n\}/)?.[0];
  assert.ok(versionHelpers, 'version parsing and comparison helpers should be present');
  const loadVersionHelpers = new Function(`${versionHelpers}; return { parseAppVersion, compareAppVersions };`);
  const { parseAppVersion, compareAppVersions } = loadVersionHelpers();
  assert.deepEqual(parseAppVersion('1.2.3'), [1, 2, 3]);
  assert.equal(compareAppVersions('0.4.0', '0.3.9'), 1);
  assert.equal(compareAppVersions('0.3.9', '0.4.0'), -1);
  assert.equal(compareAppVersions('0.4.0', '0.4.0'), 0);
  assert.equal(compareAppVersions('invalid', '0.4.0'), null);

  const portableUpdater = await readFile(new URL('./portable-launcher.mjs', import.meta.url), 'utf8');
  assert.match(portableUpdater, /api\.github\.com\/repos\/m98978672-boop\/games/);
  assert.match(portableUpdater, /gitBlobSha\(bytes\) !== item\.sha/);
  assert.match(portableUpdater, /CHECK_INTERVAL_MS = 15 \* 60 \* 1000/);
  assert.match(portableUpdater, /SESSION_TTL_SECONDS = 30 \* 24 \* 60 \* 60/);
  assert.match(portableUpdater, /autoLoginEnabled = typeof saved\?\.autoLoginEnabled === 'boolean' \? saved\.autoLoginEnabled : true/);
  assert.doesNotMatch(portableUpdater, /raw\.githubusercontent\.com/);
  const portableManifest = JSON.parse(await readFile(new URL('./portable-update-manifest.json', import.meta.url), 'utf8'));
  assert.equal(portableManifest.schema, 1);
  assert.ok(portableManifest.files.includes('server.mjs'));
  assert.ok(portableManifest.files.includes('remote-access.mjs'));
  assert.ok(portableManifest.files.includes('app.js'));
  assert.ok(portableManifest.files.includes('START-PLAYBRIDGE-WINDOWS.bat'));

  for (const [file, expectedSize] of [['icon-192.png', 192], ['icon-512.png', 512], ['icon-maskable-512.png', 512]]) {
    const iconResponse = await fetch(`${base}icons/${file}`);
    assert.equal(iconResponse.status, 200);
    assert.match(iconResponse.headers.get('content-type'), /^image\/png/);
    assert.equal(iconResponse.headers.get('cache-control'), 'no-cache');
    const icon = Buffer.from(await iconResponse.arrayBuffer());
    assert.equal(icon.subarray(0, 8).toString('hex'), '89504e470d0a1a0a');
    assert.equal(icon.readUInt32BE(16), expectedSize);
    assert.equal(icon.readUInt32BE(20), expectedSize);
  }

  const pageResponse = await fetch(base);
  const page = await pageResponse.text();
  assert.match(page, /rel="manifest" href="manifest\.webmanifest"/);
  assert.match(page, /id="installAppButton"/);
  assert.match(page, /id="dropboxPanel"/);
  assert.match(page, /id="refreshGamesButton"/);
  assert.match(page, /id="saveDropboxButton"/);
  assert.match(page, /id="localSettingsDialog"/);
  assert.match(page, /id="localSettingsButton"/);
  assert.match(page, /viewport-fit=cover/);
  assert.match(page, /data-nav="help"/);
  assert.match(page, /id="help-title"/);
  assert.equal((page.match(/<details class="faq-item">/g) || []).length, 5);
  assert.match(page, /Как телефон подключается к компьютеру\?/);
  assert.match(page, /id="remote-title"/);
  assert.match(page, /id="remoteToggleButton"/);
  assert.match(page, /id="pairCodeInput"/);
  assert.match(page, /id="remoteScreen"/);
  assert.equal((page.match(/data-remote-key="/g) || []).length, 8);
  assert.match(page, /href="https:\/\/steamcommunity\.com\/\?subsection=broadcasts" target="_blank" rel="noopener noreferrer"/);
  assert.match(page, /href="https:\/\/www\.twitch\.tv\/directory\/category\/steam"/);
});

test('remote pairing requires the desktop to approve a one-time code', async (t) => {
  const { createRemoteAccess } = await import('./remote-access.mjs');
  let clock = 1_800_000_000_000;
  const calls = [];
  const remote = createRemoteAccess({
    now: () => clock,
    port: 0,
    networkInterfaces: () => ({ 'Wi-Fi': [{ address: '192.168.1.50', family: 'IPv4', internal: false }] }),
    capture: { available: true, reason: null, grab: async () => Buffer.from('jpeg') },
    input: {
      available: true,
      reason: null,
      key: async (action) => { calls.push(action); return { action }; },
      click: async (x, y) => ({ x, y }),
      open: async (target) => { calls.push(target); return { target }; },
    },
  });
  t.after(() => remote.stop());
  const started = await remote.start();
  assert.equal(started.enabled, true);
  assert.equal(started.code.length, 6);
  assert.deepEqual(started.urls, [`http://192.168.1.50:${started.port}/cloud-play/`]);
  await remote.stop();

  await remote.start();
  const code = remote.status().code;
  assert.throws(() => remote.createRequest({ code: '000000', device: 'Телефон', ip: '10.0.0.9' }), /неверный|истёк/i);

  const created = remote.createRequest({ code, device: '  Телефон\n ', ip: '10.0.0.9' });
  assert.equal(remote.requestStatus({ id: created.id, pollToken: created.pollToken }).status, 'pending');
  assert.throws(() => remote.requestStatus({ id: created.id, pollToken: 'wrong' }), /не найден/i);
  assert.throws(() => remote.claimSession({ id: created.id, pollToken: created.pollToken }), /не подтвердил/i);

  const approved = remote.approve(created.id);
  const session = remote.sessionForToken(approved.token);
  assert.equal(session.device, 'Телефон');
  assert.equal(remote.claimSession({ id: created.id, pollToken: created.pollToken }).device, 'Телефон');
  assert.throws(() => remote.claimSession({ id: created.id, pollToken: created.pollToken }), /не найден/i);

  assert.equal((await remote.grabScreen(approved.token)).toString(), 'jpeg');
  await remote.sendKey(approved.token, 'down');
  await remote.sendClick(approved.token, 0.5, 0.5);
  await remote.launchSteam(approved.token, '730');
  await remote.launchSteam(approved.token, 'bigpicture');
  assert.deepEqual(calls, ['down', 'steam://rungameid/730', 'steam://open/bigpicture']);

  await assert.rejects(remote.sendKey(approved.token, 'ctrl-alt-del'), /не разрешено/i);
  await assert.rejects(remote.launchSteam(approved.token, 'calc.exe'), /Разрешён только/i);
  await assert.rejects(remote.sendKey('unknown-token', 'up'), /Подключи/i);
  await assert.rejects(remote.grabScreen('unknown-token'), /Подключи/i);

  remote.endSession(approved.token);
  assert.equal(remote.sessionForToken(approved.token), null);
  assert.throws(() => remote.approve(created.id), /истёк|обработан/i);

  clock += 3 * 60 * 1000;
  assert.equal(remote.status().code, null);
  const lateCode = remote.issueCode().code;
  const expired = remote.createRequest({ code: lateCode, device: 'Поздний телефон', ip: '10.0.0.10' });
  remote.approve(expired.id);
  clock += 31 * 60 * 1000;
  assert.equal(remote.status().sessions.length, 0);

  const fresh = remote.issueCode();
  for (let attempt = 0; attempt < 6; attempt += 1) {
    assert.throws(() => remote.createRequest({ code: '111111', device: 'Спам', ip: '10.0.0.11' }));
  }
  assert.throws(() => remote.createRequest({ code: fresh.code, device: 'Спам', ip: '10.0.0.11' }), /Слишком много попыток/i);
  await remote.stop();
  assert.equal(remote.status().enabled, false);
});

test('HTTP remote endpoints pair a phone, keep local management private and gate the LAN listener', async (t) => {
  const { createRemoteAccess } = await import('./remote-access.mjs');
  const remote = createRemoteAccess({
    port: 0,
    networkInterfaces: () => ({ Ethernet: [{ address: '192.168.1.77', family: 'IPv4', internal: false }] }),
    capture: { available: true, reason: null, grab: async () => Buffer.from('frame') },
    input: {
      available: true,
      reason: null,
      key: async (action) => ({ action }),
      click: async () => ({ action: 'click' }),
      open: async (target) => ({ target }),
    },
    getHandler: () => handlerRef,
  });
  let handlerRef = null;
  const handler = createHandler({
    env: { PORT: '4174', SESSION_SECRET: secret, PUBLIC_ORIGIN: 'http://localhost:4174' },
    remoteAccess: remote,
  });
  handlerRef = handler;
  const app = createServer(handler);
  await new Promise((resolve) => app.listen(0, '127.0.0.1', resolve));
  t.after(async () => {
    await remote.stop();
    await new Promise((resolve, reject) => app.close((error) => error ? reject(error) : resolve()));
  });
  const base = `http://127.0.0.1:${app.address().port}`;
  const origin = base;

  const status = await (await fetch(`${base}/api/status`)).json();
  assert.equal(status.remote.managementAvailable, true);
  assert.equal(status.remote.enabled, false);
  assert.equal(status.remote.code, null);

  const started = await fetch(`${base}/api/remote/start`, { method: 'POST', headers: { Origin: origin } });
  assert.equal(started.status, 200);
  const startedBody = await started.json();
  assert.equal(startedBody.enabled, true);
  const code = startedBody.code;

  const rejected = await fetch(`${base}/api/remote/pair`, {
    method: 'POST',
    headers: { Origin: origin, 'Content-Type': 'application/json' },
    body: JSON.stringify({ code: '999999', device: 'Телефон' }),
  });
  assert.equal(rejected.status, 403);
  assert.equal((await rejected.json()).error.code, 'invalid_code');

  const pairResponse = await fetch(`${base}/api/remote/pair`, {
    method: 'POST',
    headers: { Origin: origin, 'Content-Type': 'application/json' },
    body: JSON.stringify({ code, device: '  Pixel 8  ' }),
  });
  assert.equal(pairResponse.status, 201);
  const pair = await pairResponse.json();

  const pending = await (await fetch(`${base}/api/remote/pair/status?id=${pair.id}&token=${pair.pollToken}`)).json();
  assert.equal(pending.status, 'pending');

  const hostStatus = await (await fetch(`${base}/api/remote/status`)).json();
  assert.equal(hostStatus.pending.length, 1);
  assert.equal(hostStatus.pending[0].device, 'Pixel 8');
  assert.equal(hostStatus.pending[0].pollToken, undefined);

  const approveResponse = await fetch(`${base}/api/remote/requests/${pair.id}/approve`, {
    method: 'POST',
    headers: { Origin: origin },
  });
  assert.equal(approveResponse.status, 200);
  assert.equal((await approveResponse.json()).sessions.length, 1);

  const approvedResponse = await fetch(`${base}/api/remote/pair/status?id=${pair.id}&token=${pair.pollToken}`);
  const approved = await approvedResponse.json();
  assert.equal(approved.status, 'approved');
  const cookie = (approvedResponse.headers.get('set-cookie') || '').split(';')[0];
  assert.match(cookie, /^pb_remote=[a-f0-9]{64}$/);

  const session = await (await fetch(`${base}/api/remote/session`, { headers: { cookie } })).json();
  assert.equal(session.connected, true);
  assert.deepEqual(session.capabilities, { screen: true, screenReason: null, input: true, inputReason: null });

  const frame = await fetch(`${base}/api/remote/screen`, { headers: { cookie } });
  assert.equal(frame.status, 200);
  assert.equal(frame.headers.get('content-type'), 'image/jpeg');
  assert.equal(await frame.text(), 'frame');

  const inputResponse = await fetch(`${base}/api/remote/input`, {
    method: 'POST',
    headers: { cookie, Origin: origin, 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'ok' }),
  });
  assert.equal(inputResponse.status, 200);
  assert.deepEqual(await inputResponse.json(), { ok: true, action: 'ok' });

  const crossOrigin = await fetch(`${base}/api/remote/input`, {
    method: 'POST',
    headers: { cookie, Origin: 'http://evil.example', 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'ok' }),
  });
  assert.equal(crossOrigin.status, 403);
  assert.equal((await crossOrigin.json()).error.code, 'origin_rejected');

  const anonymousScreen = await fetch(`${base}/api/remote/screen`);
  assert.equal(anonymousScreen.status, 401);

  const remotePort = remote.status().port;
  const lanBlocked = await fetch(`http://127.0.0.1:${remotePort}/api/settings/steam`);
  assert.equal(lanBlocked.status, 403);
  assert.equal((await lanBlocked.json()).error.code, 'remote_path_blocked');
  const lanStatus = await fetch(`http://127.0.0.1:${remotePort}/api/status`);
  assert.equal(lanStatus.status, 200);
  const lanStatusBody = await lanStatus.json();
  assert.equal(lanStatusBody.remote.managementAvailable, false);
  assert.equal(lanStatusBody.remoteContext, true);
  const lanShell = await fetch(`http://127.0.0.1:${remotePort}/cloud-play/`);
  assert.equal(lanShell.status, 200);
  assert.match(await lanShell.text(), /Пульт и трансляции/);

  const leave = await fetch(`${base}/api/remote/leave`, { method: 'POST', headers: { cookie, Origin: origin } });
  assert.equal(leave.status, 200);
  assert.match(leave.headers.get('set-cookie'), /pb_remote=;/);
  assert.equal((await (await fetch(`${base}/api/remote/session`, { headers: { cookie } })).json()).connected, false);

  const stop = await fetch(`${base}/api/remote/stop`, { method: 'POST', headers: { Origin: origin } });
  assert.equal(stop.status, 200);
  assert.equal((await stop.json()).enabled, false);
});
