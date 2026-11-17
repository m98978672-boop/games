// Полнотекстовый поисковый движок RatMes (инвертированный индекс + BM25 + русский/латинский префиксный стемминг
// + структурированные фильтры net:, from:, has:file, has:voice, pinned:, "точная фраза").
// Работает одинаково в Node.js и браузере, полностью пересобирается из файлов RatMes-Vault/ за миллисекунды.

const RU_SUFFIXES = [
  'иями', 'ями', 'ами', 'ович', 'евич', 'ение', 'ание', 'ость', 'еств',
  'ого', 'его', 'ому', 'ему', 'ими', 'ыми', 'ая', 'яя', 'ое', 'ее', 'ые', 'ие',
  'ов', 'ев', 'ей', 'ом', 'ем', 'ам', 'ям', 'ах', 'ях', 'ой', 'ий', 'ый', 'ую', 'юю',
  'ть', 'ти', 'ет', 'ит', 'ут', 'ют', 'ат', 'ят', 'ал', 'ил', 'ел', 'ла', 'ло', 'ли',
  'а', 'я', 'о', 'е', 'и', 'ы', 'у', 'ю', 'ь',
];

const STOP_WORDS = new Set([
  'и', 'в', 'во', 'не', 'что', 'он', 'на', 'я', 'с', 'со', 'как', 'а', 'то', 'все', 'она',
  'так', 'его', 'но', 'да', 'ты', 'к', 'у', 'же', 'вы', 'за', 'бы', 'по', 'только', 'ее',
  'the', 'is', 'at', 'of', 'on', 'and', 'a', 'to', 'in', 'for', 'or', 'an', 'be',
]);

export function normalizeWord(raw) {
  const w = String(raw || '').toLowerCase().replace(/ё/g, 'е').trim();
  if (w.length <= 2) return w;
  if (/[а-я]/.test(w) && w.length >= 5) {
    for (const suf of RU_SUFFIXES) {
      if (w.endsWith(suf) && w.length - suf.length >= 3) {
        return w.slice(0, w.length - suf.length);
      }
    }
  } else if (/^[a-z]+$/.test(w) && w.length >= 5) {
    if (w.endsWith('ing') && w.length > 5) return w.slice(0, -3);
    if (w.endsWith('ed') && w.length > 4) return w.slice(0, -2);
    if (w.endsWith('es') && w.length > 4) return w.slice(0, -2);
    if (w.endsWith('s') && !w.endsWith('ss') && w.length > 4) return w.slice(0, -1);
  }
  return w;
}

export function tokenizeText(text) {
  const rawTokens = String(text || '').toLowerCase().replace(/ё/g, 'е').match(/[a-zа-я0-9_-]{2,}/g) || [];
  const out = [];
  for (const raw of rawTokens) {
    if (STOP_WORDS.has(raw) && rawTokens.length > 2) continue;
    const stem = normalizeWord(raw);
    out.push(stem);
    if (stem !== raw) out.push(raw);
  }
  return out;
}

export function parseSearchQuery(rawQuery) {
  const input = String(rawQuery || '').trim();
  const filters = {
    network: null,
    from: null,
    chatId: null,
    hasFile: false,
    hasVoice: false,
    pinnedOnly: false,
    includeDeleted: false,
  };
  const phrases = [];
  let rest = input;

  // Извлекаем точные фразы в кавычках "..."
  rest = rest.replace(/"([^"]+)"/g, (_, phrase) => {
    const clean = phrase.trim().toLowerCase().replace(/ё/g, 'е');
    if (clean) phrases.push(clean);
    return ' ';
  });

  const freeParts = [];
  for (const part of rest.split(/\s+/).filter(Boolean)) {
    const colonIdx = part.indexOf(':');
    if (colonIdx > 0) {
      const key = part.slice(0, colonIdx).toLowerCase();
      const val = part.slice(colonIdx + 1).toLowerCase();
      if ((key === 'net' || key === 'network') && val) { filters.network = val; continue; }
      if ((key === 'from' || key === 'sender') && val) { filters.from = val; continue; }
      if (key === 'chat' && val) { filters.chatId = val; continue; }
      if (key === 'has' && (val === 'file' || val === 'media' || val === 'att')) { filters.hasFile = true; continue; }
      if (key === 'has' && (val === 'voice' || val === 'audio')) { filters.hasVoice = true; continue; }
      if (key === 'pinned' && (val === 'true' || val === '1' || val === 'yes')) { filters.pinnedOnly = true; continue; }
      if (key === 'deleted' && (val === 'true' || val === '1')) { filters.includeDeleted = true; continue; }
    }
    freeParts.push(part);
  }

  const freeText = freeParts.join(' ');
  const terms = tokenizeText(freeText);
  return { raw: input, filters, phrases, freeText, terms: Array.from(new Set(terms)) };
}

function buildSnippet(text, queryTerms, phrases, radius = 48) {
  const str = String(text || '');
  const lower = str.toLowerCase().replace(/ё/g, 'е');
  let hitPos = -1;
  let hitLen = 0;

  for (const ph of phrases) {
    const idx = lower.indexOf(ph);
    if (idx !== -1) { hitPos = idx; hitLen = ph.length; break; }
  }
  if (hitPos === -1) {
    for (const term of queryTerms) {
      const idx = lower.indexOf(term);
      if (idx !== -1) { hitPos = idx; hitLen = term.length; break; }
    }
  }
  if (hitPos === -1) {
    return {
      snippet: str.length > radius * 2 ? `${str.slice(0, radius * 2)}…` : str,
      matchStart: -1,
      matchEnd: -1,
    };
  }
  const start = Math.max(0, hitPos - radius);
  const end = Math.min(str.length, hitPos + hitLen + radius);
  const prefix = start > 0 ? '…' : '';
  const suffix = end < str.length ? '…' : '';
  return {
    snippet: `${prefix}${str.slice(start, end)}${suffix}`,
    matchStart: hitPos - start + prefix.length,
    matchEnd: hitPos - start + hitLen + prefix.length,
  };
}

export class FullTextSearchIndex {
  constructor() {
    // docId (msgId) -> { msgId, chatId, chatTitle, network, senderName, text, lowerText, ts, seq, hasFile, hasVoice, deleted, tokenCount, tfMap }
    this.docs = new Map();
    // term -> Map<docId, termFreq>
    this.postings = new Map();
    // 3-символьные префиксы для мгновенного поиска при наборе
    this.prefixMap = new Map();
    this.totalTokens = 0;
  }

  clear() {
    this.docs.clear();
    this.postings.clear();
    this.prefixMap.clear();
    this.totalTokens = 0;
  }

  indexMessage(msg, { pinned = false } = {}) {
    if (!msg || !msg.msgId) return;
    if (this.docs.has(msg.msgId)) this.removeMessage(msg.msgId);

    const textBlob = [
      msg.text || '',
      msg.senderName || '',
      msg.chatTitle || '',
      msg.attachment?.filename || '',
    ].join(' ');
    const tokens = tokenizeText(textBlob);
    const tfMap = new Map();
    for (const tok of tokens) {
      tfMap.set(tok, (tfMap.get(tok) || 0) + 1);
    }

    const mime = String(msg.attachment?.mimeType || '');
    const isVoice = Boolean(msg.attachment?.isVoice || mime.startsWith('audio/'));
    const doc = {
      msgId: msg.msgId,
      chatId: msg.chatId,
      chatTitle: msg.chatTitle || msg.chatId,
      network: msg.network || 'ratmes',
      senderName: msg.senderName || 'Собеседник',
      text: msg.text || '',
      lowerText: textBlob.toLowerCase().replace(/ё/g, 'е'),
      ts: msg.ts || 0,
      seq: msg.seq || 0,
      hasFile: Boolean(msg.attachment),
      hasVoice: isVoice,
      pinned: Boolean(pinned),
      deleted: Boolean(msg.deleted),
      tokenCount: tokens.length || 1,
      tfMap,
    };

    this.docs.set(msg.msgId, doc);
    this.totalTokens += doc.tokenCount;

    for (const [term, tf] of tfMap.entries()) {
      let post = this.postings.get(term);
      if (!post) {
        post = new Map();
        this.postings.set(term, post);
      }
      post.set(msg.msgId, tf);

      if (term.length >= 3) {
        const pref = term.slice(0, 3);
        let pSet = this.prefixMap.get(pref);
        if (!pSet) {
          pSet = new Set();
          this.prefixMap.set(pref, pSet);
        }
        pSet.add(term);
      }
    }
  }

  removeMessage(msgId) {
    const doc = this.docs.get(msgId);
    if (!doc) return false;
    this.totalTokens = Math.max(0, this.totalTokens - doc.tokenCount);
    for (const term of doc.tfMap.keys()) {
      const post = this.postings.get(term);
      if (post) {
        post.delete(msgId);
        if (post.size === 0) {
          this.postings.delete(term);
          if (term.length >= 3) {
            const pSet = this.prefixMap.get(term.slice(0, 3));
            if (pSet) pSet.delete(term);
          }
        }
      }
    }
    this.docs.delete(msgId);
    return true;
  }

  setPinned(msgId, pinned) {
    const doc = this.docs.get(msgId);
    if (doc) doc.pinned = Boolean(pinned);
  }

  rebuildFromVault(vaultStore, pinnedIdsSet = new Set()) {
    const started = performance.now();
    this.clear();
    const chats = vaultStore.listChats();
    let count = 0;
    for (const chat of chats) {
      const page = vaultStore.readPage(chat.chatId, { limit: 100000 });
      for (const msg of page.messages) {
        this.indexMessage(msg, { pinned: pinnedIdsSet.has(msg.msgId) });
        count += 1;
      }
    }
    return {
      documentsIndexed: count,
      uniqueTerms: this.postings.size,
      durationMs: Number((performance.now() - started).toFixed(3)),
    };
  }

  // BM25 (k1 = 1.5, b = 0.75) + префиксное расширение + булевые фильтры
  search(rawQuery, { limit = 30, chatId = null } = {}) {
    const started = performance.now();
    const parsed = parseSearchQuery(rawQuery);
    if (chatId) parsed.filters.chatId = chatId;

    const N = Math.max(1, this.docs.size);
    const avgdl = Math.max(1, this.totalTokens / N);
    const k1 = 1.5;
    const b = 0.75;

    const candidateScores = new Map();
    const hasTextQuery = parsed.terms.length > 0 || parsed.phrases.length > 0;

    if (hasTextQuery) {
      for (const qTerm of parsed.terms) {
        const matchedTerms = new Set();
        if (this.postings.has(qTerm)) matchedTerms.add(qTerm);
        // Префиксное совпадение для живого поиска по мере набора
        if (qTerm.length >= 3) {
          const bucket = this.prefixMap.get(qTerm.slice(0, 3));
          if (bucket) {
            for (const cand of bucket) {
              if (cand.startsWith(qTerm)) matchedTerms.add(cand);
            }
          }
        }
        for (const term of matchedTerms) {
          const post = this.postings.get(term);
          if (!post) continue;
          const df = post.size;
          const idf = Math.log(1 + (N - df + 0.5) / (df + 0.5));
          const exactBoost = term === qTerm ? 1.25 : 0.85;
          for (const [docId, tf] of post.entries()) {
            const doc = this.docs.get(docId);
            if (!doc) continue;
            const denom = tf + k1 * (1 - b + b * (doc.tokenCount / avgdl));
            const score = idf * ((tf * (k1 + 1)) / denom) * exactBoost;
            candidateScores.set(docId, (candidateScores.get(docId) || 0) + score);
          }
        }
      }

      // Точные фразы (даже если не попали через стемминг)
      if (parsed.phrases.length > 0) {
        const pool = candidateScores.size > 0 ? Array.from(candidateScores.keys()) : Array.from(this.docs.keys());
        for (const docId of pool) {
          const doc = this.docs.get(docId);
          if (!doc) continue;
          let allMatch = true;
          for (const ph of parsed.phrases) {
            if (!doc.lowerText.includes(ph)) { allMatch = false; break; }
          }
          if (allMatch) {
            candidateScores.set(docId, (candidateScores.get(docId) || 0) + 3.0);
          } else {
            candidateScores.delete(docId);
          }
        }
      }
    } else {
      // Поиск только по фильтрам (например has:file или net:telegram)
      for (const [docId, doc] of this.docs.entries()) {
        candidateScores.set(docId, 1 + doc.ts / 1e15);
      }
    }

    const hits = [];
    for (const [docId, score] of candidateScores.entries()) {
      const doc = this.docs.get(docId);
      if (!doc) continue;
      if (!parsed.filters.includeDeleted && doc.deleted) continue;
      if (parsed.filters.network && doc.network !== parsed.filters.network) continue;
      if (parsed.filters.chatId && doc.chatId !== parsed.filters.chatId) continue;
      if (parsed.filters.from && !doc.senderName.toLowerCase().includes(parsed.filters.from)) continue;
      if (parsed.filters.hasFile && !doc.hasFile) continue;
      if (parsed.filters.hasVoice && !doc.hasVoice) continue;
      if (parsed.filters.pinnedOnly && !doc.pinned) continue;

      const snip = buildSnippet(doc.text, parsed.terms, parsed.phrases);
      hits.push({
        msgId: doc.msgId,
        chatId: doc.chatId,
        chatTitle: doc.chatTitle,
        network: doc.network,
        senderName: doc.senderName,
        seq: doc.seq,
        ts: doc.ts,
        hasFile: doc.hasFile,
        hasVoice: doc.hasVoice,
        pinned: doc.pinned,
        score: Number(score.toFixed(4)),
        snippet: snip.snippet,
        matchStart: snip.matchStart,
        matchEnd: snip.matchEnd,
      });
    }

    hits.sort((a, b) => (b.score - a.score) || (b.ts - a.ts));
    const trimmed = hits.slice(0, Math.max(1, Math.min(200, limit)));

    return {
      query: parsed.raw,
      filters: parsed.filters,
      totalMatches: hits.length,
      hits: trimmed,
      durationMs: Number((performance.now() - started).toFixed(3)),
    };
  }

  stats() {
    return {
      documents: this.docs.size,
      uniqueTerms: this.postings.size,
      prefixes: this.prefixMap.size,
      avgDocTokens: Number((this.totalTokens / Math.max(1, this.docs.size)).toFixed(2)),
    };
  }
}
