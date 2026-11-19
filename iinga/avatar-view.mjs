import {createAvatarEngine} from './avatar-engine.mjs?v=0.3';
const canvas=document.getElementById('avatar'),ctx=canvas.getContext('2d');
const status=document.getElementById('avatar-status'),controls=document.getElementById('avatar-controls');
(async()=>{
 try{
  const {engine}=await globalThis.GamesEngine.create({preset:'balanced'}).promise;
  const response=await fetch(new URL('./assets/avatar.json',import.meta.url));
  if(!response.ok)throw new Error(`MakeHuman asset: ${response.status}`);
  const avatar=createAvatarEngine(engine,await response.json());
  window.addEventListener('iinga-motion',e=>{avatar.setMotion(e.detail.action,e.detail.joints);refresh();});
  const image=ctx.createImageData(canvas.width,canvas.height);
  function draw(){const {pixels}=avatar.capture(canvas.width,canvas.height);for(let i=0,j=0;i<pixels.length;i++,j+=4){const p=pixels[i];image.data[j]=p&255;image.data[j+1]=(p>>>8)&255;image.data[j+2]=(p>>>16)&255;image.data[j+3]=255;}ctx.putImageData(image,0,0);}
  let pending=false;function refresh(){if(pending)return;pending=true;requestAnimationFrame(()=>{pending=false;if(avatar.dirty)draw();});}
  controls.oninput=e=>{if(e.target.id==='avatar-angle')avatar.setAngle(Number(e.target.value));if(e.target.id==='avatar-outfit')avatar.setOutfit(e.target.value);refresh();};
  for(const button of controls.querySelectorAll('[data-angle]'))button.onclick=()=>{const angle=Number(button.dataset.angle);document.getElementById('avatar-angle').value=angle;avatar.setAngle(angle);refresh();};
  draw();controls.disabled=false;status.textContent='MakeHuman CC0 · 3D-аватар RatCore';
 }catch(error){status.textContent='Не удалось загрузить 3D. Чат доступен.';console.error(error);}
})();
