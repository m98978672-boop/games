(() => {
  const button = document.getElementById('share-invite');
  const status = document.getElementById('share-status');
  if (!button || !status) return;

  const url = 'https://m98978672-boop.github.io/games/developers/';
  const text = 'Есть браузерная игра? Предложи её независимой витрине Games. Публикация проходит через проверку, авторство остаётся за создателем.';

  button.addEventListener('click', async () => {
    status.textContent = '';
    if (typeof navigator.share === 'function') {
      try {
        await navigator.share({ title: 'Games — игры сообщества', text, url });
      } catch (error) {
        if (error?.name !== 'AbortError') status.textContent = 'Не удалось открыть меню общего доступа. Попробуй скопировать ссылку вручную.';
      }
      return;
    }

    try {
      if (!navigator.clipboard?.writeText || !window.isSecureContext) throw new Error('Clipboard is unavailable.');
      await navigator.clipboard.writeText(`${text}\n${url}`);
      status.textContent = 'Приглашение и ссылка скопированы — можно вставить их в выбранное приложение.';
    } catch {
      status.textContent = `Скопируй и отправь ссылку: ${url}`;
    }
  });
})();
