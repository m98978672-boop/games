const encoder = new TextEncoder();
const expectedWorkflow = "m98978672-boop/games/.github/workflows/youtube-shorts-autopilot.yml@refs/heads/main";

function env(name: string): string {
  const value = Deno.env.get(name);
  if (!value) throw new Error(`Missing server configuration: ${name}`);
  return value;
}

function decodeBase64Url(value: string): Uint8Array<ArrayBuffer> {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized + "=".repeat((4 - normalized.length % 4) % 4);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

function decodeJwtPart(value: string): Record<string, unknown> {
  return JSON.parse(new TextDecoder().decode(decodeBase64Url(value)));
}

function decodeBase64(value: string): Uint8Array<ArrayBuffer> {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

function encryptionKey(): Uint8Array<ArrayBuffer> {
  const hex = env("YOUTUBE_BOT_ENCRYPTION_KEY");
  if (!/^[0-9a-f]{64}$/i.test(hex)) throw new Error("Invalid encryption key configuration.");
  const bytes = new Uint8Array(32);
  for (let i = 0; i < 32; i++) bytes[i] = Number.parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  return bytes;
}

async function verifyGitHubActionsOidc(request: Request): Promise<void> {
  const token = (request.headers.get("Authorization") ?? "").match(/^Bearer\s+(.+)$/i)?.[1] ?? "";
  const parts = token.split(".");
  if (parts.length !== 3) throw new Error("Missing or malformed GitHub Actions identity.");
  const header = decodeJwtPart(parts[0]);
  const claims = decodeJwtPart(parts[1]);
  if (header.alg !== "RS256" || typeof header.kid !== "string") throw new Error("Unexpected GitHub identity signature.");
  const keyResponse = await fetch("https://token.actions.githubusercontent.com/.well-known/jwks", { signal: AbortSignal.timeout(10000) });
  if (!keyResponse.ok) throw new Error("GitHub identity keys are unavailable.");
  const payload = await keyResponse.json();
  const jwk = (payload.keys ?? []).find((key: JsonWebKey & { kid?: string }) => key.kid === header.kid);
  if (!jwk) throw new Error("GitHub identity key was not recognized.");
  const publicKey = await crypto.subtle.importKey("jwk", jwk, { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" }, false, ["verify"]);
  const signed = encoder.encode(`${parts[0]}.${parts[1]}`);
  if (!await crypto.subtle.verify("RSASSA-PKCS1-v1_5", publicKey, decodeBase64Url(parts[2]), signed)) {
    throw new Error("GitHub identity signature did not verify.");
  }
  const now = Math.floor(Date.now() / 1000);
  const audience = Array.isArray(claims.aud) ? claims.aud : [claims.aud];
  if (claims.iss !== "https://token.actions.githubusercontent.com" ||
      !audience.includes("youtube-bot") ||
      claims.repository !== "m98978672-boop/games" ||
      claims.ref !== "refs/heads/main" ||
      claims.workflow_ref !== expectedWorkflow ||
      claims.event_name !== "workflow_dispatch" ||
      typeof claims.exp !== "number" || claims.exp < now ||
      typeof claims.iat !== "number" || claims.iat > now + 60) {
    throw new Error("GitHub Actions identity is not authorized for this operation.");
  }
}

async function dbRequest(table: string, query: string): Promise<Response> {
  const key = env("SUPABASE_SERVICE_ROLE_KEY");
  const response = await fetch(`${env("SUPABASE_URL")}/rest/v1/${table}${query}`, {
    headers: { apikey: key, Authorization: `Bearer ${key}` },
    signal: AbortSignal.timeout(15000),
  });
  if (!response.ok) throw new Error("Private YouTube job storage is unavailable.");
  return response;
}

async function googleAccessToken(): Promise<string> {
  const storedResponse = await dbRequest("youtube_bot_tokens", "?slot=eq.channel-owner&select=token_cipher,token_iv");
  const stored = (await storedResponse.json())[0];
  if (!stored) throw new Error("YouTube channel is not connected.");
  const key = await crypto.subtle.importKey("raw", encryptionKey(), "AES-GCM", false, ["decrypt"]);
  const clear = await crypto.subtle.decrypt({ name: "AES-GCM", iv: decodeBase64(stored.token_iv) }, key, decodeBase64(stored.token_cipher));
  const refreshToken = new TextDecoder().decode(clear);
  const form = new URLSearchParams({
    client_id: env("YOUTUBE_OAUTH_CLIENT_ID"),
    client_secret: env("YOUTUBE_OAUTH_CLIENT_SECRET"),
    refresh_token: refreshToken,
    grant_type: "refresh_token",
  });
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: form,
    signal: AbortSignal.timeout(15000),
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok || typeof result.access_token !== "string") throw new Error("YouTube authorization could not be refreshed.");
  return result.access_token;
}

Deno.serve(async (request: Request) => {
  if (request.method !== "POST") return Response.json({ error: "POST required." }, { status: 405 });
  try {
    await verifyGitHubActionsOidc(request);
    const body = await request.json().catch(() => ({}));
    const videoId = body?.video_id;
    if (typeof videoId !== "string" || !/^[A-Za-z0-9_-]{6,80}$/.test(videoId)) {
      return Response.json({ error: "Video ID has an invalid format." }, { status: 400 });
    }
    const rowResponse = await dbRequest(
      "youtube_bot_autopilot_jobs",
      `?video_id=eq.${encodeURIComponent(videoId)}&select=video_id,status,made_for_kids`,
    );
    const job = (await rowResponse.json())[0];
    if (!job || job.status !== "scheduled") return Response.json({ error: "No scheduled bot video matched that ID." }, { status: 404 });

    const accessToken = await googleAccessToken();
    const update = await fetch("https://www.googleapis.com/youtube/v3/videos?part=status", {
      method: "PUT",
      headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        id: videoId,
        status: { privacyStatus: "public", selfDeclaredMadeForKids: job.made_for_kids },
      }),
      signal: AbortSignal.timeout(30000),
    });
    const result = await update.json().catch(() => ({}));
    if (!update.ok) {
      const message = typeof result?.error?.message === "string" ? result.error.message.slice(0, 200) : `YouTube rejected the update (${update.status}).`;
      return Response.json({ error: message }, { status: 502 });
    }
    return Response.json({ status: "public", video_id: videoId, watch_url: `https://youtu.be/${videoId}` });
  } catch (error) {
    const message = error instanceof Error ? error.message.slice(0, 220) : "Visibility update failed.";
    return Response.json({ error: message }, { status: 401 });
  }
});
