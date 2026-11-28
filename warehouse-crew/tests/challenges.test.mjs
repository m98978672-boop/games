import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const C = createRequire(import.meta.url)('../src/challenges.js');
assert.equal(C.definitions.length,20);
assert.equal(new Set(C.definitions.map(d=>d.id)).size,20);
assert.equal(new Set(C.definitions.map(d=>d.group)).size,4);
let s=C.create();
assert(C.accept(s,'intake-2').ok); assert(C.accept(s,'perfect-2').ok);
assert(!C.accept(s,'intake-5').ok); assert(!C.accept(s,'intake-2').ok);
const deliver=(item, worker='a', result={late:false}, mode='day')=>C.record(s,'delivered',item,result,worker,mode);
const order={mass:10,damage:0,source:'intake',urgent:false};
assert.deepEqual(deliver(order),[]); assert.equal(s.items[0].progress,1);
let done=deliver(order); assert.deepEqual(done.map(x=>x.reward),[20,30]);
assert.deepEqual(deliver(order),[]); assert(!C.accept(s,'intake-2').ok);
assert.deepEqual(C.validate(JSON.parse(JSON.stringify(s))),s);
s=C.create(); assert(C.accept(s,'team-3').ok);
deliver(order,'a'); deliver(order,'a'); deliver(order,'b');
assert.equal(s.items.find(i=>i.id==='team-3').progress,2);
assert.equal(deliver(order,'c')[0].reward,55);
assert(C.accept(s,'night-2').ok); deliver(order,'a',{late:false},'day');
assert.equal(s.items.find(i=>i.id==='night-2').progress,0);
deliver(order,'a',{late:false},'night'); assert.equal(s.items.find(i=>i.id==='night-2').progress,1);
assert(C.cancel(s,'night-2').ok); assert(!C.accept(s,'night-2').ok);
for (const d of C.definitions) {
  let t=C.create(); assert(C.accept(t,d.id).ok);
  const o={mass:d.minMass || Math.min(10,d.maxMass||10),damage:0,source:d.source||'intake',urgent:true};
  const r={late:!!d.late,truck:{status:'done'}};
  assert.equal(C.record(t, d.event==='loaded'?'delivered':'loaded',o,r,'a','night').length,0, d.id);
  if(d.minMass!=null) { C.record(t,d.event,{...o,mass:d.minMass-1},r,'a','night'); assert.equal(t.items.find(x=>x.id===d.id).progress,0,d.id); }
  if(d.maxMass!=null) { C.record(t,d.event,{...o,mass:d.maxMass+1},r,'a','night'); assert.equal(t.items.find(x=>x.id===d.id).progress,0,d.id); }
  if(d.maxDamage!=null) { C.record(t,d.event,{...o,damage:d.maxDamage},r,'a','night'); assert.equal(t.items.find(x=>x.id===d.id).progress,0,d.id); }
  if(d.source) { C.record(t,d.event,{...o,source:'intake'},r,'a','night'); assert.equal(t.items.find(x=>x.id===d.id).progress,0,d.id); }
  if(d.fullTruck) { C.record(t,d.event,o,{...r,truck:{status:'working'}},'a','night'); assert.equal(t.items.find(x=>x.id===d.id).progress,0,d.id); }
  for(let i=0;i<d.goal;i++) { const result=C.record(t,d.event,o,r,'worker-'+i,'night'); if(i===d.goal-1) assert.equal(result[0].reward,d.reward,d.id); }
  assert.equal(t.items.find(x=>x.id===d.id).status,'completed',d.id);
  assert.deepEqual(C.record(t,d.event,o,r,'new','night'),[],d.id);
}
s=C.create(); C.accept(s,'intake-2'); C.finish(s); assert.equal(s.items[0].status,'failed');
for (const edit of [t=>t.items[0].progress=9, t=>t.items[1].id=t.items[0].id, t=>t.items[0].status='completed', t=>t.items[0].workers=['x']]) {
  let t=C.create(); edit(t); assert.throws(()=>C.validate(t));
}
console.log('✓ 20 испытаний: условия, счётчики, лимит, награды, разные рабочие и проверка сохранения');
