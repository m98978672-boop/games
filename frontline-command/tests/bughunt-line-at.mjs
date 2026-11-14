import assert from 'node:assert/strict';
import {lineAt} from '../../tools/bughunt/lib/scan.mjs';
const old=(text,index)=>{let n=1;for(let i=0;i<index&&i<text.length;i++)if(text.charCodeAt(i)===10)n++;return n;};
for(const s of ['', 'one', 'a\nb\n', '\n\n🚀\r\nx'])for(let i=-1;i<=s.length+2;i++)assert.equal(lineAt(s,i),old(s,i));
let seed=71;const random=()=>((seed=Math.imul(seed,1664525)+1013904223>>>0)/4294967296);
for(let sample=0;sample<80;sample++){
 let s='';for(let i=0;i<500;i++)s+=random()<.15?'\n':random()<.05?'🚀':'a';
 for(let j=0;j<100;j++){const i=Math.floor(random()*(s.length+10))-5;assert.equal(lineAt(s,i),old(s,i));}
}
console.log('bughunt line numbers match the original scan across random offsets and UTF-16 text');
