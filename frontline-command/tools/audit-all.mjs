// Единый запуск: обзор всего git-репозитория и проверяющий Frontline Command.
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { auditGame, formatGameReport } from './game-auditor.mjs';
import { listRepositoryFiles, scanRepository, formatRepositoryReport } from './repository-auditor.mjs';
const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');

export function auditAll({ quick = false, gameAudit = auditGame, repositoryAudit = () => scanRepository(root, listRepositoryFiles(root)) } = {}) {
  let game = null, repository = null;
  const issues = [];
  try { repository = repositoryAudit(); }
  catch (error) { issues.push({ code: 806, check: 'repository', status: 'unverified', message: `Не удалось выполнить обзор репозитория: ${error.message}` }); }
  try { game = gameAudit({ quick }); }
  catch (error) { issues.push({ code: 807, check: 'game', status: 'unverified', message: `Не удалось выполнить проверку игры: ${error.message}` }); }
  // Частичный обзор не означает приёмку всего репозитория даже при нуле ошибок.
  const accepted = !quick && game?.verdict === 'PASS' && repository?.complete === true &&
    Array.isArray(repository.issues) && repository.issues.length === 0 && issues.length === 0;
  return { version: 1, mode: quick ? 'quick' : 'full', verdict: accepted ? 'PASS' : 'NOT_ACCEPTED',
    limitations: ['Статический обзор не проверяет поведение всех игр; полная приёмка репозитория пока не реализована.'], game, repository, issues };
}
export function formatAllReport(result) {
  return [`ВСЕ ИГРЫ И FRONTLINE COMMAND: ${result.verdict}`, `Режим: ${result.mode}.`, ...result.limitations,
    ...result.issues.map((i) => `[${i.code}] ${i.message}`), '',
    result.repository ? formatRepositoryReport(result.repository) : 'Обзор репозитория не выполнен.', '',
    result.game ? formatGameReport(result.game) : 'Проверка Frontline Command не выполнена.'].join('\n');
}
if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const result = auditAll({ quick: process.argv.includes('--quick') });
  console.log(process.argv.includes('--human') ? formatAllReport(result) : JSON.stringify(result, null, 2));
  if (result.verdict !== 'PASS') process.exitCode = 1;
}
