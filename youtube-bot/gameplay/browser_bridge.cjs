"use strict";
// Untrusted static browser game, controlled solely by bounded JSON actions.
// This process runs inside a network-less, unprivileged container without secrets.
const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");
const readline = require("node:readline");
const { chromium } = require("playwright");
const ROOT = "/game", HOST = "127.0.0.1", PORT = 8787;
const TYPES = {".html":"text/html", ".js":"text/javascript", ".mjs":"text/javascript", ".css":"text/css", ".png":"image/png", ".jpg":"image/jpeg", ".jpeg":"image/jpeg", ".webp":"image/webp", ".svg":"image/svg+xml", ".json":"application/json", ".wasm":"application/wasm", ".woff":"font/woff", ".woff2":"font/woff2", ".mp3":"audio/mpeg", ".ogg":"audio/ogg"};
const KEYS = new Set(["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Space", "Enter", "Escape", "ShiftLeft", ..."ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").map(k => "Key" + k), ..."0123456789".split("").map(k => "Digit" + k)]);
const ENTRY = process.env.BRIDGE_ENTRY || "index.html";
const TELEMETRY = process.env.BRIDGE_TELEMETRY || "";
const BOOTSTRAP = process.env.BRIDGE_BOOTSTRAP || "";
if (!["", "voxel"].includes(BOOTSTRAP)) throw Error("invalid bootstrap mode");
if (!["", "2048", "voxel"].includes(TELEMETRY)) throw Error("invalid telemetry mode");
if (!/^(?:[a-zA-Z0-9_-]+\/)*index\.html$/.test(ENTRY)) throw Error("invalid entry path");
const emit = value => process.stdout.write(JSON.stringify(value) + "\n");
const server = http.createServer((req, res) => {
  try {
    if (req.method !== "GET" && req.method !== "HEAD") throw Error("denied");
    const pathname = decodeURIComponent(new URL(req.url, `http://${HOST}:${PORT}`).pathname);
    const target = path.resolve(ROOT, "." + (pathname === "/" ? "/index.html" : pathname));
    const real = fs.realpathSync(target);
    if (!real.startsWith(ROOT + path.sep) || !Object.hasOwn(TYPES, path.extname(real).toLowerCase())) throw Error("denied");
    const stat = fs.statSync(real);
    if (!stat.isFile() || stat.size > 20_000_000) throw Error("denied");
    res.writeHead(200, {"content-type": TYPES[path.extname(real).toLowerCase()], "cache-control": "no-store", "x-content-type-options": "nosniff"});
    if (req.method === "HEAD") res.end(); else fs.createReadStream(real).pipe(res);
  } catch { res.writeHead(404); res.end(); }
});
function checkAction(action) {
  if (!action || typeof action !== "object" || Array.isArray(action)) throw Error("invalid action");
  const allowed = ["keys", "click", "button", "hold_ms", "look", "duration_ms"];
  if (Object.keys(action).some(key => !allowed.includes(key))) throw Error("unknown action field");
  const keys = action.keys ?? [], click = action.click ?? null, duration = action.duration_ms ?? 250;
  if (!Array.isArray(keys) || keys.length > 4 || new Set(keys).size !== keys.length || keys.some(key => !KEYS.has(key))) throw Error("invalid keys");
  if (!Number.isInteger(duration) || duration < 50 || duration > 2000) throw Error("invalid duration");
  if (click !== null && (!Array.isArray(click) || click.length !== 2 || !click.every(Number.isInteger) || click[0] < 0 || click[0] >= 800 || click[1] < 0 || click[1] >= 600)) throw Error("invalid click");
  const button = action.button ?? "left", look = action.look ?? null;
  if (!["left", "right"].includes(button) || (action.button !== undefined && click === null)) throw Error("invalid button");
  if (look !== null && (!Array.isArray(look) || look.length !== 2 || !look.every(Number.isInteger) || look.some(n => n < -100 || n > 100))) throw Error("invalid look");
  const hold = action.hold_ms ?? 0;
  if (!Number.isInteger(hold) || hold < 0 || hold > 2000 || (action.hold_ms !== undefined && click === null)) throw Error("invalid hold duration");
  return {keys, click, button, look, hold, duration};
}
async function main() {
  await new Promise(resolve => server.listen(PORT, HOST, resolve));
  const browser = await chromium.launch({headless: true});
  const recording = process.env.BRIDGE_RECORD === "1";
  const context = await browser.newContext({viewport:{width:800,height:600}, serviceWorkers:"block", acceptDownloads:false,
    ...(recording ? {recordVideo:{dir:"/record", size:{width:800,height:600}}} : {})});
  await context.route("**/*", route => {
    const u = new URL(route.request().url());
    return u.protocol === "http:" && u.hostname === HOST && u.port === String(PORT) ? route.continue() : route.abort();
  });
  await context.routeWebSocket("**/*", ws => ws.close());
  // Approximate browser recording origin for diagnostics, not frame-accurate subtitles.
  const recordingOrigin = process.hrtime.bigint();
  const page = await context.newPage();
  const video = recording ? page.video() : null;
  let normalClose = false;
  let step = 0;
  let mouseX = 400, mouseY = 300;
  page.on("popup", popup => popup.close().catch(() => {}));
  page.on("dialog", dialog => dialog.dismiss().catch(() => {}));
  try {
    await page.goto(`http://${HOST}:${PORT}/${ENTRY}`, {waitUntil:"load", timeout:15000});
    if (BOOTSTRAP === "voxel") {
      // Test setup only, NOT model play: create an empty survival world through UI.
      await page.locator('[data-action="create"]').click({timeout:30000});
      await page.locator('[data-action="start-new"]').click({timeout:10000});
      await page.locator('[data-action="resume"]').waitFor({state:"visible", timeout:90000});
      await page.locator('[data-action="resume"]').click({timeout:10000});
      await page.waitForTimeout(1500);
      const compat = page.locator('[data-action="compatible"]');
      if (await compat.isVisible()) await compat.click({timeout:10000});
      await page.waitForTimeout(1500);
    }
    await page.mouse.move(mouseX, mouseY);
    const observe = async step => {
      const png = await page.screenshot({type:"png", timeout:10000, animations:"disabled"});
      if (png.length > 2_000_000) throw Error("screenshot too large");
      const recording_elapsed_ms = recording ? Number((process.hrtime.bigint() - recordingOrigin) / 1000000n) : null;
      // Experimental 2048 telemetry is untrusted game-provided data, never an
      // instruction to the model or evidence for any other game.
      const telemetry = TELEMETRY === "2048" ? await page.evaluate(() => {
        try {
          const state = JSON.parse(localStorage.getItem("gameState") || "null");
          const cells = state?.grid?.cells;
          if (!state || !Number.isSafeInteger(state.score) || state.score < 0 || state.score > 10000000 ||
              !Array.isArray(cells) || cells.length !== 4 || cells.some(col => !Array.isArray(col) || col.length !== 4) ||
              typeof state.won !== "boolean" || typeof state.over !== "boolean") return null;
          const values = cells.flat().map(cell => cell == null ? 0 : cell.value);
          if (values.some(v => !Number.isSafeInteger(v) || v < 0 || v > 1073741824)) return null;
          return {score:state.score, max_tile:Math.max(...values), won:state.won, over:state.over};
        } catch { return null; }
      }) : null;
      // Read-only, bounded data provided by the game; do not treat it as trusted evidence.
      const voxel = TELEMETRY === "voxel" ? await page.evaluate(() => {
        try {
          const s = window.voxelDiagnostics.snapshot(), p = s?.player?.pos;
          if (!["playing", "ready", "pause", "inventory", "title", "error"].includes(s?.screen) ||
              !p || ![p.x, p.y, p.z].every(n => typeof n === "number" && Number.isFinite(n) && Math.abs(n) < 1000000)) return null;
          return {screen:s.screen, x:p.x, y:p.y, z:p.z};
        } catch { return null; }
      }) : null;
      emit({type:"observation", step, width:800, height:600, screenshot_png_base64:png.toString("base64"),
        ...(recording ? {recording_elapsed_ms} : {}), ...(TELEMETRY === "2048" ? {game_telemetry:telemetry} : {}), ...(TELEMETRY === "voxel" ? {voxel_telemetry:voxel} : {})});
    };
    await observe(0);
    const lines = readline.createInterface({input:process.stdin, crlfDelay:Infinity});
    for await (const line of lines) {
      if (line.length > 4096) { emit({type:"error", error:"request too large"}); continue; }
      let request;
      try { request = JSON.parse(line); } catch { emit({type:"error", error:"invalid JSON"}); continue; }
      if (request && request.type === "close" && Object.keys(request).length === 1) { normalClose = true; break; }
      try {
        if (!request || request.type !== "step" || Object.keys(request).some(k => !["type", "action"].includes(k))) throw Error("invalid request");
        const {keys, click, button, look, hold, duration} = checkAction(request.action);
        if (++step > 10000) throw Error("step limit reached");
        try {
          for (const key of keys) await page.keyboard.down(key);
          if (click) {
            mouseX = click[0]; mouseY = click[1];
            if (hold) {
              await page.mouse.move(mouseX, mouseY);
              await page.mouse.down({button});
              try { await page.waitForTimeout(hold); } finally { await page.mouse.up({button}).catch(() => {}); }
            } else await page.mouse.click(mouseX, mouseY, {button});
          }
          if (look) {
            mouseX = Math.max(0, Math.min(799, mouseX + look[0]));
            mouseY = Math.max(0, Math.min(599, mouseY + look[1]));
            await page.mouse.move(mouseX, mouseY);
          }
          await page.waitForTimeout(duration);
        } finally { for (const key of keys) await page.keyboard.up(key).catch(() => {}); }
        await observe(step);
      } catch (error) { emit({type:"error", error: error.message.slice(0, 120)}); }
    }
  } finally {
    await context.close();
    if (normalClose && video) {
      const recorded = await video.path();
      if (path.dirname(recorded) !== "/record" || !/^[a-f0-9]{32}\.webm$/.test(path.basename(recorded))) throw Error("invalid recording output");
      fs.renameSync(recorded, "/record/recording.webm");
      emit({type:"recording", filename:"recording.webm", steps:step});
    }
    await browser.close(); server.close();
  }
}
main().catch(error => { console.error("Bridge stopped:", error.message); server.close(); process.exitCode = 1; });
