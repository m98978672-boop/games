// Мультитач: левый стик — движение, касание сцены — обзор, кнопки — действия.
export function bindTouch(game) {
  const root = document.getElementById('touch-controls');
  if (!root) return;
  const stick = document.getElementById('touch-stick');
  const knob = document.getElementById('touch-knob');
  let stickId = null;
  const release = (e) => {
    if (e && e.pointerId !== stickId) return;
    stickId = null;
    for (const key of ['forward', 'back', 'left', 'right']) game.input[key] = false;
    knob.style.transform = '';
  };
  const move = (e) => {
    const rect = stick.getBoundingClientRect();
    const x = (e.clientX - rect.left - rect.width / 2) / (rect.width * 0.4);
    const y = (e.clientY - rect.top - rect.height / 2) / (rect.height * 0.4);
    const len = Math.max(1, Math.hypot(x, y));
    knob.style.transform = `translate(${x / len * 30}px, ${y / len * 30}px)`;
    game.input.forward = y < -0.22; game.input.back = y > 0.22;
    game.input.left = x < -0.22; game.input.right = x > 0.22;
  };
  stick.addEventListener('pointerdown', e => { if (stickId !== null) return; e.preventDefault(); stickId = e.pointerId; stick.setPointerCapture(e.pointerId); move(e); });
  stick.addEventListener('pointermove', e => { if (e.pointerId === stickId) move(e); });
  stick.addEventListener('pointerup', release); stick.addEventListener('pointercancel', release); stick.addEventListener('lostpointercapture', release);
  for (const btn of root.querySelectorAll('[data-action]')) {
    const action = btn.dataset.action;
    btn.addEventListener('pointerdown', e => {
      e.preventDefault(); btn.setPointerCapture(e.pointerId);
      if (!game.running || game.paused || game.dead) return;
      if (game.ui.isPanelOpen() && action !== 'bag') return;
      game.audio.resume();
      if (action === 'sprint') game.input.sprint = true;
      else if (action === 'jump') { game.input.jump = true; game.input.jumpHeld = true; }
      else if (action === 'attack') { game.holdingAttack = true; game.attack(); }
      else if (action === 'interact') game.interact();
      else if (action === 'mine-down') game.onKeyDown({ code: 'KeyG', repeat: false });
      else if (action === 'craft') game.togglePanel('craft');
      else if (action === 'bag') game.togglePanel('bag');
      else if (action === 'place') game.placeSelected();
      else if (action === 'use') game.useSelected();
      else if (action === 'view') game.toggleView();
      else if (action === 'pause') game.pause();
    });
    const up = () => {
      if (action === 'sprint') game.input.sprint = false;
      if (action === 'jump') game.input.jumpHeld = false;
      if (action === 'attack') game.holdingAttack = false;
    };
    btn.addEventListener('pointerup', up); btn.addEventListener('pointercancel', up); btn.addEventListener('lostpointercapture', up);
  }
  let look = null;
  game.canvas.addEventListener('pointerdown', e => {
    if (e.pointerType !== 'touch' || !game.running || game.paused || game.ui.isPanelOpen()) return;
    e.preventDefault(); look = { id: e.pointerId, x: e.clientX, y: e.clientY };
    game.canvas.setPointerCapture(e.pointerId);
  });
  game.canvas.addEventListener('pointermove', e => {
    if (!look || look.id !== e.pointerId) return;
    game.player.look((e.clientX - look.x) * 1.5, (e.clientY - look.y) * 1.5);
    look.x = e.clientX; look.y = e.clientY;
  });
  const endLook = e => { if (look?.id === e.pointerId) look = null; };
  game.canvas.addEventListener('pointerup', endLook); game.canvas.addEventListener('pointercancel', endLook);
  window.addEventListener('blur', () => { release(); game.input.sprint = false; game.input.jumpHeld = false; game.holdingAttack = false; });
}
