# Витрина сайта

`index.html` в корне репозитория — копия этого файла с путями, поправленными под корень
(`site/site.css`, `site/assets/…`, `last-shore/index.html`). Так GitHub Pages отдаёт витрину
по адресу https://m98978672-boop.github.io/games/, а исходник лежит рядом с ассетами.

```
site/
├── index.html        витрина (исходник; ссылки на ../last-shore/…)
├── site.css          стили витрины
├── site.webmanifest  манифест (установка как приложение)
├── assets/
│   ├── last-shore.jpg обложка LAST SHORE (скриншот игры)
│   ├── frontline.jpg  обложка «Линии Фронта» (скриншот игры)
│   └── icon.svg       иконка сайта
└── 404.html          страница «не найдено» (используется только при custom 404)
```

## Как обновить обложки

Обложки — настоящие кадры из игр. Снимаются скриптом:

```bash
cd last-shore
node tests/covers.mjs        # кладёт две .jpg в site/assets
```

## Правило правок

Меняешь витрину — правь `site/index.html`, потом скопируй в корень, поправив пути:

```bash
# из корня репозитория
sed -e 's|src="assets/|src="site/assets/|g' \
    -e 's|href="assets/|href="site/assets/|g' \
    -e 's|href="site.css"|href="site/site.css"|' \
    -e 's|href="site.webmanifest"|href="site/site.webmanifest"|' \
    -e 's|href="\.\./\([a-z0-9-]*\)/|href="\1/|g' \
    -e 's|src="\.\./\([a-z0-9-]*\)/|src="\1/|g' \
    site/index.html > index.html
```
