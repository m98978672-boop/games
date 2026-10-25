// ============================================================
//  Видимость: то, что закрыто деревом, камнем или кустом,
//  не рисуется и не анимируется — объект «ждёт» в памяти,
//  пока камера снова его не увидит.
//
//  Работает в два шага:
//    1) грубая отсечка по пирамиде видимости (три сферы на объект);
//    2) проверка перекрытия луча камеры сеткой коллайдеров (деревья,
//       камни, кусты) и рельефом.
//  Плюс гистерезис, чтобы объект не мигал на границе кадра.
// ============================================================

import * as THREE from 'three';

const CELL = 10;          // размер ячейки сетки коллайдеров, м
const HYSTERESIS = 0.25;  // секунд: столько объект остаётся видимым после потери

export class VisibilityCuller {
  constructor(world, camera) {
    this.world = world;
    this.camera = camera;
    this.sphere = new THREE.Sphere(new THREE.Vector3(), 1);
    this.tmp = new THREE.Vector3();
    this.items = new Map();     // object -> { radius, height, visibleFor }
    this.grid = new Map();
    this._buildGrid();
    this.stats = { total: 0, visible: 0, partial: 0, hides: 0 };
    this.frame = 0;
    this._wp = new THREE.Vector3();
  }

  /** Сетка по коллайдерам: проверять луч нужно только в соседних ячейках */
  _buildGrid() {
    const key = (cx, cz) => cx * 10000 + cz;
    for (const c of this.world.colliders) {
      if (c.disabled || c.soft) continue;
      if (c.r < 0.35) continue;                // трава и мелочь не закрывают обзор
      // кострища, родники и прочие точки без высоты обзор не закрывают
      if (!(c.height > 0.5) && !c.kind) continue;
      if (c.fire || c.spring) continue;
      const cx = Math.floor(c.x / CELL);
      const cz = Math.floor(c.z / CELL);
      for (let dx = -1; dx <= 1; dx++) {
        for (let dz = -1; dz <= 1; dz++) {
          const k = key(cx + dx, cz + dz);
          let bucket = this.grid.get(k);
          if (!bucket) this.grid.set(k, (bucket = []));
          bucket.push(c);
        }
      }
    }
  }

  /** Добавить объект под управление (радиус и высота — для проверки видимости) */
  track(object, { radius = 1, height = 1, getPos = null } = {}) {
    this.items.set(object, { radius, height, getPos, visibleFor: 0, wasVisible: true });
    return object;
  }

  untrack(object) {
    this.items.delete(object);
  }

  isVisible(object) {
    const item = this.items.get(object);
    return item ? item.wasVisible : object.visible;
  }

  _occludersAlong(x0, z0, x1, z1) {
    const minX = Math.floor(Math.min(x0, x1) / CELL);
    const maxX = Math.floor(Math.max(x0, x1) / CELL);
    const minZ = Math.floor(Math.min(z0, z1) / CELL);
    const maxZ = Math.floor(Math.max(z0, z1) / CELL);
    const out = [];
    const seen = new Set();
    for (let cx = minX; cx <= maxX; cx++) {
      for (let cz = minZ; cz <= maxZ; cz++) {
        const bucket = this.grid.get(cx * 10000 + cz);
        if (!bucket) continue;
        for (const c of bucket) {
          if (c.disabled || seen.has(c)) continue;
          seen.add(c);
          out.push(c);
        }
      }
    }
    return out;
  }

  /** Пересекает ли отрезок «камера → объект» ствол/валун */
  _blockedByProps(cam, target) {
    const list = this._occludersAlong(cam.x, cam.z, target.x, target.z);
    if (!list.length) return false;

    const dx = target.x - cam.x;
    const dz = target.z - cam.z;
    const len2 = dx * dx + dz * dz || 1e-6;

    for (const c of list) {
      let t = ((c.x - cam.x) * dx + (c.z - cam.z) * dz) / len2;
      if (t <= 0.05 || t >= 0.97) continue;         // объект ближе камере, чем ствол
      const px = cam.x + dx * t;
      const pz = cam.z + dz * t;
      const rr = c.r * 0.9;
      if ((px - c.x) ** 2 + (pz - c.z) ** 2 < rr * rr) {
        // ствол закрывает только если его верх выше линии взгляда
        const camY = cam.y;
        const targetY = target.y;
        const lineY = camY + (targetY - camY) * t;
        const groundY = this.world.heightAt(c.x, c.z);
        const propTop = groundY + (c.height || 4.5);
        if (propTop > lineY) return true;
      }
    }
    return false;
  }

  /** Пересекает ли отрезок рельеф (объект за холмом) */
  _blockedByTerrain(cam, target) {
    const steps = 6;
    const dx = target.x - cam.x;
    const dz = target.z - cam.z;
    const dy = target.y - cam.y;
    for (let i = 1; i < steps; i++) {
      const t = i / steps;
      const x = cam.x + dx * t;
      const z = cam.z + dz * t;
      const lineY = cam.y + dy * t;
      const ground = this.world.heightAt(x, z);
      if (ground > lineY + 0.35) return true;
    }
    return false;
  }

  /**
   * Обновить видимость всех отслеживаемых объектов.
   * @param {number} dt
   * @param {number} frame — номер кадра, для «круглого» обновления дальних объектов
   */
  /**
   * Доля видимых точек объекта: 0 — закрыт целиком, 1 — виден весь.
   * Девять лучей от камеры к центру и краям габарита дают грубую,
   * но честную оценку «сколько модели реально видно из-за укрытия».
   */
  _coverage(cam, pos, radius, height) {
    let seen = 0;
    let total = 0;
    const r = Math.max(0.35, radius * 0.8);
    for (let i = 0; i < 9; i++) {
      let px = pos.x;
      let py = pos.y;
      let pz = pos.z;
      if (i > 0) {
        const a = ((i - 1) % 8) * (Math.PI / 4);
        px += Math.cos(a) * r;
        pz += Math.sin(a) * r;
        py += (i % 2 === 0 ? 1 : -1) * height * 0.28;
      }
      total++;
      const blocked = this._blockedByProps(cam, { x: px, y: py, z: pz })
        || this._blockedByTerrain(cam, { x: px, y: py, z: pz });
      if (!blocked) seen++;
    }
    return total ? seen / total : 1;
  }

  /** Спрятать части, которые полностью закрыты укрытием, оставив видимые */
  _cullParts(object, item, cam) {
    if (!item.hiddenParts) item.hiddenParts = [];
    object.updateMatrixWorld(true);
    const parts = [];
    object.traverse((o) => {
      if (o !== object && o.isMesh && o.userData.noCull !== true) parts.push(o);
    });
    for (const part of parts) {
      if (this._wp === null) break;
      part.getWorldPosition(this._wp);
      const geo = part.geometry;
      if (geo && !geo.boundingSphere) geo.computeBoundingSphere();
      const rad = Math.max(0.18, (geo && geo.boundingSphere ? geo.boundingSphere.radius : 0.4) * 0.85);
      const p = { x: this._wp.x, y: this._wp.y, z: this._wp.z };
      const blocked = this._blockedByProps(cam, p) || this._blockedByTerrain(cam, p);
      if (blocked && rad < 0.55) {
        if (part.visible) { part.visible = false; item.hiddenParts.push(part); }
      } else if (!part.visible && item.hiddenParts.includes(part)) {
        part.visible = true;
        item.hiddenParts = item.hiddenParts.filter((x) => x !== part);
      }
    }
    item.culled = true;
  }

  /** Вернуть все ранее спрятанные части */
  _restoreParts(item) {
    if (!item.hiddenParts || !item.hiddenParts.length) { item.culled = false; return; }
    for (const part of item.hiddenParts) part.visible = true;
    item.hiddenParts.length = 0;
    item.culled = false;
  }

  update(dt) {
    // матрицы камеры обновляем сами: куллер работает до отрисовки кадра
    const camera = this.camera;
    camera.updateMatrixWorld();
    camera.matrixWorldInverse.copy(camera.matrixWorld).invert();

    const cam = camera.position;
    const tanY = Math.tan((camera.fov * Math.PI) / 360);
    const tanX = tanY * camera.aspect;
    const maxDist = 120;

    this.frame++;
    let visible = 0;
    let partial = 0;
    let hides = 0;
    let idx = 0;
    for (const [object, item] of this.items) {
      idx++;
      if (!object.parent) continue;

      const pos = item.getPos ? item.getPos() : object.position;
      const dist = Math.hypot(pos.x - cam.x, pos.z - cam.z);

      // 1) в кадре ли: центр в NDC с запасом по размеру объекта
      let shown = false;
      if (dist < maxDist) {
        this.sphere.center.set(pos.x, pos.y + item.height * 0.5, pos.z);
        this.tmp.copy(this.sphere.center).project(camera);
        const margin = item.radius + 0.6;
        const rx = margin / (Math.max(dist, 0.6) * tanX);
        const ry = margin / (Math.max(dist, 0.6) * tanY);
        shown = this.tmp.z > -1 && this.tmp.z < 1
          && Math.abs(this.tmp.x) < 1 + rx
          && Math.abs(this.tmp.y) < 1 + ry;

        // 2) не закрыт ли стволом, валуном или холмом
        if (shown && dist > 3 && dist < 60) {
          const aim = this.sphere.center;
          if (this._blockedByProps(cam, aim) || this._blockedByTerrain(cam, aim)) shown = false;

          // 3) частичное перекрытие: считаем долю видимого, но не каждый кадр
          if (shown && dist < 34) {
            if (item.coverage === undefined || (this.frame + idx) % 6 === 0) {
              item.coverage = this._coverage(cam, aim, item.radius, item.height);
            }
            if (item.coverage <= 0.001) {
              shown = false;
              hides++;
            } else if (item.coverage < 0.999) {
              partial++;
            }
          } else {
            item.coverage = 1;
          }
        } else {
          item.coverage = 1;
        }
      }
      item.last = { dist, shown };

      if (shown) {
        item.visibleFor = HYSTERESIS;
        item.wasVisible = true;
      } else if (item.visibleFor > 0) {
        item.visibleFor -= dt;          // крошечная пауза — и объект гаснет
        item.wasVisible = true;
      } else {
        item.wasVisible = false;
      }

      if (object.visible !== item.wasVisible) object.visible = item.wasVisible;
      if (item.wasVisible) {
        visible++;
        // видна только часть модели — грузим ровно то, что не закрыто
        if (item.coverage !== undefined && item.coverage < 0.999) {
          if (dist < 30) this._cullParts(object, item, cam);
        } else if (item.culled) {
          this._restoreParts(item);
        }
      } else if (item.culled) {
        this._restoreParts(item);
      }
    }

    this.stats.total = this.items.size;
    this.stats.visible = visible;
    this.stats.partial = partial;
    this.stats.hides = hides;
  }
}
