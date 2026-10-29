import { getSettings, saveSettings } from './settings.js';
const AUTO = 'lastshore.save.v1';
const slotKey = n => `lastshore.slot.${n}.v1`;
const SERVER_KEY = 'lastshore.servers.v1';
const get = id => document.getElementById(id);
function tr(ru, en) { return getSettings().language === 'en' ? en : ru; }
function validSave(raw) {
  if (!raw || raw.length > 2_000_000) return false;
  try {
    const s = JSON.parse(raw);
    return !!s && s.v === 1 && Array.isArray(s.pos) && s.pos.length === 2 && s.pos.every(Number.isFinite) &&
      Math.abs(s.pos[0]) <= 300 && Math.abs(s.pos[1]) <= 300 &&
      (!s.need || (Array.isArray(s.need) && s.need.length === 4 && s.need.every(Number.isFinite))) &&
      (!s.inv || (typeof s.inv === 'object' && !Array.isArray(s.inv)));
  } catch { return false; }
}
function translate() {
  const en = getSettings().language === 'en';
  document.documentElement.lang = en ? 'en' : 'ru';
  document.querySelectorAll('[data-en]').forEach(el => {
    if (el.dataset.ru === undefined) el.dataset.ru = el.textContent;
    el.textContent = en ? el.dataset.en : el.dataset.ru;
  });
  renderSlots();
}
function status(id, ru, en) { get(id).textContent = tr(ru, en); }
function renderSlots() {
  const root = get('save-slots');
  if (!root) return;
  root.replaceChildren();
  for (let n = 1; n <= 3; n++) {
    let raw = null; try { raw = localStorage.getItem(slotKey(n)); } catch {}
    const save = validSave(raw) ? JSON.parse(raw) : null;
    const row = document.createElement('div'); row.className = 'save-slot';
    const title = document.createElement('strong'); title.textContent = `${tr('Слот', 'Slot')} ${n}`;
    const info = document.createElement('span');
    info.textContent = save ? `${tr('День', 'Day')} ${save.day || 1} · ${new Date(save.savedAt || 0).toLocaleString()}` : tr('Пусто', 'Empty');
    const buttons = document.createElement('div'); buttons.className = 'btn-row';
    const button = (label, action, disabled = false) => {
      const b = document.createElement('button'); b.type = 'button'; b.className = 'btn-ghost';
      b.textContent = label; b.disabled = disabled; b.addEventListener('click', action); buttons.appendChild(b);
    };
    button(tr('Сохранить', 'Save'), () => {
      try {
        const game = window.__game;
        if (game?.running && !game.save()) throw new Error('save');
        const raw = localStorage.getItem(AUTO);
        if (!validSave(raw)) { status('save-status', 'Нет текущей игры или автосохранения.', 'No current game or autosave.'); return; }
        if (save && !window.confirm(tr('Перезаписать этот слот?', 'Overwrite this slot?'))) return;
        localStorage.setItem(slotKey(n), raw); renderSlots();
        status('save-status', 'Игра сохранена в слот.', 'Game saved to slot.');
      } catch { status('save-status', 'Не удалось сохранить: проверьте доступ к хранилищу браузера.', 'Could not save: check browser storage.'); }
    });
    button(tr('Загрузить', 'Load'), () => {
      try {
        const selected = localStorage.getItem(slotKey(n));
        if (!validSave(selected)) throw new Error('invalid');
        if (window.__game?.running) {
          if (!window.confirm(tr('Загрузить слот и выйти из текущей игры?', 'Load this slot and leave the current game?'))) return;
          // Записываем после подтверждения; текущую игру больше не автосохраняем поверх слота.
          sessionStorage.setItem('lastshore.loadPending', '1');
          try { localStorage.setItem(AUTO, selected); }
          catch (err) { sessionStorage.removeItem('lastshore.loadPending'); throw err; }
          window.__game.running = false;
          window.__roomClient?.close();
          window.location.reload();
        } else {
          localStorage.setItem(AUTO, selected);
          get('saves-screen').classList.add('hidden');
          window.__scheduleGame?.(true);
        }
      } catch { status('save-status', 'Не удалось загрузить слот.', 'Could not load slot.'); }
    }, !save);
    button(tr('Удалить', 'Delete'), () => {
      if (!window.confirm(tr('Удалить сохранение?', 'Delete this save?'))) return;
      try { localStorage.removeItem(slotKey(n)); renderSlots(); } catch { status('save-status', 'Не удалось удалить слот.', 'Could not delete slot.'); }
    }, !save);
    row.append(title, info, buttons); root.appendChild(row);
  }
}
function serverList() {
  try { const a = JSON.parse(localStorage.getItem(SERVER_KEY) || '[]'); return Array.isArray(a) ? a.filter(x => typeof x === 'string').slice(0, 12) : []; }
  catch { return []; }
}
function renderServers() {
  const select = get('server-saved'); const selected = select.value;
  select.replaceChildren(); const blank = document.createElement('option'); blank.value = ''; blank.textContent = tr('Выберите сервер', 'Choose a server'); select.appendChild(blank);
  for (const url of serverList()) { const o = document.createElement('option'); o.value = url; o.textContent = url; select.appendChild(o); }
  if (serverList().includes(selected)) select.value = selected;
}
export function initSettingsAndSaves(scheduleBoot) {
  window.__scheduleGame = scheduleBoot;
  const current = getSettings();
  get('setting-quality').value = current.quality; get('setting-touch').value = current.touch;
  get('setting-volume').value = Math.round(current.volume * 100); get('setting-language').value = current.language;
  const apply = () => {
    const s = { quality: get('setting-quality').value, touch: get('setting-touch').value,
      volume: Number(get('setting-volume').value) / 100, language: get('setting-language').value };
    try { saveSettings(s); } catch { status('settings-status', 'Не удалось сохранить настройки.', 'Could not save settings.'); return; }
    if (window.__game?.audio.master) window.__game.audio.master.gain.value = s.volume;
    translate(); renderServers();
    status('settings-status', 'Настройки сохранены.', 'Settings saved.');
  };
  for (const id of ['setting-quality', 'setting-touch', 'setting-volume', 'setting-language']) get(id).addEventListener(id === 'setting-volume' ? 'input' : 'change', apply);
  for (const id of ['btn-settings', 'btn-pause-settings']) get(id).addEventListener('click', () => get('settings-screen').classList.remove('hidden'));
  get('btn-settings-close').addEventListener('click', () => get('settings-screen').classList.add('hidden'));
  for (const id of ['btn-saves', 'btn-pause-saves']) get(id).addEventListener('click', () => { renderSlots(); get('save-status').textContent = ''; get('saves-screen').classList.remove('hidden'); });
  get('btn-saves-close').addEventListener('click', () => get('saves-screen').classList.add('hidden'));
  get('btn-main-menu').addEventListener('click', () => {
    if (window.__game?.running && !window.__game.save()) { window.__game.ui.toast(tr('Не удалось сохранить игру.', 'Could not save game.'), true); return; }
    window.__roomClient?.close(); window.location.reload();
  });
  get('server-saved').addEventListener('change', e => { if (e.target.value) get('server-url').value = e.target.value; });
  get('btn-server-add').addEventListener('click', () => {
    const value = get('server-url').value.trim();
    try {
      const url = new URL(value);
      if (!['http:', 'https:', 'ws:', 'wss:'].includes(url.protocol) || url.username || url.password) throw new Error();
      const a = [...new Set([...serverList(), url.href])].slice(-12); localStorage.setItem(SERVER_KEY, JSON.stringify(a));
      renderServers(); get('server-saved').value = url.href;
      status('room-status', 'Адрес сохранён на этом устройстве.', 'Server saved on this device.');
    } catch { status('room-status', 'Введите адрес сервера с http://, https://, ws:// или wss://.', 'Enter an http://, https://, ws:// or wss:// server address.'); }
  });
  get('btn-server-remove').addEventListener('click', () => {
    try { localStorage.setItem(SERVER_KEY, JSON.stringify(serverList().filter(url => url !== get('server-saved').value))); renderServers(); }
    catch { status('room-status', 'Не удалось удалить адрес.', 'Could not remove address.'); }
  });
  translate(); renderServers();
  try { if (sessionStorage.getItem('lastshore.loadPending') === '1') { sessionStorage.removeItem('lastshore.loadPending'); scheduleBoot(true); } } catch {}
}
