// Paired single-tick vehicle LOS diagnostic, not a balance or full-war test.
import { loadConfig } from '../src/core/config.js';
import { Game } from '../src/sim/game.js';
import { updateSoldier } from '../src/sim/ai_soldier.js';
const seeds=20,kinds=['hidden_memory','hidden_stale_contact','hidden_think','visible'];
async function run(seed,faction,kind,on){
  const cfg=await loadConfig();cfg.flags.vehicle_visible_fire_v1=on;cfg.flags.bot_surround_vision_v1=false;cfg.flags.assault_forts=false;
  const g=new Game({cfg,seed,aiVsAi:true});g.units.clear();g.unitGrid.clear();g.dt=.05;
  let x=2000,y=2000,tx=2100,ty=2000;
  if(kind!=='visible'){
    const b=g.world.buildings.find(b=>b.type==='hq'&&g.walls.state(b)),s=g.walls.state(b).outline.segments.find(s=>s.length>=80&&s.blocksVision);
    const [[a,b0],[c,d]]=s.points,len=Math.hypot(c-a,d-b0),nx=-(d-b0)/len,ny=(c-a)/len,mx=b.x+(a+c)/2,my=b.y+(b0+d)/2;
    x=mx+nx*35;y=my+ny*35;tx=mx-nx*35;ty=my-ny*35;
    if(g.world.hasLOS(x,y,tx,ty,true))throw Error('wall must block LOS');
  }else{g.world.hasLOS=()=>true;g.walls.enabled=()=>false;}
  const u=g.spawnUnit(faction,'tank',x,y),e=g.spawnUnit(1-faction,'infantry',tx,ty);
  u.targetId=e.id;u.perception.memory=4;u.perception.hasContact=['visible','hidden_stale_contact'].includes(kind);
  u.perception.enemies=u.perception.hasContact?[e]:[];u.thinkTimer=kind==='hidden_think'?0:100;
  u.facing=Math.atan2(ty-y,tx-x);u.aimAngle=u.turretAngle=u.facing;
  const before=u.mag;updateSoldier(g,u,.05);
  return {shots:before-u.mag,contact:u.perception.hasContact,targetRemembered:u.targetId===e.id};
}
const pairs=[];
for(const kind of kinds)for(let faction=0;faction<2;faction++)for(let seed=1;seed<=seeds;seed++){
  const off=await run(seed,faction,kind,false),on=await run(seed,faction,kind,true);pairs.push({kind,seed,faction,off,on});
}
const summary=kinds.map(kind=>{const a=pairs.filter(p=>p.kind===kind);return {kind,pairs:a.length,offShots:a.reduce((n,p)=>n+p.off.shots,0),onShots:a.reduce((n,p)=>n+p.on.shots,0)};});
const expected=summary.every(x=>x.offShots===40&&x.onShots===(x.kind==='visible'?40:0));
console.log(JSON.stringify({expected,kind:'vehicle_visible_target_paired_diagnostic',seeds,summary,pairs,
  caveats:['One tick, isolated tank and infantry, both factions','Actual HQ wall for hidden cases; open case uses synthetic LOS','No group combat, win rate, long battles, browser performance, or save/load','Runtime LOS checks add potential cost','Combat change is default off']},null,2));
if(!expected)process.exitCode=1;
