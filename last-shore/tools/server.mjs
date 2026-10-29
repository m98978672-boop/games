// Небольшой сервер комнаты и статических файлов. Комнаты живут в памяти процесса.
import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { networkInterfaces } from 'node:os';
import { WebSocketServer, WebSocket } from 'ws';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const files = new Map([['/', 'index.html'], ['/index.html', 'index.html'], ['/style.css', 'style.css'],
  ['/bundle.js', 'bundle.js'], ['/assets/menu.jpg', 'assets/menu.jpg']]);
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.jpg': 'image/jpeg' };

export function createServer() {
  const rooms = new Map();
  const httpServer = http.createServer(async (req, res) => {
    let pathname;
    try { pathname = new URL(req.url, 'http://localhost').pathname; } catch { res.writeHead(400).end(); return; }
    const file = files.get(pathname);
    if (!file || !['GET', 'HEAD'].includes(req.method)) { res.writeHead(404).end('Not found'); return; }
    try {
      const data = await readFile(path.join(root, file));
      res.writeHead(200, { 'Content-Type': types[path.extname(file)], 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' });
      res.end(req.method === 'HEAD' ? undefined : data);
    } catch { res.writeHead(404).end('Not found'); }
  });
  const wss = new WebSocketServer({ server: httpServer, path: '/rooms', maxPayload: 2048, perMessageDeflate: false });
  const send = (ws, data) => { if (ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify(data)); };
  const listing = () => [...rooms].map(([code, members]) => ({ code, count: members.size, max: 8 }));
  const broadcast = (members, data, except = null) => { for (const member of members) if (member !== except) send(member, data); };
  function leave(ws) {
    if (!ws.room) return;
    const members = rooms.get(ws.room);
    if (members) {
      members.delete(ws);
      broadcast(members, { type: 'left', id: ws.id });
      if (!members.size) rooms.delete(ws.room);
    }
    ws.room = null;
    ws.lastState = null;
  }
  wss.on('connection', ws => {
    ws.id = randomUUID(); ws.room = null; ws.lastState = null; ws.lastMessage = 0; ws.isAlive = true;
    ws.on('pong', () => { ws.isAlive = true; });
    ws.on('message', raw => {
      let msg; try { msg = JSON.parse(raw.toString()); } catch { return; }
      if (!msg || typeof msg !== 'object') return;
      if (msg.type === 'list') { send(ws, { type: 'rooms', rooms: listing() }); return; }
      if (msg.type === 'join') {
        const code = typeof msg.room === 'string' ? msg.room.trim() : '';
        if (!/^[A-Za-z0-9_-]{1,24}$/.test(code)) { send(ws, { type: 'error', message: 'Код: латинские буквы, цифры, _ или - (до 24 символов)' }); return; }
        const existing = rooms.get(code);
        if (existing && existing.size >= 8) { send(ws, { type: 'error', message: 'Комната заполнена' }); return; }
        leave(ws);
        const members = rooms.get(code) || new Set(); rooms.set(code, members); members.add(ws);
        ws.room = code;
        ws.playerName = typeof msg.name === 'string' ? msg.name.trim().slice(0, 20) || 'Выживший' : 'Выживший';
        send(ws, { type: 'joined', id: ws.id, room: code, players: [...members].filter(m => m !== ws && m.lastState).map(m => ({ id: m.id, name: m.playerName, ...m.lastState })) });
        return;
      }
      if (msg.type === 'state' && ws.room) {
        const now = Date.now(); if (now - ws.lastMessage < 60) return; ws.lastMessage = now;
        if (![msg.x, msg.y, msg.z, msg.yaw].every(Number.isFinite) || Math.abs(msg.x) > 300 || Math.abs(msg.z) > 300 || Math.abs(msg.y) > 300 || Math.abs(msg.yaw) > 1000) return;
        ws.lastState = { x: msg.x, y: msg.y, z: msg.z, yaw: msg.yaw };
        broadcast(rooms.get(ws.room), { type: 'state', id: ws.id, name: ws.playerName, ...ws.lastState }, ws);
      }
    });
    ws.on('close', () => leave(ws));
    ws.on('error', () => {});
  });
  const heartbeat = setInterval(() => { for (const ws of wss.clients) { if (!ws.isAlive) ws.terminate(); else { ws.isAlive = false; ws.ping(); } } }, 30000);
  heartbeat.unref();
  httpServer.on('close', () => { clearInterval(heartbeat); for (const ws of wss.clients) ws.terminate(); wss.close(); });
  return httpServer;
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  const port = Number(process.env.PORT || process.argv[2] || 8080);
  createServer().listen(port, '0.0.0.0', () => {
    console.log(`LAST SHORE: http://localhost:${port}/ · сервер комнат /rooms`);
    for (const entries of Object.values(networkInterfaces())) for (const net of entries || []) {
      if (net.family === 'IPv4' && !net.internal) console.log(`Локальная сеть: http://${net.address}:${port}/`);
    }
  });
}
