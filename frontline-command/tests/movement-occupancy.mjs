import assert from 'node:assert/strict';
import {loadConfig} from '../src/core/config.js';
import {Game} from '../src/sim/game.js';
import {moveUnit} from '../src/sim/units.js';
const cfg=await loadConfig();
assert.equal(cfg.flag('movement_occupancy_v1',false),false,'experimental and off until accepted');
cfg.flags.movement_occupancy_v1=true;
function fixture(){
 const g=new Game({cfg,seed:7,aiVsAi:true});g.units.clear();g.unitGrid.clear();g.occupancyGrid.clear();
 g.walls.enabled=()=>false;g.walls.doorWaypoint=()=>null;g.walls.doorsForUnit=()=>{};
 g.world.isWalkable=()=>true;g.world.speedAt=()=>1;return g;
}
function trace(g,u,dx,dy,dt,others){
 const x=u.x,y=u.y;moveUnit(g,u,dx,dy,dt);
 for(const o of others){
  const vx=u.x-x,vy=u.y-y,den=vx*vx+vy*vy,ox=x-o.x,oy=y-o.y,r=u.radius+o.radius;
  const t=den?Math.max(0,Math.min(1,-(ox*vx+oy*vy)/den)):0;
  assert.ok(Math.hypot(ox+vx*t,oy+vy*t)>=r-1e-7,`swept collision ${u.id} and ${o.id}`);
 }
 assert.ok(Math.abs(u.vx*dt-(u.x-x))<1e-9&&Math.abs(u.vy*dt-(u.y-y))<1e-9);
 assert.equal(g.occupancyGrid.cellOf.get(u),g.occupancyGrid.key(u.x,u.y));
}
for(const faction of [0,1]){
 let g=fixture(),a=g.spawnUnit(faction,'infantry',1000,1000),b=g.spawnUnit(1-faction,'infantry',1030,1000);
 a.speed=600;trace(g,a,1,0,.1,[b]);assert.ok(a.x<1030||Math.abs(a.y-1000)>=18,'cannot tunnel through body');
 // Reversing the approach gives the same safety rule for either faction.
 trace(g,b,-1,0,.1,[a]);
 // Live index must follow a unit that crosses a hash boundary in the same tick.
 g=fixture();a=g.spawnUnit(faction,'infantry',100,1000);b=g.spawnUnit(faction,'infantry',180,1000);
 a.speed=400;trace(g,a,1,0,.1,[b]);assert.equal(g.occupancyGrid.key(a.x,a.y),g.occupancyGrid.key(140,1000));
 trace(g,b,-1,0,.1,[a]);
 // Two moving against each other on open ground eventually pass without overlap.
 g=fixture();a=g.spawnUnit(faction,'infantry',1000,1000);b=g.spawnUnit(1-faction,'infantry',1100,1000);
 a.speed=b.speed=55;
 for(let i=0;i<80;i++){trace(g,a,1,0,.1,[b]);trace(g,b,-1,0,.1,[a]);}
 assert.ok(a.x>b.x,'opposing units negotiate passage on open ground');
 // A bottleneck occupied by an idle body forces a safe wait; once cleared the
 // same unit may continue. No implicit teleport or false claim of arrival.
 g=fixture();g.world.isWalkable=(x,y)=>y>=991&&y<=1009;
 a=g.spawnUnit(faction,'infantry',1000,1000);b=g.spawnUnit(faction,'infantry',1024,1000);a.speed=55;
 for(let i=0;i<20;i++)trace(g,a,1,0,.1,[b]);
 assert.ok(a.x<1006.1,'wait before the blocked point');
 b.y=1050;g.occupancyGrid.update(b);for(let i=0;i<15;i++)trace(g,a,1,0,.1,[b]);
 assert.ok(a.x>1024,'proceeds after point becomes free');
 // Multiple followers queue without sharing an occupied circle and resume
 // after the bottleneck occupant moves away.
 g=fixture();g.world.isWalkable=(x,y)=>y>=991&&y<=1009;
 const back=g.spawnUnit(faction,'infantry',1000,1000),front=g.spawnUnit(faction,'infantry',1024,1000),stop=g.spawnUnit(faction,'infantry',1048,1000);
 back.speed=front.speed=55;
 for(let i=0;i<20;i++){trace(g,front,1,0,.1,[back,stop]);trace(g,back,1,0,.1,[front,stop]);}
 assert.ok(front.x<1030.1&&back.x<front.x-17.99,'two followers wait in a queue');
 stop.y=1050;g.occupancyGrid.update(stop);
 for(let i=0;i<30;i++){trace(g,front,1,0,.1,[back,stop]);trace(g,back,1,0,.1,[front,stop]);}
 assert.ok(back.x>1024&&front.x>1048,'both followers resume after release');
 // Legacy overlapping spawn: outward motion is allowed, deeper motion rejected.
 g=fixture();a=g.spawnUnit(faction,'infantry',1000,1000);b=g.spawnUnit(faction,'infantry',1010,1000);a.speed=10;
 const old=Math.hypot(a.x-b.x,a.y-b.y);moveUnit(g,a,-1,0,.1);assert.ok(Math.hypot(a.x-b.x,a.y-b.y)>old);
}
console.log('movement occupancy: swept collisions, live index, opposite passage, wait/release, vectors and overlap recovery');
