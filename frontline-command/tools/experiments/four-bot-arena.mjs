// Four mutually hostile factions on one real Game.step battle map, RESEARCH ONLY.
// Not full four-faction strategic/economic gameplay: those two-faction systems
// and victory are disabled, with equal scripted squad objectives instead.
import {loadConfig} from '../../src/core/config.js';
import {Game} from '../../src/sim/game.js';
import {Squad} from '../../src/sim/squads.js';
import {emptyOverlapMetrics,observeOverlaps} from '../../tests/acceptance/overlap-metrics.mjs';
import {installFourControllers} from './external-crowd.mjs';
const names=['original','yuka','orca','hybrid'];
const center={x:1200,y:1200},radius=360;
const directions=[[0,-1],[1,0],[0,1],[-1,0]];
export async function runArena({seed=1,rotation=0,seconds=90,count=6}={}){
 if(!Number.isInteger(seed)||seed<1||!Number.isInteger(rotation)||rotation<0||rotation>3||seconds<=0||seconds>300||count!==6)throw Error('invalid arena parameters');
 const cfg=await loadConfig();cfg.flags.motion_wall_sweep_v1=true;cfg.flags.motion_wall_exact_v1=true;cfg.flags.assault_forts=false;cfg.flags.alg_deadlock=true;
 const g=new Game({cfg,seed,aiVsAi:true,difficulty:'regular'});
 for(const s of [g.squadAI,...g.strategic,g.autopilot,g.rules,g.logistics,g.build,g.influence,g.api])s.update=()=>{};
 g.checkVictory=()=>{};
 g.units.clear();g.squads.clear();g.unitGrid.clear();g.occupancyGrid.clear();g.occupancyMaxRadius=0;g.nextUnitId=1;g.nextSquadId=1;
 for(const key of ['kills','losses','captures','deliveries','built'])g.stats[key]=[0,0,0,0];
 const positions=[],controllers={},unitsByFaction=[[],[],[],[]],groups=[];
 for(let f=0;f<4;f++){
  const [dx,dy]=directions[f],tx=-dy,ty=dx,type=names[(f+rotation)%4];controllers[f]=type;
  const sq=new Squad(g,{faction:f,name:`arena-${type}`});sq.state='advance';sq.behavior='attack';sq.objective={...center};sq.anchor={...center};sq.facing=Math.atan2(-dy,-dx);g.squads.set(sq.id,sq);groups.push(sq);
  for(let i=0;i<count;i++){
   const lateral=(i%3-1)*24,depth=Math.floor(i/3)*24;
   const x=center.x+dx*(radius+depth)+tx*lateral,y=center.y+dy*(radius+depth)+ty*lateral;
   if(!g.world.isBaseWalkable(x,y)||g.walls.blocksMove(x,y,9)||positions.some(p=>Math.hypot(p.x-x,p.y-y)<18.1))throw Error('invalid or overlapping arena spawn');
   positions.push({x,y});const u=g.spawnUnit(f,'infantry',x,y);sq.addUnit(u);u.facing=Math.atan2(-dy,-dx);u.aimAngle=u.facing;u._arenaController=type;unitsByFaction[f].push(u);
  }
 }
 // Verify that game perception treats all three other factions as enemies.
 const hostility=unitsByFaction.map((a,f)=>{
  const enemies=g.nearbyEnemies(a[0],1200);
  if(enemies.some(u=>u.faction===f))throw Error('friendly unit seen as enemy');
  const other=[...new Set(enemies.map(u=>u.faction))].sort((x,y)=>x-y);
  if(other.length!==3)throw Error('a faction does not see three enemy factions');
  return other;
 });
 // Do not use the original two-HQ interpretation for threat direction.
 g.world.enemyHQ=(f)=>{const mine=groups[f].centroid();let best=null,bestD=Infinity;
  for(let j=0;j<4;j++)if(j!==f&&groups[j].count()){const p=groups[j].centroid(),d=Math.hypot(p.x-mine.x,p.y-mine.y);if(d<bestD){best=p;bestD=d;}}
  return best;
 };
 const metrics=await installFourControllers(g),overlap=emptyOverlapMetrics(),downBy=Array.from({length:4},()=>[0,0,0,0]),pathFailures=[0,0,0,0];let badFriendly=0,friendlyTargetSamples=0,swept=0,moves=0;
 g.events.on('pathFailed',e=>{if(Number.isInteger(e.faction)&&e.faction>=0&&e.faction<4)pathFailures[e.faction]++;});
 g.events.on('unitDowned',({unit})=>{const from=unit.lastAttacker?.faction;if(Number.isInteger(from)&&from>=0&&from<4){downBy[from][unit.faction]++;if(from===unit.faction)badFriendly++;}});
 g._motionDiagnostic=(u,x,y,nx,ny)=>{if(Math.hypot(nx-x,ny-y)<1e-9)return;moves++;if(g.walls.blocksMoveSweep(x,y,nx,ny,u.radius,u))swept++;};
 let ticks=0;
 while(ticks<Math.ceil(seconds/.1)){
  const active=unitsByFaction.map(a=>a.filter(u=>u.alive&&!u.downed).length);
  if(active.filter(v=>v>0).length<=1)break;
  g.step(.1);ticks++;
  for(const u of g.units.values())if(u.alive&&u.targetId!=null){const target=g.unitById(u.targetId);if(target&&target.faction===u.faction)friendlyTargetSamples++;}
  if(ticks%10===0)observeOverlaps([...g.units.values()].filter(u=>u.alive&&!u.downed),overlap);
 }
 const active=unitsByFaction.map(a=>a.filter(u=>u.alive&&!u.downed).length);
 const alive=unitsByFaction.map(a=>a.filter(u=>u.alive).length),firing=unitsByFaction.map(a=>a.reduce((n,u)=>n+(u.shotsFired||0),0));
 const remaining=active.flatMap((n,i)=>n>0?[i]:[]),winner=remaining.length===1?controllers[remaining[0]]:null;
 return {seed,rotation,seconds:+g.time.toFixed(2),controllers,hostility,active,alive,firing,downBy,pathFailures,winner,timeout:remaining.length>1,
  botMetrics:metrics,swept,moves,overlap,badFriendly,friendlyTargetSamples};
}
