// Experimental circular 2D colliders; sprites and unit radii are unchanged.
// Existing overlap may only be reduced, allowing recovery rather than locking.
export function solidUnitMoveFree(game,u,x,y) {
  const dx=x-u.x,dy=y-u.y,den=dx*dx+dy*dy;
  const reach=Math.sqrt(den)+u.radius+128;
  for(const o of game.unitGrid.query(u.x,u.y,reach)) {
    if(o===u || !o.alive || o.downed) continue;
    const ox=u.x-o.x,oy=u.y-o.y,r=u.radius+o.radius;
    const start2=ox*ox+oy*oy,end2=(x-o.x)**2+(y-o.y)**2;
    if(start2<r*r) {
      if(end2<start2 || ox*dx+oy*dy<0) return false;
    } else {
      const t=den ? Math.max(0,Math.min(1,-(ox*dx+oy*dy)/den)) : 0;
      if((ox+dx*t)**2+(oy+dy*t)**2<r*r)return false;
    }
  }
  return true;
}
