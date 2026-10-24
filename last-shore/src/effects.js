// ============================================================
//  Погодные эффекты: дождь, капли на земле.
// ============================================================

import * as THREE from 'three';

export class Rain {
  constructor(scene, count = 1800) {
    this.count = count;
    this.scene = scene;
    this.area = 46;          // радиус зоны дождя вокруг игрока
    this.height = 26;
    this.intensity = 0;

    const positions = new Float32Array(count * 3);
    const speeds = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * this.area * 2;
      positions[i * 3 + 1] = Math.random() * this.height;
      positions[i * 3 + 2] = (Math.random() - 0.5) * this.area * 2;
      speeds[i] = 26 + Math.random() * 16;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    this.speeds = speeds;

    this.material = new THREE.PointsMaterial({
      color: 0xbfd4e0,
      size: 0.09,
      transparent: true,
      opacity: 0,
      depthWrite: false,
      sizeAttenuation: true,
    });

    this.points = new THREE.Points(geo, this.material);
    this.points.frustumCulled = false;
    this.points.renderOrder = 5;
    scene.add(this.points);
  }

  update(dt, center) {
    this.points.position.set(center.x, 0, center.z);
    const pos = this.points.geometry.attributes.position;
    const arr = pos.array;

    for (let i = 0; i < this.count; i++) {
      arr[i * 3 + 1] -= this.speeds[i] * dt;
      arr[i * 3] += dt * 2.5; // снос ветром
      if (arr[i * 3 + 1] < 0) {
        arr[i * 3 + 1] = this.height;
        arr[i * 3] = (Math.random() - 0.5) * this.area * 2;
        arr[i * 3 + 2] = (Math.random() - 0.5) * this.area * 2;
      }
    }
    pos.needsUpdate = true;

    // видимость = интенсивность * число капель
    this.points.geometry.setDrawRange(0, Math.floor(this.count * this.intensity));
    this.material.opacity = 0.55 * this.intensity;
  }

  setIntensity(v) {
    this.intensity = v;
  }
}
