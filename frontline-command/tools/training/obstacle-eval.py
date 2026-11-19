#!/usr/bin/env python3
"""Compare base and existing PEFT model on held-out toy routing tasks.

Synthetic four-direction maps inspired by Dead District's grid pathfinder, not
recorded gameplay. Demonstrations are in-context, not weight training.
"""
import argparse
from collections import deque
import hashlib
import json
import os
from pathlib import Path
import re

MODEL = 'Qwen/Qwen3.5-0.8B'
REVISION = '2fc06364715b967f1860aea9cf38778875588b17'
SHA256 = '04b1c301231dd422b8860db31311ab2721511346a32cb1e079c4c4e5f1fe4696'
DIRS = {'U': (0,-1), 'D': (0,1), 'L': (-1,0), 'R': (1,0)}
# The answers in demos are checked by the same independent simulator.
DEMONSTRATIONS = [
    {'id':'demo-wall', 'map':['#####', '.S#G.', '..#..', '.....'], 'answer':'DDRRUU'},
    {'id':'demo-isolated', 'map':['#####', '#S#G#', '#####'], 'answer':'NONE'},
]
CASES = [
    {'id':'gap-top', 'map':['.....', '..#..', '.S#G.', '..#..', '#####']},
    {'id':'gap-bottom-mirror', 'map':['#####', '..#..', '.G#S.', '..#..', '.....']},
    {'id':'door', 'map':['..#..', '..#..', '.S.G.', '..#..', '..#..']},
    {'id':'sealed', 'map':['..#..', '.S#G.', '..#..', '..#..', '..#..']},
]
SYSTEM = ('You are solving a grid navigation puzzle. # is an impassable wall; . is free; '
          'S is the start; G is the goal. Only U, D, L, R moves, one cell at a time. '
          'Stay inside the map and never enter #. Output only the sequence of capital '
          'letters with no spaces, or NONE if the goal is unreachable.')

def locate(grid, ch):
    hits = [(x,y) for y,row in enumerate(grid) for x,c in enumerate(row) if c == ch]
    if len(hits) != 1: raise ValueError('map must contain exactly one '+ch)
    return hits[0]

def shortest(grid):
    if not grid or not grid[0] or any(len(row) != len(grid[0]) for row in grid): raise ValueError('bad map')
    if any(c not in '.#SG' for row in grid for c in row): raise ValueError('unknown tile')
    start, goal = locate(grid,'S'), locate(grid,'G')
    queue = deque([(start,'')]); seen = {start}
    while queue:
        (x,y), path = queue.popleft()
        if (x,y) == goal: return path
        for move,(dx,dy) in DIRS.items():
            nx,ny=x+dx,y+dy
            if 0<=ny<len(grid) and 0<=nx<len(grid[0]) and grid[ny][nx]!='#' and (nx,ny) not in seen:
                seen.add((nx,ny)); queue.append(((nx,ny),path+move))
    return None

def score(grid, raw):
    best=shortest(grid); text=raw.strip()
    result={'raw':raw,'format_valid':False,'safe':False,'reached':False,'optimal':False,'unreachable_correct':False,'shortest_length': None if best is None else len(best)}
    if text == 'NONE':
        result.update(format_valid=True, safe=True, unreachable_correct=best is None)
        return result
    if not re.fullmatch(r'[UDLR]+',text): return result
    result['format_valid']=True
    x,y=locate(grid,'S'); goal=locate(grid,'G')
    for move in text:
        dx,dy=DIRS[move]; x+=dx; y+=dy
        if not (0<=y<len(grid) and 0<=x<len(grid[0])) or grid[y][x]=='#': return result
    result['safe']=True; result['reached']=(x,y)==goal
    result['optimal']=result['reached'] and best is not None and len(text)==len(best)
    return result

def prompt(case, demo):
    parts=[]
    if demo:
        for example in DEMONSTRATIONS:
            parts.append('Example map:\n'+'\n'.join(example['map'])+'\nAnswer: '+example['answer'])
    parts.append('Now solve this new map:\n'+'\n'.join(case['map'])+'\nAnswer:')
    return '\n\n'.join(parts)

def verify():
    ids=set()
    for case in DEMONSTRATIONS+CASES:
        if case['id'] in ids: raise ValueError('duplicate id')
        ids.add(case['id']); shortest(case['map'])
    for demo in DEMONSTRATIONS:
        s=score(demo['map'],demo['answer'])
        if not (s['optimal'] or s['unreachable_correct']): raise ValueError(f'bad demo {demo}')
    assert score(CASES[2]['map'],'RR')['optimal']
    assert not score(CASES[0]['map'],'RR')['safe']
    assert score(CASES[3]['map'],'NONE')['unreachable_correct']
    assert not score(CASES[0]['map'],'NONE')['unreachable_correct']
    assert not score(CASES[0]['map'],'DRRRU extra')['format_valid']

def main():
    parser=argparse.ArgumentParser(); parser.add_argument('--adapter',type=Path); parser.add_argument('--output',type=Path); parser.add_argument('--self-test',action='store_true'); args=parser.parse_args()
    verify()
    if args.self_test:
        print('Grid demonstrations, BFS and scorer self-test passed'); return
    if not args.adapter or not args.output: parser.error('--adapter and --output required')
    import torch
    from peft import PeftModel
    from safetensors.torch import load_file
    from transformers import AutoModelForImageTextToText, AutoTokenizer
    from huggingface_hub import hf_hub_download
    torch.set_num_threads(int(os.environ.get('OMP_NUM_THREADS','2')))
    weights=hf_hub_download(MODEL,'model.safetensors-00001-of-00001.safetensors',revision=REVISION)
    h=hashlib.sha256()
    with open(weights,'rb') as f:
        for chunk in iter(lambda:f.read(4*1024*1024),b''): h.update(chunk)
    if h.hexdigest()!=SHA256: raise ValueError('base weights hash mismatch')
    tensors=load_file(args.adapter/'adapter_model.safetensors')
    if not sum(torch.count_nonzero(v).item() for k,v in tensors.items() if 'lora_B' in k): raise ValueError('empty adapter')
    tok=AutoTokenizer.from_pretrained(MODEL,revision=REVISION)
    base=AutoModelForImageTextToText.from_pretrained(MODEL,revision=REVISION,dtype=torch.bfloat16,low_cpu_mem_usage=True)
    base.eval(); results=[]
    def run(model,label):
        for demo in (False,True):
            for case in CASES:
                user=prompt(case,demo)
                text=tok.apply_chat_template([{'role':'system','content':SYSTEM},{'role':'user','content':user}],tokenize=False,add_generation_prompt=True,enable_thinking=False)
                ids=torch.tensor([tok.encode(text,add_special_tokens=False)])
                with torch.no_grad():
                    out=model.generate(input_ids=ids,do_sample=False,max_new_tokens=32,use_cache=True,pad_token_id=tok.pad_token_id)
                raw=tok.decode(out[0,len(ids[0]):],skip_special_tokens=True,clean_up_tokenization_spaces=False)
                row={'model':label,'with_examples':demo,'case':case['id'],'map':case['map'],'prompt':user,**score(case['map'],raw)}
                results.append(row); print(json.dumps(row,ensure_ascii=False),flush=True)
                args.output.write_text(json.dumps({'system':SYSTEM,'demonstrations':DEMONSTRATIONS,'results':results},indent=2,ensure_ascii=False)+'\n')
    run(base,'base'); model=PeftModel.from_pretrained(base,args.adapter); model.eval(); run(model,'adapter')

if __name__=='__main__': main()
