#!/usr/bin/env python3
"""Small, CPU-capable LoRA research run on real simulation snapshots.

Produces a PEFT adapter, NOT a WebLLM model and not evidence of strategic skill.
Train/eval examples use disjoint game seeds and are labelled by a weak heuristic.
"""
import argparse
import hashlib
import json
import os
import random
import time
from pathlib import Path

import torch
import torch.nn.functional as F
from peft import LoraConfig, get_peft_model
from transformers import AutoModelForImageTextToText, AutoTokenizer
from huggingface_hub import hf_hub_download

MODEL = 'Qwen/Qwen3.5-0.8B'
REVISION = '2fc06364715b967f1860aea9cf38778875588b17'

def read_data(folder):
    manifest = json.loads((folder / 'manifest.json').read_text())
    if manifest['schema'] != 'frontline-commander-teacher-v1':
        raise ValueError('wrong dataset schema')
    if set(manifest['trainSeeds']) & set(manifest['evalSeeds']):
        raise ValueError('seed leakage')
    splits = {}
    seen = set()
    for split in ('train', 'eval'):
        raw = (folder / f'{split}.jsonl').read_bytes()
        if hashlib.sha256(raw).hexdigest() != manifest['files'][split]['sha256']:
            raise ValueError('dataset hash mismatch')
        rows = [json.loads(line) for line in raw.splitlines() if line]
        if len(rows) != manifest['files'][split]['count']:
            raise ValueError('dataset count mismatch')
        for row in rows:
            if row['seed'] not in manifest[split + 'Seeds']:
                raise ValueError('wrong seed split')
            key = json.dumps(row['input'], ensure_ascii=False, separators=(',', ':'))
            if key in seen:
                raise ValueError('duplicate input or split leakage')
            seen.add(key)
        splits[split] = rows
    return manifest, splits

def encode(tokenizer, prompt, row):
    messages = [{'role':'system','content':prompt}, {'role':'user','content':json.dumps(row['input'], ensure_ascii=False, separators=(',', ':'))}]
    prefix_text = tokenizer.apply_chat_template(messages, tokenize=False, add_generation_prompt=True, enable_thinking=False)
    full_text = tokenizer.apply_chat_template(messages + [{'role':'assistant','content':row['response']}], tokenize=False, add_generation_prompt=False, enable_thinking=False)
    if not full_text.startswith(prefix_text) or len(full_text) <= len(prefix_text):
        raise ValueError('chat template does not match generation prefix')
    # The BPE tokenizer may merge across the prompt/answer boundary if the
    # whole conversation is tokenized at once. Generation starts with the
    # separately tokenized prefix, so train on that exact prefix and suffix.
    prefix = tokenizer.encode(prefix_text, add_special_tokens=False)
    target = tokenizer.encode(full_text[len(prefix_text):], add_special_tokens=False)
    # The browser requests up to 96 output tokens, so leave that much room.
    # This uses the Transformers template; the WebLLM template can differ.
    if len(prefix) + max(96, len(target)) > 1024:
        raise ValueError(f'example exceeds 1024-token budget with output reserve: {len(prefix)}+{max(96,len(target))}')
    return prefix, target

def example_loss(model, encoded):
    prefix, target = encoded
    ids = torch.tensor([prefix + target[:-1]], dtype=torch.long)
    labels = torch.tensor(target, dtype=torch.long)
    out = model(input_ids=ids, use_cache=False, logits_to_keep=len(target))
    logits = out.logits[0].float()
    return F.cross_entropy(logits, labels)

def evaluate(model, examples):
    model.eval()
    values = []
    with torch.no_grad():
        for encoded in examples:
            values.append(float(example_loss(model, encoded)))
    return sum(values)/len(values)

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--data', required=True, type=Path)
    parser.add_argument('--output', required=True, type=Path)
    parser.add_argument('--steps', type=int, default=8)
    parser.add_argument('--eval-count', type=int, default=4)
    parser.add_argument('--seed', type=int, default=4321)
    args = parser.parse_args()
    if not 1 <= args.steps <= 1000 or not 1 <= args.eval_count <= 100:
        raise ValueError('invalid steps or eval count')
    os.environ.setdefault('TOKENIZERS_PARALLELISM', 'false')
    torch.manual_seed(args.seed); random.seed(args.seed)
    torch.set_num_threads(int(os.getenv('OMP_NUM_THREADS','2')))
    manifest, data = read_data(args.data)
    weight_path = hf_hub_download(MODEL, 'model.safetensors-00001-of-00001.safetensors', revision=REVISION)
    digest = hashlib.sha256()
    with open(weight_path,'rb') as stream:
        for chunk in iter(lambda: stream.read(4*1024*1024),b''): digest.update(chunk)
    if digest.hexdigest() != '04b1c301231dd422b8860db31311ab2721511346a32cb1e079c4c4e5f1fe4696':
        raise ValueError('upstream base weight hash mismatch')
    print('Pinned base model weights verified',flush=True)
    tokenizer = AutoTokenizer.from_pretrained(MODEL, revision=REVISION)
    train = [encode(tokenizer, manifest['prompt'], row) for row in data['train']]
    all_eval = [encode(tokenizer, manifest['prompt'], row) for row in data['eval']]
    max_prefix = max(len(prefix) for prefix, _ in train + all_eval)
    print(f'Max Transformers prefix across collected train and held-out snapshots: {max_prefix}; +96 output reserve = {max_prefix+96}/1024 (not a WebLLM template test)',flush=True)
    # Cover labels and seeds before repeating either; still a very small audit.
    pools={a:[r for r in data['eval'] if json.loads(r['response'])['action']==a] for a in ('hold','build','supply','none')}
    selected=[]
    while len(selected)<min(args.eval_count,len(data['eval'])):
        added=False
        for action in pools:
            candidates=pools[action]
            if not candidates: continue
            used={r['seed'] for r in selected}
            index=next((i for i,r in enumerate(candidates) if r['seed'] not in used),0)
            selected.append(candidates.pop(index)); added=True
            if len(selected)>=min(args.eval_count,len(data['eval'])): break
        if not added: break
    validation = [encode(tokenizer, manifest['prompt'], row) for row in selected]
    if not train or not validation: raise ValueError('empty dataset')
    print(f'Dataset: {len(train)} train, {len(data["eval"])} held out, validating {len(validation)}; token lengths {min(len(p)+len(t) for p,t in train)}–{max(len(p)+len(t) for p,t in train)}', flush=True)
    model = AutoModelForImageTextToText.from_pretrained(MODEL, revision=REVISION, dtype=torch.bfloat16, low_cpu_mem_usage=True)
    model = get_peft_model(model, LoraConfig(r=8, lora_alpha=16, lora_dropout=0.0, target_modules=['q_proj','v_proj'], bias='none'))
    model.gradient_checkpointing_enable(gradient_checkpointing_kwargs={'use_reentrant':False})
    trainable = sum(p.numel() for p in model.parameters() if p.requires_grad)
    if trainable == 0: raise ValueError('no trainable parameters')
    print(f'LoRA trainable parameters: {trainable}', flush=True)
    optimizer = torch.optim.AdamW((p for p in model.parameters() if p.requires_grad), lr=2e-4)
    before = evaluate(model, validation); print(f'Held-out teacher-forced loss before: {before:.6f}', flush=True)
    model.train();indices=list(range(len(train)));random.shuffle(indices);losses=[]
    args.output.mkdir(parents=True,exist_ok=True)
    started=time.monotonic()
    for step in range(args.steps):
        optimizer.zero_grad(set_to_none=True)
        loss=example_loss(model,train[indices[step%len(indices)]])
        if not torch.isfinite(loss): raise ValueError('non-finite training loss')
        loss.backward(); torch.nn.utils.clip_grad_norm_((p for p in model.parameters() if p.requires_grad),1.0); optimizer.step()
        losses.append(float(loss.detach())); print(f'step {step+1}/{args.steps}: loss={losses[-1]:.6f} elapsed={time.monotonic()-started:.1f}s',flush=True)
        # Preserve progress for artifact upload after an ordinary later failure.
        # This does not include optimizer state and is not a resumable checkpoint.
        model.save_pretrained(args.output / 'adapter',safe_serialization=True)
        (args.output / 'progress.json').write_text(json.dumps({'completed_steps':step+1,'requested_steps':args.steps,'losses':losses})+'\n')
    after=evaluate(model,validation);print(f'Held-out teacher-forced loss after: {after:.6f}', flush=True)
    args.output.mkdir(parents=True,exist_ok=True)
    model.save_pretrained(args.output / 'adapter',safe_serialization=True)
    report={'purpose':'Exploratory imitation of a rule-based teacher, not a trained strategic commander; PEFT adapter not usable in the game without conversion and evaluation.', 'base_model':MODEL,'revision':REVISION,'dataset_manifest':manifest,'training':{'seed':args.seed,'steps':args.steps,'lr':2e-4,'lora_rank':8,'trainable_parameters':trainable,'train_losses':losses},'evaluation':{'method':'teacher-forced mean token cross-entropy on a small action-stratified held-out sample; not generated-action quality or game win rate','max_transformers_prefix_tokens_across_dataset':max_prefix,'output_reserve_tokens':96,'count':len(validation),'samples':[{'seed':r['seed'],'swapSides':r['swapSides'],'teacher_action':json.loads(r['response'])['action']} for r in selected],'loss_before':before,'loss_after':after}}
    (args.output / 'report.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
    print(json.dumps(report['evaluation']),flush=True)

if __name__=='__main__': main()
