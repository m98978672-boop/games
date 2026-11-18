// Research profile: add two hex columns/rows on each side, shift the old
// world and all map features together. This does not migrate old saves.
export function expandedMapConfig(cfg){
 const s=structuredClone(cfg.sectors),old=s.hex,size=old.size,dx=1216,dy=1408;
 if(size!==400||s.map.tile!==32||s.map.width!==4096||s.map.height!==4096)throw Error('unsupported source map');
 s.map.width+=2*dx;s.map.height+=2*dy;
 s.hex={...old,cols:old.cols+4,rows:old.rows+4,originX:old.originX+dx-3*size,originY:old.originY+dy-2*size*Math.sqrt(3)};
 for(const p of s.points){p.x+=dx;p.y+=dy;}
 for(const road of s.roads)for(const point of road){point[0]+=dx;point[1]+=dy;}
 s.river.baseX+=dx;s.river.phase-=dy/s.river.period;
 return {...cfg,sectors:s};
}
