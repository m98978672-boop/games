// Ввод: клавиатура, мышь, колесо. Никакой логики игры — только состояние и привязки из input_map.json.
export class Input {
  constructor(canvas, bindings) {
    this.canvas = canvas;
    this.bindings = bindings || {};
    this.keys = new Set();
    this.pressed = new Set();
    this.mouse = { x: 0, y: 0, worldX: 0, worldY: 0, left: false, right: false, middle: false, wheel: 0, wheelDelta: 0 };
    this.dragging = false;
    this.dragStart = null;
    this.enabled = true;
    this._bind();
  }

  _bind() {
    window.addEventListener('keydown', (e) => {
      if (['Space', 'Tab', 'F3', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) e.preventDefault();
      if (e.repeat) return;
      this.keys.add(e.code);
      this.pressed.add(e.code);
    });
    window.addEventListener('keyup', (e) => this.keys.delete(e.code));
    window.addEventListener('blur', () => { this.keys.clear(); this.mouse.left = this.mouse.right = this.mouse.middle = false; });

    // координаты в CSS-пикселях — так же, как их считает рендерер
    const pos = (e) => {
      const r = this.canvas.getBoundingClientRect();
      this.mouse.x = e.clientX - r.left;
      this.mouse.y = e.clientY - r.top;
    };
    this.canvas.addEventListener('pointermove', (e) => pos(e));
    this.canvas.addEventListener('pointerdown', (e) => {
      pos(e);
      this.canvas.setPointerCapture?.(e.pointerId);
      if (e.button === 0) { this.mouse.left = true; this.dragStart = { x: this.mouse.x, y: this.mouse.y }; }
      if (e.button === 1) this.mouse.middle = true;
      if (e.button === 2) this.mouse.right = true;
      this.pressed.add(e.button === 0 ? 'MouseLeft' : e.button === 2 ? 'MouseRight' : 'MouseMiddle');
    });
    this.canvas.addEventListener('pointerup', (e) => {
      pos(e);
      if (e.button === 0) this.mouse.left = false;
      if (e.button === 1) this.mouse.middle = false;
      if (e.button === 2) this.mouse.right = false;
    });
    this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());
    this.canvas.addEventListener('wheel', (e) => {
      e.preventDefault();
      this.mouse.wheel = Math.sign(e.deltaY);
      this.mouse.wheelDelta += e.deltaY;
    }, { passive: false });
  }

  down(action) {
    const code = this.bindings[action];
    return !!code && this.keys.has(code);
  }
  hit(action) {
    const code = this.bindings[action];
    return !!code && this.pressed.has(code);
  }
  key(code) { return this.keys.has(code); }
  keyHit(code) { return this.pressed.has(code); }

  // Вызывается в конце кадра
  endFrame() {
    this.pressed.clear();
    this.mouse.wheel = 0;
    this.mouse.wheelDelta = 0;
  }
}

export const defaultBindings = {
  moveUp: 'KeyW', moveDown: 'KeyS', moveLeft: 'KeyA', moveRight: 'KeyD',
  reload: 'KeyR', interact: 'KeyE', pause: 'Space', switchMode: 'Tab', debug: 'F3',
  menu: 'Escape', buildMenu: 'KeyB', directives: 'KeyT', autopilot: 'KeyP',
  skills: 'KeyK', createSquad: 'KeyG', speedUp: 'BracketRight', speedDown: 'BracketLeft',
  commandMap: 'KeyM',
};
