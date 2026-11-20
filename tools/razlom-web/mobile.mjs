import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
const browser = await chromium.launch({headless:true,args:['--enable-webgl','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const context = await browser.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true,deviceScaleFactor:1});
const page = await context.newPage();
const errors = [];
page.on('pageerror',e=>errors.push(String(e)));
page.on('console',m=>{if(m.type()==='error' && /SCRIPT ERROR|Parse Error|RuntimeError|Aborted/.test(m.text())) errors.push(m.text());});
const checks=[];
async function check(name,fn){await fn();checks.push(name);console.log('PASS mobile: '+name);}
const session=await context.newCDPSession(page);
let fingers=[];
async function point(x,y,id=1){const s=await page.evaluate(()=>window.__razlomStatus);const b=await page.locator('canvas').boundingBox();return {x:b.x+x*b.width/s.view[0],y:b.y+y*b.height/s.view[1],id};}
async function dispatch(type,points){fingers=points;await session.send('Input.dispatchTouchEvent',{type,touchPoints:fingers});}
async function tapRect(rect){const p=await point(rect[0]+rect[2]/2,rect[1]+rect[3]/2);await dispatch('touchStart',[p]);await page.waitForTimeout(100);await dispatch('touchEnd',[]);await page.waitForTimeout(400);}
const base=process.env.RAZLOM_URL || 'http://127.0.0.1:8765/razlom/web/game.html';
try{
 await mkdir('../../docs/razlom/web-evidence',{recursive:true});
 await page.goto(base);
 await page.waitForFunction(()=>window.__razlomStatus?.ready,null,{timeout:120000});
 await page.waitForTimeout(800);
 await check('Touch device auto-detected and portrait viewport fits',async()=>{const s=await page.evaluate(()=>window.__razlomStatus);assert.equal(s.mobile,true);assert.ok(s.view[1]>s.view[0]);assert.ok(s.menuRect[0]>=0 && s.menuRect[0]+s.menuRect[1]<=s.view[0]+1);});
 await page.screenshot({path:'../../docs/razlom/web-evidence/phone-menu.png',timeout:60000});
 await tapRect(await page.evaluate(()=>window.__razlomStatus.startButton));
 await page.waitForFunction(()=>window.__razlomStatus.started && !window.__razlomStatus.paused);
 await check('Start is tappable without keyboard or pointer lock',async()=>assert.equal(await page.evaluate(()=>window.__razlomStatus.touch.visible),true));
 const before=await page.evaluate(()=>window.__razlomStatus.position);
 const origin=await page.evaluate(()=>window.__razlomStatus.touch.origin);
 await dispatch('touchStart',[await point(origin[0],origin[1])]);
 await dispatch('touchMove',[await point(origin[0],origin[1]-52)]);
 await page.waitForTimeout(650);
 await dispatch('touchEnd',[]);
 await page.waitForTimeout(400);
 await check('Virtual stick moves real physics player',async()=>{const a=await page.evaluate(()=>window.__razlomStatus.position);assert.ok(Math.hypot(a[0]-before[0],a[2]-before[2])>.2);});
 const view=await page.evaluate(()=>window.__razlomStatus.view);
 const yaw=await page.evaluate(()=>window.__razlomStatus.yaw);
 await dispatch('touchStart',[await point(view[0]*.6,view[1]*.4)]);
 await dispatch('touchMove',[await point(view[0]*.6+45,view[1]*.4+10)]);
 await dispatch('touchEnd',[]);
 await page.waitForTimeout(450);
 await check('Right-side drag turns the camera',async()=>assert.ok(Math.abs(await page.evaluate(()=>window.__razlomStatus.yaw)-yaw)>.03));
 const ammo=await page.evaluate(()=>window.__razlomStatus.ammo);
 await tapRect(await page.evaluate(()=>window.__razlomStatus.touch.zones.fire));
 await check('Touch fire consumes actual ammunition',async()=>assert.ok(await page.evaluate(()=>window.__razlomStatus.ammo)<ammo));
 const released=await page.evaluate(()=>window.__razlomStatus.ammo);
 await page.waitForTimeout(500);
 await check('Finger release stops automatic fire',async()=>assert.equal(await page.evaluate(()=>window.__razlomStatus.ammo),released));
 await page.screenshot({path:'../../docs/razlom/web-evidence/phone-play.png',timeout:60000});
 await tapRect(await page.evaluate(()=>window.__razlomStatus.touch.zones.menu));
 await page.waitForFunction(()=>window.__razlomStatus.paused);
 await check('Touch pause clears stick state and hides controls',async()=>{const s=await page.evaluate(()=>window.__razlomStatus);assert.deepEqual(s.touch.movement,[0,0]);assert.equal(s.touch.visible,false);});
 await page.setViewportSize({width:844,height:390});
 await page.waitForFunction(()=>window.__razlomStatus.view[0]>window.__razlomStatus.view[1]);
 await page.waitForTimeout(700);
 await check('Orientation change refits drawer without horizontal clipping',async()=>{const s=await page.evaluate(()=>window.__razlomStatus);assert.ok(s.menuRect[0]>=0 && s.menuRect[0]+s.menuRect[1]<=s.view[0]+1);});
 await tapRect(await page.evaluate(()=>window.__razlomStatus.startButton));
 await page.waitForFunction(()=>!window.__razlomStatus.paused);
 await check('Landscape action buttons remain inside screen',async()=>{const s=await page.evaluate(()=>window.__razlomStatus);for(const r of Object.values(s.touch.zones)){assert.ok(r[0]>=0 && r[1]>=0 && r[0]+r[2]<=s.view[0] && r[1]+r[3]<=s.view[1]);}});
 await page.screenshot({path:'../../docs/razlom/web-evidence/phone-landscape.png',timeout:60000});
 await check('No mobile script or WASM errors',async()=>assert.deepEqual(errors,[]));
 await writeFile('../../docs/razlom/web-evidence/mobile-result.json',JSON.stringify({passed:true,checks,errors,limits:['Chromium touch emulation, not a physical Android/iPhone','Hardware FPS, battery and Safari not verified']},null,2)+'\n');
}catch(e){console.error(e,errors);await page.screenshot({path:'../../docs/razlom/web-evidence/mobile-failure.png',timeout:10000}).catch(()=>{});process.exitCode=1;}finally{await browser.close();}
