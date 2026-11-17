// Единая система кодов ошибок RatMes Engine (RM-100..699) и совместимых кодов RatCore (RC-100..999)

export const ERROR_CATALOG = Object.freeze({
  // RatCore-App фундамент (совместимо с ratcore/SPEC.md §6)
  'RC-104': { group: 'core', name: 'UNKNOWN_TOOL', hint: 'Проверь список доступных инструментов через tools.help().' },
  'RC-105': { group: 'core', name: 'MINT_AUTHORITY_ALREADY_CLAIMED', hint: 'Право печати можно захватить только один раз при старте ядра.' },
  'RC-106': { group: 'core', name: 'VAULT_HASH_MISMATCH', hint: 'Нарушена контрольная сумма буфера в закрытом хранилище.' },
  'RC-601': { group: 'bridge', name: 'BRIDGE_HANDSHAKE_FAILED', hint: 'Проверь версию протокола ratcore-bridge/1.' },
  'RC-602': { group: 'bridge', name: 'BRIDGE_TRANSPORT_UNAVAILABLE', hint: 'Выбранный транспорт недоступен в текущей среде.' },
  'RC-603': { group: 'bridge', name: 'BRIDGE_PERMISSION_DENIED', hint: 'Актор не имеет прав на эту группу инструментов.' },
  'RC-604': { group: 'bridge', name: 'BRIDGE_DESYNC_DETECTED', hint: 'Обнаружен рассинхрон stateHash — запусти gap.repair.' },
  'RC-606': { group: 'bridge', name: 'BRIDGE_LINK_CLOSED', hint: 'Соединение закрыто; выполни повторный relay.handshake.' },
  'RC-802': { group: 'save', name: 'SAVE_CHECKSUM_INVALID', hint: 'Контрольная сумма пакета/архива повреждена.' },
  'RC-902': { group: 'test', name: 'MEMORY_LEAK_DETECTED', hint: 'Вырос тренд ОЗУ — проверь cache.budgetStatus.' },

  // RatMes Engine — TransferGuard & MessageGuard (RM-100..199)
  'RM-101': { group: 'guard', name: 'RAW_VAULT_WRITE_FORBIDDEN', hint: 'Пиши в RatMes-Vault/ только через tools.vault.append / tools.vault.storeMedia.' },
  'RM-102': { group: 'guard', name: 'SECRET_LEAK_BLOCKED', hint: 'Сырые ключи и токены заперты в SecretVault; используй SessionHandle / KeyHandle.' },
  'RM-103': { group: 'guard', name: 'BYPASS_OUTBOX_FORBIDDEN', hint: 'Сначала сохрани конверт через vault.append и поставь в очередь transfer.enqueue.' },
  'RM-104': { group: 'guard', name: 'RAW_TRANSPORT_FORBIDDEN', hint: 'Вся передача обязана идти через tools.pack.* -> tools.transfer.* / tools.relay.*.' },
  'RM-105': { group: 'guard', name: 'UNSEALED_ENVELOPE_FORBIDDEN', hint: 'Конверт не имеет печати TransferGuard; собери его через tools.pack.* и tools.pack.validate.' },
  'RM-106': { group: 'guard', name: 'UNVALIDATED_ENVELOPE_FORBIDDEN', hint: 'Пропусти конверт через tools.pack.validate перед передачей.' },
  'RM-107': { group: 'guard', name: 'STATIC_GUARD_VIOLATION', hint: 'Статический аудитор обнаружил обход инструментов передачи или хранилища.' },
  'RM-108': { group: 'guard', name: 'INVALID_PIPELINE_OP', hint: 'Укажи корректную пару { tool, args } для tools.pipeline.' },

  // RatMes-Vault & локальная БД (RM-200..299)
  'RM-201': { group: 'vault', name: 'TORN_TAIL_HEALED', hint: 'Битый хвост .jsonl обнаружен и безопасно обрезан после аварийного выключения.' },
  'RM-202': { group: 'vault', name: 'VAULT_IO_ERROR', hint: 'Проверь права на запись и свободное место в папке RatMes-Vault/.' },
  'RM-203': { group: 'vault', name: 'INDEX_DESYNC_REBUILT', hint: 'Индекс пересобран из обычных файлов RatMes-Vault/.' },
  'RM-204': { group: 'vault', name: 'ATTACHMENT_HASH_MISMATCH', hint: 'Контрольная сумма SHA-256 вложения не совпала.' },

  // Профили стран и маршрутизация (RM-300..399)
  'RM-301': { group: 'route', name: 'VPN_REQUIRED_FOR_COUNTRY', hint: 'Для выбранной страны этот мессенджер требует назначенный VPN/прокси через tools.route.bindProxy.' },
  'RM-302': { group: 'route', name: 'ROUTE_FAILOVER_ACTIVATED', hint: 'Основной маршрут деградировал; трафик переведён на резервный маршрут (План Б).' },
  'RM-303': { group: 'route', name: 'ALL_ROUTES_UNAVAILABLE_HELD', hint: 'Все маршруты недоступны; сообщение бережно сохранено в RatMes-Vault/ и Outbox.' },
  'RM-304': { group: 'route', name: 'UNKNOWN_COUNTRY_PROFILE', hint: 'Укажи поддерживаемый код страны (RU, EU, US, TR, CN, IR, AE, JP, KR, VN).' },

  // Мосты и аккаунты (RM-400..499)
  'RM-401': { group: 'connect', name: 'BRIDGE_SESSION_EXPIRED', hint: 'Обнови авторизацию через tools.crypto.storeSession и connect.authCheck.' },
  'RM-402': { group: 'connect', name: 'ACCOUNT_CHECK_REQUIRED', hint: 'Требуется проверка статуса аккаунта на стороне внешнего мессенджера.' },
  'RM-403': { group: 'connect', name: 'BRIDGE_CRASHED_SUPERVISED', hint: 'Мост упал в изоляции и перезапущен супервизором без влияния на другие сети.' },
  'RM-404': { group: 'connect', name: 'RATE_LIMITED_BACKPRESSURE', hint: 'Получен 429 Rate Limit — прогрев приостановлен, повтор запланирован по Retry-After.' },
  'RM-405': { group: 'connect', name: 'NETWORK_LIMIT_EXCEEDED', hint: 'Размер сообщения или файла превышает лимит целевого мессенджера.' },

  // Движок времени Chrono (RM-500..599)
  'RM-501': { group: 'chrono', name: 'PREFETCH_BLOCKED_BACKPRESSURE', hint: 'Прогрев «Будущего» остановлен из-за экономии батареи/трафика/ОЗУ или 429.' },
  'RM-502': { group: 'chrono', name: 'WAKE_CATCHUP_THROTTLED', hint: 'После долгого сна догон разбит на порции через maxSteps.' },

  // Шифрование и Gap Engine (RM-600..699)
  'RM-601': { group: 'gap', name: 'SEQUENCE_GAP_DETECTED', hint: 'Обнаружен пропуск последовательности seq — запущен tools.gap.repair.' },
  'RM-602': { group: 'crypto', name: 'CIPHER_AUTH_FAILED', hint: 'Ошибка проверки подписи/тега шифрования конверта.' },
  'RM-603': { group: 'crypto', name: 'BRIDGE_NO_E2EE_WARNING', hint: 'Внешняя сеть (например, MAX) не предоставляет сквозного шифрования E2EE.' },
});

export function makeError(code, message, extra = {}) {
  const entry = ERROR_CATALOG[code] || { name: 'UNKNOWN_ERROR', hint: 'Проверь tools.help().' };
  return {
    code,
    name: entry.name,
    message: message || entry.name,
    hint: extra.hint || entry.hint,
    ...(extra.details ? { details: extra.details } : {}),
  };
}

export function makeResult({ ok, tool, data = null, error = null, tick = 0, costMs = 0, traceId = '' }) {
  return {
    ok: Boolean(ok),
    tool,
    data: ok ? data : null,
    error: ok ? null : error,
    tick,
    costMs: Number(costMs.toFixed(3)),
    traceId,
  };
}
