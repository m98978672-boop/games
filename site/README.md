# Витрина сайта Games

`index.html` в корне репозитория генерируется из `site/index.html` скриптом `site/sync-root.mjs`.
Так GitHub Pages отдаёт витрину по адресу https://m98978672-boop.github.io/games/,
а исходник и оптимизированные обложки живут рядом в `site/`.

```
site/
├── index.html          витрина (исходник)
├── site.css            стили витрины (тёмный обсидиан + тёплое золото)
├── games-data.js       единый реестр 17 игр и проектов (работает и с file://)
├── portal.js           поиск, фильтры, новинки, избранное, недавние, модалка и фон
├── sync-root.mjs       синхронизация site/index.html → ../index.html
├── site.webmanifest    манифест PWA
├── community-games.json реестр принятых игр сообщества
├── community-games.js  безопасная отрисовка карточек из реестра сообщества
├── tests/
│   ├── community-catalog.mjs проверка реестра сообщества и форм
│   └── portal.mjs            проверка витрины, путей ассетов и синхронности index.html
├── assets/             обложки (WebP + JPEG fallback) и иконка сайта
└── 404.html            страница «не найдено»
```

## Правило правок

Меняешь витрину — правь `site/index.html`, `site/games-data.js`, `site/portal.js` или `site/site.css`,
а затем синхронизируй корневой `index.html` и прогони проверки:

```bash
node site/sync-root.mjs
node site/tests/community-catalog.mjs
node site/tests/portal.mjs
node tools/bughunt/bughunt.mjs --play --only site
```

## Игры сообщества

Для новой игры сообщества добавь запись в `community-games.json` — `community-games.js` безопасно
отрисует карточку и на корневой витрине, и в `site/index.html`. Требования описаны в
[`../CONTRIBUTING.md`](../CONTRIBUTING.md).
