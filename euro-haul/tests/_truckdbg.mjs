import { createRequire } from 'node:module';
const require2 = createRequire(import.meta.url);
const puppeteer = require2('/tmp/node_modules/puppeteer-core');
const browser = await puppeteer.launch({
  args: ['--no-sandbox', '--no-zygote', '--disable-gpu', '--enable-unsafe-swiftshader', '--use-gl=angle', '--use-angle=swiftshader', '--disable-dev-shm-usage', '--user-data-dir=/tmp/pprof' + Math.random().toString(36).slice(2)],
  defaultViewport: { width: 900, height: 520 }, executablePath: '/tmp/chromium', headless: true,
  env: { ...process.env, LD_LIBRARY_PATH: '/tmp/stubs' },
});
const page = await browser.newPage();
await page.goto('http://127.0.0.1:8123/euro-haul/index.html', { waitUntil: 'domcontentloaded', timeout: 60000 });
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
await wait(1100);
await page.evaluate(() => { const g = window.__game; if (g.saves.slots.some(Boolean)) g.continueCareer(); else g.createCareer('Водитель', 'berlin', 0); });
await wait(1800);
await page.evaluate(() => { const g = window.__game; if (g.state === 'garage') { const j = g.offers.find((o) => o.from === g.profile.currentCity) || g.offers[0]; g.acceptJob(j); } });
await wait(2500);
await page.evaluate(() => { const g = window.__game; g.paused = false; g.setWeather('clear', true); g.clock.minutes = 17 * 60 + 30; g.cameraMode = 'far'; g.cameraUserSet = true; });
await wait(2500);
const info = await page.evaluate(() => {
  const g = window.__game;
  const tv = g.truckView;
  let total = 0, cast = 0, recv = 0, inner = 0;
  tv.root.traverse((o) => { if (!o.isMesh) return; total++; if (o.castShadow) cast++; if (o.receiveShadow) recv++; });
  const trailer = tv.trailerGroup;
  let tcast = 0, tcount = 0;
  if (trailer) trailer.traverse((o) => { if (o.isMesh) { tcount++; if (o.castShadow) tcast++; } });
  const sl = g.sky.sunLight;
  const cam = sl.shadow.camera;
  const THREE = window.__THREE;
  const frustum = new THREE.Frustum();
  frustum.setFromProjectionMatrix(new THREE.Matrix4().multiplyMatrices(cam.projectionMatrix, cam.matrixWorldInverse));
  const box = new THREE.Box3().setFromObject(tv.root);
  return {
    total, cast, recv, tcount, tcast,
    shadowOn: tv.shadowOn,
    rootVisible: tv.root.visible,
    trailerVisible: trailer ? trailer.visible : null,
    inFrustum: frustum.intersectsBox(box),
    boxSize: box.getSize(new THREE.Vector3()).toArray().map((v) => +v.toFixed(1)),
    camPos: cam.position.toArray().map((v) => +v.toFixed(1)),
    camSpan: [cam.left, cam.right, cam.near, cam.far],
    sunDir: g.sky.sunDir.toArray().map((v) => +v.toFixed(2)),
    lightPos: sl.position.toArray().map((v) => +v.toFixed(1)),
    lightWorld: (() => { const v = new THREE.Vector3(); sl.getWorldPosition(v); return v.toArray().map((x) => +x.toFixed(1)); })(),
    targetPos: sl.target.position.toArray().map((v) => +v.toFixed(1)),
    targetWorld: (() => { const v = new THREE.Vector3(); sl.target.getWorldPosition(v); return v.toArray().map((x) => +x.toFixed(1)); })(),
    focus: g.sky.focus.toArray().map((v) => +v.toFixed(1)),
    truckPos: g.truckPos.toArray().map((v) => +v.toFixed(1)),
    rootPos: tv.root.position.toArray().map((v) => +v.toFixed(1)),
    groups: (() => {
      const c = (root) => { let n = 0; if (root) root.traverse((o) => { if (o.isMesh) n++; }); return n; };
      return { road: c(g.road?.group), traffic: c(g.traffic?.group), truck: c(g.truckView?.root), scene: c(g.scene) };
    })(),
    renderInfo: { calls: g.renderer.info.render.calls, tris: g.renderer.info.render.triangles, programs: g.renderer.info.programs?.length, geometries: g.renderer.info.memory.geometries, textures: g.renderer.info.memory.textures },
    dbg: g.sky.__dbg ? { focus: g.sky.__dbg.focus.toArray().map((v) => +v.toFixed(1)), cam: g.sky.__dbg.cam.toArray().map((v) => +v.toFixed(1)), pos: g.sky.__dbg.pos.toArray().map((v) => +v.toFixed(1)) } : null,
    camMatrixPos: (() => { const v = new THREE.Vector3().setFromMatrixPosition(cam.matrixWorld); return v.toArray().map((x) => +x.toFixed(1)); })(),
  };
});
console.log(JSON.stringify(info));
const grass = await page.evaluate(() => {
  const g = window.__game;
  const out = [];
  g.road.group.traverse((o) => {
    if (!o.isMesh) return;
    const geo = o.geometry;
    if (geo && geo.attributes.color) {
      const a = geo.attributes.color.array;
      out.push({ vc: !!o.material.vertexColors, n: geo.attributes.color.count, sample: [a[0], a[1], a[2]].map((x) => +x.toFixed(2)) });
    }
  });
  return out.slice(0, 4);
});
console.log('grass colors', JSON.stringify(grass));
await page.screenshot({ path: '/home/user/games/euro-haul/tests/_tdbg.png' });
await browser.close();
process.exit(0);
