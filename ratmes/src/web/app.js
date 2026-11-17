// RatMes Web/PWA Client — живое общение с людьми, личные 1-на-1 чаты,
// комнаты по ссылке и удобные подключения со ссылками.
// 0% симуляции · 0 innerHTML · 0 прямых сетевых вызовов (TransferGuard RM-107).

import { createBridgeClient } from './bridge-client.mjs';
import { createAudioCue } from './audio.mjs';
import { renderMarkdownToFragment } from './markdown-render.mjs';
import { createVoiceRecorder } from './voice-recorder.mjs';
import { createCommandPalette } from './command-palette.mjs';
import { getServiceGuide, listServiceGuides, sanitizeBridgeInput } from '../engine/service-guides.mjs';
import { applyBrandBadge, createBrandSvg, getBrandTheme } from './brand-icons.mjs';

const QUICK_EMOJIS = ['👍', '❤️', '🔥', '😂', '👏'];
const NETWORK_LABELS = {
  ratmes: 'RatMes',
  vk: 'VK',
  max: 'MAX',
  telegram: 'Telegram',
  whatsapp: 'WhatsApp',
  discord: 'Discord',
  viber: 'Viber',
  signal: 'Signal',
  matrix: 'Matrix',
  wechat: 'WeChat',
  line: 'LINE',
  kakaotalk: 'KakaoTalk',
  zalo: 'Zalo',
};

const el = (id) => document.getElementById(id);
function clearNode(node) {
  if (!node) return;
  while (node.firstChild) node.removeChild(node.firstChild);
}
function h(tag, attrs = {}, ...children) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs || {})) {
    if (v === null || v === undefined || v === false) continue;
    if (k === 'className') node.className = v;
    else if (k === 'text') node.textContent = v;
    else if (k === 'style' && typeof v === 'object') Object.assign(node.style, v);
    else if (k.startsWith('on') && typeof v === 'function') node.addEventListener(k.slice(2).toLowerCase(), v);
    else if (k === 'dataset' && typeof v === 'object') {
      for (const [dk, dv] of Object.entries(v)) node.dataset[dk] = dv;
    } else node.setAttribute(k, String(v));
  }
  for (const ch of children.flat()) {
    if (ch === null || ch === undefined || ch === false) continue;
    node.appendChild(typeof ch === 'string' ? document.createTextNode(ch) : ch);
  }
  return node;
}

function fmtBytes(n) {
  if (!n) return '0 Б';
  if (n < 1024) return `${n} Б`;
  if (n < 1048576) return `${(n / 1024).toFixed(1)} КБ`;
  return `${(n / 1048576).toFixed(2)} МБ`;
}
function fmtTime(ts) {
  if (!ts) return '';
  const d = new Date(ts);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
}
function fmtRelativeTime(iso) {
  if (!iso) return 'недавно';
  const diffSec = Math.max(0, Math.floor((Date.now() - Date.parse(iso)) / 1000));
  if (Number.isNaN(diffSec) || diffSec < 90) return 'онлайн';
  if (diffSec < 3600) return `был(а) ${Math.floor(diffSec / 60)} мин назад`;
  if (diffSec < 86400) return `был(а) ${Math.floor(diffSec / 3600)} ч назад`;
  return `был(а) ${Math.floor(diffSec / 86400)} дн назад`;
}
function fmtDuration(ms) {
  const sec = Math.max(0, Math.round((ms || 0) / 1000));
  return `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}`;
}
function avatarInitials(name) {
  const clean = String(name || 'У').replace(/^[^\p{L}\p{N}]+/u, '').trim();
  const parts = clean.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return clean.slice(0, 2).toUpperCase() || 'У';
}
function avatarHue(str) {
  let hash = 0;
  const s = String(str || 'a');
  for (let i = 0; i < s.length; i += 1) hash = ((hash << 5) - hash + s.charCodeAt(i)) | 0;
  return Math.abs(hash) % 360;
}

const audio = createAudioCue();

const state = {
  client: null,
  activeChatId: null,
  activeChat: null,
  sidebarTab: 'chats',
  chatFilter: 'all',
  chats: [],
  countries: [],
  countryProfile: null,
  networks: [],
  liveBridges: [],
  p2pPeers: [],
  vaultFiles: [],
  transfers: [],
  cloudStatus: null,
  displayName: 'Участник',
  bio: '',
  messages: [],
  pinnedIds: [],
  reactionsMap: {},
  pendingAttachment: null,
  replyTo: null,
  editingMessage: null,
  forwardingMessage: null,
  searchQuery: '',
  peopleSearchQuery: '',
  linksSearchQuery: '',
  activeTab: 'cloud',
  inspectorOpen: false,
  hubSelectedNetwork: 'max',
  hubFilter: 'all',
  hubSearchQuery: '',
  hubSelectedPreset: null,
  hubMobileStep: 'list',
  refreshTimer: null,
  draftSaveTimer: null,
};

function showToast(title, body = '', kind = 'info') {
  const host = el('toastHost');
  if (!host) return;
  const sig = `${kind}:${title}:${body}`;
  for (const prev of [...host.children]) {
    if (prev.dataset?.toastSig === sig) prev.remove();
  }
  while (host.children.length >= 2) {
    host.firstChild?.remove();
  }
  const t = h('div', { className: `toast ${kind}`, dataset: { toastSig: sig } },
    h('strong', { text: title }),
    body ? h('span', { text: String(body).slice(0, 140) }) : null,
  );
  host.appendChild(t);
  setTimeout(() => t.remove(), 3600);
}

async function shareOrCopyUrl(url, title, text) {
  if (!url) return;
  try {
    if (typeof navigator !== 'undefined' && typeof navigator.share === 'function' && window.innerWidth <= 900) {
      await navigator.share({ title, text, url });
      showToast('Ссылка отправлена', title, 'good');
      return;
    }
  } catch (err) {
    if (err && err.name === 'AbortError') return;
  }
  try {
    await navigator.clipboard.writeText(url);
    showToast('Ссылка скопирована!', 'Отправь её другу — чат откроется сразу', 'good');
  } catch {
    showToast('Твоя ссылка готова', url, 'info');
  }
}

function getLiveBridgeForNetwork(networkId) {
  return state.liveBridges.find((b) => b.network === networkId && b.enabled) || null;
}

function renderProfileBar() {
  const av = el('myProfileAvatar');
  const nm = el('myProfileName');
  const bioEl = el('myProfileBio');
  const slotBadge = el('myProfileSlotBadge');
  const accCtx = state.client?.getAccountContext?.();
  if (av) {
    av.textContent = avatarInitials(state.displayName);
    av.style.background = `hsl(${avatarHue(state.displayName)} 62% 42%)`;
  }
  if (nm) nm.textContent = state.displayName;
  if (slotBadge) {
    if (accCtx?.isSecondary) {
      slotBadge.hidden = false;
      slotBadge.textContent = accCtx.label;
    } else {
      slotBadge.hidden = true;
    }
  }
  if (bioEl) {
    bioEl.textContent = state.bio || (state.displayName === 'Участник' ? 'Нажми, чтобы задать имя' : 'В сети · личная ссылка готова');
  }
  if (state.client?.buildSecondProfileUrl) {
    const secondUrl = state.client.buildSecondProfileUrl(state.displayName);
    const pBtn = el('btnOpenSecondTabPeople');
    const mBtn = el('btnOpenSecondTabModal');
    if (pBtn) pBtn.href = secondUrl;
    if (mBtn) mBtn.href = secondUrl;
  }
}

function setSidebarTab(tabName) {
  state.sidebarTab = tabName;
  for (const btn of document.querySelectorAll('#sidebarMainTabs .smtab')) {
    const active = btn.dataset.sidebarTab === tabName;
    btn.classList.toggle('is-active', active);
    btn.setAttribute('aria-selected', String(active));
  }
  const panes = {
    chats: el('sidebarPaneChats'),
    people: el('sidebarPanePeople'),
    connect: el('sidebarPaneConnect'),
  };
  for (const [k, pane] of Object.entries(panes)) {
    if (!pane) continue;
    const active = k === tabName;
    pane.hidden = !active;
    pane.classList.toggle('is-active', active);
  }
  syncMobileNavActive(tabName);
  if (tabName === 'people') renderPeopleDirectory();
  if (tabName === 'connect') renderSidebarLinksHub();
}

function syncMobileNavActive(activeKey) {
  const nav = el('mobileBottomNav');
  if (!nav) return;
  for (const btn of nav.querySelectorAll('.mnav-btn')) {
    btn.classList.toggle('is-active', btn.dataset.mobileNav === activeKey);
  }
}

function setMobileChatOpen(open) {
  const flag = Boolean(open);
  el('appShell')?.classList.toggle('mobile-chat-open', flag);
  if (typeof document !== 'undefined' && document.body?.classList) {
    document.body.classList.toggle('mobile-chat-open', flag);
  }
}

function fmtDateLabel(ts) {
  if (!ts) return '';
  const d = new Date(ts);
  if (Number.isNaN(d.getTime())) return '';
  const now = new Date();
  const sameDay = (a, b) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
  if (sameDay(d, now)) return 'Сегодня';
  const yesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
  if (sameDay(d, yesterday)) return 'Вчера';
  return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
}

function peerAccentColor(seed) {
  return `hsl(${avatarHue(seed || 'peer')} 72% 66%)`;
}

function setInspectorOpen(open) {
  state.inspectorOpen = Boolean(open);
  const panel = el('inspectorPanel');
  const shell = el('appShell');
  if (panel) {
    panel.hidden = !state.inspectorOpen;
    panel.classList.toggle('open', state.inspectorOpen);
  }
  if (shell) {
    shell.classList.toggle('inspector-visible', state.inspectorOpen);
  }
  if (state.inspectorOpen) setMobileChatOpen(false);
}

// ---------------- Загрузка и обновление состояния ----------------
async function refreshAll({ reloadMessages = true } = {}) {
  const [
    matrixRes,
    chatsRes,
    vaultRes,
    transfersRes,
    bridgesRes,
    cloudRes,
  ] = await Promise.all([
    state.client.call('route.getMatrix', {}),
    state.client.call('vault.listChats', {}),
    state.client.call('vault.listPlainFiles', {}),
    state.client.call('transfer.inspect', {}),
    state.client.listLiveBridges(),
    state.client.call('cloud.status', {}),
  ]);

  if (matrixRes.ok) {
    state.countries = matrixRes.data.countries || [];
    state.countryProfile = matrixRes.data.profile || null;
    state.networks = matrixRes.data.networks || [];
    renderCountrySelector();
  }
  if (bridgesRes?.ok) {
    state.liveBridges = bridgesRes.data.bridges || [];
  }
  if (cloudRes?.ok) {
    state.cloudStatus = cloudRes.data;
    renderCloudTab();
  }
  if (chatsRes.ok) {
    state.chats = chatsRes.data.chats;
    if (!state.activeChatId && state.chats.length > 0) {
      const lobby = state.chats.find((c) => c.chatId === 'games-lobby');
      state.activeChatId = lobby ? lobby.chatId : state.chats[0].chatId;
    }
    state.activeChat = state.chats.find((c) => c.chatId === state.activeChatId) || state.chats[0] || null;
    if (state.activeChat) state.activeChatId = state.activeChat.chatId;
  }
  if (vaultRes.ok) {
    state.vaultFiles = vaultRes.data.files;
    renderVaultTab(vaultRes.data);
  }
  if (transfersRes.ok) {
    state.transfers = transfersRes.data.activeTransfers || [];
    renderTransfers();
  }

  renderProfileBar();
  renderChatList();
  renderPeopleDirectory();
  if (el('dmActionModal')?.open) renderDmModalPeople();
  renderSidebarLinksHub();
  renderNetworksTab();
  renderChatHeader();
  if (el('connectHubModal')?.open) renderConnectHub();
  if (reloadMessages && state.activeChatId) {
    await loadActiveChatMessages();
  }
}

function scheduleRefresh() {
  if (state.refreshTimer) clearTimeout(state.refreshTimer);
  state.refreshTimer = setTimeout(() => {
    refreshAll({ reloadMessages: true }).catch(() => {});
  }, 150);
}

// ---------------- Список реальных чатов (с выделенной секцией «Личные чаты») ----------------
function buildChatListItem(chat) {
  const isSelf = chat.chatId.startsWith('dm-self-');
  const isDm = chat.roomType === 'dm' || chat.chatId.startsWith('dm-');
  const isGroup = chat.roomType === 'group' || chat.chatId.startsWith('room-');
  const isCloud = state.client.isCloudRoom(chat.chatId);
  const liveBridge = chat.network !== 'ratmes' ? getLiveBridgeForNetwork(chat.network) : null;

  const av = h('span', { className: 'net-avatar' });
  if (isSelf) {
    av.textContent = '⭐';
    av.style.background = 'linear-gradient(135deg, #f59e0b, #d97706)';
    av.style.color = '#10141c';
  } else if (isDm) {
    av.textContent = avatarInitials(chat.title);
    av.style.background = `hsl(${avatarHue(chat.chatId)} 62% 42%)`;
    av.style.color = '#ffffff';
  } else if (isGroup) {
    av.textContent = avatarInitials(chat.title);
    av.style.background = 'linear-gradient(135deg, #2563eb, #7c3aed)';
    av.style.color = '#ffffff';
  } else {
    applyBrandBadge(av, chat.network, 20);
  }

  const preview = chat.draftText
    ? `Черновик: ${chat.draftText}`
    : (chat.lastText || (isSelf
      ? 'Личные заметки'
      : isDm
        ? 'Личный чат'
        : isCloud
          ? 'Напиши первым…'
          : 'Настроить мост'));

  return h('button', {
    type: 'button',
    className: `chat-item${chat.chatId === state.activeChatId ? ' active' : ''}`,
    onClick: () => selectChat(chat.chatId),
  },
    av,
    h('div', { className: 'chat-item-body' },
      h('div', { className: 'chat-item-top' },
        h('span', { className: 'chat-item-title', text: `${chat.pinnedChat ? '📌 ' : ''}${chat.title}` }),
        h('span', { className: 'chat-item-time', text: fmtTime(chat.lastTs) }),
      ),
      h('div', { className: 'chat-item-preview-row' },
        h('span', {
          className: `chat-item-preview${chat.draftText ? ' draft' : ''}`,
          text: preview,
        }),
        chat.unreadCount > 0 ? h('span', { className: 'unread-badge', text: String(chat.unreadCount) }) : null,
      ),
    ),
  );
}

function renderChatList() {
  const list = el('chatList');
  if (!list) return;
  clearNode(list);

  const q = state.searchQuery.trim().toLowerCase();
  const visible = state.chats.filter((c) => {
    if (c.archived) return false;
    const isDm = c.roomType === 'dm' || c.chatId.startsWith('dm-');
    const isBridge = c.network !== 'ratmes';
    if (state.chatFilter === 'dm' && !isDm) return false;
    if (state.chatFilter === 'rooms' && (isDm || isBridge)) return false;
    if (state.chatFilter === 'bridges' && !isBridge) return false;
    if (q && !(`${c.title} ${c.lastText || ''} ${c.network}`.toLowerCase().includes(q))) return false;
    return true;
  });

  const unreadTotal = state.chats.reduce((acc, c) => acc + (c.unreadCount || 0), 0);
  const chatBadge = el('badgeChatsCount');
  if (chatBadge) {
    chatBadge.textContent = String(unreadTotal);
    chatBadge.hidden = unreadTotal <= 0;
  }

  if (state.chatFilter === 'dm') {
    list.appendChild(h('div', { className: 'chat-section-head' },
      h('span', { text: `👤 Личные чаты (${visible.length})` }),
      h('button', { type: 'button', className: 'chat-section-cta', text: '+ Новый', onClick: () => openDmModal() }),
    ));
    if (visible.length === 0) {
      list.appendChild(h('div', { className: 'empty-hint-card' },
        h('strong', { text: 'Личных чатов пока нет' }),
        h('p', { className: 'muted-text', text: 'Выбери собеседника, открой личный чат по ссылке/ID друга или создай «⭐ Избранное» для себя.' }),
        h('div', { className: 'action-row' },
          h('button', { type: 'button', className: 'btn btn-sm btn-primary', text: '👤 Новый личный чат', onClick: () => openDmModal() }),
          h('button', { type: 'button', className: 'btn btn-sm btn-ghost', text: '⭐ Избранное', onClick: () => openSavedMessagesChat() }),
        ),
      ));
      return;
    }
    for (const chat of visible) list.appendChild(buildChatListItem(chat));
    return;
  }

  if (visible.length === 0) {
    const emptyMsg = state.chatFilter === 'bridges'
      ? 'Подключённых внешних мессенджеров пока нет — открой вкладку «🔌 Ссылки».'
      : 'Нет чатов по твоему запросу.';
    list.appendChild(h('div', { className: 'empty-hint-card' },
      h('p', { className: 'muted-text', text: emptyMsg }),
      state.chatFilter === 'bridges'
        ? h('button', { type: 'button', className: 'btn btn-sm btn-primary', text: '🔌 Открыть подключения', onClick: () => openConnectHub() })
        : null,
    ));
    return;
  }

  if (state.chatFilter === 'all' && !q) {
    const dmChats = visible.filter((c) => c.roomType === 'dm' || c.chatId.startsWith('dm-'));
    const roomChats = visible.filter((c) => !(c.roomType === 'dm' || c.chatId.startsWith('dm-')) && c.network === 'ratmes');
    const bridgeChats = visible.filter((c) => c.network !== 'ratmes');

    if (dmChats.length > 0) {
      list.appendChild(h('div', { className: 'chat-section-head' },
        h('span', { text: `Личные (${dmChats.length})` }),
        h('button', { type: 'button', className: 'chat-section-cta', text: '+ Новый', onClick: () => openDmModal() }),
      ));
      for (const chat of dmChats) list.appendChild(buildChatListItem(chat));
    }

    if (roomChats.length > 0) {
      list.appendChild(h('div', { className: 'chat-section-head' },
        h('span', { text: `Комнаты (${roomChats.length})` }),
        dmChats.length === 0
          ? h('button', { type: 'button', className: 'chat-section-cta', text: '👤 Личный чат', onClick: () => openDmModal() })
          : null,
      ));
      for (const chat of roomChats) list.appendChild(buildChatListItem(chat));
    }

    if (bridgeChats.length > 0) {
      list.appendChild(h('div', { className: 'chat-section-head' },
        h('span', { text: `🔌 Мессенджеры (${bridgeChats.length})` }),
      ));
      for (const chat of bridgeChats) list.appendChild(buildChatListItem(chat));
    }
    return;
  }

  for (const chat of visible) {
    list.appendChild(buildChatListItem(chat));
  }
}

// ---------------- Живой каталог людей (Supabase ratmes_presence) ----------------
function renderPeopleDirectory() {
  const list = el('peopleDirectoryList');
  const peers = state.cloudStatus?.supabase?.onlinePeers || [];
  const myPeerId = state.client?.getCloudPeerId?.() || '';
  const onlineCount = peers.filter((p) => p.isOnline).length;

  const badge = el('badgeOnlineCount');
  if (badge) badge.textContent = String(onlineCount);
  const mobileBadge = el('mobileOnlineCountBadge');
  if (mobileBadge) {
    mobileBadge.textContent = String(onlineCount);
    mobileBadge.hidden = onlineCount <= 0;
  }

  if (!list) return;
  clearNode(list);

  const q = state.peopleSearchQuery.trim().toLowerCase();
  const others = peers.filter((p) => {
    if (!p.peerId || p.peerId === myPeerId) return false;
    if (q && !(`${p.displayName} ${p.bio || ''} ${p.peerId}`.toLowerCase().includes(q))) return false;
    return true;
  });

  // Карточка «Это ты»
  list.appendChild(h('div', { className: 'person-card is-self' },
    h('span', {
      className: 'person-avatar',
      text: avatarInitials(state.displayName),
      style: { background: `hsl(${avatarHue(state.displayName)} 62% 42%)` },
    }),
    h('div', { className: 'person-info' },
      h('strong', { text: `${state.displayName} (ты)` }),
      h('span', { className: 'person-sub', text: state.bio || 'Виден(а) другим людям онлайн' }),
    ),
    h('button', {
      type: 'button',
      className: 'btn btn-sm btn-ghost',
      text: '✏️',
      title: 'Изменить имя и статус',
      onClick: () => openProfileModal(),
    }),
  ));

  if (others.length === 0) {
    const secondUrl = state.client?.buildSecondProfileUrl?.(state.displayName) || '?acc=2';
    list.appendChild(h('div', { className: 'empty-hint-card' },
      h('strong', { text: q ? 'Никого не найдено' : 'Пригласи друга или проверь прямо сейчас!' }),
      h('p', {
        className: 'muted-text',
        text: q
          ? 'Попробуй другое имя или отправь человеку свою личную ссылку.'
          : 'Отправь другу свою ссылку — или нажми кнопку ниже, чтобы открыть 2-й реальный аккаунт в соседней вкладке этого браузера и проверить живой чат 1-на-1.',
      }),
      h('div', { className: 'action-row' },
        h('button', {
          type: 'button',
          className: 'btn btn-sm btn-primary',
          text: '🔗 Моя ссылка',
          onClick: () => shareMyPersonalLink(),
        }),
        h('a', {
          className: 'btn btn-sm btn-second-tab',
          href: secondUrl,
          target: '_blank',
          rel: 'noopener',
          text: '🪟 2-й аккаунт ↗',
        }),
      ),
    ));
    return;
  }

  const onlineNow = others.filter((p) => p.isOnline);
  const recentOthers = others.filter((p) => !p.isOnline);

  const appendGroup = (title, groupPeers) => {
    if (groupPeers.length === 0) return;
    list.appendChild(h('div', { className: 'people-section-title', text: title }));
    for (const p of groupPeers) {
      list.appendChild(h('div', { className: 'person-card' },
        h('span', {
          className: `person-avatar${p.isOnline ? ' is-online' : ''}`,
          text: avatarInitials(p.displayName),
          style: { background: `hsl(${avatarHue(p.peerId)} 60% 38%)` },
        }),
        h('div', { className: 'person-info' },
          h('strong', { text: p.displayName }),
          h('span', {
            className: `person-sub${p.isOnline ? ' is-online' : ''}`,
            text: p.bio
              ? `${p.isOnline ? '🟢 ' : ''}${p.bio}`
              : (p.isOnline ? '🟢 В сети сейчас' : fmtRelativeTime(p.lastSeen)),
          }),
        ),
        h('button', {
          type: 'button',
          className: 'btn btn-sm btn-primary',
          text: '💬 Написать',
          onClick: () => openDirectChatWithPeer(p.peerId, p.displayName),
        }),
      ));
    }
  };

  appendGroup(`🟢 Сейчас онлайн (${onlineNow.length})`, onlineNow);
  appendGroup(`🕘 Недавно были здесь (${recentOthers.length})`, recentOthers);
}

// ---------------- Удобная вкладка «🔌 Ссылки» (12 мессенджеров + 9 облаков со ссылками) ----------------
function renderSidebarLinksHub() {
  const container = el('sidebarLinksList');
  if (!container) return;
  clearNode(container);

  const q = state.linksSearchQuery.trim().toLowerCase();
  const guides = listServiceGuides().filter((g) => {
    if (!q) return true;
    const linksText = (g.quickLinks || []).map((l) => l.label).join(' ');
    return `${g.name} ${g.id} ${g.summary} ${linksText}`.toLowerCase().includes(q);
  });

  if (guides.length > 0) {
    container.appendChild(h('div', { className: 'people-section-title', text: `💬 Мессенджеры и прямые ссылки (${guides.length})` }));
    for (const g of guides) {
      const live = getLiveBridgeForNetwork(g.id);
      const badge = h('span', { className: 'net-avatar net-avatar-sm' });
      applyBrandBadge(badge, g.id, 18);

      const linksRow = h('div', { className: 'quick-links-row' });
      for (const lnk of (g.quickLinks || [])) {
        linksRow.appendChild(h('a', {
          className: `qlink-chip${lnk.primary ? ' is-primary' : ''}`,
          href: lnk.url,
          target: '_blank',
          rel: 'noopener noreferrer',
          text: `${lnk.icon || '🔗'} ${lnk.label} ↗`,
        }));
      }

      container.appendChild(h('div', { className: `link-service-card${live ? ' is-live' : ''}` },
        h('div', { className: 'link-service-top' },
          h('div', { className: 'link-service-id' },
            badge,
            h('div', {},
              h('strong', { text: g.name }),
              h('span', { className: 'link-service-proto', text: live ? '🟢 Подключён LIVE' : g.protocolLabel }),
            ),
          ),
          h('button', {
            type: 'button',
            className: `btn btn-sm ${live ? 'btn-ghost' : 'btn-primary'}`,
            text: live ? '⚙ Мост' : '🔌 API',
            onClick: () => openConnectHub(g.id),
          }),
        ),
        linksRow,
      ));
    }
  }

  const clouds = (state.cloudStatus?.services || []).filter((s) => {
    if (!q) return true;
    return `${s.name} ${s.category} ${s.resourceName}`.toLowerCase().includes(q);
  });
  if (clouds.length > 0) {
    container.appendChild(h('div', { className: 'people-section-title', text: `☁ Подключённые облака (${clouds.length})` }));
    for (const svc of clouds) {
      container.appendChild(h('a', {
        className: 'cloud-link-card',
        href: svc.url,
        target: '_blank',
        rel: 'noopener noreferrer',
      },
        h('div', { className: 'cloud-link-body' },
          h('strong', { text: `${svc.name} · ${svc.category}` }),
          h('span', { text: svc.resourceName }),
        ),
        h('span', { className: 'cloud-link-open', text: 'Открыть ↗' }),
      ));
    }
  }
}

// ---------------- Работа с реальными 1-на-1 DM, «Избранным» и комнатами по ссылке ----------------
async function openDirectChatWithPeer(targetPeerId, targetName = 'Собеседник') {
  const res = await state.client.createOrOpenCloudDm({
    targetPeerId,
    targetName,
    myName: state.displayName,
  });
  if (!res.ok) {
    showToast('Не удалось открыть личный чат', res.error || '', 'error');
    return;
  }
  el('dmActionModal')?.close();
  await refreshAll({ reloadMessages: false });
  setSidebarTab('chats');
  await selectChat(res.data.roomId);
  el('messageInput')?.focus();
  showToast('Личный чат открыт', `Переписка 1-на-1 с ${targetName}`, 'good');
}

async function openSavedMessagesChat() {
  const res = await state.client.createOrOpenSelfChat({ myName: state.displayName });
  if (!res.ok) {
    showToast('Не удалось открыть Избранное', res.error || '', 'error');
    return;
  }
  el('dmActionModal')?.close();
  await refreshAll({ reloadMessages: false });
  setSidebarTab('chats');
  await selectChat(res.data.roomId);
  el('messageInput')?.focus();
  showToast('⭐ Избранное открыто', 'Твой личный чат для заметок и файлов', 'good');
}

function renderDmModalPeople() {
  const box = el('dmModalPeopleList');
  if (!box) return;
  clearNode(box);

  const peers = state.cloudStatus?.supabase?.onlinePeers || [];
  const myPeerId = state.client?.getCloudPeerId?.() || '';
  const q = (el('dmPeopleSearchInput')?.value || '').trim().toLowerCase();
  const others = peers.filter((p) => {
    if (!p.peerId || p.peerId === myPeerId) return false;
    if (q && !(`${p.displayName} ${p.bio || ''} ${p.peerId}`.toLowerCase().includes(q))) return false;
    return true;
  });

  if (others.length === 0) {
    box.appendChild(h('div', { className: 'empty-hint-card' },
      h('p', {
        className: 'muted-text',
        text: q
          ? 'Собеседник не найден — вставь его ссылку или ID ниже.'
          : 'Пока рядом никого нет в списке. Отправь другу ссылку ниже или открой 2-ю вкладку, чтобы сразу переписываться 1-на-1!',
      }),
    ));
    return;
  }

  for (const p of others) {
    box.appendChild(h('div', { className: 'person-card' },
      h('span', {
        className: `person-avatar${p.isOnline ? ' is-online' : ''}`,
        text: avatarInitials(p.displayName),
        style: { background: `hsl(${avatarHue(p.peerId)} 60% 38%)` },
      }),
      h('div', { className: 'person-info' },
        h('strong', { text: p.displayName }),
        h('span', {
          className: `person-sub${p.isOnline ? ' is-online' : ''}`,
          text: p.isOnline ? '🟢 В сети сейчас' : fmtRelativeTime(p.lastSeen),
        }),
      ),
      h('button', {
        type: 'button',
        className: 'btn btn-sm btn-primary',
        text: '💬 Написать',
        onClick: () => openDirectChatWithPeer(p.peerId, p.displayName),
      }),
    ));
  }
}

function openDmModal() {
  const myPeerId = state.client.getCloudPeerId();
  const myUrl = state.client.buildInviteUrl({ dmPeerId: myPeerId, dmName: state.displayName });
  const linkEl = el('dmMyLinkCode');
  if (linkEl) linkEl.textContent = myUrl;
  const idEl = el('dmMyPeerIdCode');
  if (idEl) idEl.textContent = myPeerId;
  const tabBtn = el('btnOpenSecondTabDmModal');
  if (tabBtn) tabBtn.href = state.client.buildSecondProfileUrl(state.displayName);
  const searchEl = el('dmPeopleSearchInput');
  if (searchEl) searchEl.value = '';
  renderDmModalPeople();
  el('dmActionModal')?.showModal();
}

async function handleOpenDmByCode(rawInput) {
  const raw = String(rawInput || '').trim();
  if (!raw) return;
  let dmPeer = null;
  let dmName = '';
  try {
    if (/^https?:\/\//i.test(raw) || raw.includes('?')) {
      const u = new URL(raw.startsWith('http') ? raw : `https://local/${raw.replace(/^\?/, '?')}`);
      dmPeer = u.searchParams.get('dm');
      dmName = u.searchParams.get('name') || '';
    }
  } catch { /* ignore */ }
  const targetId = dmPeer || raw;
  const known = (state.cloudStatus?.supabase?.onlinePeers || []).find((p) => p.peerId === targetId);
  await openDirectChatWithPeer(targetId, dmName || known?.displayName || 'Собеседник');
}

async function handleJoinRoomOrLink(rawInput) {
  const raw = String(rawInput || '').trim();
  if (!raw) return;

  // Поддерживаем полную ссылку (?dm=... или ?join=...) или голый код комнаты (room-...) или ID пользователя
  let dmPeer = null;
  let dmName = '';
  let joinRoom = null;
  try {
    if (/^https?:\/\//i.test(raw) || raw.includes('?')) {
      const u = new URL(raw.startsWith('http') ? raw : `https://local/${raw.replace(/^\?/, '?')}`);
      dmPeer = u.searchParams.get('dm');
      dmName = u.searchParams.get('name') || '';
      joinRoom = u.searchParams.get('join') || u.searchParams.get('room');
    }
  } catch { /* fallback below */ }

  if (dmPeer) {
    await openDirectChatWithPeer(dmPeer, dmName || 'Собеседник');
    return;
  }
  const roomId = joinRoom || raw;
  if (!roomId.startsWith('room-') && !roomId.startsWith('dm-') && !['games-lobby', 'games-coop', 'games-dev', 'ratmes-main'].includes(roomId)) {
    await handleOpenDmByCode(roomId);
    return;
  }
  const res = await state.client.joinCloudRoomById(roomId);
  if (!res.ok) {
    showToast('Не удалось войти', res.error || 'Проверь ссылку или код комнаты', 'error');
    return;
  }
  await refreshAll({ reloadMessages: false });
  setSidebarTab('chats');
  await selectChat(res.data.roomId);
  showToast('Вы вошли в комнату!', res.data.title || res.data.roomId, 'good');
}

async function shareMyPersonalLink() {
  const myId = state.client.getCloudPeerId();
  const url = state.client.buildInviteUrl({ dmPeerId: myId, dmName: state.displayName });
  await shareOrCopyUrl(url, `Чат с ${state.displayName} в RatMes`, `Переходи по ссылке, чтобы пообщаться со мной в RatMes`);
}

async function shareActiveRoomLink() {
  const chat = state.activeChat;
  if (!chat) return shareMyPersonalLink();
  if (chat.chatId.startsWith('dm-') || !state.client.isCloudRoom(chat.chatId)) {
    return shareMyPersonalLink();
  }
  const url = state.client.buildInviteUrl({ joinRoomId: chat.chatId });
  await shareOrCopyUrl(url, `Комната «${chat.title}» в RatMes`, `Присоединяйся к живому чату «${chat.title}»`);
}

function openProfileModal() {
  el('profileNameInput').value = state.displayName;
  el('profileBioInput').value = state.bio;
  const myId = state.client.getCloudPeerId();
  const myUrl = state.client.buildInviteUrl({
    dmPeerId: myId,
    dmName: state.displayName,
  });
  el('profileMyLinkCode').textContent = myUrl;
  const pidEl = el('profileMyPeerIdCode');
  if (pidEl) pidEl.textContent = myId;
  const mBtn = el('btnOpenSecondTabModal');
  if (mBtn) mBtn.href = state.client.buildSecondProfileUrl(state.displayName);
  el('profileModal')?.showModal();
  el('profileNameInput')?.focus();
}

// ---------------- Выбор чата и рендер шапки + сообщений ----------------
async function selectChat(chatId) {
  state.activeChatId = chatId;
  state.activeChat = state.chats.find((c) => c.chatId === chatId) || null;
  state.replyTo = null;
  state.editingMessage = null;
  updateReplyBar();
  closeChatMoreBar();
  setMobileChatOpen(true);

  await state.client.call('chrono.recordPast', { kind: 'chat-switch', chatId });
  await state.client.call('workspace.markRead', { chatId });

  const draftRes = await state.client.call('workspace.getDraft', { chatId });
  if (draftRes.ok && el('messageInput')) {
    el('messageInput').value = draftRes.data.text || '';
  }

  renderChatList();
  renderChatHeader();
  await loadActiveChatMessages();
}

function renderChatHeader() {
  const chat = state.activeChat;
  if (!chat) return;
  const isSelf = chat.chatId.startsWith('dm-self-');
  const isDm = chat.roomType === 'dm' || chat.chatId.startsWith('dm-');
  const isGroup = chat.roomType === 'group' || chat.chatId.startsWith('room-');
  const isCloud = state.client.isCloudRoom(chat.chatId);
  const liveBridge = chat.network !== 'ratmes' ? getLiveBridgeForNetwork(chat.network) : null;
  const netInfo = state.networks.find((n) => n.id === chat.network);
  const onlinePeers = state.cloudStatus?.supabase?.onlinePeers || [];
  const onlinePeersCount = state.cloudStatus?.supabase?.onlinePeersCount || 0;
  const myPeerId = state.client?.getCloudPeerId?.() || '';

  el('activeChatTitle').textContent = chat.title;
  const badgeEl = el('activeChatBadge');
  if (isSelf) {
    badgeEl.textContent = '⭐';
    badgeEl.style.background = 'linear-gradient(135deg, #f59e0b, #d97706)';
    badgeEl.style.color = '#10141c';
  } else if (isDm) {
    badgeEl.textContent = avatarInitials(chat.title);
    badgeEl.style.background = `hsl(${avatarHue(chat.chatId)} 62% 40%)`;
    badgeEl.style.color = '#ffffff';
  } else if (isGroup) {
    badgeEl.textContent = avatarInitials(chat.title);
    badgeEl.style.background = 'linear-gradient(135deg, #2563eb, #7c3aed)';
    badgeEl.style.color = '#ffffff';
  } else {
    applyBrandBadge(badgeEl, chat.network, 22);
  }

  const routePill = el('activeRoutePill');
  const trustPill = el('activeTrustPill');
  const headerConnectBtn = el('btnHeaderConnect');
  const inviteBtn = el('btnInviteRoom');
  const vpnBtn = el('btnQuickBindVpn');
  const warnBanner = el('trustWarningBanner');

  if (isSelf) {
    routePill.textContent = 'Личные заметки';
    routePill.className = 'chat-status-sub';
    if (trustPill) trustPill.hidden = true;
    if (headerConnectBtn) headerConnectBtn.hidden = true;
    if (inviteBtn) inviteBtn.hidden = true;
  } else if (isDm) {
    const otherPeerId = Array.isArray(chat.participants)
      ? chat.participants.find((pid) => pid && pid !== myPeerId)
      : null;
    const otherPeer = otherPeerId ? onlinePeers.find((p) => p.peerId === otherPeerId) : null;
    routePill.textContent = otherPeer?.isOnline
      ? 'в сети'
      : otherPeer?.lastSeen
        ? fmtRelativeTime(otherPeer.lastSeen)
        : 'личный чат';
    routePill.className = `chat-status-sub${otherPeer?.isOnline ? ' is-online' : ''}`;
    if (trustPill) trustPill.hidden = true;
    if (headerConnectBtn) headerConnectBtn.hidden = true;
    if (inviteBtn) inviteBtn.hidden = false;
  } else if (isCloud) {
    routePill.textContent = onlinePeersCount > 0 ? `${onlinePeersCount} в сети` : 'в сети';
    routePill.className = 'chat-status-sub is-online';
    if (trustPill) trustPill.hidden = true;
    if (headerConnectBtn) headerConnectBtn.hidden = true;
    if (inviteBtn) inviteBtn.hidden = false;
  } else if (liveBridge) {
    routePill.textContent = `${NETWORK_LABELS[chat.network] || chat.network} · подключён`;
    routePill.className = 'chat-status-sub is-online';
    if (headerConnectBtn) {
      headerConnectBtn.hidden = false;
      headerConnectBtn.textContent = '⚙ Мост';
    }
    if (inviteBtn) inviteBtn.hidden = true;
  } else {
    routePill.textContent = `${NETWORK_LABELS[chat.network] || chat.network} · не подключён`;
    routePill.className = 'chat-status-sub is-warn';
    if (headerConnectBtn) {
      headerConnectBtn.hidden = false;
      headerConnectBtn.textContent = 'Подключить';
    }
    if (inviteBtn) inviteBtn.hidden = true;
  }

  if (vpnBtn) {
    vpnBtn.hidden = !(netInfo && netInfo.needsVpn && !netInfo.routeReady && !isCloud);
  }

  if (warnBanner) {
    if (netInfo?.e2eeWarning) {
      warnBanner.hidden = false;
      warnBanner.textContent = `⚠️ ${netInfo.e2eeWarning}`;
    } else {
      warnBanner.hidden = true;
    }
  }

  const canWriteBar = el('chatCanWriteBar');
  const canWriteText = el('chatCanWriteText');
  const canWriteAction = el('btnCanWriteAction');
  const msgInput = el('messageInput');

  if (msgInput) {
    msgInput.placeholder = isSelf ? 'Заметка…' : isDm ? 'Личное сообщение…' : 'Сообщение…';
  }
  // Никакой лишней полосы над полем ввода в обычных и личных чатах! Показываем только если нужно подключить внешний мост.
  if (canWriteBar && canWriteText && canWriteAction) {
    if (!isCloud && !isDm && !isSelf && !liveBridge) {
      canWriteBar.hidden = false;
      canWriteBar.className = 'chat-can-write-bar is-warn';
      canWriteText.textContent = `Подключи ${NETWORK_LABELS[chat.network] || chat.network}, чтобы отправлять сюда`;
      canWriteAction.hidden = false;
      canWriteAction.textContent = 'Подключить';
      canWriteAction.onclick = () => openConnectHub(chat.network);
    } else {
      canWriteBar.hidden = true;
      canWriteAction.hidden = true;
    }
  }
}

async function loadActiveChatMessages() {
  if (!state.activeChatId) return;
  const res = await state.client.call('vault.readPage', { chatId: state.activeChatId, limit: 150 });
  if (!res.ok) return;
  state.messages = res.data.messages || [];
  state.pinnedIds = state.messages.filter((m) => m.pinned).map((m) => m.msgId);
  renderPinnedBanner();
  renderMessages();
}

function renderPinnedBanner() {
  const banner = el('pinnedBanner');
  if (!banner) return;
  if (!state.pinnedIds.length) {
    banner.hidden = true;
    return;
  }
  const lastPinnedId = state.pinnedIds[state.pinnedIds.length - 1];
  const msg = state.messages.find((m) => m.msgId === lastPinnedId);
  if (!msg) {
    banner.hidden = true;
    return;
  }
  banner.hidden = false;
  const btn = el('btnJumpPinned');
  btn.textContent = `${msg.senderName}: ${(msg.text || 'Вложение').slice(0, 80)}`;
  btn.onclick = () => {
    const target = document.querySelector(`[data-msg-id="${CSS.escape(lastPinnedId)}"]`);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'center' });
      target.classList.add('highlight');
      setTimeout(() => target.classList.remove('highlight'), 1400);
    }
  };
}

function renderMessages() {
  const feed = el('messagesFeed');
  if (!feed) return;
  const wasNearBottom = (feed.scrollHeight - feed.scrollTop - feed.clientHeight) < 120;
  clearNode(feed);

  if (state.messages.length === 0) {
    const isSelf = state.activeChat?.chatId?.startsWith('dm-self-');
    const isDm = state.activeChat?.chatId?.startsWith('dm-');
    feed.appendChild(h('div', { className: 'empty-feed-state' },
      h('strong', { text: isSelf ? 'Избранное' : isDm ? 'Личный чат' : 'Сообщений пока нет' }),
      h('span', {
        className: 'muted-text',
        text: isSelf ? 'Сохраняй сюда заметки и файлы' : 'Напиши первое сообщение ниже',
      }),
    ));
    return;
  }

  const byId = new Map(state.messages.map((m) => [m.msgId, m]));
  const myPeerId = state.client?.getCloudPeerId?.() || '';
  let lastDateLabel = '';

  for (const m of state.messages) {
    const dateLabel = fmtDateLabel(m.ts);
    if (dateLabel && dateLabel !== lastDateLabel) {
      lastDateLabel = dateLabel;
      feed.appendChild(h('div', { className: 'msg-date-sep', text: dateLabel }));
    }

    const isMine = m.direction === 'out' || Boolean(myPeerId && m.senderId && String(m.senderId) === myPeerId);
    const isPinned = Boolean(m.pinned) || state.pinnedIds.includes(m.msgId);
    const reactions = Array.isArray(m.reactions) ? m.reactions : [];
    const statusLabel = isMine
      ? (m.status === 'delivered' ? '✓✓' : m.status === 'queued' ? '⏳' : '✓')
      : '';
    const peerColor = peerAccentColor(m.senderId || m.senderName);
    const senderDisplay = m.senderName || 'Участник';

    const row = h('div', {
      className: `msg-row ${isMine ? 'is-out' : 'is-in'}`,
      dataset: { msgId: m.msgId },
    });

    const canDmSender = !isMine
      && m.senderId
      && !String(m.senderId).includes(':')
      && String(m.senderId) !== myPeerId
      && !state.activeChatId?.startsWith('dm-');

    // Для собеседника слева показываем круглый цветной аватар (клик → открыть личный чат 1-на-1!)
    if (!isMine) {
      const avStyle = { background: `hsl(${avatarHue(m.senderId || senderDisplay)} 58% 40%)` };
      const avatarNode = canDmSender
        ? h('button', {
          type: 'button',
          className: 'msg-peer-avatar',
          title: `Написать в личку: ${senderDisplay}`,
          text: avatarInitials(senderDisplay),
          style: avStyle,
          onClick: () => openDirectChatWithPeer(m.senderId, senderDisplay),
        })
        : h('span', {
          className: 'msg-peer-avatar',
          text: avatarInitials(senderDisplay),
          style: avStyle,
        });
      row.appendChild(avatarNode);
    }

    const bubble = h('article', {
      className: `msg-bubble ${isMine ? 'out' : 'in'}${m.deleted ? ' deleted' : ''}`,
    });
    if (!isMine) bubble.style.setProperty('--peer-color', peerColor);

    const myLabel = (state.displayName && state.displayName !== 'Участник')
      ? `Вы · ${state.displayName}`
      : 'Вы';

    const senderWrap = isMine
      ? h('span', { className: 'msg-sender-me', text: myLabel })
      : h('div', { className: 'msg-sender-wrap' },
        canDmSender
          ? h('button', {
            type: 'button',
            className: 'msg-sender-btn',
            style: { color: peerColor },
            title: `Написать в личку: ${senderDisplay}`,
            text: senderDisplay,
            onClick: () => openDirectChatWithPeer(m.senderId, senderDisplay),
          })
          : h('span', { className: 'msg-sender', style: { color: peerColor }, text: senderDisplay }),
        canDmSender
          ? h('button', {
            type: 'button',
            className: 'msg-dm-quick-btn',
            title: `Открыть личный чат 1-на-1 с ${senderDisplay}`,
            text: '💬 Личка',
            onClick: () => openDirectChatWithPeer(m.senderId, senderDisplay),
          })
          : null,
      );

    bubble.appendChild(h('div', { className: 'msg-meta-top' },
      senderWrap,
      h('span', { className: 'msg-badges' },
        isPinned ? h('span', { className: 'tag-mini ok', text: '📌' }) : null,
        m.editedAt ? h('span', { className: 'tag-mini', text: 'ред.' }) : null,
      ),
    ));

    if (m.forwardedFrom) {
      bubble.appendChild(h('div', {
        className: 'msg-forward-box',
        text: `↪ Переслано от ${m.forwardedFrom.originalSenderName}`,
      }));
    }

    const replyId = m.replyTo || m.replyToId;
    if (replyId && byId.has(replyId)) {
      const target = byId.get(replyId);
      bubble.appendChild(h('div', {
        className: 'msg-reply-box',
        text: `↩ ${target.senderName}: ${(target.text || 'Вложение').slice(0, 72)}`,
      }));
    }

    const bodyNode = h('div', { className: 'msg-text' });
    bodyNode.appendChild(renderMarkdownToFragment(m.text || ''));
    bubble.appendChild(bodyNode);

    if (m.attachment && !m.deleted) {
      const attName = m.attachment.filename || m.attachment.name || 'Файл';
      const mediaUrl = m.attachment.mediaRelPath ? state.client.getVaultMediaUrl(m.attachment.mediaRelPath) : null;
      const isImg = m.attachment.mediaKind === 'image' || Boolean(m.attachment.isImage);
      const durMs = m.attachment.durationMs || ((m.attachment.durationSec || 0) * 1000);
      if (m.attachment.isVoice) {
        const voiceBox = h('div', { className: 'msg-voice' },
          h('span', { className: 'voice-ico', text: '🎙️' }),
          h('span', { text: `Голосовое · ${fmtDuration(durMs)}` }),
        );
        if (mediaUrl) voiceBox.appendChild(h('audio', { controls: 'true', src: mediaUrl, className: 'voice-player' }));
        bubble.appendChild(voiceBox);
      } else if (isImg && mediaUrl) {
        bubble.appendChild(h('div', { className: 'msg-image-wrap' },
          h('img', { src: mediaUrl, alt: attName, className: 'msg-image', loading: 'lazy' }),
        ));
      } else {
        bubble.appendChild(h('div', { className: 'msg-attachment' },
          h('span', { text: `📎 ${attName} (${fmtBytes(m.attachment.sizeBytes)})` }),
          mediaUrl ? h('a', { href: mediaUrl, download: attName, className: 'btn btn-sm btn-ghost', text: 'Скачать' }) : null,
        ));
      }
    }

    if (reactions.length > 0) {
      const reactRow = h('div', { className: 'msg-reactions' });
      for (const r of reactions) {
        if (!r || !r.emoji || !r.count) continue;
        reactRow.appendChild(h('button', {
          type: 'button',
          className: `react-pill${r.mine ? ' mine' : ''}`,
          text: `${r.emoji} ${r.count}`,
          onClick: () => toggleReaction(m.msgId, r.emoji),
        }));
      }
      bubble.appendChild(reactRow);
    }

    const actionsBar = h('div', { className: 'msg-actions-drawer', hidden: true });
    for (const em of QUICK_EMOJIS) {
      actionsBar.appendChild(h('button', {
        type: 'button',
        className: 'act-btn',
        text: em,
        onClick: () => toggleReaction(m.msgId, em),
      }));
    }
    actionsBar.appendChild(h('button', { type: 'button', className: 'act-btn', text: '↩', title: 'Ответить', onClick: () => startReply(m) }));
    actionsBar.appendChild(h('button', { type: 'button', className: 'act-btn', text: '↪', title: 'Переслать', onClick: () => openForwardModal(m) }));
    actionsBar.appendChild(h('button', { type: 'button', className: 'act-btn', text: '📌', title: isPinned ? 'Открепить' : 'Закрепить', onClick: () => togglePin(m.msgId) }));
    if (isMine && !m.deleted) {
      actionsBar.appendChild(h('button', { type: 'button', className: 'act-btn', text: '✏️', title: 'Редактировать', onClick: () => startEdit(m) }));
      actionsBar.appendChild(h('button', { type: 'button', className: 'act-btn', text: '🗑️', title: 'Удалить', onClick: () => deleteMsg(m.msgId) }));
    }

    const toggleActionsBtn = h('button', {
      type: 'button',
      className: 'msg-more-btn',
      title: 'Реакции и действия',
      text: '⋯',
      onClick: () => {
        const willOpen = actionsBar.hidden;
        for (const d of feed.querySelectorAll('.msg-actions-drawer')) d.hidden = true;
        actionsBar.hidden = !willOpen;
      },
    });

    bubble.appendChild(h('div', { className: 'msg-meta-bottom' },
      h('span', { text: fmtTime(m.ts) }),
      statusLabel ? h('span', { className: 'msg-status', text: statusLabel }) : null,
      toggleActionsBtn,
    ));
    bubble.appendChild(actionsBar);
    row.appendChild(bubble);
    feed.appendChild(row);
  }

  if (wasNearBottom) {
    feed.scrollTop = feed.scrollHeight;
  }
}

// ---------------- Действия с сообщениями ----------------
async function toggleReaction(msgId, emoji) {
  await state.client.call('workspace.toggleReaction', { chatId: state.activeChatId, msgId, emoji });
  await loadActiveChatMessages();
}
async function togglePin(msgId) {
  await state.client.call('workspace.togglePin', { chatId: state.activeChatId, msgId });
  await loadActiveChatMessages();
}
function startReply(m) {
  state.editingMessage = null;
  state.replyTo = m;
  updateReplyBar();
  el('messageInput')?.focus();
}
function startEdit(m) {
  state.replyTo = null;
  state.editingMessage = m;
  el('messageInput').value = m.text || '';
  updateReplyBar();
  el('messageInput')?.focus();
}
function updateReplyBar() {
  const bar = el('replyBar');
  if (!bar) return;
  if (state.editingMessage) {
    bar.hidden = false;
    el('replyBarText').textContent = `✏️ Редактирование: ${(state.editingMessage.text || '').slice(0, 60)}`;
  } else if (state.replyTo) {
    bar.hidden = false;
    el('replyBarText').textContent = `↩ Ответ на ${state.replyTo.senderName}: ${(state.replyTo.text || 'Вложение').slice(0, 60)}`;
  } else {
    bar.hidden = true;
  }
}
async function deleteMsg(msgId) {
  const res = await state.client.call('workspace.deleteMessage', { chatId: state.activeChatId, msgId });
  if (res.ok) {
    showToast('Сообщение удалено', '', 'info');
    await loadActiveChatMessages();
  }
}

function openForwardModal(m) {
  state.forwardingMessage = m;
  el('forwardPreviewText').textContent = `«${(m.text || 'Вложение').slice(0, 90)}»`;
  const sel = el('forwardTargetChat');
  clearNode(sel);
  for (const c of state.chats) {
    sel.appendChild(h('option', { value: c.chatId, text: c.title }));
  }
  el('chkForwardHideAuthor').checked = false;
  el('forwardModal')?.showModal();
}

// ---------------- Реальная отправка сообщений ----------------
async function sendMessage(e) {
  e.preventDefault();
  if (!state.activeChat) return;
  const input = el('messageInput');
  const text = (input.value || '').trim();
  if (!text && !state.pendingAttachment) return;

  if (state.editingMessage) {
    const res = await state.client.call('workspace.editMessage', {
      chatId: state.activeChatId,
      msgId: state.editingMessage.msgId,
      newText: text,
    });
    if (res.ok) {
      state.editingMessage = null;
      input.value = '';
      updateReplyBar();
      showToast('Сообщение изменено', '', 'good');
      await loadActiveChatMessages();
    }
    return;
  }

  // Если внешний мессенджер не подключён — предлагаем подключить без симуляции
  const isCloud = state.client.isCloudRoom(state.activeChat.chatId);
  if (!isCloud && state.activeChat.network !== 'ratmes' && !getLiveBridgeForNetwork(state.activeChat.network)) {
    showToast('Сначала подключи мессенджер', `Открой Центр подключений для ${NETWORK_LABELS[state.activeChat.network] || state.activeChat.network}`, 'warn');
    openConnectHub(state.activeChat.network);
    return;
  }

  const chat = state.activeChat;
  const att = state.pendingAttachment;
  const myPeerId = state.client.getCloudPeerId();
  let packRes;

  if (att?.isVoice) {
    packRes = await state.client.call('pack.voice', {
      chatId: chat.chatId,
      chatTitle: chat.title,
      network: chat.network,
      base64: att.base64Data || null,
      mimeType: att.mimeType || 'audio/webm',
      durationSec: att.durationSec || 2,
      waveform: att.waveform || null,
      caption: text || '🎙️ Голосовое сообщение',
      senderId: myPeerId,
      senderName: state.displayName,
    });
  } else if (att) {
    packRes = await state.client.call('pack.media', {
      chatId: chat.chatId,
      chatTitle: chat.title,
      network: chat.network,
      filename: att.name || 'file.bin',
      mimeType: att.mimeType || 'application/octet-stream',
      base64: att.base64Data || null,
      caption: text || `📎 ${att.name || 'Вложение'}`,
      senderId: myPeerId,
      senderName: state.displayName,
    });
  } else if (state.replyTo?.msgId) {
    packRes = await state.client.call('pack.reply', {
      chatId: chat.chatId,
      chatTitle: chat.title,
      network: chat.network,
      targetMsgId: state.replyTo.msgId,
      text,
      senderId: myPeerId,
      senderName: state.displayName,
    });
  } else {
    packRes = await state.client.call('pack.text', {
      chatId: chat.chatId,
      chatTitle: chat.title,
      network: chat.network,
      text,
      senderId: myPeerId,
      senderName: state.displayName,
    });
  }

  if (!packRes?.ok) {
    showToast('Не удалось упаковать сообщение', packRes?.error?.message || '', 'error');
    return;
  }

  const handleId = packRes.data.envelope.handleId;
  const msgId = packRes.data.msgId || `${state.client.getCloudPeerId()}-${Date.now()}`;
  const bodyText = text || (att?.isVoice ? '🎙️ Голосовое сообщение' : `📎 ${att?.name || 'Вложение'}`);

  const pipeRes = await state.client.pipeline([
    { tool: 'pack.validate', args: { handleId } },
    { tool: 'vault.append', args: { handleId } },
    { tool: 'transfer.enqueue', args: { handleId } },
  ]);

  const enqueueStep = pipeRes.steps?.[2];
  const transferId = enqueueStep?.data?.transferId;
  const dispatchRes = transferId
    ? await state.client.call('transfer.dispatch', { transferId })
    : { ok: false, error: enqueueStep?.error };

  input.value = '';
  state.pendingAttachment = null;
  state.replyTo = null;
  el('attachmentBar').hidden = true;
  el('fileInput').value = '';
  updateReplyBar();
  await state.client.call('workspace.setDraft', { chatId: chat.chatId, text: '' });

  // В облачных комнатах (общих, личных DM и комнатах по ссылке) сразу пушим в живой Supabase!
  if (isCloud) {
    const pushRes = await state.client.pushSupabaseMessage({
      msgId,
      roomId: chat.chatId,
      network: chat.network,
      senderName: state.displayName,
      text: bodyText,
    });
    if (pushRes?.ok) {
      audio.sent();
    } else {
      showToast('Сохранено локально', 'Облако временно недоступно — повтори чуть позже', 'warn');
    }
  } else if (dispatchRes?.ok) {
    audio.sent();
    showToast('Отправлено в ' + (NETWORK_LABELS[chat.network] || chat.network), '', 'good');
  } else if (dispatchRes?.error) {
    audio.warn();
    showToast(dispatchRes.error.code || 'Ошибка', dispatchRes.error.message || '', 'warn');
  }

  await refreshAll({ reloadMessages: true });
}

// ---------------- Центр подключений (Connect Hub с прямыми ссылками) ----------------
function openConnectHub(networkId = null) {
  const validIds = new Set(listServiceGuides().map((g) => g.id));
  const picked = networkId && validIds.has(networkId)
    ? networkId
    : (state.activeChat && validIds.has(state.activeChat.network) ? state.activeChat.network : 'max');
  state.hubSelectedNetwork = picked;
  state.hubSelectedPreset = null;
  state.hubMobileStep = networkId && validIds.has(networkId) ? 'setup' : 'list';
  renderConnectHub();
  el('connectHubModal')?.showModal();
}

function setHubMobileStep(step) {
  state.hubMobileStep = step === 'setup' ? 'setup' : 'list';
  const layout = el('hubLayout');
  if (layout) layout.dataset.hubStep = state.hubMobileStep;
  for (const btn of document.querySelectorAll('#hubMobileTabs .hub-mtab')) {
    btn.classList.toggle('is-active', btn.dataset.hubStep === state.hubMobileStep);
  }
}

function renderConnectHub() {
  const guides = listServiceGuides();
  const isAgent = state.client.getMode() === 'agent';
  const savedRemote = state.client.getSavedRemoteAgentUrl();
  const activeCount = state.liveBridges.filter((b) => b.enabled).length;

  const counter = el('hubConnectedCounter');
  if (counter) {
    clearNode(counter);
    counter.appendChild(h('span', { className: 'live-dot' }));
    counter.appendChild(document.createTextNode(` ${activeCount} из ${guides.length} LIVE`));
  }

  const pill = el('hubAgentStatusPill');
  const note = el('hubAgentStatusText');
  const remoteInput = el('hubRemoteAgentInput');
  const disconnectBtn = el('btnDisconnectRemoteAgent');
  if (isAgent) {
    pill.textContent = '🟢 ПК-агент подключён';
    pill.className = 'pill good';
    note.textContent = `Активный агент: ${state.client.getAgentBaseUrl() || 'локальный'} · без ограничений CORS + автоприём входящих.`;
    if (disconnectBtn) disconnectBtn.hidden = !savedRemote;
  } else {
    pill.textContent = '🌐 Браузерный режим';
    pill.className = 'pill warn';
    note.textContent = 'Discord, Telegram и Matrix работают прямо из браузера; для MAX, VK и WhatsApp подключи ПК-агент ниже.';
    if (disconnectBtn) disconnectBtn.hidden = true;
  }
  if (remoteInput && !remoteInput.value && savedRemote) remoteInput.value = savedRemote;

  for (const fp of document.querySelectorAll('#hubFilterPills .hub-fpill')) {
    fp.classList.toggle('is-active', fp.dataset.hubFilter === state.hubFilter);
  }

  const q = state.hubSearchQuery.trim().toLowerCase();
  const filteredGuides = guides.filter((g) => {
    const live = Boolean(getLiveBridgeForNetwork(g.id));
    if (state.hubFilter === 'ru' && g.group !== 'ru') return false;
    if (state.hubFilter === 'connected' && !live) return false;
    if (state.hubFilter === 'global' && g.group !== 'global') return false;
    if (q && !(`${g.name} ${g.id} ${g.protocolLabel}`.toLowerCase().includes(q))) return false;
    return true;
  });

  const grid = el('hubServiceGrid');
  clearNode(grid);
  if (filteredGuides.length === 0) {
    grid.appendChild(h('p', { className: 'muted-text', text: 'Ничего не найдено — сбрось фильтр.' }));
  } else {
    for (const g of filteredGuides) {
      const live = getLiveBridgeForNetwork(g.id);
      const theme = getBrandTheme(g.id);
      const badge = h('span', { className: 'net-avatar net-avatar-sm' });
      applyBrandBadge(badge, g.id, 18);
      const card = h('button', {
        type: 'button',
        className: `hub-service-card${g.id === state.hubSelectedNetwork ? ' is-selected' : ''}${live ? ' is-live' : ''}`,
        style: { '--svc-accent': theme.c1, '--svc-glow': theme.glow },
        onClick: () => {
          state.hubSelectedNetwork = g.id;
          state.hubSelectedPreset = null;
          state.hubMobileStep = 'setup';
          renderConnectHub();
        },
      },
        badge,
        h('div', { className: 'hub-service-meta' },
          h('strong', { text: g.name }),
          h('span', {
            className: `hub-service-status ${live ? 'live' : ''}`,
            text: live ? '🟢 LIVE' : g.difficulty,
          }),
        ),
      );
      grid.appendChild(card);
    }
  }

  const guide = getServiceGuide(state.hubSelectedNetwork);
  const theme = getBrandTheme(guide.id);
  const netInfo = state.networks.find((n) => n.id === guide.id);
  const existing = state.liveBridges.find((b) => b.network === guide.id);
  const isLive = Boolean(existing?.enabled);

  const guideCol = el('hubGuideCol');
  if (guideCol) {
    guideCol.style.setProperty('--brand-c1', theme.c1);
    guideCol.style.setProperty('--brand-c2', theme.c2);
    guideCol.style.setProperty('--brand-glow', theme.glow);
    guideCol.style.setProperty('--brand-grad', theme.gradient);
  }
  const shortName = el('hubSelectedNameShort');
  if (shortName) shortName.textContent = guide.name;
  setHubMobileStep(state.hubMobileStep);

  applyBrandBadge(el('hubGuideAvatar'), guide.id, 28);
  el('hubGuideTitle').textContent = guide.name;
  el('hubGuideProto').textContent = guide.protocolLabel;
  el('hubGuideDifficulty').textContent = guide.difficulty;
  const stPill = el('hubGuideStatePill');
  stPill.textContent = isLive ? '🟢 Подключён LIVE' : 'Не подключён';
  stPill.className = `pill ${isLive ? 'good' : ''}`;
  el('hubGuideSummary').textContent = guide.summary;

  // Прямые кликабельные ссылки сервиса!
  const qLinksWrap = el('hubQuickLinks');
  clearNode(qLinksWrap);
  for (const lnk of (guide.quickLinks || [])) {
    qLinksWrap.appendChild(h('a', {
      className: `hub-qlink-btn${lnk.primary ? ' is-primary' : ''}`,
      href: lnk.url,
      target: '_blank',
      rel: 'noopener noreferrer',
      text: `${lnk.icon || '🔗'} ${lnk.label} ↗`,
    }));
  }

  // Схема маршрута
  const targetIcon = el('hubRouteTargetIcon');
  if (targetIcon) {
    clearNode(targetIcon);
    targetIcon.appendChild(createBrandSvg(guide.id, 20));
    targetIcon.style.background = theme.gradient;
  }
  el('hubRouteClientIco').textContent = isAgent ? '💻' : '🌐';
  el('hubRouteClientTitle').textContent = isAgent ? 'RatMes Agent' : 'Браузер';
  el('hubRouteClientSub').textContent = isAgent ? 'SecretVault · без CORS' : 'Прямой HTTPS';
  el('hubRouteTargetTitle').textContent = guide.name;
  let hostLabel = 'Webhook / API';
  try {
    if (guide.defaultEndpoint) hostLabel = new URL(guide.defaultEndpoint).host;
  } catch { /* ignore */ }
  el('hubRouteTargetHost').textContent = hostLabel;
  const routePill = el('hubRoutePill');
  const routeLink = el('hubRouteLink');
  if (netInfo?.needsVpn && !netInfo.routeReady) {
    routePill.textContent = '🔒 Требуется VPN';
    routeLink.className = 'hub-route-link is-warn';
  } else if (netInfo?.needsVpn && netInfo.routeReady) {
    routePill.textContent = `🔒 VPN (${netInfo.activeRoute})`;
    routeLink.className = 'hub-route-link is-good';
  } else {
    routePill.textContent = '⚡ Прямой HTTPS';
    routeLink.className = 'hub-route-link is-good';
  }

  const e2eeWarn = el('hubGuideE2eeWarn');
  if (guide.e2eeWarning) {
    e2eeWarn.hidden = false;
    e2eeWarn.textContent = `⚠️ ${guide.e2eeWarning}`;
  } else {
    e2eeWarn.hidden = true;
  }

  const vpnBox = el('hubGuideVpnBox');
  if (netInfo && netInfo.needsVpn && !netInfo.routeReady) {
    vpnBox.hidden = false;
    el('hubVpnCountry').textContent = state.countryProfile?.code || 'RU';
    el('btnHubBindVpn').onclick = () => openProxyModal(guide.id);
  } else {
    vpnBox.hidden = true;
  }

  // Пресеты способа подключения
  const presetsWrap = el('hubPresetsWrap');
  const presetChips = el('hubPresetChips');
  const presets = guide.presets || [];
  const activeKind = state.hubSelectedPreset || existing?.kind || guide.driverKind;
  clearNode(presetChips);
  if (presets.length > 1) {
    presetsWrap.hidden = false;
    for (const preset of presets) {
      const pKind = preset.kind || preset.id;
      presetChips.appendChild(h('button', {
        type: 'button',
        className: `hub-preset-btn${pKind === activeKind ? ' is-active' : ''}`,
        onClick: () => {
          state.hubSelectedPreset = pKind;
          el('hubFormKind').value = pKind;
          if (preset.endpoint !== undefined) {
            el('hubFormEndpoint').value = preset.endpoint;
            el('hubFormPrimaryEndpoint').value = preset.endpoint;
          }
          renderConnectHub();
        },
      },
        h('strong', { text: preset.label }),
        h('span', { text: preset.desc || preset.hint || '' }),
      ));
    }
  } else {
    presetsWrap.hidden = true;
  }

  const stepsList = el('hubStepsList');
  clearNode(stepsList);
  for (const step of guide.steps) {
    stepsList.appendChild(h('li', { text: step }));
  }

  el('hubFormNetwork').value = guide.id;
  el('hubFormKind').value = activeKind;
  const endpointVal = existing?.endpoint || guide.defaultEndpoint || '';
  el('hubFormEndpoint').value = endpointVal;
  el('hubFormPrimaryEndpoint').value = endpointVal;
  el('hubFormTarget').value = existing?.targetId || '';
  el('hubFormToken').value = '';
  el('hubFormToken').type = 'password';
  el('hubFormToken').placeholder = existing?.enabled ? 'Токен сохранён в SecretVault (вставь новый для замены)' : guide.fields.tokenPlaceholder;

  const isWebhookMode = activeKind === 'webhook' || !guide.hideEndpointByDefault;
  el('hubFieldPrimaryEndpointWrap').hidden = !isWebhookMode;
  el('hubLabelPrimaryEndpoint').textContent = activeKind === 'webhook' ? 'URL твоего Webhook / шлюза' : guide.fields.endpointLabel;
  el('hubFormPrimaryEndpoint').placeholder = guide.fields.endpointPlaceholder || 'https://...';

  el('hubFieldEndpointWrap').hidden = !guide.fields.showEndpoint;
  el('hubLabelEndpoint').textContent = guide.fields.endpointLabel;
  el('hubFormEndpoint').placeholder = guide.fields.endpointPlaceholder;

  el('hubFieldTargetWrap').hidden = !guide.fields.showTargetId && activeKind !== 'webhook';
  el('hubLabelTarget').textContent = guide.fields.targetLabel;
  el('hubFormTarget').placeholder = guide.fields.targetPlaceholder;

  el('hubFieldTokenWrap').hidden = !guide.fields.showToken && activeKind !== 'webhook';
  el('hubLabelToken').textContent = guide.fields.tokenLabel;

  el('hubPollingWrap').hidden = !guide.supportsPolling || activeKind === 'webhook';
  el('hubFormPolling').checked = existing ? Boolean(existing.polling) : guide.supportsPolling;
  el('btnHubDisableBridge').hidden = !isLive;
  el('btnHubSaveBridge').textContent = isLive ? `💾 Обновить ${guide.name}` : `✅ Подключить ${guide.name}`;

  el('hubSuggestedWrap').hidden = true;
  clearNode(el('hubSuggestedChips'));
  el('hubTestResult').hidden = true;
  el('hubSanitizeHint').hidden = true;
  el('hubWebhookUrl').textContent = state.client.getWebhookUrl(guide.id);
  el('hubDirectHint').textContent = guide.directBrowserHint;
}

function getHubFormPayload() {
  const network = el('hubFormNetwork').value;
  const kind = el('hubFormKind').value;
  const guide = getServiceGuide(network);
  const rawEndpoint = !el('hubFieldPrimaryEndpointWrap').hidden
    ? el('hubFormPrimaryEndpoint').value.trim()
    : (el('hubFormEndpoint').value.trim() || guide.defaultEndpoint || '');
  const rawTarget = el('hubFormTarget').value.trim();
  const rawToken = el('hubFormToken').value.trim();
  const clean = sanitizeBridgeInput({ kind, endpoint: rawEndpoint, targetId: rawTarget, secretToken: rawToken });
  const changed = clean.endpoint !== rawEndpoint || clean.targetId !== rawTarget || clean.secretToken !== rawToken;
  const hint = el('hubSanitizeHint');
  if (hint) hint.hidden = !changed;
  if (changed) {
    if (!el('hubFieldPrimaryEndpointWrap').hidden) el('hubFormPrimaryEndpoint').value = clean.endpoint;
    el('hubFormEndpoint').value = clean.endpoint;
    el('hubFormTarget').value = clean.targetId;
    if (clean.secretToken) el('hubFormToken').value = clean.secretToken;
  }
  return {
    network,
    kind: clean.kind,
    endpoint: clean.endpoint || guide.defaultEndpoint || '',
    targetId: clean.targetId,
    secretToken: clean.secretToken,
    polling: !el('hubPollingWrap').hidden && el('hubFormPolling').checked,
    enabled: true,
  };
}

async function testHubBridge() {
  const payload = getHubFormPayload();
  const box = el('hubTestResult');
  box.hidden = false;
  box.className = 'callout';
  box.textContent = `⏳ Проверяю подключение к ${payload.network.toUpperCase()}…`;

  const res = await state.client.testLiveBridge(payload);
  if (res.ok) {
    box.className = 'callout good';
    box.textContent = `✅ ${res.data.message}${res.data.rttMs ? ` (${res.data.rttMs} мс)` : ''}`;
    const chats = res.data.suggestedChats || [];
    const wrap = el('hubSuggestedWrap');
    const chips = el('hubSuggestedChips');
    clearNode(chips);
    if (chats.length > 0) {
      wrap.hidden = false;
      for (const ch of chats) {
        chips.appendChild(h('button', {
          type: 'button',
          className: 'btn btn-sm btn-ghost',
          text: `📌 ${ch.label}`,
          onClick: () => {
            el('hubFormTarget').value = ch.id;
            showToast('ID чата подставлен', ch.label, 'good');
          },
        }));
      }
      if (!el('hubFormTarget').value && chats[0]?.id) el('hubFormTarget').value = chats[0].id;
    } else {
      wrap.hidden = true;
    }
    audio.sent();
  } else {
    box.className = 'callout bad';
    box.textContent = `❌ ${res.error?.message || 'Проверка не прошла'}`;
    audio.warn();
  }
}

async function sendHubTestMessage() {
  const payload = getHubFormPayload();
  const box = el('hubTestResult');
  box.hidden = false;
  box.className = 'callout';
  box.textContent = `✉ Отправляю пробное сообщение в ${payload.network.toUpperCase()}…`;

  const res = await state.client.sendTestBridgeMessage({
    ...payload,
    text: `✅ RatMes подключён к ${payload.network.toUpperCase()}!`,
  });
  if (res.ok) {
    box.className = 'callout good';
    box.textContent = `✅ ${res.data.message || 'Пробное сообщение доставлено!'}`;
    audio.sent();
  } else {
    box.className = 'callout bad';
    box.textContent = `❌ ${res.error?.message || 'Не удалось отправить пробное сообщение'}`;
    audio.warn();
  }
}

async function saveHubBridge(e) {
  e.preventDefault();
  const payload = getHubFormPayload();
  const guide = getServiceGuide(payload.network);
  const box = el('hubTestResult');
  box.hidden = false;
  box.className = 'callout';
  box.textContent = `Подключаю ${guide.name}…`;

  const res = await state.client.configureLiveBridge(payload);
  if (!res.ok) {
    box.className = 'callout bad';
    box.textContent = `❌ ${res.error?.message || 'Не удалось сохранить мост'}`;
    audio.warn();
    return;
  }

  let existingChat = state.chats.find((c) => c.network === payload.network);
  if (!existingChat) {
    const chatId = `${payload.network}-live`;
    await state.client.call('transfer.receive', {
      sourceChannel: 'bridge-connect',
      network: payload.network,
      chatId,
      chatTitle: `${guide.name} · Подключён`,
      senderName: guide.name,
      text: `Мост ${guide.name} успешно подключён.`,
    });
    existingChat = { chatId };
  }

  showToast(`${guide.name} подключён LIVE!`, res.data?.note || 'Готов к отправке сообщений', 'good');
  audio.sent();
  el('connectHubModal').close();
  await refreshAll({ reloadMessages: false });
  if (existingChat?.chatId) await selectChat(existingChat.chatId);
}

// ---------------- Панель настроек (Облака, Сети/VPN, Архив, Защита) ----------------
function renderCountrySelector() {
  const sel = el('countrySelect');
  if (!sel) return;
  if (sel.options.length === 0) {
    for (const c of state.countries) {
      sel.appendChild(h('option', { value: c.code, text: `${c.code} — ${c.name}` }));
    }
  }
  if (state.countryProfile) {
    sel.value = state.countryProfile.code;
    el('countryNote').textContent = state.countryProfile.notes;
    el('matrixCountryCode').textContent = state.countryProfile.code;
  }
}

function renderCloudTab() {
  const status = state.cloudStatus;
  if (!status) return;
  const sb = status.supabase || {};
  const pill = el('cloudSyncPill');
  if (pill) {
    if (sb.reachable === true) {
      pill.textContent = `Онлайн · ${sb.onlinePeersCount || 1} в сети`;
      pill.className = 'pill good';
    } else if (sb.reachable === false) {
      pill.textContent = 'Офлайн';
      pill.className = 'pill warn';
    } else {
      pill.textContent = 'Подключение…';
      pill.className = 'pill accent';
    }
  }

  const nickInput = el('cloudDisplayNameInput');
  if (nickInput && document.activeElement !== nickInput) nickInput.value = state.displayName;

  const statsEl = el('cloudSupabaseStats');
  if (statsEl) {
    clearNode(statsEl);
    const items = [
      ['Проект', sb.projectName || 'games-cloud-save'],
      ['Регион', sb.region || 'eu-central-1'],
      ['Онлайн сейчас', String(sb.onlinePeersCount || 0)],
      ['Комнат в облаке', String((sb.cloudRooms || []).length || 4)],
      ['Получено', String(sb.pulledCount || 0)],
      ['Отправлено', String(sb.pushedCount || 0)],
    ];
    for (const [k, v] of items) {
      statsEl.appendChild(h('div', { className: 'kv-item' }, h('span', { text: k }), h('strong', { text: v })));
    }
  }

  const countPill = el('cloudCountPill');
  if (countPill) countPill.textContent = `${status.totalConnected || 0} / ${status.totalConnected || 0}`;

  const svcList = el('cloudServicesList');
  if (svcList) {
    clearNode(svcList);
    for (const svc of (status.services || [])) {
      svcList.appendChild(h('div', { className: 'stack-card' },
        h('div', { className: 'stack-card-top' },
          h('strong', { text: `${svc.name} · ${svc.category}` }),
          h('span', { className: 'pill good', text: 'Активно' }),
        ),
        h('p', { className: 'muted-text', text: svc.resourceName }),
        h('div', { className: 'action-row' },
          h('a', {
            className: 'btn btn-sm btn-primary',
            href: svc.url,
            target: '_blank',
            rel: 'noopener noreferrer',
            text: 'Открыть ↗',
          }),
        ),
      ));
    }
  }
}

function renderNetworksTab() {
  const list = el('networksList');
  if (!list) return;
  clearNode(list);
  const activeCount = state.liveBridges.filter((b) => b.enabled).length;
  const countPill = el('liveBridgesCountPill');
  if (countPill) {
    countPill.textContent = `${activeCount} LIVE`;
    countPill.className = `pill ${activeCount > 0 ? 'good' : 'accent'}`;
  }

  for (const n of state.networks) {
    const live = getLiveBridgeForNetwork(n.id);
    const guide = n.id !== 'ratmes' ? getServiceGuide(n.id) : null;
    const badge = h('span', { className: 'net-avatar net-avatar-xs' });
    applyBrandBadge(badge, n.id, 14);

    list.appendChild(h('div', { className: 'stack-card' },
      h('div', { className: 'stack-card-top' },
        h('div', { className: 'net-title-inline' }, badge, h('strong', { text: n.name })),
        h('span', {
          className: `pill ${live || n.id === 'ratmes' ? 'good' : n.routeReady ? '' : 'warn'}`,
          text: n.id === 'ratmes' ? 'Родной E2EE' : live ? '🟢 LIVE' : (n.needsVpn && !n.routeReady ? 'Нужен VPN' : 'Не подключён'),
        }),
      ),
      h('div', { className: 'action-row' },
        n.needsVpn ? h('button', { type: 'button', className: 'btn btn-sm btn-ghost', text: '🔒 VPN', onClick: () => openProxyModal(n.id) }) : null,
        guide ? h('button', { type: 'button', className: 'btn btn-sm btn-primary', text: live ? '⚙ Мост' : '🔌 Подключить', onClick: () => openConnectHub(n.id) }) : null,
        guide?.webAppUrl ? h('a', { className: 'btn btn-sm btn-ghost', href: guide.webAppUrl, target: '_blank', rel: 'noopener noreferrer', text: '🌐 Веб ↗' }) : null,
      ),
    ));
  }
}

async function refreshP2pPeers() {
  const list = el('p2pPeersList');
  if (!list) return;
  const res = await state.client.listP2pPeers();
  clearNode(list);
  // Показываем ТОЛЬКО реально подключённые локальные узлы ПК-агента (без синтетических демо-адресов)
  const peers = state.client.getMode() === 'agent' ? (res?.data?.peers || []) : [];
  if (peers.length === 0) {
    list.appendChild(h('p', {
      className: 'muted-text',
      text: state.client.getMode() === 'agent'
        ? 'В локальной сети пока нет подключённых ПК-агентов RatMes. Введи IP другого ПК выше, чтобы связать напрямую.'
        : 'Прямой LAN/P2P доступен при запущенном ПК-агенте RatMes Agent.',
    }));
    return;
  }
  for (const p of peers) {
    list.appendChild(h('div', { className: 'stack-card' },
      h('div', { className: 'stack-card-top' },
        h('strong', { text: p.label || p.nodeId || p.endpoint }),
        h('span', { className: 'pill good', text: p.status || 'online' }),
      ),
      h('p', { className: 'muted-text', text: p.endpoint }),
    ));
  }
}

function renderVaultTab(data) {
  el('vaultRootLabel').textContent = `Хранилище: ${data.rootDir || 'локальное'} (${data.files.length} файлов)`;
  const list = el('vaultFilesList');
  clearNode(list);
  for (const f of data.files) {
    list.appendChild(h('button', {
      type: 'button',
      className: 'file-row',
      onClick: () => openVaultFile(f.path),
    },
      h('span', { text: f.path }),
      h('span', { className: 'muted-text', text: fmtBytes(f.size) }),
    ));
  }
}

async function openVaultFile(relPath) {
  const res = await state.client.call('vault.readPlainTextFile', { path: relPath });
  if (!res.ok) return;
  el('vaultPreviewCard').hidden = false;
  el('vaultPreviewTitle').textContent = relPath;
  el('vaultPreviewContent').textContent = res.data.content;
  const dl = el('vaultDownloadLink');
  const url = state.client.getVaultDownloadUrl(relPath);
  if (url) {
    dl.href = url;
    dl.download = relPath.split('/').pop();
    dl.hidden = false;
  } else {
    const blob = new Blob([res.data.content], { type: 'text/plain;charset=utf-8' });
    dl.href = URL.createObjectURL(blob);
    dl.download = relPath.split('/').pop();
    dl.hidden = false;
  }
}

function renderTransfers() {
  const list = el('transfersList');
  if (!list) return;
  clearNode(list);
  const pending = state.transfers.filter((t) => t.status !== 'delivered');
  if (pending.length === 0) {
    list.appendChild(h('p', { className: 'muted-text', text: 'Очередь пуста — все отправленные сообщения доставлены.' }));
    return;
  }
  for (const t of pending.slice(0, 12)) {
    list.appendChild(h('div', { className: 'stack-card' },
      h('div', { className: 'stack-card-top' },
        h('strong', { text: `${t.network.toUpperCase()} · ${t.chatId}` }),
        h('span', { className: 'pill warn', text: t.status }),
      ),
      t.lastError ? h('p', { className: 'muted-text', text: t.lastError.message }) : null,
      h('button', {
        type: 'button',
        className: 'btn btn-sm btn-primary',
        text: 'Повторить отправку',
        onClick: async () => {
          await state.client.call('transfer.resume', { transferId: t.transferId });
          await refreshAll({ reloadMessages: true });
        },
      }),
    ));
  }
}

function openProxyModal(networkId) {
  el('proxyNetworkInput').value = networkId;
  el('proxyModalTitle').textContent = `VPN / прокси для ${NETWORK_LABELS[networkId] || networkId}`;
  el('proxyPrimaryInput').value = 'vpn-eu-01 (WireGuard)';
  el('proxyBackupInput').value = 'vpn-nl-backup-02 (VLESS)';
  el('proxyModal')?.showModal();
}

function closeChatMoreBar() {
  const bar = el('chatMoreBar');
  if (bar) bar.hidden = true;
}

// ---------------- Привязка UI ----------------
function bindEvents() {
  // Вкладки левой панели: Чаты / Люди / Ссылки
  for (const btn of document.querySelectorAll('#sidebarMainTabs .smtab')) {
    btn.addEventListener('click', () => setSidebarTab(btn.dataset.sidebarTab));
  }

  // Фильтры списка чатов: Все / Личные / Комнаты / Мосты
  for (const btn of document.querySelectorAll('#chatFilterPills .cfpill')) {
    btn.addEventListener('click', () => {
      state.chatFilter = btn.dataset.chatFilter;
      for (const b of document.querySelectorAll('#chatFilterPills .cfpill')) {
        b.classList.toggle('is-active', b === btn);
      }
      renderChatList();
    });
  }

  // Поиски
  el('chatSearchInput')?.addEventListener('input', (e) => {
    state.searchQuery = e.target.value;
    renderChatList();
  });
  el('peopleSearchInput')?.addEventListener('input', (e) => {
    state.peopleSearchQuery = e.target.value;
    renderPeopleDirectory();
  });
  el('sidebarLinksSearch')?.addEventListener('input', (e) => {
    state.linksSearchQuery = e.target.value;
    renderSidebarLinksHub();
  });

  // Профиль и персональная ссылка
  el('btnEditProfile')?.addEventListener('click', () => openProfileModal());
  el('btnCloseProfile')?.addEventListener('click', () => el('profileModal')?.close());
  el('btnCancelProfile')?.addEventListener('click', () => el('profileModal')?.close());
  el('btnShareMyLink')?.addEventListener('click', () => shareMyPersonalLink());
  el('btnShareMyLinkPeople')?.addEventListener('click', () => shareMyPersonalLink());
  el('btnCopyMyLinkModal')?.addEventListener('click', () => shareMyPersonalLink());

  el('profileForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = el('profileNameInput').value.trim().slice(0, 48);
    const bio = el('profileBioInput').value.trim().slice(0, 80);
    if (!name) return;
    state.displayName = name;
    state.bio = bio;
    state.client.writeProfilePref('ratmes-cloud-display-name', name);
    state.client.writeProfilePref('ratmes-cloud-bio', bio);
    await state.client.call('cloud.setDisplayName', { displayName: name, bio });
    el('profileModal')?.close();
    renderProfileBar();
    renderChatHeader();
    showToast('Профиль обновлён', `Тебя видят как «${name}»`, 'good');
    state.client.syncSupabaseCloud({
      roomId: state.activeChatId || 'games-lobby',
      displayName: state.displayName,
      bio: state.bio,
      country: state.countryProfile?.code || 'RU',
    }).then(() => refreshAll({ reloadMessages: false }));
  });

  // Личный чат 1-на-1 и Избранное
  el('btnNewDmQuick')?.addEventListener('click', () => openDmModal());
  el('btnCloseDmAction')?.addEventListener('click', () => el('dmActionModal')?.close());
  el('dmPeopleSearchInput')?.addEventListener('input', () => renderDmModalPeople());
  el('btnOpenSavedMessages')?.addEventListener('click', () => openSavedMessagesChat());
  el('btnCopyDmMyLink')?.addEventListener('click', () => shareMyPersonalLink());
  el('openDmByCodeForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const val = el('dmTargetCodeInput').value.trim();
    if (!val) return;
    el('dmTargetCodeInput').value = '';
    await handleOpenDmByCode(val);
  });

  // Создание реальной комнаты или вход по ссылке / коду
  const openRoomModal = (focusJoin = false) => {
    el('roomActionModal')?.showModal();
    if (focusJoin) el('joinRoomCodeInput')?.focus();
    else el('newGroupRoomTitle')?.focus();
  };
  el('btnCreateRoomQuick')?.addEventListener('click', () => openRoomModal(false));
  el('btnJoinByCodeOpen')?.addEventListener('click', () => openRoomModal(true));
  el('btnCloseRoomAction')?.addEventListener('click', () => el('roomActionModal')?.close());

  el('createGroupRoomForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const title = el('newGroupRoomTitle').value.trim();
    const desc = el('newGroupRoomDesc').value.trim();
    if (!title) return;
    const res = await state.client.createCloudGroupRoom({ title, description: desc, myName: state.displayName });
    if (!res.ok) {
      showToast('Ошибка создания комнаты', res.error || '', 'error');
      return;
    }
    el('newGroupRoomTitle').value = '';
    el('newGroupRoomDesc').value = '';
    el('roomActionModal')?.close();
    await refreshAll({ reloadMessages: false });
    setSidebarTab('chats');
    await selectChat(res.data.roomId);
    await shareOrCopyUrl(res.data.inviteUrl, `Комната «${title}» в RatMes`, `Заходи в комнату «${title}»`);
  });

  el('joinByCodeForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const code = el('joinRoomCodeInput').value.trim();
    if (!code) return;
    el('joinRoomCodeInput').value = '';
    el('roomActionModal')?.close();
    await handleJoinRoomOrLink(code);
  });

  // Шапка чата и мобильная шторка
  el('btnInviteRoom')?.addEventListener('click', () => shareActiveRoomLink());
  el('btnInviteRoomMobile')?.addEventListener('click', () => { closeChatMoreBar(); shareActiveRoomLink(); });
  el('btnHeaderConnect')?.addEventListener('click', () => openConnectHub(state.activeChat?.network));
  el('btnOpenConnectHub')?.addEventListener('click', () => openConnectHub());
  el('btnOpenConnectHubFromLinks')?.addEventListener('click', () => openConnectHub());
  el('btnOpenConnectHubFromInspector')?.addEventListener('click', () => openConnectHub());

  const triggerCloudSync = async () => {
    const res = await state.client.syncSupabaseCloud({
      roomId: state.activeChatId || 'games-lobby',
      displayName: state.displayName,
      bio: state.bio,
      country: state.countryProfile?.code || 'RU',
    });
    await refreshAll({ reloadMessages: true });
    if (res?.ok) showToast('Обновлено', `Новых сообщений: ${res.data?.ingested || 0}`, 'good');
  };
  el('btnCloudSync')?.addEventListener('click', triggerCloudSync);
  el('btnCloudSyncMobile')?.addEventListener('click', () => { closeChatMoreBar(); triggerCloudSync(); });
  el('btnManualCloudSync')?.addEventListener('click', triggerCloudSync);

  const togglePinChat = async () => {
    if (!state.activeChat) return;
    await state.client.call('workspace.updateChatFlags', {
      chatId: state.activeChat.chatId,
      pinnedChat: !state.activeChat.pinnedChat,
    });
    await refreshAll({ reloadMessages: false });
  };
  el('btnPinChat')?.addEventListener('click', togglePinChat);
  el('btnPinChatMobile')?.addEventListener('click', () => { closeChatMoreBar(); togglePinChat(); });
  el('btnQuickBindVpn')?.addEventListener('click', () => state.activeChat && openProxyModal(state.activeChat.network));

  el('btnBackChats')?.addEventListener('click', () => {
    closeChatMoreBar();
    setMobileChatOpen(false);
  });
  el('btnChatMoreMobile')?.addEventListener('click', () => {
    const bar = el('chatMoreBar');
    if (bar) bar.hidden = !bar.hidden;
  });
  el('btnOpenSearchMobile')?.addEventListener('click', () => { closeChatMoreBar(); el('btnCommandPalette')?.click(); });
  el('btnOpenSettingsMobile')?.addEventListener('click', () => { closeChatMoreBar(); setInspectorOpen(true); });

  // Панель настроек (справа)
  el('btnToggleInspectorTop')?.addEventListener('click', () => setInspectorOpen(!state.inspectorOpen));
  el('btnCloseInspector')?.addEventListener('click', () => setInspectorOpen(false));
  for (const btn of document.querySelectorAll('.inspector-tabs .tab-btn')) {
    btn.addEventListener('click', () => {
      state.activeTab = btn.dataset.tab;
      for (const b of document.querySelectorAll('.inspector-tabs .tab-btn')) b.classList.toggle('active', b === btn);
      for (const p of document.querySelectorAll('.inspector .tab-pane')) p.classList.toggle('active', p.id === `tab-${state.activeTab}`);
      if (state.activeTab === 'networks') refreshP2pPeers();
    });
  }

  // Нижняя мобильная навигация
  for (const btn of document.querySelectorAll('#mobileBottomNav .mnav-btn')) {
    btn.addEventListener('click', () => {
      const target = btn.dataset.mobileNav;
      closeChatMoreBar();
      setMobileChatOpen(false);
      if (target === 'settings') {
        setInspectorOpen(true);
        syncMobileNavActive('settings');
      } else {
        setInspectorOpen(false);
        setSidebarTab(target);
      }
    });
  }

  // Звук
  el('btnMute')?.addEventListener('click', () => {
    const muted = audio.toggleMute();
    el('btnMute').textContent = muted ? '🔇' : '🔊';
  });

  // Поле ввода и отправка
  el('composerForm')?.addEventListener('submit', sendMessage);
  el('messageInput')?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      el('composerForm')?.requestSubmit();
    }
  });
  el('messageInput')?.addEventListener('input', (e) => {
    if (!state.activeChatId) return;
    const val = e.target.value;
    if (state.draftSaveTimer) clearTimeout(state.draftSaveTimer);
    state.draftSaveTimer = setTimeout(() => {
      state.client.call('workspace.setDraft', { chatId: state.activeChatId, text: val });
    }, 280);
  });
  el('btnCancelReply')?.addEventListener('click', () => {
    state.replyTo = null;
    state.editingMessage = null;
    updateReplyBar();
  });

  // Файлы
  el('fileInput')?.addEventListener('change', (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = String(reader.result || '');
      const base64Data = dataUrl.includes(',') ? dataUrl.split(',')[1] : '';
      state.pendingAttachment = {
        name: file.name,
        mimeType: file.type || 'application/octet-stream',
        sizeBytes: file.size || 2048,
        base64Data: file.size <= 3 * 1024 * 1024 ? base64Data : null,
      };
      el('attachmentName').textContent = file.name;
      el('attachmentMeta').textContent = fmtBytes(file.size);
      el('attachmentBar').hidden = false;
    };
    if (file.size <= 3 * 1024 * 1024) reader.readAsDataURL(file);
    else {
      state.pendingAttachment = { name: file.name, mimeType: file.type || 'application/octet-stream', sizeBytes: file.size };
      el('attachmentName').textContent = file.name;
      el('attachmentMeta').textContent = fmtBytes(file.size);
      el('attachmentBar').hidden = false;
    }
  });
  el('btnClearAttachment')?.addEventListener('click', () => {
    state.pendingAttachment = null;
    el('attachmentBar').hidden = true;
    el('fileInput').value = '';
  });

  // Голосовые сообщения
  const voiceRecorder = createVoiceRecorder({
    canvasEl: el('voiceRecCanvas'),
    timerEl: el('voiceRecTimer'),
  });
  el('btnRecordVoice')?.addEventListener('click', async () => {
    if (voiceRecorder.isRecording()) return;
    const res = await voiceRecorder.start();
    if (!res?.started) {
      showToast('Микрофон недоступен', res?.reason || '', 'warn');
      return;
    }
    el('voiceRecordBar').hidden = false;
  });
  el('btnCancelVoice')?.addEventListener('click', () => {
    voiceRecorder.cancel();
    el('voiceRecordBar').hidden = true;
  });
  el('btnStopSendVoice')?.addEventListener('click', async () => {
    const rec = await voiceRecorder.stop();
    el('voiceRecordBar').hidden = true;
    if (!rec) return;
    state.pendingAttachment = {
      name: `voice-${Date.now()}.webm`,
      mimeType: rec.mimeType || 'audio/webm',
      sizeBytes: rec.sizeBytes || 0,
      base64Data: rec.base64,
      isVoice: true,
      durationSec: rec.durationSec,
      waveform: rec.waveform,
    };
    el('composerForm')?.requestSubmit();
  });

  // Пересылка
  el('btnCancelForward')?.addEventListener('click', () => el('forwardModal')?.close());
  el('forwardForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!state.forwardingMessage) return;
    const targetChatId = el('forwardTargetChat').value;
    const targetChat = state.chats.find((c) => c.chatId === targetChatId);
    if (!targetChat) return;
    const res = await state.client.call('pack.forward', {
      fromChatId: state.activeChatId,
      msgIds: [state.forwardingMessage.msgId],
      toChatId: targetChat.chatId,
      toNetwork: targetChat.network,
      hideAuthor: el('chkForwardHideAuthor').checked,
    });
    if (res.ok && res.data.envelopes?.[0]) {
      const hid = res.data.envelopes[0].handleId;
      const pipe = await state.client.pipeline([
        { tool: 'pack.validate', args: { handleId: hid } },
        { tool: 'vault.append', args: { handleId: hid } },
        { tool: 'transfer.enqueue', args: { handleId: hid } },
      ]);
      const tid = pipe.steps?.[2]?.data?.transferId;
      if (tid) await state.client.call('transfer.dispatch', { transferId: tid });
      if (state.client.isCloudRoom(targetChat.chatId)) {
        await state.client.pushSupabaseMessage({
          roomId: targetChat.chatId,
          network: targetChat.network,
          senderName: state.displayName,
          text: `↪ ${state.forwardingMessage.text || 'Вложение'}`,
        });
      }
      el('forwardModal')?.close();
      showToast('Переслано', `В чат ${targetChat.title}`, 'good');
      await refreshAll({ reloadMessages: true });
    }
  });

  // Страна, VPN, Облака, Архив, Защита
  el('countrySelect')?.addEventListener('change', async (e) => {
    await state.client.call('route.setCountry', { countryCode: e.target.value });
    await refreshAll({ reloadMessages: false });
  });
  el('btnCancelProxy')?.addEventListener('click', () => el('proxyModal')?.close());
  el('proxyForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const network = el('proxyNetworkInput').value;
    const primaryRoute = el('proxyPrimaryInput').value.trim();
    const backupRoute = el('proxyBackupInput').value.trim() || null;
    await state.client.call('route.bindProxy', { network, primaryRoute, backupRoute });
    el('proxyModal')?.close();
    showToast('Маршрут VPN сохранён', `${NETWORK_LABELS[network] || network} → ${primaryRoute}`, 'good');
    await refreshAll({ reloadMessages: false });
  });

  el('btnSaveCloudName')?.addEventListener('click', async () => {
    const val = (el('cloudDisplayNameInput')?.value || '').trim().slice(0, 48);
    if (!val) return;
    state.displayName = val;
    state.client.writeProfilePref('ratmes-cloud-display-name', val);
    await state.client.call('cloud.setDisplayName', { displayName: val, bio: state.bio });
    renderProfileBar();
    renderChatHeader();
    showToast('Имя сохранено', val, 'good');
    triggerCloudSync();
  });

  el('btnExportCloudManifest')?.addEventListener('click', async () => {
    const res = await state.client.call('cloud.exportManifest', {});
    if (!res.ok) return;
    const blob = new Blob([JSON.stringify(res.data, null, 2)], { type: 'application/json' });
    const a = h('a', { href: URL.createObjectURL(blob), download: `ratmes-backup-${Date.now()}.json` });
    a.click();
    showToast('Бэкап скачан', `Чатов: ${res.data.chatCount}`, 'good');
  });

  el('btnRefreshP2p')?.addEventListener('click', () => refreshP2pPeers());
  el('btnConnectP2p')?.addEventListener('click', async () => {
    const endpoint = el('p2pEndpointInput').value.trim();
    if (!endpoint) return;
    const res = await state.client.connectP2pPeer(endpoint);
    if (res.ok) {
      el('p2pEndpointInput').value = '';
      showToast('Узел подключён', endpoint, 'good');
      await refreshP2pPeers();
    } else {
      showToast('Не удалось связать', res.error?.message || '', 'warn');
    }
  });

  el('btnExportBundle')?.addEventListener('click', async () => {
    const res = await state.client.call('vault.exportReadable', {});
    if (!res.ok) return;
    const blob = new Blob([JSON.stringify(res.data.files, null, 2)], { type: 'application/json' });
    const a = h('a', { href: URL.createObjectURL(blob), download: `ratmes-vault-${Date.now()}.json` });
    a.click();
    showToast('Архив сохранён', '', 'good');
  });
  el('importBundleInput')?.addEventListener('change', async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const parsed = JSON.parse(await file.text());
      const files = parsed?.files && typeof parsed.files === 'object' ? parsed.files : parsed;
      const res = await state.client.call('vault.importBundle', { files });
      if (res.ok) {
        showToast('Архив импортирован', `Сообщений: ${res.data.importedMessages}`, 'good');
        await refreshAll({ reloadMessages: true });
      }
    } catch {
      showToast('Неверный формат файла', '', 'error');
    }
    e.target.value = '';
  });
  el('btnRebuildIndex')?.addEventListener('click', async () => {
    const res = await state.client.call('search.reindex', {});
    if (res.ok) showToast('Индекс поиска обновлён', `Сообщений: ${res.data.docs}`, 'good');
  });

  el('btnAuditCode')?.addEventListener('click', async () => {
    const res = await state.client.runStaticAudit();
    const box = el('guardAuditResult');
    box.hidden = false;
    box.className = `callout ${res.data?.clean ? 'good' : 'bad'}`;
    box.textContent = res.data?.clean
      ? `✅ Аудит RM-107 чистый: проверено ${res.data.filesScanned} модулей, 0 утечек.`
      : `Найдено нарушений: ${res.data?.violationsCount}`;
  });
  el('btnPumpOutbox')?.addEventListener('click', async () => {
    const res = await state.client.call('transfer.pumpOutbox', { maxPerTick: 20, forceNow: true });
    if (res.ok) {
      showToast('Очередь проверена', `Обработано: ${res.data.processedCount ?? 0}`, 'good');
      await refreshAll({ reloadMessages: true });
    }
  });

  // Центр подключений (Connect Hub)
  el('btnCloseConnectHub')?.addEventListener('click', () => el('connectHubModal')?.close());
  el('hubServiceSearch')?.addEventListener('input', (e) => {
    state.hubSearchQuery = e.target.value;
    renderConnectHub();
  });
  for (const fp of document.querySelectorAll('#hubFilterPills .hub-fpill')) {
    fp.addEventListener('click', () => {
      state.hubFilter = fp.dataset.hubFilter;
      renderConnectHub();
    });
  }
  for (const mt of document.querySelectorAll('#hubMobileTabs .hub-mtab')) {
    mt.addEventListener('click', () => setHubMobileStep(mt.dataset.hubStep));
  }
  el('btnHubToggleTokenVis')?.addEventListener('click', () => {
    const inp = el('hubFormToken');
    if (inp) inp.type = inp.type === 'password' ? 'text' : 'password';
  });
  el('btnHubTestBridge')?.addEventListener('click', testHubBridge);
  el('btnHubSendTestMsg')?.addEventListener('click', sendHubTestMessage);
  el('hubConnectForm')?.addEventListener('submit', saveHubBridge);
  el('btnHubDisableBridge')?.addEventListener('click', async () => {
    const net = el('hubFormNetwork').value;
    await state.client.disableLiveBridge(net);
    showToast('Мост отключён', net.toUpperCase(), 'info');
    await refreshAll({ reloadMessages: false });
    renderConnectHub();
  });
  el('btnCopyAgentCmd')?.addEventListener('click', async () => {
    const cmd = el('hubAgentCmdCode').textContent || '';
    try { await navigator.clipboard.writeText(cmd); showToast('Команда скопирована', cmd, 'good'); } catch { /* ignore */ }
  });
  el('btnCopyHubWebhook')?.addEventListener('click', async () => {
    const url = el('hubWebhookUrl').textContent || '';
    try { await navigator.clipboard.writeText(url); showToast('Webhook URL скопирован', url, 'good'); } catch { /* ignore */ }
  });
  el('btnConnectRemoteAgent')?.addEventListener('click', async () => {
    const url = el('hubRemoteAgentInput').value.trim();
    const res = await state.client.setRemoteAgentUrl(url);
    if (res.ok) {
      showToast('ПК-агент подключён!', res.data.base, 'good');
      await refreshAll({ reloadMessages: true });
      renderConnectHub();
    } else {
      showToast('Агент не ответил', res.error?.message || '', 'error');
    }
  });
  el('btnDisconnectRemoteAgent')?.addEventListener('click', async () => {
    await state.client.clearRemoteAgentUrl();
    el('hubRemoteAgentInput').value = '';
    showToast('Переключено в браузерный режим', '', 'info');
    await refreshAll({ reloadMessages: true });
    renderConnectHub();
  });

  // Командная палитра (Ctrl+K)
  const palette = createCommandPalette({
    dialogEl: el('paletteModal'),
    inputEl: el('paletteInput'),
    resultsEl: el('paletteResults'),
    onSearchQuery: (q) => state.client.call('search.query', { query: q, limit: 25 }),
    onSelectHit: async (hit) => {
      await selectChat(hit.chatId);
      const node = document.querySelector(`[data-msg-id="${CSS.escape(hit.msgId)}"]`);
      if (node) {
        node.scrollIntoView({ behavior: 'smooth', block: 'center' });
        node.classList.add('highlight');
        setTimeout(() => node.classList.remove('highlight'), 1400);
      }
    },
    getQuickCommands: () => [
      { icon: '👤', label: 'Новый личный чат 1-на-1', hint: 'Написать собеседнику или открыть Избранное', run: () => openDmModal() },
      { icon: '⭐', label: 'Открыть Избранное', hint: 'Личные заметки для себя', run: () => openSavedMessagesChat() },
      { icon: '👥', label: 'Открыть каталог людей', hint: 'Написать в личку 1-на-1', run: () => setSidebarTab('people') },
      { icon: '🔗', label: 'Скопировать мою ссылку', hint: 'Пригласить друга', run: () => shareMyPersonalLink() },
      { icon: '➕', label: 'Создать комнату для друзей', hint: 'Комната по ссылке', run: () => openRoomModal(false) },
      { icon: '🔌', label: 'Центр подключений', hint: 'MAX, Telegram, VK, Discord…', run: () => openConnectHub() },
      { icon: '⚙️', label: 'Настройки, облака и архив', hint: '9 облаков · VPN · файлы', run: () => setInspectorOpen(true) },
    ],
  });
  el('btnCommandPalette')?.addEventListener('click', () => palette.open());
}

let cloudBannerHideTimer = null;

function updateCloudProgressUI({ phase = 'connecting', percent = 10, label = 'Подключение к облаку…', rttMs = null, onlineCount = null, silent = false } = {}) {
  const banner = el('cloudProgressBanner');
  const fill = el('cloudProgressFill');
  const track = el('cloudProgressTrack');
  const lbl = el('cloudProgressLabel');
  const meta = el('cloudProgressMeta');
  const retry = el('btnCloudRetry');
  const modeLabel = el('connectionModeLabel');
  const accCtx = state.client?.getAccountContext?.();

  // Обновляем постоянный статус под логотипом RatMes
  if (modeLabel) {
    const suffix = accCtx?.isSecondary ? ` · ${accCtx.label}` : '';
    if (phase === 'ready') {
      modeLabel.textContent = `🟢 Облако${rttMs ? ` · ${rttMs} мс` : ''}${suffix}`;
    } else if (phase === 'error') {
      modeLabel.textContent = `🟠 Нет связи с облаком${suffix}`;
    } else if (!silent) {
      modeLabel.textContent = `${label} (${percent}%)`;
    }
  }

  if (!banner) return;

  // Фоновая тихая синхронизация каждые 3 сек не разворачивает баннер, если уже подключено и нет ошибки
  if (silent && phase !== 'error' && banner.classList.contains('is-compact')) {
    return;
  }

  if (cloudBannerHideTimer) {
    clearTimeout(cloudBannerHideTimer);
    cloudBannerHideTimer = null;
  }

  const clamped = Math.max(4, Math.min(100, Number(percent) || 0));
  if (fill) fill.style.width = `${clamped}%`;
  if (track) track.setAttribute('aria-valuenow', String(clamped));
  if (lbl) lbl.textContent = label;
  if (meta) {
    if (phase === 'ready') {
      meta.textContent = rttMs ? `${rttMs} мс · 100%` : '100%';
    } else if (phase === 'error') {
      meta.textContent = 'Ошибка';
    } else {
      meta.textContent = `${clamped}%`;
    }
  }
  if (retry) retry.hidden = phase !== 'error';

  banner.classList.remove('is-loading', 'is-ready', 'is-error', 'is-compact');
  if (phase === 'ready') {
    banner.classList.add('is-ready');
    cloudBannerHideTimer = setTimeout(() => {
      banner.classList.add('is-compact');
    }, 800);
  } else if (phase === 'error') {
    banner.classList.add('is-error');
  } else {
    banner.classList.add('is-loading');
  }
}

// ---------------- Старт приложения ----------------
async function bootstrap() {
  updateCloudProgressUI({ phase: 'connecting', percent: 15, label: 'Запуск RatMes…' });
  state.client = await createBridgeClient();
  const accCtx = state.client.getAccountContext();
  state.displayName = state.client.readProfilePref('ratmes-cloud-display-name', '').trim() || accCtx.defaultDisplayName;
  state.bio = state.client.readProfilePref('ratmes-cloud-bio', '').trim();
  if (accCtx.isSecondary) {
    document.title = `RatMes · ${accCtx.label}`;
  }

  await state.client.call('cloud.setDisplayName', { displayName: state.displayName, bio: state.bio });

  state.client.onEvent((evt) => {
    if (evt?.event === 'cloud.progress' && evt.data) {
      updateCloudProgressUI(evt.data);
      return;
    }
    if (evt?.event === 'transfer.received' || evt?.event === 'cloud.messages') {
      audio.received();
    }
    scheduleRefresh();
  });

  bindEvents();

  el('btnCloudRetry')?.addEventListener('click', () => {
    updateCloudProgressUI({ phase: 'connecting', percent: 20, label: 'Повторное подключение к облаку…' });
    state.client.syncSupabaseCloud({
      roomId: state.activeChatId || 'games-lobby',
      displayName: state.displayName,
      bio: state.bio,
      country: state.countryProfile?.code || 'RU',
      silent: false,
    }).then(() => refreshAll({ reloadMessages: true }));
  });
  el('cloudProgressBanner')?.addEventListener('click', (e) => {
    if (e.target.closest('button')) return;
    if (el('cloudProgressBanner')?.classList.contains('is-compact')) {
      el('btnCloudSync')?.click();
    }
  });

  // Сразу показываем интерфейс, пока бежит полоса подключения к облаку
  await refreshAll({ reloadMessages: true });

  // Первый живой коннект к Supabase с видимой полосой прогресса (25% -> 55% -> 82% -> 100%)
  await state.client.syncSupabaseCloud({
    roomId: 'games-lobby',
    displayName: state.displayName,
    bio: state.bio,
    country: 'RU',
    silent: false,
  }).catch(() => {});

  await refreshAll({ reloadMessages: true });

  // Обработка входящих URL-ссылок (?dm=..., ?join=..., ?room=..., ?connect=...)
  const params = new URLSearchParams(location.search);
  const dmParam = params.get('dm');
  const dmNameParam = params.get('name') || '';
  const joinParam = params.get('join');
  const roomParam = params.get('room');
  const connectParam = params.get('connect');

  if (dmParam) {
    await openDirectChatWithPeer(dmParam, dmNameParam || 'Собеседник');
  } else if (joinParam) {
    await handleJoinRoomOrLink(joinParam);
  } else if (roomParam && state.chats.some((c) => c.chatId === roomParam)) {
    await selectChat(roomParam);
  } else if (state.activeChatId) {
    await selectChat(state.activeChatId);
  }

  if (connectParam) {
    setTimeout(() => openConnectHub(connectParam === '1' || connectParam === 'hub' ? 'max' : connectParam), 160);
  }

  // Слушаем команды от портала Games (если открыто во вкладке «Общение»)
  window.addEventListener('message', (ev) => {
    const data = ev?.data;
    if (!data || typeof data !== 'object') return;
    if (data.type === 'ratmes:openConnectHub') {
      openConnectHub(data.service || 'max');
    } else if (data.type === 'ratmes:selectRoom' && data.room) {
      selectChat(data.room);
    }
  });

  // Живая автосинхронизация с Supabase каждые 3 секунды!
  state.client.startCloudAutoSync(() => ({
    roomId: state.activeChatId || 'games-lobby',
    displayName: state.displayName,
    bio: state.bio,
    country: state.countryProfile?.code || 'RU',
  }));

  if ('serviceWorker' in navigator && location.protocol !== 'file:') {
    navigator.serviceWorker.register('./sw.js?v=15').then((reg) => {
      reg.update().catch(() => {});
    }).catch(() => {});
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      try {
        if (!sessionStorage.getItem('ratmes-sw-reloaded-v15')) {
          sessionStorage.setItem('ratmes-sw-reloaded-v15', '1');
          location.reload();
        }
      } catch { /* ignore */ }
    });
  }
}

bootstrap().catch((err) => {
  const msg = String(err?.message || err);
  updateCloudProgressUI({ phase: 'error', percent: 100, label: `Ошибка запуска: ${msg}` });
  showToast('Ошибка запуска', msg, 'error');
});
