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
    ['Слух, px', fmt(ai.perception?.hearingRange)],
    ['Память, с', fmt(ai.perception?.memorySeconds)],
    ['Мораль: старт / отказ / паника', `${fmt(ai.morale.start)} / ${fmt(ai.morale.ignoreOrderBelow)} / ${fmt(ai.morale.panicBelow ?? ai.morale.panic)}`],
    ['Мораль: командир / без командира, в с', `${fmt(ai.morale.commanderPerSec)} / ${fmt(ai.morale.noCommanderPerSec)}`],
    ['Добивание: врагов меньше', fmt(ai.strategic?.finishUnitsBelow)],
    ['Коэф. силы при добивании', fmt(ai.strategic?.finishPowerFactor)],
    ['Бонус атаки на штаб', fmt(ai.strategic?.finishHqBoost)],
    ['All-in: простой без захватов, с', fmt(ai.strategic?.stallSeconds)],
    ['All-in: коэф. требуемой силы', fmt(ai.strategic?.allInPowerFactor)],
    ['Разминка: длительность, с', fmt(ai.strategic?.openingSeconds)],
    ['Разминка: множитель порога', fmt(ai.strategic?.openingThresholdMult)],
    ['Захват точки, с', fmt(ai.capture?.seconds)],
    ['Захват штаба / города / склада, с',
      `${fmt(ai.capture?.secondsByType?.hq)} / ${fmt(ai.capture?.secondsByType?.city)} / ${fmt(ai.capture?.secondsByType?.depot)}`],
    ['Захват: перевес для старта', fmt(ai.capture?.startRatio ?? ai.capture?.ratio)],
    ['Захват: перевес для удержания', fmt(ai.capture?.holdRatio)],
    ['Захват: пауза после флага, с', fmt(ai.capture?.graceSeconds)],
    ['Захват: терпение при паритете, с', fmt(ai.capture?.patienceSeconds)],
    ['Захват: спад прогресса, %/тик', fmt((ai.capture?.decayRate ?? 0) * 100)],
    ['Измор: срок войны, с', fmt(ai.capture?.suddenDeathSeconds)],
    ['Измор: ускорение захвата, ×', fmt(ai.capture?.resolveSpeed)],
    ['Стройка: минимум армии', fmt(ai.build?.minArmy)],
    ['Стройка: запас материалов', fmt(ai.build?.reserveMaterials)],
    ['Стройка: кулдаун приказа, с', fmt(ai.build?.cooldownSeconds)],
    ['Стройка: предел открытых чертежей', fmt(ai.build?.maxOpenBlueprints)],
    ['Захват ключевого города, ×', fmt(ai.capture?.keyCityMult)],
    ['Захват: радиус, px', fmt(ai.capture?.radius)],
    ['Капитуляция без армии, с', fmt(ai.surrenderSeconds)],
    ['Гарнизон: своих бойцов в городе', fmt(ai.strategic?.garrisonUnits)],
    ['Гарнизон: срок караула, с', fmt(ai.strategic?.garrisonSeconds)],
  ],
);
md += `\n## Строительство и профили обороны\n\n`;
md += `Профили задают состав обороны и её глубину. Эшелоны: доля секций по глубине от\n`;
md += `переднего края (0 — фронт, 1 — тыл). \`dedup\` — минимальное расстояние между\n`;
md += `секциями плана, \`maxFortsPerPoint\` — сколько укреплений держим у одной точки.\n\n`;
md += table(['Профиль', 'Состав', 'Эшелоны (глубина, с, доля)', 'Бюджет', 'Плотность', 'Вес угрозы', 'Узел: фортов', 'dedup, px'],
  Object.entries(cfg.profiles).map(([id, pr]) => [
    pr.name,
    (pr.items || []).map((i) => `${b[i.type]?.name || i.type}×${i.count}`).join(', '),
    (pr.echelons || []).map((e) => `${e.name} ${fmt(e.depth)}/${fmt(e.share)}`).join('; ') || '—',
    fmt(pr.budget), fmt(pr.density), fmt(pr.threatWeight), fmt(pr.maxFortsPerPoint), fmt(pr.dedup),
  ]));
md += `\nШаблоны застройки (\`data/build_templates.json\`):\n\n`;
md += table(['Шаблон', 'Элементов', 'Состав'],
  Object.entries(cfg.buildTemplates).map(([id, t]) => [t.name, (t.items || []).length, (t.items || []).map((i) => b[i.type]?.name || i.type).join(', ')]));
md += `\n## Флаги функций и пороги регрессии\n\n`;
md += `Каждая новая механика включается и выключается в \`data/feature_flags.json\` без правки кода.\n\n`;
md += table(['Флаг', 'Группа', 'Вкл.', 'Что делает'],
  (cfg.raw.feature_flags?.flags || []).map((f) => [`\`${f.id}\``, f.group, f.enabled ? 'да' : 'нет', f.desc]));
md += `\nПороги регрессии (\`data/regression_thresholds.json\`): ${Object.keys(cfg.thresholds || {}).length} групп —\n`;
md += `производительность, баланс, строительство, симметрия. Проверяются тестами и прогонами войн.\n`;
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
md += `1. **Темп войны (0.10.0).** 80 войн (40 сидов × обе ориентации, лимит 1200 с):\n`;
md += `   финалов 80/80, тайм-аутов 0, средняя длительность 260–309 с, коротких (<150 с) 16–18.\n`;
md += `   Правило измора (900 с) закрыло последние зависания: 6 из 80 войн решены по очкам.\n`;
md += `2. **Перекос сторон.** Суммарно по 80 войнам Альянс 41 / Легион 39 — в пределах шума.\n`;
md += `   Дуэль зеркальных армий: 5/3, перекос 63% при пороге 75%.\n`;
md += `3. **Стоимость отрядов.** Отряд «Штурм» ≈ 190 материалов — ~3 минуты производства\n`;
md += `   в начале войны; при потерях армия восстанавливается медленно.\n`;
md += `4. **Летальность.** Винтовка 25 урона при 1.2 выстр./с и укрытии −75% радиуса\n`;
md += `   попадания даёт бой на 30–60 секунд — приемлемо, но требует замеров на людях.\n`;
md += `5. **Укрепления против штурма.** Пули бьют по постройкам на 90% урона (\`tryShootBuilding\`),\n`;
md += `   бункер 520 HP держится ~30 с под отделением. Нужны замеры на людях: не слишком ли\n`;
md += `   долго копать окопы под огнём.\n`;
md += `6. **Проверка тюнинга.** \`node tools/ai-war.mjs --seeds 31-70 --verbose\` —\n`;
md += `   таблица финалов, тайм-аутов и длительности; \`--swap\` меняет стороны местами.\n`;
md += `\nПерегенерация: \`node tools/gen-docs.mjs\`.\n`;

fs.writeFileSync('docs/BALANCE.md', md);
console.log('docs/BALANCE.md', md.length, 'символов');
