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
const cv=get('body'),ctx=cv.getContext('2d');let prev,lastReport=-Infinity;const clock=globalThis.GamesEngine.clock({tickHz:120,maxSubsteps:12});
function joint(x,y){ctx.beginPath();ctx.arc(x,y,5,0,Math.PI*2);ctx.fill();}
function limb(x,y,side,a,b,len1,len2){const bend=([angle,len,x,y])=>[x+side*Math.sin(angle*Math.PI/180)*len,y+Math.cos(angle*Math.PI/180)*len];const [u,v]=bend([a,len1,x,y]);const [p,q]=bend([a+b,len2,u,v]);ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(u,v);ctx.lineTo(p,q);ctx.stroke();joint(u,v);joint(p,q);}
function frame(t){const dt=Math.min(.08,(t-(prev??t))/1000);prev=t;clock.advance(dt,step=>body.step(step));
 ctx.clearRect(0,0,360,370);ctx.strokeStyle='#96d3f2';ctx.fillStyle='#d7f3ff';ctx.lineWidth=5;ctx.lineCap='round';ctx.beginPath();ctx.arc(180,70,25,0,Math.PI*2);ctx.stroke();ctx.beginPath();ctx.moveTo(180,96);ctx.lineTo(180,205);ctx.moveTo(144,111);ctx.lineTo(216,111);ctx.moveTo(159,205);ctx.lineTo(201,205);ctx.stroke();
 for(let i=0;i<2;i++){const side=i===0?-1:1,j=body.joints;limb(180+side*36,111,side,-j[i].angle,-j[2+i].angle,49,47);limb(180+side*21,205,side,j[4+i].angle,j[6+i].angle,64,63);}
 if(t-lastReport>=120){lastReport=t;get('state').textContent=`Движение: ${body.action==='rest'?'покой':labels[body.action]}`;const j=body.joints[3];get('muscles').textContent=`Локоть машущей руки: сгибатель ${Math.round(j.flex*100)} %, разгибатель ${Math.round(j.extend*100)} %`;}
 requestAnimationFrame(frame);}
requestAnimationFrame(frame);
