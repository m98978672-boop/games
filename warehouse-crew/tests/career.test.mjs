import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const C=createRequire(import.meta.url)('../src/career.js');
const zero={dropped:0,ruined:0,missed:0};
let s=C.create(); assert.equal(s.enabled,false); assert(C.enable(s,zero).ok); assert(!C.enable(s,zero).ok);
assert(!C.buy(s,'logistics').ok); assert(C.chooseOffer(s,'local').ok); assert(!C.chooseOffer(s,'freight').ok);
const order={damage:0,source:'intake',mass:25}, result={late:false};
for(let i=0;i<3;i++) C.record(s,'delivered',order,result);
assert.equal(s.current.progress,3); assert.equal(s.current.perfect,3);
let r=C.settle(s,zero); assert.equal(r.gross,30); assert.equal(r.bonus,35); assert.equal(s.balance,65); assert.equal(s.reputation,58);
assert.equal(C.settle(s,zero),null); assert.equal(C.record(s,'delivered',order,result).scoreBonus,0);
assert(C.buy(s,'quality').ok); assert.equal(s.balance,5); assert(!C.buy(s,'quality').ok);
assert(C.setMode(s,'rush').ok); assert(!C.setMode(s,'nonsense').ok); C.begin(s,zero);
assert.equal(s.current.mode,'rush'); assert.equal(C.spawnInterval(s,12),9.600000000000001);
assert.equal(C.record(s,'delivered',order,result).scoreBonus,2);
assert.equal(C.record(s,'delivered',{...order,damage:.05},result).scoreBonus,0);
assert.equal(C.record(s,'delivered',order,{late:true}).scoreBonus,0);
assert.equal(C.settle(s,{dropped:1,ruined:1,missed:1}).penalties,16);
assert.deepEqual(C.validate(JSON.parse(JSON.stringify(s))),s);
for(const offer of C.offers) {
 let t=C.create(); C.enable(t,zero); assert(C.chooseOffer(t,offer.id).ok);
 let o={damage:0,source:'truck',mass:20};
 assert.equal(C.record(t,offer.event==='loaded'?'delivered':'loaded',o,result).completed,false);
 if(offer.clean) { C.record(t,offer.event,{...o,damage:.05},result); assert.equal(t.current.progress,0); }
 if(offer.source) { C.record(t,offer.event,{...o,source:'intake'},result); assert.equal(t.current.progress,0); }
 if(offer.heavy) { C.record(t,offer.event,{...o,mass:19},result); assert.equal(t.current.progress,0); }
 for(let i=0;i<offer.goal;i++) { let e=C.record(t,offer.event,o,result); assert.equal(e.completed,i===offer.goal-1,offer.id); }
 assert.equal(C.settle(t,zero).bonus,offer.reward,offer.id);
}
// Goals only count events after opting in and the baseline prevents prior losses.
s=C.create(); C.enable(s,{dropped:3,ruined:2,missed:4}); C.chooseOffer(s,'local');
assert.equal(C.settle(s,{dropped:4,ruined:2,missed:4}).penalties,2);
assert.equal(s.balance,0); assert.equal(s.reputation,47);
// Career finale and ongoing free play.
s=C.create(); C.enable(s,zero);
for(let shift=0;shift<5;shift++) { C.chooseOffer(s,'local'); for(let i=0;i<4;i++) C.record(s,'delivered',order,result); C.settle(s,zero); if(shift<4) C.begin(s,zero); }
assert.equal(s.won,true); assert.equal(s.shifts,5); assert.equal(s.totalDelivered,20);
C.begin(s,zero); assert(C.chooseOffer(s,'local').ok); assert.equal(s.won,true);
for (const mutate of [x=>x.balance=-1,x=>x.upgrades.quality=4,x=>x.current.progress=12,x=>x.current.applied.logistics='1',x=>x.nextMode='unknown',x=>x.history[0].balance=-4]) {
 let bad=JSON.parse(JSON.stringify(s)); mutate(bad); assert.throws(()=>C.validate(bad));
}
console.log('✓ Карьера: заказы, режимы, экономика, репутация, улучшения, финал и свободная игра');
