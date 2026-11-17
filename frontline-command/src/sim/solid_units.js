// Experimental circular 2D colliders; sprites and unit radii are unchanged.
// Existing overlap may only be reduced, allowing recovery rather than locking.

// Look ahead along the bot's intended direction. Aim for a short waypoint on
// the right of the first nearby occupied circle. Opposing traffic chooses
// opposite world-space sides; if the waypoint is blocked, movement checks below
// still make the bot wait rather than crossing a body or a wall.
export function occupiedDetour(game,u,dx,dy,grid,candidates=null) {
  const length=Math.hypot(dx,dy);
  if(length<1e-9 || u.playerControlled)return null;
  const fx=dx/length,fy=dy/length,px=-fy,py=fx;
  let best=null,bestAlong=Infinity;
  for(const o of candidates || grid.query(u.x,u.y,u.radius+160)) {
    if(o===u||!o.alive||o.downed)continue;
    const ox=o.x-u.x,oy=o.y-u.y,along=ox*fx+oy*fy,side=ox*px+oy*py;
    const r=u.radius+o.radius;
    if(along<=0||along>r+28||Math.abs(side)>r+6||Math.hypot(ox,oy)<r)continue;
    if(along<bestAlong){bestAlong=along;best={o,r};}
  }
  if(!best)return null;
  const gap=best.r+6;
  return {x:best.o.x+fx*gap+px*gap-u.x,y:best.o.y+fy*gap+py*gap-u.y};
}
export function blockingUnit(game,u,x,y,clearance=0,grid=game.unitGrid,candidates=null) {
  const dx=x-u.x,dy=y-u.y,den=dx*dx+dy*dy;
  const reach=Math.sqrt(den)+u.radius+128+clearance;
  const minX=Math.min(u.x,x),maxX=Math.max(u.x,x),minY=Math.min(u.y,y),maxY=Math.max(u.y,y);
  for(const o of candidates || grid.query(u.x,u.y,reach)) {
    if(o===u || !o.alive || o.downed) continue;
    const r=u.radius+o.radius+clearance;
    // If the center is outside the swept segment's expanded bounding box,
    // the circles cannot intersect; avoid the more expensive projection.
    if(o.x<minX-r || o.x>maxX+r || o.y<minY-r || o.y>maxY+r)continue;
    const ox=u.x-o.x,oy=u.y-o.y;
    const start2=ox*ox+oy*oy,end2=(x-o.x)**2+(y-o.y)**2;
    if(start2<r*r) {
      if(end2<start2 || ox*dx+oy*dy<0) return o;
    } else {
      const t=den ? Math.max(0,Math.min(1,-(ox*dx+oy*dy)/den)) : 0;
      if((ox+dx*t)**2+(oy+dy*t)**2<r*r)return o;
    }
  }
  return null;
}
export function solidUnitMoveFree(game,u,x,y,clearance=0,grid=game.unitGrid,candidates=null) {
  return !blockingUnit(game,u,x,y,clearance,grid,candidates);
}
