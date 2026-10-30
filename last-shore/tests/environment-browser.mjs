import assert from 'node:assert/strict';
import puppeteer from 'puppeteer-core';
import chromiumPkg from '@sparticuz/chromium';
const chromium=chromiumPkg.default||chromiumPkg;
const browser=await puppeteer.launch({args:[...chromium.args,'--no-sandbox','--enable-unsafe-swiftshader'],executablePath:await chromium.executablePath(),headless:'shell',protocolTimeout:120000,env:{...process.env,LD_LIBRARY_PATH:'/tmp/nssstub'}});
try {
 const page=await browser.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.setViewport({width:390,height:844,isMobile:true,hasTouch:true});
 await page.goto('http://127.0.0.1:8080/?safe=1',{waitUntil:'load'});await page.click('#btn-start');await page.waitForFunction('window.__game && window.__game.running',{timeout:50000});
 const result=await page.evaluate(()=>{
  const g=window.__game, r=g.resources;const tree=r.nodes.find(n=>n.type==='tree'&&n.alive);const save=r.campfires;
  r.campfires=[{x:tree.x,z:tree.z,fuel:100}];for(let i=0;i<8;i++)r._environmentStep(0);const burning=r.burning.has(tree),flame=!!tree.burnMesh;
  r._extinguish(tree);r.campfires=save;
  const original=g.player.environmentMaterials[0].mat.color.r;for(let i=0;i<20;i++)g.player.updateEnvironment(1,1,'soil',false);const wet=g.player.environmentMaterials[0].mat.color.r<original;
  g.mine.enter(0,null);g.mine.digDown();const spot=g.mine.digDown();g.underground=true;g.mineLight.visible=true;g.player.setPosition(spot.x,spot.z,g.mineWorld);g.player.position.y=g.mine.floorAt(spot.x,spot.z);g.update(.05);g.renderer.render(g.scene,g.camera);
  const cell=g.mine.level.grid.findIndex(c=>c?.type==='lava');return {burning,flame,wet,hell:g.mine.level.hell,y:g.mine.level.y,lava:cell>=0,safe:!g.mine.inLava(spot.x,spot.z),alive:g.running};
 });
 assert.deepEqual(result,{burning:true,flame:true,wet:true,hell:true,y:-64,lava:true,safe:true,alive:true});assert.deepEqual(errors,[]);console.log('BROWSER: mobile fire, wet materials and hell layer rendered without errors',result);
} finally {await browser.close();}
