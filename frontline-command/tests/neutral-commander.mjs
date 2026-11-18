import assert from 'node:assert/strict';import {loadConfig} from '../src/core/config.js';import {Game} from '../src/sim/game.js';import {commanderSnapshot,validateProposal,applyCommanderPair} from '../src/sim/neutral_commander.js';import {NeutralCommanderClient} from '../src/sim/neutral_commander_client.js';
const cfg=await loadConfig();
for(const swapSides of [false,true]){
 const g=new Game({cfg,seed:7,aiVsAi:true,swapSides});g.api.orders=[];
 const a=commanderSnapshot(g,0),b=commanderSnapshot(g,1);
 for(const s of [a,b]){const json=JSON.stringify(s.input);assert.doesNotMatch(json,/(faction|ally|legion|enemy|time|pointId|squadId|war|history)/i);assert.ok(s.input.squads.length&&s.input.points.length);}
 for(const u of g.units.values())if(u.faction===1){u.reserve=0;u.hp=1;u.morale=1;}
 assert.deepEqual(commanderSnapshot(g,0).input,a.input,'opposite unit state must not leak');
 assert.equal(validateProposal('{"action":"hold","squad":0,"point":0,"faction":1}',a),null);
 assert.equal(validateProposal('{"action":"hold","squad":999,"point":0}',a),null);
 assert.equal(validateProposal('{"action":"supply","squad":0}',a),null,'no needless resupply');
 const snapshots=[commanderSnapshot(g,0),commanderSnapshot(g,1)],hold='{"action":"hold","squad":0,"point":0}';
 assert.equal(applyCommanderPair(g,snapshots,[hold,'invalid']).ok,false);assert.equal(g.api.orders.length,0,'no half-pair on malformed output');
 assert.equal(applyCommanderPair(g,snapshots,[hold,'{"action":"none"}']).reason,'unpaired');assert.equal(g.api.orders.length,0,'no one-sided help');
 assert.equal(applyCommanderPair(g,snapshots,[hold,hold]).ok,true);
 assert.deepEqual(g.api.orders.map(o=>o.faction).sort(),[0,1]);
 for(let i=0;i<200;i++)g.step(.1);
 const orders=g.api.orders.filter(o=>o.source==='neutralAI');assert.equal(orders.length,2);assert.ok(orders.every(o=>o.status==='accepted'),'actual radio delivery for both sides');
 const stale=[commanderSnapshot(g,0),commanderSnapshot(g,1)];g.time+=46;const n=g.api.orders.length;
 assert.equal(applyCommanderPair(g,stale,[hold,hold]).reason,'stale');assert.equal(g.api.orders.length,n);
}
{
 const g=new Game({cfg,seed:7,aiVsAi:true});g.api.orders=[];let w;const statuses=[];
 const client=new NeutralCommanderClient(g,{workerFactory:()=>w={postMessage(m){this.sent=(this.sent||[]).concat([m]);},terminate(){this.terminated=true;}},onStatus:t=>statuses.push(t)});
 client.start();assert.equal(w.sent[0].type,'init');w.onmessage({data:{type:'ready'}});client.tick();assert.equal(w.sent[1].type,'pair');assert.deepEqual(Object.keys(w.sent[1].inputs[0]).sort(),['builds','points','squads']);
 assert.equal(w.sent[1].first,0);w.onmessage({data:{type:'result',id:99,texts:['{}','{}']}});assert.ok(client.pending,'ignore old response');
 const hold='{"action":"hold","squad":0,"point":0}';w.onmessage({data:{type:'result',id:1,texts:[hold,hold]}});assert.equal(g.api.orders.filter(o=>o.source==='neutralAI').length,2);
 g.time=26;client.tick();assert.equal(w.sent[2].first,1,'inference priority alternates');
 w.onmessage({data:{type:'error'}});assert.equal(client.state,'failed');assert.equal(w.terminated,true);assert.ok(statuses.at(-1).includes('Обе стороны'));const count=g.api.orders.length;
 w.onmessage({data:{type:'result',id:2,texts:[hold,hold]}});assert.equal(g.api.orders.length,count,'late result after failure ignored');client.stop();
}
// Valid build and supply proposals can coexist, but both still pass the same pair gate.
{
 const g=new Game({cfg,seed:7,aiVsAi:true});g.api.orders=[];
 let bp=null;const h=g.world.homeHQ(0);
 for(let r=150;r<900&&!bp;r+=40)for(let i=0;i<20&&!bp;i++){const a=i*Math.PI/10,x=h.x+r*Math.cos(a),y=h.y+r*Math.sin(a);if(g.build.validate('sandbags',x,y,0,{ignoreCost:true}).ok){const p=g.build.place('sandbags',x,y,0,{free:true});if(p.ok)bp=p.building;}}
 assert.ok(bp);let s=[commanderSnapshot(g,0),commanderSnapshot(g,1)];const engineer=s[0].input.squads.findIndex(q=>q.engineers>0);assert.ok(engineer>=0);
 const sq=g.squads.get(s[1].squads[0].id);for(const u of sq.units()){u.mag=0;u.reserve=0;}
 s=[commanderSnapshot(g,0),commanderSnapshot(g,1)];
 const build=JSON.stringify({action:'build',squad:engineer,build:0}),supply=JSON.stringify({action:'supply',squad:0});
 assert.equal(applyCommanderPair(g,s,[build,supply]).ok,true);
 for(let i=0;i<200;i++)g.step(.1);
 const orders=g.api.orders.filter(o=>o.source==='neutralAI');assert.equal(orders.length,2);assert.ok(orders.every(o=>o.status==='accepted'));
 assert.equal(orders.find(o=>o.type==='build').params.blueprintId,bp.id);
}
assert.throws(()=>commanderSnapshot(new Game({cfg,seed:7,aiVsAi:false}),0),/demo only/);
console.log('neutral commander: isolated inputs, strict paired validation, real radio delivery, build/supply, stale/failure handling, swapped sides');
