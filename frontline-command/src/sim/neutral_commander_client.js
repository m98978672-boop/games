import {commanderSnapshot,applyCommanderPair} from './neutral_commander.js';
import {CommanderMemory} from './commander_memory.js';
// Runs outside Game.step. Failure, stale results and timeouts affect both sides equally.
export class NeutralCommanderClient {
 constructor(game,{workerFactory=()=>new Worker(new URL('../ai/commander-worker.bundle.js',import.meta.url),{type:'module'}),onStatus=()=>{},knowledge=false,interval=25,inferenceTimeout=120000,loadTimeout=300000,memoryStorage}={}){
  if(!game.aiVsAi)throw Error('AI demonstration only');
  this.game=game;this.workerFactory=workerFactory;this.onStatus=onStatus;this.knowledge=knowledge===true;this.interval=interval;this.inferenceTimeout=inferenceTimeout;this.loadTimeout=loadTimeout;
  this.state='new';this.pending=null;this.nextAt=0;this.round=0;this.timer=null;
  this.memory=new CommanderMemory(game,{storage:memoryStorage});
 }
 start(){
  if(this.state!=='new')return;
  try{this.worker=this.workerFactory();this.worker.onmessage=e=>this.message(e.data);this.worker.onerror=()=>this.fail('Ошибка запуска модели');this.worker.onmessageerror=()=>this.fail('Ошибка обмена с моделью');this.state='loading';this.status('Загрузка модели…');this.timer=setTimeout(()=>this.fail('Превышено время загрузки модели'),this.loadTimeout);this.worker.postMessage(this.knowledge?{type:'init',knowledge:true}:{type:'init'});}
  catch{this.fail('WebGPU или запуск модели недоступен');}
 }
 status(s){this.onStatus(s);}
 syncMemory(){const was=this.memory.persistent;this.memory.poll();if(was&&!this.memory.persistent&&this.state==='ready')this.status('Не удалось сохранить память · она доступна только в текущем бою');}
 message(message){
  if(!message||this.state==='stopped'||this.state==='failed')return;
  if(message.type==='progress'&&this.state==='loading'){const n=Number(message.progress);if(Number.isFinite(n))this.status(`Загрузка модели: ${Math.min(100,Math.max(0,Math.round(n*100)))}%`);return;}
  if(message.type==='error'){this.fail('Модель недоступна или завершилась с ошибкой');return;}
  if(message.type==='ready'&&this.state==='loading'){clearTimeout(this.timer);this.timer=null;this.state='ready';this.status(this.memory.persistent?'Модель готова · память сторон раздельная':'Модель готова · память только на текущий бой');return;}
  if(message.type==='result'&&this.state==='ready'&&this.pending&&message.id===this.pending.id){
   clearTimeout(this.timer);this.timer=null;const p=this.pending;this.pending=null;
   const before=this.game.api.orders.length;
   const result=applyCommanderPair(this.game,p.snapshots,Array.isArray(message.texts)?message.texts:[]);
   if(result.ok)this.memory.recordIssued(p.snapshots,this.game.api.orders.slice(before));
   this.nextAt=this.game.time+this.interval;
   this.status((result.ok?'Локальный помощник · пара решений проверена':'Локальный помощник · пара решений отклонена')+(this.memory.persistent?'':' · память только на текущий бой'));
  }
 }
 tick(){
  const g=this.game;this.syncMemory();if(this.state!=='ready'||this.pending||g.paused||g.warOver||g.time<this.nextAt)return;
  const snapshots=[commanderSnapshot(g,0),commanderSnapshot(g,1)];
  const id=++this.round;this.pending={id,snapshots};
  this.timer=setTimeout(()=>this.fail('Модель отвечает слишком долго'),this.inferenceTimeout);
  // Each prompt receives only its own bounded memory; raw IDs and opposing
  // state remain on the main thread, and the worker resets KV between sides.
  try{this.worker.postMessage({type:'pair',id,first:id%2?0:1,inputs:snapshots.map(s=>this.memory.input(s))});}
  catch{this.fail('Ошибка обмена с моделью');}
 }
 fail(reason){
  if(this.state==='stopped'||this.state==='failed')return;
  this.syncMemory();clearTimeout(this.timer);this.timer=null;this.pending=null;this.state='failed';this.worker?.terminate();this.worker=null;
  this.status(`${reason}. Обе стороны используют штатный ИИ.`);
 }
 stop(){this.syncMemory();clearTimeout(this.timer);this.timer=null;this.pending=null;this.state='stopped';this.worker?.terminate();this.worker=null;}
}
