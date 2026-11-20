import { chromium } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
const browser = await chromium.launch({headless: true, args: ['--enable-webgl','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
let capturePage = page;
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
 await page.waitForTimeout(1000);
 await check('Right menu stays inside viewport after text shaping', async () => {
  const rect = await page.evaluate(() => window.__razlomStatus.menuRect);
  assert.ok(rect[0] > 700 && rect[0] + rect[1] <= 1441, JSON.stringify(rect));
 });
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
 // Click the actual Godot-rendered Save button, not an HTML stand-in.
 await page.waitForTimeout(600);
 const saveRect = await page.evaluate(() => window.__razlomStatus.saveButton);
 await page.mouse.click(saveRect[0] + saveRect[2]/2, saveRect[1] + saveRect[3]/2);
 await page.waitForFunction(() => window.__razlomStatus?.saveExists, null, {timeout:15000});
 await check('Shelter save writes inside browser user storage', async () => assert.equal(await page.evaluate(() => window.__razlomStatus.saveExists), true));
 await page.waitForTimeout(1600);
 await page.reload();
 await page.waitForFunction(() => window.__razlomStatus?.ready, null, {timeout:120000});
 await check('Save survives a complete page reload through IndexedDB', async () => {
  assert.equal(await page.evaluate(() => window.__razlomStatus.saveExists), true);
 });
 await page.waitForTimeout(800);
 const loadRect = await page.evaluate(() => window.__razlomStatus.loadButton);
 await page.mouse.click(loadRect[0] + loadRect[2]/2, loadRect[1] + loadRect[3]/2);
 await page.waitForFunction(() => window.__razlomStatus?.started && !window.__razlomStatus.paused);
 await check('Saved game loads from the browser start menu', async () => assert.equal(await page.evaluate(() => window.__razlomStatus.health > 0), true));
 // Release the first software-WebGL context before starting another game.
 await page.close();
 const landing = await browser.newPage({viewport:{width:1440,height:900}});
 capturePage = landing;
 landing.on('pageerror', e => errors.push(String(e)));
 await landing.goto(new URL('../', base).href);
 await landing.locator('#launch').click();
 const embeddedElement = await landing.locator('#game-frame').elementHandle();
 const embedded = await embeddedElement.contentFrame();
 await embedded.waitForFunction(() => window.__razlomStatus?.ready, null, {timeout:120000});
 await check('Games launcher opens the real game inside its iframe', async () => assert.equal(await landing.locator('#game-stage').isVisible(), true));
 await landing.screenshot({path:'../../docs/razlom/web-evidence/launcher.png', timeout:90000});
 await landing.close();
 await check('No script or WASM runtime errors', async () => assert.deepEqual(errors, []));
 await writeFile('../../docs/razlom/web-evidence/result.json', JSON.stringify({passed:true,checks,errors,limits:['Software WebGL on Chromium; not a human campaign playthrough','Sound is not auditioned','Only desktop keyboard controls tested']},null,2)+'\n');
} catch(e) {
 console.error(e, errors);
 await mkdir('../../docs/razlom/web-evidence', {recursive:true});
 if (!capturePage.isClosed()) await capturePage.screenshot({path:'../../docs/razlom/web-evidence/failure.png',timeout:10000}).catch(() => {});
 process.exitCode = 1;
} finally { await browser.close(); }
