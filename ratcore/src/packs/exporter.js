// RatCore Pack [pack:studio] — Экспорт автономной игры в 1 офлайн .html (< 300 КБ, 100% чистый для антивируса Games) + RatStudio метрики
// Формулы F-149..F-150, F-169; алгоритмы A-99..A-100, A-112.

import { encodeWire2Frame } from '../compress/wire2.js';

function escapeHtml(s) {
  return String(s || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function bytesToHex(bytes) {
  let out = '';
  for (let i = 0; i < bytes.length; i++) out += bytes[i].toString(16).padStart(2, '0');
  return out;
}

// A-99..A-100: Собирает самодостаточный офлайн HTML с упакованной RCW2 сценой (0 внешних URL, 0 eval, 0 сети!)
export function exportSingleHtmlGame({ title = 'RatCore Game', snapshot = {}, author = 'RatCore Studio' } = {}) {
  const safeTitle = escapeHtml(title);
  const safeAuthor = escapeHtml(author);
  const wire = encodeWire2Frame(snapshot, { codec: 'auto' });
  const rcw2Hex = bytesToHex(wire.frame);
  const entitiesJson = JSON.stringify(snapshot.entities || []).replace(/<\/script>/gi, '<\\/script>');

  const html = `<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${safeTitle}</title>
<style>
body{margin:0;background:#0b111b;color:#e2e8f0;font-family:system-ui,sans-serif;display:grid;place-items:center;min-height:100vh}
main{text-align:center;padding:16px}
canvas{border:1px solid #26354d;border-radius:10px;background:#0f172a;max-width:94vw}
p{color:#94a3b8;font-size:13px}
</style>
</head>
<body>
<main>
<h1>${safeTitle}</h1>
<canvas id="c" width="480" height="270"></canvas>
<p>Собрано в ${safeAuthor} · RatCore RCW2 (${wire.wireBytes} Б / CRC32 0x${wire.crc32.toString(16)}) · 100% офлайн</p>
</main>
<script>
(function(){
  var RCW2_HEX = "${rcw2Hex}";
  var ENTITIES = ${entitiesJson};
  var c = document.getElementById("c");
  var ctx = c.getContext("2d");
  var t = 0;
  function draw(){
    t += 0.02;
    ctx.fillStyle = "#0f172a";
    ctx.fillRect(0, 0, c.width, c.height);
    ctx.strokeStyle = "#1e293b";
    for (var gx = 0; gx < c.width; gx += 32) { ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, c.height); ctx.stroke(); }
    for (var gy = 0; gy < c.height; gy += 32) { ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(c.width, gy); ctx.stroke(); }
    for (var i = 0; i < ENTITIES.length; i++) {
      var e = ENTITIES[i];
      var sx = c.width * 0.5 + (e.x || 0) * 18;
      var sy = c.height * 0.5 - (e.y || 0) * 18;
      var r = Math.max(6, (e.scale || 1) * 10 + Math.sin(t + i) * 1.5);
      ctx.fillStyle = "#38bdf8";
      ctx.beginPath();
      ctx.arc(sx, sy, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#e2e8f0";
      ctx.font = "11px monospace";
      ctx.fillText(String(e.id || "obj"), sx + r + 4, sy + 4);
    }
    ctx.fillStyle = "#34d399";
    ctx.font = "12px monospace";
    ctx.fillText("RatCore Offline Build · Entities: " + ENTITIES.length + " · RCW2 hex: " + RCW2_HEX.length + " chars", 10, 20);
    requestAnimationFrame(draw);
  }
  draw();
})();
</script>
</body>
</html>`;

  const sizeBytes = new TextEncoder().encode(html).length;
  return {
    title,
    sizeBytes,
    sizeKB: Number((sizeBytes / 1024).toFixed(2)),
    under300KB: sizeBytes < 300 * 1024,
    wireBytes: wire.wireBytes,
    wireCrc32: wire.crc32,
    html,
  };
}
