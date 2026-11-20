// Upper-bound style token-budget fixture for the existing 1k-context worker.
// This is synthetic and not a WebGPU/MLC inference test.
import {writeFile} from 'node:fs/promises';
import {runtimeCommanderPrompt} from '../../src/ai/commander-prompts.js';
const output=process.argv[2];if(!output)throw Error('output path required');
const squads=Array.from({length:8},()=>({members:100,ammo:100,health:100,morale:100,engineers:100}));
const points=Array.from({length:8},()=>({kind:'factory',key:true}));
const builds=Array.from({length:6},()=>({progress:100}));
const recent=[{action:'hold',squad:7,status:'cancelled',age:120,point:7},{action:'build',squad:7,status:'accepted',age:120,build:5},{action:'supply',squad:7,status:'refused',age:120}];
const experience=['supply','build','hold'].map(action=>({action,ammo:'medium',engineer:true,accepted:9999,refused:9999,cancelled:9999}));
const input={squads,points,builds,memory:{recent,experience}};
await writeFile(output,JSON.stringify({cases:[false,true].map(knowledge=>({knowledge,prompt:runtimeCommanderPrompt(knowledge),input}))}));
