import { JSDOM } from 'jsdom';
const dom = new JSDOM('<!doctype html><html><body></body></html>', { pretendToBeVisual: true });
global.window = dom.window; global.document = dom.window.document;
const grad = { addColorStop() {} };
dom.window.HTMLCanvasElement.prototype.getContext = () => new Proxy({ canvas:{width:256,height:256}, createLinearGradient:()=>grad, createRadialGradient:()=>grad }, {
  get(o,k){ if(k in o) return o[k]; if(typeof k==='string'){ o[k]=()=>undefined; return o[k]; } },
  set(o,k,v){ o[k]=v; return true; }
});
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
const THREE = await import('three');
const { SVGRenderer } = await import('three/examples/jsm/renderers/SVGRenderer.js');
const { TruckView } = await import('../src/world/truck3d.js');

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x93a9b8);
scene.add(new THREE.HemisphereLight(0xffffff, 0x445533, 2.2));
const sun = new THREE.DirectionalLight(0xffffff, 2.4); sun.position.set(60, 120, 80); scene.add(sun);

const tv = new TruckView(scene, 0x2f7fa8);
tv.root.updateMatrixWorld(true);
// SVGRenderer не умеет физические материалы — подменяем на стандартные с тем же цветом,
// иначе на превью часть кузова рисуется чёрным.
if (process.env.CODE) {
  // раскраска по материалам: помогает понять, из чего собрана поверхность
  const palette = [0xff5555, 0x55ff55, 0x5555ff, 0xffff55, 0xff55ff, 0x55ffff, 0xff9955, 0x9955ff, 0xffffff, 0x888888, 0x33aa66, 0xaa3366];
  const seen = new Map();
  tv.root.traverse((o) => {
    if (!o.isMesh) return;
    const key = (Array.isArray(o.material) ? o.material[0] : o.material).uuid;
    if (!seen.has(key)) {
      const base = Array.isArray(o.material) ? o.material[0] : o.material;
      console.log('MAT', seen.size, '#' + (base.color ? base.color.getHexString() : '???'), base.type);
      seen.set(key, palette[seen.size % palette.length]);
    }
    o.material = new THREE.MeshBasicMaterial({ color: seen.get(key) });
  });
}
tv.root.traverse((o) => {
  if (!o.isMesh) return;
  const conv = (mat) => {
    if (mat && mat.isMeshPhysicalMaterial) {
      const std = new THREE.MeshStandardMaterial({ color: mat.color, roughness: mat.roughness, metalness: mat.metalness, map: mat.map });
      return std;
    }
    return mat;
  };
  o.material = Array.isArray(o.material) ? o.material.map(conv) : conv(o.material);
});

// земля
const g = new THREE.Mesh(new THREE.PlaneGeometry(400, 400, 80, 80), new THREE.MeshBasicMaterial({ color: 0x7f8f74 }));
g.rotation.x = -Math.PI/2; g.position.y = 0; scene.add(g);

// дорога: сегментированная полоса, чтобы сортировка SVG была корректной
const road = new THREE.Mesh(new THREE.PlaneGeometry(9, 400, 4, 120), new THREE.MeshBasicMaterial({ color: 0x4b4f52 }));
road.rotation.x = -Math.PI/2; road.position.set(0, 0.02, 0); scene.add(road);
const dashLine = new THREE.Mesh(new THREE.PlaneGeometry(0.14, 400, 1, 120), new THREE.MeshBasicMaterial({ color: 0xe8e8dc }));
dashLine.rotation.x = -Math.PI/2; dashLine.position.set(4.4, 0.03, 0); scene.add(dashLine);
const dashLine2 = dashLine.clone(); dashLine2.position.x = -4.4; scene.add(dashLine2);

let n = 0;
function shot(name, pos, look, fov = 60) {
  const cam = new THREE.PerspectiveCamera(fov, 16/9, 0.05, 5000);
  cam.position.copy(pos); cam.lookAt(look); cam.updateMatrixWorld(true); cam.updateProjectionMatrix();
  const r = new SVGRenderer(); r.setSize(900, 506); r.setClearColor(new THREE.Color(0x93a9b8));
  r.render(scene, cam);
  let svg = r.domElement.outerHTML.replace('<svg ', '<svg xmlns="http://www.w3.org/2000/svg" ');
  fs.writeFileSync(`tests/_v-${name}.svg`, svg);
  n++;
}
const local = (x,y,z) => { const v = new THREE.Vector3(x,y,z); tv.root.localToWorld(v); return v; };
const lookLocal = (x,y,z) => { const v = new THREE.Vector3(x,y,z); tv.root.localToWorld(v); return v; };

// глаз водителя
shot('eye', local(-0.55, 2.5, 1.35), lookLocal(-0.52, 2.35, 30), 62);
// глаз влево
shot('eye-left', local(-0.55, 2.5, 1.35), lookLocal(-30, 2.0, 1.35), 66);
// глаз вниз (торпедо)
shot('eye-down', local(-0.55, 2.5, 1.35), lookLocal(-0.55, 1.7, 3.0), 70);
// сверху
shot('top', new THREE.Vector3(0, 26, -4), new THREE.Vector3(0, 0, -4), 50);
// сбоку
shot('side', new THREE.Vector3(18, 2.2, -3), new THREE.Vector3(0, 1.6, -3), 45);
// спереди
shot('front', new THREE.Vector3(0, 2.6, 14), new THREE.Vector3(0, 1.7, 0), 45);
// сзади
shot('rear', new THREE.Vector3(0, 3.2, -24), new THREE.Vector3(0, 1.7, -6), 45);
// детальные ракурсы кабины (без прицепа)
tv.trailerGroup.visible = false;
if (process.env.NOINT) tv.interior.visible = false;
shot('cabside', new THREE.Vector3(7.5, 2.3, 2.0), new THREE.Vector3(0, 1.7, 1.8), 38);
shot('cabfront', new THREE.Vector3(-3.2, 1.8, 8.2), new THREE.Vector3(0, 1.4, 3.0), 40);
shot('cab34', new THREE.Vector3(-6.4, 3.6, 7.4), new THREE.Vector3(0.2, 1.5, 1.4), 42);
tv.trailerGroup.visible = true;
console.log('views:', n);
process.exit(0);
