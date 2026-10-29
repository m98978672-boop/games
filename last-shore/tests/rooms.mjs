import assert from 'node:assert/strict';
import { once } from 'node:events';
import { WebSocket } from 'ws';
import { createServer } from '../tools/server.mjs';

const server = createServer();
server.listen(0, '127.0.0.1'); await once(server, 'listening');
const url = `ws://127.0.0.1:${server.address().port}/rooms`;
const open = async () => { const ws = new WebSocket(url); await once(ws, 'open'); return ws; };
const next = ws => new Promise((resolve, reject) => {
  const timer = setTimeout(() => { ws.off('message', onMessage); reject(new Error('message timeout')); }, 3000);
  function onMessage(data) { clearTimeout(timer); resolve(JSON.parse(data)); }
  ws.once('message', onMessage);
});
try {
  const a = await open(); const b = await open(); const c = await open();
  let reply = next(a); a.send(JSON.stringify({ type: 'join', room: 'shore', name: 'A' }));
  assert.equal((await reply).type, 'joined');
  reply = next(b); b.send(JSON.stringify({ type: 'list' }));
  assert.deepEqual((await reply).rooms, [{ code: 'shore', count: 1, max: 8 }]);
  reply = next(b); b.send(JSON.stringify({ type: 'join', room: 'shore', name: 'B' }));
  assert.equal((await reply).type, 'joined');
  reply = next(c); c.send(JSON.stringify({ type: 'join', room: 'other', name: 'C' })); await reply;
  reply = next(b); a.send(JSON.stringify({ type: 'state', x: 1, y: 2, z: 3, yaw: 0.5 }));
  const state = await reply; assert.equal(state.name, 'A'); assert.equal(state.x, 1);
  let leaked = false; c.once('message', () => { leaked = true; });
  await new Promise(r => setTimeout(r, 100)); assert.equal(leaked, false, 'комнаты изолированы');
  reply = next(b); a.close(); assert.equal((await reply).type, 'left');
  b.close(); c.close();
  console.log('ROOMS OK');
} finally { server.close(); }
