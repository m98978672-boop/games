(() => {
  const grid = document.getElementById('community-game-grid');
  const empty = document.getElementById('community-empty');
  const count = document.getElementById('community-game-count');
  if (!grid || !empty || !count) return;

  const scriptUrl = document.currentScript?.src
    ? new URL(document.currentScript.src)
    : new URL('../site/community-games.js', window.location.href);
  const catalogUrl = new URL('community-games.json', scriptUrl);
  const repositoryRoot = new URL('../', scriptUrl);
  const gameIdPattern = /^[a-z0-9][a-z0-9-]{1,47}$/;

  function text(value, limit) {
    if (typeof value !== 'string') return '';
    return value.trim().slice(0, limit);
  }

  function localFile(value, expected) {
    if (typeof value !== 'string') return null;
    try {
      const url = new URL(value, catalogUrl);
      if (url.origin !== repositoryRoot.origin || url.pathname !== expected.pathname || url.search || url.hash) return null;
      return url.href;
    } catch {
      return null;
    }
  }

  function validateGame(candidate) {
    if (!candidate || typeof candidate !== 'object' || !gameIdPattern.test(candidate.id || '')) return null;
    const id = candidate.id;
    const title = text(candidate.title, 80);
    const subtitle = text(candidate.subtitle, 110);
    const description = text(candidate.description, 320);
    const cover = localFile(candidate.cover, new URL(`../${id}/cover.svg`, catalogUrl));
    const play = localFile(candidate.play, new URL(`../${id}/index.html`, catalogUrl));
    const readme = localFile(candidate.readme, new URL(`../${id}/README.md`, catalogUrl));
    if (!title || !description || !cover || !play || !readme) return null;

    const features = Array.isArray(candidate.features)
      ? candidate.features.map((feature) => text(feature, 110)).filter(Boolean).slice(0, 4)
      : [];
    return {
      id,
      title,
      subtitle,
      description,
      version: text(candidate.version, 24),
      cover,
      play,
      readme,
      features,
    };
  }

  function createCard(game) {
    const article = document.createElement('article');
    article.className = 'community-game-card';

    const coverLink = document.createElement('a');
    coverLink.className = 'community-game-cover';
    coverLink.href = game.play;
    coverLink.setAttribute('aria-label', `Играть: ${game.title}`);
    const image = document.createElement('img');
    image.src = game.cover;
    image.alt = `Обложка игры «${game.title}»`;
    image.loading = 'lazy';
    image.width = 1440;
    image.height = 810;
    coverLink.append(image);
    if (game.version) {
      const badge = document.createElement('span');
      badge.className = 'community-game-version';
      badge.textContent = game.version;
      coverLink.append(badge);
    }

    const body = document.createElement('div');
    body.className = 'community-game-body';
    const heading = document.createElement('h3');
    heading.textContent = game.title;
    body.append(heading);
    if (game.subtitle) {
      const subtitle = document.createElement('p');
      subtitle.className = 'community-game-subtitle';
      subtitle.textContent = game.subtitle;
      body.append(subtitle);
    }
    const description = document.createElement('p');
    description.className = 'community-game-description';
    description.textContent = game.description;
    body.append(description);

    if (game.features.length) {
      const list = document.createElement('ul');
      list.className = 'community-game-features';
      for (const feature of game.features) {
        const item = document.createElement('li');
        item.textContent = feature;
        list.append(item);
      }
      body.append(list);
    }

    const actions = document.createElement('div');
    actions.className = 'community-game-actions';
    const play = document.createElement('a');
    play.className = 'community-play-link';
    play.href = game.play;
    play.textContent = 'Играть';
    const readme = document.createElement('a');
    readme.className = 'community-info-link';
    readme.href = game.readme;
    readme.textContent = 'Об игре';
    actions.append(play, readme);
    body.append(actions);

    article.append(coverLink, body);
    return article;
  }

  fetch(catalogUrl, { cache: 'no-store' })
    .then((response) => {
      if (!response.ok) throw new Error('Community catalog request failed.');
      return response.json();
    })
    .then((catalog) => {
      if (!catalog || catalog.schemaVersion !== 1 || !Array.isArray(catalog.games)) throw new Error('Community catalog format is invalid.');
      const ids = new Set();
      const games = catalog.games.slice(0, 60).map(validateGame).filter((game) => {
        if (!game || ids.has(game.id)) return false;
        ids.add(game.id);
        return true;
      });
      count.textContent = String(games.length).padStart(2, '0');
      grid.replaceChildren(...games.map(createCard));
      empty.hidden = games.length > 0;
    })
    .catch(() => {
      count.textContent = '—';
      empty.textContent = 'Каталог сообщества сейчас не загрузился. Попробуйте обновить страницу позже.';
    });
})();
