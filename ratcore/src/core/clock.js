// RatCore Core — Фиксированный шаг симуляции + буфер интерполяции (F-01, A-01)

export function createClock({ fixedDt, tickHz, maxSubsteps = 4, dayLengthSec = 600 } = {}) {
  const stepDt = Number(fixedDt) > 0 ? Number(fixedDt) : (Number(tickHz) > 0 ? 1 / Number(tickHz) : 1 / 30);
  let accumulator = 0;
  let tick = 0;
  let simTimeSec = 0;
  let speed = 1;
  let paused = false;
  let alpha = 0;

  return {
    get fixedDt() { return stepDt; },
    get tick() { return tick; },
    get simTimeSec() { return simTimeSec; },
    get alpha() { return alpha; },
    get paused() { return paused; },
    get speed() { return speed; },

    setPaused(flag) {
      paused = Boolean(flag);
    },

    setSpeed(mult) {
      speed = Math.max(0, Math.min(16, Number(mult) || 0));
    },

    // F-01: защита от спирали смерти (dtReal <= 0.1 с, шагов <= maxSubsteps)
    advance(dtRealSec, onStep) {
      if (paused || speed <= 0) return { steps: 0, alpha, tick };
      const clamped = Math.min(Math.max(0, Number(dtRealSec) || 0), 0.1) * speed;
      const maxAccum = stepDt * maxSubsteps;
      accumulator = Math.min(accumulator + clamped, maxAccum);

      let steps = 0;
      while (accumulator + 1e-9 >= stepDt && steps < maxSubsteps) {
        accumulator = Math.max(0, accumulator - stepDt);
        tick++;
        simTimeSec += stepDt;
        steps++;
        if (typeof onStep === 'function') onStep(stepDt, tick, simTimeSec);
      }
      alpha = accumulator / stepDt;
      return { steps, alpha, tick, simTimeSec };
    },

    getTimeOfDay() {
      const phase = ((simTimeSec % dayLengthSec) + dayLengthSec) % dayLengthSec / dayLengthSec;
      const totalMinutes = Math.floor(phase * 24 * 60);
      return {
        phase,
        hour: Math.floor(totalMinutes / 60),
        minute: totalMinutes % 60,
        day: Math.floor(simTimeSec / dayLengthSec) + 1,
      };
    },
  };
}
