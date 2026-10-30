import assert from 'node:assert/strict';
import puppeteer from 'puppeteer-core';
import chromiumPkg from '@sparticuz/chromium';
const chromium=chromiumPkg.default||chromiumPkg;
const browser=await puppeteer.launch({args:[...chromium.args,'--no-sandbox','--enable-unsafe-swiftshader'],executablePath:await chromium.executablePath(),headless:'shell',protocolTimeout:120000,env:{...process.env,LD_LIBRARY_PATH:'/tmp/nssstub'}});
try {
 const page=await browser.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.setViewport({width:390,height:844,isMobile:true,hasTouch:true});
 await page.goto('http://127.0.0.1:8080/?safe=1',{waitUntil:'load'});await page.click('#btn-start');await page.waitForFunction('window.__game && window.__game.running',{timeout:50000});
 const result=await page.evaluate(()=>{
  const g=window.__game,tree=g.resources.nodes.find(n=>n.type==='tree'&&n.alive);g.player.position.set(tree.x+2,tree.y,tree.z);g.player.facing=-Math.PI/2;g.state.inventory.axe=1;g.assignHotbar('axe',0);g.selectSlot(0);
  g.aim={target:{kind:'node',node:tree}};
  for(let i=0;i<4;i++){g.attackCooldown=0;g.attack();}
  const model=g.resources.cutTrees.get(tree);const progress=model.progress;g.resources._updateCutTrees(.2);const leaning=Math.abs(model.pivot.quaternion.x)+Math.abs(model.pivot.quaternion.z)>0;
  g.camera.position.set(tree.x+3,tree.y+1.5,tree.z);g.camera.lookAt(tree.x,tree.y+1,tree.z);g.camera.updateMatrixWorld(true);g.renderer.render(g.scene,g.camera);
  for(let i=0;i<4&&tree.alive;i++){g.aim={target:{kind:'node',node:tree}};g.attackCooldown=0;g.attack();}
  g.resources._updateCutTrees(1);const falling=model.falling&&model.pivot.quaternion.angleTo(model.root.quaternion)>0.1;g.renderer.render(g.scene,g.camera);
  return {progress,leaning,notch:!!model.bark.geometry.userData.notch,falling,dead:!tree.alive,collider:tree.item.collider.disabled};
 });
 assert.ok(result.progress>.4);assert.equal(result.leaning,true);assert.equal(result.notch,true);assert.equal(result.falling,true);assert.equal(result.dead,true);assert.equal(result.collider,true);assert.deepEqual(errors,[]);
 console.log('BROWSER: mobile axe strikes, mesh notch, leaning and falling render OK',result);
}finally{await browser.close();}
