// Диагностика сцены в реальном WebGL. node tests/_diag.mjs
import { createRequire } from 'node:module';
const require2 = createRequire(import.meta.url);
const puppeteer = require2('/tmp/node_modules/puppeteer-core');
const base = process.env.URL || 'http://127.0.0.1:8123/euro-haul/index.html';
const browser = await puppeteer.launch({
  args: ['--no-sandbox', '--no-zygote', '--disable-gpu', '--enable-unsafe-swiftshader', '--use-gl=angle',
    '--use-angle=swiftshader', '--disable-dev-shm-usage', '--user-data-dir=/tmp/pprof' + Math.random().toString(36).slice(2)],
  defaultViewport: { width: 1200, height: 700 },
  executablePath: '/tmp/chromium',
  headless: true,
  env: { ...process.env, LD_LIBRARY_PATH: '/tmp/stubs' },
});
const page = await browser.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push('[pageerror] ' + e.message));
page.on('console', (m) => { if (m.type() === 'error') errors.push('[console] ' + m.text()); });
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
await wait(4000);
const info = await page.evaluate(() => {
  const g = window.__game;
  const THREE = window.__THREE;
  let casters = 0, receivers = 0, meshes = 0, instanced = 0;
  g.scene.traverse((o) => {
    if (!o.isMesh) return;
    meshes++;
    if (o.isInstancedMesh) instanced++;
    if (o.castShadow) casters++;
    if (o.receiveShadow) receivers++;
  });
  const sl = g.sky.sunLight;
  return {
    fps: +g.fps.toFixed(1),
    quality: g.quality,
    device: g.device,
    shadowEnabled: g.renderer.shadowMap.enabled,
    shadowType: g.renderer.shadowMap.type,
    sunCast: sl.castShadow,
    sunIntensity: +sl.intensity.toFixed(2),
    mapSize: [sl.shadow.mapSize.x, sl.shadow.mapSize.y],
    sunPos: sl.position.toArray().map((v) => +v.toFixed(1)),
    sunTarget: sl.target.position.toArray().map((v) => +v.toFixed(1)),
    camSpan: [sl.shadow.camera.left, sl.shadow.camera.right],
    focus: g.sky.focus.toArray().map((v) => +v.toFixed(1)),
    truckPos: g.truckPos.toArray().map((v) => +v.toFixed(2)),
    meshes, instanced, casters, receivers,
    env: !!g.scene.environment,
    envIntensity: g.scene.environmentIntensity,
    exposure: g.renderer.toneMappingExposure,
    fog: g.scene.fog && +g.scene.fog.density.toFixed(5),
    night: +(g.night || 0).toFixed(2),
    contactVisible: g.contactShadow && g.contactShadow.visible,
    camera: g.camera.position.toArray().map((v) => +v.toFixed(1)),
    distToTruck: +g.camera.position.distanceTo(g.truckPos).toFixed(1),
  };
});
console.log(JSON.stringify(info));
const extra = await page.evaluate(() => {
  const g = window.__game;
  const out = { quality: g.quality, device: g.device, shadowEnabled: g.renderer.shadowMap.enabled, mapSize: g.sky.sunLight.shadow.mapSize.toArray(), hasMap: !!g.sky.sunLight.shadow.map, sunCast: g.sky.sunLight.castShadow, sunPos: g.sky.sunLight.position.toArray().map((v) => +v.toFixed(1)), target: g.sky.sunLight.target.position.toArray().map((v) => +v.toFixed(1)), focus: g.sky.focus.toArray().map((v) => +v.toFixed(1)), exposure: g.renderer.toneMappingExposure, env: !!g.scene.environment, night: +(g.night||0).toFixed(2), sunrise: 0 };
  const sl = g.sky.sunLight;
  out.shadowCam = { near: sl.shadow.camera.near, far: sl.shadow.camera.far, left: sl.shadow.camera.left };
  out.receive = 0; out.cast = 0;
  g.scene.traverse((o) => { if (o.isMesh) { if (o.receiveShadow) out.receive++; if (o.castShadow) out.cast++; } });
  return out;
});
console.log('extra', JSON.stringify(extra));
console.log('errors', errors.slice(0, 4).join(' | ') || 'нет');
await page.screenshot({ path: '/home/user/games/euro-haul/tests/_diag.png' });
await browser.close();
process.exit(0);
