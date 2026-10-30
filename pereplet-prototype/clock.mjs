/** Постоянные шаги без потери накопленного времени; не зависит от графики. */
export class FixedClock {
  constructor({ step = 1 / 30, maxSteps = 4 } = {}) {
    if (!Number.isFinite(step) || step <= 0 || step > 1 || !Number.isSafeInteger(maxSteps) || maxSteps < 1) throw new Error('Некорректные параметры часов');
    this.step = step;
    this.maxSteps = maxSteps;
    this.accumulator = 0;
    this.tick = 0;
    this._advancing = false;
  }
  advance(dt, simulate) {
    if (!Number.isFinite(dt) || dt < 0 || !Number.isFinite(this.accumulator + dt) || typeof simulate !== 'function') throw new Error('Некорректный шаг часов');
    if (this._advancing) throw new Error('Вложенный вызов часов');
    this.accumulator += dt;
    let steps = 0;
    this._advancing = true;
    try {
      // Эпсилон компенсирует арифметику чисел с плавающей точкой.
      while (this.accumulator + this.step * 1e-9 >= this.step && steps < this.maxSteps) {
        simulate(this.step, this.tick);
        this.accumulator = Math.max(0, this.accumulator - this.step);
        this.tick++;
        steps++;
      }
    } finally { this._advancing = false; }
    return { steps, remaining: this.accumulator, tick: this.tick };
  }
}
