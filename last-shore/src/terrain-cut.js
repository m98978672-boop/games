// Вырезание метровых ячеек только из затронутых треугольников рельефа.
// Остальная крупная сетка и её цвет, UV и веса материала не изменяются.
import * as THREE from 'three';

export function cutTerrain(geometry, baseIndex, gridSize, step, size, rectangles) {
  const baseCount = gridSize * gridSize;
  const attributes = Object.entries(geometry.attributes).filter(([, a]) => !a.isInterleavedBufferAttribute);
  const arrays = attributes.map(([, a]) => Array.from(a.array.slice(0, baseCount * a.itemSize)));
  const positionIndex = attributes.findIndex(([name]) => name === 'position');
  const position = arrays[positionIndex];
  const getVertex = index => attributes.map(([, attr], a) => arrays[a].slice(index * attr.itemSize, (index + 1) * attr.itemSize));
  const mix = (a, b, t) => a.map((part, k) => part.map((v, i) => v + (b[k][i] - v) * t));
  const split = (poly, axis, value, keepGreater) => {
    const inside = [], outside = [];
    for (let i=0;i<poly.length;i++) {
      const a=poly[i], b=poly[(i+1)%poly.length];
      const av=a[positionIndex][axis], bv=b[positionIndex][axis];
      const ai=keepGreater ? av >= value : av <= value;
      const bi=keepGreater ? bv >= value : bv <= value;
      (ai ? inside : outside).push(a);
      if (ai !== bi) { const v=mix(a,b,(value-av)/(bv-av));inside.push(v);outside.push(v); }
    }
    return [inside, outside];
  };
  const subtract = (poly, r) => {
    let inside=poly; const remaining=[];
    for (const [axis,value,greater] of [[0,r.x0,true],[0,r.x1,false],[2,r.z0,true],[2,r.z1,false]]) {
      if (inside.length < 3) break;
      const [next, outside] = split(inside,axis,value,greater);
      if (outside.length >= 3) remaining.push(outside);
      inside=next;
    }
    return remaining;
  };
  const buckets = new Map();
  const key=(x,z)=>x*1024+z;
  for(const r of rectangles) {
    const minX=Math.max(0,Math.floor((r.x0 + size/2)/step));
    const maxX=Math.min(gridSize-2,Math.floor((r.x1 + size/2-1e-8)/step));
    const minZ=Math.max(0,Math.floor((r.z0 + size/2)/step));
    const maxZ=Math.min(gridSize-2,Math.floor((r.z1 + size/2-1e-8)/step));
    for(let x=minX;x<=maxX;x++) for(let z=minZ;z<=maxZ;z++) {
      const k=key(x,z);let bucket=buckets.get(k);if(!bucket)buckets.set(k,bucket=[]);bucket.push(r);
    }
  }
  const out=[];
  for(let q=0;q<baseIndex.length;q+=6) {
    const v=baseIndex[q], ix=v%gridSize, iz=(v-ix)/gridSize;
    const candidates=buckets.get(key(ix,iz));
    if(!candidates) {for(let j=0;j<6;j++)out.push(baseIndex[q+j]);continue;}
    for(let j=0;j<6;j+=3) {
      let polygons=[[getVertex(baseIndex[q+j]),getVertex(baseIndex[q+j+1]),getVertex(baseIndex[q+j+2])]];
      for(const r of candidates) polygons=polygons.flatMap(poly=>subtract(poly,r));
      for(const poly of polygons) {
        const first=arrays[positionIndex].length / 3;
        for(const vert of poly) for(let a=0;a<attributes.length;a++) arrays[a].push(...vert[a]);
        for(let k=1;k+1<poly.length;k++) {
          const a=poly[0][positionIndex],b=poly[k][positionIndex],c=poly[k+1][positionIndex];
          if(Math.abs((b[0]-a[0])*(c[2]-a[2])-(b[2]-a[2])*(c[0]-a[0]))>1e-9)out.push(first,first+k,first+k+1);
        }
      }
    }
  }
  for(let i=0;i<attributes.length;i++) {
    const [name,old]=attributes[i];
    geometry.setAttribute(name,new THREE.BufferAttribute(new old.array.constructor(arrays[i]),old.itemSize,old.normalized));
  }
  geometry.setIndex(out);
  geometry.computeVertexNormals();
  geometry.computeBoundingSphere();
  return out.length;
}
