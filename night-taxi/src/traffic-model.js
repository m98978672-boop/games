import * as THREE from 'three';

// Adapted from road-tycoon/src/view3d.js: combine coloured vehicle parts into one mesh.
export function mergedBoxes(parts) {
    const pos = [], nor = [], col = [], idx = [];
    let vi = 0;
    for (const p of parts) {
      const hx = p.w / 2, hy = p.h / 2, hz = p.d / 2;
      const c = new THREE.Color(p.color || '#ffffff');
      const faces = [
        [[-hx, -hy, hz], [hx, -hy, hz], [hx, hy, hz], [-hx, hy, hz], [0, 0, 1]],
        [[hx, -hy, -hz], [-hx, -hy, -hz], [-hx, hy, -hz], [hx, hy, -hz], [0, 0, -1]],
        [[hx, -hy, hz], [hx, -hy, -hz], [hx, hy, -hz], [hx, hy, hz], [1, 0, 0]],
        [[-hx, -hy, -hz], [-hx, -hy, hz], [-hx, hy, hz], [-hx, hy, -hz], [-1, 0, 0]],
        [[-hx, hy, hz], [hx, hy, hz], [hx, hy, -hz], [-hx, hy, -hz], [0, 1, 0]],
        [[-hx, -hy, -hz], [hx, -hy, -hz], [hx, -hy, hz], [-hx, -hy, hz], [0, -1, 0]],
      ];
      for (const f of faces) {
        const n = f[4];
        for (let i = 0; i < 4; i++) {
          pos.push(p.x + f[i][0], p.y + f[i][1], p.z + f[i][2]);
          nor.push(n[0], n[1], n[2]);
          col.push(c.r, c.g, c.b);
        }
        idx.push(vi, vi + 1, vi + 2, vi, vi + 2, vi + 3);
        vi += 4;
      }
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3));
    g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
    g.setIndex(idx);
    return g;
  }


export function createTrafficGeometry(color) {
  const parts=[
    {x:0,y:.8,z:0,w:1.95,h:.65,d:4.2,color},
    {x:0,y:1.35,z:-.15,w:1.7,h:.52,d:2.25,color:'#607b83'},
    {x:0,y:1.65,z:-.15,w:1.8,h:.1,d:2.3,color},
    {x:0,y:.68,z:2.13,w:1.35,h:.16,d:.08,color:'#1c2528'},
    {x:0,y:.6,z:-2.13,w:1.8,h:.12,d:.08,color:'#a8b6b5'},
  ];
  for(const side of [-1,1]) {
    for(const z of [-1.32,1.32]) parts.push({x:side*.98,y:.4,z,w:.25,h:.72,d:.7,color:'#20262c'});
    parts.push({x:side*.65,y:.93,z:2.14,w:.48,h:.18,d:.08,color:'#ffe6a8'});
    parts.push({x:side*.65,y:.93,z:-2.14,w:.48,h:.18,d:.08,color:'#aa2920'});
  }
  return mergedBoxes(parts);
}
