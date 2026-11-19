#!/usr/bin/env python3
"""Оценка «модель находит баги» (tools/training/eval-bugs.py).

Прогоняет модель (базовую и/или с адаптером) по бенчмарку из
make-bug-bench.mjs и считает честные метрики:

  точность  — сколько файлов классифицировано верно;
  полнота   — какую долю настоящих багов нашли;
  ложные    — на скольких чистых файлах модель крикнула «баг».

Без этой оценки разговоры «модель умеет искать ошибки» ничего не стоят.

Запуск:
  python tools/training/eval-bugs.py --bench bug-bench --out eval-bugs.json
  python tools/training/eval-bugs.py --bench bug-bench --adapter adapter-out/adapter
"""
import argparse
import json
import sys
from pathlib import Path

import torch
from transformers import AutoModelForCausalLM, AutoModelForImageTextToText, AutoTokenizer

MODEL = 'Qwen/Qwen3.5-0.8B'
REVISION = '2fc06364715b967f1860aea9cf38778875588b17'

PROMPT = (
    'Ты проверяешь файл из репозитория браузерных игр на дефекты. '
    'Ответь одним JSON-объектом и ничем больше:\n'
    '{"bug": true} — если файл сломан, или {"bug": false} — если всё в порядке. '
    'Не объясняй. Не добавляй текст вокруг JSON.'
)

MAX_CHARS = 6000

sys.path.insert(0, str(Path(__file__).resolve().parent))
from answers import parse_answer  # noqa: E402


def build_ids(tok, text, system):
    """Тот же формат, что и при обучении: иначе оценка мерит не то."""
    msgs = [
        {'role': 'system', 'content': system},
        {'role': 'user', 'content': text},
    ]
    base = dict(tokenize=False, add_generation_prompt=True)
    for kwargs in ({'enable_thinking': False}, {}):
        try:
            prompt = tok.apply_chat_template(msgs, **base, **kwargs)
            break
        except (ValueError, TypeError, AttributeError):
            prompt = None
    if prompt is None:
        prompt = f'system: {system}\nuser: {text}\nassistant:'
    if not isinstance(prompt, str):
        prompt = tok.decode(prompt)
    return tok(prompt, add_special_tokens=False)['input_ids']


@torch.no_grad()
def run(model, tok, cases, bench_dir, limit_chars=MAX_CHARS):
    out = []
    for case in cases:
        text = (bench_dir / case['name']).read_text(encoding='utf-8', errors='replace')
        if len(text) > limit_chars:
            text = text[:limit_chars]
        ids = build_ids(tok, text, PROMPT)
        # У тестовых чекпойнтов словарь крошечный: токены вне его дали бы
        # IndexError. На настоящей модели это условие ничего не меняет.
        vocab = getattr(model.config, 'vocab_size', None) or len(tok)
        # Потолок позиций у моделей разный: у Qwen3.5 он большой, у тестовой
        # 1024. Без этого ограничения падает позиционное кодирование.
        max_pos = getattr(model.config, 'max_position_embeddings', None) or 1024
        # Оставляем место под ответ: вход + новые токены не должны выйти за
        # предел позиций, иначе генерация падает по индексу.
        window = max(64, min(2048, max_pos - 64))
        ids = [i for i in ids if 0 <= i < vocab][-window:]
        if not ids:
            out.append({'id': case['id'], 'expected': case['hasBug'], 'answer': None, 'raw': '<нет токенов>'})
            continue
        x = torch.tensor([ids], dtype=torch.long)
        gen = model.generate(
            input_ids=x, do_sample=False, max_new_tokens=24, use_cache=True,
            pad_token_id=tok.pad_token_id,
        )
        raw = tok.decode(gen[0, x.shape[1]:], skip_special_tokens=True, clean_up_tokenization_spaces=False)
        out.append({'id': case['id'], 'expected': case['hasBug'], 'answer': parse_answer(raw), 'raw': raw})
    return out


def score(results):
    total = len(results)
    correct = sum(1 for r in results if r['answer'] == r['expected'])
    bugs = [r for r in results if r['expected']]
    clean = [r for r in results if not r['expected']]
    found = sum(1 for r in bugs if r['answer'] is True)
    false_alarm = sum(1 for r in clean if r['answer'] is True)
    unknown = sum(1 for r in results if r['answer'] is None)
    return {
        'total': total,
        'correct': correct,
        'accuracy': round(correct / total, 3) if total else 0,
        'recall': round(found / len(bugs), 3) if bugs else 0,
        'falseAlarms': false_alarm,
        'falseAlarmRate': round(false_alarm / len(clean), 3) if clean else 0,
        'unparsed': unknown,
    }


def main():
    p = argparse.ArgumentParser()
    p.add_argument('--bench', type=Path, required=True)
    p.add_argument('--out', type=Path, required=True)
    p.add_argument('--adapter', type=Path, default=None)
    p.add_argument('--limit', type=int, default=0, help='ограничить число случаев (для быстрой проверки)')
    p.add_argument('--model', default=MODEL, help='id или локальный путь базовой модели')
    p.add_argument('--revision', default=REVISION)
    args = p.parse_args()

    manifest = json.loads((args.bench / 'manifest.json').read_text(encoding='utf-8'))
    cases = manifest['cases']
    if args.limit:
        cases = cases[:args.limit]

    tok = AutoTokenizer.from_pretrained(args.model, revision=args.revision)
    if tok.pad_token_id is None:
        tok.pad_token = tok.eos_token

    print('загружаю базовую модель…', flush=True)
    try:
        base = AutoModelForImageTextToText.from_pretrained(
            args.model, revision=args.revision, dtype=torch.float32, low_cpu_mem_usage=True,
        )
    except (ValueError, KeyError, OSError):
        # Для чисто текстовых чекпойнтов (в тестах) берём каузальный класс.
        base = AutoModelForCausalLM.from_pretrained(
            args.model, revision=args.revision, dtype=torch.float32, low_cpu_mem_usage=True,
        )
    base.eval()

    print(f'оцениваю базовую модель на {len(cases)} случаях…', flush=True)
    base_results = run(base, tok, cases, args.bench)
    base_score = score(base_results)

    report = {
        'method': 'Модель читает файл и отвечает {"bug":true|false}. Эталон известен заранее: '
                  'половина файлов — настоящие файлы репозитория, половина — они же с внесённым дефектом.',
        'bench': str(args.bench),
        'base': {'score': base_score, 'results': base_results},
    }

    if args.adapter:
        from peft import PeftModel
        print('подключаю адаптер…', flush=True)
        model = PeftModel.from_pretrained(base, args.adapter)
        model.eval()
        print('оцениваю адаптер…', flush=True)
        adapter_results = run(model, tok, cases, args.bench)
        report['adapter'] = {'score': score(adapter_results), 'results': adapter_results}

    args.out.write_text(json.dumps(report, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print(json.dumps({k: v['score'] for k, v in report.items() if isinstance(v, dict) and 'score' in v},
                     ensure_ascii=False), flush=True)


if __name__ == '__main__':
    main()
