// Автомасштаб на разных логических размерах и при изменении окна.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const attrs = {}, vars = {}, classes = new Set(), listeners = {};
let coarse = false;
const root = { style:{setProperty:(k,v) => {vars[k]=v;}}, setAttribute:(k,v)=>{attrs[k]=v;} };
const body = { classList:{ toggle:(name,on)=>on ? classes.add(name) : classes.delete(name) } };
const window = { innerWidth:1280, innerHeight:720, devicePixelRatio:1, navigator:{maxTouchPoints:0},
  matchMedia:()=>({matches:coarse, addEventListener(){}}),
  addEventListener:(name,fn)=>{listeners[name]=fn;}, requestAnimationFrame:fn=>fn() };
const context = {window, document:{documentElement:root,body}, setTimeout:fn=>fn()};
vm.createContext(context); vm.runInContext('var WC = window.WC = {};',context);
vm.runInContext(fs.readFileSync(new URL('../src/layout.js',import.meta.url),'utf8'),context);
const layout = context.window.WC.layout;
let calls=0; layout.onChange(()=>calls++); layout.init();
function size(w,h,touch=false) { coarse=touch; window.innerWidth=w; window.innerHeight=h; window.visualViewport=undefined; layout.refresh(); return {...layout.state}; }
let s=size(1280,720); assert.equal(s.device,'desktop'); assert.equal(s.ui,.9); assert.equal(attrs['data-device'],'desktop');
const standard=size(1440,900).ui, big=size(1920,1080).ui, wide=size(3440,1440).ui, fourK=size(3840,2160).ui;
assert.equal(standard,1); assert(big>standard && wide>=big && fourK>=wide); assert.equal(fourK,1.35);
s=size(1024,500); assert.equal(s.device,'desktop'); assert.equal(s.ui,.85);
s=size(960,500); assert.equal(s.device,'phone'); assert(classes.has('is-phone'));
s=size(1024,600,true); assert.equal(s.device,'tablet'); assert(classes.has('is-tablet'));
s=size(390,844,true); assert.equal(s.device,'phone'); assert.equal(s.orient,'portrait');
s=size(1000,1500); assert.equal(s.device,'tablet');
// Pinch visual viewport не переключает CSS-раскладку, если layout viewport остаётся десктопным.
size(1920,1080); window.visualViewport={width:900,height:600}; layout.refresh();
assert.equal(layout.state.device,'desktop'); assert.equal(layout.state.w,900); assert.equal(layout.state.ui,.85);
window.visualViewport=undefined; window.innerWidth=1366; window.innerHeight=768;
const before=calls; listeners.resize(); assert.equal(calls,before+1); assert.equal(vars['--app-w'],'1366px');
assert.equal(layout.state.device,'desktop'); assert(layout.state.ui>=.85 && layout.state.ui<1);
console.log('✓ Автомасштаб ПК, смена размера, телефоны и visualViewport');
