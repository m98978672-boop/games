#!/usr/bin/env python3
"""Offline structured action learning: heuristic imitation, NOT tactical skill.

The neural model selects among four legal action types. The rest of each command
is supplied by deterministic game-rule filtering, not by the model. This is not
free-form Qwen output or the game's browser pipeline. Side-neutral data only.
"""
import argparse,hashlib,importlib.util,json,os,random,time
from pathlib import Path
import torch
import torch.nn.functional as F
from peft import PeftModel
from transformers import AutoModelForImageTextToText,AutoTokenizer
from huggingface_hub import hf_hub_download

spec=importlib.util.spec_from_file_location('helpers',Path(__file__).with_name('train-qwen.py'))
h=importlib.util.module_from_spec(spec);spec.loader.exec_module(h)
ACTIONS=('none','supply','build','hold')
BASE_SHA='04b1c301231dd422b8860db31311ab2721511346a32cb1e079c4c4e5f1fe4696'

def candidates(inp):
    out={'none':{'action':'none'}}
    squads,points,builds=inp['squads'],inp['points'],inp['builds']
    low=next((i for i,s in enumerate(squads) if s['ammo']<70),None)
    eng=next((i for i,s in enumerate(squads) if s['engineers']>0),None)
    if low is not None:out['supply']={'action':'supply','squad':low}
    if eng is not None and builds:out['build']={'action':'build','squad':eng,'build':0}
    if squads and points:out['hold']={'action':'hold','squad':0,'point':0}
    return out

def read_data(path):
    manifest=json.loads((path/'manifest.json').read_text());data={};seen=set();seedsets=[]
    if manifest['schema']!='frontline-commander-balanced-v1':raise ValueError('wrong data schema')
    for split in ('train','dev','test'):
        meta=manifest['stats'][split];seedsets.append(set(meta['seeds']));raw=(path/f'{split}.jsonl').read_bytes()
        if hashlib.sha256(raw).hexdigest()!=meta['sha256']:raise ValueError('hash mismatch')
        rows=[json.loads(x) for x in raw.splitlines()];data[split]=rows
        if len(rows)!=meta['count']:raise ValueError('wrong count')
        for row in rows:
            key=json.dumps(row['input'],sort_keys=True,separators=(',',':'))
            if key in seen or row['seed'] not in seedsets[-1]:raise ValueError('split leakage')
            seen.add(key);p=json.loads(row['response']);legal=candidates(row['input'])
            if legal.get(p['action'])!=p:raise ValueError('label is not a legal candidate')
    if seedsets[0]&seedsets[1] or seedsets[0]&seedsets[2] or seedsets[1]&seedsets[2]:raise ValueError('seed leakage')
    return manifest,data

def select(rows,count):
    pools={a:[r for r in rows if json.loads(r['response'])['action']==a] for a in ACTIONS}
    selected=[];used=set()
    while len(selected)<count:
        added=False
        for a in ACTIONS:
            pool=pools[a]
            if not pool:continue
            # Prefer diverse seed, side and nonzero squad indices in each action.
            i=next((i for i,r in enumerate(pool) if (r['seed'],r['swapSides']) not in used and json.loads(r['response']).get('squad',0)>0),None)
            if i is None:i=next((i for i,r in enumerate(pool) if (r['seed'],r['swapSides']) not in used),0)
            r=pool.pop(i);selected.append(r);used.add((r['seed'],r['swapSides']));added=True
            if len(selected)>=count:break
        if not added:break
    return selected

def main():
    p=argparse.ArgumentParser();p.add_argument('--data',type=Path,required=True);p.add_argument('--adapter',type=Path,required=True);p.add_argument('--out',type=Path,required=True);p.add_argument('--steps',type=int,default=12);p.add_argument('--count',type=int,default=16);a=p.parse_args()
    if not 1<=a.steps<=128 or not 4<=a.count<=64:raise ValueError('bad schedule')
    a.out.mkdir(parents=True,exist_ok=True);torch.set_num_threads(int(os.getenv('OMP_NUM_THREADS','2')));torch.manual_seed(97533);random.seed(97533)
    manifest,data=read_data(a.data)
    weights=hf_hub_download(h.MODEL,'model.safetensors-00001-of-00001.safetensors',revision=h.REVISION);d=hashlib.sha256()
    with open(weights,'rb') as f:
        for b in iter(lambda:f.read(4*1024*1024),b''):d.update(b)
    if d.hexdigest()!=BASE_SHA:raise ValueError('base weights hash mismatch')
    tok=AutoTokenizer.from_pretrained(h.MODEL,revision=h.REVISION)
    ids={c:tok.encode(c,add_special_tokens=False) for c in ACTIONS}
    if any(len(v)!=1 for v in ids.values()) or len({v[0] for v in ids.values()})!=len(ACTIONS):raise ValueError('actions must be distinct single tokens')
    ids={k:v[0] for k,v in ids.items()}
    def encode(row):
        messages=[{'role':'system','content':manifest['prompt']},{'role':'user','content':json.dumps(row['input'],ensure_ascii=False,separators=(',',':'))}]
        text=tok.apply_chat_template(messages,tokenize=False,add_generation_prompt=True,enable_thinking=False)+'{"action":"'
        prefix=tok.encode(text,add_special_tokens=False)
        if len(prefix)+96>1024:raise ValueError('input exceeds safe token budget')
        return torch.tensor([prefix],dtype=torch.long)
    dev=select(data['dev'],a.count);test=select(data['test'],a.count)
    pools={label:[r for r in data['train'] if json.loads(r['response'])['action']==label and len(candidates(r['input']))>1] for label in ACTIONS}
    train_actions=[label for label in ACTIONS if pools[label]]
    if not train_actions or len(dev)<a.count or len(test)<a.count:raise ValueError('insufficient varied training/evaluation data')
    model=PeftModel.from_pretrained(AutoModelForImageTextToText.from_pretrained(h.MODEL,revision=h.REVISION,dtype=torch.bfloat16,low_cpu_mem_usage=True),a.adapter,is_trainable=True)
    model.gradient_checkpointing_enable(gradient_checkpointing_kwargs={'use_reentrant':False});params=[v for v in model.parameters() if v.requires_grad]
    if not params:raise ValueError('no trainable parameters')
    opt=torch.optim.AdamW(params,lr=3e-5)
    def logits(row):
        legal=candidates(row['input']);order=[x for x in ACTIONS if x in legal]
        z=model(input_ids=encode(row),use_cache=False,logits_to_keep=1).logits[0,-1].float()
        return legal,order,z[torch.tensor([ids[x] for x in order])]
    def evaluate(rows):
        model.eval();out=[]
        with torch.no_grad():
            for row in rows:
                legal,order,z=logits(row);chosen=order[int(z.argmax())];actual=legal[chosen];expected=json.loads(row['response'])
                out.append({'seed':row['seed'],'swapSides':row['swapSides'],'input':row['input'],'teacher':expected,'prediction':actual,'correct':actual==expected,'legalCandidates':order})
        return out
    def metrics(rows):return {'total':len(rows),'exact':sum(r['correct'] for r in rows),'by_action':{a:{'total':sum(r['teacher']['action']==a for r in rows),'exact':sum(r['correct'] and r['teacher']['action']==a for r in rows)} for a in ACTIONS}}
    before=evaluate(test);before_dev=evaluate(dev);best_score=metrics(before_dev)['exact'];model.save_pretrained(a.out/'best',safe_serialization=True)
    print('initial',json.dumps({'test':metrics(before),'dev':metrics(before_dev)}),flush=True)
    model.train();started=time.monotonic();losses=[]
    for step in range(a.steps):
        label=train_actions[step%len(train_actions)];row=random.choice(pools[label]);legal,order,z=logits(row)
        opt.zero_grad(set_to_none=True);loss=F.cross_entropy(z.unsqueeze(0),torch.tensor([order.index(label)]));loss.backward();torch.nn.utils.clip_grad_norm_(params,1.0);opt.step()
        losses.append(float(loss.detach()));print('step',step+1,'label',label,'loss',losses[-1],'elapsed',round(time.monotonic()-started,2),flush=True)
        # Save weights even if a later evaluation or job fails. Optimizer is not
        # saved, so this is diagnostic only and is not a resumable checkpoint.
        model.save_pretrained(a.out/'latest',safe_serialization=True)
        (a.out/'progress.json').write_text(json.dumps({'steps':step+1,'elapsed_seconds':time.monotonic()-started,'losses':losses})+'\n')
    after_dev=evaluate(dev);dev_score=metrics(after_dev)['exact']
    if dev_score>best_score:
        model.save_pretrained(a.out/'best',safe_serialization=True);chosen='trained';after=evaluate(test)
    else:
        chosen='initial';after=before
    report={'method':'Single-token constrained action choice plus deterministic rule-based arguments. Both models use the same action mask; this is not free generation, not battle skill, and not integrated in game.',
            'selection':'Choose trained weights only when dev exact is strictly higher; test not used for selection.',
            'training':{'steps':a.steps,'elapsed_seconds':time.monotonic()-started,'losses':losses},'dev':{'initial':metrics(before_dev),'trained':metrics(after_dev)},
            'test':{'initial':metrics(before),'selected':metrics(after),'selected_weights':chosen},'initial_test_rows':before,'selected_test_rows':after}
    (a.out/'report.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
    print('::notice::STRUCTURED_COMMANDER '+json.dumps({k:report[k] for k in ('method','selection','training','dev','test')},separators=(',',':')),flush=True)
if __name__=='__main__':main()
