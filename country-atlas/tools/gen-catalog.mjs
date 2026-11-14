#!/usr/bin/env node
/**
 * Генератор данных для catalag.html (каталог проекта «Атлас Ратграда»).
 *
 * Читает SPEC.md, вытаскивает разделы (## N. Заголовок) и подразделы (### N.M. Заголовок),
 * собирает короткое описание из первого пункта R-… и вставляет JSON в catalog.html
 * между маркерами /*DATA-START* / и /*DATA-END*\/.
 *
 * Запуск:  node tools/gen-catalog.mjs
 * Ничего не скачивает, работает офлайн.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "..");
const specPath = join(root, "SPEC.md");
const catalogPath = join(root, "catalog.html");

const CATEGORIES = [
  [0, "Документ"],
  [1, "Общее"], [2, "Общее"],
  [3, "Мир"], [4, "Мир"], [5, "Мир"], [6, "Мир"], [7, "Мир"],
  [8, "Дороги"],
  [9, "Города"], [10, "Города"], [11, "Города"],
  [12, "Транспорт"], [13, "Транспорт"],
  [14, "Время"],
  [15, "Жизнь"],
  [16, "ИИ"],
  [17, "Мир"],
  [18, "Рендер"],
  [19, "Интерфейс"], [20, "Интерфейс"], [21, "Интерфейс"],
  [22, "Данные"], [23, "Данные"],
  [24, "Тесты"],
  [25, "Процесс"], [26, "Процесс"], [27, "Процесс"], [28, "Процесс"],
  [29, "Физика"],
  [30, "Стриминг"],
  [31, "Рост"],
  [32, "ИИ"],
  [33, "Физика"],
  [34, "ИИ"],
  [35, "Тесты"]
];
const catOf = (n) => (CATEGORIES.find(([k]) => k === n) || [n, "Прочее"])[1];

const spec = readFileSync(specPath, "utf8").split("\n");

const sections = [];
let current = null;

for (const raw of spec) {
  const line = raw.trimEnd();

  const sec = /^##\s+(\d+)\.\s+(.*)$/.exec(line);
  if (sec) {
    current = {
      num: Number(sec[1]),
      id: String(sec[1]),
      title: sec[2].trim(),
      cat: catOf(Number(sec[1])),
      desc: "",
      subs: []
    };
    sections.push(current);
    continue;
  }

  const sub = /^###\s+(\d+(?:\.\d+)+)\.\s+(.*)$/.exec(line);
  if (sub && current) {
    current.subs.push(sub[2].trim());
    continue;
  }

  // первое содержательное описание: строка, начинающаяся с R-…
  if (current && !current.desc) {
    const r = /^R-\d+(?:\.\d+)+[a-z]?\.\s+(.*)$/.exec(line);
    if (r) {
      let text = r[1]
        .replace(/\*\*\[[^\]]+\]\*\*\s*/g, "")   // пометки [MVP]/[v1]/[решено]
        .replace(/\*\*/g, "")
        .replace(/\s+/g, " ")
        .trim();
      if (text.length > 240) {
        text = text.slice(0, 240);
        const cut = text.lastIndexOf(" ");
        if (cut > 120) text = text.slice(0, cut);
        text = text.replace(/[,;:.\-—]$/, "") + "…";
      }
      current.desc = text;
    }
  }
}

// запасной вариант: если пунктов R-… нет (оглавление, чек-лист) — берём первый абзац
for (const s of sections) {
  if (s.desc) continue;
  const from = spec.findIndex((l) => new RegExp(`^##\\s+${s.num}\\.`).test(l.trim()));
  if (from === -1) continue;
  for (let i = from + 1; i < spec.length; i++) {
    const line = spec[i].trim();
    if (!line || line.startsWith("#") || line.startsWith("|") || line.startsWith("---")) continue;
    if (/^##\s+\d+\./.test(line)) break;
    let text = line
      .replace(/^-\s*\[[ x]\]\s*/, "")
      .replace(/^\d+(?:\.\d+)*\.\s+/, "")
      .replace(/\*\*/g, "")
      .replace(/\s+/g, " ")
      .trim();
    if (text.length > 40) {
      if (text.length > 240) text = text.slice(0, 240).replace(/\s+\S*$/, "") + "…";
      s.desc = text;
    }
    break;
  }
}

// убрать пустые описания и дубли подразделов
for (const s of sections) {
  s.subs = [...new Set(s.subs)].filter(Boolean);
  if (!s.desc) s.desc = "";
}

const json = JSON.stringify(sections, null, 2);

let html = readFileSync(catalogPath, "utf8");
const START = "/*DATA-START*/";
const END = "/*DATA-END*/";
const a = html.indexOf(START);
const b = html.indexOf(END);
if (a === -1 || b === -1 || b < a) {
  console.error("Не найдены маркеры DATA-START/DATA-END в catalog.html");
  process.exit(1);
}
html = html.slice(0, a + START.length) + json + html.slice(b);
writeFileSync(catalogPath, html, "utf8");

console.log(`Разделов: ${sections.length}`);
console.log(`Подразделов: ${sections.reduce((n, s) => n + s.subs.length, 0)}`);
console.log(`Категории: ${[...new Set(sections.map((s) => s.cat))].join(", ")}`);
