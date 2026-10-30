import assert from 'node:assert/strict';
import puppeteer from 'puppeteer-core';
import chromiumPkg from '@sparticuz/chromium';
const chromium = chromiumPkg.default || chromiumPkg;
const browser = await puppeteer.launch({args:[...chromium.args,'--no-sandbox','--enable-unsafe-swiftshader'], executablePath:await chromium.executablePath(), headless:'shell', protocolTimeout:120000, env:{...process.env,LD_LIBRARY_PATH:'/tmp/nssstub'}});
try {
  const page = await browser.newPage();
  const errors=[]; page.on('pageerror',e=>errors.push(e.message));
  await page.setViewport({width:390,height:844,isMobile:true,hasTouch:true});
  await page.goto('http://127.0.0.1:8080/?safe=1',{waitUntil:'load'});
  await page.click('#btn-start'); await page.waitForFunction('window.__game?.running',{timeout:40000});
  const result = await page.evaluate(()=>{
    const game=window.__game, resources=game.resources, pos=game.player.position;
    const fire=resources.addCampfire(pos.x+4,pos.z+4), before=fire.fuel;
    resources.update(1/30);
    return {before,after:fire.fuel,tick:resources.perepletClock.tick,visible:fire.flame.visible};
  });
  assert.ok(result.tick>0); assert.ok(result.after<result.before); assert.equal(result.visible,true);
  await page.evaluate(()=>window.__game.pause());
  const tick=await page.evaluate(()=>window.__game.resources.perepletClock.tick);
  await new Promise(resolve=>setTimeout(resolve,300));
  assert.equal(await page.evaluate(()=>window.__game.resources.perepletClock.tick),tick);
  assert.deepEqual(errors,[]); console.log('BROWSER ПЕРЕПЛЁТ + КОСТЁР OK');
} finally { await browser.close(); }
