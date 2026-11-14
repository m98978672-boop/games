/**
 * Смоук-тест каталога проекта (§24.12).
 *
 * Проверяет, что catalog.html работает как страница, а не как картинка:
 * карточки на месте, поиск ищет, вкладки фильтруют, звёзды и заметки сохраняются,
 * сброс очищает. localStorage подменяется картой в памяти, поэтому тест не пишет
 * ничего в браузер пользователя и работает офлайн.
 *
 * Запуск: node tests/catalog.mjs   (нужен jsdom: npm i)
 */
import { JSDOM } from "jsdom";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import assert from "node:assert/strict";

const here = dirname(fileURLToPath(import.meta.url));
const html = readFileSync(join(here, "..", "catalog.html"), "utf8");
const STORE_KEY = "ratgrad-catalog-v1";

const store = new Map();
const dom = new JSDOM(html, {
  url: "http://localhost/catalog.html",
  runScripts: "dangerously",
  pretendToBeVisual: true,
  beforeParse(win) {
    const proto = Object.getPrototypeOf(win.localStorage);
    proto.setItem = (k, v) => store.set(k, String(v));
    proto.getItem = (k) => (store.has(k) ? store.get(k) : null);
    proto.removeItem = (k) => store.delete(k);
    win.confirm = () => true;
  }
});

const { document, Event, KeyboardEvent } = dom.window;
const click = (node) => node.dispatchEvent(new Event("click", { bubbles: true }));
const type = (node, value) => {
  node.value = value;
  node.dispatchEvent(new Event("input", { bubbles: true }));
};
const cards = () => [...document.querySelectorAll(".card")];
const cardById = (id) => document.querySelector(`.card[data-id="${id}"]`);
const stored = () => JSON.parse(store.get(STORE_KEY) || "{}");

let checks = 0;
const ok = (cond, msg) => {
  assert.ok(cond, msg);
  checks++;
};

/* 1. Данные и разметка --------------------------------------------------- */
const data = JSON.parse(
  document.getElementById("sections-data").textContent.replace(/\/\*DATA-(START|END)\*\//g, "")
);
ok(data.length >= 30, "в каталоге меньше 30 разделов");
ok(data.every((s) => s.id && s.title && s.cat), "у раздела нет номера, названия или категории");
ok(cards().length === data.length, "карточек не столько, сколько разделов");
ok(document.getElementById("total").textContent === String(data.length), "счётчик «всего» неверен");

/* 2. Звёзды -------------------------------------------------------------- */
const target = cards()[0];
const id = target.dataset.id;
target.querySelectorAll("button[data-star]")[3].dispatchEvent(new Event("click", { bubbles: true }));
ok(cardById(id).querySelectorAll("button[data-star].on").length === 4, "четыре звезды не подсветились");
ok(stored().ratings[id].stars === 4, "оценка не сохранилась");
ok(document.getElementById("ratedCount").textContent === "1", "счётчик оценённых не вырос");

// повторный клик по той же звезде снимает оценку
cardById(id).querySelectorAll("button[data-star]")[3].dispatchEvent(new Event("click", { bubbles: true }));
ok(!stored().ratings[id] || !stored().ratings[id].stars, "повторный клик не снял оценку");

/* 3. Заметка ------------------------------------------------------------- */
const noteCard = cardById("29");
// jsdom не реализует раскрытие <details> кликом — проверяем только сохранение и отрисовку
type(cardById("29").querySelector("textarea"), "переписать блок про трение");
await new Promise((r) => setTimeout(r, 450));
ok(stored().ratings["29"].note === "переписать блок про трение", "заметка не сохранилась");

// после перерисовки заметка возвращается
const tabsAll = [...document.querySelectorAll(".tab")];
click(tabsAll.find((t) => t.dataset.tab === "Мир"));
click(tabsAll.find((t) => t.dataset.tab === "all"));
ok(cardById("29").querySelector("textarea").value === "переписать блок про трение", "заметка потерялась при перерисовке");
ok(cardById("29").querySelector("details").open, "карточка с заметкой не раскрыта после перерисовки");

/* 4. Поиск --------------------------------------------------------------- */
const q = document.getElementById("q");
type(q, "стрим");
const found = cards().map((c) => c.dataset.id);
ok(found.length > 0 && found.length < data.length, "поиск не сузил список");
ok(found.includes("30"), "поиск по слову «стрим» не нашёл §30");
type(q, "29");
ok(cards().some((c) => c.dataset.id === "29"), "поиск по номеру не работает");
type(q, "");

/* 5. Вкладки ------------------------------------------------------------- */
const phys = [...document.querySelectorAll(".tab")].find((t) => t.dataset.tab === "Физика");
click(phys);
const physIds = cards().map((c) => c.dataset.id).sort();
ok(physIds.join(",") === "29,33", `вкладка «Физика» показывает не то: ${physIds.join(",")}`);
const all = [...document.querySelectorAll(".tab")].find((t) => t.dataset.tab === "all");
click(all);
ok(cards().length === data.length, "вкладка «Все» не вернула все карточки");

/* 6. Фильтр «только неоценённые» ---------------------------------------- */
cardById("8").querySelectorAll("button[data-star]")[2].dispatchEvent(new Event("click", { bubbles: true }));
const onlyUnrated = document.getElementById("onlyUnrated");
onlyUnrated.checked = true;
onlyUnrated.dispatchEvent(new Event("change", { bubbles: true }));
ok(!cards().some((c) => c.dataset.id === "8"), "в фильтре осталась карточка с оценкой");
ok(cards().some((c) => c.dataset.id === "29"), "карточка без звёзд (только с заметкой) должна остаться в фильтре");
onlyUnrated.checked = false;
onlyUnrated.dispatchEvent(new Event("change", { bubbles: true }));

/* 7. Сортировка ---------------------------------------------------------- */
const c30 = cardById("30");
c30.querySelectorAll("button[data-star]")[4].dispatchEvent(new Event("click", { bubbles: true }));
const sort = document.getElementById("sort");
sort.value = "rate-desc";
sort.dispatchEvent(new Event("change", { bubbles: true }));
ok(cards()[0].dataset.id === "30", "сортировка по оценке не подняла пятёрку наверх");
sort.value = "num";
sort.dispatchEvent(new Event("change", { bubbles: true }));

/* 8. Горячая клавиша ------------------------------------------------------ */
document.body.dispatchEvent(new KeyboardEvent("keydown", { key: "/", bubbles: true }));
ok(document.activeElement === q, "клавиша «/» не ставит фокус в поиск");

/* 9. Сброс ---------------------------------------------------------------- */
click(document.getElementById("reset"));
ok(Object.keys(stored().ratings || {}).length === 0, "сброс не очистил оценки");
ok(document.getElementById("ratedCount").textContent === "0", "счётчик не обнулился");

dom.window.close();
console.log(`catalog: ${checks} проверок пройдено`);
