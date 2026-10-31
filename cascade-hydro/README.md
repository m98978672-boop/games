# ⚡ КАСКАД: Живая Вода (`cascade-hydro`, `v0.6.1`)

Браузерный 3D-симулятор строительства гидроэлектростанций, поиска перепадов высот `ΔH`, прокладки собственных каналов, реалистичной физики воды и снабжения 8 растущих городов (Three.js + собственное гидродинамическое ядро Well-Balanced 2D SWE).

- ▶️ **Играть онлайн (обновлённая версия на GitHub Pages):** https://m98978672-boop.github.io/games/cascade-hydro/
- 🌐 **Все игры на сайте GitHub Pages:** https://m98978672-boop.github.io/games/
- 💻 **Репозиторий на GitHub:** https://github.com/m98978672-boop/games
- 📋 **План игры и список возможностей:** [`PLAN.md`](./PLAN.md)
- 📚 **База инженерных знаний, формул и архитектуры:** [`KNOWLEDGE_BASE.md`](./KNOWLEDGE_BASE.md)
- 📊 **Структурированные справочные данные игры (JSON):** [`data/game-knowledge-data.json`](./data/game-knowledge-data.json)

## Сборка, экспорт данных и автотесты

```sh
cd cascade-hydro
npm install
node tools/export-knowledge-data.mjs   # обновляет data/game-knowledge-data.json
npm run build                          # собирает bundle.js и обновляет анти-кэш ?v=... в index.html
npm test                               # прогоняет все физические, градостроительные и save/load тесты
```
