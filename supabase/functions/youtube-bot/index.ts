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
    "Access-Control-Allow-Methods": "GET, OPTIONS",
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
  const route = new URL(request.url).pathname.replace(/^\/functions\/v1\/youtube-bot/, "") || "/";
  try {
    // Opening the function base URL by itself should guide users back to the
    // actual dashboard instead of exposing the low-level "Not found" response.
    if (request.method === "GET" && route === "/") return Response.redirect(SITE_URL, 302);
    if (request.method === "GET" && route === "/auth/start") return await startOAuth(request);
    if (request.method === "GET" && route === "/oauth/callback") return await oauthCallback(request);
    if (request.method === "GET" && route === "/health") return Response.json({ ok: true, service: "youtube-bot" }, { headers: cors(request.headers.get("origin")) });
    return new Response("Not found", { status: 404, headers: cors(request.headers.get("origin")) });
  } catch (error) {
    console.error("YouTube bot request failed", error instanceof Error ? error.message : "unknown error");
    return htmlPage("Не удалось завершить подключение", "Сервис остановился без загрузки публичного видео. Проверьте настройки OAuth/API и начните подключение заново.");
  }
});
