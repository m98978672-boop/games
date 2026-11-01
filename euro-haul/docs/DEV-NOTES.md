# ЕВРОТРАК — рабочие заметки и план восстановления

> Файл нужен, чтобы после отката (reset/revert/потери ветки) можно было за минуту
> понять, что сделано, чем это проверялось и что осталось. Держать в актуальном
> состоянии при каждой крупной правке.

Ветка: `arena/cf9b4703-games` (рабочая), база — `main` = `6857305` (merge PR #64).
Публикация: <https://m98978672-boop.github.io/games/euro-haul/>

---

## 1. Задача текущей итерации

Запрос пользователя: **«Вид из кабины очень поломанный, текстуры и модельки тоже
очень поломанный, интерфейс должен быть лучше в разы»**.

Приёмочные критерии:

1. Из кабины чистый обзор: торпедо и кузов не перекрывают дорогу, геометрия симметричная.
2. Тягач, прицепы и трафик выглядят цельно: без «дыр», торчащих полигонов и тёмных граней.
3. Текстуры без явного тайлинга каждые 0.4 м и без швов.
4. Интерфейс переработан заметно, а не косметически.

---

## 2. Что уже сделано (состояние на конец итерации)

### 2.1. Модель тягача и прицепов — `src/world/truck3d.js` (переписан целиком)

* Координаты: `+z` вперёд, `+y` вверх, `+x` — правый борт. **Водитель слева → минус x.**
* Константы в начале файла:
  * `CAB = { rear: -0.58, front: 3.42, width: 2.5, skirt: 1.16, sill: 2.12,
    roof: 3.52, floor: 1.34, windshieldBottom: 2.06, windshieldTop: 3.22, windshieldZ: 3.2 }`
  * `EYE = { x: -0.55, y: 2.5, z: 1.35 }` — глаз водителя, экспортируется (`export { CAB, EYE }`).
* Кабина собрана из **полого короба** (два борта + перед + зад + днище + крыша),
  а не из сплошного бруска — иначе салон оказывается внутри монолита и перекрывает обзор.
* Нижний пояс кабины — отдельные панели толщиной 0.07 м; лобовое стекло — наклонная
  плоскость с рамкой и козырьком; боковые окна, стойки, двери, ручки, арки, ступеньки,
  зеркала (корпус + стекло), решётка, эмблема, бампер, фары, поворотники, баки, выхлоп.
* Колёса: `LatheGeometry`-покрышка с закруглёнными плечами + диск + колпак + болты.
* Прицепы: `curtain / container / fridge / flatbed / tank / log`.
  Материалы короба — массив из 6 штук в порядке `BoxGeometry`:
  `[правый борт(map), левый борт(зеркальная map), верх, низ, перед, зад]`.
  Функция `bodyMaterials(sideTex, baseColor, roughness)` и `trailerTexture(company, color)`.
* `indicatorMatL / indicatorMatR` — отдельные материалы на борт, иначе мигают оба.
* API (используется в `main.js`): `update(status, dt, {steer, brake, rain, trailerType, company})`,
  `drawDash(status)`, `drawNav(info)`, `setNight`, `setIndicator`, `setBrakeLights`,
  `setPosition`, `setTrailerAngle`, `setPaint`, `setInteriorVisible`, `dispose`.

### 2.2. Салон

* Торпедо: тумба до 1.78 м, наклонный капот к стеклу, кромка под стеклом, дефлекторы.
* Приборный блок: `screenOn(w, h, mat, x, y, z)` — группа, повёрнутая к глазу через
  `lookAt` **с `up = (0,1,0)`** (через `quaternion.setFromUnitVectors` получался крен).
  Экран приборки: `EYE.x - 0.02, 2.06, 2.70`, 512×256, перерисовка по `drawDash`.
* Навигация: `cx = EYE.x + 0.86`, 384×240, перерисовка по `drawNav`.
  ВАЖНО: консоль стоит **справа** от водителя (при `EYE.x = -0.55` это `cx = +0.31`).
* Руль: центр `(EYE.x, 1.82, 2.2)`, наклон `-0.3`, поворот `rotation.z = -steer * 2.9`.
* Сиденья: водитель `EYE.x`, пассажир `+0.62`; подлокотники, динамики, стойки изнутри.
* Дворники вынесены на стекло (`CAB.windshieldBottom + 0.04`) и не закрывают панель.
* Плафон, шторка спальника, солнцезащитные козырьки, зеркало салона.

### 2.3. Материалы и текстуры — `src/world/materials.js` (переписан)

* `canvasTexture(key, w, h, draw, {repeat, srgb, aniso})` + общий кэш.
* `textures`: `asphalt()` 1024² (тёмный асфальт, щебень, следы шин, швы, тайл 7–8 м),
  `grass()` 1024² (луг с травинками и проплешинами, тайл 9 м), `concrete()`, `building()`
  (фасад с окнами, часть светится), `wall()`, `skyline()`.
* `materials()` — кэш с ключами: `asphalt, grass, grassDark, concrete, whiteLine, yellowLine,
  metal, darkMetal, wall, building, roof, roofLight, trunk, leaves[], glass, mirror, lamp,
  lampOff, redLight, blueSign, greenSign, tyres, rim, chrome, headlight, taillight`.
* `setNightIntensity(mats, night)` — светятся окна домов и фонари.
* `trailerTexture(company, color)` — ливрея: тент, фирменная полоса, логотип, грязь у низа.

### 2.4. Дорога — `src/world/road.js`

* `stripGeometry(..., { tile })` — **UV считается в метрах** (`u = lat / tile`, `v = s / tile`),
  аргумент `uvScale` удалён. Тайл асфальта 7 м, травы 9 м.
* Левая обочина: `latsLeft` теперь **от -470 к -14.2** — иначе грани смотрели вниз и
  отсекались (дорога смотрелась «снежной» за счёт тумана). Это был реальный баг.
* Отбойники: две горизонтальные полосы + стойки (`InstancedMesh`, шаг 4 м).
* Столбики со светоотражателем каждые 26 м, асфальт/обочина/разметка — по метрам.

### 2.5. Интерфейс — `index.html` + `style.css` (оба переписаны), `src/ui/ui.js` (доработан)

* SVG-спрайт иконок (`#i-euro`, `#i-clock`, `#i-weather`, `#i-gauge`, `#i-box`, `#i-truck`,
  `#i-shop`, `#i-people`, `#i-map`, `#i-chart`, `#i-cog`, `#i-pause`, `#i-expand`, `#i-menu`),
  вставка через `<use href="#...">`.
* HUD: статус-рейл (уровень-аватар, деньги, XP, часы, погода), знак ограничения скорости,
  карточка рейса, круглая мини-карта с компасом, приборная панель с кольцом спидометра
  (`#speed-ring`, dasharray 245/327), сенсорные зоны, тосты.
* `ui.js`: `hud-avatar` вместо `hud-level`; кольцо скорости + цвет по превышению
  (`--teal / --amber / --red`); `limitEl.classList.toggle('over-speed', ...)`;
  перерисованная `drawMinimap` (масштаб 0.05 px/м, фон-сетка, дорога, пройденный и
  оставшийся отрезок, метки цели/АЗС с прижатием к краю круга, стрелка игрока, виньетка);
  подсказка «поверните телефон» с кнопкой `#rotate-dismiss` (`this.rotateDismissed`).
* Меню: hero-блок с фактами (152/28/30/12) + панель кнопок.
* Медиа-запросы: 1100 / 980 / 720 px, `max-height: 460`, `hover: none` — на сенсоре
  приборы уходят вниз по центру, карта — влево сверху, карточка рейса — справа.

### 2.6. Камера — `src/main.js`

* `updateCamera(dt, instant)` вызывается как
  `this.updateCamera(dt, this.cameraMode !== this.lastCameraMode); this.lastCameraMode = this.cameraMode;`
  — при смене режима камера **ставится сразу**, иначе она «летела» через полкарты.
* Смещения: кабина `(-0.55, 2.5, 1.35)`, капот `(0, 4.02, 2.55)` (над крышей, видно
  передок и зеркала), сзади/сверху — chase/far.
* Добавлен `window.__THREE = THREE` рядом с `window.__game` для оффлайн-диагностики.

---

## 3. Инструменты проверки (всё локально, без браузера пользователя)

### 3.1. Штатные тесты

```bash
cd euro-haul
npm run build                       # esbuild → game.bundle.js (IIFE)
node tests/smoke.mjs                # jsdom, ~90 проверок — должен быть зелёный
node tests/autopilot.mjs            # 77 км автопилотом
node tests/render-preview.mjs       # офлайн-превью
```

`tests/smoke.mjs` на конец итерации: **«✅ Все проверки пройдены»**, ~322 кадра.

### 3.2. Свои инструменты (не входят в сборку, лежат в `tests/`)

| файл | назначение |
| --- | --- |
| `_soft.mjs` | программный растеризатор: z-буфер, отсечение по near, текстуры, ламперт. Нужен, потому что `SVGRenderer` врёт с сортировкой. |
| `_softview.mjs` | рендер тягача/салона в `tests/_s-*.png` (кабина, капот, сбоку, сзади). |
| `_dashview.mjs` | крупный вид приборки и навигации → `tests/_s-dash.png`. |
| `_dashcheck.mjs` | выгружает канвасы приборки/навигации в PNG без 3D. |
| `_views.mjs` | старый SVG-рендер 10 ракурсов (оставлен для сравнения). |
| `_texview.mjs` | превью текстур дороги/травы с UV в метрах → `tests/_s-road.png`. |
| `_shot.mjs` | скриншот страницы через Chromium (см. 3.3). |
| `_play.mjs` | полный прогон: меню → карьера → рейс → кабина/chase/hood/pause → телефон. |

### 3.3. Настоящий браузер в песочнице (важно!)

Chromium из `@sparticuz/chromium` не запускался: нет `libnss3/libnssutil3/libnspr4`.
Решение (повторяемо):

```bash
cd /tmp
npm install puppeteer-core@23 @sparticuz/chromium@131 --no-audit --no-fund
node -e "require('/tmp/node_modules/@sparticuz/chromium').executablePath().then(console.log)"  # /tmp/chromium
# 1) выписать версии NSS, которые требует бинарь
readelf --dyn-syms --wide /tmp/chromium > /tmp/syms_raw.txt
# 2) собрать заглушки с version-script (иначе ld.so: check_match assertion)
#    /tmp/stubs/stub.c — пустые функции для всех undefined NSS/NSPR-символов
#    /tmp/stubs/nss.map / nssutil.map — секции NSS_3.2, NSS_3.3, NSS_3.4, NSS_3.6,
#    NSS_3.9.2, NSS_3.30, NSSUTIL_3.12.3
cd /tmp/stubs
gcc -shared -fPIC -o libnss3.so     stub.c -Wl,--version-script=nss.map
gcc -shared -fPIC -o libnssutil3.so stub.c -Wl,--version-script=nssutil.map
gcc -shared -fPIC -o libnspr4.so    stub.c        # NSPR без версий
# 3) запуск
LD_LIBRARY_PATH=/tmp/stubs /tmp/chromium --version
```

Правила запуска puppeteer (иначе висит или падает):

* `headless: true` (не `'shell'`);
* аргументы: `--no-sandbox --no-zygote --disable-gpu --enable-unsafe-swiftshader
  --use-gl=angle --use-angle=swiftshader --disable-dev-shm-usage
  --user-data-dir=/tmp/pprof<random>`;
* `env: { ...process.env, LD_LIBRARY_PATH: '/tmp/stubs' }`;
* `page.goto(..., { waitUntil: 'domcontentloaded' })` — `networkidle2` не наступает;
* WebGL работает через SwiftShader, ошибки вида «GPU stall due to ReadPixels» — норма.

Локальный сервер:

```bash
cd /home/user/games && python3 -m http.server 8123 &   # игры по /euro-haul/index.html
```

Канвасы в jsdom-тестах рисуются настоящим `@napi-rs/canvas`:

```bash
cd /tmp && npm install @napi-rs/canvas --no-audit --no-fund
```

подмена в тесте: `HTMLCanvasElement.prototype.getContext` возвращает
`createCanvas(w, h).getContext('2d')`, а `width/height` — геттеры/сеттеры к нему.
SVG→PNG при необходимости: `@resvg/resvg-js` в `/tmp/node_modules`.

---

## 4. Найденные и исправленные баги (не повторять)

1. **Сплошной кузов кабины** — салон внутри монолита, обзор закрыт. Кабина теперь полая.
2. **Двусторонняя плоскость-торпедо на высоте 2.0 м** — закрывала полнеба. Убрана.
3. **`latsLeft` по возрастанию** — левая обочина смотрела вниз, правая отсекалась
   по backface → выглядело как белый «снег» и чёрная земля. Порядок развёрнут.
4. **`stripGeometry` с `uvScale: 24`** — текстура повторялась каждые 0.4 м. UV в метрах.
5. **`PlaneGeometry(6000,6000)` фон травы** — перекрывал дорогу из кабины. Не возвращать.
6. **`camera.rotation.z += shake`** — накапливала крен. Только `rotateZ`.
7. **Камера «летела» через карту** при смене режима — нужен `instant` на первом кадре.
8. **`SVGRenderer` + `MeshPhysicalMaterial`** — кузов рисовался чёрным, раскраска
   была неверной. Для превью конвертировать физические материалы в стандартные,
   а лучше сразу рендерить `_soft.mjs`.
9. **`Object3D.lookAt` для экранов** — смотрит осью `-z`? Нет: `+z` смотрит **на** цель
   только у камер; у меша `lookAt` разворачивает `+z` **к цели**, но с креном при
   `up` по умолчанию; `quaternion.setFromUnitVectors((0,0,1), dir)` давал крен.
   Рабочий вариант — `obj.up.set(0,1,0); obj.lookAt(target)`.
10. **`BoxGeometry` + массив материалов** — порядок групп `[+x, -x, +y, -y, +z, -z]`;
    если ливрея попадает на верх/торец, получаются «полосы» и чёрные торцы.
11. **`_soft.mjs`: нормаль из `cross`** — у `PlaneGeometry` обход противоположен,
    грани «исчезали». Нормаль берётся из атрибута `normal`. И `flipY` уже учтён
    в `1 - v` (двойной переворот ломал текстуру).
12. **`_soft.mjs`: номер группы** — `index.getX(t*3)` это номер вершины, а `group.start`
    задан в индексах. Сравнивать надо `t * 3`.
13. **`cameraMode` менять напрямую** — `cameraUserSet` не выставляется, и первый кадр
    может перезаписать режим (`this.cameraMode = touchEnabled() ? 'chase' : 'interior'`).
    В тестах ставить оба поля.

---

## 5. Что осталось сделать

1. **Перепроверить траву/обочину после фикса обхода** — снять `_dbg-onlygrass` заново,
   убедиться, что нет белых и чёрных плоскостей, и что туман не «съедает» землю
   (`sky.js: FogExp2 0.0003`, цвета `fogColor` 0xaebfcb).
2. **Трафик** (`src/world/traffic.js` использует `m.darkMetal, m.glass, m.tyres`) —
   проверить, что машины не выглядят «коробками с дырами»; при необходимости переписать
   по образцу `TruckView` (полый корпус, отдельные стёкла).
3. **Город** (`buildCitiesNear` в `road.js`): фасад `building` + крыша; проверить,
   что ночью окна светятся (`setNightIntensity`), а днём не «пластиковые».
4. **Приборка**: уменьшить размер шрифта подписей (на 512×256 «СКОРОСТЬ/ОБОРОТЫ»
   читаются мелко), добавить индикаторы фар/поворотников/круиза на канвас.
5. **UI**: прогнать `_play.mjs` на 1440×810, 1024×768, 390×844, 844×390; проверить,
   что кнопки `#btn-continue`, `#g-menu`, `#modal-close`, `[data-act]` живые;
   сенсорный режим (`body.is-touch`) — приборы снизу, педали по краям.
6. **`_play.mjs`**: телефонная страница падает на `g.offers` (у новой страницы нет
   профиля) — сначала создать карьеру на этой странице, потом принимать рейс.
7. После правок: `npm run build` → `node tests/smoke.mjs` → `node tests/autopilot.mjs`
   → `_play.mjs` → коммит в `arena/cf9b4703-games` → PR → merge → проверить
   GitHub Pages (`gh api repos/m98978672-boop/games/pages/builds/latest`).

---

## 6. Как восстановиться после отката

1. `git log --oneline -5` и `git show HEAD:euro-haul/src/world/truck3d.js | head` —
   понять, какая версия файлов перед вами. Старая модель тягача (до переписывания)
   восстанавливается из `git show 6857305:euro-haul/src/world/truck3d.js`.
2. Если правки потеряны полностью — заново: `materials.js` → `truck3d.js` →
   `road.js` (UV + `latsLeft`) → `index.html` + `style.css` → `ui.js` → камера в `main.js`.
   Порядок важен: `truck3d.js` зависит от ключей `materials()`.
3. Проверить сборку: `npm run build && node tests/smoke.mjs`.
4. Визуально: `_softview.mjs` (модель) и `_shot.mjs`/`_play.mjs` (интерфейс).
5. Ничего не удалять из `tests/*.mjs` — это единственный способ смотреть на игру офлайн.

## 7. Ключевые числа и факты

* Карта: 152 города, 28 стран, 646 рёбер, полная связность; `berlin→rome` ≈ 86 км,
  `glasgow→sofia` ≈ 162 км (игровые километры).
* Профиль по умолчанию: 9 200 €, тягач `auriga-3`, город `berlin`, сохранения
  `eurotrak.saves.v1` (`{slots:[3], lastSlot}`), настройки `eurotrak.settings.v1`.
* Устройства: desktop → high/26 машин, tablet → medium/20, phone → low/14, pixelRatio ≤1.4;
  классы на `body`: `device-*`, `quality-*`, `is-touch`, `must-rotate`.
* Управление: W/S/A/D (или стрелки), E — взаимодействие, R — задний ход, C — круиз,
  M — КПП, Shift/Ctrl — передачи, V — камера, L — фары, H — сигнал, F — двигатель,
  P — снимок, `,`/`.` — поворотники, Esc — пауза.
* Скорость света: `DirectionalLight 2.6`, `HemisphereLight 1.0`, `AmbientLight 0.28`,
  `ACESFilmicToneMapping`, `exposure 1.05`.
