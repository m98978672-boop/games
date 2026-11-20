#!/usr/bin/env python3
"""Train/evaluate a research LoRA using simulated waypoint demonstrations.
Not connected to the game. Evaluates free generation, not just loss.
"""
import argparse
import importlib.util
import json
import os
from pathlib import Path
import random
import time

spec=importlib.util.spec_from_file_location('train_helpers',Path(__file__).with_name('train-qwen.py'))
helper=importlib.util.module_from_spec(spec);spec.loader.exec_module(helper)
import torch
from peft import LoraConfig, get_peft_model
from transformers import AutoModelForImageTextToText, AutoTokenizer
from huggingface_hub import hf_hub_download
import hashlib


def main():
    p=argparse.ArgumentParser();p.add_argument('--data',type=Path,required=True);p.add_argument('--output',type=Path,required=True);p.add_argument('--steps',type=int,default=64);args=p.parse_args()
    if not 1<=args.steps<=256: raise ValueError('invalid steps')
    data={s:[json.loads(l) for l in (args.data/(s+'.jsonl')).read_text().splitlines() if l] for s in ('train','eval')}
    manifest=json.loads((args.data/'manifest.json').read_text())
    if manifest['schema']!='frontline-obstacle-game-v1':raise ValueError('wrong schema')
    if not all(data.values()) or any(len(data[s])!=manifest[s] for s in data):raise ValueError('bad data size')
    train_keys={json.dumps(r['input'],sort_keys=True) for r in data['train']}
    eval_keys={json.dumps(r['input'],sort_keys=True) for r in data['eval']}
    if train_keys & eval_keys:raise ValueError('input leakage')
    if {r['spec']['seed'] for r in data['train']} & {r['spec']['seed'] for r in data['eval']}:raise ValueError('seed leakage')
    if {(r['spec']['width'],r['spec']['height']) for r in data['train']} & {(r['spec']['width'],r['spec']['height']) for r in data['eval']}:raise ValueError('layout size leakage')
    if any(r['response'] not in ('U','D') for split in data.values() for r in split):raise ValueError('bad label')
    if any({r['response'] for r in split}!={'U','D'} for split in data.values()):raise ValueError('missing label')
    torch.manual_seed(4321);random.seed(4321);torch.set_num_threads(int(os.getenv('OMP_NUM_THREADS','2')))
    weights=hf_hub_download(helper.MODEL,'model.safetensors-00001-of-00001.safetensors',revision=helper.REVISION)
    digest=hashlib.sha256()
    with open(weights,'rb') as f:
        for chunk in iter(lambda:f.read(4*1024*1024),b''):digest.update(chunk)
    if digest.hexdigest()!='04b1c301231dd422b8860db31311ab2721511346a32cb1e079c4c4e5f1fe4696':raise ValueError('base weights mismatch')
    tokenizer=AutoTokenizer.from_pretrained(helper.MODEL,revision=helper.REVISION)
    prompt=manifest['system']
    encode=lambda r:helper.encode(tokenizer,prompt,r)
    train=[encode(r) for r in data['train']];heldout=[encode(r) for r in data['eval']]
    print('dataset',len(train),len(heldout),'max prompt',max(len(p) for p,t in train+heldout),flush=True)
    base=AutoModelForImageTextToText.from_pretrained(helper.MODEL,revision=helper.REVISION,dtype=torch.bfloat16,low_cpu_mem_usage=True);base.eval()
    def generate(model,row):
        prefix,_=encode(row);ids=torch.tensor([prefix])
        with torch.no_grad(): out=model.generate(input_ids=ids,do_sample=False,max_new_tokens=12,use_cache=True,pad_token_id=tokenizer.pad_token_id)
        generated=out[0,len(prefix):].tolist();eos=model.generation_config.eos_token_id;eos=set(eos if isinstance(eos,list) else [eos]);complete=bool(generated and generated[-1] in eos)
        raw=tokenizer.decode(generated,skip_special_tokens=True,clean_up_tokenization_spaces=False)
        choice=raw.strip() if complete and raw.strip() in ('U','D') else None
        return {'raw':raw,'choice':choice,'completed':complete,'tokens':len(generated)}
    results=[{'spec':r['spec'],'input':r['input'],'teacher':r['response'],'base':generate(base,r)} for r in data['eval']]
    print('base outputs',json.dumps([r['base']['choice'] for r in results]),flush=True)
    model=get_peft_model(base,LoraConfig(r=8,lora_alpha=16,lora_dropout=0.0,target_modules=['q_proj','v_proj'],bias='none'))
    model.gradient_checkpointing_enable(gradient_checkpointing_kwargs={'use_reentrant':False})
    trainable=sum(p.numel() for p in model.parameters() if p.requires_grad)
    opt=torch.optim.AdamW((p for p in model.parameters() if p.requires_grad),lr=2e-4)
    before=helper.evaluate(model,heldout);model.train();indices=list(range(len(train)));random.shuffle(indices);losses=[]
    args.output.mkdir(parents=True,exist_ok=True);started=time.monotonic()
    for step in range(args.steps):
        opt.zero_grad(set_to_none=True);loss=helper.example_loss(model,train[indices[step%len(indices)]])
        if not torch.isfinite(loss):raise ValueError('non-finite loss')
        loss.backward();torch.nn.utils.clip_grad_norm_((p for p in model.parameters() if p.requires_grad),1.0);opt.step();losses.append(float(loss.detach()))
        if (step+1)%8==0 or step==args.steps-1:
            model.save_pretrained(args.output/'adapter',safe_serialization=True)
            (args.output/'progress.json').write_text(json.dumps({'steps':step+1,'losses':losses})+'\n')
            print('step',step+1,'loss',round(losses[-1],5),'seconds',round(time.monotonic()-started,1),flush=True)
    model.eval();after=helper.evaluate(model,heldout)
    for result,row in zip(results,data['eval']):result['adapter']=generate(model,row)
    report={'method':'Same held-out synthetic Game.step scenes; greedy Transformers generation without grammar; no games changed.','steps':args.steps,'seed':4321,'trainable':trainable,'train_count':len(train),'eval_count':len(heldout),'heldout_loss_before':before,'heldout_loss_after':after,'train_losses':losses,'results':results}
    (args.output/'report.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
    print('evaluation',json.dumps({k:report[k] for k in ('steps','train_count','eval_count','heldout_loss_before','heldout_loss_after')}),flush=True)
if __name__=='__main__':main()
