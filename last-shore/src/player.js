// ============================================================
//  Герой: модель, физика ходьбы, камера от третьего лица.
// ============================================================

import * as THREE from 'three';
import { CONFIG, COLORS } from './config.js';
import { clamp } from './noise.js';
import { ITEMS } from './items.js';
import { buildModel as buildForgedModel, animateForged } from './forge.js';

const P = CONFIG.player;

/**
 * Как выглядит каждый вид действия: скорость проигрывания, дуга руки,
 * наклон корпуса и «просадка» — чтобы рубка, добыча камня и сбор ягод
 * ощущались по-разному, а не одним ударом на всё.
 */
const ACTIONS = {
  attack: { speed: 3.2, windup: 0.32, back: -1.0, hit: 1.0, lean: 0.06, dip: 0.0, reach: 0 },
  chop:   { speed: 2.5, windup: 0.46, back: -1.75, hit: 1.25, lean: 0.22, dip: 0.03, reach: 0 },
  mine:   { speed: 3.5, windup: 0.36, back: -1.35, hit: 0.85, lean: 0.3, dip: 0.07, reach: 0 },
  gather: { speed: 2.2, windup: 0.5, back: -0.35, hit: 0.05, lean: 0.55, dip: 0.12, reach: 1.15 },
};

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
    const clothMat = new THREE.MeshStandardMaterial({ color: 0x9a8663, roughness: 1, flatShading: true });

    const box = (w, h, d, mat) => {
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
      mesh.castShadow = true;
      return mesh;
    };

    // корпус: грудь + куртка с воротом, чуть скошенные плечи
    const torso = new THREE.Group();
    torso.position.y = 1.16;

    const chest = box(0.5, 0.5, 0.3, shirtMat);
    chest.position.y = 0.06;
    torso.add(chest);

    // плечи чуть шире — силуэт человечнее
    const shoulders = box(0.56, 0.16, 0.32, shirtMat);
    shoulders.position.y = 0.3;
    torso.add(shoulders);

    // воротник и полы куртки
    const collar = box(0.26, 0.08, 0.3, new THREE.MeshStandardMaterial({ color: 0x74593a, roughness: 0.95, flatShading: true }));
    collar.position.set(0, 0.36, 0.01);
    torso.add(collar);

    const jacket = box(0.52, 0.2, 0.31, new THREE.MeshStandardMaterial({ color: 0x7a5e3d, roughness: 0.95, flatShading: true }));
    jacket.position.y = -0.2;
    torso.add(jacket);
    g.add(torso);
    this.torsoGroup = torso;

    const belt = box(0.5, 0.12, 0.32, new THREE.MeshStandardMaterial({ color: 0x40301f, roughness: 1, flatShading: true }));
    belt.position.y = 0.86;
    g.add(belt);

    // пряжка
    const buckle = box(0.1, 0.08, 0.03, new THREE.MeshStandardMaterial({ color: 0xc7a252, roughness: 0.4, metalness: 0.6 }));
    buckle.position.set(0, 0.86, 0.17);
    g.add(buckle);

    // --- голова: череп, лицо, волосы, борода ---
    this.head = new THREE.Group();
    this.head.position.y = 1.62;
    const skull = box(0.3, 0.32, 0.29, skinMat);
    this.head.add(skull);

    const hairMat = new THREE.MeshStandardMaterial({ color: 0x2c2118, roughness: 1, flatShading: true });
    const hair = box(0.32, 0.11, 0.31, hairMat);
    hair.position.y = 0.16;
    this.head.add(hair);
    // затылок
    const backHair = box(0.32, 0.16, 0.08, hairMat);
    backHair.position.set(0, 0.06, -0.13);
    this.head.add(backHair);

    const nose = box(0.06, 0.08, 0.06, new THREE.MeshStandardMaterial({ color: 0xb87c52, roughness: 0.8, flatShading: true }));
    nose.position.set(0, -0.01, 0.16);
    this.head.add(nose);

    const eyeMat = new THREE.MeshStandardMaterial({ color: 0x1d1a16, roughness: 0.5 });
    for (const side of [-1, 1]) {
      const eye = box(0.045, 0.04, 0.02, eyeMat);
      eye.position.set(0.075 * side, 0.05, 0.15);
      this.head.add(eye);
    }

    const beard = box(0.2, 0.09, 0.06, hairMat);
    beard.position.set(0, -0.13, 0.13);
    this.head.add(beard);
    g.add(this.head);

    // --- рюкзак на спине (спина — это -Z, лицо смотрит в +Z) ---
    const pack = box(0.38, 0.44, 0.22, packMat);
    pack.position.set(0, 1.2, -0.25);
    g.add(pack);

    // клапан рюкзака
    const flap = box(0.38, 0.14, 0.06, new THREE.MeshStandardMaterial({ color: 0x5c472c, roughness: 1, flatShading: true }));
    flap.position.set(0, 1.38, -0.34);
    g.add(flap);

    const roll = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.075, 0.36, 6, 1), clothMat);
    roll.rotation.z = Math.PI / 2;
    roll.position.set(0, 1.45, -0.26);
    roll.castShadow = true;
    g.add(roll);

    // лямки — спереди на груди, переходят через плечи
    for (const side of [-1, 1]) {
      const strap = box(0.06, 0.44, 0.05, new THREE.MeshStandardMaterial({ color: 0x54402a, roughness: 1 }));
      strap.position.set(0.13 * side, 1.2, 0.14);
      g.add(strap);
      const over = box(0.07, 0.06, 0.34, new THREE.MeshStandardMaterial({ color: 0x54402a, roughness: 1 }));
      over.position.set(0.13 * side, 1.42, -0.04);
      g.add(over);
    }

    // --- руки: плечо -> локоть ---
    const makeArm = (side) => {
      const shoulder = new THREE.Group();
      shoulder.position.set(0.32 * side, 1.42, 0);
      const upper = box(0.15, 0.3, 0.17, shirtMat);
      upper.position.y = -0.14;
      shoulder.add(upper);

      const elbow = new THREE.Group();
      elbow.position.y = -0.29;
      const lower = box(0.13, 0.28, 0.15, skinMat);
      lower.position.y = -0.13;
      elbow.add(lower);

      const cuff = box(0.145, 0.06, 0.165, new THREE.MeshStandardMaterial({ color: 0x74593a, roughness: 0.95, flatShading: true }));
      cuff.position.y = -0.26;
      elbow.add(cuff);

      const hand = box(0.14, 0.12, 0.16, skinMat);
      hand.position.y = -0.32;
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
      hip.position.set(0.14 * side, 0.84, 0);
      const thigh = box(0.21, 0.4, 0.22, pantsMat);
      thigh.position.y = -0.19;
      hip.add(thigh);

      const knee = new THREE.Group();
      knee.position.y = -0.4;
      const shin = box(0.18, 0.36, 0.19, pantsMat);
      shin.position.y = -0.17;
      knee.add(shin);

      // голенище сапога и подошва
      const bootTop = box(0.2, 0.16, 0.21, bootMat);
      bootTop.position.y = -0.32;
      knee.add(bootTop);

      const boot = box(0.2, 0.1, 0.3, bootMat);
      boot.position.set(0, -0.4, 0.05);
      knee.add(boot);

      const sole = box(0.21, 0.04, 0.32, new THREE.MeshStandardMaterial({ color: 0x241a12, roughness: 1 }));
      sole.position.set(0, -0.45, 0.05);
      knee.add(sole);

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

    // --- предмет в правой руке ---
    this.handSlot = new THREE.Group();
    this.handSlot.position.set(0, -0.34, 0.06);
    this.handSlot.rotation.x = 0.3;
    this.elbowR.add(this.handSlot);
    this.equippedId = null;
    this.equippedMesh = null;

    this.swingPhase = -1;      // -1 — покой, 0..1 — удар
    this.swingSpeed = 3.2;
    this.actionKind = 'attack'; // attack | chop | mine | gather
    this.hitShake = 0;         // короткая отдача после удара по дереву/камню
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
    const def = ITEMS[itemId];
    // кованый предмет рисуется своей процедурной моделью
    if (def && def.forged) {
      const model = buildForgedModel(def);
      model.scale.setScalar(def.form === 'spear' ? 0.8 : 1.05);
      return model;
    }

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

  /**
   * Запустить замах. Вид удара зависит от цели:
   *   attack — короткий тычок, chop — широкий замах топором,
   *   mine — резкий удар киркой, gather — наклон и сбор руками.
   */
  swing(kind = 'attack') {
    this.actionKind = ACTIONS[kind] ? kind : 'attack';
    this.swingSpeed = ACTIONS[this.actionKind].speed;
    if (this.swingPhase < 0) this.swingPhase = 0;
  }

  /** Небольшая отдача: камера дёргается после попадания */
  shake(amount = 0.12) {
    this.hitShake = Math.max(this.hitShake, amount);
  }

  setPosition(x, z, world) {
    this.position.set(x, world.heightAt(x, z), z);
    // мерцание камня в кованом клинке — модель «живая», а не статуя
    if (this.equippedMesh) animateForged(this.equippedMesh, performance.now() * 0.001);

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
    // под землёй воды нет: там своя физика — клетки, стены и лава
    const underground = !!world.underground;
    const groundHere = world.heightAt(this.position.x, this.position.z);
    this.wading = underground ? 0 : clamp(-groundHere / 1.1, 0, 1);
    const inWater = !underground && groundHere < 0.05;

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
      if (underground) return true;        // стены шахты отсекает resolveCollisions
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
    const floor = underground ? ground : Math.max(ground, CONFIG.world.seaLevel - 0.9);

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

    this.swimming = !underground && ground < -0.6;

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
    let elbowRSwing = -0.3 - speedRatio * 0.4;
    let armLSwing = sw * (0.55 + speedRatio * 0.35) - idle;
    let leanExtra = 0;
    let dipExtra = 0;
    let actionT = -1;

    if (this.swingPhase >= 0) {
      this.swingPhase += dt * this.swingSpeed;
      if (this.swingPhase >= 1) this.swingPhase = -1;
      else {
        const act = ACTIONS[this.actionKind] || ACTIONS.attack;
        const p = this.swingPhase;
        actionT = p;

        // замах назад -> быстрый удар -> плавный возврат
        let arc;
        if (p < act.windup) {
          const k = p / act.windup;
          arc = act.back * (k * k * (3 - 2 * k));
        } else {
          const k = (p - act.windup) / (1 - act.windup);
          // резкий выпад и мягкое возвращение к нулю
          arc = act.hit * Math.sin(k * Math.PI) * (1 - k * 0.35) + act.back * (1 - k) * (1 - k);
        }

        armRSwing = arc;
        elbowRSwing = -0.25 - Math.max(0, arc) * 0.55;

        // корпус наклоняется на ударе, колени чуть подгибаются
        const punch = p < act.windup ? p / act.windup * 0.35 : Math.max(0, Math.sin(((p - act.windup) / (1 - act.windup)) * Math.PI));
        leanExtra = act.lean * punch;
        dipExtra = act.dip * punch;

        // сбор ягод: левая рука тянется вниз-вперёд
        if (act.reach) {
          const reach = Math.sin(Math.min(1, p / 0.75) * Math.PI * 0.9);
          armLSwing = -act.reach * reach;
          leanExtra = act.lean * reach;
          dipExtra = act.dip * reach;
          armRSwing = -0.55 * reach;
        }
      }
    }

    this.armL.rotation.x = armLSwing;
    this.armR.rotation.x = armRSwing;
    this.elbowR.rotation.x = elbowRSwing;

    const targetLean = speedRatio * 0.2 + (this.swimming ? 0.12 : 0) + leanExtra;
    this.lean += (targetLean - this.lean) * clamp(dt * 10, 0, 1);
    this.torsoGroup.rotation.x = this.lean;
    this.torsoGroup.rotation.z = Math.sin(this.walkPhase) * 0.03 * speedRatio;

    if (this.head) this.head.rotation.y = Math.sin(this.bobPhase * 0.4) * 0.05 * (1 - speedRatio);

    (this.landDip = Math.max(0, this.landDip - dt * 3));
    const bobY = Math.abs(Math.sin(this.walkPhase)) * 0.05 * speedRatio;
    this.model.position.copy(this.position);
    if (inWater) this.model.position.y -= this.wading * 0.55;
    this.model.position.y += bobY - this.landDip * 0.14 - dipExtra;
    this.actionT = actionT;
    this.model.rotation.y = this.facing;

    // руки от первого лица: покачивание, замах, лёгкая инерция
    if (this.viewMode === 'first') {
      const bx = Math.sin(this.walkPhase) * 0.02 * speedRatio;
      const by = Math.abs(Math.cos(this.walkPhase)) * 0.018 * speedRatio;
      const sway = Math.sin(this.bobPhase * 0.9) * 0.005;
      let swing = 0;
      let forward = 0;
      let twist = 0;
      let drop = 0;
      if (this.swingPhase >= 0) {
        const p = this.swingPhase;
        const arc = Math.sin(Math.min(1, p) * Math.PI);
        swing = arc;
        if (this.actionKind === 'chop') {
          forward = -arc * 0.26;
          twist = arc * 0.55;
          drop = arc * 0.1;
        } else if (this.actionKind === 'mine') {
          forward = -arc * 0.2;
          twist = arc * 0.35;
          drop = arc * 0.13;
        } else if (this.actionKind === 'gather') {
          forward = -arc * 0.1;
          drop = arc * 0.34;
        } else {
          forward = -arc * 0.16;
        }
      }
      this.viewModel.position.set(0.26 + bx + sway, -0.24 + by - drop, -0.6 + forward);
      this.viewModel.rotation.set(0.08 + swing * 0.25 + twist * 0.2, -0.22, swing * 0.3);
      this.viewModelHand.rotation.x = swing * 0.7 + twist;
    }

    this.landShake = Math.max(0, this.landShake - dt);
  }

  /** Камера: третье лицо или вид от первого лица */
  applyCamera(camera, world, dt) {
    const sin = Math.sin(this.yaw);
    const cos = Math.cos(this.yaw);
    // отдача от удара гаснет за пару кадров
    const hit = this.hitShake;
    if (hit > 0) this.hitShake = Math.max(0, hit - dt * 0.9);

    if (this.viewMode === 'first') {
      const eyeY = this.position.y + 1.62 + (this.swimming ? -0.25 : 0);
      const target = new THREE.Vector3(this.position.x, eyeY, this.position.z);
      camera.position.copy(target);
      camera.rotation.set(0, 0, 0);
      camera.rotateY(this.yaw);
      camera.rotateX(-this.pitch);
      // тряска от удара/шага/попадания по дереву
      const shake = this.landShake > 0 ? this.landShake * 2.4 : 0;
      if (shake > 0) camera.rotateZ(Math.sin(performance.now() * 0.05) * shake * 0.06);
      if (hit > 0) {
        const a = hit * 0.35;
        camera.rotateX(Math.sin(performance.now() * 0.06) * a * 0.05);
        camera.rotateZ(Math.sin(performance.now() * 0.045) * a * 0.04);
      }
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
    if (hit > 0) {
      // короткий толчок камеры назад при ударе
      camera.position.y += Math.sin(performance.now() * 0.06) * hit * 0.03;
    }
    camera.lookAt(target);
  }
}
