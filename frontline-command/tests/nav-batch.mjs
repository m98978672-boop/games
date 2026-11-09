// ALG-04: множество изменений стен за тик обновляет маску одним rebuild.
import assert from 'node:assert/strict';
import { loadConfig } from '../src/core/config.js';
import { Game } from '../src/sim/game.js';

async function scene(enabled, wallCollision = true) {
  const cfg = await loadConfig();
  cfg.flags.pathing_v2 = enabled;
  cfg.flags.wall_collision_v2 = wallCollision;
  cfg.navBudget.maxChunksPerFrame = 2;
  const game = new Game({ cfg, seed: 15, aiVsAi: true });
  const walls = game.walls;
  walls.navQueue.clear();
  const candidates = game.world.buildings.filter((b) => {
    const state = walls.state(b);
    return state && Object.keys(state.doors).length;
  }).slice(0, 3);
  assert.equal(candidates.length, 3, 'три строения с дверьми');
  for (const b of candidates) {
    const id = Object.keys(walls.state(b).doors)[0];
    walls.openDoor(b, id);
    // Повтор одного изменения не увеличивает очередь.
    walls.queueNavRebuild(b);
  }
  assert.equal(walls.navQueue.size, 3);
  let rebuilds = 0, reindexed = 0;
  const rebuild = game.world.rebuildNav.bind(game.world);
  game.world.rebuildNav = () => { rebuilds++; return rebuild(); };
  const reindex = walls.reindex.bind(walls);
  walls.reindex = (...args) => { reindexed++; return reindex(...args); };
  walls.flushNav();
  game.nav.advance();
  const afterFirst = {
    rebuilds, reindexed, queued: walls.navQueue.size,
    walk: [...game.world.walk], baseWalk: [...game.world.baseWalk],
    vision: [...game.world.losBlock], solid: [...game.world.solidBlock], nav: [...game.nav.openArr],
    collision: candidates.flatMap((b) => {
      const opening = walls.state(b).outline.openings.find((o) => o.type === 'door' || o.type === 'gate');
      return [-30, -15, 0, 15, 30].map((shift) => walls.blocksMove(b.x + opening.cx + opening.nx * shift,
        b.y + opening.cy + opening.ny * shift, 9));
    }),
  };
  walls.flushNav();
  const afterSecond = { rebuilds, reindexed, queued: walls.navQueue.size };
  walls.flushNav();
  assert.equal(rebuilds, afterSecond.rebuilds, 'пустая очередь не вызывает rebuild');
  return { afterFirst, afterSecond };
}
const before = await scene(false);
const after = await scene(true);
assert.equal(before.afterFirst.rebuilds, 2, 'legacy: один полный rebuild на объект');
assert.equal(after.afterFirst.rebuilds, 1, 'новый режим объединяет перестройки');
assert.equal(after.afterFirst.reindexed, 2, 'ограничение числа обработанных объектов соблюдено');
assert.equal(after.afterFirst.queued, 1, 'остаток отложен на следующий кадр');
for (const key of ['walk','baseWalk','vision','solid','nav','collision']) {
  assert.deepEqual(after.afterFirst[key], before.afterFirst[key], `результат ${key} совпадает`);
}
assert.deepEqual(before.afterSecond, { rebuilds: 3, reindexed: 3, queued: 0 });
assert.deepEqual(after.afterSecond, { rebuilds: 2, reindexed: 3, queued: 0 });
const noWalls = await scene(true, false);
assert.equal(noWalls.afterFirst.rebuilds, 2, 'без стен действует прежнее поведение');
const zeroCfg = await loadConfig();
zeroCfg.navBudget.maxChunksPerFrame = 0;
const zeroGame = new Game({ cfg: zeroCfg, seed: 15, aiVsAi: true });
zeroGame.walls.navQueue.clear();
zeroGame.walls.queueNavRebuild(zeroGame.world.buildings[0]);
const version = zeroGame.world.navVersion;
zeroGame.walls.flushNav();
assert.equal(zeroGame.world.navVersion, version, 'при нулевом бюджете нет перестроения');
assert.equal(zeroGame.walls.navQueue.size, 1, 'изменение сохраняется в очереди');
console.log('пакет навигации: за 2 кадра legacy 3 полных перестройки, новый режим 2; маски и коллизии совпали');
