// Реальная загрузка ядра в новом контексте, с тем же localStorage.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const dir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const files = ['vendor/cannon-es.min.js','src/sim/physics.js','src/sim/model.js','src/ai/brain-net.js','src/sim/warehouse.js','src/sim/worker.js','src/config.js','data/brain-data.js','src/save.js','src/dialogue.js','src/game.js'];
const data = new Map();
const storage = {getItem: k => data.has(k) ? data.get(k) : null, setItem: (k,v) => data.set(k,String(v)), removeItem:k=>data.delete(k)};
async function boot() {
  const c = {console, localStorage:storage, setTimeout:()=>0, clearTimeout:()=>{}, document:{getElementById:()=>null}, fetch:()=>Promise.reject(Error('offline'))};
  c.window = c; c.globalThis = c;
  c.GamesEngine = { create: () => ({promise: Promise.resolve({engine:{tools:{}}})}) };
  c.WC = {meshes:{buildAll:()=>({})}, audio:{delivered(){}, drop(){}, shiftEnd(){}, select(){}}};
  vm.createContext(c);
  for (const f of files) vm.runInContext(fs.readFileSync(path.join(dir,f),'utf8'), c, {filename:f});
  await c.WC.game.boot();
  return c;
}
let c = await boot(); let game = c.WC.game;
assert.equal(game.api.resumeStatus,'new');
assert.equal(game.api.shiftMode,'day');
// Журнал ограничен последними 80 событиями даже при большом потоке приказов.
for (let i=0; i<100; i++) game.command(game.api.crew[0].id, 'wait');
assert.equal(game.api.log.length,80);

const lines=[]; game.api.onEvent=(type, payload) => { if (type === 'dialogue') lines.push(payload); };
const first = game.api.crew[0];
assert(game.command(first.id,'wait').ok); assert.match(lines.at(-1).text,/жду/);
lines.length=0; game.teamCommand('auto'); assert.equal(lines.length,1);
lines.length=0; game.teamCommand('store'); assert.equal(lines.length,1); assert.match(lines[0].text,/Не получится/);
assert(game.api.log.some(entry => entry.text.includes(lines[0].text)));
assert.equal(game.setShiftMode('night'),true);
assert.equal(game.setShiftMode('invalid'),false);
assert(game.api.crew.every(w => game.api.envs[w.id].shiftMode === 'night'));
for(let i=0;i<100;i++) game.update(.1);
game.sim.state.stats.score = 1000;
assert(game.hireWorker().ok); assert(game.buyStaff('medic').ok); assert(game.buyStaff('watchman').ok);
let worker = game.api.crew[0];
worker.body.energy = .43; worker.body.injuries.push({type:'muscle',part:'back',severity:.24,at:0,cause:'test'});
game.selectWorker(game.api.crew[3].id);
game.sim.spawnTruck('unload');
const carrying = game.sim.state.orders.find(o => o.status === 'pending');
carrying.mass = 8;
const carrier = game.api.crew[1];
game.sim.claim(carrying.id, carrier.id); game.sim.markCarried(carrying, carrier.id);
carrier.state.orderId = carrying.id; carrier.state.carryingId = carrying.id; carrier.state.state = 'toDrop';
const driver = game.api.crew[3];
driver.state.onForklift = true; game.sim.state.forklift.rider = driver.id; game.sim.state.forklift.x = driver.pos.x; game.sim.state.forklift.y = driver.pos.y;
game.sim.state.toiletOccupant = game.api.crew[2].id;
game.api.crew[2].state.inToilet = true; game.api.crew[2].state.state = 'toilet';
const order = game.sim.spawnOrder();
assert(order); game.sim.drop(order,.2, -6, 2); game.sim.stepPhysics(.1);
const originalPriority=order.priority, originalDeadline=order.deadline, originalScore=game.sim.state.stats.score;
assert(game.setOrderPriority(order.id,true).ok); assert.equal(order.dispatchPriority,true);
assert.equal(order.priority,originalPriority); assert.equal(order.deadline,originalDeadline); assert.equal(game.sim.state.stats.score,originalScore);
assert(!game.setOrderPriority(carrying.id,true).ok); assert(!game.setOrderPriority('no-such-order',true).ok);
assert(!game.setOrderPriority(order.id,'yes').ok);
assert(game.setOrderPriority(order.id,false).ok); assert.equal(order.dispatchPriority,false);
assert(game.setOrderPriority(order.id,true).ok);
assert(game.sim.claim(order.id, driver.id)); driver.state.orderId = order.id; driver.state.state = 'toPick'; driver.state.mode = 'manual';
assert(order.physics, 'груз ещё движется перед сохранением');
// A live articulated ragdoll should survive reload, not just its display pose.
worker.state.state = 'down'; worker.body.collapsed = true; worker.state.timers.down = 10;
game.sim.beginRagdoll(worker.state); game.sim.stepPhysics(.1);
game.setPaused(true); game.setSpeed(2);
game.api.dialogueState.pending = {speaker:game.api.crew[1].id,listener:game.api.crew[2].id,topic:'greeting',at:game.sim.state.time+2.5};
const pausedDialogue = JSON.stringify(game.api.dialogueState);
lines.length=0; for(let i=0;i<40;i++) game.update(.1);
assert.equal(JSON.stringify(game.api.dialogueState),pausedDialogue); assert.equal(lines.length,0);
const snap = game.captureCheckpoint();
assert(c.WC.save.save(game));
const raw = data.get(c.WC.save.CHECKPOINT_KEY);
assert(raw && data.has(c.WC.save.CHECKPOINT_KEY));
c = await boot(); game = c.WC.game;
assert.equal(game.api.resumeStatus,'restored');
assert.deepEqual(JSON.parse(JSON.stringify(game.api.log.slice(0,-1))), JSON.parse(JSON.stringify(snap.log.slice(-79))));
assert.match(game.api.log.at(-1).text, /Смена восстановлена/);
assert.equal(game.api.shiftMode,'night');
assert.deepEqual(JSON.parse(JSON.stringify(game.api.dialogueState)), JSON.parse(JSON.stringify(snap.dialogueState)));
assert(game.api.crew.every(w => game.api.envs[w.id].shiftMode === 'night'));
assert.equal(game.api.crew.length,4); assert.equal(game.api.staff.length,2);
assert.equal(game.api.activeWorkerId,snap.activeWorkerId);
assert.equal(game.state.paused,true); assert.equal(game.state.speed,2);
assert.equal(game.sim.state.time,snap.warehouse.state.time);
assert.equal(game.sim.state.orders.length,snap.warehouse.state.orders.length);
assert.equal(game.api.crew[0].body.energy,.43);
assert.equal(game.api.crew[0].body.injuries[0].severity,.24);
assert.equal(game.api.crew[0].state.body,game.api.crew[0].body);
assert.equal(game.sim.state.orders.find(o => o.id === order.id).dispatchPriority,true);
assert.equal(game.api.crew[1].state.carryingId,carrying.id);
assert.equal(game.sim.state.orders.find(o=>o.id === carrying.id).carrier, game.api.crew[1].id);
assert.equal(game.sim.state.forklift.rider, game.api.crew[3].id);
assert.equal(game.sim.state.toiletOccupant, game.api.crew[2].id);
assert.deepEqual(JSON.parse(JSON.stringify(game.captureCheckpoint().warehouse.physics)),JSON.parse(JSON.stringify(snap.warehouse.physics)));
assert.deepEqual(JSON.parse(JSON.stringify(game.api.envs[game.api.crew[0].id].brain)),JSON.parse(JSON.stringify(snap.crew[0].brain)));
assert.equal(game.api.envs[game.api.crew[0].id].rng.getState(),snap.crew[0].rng);
game.setPaused(false); game.update(.1);
const restoredCargo = game.sim.state.orders.find(o => o.id === order.id);
assert(restoredCargo.physics && restoredCargo.status === 'claimed' && !game.api.crew[3].state.carryingId,
  'после восстановления работник не подхватывает движущийся груз');
for(let i=0;i<29;i++) game.update(.1);
assert(game.sim.state.time > snap.warehouse.state.time);
assert(game.api.crew[0].state.ragdoll.pelvis);
// После завершения смены перезагрузка сохраняет финальное состояние, а рестарт создаёт новую.
let cancelled=0; c.WC.voice={cancel(){cancelled++;}};
game.endShift(); assert.equal(cancelled,1); assert(!game.setOrderPriority(order.id,false).ok);
c = await boot(); game = c.WC.game;
assert.equal(game.api.resumeStatus,'restored'); assert.equal(game.state.shiftEnded,true);
game.restart(); assert.equal(game.state.shiftEnded,false); assert.equal(game.sim.state.time,0);

// Возврат после отъезда фуры переживает перезагрузку и не телепортирует груз.
let returning = game.sim.spawnOrder(); returning.mass = 8;
let returner = game.api.crew[0];
assert(game.sim.claim(returning.id,returner.id)); assert(game.sim.markCarried(returning,returner.id));
game.sim.store(returning,returner.id);
let lateTruck = game.sim.spawnTruck('load');
assert(game.sim.claim(returning.id,returner.id)); assert(game.sim.markCarried(returning,returner.id));
returner.state.orderId = returning.id; returner.state.carryingId = returning.id; returner.state.state = 'toDrop'; returner.state.mode = 'manual';
returner.state.pos.x = -6; returner.state.pos.y = -6;
game.sim.departTruck(lateTruck, 'тест');
assert.equal(returning.direction,'return'); game.setPaused(true); assert(c.WC.save.save(game));
const returnId = returning.id;
c = await boot(); game = c.WC.game; returning = game.sim.state.orders.find(o => o.id === returnId); returner = game.api.crew[0];
assert.equal(game.api.resumeStatus,'restored'); assert.equal(returning.direction,'return');
assert.equal(returning.carrier,returner.id); assert.equal(returner.state.carryingId,returnId);
game.setPaused(false); game.update(.1);
assert.equal(returning.status,'carried'); assert.equal(returner.state.carryingId,returnId);
game.restart();

// Ошибка записи не повреждает предыдущий снимок.
const previous = data.get(c.WC.save.CHECKPOINT_KEY);
const setItem = storage.setItem; storage.setItem = (key, value) => { if (key.endsWith('v2')) throw Error('quota'); setItem(key,value); };
assert.equal(c.WC.save.save(game),false); assert.equal(data.get(c.WC.save.CHECKPOINT_KEY),previous);
storage.setItem = setItem;
// Если квота заполнена, чтение всё ещё работает: снимок надо восстановить,
// а не начинать новую смену из-за неудачной тестовой записи.
data.set(c.WC.save.CHECKPOINT_KEY, raw);
storage.setItem = () => { throw Error('quota'); };
c = await boot(); assert.equal(c.WC.game.api.resumeStatus,'restored');
assert.equal(c.WC.game.api.crew[0].body.energy,.43);
assert.equal(c.WC.save.save(c.WC.game),false);
assert.equal(data.get(c.WC.save.CHECKPOINT_KEY),raw);
storage.setItem = setItem;
// Отказ чтения v2 защищает запись и после восстановления доступа: нельзя
// незаметно заменить снимок новой сменой. Явный рестарт снимает защиту.
const getItem = storage.getItem;
storage.getItem = key => { if (key.endsWith('v2')) throw Error('access denied'); return getItem(key); };
c = await boot(); assert.equal(c.WC.game.api.resumeStatus,'failed');
assert.equal(c.WC.save.protectionReason(),'unavailable');
storage.getItem = getItem;
assert.equal(c.WC.save.save(c.WC.game),false); assert.equal(data.get(c.WC.save.CHECKPOINT_KEY),raw);
c.WC.game.restart(); assert.equal(c.WC.save.isProtected(),false);
assert.notEqual(data.get(c.WC.save.CHECKPOINT_KEY),raw);
// Пустое, но существующее значение — повреждение, а не отсутствие сохранения.
data.set(c.WC.save.CHECKPOINT_KEY,'');
c = await boot(); assert.equal(c.WC.game.api.resumeStatus,'failed');
assert.equal(c.WC.save.protectionReason(),'damaged');
assert.equal(c.WC.save.save(c.WC.game),false); assert.equal(data.get(c.WC.save.CHECKPOINT_KEY),'');
// v2 старого формата без поля режима должен оставаться доступным.
const oldV2 = JSON.parse(raw); delete oldV2.checkpoint.shiftMode; delete oldV2.checkpoint.dialogueState;
oldV2.checkpoint.warehouse.state.orders.forEach(o => delete o.dispatchPriority);
data.set(c.WC.save.CHECKPOINT_KEY,JSON.stringify(oldV2));
c = await boot(); assert.equal(c.WC.game.api.resumeStatus,'restored'); assert.equal(c.WC.game.api.shiftMode,'day');
// Неизвестный режим блокирует перезапись.
oldV2.checkpoint.shiftMode = 'broken';
data.set(c.WC.save.CHECKPOINT_KEY,JSON.stringify(oldV2));
const badMode = data.get(c.WC.save.CHECKPOINT_KEY);
c = await boot(); assert.equal(c.WC.game.api.resumeStatus,'failed');
assert.equal(c.WC.save.save(c.WC.game),false); assert.equal(data.get(c.WC.save.CHECKPOINT_KEY),badMode);
const invalidPriority = JSON.parse(raw); invalidPriority.checkpoint.warehouse.state.orders[0].dispatchPriority = 'true';
data.set(c.WC.save.CHECKPOINT_KEY,JSON.stringify(invalidPriority));
c = await boot(); assert.equal(c.WC.game.api.resumeStatus,'failed'); assert.equal(c.WC.save.save(c.WC.game),false);
// A truncated or semantically damaged snapshot remains untouched, even on autosave.
data.set(c.WC.save.CHECKPOINT_KEY,'{broken');
c = await boot(); game = c.WC.game;
assert.equal(game.api.resumeStatus,'failed'); assert.equal(c.WC.save.save(game),false);
assert.equal(data.get(c.WC.save.CHECKPOINT_KEY),'{broken');
const damaged = JSON.parse(raw); damaged.checkpoint.crew[0].state.body.muscles = null;
data.set(c.WC.save.CHECKPOINT_KEY,JSON.stringify(damaged));
const broken = data.get(c.WC.save.CHECKPOINT_KEY);
c = await boot(); assert.equal(c.WC.game.api.resumeStatus,'failed');
assert.equal(c.WC.save.save(c.WC.game),false); assert.equal(data.get(c.WC.save.CHECKPOINT_KEY),broken);
// Legacy data are kept and imported; v2 does not overwrite v1.
data.clear(); data.set('warehouse-crew-save-v1',JSON.stringify({version:1,bestScore:321,bestDelivered:9,shifts:4}));
c = await boot(); assert.equal(c.WC.game.api.best.score,321); assert.equal(c.WC.game.api.shiftsPlayed,4);
assert(c.WC.save.save(c.WC.game)); assert.equal(JSON.parse(data.get('warehouse-crew-save-v1')).bestScore,321);
console.log('✓ Перезагрузка смены: бригада, мозги, физика, склад, персонал, v1 и защита повреждённого файла');
