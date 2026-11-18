// ============================================================
// route-engine ↔ RatCore — мост в обе стороны.
// ------------------------------------------------------------
// Реализует то, что в route-engine/RATCORE_INTEGRATION.md было
// только предложением:
//
// 1. Экспорт графа из RatCore (tools.save.exportJson) безопасно
//    превращается в снимок createSnapshot(): наружу уходят только
//    копии узлов и рёбер, живые структуры движка не разделяются
//    (BRIDGE.md, правило 1).
// 2. Маршрутизатор route-engine возвращает данные маршрута, но НЕ
//    меняет мир: разрешение на действия и физическое движение
//    остаются у хоста (RatCore) — как требует RATCORE_INTEGRATION.md.
//
// Код не зависит от браузера: работает и в Node.js, и в игре.
// ============================================================

/** Единицы координат RatCore: X — на восток, Y — на север (метры). */
export const RATCORE_UNITS = Object.freeze({ x: 'east-m', y: 'north-m', h: 'up-m' });

function assertExport(exported) {
  if (!exported || typeof exported !== 'object') {
    throw new TypeError('ratcoreExport: нужен результат tools.save.exportJson()');
  }
  if (!Array.isArray(exported.nodes) || !Array.isArray(exported.edges)) {
    throw new TypeError('ratcoreExport: в экспорте нет массивов nodes/edges');
  }
}

/**
 * Превращает экспорт графа RatCore в неизменяемый снимок route-engine.
 * Координаты переводятся явно: X — на восток, Y — на север.
 *
 * @param {object} exported — результат tools.save.exportJson() (или .data)
 * @param {object} options — { revision, defaultPortal }
 * @returns {{revision: string, nodes: Array, edges: Array}}
 */
export function snapshotFromRatCoreExport(exported, options = {}) {
  const data = exported && exported.data ? exported.data : exported;
  assertExport(data);
  const revision = String(options.revision || `ratcore-${data.seed ?? 0}-${data.tick ?? 0}-${data.nodes.length}x${data.edges.length}`);

  // route-engine.createSnapshot ждёт МАССИВ ID узлов, поэтому копии
  // геометрии отдаются отдельно через .nodeInfo (см. ниже).
  const nodes = data.nodes.map((node) => String(node.id));
  const nodeInfo = {};
  for (const node of data.nodes) {
    nodeInfo[String(node.id)] = {
      x: Number(node.x) || 0,
      y: Number(node.y) || 0,
      h: Number(node.h) || 0,
      kind: String(node.kind || 'point'),
      units: RATCORE_UNITS,
    };
  }

  const edges = [];
  for (const edge of data.edges) {
    const portal = edge.portal || options.defaultPortal || null;
    const base = {
      id: String(edge.id),
      kind: String(edge.kind || 'road'),
      // Стоимость в RatCore — length × costFactor; длина уже в метрах.
      cost: Math.max(0, Number(edge.length ?? 1) * Number(edge.costFactor ?? 1)),
      // Мост отдаёт РОВНО те данные, что есть у движка: дверь описывается,
      // но не открывается роутером.
      portal: portal ? {
        id: String(portal.id || edge.id),
        kind: String(portal.kind || 'door'),
        state: String(portal.state || 'open'),
        width: Number(portal.width ?? 4),
        openable: portal.openable !== false,
        openCost: Math.max(0, Number(portal.openCost ?? 0)),
      } : null,
    };
    edges.push({ ...base, from: String(edge.from), to: String(edge.to) });
    if (edge.bidirectional !== false) {
      edges.push({ ...base, id: `${edge.id}~rev`, from: String(edge.to), to: String(edge.from) });
    }
  }

  return { revision, nodes, nodeInfo, edges };
}

/**
 * Считает маршрут по графу RatCore через route-engine.
 * Реализация роутера передаётся аргументом (createSnapshot/beginSearch),
 * чтобы мост не тянул её в игры, которым она не нужна.
 *
 * @returns {object} { status, nodes, edges, actions, cost, changedWorld: false }
 */
export function routeOnRatCoreExport(exported, routeEngine, query = {}) {
  if (!routeEngine || typeof routeEngine.createSnapshot !== 'function' || typeof routeEngine.beginSearch !== 'function') {
    throw new TypeError('routeOnRatCoreExport: передайте модуль route-engine (createSnapshot/beginSearch)');
  }
  const snapshot = snapshotFromRatCoreExport(exported, { revision: query.revision });
  const engineSnapshot = routeEngine.createSnapshot(snapshot);
  if (!engineSnapshot.hasNode(String(query.from)) || !engineSnapshot.hasNode(String(query.to))) {
    return { status: 'no-such-node', nodes: [], edges: [], actions: [], cost: 0, changedWorld: false, units: RATCORE_UNITS };
  }
  const search = routeEngine.beginSearch(engineSnapshot, {
    from: String(query.from),
    to: String(query.to),
    radius: Number(query.radius || 0),
    vehicle: Boolean(query.vehicle),
    hostRevision: () => snapshot.revision,
  });
  const budget = Math.min(10000, Math.max(1, Number(query.budget) || 1000));
  let result = null;
  for (let guard = 0; guard < 1000; guard++) {
    result = search.step(budget);
    if (result && result.status !== 'running') break;
  }
  return {
    ...result,
    // Маршрут лишь предложен: мир движка не меняется.
    changedWorld: false,
    units: RATCORE_UNITS,
  };
}
