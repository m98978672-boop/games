import { createHash, randomBytes } from 'node:crypto';
import { execFile, spawn } from 'node:child_process';
import { mkdir, mkdtemp, readFile, rename, rm, writeFile } from 'node:fs/promises';
import net from 'node:net';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);
const APP_DIR = path.dirname(fileURLToPath(import.meta.url));
const SERVER_FILE = path.join(APP_DIR, 'server.mjs');
const API_ROOT = 'https://api.github.com/repos/m98978672-boop/games';
const UPDATE_MANIFEST_PATH = 'portable-update-manifest.json';
const LOCAL_VERSION_PATH = 'manifest.webmanifest';
const DEFAULT_PORT = 4174;
const CHECK_INTERVAL_MS = 15 * 60 * 1000;
const SESSION_TTL_SECONDS = 30 * 24 * 60 * 60;
const MAX_UPDATE_FILE_BYTES = 12 * 1024 * 1024;
const MAX_UPDATE_TOTAL_BYTES = 48 * 1024 * 1024;

function parseVersion(value) {
  if (typeof value !== 'string') return null;
  const match = value.trim().match(/^(\d+)\.(\d+)\.(\d+)$/);
  if (!match) return null;
  const parts = match.slice(1).map(Number);
  return parts.every(Number.isSafeInteger) ? parts : null;
}

function compareVersions(left, right) {
  const a = parseVersion(left);
  const b = parseVersion(right);
  if (!a || !b) return null;
  for (let index = 0; index < 3; index += 1) {
    if (a[index] !== b[index]) return a[index] > b[index] ? 1 : -1;
  }
  return 0;
}

function validateRelativePath(relativePath) {
  if (typeof relativePath !== 'string' || !relativePath || relativePath.includes('\\') || relativePath.startsWith('/')) {
    throw new Error('Update manifest contains an unsafe path.');
  }
  const parts = relativePath.split('/');
  if (parts.some((part) => !part || part === '.' || part === '..' || part.startsWith('.'))) {
    throw new Error('Update manifest contains an unsafe path.');
  }
  const resolved = path.resolve(APP_DIR, ...parts);
  if (!resolved.startsWith(`${APP_DIR}${path.sep}`)) throw new Error('Update path escaped the application folder.');
  return { relativePath, parts, resolved };
}

function gitBlobSha(bytes) {
  return createHash('sha1').update(`blob ${bytes.length}\0`).update(bytes).digest('hex');
}

async function getGithubFile(relativePath, ref) {
  const safePath = validateRelativePath(relativePath).relativePath;
  const encodedPath = safePath.split('/').map(encodeURIComponent).join('/');
  const url = `${API_ROOT}/contents/cloud-play/${encodedPath}?ref=${encodeURIComponent(ref)}`;
  const response = await fetch(url, {
    headers: {
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'User-Agent': 'PLAYBRIDGE-Portable-Updater',
    },
    credentials: 'omit',
    signal: AbortSignal.timeout(15_000),
    redirect: 'error',
  });
  if (!response.ok) throw new Error(`GitHub file request returned ${response.status}.`);
  const item = await response.json();
  if (item.type !== 'file' || item.encoding !== 'base64' || typeof item.content !== 'string') {
    throw new Error(`GitHub did not return a regular file: ${safePath}`);
  }
  const bytes = Buffer.from(item.content.replace(/\s/g, ''), 'base64');
  if (bytes.length > MAX_UPDATE_FILE_BYTES || bytes.length !== item.size || gitBlobSha(bytes) !== item.sha) {
    throw new Error(`GitHub file integrity/size check failed: ${safePath}`);
  }
  return { path: safePath, bytes, sha: item.sha };
}

async function getAppVersionFromFile(filePath) {
  try {
    const manifest = JSON.parse(await readFile(filePath, 'utf8'));
    return parseVersion(manifest?.version) ? manifest.version : null;
  } catch {
    return null;
  }
}

async function installFilesAtomically(files) {
  const staging = await mkdtemp(path.join(APP_DIR, '.playbridge-update-'));
  const applied = [];
  try {
    for (const item of files) {
      const target = validateRelativePath(item.path);
      const staged = path.join(staging, ...target.parts);
      await mkdir(path.dirname(staged), { recursive: true });
      await writeFile(staged, item.bytes, { mode: 0o600 });
    }

    for (const item of files) {
      const target = validateRelativePath(item.path);
      const staged = path.join(staging, ...target.parts);
      const backup = path.join(staging, 'backup', ...target.parts);
      await mkdir(path.dirname(target.resolved), { recursive: true });
      let hadOriginal = false;
      try {
        await mkdir(path.dirname(backup), { recursive: true });
        await rename(target.resolved, backup);
        hadOriginal = true;
      } catch (error) {
        if (error.code !== 'ENOENT') throw error;
      }
      try {
        await rename(staged, target.resolved);
      } catch (error) {
        if (hadOriginal) await rename(backup, target.resolved).catch(() => {});
        throw error;
      }
      applied.push({ target: target.resolved, backup, hadOriginal });
    }
  } catch (error) {
    for (const item of applied.reverse()) {
      await rm(item.target, { force: true }).catch(() => {});
      if (item.hadOriginal) await rename(item.backup, item.target).catch(() => {});
    }
    throw error;
  } finally {
    await rm(staging, { recursive: true, force: true }).catch(() => {});
  }
}

async function updateFromGithub(beforeInstall = null) {
  const localVersion = await getAppVersionFromFile(path.join(APP_DIR, LOCAL_VERSION_PATH));
  const commitResponse = await fetch(`${API_ROOT}/commits/main`, {
    headers: {
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'User-Agent': 'PLAYBRIDGE-Portable-Updater',
    },
    signal: AbortSignal.timeout(15_000),
    redirect: 'error',
  });
  if (!commitResponse.ok) throw new Error(`GitHub main commit request returned ${commitResponse.status}.`);
  const commit = await commitResponse.json();
  if (!/^[a-f0-9]{40}$/i.test(commit.sha || '')) throw new Error('GitHub returned an invalid main commit SHA.');
  const ref = commit.sha;
  const remoteManifestFile = await getGithubFile(LOCAL_VERSION_PATH, ref);
  const remoteManifest = JSON.parse(remoteManifestFile.bytes.toString('utf8'));
  const remoteVersion = parseVersion(remoteManifest?.version) ? remoteManifest.version : null;
  if (!localVersion || !remoteVersion) throw new Error('Local or GitHub manifest has an invalid version.');
  if (compareVersions(remoteVersion, localVersion) <= 0) {
    return { updated: false, localVersion, remoteVersion };
  }

  const updateListFile = await getGithubFile(UPDATE_MANIFEST_PATH, ref);
  const updateList = JSON.parse(updateListFile.bytes.toString('utf8'));
  if (updateList?.schema !== 1 || !Array.isArray(updateList.files) || updateList.files.length < 1 || updateList.files.length > 64) {
    throw new Error('GitHub portable update manifest is invalid.');
  }

  const paths = [...new Set([...updateList.files, LOCAL_VERSION_PATH, UPDATE_MANIFEST_PATH])];
  const files = [remoteManifestFile, updateListFile];
  const seen = new Set(files.map((item) => item.path));
  let totalBytes = files.reduce((sum, item) => sum + item.bytes.length, 0);
  for (const relativePath of paths) {
    const safe = validateRelativePath(relativePath).relativePath;
    if (seen.has(safe)) continue;
    const item = await getGithubFile(safe, ref);
    totalBytes += item.bytes.length;
    if (totalBytes > MAX_UPDATE_TOTAL_BYTES) throw new Error('Portable update is larger than the allowed limit.');
    files.push(item);
    seen.add(safe);
  }

  if (beforeInstall) await beforeInstall();
  await installFilesAtomically(files);
  return { updated: true, localVersion, remoteVersion };
}

function dataDirectory() {
  const root = process.env.LOCALAPPDATA
    || process.env.XDG_DATA_HOME
    || path.join(os.homedir(), '.local', 'share');
  return path.join(root, 'PLAYBRIDGE');
}

async function writePrivateJson(filePath, value) {
  await mkdir(path.dirname(filePath), { recursive: true });
  const tempPath = `${filePath}.${process.pid}.tmp`;
  await writeFile(tempPath, `${JSON.stringify(value, null, 2)}\n`, { encoding: 'utf8', mode: 0o600 });
  await rename(tempPath, filePath);
}

async function readUserSettings(settingsPath) {
  let saved;
  try {
    saved = JSON.parse(await readFile(settingsPath, 'utf8'));
  } catch {
    saved = null;
  }
  const sessionSecret = typeof saved?.sessionSecret === 'string' && saved.sessionSecret.length >= 32
    ? saved.sessionSecret
    : randomBytes(32).toString('hex');
  const steamApiKey = typeof saved?.steamApiKey === 'string' && /^[a-f0-9]{32}$/i.test(saved.steamApiKey)
    ? saved.steamApiKey
    : '';
  const autoLoginEnabled = typeof saved?.autoLoginEnabled === 'boolean' ? saved.autoLoginEnabled : true;
  const settings = { sessionSecret, steamApiKey, autoLoginEnabled };
  await writePrivateJson(settingsPath, settings);
  return settings;
}

async function findAvailablePort() {
  for (let port = DEFAULT_PORT; port < DEFAULT_PORT + 32; port += 1) {
    const available = await new Promise((resolve) => {
      const probe = net.createServer();
      probe.once('error', () => resolve(false));
      probe.listen(port, '127.0.0.1', () => probe.close(() => resolve(true)));
    });
    if (available) return port;
  }
  throw new Error('No free local port found between 4174 and 4205.');
}

async function startServer(port, settingsPath) {
  const settings = await readUserSettings(settingsPath);
  const origin = `http://localhost:${port}`;
  const env = {
    ...process.env,
    HOST: '127.0.0.1',
    PORT: String(port),
    PUBLIC_ORIGIN: origin,
    SESSION_SECRET: settings.sessionSecret,
    SESSION_TTL_SECONDS: String(SESSION_TTL_SECONDS),
    STEAM_WEB_API_KEY: settings.steamApiKey,
    LOCAL_SETUP_MODE: '1',
    LOCAL_AUTO_LOGIN: settings.autoLoginEnabled ? '1' : '0',
    PLAYBRIDGE_CONFIG_FILE: settingsPath,
    NODE_ENV: 'development',
  };
  const child = spawn(process.execPath, [SERVER_FILE], {
    cwd: APP_DIR,
    env,
    stdio: 'inherit',
    windowsHide: false,
  });
  child.once('error', (error) => console.error('Could not start the local server:', error.message));
  await waitForServer(child, origin);
  return { child, origin };
}

async function waitForServer(child, origin) {
  for (let attempt = 0; attempt < 40; attempt += 1) {
    if (child.exitCode !== null) throw new Error('The local server exited before becoming ready.');
    try {
      const response = await fetch(`${origin}/api/status`, { signal: AbortSignal.timeout(1000) });
      if (response.ok) return;
    } catch {
      // The child process may need a moment to bind its local port.
    }
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  throw new Error('The local server did not become ready in time.');
}

async function openBrowser(url) {
  if (process.platform === 'win32') {
    await execFileAsync('rundll32.exe', ['url.dll,FileProtocolHandler', url], { windowsHide: true });
  } else if (process.platform === 'darwin') {
    const child = spawn('open', [url], { detached: true, stdio: 'ignore' });
    child.unref();
  } else {
    const child = spawn('xdg-open', [url], { detached: true, stdio: 'ignore' });
    child.unref();
  }
}

async function stopServer(serverChild) {
  if (!serverChild || serverChild.exitCode !== null) return;
  await new Promise((resolve) => {
    const timeout = setTimeout(() => {
      serverChild.kill('SIGKILL');
      resolve();
    }, 5000);
    timeout.unref();
    serverChild.once('exit', () => {
      clearTimeout(timeout);
      resolve();
    });
    serverChild.kill();
  });
}

async function main() {
  const settingsPath = path.join(dataDirectory(), 'settings.json');
  await mkdir(path.dirname(settingsPath), { recursive: true });
  await readUserSettings(settingsPath);

  try {
    const result = await updateFromGithub();
    console.log(result.updated
      ? `PLAYBRIDGE обновлён: v${result.localVersion} → v${result.remoteVersion}.`
      : `PLAYBRIDGE v${result.localVersion}; GitHub main v${result.remoteVersion}.`);
  } catch (error) {
    console.warn(`Проверка обновления пропущена: ${error.message}`);
  }

  const port = await findAvailablePort();
  let currentServer = await startServer(port, settingsPath);
  const url = `${currentServer.origin}/cloud-play/`;
  console.log(`PLAYBRIDGE открыт локально: ${url}`);
  console.log('Steam-вход работает через официальный OpenID. Пароль Steam в приложение не вводится.');
  console.log('После первого входа приложение будет автоматически восстанавливать сессию до 30 дней.');
  console.log(`Пользовательские настройки хранятся вне папки приложения: ${settingsPath}`);
  try {
    await openBrowser(url);
  } catch (error) {
    console.warn(`Браузер не удалось открыть автоматически; открой ${url}. ${error.message}`);
  }

  let checking = false;
  const checkTimer = setInterval(async () => {
    if (checking) return;
    checking = true;
    let serverStopped = false;
    try {
      const result = await updateFromGithub(async () => {
        console.log('Найдена новая версия; останавливаю локальный сервер для безопасной замены файлов.');
        await stopServer(currentServer.child);
        serverStopped = true;
      });
      if (result.updated) {
        currentServer = await startServer(port, settingsPath);
        serverStopped = false;
        console.log(`PLAYBRIDGE обновлён до v${result.remoteVersion}: ${currentServer.origin}/cloud-play/`);
      }
    } catch (error) {
      if (serverStopped) {
        try {
          currentServer = await startServer(port, settingsPath);
          serverStopped = false;
        } catch (restartError) {
          console.error(`Не удалось снова запустить сервер после обновления: ${restartError.message}`);
        }
      }
      console.warn(`Автопроверка GitHub не удалась; текущая версия продолжает работать: ${error.message}`);
    } finally {
      checking = false;
    }
  }, CHECK_INTERVAL_MS);
  checkTimer.unref();

  let shuttingDown = false;
  const shutdown = async () => {
    if (shuttingDown) return;
    shuttingDown = true;
    clearInterval(checkTimer);
    await stopServer(currentServer.child);
    process.exit(0);
  };
  process.once('SIGINT', shutdown);
  process.once('SIGTERM', shutdown);
}

export { compareVersions, gitBlobSha, parseVersion, validateRelativePath };

const launchedDirectly = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (launchedDirectly) {
  main().catch((error) => {
    console.error(`PLAYBRIDGE не удалось запустить: ${error.message}`);
    process.exitCode = 1;
  });
}
