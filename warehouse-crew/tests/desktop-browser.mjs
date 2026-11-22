// Настоящий Chromium: адаптация ПК при изменении размера окна.
// Нужны playwright-core и исполняемый Chromium:
// WC_DEPS=/path/to/node_modules WC_BROWSER_EXEC=/path/to/chromium node warehouse-crew/tests/desktop-browser.mjs
// Дополнительные аргументы Chromium можно передать через WC_BROWSER_ARGS (JSON-массив).
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
let playwright;
try { playwright = createRequire(path.join(process.env.WC_DEPS || path.join(root, 'node_modules'), 'noop.js'))('playwright-core'); }
catch { /* optional dependency */ }
if (!playwright || !process.env.WC_BROWSER_EXEC) {
  console.log('⚠ Chromium-тест пропущен: задайте WC_DEPS и WC_BROWSER_EXEC');
  process.exit(0);
}
const mime = { '.html':'text/html; charset=utf-8', '.js':'text/javascript', '.css':'text/css', '.json':'application/json', '.svg':'image/svg+xml', '.png':'image/png' };
const server = createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost');
  let file = path.resolve(root, '.' + decodeURIComponent(url.pathname));
  if (!file.startsWith(root + path.sep)) { res.writeHead(403).end(); return; }
  if (url.pathname.endsWith('/')) file = path.join(file, 'index.html');
  try { const data = await readFile(file); res.writeHead(200, {'Content-Type': mime[path.extname(file)] || 'application/octet-stream'}); res.end(data); }
  catch { res.writeHead(404).end(); }
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const base = 'http://127.0.0.1:' + server.address().port;
const args = process.env.WC_BROWSER_ARGS ? JSON.parse(process.env.WC_BROWSER_ARGS) : ['--no-sandbox', '--use-gl=angle', '--use-angle=swiftshader'];
let browser;
try {
  browser = await playwright.chromium.launch({ executablePath:process.env.WC_BROWSER_EXEC, args, headless:true });
  const page = await browser.newPage({viewport:{width:1280,height:720}, deviceScaleFactor:1});
  const errors=[]; page.on('pageerror',e=>errors.push(e.message));
  await page.goto(base + '/warehouse-crew/', {waitUntil:'load', timeout:60000});
  await page.waitForFunction(() => window.WC && WC.game && WC.game.api.ready && WC.world.state.ready, {timeout:60000});
  await page.evaluate(()=>{WC.game.setPaused(true); WC.render.stop();});
  let prev = 0;
  for (const view of [{width:1024,height:500},{width:1024,height:600},{width:1280,height:720},{width:1366,height:768},{width:1920,height:1080},{width:2560,height:1440},{width:3440,height:1440},{width:3840,height:2160}]) {
    await page.setViewportSize(view);
    await page.waitForFunction(({width,height})=>WC.layout.state.w===width && WC.layout.state.h===height,view,{timeout:30000});
    await page.waitForTimeout(600);
    const geometry=await page.evaluate(()=>{
      const rect=el=>{const r=el.getBoundingClientRect();return {left:r.left,right:r.right,top:r.top,bottom:r.bottom,width:r.width,height:r.height};};
      const p=rect(document.querySelector('#control-panel')), side=rect(document.querySelector('#side'));
      const top=rect(document.querySelector('.topbar')), bar=rect(document.querySelector('.bottom-bar'));
      const actions=rect(document.querySelector('.top-actions'));
      const stats=[...document.querySelectorAll('.top-stats .stat')].map(rect);
      const gl=WC.world.renderer.getContext();
      return {p,side,top,bar,actions,stats,ui:WC.layout.state.ui,device:WC.layout.state.device,
        viewport:[innerWidth,innerHeight],canvas:[document.querySelector('#scene').clientWidth,document.querySelector('#scene').clientHeight],
        cameraAspect:WC.world.camera.aspect,gl:gl.getParameter(gl.VERSION)};
    });
    assert.equal(geometry.device,'desktop'); assert(geometry.ui>=prev && geometry.ui<=1.35); prev=geometry.ui;
    assert.deepEqual(geometry.canvas,[view.width,view.height]); assert.match(geometry.gl,/WebGL/);
    assert(Math.abs(geometry.cameraAspect-view.width/view.height)<.01);
    for(const [label,r] of [['пульт',geometry.p],['сводка',geometry.side],['верхняя панель',geometry.top],['нижняя панель',geometry.bar]]) {
      assert(r.left>=-1 && r.right<=view.width+1 && r.top>=-1 && r.bottom<=view.height+1,label+' вне экрана: '+JSON.stringify({view,r}));
    }
    assert(geometry.p.top >= geometry.top.bottom-1 && geometry.side.top >= geometry.top.bottom-1, 'панели перекрывают шапку '+JSON.stringify({view,geometry}));
    assert(geometry.p.bottom<=geometry.bar.top+1 && geometry.side.bottom<=geometry.bar.top+1, 'панели перекрывают подсказку '+JSON.stringify({view,geometry}));
    assert(geometry.p.right+100 < geometry.side.left,'панели перекрывают вид склада');
    assert(geometry.actions.right<=view.width+1 && geometry.stats.every((r,i)=>r.right<=geometry.actions.left+1 && (i===0 || r.left>=geometry.stats[i-1].right-1)),'элементы шапки перекрываются '+JSON.stringify({view,geometry}));
    console.log(`✓ ПК ${view.width}×${view.height}: масштаб ${geometry.ui}, шапка, панели, камера`);
  }
  // После уменьшения окна масштаб пересчитывается, состояние игры не меняется.
  await page.setViewportSize({width:1280,height:720});
  await page.waitForFunction(()=>WC.layout.state.w===1280 && WC.layout.state.h===720);
  const button=page.locator('#btn-scene-focus'); await button.scrollIntoViewIfNeeded();
  const before=await page.evaluate(()=>{const c=WC.game.captureCheckpoint();return JSON.stringify({warehouse:c.warehouse,crew:c.crew});});
  await button.click(); assert.equal(await button.getAttribute('aria-pressed'),'true');
  assert.equal(await page.locator('#side').isVisible(),false);
  assert.equal(await page.evaluate(()=>document.activeElement.id),'btn-scene-focus');
  assert.equal(await page.evaluate(()=>{const c=WC.game.captureCheckpoint();return JSON.stringify({warehouse:c.warehouse,crew:c.crew});}),before);
  await button.click(); assert.equal(await page.locator('#side').isVisible(),true);
  assert.equal(await button.getAttribute('aria-pressed'),'false');
  await page.setViewportSize({width:800,height:600}); await page.waitForFunction(()=>WC.layout.state.w===800);
  assert.equal(await button.isVisible(),false); assert.notEqual(await page.evaluate(()=>WC.layout.state.device),'desktop');
  await page.setViewportSize({width:1280,height:720}); await page.waitForFunction(()=>WC.layout.state.w===1280);
  assert.equal(await button.isVisible(),true);
  assert.deepEqual(errors,[]); console.log('✓ ПК: переключение обзора и переход между раскладками');
} finally {
  if (browser) await browser.close();
  await new Promise(resolve => server.close(resolve));
}
