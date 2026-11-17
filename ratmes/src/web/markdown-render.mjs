// Безопасный DOM-рендерер Markdown-lite поверх AST parseMarkdownLite() — 0 вызовов innerHTML, 0 XSS.

import { parseMarkdownLite } from '../engine/media-pipeline.mjs';

export function renderMarkdownToFragment(text) {
  const frag = document.createDocumentFragment();
  const blocks = parseMarkdownLite(text);

  for (const block of blocks) {
    if (block.type === 'codeblock') {
      const pre = document.createElement('pre');
      pre.className = 'md-codeblock';
      if (block.lang && block.lang !== 'text') {
        const badge = document.createElement('span');
        badge.className = 'md-code-lang';
        badge.textContent = block.lang;
        pre.appendChild(badge);
      }
      const code = document.createElement('code');
      code.textContent = block.code;
      pre.appendChild(code);
      frag.appendChild(pre);
      continue;
    }

    const p = document.createElement('div');
    p.className = 'md-para';
    for (const span of block.spans) {
      if (span.type === 'text') {
        p.appendChild(document.createTextNode(span.value));
      } else if (span.type === 'bold') {
        const el = document.createElement('strong');
        el.textContent = span.value;
        p.appendChild(el);
      } else if (span.type === 'italic') {
        const el = document.createElement('em');
        el.textContent = span.value;
        p.appendChild(el);
      } else if (span.type === 'strike') {
        const el = document.createElement('del');
        el.textContent = span.value;
        p.appendChild(el);
      } else if (span.type === 'code') {
        const el = document.createElement('code');
        el.className = 'md-inline-code';
        el.textContent = span.value;
        p.appendChild(el);
      } else if (span.type === 'link') {
        const a = document.createElement('a');
        a.className = 'md-link';
        a.href = span.href;
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
        a.textContent = span.value;
        p.appendChild(a);
      } else if (span.type === 'mention') {
        const el = document.createElement('span');
        el.className = 'md-mention';
        el.textContent = span.value;
        p.appendChild(el);
      } else if (span.type === 'tag') {
        const el = document.createElement('span');
        el.className = 'md-tag';
        el.textContent = span.value;
        p.appendChild(el);
      }
    }
    frag.appendChild(p);
  }
  return frag;
}
