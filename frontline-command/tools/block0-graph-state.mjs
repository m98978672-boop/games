// Wider state-graph diagnostic, not a save format or proof of replay.
// Reflects own properties, ordered Map/Set entries, typed-array bytes, cycles
// and aliases. Functions are represented by source, not captured closures.
// No code here is called by the game. The only excluded fields are the two
// wall-clock-dependent profiling counters identified in Walls.update().
export function captureGraph(game, { excludeFlagIds = [], excludeUnitGrid = false } = {}) {
  const ids=new Map(), nodes=[], pending=[], limitations=[];
  const excluded=(obj,key)=> (excludeUnitGrid && obj===game && key==='unitGrid') || (obj===game.walls && key==='_perfStart') || (obj===game.walls?.stats && key==='updateMs') ||
    (obj===game.cfg?.flags && excludeFlagIds.includes(key));
  function enc(v){
    if(v===null)return ['null'];
    switch(typeof v){
      case 'undefined':return ['undefined'];
      case 'boolean':return ['boolean',v];
      case 'string':return ['string',v];
      case 'number':return ['number',Number.isNaN(v)?'NaN':v===Infinity?'+Infinity':v===-Infinity?'-Infinity':Object.is(v,-0)?'-0':String(v)];
      case 'bigint':return ['bigint',v.toString()];
      case 'symbol':limitations.push('symbol identity cannot be serialized');return ['symbol',String(v.description)];
      case 'function':limitations.push('function closure state unavailable');return ['function',Function.prototype.toString.call(v)];
      case 'object': {
        if(!ids.has(v)){const id=nodes.length;ids.set(v,id);nodes.push(null);pending.push(v);}
        return ['ref',ids.get(v)];
      }
      default:throw Error('unsupported primitive');
    }
  }
  const root=enc(game);
  for(let i=0;i<pending.length;i++){
    const obj=pending[i],id=ids.get(obj),name=Object.getPrototypeOf(obj)?.constructor?.name??'null-prototype';
    if(ArrayBuffer.isView(obj)){
      const bytes=new Uint8Array(obj.buffer,obj.byteOffset,obj.byteLength);
      nodes[id]=['typed',name,Buffer.from(bytes).toString('base64')];
      continue;
    }
    if(obj instanceof ArrayBuffer){nodes[id]=['buffer',Buffer.from(obj).toString('base64')];continue;}
    if(obj instanceof Map){nodes[id]=['map',[...obj].map(([k,v])=>[enc(k),enc(v)])];continue;}
    if(obj instanceof Set){nodes[id]=['set',[...obj].map(enc)];continue;}
    if(obj instanceof Date){limitations.push('Date in state graph');nodes[id]=['date',Number.isNaN(obj.getTime())?'invalid':obj.toISOString()];continue;}
    if(obj instanceof WeakMap||obj instanceof WeakSet||obj instanceof Promise){limitations.push(`uninspectable ${name}`);nodes[id]=['uninspectable',name];continue;}
    const fields=[];
    // Property insertion order is preserved: simulation iteration can depend on it.
    for(const key of Reflect.ownKeys(obj)){
      if(typeof key==='symbol'){limitations.push('symbol-key identity cannot be serialized');}
      if(excluded(obj,key))continue;
      const d=Object.getOwnPropertyDescriptor(obj,key);
      if(!d)throw Error('property disappeared during capture');
      const k=typeof key==='symbol'?['symbol',key.description??null]:['string',key];
      if('value' in d) fields.push([k,enc(d.value),!!d.enumerable,!!d.writable,!!d.configurable]);
      else {limitations.push('accessor closure state unavailable');fields.push([k,['accessor',d.get?Function.prototype.toString.call(d.get):null,d.set?Function.prototype.toString.call(d.set):null],!!d.enumerable,!!d.configurable]);}
    }
    nodes[id]=['object',name,fields];
  }
  return {bytes:JSON.stringify({version:1,root,nodes}), nodes:nodes.length,
    limitations:[...new Set(limitations)].sort(), exclusions:['game.walls._perfStart','game.walls.stats.updateMs',...(excludeUnitGrid?['game.unitGrid']:[]),...excludeFlagIds.map(id=>`game.cfg.flags.${id}`)]};
}
// FNV-1a 32 is a compact diagnostic identifier, NOT a collision-proof hash.
// Tests compare full serialized bytes; never infer equality from this ID alone.
export function graphId(bytes){let h=0x811c9dc5;for(const b of Buffer.from(bytes,'utf8')){h^=b;h=Math.imul(h,0x01000193)>>>0;}return h.toString(16).padStart(8,'0');}
