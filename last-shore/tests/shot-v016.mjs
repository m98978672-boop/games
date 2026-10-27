// v0.16: скриншоты — обводки моделей (F3 → Ж), оттенки почвы, новые деревья,
// звери и рыбы. Нужен сервер на http://127.0.0.1:8080 и bundle.js из npm run build.
import puppeteer from 'puppeteer-core';
import chromiumPkg from '@sparticuz/chromium';
const chromium = chromiumPkg.default || chromiumPkg;

const browser = await puppeteer.launch({
  args: [...chromium.args, '--no-sandbox', '--enable-unsafe-swiftshader'],
  executablePath: await chromium.executablePath(),
  headless: 'shell',
  protocolTimeout: 600000,
  env: { ...process.env, LD_LIBRARY_PATH: '/tmp/nssstub' },
});
const page = await browser.newPage();
await page.setViewport({ width: 960, height: 600 });
const errors = [];
page.on('pageerror', (e) => errors.push('ERR ' + e.message.slice(0, 300)));
await page.goto('http://127.0.0.1:8080/index.html', { waitUntil: 'load' });
await page.click('#btn-start');
await new Promise((r) => setTimeout(r, 4000));

// --- 1. обводки: стоим у дерева, включаем F3 → Ж ---
const info = await page.evaluate(() => {
  const g = window.__game;
  const w = g.world;
  const tree = w.treeList.find((t) => t.shell && t.collider && !t.collider.soft);
  const px = tree.x + 4.2;
  const pz = tree.z + 0.8;
  g.player.position.set(px, w.heightAt(px, pz), pz);
  g.player.yaw = Math.atan2(-(tree.x - px), -(tree.z - pz)) + Math.PI;
  g.player.pitch = 0.18;
  g.player.facing = g.player.yaw;
  return { x: +tree.x.toFixed(1), z: +tree.z.toFixed(1), prisms: w.shells.stats.prisms };
});
await new Promise((r) => setTimeout(r, 900));
await page.screenshot({ path: 'tests/shot-shells-off.png' });
await page.keyboard.press('F3');
await new Promise((r) => setTimeout(r, 250));
await page.keyboard.press('Semicolon');
await new Promise((r) => setTimeout(r, 900));
const shells = await page.evaluate(() => ({
  on: window.__game.world.shells.debug,
  tris: window.__game.world.shells.stats.triangles,
}));
await page.screenshot({ path: 'tests/shot-shells-on.png' });
await page.keyboard.press('F3');
await page.keyboard.press('Semicolon');

// --- 2. почва и новые деревья: вид сверху на холм ---
const soil = await page.evaluate(() => {
  const g = window.__game;
  const w = g.world;
  const p = g.player.position;
  // ищем место, где есть и трава, и голая земля, и сосны
  let best = null;
  for (const t of w.pineList || []) {
    const h = w.heightAt(t.x, t.z);
    if (h > 7 && h < 16) { best = { x: t.x, z: t.z }; break; }
  }
  if (!best) best = { x: p.x, z: p.z };
  g.player.position.set(best.x + 6, w.heightAt(best.x + 6, best.z) + 7, best.z + 6);
  // свободная камера над соснами: модель героя временно скрываем
  g.player.model.visible = false;
  g.player.applyCamera = () => {
    g.camera.position.set(best.x + 16, w.heightAt(best.x, best.z) + 26, best.z + 16);
    g.camera.lookAt(best.x, w.heightAt(best.x, best.z) + 2, best.z);
  };
  return best;
});
await new Promise((r) => setTimeout(r, 1200));
await page.screenshot({ path: 'tests/shot-soil-trees.png' });

// --- 3. звери и рыбы: камера у воды, где плавают рыбы ---
const sea = await page.evaluate(() => {
  const g = window.__game;
  const w = g.world;
  const fish = g.mobs.list.find((m) => m.type === 'fish');
  const monkey = g.mobs.list.find((m) => m.type === 'monkey');
  if (fish) {
    g.mobs.update(0.05, { position: { x: fish.x + 4, y: 0, z: fish.z }, velocity: { x: 0, z: 0 } }, { audio: null, onHit: () => {}, night: 0 });
  }
  const t = fish || monkey;
  const cx = (fish ? fish.x : monkey.x);
  const cz = (fish ? fish.z : monkey.z);
  g.player.model.visible = false;
  g.player.applyCamera = () => {
    g.camera.position.set(cx + 7, fish ? 2.2 : w.heightAt(cx, cz) + 3, cz + 7);
    g.camera.lookAt(cx, fish ? -0.6 : w.heightAt(cx, cz) + 0.8, cz);
  };
  return { fish: !!fish, monkey: !!monkey, x: +cx.toFixed(1), z: +cz.toFixed(1) };
});
await new Promise((r) => setTimeout(r, 1200));
await page.screenshot({ path: 'tests/shot-fish.png' });

console.log('обводки:', JSON.stringify(info), '· включены:', shells.on, '· треугольников', shells.tris);
console.log('почва/сосны у', JSON.stringify(soil), '· рыбы у', JSON.stringify(sea));
console.log('ошибки страницы:', errors.length ? errors.join(' | ') : 'нет');
await browser.close();
