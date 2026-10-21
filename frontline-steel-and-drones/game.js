'use strict';
/* ============================================================
   ЛИНИЯ ФРОНТА: Сталь и Дроны — v0.2 (ИИ-командир)
   Canvas 2D top-down strategy. Symmetric arsenal, Blue vs Red.
   ============================================================ */
const W = 1600, H = 900, CITY_W = 118;
const cvs = document.getElementById('game'), ctx = cvs.getContext('2d');
const $ = id => document.getElementById(id);

const rand = (a=1,b) => b===undefined ? Math.random()*a : a+Math.random()*(b-a);
const clamp = (v,a,b) => v<a?a:v>b?b:v;
const dist = (a,b) => Math.hypot(a.x-b.x, a.y-b.y);
const lerp = (a,b,t) => a+(b-a)*t;
function angLerp(a,b,t){ let d=(b-a)%(Math.PI*2); if(d>Math.PI)d-=Math.PI*2; if(d<-Math.PI)d+=Math.PI*2; return a+d*clamp(t,0,1); }
const fmtTime = s => `${String(Math.floor(s/60)).padStart(2,'0')}:${String(Math.floor(s%60)).padStart(2,'0')}`;

/* ---------------- UNIT DEFINITIONS ---------------- */
const DEFS = {
  infantry:{name:'Штурм. группа', icon:'i-infantry', cost:60,  hp:60,  speed:36, range:115, dmg:7,  rof:0.45, radius:13, desc:'Дешёвая пехота, берёт массой', build:0.7},
  btr:     {name:'БТР / автопушка', icon:'i-btr', cost:120, hp:140, speed:66, range:140, dmg:9,  rof:0.22, radius:17, desc:'Быстрый, косит пехоту', build:1.0},
  tank:    {name:'Танк', icon:'i-tank', cost:220, hp:360, speed:40, range:170, dmg:42, rof:2.1, radius:20, desc:'Броня и мощная пушка', build:1.5},
  mlrs:    {name:'РСЗО', icon:'i-mlrs', cost:280, hp:115, speed:32, range:430, dmg:24, rof:7.5, radius:19, desc:'Залп 6 ракет по площади', build:1.8},
  fpv:     {name:'FPV-камикадзе', icon:'i-fpv', cost:90,  hp:20,  speed:155, range:0,  dmg:135, rof:0,   radius:11, desc:'Пикирует в бронетехнику (F — вручную!)', build:0.6, air:true},
  bomber:  {name:'Дрон-бомбардировщик', icon:'i-bomber', cost:140, hp:30, speed:88, range:26, dmg:48, rof:2.4, radius:13, desc:'3 сброса с зависания', build:0.9, air:true},
  pvo:     {name:'ПВО', icon:'i-pvo', cost:260, hp:170, speed:30, range:290, dmg:22, rof:0.85, radius:19, desc:'Сбивает дроны и ракеты', build:1.6},
  reb:     {name:'РЭБ', icon:'i-reb', cost:180, hp:150, speed:38, range:105, dmg:5,  rof:0.6, radius:17, desc:'Глушит дроны в радиусе 140', build:1.2},
};
const ORDER = ['infantry','btr','tank','mlrs','fpv','bomber','pvo','reb'];
const MISSILE = {cost:450, cd:22};
const SIDE_COLOR = {player:'#4da3ff', enemy:'#ff5545'};
const DIFF = [ {aiIncome:10.5, aiAggro:1.35, missileEvery:44}, {aiIncome:13.5, aiAggro:1.0, missileEvery:34}, {aiIncome:17.5, aiAggro:0.8, missileEvery:25} ];
/* Enemy commander brains per difficulty: how fast it re-plans, how much it
   trusts its forecast of the player, target lead, wave size, PVO relocation. */
const AI_BRAIN = [
  {think:1.15, forecast:0.35, lead:0.35, waveValue:560, reposition:20, noise:0.35},
  {think:0.75, forecast:0.65, lead:0.70, waveValue:760, reposition:13, noise:0.18},
  {think:0.45, forecast:0.92, lead:0.95, waveValue:950, reposition:8,  noise:0.07},
];
const AI_LANES = [215, 450, 685]; // top / centre / bottom lane centres

/* ---------------- STATE ---------------- */
let G;
function resetGame(){
  G = {
    started:false, over:false, paused:false, speed:1, time:0,
    money:520, aiMoney:520, income:14,
    city:{player:2000, enemy:2000}, cityMax:2000,
    units:[], projectiles:[], particles:[], floaters:[], craters:[], wrecks:[], warnings:[],
    kills:0, losses:0, shake:0, shopCd:{}, missileCd:0,
    targeting:false, controlled:null, aiT:2.2, aiMissileT:26, alertT:0, cityWarnT:0, uid:1,
    diff: parseInt($('ui-diff').value,10),
    // Enemy commander: phase machine + intel/forecast about the player.
    ai:{
      thinkT:0.4, phase:'buildup', phaseT:0, wave:1, attackLane:1, failedLane:-1, failedLaneUntil:0,
      plan:null, pvoPosts:[], pvoPlanT:0, rally:{x:1170,y:450}, waveStartValue:0, assaultCityHp:2000,
      lastIntelLog:-30, disperse:false,
      intel:{spawns:[], missiles:[], estMoney:520, lastSpawnT:0, forecast:{}, style:'mixed',
             airThreat:0, armorThreat:0, swarmThreat:0, artilleryThreat:0, missileThreat:0, airLaneY:450},
      stats:{waves:0, retreats:0, repositions:0, plannedBuys:0, missiles:0, phases:0},
    },
  };
  ORDER.forEach(k=>G.shopCd[k]=0);
  $('log').innerHTML='';
  log('Штаб на связи. Строй армию, командир!','good');
}
const mouse = {x:W/2, y:H/2};

/* ---------------- AUDIO (procedural, no files) ---------------- */
let AC=null, soundOn=true, noiseBuf=null; const lastSfx={};
function initAudio(){
  if(AC) { AC.resume && AC.resume(); return; }
  try{
    AC = new (window.AudioContext||window.webkitAudioContext)();
    noiseBuf = AC.createBuffer(1, AC.sampleRate*0.6, AC.sampleRate);
    const d = noiseBuf.getChannelData(0); for(let i=0;i<d.length;i++) d[i]=Math.random()*2-1;
  }catch(e){ AC=null; }
}
function sfx(kind, vol=0.15){
  if(!soundOn||!AC) return;
  const now = performance.now(); if(lastSfx[kind] && now-lastSfx[kind]<70) return; lastSfx[kind]=now;
  const src=AC.createBufferSource(); src.buffer=noiseBuf;
  const f=AC.createBiquadFilter(), g=AC.createGain(), t=AC.currentTime;
  let dur=0.12, freq=1200, type='lowpass';
  if(kind==='shot'){dur=0.07;freq=1800;}
  if(kind==='cannon'){dur=0.3;freq=500;vol=0.3;}
  if(kind==='boom'){dur=0.55;freq=220;vol=0.4;}
  if(kind==='launch'){dur=0.4;freq=900;type='bandpass';vol=0.22;}
  if(kind==='aa'){dur=0.18;freq=1400;type='highpass';vol=0.12;}
  f.type=type; f.frequency.setValueAtTime(freq,t); f.frequency.exponentialRampToValueAtTime(Math.max(60,freq*0.35),t+dur);
  g.gain.setValueAtTime(vol,t); g.gain.exponentialRampToValueAtTime(0.001,t+dur);
  src.connect(f); f.connect(g); g.connect(AC.destination); src.start(t); src.stop(t+dur+0.02);
}

/* ---------------- TERRAIN (pre-rendered realistic texture) ---------------- */
let terrain=null, buildings={player:[],enemy:[]};
function makeTerrain(){
  terrain = document.createElement('canvas'); terrain.width=W; terrain.height=H;
  const c = terrain.getContext('2d');
  const grd=c.createLinearGradient(0,0,0,H); grd.addColorStop(0,'#5a6b3c'); grd.addColorStop(0.5,'#67743f'); grd.addColorStop(1,'#55663a');
  c.fillStyle=grd; c.fillRect(0,0,W,H);
  // agricultural fields top/bottom
  for(let i=0;i<14;i++){ const y=i%2? rand(0,120):rand(H-150,H-40); c.fillStyle=`rgba(${140+rand(40)|0},${120+rand(30)|0},60,0.20)`; c.fillRect(rand(150,W-420),y,rand(150,330),rand(40,90)); }
  // dirt patches
  for(let i=0;i<170;i++){ c.fillStyle=`rgba(${105+rand(40)|0},${88+rand(28)|0},${55+rand(20)|0},${rand(0.08,0.3)})`;
    c.beginPath(); c.ellipse(rand(W),rand(H),rand(14,85),rand(8,40),rand(Math.PI),0,7); c.fill(); }
  // grass noise speckle
  for(let i=0;i<11000;i++){ const g=rand(70,150)|0; c.fillStyle=`rgba(${g*0.55|0},${g},${g*0.38|0},${rand(0.15,0.5)})`; c.fillRect(rand(W),rand(H),rand(1,3.4),rand(1,3.4)); }
  // main dirt road (wavy, horizontal)
  const roadY = t => 450 + Math.sin(t*Math.PI*2.2)*36 + Math.sin(t*Math.PI*5.1)*10;
  for(const [w,col] of [[92,'#7d6748'],[76,'#93785a'],[56,'#a08662']]){
    c.strokeStyle=col; c.lineWidth=w; c.beginPath();
    for(let x=0;x<=W;x+=20){ const y=roadY(x/W); x===0?c.moveTo(x,y):c.lineTo(x,y);} c.stroke();
  }
  c.strokeStyle='rgba(60,45,30,0.5)'; c.lineWidth=5; c.setLineDash([16,22]);
  for(const off of [-18,18]){ c.beginPath(); for(let x=0;x<=W;x+=20){ const y=roadY(x/W)+off; x===0?c.moveTo(x,y):c.lineTo(x,y);} c.stroke(); }
  c.setLineDash([]);
  // side roads into cities
  c.strokeStyle='#8d7554'; c.lineWidth=40; c.beginPath(); c.moveTo(60,0); c.lineTo(60,H); c.moveTo(W-60,0); c.lineTo(W-60,H); c.stroke();
  // trenches (zig-zag) centre
  c.strokeStyle='rgba(52,40,26,0.9)'; c.lineWidth=9;
  for(const tx of [690,915]){ c.beginPath(); let y=170; c.moveTo(tx,y); while(y<740){ y+=34; c.lineTo(tx+((y/34)%2?26:-26),y);} c.stroke(); }
  c.strokeStyle='rgba(120,95,60,0.7)'; c.lineWidth=3;
  for(const tx of [678,903]){ c.beginPath(); let y=170; c.moveTo(tx,y); while(y<740){ y+=34; c.lineTo(tx+((y/34)%2?26:-26),y);} c.stroke(); }
  // Scarred no-man's-land in the centre: torn earth, craters, tank tracks,
  // a few anti-tank hedgehogs and dead trees. No buildings outside the cities.
  for(let i=0;i<64;i++){
    const x=rand(635,965), y=rand(105,H-105);
    c.fillStyle=`rgba(${54+rand(42)|0},${43+rand(30)|0},${27+rand(20)|0},${rand(0.10,0.30)})`;
    c.beginPath(); c.ellipse(x,y,rand(18,78),rand(8,34),rand(Math.PI),0,7); c.fill();
  }
  for(let i=0;i<18;i++) drawCrater(c, rand(650,950), rand(125,H-125), rand(11,27));
  // Broken double tank tracks wandering through the centre.
  c.strokeStyle='rgba(48,38,26,0.34)'; c.lineWidth=4; c.setLineDash([13,10]);
  for(const off of [-11,11]){
    c.beginPath();
    for(let x=610;x<=990;x+=20){
      const y=455+Math.sin(x*0.012)*95+Math.sin(x*0.031)*22+off;
      x===610?c.moveTo(x,y):c.lineTo(x,y);
    }
    c.stroke();
  }
  c.setLineDash([]);
  // Small steel hedgehogs, drawn as three crossed bars from above.
  c.strokeStyle='rgba(38,39,36,0.88)'; c.lineWidth=3; c.lineCap='round';
  for(const hx of [735,865]){
    for(let y=205;y<=705;y+=62){
      if(Math.random()<0.18) continue;
      const x=hx+rand(-10,10), yy=y+rand(-9,9), r=rand(6,9), a=rand(Math.PI);
      for(let k=0;k<3;k++){
        const aa=a+k*Math.PI/3;
        c.beginPath(); c.moveTo(x-Math.cos(aa)*r,yy-Math.sin(aa)*r); c.lineTo(x+Math.cos(aa)*r,yy+Math.sin(aa)*r); c.stroke();
      }
    }
  }
  // A few bare, shell-broken trees instead of green canopies in no-man's-land.
  c.strokeStyle='rgba(43,36,28,0.88)'; c.lineWidth=2.4;
  for(let i=0;i<22;i++){
    const x=rand(650,950), y=rand(105,H-105), r=rand(7,15);
    c.fillStyle='rgba(35,29,22,0.72)'; c.beginPath(); c.arc(x,y,2.2,0,7); c.fill();
    for(let k=0;k<4;k++){
      const a=rand(Math.PI*2), bend=rand(-0.6,0.6);
      c.beginPath(); c.moveTo(x,y);
      c.quadraticCurveTo(x+Math.cos(a)*r*0.55,y+Math.sin(a)*r*0.55,x+Math.cos(a+bend)*r,y+Math.sin(a+bend)*r); c.stroke();
    }
  }
  c.lineCap='butt';
  // tree belts
  for(let i=0;i<210;i++){ const x=rand(140,W-140), y=(Math.random()<0.5? rand(40,300):rand(600,860)) + rand(-30,30);
    const r=rand(7,17); c.fillStyle='rgba(0,0,0,0.22)'; c.beginPath(); c.arc(x+3,y+4,r,0,7); c.fill();
    c.fillStyle=`rgb(${38+rand(22)|0},${74+rand(34)|0},${30+rand(18)|0})`; c.beginPath(); c.arc(x,y,r,0,7); c.fill();
    c.fillStyle='rgba(160,190,110,0.35)'; c.beginPath(); c.arc(x-r*0.3,y-r*0.3,r*0.45,0,7); c.fill(); }
  // old craters
  for(let i=0;i<30;i++) drawCrater(c, rand(200,W-200), rand(120,H-120), rand(10,26));
  // city ground
  for(const x0 of [0,W-CITY_W]){ c.fillStyle='#6e6a60'; c.fillRect(x0,0,CITY_W,H);
    for(let i=0;i<900;i++){ c.fillStyle=`rgba(0,0,0,${rand(0.05,0.22)})`; c.fillRect(x0+rand(CITY_W),rand(H),2,2);} }
  // generate city buildings
  buildings={player:[],enemy:[]};
  const mk=(side)=>{ const x0= side==='player'?6:W-CITY_W+6;
    for(let r=0;r<9;r++) for(let col=0;col<2;col++){ if(Math.random()<0.14) continue;
      buildings[side].push({x:x0+col*56+rand(-3,3), y:26+r*96+rand(-5,5), w:rand(38,48), h:rand(56,78), th:rand(0.08,0.92), hue:rand(0,3)|0, seed:rand(100)}); } };
  mk('player'); mk('enemy');
}
function drawCrater(c,x,y,r){
  const g=c.createRadialGradient(x,y,1,x,y,r); g.addColorStop(0,'rgba(28,22,16,0.95)'); g.addColorStop(0.65,'rgba(62,48,32,0.85)'); g.addColorStop(1,'rgba(90,72,48,0)');
  c.fillStyle=g; c.beginPath(); c.ellipse(x,y,r,r*0.78,0,0,7); c.fill();
}

/* ---------------- HUD / LOG ---------------- */
function log(html, cls=''){ const el=$('log'); const d=document.createElement('div'); if(cls)d.className=cls; d.innerHTML=html; el.insertBefore(d, el.firstChild); while(el.children.length>8) el.removeChild(el.lastChild); }
function setAlert(txt,danger=false,t=3){ const a=$('alert'); a.textContent=txt; a.className=danger?'danger':''; G.alertT=t; }
function updateHUD(){
  $('ui-money').textContent=Math.floor(G.money);
  $('ui-income').textContent='+'+G.income+'/с';
  $('ui-kills').textContent=G.kills;
  $('ui-time').textContent=fmtTime(G.time);
  for(const s of ['player','enemy']){ const f=clamp(G.city[s]/G.cityMax,0,1); $('hp-'+s).style.width=(f*100)+'%'; $('hp-'+s+'-txt').textContent=Math.max(0,Math.ceil(G.city[s]))+' / '+G.cityMax; }
  document.querySelectorAll('.card').forEach(card=>{
    const k=card.dataset.unit;
    if(k==='missile'){ card.classList.toggle('cant', G.money<MISSILE.cost||G.missileCd>0); card.classList.toggle('armed',G.targeting); card.querySelector('.cd').style.width=(G.missileCd>0?(100*(1-G.missileCd/MISSILE.cd)):100)+'%'; }
    else { const d=DEFS[k]; card.classList.toggle('cant', G.money<d.cost||G.shopCd[k]>0); card.querySelector('.cd').style.width=(G.shopCd[k]>0?(100*(1-G.shopCd[k]/d.build)):100)+'%'; }
  });
}
function buildShop(){
  const wrap=$('shop-cards'); wrap.innerHTML='';
  ORDER.forEach((k,i)=>{ const d=DEFS[k]; const el=document.createElement('div'); el.className='card'; el.dataset.unit=k;
    el.innerHTML=`<div class="key">${i+1}</div><div class="ic"><svg class="uic" aria-hidden="true"><use href="#${d.icon}" xlink:href="#${d.icon}"></use></svg></div><div class="nm">${d.name}</div><div class="cost"><span class="cur">КР</span>${d.cost}</div><div class="ds">${d.desc}</div><div class="cd"></div>`;
    el.title=`${d.name} — HP ${d.hp}, урон ${d.dmg}`; el.onclick=()=>buy(k); wrap.appendChild(el); });
  const el=document.createElement('div'); el.className='card missile-card'; el.dataset.unit='missile';
  el.innerHTML=`<div class="key">9</div><div class="ic"><svg class="uic" aria-hidden="true"><use href="#i-missile" xlink:href="#i-missile"></use></svg></div><div class="nm">Крылатая ракета</div><div class="cost"><span class="cur">КР</span>${MISSILE.cost}</div><div class="ds">Удар по клику. ПВО может перехватить!</div><div class="cd"></div>`;
  el.onclick=armMissile; wrap.appendChild(el);
}

/* ---------------- SPAWNING / ECONOMY ---------------- */
function buy(type){
  if(!G.started||G.over) return; initAudio();
  const d=DEFS[type]; if(G.money<d.cost||G.shopCd[type]>0) return;
  G.money-=d.cost; G.shopCd[type]=d.build; spawnUnit('player',type);
}
function spawnUnit(side,type){
  const d=DEFS[type], dir= side==='player'?1:-1;
  const u={ id:G.uid++, type, side, dir, x: side==='player'? CITY_W+18 : W-CITY_W-18,
    y: clamp(450+rand(-190,190),170,730), hp:d.hp, maxHp:d.hp, angle: dir>0?0:Math.PI, turret: dir>0?0:Math.PI,
    cd:rand(0.2,0.6), scanT:rand(0.2), target:null, track:0, radar:rand(6), recoil:0, jamT:0, salvo:0, salvoT:0,
    ammo: type==='bomber'?3:0, deployed:false, manual:false, seed:rand(1000), wob:rand(6), dead:false, radius:d.radius, air:!!d.air,
    // commander orders / motion tracking (used by the enemy AI; harmless for the player)
    order:null, deployPos:null, priorityTarget:null, repositionCd:0, escortKind:null, vx:0, vy:0, px:0, py:0 };
  if(type==='pvo') u.y=clamp(450+rand(-260,260),150,750);
  u.px=u.x; u.py=u.y;
  // The enemy staff observes every player unit that enters the field and
  // learns the player's build habits from it (see aiAssess forecast).
  if(side==='player'&&G.ai){ const I=G.ai.intel;
    I.spawns.push({type:type, t:G.time, y:u.y}); if(I.spawns.length>90) I.spawns.shift();
    I.estMoney=Math.max(0,I.estMoney-d.cost); I.lastSpawnT=G.time; }
  G.units.push(u); return u;
}
function armMissile(){
  if(!G.started||G.over) return; initAudio();
  if(G.money<MISSILE.cost){ setAlert('Не хватает кредитов на ракету!',false,2); return; }
  if(G.missileCd>0){ setAlert('Ракета перезаряжается…',false,2); return; }
  G.targeting=true; cvs.classList.add('targeting'); setAlert('[РАКЕТА] Кликни по цели на карте!',true,6);
}
function launchMissile(side,tx,ty){
  if(side==='player'&&G.ai){ const I=G.ai.intel; // enemy staff marks the launch & the spending
    I.missiles.push({t:G.time,x:tx,y:ty}); if(I.missiles.length>12) I.missiles.shift();
    I.estMoney=Math.max(0,I.estMoney-MISSILE.cost); }
  const sx= side==='player'? 60:W-60, sy=clamp(ty+rand(-120,120),80,H-80);
  G.projectiles.push({kind:'cruise', side, x:sx, y:sy, tx, ty, hp:34, maxHp:34, speed:270, dead:false, air:true, radius:14, trail:0});
  sfx('launch',0.3); log(side==='player'?'[РАКЕТА] <b>Твоя ракета</b> запущена!':'[РАКЕТА] <b>Вражеская ракета</b> в воздухе!', side==='player'?'good':'bad');
}

/* ---------------- COMBAT HELPERS ---------------- */
function enemiesOf(side){ return G.units.filter(u=>!u.dead&&u.side!==side); }
function armorMult(target, dmgType){
  if(dmgType==='bullet'){ if(target.type==='tank')return 0.18; if(target.type==='btr'||target.type==='pvo')return 0.55; if(target.type==='mlrs'||target.type==='reb')return 0.7; }
  if(dmgType==='explosive'&&target.type==='infantry') return 1.35;
  return 1;
}
function damageUnit(u,dmg,bySide,dmgType='bullet'){
  if(!u||u.dead) return;
  u.hp -= dmg*armorMult(u,dmgType);
  spawnParticles(u.x,u.y,3,'spark');
  if(u.hp<=0) killUnit(u,bySide);
}
function killUnit(u,bySide){
  if(u.dead) return; u.dead=true;
  const big=['tank','mlrs','pvo'].includes(u.type);
  spawnExplosion(u.x,u.y, u.air?0.55: big?1.15:0.8);
  if(!u.air&&u.type!=='infantry'&&G.wrecks.length<42) G.wrecks.push({x:u.x,y:u.y,angle:u.angle,type:u.type,t:0});
  if(G.controlled===u) G.controlled=null;
  if(bySide==='player'&&u.side==='enemy'){ const b=Math.round(DEFS[u.type].cost*0.25); G.money+=b; G.kills++; addFloater(u.x,u.y-18,'+'+b+' КР','#ffd34d');
    if(G.ai) G.ai.intel.estMoney+=b; } // bounty is observable economy for the enemy estimate
  if(bySide==='enemy'&&u.side==='player'){ G.losses++; G.aiMoney+=Math.round(DEFS[u.type].cost*0.25); }
}
function damageCity(owner,dmg,x,y,bySide){
  if(G.city[owner]<=0) return;
  G.city[owner]-=dmg; spawnExplosion(x,y,0.8);
  if(owner==='player'&&G.cityWarnT<=0){ setAlert('[ТРЕВОГА] ТВОЙ ГОРОД ПОД ОГНЁМ!',true,3); G.cityWarnT=5; log('[ТРЕВОГА] Город под обстрелом!','bad'); }
  if(G.city[owner]<=0) endGame(owner==='enemy');
}
function explodeAOE(x,y,radius,dmg,bySide,dmgType='explosive'){
  spawnExplosion(x,y,clamp(radius/55,0.6,1.7));
  for(const u of [...G.units]){ if(u.dead||u.side===bySide||u.air) continue; const d=Math.hypot(u.x-x,u.y-y);
    if(d<radius+u.radius) damageUnit(u, dmg*(1-0.45*(d/(radius+u.radius))), bySide, dmgType); }
  if(x<CITY_W+radius*0.5 && bySide!=='player') damageCity('player',dmg*0.9,x,y,bySide);
  if(x>W-CITY_W-radius*0.5 && bySide!=='enemy') damageCity('enemy',dmg*0.9,x,y,bySide);
}
function validFor(u,e){
  if(u.type==='pvo') return e.air;
  if(u.type==='fpv'||u.type==='bomber') return !e.air;
  if(e.air) return (u.type==='infantry'||u.type==='btr');
  return true;
}
function findTarget(u){
  const foes=enemiesOf(u.side).filter(e=>validFor(u,e));
  if(!foes.length) return null;
  if(u.type==='fpv'){ const prio={tank:0,mlrs:1,pvo:1,btr:2,reb:2,infantry:3};
    foes.sort((a,b)=> (prio[a.type]-prio[b.type])*220 + (dist(u,a)-dist(u,b))); return foes[0]; }
  if(!u.air && u.type!=='pvo'){ foes.sort((a,b)=>dist(u,a)-dist(u,b));
    if(dist(u,foes[0])<=DEFS[u.type].range+26) return foes[0]; // engage whatever is close (incl. drones overhead)
    const ground=foes.filter(e=>!e.air); return (ground.length?ground:foes)[0]; }
  foes.sort((a,b)=>dist(u,a)-dist(u,b)); return foes[0];
}
function cityDist(u){ return u.side==='player' ? (W-CITY_W)-u.x : u.x-CITY_W; }
function cityPoint(u){ return {isCity:true, dead:false, air:false, type:'city', radius:34, citySide: u.side==='player'?'enemy':'player',
  x: u.side==='player'? W-55:55, y: clamp(u.y+rand(-36,36),50,H-50)}; }

/* ---------------- PARTICLES / EFFECTS ---------------- */
function spawnParticles(x,y,n,kind){
  for(let i=0;i<n&&G.particles.length<650;i++){
    if(kind==='spark') G.particles.push({kind,x,y,vx:rand(-90,90),vy:rand(-90,90),life:0,max:rand(0.15,0.4),size:rand(1.5,3),col:'#ffd98a'});
    if(kind==='smoke') G.particles.push({kind,x:x+rand(-6,6),y:y+rand(-6,6),vx:rand(-12,18),vy:rand(-30,-12),life:0,max:rand(0.9,2.2),size:rand(7,15),col:'90,88,82'});
  }
}
function spawnExplosion(x,y,scale=1){
  sfx('boom'); G.shake=Math.min(16,G.shake+7*scale);
  G.particles.push({kind:'ring',x,y,life:0,max:0.38,size:8,maxR:52*scale});
  for(let i=0;i<Math.round(20*scale)&&G.particles.length<650;i++){ const a=rand(Math.PI*2),sp=rand(25,190)*scale;
    G.particles.push({kind:'fire',x,y,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,life:0,max:rand(0.25,0.7),size:rand(4,11)*scale,col:['#fff3b0','#ffb347','#ff7b33','#e64b1f'][i%4]}); }
  for(let i=0;i<Math.round(9*scale);i++) spawnParticles(x,y,1,'smoke');
  for(let i=0;i<8;i++) spawnParticles(x,y,1,'spark');
  if(scale>=0.8){ G.craters.push({x,y,r:rand(14,22)*scale}); if(G.craters.length>130)G.craters.shift(); }
}
function muzzle(x,y,ang,big=false){ for(let i=0;i<(big?7:3);i++) G.particles.push({kind:'fire',x:x+Math.cos(ang)*8,y:y+Math.sin(ang)*8,vx:Math.cos(ang+rand(-0.3,0.3))*rand(40,big?150:90),vy:Math.sin(ang+rand(-0.3,0.3))*rand(40,big?150:90),life:0,max:rand(0.06,0.16),size:rand(2.5,big?7:4.5),col:'#ffe9a3'}); }
function addFloater(x,y,txt,col){ G.floaters.push({x,y,txt,col,life:0}); }

/* ---------------- SHOOTING ---------------- */
function shootAt(u,target){
  const d=DEFS[u.type], ang=Math.atan2(target.y-u.y,target.x-u.x); u.turret=ang;
  if(u.type==='tank'){ muzzle(u.x+Math.cos(ang)*26,u.y+Math.sin(ang)*26,ang,true); u.recoil=1; sfx('cannon');
    G.projectiles.push({kind:'shell',side:u.side,x:u.x+Math.cos(ang)*28,y:u.y+Math.sin(ang)*28,target,speed:760,dmg:d.dmg,dead:false}); }
  else if(u.type==='pvo'){ sfx('aa'); muzzle(u.x,u.y,ang);
    G.projectiles.push({kind:'aa',side:u.side,x:u.x,y:u.y-6,target,speed:540,dmg:d.dmg,dead:false,trail:0}); }
  else if(u.type==='mlrs'){ u.salvo=6; u.salvoT=0;
    // enemy artillery leads moving targets (rockets fly ~1.2 s); accuracy scales with difficulty
    const lead = (u.side==='enemy') ? AI_BRAIN[clamp(G.diff,0,2)].lead : 0;
    u.salvoTarget={x:target.x+(target.vx||0)*1.2*lead, y:target.y+(target.vy||0)*1.2*lead}; }
  else { muzzle(u.x,u.y,ang); sfx('shot',0.09);
    const airPenalty = target.air?0.45:1;
    G.projectiles.push({kind:'bullet',side:u.side,x:u.x,y:u.y,target,speed:950,dmg:d.dmg*airPenalty,dead:false}); }
}
function fireRocket(u,tx,ty){
  sfx('launch',0.16); muzzle(u.x-u.dir*8,u.y,u.angle+Math.PI,true);
  G.projectiles.push({kind:'indirect',sub:'rocket',side:u.side,sx:u.x,sy:u.y,tx:tx+rand(-42,42),ty:ty+rand(-42,42),t:0,dur:rand(1.05,1.35),height:150,dmg:DEFS.mlrs.dmg,aoe:46,dead:false,trail:0});
}

/* ---------------- UPDATE ---------------- */
function update(dt){
  G.time+=dt; G.money+=G.income*dt; G.aiMoney+=DIFF[G.diff].aiIncome*dt;
  for(const k of ORDER) G.shopCd[k]=Math.max(0,G.shopCd[k]-dt);
  G.missileCd=Math.max(0,G.missileCd-dt); G.cityWarnT=Math.max(0,G.cityWarnT-dt);
  if(G.alertT>0){ G.alertT-=dt; if(G.alertT<=0) setAlert(G.controlled?'[FPV] Ты ведёшь FPV вручную!':'Фронт в движении…'); G.alertT=Math.max(0,G.alertT); }
  G.shake=Math.max(0,G.shake-dt*26);
  updateAI(dt);
  // pending enemy missile warnings
  for(const w of G.warnings){ w.t-=dt; if(w.t<=0&&!w.done){ w.done=true; launchMissile(w.side,w.x,w.y);} }
  G.warnings=G.warnings.filter(w=>!w.done);
  // building smoke
  for(const s of ['player','enemy']){ const f=G.city[s]/G.cityMax;
    for(const b of buildings[s]) if(f<b.th&&Math.random()<dt*0.25) spawnParticles(b.x+b.w/2,b.y+b.h/2,1,'smoke'); }
  for(const wr of G.wrecks){ wr.t+=dt; if(wr.t<16&&Math.random()<dt*0.7) spawnParticles(wr.x,wr.y,1,'smoke'); }
  // REB jamming first (affects air movement)
  for(const u of G.units){ if(!u.air||u.dead) continue; let jam=false;
    for(const r of G.units) if(!r.dead&&r.type==='reb'&&r.side!==u.side&&dist(r,u)<140) jam=true;
    if(jam){ u.jamT+=dt; if(Math.random()<dt*8) spawnParticles(u.x,u.y,1,'spark');
      if(u.jamT>0.85){ addFloater(u.x,u.y-16,'ЗАГЛУШЕН РЭБ!','#8fd0ff'); killUnit(u, u.side==='player'?'enemy':'player'); } }
    else u.jamT=Math.max(0,u.jamT-dt*1.5); }
  for(const u of G.units) if(!u.dead) updateUnit(u,dt);
  separation();
  G.units=G.units.filter(u=>!u.dead);
  updateProjectiles(dt);
  // particles / floaters
  for(const p of G.particles){ p.life+=dt; if(p.kind==='ring'){p.size=lerp(8,p.maxR,p.life/p.max);}
    else { p.x+=p.vx*dt; p.y+=p.vy*dt; p.vx*=(1-1.8*dt); p.vy*=(1-1.8*dt); if(p.kind==='smoke')p.size+=9*dt; } }
  G.particles=G.particles.filter(p=>p.life<p.max);
  for(const f of G.floaters){ f.life+=dt; f.y-=26*dt; } G.floaters=G.floaters.filter(f=>f.life<1.15);
}
function separation(){
  const g=G.units.filter(u=>!u.air);
  for(let i=0;i<g.length;i++) for(let j=i+1;j<g.length;j++){ const a=g[i],b=g[j],d=dist(a,b),min=a.radius+b.radius+3;
    if(d>0.01&&d<min){ const push=(min-d)/2, nx=(b.x-a.x)/d, ny=(b.y-a.y)/d; a.x-=nx*push; a.y-=ny*push; b.x+=nx*push; b.y+=ny*push; } }
}
function moveToward(u,tx,ty,speed,dt){
  const dx=tx-u.x, dy=ty-u.y, d=Math.hypot(dx,dy); if(d<3) return 0;
  const want=Math.atan2(dy,dx); u.angle=angLerp(u.angle,want,dt*(u.air?5:3.2));
  let mx=Math.cos(u.angle), my=Math.sin(u.angle);
  if(u.jamT>0.05){ mx+=rand(-0.8,0.8); my+=rand(-0.8,0.8); }
  const ml=Math.hypot(mx,my)||1; const step=Math.min(d,speed*dt);
  u.x+=mx/ml*step; u.y=clamp(u.y+my/ml*step,60,H-60); u.track+=step*0.55; return d;
}
function updateUnit(u,dt){
  const d=DEFS[u.type]; u.cd-=dt; u.scanT-=dt; u.recoil=Math.max(0,u.recoil-dt*5); u.radar+=dt*2.4; u.wob+=dt*7;
  u.repositionCd=Math.max(0,(u.repositionCd||0)-dt);
  // smoothed velocity (enemy staff uses it for target lead prediction)
  if(dt>0){ const ivx=clamp((u.x-u.px)/dt,-280,280), ivy=clamp((u.y-u.py)/dt,-280,280);
    u.vx=lerp(u.vx||0,ivx,0.22); u.vy=lerp(u.vy||0,ivy,0.22); u.px=u.x; u.py=u.y; }
  // MLRS salvo in progress
  if(u.salvo>0){ u.salvoT-=dt; if(u.salvoT<=0){ fireRocket(u,u.salvoTarget.x,u.salvoTarget.y); u.salvo--; u.salvoT=0.14; } }
  // target acquisition
  if(u.scanT<=0){ u.scanT=0.18+rand(0.12);
    if(u.type==='pvo'){ const mis=G.projectiles.find(p=>p.kind==='cruise'&&!p.dead&&p.side!==u.side&&dist(u,p)<d.range); u.target=mis||findTarget(u); }
    // enemy MLRS obey the commander's suppression target (player PVO/REB first)
    else if(u.side==='enemy'&&u.type==='mlrs'&&u.priorityTarget&&!u.priorityTarget.dead&&dist(u,u.priorityTarget)<640) u.target=u.priorityTarget;
    else u.target=findTarget(u); }
  const tgt=(u.target&&!u.target.dead)?u.target:null;
  /* ----- AIR ----- */
  if(u.type==='fpv'){
    if(u.manual&&u.side==='player'){
      moveToward(u,mouse.x,mouse.y,205,dt);
      const hit=enemiesOf(u.side).find(e=>!e.air&&dist(u,e)<24);
      if(hit){ explodeAOE(u.x,u.y,46,d.dmg,u.side); killUnitSilent(u); return; }
      if(cityDist(u)<16){ explodeAOE(u.x,u.y,46,d.dmg,u.side); killUnitSilent(u); return; }
      return;
    }
    // enemy FPV reserve: loiter over the rally point until the commander releases it
    if(u.side==='enemy'&&u.order&&u.order.mode==='hold'){
      moveToward(u, u.order.x+Math.cos(G.time*0.85+u.seed)*48, u.order.y+Math.sin(G.time*1.13+u.seed)*30, d.speed*0.78, dt);
      return;
    }
    if(tgt){ const dd=moveToward(u,tgt.x,tgt.y,d.speed,dt);
      if(dd<22){ explodeAOE(u.x,u.y,46,d.dmg,u.side); killUnitSilent(u); } }
    else { moveToward(u, u.side==='player'?W-60:60, u.y, d.speed, dt);
      if(cityDist(u)<18){ explodeAOE(u.x,u.y,46,d.dmg,u.side); killUnitSilent(u); } }
    return;
  }
  if(u.type==='bomber'){
    if(u.ammo<=0){ const homeX=u.side==='player'?70:W-70; if(moveToward(u,homeX,u.y,d.speed*1.15,dt)<26) u.dead=true; return; }
    // enemy bomber reserve: stay back until released (keeps it out of player PVO while waiting)
    if(u.side==='enemy'&&u.order&&u.order.mode==='hold'){
      moveToward(u, u.order.x+Math.cos(G.time*0.7+u.seed)*42, u.order.y+Math.sin(G.time*0.95+u.seed)*26, d.speed*0.8, dt);
      return;
    }
    const goal = tgt||cityPointCache(u);
    const dd=moveToward(u,goal.x,goal.y,d.speed,dt);
    if(dd<d.range&&u.cd<=0){ u.cd=d.rof; u.ammo--; sfx('shot',0.06);
      G.projectiles.push({kind:'indirect',sub:'bomb',side:u.side,sx:u.x,sy:u.y,tx:goal.x+rand(-9,9),ty:goal.y+rand(-9,9),t:0,dur:0.72,height:-70,dmg:d.dmg,aoe:44,dead:false}); }
    return;
  }
  /* ----- PVO: drive to its post & deploy (enemy posts are planned by the commander) ----- */
  if(u.type==='pvo'){
    const post = u.deployPos || {x:(u.side==='player'? CITY_W+215 : W-CITY_W-215), y:u.y};
    if(!u.deployed){ if(moveToward(u,post.x,post.y,d.speed,dt)<8){ u.deployed=true; if(u.side==='player')log('[ПВО] Развёрнута и прикрывает небо','good'); } }
    else if(tgt){ u.turret=angLerp(u.turret,Math.atan2(tgt.y-u.y,tgt.x-u.x),dt*8);
      if(dist(u,tgt)<=d.range&&u.cd<=0){ u.cd=d.rof; shootAt(u,tgt); } }
    return;
  }
  /* ----- GROUND COMBAT ----- */
  const inRange = tgt && dist(u,tgt)<=d.range && !(u.type==='mlrs'&&dist(u,tgt)<150);
  const atCity = cityDist(u)<=d.range;
  const ord = (u.side==='enemy') ? u.order : null;
  // Retreat order: fall back to the rally point while returning fire.
  if(ord&&ord.mode==='retreat'){
    if(inRange&&u.cd<=0){ u.cd=d.rof*rand(0.95,1.15); shootAt(u,tgt); }
    moveToward(u,ord.x,ord.y,d.speed*0.97,dt);
    if(tgt) u.turret=angLerp(u.turret,Math.atan2(tgt.y-u.y,tgt.x-u.x),dt*7);
    return;
  }
  if(inRange){ u.turret=angLerp(u.turret,Math.atan2(tgt.y-u.y,tgt.x-u.x),dt*7);
    if(u.cd<=0){ u.cd=d.rof*rand(0.9,1.1); shootAt(u,tgt); } return; }
  if(atCity){ const cp=cityPoint(u); u.turret=angLerp(u.turret,Math.atan2(cp.y-u.y,cp.x-u.x),dt*7);
    if(u.cd<=0){ u.cd=d.rof; shootAt(u,cp); } return; }
  // Hold-position orders (rally / artillery station / EW escort). Nearby threats
  // still trigger normal combat below — except EW escort, which never chases.
  if(ord&&(ord.mode==='rally'||ord.mode==='support'||ord.mode==='escort'||ord.mode==='intercept')){
    const aggro = u.type==='mlrs'?560 : u.type==='reb'?120 : 330;
    const closeThreat = tgt && dist(u,tgt)<aggro && ord.mode!=='escort';
    if(!closeThreat){
      const catchUp = (ord.mode==='escort'&&dist(u,ord)>220)?1.32:1; // EW vehicle hurries back to its group
      moveToward(u,ord.x,ord.y,d.speed*catchUp,dt);
      u.turret=angLerp(u.turret, tgt?Math.atan2(tgt.y-u.y,tgt.x-u.x):u.angle, dt*3);
      return;
    }
  }
  // advance: toward nearby enemy (aggro) or straight to enemy city
  let tx,ty;
  if(tgt&&dist(u,tgt)<(u.type==='mlrs'?560:330)){ tx=tgt.x; ty=tgt.y; if(u.type==='mlrs'&&dist(u,tgt)<150){ tx=u.x-u.dir*60; ty=u.y; } }
  else { tx=u.side==='player'? W-CITY_W-8:CITY_W+8; ty=u.y+Math.sin(u.wob*0.24+u.seed)*8;
    if(ord&&ord.mode==='assault') ty=ord.y; // converge on the chosen attack lane
  }
  moveToward(u,tx,ty,d.speed,dt);
  u.turret=angLerp(u.turret,u.angle,dt*3);
}
const _cpCache={};
function cityPointCache(u){ const k=u.side; if(!_cpCache[k]||Math.random()<0.01)_cpCache[k]={dead:false,air:false,type:'city',x:u.side==='player'?W-60:60,y:450+rand(-160,160)}; return _cpCache[k]; }
function killUnitSilent(u){ u.dead=true; if(G.controlled===u)G.controlled=null; }

function updateProjectiles(dt){
  for(const p of G.projectiles){ if(p.dead) continue;
    if(p.kind==='bullet'||p.kind==='shell'||p.kind==='aa'){
      const t=p.target; let tx=(p.tx===undefined?p.x:p.tx), ty=(p.ty===undefined?p.y:p.ty);
      if(t&&!t.dead){ tx=t.x; ty=t.y; p.tx=tx; p.ty=ty; }
      const dx=tx-p.x, dy=ty-p.y, dd=Math.hypot(dx,dy), step=p.speed*dt;
      if(p.kind==='aa'){ p.trail=(p.trail||0)-dt; if(p.trail<=0){p.trail=0.03; spawnParticles(p.x,p.y,1,'smoke');} }
      if(dd<=Math.max(step,13)){ p.dead=true;
        if(t&&!t.dead){
          if(t.isCity) damageCity(t.citySide,p.dmg,tx,ty,p.side);
          else if(t.kind==='cruise'){ t.hp-=p.dmg; spawnParticles(tx,ty,4,'spark');
            if(t.hp<=0&&!t.dead){ t.dead=true; spawnExplosion(tx,ty,0.9); addFloater(tx,ty-20,'ПЕРЕХВАТ!','#8fd0ff'); if(p.side==='player'){G.money+=60; log('[ПВО] Твоя ПВО <b>перехватила ракету</b>! +60 КР','good');} } }
          else if(p.kind==='shell') explodeAOE(tx,ty,26,p.dmg,p.side,'cannon');
          else damageUnit(t,p.dmg,p.side,p.kind==='aa'?'aa':'bullet');
        } else if(p.kind==='shell') explodeAOE(tx,ty,24,p.dmg*0.7,p.side,'cannon');
      } else { p.x+=dx/dd*step; p.y+=dy/dd*step; }
    }
    else if(p.kind==='indirect'){
      p.t+=dt/p.dur;
      if(p.sub==='rocket'){ p.trail=(p.trail||0)-dt; const px=lerp(p.sx,p.tx,p.t), py=lerp(p.sy,p.ty,p.t)-Math.sin(Math.PI*clamp(p.t,0,1))*p.height;
        if(p.trail<=0){p.trail=0.025; G.particles.push({kind:'smoke',x:px,y:py,vx:rand(-6,6),vy:rand(-4,10),life:0,max:rand(0.5,1),size:rand(4,8),col:'150,145,135'});} }
      if(p.t>=1){ p.dead=true; explodeAOE(p.tx,p.ty,p.aoe,p.dmg,p.side,'explosive'); }
    }
    else if(p.kind==='cruise'){
      const dx=p.tx-p.x, dy=p.ty-p.y, dd=Math.hypot(dx,dy), step=p.speed*dt; p.angle=Math.atan2(dy,dx);
      p.trail-=dt; if(p.trail<=0){ p.trail=0.02; G.particles.push({kind:'fire',x:p.x-Math.cos(p.angle)*16,y:p.y-Math.sin(p.angle)*16,vx:-Math.cos(p.angle)*40,vy:-Math.sin(p.angle)*40,life:0,max:0.3,size:rand(3,6),col:'#ffb347'}); spawnParticles(p.x,p.y,1,'smoke'); }
      if(dd<=Math.max(step,16)){ p.dead=true; explodeAOE(p.tx,p.ty,92,185,p.side,'explosive'); addFloater(p.tx,p.ty-26,'ПОПАДАНИЕ!','#ff8d80'); }
      else { p.x+=dx/dd*step; p.y+=dy/dd*step; }
    }
  }
 G.projectiles=G.projectiles.filter(p=>!p.dead);
}

/* ================= ENEMY COMMANDER AI =================
   A staff that observes the player, forecasts the next builds, plans PVO/REB
   placement, assembles waves at a rally point, suppresses and assaults.
   It only uses observable information (spawned units, launches, economy
   estimates), with accuracy scaled by difficulty. */
function aiBrain(){ return AI_BRAIN[clamp(G.diff||0,0,2)]; }
function laneOfY(y){ return y<330?0 : y<570?1 : 2; }
function countType(arr,t){ let n=0; for(const u of arr) if(u.type===t)n++; return n; }
function unitValue(u){
  if(!u||!DEFS[u.type]) return 0;
  const mult={tank:1.18,mlrs:1.12,btr:1.0,infantry:0.8,fpv:0.95,bomber:0.95,pvo:0.9,reb:0.8}[u.type]||1;
  return DEFS[u.type].cost*(0.35+0.65*clamp(u.hp/u.maxHp,0,1))*mult;
}
function forceValue(arr){ let s=0; for(const u of arr)s+=unitValue(u); return s; }
function clusterOf(members){
  if(!members||!members.length) return null;
  let sw=0,x=0,y=0,vx=0,vy=0,value=0;
  for(const u of members){ const w=DEFS[u.type].cost; sw+=w; x+=u.x*w; y+=u.y*w; vx+=(u.vx||0)*w; vy+=(u.vy||0)*w; value+=unitValue(u); }
  x/=sw; y/=sw; vx/=sw; vy/=sw;
  let anchor=members[0], bd=1e18;
  for(const u of members){ const d=Math.hypot(u.x-x,u.y-y); if(d<bd){bd=d;anchor=u;} }
  return {x:x,y:y,vx:vx,vy:vy,members:members,value:value,anchor:anchor};
}
function bestCluster(arr,radius){
  if(!arr.length) return null;
  let best=null,bestVal=-1;
  for(const a of arr){ const ms=arr.filter(u=>dist(a,u)<=radius); const v=forceValue(ms);
    if(v>bestVal){bestVal=v;best=ms;} }
  return clusterOf(best);
}
function segPointDist(px,py,x1,y1,x2,y2){
  const dx=x2-x1, dy=y2-y1, l2=dx*dx+dy*dy||1;
  const t=clamp(((px-x1)*dx+(py-y1)*dy)/l2,0,1);
  return Math.hypot(px-(x1+dx*t), py-(y1+dy*t));
}
function predictedPoint(t,sec,lead){
  return {x:clamp(t.x+(t.vx||0)*sec*(lead===undefined?1:lead),55,W-55),
          y:clamp(t.y+(t.vy||0)*sec*(lead===undefined?1:lead),55,H-55)};
}

function aiAssess(){
  const A=G.ai, I=A.intel, brain=aiBrain();
  const mine=G.units.filter(u=>!u.dead&&u.side==='player');
  const his =G.units.filter(u=>!u.dead&&u.side==='enemy');
  const pGround=mine.filter(u=>!u.air), eGround=his.filter(u=>!u.air);
  // --- intel: prune, then forecast the player's next builds from spawn history
  I.spawns=I.spawns.filter(s=>G.time-s.t<80);
  I.missiles=I.missiles.filter(m=>G.time-m.t<70);
  const fc={}; ORDER.forEach(k=>fc[k]=0.15); let fcTot=ORDER.length*0.15, airLaneSum=0, airLaneW=0;
  for(const s of I.spawns){ const w=Math.exp(-(G.time-s.t)/32); fc[s.type]+=w; fcTot+=w;
    if(s.type==='fpv'||s.type==='bomber'){ airLaneSum+=s.y*w; airLaneW+=w; } }
  for(const u of mine) if(u.air){ airLaneSum+=u.y*0.7; airLaneW+=0.7; }
  I.forecast={}; for(const k of ORDER) I.forecast[k]=fc[k]/fcTot;
  if(airLaneW>0) I.airLaneY=lerp(I.airLaneY, airLaneSum/airLaneW, 0.55);
  const airShare=I.forecast.fpv+I.forecast.bomber;
  const armorShare=I.forecast.tank+I.forecast.btr*0.7;
  const swarmShare=I.forecast.infantry;
  const artilleryShare=I.forecast.mlrs;
  I.airThreat=clamp(forceValue(mine.filter(u=>u.air))/240 + airShare*1.5*brain.forecast,0,2);
  I.armorThreat=clamp(forceValue(mine.filter(u=>u.type==='tank'||u.type==='btr'))/650 + armorShare*1.3*brain.forecast,0,2);
  I.swarmThreat=clamp(forceValue(mine.filter(u=>u.type==='infantry'))/260 + swarmShare*1.2*brain.forecast,0,2);
  I.artilleryThreat=clamp(forceValue(mine.filter(u=>u.type==='mlrs'))/300 + artilleryShare*1.4*brain.forecast,0,2);
  let msThreat=I.missiles.length*0.35;
  if(I.estMoney>=430 && G.time-I.lastSpawnT>7) msThreat+=0.7;       // player is saving up — likely a missile
  if(I.estMoney>=720) msThreat+=0.4;
  I.missileThreat=clamp(msThreat,0,1.6);
  A.disperse = I.missileThreat>0.75;                                 // spread the rally out under missile threat
  const style = airShare>0.34?'air' : armorShare>0.36?'armor' : swarmShare>0.34?'swarm' : artilleryShare>0.22?'artillery' : 'mixed';
  if(style!==I.style){ I.style=style;
    if(style!=='mixed'&&G.time-A.lastIntelLog>20){ A.lastIntelLog=G.time;
      const names={air:'дроны',armor:'бронетехнику',swarm:'массовую пехоту',artillery:'артиллерию'};
      log('[РАЗВЕДКА] Враг читает твою ставку на <b>'+names[style]+'</b> и готовит контрмеры','bad'); } }
  // --- lanes and the weakest direction of attack
  const lanes=[0,1,2].map(l=>{
    const pu=mine.filter(u=>laneOfY(u.y)===l), eu=his.filter(u=>laneOfY(u.y)===l);
    const pg=forceValue(pu.filter(u=>!u.air));
    return {lane:l, player:forceValue(pu), playerGround:pg, enemy:forceValue(eu),
      defense:pg + countType(pu,'pvo')*150 + countType(pu,'reb')*85};
  });
  let bestLane=A.attackLane, bestScore=Infinity;
  for(const L of lanes){ let s=L.defense-L.enemy*0.3;
    if(L.lane===A.attackLane) s-=45;                                  // persistence: avoid flip-flopping
    if(L.lane===A.failedLane&&G.time<A.failedLaneUntil) s+=220;       // do not repeat a failed push at once
    if(s<bestScore){bestScore=s;bestLane=L.lane;} }
  A.attackLane=bestLane; A.rally={x:1080,y:AI_LANES[bestLane]};
  // --- groups & situation
  const armorCluster=bestCluster(his.filter(u=>u.type==='tank'||u.type==='btr'),205);
  const rearCluster =bestCluster(his.filter(u=>u.type==='mlrs'||u.type==='pvo'),230);
  const playerCluster=bestCluster(pGround,150);
  const incursionCluster=bestCluster(pGround.filter(u=>u.x>860),185); // player force inside AI half
  const combatTypes=['infantry','btr','tank','mlrs'];
  const staged=eGround.filter(u=>combatTypes.includes(u.type)&&u.x>820);
  const eCombat=his.filter(u=>combatTypes.includes(u.type)||u.air);
  const cityThreatUnits=pGround.filter(u=>cityDist(u)<390);
  let desiredPvo=0;
  if(G.time>18||I.airThreat>0.25||I.missileThreat>0.35) desiredPvo=1;
  if(I.airThreat>0.8||I.missileThreat>0.85) desiredPvo=2;
  if(I.airThreat>1.35&&((armorCluster&&armorCluster.value>420)||(rearCluster&&rearCluster.value>420))) desiredPvo=3;
  desiredPvo=Math.min(desiredPvo, G.diff===0?2:3);
  let desiredReb=0;
  if(armorCluster&&armorCluster.value>190&&(I.airThreat>0.3||airShare>0.18)) desiredReb=1;
  if(rearCluster&&rearCluster.value>260&&I.airThreat>0.75&&(!armorCluster||dist(rearCluster,armorCluster)>240)) desiredReb++;
  desiredReb=Math.min(desiredReb,2);
  // suppression priority: forward player PVO/REB/MLRS near the attack lane
  let suppressionTarget=null, supScore=-1;
  for(const u of pGround){ if(!['pvo','reb','mlrs'].includes(u.type)) continue;
    const s=({pvo:360,reb:300,mlrs:260}[u.type]) + unitValue(u)*0.4 - Math.abs(u.y-AI_LANES[bestLane])*0.12 + (u.x>430?70:0);
    if(s>supScore){supScore=s;suppressionTarget=u;} }
  const frontArr=eGround.filter(u=>u.type!=='pvo');
  const plan={mine:mine,his:his,pGround:pGround,eGround:eGround,lanes:lanes,
    armorCluster:armorCluster,rearCluster:rearCluster,playerCluster:playerCluster,
    staged:staged,stagedValue:forceValue(staged),assaultValue:forceValue(eCombat),
    forwardValue:forceValue(eCombat.filter(u=>u.x<820)),
    cityThreatValue:forceValue(cityThreatUnits),incursionCluster:incursionCluster,
    incursionValue:incursionCluster?incursionCluster.value:0,desiredPvo:desiredPvo,desiredReb:desiredReb,
    suppressionTarget:suppressionTarget,airShare:airShare,armorShare:armorShare,
    frontX:frontArr.length?Math.min.apply(null,frontArr.map(u=>u.x)):1320};
  A.plan=plan; return plan;
}

function aiSetPhase(next){
  const A=G.ai; if(A.phase===next) return;
  A.phase=next; A.phaseT=0; A.stats.phases++;
  const laneName=['верхнему флангу','центру','нижнему флангу'][A.attackLane];
  if(next==='stage') log('[РАЗВЕДКА] Враг собирает <b>ударную группу</b>','bad');
  else if(next==='suppress') log('[РАЗВЕДКА] Враг подавляет твою <b>ПВО и РЭБ</b> перед атакой','bad');
  else if(next==='assault'){ A.stats.waves++; A.waveStartValue=Math.max(1,A.plan?A.plan.assaultValue:1); A.assaultCityHp=G.city.player; A.wavePeakForward=0;
    log('[ТРЕВОГА] Враг начал <b>наступление</b> по '+laneName,'bad');
    setAlert('[ТРЕВОГА] Наступление врага по '+laneName+'!',true,3); }
  else if(next==='retreat'){ A.stats.retreats++; A.failedLane=A.attackLane; A.failedLaneUntil=G.time+50;
    log('[РАЗВЕДКА] Атака врага захлебнулась — он отходит на <b>перегруппировку</b>','good'); }
  else if(next==='defend') log('[РАЗВЕДКА] Враг перешёл к <b>обороне своего города</b>','good');
}
function aiUpdatePhase(plan){
  const A=G.ai, brain=aiBrain(); A.phaseT+=brain.think;
  if((plan.cityThreatValue>300||plan.incursionValue>560)&&A.phase!=='defend'){ aiSetPhase('defend'); return; }
  if(A.phase==='defend'){ if(plan.cityThreatValue<110&&A.phaseT>3) aiSetPhase('buildup'); return; }
  if(A.phase==='buildup'){
    const threshold=brain.waveValue*(A.wave===1?0.75:1)*(A.phaseT>34?0.85:1);
    const laneDefense=plan.lanes[A.attackLane].defense;
    const localEdge = plan.stagedValue>=laneDefense*0.85;             // do not attack into clear inferiority
    const pvoReady = countType(plan.his,'pvo')>=Math.min(plan.desiredPvo,1)||A.phaseT>28;
    const rebReady = plan.desiredReb===0||countType(plan.his,'reb')>=1||A.phaseT>28;
    if((plan.stagedValue>=threshold&&localEdge&&pvoReady&&rebReady)||(A.phaseT>55&&plan.stagedValue>=500)) aiSetPhase('stage');
  }
  else if(A.phase==='stage'){
    const ready=plan.staged.length? plan.staged.filter(u=>u.order&&dist(u,u.order)<200).length/plan.staged.length : 1;
    if(A.phaseT>6||ready>0.62) aiSetPhase('suppress');
  }
  else if(A.phase==='suppress'){
    if(A.phaseT>(plan.suppressionTarget?5.5:2.2)) aiSetPhase('assault');
  }
  else if(A.phase==='assault'){
    A.wavePeakForward=Math.max(A.wavePeakForward||0,plan.forwardValue);
    const nearCity=forceValue(plan.eGround.filter(u=>u.x<360));
    const sieging = G.city.player<A.assaultCityHp-80 && nearCity>120;
    // Pull out when the forward fist has melted away — measured against its own
    // peak strength during this push, not against units still back at base.
    if(!sieging&&A.phaseT>9&&A.wavePeakForward>260&&plan.forwardValue<A.wavePeakForward*0.38) aiSetPhase('retreat');
    else if(A.phaseT>50&&!sieging&&nearCity<150) aiSetPhase('retreat');
  }
  else if(A.phase==='retreat'){
    const surv=plan.eGround.filter(u=>['infantry','btr','tank','mlrs'].includes(u.type));
    const frac=surv.length? surv.filter(u=>u.x>1030).length/surv.length : 1;
    if(A.phaseT>9||frac>0.72){ A.wave++; aiSetPhase('buildup'); }
  }
}

/* ----- PVO placement: scored posts + relocation ----- */
function aiScorePvoPost(pt,plan,selected,current){
  const A=G.ai, I=A.intel, R=DEFS.pvo.range; let score=0;
  for(const a of plan.his){ if(a.air||a.type==='pvo') continue; const d=dist(pt,a);
    if(d<R) score+=unitValue(a)*(1-d/R)*((a.type==='tank'||a.type==='mlrs')?0.55:0.28); }
  const rd=dist(pt,A.rally); if(rd<R) score+=110*(1-rd/R);
  for(const cy of [250,450,650]){ const d=Math.hypot(pt.x-1545,pt.y-cy);
    if(d<R) score+=55*I.missileThreat*(1-d/R); }                       // city missile shield
  score+=150*I.airThreat*Math.exp(-Math.abs(pt.y-I.airLaneY)/200);     // expected drone corridor
  score+=65*Math.exp(-Math.abs(pt.y-AI_LANES[A.attackLane])/230);      // cover the assault lane
  let exposure=0;
  for(const u of plan.pGround){ if(!['tank','mlrs','btr'].includes(u.type)) continue;
    const dangerR=u.type==='mlrs'?500:300, d=dist(pt,u);
    if(d<dangerR) exposure=Math.max(exposure,(dangerR-d)*(u.type==='mlrs'?0.75:0.5)); }
  score-=exposure;
  if(pt.x<plan.frontX+85) score-=(plan.frontX+85-pt.x)*0.45;           // stay behind own armour
  for(const s of (selected||[])){ const d=dist(pt,s); if(d<360) score-=(360-d)*0.75; } // no stacked umbrellas
  if(current) score-=dist(pt,current)*0.08;                             // relocation cost
  return score;
}
function aiPlanPvoPosts(plan){
  const A=G.ai, brain=aiBrain();
  const existing=plan.his.filter(u=>u.type==='pvo');
  const wanted=Math.max(plan.desiredPvo,existing.length);
  if(wanted===0){ A.pvoPosts=[]; A.pvoPlanT=2; return []; }
  const cand=[];
  for(const x of [1305,1235,1150,1060]) for(const y of [190,310,450,590,710]) cand.push({x:x,y:y});
  for(const c of [plan.armorCluster,plan.rearCluster]) if(c){
    cand.push({x:clamp(c.x+95,1010,1335),y:clamp(c.y,130,770)});
    cand.push({x:clamp(c.x+95,1010,1335),y:clamp(c.y-140,130,770)});
    cand.push({x:clamp(c.x+95,1010,1335),y:clamp(c.y+140,130,770)}); }
  cand.push({x:1200,y:AI_LANES[A.attackLane]});
  const selected=[];
  for(let i=0;i<wanted;i++){ let bp=null,bs=-Infinity;
    // hard spacing first (no stacked umbrellas), relaxed only if nothing fits
    for(const minGap of [240,170,0]){ bp=null; bs=-Infinity;
      for(const p of cand){ if(selected.some(s=>dist(p,s)<minGap)) continue;
        const s=aiScorePvoPost(p,plan,selected,null); if(s>bs){bs=s;bp=p;} }
      if(bp) break; }
    if(bp) selected.push({x:bp.x,y:bp.y}); }
  A.pvoPosts=selected;
  const canReposition=A.pvoPlanT<=0;
  let moving=existing.some(u=>!u.deployed);
  const inbound=G.projectiles.some(p=>p.kind==='cruise'&&p.side==='player'&&!p.dead);
  // Assignment: a deployed PVO already sitting on/near a post reserves it, so a
  // newly bought one is never sent to stack on the same umbrella.
  const reserved=new Set();
  for(const u of existing){ if(!u.deployed) continue;
    let bp=null,bd=Infinity;
    for(const p of selected){ if(reserved.has(p)) continue; const d=dist(u,p); if(d<bd){bd=d;bp=p;} }
    if(bp&&bd<120) reserved.add(bp); }
  for(const u of existing){ if(u.deployed) continue;
    let bp=null,bd=Infinity;
    for(const p of selected){ if(reserved.has(p)) continue; const d=dist(u,p); if(d<bd){bd=d;bp=p;} }
    if(!bp) bp=selected[0]; if(!bp) continue;
    reserved.add(bp); u.deployPos={x:bp.x,y:bp.y}; }
  // Relocation: a deployed PVO far from every good post may move to the best free one.
  for(const u of existing){ if(!u.deployed) continue;
    if(!canReposition||moving||inbound||u.repositionCd>0) continue;
    let post=null;
    for(const p of selected){ if(!reserved.has(p)){ post=p; break; } }   // first free = highest-scored free post
    if(!post||dist(u,post)<=85) continue;
    const others=selected.filter(s=>s!==post);
    const cur=aiScorePvoPost({x:u.x,y:u.y},plan,others,null);
    const nw =aiScorePvoPost(post,plan,others,u);
    if(nw>cur*1.18+90){ u.deployPos={x:post.x,y:post.y}; u.deployed=false; u.repositionCd=brain.reposition;
      reserved.add(post); moving=true; A.stats.repositions++;
      if(G.time-A.lastIntelLog>10){ A.lastIntelLog=G.time; log('[РАЗВЕДКА] Враг <b>перебрасывает ПВО</b> на новую позицию','bad'); } } }
  if(canReposition) A.pvoPlanT=brain.reposition;
  return selected;
}
function aiAssignNewPvo(u,plan){
  const A=G.ai; let posts=A.pvoPosts;
  if(!posts.length&&plan) posts=aiPlanPvoPosts(plan);
  if(!posts.length){ u.deployPos={x:1275,y:450}; return; }
  const free=posts.find(p=>!G.units.some(o=>o!==u&&o.side==='enemy'&&o.type==='pvo'&&o.deployPos&&dist(o.deployPos,p)<45));
  const p=free||posts[0]; u.deployPos={x:p.x,y:p.y};
}

/* ----- orders: rally / assault lanes / EW escort / air reserve ----- */
function aiAssignOrders(plan){
  const A=G.ai, I=A.intel, brain=aiBrain(), laneY=AI_LANES[A.attackLane], spread=A.disperse?1.65:1;
  A.rally={x:1080,y:laneY};
  const emergency=plan.cityThreatValue>240||plan.incursionValue>330;
  const playerPvo=countType(plan.mine,'pvo');
  // Minor breakthroughs are intercepted by the nearest staged units without
  // cancelling the whole wave plan; major ones flip the phase to 'defend'.
  const interceptorIds={};
  if(plan.incursionCluster&&(A.phase==='buildup'||A.phase==='stage'||A.phase==='suppress')){
    const cands=plan.his.filter(u=>!u.air&&['infantry','btr','tank'].includes(u.type))
      .sort((a,b)=>dist(a,plan.incursionCluster)-dist(b,plan.incursionCluster));
    let assigned=0;
    for(const u of cands){ if(assigned>=plan.incursionValue*1.2&&Object.keys(interceptorIds).length>=1) break;
      interceptorIds[u.id]=true; assigned+=unitValue(u);
      if(Object.keys(interceptorIds).length>=4) break; }
  }
  for(const u of plan.his){
    if(u.type==='pvo'||u.type==='reb') continue;
    const slotX=(((u.id*37)%90)-45)*spread, slotY=(((u.id*53)%130)-65)*spread;
    if(u.air){
      let release=emergency||A.phase==='assault'||A.phase==='defend';
      if(A.phase==='suppress') release = u.type==='fpv' ? (A.phaseT>2||playerPvo===0) : (playerPvo===0);
      u.order=release?{mode:'attack',x:60,y:u.y}
                     :{mode:'hold',x:1190,y:clamp(laneY+slotY,110,790)};
      continue;
    }
    if(u.type==='mlrs'){
      let sx=1180;
      if(A.phase==='suppress') sx=1120;
      if(A.phase==='assault'&&plan.armorCluster) sx=clamp(plan.armorCluster.x+275,720,1180);
      if(A.phase==='retreat') u.order={mode:'retreat',x:1260,y:clamp(laneY+slotY*0.5,110,790)};
      else u.order={mode:'support',x:sx+slotX*0.35,y:clamp(laneY+slotY*0.55,110,790)};
      continue;
    }
    if(interceptorIds[u.id]){ const pp=predictedPoint(plan.incursionCluster,0.8,brain.lead);
      u.order={mode:'intercept',x:pp.x,y:pp.y}; }
    else if(A.phase==='defend') u.order=null;                         // free hunt near the threatened city
    else if(A.phase==='retreat') u.order={mode:'retreat',x:1245+slotX*0.25,y:clamp(laneY+slotY*0.7,110,790)};
    else if(A.phase==='assault') u.order={mode:'assault',x:CITY_W+8,y:clamp(laneY+slotY,90,810)};
    else { const rx=u.type==='tank'?1040 : u.type==='btr'?1080 : 1110; // buildup/stage/suppress: assemble
      u.order={mode:'rally',x:rx+slotX,y:clamp(laneY+slotY,100,800)}; }
  }
  // MLRS suppression target for the whole battery
  const pri=(A.phase==='suppress'||A.phase==='assault')?plan.suppressionTarget
            :(plan.playerCluster?plan.playerCluster.anchor:null);
  for(const u of plan.his) if(u.type==='mlrs') u.priorityTarget=(pri&&!pri.dead)?pri:null;
  // EW escort: first jammer shadows the armour fist, the second guards the rear
  const rebs=plan.his.filter(u=>u.type==='reb').sort((a,b)=>a.id-b.id);
  rebs.forEach((u,i)=>{
    let grp=null,kind='city';
    if(i===0&&plan.armorCluster){grp=plan.armorCluster;kind='armor';}
    else if(plan.rearCluster&&(!plan.armorCluster||dist(plan.rearCluster,plan.armorCluster)>180||i>0)){grp=plan.rearCluster;kind='rear';}
    else if(plan.armorCluster){grp=plan.armorCluster;kind='armor';}
    if(grp){ u.order={mode:'escort',
        x:clamp(grp.x+(grp.vx||0)*0.7+78,180,1395),                  // follows the fist even deep in the assault
        y:clamp(grp.y+(grp.vy||0)*0.7+(i%2?58:-58),95,805)}; }
    else u.order={mode:'escort',x:1290,y:clamp(I.airLaneY,120,780)};
    u.escortKind=kind;
  });
}

/* ----- purchases: utility scores from counters + forecast + wave quotas ----- */
function aiPurchaseScores(plan){
  const A=G.ai, I=A.intel, brain=aiBrain(), his=plan.his, mine=plan.mine;
  const cnt=t=>countType(his,t), pcnt=t=>countType(mine,t);
  const s={infantry:26,btr:30,tank:34,mlrs:20,fpv:24,bomber:16,pvo:8,reb:8};
  const ws=A.wave===1?0.75:1+Math.min(0.35,A.wave*0.05);
  const quota={tank:Math.round(3*ws),btr:Math.round(2*ws),infantry:Math.round(3*ws),mlrs:A.wave>2?2:1};
  if(A.phase==='buildup'||A.phase==='stage')
    for(const k in quota) if(cnt(k)<quota[k]) s[k]+=(quota[k]-cnt(k))*13;
  // counters — current threat blended with the forecast of what is coming
  const armorNow=pcnt('tank')*1.4+pcnt('btr')*0.8;
  s.fpv += armorNow*9 + I.armorThreat*20;
  s.tank+= armorNow*4 + I.swarmThreat*6;
  s.btr += pcnt('infantry')*6 + I.swarmThreat*14 + I.artilleryThreat*10;
  s.mlrs+= I.swarmThreat*12 + (plan.playerCluster?Math.min(26,plan.playerCluster.value/22):0) + (plan.suppressionTarget?15:0);
  s.bomber+= pcnt('infantry')*3 + (pcnt('pvo')===0?18:-9) + I.armorThreat*6;
  // air defence deficits are filled BEFORE the drone wave arrives, not after
  s.pvo += Math.max(0,plan.desiredPvo-cnt('pvo'))*46 + I.airThreat*20 + I.missileThreat*15;
  s.reb += Math.max(0,plan.desiredReb-cnt('reb'))*42 + I.airThreat*13;
  if(cnt('pvo')>=plan.desiredPvo&&plan.desiredPvo>0) s.pvo*=0.25;
  if(cnt('reb')>=Math.max(1,plan.desiredReb)) s.reb*=0.3;
  // Rebuild the fist first when badly outnumbered; support can wait unless air is dire.
  const myCombat=forceValue(his.filter(u=>['infantry','btr','tank','mlrs'].includes(u.type)));
  const plCombat=forceValue(mine.filter(u=>['infantry','btr','tank','mlrs'].includes(u.type)));
  if(myCombat<plCombat*0.75){ s.tank+=18; s.btr+=14; s.infantry+=10;
    if(I.airThreat<=1){ s.pvo*=0.75; s.reb*=0.8; } }
  // FPV reserve sized to expected armour; surplus drones are not stockpiled endlessly
  const desiredFpv=clamp(Math.round(armorNow*0.75+I.armorThreat*1.4),0,4);
  if(cnt('fpv')>=desiredFpv&&A.phase!=='assault') s.fpv*=0.45;
  // emergency city defence overrides the long-term plan
  if(plan.cityThreatValue>240||plan.incursionValue>330){
    s.fpv+=26; s.tank+=24; s.btr+=18;
    if(I.airThreat>0.5){ s.pvo+=26; s.reb+=22; }
  }
  // finishing blow on a weak player city
  if(G.city.player<650){ s.tank+=14; s.mlrs+=12; s.fpv+=10; s.pvo*=0.6; }
  for(const k of ORDER) s[k]=(s[k]-DEFS[k].cost*0.025)*(1+rand(-brain.noise,brain.noise));
  return s;
}
function aiBuyUnit(type,plan){
  const cost=DEFS[type].cost; if(G.aiMoney<cost) return false;
  G.aiMoney-=cost;
  const u=spawnUnit('enemy',type); G.ai.stats.plannedBuys++;
  if(type==='pvo') aiAssignNewPvo(u,plan);
  if(u.air&&G.ai.phase!=='assault'&&G.ai.phase!=='defend')
    u.order={mode:'hold',x:1190,y:AI_LANES[G.ai.attackLane]};        // drones wait for the assault window
  return true;
}
function aiDecideBuy(plan){
  const A=G.ai, scores=aiPurchaseScores(plan);
  const sorted=ORDER.map(k=>({k:k,s:scores[k]})).sort((a,b)=>b.s-a.s);
  const emergency=plan.cityThreatValue>240||plan.incursionValue>330;
  // keep a missile in the pocket while preparing the suppression phase
  const reserve=(!emergency&&(A.phase==='stage'||A.phase==='suppress')&&G.aiMissileT<14)?300:0;
  const afford=k=>G.aiMoney-reserve>=DEFS[k].cost;
  const top=sorted[0];
  if(afford(top.k)) return aiBuyUnit(top.k,plan);
  if(!emergency){ const eta=(DEFS[top.k].cost-G.aiMoney)/Math.max(1,DIFF[G.diff].aiIncome);
    if(eta<9&&top.s>sorted[1].s+12) return false; }                   // save up for the planned pick
  for(const e of sorted) if(e.s>8&&afford(e.k)) return aiBuyUnit(e.k,plan);
  if(emergency&&G.aiMoney>=DEFS.infantry.cost) return aiBuyUnit('infantry',plan);
  return false;
}

/* ----- cruise missile: predicted impact, interception risk, timed with the plan ----- */
function aiMaybeMissile(plan){
  const A=G.ai, brain=aiBrain();
  if(G.aiMissileT>0||G.aiMoney<300) return;
  const pvoList=plan.mine.filter(u=>u.type==='pvo'&&u.deployed);
  const riskAt=(tx,ty)=>{ let r=0;
    for(const p of pvoList){ const d=segPointDist(p.x,p.y,W-60,ty,tx,ty);
      if(d<DEFS.pvo.range) r=Math.max(r,(DEFS.pvo.range-d)/DEFS.pvo.range); } return r; };
  let best=null,bestScore=-Infinity;
  for(const anchor of plan.pGround){
    const members=plan.pGround.filter(u=>dist(anchor,u)<150);
    if(members.length<2&&!['pvo','mlrs'].includes(anchor.type)) continue;
    const flight=2.6+Math.hypot(anchor.x-(W-60),0)/270;               // warning time + cruise flight
    const preds=members.map(u=>({u:u,p:predictedPoint(u,flight,brain.lead)}));
    let sw=0,cx=0,cy=0; for(const pr of preds){const w=DEFS[pr.u.type].cost;sw+=w;cx+=pr.p.x*w;cy+=pr.p.y*w;}
    cx/=sw; cy/=sw;
    let expected=0;
    for(const pr of preds) if(Math.hypot(pr.p.x-cx,pr.p.y-cy)<110)
      expected+=unitValue(pr.u)*({pvo:1.3,reb:1.2,mlrs:1.2,tank:1.1}[pr.u.type]||1);
    const risk=riskAt(cx,cy);
    let score=expected*(1-risk*0.78)-risk*95;
    if(A.phase==='suppress'&&plan.suppressionTarget&&members.includes(plan.suppressionTarget)) score+=70;
    if(score>bestScore){bestScore=score;best={x:cx,y:cy};}
  }
  if(G.city.player<280){                                                // finishing strike on the city
    for(const cy of [230,450,670]){ const risk=riskAt(80,cy); const score=330*(1-risk*0.85)-risk*80;
      if(score>bestScore){bestScore=score;best={x:80,y:cy};} }
  }
  const threshold = plan.cityThreatValue>420?360 : A.phase==='suppress'?380 : 600;
  if(best&&bestScore>=threshold){
    G.aiMoney-=300; A.stats.missiles++;
    G.aiMissileT=DIFF[G.diff].missileEvery*rand(0.85,1.2);
    G.warnings.push({x:best.x,y:best.y,t:2.6,side:'enemy',done:false});
    setAlert('[ТРЕВОГА] РАКЕТНАЯ ОПАСНОСТЬ! Цель подсвечена!',true,3);
    log('[ТРЕВОГА] Враг готовит <b>ракетный удар</b>!','bad'); sfx('aa',0.2);
  } else G.aiMissileT=2.5;                                              // hold the missile for a worthwhile target
}

function updateAI(dt){
  const A=G.ai; if(!A) return;
  const brain=aiBrain();
  A.intel.estMoney=clamp(A.intel.estMoney+G.income*dt,0,1600);          // track the player's wallet estimate
  G.aiT-=dt; G.aiMissileT-=dt; A.thinkT-=dt; A.pvoPlanT-=dt;
  if(A.thinkT<=0){
    A.thinkT=brain.think;
    const plan=aiAssess();
    aiUpdatePhase(plan);
    aiPlanPvoPosts(plan);
    aiAssignOrders(plan);
    aiMaybeMissile(plan);
  }
  if(G.aiT<=0){
    G.aiT=rand(1.15,1.9)*DIFF[G.diff].aiAggro;
    if(A.plan) aiDecideBuy(A.plan);
  }
}

/* ---------------- DRAWING ---------------- */
function draw(){
  ctx.save();
  if(G.shake>0) ctx.translate(rand(-G.shake,G.shake),rand(-G.shake,G.shake));
  ctx.drawImage(terrain,0,0);
  for(const cr of G.craters) drawCrater(ctx,cr.x,cr.y,cr.r);
  drawCities();
  for(const wr of G.wrecks) drawWreck(wr);
  // EW radius under units
  for(const u of G.units) if(u.type==='reb'){ ctx.fillStyle=u.side==='player'?'rgba(77,163,255,0.07)':'rgba(255,85,69,0.07)';
    ctx.beginPath(); ctx.arc(u.x,u.y,140+Math.sin(G.time*2.4+u.seed)*5,0,7); ctx.fill();
    ctx.strokeStyle=u.side==='player'?'rgba(77,163,255,0.35)':'rgba(255,85,69,0.35)'; ctx.setLineDash([7,9]); ctx.stroke(); ctx.setLineDash([]); }
  // PVO range hint (player only, faint)
  for(const u of G.units) if(u.type==='pvo'&&u.side==='player'&&u.deployed){ ctx.strokeStyle='rgba(77,163,255,0.14)'; ctx.beginPath(); ctx.arc(u.x,u.y,DEFS.pvo.range,0,7); ctx.stroke(); }
  // ground units
  for(const u of G.units) if(!u.air) drawUnit(u);
  // indirect shadows + bodies below air units
  drawProjectiles(false);
  // air shadows then air units
  for(const u of G.units) if(u.air){ ctx.fillStyle='rgba(0,0,0,0.3)'; ctx.beginPath(); ctx.ellipse(u.x+20,u.y+30,13,6,0,0,7); ctx.fill(); }
  for(const u of G.units) if(u.air) drawUnit(u);
  drawProjectiles(true);
  drawParticles();
  // missile warnings
  for(const w of G.warnings){ const p=0.6+0.4*Math.sin(G.time*10);
    ctx.strokeStyle=`rgba(255,60,40,${p})`; ctx.lineWidth=3; ctx.beginPath(); ctx.arc(w.x,w.y,46*p+18,0,7); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(w.x-58,w.y); ctx.lineTo(w.x+58,w.y); ctx.moveTo(w.x,w.y-58); ctx.lineTo(w.x,w.y+58); ctx.stroke();
    ctx.fillStyle='#ff5545'; ctx.font='bold 19px Arial'; ctx.textAlign='center'; ctx.fillText('ЦЕЛЬ',w.x,w.y-62); }
  // targeting cursor
  if(G.targeting){ ctx.strokeStyle='rgba(255,85,69,0.95)'; ctx.lineWidth=2.5;
    ctx.beginPath(); ctx.arc(mouse.x,mouse.y,52,0,7); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(mouse.x-70,mouse.y); ctx.lineTo(mouse.x+70,mouse.y); ctx.moveTo(mouse.x,mouse.y-70); ctx.lineTo(mouse.x,mouse.y+70); ctx.stroke(); }
  // floaters
  ctx.font='bold 16px Arial'; ctx.textAlign='center';
  for(const f of G.floaters){ ctx.globalAlpha=1-f.life/1.15; ctx.fillStyle=f.col; ctx.fillText(f.txt,f.x,f.y); }
  ctx.globalAlpha=1;
  ctx.restore();
  if(G.controlled&&!G.controlled.dead) drawFPVOverlay(G.controlled);
  if(G.paused&&G.started&&!G.over){ ctx.fillStyle='rgba(0,0,0,0.35)'; ctx.fillRect(0,0,W,H);
    ctx.fillStyle='#fff'; ctx.font='bold 46px Arial'; ctx.textAlign='center'; ctx.fillText('ПАУЗА',W/2,H/2); }
}
function drawCities(){
  for(const s of ['player','enemy']){ const f=G.city[s]/G.cityMax;
    for(const b of buildings[s]){ const dead=f<b.th;
      ctx.fillStyle='rgba(0,0,0,0.3)'; ctx.fillRect(b.x+4,b.y+5,b.w,b.h);
      if(dead){ ctx.fillStyle='#4a443c'; ctx.fillRect(b.x,b.y+b.h*0.25,b.w,b.h*0.65);
        ctx.fillStyle='#655d50'; for(let i=0;i<6;i++) ctx.fillRect(b.x+((b.seed*i*7)%b.w), b.y+b.h*0.3+((b.seed*i*11)%(b.h*0.5)), 7,5); }
      else { ctx.fillStyle=['#9aa3ad','#8b93a0','#a8a090'][b.hue]; ctx.fillRect(b.x,b.y,b.w,b.h);
        ctx.strokeStyle='#565d66'; ctx.lineWidth=2; ctx.strokeRect(b.x,b.y,b.w,b.h);
        ctx.fillStyle='rgba(255,255,255,0.25)'; ctx.fillRect(b.x,b.y,b.w,5);
        ctx.fillStyle='#6d757f'; ctx.fillRect(b.x+b.w*0.2,b.y+b.h*0.25,12,9); ctx.fillRect(b.x+b.w*0.55,b.y+b.h*0.6,10,8);
        ctx.fillStyle='rgba(255,214,120,0.85)'; for(let i=0;i<3;i++) if(((b.seed+i*3)|0)%2) ctx.fillRect(b.x+6+i*13,b.y+b.h-12,5,5); } }
    // side banners
    ctx.fillStyle=SIDE_COLOR[s]; const bx=s==='player'?8:W-26; ctx.fillRect(bx,430,18,44);
    ctx.fillStyle='#fff'; ctx.font='bold 15px Arial'; ctx.textAlign='center'; ctx.fillText(s==='player'?'★':'★',bx+9,458); }
}
function drawWreck(wr){
  ctx.save(); ctx.translate(wr.x,wr.y); ctx.rotate(wr.angle); ctx.globalAlpha=0.92;
  ctx.fillStyle='#2e2a26'; rr(-22,-11,44,22,4); ctx.fillStyle='#211e1a'; rr(-9,-8,20,16,3);
  ctx.strokeStyle='#191613'; ctx.lineWidth=5; ctx.beginPath(); ctx.moveTo(8,4); ctx.lineTo(30,9); ctx.stroke();
  ctx.fillStyle='rgba(255,110,40,0.5)'; ctx.beginPath(); ctx.arc(rand(-4,4),rand(-3,3),rand(2,4.5),0,7); ctx.fill();
  ctx.restore(); ctx.globalAlpha=1;
}
function rr(x,y,w,h,r){ r=Math.min(r,w/2,h/2); ctx.beginPath();
  ctx.moveTo(x+r,y); ctx.lineTo(x+w-r,y); ctx.quadraticCurveTo(x+w,y,x+w,y+r);
  ctx.lineTo(x+w,y+h-r); ctx.quadraticCurveTo(x+w,y+h,x+w-r,y+h);
  ctx.lineTo(x+r,y+h); ctx.quadraticCurveTo(x,y+h,x,y+h-r);
  ctx.lineTo(x,y+r); ctx.quadraticCurveTo(x,y,x+r,y); ctx.closePath(); ctx.fill(); }
function camo(x,y,w,h,seed,cols){ for(let i=0;i<5;i++){ ctx.fillStyle=cols[i%cols.length]; const px=x+((seed*(i+3)*13)%w), py=y+((seed*(i+5)*7)%h);
  const rx=4+((seed*(i+2)*3)%40)/10, ry=3+((seed*(i+4)*2)%24)/10; // deterministic sizes - no flicker
  ctx.beginPath(); ctx.ellipse(px,py,rx,ry,(seed+i)%3,0,7); ctx.fill(); } }
function hpBar(u,w=40){ if(u.hp>=u.maxHp) return; const f=clamp(u.hp/u.maxHp,0,1);
  ctx.fillStyle='rgba(0,0,0,0.55)'; ctx.fillRect(u.x-w/2,u.y-u.radius-15,w,5);
  ctx.fillStyle=f>0.5?'#5fcf5f':f>0.25?'#ffd34d':'#ff5545'; ctx.fillRect(u.x-w/2+0.5,u.y-u.radius-14.5,(w-1)*f,4); }

function drawUnit(u){
  const sideCol=SIDE_COLOR[u.side];
  ctx.save(); ctx.translate(u.x,u.y);
  if(u.type==='infantry'){
    for(let i=0;i<4;i++){ const ox=[-9,0,9,-4][i], oy=[-7,7,-4,10][i]+Math.sin(u.wob+i*1.7)*1.6;
      ctx.fillStyle='rgba(0,0,0,0.3)'; ctx.beginPath(); ctx.ellipse(ox+2,oy+3,5,2.6,0,0,7); ctx.fill();
      ctx.fillStyle='#55613c'; ctx.beginPath(); ctx.arc(ox,oy,4.6,0,7); ctx.fill();           // body/helmet top
      ctx.fillStyle='#3d472c'; ctx.beginPath(); ctx.arc(ox,oy,3,0,7); ctx.fill();
      ctx.strokeStyle='#222'; ctx.lineWidth=2; ctx.beginPath(); ctx.moveTo(ox,oy); ctx.lineTo(ox+Math.cos(u.turret)*9,oy+Math.sin(u.turret)*9); ctx.stroke(); }
    ctx.fillStyle=sideCol; ctx.fillRect(-3,-16,6,3);
  }
  else if(u.type==='fpv'||u.type==='bomber'){
    const dive = u.type==='fpv'&&u.target&&!u.target.dead ? clamp(1-dist(u,u.target)/170,0,1):0;
    ctx.rotate(u.angle); const s=1+dive*0.35; ctx.scale(s,s);
    ctx.strokeStyle='#1c1c1c'; ctx.lineWidth=3.4;
    ctx.beginPath(); ctx.moveTo(-9,-9); ctx.lineTo(9,9); ctx.moveTo(9,-9); ctx.lineTo(-9,9); ctx.stroke();
    for(const [px,py] of [[-10,-10],[10,-10],[-10,10],[10,10]]){ ctx.fillStyle='rgba(220,230,240,0.4)'; ctx.beginPath(); ctx.arc(px,py,7,0,7); ctx.fill();
      ctx.strokeStyle='rgba(40,40,40,0.7)'; ctx.lineWidth=1.4; const a=G.time*40+px; ctx.beginPath(); ctx.moveTo(px+Math.cos(a)*6.4,py+Math.sin(a)*6.4); ctx.lineTo(px-Math.cos(a)*6.4,py-Math.sin(a)*6.4); ctx.stroke(); }
    ctx.fillStyle=u.type==='fpv'?'#33383e':'#3c4148'; rr(-6,-4.5,12,9,3);
    if(u.type==='fpv'){ ctx.fillStyle='#c98a2d'; ctx.beginPath(); ctx.moveTo(6,-3); ctx.lineTo(15,0); ctx.lineTo(6,3); ctx.fill(); } // warhead cone
    else { ctx.fillStyle='#222'; for(let i=0;i<u.ammo;i++) ctx.fillRect(-4+i*4.4,5,3,5); }
    ctx.fillStyle=sideCol; ctx.fillRect(-2,-2,4,4);
    if(u.jamT>0.05){ ctx.fillStyle='#8fd0ff'; ctx.font='bold 13px Arial'; ctx.textAlign='center'; ctx.fillText('РЭБ',0,-17); }
    if(u===G.controlled){ ctx.strokeStyle='#ffd34d'; ctx.lineWidth=2; ctx.beginPath(); ctx.arc(0,0,21+Math.sin(G.time*6)*2,0,7); ctx.stroke(); }
  }
  else {
    // shadow
    ctx.fillStyle='rgba(0,0,0,0.28)'; ctx.beginPath(); ctx.ellipse(4,6,u.radius+6,u.radius*0.62,u.angle,0,7); ctx.fill();
    ctx.rotate(u.angle);
    const hull='#4d5c38', hull2='#5d6f43', dark='#39442a', cols=['rgba(70,82,48,0.8)','rgba(96,104,64,0.8)','rgba(60,58,40,0.75)'];
    if(u.type==='tank'){
      // tracks with animated treads
      for(const ty of [-14,14]){ ctx.fillStyle='#23251f'; rr(-24,ty-5,48,10,4); ctx.fillStyle='#3a3d35';
        for(let i=0;i<6;i++) ctx.fillRect(-21+((i*9+u.track)%44),ty-3.4,4.4,6.8); }
      ctx.fillStyle=hull; rr(-23,-12,46,24,5); camo(-20,-10,38,18,u.seed,cols);
      ctx.fillStyle=dark; for(let i=0;i<5;i++) ctx.fillRect(6+i*3.4,-11,2.6,22); // ERA front
      // turret
      ctx.save(); ctx.rotate(u.turret-u.angle); ctx.translate(-u.recoil*3.5,0);
      ctx.fillStyle='#26301f'; ctx.fillRect(2,-2.6,33,5.2); ctx.fillStyle='#171c13'; ctx.fillRect(30,-3.4,6,6.8); // barrel
      ctx.fillStyle=hull2; rr(-11,-9.5,23,19,6); camo(-9,-8,17,14,u.seed+7,cols);
      ctx.fillStyle=dark; ctx.beginPath(); ctx.arc(-4,0,4.2,0,7); ctx.fill(); ctx.restore();
      ctx.fillStyle=sideCol; ctx.fillRect(-22,-2.5,7,5);
    }
    else if(u.type==='btr'){
      ctx.fillStyle='#1f211c'; for(const wy of [-13,13]) for(const wx of [-17,-6,6,17]){ ctx.beginPath(); ctx.arc(wx,wy,5,0,7); ctx.fill(); }
      ctx.fillStyle=hull; rr(-23,-10.5,46,21,7); camo(-20,-9,38,16,u.seed,cols);
      ctx.save(); ctx.rotate(u.turret-u.angle); ctx.fillStyle='#26301f'; ctx.fillRect(0,-1.8,24,3.6);
      ctx.fillStyle=hull2; ctx.beginPath(); ctx.arc(0,0,7.5,0,7); ctx.fill(); ctx.restore();
      ctx.fillStyle=sideCol; ctx.fillRect(-21,-2.5,7,5);
    }
    else if(u.type==='mlrs'){
      ctx.fillStyle='#1f211c'; for(const wy of [-11,11]) for(const wx of [-16,-2,14]){ ctx.beginPath(); ctx.arc(wx,wy,4.6,0,7); ctx.fill(); }
      ctx.fillStyle=hull; rr(-23,-10,46,20,4);
      ctx.fillStyle='#9fc4d8'; ctx.fillRect(13,-8,8,16); // windshield
      const up=u.salvo>0?3:0; ctx.fillStyle='#57683f'; rr(-22,-9.5-up*0.4,30,19,3);
      ctx.fillStyle='#2c3524'; for(let r=0;r<3;r++) for(let cc=0;cc<5;cc++) ctx.fillRect(-20+cc*5.8,-7+r*5.4-up*0.4,4.4,3.6); // tubes
      ctx.fillStyle=sideCol; ctx.fillRect(8,-2.5,6,5);
    }
    else if(u.type==='pvo'){
      ctx.fillStyle='#1f211c'; for(const wy of [-11,11]) for(const wx of [-16,0,16]){ ctx.beginPath(); ctx.arc(wx,wy,4.8,0,7); ctx.fill(); }
      if(u.deployed){ ctx.strokeStyle='#333'; ctx.lineWidth=3; for(const [ox,oy] of [[-18,-17],[18,-17],[-18,17],[18,17]]){ ctx.beginPath(); ctx.moveTo(ox*0.6,oy*0.6); ctx.lineTo(ox,oy); ctx.stroke(); } }
      ctx.fillStyle=hull; rr(-23,-10,46,20,4); camo(-20,-8,36,15,u.seed,cols);
      // rotating radar
      ctx.save(); ctx.translate(-11,0); ctx.rotate(u.radar); ctx.fillStyle='#788a5a'; ctx.fillRect(-3,-11,6,22);
      ctx.fillStyle='#a9bd8a'; ctx.fillRect(-3,-11,6,4); ctx.restore();
      ctx.save(); ctx.translate(8,0); ctx.rotate(u.turret-u.angle);
      ctx.fillStyle='#26301f'; ctx.fillRect(4,-6,20,3); ctx.fillRect(4,3,20,3); // cannons
      ctx.fillStyle=hull2; rr(-6,-8,14,16,3); ctx.fillStyle='#c9563c'; ctx.fillRect(2,-8,5,5); ctx.fillRect(2,3,5,5); ctx.restore(); // missile pods
      ctx.fillStyle=sideCol; ctx.fillRect(-22,-2.5,6,5);
    }
    else if(u.type==='reb'){
      ctx.fillStyle='#1f211c'; for(const wy of [-11,11]) for(const wx of [-15,1,15]){ ctx.beginPath(); ctx.arc(wx,wy,4.6,0,7); ctx.fill(); }
      ctx.fillStyle='#5a5f4c'; rr(-22,-10,44,20,4); ctx.fillStyle='#6d725c'; rr(-19,-8,26,16,3);
      ctx.fillStyle='#9fc4d8'; ctx.fillRect(12,-7.5,7,15);
      ctx.strokeStyle='#222'; ctx.lineWidth=1.7;
      for(const ax of [-14,-6,3]){ ctx.beginPath(); ctx.moveTo(ax,0); ctx.lineTo(ax-5,-19); ctx.stroke(); ctx.beginPath(); ctx.moveTo(ax,0); ctx.lineTo(ax-5,19); ctx.stroke(); }
      const pulse=(G.time*40+u.seed)%46; ctx.strokeStyle=u.side==='player'?'rgba(77,163,255,0.65)':'rgba(255,85,69,0.65)';
      ctx.beginPath(); ctx.arc(-6,0,pulse,0,7); ctx.stroke();
      ctx.fillStyle=sideCol; ctx.fillRect(-21,-2.5,6,5);
    }
    if(u.hp<u.maxHp*0.35&&G.started&&!G.paused&&Math.random()<0.18) spawnParticles(u.x,u.y,1,'smoke');
  }
  ctx.restore();
  hpBar(u, u.air?30:44);
}
function drawProjectiles(airLayer){
  for(const p of G.projectiles){
    if(p.kind==='indirect'){
      const t=clamp(p.t,0,1), x=lerp(p.sx,p.tx,t), gy=lerp(p.sy,p.ty,t);
      const h= p.sub==='bomb' ? (1-t)*70 : Math.sin(Math.PI*t)*p.height;
      if(!airLayer){ ctx.fillStyle='rgba(0,0,0,0.3)'; ctx.beginPath(); ctx.ellipse(x,gy,6,3,0,0,7); ctx.fill();
        if(p.sub==='rocket'){ ctx.strokeStyle='rgba(255,80,50,0.5)'; ctx.beginPath(); ctx.arc(p.tx,p.ty,7,0,7); ctx.stroke(); } continue; }
      const y=gy-h, ang=Math.atan2(p.ty-p.sy,p.tx-p.sx)+(p.sub==='rocket'?(t<0.5?-0.5:0.5)*(1-Math.abs(t-0.5)*2):Math.PI/2);
      ctx.save(); ctx.translate(x,y); ctx.rotate(ang);
      if(p.sub==='rocket'){ ctx.fillStyle='#d8d3c8'; rr(-9,-2.4,16,4.8,2); ctx.fillStyle='#ff9a3c'; ctx.beginPath(); ctx.moveTo(-9,-3); ctx.lineTo(-16-rand(5),0); ctx.lineTo(-9,3); ctx.fill(); }
      else { ctx.fillStyle='#2c2f26'; rr(-2.4,-6,4.8,11,2); ctx.fillStyle='#888'; ctx.fillRect(-4,-8,8,3); }
      ctx.restore();
    }
    else if(!airLayer&&(p.kind==='bullet'||p.kind==='shell')){
      ctx.strokeStyle=p.kind==='shell'?'rgba(255,200,110,0.95)':'rgba(255,240,170,0.85)'; ctx.lineWidth=p.kind==='shell'?3.2:1.8;
      const a=Math.atan2((p.ty===undefined?p.y:p.ty)-p.y,(p.tx===undefined?p.x:p.tx)-p.x);
      ctx.beginPath(); ctx.moveTo(p.x-Math.cos(a)*(p.kind==='shell'?15:10),p.y-Math.sin(a)*(p.kind==='shell'?15:10)); ctx.lineTo(p.x,p.y); ctx.stroke();
      if(p.kind==='shell'){ ctx.fillStyle='#ffe9a3'; ctx.beginPath(); ctx.arc(p.x,p.y,3,0,7); ctx.fill(); }
    }
    else if(airLayer&&(p.kind==='aa'||p.kind==='cruise')){
      if(p.kind==='aa'){ const a=Math.atan2((p.ty===undefined?p.y:p.ty)-p.y,(p.tx===undefined?p.x:p.tx)-p.x); ctx.save(); ctx.translate(p.x,p.y); ctx.rotate(a);
        ctx.fillStyle='#e8e4da'; rr(-7,-2,13,4,2); ctx.fillStyle='#ff9a3c'; ctx.beginPath(); ctx.moveTo(-7,-2.4); ctx.lineTo(-13,0); ctx.lineTo(-7,2.4); ctx.fill(); ctx.restore(); }
      else { ctx.fillStyle='rgba(0,0,0,0.3)'; ctx.beginPath(); ctx.ellipse(p.x+16,p.y+24,15,5,p.angle||0,0,7); ctx.fill();
        ctx.save(); ctx.translate(p.x,p.y); ctx.rotate(p.angle||0);
        ctx.fillStyle='#cfd4da'; rr(-19,-4.4,36,8.8,4); ctx.fillStyle='#8f979f'; ctx.fillRect(-4,-13,10,7); ctx.fillRect(-4,6,10,7); // wings
        ctx.fillStyle='#c23b2a'; ctx.beginPath(); ctx.moveTo(17,-4); ctx.lineTo(26,0); ctx.lineTo(17,4); ctx.fill();
        ctx.fillStyle='#ffb347'; ctx.beginPath(); ctx.moveTo(-19,-3.4); ctx.lineTo(-29-rand(7),0); ctx.lineTo(-19,3.4); ctx.fill(); ctx.restore();
        if(p.hp<p.maxHp){ ctx.fillStyle='rgba(0,0,0,0.55)'; ctx.fillRect(p.x-18,p.y-24,36,5); ctx.fillStyle='#ff8d80'; ctx.fillRect(p.x-17.5,p.y-23.5,35*clamp(p.hp/p.maxHp,0,1),4); } }
    }
  }
}
function drawParticles(){
  for(const p of G.particles){ const f=1-p.life/p.max;
    if(p.kind==='ring'){ ctx.strokeStyle=`rgba(255,220,170,${0.75*f})`; ctx.lineWidth=3.4*f+0.6; ctx.beginPath(); ctx.arc(p.x,p.y,p.size,0,7); ctx.stroke(); }
    else if(p.kind==='smoke'){ ctx.fillStyle=`rgba(${p.col},${0.34*f})`; ctx.beginPath(); ctx.arc(p.x,p.y,p.size,0,7); ctx.fill(); }
    else { ctx.globalAlpha=f; ctx.fillStyle=p.col; ctx.beginPath(); ctx.arc(p.x,p.y,p.size*f+0.5,0,7); ctx.fill(); ctx.globalAlpha=1; } }
}
function drawFPVOverlay(u){
  ctx.fillStyle='rgba(0,0,0,0.14)'; ctx.fillRect(0,0,W,26); ctx.fillRect(0,H-26,W,26);
  for(let i=0;i<7;i++){ ctx.fillStyle=`rgba(255,255,255,${rand(0.03,0.1)})`; ctx.fillRect(0,rand(H),W,rand(1,3)); } // signal noise
  ctx.strokeStyle='#7dff8a'; ctx.lineWidth=2;
  ctx.beginPath(); ctx.arc(u.x,u.y,34,0,7); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(u.x-52,u.y); ctx.lineTo(u.x-16,u.y); ctx.moveTo(u.x+16,u.y); ctx.lineTo(u.x+52,u.y);
  ctx.moveTo(u.x,u.y-52); ctx.lineTo(u.x,u.y-16); ctx.moveTo(u.x,u.y+16); ctx.lineTo(u.x,u.y+52); ctx.stroke();
  ctx.strokeStyle='rgba(125,255,138,0.6)'; ctx.beginPath(); ctx.moveTo(u.x,u.y); ctx.lineTo(mouse.x,mouse.y); ctx.stroke();
  ctx.fillStyle='#7dff8a'; ctx.font='bold 20px monospace'; ctx.textAlign='left';
  const jam=u.jamT>0.05; ctx.fillText(`FPV-CAM ● REC  ${jam?'!! РЭБ! СИГНАЛ ТЕРЯЕТСЯ':'СИГНАЛ ▂▄▆█'}  БАТ ${Math.max(8,86-(G.time*1.4|0)%70)}%`,22,42);
  ctx.textAlign='right'; ctx.fillText('ESC — отпустить дрон',W-22,42);
}

/* ---------------- GAME FLOW ---------------- */
function endGame(win){
  if(G.over) return; G.over=true; G.controlled=null;
  for(let i=0;i<7;i++) spawnExplosion(win?rand(W-CITY_W,W-10):rand(10,CITY_W), rand(120,H-120), 1.5);
  $('over-title').textContent=win?'ПОБЕДА!':'ГОРОД ПАЛ…';
  $('over-text').textContent=win?'Город противника уничтожен. Линия фронта прорвана, командир!':'Твой город разрушен. Но штаб уже готовит контрнаступление…';
  $('over-stats').innerHTML=`Время боя: <b>${fmtTime(G.time)}</b> &nbsp; Подбито техники врага: <b>${G.kills}</b> &nbsp; Свои потери: <b>${G.losses}</b>`;
  $('screen-over').classList.remove('hidden'); sfx('boom',0.5);
}
function takeControlFPV(){
  const cands=G.units.filter(u=>u.side==='player'&&u.type==='fpv'&&!u.dead);
  if(!cands.length){ setAlert('Нет своих FPV в воздухе! Купи клавишей 5',false,2.5); return; }
  cands.sort((a,b)=>dist(a,mouse)-dist(b,mouse));
  if(G.controlled) G.controlled.manual=false;
  G.controlled=cands[0]; G.controlled.manual=true;
  setAlert('[FPV] ТЫ ВЕДЁШЬ ДРОН! Мышь — курс. Врежься в технику врага!',true,4); log('[FPV] <b>Ручное управление</b> включено','good');
}

/* ---------------- INPUT ---------------- */
function canvasPos(e){ const r=cvs.getBoundingClientRect(); return {x:(e.clientX-r.left)/r.width*W, y:(e.clientY-r.top)/r.height*H}; }
cvs.addEventListener('mousemove',e=>{ const p=canvasPos(e); mouse.x=p.x; mouse.y=p.y; });
cvs.addEventListener('click',e=>{ initAudio(); const p=canvasPos(e); mouse.x=p.x; mouse.y=p.y;
  if(!G.started||G.over) return;
  if(G.targeting){ G.targeting=false; cvs.classList.remove('targeting');
    if(G.money>=MISSILE.cost&&G.missileCd<=0){ G.money-=MISSILE.cost; G.missileCd=MISSILE.cd; launchMissile('player',p.x,p.y); } return; }
  const f=G.units.find(u=>u.side==='player'&&u.type==='fpv'&&dist(u,p)<34);
  if(f){ if(G.controlled)G.controlled.manual=false; G.controlled=f; f.manual=true; setAlert('[FPV] ТЫ ВЕДЁШЬ ДРОН!',true,3); }
});
window.addEventListener('keydown',e=>{
  if(e.code==='Space'){ e.preventDefault(); togglePause(); return; }
  if(G&&!G.started&&e.key==='Enter'){ e.preventDefault(); frontlineStart(); return; }
  if(e.key==='Escape'){ if(G.targeting){G.targeting=false;cvs.classList.remove('targeting');}
    if(G.controlled){G.controlled.manual=false;G.controlled=null;setAlert('FPV перешёл на автопилот',false,2);} return; }
  if(!G.started||G.over) return;
  const n=parseInt(e.key,10);
  if(n>=1&&n<=8) buy(ORDER[n-1]);
  else if(n===9||e.key==='r'||e.key==='R'||e.key==='к'||e.key==='К') armMissile();
  else if(e.key==='f'||e.key==='F'||e.key==='а'||e.key==='А') takeControlFPV();
});
function togglePause(){ if(!G.started||G.over)return; G.paused=!G.paused; $('btn-pause').textContent=G.paused?'ПРОДОЛЖИТЬ':'ПАУЗА'; }
$('btn-pause').onclick=()=>{initAudio();togglePause();};
$('btn-speed').onclick=function(){ initAudio(); G.speed=G.speed===1?2:1; this.textContent='СКОРОСТЬ ×'+G.speed; };
$('btn-sound').onclick=function(){ soundOn=!soundOn; this.textContent=soundOn?'ЗВУК: ВКЛ':'ЗВУК: ВЫКЛ'; if(soundOn)initAudio(); };
$('btn-restart').onclick=()=>{ initAudio(); const was=G.started; resetGame(); G.started=was; $('screen-over').classList.add('hidden'); if(!was)$('screen-start').classList.remove('hidden'); $('btn-pause').textContent='ПАУЗА'; };
$('btn-help').onclick=()=>$('screen-help').classList.remove('hidden');
$('btn-help-close').onclick=()=>$('screen-help').classList.add('hidden');
$('ui-diff').onchange=function(){ G.diff=parseInt(this.value,10); log('Сложность изменена: <b>'+this.options[this.selectedIndex].text+'</b>'); };
function frontlineStart(){
  if(!G||G.started||G.over) return;             // guard: inline onclick + listener may both fire
  try{ initAudio(); }catch(e){}                  // audio must never block the start
  G.started=true; window.__wantStart=false;
  $('screen-start').classList.add('hidden');
  setAlert('Бой начался! Строй пехоту и БТР (1, 2), копи на танк и ПВО',true,5);
  log('[ШТАБ] Бой начался. Удачи, командир!','good');
  spawnUnit('player','infantry'); spawnUnit('enemy','infantry'); // opening skirmish
}
window.startGame=frontlineStart;
$('btn-start').addEventListener('click',frontlineStart);
$('btn-again').onclick=()=>{ initAudio(); resetGame(); G.started=true; $('screen-over').classList.add('hidden'); spawnUnit('player','infantry'); spawnUnit('enemy','infantry'); };

/* ---------------- MAIN LOOP ---------------- */
let last=performance.now(), uiT=0;
function loop(now){
  requestAnimationFrame(loop);
  let dt=Math.min(0.05,(now-last)/1000); last=now;
  if(G.started&&!G.paused&&!G.over){ const sdt=dt*G.speed; const steps=G.speed; for(let i=0;i<steps;i++) update(sdt/steps); }
  else if(G.over){ // keep explosions/smoke alive behind the panel
    for(const p of G.particles){ p.life+=dt; if(p.kind!=='ring'){p.x+=p.vx*dt;p.y+=p.vy*dt;} } G.particles=G.particles.filter(p=>p.life<p.max); }
  draw();
  uiT-=dt; if(uiT<=0){ uiT=0.12; updateHUD(); }
}
/* ---------------- BOOT ---------------- */
makeTerrain(); resetGame(); buildShop(); updateHUD();
if(window.__wantStart) frontlineStart();              // player clicked while script was loading
requestAnimationFrame(loop);
