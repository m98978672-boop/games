import assert from 'node:assert/strict';
import {exchangeCrowdSlots} from '../src/sim/crowd_nav.js';
function setup() {
 const flags={crowd_slot_exchange_v1:true};
 const goal={x:100,y:100};
 const mk=(id,x,y,slot)=>({id,x,y,radius:5,alive:true,downed:false,faction:0,goal:{...goal},_crowdGroupGoal:{...goal},_crowdActive:true,_crowdAssigned:slot,_crowdPoint:slot,arrived:false,perception:{hasContact:false}});
 const a=mk(1,80,90,{x:120,y:90}),b=mk(2,120,110,{x:80,y:110});
 const units=new Map([[1,a],[2,b]]);
 const game={cfg:{flag:(id,d)=>flags[id]??d},units,unitGrid:{query:()=>[...units.values()]},world:{W:1000,H:1000,isBaseWalkable:()=>true},walls:{enabled:()=>true,blocksMove:()=>false,blocksMoveSweep:()=>false}};
 return {game,a,b,flags,units};
}
{
 const {game,a,b}=setup(),pa=a._crowdAssigned,pb=b._crowdAssigned;
 a._crowdDetour=a.detour={x:0,y:0};b._crowdDetour=b.detour={x:0,y:0};
 assert.equal(exchangeCrowdSlots(game,a),true);assert.equal(a._crowdAssigned,pb);assert.equal(b._crowdAssigned,pa);
 assert.equal(a.detour,null);assert.equal(b.detour,null);assert.equal(exchangeCrowdSlots(game,a),false,'no oscillation');
}
for(const obstacle of ['arrived','contact','otherGoal','wall','unit','disabled','noBenefit']) {
 const {game,a,b,flags,units}=setup();
 if(obstacle==='arrived')b.arrived=true;
 if(obstacle==='contact')b.perception.hasContact=true;
 if(obstacle==='otherGoal')b.goal={x:300,y:300};
 if(obstacle==='wall')game.walls.blocksMoveSweep=()=>true;
 if(obstacle==='unit')units.set(3,{id:3,x:80,y:100,radius:5,alive:true,downed:false});
 if(obstacle==='disabled')flags.crowd_slot_exchange_v1=false;
 if(obstacle==='noBenefit'){const tmp=a._crowdAssigned;a._crowdAssigned=b._crowdAssigned;b._crowdAssigned=tmp;}
 const oldA=a._crowdAssigned,oldB=b._crowdAssigned;
 assert.equal(exchangeCrowdSlots(game,a),false,obstacle);assert.equal(a._crowdAssigned,oldA);assert.equal(b._crowdAssigned,oldB);
}
console.log('crowd slot exchange: cost, no oscillation, live obstacle, wall, goal and off guard passed');
