/**
 * Смоук-тест «крутилки алгоритмов» (routines-demo.html, §32.5).
 *
 * Проверяет, что страница — рабочая, а не картинка: список случаев заполнен,
 * «Следующий день» меняет путь, пересчёт того же дня стабилен, поиск фильтрует,
 * факт мира гасит кубик, «Другой мир» меняет сид. jsdom гоняет тот же бандл,
 * что открывает владелец, — поэтому тест ловит и сломанную сборку.
 *
 * Запуск: node tests/demo.mjs   (нужен jsdom: npm i)
 */
import { JSDOM } from "jsdom";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import assert from "node:assert/strict";

const here = dirname(fileURLToPath(import.meta.url));
const html = readFileSync(join(here, "..", "routines-demo.html"), "utf8");

const dom = new JSDOM(html, { url: "http://localhost/routines-demo.html", runScripts: "dangerously", pretendToBeVisual: true });
const { document, Event } = dom.window;

let checks = 0;
const ok = (cond, msg) => {
  assert.ok(cond, msg);
  checks++;
};

const click = (sel) => document.querySelector(sel).dispatchEvent(new Event("click", { bubbles: true }));
const input = (sel, value) => {
  const node = document.querySelector(sel);
  node.value = value;
  node.dispatchEvent(new Event("change", { bubbles: true }));
  node.dispatchEvent(new Event("input", { bubbles: true }));
};
const pathText = () => document.querySelector("#raw").textContent;

/* 1. Бандл вклеен и страница отрисована -------------------------------- */
ok(/BUNDLE-START\*\//.test(html), "в routines-demo.html нет маркера сборки");
ok(html.length > 150_000, "страница подозрительно маленькая — бандл не вклеен");
ok(document.querySelectorAll(".case").length === 400, "список случаев не заполнен (ожидалось 400 из 1008)");
ok(document.querySelector("#case-count").textContent === "1008", "неверное число случаев в шапке");
ok(document.querySelector("#run-title").textContent.includes("R-0001"), "не открылся R-0001");

/* 2. Путь дня собран --------------------------------------------------- */
const steps0 = document.querySelectorAll("#path .step").length;
ok(steps0 >= 3 && steps0 <= 8, `шагов в пути: ${steps0}`);
ok(document.querySelectorAll("#path .branch").length >= 2, "в пути меньше двух развилок");
ok(document.querySelector("#path .end").textContent.startsWith("КОНЕЦ"), "нет концовки");
ok(document.querySelector("#because").textContent.length > 5, "нет объяснения концовки");
ok(document.querySelectorAll("#effects .fx").length === 5, "последствия выведены не полностью");
ok(document.querySelector("#determinism").classList.contains("ok"), "пересчёт того же дня нестабилен");

/* 3. «Следующий день» меняет путь ------------------------------------- */
const firstPath = pathText();
const seen = new Set([firstPath]);
for (let i = 0; i < 8; i++) {
  click("#next-day");
  seen.add(pathText());
}
ok(seen.size >= 5, `за 8 дней всего ${seen.size} разных путей — крутилка не крутит`);
ok(document.querySelector("#day").value === "9", "счётчик дня не сдвинулся");
ok(document.querySelector("#determinism").classList.contains("ok"), "после смены дня пересчёт разошёлся");

/* 4. Поиск фильтрует --------------------------------------------------- */
input("#search", "рыбак");
const found = document.querySelectorAll(".case").length;
ok(found > 0 && found < 400, `поиск «рыбак» дал ${found} карточек`);
ok(document.querySelector("#found-count").textContent === String(found), "счётчик найденных врёт");
input("#search", "");

/* 5. Выбор другого случая ---------------------------------------------- */
const second = document.querySelectorAll(".case")[5];
const secondId = second.dataset.id;
second.dispatchEvent(new Event("click", { bubbles: true }));
ok(document.querySelector("#run-title").textContent.includes(secondId), "клик по карточке не открыл её случай");
ok(document.querySelector(".case.active").dataset.id === secondId, "активная карточка не подсвечена");

/* 6. Факт мира гасит кубик --------------------------------------------- */
const endingsBefore = new Set();
for (let i = 0; i < 12; i++) {
  click("#next-day");
  endingsBefore.add(document.querySelector("#path .end").textContent);
}
ok(endingsBefore.size >= 2, "12 дней подряд дали одну концовку — кубик не работает");

const weatherBox = document.querySelector('input[data-fact="weather"]');
weatherBox.checked = true;
weatherBox.dispatchEvent(new Event("change", { bubbles: true }));
for (let i = 0; i < 6; i++) {
  click("#next-day");
  const tags = [...document.querySelectorAll("#path .branch")].map((n) => ({
    tag: n.querySelector(".tag").textContent,
    yes: n.classList.contains("yes")
  }));
  ok(tags.filter((t) => t.tag === "weather").every((t) => t.yes), "погодная развилка ответила «нет» при факте «плохая погода»");
}
weatherBox.checked = false;
weatherBox.dispatchEvent(new Event("change", { bubbles: true }));

/* 7. «Другой мир» меняет сид ------------------------------------------ */
const seedBefore = document.querySelector("#seed").value;
click("#reseed");
ok(document.querySelector("#seed").value !== seedBefore, "сид не сменился");
ok(document.querySelector("#day").value === "1", "день не сбросился");
ok(document.querySelector("#determinism").classList.contains("ok"), "новый мир нестабилен");

/* 8. День целиком ------------------------------------------------------ */
const dayStats = document.querySelector("#day-stats").textContent;
ok(/1008/.test(dayStats), "в сводке дня нет 1008 исполнений");
ok(document.querySelectorAll("#day-stats .top li").length === 5, "в сводке дня не 5 концовок");
ok(!/NaN|undefined/.test(document.body.textContent), "на странице есть NaN или undefined");

console.log(`OK — ${checks} проверок (крутилка алгоритмов: список, путь, дни, поиск, факты, сид)`);
