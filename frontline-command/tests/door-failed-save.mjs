import assert from 'node:assert/strict';
import {loadConfig} from '../src/core/config.js';
import {Save} from '../src/core/save.js';
import {Game} from '../src/sim/game.js';
import {moveAlongFlow} from '../src/sim/units.js';
const storage=new Map();globalThis.localStorage={getItem:k=>storage.get(k)??null,setItem:(k,v)=>storage.set(k,v),removeItem:k=>storage.delete(k)};
for(const algSave of [false,true]){
 const cfg=await loadConfig();cfg.flags.alg_save=algSave;const opts={cfg,seed:7,aiVsAi:true};
 const g=new Game(opts),u=[...g.units.values()].find(x=>!x.isVehicle&&!x.playerControlled);
 u.goal={x:u.x+20,y:u.y};u._failedRestGoal=u.goal;u.pathFailed=true;u.arrived=false;
 assert.equal(Save.saveWar(g),true);const data=Save.loadWar(),loaded=new Game(opts);assert.equal(Save.applyWar(loaded,data),true);
 const v=loaded.unitById(u.id);assert.ok(v.pathFailed&&v.goal===v._failedRestGoal);assert.deepEqual(v.goal,u.goal);
 moveAlongFlow(loaded,v,.05);assert.ok(v.pathFailed,'evacuation is not a successful order after loading');
 v.goal={x:v.x,y:v.y};moveAlongFlow(loaded,v,.05);assert.ok(!v.pathFailed,'new order clears failure after loading');
 // Old saves and corrupt optional data must not introduce a false failure.
 const entry=data.units.find(x=>x.id===u.id);entry.failedRestGoal={x:null,y:Infinity};
 const bad=new Game(opts);assert.equal(Save.applyWar(bad,data),true);assert.ok(!bad.unitById(u.id).pathFailed);
}
console.log('failed doorway evacuation survives both save formats and accepts a new order');
