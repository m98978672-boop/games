/* ============================================================
   MESH STUDIO — ядро редактора (mesh-studio/core.js)

   Здесь нет работы с DOM и нет движка: только чистые операции над
   документом сцены. Поэтому ядро тестируется в Node без браузера.

   Что умеет:
   * хранить сцену: список моделей, каждая — меш движка + цвет + имя;
   * отменять и повторять действия (Ctrl+Z), не теряя сцену;
   * дублировать и удалять модели;
   * отдавать данные для отрисовки и экспорта.

   Геометрию создаёт движок RatCore (tools.build.*), а не этот файл:
   так модели проходят проверку меша и попадают в родной формат.
   ============================================================ */

/* Имя для новой модели: «Куб 1», «Куб 2» и так далее по порядку. */
export function nextName(scene, base) {
  const stem = String(base || 'Модель').trim() || 'Модель';
  const used = new Set(scene.map((m) => m.name));
  let n = 1;
  while (used.has(`${stem} ${n}`)) n++;
  return `${stem} ${n}`;
}

/* Сцена: неизменяемые операции. Возвращаем новый массив, чтобы отмена
   работала копией состояния, а не «магией» с мутациями. */
export function addItem(scene, item) {
  return [...scene, item];
}

export function removeItem(scene, id) {
  return scene.filter((m) => m.id !== id);
}

export function replaceItem(scene, id, patch) {
  return scene.map((m) => (m.id === id ? { ...m, ...patch } : m));
}

/* Дубликат получает новое имя и новый id, но ту же геометрию: меш движка
   неизменяемый, поэтому копия ссылается на тот же проверенный меш. */
export function duplicateItem(scene, id, makeId) {
  const src = scene.find((m) => m.id === id);
  if (!src) return { scene, copy: null };
  const copy = {
    ...src,
    id: makeId(),
    name: nextName(scene, src.base || src.name.replace(/\s+\d+$/, '')),
  };
  return { scene: addItem(scene, copy), copy };
}

/* ---------- история: отмена и повтор ---------- */

export function createHistory(limit = 60) {
  const past = [];
  const future = [];
  let current = [];

  return {
    get state() { return current; },
    init(scene) { current = scene; past.length = 0; future.length = 0; },

    /* Записать новое состояние. История хранит копии массивов: сами модели
       не мутируются, поэтому копия массива — уже полная копия сцены. */
    push(scene) {
      past.push(current);
      if (past.length > limit) past.shift();
      future.length = 0;
      current = scene;
      return current;
    },

    undo() {
      if (!past.length) return null;
      future.push(current);
      current = past.pop();
      return current;
    },

    redo() {
      if (!future.length) return null;
      past.push(current);
      current = future.pop();
      return current;
    },

    get canUndo() { return past.length > 0; },
    get canRedo() { return future.length > 0; },
    get depth() { return past.length; },
    get futureDepth() { return future.length; },
  };
}

/* ---------- статистика сцены ---------- */

export function sceneStats(scene) {
  let tris = 0;
  let meshes = 0;
  for (const m of scene) {
    if (Number.isFinite(m.triCount)) {
      tris += m.triCount;
      meshes++;
    }
  }
  return { meshes, tris, items: scene.length };
}

/* ---------- габариты для кадрирования камеры ---------- */

/* Берём общий bounding box всех моделей с учётом смещения, чтобы камера
   сама подбирала дистанцию. Пустая сцена — безопасные значения. */
export function sceneBounds(scene) {
  let minX = Infinity, minY = Infinity, minZ = Infinity;
  let maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity;
  let found = false;
  for (const m of scene) {
    const b = m.bounds || (m.mesh && m.mesh.bounds);
    if (!b) continue;
    const [ox, oy, oz] = m.position || [0, 0, 0];
    minX = Math.min(minX, b.minX + ox); maxX = Math.max(maxX, b.maxX + ox);
    minY = Math.min(minY, b.minY + oy); maxY = Math.max(maxY, b.maxY + oy);
    minZ = Math.min(minZ, b.minZ + oz); maxZ = Math.max(maxZ, b.maxZ + oz);
    found = true;
  }
  if (!found) {
    return { center: [0, 0.5, 0], radius: 1.6, empty: true };
  }
  const center = [(minX + maxX) / 2, (minY + maxY) / 2, (minZ + maxZ) / 2];
  const dx = maxX - minX, dy = maxY - minY, dz = maxZ - minZ;
  const radius = Math.max(0.4, Math.sqrt(dx * dx + dy * dy + dz * dz) / 2);
  return { center, radius, empty: false };
}

/* ---------- разбор пользовательского ввода ---------- */

/* «0,0; 0.6,0; 0.6,1» → [[0,0],[0.6,0],[0.6,1]]. Терпим к запятым внутри
   пар и к точке с запятой как разделителю пар. */
export function parsePoints(text) {
  const out = [];
  for (const chunk of String(text || '').split(';')) {
    const part = chunk.trim();
    if (!part) continue;
    const m = part.match(/^(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)$/);
    if (!m) throw new Error(`Не разобрать точку «${part}» — нужно «x, y»`);
    const x = Number(m[1]);
    const y = Number(m[2]);
    if (!Number.isFinite(x) || !Number.isFinite(y)) throw new Error(`Не число в точке «${part}»`);
    out.push([x, y]);
  }
  if (out.length < 3) throw new Error('Нужно хотя бы три точки');
  return out;
}

/* Слоёная запись движка: «(0;0)H1()» — воксель в начале координат,
   «(0;0)h3(1,0;0,1;1,1)» — наклонный слой из четырёх ячеек. Заглавная H —
   строго вертикальный, строчная h — наклонный. Проверяем ровно то, что
   примет движок, чтобы ошибка была понятной до вызова. */
export function parseLayer(text) {
  const raw = String(text || '').trim();
  if (!raw) throw new Error('Пустое обозначение слоя');
  const m = raw.match(/^\(\s*(-?\d+)\s*;\s*(-?\d+)\s*\)\s*([Hh])(?:\[(\d+)\]|(\d+))\s*\(([^()]*)\)$/);
  if (!m) {
    throw new Error('Нужен формат (X;Y)H1(смещения): например (0;0)H1() или (0;0)h3(1,0;0,1;1,1)');
  }
  const [, x, y, mode, pBracket, pPlain, pairs] = m;
  const pRaw = pBracket || pPlain || '1';
  const list = pairs.split(';').map((p) => p.trim()).filter(Boolean);
  for (const p of list) {
    if (!/^-?\d+\s*,\s*-?\d+$/.test(p)) {
      throw new Error(`Смещение «${p}» не похоже на «dx,dy»`);
    }
  }
  if (mode === 'H' && list.length) {
    throw new Error('Заглавная H — строго вертикальный слой, смещения для неё недопустимы');
  }
  // Движок требует ровно p − 1 пар смещения: слой из p ячеек задаётся
  // смещениями между соседними. Проверяем заранее, чтобы не ловить RC-303.
  const p = Number(pRaw || 1);
  if (mode !== 'H' && list.length !== Math.max(0, p - 1)) {
    throw new Error(`Слой из ${p} ячеек требует ${Math.max(0, p - 1)} пар смещения, а дано ${list.length}`);
  }
  return raw;
}

/* Рецепт сцены: последовательность операций движка. Это и есть «сохранить
   проект» — по нему модели восстанавливаются один в один через build.fromRecipe.
   Буферы движок наружу не отдаёт, и это правильно: рецепт компактнее и
   переживает смену версии геометрии. */
export function toRecipe(scene) {
  return scene.map((m) => ({
    name: m.name,
    color: m.color,
    position: m.position,
    op: m.op,
    args: m.args,
  }));
}


/* ---------- имена файлов ---------- */

export function fileName(prefix, ext, date = new Date()) {
  const pad = (n) => String(n).padStart(2, '0');
  const stamp = `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}-`
    + `${pad(date.getHours())}${pad(date.getMinutes())}`;
  return `${prefix}-${stamp}.${ext}`;
}

export default {
  nextName, addItem, removeItem, replaceItem, duplicateItem,
  createHistory, sceneStats, sceneBounds,
  parsePoints, parseLayer, toRecipe, fileName,
};
