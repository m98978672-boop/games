# AGENTS.md — карта репозитория для нейросетей и ИИ-агентов

Если ты — другая нейросеть, открывшая репозиторий `m98978672-boop/games`, начни отсюда.

## 1. Движок `RatCore` (активное проектирование)
Вся проектная документация, инструменты, формулы, алгоритмы и папки общения нейросетей лежат в папке **`ratcore/`**:

| Файл / папка | Что внутри |
|---|---|
| [`ratcore/README.md`](./ratcore/README.md) | Главный вход и обзор `RatCore` |
| [`ratcore/INDEX.json`](./ratcore/INDEX.json) | Машиночитаемый индекс всех документов, 36 веток v2.0, 14 опциональных пакетов, 185 формул и 125 алгоритмов |
| [`ratcore/SPEC.md`](./ratcore/SPEC.md) | Полная спецификация движка (v0.9-draft), `ToolGuard` (5 барьеров), модули по выбору (`Zero-Cost Opt-In`, `RC-108`), коды `RC-100..999`, план этапов |
| [`ratcore/AI_CONTRACT.md`](./ratcore/AI_CONTRACT.md) | Обязательный свод правил для всех ИИ, работающих с `RatCore` |
| [`ratcore/TOOLS.md`](./ratcore/TOOLS.md) | Все **36 усиленных веток инструментов v2.0** + `tools.discover` + `RatStudio` + **3-уровневая система 14 модулей по выбору (`packs` и пресеты)** |
| [`ratcore/ALGORITHMS.md`](./ratcore/ALGORITHMS.md) | Все **185 формул (`F-01..F-185`)** и **125 алгоритмов (`A-01..A-125`)** |
| [`ratcore/COMPRESSION.md`](./ratcore/COMPRESSION.md) | 12-уровневый стек сжатия/плавности + `ratcore-wire/2` + `Power & Thermal Guard (40/60/75 %)` + `Dynamic Resolution` + `Self-Healing` + `pack:webgpu`/`pack:wasm-accel` |
| [`ratcore/BRIDGE.md`](./ratcore/BRIDGE.md) | Соединение `RatCore` с Three.js, Godot 4, Canvas 2D, `pereplet-prototype`, другими `RatCore` и внешними ИИ (поверх `ratcore-wire/2`) |
| [`ratcore/DEVLOG.md`](./ratcore/DEVLOG.md) | Инженерный дневник принятых решений (Записи `#001..#010`) |
| [`ratcore/comms/`](./ratcore/comms/README.md) | **Папки общения между нейросетями** (`registry`, `channels`, `inbox`, `outbox`, `tasks`, `handoffs`, `bridges`) |
| [`ratcore/reports/`](./ratcore/reports/) | Баг-трекер (`bugs/`), аудиты `ToolGuard` (`audits/`) и сводки (`summaries/`) |

### Важные законы от владельца репозитория
1. **`RatCore` подключён ко всем разделам Games.** Витрина, новости, мессенджер, портал разработчиков и **каждая** игра грузят движок через [`shared/engine.js`](./shared/engine.js) + [`shared/engine-bootstrap.js`](./shared/engine-bootstrap.js). Реестр разделов — [`shared/engine-registry.json`](./shared/engine-registry.json), проверка покрытия — `node game-base/tests/engine.mjs` (обязательный шаг CI).
2. **Новый раздел без движка не пройдёт CI.** Любая новая папка с `index.html` обязана добавить `<script src="../shared/engine.js"></script>` (до своих скриптов) и `<script src="../shared/engine-bootstrap.js" defer></script>`, а также строку в реестр.
3. **Все модели, меши и текстуры в `RatCore` обязаны создаваться только через `RatCore.tools.*`** (проверяется в коде через `ToolGuard`).
4. **ГПСЧ и часы — из ядра движка.** Свои копии `mulberry32` в играх переведены на `RatCore.createRng` (алгоритм идентичен, все сохранения и сиды совместимы бит-в-бит). Новые игры берут случайность и фиксированный шаг из `window.GamesEngine.rng(seed)` / `window.GamesEngine.clock()`.
5. **Мосты с другими движками — только через `BRIDGE.md`.** Реализованы: [`route-engine/src/ratcore-bridge.mjs`](./route-engine/src/ratcore-bridge.mjs) (маршруты по графу движка) и [`pereplet-prototype/ratcore-bridge.mjs`](./pereplet-prototype/ratcore-bridge.mjs) (правила «Переплёта» на снимке мира).
6. **Общение с другими ИИ** — регистрируйся в `ratcore/comms/registry/agents.json` и оставляй сообщения в `ratcore/comms/channels/general/` или `ratcore/comms/inbox/<agentId>/`.

### Как подключить движок к новой странице

```html
<!-- 1. Движок — ДО игровых/прикладных скриптов -->
<script src="../shared/engine.js"></script>
<!-- 2. Плашка с версией в едином HUD-стиле (любое место страницы) -->
<div class="engine-hud-slot" data-engine-badge></div>
<script src="../shared/engine-bootstrap.js" defer></script>
```

```js
// Случайность и фиксированный шаг — из ядра, а не свои копии
const rand = window.GamesEngine.rng('my-game-seed');
const clock = window.GamesEngine.clock({ tickHz: 60 });
clock.advance(dt, (step) => { /* один шаг симуляции */ });
// Полноценный экземпляр движка (по требованию, лениво)
window.GamesEngine.create({ preset: 'survival', packs: ['pack:studio'] })
  .onReady((engine) => engine.engine.tools.build.fromRecipe(/* ... */));
```

Сборка браузерного бандла после правок `ratcore/src/*`:
`node ratcore/tools/build-browser-bundle.mjs` (проверка актуальности: `--check`).

## 2. Витрина `Games` (`index.html` + `site/`)
- Источник витрины: `site/index.html`, `site/site.css`, `site/games-data.js`, `site/portal.js`, `site/community-games.json`.
- После правки `site/index.html` синхронизируй корень командой `node site/sync-root.mjs`.
- Проверки витрины: `node site/tests/community-catalog.mjs`, `node site/tests/portal.mjs`, `node tools/bughunt/bughunt.mjs --play --only site`.
