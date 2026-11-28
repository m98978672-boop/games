// Настоящий Chromium: WC_DEPS=... WC_BROWSER_EXEC=... node tests/challenges-browser.mjs
import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
let playwright;
try { playwright=createRequire(path.join(process.env.WC_DEPS || path.join(root,'node_modules'),'noop.js'))('playwright-core'); } catch {}
if (!playwright || !process.env.WC_BROWSER_EXEC) { console.log('⚠ Chromium-тест пропущен: задайте WC_DEPS и WC_BROWSER_EXEC'); process.exit(0); }
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml','.png':'image/png'};
const server=createServer(async(req,res)=>{
  const url=new URL(req.url,'http://localhost'); let file=path.resolve(root,'.'+decodeURIComponent(url.pathname));
  if(!file.startsWith(root+path.sep)) {res.writeHead(403).end(); return;}
  if(url.pathname.endsWith('/')) file=path.join(file,'index.html');
  try {res.writeHead(200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream'}); res.end(await readFile(file));}
  catch {if (!res.headersSent) res.writeHead(404); res.end();}
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
let browser;
try {
  browser=await playwright.chromium.launch({executablePath:process.env.WC_BROWSER_EXEC,headless:true,args:process.env.WC_BROWSER_ARGS?JSON.parse(process.env.WC_BROWSER_ARGS):['--no-sandbox','--use-gl=angle','--use-angle=swiftshader']});
  for (const size of [{width:1280,height:720},{width:390,height:844}]) {
    const context=await browser.newContext({viewport:size}); const page=await context.newPage(), errors=[];
    page.on('pageerror',e=>errors.push(e.message));
    await page.goto('http://127.0.0.1:'+server.address().port+'/warehouse-crew/',{waitUntil:'load',timeout:60000});
    await page.waitForFunction(()=>WC.game.api.ready && WC.world.state.ready,{timeout:60000});
    await page.evaluate(()=>{WC.game.setPaused(true); WC.ui.state.lastUiAt=-Infinity; WC.ui.frame(0);});
    if(size.width<500) { await page.locator('#sheet-handle').click(); await page.waitForTimeout(1000); }
    await page.locator('#challenge-board summary').click();
    const first=page.locator('[data-challenge="intake-2"]'); await first.scrollIntoViewIfNeeded(); await first.focus(); await page.keyboard.press('Enter');
    assert.equal(await page.locator('#challenge-count').textContent(),'1 / 2');
    await page.locator('#challenge-group').selectOption('Фуры');
    assert.equal(await page.locator('[data-challenge="load-2"]').count(),1);
    assert.equal(await page.locator('[data-challenge="light"]').count(),0);
    assert.equal(await page.locator('[data-challenge="intake-2"]').count(),1);
    await page.reload({waitUntil:'load',timeout:60000});
    await page.waitForFunction(()=>WC.game.api.ready && WC.world.state.ready,{timeout:60000});
    assert.equal(await page.evaluate(()=>WC.game.api.challenges.items[0].status),'active');
    assert.equal(await page.evaluate(()=>WC.game.api.resumeStatus),'restored');
    if(size.width<500) { await page.locator('#sheet-handle').click(); await page.waitForTimeout(1000); }
    await page.locator('#career-board summary').click();
    await page.locator('[data-career-action="start"]').click();
    await page.locator('[data-career-action="offer-local"]').click();
    await page.locator('[data-career-action="mode-rush"]').click();
    assert.equal(await page.evaluate(()=>WC.game.api.career.current.offer),'local');
    await page.locator('#schedule-details summary').click();
    await page.locator('#schedule-delay').selectOption('30');
    await page.locator('[data-schedule="unload"]').click();
    assert(await page.evaluate(()=>WC.game.api.schedule.unload));
    await page.reload({waitUntil:'load',timeout:60000});
    await page.waitForFunction(()=>WC.game.api.ready && WC.world.state.ready,{timeout:60000});
    assert.equal(await page.evaluate(()=>WC.game.api.career.current.offer),'local');
    assert.equal(await page.evaluate(()=>WC.game.api.career.nextMode),'rush');
    assert(await page.evaluate(()=>WC.game.api.schedule.unload));
    assert.deepEqual(errors,[]);
    console.log('✓ Испытания, карьера и расписание: управление и сохранение '+size.width+'×'+size.height);
    await context.close();
  }
} finally { if(browser) await browser.close(); await new Promise(resolve=>server.close(resolve)); }
