#!/usr/bin/env python3
"""Free-running CPU evaluation of an experimental PEFT adapter; not WebLLM."""
import argparse
import json
import os
from pathlib import Path
import torch
from peft import PeftModel
from transformers import AutoModelForImageTextToText, AutoTokenizer
from huggingface_hub import hf_hub_download
from safetensors.torch import load_file
import hashlib
import importlib.util
spec=importlib.util.spec_from_file_location('frontline_train_qwen',Path(__file__).with_name('train-qwen.py'))
helpers=importlib.util.module_from_spec(spec)
spec.loader.exec_module(helpers)

def main():
    p=argparse.ArgumentParser()
    p.add_argument('--data',type=Path,required=True);p.add_argument('--adapter',type=Path,required=True);p.add_argument('--output',type=Path,required=True)
    args=p.parse_args()
    torch.set_num_threads(int(os.getenv('OMP_NUM_THREADS','2')))
    manifest,data=helpers.read_data(args.data)
    # Choose different held-out battles and teacher actions when available.
    selected=[]
    for action in ('hold','build','supply'):
        candidates=[r for r in data['eval'] if json.loads(r['response'])['action']==action]
        if candidates:
            index=next((i for i,r in enumerate(candidates) if r['seed'] not in {x['seed'] for x in selected}),0)
            selected.append(candidates[index])
    if not selected: raise ValueError('no evaluation examples')
    weights=hf_hub_download(helpers.MODEL,'model.safetensors-00001-of-00001.safetensors',revision=helpers.REVISION)
    digest=hashlib.sha256()
    with open(weights,'rb') as stream:
        for chunk in iter(lambda:stream.read(4*1024*1024),b''): digest.update(chunk)
    if digest.hexdigest()!='04b1c301231dd422b8860db31311ab2721511346a32cb1e079c4c4e5f1fe4696': raise ValueError('base weights hash mismatch')
    tensors=load_file(args.adapter/'adapter_model.safetensors')
    changed=sum(torch.count_nonzero(v).item() for k,v in tensors.items() if 'lora_B' in k)
    if not changed: raise ValueError('adapter B weights are all zero; no update detected')
    print(f'Adapter has {changed} nonzero LoRA B entries',flush=True)
    tok=AutoTokenizer.from_pretrained(helpers.MODEL,revision=helpers.REVISION)
    base=AutoModelForImageTextToText.from_pretrained(helpers.MODEL,revision=helpers.REVISION,dtype=torch.bfloat16,low_cpu_mem_usage=True)
    base.eval()
    def generate(model,row):
        prefix,_=helpers.encode(tok,manifest['prompt'],row)
        ids=torch.tensor([prefix],dtype=torch.long)
        with torch.no_grad():
            output=model.generate(input_ids=ids,do_sample=False,max_new_tokens=32,use_cache=True,pad_token_id=tok.pad_token_id)
        return tok.decode(output[0,len(prefix):],skip_special_tokens=True,clean_up_tokenization_spaces=False)
    before=[]
    for row in selected:
        text=generate(base,row);before.append(text);print('base',row['seed'],row['response'],repr(text),flush=True)
    model=PeftModel.from_pretrained(base,args.adapter);model.eval();results=[]
    for row,raw in zip(selected,before):
        text=generate(model,row);print('adapter',row['seed'],row['response'],repr(text),flush=True)
        results.append({'seed':row['seed'],'swapSides':row['swapSides'],'input':row['input'],'teacher':row['response'],'base':raw,'adapter':text})
    args.output.write_text(json.dumps({'method':'Greedy CPU Transformers inference without WebLLM JSON grammar; only three held-out examples, not a battle or proof of skill.','results':results},ensure_ascii=False,indent=2)+'\n')
if __name__=='__main__':main()
