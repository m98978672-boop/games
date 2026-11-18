// Import only the published, byte-for-byte verified ZIP into WebLLM's caches.
// Cache Storage is origin-local and evictable; this is not Dropbox storage.
export const MODEL_BASE='https://huggingface.co/mlc-ai/Qwen3.5-0.8B-q4f16_1-MLC/resolve/0ec138972555613c1d7812a821778ad0398c8790/';
export const ARCHIVE_SIZE=447189776;
export const ARCHIVE_DROPBOX_HASH='c4a3d3a678dee041f7d43d039c5e7dd9b627aeb19732d3d9174b70374c3086c1';
export const MODEL_FILES=['mlc-chat-config.json','tensor-cache.json','tokenizer.json',...Array.from({length:11},(_,i)=>`params_shard_${i}.bin`)];
const hex=buffer=>Array.from(new Uint8Array(buffer),x=>x.toString(16).padStart(2,'0')).join('');
async function contentHash(file,progress){
 const hashes=[];const block=4*1024*1024;
 for(let pos=0;pos<file.size;pos+=block){
  hashes.push(new Uint8Array(await crypto.subtle.digest('SHA-256',await file.slice(pos,pos+block).arrayBuffer())));
  progress?.('verify',Math.min(pos+block,file.size)/file.size);
 }
 const joined=new Uint8Array(hashes.length*32);hashes.forEach((hash,i)=>joined.set(hash,i*32));
 return hex(await crypto.subtle.digest('SHA-256',joined));
}
// Reads ZIP local entries. The pinned archive is stored (not compressed) and
// has no data descriptors. Never extract names as paths or trust arbitrary ZIPs.
async function entries(file,names){
 const wanted=new Set(names), found=new Map();let pos=0;
 while(pos+30<=file.size && found.size<wanted.size){
  const head=new DataView(await file.slice(pos,pos+30).arrayBuffer());
  if(head.getUint32(0,true)!==0x04034b50)throw Error('Не найдены файлы модели в архиве');
  const flags=head.getUint16(6,true),method=head.getUint16(8,true),packed=head.getUint32(18,true),size=head.getUint32(22,true),nameSize=head.getUint16(26,true),extra=head.getUint16(28,true);
  if(flags&9 || method!==0 || packed!==size)throw Error('Неподдерживаемый формат архива');
  const start=pos+30+nameSize+extra,end=start+size;
  if(end>file.size||start>file.size)throw Error('Повреждённый архив');
  const name=new TextDecoder().decode(await file.slice(pos+30,pos+30+nameSize).arrayBuffer());
  if(wanted.has(name)){if(found.has(name))throw Error('Повтор файла модели');found.set(name,file.slice(start,end));}
  pos=end;
 }
 if(found.size!==wanted.size)throw Error('В архиве отсутствуют файлы модели');
 return found;
}
export async function importModelArchive(file,{progress,expectedSize=ARCHIVE_SIZE,expectedHash=ARCHIVE_DROPBOX_HASH,names=MODEL_FILES,base=MODEL_BASE}={}){
 if(!file||file.size!==expectedSize)throw Error('Неверный размер архива модели');
 if(!globalThis.crypto?.subtle||!globalThis.caches)throw Error('Браузер не поддерживает защищённое локальное хранилище');
 if(await contentHash(file,progress)!==expectedHash)throw Error('Контрольная сумма не совпала: нужен оригинальный ZIP модели');
 const found=await entries(file,names);
 const config=await caches.open('webllm/config'),model=await caches.open('webllm/model');
 const written=[];
 try{
  for(let i=0;i<names.length;i++){
   const name=names[i],cache=name==='mlc-chat-config.json'?config:model,url=new URL(name,base).href;
   // Track before put, including a partially failed replacement.
   written.push([cache,url]);
   await cache.put(url,new Response(found.get(name),{headers:{'Content-Type':'application/octet-stream'}}));
   progress?.('store',(i+1)/names.length);
  }
 }catch(error){await Promise.all(written.map(([cache,url])=>cache.delete(url)));throw error;}
 // Browsers can decline this request or evict storage later.
 try{await navigator.storage?.persist?.();}catch{}
}
