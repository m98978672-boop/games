// Слой пользовательских возможностей мессенджера:
// папки чатов, черновики, счётчики непрочитанных, закреплённые сообщения, реакции, история правок,
// объединённые контакты (один человек в разных мессенджерах) и телеметрия.

export const DEFAULT_FOLDERS = Object.freeze([
  { id: 'all', name: 'Все чаты', icon: '💬', system: true },
  { id: 'direct', name: 'Напрямую', icon: '⚡', system: true },
  { id: 'vpn', name: 'Через VPN', icon: '🛡️', system: true },
  { id: 'pinned', name: 'Закреплённые', icon: '📌', system: true },
]);

export const QUICK_REACTIONS = Object.freeze(['👍', '🔥', '❤️', '😂', '👀', '⚡']);

export class WorkspaceFeaturesStore {
  constructor() {
    this.folders = new Map(); // id -> { id, name, icon, system, chatIds: Set }
    for (const f of DEFAULT_FOLDERS) {
      this.folders.set(f.id, { ...f, chatIds: new Set() });
    }

    this.chatSettings = new Map(); // chatId -> { pinnedChat, muted, archived, lastReadSeq, draftText, draftReplyTo }
    this.pinnedMessages = new Map(); // chatId -> Array<msgId>
    this.reactions = new Map(); // msgId -> Map<emoji, Set<actorId>>
    this.editHistory = new Map(); // msgId -> Array<{ text, editedAt }>
    this.contacts = new Map(); // contactId -> { contactId, displayName, note, handles: Array<{ network, handle, chatId }> }

    // Стартовый пример объединённого контакта (1 человек в 3 сетях сразу!)
    this.upsertContact({
      contactId: 'contact-alexey',
      displayName: 'Алексей (Команда)',
      note: 'Основной контакт: в РФ лучше VK или родной RatMes E2EE',
      handles: [
        { network: 'ratmes', handle: '@alexey_rm', chatId: 'ratmes-main' },
        { network: 'vk', handle: 'id104291', chatId: 'vk-friends' },
        { network: 'telegram', handle: '@alexey_dev', chatId: 'tg-dev' },
      ],
    });
  }

  _ensureChatSettings(chatId) {
    let s = this.chatSettings.get(chatId);
    if (!s) {
      s = {
        chatId,
        pinnedChat: false,
        muted: false,
        archived: false,
        lastReadSeq: 0,
        draftText: '',
        draftReplyTo: null,
        updatedAt: Date.now(),
      };
      this.chatSettings.set(chatId, s);
    }
    return s;
  }

  // --- Папки ---
  createFolder({ id, name, icon = '📁', chatIds = [] }) {
    const slug = id || `fld-${String(name || 'folder').toLowerCase().replace(/[^a-zа-я0-9]+/g, '-').slice(0, 24)}-${this.folders.size + 1}`;
    const folder = { id: slug, name: String(name || 'Папка').trim(), icon, system: false, chatIds: new Set(chatIds) };
    this.folders.set(slug, folder);
    return this._serializeFolder(folder);
  }

  assignChatToFolder(folderId, chatId, included = true) {
    const f = this.folders.get(folderId);
    if (!f || f.system) return null;
    if (included) f.chatIds.add(chatId);
    else f.chatIds.delete(chatId);
    return this._serializeFolder(f);
  }

  listFolders() {
    return Array.from(this.folders.values()).map((f) => this._serializeFolder(f));
  }

  _serializeFolder(f) {
    return { id: f.id, name: f.name, icon: f.icon, system: f.system, chatIds: Array.from(f.chatIds) };
  }

  // --- Черновики, Непрочитанные, Закрепление чата ---
  setDraft(chatId, { text = '', replyTo = null }) {
    const s = this._ensureChatSettings(chatId);
    s.draftText = String(text || '');
    s.draftReplyTo = replyTo || null;
    s.updatedAt = Date.now();
    return { ...s };
  }

  getDraft(chatId) {
    const s = this._ensureChatSettings(chatId);
    return { chatId, text: s.draftText, replyTo: s.draftReplyTo };
  }

  markRead(chatId, seq) {
    const s = this._ensureChatSettings(chatId);
    s.lastReadSeq = Math.max(s.lastReadSeq, Number(seq || 0));
    s.updatedAt = Date.now();
    return { chatId, lastReadSeq: s.lastReadSeq };
  }

  getUnreadCount(chatId, latestSeq) {
    const s = this._ensureChatSettings(chatId);
    return Math.max(0, Number(latestSeq || 0) - s.lastReadSeq);
  }

  updateChatFlags(chatId, patch = {}) {
    const s = this._ensureChatSettings(chatId);
    if (typeof patch.pinnedChat === 'boolean') s.pinnedChat = patch.pinnedChat;
    if (typeof patch.muted === 'boolean') s.muted = patch.muted;
    if (typeof patch.archived === 'boolean') s.archived = patch.archived;
    s.updatedAt = Date.now();
    return { ...s };
  }

  getChatMeta(chatId, latestSeq = 0) {
    const s = this._ensureChatSettings(chatId);
    return {
      ...s,
      unreadCount: this.getUnreadCount(chatId, latestSeq),
      pinnedMessageIds: [...(this.pinnedMessages.get(chatId) || [])],
    };
  }

  // --- Закреплённые сообщения ---
  togglePinMessage(chatId, msgId) {
    let list = this.pinnedMessages.get(chatId);
    if (!list) {
      list = [];
      this.pinnedMessages.set(chatId, list);
    }
    const idx = list.indexOf(msgId);
    let pinned;
    if (idx !== -1) {
      list.splice(idx, 1);
      pinned = false;
    } else {
      list.push(msgId);
      pinned = true;
    }
    return { chatId, msgId, pinned, pinnedMessageIds: [...list] };
  }

  getAllPinnedMessageIds() {
    const set = new Set();
    for (const list of this.pinnedMessages.values()) {
      for (const id of list) set.add(id);
    }
    return set;
  }

  // --- Реакции ---
  toggleReaction(msgId, emoji, actorId = 'owner') {
    let byEmoji = this.reactions.get(msgId);
    if (!byEmoji) {
      byEmoji = new Map();
      this.reactions.set(msgId, byEmoji);
    }
    let actors = byEmoji.get(emoji);
    if (!actors) {
      actors = new Set();
      byEmoji.set(emoji, actors);
    }
    let added;
    if (actors.has(actorId)) {
      actors.delete(actorId);
      added = false;
      if (actors.size === 0) byEmoji.delete(emoji);
    } else {
      actors.add(actorId);
      added = true;
    }
    return { msgId, emoji, added, summary: this.getReactionsForMessage(msgId) };
  }

  getReactionsForMessage(msgId) {
    const byEmoji = this.reactions.get(msgId);
    if (!byEmoji) return [];
    return Array.from(byEmoji.entries()).map(([emoji, set]) => ({
      emoji,
      count: set.size,
      actors: Array.from(set),
    }));
  }

  // --- История правок ---
  recordEdit(msgId, previousText) {
    let hist = this.editHistory.get(msgId);
    if (!hist) {
      hist = [];
      this.editHistory.set(msgId, hist);
    }
    hist.push({ text: previousText, editedAt: Date.now() });
    return [...hist];
  }

  getEditHistory(msgId) {
    return [...(this.editHistory.get(msgId) || [])];
  }

  // --- Единая адресная книга контактов ---
  upsertContact({ contactId, displayName, note = '', handles = [] }) {
    const id = contactId || `cnt-${Date.now().toString(36)}-${this.contacts.size + 1}`;
    const rec = {
      contactId: id,
      displayName: String(displayName || 'Контакт').trim(),
      note: String(note || ''),
      handles: handles.map((h) => ({ network: h.network, handle: h.handle, chatId: h.chatId || null })),
      updatedAt: Date.now(),
    };
    this.contacts.set(id, rec);
    return rec;
  }

  listContacts() {
    return Array.from(this.contacts.values());
  }

  // Полная сериализация для сохранения в RatMes-Vault/meta/workspace.json
  exportState() {
    const reactionsObj = {};
    for (const [msgId, map] of this.reactions.entries()) {
      reactionsObj[msgId] = Object.fromEntries(Array.from(map.entries()).map(([e, s]) => [e, Array.from(s)]));
    }
    return {
      folders: this.listFolders(),
      chatSettings: Object.fromEntries(this.chatSettings.entries()),
      pinnedMessages: Object.fromEntries(this.pinnedMessages.entries()),
      reactions: reactionsObj,
      editHistory: Object.fromEntries(this.editHistory.entries()),
      contacts: this.listContacts(),
    };
  }

  importState(data) {
    if (!data || typeof data !== 'object') return;
    if (Array.isArray(data.folders)) {
      for (const f of data.folders) {
        if (!f.system) this.folders.set(f.id, { ...f, chatIds: new Set(f.chatIds || []) });
      }
    }
    if (data.chatSettings) {
      for (const [k, v] of Object.entries(data.chatSettings)) this.chatSettings.set(k, v);
    }
    if (data.pinnedMessages) {
      for (const [k, v] of Object.entries(data.pinnedMessages)) this.pinnedMessages.set(k, [...v]);
    }
    if (data.reactions) {
      for (const [msgId, obj] of Object.entries(data.reactions)) {
        const m = new Map();
        for (const [emoji, actors] of Object.entries(obj)) m.set(emoji, new Set(actors));
        this.reactions.set(msgId, m);
      }
    }
    if (data.editHistory) {
      for (const [msgId, arr] of Object.entries(data.editHistory)) this.editHistory.set(msgId, [...arr]);
    }
    if (Array.isArray(data.contacts)) {
      for (const c of data.contacts) this.contacts.set(c.contactId, c);
    }
  }
}
