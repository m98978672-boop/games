// Только подводный вид (v0.19): плавание, нырок, поверхность снизу.
import puppeteer from 'puppeteer-core';
import chromiumPkg from '@sparticuz/chromium';
const chromium = chromiumPkg.default || chromiumPkg;
const browser = await puppeteer.launch({
  args: [...chromium.args, '--no-sandbox', '--enable-unsafe-swiftshader'],
  executablePath: await chromium.executablePath(), headless: 'shell',
  protocolTimeout: 900000, env: { ...process.env, LD_LIBRARY_PATH: '/tmp/nssstub' },
});
const page = await browser.newPage();
await page.setViewport({ width: 800, height: 500 });
const errors = [];
page.on('pageerror', (e) => errors.push('ERR ' + e.message.slice(0, 200)));
await page.goto('http://127.0.0.1:8080/index.html', { waitUntil: 'load' });
await page.click('#btn-start');
await new Promise((r) => setTimeout(r, 4000));
await page.evaluate(() => {
  const g = window.__game; const w = g.world;
  let best = null;
  for (let i = 0; i < 8000; i++) {
    const a = Math.random() * Math.PI * 2, r = 118 + Math.random() * 45;
    const x = Math.cos(a) * r, z = Math.sin(a) * r;
    if (w.heightAt(x, z) < -3.5) { best = { x, z }; break; }
  }
  const p = g.player; p.position.set(best.x, -0.6, best.z); p.velocity.set(0, 0, 0);
  p.yaw = 2.2; p.pitch = 0.05;
});
await new Promise((r) => setTimeout(r, 1200));
const a = await page.evaluate(() => ({ swim: window.__game.player.swimming, y: +window.__game.player.position.y.toFixed(2) }));
await page.screenshot({ path: 'tests/shot-v019-swim.png' });
await page.keyboard.down('ShiftLeft');
// на медленном софт-рендере погружение идёт рывками: ждём состояние, а не время
for (let i = 0; i < 60; i++) {
  await new Promise((r) => setTimeout(r, 400));
  const st = await page.evaluate(() => ({ u: window.__game.player.underwater, y: window.__game.player.position.y }));
  if (st.u && st.y < -3) break;
}
const b = await page.evaluate(() => ({
  under: window.__game.player.underwater, y: +window.__game.player.position.y.toFixed(2),
  air: Math.round(window.__game.player.air), camY: +window.__game.camera.position.y.toFixed(2),
  fog: +window.__game.scene.fog.far.toFixed(1),
}));
await page.screenshot({ path: 'tests/shot-v019-under.png' });
// в третьем лице положительный pitch поднимает камеру и опускает взгляд:
// чтобы посмотреть вверх, нужен отрицательный
// взгляд вверх снимаем, пока Shift ещё держит героя под водой
await page.evaluate(() => { window.__game.player.pitch = -1.1; window.__game.player.yaw = 2.2; });
await new Promise((r) => setTimeout(r, 1600));
await page.screenshot({ path: 'tests/shot-v019-under-up.png' });
const c = await page.evaluate(() => ({ under: window.__game.player.underwater, camY: +window.__game.camera.position.y.toFixed(2) }));
await page.keyboard.up('ShiftLeft');
console.log('плывёт:', JSON.stringify(a));
console.log('нырок:', JSON.stringify(b));
console.log('взгляд вверх:', JSON.stringify(c));
console.log('ошибки:', errors.length ? errors.join(' | ') : 'нет');
await browser.close();
