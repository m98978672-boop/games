#!/usr/bin/env python3
"""Research: learn a constrained ONE-token U/D choice from physical rollouts.
No live game control, no neural result is installed into the game.
"""
import argparse
import hashlib
import importlib.util
import json
import os
from pathlib import Path
import random
import time
import torch
import torch.nn.functional as F
from peft import LoraConfig,get_peft_model
from transformers import AutoModelForImageTextToText,AutoTokenizer
from huggingface_hub import hf_hub_download

spec=importlib.util.spec_from_file_location('helpers',Path(__file__).with_name('train-qwen.py'))
helpers=importlib.util.module_from_spec(spec);spec.loader.exec_module(helpers)
BASE_SHA='04b1c301231dd422b8860db31311ab2721511346a32cb1e079c4c4e5f1fe4696'

def load(folder):
    manifest=json.loads((folder/'manifest.json').read_text());assert manifest['schema']=='frontline-obstacle-game-v2'
    data={}
    for s in ['train','dev','test']:
        raw=(folder/(s+'.jsonl')).read_bytes();allraw=(folder/(s+'-all.jsonl')).read_bytes()
        assert hashlib.sha256(raw).hexdigest()==manifest['counts'][s]['sha256']
        assert hashlib.sha256(allraw).hexdigest()==manifest['counts'][s]['allSha256']
        data[s]=[json.loads(x) for x in raw.splitlines()];data[s+'-all']=[json.loads(x) for x in allraw.splitlines()]
        assert len(data[s])==manifest['counts'][s]['kept'] and len(data[s+'-all'])==manifest['counts'][s]['generated']
        assert set(x['response'] for x in data[s])=={'U','D'}
    for a,b in [('train','dev'),('train','test'),('dev','test')]:
        assert not ({json.dumps(x['input'],sort_keys=True) for x in data[a+'-all']} & {json.dumps(x['input'],sort_keys=True) for x in data[b+'-all']})
        assert not ({x['spec']['seed'] for x in data[a+'-all']} & {x['spec']['seed'] for x in data[b+'-all']})
        assert not ({(x['spec']['width'],x['spec']['height']) for x in data[a+'-all']} & {(x['spec']['width'],x['spec']['height']) for x in data[b+'-all']})
    return manifest,data

def main():
    p=argparse.ArgumentParser();p.add_argument('--data',type=Path,required=True);p.add_argument('--output',type=Path,required=True);p.add_argument('--steps',type=int,default=256);args=p.parse_args()
    if not 1<=args.steps<=1024:raise ValueError('invalid steps')
    manifest,data=load(args.data);torch.set_num_threads(int(os.getenv('OMP_NUM_THREADS','2')));torch.manual_seed(8123);random.seed(8123)
    weights=hf_hub_download(helpers.MODEL,'model.safetensors-00001-of-00001.safetensors',revision=helpers.REVISION)
    h=hashlib.sha256()
    with open(weights,'rb') as f:
        for chunk in iter(lambda:f.read(4*1024*1024),b''):h.update(chunk)
    if h.hexdigest()!=BASE_SHA:raise ValueError('weight hash mismatch')
    tok=AutoTokenizer.from_pretrained(helpers.MODEL,revision=helpers.REVISION)
    choice_ids={c:tok.encode(c,add_special_tokens=False) for c in ('U','D')}
    if any(len(ids)!=1 for ids in choice_ids.values()) or choice_ids['U']==choice_ids['D']:raise ValueError('choices are not distinct single tokens')
    choice_ids={k:v[0] for k,v in choice_ids.items()}
    def encode(row):
        p,t=helpers.encode(tok,manifest['system'],{'input':row['input'],'response':row['response'] or 'U'})
        if not t or t[0]!=choice_ids[row['response'] or 'U']:raise ValueError('unexpected assistant target prefix')
        return p,choice_ids[row['response'] or 'U']
    encoded_train=[encode(x) for x in data['train']];encoded_dev=[encode(x) for x in data['dev']]
    print('dataset counts',json.dumps(manifest['counts']),'choice token ids',choice_ids,flush=True)
    model=AutoModelForImageTextToText.from_pretrained(helpers.MODEL,revision=helpers.REVISION,dtype=torch.bfloat16,low_cpu_mem_usage=True);model.eval()
    def logits(model,prefix):return model(input_ids=torch.tensor([prefix]),use_cache=False,logits_to_keep=1).logits[0,-1].float()
    def eval_decisions(model,rows):
        results=[]
        for row in rows:
            prefix,_=encode(row)
            with torch.no_grad():l=logits(model,prefix)
            # A runtime decoder restricted to the two allowable single tokens:
            # this enforces format, not correctness or physical safety.
            choice=max(('U','D'),key=lambda c:float(l[choice_ids[c]]))
            results.append({'choice':choice,'logits':{c:float(l[choice_ids[c]]) for c in ('U','D')},'decoder':'two-token constrained argmax'})
        return results
    def dev_loss(m):
        m.eval();loss=[]
        with torch.no_grad():
            for p,t in encoded_dev:loss.append(float(F.cross_entropy(logits(m,p).unsqueeze(0),torch.tensor([t]))))
        return sum(loss)/len(loss)
    before=dev_loss(model);before_test=eval_decisions(model,data['test-all'])
    model=get_peft_model(model,LoraConfig(r=8,lora_alpha=16,lora_dropout=0.0,target_modules=['q_proj','v_proj'],bias='none'))
    model.gradient_checkpointing_enable(gradient_checkpointing_kwargs={'use_reentrant':False})
    trainable=sum(p.numel() for p in model.parameters() if p.requires_grad)
    opt=torch.optim.AdamW((p for p in model.parameters() if p.requires_grad),lr=2e-4)
    args.output.mkdir(parents=True,exist_ok=True);indices=list(range(len(encoded_train)));losses=[];started=time.monotonic();model.train()
    for step in range(args.steps):
        if step%len(indices)==0:random.shuffle(indices)
        prefix,target=encoded_train[indices[step%len(indices)]]
        opt.zero_grad(set_to_none=True);loss=F.cross_entropy(logits(model,prefix).unsqueeze(0),torch.tensor([target]))
        if not torch.isfinite(loss):raise ValueError('nonfinite loss')
        loss.backward();torch.nn.utils.clip_grad_norm_((p for p in model.parameters() if p.requires_grad),1.0);opt.step();losses.append(float(loss.detach()))
        if (step+1)%16==0 or step+1==args.steps:
            model.save_pretrained(args.output/'adapter',safe_serialization=True)
            (args.output/'progress.json').write_text(json.dumps({'completed_steps':step+1,'losses':losses})+'\n')
            print('step',step+1,'loss',round(losses[-1],5),'elapsed',round(time.monotonic()-started,1),flush=True)
    model.eval();after=dev_loss(model);after_test=eval_decisions(model,data['test-all'])
    results=[]
    for r,b,a in zip(data['test-all'],before_test,after_test):results.append({'spec':r['spec'],'input':r['input'],'teacher':r['response'],'teacher_candidates':r['candidates'],'base':b,'adapter':a})
    report={'method':'Single-token constrained argmax, comparing pinned base and new LoRA on ALL held-out synthetic test scenes including cases rejected by teacher. Choices must still be replayed through Game.step. No WebLLM or ordinary game integration.', 'steps':args.steps,'seed':8123,'trainable':trainable,'dataset':manifest['counts'],'dev_choice_token_loss_before':before,'dev_choice_token_loss_after':after,'results':results}
    (args.output/'report.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
    print('report',json.dumps({k:report[k] for k in ('steps','trainable','dev_choice_token_loss_before','dev_choice_token_loss_after')}),flush=True)
if __name__=='__main__':main()
