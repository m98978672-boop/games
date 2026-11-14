// Disposable experiment, not game code: A* on a sampled radius-aware grid.
export function findRoute(game,u) {
 const t0=performance.now(), cell=32, cols=Math.floor(game.world.W/cell), rows=Math.floor(game.world.H/cell), n=cols*rows;
 const valid=new Int8Array(n), dist=new Float64Array(n).fill(Infinity), prev=new Int32Array(n).fill(-1), closed=new Uint8Array(n);
 const pos=i=>({x:(i%cols+.5)*cell,y:(Math.floor(i/cols)+.5)*cell});
 const free=(x,y)=>{
  const r=u.radius, w=game.world;
  return x>=8&&y>=8&&x<=w.W-8&&y<=w.H-8&&w.isBaseWalkable(x,y)&&w.isBaseWalkable(x-r,y-r)&&w.isBaseWalkable(x+r,y-r)&&w.isBaseWalkable(x-r,y+r)&&w.isBaseWalkable(x+r,y+r)&&!game.walls.blocksMove(x,y,r,u);
 };
 const pass=i=>{ if(!valid[i]){let p=pos(i);valid[i]=free(p.x,p.y)?1:-1}return valid[i]===1; };
 const edge=(x,y,tx,ty)=>{let steps=Math.ceil(Math.hypot(tx-x,ty-y)/8);for(let i=1;i<=steps;i++)if(!free(x+(tx-x)*i/steps,y+(ty-y)*i/steps))return false;return true;};
 const nearest=(x,y,needsEdge)=>{let best=-1, bd=Infinity; let cx=Math.floor(x/cell),cy=Math.floor(y/cell);
  for(let dy=-3;dy<=3;dy++)for(let dx=-3;dx<=3;dx++){let a=cx+dx,b=cy+dy;if(a<0||b<0||a>=cols||b>=rows)continue;let i=a+b*cols;if(!pass(i))continue;let p=pos(i),d=Math.hypot(x-p.x,y-p.y);if(d<bd&&(!needsEdge||edge(x,y,p.x,p.y))){bd=d;best=i;}}return best;
 };
 const start=nearest(u.x,u.y,true),end=nearest(u.goal.x,u.goal.y,true);
 if(start<0||end<0)return {path:null,expanded:0,ms:performance.now()-t0,reason:'no open start/goal'};
 const h=i=>{let p=pos(i),q=pos(end);return Math.hypot(p.x-q.x,p.y-q.y)/cell;};
 const heap=[],push=(o)=>{let i=heap.push(o)-1;while(i){let p=(i-1)>>1;if(heap[p].f<=o.f)break;heap[i]=heap[p];i=p;}heap[i]=o;};
 const pop=()=>{const top=heap[0],tail=heap.pop();if(heap.length){let i=0;while(2*i+1<heap.length){let a=2*i+1,b=a+1,j=b<heap.length&&heap[b].f<heap[a].f?b:a;if(heap[j].f>=tail.f)break;heap[i]=heap[j];i=j;}heap[i]=tail;}return top;};
 dist[start]=0;push({i:start,f:h(start)});let expanded=0, found=false;
 while(heap.length&&expanded<2500){let cur=pop().i;if(closed[cur])continue;closed[cur]=1;expanded++;if(cur===end){found=true;break;}let cx=cur%cols,cy=Math.floor(cur/cols),p=pos(cur);
  for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){if(!dx&&!dy)continue;let x=cx+dx,y=cy+dy;if(x<0||y<0||x>=cols||y>=rows)continue;let ni=x+y*cols;if(closed[ni]||!pass(ni))continue;let q=pos(ni);if(!edge(p.x,p.y,q.x,q.y))continue;let cost=dist[cur]+(dx&&dy?Math.SQRT2:1);if(cost>=dist[ni])continue;dist[ni]=cost;prev[ni]=cur;push({i:ni,f:cost+h(ni)});}
 }
 if(!found)return {path:null,expanded,ms:performance.now()-t0,reason:'no path or expansion cap'};
 const rev=[];for(let i=end;i!==-1;i=prev[i]){rev.push(pos(i));if(i===start)break;}rev.reverse();rev.push({x:u.goal.x,y:u.goal.y});
 return {path:rev,expanded,ms:performance.now()-t0};
}
