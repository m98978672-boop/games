// Fresh synthetic scenes, disjoint from v2 training/development and its first
// reported test. No neural answers or outcomes are used to construct them.
import {writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {visible,SYSTEM} from './collect-obstacle-v2.mjs';
export function holdout(){
 const sizes=[[184,208],[264,200],[312,224],[200,256]],offsets=[-36,0,36],seeds=[401,409,419,421];let rows=[];
 for(const [width,height] of sizes)for(const offset of offsets)for(const faction of [0,1])for(const closed of ['U','D']){
  const seed=seeds[Math.floor(rows.length/4)%seeds.length];
  const spec={id:`holdout-${seed}-${width}-${height}-${offset}-${faction}-${closed}`,split:'holdout',seed,width,height,offset,faction,closed};
  rows.push({spec,input:visible(spec)});
 }
 return {system:SYSTEM,rows};
}
if(process.argv[1]&&resolve(process.argv[1])===new URL(import.meta.url).pathname){
 if(!process.argv[2])throw Error('output required');await writeFile(resolve(process.argv[2]),JSON.stringify(holdout(),null,2)+'\n');
}
