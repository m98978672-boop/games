import { chromium } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
const browser = await chromium.launch({headless: true, args: ['--enable-webgl','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const errors = [];
page.on('pageerror', e => errors.push(String(e)));
page.on('console', msg => { if (msg.type() === 'error' && /SCRIPT ERROR|Parse Error|Failed to load|Aborted|RuntimeError/.test(msg.text())) errors.push(msg.text()); });
const checks = [];
async function check(name, fn) { await fn(); checks.push(name); console.log('PASS: '+name); }
const base = process.env.RAZLOM_URL || 'http://127.0.0.1:8765/razlom/web/game.html';
try {
 await page.goto(base);
 await page.waitForFunction(() => window.__razlomStatus?.ready, null, {timeout:120000});
 await check('Real WASM game reaches start menu', async () => {
  const state = await page.evaluate(() => window.__razlomStatus);
  assert.equal(state.paused, true); assert.equal(state.started, false); assert.equal(state.health, 100);
  assert.ok(await page.locator('canvas').count());
 });
 await mkdir('../../docs/razlom/web-evidence', {recursive:true});
 await page.screenshot({path:'../../docs/razlom/web-evidence/menu.png'});
 await page.keyboard.press('Enter');
 await page.waitForFunction(() => window.__razlomStatus?.started && !window.__razlomStatus.paused);
 await check('Start button resumes world through keyboard focus', async () => assert.equal(await page.evaluate(() => window.__razlomStatus.started), true));
 const before = await page.evaluate(() => window.__razlomStatus.position);
 await page.keyboard.down('w'); await page.waitForTimeout(700); await page.keyboard.up('w');
 await page.waitForTimeout(400);
 await check('Player moves under browser keyboard input', async () => {
  const after = await page.evaluate(() => window.__razlomStatus.position);
  assert.ok(Math.hypot(after[0]-before[0], after[2]-before[2]) > .2);
 });
 await page.screenshot({path:'../../docs/razlom/web-evidence/play.png'});
 await page.keyboard.press('Escape');
 await page.waitForFunction(() => window.__razlomStatus?.paused);
 await check('Escape returns to pause menu', async () => assert.equal(await page.evaluate(() => window.__razlomStatus.paused), true));
 // The unavailable load button is disabled; Tab from Start focuses Save.
 await page.keyboard.press('Tab'); await page.keyboard.press('Enter');
 await page.waitForFunction(() => window.__razlomStatus?.saveExists, null, {timeout:15000});
 await check('Shelter save writes inside browser user storage', async () => assert.equal(await page.evaluate(() => window.__razlomStatus.saveExists), true));
 await check('No script or WASM runtime errors', async () => assert.deepEqual(errors, []));
 await writeFile('../../docs/razlom/web-evidence/result.json', JSON.stringify({passed:true,checks,errors,limits:['Software WebGL on Chromium; not a human campaign playthrough','Sound is not auditioned','Only desktop keyboard controls tested']},null,2)+'\n');
} catch(e) {
 console.error(e, errors);
 await mkdir('../../docs/razlom/web-evidence', {recursive:true});
 await page.screenshot({path:'../../docs/razlom/web-evidence/failure.png'});
 process.exitCode = 1;
} finally { await browser.close(); }
