const PROJECT_URL = "https://cuhfnzgytndyntpbnbda.supabase.co";
const SITE_URL = "https://m98978672-boop.github.io/games/youtube-bot/";
const CALLBACK_URL = `${PROJECT_URL}/functions/v1/youtube-bot/oauth/callback`;
const DEMO_VIDEO_URL = `${SITE_URL}assets/demo-short.mp4`;
const YOUTUBE_SCOPES = ["https://www.googleapis.com/auth/youtube.upload"];
const encoder = new TextEncoder();

function env(name: string): string {
  const value = Deno.env.get(name);
  if (!value) throw new Error(`Missing server configuration: ${name}`);
  return value;
}

function cors(origin: string | null): HeadersInit {
  const allowedOrigin = origin === "https://m98978672-boop.github.io" ? origin : "https://m98978672-boop.github.io";
  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Vary": "Origin",
  };
}

function htmlPage(title: string, message: string, success = false, videoId = ""): Response {
  const color = success ? "#137333" : "#b3261e";
  const link = videoId
    ? `<p><a href="https://studio.youtube.com/video/${encodeURIComponent(videoId)}/edit">Открыть загруженное приватное видео в YouTube Studio</a></p>`
    : "";
  const html = `<!doctype html><html lang="ru"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title><body style="font:17px system-ui;max-width:680px;margin:12vh auto;padding:24px;color:#172033"><h1 style="color:${color}">${title}</h1><p>${message}</p>${link}<p><a href="${SITE_URL}">Вернуться на YouTube Bot</a></p></body></html>`;
  return new Response(html, { headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" } });
}

async function sha256(value: string): Promise<string> {
  const digest = new Uint8Array(await crypto.subtle.digest("SHA-256", encoder.encode(value)));
  return [...digest].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

function base64(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

function fromHex(value: string): Uint8Array {
  if (!/^[0-9a-f]{64}$/i.test(value)) throw new Error("Encryption key must be 32 bytes encoded as hex.");
  return new Uint8Array(value.match(/.{2}/g)!.map((part) => Number.parseInt(part, 16)));
}

async function encryptRefreshToken(token: string): Promise<{ cipher: string; iv: string }> {
  const keyBytes = new Uint8Array(32);
  keyBytes.set(fromHex(env("YOUTUBE_BOT_ENCRYPTION_KEY")));
  const key = await crypto.subtle.importKey("raw", keyBytes.buffer, "AES-GCM", false, ["encrypt"]);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const cipher = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, encoder.encode(token));
  return { cipher: base64(new Uint8Array(cipher)), iv: base64(iv) };
}

function dbHeaders(extra: HeadersInit = {}): Headers {
  return new Headers({
    apikey: env("SUPABASE_SERVICE_ROLE_KEY"),
    Authorization: `Bearer ${env("SUPABASE_SERVICE_ROLE_KEY")}`,
    "Content-Type": "application/json",
    ...Object.fromEntries(new Headers(extra).entries()),
  });
}

async function dbRequest(table: string, query: string, init: RequestInit = {}): Promise<Response> {
  const response = await fetch(`${env("SUPABASE_URL")}/rest/v1/${table}${query}`, {
    ...init,
    headers: dbHeaders(init.headers),
    signal: init.signal ?? AbortSignal.timeout(15_000),
  });
  if (!response.ok) throw new Error(`Private token storage failed (${response.status}).`);
  return response;
}

async function startOAuth(request: Request): Promise<Response> {
  const stateBytes = crypto.getRandomValues(new Uint8Array(32));
  const verifierBytes = crypto.getRandomValues(new Uint8Array(32));
  const state = base64(stateBytes).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
  const verifier = base64(verifierBytes).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
  const challenge = base64(new Uint8Array(await crypto.subtle.digest("SHA-256", encoder.encode(verifier))))
    .replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();
  await dbRequest("youtube_bot_oauth_states", "", {
    method: "POST",
    headers: { Prefer: "return=minimal" },
    body: JSON.stringify({ state_hash: await sha256(state), verifier, expires_at: expiresAt }),
  });
  await dbRequest("youtube_bot_oauth_states", `?expires_at=lt.${encodeURIComponent(new Date().toISOString())}`, { method: "DELETE" });

  const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  url.searchParams.set("client_id", env("YOUTUBE_OAUTH_CLIENT_ID"));
  url.searchParams.set("redirect_uri", CALLBACK_URL);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", YOUTUBE_SCOPES.join(" "));
  url.searchParams.set("state", state);
  url.searchParams.set("code_challenge", challenge);
  url.searchParams.set("code_challenge_method", "S256");
  url.searchParams.set("access_type", "offline");
  url.searchParams.set("include_granted_scopes", "true");
  url.searchParams.set("prompt", "consent");
  return Response.redirect(url, 302);
}

async function exchangeCode(code: string, verifier: string): Promise<Record<string, unknown>> {
  const form = new URLSearchParams({
    code,
    client_id: env("YOUTUBE_OAUTH_CLIENT_ID"),
    client_secret: env("YOUTUBE_OAUTH_CLIENT_SECRET"),
    redirect_uri: CALLBACK_URL,
    grant_type: "authorization_code",
    code_verifier: verifier,
  });
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: form,
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    console.error("OAuth token exchange rejected", response.status);
    throw new Error("Google did not accept the authorization response. Check the callback URL and try connecting again.");
  }
  return payload;
}

async function uploadPrivateDemo(accessToken: string): Promise<string> {
  const videoResponse = await fetch(DEMO_VIDEO_URL, { headers: { "Cache-Control": "no-cache" } });
  if (!videoResponse.ok) throw new Error(`Demo video is not available on the public site (${videoResponse.status}).`);
  const video = new Uint8Array(await videoResponse.arrayBuffer());
  if (video.length < 1024 || video.length > 20 * 1024 * 1024) throw new Error("Demo file size is outside the safe upload limit.");
  const metadata = {
    snippet: {
      title: "Кто спрятал луну? — тестовый мультфильм",
      description: "Тестовый немой мультфильм с речевыми облачками. Загружен приватно для проверки YouTube Bot.",
      tags: ["shorts", "мультфильм", "animal-comedy"],
      categoryId: "24",
    },
    status: { privacyStatus: "private" },
  };
  const init = await fetch("https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json; charset=UTF-8",
      "X-Upload-Content-Length": String(video.length),
      "X-Upload-Content-Type": "video/mp4",
    },
    body: JSON.stringify(metadata),
  });
  if (!init.ok) {
    console.error("YouTube upload initialization failed", init.status);
    throw new Error("YouTube could not start the upload. Check channel permissions and API quota.");
  }
  const uploadUrl = init.headers.get("Location");
  if (!uploadUrl) throw new Error("YouTube did not return a resumable upload URL.");
  const uploaded = await fetch(uploadUrl, {
    method: "PUT",
    headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "video/mp4" },
    body: video,
  });
  const result = await uploaded.json().catch(() => ({}));
  if (!uploaded.ok || typeof result.id !== "string") {
    console.error("YouTube upload did not complete", uploaded.status);
    throw new Error("YouTube did not complete the private test upload. Check YouTube Studio before retrying.");
  }
  return result.id;
}

function fromBase64(value: string): Uint8Array<ArrayBuffer> {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

function decodeJwtPart(value: string): Record<string, unknown> {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized + "=".repeat((4 - normalized.length % 4) % 4);
  return JSON.parse(new TextDecoder().decode(fromBase64(padded)));
}

let githubJwksCache: { keys: Array<JsonWebKey & { kid?: string }>; expiresAt: number } | null = null;

async function verifyGitHubActionsOidc(request: Request): Promise<Record<string, unknown>> {
  const authorization = request.headers.get("Authorization") ?? "";
  const token = authorization.match(/^Bearer\s+(.+)$/i)?.[1] ?? "";
  const parts = token.split(".");
  if (parts.length !== 3) throw new Error("Missing or malformed GitHub Actions identity.");
  const header = decodeJwtPart(parts[0]);
  if (header.alg !== "RS256" || typeof header.kid !== "string") throw new Error("Unexpected GitHub identity signature.");
  const now = Math.floor(Date.now() / 1000);
  if (!githubJwksCache || githubJwksCache.expiresAt <= now) {
    let response: Response;
    try {
      response = await fetch("https://token.actions.githubusercontent.com/.well-known/jwks", {
        signal: AbortSignal.timeout(10_000),
      });
    } catch {
      throw new Error("Timed out reaching GitHub's OIDC signing-key endpoint.");
    }
    if (!response.ok) throw new Error(`GitHub identity keys are unavailable (${response.status}).`);
    const payload = await response.json();
    githubJwksCache = { keys: payload.keys ?? [], expiresAt: now + 300 };
  }
  const jwk = githubJwksCache.keys.find((key) => key.kid === header.kid);
  if (!jwk) throw new Error("GitHub identity key was not recognized.");
  const publicKey = await crypto.subtle.importKey(
    "jwk", jwk, { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" }, false, ["verify"],
  );
  const signature = fromBase64(parts[2].replace(/-/g, "+").replace(/_/g, "/") + "=".repeat((4 - parts[2].length % 4) % 4));
  const signed = encoder.encode(`${parts[0]}.${parts[1]}`);
  if (!await crypto.subtle.verify("RSASSA-PKCS1-v1_5", publicKey, signature.buffer, signed.buffer)) {
    throw new Error("GitHub identity signature did not verify.");
  }
  const claims = decodeJwtPart(parts[1]);
  const audience = Array.isArray(claims.aud) ? claims.aud : [claims.aud];
  const expectedWorkflow = "m98978672-boop/games/.github/workflows/youtube-shorts-autopilot.yml@refs/heads/main";
  const mismatches: string[] = [];
  if (claims.iss !== "https://token.actions.githubusercontent.com") mismatches.push("issuer");
  if (!audience.includes("youtube-bot")) mismatches.push("audience");
  if (claims.repository !== "m98978672-boop/games") mismatches.push("repository");
  if (claims.ref !== "refs/heads/main") mismatches.push("ref");
  if (claims.workflow_ref !== expectedWorkflow) mismatches.push("workflow_ref");
  if (!["schedule", "workflow_dispatch"].includes(String(claims.event_name))) mismatches.push("event_name");
  if (typeof claims.exp !== "number" || claims.exp < now) mismatches.push("expiry");
  if (typeof claims.iat !== "number" || claims.iat > now + 60) mismatches.push("issued_at");
  // `sub` can be customized by repository policy; the exact repository, ref,
  // and workflow_ref checks above remain the authorization boundary.
  if (mismatches.length) throw new Error(`Untrusted GitHub identity claims: ${mismatches.join(", ")}.`);
  return claims;
}

async function accessTokenFromStoredRefreshToken(): Promise<string> {
  const storedResponse = await dbRequest(
    "youtube_bot_tokens", "?slot=eq.channel-owner&select=token_cipher,token_iv", { method: "GET" },
  );
  const rows = await storedResponse.json();
  const stored = rows[0];
  if (!stored) throw new Error("YouTube channel is not connected.");
  const keyBytes = new Uint8Array(32);
  keyBytes.set(fromHex(env("YOUTUBE_BOT_ENCRYPTION_KEY")));
  const key = await crypto.subtle.importKey("raw", keyBytes.buffer, "AES-GCM", false, ["decrypt"]);
  const iv = fromBase64(stored.token_iv);
  const cipher = fromBase64(stored.token_cipher);
  const refreshBytes = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: iv.buffer }, key, cipher.buffer,
  );
  const refreshToken = new TextDecoder().decode(refreshBytes);
  const form = new URLSearchParams({
    client_id: env("YOUTUBE_OAUTH_CLIENT_ID"),
    client_secret: env("YOUTUBE_OAUTH_CLIENT_SECRET"),
    refresh_token: refreshToken,
    grant_type: "refresh_token",
  });
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: form,
    signal: AbortSignal.timeout(15_000),
  });
  const tokens = await response.json().catch(() => ({}));
  if (!response.ok || typeof tokens.access_token !== "string") {
    console.error("YouTube access-token refresh failed", response.status);
    throw new Error("YouTube authorization expired; reconnect the channel.");
  }
  return tokens.access_token;
}

async function jsonRequest(request: Request): Promise<Record<string, unknown> | null> {
  try {
    const value = await request.json();
    return value && typeof value === "object" && !Array.isArray(value)
      ? value as Record<string, unknown>
      : null;
  } catch {
    return null;
  }
}

function validJobId(value: unknown): value is string {
  return typeof value === "string" &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

async function jobByPublishAt(publishAt: string): Promise<Record<string, unknown> | null> {
  const response = await dbRequest(
    "youtube_bot_autopilot_jobs",
    `?publish_at=eq.${encodeURIComponent(publishAt)}&select=id,status,video_id,watch_url,safe_error`,
    { method: "GET" },
  );
  return (await response.json())[0] ?? null;
}

async function issueAutopilotAccessToken(jobId: string): Promise<Response> {
  try {
    const accessToken = await accessTokenFromStoredRefreshToken();
    // Only the OIDC-trusted main workflow receives this short-lived upload-only token.
    return Response.json({ status: "ready_for_upload", job_id: jobId, access_token: accessToken });
  } catch (error) {
    const safeError = error instanceof Error ? error.message.slice(0, 200) : "Could not prepare YouTube upload.";
    await dbRequest("youtube_bot_autopilot_jobs", `?id=eq.${jobId}`, {
      method: "PATCH", headers: { Prefer: "return=minimal" },
      body: JSON.stringify({ status: "failed", safe_error: safeError, updated_at: new Date().toISOString() }),
    }).catch(() => undefined);
    return Response.json({ status: "failed", error: safeError }, { status: 502 });
  }
}

async function prepareAutopilotReview(request: Request): Promise<Response> {
  try { await verifyGitHubActionsOidc(request); }
  catch (error) {
    const reason = error instanceof Error ? error.message.slice(0, 160) : "identity verification failed";
    console.error("Autopilot OIDC verification failed", reason);
    return Response.json({ error: `GitHub Actions identity was not accepted: ${reason}` }, { status: 401 });
  }
  const body = await jsonRequest(request);
  const metadata = body?.metadata;
  if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) {
    return Response.json({ error: "Expected JSON review metadata." }, { status: 400 });
  }
  const item = metadata as Record<string, unknown>;
  const jobId = item.job_id;
  const gameId = item.game_id;
  const title = typeof item.title === "string" ? item.title.trim() : "";
  const description = typeof item.description === "string" ? item.description : "";
  const publishAt = typeof item.publish_at === "string" ? item.publish_at : "";
  const kids = item.made_for_kids;
  const tags = item.tags;
  const category = String(item.category_id ?? "20");
  if (!validJobId(jobId) || typeof gameId !== "string" || !/^[a-z0-9-]{1,60}$/.test(gameId) ||
      !title || title.length > 100 || description.length > 5000 || typeof kids !== "boolean" ||
      !Array.isArray(tags) || tags.length > 30 ||
      tags.some((tag) => typeof tag !== "string" || tag.length > 100) || !/^\d{1,4}$/.test(category)) {
    return Response.json({ error: "Review metadata failed validation." }, { status: 400 });
  }
  const scheduledDate = new Date(publishAt);
  if (!publishAt || Number.isNaN(scheduledDate.getTime()) || scheduledDate.getTime() < Date.now() + 15 * 60 * 1000) {
    return Response.json({ error: "Scheduled publish time must be at least 15 minutes in the future." }, { status: 400 });
  }
  const safeTime = scheduledDate.toISOString();

  // One reservation per publish slot. Repeated preparation for the same job is
  // safe; a different job cannot start a second upload for the same slot.
  const existing = await jobByPublishAt(safeTime);
  if (existing) {
    if (existing.status === "scheduled" && typeof existing.video_id === "string") {
      return Response.json({
        status: "scheduled", video_id: existing.video_id, watch_url: existing.watch_url, publish_at: safeTime,
      });
    }
    if (existing.id === jobId && existing.status === "processing") {
      return await issueAutopilotAccessToken(jobId);
    }
    return Response.json({
      status: existing.status,
      error: typeof existing.safe_error === "string"
        ? existing.safe_error
        : "This publish slot is already reserved; no second upload was started.",
    }, { status: 409 });
  }

  try {
    await dbRequest("youtube_bot_autopilot_jobs", "", {
      method: "POST", headers: { Prefer: "return=minimal" },
      body: JSON.stringify({
        id: jobId, game_id: gameId, title, publish_at: safeTime,
        made_for_kids: kids, status: "processing",
      }),
    });
  } catch {
    // A concurrent request may have won the unique publish_at reservation.
    const raced = await jobByPublishAt(safeTime).catch(() => null);
    if (raced?.status === "scheduled" && typeof raced.video_id === "string") {
      return Response.json({ status: "scheduled", video_id: raced.video_id, watch_url: raced.watch_url, publish_at: safeTime });
    }
    if (raced?.id === jobId && raced.status === "processing") return await issueAutopilotAccessToken(jobId);
    if (raced) return Response.json({ status: raced.status, error: "This publish slot is already reserved; no second upload was started." }, { status: 409 });
    return Response.json({ error: "Could not reserve this publish slot in the upload queue." }, { status: 503 });
  }
  return await issueAutopilotAccessToken(jobId);
}

async function completeAutopilotReview(request: Request): Promise<Response> {
  try { await verifyGitHubActionsOidc(request); }
  catch (error) {
    const reason = error instanceof Error ? error.message.slice(0, 160) : "identity verification failed";
    console.error("Autopilot completion OIDC verification failed", reason);
    return Response.json({ error: `GitHub Actions identity was not accepted: ${reason}` }, { status: 401 });
  }
  const body = await jsonRequest(request);
  const jobId = body?.job_id;
  const videoId = body?.video_id;
  if (!validJobId(jobId) || typeof videoId !== "string" || !/^[A-Za-z0-9_-]{6,80}$/.test(videoId)) {
    return Response.json({ error: "Job or YouTube video ID failed validation." }, { status: 400 });
  }
  const watchUrl = `https://youtu.be/${videoId}`;
  const response = await dbRequest(
    "youtube_bot_autopilot_jobs", `?id=eq.${jobId}&select=id,status,video_id,watch_url,publish_at`, { method: "GET" },
  );
  const job = (await response.json())[0];
  if (!job) return Response.json({ error: "Reserved upload job was not found." }, { status: 404 });
  if (job.status === "scheduled") {
    if (job.video_id !== videoId) return Response.json({ error: "Job was already completed with a different video ID." }, { status: 409 });
    return Response.json({ status: "scheduled", video_id: videoId, watch_url: watchUrl, publish_at: job.publish_at });
  }
  if (job.status !== "processing") return Response.json({ error: "Upload job is not in a completable state." }, { status: 409 });
  await dbRequest("youtube_bot_autopilot_jobs", `?id=eq.${jobId}`, {
    method: "PATCH", headers: { Prefer: "return=minimal" },
    body: JSON.stringify({ status: "scheduled", video_id: videoId, watch_url: watchUrl, safe_error: null, updated_at: new Date().toISOString() }),
  });
  return Response.json({ status: "scheduled", video_id: videoId, watch_url: watchUrl, publish_at: job.publish_at });
}

async function failAutopilotReview(request: Request): Promise<Response> {
  try { await verifyGitHubActionsOidc(request); }
  catch (error) {
    const reason = error instanceof Error ? error.message.slice(0, 160) : "identity verification failed";
    console.error("Autopilot failure-report OIDC verification failed", reason);
    return Response.json({ error: `GitHub Actions identity was not accepted: ${reason}` }, { status: 401 });
  }
  const body = await jsonRequest(request);
  const jobId = body?.job_id;
  const errorText = typeof body?.error === "string" ? body.error.trim().slice(0, 220) : "Upload could not be started.";
  if (!validJobId(jobId)) return Response.json({ error: "Job ID failed validation." }, { status: 400 });
  const response = await dbRequest(
    "youtube_bot_autopilot_jobs", `?id=eq.${jobId}&select=id,status,video_id`, { method: "GET" },
  );
  const job = (await response.json())[0];
  if (!job) return Response.json({ error: "Reserved upload job was not found." }, { status: 404 });
  if (job.status === "scheduled" || job.video_id) {
    return Response.json({ error: "A video may already exist; job was not changed." }, { status: 409 });
  }
  if (job.status !== "failed") {
    await dbRequest("youtube_bot_autopilot_jobs", `?id=eq.${jobId}`, {
      method: "PATCH", headers: { Prefer: "return=minimal" },
      body: JSON.stringify({ status: "failed", safe_error: errorText, updated_at: new Date().toISOString() }),
    });
  }
  return Response.json({ status: "failed", job_id: jobId, error: errorText });
}

async function oauthCallback(request: Request): Promise<Response> {
  const url = new URL(request.url);
  if (url.searchParams.get("error")) return htmlPage("Подключение отменено", "Google не выдал разрешение. Видео не загружено.");
  const state = url.searchParams.get("state") ?? "";
  const code = url.searchParams.get("code") ?? "";
  if (!state || !code) return htmlPage("Не удалось подключить YouTube", "Ответ Google неполный. Начните подключение с настоящего сайта заново.");
  const hash = await sha256(state);
  const stateRowsResponse = await dbRequest("youtube_bot_oauth_states", `?state_hash=eq.${hash}&select=verifier,expires_at`, { method: "GET" });
  const stateRows = await stateRowsResponse.json();
  const saved = stateRows[0];
  await dbRequest("youtube_bot_oauth_states", `?state_hash=eq.${hash}`, { method: "DELETE" });
  if (!saved || Date.parse(saved.expires_at) < Date.now()) return htmlPage("Ссылка истекла", "Вернитесь на сайт и начните подключение заново.");

  const tokens = await exchangeCode(code, saved.verifier);
  if (typeof tokens.refresh_token !== "string" || typeof tokens.access_token !== "string") {
    throw new Error("Google did not grant offline access. Start the connection again and approve the requested permissions.");
  }
  const encrypted = await encryptRefreshToken(tokens.refresh_token);
  await dbRequest("youtube_bot_tokens", "?on_conflict=slot", {
    method: "POST",
    headers: { Prefer: "resolution=merge-duplicates,return=minimal" },
    body: JSON.stringify({ slot: "channel-owner", token_cipher: encrypted.cipher, token_iv: encrypted.iv, updated_at: new Date().toISOString() }),
  });

  try {
    const videoId = await uploadPrivateDemo(tokens.access_token);
    const destination = new URL(SITE_URL);
    destination.searchParams.set("youtube_bot", "private_upload_complete");
    destination.searchParams.set("video_id", videoId);
    return Response.redirect(destination, 303);
  } catch (error) {
    console.error("Private demo upload failed after OAuth consent", error instanceof Error ? error.message : "unknown error");
    return htmlPage("YouTube подключён", "Доступ сохранён в защищённом хранилище, но тестовый ролик не загрузился. Проверьте канал/API и повторите позже.");
  }
}

Deno.serve(async (request: Request) => {
  if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: cors(request.headers.get("origin")) });
  const pathname = new URL(request.url).pathname;
  // Supabase's gateway/runtime may expose the path with the function prefix,
  // only the function slug, or already stripped to the route. Accept all three.
  const routePath = pathname
    .replace(/^\/functions\/v1\/youtube-bot(?=\/|$)/, "")
    .replace(/^\/youtube-bot(?=\/|$)/, "")
    .replace(/\/+$/, "");
  const route = routePath || "/";
  try {
    // Opening the function base URL by itself should guide users back to the
    // actual dashboard instead of exposing the low-level "Not found" response.
    if (request.method === "GET" && route === "/") return Response.redirect(SITE_URL, 302);
    if (request.method === "GET" && route === "/auth/start") return await startOAuth(request);
    if (request.method === "GET" && route === "/oauth/callback") return await oauthCallback(request);
    if (request.method === "GET" && route === "/health") return Response.json({ ok: true, service: "youtube-bot" }, { headers: cors(request.headers.get("origin")) });
    if (request.method === "POST" && route === "/autopilot/prepare") return await prepareAutopilotReview(request);
    if (request.method === "POST" && route === "/autopilot/complete") return await completeAutopilotReview(request);
    if (request.method === "POST" && route === "/autopilot/fail") return await failAutopilotReview(request);
    return new Response("Not found", { status: 404, headers: cors(request.headers.get("origin")) });
  } catch (error) {
    const safeError = error instanceof Error ? error.message.slice(0, 220) : "unknown error";
    console.error("YouTube bot request failed", safeError);
    if (route.startsWith("/autopilot/")) {
      return Response.json({ error: safeError }, { status: 503, headers: cors(request.headers.get("origin")) });
    }
    return htmlPage("Не удалось завершить подключение", "Сервис остановился без загрузки публичного видео. Проверьте настройки OAuth/API и начните подключение заново.");
  }
});
