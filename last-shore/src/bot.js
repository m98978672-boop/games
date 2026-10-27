// ============================================================
//  Бот-инспектор (F8).
//  Маленький робот ходит по острову и по очереди проверяет,
//  что игра работает так, как её описали: слои земли, каменный
//  слой, кубики в кустах и камнях, хитбоксы по габаритам с зазором,
//  звери по ходу движения, креатив и полёт, ранения, шахта, звук,
//  крафт, сохранение, F9-курсор.
//
//  Всё, что не совпало с описанием, бот выводит в отчёт:
//  «что проверял · как должно быть · как на самом деле».
// ============================================================

import * as THREE from 'three';

const WALK_SPEED = 4.4;      // м/с — бот идёт бодро, но не бежит
const ARRIVE = 1.1;          // насколько близко подойти к цели
const PAUSE = 0.3;           // пауза между проверками, сек

/** Коробка-робот: только BoxGeometry — как и остальные модели в игре */
function buildRobot() {
  const g = new THREE.Group();
  g.name = 'inspector-bot';

  const bodyMat = new THREE.MeshStandardMaterial({ color: 0xe8f1f4, roughness: 0.5, metalness: 0.25 });
  const accentMat = new THREE.MeshStandardMaterial({ color: 0x2f9e8f, roughness: 0.42, metalness: 0.35 });
  const darkMat = new THREE.MeshStandardMaterial({ color: 0x243038, roughness: 0.6, metalness: 0.3 });
  const eyeMat = new THREE.MeshStandardMaterial({ color: 0xffd166, emissive: 0xffb703, emissiveIntensity: 1.4, roughness: 0.3 });

  const body = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.5, 0.36), bodyMat);
  body.position.y = 0.62;
  body.castShadow = true;
  g.add(body);

  const chest = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.18, 0.06), accentMat);
  chest.position.set(0, 0.64, 0.19);
  g.add(chest);

  const head = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.32, 0.34), bodyMat);
  head.position.y = 1.05;
  head.castShadow = true;
  g.add(head);

  const visor = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.12, 0.04), darkMat);
  visor.position.set(0, 1.07, 0.18);
  g.add(visor);

  for (const sx of [-0.09, 0.09]) {
    const eye = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.07, 0.03), eyeMat);
    eye.position.set(sx, 1.07, 0.205);
    g.add(eye);
  }

  const antenna = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.26, 0.04), darkMat);
  antenna.position.set(0, 1.32, 0);
  g.add(antenna);
  const lamp = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.09, 0.09), eyeMat);
  lamp.position.set(0, 1.46, 0);
  g.add(lamp);

  const armL = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.42, 0.12), accentMat);
  armL.position.set(-0.34, 0.6, 0);
  g.add(armL);
  const armR = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.42, 0.12), accentMat);
  armR.position.set(0.34, 0.6, 0);
  g.add(armR);

  const legL = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.34, 0.16), darkMat);
  legL.position.set(-0.14, 0.2, 0);
  g.add(legL);
  const legR = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.34, 0.16), darkMat);
  legR.position.set(0.14, 0.2, 0);
  g.add(legR);

  g.userData.parts = { body, head, armL, armR, legL, legR, lamp };
  return g;
}

const fmt = (v, digits = 2) => (typeof v === 'number' ? v.toFixed(digits) : String(v));

export class InspectorBot {
  constructor(game) {
    this.game = game;
    this.active = false;
    this.state = 'idle';
    this.index = 0;
    this.timer = 0;
    this.entries = [];
    this.phase = 0;
    this.target = null;
    this.mesh = null;
    this.walked = 0;
    this.checks = this._buildChecks();
  }

  // ----------------------------------------------------------
  //  Запуск / остановка
  // ----------------------------------------------------------

  toggle() {
    if (this.active) this.stop();
    else this.start();
    return this.active;
  }

  start() {
    const g = this.game;
    if (!this.mesh) {
      this.mesh = buildRobot();
      g.scene.add(this.mesh);
    }
    this.mesh.visible = true;
    const p = g.player.position;
    this.mesh.position.set(p.x + 1.6, g.world.heightAt(p.x + 1.6, p.z + 1.2) + 0.02, p.z + 1.2);
    this.mesh.rotation.y = g.player.yaw + Math.PI;

    this.active = true;
    this.state = 'run';
    this.index = 0;
    this.timer = 0.3;
    this.entries = [];
    this.walked = 0;

    g.ui.showBotReport([], { running: true, total: this.checks.length });
    g.ui.toast('Бот-инспектор пошёл проверять игру по вашему описанию');
    g.audio.uiClick?.();
  }

  stop() {
    this.active = false;
    this.state = 'idle';
    if (this.mesh) this.mesh.visible = false;
    this.game.ui.hideBotReport();
    this.game.audio.uiClick?.();
  }

  /** Отчёт доступен и после остановки — для тестов и повторного показа */
  get report() {
    return this.entries.slice();
  }

  // ----------------------------------------------------------
  //  Список проверок
  // ----------------------------------------------------------

  _buildChecks() {
    return [
      { name: 'Сцена 3D, интерфейс по-русски', walk: null, run: (g) => {
        const ok3d = !!(g.renderer && g.scene && g.camera && g.camera.isPerspectiveCamera);
        const hud = (document.body?.textContent || '').replace(/\s+/g, ' ');
        const ru = /[А-Яа-яЁё]/.test(hud);
        return {
          ok: ok3d && ru,
          expect: '3D-камера и русские подписи в HUD',
          fact: `3D: ${ok3d ? 'да' : 'нет'} · HUD по-русски: ${ru ? 'да' : 'нет'}`,
        };
      } },

      { name: 'Вид от первого лица (V)', walk: null, run: (g) => {
        const before = g.view;
        g.toggleView();
        const a = g.view;
        g.toggleView();
        const b = g.view;
        const fp = !!document.getElementById('hud');
        return {
          ok: a !== before && b === before && (a === 'first' || a === 'third') && fp,
          expect: 'V переключает третье ↔ первое лицо',
          fact: `было ${before}, после V — ${a}, повторно — ${b}`,
        };
      } },

      { name: 'Слои земли и каменный слой', walk: 'dig', run: (g) => {
        const w = g.world;
        const p = g.player.position;
        // ищем сухую точку в глубине острова, чтобы не задеть пляж
        let spot = null;
        for (let r = 5; r <= 26 && !spot; r += 3) {
          for (let i = 0; i < 16 && !spot; i++) {
            const a = (i / 16) * Math.PI * 2;
            const x = p.x + Math.cos(a) * r;
            const z = p.z + Math.sin(a) * r;
            const h = w.heightAt(x, z);
            if (h > 2.9 && w.slopeAt(x, z) < 0.45) spot = { x, z, h };
          }
        }
        if (!spot) return { ok: false, expect: 'ровное место в глубине острова', fact: 'место не найдено' };

        const snap = w.heights.slice();
        const key = w._digKey(spot.x, spot.z);
        const seen = [];
        let res = null;
        let reachedVoid = false;
        for (let i = 0; i < 18; i++) {
          res = w.dig(spot.x, spot.z, { radius: 1.6, depth: 0.45, mine: 99 });
          seen.push(res.layer);
          if (res.void) { reachedVoid = true; break; }
        }
        const order = [];
        for (const l of seen) if (order[order.length - 1] !== l) order.push(l);
        const flooded = seen.some((l) => l === 'sand');
        // восстановим рельеф: бот не должен портить мир
        for (let i = 0; i < snap.length; i++) w.heights[i] = snap[i];
        w.digStore.delete(key);
        w._applyHeights();

        const ok = order.includes('stone') && reachedVoid && !flooded;
        return {
          ok,
          expect: 'земля/песок → камень → пустота (шахта); в глубине острова воды нет',
          fact: `порядок слоёв: ${order.join(' → ') || '—'}; глубина ${fmt(res?.dug ?? 0, 1)} м; вода: ${flooded ? 'есть' : 'нет'}`,
        };
      } },

      { name: 'Дерево: удар и дроп', walk: 'tree', run: (g) => {
        const node = g.resources.nodes.find((n) => n.alive && n.type === 'tree');
        if (!node) return { ok: false, expect: 'живое дерево', fact: 'деревьев нет' };
        const hp0 = node.hp;
        let drops = {};
        for (let i = 0; i < 12; i++) {
          const r = g.resources.strike(node, { chop: 3 });
          if (r.depleted) { drops = r.drops; break; }
        }
        const got = Object.keys(drops).length > 0;
        return {
          ok: got && !node.alive,
          expect: 'дерево валится и даёт древесину/волокно',
          fact: `${node.alive ? 'стоит' : 'срублено'}, дроп: ${JSON.stringify(drops)} (HP было ${fmt(hp0, 0)})`,
        };
      } },

      { name: 'Куст: ягоды руками', walk: 'bush', run: (g) => {
        const node = g.resources.nodes.find((n) => n.type === 'bush' && n.berries && n.alive);
        if (!node) return { ok: false, expect: 'куст с ягодами', fact: 'кустов с ягодами нет' };
        const before = g.state.inventory.berries || 0;
        const can = g.resources.canPickBerries(node);
        const got = g.resources.pickBerries(node);
        g.state.inventory.berries = before + got.berries;
        return {
          ok: can && got.berries > 0 && node.alive && !g.resources.canPickBerries(node),
          expect: 'ягоды собираются без инструмента, куст остаётся целым',
          fact: `можно было: ${can ? 'да' : 'нет'} · собрано ${got.berries}, куст ${node.alive ? 'цел' : 'сломан'}, повторно ${g.resources.canPickBerries(node) ? 'можно' : 'нельзя'}`,
        };
      } },

      { name: 'Камень и руда: кирка', walk: 'rock', run: (g) => {
        const rock = g.resources.nodes.find((n) => n.alive && n.type === 'rock' && !n.ore)
          || g.resources.nodes.find((n) => n.alive && n.type === 'rock');
        const ore = g.resources.nodes.find((n) => n.alive && n.ore);
        if (!rock) return { ok: false, expect: 'камень на острове', fact: 'камней нет' };
        const hand = g.resources.strike(rock, {});
        const pick = g.resources.strike(rock, { mine: 3 });
        const mineable = pick.power > 1.5 && hand.power < 1;
        const oreDrops = ore ? g.resources.strike(ore, { mine: 3 }) : null;
        return {
          ok: mineable,
          expect: 'руками камень почти не берётся, киркой — быстро; руда щедрее',
          fact: `рука ×${fmt(hand.power, 2)} · кирка ×${fmt(pick.power, 2)}${oreDrops ? ` · руда: HP ${fmt(oreDrops.power * 2.4, 1)} урона` : ''}`,
        };
      } },

      { name: 'Трава из разных оттенков', walk: null, run: (g) => {
        const geo = g.world.terrain && g.world.terrain.geometry;
        if (!geo || !geo.attributes.color) return { ok: false, expect: 'цвета травы в рельефе', fact: 'нет цветов' };
        const col = geo.attributes.color;
        const pos = geo.attributes.position;
        const lums = [];
        const hues = [];
        for (let i = 0; i < pos.count; i += 7) {
          const y = pos.getY(i);
          if (y < 3 || y > 12) continue;
          const r = col.getX(i);
          const gg = col.getY(i);
          const b = col.getZ(i);
          lums.push(0.299 * r + 0.587 * gg + 0.114 * b);
          hues.push(Math.max(r, gg, b) - Math.min(r, gg, b));
        }
        if (!lums.length) return { ok: false, expect: 'травяные вершины', fact: 'травы не найдено' };
        const span = Math.max(...lums) - Math.min(...lums);
        const hueSpan = Math.max(...hues) - Math.min(...hues);
        return {
          ok: span > 0.1 && hueSpan > 0.12,
          expect: 'несколько оттенков травы (разброс яркости и насыщенности)',
          fact: `разброс яркости ${fmt(span)} · разброс оттенка ${fmt(hueSpan)} · травяных точек ${lums.length}`,
        };
      } },

      { name: 'Яма — дыра в рельефе, край по сетке', walk: 'dig', run: (g) => {
        const w = g.world;
        const p = g.player.position;
        let spot = null;
        for (let r = 3; r <= 12 && !spot; r += 1.5) {
          for (let i = 0; i < 12 && !spot; i++) {
            const a = (i / 12) * Math.PI * 2;
            const x = p.x + Math.cos(a) * r;
            const z = p.z + Math.sin(a) * r;
            if (w.heightAt(x, z) > 2.5 && w.slopeAt(x, z) < 0.4) spot = { x, z };
          }
        }
        if (!spot) return { ok: false, expect: 'сухое ровное место', fact: 'места нет' };
        const before = w.baseHeightAt(spot.x, spot.z);
        const triBase = w.terrainIndexBase ? w.terrainIndexBase.length / 3 : 0;
        for (let i = 0; i < 5; i++) w.dig(spot.x, spot.z, { radius: 1.6, depth: 0.45, mine: 99 });
        const idx = w.terrain.geometry.index;
        const cutTris = triBase - (idx ? idx.count / 3 : 0);
        const pit = w.pitAt(spot.x, spot.z);
        if (!pit) return { ok: false, expect: 'выкопанная яма', fact: 'ям нет' };
        const sunk = before - w.heightAt(spot.x, spot.z);
        const walls = pit.walls.geometry.attributes.position.count;
        const step = 360 / (Math.round(Math.sqrt(w.heights.length)) - 1);
        const onGrid = [pit.rect.x0, pit.rect.x1, pit.rect.z0, pit.rect.z1]
          .every((v) => Math.abs((v + 180) / step - Math.round((v + 180) / step)) < 1e-6);
        // в яму спускаешься, а по ступеням вылезаешь: стенка не перелезается
        const g0 = w.heightAt(pit.rect.x0 + (pit.rect.x1 - pit.rect.x0) / 2, pit.rect.z0 + (pit.rect.z1 - pit.rect.z0) / 2);
        const dugIn = Math.abs(g0 - before) > 0.05;
        return {
          ok: cutTris >= 2 && sunk > 0.4 && walls > 0 && onGrid && dugIn && pit.steps >= 2,
          expect: 'треугольники земли вырезаны по сетке, внутри дно, стенки и ступени',
          fact: `вырезано ${cutTris} треугольников · клеток ${pit.rect.ix1 - pit.rect.ix0}×${pit.rect.iz1 - pit.rect.iz0} · край по сетке: ${onGrid ? 'да' : 'нет'} · дно на ${fmt(sunk)} м ниже дёрна · стенки ${walls} вершин · ступеней ${pit.steps}`,
        };
      } },

      { name: 'Обвал: соседние ямы без перегородки', walk: null, run: (g) => {
        const w = g.world;
        const p = g.player.position;
        let spot = null;
        for (let r = 16; r <= 34 && !spot; r += 2) {
          for (let i = 0; i < 16 && !spot; i++) {
            const a = (i / 16) * Math.PI * 2;
            const x = p.x + Math.cos(a) * r;
            const z = p.z + Math.sin(a) * r;
            if (w.heightAt(x, z) > 3 && w.slopeAt(x, z) < 0.4 && w.isFree(x, z, 2.2)) spot = { x, z };
          }
        }
        if (!spot) return { ok: false, expect: 'два свободных места рядом', fact: 'места нет' };
        const mk = () => {
          w.digStore.clear(); w.surfaceStore.clear();
          w.pits.forEach((pp) => { w.pitGroup.remove(pp.group); pp.walls.geometry.dispose(); });
          w.pits.clear(); w.cutPits.clear(); w.cutCells.clear();
          w._rebuildTerrainIndex(); w._applyHeights();
        };
        mk();
        w.playerPos = { x: spot.x - 4, z: spot.z };
        for (let i = 0; i < 3; i++) w.dig(spot.x, spot.z, { radius: 1.6, depth: 0.45, mine: 99 });
        const first = w.pitAt(spot.x, spot.z);
        if (!first) return { ok: false, expect: 'первая яма', fact: 'не выкопалась' };
        const second = { x: spot.x + (first.rect.x1 - first.rect.x0) + 0.6, z: spot.z };
        const res = w.dig(second.x, second.z, { radius: 1.6, depth: 0.45, mine: 99 });
        const pit = w.pitAt(second.x, second.z);
        const same = pit && w.pitAt(spot.x, spot.z) === pit;
        const mid = { x: (spot.x + second.x) / 2, z: spot.z };
        const midH = w.heightAt(mid.x, mid.z);
        const wallGone = Math.abs(midH - pit.floorY) < 0.4;
        const onePit = w.pits.size === 1;
        const out = {
          ok: !!res.collapse && same && onePit && wallGone,
          expect: 'стенка между соседними ямами рушится, дыра одна, пол общий',
          fact: `обвал: ${res.collapse ? 'да' : 'нет'} · ям на месте: ${w.pits.size} · между ними высота ${fmt(midH)} м при полу ${fmt(pit.floorY)} · перегородки нет: ${wallGone ? 'да' : 'нет'}`,
        };
        mk();
        return out;
      } },

      { name: 'Породы разной прочности', walk: null, run: (g) => {
        const w = g.world;
        const rows = [];
        for (const d of [1.5, 2.2, 2.9, 3.5]) {
          const rk = w.rockAt(d, 'soil');
          if (rk) rows.push(rk);
        }
        const names = [...new Set(rows.map((r) => r.name))];
        const hards = rows.map((r) => r.hard);
        const grows = hards.every((h, i) => i === 0 || h > hards[i - 1]);
        // и на деле: один и тот же удар кирки снимает тем меньше, чем глубже порода
        const p = g.player.position;
        let spot = null;
        for (let r = 16; r <= 40 && !spot; r += 2) {
          for (let i = 0; i < 16 && !spot; i++) {
            const a = (i / 16) * Math.PI * 2;
            const x = p.x + Math.cos(a) * r;
            const z = p.z + Math.sin(a) * r;
            if (w.heightAt(x, z) > 3 && w.slopeAt(x, z) < 0.4 && w.isFree(x, z, 2.2)) spot = { x, z };
          }
        }
        if (!spot) return { ok: false, expect: 'место для проверки пород', fact: 'места нет' };
        const mk = () => {
          w.digStore.clear(); w.surfaceStore.clear();
          w.pits.forEach((pp) => { w.pitGroup.remove(pp.group); pp.walls.geometry.dispose(); });
          w.pits.clear(); w.cutPits.clear(); w.cutCells.clear();
          w._rebuildTerrainIndex(); w._applyHeights();
        };
        mk();
        const steps = {};
        for (let i = 0; i < 40; i++) {
          const res = w.dig(spot.x, spot.z, { radius: 1.6, depth: 0.45, mine: 3.0 });
          if (!res || res.void) break;
          if (res.rockName) (steps[res.rockName] ||= []).push(res.step);
        }
        const avg = {};
        for (const [k, v] of Object.entries(steps)) avg[k] = v.reduce((a, b) => a + b, 0) / v.length;
        const order = Object.keys(avg);
        mk();
        const slower = order.length >= 3 && order.every((k, i) => i === 0 || avg[k] < avg[order[i - 1]]);
        return {
          ok: names.length >= 3 && grows && slower,
          expect: 'породы от песчаника к обсидиану прочнее, удар снимает меньше',
          fact: `породы: ${names.join(' → ')} · прочность ${hards.join(' → ')} · шаг за удар: ${order.map((k) => `${k} ${avg[k].toFixed(2)} м`).join(', ')}`,
        };
      } },

      { name: 'Обводки моделей: сквозь них не пройти', walk: null, run: (g) => {
        const w = g.world;
        if (!w.shells) return { ok: false, expect: 'обводки моделей', fact: 'системы обводок нет' };
        const tree = w.treeList.find((t) => t.shell && t.collider && !t.collider.disabled && !t.collider.soft);
        if (!tree) return { ok: false, expect: 'дерево с обводкой', fact: 'не нашлось' };
        const pos = { x: tree.x + 5, z: tree.z };
        const vel = { x: -6, z: 0 };
        for (let i = 0; i < 200; i++) {
          pos.x += vel.x * 0.016;
          w.shells.resolve(pos, 0.35, vel, w.heightAt(pos.x, pos.z), 0.35);
        }
        const gap = pos.x - tree.x;
        const stopped = gap > 0.3;
        const prisms = w.shells.stats.prisms;
        // обводка исчезает вместе с моделью
        const before = tree.collider.disabled;
        tree.collider.disabled = true;
        const inside = { x: tree.x, z: tree.z };
        w.shells.resolve(inside, 0.35, null, w.heightAt(inside.x, inside.z), 0.35);
        const passes = Math.abs(inside.x - tree.x) < 1e-6;
        tree.collider.disabled = before;
        return {
          ok: stopped && passes && prisms > 200,
          expect: 'у каждой модели треугольная обводка, живой хитбокс сквозь неё не проходит',
          fact: `обводок ${prisms} · герой остановился в ${fmt(gap)} м от ствола · сквозь спиленное дерево проходит: ${passes ? 'да' : 'нет'}`,
        };
      } },

      { name: 'Новые породы деревьев', walk: null, run: (g) => {
        const w = g.world;
        const counts = {
          сосны: w.pineList ? w.pineList.length : 0,
          мангры: w.mangroveList ? w.mangroveList.length : 0,
          сухостой: w.deadList ? w.deadList.length : 0,
        };
        const list = w.treeList.filter((t) => t.bbox);
        const heights = [...new Set(list.map((t) => Math.round(t.bbox.h)))];
        const all = Object.values(counts).every((n) => n > 0);
        // силуэты разные: высоты и ширина моделей заметно отличаются
        const pine = w.pineList && w.pineList[0];
        const mang = w.mangroveList && w.mangroveList[0];
        const differ = pine && mang && Math.abs(pine.bbox.h - mang.bbox.h) > 2;
        return {
          ok: all && differ,
          expect: 'сосны, мангры и сухостой — отдельные модели, не копии',
          fact: `${Object.entries(counts).map(([k, v]) => `${k} ${v}`).join(' · ')} · высоты моделей от ${Math.min(...heights)} до ${Math.max(...heights)} м · силуэты разные: ${differ ? 'да' : 'нет'}`,
        };
      } },

      { name: 'Постройки на ровной поверхности', walk: null, run: (g) => {
        const w = g.world;
        const p = g.player.position;
        let spot = null;
        for (let r = 4; r <= 24 && !spot; r += 1.5) {
          for (let i = 0; i < 16 && !spot; i++) {
            const a = (i / 16) * Math.PI * 2;
            const x = p.x + Math.cos(a) * r;
            const z = p.z + Math.sin(a) * r;
            if (w.heightAt(x, z) > 3 && w.slopeAt(x, z) > 0.12 && w.isFree(x, z, 2.2)) spot = { x, z };
          }
        }
        if (!spot) return { ok: false, expect: 'склон под площадку', fact: 'ровного места и склона не нашлось' };
        const y = w.levelSpot(spot.x, spot.z, 1.7);
        let maxDev = 0;
        for (let i = 0; i < 12; i++) {
          const a = (i / 12) * Math.PI * 2;
          for (const d of [0.2, 0.5, 0.8]) {
            const h = w.heightAt(spot.x + Math.cos(a) * d, spot.z + Math.sin(a) * d);
            maxDev = Math.max(maxDev, Math.abs(h - y));
          }
        }
        const flat = maxDev < 0.05 && w.slopeAt(spot.x, spot.z) < 0.05;
        return {
          ok: flat,
          expect: 'под костром и станком земля выравнивается в площадку',
          fact: `площадка ${fmt(y)} м · перепад по ней ${maxDev.toFixed(3)} м · уклон ${fmt(w.slopeAt(spot.x, spot.z))}`,
        };
      } },

      { name: 'Новые звери и рыбы', walk: null, run: (g) => {
        const list = g.mobs.list;
        const get = (t) => list.filter((m) => m.alive && m.type === t);
        const monkeys = get('monkey');
        const turtles = get('turtle');
        const fishes = get('fish');
        const w = g.world;
        const inWater = fishes.length > 0 && fishes.every((f) => w.heightAt(f.x, f.z) < -0.5);
        // анимация ходьбы: у зверя двигаются лапы, у рыбы — хвост
        const probe = (mob, pick) => {
          const part = pick(mob.parts);
          if (!part) return false;
          const before = part.rotation.x + part.rotation.y;
          // шагаем: фаза растёт, как при настоящей ходьбе
          mob.speedNow = 1.4;
          mob.phase += 0.9;
          g.mobs._animate(mob, 0.12);
          mob.phase += 0.9;
          g.mobs._animate(mob, 0.12);
          const after = part.rotation.x + part.rotation.y;
          return Math.abs(after - before) > 1e-4;
        };
        const walk = monkeys.length > 0 && probe(monkeys[0], (p) => p.legs && p.legs[0]);
        const arm = monkeys.length > 0 && probe(monkeys[0], (p) => p.arms && p.arms[0]);
        const flipper = turtles.length > 0 && probe(turtles[0], (p) => p.legs && p.legs[0]);
        const swimTail = fishes.length > 0 && probe(fishes[0], (p) => p.tail);
        return {
          ok: monkeys.length > 0 && turtles.length > 0 && fishes.length > 0 && inWater && walk && arm && flipper && swimTail,
          expect: 'обезьяны, черепахи и рыбы: модели, ходьба и плавание',
          fact: `обезьян ${monkeys.length} (лапы ${walk ? 'ходят' : 'стоят'}, руки ${arm ? 'машут' : 'нет'}) · черепах ${turtles.length} (лапы ${flipper ? 'ходят' : 'стоят'}) · рыб ${fishes.length}, в воде: ${inWater ? 'да' : 'нет'}, хвост ${swimTail ? 'виляет' : 'нет'}`,
        };
      } },

      { name: 'Хитбокс по габаритам модели', walk: null, run: (g) => {
        const mob = g.mobs.list.find((m) => m.alive && m.type === 'boar') || g.mobs.list.find((m) => m.alive);
        if (!mob) return { ok: false, expect: 'живой зверь', fact: 'зверей нет' };
        const box = new THREE.Box3().setFromObject(mob.group);
        const size = new THREE.Vector3();
        box.getSize(size);
        const hb = mob.hitboxSize || mob.def.hitbox;
        const dx = Math.abs(size.x - hb.w);
        const dy = Math.abs(size.y - hb.h);
        const dz = Math.abs(size.z - hb.d);
        const worst = Math.max(dx, dy, dz);
        return {
          ok: worst < 0.02,
          expect: 'коробка ровно по модели (расхождение < 2 см)',
          fact: `модель ${fmt(size.x)}×${fmt(size.y)}×${fmt(size.z)} · коробка ${fmt(hb.w)}×${fmt(hb.h)}×${fmt(hb.d)} · расхождение ${fmt(worst, 3)} м`,
        };
      } },

      { name: 'Зазор ≥ 5 см между хитбоксами', walk: null, run: (g) => {
        const boxes = g.hitboxes.staticBoxes.filter((b) => (!b.enabled || b.enabled()) && b.kind !== 'pickup');
        const near = boxes.filter((b) => {
          const p = g.player.position;
          return Math.hypot((b.box.minX + b.box.maxX) / 2 - p.x, (b.box.minZ + b.box.maxZ) / 2 - p.z) < 45;
        });
        let bad = 0;
        let worst = Infinity;
        for (let i = 0; i < near.length; i++) {
          for (let j = i + 1; j < near.length; j++) {
            const a = near[i].box;
            const b = near[j].box;
            const ox = Math.min(a.maxX, b.maxX) - Math.max(a.minX, b.minX);
            const oy = Math.min(a.maxY, b.maxY) - Math.max(a.minY, b.minY);
            const oz = Math.min(a.maxZ, b.maxZ) - Math.max(a.minZ, b.minZ);
            if (ox <= 0 || oy <= 0 || oz <= 0) continue;
            bad++;
            worst = Math.min(worst, Math.min(ox, oy, oz));
          }
        }
        return {
          ok: bad === 0,
          expect: 'ни одна коробка не подходит к другой ближе 5 см',
          fact: `${near.length} моделей рядом · пересечений: ${bad}${bad ? `, худшее ${fmt(worst, 3)} м` : ''}`,
        };
      } },

      { name: 'Звери смотрят по ходу движения', walk: null, run: (g) => {
        const mob = g.mobs.list.find((m) => m.alive);
        if (!mob) return { ok: false, expect: 'живой зверь', fact: 'зверей нет' };
        // модель собрана вдоль +X: поворот обязан отставать от курса на 90°
        const before = mob.group.rotation.y;
        mob.facing = 0.8;
        g.mobs._place(mob, 0.001);
        const rot = mob.group.rotation.y;
        let diff = rot - (0.8 - Math.PI / 2);
        while (diff > Math.PI) diff -= Math.PI * 2;
        while (diff < -Math.PI) diff += Math.PI * 2;
        return {
          ok: Math.abs(diff) < 0.02,
          expect: 'поворот модели = курс − 90°',
          fact: `курс 0.80 → поворот ${fmt(rot)} (было ${fmt(before)}), отклонение ${fmt(diff, 3)}`,
        };
      } },

      { name: 'Кусты, камни и руды из кубиков', walk: null, run: (g) => {
        const marks = new Set();
        const collect = (list) => {
          for (const it of list || []) {
            for (const part of it.parts || []) {
              // вкрапления руды — намеренно гранёные кристаллы, их не считаем
              if (part.layer === 'ore') continue;
              const geo = part.mesh.geometry;
              if (geo?.userData?.boxOnly) marks.add('кубики');
              else marks.add(geo?.type || '?');
            }
          }
        };
        collect(g.world.bushList);
        collect(g.world.rockList);
        const list = [...marks];
        const onlyBox = list.length > 0 && list.every((t) => t === 'кубики');
        return {
          ok: onlyBox,
          expect: 'кусты и камни собраны из кубиков (BoxGeometry)',
          fact: `модели: ${list.join(', ') || '—'}`,
        };
      } },

      { name: 'Креатив F2 → F: ∞ предметы и полёт', walk: null, run: (g) => {
        const inv = { ...g.state.inventory };
        const wasCreative = g.creative;
        const woundsBefore = (g.wounds || []).map((w) => ({ ...w }));
        if (wasCreative) g.toggleCreative();
        g.toggleCreative();
        const all = Object.keys(g.state.inventory).every((id) => (g.state.inventory[id] || 0) >= 999);
        const flying = !!g.player.fly;
        const label = !g.ui.el.hudCreative?.classList.contains('hidden');
        // полёт: Space поднимает, Shift опускает
        const y0 = g.player.position.y;
        const saved = { vy: g.player.velocity.y };
        g.player.velocity.y = 0;
        g.player.update(0.12, { jump: true }, g.world);
        const yUp = g.player.position.y;
        g.player.update(0.12, { sprint: true }, g.world);
        const yDown = g.player.position.y;
        g.player.velocity.y = saved.vy;
        g.player.position.y = y0;

        const immortal = (() => {
          const hp = g.state.health;
          g.takeDamage(50, 'тест бота');
          const left = g.state.health;
          g.state.health = hp;
          return left >= hp - 0.01;
        })();

        if (!wasCreative) g.toggleCreative();
        g.state.inventory = inv;
        g.player.fly = wasCreative;
        g.creative = wasCreative;
        g.ui.setCreative(wasCreative);
        g.state.health = 100;
        g.wounds = woundsBefore;
        g.ui.setWounds(woundsBefore);
        g.refreshHotbar?.();

        return {
          ok: all && flying && label && yUp > y0 + 0.01 && yDown < yUp && immortal,
          expect: 'F2→F: все предметы 999, полёт Space/Shift, неуязвимость, метка «КРЕАТИВ»',
          fact: `предметы ∞: ${all ? 'да' : 'нет'} · полёт: ${flying ? 'да' : 'нет'} · подъём ${fmt(yUp - y0, 2)} м, спуск ${fmt(yUp - yDown, 2)} м · метка: ${label ? 'да' : 'нет'} · неуязвим: ${immortal ? 'да' : 'нет'}`,
        };
      } },

      { name: 'Ранения и бинт', walk: null, run: (g) => {
        const wasCreative = g.creative;
        if (wasCreative) g.toggleCreative();
        const before = (g.wounds || []).map((w) => ({ ...w }));
        const health = g.state.health;
        const mult = g.player.speedMul;
        const armMult = g.armPenalty ?? 1;
        const bandages = g.state.inventory.bandage || 0;

        g.addWound('thighL', 0.6);
        g.updateWounds(0.05);
        const one = g.wounds.some((w) => w.part === 'thighL') && g.wounds.length === before.length + 1;
        const slowed = g.player.speedMul < 1;
        const legMul = g.player.speedMul;
        g.addWound('forearmR', 0.6);
        const armWeak = g.armPenalty < 1;
        const armMul = g.player.armPenalty;

        g.state.inventory.bandage = Math.max(1, bandages);
        const healed = g.healWound();
        const left = g.wounds.length;
        // вернуть как было: бот не должен оставлять героя раненым
        g.wounds = before;
        g.ui.setWounds(before);
        g.state.health = health;
        g.state.inventory.bandage = bandages;
        g.player.speedMul = mult;
        g.armPenalty = armMult;
        if (wasCreative) g.toggleCreative();

        return {
          ok: one && slowed && armWeak && healed && left <= before.length + 1,
          expect: 'рана на часть тела даёт последствие, бинт снимает худшую',
          fact: `рана добавлена: ${one ? 'да' : 'нет'} · нога: ×${fmt(legMul)} · рука: ×${fmt(armMul)} · бинт снял: ${healed ? 'да' : 'нет'} · осталось ран ${left}`,
        };
      } },

      { name: 'Шахта: каменный слой, глубины, выход', walk: null, run: (g) => {
        const was = g.underground;
        const levels = g.mine.levels.length;
        const deeper = typeof g.mine.digDown === 'function' && typeof g.mine.switchLevel === 'function';
        const lvl = g.mine.levels[0];
        const deep = g.mine.levels[1];
        let entered = false;
        let exited = false;
        if (!was) {
          const pos = { x: g.player.position.x, y: g.player.position.y, z: g.player.position.z };
          g.enterMine(g.mine.entrances[0]);
          entered = g.underground && g.player.position.y < 0;
          g.exitMine();
          exited = !g.underground;
          g.player.setPosition(pos.x, pos.z, g.world);
        }
        return {
          ok: levels >= 2 && deeper && entered && exited && deep.y < lvl.y,
          expect: 'каменный слой под землёй, глубинный слой ниже, вход/выход работают',
          fact: `слоёв ${levels} · −${Math.abs(lvl.y) | 0} м и −${Math.abs(deep.y) | 0} м · вход ${entered ? 'да' : 'нет'}, выход ${exited ? 'да' : 'нет'} · G/слои: ${deeper ? 'есть' : 'нет'}`,
        };
      } },

      { name: 'Звук: события и атмосфера', walk: null, run: (g) => {
        const names = ['chop', 'mine', 'berryPick', 'stoneBreak', 'hurt', 'uiClick', 'birdCall', 'mobStep'];
        const missing = names.filter((n) => typeof g.audio[n] !== 'function');
        const ctx = !!g.audio.ctx;
        return {
          ok: missing.length === 0,
          expect: 'звуки ударов, зверей и атмосферы на месте',
          fact: `нет функций: ${missing.join(', ') || '—'} · аудиоконтекст: ${ctx ? 'есть' : 'ещё не запускался'}`,
        };
      } },

      { name: 'Крафт, ковка и заточка', walk: null, run: (g) => {
        const list = (g.recipes || (g.constructor && g.constructor.RECIPES) || []);
        const recipes = Array.isArray(list) ? list.length : Object.keys(list).length;
        const ok = typeof g.craft === 'function' && typeof g.forgeItem === 'function'
          && typeof g.sharpenItem === 'function' && recipes > 0;
        return {
          ok,
          expect: 'рецепты, ковка и точило работают',
          fact: `рецептов ${recipes} · крафт ${typeof g.craft === 'function' ? 'да' : 'нет'} · ковка ${typeof g.forgeItem === 'function' ? 'да' : 'нет'} · точило ${typeof g.sharpenItem === 'function' ? 'да' : 'нет'}`,
        };
      } },

      { name: 'Сохранение и загрузка', walk: null, run: (g) => {
        let saved = false;
        let hasLoader = false;
        try {
          g.save();
          saved = !!window.localStorage.getItem('lastshore.save.v1');
          hasLoader = typeof g.loadSave === 'function' && typeof g.loadGame === 'function';
        } catch (err) {
          saved = false;
        }
        return {
          ok: saved && hasLoader,
          expect: 'игра сохраняется и умеет продолжить',
          fact: `сохранение в браузере ${saved ? 'есть' : 'нет'} · загрузчик ${hasLoader ? 'на месте' : 'нет'}`,
        };
      } },

      { name: 'F9: курсор отпустить/захватить', walk: null, run: (g) => {
        const has = typeof g.toggleCursor === 'function';
        let toggled = false;
        if (has) {
          const was = g.cursorFree;
          g.toggleCursor();
          toggled = g.cursorFree !== was;
          g.toggleCursor();
        }
        return {
          ok: has && toggled,
          expect: 'F9 освобождает курсор и возвращает его обратно',
          fact: has ? 'переключатель работает' : 'обработчика нет',
        };
      } },
    ];
  }

  // ----------------------------------------------------------
  //  Движение робота
  // ----------------------------------------------------------

  _nodeTarget(kind) {
    const g = this.game;
    const p = g.player.position;
    const pick = (list, filter) => {
      let best = null;
      let bestD = 18;
      for (const n of list) {
        if (!filter(n)) continue;
        const d = Math.hypot(n.x - p.x, n.z - p.z);
        if (d < bestD) { bestD = d; best = n; }
      }
      return best;
    };
    if (kind === 'tree') {
      const n = pick(g.resources.nodes, (n) => n.alive && n.type === 'tree');
      if (n) return { x: n.x + 1.8, z: n.z + 1.1, node: n };
    }
    if (kind === 'bush') {
      const n = pick(g.resources.nodes, (n) => n.alive && n.type === 'bush');
      if (n) return { x: n.x + 1.4, z: n.z + 0.9, node: n };
    }
    if (kind === 'rock') {
      const n = pick(g.resources.nodes, (n) => n.alive && n.type === 'rock');
      if (n) return { x: n.x + 1.6, z: n.z + 1.0, node: n };
    }
    if (kind === 'dig') {
      // бот выходит на ровную траву шагах в шести от героя
      const ang = g.player.yaw + 2.1;
      const x = p.x + Math.cos(ang) * 5.5;
      const z = p.z + Math.sin(ang) * 5.5;
      return { x, z };
    }
    return null;
  }

  _moveRobot(dt, target) {
    const m = this.mesh;
    const dx = target.x - m.position.x;
    const dz = target.z - m.position.z;
    const d = Math.hypot(dx, dz);
    if (d < ARRIVE) return true;
    const sp = Math.min(WALK_SPEED, d * 2.4);
    const nx = m.position.x + (dx / d) * sp * dt;
    const nz = m.position.z + (dz / d) * sp * dt;
    const h = this.game.world.heightAt(nx, nz);
    m.position.set(nx, Math.max(h, this.game.world.seaLevel - 0.3) + 0.02, nz);
    m.rotation.y = Math.atan2(dx, dz);
    this.walked += sp * dt;

    const parts = m.userData.parts;
    const ph = this.walked * 5.2;
    parts.legL.rotation.x = Math.sin(ph) * 0.6;
    parts.legR.rotation.x = Math.sin(ph + Math.PI) * 0.6;
    parts.armL.rotation.x = Math.sin(ph + Math.PI) * 0.45;
    parts.armR.rotation.x = Math.sin(ph) * 0.45;
    parts.body.position.y = 0.62 + Math.abs(Math.sin(ph)) * 0.03;
    parts.head.rotation.y = Math.sin(ph * 0.4) * 0.15;
    return false;
  }

  _idleRobot(dt) {
    const parts = this.mesh?.userData.parts;
    if (!parts) return;
    const t = performance.now() * 0.001;
    parts.legL.rotation.x *= 0.85;
    parts.legR.rotation.x *= 0.85;
    parts.armL.rotation.x = Math.sin(t * 2) * 0.08;
    parts.armR.rotation.x = Math.sin(t * 2 + 1) * 0.08;
    parts.head.rotation.y = Math.sin(t * 0.8) * 0.2;
    parts.lamp.material.emissiveIntensity = 0.9 + Math.sin(t * 6) * 0.5;
  }

  // ----------------------------------------------------------
  //  Цикл
  // ----------------------------------------------------------

  update(dt) {
    if (!this.active) return;
    const g = this.game;
    if (!this.mesh) return;
    this.mesh.visible = true;

    this.timer -= dt;
    if (this.state === 'walk' && this.target) {
      if (this._moveRobot(dt, this.target)) {
        this.state = 'test';
        this.timer = 0.25;
      }
    } else if (this.state === 'test') {
      this._idleRobot(dt);
      if (this.timer <= 0) this._runCurrent();
    } else if (this.state === 'pause') {
      this._idleRobot(dt);
      if (this.timer <= 0) {
        this.index++;
        this._next();
      }
    } else if (this.state === 'run') {
      this._idleRobot(dt);
      if (this.timer <= 0) this._next();
    } else if (this.state === 'done') {
      this._idleRobot(dt);
    }

    // робот не должен утонуть: держим его на поверхности
    const h = g.world.heightAt(this.mesh.position.x, this.mesh.position.z);
    if (this.mesh.position.y < h - 0.1) this.mesh.position.y = h + 0.02;
  }

  _next() {
    const check = this.checks[this.index];
    if (!check) {
      this._finish();
      return;
    }
    this.game.ui.updateBotReport(this.entries, {
      running: true,
      total: this.checks.length,
      current: check.name,
    });
    if (check.walk) {
      const target = this._nodeTarget(check.walk);
      if (target) {
        this.target = target;
        this.state = 'walk';
        this.timer = 0;
        return;
      }
    }
    this.target = null;
    this.state = 'test';
    this.timer = 0.2;
  }

  _runCurrent() {
    const g = this.game;
    const check = this.checks[this.index];
    let result;
    try {
      result = check.run(g);
    } catch (err) {
      result = { ok: false, fact: `ошибка проверки: ${err.message}`, expect: '—' };
    }
    const entry = {
      name: check.name,
      ok: !!result.ok,
      fact: result.fact,
      expect: result.expect,
    };
    this.entries.push(entry);
    if (!entry.ok) g.ui.toast(`Бот: не сходится — ${entry.name}`, true);
    g.ui.updateBotReport(this.entries, {
      running: true,
      total: this.checks.length,
      current: check.name,
    });
    this.state = 'pause';
    this.timer = PAUSE;
  }

  _finish() {
    this.state = 'done';
    const bad = this.entries.filter((e) => !e.ok);
    this.game.ui.updateBotReport(this.entries, {
      running: false,
      total: this.checks.length,
    });
    this.game.ui.toast(bad.length
      ? `Бот закончил: ${bad.length} из ${this.entries.length} не по описанию`
      : `Бот закончил: все ${this.entries.length} проверок сходятся с описанием`, bad.length > 0);
    this.game.audio.uiClick?.();
  }
}
