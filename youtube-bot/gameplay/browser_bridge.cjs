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
  const allowed = ["keys", "click", "duration_ms"];
  if (Object.keys(action).some(key => !allowed.includes(key))) throw Error("unknown action field");
  const keys = action.keys ?? [], click = action.click ?? null, duration = action.duration_ms ?? 250;
  if (!Array.isArray(keys) || keys.length > 4 || new Set(keys).size !== keys.length || keys.some(key => !KEYS.has(key))) throw Error("invalid keys");
  if (!Number.isInteger(duration) || duration < 50 || duration > 2000) throw Error("invalid duration");
  if (click !== null && (!Array.isArray(click) || click.length !== 2 || !click.every(Number.isInteger) || click[0] < 0 || click[0] >= 800 || click[1] < 0 || click[1] >= 600)) throw Error("invalid click");
  return {keys, click, duration};
}
async function main() {
  await new Promise(resolve => server.listen(PORT, HOST, resolve));
  const browser = await chromium.launch({headless: true});
  const context = await browser.newContext({viewport:{width:800,height:600}, serviceWorkers:"block", acceptDownloads:false});
  await context.route("**/*", route => {
    const u = new URL(route.request().url());
    return u.protocol === "http:" && u.hostname === HOST && u.port === String(PORT) ? route.continue() : route.abort();
  });
  await context.routeWebSocket("**/*", ws => ws.close());
  const page = await context.newPage();
  page.on("popup", popup => popup.close().catch(() => {}));
  page.on("dialog", dialog => dialog.dismiss().catch(() => {}));
  try {
    await page.goto(`http://${HOST}:${PORT}/${ENTRY}`, {waitUntil:"load", timeout:15000});
    const observe = async step => {
      const png = await page.screenshot({type:"png", timeout:10000, animations:"disabled"});
      if (png.length > 2_000_000) throw Error("screenshot too large");
      emit({type:"observation", step, width:800, height:600, screenshot_png_base64:png.toString("base64")});
    };
    await observe(0);
    let step = 0;
    const lines = readline.createInterface({input:process.stdin, crlfDelay:Infinity});
    for await (const line of lines) {
      if (line.length > 4096) { emit({type:"error", error:"request too large"}); continue; }
      let request;
      try { request = JSON.parse(line); } catch { emit({type:"error", error:"invalid JSON"}); continue; }
      if (request && request.type === "close" && Object.keys(request).length === 1) break;
      try {
        if (!request || request.type !== "step" || Object.keys(request).some(k => !["type", "action"].includes(k))) throw Error("invalid request");
        const {keys, click, duration} = checkAction(request.action);
        if (++step > 10000) throw Error("step limit reached");
        try {
          for (const key of keys) await page.keyboard.down(key);
          if (click) await page.mouse.click(click[0], click[1]);
          await page.waitForTimeout(duration);
        } finally { for (const key of keys) await page.keyboard.up(key).catch(() => {}); }
        await observe(step);
      } catch (error) { emit({type:"error", error: error.message.slice(0, 120)}); }
    }
  } finally { await context.close(); await browser.close(); server.close(); }
}
main().catch(error => { console.error("Bridge stopped:", error.message); server.close(); process.exitCode = 1; });
