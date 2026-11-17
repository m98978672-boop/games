# RatMes — Единый мессенджер на `RatMes Engine`

**RatMes** — быстрый local-first мессенджер-комбайн с собственным E2EE-чатом, прямым **LAN / P2P Mesh** без интернета, мостами к популярным мессенджерам (VK, MAX, Telegram, WhatsApp, Discord, Viber, Signal, WeChat, LINE, KakaoTalk, Zalo + живые API-драйверы Telegram/Discord/Matrix/VK/Webhook), профилями стран (`RU` по умолчанию + 9 мировых профилей) и **вечным файловым резервом `RatMes-Vault/`**.

Полное ТЗ и каталог инструментов:
- [`docs/ratmes-tz.md`](../docs/ratmes-tz.md) — техническое задание (разделы 1–11).
- [`docs/ratmes-tools.md`](../docs/ratmes-tools.md) — базовые 12 веток `RatMes.tools.*` и 5-барьерный `TransferGuard`.

---

## Быстрый старт (Node.js 22, 0 внешних зависимостей)

```bash
cd ratmes
npm start                         # автономный RatMes Agent (http://0.0.0.0:8787)
RATMES_SERVE_GAMES=1 npm start    # единый портал Games с вкладкой «Общение» (/ + /ratmes/)
```

Локальный ПК-помощник **RatMes Agent** запускается на `http://0.0.0.0:8787` и создаёт реальную папку `ratmes/RatMes-Vault/` со всеми чатами (`.jsonl` + читаемый `readable.txt` + `media/` + `outbox/pending.jsonl` + `meta/workspace.json`). В портале **Games** (`index.html` и `site/index.html`) RatMes встроен прямо во вкладку **«Общение»** и автоматически подключается к облачной синхронизации **Supabase (`games-cloud-save`)** через publishable key и RLS даже на статическом сайте.

---

## Тесты и статический аудит TransferGuard

```bash
cd ratmes
npm test         # 4 набора тестов: engine + server + 2-node live P2P + 1,000-msg BM25/scheduler stress
npm run audit    # статический сканер RM-107 (0 нарушений по всему дереву ratmes/)
```

---

## Подсистемы и архитектура (15 веток `RatMes.tools.*` + 9 подключённых облаков)

1. **5-барьерный `TransferGuard` + `SecretVault` + `PayloadVault` (`src/core/`):**
   Вся передача строго через инструменты `pack → validate → vault.append → transfer.enqueue → transfer.dispatch`; токены и ключи не покидают `WeakMap`; статический аудитор `RM-107` проверяет каждый `.js`/`.mjs` файл.
2. **Вечный файловый резерв `RatMes-Vault/` (`src/engine/vault-store.mjs`):**
   Атомарная краш-безопасная запись (`tmp → fsync → rename → fsync(dir)`), автолечение оборванных хвостов `vault.healTail` (`RM-201`), пересборка индекса `vault.rebuildIndex` (`RM-203`) и переносимый Deflate-экспорт/импорт с дедупликацией (`pack.bundle` / `vault.importBundle`).
3. **Полнотекстовый поиск BM25 (`src/engine/search-index.mjs`, ветка `search.*`):**
   Инвертированный индекс с русским/латинским стеммингом, префиксным расширением, точными фразами в кавычках и фильтрами (`net:`, `from:`, `has:file`, `has:voice`, `pinned:true`) — **~1 мс на 1 000 сообщений**, доступен по **`Ctrl+K`**.
4. **Планировщик приоритетов, AIMD и Circuit Breaker (`src/engine/net-scheduler.mjs`):**
   Устраняет Head-of-Line Blocking (`urgent > high > normal > bulk`), регулирует окно перегрузки AIMD, автоматически переводит отвалившийся маршрут на План Б через `CLOSED → OPEN → HALF_OPEN` и качает Outbox с Full-Jitter backoff.
5. **3-фазный движок времени (`src/engine/chrono.mjs`) и память `S3-FIFO` (`src/engine/cache-s3fifo.mjs`):**
   Матрица Маркова («Прошлое»), прогрев топ-3 чатов с `Backpressure RM-501` («Будущее»), 4 фазы сна + DAG-уборка + гибернация редких мостов до `64 Б`.
6. **Живые внешние мосты и прямой LAN/P2P Mesh (`src/agent/live-bridges.mjs`, `src/agent/lan-mesh.mjs`):**
   - Подключение реальных **Telegram Bot API**, **Discord Webhook**, **Matrix Client-Server API**, **VK API** и произвольных HTTP Webhook (входящие хуки `/api/hooks/:network`, токены в `SecretVault`).
   - Прямой обмен **AES-256-GCM + HMAC** между двумя живыми `RatMes Agent` в локальной сети (`/api/p2p/connect`, `/api/p2p/envelope`, `relay.lanSend`).
7. **Богатый интерфейс (`index.html`, `src/web/`):**
   Папки чатов, черновики, счётчики непрочитанных, закреплённые сообщения, реакции, правка (`↑`), мягкое удаление (tombstone), пересылка между любыми сетями, безопасный Markdown-lite без `innerHTML`, голосовые WAV-заметки с волной, inline-превью фото/аудио, график телеметрии на `<canvas>`, визуальная карта чанков и **интерактивная консоль `RatMes.tools.*`**.
