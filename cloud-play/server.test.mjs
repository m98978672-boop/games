import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import {
  createHandler,
  createSignedToken,
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
