// Быстрый прогон симуляции без браузера: ищет исключения и проверяет базовые инварианты.
import { loadConfig } from '../src/core/config.js';
import { Game } from '../src/sim/game.js';

const cfg = await loadConfig();
console.log('config loaded:', Object.keys(cfg.weapons).length, 'weapons,', cfg.sectors.points.length, 'points');
const game = new Game({ cfg, seed: 42, difficulty: 'regular' });
console.log('squads', game.squads.size, 'units', game.units.size);

let t0 = Date.now();
for (let i = 0; i < 600; i++) game.step(0.1);
const ms = Date.now() - t0;
const alive = [...game.units.values()].filter((u) => u.alive).length;
const pts = game.world.points.map((p) => `${p.id}:${p.owner}`).join(' ');
console.log('60s sim in', ms, 'ms; units', game.units.size, 'alive', alive, 'squads', game.squads.size);
console.log('points', pts);
console.log('influence', game.world.sectors.slice(0, 8).map((s) => s.influence.toFixed(2)).join(','));
console.log('orders', game.api.stats, 'journal', game.api.journal.slice(-4));
console.log('alerts', game.alertLog.slice(-5).map(a=>a.text));
console.log('supply', game.logistics.stock.map(s=>({ammo:Math.round(s.ammo),mat:Math.round(s.materials)})));
console.log('delivered', game.logistics.delivered);
console.log('player hp', game.playerUnit && game.playerUnit.hp, 'alive', game.playerUnit && game.playerUnit.alive);
