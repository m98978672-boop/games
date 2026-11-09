// Диагностика исходного состояния, не меняет поведение игры. Вывод: JSONL.
import { loadConfig } from '../src/core/config.js';
import { Game } from '../src/sim/game.js';
import { Walls } from '../src/sim/walls.js';
const distance = (x,y,a,b) => Math.hypot(x-a,y-b);
const seed = process.argv[2] === undefined ? 5 : Number(process.argv[2]);
if (!Number.isInteger(seed) || seed < 0 || seed > 0xffffffff) throw new Error('seed должен быть целым числом 0…4294967295');
const vehicleDetour = process.argv.includes('--vehicle-detour');
const wallNavLocal = process.argv.includes('--wall-nav-local');
function location(g,u) {
  if (u.goal && distance(u.x,u.y,u.goal.x,u.goal.y) < 70) return 'у цели';
  let wall=Infinity, door=Infinity, corner=Infinity;
  for (const r of g.walls.refsNear(u.x,u.y,100)) {
    const d = Walls.distPointSegment(u.x,u.y,r.x1,r.y1,r.x2,r.y2).d;
    if (r.kind==='opening' && ['door','gate'].includes(r.opening.type)) door=Math.min(door,d);
    if (r.kind==='segment' && r.blocksMove && !r.breached) {
      wall=Math.min(wall,d);
      corner=Math.min(corner,distance(u.x,u.y,r.x1,r.y1),distance(u.x,u.y,r.x2,r.y2));
    }
  }
  if (door < 40) return 'у двери/ворот';
  if (corner < 35) return 'у торца/угла';
  if (wall < 35) return 'у стены';
  return 'прочее/открытая зона';
}
for (const count of [100,300,400]) {
  const cfg=await loadConfig();
  if (vehicleDetour) cfg.flags.vehicle_detour_v2 = true;
  if (wallNavLocal) cfg.flags.wall_nav_local = true;
  const game=new Game({cfg,seed,difficulty:'regular',aiVsAi:true});
  const alive=(f)=>[...game.units.values()].filter(u=>u.alive && u.faction===f).length;
  for (const f of [0,1]) {
    const hq=game.world.hqOf(f);
    let k=0;
    while (alive(f)<count/2) {
      const a=k*2.399963229728653, r=150+(k%10)*20;
      game.spawnUnit(f,k%11===0?'mg':'infantry',hq.x+Math.cos(a)*r,hq.y+Math.sin(a)*r,{}); k++;
    }
  }
  const initial=[alive(0),alive(1)];
  const timing=[], windows=new Map(), events=[]; let eligibleSeconds=0;
  for (let i=0;i<600;i++) {
    let t=performance.now(); game.step(0.1); const elapsed=performance.now()-t;
    if (i>=100) timing.push(elapsed);
    if (i%10!==9) continue;
    for (const u of game.units.values()) {
      const eligible=u.alive && !u.downed && u.goal && !u.arrived && !u.perception.hasContact && ['advance','retreat','flee','investigate','resupply'].includes(u.activity) && distance(u.x,u.y,u.goal.x,u.goal.y)>34;
      if (!eligible) { windows.delete(u.id); continue; }
      eligibleSeconds++;
      const old=windows.get(u.id);
      const gd=distance(u.x,u.y,u.goal.x,u.goal.y);
      if (!old || distance(old.gx,old.gy,u.goal.x,u.goal.y)>48 || old.dist-gd>=8) {windows.set(u.id,{gx:u.goal.x,gy:u.goal.y,dist:gd,t:game.time,reported:false});continue;}
      if (!old.reported && game.time-old.t>=5) {
        old.reported=true; events.push({t:+game.time.toFixed(1),id:u.id,faction:u.faction,role:u.role,x:Math.round(u.x),y:Math.round(u.y),goalX:Math.round(u.goal.x),goalY:Math.round(u.goal.y),category:location(game,u)});
      }
    }
  }
  timing.sort((a,b)=>a-b); const avg=timing.reduce((a,b)=>a+b,0)/timing.length;
  let counts={};for(const e of events) counts[e.category]=(counts[e.category]||0)+1;
  console.log(JSON.stringify({seed,vehicleDetour:cfg.flag('vehicle_detour_v2',false),wallNavLocal:cfg.flag('wall_nav_local',false),count,initial,final:[alive(0),alive(1)],simulationSeconds:+game.time.toFixed(1),ticks:timing.length,meanMs:+avg.toFixed(3),meanSimFps:+(1000/avg).toFixed(1),p99Ms:+timing[Math.floor(timing.length*.99)].toFixed(3),low1SimFps:+(1000/timing[Math.floor(timing.length*.99)]).toFixed(1),eligibleBotMinutes:+(eligibleSeconds/60).toFixed(2),eventCount:events.length,eventsPer100EligibleBotMinutes:eligibleSeconds?+(events.length*6000/eligibleSeconds).toFixed(2):null,categories:counts,events}));
}
