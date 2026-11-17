// Главный прикладной движок RatMes Engine поверх облегчённого фундамента RatCore-App.
// Реализует все 12 веток RatMes.tools.* (pack, transfer, relay, gap, vault, crypto, route, connect, chrono, cache, presence, diag),
// 5 корневых методов (help, whoami, asActor, pipeline, trace) и 5-барьерный TransferGuard (вся передача строго через инструменты!).

import { createRatCoreApp, fnv1aHex } from '../core/ratcore-app.mjs';
import { createGuardSystem } from '../core/guard.mjs';
import { makeError, makeResult, ERROR_CATALOG } from '../core/errors.mjs';
import { COUNTRY_PROFILES, MESSENGERS, getCountryProfile, getMessengerSpec } from './countries.mjs';
import { S3FifoTieredCache } from './cache-s3fifo.mjs';
import { ChronoEngine } from './chrono.mjs';
import { createMemoryVault } from './vault-store.mjs';
import {
  sha256Hex,
  deriveDeterministicKeyBytes,
  encryptRatchetPayload,
  decryptRatchetPayload,
  signWithSecret,
} from './crypto-layer.mjs';
import { BridgeSupervisor } from './connectors.mjs';
import { FullTextSearchIndex } from './search-index.mjs';
import { PriorityTransferScheduler } from './net-scheduler.mjs';
import { WorkspaceFeaturesStore, QUICK_REACTIONS } from './chat-features.mjs';
import { createCloudHub, GAMES_CHAT_ROOMS } from './cloud-hub.mjs';
import {
  classifyMedia,
  synthesizeDemoVoiceWav,
  extractWaveformPeaks,
  buildChunkMap,
} from './media-pipeline.mjs';

const ROLE_ALLOWLIST = Object.freeze({
  owner: ['*'],
  ui: ['*'],
  agent: ['*'],
  'ai-agent': ['*'],
  bridge: ['pack', 'transfer', 'gap', 'presence', 'route', 'diag', 'cloud'],
  plugin: ['pack', 'cache', 'presence', 'diag', 'search', 'cloud'],
});

const TOOL_GROUPS_DOC = Object.freeze({
  pack: 'Упаковка и запечатывание конвертов (text, reply, forward, media, voice, control, bundle, validate)',
  transfer: 'Главная труба передачи + приоритеты и Outbox-насос (preflight, enqueue, dispatch, streamChunk, receive, ack, retry, reroute, pause, resume, cancel, inspect, pumpOutbox, schedulerStatus)',
  relay: 'Межпроцессная, междвижковая и LAN-передача поверх ratcore-bridge/1 (handshake, pushDelta, syncHash, offload, lanDiscover, lanSend)',
  gap: 'Непрерывность потока и закрытие дыр seq/pts (check, repair, merge, checkpoint)',
  vault: 'Вечный файловый резерв RatMes-Vault/ и индекс (append, storeMedia, readPage, healTail, rebuildIndex, importBundle, verifyIntegrity, listChats, listPlainFiles, readPlainTextFile, exportReadable)',
  crypto: 'Закрытый контур SecretVault и E2EE-храповик (ensureChatKey, sealEnvelope, openEnvelope, storeSession, signRequest, verifyTrust, rotateKeys)',
  route: 'Профили стран RU/мир и маршруты с Планом Б + Circuit Breaker (setCountry, bindProxy, probe, failover, explain, getMatrix)',
  connect: 'Изолированные акторы-мосты Let-it-crash + Lazy Wake (register, authCheck, wake, hibernate, supervise, capabilities, list, injectFault)',
  chrono: '3-фазный движок Прошлое + Будущее + Сон (recordPast, predictFuture, warmUp, setPhase, runHousekeeping, coalesceTimers, setBackpressure, status)',
  cache: 'Умная память S3-FIFO + HOT/WARM/COLD (admit, evictTick, budgetStatus)',
  presence: 'Тихие живые сигналы и анти-шторм (emitTyping, setAvailability, notifyCoalesce)',
  diag: 'Инспектор «почему не дошло», симулятор сбоев и аудит (whyStuck, simulateOutage, auditGuards, reportToRatCore, summary)',
  search: 'Полнотекстовый поиск BM25 по всему архиву (query, reindex, stats)',
  workspace: 'Папки, черновики, непрочитанные, закрепы, реакции, правки/удаление и объединённые контакты (overview, listFolders, createFolder, assignFolder, setDraft, getDraft, markRead, updateChatFlags, togglePin, toggleReaction, editMessage, deleteMessage, listContacts, upsertContact)',
  cloud: 'Подключённые облака Games: Supabase (games-cloud-save), Google Drive, Dropbox, Notion, Linear, Docs, Sheets, Calendar, Gmail (status, listArtifacts, getPublicConfig, getGamesRooms, recordSync, setDisplayName, exportManifest, ingestRemote)',
});

function bytesFromBase64(b64) {
  if (typeof Buffer !== 'undefined') return new Uint8Array(Buffer.from(b64, 'base64'));
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i += 1) out[i] = bin.charCodeAt(i);
  return out;
}

export function createRatMesEngine({
  seed = 20261116,
  country = 'RU',
  vault = null,
  externalRatCore = null,
  seedDemoChats = false,
} = {}) {
  const core = createRatCoreApp({ seed, externalRatCore, instanceId: 'ratmes-engine-main' });
  const guard = createGuardSystem(core);
  const authority = guard.claimAuthority();
  const vaultStore = vault || createMemoryVault();
  const cache = new S3FifoTieredCache();
  const chrono = new ChronoEngine({ clock: core.clock });
  const supervisor = new BridgeSupervisor({ ratCoreApp: core });
  const searchIndex = new FullTextSearchIndex();
  const scheduler = new PriorityTransferScheduler({ randFn: core.rand });
  const workspace = new WorkspaceFeaturesStore();
  const cloudHub = createCloudHub({ core });
  let attachedLanMesh = null;

  // Подгружаем сохранённое рабочее пространство (папки, реакции, закрепы, контакты) и первичный поисковый индекс
  if (typeof vaultStore.loadWorkspaceState === 'function') {
    const savedWs = vaultStore.loadWorkspaceState();
    if (savedWs) workspace.importState(savedWs);
  }
  searchIndex.rebuildFromVault(vaultStore, workspace.getAllPinnedMessageIds());

  function persistWorkspace() {
    if (typeof vaultStore.saveWorkspaceState === 'function') {
      vaultStore.saveWorkspaceState(workspace.exportState());
    }
  }

  // Внутренние реестры запечатанных хэндлов по handleId (чтобы RPC по сети тоже мог ссылаться на реальные опечатанные хэндлы,
  // но подделать handleId без печати в WeakMap невозможно — сработает RM-105!)
  const envelopeById = new Map();
  const attachmentById = new Map();
  const sessionById = new Map();
  const sessionByNetwork = new Map();
  const keyById = new Map();
  const keyByChat = new Map();
  const bundleById = new Map();

  // Состояние маршрутов, передач, курсоров Gap Engine и локальной сети
  let activeCountry = getCountryProfile(country) ? String(country).toUpperCase() : 'RU';
  const proxyBindings = new Map(); // network -> { primaryRoute, backupRoute, activeRoute, primaryDegraded, rttMs }
  const transfers = new Map(); // transferId -> state
  const idempotencyIndex = new Map(); // idempotencyKey -> transferId
  const chatCursors = new Map(); // chatId -> lastSeq
  const chatMetaExtra = new Map(); // chatId -> { title, network }
  const typingThrottle = new Map(); // chatId -> lastSentTs
  const lanPeers = new Map([
    ['lan-phone-01', { peerId: 'lan-phone-01', label: 'Телефон в домашнем Wi-Fi', ip: '192.168.1.42', rttMs: 3.4, online: true }],
    ['lan-laptop-02', { peerId: 'lan-laptop-02', label: 'Ноутбук в LAN', ip: '192.168.1.19', rttMs: 2.1, online: true }],
  ]);

  // Журнал вызовов инструментов (без утечки текстов и секретов)
  const traceLog = [];
  let seqTrace = 0;
  let seqTransfer = 0;
  let seqMsgCounter = 0;
  let hlcLogical = 0;
  let hlcLastMs = 0;

  function nextUuidV7() {
    const now = Date.now();
    if (now === hlcLastMs) hlcLogical += 1;
    else {
      hlcLastMs = now;
      hlcLogical = 0;
    }
    seqMsgCounter += 1;
    const tsHex = now.toString(16).padStart(12, '0');
    const seqHex = (seqMsgCounter & 0xfff).toString(16).padStart(3, '0');
    const rndHex = Math.floor(core.rand() * 0xffffffff).toString(16).padStart(8, '0');
    return `${tsHex.slice(0, 8)}-${tsHex.slice(8, 12)}-7${seqHex}-8${rndHex.slice(0, 3)}-${rndHex.slice(3).padStart(12, '0')}`;
  }

  function nextHlc() {
    const now = Date.now();
    if (now > hlcLastMs) {
      hlcLastMs = now;
      hlcLogical = 0;
    } else {
      hlcLogical += 1;
    }
    return `${hlcLastMs}:${String(hlcLogical).padStart(4, '0')}`;
  }

  function resolveEnvelope(handleOrId) {
    if (!handleOrId) return null;
    if (typeof handleOrId === 'string') return envelopeById.get(handleOrId) || null;
    return handleOrId;
  }

  function resolveAttachment(handleOrId) {
    if (!handleOrId) return null;
    if (typeof handleOrId === 'string') return attachmentById.get(handleOrId) || null;
    return handleOrId;
  }

  function resolveSession(handleOrId, networkFallback = null) {
    if (handleOrId) {
      if (typeof handleOrId === 'string') return sessionById.get(handleOrId) || null;
      return handleOrId;
    }
    if (networkFallback) return sessionByNetwork.get(networkFallback) || null;
    return null;
  }

  function resolveKey(handleOrId, chatIdFallback = null) {
    if (handleOrId) {
      if (typeof handleOrId === 'string') return keyById.get(handleOrId) || null;
      return handleOrId;
    }
    if (chatIdFallback) return keyByChat.get(chatIdFallback) || null;
    return null;
  }

  function computeStateHash() {
    const chats = vaultStore.listChats().map((c) => `${c.chatId}:${c.messageCount}:${c.lastSeq}`);
    const outboxIds = vaultStore.listOutbox().map((o) => `${o.transferId}:${o.status}`);
    return fnv1aHex({ activeCountry, phase: chrono.phase, chats, outboxIds });
  }

  function ensureRoutePlan(network) {
    const profile = getCountryProfile(activeCountry);
    const needsVpn = Boolean(profile?.vpnRequired?.includes(network));
    const binding = proxyBindings.get(network);

    if (!needsVpn) {
      return {
        ok: true,
        needsVpn: false,
        activeRoute: 'direct',
        backupRoute: binding?.backupRoute || null,
        rttMs: network === 'ratmes' ? 12 : 42,
        explanation: `${getMessengerSpec(network)?.name || network} в стране ${profile.name} (${profile.code}) идёт напрямую.`,
      };
    }

    if (!binding || (!binding.primaryRoute && !binding.backupRoute)) {
      return {
        ok: false,
        needsVpn: true,
        error: makeError('RM-301', `${getMessengerSpec(network)?.name || network} в профиле ${profile.name} (${profile.code}) требует VPN/прокси`),
      };
    }

    if (binding.allUnavailable) {
      return {
        ok: false,
        needsVpn: true,
        error: makeError('RM-303', `Все маршруты для ${network} временно недоступны — пакет сохранён в Outbox`),
      };
    }

    const activeRoute = binding.primaryDegraded && binding.backupRoute
      ? binding.backupRoute
      : (binding.activeRoute || binding.primaryRoute);

    return {
      ok: true,
      needsVpn: true,
      activeRoute,
      backupRoute: binding.backupRoute || null,
      primaryDegraded: Boolean(binding.primaryDegraded),
      rttMs: binding.rttMs || (binding.primaryDegraded ? 118 : 68),
      explanation: binding.primaryDegraded
        ? `${network}: сработал План Б — трафик переведён на резервный маршрут ${activeRoute}.`
        : `${network}: работает через назначенный маршрут ${activeRoute} (профиль ${profile.code}).`,
    };
  }

  // Преднастройка демо-маршрутов для профилей, чтобы Telegram сразу работал через VPN #1 с резервом VPN #2,
  // а WhatsApp/Discord можно было наглядно проверять на RM-301 или привязать за 1 клик!
  proxyBindings.set('telegram', {
    primaryRoute: 'vpn-eu-01 (WireGuard)',
    backupRoute: 'vpn-nl-backup-02 (VLESS)',
    activeRoute: 'vpn-eu-01 (WireGuard)',
    primaryDegraded: false,
    allUnavailable: false,
    rttMs: 64,
  });
  proxyBindings.set('discord', {
    primaryRoute: 'vpn-de-01 (AmneziaWG)',
    backupRoute: 'vpn-fi-backup-02',
    activeRoute: 'vpn-de-01 (AmneziaWG)',
    primaryDegraded: false,
    allUnavailable: false,
    rttMs: 78,
  });

  // Создаём стандартные сессии в SecretVault для базовых сетей (сырые токены наружу не выходят!)
  function seedDefaultSessions() {
    for (const net of ['ratmes', 'vk', 'max', 'telegram', 'discord']) {
      const h = authority.mintSession({
        network: net,
        accountLabel: net === 'ratmes' ? '@my_ratmes' : `account_${net}`,
        secretToken: `sealed-local-session-${net}-${seed}`,
        actorId: 'system-boot',
        traceId: 'boot-0',
      });
      sessionById.set(h.handleId, h);
      sessionByNetwork.set(net, h);
      supervisor.authCheck(net, h);
    }
  }
  seedDefaultSessions();

  // ---------------- Реализация 12 веток инструментов ----------------
  const rawTools = {
    // 1. tools.pack.*
    pack: {
      async text(args, ctx) {
        const { chatId, network = 'ratmes', text = '', chatTitle, senderId = null, senderName = 'Я', replyTo = null, mentions = [] } = args || {};
        if (!chatId || typeof text !== 'string' || !text.trim()) {
          return { ok: false, error: makeError('RM-105', 'Для pack.text требуются непустые chatId и text') };
        }
        const msgId = nextUuidV7();
        const hlc = nextHlc();
        const idempotencyKey = args.idempotencyKey || `idem-${msgId}`;
        const handle = authority.mintEnvelope({
          kind: 'text',
          chatId,
          network,
          idempotencyKey,
          actorId: ctx.actorId,
          traceId: ctx.traceId,
          body: {
            msgId,
            chatId,
            chatTitle: chatTitle || chatMetaExtra.get(chatId)?.title || chatId,
            network,
            direction: 'out',
            senderId: senderId ? String(senderId) : ctx.actorId,
            senderName: String(senderName || 'Я').slice(0, 48),
            text: text.trim(),
            replyTo,
            mentions,
            hlc,
            ts: Date.now(),
            status: 'local',
          },
        });
        envelopeById.set(handle.handleId, handle);
        return { ok: true, data: { envelope: handle, msgId, hlc } };
      },

      async reply(args, ctx) {
        const { chatId, network = 'ratmes', targetMsgId, text } = args || {};
        if (!targetMsgId) return { ok: false, error: makeError('RM-105', 'Для pack.reply требуется targetMsgId') };
        return rawTools.pack.text({ ...args, chatId, network, text, replyTo: targetMsgId }, ctx);
      },

      async forward(args, ctx) {
        const { fromChatId, msgIds = [], toChatId, toNetwork = 'ratmes', hideAuthor = false } = args || {};
        if (!fromChatId || !toChatId || !Array.isArray(msgIds) || !msgIds.length) {
          return { ok: false, error: makeError('RM-105', 'Укажи fromChatId, toChatId и непустой массив msgIds') };
        }
        const page = vaultStore.readPage(fromChatId, { limit: 500 });
        const picked = page.messages.filter((m) => msgIds.includes(m.msgId));
        if (!picked.length) {
          return { ok: false, error: makeError('RM-105', 'Исходные сообщения для пересылки не найдены в Vault') };
        }
        const envelopes = [];
        for (const orig of picked) {
          const prefix = hideAuthor ? '[Переслано] ' : `[Переслано от ${orig.senderName || orig.network}] `;
          const res = await rawTools.pack.text({
            chatId: toChatId,
            network: toNetwork,
            text: `${prefix}${orig.text}`,
          }, ctx);
          if (!res.ok) return res;
          envelopes.push(res.data.envelope);
        }
        return { ok: true, data: { envelopes, count: envelopes.length } };
      },

      async media(args, ctx) {
        const {
          chatId,
          network = 'ratmes',
          filename = 'file.bin',
          mimeType = 'application/octet-stream',
          bytes = null,
          base64 = null,
          caption = '',
          chunkSize = 65536,
          chatTitle,
          senderId = null,
          senderName = 'Я',
        } = args || {};
        if (!chatId) return { ok: false, error: makeError('RM-105', 'Для pack.media требуется chatId') };
        const rawBytes = bytes instanceof Uint8Array
          ? bytes
          : (base64 ? bytesFromBase64(base64) : new TextEncoder().encode(caption || filename));
        const sha256 = await sha256Hex(rawBytes);

        const attHandle = authority.mintAttachment({
          chatId,
          filename,
          mimeType,
          bytes: rawBytes,
          sha256,
          chunkSize: Math.max(1024, Math.min(262144, Number(chunkSize) || 65536)),
          actorId: ctx.actorId,
          traceId: ctx.traceId,
        });
        attachmentById.set(attHandle.handleId, attHandle);

        const mediaKind = classifyMedia(filename, mimeType);
        const msgId = nextUuidV7();
        const hlc = nextHlc();
        const idempotencyKey = args.idempotencyKey || `idem-${msgId}`;
        const envHandle = authority.mintEnvelope({
          kind: 'media',
          chatId,
          network,
          idempotencyKey,
          actorId: ctx.actorId,
          traceId: ctx.traceId,
          body: {
            msgId,
            chatId,
            chatTitle: chatTitle || chatMetaExtra.get(chatId)?.title || chatId,
            network,
            direction: 'out',
            senderId: senderId ? String(senderId) : ctx.actorId,
            senderName: String(senderName || 'Я').slice(0, 48),
            text: caption || `Вложение: ${filename}`,
            attachment: {
              handleId: attHandle.handleId,
              filename,
              mimeType,
              mediaKind,
              isVoice: Boolean(args.isVoice),
              durationSec: args.durationSec || null,
              waveform: args.waveform || null,
              sizeBytes: attHandle.sizeBytes,
              sha256,
              totalChunks: attHandle.totalChunks,
              chunkSize: attHandle.chunkSize,
            },
            hlc,
            ts: Date.now(),
            status: 'local',
          },
        });
        envelopeById.set(envHandle.handleId, envHandle);
        return { ok: true, data: { attachment: attHandle, envelope: envHandle, msgId, sha256 } };
      },

      // Упаковка голосовой заметки (настоящий PCM WAV / WebM + массив амплитуд waveform)
      async voice(args, ctx) {
        const {
          chatId,
          network = 'ratmes',
          base64 = null,
          bytes = null,
          mimeType = 'audio/wav',
          durationSec = 2.4,
          waveform = null,
          caption = '',
          chatTitle,
        } = args || {};
        if (!chatId) return { ok: false, error: makeError('RM-105', 'Для pack.voice требуется chatId') };

        let finalBytes;
        let finalDur = Number(durationSec) || 2.4;
        let finalPeaks = Array.isArray(waveform) && waveform.length ? waveform : null;
        let finalMime = mimeType;

        if (bytes instanceof Uint8Array) {
          finalBytes = bytes;
        } else if (base64) {
          finalBytes = bytesFromBase64(base64);
        } else {
          const synth = synthesizeDemoVoiceWav({ durationSec: finalDur, seedFreq: 280 + Math.floor(core.rand() * 140) });
          finalBytes = synth.wavBytes;
          finalDur = synth.durationSec;
          finalPeaks = synth.peaks;
          finalMime = 'audio/wav';
        }
        if (!finalPeaks) finalPeaks = extractWaveformPeaks(finalBytes, 32);

        const ext = finalMime.includes('webm') ? 'webm' : (finalMime.includes('ogg') ? 'ogg' : 'wav');
        const filename = `voice-${Date.now().toString(36)}.${ext}`;
        return rawTools.pack.media({
          chatId,
          network,
          chatTitle,
          senderId: args.senderId || null,
          senderName: args.senderName || 'Я',
          filename,
          mimeType: finalMime,
          bytes: finalBytes,
          caption: caption || `Голосовое сообщение (${finalDur.toFixed(1)} сек)`,
          isVoice: true,
          durationSec: finalDur,
          waveform: finalPeaks,
          chunkSize: 16384,
        }, ctx);
      },

      async control(args, ctx) {
        const { chatId, network = 'ratmes', kind = 'read', payload = {} } = args || {};
        if (!chatId) return { ok: false, error: makeError('RM-105', 'Для pack.control требуется chatId') };
        const id = nextUuidV7();
        const handle = authority.mintEnvelope({
          kind: 'control',
          chatId,
          network,
          idempotencyKey: `ctrl-${id}`,
          actorId: ctx.actorId,
          traceId: ctx.traceId,
          body: { controlId: id, controlKind: kind, chatId, network, payload, ts: Date.now() },
        });
        envelopeById.set(handle.handleId, handle);
        // Контрольные сигналы сразу валидируем по базовым правилам
        authority.markEnvelopeValidated(handle);
        return { ok: true, data: { envelope: handle } };
      },

      async bundle(args, ctx) {
        const { scope = 'vault', chatId = null } = args || {};
        const exported = scope === 'chat' && chatId
          ? { chatId, page: vaultStore.readPage(chatId, { limit: 10000 }) }
          : vaultStore.exportAllReadable();
        const serialized = JSON.stringify(exported);
        const checksum = fnv1aHex(serialized);
        const compressed = await core.compressBytes(serialized);
        const bundleHandle = authority.mintBundle({
          scope,
          codec: compressed.codec,
          bytes: compressed.bytes,
          rawBytes: compressed.rawBytes,
          checksum,
          itemCount: Object.keys(exported).length,
          actorId: ctx.actorId,
          traceId: ctx.traceId,
        });
        bundleById.set(bundleHandle.handleId, bundleHandle);
        return { ok: true, data: { bundle: bundleHandle, ratio: Number((compressed.rawBytes / Math.max(1, compressed.bytes.byteLength)).toFixed(2)) } };
      },

      async validate(args) {
        const handle = resolveEnvelope(args?.envelope || args?.handleId);
        const read = authority.readEnvelopeInternal(handle, authority.token);
        if (!read.ok) return { ok: false, error: read.error };
        const rec = read.record;
        const targetNet = args?.targetNetwork || rec.network;
        const spec = getMessengerSpec(targetNet);
        if (!spec) return { ok: false, error: makeError('RM-405', `Неизвестная целевая сеть: ${targetNet}`) };

        const warnings = [];
        if (rec.body.text && rec.body.text.length > spec.maxTextLen) {
          return {
            ok: false,
            error: makeError('RM-405', `Текст (${rec.body.text.length} симв.) превышает лимит ${spec.name} (${spec.maxTextLen})`),
          };
        }
        if (rec.body.attachment && rec.body.attachment.sizeBytes > spec.maxFileMb * 1024 * 1024) {
          return {
            ok: false,
            error: makeError('RM-405', `Файл превышает лимит ${spec.name} (${spec.maxFileMb} МБ)`),
          };
        }
        if (spec.e2eeWarning) {
          warnings.push({ code: 'RM-603', message: spec.e2eeWarning });
        }

        const marked = authority.markEnvelopeValidated(handle, warnings);
        if (!marked.ok) return marked;
        return { ok: true, data: { valid: true, validatedEnvelope: handle, warnings, targetNetwork: targetNet } };
      },
    },

    // 2. tools.transfer.* (Главная труба передачи — 5 барьеров TransferGuard!)
    transfer: {
      async preflight(args) {
        const handle = resolveEnvelope(args?.envelope || args?.handleId);
        const read = authority.readEnvelopeInternal(handle, authority.token);
        if (!read.ok) return { ok: false, error: read.error };
        const rec = read.record;
        const blockers = [];

        const routePlan = ensureRoutePlan(rec.network);
        if (!routePlan.ok) blockers.push(routePlan.error);

        const ses = resolveSession(args?.sessionHandle, rec.network);
        const auth = supervisor.authCheck(rec.network, ses);
        if (!auth.ok) blockers.push(auth.error);

        const bp = chrono.isBackpressureActive();
        if (bp.active && rec.kind === 'control') {
          blockers.push(makeError('RM-501', `Backpressure активен (${bp.reasons.join(', ')})`));
        }

        const actor = supervisor.getActor(rec.network);
        if (actor?.rateLimit429) {
          blockers.push(makeError('RM-404', `${actor.name} временно ограничен 429 Rate Limit`));
        }

        return {
          ok: true,
          data: {
            ready: blockers.length === 0,
            network: rec.network,
            country: activeCountry,
            routePlan: routePlan.ok ? routePlan : null,
            blockers,
          },
        };
      },

      async enqueue(args) {
        const handle = resolveEnvelope(args?.validatedEnvelope || args?.envelope || args?.handleId);
        // Проверяем печать, валидацию и обязательное сохранение в Vault (для пользовательских сообщений)
        const read = authority.readEnvelopeInternal(handle, authority.token);
        if (!read.ok) return { ok: false, error: read.error };
        const rec = read.record;

        if (!rec.validated) {
          return { ok: false, error: guard.recordViolation('RM-106', 'Конверт должен пройти pack.validate до transfer.enqueue') };
        }
        if (rec.kind !== 'control' && !rec.vaultSaved) {
          return { ok: false, error: guard.recordViolation('RM-103', 'Сначала сохрани конверт через vault.append, затем ставь в transfer.enqueue') };
        }

        // Идемпотентность: повторный enqueue с тем же ключом не создаёт дубль!
        if (idempotencyIndex.has(rec.idempotencyKey)) {
          const existingId = idempotencyIndex.get(rec.idempotencyKey);
          const existing = transfers.get(existingId);
          return {
            ok: true,
            data: { transferId: existingId, status: existing.status, deduplicated: true, outboxSeq: existing.outboxSeq },
          };
        }

        seqTransfer += 1;
        const transferId = `trf-${String(seqTransfer).padStart(6, '0')}`;
        const state = {
          transferId,
          outboxSeq: seqTransfer,
          envelopeHandle: handle,
          handleId: handle.handleId,
          msgId: rec.body.msgId || rec.body.controlId,
          chatId: rec.chatId,
          network: rec.network,
          kind: rec.kind,
          priority: args?.priority || 'normal',
          status: 'queued',
          stage: 'outbox',
          stages: [
            { stage: 'packed', ts: rec.body.ts || Date.now() },
            { stage: 'vault_saved', ts: Date.now() },
            { stage: 'outbox_queued', ts: Date.now() },
          ],
          attempts: 0,
          chunkProgress: rec.body.attachment
            ? { sentChunks: 0, totalChunks: rec.body.attachment.totalChunks, paused: false }
            : null,
          routeUsed: null,
          remoteId: null,
          lastError: null,
          createdAt: Date.now(),
        };
        transfers.set(transferId, state);
        idempotencyIndex.set(rec.idempotencyKey, transferId);
        authority.markEnvelopeOutboxQueued(handle, transferId);

        vaultStore.upsertOutbox({
          transferId,
          handleId: handle.handleId,
          msgId: state.msgId,
          chatId: rec.chatId,
          network: rec.network,
          status: 'queued',
          createdAt: state.createdAt,
        });
        if (rec.kind !== 'control') {
          vaultStore.patchMessage(rec.network, rec.chatId, rec.body.msgId, { status: 'queued', transferId });
        }
        // Интеграция с PriorityTransferScheduler + CircuitBreaker + AIMD Congestion Controller
        const defaultPriority = rec.kind === 'control' ? 'urgent' : (rec.kind === 'media' && (rec.body.attachment?.sizeBytes || 0) > 65536 ? 'bulk' : 'high');
        const chosenPriority = args?.priority || defaultPriority;
        state.priority = chosenPriority;
        scheduler.schedule({ transferId, network: rec.network, priority: chosenPriority, nextRunAt: 0, attempt: 0 });
        core.watch.emit('transfer.queued', { transferId, chatId: rec.chatId, network: rec.network, priority: chosenPriority });
        return { ok: true, data: { transferId, outboxSeq: seqTransfer, status: 'queued', priority: chosenPriority, deduplicated: false } };
      },

      async dispatch(args, ctx) {
        const transferId = args?.transferId;
        const state = transfers.get(transferId);
        if (!state) return { ok: false, error: makeError('RM-104', `Передача ${transferId} не найдена в Outbox`) };

        // Жёсткий 5-барьерный чек TransferGuard перед отправкой наружу!
        const verified = guard.verifyEnvelopeForDispatch(state.envelopeHandle, {
          requireVault: state.kind !== 'control',
          requireOutbox: true,
        });
        if (!verified.ok) return { ok: false, error: verified.error };

        if (state.status === 'cancelled') {
          return { ok: false, error: makeError('RM-104', `Передача ${transferId} отменена`) };
        }

        const read = authority.readEnvelopeInternal(state.envelopeHandle, authority.token);
        const rec = read.record;
        state.attempts += 1;
        state.status = 'sending';
        state.stage = 'preflight';

        const routePlan = ensureRoutePlan(state.network);
        if (!routePlan.ok) {
          state.status = 'held_outbox';
          state.stage = 'route_blocked';
          state.lastError = routePlan.error;
          state.stages.push({ stage: 'route_blocked', code: routePlan.error.code, ts: Date.now() });
          chrono.recordRouteFailure({ network: state.network, routeId: 'primary', code: routePlan.error.code });
          vaultStore.upsertOutbox({ transferId, msgId: state.msgId, chatId: state.chatId, network: state.network, status: 'held_outbox', errorCode: routePlan.error.code });
          if (state.kind !== 'control') {
            vaultStore.patchMessage(state.network, state.chatId, state.msgId, { status: 'held_outbox', errorCode: routePlan.error.code });
          }
          return { ok: false, error: routePlan.error };
        }

        // Родной чат RatMes <-> RatMes обязан шифроваться через SecretVault
        if (state.network === 'ratmes' && !rec.encrypted) {
          const kRes = await rawTools.crypto.ensureChatKey({ chatId: state.chatId }, ctx);
          if (kRes.ok) {
            await rawTools.crypto.sealEnvelope({ envelope: state.envelopeHandle, keyHandle: kRes.data.keyHandle }, ctx);
          }
        }

        // Подписываем вызов внутри SecretVault по SessionHandle (токен не покидает контур!)
        let signedHeader = null;
        const ses = resolveSession(null, state.network);
        if (ses) {
          const signRes = await rawTools.crypto.signRequest({
            sessionHandle: ses,
            requestMeta: { transferId, chatId: state.chatId, ts: Date.now() },
          }, ctx);
          if (signRes.ok) signedHeader = signRes.data.signature;
        }

        state.stage = 'bridge_dispatch';
        state.stages.push({ stage: 'bridge_dispatch', route: routePlan.activeRoute, ts: Date.now() });

        // Проверка Circuit Breaker маршрута перед отправкой
        const cbCheck = scheduler.breaker.canPass(state.network, routePlan.activeRoute);
        if (!cbCheck.allowed) {
          // Автоматический План Б при открытом Circuit Breaker!
          const failoverRes = await rawTools.route.failover({ network: state.network }, ctx);
          if (!failoverRes.ok || !failoverRes.data?.activeRoute) {
            const err = makeError('RM-303', `Circuit Breaker OPEN для ${state.network} (${routePlan.activeRoute}) — ждём восстановления`);
            state.status = 'retry_wait';
            state.lastError = err;
            scheduler.rescheduleWithBackoff({ transferId, network: state.network, priority: state.priority, attempt: state.attempts });
            return { ok: false, error: err };
          }
          routePlan.activeRoute = failoverRes.data.activeRoute;
        }

        const cong = scheduler.congestion.tryAcquire(state.network, 1);
        const dispatchStarted = performance.now();
        const delivered = await supervisor.deliverSealed({
          networkId: state.network,
          envelopeRecord: rec,
          routePlan,
          signedHeader,
        });
        const rttMs = Math.max(1, Math.round(performance.now() - dispatchStarted));

        if (!delivered.ok) {
          if (cong.allowed) scheduler.congestion.onCongestion(state.network);
          const cbState = scheduler.breaker.recordFailure(state.network, routePlan.activeRoute, delivered.error.code);
          if (cbState.tripped) scheduler.telemetry.circuitTrips += 1;
          scheduler.rescheduleWithBackoff({ transferId, network: state.network, priority: state.priority, attempt: state.attempts });

          state.status = 'retry_wait';
          state.stage = 'bridge_fault';
          state.lastError = delivered.error;
          state.stages.push({ stage: 'bridge_fault', code: delivered.error.code, circuitState: cbState.state, ts: Date.now() });
          if (delivered.error.code === 'RM-404') {
            chrono.setBackpressure({ rateLimitedUntil: Date.now() + 15000 });
          }
          chrono.recordRouteFailure({ network: state.network, routeId: routePlan.activeRoute, code: delivered.error.code });
          vaultStore.upsertOutbox({ transferId, msgId: state.msgId, chatId: state.chatId, network: state.network, status: 'retry_wait', errorCode: delivered.error.code });
          if (state.kind !== 'control') {
            vaultStore.patchMessage(state.network, state.chatId, state.msgId, { status: 'retry_wait', errorCode: delivered.error.code });
          }
          return { ok: false, error: delivered.error };
        }

        if (cong.allowed) scheduler.congestion.onAck(state.network);
        scheduler.breaker.recordSuccess(state.network, routePlan.activeRoute, delivered.rttMs || rttMs);
        scheduler.remove(transferId);

        state.routeUsed = delivered.routeUsed;
        state.remoteId = delivered.remoteId;
        state.lastError = null;
        state.status = 'sent';
        state.stage = 'remote_ack';
        state.stages.push({ stage: 'delivered', remoteId: delivered.remoteId, serverSeq: delivered.serverSeq, ts: Date.now() });

        // Подтверждаем доставку и очищаем Outbox
        await rawTools.transfer.ack({
          transferId,
          ackKind: 'delivered',
          remoteId: delivered.remoteId,
          serverSeq: delivered.serverSeq,
        }, ctx);

        return {
          ok: true,
          data: {
            transferId,
            status: state.status,
            remoteId: delivered.remoteId,
            serverSeq: delivered.serverSeq,
            routeUsed: delivered.routeUsed,
            encrypted: rec.encrypted,
          },
        };
      },

      // Потоковая передача чанков больших файлов с докачкой при обрыве VPN!
      async streamChunk(args) {
        const { transferId, attachmentHandle, resumeFromChunk = null, simulateDropAtChunk = null } = args || {};
        const state = transfers.get(transferId);
        if (!state) return { ok: false, error: makeError('RM-104', `Передача ${transferId} не найдена`) };

        const attHandle = resolveAttachment(attachmentHandle || state.envelopeHandle?.handleId);
        const readAtt = authority.readAttachmentInternal(attHandle, authority.token);
        if (!readAtt.ok) return { ok: false, error: readAtt.error };
        const att = readAtt.record;

        const routePlan = ensureRoutePlan(state.network);
        if (!routePlan.ok) {
          state.status = 'paused';
          state.stage = 'chunk_route_blocked';
          state.lastError = routePlan.error;
          return { ok: false, error: routePlan.error };
        }

        if (!state.chunkProgress) {
          state.chunkProgress = { sentChunks: 0, totalChunks: att.totalChunks, paused: false, chunkHashes: [] };
        }
        if (Number.isInteger(resumeFromChunk) && resumeFromChunk >= 0) {
          state.chunkProgress.sentChunks = Math.min(resumeFromChunk, att.totalChunks);
        }
        state.chunkProgress.paused = false;
        state.status = 'streaming';
        state.stage = 'chunk_stream';

        const started = performance.now();
        for (let i = state.chunkProgress.sentChunks; i < att.totalChunks; i += 1) {
          if (simulateDropAtChunk !== null && i === simulateDropAtChunk) {
            state.chunkProgress.paused = true;
            state.status = 'paused';
            state.stage = `dropped_at_chunk_${i}`;
            const err = makeError('RM-302', `Обрыв VPN на чанке ${i + 1}/${att.totalChunks} — прогресс сохранён для докачки`, {
              details: { resumeFromChunk: i, sentChunks: i, totalChunks: att.totalChunks },
            });
            state.lastError = err;
            chrono.recordRouteFailure({ network: state.network, routeId: routePlan.activeRoute, code: 'RM-302' });
            return { ok: false, error: err };
          }
          const slice = att.bytes.subarray(i * att.chunkSize, Math.min(att.bytes.byteLength, (i + 1) * att.chunkSize));
          const chunkHash = (await sha256Hex(slice)).slice(0, 16);
          state.chunkProgress.chunkHashes = state.chunkProgress.chunkHashes || [];
          state.chunkProgress.chunkHashes[i] = chunkHash;
          state.chunkProgress.sentChunks = i + 1;
        }

        const elapsedSec = Math.max(0.001, (performance.now() - started) / 1000);
        state.status = 'streamed';
        state.stage = 'chunks_complete';
        state.lastError = null;
        state.stages.push({ stage: 'chunks_complete', totalChunks: att.totalChunks, ts: Date.now() });

        return {
          ok: true,
          data: {
            transferId,
            sentChunks: state.chunkProgress.sentChunks,
            totalChunks: att.totalChunks,
            bytesPerSec: Math.round(att.bytes.byteLength / elapsedSec),
            sha256: att.sha256,
            done: state.chunkProgress.sentChunks >= att.totalChunks,
          },
        };
      },

      async receive(args) {
        const {
          sourceChannel = 'native',
          network = 'ratmes',
          chatId,
          chatTitle,
          senderName = 'Собеседник',
          senderId = null,
          direction = 'in',
          text = '',
          incomingSeq = null,
          msgId = null,
          attachment = null,
          ts = null,
        } = args || {};
        if (!chatId) return { ok: false, error: makeError('RM-104', 'Для transfer.receive требуется chatId') };

        const finalMsgId = msgId || nextUuidV7();
        const existingPage = vaultStore.readPage(chatId, { limit: 200 });
        if (existingPage.messages.some((m) => m.msgId === finalMsgId)) {
          return { ok: true, data: { msgId: finalMsgId, chatId, deduplicated: true, savedToVault: true } };
        }

        const prevCursor = chatCursors.get(chatId) || existingPage.total;
        let gapDetected = null;
        if (incomingSeq !== null && incomingSeq > prevCursor + 1) {
          gapDetected = { fromSeq: prevCursor + 1, toSeq: incomingSeq - 1 };
        }
        const seq = incomingSeq !== null ? incomingSeq : prevCursor + 1;
        chatCursors.set(chatId, Math.max(prevCursor, seq));
        const finalDirection = direction === 'out' ? 'out' : 'in';
        const parsedTs = typeof ts === 'number' && Number.isFinite(ts)
          ? ts
          : (typeof ts === 'string' && !Number.isNaN(Date.parse(ts)) ? Date.parse(ts) : Date.now());

        const record = {
          msgId: finalMsgId,
          chatId,
          chatTitle: chatTitle || chatMetaExtra.get(chatId)?.title || chatId,
          network,
          direction: finalDirection,
          senderId: senderId || `${sourceChannel}:${senderName}`,
          senderName,
          text,
          attachment,
          seq,
          hlc: nextHlc(),
          ts: parsedTs,
          status: finalDirection === 'out' ? 'delivered' : 'received',
        };
        vaultStore.appendMessage(record);
        searchIndex.indexMessage(record);
        cache.admit(`chat:${chatId}`, { kind: 'chat', bytes: 4096 + text.length * 2, value: record });
        core.watch.emit('transfer.received', { msgId: finalMsgId, chatId, network, seq, gapDetected });

        return {
          ok: true,
          data: {
            msgId: finalMsgId,
            chatId,
            seq,
            savedToVault: true,
            gapDetected,
            message: record,
          },
        };
      },

      async ack(args) {
        const { transferId, ackKind = 'delivered', remoteId = null, serverSeq = null } = args || {};
        const state = transfers.get(transferId);
        if (!state) return { ok: false, error: makeError('RM-104', `Передача ${transferId} не найдена`) };
        state.status = ackKind;
        if (remoteId) state.remoteId = remoteId;
        if (serverSeq !== null) {
          state.serverSeq = serverSeq;
          chatCursors.set(state.chatId, Math.max(chatCursors.get(state.chatId) || 0, serverSeq));
        }
        const clearOutbox = ackKind === 'sent' || ackKind === 'delivered' || ackKind === 'read';
        if (clearOutbox) vaultStore.removeOutbox(transferId);
        if (state.kind !== 'control') {
          vaultStore.patchMessage(state.network, state.chatId, state.msgId, {
            status: ackKind,
            remoteId: state.remoteId,
            errorCode: null,
          });
        }
        core.watch.emit('transfer.ack', { transferId, ackKind, chatId: state.chatId, msgId: state.msgId });
        return { ok: true, data: { transferId, status: state.status, outboxCleared: clearOutbox } };
      },

      async retry(args) {
        const state = transfers.get(args?.transferId);
        if (!state) return { ok: false, error: makeError('RM-104', `Передача ${args?.transferId} не найдена`) };
        const jitter = Math.round(core.rand() * 200);
        const delayMs = Math.min(30000, 500 * (2 ** Math.min(state.attempts, 5)) + jitter);
        const nextAttemptTick = core.clock.tick + Math.max(1, Math.round((delayMs / 1000) / core.clock.step));
        state.stages.push({ stage: 'retry_scheduled', delayMs, reason: args?.reason || 'auto', ts: Date.now() });
        return { ok: true, data: { transferId: state.transferId, attemptNo: state.attempts + 1, delayMs, nextAttemptTick } };
      },

      async reroute(args, ctx) {
        const { transferId, fallbackMode = 'backup-vpn' } = args || {};
        const state = transfers.get(transferId);
        if (!state) return { ok: false, error: makeError('RM-104', `Передача ${transferId} не найдена`) };
        if (fallbackMode === 'backup-vpn') {
          await rawTools.route.failover({ network: state.network, failedRouteId: 'primary' }, ctx);
        }
        state.stages.push({ stage: 'rerouted', fallbackMode, ts: Date.now() });
        const routePlan = ensureRoutePlan(state.network);
        return {
          ok: true,
          data: {
            transferId,
            fallbackMode,
            newRoute: routePlan.ok ? routePlan.activeRoute : 'outbox-hold',
          },
        };
      },

      async pause(args) {
        const state = transfers.get(args?.transferId);
        if (!state) return { ok: false, error: makeError('RM-104', 'Передача не найдена') };
        state.status = 'paused';
        if (state.chunkProgress) state.chunkProgress.paused = true;
        return { ok: true, data: { transferId: state.transferId, state: state.status } };
      },

      async resume(args, ctx) {
        const state = transfers.get(args?.transferId);
        if (!state) return { ok: false, error: makeError('RM-104', 'Передача не найдена') };
        if (state.chunkProgress) {
          const read = authority.readEnvelopeInternal(state.envelopeHandle, authority.token);
          const attId = read.ok ? read.record.body.attachment?.handleId : null;
          if (attId) {
            return rawTools.transfer.streamChunk({
              transferId: state.transferId,
              attachmentHandle: attId,
              resumeFromChunk: state.chunkProgress.sentChunks,
            }, ctx);
          }
        }
        return rawTools.transfer.dispatch({ transferId: state.transferId }, ctx);
      },

      async cancel(args) {
        const state = transfers.get(args?.transferId);
        if (!state) return { ok: false, error: makeError('RM-104', 'Передача не найдена') };
        state.status = 'cancelled';
        vaultStore.removeOutbox(state.transferId);
        if (state.kind !== 'control') {
          vaultStore.patchMessage(state.network, state.chatId, state.msgId, { status: 'cancelled' });
        }
        return { ok: true, data: { transferId: state.transferId, state: 'cancelled' } };
      },

      async inspect(args) {
        const state = transfers.get(args?.transferId);
        if (!state) {
          return {
            ok: true,
            data: {
              activeTransfers: Array.from(transfers.values()).slice(-20).map((t) => ({
                transferId: t.transferId,
                chatId: t.chatId,
                network: t.network,
                priority: t.priority,
                status: t.status,
                stage: t.stage,
                routeUsed: t.routeUsed,
                chunkProgress: t.chunkProgress
                  ? {
                      ...t.chunkProgress,
                      chunkMap: buildChunkMap(
                        t.chunkProgress.totalChunks,
                        t.chunkProgress.sentChunks,
                        t.status === 'paused' ? t.chunkProgress.sentChunks : null,
                      ),
                    }
                  : null,
                lastError: t.lastError,
              })),
            },
          };
        }
        return {
          ok: true,
          data: {
            transferId: state.transferId,
            msgId: state.msgId,
            chatId: state.chatId,
            network: state.network,
            priority: state.priority,
            status: state.status,
            currentStage: state.stage,
            stages: state.stages,
            routeUsed: state.routeUsed,
            chunkProgress: state.chunkProgress
              ? {
                  ...state.chunkProgress,
                  chunkMap: buildChunkMap(
                    state.chunkProgress.totalChunks,
                    state.chunkProgress.sentChunks,
                    state.status === 'paused' ? state.chunkProgress.sentChunks : null,
                  ),
                }
              : null,
            lastError: state.lastError,
            attempts: state.attempts,
          },
        };
      },

      // Автоматическая прокачка Outbox строго по приоритетам (urgent -> high -> normal -> bulk)
      async pumpOutbox(args, ctx) {
        const maxPerTick = Math.max(1, Math.min(20, Number(args?.maxPerTick) || 4));
        const now = args?.forceNow ? Date.now() + 3600000 : Date.now();
        const processed = [];
        for (let i = 0; i < maxPerTick; i += 1) {
          const item = scheduler.popReady(now);
          if (!item) break;
          const st = transfers.get(item.transferId);
          if (!st || st.status === 'delivered' || st.status === 'cancelled') continue;
          const r = await rawTools.transfer.dispatch({ transferId: item.transferId }, ctx);
          processed.push({ transferId: item.transferId, priority: item.priority, ok: r.ok, code: r.error?.code || 'OK' });
        }
        return {
          ok: true,
          data: {
            processedCount: processed.length,
            processed,
            remaining: scheduler.pendingCounts(),
          },
        };
      },

      async schedulerStatus() {
        return { ok: true, data: scheduler.status() };
      },
    },

    // 3. tools.relay.* (поверх ratcore-bridge/1)
    relay: {
      async handshake(args) {
        const { peerId = 'web-pwa', transport = 'ws', allowGroups = ['*'] } = args || {};
        const res = core.bridge.connect({ peerId, target: 'ratmes-peer', transport, allowGroups });
        if (!res.ok) return res;
        return {
          ok: true,
          data: {
            linkId: res.link.linkId,
            protocol: core.protocol,
            transport,
            stateHash: computeStateHash(),
            peerCapabilities: Object.keys(TOOL_GROUPS_DOC),
          },
        };
      },

      async pushDelta(args) {
        const { linkId, delta = {} } = args || {};
        const serialized = JSON.stringify(delta);
        const compressed = await core.compressBytes(serialized);
        const wrapped = core.bridge.wrapPacket(linkId, 'delta', {
          codec: compressed.codec,
          rawBytes: compressed.rawBytes,
          compressedBytes: compressed.bytes.byteLength,
          delta,
        }, computeStateHash());
        if (!wrapped.ok) return wrapped;
        return {
          ok: true,
          data: {
            packetId: wrapped.envelope.packetId,
            protocol: wrapped.envelope.protocol,
            compressedBytes: compressed.bytes.byteLength,
            rawBytes: compressed.rawBytes,
            stateHash: wrapped.envelope.stateHash,
          },
        };
      },

      async syncHash(args) {
        const { linkId, remoteHash } = args || {};
        const localHash = computeStateHash();
        const check = core.bridge.checkDesync(linkId, localHash, remoteHash || localHash);
        if (!check.ok) return check;
        if (!check.inSync) {
          return {
            ok: true,
            data: { inSync: false, code: 'RC-604', localHash, remoteHash, action: 'gap.repair recommended' },
          };
        }
        return { ok: true, data: { inSync: true, localHash, remoteHash: check.remoteHash } };
      },

      async offload(args) {
        const { taskKind = 'compress', payload = '' } = args || {};
        const started = performance.now();
        let summary = {};
        if (taskKind === 'compress') {
          const c = await core.compressBytes(typeof payload === 'string' ? payload : JSON.stringify(payload));
          summary = { codec: c.codec, rawBytes: c.rawBytes, compressedBytes: c.bytes.byteLength };
        } else if (taskKind === 'hash') {
          summary = { sha256: await sha256Hex(typeof payload === 'string' ? payload : JSON.stringify(payload)) };
        } else {
          summary = { taskKind, processed: true };
        }
        return {
          ok: true,
          data: {
            jobId: `wrk-${core.clock.tick}-${Math.floor(core.rand() * 10000)}`,
            transport: 'worker',
            costMs: Number((performance.now() - started).toFixed(3)),
            summary,
          },
        };
      },

      async lanDiscover() {
        const livePeers = attachedLanMesh ? attachedLanMesh.listPeers() : [];
        const fallbackPeers = Array.from(lanPeers.values());
        return {
          ok: true,
          data: {
            peers: livePeers.length ? livePeers : fallbackPeers,
            liveMeshActive: Boolean(attachedLanMesh),
            livePeersCount: livePeers.length,
            offlineCapable: true,
          },
        };
      },

      async lanSend(args, ctx) {
        const { peerId, envelope } = args || {};
        const handle = resolveEnvelope(envelope);
        const read = authority.readEnvelopeInternal(handle, authority.token);
        if (!read.ok) return { ok: false, error: read.error };
        if (!read.record.validated) {
          return { ok: false, error: guard.recordViolation('RM-106', 'Для LAN-передачи нужен проверенный pack.validate конверт') };
        }
        if (!read.record.encrypted) {
          const kRes = await rawTools.crypto.ensureChatKey({ chatId: read.record.chatId }, ctx);
          if (kRes.ok) await rawTools.crypto.sealEnvelope({ envelope: handle, keyHandle: kRes.data.keyHandle }, ctx);
        }

        // Если подключён живой LAN Mesh — отправляем реально по HTTP+AES-256-GCM на другой RatMes Agent!
        if (attachedLanMesh && attachedLanMesh.listPeers().some((p) => p.peerId === peerId)) {
          try {
            const liveRes = await attachedLanMesh.sendEncryptedToPeer({
              peerId,
              chatId: read.record.chatId,
              chatTitle: read.record.body.chatTitle,
              text: read.record.body.text,
              msgId: read.record.body.msgId,
            });
            return { ok: true, data: { ...liveRes, handleId: handle.handleId, transport: 'lan-p2p-live' } };
          } catch (err) {
            return { ok: false, error: makeError('RM-303', `Ошибка живой LAN-доставки: ${err.message}`) };
          }
        }

        const peer = lanPeers.get(peerId);
        if (!peer || !peer.online) {
          return { ok: false, error: makeError('RM-303', `Устройство ${peerId} не найдено в локальной сети LAN/Wi-Fi`) };
        }
        return {
          ok: true,
          data: {
            peerId,
            ip: peer.ip,
            handleId: handle.handleId,
            encrypted: true,
            transport: 'lan-p2p',
            lanLatencyMs: peer.rttMs,
          },
        };
      },
    },

    // 4. tools.gap.*
    gap: {
      async check(args) {
        const { chatId, incomingSeq } = args || {};
        const current = chatCursors.get(chatId) || vaultStore.readPage(chatId, { limit: 1 }).total;
        const contiguous = incomingSeq <= current + 1;
        return {
          ok: true,
          data: {
            chatId,
            currentCursor: current,
            incomingSeq,
            contiguous,
            ...(contiguous ? {} : { code: 'RM-601', missingRange: { fromSeq: current + 1, toSeq: incomingSeq - 1 } }),
          },
        };
      },

      async repair(args, ctx) {
        const { chatId, network = 'ratmes', fromSeq, toSeq } = args || {};
        const recovered = [];
        for (let s = fromSeq; s <= toSeq; s += 1) {
          const r = await rawTools.transfer.receive({
            sourceChannel: 'gap-repair',
            network,
            chatId,
            senderName: 'Восстановлено (Gap Engine)',
            text: `[Восстановленное сообщение #${s} после обрыва связи]`,
            incomingSeq: s,
          }, ctx);
          if (r.ok) recovered.push(r.data.msgId);
        }
        const newCursor = Math.max(chatCursors.get(chatId) || 0, toSeq);
        chatCursors.set(chatId, newCursor);
        return { ok: true, data: { chatId, recoveredCount: recovered.length, newCursor } };
      },

      async merge(args) {
        const { localOps = [], remoteOps = [] } = args || {};
        const byId = new Map();
        let conflictsResolved = 0;
        for (const op of [...localOps, ...remoteOps]) {
          const prev = byId.get(op.msgId);
          if (!prev) {
            byId.set(op.msgId, { ...op });
          } else {
            conflictsResolved += 1;
            // Tombstone (мягкое удаление) всегда побеждает, иначе побеждает старший HLC
            if (op.deleted || (!prev.deleted && String(op.hlc || '') > String(prev.hlc || ''))) {
              byId.set(op.msgId, { ...prev, ...op, deleted: Boolean(prev.deleted || op.deleted) });
            }
          }
        }
        const merged = Array.from(byId.values()).sort((a, b) => String(a.hlc || '').localeCompare(String(b.hlc || '')));
        return { ok: true, data: { mergedCount: merged.length, conflictsResolved, merged } };
      },

      async checkpoint(args) {
        const { chatId, cursor } = args || {};
        chatCursors.set(chatId, cursor);
        return { ok: true, data: { chatId, savedCursor: cursor } };
      },
    },

    // 5. tools.vault.*
    vault: {
      async append(args) {
        const handle = resolveEnvelope(args?.envelope || args?.handleId);
        const read = authority.readEnvelopeInternal(handle, authority.token);
        if (!read.ok) return { ok: false, error: read.error };
        const rec = read.record;
        if (rec.kind === 'control') {
          return { ok: true, data: { skippedControl: true } };
        }
        const seq = (chatCursors.get(rec.chatId) || vaultStore.readPage(rec.chatId, { limit: 1 }).total) + 1;
        chatCursors.set(rec.chatId, seq);
        const msg = { ...rec.body, seq };
        const res = vaultStore.appendMessage(msg);
        authority.markEnvelopeVaultSaved(handle, res);
        searchIndex.indexMessage(msg);
        workspace.markRead(rec.chatId, seq);
        persistWorkspace();
        cache.admit(`chat:${rec.chatId}`, { kind: 'chat', bytes: 4096 + (msg.text?.length || 0) * 2, value: msg, forceHot: true });
        return { ok: true, data: { ...res, msgId: msg.msgId, seq } };
      },

      async storeMedia(args) {
        const attHandle = resolveAttachment(args?.attachmentHandle || args?.handleId);
        const read = authority.readAttachmentInternal(attHandle, authority.token);
        if (!read.ok) return { ok: false, error: read.error };
        const att = read.record;
        const actualHash = await sha256Hex(att.bytes);
        if (actualHash !== att.sha256) {
          return { ok: false, error: makeError('RM-204', 'SHA-256 вложения не совпал при записи в RatMes-Vault/') };
        }
        const stored = vaultStore.storeMedia({
          chatId: att.chatId,
          filename: att.filename,
          bytes: att.bytes,
          sha256: att.sha256,
        });
        att.storedPath = stored.relativePath;
        // Обновляем путь вложения в последнем сообщении чата, чтобы медиа можно было открыть прямо из Vault
        const page = vaultStore.readPage(att.chatId, { limit: 10 });
        const ownerMsg = [...page.messages].reverse().find((m) => m.attachment?.handleId === att.handleId);
        if (ownerMsg) {
          vaultStore.patchMessage(ownerMsg.network, ownerMsg.chatId, ownerMsg.msgId, {
            attachment: { ...ownerMsg.attachment, storedPath: stored.relativePath },
          });
        }
        return { ok: true, data: stored };
      },

      async readPage(args) {
        const { chatId, beforeSeq = null, limit = 50 } = args || {};
        chrono.touchActivity(chatId);
        const page = vaultStore.readPage(chatId, { beforeSeq, limit });
        const pinnedIds = new Set(workspace.getChatMeta(chatId).pinnedMessageIds);
        const enriched = page.messages.map((m) => ({
          ...m,
          pinned: pinnedIds.has(m.msgId),
          reactions: workspace.getReactionsForMessage(m.msgId),
          editHistory: workspace.getEditHistory(m.msgId),
        }));
        cache.admit(`chat:${chatId}`, { kind: 'chat', bytes: 4096 + enriched.length * 256, value: enriched });
        return { ok: true, data: { ...page, messages: enriched } };
      },

      async healTail() {
        const res = vaultStore.healTail();
        if (res.tailsHealed > 0) searchIndex.rebuildFromVault(vaultStore, workspace.getAllPinnedMessageIds());
        return {
          ok: true,
          data: {
            ...res,
            ...(res.tailsHealed > 0 ? { noticeCode: 'RM-201' } : {}),
          },
        };
      },

      async rebuildIndex() {
        const res = vaultStore.rebuildIndex();
        const searchRes = searchIndex.rebuildFromVault(vaultStore, workspace.getAllPinnedMessageIds());
        return { ok: true, data: { ...res, search: searchRes, noticeCode: 'RM-203' } };
      },

      async importBundle(args) {
        const { files = {}, bundleId = null } = args || {};
        let sourceFiles = files;
        if (bundleId && bundleById.has(bundleId)) {
          const bh = bundleById.get(bundleId);
          const read = authority.readBundleInternal(bh, authority.token);
          if (read.ok) {
            const raw = await core.decompressBytes(read.record.bytes, read.record.codec);
            sourceFiles = JSON.parse(new TextDecoder().decode(raw));
          }
        }
        let importedMessages = 0;
        let deduplicated = 0;
        for (const [relPath, content] of Object.entries(sourceFiles || {})) {
          if (!relPath.endsWith('messages.jsonl') || typeof content !== 'string') continue;
          for (const line of content.split('\n')) {
            if (!line.trim()) continue;
            try {
              const parsed = JSON.parse(line);
              if (!parsed.msgId || parsed.eventType === 'patch') continue;
              const existing = vaultStore.getMessageById?.(parsed.chatId, parsed.msgId);
              if (existing) {
                deduplicated += 1;
              } else {
                vaultStore.appendMessage(parsed);
                searchIndex.indexMessage(parsed);
                importedMessages += 1;
              }
            } catch { /* skip malformed */ }
          }
        }
        return { ok: true, data: { importedMessages, deduplicated } };
      },

      async verifyIntegrity() {
        return { ok: true, data: vaultStore.verifyIntegrity() };
      },

      async listChats() {
        const rawChats = vaultStore.listChats();
        const seenIds = new Set(rawChats.map((c) => c.chatId));
        const merged = rawChats.map((c) => {
          const extra = chatMetaExtra.get(c.chatId);
          return {
            ...c,
            title: extra?.title || c.title || c.chatId,
            roomType: extra?.roomType || (c.chatId.startsWith('dm-') ? 'dm' : c.chatId.startsWith('room-') ? 'group' : 'public'),
            participants: extra?.participants || [],
            description: extra?.description || '',
          };
        });
        for (const [chatId, extra] of chatMetaExtra.entries()) {
          if (seenIds.has(chatId)) continue;
          merged.push({
            chatId,
            title: extra.title || chatId,
            network: extra.network || 'ratmes',
            roomType: extra.roomType || (chatId.startsWith('dm-') ? 'dm' : chatId.startsWith('room-') ? 'group' : 'public'),
            participants: extra.participants || [],
            description: extra.description || '',
            messageCount: 0,
            lastSeq: 0,
            lastTs: extra.lastTs || 0,
            lastText: extra.description || '',
          });
        }
        const enriched = merged.map((c) => {
          const meta = workspace.getChatMeta(c.chatId, c.lastSeq);
          return {
            ...c,
            pinnedChat: meta.pinnedChat,
            muted: meta.muted,
            archived: meta.archived,
            unreadCount: meta.unreadCount,
            draftText: meta.draftText,
            pinnedMessageCount: meta.pinnedMessageIds.length,
          };
        }).sort((a, b) => (Number(b.pinnedChat) - Number(a.pinnedChat)) || (b.lastTs - a.lastTs));
        return { ok: true, data: { chats: enriched, backend: vaultStore.backend, rootDir: vaultStore.rootDir } };
      },

      async listPlainFiles() {
        return { ok: true, data: { backend: vaultStore.backend, rootDir: vaultStore.rootDir, files: vaultStore.listPlainFiles() } };
      },

      async readPlainTextFile(args) {
        const content = vaultStore.readPlainTextFile(args?.path);
        if (content === null) {
          return { ok: false, error: makeError('RM-202', `Файл ${args?.path} не найден в RatMes-Vault/`) };
        }
        return { ok: true, data: { path: args.path, content } };
      },

      async exportReadable() {
        return { ok: true, data: { files: vaultStore.exportAllReadable() } };
      },
    },

    // 6. tools.crypto.* (SecretVault + AES-256-GCM Ratchet)
    crypto: {
      async ensureChatKey(args, ctx) {
        const { chatId } = args || {};
        if (!chatId) return { ok: false, error: makeError('RM-602', 'Укажи chatId для ключа шифрования') };
        if (keyByChat.has(chatId)) {
          return { ok: true, data: { keyHandle: keyByChat.get(chatId), created: false } };
        }
        const keyBytes = deriveDeterministicKeyBytes(`ratmes-e2ee:${chatId}:${seed}`, core.rand);
        const keyHandle = authority.mintKey({ chatId, epoch: 1, keyBytes, actorId: ctx.actorId, traceId: ctx.traceId });
        keyById.set(keyHandle.handleId, keyHandle);
        keyByChat.set(chatId, keyHandle);
        return { ok: true, data: { keyHandle, created: true } };
      },

      async sealEnvelope(args) {
        const envHandle = resolveEnvelope(args?.envelope || args?.handleId);
        const envRead = authority.readEnvelopeInternal(envHandle, authority.token);
        if (!envRead.ok) return { ok: false, error: envRead.error };
        const keyHandle = resolveKey(args?.keyHandle, envRead.record.chatId);
        const keyRead = authority.readKeyInternal(keyHandle, authority.token);
        if (!keyRead.ok) return { ok: false, error: keyRead.error };

        keyRead.record.step += 1;
        const cipherPacket = await encryptRatchetPayload({
          baseKeyBytes: keyRead.record.keyBytes,
          epoch: keyRead.record.epoch,
          step: keyRead.record.step,
          plaintextObj: { text: envRead.record.body.text, msgId: envRead.record.body.msgId },
          prngFn: core.rand,
        });
        authority.markEnvelopeEncrypted(envHandle, { alg: cipherPacket.alg, epoch: cipherPacket.epoch, step: cipherPacket.step });
        return { ok: true, data: { handleId: envHandle.handleId, cipherPacket } };
      },

      async openEnvelope(args) {
        const { cipherPacket, keyHandle, chatId } = args || {};
        const kh = resolveKey(keyHandle, chatId);
        const keyRead = authority.readKeyInternal(kh, authority.token);
        if (!keyRead.ok) return { ok: false, error: keyRead.error };
        try {
          const plaintext = await decryptRatchetPayload({ baseKeyBytes: keyRead.record.keyBytes, cipherPacket });
          return { ok: true, data: { plaintext, epoch: cipherPacket.epoch, step: cipherPacket.step } };
        } catch {
          return { ok: false, error: makeError('RM-602', 'Не удалось расшифровать или проверить подпись конверта') };
        }
      },

      async storeSession(args, ctx) {
        const { network, accountLabel = 'user', secretToken, expiresAt = null } = args || {};
        if (!network || !secretToken) {
          return { ok: false, error: makeError('RM-102', 'Укажи network и secretToken для помещения в SecretVault') };
        }
        const handle = authority.mintSession({
          network,
          accountLabel,
          secretToken,
          expiresAt,
          actorId: ctx.actorId,
          traceId: ctx.traceId,
        });
        sessionById.set(handle.handleId, handle);
        sessionByNetwork.set(network, handle);
        supervisor.injectFault(network, null);
        supervisor.authCheck(network, handle);
        // Наружу возвращается ТОЛЬКО замороженный SessionHandle, без secretToken!
        return { ok: true, data: { sessionHandle: handle } };
      },

      async signRequest(args) {
        const sesHandle = resolveSession(args?.sessionHandle);
        const read = authority.readSessionInternal(sesHandle, authority.token);
        if (!read.ok) return { ok: false, error: read.error };
        const signature = await signWithSecret(read.record.secretToken, args?.requestMeta || {});
        return { ok: true, data: { signature, sessionHandleId: sesHandle.handleId } };
      },

      async verifyTrust(args) {
        const spec = getMessengerSpec(args?.network || 'ratmes');
        if (!spec) return { ok: false, error: makeError('RM-405', 'Неизвестная сеть') };
        return {
          ok: true,
          data: {
            network: spec.id,
            e2ee: spec.e2ee,
            trustLevel: spec.e2eeLabel,
            warning: spec.e2eeWarning ? { code: 'RM-603', message: spec.e2eeWarning } : null,
          },
        };
      },

      async rotateKeys(args, ctx) {
        let rotated = 0;
        for (const [chatId, oldHandle] of keyByChat.entries()) {
          const oldRec = authority.readKeyInternal(oldHandle, authority.token);
          if (!oldRec.ok) continue;
          const nextEpoch = oldRec.record.epoch + 1;
          const nextBytes = deriveDeterministicKeyBytes(`ratmes-e2ee:${chatId}:epoch=${nextEpoch}:${seed}`, core.rand);
          const nextHandle = authority.mintKey({ chatId, epoch: nextEpoch, keyBytes: nextBytes, actorId: ctx.actorId, traceId: ctx.traceId });
          keyById.set(nextHandle.handleId, nextHandle);
          keyByChat.set(chatId, nextHandle);
          rotated += 1;
        }
        return { ok: true, data: { rotatedGroups: rotated } };
      },
    },

    // 7. tools.route.*
    route: {
      async setCountry(args) {
        const code = String(args?.countryCode || 'RU').toUpperCase();
        const profile = getCountryProfile(code);
        if (!profile) return { ok: false, error: makeError('RM-304', `Неизвестный код страны: ${code}`) };
        activeCountry = profile.code;
        core.watch.emit('route.countryChanged', { countryCode: activeCountry });
        return {
          ok: true,
          data: {
            countryCode: profile.code,
            name: profile.name,
            note: profile.note,
            directNets: profile.direct,
            vpnNets: profile.vpnRequired,
          },
        };
      },

      async bindProxy(args) {
        const { network, primaryRoute, backupRoute = null } = args || {};
        if (!getMessengerSpec(network)) return { ok: false, error: makeError('RM-405', `Неизвестная сеть: ${network}`) };
        proxyBindings.set(network, {
          primaryRoute,
          backupRoute,
          activeRoute: primaryRoute,
          primaryDegraded: false,
          allUnavailable: false,
          rttMs: 65,
        });
        core.watch.emit('route.proxyBound', { network, primaryRoute, backupRoute });
        return { ok: true, data: { network, bound: true, primaryRoute, backupRoute } };
      },

      async probe(args) {
        const { network = 'telegram' } = args || {};
        const plan = ensureRoutePlan(network);
        if (!plan.ok) return { ok: true, data: { network, reachable: false, error: plan.error } };
        return { ok: true, data: { network, reachable: true, activeRoute: plan.activeRoute, rttMs: plan.rttMs, status: 'ok' } };
      },

      async failover(args) {
        const { network, allUnavailable = false } = args || {};
        const b = proxyBindings.get(network);
        if (!b) {
          return { ok: false, error: makeError('RM-303', `Для ${network} нет резервного маршрута — пакеты останутся в Outbox`) };
        }
        if (allUnavailable || !b.backupRoute) {
          b.allUnavailable = true;
          chrono.recordRouteFailure({ network, routeId: b.activeRoute, code: 'RM-303' });
          return { ok: true, data: { network, mode: 'outbox-hold', code: 'RM-303', activeRoute: null } };
        }
        b.primaryDegraded = true;
        b.allUnavailable = false;
        b.activeRoute = b.backupRoute;
        b.rttMs = 112;
        chrono.recordRouteFailure({ network, routeId: b.primaryRoute, code: 'RM-302' });
        core.watch.emit('route.failover', { network, activeRoute: b.activeRoute });
        return { ok: true, data: { network, mode: 'backup-vpn', code: 'RM-302', activeRoute: b.activeRoute } };
      },

      async explain(args) {
        const { network = 'telegram' } = args || {};
        const plan = ensureRoutePlan(network);
        if (!plan.ok) {
          return { ok: true, data: { network, badgeTone: 'warn', summary: plan.error.message, code: plan.error.code } };
        }
        return {
          ok: true,
          data: {
            network,
            badgeTone: plan.primaryDegraded ? 'accent' : 'good',
            summary: plan.explanation,
            activeRoute: plan.activeRoute,
          },
        };
      },

      async getMatrix() {
        const profile = getCountryProfile(activeCountry);
        const networks = Object.values(MESSENGERS).map((spec) => {
          const plan = ensureRoutePlan(spec.id);
          const actor = supervisor.getActor(spec.id);
          return {
            ...spec,
            needsVpn: profile.vpnRequired.includes(spec.id),
            routeReady: plan.ok,
            activeRoute: plan.ok ? plan.activeRoute : null,
            backupRoute: proxyBindings.get(spec.id)?.backupRoute || null,
            routeNote: plan.ok ? plan.explanation : plan.error.message,
            bridgeState: actor?.state || 'HIBERNATED',
            ramMb: actor?.ramMb || 0,
            crashes: actor?.crashes || 0,
            restarts: actor?.restarts || 0,
          };
        });
        return {
          ok: true,
          data: {
            activeCountry: profile,
            availableCountries: Object.values(COUNTRY_PROFILES).map((c) => ({ code: c.code, name: c.name, note: c.note })),
            networks,
          },
        };
      },
    },

    // 8. tools.connect.*
    connect: {
      async register(args) {
        const res = supervisor.register(args?.network, args?.adapterSpec);
        return res.ok ? { ok: true, data: { bridgeId: res.actor.bridgeId, capabilities: res.capabilities } } : res;
      },
      async authCheck(args) {
        const ses = resolveSession(args?.sessionHandle, args?.network);
        const res = supervisor.authCheck(args?.network, ses);
        return res.ok ? { ok: true, data: res } : res;
      },
      async wake(args) {
        const res = supervisor.wake(args?.network, args?.reason);
        return res.ok ? { ok: true, data: res } : res;
      },
      async hibernate(args) {
        const res = supervisor.hibernate(args?.network);
        return res.ok ? { ok: true, data: res } : res;
      },
      async supervise(args) {
        const res = supervisor.supervise(args?.network, args?.fault);
        return res.ok ? { ok: true, data: res } : res;
      },
      async capabilities(args) {
        const spec = getMessengerSpec(args?.network);
        if (!spec) return { ok: false, error: makeError('RM-405', `Неизвестная сеть: ${args?.network}`) };
        return { ok: true, data: spec };
      },
      async list() {
        return { ok: true, data: { bridges: supervisor.listActors(), totalRamMb: supervisor.totalRamMb() } };
      },
      async injectFault(args) {
        const ok = supervisor.injectFault(args?.network, args?.fault ?? null);
        return ok ? { ok: true, data: { network: args.network, fault: args.fault ?? null } } : { ok: false, error: makeError('RM-405', 'Мост не найден') };
      },
    },

    // 9. tools.chrono.*
    chrono: {
      async recordPast(args) {
        const { kind = 'chat-switch', chatId, hourOfDay, network, routeId, code } = args || {};
        if (kind === 'chat-switch' && chatId) chrono.recordChatSwitch(chatId, hourOfDay);
        else if (kind === 'route-fail') chrono.recordRouteFailure({ network, routeId, code });
        return { ok: true, data: { recorded: true, status: chrono.status() } };
      },

      async predictFuture(args) {
        return { ok: true, data: chrono.predictFuture(args || {}) };
      },

      async warmUp(args) {
        const bp = chrono.isBackpressureActive();
        if (bp.active) {
          return {
            ok: true,
            data: {
              warmed: [],
              skippedByBackpressure: true,
              code: 'RM-501',
              reasons: bp.reasons,
            },
          };
        }
        const prediction = args?.candidates ? { candidates: args.candidates } : chrono.predictFuture();
        const warmed = [];
        for (const chatId of prediction.candidates.slice(0, 3)) {
          const page = vaultStore.readPage(chatId, { limit: 20 });
          cache.admit(`chat:${chatId}`, { kind: 'chat', bytes: 4096 + page.messages.length * 128, value: page, forceHot: true });
          warmed.push(chatId);
        }
        return { ok: true, data: { warmed, skippedByBackpressure: false } };
      },

      async setPhase(args) {
        const res = chrono.setPhase(args?.phase || 'ACTIVE');
        if (res.phase === 'DEEP_SLEEP') {
          // В глубоком сне сворачиваем редкие мосты и склеиваем таймеры
          for (const actor of supervisor.listActors()) {
            if (actor.network !== 'ratmes' && actor.state === 'ACTIVE') {
              supervisor.hibernate(actor.network);
            }
          }
          chrono.registerTimer('bridge-ping', 60);
          chrono.registerTimer('outbox-sweep', 30);
          chrono.coalesceTimers(180);
        }
        core.watch.emit('chrono.phase', res);
        return { ok: true, data: { ...res, status: chrono.status() } };
      },

      async runHousekeeping(args, ctx) {
        chrono.setPhase('HOUSEKEEPING');
        const res = await chrono.runHousekeeping({
          'flush-outbox': async () => ({ pending: vaultStore.listOutbox().length }),
          'heal-vault-tails': async () => vaultStore.healTail(),
          'sync-readable-txt': async () => ({ chats: vaultStore.listChats().length }),
          'rotate-keys': async () => (await rawTools.crypto.rotateKeys({}, ctx)).data,
          'evict-s3fifo': async () => cache.evictTick({ budgetMs: 2 }),
          'hibernate-cold-bridges': async () => {
            const hibernated = [];
            for (const a of supervisor.listActors()) {
              if (a.network !== 'ratmes' && a.network !== 'vk' && a.state === 'ACTIVE') {
                supervisor.hibernate(a.network);
                hibernated.push(a.network);
              }
            }
            return { hibernated };
          },
        });
        return { ok: true, data: res };
      },

      async coalesceTimers(args) {
        return { ok: true, data: chrono.coalesceTimers(args?.wakeWindowSec || 120) };
      },

      async setBackpressure(args) {
        return { ok: true, data: chrono.setBackpressure(args || {}) };
      },

      async status() {
        return { ok: true, data: chrono.status() };
      },
    },

    // 10. tools.cache.*
    cache: {
      async admit(args) {
        const res = cache.admit(args?.key, args || {});
        return { ok: true, data: { ...res, status: cache.status() } };
      },
      async evictTick(args) {
        return { ok: true, data: cache.evictTick(args || {}) };
      },
      async budgetStatus() {
        return {
          ok: true,
          data: {
            cache: cache.status(),
            bridgesRamMb: supervisor.totalRamMb(),
            sleepingRegions: core.stream.listSleeping(),
          },
        };
      },
    },

    // 11. tools.presence.*
    presence: {
      async emitTyping(args) {
        const chatId = args?.chatId;
        if (!chatId) return { ok: false, error: makeError('RM-104', 'Укажи chatId') };
        if (chrono.phase === 'DEEP_SLEEP') {
          return { ok: true, data: { sent: false, throttled: true, reason: 'DEEP_SLEEP' } };
        }
        const now = Date.now();
        const prev = typingThrottle.get(chatId) || 0;
        if (now - prev < 3500) {
          return { ok: true, data: { sent: false, throttled: true, nextAllowedInMs: 3500 - (now - prev) } };
        }
        typingThrottle.set(chatId, now);
        return { ok: true, data: { sent: true, throttled: false, chatId } };
      },
      async setAvailability(args) {
        const phase = args?.phase || chrono.phase;
        const broadcastOnline = phase === 'ACTIVE';
        return { ok: true, data: { phase, broadcastOnline } };
      },
      async notifyCoalesce(args) {
        const events = Array.isArray(args?.events) ? args.events : [];
        const grouped = new Map();
        for (const e of events) {
          grouped.set(e.chatId || 'general', (grouped.get(e.chatId || 'general') || 0) + 1);
        }
        return {
          ok: true,
          data: {
            rawEvents: events.length,
            notificationsShown: grouped.size > 3 ? 1 : grouped.size,
            summary: grouped.size > 3
              ? `${core.pluralRu(events.length, 'новое сообщение', 'новых сообщения', 'новых сообщений')} в ${grouped.size} чатах`
              : Array.from(grouped.entries()).map(([c, n]) => `${c}: +${n}`).join(', '),
            audioRecipe: core.audio.getRecipe('msg-in'),
          },
        };
      },
    },

    // 12. tools.diag.*
    diag: {
      async whyStuck(args) {
        const state = transfers.get(args?.transferId);
        if (!state) {
          return {
            ok: true,
            data: {
              rootCause: 'NOT_FOUND',
              humanExplanation: 'Передача не найдена в списке активных — вероятно, сообщение уже доставлено.',
              suggestedFix: 'Проверь список чатов или историю RatMes-Vault/.',
            },
          };
        }
        const routeExplain = (await rawTools.route.explain({ network: state.network })).data;
        const integrity = vaultStore.verifyIntegrity();
        const err = state.lastError;
        let humanExplanation = `Статус: ${state.status} (этап: ${state.stage}). ${routeExplain.summary}`;
        let suggestedFix = 'Ничего делать не нужно — передача идёт штатно.';

        if (err?.code === 'RM-301') {
          humanExplanation = `${err.message}. Сообщение уже надёжно лежит в RatMes-Vault/ и ждёт подключения VPN-профиля.`;
          suggestedFix = `Привяжи VPN/прокси для ${state.network} (route.bindProxy) или смени профиль страны.`;
        } else if (err?.code === 'RM-302') {
          humanExplanation = `${err.message}. Прогресс чанков сохранён — можно продолжить докачку на резервном маршруте.`;
          suggestedFix = 'Нажми «План Б + Докачать» (transfer.reroute -> transfer.resume).';
        } else if (err?.code === 'RM-403') {
          humanExplanation = `${err.message}. Остальные чаты и файлы не пострадали.`;
          suggestedFix = 'Нажми «Повторить доставку» — супервизор уже поднял чистый актор моста.';
        } else if (err?.code === 'RM-404') {
          humanExplanation = `${err.message}. Движок сам поставил прогрев на паузу (Backpressure).`;
          suggestedFix = 'Подожди окончания окна Retry-After — Outbox доставит автоматически.';
        }

        return {
          ok: true,
          data: {
            transferId: state.transferId,
            rootCause: err?.code || state.status,
            savedSafelyInVault: integrity.clean,
            humanExplanation,
            suggestedFix,
            stages: state.stages,
          },
        };
      },

      async simulateOutage(args) {
        const scenario = args?.scenario || 'vpn-drop';
        // Изолированный клон движка (как RatCore.tools.think.sandboxRun / guess.hypothesize) — не портит живые чаты!
        const clone = createRatMesEngine({ seed: (args?.seed || seed) + 77, country: activeCountry, seedDemoChats: false });
        let passed = false;
        let detail = {};

        if (scenario === 'vpn-drop') {
          const p = await clone.tools.pack.media({
            chatId: 'sim-tg',
            network: 'telegram',
            filename: 'demo-video.bin',
            bytes: new Uint8Array(260 * 1024),
            chunkSize: 65536,
          });
          await clone.tools.pack.validate({ envelope: p.data.envelope });
          await clone.tools.vault.append({ envelope: p.data.envelope });
          const q = await clone.tools.transfer.enqueue({ envelope: p.data.envelope });
          const drop = await clone.tools.transfer.streamChunk({
            transferId: q.data.transferId,
            attachmentHandle: p.data.attachment,
            simulateDropAtChunk: 2,
          });
          await clone.tools.transfer.reroute({ transferId: q.data.transferId, fallbackMode: 'backup-vpn' });
          const resumed = await clone.tools.transfer.resume({ transferId: q.data.transferId });
          passed = !drop.ok && drop.error.code === 'RM-302' && resumed.ok && resumed.data.done === true;
          detail = { droppedCode: drop.error?.code, resumedChunks: resumed.data?.sentChunks, totalChunks: resumed.data?.totalChunks };
        } else if (scenario === 'sleep-12h') {
          await clone.tools.chrono.setPhase({ phase: 'DEEP_SLEEP' });
          const wakeAdvance = clone.core.clock.advance(12 * 3600);
          passed = wakeAdvance.steps === clone.core.clock.maxSteps && wakeAdvance.throttled === true;
          detail = { stepsExecutedInOneTick: wakeAdvance.steps, maxStepsCap: clone.core.clock.maxSteps, throttled: wakeAdvance.throttled };
        } else if (scenario === 'bridge-crash') {
          await clone.tools.connect.injectFault({ network: 'discord', fault: 'crash' });
          const p = await clone.tools.pack.text({ chatId: 'sim-dc', network: 'discord', text: 'Проверка изоляции' });
          await clone.tools.pack.validate({ envelope: p.data.envelope });
          await clone.tools.vault.append({ envelope: p.data.envelope });
          const q = await clone.tools.transfer.enqueue({ envelope: p.data.envelope });
          const fail = await clone.tools.transfer.dispatch({ transferId: q.data.transferId });
          const retry = await clone.tools.transfer.dispatch({ transferId: q.data.transferId });
          passed = !fail.ok && fail.error.code === 'RM-403' && retry.ok;
          detail = { faultCode: fail.error?.code, recoveredOnRetry: retry.ok };
        }

        return { ok: true, data: { scenario, passed, messagesLost: 0, detail } };
      },

      async auditGuards() {
        return {
          ok: true,
          data: {
            violationsRecorded: core.audit.list(50),
            guardBarriersActive: 5,
            transferThroughToolsOnly: true,
          },
        };
      },

      async reportToRatCore(args) {
        const ticket = core.bugs.create({
          kind: args?.kind || 'rfc',
          targetRepoPath: 'ratcore/comms/channels/general/',
          payload: args?.payload || {},
        });
        return { ok: true, data: { artifactId: ticket.id, ticket } };
      },

      async summary() {
        return {
          ok: true,
          data: {
            engine: 'RatMes Engine v1.0',
            foundation: core.profile,
            protocol: core.protocol,
            tick: core.clock.tick,
            stateHash: computeStateHash(),
            country: activeCountry,
            chrono: chrono.status(),
            cache: cache.status(),
            bridges: supervisor.listActors(),
            bridgesRamMb: supervisor.totalRamMb(),
            outboxPending: vaultStore.listOutbox().length,
            vaultBackend: vaultStore.backend,
            vaultRoot: vaultStore.rootDir,
            auditViolations: core.audit.list(10).length,
            recentTraces: traceLog.slice(-20),
            search: searchIndex.stats(),
            scheduler: scheduler.status(),
            foldersCount: workspace.listFolders().length,
            contactsCount: workspace.listContacts().length,
            liveMeshPeers: attachedLanMesh ? attachedLanMesh.listPeers().length : 0,
          },
        };
      },
    },

    // 13. tools.search.* (Полнотекстовый BM25 поиск по всему RatMes-Vault/)
    search: {
      async query(args) {
        const res = searchIndex.search(args?.q || args?.query || '', {
          limit: args?.limit || 30,
          chatId: args?.chatId || null,
        });
        return { ok: true, data: res };
      },
      async reindex() {
        const res = searchIndex.rebuildFromVault(vaultStore, workspace.getAllPinnedMessageIds());
        return { ok: true, data: res };
      },
      async stats() {
        return { ok: true, data: searchIndex.stats() };
      },
    },

    // 14. tools.workspace.* (Папки, черновики, непрочитанные, закрепы, реакции, правки/удаление, единые контакты)
    workspace: {
      async overview() {
        return {
          ok: true,
          data: {
            folders: workspace.listFolders(),
            contacts: workspace.listContacts(),
            quickReactions: QUICK_REACTIONS,
          },
        };
      },
      async listFolders() {
        return { ok: true, data: { folders: workspace.listFolders() } };
      },
      async createFolder(args) {
        if (!args?.name || !String(args.name).trim()) {
          return { ok: false, error: makeError('RM-105', 'Укажи название папки') };
        }
        const folder = workspace.createFolder(args);
        persistWorkspace();
        return { ok: true, data: { folder, folders: workspace.listFolders() } };
      },
      async assignFolder(args) {
        const f = workspace.assignChatToFolder(args?.folderId, args?.chatId, args?.included !== false);
        if (!f) return { ok: false, error: makeError('RM-105', 'Папка не найдена или является системной') };
        persistWorkspace();
        return { ok: true, data: { folder: f } };
      },
      async setDraft(args) {
        const res = workspace.setDraft(args?.chatId, args || {});
        persistWorkspace();
        return { ok: true, data: res };
      },
      async getDraft(args) {
        return { ok: true, data: workspace.getDraft(args?.chatId) };
      },
      async markRead(args) {
        const page = vaultStore.readPage(args?.chatId, { limit: 1 });
        const lastSeq = args?.seq ?? page.messages[page.messages.length - 1]?.seq ?? page.total;
        const res = workspace.markRead(args?.chatId, lastSeq);
        persistWorkspace();
        return { ok: true, data: res };
      },
      async updateChatFlags(args) {
        const res = workspace.updateChatFlags(args?.chatId, args || {});
        persistWorkspace();
        return { ok: true, data: res };
      },
      async togglePin(args) {
        const { chatId, msgId } = args || {};
        if (!chatId || !msgId) return { ok: false, error: makeError('RM-105', 'Укажи chatId и msgId') };
        const res = workspace.togglePinMessage(chatId, msgId);
        searchIndex.setPinned(msgId, res.pinned);
        persistWorkspace();
        core.watch.emit('workspace.pin', res);
        return { ok: true, data: res };
      },
      async toggleReaction(args, ctx) {
        const { msgId, emoji } = args || {};
        if (!msgId || !emoji) return { ok: false, error: makeError('RM-105', 'Укажи msgId и emoji') };
        const res = workspace.toggleReaction(msgId, emoji, ctx.actorId);
        persistWorkspace();
        core.watch.emit('workspace.reaction', res);
        return { ok: true, data: res };
      },
      async editMessage(args) {
        const { chatId, network, msgId, newText } = args || {};
        if (!chatId || !msgId || !String(newText || '').trim()) {
          return { ok: false, error: makeError('RM-105', 'Укажи chatId, msgId и новый текст newText') };
        }
        const existing = vaultStore.getMessageById?.(chatId, msgId);
        if (!existing) return { ok: false, error: makeError('RM-202', 'Сообщение не найдено в RatMes-Vault/') };
        if (existing.deleted) return { ok: false, error: makeError('RM-105', 'Нельзя редактировать удалённое сообщение (tombstone)') };

        const history = workspace.recordEdit(msgId, existing.text);
        const editedAt = Date.now();
        const net = network || existing.network;
        vaultStore.patchMessage(net, chatId, msgId, { text: String(newText).trim(), edited: true, editedAt });
        searchIndex.indexMessage({ ...existing, text: String(newText).trim(), edited: true, editedAt });
        persistWorkspace();
        core.watch.emit('workspace.edited', { chatId, msgId, editedAt });
        return { ok: true, data: { msgId, edited: true, editedAt, editCount: history.length } };
      },
      async deleteMessage(args) {
        const { chatId, network, msgId } = args || {};
        if (!chatId || !msgId) return { ok: false, error: makeError('RM-105', 'Укажи chatId и msgId') };
        const existing = vaultStore.getMessageById?.(chatId, msgId);
        if (!existing) return { ok: false, error: makeError('RM-202', 'Сообщение не найдено в RatMes-Vault/') };

        const net = network || existing.network;
        const deletedAt = Date.now();
        vaultStore.patchMessage(net, chatId, msgId, { deleted: true, text: '[Сообщение удалено]', deletedAt });
        searchIndex.removeMessage(msgId);
        persistWorkspace();
        core.watch.emit('workspace.deleted', { chatId, msgId, deletedAt });
        return { ok: true, data: { msgId, deleted: true, tombstone: true, deletedAt } };
      },
      async listContacts() {
        return { ok: true, data: { contacts: workspace.listContacts() } };
      },
      async upsertContact(args) {
        const contact = workspace.upsertContact(args || {});
        persistWorkspace();
        return { ok: true, data: { contact, contacts: workspace.listContacts() } };
      },
    },

    // 15. tools.cloud.* (Облачная экосистема Games: Supabase, Google Drive, Dropbox, Notion, Linear, Docs, Sheets, Calendar, Gmail)
    cloud: {
      async status() {
        return { ok: true, data: cloudHub.getStatus() };
      },
      async listArtifacts() {
        return { ok: true, data: { services: cloudHub.listArtifacts() } };
      },
      async getPublicConfig() {
        return { ok: true, data: cloudHub.getPublicConfig() };
      },
      async getGamesRooms() {
        return { ok: true, data: { rooms: cloudHub.getGamesRooms() } };
      },
      async recordSync(args) {
        const st = cloudHub.recordSync(args || {});
        core.watch.emit('cloud.sync', {
          reachable: st.supabase.reachable,
          pulledCount: st.supabase.pulledCount,
          pushedCount: st.supabase.pushedCount,
          onlinePeersCount: st.supabase.onlinePeersCount,
        });
        return { ok: true, data: st };
      },
      async setDisplayName(args) {
        const res = cloudHub.setDisplayName(args?.displayName || args?.name, args?.bio);
        return { ok: true, data: res };
      },
      async exportManifest() {
        const chats = vaultStore.listChats();
        const files = vaultStore.listPlainFiles();
        const stats = {
          filesCount: files.length,
          totalBytes: files.reduce((acc, f) => acc + (f.size || 0), 0),
          indexedDocs: searchIndex.stats().docs,
        };
        return { ok: true, data: cloudHub.buildBackupManifest({ chats, stats }) };
      },
      async ingestRemote(args, ctx) {
        const rows = Array.isArray(args?.messages) ? args.messages : [];
        const remoteRooms = Array.isArray(args?.rooms) ? args.rooms : [];
        const rawPeers = Array.isArray(args?.onlinePeers) ? args.onlinePeers : null;
        const myPeerId = args?.myPeerId ? String(args.myPeerId) : null;
        const peerNameMap = new Map();
        const peerSeen = new Set();
        const mergedPeers = rawPeers ? [...rawPeers] : null;
        if (mergedPeers) {
          for (const p of mergedPeers) {
            const pid = String(p.peer_id || p.peerId || '');
            const pname = String(p.display_name || p.displayName || '').trim();
            if (pid) peerSeen.add(pid);
            if (pid && pname) peerNameMap.set(pid, pname);
          }
        }
        for (const row of rows) {
          const pid = String(row?.sender_id || '').trim();
          const pname = String(row?.sender_name || '').trim();
          if (pid && pname && !peerNameMap.has(pid)) peerNameMap.set(pid, pname);
          if (mergedPeers && pid && !pid.includes(':') && !peerSeen.has(pid)) {
            peerSeen.add(pid);
            mergedPeers.push({
              peer_id: pid,
              display_name: pname || 'Участник',
              bio: '',
              room_id: row.room_id || 'games-lobby',
              last_seen: row.created_at || new Date(0).toISOString(),
            });
          }
        }
        // Регистрируем все реальные комнаты (публичные, личные DM, Избранное и комнаты по ссылке)
        for (const r of remoteRooms) {
          const roomId = String(r.room_id || r.roomId || '').trim();
          if (!roomId) continue;
          const isSelfChat = roomId.startsWith('dm-self-');
          const roomType = String(r.room_type || r.roomType || (roomId.startsWith('dm-') ? 'dm' : roomId.startsWith('room-') ? 'group' : 'public'));
          const participants = Array.isArray(r.participants) ? r.participants.map(String) : [];
          let title = String(r.title || roomId);
          if (isSelfChat) {
            title = '⭐ Избранное';
          } else if (roomType === 'dm' && myPeerId && participants.length >= 2) {
            const otherPeerId = participants.find((pid) => pid !== myPeerId);
            const otherName = otherPeerId ? peerNameMap.get(otherPeerId) : null;
            if (otherName) title = `👤 ${otherName}`;
          }
          const prev = chatMetaExtra.get(roomId);
          chatMetaExtra.set(roomId, {
            title,
            network: r.network || prev?.network || 'ratmes',
            roomType,
            participants,
            description: r.description || prev?.description || '',
            lastTs: prev?.lastTs || (r.created_at ? Date.parse(r.created_at) : 0),
          });
        }
        let ingested = 0;
        let deduplicated = 0;
        for (const row of rows) {
          if (!row || !row.room_id || !row.body_text) continue;
          const roomMeta = GAMES_CHAT_ROOMS.find((r) => r.chatId === row.room_id);
          const extra = chatMetaExtra.get(row.room_id);
          const isMine = Boolean(myPeerId && row.sender_id && String(row.sender_id) === myPeerId);
          const rec = await rawTools.transfer.receive({
            sourceChannel: 'supabase',
            network: row.network || extra?.network || roomMeta?.network || 'ratmes',
            chatId: row.room_id,
            chatTitle: extra?.title || roomMeta?.title || row.room_title || row.room_id,
            senderName: row.sender_name || 'Участник',
            senderId: row.sender_id || null,
            direction: isMine ? 'out' : 'in',
            text: row.body_text,
            msgId: row.msg_id || null,
            ts: row.created_at || null,
          }, ctx);
          if (rec.ok) {
            if (rec.data?.deduplicated) deduplicated += 1;
            else ingested += 1;
          }
        }
        cloudHub.recordSync({
          reachable: true,
          pulled: ingested,
          onlinePeers: mergedPeers,
          rooms: remoteRooms.length > 0 ? remoteRooms : null,
        });
        return {
          ok: true,
          data: { ingested, deduplicated, status: cloudHub.getStatus() },
        };
      },
    },
  };

  // ---------------- Шлюз RatMes.tools.* с контролем прав, трассировкой и защитой утечек ----------------
  function createFacade(actorId = 'ui-user', role = 'owner') {
    const allow = ROLE_ALLOWLIST[role] || ['pack', 'diag'];

    async function invoke(toolPath, args = {}, ctxOverride = {}) {
      const started = performance.now();
      seqTrace += 1;
      const traceId = ctxOverride.traceId || `rm-tr-${String(seqTrace).padStart(5, '0')}`;
      const [group, method] = String(toolPath || '').split('.');
      core.clock.advance(core.clock.step);

      if (!group || !method || !rawTools[group] || typeof rawTools[group][method] !== 'function') {
        return makeResult({
          ok: false,
          tool: toolPath,
          error: makeError('RC-104', `Неизвестный инструмент: ${toolPath}`),
          tick: core.clock.tick,
          costMs: performance.now() - started,
          traceId,
        });
      }

      if (!allow.includes('*') && !allow.includes(group)) {
        const err = guard.recordViolation('RC-603', `Актор ${actorId} (${role}) не имеет прав на ветку ${group}`);
        return makeResult({ ok: false, tool: toolPath, error: err, tick: core.clock.tick, costMs: performance.now() - started, traceId });
      }

      const ctx = { actorId, role, traceId, countryProfile: activeCountry, dryRun: Boolean(ctxOverride.dryRun) };
      let res;
      try {
        res = await rawTools[group][method](args, ctx);
      } catch (e) {
        res = { ok: false, error: makeError('RM-104', e?.message || 'Внутренняя ошибка инструмента') };
      }

      // Барьер 4: ни один инструмент не может выдать сырой секрет наружу!
      if (res.ok && res.data) {
        const leakCheck = guard.assertNoSecretLeak(res.data, toolPath);
        if (!leakCheck.ok) res = leakCheck;
      }

      const costMs = performance.now() - started;
      const result = makeResult({
        ok: res.ok,
        tool: toolPath,
        data: res.data,
        error: res.error,
        tick: core.clock.tick,
        costMs,
        traceId,
      });

      traceLog.push({
        traceId,
        tick: core.clock.tick,
        actorId,
        tool: toolPath,
        ok: result.ok,
        errorCode: result.error?.code || null,
        costMs: result.costMs,
        ts: Date.now(),
      });
      if (traceLog.length > 200) traceLog.shift();
      return result;
    }

    const facade = {
      help(group = null) {
        if (group && TOOL_GROUPS_DOC[group]) {
          return makeResult({
            ok: true,
            tool: 'tools.help',
            data: { group, description: TOOL_GROUPS_DOC[group], methods: Object.keys(rawTools[group]) },
            tick: core.clock.tick,
          });
        }
        return makeResult({
          ok: true,
          tool: 'tools.help',
          data: {
            ratCoreFoundation: core.systemBranches,
            ratMesGroups: TOOL_GROUPS_DOC,
            errorCodesCount: Object.keys(ERROR_CATALOG).length,
          },
          tick: core.clock.tick,
        });
      },
      whoami() {
        return makeResult({
          ok: true,
          tool: 'tools.whoami',
          data: { actorId, role, allowGroups: allow, country: activeCountry, phase: chrono.phase },
          tick: core.clock.tick,
        });
      },
      asActor(nextActorId, nextRole) {
        return createFacade(nextActorId, nextRole);
      },
      trace(limit = 30) {
        return makeResult({
          ok: true,
          tool: 'tools.trace',
          data: { entries: traceLog.slice(-limit) },
          tick: core.clock.tick,
        });
      },
      // Атомарный конвейер инструментов (как RatCore.tools.batch)
      async pipeline(ops = []) {
        const started = performance.now();
        if (!Array.isArray(ops) || !ops.length) {
          return makeResult({ ok: false, tool: 'tools.pipeline', error: makeError('RM-108', 'Передай непустой массив шагов ops') });
        }
        const results = [];
        const vars = {};
        for (let i = 0; i < ops.length; i += 1) {
          const step = ops[i];
          if (!step || !step.tool) {
            return makeResult({ ok: false, tool: 'tools.pipeline', error: makeError('RM-108', `Шаг ${i} не содержит имени tool`) });
          }
          // Простая подстановка ссылок на результаты прошлых шагов ($prev.handleId / $vars.xxx)
          const resolvedArgs = resolvePipelineArgs(step.args || {}, vars);
          const r = await invoke(step.tool, resolvedArgs);
          results.push(r);
          if (r.ok && r.data) {
            if (r.data.envelope?.handleId) vars.envelopeId = r.data.envelope.handleId;
            if (r.data.attachment?.handleId) vars.attachmentId = r.data.attachment.handleId;
            if (r.data.transferId) vars.transferId = r.data.transferId;
            if (r.data.msgId) vars.msgId = r.data.msgId;
          }
          if (!r.ok && !step.continueOnError) {
            return makeResult({
              ok: false,
              tool: 'tools.pipeline',
              error: r.error,
              data: { completedSteps: i, results, vars },
              tick: core.clock.tick,
              costMs: performance.now() - started,
            });
          }
        }
        return makeResult({
          ok: true,
          tool: 'tools.pipeline',
          data: { completedSteps: results.length, results, vars },
          tick: core.clock.tick,
          costMs: performance.now() - started,
        });
      },
      call: invoke,
    };

    for (const group of Object.keys(rawTools)) {
      facade[group] = {};
      for (const method of Object.keys(rawTools[group])) {
        facade[group][method] = (args, ctx) => invoke(`${group}.${method}`, args, ctx);
      }
    }

    return facade;
  }

  function resolvePipelineArgs(args, vars) {
    const out = {};
    for (const [k, v] of Object.entries(args)) {
      if (v === '$envelopeId') out[k] = vars.envelopeId;
      else if (v === '$attachmentId') out[k] = vars.attachmentId;
      else if (v === '$transferId') out[k] = vars.transferId;
      else if (v === '$msgId') out[k] = vars.msgId;
      else out[k] = v;
    }
    return out;
  }

  const tools = createFacade('owner', 'owner');

  // Стартовое наполнение игровых комнат Games («Общение») и 5 чатов сетей (только если RatMes-Vault/ пуст)
  async function ensureStarterChats() {
    // Реальные живые комнаты Games всегда доступны (без фейковых сообщений — сообщения приходят из Supabase)
    for (const room of GAMES_CHAT_ROOMS) {
      if (!chatMetaExtra.has(room.chatId)) {
        chatMetaExtra.set(room.chatId, {
          title: room.title,
          network: room.network,
          roomType: 'public',
          description: room.description,
          lastTs: 0,
        });
      }
    }
    if (!seedDemoChats) return;

    const existingIds = new Set(vaultStore.listChats().map((c) => c.chatId));
    if (existingIds.size > 0) return;

    const starter = [
      { chatId: 'ratmes-main', chatTitle: 'Свой чат RatMes (E2EE)', network: 'ratmes', senderName: 'RatMes Ядро', text: 'Добро пожаловать в RatMes! Все сообщения сохраняются в обычные файлы RatMes-Vault/ (.jsonl + .txt).' },
      { chatId: 'vk-friends', chatTitle: 'VK · Команда', network: 'vk', senderName: 'Алексей (VK)', text: 'Тестовое сообщение для проверки маршрута VK.' },
      { chatId: 'max-work', chatTitle: 'MAX · Учёба / Работа', network: 'max', senderName: 'Группа MAX', text: 'Тестовое сообщение для проверки маршрута MAX (RM-603).' },
      { chatId: 'tg-dev', chatTitle: 'Telegram · Разработка', network: 'telegram', senderName: 'Канал Dev (TG)', text: 'Тестовое сообщение для проверки маршрута Telegram с Планом Б.' },
      { chatId: 'dc-squad', chatTitle: 'Discord · Игры', network: 'discord', senderName: 'Сервер Games (DC)', text: 'Тестовое сообщение для проверки супервизора мостов.' },
    ];
    for (const item of starter) {
      chatMetaExtra.set(item.chatId, { title: item.chatTitle, network: item.network });
      await tools.transfer.receive({
        sourceChannel: 'starter',
        network: item.network,
        chatId: item.chatId,
        chatTitle: item.chatTitle,
        senderName: item.senderName,
        text: item.text,
      });
    }
    await tools.chrono.recordPast({ kind: 'chat-switch', chatId: 'games-lobby' });
    await tools.chrono.recordPast({ kind: 'chat-switch', chatId: 'ratmes-main' });
    await tools.chrono.recordPast({ kind: 'chat-switch', chatId: 'tg-dev' });
    await tools.chrono.recordPast({ kind: 'chat-switch', chatId: 'games-lobby' });
    await tools.chrono.recordPast({ kind: 'chat-switch', chatId: 'vk-friends' });
  }

  return {
    tools,
    core,
    guard,
    vaultStore,
    supervisor,
    searchIndex,
    scheduler,
    workspace,
    cloudHub,
    attachLanMesh(mesh) {
      attachedLanMesh = mesh;
    },
    ensureStarterChats,
    getStateHash: computeStateHash,
  };
}
