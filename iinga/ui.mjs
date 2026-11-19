import {createBrain,createBody,intents} from './brain.mjs';
const get=id=>document.getElementById(id), key='iinga-v01-examples';
let samples=[];try{const saved=JSON.parse(localStorage.getItem(key)||'[]');if(Array.isArray(saved))samples=saved;}catch{}
let brain=createBrain(samples);const body=createBody(), chat=get('chat');
const labels={hello:'Приветствие',status:'Самочувствие',wave:'Помахать',walk:'Шаг на месте',rest:'Стоп',brain:'Об устройстве',flirt:'Лёгкий флирт'};
for(const i of intents)get('intent').add(new Option(labels[i],i));
function line(who,text){const p=document.createElement('p');p.textContent=`${who}: ${text}`;chat.append(p);if(chat.children.length>80)chat.firstChild.remove();chat.scrollTop=chat.scrollHeight;}
line('ИИнга','Привет. Набери «помаши рукой», «сделай шаг» или «как устроен мозг».');
get('talk').onsubmit=e=>{e.preventDefault();const field=get('message'),text=field.value.trim();if(!text)return;const r=brain.talk(text);line('Ты',text);line('ИИнга',r.text);if(r.action)body.set(r.action);field.value='';};
get('stop').onclick=()=>{body.set('rest');line('ИИнга','Останавливаюсь.');};
function save(){brain=createBrain(samples);try{localStorage.setItem(key,JSON.stringify(samples));return true;}catch{return false;}}
get('train').onsubmit=e=>{e.preventDefault();const f=get('example'),text=f.value.trim();if(!/[\p{L}\p{N}]/u.test(text))return;samples=[...samples,{text,intent:get('intent').value}].slice(-100);get('feedback').textContent=save()?'Пример добавлен. Проверь его в чате.':'Пример добавлен только до перезагрузки.';f.value='';};
get('reset').onclick=()=>{samples=[];get('feedback').textContent=save()?'Примеры удалены.':'Примеры сброшены до перезагрузки.';};
let prev,lastReport=-Infinity;const clock=globalThis.GamesEngine.clock({tickHz:120,maxSubsteps:12});
function frame(t){
 const dt=Math.min(.08,(t-(prev??t))/1000);prev=t;clock.advance(dt,step=>body.step(step));
 if(t-lastReport>=140){lastReport=t;get('state').textContent=`Движение: ${body.action==='rest'?'покой':labels[body.action]}`;const j=body.joints[3];get('muscles').textContent=`Локоть двигательной схемы: сгибатель ${Math.round(j.flex*100)} %, разгибатель ${Math.round(j.extend*100)} %`;
 window.dispatchEvent(new CustomEvent('iinga-motion',{detail:{action:body.action,joints:body.joints}}));}
 requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
