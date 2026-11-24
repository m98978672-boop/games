import assert from 'node:assert/strict';
import {handle, verifiedOwner, workerClaimsAllowed} from '../../supabase/functions/youtube-comments/index.mjs';
const anchor = 'jxXJm327cX8', owner = 'UC' + 'a'.repeat(22), other = 'UC' + 'b'.repeat(22);
assert.equal(verifiedOwner({items:[{id:owner}]}, {items:[{id:anchor,snippet:{channelId:owner}}]}), owner);
for (const [channels, videos] of [
  [{items:[{id:other}]}, {items:[{id:anchor,snippet:{channelId:owner}}]}],
  [{items:[{id:owner}]}, {items:[{id:'wrong',snippet:{channelId:owner}}]}],
  [{items:[]}, {items:[]}],
]) assert.throws(() => verifiedOwner(channels, videos));
const settings = {SUPABASE_SERVICE_ROLE_KEY:'service', SUPABASE_URL:'https://test.supabase.co',
  YOUTUBE_OAUTH_CLIENT_ID:'upload-client', YOUTUBE_COMMENTS_CLIENT_ID:'distinct-client', YOUTUBE_COMMENTS_CLIENT_SECRET:'secret', YOUTUBE_COMMENTS_ENCRYPTION_KEY:'12'.repeat(32)};
globalThis.Deno = {env:{get:key => settings[key]}};
let stateRow, storage, wrongOwner = false, scope = 'https://www.googleapis.com/auth/youtube.force-ssl';
const reqs = [];
globalThis.fetch = async (value, init = {}) => {
  const url = new URL(String(value)); reqs.push([url, init]);
  if (url.hostname === 'test.supabase.co') {
    if (url.pathname.endsWith('/rpc/youtube_comments_begin_oauth')) {
      const input = JSON.parse(init.body); stateRow = {state_hash:input.p_hash, verifier:input.p_verifier, expires_at:input.p_expires};
      return Response.json(true);
    }
    if (url.pathname.endsWith('youtube_comments_oauth_states')) {
      if (url.searchParams.has('state_hash')) { const row = stateRow; stateRow = null; return Response.json(row ? [row] : []); }
      return new Response(null, {status:204});
    }
    if (url.pathname.endsWith('youtube_comments_tokens')) { storage = JSON.parse(init.body); return new Response(null, {status:201}); }
    throw new Error('Unexpected table');
  }
  if (url.hostname === 'oauth2.googleapis.com') return Response.json({access_token:'access', refresh_token:'super-secret-refresh', scope});
  if (url.pathname.endsWith('/channels')) return Response.json({items:[{id:wrongOwner ? other : owner}]});
  if (url.pathname.endsWith('/videos')) return Response.json({items:[{id:anchor, snippet:{channelId:owner}}]});
  throw new Error('Unexpected URL');
};
async function initiate() {
  const response = await handle(new Request('https://test.supabase.co/functions/v1/youtube-comments/auth/start'));
  assert.equal(response.status,302);
  const url = new URL(response.headers.get('location'));
  assert.equal(url.searchParams.get('client_id'),'distinct-client');
  assert.equal(url.searchParams.get('scope'),scope);
  assert.equal(url.searchParams.get('code_challenge_method'),'S256');
  assert.equal(url.searchParams.get('include_granted_scopes'),'false');
  return url.searchParams.get('state');
}
async function finish(state) { return handle(new Request(`https://test.supabase.co/functions/v1/youtube-comments/oauth/callback?state=${state}&code=example`)); }
settings.YOUTUBE_COMMENTS_CLIENT_ID = settings.YOUTUBE_OAUTH_CLIENT_ID;
assert.equal((await handle(new Request('https://test.supabase.co/functions/v1/youtube-comments/auth/start'))).status,503);
assert.equal(stateRow,undefined);
settings.YOUTUBE_COMMENTS_CLIENT_ID = 'distinct-client';
let state = await initiate();
wrongOwner = true;
assert.equal((await finish(state)).status,503);
assert.equal(storage, undefined);
assert.equal((await finish(state)).status,400);
wrongOwner = false;
state = await initiate();
assert.equal((await finish(state)).status,200);
assert.equal(storage.slot,'comments-owner');
assert.equal(storage.channel_id,owner);
assert.ok(!JSON.stringify(storage).includes('super-secret-refresh'));
assert.ok(reqs.filter(([u]) => u.hostname === 'test.supabase.co').every(([u]) => !u.pathname.includes('youtube_bot_tokens')));
assert.equal((await finish(state)).status,400);
storage = undefined;
state = await initiate(); scope = 'https://www.googleapis.com/auth/youtube.readonly';
assert.equal((await finish(state)).status,503);
assert.equal(storage,undefined);
const now = Math.floor(Date.now() / 1000);
const claims = {iss:'https://token.actions.githubusercontent.com', aud:'youtube-comments', repository:'m98978672-boop/games', ref:'refs/heads/main', workflow_ref:'m98978672-boop/games/.github/workflows/youtube-comments-autopilot.yml@refs/heads/main', event_name:'schedule', iat:now, exp:now+300};
assert.ok(workerClaimsAllowed(claims, now));
for (const changes of [{ref:'refs/heads/evil'}, {aud:'youtube-bot'}, {event_name:'pull_request'}, {exp:now-1}, {workflow_ref:'other'}]) assert.equal(workerClaimsAllowed({...claims,...changes}, now), false);
const kp = await crypto.subtle.generateKey({name:'RSASSA-PKCS1-v1_5', modulusLength:2048, publicExponent:new Uint8Array([1,0,1]), hash:'SHA-256'}, true, ['sign','verify']);
const jwk = {...await crypto.subtle.exportKey('jwk', kp.publicKey), kid:'worker-key'};
const b64u = bytes => Buffer.from(bytes).toString('base64url');
const jwt = async (payload, key = kp.privateKey) => {
  const prefix = `${b64u(JSON.stringify({alg:'RS256',kid:'worker-key'}))}.${b64u(JSON.stringify(payload))}`;
  return `${prefix}.${b64u(await crypto.subtle.sign('RSASSA-PKCS1-v1_5', key, new TextEncoder().encode(prefix)))}`;
};
const good = await jwt(claims), bad = await jwt({...claims,ref:'refs/heads/evil'});
const fetchBeforeWorker = globalThis.fetch;
settings.YOUTUBE_COMMENTS_AUTO_ENABLED = 'true';
scope = 'https://www.googleapis.com/auth/youtube.force-ssl';
state = await initiate(); await finish(state);
const saved = storage;
let reservations = 0;
globalThis.fetch = async (value, init = {}) => {
  const u = new URL(String(value));
  if (u.hostname === 'token.actions.githubusercontent.com') return Response.json({keys:[jwk]});
  if (u.hostname === 'test.supabase.co' && u.pathname.endsWith('/youtube_comments_tokens')) return Response.json([saved]);
  if (u.hostname === 'test.supabase.co' && u.pathname.endsWith('/rpc/youtube_comments_reserve_reply')) { reservations++; return Response.json(true); }
  return fetchBeforeWorker(value, init);
};
const workerCall = (path, token, body = {}) => handle(new Request(`https://test.supabase.co/functions/v1/youtube-comments/worker/${path}`, {method:'POST',headers:{authorization:`Bearer ${token}`,'content-type':'application/json'},body:JSON.stringify(body)}));
assert.equal((await workerCall('reserve',bad,{parent_id:'parent'})).status,503);
const forged = good.slice(0, good.lastIndexOf('.') + 1) + b64u(new Uint8Array(256));
assert.equal((await workerCall('reserve',forged,{parent_id:'parent'})).status,503);
assert.equal((await workerCall('reserve','malformed',{parent_id:'parent'})).status,503);
assert.equal(reservations,0);
assert.equal((await workerCall('reserve',good,{parent_id:'parent'})).status,200);
assert.equal(reservations,1);
assert.equal((await workerCall('token',good)).status,200);
settings.YOUTUBE_COMMENTS_AUTO_ENABLED = 'false';
assert.equal((await workerCall('reserve',good,{parent_id:'another'})).status,403);
assert.equal(reservations,1);
console.log('Separate comment OAuth and authenticated worker tests passed');
