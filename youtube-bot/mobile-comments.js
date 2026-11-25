/* Phone-friendly, read-only YouTube comment viewer. No backend, no persistence. */
'use strict';
(function (root) {
  const CLIENT_ID = '420623721440-kbb56gvvibavmbdghqdjq4vqjlb25s7n.apps.googleusercontent.com';
  const SCOPE = 'https://www.googleapis.com/auth/youtube.readonly';
  const API = 'https://www.googleapis.com/youtube/v3/';

  function videoId(value) {
    const input = String(value || '').trim();
    if (/^[A-Za-z0-9_-]{11}$/.test(input)) return input;
    let url;
    try { url = new URL(input); } catch { throw new Error('Введите ссылку на видео или его ID.'); }
    if (url.protocol !== 'https:' || url.username || url.password) throw new Error('Нужна обычная HTTPS-ссылка YouTube.');
    let id = '';
    if (url.hostname === 'youtu.be') id = url.pathname.split('/')[1] || '';
    else if (['youtube.com', 'www.youtube.com', 'm.youtube.com'].includes(url.hostname)) {
      id = url.pathname === '/watch' ? url.searchParams.get('v') || '' :
        /^\/(shorts|live)\//.test(url.pathname) ? url.pathname.split('/')[2] || '' : '';
    }
    if (!/^[A-Za-z0-9_-]{11}$/.test(id)) throw new Error('Не удалось распознать ID видео YouTube.');
    return id;
  }

  async function getJson(path, params, token, request = fetch) {
    const url = new URL(API + path);
    for (const [key, value] of Object.entries(params)) url.searchParams.set(key, value);
    const response = await request(url.toString(), {headers: {Authorization: `Bearer ${token}`}, cache: 'no-store'});
    if (!response.ok) throw new Error(`YouTube не вернул данные (HTTP ${response.status}). Проверьте доступ и настройки комментариев.`);
    return response.json();
  }

  async function readOwnedComments(token, id, request = fetch) {
    if (typeof token !== 'string' || !token || !/^[A-Za-z0-9_-]{11}$/.test(id)) throw new Error('Сначала подключите канал и укажите видео.');
    const channels = await getJson('channels', {part:'id,snippet', mine:'true', maxResults:'50'}, token, request);
    const owners = new Map((Array.isArray(channels.items) ? channels.items : [])
      .filter(c => typeof c.id === 'string').map(c => [c.id, String(c.snippet?.title || 'Канал')]));
    if (!owners.size) throw new Error('У подключённого аккаунта не найден YouTube-канал.');
    const videos = await getJson('videos', {part:'snippet', id}, token, request);
    const video = Array.isArray(videos.items) && videos.items.length === 1 ? videos.items[0] : null;
    const owner = video?.snippet?.channelId;
    if (!owners.has(owner)) throw new Error('Видео не принадлежит подключённому каналу или недоступно.');
    const page = await getJson('commentThreads', {part:'snippet', videoId:id, maxResults:'50', order:'time', textFormat:'plainText'}, token, request);
    const comments = (Array.isArray(page.items) ? page.items : []).map(item => item?.snippet?.topLevelComment?.snippet)
      .filter(item => item && item.authorChannelId?.value !== owner)
      .map(item => String(item.textDisplay || '').slice(0, 2000)).filter(Boolean);
    return {channel: owners.get(owner), title: String(video.snippet?.title || ''), comments};
  }

  if (typeof module !== 'undefined' && module.exports) module.exports = {videoId, readOwnedComments};
  if (!root.document) return;
  const doc = root.document;
  const connect = doc.getElementById('comments-connect');
  if (!connect) return;
  const read = doc.getElementById('comments-read'), disconnect = doc.getElementById('comments-disconnect');
  const status = doc.getElementById('comments-status'), output = doc.getElementById('comments-output');
  let accessToken = null, expiresAt = 0, client;
  function clear() { accessToken = null; expiresAt = 0; output.replaceChildren(); read.disabled = true; disconnect.hidden = true; }
  connect.addEventListener('click', () => {
    if (!root.google?.accounts?.oauth2) { status.textContent = 'Google не загрузился. Обновите страницу и повторите.'; return; }
    try {
      client = root.google.accounts.oauth2.initTokenClient({client_id: CLIENT_ID, scope: SCOPE,
        callback: response => {
          if (response.error || !response.access_token) { clear(); status.textContent = 'Доступ не выдан. Попробуйте ещё раз.'; return; }
          accessToken = response.access_token; expiresAt = Date.now() + Number(response.expires_in || 0) * 1000;
          read.disabled = false; disconnect.hidden = false;
          status.textContent = 'Доступ для чтения подключён на время этой вкладки. Укажите своё видео.';
        },
        error_callback: () => { clear(); status.textContent = 'Окно Google закрыто или недоступно. Попробуйте ещё раз.'; },
      });
      client.requestAccessToken();
    } catch { clear(); status.textContent = 'Не удалось открыть Google. Обновите страницу.'; }
  });
  disconnect.addEventListener('click', () => { clear(); status.textContent = 'Данные удалены из вкладки. Для полного отзыва доступа используйте настройки Google.'; });
  read.addEventListener('click', async () => {
    output.replaceChildren();
    if (!accessToken || Date.now() >= expiresAt) { clear(); status.textContent = 'Доступ истёк. Подключите Google ещё раз.'; return; }
    read.disabled = true;
    try {
      status.textContent = 'Проверяем канал и читаем комментарии…';
      const sessionToken = accessToken;
      const result = await readOwnedComments(sessionToken, videoId(doc.getElementById('comments-video').value));
      if (accessToken !== sessionToken) return; // A disconnect must not repopulate the screen.
      const header = doc.createElement('p'); header.textContent = `Канал: ${result.channel} · Видео: ${result.title}`; output.append(header);
      if (!result.comments.length) { const p = doc.createElement('p'); p.textContent = 'Комментариев зрителей пока не найдено.'; output.append(p); }
      for (const text of result.comments) { const p = doc.createElement('p'); p.textContent = text; p.className = 'comment-item'; output.append(p); }
      status.textContent = `Показано комментариев: ${result.comments.length}. Ничего не опубликовано.`;
    } catch (error) { status.textContent = error instanceof Error ? error.message : 'Не удалось прочитать комментарии.'; }
    finally { read.disabled = !accessToken || Date.now() >= expiresAt; }
  });
})(typeof window !== 'undefined' ? window : globalThis);
