/**
 * Смоук-тест демо уравнений (equations-demo.html, §33).
 *
 * Проверяет, что страница показывает именно уравнения: три дороги с загрузкой,
 * точки на дорогах, журнал решений, перекладку потока при перегрузе и сброс.
 * Таймеры в тесте не ждём — дёргаем window.eqDemo.tick() вручную, поэтому тест
 * детерминирован и быстрый.
 *
 * Запуск: node tests/equations-demo.mjs   (нужен jsdom: npm i)
 */
import { JSDOM } from "jsdom";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import assert from "node:assert/strict";

const here = dirname(fileURLToPath(import.meta.url));
const html = readFileSync(join(here, "..", "equations-demo.html"), "utf8");
const dom = new JSDOM(html, { url: "http://localhost/equations-demo.html", runScripts: "dangerously", pretendToBeVisual: true });
const { document, Event } = dom.window;

let checks = 0;
const ok = (cond, msg) => {
  assert.ok(cond, msg);
  checks++;
};

/* 1. Страница собрана --------------------------------------------------- */
ok(/BUNDLE-START\*\//.test(html), "в equations-demo.html нет маркера сборки");
ok(html.length > 15_000, "страница подозрительно маленькая — бандл не вклеен");
ok(typeof dom.window.eqDemo === "object", "демо не инициализировалось");

const demo = dom.window.eqDemo;
ok(demo.ROADS.length === 3, "должно быть три дороги");
ok(document.querySelectorAll(".road").length === 3, "три дороги не отрисованы");
ok(document.querySelectorAll("#stats .stat").length === 5, "сводка показывает не 5 чисел");

/* 2. Шаги двигают точки и заполняют журнал ----------------------------- */
for (let i = 0; i < 24; i++) demo.tick(0.5);
ok(demo.state.vehicles.length > 0, "за 12 секунд не появилось ни одной точки");
ok(document.querySelectorAll(".track .dot").length === demo.state.vehicles.length,
   "точек на дорогах не столько, сколько в состоянии");
ok(document.querySelectorAll("#log li").length > 0, "журнал решений пуст");
ok(document.querySelector("#why").textContent.trim().length > 5, "нет объяснения выбора дороги");

/* 3. Все точки едут по своим дорогам и не «телепортируются» ------------ */
const states = demo.state.vehicles.map((p) => ({ id: p.id, progress: p.progress, edge: p.edge }));
for (let i = 0; i < 10; i++) demo.tick(0.5);
for (const before of states) {
  const now = demo.state.vehicles.find((p) => p.id === before.id);
  if (!now) continue;                                      // доехал — это нормально
  ok(now.progress >= 0, `${before.id}: отрицательный прогресс`);
  const road = demo.state.dispatcher.road(now.edge);
  ok(now.progress <= road.length, `${before.id}: прогресс больше длины дороги`);
  if (now.edge === before.edge) ok(now.progress >= before.progress - 1e-9, `${before.id}: поехал назад без причины`);
}

/* 4. Перегруз: поток перекладывают, и это записано --------------------- */
const { createPoint } = await import("../src/sim/point-state.js");
const r1 = demo.state.dispatcher.road("R1");
for (let i = 0; i < 120; i++) {
  const p = createPoint({ id: `jam${i}`, sym: "V" });
  p.mode = "move";
  p.edge = "R1";
  p.route = ["R1"];
  p.progress = r1.length * 0.1;
  demo.state.dispatcher.addPoint(p);
  demo.state.vehicles.push(p);
}
demo.tick(0.5);
ok(demo.state.reroutes > 0, "при перегрузе R1 никого не переложили");
ok(demo.state.log.some((l) => /переложен/.test(l.text)), "в журнале нет записи о перекладке");
ok(document.querySelector("#why").textContent.length > 10, "нет причины перекладки");

/* 5. Загрузка видна числами -------------------------------------------- */
const rhoText = [...document.querySelectorAll(".rfoot")].map((n) => n.textContent).join(" ");
ok(/ρ = /.test(rhoText), "загрузка не показана");
ok(/км\/ч/.test(rhoText), "скорость не показана");

/* 6. Сброс возвращает всё в начало ------------------------------------- */
document.querySelector("#reset").dispatchEvent(new Event("click", { bubbles: true }));
ok(demo.state.vehicles.length === 0, "после сброса остались точки");
ok(demo.state.arrived === 0 && demo.state.reroutes === 0, "после сброса не обнулились счётчики");
ok(document.querySelectorAll(".track .dot").length === 0, "после сброса на дорогах остались точки");

/* 7. Пауза и шаг -------------------------------------------------------- */
document.querySelector("#toggle").dispatchEvent(new Event("click", { bubbles: true }));
ok(document.querySelector("#toggle").textContent === "Продолжить", "кнопка паузы не переключилась");
document.querySelector("#step").dispatchEvent(new Event("click", { bubbles: true }));
ok(demo.state.simTime > 0, "кнопка «Шаг» не сдвинула время");

/* 8. Нет мусора в разметке --------------------------------------------- */
ok(!/NaN|undefined|Infinity/.test(document.body.textContent), "на странице есть NaN/undefined/Infinity");

dom.window.close();   // гасим setInterval демо, иначе node не завершится
console.log(`OK — ${checks} проверок (демо уравнений: дороги, точки, загрузка, перекладка, сброс)`);
