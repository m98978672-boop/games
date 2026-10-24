// ============================================================
//  Герой: модель, физика ходьбы, камера от третьего лица.
// ============================================================

import * as THREE from 'three';
import { CONFIG, COLORS } from './config.js';
import { clamp } from './noise.js';

const P = CONFIG.player;

function limb(w, h, d, color) {
  const mat = new THREE.MeshStandardMaterial({ color, roughness: 0.85, flatShading: true });
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

export class Player {
  constructor(scene) {
    this.scene = scene;
    this.position = new THREE.Vector3(0, 0, 0);
    this.velocity = new THREE.Vector3();
    this.yaw = 0;
    this.pitch = 0.42;
    this.facing = 0;
    this.stamina = 100;
    this.grounded = true;
    this.swimming = false;
    this.wading = 0;
    this.bobPhase = 0;
    this.landShake = 0;

    this.buildModel();
  }

  buildModel() {
    const g = new THREE.Group();
    const skinMat = new THREE.MeshStandardMaterial({ color: COLORS.skin, roughness: 0.75, flatShading: true });
    const shirtMat = new THREE.MeshStandardMaterial({ color: 0x8a6b45, roughness: 0.9, flatShading: true });
    const pantsMat = new THREE.MeshStandardMaterial({ color: COLORS.pants, roughness: 0.9, flatShading: true });
    const packMat = new THREE.MeshStandardMaterial({ color: 0x6b5235, roughness: 0.95, flatShading: true });

    // корпус
    const torso = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.62, 0.3), shirtMat);
    torso.position.y = 1.16;
    torso.castShadow = true;
    g.add(torso);

    // пояс
    const belt = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.12, 0.32), pantsMat);
    belt.position.y = 0.85;
    g.add(belt);

    // голова
    const head = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.34, 0.3), skinMat);
    head.position.y = 1.65;
    head.castShadow = true;
    g.add(head);

    // волосы
    const hair = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.12, 0.32), new THREE.MeshStandardMaterial({ color: 0x2c2118, roughness: 1 }));
    hair.position.y = 1.82;
    g.add(hair);

    // рюкзак
    const pack = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.44, 0.2), packMat);
    pack.position.set(0, 1.2, 0.25);
    pack.castShadow = true;
    g.add(pack);

    // руки (с шарниром в плече)
    this.armL = new THREE.Group();
    this.armL.position.set(-0.295, 1.44, 0);
    const armMeshL = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.6, 0.18), skinMat);
    armMeshL.position.y = -0.3;
    armMeshL.castShadow = true;
    this.armL.add(armMeshL);
    g.add(this.armL);

    this.armR = new THREE.Group();
    this.armR.position.set(0.295, 1.44, 0);
    const armMeshR = armMeshL.clone();
    this.armR.add(armMeshR);
    g.add(this.armR);

    // ноги
    this.legL = new THREE.Group();
    this.legL.position.set(-0.14, 0.82, 0);
    const legMeshL = new THREE.Mesh(new THREE.BoxGeometry(0.19, 0.8, 0.2), pantsMat);
    legMeshL.position.y = -0.4;
    legMeshL.castShadow = true;
    this.legL.add(legMeshL);
    g.add(this.legL);

    this.legR = new THREE.Group();
    this.legR.position.set(0.14, 0.82, 0);
    const legMeshR = legMeshL.clone();
    this.legR.add(legMeshR);
    g.add(this.legR);

    // --- предмет в правой руке ---
    this.handSlot = new THREE.Group();
    this.handSlot.position.set(0, -0.5, 0.06);
    this.handSlot.rotation.x = 0.25;
    this.armR.add(this.handSlot);
    this.equippedId = null;
    this.equippedMesh = null;

    this.swingPhase = -1;      // -1 — покой, 0..1 — замах
    this.swingSpeed = 3.4;

    this.model = g;
    this.scene.add(g);
  }

  /** Что держим в руке. Модели простые: палка + наконечник/лезвие. */
  setEquipped(itemId) {
    if (this.equippedId === itemId) return;
    this.equippedId = itemId;
    if (this.equippedMesh) {
      this.handSlot.remove(this.equippedMesh);
      this.equippedMesh.traverse((o) => { o.geometry?.dispose?.(); });
      this.equippedMesh = null;
    }
    if (!itemId) return;

    const group = new THREE.Group();
    const woodMat = new THREE.MeshStandardMaterial({ color: 0x8a6a42, roughness: 0.95, flatShading: true });
    const stoneMat = new THREE.MeshStandardMaterial({ color: 0xb9c0c8, roughness: 0.6, flatShading: true });

    const stick = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.045, 0.95, 5), woodMat);
    stick.rotation.x = Math.PI / 2.4;
    stick.position.set(0, 0, 0.28);
    stick.castShadow = true;
    group.add(stick);

    if (itemId === 'knife' || itemId === 'spear' || itemId === 'axe' || itemId === 'pickaxe') {
      const head = new THREE.Mesh(
        itemId === 'spear'
          ? new THREE.ConeGeometry(0.06, 0.34, 4)
          : new THREE.BoxGeometry(0.06, itemId === 'axe' ? 0.26 : 0.2, itemId === 'pickaxe' ? 0.3 : 0.12),
        stoneMat
      );
      head.position.set(0, 0.12, itemId === 'spear' ? 0.86 : 0.6);
      head.rotation.x = itemId === 'spear' ? 0 : 0.3;
      head.castShadow = true;
      group.add(head);
    }

    if (itemId === 'torch') {
      const flame = new THREE.Mesh(
        new THREE.ConeGeometry(0.09, 0.26, 5),
        new THREE.MeshBasicMaterial({ color: 0xffcf70 })
      );
      flame.position.set(0, 0.12, 0.78);
      group.add(flame);
      const light = new THREE.PointLight(0xffb35c, 1.7, 11, 2);
      light.position.set(0, 0.3, 0.6);
      group.add(light);
    }

    if (itemId === 'campfireKit') {
      group.clear();
      const stones = new THREE.Mesh(new THREE.TorusGeometry(0.24, 0.07, 5, 8), stoneMat);
      stones.rotation.x = Math.PI / 2;
      group.add(stones);
    }

    this.equippedMesh = group;
    this.handSlot.add(group);
  }

  /** Запустить замах (визуально) */
  swing() {
    if (this.swingPhase < 0) this.swingPhase = 0;
  }

  setPosition(x, z, world) {
    this.position.set(x, world.heightAt(x, z), z);
    this.model.position.copy(this.position);
  }

  /** Поворот камеры/взгляда от движения мыши */
  look(dx, dy) {
    const s = P.mouseSensitivity;
    this.yaw -= dx * s;
    this.pitch = clamp(this.pitch + dy * s, P.cameraMinPitch, P.cameraMaxPitch);
  }

  update(dt, input, world) {
    // --- направление движения относительно взгляда ---
    const sin = Math.sin(this.yaw);
    const cos = Math.cos(this.yaw);
    const fwd = { x: -sin, z: -cos };
    const right = { x: cos, z: -sin };

    let wx = 0;
    let wz = 0;
    if (input.forward) { wx += fwd.x; wz += fwd.z; }
    if (input.back) { wx -= fwd.x; wz -= fwd.z; }
    if (input.left) { wx -= right.x; wz -= right.z; }
    if (input.right) { wx += right.x; wz += right.z; }

    const len = Math.hypot(wx, wz);
    if (len > 0.001) {
      wx /= len;
      wz /= len;
    }

    const moving = len > 0.001;
    const wantSprint = input.sprint && moving && this.stamina > 2 && !this.swimming;
    const sprinting = wantSprint && this.stamina > 0;

    // расход выносливости
    if (sprinting) this.stamina = Math.max(0, this.stamina - CONFIG.needs.staminaDrain * dt);
    else this.stamina = Math.min(100, this.stamina + (moving ? CONFIG.needs.staminaRegen : CONFIG.needs.staminaRegenRest) * dt);

    // --- глубина воды под ногами ---
    const groundHere = world.heightAt(this.position.x, this.position.z);
    this.wading = clamp(-groundHere / 1.1, 0, 1);
    const inWater = groundHere < 0.05;

    let speed = sprinting ? P.sprintSpeed : P.walkSpeed;
    if (inWater) speed = THREE.MathUtils.lerp(speed, P.wadeSpeed, this.wading);

    const targetVX = wx * speed * (moving ? 1 : 0);
    const targetVZ = wz * speed * (moving ? 1 : 0);

    const accel = P.accel * (inWater ? 0.55 : 1);
    this.velocity.x += (targetVX - this.velocity.x) * clamp(accel * dt, 0, 1);
    this.velocity.z += (targetVZ - this.velocity.z) * clamp(accel * dt, 0, 1);

    // --- горизонтальное перемещение с проверкой воды ---
    const nx = this.position.x + this.velocity.x * dt;
    const nz = this.position.z + this.velocity.z * dt;

    const tryMove = (x, z) => {
      if (Math.abs(x) > CONFIG.world.size * 0.75 || Math.abs(z) > CONFIG.world.size * 0.75) return false;
      const h = world.heightAt(x, z);
      if (h < -P.maxDepth) return false;   // слишком глубоко
      if (world.slopeAt(x, z) > 2.4) return false; // почти скала
      return true;
    };

    if (tryMove(nx, this.position.z)) this.position.x = nx;
    else this.velocity.x *= 0.2;
    if (tryMove(this.position.x, nz)) this.position.z = nz;
    else this.velocity.z *= 0.2;

    world.resolveCollisions(this.position, P.radius, this.velocity);

    // --- вертикаль: прилипание к рельефу + прыжок ---
    const ground = world.heightAt(this.position.x, this.position.z);
    const floor = Math.max(ground, CONFIG.world.seaLevel - 0.9);

    if (input.jump && this.grounded) {
      this.velocity.y = P.jumpSpeed;
      this.grounded = false;
    }

    if (!this.grounded) {
      this.velocity.y += P.gravity * dt;
      this.position.y += this.velocity.y * dt;
      if (this.position.y <= floor) {
        this.position.y = floor;
        this.velocity.y = 0;
        this.grounded = true;
        this.landShake = 0.08;
      }
    } else {
      // плавно следуем за рельефом (ступеньки/склоны)
      this.position.y += (floor - this.position.y) * clamp(dt * 16, 0, 1);
      if (floor - this.position.y < -0.6) this.grounded = false;
    }

    this.swimming = ground < -0.6;

    // --- модель: поворот в сторону движения и анимация ---
    const hspeed = Math.hypot(this.velocity.x, this.velocity.z);
    if (hspeed > 0.15) {
      const target = Math.atan2(this.velocity.x, this.velocity.z);
      let diff = target - this.facing;
      while (diff > Math.PI) diff -= Math.PI * 2;
      while (diff < -Math.PI) diff += Math.PI * 2;
      this.facing += diff * clamp(dt * 12, 0, 1);
    }

    this.bobPhase += dt * (2.2 + hspeed * 1.35);
    const swing = Math.sin(this.bobPhase * 3.2) * clamp(hspeed / 6, 0, 1) * 0.85;
    this.legL.rotation.x = swing;
    this.legR.rotation.x = -swing;
    this.armL.rotation.x = -swing * 0.8;

    // замах рукой с инструментом
    let swingArm = swing * 0.8;
    if (this.swingPhase >= 0) {
      this.swingPhase += dt * this.swingSpeed;
      if (this.swingPhase >= 1) this.swingPhase = -1;
      else {
        const p = this.swingPhase;
        const arc = Math.sin(p * Math.PI);
        swingArm = -1.75 * arc;
      }
    }
    this.armR.rotation.x = swingArm;
    this.model.position.copy(this.position);
    if (inWater) this.model.position.y -= this.wading * 0.55;
    this.model.rotation.y = this.facing;
    this.model.position.y += Math.abs(Math.sin(this.bobPhase * 3.2)) * 0.035 * clamp(hspeed / 5, 0, 1);

    this.landShake = Math.max(0, this.landShake - dt);
  }

  /** Позиция камеры: третье лицо с подъёмом над рельефом */
  applyCamera(camera, world, dt) {
    const sin = Math.sin(this.yaw);
    const cos = Math.cos(this.yaw);
    const fwd = new THREE.Vector3(-sin, 0, -cos);
    const target = this.position.clone().add(new THREE.Vector3(0, 1.45, 0));

    const dist = P.cameraDistance;
    const horiz = Math.cos(this.pitch) * dist;
    const vert = Math.sin(this.pitch) * dist;

    const desired = target.clone().addScaledVector(fwd, -horiz);
    desired.y += vert;

    // не проваливаться под землю
    const h = world.heightAt(desired.x, desired.z);
    if (desired.y < h + 0.7) desired.y = h + 0.7;
    if (desired.y < CONFIG.world.seaLevel + 0.5) desired.y = CONFIG.world.seaLevel + 0.5;

    camera.position.lerp(desired, clamp(dt * 14, 0, 1));
    camera.lookAt(target);
  }
}
