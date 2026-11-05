import { createServer } from 'node:http';
import { execFile } from 'node:child_process';
import { randomBytes, randomInt, timingSafeEqual } from 'node:crypto';
import os from 'node:os';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

export const REMOTE_PORT = 4175;
export const PAIR_CODE_LENGTH = 6;
export const PAIR_CODE_TTL_MS = 2 * 60 * 1000;
export const PAIR_REQUEST_TTL_MS = 90 * 1000;
export const SESSION_TTL_MS = 30 * 60 * 1000;
export const MAX_PENDING_REQUESTS = 3;
export const MAX_SESSIONS = 2;
const CODE_ATTEMPT_WINDOW_MS = 60 * 1000;
const MAX_CODE_ATTEMPTS_PER_WINDOW = 6;
const MAX_SCREEN_GRABS_PER_SESSION = 240;
const SCREEN_GRAB_MIN_INTERVAL_MS = 300;

/** Keyboard tokens accepted from a paired phone. Anything else is rejected. */
export const REMOTE_KEY_ACTIONS = new Map([
  ['up', '{UP}'],
  ['down', '{DOWN}'],
  ['left', '{LEFT}'],
  ['right', '{RIGHT}'],
  ['ok', '{ENTER}'],
  ['back', '{ESC}'],
  ['tab', '{TAB}'],
  ['space', ' '],
  ['select', '{ENTER}'],
]);

function remoteError(code, status, message) {
  const error = new Error(message);
  error.code = code;
  error.status = status;
  return error;
}

function constantTimeMatch(left, right) {
  const a = Buffer.from(String(left));
  const b = Buffer.from(String(right));
  return a.length === b.length && timingSafeEqual(a, b);
}

function normalizeCode(value) {
  const digits = String(value ?? '').replace(/\s+/g, '');
  return /^\d{6}$/.test(digits) ? digits : null;
}

function sanitizeDeviceName(value) {
  const text = typeof value === 'string' ? value.trim().replace(/[\u0000-\u001f\u007f]/g, '') : '';
  if (!text) return 'Устройство без имени';
  return text.slice(0, 40);
}

function lanAddresses(networkInterfaces = os.networkInterfaces) {
  const result = [];
  let interfaces;
  try {
    interfaces = networkInterfaces();
  } catch {
    return result;
  }
  for (const entries of Object.values(interfaces || {})) {
    for (const entry of entries || []) {
      if (!entry || entry.internal) continue;
      if (entry.family !== 'IPv4' && entry.family !== 4) continue;
      if (typeof entry.address !== 'string') continue;
      result.push(entry.address);
    }
  }
  return [...new Set(result)];
}

const CAPTURE_SCRIPT = `
Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing
$bounds = [System.Windows.Forms.Screen]::PrimaryScreen.Bounds
$scale = 1.0
if ($bounds.Width -gt 1280) { $scale = 1280 / $bounds.Width }
$width = [int]($bounds.Width * $scale)
$height = [int]($bounds.Height * $scale)
$full = New-Object System.Drawing.Bitmap $bounds.Width, $bounds.Height
$graphics = [System.Drawing.Graphics]::FromImage($full)
$graphics.CopyFromScreen($bounds.Location, [System.Drawing.Point]::Empty, $bounds.Size)
$target = New-Object System.Drawing.Bitmap $width, $height
$targetGraphics = [System.Drawing.Graphics]::FromImage($target)
$targetGraphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBilinear
$targetGraphics.DrawImage($full, 0, 0, $width, $height)
$stream = New-Object System.IO.MemoryStream
$codec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq 'image/jpeg' }
$parameters = New-Object System.Drawing.Imaging.EncoderParameters 1
$parameters.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality, 45L)
$target.Save($stream, $codec, $parameters)
$graphics.Dispose()
$targetGraphics.Dispose()
$full.Dispose()
$target.Dispose()
[Convert]::ToBase64String($stream.ToArray())
`.trim().replace(/\r?\n/g, '; ');

const MOUSE_SCRIPT = (x, y) => `
Add-Type -AssemblyName System.Windows.Forms
$screen = [System.Windows.Forms.Screen]::PrimaryScreen.Bounds
$targetX = [int]($screen.Width * ${x})
$targetY = [int]($screen.Height * ${y})
Add-Type @'
using System;
using System.Runtime.InteropServices;
public class PbMouse {
  [DllImport("user32.dll")] public static extern bool SetCursorPos(int x, int y);
  [DllImport("user32.dll")] public static extern void mouse_event(uint flags, uint dx, uint dy, uint data, UIntPtr extra);
}
'@
[void][PbMouse]::SetCursorPos($targetX, $targetY)
[PbMouse]::mouse_event(0x0002, 0, 0, 0, [UIntPtr]::Zero)
[PbMouse]::mouse_event(0x0004, 0, 0, 0, [UIntPtr]::Zero)
`.trim().replace(/\r?\n/g, '; ');

const KEY_SCRIPT = (keys) => `
Add-Type -AssemblyName System.Windows.Forms
[System.Windows.Forms.SendKeys]::SendWait('${keys}')
`.trim().replace(/\r?\n/g, '; ');

export function createScreenCapture({ platform = process.platform, run = execFileAsync } = {}) {
  const available = platform === 'win32';
  return {
    available,
    reason: available ? null : 'Захват экрана доступен только в Windows-сборке PLAYBRIDGE.',
    async grab() {
      if (!available) throw remoteError('capture_unsupported', 501, 'Захват экрана поддерживается только в Windows.');
      const { stdout } = await run('powershell.exe', ['-NoProfile', '-NonInteractive', '-Command', CAPTURE_SCRIPT], {
        timeout: 6000,
        maxBuffer: 16 * 1024 * 1024,
        windowsHide: true,
      });
      const base64 = String(stdout).replace(/\s+/g, '');
      if (!base64) throw remoteError('capture_empty', 502, 'Не удалось получить кадр экрана.');
      return Buffer.from(base64, 'base64');
    },
  };
}

export function createInputRunner({ platform = process.platform, run = execFileAsync, launch = null } = {}) {
  const available = platform === 'win32';
  const launchImpl = launch || (async (target) => run('cmd.exe', ['/c', 'start', '', target], { timeout: 8000, windowsHide: true }));
  return {
    available,
    reason: available ? null : 'Управление компьютером поддерживается только в Windows-сборке PLAYBRIDGE.',
    async key(action) {
      const keys = REMOTE_KEY_ACTIONS.get(action);
      if (!keys) throw remoteError('unsupported_action', 400, 'Такое действие не разрешено.');
      if (!available) throw remoteError('input_unsupported', 501, 'Управление компьютером поддерживается только в Windows.');
      await run('powershell.exe', ['-NoProfile', '-NonInteractive', '-Command', KEY_SCRIPT(keys)], { timeout: 5000, windowsHide: true });
      return { action, kind: 'key' };
    },
    async click(x, y) {
      const nx = Number(x);
      const ny = Number(y);
      if (!Number.isFinite(nx) || !Number.isFinite(ny) || nx < 0 || nx > 1 || ny < 0 || ny > 1) {
        throw remoteError('invalid_pointer', 400, 'Координаты указателя должны быть в диапазоне 0–1.');
      }
      if (!available) throw remoteError('input_unsupported', 501, 'Управление компьютером поддерживается только в Windows.');
      await run('powershell.exe', ['-NoProfile', '-NonInteractive', '-Command', MOUSE_SCRIPT(nx.toFixed(4), ny.toFixed(4))], { timeout: 5000, windowsHide: true });
      return { action: 'click', kind: 'pointer' };
    },
    async open(target) {
      if (!available) throw remoteError('input_unsupported', 501, 'Запуск приложений поддерживается только в Windows.');
      await launchImpl(target);
      return { action: 'open', kind: 'launch', target };
    },
  };
}

/**
 * In-memory pairing controller for phone → PC control.
 *
 * The PC always approves a request explicitly; the code alone never grants
 * control. Sessions are shown in the local UI and can be revoked instantly.
 */
export function createRemoteAccess({
  now = () => Date.now(),
  port = REMOTE_PORT,
  bindHost = '0.0.0.0',
  networkInterfaces = os.networkInterfaces,
  capture = null,
  input = null,
  getHandler = () => null,
} = {}) {
  const captureDevice = capture || createScreenCapture();
  const inputDevice = input || createInputRunner();
  const state = {
    server: null,
    enabled: false,
    boundPort: null,
    startedAt: null,
    code: null,
    codeExpiresAt: 0,
    requests: new Map(),
    sessions: new Map(),
    attempts: new Map(),
    screenCounts: new Map(),
    lastGrab: new Map(),
  };

  function purge() {
    const stamp = now();
    if (state.code && state.codeExpiresAt <= stamp) {
      state.code = null;
      state.codeExpiresAt = 0;
    }
    for (const [id, entry] of state.requests) {
      if (entry.expiresAt <= stamp) state.requests.delete(id);
    }
    for (const [token, entry] of state.sessions) {
      if (entry.expiresAt <= stamp) {
        state.sessions.delete(token);
        state.screenCounts.delete(token);
        state.lastGrab.delete(token);
      }
    }
    for (const [ip, entry] of state.attempts) {
      if (entry.resetAt <= stamp) state.attempts.delete(ip);
    }
  }

  function issueCode() {
    purge();
    state.code = String(randomInt(0, 10 ** PAIR_CODE_LENGTH)).padStart(PAIR_CODE_LENGTH, '0');
    state.codeExpiresAt = now() + PAIR_CODE_TTL_MS;
    return { code: state.code, expiresAt: state.codeExpiresAt };
  }

  function urls(activePort = state.boundPort) {
    if (!activePort) return [];
    return lanAddresses(networkInterfaces).map((address) => `http://${address}:${activePort}/cloud-play/`);
  }

  function publicRequest(entry) {
    return {
      id: entry.id,
      device: entry.device,
      ip: entry.ip,
      status: entry.status,
      createdAt: entry.createdAt,
      expiresAt: entry.expiresAt,
    };
  }

  function publicSession(token, entry) {
    return {
      id: entry.id,
      device: entry.device,
      createdAt: entry.createdAt,
      lastSeenAt: entry.lastSeenAt,
      expiresAt: entry.expiresAt,
      tokenHint: token.slice(0, 8),
    };
  }

  function status({ includeCode = true } = {}) {
    purge();
    return {
      enabled: state.enabled,
      port: state.boundPort,
      urls: urls(),
      startedAt: state.startedAt,
      code: includeCode ? state.code : null,
      codeExpiresAt: includeCode && state.code ? state.codeExpiresAt : null,
      pending: state.enabled ? [...state.requests.values()].filter((entry) => entry.status === 'pending').map(publicRequest) : [],
      sessions: state.enabled ? [...state.sessions.entries()].map(([token, entry]) => publicSession(token, entry)) : [],
      capabilities: {
        screen: state.enabled && captureDevice.available,
        screenReason: state.enabled ? captureDevice.reason : null,
        input: state.enabled && inputDevice.available,
        inputReason: state.enabled ? inputDevice.reason : null,
      },
    };
  }

  function start() {
    if (state.server) return Promise.resolve(status());
    return new Promise((resolve, reject) => {
      const server = createServer((request, response) => {
        const handler = getHandler();
        if (!handler) {
          response.writeHead(503, { 'content-type': 'application/json; charset=utf-8' });
          response.end(JSON.stringify({ error: { code: 'remote_not_ready', message: 'Обработчик ещё не готов.' } }));
          return;
        }
        handler(request, response, { remote: true });
      });
      server.on('error', (error) => {
        state.server = null;
        state.enabled = false;
        reject(remoteError('remote_port_busy', 409, `Не удалось открыть порт ${port}: ${error.code || error.message}`));
      });
      server.listen(port, bindHost, () => {
        state.server = server;
        state.enabled = true;
        state.boundPort = server.address().port;
        state.startedAt = now();
        issueCode();
        resolve(status());
      });
    });
  }

  async function stop() {
    const server = state.server;
    state.enabled = false;
    state.server = null;
    state.boundPort = null;
    state.startedAt = null;
    state.code = null;
    state.codeExpiresAt = 0;
    state.requests.clear();
    state.sessions.clear();
    state.screenCounts.clear();
    state.lastGrab.clear();
    if (server) {
      await new Promise((resolve) => {
        server.close(() => resolve());
        server.closeIdleConnections?.();
        server.closeAllConnections?.();
      });
    }
    return status();
  }

  function createRequest({ code, device, ip }) {
    purge();
    if (!state.enabled) throw remoteError('remote_disabled', 409, 'На компьютере не включён удалённый доступ.');
    const normalized = normalizeCode(code);
    if (!normalized) throw remoteError('invalid_code', 400, 'Код состоит из шести цифр.');
    const stamp = now();
    const attempt = state.attempts.get(ip) || { count: 0, resetAt: stamp + CODE_ATTEMPT_WINDOW_MS };
    if (attempt.resetAt <= stamp) {
      attempt.count = 0;
      attempt.resetAt = stamp + CODE_ATTEMPT_WINDOW_MS;
    }
    attempt.count += 1;
    state.attempts.set(ip, attempt);
    if (attempt.count > MAX_CODE_ATTEMPTS_PER_WINDOW) {
      throw remoteError('too_many_attempts', 429, 'Слишком много попыток. Подожди минуту и посмотри новый код на компьютере.');
    }
    if (!state.code || state.codeExpiresAt <= stamp || !constantTimeMatch(normalized, state.code)) {
      throw remoteError('invalid_code', 403, 'Код неверный или истёк. Посмотри актуальный код на компьютере.');
    }
    const active = [...state.requests.values()].filter((entry) => entry.status === 'pending');
    if (active.length >= MAX_PENDING_REQUESTS) {
      throw remoteError('too_many_requests', 429, 'На компьютере уже несколько запросов. Подтверди или отклони их.');
    }
    const id = randomBytes(12).toString('hex');
    const pollToken = randomBytes(24).toString('hex');
    const entry = {
      id,
      pollToken,
      device: sanitizeDeviceName(device),
      ip,
      createdAt: stamp,
      expiresAt: stamp + PAIR_REQUEST_TTL_MS,
      status: 'pending',
      sessionToken: null,
    };
    state.requests.set(id, entry);
    return { id, pollToken, expiresAt: entry.expiresAt };
  }

  function requestStatus({ id, pollToken }) {
    purge();
    const entry = state.requests.get(String(id || ''));
    if (!entry || !pollToken || !constantTimeMatch(entry.pollToken, pollToken)) {
      throw remoteError('request_not_found', 404, 'Запрос на подключение не найден или истёк.');
    }
    if (!state.enabled) throw remoteError('remote_disabled', 409, 'Удалённый доступ на компьютере выключен.');
    return { id: entry.id, status: entry.status, device: entry.device, expiresAt: entry.expiresAt };
  }

  function approve(id) {
    purge();
    const entry = state.requests.get(String(id || ''));
    if (!entry) throw remoteError('request_not_found', 404, 'Запрос уже истёк.');
    if (entry.status !== 'pending') throw remoteError('request_closed', 409, 'Запрос уже обработан.');
    if (state.sessions.size >= MAX_SESSIONS) {
      throw remoteError('too_many_sessions', 409, 'Уже подключено максимальное число устройств. Заверши одну из сессий.');
    }
    const token = randomBytes(32).toString('hex');
    const stamp = now();
    state.sessions.set(token, {
      id: entry.id,
      device: entry.device,
      ip: entry.ip,
      createdAt: stamp,
      lastSeenAt: stamp,
      expiresAt: stamp + SESSION_TTL_MS,
    });
    entry.status = 'approved';
    entry.sessionToken = token;
    return { token, session: publicSession(token, state.sessions.get(token)) };
  }

  function deny(id) {
    purge();
    const entry = state.requests.get(String(id || ''));
    if (!entry) throw remoteError('request_not_found', 404, 'Запрос уже истёк.');
    if (entry.status === 'pending') entry.status = 'denied';
    return { id: entry.id, status: entry.status };
  }

  function sessionForToken(token) {
    purge();
    if (!token) return null;
    const entry = state.sessions.get(String(token));
    if (!entry) return null;
    if (entry.expiresAt <= now()) {
      state.sessions.delete(String(token));
      return null;
    }
    entry.lastSeenAt = now();
    return { token: String(token), ...entry };
  }

  /** Exchanges a one-time poll token for the session cookie after approval. */
  function claimSession({ id, pollToken }) {
    purge();
    const entry = state.requests.get(String(id || ''));
    if (!entry || !pollToken || !constantTimeMatch(entry.pollToken, pollToken)) {
      throw remoteError('request_not_found', 404, 'Запрос на подключение не найден.');
    }
    if (entry.status !== 'approved' || !entry.sessionToken) {
      throw remoteError('not_approved', 409, 'Компьютер ещё не подтвердил подключение.');
    }
    const session = sessionForToken(entry.sessionToken);
    if (!session) throw remoteError('session_expired', 401, 'Сессия истекла. Подключись заново.');
    state.requests.delete(entry.id);
    return session;
  }

  function endSession(token) {
    const id = String(token || '');
    const existed = state.sessions.delete(id);
    state.screenCounts.delete(id);
    state.lastGrab.delete(id);
    return { ended: existed };
  }

  function endAllSessions() {
    const count = state.sessions.size;
    state.sessions.clear();
    state.screenCounts.clear();
    state.lastGrab.clear();
    return { ended: count };
  }

  function revokeRequest(id, status = 'denied') {
    const entry = state.requests.get(String(id || ''));
    if (entry && entry.status === 'pending') entry.status = status;
  }

  async function grabScreen(token) {
    const session = sessionForToken(token);
    if (!session) throw remoteError('session_required', 401, 'Подключи телефон к компьютеру заново.');
    if (!captureDevice.available) throw remoteError('capture_unsupported', 501, captureDevice.reason || 'Захват экрана недоступен.');
    const stamp = now();
    if (stamp - (state.lastGrab.get(token) || 0) < SCREEN_GRAB_MIN_INTERVAL_MS) {
      throw remoteError('slow_down', 429, 'Слишком частая отправка кадров.');
    }
    const used = state.screenCounts.get(token) || 0;
    if (used >= MAX_SCREEN_GRABS_PER_SESSION) {
      throw remoteError('frame_budget_exhausted', 429, 'Лимит кадров на сессию исчерпан. Подключись заново.');
    }
    state.lastGrab.set(token, stamp);
    state.screenCounts.set(token, used + 1);
    return captureDevice.grab();
  }

  async function sendKey(token, action) {
    if (!sessionForToken(token)) throw remoteError('session_required', 401, 'Подключи телефон к компьютеру заново.');
    if (!REMOTE_KEY_ACTIONS.has(String(action))) throw remoteError('unsupported_action', 400, 'Такое действие не разрешено.');
    return inputDevice.key(String(action));
  }

  async function sendClick(token, x, y) {
    if (!sessionForToken(token)) throw remoteError('session_required', 401, 'Подключи телефон к компьютеру заново.');
    return inputDevice.click(x, y);
  }

  async function launchSteam(token, target) {
    if (!sessionForToken(token)) throw remoteError('session_required', 401, 'Подключи телефон к компьютеру заново.');
    const value = String(target || '');
    let uri;
    if (value === 'bigpicture') uri = 'steam://open/bigpicture';
    else if (/^\d{1,10}$/.test(value)) uri = `steam://rungameid/${value}`;
    else throw remoteError('invalid_target', 400, 'Разрешён только запуск Steam Big Picture или AppID игры.');
    return inputDevice.open(uri);
  }

  return {
    state,
    start,
    stop,
    status,
    issueCode,
    createRequest,
    requestStatus,
    approve,
    deny,
    claimSession,
    sessionForToken,
    endSession,
    endAllSessions,
    revokeRequest,
    grabScreen,
    sendKey,
    sendClick,
    launchSteam,
    get code() { purge(); return state.code; },
  };
}
