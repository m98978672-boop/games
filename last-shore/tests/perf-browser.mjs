// Реальный браузер + программный SwiftShader; не результат устройства игрока.
import puppeteer from 'puppeteer-core';
import chromiumPkg from '@sparticuz/chromium';
const chromium=chromiumPkg.default||chromiumPkg;
const browser=await puppeteer.launch({args:[...chromium.args,'--no-sandbox','--enable-unsafe-swiftshader'],executablePath:await chromium.executablePath(),headless:'shell',protocolTimeout:120000,env:{...process.env,LD_LIBRARY_PATH:'/tmp/nssstub'}});
try {
  const page=await browser.newPage(); await page.setViewport({width:900,height:560,deviceScaleFactor:1});
  page.on('pageerror',e=>console.error('Browser error:',e.message));
  await page.goto('http://127.0.0.1:8080/index.html',{waitUntil:'load'}); await page.click('#btn-start');
  await new Promise(r=>setTimeout(r,4000));
  const data=await page.evaluate(async()=>{
    const g=window.__game;
    const stats={frames:0,updateMs:0,renderMs:0,updateCalls:0,renderCalls:0};
    const update=g.update; g.update=function(...args){const t=performance.now();try{return update.apply(this,args);}finally{stats.updateMs+=performance.now()-t;stats.updateCalls++;}};
    const render=g.renderer.render;g.renderer.render=function(...args){const t=performance.now();try{return render.apply(this,args);}finally{stats.renderMs+=performance.now()-t;stats.renderCalls++;}};
    const start=performance.now(); await new Promise(resolve=>{function count(){stats.frames++;if(performance.now()-start>=5000)resolve();else requestAnimationFrame(count);}requestAnimationFrame(count);});
    stats.elapsedMs=performance.now()-start;stats.fps=stats.frames*1000/stats.elapsedMs;
    stats.calls=g.renderer.info.render.calls;stats.triangles=g.renderer.info.render.triangles;
    return stats;
  });
  console.log(JSON.stringify(data,null,2));
} finally { await browser.close(); }
