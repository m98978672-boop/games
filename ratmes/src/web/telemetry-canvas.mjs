// Визуализаторы телеметрии RatMes: живой график RAM / задержки инструментов на canvas,
// визуальная карта чанков файла и волна голосовых заметок.

export class TelemetrySparkline {
  constructor(canvasEl, { maxPoints = 40 } = {}) {
    this.canvas = canvasEl;
    this.maxPoints = maxPoints;
    this.ramSeries = [];
    this.latencySeries = [];
  }

  push({ ramMb = 0, avgLatencyMs = 0 }) {
    this.ramSeries.push(Number(ramMb) || 0);
    this.latencySeries.push(Number(avgLatencyMs) || 0);
    if (this.ramSeries.length > this.maxPoints) this.ramSeries.shift();
    if (this.latencySeries.length > this.maxPoints) this.latencySeries.shift();
    this.draw();
  }

  draw() {
    if (!this.canvas) return;
    const ctx = this.canvas.getContext('2d');
    if (!ctx) return;
    const w = this.canvas.width;
    const h = this.canvas.height;
    ctx.clearRect(0, 0, w, h);

    // Сетка
    ctx.strokeStyle = 'rgba(255,255,255,0.06)';
    ctx.lineWidth = 1;
    for (let y = 16; y < h; y += 22) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    this._drawSeries(ctx, this.ramSeries, '#e8b45a', 'rgba(232,180,90,0.14)', 260, w, h);
    this._drawSeries(ctx, this.latencySeries, '#3ddc84', null, 20, w, h);

    // Легенда
    ctx.font = '10px ui-monospace, monospace';
    const lastRam = this.ramSeries[this.ramSeries.length - 1] ?? 0;
    const lastLat = this.latencySeries[this.latencySeries.length - 1] ?? 0;
    ctx.fillStyle = '#e8b45a';
    ctx.fillText(`RAM ${lastRam.toFixed(0)} МБ`, 6, 12);
    ctx.fillStyle = '#3ddc84';
    ctx.fillText(`Tool ${lastLat.toFixed(2)} мс`, w - 94, 12);
  }

  _drawSeries(ctx, data, stroke, fill, maxScale, w, h) {
    if (data.length < 2) return;
    const topPad = 18;
    const botPad = 6;
    const usableH = h - topPad - botPad;
    const maxVal = Math.max(maxScale, ...data);
    const stepX = w / (this.maxPoints - 1);

    ctx.beginPath();
    data.forEach((val, idx) => {
      const x = idx * stepX;
      const y = topPad + usableH - (Math.min(val, maxVal) / maxVal) * usableH;
      if (idx === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.strokeStyle = stroke;
    ctx.lineWidth = 1.8;
    ctx.stroke();

    if (fill) {
      const lastX = (data.length - 1) * stepX;
      ctx.lineTo(lastX, h - botPad);
      ctx.lineTo(0, h - botPad);
      ctx.closePath();
      ctx.fillStyle = fill;
      ctx.fill();
    }
  }
}

export function renderChunkMapElement(chunkMap = []) {
  const wrap = document.createElement('div');
  wrap.className = 'chunk-map';
  for (const state of chunkMap) {
    const cell = document.createElement('span');
    cell.className = `chunk-cell ${state}`;
    cell.title = state === 'done' ? 'Чанк доставлен (SHA-256 ок)' : (state === 'dropped' ? 'Обрыв VPN (RM-302) — точка докачки' : 'Ожидает отправки');
    wrap.appendChild(cell);
  }
  return wrap;
}
