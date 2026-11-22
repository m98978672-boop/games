"use strict";
// Experimental, game-specific 2048 player. Run only in the isolated container.
// No YouTube credentials, upload, synthetic padding, or claim of a finished run.
const fs = require("node:fs");
const http = require("node:http");
const path = require("node:path");
const { chromium } = require("playwright");
const { choose } = require("./solver2048.cjs");

const GAME = "/game";
const OUT = "/output";
const duration = Number(process.env.GAMEPLAY_SECONDS || "3600");
if (!Number.isInteger(duration) || duration < 1 || duration > 3600) throw Error("GAMEPLAY_SECONDS must be 1..3600");
const mime = {".html":"text/html", ".js":"text/javascript", ".css":"text/css", ".png":"image/png", ".woff":"font/woff", ".svg":"image/svg+xml", ".ico":"image/x-icon"};
const server = http.createServer((req, res) => {
  try {
    const url = new URL(req.url, "http://127.0.0.1:8787");
    const relative = decodeURIComponent(url.pathname === "/" ? "/index.html" : url.pathname);
    const target = path.resolve(GAME, "." + relative);
    if (!target.startsWith(GAME + path.sep) || !Object.hasOwn(mime, path.extname(target))) throw Error("blocked");
    const stat = fs.lstatSync(target);
    if (!stat.isFile() || stat.isSymbolicLink() || stat.size > 10_000_000) throw Error("blocked");
    res.writeHead(200, {"content-type": mime[path.extname(target)], "cache-control": "no-store"});
    fs.createReadStream(target).pipe(res);
  } catch { res.writeHead(404); res.end(); }
});

async function main() {
  await new Promise(resolve => server.listen(8787, "127.0.0.1", resolve));
  const browser = await chromium.launch({headless: true});
  const context = await browser.newContext({ viewport: {width: 1280, height: 720}, recordVideo: {dir: OUT, size: {width: 1280, height: 720}} });
  try {
    await context.route("**/*", route => {
      const url = new URL(route.request().url());
      return url.protocol === "http:" && url.hostname === "127.0.0.1" && url.port === "8787" ? route.continue() : route.abort();
    });
    const page = await context.newPage();
    await page.goto("http://127.0.0.1:8787/", {waitUntil: "load", timeout: 30000});
    await page.waitForSelector(".tile-container", {timeout: 10000});
    const start = Date.now();
    let moves = 0, outcome = "time_limit", maxTile = 0, score = 0;
    while (Date.now() - start < duration * 1000) {
      if (await page.locator(".game-message.game-over").count()) { outcome = "lost"; break; }
      if (await page.locator(".game-message.game-won").count()) { outcome = "won"; break; }
      const state = await page.evaluate(() => { try { return JSON.parse(localStorage.getItem("gameState")); } catch { return null; } });
      if (!state || !Array.isArray(state.grid?.cells) || state.grid.cells.length !== 4 || state.grid.cells.some(col => !Array.isArray(col) || col.length !== 4)) throw Error("Game state unavailable or invalid");
      const board = Array.from({length: 4}, (_, y) => Array.from({length: 4}, (_, x) => Number(state.grid.cells[x][y]?.value || 0)));
      maxTile = Math.max(maxTile, ...board.flat());
      score = Number(state.score) || 0;
      const action = choose(board);
      if (!action) { outcome = "no_legal_move"; break; }
      await page.keyboard.press(action);
      moves++;
      await page.waitForTimeout(750);
    }
    const state = await page.evaluate(() => localStorage.getItem("gameState"));
    if (state && state.length < 100000) fs.writeFileSync(path.join(OUT, "gameState.json"), state, {mode: 0o600});
    const video = page.video();
    await page.close();
    await context.close(); // finishes the real recording; never loop/pad a short result
    const videoPath = video ? await video.path() : null;
    const report = {game: "2048", source: "https://github.com/gabrielecirulli/2048", commit: "478b6ec346e3787f589e4af751378d06ded4cbbc", outcome, moves, score, max_tile: maxTile, elapsed_seconds: Math.floor((Date.now() - start) / 1000), video: videoPath ? path.basename(videoPath) : null, audio: false, uploaded: false};
    fs.writeFileSync(path.join(OUT, "report.json"), JSON.stringify(report, null, 2), {mode: 0o600});
    console.log(JSON.stringify(report));
  } finally {
    await context.close().catch(() => {});
    await browser.close();
    server.close();
  }
}
main().catch(error => { console.error("Gameplay stopped:", error.message); server.close(); process.exitCode = 1; });
