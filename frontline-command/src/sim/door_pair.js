// Experimental passing lanes for exactly two allied infantry at one doorway.
// It is deliberately not a general crowd or combat planner.
function usable(u) {
  return !!u && u.alive && !u.downed && !u.isVehicle && !u.playerControlled && !u.perception?.hasContact && !!u.goal;
}
function clear(u) { u._doorPass = null; }
function occupied(game,u,partner) {
  return game.unitGrid.query(u.x,u.y,220).some(o=>o!==u && o!==partner && o.alive && !o.downed && Math.hypot(o.x-u.x,o.y-u.y)<220);
}
function routing(u) { return !!(u.detour || u._crowdActive || u._smartRoute); }
function goalMatches(u, p) { return u.goal && Math.hypot(u.goal.x-p.gx,u.goal.y-p.gy)<1; }
function waypoint(game,u) {
  const p=u._doorPass;
  const building=game.world.buildings?.find(b=>b.id===p?.buildingId);
  const partner=p && game.unitById(p.partnerId);
  const opening=building && game.walls.state(building)?.outline.openings.find(o=>o.id===p.openingId);
  if (!p || !usable(u) || !goalMatches(u,p) || !usable(partner) || partner.faction!==u.faction || routing(u) || routing(partner) || occupied(game,u,partner) || occupied(game,partner,u) ||
      Math.hypot(partner.goal.x-p.partnerGx,partner.goal.y-p.partnerGy)>=1 ||
      !building || building.dead || !building.built || !opening || opening.type!=='door' || !opening.move ||
      building.x+opening.cx!==p.px || building.y+opening.cy!==p.py || opening.nx!==p.nx || opening.ny!==p.ny || !game.walls.enabled()) {
    if(p) clear(u);return null;
  }
  const along=(u.x-p.px)*p.nx+(u.y-p.py)*p.ny;
  if (p.side*along < -55) { clear(u);return null; }
  return {x:p.px-p.side*p.nx*65-p.ny*p.side*p.offset,y:p.py-p.side*p.ny*65+p.nx*p.side*p.offset};
}
export function doorPairWaypoint(game,u) {
  if (!game.cfg.flag('door_pair_lanes_v1',false) || !game.cfg.flag('pathing_v2',false) ||
      !game.cfg.flag('wall_collision_v2',false) || !game.walls?.enabled() || !usable(u)) {
    if(u._doorPass)clear(u);return null;
  }
  if(u._doorPass)return waypoint(game,u);
  if(routing(u)) return null;
  const near=game.unitGrid.query(u.x,u.y,220).filter(o=>o!==u&&o.alive&&!o.downed&&Math.hypot(o.x-u.x,o.y-u.y)<220);
  if(near.length!==1) return null; // Do not create pair lanes in columns or combat.
  const other=near[0];if(!usable(other)||other.faction!==u.faction||routing(other)||other._doorPass||occupied(game,other,u))return null;
  const bu=game.walls.buildingAtPoint?.(u.x,u.y),bg=game.walls.buildingAtPoint?.(u.goal.x,u.goal.y);
  const b=bu&&bu!==bg?bu:!bu&&bg?bg:null;if(!b)return null;
  const st=game.walls.state(b);if(!st)return null;
  const doors=(st.outline.openings||[]).filter(o=>o.type==='door'&&o.move&&o.width>=2*(u.radius+other.radius+4));
  const score=o=>Math.hypot(u.x-b.x-o.cx,u.y-b.y-o.cy)+Math.hypot(u.goal.x-b.x-o.cx,u.goal.y-b.y-o.cy);
  doors.sort((a,c)=>score(a)-score(c));const o=doors[0];if(!o)return null;
  const px=b.x+o.cx,py=b.y+o.cy,nx=o.nx,ny=o.ny;
  const along=v=>(v.x-px)*nx+(v.y-py)*ny;
  const lateral=v=>Math.abs(-(v.x-px)*ny+(v.y-py)*nx);
  const a=along(u),c=along(other),ga=along(u.goal),gc=along(other.goal);
  if(a*c>=0 || a*ga>=0 || c*gc>=0 || Math.abs(a)>120 || Math.abs(c)>120 || lateral(u)>30 || lateral(other)>30) return null;
  // Opposite lanes leave a small gap between equal-radius infantry.
  const offset=(u.radius+other.radius)/2+3;
  if(offset+Math.max(u.radius,other.radius)+2>=o.width/2)return null;
  const set=(v,partner,side)=>{v._doorPass={buildingId:b.id,openingId:o.id,partnerId:partner.id,px,py,nx,ny,side,offset,
    gx:v.goal.x,gy:v.goal.y,partnerGx:partner.goal.x,partnerGy:partner.goal.y};};
  set(u,other,Math.sign(a));set(other,u,Math.sign(c));
  return waypoint(game,u);
}

export function doorPairPositionFree(game,u,x,y) {
  if(!u._doorPass) return true;
  return !game.unitGrid.query(u.x,u.y,80).some(o=>{
    if(o===u||!o.alive||o.downed)return false;
    const old=Math.hypot(u.x-o.x,u.y-o.y),next=Math.hypot(x-o.x,y-o.y),min=u.radius+o.radius+0.01;
    return old>=min ? next<min : next<old;
  });
}
