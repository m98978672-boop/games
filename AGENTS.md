# AGENTS.md — карта репозитория для нейросетей и ИИ-агентов

Если ты — другая нейросеть, открывшая репозиторий `m98978672-boop/games`, начни отсюда.

## 1. Движок `RatCore` (активное проектирование)
Вся проектная документация, инструменты, формулы, алгоритмы и папки общения нейросетей лежат в папке **`ratcore/`**:

| Файл / папка | Что внутри |
|---|---|
| [`ratcore/README.md`](./ratcore/README.md) | Главный вход и обзор `RatCore` |
| [`ratcore/INDEX.json`](./ratcore/INDEX.json) | Машиночитаемый индекс всех документов, 25 веток инструментов, 112 формул и 74 алгоритмов |
| [`ratcore/SPEC.md`](./ratcore/SPEC.md) | Полная спецификация движка, `ToolGuard` (5 барьеров в коде), коды ошибок `RC-100..999`, план этапов |
| [`ratcore/AI_CONTRACT.md`](./ratcore/AI_CONTRACT.md) | Обязательный свод правил для всех ИИ, работающих с `RatCore` |
| [`ratcore/TOOLS.md`](./ratcore/TOOLS.md) | Все **25 веток инструментов** `RatCore.tools.*` на все случаи жизни + шпаргалка жанров |
| [`ratcore/ALGORITHMS.md`](./ratcore/ALGORITHMS.md) | Все **112 формул (`F-01..F-112`)** и **74 алгоритма (`A-01..A-74`)** |
| [`ratcore/COMPRESSION.md`](./ratcore/COMPRESSION.md) | 7-уровневая система сжатия невидимой информации (Minecraft `Paletted 16³`, `Cave Culling`, `SVDAG`, `Hi-Z`, `LOD`, `Catch-up`) |
| [`ratcore/BRIDGE.md`](./ratcore/BRIDGE.md) | Соединение `RatCore` с Three.js, Godot 4, Canvas 2D, `pereplet-prototype`, другими `RatCore` и внешними ИИ |
| [`ratcore/DEVLOG.md`](./ratcore/DEVLOG.md) | Инженерный дневник принятых решений (Записи `#001..#005`) |
| [`ratcore/comms/`](./ratcore/comms/README.md) | **Папки общения между нейросетями** (`registry`, `channels`, `inbox`, `outbox`, `tasks`, `handoffs`, `bridges`) |
| [`ratcore/reports/`](./ratcore/reports/) | Баг-трекер (`bugs/`), аудиты `ToolGuard` (`audits/`) и сводки (`summaries/`) |

### Важные законы от владельца репозитория
1. **Не писать код движка `RatCore` без прямой команды владельца** — сейчас идёт этап документации и проектирования.
2. **Пока не интегрировать `RatCore` в витрину `Games`** (`index.html` / `site/`).
3. **Все модели, меши и текстуры в `RatCore` обязаны создаваться только через `RatCore.tools.*`** (проверяется в коде через `ToolGuard`).
4. **Общение с другими ИИ** — регистрируйся в `ratcore/comms/registry/agents.json` и оставляй сообщения в `ratcore/comms/channels/general/` или `ratcore/comms/inbox/<agentId>/`.

## 2. Витрина `Games` (`index.html` + `site/`)
- Источник витрины: `site/index.html`, `site/site.css`, `site/games-data.js`, `site/portal.js`, `site/community-games.json`.
- После правки `site/index.html` синхронизируй корень командой `node site/sync-root.mjs`.
- Проверки витрины: `node site/tests/community-catalog.mjs`, `node site/tests/portal.mjs`, `node tools/bughunt/bughunt.mjs --play --only site`.
