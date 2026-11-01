// Что видно в кадре: рейкаст по точкам экрана. node tests/_ray.mjs
import { createRequire } from 'node:module';
const require2 = createRequire(import.meta.url);
const puppeteer = require2('/tmp/node_modules/puppeteer-core');
const base = 'http://127.0.0.1:8123/euro-haul/index.html';
const browser = await puppeteer.launch({
  args: ['--no-sandbox', '--no-zygote', '--disable-gpu', '--enable-unsafe-swiftshader', '--use-gl=angle',
    '--use-angle=swiftshader', '--disable-dev-shm-usage', '--user-data-dir=/tmp/pprof' + Math.random().toString(36).slice(2)],
  defaultViewport: { width: 1200, height: 700 },
  executablePath: '/tmp/chromium',
  headless: true,
  env: { ...process.env, LD_LIBRARY_PATH: '/tmp/stubs' },
});
const page = await browser.newPage();
await page.goto(base, { waitUntil: 'domcontentloaded', timeout: 60000 });
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
await wait(1200);
await page.evaluate(() => {
  const g = window.__game;
  if (g.saves.slots.some(Boolean)) { g.continueCareer(); return; }
  g.createCareer('Водитель', 'berlin', 0);
});
await wait(2200);
await page.evaluate(() => {
  const g = window.__game;
  if (g.state !== 'garage') return;
  const job = g.offers.find((o) => o.from === g.profile.currentCity) || g.offers[0];
  g.acceptJob(job);
});
await wait(3500);
await page.evaluate(() => { const g = window.__game; g.cameraMode = 'interior'; g.cameraUserSet = true; g.setWeather('clear', true); });
await wait(2500);
const out = await page.evaluate(() => {
  const g = window.__game;
  const THREE = window.__THREE;
  const rc = new THREE.Raycaster();
  const pts = {
    центр: [0.5, 0.5], право_плита: [0.78, 0.72], право_верх: [0.85, 0.45],
    низ_руль: [0.5, 0.85], приборка: [0.5, 0.72], лево_стойка: [0.18, 0.4],
    верх: [0.5, 0.12], низ_лево: [0.3, 0.8], право_низ: [0.9, 0.85],
  };
  const res = {};
  for (const [k, [u, v]] of Object.entries(pts)) {
    rc.setFromCamera(new THREE.Vector2(u * 2 - 1, -(v * 2 - 1)), g.camera);
    const hits = rc.intersectObjects(g.scene.children, true).filter((h) => h.object.visible);
    const h = hits[0];
    if (!h) { res[k] = 'небо'; continue; }
    const p = h.object.geometry?.parameters || {};
    const wp = new THREE.Vector3();
    h.object.getWorldPosition(wp);
    res[k] = {
      d: +h.distance.toFixed(2),
      type: h.object.geometry?.type,
      params: Object.fromEntries(Object.entries(p).filter(([kk, vv]) => typeof vv === 'number').slice(0, 5)),
      pos: wp.toArray().map((x) => +x.toFixed(2)),
      mat: h.object.material?.color ? '#' + h.object.material.color.getHexString() : '?',
      interior: !!h.object.parent && (() => { let o = h.object; while (o) { if (o === g.truckView.interior) return true; o = o.parent; } return false; })(),
    };
  }
  return res;
});
console.log(JSON.stringify(out, null, 1));
await browser.close();
process.exit(0);
