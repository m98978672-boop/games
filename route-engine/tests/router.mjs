import assert from 'node:assert/strict';
import { createSnapshot, beginSearch } from '../src/router.mjs';
const edge = (id, from, to, cost, portal) => ({id,from,to,cost,portal});
const portal = (state='closed', width=4, openable=true, kind='door') => ({id:'door-1',kind,state,width,openable,openCost:2});
const solve = (snap, opts, budget=2) => {
  const search=beginSearch(snap,opts); let r;
  do { r=search.step(budget); } while(r.status==='running');
  return r;
};
const nodes=['a','b','c','d'];
const edges=[edge('ab','a','b',1,portal()),edge('bd','b','d',1),edge('ac','a','c',3),edge('cd','c','d',3)];
const snapshot=createSnapshot({nodes,edges,revision:'1'});
let r=solve(snapshot,{from:'a',to:'d',radius:1});
assert.deepEqual(r.nodes,['a','b','d']); assert.equal(r.cost,4);
assert.deepEqual(r.actions,[{edgeId:'ab',portalId:'door-1',kind:'door',action:'open-and-cross'}]);
assert.deepEqual(solve(snapshot,{from:'a',to:'d',radius:3}).nodes,['a','c','d']);
assert.deepEqual(solve(snapshot,{from:'a',to:'d',vehicle:true}).nodes,['a','c','d']);
const gate=createSnapshot({nodes:['a','b'],edges:[edge('ab','a','b',2,portal('open',4,true,'gate'))],revision:'1'});
assert.equal(solve(gate,{from:'a',to:'b',vehicle:true,radius:1.9}).actions[0].action,'cross');
assert.equal(solve(gate,{from:'a',to:'b',radius:2}).status,'unreachable');
for (const p of [portal('blocked'),portal('closed',4,false)]) {
  assert.equal(solve(createSnapshot({nodes:['a','b'],edges:[edge('ab','a','b',1,p)],revision:'1'}),{from:'a',to:'b'}).status,'unreachable');
}
assert.deepEqual(solve(snapshot,{from:'a',to:'a'}).nodes,['a']);
let rev='1'; const search=beginSearch(snapshot,{from:'a',to:'d',hostRevision:()=>rev});
assert.equal(search.step(1).status,'running'); rev='2'; assert.equal(search.step(1).status,'stale');
const cancelled=beginSearch(snapshot,{from:'a',to:'d'}); assert.equal(cancelled.cancel().status,'cancelled'); assert.equal(cancelled.step(1).status,'cancelled');
edges[0].cost=100; edges[0].portal.state='blocked'; nodes.push('evil');
assert.equal(solve(snapshot,{from:'a',to:'d'}).cost,4); assert.equal(snapshot.hasNode('evil'),false);
assert.throws(()=>snapshot.edgesFrom('a').push({}),TypeError);
assert.throws(()=>createSnapshot({nodes:['a','a'],edges:[],revision:'1'}));
assert.throws(()=>createSnapshot({nodes:['a','b'],edges:[edge('ab','a','b',-1)],revision:'1'}));
assert.throws(()=>createSnapshot({nodes:['a','b'],edges:[edge('ab','a','b',1,portal('closed',NaN))],revision:'1'}));
assert.throws(()=>beginSearch(snapshot,{from:'missing',to:'a'}));
assert.throws(()=>beginSearch(snapshot,{from:'a',to:'b',radius:Infinity}));
assert.throws(()=>beginSearch(snapshot,{from:'a',to:'b'}).step(0));
// A high-degree node cannot consume its whole adjacency list in one step.
const manyNodes=['s',...Array.from({length:200},(_,i)=>`n${i}`)];
const manyEdges=manyNodes.slice(1).map((n,i)=>edge(`e${i}`,'s',n,1));
const many=beginSearch(createSnapshot({nodes:manyNodes,edges:manyEdges,revision:'1'}),{from:'s',to:'n199'});
assert.equal(many.step(1).status,'running');
for(let i=0;i<100;i++) { const part=many.step(1); assert.equal(part.status,'running'); assert.equal(part.used,1); }
let seed=314159; const rnd=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/2**32;};
for(let trial=0;trial<100;trial++) {
  const n=12, ns=Array.from({length:n},(_,i)=>String(i)), es=[], d=ns.map((_,i)=>ns.map((_,j)=>i===j?0:Infinity));
  for(let i=0;i<n;i++) for(let j=0;j<n;j++) if(i!==j && rnd()<.18) {
    const cost=1+Math.floor(rnd()*9); es.push(edge(`${i}-${j}`,String(i),String(j),cost)); d[i][j]=cost;
  }
  for(let k=0;k<n;k++) for(let i=0;i<n;i++) for(let j=0;j<n;j++) d[i][j]=Math.min(d[i][j],d[i][k]+d[k][j]);
  const snap=createSnapshot({nodes:ns,edges:es,revision:'test'});
  for(let i=0;i<n;i++) {
    const result=solve(snap,{from:String(i),to:'11'},1);
    if(Number.isFinite(d[i][11])) assert.equal(result.cost,d[i][11]); else assert.equal(result.status,'unreachable');
  }
}
console.log('route engine: directed optimal paths, door actions, snapshots, cancellation, sliced search and 1200 graph comparisons passed');
