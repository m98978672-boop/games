// Paired externally between revisions: isolated combat AI on real game terrain.
import {loadConfig} from '../src/core/config.js';
import {Game} from '../src/sim/game.js';
const cfg0=await loadConfig(),map=new Game({cfg:cfg0,seed:7,aiVsAi:true});
const w=map.world, walls=map.walls;
function walk(x,y){return w.isBaseWalkable(x,y)&&[[-9,-9],[9,-9],[-9,9],[9,9]].every(([dx,dy])=>w.isBaseWalkable(x+dx,y+dy))&&
 !walls.blocksMove(x,y,9,null)&&!walls.buildingAtPoint(x,y);}
const candidates=[];
for(let y=300;y<w.H-300;y+=64)for(let x=300;x<w.W-300;x+=64)for(let k=0;k<8;k++){
 const dx=Math.cos(k*Math.PI/4),dy=Math.sin(k*Math.PI/4),tx=x+500*dx,ty=y+500*dy,gx=x+375*dx,gy=y+375*dy;
 if(!walk(x,y)||!walk(tx,ty)||!walk(gx,gy)||!w.hasLOS(x,y,tx,ty,true))continue;
 let obstacle=false;for(let i=1;i<=12;i++)if(!walk(x+dx*i*8,y+dy*i*8)){obstacle=true;break;}
 if(obstacle)candidates.push({x,y,tx,ty});
}
const n=80,stride=Math.max(1,Math.floor(candidates.length/n)),spots=candidates.filter((_,i)=>i%stride===0).slice(0,n);
const results=[];
for(const spot of spots)for(const faction of [0,1]){
 const cfg=await loadConfig();cfg.flags.assault_forts=false;const g=new Game({cfg,seed:7,aiVsAi:true});
 g.units.clear();g.unitGrid.clear();g.occupancyGrid.clear();g.squads.clear();
 for(const sys of [g.squadAI,...g.strategic,g.autopilot,g.rules,g.logistics,g.build,g.influence,g.api])sys.update=()=>{};g.checkVictory=()=>{};
 const start=faction?{x:spot.tx,y:spot.ty}:{x:spot.x,y:spot.y};
 const end=faction?{x:spot.x,y:spot.y}:{x:spot.tx,y:spot.ty};
 const u=g.spawnUnit(faction,'infantry',start.x,start.y),e=g.spawnUnit(1-faction,'infantry',end.x,end.y,{player:true});
 u.vision=650;u.thinkTimer=0;e.playerControlled=true;e.hp=e.maxHp=1000000;
 let route=false,search=false,cross=false;const los=g.world.hasLOS(u.x,u.y,e.x,e.y,true);
 const startValid=g.world.isBaseWalkable(u.x,u.y)&&g.world.isBaseWalkable(e.x,e.y)&&!g.walls.buildingAtPoint(u.x,u.y)&&!g.walls.buildingAtPoint(e.x,e.y);
 for(let i=0;i<1200;i++){
  const a=u.x,b=u.y;g.step(.05);const step=Math.hypot(u.x-a,u.y-b);route ||= !!u._smartRoute;search ||= g._smartRouteState?.active?.unit===u;
  for(let j=1;j<=Math.ceil(step);j++){
   const px=a+(u.x-a)*j/Math.ceil(step),py=b+(u.y-b)*j/Math.ceil(step);
   if(!g.world.isBaseWalkable(px,py)||g.walls.blocksMove(px,py,u.radius,u))cross=true;
  }
  if(Math.hypot(u.x-e.x,u.y-e.y)<u.weapon.range*.72)break;
 }
 results.push({...spot,faction,startValid,los,dist:Math.hypot(u.x-e.x,u.y-e.y),close:Math.hypot(u.x-e.x,u.y-e.y)<u.weapon.range*.72,route,search,cross,seconds:g.time,shots:u.shotsFired||0});
}
console.log(JSON.stringify({kind:'real_map_isolated_combat_probe',candidates:candidates.length,selected:spots.length,results,
 caveats:['Real map and walls, fixed invulnerable enemy, extended vision, disabled other systems',
 'Candidate positions selected systematically on one map, not full battles or independent random samples',
 'Reverse directions are not guaranteed to have the same LOS; no guarantee that every route exists for this planner']},null,2));
