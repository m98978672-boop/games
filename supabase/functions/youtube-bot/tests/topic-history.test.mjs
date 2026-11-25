// Run with Node 22's TypeScript stripping; the real handler is exercised with
// a locally signed GitHub-shaped JWT and an isolated mocked database.
import assert from 'node:assert/strict';
import {webcrypto} from 'node:crypto';
if (!globalThis.crypto) globalThis.crypto = webcrypto;
let handler;
globalThis.Deno = {
  env: {get: (name) => ({SUPABASE_URL: 'https://db.invalid', SUPABASE_SERVICE_ROLE_KEY: 'service-test'})[name]},
  serve: (fn) => { handler = fn; },
};
const keys = await crypto.subtle.generateKey({name:'RSASSA-PKCS1-v1_5', modulusLength:2048, publicExponent:new Uint8Array([1,0,1]), hash:'SHA-256'}, true, ['sign','verify']);
const jwk = await crypto.subtle.exportKey('jwk', keys.publicKey);
jwk.kid = 'test-key';
let history = {version:1, game_ids:['123', '456']};
let dbCalls = 0;
globalThis.fetch = async (url, options) => {
  if (String(url) === 'https://token.actions.githubusercontent.com/.well-known/jwks') return Response.json({keys:[jwk]});
  assert.equal(String(url), 'https://db.invalid/rest/v1/rpc/youtube_bot_review_topic_history');
  assert.equal(options.method, 'POST');
  dbCalls++;
  return Response.json(history);
};
await import('../../youtube-topic-history/index.ts');
const b64 = value => Buffer.from(JSON.stringify(value)).toString('base64url');
const now = Math.floor(Date.now()/1000);
const claims = {iss:'https://token.actions.githubusercontent.com', aud:'youtube-bot', repository:'m98978672-boop/games', ref:'refs/heads/main', workflow_ref:'m98978672-boop/games/.github/workflows/youtube-shorts-autopilot.yml@refs/heads/main', event_name:'schedule', iat:now, exp:now+300};
async function jwt(data) {
  const message = `${b64({alg:'RS256',kid:'test-key'})}.${b64(data)}`;
  const signature = await crypto.subtle.sign('RSASSA-PKCS1-v1_5', keys.privateKey, new TextEncoder().encode(message));
  return `${message}.${Buffer.from(signature).toString('base64url')}`;
}
async function request(token) {
  return handler(new Request('https://test.invalid/functions/v1/youtube-topic-history', {method:'POST', headers:{Authorization:`Bearer ${token}`}}));
}
let response = await request(await jwt(claims));
assert.equal(response.status, 200);
assert.deepEqual(await response.json(), history);
assert.equal(dbCalls, 1);
response = await request(await jwt({...claims, ref:'refs/heads/untrusted'}));
assert.equal(response.status, 401);
assert.equal(dbCalls, 1, 'untrusted identity must not reach database');
history = {version:1, game_ids:['bad id']};
response = await request(await jwt(claims));
assert.equal(response.status, 503);
console.log('Topic history endpoint: signed identity, validation, fail closed passed');
