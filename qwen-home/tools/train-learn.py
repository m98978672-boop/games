#!/usr/bin/env python3
"""Continued LoRA learning for the home Qwen (thinking, Wikipedia, web code).

Same pinned base, weight-hash check and LoRA configuration as the commander
research trainer (frontline-command/tools/training/train-qwen.py), but the
dataset is plain instruction/response rows (schema frontline-qwen-learn-v1)
and training can continue from the previous home adapter (--initial-adapter).
This produces a research PEFT adapter. It is NOT a WebLLM model, not the
game's commander adapter and not evidence of general intelligence.
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
from peft import LoraConfig, PeftModel, get_peft_model
from transformers import AutoModelForImageTextToText, AutoTokenizer
from huggingface_hub import hf_hub_download

# Pinned exactly as in frontline-command/tools/training/train-qwen.py;
# qwen-home/tests/learn.mjs fails if these drift apart.
MODEL = 'Qwen/Qwen3.5-0.8B'
REVISION = '2fc06364715b967f1860aea9cf38778875588b17'
BASE_SHA = '04b1c301231dd422b8860db31311ab2721511346a32cb1e079c4c4e5f1fe4696'
MAX_TOKENS = 1024


def read_data(folder):
    manifest = json.loads((folder / 'manifest.json').read_text())
    if manifest['schema'] != 'frontline-qwen-learn-v1':
        raise ValueError('wrong dataset schema')
    rows = {}
    for split in ('train', 'eval'):
        raw = (folder / f'{split}.jsonl').read_bytes()
        if hashlib.sha256(raw).hexdigest() != manifest['files'][split]['sha256']:
            raise ValueError('dataset hash mismatch')
        rows[split] = [json.loads(line) for line in raw.splitlines() if line]
        if len(rows[split]) != manifest['files'][split]['count']:
            raise ValueError('dataset count mismatch')
    return manifest, rows


def render(tokenizer, messages, generation=False):
    # Thinking stays enabled: the lessons teach the model to emit <think>
    # itself. With enable_thinking=False the Qwen template forces an empty
    # think block into the generation prompt and normalizes think blocks in
    # assistant content, which breaks the naive string-prefix split below.
    return tokenizer.apply_chat_template(messages, tokenize=False, add_generation_prompt=generation, enable_thinking=True)


def encode(tokenizer, system_prompt, row):
    messages = [{'role': 'system', 'content': system_prompt}, {'role': 'user', 'content': row['instruction']}]
    prefix_text = render(tokenizer, messages, generation=True)
    full_text = render(tokenizer, messages + [{'role': 'assistant', 'content': row['response']}])
    if full_text.startswith(prefix_text) and len(full_text) > len(prefix_text):
        head, tail = prefix_text, full_text[len(prefix_text):]
    else:
        # Find where the template puts assistant content (it may normalize
        # <think> blocks), via a sentinel message, and split there instead.
        sentinel = 'ZZZSENTINELZZZ'
        marked = render(tokenizer, messages + [{'role': 'assistant', 'content': sentinel}])
        cut = marked.find(sentinel)
        if cut < 0 or not full_text.startswith(marked[:cut]):
            raise ValueError('chat template does not match generation prefix')
        head, tail = marked[:cut], full_text[len(marked[:cut]):]
    # Tokenize prefix and suffix separately, exactly like train-qwen.py:
    # generation starts from the separately tokenized prefix.
    prefix = tokenizer.encode(head, add_special_tokens=False)
    target = tokenizer.encode(tail, add_special_tokens=False)
    if len(prefix) + max(64, len(target)) > MAX_TOKENS:
        return None  # too long for the budget: skipped, counted by caller
    return prefix, target


def example_loss(model, encoded):
    prefix, target = encoded
    ids = torch.tensor([prefix + target[:-1]], dtype=torch.long)
    labels = torch.tensor(target, dtype=torch.long)
    out = model(input_ids=ids, use_cache=False, logits_to_keep=len(target))
    return F.cross_entropy(out.logits[0].float(), labels)


def evaluate(model, examples):
    model.eval()
    with torch.no_grad():
        values = [float(example_loss(model, e)) for e in examples]
    return sum(values) / len(values)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--data', required=True, type=Path)
    parser.add_argument('--output', required=True, type=Path)
    parser.add_argument('--initial-adapter', type=Path)
    parser.add_argument('--steps', type=int, default=60)
    parser.add_argument('--seed', type=int, default=20261116)
    parser.add_argument('--lr', type=float, default=2e-4)
    args = parser.parse_args()
    if not 1 <= args.steps <= 2000:
        raise ValueError('invalid steps')
    os.environ.setdefault('TOKENIZERS_PARALLELISM', 'false')
    torch.manual_seed(args.seed); random.seed(args.seed)
    torch.set_num_threads(int(os.getenv('OMP_NUM_THREADS', '2')))
    manifest, data = read_data(args.data)
    weight_path = hf_hub_download(MODEL, 'model.safetensors-00001-of-00001.safetensors', revision=REVISION)
    digest = hashlib.sha256()
    with open(weight_path, 'rb') as stream:
        for chunk in iter(lambda: stream.read(4 * 1024 * 1024), b''):
            digest.update(chunk)
    if digest.hexdigest() != BASE_SHA:
        raise ValueError('upstream base weight hash mismatch')
    print('Pinned base model weights verified', flush=True)
    tokenizer = AutoTokenizer.from_pretrained(MODEL, revision=REVISION)
    encoded, skipped = [], 0
    for row in data['train']:
        item = encode(tokenizer, manifest['systemPrompt'], row)
        if item is None:
            skipped += 1
        else:
            encoded.append(item)
    if len(encoded) < 8:
        raise ValueError('dataset too small after token budget filtering')
    validation = encoded[-8:]
    train = encoded[:-8]
    print(f'Dataset: {len(train)} train, {len(validation)} validation, skipped-too-long {skipped}; kinds {manifest["counts"]}', flush=True)
    model = AutoModelForImageTextToText.from_pretrained(MODEL, revision=REVISION, dtype=torch.bfloat16, low_cpu_mem_usage=True)
    if args.initial_adapter:
        # is_trainable=True is required: by default PEFT loads an adapter
        # frozen for inference and continued training gets 0 trainable
        # parameters (second lesson run died exactly on this).
        model = PeftModel.from_pretrained(model, args.initial_adapter, is_trainable=True)
        print(f'Continuing from adapter: {args.initial_adapter}', flush=True)
    else:
        model = get_peft_model(model, LoraConfig(r=8, lora_alpha=16, lora_dropout=0.0, target_modules=['q_proj', 'v_proj'], bias='none'))
    model.gradient_checkpointing_enable(gradient_checkpointing_kwargs={'use_reentrant': False})
    trainable = sum(p.numel() for p in model.parameters() if p.requires_grad)
    if trainable == 0:
        raise ValueError('no trainable parameters')
    print(f'LoRA trainable parameters: {trainable}', flush=True)
    optimizer = torch.optim.AdamW((p for p in model.parameters() if p.requires_grad), lr=args.lr)
    before = evaluate(model, validation)
    print(f'Held-out teacher-forced loss before: {before:.6f}', flush=True)
    model.train()
    indices = list(range(len(train))); random.shuffle(indices)
    losses = []
    args.output.mkdir(parents=True, exist_ok=True)
    started = time.monotonic()
    for step in range(args.steps):
        optimizer.zero_grad(set_to_none=True)
        loss = example_loss(model, train[indices[step % len(indices)]])
        if not torch.isfinite(loss):
            raise ValueError('non-finite training loss')
        loss.backward()
        torch.nn.utils.clip_grad_norm_((p for p in model.parameters() if p.requires_grad), 1.0)
        optimizer.step()
        losses.append(float(loss.detach()))
        print(f'step {step + 1}/{args.steps}: loss={losses[-1]:.6f} elapsed={time.monotonic() - started:.1f}s', flush=True)
        model.save_pretrained(args.output / 'adapter', safe_serialization=True)
        (args.output / 'progress.json').write_text(json.dumps({'completed_steps': step + 1, 'requested_steps': args.steps, 'losses': losses}) + '\n')
    after = evaluate(model, validation)
    print(f'Held-out teacher-forced loss after: {after:.6f}', flush=True)
    model.save_pretrained(args.output / 'adapter', safe_serialization=True)
    report = {
        'purpose': 'Continued home learning (thinking format, Wikipedia reading, basic web code). Research adapter only: not a WebLLM model, not the game commander, not proof of skill.',
        'base_model': MODEL, 'revision': REVISION,
        'initial_adapter': str(args.initial_adapter) if args.initial_adapter else None,
        'dataset_counts': manifest['counts'],
        'training': {'seed': args.seed, 'steps': args.steps, 'lr': args.lr, 'trainable_parameters': trainable, 'skipped_too_long': skipped, 'train_losses': losses},
        'evaluation': {'method': 'teacher-forced mean token cross-entropy on 8 held-out train rows; generation quality is measured by eval-learn.py', 'loss_before': before, 'loss_after': after},
    }
    (args.output / 'report.json').write_text(json.dumps(report, ensure_ascii=False, indent=2) + '\n')
    print(json.dumps(report['evaluation']), flush=True)


if __name__ == '__main__':
    main()
