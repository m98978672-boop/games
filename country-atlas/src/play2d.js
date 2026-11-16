/* Полигон ИИ §16.4–§16.5: кольцевая полоса с машинами под IDM и светофор, который
   выпускает очередь по F-193. Это не «картинка ради картинки»: тот же код, что считает
   мозги водителей на дорогах мира, гоняется здесь на 12 машинах — и в кадре видно,
   как агрессивный догоняет и тормозит, как фура тянет разгон, как растёт очередь. */
import { DRIVER, idmAccel, pickProfile, greenTime, rngFork } from './ai2d.js';

export const PLAY2D = {
  ringM: 700,          // длина кольца, м
  stopM: 620,          // стоп-линия перед светофором
  cars: 12,            // сколько машин на кольце
  yellowSec: 3,
  dtMax: 0.05,         // внутренний шаг интегрирования, с
  baseKmh: 60          // городской предел полосы
};

/* F-198: цикл светофора. Зелёный — по очереди (F-193), жёлтый фиксированный,
   красный — тем длиннее, чем больше выпустили, но не больше 34 с. */
export function lightTiming(queue) {
  const green = greenTime(queue);
  const red = Math.max(8, Math.min(34, 0.55 * green + 7));
  return { green, yellow: PLAY2D.yellowSec, red };
}

/* Машина на кольце: позиция в метрах от начала, своя скорость и характер. */
function makeCar(index, rand) {
  const profile = pickProfile('car', index, rand);
  const v0 = (PLAY2D.baseKmh + profile.over) / 3.6;
  return {
    index, profile, v0,
    x: index * (PLAY2D.ringM / PLAY2D.cars),
    v: v0 * (0.6 + 0.3 * rand()),
    len: 4.5,
    p: 0,                 // сколько раз прошёл стоп-линию
    braking: 0            // 0…1 — насколько сильно тормозит (для подсветки)
  };
}

export function buildPlay(seed = 424242) {
  const rand = rngFork(seed ^ 0x51ed270b, 7);
  const cars = [];
  for (let i = 0; i < PLAY2D.cars; i++) cars.push(makeCar(i, rand));
  const light = { state: 'green', t: 0, ...lightTiming(0), queue: 0, passed: 0 };
  return { seed, t: 0, cars, light, passed: 0, minGap: Infinity, maxQueue: 0, steps: 0 };
}

/* Очередь — машины, вставшие перед стоп-линией (v < 0.6 м/с в пределах 120 м до неё). */
export function queueLength(play) {
  let q = 0;
  for (const c of play.cars) {
    const toStop = (PLAY2D.stopM - c.x + PLAY2D.ringM) % PLAY2D.ringM;
    if (c.v < 0.6 && toStop < 120) q++;
  }
  return q;
}

/* Передний в кольце: ближайшая машина впереди (по ходу движения, x растёт). */
export function leaderOf(play, car) {
  let best = null, bestGap = Infinity;
  for (const o of play.cars) {
    if (o === car) continue;
    const gap = (o.x - car.x + PLAY2D.ringM) % PLAY2D.ringM - o.len;
    if (gap < bestGap) { bestGap = gap; best = o; }
  }
  return { car: best, gap: bestGap };
}

/* Стоп-линия как «виртуальная машина» нулевой длины: пока горит красный или жёлтый,
   она стоит там, где стоит. */
export function stopGap(car) {
  return (PLAY2D.stopM - car.x + PLAY2D.ringM) % PLAY2D.ringM;
}

/* Один подшаг. Сумма торможений (R-16.5): передняя машина и стоп-линия — берём меньшее. */
export function stepPlay(play, dtSec) {
  let left = Math.max(0, dtSec);
  while (left > 1e-9) {
    const dt = Math.min(PLAY2D.dtMax, left);
    left -= dt;
    subStep(play, dt);
  }
  play.light.queue = queueLength(play);
  if (play.light.queue > play.maxQueue) play.maxQueue = play.light.queue;
  return play;
}

function subStep(play, dt) {
  const light = play.light;
  const holdLine = light.state !== 'green';
  light.t += dt;
  const dur = light.state === 'green' ? light.green : light.state === 'yellow' ? light.yellow : light.red;
  if (light.t >= dur) {
    light.t = 0;
    if (light.state === 'green') light.state = 'yellow';
    else if (light.state === 'yellow') light.state = 'red';
    else { light.state = 'green'; Object.assign(light, lightTiming(light.queue)); }
  }

  for (const c of play.cars) {
    const lead = leaderOf(play, c);
    const gapCar = lead.gap;
    let acc = idmAccel(c.v, c.v0, gapCar, c.v - lead.car.v, c.profile);
    if (holdLine) {
      const sg = Math.max(0.2, stopGap(c));
      const aStop = idmAccel(c.v, c.v0, sg, c.v, c.profile);
      acc = Math.min(acc, aStop);
    }
    c.braking = acc < -0.3 ? Math.min(1, -acc / (3 * c.profile.b)) : 0;
    c.v = Math.max(0, c.v + acc * dt);
    c.x += c.v * dt;
    if (c.x >= PLAY2D.ringM) {
      c.x -= PLAY2D.ringM;
      play.passed++;
      c.p++;
      light.passed++;
    }
    // минимальный зазор между машинами на кольце — для проверки «не проезжают друг сквозь друга»
    const g = leaderOf(play, c).gap;
    if (g > 0 && g < play.minGap) play.minGap = g;
  }
  play.t += dt;
  play.steps++;
}

/* Сводка для HUD и рисунка. */
export function playStats(play) {
  const speed = play.cars.reduce((a, c) => a + c.v, 0) / Math.max(1, play.cars.length);
  const byProfile = {};
  for (const p of Object.keys(DRIVER)) byProfile[p] = 0;
  for (const c of play.cars) byProfile[c.profile.id]++;
  return {
    state: play.light.state,
    queue: play.light.queue,
    green: play.light.green,
    red: play.light.red,
    passed: play.passed,
    avgKmh: speed * 3.6,
    maxQueue: play.maxQueue,
    minGap: Number.isFinite(play.minGap) ? play.minGap : null,
    byProfile
  };
}

/* Цвет машины по характеру — он же в кадре на карте мира. */
export const PROFILE_COLOR = {
  calm: '#9fd8ff',
  normal: '#f4f6f8',
  aggressive: '#ff8f6a',
  novice: '#ffd75e',
  truck: '#c9d2da'
};
