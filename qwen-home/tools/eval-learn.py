#!/usr/bin/env python3
"""Free-running exam for the home Qwen: base vs adapter on eval.jsonl.

Greedy CPU generation with the dataset's system prompt. Writes a JSON file
that score-learn.mjs grades by required words. This is a smoke exam, not a
measure of intelligence.
"""
import argparse
import json
from pathlib import Path

import torch
from peft import PeftModel
from transformers import AutoModelForImageTextToText, AutoTokenizer

MODEL = 'Qwen/Qwen3.5-0.8B'
REVISION = '2fc06364715b967f1860aea9cf38778875588b17'


def generate(model, tokenizer, system_prompt, instruction, max_new):
    messages = [{'role': 'system', 'content': system_prompt}, {'role': 'user', 'content': instruction}]
    text = tokenizer.apply_chat_template(messages, tokenize=False, add_generation_prompt=True, enable_thinking=True)
    inputs = tokenizer(text, return_tensors='pt')
    with torch.no_grad():
        out = model.generate(**inputs, max_new_tokens=max_new, do_sample=False, pad_token_id=tokenizer.eos_token_id)
    return tokenizer.decode(out[0][inputs['input_ids'].shape[1]:], skip_special_tokens=True).strip()


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--data', required=True, type=Path, help='dataset folder with manifest.json and eval.jsonl')
    parser.add_argument('--adapter', type=Path, help='adapter to compare against the base model')
    parser.add_argument('--output', required=True, type=Path)
    parser.add_argument('--max-new', type=int, default=320)
    args = parser.parse_args()
    manifest = json.loads((args.data / 'manifest.json').read_text())
    rows = [json.loads(line) for line in (args.data / 'eval.jsonl').read_text().splitlines() if line]
    tokenizer = AutoTokenizer.from_pretrained(MODEL, revision=REVISION)
    base = AutoModelForImageTextToText.from_pretrained(MODEL, revision=REVISION, dtype=torch.bfloat16, low_cpu_mem_usage=True)
    base.eval()
    results = []
    models = [('base', base)]
    adapter_model = None
    if args.adapter:
        adapter_model = PeftModel.from_pretrained(base, args.adapter)
        adapter_model.eval()
        models.append(('adapter', adapter_model))
    for row in rows:
        item = {'id': row['id'], 'instruction': row['instruction'], 'mustContain': row.get('mustContain', [])}
        for name, model in models:
            item[name] = generate(model, tokenizer, manifest['systemPrompt'], row['instruction'], args.max_new)
            print(f"{row['id']} [{name}] done", flush=True)
        results.append(item)
    args.output.write_text(json.dumps({'results': results}, ensure_ascii=False, indent=2) + '\n')
    print(f'wrote {len(results)} results to {args.output}', flush=True)


if __name__ == '__main__':
    main()
