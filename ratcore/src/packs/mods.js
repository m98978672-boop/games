// RatCore Pack [pack:mods] — Безопасная система модов .ratmod.rcw2, ToolGuard-аудит, ModQuota и Hot-Reload (F-138..F-139, A-93)
// Подключается строго по выбору (Zero-Cost Opt-In, RC-108 когда пакет выключен).

import { RatCoreError } from '../core/seal.js';
import { auditSourceCode } from '../core/code-auditor.js';
import { encodeWire2Frame, decodeWire2Frame } from '../compress/wire2.js';
import { crc32 } from '../compress/codec.js';

const FORBIDDEN_MOD_PATTERNS = [
  { re: /\beval\s*\(/, reason: 'Запрещён вызов eval() в песочнице мода' },
  { re: /\bnew\s+Function\s*\(/, reason: 'Запрещён динамический конструктор Function()' },
  { re: /\bfetch\s*\(|\bXMLHttpRequest\b|\bWebSocket\b/, reason: 'Запрещён сетевой выход из песочницы мода' },
  { re: /\bprocess\.env\b|\bchild_process\b|\bfs\./, reason: 'Запрещён доступ к ОС/ФС из мода' },
];

export class ModSandboxManager {
  constructor({ maxTotalQuotaPct = 25 } = {}) {
    this.maxTotalQuotaPct = Math.max(5, Math.min(50, Number(maxTotalQuotaPct)));
    this.mounted = new Map(); // modId -> record
    this.loadOrder = [];
    this.seq = 1;
  }

  // Упаковка мода в 1 бинарный сжатый контейнер .ratmod.rcw2 (RCW2 + CRC32)
  pack({ manifest = {}, recipes = [], rules = [], assets = [], scripts = [] } = {}) {
    const id = String(manifest.id || '').trim();
    if (!id || !/^[a-z0-9._-]{2,64}$/i.test(id)) {
      throw new RatCoreError('RC-104', `Недопустимый manifest.id мода: "${id}"`, 'Используй латиницу, цифры, ".", "_" или "-" (2..64 символа).');
    }
    const payloadObj = {
      schema: 'ratmod/1',
      manifest: {
        id,
        name: String(manifest.name || id),
        version: String(manifest.version || '1.0.0'),
        author: String(manifest.author || 'anonymous'),
        requires: Array.isArray(manifest.requires) ? manifest.requires.map(String) : [],
      },
      recipes: Array.isArray(recipes) ? recipes : [],
      rules: Array.isArray(rules) ? rules : [],
      assets: Array.isArray(assets) ? assets : [],
      scripts: Array.isArray(scripts) ? scripts.map(String) : [],
    };
    const jsonBytes = new TextEncoder().encode(JSON.stringify(payloadObj));
    const wire = encodeWire2Frame(jsonBytes, { seq: this.seq++, codec: 'auto' });
    return {
      modId: id,
      fileName: `${id}.ratmod.rcw2`,
      rawBytes: jsonBytes.length,
      packedBytes: wire.wireBytes,
      codecId: wire.codecId,
      crc32: crc32(wire.frame),
      packageBytes: wire.frame,
    };
  }

  // Строгая валидация пакета: CRC32 + ToolGuard (Барьер 4 + проверка рецептов) + ModQuota
  validate({ packageBytes, quotaPct = 10 } = {}) {
    if (!(packageBytes instanceof Uint8Array) || packageBytes.length < 16) {
      return { valid: false, code: 'RC-701', errors: ['Передан пустой или повреждённый буфер .ratmod.rcw2'], manifest: null };
    }
    let decoded;
    try {
      decoded = decodeWire2Frame(packageBytes, { asJson: true });
    } catch (err) {
      return { valid: false, code: err.code || 'RC-702', errors: [err.message || 'Ошибка распаковки RCW2'], manifest: null };
    }
    const pkg = decoded.data;
    if (!pkg || pkg.schema !== 'ratmod/1' || !pkg.manifest?.id) {
      return { valid: false, code: 'RC-703', errors: ['Некорректная схема пакета (ожидается ratmod/1)'], manifest: null };
    }

    const errors = [];
    let primaryCode = null;

    // 1. Проверка ToolGuard: запрет сырых неподписанных вершин/геометрии в рецептах и ассетах
    for (const r of (pkg.recipes || [])) {
      if (r && (r.rawVertices || r.positions || r.Float32Array)) {
        primaryCode = primaryCode || 'RC-101';
        errors.push(`Рецепт "${r.id || '?'}" содержит сырые вершины в обход ToolGuard`);
      }
    }
    for (const a of (pkg.assets || [])) {
      if (a && (a.rawPixels || a.rawVertices)) {
        primaryCode = primaryCode || 'RC-101';
        errors.push(`Ассет "${a.id || '?'}" содержит сырой буфер вместо процедурного рецепта`);
      }
    }

    // 2. Барьер 4 (auditSourceCode) + песочница запрещённых API для всех скриптов/правил
    const allCode = [
      ...(pkg.scripts || []),
      ...(pkg.rules || []).filter((r) => typeof r === 'string'),
    ];
    for (let i = 0; i < allCode.length; i++) {
      const src = allCode[i];
      const audit = auditSourceCode(src, `${pkg.manifest.id}#script${i}`);
      if (!audit.ok) {
        primaryCode = primaryCode || 'RC-102';
        for (const v of audit.violations) {
          errors.push(`ToolGuard (${v.code}): ${v.message}`);
        }
      }
      for (const p of FORBIDDEN_MOD_PATTERNS) {
        if (p.re.test(src)) {
          primaryCode = primaryCode || 'RC-102';
          errors.push(p.reason);
        }
      }
    }

    // 3. Проверка лимита квоты CPU (F-138)
    const q = Number(quotaPct);
    if (!Number.isFinite(q) || q <= 0 || q > this.maxTotalQuotaPct) {
      primaryCode = primaryCode || 'RC-603';
      errors.push(`Запрошенная квота CPU ${q}% превышает лимит песочницы (${this.maxTotalQuotaPct}%)`);
    }

    return {
      valid: errors.length === 0,
      code: primaryCode,
      errors,
      manifest: pkg.manifest,
      stats: {
        recipes: (pkg.recipes || []).length,
        rules: (pkg.rules || []).length,
        assets: (pkg.assets || []).length,
        scripts: (pkg.scripts || []).length,
        wireBytes: packageBytes.length,
      },
      pkg: errors.length === 0 ? pkg : null,
    };
  }

  // Топологическая сортировка зависимостей модов (алгоритм Кана, F-139, A-93)
  _computeTopologicalOrder(extraMod = null) {
    const nodes = new Map();
    for (const [id, rec] of this.mounted) nodes.set(id, rec.manifest.requires || []);
    if (extraMod) nodes.set(extraMod.manifest.id, extraMod.manifest.requires || []);

    for (const [id, deps] of nodes) {
      for (const dep of deps) {
        if (!nodes.has(dep)) {
          throw new RatCoreError('RC-106', `Мод "${id}" требует отсутствующую зависимость "${dep}"`, `Сначала подключи мод "${dep}" через mod.mount().`);
        }
      }
    }

    const inDeg = new Map();
    const adj = new Map();
    for (const id of nodes.keys()) {
      inDeg.set(id, 0);
      adj.set(id, []);
    }
    for (const [id, deps] of nodes) {
      for (const dep of deps) {
        adj.get(dep).push(id);
        inDeg.set(id, inDeg.get(id) + 1);
      }
    }

    const queue = [];
    for (const [id, deg] of inDeg) {
      if (deg === 0) queue.push(id);
    }
    queue.sort();

    const order = [];
    while (queue.length > 0) {
      const cur = queue.shift();
      order.push(cur);
      for (const nxt of adj.get(cur)) {
        const d = inDeg.get(nxt) - 1;
        inDeg.set(nxt, d);
        if (d === 0) queue.push(nxt);
      }
    }
    if (order.length !== nodes.size) {
      throw new RatCoreError('RC-106', 'Обнаружена циклическая зависимость между модами', 'Удали взаимную ссылку в manifest.requires.');
    }
    return order;
  }

  mount({ packageBytes, quotaPct = 10 } = {}) {
    const check = this.validate({ packageBytes, quotaPct });
    if (!check.valid) {
      throw new RatCoreError(check.code || 'RC-102', `Мод отклонён валидацией: ${check.errors.join('; ')}`, 'Исправь нарушения ToolGuard/песочницы и пересобери .ratmod.rcw2.');
    }
    const pkg = check.pkg;
    const modId = pkg.manifest.id;

    // Проверка суммарной квоты CPU
    let usedQuota = 0;
    for (const [id, rec] of this.mounted) {
      if (id !== modId) usedQuota += rec.quotaPct;
    }
    if (usedQuota + quotaPct > this.maxTotalQuotaPct) {
      throw new RatCoreError('RC-603', `Суммарная квота модов (${usedQuota + quotaPct}%) превышает лимит ${this.maxTotalQuotaPct}%`, 'Уменьши quotaPct или выгрузи неиспользуемые моды.');
    }

    const order = this._computeTopologicalOrder(pkg);
    const record = {
      modId,
      manifest: pkg.manifest,
      recipes: pkg.recipes,
      rules: pkg.rules,
      assets: pkg.assets,
      quotaPct: Number(quotaPct),
      cpuUsedMs: 0,
      cpuBudgetMs: (16.67 * Number(quotaPct)) / 100,
      paused: false,
      pauseReason: null,
      reloads: 0,
      mountedAt: Date.now(),
    };
    this.mounted.set(modId, record);
    this.loadOrder = order;
    return {
      mounted: true,
      modId,
      version: record.manifest.version,
      quotaPct: record.quotaPct,
      cpuBudgetMs: Number(record.cpuBudgetMs.toFixed(3)),
      loadOrder: [...this.loadOrder],
    };
  }

  // Учёт CPU-бюджета мода (F-138): при перерасходе авто-пауза без краша игры
  recordModCpu({ modId, spentMs = 0 } = {}) {
    const rec = this.mounted.get(modId);
    if (!rec) throw new RatCoreError('RC-104', `Мод "${modId}" не подключён`, 'Проверь список через mod.list().');
    rec.cpuUsedMs = Number(spentMs);
    if (rec.cpuUsedMs > rec.cpuBudgetMs) {
      rec.paused = true;
      rec.pauseReason = `Превышен бюджет ModQuota (${rec.cpuUsedMs.toFixed(2)} мс > ${rec.cpuBudgetMs.toFixed(2)} мс)`;
    }
    return { modId, cpuUsedMs: rec.cpuUsedMs, cpuBudgetMs: Number(rec.cpuBudgetMs.toFixed(3)), paused: rec.paused, pauseReason: rec.pauseReason };
  }

  // Горячее обновление без перезапуска мира и с сохранением прежней версии при ошибке
  hotReload({ modId, packageBytes } = {}) {
    const prev = this.mounted.get(modId);
    if (!prev) throw new RatCoreError('RC-104', `Мод "${modId}" не найден для hotReload`, 'Сначала подключи мод через mod.mount().');
    const check = this.validate({ packageBytes, quotaPct: prev.quotaPct });
    if (!check.valid) {
      throw new RatCoreError(check.code || 'RC-102', `Hot-Reload отклонён (предыдущая версия сохранена): ${check.errors.join('; ')}`, 'Исправь новый пакет мода.');
    }
    const pkg = check.pkg;
    if (pkg.manifest.id !== modId) {
      throw new RatCoreError('RC-104', `ID нового пакета "${pkg.manifest.id}" не совпадает с "${modId}"`, 'Используй тот же manifest.id для hotReload.');
    }
    prev.manifest = pkg.manifest;
    prev.recipes = pkg.recipes;
    prev.rules = pkg.rules;
    prev.assets = pkg.assets;
    prev.paused = false;
    prev.pauseReason = null;
    prev.reloads++;
    this.loadOrder = this._computeTopologicalOrder();
    return { reloaded: true, modId, version: prev.manifest.version, reloads: prev.reloads };
  }

  unmount({ modId } = {}) {
    if (!this.mounted.has(modId)) {
      return { unmounted: false, modId };
    }
    // Проверяем, не зависит ли другой активный мод от удаляемого
    for (const [otherId, rec] of this.mounted) {
      if (otherId !== modId && (rec.manifest.requires || []).includes(modId)) {
        throw new RatCoreError('RC-106', `Нельзя выгрузить "${modId}": от него зависит "${otherId}"`, `Сначала выгрузи "${otherId}".`);
      }
    }
    this.mounted.delete(modId);
    this.loadOrder = this.mounted.size > 0 ? this._computeTopologicalOrder() : [];
    return { unmounted: true, modId, remaining: this.mounted.size };
  }

  list() {
    return this.loadOrder.map((id) => {
      const r = this.mounted.get(id);
      return {
        modId: r.modId,
        name: r.manifest.name,
        version: r.manifest.version,
        requires: [...r.manifest.requires],
        quotaPct: r.quotaPct,
        paused: r.paused,
        reloads: r.reloads,
        recipes: r.recipes.length,
      };
    });
  }
}
