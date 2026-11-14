// EasyStar.js 0.4.4 grid A* adapter: collision inflation, time slicing and
// stale-route checks are specific to this game's circular units and walls.
import EasyStar from '../vendor/easystar.js';
const CELL=32, MARGIN=512, MAX_CELLS=16384;
export class EasyStarPlanner {
  constructor(game,unit) {
    if(!game?.world||!game.walls||!unit?.goal||![game.world.W,game.world.H,unit.x,unit.y,unit.radius,unit.goal.x,unit.goal.y].every(Number.isFinite)||unit.radius<=0)throw Error('invalid planning input');
    this.game=game;this.world=game.world;this.walls=game.walls;this.unit=unit;this.start={x:unit.x,y:unit.y};this.goal={...unit.goal};this.radius=unit.radius;this.version=game.world.navVersion;
    this.status='running';this.path=null;this.reason=null;this.operations=0;this.expanded=0;this.phase='grid';this.cursor=0;
    this.minX=Math.max(0,Math.floor((Math.min(unit.x,unit.goal.x)-MARGIN)/CELL));this.minY=Math.max(0,Math.floor((Math.min(unit.y,unit.goal.y)-MARGIN)/CELL));
    const maxX=Math.min(Math.floor(game.world.W/CELL)-1,Math.floor((Math.max(unit.x,unit.goal.x)+MARGIN)/CELL));
    const maxY=Math.min(Math.floor(game.world.H/CELL)-1,Math.floor((Math.max(unit.y,unit.goal.y)+MARGIN)/CELL));
    this.cols=maxX-this.minX+1;this.rows=maxY-this.minY+1;
    if(this.cols<1||this.rows<1||this.cols*this.rows>MAX_CELLS)throw Error('planning area too large');
    this.grid=Array.from({length:this.rows},()=>Array(this.cols).fill(1));
  }
  cancel(reason='cancelled'){if(this.status==='running'){this.status='cancelled';this.reason=reason;}}
  point(x,y){return {x:(x+this.minX+.5)*CELL,y:(y+this.minY+.5)*CELL};}
  free(x,y,r=this.radius){const w=this.world;return x-r>=0&&y-r>=0&&x+r<=w.W&&y+r<=w.H&&w.isBaseWalkable(x,y)&&w.isBaseWalkable(x-r,y-r)&&w.isBaseWalkable(x+r,y-r)&&w.isBaseWalkable(x-r,y+r)&&w.isBaseWalkable(x+r,y+r)&&!this.walls.blocksMove(x,y,r,this.unit);}
  edge(a,b){const n=Math.max(1,Math.ceil(Math.hypot(b.x-a.x,b.y-a.y)/8));for(let i=0;i<=n;i++)if(!this.free(a.x+(b.x-a.x)*i/n,a.y+(b.y-a.y)*i/n))return false;return true;}
  nearest(p){let best=null,dist=Infinity;const cx=Math.floor(p.x/CELL)-this.minX,cy=Math.floor(p.y/CELL)-this.minY;
    for(let dy=-3;dy<=3;dy++)for(let dx=-3;dx<=3;dx++){const x=cx+dx,y=cy+dy;if(y<0||x<0||y>=this.rows||x>=this.cols||this.grid[y][x])continue;const q=this.point(x,y),d=Math.hypot(p.x-q.x,p.y-q.y);if(d<dist&&this.edge(p,q)){best={x,y};dist=d;}}
    return best;}
  step(budget){
    if(!Number.isInteger(budget)||budget<1||budget>10000)throw Error('invalid operation budget');
    const u=this.unit;
    if(this.status==='running'&&(this.game.world!==this.world||this.game.walls!==this.walls||this.world.navVersion!==this.version||this.walls.navQueue?.size>0||u.radius!==this.radius||!u.goal||![u.x,u.y,u.goal.x,u.goal.y].every(Number.isFinite)||Math.hypot(u.goal.x-this.goal.x,u.goal.y-this.goal.y)>1||Math.hypot(u.x-this.start.x,u.y-this.start.y)>32||!u.alive||u.downed))this.cancel('stale');
    let used=0;
    if(this.status==='running'&&this.phase==='grid'){
      while(used<budget&&this.cursor<this.rows*this.cols){const i=this.cursor++,x=i%this.cols,y=Math.floor(i/this.cols),p=this.point(x,y);this.grid[y][x]=this.free(p.x,p.y,this.radius+CELL*Math.SQRT2/2)?0:1;used++;}
      if(this.cursor===this.rows*this.cols){
        const a=this.nearest(this.start),b=this.nearest(this.goal);
        if(!a||!b||!this.free(this.start.x,this.start.y)||!this.free(this.goal.x,this.goal.y)){this.status='failed';this.reason='no accessible grid node';}
        else {this.finder=new EasyStar.js();this.finder.setGrid(this.grid);this.finder.setAcceptableTiles([0]);this.finder.enableDiagonals();this.finder.disableCornerCutting();
          this.finder.findPath(a.x,a.y,b.x,b.y,path=>{if(!path){this.status='failed';this.reason='no path';return;}
            const points=path.map(p=>this.point(p.x,p.y));points.push(this.goal);let previous=this.start;
            for(const p of points){if(!this.edge(previous,p)){this.status='failed';this.reason='invalid geometry';return;}previous=p;}
            this.path=points;this.status='found';});this.phase='search';}
      }
    }
    if(this.status==='running'&&this.phase==='search'&&used<budget){const n=budget-used;this.finder.setIterationsPerCalculation(n);this.finder.calculate();used+=n;this.expanded+=n;}
    this.operations+=used;return {status:this.status,used,path:this.path,reason:this.reason,expanded:this.expanded};
  }
}
