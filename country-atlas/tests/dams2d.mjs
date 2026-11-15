/* Проверки плотин и ГЭС §5.9 (F-171…F-176). Каждая группа — 20 значений.
   Запуск: node tests/dams2d.mjs */
import assert from 'node:assert/strict';
import {
  DAM, damSites, damWall, reservoirAxis, reservoirPolygon, reservoirAreaKm2,
  dischargeM3s, hydroPowerMW, powerTowers, foamDots, buildDams
} from '../src/dams2d.js';
import { buildRoads } from '../src/roads2d.js';
import { buildWater } from '../src/rivers2d.js';

let checks = 0;
const ok = (cond, msg) => { assert.ok(cond, msg); checks++; };

/* F-171: створы — на полноводных реках, не ближе 8 и не дальше 60 км от города */
{
  const river = (name, flowKm2, widthM, n = 40) => ({
    name, flowKm2, widthM, order: 5,
    pts: Array.from({ length: n }, (_, i) => ({ x: i * 10, y: 0 }))
  });
  const town = (name, x, y) => ({ name, x, y, population: 50000 });
  const net = { lines: [river('А', 50000, 500), river('Б', 20000, 300), river('В', 300, 40)] };
  const sites = damSites(net, [town('Город', 100, 20)], 3);
  ok(sites.length >= 1, 'створ найден');
  ok(!sites.some((s) => s.river === 'В'), 'маловодная река не получает ГЭС');
  for (let i = 0; i < 20; i++) {
    const dist = 8 + i * 2.6;                              // 8…57.4 км от города
    const s = damSites(net, [town('Город', 100 + dist * 0.5, 0)], 3);
    for (const site of s) {
      ok(site.lineKm >= 8 && site.lineKm <= 60, 'ЛЭП длиной 8…60 км, получено ' + site.lineKm.toFixed(1));
      ok(site.flowKm2 >= DAM.minFlowKm2, 'полноводье не ниже порога');
    }
  }
  for (let i = 0; i < 20; i++) {
    const s = damSites(net, [town('Город', 30 + i * 3, 0)], 3);
    for (const site of s) ok(site.widthM > 0 && site.index >= 1, 'водохранилищу есть куда расти: ' + i);
  }
}

/* F-172: стена — три ширины русла в пределах 220…1200 м, толщина растёт с длиной */
{
  for (let i = 0; i < 20; i++) {
    const w = 10 + i * 60;                                  // 10…1150 м
    const wall = damWall(w);
    ok(wall.lengthM >= 220 && wall.lengthM <= 1200, 'длина стены в разумных пределах: ' + w);
    ok(Math.abs(wall.lengthM - Math.max(220, Math.min(1200, w * 3))) < 1e-6, 'длина = три ширины русла');
    ok(Math.abs(wall.thicknessM - (8 + wall.lengthM / 60)) < 1e-9, 'толщина = 8 + L/60');
    ok(wall.crestM === 4, 'гребень на 4 м выше воды');
  }
}

/* F-173: водохранилище — чаша вдоль русла: полуширина растёт, площадь в км² */
{
  const pts = Array.from({ length: 30 }, (_, i) => ({ x: i * 10, y: Math.sin(i / 3) * 3 }));
  const axis = reservoirAxis(pts, 25, 20, 400);
  ok(axis.length > 10, 'ось подробная: 0.4 км шаг');
  ok(Math.abs(axis[0].half - 0.2) < 1e-9, 'у стены полуширина равна половине русла');
  ok(axis[axis.length - 1].half > axis[0].half * 3, 'к верховью чаша шире в несколько раз');
  let prev = 0;
  for (let i = 0; i < 20 && i < axis.length; i++) {
    ok(axis[i].half >= prev - 1e-9, 'полуширина не убывает вверх по течению: ' + i);
    prev = axis[i].half;
  }
  const area = reservoirAreaKm2(axis);
  ok(area > 0.5 && area < 200, 'площадь водохранилища правдоподобна: ' + area.toFixed(1) + ' км²');
  const ring = reservoirPolygon(pts, 25, 20, 400);
  ok(ring.length === axis.length * 2, 'кольцо берегов = два берега');
  // чаша не «круг-заглушка»: длина заметно больше ширины
  const lenKm = Math.hypot(axis.at(-1).x - axis[0].x, axis.at(-1).y - axis[0].y);
  ok(lenKm > axis.at(-1).half * 4, 'водохранилище вытянуто вдоль реки, а не круглое');
  for (let i = 0; i < 20; i++) {
    const w = 100 + i * 50;
    const ax = reservoirAxis(pts, 25, 20, w);
    ok(ax.at(-1).half > ax[0].half, 'шире к верховью при любом русле: ' + w);
  }
}

/* F-174: расход и мощность ГЭС — Q = A·6 л/(с·км²), P = ρgQHη */
{
  for (let i = 0; i < 20; i++) {
    const area = 1000 + i * 5000;
    const q = dischargeM3s(area);
    ok(Math.abs(q - area * 0.006) < 1e-9, 'расход = площадь × сток: ' + area);
    const p = hydroPowerMW(area);
    ok(p > 0 && Number.isFinite(p), 'мощность положительна: ' + area);
    ok(Math.abs(p - (9.81 * q * DAM.headM * DAM.eff) / 1000) < 1e-9, 'формула мощности сходится');
  }
  ok(Math.abs(hydroPowerMW(100000) - hydroPowerMW(100000, 52)) > 1e-6, 'напор влияет на мощность');
  ok(dischargeM3s(0) === 0, 'без водосбора нет расхода');
}

/* F-175: опоры ЛЭП — шаг 350 м, обе крайние опоры на месте */
{
  for (let i = 0; i < 20; i++) {
    const km = 1 + i * 3;                                   // 1…58 км
    const t = powerTowers({ x: 0, y: 0 }, { x: km, y: 0 });
    ok(Math.abs(t.lenKm - km) < 1e-9, 'длина ЛЭП = расстоянию до города');
    ok(t.count === Math.ceil((km * 1000) / DAM.towerStepM) + 1, 'число опор по шагу 350 м: ' + km);
    ok(t.towers[0].x === 0 && Math.abs(t.towers.at(-1).x - km) < 1e-9, 'крайние опоры на концах');
    for (let k = 1; k < t.towers.length; k++) {
      const step = Math.hypot(t.towers[k].x - t.towers[k - 1].x, t.towers[k].y - t.towers[k - 1].y) * 1000;
      ok(Math.abs(step - DAM.towerStepM) < 0.5 || step < DAM.towerStepM, 'шаг опор ровный: ' + step.toFixed(1));
    }
  }
}

/* F-176: пена детерминирована и остаётся у водосброса */
{
  const site = { index: 7 };
  const a = foamDots(site, 14, 0.35), b = foamDots(site, 14, 0.35);
  ok(JSON.stringify(a) === JSON.stringify(b), 'пена не мигает между кадрами');
  ok(foamDots({ index: 8 }, 14, 0.35)[0].dx !== a[0].dx, 'у другого створа своя пена');
  for (let i = 0; i < 20; i++) {
    const dots = foamDots({ index: i }, 14, 0.35);
    ok(dots.length === 14, 'пена считается по числу брызг: ' + i);
    for (const d of dots) {
      ok(Math.abs(d.dx) <= 0.351 && Math.abs(d.dy) <= 0.176, 'брызги не улетают далеко: ' + i);
      ok(d.r >= 0.35 && d.r <= 1, 'размер брызги в диапазоне');
    }
  }
}

/* Связка на настоящем мире: 2–3 плотины, каждая рядом с городом, ЛЭП до него */
{
  const roads = buildRoads();
  const water = buildWater(roads);
  const d = buildDams(water, null);
  ok(d.count >= 2 && d.count <= 3, 'на карте 2–3 плотины §5.9: ' + d.count);
  ok(d.totalMW > 100, 'суммарная мощность заметна: ' + d.totalMW + ' МВт');
  for (const dam of d.dams) {
    ok(dam.widthM >= 100, 'плотина стоит на большой реке: ' + dam.river);
    ok(dam.wall.lengthM >= 220, 'стена не короче 220 м');
    ok(dam.axis.length > 20, 'водохранилище подробное');
    ok(dam.areaKm2 > 1, 'водохранилище имеет площадь: ' + dam.areaKm2.toFixed(1) + ' км²');
    const straight = Math.hypot(dam.cityX - dam.x, dam.cityY - dam.y);
    ok(Math.abs(dam.towers.lenKm - straight) < 1e-6, 'ЛЭП идёт от стены к городу');
    ok(dam.towers.count >= 2, 'у ЛЭП есть опоры');
    ok(dam.powerMW > 1, 'ГЭС вырабатывает мощность: ' + Math.round(dam.powerMW) + ' МВт');
  }
  ok(d.dams.every((x) => x.foam.length === 14), 'у каждого створа своя пена');
  ok(d.ms < 5000, 'плотины строятся один раз и быстро: ' + d.ms + ' мс');
}

console.log('OK: 7 групп проверок плотин и ГЭС §5.9 (F-171…F-176, проверок ' + checks + ')');
