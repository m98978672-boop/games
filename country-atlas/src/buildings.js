/* Дома получают первые «краски»: цвет стен, крыша, этажи, тёплые окна. */
import * as THREE from 'three';
import { PALETTE } from './palette.js';

const HOUSES = [
  { x: -40, z: -30, w: 14, d: 11, floors: 3, style: 0, roof: 0 },
  { x: -18, z: -52, w: 11, d: 10, floors: 2, style: 1, roof: 2 },
  { x: -54, z: -10, w: 16, d: 12, floors: 4, style: 2, roof: 1 },
  { x: 12, z: -34, w: 12, d: 9, floors: 3, style: 3, roof: 0 },
  { x: 40, z: -8, w: 18, d: 14, floors: 5, style: 4, roof: 1 },
  { x: 30, z: 34, w: 13, d: 10, floors: 2, style: 1, roof: 3 }
];

export function buildHouses(scene, terrain) {
  const group = new THREE.Group();
  group.name = 'houses';
  scene.add(group);
  const floorH = 3;

  for (const h of HOUSES) {
    const base = terrain.heightAtWorld(h.x, h.z);
    if (base < 2.6) continue;
    const H = h.floors * floorH;

    const walls = new THREE.Mesh(
      new THREE.BoxGeometry(h.w, H, h.d),
      new THREE.MeshLambertMaterial({ color: PALETTE.wall[h.style % PALETTE.wall.length] })
    );
    walls.position.set(h.x, base + H / 2, h.z);
    walls.castShadow = true; walls.receiveShadow = true;
    group.add(walls);

    const roofH = 2.2 + (h.floors > 3 ? 1.4 : 0);
    const roof = new THREE.Mesh(
      new THREE.ConeGeometry(Math.max(h.w, h.d) * 0.72, roofH, 4),
      new THREE.MeshLambertMaterial({ color: PALETTE.roof[h.roof % PALETTE.roof.length] })
    );
    roof.position.set(h.x, base + H + roofH / 2, h.z);
    roof.rotation.y = Math.PI / 4;
    roof.castShadow = true;
    group.add(roof);

    // этажи — тонкие линии, чтобы читалась высота
    const edges = new THREE.EdgesGeometry(new THREE.BoxGeometry(h.w + 0.02, H, h.d + 0.02));
    const lines = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: 0x3a3a3a, transparent: true, opacity: 0.35 }));
    lines.position.copy(walls.position);
    group.add(lines);

    // окна: тёплые полосы по фасаду
    const winMat = new THREE.MeshBasicMaterial({ color: 0xffd27a });
    for (let f = 0; f < h.floors; f++) {
      const y = base + f * floorH + 1.7;
      const row = new THREE.Mesh(new THREE.PlaneGeometry(h.w * 0.72, 0.55), winMat);
      row.position.set(h.x, y, h.z + h.d / 2 + 0.03);
      group.add(row);
    }
  }
  return group;
}
