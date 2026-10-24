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
    const bootMat = new THREE.MeshStandardMaterial({ color: 0x3a2c20, roughness: 1, flatShading: true });

    const box = (w, h, d, mat) => {
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
      mesh.castShadow = true;
      return mesh;
    };

    // корпус и голова
    const torso = box(0.52, 0.62, 0.3, shirtMat);
    torso.position.y = 1.16;
    g.add(torso);

    const belt = box(0.5, 0.12, 0.32, pantsMat);
    belt.position.y = 0.85;
    g.add(belt);

    this.head = box(0.32, 0.34, 0.3, skinMat);
    this.head.position.y = 1.65;
    g.add(this.head);

    const hair = box(0.34, 0.12, 0.32, new THREE.MeshStandardMaterial({ color: 0x2c2118, roughness: 1 }));
    hair.position.y = 0.2;
    this.head.add(hair);

    const pack = box(0.38, 0.44, 0.2, packMat);
    pack.position.set(0, 1.2, 0.25);
    g.add(pack);

    // --- руки: плечо -> локоть ---
    const makeArm = (side) => {
      const shoulder = new THREE.Group();
      shoulder.position.set(0.295 * side, 1.44, 0);
      const upper = box(0.15, 0.32, 0.17, shirtMat);
      upper.position.y = -0.15;
      shoulder.add(upper);

      const elbow = new THREE.Group();
      elbow.position.y = -0.31;
      const lower = box(0.13, 0.3, 0.15, skinMat);
      lower.position.y = -0.14;
      elbow.add(lower);

      const hand = box(0.14, 0.12, 0.16, skinMat);
      hand.position.y = -0.3;
      elbow.add(hand);

      shoulder.add(elbow);
      g.add(shoulder);
      return { shoulder, elbow };
    };

    const armL = makeArm(-1);
    const armR = makeArm(1);
    this.armL = armL.shoulder;
    this.armR = armR.shoulder;
    this.elbowL = armL.elbow;
    this.elbowR = armR.elbow;

    // --- ноги: бедро -> колено -> ступня ---
    const makeLeg = (side) => {
      const hip = new THREE.Group();
      hip.position.set(0.14 * side, 0.82, 0);
      const thigh = box(0.2, 0.42, 0.21, pantsMat);
      thigh.position.y = -0.2;
      hip.add(thigh);

      const knee = new THREE.Group();
      knee.position.y = -0.42;
      const shin = box(0.17, 0.38, 0.18, pantsMat);
      shin.position.y = -0.18;
      knee.add(shin);

      const boot = box(0.2, 0.12, 0.28, bootMat);
      boot.position.set(0, -0.4, 0.04);
      knee.add(boot);

      hip.add(knee);
      g.add(hip);
      return { hip, knee };
    };

    const legL = makeLeg(-1);
    const legR = makeLeg(1);
    this.legL = legL.hip;
    this.legR = legR.hip;
    this.kneeL = legL.knee;
    this.kneeR = legR.knee;
    this.torso = torso;

    // --- предмет в правой руке ---
    this.handSlot = new THREE.Group();
    this.handSlot.position.set(0, -0.34, 0.06);
    this.handSlot.rotation.x = 0.3;
    this.elbowR.add(this.handSlot);
    this.equippedId = null;
    this.equippedMesh = null;

    this.swingPhase = -1;      // -1 — покой, 0..1 — удар
    this.swingSpeed = 3.2;
    this.walkPhase = 0;
    this.lean = 0;
    this.landDip = 0;

    this.model = g;
    this.scene.add(g);

    // --- вид от первого лица: руки с инструментом перед камерой ---
    this.viewModel = new THREE.Group();
    this.viewModelHand = new THREE.Group();
    this.viewModel.add(this.viewModelHand);
    this.buildFirstPersonHand(skinMat, shirtMat);
    this.viewModel.position.set(0.26, -0.24, -0.6);
    this.viewModel.rotation.set(0.12, -0.22, -0.08);
    this.viewModel.scale.setScalar(0.78);
    this.viewModel.visible = false;
    this.viewMode = 'third';
    this.headBob = 0;
  }

  /** Рука и предплечье в первом лице: они видны всегда, даже без инструмента */
  buildFirstPersonHand(skinMat, shirtMat) {
    const arm = new THREE.Group();

    const sleeve = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.3, 0.18), shirtMat);
    sleeve.position.set(0.03, -0.16, 0.22);
    sleeve.rotation.x = -0.5;
    arm.add(sleeve);

    const forearm = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.13, 0.34), skinMat);
    forearm.position.set(0.02, -0.05, 0.0);
    forearm.rotation.x = 0.35;
    arm.add(forearm);

    const hand = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.12, 0.15), skinMat);
    hand.position.set(0.01, -0.01, -0.17);
    arm.add(hand);

    this.viewModelHand.add(arm);
  }

  /** Переключить вид: 'third' или 'first' */
  setViewMode(mode, camera) {
    this.viewMode = mode;
    const first = mode === 'first';
    this.model.visible = !first;

    if (first && camera) {
      if (!this.viewModel.parent) camera.add(this.viewModel);
      this.viewModel.visible = true;
      this.scene.add(camera);   // камера должна быть в сцене, чтобы её дети рисовались
    } else {
      this.viewModel.visible = false;
    }
  }

  /** Меш инструмента: палка + наконечник/лезвие + огонь у факела */
  buildItemMesh(itemId) {
    const group = new THREE.Group();
    const woodMat = new THREE.MeshStandardMaterial({ color: 0x8a6a42, roughness: 0.95, flatShading: true });
    const stoneMat = new THREE.MeshStandardMaterial({ color: 0xb9c0c8, roughness: 0.55, flatShading: true });

    if (itemId === 'campfireKit') {
      const stones = new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.06, 5, 9), stoneMat);
      stones.rotation.x = Math.PI / 2;
      group.add(stones);
      return group;
    }

    const stick = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.042, 0.92, 6), woodMat);
    stick.rotation.x = Math.PI / 2.5;
    stick.position.set(0, 0, 0.26);
    stick.castShadow = true;
    group.add(stick);

    if (['knife', 'spear', 'axe', 'pickaxe'].includes(itemId)) {
      const head = new THREE.Mesh(
        itemId === 'spear'
          ? new THREE.ConeGeometry(0.055, 0.34, 5)
          : new THREE.BoxGeometry(0.055, itemId === 'axe' ? 0.26 : 0.19, itemId === 'pickaxe' ? 0.3 : 0.11),
        stoneMat
      );
      head.position.set(0, itemId === 'spear' ? 0.28 : 0.14, itemId === 'spear' ? 0.92 : 0.6);
      head.rotation.x = itemId === 'spear' ? 0.75 : 0.3;
      head.castShadow = true;
      group.add(head);
    }

    if (itemId === 'torch') {
      const flame = new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.3, 6), new THREE.MeshBasicMaterial({ color: 0xffcf70 }));
      flame.position.set(0, 0.16, 0.78);
      group.add(flame);
      const light = new THREE.PointLight(0xffb35c, 1.8, 12, 2);
      light.position.set(0, 0.3, 0.6);
      group.add(light);
    }

    return group;
  }

  /** Что держим в руке: в третьем лице — у кисти, в первом — перед камерой */
  setEquipped(itemId) {
    if (this.equippedId === itemId) return;
    this.equippedId = itemId;

    if (this.handSlot) {
      while (this.handSlot.children.length) {
        const child = this.handSlot.children.pop();
        child.traverse?.((o) => { o.geometry?.dispose?.(); });
      }
    }
    if (this.viewModelItem) {
      this.viewModelHand.remove(this.viewModelItem);
      this.viewModelItem.traverse?.((o) => { o.geometry?.dispose?.(); });
      this.viewModelItem = null;
    }
    this.equippedMesh = null;
    if (!itemId) return;

    const thirdPersonMesh = this.buildItemMesh(itemId);
    this.handSlot.add(thirdPersonMesh);
    this.equippedMesh = thirdPersonMesh;

    const firstPersonMesh = this.buildItemMesh(itemId);
    firstPersonMesh.scale.setScalar(1.15);
    // разворот на 180°, чтобы инструмент смотрел от игрока, а не в камеру
    firstPersonMesh.rotation.set(-0.4, Math.PI, -0.32);
    firstPersonMesh.position.set(0.0, -0.03, -0.14);
    this.viewModelItem = firstPersonMesh;
    this.viewModelHand.add(firstPersonMesh);
  }

  /** Запустить замах */
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

    // --- анимация: шаг с коленями, наклон в беге, замах инструментом ---
    const strideSpeed = hspeed > 5.5 ? 9.5 : 6.4;
    this.walkPhase += dt * strideSpeed * clamp(hspeed / 4, 0, 1.4);
    const speedRatio = clamp(hspeed / 8, 0, 1);

    const sw = Math.sin(this.walkPhase) * (0.45 + speedRatio * 0.7);
    const swOpp = Math.sin(this.walkPhase + Math.PI) * (0.45 + speedRatio * 0.7);

    this.legL.rotation.x = sw;
    this.legR.rotation.x = swOpp;
    this.kneeL.rotation.x = Math.max(0, -Math.sin(this.walkPhase - 0.7)) * (0.35 + speedRatio * 0.75);
    this.kneeR.rotation.x = Math.max(0, -Math.sin(this.walkPhase + Math.PI - 0.7)) * (0.35 + speedRatio * 0.75);

    const idle = Math.sin(this.bobPhase * 1.1) * 0.035;
    this.armL.rotation.x = sw * (0.55 + speedRatio * 0.35) - idle;
    this.armL.rotation.z = -0.06 - speedRatio * 0.05;

    let armRSwing = swOpp * (0.55 + speedRatio * 0.35) + idle;
    this.elbowR.rotation.x = -0.3 - speedRatio * 0.4;

    if (this.swingPhase >= 0) {
      this.swingPhase += dt * this.swingSpeed;
      if (this.swingPhase >= 1) this.swingPhase = -1;
      else {
        const p = this.swingPhase;
        // замах назад -> резкий удар -> возврат
        const arc = p < 0.32
          ? -1.0 * (p / 0.32)
          : Math.sin(((p - 0.32) / 0.68) * Math.PI) * 2.0 - 1.0;
        armRSwing = arc;
        this.elbowR.rotation.x = -0.25 - Math.max(0, arc) * 0.55;
      }
    }
    this.armL.rotation.x += 0;
    this.armR.rotation.x = armRSwing;

    const targetLean = speedRatio * 0.2 + (this.swimming ? 0.12 : 0);
    this.lean += (targetLean - this.lean) * clamp(dt * 6, 0, 1);
    this.torso.rotation.x = this.lean;
    this.torso.rotation.z = Math.sin(this.walkPhase) * 0.03 * speedRatio;

    if (this.head) this.head.rotation.y = Math.sin(this.bobPhase * 0.4) * 0.05 * (1 - speedRatio);

    (this.landDip = Math.max(0, this.landDip - dt * 3));
    const bobY = Math.abs(Math.sin(this.walkPhase)) * 0.05 * speedRatio;
    this.model.position.copy(this.position);
    if (inWater) this.model.position.y -= this.wading * 0.55;
    this.model.position.y += bobY - this.landDip * 0.14;
    this.model.rotation.y = this.facing;

    // руки от первого лица: покачивание, замах, лёгкая инерция
    if (this.viewMode === 'first') {
      const bx = Math.sin(this.walkPhase) * 0.02 * speedRatio;
      const by = Math.abs(Math.cos(this.walkPhase)) * 0.018 * speedRatio;
      const sway = Math.sin(this.bobPhase * 0.9) * 0.005;
      let swing = 0;
      let forward = 0;
      if (this.swingPhase >= 0) {
        const arc = Math.sin(Math.min(1, this.swingPhase) * Math.PI);
        swing = arc;
        forward = -arc * 0.16;
      }
      this.viewModel.position.set(0.26 + bx + sway, -0.24 + by, -0.6 + forward);
      this.viewModel.rotation.set(0.08 + swing * 0.25, -0.22, swing * 0.3);
      this.viewModelHand.rotation.x = swing * 0.7;
    }

    this.landShake = Math.max(0, this.landShake - dt);
  }

  /** Камера: третье лицо или вид от первого лица */
  applyCamera(camera, world, dt) {
    const sin = Math.sin(this.yaw);
    const cos = Math.cos(this.yaw);

    if (this.viewMode === 'first') {
      const eyeY = this.position.y + 1.62 + (this.swimming ? -0.25 : 0);
      const target = new THREE.Vector3(this.position.x, eyeY, this.position.z);
      camera.position.copy(target);
      camera.rotation.set(0, 0, 0);
      camera.rotateY(this.yaw);
      camera.rotateX(-this.pitch);
      // тряска от удара/шага
      const shake = this.landShake > 0 ? this.landShake * 2.4 : 0;
      if (shake > 0) camera.rotateZ(Math.sin(performance.now() * 0.05) * shake * 0.06);
      return;
    }

    const fwd = new THREE.Vector3(-sin, 0, -cos);
    const target = this.position.clone().add(new THREE.Vector3(0, 1.45, 0));

    const dist = P.cameraDistance;
    const horiz = Math.cos(this.pitch) * dist;
    const vert = Math.sin(this.pitch) * dist;

    let cameraDist = dist;

    // если между игроком и камерой ствол/валун — придвигаем камеру
    for (let step = 0.6; step <= dist; step += 0.6) {
      const cx = target.x - fwd.x * Math.cos(this.pitch) * step;
      const cz = target.z - fwd.z * Math.cos(this.pitch) * step;
      let blocked = false;
      for (const c of world.colliders) {
        if (c.disabled) continue;
        const dx = c.x - cx;
        const dz = c.z - cz;
        if (dx * dx + dz * dz < (c.r + 0.45) * (c.r + 0.45)) { blocked = true; break; }
      }
      if (blocked) { cameraDist = Math.max(1.6, step - 0.8); break; }
    }

    const finalHoriz = Math.cos(this.pitch) * cameraDist;
    const finalVert = Math.sin(this.pitch) * cameraDist;

    const desired = target.clone().addScaledVector(fwd, -finalHoriz);
    desired.y += finalVert;

    const h = world.heightAt(desired.x, desired.z);
    if (desired.y < h + 0.7) desired.y = h + 0.7;
    if (desired.y < CONFIG.world.seaLevel + 0.5) desired.y = CONFIG.world.seaLevel + 0.5;

    camera.position.lerp(desired, clamp(dt * 14, 0, 1));
    camera.lookAt(target);
  }
}
