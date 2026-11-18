import assert from 'node:assert/strict';import {loadConfig} from '../src/core/config.js';import {Game} from '../src/sim/game.js';import {expandedMapConfig} from '../tools/experiments/expanded-map.mjs';
const cfg=await loadConfig(),big=expandedMapConfig(cfg),original=new Game({cfg,seed:7,aiVsAi:true}),g=new Game({cfg:big,seed:7,aiVsAi:true});
assert.equal(cfg.sectors.map.width,4096,'do not mutate source configuration');
assert.equal(g.world.W,6528);assert.equal(g.world.H,6912);assert.equal(big.sectors.hex.cols,cfg.sectors.hex.cols+4);assert.equal(big.sectors.hex.rows,cfg.sectors.hex.rows+4);
for(const a of original.world.sectors){const b=g.world.sectors.find(s=>s.q===a.q+2&&s.r===a.r+2);assert.ok(b);assert.ok(Math.abs(b.cx-a.cx-1216)<1e-6);assert.ok(Math.abs(b.cy-a.cy-1408)<1e-6);}
for(const s of g.world.sectors){const m=g.world.sectors.find(o=>Math.hypot(o.cx-(g.world.W-s.cx),o.cy-(g.world.H-s.cy))<0.1);assert.ok(m,`missing mirrored sector ${s.q},${s.r}`);}
for(const p of original.world.points){const b=g.world.pointById(p.id);assert.equal(b.x,p.x+1216);assert.equal(b.y,p.y+1408);const sector=g.world.sectorAt(b.x,b.y);assert.ok(sector,`point ${p.id} must have sector`);}
let terrainMismatch=0;const w=g.world;for(let y=0;y<w.rows;y++)for(let x=0;x<w.cols;x++)if(w.terrain[x+y*w.cols]!==w.terrain[w.cols-1-x+(w.rows-1-y)*w.cols])terrainMismatch++;
assert.equal(terrainMismatch,0,'expanded terrain must remain symmetric');
for(let i=0;i<100;i++)g.step(.1);
assert.ok([...g.units.values()].every(u=>Number.isFinite(u.x)&&Number.isFinite(u.y)&&u.x>=0&&u.x<=w.W&&u.y>=0&&u.y<=w.H));
console.log(`expanded map: ${original.world.sectors.length} -> ${w.sectors.length} sectors; 100 real Game.step ticks`);
