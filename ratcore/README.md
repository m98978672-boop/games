# RatCore v1.0.0 — собственный 2D/3D-движок с инструментами ИИ и `ToolGuard`

> **Статус:** **Релиз `v1.0.0` полностью реализован и протестирован** (**47 ES-модулей**, **0 внешних зависимостей**, **10/10 базовых веток ядра**, **10/10 стандартных жанровых модулей**, **14/14 опциональных пакетов по выбору `Zero-Cost Opt-In`**, **39 активных веток `RatCore.tools.*`**, **89 инструментов в `tools-manifest.json`**, **7/7 зелёных тестовых наборов в CI**, живая песочница с `RatStudio Dev-Overlay` и первая 3D-игра **«Стража Цитадели»**).  
> **Подключение ко всем разделам Games:** по решению владельца движок теперь используется **везде** — витрина, новости, мессенджер, портал разработчиков и каждая игра.
> Для браузера модули собираются в один классический скрипт [`ratcore.bundle.js`](./ratcore.bundle.js) (`48` модулей, `node ratcore/tools/build-browser-bundle.mjs`), а единая точка входа — [`shared/engine.js`](../shared/engine.js) + [`shared/engine-bootstrap.js`](../shared/engine-bootstrap.js). Реестр разделов и обязательная проверка покрытия: [`shared/engine-registry.json`](../shared/engine-registry.json) и `node game-base/tests/engine.mjs`.
> **Безопасность сохранена:** игры получают только собранный бандл и публичный API (`createEngine`, `createRng`, `createClock`, `tools.*`), внутренние модули `ratcore/src/**` напрямую не подключаются, `ToolGuard` не ослаблен.

---

## Быстрый старт (Node.js 22 и браузер без сборщиков)

```js
import { createEngine } from './ratcore.js';

const engine = createEngine({
  preset: 'survival',
  packs: ['pack:destruction', 'pack:voice', 'pack:companion', 'pack:studio'],
  seed: 2026,
});

// 100 % процедурная геометрия через запечатанный ToolGuard
const tower = engine.tools.build.fromRecipe({
  modelId: 'citadel',
  ops: [
    { tool: 'build.primitive', args: { shape: 'box', w: 3, h: 4, d: 3, color: '#60a5fa' } },
    { tool: 'build.primitive', args: { shape: 'roof', w: 3.4, h: 2, d: 3.4, color: '#f59e0b' }, offset: [0, 4, 0] },
  ],
}).data;

engine.tools.build.placeEntity({ id: 'citadel_main', mesh: tower, x: 0, y: 0, h: 1 });
const frame = engine.tools.look.capture({ format: 'ascii' });
const packed = engine.tools.save.exportWire2(); // ratcore-wire/2 + FastCDC + CRC32
```

### Запуск живых стендов и тестов

```bash
# Запустить все 7 тестовых наборов RatCore v1.0.0
node ratcore/tests/tool-contract.mjs
node ratcore/tests/stage1.mjs
node ratcore/tests/stage2.mjs
node ratcore/tests/stage3.mjs
node ratcore/tests/stage4.mjs
node ratcore/tests/stage5.mjs
node ratcore/tests/demo-game.mjs

# Поднять изолированный dev-сервер для песочницы и 3D-игры (http://0.0.0.0:8081)
node ratcore/playground/dev-server.mjs
# Песочница + RatStudio:  /ratcore/playground/index.html
# 3D-игра «Стража Цитадели»: /ratcore/demos/citadel-watch/index.html
```

---

## Архитектура (`47` модулей, 3-уровневый Zero-Cost Opt-In)

| Уровень | Состав | Код при отключении |
|---|---|---|
| **Уровень 0 · Ядро (`core`, всегда включено)** | `build`, `move`, `remove`, `watch`, `look` (Software 3D + WebGL2 + Async Pre-Warm), `see` (Object-ID), `input` (ремап, буфер, запись/реплей), `ui` (декларативный HUD, тосты, диалоги), `save` (`JSON` + `RCW2` + COW Timeline), `stream` (`CoreGovernor 40/60/75 %` + `RatCoreWorkerPool`), 5-барьерный `ToolGuard` | — |
| **Уровень 1 · 10 стандартных модулей (`modules`)** | `anim` (2-костная IK + Verlet), `phys`, `nav` (A* + RVO), `env` (день/ночь + погода), `fx` (SoA частицы + декали + shake), `ai` (Utility + GOAP + NLU), `sim` (экономика + крафт + лимит веса), `audio` (PCM 0 КБ), `hear` (3D-слух), `test` (инварианты + фаззер + автобаланс) | `RC-108` (`0 Б` RAM/CPU) |
| **Уровень 2 · 14 опциональных пакетов (`packs`)** | `pack:ai-team`, `pack:destruction`, `pack:multiplayer`, `pack:narrative`, `pack:ecology`, `pack:styles`, `pack:webgpu`, `pack:wasm-accel` (442 Б WASM + SIMD v128), `pack:mods` (`.ratmod.rcw2`), `pack:cinema` (рельсы + авто-обложка 16:9), `pack:voice` (3-формантный PCM + виземы), `pack:companion`, `pack:assist` (дальтонизм 3×3 + субтитры + 1 рука), `pack:studio` (`RatStudio`, COW «Машина времени», Автобаланс, экспорт `.html` `< 300 КБ`) | `RC-108` (`0 Б` RAM/CPU) |

---

## Карта документов и каталогов

| Файл / Папка | Назначение |
|---|---|
| [`ratcore.js`](./ratcore.js) | Главная публичная ES-точка входа `RatCore v1.0.0` |
| [`tools-manifest.json`](./tools-manifest.json) | Офлайн-манифест **89 инструментов** для BM25-поиска `tools.discover()` |
| [`INDEX.json`](./INDEX.json) | Машиночитаемый реестр всех 47 модулей, 7 тестов, 14 пакетов и облачной экосистемы |
| [`playground/index.html`](./playground/index.html) | Интерактивная 3D-песочница `v1.0.0` с живым **RatStudio Dev-Overlay** |
| [`demos/citadel-watch/index.html`](./demos/citadel-watch/index.html) | Первая полноценная 3D-игра на `RatCore v1.0.0` — **«Стража Цитадели»** |
| [`SPEC.md`](./SPEC.md) | Главная архитектурная спецификация, 5-барьерный `ToolGuard`, решения `D-01..D-17` |
| [`AI_CONTRACT.md`](./AI_CONTRACT.md) | Строгий контракт для ИИ: запрет обхода `RatCore.tools.*`, правила `BridgeGuard` |
| [`TOOLS.md`](./TOOLS.md) | Каталог всех веток инструментов, пресетов и рецептов по жанрам |
| [`ALGORITHMS.md`](./ALGORITHMS.md) | 185 формул (`F-01..F-185`) и 125 алгоритмов (`A-01..A-125`) |
| [`COMPRESSION.md`](./COMPRESSION.md) | 12-уровневый стек сжатия, `ratcore-wire/2`, `CoreGovernor 40/60/75 %`, WebGPU/WASM |
| [`BRIDGE.md`](./BRIDGE.md) | Протокол моста с Three.js, Godot 4 `.tscn`, Canvas 2D, `pereplet-prototype/` и ИИ |
| [`DEVLOG.md`](./DEVLOG.md) | Полный инженерный дневник (`#001..#016`) |
| [`comms/`](./comms/README.md) | Обмен сообщениями, задачами и сменами (`handoffs`) между ИИ-агентами |
