// Optional, bounded, symmetric assistant for AI-vs-AI games. The provider sees
// only anonymous, side-relative own data; it never gets the game object.
const MAX_SQUADS=8, MAX_POINTS=8, MAX_BUILDS=6;
const cleanNum=(x)=>Number.isFinite(x)?Math.max(0,Math.min(100,Math.round(x))):0;
function localSort(game,faction,items,position){
 const h=game.world.homeHQ(faction),rotate=h&&h.x>game.world.W/2;
 const xy=o=>{const p=position(o);return rotate?{x:game.world.W-p.x,y:game.world.H-p.y}:p;};
 return items.slice().sort((a,b)=>{const A=xy(a),B=xy(b);return A.x-B.x||A.y-B.y;});
}
export function commanderSnapshot(game,faction){
 if(!game.aiVsAi||![0,1].includes(faction))throw Error('demo only');
 const squads=localSort(game,faction,[...game.squads.values()].filter(s=>s.faction===faction&&s.state!=='destroyed'&&s.count()>0),s=>s.centroid()).slice(0,MAX_SQUADS);
 const points=localSort(game,faction,game.world.points.filter(p=>p.owner===faction&&p.hp>0),p=>p).slice(0,MAX_POINTS);
 const builds=localSort(game,faction,game.build.blueprints.filter(b=>b.faction===faction&&!b.built&&!b.dead),b=>b).slice(0,MAX_BUILDS);
 return {
  time:game.time, faction,
  squads:squads.map(s=>({id:s.id,lastOrderAt:s.lastOrderAt})),points:points.map(p=>p.id),builds:builds.map(b=>b.id),
  // No names, real IDs, faction, coordinates, enemy, history, game clock or side count.
  input:{squads:squads.map(s=>({members:s.count(),ammo:cleanNum(s.ammoRatio()*100),health:cleanNum(s.hpRatio()*100),morale:cleanNum(s.morale()),engineers:s.units().filter(u=>u.role==='engineer').length})),
    points:points.map(p=>({kind:p.type,key:!!p.key})),builds:builds.map(b=>({progress:cleanNum((b.progress||0)*100)}))}
 };
}
export function validateProposal(text,snapshot){
 if(typeof text!=='string'||text.length>512)return null;
 let o;try{o=JSON.parse(text.trim());}catch{return null;}
 if(!o||Array.isArray(o)||typeof o!=='object'||typeof o.action!=='string')return null;
 if(o.action==='none')return Object.keys(o).length===1?{action:'none'}:null;
 const keys=Object.keys(o).sort().join(',');
 if(o.action==='supply'){
  if(keys!=='action,squad'||!Number.isInteger(o.squad)||!snapshot.squads[o.squad]||snapshot.input.squads[o.squad].ammo>=70)return null;
 }else if(o.action==='hold'){
  if(keys!=='action,point,squad'||!Number.isInteger(o.squad)||!snapshot.squads[o.squad]||!Number.isInteger(o.point)||!snapshot.points[o.point])return null;
 }else if(o.action==='build'){
  if(keys!=='action,build,squad'||!Number.isInteger(o.squad)||!snapshot.squads[o.squad]||!snapshot.input.squads[o.squad].engineers||!Number.isInteger(o.build)||!snapshot.builds[o.build])return null;
 }else return null;
 return o;
}
function stillValid(game,snapshot,p){
 if(p.action==='none')return true;
 const saved=snapshot.squads[p.squad],s=game.squads.get(saved.id);
 if(!s||s.faction!==snapshot.faction||s.state==='destroyed'||s.count()===0||s.lastOrderAt!==saved.lastOrderAt)return false;
 if(game.api.orders.some(o=>o.status==='queued'&&o.squadIds.includes(s.id)))return false;
 if(p.action==='supply')return s.ammoRatio()<0.7;
 if(p.action==='hold'){const point=game.world.pointById(snapshot.points[p.point]);return !!point&&point.owner===snapshot.faction&&point.hp>0;}
 if(p.action==='build'){const b=game.build.blueprints.find(b=>b.id===snapshot.builds[p.build]);return !!b&&!b.dead&&!b.built&&b.faction===snapshot.faction&&s.units().some(u=>u.role==='engineer');}
 return false;
}
function issue(game,snapshot,p){
 if(p.action==='none')return;
 const s=game.squads.get(snapshot.squads[p.squad].id);let type=p.action,target=null,params={};
 if(type==='supply'){type='resupply';target=s.centroid();}
 if(type==='hold'){const point=game.world.pointById(snapshot.points[p.point]);target={x:point.x,y:point.y,pointId:point.id};}
 if(type==='build'){const b=game.build.blueprints.find(b=>b.id===snapshot.builds[p.build]);target={x:b.x,y:b.y};params={blueprintId:b.id};}
 game.api.issue({source:'neutralAI',type,faction:snapshot.faction,squadIds:[s.id],target,params,reason:'предложение локального помощника'});
}
// All-or-nothing per pair: stale, invalid or rejected model output influences neither side.
export function applyCommanderPair(game,snapshots,texts,maxAge=45){
 if(!game.aiVsAi||game.warOver||game.paused||snapshots.length!==2||texts.length!==2||snapshots[0].faction!==0||snapshots[1].faction!==1)return {ok:false,reason:'state'};
 if(snapshots.some(s=>game.time<s.time||game.time-s.time>maxAge))return {ok:false,reason:'stale'};
 const ps=texts.map((t,i)=>validateProposal(t,snapshots[i]));
 if(ps.some(p=>!p))return {ok:false,reason:'invalid'};
 // Strict parity: never apply an assistant order to only one side. A decision
 // to do nothing is valid only when both sides chose to do nothing.
 if((ps[0].action==='none') !== (ps[1].action==='none'))return {ok:false,reason:'unpaired'};
 if(ps.some((p,i)=>!stillValid(game,snapshots[i],p)))return {ok:false,reason:'changed'};
 // Rotate submission order as well as inference order; both use the same API.
 const order=Math.floor(snapshots[0].time/25)%2?[1,0]:[0,1];
 for(const i of order)issue(game,snapshots[i],ps[i]);
 return {ok:true,actions:ps.map(p=>p.action)};
}
