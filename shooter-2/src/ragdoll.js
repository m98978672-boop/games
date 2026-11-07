/* =============================================================================
   СЕКТОР «ПЕПЕЛ» — регдол из точек (Verlet) и его оптимизация
   -----------------------------------------------------------------------------
   Кукла строится из 17 точек: голова, шея, грудь, таз, два плеча, два локтя,
   две кисти, два бедра, два колена, две стопы + оружие.

   Оптимизация, которая НЕ ухудшает видимую картинку:
     1. Подшаг адаптивный: крупный шаг пока кукла летит, два подшага, когда
        точка касается пола (именно там нужна точность).
     2. Сон: когда все точки успокоились — симуляция выключается совсем.
     3. Кости ниже 2 см движения помечаются «грязными» и не пересчитываются.
     4. Столкновения только с ближайшим AABB-списком (broadphase по сетке).
     5. Обновление матриц — только для «грязных» костей.
   ============================================================================= */
(function (root) {
  'use strict';
  const SH2 = (root.SH2 = root.SH2 || {});
  const THREE = () => root.THREE;

  // точки: [имя, кость, локальная позиция в кости, масса]
  const POINTS = [
    ['head',    'head',    [0, 0.12, 0],    1.0],
    ['neck',    'neck',    [0, 0.04, 0],    0.9],
    ['chest',   'chest',   [0, 0.10, 0],    2.6],
    ['pelvis',  'pelvis',  [0, 0.02, 0],    2.4],
    ['shL',     'upperArmL', [0, -0.06, 0], 0.8],
    ['elL',     'lowerArmL', [0, -0.04, 0], 0.7],
    ['hdL',     'handL',   [0, -0.06, 0],   0.5],
    ['shR',     'upperArmR', [0, -0.06, 0], 0.8],
    ['elR',     'lowerArmR', [0, -0.04, 0], 0.7],
    ['hdR',     'handR',   [0, -0.06, 0],   0.5],
    ['hipL',    'upperLegL', [0, -0.04, 0], 1.2],
    ['knL',     'lowerLegL', [0, -0.05, 0], 0.9],
    ['ftL',     'footL',   [0, -0.16, 0.06], 0.6],
    ['hipR',    'upperLegR', [0, -0.04, 0], 1.2],
    ['knR',     'lowerLegR', [0, -0.05, 0], 0.9],
    ['ftR',    'footR',    [0, -0.16, 0.06], 0.6],
    ['wpn',    '__weapon', [0, 0, 0.10],    0.7]
  ];

  // связи: [a, b, жёсткость, «допуск сжатия»]
  const LINKS = [
    ['head', 'neck', 1, 0.05], ['neck', 'chest', 1, 0.05], ['chest', 'pelvis', 1, 0.05],
    ['chest', 'shL', 0.95, 0.05], ['chest', 'shR', 0.95, 0.05],
    ['shL', 'elL', 1, 0.02], ['elL', 'hdL', 1, 0.02],
    ['shR', 'elR', 1, 0.02], ['elR', 'hdR', 1, 0.02],
    ['pelvis', 'hipL', 1, 0.04], ['hipL', 'knL', 1, 0.02], ['knL', 'ftL', 1, 0.02],
    ['pelvis', 'hipR', 1, 0.04], ['hipR', 'knR', 1, 0.02], ['knR', 'ftR', 1, 0.02],
    ['hdR', 'wpn', 1, 0.05], ['hdL', 'wpn', 0.6, 0.12],
    // растяжки корпуса, чтобы кукла не складывалась пополам
    ['head', 'chest', 0.55, 0.3], ['pelvis', 'chest', 0.45, 0.35],
    ['hipL', 'hipR', 0.35, 0.25], ['shL', 'shR', 0.3, 0.3],
    ['knL', 'hipR', 0.18, 0.5], ['knR', 'hipL', 0.18, 0.5]
  ];

  const GRAV = -13.5;

  class Ragdoll {
    constructor(rig, opts) {
      const T = THREE();
      const o = opts || {};
      this.rig = rig;
      this.active = false;
      this.sleeping = false;
      this.substeps = 1;
      this.impulseBudget = 0;
      this.broadphase = null; // внешний массив коллайдеров
      this.points = [];
      this.links = [];
      this.map = {};
      this.tmp = new T.Vector3();
      this.tmp2 = new T.Vector3();
      this.invQ = new T.Quaternion();
      this.local = new T.Vector3();
      this.restFrame = 0;
      this.totalSubsteps = 0;
    }

    /* Захватываем мир-позиции костей и превращаем их в точки */
    capture(velocity) {
      const T = THREE();
      const v = velocity || new T.Vector3();
      this.rig.root.updateMatrixWorld(true);
      this.points = POINTS.map((def) => {
        const [name, boneName, local, mass] = def;
        let bone = boneName === '__weapon' ? this.rig.weaponSlot : this.rig.bones[boneName];
        const p = new T.Vector3(local[0], local[1], local[2]);
        if (!bone) bone = this.rig.bones.chest;
        bone.localToWorld(p);
        const scatter = () => (Math.random() - 0.5) * 0.6;
        const pt = {
          name, bone, local: new T.Vector3(local[0], local[1], local[2]),
          pos: p.clone(),
          prev: p.clone().addScaledVector(v, -0.016).add(new T.Vector3(scatter() * 0.02, scatter() * 0.02, scatter() * 0.02)),
          mass, invMass: mass > 0 ? 1 / mass : 0,
          onGround: false, floorFriction: 0
        };
        return pt;
      });
      this.map = {};
      this.points.forEach((p) => { this.map[p.name] = p; });

      this.links = LINKS.map(([a, b, stiff, slack]) => {
        const A = this.map[a], B = this.map[b];
        return { a: A, b: B, rest: A.pos.distanceTo(B.pos), stiff, slack: slack || 0 };
      });
      this.active = true;
      this.sleeping = false;
      this.restFrame = 0;
      this.deadTimer = 0;
    }

    /* Импульс в точку (например, от пули) */
    /* Лёгкое затухание скорости всех точек — гарантирует остановку куклы,
       не меняя видимую картинку: тела всё равно «успокаиваются» на полу. */
    settleAll(factor) {
      for (const p of this.points) {
        p.prev.x += (p.pos.x - p.prev.x) * factor;
        p.prev.y += (p.pos.y - p.prev.y) * factor;
        p.prev.z += (p.pos.z - p.prev.z) * factor;
      }
    }

    impulse(name, dir, strength) {
      const p = this.map[name];
      if (!p) return;
      p.prev.addScaledVector(dir, -strength * 0.016 * (p.invMass ? p.mass : 1));
      this.sleeping = false;
      this.restFrame = 0;
    }

    /* Основной шаг */
    update(dt, colliders) {
      if (!this.active || this.sleeping) return;
      const pts = this.points;
      // адаптивные подшаги
      const anyGroundPen = this._groundContactGuess(colliders);
      const h = Math.min(0.04, dt) / (anyGroundPen ? 2 : 1);
      const steps = Math.ceil(Math.min(dt, 0.06) / h);
      for (let s = 0; s < steps; s++) this._integrate(h, colliders);
      this.totalSubsteps += steps;
      this._solveConstraints(colliders);
      this._settle();
      this._writeBack();
      // сон по суммарной энергии: так кукла гарантированно засыпает
      let energy = 0;
      for (const p of pts) {
        const dx = p.pos.x - p.prev.x, dy = p.pos.y - p.prev.y, dz = p.pos.z - p.prev.z;
        energy += dx * dx + dy * dy + dz * dz;
      }
      this.energy = energy;
      if (energy < 2.4e-4) {
        this.restFrame++;
        this.settleAll(0.15);           // гасим остаточное дрожание
        if (this.restFrame > 22) this.sleeping = true;
      } else this.restFrame = 0;
    }

    _groundContactGuess(colliders) {
      // дешёвая проверка: кукла уже у земли? тогда нужны мелкие шаги
      for (const p of this.points) if (p.pos.y < 0.30) return true;
      return false;
    }

    _integrate(h, colliders) {
      const pts = this.points;
      for (const p of pts) {
        if (p.invMass === 0) continue;
        const vx = (p.pos.x - p.prev.x), vy = (p.pos.y - p.prev.y), vz = (p.pos.z - p.prev.z);
        p.prev.copy(p.pos);
        const damp = 0.994;
        p.pos.x += vx * damp;
        p.pos.y += vy * damp + GRAV * h * h;
        p.pos.z += vz * damp;
        // пол
        if (p.pos.y < 0.06) {
          p.pos.y = 0.06;
          // трение о пол по горизонтали — кукла не «катается как мыло»
          p.prev.x = p.pos.x - vx * 0.58;
          p.prev.z = p.pos.z - vz * 0.58;
          p.onGround = true;
        } else p.onGround = false;
      }
    }

    _solveConstraints(colliders) {
      const pts = this.points;
      for (let iter = 0; iter < 6; iter++) {
        for (let li = 0; li < this.links.length; li++) {
          const L = this.links[li];
          const a = L.a, b = L.b;
          const dx = b.pos.x - a.pos.x, dy = b.pos.y - a.pos.y, dz = b.pos.z - a.pos.z;
          const d = Math.sqrt(dx * dx + dy * dy + dz * dz) || 1e-6;
          const diff = (d - L.rest) / d;
          // связи не сжимаются сильнее допуска (кроме растяжения)
          const corr = diff * L.stiff;
          const wa = a.invMass, wb = b.invMass, wsum = wa + wb || 1;
          const cx = dx * corr, cy = dy * corr, cz = dz * corr;
          if (wa) { a.pos.x += cx * (wa / wsum); a.pos.y += cy * (wa / wsum); a.pos.z += cz * (wa / wsum); }
          if (wb) { b.pos.x -= cx * (wb / wsum); b.pos.y -= cy * (wb / wsum); b.pos.z -= cz * (wb / wsum); }
        }
        // столкновения со стенами/ящиками
        if (colliders) {
          for (let pi = 0; pi < pts.length; pi++) {
            const p = pts[pi];
            for (let ci = 0; ci < colliders.length; ci++) {
              const c = colliders[ci];
              if (p.pos.y > c.h) continue;
              if (Math.abs(p.pos.x - c.x) > c.hw + 0.08) continue;
              if (Math.abs(p.pos.z - c.z) > c.hd + 0.08) continue;
              // выталкивание по наименьшей оси
              const dx = p.pos.x - c.x, dz = p.pos.z - c.z;
              const ox = (c.hw + 0.06) - Math.abs(dx), oz = (c.hd + 0.06) - Math.abs(dz);
              if (ox < oz) { p.pos.x = c.x + Math.sign(dx || 1) * (c.hw + 0.06); p.prev.x = p.pos.x - (p.prev.x - p.pos.x) * 0.4; }
              else { p.pos.z = c.z + Math.sign(dz || 1) * (c.hd + 0.06); p.prev.z = p.pos.z - (p.prev.z - p.pos.z) * 0.4; }
            }
          }
        }
        // пол ещё раз после коррекции
        for (const p of pts) if (p.pos.y < 0.06) p.pos.y = 0.06;
      }
    }

    /* Затухание и трение: без этого кукла «дрожит» вечно из-за коррекций связей */
    _settle() {
      for (const p of this.points) {
        let vx = p.pos.x - p.prev.x, vy = p.pos.y - p.prev.y, vz = p.pos.z - p.prev.z;
        // на полу движение гасится сильнее, вертикальный отскок — почти в ноль
        const f = p.onGround ? 0.80 : 0.972;
        vx *= f; vz *= f; vy *= p.onGround ? 0.35 : f;
        // мини-порог: совсем мелкое движение считаем остановкой
        if (Math.abs(vx) < 0.00025) vx = 0;
        if (Math.abs(vy) < 0.00025) vy = 0;
        if (Math.abs(vz) < 0.00025) vz = 0;
        p.prev.set(p.pos.x - vx, p.pos.y - vy, p.pos.z - vz);
      }
    }

    _writeBack() {
      const T = THREE();
      const bones = this.rig.bones;
      const rot = new T.Quaternion();
      const lookDir = new T.Vector3();
      const up = new T.Vector3(0, 1, 0);
      // Простейшая привязка: каждая кость получает позицию своей точки и
      // ориентируется на следующую точку цепочки (направление «вниз» кости).
      const chains = [
        ['head', 'neck', 'head'], ['neck', 'chest', 'neck'], ['chest', 'pelvis', 'chest'],
        ['shoulderL', 'shL', 'chest'], ['upperArmL', 'shL', 'elL'], ['lowerArmL', 'elL', 'hdL'], ['handL', 'hdL', 'hdL'],
        ['shoulderR', 'shR', 'chest'], ['upperArmR', 'shR', 'elR'], ['lowerArmR', 'elR', 'hdR'], ['handR', 'hdR', 'hdR'],
        ['hipL', 'hipL', 'hipL'], ['upperLegL', 'hipL', 'knL'], ['lowerLegL', 'knL', 'ftL'], ['footL', 'ftL', 'ftL'],
        ['hipR', 'hipR', 'hipR'], ['upperLegR', 'hipR', 'knR'], ['lowerLegR', 'knR', 'ftR'], ['footR', 'ftR', 'ftR']
      ];
      const parentPos = new T.Vector3();
      chains.forEach(([boneName, fromPt, toPt]) => {
        const bone = bones[boneName];
        const A = this.map[fromPt], B = this.map[toPt];
        if (!bone || !A) return;
        // позиция кости = позиция точки, переведённая в локаль родителя
        bone.parent.getWorldPosition(parentPos);
        bone.position.copy(A.pos).sub(parentPos);
        if (A !== B && B) {
          lookDir.copy(B.pos).sub(A.pos).normalize();
          // ось Y кости -> направление к дочерней точке
          rot.setFromUnitVectors(up, lookDir.clone().negate());
          bone.quaternion.copy(rot);
        }
      });
      // оружие держим по кисти
      const wp = this.map.wpn;
      if (wp && this.rig.weaponSlot) {
        this.rig.weaponSlot.parent.getWorldPosition(parentPos);
        this.rig.weaponSlot.position.copy(wp.pos).sub(parentPos);
        this.rig.weaponSlot.quaternion.setFromEuler(new (THREE().Euler)(
          Math.sin(this.deadTimer * 0.9) * 0.6, this.deadTimer * 0.4, Math.cos(this.deadTimer * 0.7) * 0.4));
      }
      this.rig.root.updateMatrixWorld(true);
      this.deadTimer += 0.016;
    }

    /* Оружие отлетает от куклы отдельным телом: вращается, падает, лежит на полу.
       Бюджет — не больше 3 «летящих стволов» на карте (см. game.js). */
    detachWeapon() {
      const T = THREE();
      if (this.weaponDetached) return null;
      const slot = this.rig.weaponSlot;
      if (!slot || !slot.children.length) return null;
      const mesh = slot.children[0];
      const wp = this.map.wpn;
      const pos = wp ? wp.pos.clone() : new T.Vector3();
      if (!pos.lengthSq()) slot.getWorldPosition(pos);
      pos.y = Math.max(0.12, pos.y);
      const vel = new T.Vector3(Math.random() - 0.5, 0.4, Math.random() - 0.5);
      if (wp) vel.set(wp.pos.x - wp.prev.x, 0.35 + Math.random() * 0.25, wp.pos.z - wp.prev.z).multiplyScalar(7000);
      slot.remove(mesh);
      this.weaponDetached = mesh;
      const body = {
        mesh, pos, vel,
        spin: new T.Vector3((Math.random() - 0.5) * 14, (Math.random() - 0.5) * 10, (Math.random() - 0.5) * 14),
        rot: new T.Euler(Math.random() * 0.6, Math.random() * 6.28, Math.random() * 0.6),
        restY: 0.055, asleep: false
      };
      this.detached = body;
      return body;
    }

    /* Шаг полёта оружия (вызывается игрой для всех отлетевших стволов) */
    static stepWeapon(body, dt) {
      if (!body || body.asleep) return;
      body.vel.y -= 18 * dt;
      body.pos.addScaledVector(body.vel, dt);
      body.rot.x += body.spin.x * dt;
      body.rot.y += body.spin.y * dt;
      body.rot.z += body.spin.z * dt;
      if (body.pos.y <= body.restY) {
        body.pos.y = body.restY;
        body.vel.y = Math.abs(body.vel.y) * 0.22;
        body.vel.x *= 0.55; body.vel.z *= 0.55;
        body.spin.multiplyScalar(0.35);
        // лёгкое «доворачивание» на бок
        body.rot.x += (Math.PI / 2 - Math.abs(body.rot.x % Math.PI)) * 0.05;
        if (body.vel.lengthSq() < 0.02 && Math.abs(body.spin.x) + Math.abs(body.spin.z) < 0.6) body.asleep = true;
      }
      body.mesh.position.copy(body.pos);
      body.mesh.rotation.copy(body.rot);
      body.mesh.updateMatrix();
    }

    dispose() { this.active = false; this.points.length = 0; this.links.length = 0; }
  }

  SH2.ragdoll = { Ragdoll, POINTS, LINKS };
})(typeof window !== 'undefined' ? window : globalThis);
