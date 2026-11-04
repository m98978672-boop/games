import * as THREE from 'three';

// Low-poly geometry built locally; no external asset downloads are required.
export function createTaxi(color=0xc0a346, variant=0) {
  const group=new THREE.Group(), exterior=new THREE.Group(), cabin=new THREE.Group();
  group.add(exterior,cabin); cabin.visible=false;
  const material=(color,extra={})=>new THREE.MeshStandardMaterial({color,roughness:.65,...extra});
  const paint=material(color,{metalness:.32,roughness:.38}), trim=material(0x101519), rubber=material(0x15191b), chrome=material(0x9ba8a7,{metalness:.75,roughness:.28}),
    glass=material(0x21343c,{metalness:.2,roughness:.25}), headlight=material(0xf3e4bb,{emissive:0xc5a76e,emissiveIntensity:.7}),
    rear=material(0x9c2820,{emissive:0x8e1b12}), cloth=material(0x554941), dash=material(0x272927), accent=material(0xa68a5a,{metalness:.25}), dial=material(0x172c28,{emissive:0x123b2f});
  const box=(parent,w,h,d,m,x,y,z)=>{let o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);o.position.set(x,y,z);parent.add(o);return o};
  const cylinder=(parent,r1,r2,h,m,x,y,z,rotation=0)=>{let o=new THREE.Mesh(new THREE.CylinderGeometry(r1,r2,h,12),m);o.position.set(x,y,z);o.rotation.z=rotation;parent.add(o);return o};
  const torus=(parent,r,tube,m,x,y,z)=>{let o=new THREE.Mesh(new THREE.TorusGeometry(r,tube,8,24),m);o.position.set(x,y,z);parent.add(o);return o};
  const van=variant===2, length=van?4.65:variant===1?4.7:4.4, roofHeight=van?2.25:1.98;
  // Exterior shell, separate panels, glazing, grille, handles, mirrors and taxi sign.
  box(exterior,2,.65,length,paint,0,.87,0); box(exterior,1.95,.24,1.25,paint,0,1.3,length/2-.65);
  box(exterior,1.95,.23,.75,paint,0,1.29,-length/2+.4);
  box(exterior,1.75,.72,2.2,glass,0,1.63,-.24);box(exterior,1.87,.14,2.35,paint,0,roofHeight,-.25);
  for(const side of [-1,1]){
    box(exterior,.1,.78,2.3,paint,side*.91,1.6,-.22);box(exterior,.09,.08,2.2,chrome,side*1.02,1.12,0);
    box(exterior,.08,.1,.32,chrome,side*1.04,1.23,-.45);box(exterior,.08,.1,.32,chrome,side*1.04,1.23,.48);
    box(exterior,.25,.2,.34,trim,side*1.11,1.57,.7);
    box(exterior,.58,.25,.08,headlight,side*.68,1.02,length/2+.02);box(exterior,.58,.22,.08,rear,side*.68,1.01,-length/2-.02);
  }
  box(exterior,1.2,.28,.08,trim,0,.85,length/2+.03);for(let i=-3;i<=3;i++)box(exterior,.025,.22,.09,chrome,i*.16,.85,length/2+.07);
  box(exterior,2.07,.16,.13,chrome,0,.57,length/2+.03);box(exterior,2.07,.16,.13,chrome,0,.57,-length/2-.03);
  box(exterior,.65,.16,.07,headlight,0,.72,-length/2-.11);box(exterior,.78,.24,.38,headlight,0,roofHeight+.18,-.18);
  for(let i=0;i<5;i++)box(exterior,.1,.1,.02,trim,(i-2)*.14,roofHeight+.18,.02);
  const wheels=[], frontPivots=[];
  for(const side of [-1,1])for(const z of [-length*.32,length*.32]){let pivot=new THREE.Group();pivot.position.set(side*1,.47,z);exterior.add(pivot);const tire=cylinder(pivot,.43,.43,.28,rubber,0,0,0,Math.PI/2);const hub=cylinder(pivot,.23,.23,.30,chrome,0,0,0,Math.PI/2);wheels.push({tire,hub});if(z>0)frontPivots.push(pivot)}
  // Visible only in first person: detailed but lightweight dashboard and cabin framing.
  box(cabin,2.0,.22,.58,dash,0,1.28,.95);box(cabin,1.9,.18,.25,trim,0,1.42,1.18);
  // Bonnet and windscreen frame stay visible in the cabin view.
  box(cabin,1.95,.12,.95,paint,0,1.32,1.73);
  box(cabin,1.86,.04,.04,chrome,0,1.51,1.1);
  for(const side of [-1,1]){box(cabin,.12,.14,.35,trim,side*1.04,1.68,.88);box(cabin,.10,.09,.25,glass,side*1.10,1.7,.82)}
  // Centre console, ventilation slots, knobs and a gear selector.
  box(cabin,.52,.52,.25,dash,-.16,.94,.7);box(cabin,.42,.13,.03,trim,-.16,1.35,.55);
  for(let i=0;i<5;i++)box(cabin,.055,.018,.025,chrome,-.32+i*.08,1.35,.53);
  for(let i=0;i<3;i++){let knob=cylinder(cabin,.033,.033,.025,accent,-.30+i*.14,1.08,.54);knob.rotation.x=Math.PI/2}
  box(cabin,.07,.28,.07,trim,-.13,.82,.29);let gearKnob=cylinder(cabin,.06,.045,.09,accent,-.13,1,.29);gearKnob.rotation.x=.2;
  for(const side of [-1,1]){box(cabin,.68,.04,.04,accent,side*.49,1.10,-.73);box(cabin,.45,.035,.05,trim,side*.49,1.28,-.72)}
  box(cabin,1.0,.13,.1,accent,-.4,1.38,.68);box(cabin,.48,.22,.12,trim,-.20,1.24,.64);
  for(let i=0;i<4;i++)box(cabin,.06,.035,.025,headlight,-.37+i*.11,1.23,.57);
  box(cabin,.32,.12,.08,dial,-.2,1.31,.57); // radio
  for(const side of [-1,1]){box(cabin,.12,1.4,.14,dash,side*.92,1.93,.99);box(cabin,.18,.34,2.1,dash,side*.95,1.02,-.05);box(cabin,.58,.85,.22,cloth,side*.48,1.05,-.85);box(cabin,.52,.18,.58,cloth,side*.48,.62,-.57);box(cabin,.3,.23,.15,cloth,side*.48,1.56,-.85)}
  box(cabin,2,.12,.45,dash,0,2.45,.9);box(cabin,.42,.19,.06,trim,0,2.23,1.0);box(cabin,.36,.13,.04,glass,0,2.23,.96);
  box(cabin,.35,.15,.33,accent,0,1.45,.91);box(cabin,.27,.09,.02,dial,0,1.48,.73); // taxi meter
  const steering=new THREE.Group();steering.position.set(.48,1.24,.57);steering.rotation.x=-.18;cabin.add(steering);
  torus(steering,.29,.035,trim,0,0,0);box(steering,.5,.045,.035,trim,0,0,0);box(steering,.05,.28,.035,trim,0,-.1,0);cylinder(steering,.085,.085,.04,accent,0,0,0,Math.PI/2);
  const gauges=[];for(const x of [.29,.67]){const face=cylinder(cabin,.14,.14,.025,trim,x,1.48,.68);face.rotation.x=Math.PI/2;const ring=torus(cabin,.13,.012,accent,x,1.48,.655);for(let tick=0;tick<9;tick++){let a=(tick/8)*Math.PI*1.4-Math.PI*.2;const mark=box(cabin,.012,.027,.01,headlight,x+Math.sin(a)*.103,1.48+Math.cos(a)*.103,.634);mark.rotation.z=-a}const needle=box(cabin,.012,.095,.02,headlight,x,1.48,.62);needle.geometry.translate(0,.045,0);gauges.push(needle)}
  const wiper=box(cabin,.035,.05,1.1,trim,-.48,1.52,1.12);wiper.rotation.y=.9;
  return {group,exterior,cabin,paint,wheels,frontPivots,steering,gauges,wiper};
}
export function animateTaxi(model, speed, steering, gear, dt, elapsed, movingEffects=true) {
  model.steering.rotation.z=-steering*.7;
  for(const pivot of model.frontPivots)pivot.rotation.y=steering*.35;
  for(const wheel of model.wheels){wheel.tire.rotation.x+=speed*gear*dt/0.43;wheel.hub.rotation.x=wheel.tire.rotation.x}
  model.gauges[0].rotation.z=-Math.min(speed/20,1)*2.2+.9;
  model.gauges[1].rotation.z=-Math.min(speed/20,1)*1.5+.7;
  model.wiper.rotation.y=movingEffects?.9+Math.sin(elapsed*1.2)*.32:.9;
}
