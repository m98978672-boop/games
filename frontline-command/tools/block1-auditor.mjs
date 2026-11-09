// Независимый проверяющий блока 1. Недостающие проверки блокируют приёмку.
// По умолчанию запускаются все доступные проверки, включая npm test. Длинные
// или отсутствующие приёмочные сценарии не заменяются прежними smoke-тестами.
import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { diagnoseChecks, formatHuman } from './block1-diagnostics.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const numeric = (x) => typeof x === 'number' && Number.isFinite(x);
const positiveInt = (x) => Number.isSafeInteger(x) && x > 0;
const object = (x) => x && typeof x === 'object' && !Array.isArray(x);

// Эти проверки не считаются пройденными лишь потому, что создан файл: каждая
// должна завершиться успешно и выдать необходимые измерения в JSON на stdout.
export const requirements = [
  { id: 'integration', path: 'tests/acceptance/block1-integration.mjs', description: 'Сценарии S1, S8, S9 и S10', timeout: 600_000 },
  { id: 'cards', path: 'tests/acceptance/block1-cards.mjs', description: 'Все проверки карточек ALG-04/18/19/21/22', timeout: 600_000 },
  { id: 'doors', path: 'tests/acceptance/block1-doorways.mjs', description: '100 повторов проходов и колонны', timeout: 600_000 },
  { id: 'navigation', path: 'tests/acceptance/block1-navigation.mjs', description: 'Нагрузка и снижение застреваний не менее чем на 70%', timeout: 600_000 },
  { id: 'deadlocks', path: 'tests/acceptance/block1-deadlocks.mjs', description: 'Устранение встречных пробок без телепорта', timeout: 600_000 },
  { id: 'nav_budget', path: 'tests/acceptance/block1-nav-budget.mjs', description: 'Локальный перестрой и бюджет навигации', timeout: 600_000 },
  { id: 'save_replay', path: 'tests/acceptance/block1-save-replay.mjs', description: 'Старый сейв и воспроизведение полного состояния', timeout: 600_000 },
  { id: 'input_replay', path: 'tests/acceptance/block1-input-replay.mjs', description: 'Запись и воспроизведение ввода и отдельных RNG', timeout: 600_000 },
  { id: 'browser_fps', path: 'tests/acceptance/block1-browser-fps.mjs', description: 'Реальный браузерный FPS на 400/500 юнитов', timeout: 600_000 },
  { id: 'soak', path: 'tests/acceptance/block1-soak.mjs', description: '30 реальных минут и контроль утечек/застреваний', timeout: 1_950_000 },
];

export function validateEvidence(id, x, elapsedMs = 0) {
  if (!object(x) || x.passed !== true) return false;
  switch (id) {
    case 'integration':
      return Array.isArray(x.scenarios) && ['S1','S8','S9','S10'].every((id) =>
        x.scenarios.some((s) => object(s) && s.id === id && s.passed === true && positiveInt(s.checks)));
    case 'cards':
      return Array.isArray(x.cards) && ['04','18','19','21','22'].every((id) =>
        x.cards.some((c) => object(c) && c.id === id && positiveInt(c.checks) && c.failed === 0));
    case 'doors':
      return Array.isArray(x.scenarios) && x.scenarios.length > 0 &&
        x.scenarios.every((s) => object(s) && typeof s.name === 'string' && s.name &&
          Number.isSafeInteger(s.attempts) && s.attempts >= 200 && s.passed === s.attempts && s.teleports === 0 && s.speedViolations === 0 && s.wallCollisions === 0 && s.overlapFrames === 0 &&
          s.crossed === s.attempts * (s.kind === 'column' ? 10 : 1) &&
          Array.isArray(s.factions) && s.factions.length === 2 && [0,1].every((f) => s.factions.some((x) => x.id === f &&
            Number.isSafeInteger(x.attempts) && x.attempts >= 100 && x.passed === x.attempts)) &&
          s.factions.reduce((total, f) => total + f.attempts, 0) === s.attempts) &&
        ['foot-hq-enter','foot-hq-exit','foot-city-enter','foot-city-exit',
          'truck-depot-enter','truck-depot-exit','truck-factory-enter','truck-factory-exit','column']
          .every((kind) => x.scenarios.some((s) => s.kind === kind));
    case 'navigation': {
      if (!Array.isArray(x.runs)) return false;
      const seeds = [...new Set(x.runs.map((r) => r?.seed))];
      return seeds.length >= 3 && seeds.every((seed) => [100, 300, 400].every((n) =>
        x.runs.some((r) => r?.seed === seed && r?.units === n))) && x.runs.every((r) => object(r) &&
        numeric(r.before) && r.before > 0 && numeric(r.after) && r.after >= 0 && r.after <= r.before * 0.30 &&
        Number.isSafeInteger(r.seed) && r.seed >= 0 && positiveInt(r.units) && numeric(r.simulationSeconds) && r.simulationSeconds >= 60);
    }
    case 'deadlocks': {
      const kinds = ['foot-door-opposing', 'vehicle-opposing', 'column-opposing', 'dock-opposing'];
      if (x.coverageComplete !== true || !Array.isArray(x.coverage) || x.coverage.length !== kinds.length ||
          x.failed !== 0 || x.teleports !== 0 || x.speedViolations !== 0 || x.wallCollisions !== 0 ||
          x.overlapFrames !== 0 || x.factionsChecked !== 2) return false;
      const complete = (c) => object(c) && Number.isSafeInteger(c.scenarios) && c.scenarios >= 200 &&
        Number.isSafeInteger(c.participants) && c.participants >= 2 && c.passed === c.scenarios &&
        c.crossed === c.scenarios * c.participants && c.arrived === c.scenarios * c.participants &&
        c.teleports === 0 && c.speedViolations === 0 && c.wallCollisions === 0 && c.overlapFrames === 0 &&
        Array.isArray(c.factions) && c.factions.length === 2 && [0,1].every((f) => c.factions.some((v) =>
          v.id === f && Number.isSafeInteger(v.attempts) && v.attempts >= 100 && v.passed === v.attempts)) &&
        c.factions.reduce((sum, f) => sum + f.attempts, 0) === c.scenarios;
      return kinds.every((id) => x.coverage.filter((c) => c?.id === id && complete(c)).length === 1) &&
        x.scenarios === x.coverage.reduce((sum, c) => sum + c.scenarios, 0) &&
        x.crossed === x.coverage.reduce((sum, c) => sum + c.crossed, 0) && x.arrived === x.crossed;
    }
    case 'nav_budget':
      return x.localRebuild === true && positiveInt(x.samples) && numeric(x.maxMs) && x.maxMs >= 0 && x.maxMs <= 2 &&
        x.offMatchesLegacy === true;
    case 'save_replay':
      return positiveInt(x.scenarios) && x.failed === 0 && x.oldSaveLoaded === true && x.fullStateCompared === true &&
        x.continuationMatches === true && x.offMatchesLegacy === true;
    case 'input_replay':
      return positiveInt(x.ticks) && x.inputRecorded === true && x.inputReplayed === true &&
        x.separateRng === true && x.rngRestored === true && x.stateMatches === true;
    case 'browser_fps': {
      if (x.environment !== 'browser' || x.measurement !== 'requestAnimationFrame' || x.rendered !== true ||
          x.quick !== false || typeof x.browser !== 'string' || !x.browser ||
          !Array.isArray(x.measurements) || x.measurements.length !== 2) return false;
      const validRun = (target) => {
        const m = x.measurements.find((entry) => entry?.target === target);
        return object(m) && m.initial === target && m.minAlive === target && m.maxAlive === target &&
          numeric(m.elapsedMs) && m.elapsedMs >= 12_000 && positiveInt(m.frames) &&
          m.worstCount === Math.ceil(m.frames * 0.01) && numeric(m.worstTimeMs) && m.worstTimeMs > 0 &&
          numeric(m.averageFps) && Math.abs(m.averageFps - m.frames * 1000 / m.elapsedMs) < 1e-8 &&
          numeric(m.low1Fps) && Math.abs(m.low1Fps - m.worstCount * 1000 / m.worstTimeMs) < 1e-8 &&
          m.drawFrames >= m.frames * 0.9 && m.canvas?.width > 0 && m.canvas?.height > 0 &&
          m.canvasDataLength > 1000 && m.spritesReady === true && m.minVisible >= target / 4 &&
          m.screen === 'game' && m.sameGame === true && m.warOver === false &&
          numeric(m.gameSeconds) && numeric(m.gameTimeStart) && m.gameSeconds > m.gameTimeStart &&
          positiveInt(m.timings?.step?.samples) && Array.isArray(m.pageErrors) && m.pageErrors.length === 0;
      };
      if (!validRun(400) || !validRun(500)) return false;
      const a = x.measurements.find((m) => m.target === 400), b = x.measurements.find((m) => m.target === 500);
      return elapsedMs >= a.elapsedMs + b.elapsedMs && x.frames400 === a.frames && x.frames500 === b.frames &&
        x.average400 === a.averageFps && x.low1_400 === a.low1Fps && x.average500 === b.averageFps &&
        a.averageFps >= 60 && a.low1Fps >= 45 && b.averageFps >= 45;
    }
    case 'soak':
      return x.clock === 'wall' && numeric(x.wallSeconds) && x.wallSeconds >= 1800 && elapsedMs >= 1_800_000 &&
        numeric(x.memoryGrowthPercent) && x.memoryGrowthPercent <= 5 &&
        numeric(x.objectChangePercent) && Math.abs(x.objectChangePercent) <= 2 &&
        x.stuck === 0 && x.forgottenBlueprints === 0;
    default: return false;
  }
}

function run(command, args, timeout) {
  const start = performance.now();
  const result = spawnSync(command, args, { cwd: root, encoding: 'utf8', timeout, maxBuffer: 8 * 1024 * 1024 });
  return { code: result.status, elapsedMs: Math.round(performance.now() - start),
    stdout: result.stdout || '', stderr: result.stderr || '', error: result.error?.message || null,
    signal: result.signal || null };
}
function summarize(id, description, result) {
  return { id, description, status: result.code === 0 && !result.error ? 'pass' : 'fail',
    elapsedMs: result.elapsedMs, exitCode: result.code, error: result.error,
    outputTail: (result.stdout + result.stderr).trim().split('\n').slice(-8).join('\n') };
}
function jsonOutput(result) {
  try { return JSON.parse(result.stdout); } catch { return null; }
}

// Расширенная проверка U-геометрии: одного исходного размера недостаточно.
export function validateUVariants(data, vehicleDetour) {
  if (!object(data) || data.vehicleDetour !== vehicleDetour || data.total !== 216 || data.passed !== 216 ||
      !Array.isArray(data.results) || data.results.length !== 216) return false;
  const keys = new Set();
  for (const r of data.results) {
    if (!object(r) || !['infantry','truck','tank'].includes(r.role) || ![0,1,2,3].includes(r.rotation) ||
        ![128,160,192].includes(r.size) || ![5,7,11].includes(r.seed) || ![0,1].includes(r.faction) || r.arrived !== true || r.pathFailed !== false ||
        r.collided !== false || r.noTeleport !== true || r.movesAway !== true || !numeric(r.distanceToGoal) ||
        r.distanceToGoal < 0 || r.distanceToGoal >= 34) return false;
    const key = `${r.role}:${r.rotation}:${r.size}:${r.seed}:${r.faction}`;
    if (keys.has(key)) return false;
    keys.add(key);
  }
  return keys.size === 216;
}

export const requiredChecks = ['full_suite', 'production_flags', 'u_trap', ...requirements.map((r) => r.id)];
export function verdict(checks) {
  const required = requiredChecks;
  return checks.every((c) => c.status === 'pass') &&
    required.every((id) => checks.filter((c) => c.id === id && c.status === 'pass').length === 1)
    ? 'PASS' : 'NOT_ACCEPTED';
}

export function audit({ quick = false } = {}) {
  const checks = [];
  if (quick) {
    checks.push({ id: 'full_suite', description: 'Полный npm test', status: 'not_run', reason: 'Быстрый режим не выполняет полный набор.' });
    for (const name of ['pathing', 'save-state', 'save-transport', 'save-structures', 'save-blueprints']) {
      checks.push(summarize(`partial_${name}`, `Частичная проверка ${name}`,
        run(process.execPath, [`tests/${name}.mjs`], 60_000)));
    }
  } else {
    checks.push(summarize('full_suite', 'Полный npm test', run('npm', ['test'], 600_000)));
  }
  let flags;
  try {
    const list = JSON.parse(readFileSync(resolve(root, 'data/feature_flags.json'), 'utf8')).flags;
    flags = Object.fromEntries(list.map((f) => [f.id, f.enabled === true]));
  } catch (e) {
    checks.push({ id: 'production_flags', description: 'Конфигурация навигации', status: 'fail', reason: String(e) });
  }
  if (flags) {
    const ready = flags.pathing_v2 && flags.wall_collision_v2;
    checks.push({ id: 'production_flags', description: 'Зависимости навигации в конфигурации по умолчанию',
      status: ready ? 'pass' : 'fail', vehicleDetour: !!flags.vehicle_detour_v2 });
    if (ready) {
      const args = ['tools/audit-u-trap.mjs'];
      if (flags.vehicle_detour_v2) args.push('--vehicle-detour');
      const result = run(process.execPath, args, 60_000), data = jsonOutput(result);
      const variantArgs = ['tools/audit-u-variants.mjs'];
      if (flags.vehicle_detour_v2) variantArgs.push('--vehicle-detour');
      const variants = run(process.execPath, variantArgs, 60_000), variantData = jsonOutput(variants);
      checks.push({ id: 'u_trap', description: 'U-ловушка с настройками по умолчанию',
        status: result.code === 0 && !result.error && data?.total === 18 && data?.passed === data.total &&
          data?.vehicleDetour === !!flags.vehicle_detour_v2 && variants.code === 0 && !variants.error &&
          validateUVariants(variantData, !!flags.vehicle_detour_v2) ? 'pass' : 'fail',
        passed: data?.passed ?? null, total: data?.total ?? null, elapsedMs: result.elapsedMs + variants.elapsedMs,
        exitCode: result.code, error: result.error, signal: result.signal, evidence: data,
        variantsPassed: variantData?.passed ?? null, variantsTotal: variantData?.total ?? null, variantsEvidence: variantData,
        variantsExitCode: variants.code, variantsError: variants.error, variantsSignal: variants.signal,
        ...(data ? {} : { outputTail: (result.stdout + result.stderr).trim().slice(-1500) }),
        ...(variantData ? {} : { variantsOutputTail: (variants.stdout + variants.stderr).trim().slice(-1500) }) });
    } else checks.push({ id: 'u_trap', description: 'U-ловушка с настройками по умолчанию', status: 'not_run', reason: 'Выключены необходимые флаги.' });
  }
  if (!flags) checks.push({ id: 'u_trap', description: 'U-ловушка с настройками по умолчанию', status: 'not_run', reason: 'Не удалось прочитать флаги.' });
  for (const req of requirements) {
    if (!existsSync(resolve(root, req.path))) {
      checks.push({ id: req.id, description: req.description, status: 'missing', path: req.path });
      continue;
    }
    if (quick) {
      checks.push({ id: req.id, description: req.description, status: 'not_run', reason: 'Не запускается в быстром режиме.' });
      continue;
    }
    const result = run(process.execPath, [req.path], req.timeout);
    const evidence = jsonOutput(result);
    checks.push({ id: req.id, description: req.description,
      status: result.code === 0 && !result.error && validateEvidence(req.id, evidence, result.elapsedMs) ? 'pass' : 'fail',
      elapsedMs: result.elapsedMs, exitCode: result.code, error: result.error, signal: result.signal,
      evidence, ...(evidence ? {} : { outputTail: (result.stdout + result.stderr).trim().slice(-1500) }) });
  }
  const result = verdict(checks);
  return { version: 2, mode: quick ? 'quick' : 'full', verdict: result, checks,
    issues: diagnoseChecks(checks, requiredChecks) };
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const quick = process.argv.includes('--quick');
  const result = audit({ quick });
  console.log(process.argv.includes('--human') ? formatHuman(result) : JSON.stringify(result, null, 2));
  if (result.verdict !== 'PASS') process.exitCode = 1;
}
