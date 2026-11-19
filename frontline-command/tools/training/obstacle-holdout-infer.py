#!/usr/bin/env python3
"""Run frozen base+LoRA on a fresh batch; no learning or per-case tuning."""
import argparse,hashlib,importlib.util,json,os
from pathlib import Path
import torch
from peft import PeftModel
from transformers import AutoModelForImageTextToText,AutoTokenizer
from huggingface_hub import hf_hub_download
from safetensors.torch import load_file
spec=importlib.util.spec_from_file_location('helpers',Path(__file__).with_name('train-qwen.py'));h=importlib.util.module_from_spec(spec);spec.loader.exec_module(h)

def main():
 p=argparse.ArgumentParser();p.add_argument('--data',type=Path,required=True);p.add_argument('--adapter',type=Path,required=True);p.add_argument('--output',type=Path,required=True);a=p.parse_args()
 torch.set_num_threads(int(os.getenv('OMP_NUM_THREADS','2')))
 data=json.loads(a.data.read_text());assert len(data['rows'])==48
 weights=hf_hub_download(h.MODEL,'model.safetensors-00001-of-00001.safetensors',revision=h.REVISION);sha=hashlib.sha256()
 with open(weights,'rb') as f:
  for b in iter(lambda:f.read(4*1024*1024),b''):sha.update(b)
 if sha.hexdigest()!='04b1c301231dd422b8860db31311ab2721511346a32cb1e079c4c4e5f1fe4696':raise ValueError('weight hash mismatch')
 tensors=load_file(a.adapter/'adapter_model.safetensors')
 if not sum(torch.count_nonzero(v).item() for k,v in tensors.items() if 'lora_B' in k):raise ValueError('empty adapter')
 tok=AutoTokenizer.from_pretrained(h.MODEL,revision=h.REVISION);ids={c:tok.encode(c,add_special_tokens=False) for c in ['U','D']}
 if any(len(x)!=1 for x in ids.values()) or ids['U']==ids['D']:raise ValueError('unexpected tokenization')
 ids={c:x[0] for c,x in ids.items()}
 model=AutoModelForImageTextToText.from_pretrained(h.MODEL,revision=h.REVISION,dtype=torch.bfloat16,low_cpu_mem_usage=True);model.eval()
 def run(model):
  out=[]
  for r in data['rows']:
   prefix,target=h.encode(tok,data['system'],{'input':r['input'],'response':'U'})
   if target[0]!=ids['U']:raise ValueError('bad token prefix')
   with torch.no_grad():logits=model(input_ids=torch.tensor([prefix]),use_cache=False,logits_to_keep=1).logits[0,-1].float()
   vals={c:float(logits[ids[c]]) for c in ids};out.append({'choice':max(('U','D'),key=lambda c:vals[c]),'logits':vals})
  return out
 base=run(model);model=PeftModel.from_pretrained(model,a.adapter);model.eval();adapted=run(model)
 output={'method':'Frozen model, same two-token constrained decoder as v2; 48 fresh synthetic scenes; no model adaptation or live inference in a match.','results':[{'spec':r['spec'],'input':r['input'],'base':b,'adapter':v} for r,b,v in zip(data['rows'],base,adapted)]}
 a.output.write_text(json.dumps(output,ensure_ascii=False,indent=2)+'\n');print('completed',len(output['results']))
if __name__=='__main__':main()
