# RatMes Engine — полный каталог инструментов и конвейер «Передача через инструменты» (`docs/ratmes-tools.md`)

**Версия:** 1.0-draft (2026-11-16)  
**Статус:** архитектурная спецификация (без кода — по закону очереди владельца и `ratcore/SPEC.md` R-0.2)  
**Фундамент:** облегчённый профиль **`RatCore-App`** (10 системных веток из 25 веток `RatCore`, ветка `arena/5b278e22-games` / PR #250)  
**Связанные документы:** [`ratmes-tz.md`](./ratmes-tz.md) (ТЗ v1.0, Разделы 1–11) · `ratcore/TOOLS.md` · `ratcore/BRIDGE.md` · `ratcore/COMPRESSION.md`  
**Главный закон:** **Вся передача любых данных — сообщений, файлов, медиа, синхронизации, сигналов мостов, LAN-обмена и бэкапов — идёт строго через инструменты `RatMes.tools.*` и барьер `TransferGuard`.**

---

## 0. Единый контракт вызова (100 % совместимость с `RatCore.tools.*`)

Чтобы `RatMes Engine` и `RatCore` работали как единый организм, каждый инструмент `RatMes.tools.<группа>.<метод>(args, ctx?)` соблюдает **тот же контракт**, что и `RatCore.tools.*`:

- **Контекст вызова (`ctx`):** `{ actorId, role, traceId, countryProfile, dryRun }`.
- **Единый ответ:** `{ ok, tool, data, error: { code, message, hint } | null, tick, costMs, traceId }`.
- **Коды ошибок:** фундамент возвращает родные `RC-100..999`, прикладной слой и передача — `RM-100..699`.
- **Изоляция секретов и данных:** в журнал `trace` и ошибки **никогда** не попадают тексты переписок, ключи E2EE и токены мостов — только метаданные (`envelopeId`, `sizeBytes`, `route`, `stage`, `costMs`).

### Пять корневых служебных методов шлюза `RatMes.tools.*`

| Метод | Назначение |
|---|---|
| `tools.help(group?)` | Самодокументирующийся справочник всех **12 веток `RatMes`** + **10 подключённых системных веток `RatCore-App`**. |
| `tools.whoami()` | Показывает активного актора (`ui`, `pc-agent`, `worker`, `bridge:telegram`, `ai-agent`), его роль и список разрешённых веток. |
| `tools.asActor(actorId, role)` | Выдаёт ограниченный фасад: например, мост `bridge:discord` имеет право работать только со своим `SessionHandle` и каналом `transfer`, но не может читать чужие чаты в `vault.*`. |
| `tools.pipeline(ops)` | Атомарная цепочка инструментов (аналог `RatCore.tools.batch`): если любой шаг передачи провалился, промежуточное состояние откатывается без мусора и дублей. |
| `tools.trace(limit?)` | Журнал последних вызовов и стадий передачи для диагностики «почему зависло» и воспроизводимых баг-репортов. |

---

## 1. Железный закон «Вся передача через инструменты» (`TransferGuard` — 5 барьеров)

В `RatCore` 5 барьеров `ToolGuard` запрещают создавать «сырую» 3D-геометрию в обход `tools.build.*`.  
В `RatMes Engine` **тот же механизм `Provenance Seal` + закрытое хранилище** превращается в **`TransferGuard`** — 5 барьеров для любой передачи:

1. **Барьер 1 — Запрет «сырой трубы» (`RM-104`, `RAW_TRANSPORT_FORBIDDEN`):**
   - Ни UI, ни плагины, ни фоновые скрипты не имеют права напрямую дёргать сырой `fetch`, `WebSocket.send`, сетевой сокет или запись в папку `RatMes-Vault/`.
   - Единственная законная дорога наружу и между процессами — инструменты `tools.pack.*` → `tools.transfer.*` / `tools.relay.*`.
2. **Барьер 2 — Запечатанный конверт (`SealedEnvelopeHandle`, `RM-105`):**
   - Инструменты `tools.pack.*` ставят на каждый пакет внутреннюю неэкспортируемую печать (`Provenance Seal`): кто создал, `idempotencyKey`, хеш содержимого SHA-256, и прошёл ли конверт проверку `pack.validate`.
   - Попытка просунуть в `transfer.dispatch` или `relay.pushDelta` самодельный объект без печати немедленно отклоняется и пишется в аудит.
3. **Барьер 3 — Сначала вечный файл и `Outbox`, потом сеть (`RM-103`, `BYPASS_OUTBOX_FORBIDDEN`):**
   - Пользовательское сообщение или файл физически не могут уйти в сеть или мост, пока на конверте не стоит двойная отметка: «атомарно сохранено в `RatMes-Vault/` (`vault.append`)» и «поставлено в `Outbox` (`transfer.enqueue`)».
   - Следствие: **ни одно отправленное сообщение не может бесследно исчезнуть при обрыве VPN, сбое моста или выключении света.**
4. **Барьер 4 — Запрет утечки секретов (`SecretVault`, `RM-102`, `SECRET_LEAK_BLOCKED`):**
   - Приватные ключи E2EE, куки WhatsApp, сессии Telegram и токены VK/MAX заперты внутри закрытого `SecretVault` (наследник `AssetVault` из `RatCore`).
   - В инструменты передачи уходят только замороженные непрозрачные хэндлы (`SessionHandle`, `KeyHandle`), а сама подпись/шифрование происходит внутри закрытого контура.
5. **Барьер 5 — Статический аудитор + самодокументирующиеся ошибки (`RM-107`):**
   - Поверх `code-auditor` из `RatCore` проверяется код всех модулей и плагинов на попытки обхода шлюза передачи. Каждая ошибка `RM-*` возвращает ясную причину и подсказку, каким инструментом пользоваться.

---

## 2. Все 12 веток инструментов `RatMes.tools.*`

### Слой А — Конвейер передачи (4 ветки)

#### 1. `tools.pack.*` — Упаковка, нарезка и проверка конвертов *(точка входа любой передачи)*
| Инструмент | Что принимает | Что делает | Что возвращает |
|---|---|---|---|
| `pack.text` | `{ chatId, text, format?, replyTo?, mentions? }` | Присваивает `UUIDv7` + метку `HLC`, нормализует текст, вешает печать `TransferGuard`. | `EnvelopeHandle` |
| `pack.reply` | `{ chatId, targetMsgId, text }` | Упаковывает ответ с привязкой к оригинальному ID (учитывает карту ID внешних мостов). | `EnvelopeHandle` |
| `pack.forward` | `{ fromChatId, msgIds[], toChatId, hideAuthor? }` | Упаковывает пересылку между чатами (в том числе кросс-мессенджерно: например, из Telegram в VK или родной RatMes). | `EnvelopeHandle[]` |
| `pack.media` | `{ chatId, sourceRef, kind: 'image'\|'video'\|'voice'\|'file', caption?, compress? }` | Делает превью в `worker`, считает SHA-256, режет файл на чанки (64–256 КБ) для докачки, кладёт байты в `PayloadVault`. | `AttachmentHandle` + `EnvelopeHandle` |
| `pack.control` | `{ chatId, kind: 'read'\|'edit'\|'delete'\|'react'\|'typing', payload }` | Упаковывает лёгкий служебный сигнал (включая мягкое удаление-надгробие `tombstone`). | `ControlEnvelopeHandle` |
| `pack.bundle` | `{ scope: 'chat'\|'vault'\|'delta', items[], compress?: 'deflate' }` | Собирает переносимый пакет с контрольной суммой (`RatCore.tools.stream` `Deflate` + `save` `F-97`) для переноса архива или пакетной синхронизации. | `BundleHandle` |
| `pack.validate` | `{ envelope, targetNetwork }` | **Обязательные ворота перед передачей:** сверяет лимиты длины/веса целевой сети (`connect.capabilities`), целостность хешей и печать `TransferGuard`. | `{ valid, validatedEnvelope, warnings[] }` |

#### 2. `tools.transfer.*` — Главная труба передачи *(отправка, докачка, приём, повторы)*
| Инструмент | Что принимает | Что делает | Что возвращает |
|---|---|---|---|
| `transfer.preflight` | `{ envelope, countryProfile? }` | 4-ступенчатая проверка до передачи: 1) сеть, 2) маршрут/VPN для страны, 3) валидность `SessionHandle`, 4) нет ли `Backpressure` / `429`. | `{ ready, routePlan, blockers[] }` |
| `transfer.enqueue` | `{ validatedEnvelope, priority?: 'high'\|'normal'\|'bulk' }` | Атомарно ставит конверт в **Transactional Outbox** с `idempotencyKey` и проверяет, что `vault.append` уже зафиксировал запись на диске (`RM-103`). | `{ transferId, outboxSeq, status: 'queued' }` |
| `transfer.dispatch` | `{ transferId, routePlan? }` | Отправляет запечатанный конверт в целевой канал (`native`, `bridge:<net>`, `lan-p2p`, `file-drop`) внутри супервизора. | `{ transferId, stage, remoteTempId? }` |
| `transfer.streamChunk` | `{ transferId, attachmentHandle, resumeFromChunk? }` | Передаёт тяжёлые медиа/архивы по кускам с проверкой хеша каждого чанка и **автоматической докачкой** с места обрыва VPN или Wi-Fi. | `{ sentChunks, totalChunks, bytesPerSec, done }` |
| `transfer.receive` | `{ sourceChannel, rawPacket, bridgeMeta? }` | **Единые входные ворота** для всех входящих пакетов: проверка подписи/дублей, расшифровка в `worker`, постановка в `gap.*` и атомарная запись в `vault.*`. | `{ msgId, chatId, savedToVault: true }` |
| `transfer.ack` | `{ transferId, ackKind: 'sent'\|'delivered'\|'read'\|'chunk_ok', remoteId?, serverSeq? }` | Подтверждает стадию доставки, связывает локальный `UUIDv7` с внешним ID моста и закрывает задачу в `Outbox`. | `{ transferId, status, outboxCleared }` |
| `transfer.retry` | `{ transferId, reason }` | Планирует умный повтор с детерминированным джиттером (`RatCore.core/math`) и уважением к `Retry-After`. | `{ nextAttemptTick, attemptNo }` |
| `transfer.reroute` | `{ transferId, fallbackMode: 'backup-vpn'\|'lan-p2p'\|'hold-outbox' }` | Переводит застрявшую передачу на «План Б» без пересборки пакета и без потери прогресса чанков. | `{ transferId, newRoute }` |
| `transfer.pause` / `resume` / `cancel` | `{ transferId }` | Мягко ставит крупную передачу на паузу, возобновляет с того же чанка или безопасно отменяет. | `{ transferId, state }` |
| `transfer.inspect` | `{ transferId }` | Показывает точную карту жизни передачи (`vault_saved → outbox → preflight → route → bridge → ack`), задержку и причину ожидания. | `{ stages[], currentStage, blockers[], etaMs }` |

#### 3. `tools.relay.*` — Внутренняя и междвижковая передача *(поверх `RatCore.tools.bridge` / `ratcore-bridge/1`)*
| Инструмент | Что принимает | Что делает | Что возвращает |
|---|---|---|---|
| `relay.handshake` | `{ peerId, transport: 'inproc'\|'worker'\|'broadcast'\|'ws'\|'file', allowGroups }` | Устанавливает защищённое соединение `ratcore-bridge/1` между браузером (PWA), ПК-агентом, вкладками, воркерами и `RatCore`. | `{ linkId, peerCapabilities }` |
| `relay.pushDelta` | `{ linkId, deltaBundle }` | Передаёт только сжатую дельту изменений (`Deflate`), не гоняя целые списки чатов и истории. | `{ packetId, compressedBytes }` |
| `relay.syncHash` | `{ linkId, scope }` | Сверяет `stateHash` (`RatCore F-47`) между браузером и ПК-агентом; при расхождении (`RC-604`) сразу запускает `gap.repair`. | `{ inSync, localHash, peerHash }` |
| `relay.offload` | `{ taskKind: 'encrypt'\|'decrypt'\|'thumb'\|'index'\|'compress', handle }` | Отправляет тяжёлую задачу в `worker`-поток через zero-copy `Transferable ArrayBuffer`, чтобы UI оставался на 60+ FPS. | `{ jobId, resultHandle }` |
| `relay.lanDiscover` | `{ timeoutMs? }` | Ищет устройства с RatMes в локальной сети Wi-Fi / LAN для работы без интернета (идеи Briar). | `{ peers[] }` |
| `relay.lanSend` | `{ peerId, sealedEnvelope }` | Прямая зашифрованная передача конверта или файла между устройствами по локальному Wi-Fi вообще без внешних серверов. | `{ transferId, lanLatencyMs }` |

#### 4. `tools.gap.*` — Порядок сообщений и закрытие «дыр» (`Gap Engine`)
| Инструмент | Что принимает | Что делает | Что возвращает |
|---|---|---|---|
| `gap.check` | `{ chatId, incomingSeq }` | Сверяет номер входящего события с локальным курсором — мгновенно обнаруживает пропуск (`RM-601`). | `{ contiguous, missingRange? }` |
| `gap.repair` | `{ chatId, fromSeq, toSeq, channel }` | Запрашивает через `transfer.*` строго недостающий кусок истории после обрыва VPN или долгого сна. | `{ recoveredCount, newCursor }` |
| `gap.merge` | `{ chatId, localOps[], remoteOps[] }` | Бесконфликтно сливает офлайн-правки, черновики и удаления по `UUIDv7 + HLC + tombstones`. | `{ mergedCount, conflictsResolved }` |
| `gap.checkpoint` | `{ chatId, cursor }` | Сохраняет подтверждённый курсор, чтобы после `DEEP_SLEEP` не качать старую историю заново. | `{ savedCursor }` |

---

### Слой Б — Вечные файлы и закрытая криптография (2 ветки)

#### 5. `tools.vault.*` — Вечный файловый резерв `RatMes-Vault/` + индекс SQLite WAL
| Инструмент | Что принимает | Что делает | Что возвращает |
|---|---|---|---|
| `vault.append` | `{ envelopeHandle }` | Атомарно (`tmp → fsync → rename` / append-only) дописывает сообщение в `.jsonl`, синхронно обновляет читаемый человеком `.txt` и индекс SQLite WAL (< 5 мс). | `{ vaultOffset, txtUpdated, walTick }` |
| `vault.storeMedia` | `{ attachmentHandle, chatId }` | Кладёт вложение в понятную папку `RatMes-Vault/media/<chat>/`, проверяет SHA-256 и дедуплицирует повторы. | `{ relativePath, sha256, deduplicated }` |
| `vault.readPage` | `{ chatId, beforeSeq?, limit? }` | Читает окно сообщений из `HOT`-кэша или SQLite WAL за < 5 мс без блокировки фоновых записей. | `{ messages[], hasMore }` |
| `vault.healTail` | `{ chatId? }` | Находит и безопасно обрезает недописанную строку `.jsonl` после внезапного отключения питания (`RM-201`). | `{ filesChecked, tailsHealed }` |
| `vault.rebuildIndex` | `{ scope: 'chat'\|'all' }` | Полностью пересобирает SQLite-индекс из обычных файлов `RatMes-Vault/` (файлы — первичный источник правды). | `{ messagesIndexed, durationMs }` |
| `vault.verifyIntegrity` | `{ scope }` | Проверяет контрольные суммы (`RatCore.tools.save` `F-97`) файлов и вложений. | `{ clean, damagedFiles[] }` |

#### 6. `tools.crypto.*` — Закрытый контур `SecretVault` и `MessageGuard`
| Инструмент | Что принимает | Что делает | Что возвращает |
|---|---|---|---|
| `crypto.sealEnvelope` | `{ envelopeHandle, keyHandle }` | Сквозное шифрование (MLS RFC 9420 для групп и мультиустройств / Double Ratchet для 1-на-1) в `worker`-потоке. | `SealedCipherHandle` |
| `crypto.openEnvelope` | `{ cipherHandle, keyHandle }` | Проверка подписи и расшифровка входящего конверта без утечки ключей в главный поток. | `DecryptedEnvelopeHandle` |
| `crypto.storeSession` | `{ network, authResult }` | Запирает токен/сессию моста внутри приватного `SecretVault`, выдавая наружу только замороженный `SessionHandle`. | `SessionHandle` |
| `crypto.signRequest` | `{ sessionHandle, requestMeta }` | Подписывает исходящий вызов моста внутри контура, не раскрывая секрет вызывающему коду. | `SignedHeaderHandle` |
| `crypto.verifyTrust` | `{ chatId }` | Проверяет ключи собеседника и честно маркирует уровень шифрования (`E2EE RatMes` / `E2EE Bridge` / `Без E2EE`, как у MAX). | `{ trustLevel, e2ee, warning? }` |
| `crypto.rotateKeys` | `{ scope }` | Плановая ротация ключей и очистка старых эпох в фазе `HOUSEKEEPING`. | `{ rotatedGroups }` |

---

### Слой В — Профили стран и изолированные мосты (2 ветки)

#### 7. `tools.route.*` — Профили стран (`RU` + весь мир) и «План Б»
| Инструмент | Что принимает | Что делает | Что возвращает |
|---|---|---|---|
| `route.setCountry` | `{ countryCode: 'RU'\|'EU'\|'US'\|'TR'\|'CN'\|'IR'\|'AE'\|... }` | Переключает матрицу доступности мессенджеров и подсказок под выбранную страну (`RU` по умолчанию). | `{ countryCode, directNets[], vpnNets[] }` |
| `route.bindProxy` | `{ network, primaryRoute, backupRoute? }` | Привязывает свой VPN/прокси-контур к конкретному мосту (в `RU`: VK/MAX — напрямую; TG/WA/Discord/Viber/Signal — через отдельный маршрут). | `{ network, bound: true }` |
| `route.probe` | `{ network, routeId }` | Тихая проверка доступности и задержки маршрута без лишнего шума. | `{ reachable, rttMs, status }` |
| `route.failover` | `{ network, failedRouteId }` | Переключает трафик на резервный маршрут или в спокойное ожидание `Outbox` (`RM-302` / `RM-303`) и пишет факт в «Прошлое». | `{ activeRoute, mode }` |
| `route.explain` | `{ network }` | Человеческое объяснение для интерфейса, как именно и почему сейчас идёт трафик. | `{ summary, badgeTone }` |

#### 8. `tools.connect.*` — Изолированные акторы-мосты (`Let it crash` + `Lazy Wake`)
| Инструмент | Что принимает | Что делает | Что возвращает |
|---|---|---|---|
| `connect.register` | `{ network, adapterSpec }` | Подключает адаптер сети по единому контракту (собственный RatMes, VK, MAX, Telegram, WhatsApp, Discord, Viber, Signal, WeChat, LINE, KakaoTalk, Zalo и др.). | `{ bridgeId, capabilities }` |
| `connect.authCheck` | `{ bridgeId, sessionHandle }` | Проверяет статус аккаунта и живость сессии до старта тяжёлой синхронизации. | `{ valid, accountState, actionNeeded? }` |
| `connect.wake` | `{ bridgeId, reason }` | Лениво поднимает спящий мост из 64-байтной сводки (`RatCore.tools.stream.catchupRegion`). | `{ bridgeId, ramMb, wakeMs }` |
| `connect.hibernate` | `{ bridgeId }` | Сворачивает неактивный мост (освобождает 50–200 МБ ОЗУ) в 64-байтную сводку (`RatCore.tools.stream.sleepRegion`). | `{ bridgeId, freedMb, summaryBytes }` |
| `connect.supervise` | `{ bridgeId, fault }` | Изолированно перезапускает упавший мост (`RM-403`), не затрагивая остальные сети и `RatMes-Vault/`. | `{ restarted, backoffMs }` |
| `connect.capabilities` | `{ network }` | Отдаёт лимиты и возможности сети (макс. размер файла, длина текста, правки, реакции, E2EE) для `pack.validate`. | `{ maxTextLen, maxFileMb, e2ee, features[] }` |

---

### Слой Г — Время, Память, Сигналы и Самопроверка (4 ветки)

#### 9. `tools.chrono.*` — Движок «Прошлое + Будущее + Сон, чтобы в будущем не уснуть»
| Инструмент | Что принимает | Что делает | Что возвращает |
|---|---|---|---|
| `chrono.recordPast` | `{ kind: 'chat-switch'\|'route-fail'\|'cache-evict', payload }` | Пополняет «Прошлое»: матрицу Маркова, журнал отказов маршрутов и призрачную очередь `G` (`S3-FIFO`). | `{ recorded: true }` |
| `chrono.predictFuture` | `{ currentChatId, hourOfDay }` | Возвращает топ-3 вероятных следующих чата и нужные им маршруты/мосты. | `{ candidates[], confidence[] }` |
| `chrono.warmUp` | `{ candidates[], budget }` | В свободные миллисекунды прогревает чаты в `HOT` и проверяет сокеты, но мгновенно отступает по `Backpressure` (`RM-501`). | `{ warmed[], skippedByBackpressure }` |
| `chrono.setPhase` | `{ phase: 'ACTIVE'\|'COOLING'\|'HOUSEKEEPING'\|'DEEP_SLEEP' }` | Переводит весь движок в нужную фазу энергосбережения и тишины. | `{ prevPhase, phase }` |
| `chrono.runHousekeeping` | `{ maxBudgetMs? }` | Запускает уборку по строгому DAG без циклов: сброс буферов → сверка `.txt` → `WAL checkpoint` → ротация → `crypto.rotateKeys` → `S3-FIFO`. | `{ stepsRun[], costMs }` |
| `chrono.coalesceTimers` | `{ wakeWindowSec }` | Склеивает десятки мелких фоновых таймеров в редкие сгруппированные импульсы пробуждения. | `{ timersMerged, nextWakeAt }` |

#### 10. `tools.cache.*` — Умная память (`S3-FIFO` + 3 яруса `RatCore HOT/WARM/COLD`)
| Инструмент | Что принимает | Что делает | Что возвращает |
|---|---|---|---|
| `cache.admit` | `{ key, kind, bytes }` | Кладёт новый элемент во входную очередь `S` (`S3-FIFO`), отсекая случайные «однодневки» от главных чатов. | `{ tier: 'HOT'\|'WARM', queue: 'S'\|'M' }` |
| `cache.evictTick` | `{ budgetMs?: 2, ramLimitMb }` | Плавно вытесняет холодные чаты и превью (не дольше 2 мс/тик, в паре с `RatCore.tools.stream.memoryTick`). | `{ evictedCount, ramMb }` |
| `cache.budgetStatus` | — | Сводка расхода ОЗУ по мостам, `HOT/WARM/COLD` чатам и медиа-превью. | `{ totalMb, byBridge{}, tiers{} }` |

#### 11. `tools.presence.*` — Тихие живые сигналы и анти-шторм
| Инструмент | Что принимает | Что делает | Что возвращает |
|---|---|---|---|
| `presence.emitTyping` | `{ chatId }` | Отправляет «печатает…» через `pack.control` + `transfer.dispatch` не чаще раза в 3–5 с (в офлайне подавляется). | `{ sent, throttled }` |
| `presence.setAvailability` | `{ phase }` | Автоматически гасит шумный фоновый «онлайн» при переходе в `COOLING` / `DEEP_SLEEP`. | `{ broadcastOnline: boolean }` |
| `presence.notifyCoalesce` | `{ events[] }` | Схлопывает лавину сообщений после офлайна в одно понятное уведомление + мягкий процедурный звук через `RatCore.tools.audio`. | `{ notificationsShown }` |

#### 12. `tools.diag.*` — Инспектор «почему не дошло» и симулятор сбоев *(поверх `RatCore.tools.test` / `think` / `guess`)*
| Инструмент | Что принимает | Что делает | Что возвращает |
|---|---|---|---|
| `diag.whyStuck` | `{ transferId }` | За один вызов собирает `transfer.inspect` + `route.explain` + `connect.authCheck` + `vault.verifyIntegrity` и даёт ясный человеческий ответ. | `{ rootCause, humanExplanation, suggestedFix }` |
| `diag.simulateOutage` | `{ scenario: 'vpn-drop'\|'power-loss'\|'rate-limit-429'\|'sleep-12h', seed }` | Прогоняет аварию на изолированном клоне (`RatCore.tools.think.sandboxRun` / `guess.hypothesize`) без порчи реальных данных. | `{ passed, messagesLost: 0, recoveryMs }` |
| `diag.auditGuards` | `{ targetDir }` | Статическая и рантайм-проверка, что ни один модуль не передаёт данные и не пишет файлы в обход `TransferGuard` (`RM-101..107`). | `{ clean, violations[] }` |
| `diag.reportToRatCore` | `{ kind: 'bug'\|'rfc'\|'handoff', payload }` | Оформляет совместимый конверт для `ratcore/comms/` или `ratcore/reports/bugs/`. | `{ artifactId }` |

---

## 3. Шпаргалка: 6 сквозных сценариев «Вся передача через инструменты»

| Сценарий передачи | Точная цепочка инструментов (без единой «сырой» отправки!) |
|---|---|
| **1. Сообщение в свой чат `RatMes ↔ RatMes`** | `pack.text` → `pack.validate` → `vault.append` → `transfer.enqueue` → `crypto.sealEnvelope` (`relay.offload`) → `transfer.preflight` → `transfer.dispatch(native)` → `transfer.ack` |
| **2. Сообщение в Telegram / WhatsApp / Discord из `RU`** | `pack.text` → `pack.validate` → `vault.append` → `transfer.enqueue` → `route.probe` + `transfer.preflight` → `connect.wake` → `crypto.signRequest` → `transfer.dispatch(bridge)` → при сбое `route.failover` + `transfer.reroute` → `transfer.ack` |
| **3. Большое видео / файл с докачкой при обрыве VPN** | `pack.media` (нарезка на чанки + SHA-256) → `vault.storeMedia` → `transfer.enqueue` → `transfer.streamChunk` → *(обрыв VPN → пауза → `route.failover`)* → `transfer.streamChunk(resumeFromChunk)` → `transfer.ack` |
| **4. Синхронизация Браузера (PWA), ПК-агента и вкладок** | `pack.control` → `relay.pushDelta(ws)` + `relay.pushDelta(broadcast)` → `relay.syncHash` → при `RC-604` сразу `gap.check` + `gap.repair` |
| **5. Передача без интернета в одном Wi-Fi / LAN** | `relay.lanDiscover` → `pack.text` / `pack.media` → `vault.append` → `crypto.sealEnvelope` → `relay.lanSend` → на втором устройстве `transfer.receive` → `vault.append` |
| **6. Перенос архива `RatMes-Vault/` на новый ПК / телефон** | `vault.verifyIntegrity` → `pack.bundle(deflate)` → `transfer.streamChunk` (или экспорт через `file`) → на новом устройстве `transfer.receive` → `vault.rebuildIndex` |

---

## 4. Сводка совместимости `RatCore-App` (10 веток) + `RatMes.tools.*` (12 веток)

- **Итого в приложении RatMes:** ровно **22 чистые прикладные/системные ветки** (10 из фундамента `RatCore-App` + 12 собственных веток `RatMes Engine`), **0 лишних игровых модулей** (никакой 3D-физики, вокселей и баллистики).
- **Единая защита:** `ToolGuard` + `AssetVault` (в `RatCore`) бесшовно продолжаются как **`TransferGuard` + `MessageGuard` + `SecretVault`** (в `RatMes Engine`).
- **Единая связь:** вся передача между людьми, мостами, браузером, ПК-агентом, воркерами, LAN-устройствами и самим `RatCore` проходит по единому запечатанному конвейеру инструментов с 100 % проверяемостью в headless Node.js.
