import assert from 'node:assert/strict';
import {handle, verifiedOwner} from '../../supabase/functions/youtube-comments/index.mjs';
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
    if (url.pathname.endsWith('youtube_comments_oauth_states')) {
      if (init.method === 'POST') { stateRow = JSON.parse(init.body); return new Response(null, {status:201}); }
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
console.log('Separate comment OAuth tests passed');
