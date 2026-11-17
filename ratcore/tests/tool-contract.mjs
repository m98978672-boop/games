// RatCore — Контрактный тест ToolGuard (Барьеры 1–5 + Zero-Cost Opt-In RC-108)
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createEngine, auditSourceCode } from '../ratcore.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const manifest = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'tools-manifest.json'), 'utf8'));

const engine = createEngine({ preset: 'minimal', seed: 42, manifest });

// 1. Барьер 1: повторный захват печати запрещён (RC-105)
assert.throws(
  () => engine._attemptSecondMint(),
  (err) => err && err.code === 'RC-105',
  'Повторный claimMintAuthority должен бросать RC-105',
);

// 2. Барьер 2: поддельный меш без печати ToolGuard отклоняется с RC-101
const fakeMesh = {
  id: 'mesh_99999',
  kind: 'sealed-mesh',
  buffers: { positions: new Float32Array([0, 0, 0, 1, 0, 0, 0, 1, 0]), indices: new Uint32Array([0, 1, 2]) },
};
const placeFakeRes = engine.tools.build.placeEntity({ id: 'cheat_box', mesh: fakeMesh, x: 0, y: 0, h: 1 });
assert.equal(placeFakeRes.ok, false, 'Сырой меш не должен пройти placeEntity');
assert.equal(placeFakeRes.error.code, 'RC-101', 'Ожидается код ошибки RC-101');

const combineFakeRes = engine.tools.build.combine({ parts: [{ mesh: fakeMesh, offset: [0, 0, 0] }] });
assert.equal(combineFakeRes.ok, false, 'Сырой меш не должен пройти build.combine');
assert.equal(combineFakeRes.error.code, 'RC-101');

// 3. Барьер 2: поддельная текстура отклоняется с RC-102
const realMeshRes = engine.tools.build.primitive({ shape: 'box', w: 2, h: 2, d: 2 });
assert.equal(realMeshRes.ok, true);
assert.equal(engine._verifySealedMesh(realMeshRes.data), true);
assert.equal(Object.isFrozen(realMeshRes.data), true, 'Хэндл меша должен быть frozen');

const fakeTex = { id: 'tex_99999', kind: 'sealed-texture', width: 32, height: 32 };
const placeFakeTexRes = engine.tools.build.placeEntity({
  id: 'cheat_tex',
  mesh: realMeshRes.data,
  texture: fakeTex,
  x: 1,
  y: 1,
  h: 1,
});
assert.equal(placeFakeTexRes.ok, false, 'Сырая текстура не должна пройти placeEntity');
assert.equal(placeFakeTexRes.error.code, 'RC-102');

// 4. Барьер 3: пересборка модели строго из рецепта ops
const recipeRes = engine.tools.build.fromRecipe({
  modelId: 'guard_tower',
  ops: [
    { tool: 'build.primitive', args: { shape: 'box', w: 2, h: 4, d: 2 } },
    { tool: 'build.primitive', args: { shape: 'roof', w: 2.4, h: 1.5, d: 2.4 }, offset: [0, 4, 0] },
  ],
});
assert.equal(recipeRes.ok, true);
assert.equal(engine._verifySealedMesh(recipeRes.data), true);
assert.ok(recipeRes.data.triCount > 12, 'Собранная башня должна содержать > 12 треугольников');

// 5. Барьер 4: статический аудитор кода ловит ручную сборку геометрии и canvas-обходы (RC-107)
const badCode = `
  const vertices = new Float32Array([0, 0, 0, 1, 0, 0, 0, 1, 0]);
  const g = new THREE.BoxGeometry(1, 1, 1);
  const ctx = document.createElement('canvas').getContext('2d');
`;
const auditBad = auditSourceCode(badCode, 'games/cheater/main.js');
assert.equal(auditBad.ok, false);
assert.ok(auditBad.violations.length >= 3, 'Аудитор должен поймать минимум 3 нарушения RC-107');
assert.ok(auditBad.violations.every((v) => v.code === 'RC-107'));

const cleanCode = `
  const box = engine.tools.build.primitive({ shape: 'box', w: 2, h: 2, d: 2 });
  engine.tools.build.placeEntity({ id: 'hq', mesh: box.data, x: 0, y: 0, snapToTerrain: true });
`;
const auditClean = auditSourceCode(cleanCode, 'games/clean/main.js');
assert.equal(auditClean.ok, true);
assert.equal(auditClean.violations.length, 0);

// 6. Барьер 5 + Zero-Cost Opt-In (RC-108): выключенные пакеты отдают RC-108 с точной подсказкой
const disabledDestroy = engine.tools.destroy.damage({ target: 'bridge_1' });
assert.equal(disabledDestroy.ok, false);
assert.equal(disabledDestroy.error.code, 'RC-108');
assert.match(disabledDestroy.error.autoFixHint, /pack:destruction/);

const disabledNet = engine.tools.net.createRoom({ maxPlayers: 4 });
assert.equal(disabledNet.ok, false);
assert.equal(disabledNet.error.code, 'RC-108');
assert.match(disabledNet.error.autoFixHint, /pack:multiplayer/);

const disabledEco = engine.tools.eco.iceStressTest({ massKg: 12000 });
assert.equal(disabledEco.ok, false);
assert.equal(disabledEco.error.code, 'RC-108');
assert.match(disabledEco.error.autoFixHint, /pack:ecology/);

// Динамическое включение пакета по выбору снимает RC-108
const enabled = engine.enablePack('pack:destruction');
assert.equal(enabled.ok, true);
const activeDestroy = engine.tools.destroy.status();
assert.equal(activeDestroy.ok, true);
assert.equal(activeDestroy.data.enabled, true);

// Обратное выключение возвращает RC-108
engine.disablePack('pack:destruction');
const disabledAgain = engine.tools.destroy.damage({ target: 'bridge_1' });
assert.equal(disabledAgain.ok, false);
assert.equal(disabledAgain.error.code, 'RC-108');

console.log('RatCore tool-contract test: OK (Barriers 1-5 + RC-101/102/105/107/108 verified)');
