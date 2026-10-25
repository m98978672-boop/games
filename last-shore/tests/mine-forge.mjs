// Шахта и кузница: два слоя под землёй, добыча стен, ковка и заточка.
// Запуск: node tests/mine-forge.mjs (нужен npm run test:build)
import { JSDOM } from 'jsdom';
import fs from 'node:fs';
import path from 'node:path';

const dir = path.resolve(import.meta.dirname, '..');
const html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8');
const dom = new JSDOM(html, { url: 'https://example.com/', pretendToBeVisual: true, runScripts: 'outside-only' });
const { window } = dom;
globalThis.window = window;
globalThis.document = window.document;
Object.defineProperty(globalThis, 'navigator', { value: window.navigator, configurable: true });
globalThis.HTMLElement = window.HTMLElement;
globalThis.requestAnimationFrame = (cb) => setTimeout(() => cb(performance.now()), 16);
globalThis.localStorage = window.localStorage;
window.requestAnimationFrame = globalThis.requestAnimationFrame;

const code = fs.readFileSync(path.join(dir, 'tests/.harness-bundle.js'), 'utf8');
new Function(code)();
window.document.dispatchEvent(new window.Event('DOMContentLoaded', { bubbles: true }));
window.document.getElementById('btn-start').dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
await new Promise((r) => setTimeout(r, 300));

const game = window.__game;
if (!game) throw new Error('game not created');
const log = (...a) => console.log(...a);
const mine = game.mine;

log('слоёв в шахте:', mine.levels.length,
  '· входов на поверхности:', mine.entrances.length,
  '· первый вход:', mine.entrances[0] ? `${mine.entrances[0].x.toFixed(0)},${mine.entrances[0].z.toFixed(0)}` : 'нет');

// --- вход и физика под землёй ---
const entrance = mine.entrances[0];
game.enterMine(entrance);
const below = game.player.position.y;
log('вход в шахту: y =', below.toFixed(1), '· под землёй:', game.underground,
  '· слоем ниже поверхности:', below < game.world.heightAt(entrance.x, entrance.z) - 4);

// --- стены: ищем ближайшую жилу и пробиваем её киркой ---
let wall = null;
for (const vein of mine.level.veins.values()) {
  if (vein.type !== 'stone') { wall = vein; break; }
}
if (!wall) wall = [...mine.level.veins.values()][0];
const wx = mine._worldX(wall.cx);
const wz = mine._worldZ(wall.cz);
const probe = mine.probe({ x: wx, y: mine.level.y + 1, z: wz + 3 }, 0, -1, 4);
log('жила под прицелом:', probe ? `${probe.type} на ${probe.dist.toFixed(2)} м` : 'не найдена');

// ставим героя рядом и бьём туда же, куда смотрит прицел
game.player.setPosition(wx, wz + 2.4, game.mineWorld);
const dirX = 0;
const dirZ = -1;
let broke = null;
for (let i = 0; i < 12 && !broke; i++) {
  const res = mine.strike(game.player.position, dirX, dirZ, 1.6, 3.4);
  if (res && res.broken) broke = res;
}
log('стена пробита:', !!broke, '· добыча:', broke ? JSON.stringify(broke.drops) : '—',
  '· клетка открыта:', broke ? mine.isOpen(mine._worldX(broke.cx), mine._worldZ(broke.cz)) : false);

// --- лава в глубинном слое ---
const deep = mine.levels[1];
let lava = 0;
for (const cell of deep.grid) if (cell && cell.open && cell.type === 'lava') lava++;
log('лава в глубинном слое:', lava, '· есть:', lava > 0);

// --- драгоценных жил в глубине больше ---
const countOre = (lvl) => [...lvl.veins.values()].filter((v) => v.type !== 'stone').length;
const shallowRich = countOre(mine.levels[0]);
const deepRich = countOre(mine.levels[1]);
log('ценных жил: камень', shallowRich, '· глубина', deepRich, '· глубже богаче:', deepRich > shallowRich);

// --- ковка: предмета нет в рецептах, модель генерируется ---
game.exitMine();
const { forge, sharpen, canSharpen, buildModel, effectiveWeapon } = window.__forge;
const forged = forge('sword', 'obsidian', 12345);
const model = buildModel(forged);
log('выковано:', forged.name, '· урон', forged.tool.weapon,
  '· деталей в модели:', model.children.length, '· в сумке появится:', !!game.ui.items[forged.id]);

// --- заточка: кованое точится, крафтовое — нет ---
const before = effectiveWeapon(forged);
for (let i = 0; i < 8; i++) sharpen(forged);
const after = effectiveWeapon(forged);
const crafted = game.ui.items.knife;
const craftedSharp = sharpen(crafted);
log('заточка:', before.toFixed(1), '->', after.toFixed(1), '· кованое точится:', after > before,
  '· крафтовый нож не точится:', craftedSharp.ok === false, '· может точиться:', canSharpen(forged));

// --- верстак и точило ставятся и открываются ---
game.addItem('workbench', 1);
game.addItem('grindstone', 1);
game.assignHotbar('workbench', 2);
game.selectSlot(2);
game.placeSelected();
game.assignHotbar('grindstone', 3);
game.selectSlot(3);
game.placeSelected();
log('станков в мире:', game.stations.length,
  '· верстак:', game.stations.some((s) => s.type === 'bench'),
  '· точило:', game.stations.some((s) => s.type === 'grind'));

const bench = game.stations.find((s) => s.type === 'bench');
game.openStation(bench);
const wsOpen = !document.getElementById('workshop').classList.contains('hidden');
const chips = document.querySelectorAll('#ws-body [data-form]');
chips[1]?.dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
log('панель верстака открыта:', wsOpen, '· форм в панели:', chips.length,
  '· выбрана форма:', game.ws.form);

const grind = game.stations.find((s) => s.type === 'grind');
game.openStation(grind);
const grindHtml = document.getElementById('ws-body').innerHTML;
log('точило: режим', game.ws.mode, '· список инструментов:', /ws-tool|нечего точить/.test(grindHtml));

game.ui.closePanels();
log('ошибок нет');
