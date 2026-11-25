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
const ALLOW_VIEWPORT_RESIZE = process.env.BRIDGE_VIEWPORT_RESIZE === "1";
const BOOTSTRAP = process.env.BRIDGE_BOOTSTRAP || "";
const VOXEL_FAST = process.env.BRIDGE_VOXEL_FAST === "1";
if (VOXEL_FAST && BOOTSTRAP !== "voxel") throw Error("fast quality requires voxel setup");
if (!["", "voxel"].includes(BOOTSTRAP)) throw Error("invalid bootstrap mode");
if (!["", "2048", "voxel", "adventure", "puzzle"].includes(TELEMETRY)) throw Error("invalid telemetry mode");
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
  const allowed = ["keys", "click", "button", "hold_ms", "look", "duration_ms", "viewport"];
  if (Object.keys(action).some(key => !allowed.includes(key))) throw Error("unknown action field");
  const keys = action.keys ?? [], click = action.click ?? null, duration = action.duration_ms ?? 250;
  if (!Array.isArray(keys) || keys.length > 4 || new Set(keys).size !== keys.length || keys.some(key => !KEYS.has(key))) throw Error("invalid keys");
  if (!Number.isInteger(duration) || duration < 50 || duration > 2000) throw Error("invalid duration");
  if (click !== null && (!Array.isArray(click) || click.length !== 2 || !click.every(Number.isInteger) || click[0] < 0 || click[0] >= 800 || click[1] < 0 || click[1] >= 600)) throw Error("invalid click");
  const button = action.button ?? "left", look = action.look ?? null;
  if (!["left", "right"].includes(button) || (action.button !== undefined && click === null)) throw Error("invalid button");
  if (look !== null && (!Array.isArray(look) || look.length !== 2 || !look.every(Number.isInteger) || look.some(n => n < -100 || n > 100))) throw Error("invalid look");
  const hold = action.hold_ms ?? 0;
  if (!Number.isInteger(hold) || hold < 0 || hold > 4500 || (action.hold_ms !== undefined && click === null)) throw Error("invalid hold duration");
  const viewport = action.viewport;
  if (viewport !== undefined && (!ALLOW_VIEWPORT_RESIZE || !Array.isArray(viewport)
      || viewport.length !== 2 || !viewport.every(Number.isInteger)
      || viewport[0] < 640 || viewport[0] > 1024 || viewport[1] < 480 || viewport[1] > 768
      || click !== null || look !== null || keys.length)) throw Error("invalid viewport action");
  return {keys, click, button, look, hold, duration, viewport};
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
  let adventureDialog = null;
  page.on("dialog", dialog => {
    if (TELEMETRY === "adventure" && dialog.message() === "You find nothing but lint and despair.") {
      adventureDialog = dialog.message();
    }
    return dialog.dismiss().catch(() => {});
  });
  try {
    // Browser-delivered animation callback intervals, not necessarily actual game
    // render rate or distinct recorded frames. The page is untrusted; values are
    // diagnostic only. Fixed-size storage and no per-frame sorting.
    await page.addInitScript(() => {
      let last = null, samples = [], cursor = 0;
      const tick = now => {
        if (last !== null) {
          const delta = now - last;
          if (Number.isFinite(delta) && delta > 0 && delta <= 3600000) {
            if (samples.length < 300) samples.push(delta);
            else { samples[cursor] = delta; cursor = (cursor + 1) % 300; }
          }
        }
        last = now;
        requestAnimationFrame(tick);
      };
      Object.defineProperty(window, '__bridgeFrameTiming', {value: () => {
        const stalled_ms = last === null ? null : Math.max(0, performance.now() - last);
        if (!samples.length) return {samples:0, fps:null, p95_ms:null, max_ms:null, stalled_ms};
        const sorted = samples.slice().sort((a,b) => a-b);
        const sum = sorted.reduce((a,b) => a+b, 0);
        return {samples:sorted.length, fps:1000 * sorted.length / sum,
          p95_ms:sorted[Math.ceil(sorted.length * .95)-1], max_ms:sorted[sorted.length-1], stalled_ms};
      }, configurable:false, writable:false});
      requestAnimationFrame(tick);
    });
    if (BOOTSTRAP === "voxel") {
      // Headless pointer lock makes absolute click positioning rotate the camera.
      // Simulate an unavailable browser capability so the game offers its own
      // documented compatibility controls; this does not modify game state.
      await page.addInitScript(() => {
        Object.defineProperty(HTMLElement.prototype, "requestPointerLock", {
          configurable: true, value: () => Promise.reject(new Error("pointer lock unavailable"))
        });
      });
    }
    await page.goto(`http://${HOST}:${PORT}/${ENTRY}`, {waitUntil:"load", timeout:15000});
    if (BOOTSTRAP === "voxel") {
      if (VOXEL_FAST) {
        // Explicit performance-only setup via the game's own options, not game state injection.
        await page.locator('[data-action="options"]').click({timeout:30000});
        const quality = page.locator('[data-action="quality-preset"]');
        for (let i = 0; i < 3 && !(await quality.textContent() || '').includes('流畅'); i++) await quality.click();
        if (!(await quality.textContent() || '').includes('流畅')) throw Error('fast quality not confirmed');
        await page.locator('[data-action="back"]').click({timeout:10000});
      }
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
      const viewportFinished = ALLOW_VIEWPORT_RESIZE && await page.locator("#game-message").textContent({timeout:1000}).then(text => text.startsWith("Game Complete!"));
      const screenshotStart = process.hrtime.bigint();
      // Do not fast-forward or cancel games' CSS animations during capture.
      const png = await page.screenshot({type:"png", timeout:10000});
      const screenshot_ms = Number(process.hrtime.bigint() - screenshotStart) / 1e6;
      const frameTiming = await page.evaluate(() => {
        try {
          const x = window.__bridgeFrameTiming();
          if (!Number.isInteger(x.samples) || x.samples < 0 || x.samples > 300) return null;
          if (!(x.stalled_ms === null || (typeof x.stalled_ms === 'number' && Number.isFinite(x.stalled_ms) && x.stalled_ms >= 0 && x.stalled_ms <= 3600000))) return null;
          if (x.samples === 0) return {samples:0, fps:null, p95_ms:null, max_ms:null, stalled_ms:x.stalled_ms};
          if (![x.fps, x.p95_ms, x.max_ms].every(n => typeof n === 'number' && Number.isFinite(n) && n >= 0 && n <= 3600000)) return null;
          return {samples:x.samples, fps:x.fps, p95_ms:x.p95_ms, max_ms:x.max_ms, stalled_ms:x.stalled_ms};
        } catch { return null; }
      });
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
          if (!["playing", "ready", "pause", "inventory", "title", "error", "death", "credits"].includes(s?.screen) ||
              !p || ![p.x, p.y, p.z].every(n => typeof n === "number" && Number.isFinite(n) && Math.abs(n) < 1000000)) return null;
          const health = s.player.health, hunger = s.player.hunger;
          if (![health, hunger].every(n => typeof n === "number" && Number.isFinite(n) && n >= 0 && n <= 20)) return null;
          if (!Array.isArray(s.earned) || s.earned.length > 1000 || s.earned.some(v => typeof v !== "string")) return null;
          return {screen:s.screen, x:p.x, y:p.y, z:p.z, health, hunger, wood:s.earned.includes("wood")};
        } catch { return null; }
      }) : null;
      // FPS and CPU frame time are game-reported diagnostics; not a GPU benchmark.
      const voxelPerformance = TELEMETRY === "voxel" ? await page.evaluate(() => {
        try {
          const s = window.voxelDiagnostics.snapshot(), fps = s?.fps, p95 = s?.performance?.frame?.p95Ms;
          if (![fps, p95].every(n => typeof n === "number" && Number.isFinite(n) && n >= 0 && n <= 10000)) return null;
          return {fps, frame_p95_ms:p95, quality: ['fast','balanced','high'].includes(s?.quality?.preset) ? s.quality.preset : 'unknown'};
        } catch { return null; }
      }) : null;
      // The crosshair target is privileged game diagnostics, not visual model
      // perception. Only a coarse, fixed vocabulary is sent to the operator.
      const voxelTarget = TELEMETRY === "voxel" ? await page.evaluate(() => {
        try {
          const target = window.voxelDiagnostics.snapshot()?.target;
          if (target == null) return "none";
          if (!Number.isSafeInteger(target.id) || target.id < 0 || target.id > 1000) return "unknown";
          return [9, 12, 15].includes(target.id) ? "log" : "other";
        } catch { return "unknown"; }
      }) : null;
      const orientation = TELEMETRY === "voxel" ? await page.evaluate(() => {
        try {
          const p = window.voxelDiagnostics.snapshot()?.player;
          if (![p?.yaw, p?.pitch].every(n => typeof n === "number" && Number.isFinite(n) && Math.abs(n) < 1000000)) return null;
          return {yaw:p.yaw, pitch:p.pitch};
        } catch { return null; }
      }) : null;
      // Fixed, opt-in UI telemetry for the pinned text adventure. Screen content
      // is untrusted; only bounded button coordinates and terminal state escape.
      const adventure = TELEMETRY === "adventure" ? await page.evaluate(() => {
        try {
          const buttons = Array.from(document.querySelectorAll('#choices-container .choice-button'));
          if (buttons.length > 3) return null;
          const choices = buttons.map((button, index) => {
            const r = button.getBoundingClientRect();
            const x = Math.round(r.left + r.width / 2), y = Math.round(r.top + r.height / 2);
            return {index, x, y, label: (button.textContent || "").trim().slice(0, 120), enabled: !button.disabled && r.width > 0 && r.height > 0 && x >= 0 && x < 800 && y >= 0 && y < 600};
          });
          const t = document.querySelector('#story-text')?.textContent || '';
          const ended = !!document.querySelector('#story-text .game-end');
          const outcome = !ended ? 'playing' : t.includes('Victory! You found the Lost Artifact.') ? 'victory' : t.includes('Defeated.') ? 'death' : 'unknown';
          return {choices, outcome};
        } catch { return null; }
      }) : null;
      if (adventure) adventure.dialog = adventureDialog;
      adventureDialog = null;
      // Pinned finite 15-puzzle DOM diagnostics: values/centres are untrusted
      // external help. No state mutations or arbitrary selectors are exposed.
      const puzzle = TELEMETRY === "puzzle" ? await page.evaluate(() => {
        try {
          const buttons = Array.from(document.querySelectorAll('.grid button'));
          if (buttons.length !== 16) return null;
          const cells = buttons.map((button, index) => {
            const r = button.getBoundingClientRect(), t = button.textContent.trim();
            const value = t === '' ? 0 : Number(t);
            return {index, value, x:Math.round(r.left+r.width/2), y:Math.round(r.top+r.height/2)};
          });
          if (cells.some(c => !Number.isInteger(c.value) || c.value < 0 || c.value > 15 || c.x < 0 || c.x >= 800 || c.y < 0 || c.y >= 600)) return null;
          const play = document.querySelector('.footer button'), r = play?.getBoundingClientRect();
          const setup = play?.textContent.trim() === 'Play' && r ? {x:Math.round(r.left+r.width/2), y:Math.round(r.top+r.height/2)} : null;
          return {cells, setup, won: document.querySelector('.message')?.textContent.trim() === 'You win!'};
        } catch { return null; }
      }) : null;
      emit({type:"observation", step, width:800, height:600, screenshot_png_base64:png.toString("base64"),
        browser_frame_timing:frameTiming, screenshot_ms:Math.round(screenshot_ms * 100) / 100,
        ...(ALLOW_VIEWPORT_RESIZE ? {viewport_finished:viewportFinished} : {}), ...(recording ? {recording_elapsed_ms} : {}), ...(TELEMETRY === "puzzle" ? {puzzle_telemetry:puzzle} : {}), ...(TELEMETRY === "adventure" ? {adventure_telemetry:adventure} : {}), ...(TELEMETRY === "2048" ? {game_telemetry:telemetry} : {}), ...(TELEMETRY === "voxel" ? {voxel_telemetry:voxel, voxel_orientation:orientation, voxel_target:voxelTarget, voxel_performance:voxelPerformance} : {})});
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
        const {keys, click, button, look, hold, duration, viewport} = checkAction(request.action);
        if (viewport) await page.setViewportSize({width:viewport[0], height:viewport[1]});
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
            // The voxel game's unlocked compatibility mode rotates only while the
            // middle button is held. Recenter unpressed, then drag; never inject
            // synthetic DOM events or expose arbitrary middle clicks to the agent.
            const compatibleDrag = BOOTSTRAP === "voxel" && !(await page.evaluate(() => !!document.pointerLockElement));
            if (compatibleDrag) {
              mouseX = 400; mouseY = 300;
              await page.mouse.move(mouseX, mouseY);
              await page.mouse.down({button:"middle"});
              try {
                mouseX += look[0]; mouseY += look[1];
                await page.mouse.move(mouseX, mouseY);
              } finally { await page.mouse.up({button:"middle"}).catch(() => {}); }
            } else {
              mouseX = Math.max(0, Math.min(799, mouseX + look[0]));
              mouseY = Math.max(0, Math.min(599, mouseY + look[1]));
              await page.mouse.move(mouseX, mouseY);
            }
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
