const launch = document.querySelector('#launch');
const stage = document.querySelector('#game-stage');
const frame = document.querySelector('#game-frame');
const close = document.querySelector('#close-game');
const full = document.querySelector('#fullscreen');
const status = document.querySelector('#launch-status');
let loaded = false;
launch.addEventListener('click', () => {
  if (!('WebAssembly' in window)) { status.textContent = 'Нужен современный браузер с WebAssembly и WebGL 2.'; return; }
  stage.hidden = false;
  document.body.classList.add('playing');
  if (!loaded) {
    frame.src = 'web/game.html';
    loaded = true;
  }
  frame.focus();
});
close.addEventListener('click', () => {
  if (!confirm('Выйти из игры? Несохранённый прогресс будет потерян. Сохраняйся в убежище через меню.')) return;
  if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
  frame.src = 'about:blank';
  loaded = false;
  stage.hidden = true;
  document.body.classList.remove('playing');
  launch.focus();
});
full.addEventListener('click', async () => {
  try {
    if (document.fullscreenElement) await document.exitFullscreen();
    else await stage.requestFullscreen();
    frame.focus();
  } catch { status.textContent = 'Полный экран недоступен. Можно играть в окне.'; }
});
