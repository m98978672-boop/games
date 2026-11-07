# ASSETS_CREDITS — ассеты и лицензии

## Статус
Все визуальные и звуковые материалы созданы внутри проекта. Внешние ассеты
не использовались, поэтому сторонних лицензий нет. Финальный арт — этап 9.

## Графика (PNG, растровая)
| Файлы | Что | Размер | Статус |
|---|---|---|---|
| `assets/tiles/*.png` | трава, грязь, лес, вода, дорога, город, болото (2–3 варианта) | 32×32 | PLACEHOLDER_REPLACE |
| `assets/sprites/infantry_*`, `mg_*`, `medic_*`, `engineer_*`, `scout_*`, `driver_*`, `tanker_*` | пехота, 2 фракции × 4 направления | 32×32 | PLACEHOLDER_REPLACE |
| `assets/sprites/tank_*`, `truck_*` | техника, 2 фракции × 4 направления | 64×64 | PLACEHOLDER_REPLACE |
| `assets/sprites/{sandbags,wire,trench,mg_nest,bunker,watchtower,depot,factory,farm,hq,city,bridge}_*` | постройки и точки | 64–128 | PLACEHOLDER_REPLACE |
| `assets/fx/{muzzle,explosion,smoke,blood}.png` | эффекты | 16–64 | PLACEHOLDER_REPLACE |
| `assets/ui/*.png` | иконки ролей, ресурсов, приказов, оповещений, логотип | 32–128 | PLACEHOLDER_REPLACE |
| `cover.svg` | обложка карточки игры | 1440×810 | OK (собственная векторная обложка сайта) |
| `docs/map-preview.png` | превью карты для документации | 1024×1024 | служебное |

Генератор: `tools/gen-assets.mjs` (`npm run assets`). Формат — несжатый RGBA PNG,
кодируется встроенным zlib, без внешних библиотек.

### Чем заменять
* Персонаж/техника: 32×32 и 64×64, 4–8 направлений, палитра ≤32 цвета.
* Источники с CC0: Kenney (Tower Defense / Top-down Tanks), OpenGameArt CC0-наборы.
* CC-BY 4.0 допустим с указанием автора и ссылки в этом файле.
* CC-NC, «non-commercial», ассеты из других игр и AI-арт без явной лицензии — нельзя.

## Звук
| Что | Как сделано | Статус |
|---|---|---|
| Выстрелы, взрывы, попадания, перезарядка | синтез WebAudio по описаниям `data/audio.json` | PLACEHOLDER_REPLACE |
| Радио, UI, оповещения, стройка | синтез WebAudio | PLACEHOLDER_REPLACE |
| Музыка | медленные низкие ноты (2 режима: меню/бой) | PLACEHOLDER_REPLACE |

Параметры звука — только в `data/audio.json`: `synth` (noise/mixed/osc), `dur`,
`gain`, `freq`, `filter`, `decay`. Позиционность: затухание до 1500 px, lowpass
для далёкого боя, пул 24 голоса.

### Чем заменять
* CC0: Kenney Audio Packs, Freesound CC0-фильтр, OpenGameArt CC0 SFX.
* Формат: OGG/MP3, моно, 44.1 кГц; громкость выравнивать по `gain` в конфиге.

## Шрифты
Системный стек `Trebuchet MS / Segoe UI / sans-serif` — без внешних файлов.

## Лицензия кода
Код игры — часть репозитория `games`; см. корневой `LICENSE` репозитория.

## Стены зданий v2 (0.11.0)

Графика стен рисуется кодом (`renderer.drawWalls()`): линии сегментов цветом материала из
`data/wall_materials.json`, трещины на стадиях урона, обломки в проломах, створки дверей с
анимацией, штриховка бойниц и пунктир проломов. Новых растровых файлов не добавлено, внешние
ассеты не использовались — только собственные палитры материалов (`color`/`edge`/`rubble`).
Спрайты зданий остались прежними (плейсхолдеры `PLACEHOLDER_REPLACE`), это не менялось.
