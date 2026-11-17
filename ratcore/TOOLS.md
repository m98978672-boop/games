# RatCore — полный каталог инструментов на все случаи жизни (`TOOLS.md`)

**Версия:** 0.4-draft (2026-11-16)  
**Охват:** **25 веток инструментов** `engine.tools.<группа>.<метод>(args, ctx?)` — от сборки моделей и карт до анимации, физики, навигации, погоды, эффектов, игрового ИИ, экономики, UI, ввода, звука, сохранений, автотестов, чувств ИИ, общения нейросетей, мостов с другими движками и **7-уровневого сжатия невидимой информации** (`tools.stream.*`).  
**Связанные документы:** [`ALGORITHMS.md`](./ALGORITHMS.md) (`F-01..F-112`, `A-01..A-74`) · [`COMPRESSION.md`](./COMPRESSION.md) · [`BRIDGE.md`](./BRIDGE.md).  
**Принцип:** единый формат ответа, обязательная проверка `ToolGuard`, автоматическое логирование в журнал операций и поддержка отката (`undo`/`redo`).

---

## 0. Единый контракт вызова и ответа

### Контекст вызова (`ctx`, опционально — берётся из активной сессии агента)
```json
{
  "agentId": "ai-modeler",
  "role": "modeler",
  "traceId": "tr-0042",
  "dryRun": false
}
```

### Единый формат ответа каждого инструмента
```json
{
  "ok": true,
  "tool": "build.extrude",
  "data": {},
  "error": null,
  "tick": 120,
  "costMs": 0.42,
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
    "hint": "Построй меш через tools.build.extrude / loft / lathe / layer / voxels / primitive / combine. Справка: tools.help('build')"
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

---

# Шпаргалка: какие ветки инструментов комбинировать «на любой случай жизни»

| Тип игры / задачи | Какие ветки `RatCore.tools.*` работают вместе |
|---|---|
| **Карта страны / градострой** *(как РАТГРАД)* | `build.map` + `build.layer` + `nav.trafficStep` + `nav.dispatch` + `env` + `sim.ledgerStep` + `sim.demographyStep` + `look`/`see` + `save` |
| **3D-шутер от 1-го лица** *(как СЕКТОР «ПЕПЕЛ»)* | `build.extrude`/`loft`/`lathe` + `anim` (слои + IK + Verlet) + `phys.ballistics` + `ai` (укрытия + «больно думать») + `fx` + `hear` + `audio` + `input` |
| **Пиксельная зомби-выживалка** *(как DEAD DISTRICT)* | `build.voxels` + `build.tex` (палитра/дизеринг) + `env.computeFOV` + `nav.buildFlowField` + `ai.createFSM` + `ai.utilityPick` + `sim.bodyStep` + `sim.craft` + `hear` |
| **3D-симулятор ГЭС / экономики / дорог** *(КАСКАД, ТРАССА)* | `build.map` + `phys.fluidInit`/`fluidStep` + `phys.windAt` + `nav.trafficStep` + `sim.ledgerStep` + `guess.compare` + `ui` + `save` |
| **Автосимулятор / 3D-шоурум** *(ЕВРОТРАК, ГАРАЖ 3D)* | `build.combine`/`surface` + `phys.vehicleCreate`/`vehicleInput` + `env.setWeather` + `look.inspectModel` + `audio` + `bridge.exportMesh` |
| **Симулятор жизни с локальным ИИ** *(НИКА, 1 ИЗ 8 МЛРД)* | `anim` + `ai.nluTrain`/`nluParse` + `ai.utilityPick` + `sim.demographyStep` + `sim.ledgerStep` + `ui.dialogueStart` + `test.batchSeeds` |
| **Команда из нескольких нейросетей** | `comm` (папки общения) + `think` + `guess` + `build` (`ToolGuard`) + `look`/`see`/`hear` + `bugs`/`report` + `bridge` (RPC + синхронизация) |
