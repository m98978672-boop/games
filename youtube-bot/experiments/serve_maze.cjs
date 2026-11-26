const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '../../collection/lost-in-the-maze-3d');
const prefix = '/collection/lost-in-the-maze-3d/';
const types = {'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.png':'image/png'};
http.createServer((req, res) => {
  const pathname = new URL(req.url, 'http://localhost').pathname;
  const file = pathname.startsWith(prefix) ? pathname.slice(prefix.length) || 'index.html' : '';
  const type = types[path.extname(file)];
  if (!type || !/^[a-z0-9_.-]+$/i.test(file)) return res.writeHead(404).end();
  fs.readFile(path.join(root, file), (err, data) => {
    if (err) return res.writeHead(404).end();
    res.writeHead(200, {'Content-Type':type}).end(data);
  });
}).listen(8765, '127.0.0.1');
