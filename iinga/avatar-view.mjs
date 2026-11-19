import {createAvatarEngine} from './avatar-engine.mjs';
const canvas=document.getElementById('avatar'),ctx=canvas.getContext('2d');
const status=document.getElementById('avatar-status'),controls=document.getElementById('avatar-controls');
(async()=>{
 try{
  const {engine}=await globalThis.GamesEngine.create({preset:'balanced'}).promise;
  const avatar=createAvatarEngine(engine);
  const image=ctx.createImageData(canvas.width,canvas.height);
  function draw(){const {pixels}=avatar.capture(canvas.width,canvas.height);for(let i=0,j=0;i<pixels.length;i++,j+=4){const p=pixels[i];image.data[j]=p&255;image.data[j+1]=(p>>>8)&255;image.data[j+2]=(p>>>16)&255;image.data[j+3]=255;}ctx.putImageData(image,0,0);}
  let pending=false;function refresh(){if(pending)return;pending=true;requestAnimationFrame(()=>{pending=false;if(avatar.dirty)draw();});}
  controls.oninput=e=>{if(e.target.id==='avatar-angle')avatar.setAngle(Number(e.target.value));if(e.target.id==='avatar-outfit')avatar.setOutfit(e.target.value);refresh();};
  for(const button of controls.querySelectorAll('[data-angle]'))button.onclick=()=>{const angle=Number(button.dataset.angle);document.getElementById('avatar-angle').value=angle;avatar.setAngle(angle);refresh();};
  draw();controls.disabled=false;status.textContent='Меши RatCore · стилизованная статичная модель';
 }catch(error){status.textContent='Не удалось загрузить 3D. Чат и схема движения доступны.';console.error(error);}
})();
