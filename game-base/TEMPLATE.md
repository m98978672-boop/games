# 🧩 TEMPLATE — как создать новую игру на базе БАЗЫ

Эта инструкция — для любого ИИ (или человека): сделай новую игру за 8 шагов,
и она automatically получит **тот же общий дизайн, что и все игры репозитория**.

> База: папка [`game-base/`](./) + единая тема [`../shared/theme.css`](../shared/theme.css)
> (правила дизайна — [`../shared/README.md`](../shared/README.md)).

## Шаг 1. Скопируй шаблон

Скопируй всю папку `game-base/` в новую папку с именем игры (kebab-case, англ.):

```
games/game-base/  →  games/moya-igra/
```

## Шаг 2. Задай identité игры в `src/config.js`

Поменяй `id`, `title`, `subtitle`, `accent` и параметры механики под свой жанр.
Это единственный файл «настройки» — HUD подхватит название сам.

## Шаг 3. Подключи общий дизайн (уже сделано, проверь)

В `style.css` первой строкой должен быть импорт общей темы:

```css
@import url("../shared/theme.css");
```

Переопредели только акцент игры: `:root { --accent: #…; --accent-2: #…; }`.
**Не меняй** структуру HUD и токены темы — в этом и есть «общий дизайн ± одинаковый».

## Шаг 4. Придумай и реализуй механику в `src/game.js` + `src/render.js`

- `src/game.js` — состояние игры, `update(dt)`, обработка ввода. Смотри пример «Светлячки».
- `src/render.js` — отрисовка на `<canvas id="game">`.
- HUD (`src/ui.js`) уже умеет: статистику в topbar, боковую панель, чипы-подсказки,
  тосты, модалки, паузу, автосохранение. Меняй в нём только **тексты и id статистик**.

## Шаг 5. Обнови `index.html`

- `<title>`, `<meta name="description">`, `og:title/description`;
- favicon (inline SVG data URI в цвете акцента);
- тексты бренда (`.brand-text`) и названия статистик в `.top-stats`;
- порядок `<script src="src/…">` оставь как в шаблоне.

## Шаг 6. Нарисуй обложку `cover.svg`

Размер **1440×810**, тёмный фон (`#0b0d0c`-рядом), акцент игры, крупный заголовок —
как у `road-tycoon/cover.svg`, `euro-haul/cover.svg` и у самой БАЗЫ.

## Шаг 7. Напиши документацию

- `README.md` — как у БАЗЫ: играть, управление (таблица клавиш), структура папки;
- `PLAN.md` — замысел и план развития (см. примеры в других играх).

## Шаг 8. Зарегистрируй игру в витрине

Добавь карточку игры **первой в список или в конец** секции `#games` в обоих файлах:

- корневой [`../index.html`](../index.html) — пути вида `moya-igra/index.html`;
- [`../site/index.html`](../site/index.html) — пути вида `../moya-igra/index.html`;

и секцию об игре в корневой [`../README.md`](../README.md).
Шаблон карточки:

```html
<article class="card card-moya">
  <div class="card-art">
    <img src="moya-igra/cover.svg" alt="Название игры" loading="lazy" width="1440" height="810">
    <span class="badge badge-new">v0.1 · что умеет</span>
  </div>
  <div class="card-body">
    <h2>НАЗВАНИЕ<span>подзаголовок</span></h2>
    <p class="desc">Пара предложений об игре.</p>
    <ul class="features"><li>…</li></ul>
    <div class="card-actions">
      <a class="btn btn-primary" href="moya-igra/index.html">Играть</a>
      <a class="btn" href="moya-igra/README.md">Об игре</a>
    </div>
  </div>
</article>
```

В [`../site/site.css`](../site/site.css) добавь акцент карточки:
`.card-moya .features li::before { background: <акцент>; }`

## Шаг 9. Проверь

```
node moya-igra/tests/smoke.mjs     # структура и ссылки
```

Открой `moya-igra/index.html` двойным кликом — игра должна работать с `file://`,
без сервера, сборки и интернета.

---

## ✅ Обязательный чек-лист «общий дизайн одинаковый"

- [ ] `style.css` начинается с `@import url("../shared/theme.css");`
- [ ] В `index.html` есть `.topbar` (`.brand` + `.top-stats` + `.top-actions`), `.panel.side`, `.bottom-bar` с `.chip.hint`/`.chip.news`, `.pause-flag`, `.toasts`, `.modal-root`, `#save-indicator`
- [ ] `lang="ru"`, `theme-color`, favicon, обложка `cover.svg` 1440×810
- [ ] Сохранение в `localStorage`, автосохранение, индикатор «● автосохранение»
- [ ] Клавиши: `Пробел` пауза, `H` помощь, `S` сохранить, `M` звук, `Esc` закрыть
- [ ] Без CDN и внешних библиотек; обычные `<script src>`; работает с `file://`
- [ ] Мобильная вёрстка и `prefers-reduced-motion` (уже в общей теме)
- [ ] Карточка в `index.html`, `site/index.html`, секция в `README.md`
