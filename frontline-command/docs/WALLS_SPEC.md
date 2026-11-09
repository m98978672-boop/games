# Спецификация: стены зданий v2 (коллизия, проёмы, укрытия, разрушение)

Версия: 0.11.0. Флаги: `wall_collision_v2` (по умолчанию вкл), `wall_destruction` (вкл),
`wall_sound_muffle` (вкл). Любой из них выключает свою часть механики и возвращает прежнее поведение.

## 1. Слои физики

Порядок слоёв и что каждый блокирует — см. `docs/PHYSICS_LAYERS.md`. Коротко:

```
рельеф (вода/лес) → застройка (бункер) → стены зданий v2 → юниты
```

- движение: `world.walk[]` (тайл 32 px) + точная проверка `walls.blocksMove()`
- пули: `game.raycastBlocked()` → `walls.bulletRay()` (точный ray-segment тест)
- обзор: `world.hasLOS()` → `walls.blocksVision()`
- укрытие: `world.bestCover()` → `walls.coverSpotsNear()` + `walls.coverAt()`

## 2. Геометрия

Контуры не рисуются руками в коде — они **генерируются** из `data/buildings.json` полем `walls`
в `data/outlines/<type>.json` скриптом `tools/gen-walls.mjs` (валидатор: зазор ≥ 8 px,
сегмент ≥ 2 px, контур замкнут).
Каждый сегмент содержит `texture_set`: пока это ключ материала, не готовая текстура.
Подключение файлов и отрисовка растровых наборов — отдельный этап; тест
`tests/wall-data.mjs` проверяет данные и воспроизводимость генерации.

Режимы (`mode`):

| Режим | Что даёт | Типы |
|---|---|---|
| `ring` | замкнутый периметр с проёмами: двери, окна, бойницы, ворота | bunker, depot, factory, farm, hq, city |
| `cover-line` | одна линия укрытия, движение не блокирует | sandbags, mg_nest, watchtower |

Текущая инвентаризация (генерируется, `data/outlines/index.json`):

| Тип | режим | материал | сегментов | проёмов | точек укрытия | слотов гарнизона |
|---|---|---|---|---|---|---|
| sandbags | cover-line | sandbag | 1 | 0 | 4 | 0 |
| mg_nest | cover-line | sandbag | 1 | 0 | 4 | 0 |
| watchtower | cover-line | wood | 1 | 0 | 4 | 0 |
| bunker | ring | concrete | 7 | 3 | 36 | 2 |
| depot | ring | wood | 7 | 3 | 45 | 1 |
| factory | ring | metal | 8 | 4 | 46 | 2 |
| farm | ring | wood | 7 | 3 | 38 | 2 |
| hq | ring | concrete | 12 | 8 | 74 | 6 |
| city | ring | brick | 10 | 6 | 60 | 4 |

Координаты контура локальные (центр здания = 0,0), толщина — 10…16 px по материалу.
В мире: `b.x + p.x`, `b.y + p.y`; при включённых стенах валидатор гарантирует замкнутость ≤ 0.001 px.

## 3. Материалы (`data/wall_materials.json`)

| Материал | HP/тайл | толщина | класс высоты | пробивание rifle / sniper | остаток урона rifle / sniper | structural bullet / shell |
|---|---|---|---|---|---|---|
| wood | 140 | 10 | 2 | 0.45 / 0.90 | 0.55 / 0.50 | 0.40 / 2.5 |
| sandbag | 200 | 14 | 1 | 0 / 0 | 0.90 / 0.80 | 0.30 / 1.8 |
| brick | 320 | 12 | 3 | 0 / 0.50 | 0.65 / 0.50 | 0.25 / 2.0 |
| concrete | 600 | 16 | 3 | 0 / 0 | 0.75 / 0.60 | 0.12 / 1.6 |
| metal | 260 | 10 | 3 | 0.12 / 0.55 | 0.70 / 0.55 | 0.20 / 2.0 |
| earth | 180 | 12 | 1 | 0 / 0.15 | 0.95 / 0.85 | 0.25 / 2.2 |
| ruins | 120 | 8 | 1 | 0.45 / 0.70 | 0.60 / 0.50 | 0.50 / 2.5 |

Коэффициенты относятся к целым стенам; повреждение может увеличить вероятность пробития.
`tests/wall-materials.mjs` проверяет 28 000 выстрелов в бетон, кирпич и мешки с обеих сторон.
Числа — стартовые гипотезы для плейтеста; `tests/walls.mjs` сравнивает результаты с конфигом.

Стадии (`stages`): `intact` (≥60 % HP) → `damaged` (≥25 %) → `critical` (≥1 %) → `breach` (0).
Каждая стадия даёт `penetrationBonus` (0 / +0.15 / +0.30 / 1) и `coverMult` (1 / 0.75 / 0.5 / 0).

## 4. Проёмы (`wall_materials.json → openings`)

| Тип | движение | пули | обзор | ширина | примечание |
|---|---|---|---|---|---|
| `door` | да (открыта) / нет (закрыта) | да / нет | да / нет | 32–64 | закрытая дверь выламывается (`breakHp`) |
| `gate` | да | да | да | 96 | ворота для техники; пехота проходит |
| `window` | нет | да (сквозь) | частично (factor 0.5) | 32 | стрелять можно, пройти нельзя |
| `embrasure` | нет | редко: `penetrationFactor` 0.15 | частично 0.7 | 20–24 | бойница |
| `breach` | да | да | да | 40 | появляется после разрушения сегмента |

Правила двери:
- открывается юниту в радиусе `doorOpenRadius` (48 px) — обеим фракциям одинаково;
- закрывается автоматически через `doorAutoCloseSeconds` (12 с), если рядом и внутри никого нет;
- `unseal()` — если внутри здания кто-то есть, закрытые двери принудительно открываются на 6 с
  (никаких запертых юнитов);
- закрытая дверь останавливает пулю и помечается `breakDoor: true` — стрелявший выламывает её
  `walls.breakDoorHit()` (HP из `breakHp`).

## 5. Укрытие

- На каждый сегмент генерируются точки укрытия с нормалью (`cover_points`) и слоты гарнизона у окон.
- `walls.coverAt(x, y, fromX, fromY)` — 3 луча (центр + 2 бока, `raySpreadPx`) от стрелка к точке;
  доля перекрытых лучей × защита класса высоты × множитель стойки; кэш `cacheSeconds` 0.35.
- `world.bestCover()` сначала спрашивает `walls.coverSpotsNear()`, оценка
  `0.35·дальность + 0.25·выравнивание + 0.5·coverValue`, где выравнивание = `0.5 + 0.5·cos(угол угрозы → нормаль)`
  (укрытие, повёрнутое к угрозе, лучше). Только затем — прежний перебор зданий.
- Стойки: `stanceMult(класс)` берётся из `cover.json → heightClasses` (среднее стойка/присед,
  нормировано по лучшему классу): класс 3 → 1.00, класс 2 → 0.88, класс 1 → 0.52.

## 6. Урон и разрушение

- `walls.bulletRay()` возвращает `{ blocked, penetrated, material, damageMult, breakDoor, hitPoint, segId }`.
  При пробивании урон по цели умножается на `damageMult` материала (`damageLoss`).
- `walls.damageSegment(building, segId, amount, weaponId)` — структурный множитель
  (`structural.bullet|shell`), стадии, при HP ≤ 0 сегмент становится проломом:
  событие `wallBreach`, здание теряет 12 % HP, кэш укрытий и навигация инвалидируются.
- `walls.damageNearest(building, amount, fromX, fromY, weaponId)` — для взрывов/снарядов.
- `walls.repair(building, amount)` — стоимость в материалах `repairMaterialsPerHp` (`nav_budget.json`).
- **Обновление навигации ≤ 1 с**: пролом ставит здание в очередь `queueNavRebuild`, `walls.update()`
  разбирает её в бюджете `nav_budget.json` (`chunk`, `maxChunksPerFrame`, `budgetMs`).
  Измерено: 0.05 с симуляции (`tests/walls.mjs`, тест 8).

## 7. Навигация и движение

- `world._markWallTiles()` растеризует сегменты в `walk[]` с запасом `pad` 6 px, уважая `blocksMove`
  сегмента, проломы и открытые проёмы.
- `Nav.buildGrid()`: при включённом флаге клетка открыта, если её центр проходим и **не меньше двух**
  углов (дверь 32 px уже клетки 64 px); при выключенном — прежнее правило «центр + все 4 угла».
- `units.moveUnit()`:
  - `doorsForUnit()` — открыть дверь перед юнитом;
  - `wallFree()` добавлен в `free()`;
  - `doorWaypoint()` — если юнит и цель разделены стеной, направление ведёт к ближайшей двери/воротам
    (обычный шаг, никаких телепортов);
  - антизастревание: шаговый «крюк» в свободную точку (`antiStuck.detour*`) и шаговое выталкивание
    из непроходимой клетки (`antiStuck.push*`) — не быстрее `pushSpeedMult` × скорости;
  - радиус прибытия — `nav_budget.json → arriveRadius` (`walls` 34 / `legacy` 24).
- Спавн: `spawnPos()` при включённых стенах ставит юнита за контуром (`walls.state().outline.size/2 + 26`),
  при выключенных — ровно прежняя формула (это важно для проверки «флаг off = прежнее поведение»).

## 8. ИИ

- Укрытия: и солдаты, и отряды используют `world.bestCover()` (общий код для фракций).
- Гарнизон: `walls.garrisonSlotsNear()` → до `garrison.share` (0.6) бойцов отряда, держащего здание
  своей фракции, занимают слоты у окон/бойниц (`cover.json → garrison`).
- Проломы: растеризованные проломы есть в `walk[]`, поэтому flow-field сам ведёт отряды в пролом;
  двери/ворота — через `doorWaypoint()`.
- Техника: `blocksMove` для машин не пропускает `door`/`window`/`embrasure` (только `gate`), радиус
  танка больше двери — танк ищет ворота или пролом.
- Симметрия: модуль `Walls` не знает про фракции; тест 10 сравнивает пробивание/геометрию зданий
  обеих фракций (расхождение ≤ 0.003 при допуске 0.05).

## 9. API (`src/sim/walls.js`)

```
enabled(), destructionEnabled()
state(building) → { segs, doors, outline, ... } | null
blocksMove(x, y, radius, mover) → bool
bulletRay(x1, y1, x2, y2, weaponId, rng) → { blocked, penetrated?, through?, damageMult?, breakDoor?, hitPoint, material, segId }
blocksVision(x1, y1, x2, y2) → bool
coverAt(x, y, fromX, fromY) → { value, class, full, partial }
coverSpotsNear(x, y, radius, faction), garrisonSlotsNear(x, y, radius)
interiorSpot(building, x, y), buildingAtPoint(x, y), doorWaypoint(u, gx, gy)
damageSegment(b, segId, amount, weaponId), damageNearest(b, amount, x, y, weaponId), repair(b, amount)
breakDoorHit(b, opening, amount), unseal()
openDoor/closeDoor/toggleDoor/doorsForUnit(u)
serialize(), applySaved(saved), queueNavRebuild(b), flushNav(), debugInfo()
```

Статистика для отладки: `walls.stats` — попадания/пробивания/остановленные пули/проломы,
счётчики вызовов и время `update()` (мс), `renderer.showWallsDebug` (клавиша **F4**) — точки укрытий,
слоты гарнизона, id и HP сегментов.

## 10. Сохранения

`save.js` пишет `walls: { "<type>:<x>:<y>": { segs: [{id, hp, breached}], doors: {id: {state}} } }`.
Старые сейвы без блока читаются: `applySaved(undefined)` → 0, поведение прежнее. Версия сейва не менялась.

## 11. Производительность (измерено)

| Метрика | Значение | Бюджет |
|---|---|---|
| `walls.update()` | 0.026 мс/тик | — |
| `blocksMove` | 0.55 мкс | — |
| `bulletRay` | 3.15 мкс | — |
| стены всего (392 юнита, 114 запросов/тик) | **0.096 мс/кадр** | ≤ 0.5 |
| тик 392 юнита | 3.43 мс | — |
| тик 400 юнитов | 2.44 мс (410 FPS симуляции) | ≥ 60 FPS |
| тик 500 юнитов | 2.54 мс (394 FPS) | ≥ 45 FPS |
| соук 30 мин | плато 7.7–8.4 МБ после 2-й минуты | ≤ +5 % |
