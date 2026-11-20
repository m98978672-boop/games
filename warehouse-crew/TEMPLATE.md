# 🧩 Шаблон: как собрать такую же игру на RatCore

Короткая инструкция-шаблон: из чего состоит «СЕВЕРНЫЙ УЗЕЛ» и в каком порядке
это повторять. Подходит для любой игры репозитория, где **RatCore — главный
движок**, а Three.js только рисует.

## 1. Каркас папки

```
моя-игра/
├── index.html      HUD: .topbar .panel .bottom-bar .modal-root .toasts
├── style.css       ПЕРВАЯ строка: @import url("../shared/theme.css");
├── cover.svg       обложка 1200×675
├── README.md       что это и как играть
├── PLAN.md         план и список возможностей
├── TEMPLATE.md     этот файл
├── src/            config util layout save audio game render ui main
├── data/           данные игры (веса, датасеты, таблицы)
└── tests/          smoke.mjs + предметные тесты
```

`index.html` обязательно подключает **локально** и в таком порядке:

```html
<script src="../shared/engine.js"></script>
<script src="../shooter/three.min.js"></script>
<script src="../ratcore/ratcore.bundle.js"></script>
<!-- игровые скрипты -->
<script src="../shared/engine-bootstrap.js" defer></script>
```

## 2. Слой данных и логики (без DOM)

- `src/config.js` — все константы и палитры в одном месте.
- `src/layout.js` — автомасштаб: `--ui`, `--app-h`, телефон/планшет/десктоп,
  ориентация, высоты нижней шторки. Единственное место, которое знает про
  размеры экрана.
- `src/sim/*.js` — чистая симуляция: её можно гонять в Node без браузера.
- `src/ai/brain-net.js` — сеть на массивах `Float32Array`, без библиотек.
- Никакого `Math.random()` и `Date.now()` в логике: ГПСЧ и часы — из ядра.

## 3. Слой моделей (RatCore)

1. Модель описывается **рецептом**, а не вершинами:

```js
var RECIPES = {
  torso: { parts: [{ shape: 'box', sx: 0.36, sy: 0.40, sz: 0.22,
                     offset: [0, -0.40, 0], color: '#7d3b34' }] },
};
```

2. Сборка и экспорт:

```js
var built = engine.tools.build.fromRecipe({ modelId: 'my-torso', ops: ops });
var exported = engine.tools.bridge.exportMesh({
  mesh: built.data, format: 'threejs', name: 'torso',
});
```

3. Буферы кладутся в контейнер (Барьер 4 запрещает `new BufferGeometry`,
   ручные `Float32Array([...])`, `gl.*Buffer*` и `getContext('2d')`):

```js
var geom = new THREE.PlaneGeometry(1, 1);
geom.setAttribute('position', new THREE.Float32BufferAttribute(payload.positions, 3));
geom.setAttribute('color', new THREE.Float32BufferAttribute(payload.colors, 4));
geom.setIndex(payload.index);
```

> ⚠️ `fromRecipe` применяет `offset` только при объединении **двух и более**
> примитивов. Для односоставного рецепта смещение переносится на `mesh.position`
> — иначе детали «схлопнутся» к оси (на этом легко потерять лицо персонажа).

## 4. Слой рендера (Three.js)

- `render/meshes.js` — кэш геометрии по `имя + палитра`, `WC.meshes.mesh()`.
- `render/world.js` — сцена, камеры, анимация сущностей, `attachCrew(game)`.
- `render/bodyview.js` — отдельная сцена для инспектора (свой canvas и камера).
- Рендер **никогда** не создаёт геометрию сам — только берёт у `meshes`.

## 5. UI и пульт

- Один слой `src/ui.js`: `U.el()` для узлов, `openModal()` с обязательным
  `stopPropagation` на контейнере модалки (иначе клики по вкладкам закрывают окно).
- Приказы — это кнопки с `data-command` / `data-team`; обработчик один.
- Камера переключается классом на `#stage` (`view-third` / `view-top`) и вызовом
  `WC.world.setMode()`.

## 6. Обучение сети

1. `training/train-brain.mjs` гоняет симуляцию headless.
2. Оценка — счёт за прогон склада (доставки минус штрафы).
3. Отбор и мутация весов, лог в `data/brain_training_log.json`.
4. Личные мозги отличаются стартовыми весами + характером (множители входов).

## 7. Тесты

```sh
node tests/smoke.mjs        # обязательные файлы, синтаксис, HUD, ресурсы
node tests/brain.test.mjs   # обученная политика должна быть лучше случайной
```

## 8. Чек-лист перед публикацией

- [ ] `cover.svg`, `README.md`, `PLAN.md`, `TEMPLATE.md`, `tests/`
- [ ] запись в `shared/engine-registry.json`
- [ ] запись в `site/games-data.js` + `node site/sync-root.mjs`
- [ ] `node tools/torrent/build-catalog.mjs`
- [ ] `game-base/tests/smoke.mjs` и `engine.mjs` — зелёные
- [ ] архив игры и весов — в облако (Dropbox) одной ссылкой
