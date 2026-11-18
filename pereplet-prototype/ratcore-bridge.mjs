// ============================================================
// «Переплёт» ↔ RatCore — мост к ядру движка (BRIDGE.md §2.4).
// ------------------------------------------------------------
// Было: прототип «Переплёта» жил сам по себе и не был связан ни с чем.
// Стало: шаг симуляции RatCore — единственный источник снимка мира,
// а «Переплёт» применяет свои правила (расход топлива, износ, ресурсы,
// возрождение) к НЕИЗМЕНЯЕМОМУ снимку и возвращает предложенные
// изменения. Конфликт записи одного поля отклоняется так же строго —
// это встроено в шаг прототипа.
//
// Защита: мост только формирует снимок из экспорта движка и передаёт
// изменения обратно через официальные tools RatCore. Он не читает живые
// буферы AssetVault и не ослабляет ToolGuard.
// ============================================================

/** Стабильный неотрицательный числовой ID для сущностей без numericId. */
export function stableNumericId(id) {
  let hash = 2166136261;
  for (let i = 0; i < id.length; i++) {
    hash ^= id.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 1;
}

/** Превращает экспорт мира RatCore в снимок, который ждёт step() «Переплёта». */
export function snapshotForPereplet(exported) {
  const data = exported && exported.data ? exported.data : exported;
  if (!data || !Array.isArray(data.entities)) {
    throw new TypeError('snapshotForPereplet: нужен результат tools.save.exportJson()');
  }
  return {
    tick: Number(data.tick) || 0,
    // У «Переплёта» сущность = { id, x, z, hp }: z — север (ось Y движка).
    // id обязан быть безопасным целым: берём числовой ID движка, иначе стабильный хеш строки.
    entities: data.entities.map((entity) => ({
      id: Number.isSafeInteger(Number(entity.numericId)) && Number(entity.numericId) >= 0
        ? Number(entity.numericId)
        : stableNumericId(String(entity.id)),
      x: Number(entity.x) || 0,
      z: Number(entity.y) || 0,
      hp: Number(entity.hp ?? entity.health ?? 100) || 0,
    })),
  };
}

/**
 * Выполняет один шаг «Переплёта» на снимке RatCore.
 * Возвращает предложенные изменения и НЕ применяет их к миру:
 * применение — отдельный, явный шаг хоста через tools.move/write.
 */
export async function stepPerepletOnRatCore(pereplet, exported, rules, dt = 1 / 30) {
  if (!pereplet || typeof pereplet.step !== 'function') {
    throw new TypeError('stepPerepletOnRatCore: нужен модуль pereplet-prototype/core.mjs');
  }
  const snapshot = snapshotForPereplet(exported);
  if (!snapshot.entities.length) {
    return { tick: snapshot.tick, changes: [], proposed: [], skipped: true };
  }
  const next = pereplet.step(snapshot, rules, dt);
  const changed = [];
  for (const entity of next.entities) {
    const before = snapshot.entities.find((e) => e.id === entity.id);
    if (!before) continue;
    if (before.x !== entity.x) changed.push({ id: entity.id, field: 'x', value: entity.x });
    if (before.z !== entity.z) changed.push({ id: entity.id, field: 'z', value: entity.z });
    if (before.hp !== entity.hp) changed.push({ id: entity.id, field: 'hp', value: entity.hp });
  }
  return { tick: next.tick, changes: changed, proposed: next.entities, skipped: false };
}

/**
 * Применяет изменения «Переплёта» к миру RatCore через официальные инструменты
 * (tools.move.entity). Возвращает отчёт: что применено, а что отклонено.
 * Именно здесь, а не в роутере или правилах, мир действительно меняется.
 */
export function applyPerepletChanges(engine, changes, idMap = {}) {
  if (!engine || !engine.tools || !engine.tools.move || typeof engine.tools.move.entity !== 'function') {
    throw new TypeError('applyPerepletChanges: нужен экземпляр движка RatCore (createEngine)');
  }
  const applied = [];
  const rejected = [];
  for (const change of changes || []) {
    const entityId = idMap[change.id] || idMap[String(change.id)] || null;
    if (!entityId) { rejected.push({ ...change, reason: 'нет соответствия сущности движка' }); continue; }
    const args = { id: entityId };
    if (change.field === 'x') args.x = change.value;
    else if (change.field === 'z') args.y = change.value; // z «Переплёта» = Y движка
    else { rejected.push({ ...change, reason: `поле ${change.field} движок не принимает через move.entity` }); continue; }
    const res = engine.tools.move.entity(args);
    if (res && res.ok) applied.push({ ...change, engineId: entityId });
    else rejected.push({ ...change, reason: res && res.error ? res.error.code || res.error.message : 'отказ движка' });
  }
  return { applied, rejected, changedWorld: applied.length > 0 };
}
