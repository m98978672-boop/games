import assert from 'node:assert/strict';import {loadConfig} from '../src/core/config.js';import {Game} from '../src/sim/game.js';
import {courtesyYield} from '../src/sim/door_courtesy.js';
const cfg=await loadConfig();assert.equal(cfg.flag('door_courtesy_v1',false),false);
for(const faction of [0,1]){
 cfg.flags.door_courtesy_v1=true;const g=new Game({cfg,seed:1,aiVsAi:true});g.units.clear();g.unitGrid.clear();
 const b=g.world.buildings.find(b=>b.type==='hq'&&b.faction===faction&&g.walls.state(b)),o=g.walls.state(b).outline.openings.find(o=>o.type==='door');
 const x=b.x+o.cx,y=b.y+o.cy;
 const out=g.spawnUnit(faction,'infantry',x-o.nx*85,y-o.ny*85),enter=g.spawnUnit(faction,'infantry',x+o.nx*85,y+o.ny*85);
 out.goal={x:x+o.nx*105,y:y+o.ny*105};enter.goal={x:x-o.nx*105,y:y-o.ny*105};
 assert.ok(courtesyYield(g,enter),'entry yields');assert.equal(courtesyYield(g,out),null,'exit not held');
 out.perception.hasContact=true;assert.equal(courtesyYield(g,enter),null,'no combat interference');out.perception.hasContact=false;
 out.faction=1-faction;assert.equal(courtesyYield(g,enter),null,'not friendly');out.faction=faction;
 cfg.flags.door_courtesy_v1=false;assert.equal(courtesyYield(g,enter),null,'off');
}
console.log('door courtesy: off by default, exit priority, contact/faction checks');
