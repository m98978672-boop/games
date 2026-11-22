const PROJECT_URL = "https://cuhfnzgytndyntpbnbda.supabase.co";
const CALLBACK_URL = `${PROJECT_URL}/functions/v1/youtube-bot/oauth/callback`;
const encoder = new TextEncoder();

function env(name: string): string {
  const value = Deno.env.get(name);
  if (!value) throw new Error(`Missing server configuration: ${name}`);
  return value;
}

function base64(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

async function sha256(value: string): Promise<string> {
  const digest = new Uint8Array(await crypto.subtle.digest("SHA-256", encoder.encode(value)));
  return [...digest].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function dbRequest(table: string, query: string, init: RequestInit = {}): Promise<Response> {
  const key = env("SUPABASE_SERVICE_ROLE_KEY");
  const response = await fetch(`${env("SUPABASE_URL")}/rest/v1/${table}${query}`, {
    ...init,
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      ...Object.fromEntries(new Headers(init.headers).entries()),
    },
    signal: AbortSignal.timeout(15000),
  });
  if (!response.ok) throw new Error("Could not prepare the protected YouTube connection.");
  return response;
}

Deno.serve(async (request: Request) => {
  if (request.method !== "GET") return new Response("GET required.", { status: 405 });
  try {
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
    url.searchParams.set("scope", [
      "https://www.googleapis.com/auth/youtube.upload",
      "https://www.googleapis.com/auth/youtube.force-ssl",
    ].join(" "));
    url.searchParams.set("state", state);
    url.searchParams.set("code_challenge", challenge);
    url.searchParams.set("code_challenge_method", "S256");
    url.searchParams.set("access_type", "offline");
    url.searchParams.set("include_granted_scopes", "true");
    url.searchParams.set("prompt", "consent");
    return Response.redirect(url, 302);
  } catch (error) {
    const message = error instanceof Error ? error.message.slice(0, 180) : "Could not start YouTube authorization.";
    return new Response(message, { status: 503, headers: { "Content-Type": "text/plain; charset=utf-8" } });
  }
});
