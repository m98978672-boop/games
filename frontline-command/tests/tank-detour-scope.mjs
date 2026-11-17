import assert from 'node:assert/strict';import {loadConfig} from '../src/core/config.js';import {Game} from '../src/sim/game.js';import {moveUnit} from '../src/sim/units.js';
const cfg=await loadConfig();assert.equal(cfg.flag('tank_detour_v1',false),false,'new mode starts default off pending acceptance');
for(const faction of [0,1])for(const role of ['tank','truck','infantry'])for(const scenario of ['enabled','off','combat','player','forward','no-field','inside','walls-off','pathing-off']) {
 const c=await loadConfig();c.flags.tank_detour_v1=scenario!=='off';c.flags.vehicle_detour_v2=false;
 const g=new Game({cfg:c,seed:5,aiVsAi:true});g.units.clear();g.unitGrid.clear();const u=g.spawnUnit(faction,role,1000,1000);
 u.goal={x:faction?600:1400,y:1000};u.stuck=1;u.perception.hasContact=scenario==='combat';u.playerControlled=scenario==='player';
 const toward=faction?-1:1;
 g.world={W:4096,H:4096,speedAt:()=>1,isBaseWalkable:()=>true,isWalkable:()=>true};
 g.walls={enabled:()=>scenario!=='walls-off',doorWaypoint:()=>null,doorsForUnit:()=>{},blocksMove:()=>false,buildingAtPoint:()=>scenario==='inside'?{}:null};
 if(scenario==='pathing-off')c.flags.pathing_v2=false;
 g.nav={field:()=>scenario==='no-field'?null:{dist:[0]},idxOf:()=>0,step:()=>scenario==='no-field'?null:{dx:scenario==='forward'?toward:-toward,dy:0}};
 const x=u.x,y=u.y;moveUnit(g,u,toward,0,.05);
 assert.equal(!!u.detour,role==='tank'&&scenario==='enabled',`${faction} ${role} ${scenario}`);
 assert.ok(Math.hypot(u.x-x,u.y-y)<=u.speed*.05*1.5+1e-9);
}
console.log('tank detour: both factions; no truck, infantry, player, combat, indoor, wall-off or unsuitable-field activation');
