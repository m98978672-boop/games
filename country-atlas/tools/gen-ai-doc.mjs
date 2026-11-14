#!/usr/bin/env node
/**
 * Генератор таблиц формул в AI.md.
 *
 * Берёт реестр FORMULAS из src/sim/ai-formulas.js и перезаписывает:
 *   <!--FORMULAS-START--> … <!--FORMULAS-END-->  — сводная таблица 40 формул;
 *   <!--APPENDIX-START--> … <!--APPENDIX-END-->  — по 20 значений на формулу.
 *
 * Никакие числа не пишутся руками: если формула изменится, таблица изменится вместе с ней,
 * а tests/ai-formulas.mjs сверяет документ с реестром.
 *
 * Запуск: node tools/gen-ai-doc.mjs
 */
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { FORMULAS } from "../src/sim/ai-formulas.js";

const here = dirname(fileURLToPath(import.meta.url));
const docPath = join(here, "..", "AI.md");
let doc = readFileSync(docPath, "utf8");

const fmtArg = (a) => {
  if (Array.isArray(a)) {
    if (a.length && typeof a[0] === "object") return `[${a.length} записей]`;
    return `[${a.map(fmtArg).join(", ")}]`;
  }
  if (a && typeof a === "object") {
    return `{${Object.entries(a).map(([k, v]) => `${k}: ${fmtArg(v)}`).join(", ")}}`;
  }
  if (typeof a === "number") return Number.isInteger(a) ? String(a) : a.toFixed(a < 1 ? 3 : 1);
  return String(a);
};

const fmtOut = (o) => {
  if (Array.isArray(o)) return `[${o.map((x) => x.toFixed(3)).join(", ")}]`;
  if (typeof o === "number") return Number.isInteger(o) ? String(o) : o.toFixed(o < 1 ? 4 : 2);
  return String(o);
};

/* ---------- сводная таблица ---------- */

const rows = FORMULAS.map((f) => {
  const cases = f.cases();
  const results = cases.map((args) => {
    const out = f.fn(...args);
    return { out, ok: f.prop(out, args) };
  });
  const passed = results.filter((r) => r.ok).length;
  return `| ${f.id} | ${f.name} | \`${f.expr}\` | ${f.unit} | ${f.range} | ${passed}/${cases.length} ${passed === cases.length && cases.length >= 20 ? "✓" : "✗"} |`;
});

const table = [
  "| № | Формула | Запись | Единицы | Диапазон | Проверено |",
  "|---|---|---|---|---|---|",
  ...rows,
  "",
  `**Итого:** ${FORMULAS.length} формул, ${FORMULAS.reduce((s, f) => s + f.cases().length, 0)} значений, ` +
  `${FORMULAS.filter((f) => f.cases().length >= 20).length} из ${FORMULAS.length} с проверкой ≥ 20.`
].join("\n");

/* ---------- приложение: по 20 значений ---------- */

const appendix = FORMULAS.map((f) => {
  const cases = f.cases();
  const lines = cases.map((args, i) => {
    const out = f.fn(...args);
    const ok = f.prop(out, args) ? "✓" : "✗";
    return `| ${i + 1} | ${args.map(fmtArg).join("; ")} | ${fmtOut(out)} | ${ok} |`;
  });
  return [
    `<details><summary>${f.id}. ${f.name} — ${cases.length} значений, ${f.unit}, ${f.range}</summary>`,
    "",
    `\`${f.expr}\``,
    "",
    "| # | вход | выход | свойство |",
    "|---|---|---|---|",
    ...lines,
    "",
    "</details>",
    ""
  ].join("\n");
}).join("\n");

function replaceBlock(text, startMarker, endMarker, body) {
  const a = text.indexOf(startMarker);
  const b = text.indexOf(endMarker);
  if (a < 0 || b < 0 || b < a) throw new Error(`нет маркеров ${startMarker} / ${endMarker}`);
  return text.slice(0, a + startMarker.length) + "\n" + body + "\n" + text.slice(b);
}

doc = replaceBlock(doc, "<!--FORMULAS-START-->", "<!--FORMULAS-END-->", table);
doc = replaceBlock(doc, "<!--APPENDIX-START-->", "<!--APPENDIX-END-->", appendix);
writeFileSync(docPath, doc);

const total = FORMULAS.reduce((s, f) => s + f.cases().length, 0);
console.log(`AI.md: ${FORMULAS.length} формул, ${total} значений, таблицы обновлены`);
const short = FORMULAS.filter((f) => f.cases().length < 20);
if (short.length) {
  console.error(`у формул меньше 20 значений: ${short.map((f) => f.id).join(", ")}`);
  process.exit(1);
}
