// Side-isolated, bounded memory for the existing local neural commander.
// Only its own actual orders and radio outcomes are recorded. No opponent
// observations, raw text, coordinates, game IDs or predictions are persisted.
const TYPES=new Map([['resupply','supply'],['hold','hold'],['build','build']]);
const STATUSES=new Set(['queued','accepted','refused','cancelled']);
const ACTIONS=['supply','build','hold'];
const MAX_AGE=120, MAX_RECENT=3, MAX_COUNT=9999, MAX_PENDING=128;
const KEY_PREFIX='frontline.neural-memory.v1.side-';
const band=ammo=>ammo<30?'low':ammo<70?'medium':'high';
const key=(action,ammo,engineer)=>`${action}|${ammo}|${engineer?'1':'0'}`;

export function recentOwnOrders(game,snapshot){
 if(!game?.aiVsAi||![0,1].includes(snapshot?.faction)||!Number.isFinite(game.time)||!Array.isArray(game.api?.orders))throw Error('invalid commander memory context');
 const faction=snapshot.faction,ownSquads=snapshot.squads;
 if(!Array.isArray(ownSquads)||!Array.isArray(snapshot.points)||!Array.isArray(snapshot.builds))throw Error('invalid snapshot');
 const eligible=game.api.orders.filter(o=>{
  if(o.source!=='neutralAI'||o.faction!==faction||!TYPES.has(o.type)||!STATUSES.has(o.status)||!Number.isFinite(o.issuedAt))return false;
  if(o.issuedAt>game.time||game.time-o.issuedAt>MAX_AGE||!Array.isArray(o.squadIds)||o.squadIds.length!==1)return false;
  const squad=game.squads.get(o.squadIds[0]);return !!squad&&squad.faction===faction&&ownSquads.some(s=>s.id===squad.id);
 });
 return eligible.sort((a,b)=>b.issuedAt-a.issuedAt||b.id-a.id).slice(0,MAX_RECENT).map(o=>{
  const item={action:TYPES.get(o.type),squad:ownSquads.findIndex(s=>s.id===o.squadIds[0]),status:o.status,age:Math.min(MAX_AGE,Math.floor((game.time-o.issuedAt)/5)*5)};
  // Removed targets are never silently remapped to different points/builds.
  if(o.type==='hold'){const i=snapshot.points.indexOf(o.target?.pointId);if(i>=0)item.point=i;}
  if(o.type==='build'){const i=snapshot.builds.indexOf(o.params?.blueprintId);if(i>=0)item.build=i;}
  return item;
 });
}

export function repeatsPending(proposal,recent){
 if(!proposal||proposal.action==='none')return false;
 return recent.some(r=>r.status==='queued'&&r.action===proposal.action&&r.squad===proposal.squad&&
  (r.action!=='hold'||(Number.isInteger(r.point)&&r.point===proposal.point))&&
  (r.action!=='build'||(Number.isInteger(r.build)&&r.build===proposal.build)));
}

function readStats(storage,faction){
 if(!storage)return {};
 try{
  const raw=storage.getItem(KEY_PREFIX+faction);if(!raw||raw.length>12000)return {};
  const data=JSON.parse(raw);if(data?.version!==1||!Array.isArray(data.entries)||data.entries.length>18)return {};
  const result={};
  for(const x of data.entries){
   if(!x||!ACTIONS.includes(x.action)||!['low','medium','high'].includes(x.ammo)||typeof x.engineer!=='boolean')continue;
   if(!['accepted','refused','cancelled'].every(n=>Number.isInteger(x[n])&&x[n]>=0&&x[n]<=MAX_COUNT))continue;
   const k=key(x.action,x.ammo,x.engineer);if(result[k])continue;
   result[k]={action:x.action,ammo:x.ammo,engineer:x.engineer,accepted:x.accepted,refused:x.refused,cancelled:x.cancelled};
  }
  return result;
 }catch{return {};}
}

export class CommanderMemory {
 constructor(game,{storage}={}){
  if(!game?.aiVsAi)throw Error('memory requires AI-vs-AI');
  if(storage===undefined){try{storage=globalThis.localStorage||null;}catch{storage=null;}}
  if(storage){try{storage.getItem(KEY_PREFIX+'0');storage.getItem(KEY_PREFIX+'1');}catch{storage=null;}}
  this.game=game;this.storage=storage;this.persistent=!!storage;
  this.stats=[readStats(storage,0),readStats(storage,1)];this.pending=[];
 }
 // Only record new real commands whose side and referenced own squad can be
 // matched to the exact snapshot that was sent to the model.
 recordIssued(snapshots,orders){
  for(const o of orders){
   const f=o?.faction,action=TYPES.get(o?.type),s=[0,1].includes(f)?snapshots[f]:null;
   if(!s||s.faction!==f||o.source!=='neutralAI'||!action||!Array.isArray(o.squadIds)||o.squadIds.length!==1)continue;
   const i=s.squads.findIndex(x=>x.id===o.squadIds[0]),sq=this.game.squads.get(o.squadIds[0]);
   if(i<0||!sq||sq.faction!==f||!s.input.squads[i]||this.pending.some(x=>x.order===o))continue;
   const info=s.input.squads[i];this.pending.push({order:o,faction:f,action,ammo:band(info.ammo),engineer:info.engineers>0});
  }
  // With the normal paired 25s cadence and radio limits this is ample. If a
  // hostile host floods orders, drop oldest pending entries, never enemy data.
  if(this.pending.length>MAX_PENDING)this.pending.splice(0,this.pending.length-MAX_PENDING);
  this.poll();
 }
 poll(){
  const remaining=[];
  for(const p of this.pending){
   const status=p.order.status;
   if(status==='queued'){remaining.push(p);continue;}
   if(!['accepted','refused','cancelled'].includes(status))continue;
   const k=key(p.action,p.ammo,p.engineer),m=this.stats[p.faction];
   const x=m[k]||(m[k]={action:p.action,ammo:p.ammo,engineer:p.engineer,accepted:0,refused:0,cancelled:0});
   // Compress very old accumulated evidence so newer radio outcomes can still
   // change the summary. This is not a claim that the order achieved its goal.
   if(x.accepted+x.refused+x.cancelled>=256){for(const field of ['accepted','refused','cancelled'])x[field]=Math.floor(x[field]/2);}
   x[status]=Math.min(MAX_COUNT,x[status]+1);
   try{if(this.storage)this.storage.setItem(KEY_PREFIX+p.faction,JSON.stringify({version:1,entries:Object.values(m)}));}
   catch{this.storage=null;this.persistent=false;}
  }
  this.pending=remaining;
 }
 input(snapshot){
  if(![0,1].includes(snapshot?.faction))throw Error('invalid faction');
  const i=snapshot.input,possible=new Set(i.squads.map(s=>`${band(s.ammo)}|${s.engineers>0?'1':'0'}`));
  // Retrieve only the three most frequently observed relevant own situations.
  const experience=Object.values(this.stats[snapshot.faction]).filter(x=>possible.has(`${x.ammo}|${x.engineer?'1':'0'}`))
   .sort((a,b)=>(b.accepted+b.refused+b.cancelled)-(a.accepted+a.refused+a.cancelled)||key(a.action,a.ammo,a.engineer).localeCompare(key(b.action,b.ammo,b.engineer)))
   .slice(0,3).map(x=>({...x}));
  return {squads:i.squads.map(x=>({...x})),points:i.points.map(x=>({...x})),builds:i.builds.map(x=>({...x})),memory:{recent:recentOwnOrders(this.game,snapshot),experience}};
 }
}
