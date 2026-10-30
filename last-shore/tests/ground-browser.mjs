import assert from 'node:assert/strict';
import puppeteer from 'puppeteer-core';
import chromiumPkg from '@sparticuz/chromium';
const chromium=chromiumPkg.default||chromiumPkg;
const browser=await puppeteer.launch({args:[...chromium.args,'--no-sandbox','--enable-unsafe-swiftshader'],executablePath:await chromium.executablePath(),headless:'shell',protocolTimeout:120000,env:{...process.env,LD_LIBRARY_PATH:'/tmp/nssstub'}});
try {
  const page=await browser.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.setViewport({width:390,height:844,isMobile:true,hasTouch:true});
  await page.goto('http://127.0.0.1:8080/?safe=1',{waitUntil:'load'});await page.click('#btn-start');
  await page.waitForFunction('window.__game && window.__game.running',{timeout:50000});
  const result=await page.evaluate(()=>{
    const g=window.__game,w=g.world;let target;
    for(let x=-100;x<100&&!target;x+=5)for(let z=-100;z<100;z+=5)if(w.surfaceOf(x+.25,z+.35).surface==='soil'&&w.heightAt(x+.25,z+.35)>3&&w.slopeAt(x+.25,z+.35)<.4){target={x:x+.25,z:z+.35};break;}
    const y=w.heightAt(target.x,target.z);const point={...target,y};
    for(let i=0;i<6;i++)g.digGroundAt(point);
    const before=w.heightAt(target.x,target.z);const damage=w.groundDamageAt(target.x,target.z);
    g.digGroundAt(point);const pit=w.pitAt(target.x,target.z);
    for(let i=0;i<3;i++)w.dig(target.x,target.z,{radius:.5,depth:.45,mine:99});
    for(let i=0;i<150;i++)w.updatePitPhysics(.2,1);
    g.renderer.render(g.scene,g.camera);
    return {y,before,remaining:damage.remaining,pit:!!pit,width:pit.rect.x1-pit.rect.x0,wet:pit.wetness,water:pit.waterDepth,visible:pit.waterMesh.visible,alive:g.running};
  });
  assert.equal(result.before,result.y);assert.ok(result.remaining>0);assert.ok(result.pit);assert.equal(result.width,1);assert.ok(result.wet>0.1);assert.ok(result.water>0);assert.ok(result.visible);assert.ok(result.alive);assert.deepEqual(errors,[]);
  console.log('BROWSER: mobile cumulative digging, 1m pit, visible water and wetness OK',result);
}finally{await browser.close();}
