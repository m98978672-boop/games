import * as THREE from 'three';
// Seamless, deterministic procedural textures; generated locally, no network.
export function makeCityTexture(kind){
 if(typeof document==='undefined')return null;
 const canvas=document.createElement('canvas');canvas.width=canvas.height=128;const ctx=canvas.getContext('2d');if(!ctx)return null;
 ctx.fillStyle='#eeeeee';ctx.fillRect(0,0,128,128);
 let seed=kind.length*997;const rand=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296};
 for(let i=0;i<850;i++){const shade=Math.floor(160+rand()*95);ctx.fillStyle=`rgba(${shade},${shade},${shade},${.1+rand()*.16})`;ctx.fillRect(Math.floor(rand()*128),Math.floor(rand()*128),1+Math.floor(rand()*2),1+Math.floor(rand()*2))}
 if(kind==='pavement'){ctx.strokeStyle='rgba(60,70,70,.18)';ctx.lineWidth=1;for(let y=0;y<=128;y+=32){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(128,y);ctx.stroke();for(let x=(y/32%2)*32;x<=128;x+=64){ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x,y+32);ctx.stroke()}}}
 if(kind==='facade'){ctx.strokeStyle='rgba(80,80,80,.15)';for(let y=0;y<=128;y+=16){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(128,y);ctx.stroke()}}
 const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;texture.wrapS=texture.wrapT=THREE.RepeatWrapping;texture.repeat.set(2,2);return texture;
}
