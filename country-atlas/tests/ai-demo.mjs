/**
 * Смоук-тест «инспектора ИИ» (ai-demo.html, §34.11).
 *
 * Проверяет, что страница показывает именно работу ИИ: шесть агентов с потребностями,
 * шесть баллов целей по F-7…F-10, выбранную цель с объяснением, журнал инструментов
 * с `why` у каждой команды, бюджет кадра и смену решения ползунками.
 *
 * Запуск: node tests/ai-demo.mjs   (нужен jsdom: npm i)
 */
import { JSDOM } from "jsdom";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import assert from "node:assert/strict";

const here = dirname(fileURLToPath(import.meta.url));
const html = readFileSync(join(here, "..", "ai-demo.html"), "utf8");
const dom = new JSDOM(html, { url: "http://localhost/ai-demo.html", runScripts: "dangerously", pretendToBeVisual: true });
const { document, Event } = dom.window;

let checks = 0;
const ok = (cond, msg) => {
  assert.ok(cond, msg);
  checks++;
};
const click = (node) => node.dispatchEvent(new Event("click", { bubbles: true }));
const slide = (sel, value) => {
  const node = document.querySelector(sel);
  node.value = String(value);
  node.dispatchEvent(new Event("input", { bubbles: true }));
};

/* 1. Страница собрана --------------------------------------------------- */
ok(/BUNDLE-START\*\//.test(html), "в ai-demo.html нет маркера сборки");
ok(html.length > 20_000, "страница слишком маленькая — бандл не вклеен");
ok(typeof dom.window.aiDemo === "object", "инспектор не инициализировался");
ok(document.querySelectorAll(".agent").length === 6, "должно быть 6 агентов");
ok(document.querySelectorAll(".agent .needs .bar").length === 36, "у 6 агентов должно быть 36 полос потребностей");

/* 2. Баллы целей: шесть строк, по убыванию, выбранная сверху ----------- */
const rows = [...document.querySelectorAll("#scores tr")];
ok(rows.length === 6, `строк баллов ${rows.length} вместо 6`);
const scores = rows.map((r) => Number(r.children[r.children.length - 1].textContent));
ok(scores.every(Number.isFinite), "в баллах есть не-число");
ok(scores.every((s, i) => i === 0 || scores[i - 1] >= s - 1e-9), "цели не отсортированы по баллу");
ok(rows[0].classList.contains("best"), "лучшая цель не выделена");
ok(document.querySelectorAll("#scores tr.best").length === 1, "выделена не одна цель");

/* 3. Выбор и объяснение ------------------------------------------------ */
const choice = document.querySelector("#choice").textContent.replace(/\s+/g, " ").trim();
ok(/A-\d/.test(choice) && /выбирает/.test(choice), `нет выбора: «${choice}»`);
ok(/P = 0\.\d+/.test(choice), "не показана вероятность softmax");
const why = document.querySelector("#why").textContent;
ok(/S=[−-]?\d/.test(why), `в объяснении нет балла: «${why.slice(0, 60)}»`);
ok(/U=/.test(why) && /fit=/.test(why) && /риск/.test(why), "объяснение не разложено по формулам");

/* 4. Журнал инструментов: у каждой команды есть why -------------------- */
const journal = [...document.querySelectorAll("#journal li")];
ok(journal.length >= 6, `в журнале ${journal.length} команд — мало`);
ok(journal.every((li) => li.textContent.split("—").length > 1), "есть команда без объяснения");
const cmds = new Set([...document.querySelectorAll("#journal span")].map((s) => s.textContent.trim()));
ok(cmds.has("setMode") && cmds.has("assignRoute"), "в журнале нет основных инструментов");

/* 5. Наблюдатель: бюджет и объяснимость -------------------------------- */
ok(/мс/.test(document.querySelector("#budget").textContent), "бюджет кадра не показан");
ok(/влезает/.test(document.querySelector("#budget").textContent), "бюджет не влезает (должен влезать)");
ok(document.querySelector("#explain").textContent.includes("100 %"), "объяснены не все команды");
ok(/телепортов/.test(document.querySelector("#stats").textContent), "нет счётчика телепортов");

/* 6. Такты двигают время, потребности убывают -------------------------- */
const clock0 = document.querySelector("#clock").textContent;
const agentNeeds = () => [...document.querySelectorAll(".agent.active .bar i")].map((i) => Number(i.style.height.replace("%", "")));
const before = agentNeeds();
click(document.querySelector("#tick"));
ok(document.querySelector("#clock").textContent !== clock0, "такт не сдвинул время");
const after = agentNeeds();
ok(after.some((h, i) => h <= before[i]), "потребности не убывают со временем");

click(document.querySelector("#tick10"));
ok(/такт 12/.test(document.querySelector("#clock").textContent), `10 тактов не прокрутились: ${document.querySelector("#clock").textContent}`);

/* 7. Смена агента ------------------------------------------------------ */
const buttons = [...document.querySelectorAll(".agent")];
click(buttons[3]);
const active = document.querySelector(".agent.active");
ok(active && active.dataset.i === "3", "выбранный агент не подсветился");
ok(document.querySelector("#choice").textContent.includes("A-4"), "выбор не переключился на A-4");

/* 8. Ползунок риска меняет решения ------------------------------------ */
const scoreBefore = [...document.querySelectorAll("#scores tr")].map((r) => r.children[6].textContent);
slide("#risk", 6);
ok(document.querySelector("#risk-val").textContent === "6.0", "вес риска не обновился");
const scoreAfter = [...document.querySelectorAll("#scores tr")].map((r) => r.children[6].textContent);
ok(scoreAfter.some((s, i) => s !== scoreBefore[i]), "вес риска не изменил баллы");

/* 9. Ползунок толпы пересчитывает решения ----------------------------- */
const whyBefore = document.querySelector("#why").textContent;
slide("#crowd", 12);
ok(document.querySelector("#crowd-val").textContent === "12", "толпа не обновилась");
ok(document.querySelector("#why").textContent !== whyBefore, "толпа не изменила объяснение");
ok(/риск 0\.\d/.test(document.querySelector("#why").textContent), "риск не выводится числом");

/* 10. Сброс ------------------------------------------------------------ */
click(document.querySelector("#reset"));
ok(/такт 1/.test(document.querySelector("#clock").textContent), "сброс не вернул первый такт");
ok(document.querySelectorAll(".agent").length === 6, "после сброса потерялись агенты");

/* 11. Мусора нет ------------------------------------------------------- */
ok(!/NaN|undefined|Infinity/.test(document.body.textContent), "на странице есть NaN/undefined/Infinity");

dom.window.close();
console.log(`OK — ${checks} проверок (инспектор ИИ: потребности, баллы, выбор, журнал, ползунки)`);
