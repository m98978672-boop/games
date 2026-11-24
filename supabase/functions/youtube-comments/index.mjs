// Separate experimental OAuth service for comments. Not deployed by this file.
// The anchor is an already published video independently observed on "Зуза".
// If it becomes unavailable, connection fails closed until the anchor is reviewed.
const ANCHOR_VIDEO_ID = 'jxXJm327cX8';
const PROJECT = 'https://cuhfnzgytndyntpbnbda.supabase.co';
const CALLBACK = `${PROJECT}/functions/v1/youtube-comments/oauth/callback`;
const SCOPE = 'https://www.googleapis.com/auth/youtube.force-ssl';
const encoder = new TextEncoder();

function b64(bytes) {
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}
function b64url(bytes) { return b64(bytes).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''); }
async function hash(value) {
  const bytes = new Uint8Array(await crypto.subtle.digest('SHA-256', encoder.encode(value)));
  return [...bytes].map(x => x.toString(16).padStart(2, '0')).join('');
}
function env(name) {
  const value = Deno.env.get(name);
  if (!value) throw new Error('Missing configuration');
  return value;
}
function page(message, status = 200) {
  // Only fixed, developer-controlled strings are passed here.
  return new Response(`<!doctype html><html lang="ru"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>YouTube Bot</title><body style="font:17px system-ui;max-width:38rem;margin:12vh auto;padding:1rem"><h1>Комментарии YouTube</h1><p>${message}</p></body></html>`, {
    status, headers: {'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store', 'Referrer-Policy':'no-referrer', 'Content-Security-Policy':"default-src 'none'; style-src 'unsafe-inline'; base-uri 'none'; frame-ancestors 'none'"},
  });
}
async function db(table, query, init = {}) {
  const key = env('SUPABASE_SERVICE_ROLE_KEY');
  const headers = new Headers(init.headers);
  headers.set('apikey', key);
  headers.set('Authorization', `Bearer ${key}`);
  headers.set('Content-Type', 'application/json');
  const response = await fetch(`${env('SUPABASE_URL')}/rest/v1/${table}${query}`, {
    ...init, headers, redirect:'error', signal: AbortSignal.timeout(15000),
  });
  if (!response.ok) throw new Error('Storage error');
  return response;
}
async function googleJson(url, init = {}) {
  const response = await fetch(url, {...init, redirect:'error', signal: AbortSignal.timeout(15000)});
  if (!response.ok) throw new Error('Google API error');
  return response.json();
}
async function encrypt(token) {
  // Separate key and associated data prevent confusion with the upload token.
  const raw = env('YOUTUBE_COMMENTS_ENCRYPTION_KEY');
  if (!/^[0-9a-f]{64}$/i.test(raw)) throw new Error('Invalid encryption key');
  const bytes = new Uint8Array(raw.match(/../g).map(x => parseInt(x, 16)));
  const key = await crypto.subtle.importKey('raw', bytes, 'AES-GCM', false, ['encrypt']);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ciphertext = new Uint8Array(await crypto.subtle.encrypt({name:'AES-GCM', iv, additionalData:encoder.encode('youtube-comments-v1')}, key, encoder.encode(token)));
  return {token_cipher:b64(ciphertext), token_iv:b64(iv)};
}

// Verify both the authorized account and the published anchor, before storage.
export function verifiedOwner(channels, videos) {
  const own = Array.isArray(channels?.items) ? channels.items : [];
  const items = Array.isArray(videos?.items) ? videos.items : [];
  if (items.length !== 1 || items[0]?.id !== ANCHOR_VIDEO_ID) throw new Error('Anchor unavailable');
  const id = items[0]?.snippet?.channelId;
  if (typeof id !== 'string' || !/^UC[A-Za-z0-9_-]{22}$/.test(id) || !own.some(item => item?.id === id)) {
    throw new Error('Wrong channel');
  }
  return id;
}

function commentsClient() {
  const client = env('YOUTUBE_COMMENTS_CLIENT_ID');
  if (client === env('YOUTUBE_OAUTH_CLIENT_ID')) throw new Error('Comment and upload clients must be distinct');
  return client;
}
async function start() {
  // An entirely distinct Web client is required, so its grants never replace
  // the publisher's client/token slot. Google must have the callback registered.
  const client = commentsClient();
  const state = b64url(crypto.getRandomValues(new Uint8Array(32)));
  const verifier = b64url(crypto.getRandomValues(new Uint8Array(32)));
  const challenge = b64url(new Uint8Array(await crypto.subtle.digest('SHA-256', encoder.encode(verifier))));
  const expires = new Date(Date.now() + 10 * 60 * 1000).toISOString();
  const created = await db('rpc/youtube_comments_begin_oauth', '', {method:'POST', body:JSON.stringify({p_hash:await hash(state), p_verifier:verifier, p_expires:expires})});
  if (await created.json() !== true) throw new Error('Too many open authorizations');
  const url = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  for (const [key, value] of Object.entries({client_id:client, redirect_uri:CALLBACK, response_type:'code', scope:SCOPE,
    state, code_challenge:challenge, code_challenge_method:'S256', access_type:'offline', prompt:'consent', include_granted_scopes:'false'})) url.searchParams.set(key, value);
  return new Response(null, {status:302, headers:{Location:url.toString(), 'Cache-Control':'no-store', 'Referrer-Policy':'no-referrer'}});
}
async function callback(request) {
  const url = new URL(request.url);
  if (url.searchParams.has('error')) return page('Доступ не выдан. Никакие комментарии не отправлены.');
  const state = url.searchParams.get('state') || '';
  const code = url.searchParams.get('code') || '';
  if (!/^[A-Za-z0-9_-]{43}$/.test(state) || !code || code.length > 4096) return page('Ответ Google неполный.', 400);
  // DELETE ... RETURNING makes state single-use even under concurrent callbacks.
  const deleted = await db('youtube_comments_oauth_states', `?state_hash=eq.${await hash(state)}&select=verifier,expires_at`, {method:'DELETE', headers:{Prefer:'return=representation'}});
  const states = await deleted.json();
  const saved = Array.isArray(states) && states.length === 1 ? states[0] : null;
  if (!saved || !Number.isFinite(Date.parse(saved.expires_at)) || Date.parse(saved.expires_at) <= Date.now() || !/^[A-Za-z0-9_-]{43}$/.test(saved.verifier)) return page('Ссылка истекла или уже использована.', 400);
  const form = new URLSearchParams({code, client_id:commentsClient(), client_secret:env('YOUTUBE_COMMENTS_CLIENT_SECRET'), redirect_uri:CALLBACK, grant_type:'authorization_code', code_verifier:saved.verifier});
  const tokens = await googleJson('https://oauth2.googleapis.com/token', {method:'POST', headers:{'Content-Type':'application/x-www-form-urlencoded'}, body:form});
  if (typeof tokens.refresh_token !== 'string' || !tokens.refresh_token || typeof tokens.access_token !== 'string' || !tokens.access_token ||
      typeof tokens.scope !== 'string' || !tokens.scope.split(/\s+/).includes(SCOPE)) throw new Error('Missing Google permission');
  const headers = {Authorization:`Bearer ${tokens.access_token}`};
  const channels = await googleJson('https://www.googleapis.com/youtube/v3/channels?part=id&mine=true&maxResults=50', {headers});
  const video = await googleJson(`https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${ANCHOR_VIDEO_ID}`, {headers});
  const channelId = verifiedOwner(channels, video);
  const encrypted = await encrypt(tokens.refresh_token);
  await db('youtube_comments_tokens', '?on_conflict=slot', {method:'POST', headers:{Prefer:'resolution=merge-duplicates,return=minimal'}, body:JSON.stringify({slot:'comments-owner', channel_id:channelId, ...encrypted, updated_at:new Date().toISOString()})});
  return page('Разрешение сохранено отдельно. Автоматическое чтение и ответы ещё не включены.');
}
const WORKFLOW = 'm98978672-boop/games/.github/workflows/youtube-comments-autopilot.yml@refs/heads/main';
function decodeBase64(value) {
  const text = atob(value.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4 - value.length % 4) % 4));
  return Uint8Array.from(text, x => x.charCodeAt(0));
}
function jwtJson(part) { return JSON.parse(new TextDecoder().decode(decodeBase64(part))); }
export function workerClaimsAllowed(claims, now) {
  const audiences = Array.isArray(claims.aud) ? claims.aud : [claims.aud];
  return claims.iss === 'https://token.actions.githubusercontent.com' && audiences.includes('youtube-comments') &&
    claims.repository === 'm98978672-boop/games' && claims.ref === 'refs/heads/main' && claims.workflow_ref === WORKFLOW &&
    ['schedule', 'workflow_dispatch'].includes(claims.event_name) && Number.isFinite(claims.exp) && claims.exp > now &&
    Number.isFinite(claims.iat) && claims.iat <= now + 60 && claims.iat >= now - 600;
}
async function verifyWorker(request) {
  const bearer = (request.headers.get('authorization') || '').match(/^Bearer ([^\s]+)$/i)?.[1] || '';
  const parts = bearer.split('.');
  if (parts.length !== 3) throw new Error('No worker identity');
  const header = jwtJson(parts[0]);
  if (header.alg !== 'RS256' || typeof header.kid !== 'string') throw new Error('Wrong worker algorithm');
  const jwks = await googleJson('https://token.actions.githubusercontent.com/.well-known/jwks');
  const jwk = Array.isArray(jwks.keys) ? jwks.keys.find(k => k.kid === header.kid && k.kty === 'RSA') : null;
  if (!jwk) throw new Error('No worker signing key');
  const publicKey = await crypto.subtle.importKey('jwk', jwk, {name:'RSASSA-PKCS1-v1_5',hash:'SHA-256'}, false, ['verify']);
  const valid = await crypto.subtle.verify('RSASSA-PKCS1-v1_5', publicKey, decodeBase64(parts[2]), encoder.encode(`${parts[0]}.${parts[1]}`));
  if (!valid || !workerClaimsAllowed(jwtJson(parts[1]), Math.floor(Date.now() / 1000))) throw new Error('Untrusted worker');
}
async function storedCommentsToken() {
  const response = await db('youtube_comments_tokens', '?slot=eq.comments-owner&select=channel_id,token_cipher,token_iv');
  const rows = await response.json();
  if (!Array.isArray(rows) || rows.length !== 1 || !/^UC[A-Za-z0-9_-]{22}$/.test(rows[0].channel_id)) throw new Error('Not connected');
  return rows[0];
}
async function refreshAccessToken(stored) {
  const raw = env('YOUTUBE_COMMENTS_ENCRYPTION_KEY');
  if (!/^[0-9a-f]{64}$/i.test(raw)) throw new Error('Invalid key');
  const bytes = new Uint8Array(raw.match(/../g).map(x => parseInt(x, 16)));
  const key = await crypto.subtle.importKey('raw', bytes, 'AES-GCM', false, ['decrypt']);
  const clear = await crypto.subtle.decrypt({name:'AES-GCM', iv:decodeBase64(stored.token_iv), additionalData:encoder.encode('youtube-comments-v1')}, key, decodeBase64(stored.token_cipher));
  const refresh = new TextDecoder().decode(clear);
  const form = new URLSearchParams({client_id:commentsClient(), client_secret:env('YOUTUBE_COMMENTS_CLIENT_SECRET'), refresh_token:refresh, grant_type:'refresh_token'});
  const result = await googleJson('https://oauth2.googleapis.com/token', {method:'POST', headers:{'Content-Type':'application/x-www-form-urlencoded'}, body:form});
  if (typeof result.access_token !== 'string' || !result.access_token || typeof result.scope !== 'string' || !result.scope.split(/\s+/).includes(SCOPE)) throw new Error('No comment permission');
  return result.access_token;
}
function jsonResponse(value, status = 200) {
  return Response.json(value, {status, headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
}
async function worker(request, route) {
  await verifyWorker(request);
  if (env('YOUTUBE_COMMENTS_AUTO_ENABLED') !== 'true') return jsonResponse({error:'Comment automation is disabled'}, 403);
  const stored = await storedCommentsToken();
  if (route === '/worker/token') return jsonResponse({access_token:await refreshAccessToken(stored), channel_id:stored.channel_id});
  const body = await request.json();
  if (!body || typeof body.parent_id !== 'string' || !/^[A-Za-z0-9_.-]{1,200}$/.test(body.parent_id)) return jsonResponse({error:'Invalid parent'}, 400);
  if (route === '/worker/reserve') {
    const response = await db('rpc/youtube_comments_reserve_reply', '', {method:'POST', body:JSON.stringify({p_channel:stored.channel_id,p_parent:body.parent_id})});
    return jsonResponse({reserved:(await response.json()) === true});
  }
  if (route === '/worker/sent') {
    if (typeof body.reply_id !== 'string' || !/^[A-Za-z0-9_.-]{1,200}$/.test(body.reply_id)) return jsonResponse({error:'Invalid reply'}, 400);
    const response = await db('youtube_comments_reply_attempts', `?channel_id=eq.${encodeURIComponent(stored.channel_id)}&parent_id=eq.${encodeURIComponent(body.parent_id)}&state=eq.sending`, {method:'PATCH', headers:{Prefer:'return=representation'}, body:JSON.stringify({state:'sent',reply_id:body.reply_id})});
    const updated = await response.json();
    if (!Array.isArray(updated) || updated.length !== 1) return jsonResponse({error:'No pending attempt'}, 409);
    return jsonResponse({recorded:true});
  }
  return jsonResponse({error:'Not found'}, 404);
}

export async function handle(request) {
  const route = new URL(request.url).pathname.replace(/^\/functions\/v1\/youtube-comments(?=\/|$)/, '').replace(/^\/youtube-comments(?=\/|$)/, '').replace(/\/+$/, '');
  try {
    if (request.method === 'GET' && route === '/auth/start') return await start();
    if (request.method === 'GET' && route === '/oauth/callback') return await callback(request);
    if (request.method === 'POST' && ['/worker/token', '/worker/reserve', '/worker/sent'].includes(route)) return await worker(request, route);
    return page('Страница не найдена.', 404);
  } catch {
    // Never log authorization codes, tokens, API response bodies, or account IDs.
    if (route.startsWith('/worker/')) return jsonResponse({error:'Worker unavailable or unauthorized'}, 503);
    return page('Подключение не завершено. Ничего не опубликовано; проверьте настройки и канал.', 503);
  }
}
if (typeof Deno !== 'undefined' && typeof Deno.serve === 'function') Deno.serve(handle);
