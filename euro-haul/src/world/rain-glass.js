// Капли дождя на стекле кабины.
//
// Раньше «дождь на стекле» был статичной CSS-картинкой из шести точек, которая
// просто ползла вниз. Здесь честная модель: капли рождаются с разной крупностью,
// растут от конденсата, скатываются под собственной тяжестью, оставляют мокрый
// след, сталкиваются и сливаются; дворники вытирают сектор дуги, а мокрая зона
// под ними постепенно намокает снова.
//
// Рисуется в 2D-канвас поверх кадра (в виде из кабины), поэтому не трогает three.js
// и работает на телефоне. Разрешение канваса ограничено, чтобы не жечь кадры.

const MAX_DROPS = 220;

export class RainGlass {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas?.getContext('2d') || null;
    this.drops = [];
    this.trails = [];
    this.wetness = 0; // сколько воды на стекле: 0…1
    this.wiper = 0; // текущий угол дворника, радианы
    this.wipeBoost = 0; // след только что прошедшего дворника (затирает капли)
    this.enabled = !!this.ctx;
    this.dpr = 1;
    this.w = 0;
    this.h = 0;
    this.fog = 0; // запотевание снизу
    this.lastRain = 0;
    this.t = 0;
    this.flashes = [];
  }

  /** Размер под окно; вызывается при resize и старте. */
  resize(width, height, dpr = 1) {
    if (!this.canvas) return;
    this.dpr = Math.min(1.5, Math.max(0.75, dpr * 0.75));
    this.w = canvasSize(width, this.dpr);
    this.h = canvasSize(height, this.dpr);
    this.canvas.width = this.w;
    this.canvas.height = this.h;
    this.canvas.style.width = width + 'px';
    this.canvas.style.height = height + 'px';
    // Капли, оказавшиеся за пределами нового размера, выбрасываем.
    this.drops = this.drops.filter((d) => d.x < this.w && d.y < this.h);
  }

  /** Новая капля. Крупные капли тяжелее — они и скатываются первыми. */
  spawn(x, y, scale = 1) {
    if (this.drops.length >= MAX_DROPS) return;
    const r = (1.1 + Math.random() * 3.4) * scale;
    return this.drops.push({
      x: x ?? Math.random() * this.w,
      y: y ?? Math.random() * this.h,
      r,
      vy: 0,
      vx: 0,
      mass: r * r,
      life: 0,
      slide: false,
      wobble: Math.random() * 6.28,
    });
  }

  /**
   * Шаг симуляции.
   * @param {number} dt секунды
   * @param {{rain:number, speed:number, wiper:number, inside:boolean}} opts
   */
  update(dt, opts = {}) {
    if (!this.enabled) return;
    const { rain = 0, speed = 0, wiper = 0, inside = true } = opts;
    this.t += dt;
    const targetWet = inside ? Math.min(1, rain * 1.15 + Math.min(0.25, speed / 140)) : 0;
    // Намокание и высыхание: на скорости стекло сохнет быстрее.
    const dryRate = 0.05 + Math.min(0.12, speed / 400);
    this.wetness += targetWet > this.wetness ? (targetWet - this.wetness) * Math.min(1, dt * 1.4) : -dryRate * dt;
    this.wetness = Math.max(0, Math.min(1, this.wetness));

    // Дворник: разница угла = только что вытертая полоса.
    const dWiper = Math.abs(wiper - this.wiper);
    this.wiper = wiper;
    if (dWiper > 0.002) this.wipeBoost = Math.min(1, this.wipeBoost + dWiper * 3.2);
    this.wipeBoost = Math.max(0, this.wipeBoost - dt * 1.1);

    // Рождение капель: интенсивность зависит от дождя и от того, насколько мокро стекло.
    const spawnRate = this.wetness * 90 * Math.max(0.25, rain) * (1 - this.wipeBoost * 0.55);
    let budget = spawnRate * dt;
    while (budget > 0) {
      if (budget < 1 && Math.random() > budget) break;
      budget -= 1;
      this.spawn();
    }

    // Физика капель.
    const gravity = 900; // px/с² «в пересчёте на стекло»
    const air = 1 + Math.min(3, speed / 25); // на скорости капли сносит вниз сильнее
    for (let i = this.drops.length - 1; i >= 0; i--) {
      const d = this.drops[i];
      d.life += dt;
      // Капля растёт от конденсата, пока не станет достаточно тяжёлой.
      if (!d.slide) d.r += dt * 0.45 * this.wetness;
      if (d.r > 3.1 + Math.random() * 1.6 || d.slide) {
        d.slide = true;
        d.vy += gravity * dt * (0.06 + d.r * 0.012) * air;
        d.vy = Math.min(d.vy, 620);
        d.vx += Math.sin(d.wobble + this.t * 2.1) * 12 * dt;
        d.vx *= 1 - Math.min(1, dt * 3);
        d.x += d.vx * dt;
        d.y += d.vy * dt;
        // След: мокрый шлейф за скатывающейся каплей.
        if (Math.random() < dt * 22) {
          this.trails.push({ x: d.x, y: d.y, r: d.r * 0.55, life: 0, ttl: 2.6 + Math.random() });
        }
        // Капля «съедает» мелкие на пути — они сливаются.
        for (let j = this.drops.length - 1; j >= 0; j--) {
          if (j === i) continue;
          const o = this.drops[j];
          if (Math.abs(o.x - d.x) < d.r + o.r * 0.8 && Math.abs(o.y - d.y) < d.r + o.r * 0.8) {
            d.r = Math.min(9, Math.sqrt(d.r * d.r + o.r * o.r));
            this.drops.splice(j, 1);
            if (j < i) i--;
          }
        }
      }
      // Ушла за нижнюю кромку — убираем.
      if (d.y > this.h + 12 || d.x < -20 || d.x > this.w + 20) this.drops.splice(i, 1);
    }

    // Следы живут своей жизнью: подсыхают.
    for (let i = this.trails.length - 1; i >= 0; i--) {
      const tr = this.trails[i];
      tr.life += dt;
      tr.y += dt * 8;
      if (tr.life > tr.ttl) this.trails.splice(i, 1);
    }
    if (this.trails.length > 380) this.trails.splice(0, this.trails.length - 380);

    // Запотевание: в дождь низ стекла мутнеет.
    this.fog = inside && rain > 0.2 ? Math.min(0.5, this.fog + dt * 0.06) : Math.max(0, this.fog - dt * 0.09);
    this.draw();
  }

  /** Полная очистка (смена машины, выход из рейса). */
  clear() {
    this.drops.length = 0;
    this.trails.length = 0;
    this.wetness = 0;
    this.fog = 0;
    this.ctx?.clearRect(0, 0, this.w, this.h);
  }

  /** Дворник прошёл — стираем капли в секторе дуги. */
  applyWiper(angle, side) {
    if (!this.ctx) return;
    // Сектор: дворник ходит вокруг оси внизу стекла.
    const pivotX = this.w * (side < 0 ? 0.28 : 0.72);
    const pivotY = this.h * 1.02;
    const radius = this.h * 1.15;
    const spread = 0.55;
    const from = angle - spread + (side < 0 ? 0 : 0.06);
    const to = angle + spread;
    this.ctx.save();
    this.ctx.globalCompositeOperation = 'destination-out';
    const grad = this.ctx.createRadialGradient(pivotX, pivotY, radius * 0.15, pivotX, pivotY, radius);
    grad.addColorStop(0, 'rgba(0,0,0,0.95)');
    grad.addColorStop(0.82, 'rgba(0,0,0,0.8)');
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    this.ctx.fillStyle = grad;
    this.ctx.beginPath();
    this.ctx.moveTo(pivotX, pivotY);
    this.ctx.arc(pivotX, pivotY, radius, from - Math.PI / 2, to - Math.PI / 2);
    this.ctx.closePath();
    this.ctx.fill();
    this.ctx.restore();
    // Дворник стёр воду — уменьшаем намоканне в этом секторе.
    this.wetness = Math.max(0, this.wetness - 0.02);
  }

  draw() {
    const ctx = this.ctx;
    if (!ctx) return;
    ctx.clearRect(0, 0, this.w, this.h);
    if (this.wetness < 0.02 && this.trails.length === 0) return;

    // 1. Общая «плёнка» воды на стекле.
    if (this.wetness > 0.05) {
      const g = ctx.createLinearGradient(0, 0, 0, this.h);
      g.addColorStop(0, `rgba(198, 222, 236, ${0.05 * this.wetness})`);
      g.addColorStop(1, `rgba(170, 200, 218, ${0.12 * this.wetness})`);
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, this.w, this.h);
    }

    // 2. Шлейфы от скатившихся капель.
    for (const tr of this.trails) {
      const k = 1 - tr.life / tr.ttl;
      if (k <= 0) continue;
      ctx.beginPath();
      ctx.fillStyle = `rgba(210, 232, 244, ${0.18 * k})`;
      ctx.ellipse(tr.x, tr.y, tr.r * 0.55, tr.r * 1.9, 0, 0, 6.2832);
      ctx.fill();
    }

    // 3. Сами капли: тёмная сердцевина, светлый ободок снизу и блик сверху.
    for (const d of this.drops) {
      const r = d.r;
      if (d.slide) {
        // Скатывающаяся капля вытянута по ходу движения.
        ctx.save();
        ctx.translate(d.x, d.y);
        const stretch = Math.min(1.9, 1 + d.vy / 420);
        ctx.beginPath();
        ctx.fillStyle = 'rgba(206, 228, 242, 0.5)';
        ctx.ellipse(0, 0, r * 0.85, r * stretch, 0, 0, 6.2832);
        ctx.fill();
        ctx.beginPath();
        ctx.fillStyle = 'rgba(18, 26, 34, 0.28)';
        ctx.ellipse(0, r * 0.15, r * 0.6, r * (stretch * 0.78), 0, 0, 6.2832);
        ctx.fill();
        ctx.beginPath();
        ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
        ctx.ellipse(-r * 0.25, -r * 0.35, r * 0.22, r * 0.3, 0, 0, 6.2832);
        ctx.fill();
        ctx.restore();
      } else {
        ctx.beginPath();
        ctx.fillStyle = 'rgba(212, 232, 244, 0.42)';
        ctx.arc(d.x, d.y, r, 0, 6.2832);
        ctx.fill();
        ctx.beginPath();
        ctx.fillStyle = 'rgba(16, 24, 32, 0.22)';
        ctx.arc(d.x + r * 0.12, d.y + r * 0.16, r * 0.62, 0, 6.2832);
        ctx.fill();
        ctx.beginPath();
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.arc(d.x - r * 0.3, d.y - r * 0.32, Math.max(0.5, r * 0.24), 0, 6.2832);
        ctx.fill();
      }
    }

    // 4. Запотевание снизу: мутная полоса, как от дыхания.
    if (this.fog > 0.02) {
      const g = ctx.createLinearGradient(0, this.h * 0.55, 0, this.h);
      g.addColorStop(0, 'rgba(226, 236, 242, 0)');
      g.addColorStop(1, `rgba(226, 236, 242, ${0.28 * this.fog})`);
      ctx.fillStyle = g;
      ctx.fillRect(0, this.h * 0.55, this.w, this.h * 0.45);
    }
  }
}

function canvasSize(size, dpr) {
  return Math.max(1, Math.round(size * dpr));
}
