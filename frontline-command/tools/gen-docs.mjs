// Генерация docs/BALANCE.md прямо из JSON-конфигов: таблицы не расходятся с данными.
import fs from 'node:fs';
import { loadConfig } from '../src/core/config.js';

const cfg = await loadConfig();
const w = cfg.weapons;
const u = cfg.units;
const b = cfg.buildings;
const t = cfg.templates;
const res = cfg.resources;
const ai = cfg.ai;

const fmt = (n) => (typeof n === 'number' ? (Math.round(n * 100) / 100).toString() : String(n ?? '—'));
const table = (head, rows) => `| ${head.join(' | ')} |\n| ${head.map(() => '---').join(' | ')} |\n${rows.map((r) => `| ${r.join(' | ')} |`).join('\n')}\n`;
const cost = (c) => Object.entries(c || {}).map(([k, v]) => `${v} ${({ ammo: 'б/п', materials: 'мат', fuel: 'топ', meds: 'мед' }[k] || k)}`).join(', ') || '—';

let md = `# BALANCE — Frontline: Command\n\n`;
md += `> Файл сгенерирован из \`data/*.json\` (\`npm run docs\`). Правьте JSON, а не таблицу:\n`;
md += `> ни одно число баланса не живёт в коде.\n\n`;
md += `## Оружие\n\n`;
md += table(
  ['Название', 'Тип', 'Урон', 'Выстр./с', 'DPS', 'Дальность', 'Разброс°', 'Магазин', 'Перезарядка', 'Подавление'],
  Object.entries(w).map(([id, x]) => [x.name, x.kind, fmt(x.damage), fmt(x.rof), fmt(x.damage * x.rof), fmt(x.range), fmt(x.spread), fmt(x.mag), fmt(x.reload), fmt(x.suppression)]),
);
md += `\n## Юниты\n\n`;
md += table(
  ['Роль', 'Класс', 'HP', 'Скорость', 'Зрение', 'Оружие', 'Броня', 'Цена', 'Сборка, с', 'Умение'],
  Object.entries(u).map(([id, x]) => [x.name, x.class, fmt(x.hp), fmt(x.speed), fmt(x.vision), w[x.weapon]?.name || x.weapon, fmt(x.armor || 0), cost(x.cost), fmt(x.buildTime), x.medic ? 'медик' : id === 'engineer' ? 'инженер' : id === 'driver' ? 'логистика' : '—']),
);
md += `\n## Шаблоны отрядов\n\n`;
md += table(
  ['ID', 'Название', 'Состав', 'Размер', 'Стоимость'],
  Object.entries(t).map(([id, x]) => [id, x.name, Object.entries(x.composition).map(([r, n]) => `${n}×${u[r]?.name || r}`).join(', '), Object.values(x.composition).reduce((a, c) => a + c, 0), cost(Object.entries(x.composition).reduce((acc, [role, n]) => { for (const [k, v] of Object.entries(u[role]?.cost || {})) acc[k] = (acc[k] || 0) + v * n; return acc; }, {}))]),
);
md += `\n## Постройки\n\n`;
md += table(
  ['ID', 'Название', 'Категория', 'HP', 'Время, с', 'Укрытие', 'Стоимость'],
  Object.entries(b).map(([id, x]) => [id, x.name, x.category || 'fort', fmt(x.hp), fmt(x.time), x.cover ? fmt(x.cover) : '—', cost(x.cost)]),
);
md += `\n## Экономика\n\n`;
md += table(['Ресурс', 'Старт'], Object.entries(res.start).map(([k, v]) => [k, fmt(v)]));
md += `\nПроизводство в секунду:\n\n`;
const prodRows = [];
for (const [btype, p] of Object.entries(res.production || {})) for (const [k, v] of Object.entries(p)) prodRows.push([btype, k, fmt(v)]);
md += table(['Источник', 'Ресурс', 'В секунду'], prodRows);
md += `\nСнабжение: распад ${fmt(res.supply?.decay ?? res.decay)}/с, радиус доставки ${fmt(res.supply?.radius || '—')}, порог запроса ${fmt(res.supply?.requestBelow || '—')}.\n`;
md += `\n## Лимиты и ИИ\n\n`;
md += table(
  ['Параметр', 'Значение'],
  [
    ['Стартовые отряды (на фракцию)', fmt(ai.limits.squadBase)],
    ['Отрядов за город', fmt(ai.limits.squadPerCity)],
    ['Одновременных директив', fmt(ai.limits.directiveBase)],
    ['Скорость радио, px/с', fmt(ai.radio.speedPxPerSec)],
    ['Максимальная задержка приказа, с', fmt(ai.radio.maxDelay)],
    ['Кривая технологий ИИ, с/шаг', fmt(ai.limits.enemyTechCurveSeconds)],
    ['Шагов технологий', fmt(ai.limits.enemyTechSteps)],
    ['Порог атаки стратега', fmt(ai.strategic?.attackThreshold)],
    ['Отрядов на цель', fmt(ai.strategic?.maxSquadsPerTarget)],
    ['Конус зрения, °', fmt(ai.perception?.coneDeg)],
    ['Слух, px', fmt(ai.perception?.hearing)],
    ['Память, с', fmt(ai.perception?.memory)],
    ['Мораль: старт / отказ / паника', `${fmt(ai.morale.start)} / ${fmt(ai.morale.refuseBelow)} / ${fmt(ai.morale.panicBelow)}`],
    ['Мораль: командир / без командира, в с', `${fmt(ai.morale.commanderPerSec)} / ${fmt(ai.morale.noCommanderPerSec)}`],
    ['Захват точки, с', fmt(ai.influence?.holdSeconds)],
  ],
);
md += `\n## Сложность\n\n`;
md += table(['Уровень', 'Реакция', 'Точность оценки', 'Интервал стратега, с'],
  Object.entries(cfg.difficulty).map(([id, d]) => [d.name, fmt(d.reaction), fmt(d.accuracy), fmt(d.strategicInterval)]));
md += `\n> Сложность не даёт бонусов к урону, HP или скорости. Только реакция и точность оценки обстановки.\n`;
md += `\n## Прокачка\n\n`;
const branches = cfg.skills.branches;
const nodes = cfg.skills.nodes;
md += table(['Ветвь', 'Навыков', 'Суммарная цена XP'],
  branches.map((br) => [br.name, nodes.filter((n) => n.branch === br.id).length, nodes.filter((n) => n.branch === br.id).reduce((a, n) => a + n.cost, 0)]));
md += `\nВсего навыков: ${nodes.length}, суммарно ${nodes.reduce((a, n) => a + n.cost, 0)} XP.\n`;
md += `\n## Открытые вопросы баланса\n\n`;
md += `1. **Темп войны.** Среднее решение — 6–20 минут; часть прогонов заканчивается\n   тайм-аутом 20 минут без победителя. Кандидаты: снизить порог силы для атаки\n   (1.25 → 1.15), увеличить награду за контроль городов.\n`;
md += `2. **Стоимость отрядов.** Отряд «Штурм» ≈ 190 материалов — это ~3 минуты\n   производства в начале войны; при потерях армия восстанавливается медленно.\n`;
md += `3. **Летальность.** Винтовка 25 урона при 1.2 выстр./с и укрытии −75% радиуса\n   попадания даёт бой на 30–60 секунд — приемлемо, но требует замеров на людях.\n`;
md += `\nПерегенерация: \`node tools/gen-docs.mjs\`.\n`;

fs.writeFileSync('docs/BALANCE.md', md);
console.log('docs/BALANCE.md', md.length, 'символов');
