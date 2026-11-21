#!/usr/bin/env python3
"""Kvenya answers in the dialogue file with her own model.

Reads qwen-home/talk/dialogue.md, finds the last owner message without
her reply, generates one with the base model + home adapter and appends
it to the same file. Persona comes from qwen-home/talk/persona.md.
Runs in GitHub Actions (the sandbox has no model access); the workflow
commits the updated dialogue back to the branch.

Usage: python3 talk-generate.py --adapter PATH_TO_ADAPTER (optional)
"""
import argparse
import json
import re
from pathlib import Path

import torch
from peft import PeftModel
from transformers import AutoModelForImageTextToText, AutoTokenizer

# Pinned exactly as in qwen-home/tools/train-learn.py.
MODEL = 'Qwen/Qwen3.5-0.8B'
REVISION = '2fc06364715b967f1860aea9cf38778875588b17'

HOME = Path(__file__).resolve().parent.parent
DIALOGUE = HOME / 'talk' / 'dialogue.md'
PERSONA = HOME / 'talk' / 'persona.md'
LAST_REPLY = HOME / 'talk' / 'last-reply.txt'


def parse_turns(text):
    """Turns are blocks: 'Владелец: ...' / 'Квеня: ...' possibly multiline."""
    turns = []
    current = None
    for line in text.splitlines():
        if line.startswith('Владелец:'):
            if current:
                turns.append(current)
            current = ('user', line[len('Владелец:'):].strip())
        elif line.startswith('Квеня:'):
            if current:
                turns.append(current)
            current = ('assistant', line[len('Квеня:'):].strip())
        elif current and line.strip():
            role, body = current
            current = (role, (body + '\n' + line.strip()).strip())
    if current:
        turns.append(current)
    return [(role, body) for role, body in turns if body]


def clean_reply(text):
    text = re.sub(r'<think>.*?</think>', '', text, flags=re.S).strip()
    text = re.sub(r'^(Квеня|Qwen)\s*:\s*', '', text).strip()
    for marker in ('\nВладелец:', '\nКвеня:', '\nВладелец', '\nUser:'):
        if marker in text:
            text = text.split(marker)[0].strip()
    return text


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--adapter', type=Path, help='home adapter folder; without it the base model answers')
    parser.add_argument('--max-new', type=int, default=180)
    args = parser.parse_args()
    text = DIALOGUE.read_text(encoding='utf-8')
    turns = parse_turns(text)
    if not turns or turns[-1][0] != 'user':
        print('Нечего отвечать: последнее слово не за владельцем.')
        return
    persona = PERSONA.read_text(encoding='utf-8').strip()
    history = turns[-(9):-1] if len(turns) > 1 else []
    messages = [{'role': 'system', 'content': persona}]
    for role, body in history:
        messages.append({'role': role, 'content': body})
    messages.append({'role': 'user', 'content': turns[-1][1]})
    tokenizer = AutoTokenizer.from_pretrained(MODEL, revision=REVISION)
    model = AutoModelForImageTextToText.from_pretrained(MODEL, revision=REVISION, dtype=torch.bfloat16, low_cpu_mem_usage=True)
    if args.adapter and args.adapter.exists():
        model = PeftModel.from_pretrained(model, args.adapter)
        print(f'Адаптер подключён: {args.adapter}', flush=True)
    else:
        print('ВНИМАНИЕ: отвечаю базовой моделью без домашнего адаптера', flush=True)
    model.eval()
    prompt = tokenizer.apply_chat_template(messages, tokenize=False, add_generation_prompt=True, enable_thinking=False)
    inputs = tokenizer(prompt, return_tensors='pt')
    torch.manual_seed(42 + len(turns))
    with torch.no_grad():
        out = model.generate(**inputs, max_new_tokens=args.max_new, do_sample=True, temperature=0.7, top_p=0.9, pad_token_id=tokenizer.eos_token_id)
    reply = clean_reply(tokenizer.decode(out[0][inputs['input_ids'].shape[1]:], skip_special_tokens=True))
    if not reply:
        reply = 'Я задумалась и потеряла мысль. Спроси меня ещё раз, пожалуйста!'
    DIALOGUE.write_text(text.rstrip() + f'\n\nКвеня: {reply}\n', encoding='utf-8')
    LAST_REPLY.write_text(reply + '\n', encoding='utf-8')
    print('ОТВЕТ КВЕНИ:')
    print(reply)
    notice = reply.replace('%', '%25').replace('\r', '%0D').replace('\n', '%0A')
    print(f'::notice::КВЕНЯ: {notice}')


if __name__ == '__main__':
    main()
