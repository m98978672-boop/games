import {JSDOM} from 'jsdom';
import {build} from 'esbuild';
import fs from 'node:fs';
import assert from 'node:assert/strict';
const source=fs.readFileSync('src/main.js','utf8').replace("new THREE.WebGLRenderer({antialias:false,powerPreference:'high-performance'})",'new window.TestRenderer()').replace('loadCityAssets(scene,cityLandmarks);','/* assets tested separately */');
const bundle=await build({stdin:{contents:source,resolveDir:process.cwd()+'/src',sourcefile:'main.js'},bundle:true,write:false,format:'iife',platform:'browser'});
const html=fs.readFileSync('index.html','utf8').replace(/<script src="game\.bundle\.js[^"]*"><\/script>/,'');
const dom=new JSDOM(html,{url:'https://example.test/night-taxi/',runScripts:'outside-only'});
const w=dom.window;w.PointerEvent=class extends w.MouseEvent{constructor(type,options={}){super(type,options);this.pointerId=options.pointerId??1;this.pointerType=options.pointerType??'touch'}};let nextFrame;w.requestAnimationFrame=f=>{nextFrame=f};w.HTMLCanvasElement.prototype.getContext=()=>new Proxy({}, {get:(target,key)=>target[key]||(()=>{}),set:(target,key,value)=>(target[key]=value,true)});
let viewport={width:1000,height:600};w.HTMLElement.prototype.getBoundingClientRect=()=>({width:viewport.width,height:viewport.height,left:0,top:0,right:viewport.width,bottom:viewport.height});
w.TestRenderer=class{constructor(){this.domElement=w.document.createElement('canvas');w.testRenderer=this}setPixelRatio(ratio){this.pixelRatio=ratio}setSize(width,height,updateStyle=true){this.width=width;this.height=height;if(updateStyle){this.domElement.style.width=width+'px';this.domElement.style.height=height+'px'}}render(scene,camera){this.camera=camera;this.scene=scene}};
w.eval(bundle.outputFiles[0].text);nextFrame(w.performance.now()+20);
assert.ok(Math.abs(w.testRenderer.camera.position.y-1.18)<.01,'initial camera is in cabin');
assert.equal(w.testRenderer.domElement.style.width,'1000px','canvas CSS width equals viewport');
assert.equal(w.testRenderer.domElement.style.height,'600px','canvas CSS height equals viewport');
assert.equal(w.testRenderer.width,1000);assert.equal(w.testRenderer.height,600);assert.ok(Math.abs(w.testRenderer.camera.aspect-1000/600)<1e-10);
viewport={width:1568,height:778};nextFrame(w.performance.now()+25);assert.equal(w.testRenderer.width,1568);assert.equal(w.testRenderer.height,778);assert.ok(Math.abs(w.testRenderer.camera.aspect-1568/778)<1e-10);
viewport={width:844,height:390};w.dispatchEvent(new w.Event('resize'));assert.equal(w.testRenderer.width,844,'resize event updates canvas without waiting for a frame');nextFrame(w.performance.now()+27);assert.equal(w.testRenderer.width,844);assert.equal(w.testRenderer.height,390);assert.equal(w.testRenderer.domElement.style.width,'844px');assert.equal(w.testRenderer.domElement.style.height,'390px');

const d=w.document,click=id=>d.getElementById(id).click(),visible=id=>!d.getElementById(id).classList.contains('hidden');
assert.equal(visible('tabletOverlay'),false);
// Drag the cabin view vertically and horizontally; double-click recentres it.
const canvas=w.testRenderer.domElement;const before=w.testRenderer.camera.getWorldDirection(new (await import('three')).Vector3());
canvas.dispatchEvent(new w.PointerEvent('pointerdown',{pointerId:55,clientX:200,clientY:200}));canvas.dispatchEvent(new w.PointerEvent('pointermove',{pointerId:55,clientX:260,clientY:240}));nextFrame(w.performance.now()+30);
const after=w.testRenderer.camera.getWorldDirection(new (await import('three')).Vector3());assert.ok(Math.abs(after.x-before.x)>.1&&Math.abs(after.y-before.y)>.05,'camera follows drag on both axes');
canvas.dispatchEvent(new w.PointerEvent('pointerup',{pointerId:55}));canvas.dispatchEvent(new w.MouseEvent('dblclick'));nextFrame(w.performance.now()+35);const centred=w.testRenderer.camera.getWorldDirection(new (await import('three')).Vector3());assert.ok(centred.distanceTo(before)<.01,'double click recentres view');
assert.equal(d.getElementById('doorBtn'),null,'nonfunctional door control removed');assert.equal(d.getElementById('sound'),null,'old placeholder sound control removed');assert.ok(d.getElementById('soundBtn'),'functional sound control exists');
click('tabletBtn');assert.equal(visible('tabletOverlay'),true);assert.match(d.getElementById('pauseBtn').textContent,/ПРОДОЛЖИТЬ/);assert.equal(d.getElementById('tabletBtn').getAttribute('aria-expanded'),'true');
click('accept');assert.match(d.getElementById('orderContent').textContent,/ЗА ПАССАЖИРОМ/);click('closeTablet');assert.equal(visible('tabletOverlay'),false);assert.match(d.getElementById('pauseBtn').textContent,/ПАУЗА/);
click('pauseBtn');click('tabletBtn');click('closeTablet');assert.match(d.getElementById('pauseBtn').textContent,/ПРОДОЛЖИТЬ/,'previous pause preserved');
click('pauseBtn');click('tabletBtn');w.dispatchEvent(new w.Event('blur'));click('closeTablet');assert.match(d.getElementById('pauseBtn').textContent,/ПРОДОЛЖИТЬ/,'focus loss remains paused');
click('tabletBtn');click('settingsBtn');assert.equal(visible('modal'),true);w.dispatchEvent(new w.KeyboardEvent('keydown',{key:'Escape'}));assert.equal(visible('modal'),false);w.dispatchEvent(new w.KeyboardEvent('keydown',{key:'Escape'}));assert.equal(visible('tabletOverlay'),false);
click('cameraBtn');nextFrame(w.performance.now()+40);assert.ok(Math.abs(w.testRenderer.camera.position.y-4.0)<.01,'camera button switches to third-person');assert.ok(w.testRenderer.scene.getObjectByName('interior'),'complete Garage vehicle remains in scene');assert.match(d.getElementById('cameraLabel').textContent,/СНАРУЖИ/);
// On-screen buttons work with a mouse or touch-style pointer and release on pause.
click('pauseBtn');
const gas=d.querySelector('[data-key="gas"]'),left=d.querySelector('[data-key="left"]');
gas.dispatchEvent(new w.PointerEvent('pointerdown',{bubbles:true,cancelable:true,pointerId:1}));
left.dispatchEvent(new w.PointerEvent('pointerdown',{bubbles:true,cancelable:true,pointerId:2}));
const context=new w.MouseEvent('contextmenu',{bubbles:true,cancelable:true});gas.dispatchEvent(context);assert.ok(context.defaultPrevented,'long press menu blocked');
assert.ok(gas.classList.contains('is-active'));assert.ok(left.classList.contains('is-active'));
let time=w.performance.now()+100;for(let i=0;i<20;i++){time+=50;nextFrame(time)}
assert.ok(Number(d.getElementById('speed').textContent)>0,'gas accelerates using on-screen pointer');
left.dispatchEvent(new w.PointerEvent('pointerup',{bubbles:true,pointerId:2}));assert.ok(gas.classList.contains('is-active'),'releasing steering keeps gas held');assert.ok(!left.classList.contains('is-active'));left.dispatchEvent(new w.PointerEvent('pointerdown',{bubbles:true,cancelable:true,pointerId:3}));
click('pauseBtn');assert.ok(!gas.classList.contains('is-active'));assert.ok(!left.classList.contains('is-active'));const pausedSpeed=Number(d.getElementById('speed').textContent);for(let i=0;i<8;i++){time+=50;nextFrame(time)}assert.equal(Number(d.getElementById('speed').textContent),pausedSpeed,'pause freezes speed');
click('pauseBtn');for(let i=0;i<8;i++){time+=50;nextFrame(time)}
assert.ok(Number(d.getElementById('speed').textContent)<pausedSpeed,'released gas allows the car to coast');
// Physical keys work even when the system keyboard layout produces Cyrillic.
const key=(type,code,character,extra={})=>w.dispatchEvent(new w.KeyboardEvent(type,{key:character,code,bubbles:true,cancelable:true,...extra}));
key('keydown','KeyW','ц');for(let i=0;i<20;i++){time+=50;nextFrame(time)}
assert.ok(Number(d.getElementById('speed').textContent)>0,'physical W accelerates in Russian layout');
key('keyup','KeyW','ц');key('keydown','KeyS','ы');for(let i=0;i<60;i++){time+=50;nextFrame(time)}key('keyup','KeyS','ы');
assert.equal(Number(d.getElementById('speed').textContent),0,'braking brings car to a stop');
const view=d.getElementById('cameraLabel').textContent;key('keydown','KeyC','с');assert.notEqual(d.getElementById('cameraLabel').textContent,view,'C switches camera');
const switched=d.getElementById('cameraLabel').textContent;key('keydown','KeyC','с',{repeat:true});assert.equal(d.getElementById('cameraLabel').textContent,switched,'held shortcut does not repeat');
key('keydown','KeyR','к');assert.match(d.getElementById('gearBtn').textContent,/R/);key('keydown','KeyR','к');assert.match(d.getElementById('gearBtn').textContent,/D/);
key('keydown','Escape','Escape');assert.match(d.getElementById('pauseBtn').textContent,/ПРОДОЛЖИТЬ/);key('keydown','Escape','Escape');assert.match(d.getElementById('pauseBtn').textContent,/ПАУЗА/);
key('keydown','KeyT','е');assert.equal(visible('tabletOverlay'),true);key('keydown','Escape','Escape');assert.equal(visible('tabletOverlay'),false);
// Lights, signals and rain are real persistent controls; keyboard works in Russian layout.
click('lightBtn');assert.equal(d.getElementById('lightBtn').getAttribute('aria-pressed'),'false');key('keydown','KeyL','д');assert.equal(d.getElementById('lightBtn').getAttribute('aria-pressed'),'true');
key('keydown','KeyQ','й');assert.equal(d.getElementById('leftSignal').getAttribute('aria-pressed'),'true');key('keydown','KeyE','у');assert.equal(d.getElementById('rightSignal').getAttribute('aria-pressed'),'true');assert.equal(d.getElementById('leftSignal').getAttribute('aria-pressed'),'false');key('keydown','KeyE','у');assert.equal(d.getElementById('rightSignal').getAttribute('aria-pressed'),'false');
click('rainBtn');assert.equal(d.getElementById('rainBtn').getAttribute('aria-pressed'),'true');assert.equal(JSON.parse(w.localStorage.getItem('nightTaxi3D')).rain,true);time+=50;nextFrame(time);assert.equal(w.testRenderer.scene.getObjectByName('rain').visible,true);
click('hornBtn');assert.match(d.getElementById('toast').textContent,/Включите звук/);click('soundBtn');assert.match(d.getElementById('toast').textContent,/не поддерживается/);
const lost=new w.Event('webglcontextlost',{cancelable:true});w.testRenderer.domElement.dispatchEvent(lost);assert.ok(lost.defaultPrevented);assert.equal(visible('renderError'),true);assert.match(d.getElementById('pauseBtn').textContent,/ПРОДОЛЖИТЬ/);w.testRenderer.domElement.dispatchEvent(new w.Event('webglcontextrestored'));assert.equal(visible('renderError'),false);
click('helpBtn');assert.equal(visible('drivingHelp'),true);click('closeHelp');assert.equal(visible('drivingHelp'),false);
console.log('Планшет, экранные педали, пауза, заказ и камеры: OK');dom.window.close();
// Start from a saved pickup and run the actual tablet-to-boarding-to-ride flow.
const boardDom=new JSDOM(html,{url:'https://example.test/night-taxi/',runScripts:'outside-only'}), bw=boardDom.window;
bw.PointerEvent=w.PointerEvent;let frame;bw.requestAnimationFrame=f=>{frame=f};bw.HTMLCanvasElement.prototype.getContext=w.HTMLCanvasElement.prototype.getContext;
bw.HTMLElement.prototype.getBoundingClientRect=()=>({width:1000,height:600,left:0,top:0,right:1000,bottom:600});
bw.TestRenderer=class{constructor(){this.domElement=bw.document.createElement('canvas');bw.testRenderer=this}setPixelRatio(){}setSize(){}render(scene,camera){this.scene=scene;this.camera=camera}};
bw.localStorage.setItem('nightTaxi3D',JSON.stringify({stage:'board',order:0,x:7,z:200,heading:0}));bw.eval(bundle.outputFiles[0].text);
let clock=bw.performance.now()+20;frame(clock);const bd=bw.document;bd.getElementById('tabletBtn').click();bd.getElementById('continueOrder').click();
assert.ok(bd.getElementById('tabletOverlay').classList.contains('hidden'),'tablet closes for boarding animation');
const passenger=bw.testRenderer.scene.getObjectByName('passenger'),initial=passenger.position.x;
for(let i=0;i<30;i++){clock+=50;frame(clock)}assert.ok(passenger.position.x<initial,'passenger approaches the car');
assert.equal(JSON.parse(bw.localStorage.getItem('nightTaxi3D')).stage,'board','trip does not advance before animation finishes');
bd.getElementById('pauseBtn').click();const frozen=passenger.position.x;for(let i=0;i<15;i++){clock+=50;frame(clock)}assert.equal(passenger.position.x,frozen,'boarding pauses');bd.getElementById('pauseBtn').click();
for(let i=0;i<70;i++){clock+=50;frame(clock)}assert.equal(JSON.parse(bw.localStorage.getItem('nightTaxi3D')).stage,'ride','trip advances only after boarding');assert.equal(passenger.visible,false);assert.equal(bw.testRenderer.scene.getObjectByName('seatedPassenger').visible,true,'passenger remains in rear seat after boarding');
boardDom.window.close();console.log('Посадка: интерфейс, пауза и продолжение заказа: OK');
const broken=new JSDOM(html,{url:'https://example.test/night-taxi/',runScripts:'outside-only'});
broken.window.TestRenderer=class{constructor(){throw new Error('no WebGL')}};
assert.throws(()=>broken.window.eval(bundle.outputFiles[0].text),/WebGL недоступен/);
assert.ok(!broken.window.document.getElementById('renderError').classList.contains('hidden'),'WebGL errors are shown, not disguised as 3D');
broken.window.close();
console.log('Сообщение при недоступном WebGL: OK');
