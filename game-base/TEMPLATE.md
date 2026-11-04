# 🧩 TEMPLATE — как создать новую игру на базе БАЗЫ

Эта инструкция — для любого ИИ (или человека): сделай новую игру за 9 шагов,
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

## Шаг 8. Добавь игру в каталог сообщества

Не редактируй карточки вручную в двух HTML-файлах. Добавь одну запись в [`../site/community-games.json`](../site/community-games.json); общий скрипт покажет её на обеих версиях витрины после принятия Pull Request.

```json
{
  "id": "moya-igra",
  "title": "Название игры",
  "subtitle": "Короткая строка о жанре",
  "description": "Что делает игрок и в чём особенность игры.",
  "version": "v0.1",
  "cover": "../moya-igra/cover.svg",
  "play": "../moya-igra/index.html",
  "readme": "../moya-igra/README.md",
  "features": ["Первая особенность", "Вторая особенность"]
}
```

`id` совпадает с именем папки (kebab-case); пути должны быть локальными. Укажи права/лицензию на игру и материалы в `moya-igra/LICENSE.md`. Смотри [`../CONTRIBUTING.md`](../CONTRIBUTING.md).

## Шаг 9. Проверь

```
node moya-igra/tests/smoke.mjs     # структура и ссылки
node site/tests/community-catalog.mjs
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
- [ ] Запись в `site/community-games.json`; открыть Pull Request для проверки и публикации
