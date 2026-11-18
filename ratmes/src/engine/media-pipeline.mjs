// Медиа-конвейер (классификация файлов, карта чанков) и безопасный Markdown-lite AST-токенизатор.
// Полностью детерминированный, работает в Node.js 22 и браузере без внешних библиотек.

// 1. Безопасный парсер Markdown-lite -> массив AST-узлов (для безопасной DOM-отрисовки без innerHTML XSS!)
export function parseMarkdownLite(text) {
  const src = String(text || '');
  const blocks = [];
  const fenceRegex = /```([a-zA-Z0-9_-]*)\n?([\s\S]*?)```/g;
  let lastIdx = 0;
  let match;

  while ((match = fenceRegex.exec(src)) !== null) {
    if (match.index > lastIdx) {
      blocks.push({ type: 'paragraph', spans: parseInlineSpans(src.slice(lastIdx, match.index)) });
    }
    blocks.push({ type: 'codeblock', lang: match[1] || 'text', code: match[2].replace(/\n$/, '') });
    lastIdx = fenceRegex.lastIndex;
  }

  if (lastIdx < src.length || blocks.length === 0) {
    blocks.push({ type: 'paragraph', spans: parseInlineSpans(src.slice(lastIdx)) });
  }
  return blocks;
}

function parseInlineSpans(segment) {
  const spans = [];
  const tokenRegex = /(\*\*[^*]+\*\*|\*[^*\n]+\*|~~[^~\n]+~~|`[^`\n]+`|https?:\/\/[^\s<>()]+|@[a-zA-Z0-9_]{2,}|#[a-zA-Zа-яА-Я0-9_]{2,})/g;
  let last = 0;
  let m;

  while ((m = tokenRegex.exec(segment)) !== null) {
    if (m.index > last) {
      spans.push({ type: 'text', value: segment.slice(last, m.index) });
    }
    const tok = m[0];
    if (tok.startsWith('**') && tok.endsWith('**')) {
      spans.push({ type: 'bold', value: tok.slice(2, -2) });
    } else if (tok.startsWith('*') && tok.endsWith('*')) {
      spans.push({ type: 'italic', value: tok.slice(1, -1) });
    } else if (tok.startsWith('~~') && tok.endsWith('~~')) {
      spans.push({ type: 'strike', value: tok.slice(2, -2) });
    } else if (tok.startsWith('`') && tok.endsWith('`')) {
      spans.push({ type: 'code', value: tok.slice(1, -1) });
    } else if (tok.startsWith('http://') || tok.startsWith('https://')) {
      spans.push({ type: 'link', href: tok, value: tok });
    } else if (tok.startsWith('@')) {
      spans.push({ type: 'mention', value: tok });
    } else if (tok.startsWith('#')) {
      spans.push({ type: 'tag', value: tok });
    } else {
      spans.push({ type: 'text', value: tok });
    }
    last = tokenRegex.lastIndex;
  }

  if (last < segment.length) {
    spans.push({ type: 'text', value: segment.slice(last) });
  }
  return spans;
}

// 2. Классификация медиа по MIME / расширению
export function classifyMedia(filename = '', mimeType = '') {
  const mime = String(mimeType || '').toLowerCase();
  const ext = String(filename || '').toLowerCase().split('.').pop() || '';
  if (mime.startsWith('image/') || ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'].includes(ext)) return 'image';
  if (mime.startsWith('audio/') || ['wav', 'ogg', 'webm', 'mp3', 'm4a', 'opus'].includes(ext)) return 'audio';
  if (mime.startsWith('video/') || ['mp4', 'mov', 'mkv'].includes(ext)) return 'video';
  if (mime.startsWith('text/') || ['txt', 'md', 'json', 'jsonl', 'js', 'mjs', 'css', 'html', 'log'].includes(ext)) return 'text';
  return 'binary';
}

// Извлечение 32 амплитудных столбиков (0..100) — используется для визуализации медиа-контента.
export function extractWaveformPeaks(samplesOrBytes, bars = 32) {
  const out = [];
  if (!samplesOrBytes || samplesOrBytes.length === 0) {
    for (let i = 0; i < bars; i += 1) out.push(20);
    return out;
  }
  const isFloat = samplesOrBytes instanceof Float32Array;
  const start = isFloat ? 0 : Math.min(44, samplesOrBytes.length);
  const total = Math.max(1, samplesOrBytes.length - start);
  const step = Math.max(1, Math.floor(total / bars));

  for (let b = 0; b < bars; b += 1) {
    const from = start + b * step;
    const to = Math.min(samplesOrBytes.length, from + step);
    let peak = 0;
    for (let i = from; i < to; i += 1) {
      const val = isFloat ? Math.abs(samplesOrBytes[i]) : Math.abs(samplesOrBytes[i] - 128) / 128;
      if (val > peak) peak = val;
    }
    out.push(Math.max(12, Math.min(100, Math.round(peak * 100))));
  }
  return out;
}

// Карта чанков (для UI-индикатора загрузки файла [✓][✓][⚡][·][·])
export function buildChunkMap(totalChunks, sentChunks, droppedAt = null) {
  const cells = [];
  for (let i = 0; i < totalChunks; i += 1) {
    if (droppedAt !== null && i === droppedAt) cells.push('dropped');
    else if (i < sentChunks) cells.push('done');
    else cells.push('pending');
  }
  return cells;
}
