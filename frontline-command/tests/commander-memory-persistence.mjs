import assert from 'node:assert/strict';
import {loadConfig} from '../src/core/config.js';
import {Game} from '../src/sim/game.js';
import {commanderSnapshot,applyCommanderPair} from '../src/sim/neutral_commander.js';
import {CommanderMemory} from '../src/sim/commander_memory.js';
import {NeutralCommanderClient} from '../src/sim/neutral_commander_client.js';
const cfg=await loadConfig();
class Storage {
 constructor(){this.map=new Map();}
 getItem(k){return this.map.get(k)??null;}
 setItem(k,v){this.map.set(k,String(v));}
}
const storage=new Storage(),g=new Game({cfg,seed:7,aiVsAi:true});g.api.orders=[];
const m=new CommanderMemory(g,{storage}),snap=[commanderSnapshot(g,0),commanderSnapshot(g,1)],hold=JSON.stringify({action:'hold',squad:0,point:0});
assert.equal(applyCommanderPair(g,snap,[hold,hold]).ok,true);
const orders=g.api.orders.filter(o=>o.source==='neutralAI');assert.equal(orders.length,2);
m.recordIssued(snap,orders);assert.equal(storage.map.size,0,'queued orders are not falsely counted as accepted');
const queued=m.input(commanderSnapshot(g,0)).memory.recent;assert.equal(queued[0].status,'queued');
const enemy=orders.find(o=>o.faction===1);assert.equal(g.api.cancel(enemy.id,'system'),true);
for(let i=0;i<200;i++)g.step(.1);m.poll();m.poll();
const own=orders.find(o=>o.faction===0);assert.equal(own.status,'accepted');assert.equal(enemy.status,'cancelled');
const d0=JSON.parse(storage.getItem('frontline.neural-memory.v1.side-0')),d1=JSON.parse(storage.getItem('frontline.neural-memory.v1.side-1'));
assert.equal(d0.entries.length,1);assert.equal(d0.entries[0].accepted,1);assert.equal(d0.entries[0].cancelled,0);
assert.equal(d1.entries.length,1);assert.equal(d1.entries[0].cancelled,1);assert.equal(d1.entries[0].accepted,0);
assert.doesNotMatch(JSON.stringify([d0,d1]),/(enemy|faction|squadId|pointId|orderId|reason|coords|target)/i);
const fresh=new Game({cfg,seed:7,aiVsAi:true}),reloaded=new CommanderMemory(fresh,{storage});
const a=reloaded.input(commanderSnapshot(fresh,0)),b=reloaded.input(commanderSnapshot(fresh,1));
assert.deepEqual(a.memory.recent,[],'short-term history does not leak to the next match');
assert.equal(a.memory.experience[0].accepted,1,'long-term side 0 persisted');assert.equal(b.memory.experience[0].cancelled,1,'long-term side 1 persisted independently');
assert.equal(a.memory.experience[0].cancelled,0);assert.equal(b.memory.experience[0].accepted,0);
const copy=JSON.stringify(b);a.memory.experience[0].accepted=9999;assert.equal(JSON.stringify(reloaded.input(commanderSnapshot(fresh,1))),copy,'no cross-side shared object');
const evil=new Storage();evil.setItem('frontline.neural-memory.v1.side-0','{"version":1,"entries":[{"action":"<script>","accepted":999999999}]}');
assert.deepEqual(new CommanderMemory(fresh,{storage:evil}).input(commanderSnapshot(fresh,0)).memory.experience,[],'corrupt storage is ignored');
const denied={getItem(){throw Error('denied');},setItem(){throw Error('denied');}};
assert.equal(new CommanderMemory(fresh,{storage:denied}).persistent,false,'blocked storage falls back to session memory');
const writeDenied={getItem(){return null;},setItem(){throw Error('full');}};
const local=new CommanderMemory(g,{storage:writeDenied});local.recordIssued(snap,[own]);
assert.equal(local.persistent,false,'write failure switches to session-only memory');
assert.equal(local.input(snap[0]).memory.experience[0].accepted,1,'working memory survives a storage failure');
const compact=new Storage();compact.setItem('frontline.neural-memory.v1.side-0',JSON.stringify({version:1,entries:[{action:'hold',ammo:own&&snap[0].input.squads[0].ammo<30?'low':snap[0].input.squads[0].ammo<70?'medium':'high',engineer:snap[0].input.squads[0].engineers>0,accepted:256,refused:0,cancelled:0}]}));
const decay=new CommanderMemory(g,{storage:compact});decay.recordIssued(snap,[own]);
assert.equal(JSON.parse(compact.getItem('frontline.neural-memory.v1.side-0')).entries[0].accepted,129,'old totals are compacted before adding new evidence');
let w;const clientGame=new Game({cfg,seed:8,aiVsAi:true});clientGame.api.orders=[];
const client=new NeutralCommanderClient(clientGame,{memoryStorage:storage,workerFactory:()=>w={postMessage(x){this.sent=(this.sent||[]).concat([x]);},terminate(){}}});
client.start();w.onmessage({data:{type:'ready'}});client.tick();
const first=w.sent.find(x=>x.type==='pair');assert.ok(first);assert.deepEqual(Object.keys(first.inputs[0]).sort(),['builds','memory','points','squads']);
assert.ok(first.inputs.every(x=>x.memory&&Array.isArray(x.memory.recent)&&Array.isArray(x.memory.experience)));
w.onmessage({data:{type:'result',id:first.id,texts:[hold,hold]}});
for(let i=0;i<200;i++)clientGame.step(.1);client.tick();
assert.ok(storage.getItem('frontline.neural-memory.v1.side-0'));assert.ok(storage.getItem('frontline.neural-memory.v1.side-1'));
clientGame.time=client.nextAt;client.tick();const second=w.sent.filter(x=>x.type==='pair')[1];assert.ok(second.inputs.every(x=>x.memory.recent.length>0));
client.stop();assert.equal(client.state,'stopped');
console.log('Commander memory: actual paired orders, durable per-faction compressed outcomes, no enemy leakage, short-history reset and blocked/corrupt storage fallback.');
