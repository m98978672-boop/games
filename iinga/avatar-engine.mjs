// Character adapter: the MakeHuman topology is always minted by RatCore.
const palette={skin:'#d4a08a',hair:'#594034',jacket:'#aec8dd',legs:'#d4a08a',shoes:'#35465a'};
function positionForPose(positions,pose){
 pose ??= [-12,-12,10,10,0,0];
 const out=positions.slice();
 for(let i=0;i<out.length;i+=3){
  const x=positions[i],y=positions[i+1],z=positions[i+2];
  if(y>.75&&y<1.48&&Math.abs(x)>.175){
   const side=x<0?-1:1,j=x<0?0:1,dx=x-side*.175,dy=y-1.33;
   const w=Math.min(1,Math.abs(dx)/.10);
   const angle=-side*w*(pose[j]+28)*Math.PI/180;
   out[i]=side*.175+Math.cos(angle)*dx-Math.sin(angle)*dy;
   out[i+1]=1.33+Math.sin(angle)*dx+Math.cos(angle)*dy;
  }else if(y<.90){
   const j=x<0?0:1,dy=y-.88,dz=z-.01;
   const angle=pose[4+j]*Math.PI/180;
   out[i+1]=.88+Math.cos(angle)*dy-Math.sin(angle)*dz;
   out[i+2]=.01+Math.sin(angle)*dy+Math.cos(angle)*dz;
  }
 }
 return out;
}
export function createAvatarEngine(core,asset){
 const t=core.tools;
 function use(fn,args){const r=fn(args);if(!r.ok)throw new Error(r.error?.message ?? 'RatCore tool failed');return r.data;}
 const place=(id,mesh,h=0)=>use(t.build.placeEntity,{id,mesh,x:0,y:0,h,allowWater:true,allowUnderground:true});
 let outfit='trousers',angle=0,dirty=true,active=[],lastKey=null;
 const skirt=use(t.build.fromRecipe,{modelId:'skirt',ops:[{tool:'build.lathe',args:{profile:[[.149,0],[.158,.08],[.179,.28],[.168,.41],[.145,.46]],segments:36,color:'#adc6dc'}}]});
 // Quantized poses bound mesh creation and allow reuse without reminting on every frame.
 const cache=new Map();
 function refresh(pose){
  const key=outfit+':'+(pose?pose.join('/'):'idle');if(key===lastKey)return;
  let meshSet=cache.get(key);
  if(!meshSet){
   // Defensive budget; the public controls currently generate at most ten pose keys.
   if(cache.size>=24)return;
   meshSet=Object.entries(asset).map(([id,g])=>[id,use(t.build.fromRecipe,{modelId:`iinga-${id}`,ops:[{tool:'build.indexed',args:{positions:positionForPose(g.positions,pose),indices:g.indices,color:id==='legs'&&outfit==='trousers'?'#a9c3d9':palette[id]}}]})]);
   cache.set(key,meshSet);
  }
  for(const id of active)use(t.remove.entity,{id});active=[];
  for(const [id,mesh] of meshSet){place(id,mesh);active.push(id);}
  if(outfit==='skirt'){place('skirt',skirt,.455);active.push('skirt');}
  dirty=true;lastKey=key;
 }
 let pose=null;
 refresh(pose);
 return {setOutfit(value){if(!['skirt','trousers'].includes(value))throw new Error('Unknown outfit');outfit=value;refresh(pose);},
  setMotion(action,joints){
   if(!['wave','walk','rest'].includes(action)||!joints)return;
   const next=[-12,-12,10,10,0,0];
   if(action==='wave')next[1]=joints[1].angle < -53?-65:joints[1].angle < -28?-40:-12;
   if(action==='walk'){next[4]=joints[4].angle>12?15:joints[4].angle < -12?-15:0;next[5]=-next[4];}
   pose=next[1]===-12&&next[4]===0?null:next;
   refresh(pose);
  },
  setAngle(deg){if(!Number.isFinite(deg))return;angle=deg*Math.PI/180;dirty=true;},capture(width,height){
   use(t.look.at,{x:3.05*Math.sin(angle),y:-3.05*Math.cos(angle),h:1,targetX:0,targetY:0,targetH:.83,fovDeg:37,mode:'smooth'});
   const frame=use(t.look.capture,{width,height,includePixels:true});dirty=false;return frame;
  },get dirty(){return dirty;}};
}
