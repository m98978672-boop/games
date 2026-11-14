#!/usr/bin/env node
/**
 * Страница формул ИИ (§34.5, закон промта 0.4).
 *
 * Собирает formulas.html прямо из реестра FORMULAS: 40 формул, их записи, единицы,
 * диапазоны и по 20 значений проверки. Ничего не пишется руками — страница всегда
 * совпадает с кодом и с таблицей в SPEC.md.
 *
 * Запуск: node tools/gen-formulas-page.mjs
 */
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { FORMULAS } from "../src/sim/ai-formulas.js";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "..");

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const fmtIn = (a) => {
  if (Array.isArray(a)) return a.length && typeof a[0] === "object" ? `[${a.length} записей]` : `[${a.map(fmtIn).join(", ")}]`;
  if (a && typeof a === "object") return `{${Object.entries(a).map(([k, v]) => `${k}: ${fmtIn(v)}`).join(", ")}}`;
  if (typeof a === "number") return Number.isInteger(a) ? String(a) : a.toFixed(3);
  return String(a);
};
const fmtOut = (o) =>
  Array.isArray(o) ? `[${o.map((x) => x.toFixed(3)).join(", ")}]` : Number.isInteger(o) ? String(o) : o.toFixed(o < 1 ? 4 : 2);

const GROUPS = [
  ["Потребности", 1, 6], ["Оценка цели", 7, 13], ["Риск", 14, 18],
  ["Дороги и очереди", 19, 25], ["Экономика и отношения", 26, 33], ["Внимание и надзор", 34, 40]
];
const groupOf = (id) => {
  const n = Number(id.split("-")[1]);
  return GROUPS.find(([, a, b]) => n >= a && n <= b)[0];
};

let cards = "";
for (const f of FORMULAS) {
  const cases = f.cases();
  const rows = cases.map((args, i) => {
    const out = f.fn(...args);
    const okMark = f.prop(out, args) ? "✓" : "✗";
    return `<tr><td>${i + 1}</td><td>${esc(args.map(fmtIn).join("; "))}</td><td>${esc(fmtOut(out))}</td><td class="${okMark === "✓" ? "yes" : "no"}">${okMark}</td></tr>`;
  }).join("");
  const passed = cases.filter((a) => { try { return f.prop(f.fn(...a), a); } catch { return false; } }).length;

  cards += `
  <section class="card" data-group="${esc(groupOf(f.id))}" id="${f.id}">
    <header>
      <span class="id">${f.id}</span>
      <h2>${esc(f.name)}</h2>
      <span class="passed ${passed === cases.length ? "ok" : "bad"}">${passed}/${cases.length} ✓</span>
    </header>
    <code class="expr">${esc(f.expr)}</code>
    <p class="meta">${esc(f.unit)} · ${esc(f.range)}</p>
    <details>
      <summary>20 значений проверки</summary>
      <table>
        <thead><tr><th>#</th><th>вход</th><th>выход</th><th>свойство</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </details>
  </section>`;
}

const total = FORMULAS.reduce((s, f) => s + f.cases().length, 0);

const html = `<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Формулы ИИ Ратграда — 40 формул, 800 проверок</title>
<style>
  :root{--bg:#0c1016;--panel:#141a22;--panel2:#1b232e;--line:#29323d;--ink:#e7eef6;--dim:#93a3b5;--accent:#d9b26b;--good:#6cc08b;--bad:#e07a7a}
  *{box-sizing:border-box}
  body{margin:0;min-height:100vh;color:var(--ink);font:15px/1.55 "Segoe UI","Inter",system-ui,sans-serif;
    background:radial-gradient(1100px 520px at 75% -10%,#1a2431 0%,var(--bg) 62%)}
  header.top{padding:20px 22px 14px;border-bottom:1px solid var(--line)}
  header.top h1{margin:0 0 4px;font-size:20px}
  header.top h1 span{color:var(--accent)}
  header.top p{margin:0;color:var(--dim);font-size:13px;max-width:100ch}
  .bar{display:flex;gap:10px;flex-wrap:wrap;align-items:center;padding:14px 22px 0}
  input[type=search]{background:var(--panel2);border:1px solid var(--line);color:var(--ink);border-radius:9px;padding:9px 12px;font:inherit;min-width:280px}
  .chip{background:var(--panel2);border:1px solid var(--line);border-radius:999px;padding:6px 12px;font-size:12.5px;color:var(--dim);cursor:pointer}
  .chip.active{border-color:var(--accent);color:#f0d6a8}
  main{padding:16px 22px 48px;display:grid;grid-template-columns:repeat(auto-fill,minmax(420px,1fr));gap:14px}
  .card{background:var(--panel);border:1px solid var(--line);border-radius:12px;padding:14px 16px}
  .card header{display:flex;gap:10px;align-items:baseline;margin-bottom:8px}
  .card h2{margin:0;font-size:15px;font-weight:600}
  .card .id{color:var(--accent);font-variant-numeric:tabular-nums;font-size:13px}
  .passed{margin-left:auto;font-size:12px;border:1px solid var(--line);border-radius:999px;padding:2px 8px;color:var(--dim)}
  .passed.ok{color:var(--good);border-color:#2c4437}
  .passed.bad{color:var(--bad);border-color:#5d3030}
  .expr{display:block;background:#101720;border-radius:7px;padding:8px 10px;font-size:13px;color:#dfe8f2;overflow-x:auto;white-space:pre-wrap}
  .meta{color:var(--dim);font-size:12.5px;margin:8px 0 4px}
  details summary{cursor:pointer;color:var(--dim);font-size:12.5px}
  table{width:100%;border-collapse:collapse;font-size:12.5px;margin-top:6px}
  th{color:var(--dim);font-weight:500;text-align:left;padding:4px 6px;border-bottom:1px solid var(--line);font-size:11.5px;text-transform:uppercase;letter-spacing:.05em}
  td{padding:3px 6px;border-bottom:1px solid #1e2730;font-variant-numeric:tabular-nums;color:#c7d3df}
  td.yes{color:var(--good)} td.no{color:var(--bad)}
  .note{margin:14px 22px 0;color:var(--dim);font-size:13px;max-width:110ch}
  .note b{color:var(--ink)}
</style>
</head>
<body>
<header class="top">
  <h1>Формулы ИИ РАТГРАДА · <span>40 формул, ${total} проверок</span></h1>
  <p>Это те же формулы, что записаны в промте (§34.5 SPEC.md) и работают в коде
     (<code>src/sim/ai-formulas.js</code>). Каждая проверена 20 раз с разными значениями —
     раскройте «20 значений проверки», чтобы увидеть вход и выход.</p>
</header>
<div class="bar">
  <input id="q" type="search" placeholder="Поиск: риск, очередь, F-21, доверие…" autocomplete="off">
  <span class="chip active" data-group="all">все</span>
  ${GROUPS.map(([g]) => `<span class="chip" data-group="${esc(g)}">${esc(g)}</span>`).join("")}
  <span class="chip" id="count"></span>
</div>
<p class="note"><b>Закон промта (0.4):</b> всё решённое пишется в SPEC.md; отдельные файлы — только
приложение. Если формула поменяется, эта страница и таблица в промте собираются из реестра
заново, а тест сверяет их между собой.</p>
<main id="list">${cards}</main>
<script>
  const q = document.getElementById("q");
  const cards = [...document.querySelectorAll(".card")];
  const counter = document.getElementById("count");
  let group = "all";
  function apply() {
    const text = q.value.trim().toLowerCase();
    let shown = 0;
    for (const c of cards) {
      const hay = c.textContent.toLowerCase();
      const okGroup = group === "all" || c.dataset.group === group;
      const okText = !text || hay.includes(text);
      const show = okGroup && okText;
      c.style.display = show ? "" : "none";
      if (show) shown++;
    }
    counter.textContent = shown + " из " + cards.length;
  }
  q.addEventListener("input", apply);
  for (const chip of document.querySelectorAll(".chip[data-group]")) {
    chip.addEventListener("click", () => {
      for (const c of document.querySelectorAll(".chip[data-group]")) c.classList.remove("active");
      chip.classList.add("active");
      group = chip.dataset.group;
      apply();
    });
  }
  apply();
</script>
</body>
</html>
`;

writeFileSync(join(root, "formulas.html"), html);
console.log(`formulas.html собран: ${FORMULAS.length} формул, ${total} значений, ${(html.length / 1024).toFixed(1)} КБ`);
