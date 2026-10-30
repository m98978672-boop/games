import assert from 'node:assert/strict';
import puppeteer from 'puppeteer-core';
import chromiumPkg from '@sparticuz/chromium';
const chromium=chromiumPkg.default||chromiumPkg;
const browser=await puppeteer.launch({args:[...chromium.args,'--no-sandbox','--enable-unsafe-swiftshader'],executablePath:await chromium.executablePath(),headless:'shell',protocolTimeout:120000,env:{...process.env,LD_LIBRARY_PATH:'/tmp/nssstub'}});
try {
  const page=await browser.newPage(); const errors=[]; page.on('pageerror',e=>errors.push(e.message));
  await page.setViewport({width:390,height:844,isMobile:true,hasTouch:true});
  await page.goto('http://127.0.0.1:8080/?safe=1',{waitUntil:'load'});
  await page.click('#btn-start');await page.waitForFunction('window.__game && window.__game.running',{timeout:40000});
  const data=await page.evaluate(()=>{
    const g=window.__game;
    const textureSummary={};
    for(const key of ['sand','rock','bark','leaf']) {
      const canvas=g.textures[key].image;
      if(!canvas?.getContext) { textureSummary[key]={canvas:false};continue; }
      const pix=canvas.getContext('2d').getImageData(0,0,canvas.width,canvas.height).data;
      const colors=new Set();for(let i=0;i<pix.length;i+=256)colors.add(`${pix[i]},${pix[i+1]},${pix[i+2]}`);
      textureSummary[key]={canvas:true,width:canvas.width,colors:colors.size};
    }
    g.addWound('eyeL',.8);g.updateWounds(0);
    const damaged={left:document.querySelector('#eye-damage-left').style.opacity,right:document.querySelector('#eye-damage-right').style.opacity,listed:document.querySelector('#hud-wounds').textContent.includes('Левый глаз')};
    g.state.inventory.fiber=2;g.state.inventory.cookedWater=1;g.craft('eyeWash');g.consume('eyeWash');
    return {textureSummary,damaged,healed:document.querySelector('#eye-damage-left').style.opacity,count:g.state.inventory.eyeWash};
  });
  for(const t of Object.values(data.textureSummary)) {assert.ok(t.canvas);assert.equal(t.width,256);assert.ok(t.colors>50);}
  assert.ok(Number(data.damaged.left)>.5);assert.equal(Number(data.damaged.right),0);assert.ok(data.damaged.listed);
  assert.equal(Number(data.healed),0);assert.equal(data.count,0);assert.deepEqual(errors,[]);
  console.log('BROWSER: real procedural textures, mobile eye injury and treatment OK',JSON.stringify(data.textureSummary));
} finally {await browser.close();}
