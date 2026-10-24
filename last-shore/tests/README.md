# Проверки без браузера

Игра проверяется двумя скриптами — это дешевле, чем каждый раз открывать вкладку.

```bash
# 1. Генерация мира, рельеф, ходьба, столкновения, небо, подбор, камера
node tests/smoke.mjs

# 2. Вся игра в jsdom с заглушкой WebGL-рендерера:
#    старт, подбор (E), еда (1/2), сумка (I), пауза, автосейв, погода, смерть
npx esbuild src/main.js --bundle --format=iife --target=es2020 \
  --outfile=tests/.harness-bundle.js \
  --alias:three=./tests/three-stub.js \
  --alias:three/addons/utils/BufferGeometryUtils.js=./node_modules/three/examples/jsm/utils/BufferGeometryUtils.js
node tests/harness.mjs
```

`three-stub.js` — это настоящий Three.js, у которого `WebGLRenderer` заменён заглушкой,
чтобы логика игры работала в Node без видеокарты.

## 3. Реальный браузер (headless Chromium)

`node tests/browser.mjs [url]` — открывает игру в Chromium, жмёт «Начать», проверяет,
что мир собрался без ошибок, добывает дерево, крафтит инструменты, ставит костёр и делает скриншоты
(`tests/shot-*.png`).

В этой песочнице нет системных `libnspr4/libnss3`, поэтому рядом лежат заглушки в `/tmp/nssstub`
(генерируются из списка символов бинарника) и `LD_LIBRARY_PATH` подставляется в `puppeteer.launch`.
На обычной машине с браузером это не нужно.


## 4. Устойчивость (WebGL, safe-режим, диагностика)

`node tests/robust.mjs` — три сценария в Chromium:
1. обычный запуск,
2. запуск с `?safe=1` (лёгкая графика, без сглаживания и теней),
3. браузер без WebGL — игра должна показать причину, а не молчаливое «не работает».

Плюс проверяется панель диагностики (кнопка на стартовом экране или F1 в игре).
