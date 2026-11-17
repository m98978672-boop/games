// Deterministic, budgeted shortest-path search over an immutable graph snapshot.
// A zero heuristic is A* reduced to Dijkstra. The caller owns physical motion.
const MAX_NODES = 100000, MAX_EDGES = 500000;
const finiteNonnegative = n => Number.isFinite(n) && n >= 0;
const idValid = x => typeof x === 'string' && x.length > 0 && x.length <= 256;

class Heap {
  constructor() { this.a = []; this.order = 0; }
  push(node, cost) {
    const v = { node, cost, order: this.order++ }, a = this.a;
    a.push(v); let i = a.length - 1;
    while (i) { const p = (i - 1) >> 1; if (!less(v, a[p])) break; a[i] = a[p]; i = p; }
    a[i] = v;
  }
  pop() {
    const a = this.a, first = a[0], last = a.pop();
    if (a.length) {
      let i = 0;
      while (true) {
        let c = i * 2 + 1;
        if (c >= a.length) break;
        if (c + 1 < a.length && less(a[c + 1], a[c])) c++;
        if (!less(a[c], last)) break;
        a[i] = a[c]; i = c;
      }
      a[i] = last;
    }
    return first;
  }
  get size() { return this.a.length; }
}
function less(a, b) { return a.cost < b.cost || (a.cost === b.cost && a.order < b.order); }

/** Copy and validate a directed graph supplied by the host. No world data is mutated. */
export function createSnapshot({ nodes, edges, revision }) {
  if (!Array.isArray(nodes) || !nodes.length || nodes.length > MAX_NODES || !Array.isArray(edges) || edges.length > MAX_EDGES)
    throw new TypeError('invalid graph size');
  if (!idValid(revision)) throw new TypeError('revision must be a non-empty string');
  const adjacency = new Map();
  for (const n of nodes) {
    if (!idValid(n) || adjacency.has(n)) throw new TypeError('invalid or duplicate node');
    adjacency.set(n, []);
  }
  const edgeIds = new Set();
  for (const e of edges) {
    if (!e || !idValid(e.id) || edgeIds.has(e.id) || !adjacency.has(e.from) || !adjacency.has(e.to) || !finiteNonnegative(e.cost))
      throw new TypeError('invalid or duplicate edge');
    edgeIds.add(e.id);
    let portal = null;
    if (e.portal != null) {
      const p = e.portal;
      if (!idValid(p.id) || !['door', 'gate'].includes(p.kind) || !['open', 'closed', 'blocked'].includes(p.state) ||
          !finiteNonnegative(p.width) || typeof p.openable !== 'boolean' || !finiteNonnegative(p.openCost))
        throw new TypeError('invalid portal');
      portal = Object.freeze({ id:p.id, kind:p.kind, state:p.state, width:p.width, openable:p.openable, openCost:p.openCost });
    }
    adjacency.get(e.from).push(Object.freeze({ id:e.id, from:e.from, to:e.to, cost:e.cost, portal }));
  }
  for (const list of adjacency.values()) Object.freeze(list);
  // Keep the adjacency map private. Freeze alone would not make a Map immutable.
  return Object.freeze({ revision, hasNode: id => adjacency.has(id), edgesFrom: id => adjacency.get(id) || EMPTY });
}
const EMPTY = Object.freeze([]);

/**
 * hostRevision() must change before any traversability/geometry/permission change,
 * including changes pending in an asynchronous navigation rebuild.
 */
export function beginSearch(snapshot, { from, to, radius = 0, vehicle = false, hostRevision = () => snapshot.revision }) {
  if (!snapshot || !idValid(snapshot.revision) || typeof snapshot.hasNode !== 'function' || typeof snapshot.edgesFrom !== 'function' ||
      !snapshot.hasNode(from) || !snapshot.hasNode(to) || !finiteNonnegative(radius) || typeof vehicle !== 'boolean' || typeof hostRevision !== 'function')
    throw new TypeError('invalid search input');
  const queue = new Heap(), dist = new Map([[from, 0]]), previous = new Map();
  queue.push(from, 0);
  let status = 'running', result = null, expansions = 0, current = null;
  const finish = (s, data = {}) => { status = s; result = Object.freeze({ status:s, expansions, ...data }); return result; };
  function reconstruct(cost) {
    const nodes = [to], edges = [], actions = [];
    for (let n = to; n !== from;) {
      const e = previous.get(n); edges.push(e.id);
      if (e.portal) actions.push(Object.freeze({ edgeId:e.id, portalId:e.portal.id, kind:e.portal.kind,
        action:e.portal.state === 'closed' ? 'open-and-cross' : 'cross' }));
      n = e.from; nodes.push(n);
    }
    return { nodes:Object.freeze(nodes.reverse()), edges:Object.freeze(edges.reverse()), actions:Object.freeze(actions.reverse()), cost };
  }
  return Object.freeze({
    step(budget) {
      if (!Number.isSafeInteger(budget) || budget < 1 || budget > 10000) throw new RangeError('budget must be 1..10000');
      if (status !== 'running') return result;
      if (hostRevision() !== snapshot.revision) return finish('stale');
      let used = 0;
      // One operation is one heap pop or one edge relaxation. Even a node
      // with many outgoing edges is processed over multiple calls.
      while (used < budget && (current || queue.size)) {
        if (!current) {
          const cur = queue.pop(); used++;
          if (cur.cost !== dist.get(cur.node)) continue;
          expansions++;
          if (cur.node === to) return finish('found', reconstruct(cur.cost));
          current = { cost:cur.cost, edges:snapshot.edgesFrom(cur.node), index:0 };
          if (!current.edges.length) current = null;
          continue;
        }
        const edge = current.edges[current.index++]; used++;
        const p = edge.portal;
        if (!p || !(p.state === 'blocked' || (vehicle && p.kind !== 'gate') || p.width <= 2 * radius || (p.state === 'closed' && !p.openable))) {
          const candidate = current.cost + edge.cost + (p && p.state === 'closed' ? p.openCost : 0);
          if (Number.isFinite(candidate) && candidate < (dist.get(edge.to) ?? Infinity)) {
            dist.set(edge.to, candidate); previous.set(edge.to, edge); queue.push(edge.to, candidate);
          }
        }
        if (current.index === current.edges.length) current = null;
      }
      if (!current && !queue.size) return finish('unreachable');
      return Object.freeze({ status, expansions, used });
    },
    cancel() { return status === 'running' ? finish('cancelled') : result; },
    get status() { return status; }
  });
}
