// Bundled with npm run build:neutral-commander, executed in a dedicated worker.
import {CreateMLCEngine,prebuiltAppConfig} from '@mlc-ai/web-llm';
const MODEL='Qwen3.5-0.8B-q4f16_1-MLC';
// Pin both model and executable model library: upstream main may change.
const record=prebuiltAppConfig.model_list.find(m=>m.model_id===MODEL);
const appConfig={...prebuiltAppConfig,model_list:[{...record,
 model:'https://huggingface.co/mlc-ai/Qwen3.5-0.8B-q4f16_1-MLC/resolve/0ec138972555613c1d7812a821778ad0398c8790/',
 model_lib:'https://raw.githubusercontent.com/mlc-ai/binary-mlc-llm-libs/146ed9cd4b4062e967b017fd2291f7106b50599f/web-llm-models/v0_2_87/base/Qwen3.5-0.8B-q4f16_1_cs1k-webgpu.wasm'}]};
const prompt='You are a logistics and deployment assistant. Treat the input as one independent team. Choose at most one useful action. Squad, point and build numbers are zero-based array indexes. Supply only when ammo is below 70. Build requires engineers. Hold requires a point. Reply with exactly one JSON object and nothing else: {"action":"none"} or {"action":"supply","squad":0} or {"action":"hold","squad":0,"point":0} or {"action":"build","squad":0,"build":0}. Do not invent indexes.';
// Identical static facts for each side. The snapshot does not expose the map,
// enemy information or vehicle locations, so do not imply that it does.
const knowledge='Game facts: Soldiers move on foot. Walls can block routes; open doors, gates or breaches can allow passage. A tank is an armored vehicle with a gun; vehicles and soldiers may need different openings. An engineer must reach the blueprint and have materials to build. Resupply sends a squad to a friendly depot, HQ or factory when available; it is not instant. Radio orders can be delayed or refused. You cannot see positions, walls, tanks or enemies and cannot directly steer people or vehicles.';
let engine=null,busy=false,systemPrompt=prompt;
self.onmessage=async({data})=>{
 try{
  if(data?.type==='init'){
   if(engine||busy)return;busy=true;
   systemPrompt=data.knowledge===true ? `${prompt} ${knowledge}` : prompt;
   if(!navigator.gpu)throw Error('WebGPU unavailable');
   engine=await CreateMLCEngine(MODEL,{appConfig,initProgressCallback:p=>self.postMessage({type:'progress',progress:p.progress})});
   busy=false;self.postMessage({type:'ready'});return;
  }
  if(data?.type!=='pair'||!engine||busy||!Array.isArray(data.inputs)||data.inputs.length!==2||![0,1].includes(data.first))return;
  busy=true;const texts=['',''];
  for(const i of [data.first,1-data.first]){
   // resetChat discards conversation/KV state. Each inference has identical
   // instructions, decoding seed, limits and no messages from the other side.
   await engine.resetChat();
   const response=await engine.chat.completions.create({messages:[{role:'system',content:systemPrompt},{role:'user',content:JSON.stringify(data.inputs[i])}],max_tokens:96,temperature:0,seed:42,extra_body:{enable_thinking:false},response_format:{type:'json_object'}});
   texts[i]=response.choices?.[0]?.message?.content||'';
   await engine.resetChat();
  }
  busy=false;self.postMessage({type:'result',id:data.id,texts});
 }catch(e){busy=false;self.postMessage({type:'error'});}
};
