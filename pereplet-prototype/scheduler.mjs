/**
 * Стабильный последовательный план задач. Зависимости задают порядок вызовов,
 * но все правила всё равно читают один и тот же снимок состояния шага.
 */
export function planRules(tasks) {
  if (!Array.isArray(tasks)) throw new Error('Нужен список задач');
  const byId = new Map();
  for (const task of tasks) {
    if (!task || typeof task.id !== 'string' || !task.id || byId.has(task.id) || typeof task.run !== 'function' || !Array.isArray(task.after || [])) throw new Error('Некорректная или повторная задача');
    byId.set(task.id, task);
  }
  const dependencies = new Map();
  for (const task of tasks) {
    const deps = new Set(task.after || []);
    if ([...deps].some(id => !byId.has(id))) throw new Error('Неизвестная зависимость');
    dependencies.set(task.id, deps);
  }
  const pending = new Set(byId.keys());
  const result = [];
  while (pending.size) {
    const ready = [...pending].filter(id => [...dependencies.get(id)].every(dep => !pending.has(dep))).sort();
    if (!ready.length) throw new Error('Цикл зависимостей');
    for (const id of ready) { pending.delete(id); result.push(byId.get(id).run); }
  }
  return result;
}
