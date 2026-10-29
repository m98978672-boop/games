// Прямое WebRTC-соединение двух браузеров. Сигнализация — ручной обмен SDP:
// это не постоянный сервер и не синхронизация общего мира.
import { RoomClient } from './network.js';

const ICE = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] };
const MAX_CODE = 32000;
const $ = id => document.getElementById(id);
const status = message => { $('peer-status').textContent = message; };

function decodeCode(text, expected) {
  const code = text.trim().replace(/\s/g, '');
  if (!code || code.length > MAX_CODE) throw new Error('Вставьте полный код.');
  let data;
  try { data = JSON.parse(atob(code)); } catch { throw new Error('Код повреждён или скопирован не полностью.'); }
  if (data.type !== expected || typeof data.sdp !== 'string' || !data.sdp.startsWith('v=0')) {
    throw new Error(expected === 'offer' ? 'Нужно вставить приглашение хозяина комнаты.' : 'Нужно вставить ответ друга.');
  }
  return { type: data.type, sdp: data.sdp };
}
function encodeCode(description) {
  return btoa(JSON.stringify({ type: description.type, sdp: description.sdp }));
}
function waitForIce(pc) {
  if (pc.iceGatheringState === 'complete') return Promise.resolve();
  return new Promise(resolve => {
    let timer;
    const finish = () => { clearTimeout(timer); pc.removeEventListener('icegatheringstatechange', change); resolve(); };
    const change = () => { if (pc.iceGatheringState === 'complete' || pc.signalingState === 'closed') finish(); };
    pc.addEventListener('icegatheringstatechange', change);
    // Даже если внешний STUN недоступен, сохраняем найденные адреса локальной сети.
    timer = setTimeout(finish, 8000);
  });
}

export class PeerRoom extends RoomClient {
  constructor() {
    super();
    this.pc = null;
    this.channel = null;
    this.role = null;
  }
  createPeer(role) {
    this.close();
    if (typeof RTCPeerConnection === 'undefined') throw new Error('Этот браузер не поддерживает WebRTC.');
    this.role = role;
    const pc = new RTCPeerConnection(ICE);
    this.pc = pc;
    pc.ondatachannel = e => { if (this.pc === pc && role === 'guest') this.bindChannel(e.channel, pc); };
    pc.onconnectionstatechange = () => {
      if (this.pc !== pc) return;
      if (pc.connectionState === 'failed') {
        status('Соединение не удалось. Попробуйте одну сеть Wi‑Fi или сервер комнат.');
        this.close();
      }
    };
    if (role === 'host') this.bindChannel(pc.createDataChannel('lastshore'), pc);
    return pc;
  }
  bindChannel(channel, pc) {
    this.channel = channel;
    channel.onopen = () => {
      if (this.pc !== pc || this.channel !== channel) return;
      this.room = 'Прямая комната';
      this.ws = {
        readyState: 1,
        send: raw => {
          if (channel.readyState !== 'open') return;
          const data = JSON.parse(raw);
          data.name = ($('server-name').value.trim() || 'Друг').slice(0, 20);
          channel.send(JSON.stringify(data));
        },
        close: () => channel.close(),
      };
      status('Игрок подключён. Загружаем остров…');
      this.onJoin?.();
    };
    channel.onmessage = event => {
      if (typeof event.data !== 'string' || event.data.length > 2000) return;
      let data; try { data = JSON.parse(event.data); } catch { return; }
      if (data.type !== 'state') return;
      this.receiveState({ id: 'peer', x: data.x, y: data.y, z: data.z, yaw: data.yaw,
        name: typeof data.name === 'string' ? data.name.slice(0, 20) : 'Друг' });
    };
    channel.onclose = () => {
      if (this.pc !== pc || !this.room) return;
      this.close();
      status('Связь с игроком потеряна.');
      if (window.__game?.running) window.__game.ui.toast('Связь с игроком потеряна', true);
    };
  }
  async offer() {
    const pc = this.createPeer('host');
    await pc.setLocalDescription(await pc.createOffer());
    await waitForIce(pc);
    if (this.pc !== pc || !pc.localDescription) throw new Error('Создание комнаты отменено.');
    return encodeCode(pc.localDescription);
  }
  async answer(code) {
    const offer = decodeCode(code, 'offer');
    const pc = this.createPeer('guest');
    await pc.setRemoteDescription(offer);
    await pc.setLocalDescription(await pc.createAnswer());
    await waitForIce(pc);
    if (this.pc !== pc || !pc.localDescription) throw new Error('Подключение отменено.');
    return encodeCode(pc.localDescription);
  }
  async accept(code) {
    if (!this.pc || this.role !== 'host' || this.pc.signalingState !== 'have-local-offer') {
      throw new Error('Сначала создайте приглашение на этом устройстве.');
    }
    await this.pc.setRemoteDescription(decodeCode(code, 'answer'));
  }
  close() {
    super.close();
    const pc = this.pc; this.pc = null;
    if (this.channel) { this.channel.close(); this.channel = null; }
    if (pc) pc.close();
    this.role = null;
  }
}

export function initPhoneRooms({ activate, onJoin }) {
  const peer = new PeerRoom();
  peer.onJoin = onJoin;
  const buttons = ['peer-host', 'peer-answer', 'peer-apply'].map($);
  const run = async (working, action) => {
    buttons.forEach(b => { b.disabled = true; });
    status(working);
    try { await action(); }
    catch (e) { status(e.message || 'Не удалось создать подключение.'); }
    finally { buttons.forEach(b => { b.disabled = false; }); }
  };
  $('peer-host').addEventListener('click', () => run('Создаём приглашение, подождите…', async () => {
    activate(peer);
    $('peer-out').value = await peer.offer();
    status('Отправьте свой код другу. Затем вставьте его ответ и нажмите «Подключить ответ».');
  }));
  $('peer-answer').addEventListener('click', () => run('Создаём ответ, подождите…', async () => {
    activate(peer);
    $('peer-out').value = await peer.answer($('peer-in').value);
    status('Отправьте свой код хозяину комнаты и ждите подключения.');
  }));
  $('peer-apply').addEventListener('click', () => run('Соединяемся…', async () => {
    await peer.accept($('peer-in').value);
    status('Ожидаем прямое соединение. Это может занять несколько секунд.');
  }));
  $('peer-copy').addEventListener('click', async () => {
    const field = $('peer-out');
    if (!field.value) { status('Сначала создайте приглашение или ответ.'); return; }
    try { await navigator.clipboard.writeText(field.value); status('Код скопирован. Отправьте его другу.'); }
    catch { field.focus(); field.select(); status('Выделите и скопируйте код из поля.'); }
  });
  return peer;
}
