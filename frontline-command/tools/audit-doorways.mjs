// Одиночный диагностический проход через существующие проёмы. Вывод: JSONL.
import { loadConfig } from '../src/core/config.js';
import { Game } from '../src/sim/game.js';
import { moveAlongFlow, updateTimers } from '../src/sim/units.js';
for (const [type, role, openingType] of [['hq','infantry','door'],['city','infantry','door'],['depot','truck','gate'],['factory','truck','gate'],['city','truck','door']]) {
 for (const reverse of [false,true]) {
  const cfg=await loadConfig(),g=new Game({cfg,seed:5,difficulty:'regular',aiVsAi:true});
  g.units.clear();g.unitGrid.clear();
  const b=g.world.buildings.find(b=>b.type===type && g.walls.state(b));const st=g.walls.state(b); const o=st.outline.openings.find(o=>o.type===openingType); if(!o) continue;
  const px=b.x+o.cx,py=b.y+o.cy;const inward=reverse?1:-1;
  const x=px+inward*o.nx*55,y=py+inward*o.ny*55;
  const u=g.spawnUnit(0,role,x,y,{}); u.goal={x:px-inward*o.nx*100,y:py-inward*o.ny*100}; u.activity='advance'; const gx=u.goal.x,gy=u.goal.y;
  let end='timeout';
  for(let k=0;k<400;k++){g.time+=0.05;g.nav.advance();g.walls.update(0.05);updateTimers(g,u,0.05);moveAlongFlow(g,u,0.05);if(u.arrived){end='arrived';break}if(u.pathFailed){end='pathFailed';break}}
  console.log(JSON.stringify({type,role,opening:openingType,width:o.width,direction:reverse?'in':'out',result:end,t:+g.time.toFixed(2),distance:+Math.hypot(u.x-gx,u.y-gy).toFixed(1),at:[+u.x.toFixed(1),+u.y.toFixed(1)]}));
 }
}
