// Реальный Chromium с настоящим Canvas и игровым rAF, не FPS из Node-тиков.
// Требует npm ci; на Linux x64 использует Chromium из devDependencies.
import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { dirname, extname, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import chromium, { inflate } from '@sparticuz/chromium';
import { chromium as playwright } from 'playwright-core';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const quick = process.argv.includes('--quick');
const mime = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json',
  '.css': 'text/css', '.png': 'image/png', '.svg': 'image/svg+xml' };
const server = http.createServer(async (request, response) => {
  try {
    const name = decodeURIComponent(new URL(request.url, 'http://test.invalid').pathname).replace(/^\/+/, '') || 'index.html';
    if (name.split(/[\\/]/).includes('..')) { response.writeHead(404).end(); return; }
    if (!['index.html', 'style.css', 'cover.svg'].includes(name) && !['src/', 'data/', 'assets/'].some((p) => name.startsWith(p))) {
      response.writeHead(404).end(); return;
    }
    const path = resolve(root, name);
    if (!path.startsWith(root + sep)) { response.writeHead(404).end(); return; }
    const bytes = await readFile(path);
    response.writeHead(200, { 'Content-Type': mime[extname(path)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
    response.end(bytes);
  } catch { response.writeHead(404).end(); }
});
let browser;
const measurements = [];
try {
  if (process.platform !== 'linux' || process.arch !== 'x64') throw new Error('встроенный Chromium требует Linux x64');
  await new Promise((resolve, reject) => { server.once('error', reject); server.listen(0, '0.0.0.0', resolve); });
  const req = createRequire(import.meta.url);
  const archive = resolve(dirname(req.resolve('@sparticuz/chromium')), '../bin/al2023.tar.br');
  // В минимальном Debian могут отсутствовать NSS/NSPR, они идут в пакете Chromium.
  const libs = resolve(await inflate(archive), 'lib');
  const executablePath = process.env.FRONTLINE_CHROMIUM_PATH || await chromium.executablePath();
  let version = '';
  for (const target of [400, 500]) {
    browser = await playwright.launch({ executablePath, args: chromium.args, headless: true,
      env: { ...process.env, LD_LIBRARY_PATH: [libs, process.env.LD_LIBRARY_PATH].filter(Boolean).join(':') } });
    version ||= browser.version();
    const page = await browser.newPage({ viewport: { width: 1280, height: 900 }, deviceScaleFactor: 1 });
    const errors = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await page.goto(`http://127.0.0.1:${server.address().port}/index.html`, { waitUntil: 'load', timeout: 60_000 });
    await page.waitForFunction(() => !!window.__frontline, { timeout: 60_000 });
    const result = await page.evaluate(async ({ target, quick }) => {
      const app = window.__frontline;
      const game = app.newGame({ seed: 5, aiVsAi: true, difficulty: 'regular' });
      const renderer = app.renderer;
      const count = (f = null) => [...game.units.values()].filter((u) => u.alive && (f === null || u.faction === f)).length;
      for (const faction of [0, 1]) {
        const hq = game.world.hqOf(faction);
        let k = 0;
        while (count(faction) < target / 2) {
          const angle = k * 2.399963229728653, radius = 150 + (k % 10) * 20;
          game.spawnUnit(faction, k % 11 === 0 ? 'mg' : 'infantry',
            hq.x + Math.cos(angle) * radius, hq.y + Math.sin(angle) * radius, {});
          k++;
        }
      }
      const initial = count();
      const spritesReady = renderer.bank.ready && [0, 1].every((f) => ['infantry', 'mg'].every((role) =>
        [0, 1, 2, 3].every((direction) => !!renderer.bank.get(`sprites/${role}_${f}_${direction}`))));
      const visibleCount = () => {
        const { x, y, zoom } = renderer.camera;
        const halfW = renderer.viewW / 2 / zoom, halfH = renderer.viewH / 2 / zoom;
        return [...game.units.values()].filter((u) => u.alive &&
          Math.abs(u.x - x) < halfW + 60 && Math.abs(u.y - y) < halfH + 60 &&
          (!renderer.fogEnabled || renderer.isVisible(u.x, u.y) || u.faction === game.playerFaction)).length;
      };
      let drawCount = 0, measuring = false;
      const samples = { step: [], draw: [], hud: [] };
      const instrument = (owner, name, key) => {
        const original = owner[name].bind(owner);
        owner[name] = (...args) => {
          const t = performance.now();
          try { return original(...args); }
          finally { if (measuring) samples[key].push(performance.now() - t); }
        };
      };
      instrument(game, 'step', 'step');
      instrument(app.hud, 'update', 'hud');
      const draw = renderer.draw.bind(renderer);
      renderer.draw = (...args) => {
        const t = performance.now(); drawCount++;
        try { return draw(...args); }
        finally { if (measuring) samples.draw.push(performance.now() - t); }
      };
      // Прогрев и замер привязаны к реальному времени браузера, без фиктивных тиков.
      await new Promise((resolve) => setTimeout(resolve, quick ? 1000 : 3000));
      const drawStart = drawCount, canvas = renderer.canvas, gameTimeStart = game.time;
      measuring = true;
      const measurement = await new Promise((resolve) => {
        let start = null, previous = null, minAlive = Infinity, maxAlive = 0, minVisible = Infinity;
        const durations = [];
        function frame(timestamp) {
          const alive = count();
          minAlive = Math.min(minAlive, alive); maxAlive = Math.max(maxAlive, alive);
          minVisible = Math.min(minVisible, visibleCount());
          if (start === null) start = timestamp;
          if (previous !== null) durations.push(timestamp - previous);
          previous = timestamp;
          if (timestamp - start >= (quick ? 3000 : 12_000)) {
            resolve({ durationMs: timestamp - start, durations, minAlive, maxAlive, minVisible });
          } else requestAnimationFrame(frame);
        }
        requestAnimationFrame(frame);
      });
      measuring = false;
      const stats = (values) => {
        if (!values.length) return { samples: 0, meanMs: null, p95Ms: null, maxMs: null };
        const sorted = [...values].sort((a, b) => a - b);
        return { samples: sorted.length, meanMs: +(sorted.reduce((a,b) => a+b, 0) / sorted.length).toFixed(3),
          p95Ms: +sorted[Math.floor(sorted.length * 0.95)].toFixed(3), maxMs: +sorted[sorted.length - 1].toFixed(3) };
      };
      const sorted = [...measurement.durations].sort((a, b) => b - a);
      const worstCount = Math.max(1, Math.ceil(sorted.length * 0.01));
      const worstTime = sorted.slice(0, worstCount).reduce((a, b) => a + b, 0);
      return { target, initial, minAlive: measurement.minAlive, maxAlive: measurement.maxAlive,
        minVisible: measurement.minVisible, spritesReady,
        elapsedMs: measurement.durationMs, frames: sorted.length, worstCount, worstTimeMs: worstTime,
        averageFps: sorted.length * 1000 / measurement.durationMs,
        low1Fps: worstCount * 1000 / worstTime, drawFrames: drawCount - drawStart,
        canvas: { width: canvas.width, height: canvas.height }, gameTimeStart, gameSeconds: game.time,
        sameGame: app.game === game,
        warOver: game.warOver, screen: app.state.screen, userAgent: navigator.userAgent,
        timings: { step: stats(samples.step), draw: stats(samples.draw), hud: stats(samples.hud) } };
    }, { target, quick });
    // Читаем настоящий Canvas после измерения; это не screenshot-регрессия.
    result.canvasDataLength = await page.evaluate(() => {
      window.__frontline.game.paused = true;
      return document.getElementById('game').toDataURL('image/png').length;
    });
    result.pageErrors = errors;
    measurements.push(result);
    await browser.close();
    browser = null;
  }
  const [a, b] = measurements;
  const rendered = measurements.every((r) => r.drawFrames >= r.frames * 0.9 && r.canvas.width > 0 && r.canvas.height > 0 &&
    r.canvasDataLength > 1000 && r.spritesReady && r.minVisible >= r.target / 4 && r.screen === 'game' &&
    r.sameGame && r.gameSeconds > r.gameTimeStart && r.timings.step.samples > 0);
  const passed = !quick && rendered && a.initial === 400 && b.initial === 500 && a.minAlive === 400 && a.maxAlive === 400 && b.minAlive === 500 && b.maxAlive === 500 &&
    a.averageFps >= 60 && a.low1Fps >= 45 && b.averageFps >= 45 &&
    measurements.every((r) => r.elapsedMs >= 12_000 && r.frames > 0 && r.pageErrors.length === 0 && r.warOver === false);
  const report = { passed, environment: 'browser', measurement: 'requestAnimationFrame', rendered,
    browser: `Chromium ${version}`, mode: 'headless software rendering', quick, viewport: '1280x900 DPR 1',
    frames400: a.frames, average400: a.averageFps, low1_400: a.low1Fps, minAlive400: a.minAlive, maxAlive400: a.maxAlive,
    duration400Ms: a.elapsedMs, frames500: b.frames, average500: b.averageFps, low1_500: b.low1Fps,
    minAlive500: b.minAlive, maxAlive500: b.maxAlive, duration500Ms: b.elapsedMs, measurements };
  console.log(JSON.stringify(report, null, 2));
  if (!passed) process.exitCode = 1;
} catch (error) {
  console.log(JSON.stringify({ passed: false, environment: 'browser', error: String(error?.stack || error), measurements }, null, 2));
  process.exitCode = 1;
} finally {
  if (browser) await browser.close();
  if (server.listening) await new Promise((resolve) => server.close(resolve));
}
