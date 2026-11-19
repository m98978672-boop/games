const seed = {hello:['привет','здравствуй','добрый день'], status:['как дела','как ты себя чувствуешь','расскажи о себе'], wave:['помаши рукой','покажи жест приветствия'], walk:['иди вперёд','сделай шаг','пройдись'], rest:['стой','остановись','стоп','хватит'], brain:['как устроен мозг','как работают мышцы','что такое спинной мозг'], flirt:['давай пофлиртуем','можно лёгкий флирт']};
const replies={hello:'Привет. Я ИИнга. Могу поговорить или показать движение.',status:'Я на связи. Хочешь поговорить или посмотреть, как работает мой двигательный контур?',wave:'Машу правой рукой.',walk:'Делаю несколько шагов на месте.',rest:'Останавливаюсь.',brain:'Я выбираю действие, а двигательный контур подбирает усилия для суставов. Подробная схема — ниже.',flirt:'Ты умеешь заинтересовать. Продолжим разговор?'};
export const intents=Object.keys(seed);
const words=s=>s.toLowerCase().replaceAll('ё','е').match(/[\p{L}\p{N}]+/gu)||[];
export function createBrain(examples=[]){
 const samples=Object.entries(seed).flatMap(([intent,list])=>list.map(text=>({intent,text})));
 for(const x of examples.slice(-100)) if(intents.includes(x?.intent)&&typeof x.text==='string'&&x.text.length<=200) samples.push(x);
 const vectors=samples.map(({text,intent})=>({intent,tokens:new Set(words(text))}));
 return {talk(text){const tokens=new Set(words(text));let best=0,intent=null,tie=false;
 // Stop words take precedence over any competing movement request.
 if(['стоп','стой','остановись','хватит'].some(w=>tokens.has(w))) {intent='rest';best=1;} else {
 for(const v of vectors){const overlap=[...tokens].filter(w=>v.tokens.has(w)).length;
 const score=overlap/Math.sqrt(tokens.size*v.tokens.size)||0;
 if(score>best+1e-9){best=score;intent=v.intent;tie=false;} else if(score>0&&Math.abs(score-best)<1e-9&&intent!==v.intent) tie=true;}}
 // Example-based intent classification, not free-form language generation.
 if(best<0.65||tie)return {intent:null,action:null,text:'Не уверена, что поняла. Попробуй «помаши рукой» или «как устроен мозг».'};
 const action=['wave','walk','rest'].includes(intent)?intent:null;
 return {intent,action,text:replies[intent]};}};
}
export function createBody(){const joints=Array.from({length:8},(_,i)=>({angle:[-12,-12,10,10,0,0,0,0][i],speed:0,flex:0,extend:0})); const idle=joints.map(j=>j.angle);let action='rest',elapsed=0;
 return {joints,get action(){return action;},set(next){if(['wave','walk','rest'].includes(next)){action=next;elapsed=0;}},step(dt){elapsed+=dt;if(elapsed>3.5)action='rest'; const target=[...idle],s=Math.sin(elapsed*7);
 if(action==='wave'){target[1]=-76;target[3]=65+25*s;}
 if(action==='walk'){for(let i=0;i<2;i++){const v=s*(i===0?1:-1);target[i]=idle[i]-18*v;target[4+i]=30*v;target[6+i]=Math.max(0,-v)*45;}}
 for(const [i,j] of joints.entries()){
 // Antagonist activation from position error and velocity feedback.
 const drive=Math.max(-1,Math.min(1,(target[i]-j.angle)*0.045-j.speed*0.005));j.flex=Math.max(0,drive);j.extend=Math.max(0,-drive);
 j.speed+=(260*(j.flex-j.extend)-4*j.speed)*dt;j.angle+=j.speed*dt;
 const low=i>=6?0:-100,high=i>=6?95:125;if(j.angle<low||j.angle>high){j.angle=Math.min(high,Math.max(low,j.angle));j.speed=0;}
 }}};
}
