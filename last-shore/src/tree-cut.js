// Удаляет небольшую призму из геометрии ствола: кромки исходных
// треугольников разрезаются, а цвет, UV и нормали интерполируются.
import * as THREE from 'three';

export function notchTreeGeometry(source, angle, progress) {
  const attrs = Object.entries(source.attributes).filter(([, a]) => !a.isInterleavedBufferAttribute);
  const posIndex = attrs.findIndex(([name]) => name === 'position');
  if (posIndex < 0) return source.clone();
  const pos = attrs[posIndex][1], c = Math.cos(angle), s = Math.sin(angle);
  let radius = 0;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i);
    if (y > 0.45 && y < 1.4 && x*x + z*z < 2.25) radius = Math.max(radius, x*c + z*s);
  }
  radius = Math.max(0.18, Math.min(0.9, radius || 0.3));
  const depth = Math.max(0.05, Math.min(0.95, progress));
  const back = radius * (0.94 - 1.8 * depth);
  const half = radius * (0.55 + 0.6 * depth);
  const low = 0.65 - depth * 0.12, high = 0.95 + depth * 0.25;
  const planes = [
    [(v) => v[0]*c + v[2]*s - back],
    [(v) => radius*2.4 - (v[0]*c + v[2]*s)],
    [(v) => (-v[0]*s + v[2]*c) + half],
    [(v) => half - (-v[0]*s + v[2]*c)],
    [(v) => v[1] - low], [(v) => high - v[1]],
  ];
  const arrays = attrs.map(() => []);
  const vertex = (index) => attrs.map(([,a]) => Array.from({length:a.itemSize},(_,i)=>a.array[index*a.itemSize+i]));
  const mix = (a,b,t) => a.map((part,k) => part.map((v,i)=>v+(b[k][i]-v)*t));
  const split = (poly, distance) => {
    const inside=[], outside=[];
    for (let i=0;i<poly.length;i++) {
      const a=poly[i], b=poly[(i+1)%poly.length];
      const da=distance(a[posIndex]), db=distance(b[posIndex]);
      const ai=da>=0, bi=db>=0;
      (ai?inside:outside).push(a);
      if (ai!==bi) { const v=mix(a,b,da/(da-db));inside.push(v);outside.push(v); }
    }
    return [inside,outside];
  };
  const count=source.index ? source.index.count : pos.count;
  for (let i=0;i<count;i+=3) {
    const ids=[0,1,2].map(j=>source.index ? source.index.getX(i+j) : i+j);
    let inside=ids.map(vertex);const out=[];
    for (const [distance] of planes) {
      if (inside.length<3) break;
      const [next, outside]=split(inside,distance);inside=next;
      if(outside.length>=3) out.push(outside);
    }
    for (const poly of out) for (let j=1;j+1<poly.length;j++) {
      for (const v of [poly[0],poly[j],poly[j+1]]) for (let k=0;k<attrs.length;k++) arrays[k].push(...v[k]);
    }
  }
  const result=new THREE.BufferGeometry();
  for(let i=0;i<attrs.length;i++) {
    const [name, old]=attrs[i];
    result.setAttribute(name,new THREE.BufferAttribute(new old.array.constructor(arrays[i]),old.itemSize,old.normalized));
  }
  result.computeBoundingSphere();
  result.userData.notch={ radius, back, half, low, high, angle, progress:depth };
  return result;
}
