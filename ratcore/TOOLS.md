# RatCore — полный каталог инструментов на все случаи жизни (`TOOLS.md`)

**Версия:** 0.9-draft (2026-11-16)  
**Охват:** **36 усиленных веток инструментов v2.0** `engine.tools.<группа>.<метод>(args, ctx?)` + **3-уровневая система модулей по выбору (`Core` / `10 Standard Modules` / `14 Optional Opt-In Packs`, `0 Б` у выключенных пакетов)** + **умный поиск инструментов для ИИ (`tools.discover`)** + универсальный конвейер (`pipe`, `dryRun`, `compact/RCW2`, `memoize`, `checkpoint/rollback`, `autoFixHint`, `budgetMs/priority`) + **`RatStudio`**, **«Машина времени», Автобалансировщик, 1-файловый `.html`** + **12-уровневый стек сжатия, `ratcore-wire/2`, `CoreGovernor` (`Eco 40% / Balanced 60% / Turbo 75%`), `Dynamic Resolution`, `Async Shader Pre-Warm`, `OffscreenCanvas`, `Self-Healing Watchdog`, `pack:webgpu` и `pack:wasm-accel`**.  
**Связанные документы:** [`ALGORITHMS.md`](./ALGORITHMS.md) (`F-01..F-185`, `A-01..A-125`) · [`COMPRESSION.md`](./COMPRESSION.md) · [`BRIDGE.md`](./BRIDGE.md).  
**Принцип:** единый формат ответа, обязательная проверка `ToolGuard`, автоматическое логирование в журнал операций, поддержка отката (`undo`/`redo`) и строгий принцип **«не используешь — не платишь» (`Zero-Cost Opt-In`, `RC-108`)**.

---

## 0. Единый контракт вызова и ответа (Универсальный конвейер инструментов v2.0)

### Расширенный контекст вызова (`ctx`, опционально — берётся из активной сессии агента)
```json
{
  "agentId": "ai-modeler",
  "role": "modeler",
  "traceId": "tr-0042",
  "dryRun": false,
  "compact": false,
  "wire": "json | rcw2",
  "priority": 1,
  "budgetMs": 1.5,
  "idempotencyKey": "op-build-house-01",
  "memoize": true
}
```
- **`dryRun: true`** — работает на **любом** инструменте: проверяет `ToolGuard`, инварианты, оценивает цену в мс/байтах и возвращает предпросмотр **без изменения мира**.
- **`compact: true` / `wire: 'rcw2'`** — сжимает ответ в бинарный фрейм `RCW2` со словарём `ratcore-dict-v1` (в `5×–20×` меньше трафика для ИИ и мостов!).
- **`priority: 0..3` и `budgetMs`** — встраивает тяжёлый вызов напрямую в Work-Stealing очередь `CoreGovernor 75 %` (`A-75`, `A-76`) без единого фриза!
- **`idempotencyKey` и `memoize: true`** — повторный чистый вызов на том же `worldTick` отдаёт кэш за **`0.01 мс`** (и защищает от дублей при сбое сети/моста).
- **`autoFixHint`** — при любой ошибке инструмент возвращает не только код, но и **готовую исправленную команду** для мгновенного повтора!
- **`tools.discover({ intent, limit: 5 })` (v0.9-draft, `F-183..F-185`, `A-124..A-125`)** — мгновенный офлайн-поиск по компактному `tools-manifest.json` (`< 1 мс`): нейросеть описывает задачу словами (*«разрушаемый мост над замерзающей рекой»*) и получает ровно нужные 5 методов, их схемы аргументов и нужные `packs` без чтения всего каталога на 36 веток!
- **`watch.bottleneckReport({ windowSec: 5 })` и `watch.leakSentinel()` (v0.9-draft, `F-178..F-182`, `A-122..A-123`)** — 1 вызов выдаёт топ-3 узких места кадра с конкретным советом оптимизации и ловит утечки массивов/слушателей ещё до просадки FPS.

### Единый формат ответа каждого инструмента
```json
{
  "ok": true,
  "tool": "build.extrude",
  "data": {},
  "error": null,
  "tick": 120,
  "costMs": 0.42,
  "memDeltaBytes": 16384,
  "cached": false,
  "traceId": "tr-0042"
}
```
При ошибке:
```json
{
  "ok": false,
  "tool": "build.map.placeEntity",
  "data": null,
  "error": {
    "code": "RC-101",
    "message": "Сырой меш запрещён. Объект не имеет печати ToolGuard.",
    "hint": "Построй меш через tools.build.extrude / loft / lathe / layer / voxels / primitive / combine. Справка: tools.help('build')",
    "autoFixHint": { "tool": "build.extrude", "args": { "contour": [[0,0],[4,0],[4,4],[0,4]], "height": 3 } }
  },
  "tick": 120,
  "costMs": 0.05,
  "traceId": "tr-0042"
}
```

### Служебные методы корня шлюза `tools.*`
| Метод | Аргументы | Что делает |
|---|---|---|
| `tools.help(group?)` | `group?: string` | Возвращает список всех 25 групп инструментов или подробную схему конкретной группы из `tools-manifest.json`. |
| `tools.whoami()` | — | Возвращает текущего активного агента (`agentId`, `role`, права, активную сессию). |
| `tools.asAgent(agentId, role)` | `agentId, role` | Возвращает привязанный к конкретной нейросети фасад `tools` (все действия и конверты подписываются её именем). |
| `tools.batch(ops)` | `ops: Array<{ tool, args }>` | Атомарно выполняет цепочку инструментов. Если любой шаг падает — откатывает всю пачку. |
| `tools.pipe(steps)` | `steps: Array<{ tool, args, bindPrevAs? }>` | Конвейер: передаёт результат шага `k` напрямую на вход шага `k+1` без промежуточных сериализаций и в 1 транзакцию! |
| `tools.macro(name, steps)` | `name, steps` | Регистрирует переиспользуемый параметрический макрос поверх инструментов (с проверкой `ToolGuard` на каждом шаге). |
| `tools.checkpoint(label?)` | `label?: string` | Сохраняет мгновенную контрольную точку (`COW-снимок`) перед серией экспериментов. |
| `tools.rollbackTo(cpId)` | `cpId: string` | Мгновенно откатывает мир и историю к контрольной точке `cpId`. |
| `tools.history(limit?)` | `limit?: number` | Возвращает журнал последних вызовов инструментов (для аудита и `reproOps` в баг-репортах). |

---

## 1. `tools.build.*` — Строить (модели, меши, текстуры, карты)

Все методы ниже **подписывают** результат закрытой печатью `ToolGuard` (`src/core/seal.js`), сохраняют реальные буферы в приватном `AssetVault` (`src/core/vault.js`) и отдают наружу замороженный хэндл (`MeshHandle` / `TextureHandle`).

### 1.1. Модели и меши (`tools.build.*`)
| Инструмент | Основные аргументы | Алгоритм / Формула | Результат |
|---|---|---|---|
| `build.extrude` | `{ contour: [[x,y],...], height, bevel?, bevelSteps?, capTop?, capBottom?, texId?, yOffset? }` | `A-12` (Ear Clipping), `A-13` (Extrude+Bevel), `F-25` | `MeshHandle` (с `recipe`, `hash`, `stats`) |
| `build.loft` | `{ sections: Array<{ y, points: [[x,z],...] }>, closed?, capEnds?, texId? }` | `A-14` (Loft по сечениям), `F-25` | `MeshHandle` |
| `build.lathe` | `{ profile: [[r,y],...], segments, arcDeg?, texId? }` | `A-15` (Тело вращения), `F-25` | `MeshHandle` |
| `build.layer` | `{ expr: "(X;Y)Hp(...)", texId?, cellSize?, layerHeight? }` | `A-06` (парсер `(X;Y)Hp`), `F-08..F-12`, `A-16` | `MeshHandle` + список `faceIds: BigInt[]` |
| `build.voxels` | `{ cells: Array<{ i,j,k,texId }>, greedy?: true, cullHidden?: true }` | `A-16` (Hidden Face Culling + Greedy Meshing) | `MeshHandle` (оптимизированный меш) |
| `build.surface` | `{ points: [[x,y,z],...], isoLevel?, cellSize?, texId? }` | `A-17` (Surface Nets по полю/точкам) | `MeshHandle` (гладкий меш) |
| `build.primitive` | `{ shape: 'box'|'prism'|'cylinder'|'cone'|'roof'|'arch'|'sphere', size, segments?, texId? }` | Параметрические формулы + `F-25` | `MeshHandle` |
| `build.combine` | `{ parts: Array<{ mesh: MeshHandle, pos?, rotDeg?, scale?, name? }>, mergeBuffers?: true }` | Трансформация вершин матрицей `Mat4` (`F-03`) + слияние | Единый составной `MeshHandle` |
| `build.fromRecipe` | `{ modelId, ops: Array<{ tool, args }>, seed? }` | Последовательный запуск `ops` с проверкой `RC-103` | `MeshHandle` (воспроизводимый по рецепту) |
| `build.exportRecipe` | `{ mesh: MeshHandle }` | Извлечение замороженного `recipe` (без сырых вершин!) | JSON-рецепт `.ratmodel.json` |
| `build.validate` | `{ mesh: MeshHandle, maxTris?, checkNormals?: true, checkHoles?: true, checkNaN?: true }` | `A-18` (аудит геометрии) | `{ valid, validatedHandle, issues[], stats }` |

### 1.2. Растровые текстуры и атлас (`tools.build.tex.*`)
| Инструмент | Основные аргументы | Алгоритм / Формула | Результат |
|---|---|---|---|
| `build.tex.generate` | `{ width, height, seed, palette?, layers: Array<{ kind, params, blend, alpha }> }` | `A-19..A-22` (FBM, Voronoi, Bricks, Dither, Palette) | `TextureHandle` (`albedo`) |
| `build.tex.normalMap` | `{ texture: TextureHandle, strength? }` | `A-23` (фильтр Собеля по высоте) | `TextureHandle` (`normal`) |
| `build.tex.makeDamaged` | `{ texture: TextureHandle, wear: 0.45..0.9, seed? }` | `A-24` (трещины Voronoi + сколы) + слот `t + 2048` | `TextureHandle` (повреждённая пара) |
| `build.tex.packAtlas` | `{ textures: TextureHandle[], tileSize?, padding? }` | `A-25` (Shelf/Grid Bin Packing) | `AtlasHandle` + таблица UV-слотов `0..4094` |

### 1.3. Постройка карт и объектов мира (`tools.build.map.*`)
| Инструмент | Основные аргументы | Алгоритм / Формула | Результат |
|---|---|---|---|
| `build.map.generate` | `{ seed, sizeKm, cellM, seaLevel?, mountains?, settlements?, roads? }` | `A-07..A-11` (полный конвейер карты) | Сводка мира (`bounds`, `seaRatio`, `maxH`, `nodes`, `edges`) |
| `build.map.editHeight` | `{ x, y, radius, deltaH, falloff: 'smooth'|'linear'|'flat'|'terrace' }` | Кисть дельта-слоя `H(X,Y)` (`F-05`) | `{ affectedChunks, minH, maxH }` |
| `build.map.addNode` | `{ kind: 'S'|'J'|'R'|'T'|'B'|'A'|'L'|'G', x, y, name?, props? }` | Привязка к `H(X,Y)` (`F-05`) + Spatial Hash (`A-04`) | `{ nodeId, x, y, H }` |
| `build.map.connectRoad` | `{ fromNodeId, toNodeId, roadClass: 'M'|'R'|'L'|'G'|'FERRY', maxSlope? }` | `A-11` (`A*` по рельефу + проверка моста/уклона `F-21`) | `{ edgeId, lengthM, bridges, waypoints }` |
| `build.map.placeEntity` | `{ mesh: MeshHandle, x, y, h?, yawDeg?, scale?, snapToTerrain?: true, allowWater?: false, tags? }` | Проверка `ToolGuard` (`RC-101`), `validated`, `H(X,Y)` (`F-05`, `F-06`) | `{ entityId, x, y, H, h }` |
| `build.map.placeFace` | `{ s, i, j, k, t, n }` | Упаковка `BigInt` (`F-07`) + проверка границ `RC-301` | `{ faceId: BigInt }` |

---

## 2. `tools.move.*` — Переставлять

| Инструмент | Основные аргументы | Проверки и поведение | Результат |
|---|---|---|---|
| `move.entity` | `{ entityId, x?, y?, h?, dx?, dy?, dh?, yawDeg?, scale?, snapToTerrain?, snapToGrid?, allowWater?, allowOverlap? }` | Проверяет `H(X,Y)`, запрет воды (`H < 0.5`), коллизии AABB и обновляет Spatial Hash (`A-04`). Пишет запись для `undo`. | `{ entityId, before, after }` |
| `move.swap` | `{ entityIdA, entityIdB, preserveTerrainSnap?: true }` | Меняет две сущности местами с сохранением опоры на рельеф. | `{ swapped: [idA, idB] }` |
| `move.node` | `{ nodeId, x, y, rerouteEdges?: true }` | Сдвигает узел графа и при `rerouteEdges` перепрокладывает примыкающие дороги/рёбра. | `{ nodeId, updatedEdges }` |
| `move.group` | `{ entityIds, dx, dy, dh?, rotateAround?: { x, y, yawDeg } }` | Передвигает и поворачивает группу сущностей как единый блок. | `{ movedCount, skipped[] }` |
| `move.align` | `{ entityIds, mode: 'grid'|'terrain'|'line'|'perimeter', stepM? }` | Выравнивает объекты по сетке, склону, прямой линии или периметру квартала. | `{ alignedIds }` |

---

## 3. `tools.remove.*` — Удалять и откатывать

| Инструмент | Основные аргументы | Проверки и поведение | Результат |
|---|---|---|---|
| `remove.entity` | `{ entityId }` | Удаляет сущность из мира и Spatial Hash, сохраняет снимок в стек `undo`. | `{ removedId }` |
| `remove.face` | `{ faceId, mode: 'break'|'delete' }` | `break`: переводит текстуру в `t = 4095` (облом, история сохраняется); `delete`: удаляет грань из чанка. | `{ faceId, mode }` |
| `remove.node` | `{ nodeId, cascadeEdges?: true }` | Удаляет узел графа и связанные рёбра (или отклоняет, если `cascadeEdges: false` и есть связи). | `{ removedNodeId, removedEdges }` |
| `remove.edge` | `{ edgeId }` | Удаляет дорогу/связь из графа. | `{ removedEdgeId }` |
| `remove.area` | `{ x, y, radius, kinds?, tags? }` | Безопасно очищает выбранные типы сущностей/граней внутри круга `(x, y, radius)`. | `{ removedEntities, removedFaces }` |
| `remove.undo` | `{ steps?: 1 }` | Транзакционный откат последних `N` мутирующих операций (`build` / `move` / `remove`). | `{ undoneOps }` |
| `remove.redo` | `{ steps?: 1 }` | Повтор отменённых операций. | `{ redoneOps }` |

---

## 4. `tools.watch.*` — Следить

| Инструмент | Основные аргументы | Поведение | Результат |
|---|---|---|---|
| `watch.subscribe` | `{ events: string[], zone?: { x, y, radius }, entityId?, agentId? }` | Подписка на события мира (`entity.moved`, `face.damaged`, `fps.drop`, `guard.violation`, `sound.emitted`). | `{ subscriptionId }` |
| `watch.unsubscribe` | `{ subscriptionId }` | Отменяет подписку. | `{ removed: true }` |
| `watch.poll` | `{ subscriptionId, maxEvents? }` | Забирает накопленные события (удобно для пошаговых ИИ-агентов без колбэков). | `{ events[] }` |
| `watch.trackEntity` | `{ entityId, maxFrames? }` | Включает запись траектории `(tick, x, y, h, state)` конкретной сущности. | `{ trackId }` |
| `watch.snapshot` | `{ label?, scope?: 'all'|'entities'|'graph'|'faces'|'metrics' }` | Снимает детерминированный снимок мира (`tick`, `hash`, сущности, метрики). | `{ snapshotId, tick, stateHash }` |
| `watch.diff` | `{ snapshotA, snapshotB }` | Считает точный diff (`added`, `removed`, `changed`, `deltaMetrics`) между двумя снимками (`A-32`). | `{ changes[], summary }` |
| `watch.metrics` | — | Возвращает живую телеметрию: `fps`, `simMs`, `renderMs`, `drawCalls`, `tris`, `activeChunks`, `memoryMB`. | `{ metrics }` |

---

## 5. `tools.look.*` — Смотреть (камера и растровые снимки)

| Инструмент | Основные аргументы | Поведение | Результат |
|---|---|---|---|
| `look.at` | `{ x, y, h?, zoom?, yawDeg?, pitchDeg?, mode?: '2d'|'3d-raster'|'3d-webgl' }` | Устанавливает камеру, проверяет `h >= H + 1.6` на суше (`RC-402`). | `{ cameraState }` |
| `look.follow` | `{ entityId, offset?: [dx, dy, dh] }` | Привязывает взгляд к движущейся сущности. | `{ following: entityId }` |
| `look.inspectModel` | `{ mesh: MeshHandle, views?: ['front','back','left','right','top','iso'], size?: 128 }` | Рендерит модельку через `software-3d` со всех выбранных сторон (работает и в Node.js!). | `{ views: Record<view, Capture> }` |
| `look.capture` | `{ width?: 256, height?: 144, mode?: '2d'|'3d-raster'|'3d-webgl', format?: 'raster'|'png'|'dataUrl'|'ascii' }` | Снимает текущий кадр. Режим `ascii` отдаёт компактную текстовую карту для текстовых ИИ. | `{ width, height, format, payload, stats }` |
| `look.overview` | `{ bounds?, size?: 256, layers?: ['terrain','water','roads','cities','entities'] }` | Строит 2D-растровый обзор заданного прямоугольника карты. | `{ raster, ascii?, legend }` |

---

## 6. `tools.see.*` — Видеть (семантическое зрение и детектор дефектов)

| Инструмент | Основные аргументы | Алгоритм | Результат |
|---|---|---|---|
| `see.frame` | `{ includeFaces?: false }` | `A-28` + `A-29` (Frustum Culling + подсчёт пикселей в Object-ID буфере) | `{ visibleEntities: [{ entityId, distM, screenBox, coveragePct, occludedPct }], visibleCount }` |
| `see.pickPixel` | `{ px, py }` | Прямое чтение Object-ID и Depth буфера `software-3d` (`A-28`) | `{ hit, entityId, faceId, side, texId, depth, worldPos: [x,y,h] }` |
| `see.raycast` | `{ origin: [x,y,h], dir: [dx,dy,dh], maxDistM }` | `A-05` (3D DDA-Raycast по сетке + пересечение с рельефом/AABB) | `{ hit, distM, point, normal, entityId?, faceId? }` |
| `see.lineOfSight` | `{ from: [x,y,h], to: [x,y,h] }` | Луч от `from` к `to` через `A-05` | `{ clear: boolean, blockedBy?, blockPoint? }` |
| `see.diagnose` | `{ checkBlank?: true, checkFloat?: true, checkClip?: true, checkNormals?: true, checkNaN?: true }` | `A-30` (визуальный авто-аудитор кадра и сцены) | `{ healthy: boolean, issues: [{ code, severity, entityId, details }] }` |

---

## 7. `tools.hear.*` — Слышать (пространственная акустика)

| Инструмент | Основные аргументы | Алгоритм / Формула | Результат |
|---|---|---|---|
| `hear.emit` | `{ sourceId?, x, y, h?, kind, db, freqHz?, radiusM?, durationMs? }` | Публикация в акустическую шину + (в браузере) синтез в WebAudio (`F-39`). | `{ soundId, tick }` |
| `hear.listen` | `{ x, y, h?, minDb?: 15, windowTicks?: 30, withOcclusion?: true }` | `A-31` + `F-39..F-41` (затухание `-6.02 дБ` на удвоение дистанции, азимут, преграды) | `{ heard: [{ soundId, sourceId, kind, dbAtListener, distM, azimuthDeg, occluded }] }` |
| `hear.listenFromCamera` | `{ minDb?, windowTicks? }` | То же самое в координатах текущей камеры. | `{ listenerPos, heard[] }` |
| `hear.log` | `{ sinceTick?, kind?, sourceId?, limit? }` | Журнал всех акустических событий мира (100% работает в headless Node.js). | `{ events[] }` |
| `hear.muteAudioOutput` | `{ muted: boolean }` | Отключает/включает вывод в динамики браузера, **не отключая** акустическую шину для ИИ. | `{ muted }` |

---

## 8. `tools.think.*` — Думать (память, планы, инварианты, песочница)

| Инструмент | Основные аргументы | Поведение | Результат |
|---|---|---|---|
| `think.note` | `{ topic, text, refs?: string[], confidence? }` | Записывает структурированную мысль в рабочую память сессии (можно прикладывать к handoff/отчётам). | `{ noteId, tick }` |
| `think.recall` | `{ topic?, agentId?, limit? }` | Поиск прошлых заметок/решений в рабочей памяти. | `{ notes[] }` |
| `think.plan` | `{ goal, steps: Array<{ id, desc, toolHint? }>, invariants?: string[] }` | Регистрирует план действий с привязанными шагами и проверяемыми условиями. | `{ planId, status: 'active' }` |
| `think.stepDone` | `{ planId, stepId, outcome, evidence? }` | Отмечает выполнение шага плана. | `{ planId, progressPct }` |
| `think.checkInvariants` | `{ rules?: ['heights','water','graph','meshes','fps'] }` | Прогоняет проверки целостности мира (например, `h >= H - 0.05`, нет зданий в воде, все меши подписаны). | `{ ok, violations[] }` |
| `think.sandboxRun` | `{ ops: Array<{ tool, args }>, stepTicks?: 0 }` | Клонирует мир (`A-32`), выполняет `ops` и `stepTicks` на клоне **без изменения реального мира**, возвращает diff и все ошибки. | `{ ok, results[], diff, invariantViolations[] }` |

---

## 9. `tools.guess.*` — Гадать (гипотезы, прогнозы и Монте-Карло)

| Инструмент | Основные аргументы | Алгоритм / Формула | Результат |
|---|---|---|---|
| `guess.hypothesize` | `{ claim, setupOps?: [], metric, target: { op: '>'|'<'|'>='|'<='|'between', value }, horizonTicks, trials?: 1, seedBase? }` | `A-33` + `F-42..F-44`: клон мира → `setupOps` → прогон вперёд `horizonTicks` × `trials` сидов → стат. оценка | `{ hypothesisId, verdict: 'confirmed'|'refuted'|'uncertain', confidence, baseline, predicted, mean, stddev, passRate, violations[] }` |
| `guess.compare` | `{ variants: Array<{ name, ops }>, metric, horizonTicks, trials? }` | Прогоняет несколько альтернативных вариантов решения на одинаковых сидах и ранжирует лучший. | `{ winner, ranking[] }` |
| `guess.history` | `{ verdict?, limit? }` | Журнал всех проверенных гипотез, чтобы другие нейросети не дублировали эксперименты. | `{ hypotheses[] }` |

---

## 10. `tools.comm.*` — Общаться с другими нейросетями через папки общения

Все операции работают строго внутри `ratcore/comms/` (в Node.js — реальные папки/файлы; в браузере — VFS `localStorage` + импорт/экспорт).

| Инструмент | Основные аргументы | Файлы в `ratcore/comms/` | Результат |
|---|---|---|---|
| `comm.register` | `{ agentId, role, capabilities?: string[] }` | Обновляет `registry.json`, создаёт `inbox/<agentId>/` и `outbox/<agentId>/`. | `{ agentId, registered: true }` |
| `comm.who` | `{ role? }` | Читает `registry.json`. | `{ agents[] }` |
| `comm.send` | `{ from, to?, channel?, type: 'request'|'reply'|'alert'|'review'|'info', priority?, subject, body, attachments?, threadId? }` | Пишет пару `.json` + `.md` в `outbox/<from>/` и в `inbox/<to>/` и/или `channels/<channel>/`. | `{ msgId, paths[] }` |
| `comm.readInbox` | `{ agentId, unreadOnly?: true, limit? }` | Читает `inbox/<agentId>/*.json`. | `{ messages[] }` |
| `comm.readChannel` | `{ channel, sinceId?, limit? }` | Читает `channels/<channel>/*.json`. | `{ messages[] }` |
| `comm.ack` | `{ agentId, msgId }` | Помечает сообщение `status: 'read'`. | `{ msgId, status: 'read' }` |
| `comm.archive` | `{ msgId }` | Переносит конверт в `archive/`. | `{ archivedPath }` |
| `comm.createTask` | `{ title, role, spec, constraints?, priority? }` | Создаёт `tasks/open/TASK-XXXX.json` + `.md`. | `{ taskId, path }` |
| `comm.listTasks` | `{ status?: 'open'|'claimed'|'done', role? }` | Читает соответствующую папку `tasks/<status>/`. | `{ tasks[] }` |
| `comm.claimTask` | `{ taskId, agentId }` | Атомарно переносит из `open/` в `claimed/` с полем `ownerAgent`; если уже занята → `RC-501`. | `{ taskId, ownerAgent }` |
| `comm.completeTask` | `{ taskId, agentId, result, artifacts? }` | Переносит из `claimed/` в `done/` с результатами и ссылками на рецепты/отчёты. | `{ taskId, status: 'done' }` |
| `comm.handoff` | `{ from, summary, completed[], nextSteps[], seed?, tick?, openBugs[] }` | Создаёт `handoffs/HO-YYYYMMDD-XXXX.json` + `.md` для следующей нейросети. | `{ handoffId, path }` |

---

## 11. `tools.bugs.*` и `tools.report.*` — Баги и отчёты для других нейросетей

Все файлы пишутся парами `.json` + `.md` внутри `ratcore/reports/`.

| Инструмент | Основные аргументы | Файлы в `ratcore/reports/` | Результат |
|---|---|---|---|
| `bugs.create` | `{ code, severity: 'critical'|'major'|'minor', title, author, assignee?, context: { seed, tick, coords?, entityId?, faceId? }, reproOps[], evidence?: { see?, hear?, watch? }, notes? }` | Создаёт `bugs/BUG-XXXX.json` + `BUG-XXXX.md`, обновляет `index.json`. | `{ bugId, jsonPath, mdPath }` |
| `bugs.list` | `{ status?, severity?, code?, assignee? }` | Читает `index.json` / `bugs/`. | `{ bugs[] }` |
| `bugs.update` | `{ bugId, status?, assignee?, comment?, fixOps? }` | Обновляет баг-тикет и перегенерирует `.md`. | `{ bugId, status }` |
| `bugs.verify` | `{ bugId, verifierAgent, passed: boolean, proof }` | Прогоняет `reproOps` заново и переводит тикет в `verified` или возвращает в `open`. | `{ bugId, status }` |
| `report.audit` | `{ kind: 'toolguard'|'vision'|'audio'|'perf'|'static', summary, metrics?, findings[] }` | Создаёт `audits/AUD-XXXX.json` + `.md`, обновляет `index.json`. | `{ auditId, path }` |
| `report.summary` | `{ title, agents[], completed[], openBugs[], metrics, recommendations[] }` | Создаёт `summaries/SUM-XXXX.json` + `.md`. | `{ summaryId, path }` |

---

## 12. `tools.bridge.*` — Соединение с другими движками, мирами и нейросетями

Подробная архитектура — в [`ratcore/BRIDGE.md`](./BRIDGE.md).

| Инструмент | Основные аргументы | Назначение | Результат |
|---|---|---|---|
| `bridge.connect` | `{ peerId, target: 'ratcore'|'threejs'|'godot4'|'canvas2d'|'pereplet'|'external-ai', transport: 'inproc'|'worker'|'broadcast'|'file'|'ws', config? }` | Открывает рукопожатие (`A-34`), согласует версию протокола, систему координат и права (`BridgeGuard`). | `{ linkId, peerId, capabilities, coordMap }` |
| `bridge.disconnect` | `{ linkId }` | Корректно закрывает соединение и освобождает каналы/порты. | `{ disconnected: true }` |
| `bridge.list` | — | Список всех активных соединений и их статуса (пинг, переданные пакеты, ошибки). | `{ links[] }` |
| `bridge.exportMesh` | `{ mesh: MeshHandle, format: 'threejs'|'godot4'|'obj'|'rat-recipe' }` | Безопасный read-only экспорт геометрии из `AssetVault` в формат целевого движка (с конвертацией осей `F-04`/`F-45`). | `{ format, payload, provenance }` |
| `bridge.exportMap` | `{ bounds?, format: 'heightmap-f32'|'raster-rgba'|'godot4-json'|'canvas2d-imagedata', layers? }` | Экспорт слоёв карты, высот `H(X,Y)`, графа дорог и городов во внешний движок. | `{ format, payload, meta }` |
| `bridge.importRecipe` | `{ linkId, recipeJson, agentId }` | Принимает модель из другого движка **строго в виде рецепта `ops`** и пересобирает её через `ToolGuard` (сырые вершины отклоняются `RC-101`!). | `{ mesh: MeshHandle }` |
| `bridge.syncTick` | `{ linkId, mode: 'push-delta'|'pull-delta'|'lockstep' }` | Синхронизирует изменения сущностей/граней/часов с другим инстансом `RatCore` или движком (`A-35`). | `{ syncedTick, sentOps, recvOps }` |
| `bridge.rpcCall` | `{ linkId, tool, args }` | Удалённый вызов инструмента на подключённом `RatCore`/агенте по единому RPC-конверту (`A-36`). | Стандартный ответ инструмента |
| `bridge.serveRpc` | `{ linkId, allowGroups?: string[] }` | Разрешает подключённому движку или внешней нейросети вызывать разрешённые ветки `RatCore.tools.*`. | `{ serving: true, allowGroups }` |
| `bridge.attachPereplet` | `{ scheduler, rules }` | Подключает адаптер ядра `pereplet-prototype/` для выполнения его правил на фиксированном шаге `RatCore`. | `{ attached: true, ruleCount }` |
| `bridge.sendCompressed` | `{ linkId, streamId, payload, priority?: 2, progressive?: true, fec?: false }` | Потоковая бинарная пересылка в `ratcore-wire/2` (`RCW2`): автовыбор кодека (`F-125`), `Zero-Decompress Pass-Through`, `Backpressure` (`F-123`) и `LOD 3 → LOD 0`. | `{ framesSent, wireBytes, ratio, codec }` |
| `bridge.syncDiff` | `{ linkId, fileId, data }` | Контент-дедупликация `FastCDC` (`F-121`, `A-81`): пересылает только отсутствующие у получателя куски (`-99.9 %` трафика!). | `{ sentChunks, skippedChunks, dedupSavingPct }` |

---

## 13. `tools.anim.*` — Анимация, скелеты, IK, куклы Verlet и спрайт-листы

| Инструмент | Основные аргументы | Формулы / Алгоритмы | Результат |
|---|---|---|---|
| `anim.createRig` | `{ rigId, bones: Array<{ id, parent?, pos, len, limits? }> }` | Иерархия костей (`F-03`, `A-37`) | `RigHandle` |
| `anim.createClip` | `{ clipId, duration, loop?, tracks: Array<{ bone, keys: [{ t, pos?, rot?, scale?, ease? }] }> }` | `F-49` (lerp/slerp), `F-50` (сплайн Эрмита/Catmull-Rom) | `ClipHandle` |
| `anim.procedural` | `{ kind: 'walk'|'run'|'idle'|'recoil'|'sway'|'breathe'|'wave', params }` | Синусоидально-фазовая генерация клипа без ручных кадров | `ClipHandle` |
| `anim.blendLayers` | `{ entityId, layers: Array<{ clipId, weight, maskBones?, timeScale?, mode: 'override'|'add' }> }` | `A-37` (послойное смешивание поз: ноги бегут, руки целятся) | `{ poseApplied: true }` |
| `anim.solveIK` | `{ entityId, chain: [boneA, boneB, endBone], target: [x,y,h], pole?: [x,y,h] }` | `F-51` + `A-38` (2-Bone IK по закону косинусов: стопы на земле, руки на оружии) | `{ solved, angleA, angleB, errorM }` |
| `anim.spring` | `{ value, target, vel, stiffness, damping, dt }` | `F-52` (демпфированная пружина для отдачи, камеры, подвески, волос) | `{ value, vel }` |
| `anim.createVerlet` | `{ points: [{ pos, mass, pinned? }], sticks: [{ a, b, len?, stiffness? }], substeps? }` | `F-53`, `F-54`, `A-39` (кукла регдола, ткань, провода, тросы) | `VerletHandle` |
| `anim.impulseVerlet` | `{ handle, pointIndex, impulse: [ix, iy, ih] }` | Применение импульса от пули/удара к точке куклы с адаптивным сном | `{ awake: true }` |
| `anim.bakeSpriteSheet` | `{ mesh, rig?, clipId?, views, frames, tileSize, palette? }` | Запекание 3D-анимации в растровый 2D спрайт-лист через `software-3d` | `AtlasHandle` + таблица кадров |

---

## 14. `tools.phys.*` — Физика, столкновения, жидкости SWE, транспорт и баллистика

| Инструмент | Основные аргументы | Формулы / Алгоритмы | Результат |
|---|---|---|---|
| `phys.addBody` | `{ entityId, shape: 'aabb'|'sphere'|'capsule'|'obb', mass, friction?, restitution?, static? }` | `F-55`, `A-40` (полунеявный Эйлер + Broadphase в Spatial Hash) | `{ bodyId }` |
| `phys.applyForce` | `{ bodyId, force?: [fx,fy,fh], impulse?: [ix,iy,ih], point? }` | Импульс/сила на тело (`F-55`) | `{ vel }` |
| `phys.step` | `{ dt, substeps?: 2 }` | `A-40` (Broadphase → Narrowphase → импульсный отклик `F-56` → трение `F-57` → сон) | `{ collisions[], activeBodies }` |
| `phys.overlap` | `{ shape, pos, size, mask? }` | Мгновенный запрос пересечений без изменения состояния | `{ hits[] }` |
| `phys.ballistics` | `{ origin, dir, speedMps, massKg, dragCd?, areaM2?, wind?, maxTimeS? }` | `F-58`, `A-41` (траектория пули/снаряда с гравитацией, сопротивлением, рикошетом и пробитием) | `{ trajectory[], hit?, energyJ }` |
| `phys.vehicleCreate` | `{ entityId, massKg, wheelbaseM, gears[], maxTorqueNm, gripMu, trailer? }` | `F-59`, `A-42` (подвеска, КПП, сцепление шин, крен, сцепка полуприцепа) | `VehicleHandle` |
| `phys.vehicleInput` | `{ handle, throttle, brake, steer, handbrake?, retarder?, gear? }` | Обновление состояния машины/тягача | `{ speedKmh, rpm, gear, slip }` |
| `phys.fluidInit` | `{ bounds, cellM, heightfield, sources?, sinks?, manningN? }` | `F-60`, `A-43` (гидродинамика мелкой воды Well-Balanced SWE для рек, плотин и каналов) | `FluidGridHandle` |
| `phys.fluidStep` | `{ handle, dt, wind?, rainMmH? }` | `A-43` (шаг SWE с контролем числа Куранта CFL `F-61`) | `{ maxDepthM, totalFlowM3s, cfl }` |
| `phys.windAt` | `{ x, y, h, tick }` | `F-62` (поле ветра с учётом рельефа, бриза и порывов) | `{ vx, vy, speedMps, pressureHpa }` |
| `phys.stressCheck` | `{ faceIds, loadN, waterW, frostF }` | Связка нагрузки и погоды с формулой износа граней `F-08` | `{ cracked[], broken[] }` |

---

## 15. `tools.nav.*` — Навигация, поиск пути, толпы и трафик

| Инструмент | Основные аргументы | Формулы / Алгоритмы | Результат |
|---|---|---|---|
| `nav.buildGrid` | `{ bounds, cellM, maxSlope?, avoidWater?: true, obstacleTags? }` | Генерация проходимой сетки стоимости из `H(X,Y)` и препятствий | `NavGridHandle` |
| `nav.findPath` | `{ grid, from: [x,y], to: [x,y], algo?: 'astar'|'jps', smooth?: true }` | `F-63`, `A-44` (`A*` / Jump Point Search + сглаживание строки видимости) | `{ found, path[], cost, lengthM }` |
| `nav.buildFlowField` | `{ grid, goals: [[x,y],...], maxCost? }` | `F-64`, `A-45` (единое векторное поле на сотни/тысячи юнитов или орд зомби!) | `FlowFieldHandle` |
| `nav.sampleFlow` | `{ flowField, x, y }` | Быстрое `O(1)` чтение направления движения для агента | `{ dx, dy, distToGoal }` |
| `nav.crowdStep` | `{ agents[], dt, neighborRadiusM?, mode: 'social-forces'|'orca'|'boids' }` | `F-65`, `A-46` (локальное обхождение столкновений в толпе пешеходов/отрядов) | `{ velocities[] }` |
| `nav.trafficStep` | `{ vehicles[], roads, signals[], dt }` | `F-66`, `F-67`, `A-47` (модель водителя **IDM**, перестроения, тормозной путь, светофоры) | `{ updatedCount, jams[] }` |
| `nav.dispatch` | `{ network: 'rail'|'sea'|'air'|'road', unitId, fromNode, toNode, fuelRangeKm? }` | Диспетчер маршрутов `A → N₁…Nₖ → B` с учётом занятости перегонов и дозаправки | `{ route, stops[], etaTicks }` |

---

## 16. `tools.env.*` — Время суток, погода, климат, приливы и освещение

| Инструмент | Основные аргументы | Формулы / Алгоритмы | Результат |
|---|---|---|---|
| `env.setTime` | `{ dayOfYear, hour, latDeg?: 48, timeScale? }` | `F-68` (высота и азимут солнца, сумерки, ночь, сезон) | `{ sunElevDeg, sunAzDeg, phase, season }` |
| `env.setWeather` | `{ rain: 0..1, snow: 0..1, fogDensity: 0..1, storm?: false, tempC? }` | `F-70`, `F-71` (туман Beer-Lambert, охлаждение, накопление/таяние снега и льда) | `{ weatherState, visibilityM }` |
| `env.tideAt` | `{ tick, latDeg? }` | `F-69` (гармонический прилив/отлив `M2 + S2` для берегов, отмелей и доков) | `{ seaLevelOffsetM, rising: boolean }` |
| `env.addLight` | `{ x, y, h, color, intensity, radiusM, kind: 'point'|'spot'|'sun', flicker? }` | `F-72` (динамический источник света: фонарь, окно, костёр, фары) | `{ lightId }` |
| `env.computeFOV` | `{ grid, origin: [ix, iy], radiusCells }` | `F-73`, `A-48` (8-октантный Shadowcasting для тумана войны и видимости в 2D/тайлах) | `{ visibleBitset, exploredPct }` |
| `env.bakeLightmap` | `{ bounds, cellM, lights[], ambient }` | Расчёт цветной растровой карты освещения для 2D и 3D | `RasterSurface` |

---

## 17. `tools.fx.*` — Частицы, декали, камера и постобработка

| Инструмент | Основные аргументы | Формулы / Алгоритмы | Результат |
|---|---|---|---|
| `fx.createEmitter` | `{ preset?: 'fire'|'smoke'|'sparks'|'rain'|'splash'|'dust'|'shells', x, y, h, rate, maxParticles, lifetime, colorCurve, sizeCurve }` | `F-75`, `A-49` (пул частиц в `TypedArray`, 0 аллокаций в кадре) | `{ emitterId }` |
| `fx.burst` | `{ preset, x, y, h, count, spreadDeg?, speed? }` | Разовый выброс частиц (взрыв, попадание, рубка, всплеск) | `{ spawned }` |
| `fx.addDecal` | `{ kind: 'crater'|'tire'|'crack'|'scorch'|'blood'|'footprint', x, y, h?, radiusM, yawDeg?, ttlTicks? }` | Кольцевой буфер декалей на рельефе и гранях | `{ decalId }` |
| `fx.cameraShake` | `{ trauma: 0..1, decayPerSec?, maxOffsetM?, maxRollDeg? }` | `F-74` (квадратичная тряска `trauma²` на плавном шуме) | `{ offset, rollDeg }` |
| `fx.setPostProcess` | `{ bloom?: { threshold, strength }, toneMap?: 'aces'|'reinhard'|'none', vignette?, grain?, pixelate?, palette?, nightVision? }` | `F-76`, `F-77`, `A-50` (растровая и WebGL2-постобработка) | `{ activePasses[] }` |

---

## 18. `tools.ai.*` — Игровой ИИ (NPC, отряды, враги, локальный NLU)

| Инструмент | Основные аргументы | Формулы / Алгоритмы | Результат |
|---|---|---|---|
| `ai.createFSM` | `{ entityId, initialState, states, transitions }` | `A-51` (детерминированный конечный автомат — например, 10 состояний зомби) | `AgentAIHandle` |
| `ai.createBT` | `{ entityId, rootNode }` | `A-52` (дерево поведения: `Sequence`, `Selector`, `Parallel`, `Decorator`, `Leaf`) | `AgentAIHandle` |
| `ai.utilityPick` | `{ context, actions: Array<{ id, curves: [{ input, kind, params }], weight }> }` | `F-78`, `A-53` (Utility AI — выбор оптимального действия по кривым полезности) | `{ chosenAction, scores[] }` |
| `ai.goapPlan` | `{ startState, goalState, actions[] }` | `A-54` (GOAP — обратный `A*` по пространству состояний мира) | `{ feasible, plan[] }` |
| `ai.memoryUpdate` | `{ agentId, percepts: { seen[], heard[] }, dt }` | `F-79` (экспоненциальное угасание уверенности о последней позиции цели) | `{ knownTargets[] }` |
| `ai.evalCover` | `{ agentPos, threatPos, candidates[], world }` | `F-80` (оценка укрытий: укрытость по `see.raycast`, дистанция, фланговый угол, путь отхода) | `{ bestCover, scored[] }` |
| `ai.cognitiveStep` | `{ agentId, complexity, dt }` | `F-81` (механика «больно думать»: усталость от тиков мышления → задержка реакции и разброс) | `{ fatigue, reactionDelayMs, accuracyMult }` |
| `ai.nluTrain` | `{ intents: Array<{ id, phrases[] }> }` | `F-82`, `A-55` (локальный офлайн-классификатор намерений по токенам/n-граммам и TF-IDF) | `NluModelHandle` |
| `ai.nluParse` | `{ model, text }` | Распознавание русской/английской команды игрока локально без сети | `{ intent, confidence, slots }` |
| `ai.issueOrder` | `{ commandBus, fromId, toId, order, radioDelayTicks? }` | Единый симметричный Command API (игрок и ИИ отдают приказы одним кодом, с отказами и журналом) | `{ orderId, status, reason? }` |

---

## 19. `tools.sim.*` — Экономика, ресурсы, крафт, инвентарь, выживание и демография

| Инструмент | Основные аргументы | Формулы / Алгоритмы | Результат |
|---|---|---|---|
| `sim.defineResource` | `{ id, name, unit, basePrice, decayRate?, stackSize? }` | Регистрация ресурса (еда, вода, энергия, топливо, металл, деньги…) | `{ resourceId }` |
| `sim.ledgerStep` | `{ accounts[], flows[], taxRate?, inflationRate?, dt }` | `F-83`, `F-84`, `A-56` (приход/расход, рыночная цена от дефицита, налоги, кредиты, баланс) | `{ balances, prices, deficits[] }` |
| `sim.defineRecipe` | `{ id, inputs: Record<res, qty>, outputs: Record<res, qty>, timeTicks, station? }` | Регистрация рецепта крафта/производства | `{ recipeId }` |
| `sim.craft` | `{ inventoryId, recipeId, station? }` | Атомарное списание сырья и выдача результата с проверкой остатков | `{ crafted, inventory }` |
| `sim.inventoryOp` | `{ inventoryId, op: 'add'|'remove'|'move'|'equip'|'split', item, slot? }` | Управление слотами, весом, объёмом и прочностью предметов | `{ ok, weightKg, slotsUsed }` |
| `sim.bodyStep` | `{ actorId, ambientTempC, insulation, activity, wounds[], dt }` | `F-85`, `F-86`, `A-57` (6 частей тела, 5000 мл крови, голод/жажда, терморегуляция, бинты/шины) | `{ vitals, alerts[], alive }` |
| `sim.demographyStep` | `{ population, countryParams, year, dtYears }` | `F-87`, `A-58` (кривая смертности Гомперца–Мейкема, рождаемость, миграция, рост/угасание городов) | `{ births, deaths, population, lifeExp }` |

---

## 20. `tools.ui.*` — HUD, диалоги, квесты, локализация и адаптив

| Инструмент | Основные аргументы | Формулы / Алгоритмы | Результат |
|---|---|---|---|
| `ui.mountHud` | `{ theme?: 'ratcore-dark'|'shared', layout: 'auto'|'desktop'|'mobile', slots }` | Сборка стандартного HUD (`topbar`, `panel`, `bottom-bar`, `toasts`, `modal`, `pause`) | `{ hudId }` |
| `ui.setStats` | `{ stats: Record<id, { label, value, trend?, tone? }> }` | Обновление показателей без пересоздания DOM (`F-89`) | `{ updated }` |
| `ui.toast` | `{ text, tone?: 'info'|'good'|'bad'|'win', durationMs? }` | Очередь всплывающих уведомлений | `{ toastId }` |
| `ui.projectToScreen` | `{ worldPos: [x, y, h], camera, viewport }` | `F-88` (проекция 3D-плашки над городом/юнитом/точкой на экран с отсечением за камерой) | `{ visible, sx, sy, behind }` |
| `ui.minimap` | `{ world, camera, sizePx, markers[] }` | Построение растровой мини-карты и перевод клика обратно в `(X, Y)` (`F-88`) | `{ raster, toWorld(mx, my) }` |
| `ui.dialogueStart` | `{ graphId, nodeId?, vars }` | `A-59` (графовый движок диалогов и событий с проверкой условий и ветвлениями) | `{ text, choices[], speaker }` |
| `ui.dialogueChoose` | `{ sessionId, choiceIndex }` | Переход по выбранной реплике и применение эффектов | `{ nextNode, effects[] }` |
| `ui.i18n` | `{ locale: 'ru'|'en', key, vars?, count? }` | Локализация, русская плюрализация (`1 дом / 2 дома / 5 домов`) и форматирование валют/единиц | `{ text }` |
| `ui.setAccessibility` | `{ reducedMotion?, highContrast?, fontScale?, colorblind?: 'none'|'deutan'|'protan'|'tritan' }` | Применение параметров доступности к HUD и рендеру | `{ settings }` |

---

## 21. `tools.input.*` — Ввод (мышь, тач, клавиатура, геймпад, реплеи)

| Инструмент | Основные аргументы | Формулы / Алгоритмы | Результат |
|---|---|---|---|
| `input.bind` | `{ action, keys?: string[], mouse?: string[], gamepad?: string[] }` | Регистрация логического действия, независимого от устройства | `{ action }` |
| `input.poll` | `{ tick }` | Считывание нормализованного состояния всех действий + `F-90` (мёртвая зона стика) | `{ actions, axes, pointers[] }` |
| `input.zoomToCursor` | `{ camera, cursorPx: [px, py], factor }` | `F-91` (точный зум к курсору/центру щипка без смещения точки под пальцем) | `{ nextCamera }` |
| `input.bufferAction` | `{ action, windowTicks?: 6 }` | Input Buffering & Coyote Time — делает управление отзывчивым в экшене/платформере | `{ consumed: boolean }` |
| `input.recordStart` / `Stop` | `{ seed, meta? }` | Запись детерминированного потока ввода по тикам (`A-60`) | `ReplayStream` |
| `input.replayFeed` | `{ stream, tick }` | Подача записанного ввода в симуляцию для 100 % воспроизведения багов и тестов | `{ appliedActions[] }` |

---

## 22. `tools.audio.*` — Процедурный синтез звука, музыка и микшер

| Инструмент | Основные аргументы | Формулы / Алгоритмы | Результат |
|---|---|---|---|
| `audio.defineSynth` | `{ soundId, osc: 'sine'|'square'|'saw'|'tri'|'noise', freqHz, adsr, filter?, fm? }` | `F-92`, `A-61` (рецепт процедурного звука — работает без `.mp3`/`.wav`) | `{ soundId }` |
| `audio.play` | `{ soundId, bus?: 'sfx'|'ambient'|'music'|'ui', volume?, pitch?, worldPos? }` | Пул голосов с приоритетом, панорамирование `F-94` + публикация в шину `tools.hear`! | `{ voiceId }` |
| `audio.musicPattern` | `{ bpm, scale, rootMidi, bars, intensity: 0..1, seed }` | `F-93` (MIDI → Гц), генерация адаптивного процедурного мотива под ситуацию | `{ playing: true }` |
| `audio.setBus` | `{ bus, gain, muted?, lowpassHz? }` | Управление шинами микшера и мягким лимитером `F-95` (`tanh`) | `{ busState }` |

---

## 23. `tools.save.*` — Сохранения, слоты, сжатие, миграции и реплеи

| Инструмент | Основные аргументы | Формулы / Алгоритмы | Результат |
|---|---|---|---|
| `save.writeSlot` | `{ slotId, mode?: 'delta'|'full', compress?: true }` | `F-96`, `F-97`, `A-62` (сохранение сида + дельт + RLE-сжатие чанков + контрольная сумма) | `{ slotId, bytes, checksum, version }` |
| `save.readSlot` | `{ slotId, migrate?: true }` | Проверка контрольной суммы `F-97`, авто-миграция версий `A-63`, восстановление мира | `{ loaded: true, tick, migratedFrom? }` |
| `save.listSlots` | — | Список слотов с датой, тиком, превью и размером | `{ slots[] }` |
| `save.exportBundle` | `{ slotId, includeReplay?: false }` | Экспорт сохранения в переносимый JSON/бинарный пакет | `{ bundle }` |
| `save.importBundle` | `{ bundle }` | Безопасный импорт с проверкой схемы, контрольной суммы и `ToolGuard` на рецепты | `{ slotId, valid: true }` |

---

## 24. `tools.test.*` — Автотесты, боты, фаззинг, бенчмарки и самопроверка

| Инструмент | Основные аргументы | Формулы / Алгоритмы | Результат |
|---|---|---|---|
| `test.runHeadless` | `{ seed, ticks, scriptOps?, checkInvariantsEvery?: 30 }` | Прогон игрового цикла в Node.js без браузера + проверка всех инвариантов | `{ passed, finalHash, violations[] }` |
| `test.botPlay` | `{ ticks, strategies: ['random','click-all','stress-camera','edge-coords'], seed }` | `A-64` (встроенный бот-тестировщик в духе `bughunt`: тыкает все кнопки, ищет падения и `NaN`) | `{ passed, actionsRun, bugsFiled[] }` |
| `test.fuzzTool` | `{ tool, iterations, seed }` | Генерация пограничных/битых аргументов (`NaN`, `Infinity`, `[]`, отрицательные радиусы) — движок не должен падать необработанным исключением | `{ passed, crashes[] }` |
| `test.batchSeeds` | `{ seedsCount, ticksPerSeed, metricSpec }` | Пакетный прогон `K` миров/жизней (как «Тысяча жизней») для проверки баланса и демографии | `{ summary, mean, stddev, outliers[] }` |
| `test.benchmark` | `{ frames, sceneSpec }` | `F-98`, `F-99`, `F-100` (замер `P50/P95/P99` мс/кадр, `1% low FPS`, проверка утечки памяти) | `{ p50Ms, p95Ms, p99Ms, onePctLowFps, leakSlopeKbPerFrame }` |
| `test.auditCode` | `{ targetDir }` | Запуск статического аудитора `A-03` на обход `ToolGuard` (`RC-107`) | `{ clean, violations[], bugsFiled[] }` |

---

## 25. `tools.stream.*` — Сжатие невидимой информации, куллинг и стриминг мира ([`COMPRESSION.md`](./COMPRESSION.md))

| Инструмент | Основные аргументы | Формулы / Алгоритмы | Результат |
|---|---|---|---|
| `stream.packSubchunk` | `{ voxels, size?: 16 }` | `F-102`, `A-66` (свёртка однородного подчанка в 4 байта или палитровое бит-упаковывание) | `{ mode, bitsPerEntry, bytes, ratio }` |
| `stream.buildShell` | `{ subchunk, neighbors, greedy?: true }` | `F-103`, `A-67` + `A-19` (удаление замурованных граней + Greedy Meshing) | `MeshHandle` + `{ cullRatio }` |
| `stream.buildSVDAG` | `{ bounds, voxels, depth? }` | `F-104`, `A-68` (разреженное октодерево с дедупликацией поддеревьев по `FNV-1a`) | `SvdagHandle` + `{ uniqueNodes, ratio }` |
| `stream.buildCaveMask` | `{ subchunk }` | `F-105`, `A-69` (15-битная маска просветов между 6 гранями подчанка — Minecraft Cave Culling) | `{ visibilityMask15 }` |
| `stream.cullVisible` | `{ camera, chunks, hiZPyramid? }` | `A-29` + `A-69` + `F-106`/`A-70` (Frustum + Cave BFS + Hi-Z Occlusion) | `{ visibleChunks[], culledPct }` |
| `stream.buildLOD` | `{ chunk, levels?: [1,2,3], errorPx?: 1.5 }` | `F-107`, `A-71` (свёртка `2×2×2`/`4×4×4` + импосторы горизонта) | `{ lodHandles[], trianglesSavedPct }` |
| `stream.sleepRegion` | `{ regionId, tick }` | `F-108`, `A-72` (выгрузка невидимых NPC/трафика в 64-байтную сводку) | `{ sleptEntities, savedBytes }` |
| `stream.catchupRegion` | `{ regionId, currentTick }` | `F-108`, `A-72` (мгновенный аналитический догон за `O(1)` при возврате камеры) | `{ deltaTicks, restoredEntities }` |
| `stream.packRegion` | `{ chunks[], compress?: 'deflate' }` | `F-109`, `F-110`, `A-73` (Morton Z-order + RLE + ZigZag Varint + Deflate + Region `32×32`) | `{ bytes, ratio }` |
| `stream.encodeQuat32` | `{ q: [x,y,z,w] }` | `F-111` (сжатие кватерниона `Smallest-Three`: 16 байт → 4 байта для сети/мостов) | `{ u32 }` |
| `stream.memoryTick` | `{ budgetMb, camera, tick }` | `F-112`, `A-74` (3-ярусный кэш `HOT / WARM / COLD` с плавным вытеснением до 2 мс/тик) | `{ hotCount, warmCount, coldCount, ramMb }` |
| `stream.packVertex64` | `{ vertices, chunkOrigin }` | `F-113`, `A-77` (упаковка вершин `36 байт → 8 байт` `2×Uint32` + `Upload-and-Drop` пул) | `{ buffer, bytesPerVertex: 8, savedPct }` |
| `stream.buildBrick64` | `{ voxels4x4x4 }` | `F-114`, `A-78` (64 блока в 1 `BigUint64` = 8 байт + побитовый поиск открытых граней) | `{ brick64, exposedCount }` |
| `stream.setCpuGovernor` | `{ targetUtil?: 0.75, maxCeiling?: 0.80, sliceMs?: 1.5, enableThermalGuard?: true }` | `F-116..F-118`, `F-120`, `A-75`, `A-76` (пул воркеров на 75 % ядер + ПИ-регулятор скважности + защита `P0/P1`) | `{ workers, targetUtil, workBudgetMs }` |
| `stream.scheduleJobs` | `{ jobs: [{ priority: 0|1|2|3, kind, payload }] }` | `A-75`, `A-79` (Work-Stealing очередь `P0..P3` + многочастотное разнесение `F-115`) | `{ queued, stolenCount }` |
| `stream.setMemoryBudget` | `{ ramCapMb, soaCapacity, dropCpuAfterUpload?: true, idleSkip?: true }` | `A-77`, `A-80` (безаллокационная арена SoA `12–16 байт/сущность` + `Dirty-Bitset` + `Idle-Skip`) | `{ ramCapMb, arenaBytes, gcAllocsPerFrame: 0 }` |
| `stream.perfReport` | — | `F-119`, `F-120` (реальный трафик `RAM→CPU МБ/с`, загрузка ядер %, `headroomPct`, троттлинг) | `{ cpuUtilPct, headroomPct, ramMb, ramBwMBs, thermalRatio }` |
| `stream.transferPack` | `{ payload, codec?: 'auto'|'raw'|'lz4'|'deflate-dict', dictId?, progressive?, fecN? }` | `F-122`, `F-124`, `F-125` (упаковка в бинарные фреймы `RCW2` 24-Б заголовок + `CRC32` + опциональный `XOR-FEC`) | `{ frames[], rawBytes, wireBytes, ratio, codec }` |
| `stream.transferDiff` | `{ localBuffer, remoteHashes[] }` | `F-121`, `A-81` (`FastCDC` Gear-нарезка `4–64 КБ` + расчёт только недостающих кусков) | `{ missingFrames[], dedupSavingPct }` |
| `stream.transferSend` | `{ linkId, frames[], priority?: 2, maxWindowKb?: 256 }` | `F-123`, `A-82` (потоковая отправка с окном `AIMD` `<= 256 КБ` RAM и обгоном `P0` поверх `P3`) | `{ ackedFrames, avgMbps, ramPeakKb }` |
| `stream.transferRecv` | `{ frameBytes, resumeBitmap? }` | `A-83` (приём фрейма `RCW2`, проверка `CRC32`, восстановление потерь через `XOR-FEC`, возобновление после обрыва) | `{ complete, progressPct, recoveredFec, missingSeqs[] }` |
| `stream.selectCodec` | `{ channelMbps, rawBytes, cpuHeadroomPct }` | `F-125`, `A-84` (минимизация `T_total` при соблюдении лимита **75 % CPU**) | `{ codec, expectedMs, expectedRatio }` |
| `stream.trainDict` | `{ samples[], dictSizeKb?: 32 }` | `F-122` (обучение общего словаря для `3×–6×` сжатия коротких рецептов, сообщений ИИ и дельт) | `{ dictId, sizeBytes, avgGain }` |

---

# Матрица усиления всех 25 веток инструментов (v2.0)

Каждая из 25 веток получила целевые улучшения производительности, надёжности и удобства для ИИ:

| № | Ветка | Ключевые улучшения v2.0 |
|---|---|---|
| **1** | `build.*` | Параметрические смарт-ассеты (`build.parametric`), CSG через рецепты (`union`/`subtract`/`intersect`), авто-генерация `LOD 0..3` + коллайдера + `PackedVertex64`, PBR-набор (`albedo + normal + roughness + ao`). |
| **2** | `move.*` | Умная привязка (`snap: 'ground'|'grid'|'socket'|'road'`), движение по сплайну `F-50`, пакетная расстановка с авто-раздвижкой пересечений. |
| **3** | `remove.*` | Автоматическое ленивое вскрытие недр (`A-67`), выборочный откат своей ветки истории (не ломая правки других ИИ), автосборка висячих осколков после поломки опоры. |
| **4** | `watch.*` | Реактивные триггеры `watch.when(cond, action)` (без опроса каждый тик), бинарный дифф снимков `RCW2`, кольцевой «чёрный ящик» последних 300 тиков. |
| **5** | `look.*` | Автокадрирование объекта `look.frameBounds`, попиксельное сравнение «до/после» (`look.diffFrames`), тепловые карты плотности треугольников/LOD/перекрытий. |
| **6** | `see.*` | Семантическая сегментация по тегам (`see.segment`), детектор Z-fighting и проваливания объектов (`diagnose` v2), пакетный `raycastBatch` по `64-bit Bricks` (в 30× быстрее!). |
| **7** | `hear.*` | Акустика/эхо закрытых помещений (`hear.roomAcoustic`), агрегация массовых однотипных звуков (без спама ИИ), растровая визуализация звуковых волн. |
| **8** | `think.*` | Граф зависимостей гипотез (`DAG`), предварительный чек бюджета RAM/75% CPU до запуска плана, авто-свёртка старых заметок в дайджест для экономии контекста ИИ. |
| **9** | `guess.*` | Байесовское обновление вероятностей (`F-126`), анализ чувствительности параметров, ранний стоп заведомо слабых веток (*Successive Halving* — в 5× быстрее). |
| **10** | `comm.*` | Бинарные сжатые вложения `RCW2` + `FastCDC`, бесконфликтное CRDT-слияние задач при работе нескольких ИИ, срочные пинги (`urgent`), авто-дайджест непрочитанного. |
| **11** | `bugs.*` / `report.*` | Авто-дедупликация одинаковых багов по сигнатуре, автоприкрепление «чёрного ящика» + сжатого `ReplayStream`, автопроверка исправления `bugs.reproCheck`. |
| **12** | `bridge.*` | Бинарный поток `ratcore-wire/2` (`bridge.sendCompressed`, `bridge.syncDiff`), `FastCDC`, `Zero-Decompress Pass-Through`, прогрессивная доставка `LOD 3 → LOD 0`, `XOR-FEC`. |
| **13** | `anim.*` | Ретаргетинг клипов между разными скелетами (`anim.retarget`), процедурный Foot-Locking по `H(X,Y)`, сжатие треков `Smallest-Three` + удаление лишних ключей (-80 % веса). |
| **14** | `phys.*` | Непрерывные столкновения **CCD** (быстрые пули не пролетают сквозь стены), острова сна (0 % CPU на спящие стопки), кроссплатформенный детерминизм порядка контактов. |
| **15** | `nav.*` | Иерархический поиск **`HPA*`** (`F-128`, `A-85` — в 20×–50× быстрее на больших картах!), локальный пересчёт только грязных кластеров (`Dirty-Nav`), предиктивный обход встречных потоков. |
| **16** | `env.*` | Предвычисленные LUT неба/света (минимум тригонометрии), микроклимат (тень гор, городской остров тепла), прямая связка тумана/дождя с `see` и `hear`. |
| **17** | `fx.*` | Дистанционный LOD частиц, единый мега-атлас (1 draw call на ВСЕ эффекты!), жёсткий лимит `<= 1 мс` на FX в кадре. |
| **18** | `ai.*` | Квотируемое мышление под 75 % CPU (`ai.budgetedStep` + `F-115`), командный тактический Blackboard (отряд делится обзором по радио), объяснимый лог «почему». |
| **19** | `sim.*` | Событийная симуляция + аналитический догон `F-108` (без пустых циклов), авто-стресс-тест экономики на инфляцию и ресурсные тупики. |
| **20** | `ui.*` | Виртуализация списков (10 000 строк = 15 элементов DOM), дифф-обновление HUD, пресет «1 рука на телефоне», встроенная мини-панель `RAM / CPU 75% / FPS`. |
| **21** | `input.*` | Адаптивный фильтр **`One-Euro Filter`** (`F-127` — 0 дрожания пальца и 0 задержки рывка!), автопереключение подсказок ПК / Тач / Геймпад. |
| **22** | `audio.*` | Кэширование частых процедурных звуков в короткий `AudioBuffer` (экономия CPU), динамический Sidechain Ducking (музыка мягко уступает речи/взрывам), 0-аллокационный пул. |
| **23** | `save.*` | Формат `RCW2` + **`FastCDC` дедупликация между слотами** (10 слотов весят как ~1.3!), фоновое сохранение в воркере без фризов, атомарная запись `temp → CRC32 → swap`. |
| **24** | `test.*` | Автоминимизация падающего сценария (**Delta Debugging `ddmin`**, `A-86`: 1000 шагов → 4 шага!), дифф-бенчмарк регрессий, автопроверка потолка **75 % CPU**. |
| **25** | `stream.*` | Полный 11-уровневый стек: `Paletted 16³`, `SVDAG`, `Cave/Hi-Z`, `SoA`, `PackedVertex64`, `64-bit Bricks`, `CoreGovernor 75%` + **бинарная потоковая передача `RCW2` (`transferPack/Diff/Send/Recv`, `selectCodec`, `trainDict`)**. |
| **26** | `net.*` | **Мультиплеер / кооп без серверов** поверх `ratcore-wire/2`: WebRTC DataChannel P2P / WS, `Client-Side Prediction`, `Rollback Netcode` (`F-129..F-131`, `A-87..A-89`), 12–24 Б/тик ввод игрока, компенсация лага и детерминированный выбор хоста. |
| **27** | `destroy.*` | **Структурная разрушаемость, огонь и цепные реакции**: граф несущих опор на `64-bit Bricks` (`F-132..F-133`, `A-90`), раскол на физические осколки, пожар по ветру (`F-134`, `A-91`) и тушение водой (`F-135` + `phys.fluidStep`). |
| **28** | `story.*` | **ИИ-Режиссёр темпа и живая летопись (`AI Director`)**: кривая напряжения `tension` (`F-136..F-137`, `A-92`), фазы `build-up → peak → sustain → relax`, процедурные события, кризисы и летопись мира. |
| **29** | `mod.*` | **Безопасная система модов (`.ratmod.rcw2`)**: песочница строго поверх `ToolGuard` + квота `ModQuota` внутри 75 % `CoreGovernor` (`F-138..F-139`, `A-93`), новые здания/биомы/рецепты/звуки и `Hot-Reload` без перезапуска. |
| **30** | `cutscene.*` | **Режиссура камеры, таймлапсы и авто-обложки** *(по выбору: `pack:cinema`)*: дуговые рельсы камеры (`F-140`, `A-94`), таймлайн титров/погоды/аудио, съёмка **таймлапса мира** (`F-142`, `A-95`) и авто-съёмка 16:9 обложек (`F-141`) для витрины. |
| **31** | `shader.*` | **Граф визуальных стилей и материалов** *(по выбору: `pack:styles`)*: ретро-PS1 (Бейер 4×4 `F-151`), комикс `cel-shading` + контуры (`F-152`), CRT/VHS, тепловизор/ПНВ (`F-153`), мокрый асфальт и голограммы — работает в WebGL2, Software 3D и 2D (`A-101`). |
| **32** | `quest.*` | **Процедурные квесты, тайны и живые фракции** *(по выбору: `pack:narrative`)*: генератор цепочек улик/заданий, математическое доказательство проходимости без софтлоков (`F-154`, `A-102`) и дипломатия фракций (`F-155`, `A-103`). |
| **33** | `voice.*` | **Офлайн-синтез голосов, рации и липсинка** *(по выбору: `pack:voice`)*: 3-формантный синтезатор (`F-156`, `0 КБ` аудиофайлов), тембры (командир по рации, робот, мегафон, шёпот, стили *Undertale*/*Animal Crossing*) + виземы рта в реальном времени (`F-157`, `A-104`). |
| **34** | `eco.*` | **Живая экосистема, эрозия, сезоны и лёд на `1 Гц`** *(по выбору: `pack:ecology`)*: гидравлическая эрозия (`F-158`, `A-105`), зарастание лесом, замерзание рек с несущей прочностью льда (`F-159`, `A-106` — лёд трескается под тяжёлой техникой!) и миграция фауны (`F-160`). |
| **35** | `coopAi.*` | **Локальный ИИ-Напарник внутри игры** *(по выбору: `pack:companion`)*: реально смотрит через `see`, слышит через `hear`, понимает команды игрока через `ai.nluParse` (*«прикрой слева»*, *«построй мост»*, `F-161..F-162`, `A-107`) и кратко объясняет свои действия. |
| **36** | `assist.*` | **Умный наставник и доступность (`Accessibility`)** *(по выбору: `pack:assist`)*: детектор застревания > 20 с (`F-163`, `A-108`), коррекция дальтонизма (`F-164`), визуальные субтитры звуков (`hear → UI`, `F-165`), крупный шрифт и режим 1 руки (`A-109`). |

---

# 26. `tools.net.*` — Мультиплеер, кооп и Rollback Netcode (P2P / WebRTC / WS)

Работает прямо поверх детерминированного шага (`F-01`, `F-02`), бинарного протокола `ratcore-wire/2` и 4-байтных кватернионов (`F-111`).

- **`net.createRoom({ mode: 'p2p-webrtc' | 'ws-relay', maxPlayers, tickRate: 60, maxRollbackFrames: 8 })`** — создаёт комнату и короткий код приглашения (`roomCode`) или SDP-билет для P2P без выделенного сервера (`A-89`).
- **`net.joinRoom({ roomCode, signaling?, playerName })`** — подключает игрока, синхронизирует `worldSeed` и актуальный COW-снапшот через `stream.transferSend` (`RCW2` + `FastCDC`).
- **`net.sendInput({ tick, bitMask, axesQuantized })`** — пакует ввод игрока в **12–24 байта/тик** (`F-129`) и рассылает с избыточностью `XOR-FEC` (`F-124`).
- **`net.stepRollback({ targetTick })`** — исполняет цикл **`Rollback Netcode`** (`F-130`, `A-87`): при получении запоздавшего ввода откатывает мир к ближайшему COW-снимку, перепроигрывает тики и плавно сглаживает визуальную поправку (`F-131`).
- **`net.interpolateRemote({ renderTimeMs })`** — интерполирует удалённые сущности и выполняет компенсацию лага при стрельбе (`Lag Compensation`, `A-88`).
- **`net.checkDesync()`** — сверяет 64-битный `stateHash` между участниками; при расхождении (`RC-604`) автоматически присылает минимальный `FastCDC`-дифф и логирует тикет в `tools.bugs`.
- **`net.hostMigrate()`** — детерминированный выбор нового хоста при обрыве текущего без сброса партии (`A-89`).

---

# 27. `tools.destroy.*` — Структурная разрушаемость, огонь и цепные реакции

Связывает `64-bit Occupancy Bricks` (`A-78`), физику осколков (`tools.phys`) и воду/ветер (`phys.fluidStep`, `phys.windAt`).

- **`destroy.buildSupportGraph({ chunkId, materials })`** — строит граф несущих опор от фундамента (`grounded = true`) и рассчитывает запас прочности (`F-132`).
- **`destroy.damage({ pos, radius, force, damageType: 'kinetic' | 'blast' | 'heat' })`** — вырезает повреждённые воксели/элементы, проверяет порог обрушения (`F-133`), запускает BFS от земли (`A-90`) и превращает отрезанные связные компоненты в падающие физические обломки!
- **`destroy.ignite({ pos, temperatureC, fuelTag })`** — поджигает горючий материал и запускает клеточно-воксельное распространение пламени и дыма (`A-91`) с учётом ветра и влажности (`F-134`).
- **`destroy.quench({ pos, radius, waterVolume })`** — рассчитывает тепловой баланс тушения (`F-135`), гасит очаги, создаёт пар (`fx.emit`) и увлажняет соседние блоки.
- **`destroy.chainReact({ origin, maxDepth })`** — обрабатывает цепные реакции (бочки, ЛЭП, дамбы, топливные баки) в рамках бюджета `CoreGovernor 75 %` без зависания кадра.

---

# 28. `tools.story.*` — ИИ-Режиссёр темпа и живая летопись (`AI Director`)

Удерживает идеальный эмоциональный ритм игры (как в *Left 4 Dead* и *RimWorld*), не давая миру стать ни скучным, ни нечестно душным.

- **`story.directorInit({ profile: 'survival' | 'citybuilder' | 'shooter' | 'sandbox', seed })`** — запускает автомат фаз `Build-Up → Peak → Sustain → Relax` (`A-92`).
- **`story.sampleTension({ playerStats, threatDist, resourceRatio, recentEvents })`** — вычисляет текущее напряжение `tension ∈ [0, 1]` (`F-136`).
- **`story.directorTick({ dt })`** — выбирает следующее событие по фазе и весам (`F-137`): погодный фронт, засаду, караван, редкую находку, поломку или передышку.
- **`story.chronicleAdd({ tick, actorIds, kind, summary, impact })`** — фиксирует ключевые вехи мира в сжатую летопись (доступна для `ui.dialogueStart` и титров таймлапса).
- **`story.chronicleQuery({ filter, limit })`** — отдаёт ИИ или игроку сжатую историю мира («почему рухнул мост на 14-м году»).

---

# 29. `tools.mod.*` — Безопасная система модов для игроков и ИИ (`.ratmod.rcw2`)

Любой игрок или ИИ может расширить игру новыми зданиями, машинами, биомами, рецептами и звуками — строго в песочнице с защитой `ToolGuard` и квотой CPU.

- **`mod.pack({ manifest, recipes, assets, rules })`** — собирает мод в 1 бинарный сжатый файл `.ratmod.rcw2` (`CRC32` + список зависимостей `F-139`).
- **`mod.validate({ packageBytes })`** — прогоняет все модели/текстуры мода через `ToolGuard` (сырой меш без рецепта отбивается `RC-101`), проверяет отсутствие запрещённых API (`eval`, сеть, выход из песочницы) и лимит бюджета `ModQuota` (`F-138`).
- **`mod.mount({ packageBytes, quotaPct: 10 })`** — подключает мод в изолированный контейнер с топологической сортировкой зависимостей (`F-139`, `A-93`); при превышении квоты CPU внутри 75 % `CoreGovernor` мод автоматически уходит в паузу с понятным отчётом.
- **`mod.hotReload({ modId, packageBytes })`** — обновляет рецепты/правила/звуки на лету без перезапуска игры и без потери сохранений.
- **`mod.unmount({ modId })`** — чисто выгружает мод, откатывая его таблицы и возвращая память в арену.

---

# 30. `tools.cutscene.*` — Кинематограф, рельсы камеры, таймлапсы и авто-обложки

- **`cutscene.createTrack({ durationSec, keyframes, cameraSpline })`** — строит рельсу камеры с дуговой параметризацией (`F-140`, равномерная скорость без рывков на поворотах) + синхронные треки погоды, титров, анимаций и звука (`A-94`).
- **`cutscene.play({ trackId, skippable: true })`** / **`cutscene.seek({ trackId, timeSec })`** — проигрывает и перематывает кат-сцену с сохранением 60 FPS.
- **`cutscene.timelapseStart({ everyTicks, cameraOrbit, maxFrames: 450 })`** / **`cutscene.timelapseFinish()`** — снимает **живой таймлапс развития мира** («100 лет города за 15 секунд», `F-142`, `A-95`) с нулевым влиянием на FPS благодаря воркерному кодированию.
- **`cutscene.autoCover({ targetId?, aspect: '16:9', lightingPreset })`** — подбирает 12 ракурсов, оценивает композицию по правилу третей и контрасту (`F-141`, `A-95`) и рендерит готовую обложку `640×360` (WebP/PNG) для витрины или модпака!

---

# 31. Сквозные надстройки v0.7-draft (встроены в существующие ветки)

### 31.1. «Машина времени» (`Time-Scrubbing Debugger` с ветвлением истории — `tools.save.*` + `tools.input.*`)
- **`save.timelineInit({ keyframeInterval?: 'auto', maxBranchRamMB: 24 })`** — вычисляет оптимальный шаг COW-снимков `K*` (`F-143`) и ведёт параллельную запись потока ввода (`A-60`).
- **`save.scrubTo({ tick, branchId })`** — мгновенно перематывает мир назад или вперёд на любую секунду (`A-96`), доигрывая только остаток `< K*` тиков от ближайшего COW-снимка.
- **`save.branchFrom({ tick, patchParams, label })`** — создаёт альтернативную ветку истории поверх того же COW-дерева (`F-144`): разработчик или ИИ меняет параметр/рецепт в момент `T` и сравнивает исход «до и после» бок о бок!

### 31.2. Автобалансировщик игр на 75 % CPU (`Auto-Balancer` — `tools.test.*` + `tools.guess.*` + `tools.sim.*`)
- **`test.autoBalance({ runs: 500, tunableParams, winMetrics, maxWorkersPct: 75 })`** — прогоняет сотни headless-партий в пуле воркеров `CoreGovernor` (`A-97`), рассчитывает индекс доминирования стратегий (`F-145`), энтропию мета-игры (`F-146`), чувствительность (`F-147`) и сводный фитнес баланса (`F-148`).
- **`test.findExploits({ runs: 300 })`** — выявляет «кнопку автопобеды», бесконечные циклы ресурсов и экономические тупики (`A-98`) и возвращает готовый дифф-патч параметров + воспроизводимый сид.

### 31.3. Экспорт игры в 1 автономный `.html`-файл (`Single-File Bundler` — `tools.build.*`)
- **`build.exportSingleHtml({ sceneId, title, targetSizeKB: 300, includeAutoCover: true })`** — выполняет tree-shaking неиспользуемых модулей `RatCore`, пакует рецепты мира/ассетов в `RCW2` (`F-149`), встраивает минимальный рантайм-распаковщик и манифест `ToolGuard` (`F-150`, `A-99`, `A-100`).
- Результат — **один автономный `.html`-файл (`< 300 КБ`)**, работающий полностью офлайн и в изолированном `<iframe sandbox="allow-scripts allow-pointer-lock">` (можно сразу загрузить в Мастерскую `Games` или отправить другу файлом, при этом сам исходный `RatCore` остаётся полностью изолирован от `site/`).

---

# 32. Новые модульные ветки v0.8-draft (подключаются строго по выбору!)

### 32.1. Ветка 31 · `tools.shader.*` (`pack:styles`) — Граф визуальных стилей и материалов
- **`shader.createGraph({ name, nodes, outputs, target: 'auto' | 'webgl2' | 'software' })`** — строит безопасный граф визуальных эффектов поверх `ToolGuard` (без сырых неконтролируемых шейдеров; автоматический fallback в Software 3D / 2D LUT, `A-101`).
- **`shader.applyPreset({ preset: 'ps1-retro' | 'cel-comic' | 'crt-vhs' | 'thermal' | 'nightvision' | 'wet-asphalt' | 'hologram', intensity })`** — мгновенно включает единый стиль кадра (`F-151..F-153`).
- **`shader.bindMaterial({ materialId, graphId, params })`** — вешает стиль на конкретный материал (вода, стекло, экран, голограмма).

### 32.2. Ветка 32 · `tools.quest.*` (`pack:narrative`) — Процедурные квесты, тайны и живые фракции
- **`quest.generate({ archetype: 'mystery' | 'escort' | 'heist' | 'diplomacy' | 'rescue', worldState, seed })`** — строит граф целей, улик и развилок (`A-102`).
- **`quest.verifySolvable({ questId, worldState })`** — математически доказывает достижимость финала без софтлоков (`F-154`, `A-102`); если путь сломан — возвращает минимальный фикс мира.
- **`quest.factionInit({ factions, relationsMatrix })`** / **`quest.factionEvent({ actorA, actorB, kind, weight })`** — симулирует союзы, торговлю, обиды и предательства (`F-155`, `A-103`).

### 32.3. Ветка 33 · `tools.voice.*` (`pack:voice`) — Офлайн-синтез голосов, рации и липсинка (`0 КБ` сэмплов)
- **`voice.createProfile({ id, pitchHz, formants: [F1, F2, F3], style: 'radio' | 'robot' | 'megaphone' | 'whisper' | 'gibberish-cute' })`** — задаёт уникальный голосовой паспорт персонажа (`F-156`, `A-104`).
- **`voice.speak({ profileId, text, emotion, spatialPos? })`** — синтезирует выразительную речевую мелодику и радиошум в WebAudio (`0 КБ` файлов) и возвращает поток визем рта для анимации лица (`F-157`).
- **`voice.getViseme({ voiceHandle, timeSec })`** — выдаёт точный вес открытия рта и формы губ на текущий кадр.

### 32.4. Ветка 34 · `tools.eco.*` (`pack:ecology`) — Живая экосистема, эрозия, сезоны и лёд на `1 Гц`
- **`eco.setSeason({ season: 'spring' | 'summer' | 'autumn' | 'winter', tempC, snowCover })`** — перестраивает температуру, растительность и замерзание водоёмов.
- **`eco.erosionStep({ dt, rainfallMap })`** — выполняет шахматный шаг гидравлической эрозии русел и зарастания пустырей лесом (`F-158`, `F-160`, `A-105`) на `1 Гц`.
- **`eco.iceThicknessAt({ x, y })`** / **`eco.iceStressTest({ x, y, massKg, footprintM2 })`** — считает толщину льда по формуле Стефана и предельную нагрузку по формуле Гольда (`F-159`, `A-106`): лёгкий пешеход пройдёт по реке зимой, а тяжёлый грузовик расколет лёд и провалится!
- **`eco.faunaStep({ dt })`** — управляет стадами, миграциями и пищевыми цепочками на `1 Гц`.

### 32.5. Ветка 35 · `tools.coopAi.*` (`pack:companion`) — Локальный ИИ-Напарник внутри игры
- **`coopAi.spawn({ id, personality, skills })`** — создаёт дружественного агента, подключённого к настоящему зрению `see` и слуху `hear`.
- **`coopAi.order({ companionId, textOrCommand })`** — разбирает естественную команду игрока (*«прикрой слева»*, *«построй мост здесь»*, *«добудь дерево»*) через `ai.nluParse`, строит план с учётом доверия (`F-161..F-162`, `A-107`) и приступает к выполнению.
- **`coopAi.explainLastAction({ companionId })`** — коротко и понятно объясняет игроку, почему напарник выбрал именно это действие.

### 32.6. Ветка 36 · `tools.assist.*` (`pack:assist`) — Умный наставник и доступность (`Accessibility`)
- **`assist.trackPlayer({ playerPos, activeGoalId, dt })`** — оценивает индекс застревания `stuckScore` (`F-163`); если игрок кружится на месте > 20 с, мягко эскалирует подсказку без спойлеров (`A-108`).
- **`assist.setVisualMode({ colorblind: 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia', highContrast, fontScale })`** — включает матричную коррекцию дальтонизма (`F-164`) и крупный HUD (`A-109`).
- **`assist.setAudioSubtitles({ enabled, showDirection: true })`** — переводит важные события `tools.hear` в направленные экранные подписи (`F-165`: *«← Шаги слева»*, *«↑ Взрыв впереди»*).
- **`assist.setOneHandMobile({ enabled, dominantHand: 'right' | 'left' })`** — перестраивает сенсорное управление под одну руку.

### 32.7. Встроенная мини-студия `RatStudio` (`pack:studio`, только dev/authoring!)
- **`studio.open({ panels: ['inspector', 'timeline', 'balancer', 'exporter'] })`** — открывает лёгкий оверлей поверх движка (`<= 0.8 мс/кадр`, `F-169`, `A-112`):
  - **Инспектор ассетов:** вращение любой 3D/2D-модели, сетка, бюджет треугольников и аудит `ToolGuard`;
  - **Ползунок «Машины времени»:** живое перетаскивание `save.scrubTo` + ветвление `save.branchFrom`;
  - **Кнопка Автобаланса:** запуск `test.autoBalance` на 75 % CPU с графиком винрейтов;
  - **Сборка в 1 клик:** экспорт мода `.ratmod.rcw2` (`mod.pack`) или автономной игры `.html` (`build.exportSingleHtml`).
- В релизной сборке `pack:studio` **полностью вырезается** tree-shaking'ом (`A-113`, `0 Б` в финальном файле!).

---

# 33. Система модулей «по выбору» (`RatCore Modular Profiles / Opt-In Packs`, Решение `D-16`)

**Главный принцип — «Не используешь — не платишь» (`Zero-Cost Opt-In`, `F-166..F-170`, `A-110..A-114`):**  
То, что нужно не в каждой игре (мультиплеер, разрушаемость, квесты, моды, кино, стили, голос, экосистема, ИИ-напарник, `RatStudio`, мультиагентные инструменты ИИ), **выключено по умолчанию** и включается осознанным выбором разработчика или ИИ. Выключенный пакет занимает **0 байт RAM**, **0 % CPU** и **0 байт в итоговом бандле**.

### 3 уровня подключения
| Уровень | Что входит | Когда включается | Поведение по умолчанию |
|---|---|---|---|
| **Уровень 0 · Ядро (`core`)** | `build`, `move`, `remove`, `watch`, `look`, `see`, `input`, `ui`, `save` (базовый), `stream` (ядро RAM + `CoreGovernor 75 %`), `ToolGuard` | Всегда (~28–35 КБ) | **Включено всегда** |
| **Уровень 1 · Стандартные жанровые модули (`modules`)** | `anim`, `phys`, `nav`, `env`, `fx`, `ai`, `sim`, `audio`, `hear`, `test` (базовый) | По жанру через `preset` или список `modules: [...]` | Подключаются только нужные жанру |
| **Уровень 2 · Опциональные пакеты по выбору (`packs`)** | 14 независимых пакетов ниже (16 веток + `RatStudio` + GPU/WASM-ускорители + dev-надстройки) | Явно через `packs: [...]` или лениво `engine.enablePack(id)` | **Выключены (`0 Б`, `RC-108` при случайном вызове)** |

### Каталог опциональных пакетов по выбору (`packs`)
| ID пакета | Ветки / возможности внутри | Кому нужен | Можно включать в рантайме (`enablePack`)? |
|---|---|---|---|
| `pack:multiplayer` | `net.*` (`Rollback P2P` + WebRTC/WS) | Кооп, PvP, комнаты по коду | Да |
| `pack:destruction` | `destroy.*` (опоры, обломки, огонь/вода) | Шутеры, симуляторы катастроф, песочницы | Да |
| `pack:narrative` | `story.*` + `quest.*` (ИИ-Режиссёр, квесты, фракции) | Выживалки, RPG, стратегии с событиями | Да |
| `pack:mods` | `mod.*` (`.ratmod.rcw2`, `ModQuota`, `Hot-Reload`) | Песочницы и игры с мастерской игроков | Да |
| `pack:cinema` | `cutscene.*` (рельсы камеры, таймлапсы, авто-обложки) | Градострои, сюжетные игры, трейлеры | Да |
| `pack:styles` | `shader.*` (PS1, Cel, CRT, тепловизор, голограммы) | Стилизованные 2D/3D игры | Да |
| `pack:voice` | `voice.*` (формантный синтез, рация, липсинк) | Диалоговые, сюжетные, тактические игры | Да |
| `pack:ecology` | `eco.*` (эрозия, сезоны, лёд, фауна на 1 Гц) | Карты мира, выживалки, гидросимуляторы | Да |
| `pack:companion` | `coopAi.*` (локальный ИИ-напарник) | Выживалки, тактика, кооп с ботом | Да |
| `pack:assist` | `assist.*` (умный наставник, дальтонизм, субтитры, 1 рука) | Любая игра (может включать сам игрок в настройках!) | Да (рекомендуется) |
| `pack:webgpu` | Аппаратные `Compute Shaders` (вода, толпы, частицы — `10×–30×` с автооткатом на WebGL2/растр) | Тяжёлые 3D-миры и массовые симуляции | Да (с автодетектом GPU) |
| `pack:wasm-accel` | Компактный (`< 25 КБ`) WASM+SIMD ускоритель (`Greedy Meshing`, `SVDAG`, `SWE`, `FastCDC`/`HPA*`, битовое совпадение с JS) | Огромные воксельные и гидрокарты | Да (с автооткатом на JS) |
| `pack:studio` | `RatStudio` + `save.timeline*` + `test.autoBalance` + `build.exportSingleHtml` | Только разработка, отладка и упаковка | Только в dev-режиме (`0 Б` в релизе!) |
| `pack:ai-team` | `think.*`, `guess.*`, `comm.*`, `bugs.*`, `bridge.*` | Совместная работа нескольких нейросетей и мосты с другими движками | Только когда нужна ИИ-команда или мост |

### Встроенные в ядро (`core`) механизмы плавности и надёжности (v0.9-draft)
- **`stream.setPowerProfile({ mode: 'eco' | 'balanced' | 'turbo' | 'auto' })`** — задаёт потолок `CoreGovernor` (`40 %` / `60 %` / `75 %` CPU + мгновенный сон при сворачивании вкладки и термоохлаждение, `F-175`, `A-119`).
- **`stream.setDynamicResolution({ enabled: true, minScale: 0.55, maxScale: 1.0, targetFps: 60 })`** — авто-масштаб 3D-буфера при сохранении 100 % чёткого UI (`F-171`, `A-115`).
- **`stream.prewarmShaders({ budgetMsPerFrame: 2, cacheIndexedDb: true })`** — асинхронный прогрев шейдеров и старт `< 120 мс` без микрофризов (`F-172`, `A-116`).
- **`watch.enableSelfHealing({ recoverWebGLContext: true, isolateFaultyModule: true })`** — восстановление потерянного WebGL-контекста прямо из `AssetVault` + изоляция сбойных модулей без чёрного экрана (`F-173`, `A-117`, `RC-905`, `RC-906`).
- **`input.enableCoalescedZeroLag({ offscreenRender: 'auto' })`** — чтение `getCoalescedEvents()` перед кадром + рендер в `OffscreenCanvas` воркере (`F-174`, `A-118`).

### Пример подключения (чисто, в 1 объект конфигурации)
```js
// 1) Лёгкая 2D-аркада (~45 КБ, 0 лишних модулей!)
const arcade = createEngine({ preset: 'minimal-2d', modules: ['audio', 'fx'], packs: ['pack:assist'] });

// 2) Градострой с таймлапсами, сезонами и модами (без шутерного мультиплеера и голосов)
const city = createEngine({
  preset: 'citybuilder',
  packs: ['pack:ecology', 'pack:cinema', 'pack:mods', 'pack:assist'],
});

// 3) Выключенный модуль защищён кодом RC-108 с готовым autoFixHint:
// city.tools.net.createRoom(...) -> { ok: false, code: 'RC-108', autoFixHint: "Добавь 'pack:multiplayer' в packs или вызови engine.enablePack('pack:multiplayer')" }
```

### Готовые пресеты (`preset`)
- `minimal-2d` — только `core` (идеально для микроигр `< 60 КБ`);
- `arcade-3d` — `core` + `anim`, `phys`, `fx`, `audio`;
- `shooter-fps` — `core` + `anim`, `phys`, `nav`, `fx`, `ai`, `audio`, `hear` *(опционально: `pack:destruction`, `pack:multiplayer`, `pack:styles`, `pack:companion`)*;
- `citybuilder` — `core` + `nav`, `env`, `sim`, `audio` *(опционально: `pack:ecology`, `pack:cinema`, `pack:mods`, `pack:narrative`)*;
- `survival` — `core` + `anim`, `phys`, `nav`, `env`, `fx`, `ai`, `sim`, `audio`, `hear` *(опционально: `pack:narrative`, `pack:destruction`, `pack:ecology`, `pack:companion`)*;
- `multiplayer-sandbox` — `core` + `phys`, `nav`, `fx`, `audio` + `pack:multiplayer`, `pack:mods`;
- `ai-dev-full` — всё + `pack:studio` + `pack:ai-team` *(для разработки и команд ИИ)*.

---

# Шпаргалка: какие ветки и пакеты комбинировать «на любой случай жизни»

| Тип игры / задачи | Пресет + стандартные модули | Опциональные пакеты по выбору (`packs`) |
|---|---|---|
| **Карта страны / градострой** *(как РАТГРАД)* | `citybuilder` (`core` + `nav`, `env`, `sim`, `audio`) | `+ pack:ecology`, `+ pack:cinema` (таймлапсы), `+ pack:narrative`, `+ pack:mods` |
| **3D-шутер от 1-го лица** *(как СЕКТОР «ПЕПЕЛ»)* | `shooter-fps` (`core` + `anim`, `phys`, `nav`, `fx`, `ai`, `audio`, `hear`) | `+ pack:destruction`, `+ pack:multiplayer`, `+ pack:styles`, `+ pack:voice` (рация), `+ pack:companion` |
| **Пиксельная зомби-выживалка** *(как DEAD DISTRICT)* | `survival` (`core` + `anim`, `phys`, `nav`, `env`, `fx`, `ai`, `sim`, `audio`, `hear`) | `+ pack:narrative` (AI Director + квесты), `+ pack:destruction` (пожары), `+ pack:ecology` (сезоны/лёд), `+ pack:styles` |
| **3D-симулятор ГЭС / экономики / дорог** *(КАСКАД, ТРАССА)* | `citybuilder` + `phys` | `+ pack:ecology` (эрозия/лёд), `+ pack:destruction` (аварии), `+ pack:cinema` |
| **Автосимулятор / 3D-шоурум** *(ЕВРОТРАК, ГАРАЖ 3D)* | `arcade-3d` + `env` | `+ pack:mods` (свои машины), `+ pack:cinema` (авто-обложки), `+ pack:styles` |
| **Симулятор жизни / текстовые и сюжетные игры** *(1 ИЗ 8 МЛРД)* | `minimal-2d` + `sim`, `ai`, `audio` | `+ pack:narrative`, `+ pack:voice`, `+ pack:assist` |
| **Мультиплеер / песочница с модами и публикацией** | `multiplayer-sandbox` | `+ pack:destruction`, `+ pack:cinema`, `+ pack:studio` (dev) |
| **Команда из нескольких нейросетей** | `ai-dev-full` | `pack:ai-team` + `pack:studio` + нужные игровые пакеты |
