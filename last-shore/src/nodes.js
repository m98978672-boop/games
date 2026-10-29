// ============================================================
//  Добыча и костры: деревья, пальмы, камни, кусты, родники.
//  У каждого узла есть прочность, дроп и время восстановления.
// ============================================================

import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { makeRng } from './noise.js';

const REACH = 3.4;

const NODE_DEFS = {
  tree: {
    label: 'Дерево', hp: 10, respawn: 260,
    need: 'топор', tool: 'chop',
    drop: [{ id: 'wood', min: 2, max: 4 }, { id: 'fiber', min: 0, max: 2 }],
  },
  palm: {
    label: 'Пальма', hp: 8, respawn: 240,
    need: 'топор', tool: 'chop',
    drop: [{ id: 'wood', min: 1, max: 2 }, { id: 'coconut', min: 0, max: 2 }, { id: 'fiber', min: 0, max: 1 }],
  },
  rock: {
    label: 'Валун', hp: 14, respawn: 300,
    need: 'кирка', tool: 'mine',
    drop: [{ id: 'stone', min: 2, max: 4 }, { id: 'flint', min: 0, max: 2 }],
  },
  bush: {
    label: 'Куст', hp: 4, respawn: 150,
    need: null, tool: 'chop',
    drop: [{ id: 'berries', min: 1, max: 2 }, { id: 'fiber', min: 1, max: 2 }],
    berryRegrow: 85,
  },
};

export class Resources {
  constructor(scene, world) {
    this.scene = scene;
    this.world = world;
    this.rng = makeRng(world.seed + 777);
    this.nodes = [];
    this.campfires = [];
    this.springs = [];
    this.time = 0;

    // --- свет костров: ровно два источника, созданных заранее ---
    // Добавление нового PointLight в сцену заставляет three.js перекомпилировать
    // шейдеры ВСЕХ материалов (число огней меняет код шейдера) — из-за этого
    // постановка костра «подвешивала» игру. Теперь огни живут в пуле с нулевой
    // яркостью: поставили костёр — забрали свободный, разобрали — вернули.
    this.fireLights = [];
    for (let i = 0; i < 2; i++) {
      const light = new THREE.PointLight(0xffa64d, 0, 16, 2);
      light.visible = true;
      light.castShadow = false;      // тени у точечного света — 6 проходов рендера
      light.position.set(0, -50, 0);
      scene.add(light);
      this.fireLights.push({ light, busy: false });
    }
    this._fireGeo = null;
    this._fireMat = null;
    this._flameGeo = null;
    this._coreGeo = null;
    this._flameMat = null;
    this._coreMat = null;

    this._buildNodes();
    this._buildSprings();
  }

  _buildNodes() {
    const add = (list, type, every = 1) => {
      list.forEach((item, i) => {
        if (i % every !== 0) return;
        const def = NODE_DEFS[type];
        const ore = type === 'rock' && item.kind === 'ore';
        this.nodes.push({
          type,
          item,
          x: item.x,
          z: item.z,
          y: item.h,
          hp: def.hp,
          maxHp: def.hp,
          alive: true,
          respawnAt: 0,
          label: ore ? 'Рудный камень' : def.label,
          ore,
          // у куста с ягодами ягоды можно собрать руками
          berries: type === 'bush' ? !!item.berries : false,
          berryAt: 0,
        });
      });
    };

    add(this.world.treeList, 'tree', 1);
    add(this.world.palmList, 'palm', 1);
    add(this.world.rockList, 'rock', 1);
    add(this.world.bushList, 'bush', 1);
  }

  _buildSprings() {
    const world = this.world;
    const spots = [];
    const rng = this.rng;

    // ищем 3 пологих места в глубине острова под родники
    for (let attempt = 0; attempt < 6000 && spots.length < 3; attempt++) {
      const a = rng() * Math.PI * 2;
      const rad = (0.15 + rng() * 0.3) * 180;
      const x = Math.cos(a) * rad;
      const z = Math.sin(a) * rad;
      const h = world.heightAt(x, z);
      if (h < 2.5 || h > 12) continue;
      if (world.slopeAt(x, z) > 0.35) continue;
      if (spots.some((s) => Math.hypot(s.x - x, s.z - z) < 70)) continue;
      // родник не рождается внутри чужих хитбоксов: вокруг чаши нужно 2.3 м
      if (typeof world.isFree === 'function' && !world.isFree(x, z, 2.3)) continue;
      spots.push({ x, z, h });
    }

    for (const spot of spots) {
      const group = new THREE.Group();
      group.position.set(spot.x, spot.h + 0.02, spot.z);

      // чаша: вода чуть ниже земли, чтобы это был родник, а не «лужа-стена»
      const waterMat = new THREE.MeshStandardMaterial({
        color: 0x2f8ba8,
        roughness: 0.12,
        metalness: 0.15,
        transparent: true,
        opacity: 0.88,
      });
      const water = new THREE.Mesh(new THREE.CircleGeometry(1.55, 28), waterMat);
      water.rotation.x = -Math.PI / 2;
      water.position.y = 0.012;
      group.add(water);

      // тёмное дно под водой — без него вода кажется пятном на траве
      const bottom = new THREE.Mesh(
        new THREE.CircleGeometry(1.6, 24),
        new THREE.MeshStandardMaterial({ color: 0x2c3a33, roughness: 1 })
      );
      bottom.rotation.x = -Math.PI / 2;
      bottom.position.y = -0.16;
      group.add(bottom);

      // каменный бортик: кольцо из кубиков-валунов
      const rimMat = new THREE.MeshStandardMaterial({ color: 0x8e887c, roughness: 0.95, flatShading: true });
      const rimCount = 13;
      for (let i = 0; i < rimCount; i++) {
        const ang = (i / rimCount) * Math.PI * 2 + Math.random() * 0.16;
        const r = 1.72 + Math.random() * 0.12;
        const size = 0.3 + Math.random() * 0.22;
        const stone = new THREE.Mesh(new THREE.BoxGeometry(size, size * 0.75, size), rimMat);
        stone.position.set(Math.cos(ang) * r, 0.06 + Math.random() * 0.04, Math.sin(ang) * r);
        stone.rotation.set(Math.random() * 0.3, Math.random() * Math.PI, Math.random() * 0.3);
        stone.castShadow = true;
        group.add(stone);
      }

      // мелкие камешки по дну
      for (let i = 0; i < 5; i++) {
        const ang = Math.random() * Math.PI * 2;
        const r = Math.random() * 1.2;
        const pebble = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.1, 0.14), rimMat);
        pebble.position.set(Math.cos(ang) * r, -0.11, Math.sin(ang) * r);
        pebble.rotation.y = Math.random() * 3;
        group.add(pebble);
      }

      this.scene.add(group);
      const spring = { x: spot.x, z: spot.z, y: spot.h, group, water, label: 'Родник' };
      this.springs.push(spring);
      // ходить по роднику можно: он больше не стена, только замедляет
      world.colliders.push({ x: spot.x, z: spot.z, r: 1.5, spring: true, soft: true });
    }
  }

  // ------------------------------------------------------------
  //  Поиск цели и удар
  // ------------------------------------------------------------

  nearest(pos, reach = REACH) {
    let best = null;
    let bestD = reach * reach;
    for (const node of this.nodes) {
      if (!node.alive) continue;
      const dx = node.x - pos.x;
      const dz = node.z - pos.z;
      const d = dx * dx + dz * dz;
      if (d < bestD) {
        bestD = d;
        best = node;
      }
    }
    if (best) return { kind: 'node', node: best, dist: Math.sqrt(bestD) };

    for (const fire of this.campfires) {
      const d = (fire.x - pos.x) ** 2 + (fire.z - pos.z) ** 2;
      if (d < reach * reach) return { kind: 'campfire', fire, dist: Math.sqrt(d) };
    }

    for (const s of this.springs) {
      const d = (s.x - pos.x) ** 2 + (s.z - pos.z) ** 2;
      if (d < (reach + 1.2) ** 2) return { kind: 'spring', spring: s, dist: Math.sqrt(d) };
    }
    return null;
  }

  /**
   * Удар по узлу. tool — данные инструмента из items.js (или рука).
   * Возвращает { hit, depleted, drops: {id: n}, need }
   */
  strike(node, tool) {
    const def = NODE_DEFS[node.type];
    const power = tool && tool[def.tool] ? tool[def.tool] : 0.35;
    const damage = 1 + power * 2.4;
    node.hp -= damage;

    const result = { hit: true, depleted: false, drops: {}, need: def.need, power };

    if (node.hp <= 0) {
      node.alive = false;
      node.respawnAt = this.time + def.respawn;
      node.hp = def.hp;
      this.world.setNodeVisible(node.item, false);
      result.depleted = true;

      for (const drop of def.drop) {
        let amount = drop.min + Math.floor(this.rng() * (drop.max - drop.min + 1));
        // рудный камень даёт больше кремня
        if (node.ore && drop.id === 'flint') amount += 1 + Math.floor(this.rng() * 2);
        if (node.ore && drop.id === 'stone') amount += 1;
        if (amount > 0) result.drops[drop.id] = (result.drops[drop.id] || 0) + amount;
      }
      // срубленное дерево перестаёт быть препятствием
      const collider = this.world.colliders.find(
        (c) => Math.abs(c.x - node.x) < 0.01 && Math.abs(c.z - node.z) < 0.01
      );
      if (collider) collider.disabled = true;
    }
    return result;
  }

  // ------------------------------------------------------------
  //  Ягоды: собираются руками, куст остаётся целым
  // ------------------------------------------------------------

  /** Можно ли сейчас собрать ягоды с этого куста */
  canPickBerries(node) {
    return !!node && node.type === 'bush' && node.alive && node.berries && this.time >= node.berryAt;
  }

  /** Собрать ягоды: возвращает { berries, fiber } */
  pickBerries(node) {
    const def = NODE_DEFS.bush;
    const berries = 2 + Math.floor(this.rng() * 3);
    const fiber = this.rng() > 0.55 ? 1 : 0;
    node.berries = false;
    node.berryAt = this.time + def.berryRegrow;
    this.world.setLayerVisible(node.item, 'fruit', false);
    return { berries, fiber, regrow: def.berryRegrow };
  }

  // ------------------------------------------------------------
  //  Костры
  // ------------------------------------------------------------

  addCampfire(x, z) {
    const world = this.world;
    const y = world.heightAt(x, z);
    const group = new THREE.Group();
    group.position.set(x, y, z);

    // --- геометрия и материалы костра — один раз на всю игру ---
    if (!this._fireGeo) {
      const parts = [];
      const tint = (geo, hex, px, py, pz, rot) => {
        const g = geo.index ? geo.toNonIndexed() : geo;
        if (rot) g.rotateZ(rot);
        g.translate(px, py, pz);
        const c = new THREE.Color(hex);
        const n = g.attributes.position.count;
        const arr = new Float32Array(n * 3);
        for (let i = 0; i < n; i++) { arr[i * 3] = c.r; arr[i * 3 + 1] = c.g; arr[i * 3 + 2] = c.b; }
        g.setAttribute('color', new THREE.BufferAttribute(arr, 3));
        if (!g.attributes.uv) g.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(n * 2), 2));
        parts.push(g);
      };
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2;
        const r = 0.19 + (i % 3) * 0.025;
        tint(new THREE.IcosahedronGeometry(r, 0), i % 2 ? 0x7d786f : 0x6d6a63,
          Math.cos(a) * 0.72, 0.1, Math.sin(a) * 0.72);
      }
      for (let i = 0; i < 4; i++) {
        const a = (i / 4) * Math.PI;
        const g = new THREE.CylinderGeometry(0.08, 0.1, 1.15, 5);
        g.rotateZ(Math.PI / 2);
        g.rotateY(a);
        g.translate(0, 0.14, 0);
        tint(g, i % 2 ? 0x6d5232 : 0x5e462a, 0, 0, 0);
      }
      this._fireGeo = mergeGeometries(parts, false);
      this._fireMat = new THREE.MeshStandardMaterial({
        vertexColors: true, roughness: 0.95, flatShading: true, name: 'campfire',
      });
      this._flameGeo = new THREE.ConeGeometry(0.42, 1.15, 6);
      this._coreGeo = new THREE.ConeGeometry(0.2, 0.7, 5);
      this._flameMat = new THREE.MeshBasicMaterial({ color: 0xffb347, transparent: true, opacity: 0.92 });
      this._coreMat = new THREE.MeshBasicMaterial({ color: 0xffe9a8 });
    }

    const hearth = new THREE.Mesh(this._fireGeo, this._fireMat);
    hearth.castShadow = true;
    hearth.receiveShadow = true;
    group.add(hearth);

    const flame = new THREE.Mesh(this._flameGeo, this._flameMat);
    flame.position.y = 0.72;
    group.add(flame);

    const core = new THREE.Mesh(this._coreGeo, this._coreMat);
    core.position.y = 0.52;
    group.add(core);

    // свет берём из пула: ничего не добавляем в сцену и не пересобираем шейдеры
    let slot = this.fireLights.find((l) => !l.busy);
    if (!slot) slot = this.fireLights[this.fireLights.reduce(
      (best, l, i) => (Math.hypot(l.light.position.x - x, l.light.position.z - z) <
        Math.hypot(this.fireLights[best].light.position.x - x, this.fireLights[best].light.position.z - z) ? i : best), 0)];
    slot.busy = true;
    slot.fire = null;
    const light = slot.light;
    light.position.set(x, y + 1.1, z);
    light.intensity = 2.4;

    this.scene.add(group);
    world.colliders.push({ x, z, r: 0.85, fire: true });

    const fire = {
      x, z, y, group, flame, core, light, slot,
      fuel: 60,        // секунд горения при полной загрузке
      maxFuel: 180,
      label: 'Костёр',
    };
    slot.fire = fire;
    this.campfires.push(fire);
    return fire;
  }

  /** Убрать костёр: свет возвращается в пул, шейдеры не пересобираются */
  removeCampfire(fire) {
    const i = this.campfires.indexOf(fire);
    if (i < 0) return false;
    this.campfires.splice(i, 1);
    if (fire.slot) {
      fire.slot.busy = false;
      fire.slot.fire = null;
      fire.slot.light.intensity = 0;
      fire.slot.light.position.set(0, -50, 0);
    }
    if (fire.group.parent) fire.group.parent.remove(fire.group);
    const c = this.world.colliders.find((c) => c.fire && Math.abs(c.x - fire.x) < 0.01 && Math.abs(c.z - fire.z) < 0.01);
    if (c) c.disabled = true;
    return true;
  }

  addFuel(fire, seconds) {
    fire.fuel = Math.min(fire.maxFuel, fire.fuel + seconds);
    return fire.fuel;
  }

  /** Ближайший костёр и его близость: 1 — вплотную, 0 — далеко */
  fireWarmth(pos) {
    let best = 0;
    let near = null;
    for (const fire of this.campfires) {
      if (fire.fuel <= 0) continue;
      const d = Math.hypot(fire.x - pos.x, fire.z - pos.z);
      const w = Math.max(0, 1 - d / 9);
      if (w > best) { best = w; near = fire; }
    }
    return { warmth: best, fire: near };
  }

  update(dt) {
    this.time += dt;

    // восстановление узлов
    for (const node of this.nodes) {
      if (node.alive || this.time < node.respawnAt) continue;
      node.alive = true;
      node.hp = node.maxHp;
      this.world.setNodeVisible(node.item, true);
      const collider = this.world.colliders.find(
        (c) => Math.abs(c.x - node.x) < 0.01 && Math.abs(c.z - node.z) < 0.01
      );
      if (collider) collider.disabled = false;
    }

    // ягоды отрастают на кустах
    for (const node of this.nodes) {
      if (node.type !== 'bush' || node.berries || !node.alive) continue;
      if (this.time < node.berryAt) continue;
      node.berries = true;
      this.world.setLayerVisible(node.item, 'fruit', true);
    }

    // рябь на родниках
    for (const spring of this.springs) {
      if (!spring.water) continue;
      const t = this.time;
      spring.water.rotation.z = Math.sin(t * 0.6 + spring.x) * 0.02;
      spring.water.scale.setScalar(1 + Math.sin(t * 1.3 + spring.z) * 0.012);
    }

    // костры
    for (const fire of this.campfires) {
      if (fire.fuel > 0) {
        fire.fuel = Math.max(0, fire.fuel - dt);
        const t = this.time * 9 + fire.x;
        const flicker = 0.82 + Math.sin(t) * 0.1 + Math.sin(t * 2.7) * 0.06;
        fire.flame.scale.set(1, flicker, 1);
        fire.core.scale.set(0.9 + Math.sin(t * 1.7) * 0.08, flicker * 1.05, 0.9);
        fire.light.intensity = 2.4 * flicker;
        fire.flame.visible = true;
        fire.core.visible = true;
      } else {
        fire.flame.visible = false;
        fire.core.visible = false;
        fire.light.intensity = 0.15;
      }
    }
  }
}

export { NODE_DEFS, REACH };
