// Командная палитра Ctrl+K и глобальный полнотекстовый поиск BM25 по всему архиву RatMes-Vault/.

export function createCommandPalette({
  dialogEl,
  inputEl,
  resultsEl,
  onSearchQuery,
  getQuickCommands,
  onSelectHit,
}) {
  let debounceTimer = null;

  function open(initialText = '') {
    if (!dialogEl.open) dialogEl.showModal();
    inputEl.value = initialText;
    inputEl.focus();
    runQuery(initialText);
  }

  function close() {
    if (dialogEl.open) dialogEl.close();
  }

  async function runQuery(raw) {
    const q = String(raw || '').trim();
    resultsEl.replaceChildren();

    // 1. Быстрые команды (всегда фильтруются мгновенно)
    const commands = (getQuickCommands ? getQuickCommands() : []).filter((cmd) => {
      if (!q) return true;
      return cmd.label.toLowerCase().includes(q.toLowerCase()) || cmd.hint.toLowerCase().includes(q.toLowerCase());
    });

    if (commands.length > 0 && (!q || q.startsWith('>') || commands.length <= 6)) {
      const heading = document.createElement('div');
      heading.className = 'palette-section-title';
      heading.textContent = 'Быстрые команды и действия';
      resultsEl.appendChild(heading);

      for (const cmd of commands.slice(0, 6)) {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'palette-item';
        const left = document.createElement('span');
        left.className = 'palette-item-title';
        left.textContent = `${cmd.icon || '⚡'} ${cmd.label}`;
        const right = document.createElement('span');
        right.className = 'palette-item-meta';
        right.textContent = cmd.hint;
        btn.append(left, right);
        btn.addEventListener('click', () => {
          close();
          cmd.run();
        });
        resultsEl.appendChild(btn);
      }
    }

    // 2. Глобальный BM25 поиск по сообщениям RatMes-Vault/
    if (q && !q.startsWith('>') && onSearchQuery) {
      const searchRes = await onSearchQuery(q);
      const heading = document.createElement('div');
      heading.className = 'palette-section-title';
      heading.textContent = searchRes?.ok
        ? `Сообщения в RatMes-Vault/: найдено ${searchRes.data.totalMatches} за ${searchRes.data.durationMs} мс`
        : 'Ошибка поиска';
      resultsEl.appendChild(heading);

      if (searchRes?.ok && searchRes.data.hits.length > 0) {
        for (const hit of searchRes.data.hits.slice(0, 15)) {
          const btn = document.createElement('button');
          btn.type = 'button';
          btn.className = 'palette-item palette-hit';

          const top = document.createElement('div');
          top.className = 'palette-hit-top';
          const title = document.createElement('strong');
          title.textContent = `${hit.chatTitle} · ${hit.senderName}`;
          const meta = document.createElement('span');
          meta.className = 'palette-item-meta';
          meta.textContent = `${hit.network.toUpperCase()} · #${hit.seq} · BM25 ${hit.score}`;
          top.append(title, meta);

          const snip = document.createElement('div');
          snip.className = 'palette-hit-snippet';
          snip.textContent = hit.snippet;

          btn.append(top, snip);
          btn.addEventListener('click', () => {
            close();
            if (onSelectHit) onSelectHit(hit);
          });
          resultsEl.appendChild(btn);
        }
      } else {
        const empty = document.createElement('p');
        empty.className = 'muted-text';
        empty.style.padding = '8px 10px';
        empty.textContent = 'Ничего не найдено. Попробуй фильтры: net:telegram, has:file, from:Аня, pinned:true';
        resultsEl.appendChild(empty);
      }
    }
  }

  inputEl.addEventListener('input', () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => runQuery(inputEl.value), 90);
  });

  dialogEl.addEventListener('click', (e) => {
    if (e.target === dialogEl) close();
  });

  window.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      if (dialogEl.open) close();
      else open();
    }
  });

  return { open, close, runQuery };
}
