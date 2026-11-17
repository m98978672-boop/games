// Вечный файловый резерв RatMes-Vault/ (обычные папки, .jsonl + читаемый человеком .txt + media/ + outbox/).
// Поддерживает два идентичных по контракту бэкенда:
// 1. NodeDiskVault — настоящие файлы на диске с краш-безопасной записью tmp -> fsync -> close -> rename -> fsync(dir)
//    + append-only .jsonl + автолечение битого хвоста (healTail) + полная пересборка индекса из файлов (rebuildIndex).
// 2. MemoryVault — автономный режим для браузера/PWA (с опциональным сохранением в localStorage).

import { fnv1aHex } from '../core/ratcore-app.mjs';

function sanitizeSeg(value) {
  return String(value || 'unknown').replace(/[^a-zA-Z0-9._-]+/g, '_').slice(0, 80) || 'unknown';
}

function formatReadableLine(msg) {
  const iso = new Date(msg.ts || Date.now()).toISOString().replace('T', ' ').slice(0, 19);
  const dir = msg.direction === 'out' ? 'Я' : (msg.senderName || msg.senderId || 'Собеседник');
  const status = msg.status ? ` [${msg.status}]` : '';
  const att = msg.attachment ? ` <файл: ${msg.attachment.filename} (${msg.attachment.sizeBytes} Б)>` : '';
  const reply = msg.replyTo ? ` (ответ на ${msg.replyTo.slice(0, 10)})` : '';
  const deleted = msg.deleted ? ' [удалено]' : '';
  return `[${iso}] ${dir}${reply}${status}: ${msg.text || ''}${att}${deleted}\n`;
}

// ---------- Бэкенд 1: Настоящая папка RatMes-Vault/ на диске (Node.js) ----------
export async function createNodeDiskVault(vaultDir) {
  const fs = await import('node:fs');
  const path = await import('node:path');

  const root = path.resolve(vaultDir);
  fs.mkdirSync(path.join(root, 'chats'), { recursive: true });
  fs.mkdirSync(path.join(root, 'media'), { recursive: true });
  fs.mkdirSync(path.join(root, 'outbox'), { recursive: true });
  fs.mkdirSync(path.join(root, 'meta'), { recursive: true });

  // Индекс в памяти (эквивалент быстрого SQLite WAL-индекса: <5 мс чтение, полностью пересобирается из файлов!)
  const indexByChat = new Map();
  const chatsMeta = new Map();
  const outboxMap = new Map();
  const mediaIndex = new Map(); // sha256 -> relativePath

  // Краш-безопасная атомарная запись: tmp -> fsync(tmp) -> close -> rename -> fsync(parentDir)
  function atomicWriteBytes(targetPath, dataBytes) {
    const dir = path.dirname(targetPath);
    fs.mkdirSync(dir, { recursive: true });
    const tmpPath = `${targetPath}.${process.pid}.${Date.now()}.tmp`;
    const fd = fs.openSync(tmpPath, 'w');
    try {
      const buf = Buffer.isBuffer(dataBytes) ? dataBytes : Buffer.from(dataBytes);
      fs.writeSync(fd, buf, 0, buf.length, 0);
      fs.fsyncSync(fd);
    } finally {
      fs.closeSync(fd);
    }
    fs.renameSync(tmpPath, targetPath);
    try {
      const dirFd = fs.openSync(dir, 'r');
      try { fs.fsyncSync(dirFd); } finally { fs.closeSync(dirFd); }
    } catch {
      // На некоторых ФС fsync директории не поддерживается — rename уже атомарен
    }
  }

  function appendLineDurable(filePath, lineStr) {
    const dir = path.dirname(filePath);
    fs.mkdirSync(dir, { recursive: true });
    const fd = fs.openSync(filePath, 'a');
    try {
      const buf = Buffer.from(lineStr, 'utf8');
      fs.writeSync(fd, buf, 0, buf.length);
      fs.fsyncSync(fd);
    } finally {
      fs.closeSync(fd);
    }
  }

  function chatDir(network, chatId) {
    return path.join(root, 'chats', sanitizeSeg(network), sanitizeSeg(chatId));
  }

  function persistManifest() {
    const manifest = {
      schema: 'ratmes-vault/1',
      updatedAt: new Date().toISOString(),
      chats: Array.from(chatsMeta.values()),
      outboxPending: outboxMap.size,
      mediaFiles: mediaIndex.size,
    };
    const checksum = fnv1aHex(manifest);
    atomicWriteBytes(path.join(root, 'meta', 'manifest.json'), JSON.stringify({ ...manifest, checksum }, null, 2));
  }

  function persistOutboxFile() {
    const lines = Array.from(outboxMap.values()).map((o) => JSON.stringify(o)).join('\n');
    atomicWriteBytes(path.join(root, 'outbox', 'pending.jsonl'), lines ? `${lines}\n` : '');
  }

  function rebuildIndex() {
    const started = performance.now();
    indexByChat.clear();
    chatsMeta.clear();
    let messagesIndexed = 0;

    const chatsRoot = path.join(root, 'chats');
    if (fs.existsSync(chatsRoot)) {
      for (const netEntry of fs.readdirSync(chatsRoot, { withFileTypes: true })) {
        if (!netEntry.isDirectory()) continue;
        const netDir = path.join(chatsRoot, netEntry.name);
        for (const cEntry of fs.readdirSync(netDir, { withFileTypes: true })) {
          if (!cEntry.isDirectory()) continue;
          const jsonlPath = path.join(netDir, cEntry.name, 'messages.jsonl');
          if (!fs.existsSync(jsonlPath)) continue;
          const raw = fs.readFileSync(jsonlPath, 'utf8');
          const list = [];
          const byId = new Map();
          for (const line of raw.split('\n')) {
            if (!line.trim()) continue;
            try {
              const parsed = JSON.parse(line);
              if (parsed.eventType === 'patch' && parsed.msgId && byId.has(parsed.msgId)) {
                Object.assign(byId.get(parsed.msgId), parsed.patch);
              } else if (parsed.msgId) {
                if (byId.has(parsed.msgId)) {
                  Object.assign(byId.get(parsed.msgId), parsed);
                } else {
                  byId.set(parsed.msgId, parsed);
                  list.push(parsed);
                  messagesIndexed += 1;
                }
              }
            } catch {
              // Битый хвост будет вылечен healTail()
            }
          }
          const last = list[list.length - 1];
          const chatId = last?.chatId || cEntry.name;
          const network = last?.network || netEntry.name;
          indexByChat.set(chatId, list);
          chatsMeta.set(chatId, {
            chatId,
            network,
            title: last?.chatTitle || chatId,
            messageCount: list.length,
            lastTs: last?.ts || 0,
            lastSeq: last?.seq || list.length,
          });
        }
      }
    }

    // Восстанавливаем Outbox
    outboxMap.clear();
    const outboxPath = path.join(root, 'outbox', 'pending.jsonl');
    if (fs.existsSync(outboxPath)) {
      const raw = fs.readFileSync(outboxPath, 'utf8');
      for (const line of raw.split('\n')) {
        if (!line.trim()) continue;
        try {
          const item = JSON.parse(line);
          if (item.transferId) outboxMap.set(item.transferId, item);
        } catch { /* ignore */ }
      }
    }

    // Сканируем медиа-файлы
    mediaIndex.clear();
    const mediaRoot = path.join(root, 'media');
    if (fs.existsSync(mediaRoot)) {
      for (const cEntry of fs.readdirSync(mediaRoot, { withFileTypes: true })) {
        if (!cEntry.isDirectory()) continue;
        const cDir = path.join(mediaRoot, cEntry.name);
        for (const fEntry of fs.readdirSync(cDir, { withFileTypes: true })) {
          if (!fEntry.isFile() || fEntry.name.endsWith('.tmp')) continue;
          const prefix = fEntry.name.split('_')[0];
          const rel = path.relative(root, path.join(cDir, fEntry.name)).replace(/\\/g, '/');
          mediaIndex.set(prefix, rel);
        }
      }
    }

    persistManifest();
    return { messagesIndexed, chatsCount: indexByChat.size, durationMs: Number((performance.now() - started).toFixed(3)) };
  }

  // Первичное чтение существующего архива при старте
  rebuildIndex();

  return {
    backend: 'node-disk',
    rootDir: root,

    appendMessage(msg) {
      const dir = chatDir(msg.network, msg.chatId);
      const jsonlPath = path.join(dir, 'messages.jsonl');
      const txtPath = path.join(dir, 'readable.txt');

      appendLineDurable(jsonlPath, `${JSON.stringify(msg)}\n`);
      appendLineDurable(txtPath, formatReadableLine(msg));

      let list = indexByChat.get(msg.chatId);
      if (!list) {
        list = [];
        indexByChat.set(msg.chatId, list);
      }
      const existing = list.find((m) => m.msgId === msg.msgId);
      if (existing) Object.assign(existing, msg);
      else list.push(msg);

      chatsMeta.set(msg.chatId, {
        chatId: msg.chatId,
        network: msg.network,
        title: msg.chatTitle || chatsMeta.get(msg.chatId)?.title || msg.chatId,
        messageCount: list.length,
        lastTs: msg.ts,
        lastSeq: msg.seq || list.length,
      });
      persistManifest();

      return {
        vaultOffset: list.length,
        jsonlRel: path.relative(root, jsonlPath).replace(/\\/g, '/'),
        txtRel: path.relative(root, txtPath).replace(/\\/g, '/'),
        txtUpdated: true,
      };
    },

    patchMessage(network, chatId, msgId, patch) {
      const dir = chatDir(network, chatId);
      const jsonlPath = path.join(dir, 'messages.jsonl');
      appendLineDurable(jsonlPath, `${JSON.stringify({ eventType: 'patch', msgId, patch, ts: Date.now() })}\n`);
      const list = indexByChat.get(chatId) || [];
      const found = list.find((m) => m.msgId === msgId);
      if (found) Object.assign(found, patch);
      // Пересинхронизация readable.txt при обновлении статуса/удалении
      const txtPath = path.join(dir, 'readable.txt');
      atomicWriteBytes(txtPath, list.map(formatReadableLine).join(''));
      return Boolean(found);
    },

    storeMedia({ chatId, filename, bytes, sha256 }) {
      const keyPrefix = String(sha256).slice(0, 16);
      if (mediaIndex.has(keyPrefix)) {
        return { relativePath: mediaIndex.get(keyPrefix), sha256, deduplicated: true };
      }
      const safeName = sanitizeSeg(filename);
      const rel = `media/${sanitizeSeg(chatId)}/${keyPrefix}_${safeName}`;
      const full = path.join(root, rel);
      atomicWriteBytes(full, bytes);
      mediaIndex.set(keyPrefix, rel);
      persistManifest();
      return { relativePath: rel, sha256, deduplicated: false };
    },

    readMediaBytes(relativePath) {
      const full = path.resolve(root, relativePath);
      if (!full.startsWith(root)) return null;
      if (!fs.existsSync(full)) return null;
      return new Uint8Array(fs.readFileSync(full));
    },

    upsertOutbox(record) {
      outboxMap.set(record.transferId, record);
      persistOutboxFile();
      persistManifest();
    },

    removeOutbox(transferId) {
      outboxMap.delete(transferId);
      persistOutboxFile();
      persistManifest();
    },

    listOutbox() {
      return Array.from(outboxMap.values());
    },

    readPage(chatId, { limit = 50, beforeSeq = null } = {}) {
      const list = indexByChat.get(chatId) || [];
      const filtered = beforeSeq ? list.filter((m) => (m.seq || 0) < beforeSeq) : list;
      const slice = filtered.slice(-limit);
      return { messages: slice.map((m) => ({ ...m })), hasMore: filtered.length > slice.length, total: list.length };
    },

    listChats() {
      return Array.from(chatsMeta.values()).sort((a, b) => b.lastTs - a.lastTs);
    },

    // Лечение битого хвоста .jsonl после внезапного выключения питания (RM-201)
    healTail() {
      const chatsRoot = path.join(root, 'chats');
      let filesChecked = 0;
      let tailsHealed = 0;
      const healedFiles = [];

      if (fs.existsSync(chatsRoot)) {
        for (const netEntry of fs.readdirSync(chatsRoot, { withFileTypes: true })) {
          if (!netEntry.isDirectory()) continue;
          const netDir = path.join(chatsRoot, netEntry.name);
          for (const cEntry of fs.readdirSync(netDir, { withFileTypes: true })) {
            if (!cEntry.isDirectory()) continue;
            const jsonlPath = path.join(netDir, cEntry.name, 'messages.jsonl');
            if (!fs.existsSync(jsonlPath)) continue;
            filesChecked += 1;
            const raw = fs.readFileSync(jsonlPath, 'utf8');
            const lines = raw.split('\n');
            const validLines = [];
            let broken = false;
            for (const line of lines) {
              if (!line.trim()) continue;
              try {
                JSON.parse(line);
                validLines.push(line);
              } catch {
                broken = true;
              }
            }
            if (broken) {
              tailsHealed += 1;
              atomicWriteBytes(jsonlPath, validLines.length ? `${validLines.join('\n')}\n` : '');
              healedFiles.push(path.relative(root, jsonlPath).replace(/\\/g, '/'));
            }
          }
        }
      }
      if (tailsHealed > 0) rebuildIndex();
      return { filesChecked, tailsHealed, healedFiles };
    },

    rebuildIndex,

    verifyIntegrity() {
      const damagedFiles = [];
      const manifestPath = path.join(root, 'meta', 'manifest.json');
      if (fs.existsSync(manifestPath)) {
        try {
          const parsed = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
          const { checksum, ...rest } = parsed;
          if (fnv1aHex(rest) !== checksum) damagedFiles.push('meta/manifest.json');
        } catch {
          damagedFiles.push('meta/manifest.json');
        }
      }
      return { clean: damagedFiles.length === 0, damagedFiles };
    },

    listPlainFiles() {
      const out = [];
      function walk(dir) {
        if (!fs.existsSync(dir)) return;
        for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
          const full = path.join(dir, e.name);
          if (e.isDirectory()) walk(full);
          else if (!e.name.endsWith('.tmp')) {
            const st = fs.statSync(full);
            out.push({
              path: path.relative(root, full).replace(/\\/g, '/'),
              sizeBytes: st.size,
              updatedAt: st.mtime.toISOString(),
            });
          }
        }
      }
      walk(root);
      return out.sort((a, b) => a.path.localeCompare(b.path));
    },

    readPlainTextFile(relPath) {
      const full = path.resolve(root, relPath);
      if (!full.startsWith(root) || !fs.existsSync(full)) return null;
      return fs.readFileSync(full, 'utf8');
    },

    exportAllReadable() {
      const out = {};
      for (const f of this.listPlainFiles()) {
        if (f.path.endsWith('.txt') || f.path.endsWith('.jsonl') || f.path.endsWith('.json')) {
          out[f.path] = this.readPlainTextFile(f.path);
        }
      }
      return out;
    },

    getMessageById(chatId, msgId) {
      const list = indexByChat.get(chatId) || [];
      const found = list.find((m) => m.msgId === msgId);
      return found ? { ...found } : null;
    },

    saveWorkspaceState(stateObj) {
      atomicWriteBytes(path.join(root, 'meta', 'workspace.json'), JSON.stringify(stateObj, null, 2));
      return true;
    },

    loadWorkspaceState() {
      const p = path.join(root, 'meta', 'workspace.json');
      if (!fs.existsSync(p)) return null;
      try { return JSON.parse(fs.readFileSync(p, 'utf8')); } catch { return null; }
    },
  };
}

// ---------- Бэкенд 2: Автономный Memory/Browser Vault (работает без сервера в браузере и тестах) ----------
export function createMemoryVault({ storageKey = null, storage = null } = {}) {
  const indexByChat = new Map();
  const chatsMeta = new Map();
  const jsonlFiles = new Map();
  const txtFiles = new Map();
  const mediaFiles = new Map(); // relPath -> Uint8Array
  const mediaHashIndex = new Map(); // sha256Prefix -> relPath
  const outboxMap = new Map();
  let workspaceSnapshot = null;

  function getBackingStorage() {
    if (storage) return storage;
    return typeof globalThis.localStorage !== 'undefined' ? globalThis.localStorage : null;
  }

  function loadLocalStorage() {
    const store = getBackingStorage();
    if (!storageKey || !store) return;
    try {
      const raw = store.getItem(storageKey);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      for (const [k, v] of Object.entries(parsed.jsonlFiles || {})) jsonlFiles.set(k, v);
      for (const [k, v] of Object.entries(parsed.txtFiles || {})) txtFiles.set(k, v);
      for (const item of parsed.outbox || []) outboxMap.set(item.transferId, item);
      if (parsed.workspace) workspaceSnapshot = parsed.workspace;
      rebuildIndex();
    } catch { /* ignore */ }
  }

  function saveLocalStorage() {
    const store = getBackingStorage();
    if (!storageKey || !store) return;
    try {
      const payload = {
        jsonlFiles: Object.fromEntries(jsonlFiles),
        txtFiles: Object.fromEntries(txtFiles),
        outbox: Array.from(outboxMap.values()),
        workspace: workspaceSnapshot,
      };
      store.setItem(storageKey, JSON.stringify(payload));
    } catch { /* quota */ }
  }

  function rebuildIndex() {
    const started = performance.now();
    indexByChat.clear();
    chatsMeta.clear();
    let messagesIndexed = 0;

    for (const [rel, content] of jsonlFiles.entries()) {
      const parts = rel.split('/');
      const netSeg = parts[1] || 'ratmes';
      const chatSeg = parts[2] || 'general';
      const list = [];
      const byId = new Map();
      for (const line of String(content).split('\n')) {
        if (!line.trim()) continue;
        try {
          const parsed = JSON.parse(line);
          if (parsed.eventType === 'patch' && parsed.msgId && byId.has(parsed.msgId)) {
            Object.assign(byId.get(parsed.msgId), parsed.patch);
          } else if (parsed.msgId) {
            if (byId.has(parsed.msgId)) Object.assign(byId.get(parsed.msgId), parsed);
            else {
              byId.set(parsed.msgId, parsed);
              list.push(parsed);
              messagesIndexed += 1;
            }
          }
        } catch { /* broken tail */ }
      }
      const last = list[list.length - 1];
      const chatId = last?.chatId || chatSeg;
      const network = last?.network || netSeg;
      indexByChat.set(chatId, list);
      chatsMeta.set(chatId, {
        chatId,
        network,
        title: last?.chatTitle || chatId,
        messageCount: list.length,
        lastTs: last?.ts || 0,
        lastSeq: last?.seq || list.length,
      });
    }
    return { messagesIndexed, chatsCount: indexByChat.size, durationMs: Number((performance.now() - started).toFixed(3)) };
  }

  loadLocalStorage();

  return {
    backend: 'browser-memory',
    rootDir: 'RatMes-Vault (браузерное хранилище)',

    appendMessage(msg) {
      const jRel = `chats/${sanitizeSeg(msg.network)}/${sanitizeSeg(msg.chatId)}/messages.jsonl`;
      const tRel = `chats/${sanitizeSeg(msg.network)}/${sanitizeSeg(msg.chatId)}/readable.txt`;
      jsonlFiles.set(jRel, `${jsonlFiles.get(jRel) || ''}${JSON.stringify(msg)}\n`);
      txtFiles.set(tRel, `${txtFiles.get(tRel) || ''}${formatReadableLine(msg)}`);

      let list = indexByChat.get(msg.chatId);
      if (!list) {
        list = [];
        indexByChat.set(msg.chatId, list);
      }
      const existing = list.find((m) => m.msgId === msg.msgId);
      if (existing) Object.assign(existing, msg);
      else list.push(msg);

      chatsMeta.set(msg.chatId, {
        chatId: msg.chatId,
        network: msg.network,
        title: msg.chatTitle || chatsMeta.get(msg.chatId)?.title || msg.chatId,
        messageCount: list.length,
        lastTs: msg.ts,
        lastSeq: msg.seq || list.length,
      });
      saveLocalStorage();
      return { vaultOffset: list.length, jsonlRel: jRel, txtRel: tRel, txtUpdated: true };
    },

    patchMessage(network, chatId, msgId, patch) {
      const jRel = `chats/${sanitizeSeg(network)}/${sanitizeSeg(chatId)}/messages.jsonl`;
      const tRel = `chats/${sanitizeSeg(network)}/${sanitizeSeg(chatId)}/readable.txt`;
      jsonlFiles.set(jRel, `${jsonlFiles.get(jRel) || ''}${JSON.stringify({ eventType: 'patch', msgId, patch, ts: Date.now() })}\n`);
      const list = indexByChat.get(chatId) || [];
      const found = list.find((m) => m.msgId === msgId);
      if (found) Object.assign(found, patch);
      txtFiles.set(tRel, list.map(formatReadableLine).join(''));
      saveLocalStorage();
      return Boolean(found);
    },

    storeMedia({ chatId, filename, bytes, sha256 }) {
      const prefix = String(sha256).slice(0, 16);
      if (mediaHashIndex.has(prefix)) {
        return { relativePath: mediaHashIndex.get(prefix), sha256, deduplicated: true };
      }
      const rel = `media/${sanitizeSeg(chatId)}/${prefix}_${sanitizeSeg(filename)}`;
      mediaFiles.set(rel, new Uint8Array(bytes));
      mediaHashIndex.set(prefix, rel);
      return { relativePath: rel, sha256, deduplicated: false };
    },

    readMediaBytes(rel) {
      return mediaFiles.get(rel) || null;
    },

    upsertOutbox(record) {
      outboxMap.set(record.transferId, record);
      saveLocalStorage();
    },

    removeOutbox(transferId) {
      outboxMap.delete(transferId);
      saveLocalStorage();
    },

    listOutbox() {
      return Array.from(outboxMap.values());
    },

    readPage(chatId, { limit = 50, beforeSeq = null } = {}) {
      const list = indexByChat.get(chatId) || [];
      const filtered = beforeSeq ? list.filter((m) => (m.seq || 0) < beforeSeq) : list;
      const slice = filtered.slice(-limit);
      return { messages: slice.map((m) => ({ ...m })), hasMore: filtered.length > slice.length, total: list.length };
    },

    listChats() {
      return Array.from(chatsMeta.values()).sort((a, b) => b.lastTs - a.lastTs);
    },

    healTail() {
      let filesChecked = 0;
      let tailsHealed = 0;
      const healedFiles = [];
      for (const [rel, raw] of jsonlFiles.entries()) {
        filesChecked += 1;
        const valid = [];
        let broken = false;
        for (const line of String(raw).split('\n')) {
          if (!line.trim()) continue;
          try { JSON.parse(line); valid.push(line); } catch { broken = true; }
        }
        if (broken) {
          tailsHealed += 1;
          jsonlFiles.set(rel, valid.length ? `${valid.join('\n')}\n` : '');
          healedFiles.push(rel);
        }
      }
      if (tailsHealed > 0) rebuildIndex();
      saveLocalStorage();
      return { filesChecked, tailsHealed, healedFiles };
    },

    rebuildIndex,
    verifyIntegrity: () => ({ clean: true, damagedFiles: [] }),

    listPlainFiles() {
      const out = [];
      const now = new Date().toISOString();
      for (const [p, v] of jsonlFiles.entries()) out.push({ path: p, sizeBytes: v.length, updatedAt: now });
      for (const [p, v] of txtFiles.entries()) out.push({ path: p, sizeBytes: v.length, updatedAt: now });
      for (const [p, v] of mediaFiles.entries()) out.push({ path: p, sizeBytes: v.byteLength, updatedAt: now });
      out.push({ path: 'outbox/pending.jsonl', sizeBytes: JSON.stringify(Array.from(outboxMap.values())).length, updatedAt: now });
      return out.sort((a, b) => a.path.localeCompare(b.path));
    },

    readPlainTextFile(relPath) {
      if (jsonlFiles.has(relPath)) return jsonlFiles.get(relPath);
      if (txtFiles.has(relPath)) return txtFiles.get(relPath);
      if (relPath === 'outbox/pending.jsonl') {
        return Array.from(outboxMap.values()).map((o) => JSON.stringify(o)).join('\n');
      }
      return null;
    },

    exportAllReadable() {
      const out = {};
      for (const f of this.listPlainFiles()) {
        const txt = this.readPlainTextFile(f.path);
        if (txt !== null) out[f.path] = txt;
      }
      return out;
    },

    getMessageById(chatId, msgId) {
      const list = indexByChat.get(chatId) || [];
      const found = list.find((m) => m.msgId === msgId);
      return found ? { ...found } : null;
    },

    saveWorkspaceState(stateObj) {
      workspaceSnapshot = structuredClone(stateObj);
      saveLocalStorage();
      return true;
    },

    loadWorkspaceState() {
      return workspaceSnapshot ? structuredClone(workspaceSnapshot) : null;
    },
  };
}
