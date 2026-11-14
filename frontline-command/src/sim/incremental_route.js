// Экспериментальный A*: пооперационное планирование; выключен по умолчанию.
// Ограничиваем количество проверок за вызов, а не обещаем жёсткий бюджет мс.
const CELL = 32, MAX_NODES = 2500, MAX_CELLS = 262144;
class Heap {
  constructor() { this.a = []; }
  push(v) { let i = this.a.push(v)-1; while (i) { const p = (i-1)>>1; if (this.a[p].f <= v.f) break; this.a[i]=this.a[p]; i=p; } this.a[i]=v; }
  pop() { const top=this.a[0], tail=this.a.pop(); if(this.a.length){let i=0;while(2*i+1<this.a.length){const l=2*i+1,r=l+1,j=r<this.a.length && this.a[r].f<this.a[l].f?r:l;if(this.a[j].f>=tail.f)break;this.a[i]=this.a[j];i=j;}this.a[i]=tail;}return top; }
  get size() { return this.a.length; }
}

export class IncrementalPlanner {
  constructor(game, unit) {
    if (!game?.world || !game.walls || !unit?.goal || ![game.world.W,game.world.H,unit.x,unit.y,unit.radius,unit.goal.x,unit.goal.y].every(Number.isFinite) || unit.radius <= 0)
      throw new Error('invalid planning input');
    this.game=game; this.world=game.world; this.walls=game.walls; this.unit=unit;
    this.start={x:unit.x,y:unit.y}; this.goal={x:unit.goal.x,y:unit.goal.y}; this.radius=unit.radius;
    this.version=game.world.navVersion; this.status='running'; this.path=null; this.reason=null; this.operations=0; this.expanded=0;
    this.cols=Math.floor(game.world.W/CELL); this.rows=Math.floor(game.world.H/CELL);
    if (this.cols<1 || this.rows<1 || this.cols*this.rows>MAX_CELLS) throw new Error('unsupported grid size');
    this.iterator=this.search();
  }
  cancel(reason='cancelled') { if(this.status==='running'){this.status='cancelled';this.reason=reason;this.iterator.return();} }
  step(maxOps) {
    if (!Number.isInteger(maxOps) || maxOps<1 || maxOps>10000) throw new Error('invalid operation budget');
    const u=this.unit;
    if(this.status==='running' && (this.game.world!==this.world || this.game.walls!==this.walls ||
      this.game.world.navVersion!==this.version || this.game.walls.navQueue?.size > 0 || u.radius!==this.radius || !u.goal ||
      ![u.x,u.y,u.goal.x,u.goal.y].every(Number.isFinite) ||
      Math.hypot(u.goal.x-this.goal.x,u.goal.y-this.goal.y)>1 || Math.hypot(u.x-this.start.x,u.y-this.start.y)>32 || !u.alive || u.downed)) this.cancel('stale');
    let used=0;
    while(this.status==='running' && used<maxOps){const result=this.iterator.next();used++;this.operations++;if(result.done){this.path=result.value;this.status=this.path?'found':'failed';if(!this.path)this.reason='no path or node limit';}}
    return { status:this.status, used, path:this.path, reason:this.reason, expanded:this.expanded };
  }
  *search() {
    const {game,unit,cols,rows}=this, w=game.world, r=unit.radius;
    const pos=i=>({x:(i%cols+.5)*CELL,y:(Math.floor(i/cols)+.5)*CELL});
    const free=(x,y)=>x>=8&&y>=8&&x<=w.W-8&&y<=w.H-8&&w.isBaseWalkable(x,y)&&w.isBaseWalkable(x-r,y-r)&&w.isBaseWalkable(x+r,y-r)&&w.isBaseWalkable(x-r,y+r)&&w.isBaseWalkable(x+r,y+r)&&!game.walls.blocksMove(x,y,r,unit);
    // Обе конечные точки проверяются явно: дискретная проверка ребра,
    // начинающаяся с первой пробы после точки, могла пропустить узкую стену.
    yield;
    if (!free(this.start.x,this.start.y) || !free(this.goal.x,this.goal.y)) return null;
    const valid=new Map();
    const pass=i=>{if(!valid.has(i)){const p=pos(i);valid.set(i,free(p.x,p.y));}return valid.get(i);};
    const edge=(x,y,tx,ty)=>{const n=Math.ceil(Math.hypot(tx-x,ty-y)/8);for(let k=1;k<=n;k++)if(!free(x+(tx-x)*k/n,y+(ty-y)*k/n))return false;return true;};
    const nearest=function*(point){let best=-1,bd=Infinity,cx=Math.floor(point.x/CELL),cy=Math.floor(point.y/CELL);
      for(let dy=-3;dy<=3;dy++)for(let dx=-3;dx<=3;dx++){yield;const x=cx+dx,y=cy+dy;if(x<0||y<0||x>=cols||y>=rows)continue;const i=x+y*cols;if(!pass(i))continue;const p=pos(i),d=Math.hypot(point.x-p.x,point.y-p.y);if(d<bd&&edge(point.x,point.y,p.x,p.y)){bd=d;best=i;}}
      return best;};
    const start=yield* nearest(this.start),end=yield* nearest(this.goal);
    if(start<0||end<0)return null;
    const dest=pos(end), h=i=>{const p=pos(i);return Math.hypot(p.x-dest.x,p.y-dest.y)/CELL;};
    const heap=new Heap(), distance=new Map([[start,0]]), prev=new Map(), closed=new Set();heap.push({i:start,f:h(start)});
    while(heap.size&&this.expanded<MAX_NODES){yield;const cur=heap.pop().i;if(closed.has(cur))continue;closed.add(cur);this.expanded++;
      if(cur===end){const rev=[];for(let i=end;i!==undefined;i=prev.get(i)){rev.push(pos(i));if(i===start)break;}rev.reverse();rev.push({...this.goal});return rev;}
      const cx=cur%cols,cy=Math.floor(cur/cols),p=pos(cur);
      for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){if(!dx&&!dy)continue;yield;const x=cx+dx,y=cy+dy;if(x<0||y<0||x>=cols||y>=rows)continue;const ni=x+y*cols;if(closed.has(ni)||!pass(ni))continue;const q=pos(ni);if(!edge(p.x,p.y,q.x,q.y))continue;const d=distance.get(cur)+(dx&&dy?Math.SQRT2:1);if(d>=(distance.get(ni)??Infinity))continue;distance.set(ni,d);prev.set(ni,cur);heap.push({i:ni,f:d+h(ni)});}
    }
    return null;
  }
}
