import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
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
  assert.equal(status.steam.loginReady, true);
  assert.equal(status.steam.libraryReady, false);
  assert.equal(status.installation.automaticDepotDownload, false);
  assert.equal(status.cloud.ready, false);
  assert.equal(status.cloudStorage.provider, 'dropbox');
  assert.equal(status.cloudStorage.enabled, false);

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
  assert.match(worker, /playbridge-shell-0\.4\.0/);
  assert.match(worker, /url\.pathname\.includes\('\/api\/'\) \|\| url\.pathname\.includes\('\/auth\/'\)/);
  assert.match(worker, /fresh\.ok && !url\.search/);

  const appJsResponse = await fetch(`${base}app.js`);
  assert.equal(appJsResponse.status, 200);
  const appJs = await appJsResponse.text();
  assert.match(appJs, /navigator\.serviceWorker\.register/);
  assert.match(appJs, /registration\.update\(\)/);
  assert.match(appJs, /window\.location\.reload\(\)/);
  assert.match(appJs, /await api\('\/api\/session'\)/);
  assert.match(appJs, /loadGames\(\)/);
  assert.match(appJs, /api\('\/api\/dropbox\/snapshot'/);
  assert.match(appJs, /updateStatus\.addEventListener\('click'/);
  assert.match(appJs, /15 \* 60 \* 1000/);
  assert.match(appJs, /window\.addEventListener\('online'/);

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
});
