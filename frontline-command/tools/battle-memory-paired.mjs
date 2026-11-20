#!/usr/bin/env node
// Paired diagnostic, not proof of general superiority. Memory starts empty; in
// each seed/start-position both faction assignments are tried. No shared store.
import {loadConfig} from '../src/core/config.js';
import {Game} from '../src/sim/game.js';
import {createHash} from 'node:crypto';
const cfg=await loadConfig();cfg.factions[0].persona='balanced';cfg.factions[1].persona='balanced';
const seeds=(process.argv[2]||'11,23').split(',').map(Number),cap=Number(process.argv[3]||600),warmupSeed=process.argv[4]===undefined?null:Number(process.argv[4]),rows=[];
class Storage{constructor(data=[]){this.data=new Map(data);}getItem(k){return this.data.get(k)??null;}setItem(k,v){this.data.set(k,String(v));}}
let prior=[];
if(warmupSeed!==null){
 const store=new Storage(),g=new Game({cfg,seed:warmupSeed,aiVsAi:true,strategicMemoryStorage:store});
 while(!g.warOver&&g.time<1200)g.step(.1);
 prior=[...store.data];console.log('WARMUP '+JSON.stringify({seed:warmupSeed,seconds:g.time,entries:prior.map(([key,v])=>[key,JSON.parse(v).entries.length])}));
}
for(const seed of seeds) for(const swapSides of [false,true]) for(const memorySide of [0,1]) {
 const g=new Game({cfg,seed,aiVsAi:true,swapSides,strategicMemoryStorage:warmupSeed===null?null:new Storage(prior)});g.battleMemory.enabled=[memorySide===0,memorySide===1];
 const hashes=[createHash('sha256'),createHash('sha256')],directives=[0,0];
 g.events.on('orderIssued',({order:o})=>{if(o.type==='directive'&&['enemyAI','autopilot'].includes(o.source)){hashes[o.faction].update(JSON.stringify([o.issuedAt,o.squadIds,o.target?.pointId,o.params?.goalType,o.params?.strategy]));directives[o.faction]++;}});
 let activeReads=0;const penalty=g.battleMemory.attackPenalty.bind(g.battleMemory);g.battleMemory.attackPenalty=(f,id)=>{const p=penalty(f,id);if(f===memorySide&&p>0)activeReads++;return p;};
 while(!g.warOver&&g.time<cap)g.step(.1);
 const h=[...g.battleMemory.history[memorySide].values()];
 const row={seed,swapSides,memorySide,seconds:Math.round(g.time*10)/10,winner:g.outcome?.winner??null,kills:g.stats.kills,captures:g.stats.captures,retreatEvents:h.reduce((n,x)=>n+x.retreats,0),captureEvents:h.reduce((n,x)=>n+x.captures,0),activeRiskReads:activeReads,directives,decisionHashes:hashes.map(h=>h.digest('hex'))};
 rows.push(row);console.log(JSON.stringify(row));
}
const pairs=rows.filter(x=>x.memorySide===0).map(a=>[a,rows.find(b=>b.seed===a.seed&&b.swapSides===a.swapSides&&b.memorySide===1)]);
const summary={games:rows.length,cap,warmupSeed,memoryWins:rows.filter(x=>x.winner===x.memorySide).length,baselineWins:rows.filter(x=>x.winner!==null&&x.winner!==x.memorySide).length,unfinishedOrDraw:rows.filter(x=>x.winner===null).length,retreatHistoryTotals:rows.reduce((n,x)=>n+x.retreatEvents,0),activeRiskReads:rows.reduce((n,x)=>n+x.activeRiskReads,0),pairsWithDifferentDirectiveTrace:pairs.filter(([a,b])=>a.decisionHashes.some((x,i)=>x!==b.decisionHashes[i])).length};
console.log('SUMMARY '+JSON.stringify(summary));
