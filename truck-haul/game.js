(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const canvas = $('road'), ctx = canvas.getContext('2d', { alpha: false });
  const storeKey = 'dalnoboy-save-v1';
  const citySets = [
    ['Санкт-Петербург','Новгород','Тверь','Москва','Владимир','Ярославль','Кострома','Вологда','Череповец','Псков'],
    ['Нижний Новгород','Казань','Чебоксары','Ижевск','Ульяновск','Самара','Саранск','Киров','Пермь','Уфа'],
    ['Волгоград','Саратов','Астрахань','Элиста','Ростов-на-Дону','Краснодар','Ставрополь','Воронеж','Белгород','Курск'],
    ['Екатеринбург','Тюмень','Челябинск','Омск','Новосибирск','Томск','Барнаул','Курган','Сургут','Кемерово'],
    ['Мурманск','Архангельск','Петрозаводск','Сыктывкар','Ухта','Котлас','Апатиты','Кандалакша','Кировск','Онега']
  ];
  const regions = ['Северо-Запад','Поволжье','Юг','Урал и Сибирь','Север'];
  const cargoes = [
    ['Сборные продукты',5,11],['Пиломатериалы',10,20],['Стальной прокат',17,27],['Охлаждённые продукты',8,16],['Медицинское оборудование',4,12],['Строительная техника',15,25],['Бытовая техника',7,17],['Зерно в биг-бэгах',12,22],['Мебель',5,14],['Промышленный насос',9,19],['Автозапчасти',4,12],['Упакованное стекло',10,21],['Электроника',3,10],['Цемент',15,24],['Текстиль',5,14],['Садовая техника',6,15],['Бумажные рулоны',10,18],['Рыбная продукция',7,15],['Трубы ПНД',12,20],['Солнечные панели',6,16],['Сельхозтехника',16,25],['Кофе и чай',4,12],['Кабельные барабаны',13,24],['Пластиковая тара',5,13],['Фармацевтика',4,11]
  ];
  const weatherTypes = ['ЯСНО','ПЕРЕМЕННАЯ ОБЛАЧНОСТЬ','ДОЖДЬ','ТУМАН','МОКРЫЙ СНЕГ'];
  const defaults = { money:24000, fuel:420, oil:100, temp:82, condition:100, engine:100, brakes:100, suspension:100, tires:100, fatigue:0, odometer:0, completed:0, reputation:0, region:0, jobs:[], active:null, currentSpeed:0, x:0, day:1, minute:500, traffic:[], cruise:false };
  let saved = loadSave();
  let state = {...defaults,...saved};
  if (!Array.isArray(state.jobs) || !state.jobs.length) state.jobs = makeJobs(250);
  if (!Array.isArray(state.traffic)) state.traffic=[];
  state.currentSpeed=0; state.cruise=false;
  let keys = new Set(), paused=false, modalRegion=0, toastTimer=0, lastFrame=0, routeBend=0, spawnTimer=0;
  let weather=weatherTypes[Math.floor(Math.random()*weatherTypes.length)], weatherClock=0;
  let canvasW=800,canvasH=450,dpr=1;

  function rng(seed){ let n=seed>>>0; return ()=>{n=(n*1664525+1013904223)>>>0;return n/4294967296;}; }
  function makeJobs(count,start=1){
    const rand=rng(41022+start*997), out=[];
    for(let i=0;i<count;i++){
      const region=Math.floor(rand()*regions.length), cities=citySets[region];
      let from=Math.floor(rand()*cities.length), to=Math.floor(rand()*cities.length);
      if(to===from)to=(to+1+Math.floor(rand()*(cities.length-1)))%cities.length;
      const cargo=cargoes[Math.floor(rand()*cargoes.length)], distance=Math.round((70+rand()*360)/5)*5;
      const fragile=cargo[0].includes('стекло')||cargo[0].includes('Электроника')||cargo[0].includes('Фарма');
      const urgent=rand()<.16, refrigerated=cargo[0].includes('продукт')||cargo[0].includes('Фарма');
      const load=+(cargo[1]+rand()*(cargo[2]-cargo[1])).toFixed(1);
      const reward=Math.round((distance*(45+rand()*15)+load*210+(urgent?8500:0)+(fragile?4200:0))/100)*100;
      out.push({id:start+i,region,from:cities[from],to:cities[to],cargo:cargo[0],distance,load,reward,urgent,fragile,refrigerated,deadline:Math.round(distance/(urgent?88:58)+rand()*1.2),status:'available'});
    }
    return out;
  }
  function loadSave(){try{return JSON.parse(localStorage.getItem(storeKey)||'{}')}catch{return {}}}
  function save(){try{localStorage.setItem(storeKey,JSON.stringify({...state,traffic:[]}));$('save-indicator').textContent='● ПРОГРЕСС СОХРАНЁН';setTimeout(()=>$('save-indicator').textContent='● АВТОСОХРАНЕНИЕ',1800)}catch{}}
  function money(v){return Math.round(v).toLocaleString('ru-RU')+' ₽'}
  function clamp(n,a,b){return Math.max(a,Math.min(b,n))}
  function toast(text){const el=$('event-toast');el.textContent=text;el.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove('show'),2600)}
  function fitCanvas(){const r=canvas.getBoundingClientRect();dpr=Math.min(devicePixelRatio||1,1.5);canvasW=r.width;canvasH=r.height;canvas.width=Math.round(r.width*dpr);canvas.height=Math.round(r.height*dpr);ctx.setTransform(dpr,0,0,dpr,0,0)}
  new ResizeObserver(fitCanvas).observe(canvas);

  function updateUI(){
    $('speed').textContent=Math.round(state.currentSpeed);
    $('gear').textContent=state.currentSpeed<1?'N':state.currentSpeed<28?'2':state.currentSpeed<52?'4':state.currentSpeed<78?'6':state.currentSpeed<100?'8':'10';
    $('cruise-label').textContent=state.cruise?'КРУИЗ ВКЛ.':'КРУИЗ ВЫКЛ.';
    $('fuel-value').textContent=Math.round(state.fuel)+' л';$('fuel-bar').style.width=clamp(state.fuel/420*100,0,100)+'%';
    $('oil-value').textContent=Math.round(state.oil)+'%';$('oil-bar').style.width=clamp(state.oil,0,100)+'%';
    $('temp-value').textContent=Math.round(state.temp)+' °C';$('temp-bar').style.width=clamp((state.temp-30)/100*100,0,100)+'%';
    $('damage-value').textContent=Math.round(state.condition)+'%';$('damage-bar').style.width=clamp(state.condition,0,100)+'%';
    $('odometer').textContent=Math.floor(state.odometer).toLocaleString('ru-RU')+' км';$('fatigue').textContent=Math.round(state.fatigue)+'%';$('money').textContent=money(state.money);
    const a=state.active;
    $('job-status').textContent=a?'В РЕЙСЕ':'В ГАРАЖЕ';
    $('from-city').textContent=a?a.from:'—';$('to-city').textContent=a?a.to:'—';$('cargo-label').textContent=a?a.cargo:'Нет активного заказа';
    $('deadline-label').textContent=a?(a.deadline+' ч игрового времени'):'—';
    $('route-label').textContent=a?`${a.from} → ${a.to}`:'Гараж · ожидает рейс';
    $('remaining').textContent=a?`Осталось ${Math.max(0,a.distance-a.progress).toFixed(1)} км`:'Выбери груз, чтобы выехать';
    $('distance-label').textContent=a?`${Math.floor(a.progress/a.distance*100)}%`:'—';
    $('route-progress-bar').style.width=a?clamp(a.progress/a.distance*100,0,100)+'%':'0%';
    $('next-sign').innerHTML=a?`${a.regionName||regions[a.region]}<br><b>${a.to.toUpperCase()}</b>`:'ДИСПЕТЧЕРСКАЯ<br><b>ВЫБЕРИ ЗАКАЗ</b>';
    $('repair-cost').textContent=`− ${money(Math.ceil((100-state.condition)*120+(100-state.engine)*220+(100-state.brakes)*100+(100-state.suspension)*130+(100-state.tires)*90))}`;$('fuel-cost').textContent=`− ${money(Math.ceil((420-state.fuel)*62))}`;
    const hh=String(Math.floor(state.minute/60)%24).padStart(2,'0'),mm=String(Math.floor(state.minute%60)).padStart(2,'0');$('clock-label').textContent=`ДЕНЬ ${state.day} · ${hh}:${mm}`;
    $('rest-btn').disabled=state.active!==null;
  }

  function openModal(title,sub,content,eyebrow='ДИСПЕТЧЕРСКАЯ'){$('modal-title').textContent=title;$('modal-sub').textContent=sub;$('modal-content').innerHTML=content;$('modal-eyebrow').textContent=eyebrow;$('modal-backdrop').classList.remove('hidden')}
  function closeModal(){$('modal-backdrop').classList.add('hidden')}
  function showJobs(){
    if(state.active){toast('Сначала заверши текущий рейс');return}
    const remaining=state.jobs.filter(j=>j.status==='available').length;
    if(!remaining){state.jobs.push(...makeJobs(250,state.completed+251));save()}
    modalRegion=state.region;
    const tabs=`<div class="region-tabs">${regions.map((r,i)=>`<button data-region="${i}" class="${i===modalRegion?'active':''}">${r}</button>`).join('')}</div>`;
    openModal(`Доступные заказы · ${state.jobs.filter(j=>j.status==='available').length}`,`${state.completed} доставлено · репутация ${state.reputation} · 250 уникальных предложений в каталоге`,tabs+'<div class="job-list" id="job-list"></div>');
    renderJobList();
  }
  function renderJobList(){
    const list=$('job-list');if(!list)return;
    const available=state.jobs.filter(j=>j.status==='available'&&j.region===modalRegion).slice(0,20);
    list.innerHTML=available.length?available.map(j=>`<article class="job-card"><div><h3>${j.from} <span style="color:#9cac80">→</span> ${j.to}</h3><div class="job-meta">${j.distance} км · ${j.load.toFixed(1)} т · ориентир ${j.deadline} ч · район: ${regions[j.region]}</div><div class="job-tags"><span>${j.cargo}</span>${j.urgent?'<span>СРОЧНО</span>':''}${j.fragile?'<span>ХРУПКИЙ ГРУЗ</span>':''}${j.refrigerated?'<span>ТЕМПЕРАТУРНЫЙ РЕЖИМ</span>':''}</div></div><div><div class="job-reward">${money(j.reward)}</div><button data-accept="${j.id}">ВЗЯТЬ ГРУЗ</button></div></article>`).join(''):'<div class="empty-state">В этом регионе предложений пока нет.<br>Посмотри другие регионы или закончи рейсы — появятся новые.</div>';
  }
  function acceptJob(id){
    const job=state.jobs.find(j=>j.id===id);if(!job||state.active)return;
    job.status='active';job.progress=0;job.brokenCargo=0;job.regionName=regions[job.region];state.active=job;state.region=job.region;state.minute+=10;closeModal();toast(`Заказ принят: ${job.cargo}, ${job.distance} км`);save();updateUI();
  }
  function service(type){if(state.active){toast('Техобслуживание доступно только в гараже');return}
    const info={oil:{cost:1200,fn:()=>state.oil=100,label:'Масло заменено'},coolant:{cost:850,fn:()=>state.temp=82,label:'Охлаждающая жидкость обновлена'},repair:{cost:Math.ceil((100-state.condition)*120+(100-state.engine)*220+(100-state.brakes)*100+(100-state.suspension)*130+(100-state.tires)*90),fn:()=>{state.condition=state.engine=state.brakes=state.suspension=state.tires=100},label:'Тягач отремонтирован'},fuel:{cost:Math.ceil((420-state.fuel)*62),fn:()=>state.fuel=420,label:'Бак заправлен'}}[type];
    if(!info)return;if(info.cost===0){toast('Обслуживание не требуется');return}if(state.money<info.cost){toast('Недостаточно средств');return}state.money-=info.cost;info.fn();save();updateUI();toast(info.label);
  }

  function startGame(){
    if(!state.active)return;
    if(state.fuel<3){toast('Почти пустой бак — вернись в гараж или заправься');return}
    if(state.fatigue>=100){toast('Слишком сильная усталость. Остановись на стоянке и отдохни');return}
    if(state.condition<10){toast('Тягач не заводится. Нужен ремонт в гараже');return}
    toast('Рейс начат — аккуратнее на дороге');
  }
  function rest(){if(state.active){toast('Во время рейса найди стоянку (пробел — тормоз)');return}if(state.money<500){toast('Не хватает денег на стоянку');return}state.money-=500;state.fatigue=0;state.minute+=480;state.day+=Math.floor(state.minute/1440);state.minute%=1440;state.temp=82;save();updateUI();toast('Отдых 8 часов. Можно снова в путь.')}
  function finishJob(){const j=state.active;if(!j)return;const damagePenalty=Math.round(j.brokenCargo*j.reward*.36), late=state.minute>j.startMinute+j.deadline*60;let pay=Math.max(0,j.reward-damagePenalty-(late?Math.round(j.reward*.2):0));
    if(j.fragile&&j.brokenCargo>0)pay=Math.max(0,pay-Math.round(j.reward*.16));state.money+=pay;state.completed++;state.reputation=clamp(state.reputation+(late?-1:2),0,100);j.status='completed';state.active=null;state.currentSpeed=0;state.minute+=15;
    toast(late?`Доставка завершена с опозданием · ${money(pay)}`:`Доставка принята · заработано ${money(pay)}`);save();updateUI();
  }

  function tick(dt){if(paused||document.hidden)return;
    const a=state.active;
    const steer=(keys.has('ArrowLeft')||keys.has('a')||keys.has('A')?-1:0)+(keys.has('ArrowRight')||keys.has('d')||keys.has('D')?1:0);
    const throttle=keys.has('ArrowUp')||keys.has('w')||keys.has('W')||(state.cruise&&state.currentSpeed<82);
    const braking=keys.has('ArrowDown')||keys.has('s')||keys.has('S');
    const handbrake=keys.has(' ');
    const maxSpeed=Math.min(state.engine,state.tires)<35?55:120;
    if(throttle&&!handbrake&&state.fuel>0&&state.fatigue<100)state.currentSpeed+=28*dt*(state.engine/100)*(.5+state.suspension/200);
    else if(state.cruise&&!braking)state.currentSpeed+=Math.sign(82-state.currentSpeed)*Math.min(Math.abs(82-state.currentSpeed),12*dt);
    else state.currentSpeed-= (braking||handbrake?75*(.35+state.brakes/100*.65):13)*dt;
    state.currentSpeed=clamp(state.currentSpeed,0,maxSpeed);
    state.x=clamp(state.x+steer*dt*(.72+state.currentSpeed/100),-1.25,1.25);
    if(a&&state.currentSpeed>0){
      const km=state.currentSpeed/3.6*dt*50;
      a.progress+=km;state.odometer+=km;state.minute+=dt*50;
      state.fuel=Math.max(0,state.fuel-km*(.27+a.load*.002));
      state.oil=Math.max(0,state.oil-dt*(.0011+state.currentSpeed*.000015));
      state.temp+=(throttle?.026:-.014)*dt*(state.condition<30?1.5:1);state.temp=clamp(state.temp,70,132);
      state.fatigue=clamp(state.fatigue+dt*.11,0,100);
      if(state.temp>105){state.condition=Math.max(0,state.condition-dt*.12);state.engine=Math.max(5,state.engine-dt*.18);if(Math.random()<dt*.015)toast('Перегрев! Снизь скорость и проверь охлаждение')}
      if(state.oil<8){state.condition=Math.max(0,state.condition-dt*.16);state.engine=Math.max(5,state.engine-dt*.25);if(Math.random()<dt*.02)toast('Критический уровень масла — двигатель изнашивается')}
      if(state.fuel<=0){state.currentSpeed=Math.max(0,state.currentSpeed-dt*24);if(Math.random()<dt*.1)toast('Топливо закончилось — двигатель заглох')}
      if(state.currentSpeed>110){state.money=Math.max(0,state.money-dt*5);}
      a.startMinute ??= state.minute;
    }
    if(Math.abs(state.x)>1.12&&state.currentSpeed>24){state.condition=Math.max(0,state.condition-dt*2.5);state.tires=Math.max(0,state.tires-dt*.65);state.suspension=Math.max(0,state.suspension-dt*.45);if(Math.random()<dt*.35)toast('Съезд с полосы! Вернись на дорогу')}
    for(const car of state.traffic){car.rel-=(state.currentSpeed-car.speed)/3.6*dt;car.phase+=dt;}
    state.traffic=state.traffic.filter(c=>c.rel>-80&&c.rel<900);
    spawnTimer-=dt;if(spawnTimer<=0&&state.active){spawnTraffic();spawnTimer=1.2+Math.random()*2.7}
    for(const car of state.traffic){if(!car.hit&&Math.abs(car.rel)<8&&Math.abs(car.lane-state.x*1.2)<.53&&state.currentSpeed>8){car.hit=true;const impact=clamp(state.currentSpeed-car.speed+20,18,95);state.condition=Math.max(0,state.condition-impact*.14);state.engine=Math.max(5,state.engine-impact*.065);state.brakes=Math.max(0,state.brakes-impact*.04);state.suspension=Math.max(0,state.suspension-impact*.075);state.tires=Math.max(0,state.tires-impact*.055);state.currentSpeed*=.48;state.money=Math.max(0,state.money-impact*95);if(a)a.brokenCargo+=impact*.055;toast(`СТОЛКНОВЕНИЕ · кузов ${Math.round(impact*.14)}% · проверь узлы тягача`);}}
    if(a&&a.progress>=a.distance)finishJob();
    weatherClock+=dt;if(weatherClock>120){weatherClock=0;weather=weatherTypes[Math.floor(Math.random()*weatherTypes.length)]}
    $('weather-label').textContent=weather;
    routeBend+=dt*.09;
  }
  function spawnTraffic(){const choices=[-1,0,1],lane=choices[Math.floor(Math.random()*choices.length)];state.traffic.push({rel:180+Math.random()*620,lane,speed:45+Math.random()*68,type:Math.random()<.2?'truck':Math.random()<.12?'bus':'car',color:['#d46d49','#68939a','#c7c3a5','#7b8d67','#d3d6d0','#8899c7'][Math.floor(Math.random()*6)],phase:Math.random()*8,hit:false})}

  function draw(){
    const w=canvasW,h=canvasH;if(!w||!h)return;const horizon=h*.40, roadWidth=w*.92, center=w*.5+Math.sin(routeBend)*w*.045;
    const sky=ctx.createLinearGradient(0,0,0,horizon+10);sky.addColorStop(0,weather==='ТУМАН'?'#9caead':'#6f9aaa');sky.addColorStop(.72,weather==='ЯСНО'?'#bad1d0':'#bdc8c1');sky.addColorStop(1,'#e2d9ba');ctx.fillStyle=sky;ctx.fillRect(0,0,w,horizon+5);
    // distant hills and low-detail roadside forest
    ctx.fillStyle='#526c5d';ctx.beginPath();ctx.moveTo(0,horizon+8);for(let x=0;x<=w+10;x+=Math.max(12,w/40)){const y=horizon-13+Math.sin(x*.012+routeBend)*13+Math.sin(x*.031)*7;ctx.lineTo(x,y)}ctx.lineTo(w,horizon+18);ctx.closePath();ctx.fill();
    ctx.fillStyle='#657b5b';ctx.fillRect(0,horizon+10,w,h-horizon);
    const segments=34;
    for(let i=0;i<segments;i++){const p=i/segments,p2=(i+1)/segments;const y1=horizon+Math.pow(p,1.72)*(h-horizon),y2=horizon+Math.pow(p2,1.72)*(h-horizon);const half1=18+Math.pow(p,1.4)*roadWidth*.5,half2=18+Math.pow(p2,1.4)*roadWidth*.5;const c1=center+Math.sin(routeBend+p*1.9)*p*p*w*.12,c2=center+Math.sin(routeBend+p2*1.9)*p2*p2*w*.12;
      ctx.fillStyle=(i%2?'#71815b':'#77875f');ctx.fillRect(0,y1,w,y2-y1+1);
      ctx.fillStyle=(i%2?'#4c5551':'#505958');ctx.beginPath();ctx.moveTo(c1-half1,y1);ctx.lineTo(c1+half1,y1);ctx.lineTo(c2+half2,y2);ctx.lineTo(c2-half2,y2);ctx.closePath();ctx.fill();
      // road edge stripes
      const edgeW=1+p2*3;ctx.fillStyle='#d4d2c2';for(const sign of [-1,1]){ctx.beginPath();ctx.moveTo(c1+sign*(half1-edgeW),y1);ctx.lineTo(c1+sign*half1,y1);ctx.lineTo(c2+sign*half2,y2);ctx.lineTo(c2+sign*(half2-edgeW),y2);ctx.closePath();ctx.fill()}
      if(Math.floor(p*54)%2===0){ctx.fillStyle='#ded9b5';for(const lane of [-1,1]){const lineW=1+p2*3,x1=c1+lane*half1*.333,x2=c2+lane*half2*.333;ctx.fillRect(x1-lineW/2,y1,lineW,Math.max(1,y2-y1))}}
      if(i%3===0&&i>4){for(const side of [-1,1]){const tx=c2+side*(half2+10+p2*55),ty=y2;drawTree(tx,ty,p2)}}
    }
    // horizon fog and weather overlay
    if(weather==='ТУМАН'){const fog=ctx.createLinearGradient(0,horizon-20,0,h*.85);fog.addColorStop(0,'#d7ddd5b8');fog.addColorStop(1,'#d7ddd500');ctx.fillStyle=fog;ctx.fillRect(0,horizon-20,w,h*.85-horizon)}
    if(weather==='ДОЖДЬ'||weather==='МОКРЫЙ СНЕГ'){ctx.strokeStyle=weather==='ДОЖДЬ'?'#e1eff078':'#f5f5e8a0';ctx.lineWidth=1;for(let i=0;i<80;i++){const x=((i*91+performance.now()*.12)%w),y=((i*47+performance.now()*.4)%(h*.62));ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x-4,y+10);ctx.stroke()}}
    drawTraffic(w,h,horizon,center,roadWidth);
    // truck hood and windshield frame
    const hood=ctx.createLinearGradient(0,h*.79,0,h);hood.addColorStop(0,'#283332');hood.addColorStop(.5,'#141b1b');hood.addColorStop(1,'#090e0f');ctx.fillStyle=hood;ctx.beginPath();ctx.moveTo(0,h*.82);ctx.lineTo(w*.25,h*.75);ctx.lineTo(w*.75,h*.75);ctx.lineTo(w,h*.82);ctx.lineTo(w,h);ctx.lineTo(0,h);ctx.fill();
    ctx.strokeStyle='#65716b';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(w*.03,h*.82);ctx.lineTo(w*.26,h*.75);ctx.lineTo(w*.74,h*.75);ctx.lineTo(w*.97,h*.82);ctx.stroke();
    // hood center detail
    ctx.fillStyle='#b2c68d';ctx.fillRect(w*.492,h*.81,w*.016,h*.018);ctx.fillStyle='#293432';ctx.fillRect(w*.495,h*.814,w*.01,h*.01);
    if(state.x<-.75||state.x>.75){ctx.fillStyle='#f07859';ctx.font='700 11px sans-serif';ctx.textAlign='center';ctx.fillText('ВОЗВРАТ НА ПОЛОСУ',w/2,h*.70)}
  }
  function drawTree(x,y,p){if(x<0||x>canvasW||y>canvasH*.52)return;const s=3+p*18;ctx.fillStyle='#334b3e';ctx.fillRect(x-s*.09,y-s*.2,s*.18,s*.52);ctx.fillStyle=(Math.floor(x+y)%2?'#405d45':'#4b6749');ctx.beginPath();ctx.moveTo(x,y-s);ctx.lineTo(x-s*.58,y-s*.05);ctx.lineTo(x+s*.58,y-s*.05);ctx.closePath();ctx.fill();ctx.beginPath();ctx.moveTo(x,y-s*.7);ctx.lineTo(x-s*.48,y+s*.16);ctx.lineTo(x+s*.48,y+s*.16);ctx.closePath();ctx.fill()}
  function drawTraffic(w,h,horizon,center,roadWidth){
    for(const c of state.traffic){const z=clamp(1-c.rel/900,.04,.94);const perspective=Math.pow(z,1.6);const y=horizon+perspective*(h-horizon)*.86;const half=14+perspective*roadWidth*.5;const cx=center+Math.sin(routeBend+z*1.9)*z*z*w*.12+c.lane*half*.33-state.x*half*.17;const size=clamp(2+perspective*38,2,43);if(y>h*.78)continue;
      ctx.save();ctx.translate(cx,y);ctx.scale(size/36,size/36);ctx.fillStyle='#202627';ctx.fillRect(-15,-24,30,24);ctx.fillStyle=c.color;ctx.beginPath();ctx.moveTo(-13,-8);ctx.lineTo(-10,-24);ctx.lineTo(9,-24);ctx.lineTo(14,-8);ctx.lineTo(15,0);ctx.lineTo(-15,0);ctx.closePath();ctx.fill();ctx.fillStyle='#94b4b5';ctx.fillRect(-8,-21,16,8);ctx.fillStyle='#f3e3ad';ctx.fillRect(-12,-5,4,3);ctx.fillRect(8,-5,4,3);ctx.fillStyle='#161b1c';ctx.fillRect(-14,-2,6,4);ctx.fillRect(8,-2,6,4);ctx.restore();
    }
  }

  function frame(t){const dt=Math.min(.05,(t-lastFrame)/1000||0);lastFrame=t;tick(dt);draw();updateUI();requestAnimationFrame(frame)}
  document.addEventListener('keydown',e=>{if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' '].includes(e.key))e.preventDefault();keys.add(e.key);if(e.key==='Escape'){if(!$('modal-backdrop').classList.contains('hidden'))closeModal();else{paused=!paused;$('pause-cover').classList.toggle('hidden',!paused)}}if(e.key==='c'||e.key==='C'){state.cruise=!state.cruise;toast(state.cruise?'Круиз-контроль: 82 км/ч':'Круиз-контроль выключен')}if(e.key==='Enter'&&state.active)startGame()});document.addEventListener('keyup',e=>keys.delete(e.key));document.querySelectorAll('[data-touch]').forEach(button=>{const down=e=>{e.preventDefault();keys.add(button.dataset.touch);button.setPointerCapture?.(e.pointerId)};const up=e=>{e.preventDefault();keys.delete(button.dataset.touch)};button.addEventListener('pointerdown',down);button.addEventListener('pointerup',up);button.addEventListener('pointercancel',up);button.addEventListener('lostpointercapture',up);button.addEventListener('contextmenu',e=>e.preventDefault())});window.addEventListener('blur',()=>keys.clear());
  $('jobs-btn').addEventListener('click',showJobs);$('rest-btn').addEventListener('click',rest);$('help-btn').addEventListener('click',()=>openModal('Управление и правила','Коротко о системах тягача и дороге.',`<div class="help-grid"><div><b>W / ↑</b><span>Газ · набирай скорость постепенно</span></div><div><b>S / ↓</b><span>Тормоз · пробел для ручника</span></div><div><b>A D / ← →</b><span>Положение в полосе · избегай машин</span></div><div><b>C</b><span>Круиз-контроль, целевая скорость 82 км/ч</span></div></div><div class="notice">Техсистемы работают непрерывно в рейсе: масло постепенно стареет, температура зависит от нагрузки, повреждения ухудшают динамику. Удары повреждают и груз. Съезд с дороги, перегруз и превышение скорости имеют последствия. Остановись в гараже между заказами для ремонта, заправки, замены масла и охлаждающей жидкости. Прогресс сохраняется в этом браузере.</div>`,'ПАМЯТКА'));
  $('garage-btn').addEventListener('click',()=>{if(state.active){toast('Сначала доставь текущий груз');return}openModal('Гараж и прогресс','Автопарк и состояние перевозчика.',`<div class="notice"><b>«Север-6» · 6×4</b><br>Доставлено: ${state.completed} · репутация: ${state.reputation}/100<br>Пробег: ${Math.floor(state.odometer).toLocaleString('ru-RU')} км · заказов в каталоге: ${state.jobs.length}<br><br>Узлы: двигатель ${Math.round(state.engine)}% · тормоза ${Math.round(state.brakes)}% · подвеска ${Math.round(state.suspension)}% · шины ${Math.round(state.tires)}%.<br>Тягач создан специально для игры. Габариты, двигатель и системы условны — это не точная копия реального автомобиля. Доступно ${state.jobs.filter(j=>j.status==='available').length} заказов.</div><button class="modal-action" id="career-btn">К КОНТРАКТАМ</button><button class="modal-action" id="reset-btn" style="margin-left:7px;background:#3c2d2a;color:#f4b6a9">СБРОСИТЬ ПРОГРЕСС</button>`,'АВТОПАРК')});
  document.addEventListener('click',e=>{const reg=e.target.closest('[data-region]');if(reg){modalRegion=+reg.dataset.region;document.querySelectorAll('.region-tabs button').forEach(b=>b.classList.toggle('active',+b.dataset.region===modalRegion));renderJobList()}const accept=e.target.closest('[data-accept]');if(accept)acceptJob(+accept.dataset.accept);if(e.target.id==='career-btn'){closeModal();showJobs()}if(e.target.id==='reset-btn'&&confirm('Удалить сохранение, баланс и все результаты?')){localStorage.removeItem(storeKey);location.reload()}});
  document.querySelectorAll('[data-service]').forEach(b=>b.addEventListener('click',()=>service(b.dataset.service)));
  $('modal-close').addEventListener('click',closeModal);$('modal-backdrop').addEventListener('click',e=>{if(e.target===$('modal-backdrop'))closeModal()});
  canvas.addEventListener('pointerdown',()=>{if(state.active&&!paused){canvas.focus();startGame()}});
  fitCanvas();updateUI();requestAnimationFrame(frame);
})();
