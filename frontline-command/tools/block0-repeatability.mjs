// Block 0: diagnostic, not a full state hash or replay acceptance.
// Run two independent Games per seed with identical config and no rendering.
import { loadConfig } from '../src/core/config.js';
import { Game } from '../src/sim/game.js';

const arg = (name, fallback) => {
  const value = process.argv.find((s) => s.startsWith(`--${name}=`));
  const n = value ? Number(value.slice(name.length + 3)) : fallback;
  if (!Number.isInteger(n) || n < 1 || n > 10000) throw new Error(`invalid ${name}`);
  return n;
};
const count = arg('seeds', 20), ticks = arg('ticks', 60);
const cfg = await loadConfig();
const dt = 1 / 60;
const keys = ['id','faction','role','x','y','vx','vy','hp','alive','downed','squadId','state','activity','targetId','goal','arrived','pathFailed','facing','aimAngle','turretAngle','mag','reserve','cool','reloadT','morale','suppression','stuck','cargo','cargoType'];
const unitState = (u) => Object.fromEntries(keys.map((k) => [k, u[k] ?? null]));
// Numeric fields use JS JSON's round-trip representation, with no tolerance/rounding.
// Array ordering uses ids, not map insertion order. This deliberately samples only
// fields listed here: it cannot establish complete determinism or validate save/load.
function sample(g) {
  return JSON.stringify({ time:g.time, rng:g.rng.s, over:g.warOver, outcome:g.outcome,
    units:[...g.units.values()].sort((a,b)=>a.id-b.id).map(unitState),
    points:[...g.world.points].sort((a,b)=>a.id-b.id).map(p=>[p.id,p.owner,p.capture,p.progress]),
    stock:g.logistics.stock, delivered:g.logistics.delivered, stats:g.stats });
}
// FNV-1a 64-bit; exact serialized samples are compared as well, so collisions
// cannot turn a divergence into a pass. Hash is diagnostic only.
function hash(s) {
  let h=0xcbf29ce484222325n;
  for(const byte of new TextEncoder().encode(s)){h^=BigInt(byte);h=BigInt.asUintN(64,h*0x100000001b3n);}
  return h.toString(16).padStart(16,'0');
}
const runs=[];
for(let seed=1;seed<=count;seed++){
  const a=new Game({cfg,seed,aiVsAi:true}), b=new Game({cfg,seed,aiVsAi:true});
  let firstMismatch=null, lastHash=null, compared=0;
  for(let tick=0;tick<=ticks;tick++){
    if(tick){a.step(dt);b.step(dt);}
    const aa=sample(a),bb=sample(b); compared++;lastHash=hash(aa);
    if(aa!==bb){firstMismatch={tick, hashA:lastHash, hashB:hash(bb)};break;}
  }
  runs.push({seed,ticksCompared:compared,lastHash,firstMismatch});
}
const passed=runs.every((r)=>r.firstMismatch===null && r.ticksCompared===ticks+1);
console.log(JSON.stringify({passed,kind:'partial_state_repeatability_diagnostic',node:process.version,dt,ticks,seeds:count,
  note:'Only selected units, point, stocks, stats and shared RNG fields; not full determinism, input replay, save/load or cross-browser proof.',runs},null,2));
if(!passed)process.exitCode=1;
