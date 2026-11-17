// Браузерный/PWA интерфейс RatMes (расширенная версия).
// TransferGuard RM-107: этот файл НЕ содержит прямых сетевых вызовов, прямой записи файлов, Math.random() или innerHTML.
// Вся передача сообщений, голоса, файлов, поиска, маршрутов, кэша и диагностики идёт строго через RatMes.tools.*!

import { createBridgeClient } from './bridge-client.mjs';
import { createAudioCue } from './audio.mjs';
import { createVoiceRecorder } from './voice-recorder.mjs';
import { renderMarkdownToFragment } from './markdown-render.mjs';
import { TelemetrySparkline, renderChunkMapElement, renderWaveformBarsElement } from './telemetry-canvas.mjs';
import { createCommandPalette } from './command-palette.mjs';
import { SERVICE_GUIDES, getServiceGuide } from '../engine/service-guides.mjs';

const TOOL_SAMPLE_ARGS = {
  'search.query': { q: 'RatMes', limit: 15 },
  'route.setCountry': { countryCode: 'EU' },
  'route.bindProxy': { network: 'whatsapp', primaryRoute: 'vpn-eu-01', backupRoute: 'vpn-nl-02' },
  'route.explain': { network: 'telegram' },
  'chrono.predictFuture': {},
  'chrono.runHousekeeping': {},
  'chrono.setBackpressure': { batteryPct: 15 },
  'cache.budgetStatus': {},
  'transfer.pumpOutbox': { maxPerTick: 4, forceNow: true },
  'transfer.schedulerStatus': {},
  'workspace.overview': {},
  'workspace.createFolder': { name: 'Избранное', icon: '⭐' },
  'vault.healTail': {},
  'vault.rebuildIndex': {},
  'diag.summary': {},
  'diag.simulateOutage': { scenario: 'vpn-drop' },
  'pack.voice': { chatId: 'ratmes-main', network: 'ratmes', durationSec: 2.2 },
  'cloud.status': {},
  'cloud.listArtifacts': {},
  'cloud.exportManifest': {},
};

const state = {
  client: null,
  audio: createAudioCue(),
  voiceRecorder: null,
  sparkline: null,
  palette: null,

  chats: [],
  folders: [],
  contacts: [],
  quickReactions: ['👍', '🔥', '❤️', '😂', '👀', '⚡'],
  activeFolder: 'all',
  activeChatId: null,
  activeMessages: [],
  matrix: null,
  summary: null,
  cloudStatus: null,
  vaultFiles: [],
  transfers: [],
  liveBridges: [],
  p2pPeers: [],
  toolHelpMap: {},
  displayName: 'Игрок Games',

  filterNetwork: 'all',
  searchQuery: '',
  replyTarget: null,
  editTarget: null,
  forwardTarget: null,
  pendingFile: null,
  selectedTransferId: null,
  highlightMsgId: null,
  incomingSeqCounter: 0,
  draftTimer: null,
  mobileView: 'chats',
  hubSelectedService: 'max',
  hubStep: 'list',
  hubSearch: '',
};

const $ = (id) => document.getElementById(id);

function toast(text) {
  const el = document.createElement('div');
  el.className = 'toast';
  el.textContent = text;
  $('toastHost').appendChild(el);
  setTimeout(() => el.remove(), 3800);
}

function formatBytes(bytes = 0) {
  if (bytes < 1024) return `${bytes} Б`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} КБ`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} МБ`;
}

function formatTime(ts) {
  if (!ts) return '';
  return new Date(ts).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

function statusLabel(status, errorCode) {
  const map = {
    local: 'в файле',
    queued: 'в Outbox',
    sending: 'отправка…',
    sent: 'отправлено ✓',
    delivered: 'доставлено ✓✓',
    read: 'прочитано ✓✓',
    received: 'входящее',
    held_outbox: `ждёт маршрут (${errorCode || 'Outbox'})`,
    retry_wait: `повтор (${errorCode || 'сбой'})`,
    paused: `пауза (${errorCode || 'докачка'})`,
    cancelled: 'отменено',
  };
  return map[status] || status || '';
}

function findNetworkSpec(networkId) {
  return state.matrix?.networks?.find((n) => n.id === networkId) || null;
}

function findLiveBridgeStatus(networkId) {
  return state.liveBridges.find((b) => b.network === networkId) || null;
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result || '');
      const comma = result.indexOf(',');
      resolve(comma >= 0 ? result.slice(comma + 1) : result);
    };
    reader.onerror = () => reject(new Error('Не удалось прочитать файл'));
    reader.readAsDataURL(file);
  });
}

// ---------------- Загрузка состояния строго через инструменты ----------------
async function refreshAll({ keepScroll = false } = {}) {
  const [chatsRes, matrixRes, summaryRes, filesRes, trfRes, wsRes, liveRes, p2pRes, cloudRes] = await Promise.all([
    state.client.call('vault.listChats'),
    state.client.call('route.getMatrix'),
    state.client.call('diag.summary'),
    state.client.call('vault.listPlainFiles'),
    state.client.call('transfer.inspect'),
    state.client.call('workspace.overview'),
    state.client.listLiveBridges(),
    state.client.listP2pPeers(),
    state.client.call('cloud.status'),
  ]);

  if (chatsRes.ok) state.chats = chatsRes.data.chats || [];
  if (matrixRes.ok) state.matrix = matrixRes.data;
  if (summaryRes.ok) state.summary = summaryRes.data;
  if (filesRes.ok) state.vaultFiles = filesRes.data.files || [];
  if (trfRes.ok) state.transfers = trfRes.data.activeTransfers || [];
  if (wsRes.ok) {
    state.folders = wsRes.data.folders || [];
    state.contacts = wsRes.data.contacts || [];
    state.quickReactions = wsRes.data.quickReactions || state.quickReactions;
  }
  if (liveRes?.ok) state.liveBridges = liveRes.data.bridges || [];
  if (p2pRes?.ok) state.p2pPeers = p2pRes.data.peers || [];
  if (cloudRes?.ok) {
    state.cloudStatus = cloudRes.data;
    if (cloudRes.data.displayName && !$('cloudDisplayNameInput').value) {
      state.displayName = cloudRes.data.displayName;
    }
  }

  if (!state.activeChatId && state.chats.length > 0) {
    state.activeChatId = state.chats[0].chatId;
  }

  // Обновляем график живой телеметрии
  if (state.sparkline && state.summary) {
    const traces = state.summary.recentTraces || [];
    const avgLat = traces.length
      ? traces.slice(-8).reduce((acc, t) => acc + (Number(t.costMs) || 0), 0) / Math.min(8, traces.length)
      : 0;
    state.sparkline.push({ ramMb: state.summary.bridgesRamMb || 0, avgLatencyMs: avgLat });
  }

  renderSidebar();
  renderInspector();

  if (state.activeChatId) {
    await loadActiveChatMessages({ keepScroll });
  }
}

async function loadActiveChatMessages({ keepScroll = false } = {}) {
  if (!state.activeChatId) return;
  const pageRes = await state.client.call('vault.readPage', { chatId: state.activeChatId, limit: 120 });
  if (pageRes.ok) {
    state.activeMessages = pageRes.data.messages || [];
  }
  renderActiveChat({ keepScroll });
}

// ---------------- Отрисовка левой колонки (Папки + Чаты) ----------------
function renderSidebar() {
  const mode = state.client.getMode();
  $('connectionModeLabel').textContent = mode === 'agent'
    ? 'ПК-Агент · RatMes-Vault/'
    : 'PWA Автономно (браузер)';

  if (state.matrix) {
    const sel = $('countrySelect');
    if (!sel.options.length) {
      for (const c of state.matrix.availableCountries) {
        const opt = document.createElement('option');
        opt.value = c.code;
        opt.textContent = `${c.code} — ${c.name}`;
        sel.appendChild(opt);
      }
    }
    sel.value = state.matrix.activeCountry.code;
    $('countryNote').textContent = state.matrix.activeCountry.note;
    $('matrixCountryCode').textContent = state.matrix.activeCountry.code;

    const netSel = $('newChatNetwork');
    const cntNetSel = $('contactNetSelect');
    if (!netSel.options.length) {
      for (const n of state.matrix.networks) {
        const opt = document.createElement('option');
        opt.value = n.id;
        opt.textContent = `${n.name} (${n.short})${n.needsVpn ? ' · нужен VPN' : ''}`;
        netSel.appendChild(opt);
        cntNetSel.appendChild(opt.cloneNode(true));
      }
    }

    const chipsHost = $('networkFilterChips');
    chipsHost.replaceChildren();
    const chipItems = [{ id: 'all', label: 'Все' }, ...state.matrix.networks.slice(0, 7).map((n) => ({ id: n.id, label: n.short }))];
    for (const item of chipItems) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `chip${state.filterNetwork === item.id ? ' active' : ''}`;
      btn.textContent = item.label;
      btn.addEventListener('click', () => {
        state.filterNetwork = item.id;
        renderSidebar();
      });
      chipsHost.appendChild(btn);
    }
  }

  // Вкладки папок
  const folderHost = $('folderTabs');
  folderHost.replaceChildren();
  for (const fld of state.folders) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = `folder-tab${state.activeFolder === fld.id ? ' active' : ''}`;
    btn.textContent = `${fld.icon} ${fld.name}`;
    btn.addEventListener('click', () => {
      state.activeFolder = fld.id;
      renderSidebar();
    });
    folderHost.appendChild(btn);
  }

  if (state.summary) {
    const phase = state.summary.chrono.phase;
    const pill = $('phasePill');
    pill.textContent = phase;
    pill.className = `phase-pill${phase === 'DEEP_SLEEP' ? ' sleep' : phase === 'COOLING' ? ' cooling' : ''}`;
    $('sidebarRamMb').textContent = `${state.summary.bridgesRamMb.toFixed(1)} МБ`;
    $('sidebarIndexDocs').textContent = String(state.summary.search?.documents || 0);
    $('sidebarOutbox').textContent = String(state.summary.outboxPending);
  }

  const listHost = $('chatList');
  listHost.replaceChildren();
  const q = state.searchQuery.trim().toLowerCase();
  const activeFldObj = state.folders.find((f) => f.id === state.activeFolder);

  const filtered = state.chats.filter((c) => {
    const spec = findNetworkSpec(c.network);
    if (state.activeFolder === 'direct' && spec?.needsVpn) return false;
    if (state.activeFolder === 'vpn' && !spec?.needsVpn) return false;
    if (state.activeFolder === 'pinned' && !c.pinnedChat) return false;
    if (activeFldObj && !activeFldObj.system && !(activeFldObj.chatIds || []).includes(c.chatId)) return false;

    if (state.filterNetwork !== 'all' && c.network !== state.filterNetwork) return false;
    if (q && !c.title.toLowerCase().includes(q) && !c.network.toLowerCase().includes(q)) return false;
    return true;
  });

  if (!filtered.length) {
    const empty = document.createElement('p');
    empty.className = 'muted-text';
    empty.style.padding = '10px';
    empty.textContent = 'Нет чатов в этой папке или фильтре.';
    listHost.appendChild(empty);
    return;
  }

  for (const chat of filtered) {
    const spec = findNetworkSpec(chat.network);
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = `chat-item${chat.chatId === state.activeChatId ? ' active' : ''}`;

    const av = document.createElement('span');
    av.className = 'net-avatar';
    av.style.background = spec?.color || '#e8b45a';
    av.textContent = spec?.short || chat.network.slice(0, 2).toUpperCase();

    const body = document.createElement('div');
    body.className = 'chat-item-body';

    const top = document.createElement('div');
    top.className = 'chat-item-top';
    const title = document.createElement('span');
    title.className = 'chat-item-title';
    title.textContent = `${chat.pinnedChat ? '📌 ' : ''}${chat.title}`;

    const badges = document.createElement('span');
    badges.className = 'chat-item-badges';
    if (chat.unreadCount > 0 && chat.chatId !== state.activeChatId) {
      const ub = document.createElement('span');
      ub.className = 'unread-badge';
      ub.textContent = String(chat.unreadCount);
      badges.appendChild(ub);
    }
    const cnt = document.createElement('span');
    cnt.className = 'chat-item-count';
    cnt.textContent = `${chat.messageCount}`;
    badges.appendChild(cnt);
    top.append(title, badges);

    const sub = document.createElement('div');
    sub.className = 'chat-item-sub';
    if (chat.draftText) {
      const dr = document.createElement('span');
      dr.className = 'draft-tag';
      dr.textContent = `Черновик: ${chat.draftText.slice(0, 24)}`;
      sub.appendChild(dr);
    } else {
      const routeTag = spec?.routeReady ? (spec.activeRoute === 'direct' ? 'Напрямую' : spec.activeRoute) : 'Нужен VPN';
      const e2eeTag = spec?.e2ee ? 'E2EE' : (spec?.e2eeWarning ? 'Без E2EE!' : 'TLS');
      sub.textContent = `${routeTag} · ${e2eeTag}`;
    }

    body.append(top, sub);
    btn.append(av, body);
    btn.addEventListener('click', () => selectChat(chat.chatId));
    listHost.appendChild(btn);
  }
}

async function selectChat(chatId, highlightMsgId = null) {
  state.activeChatId = chatId;
  state.highlightMsgId = highlightMsgId;
  state.replyTarget = null;
  state.editTarget = null;
  renderReplyBar();
  setMobileView('chat');

  const chat = state.chats.find((c) => c.chatId === chatId);
  await Promise.all([
    state.client.call('chrono.recordPast', { kind: 'chat-switch', chatId }),
    state.client.call('workspace.markRead', { chatId }),
    chat ? state.client.call('connect.wake', { network: chat.network, reason: 'user-opened-chat' }) : Promise.resolve(),
  ]);

  const draftRes = await state.client.call('workspace.getDraft', { chatId });
  if (draftRes.ok) {
    $('messageInput').value = draftRes.data.text || '';
    autoResizeComposer();
  }

  await refreshAll();
  if (highlightMsgId) scrollToMessage(highlightMsgId);
}

function setMobileView(view) {
  const allowed = ['chats', 'chat', 'inspector'];
  const next = allowed.includes(view) ? view : 'chats';
  state.mobileView = next;
  const shell = $('appShell');
  if (shell) {
    shell.setAttribute('data-mobile-view', next);
    shell.classList.toggle('mobile-chat-open', next === 'chat');
  }
  const moreBar = $('chatMoreBar');
  if (moreBar && next !== 'chat') moreBar.hidden = true;

  for (const btn of document.querySelectorAll('#mobileBottomNav [data-mobile-nav]')) {
    btn.classList.toggle('is-active', btn.dataset.mobileNav === next);
  }
}

function autoResizeComposer() {
  const el = $('messageInput');
  if (!el) return;
  el.style.height = 'auto';
  const maxH = window.innerWidth <= 900 ? 110 : 120;
  el.style.height = `${Math.min(el.scrollHeight, maxH)}px`;
}

async function copyTextSafe(text, okMsg) {
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
      toast(okMsg || 'Скопировано в буфер обмена');
      return;
    }
  } catch { /* fallback ниже */ }
  const ta = document.createElement('textarea');
  ta.value = text;
  ta.style.position = 'fixed';
  ta.style.opacity = '0';
  document.body.appendChild(ta);
  ta.select();
  try {
    document.execCommand('copy');
    toast(okMsg || 'Скопировано в буфер обмена');
  } catch {
    toast('Скопируй строку вручную');
  }
  ta.remove();
}

function scrollToMessage(msgId) {
  const targetEl = document.querySelector(`[data-msgid="${CSS.escape(msgId)}"]`);
  if (!targetEl) return;
  targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
  targetEl.classList.add('highlight');
  setTimeout(() => targetEl.classList.remove('highlight'), 2200);
}

// ---------------- Отрисовка центрального чата ----------------
function renderActiveChat({ keepScroll = false } = {}) {
  const chat = state.chats.find((c) => c.chatId === state.activeChatId);
  if (!chat) return;
  const spec = findNetworkSpec(chat.network);
  const live = findLiveBridgeStatus(chat.network);

  $('activeChatTitle').textContent = chat.title;
  $('btnPinChat').textContent = chat.pinnedChat ? '📍' : '📌';
  const badge = $('activeChatBadge');
  badge.textContent = spec?.short || 'RM';
  badge.style.background = spec?.color || '#e8b45a';

  const routePill = $('activeRoutePill');
  const quickVpn = $('btnQuickBindVpn');
  if (spec) {
    if (live?.enabled) {
      routePill.textContent = `LIVE МОСТ: ${live.kind.toUpperCase()}`;
      routePill.className = 'pill accent';
      quickVpn.hidden = true;
    } else if (spec.routeReady) {
      routePill.textContent = spec.activeRoute === 'direct' ? 'Маршрут: Напрямую' : `VPN: ${spec.activeRoute}`;
      routePill.className = 'pill good';
      quickVpn.hidden = true;
    } else {
      routePill.textContent = 'Требуется VPN (RM-301)';
      routePill.className = 'pill warn';
      quickVpn.hidden = false;
    }

    const trustPill = $('activeTrustPill');
    trustPill.textContent = spec.e2eeLabel;
    trustPill.className = spec.e2ee ? 'pill good' : (spec.e2eeWarning ? 'pill warn' : 'pill');

    const banner = $('trustWarningBanner');
    if (spec.e2eeWarning) {
      banner.hidden = false;
      banner.textContent = `⚠️ ${spec.e2eeWarning}`;
    } else {
      banner.hidden = true;
    }
  }

  // Закреплённое сообщение наверху чата
  const pinnedMsgs = state.activeMessages.filter((m) => m.pinned && !m.deleted);
  const pinnedBanner = $('pinnedBanner');
  if (pinnedMsgs.length > 0) {
    const latestPin = pinnedMsgs[pinnedMsgs.length - 1];
    pinnedBanner.hidden = false;
    const jumpBtn = $('btnJumpPinned');
    jumpBtn.textContent = `${latestPin.text.slice(0, 72)} (${pinnedMsgs.length} закреп.)`;
    jumpBtn.onclick = () => scrollToMessage(latestPin.msgId);
  } else {
    pinnedBanner.hidden = true;
  }

  const feed = $('messagesFeed');
  const prevScroll = feed.scrollTop;
  feed.replaceChildren();

  for (const msg of state.activeMessages) {
    const row = document.createElement('article');
    row.className = `msg-row ${msg.direction === 'out' ? 'out' : 'in'}`;
    row.dataset.msgid = msg.msgId;

    const bubble = document.createElement('div');
    bubble.className = `msg-bubble${msg.deleted ? ' deleted' : ''}`;

    if (msg.direction !== 'out') {
      const sender = document.createElement('div');
      sender.className = 'msg-sender';
      sender.textContent = `${msg.senderName || msg.network}${msg.pinned ? ' · 📌' : ''}`;
      bubble.appendChild(sender);
    } else if (msg.pinned) {
      const pinTag = document.createElement('div');
      pinTag.className = 'msg-sender';
      pinTag.textContent = '📌 Закреплено';
      bubble.appendChild(pinTag);
    }

    if (msg.replyTo && !msg.deleted) {
      const ref = document.createElement('div');
      ref.className = 'msg-reply-ref';
      const orig = state.activeMessages.find((m) => m.msgId === msg.replyTo);
      ref.textContent = `Ответ на: ${orig ? orig.text.slice(0, 48) : msg.replyTo.slice(0, 12)}`;
      bubble.appendChild(ref);
    }

    // Безопасный рендеринг Markdown-lite
    const body = document.createElement('div');
    body.className = 'msg-text';
    body.appendChild(renderMarkdownToFragment(msg.text || ''));
    bubble.appendChild(body);

    // Вложения (фото inline, голосовые с волной + <audio>, файлы с SHA-256)
    if (msg.attachment && !msg.deleted) {
      const att = document.createElement('div');
      att.className = 'msg-attachment';
      const mediaUrl = state.client.getVaultMediaUrl(msg.attachment.storedPath);

      if (msg.attachment.isVoice || msg.attachment.mediaKind === 'audio') {
        const vb = document.createElement('div');
        vb.className = 'voice-box';
        const lbl = document.createElement('div');
        lbl.textContent = `🎙️ ${msg.attachment.filename} (${msg.attachment.durationSec ? `${msg.attachment.durationSec} сек · ` : ''}${formatBytes(msg.attachment.sizeBytes)})`;
        vb.append(lbl, renderWaveformBarsElement(msg.attachment.waveform || []));
        if (mediaUrl) {
          const audioEl = document.createElement('audio');
          audioEl.className = 'voice-audio';
          audioEl.controls = true;
          audioEl.preload = 'metadata';
          audioEl.src = mediaUrl;
          vb.appendChild(audioEl);
        }
        att.appendChild(vb);
      } else if (msg.attachment.mediaKind === 'image' && mediaUrl) {
        const img = document.createElement('img');
        img.className = 'msg-inline-img';
        img.src = mediaUrl;
        img.alt = msg.attachment.filename;
        att.appendChild(img);
        const cap = document.createElement('div');
        cap.textContent = `🖼️ ${msg.attachment.filename} (${formatBytes(msg.attachment.sizeBytes)})`;
        att.appendChild(cap);
      } else {
        const titleLine = document.createElement('div');
        titleLine.textContent = `📎 ${msg.attachment.filename} (${formatBytes(msg.attachment.sizeBytes)}, чанков: ${msg.attachment.totalChunks})`;
        att.appendChild(titleLine);
      }

      const hashLine = document.createElement('code');
      hashLine.textContent = `SHA-256: ${String(msg.attachment.sha256 || '').slice(0, 24)}…`;
      att.appendChild(hashLine);
      bubble.appendChild(att);
    }

    // Реакции
    if (Array.isArray(msg.reactions) && msg.reactions.length > 0 && !msg.deleted) {
      const rRow = document.createElement('div');
      rRow.className = 'msg-reactions';
      for (const r of msg.reactions) {
        const pill = document.createElement('button');
        pill.type = 'button';
        pill.className = 'react-pill';
        pill.textContent = `${r.emoji} ${r.count}`;
        pill.addEventListener('click', () => toggleReaction(msg.msgId, r.emoji));
        rRow.appendChild(pill);
      }
      bubble.appendChild(rRow);
    }

    const meta = document.createElement('div');
    meta.className = 'msg-meta';
    const timeEl = document.createElement('span');
    timeEl.textContent = `${formatTime(msg.ts)} · #${msg.seq || '?'}${msg.edited ? ' (ред.)' : ''}`;

    const statusEl = document.createElement('span');
    statusEl.textContent = statusLabel(msg.status, msg.errorCode);
    if (msg.errorCode) statusEl.style.color = '#f59e0b';
    meta.append(timeEl, statusEl);

    if (!msg.deleted) {
      const quickBar = document.createElement('span');
      quickBar.className = 'quick-react-bar';
      for (const em of state.quickReactions.slice(0, 4)) {
        const eb = document.createElement('button');
        eb.type = 'button';
        eb.textContent = em;
        eb.title = `Реакция ${em}`;
        eb.addEventListener('click', () => toggleReaction(msg.msgId, em));
        quickBar.appendChild(eb);
      }
      meta.appendChild(quickBar);

      meta.append(
        makeActionBtn('Ответить', () => {
          state.editTarget = null;
          state.replyTarget = msg;
          renderReplyBar();
          $('messageInput').focus();
        }),
        makeActionBtn('Переслать', () => openForwardModal(msg)),
        makeActionBtn(msg.pinned ? 'Открепить' : 'Закрепить', () => togglePinMessage(msg)),
      );

      if (msg.direction === 'out') {
        meta.append(
          makeActionBtn('Править', () => startEditMessage(msg)),
          makeActionBtn('Удалить', () => deleteMessage(msg)),
        );
      }
    }

    if (msg.transferId) {
      meta.appendChild(makeActionBtn('Трасса', () => inspectTransferById(msg.transferId)));
    }

    row.append(bubble, meta);
    feed.appendChild(row);
  }

  if (keepScroll) feed.scrollTop = prevScroll;
  else feed.scrollTop = feed.scrollHeight;
}

function makeActionBtn(label, handler) {
  const b = document.createElement('button');
  b.type = 'button';
  b.textContent = label;
  b.addEventListener('click', handler);
  return b;
}

async function toggleReaction(msgId, emoji) {
  await state.client.call('workspace.toggleReaction', { msgId, emoji });
  await loadActiveChatMessages({ keepScroll: true });
}

async function togglePinMessage(msg) {
  const r = await state.client.call('workspace.togglePin', { chatId: msg.chatId, msgId: msg.msgId });
  if (r.ok) toast(r.data.pinned ? 'Сообщение закреплено' : 'Сообщение откреплено');
  await refreshAll({ keepScroll: true });
}

function startEditMessage(msg) {
  state.replyTarget = null;
  state.editTarget = msg;
  $('messageInput').value = msg.text;
  renderReplyBar();
  $('messageInput').focus();
}

async function deleteMessage(msg) {
  const r = await state.client.call('workspace.deleteMessage', {
    chatId: msg.chatId,
    network: msg.network,
    msgId: msg.msgId,
  });
  if (r.ok) {
    toast('Сообщение помечено как удалённое (CRDT tombstone) и синхронизировано в readable.txt');
    await refreshAll({ keepScroll: true });
  }
}

function openForwardModal(msg) {
  state.forwardTarget = msg;
  $('forwardPreviewText').textContent = `«${(msg.text || '').slice(0, 90)}»`;
  const sel = $('forwardTargetChat');
  sel.replaceChildren();
  for (const c of state.chats) {
    const opt = document.createElement('option');
    opt.value = `${c.chatId}::${c.network}`;
    opt.textContent = `${c.title} (${c.network.toUpperCase()})`;
    sel.appendChild(opt);
  }
  $('forwardModal').showModal();
}

function renderReplyBar() {
  const bar = $('replyBar');
  if (state.editTarget) {
    bar.hidden = false;
    $('replyBarText').textContent = `✏️ Редактирование сообщения: «${state.editTarget.text.slice(0, 60)}»`;
    return;
  }
  if (state.replyTarget) {
    bar.hidden = false;
    $('replyBarText').textContent = `↩️ Ответ на: «${state.replyTarget.text.slice(0, 60)}»`;
    return;
  }
  bar.hidden = true;
}

function renderAttachmentBar() {
  const bar = $('attachmentBar');
  if (!state.pendingFile) {
    bar.hidden = true;
    return;
  }
  bar.hidden = false;
  $('attachmentName').textContent = `📎 ${state.pendingFile.filename}`;
  $('attachmentMeta').textContent = `${formatBytes(state.pendingFile.sizeBytes)} · ${state.pendingFile.mimeType || 'binary'}`;
}

// ---------------- Отправка сообщения / правки / файла / голоса СТРОГО через инструменты ----------------
async function handleSendSubmit(event) {
  event.preventDefault();
  const chat = state.chats.find((c) => c.chatId === state.activeChatId);
  if (!chat) return;

  const input = $('messageInput');
  const text = input.value.trim();
  const file = state.pendingFile;

  // Режим правки существующего сообщения
  if (state.editTarget) {
    if (!text) return;
    const res = await state.client.call('workspace.editMessage', {
      chatId: state.editTarget.chatId,
      network: state.editTarget.network,
      msgId: state.editTarget.msgId,
      newText: text,
    });
    state.editTarget = null;
    input.value = '';
    renderReplyBar();
    await state.client.call('workspace.setDraft', { chatId: chat.chatId, text: '' });
    if (res.ok) toast(`Сообщение обновлено (правок: ${res.data.editCount})`);
    await refreshAll({ keepScroll: true });
    return;
  }

  if (!text && !file) return;
  const hint = $('composerStatus');
  hint.textContent = 'Выполняется конвейер RatMes.tools.* …';

  if (file) {
    const simDrop = $('chkSimVpnDrop').checked;
    const p1 = await state.client.pipeline([
      {
        tool: 'pack.media',
        args: {
          chatId: chat.chatId,
          chatTitle: chat.title,
          network: chat.network,
          filename: file.filename,
          mimeType: file.mimeType,
          base64: file.base64,
          caption: text || `Файл: ${file.filename}`,
          chunkSize: 16384,
        },
      },
      { tool: 'pack.validate', args: { handleId: '$envelopeId', targetNetwork: chat.network } },
      { tool: 'vault.append', args: { handleId: '$envelopeId' } },
      { tool: 'vault.storeMedia', args: { handleId: '$attachmentId' } },
      { tool: 'transfer.enqueue', args: { handleId: '$envelopeId' } },
    ]);

    if (!p1.ok) {
      state.audio.warn();
      toast(`Ошибка упаковки файла: ${p1.error?.code} ${p1.error?.message}`);
      hint.textContent = `Остановлено: ${p1.error?.code || 'ERR'}`;
      return;
    }

    const { transferId, attachmentId } = p1.data.vars;
    const totalChunks = p1.data.results[0]?.data?.attachment?.totalChunks || 1;
    const dropIdx = simDrop ? (totalChunks > 1 ? Math.floor(totalChunks / 2) : 0) : null;
    const streamRes = await state.client.call('transfer.streamChunk', {
      transferId,
      attachmentHandle: attachmentId,
      simulateDropAtChunk: dropIdx,
    });

    if (!streamRes.ok) {
      state.audio.warn();
      toast(`${streamRes.error?.code}: ${streamRes.error?.message}`);
      state.selectedTransferId = transferId;
      hint.textContent = `Файл сохранён в RatMes-Vault/, но передача на паузе (${streamRes.error?.code}) — докачай во вкладке «Защита»!`;
    } else {
      const disp = await state.client.call('transfer.dispatch', { transferId });
      if (disp.ok) {
        state.audio.sent();
        toast(`Файл передан (${streamRes.data.sentChunks}/${streamRes.data.totalChunks} чанков) и сохранён в RatMes-Vault/`);
        hint.textContent = `Готово: pack.media → vault.storeMedia → streamChunk (${streamRes.data.totalChunks} чанков) → delivered`;
      } else {
        state.audio.warn();
        toast(`${disp.error?.code}: ${disp.error?.message}`);
        hint.textContent = `Файл в RatMes-Vault/, но маршрут вернул ${disp.error?.code}`;
      }
    }

    input.value = '';
    state.pendingFile = null;
    $('fileInput').value = '';
    $('chkSimVpnDrop').checked = false;
    renderAttachmentBar();
    await state.client.call('workspace.setDraft', { chatId: chat.chatId, text: '' });
    await refreshAll();
    return;
  }

  const packStep = state.replyTarget
    ? {
        tool: 'pack.reply',
        args: {
          chatId: chat.chatId,
          chatTitle: chat.title,
          network: chat.network,
          targetMsgId: state.replyTarget.msgId,
          text,
        },
      }
    : {
        tool: 'pack.text',
        args: {
          chatId: chat.chatId,
          chatTitle: chat.title,
          network: chat.network,
          text,
        },
      };

  const pipeRes = await state.client.pipeline([
    packStep,
    { tool: 'pack.validate', args: { handleId: '$envelopeId', targetNetwork: chat.network } },
    { tool: 'vault.append', args: { handleId: '$envelopeId' } },
    { tool: 'transfer.enqueue', args: { handleId: '$envelopeId' } },
    { tool: 'transfer.dispatch', args: { transferId: '$transferId' }, continueOnError: true },
  ]);

  input.value = '';
  state.replyTarget = null;
  renderReplyBar();
  await state.client.call('workspace.setDraft', { chatId: chat.chatId, text: '' });

  if (!pipeRes.ok) {
    state.audio.warn();
    toast(`${pipeRes.error?.code}: ${pipeRes.error?.message}`);
    hint.textContent = `Ошибка: ${pipeRes.error?.code} ${pipeRes.error?.message}`;
    await refreshAll();
    return;
  }

  const dispatchResult = pipeRes.data.results[4];
  state.selectedTransferId = pipeRes.data.vars.transferId;

  if (dispatchResult && dispatchResult.ok) {
    state.audio.sent();
    hint.textContent = `Доставлено за ${pipeRes.costMs} мс (${dispatchResult.data.routeUsed}, ${dispatchResult.data.encrypted ? 'E2EE' : 'TLS'}) · сохранено в RatMes-Vault/`;
    if (state.client.isCloudRoom?.(chat.chatId)) {
      state.client.pushSupabaseMessage({
        msgId: pipeRes.data.vars.msgId,
        roomId: chat.chatId,
        network: chat.network,
        senderName: state.displayName,
        text,
      }).then((pushRes) => {
        if (pushRes?.ok && !pushRes.skipped) {
          hint.textContent += ' + ☁ Supabase';
        }
      }).catch(() => {});
    }
  } else {
    state.audio.warn();
    const err = dispatchResult?.error;
    toast(`${err?.code || 'HOLD'}: ${err?.message || 'Отложено в Outbox'}`);
    hint.textContent = `Сохранено в RatMes-Vault/ и Outbox (${err?.code}) — открой «Защита» для деталей.`;
  }

  await refreshAll();
}

async function sendVoiceNote(recorded = null) {
  const chat = state.chats.find((c) => c.chatId === state.activeChatId);
  if (!chat) return;
  const voiceArgs = {
    chatId: chat.chatId,
    chatTitle: chat.title,
    network: chat.network,
    ...(recorded
      ? { base64: recorded.base64, mimeType: recorded.mimeType, durationSec: recorded.durationSec, waveform: recorded.waveform }
      : { durationSec: 2.3 }),
  };

  const pipe = await state.client.pipeline([
    { tool: 'pack.voice', args: voiceArgs },
    { tool: 'pack.validate', args: { handleId: '$envelopeId', targetNetwork: chat.network } },
    { tool: 'vault.append', args: { handleId: '$envelopeId' } },
    { tool: 'vault.storeMedia', args: { handleId: '$attachmentId' } },
    { tool: 'transfer.enqueue', args: { handleId: '$envelopeId' } },
    { tool: 'transfer.dispatch', args: { transferId: '$transferId' }, continueOnError: true },
  ]);
  if (pipe.ok) {
    state.audio.sent();
    toast(recorded ? `Голосовое (${recorded.durationSec} сек) сохранено в RatMes-Vault/` : 'Тестовое голосовое WAV записано в RatMes-Vault/media/!');
  } else {
    toast(`Ошибка голосовой заметки: ${pipe.error?.message}`);
  }
  await refreshAll();
}

// ---------------- Отрисовка 6 вкладок Инспектора ----------------
function renderInspector() {
  renderCloudTab();
  renderNetworksTab();
  renderChronoTab();
  renderVaultTab();
  renderGuardTab();
}

function renderCloudTab() {
  const cloud = state.cloudStatus;
  if (!cloud) return;
  const sb = cloud.supabase;
  const pill = $('cloudSyncPill');
  if (sb.reachable === true) {
    pill.className = 'pill good';
    pill.textContent = `Онлайн · ${sb.onlinePeersCount || 1} в сети`;
  } else if (sb.reachable === false) {
    pill.className = 'pill warn';
    pill.textContent = 'Локальный резерв';
  } else {
    pill.className = 'pill accent';
    pill.textContent = 'Готов к sync';
  }

  $('cloudCountPill').textContent = `${cloud.totalConnected} / ${cloud.totalConnected}`;

  const nameInput = $('cloudDisplayNameInput');
  if (nameInput && !nameInput.value) nameInput.value = state.displayName;

  const kv = $('cloudSupabaseStats');
  kv.replaceChildren(
    makeKvBox('Проект Supabase', sb.projectName),
    makeKvBox('Регион', sb.region),
    makeKvBox('Получено / Отправлено', `${sb.pulledCount} ↓ / ${sb.pushedCount} ↑`),
    makeKvBox('Последний sync', sb.lastSyncAt ? formatTime(sb.lastSyncAt) : 'ожидает'),
  );

  const peersHost = $('cloudOnlinePeers');
  peersHost.replaceChildren();
  if (sb.onlinePeers && sb.onlinePeers.length) {
    const row = document.createElement('div');
    row.className = 'peer-chip-row';
    for (const p of sb.onlinePeers.slice(0, 12)) {
      const chip = document.createElement('span');
      chip.className = 'peer-chip';
      chip.textContent = `● ${p.displayName}`;
      row.appendChild(chip);
    }
    peersHost.appendChild(row);
  } else {
    const hint = document.createElement('p');
    hint.className = 'muted-text';
    hint.textContent = sb.lastError
      ? `Офлайн-режим (${sb.lastError}) — сообщения надёжно пишутся в RatMes-Vault/.`
      : 'Нажми «Синхронизировать сейчас», чтобы подтянуть живые сообщения из games-cloud-save.';
    peersHost.appendChild(hint);
  }

  const list = $('cloudServicesList');
  list.replaceChildren();
  for (const svc of cloud.services || []) {
    const card = document.createElement('div');
    card.className = 'cloud-service-card';

    const head = document.createElement('div');
    head.className = 'cloud-service-head';
    const title = document.createElement('strong');
    title.textContent = svc.name;
    const badge = document.createElement('span');
    badge.className = 'pill good';
    badge.textContent = svc.category;
    head.append(title, badge);

    const resLine = document.createElement('div');
    resLine.className = 'cloud-service-cat';
    resLine.textContent = svc.resourceName;

    const roleLine = document.createElement('div');
    roleLine.className = 'muted-text';
    roleLine.textContent = svc.role;

    const link = document.createElement('a');
    link.className = 'cloud-service-link';
    link.href = svc.url;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.textContent = `Открыть ${svc.name} ↗`;

    card.append(head, resLine, roleLine, link);
    list.appendChild(card);
  }
}

function renderNetworksTab() {
  // P2P LAN пиры
  const p2pHost = $('p2pPeersList');
  p2pHost.replaceChildren();
  if (!state.p2pPeers.length) {
    const p = document.createElement('p');
    p.className = 'muted-text';
    p.textContent = 'Укажи адрес второго RatMes Agent в локальной сети, чтобы обмениваться E2EE-сообщениями напрямую без интернета.';
    p2pHost.appendChild(p);
  } else {
    for (const peer of state.p2pPeers) {
      const card = document.createElement('div');
      card.className = 'net-card';
      const top = document.createElement('div');
      top.className = 'net-card-top';
      const name = document.createElement('strong');
      name.textContent = peer.label || peer.peerId;
      const rtt = document.createElement('span');
      rtt.className = 'pill good';
      rtt.textContent = `${peer.rttMs || 3} мс · ${peer.live ? 'LIVE P2P' : 'LAN'}`;
      top.append(name, rtt);

      const info = document.createElement('div');
      info.className = 'muted-text';
      info.textContent = peer.endpoint || peer.ip || peer.peerId;

      const actions = document.createElement('div');
      actions.className = 'net-card-actions';
      const sendBtn = document.createElement('button');
      sendBtn.type = 'button';
      sendBtn.className = 'btn btn-sm btn-primary';
      sendBtn.textContent = 'Отправить E2EE пинг';
      sendBtn.addEventListener('click', async () => {
        if (peer.live) {
          const r = await state.client.sendP2pMessage({
            peerId: peer.peerId,
            chatId: 'lan-direct',
            chatTitle: `LAN · ${peer.label}`,
            text: `Привет по прямому зашифрованному AES-256-GCM LAN каналу! (${formatTime(Date.now())})`,
          });
          toast(r.ok ? `Доставлено E2EE на ${peer.label} за ${r.data.rttMs} мс` : (r.error?.message || 'Ошибка P2P'));
        } else {
          const pipe = await state.client.pipeline([
            { tool: 'pack.text', args: { chatId: 'ratmes-main', network: 'ratmes', text: `LAN-пакет для ${peer.label}` } },
            { tool: 'pack.validate', args: { handleId: '$envelopeId', targetNetwork: 'ratmes' } },
            { tool: 'relay.lanSend', args: { peerId: peer.peerId, envelope: '$envelopeId' } },
          ]);
          toast(pipe.ok ? `E2EE LAN-пакет ушёл на ${peer.ip}` : pipe.error?.message);
        }
        await refreshAll({ keepScroll: true });
      });
      actions.appendChild(sendBtn);
      card.append(top, info, actions);
      p2pHost.appendChild(card);
    }
  }

  // Матрица 12 мессенджеров + Живые мосты
  const liveCount = state.liveBridges.filter((b) => b.enabled).length;
  const livePill = $('liveBridgesCountPill');
  if (livePill) livePill.textContent = `${liveCount} LIVE`;

  const host = $('networksList');
  if (!state.matrix) return;
  host.replaceChildren();

  for (const net of state.matrix.networks) {
    const live = findLiveBridgeStatus(net.id);
    const card = document.createElement('div');
    card.className = 'net-card';

    const top = document.createElement('div');
    top.className = 'net-card-top';

    const nameBox = document.createElement('div');
    nameBox.className = 'net-card-name';
    const dot = document.createElement('span');
    dot.className = 'net-dot';
    dot.style.background = net.color;
    const lbl = document.createElement('span');
    lbl.textContent = `${net.name} (${net.short})`;
    nameBox.append(dot, lbl);

    const statePill = document.createElement('span');
    statePill.className = `pill ${live?.enabled ? 'accent' : (net.bridgeState === 'ACTIVE' ? 'good' : 'accent')}`;
    statePill.textContent = live?.enabled
      ? `LIVE · ${live.sentLive}↑/${live.recvLive}↓`
      : (net.bridgeState === 'ACTIVE' ? `ACTIVE · ${net.ramMb.toFixed(0)} МБ` : 'СПИТ · 64 Б');
    top.append(nameBox, statePill);

    const routeLine = document.createElement('div');
    routeLine.className = 'muted-text';
    routeLine.textContent = net.routeNote;

    const actions = document.createElement('div');
    actions.className = 'net-card-actions';

    if (net.needsVpn) {
      const btnProxy = document.createElement('button');
      btnProxy.type = 'button';
      btnProxy.className = 'btn btn-sm btn-primary';
      btnProxy.textContent = net.routeReady ? 'Сменить VPN' : 'Привязать VPN';
      btnProxy.addEventListener('click', () => openProxyModal(net));
      actions.appendChild(btnProxy);

      if (net.routeReady) {
        const btnFail = document.createElement('button');
        btnFail.type = 'button';
        btnFail.className = 'btn btn-sm btn-ghost';
        btnFail.textContent = 'План Б';
        btnFail.addEventListener('click', async () => {
          const r = await state.client.call('route.failover', { network: net.id });
          toast(r.ok ? `${net.name}: переключён на ${r.data.activeRoute || 'Outbox'}` : r.error.message);
          await refreshAll({ keepScroll: true });
        });
        actions.appendChild(btnFail);
      }
    }

    if (net.id !== 'ratmes') {
      const btnLive = document.createElement('button');
      btnLive.type = 'button';
      btnLive.className = 'btn btn-sm btn-ghost';
      btnLive.textContent = live?.enabled ? 'Настр. Live' : 'Живой API';
      btnLive.addEventListener('click', () => openLiveBridgeModal(net, live));
      actions.appendChild(btnLive);

      const btnSleep = document.createElement('button');
      btnSleep.type = 'button';
      btnSleep.className = 'btn btn-sm btn-ghost';
      btnSleep.textContent = net.bridgeState === 'ACTIVE' ? 'Усыпить' : 'Разбудить';
      btnSleep.addEventListener('click', async () => {
        const tool = net.bridgeState === 'ACTIVE' ? 'connect.hibernate' : 'connect.wake';
        const r = await state.client.call(tool, { network: net.id });
        if (r.ok) toast(`${net.name}: ${tool === 'connect.hibernate' ? `освобождено ${r.data.freedMb} МБ` : 'пробуждён (Lazy Wake)'}`);
        await refreshAll({ keepScroll: true });
      });
      actions.appendChild(btnSleep);

      const btnCrash = document.createElement('button');
      btnCrash.type = 'button';
      btnCrash.className = 'btn btn-sm btn-danger';
      btnCrash.textContent = 'Уронить';
      btnCrash.addEventListener('click', async () => {
        const r = await state.client.call('connect.supervise', { network: net.id, fault: 'manual-test' });
        if (r.ok) toast(`${net.name}: изолированно перезапущен супервизором (рестартов: ${r.data.restarts})`);
        await refreshAll({ keepScroll: true });
      });
      actions.appendChild(btnCrash);
    }

    card.append(top, routeLine, actions);
    host.appendChild(card);
  }
}

function renderChronoTab() {
  if (!state.summary) return;
  const chrono = state.summary.chrono;
  const cache = state.summary.cache;
  const sched = state.summary.scheduler;

  for (const btn of $('phaseButtons').querySelectorAll('button')) {
    btn.classList.toggle('current', btn.dataset.phase === chrono.phase);
  }

  $('chkLowBattery').checked = chrono.backpressure.batteryPct < 20;
  $('chkSaveData').checked = Boolean(chrono.backpressure.saveData);

  const chronoStats = $('chronoStats');
  chronoStats.replaceChildren(
    makeKvBox('Фаза', chrono.phase),
    makeKvBox('Простой', `${chrono.idleSec} сек`),
    makeKvBox('Уборок DAG', String(chrono.housekeepingRuns)),
    makeKvBox('Backpressure', chrono.backpressure.active ? 'АКТИВЕН' : 'Выкл'),
  );

  const predHost = $('futurePredictions');
  predHost.replaceChildren();
  const cands = chrono.prediction?.candidates || [];
  const confs = chrono.prediction?.confidence || [];
  if (!cands.length) {
    const p = document.createElement('p');
    p.className = 'muted-text';
    p.textContent = 'Переключись между 2–3 чатами, чтобы матрица Маркова изучила привычки.';
    predHost.appendChild(p);
  } else {
    cands.forEach((cid, i) => {
      const chat = state.chats.find((c) => c.chatId === cid);
      const row = document.createElement('div');
      row.className = 'trace-row ok';
      const left = document.createElement('span');
      left.textContent = `${i + 1}. ${chat ? chat.title : cid}`;
      const right = document.createElement('strong');
      right.textContent = `${Math.round((confs[i] || 0) * 100)}%`;
      row.append(left, right);
      predHost.appendChild(row);
    });
  }

  const cacheStats = $('cacheStats');
  cacheStats.replaceChildren(
    makeKvBox('Очереди S / M / G', `${cache.queues.smallS} / ${cache.queues.mainM} / ${cache.queues.ghostG}`),
    makeKvBox('Ярусы H / W / C', `${cache.tiers.HOT} / ${cache.tiers.WARM} / ${cache.tiers.COLD}`),
    makeKvBox('Приоритеты Очередь', `U:${sched?.pending?.urgent || 0} H:${sched?.pending?.high || 0} B:${sched?.pending?.bulk || 0}`),
    makeKvBox('Однодневок отсеяно', String(cache.stats.oneHitRejected)),
  );

  const cbHost = $('schedulerCircuits');
  cbHost.replaceChildren();
  const circuits = sched?.circuits || [];
  for (const cb of circuits.slice(0, 6)) {
    const row = document.createElement('div');
    row.className = `trace-row ${cb.state === 'CLOSED' ? 'ok' : 'err'}`;
    const left = document.createElement('span');
    left.textContent = `${cb.network}:${cb.routeId} [${cb.state}]`;
    const right = document.createElement('span');
    right.textContent = `EWMA ${cb.ewmaRttMs} мс · ✓${cb.totalSuccesses}/✗${cb.totalFailures}`;
    row.append(left, right);
    cbHost.appendChild(row);
  }
}

function renderVaultTab() {
  if (state.summary) {
    $('vaultRootLabel').textContent = `${state.summary.vaultBackend}: ${state.summary.vaultRoot}`;
  }
  const host = $('vaultFilesList');
  host.replaceChildren();
  for (const f of state.vaultFiles) {
    const row = document.createElement('button');
    row.type = 'button';
    row.className = 'file-row';
    const p = document.createElement('span');
    p.textContent = f.path;
    const sz = document.createElement('span');
    sz.textContent = formatBytes(f.sizeBytes);
    row.append(p, sz);
    row.addEventListener('click', () => previewVaultFile(f.path));
    host.appendChild(row);
  }
}

async function previewVaultFile(relPath) {
  const card = $('vaultPreviewCard');
  $('vaultPreviewTitle').textContent = relPath;
  const dl = $('vaultDownloadLink');
  const dlUrl = state.client.getVaultDownloadUrl(relPath);
  if (dlUrl) {
    dl.href = dlUrl;
    dl.hidden = false;
  } else {
    dl.hidden = true;
  }

  const res = await state.client.call('vault.readPlainTextFile', { path: relPath });
  card.hidden = false;
  $('vaultPreviewContent').textContent = res.ok
    ? res.data.content
    : `Бинарный файл (${relPath}) — нажми «Скачать», чтобы открыть напрямую с диска.`;
}

function renderGuardTab() {
  const trfHost = $('transfersList');
  trfHost.replaceChildren();
  const list = [...state.transfers].reverse().slice(0, 12);
  if (!list.length) {
    const p = document.createElement('p');
    p.className = 'muted-text';
    p.textContent = 'Отправь сообщение, голос или файл, чтобы увидеть живую трассу передачи.';
    trfHost.appendChild(p);
  } else {
    for (const tr of list) {
      const card = document.createElement('div');
      card.className = 'net-card';

      const top = document.createElement('div');
      top.className = 'net-card-top';
      const left = document.createElement('strong');
      left.textContent = `${tr.transferId} · ${tr.network} [${tr.priority || 'high'}]`;
      const right = document.createElement('span');
      right.className = `pill ${tr.status === 'delivered' ? 'good' : (tr.lastError ? 'warn' : 'accent')}`;
      right.textContent = statusLabel(tr.status, tr.lastError?.code);
      top.append(left, right);

      const info = document.createElement('div');
      info.className = 'muted-text';
      const chunkNote = tr.chunkProgress
        ? ` · чанки ${tr.chunkProgress.sentChunks}/${tr.chunkProgress.totalChunks}`
        : '';
      info.textContent = `Этап: ${tr.stage}${chunkNote}${tr.routeUsed ? ` · ${tr.routeUsed}` : ''}`;

      card.append(top, info);
      if (tr.chunkProgress?.chunkMap) {
        card.appendChild(renderChunkMapElement(tr.chunkProgress.chunkMap));
      }

      const btns = document.createElement('div');
      btns.className = 'net-card-actions';

      const btnWhy = document.createElement('button');
      btnWhy.type = 'button';
      btnWhy.className = 'btn btn-sm btn-ghost';
      btnWhy.textContent = 'Почему?';
      btnWhy.addEventListener('click', () => inspectTransferById(tr.transferId));
      btns.appendChild(btnWhy);

      if (tr.status !== 'delivered' && tr.status !== 'cancelled') {
        const btnResume = document.createElement('button');
        btnResume.type = 'button';
        btnResume.className = 'btn btn-sm btn-primary';
        btnResume.textContent = tr.chunkProgress ? 'План Б + Докачать' : 'Повторить';
        btnResume.addEventListener('click', async () => {
          if (tr.chunkProgress) {
            await state.client.call('transfer.reroute', { transferId: tr.transferId, fallbackMode: 'backup-vpn' });
            const r = await state.client.call('transfer.resume', { transferId: tr.transferId });
            if (r.ok && r.data.done) {
              await state.client.call('transfer.dispatch', { transferId: tr.transferId });
              toast(`${tr.transferId}: докачка завершена с места обрыва!`);
            } else {
              toast(r.error?.message || 'Требуется рабочий маршрут');
            }
          } else {
            const r = await state.client.call('transfer.dispatch', { transferId: tr.transferId });
            toast(r.ok ? `${tr.transferId}: доставлено!` : `${r.error?.code}: ${r.error?.message}`);
          }
          await refreshAll({ keepScroll: true });
        });
        btns.appendChild(btnResume);
      }

      card.appendChild(btns);
      trfHost.appendChild(card);
    }
  }

  const traceHost = $('traceList');
  traceHost.replaceChildren();
  const traces = [...(state.summary?.recentTraces || [])].reverse();
  for (const t of traces) {
    const row = document.createElement('div');
    row.className = `trace-row ${t.ok ? 'ok' : 'err'}`;
    const left = document.createElement('span');
    left.textContent = `${t.tool}${t.errorCode ? ` [${t.errorCode}]` : ''}`;
    const right = document.createElement('span');
    right.textContent = `${t.costMs} мс`;
    row.append(left, right);
    traceHost.appendChild(row);
  }
}

// ---------------- Интерактивная консоль RatMes.tools.* ----------------
async function initToolConsole() {
  const helpRes = await state.client.call('help');
  if (!helpRes.ok) return;
  const groups = Object.keys(helpRes.data.ratMesGroups || {});
  const gSel = $('consoleGroupSelect');
  gSel.replaceChildren();
  for (const g of groups) {
    const opt = document.createElement('option');
    opt.value = g;
    opt.textContent = `tools.${g}`;
    gSel.appendChild(opt);
    const gm = await state.client.call('help', { group: g });
    if (gm.ok) state.toolHelpMap[g] = gm.data.methods || [];
  }
  updateConsoleMethods();
}

function updateConsoleMethods() {
  const group = $('consoleGroupSelect').value;
  const methods = state.toolHelpMap[group] || [];
  const mSel = $('consoleMethodSelect');
  mSel.replaceChildren();
  for (const m of methods) {
    const opt = document.createElement('option');
    opt.value = m;
    opt.textContent = m;
    mSel.appendChild(opt);
  }
  prefillConsoleArgs();
}

function prefillConsoleArgs() {
  const key = `${$('consoleGroupSelect').value}.${$('consoleMethodSelect').value}`;
  const sample = TOOL_SAMPLE_ARGS[key] || {};
  $('consoleArgsInput').value = JSON.stringify(sample, null, 2);
}

// ---------------- Единые контакты ----------------
function renderContactsModal() {
  const host = $('contactsList');
  host.replaceChildren();
  for (const cnt of state.contacts) {
    const card = document.createElement('div');
    card.className = 'net-card';
    const top = document.createElement('div');
    top.className = 'net-card-top';
    const name = document.createElement('strong');
    name.textContent = cnt.displayName;
    top.appendChild(name);

    const note = document.createElement('div');
    note.className = 'muted-text';
    note.textContent = cnt.note || 'Объединённый профиль контакта';

    const row = document.createElement('div');
    row.className = 'net-card-actions';
    for (const h of cnt.handles || []) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'btn btn-sm btn-ghost';
      btn.textContent = `${h.network.toUpperCase()}: ${h.handle}`;
      btn.addEventListener('click', async () => {
        $('contactsModal').close();
        if (h.chatId && state.chats.some((c) => c.chatId === h.chatId)) {
          await selectChat(h.chatId);
        } else {
          const slug = `${h.network}-${h.handle.replace(/[^a-zA-Z0-9]+/g, '')}`;
          await state.client.call('transfer.receive', {
            sourceChannel: 'contact',
            network: h.network,
            chatId: slug,
            chatTitle: `${cnt.displayName} (${h.network.toUpperCase()})`,
            senderName: cnt.displayName,
            text: `Открыт чат с контактом ${cnt.displayName} (${h.handle}).`,
          });
          await refreshAll();
          await selectChat(slug);
        }
      });
      row.appendChild(btn);
    }

    card.append(top, note, row);
    host.appendChild(card);
  }
}

async function inspectTransferById(transferId) {
  state.selectedTransferId = transferId;
  switchInspectorTab('guard');
  $('inspectorPanel').classList.add('open');
  const res = await state.client.call('diag.whyStuck', { transferId });
  const box = $('guardAuditResult');
  box.hidden = false;
  if (res.ok) {
    const d = res.data;
    box.textContent = `Инспектор ${transferId}:\n• Причина: ${d.rootCause}\n• В RatMes-Vault/: ${d.savedSafelyInVault ? 'сохранено надёжно' : 'требует проверки'}\n• Объяснение: ${d.humanExplanation}\n• Что сделать: ${d.suggestedFix}`;
  } else {
    box.textContent = res.error?.message || 'Ошибка диагностики';
  }
}

function makeKvBox(label, value) {
  const div = document.createElement('div');
  div.className = 'kv-box';
  const s = document.createElement('span');
  s.textContent = label;
  const st = document.createElement('strong');
  st.textContent = value;
  div.append(s, st);
  return div;
}

function switchInspectorTab(tabName) {
  for (const b of document.querySelectorAll('.tab-btn')) {
    b.classList.toggle('active', b.dataset.tab === tabName);
  }
  for (const p of document.querySelectorAll('.tab-pane')) {
    p.classList.toggle('active', p.id === `tab-${tabName}`);
  }
}

function openProxyModal(net) {
  $('proxyModalTitle').textContent = `VPN / прокси для ${net.name}`;
  $('proxyNetworkInput').value = net.id;
  $('proxyPrimaryInput').value = net.activeRoute && net.activeRoute !== 'direct' ? net.activeRoute : 'vpn-eu-01 (WireGuard)';
  $('proxyBackupInput').value = net.backupRoute || 'vpn-nl-backup-02 (VLESS)';
  $('proxyModal').showModal();
}

function openLiveBridgeModal(net, _live) {
  openConnectHub(net.id, 'setup');
}

// ---------------- Пошаговый Центр подключений (MAX, Telegram, Discord, VK, WhatsApp и др.) ----------------
function setHubMobileStep(step) {
  state.hubStep = step === 'setup' ? 'setup' : 'list';
  const layout = $('hubLayout');
  if (layout) layout.setAttribute('data-hub-step', state.hubStep);
  for (const btn of document.querySelectorAll('#hubMobileTabs [data-hub-step]')) {
    btn.classList.toggle('is-active', btn.dataset.hubStep === state.hubStep);
  }
}

function openConnectHub(serviceId = null, step = null) {
  if (serviceId && SERVICE_GUIDES.some((g) => g.id === serviceId)) {
    state.hubSelectedService = serviceId;
  } else {
    const activeChat = state.chats.find((c) => c.chatId === state.activeChatId);
    if (activeChat && SERVICE_GUIDES.some((g) => g.id === activeChat.network)) {
      state.hubSelectedService = activeChat.network;
    } else if (!state.hubSelectedService) {
      state.hubSelectedService = 'max';
    }
  }
  const desiredStep = step || (serviceId ? 'setup' : 'list');
  setHubMobileStep(desiredStep);
  renderConnectHub();
  const dlg = $('connectHubModal');
  if (dlg && !dlg.open) dlg.showModal();
}

function renderConnectHub() {
  // 1. Статус режима ПК-агента / телефона
  const mode = state.client.getMode();
  const pill = $('hubAgentStatusPill');
  const note = $('hubAgentStatusText');
  const remoteInput = $('hubRemoteAgentInput');
  const disconnectBtn = $('btnDisconnectRemoteAgent');
  const savedRemote = state.client.getSavedRemoteAgentUrl();

  if (mode === 'agent') {
    pill.textContent = '🟢 ПК-агент подключён';
    pill.className = 'pill good';
    const base = state.client.getAgentBaseUrl();
    note.textContent = savedRemote
      ? `Связь с удалённым ПК-агентом (${savedRemote}) · MAX, VK, Telegram и Long Polling работают без CORS`
      : `Локальный ПК-агент активен (${base || 'локально'}) · все живые мосты, SecretVault и RatMes-Vault/ работают напрямую`;
    if (remoteInput && !remoteInput.value) remoteInput.value = savedRemote;
    if (disconnectBtn) disconnectBtn.hidden = !savedRemote;
  } else {
    pill.textContent = '📱 Автономный режим телефона/браузера';
    pill.className = 'pill accent';
    note.textContent = 'Discord, Telegram, Matrix и тестовые чаты доступны сразу. Для MAX, VK и автоприёма входящих раскрой блок ниже и укажи свой ПК-агент.';
    if (remoteInput && !remoteInput.value) remoteInput.value = savedRemote;
    if (disconnectBtn) disconnectBtn.hidden = true;
  }

  // 2. Сетка всех 12 сервисов
  const grid = $('hubServiceGrid');
  if (grid) {
    grid.replaceChildren();
    const q = state.hubSearch.trim().toLowerCase();
    const filtered = SERVICE_GUIDES.filter((g) => {
      if (!q) return true;
      return g.name.toLowerCase().includes(q) || g.id.includes(q) || g.summary.toLowerCase().includes(q);
    });

    for (const g of filtered) {
      const live = findLiveBridgeStatus(g.id);
      const spec = findNetworkSpec(g.id);
      const card = document.createElement('button');
      card.type = 'button';
      card.className = `hub-service-card${g.id === state.hubSelectedService ? ' is-selected' : ''}`;

      const av = document.createElement('span');
      av.className = 'net-avatar';
      av.style.background = g.color;
      av.textContent = g.short;

      const info = document.createElement('div');
      info.className = 'hub-service-info';

      const top = document.createElement('div');
      top.className = 'hub-service-top';
      const nameEl = document.createElement('strong');
      nameEl.textContent = g.name;
      const badge = document.createElement('span');
      if (live?.enabled) {
        badge.className = 'pill good';
        badge.textContent = 'LIVE';
      } else if (spec && spec.needsVpn && !spec.routeReady) {
        badge.className = 'pill warn';
        badge.textContent = 'Нужен VPN';
      } else {
        badge.className = 'pill';
        badge.textContent = g.difficulty;
      }
      top.append(nameEl, badge);

      const meta = document.createElement('div');
      meta.className = 'hub-service-meta';
      meta.textContent = g.summary;

      info.append(top, meta);
      card.append(av, info);
      card.addEventListener('click', () => {
        state.hubSelectedService = g.id;
        setHubMobileStep('setup');
        renderConnectHub();
      });
      grid.appendChild(card);
    }
  }

  // 3. Пошаговая правая панель выбранного сервиса
  const guide = getServiceGuide(state.hubSelectedService);
  const live = findLiveBridgeStatus(guide.id);
  const spec = findNetworkSpec(guide.id);

  $('hubSelectedNameShort').textContent = guide.name;
  const avatar = $('hubGuideAvatar');
  avatar.textContent = guide.short;
  avatar.style.background = guide.color;
  $('hubGuideTitle').textContent = guide.name;
  $('hubGuideDifficulty').textContent = guide.difficulty;

  const statePill = $('hubGuideStatePill');
  if (live?.enabled) {
    statePill.textContent = `🟢 Подключён (${live.sentLive || 0}↑ / ${live.recvLive || 0}↓)`;
    statePill.className = 'pill good';
  } else {
    statePill.textContent = 'Песочница / не подключён';
    statePill.className = 'pill';
  }

  const webLink = $('hubGuideWebLink');
  webLink.href = guide.webAppUrl;
  const docsLink = $('hubGuideDocsLink');
  docsLink.href = guide.docsUrl;
  $('hubGuideSummary').textContent = guide.summary;

  const e2eeWarn = $('hubGuideE2eeWarn');
  if (guide.e2eeWarning) {
    e2eeWarn.hidden = false;
    e2eeWarn.textContent = `⚠️ ${guide.e2eeWarning}`;
  } else {
    e2eeWarn.hidden = true;
  }

  const vpnBox = $('hubGuideVpnBox');
  if (spec && spec.needsVpn && !spec.routeReady) {
    vpnBox.hidden = false;
    $('hubVpnCountry').textContent = state.matrix?.activeCountry?.code || 'RU';
    $('hubVpnDesc').textContent = spec.routeNote || 'Привяжи маршрут VPN/прокси, чтобы сообщения не останавливались в Outbox (RM-301).';
  } else {
    vpnBox.hidden = true;
  }

  const stepsList = $('hubStepsList');
  stepsList.replaceChildren();
  for (const stepText of guide.steps) {
    const li = document.createElement('li');
    li.textContent = stepText;
    stepsList.appendChild(li);
  }

  // Заполняем форму с учётом выбранного сервиса
  $('hubFormNetwork').value = guide.id;
  const kindSel = $('hubFormKind');
  kindSel.value = live?.kind || guide.driverKind;
  applyHubFormFieldLabels(guide, live);

  $('hubWebhookUrl').textContent = state.client.getWebhookUrl(guide.id);
  $('hubDirectHint').textContent = guide.directBrowserHint || '';
  $('btnHubDisableBridge').hidden = !live?.enabled;
}

function applyHubFormFieldLabels(guide, live) {
  const f = guide.fields;
  const kind = $('hubFormKind').value;
  const isWebhookOverride = kind === 'webhook' && guide.driverKind !== 'webhook';

  $('hubFieldEndpointWrap').hidden = !f.showEndpoint && !isWebhookOverride;
  $('hubLabelEndpoint').textContent = isWebhookOverride ? 'URL Webhook-шлюза (n8n / Evolution API / свой сервер)' : f.endpointLabel;
  $('hubFormEndpoint').placeholder = isWebhookOverride ? 'https://your-gateway.example/send' : f.endpointPlaceholder;
  if ($('hubFormEndpoint').dataset.forNet !== guide.id) {
    $('hubFormEndpoint').value = live?.endpoint || guide.defaultEndpoint || '';
    $('hubFormEndpoint').dataset.forNet = guide.id;
  }

  $('hubFieldTokenWrap').hidden = !f.showToken && !isWebhookOverride;
  $('hubLabelToken').textContent = isWebhookOverride ? 'Bearer-токен шлюза (необязательно)' : f.tokenLabel;
  $('hubFormToken').placeholder = isWebhookOverride ? 'Секрет (если требуется)' : f.tokenPlaceholder;
  if ($('hubFormToken').dataset.forNet !== guide.id) {
    $('hubFormToken').value = '';
    $('hubFormToken').dataset.forNet = guide.id;
  }

  $('hubFieldTargetWrap').hidden = !f.showTargetId && !isWebhookOverride;
  $('hubLabelTarget').textContent = isWebhookOverride ? 'Target ID / номер / чат (необязательно)' : f.targetLabel;
  $('hubFormTarget').placeholder = isWebhookOverride ? 'ID чата или получателя' : f.targetPlaceholder;
  if ($('hubFormTarget').dataset.forNet !== guide.id) {
    $('hubFormTarget').value = live?.targetId || '';
    $('hubFormTarget').dataset.forNet = guide.id;
  }

  const pollWrap = $('hubPollingWrap');
  pollWrap.hidden = !guide.supportsPolling || isWebhookOverride;
  if (live) $('hubFormPolling').checked = Boolean(live.polling || guide.supportsPolling);

  // Сбрасываем старый результат проверки при смене сервиса
  if ($('hubTestResult').dataset.forNet !== guide.id) {
    $('hubTestResult').hidden = true;
    $('hubSuggestedWrap').hidden = true;
    $('hubTestResult').dataset.forNet = guide.id;
  }
}

// ---------------- Привязка событий ----------------
function bindEvents() {
  $('composerForm').addEventListener('submit', handleSendSubmit);

  $('messageInput').addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      $('composerForm').requestSubmit();
    } else if (e.key === 'ArrowUp' && !$('messageInput').value.trim()) {
      const lastOwn = [...state.activeMessages].reverse().find((m) => m.direction === 'out' && !m.deleted);
      if (lastOwn) {
        e.preventDefault();
        startEditMessage(lastOwn);
      }
    } else if (e.key === 'Escape' && (state.replyTarget || state.editTarget)) {
      state.replyTarget = null;
      state.editTarget = null;
      $('messageInput').value = '';
      renderReplyBar();
    }
  });

  // Автосохранение черновиков и авто-рост поля ввода
  $('messageInput').addEventListener('input', () => {
    autoResizeComposer();
    if (!state.activeChatId || state.editTarget) return;
    clearTimeout(state.draftTimer);
    const chatId = state.activeChatId;
    const text = $('messageInput').value;
    state.draftTimer = setTimeout(() => {
      state.client.call('workspace.setDraft', { chatId, text });
    }, 350);
  });

  $('chatSearchInput').addEventListener('input', (e) => {
    state.searchQuery = e.target.value;
    renderSidebar();
  });

  $('countrySelect').addEventListener('change', async (e) => {
    const res = await state.client.call('route.setCountry', { countryCode: e.target.value });
    if (res.ok) {
      toast(`Профиль маршрутов переключён на ${res.data.name} (${res.data.countryCode})`);
      await refreshAll({ keepScroll: true });
    }
  });

  $('btnCommandPalette').addEventListener('click', () => state.palette.open());
  $('btnContactsBook').addEventListener('click', () => {
    renderContactsModal();
    $('contactsModal').showModal();
  });
  $('btnCloseContacts').addEventListener('click', () => $('contactsModal').close());

  $('addContactForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const displayName = $('contactNameInput').value.trim();
    const handle = $('contactHandleInput').value.trim() || '@user';
    const network = $('contactNetSelect').value;
    if (!displayName) return;
    await state.client.call('workspace.upsertContact', {
      displayName,
      handles: [{ network, handle }],
    });
    $('contactNameInput').value = '';
    $('contactHandleInput').value = '';
    await refreshAll({ keepScroll: true });
    renderContactsModal();
    toast(`Контакт «${displayName}» добавлен`);
  });

  $('btnCreateFolder').addEventListener('click', async () => {
    const name = window.prompt('Название новой папки (например: Работа или Игры):');
    if (!name || !name.trim()) return;
    const res = await state.client.call('workspace.createFolder', {
      name: name.trim(),
      icon: '📁',
      chatIds: state.activeChatId ? [state.activeChatId] : [],
    });
    if (res.ok) {
      state.activeFolder = res.data.folder.id;
      toast(`Папка «${res.data.folder.name}» создана`);
      await refreshAll({ keepScroll: true });
    }
  });

  $('btnPinChat').addEventListener('click', async () => {
    const chat = state.chats.find((c) => c.chatId === state.activeChatId);
    if (!chat) return;
    await state.client.call('workspace.updateChatFlags', { chatId: chat.chatId, pinnedChat: !chat.pinnedChat });
    toast(chat.pinnedChat ? 'Чат откреплён' : 'Чат закреплён наверху списка');
    await refreshAll({ keepScroll: true });
  });

  $('btnMute').addEventListener('click', () => {
    const muted = state.audio.toggleMute();
    $('btnMute').textContent = muted ? '🔇' : '🔊';
  });

  $('btnCancelReply').addEventListener('click', () => {
    state.replyTarget = null;
    state.editTarget = null;
    $('messageInput').value = '';
    renderReplyBar();
  });

  // Запись голосового сообщения
  $('btnRecordVoice').addEventListener('click', async () => {
    const res = await state.voiceRecorder.start();
    if (res.started) {
      $('voiceRecordBar').hidden = false;
    } else {
      // Нет микрофона — сразу создаём настоящий воспроизводимый PCM WAV через pack.voice!
      toast(`${res.reason} — отправляю тестовую WAV-заметку через pack.voice`);
      await sendVoiceNote(null);
    }
  });
  $('btnStopSendVoice').addEventListener('click', async () => {
    const recorded = await state.voiceRecorder.stop();
    $('voiceRecordBar').hidden = true;
    await sendVoiceNote(recorded);
  });
  $('btnCancelVoice').addEventListener('click', () => {
    state.voiceRecorder.cancel();
    $('voiceRecordBar').hidden = true;
  });

  $('fileInput').addEventListener('change', async (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 10 * 1024 * 1024) {
      toast('Для браузерного демо выбери файл до 10 МБ');
      return;
    }
    const base64 = await fileToBase64(f);
    state.pendingFile = {
      filename: f.name,
      mimeType: f.type || 'application/octet-stream',
      sizeBytes: f.size,
      base64,
    };
    renderAttachmentBar();
  });

  $('btnClearAttachment').addEventListener('click', () => {
    state.pendingFile = null;
    $('fileInput').value = '';
    renderAttachmentBar();
  });

  $('btnSimIncoming').addEventListener('click', async () => {
    const chat = state.chats.find((c) => c.chatId === state.activeChatId);
    if (!chat) return;
    state.incomingSeqCounter += 1;
    const samples = [
      'Привет! Проверяю доставку и **мгновенную индексацию** `BM25` в `RatMes-Vault/`.',
      'Подтверждаю: текст, правки и голос видны в обычном `readable.txt` без всякой базы!',
      'А если VPN моргнёт — **Circuit Breaker + План Б** подхватят передачу с того же чанка #ratmes.',
    ];
    const text = samples[state.incomingSeqCounter % samples.length];
    const r = await state.client.call('transfer.receive', {
      sourceChannel: 'bridge-sim',
      network: chat.network,
      chatId: chat.chatId,
      chatTitle: chat.title,
      senderName: `Собеседник (${chat.network.toUpperCase()})`,
      text,
    });
    if (r.ok) {
      state.audio.received();
      await refreshAll();
    }
  });

  $('btnQuickBindVpn').addEventListener('click', () => {
    const chat = state.chats.find((c) => c.chatId === state.activeChatId);
    const spec = chat ? findNetworkSpec(chat.network) : null;
    if (spec) openProxyModal(spec);
  });

  for (const btn of document.querySelectorAll('.tab-btn')) {
    btn.addEventListener('click', () => switchInspectorTab(btn.dataset.tab));
  }

  $('btnToggleInspector').addEventListener('click', () => {
    if (window.innerWidth <= 900) setMobileView(state.mobileView === 'inspector' ? 'chat' : 'inspector');
    else if (window.innerWidth <= 1180) $('inspectorPanel').classList.toggle('open');
    else $('appShell').classList.toggle('inspector-hidden');
  });
  $('btnToggleInspectorMobile').addEventListener('click', () => {
    if (window.innerWidth <= 900) setMobileView('inspector');
    else $('inspectorPanel').classList.toggle('open');
  });
  $('btnCloseInspector').addEventListener('click', () => {
    if (window.innerWidth <= 900) setMobileView('chat');
    else $('inspectorPanel').classList.remove('open');
  });
  $('btnBackChats').addEventListener('click', () => setMobileView('chats'));

  // Мобильная нижняя навигация и мобильное меню действий чата
  for (const btn of document.querySelectorAll('#mobileBottomNav [data-mobile-nav]')) {
    btn.addEventListener('click', () => {
      const target = btn.dataset.mobileNav;
      if (target === 'connect') {
        openConnectHub(null, 'list');
        return;
      }
      setMobileView(target);
    });
  }
  $('btnChatMoreMobile').addEventListener('click', () => {
    const bar = $('chatMoreBar');
    bar.hidden = !bar.hidden;
  });
  $('btnPinChatMobile').addEventListener('click', () => {
    $('chatMoreBar').hidden = true;
    $('btnPinChat').click();
  });
  $('btnSimIncomingMobile').addEventListener('click', () => {
    $('chatMoreBar').hidden = true;
    $('btnSimIncoming').click();
  });
  $('btnOpenSearchMobile').addEventListener('click', () => {
    $('chatMoreBar').hidden = true;
    state.palette.open();
  });
  $('btnOpenContactsMobile').addEventListener('click', () => {
    $('chatMoreBar').hidden = true;
    renderContactsModal();
    $('contactsModal').showModal();
  });

  // Центр подключений MAX и других сервисов
  $('btnOpenConnectHub').addEventListener('click', () => openConnectHub('max', 'list'));
  $('btnOpenConnectHubFromInspector').addEventListener('click', () => openConnectHub('max', 'list'));
  $('btnHeaderConnect').addEventListener('click', () => {
    const chat = state.chats.find((c) => c.chatId === state.activeChatId);
    const net = chat && SERVICE_GUIDES.some((g) => g.id === chat.network) ? chat.network : 'max';
    openConnectHub(net, 'setup');
  });
  $('btnCloseConnectHub').addEventListener('click', () => $('connectHubModal').close());

  for (const btn of document.querySelectorAll('#hubMobileTabs [data-hub-step]')) {
    btn.addEventListener('click', () => setHubMobileStep(btn.dataset.hubStep));
  }
  $('hubServiceSearch').addEventListener('input', (e) => {
    state.hubSearch = e.target.value;
    renderConnectHub();
  });
  $('hubFormKind').addEventListener('change', () => {
    const guide = getServiceGuide(state.hubSelectedService);
    const live = findLiveBridgeStatus(guide.id);
    applyHubFormFieldLabels(guide, live);
  });
  $('btnHubToggleTokenVis').addEventListener('click', () => {
    const inp = $('hubFormToken');
    inp.type = inp.type === 'password' ? 'text' : 'password';
  });
  $('btnCopyAgentCmd').addEventListener('click', () => {
    copyTextSafe($('hubAgentCmdCode').textContent, 'Команда запуска ПК-агента скопирована');
  });
  $('btnCopyHubWebhook').addEventListener('click', () => {
    copyTextSafe($('hubWebhookUrl').textContent, 'Webhook URL скопирован');
  });
  $('btnConnectRemoteAgent').addEventListener('click', async () => {
    const url = $('hubRemoteAgentInput').value.trim();
    const res = await state.client.setRemoteAgentUrl(url);
    if (res.ok) {
      toast(`🟢 Подключено к ПК-агенту (${res.data.base})!`);
      await refreshAll({ keepScroll: true });
      renderConnectHub();
    } else {
      toast(res.error?.message || 'Не удалось подключиться к ПК-агенту');
    }
  });
  $('btnDisconnectRemoteAgent').addEventListener('click', async () => {
    await state.client.clearRemoteAgentUrl();
    $('hubRemoteAgentInput').value = '';
    toast('Отключено от удалённого ПК-агента (автономный режим)');
    await refreshAll({ keepScroll: true });
    renderConnectHub();
  });
  $('btnHubBindVpn').addEventListener('click', () => {
    const spec = findNetworkSpec(state.hubSelectedService);
    if (spec) openProxyModal(spec);
  });
  $('btnHubTestBridge').addEventListener('click', async () => {
    const box = $('hubTestResult');
    box.hidden = false;
    box.textContent = '⏳ Проверяю соединение и ищу доступные чаты…';
    const guide = getServiceGuide(state.hubSelectedService);
    const res = await state.client.testLiveBridge({
      network: guide.id,
      kind: $('hubFormKind').value,
      endpoint: $('hubFormEndpoint').value.trim() || null,
      targetId: $('hubFormTarget').value.trim() || null,
      secretToken: $('hubFormToken').value.trim() || null,
    });
    if (res.ok) {
      box.textContent = `✅ ${res.data.message}${res.data.rttMs != null ? ` (${res.data.rttMs} мс)` : ''}`;
      const chats = res.data.suggestedChats || [];
      const wrap = $('hubSuggestedWrap');
      const chips = $('hubSuggestedChips');
      chips.replaceChildren();
      if (chats.length > 0) {
        wrap.hidden = false;
        for (const ch of chats) {
          const b = document.createElement('button');
          b.type = 'button';
          b.className = 'hub-suggested-chip';
          b.textContent = ch.label;
          b.addEventListener('click', () => {
            $('hubFormTarget').value = ch.id;
            toast(`Подставлен ID: ${ch.id}`);
          });
          chips.appendChild(b);
        }
      } else {
        wrap.hidden = true;
      }
    } else {
      box.textContent = `⚠️ ${res.error?.message || 'Не удалось проверить подключение'}`;
      $('hubSuggestedWrap').hidden = true;
    }
  });
  $('hubConnectForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const guide = getServiceGuide(state.hubSelectedService);
    const res = await state.client.configureLiveBridge({
      network: guide.id,
      kind: $('hubFormKind').value,
      endpoint: $('hubFormEndpoint').value.trim() || null,
      targetId: $('hubFormTarget').value.trim() || null,
      secretToken: $('hubFormToken').value.trim() || null,
      enabled: true,
      enablePolling: !$('hubPollingWrap').hidden && $('hubFormPolling').checked,
    });
    if (!res.ok) {
      toast(res.error?.message || 'Ошибка подключения сервиса');
      return;
    }
    // Если чата этой сети ещё нет — сразу создаём его и открываем!
    let targetChat = state.chats.find((c) => c.network === guide.id);
    if (!targetChat) {
      const slug = `${guide.id}-live-${Date.now().toString(36)}`;
      await state.client.call('transfer.receive', {
        sourceChannel: 'system',
        network: guide.id,
        chatId: slug,
        chatTitle: `${guide.name} · Подключённый чат`,
        senderName: 'RatMes',
        text: `Сервис **${guide.name}** подключён (${$('hubFormKind').value.toUpperCase()}). Токен защищён в \`SecretVault\`, все сообщения сохраняются в \`RatMes-Vault/\`.`,
      });
      await refreshAll({ keepScroll: true });
      targetChat = state.chats.find((c) => c.chatId === slug);
    } else {
      await refreshAll({ keepScroll: true });
    }
    $('connectHubModal').close();
    toast(`✅ ${guide.name} подключён! ${res.data?.note || 'Токен сохранён в SecretVault.'}`);
    if (targetChat) await selectChat(targetChat.chatId);
  });
  $('btnHubQuickSandbox').addEventListener('click', async () => {
    const guide = getServiceGuide(state.hubSelectedService);
    let existing = state.chats.find((c) => c.network === guide.id);
    if (!existing) {
      const slug = `${guide.id}-${Date.now().toString(36)}`;
      await state.client.call('transfer.receive', {
        sourceChannel: 'system',
        network: guide.id,
        chatId: slug,
        chatTitle: `${guide.name} · Тестовый чат`,
        senderName: 'RatMes',
        text: `Открыт тестовый чат **${guide.name}** (без токена). В любой момент нажми «🔌 Подключить» вверху, чтобы привязать настоящий аккаунт/бота.`,
      });
      await refreshAll({ keepScroll: true });
      existing = state.chats.find((c) => c.chatId === slug);
    }
    $('connectHubModal').close();
    if (existing) await selectChat(existing.chatId);
    toast(`Открыт чат ${guide.name}`);
  });
  $('btnHubDisableBridge').addEventListener('click', async () => {
    const guide = getServiceGuide(state.hubSelectedService);
    await state.client.disableLiveBridge(guide.id);
    toast(`${guide.name}: переведён обратно в песочницу`);
    await refreshAll({ keepScroll: true });
    renderConnectHub();
  });

  // Новый чат
  $('btnNewChat').addEventListener('click', () => $('newChatModal').showModal());
  $('btnCancelNewChat').addEventListener('click', () => $('newChatModal').close());
  $('newChatForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const network = $('newChatNetwork').value;
    const title = $('newChatTitle').value.trim();
    if (!title) return;
    const slug = `${network}-${Date.now().toString(36)}`;
    await state.client.call('transfer.receive', {
      sourceChannel: 'system',
      network,
      chatId: slug,
      chatTitle: title,
      senderName: 'RatMes',
      text: `Создан новый чат «${title}» в сети ${network.toUpperCase()}.`,
    });
    $('newChatTitle').value = '';
    $('newChatModal').close();
    state.activeChatId = slug;
    await refreshAll();
    toast(`Чат «${title}» создан`);
  });

  // Пересылка сообщения между любыми сетями через pack.forward
  $('btnCancelForward').addEventListener('click', () => $('forwardModal').close());
  $('forwardForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!state.forwardTarget) return;
    const [toChatId, toNetwork] = $('forwardTargetChat').value.split('::');
    const hideAuthor = $('chkForwardHideAuthor').checked;
    const fwd = await state.client.call('pack.forward', {
      fromChatId: state.forwardTarget.chatId,
      msgIds: [state.forwardTarget.msgId],
      toChatId,
      toNetwork,
      hideAuthor,
    });
    $('forwardModal').close();
    if (!fwd.ok || !fwd.data.envelopes?.length) {
      toast(fwd.error?.message || 'Ошибка пересылки');
      return;
    }
    const envId = fwd.data.envelopes[0].handleId;
    await state.client.pipeline([
      { tool: 'pack.validate', args: { handleId: envId, targetNetwork: toNetwork } },
      { tool: 'vault.append', args: { handleId: envId } },
      { tool: 'transfer.enqueue', args: { handleId: envId } },
      { tool: 'transfer.dispatch', args: { transferId: '$transferId' }, continueOnError: true },
    ]);
    toast(`Сообщение переслано в ${toNetwork.toUpperCase()}`);
    await selectChat(toChatId);
  });

  // VPN модалка
  $('btnCancelProxy').addEventListener('click', () => $('proxyModal').close());
  $('proxyForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const network = $('proxyNetworkInput').value;
    const primaryRoute = $('proxyPrimaryInput').value.trim();
    const backupRoute = $('proxyBackupInput').value.trim() || null;
    const r = await state.client.call('route.bindProxy', { network, primaryRoute, backupRoute });
    $('proxyModal').close();
    if (r.ok) {
      toast(`Маршрут для ${network} сохранён: ${primaryRoute}`);
      await refreshAll({ keepScroll: true });
      if ($('connectHubModal')?.open) renderConnectHub();
    }
  });

  // Живой внешний мост (SecretVault)
  $('btnCancelLiveBridge').addEventListener('click', () => $('liveBridgeModal').close());
  $('btnDisableLiveBridge').addEventListener('click', async () => {
    const net = $('liveBridgeNetwork').value;
    await state.client.disableLiveBridge(net);
    $('liveBridgeModal').close();
    toast(`${net}: переведён обратно в безопасную песочницу`);
    await refreshAll({ keepScroll: true });
  });
  $('liveBridgeForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const r = await state.client.configureLiveBridge({
      network: $('liveBridgeNetwork').value,
      kind: $('liveBridgeKind').value,
      endpoint: $('liveBridgeEndpoint').value.trim() || null,
      targetId: $('liveBridgeTargetId').value.trim() || null,
      secretToken: $('liveBridgeToken').value.trim() || null,
      enabled: true,
    });
    $('liveBridgeModal').close();
    toast(r.ok ? `Живой мост ${$('liveBridgeNetwork').value} активирован (токен в SecretVault)` : (r.error?.message || 'Ошибка'));
    await refreshAll({ keepScroll: true });
  });

  // P2P LAN Mesh подключение
  $('btnRefreshP2p').addEventListener('click', () => refreshAll({ keepScroll: true }));
  $('btnConnectP2p').addEventListener('click', async () => {
    const ep = $('p2pEndpointInput').value.trim();
    if (!ep) return;
    const r = await state.client.connectP2pPeer(ep);
    toast(r.ok ? `Связались с узлом ${r.data.peer.label} (${r.data.peer.rttMs} мс)` : (r.error?.message || 'Узел недоступен'));
    $('p2pEndpointInput').value = '';
    await refreshAll({ keepScroll: true });
  });

  // Chrono & Outbox Pump
  for (const btn of $('phaseButtons').querySelectorAll('button')) {
    btn.addEventListener('click', async () => {
      const r = await state.client.call('chrono.setPhase', { phase: btn.dataset.phase });
      if (r.ok) toast(`Фаза движка: ${r.data.phase}`);
      await refreshAll({ keepScroll: true });
    });
  }
  $('btnRunHousekeeping').addEventListener('click', async () => {
    const r = await state.client.call('chrono.runHousekeeping');
    if (r.ok) toast(`DAG-уборка завершена за ${r.data.costMs} мс (${r.data.stepsRun.length} шагов)`);
    await refreshAll({ keepScroll: true });
  });
  $('btnWarmUpFuture').addEventListener('click', async () => {
    const r = await state.client.call('chrono.warmUp');
    if (r.ok) {
      toast(r.data.skippedByBackpressure
        ? `Прогрев остановлен Backpressure (${r.data.code}: ${r.data.reasons.join(', ')})`
        : `Прогрето чатов «Будущего»: ${r.data.warmed.length}`);
    }
    await refreshAll({ keepScroll: true });
  });
  $('btnPumpOutbox').addEventListener('click', async () => {
    const r = await state.client.call('transfer.pumpOutbox', { maxPerTick: 10, forceNow: true });
    if (r.ok) toast(`Насос Outbox: обработано ${r.data.processedCount}, осталось ${r.data.remaining.total}`);
    await refreshAll({ keepScroll: true });
  });
  $('chkLowBattery').addEventListener('change', async (e) => {
    await state.client.call('chrono.setBackpressure', { batteryPct: e.target.checked ? 15 : 100 });
    await refreshAll({ keepScroll: true });
  });
  $('chkSaveData').addEventListener('change', async (e) => {
    await state.client.call('chrono.setBackpressure', { saveData: e.target.checked });
    await refreshAll({ keepScroll: true });
  });
  $('btnEvictTick').addEventListener('click', async () => {
    const r = await state.client.call('cache.evictTick', { budgetMs: 2 });
    if (r.ok) toast(`S3-FIFO тик: ${r.data.elapsedMs} мс, вытеснено ${r.data.evictedCount}`);
    await refreshAll({ keepScroll: true });
  });

  // Vault: healTail, rebuildIndex, Export/Import Bundle
  $('btnHealTail').addEventListener('click', async () => {
    const r = await state.client.call('vault.healTail');
    if (r.ok) toast(`Проверено файлов: ${r.data.filesChecked}, вылечено хвостов: ${r.data.tailsHealed}`);
    await refreshAll({ keepScroll: true });
  });
  $('btnRebuildIndex').addEventListener('click', async () => {
    const r = await state.client.call('vault.rebuildIndex');
    if (r.ok) toast(`Индекс и BM25 пересобраны за ${r.data.durationMs} мс (${r.data.messagesIndexed} сообщ.)`);
    await refreshAll({ keepScroll: true });
  });
  $('btnExportBundle').addEventListener('click', async () => {
    const [bRes, expRes] = await Promise.all([
      state.client.call('pack.bundle', { scope: 'vault' }),
      state.client.call('vault.exportReadable'),
    ]);
    if (!expRes.ok) return;
    const blob = new Blob([JSON.stringify({
      schema: 'ratmes-bundle/1',
      exportedAt: new Date().toISOString(),
      bundleMeta: bRes.ok ? bRes.data : null,
      files: expRes.data.files,
    }, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ratmes-vault-export-${Date.now()}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    toast(`Архив RatMes-Vault/ экспортирован (сжатие Deflate x${bRes.data?.ratio || 1})`);
  });
  $('importBundleInput').addEventListener('change', async (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    try {
      const parsed = JSON.parse(await f.text());
      const res = await state.client.call('vault.importBundle', { files: parsed.files || parsed });
      if (res.ok) toast(`Импорт: +${res.data.importedMessages} новых, пропущено дублей: ${res.data.deduplicated}`);
      await refreshAll({ keepScroll: true });
    } catch {
      toast('Некорректный JSON-архив RatMes');
    }
    e.target.value = '';
  });

  // Guard & Симуляторы
  $('btnAuditCode').addEventListener('click', async () => {
    const res = await state.client.runStaticAudit();
    const box = $('guardAuditResult');
    box.hidden = false;
    if (res.ok && res.data) {
      box.textContent = res.data.clean
        ? `✅ TransferGuard RM-107: чисто!\nПроверено файлов: ${res.data.filesScanned}\nНарушений обхода инструментов: 0`
        : `❌ Обнаружены нарушения RM-107: ${res.data.violationsCount}\n${res.data.violations.map((v) => `${v.file}:${v.line} — ${v.reason}`).join('\n')}`;
    }
  });
  $('btnInspectTransfer').addEventListener('click', () => {
    const target = state.selectedTransferId || state.transfers[state.transfers.length - 1]?.transferId;
    if (target) inspectTransferById(target);
    else toast('Сначала отправь сообщение или файл');
  });
  for (const btn of document.querySelectorAll('[data-sim]')) {
    btn.addEventListener('click', async () => {
      const scenario = btn.dataset.sim;
      const r = await state.client.call('diag.simulateOutage', { scenario });
      const box = $('simResultBox');
      box.hidden = false;
      if (r.ok) {
        box.textContent = `${r.data.passed ? '✅ ПРОЙДЕНО' : '❌ СБОЙ'} · Сценарий: ${scenario}\nПотеряно сообщений: ${r.data.messagesLost}\nДетали: ${JSON.stringify(r.data.detail)}`;
      }
    });
  }

  // Интерактивная консоль RatMes.tools.*
  $('consoleGroupSelect').addEventListener('change', updateConsoleMethods);
  $('consoleMethodSelect').addEventListener('change', prefillConsoleArgs);
  $('btnRunConsoleTool').addEventListener('click', async () => {
    const tool = `${$('consoleGroupSelect').value}.${$('consoleMethodSelect').value}`;
    try {
      const args = JSON.parse($('consoleArgsInput').value || '{}');
      const res = await state.client.call(tool, args);
      $('consoleOutput').textContent = JSON.stringify(res, null, 2);
      await refreshAll({ keepScroll: true });
    } catch (err) {
      $('consoleOutput').textContent = `Ошибка JSON аргументов: ${err.message}`;
    }
  });
  $('btnConsolePresetPipeline').addEventListener('click', () => {
    const chatId = state.activeChatId || 'ratmes-main';
    const net = state.chats.find((c) => c.chatId === chatId)?.network || 'ratmes';
    $('consoleArgsInput').value = JSON.stringify([
      { tool: 'pack.text', args: { chatId, network: net, text: 'Сообщение прямо из **Консоли инструментов** `RatMes.tools.pipeline`!' } },
      { tool: 'pack.validate', args: { handleId: '$envelopeId', targetNetwork: net } },
      { tool: 'vault.append', args: { handleId: '$envelopeId' } },
      { tool: 'transfer.enqueue', args: { handleId: '$envelopeId' } },
      { tool: 'transfer.dispatch', args: { transferId: '$transferId' }, continueOnError: true },
    ], null, 2);
  });
  $('btnRunConsolePipeline').addEventListener('click', async () => {
    try {
      const ops = JSON.parse($('consoleArgsInput').value || '[]');
      if (!Array.isArray(ops)) throw new Error('Для pipeline нужен JSON-массив шагов [{ tool, args }]');
      const res = await state.client.pipeline(ops);
      $('consoleOutput').textContent = JSON.stringify(res, null, 2);
      await refreshAll({ keepScroll: true });
    } catch (err) {
      $('consoleOutput').textContent = `Ошибка pipeline: ${err.message}`;
    }
  });

  // Облака Games (Supabase + манифест бэкапа для Drive/Dropbox)
  const triggerCloudSync = async () => {
    const res = await state.client.syncSupabaseCloud({
      roomId: state.activeChatId || 'games-lobby',
      displayName: state.displayName,
      country: state.matrix?.activeCountry?.code || 'RU',
    });
    if (res?.ok) {
      toast(`☁ Supabase sync: получено ${res.data?.ingested || 0}, всего в сети ${res.data?.status?.supabase?.onlinePeersCount || 1}`);
    } else {
      toast(`☁ Локальный резерв RatMes-Vault/ активен (${res?.error || 'офлайн'})`);
    }
    await refreshAll({ keepScroll: true });
  };
  $('btnCloudSync').addEventListener('click', () => {
    switchInspectorTab('cloud');
    if (window.innerWidth <= 900) setMobileView('inspector');
    else $('inspectorPanel').classList.add('open');
    triggerCloudSync();
  });
  $('btnManualCloudSync').addEventListener('click', triggerCloudSync);
  $('btnSaveCloudName').addEventListener('click', async () => {
    const clean = $('cloudDisplayNameInput').value.trim().slice(0, 48);
    if (!clean) return;
    state.displayName = clean;
    try { localStorage.setItem('ratmes-games-nick-v1', clean); } catch { /* ignore */ }
    await state.client.call('cloud.setDisplayName', { displayName: clean });
    toast(`Ник в Games «Общение» обновлён: ${clean}`);
    triggerCloudSync();
  });
  $('btnExportCloudManifest').addEventListener('click', async () => {
    const res = await state.client.call('cloud.exportManifest');
    if (!res.ok) return;
    const blob = new Blob([JSON.stringify(res.data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ratmes-cloud-manifest-${Date.now()}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    toast('Манифест резерва RatMes-Vault сохранён (готов для Drive / Dropbox)');
  });
}

// ---------------- Запуск приложения ----------------
async function boot() {
  const params = new URLSearchParams(window.location.search);
  if (params.get('embed') === 'games') {
    document.body.classList.add('embed-games');
  }
  try {
    const savedNick = localStorage.getItem('ratmes-games-nick-v1');
    if (savedNick) state.displayName = savedNick;
  } catch { /* ignore */ }

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  }

  state.client = await createBridgeClient();
  await state.client.call('cloud.setDisplayName', { displayName: state.displayName });

  state.voiceRecorder = createVoiceRecorder({
    canvasEl: $('voiceRecCanvas'),
    timerEl: $('voiceRecTimer'),
  });
  state.sparkline = new TelemetrySparkline($('telemetryCanvas'));
  state.palette = createCommandPalette({
    dialogEl: $('paletteModal'),
    inputEl: $('paletteInput'),
    resultsEl: $('paletteResults'),
    onSearchQuery: (q) => state.client.call('search.query', { q, limit: 20 }),
    getQuickCommands: () => [
      { icon: '🔌', label: 'Подключить MAX, Telegram, VK, Discord, WhatsApp…', hint: 'Мастер', run: () => openConnectHub('max', 'list') },
      { icon: '☁️', label: 'Синхронизировать облако Supabase (games-cloud-save)', hint: 'tools.cloud', run: () => $('btnManualCloudSync').click() },
      { icon: '🔎', label: 'Найти все голосовые сообщения', hint: 'has:voice', run: () => state.palette.open('has:voice') },
      { icon: '📎', label: 'Найти все сообщения с файлами', hint: 'has:file', run: () => state.palette.open('has:file') },
      { icon: '📌', label: 'Найти закреплённые сообщения', hint: 'pinned:true', run: () => state.palette.open('pinned:true') },
      { icon: '🛡️', label: 'Запустить аудит кода RM-107', hint: 'TransferGuard', run: () => { switchInspectorTab('guard'); $('btnAuditCode').click(); } },
      { icon: '🧹', label: 'Запустить DAG-уборку Chrono', hint: 'chrono.runHousekeeping', run: () => $('btnRunHousekeeping').click() },
      { icon: '🎙️', label: 'Отправить тестовую голосовую WAV-заметку', hint: 'pack.voice', run: () => sendVoiceNote(null) },
      { icon: '📦', label: 'Экспортировать весь RatMes-Vault/', hint: 'pack.bundle', run: () => $('btnExportBundle').click() },
      { icon: '💬', label: 'Создать новый чат в любой сети', hint: 'New Chat', run: () => $('newChatModal').showModal() },
    ],
    onSelectHit: (hit) => selectChat(hit.chatId, hit.msgId),
  });

  bindEvents();
  await initToolConsole();

  state.client.onEvent((evt) => {
    if (evt && ['transfer.received', 'tab.sync', 'route.countryChanged', 'workspace.reaction', 'workspace.pin', 'workspace.edited', 'workspace.deleted', 'p2p.peerConnected', 'bridges.updated', 'cloud.messages', 'cloud.sync'].includes(evt.event)) {
      refreshAll({ keepScroll: true });
    }
  });

  await refreshAll();
  setMobileView('chats');

  // Приём команд из родительского портала Games (например, открыть Мастер подключений MAX/сервисов)
  window.addEventListener('message', (ev) => {
    const msg = ev.data;
    if (!msg || typeof msg !== 'object') return;
    if (msg.type === 'ratmes:openConnectHub') {
      openConnectHub(msg.service || 'max', msg.service ? 'setup' : 'list');
    } else if (msg.type === 'ratmes:selectRoom' && msg.room && state.chats.some((c) => c.chatId === msg.room)) {
      selectChat(msg.room);
    }
  });

  // Автоопределение экранной клавиатуры телефона (прячет нижнюю навигацию при вводе текста)
  if (window.visualViewport) {
    const checkKeyboard = () => {
      const ratio = window.visualViewport.height / Math.max(window.innerHeight, 1);
      document.body.classList.toggle('keyboard-open', window.innerWidth <= 900 && ratio < 0.74);
    };
    window.visualViewport.addEventListener('resize', checkKeyboard);
  }

  const requestedRoom = params.get('room');
  if (requestedRoom && state.chats.some((c) => c.chatId === requestedRoom)) {
    await selectChat(requestedRoom);
  } else if (params.get('embed') === 'games' && state.chats.some((c) => c.chatId === 'games-lobby')) {
    await selectChat('games-lobby');
  }

  const requestedConnect = params.get('connect');
  if (requestedConnect) {
    openConnectHub(requestedConnect === '1' ? 'max' : requestedConnect, requestedConnect === '1' ? 'list' : 'setup');
  }

  state.client.startCloudAutoSync(() => ({
    roomId: state.activeChatId || 'games-lobby',
    displayName: state.displayName,
    country: state.matrix?.activeCountry?.code || 'RU',
  }));
}

boot();
