'use strict';
// Original ray-cast maze. Discrete key presses let the player study every view.
const map = ['#########','#.......#','#.###.#.#','#...#.#.#','###.#.#.#','#.....#.#','#.#####.#','#.......#','#########'];
const beacons = [[5,1],[5,5]];
const exit = [7,7];
const dirs = [[1,0],[0,1],[-1,0],[0,-1]];
const ctx = document.querySelector('canvas').getContext('2d');
const mission = document.getElementById('mission');
let x=1,y=1,heading=0,finished=false;
const found = new Set();
function draw(){
 ctx.fillStyle='#1c2f50';ctx.fillRect(0,0,400,125);ctx.fillStyle='#35313e';ctx.fillRect(0,125,400,125);
 const depth=[];
 for(let i=0;i<400;i++){
  const angle=heading*Math.PI/2+Math.atan((i-200)/250);
  const floorX=Math.cos(angle),floorY=Math.sin(angle);let d=.02;
  while(d<12&&map[Math.floor(y+.5+floorY*d)]?.[Math.floor(x+.5+floorX*d)]==='.')d+=.035;
  d*=Math.cos(angle-heading*Math.PI/2);depth.push(d);
  const h=Math.min(250,175/d),c=Math.round(180/(1+d*.3));ctx.fillStyle=`rgb(${c*.45},${c*.78},${c})`;ctx.fillRect(i,(250-h)/2,1,h);
 }
 const [dx,dy]=dirs[heading];
 [...beacons.map((p,i)=>[p,found.has(i)?null:'#ffa634']),[exit,'#48dfcb']].forEach(([[px,py],color])=>{
  if(!color)return;const z=(px-x)*dx+(py-y)*dy;if(z<=0)return;
  const screen=200+250*((py-y)*dx-(px-x)*dy)/z;
  if(screen<0||screen>=400||depth[Math.floor(screen)]<z-.2)return;
  ctx.fillStyle=color;const r=Math.min(25,32/z);ctx.beginPath();ctx.arc(screen,125,r,0,Math.PI*2);ctx.fill();
 });
 // In-world navigation aid: only visited orientation and the schematic are shown, not a route.
 ctx.fillStyle='#121a28';ctx.fillRect(306,5,89,89);
 map.forEach((row,j)=>[...row].forEach((cell,i)=>{ctx.fillStyle=cell==='#'?'#566e8c':'#182a41';ctx.fillRect(307+i*9,6+j*9,8,8);}));
 beacons.forEach(([i,j],n)=>{if(!found.has(n)){ctx.fillStyle='#ffa634';ctx.fillRect(309+i*9,8+j*9,4,4);}});
 ctx.fillStyle='#48dfcb';ctx.fillRect(309+exit[0]*9,8+exit[1]*9,4,4);
 ctx.fillStyle='#fff';ctx.fillRect(309+x*9,8+y*9,4,4);ctx.fillRect(310+x*9+dx*3,9+y*9+dy*3,2,2);
}
addEventListener('keydown',event=>{
 if(finished||!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(event.key))return;
 event.preventDefault();
 if(event.key==='ArrowLeft'||event.key==='ArrowRight')heading=(heading+(event.key==='ArrowLeft'?3:1))%4;
 else {const [dx,dy]=dirs[heading],step=event.key==='ArrowUp'?1:-1;
 const nx=x+dx*step,ny=y+dy*step;if(map[ny]?.[nx]==='.'){x=nx;y=ny;}}
 beacons.forEach(([bx,by],i)=>{if(x===bx&&y===by)found.add(i);});
 if(x===exit[0]&&y===exit[1]&&found.size===2){finished=true;mission.textContent='Миссия выполнена: сигнал восстановлен.';}
 else mission.textContent=`Маяки: ${found.size} из 2. Оранжевые — маяки, бирюзовый — выход.`;
 draw();
});
draw();
