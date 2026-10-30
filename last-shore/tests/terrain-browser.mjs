import assert from 'node:assert/strict';
import puppeteer from 'puppeteer-core';
import chromiumPkg from '@sparticuz/chromium';
const chromium=chromiumPkg.default||chromiumPkg;
const browser=await puppeteer.launch({args:[...chromium.args,'--no-sandbox','--enable-unsafe-swiftshader'],executablePath:await chromium.executablePath(),headless:'shell',protocolTimeout:120000,env:{...process.env,LD_LIBRARY_PATH:'/tmp/nssstub'}});
try {
  const page=await browser.newPage(); const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.setViewport({width:390,height:844,isMobile:true,hasTouch:true});
  await page.goto('http://127.0.0.1:8080/?safe=1',{waitUntil:'load'});await page.click('#btn-start');
  await page.waitForFunction('window.__game && window.__game.running',{timeout:50000});
  const result=await page.evaluate(()=>{
    const g=window.__game,w=g.world;let target;
    for(let x=-100;x<100&&!target;x+=5)for(let z=-100;z<100;z+=5)if(w.surfaceOf(x+.23,z+.31).surface==='soil'&&w.heightAt(x+.23,z+.31)>3){target={x:x+.23,z:z+.31};break;}
    const before=w.terrain.geometry.attributes.position.count;
    w.dig(target.x,target.z,{radius:.5,depth:.45,mine:99});const pit=w.pitAt(target.x,target.z);
    const geo=w.terrain.geometry,p=geo.attributes.position,idx=geo.index;
    let covers=false;
    const pt=(x,z,a,b,c)=>{const s=(q,r)=>(r[0]-q[0])*(z-q[1])-(r[1]-q[1])*(x-q[0]);const v=[s(a,b),s(b,c),s(c,a)];return v.every(n=>n>=-1e-7)||v.every(n=>n<=1e-7);};
    for(let i=0;i<idx.count;i+=3){const ids=[idx.getX(i),idx.getX(i+1),idx.getX(i+2)];const v=ids.map(j=>[p.getX(j),p.getZ(j)]);if(pt(target.x,target.z,...v)){covers=true;break;}}
    g.renderer.render(g.scene,g.camera);
    return {width:pit.rect.x1-pit.rect.x0,depth:pit.rect.z1-pit.rect.z0,extra:p.count-before,covers,alive:!!g.running};
  });
  assert.equal(result.width,1);assert.equal(result.depth,1);assert.equal(result.covers,false);assert.ok(result.extra>0);assert.ok(result.alive);assert.deepEqual(errors,[]);
  console.log('BROWSER: 1m² opening rendered, mobile startup, shaders and no phantom terrain OK',result);
} finally {await browser.close();}
