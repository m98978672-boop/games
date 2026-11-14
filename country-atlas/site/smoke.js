// Мини-заглушка DOM: проверяем, что app.js отрабатывает без исключений.
const fs = require('fs');
const vm = require('node:vm');
const path = './';

function makeCtx(){
  const noop = ()=>{};
  return new Proxy({}, { get:(t,k)=> (k in t ? t[k] : noop), set:(t,k,v)=>{ t[k]=v; return true; } });
}
const ctx = makeCtx();

const cols = ['col','face','q','f','log'];
function mkEl(id){
  const e = {
    id, innerHTML:'', textContent:'', value:'0', dataset:{}, attrs:{}, listeners:{},
    width:0, height:0,
    addEventListener(t,f){ (this.listeners[t] = this.listeners[t]||[]).push(f); },
    setAttribute(k,v){ this.attrs[k]=v; }, getAttribute(k){ return this.attrs[k]; },
    setPointerCapture(){},
    getBoundingClientRect(){ return { left:0, top:0, width:900, height:700 }; },
    getContext(){ return ctx; }
  };
  e.classList = { _s:new Set(), add(c){this._s.add(c);}, remove(c){this._s.delete(c);}, contains(c){return this._s.has(c);} };
  if (id && id.startsWith('pane-')) e.classList._s.add(id === 'pane-col' ? 'on' : 'off');
  return e;
}

const ids = ['c','status','log','pane-col','pane-face','pane-q','pane-f','pane-log'];
const map = {}; ids.forEach(i => map[i] = mkEl(i));
const buttons = cols.map(t => { const b = mkEl('btn-'+t); b.dataset.tab=t; b.attrs['aria-selected'] = (t==='col'?'true':'false'); return b; });

global.document = {
  querySelector(sel){
    if (sel.startsWith('#')) { const k=sel.slice(1); if(!map[k]) map[k]=mkEl(k); return map[k]; }
    const m = /\.tabs button\[data-tab="([a-z]+)"\]/.exec(sel);
    if (m) return buttons.find(b => b.dataset.tab === m[1]);
    return null;
  },
  querySelectorAll(sel){
    if (sel === '.tabs button') return buttons;
    if (sel === '.pane') return cols.map(c => map['pane-'+c]);
    return [];
  }
};
global.window = {
  devicePixelRatio: 2,
  addEventListener(){},
};
global.performance = { now: () => Date.now() };

require(path+'core.js');
global.RatgradCore = global.window.RatgradCore;

try {
  vm.runInThisContext(fs.readFileSync(path+'app.js','utf8'), { filename: 'app.js' });
} catch (e) {
  console.error('ОШИБКА при загрузке app.js:', e.message);
  console.error(e.stack.split('\n').slice(0,4).join('\n'));
  process.exit(1);
}

// прожать все вкладки
for (const b of buttons) {
  const list = b.listeners.click || [];
  for (const f of list) {
    try { f(); } catch (e) {
      console.error('ОШИБКА на вкладке ' + b.dataset.tab + ': ' + e.message);
      console.error(e.stack.split('\n').slice(0,3).join('\n'));
      process.exit(1);
    }
  }
}
console.log('smoke ok: вкладки отработали, панели заполнены');
console.log('Формулы →', (map['pane-f'].innerHTML.match(/(\d+) \/ (\d+)/) || []).slice(1).join(' / '));
console.log('Q →', (map['pane-q'].innerHTML.length) + ' символов');
console.log('Грань →', (map['pane-face'].innerHTML.length) + ' символов');
console.log('Столб →', (map['pane-col'].innerHTML.length) + ' символов');
