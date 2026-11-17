// RatCore Playground — Лёгкий локальный сервер для живой 3D-песочницы (0 зависимостей, биндинг 0.0.0.0:8081)
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const RATCORE_ROOT = path.resolve(__dirname, '..');
const PORT = Number(process.env.PORT || 8081);

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.md': 'text/markdown; charset=utf-8',
};

const server = http.createServer((req, res) => {
  const urlPath = (req.url || '/').split('?')[0];
  if (urlPath === '/' || urlPath === '/index.html') {
    res.writeHead(302, { Location: '/ratcore/playground/index.html' });
    res.end();
    return;
  }

  // Отдаём файлы строго из каталога ratcore/
  const rel = urlPath.startsWith('/ratcore/') ? urlPath.slice('/ratcore/'.length) : urlPath.replace(/^\/+/, '');
  const resolved = path.resolve(RATCORE_ROOT, rel);
  if (!resolved.startsWith(RATCORE_ROOT + path.sep) && resolved !== RATCORE_ROOT) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  let filePath = resolved;
  if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
    filePath = path.join(filePath, 'index.html');
  }
  if (!fs.existsSync(filePath)) {
    res.writeHead(404);
    res.end('Not found');
    return;
  }

  const ext = path.extname(filePath).toLowerCase();
  res.writeHead(200, {
    'Content-Type': MIME[ext] || 'application/octet-stream',
    'Cache-Control': 'no-cache',
  });
  fs.createReadStream(filePath).pipe(res);
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`RatCore Playground server listening on http://0.0.0.0:${PORT}/ratcore/playground/index.html`);
});
