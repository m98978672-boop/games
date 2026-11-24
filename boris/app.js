(() => {
  'use strict';

  const videos = Array.isArray(window.VIDEO_CATALOG) ? window.VIDEO_CATALOG : [];
  const STORAGE_KEY = 'boris-video-library-v1';
  const views = ['home', 'series', 'shorts', 'chess', 'meme', 'history', 'later', 'liked'];
  const categoryChips = [
    { id: 'all', label: 'Все видео' },
    { id: 'series', label: 'Серии Бориса' },
    { id: 'shorts', label: 'Shorts' },
    { id: 'chess', label: 'Квеня и шахматы' },
    { id: 'meme', label: 'Балтика 0' }
  ];

  const page = document.getElementById('pageContent');
  const chipBar = document.getElementById('chipBar');
  const sidebar = document.getElementById('sidebar');
  const sidebarShade = document.getElementById('sidebarShade');
  const searchInput = document.getElementById('searchInput');
  const mobileSearchInput = document.getElementById('mobileSearchInput');
  const searchForm = document.getElementById('searchForm');
  const mobileSearchForm = document.getElementById('mobileSearchForm');
  const clearSearch = document.getElementById('clearSearch');
  const mobileSearchPanel = document.getElementById('mobileSearchPanel');
  const toast = document.getElementById('toast');

  let currentView = 'home';
  let activeCategory = 'all';
  let query = new URLSearchParams(location.search).get('q') || '';
  let player = null;
  let toastTimer = 0;
  let state = loadState();

  if (searchInput) searchInput.value = query;
  if (mobileSearchInput) mobileSearchInput.value = query;

  function loadState() {
    try {
      const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      return {
        history: Array.isArray(parsed.history) ? parsed.history.filter((id) => videoById(id)).slice(0, 100) : [],
        progress: parsed.progress && typeof parsed.progress === 'object' ? parsed.progress : {},
        liked: Array.isArray(parsed.liked) ? parsed.liked.filter((id) => videoById(id)) : [],
        later: Array.isArray(parsed.later) ? parsed.later.filter((id) => videoById(id)) : []
      };
    } catch (_) {
      return { history: [], progress: {}, liked: [], later: [] };
    }
  }

  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (_) {
      showToast('История недоступна: хранилище браузера отключено.');
    }
  }

  function videoById(id) {
    return videos.find((video) => video.id === id) || null;
  }

  function esc(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, (character) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    })[character]);
  }

  function normalize(value) {
    return String(value || '').toLocaleLowerCase('ru').replace(/ё/g, 'е').trim();
  }

  function formatTime(seconds) {
    const total = Math.max(0, Math.floor(Number(seconds) || 0));
    const hours = Math.floor(total / 3600);
    const minutes = Math.floor((total % 3600) / 60);
    const remainder = total % 60;
    if (hours) return `${hours}:${String(minutes).padStart(2, '0')}:${String(remainder).padStart(2, '0')}`;
    return `${minutes}:${String(remainder).padStart(2, '0')}`;
  }

  function prettyCount(count) {
    const n = Number(count) || 0;
    if (n === 0) return '0 видео';
    if (n === 1) return '1 видео';
    return `${n} видео`;
  }

  function categoryVideos() {
    if (currentView === 'history') return state.history.map(videoById).filter(Boolean);
    if (currentView === 'later') return state.later.map(videoById).filter(Boolean);
    if (currentView === 'liked') return state.liked.map(videoById).filter(Boolean);

    let list = videos.slice().sort((a, b) => a.order - b.order);
    const category = currentView === 'home' ? activeCategory : currentView;
    if (category && category !== 'all' && category !== 'home') {
      list = list.filter((video) => video.category === category);
    }
    return list;
  }

  function filteredVideos() {
    const list = categoryVideos();
    const needle = normalize(query);
    if (!needle) return list;
    return list.filter((video) => normalize([
      video.title, video.description, video.channel, video.badge,
      video.category === 'series' ? 'борис кот сериал эпизод' : '',
      video.category === 'shorts' ? 'короткое вертикальное видео' : '',
      video.category === 'meme' ? 'мем мультфильм сатира балтика безалкогольная' : '',
      video.category === 'chess' ? 'шахматы партия квеня зуза' : ''
    ].join(' ')).includes(needle));
  }

  function updateURL() {
    try {
      const url = new URL(location.href);
      if (query) url.searchParams.set('q', query);
      else url.searchParams.delete('q');
      history.replaceState({}, '', url.pathname + url.search + url.hash);
    } catch (_) { /* local file or restricted history API */ }
  }

  function updateSearch(value) {
    query = String(value || '').trim();
    if (searchInput && searchInput.value !== query) searchInput.value = query;
    if (mobileSearchInput && mobileSearchInput.value !== query) mobileSearchInput.value = query;
    if (clearSearch) clearSearch.hidden = !query;
    updateURL();
    render();
  }

  function showToast(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('is-visible');
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toast.classList.remove('is-visible'), 2600);
  }

  function icon(name) {
    const paths = {
      play: '<path d="m9 6.7 9.2 5.3L9 17.3z"/>',
      clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7v5l3.5 2"/>',
      heart: '<path d="M20.3 8.8c0 4.4-8.3 10-8.3 10s-8.3-5.6-8.3-10a4.4 4.4 0 0 1 8.3-2.1 4.4 4.4 0 0 1 8.3 2.1Z"/>',
      bookmark: '<path d="M6 4.5h12v16l-6-4-6 4z"/>',
      download: '<path d="M12 3v11m-4-4 4 4 4-4M5 17v3h14v-3"/>',
      share: '<circle cx="18" cy="5" r="2.4"/><circle cx="6" cy="12" r="2.4"/><circle cx="18" cy="19" r="2.4"/><path d="m8.2 10.8 7.5-4.5m-7.5 7.1 7.5 4.5"/>',
      arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
      search: '<circle cx="10.8" cy="10.8" r="6.4"/><path d="m16 16 4 4"/>',
      dots: '<circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/>',
      check: '<path d="m5 12 4 4L19 6"/>',
      close: '<path d="m6 6 12 12M18 6 6 18"/>'
    };
    return `<svg viewBox="0 0 24 24" aria-hidden="true">${paths[name] || ''}</svg>`;
  }

  function renderChips() {
    const show = currentView === 'home' && !query;
    chipBar.hidden = !show;
    if (!show) {
      chipBar.innerHTML = '';
      return;
    }
    chipBar.innerHTML = categoryChips.map((chip) => `
      <button class="category-chip${activeCategory === chip.id ? ' is-active' : ''}" type="button" data-category="${chip.id}" aria-pressed="${activeCategory === chip.id}">${esc(chip.label)}</button>
    `).join('');
  }

  function updateNav() {
    document.querySelectorAll('[data-view]').forEach((button) => {
      const isActive = button.dataset.view === currentView;
      button.classList.toggle('is-active', isActive);
      if (button.matches('.nav-item')) button.setAttribute('aria-current', isActive ? 'page' : 'false');
    });
    document.querySelectorAll('.nav-item[data-view="home"]').forEach((button) => {
      button.classList.toggle('is-active', currentView === 'home');
    });
  }

  function posterMarkup(video, extraClass = '') {
    const progress = state.progress[video.id];
    const value = progress && progress.duration > 0 && !progress.completed
      ? Math.min(100, Math.max(2, (progress.current / progress.duration) * 100)) : 0;
    return `
      <span class="video-thumb ${video.format === '9:16' ? 'is-vertical' : ''} ${extraClass}" style="--card-index:${Math.max(0, video.order || 0)}">
        <img src="${esc(video.poster)}" alt="" loading="lazy" decoding="async">
        <span class="thumb-shade"></span>
        ${video.badge ? `<span class="video-badge ${video.category === 'meme' ? 'badge-new' : ''}">${esc(video.badge)}</span>` : ''}
        ${video.category === 'shorts' ? '<span class="shorts-mark" aria-label="Вертикальное видео"><svg viewBox="0 0 18 18" aria-hidden="true"><path d="M11.2 2.3 5.7 5.5a2.3 2.3 0 0 0 .1 4l3.6 2-2.2 1.3a1.6 1.6 0 1 0 1.6 2.7l3.9-2.2a3.1 3.1 0 0 0-.1-5.5L9.2 5.7l3.6-2a.8.8 0 0 0-1.6-1.4Z"/></svg></span>' : ''}
        <span class="duration-pill">${formatTime(video.duration)}</span>
        ${value ? `<span class="thumb-progress" style="--progress:${value}%"><i></i></span>` : ''}
        <span class="thumb-play" aria-hidden="true">${icon('play')}</span>
      </span>`;
  }

  function videoCard(video, index = 0) {
    const isLiked = state.liked.includes(video.id);
    const isLater = state.later.includes(video.id);
    return `
      <article class="video-card" style="--card-index:${index}">
        <button class="thumb-button" type="button" data-watch="${esc(video.id)}" aria-label="Смотреть: ${esc(video.title)}">
          ${posterMarkup(video)}
        </button>
        <div class="card-info">
          <span class="channel-avatar ${video.category === 'meme' ? 'avatar-baltika' : (video.category === 'chess' ? 'avatar-chess' : 'avatar-boris')}">${video.category === 'meme' ? '0' : (video.category === 'chess' ? 'К' : 'Б')}</span>
          <div class="card-copy">
            <button class="card-title" type="button" data-watch="${esc(video.id)}">${esc(video.title)}</button>
            <div class="card-channel">${esc(video.channel)}</div>
            <div class="card-meta">${video.format === '9:16' ? 'Вертикальное' : 'Полный экран'} · ${formatTime(video.duration)}${state.history.includes(video.id) ? ' · смотрели' : ''}</div>
          </div>
          <div class="card-menu-wrap">
            <button class="card-menu" type="button" data-menu="${esc(video.id)}" aria-label="Действия с видео" aria-haspopup="true" aria-expanded="false">${icon('dots')}</button>
            <div class="card-menu-popover" data-menu-for="${esc(video.id)}" hidden>
              <button type="button" data-toggle="later" data-id="${esc(video.id)}">${icon('bookmark')} ${isLater ? 'Убрать из «Смотреть позже»' : 'Смотреть позже'}</button>
              <button type="button" data-toggle="liked" data-id="${esc(video.id)}">${icon('heart')} ${isLiked ? 'Убрать из понравившихся' : 'Понравилось'}</button>
              <a href="${esc(video.file)}" download>${icon('download')} Скачать MP4</a>
            </div>
          </div>
        </div>
      </article>`;
  }

  function sectionHeading(title, subtitle = '', count = null) {
    const countLabel = count == null ? '' : `<span class="result-count">${prettyCount(count)}</span>`;
    return `<div class="section-heading"><div><h2>${esc(title)}</h2>${subtitle ? `<p>${esc(subtitle)}</p>` : ''}</div>${countLabel}</div>`;
  }

  function continueSection() {
    const pending = state.history
      .map(videoById)
      .filter((video) => video && state.progress[video.id] && !state.progress[video.id].completed)
      .sort((a, b) => (state.progress[b.id].updatedAt || 0) - (state.progress[a.id].updatedAt || 0));
    if (!pending.length) return '';
    const cards = pending.slice(0, 3).map((video, index) => videoCard(video, index)).join('');
    return `<section class="content-section compact-section">${sectionHeading('Продолжить просмотр', 'Ваш прогресс сохранён в этом браузере', pending.length)}<div class="video-grid video-grid-compact">${cards}</div></section>`;
  }

  function homeMarkup(list) {
    const featured = videoById('baltika-0-prologue') || videos[0];
    const feature = featured && !query && activeCategory === 'all' ? `
      <section class="feature-hero" aria-label="Премьера: ${esc(featured.title)}">
        <div class="feature-copy">
          <span class="eyebrow"><span class="eyebrow-pulse"></span> НОВОЕ · ПРЕМЬЕРА</span>
          <p class="feature-overline">ПОХОЖДЕНИЯ БАЛТИКИ 0</p>
          <h1>Ожившая банка.<br><em>Большие похождения.</em></h1>
          <p class="feature-description">Пролог мемного мультфильма: пропавший холодильник, ночная Газель и командиры в банках. Сатира в вымышленной вселенной — не репортаж.</p>
          <div class="feature-meta"><span>Мультфильм</span><i></i><span>1:13</span><i></i><span>9:16</span></div>
          <div class="feature-actions">
            <button class="primary-watch" type="button" data-watch="${esc(featured.id)}">${icon('play')} Смотреть пролог</button>
            <button class="feature-save" type="button" data-toggle="later" data-id="${esc(featured.id)}">${icon(state.later.includes(featured.id) ? 'check' : 'bookmark')} ${state.later.includes(featured.id) ? 'В библиотеке' : 'Смотреть позже'}</button>
          </div>
        </div>
        <button class="feature-art" type="button" data-watch="${esc(featured.id)}" aria-label="Смотреть пролог Балтика 0">
          <img src="${esc(featured.poster)}" alt="Обложка мультфильма Похождения Балтики 0" fetchpriority="high">
          <span class="feature-art-play">${icon('play')}</span>
          <span class="feature-art-label">НОВЫЙ ПРОЛОГ</span>
        </button>
        <div class="feature-orbit" aria-hidden="true"></div>
      </section>` : '';

    const grid = list.map((video, index) => videoCard(video, index)).join('');
    const empty = emptyState(query ? 'Ничего не нашлось' : 'В этой подборке пока пусто', query ? 'Проверьте запрос или попробуйте другие слова.' : 'Выберите другой раздел или вернитесь на главную.');
    return `${feature}${continueSection()}<section class="content-section">${sectionHeading(query ? `Результаты поиска: «${query}»` : (activeCategory === 'all' ? 'Все видео' : categoryChips.find((item) => item.id === activeCategory)?.label || 'Видео'), query ? 'Поиск по всей видеотеке' : 'Смотрите серии Бориса, короткие ролики и новые истории', list.length)}${list.length ? `<div class="video-grid">${grid}</div>` : empty}</section>`;
  }

  function emptyState(title, description) {
    return `<div class="empty-state"><div class="empty-icon">${icon('search')}</div><h3>${esc(title)}</h3><p>${esc(description)}</p><button class="empty-reset" type="button" data-reset>На главную</button></div>`;
  }

  function listingMarkup(list) {
    const labels = {
      series: ['Серии Бориса', 'Полные эпизоды и продолжения историй'],
      shorts: ['Shorts', 'Короткие вертикальные версии и отдельные мини-истории'],
      chess: ['Квеня и шахматы', 'Партии, разборы и комментарии Зузы'],
      meme: ['Похождения Балтики 0', 'Авторский пролог — 1 минута 13 секунд'],
      history: ['История просмотров', 'Недавно открытые видео на этом устройстве'],
      later: ['Смотреть позже', 'Сохранённые видео в вашей личной библиотеке'],
      liked: ['Понравившиеся', 'Видео, которые вы отметили сердцем']
    };
    const [title, description] = labels[currentView] || ['Видеотека', ''];
    const heading = query ? `Результаты поиска: «${query}»` : title;
    const subtitle = query ? `Найдено в разделе «${title}»` : description;
    return `<section class="content-section listing-section">${sectionHeading(heading, subtitle, list.length)}${list.length ? `<div class="video-grid">${list.map((video, index) => videoCard(video, index)).join('')}</div>` : emptyState(query ? 'Ничего не нашлось' : emptyTitle(currentView), query ? 'Проверьте запрос или попробуйте другие слова.' : emptyDescription(currentView))}</section>`;
  }

  function emptyTitle(view) {
    if (view === 'history') return 'История пока пуста';
    if (view === 'later') return 'Пока ничего не сохранено';
    if (view === 'liked') return 'Здесь появятся любимые видео';
    return 'Видео не найдены';
  }

  function emptyDescription(view) {
    if (view === 'history') return 'Откройте любое видео — оно появится здесь автоматически.';
    if (view === 'later') return 'Нажмите меню на карточке и выберите «Смотреть позже». Список останется на этом устройстве.';
    if (view === 'liked') return 'Отметьте понравившееся видео сердцем в меню карточки.';
    return 'Попробуйте выбрать другой раздел.';
  }

  function render() {
    if (!page) return;
    renderChips();
    updateNav();
    if (clearSearch) clearSearch.hidden = !query;
    const list = filteredVideos();
    if (currentView === 'home') page.innerHTML = homeMarkup(list);
    else page.innerHTML = listingMarkup(list);
  }

  function setView(view) {
    if (!views.includes(view)) return;
    currentView = view;
    if (view === 'home') activeCategory = 'all';
    query = '';
    if (searchInput) searchInput.value = '';
    if (mobileSearchInput) mobileSearchInput.value = '';
    if (clearSearch) clearSearch.hidden = true;
    mobileSearchPanel.classList.remove('is-open');
    updateURL();
    render();
    closeSidebar();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function toggleMember(listName, id, button) {
    const list = state[listName];
    const index = list.indexOf(id);
    if (index >= 0) list.splice(index, 1);
    else list.unshift(id);
    saveState();
    const added = index < 0;
    const label = listName === 'later' ? (added ? 'Добавлено в «Смотреть позже»' : 'Удалено из «Смотреть позже»') : (added ? 'Добавлено в понравившиеся' : 'Убрано из понравившихся');
    showToast(label);
    if (player && player.videoId === id) {
      updatePlayerActions();
      return;
    }
    const cardMenu = button && button.closest('.card-menu-popover');
    render();
    if (cardMenu) {
      const menu = document.querySelector(`[data-menu-for="${cssEscape(id)}"]`);
      if (menu) menu.hidden = false;
      const trigger = document.querySelector(`[data-menu="${cssEscape(id)}"]`);
      if (trigger) trigger.setAttribute('aria-expanded', 'true');
    }
  }

  function cssEscape(value) {
    if (window.CSS && typeof window.CSS.escape === 'function') return window.CSS.escape(value);
    return String(value).replace(/[^a-zA-Z0-9_-]/g, '\\$&');
  }

  function closeMenus(except) {
    document.querySelectorAll('.card-menu-popover:not([hidden])').forEach((menu) => {
      if (except && menu.dataset.menuFor === except) return;
      menu.hidden = true;
      const trigger = document.querySelector(`[data-menu="${cssEscape(menu.dataset.menuFor)}"]`);
      if (trigger) trigger.setAttribute('aria-expanded', 'false');
    });
  }

  function playerMarkup(video) {
    const isVertical = video.format === '9:16';
    const prev = player.neighbors[player.index - 1];
    const next = player.neighbors[player.index + 1];
    return `
      <div class="player-modal" id="playerModal" role="dialog" aria-modal="true" aria-label="${esc(video.title)}">
        <div class="player-dialog">
          <header class="player-header">
            <a class="player-brand" href="./index.html" data-home><span class="brand-mark">${icon('play')}</span><span>БОРИС<span>ВИДЕО</span></span></a>
            <div class="player-header-actions">
              ${prev ? `<button class="icon-button player-nav-button" type="button" data-player-move="-1" aria-label="Предыдущее видео" title="Предыдущее видео">${icon('arrow')}</button>` : ''}
              ${next ? `<button class="icon-button player-nav-button" type="button" data-player-move="1" aria-label="Следующее видео" title="Следующее видео">${icon('arrow')}</button>` : ''}
              <a class="icon-button player-download" href="${esc(video.file)}" download="${esc(video.file.split('/').pop())}" aria-label="Скачать видео" title="Скачать">${icon('download')}</a>
              <button class="icon-button player-close" type="button" data-close-player aria-label="Закрыть видео" title="Закрыть">${icon('close')}</button>
            </div>
          </header>
          <div class="player-layout">
            <div class="player-main">
              <div class="modal-media ${isVertical ? 'is-vertical' : ''}">
                <video id="activeVideo" controls playsinline preload="metadata" poster="${esc(video.poster)}" src="${esc(video.file)}" aria-label="${esc(video.title)}"></video>
              </div>
              <div class="player-details">
                <span class="video-badge modal-badge">${esc(video.badge || video.channel)}</span>
                <h1>${esc(video.title)}</h1>
                <div class="player-detail-meta"><span>${esc(video.channel)}</span><i></i><span>${formatTime(video.duration)}</span><i></i><span>${video.format === '9:16' ? 'Вертикальное видео' : 'Полный экран'}</span></div>
                <p class="player-description">${esc(video.description)}</p>
                <div class="player-actions">
                  <button class="player-action${state.liked.includes(video.id) ? ' is-selected' : ''}" type="button" data-toggle="liked" data-id="${esc(video.id)}" id="playerLike">${icon('heart')} <span>${state.liked.includes(video.id) ? 'Понравилось' : 'Мне нравится'}</span></button>
                  <button class="player-action${state.later.includes(video.id) ? ' is-selected' : ''}" type="button" data-toggle="later" data-id="${esc(video.id)}" id="playerLater">${icon(state.later.includes(video.id) ? 'check' : 'bookmark')} <span>${state.later.includes(video.id) ? 'Сохранено' : 'Смотреть позже'}</span></button>
                  <button class="player-action" type="button" data-share="${esc(video.id)}">${icon('share')} <span>Поделиться</span></button>
                  <a class="player-action" href="${esc(video.file)}" download="${esc(video.file.split('/').pop())}">${icon('download')} <span>Скачать MP4</span></a>
                </div>
              </div>
            </div>
            <aside class="up-next">
              <div class="up-next-heading"><div><strong>Следом</strong><span>В этой подборке</span></div>${next ? `<button type="button" data-player-move="1" aria-label="Следующее видео">${icon('arrow')}</button>` : ''}</div>
              ${next ? `<button class="up-next-card" type="button" data-watch="${esc(next.id)}">${posterMarkup(next, 'up-next-thumb')}<span class="up-next-copy"><strong>${esc(next.title)}</strong><small>${esc(next.channel)} · ${formatTime(next.duration)}</small></span></button>` : `<p class="up-next-end">Вы дошли до конца подборки.</p>`}
              <div class="player-note">Все видео воспроизводятся из файлов проекта. История и списки сохранены только в этом браузере.</div>
            </aside>
          </div>
        </div>
      </div>`;
  }

  function openPlayer(id, neighborList = null) {
    const video = videoById(id);
    if (!video) return;
    const previousFocus = player && player.returnFocus;
    closePlayer(false);
    const neighbors = neighborList && neighborList.length ? neighborList : filteredVideos();
    const list = neighbors.some((item) => item.id === id) ? neighbors : [video, ...neighbors];
    const index = list.findIndex((item) => item.id === id);
    player = { videoId: id, neighbors: list, index: Math.max(0, index), video: null, returnFocus: previousFocus || document.activeElement };
    document.body.insertAdjacentHTML('beforeend', playerMarkup(video));
    document.body.classList.add('player-open');
    const modal = document.getElementById('playerModal');
    const videoElement = document.getElementById('activeVideo');
    if (!modal || !videoElement) return;
    player.video = videoElement;
    const saved = state.progress[id];
    let hasResumed = false;
    const resume = () => {
      if (hasResumed || !saved || saved.completed || !Number.isFinite(videoElement.duration)) return;
      hasResumed = true;
      if (saved.current > 5 && saved.current < videoElement.duration - 8) {
        try {
          videoElement.currentTime = saved.current;
          showToast(`Продолжили с ${formatTime(saved.current)}`);
        } catch (_) { /* browser can seek after metadata */ }
      }
    };
    videoElement.addEventListener('loadedmetadata', resume, { once: true });
    videoElement.addEventListener('play', () => {
      state.history = [id, ...state.history.filter((item) => item !== id)].slice(0, 100);
      saveState();
    });
    let lastStoredAt = 0;
    videoElement.addEventListener('timeupdate', () => {
      if (!videoElement.duration || !Number.isFinite(videoElement.duration)) return;
      const now = Date.now();
      if (now - lastStoredAt < 4500 && videoElement.currentTime < videoElement.duration - 3) return;
      lastStoredAt = now;
      state.progress[id] = {
        current: videoElement.currentTime,
        duration: videoElement.duration,
        updatedAt: now,
        completed: false
      };
      saveState();
    });
    videoElement.addEventListener('ended', () => {
      state.progress[id] = { current: 0, duration: videoElement.duration || video.duration, updatedAt: Date.now(), completed: true };
      saveState();
      showToast('Видео просмотрено');
    });
    videoElement.addEventListener('error', () => {
      showToast('Не удалось открыть видео. Проверьте, что сайт запущен из корня проекта.');
    });
    modal.querySelector('.player-close')?.focus();
    setPlayerHash(id);
    const playPromise = videoElement.play();
    if (playPromise && typeof playPromise.catch === 'function') playPromise.catch(() => {});
  }

  function setPlayerHash(id) {
    try {
      history.replaceState({}, '', `${location.pathname}${location.search}#watch=${encodeURIComponent(id)}`);
    } catch (_) { /* ignore */ }
  }

  function clearPlayerHash() {
    try {
      if (location.hash.startsWith('#watch=')) history.replaceState({}, '', `${location.pathname}${location.search}`);
    } catch (_) { /* ignore */ }
  }

  function closePlayer(restoreFocus = true) {
    const modal = document.getElementById('playerModal');
    const videoId = player && player.videoId;
    const focusTarget = player && player.returnFocus;
    if (player && player.video) {
      try {
        if (player.video.duration && Number.isFinite(player.video.duration)) {
          state.progress[player.videoId] = {
            current: player.video.currentTime,
            duration: player.video.duration,
            updatedAt: Date.now(),
            completed: player.video.ended
          };
        }
        player.video.pause();
        saveState();
      } catch (_) { /* playback can be unavailable */ }
    }
    if (modal) modal.remove();
    document.body.classList.remove('player-open');
    player = null;
    clearPlayerHash();
    if (modal) render();
    if (restoreFocus) {
      const fallback = videoId && document.querySelector(`.thumb-button[data-watch="${cssEscape(videoId)}"]`);
      const target = focusTarget && focusTarget.isConnected ? focusTarget : fallback;
      if (target && typeof target.focus === 'function') target.focus({ preventScroll: true });
    }
  }

  function updatePlayerActions() {
    if (!player) return;
    const like = document.getElementById('playerLike');
    const later = document.getElementById('playerLater');
    if (like) {
      const selected = state.liked.includes(player.videoId);
      like.classList.toggle('is-selected', selected);
      like.innerHTML = `${icon('heart')} <span>${selected ? 'Понравилось' : 'Мне нравится'}</span>`;
    }
    if (later) {
      const selected = state.later.includes(player.videoId);
      later.classList.toggle('is-selected', selected);
      later.innerHTML = `${icon(selected ? 'check' : 'bookmark')} <span>${selected ? 'Сохранено' : 'Смотреть позже'}</span>`;
    }
  }

  function movePlayer(direction) {
    if (!player) return;
    const target = player.neighbors[player.index + direction];
    if (!target) return;
    const returnFocus = player.returnFocus;
    const list = player.neighbors;
    closePlayer(false);
    openPlayer(target.id, list);
    if (player) player.returnFocus = returnFocus;
  }

  async function shareVideo(id) {
    const video = videoById(id);
    if (!video) return;
    const shareUrl = new URL(location.href);
    shareUrl.hash = `watch=${encodeURIComponent(id)}`;
    const payload = { title: video.title, text: video.description, url: shareUrl.toString() };
    try {
      if (navigator.share) {
        await navigator.share(payload);
      } else if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(payload.url);
        showToast('Ссылка скопирована');
      } else {
        window.prompt('Скопируйте ссылку на видео:', payload.url);
      }
    } catch (error) {
      if (error && error.name !== 'AbortError') showToast('Не удалось поделиться ссылкой');
    }
  }

  function updateSidebarToggle() {
    const button = document.getElementById('sidebarToggle');
    if (!button) return;
    const expanded = window.matchMedia('(max-width: 600px)').matches
      ? sidebar.classList.contains('is-open')
      : window.matchMedia('(max-width: 1080px)').matches
        ? document.body.classList.contains('sidebar-expanded')
        : !document.body.classList.contains('sidebar-collapsed');
    button.setAttribute('aria-expanded', String(expanded));
    button.setAttribute('aria-label', expanded ? 'Свернуть меню' : 'Открыть меню');
  }

  function closeSidebar() {
    sidebar.classList.remove('is-open');
    sidebarShade.classList.remove('is-visible');
    document.body.classList.remove('sidebar-open', 'sidebar-expanded');
    updateSidebarToggle();
  }

  function openSidebar() {
    sidebar.classList.add('is-open');
    sidebarShade.classList.add('is-visible');
    document.body.classList.add('sidebar-open');
    updateSidebarToggle();
  }

  document.addEventListener('click', (event) => {
    const viewButton = event.target.closest('[data-view]');
    if (viewButton) {
      setView(viewButton.dataset.view);
      return;
    }
    const homeLink = event.target.closest('[data-home]');
    if (homeLink) {
      event.preventDefault();
      if (player) closePlayer(false);
      setView('home');
      return;
    }
    const chip = event.target.closest('[data-category]');
    if (chip) {
      activeCategory = chip.dataset.category;
      render();
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    const watchButton = event.target.closest('[data-watch]');
    if (watchButton) {
      const activeList = filteredVideos();
      openPlayer(watchButton.dataset.watch, activeList);
      return;
    }
    const toggle = event.target.closest('[data-toggle]');
    if (toggle) {
      toggleMember(toggle.dataset.toggle, toggle.dataset.id, toggle);
      return;
    }
    const menuTrigger = event.target.closest('[data-menu]');
    if (menuTrigger) {
      const id = menuTrigger.dataset.menu;
      const targetMenu = document.querySelector(`[data-menu-for="${cssEscape(id)}"]`);
      const willOpen = targetMenu && targetMenu.hidden;
      closeMenus(id);
      if (targetMenu) {
        targetMenu.hidden = !willOpen;
        menuTrigger.setAttribute('aria-expanded', willOpen ? 'true' : 'false');
      }
      event.stopPropagation();
      return;
    }
    if (event.target.closest('[data-share]')) {
      shareVideo(event.target.closest('[data-share]').dataset.share);
      return;
    }
    const close = event.target.closest('[data-close-player]');
    if (close) {
      closePlayer();
      return;
    }
    if (event.target.matches('.player-dialog, .player-layout')) {
      closePlayer();
      return;
    }
    const move = event.target.closest('[data-player-move]');
    if (move) {
      movePlayer(Number(move.dataset.playerMove));
      return;
    }
    if (event.target.closest('[data-reset]')) {
      setView('home');
      return;
    }
    closeMenus();
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      if (player) closePlayer();
      else closeSidebar();
    }
    if (player && event.key === 'Tab') {
      const modal = document.getElementById('playerModal');
      const focusable = modal ? [...modal.querySelectorAll('button:not([disabled]), a[href], video[controls]')]
        .filter((element) => !element.hidden && element.getAttribute('tabindex') !== '-1') : [];
      if (focusable.length) {
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && (document.activeElement === first || !modal.contains(document.activeElement))) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && (document.activeElement === last || !modal.contains(document.activeElement))) {
          event.preventDefault();
          first.focus();
        }
      }
    }
    if (player && !event.metaKey && !event.ctrlKey && !event.altKey) {
      const target = event.target;
      const typing = target && (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT', 'VIDEO'].includes(target.tagName));
      if (!typing && event.key === 'ArrowRight' && player.index < player.neighbors.length - 1) movePlayer(1);
      if (!typing && event.key === 'ArrowLeft' && player.index > 0) movePlayer(-1);
    }
  });

  document.getElementById('sidebarToggle')?.addEventListener('click', () => {
    if (window.matchMedia('(max-width: 600px)').matches) {
      if (sidebar.classList.contains('is-open')) closeSidebar();
      else openSidebar();
    } else if (window.matchMedia('(max-width: 1080px)').matches) {
      document.body.classList.toggle('sidebar-expanded');
      updateSidebarToggle();
    } else {
      document.body.classList.toggle('sidebar-collapsed');
      updateSidebarToggle();
    }
  });
  updateSidebarToggle();
  sidebarShade?.addEventListener('click', closeSidebar);
  document.getElementById('mobileSearchToggle')?.addEventListener('click', () => {
    mobileSearchPanel.classList.toggle('is-open');
    if (mobileSearchPanel.classList.contains('is-open')) mobileSearchInput.focus();
  });

  function handleSearchSubmit(event, input) {
    event.preventDefault();
    updateSearch(input.value);
    mobileSearchPanel.classList.remove('is-open');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  searchForm?.addEventListener('submit', (event) => handleSearchSubmit(event, searchInput));
  mobileSearchForm?.addEventListener('submit', (event) => handleSearchSubmit(event, mobileSearchInput));
  searchInput?.addEventListener('input', () => updateSearch(searchInput.value));
  mobileSearchInput?.addEventListener('input', () => updateSearch(mobileSearchInput.value));
  clearSearch?.addEventListener('click', () => {
    updateSearch('');
    searchInput.focus();
  });

  window.addEventListener('popstate', () => {
    query = new URLSearchParams(location.search).get('q') || '';
    if (searchInput) searchInput.value = query;
    if (mobileSearchInput) mobileSearchInput.value = query;
    render();
  });

  const initialWatch = location.hash.match(/^#watch=([^&]+)/);
  render();
  if (query && searchInput) searchInput.value = query;
  if (initialWatch) {
    const id = decodeURIComponent(initialWatch[1]);
    window.setTimeout(() => openPlayer(id, videos.slice().sort((a, b) => a.order - b.order)), 0);
  }
})();
