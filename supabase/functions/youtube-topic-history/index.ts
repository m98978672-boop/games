// Read-only topic ledger endpoint. Never issues a YouTube token or changes jobs.
const encoder = new TextEncoder();
let cached: { keys: Array<JsonWebKey & { kid?: string }>; expires: number } | null = null;
function decode(value: string): Uint8Array {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
  return Uint8Array.from(atob(normalized + '='.repeat((4 - normalized.length % 4) % 4)), c => c.charCodeAt(0));
}
function jsonPart(value: string): Record<string, unknown> {
  return JSON.parse(new TextDecoder().decode(decode(value)));
}
async function trusted(request: Request): Promise<boolean> {
  try {
    const token = (request.headers.get('authorization') ?? '').match(/^Bearer\s+(.+)$/i)?.[1] ?? '';
    const parts = token.split('.');
    if (parts.length !== 3) return false;
    const header = jsonPart(parts[0]);
    if (header.alg !== 'RS256' || typeof header.kid !== 'string') return false;
    const now = Math.floor(Date.now() / 1000);
    if (!cached || cached.expires <= now) {
      const response = await fetch('https://token.actions.githubusercontent.com/.well-known/jwks', {signal: AbortSignal.timeout(10000)});
      if (!response.ok) return false;
      const payload = await response.json();
      if (!Array.isArray(payload.keys)) return false;
      cached = {keys: payload.keys, expires: now + 300};
    }
    const jwk = cached.keys.find(key => key.kid === header.kid);
    if (!jwk) return false;
    const key = await crypto.subtle.importKey('jwk', jwk, {name:'RSASSA-PKCS1-v1_5', hash:'SHA-256'}, false, ['verify']);
    if (!await crypto.subtle.verify('RSASSA-PKCS1-v1_5', key, decode(parts[2]), encoder.encode(`${parts[0]}.${parts[1]}`))) return false;
    const claims = jsonPart(parts[1]);
    const audience = Array.isArray(claims.aud) ? claims.aud : [claims.aud];
    const workflows = ['youtube-shorts-autopilot.yml', 'youtube-longform-autopilot.yml']
      .map(name => `m98978672-boop/games/.github/workflows/${name}@refs/heads/main`);
    return claims.iss === 'https://token.actions.githubusercontent.com' && audience.includes('youtube-bot') &&
      claims.repository === 'm98978672-boop/games' && claims.ref === 'refs/heads/main' &&
      typeof claims.workflow_ref === 'string' && workflows.includes(claims.workflow_ref) &&
      ['schedule','workflow_dispatch'].includes(String(claims.event_name)) &&
      typeof claims.exp === 'number' && claims.exp >= now && typeof claims.iat === 'number' && claims.iat <= now + 60;
  } catch { return false; }
}
Deno.serve(async (request: Request) => {
  if (request.method !== 'POST') return Response.json({error:'Not found'}, {status:404});
  if (!await trusted(request)) return Response.json({error:'Identity not accepted'}, {status:401});
  try {
    const url = Deno.env.get('SUPABASE_URL');
    const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!url || !key) throw new Error('Missing database configuration');
    const response = await fetch(`${url}/rest/v1/rpc/youtube_bot_review_topic_history`, {
      method:'POST', headers:{apikey:key, Authorization:`Bearer ${key}`, 'Content-Type':'application/json'},
      body:'{}', signal:AbortSignal.timeout(15000),
    });
    if (!response.ok) throw new Error('Topic history unavailable');
    const result = await response.json();
    if (!result || result.version !== 1 || !Array.isArray(result.game_ids) || result.game_ids.length > 20000 ||
        result.game_ids.some((id: unknown) => typeof id !== 'string' || !/^[a-z0-9-]{1,60}$/.test(id)) ||
        new Set(result.game_ids).size !== result.game_ids.length) throw new Error('Malformed topic history');
    return Response.json(result, {headers:{'Cache-Control':'no-store'}});
  } catch { return Response.json({error:'Could not read the complete topic history'}, {status:503}); }
});
