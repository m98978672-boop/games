// Bundled with npm run build:neutral-commander, executed in a dedicated worker.
import {CreateMLCEngine,prebuiltAppConfig} from '@mlc-ai/web-llm';
import {commanderPrompt} from './commander-prompts.js';
const MODEL='Qwen3.5-0.8B-q4f16_1-MLC';
// Pin both model and executable model library: upstream main may change.
const record=prebuiltAppConfig.model_list.find(m=>m.model_id===MODEL);
const appConfig={...prebuiltAppConfig,model_list:[{...record,
 model:'https://huggingface.co/mlc-ai/Qwen3.5-0.8B-q4f16_1-MLC/resolve/0ec138972555613c1d7812a821778ad0398c8790/',
 model_lib:'https://raw.githubusercontent.com/mlc-ai/binary-mlc-llm-libs/146ed9cd4b4062e967b017fd2291f7106b50599f/web-llm-models/v0_2_87/base/Qwen3.5-0.8B-q4f16_1_cs1k-webgpu.wasm'}]};
let engine=null,busy=false,systemPrompt=commanderPrompt();
self.onmessage=async({data})=>{
 try{
  if(data?.type==='init'){
   if(engine||busy)return;busy=true;
   systemPrompt=commanderPrompt(data.knowledge===true);
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
