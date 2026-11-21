// Метка именно этой локальной экспериментальной сборки, не утверждение о
// содержимом GitHub Pages. Перед каждой публикацией идентификатор обновляют.
export const BUILD_VERSION = '0.11.0-dev.crowd-coordination.3';

// UI-only: выключенный флаг не добавляет DOM-узлов и не влияет на симуляцию.
export function mountBuildVersion(doc, enabled, version = BUILD_VERSION) {
  if (!enabled) return null;
  const badge = doc.createElement('div');
  badge.id = 'build-version';
  badge.className = 'build-version';
  badge.textContent = `Сборка ${version}`;
  badge.setAttribute('aria-label', `Версия сборки ${version}`);
  doc.body.appendChild(badge);
  return badge;
}
