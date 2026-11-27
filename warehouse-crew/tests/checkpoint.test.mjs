// Реальная загрузка ядра в новом контексте, с тем же localStorage.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const dir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const files = ['vendor/cannon-es.min.js','src/sim/physics.js','src/sim/model.js','src/ai/brain-net.js','src/sim/warehouse.js','src/sim/worker.js','src/config.js','data/brain-data.js','src/save.js','src/dialogue.js', 'src/contracts.js','src/challenges.js','src/game.js'];
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
assert(game.acceptContract('intake').ok);
const snap = game.captureCheckpoint();
assert(c.WC.save.save(game));
const raw = data.get(c.WC.save.CHECKPOINT_KEY);
assert(raw && data.has(c.WC.save.CHECKPOINT_KEY));
c = await boot(); game = c.WC.game;
assert.equal(game.api.resumeStatus,'restored');
assert.equal(game.api.contracts.items[0].status, 'active');
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
const oldV2 = JSON.parse(raw); delete oldV2.checkpoint.shiftMode; delete oldV2.checkpoint.dialogueState; delete oldV2.checkpoint.contracts; delete oldV2.checkpoint.challenges;
oldV2.checkpoint.warehouse.state.orders.forEach(o => delete o.dispatchPriority);
data.set(c.WC.save.CHECKPOINT_KEY,JSON.stringify(oldV2));
c = await boot(); assert.equal(c.WC.game.api.resumeStatus,'restored'); assert.equal(c.WC.game.api.shiftMode,'day'); assert.equal(c.WC.game.api.contracts.items[0].status,'available');
const invalidContract = JSON.parse(raw); invalidContract.checkpoint.contracts.items[0].progress = 999;
data.set(c.WC.save.CHECKPOINT_KEY, JSON.stringify(invalidContract));
c = await boot(); assert.equal(c.WC.game.api.resumeStatus,'failed'); assert.equal(c.WC.save.save(c.WC.game),false);
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
data.clear(); c = await boot(); game = c.WC.game;
assert(game.acceptContract('intake').ok);
const actor = game.api.crew[0];
for (let i=0;i<3;i++) {
  const order = game.sim.spawnOrder(); assert(order);
  const before = game.sim.state.stats.score;
  const result = game.sim.store(order, actor.id);
  game.api.envs[actor.id].onDelivered(actor.state, order, result);
  assert.equal(game.sim.state.stats.score - before, result.points + (i === 2 ? 35 : 0));
}
assert.equal(game.summary().contracts[0].status, 'completed');
assert(c.WC.save.save(game)); c = await boot(); game = c.WC.game;
assert.equal(game.api.contracts.items[0].status, 'completed');
assert(!game.acceptContract('intake').ok); assert.equal(game.summary().contracts[0].reward, 35);
game.restart(); assert.equal(game.api.contracts.items[0].status, 'available');
// Ручной вызов выбирает направление, проверяет ограничения и не меняет
// очередь автоматических рейсов. Снимок сразу после вызова восстанавливается.
data.clear(); c = await boot(); game = c.WC.game;
const turn = game.sim.state.truckTurn, rngState = game.sim.rng.getState(), balance = game.sim.state.stats.score;
assert(!game.callTruck('wrong').ok); assert(!game.callTruck('load').ok);
assert.equal(game.sim.rng.getState(), rngState); assert.equal(game.sim.state.stats.score,balance);
assert(game.callTruck('unload').ok); assert(!game.callTruck('unload').ok);
assert.equal(game.sim.state.truckTurn, turn);
c = await boot(); game = c.WC.game;
assert.equal(game.api.resumeStatus,'restored'); assert(game.sim.activeTruck('unload'));
const box = game.sim.ordersOfTruck(game.sim.activeTruck('unload'))[0];
game.sim.store(box,game.api.crew[0].id);
assert(game.callTruck('load').ok); assert(!game.callTruck('load').ok);
assert.equal(game.sim.state.truckTurn, turn);
game.endShift(); const savedEnd = data.get(c.WC.save.CHECKPOINT_KEY);
assert(!game.callTruck('unload').ok); assert(!game.callTruck('load').ok);
assert.equal(data.get(c.WC.save.CHECKPOINT_KEY),savedEnd);
// Полный склад: отказ без изменения ГПСЧ и счёта.
game.restart(); game.sim.state.slots.forEach(slot => { slot.occupied = true; });
const beforeFull = game.sim.rng.getState(); assert(!game.callTruck('unload').ok);
assert.equal(game.sim.rng.getState(),beforeFull);
// Обычная просрочка в руках сохраняется и продолжается после загрузки.
data.clear(); c = await boot(); game = c.WC.game;
assert(game.acceptContract('intake').ok);
game.api.crew.slice(1).forEach(w => game.command(w.id,'wait'));
const carryingActor = game.api.crew[0], ordinary = game.sim.spawnOrder(); ordinary.mass=8;
game.sim.claim(ordinary.id, carryingActor.id); game.sim.markCarried(ordinary, carryingActor.id);
carryingActor.state.mode='manual'; carryingActor.state.orderId=ordinary.id; carryingActor.state.carryingId=ordinary.id; carryingActor.state.state='toDrop';
ordinary.deadline=-36; game.sim.step(.05);
assert.equal(ordinary.direction,'return'); assert(c.WC.save.save(game));
c = await boot(); game = c.WC.game;
assert.equal(game.api.resumeStatus,'restored');
assert.equal(game.sim.state.orders.find(o=>o.id===ordinary.id).direction,'return');
assert.equal(game.api.crew[0].state.carryingId,ordinary.id);
assert.equal(game.sim.state.stats.missed,1);
for(let i=0;i<1600 && game.api.crew[0].state.carryingId;i++) game.update(.05);
assert.equal(game.sim.state.orders.find(o=>o.id===ordinary.id).status,'stored');
assert.equal(game.sim.state.stats.missed,1);
assert.equal(game.api.contracts.items[0].progress,0);
// Досрочная отправка неполного рейса: счёт не меняется, груз в руках
// остаётся у работника и после перезагрузки возвращается в свою ячейку.
data.clear(); c = await boot(); game = c.WC.game;
const person = game.api.crew[0];
const outbound = game.sim.spawnOrder(); outbound.mass = 8; game.sim.store(outbound,person.id);
const lorry = game.callTruck('load').truck;
assert(game.sim.claim(outbound.id, person.id)); game.sim.markCarried(outbound, person.id);
person.state.mode='manual'; person.state.orderId=outbound.id; person.state.carryingId=outbound.id; person.state.state='toDrop';
const balanceBefore = game.sim.state.stats.score, shiftsBefore = game.sim.state.stats.truckShifts;
game.setPaused(true);
const dispatch = game.dispatchTruck(lorry.id);
assert(dispatch.ok); assert.equal(dispatch.done,0); assert.equal(dispatch.total,1);
assert.equal(game.sim.state.stats.score,balanceBefore);
assert.equal(game.sim.state.stats.truckShifts,shiftsBefore+1);
assert.equal(outbound.direction,'return'); assert.equal(outbound.status,'carried');
assert.equal(person.state.carryingId,outbound.id);
assert(!game.dispatchTruck(lorry.id).ok); assert(!game.dispatchTruck('unknown').ok);
assert.equal(game.sim.state.stats.truckShifts,shiftsBefore+1);
c = await boot(); game = c.WC.game;
assert.equal(game.api.resumeStatus,'restored'); assert(game.state.paused);
assert.equal(game.sim.truckById(lorry.id).status,'done');
assert.equal(game.api.crew[0].state.carryingId,outbound.id);
assert.equal(game.sim.state.orders.find(o => o.id===outbound.id).direction,'return');
game.setPaused(false);
for(let i=0;i<2000 && game.api.crew[0].state.carryingId;i++) game.update(.05);
assert.equal(game.sim.state.orders.find(o => o.id===outbound.id).status,'stored');
assert.equal(game.sim.state.stats.score,balanceBefore);
// Активная разгрузочная фура не теряется из истории при большом потоке
// ручных рейсов на другом доке; груз на ней после отъезда остаётся.
game.restart();
const stock = game.sim.spawnOrder(); game.sim.store(stock, game.api.crew[0].id);
const incoming = game.callTruck('unload').truck;
const incomingBox = game.sim.ordersOfTruck(incoming)[0];
for(let i=0;i<9;i++) {
  const loading = game.callTruck('load'); assert(loading.ok);
  assert(game.dispatchTruck(loading.truck.id).ok);
}
assert(game.sim.state.trucks.length <= 6);
assert.equal(game.sim.activeTruck('unload').id,incoming.id);
assert(game.sim.truckById(incoming.id));
assert(game.dispatchTruck(incoming.id).ok);
assert.equal(incomingBox.direction,'in'); assert.equal(incomingBox.status,'pending');
assert(!game.sim.activeTruck('unload'));
game.endShift(); assert(!game.dispatchTruck(incoming.id).ok);
// План отгрузки доступен только для запаса и записывается без ожидания
// таймера автосохранения; после возврата с незавершённого рейса не исчезает.
data.clear(); c = await boot(); game = c.WC.game;
const stocked = game.sim.spawnOrder(); stocked.priority=.01;
assert(!game.setShippingPriority(stocked.id,true).ok);
game.sim.store(stocked,game.api.crew[0].id);
const baseline = game.sim.state.stats.score, deadlineBefore = stocked.deadline;
assert(!game.setShippingPriority(stocked.id,'true').ok);
assert(!game.setShippingPriority('missing',true).ok);
game.setPaused(true); assert(game.setShippingPriority(stocked.id,true).ok);
assert.equal(game.sim.state.stats.score,baseline); assert.equal(stocked.deadline,deadlineBefore);
const markedSave = data.get(c.WC.save.CHECKPOINT_KEY);
c = await boot(); game = c.WC.game;
assert.equal(game.api.resumeStatus,'restored');
assert.equal(game.sim.state.orders.find(o=>o.id===stocked.id).shippingPriority,true);
assert(game.setShippingPriority(stocked.id,false).ok);
assert(!game.sim.state.orders.find(o=>o.id===stocked.id).shippingPriority);
assert(game.setShippingPriority(stocked.id,true).ok);
const markedTruck = game.callTruck('load').truck;
assert(game.sim.ordersOfTruck(markedTruck).some(o=>o.id===stocked.id));
assert(!game.setShippingPriority(stocked.id,false).ok);
assert(game.dispatchTruck(markedTruck.id).ok);
assert.equal(game.sim.state.orders.find(o=>o.id===stocked.id).shippingPriority,true);
c = await boot(); game = c.WC.game;
assert.equal(game.sim.state.orders.find(o=>o.id===stocked.id).shippingPriority,true);
game.endShift(); assert(!game.setShippingPriority(stocked.id,false).ok);
// Отсутствие поля в старом v2 допустимо; некорректное поле защищает снимок.
const oldMark = JSON.parse(markedSave); delete oldMark.checkpoint.warehouse.state.orders[0].shippingPriority;
data.set(c.WC.save.CHECKPOINT_KEY,JSON.stringify(oldMark)); c = await boot(); assert.equal(c.WC.game.api.resumeStatus,'restored');
const badMark = JSON.parse(markedSave); badMark.checkpoint.warehouse.state.orders[0].shippingPriority = 'yes';
const badMarkText = JSON.stringify(badMark); data.set(c.WC.save.CHECKPOINT_KEY,badMarkText);
c = await boot(); assert.equal(c.WC.game.api.resumeStatus,'failed'); assert(!c.WC.save.save(c.WC.game));
assert.equal(data.get(c.WC.save.CHECKPOINT_KEY),badMarkText);
// Текущая ведомость восстанавливается из состояния доков и заказов,
// включая места, отвязанные после передачи другому рейсу или возврата.
data.clear(); c=await boot(); game=c.WC.game; game.setPaused(true);
const receiving = game.callTruck('unload').truck, receivingItems = game.sim.ordersOfTruck(receiving).slice();
game.sim.store(receivingItems[0],game.api.crew[0].id); game.sim.store(receivingItems[1],game.api.crew[0].id);
const shipping = game.callTruck('load').truck;
assert(game.sim.returnToStorage(receivingItems[2]));
assert(c.WC.save.save(game)); c=await boot(); game=c.WC.game;
assert.equal(game.api.resumeStatus,'restored');
const resumedIn = game.sim.truckById(receiving.id), resumedOut = game.sim.truckById(shipping.id);
assert.equal(resumedIn.completedDetached,2); assert.equal(resumedIn.unfulfilled,1);
assert.equal(game.sim.ordersOfTruck(resumedOut).length,2);
assert(game.sim.ordersOfTruck(resumedOut).some(o=>o.id===receivingItems[0].id));
assert(!game.sim.ordersOfTruck(resumedIn).some(o=>o.id===receivingItems[2].id));
// Испытания считают только события после принятия; состояние и награда
// переживают загрузку, а старый v2 без доски остаётся совместимым.
data.clear(); c=await boot(); game=c.WC.game; game.setPaused(true);
assert(game.acceptChallenge('intake-2').ok); assert(game.acceptChallenge('team-2').ok);
assert(!game.acceptChallenge('night-2').ok);
let chWorker=game.api.crew[0]; let chOrder=game.sim.spawnOrder();
let chResult=game.sim.store(chOrder,chWorker.id);
game.api.envs[chWorker.id].onDelivered(chWorker.state,chOrder,chResult);
assert.equal(game.api.challenges.items.find(i=>i.id==='intake-2').progress,1);
assert(c.WC.save.save(game)); let challengeSave=data.get(c.WC.save.CHECKPOINT_KEY);
c=await boot(); game=c.WC.game;
assert.equal(game.api.resumeStatus,'restored');
assert.equal(game.api.challenges.items.find(i=>i.id==='team-2').workers.length,1);
chWorker=game.api.crew[1]; chOrder=game.sim.spawnOrder();
chResult=game.sim.store(chOrder,chWorker.id);
const afterStore=game.sim.state.stats.score;
game.api.envs[chWorker.id].onDelivered(chWorker.state,chOrder,chResult);
assert.equal(game.sim.state.stats.score,afterStore+20+35);
assert.equal(game.summary().challenges.find(i=>i.id==='team-2').status,'completed');
assert(c.WC.save.save(game)); c=await boot(); game=c.WC.game;
assert.equal(game.api.challenges.items.find(i=>i.id==='intake-2').status,'completed');
assert(!game.acceptChallenge('intake-2').ok);
game.restart(); assert.equal(game.api.challenges.items[0].status,'available');
assert(game.acceptChallenge('intake-2').ok); game.endShift();
assert.equal(game.api.challenges.items[0].status,'failed'); assert(!game.acceptChallenge('intake-5').ok);
const oldChallenges=JSON.parse(challengeSave); delete oldChallenges.checkpoint.challenges;
data.set(c.WC.save.CHECKPOINT_KEY,JSON.stringify(oldChallenges)); c=await boot();
assert.equal(c.WC.game.api.resumeStatus,'restored'); assert.equal(c.WC.game.api.challenges.items[0].status,'available');
const badChallenges=JSON.parse(challengeSave); badChallenges.checkpoint.challenges.items[0].progress=999;
const badChallengeText=JSON.stringify(badChallenges); data.set(c.WC.save.CHECKPOINT_KEY,badChallengeText);
c=await boot(); assert.equal(c.WC.game.api.resumeStatus,'failed'); assert(!c.WC.save.save(c.WC.game));
assert.equal(data.get(c.WC.save.CHECKPOINT_KEY),badChallengeText);
// Полный путь: автономная бригада физически доставляет две коробки и
// закрывает испытание через обычный callback игрового цикла.
data.clear(); c=await boot(); game=c.WC.game;
assert(game.acceptChallenge('intake-2').ok); game.teamCommand('auto');
for (let frame=0;frame<2400 && game.api.challenges.items[0].status!=='completed';frame++) game.update(.1);
assert.equal(game.api.challenges.items[0].status,'completed');
assert(game.sim.state.stats.delivered>=2);
assert(game.api.log.some(entry=>entry.text.includes('Испытание «Первый поток» выполнено')));
console.log('✓ Перезагрузка смены: бригада, мозги, физика, склад, персонал, v1 и защита повреждённого файла');
