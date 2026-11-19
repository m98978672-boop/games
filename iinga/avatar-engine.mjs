// Application-level RatCore extension. All vertex buffers stay in ToolGuard.
export function createAvatarEngine(core){
 const t=core.tools;
 function use(fn,args){const r=fn(args);if(!r.ok)throw new Error(r.error?.message ?? 'RatCore tool failed');return r.data;}
 const ice='#9fbbd4', pale='#c3d8eb', seam='#6688a4', skin='#d6a58d', hair='#644534', dark='#354d65';
 const parts=[];
 function add(p){const {id,mesh,x,z,h}=p;use(t.build.placeEntity,{id,mesh,x,y:z,h,allowWater:true,allowUnderground:true});}
 function place(id,mesh,x,z,h,outfit){const p={id,mesh,x,z,h,outfit};if(outfit)parts.push(p);else add(p);}
 function profile(id,points,color,x=0,z=0,h=0,outfit=null){const mesh=use(t.build.fromRecipe,{modelId:id,ops:[{tool:'build.lathe',args:{profile:points,segments:24,color}}]});place(id,mesh,x,z,h,outfit);}
 function shape(id,r,dy,color,x,z,h){profile(id,[[0,0],[r*.75,dy*.12],[r,dy*.46],[r*.87,dy*.79],[r*.53,dy*.95],[0,dy]],color,x,z,h);}
 profile('jacket',[[0,0],[.22,0],[.225,.05],[.18,.18],[.177,.27],[.229,.37],[.233,.43],[.196,.48],[.09,.49],[0,.49]],ice,0,0,.89);
 profile('skirt',[[0,0],[.179,0],[.192,.15],[.217,.32],[.226,.43],[.191,.49],[0,.49]],pale,0,0,.47,'skirt');
 profile('neck',[[0,0],[.06,0],[.056,.073],[.065,.105],[0,.105]],skin,0,0,1.33);
 profile('face',[[0,0],[.053,.005],[.083,.034],[.098,.081],[.102,.133],[.093,.197],[.063,.228],[0,.239]],skin,0,0,1.415);
 profile('hair',[[.087,0],[.102,.031],[.107,.065],[.091,.104],[.063,.125],[.035,.135],[0,.139]],hair,0,-.009,1.543);
 shape('bun',.057,.092,hair,0,-.107,1.49);
 shape('nose',.022,.049,skin,0,.093,1.495);
 shape('lips',.025,.012,'#9f5c59',0,.087,1.468);
 for(const side of [-1,1]){
  shape(`ear${side}`,.019,.043,skin,.095*side,-.005,1.49);
  shape(`eye${side}`,.018,.015,'#68879b',.043*side,.088,1.536);
  shape(`pupil${side}`,.007,.009,'#233645',.043*side,.103,1.539);
  shape(`brow${side}`,.02,.007,hair,.043*side,.088,1.56);
  profile(`sleeve${side}`,[[0,0],[.041,0],[.049,.1],[.061,.22],[.074,.34],[.065,.41],[0,.44]],ice,.225*side,0,.92);
  shape(`hand${side}`,.037,.098,skin,.225*side,0,.839);
  profile(`leg${side}`,[[0,0],[.032,0],[.038,.10],[.051,.25],[.055,.35],[.065,.48],[0,.55]],skin,.099*side,0,.085,'skirt');
  profile(`trouser${side}`,[[0,0],[.058,0],[.058,.18],[.065,.39],[.075,.61],[.105,.79],[.104,.88],[0,.88]],pale,.103*side,0,.078,'trousers');
  shape(`shoe${side}`,.062,.095,dark,.099*side,.035,.005);
 }
 for(let i=0;i<3;i++)shape(`button${i}`,.009,.016,seam,0,[.207,.180,.185][i],1.035+i*.063);
 let outfit, angle=0, dirty=true;
 function setOutfit(value){if(!['skirt','trousers'].includes(value))throw new Error('Unknown outfit');if(outfit===value)return;
  for(const p of parts)if(p.outfit===outfit)use(t.remove.entity,{id:p.id});
  for(const p of parts)if(p.outfit===value)add(p);
  outfit=value;dirty=true;
 }
 setOutfit('skirt');
 return {setOutfit,setAngle(deg){if(!Number.isFinite(deg))return;angle=deg*Math.PI/180;dirty=true;},capture(width,height){
  use(t.look.at,{x:3.15*Math.sin(angle),y:3.15*Math.cos(angle),h:1.00,targetX:0,targetY:0,targetH:.83,fovDeg:36});
  const frame=use(t.look.capture,{width,height,includePixels:true});dirty=false;return frame;
 },get dirty(){return dirty;}};
}
