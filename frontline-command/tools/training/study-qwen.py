#!/usr/bin/env python3
"""Small, controlled study of Qwen3.5-0.8B; no game integration or training."""
import argparse
import hashlib
import importlib.util
import json
import os
from pathlib import Path
import time

spec=importlib.util.spec_from_file_location('obstacle_eval',Path(__file__).with_name('obstacle-eval.py'))
nav=importlib.util.module_from_spec(spec); spec.loader.exec_module(nav)


def self_test():
    nav.verify()
    # Absence of an end-think marker must not be mistaken for an answer.
    assert extract([1,2,3], 9, True, lambda ids: ''.join(map(str,ids))) == (None,False)
    assert extract([1,9,2], 9, True, lambda ids: ''.join(map(str,ids))) == ('2',True)
    assert extract([1,2], 9, False, lambda ids: ''.join(map(str,ids))) == ('12',True)


def extract(ids, marker, thinking, decode):
    if thinking:
        if marker not in ids: return None,False
        # Last marker is consistent with Qwen's recommended parser.
        ids=ids[len(ids)-1-ids[::-1].index(marker)+1:]
    return decode(ids),True


def main():
    p=argparse.ArgumentParser();p.add_argument('--adapter',type=Path);p.add_argument('--output',type=Path);p.add_argument('--self-test',action='store_true');args=p.parse_args()
    self_test()
    if args.self_test: print('Qwen study parser and navigation scorer OK'); return
    if not args.adapter or not args.output: p.error('--adapter and --output required')
    import torch
    from transformers import AutoModelForImageTextToText, AutoTokenizer
    from peft import PeftModel
    from safetensors.torch import load_file
    from huggingface_hub import hf_hub_download
    torch.set_num_threads(int(os.environ.get('OMP_NUM_THREADS','2')))
    weights=hf_hub_download(nav.MODEL,'model.safetensors-00001-of-00001.safetensors',revision=nav.REVISION)
    h=hashlib.sha256()
    with open(weights,'rb') as f:
        for b in iter(lambda:f.read(4*1024*1024),b''):h.update(b)
    if h.hexdigest()!=nav.SHA256: raise ValueError('wrong weights')
    tensors=load_file(args.adapter/'adapter_model.safetensors')
    if not sum(torch.count_nonzero(v).item() for k,v in tensors.items() if 'lora_B' in k):raise ValueError('empty adapter')
    tok=AutoTokenizer.from_pretrained(nav.MODEL,revision=nav.REVISION)
    marker_ids=tok.encode('</think>',add_special_tokens=False)
    if len(marker_ids)!=1: raise ValueError('unexpected end-think token')
    marker=marker_ids[0]
    model=AutoModelForImageTextToText.from_pretrained(nav.MODEL,revision=nav.REVISION,dtype=torch.bfloat16,low_cpu_mem_usage=True);model.eval()
    results=[]
    # Same prompts for every condition; one seed per case, shared across models.
    modes=[('greedy',False,False,64),('sample',False,True,64),('thinking_sample',True,True,256)]
    def generate(model,label,mode,thinking,sample,budget,case_id,system,user,seed,grid=None):
        torch.manual_seed(seed)
        messages=([{'role':'system','content':system}] if system else [])+[{'role':'user','content':user}]
        text=tok.apply_chat_template(messages,tokenize=False,add_generation_prompt=True,enable_thinking=thinking)
        ids=torch.tensor([tok.encode(text,add_special_tokens=False)])
        kw={'do_sample':sample,'max_new_tokens':budget,'use_cache':True,'pad_token_id':tok.pad_token_id}
        # Temperature/top-p/top-k follow the model card's text recommendations.
        # Transformers doesn't expose the same presence_penalty in this harness.
        if sample: kw.update(temperature=1.0,top_p=0.95 if thinking else 1.0,top_k=20)
        start=time.monotonic()
        with torch.no_grad(): out=model.generate(input_ids=ids,**kw)
        elapsed=time.monotonic()-start
        generated=out[0,len(ids[0]):].tolist()
        answer,has_final=extract(generated,marker,thinking,lambda a:tok.decode(a,skip_special_tokens=True,clean_up_tokenization_spaces=False))
        eos=model.generation_config.eos_token_id
        eos=set(eos if isinstance(eos,list) else [eos])
        terminated=bool(generated and generated[-1] in eos)
        row={'model':label,'mode':mode,'case':case_id,'seed':seed,'generated_tokens':len(generated),'budget':budget,'seconds':round(elapsed,2),'ended_with_eos':terminated,'has_final':has_final,'answer':answer}
        if grid is not None:
            row['map']=grid
            row['score']=nav.score(grid,answer) if has_final and answer is not None and terminated else None
        else:
            row['question']=user
        results.append(row)
        args.output.write_text(json.dumps({'results':results},ensure_ascii=False,indent=2)+'\n')
        print(json.dumps(row,ensure_ascii=False),flush=True)
    def run(m,label):
        for mode,thinking,sample,budget in modes:
            for n,case in enumerate(nav.CASES):
                generate(m,label,mode,thinking,sample,budget,case['id'],nav.SYSTEM,nav.prompt(case,False),700+n,case['map'])
        for n,question in enumerate(['What is 2 + 3? Reply with the number only.','Сколько будет два плюс три? Ответь только числом.']):
            generate(m,label,'sanity_sample',False,True,64,'sanity-'+str(n),None,question,800+n)
    run(model,'base')
    adapted=PeftModel.from_pretrained(model,args.adapter); adapted.eval();run(adapted,'adapter')

if __name__=='__main__':main()
