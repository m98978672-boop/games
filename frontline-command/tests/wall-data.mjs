// Проверка данных сегментов и воспроизводимости генератора без изменения игры.
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, copyFile, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { loadConfig } from '../src/core/config.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const cfg = await loadConfig();
const temporary = await mkdtemp(path.join(tmpdir(), 'frontline-wall-data-'));
try {
  await mkdir(path.join(temporary, 'tools'), { recursive: true });
  await mkdir(path.join(temporary, 'data'), { recursive: true });
  await copyFile(path.join(root, 'tools/gen-walls.mjs'), path.join(temporary, 'tools/gen-walls.mjs'));
  for (const name of ['buildings.json', 'wall_materials.json', 'cover.json']) {
    await copyFile(path.join(root, 'data', name), path.join(temporary, 'data', name));
  }
  const run = spawnSync(process.execPath, [path.join(temporary, 'tools/gen-walls.mjs')], { encoding: 'utf8' });
  assert.equal(run.status, 0, `генератор завершился с ошибкой: ${run.stderr}\n${run.stdout}`);
  let count = 0;
  for (const [type, outline] of Object.entries(cfg.outlines)) {
    const regenerated = JSON.parse(await readFile(path.join(temporary, 'data/outlines', `${type}.json`), 'utf8'));
    assert.deepEqual(outline, regenerated, `контур ${type} отличается от генератора`);
    const ids = new Set();
    for (const seg of outline.segments) {
      assert.ok(!ids.has(seg.id), `${type}: повтор сегмента ${seg.id}`);
      ids.add(seg.id);
      assert.ok(cfg.wallMaterials.materials[seg.material], `${type}: неизвестный материал`);
      assert.equal(seg.texture_set, outline.spec.texture_set || seg.material, `${type}: нет ключа текстур`);
      assert.ok(seg.thickness > 0 && seg.hp > 0 && seg.points.length === 2, `${type}: неверная геометрия/HP`);
      for (const key of ['blocksMove', 'blocksBullets', 'blocksVision']) assert.equal(typeof seg[key], 'boolean');
      count++;
    }
  }
  assert.ok(count > 0, 'нет сегментов для проверки');
  console.log(`данные стен: ${Object.keys(cfg.outlines).length} контуров, ${count} сегментов; генерация воспроизводима`);
} finally {
  await rm(temporary, { recursive: true, force: true });
}
