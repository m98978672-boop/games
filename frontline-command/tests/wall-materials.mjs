// Новые требования к неповреждённым материалам: настоящие лучи с обеих сторон.
import assert from 'node:assert/strict';
import { loadConfig } from '../src/core/config.js';
import { Game } from '../src/sim/game.js';
import { RNG } from '../src/core/rng.js';
const cfg = await loadConfig();
const game = new Game({ cfg, seed: 7, difficulty: 'regular', aiVsAi: true });
const sandbag = game.world.addBuilding({ type: 'sandbags', x: 2050, y: 2050, faction: 0, instant: true });
game.walls.attach(sandbag);
const targets = [
  ['city', 'brick', ['pistol', 'rifle', 'smg', 'mg']],
  ['hq', 'concrete', ['pistol', 'rifle', 'smg', 'mg', 'sniper']],
  ['sandbags', 'sandbag', ['pistol', 'rifle', 'smg', 'mg', 'sniper']],
];
let shots = 0;
const rng = new RNG(218);
for (const [type, material, weapons] of targets) {
  const b = game.world.buildings.find((x) => x.type === type && game.walls.state(x));
  assert.ok(b, type);
  const st = game.walls.state(b);
  const seg = st.outline.segments.find((s) => s.material === material && s.length >= 30);
  assert.ok(seg, `${type}: нет сегмента`);
  const [[ax, ay], [bx, by]] = seg.points;
  const mx = b.x + (ax + bx) / 2, my = b.y + (ay + by) / 2;
  const len = Math.hypot(bx - ax, by - ay), nx = -(by - ay) / len, ny = (bx - ax) / len;
  for (const weapon of weapons) for (const side of [-1, 1]) {
    assert.equal(game.walls.penetrationChance(material, weapon, 'intact'), 0, `${material}/${weapon}`);
    for (let i = 0; i < 1000; i++) {
      const hit = game.walls.bulletRay(mx + side * nx * 20, my + side * ny * 20,
        mx - side * nx * 20, my - side * ny * 20, weapon, rng);
      assert.equal(hit.blocked, true, `${material}/${weapon}: луч прошёл`);
      assert.equal(hit.segId, seg.id, `${material}/${weapon}: луч попал не в проверяемую стену`);
      assert.equal(hit.material, material);
      shots++;
    }
  }
}
assert.ok(game.walls.penetrationChance('wood', 'rifle', 'intact') > 0, 'дерево остаётся пробиваемым');
assert.ok(game.walls.penetrationChance('brick', 'sniper', 'intact') > 0, 'снайпер пробивает кирпич');
assert.ok(game.walls.penetrationChance('concrete', 'tank_cannon', 'intact') > 0, 'орудие пробивает бетон');
console.log(`материалы: ${shots} выстрелов в целые стены с обеих сторон, непредусмотренных пробитий 0`);
