// Bounded fail-closed smoke probe: do the tested simulation paths use the
// ambient wall clock or unseeded randomness? Passing is not a whole-game proof.
import { loadConfig } from '../src/core/config.js';
import { Game } from '../src/sim/game.js';
const cfg=await loadConfig();
const originalRandom=Math.random, originalNow=Date.now, results=[];
try {
  Math.random=()=>{throw new Error('unseeded Math.random called during simulation probe');};
  Date.now=()=>{throw new Error('Date.now called during simulation probe');};
  for(let seed=1;seed<=20;seed++) {
    let ticks=0;
    try {
      const game=new Game({cfg,seed,aiVsAi:true});
      for(;ticks<600;ticks++) {
        if(game.warOver)break;
        game.step(1/60);
      }
      results.push({seed,ticks,endedEarly:ticks!==600,error:null});
    } catch(e) {results.push({seed,ticks,error:String(e?.stack||e)});}
  }
} finally {Math.random=originalRandom;Date.now=originalNow;}
const passed=results.length===20 && results.every(r=>r.ticks===600&&!r.error&&!r.endedEarly);
console.log(JSON.stringify({passed,seeds:20,requestedTicks:600,dt:1/60,scope:'Node Game constructor and 600 headless AI-vs-AI steps; no browser input/audio/save/load, no guarantee that all code paths ran',results},null,2));
if(!passed)process.exitCode=1;
