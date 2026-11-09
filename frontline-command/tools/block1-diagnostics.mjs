// Коды являются идентификаторами причин неприёмки, а не оценкой серьёзности.
// 0 зарезервирован для отсутствия ошибок; каждому случаю ниже присвоен
// стабильный код из диапазона 1–999. Нет вымышленных причин или заглушек 0–999.
export const catalog = Object.freeze({
  1: { name: 'Полный набор не пройден', action: 'Проверить вывод npm test и исправить конкретный упавший тест.' },
  2: { name: 'Конфигурация навигации не готова', action: 'Проверить конфигурацию и зависимости флагов навигации и стен.' },
  3: { name: 'Проверка не запускалась', action: 'Выполнить полный аудитор; быстрый режим не является приёмкой.' },
  4: { name: 'Ошибка запуска или тайм-аут', action: 'Проверить ошибку процесса, окружение, зависимости и повторить проверку.' },
  5: { name: 'Повреждённый или неполный результат', action: 'Проверить вывод сценария и обязательные доказательства, затем повторить испытание.' },
  6: { name: 'Сценарий сообщил о провале', action: 'Изучить результат сценария и исправить выявленные причины без снижения требований.' },
  7: { name: 'Отсутствует обязательный результат', action: 'Восстановить запуск обязательной проверки; пропуск не считается успехом.' },
  8: { name: 'Дублирован обязательный результат', action: 'Устранить неоднозначность: каждой обязательной проверке соответствует один результат.' },
  101: { name: 'U-ловушка не пройдена', action: 'Исправить маршрут и повторить все типы юнитов, стороны и seed без телепорта и регрессий.' },
  110: { name: 'Проход или колонна не завершены', action: 'Проверить неудачные seed и фракции, устранить остановки и повторить все попытки.' },
  111: { name: 'Наложения юнитов в проходе', action: 'Исправить очередность и разделение движения без телепорта и блокировки прохода.' },
  112: { name: 'Превышен контрольный шаг движения', action: 'Исследовать сочетание steering и выталкивания; само превышение ещё не доказывает телепорт.' },
  113: { name: 'Обнаружены пересечения стены', action: 'Исправить коллизию на всём маршруте и повторить обе стороны.' },
  114: { name: 'Обнаружен крупный скачок', action: 'Исследовать зафиксированные перемещения и устранить телепорт или другую причину аномалии.' },
  115: { name: 'Плоскость проёма не пересечена', action: 'Проверить фактическое пересечение каждым юнитом, а не только флаг прибытия.' },
  201: { name: 'Нет интеграционных испытаний', action: 'Реализовать и запустить S1, S8, S9 и S10 с проверяемыми результатами.' },
  202: { name: 'Нет испытаний карточек', action: 'Реализовать и запустить проверки карточек ALG-04/18/19/21/22.' },
  203: { name: 'Нет приёмочного испытания навигации', action: 'Проверить три seed и нагрузки 100/300/400 с измерением снижения застреваний.' },
  204: { name: 'Нет испытания встречных пробок', action: 'Проверить разрешение пробок обеих фракций без телепорта.' },
  205: { name: 'Нет приёмочного испытания бюджета навигации', action: 'Проверить локальность, фактический бюджет и совместимость режима off.' },
  206: { name: 'Нет испытания сохранения и продолжения', action: 'Сравнить полное состояние, старый сейв и детерминированное продолжение.' },
  207: { name: 'Нет испытания ввода и RNG', action: 'Проверить запись и повтор ввода и восстановление отдельных потоков RNG.' },
  208: { name: 'Нет браузерного испытания FPS', action: 'Запустить реальный браузерный сценарий с отрисовкой и заданной нагрузкой.' },
  209: { name: 'Нет 30-минутного испытания', action: 'Выполнить реальный soak с контролем памяти, объектов и зависших задач.' },
  210: { name: 'Нет испытания проходов', action: 'Проверить проходы и колонну обеих фракций на необходимом числе повторов.' },
  301: { name: 'Нагрузка браузерной сцены не соответствует цели', action: 'Обеспечить целевое число живых юнитов на протяжении измерения, не скрывая спавны или потери.' },
  302: { name: 'Средний FPS при 400 ниже порога', action: 'Исследовать полный браузерный кадр и повторить замер на корректной нагрузке.' },
  303: { name: '1% low при 400 ниже порога', action: 'Исследовать длинные реальные интервалы кадров и повторить замер на корректной нагрузке.' },
  304: { name: 'Средний FPS при 500 ниже порога', action: 'Исследовать полный браузерный кадр и повторить замер на корректной нагрузке.' },
  305: { name: 'Браузерный замер не подтверждён', action: 'Проверить rAF, живую игру, отрисовку, длительность, исходные интервалы и наличие ошибок.' },
  306: { name: 'Ошибки страницы во время замера', action: 'Исправить ошибки страницы и повторить испытание.' },
  401: { name: 'Недостаточное снижение застреваний', action: 'Проверить маршруты и повторить измерение без изменения методики или подгонки результата.' },
  402: { name: 'Бюджет навигации превышен', action: 'Измерить полный путь перестройки и запросов, устранить превышение и повторить тест.' },
  403: { name: 'Сохранение или повтор не воспроизводятся', action: 'Проверить полное состояние, ссылки, очередь событий и потоки RNG.' },
  404: { name: 'Soak не соответствует порогам', action: 'Исправить выявленные утечки, зависания или забытые чертежи и повторить 30-минутное испытание.' },
  420: { name: 'Наложения при встречном движении', action: 'Обеспечить безопасный разъезд через дверь без наложения и телепорта; проверить обе фракции.' },
  421: { name: 'Встречное движение не завершено', action: 'Проверить фактическое пересечение, достижение целей и причины сброса пути обоих юнитов.' },
  422: { name: 'Неполное покрытие встречных пробок', action: 'Добавить проверяемые испытания техники, колонн и доков, не подменяя их одиночной парой.' },
});

const missingCodes = { integration: 201, cards: 202, navigation: 203, deadlocks: 204,
  nav_budget: 205, save_replay: 206, input_replay: 207, browser_fps: 208, soak: 209, doors: 210 };
const number = (v) => typeof v === 'number' && Number.isFinite(v);
const value = (v) => v === undefined ? null : v;

// Принимает только фактические результаты аудита. Каждая непройденная проверка
// обязана породить хотя бы одну ошибку, даже если JSON пустой или повреждён.
export function diagnoseChecks(checks, required = []) {
  const issues = [];
  const add = (check, code, message, observed = null, expected = null, extra = {}) => {
    if (!catalog[code]) throw new Error(`Неизвестный код диагностики ${code}`);
    issues.push({ code, check: check.id, status: check.status, title: catalog[code].name,
      message, observed: value(observed), expected: value(expected), action: catalog[code].action, ...extra });
  };
  for (const id of required) {
    const count = checks.filter((c) => c.id === id).length;
    if (count === 0) add({ id, status: 'missing' }, 7, `Обязательная проверка ${id} отсутствует в отчёте.`, 0, 1);
    if (count > 1) add({ id, status: 'fail' }, 8, `Проверка ${id} встречается в отчёте ${count} раз.`, count, 1);
  }
  for (const c of checks) {
    if (c.status === 'pass') continue;
    const before = issues.length;
    if (c.status === 'not_run') {
      add(c, 3, c.reason || 'Проверка не запускалась.', c.status, 'полный запуск и pass');
      continue;
    }
    if (c.status === 'missing') {
      add(c, missingCodes[c.id] ?? 7, `${c.description}: проверочный сценарий отсутствует.`, c.path, 'существующий, выполненный сценарий');
      continue;
    }
    if (c.id === 'full_suite' || c.id.startsWith('partial_')) {
      add(c, 1, `${c.description}: процесс завершился с ошибкой.`, { exitCode: c.exitCode ?? null, error: c.error ?? null, outputTail: c.outputTail ?? null }, 'код выхода 0');
      continue;
    }
    if (c.id === 'production_flags') {
      add(c, 2, c.reason || 'Не включены необходимые флаги pathing_v2 и wall_collision_v2.', c.reason ?? 'один или более флагов выключены', 'оба флага включены и конфигурация читается');
      continue;
    }
    if (c.error) add(c, 4, `${c.description}: процесс проверки не выполнен корректно.`, { error: c.error, exitCode: c.exitCode ?? null, signal: c.signal ?? null }, 'успешное выполнение');
    if (c.id === 'u_trap' && number(c.passed) && number(c.total) && c.passed !== c.total) {
      const failed = Array.isArray(c.evidence?.results) ? c.evidence.results.filter((r) => !r.arrived || r.pathFailed || r.collided || !r.noTeleport || !r.movesAway) : null;
      const failedByRole = failed?.reduce((counts, r) => { counts[r.role || 'неизвестно'] = (counts[r.role || 'неизвестно'] || 0) + 1; return counts; }, {});
      add(c, 101, `U-ловушка: пройдено ${c.passed} из ${c.total}.`, { passed: c.passed, total: c.total, failedByRole: failedByRole ?? null }, '18 из 18');
    }
    const e = c.evidence;
    if (c.id === 'doors' && Array.isArray(e?.scenarios)) for (const s of e.scenarios) {
      if (!s || typeof s !== 'object') continue;
      const tag = s.kind || s.name || 'неизвестный сценарий';
      if (number(s.passed) && number(s.attempts) && s.passed !== s.attempts)
        add(c, 110, `${tag}: успешно ${s.passed} из ${s.attempts}; все достигли цели в ${value(s.reached)} попытках.`,
          { passed: s.passed, attempts: s.attempts, reached: value(s.reached), factions: s.factions ?? null, failureSamples: Array.isArray(s.failures) ? s.failures.slice(0, 2) : null }, 'все попытки обеих фракций');
      if (number(s.overlapFrames) && s.overlapFrames > 0)
        add(c, 111, `${tag}: кадров с наложением — ${s.overlapFrames}.`, { overlapFrames: s.overlapFrames, maxOverlap: value(s.maxOverlap) }, 0);
      if (number(s.speedViolations) && s.speedViolations > 0)
        add(c, 112, `${tag}: превышений контрольного шага — ${s.speedViolations}.`, s.speedViolations, 0);
      if (number(s.wallCollisions) && s.wallCollisions > 0) add(c, 113, `${tag}: пересечений стены — ${s.wallCollisions}.`, s.wallCollisions, 0);
      if (number(s.teleports) && s.teleports > 0) add(c, 114, `${tag}: крупных скачков — ${s.teleports}.`, s.teleports, 0);
      if (number(s.crossed) && number(s.attempts) && s.crossed !== s.attempts * (s.kind === 'column' ? 10 : 1))
        add(c, 115, `${tag}: не все юниты пересекли проём.`, s.crossed, s.attempts * (s.kind === 'column' ? 10 : 1));
    }
    if (c.id === 'browser_fps' && e) {
      for (const target of [400, 500]) {
        const m = Array.isArray(e.measurements) ? e.measurements.find((r) => r?.target === target) : null;
        if (m && (m.initial !== target || m.minAlive !== target || m.maxAlive !== target))
          add(c, 301, `${target}: популяция во время замера отличается от целевой.`,
            { initial: value(m.initial), minAlive: value(m.minAlive), maxAlive: value(m.maxAlive) }, target, { target });
        if (Array.isArray(m?.pageErrors) && m.pageErrors.length) add(c, 306, `${target}: ошибки страницы.`, m.pageErrors, [], { target });
      }
      for (const [key, threshold, code] of [['average400', 60, 302], ['low1_400', 45, 303], ['average500', 45, 304]]) {
        if (number(e[key]) && e[key] < threshold) add(c, code, `${key}: ${e[key].toFixed(2)} FPS, требуется не менее ${threshold}.`,
          { fps: e[key], browser: value(e.browser), mode: value(e.mode) }, threshold);
      }
      if (e.error) add(c, 4, 'Браузерный стенд завершился с ошибкой.', e.error, 'успешный запуск браузера');
      const invalid = [];
      if (e.environment !== 'browser' || e.measurement !== 'requestAnimationFrame' || e.rendered !== true ||
          e.quick !== false || typeof e.browser !== 'string' || !e.browser) invalid.push('браузер/rAF/рендер/полный режим');
      if (!Array.isArray(e.measurements) || e.measurements.length !== 2) invalid.push('две независимые нагрузки');
      for (const target of [400, 500]) {
        const m = Array.isArray(e.measurements) ? e.measurements.find((r) => r?.target === target) : null;
        if (!m) { invalid.push(`${target}: данные отсутствуют`); continue; }
        if (!number(m.elapsedMs) || m.elapsedMs < 12000 || !Number.isSafeInteger(m.frames) || m.frames <= 0 ||
            m.worstCount !== Math.ceil(m.frames * .01) || !number(m.worstTimeMs) || m.worstTimeMs <= 0 ||
            !number(m.averageFps) || Math.abs(m.averageFps - m.frames * 1000 / m.elapsedMs) >= 1e-8 ||
            !number(m.low1Fps) || Math.abs(m.low1Fps - m.worstCount * 1000 / m.worstTimeMs) >= 1e-8)
          invalid.push(`${target}: длительность, интервалы или расчёт`);
        if (!(m.drawFrames >= m.frames * .9) || !(m.canvas?.width > 0 && m.canvas?.height > 0) ||
            !(m.canvasDataLength > 1000) || m.spritesReady !== true || !(m.minVisible >= target / 4) ||
            m.screen !== 'game' || m.sameGame !== true || m.warOver !== false ||
            !number(m.gameSeconds) || !number(m.gameTimeStart) || !(m.gameSeconds > m.gameTimeStart) ||
            !(Number.isSafeInteger(m.timings?.step?.samples) && m.timings.step.samples > 0) || !Array.isArray(m.pageErrors))
          invalid.push(`${target}: игровая сцена, рендер или информация об ошибках`);
        if (e[`frames${target}`] !== m.frames || e[`average${target}`] !== m.averageFps ||
            (target === 400 && e.low1_400 !== m.low1Fps)) invalid.push(`${target}: несоответствие сводных данных`);
      }
      if (Array.isArray(e.measurements) && e.measurements.length === 2 &&
          number(e.measurements[0]?.elapsedMs) && number(e.measurements[1]?.elapsedMs) &&
          (!number(c.elapsedMs) || c.elapsedMs < e.measurements[0].elapsedMs + e.measurements[1].elapsedMs))
        invalid.push('фактическое время процесса');
      if (invalid.length) add(c, 305, 'Браузерное доказательство неполно или противоречиво.', invalid, 'полные и согласованные данные браузерного rAF с отрисовкой');
    }
    if (c.id === 'deadlocks' && e) {
      const kinds = ['foot-door-opposing', 'vehicle-opposing', 'column-opposing', 'dock-opposing'];
      const absent = kinds.filter((id) => !Array.isArray(e.coverage) || !e.coverage.some((entry) => entry?.id === id));
      if (e.coverageComplete !== true || absent.length) add(c, 422, 'Стенд встречных пробок пока охватывает не все обязательные типы.',
        { missing: absent, coverageComplete: value(e.coverageComplete) }, kinds);
      const expectedAgents = Array.isArray(e.coverage) && e.coverage.every((v) => Number.isSafeInteger(v?.scenarios) && Number.isSafeInteger(v?.participants))
        ? e.coverage.reduce((sum, v) => sum + v.scenarios * v.participants, 0) : null;
      if (expectedAgents !== null && ((number(e.arrived) && e.arrived !== expectedAgents) ||
          (number(e.crossed) && e.crossed !== expectedAgents)))
        add(c, 421, 'Встречное движение не всегда заканчивается пересечением и прибытием.',
          { scenarios: e.scenarios, arrived: value(e.arrived), crossed: value(e.crossed), failureSamples: e.failures?.slice?.(0, 2) ?? null }, expectedAgents);
      if (number(e.overlapFrames) && e.overlapFrames > 0)
        add(c, 420, `Встречная пара: кадров с наложением — ${e.overlapFrames}.`,
          { overlapFrames: e.overlapFrames, maxOverlap: value(e.maxOverlap), failureSamples: e.failures?.slice?.(0, 2) ?? null }, 0);
      if (number(e.speedViolations) && e.speedViolations > 0)
        add(c, 112, `Встречная пара: превышений контрольного шага — ${e.speedViolations}.`, e.speedViolations, 0);
      if (number(e.wallCollisions) && e.wallCollisions > 0) add(c, 113, `Встречная пара: пересечений стены — ${e.wallCollisions}.`, e.wallCollisions, 0);
      if (number(e.teleports) && e.teleports > 0) add(c, 114, `Встречная пара: крупных скачков — ${e.teleports}.`, e.teleports, 0);
    }
    if (c.id === 'navigation' && Array.isArray(e?.runs)) for (const r of e.runs) {
      if (number(r.before) && r.before > 0 && number(r.after) && r.after > r.before * 0.3)
        add(c, 401, `seed ${r.seed}, ${r.units} юнитов: застревания снижены недостаточно.`,
          { before: r.before, after: r.after, seed: value(r.seed), units: value(r.units) }, 'после ≤ 30% от до');
    }
    if (c.id === 'nav_budget' && number(e?.maxMs) && e.maxMs > 2) add(c, 402, `Максимум ${e.maxMs} мс.`, e.maxMs, 'не более 2 мс');
    if (['save_replay', 'input_replay'].includes(c.id) && e?.passed === false) add(c, 403, 'Сценарий сохранения или повтора сообщил о провале.', e, 'полное воспроизведение');
    if (c.id === 'soak' && e?.passed === false) add(c, 404, 'Длительное испытание сообщило о провале.', e, 'все пороги soak выполнены');
    if (issues.length === before) {
      if (e?.passed === false) add(c, 6, `${c.description}: сценарий сообщил о провале без распознанной конкретной причины.`, e, 'passed: true с доказательствами');
      else if (c.exitCode !== 0 && c.exitCode != null && e?.passed === true) add(c, 4, `${c.description}: процесс вернул ненулевой код несмотря на положительный JSON.`, c.exitCode, 0);
      else add(c, 5, `${c.description}: результат отсутствует, неполон или не соответствует валидатору.`, e ?? c.outputTail ?? null, 'полные корректные доказательства');
    }
  }
  return issues;
}

export function formatHuman(report) {
  const lines = [`Блок 1: ${report.verdict}`, `Режим: ${report.mode}. Блокирующих ошибок: ${report.issues.length}.`];
  if (!report.issues.length) lines.push('Ошибок не обнаружено в выполненных проверках.');
  for (const issue of report.issues) {
    lines.push('', `[${String(issue.code).padStart(3, '0')}] ${issue.title} — ${issue.check}`, issue.message);
    if (issue.observed != null) lines.push(`Факт: ${typeof issue.observed === 'string' ? issue.observed : JSON.stringify(issue.observed)}`);
    if (issue.expected != null) lines.push(`Требование: ${typeof issue.expected === 'string' ? issue.expected : JSON.stringify(issue.expected)}`);
    lines.push(`Действие: ${issue.action}`);
  }
  return lines.join('\n');
}
