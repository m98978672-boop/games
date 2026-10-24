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
