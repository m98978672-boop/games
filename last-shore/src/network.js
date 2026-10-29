import { Player } from './player.js';

function serverAddress() {
  const raw = document.getElementById('server-url').value.trim();
  const url = new URL(raw || '.', location.href);
  if (!['http:', 'https:', 'ws:', 'wss:'].includes(url.protocol)) throw new Error('Адрес должен начинаться с http(s):// или ws(s)://');
  url.protocol = url.protocol === 'https:' || url.protocol === 'wss:' ? 'wss:' : 'ws:';
  if (!url.pathname.endsWith('/rooms')) url.pathname = url.pathname.replace(/\/$/, '') + '/rooms';
  url.search = ''; url.hash = '';
  if (location.protocol === 'https:' && url.protocol !== 'wss:') throw new Error('Для HTTPS нужен защищённый адрес сервера (https:// или wss://)');
  return url.href;
}

export class RoomClient {
  constructor() { this.ws = null; this.remote = new Map(); this.timer = 0; this.room = null; }
  connect(listOnly = false) {
    const status = document.getElementById('room-status');
    let url;
    try { url = serverAddress(); } catch (e) { status.textContent = e.message; return; }
    this.close();
    status.textContent = 'Подключение к серверу…';
    let ws;
    try { ws = new WebSocket(url); } catch { status.textContent = 'Неверный адрес сервера.'; return; }
    this.ws = ws;
    let timeout = setTimeout(() => { if (ws.readyState !== WebSocket.OPEN) { status.textContent = 'Сервер не ответил.'; ws.close(); } }, 8000);
    ws.onopen = () => {
      clearTimeout(timeout);
      if (listOnly) ws.send(JSON.stringify({ type: 'list' }));
      else ws.send(JSON.stringify({ type: 'join', room: document.getElementById('room-code').value, name: document.getElementById('server-name').value }));
    };
    ws.onmessage = e => {
      let msg; try { msg = JSON.parse(e.data); } catch { return; }
      if (msg.type === 'rooms') {
        const list = document.getElementById('room-list'); list.replaceChildren();
        for (const r of msg.rooms || []) {
          const b = document.createElement('button'); b.className = 'btn-ghost'; b.type = 'button';
          b.textContent = `${r.code} · ${r.count}/${r.max}`;
          b.addEventListener('click', () => { document.getElementById('room-code').value = r.code; }); list.appendChild(b);
        }
        status.textContent = msg.rooms?.length ? 'Выберите комнату или введите свой код.' : 'Комнат пока нет — создайте первую.';
        ws.close();
      } else if (msg.type === 'error') { status.textContent = msg.message; ws.close(); }
      else if (msg.type === 'joined') {
        this.room = msg.room; this.id = msg.id;
        for (const p of msg.players || []) this.receiveState(p);
        status.textContent = `Комната ${msg.room}: подключено. Загружаем остров…`;
        this.onJoin?.();
      } else if (msg.type === 'state') this.receiveState(msg);
      else if (msg.type === 'left') this.remove(msg.id);
    };
    ws.onerror = () => { status.textContent = 'Не удалось подключиться. Проверьте адрес и запуск сервера комнат.'; };
    ws.onclose = () => {
      clearTimeout(timeout);
      if (this.ws !== ws) return;
      this.ws = null;
      if (this.room) {
        this.room = null;
        for (const id of [...this.remote.keys()]) this.remove(id);
        if (window.__game?.running) window.__game.ui.toast('Связь с комнатой потеряна', true);
        status.textContent = 'Соединение закрыто.';
      }
    };
  }
  receiveState(p) {
    if (!p.id || ![p.x, p.y, p.z, p.yaw].every(Number.isFinite)) return;
    const entry = this.remote.get(p.id) || { avatar: null };
    Object.assign(entry, { x: p.x, y: p.y, z: p.z, yaw: p.yaw, name: p.name });
    this.remote.set(p.id, entry);
  }
  remove(id) {
    const entry = this.remote.get(id);
    if (entry?.avatar) {
      entry.avatar.scene.remove(entry.avatar.model);
      entry.avatar.model.traverse(o => {
        if (o.geometry) o.geometry.dispose();
        if (o.material) (Array.isArray(o.material) ? o.material : [o.material]).forEach(m => m.dispose());
      });
    }
    this.remote.delete(id);
  }
  close() {
    if (this.ws) { const ws = this.ws; this.ws = null; ws.close(); }
    for (const id of [...this.remote.keys()]) this.remove(id);
    this.room = null;
  }
  update(game, dt) {
    if (!this.room || !this.ws || this.ws.readyState !== WebSocket.OPEN) return;
    this.timer -= dt;
    if (this.timer <= 0) {
      this.timer = 0.1;
      const p = game.player;
      this.ws.send(JSON.stringify({ type: 'state', x: p.position.x, y: p.position.y, z: p.position.z, yaw: p.facing }));
    }
    for (const entry of this.remote.values()) {
      if (!entry.avatar) {
        entry.avatar = new Player(game.scene);
        entry.avatar.model.position.set(entry.x, entry.y, entry.z);
      }
      const model = entry.avatar.model;
      const k = Math.min(1, dt * 10);
      model.position.x += (entry.x - model.position.x) * k;
      model.position.y += (entry.y - model.position.y) * k;
      model.position.z += (entry.z - model.position.z) * k;
      model.rotation.y = entry.yaw;
    }
  }
}
