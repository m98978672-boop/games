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
    ...init, headers, signal: AbortSignal.timeout(15000),
  });
  if (!response.ok) throw new Error('Storage error');
  return response;
}
async function googleJson(url, init = {}) {
  const response = await fetch(url, {...init, signal: AbortSignal.timeout(15000)});
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
  await db('youtube_comments_oauth_states', `?expires_at=lt.${encodeURIComponent(new Date().toISOString())}`, {method:'DELETE'});
  await db('youtube_comments_oauth_states', '', {method:'POST', headers:{Prefer:'return=minimal'}, body:JSON.stringify({state_hash:await hash(state), verifier, expires_at:expires})});
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
export async function handle(request) {
  const route = new URL(request.url).pathname.replace(/^\/functions\/v1\/youtube-comments(?=\/|$)/, '').replace(/^\/youtube-comments(?=\/|$)/, '').replace(/\/+$/, '');
  try {
    if (request.method === 'GET' && route === '/auth/start') return await start();
    if (request.method === 'GET' && route === '/oauth/callback') return await callback(request);
    return page('Страница не найдена.', 404);
  } catch {
    // Never log authorization codes, tokens, API response bodies, or account IDs.
    return page('Подключение не завершено. Ничего не опубликовано; проверьте настройки и канал.', 503);
  }
}
if (typeof Deno !== 'undefined' && typeof Deno.serve === 'function') Deno.serve(handle);
