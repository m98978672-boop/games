// Integration-only scripted provider. NOT model inference or training.
import {loadConfig} from '../src/core/config.js';import {Game} from '../src/sim/game.js';import {commanderSnapshot,applyCommanderPair} from '../src/sim/neutral_commander.js';import {writeFileSync} from 'node:fs';import {fileURLToPath} from 'node:url';
const cfg=await loadConfig();cfg.factions=cfg.factions.map(f=>({...f,persona:'balanced'}));cfg.faction=id=>cfg.factions[id]||cfg.factions[0];
const seconds=180,seeds=[7,11],runs=[];
for(const seed of seeds)for(const on of [false,true]){
 const g=new Game({cfg,seed,aiVsAi:true,swapSides:seed===11}),stats={attempts:0,paired:0,skips:{},actions:{hold:0,supply:0,none:0}};let next=0;
 for(let i=0;i<seconds*10&&!g.warOver;i++){
  g.step(.1);
  if(on&&g.time>=next){next+=25;const s=[commanderSnapshot(g,0),commanderSnapshot(g,1)];
   const texts=s.map(x=>{if(!x.input.squads.length)return '{"action":"none"}';const low=x.input.squads.findIndex(q=>q.ammo<70);if(low>=0)return JSON.stringify({action:'supply',squad:low});if(x.points.length)return '{"action":"hold","squad":0,"point":0}';return '{"action":"none"}';});
   const r=applyCommanderPair(g,s,texts);stats.attempts++;if(r.ok){stats.paired++;for(const a of r.actions)stats.actions[a]++;}else stats.skips[r.reason]=(stats.skips[r.reason]||0)+1;
  }
 }
 const orders=g.api.orders.filter(o=>o.source==='neutralAI');const run={seed,on,seconds:+g.time.toFixed(1),outcome:g.outcome,kills:g.stats.kills,captures:g.stats.captures,deliveries:g.stats.deliveries,stats,issued:[0,1].map(f=>orders.filter(o=>o.faction===f).length),accepted:[0,1].map(f=>orders.filter(o=>o.faction===f&&o.status==='accepted').length),refused:[0,1].map(f=>orders.filter(o=>o.faction===f&&o.status==='refused').length)};runs.push(run);console.log(JSON.stringify(run));
}
writeFileSync(fileURLToPath(new URL('../docs/NEUTRAL_COMMANDER_SCRIPTED_WAR.json',import.meta.url)),JSON.stringify({description:'Scripted synthetic provider; no Qwen inference, no training. No latency. Same seeds but RNG diverges. Not an AI-strength or fairness test.',runs},null,2)+'\n');
