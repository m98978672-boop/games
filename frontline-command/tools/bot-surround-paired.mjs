// Paired, isolated perception/decision scenes: not full wars or win-rate tests.
import { loadConfig } from '../src/core/config.js';
import { Game } from '../src/sim/game.js';
import { thinkSoldier } from '../src/sim/ai_soldier.js';
const seeds=20, kinds=['front','rear','opaque_hq_wall'];
async function run(seed,faction,kind,on){
  const cfg=await loadConfig();cfg.flags.bot_surround_vision_v1=on;cfg.flags.assault_forts=false;
  const game=new Game({cfg,seed,aiVsAi:true});game.units.clear();game.unitGrid.clear();game.dt=.05;
  let ax=2000,ay=2000,ex=kind==='front'?2200:1800,ey=2000,los;
  if(kind==='opaque_hq_wall'){
    const b=game.world.buildings.find(b=>b.type==='hq'&&game.walls.state(b));
    const seg=game.walls.state(b).outline.segments.find(s=>s.length>=80&&s.blocksVision);
    const [[x1,y1],[x2,y2]]=seg.points,len=Math.hypot(x2-x1,y2-y1),nx=-(y2-y1)/len,ny=(x2-x1)/len;
    const mx=b.x+(x1+x2)/2,my=b.y+(y1+y2)/2;
    ax=mx+nx*30;ay=my+ny*30;ex=mx-nx*30;ey=my-ny*30;los=game.world.hasLOS(ax,ay,ex,ey,true);
    if(los)throw Error('test wall is not opaque');
  }else{
    // Synthetic unobstructed LOS isolates directional behavior; actual HQ wall tested separately.
    game.world.hasLOS=()=>true;game.walls.enabled=()=>false;los=true;
  }
  const actor=game.spawnUnit(faction,'infantry',ax,ay),target=game.spawnUnit(1-faction,'infantry',ex,ey);
  actor.facing=kind==='opaque_hq_wall'?Math.atan2(ey-ay,ex-ax):0;actor.aimAngle=actor.facing;
  const mag=actor.mag;thinkSoldier(game,actor);
  return {los,contact:actor.perception.hasContact,target:actor.targetId===target.id,activity:actor.activity,shots:mag-actor.mag};
}
const pairs=[];
for(const kind of kinds)for(let faction=0;faction<2;faction++)for(let seed=1;seed<=seeds;seed++){
  const off=await run(seed,faction,kind,false),on=await run(seed,faction,kind,true);
  pairs.push({kind,faction,seed,off,on});
}
const summary=kinds.map(kind=>{const p=pairs.filter(x=>x.kind===kind);return {kind,pairs:p.length,offContact:p.filter(x=>x.off.contact).length,
  onContact:p.filter(x=>x.on.contact).length,offShots:p.reduce((n,x)=>n+x.off.shots,0),onShots:p.reduce((n,x)=>n+x.on.shots,0)};});
const expected=summary[0].offContact===40&&summary[0].onContact===40&&summary[1].offContact===0&&summary[1].onContact===40&&summary[2].offContact===40&&summary[2].onContact===0;
console.log(JSON.stringify({expected,kind:'paired_perception_decision_diagnostic',seeds,pairs,summary,
  caveats:['Synthetic open LOS and one real opaque HQ wall, only two units','AI makes one decision, not a full engagement or war','0/100 win-rate evaluation: balance impact not established','Test disables fort assault in both variants','A change in detection changes combat; feature remains opt-in']},null,2));
if(!expected)process.exitCode=1;
