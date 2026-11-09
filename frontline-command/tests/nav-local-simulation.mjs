// Парная динамическая симуляция с изменением дверей: выбранные поля, не полный реплей.
import assert from 'node:assert/strict';
import { loadConfig } from '../src/core/config.js';
import { Game } from '../src/sim/game.js';

function selected(g) {
  return { time: g.time, rng: g.rng.s, stats: g.stats, warOver: g.warOver,
    units: [...g.units.values()].map((u) => ({ id: u.id, x: u.x, y: u.y, alive: u.alive, hp: u.hp,
      goal: u.goal, arrived: u.arrived, pathFailed: u.pathFailed, activity: u.activity })),
    walk: [...g.world.walk] };
}
for (const seed of [5, 7, 11]) {
  const games = [];
  for (const local of [false, true]) {
    const cfg = await loadConfig(); cfg.flags.wall_nav_local = local;
    const game = new Game({ cfg, seed, difficulty: 'regular', aiVsAi: true });
    games.push(game);
  }
  for (let tick = 0; tick < 300; tick++) {
    // Одно принудительное изменение за раз: не маскируем обычный ИИ/двери.
    if (tick % 10 === 0) for (const game of games) {
      const buildings = game.world.buildings.filter((b) => Object.keys(game.walls.state(b)?.doors || {}).length);
      const b = buildings[(tick / 10) % buildings.length];
      const id = Object.keys(game.walls.state(b).doors)[0];
      game.walls.toggleDoor(b, id);
    }
    for (const game of games) game.step(0.1);
    if (tick % 10 === 0 || tick === 299) {
      assert.deepEqual(selected(games[1]), selected(games[0]), `seed ${seed}, tick ${tick}`);
      // Legacy обновляет сетку на следующем advance; локальный вариант раньше.
      if (games[0].nav.version === games[0].world.navVersion) {
        assert.deepEqual(games[1].nav.openArr, games[0].nav.openArr, `seed ${seed}, tick ${tick}: сетка`);
      }
    }
  }
}
console.log('локальная навигация: выбранное состояние и RNG совпали on/off при 30 принудительных переключениях двери, 3 seed × 300 тиков');
