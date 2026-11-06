import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import {clamp,distance,stepCar} from './logic.js';
import {createTaxi,animateTaxi} from './vehicle.js';
import {createPedestrians,createPassenger,posePassenger} from './pedestrians.js';
import {curbLocation,makeBoarding,boardingPose} from './trips.js';
import {createTrafficGeometry} from './traffic-model.js';
import {loadCityAssets} from './city-assets.js';
import {districtIndex,buildingTemplate} from './city-templates.js';
const $=id=>document.getElementById(id);
const districts=['Центр','Спальный район','Промзона','Набережная','Вокзал','Ночной рынок','Заброшенный район','Пригород'];
const jobs=[
 {name:'Последний пассажир',person:'Студентка с вокзала',from:'Вокзал',to:'Спальный район',pickup:{x:0,z:160},drop:{x:240,z:320},pay:580,story:'«Только не спрашивайте, почему я так поздно.»'},
 {name:'Ночной экспресс',person:'Медсестра после смены',from:'Больница',to:'Набережная',pickup:{x:320,z:320},drop:{x:320,z:-160},pay:650,story:'«Сегодня город какой-то особенно тихий.»'},
 {name:'Тихий маршрут',person:'Музыкант с гитарой',from:'Ночной рынок',to:'Центр',pickup:{x:160,z:-160},drop:{x:0,z:0},pay:720,story:'«Слышали этот сигнал по радио? Его нет ни на одной частоте.»'},
 {name:'Тревожный сигнал',person:'Курьер с конвертом',from:'Промзона',to:'Пригород',pickup:{x:-240,z:0},drop:{x:-320,z:320},pay:780,story:'«На конверте нет адреса. Только номер дома, которого больше нет.»'},
 {name:'Последний район',person:'Таинственная женщина',from:'Гостиница',to:'Заброшенный район',pickup:{x:-240,z:320},drop:{x:-320,z:-320},pay:950,story:'«Если увидите свет в окне, не останавливайтесь.»'}
];
for(const job of jobs){const p=curbLocation(job.pickup),d=curbLocation(job.drop);job.pickup=p.stop;job.pickupWait=p.wait;job.drop=d.stop;}
const cars=[{name:'Волга-Комфорт',price:0,top:17,consumption:1,color:0xc0a346},{name:'Crown Night',price:6500,top:21,consumption:1.2,color:0x343943},{name:'Райдер-минивэн',price:9000,top:16,consumption:1.35,color:0xa2aaa5}];
const defaults={version:2,money:2450,fuel:80,condition:100,rating:5,trips:0,order:0,stage:'offer',clock:14,auto:false,cameraSensitivity:1,quality:'Среднее',car:0,owned:[0],leftHanded:false,haptics:true,reduceMotion:false,shift:1,shiftTrips:0,shiftIncome:0,journal:[],x:0,z:0,heading:0,camera:1};
let s;try{const saved=JSON.parse(localStorage.getItem('nightTaxi3D')||'{}');s={...defaults,...saved,paused:false};if(!cars[s.car]||!jobs[s.order%jobs.length])s={...defaults,paused:false}}catch{s={...defaults,paused:false}}
// Every launch starts in the cabin; the camera button can still cycle views during play.
s.camera=1;
function save(){try{localStorage.setItem('nightTaxi3D',JSON.stringify(s))}catch{}}
function buzz(){if(s.haptics&&navigator.vibrate)navigator.vibrate(30)}
let toastTimer;function toast(t){$('toast').textContent=t;$('toast').classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('toast').classList.remove('show'),3000)}
const scene=new THREE.Scene();scene.background=new THREE.Color(0x101d26);scene.fog=new THREE.Fog(0x101d26,130,500);
let renderer;
try { renderer=new THREE.WebGLRenderer({antialias:false,powerPreference:'high-performance'}); }
catch(error){
  $('renderError').classList.remove('hidden');
  document.querySelector('.touch-controls').classList.add('hidden');
  throw new Error('WebGL недоступен: '+error.message);
}
renderer.setPixelRatio(Math.min(devicePixelRatio,1.3));renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.2;renderer.domElement.id='worldCanvas';$('scene').prepend(renderer.domElement);
const camera=new THREE.PerspectiveCamera(60,1,.1,700);scene.add(new THREE.HemisphereLight(0xaec8d1,0x384039,2.1));scene.add(new THREE.AmbientLight(0x8a9899,.5));const moon=new THREE.DirectionalLight(0x728eaa,1.2);moon.position.set(80,120,30);scene.add(moon);
const mat=(color,extra={})=>new THREE.MeshStandardMaterial({color,roughness:.8,...extra});
const roadMat=mat(0x1b2d34,{roughness:.45,metalness:.15}), groundMat=mat(0x263332), white=mat(0x9c9c83,{emissive:0x38352b}), yellow=mat(0xe1bb68,{emissive:0x5b3d0c}), concrete=mat(0x4c5557), glass=mat(0x324851,{emissive:0x13232a}), dark=mat(0x10191b), windowMat=mat(0xd4aa69,{emissive:0x735021});
function box(w,h,d,material,x,y,z,parent=scene){const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),material);m.position.set(x,y,z);parent.add(m);return m}
box(900,.1,900,groundMat,0,-.1,0);
// Roads and markings form a traversable grid, with buildings only inside blocks.
for(let n=-4;n<=4;n++){box(820,.08,20,roadMat,0,.01,n*80);box(20,.08,820,roadMat,n*80,.02,0);for(let i=-380;i<=380;i+=14){box(6,.02,.18,white,i,.07,n*80);box(.18,.02,6,white,n*80,.08,i)}}
// Pavements, crossings and facades make the procedural city easier to read from the cabin.
for(let n=-4;n<=4;n++){for(let side of [-1,1])for(let m=-4;m<4;m++){box(58,.18,2,concrete,m*80+40,.09,n*80+side*11);box(2,.18,58,concrete,n*80+side*11,.09,m*80+40)}for(let m=-4;m<=4;m++)for(let k=-3;k<=3;k++){box(1.2,.025,4,white,n*80+k*2,.09,m*80+7);box(4,.025,1.2,white,n*80+7,.10,m*80+k*2)}}
const cityLandmarks=[];
const neonTeal=mat(0x3ba59d,{emissive:0x176c66,emissiveIntensity:.9}),neonRose=mat(0xd07181,{emissive:0x8b263f,emissiveIntensity:.8}),rust=mat(0x69483d),unlitWindow=mat(0x202c30);
const buildingMats=[mat(0x465156),mat(0x57544d),mat(0x394950),mat(0x65594d)];
for(let gx=-4;gx<4;gx++)for(let gz=-4;gz<4;gz++)for(let a=0;a<2;a++)for(let b=0;b<2;b++){
 const x=gx*80+22+a*35,z=gz*80+22+b*35,seed=Math.abs((gx*127+gz*71+a*29+b*13)%11),template=buildingTemplate(x,z,seed),height=template.height;
 if(Math.abs(gx)<=1&&Math.abs(gz)<=1&&a===0&&b===0){
  const fallback=new THREE.Group();box(23,height,23,buildingMats[seed%4],x,height/2,z,fallback);scene.add(fallback);
  cityLandmarks.push({x,z,fallback,name:['building-a','building-c','building-f'][cityLandmarks.length%3]});continue;
 }
 box(23,height,23,buildingMats[seed%4],x,height/2,z);
 box(23.5,.5,23.5,concrete,x,height+.25,z);box(4,3,.18,glass,x,1.5,z-11.6);
 box(5,.25,1.1,concrete,x,3.2,z-11.8);box(.18,3,3,glass,x-11.6,1.5,z);
 if(seed%3===0)box(2,2,2,concrete,x+5,height+1,z+5);
 // Simple repeated facade templates: landmarks without expensive per-frame updates.
 if(template.style==='office'){box(12,.32,.25,neonTeal,x,4.5,z-11.7);for(let y=7;y<height;y+=7)box(20,.18,.18,concrete,x,y,z-11.62)}
 else if(template.style==='residential'){for(let y=7;y<height;y+=6){box(6,.22,1.6,concrete,x+5,y,z-12.3);box(6,.12,.12,dark,x+5,y+.8,z-13)}}
 else if(template.style==='industrial'){box(20,.75,.3,rust,x,3,z-11.7);for(let k=-7;k<=7;k+=7)box(4,5,.2,dark,x+k,2.7,z-11.65)}
 else if(template.style==='waterfront'){box(16,.3,.25,neonTeal,x,4,z-11.7);box(6,.15,2,concrete,x,3.4,z-12.1)}
 else if(template.style==='station'){box(14,.45,.25,yellow,x,4.5,z-11.7);box(9,.2,2,concrete,x,3.3,z-12.3)}
 else if(template.style==='market'){box(17,.35,.25,neonRose,x,4.1,z-11.7);box(15,.18,2.5,neonTeal,x,3,z-12.4)}
 else if(template.style==='abandoned'){box(15,.2,.25,rust,x,3.8,z-11.7);box(5,3,.2,unlitWindow,x,5.5,z-11.7)}
 else {box(15,.4,15,buildingMats[seed%4],x,height+.55,z);box(8,.2,2,concrete,x,3,z-12)}
 for(let floor=4;floor<height-2;floor+=6)for(let k=-7;k<=7;k+=7){if((seed+floor+k)%3!==0){box(3,2,.15,windowMat,x+k,floor,z-11.6);box(.15,2,3,windowMat,x-11.6,floor,z+k);box(3,2,.15,windowMat,x+k,floor,z+11.6);box(.15,2,3,windowMat,x+11.6,floor,z+k)}}
}
// Sparse lamps and neon remain unlit geometry on mobile, avoiding expensive realtime shadows.
for(let i=-4;i<=4;i++)for(let j=-4;j<=4;j++){let x=i*80+12,z=j*80+12;box(.5,7,.5,concrete,x,3.5,z);box(2,.5,1,yellow,x,7,z)}
// Modular bus shelters and neon signs placed beyond the roadway.
for(const [x,z] of [[-13,35],[13,115],[147,35],[-147,-45],[227,195],[-227,-125]]){
 box(.25,3,.25,concrete,x,1.5,z-3);box(.25,3,.25,concrete,x,1.5,z+3);box(2.8,.2,6.4,concrete,x,3,z);box(.1,2,5.5,glass,x+1.2,1.4,z);box(2,.2,3,concrete,x,0.6,z);
}
// Sidewalk furniture, greenery, shop fronts and street lights are merged with the city.
const foliage=mat(0x345c47), trunk=mat(0x59473c), benchWood=mat(0x98734f), lampPool=new THREE.MeshBasicMaterial({color:0xe9b96b,transparent:true,opacity:.10,depthWrite:false,side:THREE.DoubleSide});
for(let i=-4;i<=4;i++)for(let j=-4;j<=4;j++){
 const x=i*80,z=j*80;
 for(const side of [-1,1]){
  const tx=x+side*14,tz=z+26;
  box(.4,2,.4,trunk,tx,1,tz);const crown=new THREE.Mesh(new THREE.ConeGeometry(2.3,4.5,8),foliage);crown.position.set(tx,4.1,tz);scene.add(crown);
  box(.3,1.1,.3,concrete,x+side*13.5,.55,z-20);box(2.8,.18,.7,benchWood,x+side*13.5,.75,z-20);
  for(let k=0;k<3;k++)box(2.8,.13,.13,benchWood,x+side*13.5,1.05+k*.2,z-20.35);
 }
 const pool=new THREE.Mesh(new THREE.CircleGeometry(5,16),lampPool);pool.rotation.x=-Math.PI/2;pool.position.set(x+12,.12,z+12);scene.add(pool);
 // Compact glowing traffic lights at crossings, no realtime shadow lights.
 box(.16,4,.16,dark,x-10.7,2,z-10.7);box(.55,1.4,.35,dark,x-10.7,4,z-10.7);
 box(.26,.26,.37,(i+j)%2?neonTeal:neonRose,x-10.7,4.15,z-10.7);
}
for(let gx=-4;gx<4;gx++)for(let gz=-4;gz<4;gz++){
 const x=gx*80+40,z=gz*80+11.8;
 box(9,.9,.18,(gx+gz)%2?neonTeal:neonRose,x,3.6,z);
 box(7.8,1.5,.16,glass,x,1.65,z);box(.16,1.7,.2,concrete,x,1.65,z-.05);
}
// Merge static city geometry by material to keep mobile draw calls bounded.
const staticGroups=new Map();for(const object of [...scene.children]){if(!object.isMesh)continue;object.updateMatrix();const geometry=object.geometry.clone();geometry.applyMatrix4(object.matrix);if(!staticGroups.has(object.material))staticGroups.set(object.material,[]);staticGroups.get(object.material).push(geometry);scene.remove(object);object.geometry.dispose()}
for(const [material,geometries] of staticGroups){const merged=mergeGeometries(geometries);for(const geometry of geometries)geometry.dispose();scene.add(new THREE.Mesh(merged,material))}
loadCityAssets(scene,cityLandmarks);
const pedestrians=createPedestrians(scene);
let model=createTaxi(cars[s.car].color,s.car), player=model.group;scene.add(player);
function changeVehicle(index){player.remove(seatedPassenger);scene.remove(player);player.traverse(o=>{if(o.geometry)o.geometry.dispose();if(o.material){const materials=Array.isArray(o.material)?o.material:[o.material];for(const material of materials)material.dispose()}});model=createTaxi(cars[index].color,index);player=model.group;scene.add(player);attachSeatedPassenger()}
const marker=new THREE.Group();scene.add(marker);const ring=new THREE.Mesh(new THREE.TorusGeometry(5,.3,8,40),new THREE.MeshBasicMaterial({color:0xeabc64}));ring.rotation.x=Math.PI/2;marker.add(ring);const beam=new THREE.Mesh(new THREE.CylinderGeometry(.35,2.3,18,12,1,true),new THREE.MeshBasicMaterial({color:0xffc96a,transparent:true,opacity:.2,side:THREE.DoubleSide,depthWrite:false}));beam.position.y=9;marker.add(beam);
// NPC meshes use the combined-colour geometry technique from Трасса.
const trafficGeometries=['#6a767c','#764b41','#394a5d'].map(createTrafficGeometry);
const trafficMaterial=new THREE.MeshStandardMaterial({vertexColors:true,roughness:.65});
const traffic=[];for(let i=0;i<18;i++){const t=new THREE.Mesh(trafficGeometries[i%3],trafficMaterial);scene.add(t);traffic.push({mesh:t,axis:i%2,road:((i%7)-3)*80,pos:-350+i*70,dir:i%4<2?1:-1})}
const passenger=createPassenger();scene.add(passenger);
const seatedPassenger=createPassenger();seatedPassenger.name='seatedPassenger';posePassenger(seatedPassenger,0,1);seatedPassenger.visible=false;
function attachSeatedPassenger(){seatedPassenger.position.set(.38,.05,-model.showroom.rearSeat[2]);seatedPassenger.rotation.y=0;player.add(seatedPassenger)}
attachSeatedPassenger();
const car={x:s.x,z:s.z,heading:s.heading,speed:0,gear:1,doorOpen:false,maxSpeed:cars[s.car].top};let boarding=null;let keys={},last=performance.now(),saveTimer=0,uiTimer=0,collisionCooldown=0,lowWarn=false,look=0,lookPitch=0,steering=0,elapsed=0;
function currentJob(){return jobs[s.order%jobs.length]}function target(){return s.stage==='pickup'||s.stage==='board'?currentJob().pickup:s.stage==='ride'||s.stage==='finish'?currentJob().drop:null}
function clearControls(){keys={};heldPointers.clear();document.querySelectorAll('[data-key]').forEach(button=>button.classList.remove('is-active'))}
function setPaused(value){s.paused=value;if(value)clearControls();save();updateUI(true)}
let lastOrderHTML='';
function updateUI(force=false){const j=currentJob(),t=target(),dist=t?Math.round(distance(car,t)):0;$('money').innerHTML=Math.round(s.money).toLocaleString('ru-RU')+' <small>₽</small>';$('rating').textContent=s.rating.toFixed(1);$('trips').textContent=String(s.trips).padStart(2,'0');$('fuelText').textContent=Math.round(s.fuel)+'%';$('fuelBar').style.width=s.fuel+'%';$('condition').textContent=Math.round(s.condition)+'%';$('speed').textContent=Math.round(car.speed*3.6);$('steeringAngle').textContent=Math.round((car.steering||0)*270)+'°';$('clock').textContent=String(Math.floor(s.clock/60)%24).padStart(2,'0')+':'+String(Math.floor(s.clock%60)).padStart(2,'0');$('carName').textContent=cars[s.car].name;$('gearBtn').innerHTML=(car.gear===-1?'R':'D')+' <span>'+(car.gear===-1?'НАЗАД':'ВПЕРЁД')+'</span>'; $('shiftNumber').textContent=String(s.shift).padStart(2,'0');document.querySelector('.shift strong').innerHTML=String(s.shift).padStart(2,'0')+' <i>/</i> 08';$('district').textContent=districts[districtIndex(car.x,car.z)];$('pauseBtn').innerHTML=(s.paused?'▶':'Ⅱ')+' <span>'+(s.paused?'ПРОДОЛЖИТЬ':'ПАУЗА')+'</span>';document.querySelector('.touch-controls').classList.toggle('left-handed',s.leftHanded);
 let html;if(s.stage==='offer')html=`<div class="order-kicker">● &nbsp; НОВЫЙ ЗАКАЗ</div><h2>${j.name}</h2><p>${j.person} ждёт вас. Принять заказ?</p><div class="order-meta"><span>⌖ &nbsp; ${j.from} → ${j.to}</span><strong>≈ ${j.pay} ₽</strong></div><div class="order-actions"><button class="primary" id="accept">ПРИНЯТЬ ЗАКАЗ →</button><button class="secondary" id="decline">ОТКЛОНИТЬ</button></div>`;
 else if(s.stage==='pickup'||s.stage==='ride')html=`<div class="order-kicker">● &nbsp; ${s.stage==='pickup'?'ЗА ПАССАЖИРОМ':'ПАССАЖИР В МАШИНЕ'}</div><h2>${s.stage==='pickup'?j.from:j.to}</h2><p>${s.stage==='pickup'?'Остановитесь у золотого маяка возле тротуара.':j.story}</p><div class="order-meta"><span>ДО ЦЕЛИ ПО ПРЯМОЙ</span><strong id="orderDistance"></strong></div><div class="order-actions"><button class="secondary" id="auto">АВТО-ГАЗ ${s.auto?'ВКЛ':'ВЫКЛ'}</button>${s.fuel<=0?'<button class="secondary" id="emergency">КАНИСТРА · 200 ₽</button>':''}</div>`;
 else html=`<div class="order-kicker">● &nbsp; ВЫ ПРИБЫЛИ</div><h2>${s.stage==='board'?j.person:j.to}</h2><p>${s.stage==='board'?'Пассажир ждёт вас.':'Пассажир благополучно прибыл на место.'}</p><div class="order-actions"><button class="primary" id="continueOrder">${s.stage==='board'?'ПОСАДИТЬ':'ВЫСАДИТЬ · '+j.pay+' ₽'} →</button></div>`;
 if(html!==lastOrderHTML||force){$('orderContent').innerHTML=html;lastOrderHTML=html; if($('accept'))$('accept').onclick=()=>{s.stage='pickup';save();updateUI(true)};if($('decline'))$('decline').onclick=()=>{s.rating=Math.max(1,s.rating-.1);s.order++;save();updateUI(true);toast('Заказ отклонён · рейтинг −0.1')};if($('auto'))$('auto').onclick=()=>{s.auto=!s.auto;save();updateUI(true)};if($('emergency'))$('emergency').onclick=()=>{s.money-=200;s.fuel=20;lowWarn=false;save();updateUI(true);toast('Канистра доставлена')};if($('continueOrder'))$('continueOrder').onclick=()=>{if(s.stage==='board'){if(distance(car,j.pickup)>4.5||car.speed>.8){s.stage='pickup';save();updateUI(true);return toast('Вернитесь к обочине и остановитесь')}startBoarding(j);return}else{if(distance(car,j.drop)>4.5||car.speed>.8){s.stage='ride';save();updateUI(true);return toast('Вернитесь к обочине и остановитесь')}s.money+=j.pay;s.trips++;s.shiftTrips++;s.shiftIncome+=j.pay;if(!s.journal.includes(j.name))s.journal.push(j.name);s.order++;s.stage='offer';buzz();toast('Поездка завершена · +'+j.pay+' ₽')}save();updateUI(true)}}
 $('routeHud').hidden=!t;if(t){$('hudDistance').textContent=dist+' м';let relative=Math.atan2(t.x-car.x,t.z-car.z)-car.heading;$('routeArrow').style.transform='rotate('+(-relative)+'rad)'}
 if($('orderDistance'))$('orderDistance').textContent=dist+' м';$('tabletBtn').classList.toggle('has-order',s.stage==='offer'||s.stage==='board'||s.stage==='finish');
 seatedPassenger.visible=s.stage==='ride'||s.stage==='finish';$('routeLabel').textContent=t?dist+' М ДО ЦЕЛИ':'ОЖИДАНИЕ ЗАКАЗА';$('sceneMessage').innerHTML='<span>✦</span> '+(s.paused?'ПАУЗА':boarding?'ПАССАЖИР САДИТСЯ':s.stage==='offer'?'ОТКРОЙТЕ ПЛАНШЕТ ДЛЯ ЗАКАЗА':s.stage==='board'||s.stage==='finish'?'ВЫ ПРИБЫЛИ · ОТКРОЙТЕ ПЛАНШЕТ':'СЛЕДУЙТЕ К МАЯКУ');marker.visible=!!t&&!boarding;if(t)marker.position.set(t.x,.3,t.z);passenger.visible=!!t&&(s.stage==='pickup'||s.stage==='board');if(passenger.visible&&!boarding){passenger.position.set(j.pickupWait.x,0,j.pickupWait.z);passenger.rotation.y=-Math.PI/2;posePassenger(passenger);}drawMap(t);
}
const map=document.createElement('canvas');map.className='live-map';document.querySelector('.map').append(map);const mapctx=map.getContext('2d');
function drawMap(t){map.width=400;map.height=150;const c=mapctx;c.fillStyle='#18282a';c.fillRect(0,0,400,150);const scale=.24,ox=200+car.x*scale,oy=75+car.z*scale;c.strokeStyle='#51605a';c.lineWidth=5;for(let i=-4;i<=4;i++){let x=ox-i*80*scale,y=oy-i*80*scale;c.beginPath();c.moveTo(x,0);c.lineTo(x,150);c.moveTo(0,y);c.lineTo(400,y);c.stroke()}if(t){let tx=ox-t.x*scale,ty=oy-t.z*scale;c.setLineDash([5,5]);c.strokeStyle='#e4b65f';c.lineWidth=2;c.beginPath();c.moveTo(200,75);c.lineTo(tx,75);c.lineTo(tx,ty);c.stroke();c.setLineDash([]);c.fillStyle='#e4b65f';c.beginPath();c.arc(clamp(tx,5,395),clamp(ty,5,145),5,0,Math.PI*2);c.fill()}c.save();c.translate(200,75);c.rotate(-car.heading);c.fillStyle='#fff3c5';c.beginPath();c.moveTo(0,-9);c.lineTo(-5,6);c.lineTo(5,6);c.closePath();c.fill();c.restore()}
function modal(title,content){setPaused(true);$('modalContent').innerHTML=`<div class="eyebrow">НОЧНОЕ ТАКСИ / 3D</div><h2>${title}</h2>${content}`;$('modal').classList.remove('hidden')}
// Tablet pauses driving. Only resume on close if the tablet itself paused a running shift.
let tabletOpen=false, resumeAfterTablet=false;
function openTablet(){if(boarding)return toast('Дождитесь посадки пассажира');if(tabletOpen)return;tabletOpen=true;resumeAfterTablet=!s.paused;keys={};setPaused(true);$('tabletOverlay').classList.remove('hidden');$('tabletBtn').setAttribute('aria-expanded','true');$('tablet').focus()}
function closeTablet(){if(!tabletOpen)return;tabletOpen=false;$('modal').classList.add('hidden');$('tabletOverlay').classList.add('hidden');$('tabletBtn').setAttribute('aria-expanded','false');if(resumeAfterTablet)setPaused(false);resumeAfterTablet=false;$('tabletBtn').focus()}
function startBoarding(job){
 boarding=makeBoarding(job.pickupWait,car,model.showroom.unit.width,-model.showroom.rearSeat[2]);s.auto=false;car.speed=0;car.slip=0;car.yawRate=0;clearControls();
 closeTablet();buzz();toast('Пассажир подходит к автомобилю');updateUI(true);
}
$('tabletBtn').onclick=openTablet;$('closeTablet').onclick=closeTablet;
$('tabletOverlay').onclick=e=>{if(e.target===$('tabletOverlay'))closeTablet()};
$('closeModal').onclick=()=>$('modal').classList.add('hidden');
function hideHelp(){ $('drivingHelp').classList.add('hidden');if(!s.seenHelp){s.seenHelp=true;save()} }
if(s.seenHelp)$('drivingHelp').classList.add('hidden');$('closeHelp').onclick=hideHelp;$('helpBtn').onclick=()=>$('drivingHelp').classList.toggle('hidden');
$('pauseBtn').onclick=()=>{setPaused(!s.paused);toast(s.paused?'Смена на паузе':'Смена продолжается')};
$('settingsBtn').onclick=()=>{modal('Настройки',`<label class="setting">Качество <select id="quality"><option>Эконом</option><option>Среднее</option><option>Высокое</option></select></label><label class="setting">Чувствительность камеры <select id="sensitivity"><option value="0.6">Низкая</option><option value="1">Средняя</option><option value="1.5">Высокая</option></select></label><label class="setting">Авто-газ <input type="checkbox" id="autoSetting" ${s.auto?'checked':''}></label><label class="setting">Левша <input type="checkbox" id="leftSetting" ${s.leftHanded?'checked':''}></label><label class="setting">Вибрация <input type="checkbox" id="hapticSetting" ${s.haptics?'checked':''}></label><label class="setting">Уменьшение движения <input type="checkbox" id="motionSetting" ${s.reduceMotion?'checked':''}></label><p>W / ↑ — газ, S / ↓ — тормоз, A / D — руль, пробел — ручник, R — переключение вперёд / назад на остановке. Свайп по свободной части экрана — обзор, двойной тап — вернуть взгляд. Планшет — кнопка на экране или T, закрыть — Escape. Переключайте камеры кнопкой на экране. Цель отмечена золотым маяком.</p><button class="secondary" id="journal">ЖУРНАЛ И СМЕНА</button>`);$('quality').value=s.quality;$('sensitivity').value=String(s.cameraSensitivity||1);$('sensitivity').onchange=e=>{s.cameraSensitivity=Number(e.target.value);save()};for(const [id,key] of [['quality','quality'],['autoSetting','auto'],['leftSetting','leftHanded'],['hapticSetting','haptics'],['motionSetting','reduceMotion']])$(id).onchange=e=>{s[key]=e.target.type==='checkbox'?e.target.checked:e.target.value;save();updateUI(true)};$('journal').onclick=showJournal};
function showJournal(){modal('Журнал смены',`<p>Смена ${s.shift} · поездок: ${s.shiftTrips} · заработано: ${s.shiftIncome} ₽</p>${s.journal.length?s.journal.map(x=>'<div class="journal-entry">✦ &nbsp; '+x+'</div>').join(''):'<p>Историй пока нет.</p>'}<button class="primary" id="endShift">ЗАКОНЧИТЬ СМЕНУ · 350 ₽</button>`);$('endShift').onclick=()=>{if(s.stage!=='offer')return toast('Сначала завершите заказ');if(s.money<350)return toast('Недостаточно денег');s.money-=350;s.shift++;s.shiftTrips=0;s.shiftIncome=0;save();updateUI(true);$('modal').classList.add('hidden');toast('Счета оплачены')}}
$('garageBtn').onclick=()=>{if(s.stage!=='offer')return toast('Гараж доступен между заказами');modal('Гараж',`<p>${cars[s.car].name} · топливо ${Math.round(s.fuel)}% · состояние ${Math.round(s.condition)}%</p><button class="primary" id="refuel">ЗАПРАВИТЬ · 300 ₽</button><button class="secondary" id="repair">РЕМОНТ · 400 ₽</button><div class="garage-cars">${cars.map((c,i)=>`<div class="garage-car"><div><strong>${c.name}</strong><small>До ${Math.round(c.top*3.6)} км/ч · расход ×${c.consumption}</small></div><button class="secondary" data-car="${i}">${s.car===i?'ВЫБРАНА':s.owned.includes(i)?'ВЫБРАТЬ':c.price+' ₽'}</button></div>`).join('')}</div>`);$('refuel').onclick=()=>{if(s.money<300)return toast('Недостаточно средств');if(s.fuel>=99)return toast('Бак полный');s.money-=300;s.fuel=100;lowWarn=false;save();updateUI(true);$('modal').classList.add('hidden');toast('Бак заправлен')};$('repair').onclick=()=>{if(s.money<400)return toast('Недостаточно средств');if(s.condition>=99)return toast('Ремонт не требуется');s.money-=400;s.condition=100;save();updateUI(true);$('modal').classList.add('hidden');toast('Машина отремонтирована')};document.querySelectorAll('[data-car]').forEach(b=>b.onclick=()=>{let i=+b.dataset.car;if(!s.owned.includes(i)){if(s.money<cars[i].price)return toast('Недостаточно средств');s.money-=cars[i].price;s.owned.push(i)}s.car=i;changeVehicle(i);save();updateUI(true);$('modal').classList.add('hidden');toast('Выбрана '+cars[i].name)})};
function toggleGear(){if(boarding)return toast('Дождитесь посадки пассажира');if(car.speed>.5)return toast('Остановитесь перед переключением передачи');car.gear=car.gear===1?-1:1;save();updateUI(true);toast(car.gear===-1?'Включён задний ход':'Включена передняя передача')} $('gearBtn').onclick=toggleGear;$('cameraBtn').onclick=()=>{s.camera=({1:0,0:2,2:1})[s.camera];$('cameraLabel').textContent=['ВИД: СНАРУЖИ','ВИД: САЛОН','ВИД: СВЕРХУ'][s.camera];look=0;lookPitch=0;save();toast(['Камера: снаружи','Камера: из салона','Камера: сверху'][s.camera])};
// Physical key codes keep driving controls in place across keyboard layouts.
function drivingKey(e){const codes={KeyW:'w',KeyA:'a',KeyS:'s',KeyD:'d',KeyR:'r',KeyT:'t',KeyC:'c',KeyP:'p',Space:' '};return codes[e.code]||e.key.toLowerCase()}
window.addEventListener('keydown',e=>{
 const key=drivingKey(e);
 if(tabletOpen){if(key==='escape'){e.preventDefault();if(!$('modal').classList.contains('hidden'))$('modal').classList.add('hidden');else closeTablet()}return}
 if(e.target?.matches?.('input, textarea, select, [contenteditable="true"]')||e.ctrlKey||e.altKey||e.metaKey)return;
 if(['w','a','s','d','arrowup','arrowdown','arrowleft','arrowright',' ','r','t','c','p','escape'].includes(key))e.preventDefault();
 if(!e.repeat){
  if(key==='t'){openTablet();return}
  if(key==='p'||key==='escape'){$('pauseBtn').click();return}
  if(key==='c'){$('cameraBtn').click();return}
  if(key==='r'&&!boarding)toggleGear();
 }
 if(s.paused||boarding)return;
 if(key==='w'||key==='arrowup')hideHelp();keys[key]=true;
});window.addEventListener('keyup',e=>{keys[drivingKey(e)]=false});
window.addEventListener('blur',()=>{keys={};resumeAfterTablet=false;setPaused(true)});
document.addEventListener('visibilitychange',()=>{if(document.hidden){keys={};resumeAfterTablet=false;setPaused(true)}});
// Each pointer has its own held control, so steering and gas can be held together.
const heldPointers=new Map();
const controlButtons=[...document.querySelectorAll('[data-key]')];
function syncHeldControls(){
  for(const btn of controlButtons){const k=btn.dataset.key;const active=[...heldPointers.values()].some(value=>value===k);keys[k]=active;btn.classList.toggle('is-active',active)}
}
function holdControl(id,btn){if(s.paused||tabletOpen||boarding)return;heldPointers.set(id,btn.dataset.key);syncHeldControls();if(btn.dataset.key==='gas')hideHelp()}
function releaseControl(id){heldPointers.delete(id);syncHeldControls()}
for(const btn of controlButtons){
  for(const type of ['contextmenu','selectstart','dragstart'])btn.addEventListener(type,e=>e.preventDefault());
  if(window.PointerEvent){
    btn.addEventListener('pointerdown',e=>{if(e.pointerType==='mouse'&&e.button!==0)return;e.preventDefault();holdControl(e.pointerId,btn);try{btn.setPointerCapture(e.pointerId)}catch{}});
    for(const type of ['pointerup','pointercancel','lostpointercapture'])btn.addEventListener(type,e=>releaseControl(e.pointerId));
  }else{
    // Older touch browsers without Pointer Events: touch identifiers remain independent.
    btn.addEventListener('touchstart',e=>{e.preventDefault();for(const t of e.changedTouches)holdControl('touch:'+t.identifier,btn)},{passive:false});
    for(const type of ['touchend','touchcancel'])btn.addEventListener(type,e=>{e.preventDefault();for(const t of e.changedTouches)releaseControl('touch:'+t.identifier)},{passive:false});
    btn.addEventListener('mousedown',e=>{if(e.button!==0)return;e.preventDefault();holdControl('mouse',btn)});
  }
}
window.addEventListener('mouseup',()=>releaseControl('mouse'));
renderer.domElement.addEventListener('contextmenu',e=>e.preventDefault());
renderer.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();setPaused(true);$('renderError').classList.remove('hidden')});
renderer.domElement.addEventListener('webglcontextrestored',()=>{$('renderError').classList.add('hidden');toast('3D восстановлен. Нажмите «Продолжить»')});
// Camera drag is exclusive to the canvas: it never steals touches from steering or pedals.
let cameraPointer=null,lastCameraTap=0;
renderer.domElement.addEventListener('pointerdown',e=>{if(cameraPointer!==null || (e.pointerType==='mouse'&&e.button!==0))return;cameraPointer={id:e.pointerId,x:e.clientX,y:e.clientY,startX:e.clientX,startY:e.clientY,type:e.pointerType};try{renderer.domElement.setPointerCapture(e.pointerId)}catch{}});
renderer.domElement.addEventListener('pointermove',e=>{if(!cameraPointer||cameraPointer.id!==e.pointerId)return;const sensitivity=Number(s.cameraSensitivity)||1;const dx=e.clientX-cameraPointer.x,dy=e.clientY-cameraPointer.y;look+=dx*.006*sensitivity;if(s.camera===1)look=clamp(look,-2.05,2.05);else look=Math.atan2(Math.sin(look),Math.cos(look));lookPitch=clamp(lookPitch-dy*.004*sensitivity,-.55,.55);cameraPointer.x=e.clientX;cameraPointer.y=e.clientY});
for(const type of ['pointerup','pointercancel','lostpointercapture'])renderer.domElement.addEventListener(type,e=>{
 if(!cameraPointer||cameraPointer.id!==e.pointerId)return;
 if(type==='pointerup'&&cameraPointer.type==='touch'&&Math.hypot(e.clientX-cameraPointer.startX,e.clientY-cameraPointer.startY)<12){const now=performance.now();if(now-lastCameraTap<350){look=0;lookPitch=0;lastCameraTap=0;toast('Обзор по центру')}else lastCameraTap=now}
 cameraPointer=null;
});
renderer.domElement.addEventListener('dblclick',()=>{look=0;lookPitch=0;toast('Обзор по центру')});
function resize(){let r=$('scene').getBoundingClientRect(),pixel=s.quality==='Эконом'?.7:s.quality==='Высокое'?Math.min(devicePixelRatio,1.5):1;renderer.setPixelRatio(pixel);renderer.setSize(Math.max(1,r.width),Math.max(1,r.height),true);camera.aspect=r.width/Math.max(1,r.height);camera.updateProjectionMatrix()}
window.addEventListener('resize',resize);
let lastWidth=0,lastHeight=0,lastQuality='',lastDpr=0;
function tick(now){let dt=Math.min((now-last)/1000,.05);last=now;const r=$('scene').getBoundingClientRect();if(r.width!==lastWidth||r.height!==lastHeight||lastQuality!==s.quality||lastDpr!==devicePixelRatio){resize();lastWidth=r.width;lastHeight=r.height;lastQuality=s.quality;lastDpr=devicePixelRatio}
 if(!s.paused){car.maxSpeed=cars[s.car].top*(.65+s.condition*.0035);const input={gas:(keys.w||keys.arrowup||keys.gas||s.auto)&&s.fuel>0&&!boarding,brake:keys.s||keys.arrowdown||keys.brake,handbrake:keys[' ']||keys.handbrake,left:keys.a||keys.arrowleft||keys.left,right:keys.d||keys.arrowright||keys.right};car.wheelbase=model.showroom.unit.wheelbase;let impact=boarding?0:stepCar(car,input,dt);steering=car.steering||0;collisionCooldown=Math.max(0,collisionCooldown-dt);if(impact>3&&collisionCooldown<=0){s.condition=Math.max(20,s.condition-impact*.3);s.rating=Math.max(1,s.rating-.1);collisionCooldown=2;buzz();toast('Удар о препятствие · рейтинг −0.1')}s.fuel=Math.max(0,s.fuel-car.speed*dt/550*cars[s.car].consumption);if(s.fuel<15&&!lowWarn){lowWarn=true;buzz();toast('Мало топлива')}
 for(const t of traffic){t.pos+=t.dir*5*dt;if(t.pos>400)t.pos=-400;if(t.pos< -400)t.pos=400;t.mesh.position.set(t.axis?t.pos:t.road+4,0,t.axis?t.road+4:t.pos);t.mesh.rotation.y=(t.axis?Math.PI/2:0)+(t.dir<0?Math.PI:0);if(collisionCooldown<=0&&Math.hypot(car.x-t.mesh.position.x,car.z-t.mesh.position.z)<3){if(car.speed>2){car.speed*=.2;s.condition=Math.max(20,s.condition-4);s.rating=Math.max(1,s.rating-.1);collisionCooldown=3;buzz();toast('Столкновение с транспортом')}}}
 const t=target();if(t&&(s.stage==='pickup'||s.stage==='ride')&&distance(car,t)<3&&car.speed<.8){s.stage=s.stage==='pickup'?'board':'finish';car.speed=0;buzz();toast('Вы у обочины · откройте планшет');save();updateUI(true)}
 s.x=car.x;s.z=car.z;s.heading=car.heading;s.clock+=dt/12;saveTimer+=dt;uiTimer+=dt;if(saveTimer>=30){save();saveTimer=0}if(uiTimer>.25){updateUI();uiTimer=0}}
 elapsed+=s.paused?0:dt;if(!s.paused){const pulse=s.reduceMotion?1:1+Math.sin(elapsed*2)*.06;ring.scale.setScalar(pulse);beam.material.opacity=s.reduceMotion?.2:.17+.04*Math.sin(elapsed*2);pedestrians.update(elapsed,s.reduceMotion);
 if(boarding){const pose=boardingPose(boarding,dt);passenger.visible=true;passenger.position.set(pose.x,0,pose.z);passenger.rotation.y=pose.heading;posePassenger(passenger,s.reduceMotion?0:pose.stride,pose.sit);
  if(pose.done){boarding=null;passenger.visible=false;posePassenger(passenger);clearControls();s.stage='ride';save();updateUI(true);buzz();toast('Пассажир сел в машину');}
 }else if(passenger.visible){passenger.userData.waveArm.rotation.x=s.reduceMotion?0:Math.sin(elapsed*1.5)*.15;}}
animateTaxi(model,car.speed,steering,car.gear,s.paused?0:dt,elapsed,!s.reduceMotion,car.doorOpen);player.position.set(car.x,0,car.z);player.rotation.y=car.heading;const angle=car.heading+look,forward=new THREE.Vector3(Math.sin(angle),0,Math.cos(angle));let pos,aim;if(boarding){const outward=new THREE.Vector3(boarding.near.x-boarding.seat.x,0,boarding.near.z-boarding.seat.z).normalize();const carForward=new THREE.Vector3(Math.sin(car.heading),0,Math.cos(car.heading));pos=new THREE.Vector3(car.x,3.6,car.z).addScaledVector(outward,9).addScaledVector(carForward,-5.5);aim=new THREE.Vector3((car.x+passenger.position.x)/2,1,(car.z+passenger.position.z)/2);}else if(s.camera===1){const right=new THREE.Vector3(Math.cos(car.heading),0,-Math.sin(car.heading));const seat=model.showroom.driverView.pos;pos=new THREE.Vector3(car.x,seat[1],car.z).addScaledVector(right,-seat[0]).addScaledVector(new THREE.Vector3(Math.sin(car.heading),0,Math.cos(car.heading)),-seat[2]);aim=pos.clone().addScaledVector(forward,25);aim.y+=lookPitch*16-5.2}else if(s.camera===2){pos=new THREE.Vector3(car.x,25,car.z-1);aim=new THREE.Vector3(car.x,0,car.z)}else{pos=new THREE.Vector3(car.x,clamp(4.0+lookPitch*7,2.5,10),car.z).addScaledVector(forward,-7.5);aim=new THREE.Vector3(car.x,1.3,car.z)}camera.position.copy(pos);camera.lookAt(aim);renderer.render(scene,camera);requestAnimationFrame(tick)}
updateUI(true);requestAnimationFrame(tick);
