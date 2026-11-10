# SOURCES — Источники данных, алгоритмов и ассетов

Дата актуализации: **2026-11-10**

Все числовые параметры симуляции, алгоритмические методы, цветовая палитра, шрифт и референсы аудио проверены по открытым авторитетным источникам без дословного копирования таблиц и проприетарных ассетов.

| № | Что использовано | Сайт | Точный URL | Дата доступа | Лицензия | Где применено в проекте |
|---|---|---|---|---|---|---|
| 1 | Калорийность: печёные и чёрные бобы (268 и 218 kcal/cup) | USDA NAL PDF | https://www.nal.usda.gov/sites/default/files/page-files/Total%20Kcal.pdf | 2026-11-10 | Public Domain (US Gov / USDA) | `data/real/foods.json`, `data/items.json` |
| 2 | Калорийность: яблоко, хлеб, картофель, рис, морковь, томат, клубника, кофе | MyPlate / USDA FDC | https://myplate.world/calories-in-food/ | 2026-11-10 | Public Domain Reference (USDA FDC) | `data/real/foods.json`, `scripts/player/player_needs.gd` |
| 3 | Калорийность: капуста (25 kcal/100g) и вяленая говядина (410 kcal/100g) | CalorieInsight / USDA FDC | https://calorieinsight.com/foods/ | 2026-11-10 | Public Domain Reference (USDA FDC) | `data/real/foods.json`, `data/items.json` |
| 4 | Калорийность говядины (250 kcal/100g) | Wikipedia | https://en.wikipedia.org/wiki/Beef | 2026-11-10 | CC BY-SA 4.0 | `data/real/foods.json`, `scripts/systems/crafting.gd` |
| 5 | Сроки годности мяса в холодильнике и при отключении света (4 ч / 48 ч) | USDA FSIS | https://www.fsis.usda.gov/food-safety/safe-food-handling-and-preparation/food-safety-basics/keeping-food-safe-during | 2026-11-10 | Public Domain (US Gov / USDA) | `data/real/foods.json`, `scripts/world/utilities_system.gd` |
| 6 | Порча мяса при температуре >4°C (>2 ч) и хранение при отключениях | FoodSafety.gov | https://www.foodsafety.gov/food-safety-charts/food-safety-during-power-outage | 2026-11-10 | Public Domain (US HHS) | `data/real/foods.json`, `scripts/systems/loot_system.gd` |
| 7 | Срок хранения птицы и консервов в кладовой (2–5 лет) | USDA FSIS | https://www.fsis.usda.gov/food-safety/safe-food-handling-and-preparation/poultry/chicken-farm-table | 2026-11-10 | Public Domain (US Gov / USDA) | `data/real/foods.json` |
| 8 | Баллистика 9×19mm Parabellum (481 Дж) | Wikipedia | https://en.wikipedia.org/wiki/9%C3%9719mm_Parabellum | 2026-11-10 | CC BY-SA 4.0 | `data/real/weapons.json`, `data/items.json` |
| 9 | Ёмкость магазина Glock 17 (17 патр.) | Wikipedia | https://en.wikipedia.org/wiki/Glock | 2026-11-10 | CC BY-SA 4.0 | `data/real/weapons.json`, `data/items.json` |
| 10 | Баллистика .45 ACP (483 Дж) | Wikipedia | https://en.wikipedia.org/wiki/.45_ACP | 2026-11-10 | CC BY-SA 4.0 | `data/real/weapons.json` |
| 11 | Масса (1.1 кг) и магазин M1911 | Wikipedia | https://en.wikipedia.org/wiki/M1911_pistol | 2026-11-10 | CC BY-SA 4.0 | `data/real/weapons.json`, `data/items.json` |
| 12 | Энергия 12-gauge slug (3204 Дж) | Wikipedia | https://en.wikipedia.org/wiki/Shotgun_slug | 2026-11-10 | CC BY-SA 4.0 | `data/real/weapons.json` |
| 13 | Масса Mossberg 500 (3.18–3.52 кг) | Wikipedia | https://en.wikipedia.org/wiki/Mossberg_500 | 2026-11-10 | CC BY-SA 4.0 | `data/real/weapons.json`, `data/items.json` |
| 14 | Баллистика 5.56×45mm NATO (1797 Дж) | Wikipedia | https://en.wikipedia.org/wiki/5.56%C3%9745mm_NATO | 2026-11-10 | CC BY-SA 4.0 | `data/real/weapons.json` |
| 15 | Масса ArmaLite AR-15 (2.97 кг) | Wikipedia | https://en.wikipedia.org/wiki/ArmaLite_AR-15 | 2026-11-10 | CC BY-SA 4.0 | `data/real/weapons.json`, `data/items.json` |
| 16 | Масса бейсбольной биты (0.94 кг) | Wikipedia | https://en.wikipedia.org/wiki/Baseball_bat | 2026-11-10 | CC BY-SA 4.0 | `data/real/weapons.json` |
| 17 | Масса клинка типа кукри/мачете (450–900 г) | Wikipedia | https://en.wikipedia.org/wiki/Kukri | 2026-11-10 | CC BY-SA 4.0 | `data/real/weapons.json` |
| 18 | Референс категории пожарного топора и ручного инструмента ([ОЦЕНКА] массы) | Wikipedia | https://en.wikipedia.org/wiki/Firefighter%27s_axe | 2026-11-10 | CC BY-SA 4.0 | `data/real/weapons.json` |
| 19 | Референс категории ручных инструментов ([ОЦЕНКА] массы лома) | Wikipedia | https://en.wikipedia.org/wiki/Category:Hand_tools | 2026-11-10 | CC BY-SA 4.0 | `data/real/weapons.json` |
| 20 | Масса и расход топлива седана (Toyota Camry XV50: 1447 кг, 8 л/100км) | Wikipedia | https://en.wikipedia.org/wiki/Toyota_Camry_(XV50) | 2026-11-10 | CC BY-SA 4.0 | `data/real/vehicles.json`, `scripts/systems/vehicle_system.gd` |
| 21 | Масса полицейского седана (Ford Crown Victoria: 1840 кг) | Wikipedia | https://en.wikipedia.org/wiki/Ford_Crown_Victoria | 2026-11-10 | CC BY-SA 4.0 | `data/real/vehicles.json` |
| 22 | Масса (1846 кг) и бак 36 gal (136.3 л) пикапа (Ford F-150 13 gen) | Wikipedia | https://en.wikipedia.org/wiki/Ford_F-Series_(thirteenth_generation) | 2026-11-10 | CC BY-SA 4.0 | `data/real/vehicles.json` |
| 23 | Габариты и архитектура семейства Ford F-150 (14 gen) | Wikipedia | https://en.wikipedia.org/wiki/Ford_F-Series_(fourteenth_generation) | 2026-11-10 | CC BY-SA 4.0 | `data/real/vehicles.json` |
| 24 | Масса и бак минивэна (Dodge Caravan: 1751 кг, 75.7 л) | Wikipedia | https://en.wikipedia.org/wiki/Dodge_Caravan | 2026-11-10 | CC BY-SA 4.0 | `data/real/vehicles.json` |
| 25 | Бак и запас хода грузовика (FMTV: 212 л / 483 км) | Wikipedia | https://en.wikipedia.org/wiki/Family_of_Medium_Tactical_Vehicles | 2026-11-10 | CC BY-SA 4.0 | `data/real/vehicles.json` |
| 26 | Классификация скорой помощи ([ОЦЕНКА] расхода) | Wikipedia | https://en.wikipedia.org/wiki/Ambulance | 2026-11-10 | CC BY-SA 4.0 | `data/real/vehicles.json` |
| 27 | Сроки созревания и урожайность томата, картофеля, моркови, клубники | UMN Extension | https://extension.umn.edu/agriculture/specialty-crops/vegetable-farming/crop-and-field-planning-tools-for-vegetable-farmers | 2026-11-10 | Educational (UMN Extension) | `data/real/crops.json`, `scripts/systems/farming.gd` |
| 28 | Выращивание и морозостойкость капусты, норма полива 25.4 мм/нед | UMN Extension | https://extension.umn.edu/garden-and-home/yard-and-garden/gardening-in-minnesota/growing-cabbage | 2026-11-10 | Educational (UMN Extension) | `data/real/crops.json`, `scripts/systems/farming.gd` |
| 29 | Сроки созревания редиса (3–5 недель) | UMN Extension | https://extension.umn.edu/garden-and-home/yard-and-garden/gardening-in-minnesota/growing-radishes | 2026-11-10 | Educational (UMN Extension) | `data/real/crops.json` |
| 30 | Объём крови (5 л) и пороги шока при кровопотере (20%/40%) | Wikipedia | https://en.wikipedia.org/wiki/Blood | 2026-11-10 | CC BY-SA 4.0 | `data/real/medical.json`, `scripts/player/player_health.gd` |
| 31 | Нормальная температура тела (36.5–37.5°C) | Wikipedia | https://en.wikipedia.org/wiki/Human_body_temperature | 2026-11-10 | CC BY-SA 4.0 | `data/real/medical.json`, `scripts/player/player_needs.gd` |
| 32 | Пороги гипотермии (<35°C) и гипертермии (>37.5°C) | Wikipedia | https://en.wikipedia.org/wiki/Hypothermia | 2026-11-10 | CC BY-SA 4.0 | `data/real/medical.json`, `scripts/player/player_needs.gd` |
| 33 | Суточная норма воды (3.7 л / 2.7 л) | Wikipedia / NAM DRI | https://en.wikipedia.org/wiki/Dietary_Reference_Intake | 2026-11-10 | CC BY-SA 4.0 | `data/real/medical.json`, `scripts/player/player_needs.gd` |
| 34 | Базовый метаболизм человека (~80 Вт) | Wikipedia | https://en.wikipedia.org/wiki/Human_power | 2026-11-10 | CC BY-SA 4.0 | `data/real/medical.json`, `scripts/player/player_needs.gd` |
| 35 | Заживление переломов (6 недель) и риск инфекции открытых ран (30%) | Wikipedia | https://en.wikipedia.org/wiki/Bone_fracture | 2026-11-10 | CC BY-SA 4.0 | `data/real/medical.json`, `scripts/player/player_health.gd` |
| 36 | Климатические нормы (Луисвилл, Кентукки: янв +1.6°C, июль +26.3°C, осадки 1140 мм) | Wikipedia / NOAA | https://en.wikipedia.org/wiki/Louisville,_Kentucky | 2026-11-10 | CC BY-SA 4.0 | `data/real/climate.json`, `scripts/world/time_weather.gd` |
| 37 | Термонейтральная температура среды (21°C) | Wikipedia | https://en.wikipedia.org/wiki/Cold_and_heat_adaptations_in_humans | 2026-11-10 | CC BY-SA 4.0 | `data/real/climate.json`, `scripts/player/player_needs.gd` |
| 38 | Звуковое давление выстрела (>=140 дБ SPL) | Wikipedia | https://en.wikipedia.org/wiki/Gunshot | 2026-11-10 | CC BY-SA 4.0 | `data/real/climate.json`, `scripts/systems/noise_system.gd` |
| 39 | Закон обратных квадратов затухания интенсивности ($I = P / 4\pi r^2$, -6.02 дБ/удвоение) | Wikipedia | https://en.wikipedia.org/wiki/Intensity_(physics) | 2026-11-10 | CC BY-SA 4.0 | `data/real/climate.json`, `scripts/systems/noise_system.gd` |
| 40 | КПД и расход дизель-генератора (3–4 кВт·ч/л) и портативных инверторов | Wikipedia | https://en.wikipedia.org/wiki/Diesel_generator | 2026-11-10 | CC BY-SA 4.0 | `data/real/climate.json`, `scripts/world/utilities_system.gd` |
| 41 | Переносные электрогенераторы ([ОЦЕНКА] дня отключения сети) | Wikipedia | https://en.wikipedia.org/wiki/Portable_generator | 2026-11-10 | CC BY-SA 4.0 | `data/real/climate.json`, `scripts/world/utilities_system.gd` |
| 42 | Алгоритм A* на сетке | Red Blob Games | https://www.redblobgames.com/pathfinding/a-star/introduction.html | 2026-11-10 | Educational / Author Attribution | `scripts/algorithms/pathfinding.gd` |
| 43 | Алгоритм Flow Field (Dijkstra Map + градиент) | Red Blob Games | https://www.redblobgames.com/pathfinding/tower-defense/ | 2026-11-10 | Educational / Author Attribution | `scripts/algorithms/pathfinding.gd` |
| 44 | Рекурсивный 8-октантный Shadowcasting FOV | RogueBasin | https://www.roguebasin.com/index.php/C%2B%2B_shadowcasting_implementation | 2026-11-10 | Public Wiki Reference | `scripts/algorithms/fov_shadowcast.gd` |
| 45 | Симплекс-шум (Simplex Noise) | Wikipedia | https://en.wikipedia.org/wiki/Simplex_noise | 2026-11-10 | CC BY-SA 4.0 | `scripts/algorithms/proc_gen.gd` |
| 46 | Двоичное разбиение пространства (BSP) для зданий | Wikipedia | https://en.wikipedia.org/wiki/Binary_space_partitioning | 2026-11-10 | CC BY-SA 4.0 | `scripts/algorithms/proc_gen.gd` |
| 47 | L-система (Lindenmayer system) для ветвления дорог/растений | Wikipedia | https://en.wikipedia.org/wiki/L-system | 2026-11-10 | CC BY-SA 4.0 | `scripts/algorithms/proc_gen.gd` |
| 48 | Диаграмма Вороного (Voronoi) для районов города | Wikipedia | https://en.wikipedia.org/wiki/Voronoi_diagram | 2026-11-10 | CC BY-SA 4.0 | `scripts/algorithms/proc_gen.gd` |
| 49 | Квадродерево (Quadtree) и пространственное индексирование | Wikipedia | https://en.wikipedia.org/wiki/Quadtree | 2026-11-10 | CC BY-SA 4.0 | `scripts/algorithms/spatial_index.gd` |
| 50 | Палитра «Survival Horror 32 Palette» (32 HEX-цвета) | Lospec | https://lospec.com/palette-list/survival-horror-32 | 2026-11-10 | Public Palette List | `data/palette_survival_horror_32.json`, `tools/` |
| 51 | Пиксельный шрифт с кириллицей «Pixelify Sans» | GitHub | https://github.com/eifetx/Pixelify-Sans | 2026-11-10 | SIL Open Font License 1.1 (OFL-1.1) | `assets/assets_manifest.json`, `scripts/ui/hud.gd` |
| 52 | Аудио-референс: набор зомби-звуков (24 WAV) | OpenGameArt | https://opengameart.org/content/zombies-sound-pack | 2026-11-10 | CC0 1.0 | `assets/assets_manifest.json` (категория J) |
| 53 | Аудио-референс: выстрелы (пистолет, винтовка, дробовик) | OpenGameArt | https://opengameart.org/content/gunshot-sounds | 2026-11-10 | CC0 1.0 | `assets/assets_manifest.json` (категория J) |
| 54 | Аудио-референс: 100 бытовых и уличных SFX (шаги, двери, стекло, дождь) | OpenGameArt | https://opengameart.org/content/100-cc0-sfx-2 | 2026-11-10 | CC0 1.0 | `assets/assets_manifest.json` (категория J) |
| 55 | Аудио-референс: фоли, вода, ткань, UI, человеческие звуки | OpenGameArt | https://opengameart.org/content/sound-effects-pack | 2026-11-10 | CC0 1.0 | `assets/assets_manifest.json` (категория J) |
| 56 | Аудио-референс: мрачный хоррор-эмбиент | OpenGameArt | https://opengameart.org/content/dark-ambiences | 2026-11-10 | CC0 1.0 | `assets/assets_manifest.json` (категория J) |
| 57 | Аудио-референс: природа, дождь, листва, шаги по лесу | OpenGameArt | https://opengameart.org/content/nature-sounds-pack | 2026-11-10 | CC-BY 4.0 | `assets/assets_manifest.json` (категория J) |
