// Полный экран разрешён браузером только после действия пользователя.
let optedOut = false;
let wasFullscreen = false;
let pending = false;
let button = null;

function element() { return document.fullscreenElement || document.webkitFullscreenElement || null; }
function requestMethod() {
  const root = document.documentElement;
  return root.requestFullscreen || root.webkitRequestFullscreen;
}
function updateButton() {
  if (!button) return;
  const active = !!element();
  if (wasFullscreen && !active) optedOut = true;
  wasFullscreen = active;
  button.classList.toggle('hidden', typeof requestMethod() !== 'function');
  const en = document.documentElement.lang === 'en';
  const label = active ? (en ? 'Exit fullscreen' : 'Выйти из полного экрана') : (en ? 'Enter fullscreen' : 'На весь экран');
  button.setAttribute('aria-label', label);
  button.title = label;
  button.setAttribute('aria-pressed', String(active));
  button.innerHTML = active
    ? '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 4v5H4 M15 4v5h5 M9 20v-5H4 M15 20v-5h5"/></svg>'
    : '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9V4h5 M20 9V4h-5 M4 15v5h5 M20 15v5h-5"/></svg>';
}
async function enter() {
  const request = requestMethod();
  if (!request || element() || pending) return;
  pending = true;
  try { await request.call(document.documentElement); }
  catch { /* Встроенный браузер или политика страницы запретили полный экран. */ }
  finally { pending = false; updateButton(); }
}
export function autoFullscreen() {
  if (optedOut || (navigator.userActivation && !navigator.userActivation.isActive)) return;
  // Вызов requestFullscreen происходит синхронно, пока действует нажатие.
  void enter();
}
export function initFullscreen() {
  button = document.getElementById('fullscreen-toggle');
  if (!button) return;
  document.addEventListener('fullscreenchange', updateButton);
  document.addEventListener('webkitfullscreenchange', updateButton);
  button.addEventListener('click', async () => {
    if (element()) {
      const exit = document.exitFullscreen || document.webkitExitFullscreen;
      if (!exit) return;
      try { await exit.call(document); } catch { /* браузер отказал */ }
      updateButton();
    } else {
      optedOut = false;
      await enter();
    }
  });
  // В сетевой игре само подключение происходит асинхронно и не считается
  // нажатием. Запрашиваем экран при последнем нажатии на кнопку подключения.
  document.addEventListener('click', e => {
    if (e.target?.closest?.('#btn-room-connect, #peer-answer, #peer-apply')) autoFullscreen();
  }, true);
  updateButton();
}
