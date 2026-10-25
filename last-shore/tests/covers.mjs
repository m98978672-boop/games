// Снимаем обложки для витрины сайта (site/assets): Last Shore и Линия Фронта.
import puppeteer from 'puppeteer-core';
import chromiumPkg from '@sparticuz/chromium';
const chromium = chromiumPkg.default || chromiumPkg;

const browser = await puppeteer.launch({
  args: [...chromium.args, '--no-sandbox', '--enable-unsafe-swiftshader'],
  executablePath: await chromium.executablePath(),
  headless: 'shell', protocolTimeout: 420000,
  env: { ...process.env, LD_LIBRARY_PATH: '/tmp/nssstub' },
});

async function shot(url, file, prepare, wait = 3000) {
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 720, deviceScaleFactor: 1 });
  await page.goto(url, { waitUntil: 'load' });
  await new Promise((r) => setTimeout(r, 1200));
  if (prepare) await prepare(page);
  await new Promise((r) => setTimeout(r, wait));
  await page.screenshot({ path: file, type: 'jpeg', quality: 82, optimizeForSpeed: false });
  // спрячем интерфейс, чтобы на обложке был только мир
  await page.close();
}

// Last Shore: чуть повернуть камеру и отойти
await shot('http://127.0.0.1:8081/last-shore/index.html', '../site/assets/last-shore.jpg', async (page) => {
  await page.click('#btn-start').catch(() => {});
  await new Promise((r) => setTimeout(r, 2500));
  await page.evaluate(() => {
    const g = window.__game;
    if (!g) return;
    g.player.yaw += 0.5;
    g.player.pitch = 0.28;
    g.state.inventory.campfireKit = 1;
    g.state.inventory.wood = 4;
    g.placeCampfire();
    g.player.refresh?.();
    // зверь в кадре: обложка должна показывать, что на острове есть жизнь
    const boar = g.mobs?.list.find((m) => m.type === 'boar');
    if (boar) {
      const fx = Math.sin(g.player.facing);
      const fz = Math.cos(g.player.facing);
      boar.x = g.player.position.x + fx * 6 - fz * 3;
      boar.z = g.player.position.z + fz * 6 + fx * 3;
      boar.group.visible = true;
      boar.state = 'wander';
      boar.timer = 8;
      boar.targetX = boar.x;
      boar.targetZ = boar.z;
      boar.facing = g.player.facing + Math.PI / 2;
    }
    document.getElementById('hud').style.opacity = '0.55';
  });
}, 2600);

// Линия Фронта
await shot('http://127.0.0.1:8081/frontline-steel-and-drones/play.html', '../site/assets/frontline.jpg', async (page) => {
  await page.evaluate(() => {
    const click = (sel) => document.querySelector(sel)?.click();
    // стартовые кнопки игры могут называться по-разному — пробуем типовые
    for (const sel of ['#btn-start', '#start-btn', '.btn-start', 'button[data-action="start"]', '.menu button']) {
      const el = document.querySelector(sel);
      if (el) { el.click(); return; }
    }
  });
  // накупим войск, чтобы на обложке был бой, а не пустое поле
  await new Promise((r) => setTimeout(r, 1500));
  await page.evaluate(() => {
    const cards = [...document.querySelectorAll('.unit-card, .card, [data-unit]')].slice(0, 6);
    cards.forEach((c, i) => { for (let k = 0; k < 3; k++) setTimeout(() => c.click(), 120 * i); });
  });
}, 11000);

await browser.close();
console.log('обложки готовы');
