import assert from 'node:assert/strict';
import {collectMemory} from '../tools/training/collect-commander-memory.mjs';
import {repeatsPending} from '../tools/training/commander-memory.mjs';
const d=await collectMemory({quick:true,seconds:60});const bareOwners=new Map(),full=new Set();
for(const split of ['train','dev','test']){
 const rows=d.data[split];assert.ok(rows.some(r=>JSON.parse(r.response).action==='none'));assert.ok(rows.some(r=>JSON.parse(r.response).action==='hold'));
 const labelsByBare=new Map();
 for(const r of rows){
  const {memory,...base}=r.input,recentOrders=memory.recent,k=JSON.stringify(base),all=JSON.stringify(r.input),proposal=JSON.parse(r.response);
  assert.ok(!bareOwners.has(k)||bareOwners.get(k)===split,'no base observation across seed splits');bareOwners.set(k,split);
  assert.ok(!full.has(all),'no duplicate inputs');full.add(all);
  assert.equal(proposal.action,repeatsPending({action:'hold',squad:0,point:0},recentOrders)?'none':'hold');
  assert.doesNotMatch(JSON.stringify(recentOrders),/(faction|enemy|orderId|squadId|target|time)/i);
  const values=labelsByBare.get(k)||new Set();values.add(proposal.action);labelsByBare.set(k,values);
 }
 assert.ok([...labelsByBare.values()].some(x=>x.size===2),'same snapshot needs history for distinct correct answers');
}
console.log('Memory data: actual queued orders, per-side history, disjoint base observations and paired before/after decisions.');
