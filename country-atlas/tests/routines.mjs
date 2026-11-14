/**
 * Проверка каталога алгоритмов поведения (§16, ALGORITHMS.md).
 *
 * 1008 рутин «1 начало → x концов»: у каждой начало, шаги, развилки и концовки.
 * Тест ловит то, что обычно ломается в таких каталогах: дубли id, пустые ветки,
 * вероятности, не дающие в сумме единицу, незаполненные плейсхолдеры,
 * недостижимые концовки и недетерминированную генерацию.
 *
 * Запуск: node tests/routines.mjs
 */
import { ROUTINES } from "../data/routines.js";
import { readFileSync, statSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import assert from "node:assert/strict";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "..");
const dataPath = join(root, "data", "routines.js");

let checks = 0;
const ok = (cond, msg) => {
  assert.ok(cond, msg);
  checks++;
};

/* 1. Количество и идентификаторы ----------------------------------------- */
ok(ROUTINES.length === 1008, `ожидалось 1008 алгоритмов, а их ${ROUTINES.length}`);

const ids = new Set();
ROUTINES.forEach((r, i) => {
  ok(/^R-\d{4}$/.test(r.id), `битый id: ${r.id}`);
  ok(!ids.has(r.id), `дубль id: ${r.id}`);
  ids.add(r.id);
  ok(r.id === "R-" + String(i + 1).padStart(4, "0"), `id вне порядка: ${r.id} на месте ${i}`);
});

/* 2. Структура: начало, шаги, ветки, концы ------------------------------- */
for (const r of ROUTINES) {
  ok(typeof r.start === "string" && r.start.length > 10, `${r.id}: нет начала`);
  ok(Array.isArray(r.steps) && r.steps.length >= 3, `${r.id}: меньше 3 шагов`);
  ok(Array.isArray(r.branches) && r.branches.length >= 2, `${r.id}: меньше 2 развилок`);
  ok(Array.isArray(r.endings) && r.endings.length >= 2, `${r.id}: меньше 2 концовок`);
  ok(r.steps.every((s) => typeof s === "string" && s.length > 3), `${r.id}: пустой шаг`);
  ok(r.branches.every((b) => b.q && b.y && b.n), `${r.id}: пустая развилка`);
  ok(r.endings.every((e) => e.t && typeof e.p === "number"), `${r.id}: пустая концовка`);
}

/* 3. Вероятности ---------------------------------------------------------- */
for (const r of ROUTINES) {
  const sum = r.endings.reduce((s, e) => s + e.p, 0);
  ok(Math.abs(sum - 1) <= 0.01, `${r.id}: сумма вероятностей ${sum}`);
}

/* 4. Плейсхолдеры --------------------------------------------------------- */
for (const r of ROUTINES) {
  const texts = [
    r.start,
    ...r.steps,
    ...r.branches.flatMap((b) => [b.q, b.y, b.n]),
    ...r.endings.map((e) => e.t)
  ];
  ok(!texts.some((t) => /\{\w+\}/.test(t)), `${r.id}: остался плейсхолдер`);
}

/* 5. Достижимость концовок ------------------------------------------------ */
for (const r of ROUTINES) {
  const paths = 2 ** r.branches.length;
  ok(paths >= r.endings.length, `${r.id}: концовок ${r.endings.length} больше, чем путей ${paths}`);
}

/* 6. Справочники ---------------------------------------------------------- */
const actors = new Set(ROUTINES.map((r) => r.actorId));
const goals = new Set(ROUTINES.map((r) => r.goalId));
ok(actors.size >= 20, `мало разных исполнителей: ${actors.size}`);
ok(goals.size >= 12, `мало разных целей: ${goals.size}`);
for (const r of ROUTINES) {
  ok(r.actor && r.goal, `${r.id}: не указан исполнитель или цель`);
}

/* 7. Детерминизм: повторная генерация не меняет файл --------------------- */
const hash = (p) => createHash("sha256").update(readFileSync(p)).digest("hex");
const before = hash(dataPath);
const beforeSize = statSync(dataPath).size;
execFileSync(process.execPath, [join(root, "tools", "gen-routines.mjs")], { stdio: "pipe" });
ok(hash(dataPath) === before, "генератор недетерминирован: файл изменился при повторном запуске");
ok(statSync(dataPath).size === beforeSize, "размер файла изменился при повторном запуске");

/* 8. Каталог в ALGORITHMS.md --------------------------------------------- */
const md = readFileSync(join(root, "ALGORITHMS.md"), "utf8");
const table = md.slice(md.indexOf("<!--TABLE-START-->"), md.indexOf("<!--TABLE-END-->"));
const rows = table.split("\n").filter((l) => /^\| R-\d{4} \|/.test(l));
ok(rows.length === ROUTINES.length, `в таблице ${rows.length} строк, а алгоритмов ${ROUTINES.length}`);
ok(rows[0].startsWith("| R-0001 |"), "первая строка таблицы не R-0001");
ok(rows[rows.length - 1].startsWith("| R-1008 |"), "последняя строка таблицы не R-1008");

/* 9. Сводка -------------------------------------------------------------- */
const branches = ROUTINES.reduce((n, r) => n + r.branches.length, 0);
const endings = ROUTINES.reduce((n, r) => n + r.endings.length, 0);
const paths = ROUTINES.reduce((n, r) => n + 2 ** r.branches.length, 0);

console.log(`routines: ${checks} проверок пройдено`);
console.log(`алгоритмов ${ROUTINES.length}, развилок ${branches}, концов ${endings}, возможных путей ${paths}`);
