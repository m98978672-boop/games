#!/usr/bin/env node
/* Дневник и состояние: дописывает запись о прогоне самообучения и
   обновляет state.json. Вызывается из workflow после обучения.

     node qwen-home/tools/update-memory.mjs \
       --report train-output/report.json --scores eval-after.json \
       --published true --run-url URL --date 2026-11-16 */
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

export function nextState(state, { date, steps, published, scores }) {
  const next = { ...state };
  next.learnRuns = (state.learnRuns || 0) + 1;
  if (published) next.totalSteps = (state.totalSteps || 0) + steps;
  next.lastRunAt = date;
  next.lastEval = scores || state.lastEval || null;
  if (published) next.adapterRelease = 'frontline-qwen-home';
  next.updatedAt = date;
  return next;
}

export function logEntry({ date, runNo, report, scores, published, runUrl }) {
  const kinds = Object.entries(report.dataset_counts || {}).map(([k, v]) => `${k}: ${v}`).join(', ');
  const ev = scores?.adapter || scores?.base;
  const lines = [
    `## ${date} — обучение №${runNo}`,
    '',
    `- Шагов: ${report.training?.steps ?? '?'} (примеров в датасете — ${kinds || '?'})`,
    `- Экзамен после: ${ev ? `${ev.passed}/${ev.total}` : 'не проводился'}`,
    `- Адаптер опубликован: ${published ? 'да' : 'нет (результат хуже или прогон учебный)'}`,
    runUrl ? `- Прогон: ${runUrl}` : null,
    '',
  ];
  return lines.filter((l) => l !== null).join('\n');
}

async function main() {
  const args = process.argv.slice(2);
  const opt = {};
  for (let i = 0; i < args.length; i += 2) opt[args[i].replace(/^--/, '')] = args[i + 1];
  const home = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
  const report = JSON.parse(await readFile(opt.report, 'utf8'));
  const scoresDoc = opt.scores ? JSON.parse(await readFile(opt.scores, 'utf8')) : null;
  const scores = scoresDoc?.scores || null;
  const published = opt.published === 'true';
  const date = opt.date || new Date().toISOString().slice(0, 10);
  const stateFile = path.join(home, 'state.json');
  const state = JSON.parse(await readFile(stateFile, 'utf8'));
  const next = nextState(state, { date, steps: report.training?.steps || 0, published, scores });
  await writeFile(stateFile, JSON.stringify(next, null, 2) + '\n');
  const entry = logEntry({ date, runNo: next.learnRuns, report, scores, published, runUrl: opt['run-url'] });
  const logFile = path.join(home, 'memory', 'learning-log.md');
  const old = await readFile(logFile, 'utf8');
  await writeFile(logFile, old.replace(/\s*$/, '') + '\n\n' + entry);
  console.log('дневник обновлён, прогон №' + next.learnRuns);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((err) => { console.error(err); process.exit(1); });
}
