// 5-барьерный TransferGuard + MessageGuard + SecretVault + PayloadVault.
// Прямое развитие 5-барьерного ToolGuard + AssetVault из RatCore (ratcore/SPEC.md §2, DEVLOG #002):
// - Неэкспортируемые WeakMap с печатями происхождения (подделать извне невозможно).
// - Одноразовый захват права печати (claimAuthority -> повторный захват отклоняется RC-105).
// - Замороженные непрозрачные хэндлы (EnvelopeHandle / AttachmentHandle / SessionHandle / KeyHandle / BundleHandle).
// - Закрытые хранилища SecretVault и PayloadVault: сырые ключи, токены и сырые буферы наружу не выдаются (RM-102).

import { fnv1aHex } from './ratcore-app.mjs';
import { makeError } from './errors.mjs';

export function createGuardSystem(ratCoreApp) {
  // Закрытые неэкспортируемые реестры — недоступны внешнему коду
  const sealedEnvelopes = new WeakMap();
  const sealedAttachments = new WeakMap();
  const sealedSessions = new WeakMap();
  const sealedKeys = new WeakMap();
  const sealedBundles = new WeakMap();

  // Внутренние токены доступа (одноразовая выдача ядру)
  const internalToken = Symbol('RatMes.GuardInternalToken');
  let authorityClaimed = false;
  let seqHandle = 0;

  function nextHandleId(prefix) {
    seqHandle += 1;
    return `${prefix}-${String(seqHandle).padStart(6, '0')}`;
  }

  function recordViolation(code, message, meta = {}) {
    ratCoreApp.audit.record({ code, message, ...meta });
    return makeError(code, message, { details: meta });
  }

  // Одноразовый захват полномочий печати (как claimMintAuthority в RatCore DEVLOG #002)
  function claimAuthority() {
    if (authorityClaimed) {
      throw Object.assign(
        new Error('RC-105: Повторный захват полномочий TransferGuard запрещён'),
        { rcError: recordViolation('RC-105', 'Повторный захват полномочий TransferGuard запрещён') },
      );
    }
    authorityClaimed = true;

    return Object.freeze({
      token: internalToken,

      // Запечатывание конверта сообщения или служебного пакета (tools.pack.*)
      mintEnvelope({ kind, chatId, network, body, meta, actorId, traceId, idempotencyKey }) {
        const handleId = nextHandleId('env');
        const payloadCopy = structuredClone(body);
        const contentHash = fnv1aHex({ kind, chatId, network, body: payloadCopy });
        const handle = Object.freeze({
          handleType: 'EnvelopeHandle',
          handleId,
          kind,
          chatId,
          network,
          idempotencyKey,
          contentHash,
          provenance: Object.freeze({
            tool: `pack.${kind}`,
            actorId,
            traceId,
            tick: ratCoreApp.clock.tick,
          }),
        });
        sealedEnvelopes.set(handle, {
          handleId,
          kind,
          chatId,
          network,
          body: payloadCopy,
          meta: structuredClone(meta || {}),
          idempotencyKey,
          contentHash,
          validated: false,
          vaultSaved: false,
          outboxQueued: false,
          encrypted: false,
        });
        return handle;
      },

      markEnvelopeValidated(handle, warnings = []) {
        const rec = sealedEnvelopes.get(handle);
        if (!rec) return { ok: false, error: recordViolation('RM-105', 'Неподписанный конверт отклонён при валидации') };
        rec.validated = true;
        rec.warnings = [...warnings];
        return { ok: true };
      },

      markEnvelopeVaultSaved(handle, vaultRef) {
        const rec = sealedEnvelopes.get(handle);
        if (!rec) return { ok: false, error: recordViolation('RM-105', 'Неподписанный конверт нельзя отметить сохранённым в Vault') };
        rec.vaultSaved = true;
        rec.vaultRef = vaultRef;
        return { ok: true };
      },

      markEnvelopeOutboxQueued(handle, transferId) {
        const rec = sealedEnvelopes.get(handle);
        if (!rec) return { ok: false, error: recordViolation('RM-105', 'Неподписанный конверт нельзя поставить в Outbox') };
        rec.outboxQueued = true;
        rec.transferId = transferId;
        return { ok: true };
      },

      markEnvelopeEncrypted(handle, cipherMeta) {
        const rec = sealedEnvelopes.get(handle);
        if (!rec) return { ok: false, error: recordViolation('RM-105', 'Неподписанный конверт нельзя зашифровать') };
        rec.encrypted = true;
        rec.cipherMeta = cipherMeta;
        return { ok: true };
      },

      readEnvelopeInternal(handle, token) {
        if (token !== internalToken) {
          return { ok: false, error: recordViolation('RM-102', 'Несанкционированное чтение внутреннего конверта') };
        }
        const rec = sealedEnvelopes.get(handle);
        if (!rec) {
          return { ok: false, error: recordViolation('RM-105', 'Конверт не имеет печати TransferGuard (RAW_ENVELOPE_FORBIDDEN)') };
        }
        const checkHash = fnv1aHex({ kind: rec.kind, chatId: rec.chatId, network: rec.network, body: rec.body });
        if (checkHash !== rec.contentHash) {
          return { ok: false, error: recordViolation('RC-106', 'Нарушена контрольная сумма запечатанного конверта') };
        }
        return { ok: true, record: rec };
      },

      // Закрытый PayloadVault для медиа-вложений и чанков (наружу только AttachmentHandle)
      mintAttachment({ chatId, filename, mimeType, bytes, sha256, chunkSize = 65536, actorId, traceId }) {
        const raw = bytes instanceof Uint8Array ? new Uint8Array(bytes) : new Uint8Array(bytes);
        const totalChunks = Math.max(1, Math.ceil(raw.byteLength / chunkSize));
        const handleId = nextHandleId('att');
        const handle = Object.freeze({
          handleType: 'AttachmentHandle',
          handleId,
          chatId,
          filename,
          mimeType,
          sizeBytes: raw.byteLength,
          sha256,
          chunkSize,
          totalChunks,
          provenance: Object.freeze({
            tool: 'pack.media',
            actorId,
            traceId,
            tick: ratCoreApp.clock.tick,
          }),
        });
        sealedAttachments.set(handle, {
          handleId,
          chatId,
          filename,
          mimeType,
          bytes: raw,
          sha256,
          chunkSize,
          totalChunks,
          storedPath: null,
        });
        return handle;
      },

      readAttachmentInternal(handle, token) {
        if (token !== internalToken) {
          return { ok: false, error: recordViolation('RM-102', 'Прямой доступ к PayloadVault запрещён') };
        }
        const rec = sealedAttachments.get(handle);
        if (!rec) {
          return { ok: false, error: recordViolation('RM-105', 'Вложение не имеет печати TransferGuard') };
        }
        return { ok: true, record: rec };
      },

      // Закрытый SecretVault для сессий мостов (токены VK/MAX/TG/WA/Discord наружу не выходят никогда!)
      mintSession({ network, accountLabel, secretToken, expiresAt, actorId, traceId }) {
        const handleId = nextHandleId('ses');
        const fingerprint = fnv1aHex(`${network}:${accountLabel}:${String(secretToken).slice(0, 4)}:${String(secretToken).length}`);
        const handle = Object.freeze({
          handleType: 'SessionHandle',
          handleId,
          network,
          accountLabel,
          fingerprint,
          expiresAt: expiresAt || null,
          provenance: Object.freeze({
            tool: 'crypto.storeSession',
            actorId,
            traceId,
            tick: ratCoreApp.clock.tick,
          }),
        });
        sealedSessions.set(handle, {
          handleId,
          network,
          accountLabel,
          secretToken: String(secretToken),
          expiresAt: expiresAt || null,
          revoked: false,
        });
        return handle;
      },

      readSessionInternal(handle, token) {
        if (token !== internalToken) {
          return { ok: false, error: recordViolation('RM-102', 'Попытка извлечь сырой токен из SecretVault заблокирована') };
        }
        const rec = sealedSessions.get(handle);
        if (!rec) {
          return { ok: false, error: recordViolation('RM-102', 'Невалидный SessionHandle без печати SecretVault') };
        }
        return { ok: true, record: rec };
      },

      // Закрытый SecretVault для ключей E2EE (MLS / Double Ratchet)
      mintKey({ chatId, epoch = 1, keyBytes, actorId, traceId }) {
        const handleId = nextHandleId('key');
        const raw = keyBytes instanceof Uint8Array ? new Uint8Array(keyBytes) : new Uint8Array(keyBytes);
        const fingerprint = fnv1aHex(Array.from(raw.slice(0, 8)).join(','));
        const handle = Object.freeze({
          handleType: 'KeyHandle',
          handleId,
          chatId,
          epoch,
          fingerprint,
          provenance: Object.freeze({
            tool: 'crypto.key',
            actorId,
            traceId,
            tick: ratCoreApp.clock.tick,
          }),
        });
        sealedKeys.set(handle, { handleId, chatId, epoch, keyBytes: raw, step: 0 });
        return handle;
      },

      readKeyInternal(handle, token) {
        if (token !== internalToken) {
          return { ok: false, error: recordViolation('RM-102', 'Попытка извлечь сырой криптоключ из SecretVault заблокирована') };
        }
        const rec = sealedKeys.get(handle);
        if (!rec) {
          return { ok: false, error: recordViolation('RM-102', 'Невалидный KeyHandle без печати SecretVault') };
        }
        return { ok: true, record: rec };
      },

      // Запечатанный переносимый пакет BundleHandle (tools.pack.bundle)
      mintBundle({ scope, codec, bytes, rawBytes, checksum, itemCount, actorId, traceId }) {
        const handleId = nextHandleId('bnd');
        const handle = Object.freeze({
          handleType: 'BundleHandle',
          handleId,
          scope,
          codec,
          compressedBytes: bytes.byteLength,
          rawBytes,
          checksum,
          itemCount,
          provenance: Object.freeze({
            tool: 'pack.bundle',
            actorId,
            traceId,
            tick: ratCoreApp.clock.tick,
          }),
        });
        sealedBundles.set(handle, { handleId, scope, codec, bytes: new Uint8Array(bytes), rawBytes, checksum, itemCount });
        return handle;
      },

      readBundleInternal(handle, token) {
        if (token !== internalToken) {
          return { ok: false, error: recordViolation('RM-102', 'Прямой доступ к BundleHandle запрещён') };
        }
        const rec = sealedBundles.get(handle);
        if (!rec) {
          return { ok: false, error: recordViolation('RM-105', 'Пакет не имеет печати TransferGuard') };
        }
        return { ok: true, record: rec };
      },
    });
  }

  // Публичный верификатор (доступен для инспектора и тестов; не раскрывает секреты!)
  function verifyEnvelopeForDispatch(handle, { requireVault = true, requireOutbox = true } = {}) {
    const rec = sealedEnvelopes.get(handle);
    if (!rec) {
      return { ok: false, error: recordViolation('RM-105', 'Передача неподписанного конверта запрещена (TransferGuard)') };
    }
    if (!rec.validated) {
      return { ok: false, error: recordViolation('RM-106', 'Конверт не прошёл проверку tools.pack.validate') };
    }
    if (requireVault && !rec.vaultSaved) {
      return { ok: false, error: recordViolation('RM-103', 'Запрещена передача до сохранения в RatMes-Vault/ (vault.append)') };
    }
    if (requireOutbox && !rec.outboxQueued) {
      return { ok: false, error: recordViolation('RM-103', 'Запрещена передача в обход Outbox (transfer.enqueue)') };
    }
    return { ok: true };
  }

  // Проверка объекта на попытку «вынести» секретные поля наружу (Барьер 4)
  function assertNoSecretLeak(obj, contextLabel = 'output') {
    const forbiddenKeys = new Set(['secretToken', 'privateKey', 'rawKey', 'keyBytes', 'cookieJar', 'authSecret']);
    const stack = [obj];
    const seen = new Set();
    while (stack.length) {
      const cur = stack.pop();
      if (!cur || typeof cur !== 'object' || seen.has(cur)) continue;
      seen.add(cur);
      for (const k of Object.keys(cur)) {
        if (forbiddenKeys.has(k)) {
          return {
            ok: false,
            error: recordViolation('RM-102', `Заблокирована утечка секретного поля "${k}" в ${contextLabel}`),
          };
        }
        if (cur[k] && typeof cur[k] === 'object') stack.push(cur[k]);
      }
    }
    return { ok: true };
  }

  return {
    claimAuthority,
    verifyEnvelopeForDispatch,
    assertNoSecretLeak,
    recordViolation,
    isSealedEnvelope: (h) => sealedEnvelopes.has(h),
    isSealedAttachment: (h) => sealedAttachments.has(h),
    isSealedSession: (h) => sealedSessions.has(h),
    isSealedKey: (h) => sealedKeys.has(h),
    isSealedBundle: (h) => sealedBundles.has(h),
  };
}
