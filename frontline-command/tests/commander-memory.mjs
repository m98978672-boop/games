import assert from 'node:assert/strict';
import {loadConfig} from '../src/core/config.js';
import {Game} from '../src/sim/game.js';
import {commanderSnapshot,applyCommanderPair} from '../src/sim/neutral_commander.js';
import {inputWithMemory,recentOwnOrders,repeatsPending} from '../tools/training/commander-memory.mjs';
const cfg=await loadConfig();
for(const swapSides of [false,true]){
 const g=new Game({cfg,seed:7,aiVsAi:true,swapSides});g.api.orders=[];
 const pair=[commanderSnapshot(g,0),commanderSnapshot(g,1)],hold={action:'hold',squad:0,point:0};
 assert.deepEqual(recentOwnOrders(g,pair[0]),[]);
 assert.equal(applyCommanderPair(g,pair,[JSON.stringify(hold),JSON.stringify(hold)]).ok,true);
 let s=[commanderSnapshot(g,0),commanderSnapshot(g,1)],left=inputWithMemory(g,s[0]),right=inputWithMemory(g,s[1]);
 for(const item of [left,right]){
  assert.equal(item.memory.recent.length,1);assert.deepEqual(item.memory.recent[0],{action:'hold',squad:0,status:'queued',age:0,point:0});
  assert.ok(repeatsPending(hold,item.memory.recent));assert.doesNotMatch(JSON.stringify(item.memory.recent),/(faction|enemy|orderId|squadId|target|time)/i);
 }
 // Mutating the enemy's order and snapshots must not change our memory.
 const before=JSON.stringify(left);const enemy=g.api.orders.find(o=>o.faction===1);enemy.status='refused';enemy.result='secret enemy details';
 assert.equal(JSON.stringify(inputWithMemory(g,commanderSnapshot(g,0))),before);
 assert.notDeepEqual(recentOwnOrders(g,commanderSnapshot(g,1)),left.memory.recent);
 // Remapping is by internal identity, never by remembered array position.
 const sq1=s[0].squads[0],sq2=s[0].squads[1];
 if(sq2){const reordered={...s[0],squads:[sq2,sq1,...s[0].squads.slice(2)],input:{...s[0].input,squads:[s[0].input.squads[1],s[0].input.squads[0],...s[0].input.squads.slice(2)]}};
  assert.equal(recentOwnOrders(g,reordered)[0].squad,1);
 }
 // Refusal text, raw IDs and external/player orders are not exposed.
 const own=g.api.orders.find(o=>o.faction===0);own.status='refused';own.result='secret raw text';
 assert.equal(recentOwnOrders(g,commanderSnapshot(g,0))[0].status,'refused');
 assert.equal(repeatsPending(hold,recentOwnOrders(g,commanderSnapshot(g,0))),false);
 g.api.issue({source:'player',type:'hold',faction:0,squadIds:[own.squadIds[0]],target:own.target});
 assert.equal(recentOwnOrders(g,commanderSnapshot(g,0)).length,1);
 // Expiry and a fresh game do not carry facts over into the next match.
 g.time=121;assert.deepEqual(recentOwnOrders(g,commanderSnapshot(g,0)),[]);
 const fresh=new Game({cfg,seed:7,aiVsAi:true,swapSides});assert.deepEqual(recentOwnOrders(fresh,commanderSnapshot(fresh,0)),[]);
}
{
 const g=new Game({cfg,seed:11,aiVsAi:true});g.api.orders=[];const s=commanderSnapshot(g,0);
 for(let i=0;i<7;i++){g.time=i;g.api.issue({source:'neutralAI',type:'hold',faction:0,squadIds:[s.squads[0].id],target:{pointId:s.points[0]}});}
 const m=recentOwnOrders(g,commanderSnapshot(g,0));assert.equal(m.length,3);assert.ok(m.every(x=>x.squad===0&&x.action==='hold'));
 const a=inputWithMemory(g,commanderSnapshot(g,0));a.squads[0].ammo=-999;a.memory.recent[0].action='mutated';
 const b=inputWithMemory(g,commanderSnapshot(g,0));assert.notEqual(b.squads[0].ammo,-999);assert.equal(b.memory.recent[0].action,'hold');
}
assert.throws(()=>recentOwnOrders(new Game({cfg,seed:1,aiVsAi:false}),{faction:0}),/invalid/);
console.log('Commander working-memory: real own orders only, faction isolation, remapping, bounded history, expiration, no free text, pending-order safety and match reset.');
