#!/usr/bin/env node
/* Isolated research dataset: no publishing, no network games, held-out questions including cross-genre action scenarios. */
import { createHash } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { buildDataset, SYSTEM_PROMPT } from './build-dataset.mjs';

export async function buildGameDataset(home, out) {
  const all = await buildDataset({home});
  const train = all.train.filter(r => r.kind === 'game-skills');
  const evalRows = all.evalRows.filter(r => (['eval-game-action-format', 'eval-game-no-fake', 'eval-game-captcha', 'eval-game-math', 'eval-game-mechanics-health', 'eval-game-mechanics-evidence', 'eval-game-mechanics-format', 'eval-game-mechanics-resources'].includes(r.id) || r.id.startsWith('eval-game-transfer-')));
  if (train.length < 20 || evalRows.length !== 14 || train.some(t => evalRows.some(e => e.instruction === t.instruction))) throw Error('Game dataset or held-out exam invalid');
  await mkdir(out, {recursive:true});
  const files = {};
  for (const [name, rows] of Object.entries({train, eval:evalRows})) {
    const text = rows.map(r => JSON.stringify(r)).join('\n') + '\n';
    await writeFile(path.join(out, `${name}.jsonl`), text);
    files[name] = {count:rows.length, sha256:createHash('sha256').update(text).digest('hex')};
  }
  await writeFile(path.join(out, 'manifest.json'), JSON.stringify({schema:'frontline-qwen-learn-v1', systemPrompt:SYSTEM_PROMPT, counts:{'game-skills':train.length}, files}, null, 2));
  return {training:train.length, exam:evalRows.length};
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  if (!process.argv[2]) throw Error('usage: node build-game-skill-dataset.mjs OUTPUT');
  const home = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
  console.log(JSON.stringify(await buildGameDataset(home, path.resolve(process.argv[2]))));
}
