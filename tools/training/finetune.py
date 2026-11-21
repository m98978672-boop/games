#!/usr/bin/env python3
"""LoRA-обучение на знаниях репозитория (tools/training/finetune.py).

Реально обновляет веса адаптера на данных из build-knowledge.mjs:
правила игр, каталог багов, уроки по коду, руководства «как играть».

Границы честно:
  * учится маленький LoRA-адаптер, базовая модель не меняется;
  * на выходе PEFT-адаптер, а не готовая модель для браузера;
  * качество измеряется на отложенной выборке (eval.jsonl), которой нет
    в обучении.

Запуск:
  python tools/training/finetune.py --data knowledge --out model-out --steps 256
"""
import argparse
import json
import os
import random
import time
from pathlib import Path

import torch
import torch.nn.functional as F
from peft import LoraConfig, get_peft_model
from transformers import AutoModelForCausalLM, AutoModelForImageTextToText, AutoTokenizer

MODEL = 'Qwen/Qwen3.5-0.8B'
# Фиксируем ревизию: обучение не должно зависеть от вчерашней заливки.
REVISION = '2fc06364715b967f1860aea9cf38778875588b17'
# 1024 токена — бюджет контекста, проверенный на этой модели.
BUDGET = 1024
OUTPUT_RESERVE = 96


def read_jsonl(path: Path):
    rows = []
    with path.open(encoding='utf-8') as f:
        for line in f:
            line = line.strip()
            if line:
                rows.append(json.loads(line))
    return rows


def load_split(folder: Path, split: str):
    """Читаем датасет и сверяем его с манифестом: подмена не должна пройти."""
    path = folder / f'{split}.jsonl'
    if not path.exists():
        return []
    rows = read_jsonl(path)
    manifest_path = folder / 'manifest.json'
    if manifest_path.exists():
        manifest = json.loads(manifest_path.read_text(encoding='utf-8'))
        expect = manifest.get('files', {}).get(split)
        if expect and expect.get('count') != len(rows):
            raise ValueError(f'{split}: количество не совпало с манифестом')
    return rows


def encode(tokenizer, system: str, user: str, assistant: str):
    """Готовим пару (префикс, ответ).

    Префикс и ответ токенизируем отдельно: если токенизировать всю переписку
    сразу, BPE склеит последний токен вопроса с первым токеном ответа, и
    модель будет учиться на границе, которой при генерации не существует.
    """
    messages = [
        {'role': 'system', 'content': system},
        {'role': 'user', 'content': user},
    ]
    def render(msgs, add_generation_prompt):
        """Шаблон чата модели; у чекпойнтов без шаблона собираем текст сами.

        Пробуем варианты по очереди, а не вложенными try: исключение внутри
        блока except не перехватывается соседним except, и запасной путь
        молча не срабатывал.
        """
        base = dict(tokenize=False, add_generation_prompt=add_generation_prompt)
        attempts = [
            lambda: tokenizer.apply_chat_template(msgs, enable_thinking=False, **base),
            lambda: tokenizer.apply_chat_template(msgs, **base),
        ]
        for attempt in attempts:
            try:
                out = attempt()
            except (ValueError, TypeError, AttributeError):
                continue
            # Некоторые версии возвращают список токенов вместо строки.
            return out if isinstance(out, str) else tokenizer.decode(out)
        # Запасной формат: префикс кончается на «assistant:», поэтому ответ
        # всегда отличим от вопроса.
        out = ''.join(f'{m["role"]}: {m["content"]}\n' for m in msgs)
        return out + ('assistant:' if add_generation_prompt else '')

    prefix_text = render(messages, True)
    full_text = render(messages + [{'role': 'assistant', 'content': assistant}], False)
    if not full_text.startswith(prefix_text):
        raise ValueError('шаблон чата не совпал с префиксом генерации')
    prefix = tokenizer.encode(prefix_text, add_special_tokens=False)
    target = tokenizer.encode(full_text[len(prefix_text):], add_special_tokens=False)
    if not target:
        raise ValueError('пустой ответ после шаблона')
    if len(prefix) + max(OUTPUT_RESERVE, len(target)) > BUDGET:
        raise ValueError('пример не влезает в бюджет токенов')
    return prefix, target


def example_loss(model, encoded):
    """Потеря ровно на токенах ответа — вопрос модель не «учит»."""
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
    return sum(values) / len(values) if values else float('nan')


def main():
    p = argparse.ArgumentParser()
    p.add_argument('--data', type=Path, required=True)
    p.add_argument('--out', type=Path, required=True)
    p.add_argument('--steps', type=int, default=256)
    p.add_argument('--lr', type=float, default=2e-4)
    p.add_argument('--rank', type=int, default=8)
    p.add_argument('--seed', type=int, default=4321)
    p.add_argument('--eval-count', type=int, default=8)
    p.add_argument('--model', default=MODEL, help='id или локальный путь базовой модели')
    p.add_argument('--revision', default=REVISION)
    p.add_argument('--targets', default='q_proj,v_proj',
                   help='модули для LoRA (у Qwen: q_proj,v_proj; у GPT-подобных: c_attn)')
    args = p.parse_args()

    if not 1 <= args.steps <= 5000:
        raise ValueError('steps должен быть от 1 до 5000')

    os.environ.setdefault('TOKENIZERS_PARALLELISM', 'false')
    torch.manual_seed(args.seed)
    random.seed(args.seed)
    torch.set_num_threads(int(os.getenv('OMP_NUM_THREADS', '2')))

    train = load_split(args.data, 'train')
    eval_rows = load_split(args.data, 'eval')
    if not train:
        raise ValueError('пустой train.jsonl')

    print(f'примеров: обучение {len(train)}, проверка {len(eval_rows)}', flush=True)

    tokenizer = AutoTokenizer.from_pretrained(args.model, revision=args.revision)
    if tokenizer.pad_token_id is None:
        tokenizer.pad_token = tokenizer.eos_token

    def prepare(rows, name):
        out = []
        for row in rows:
            try:
                out.append(encode(tokenizer, row['system'], row['user'], row['assistant']))
            except Exception as e:
                print(f'  пропуск ({name}):', e, flush=True)
        return out

    print('токенизирую…', flush=True)
    train_enc = prepare(train, 'обучение')
    eval_enc = prepare(eval_rows, 'проверка')
    if not train_enc:
        raise ValueError('ни один пример не подошёл по длине')
    print(f'готово: обучение {len(train_enc)}, проверка {len(eval_enc)}; '
          f'длина префикса до {max(len(p) for p, _ in train_enc)} токенов', flush=True)

    print('загружаю базовую модель…', flush=True)
    # Qwen3.5 — мультимодальная модель, поэтому сначала пробуем класс для
    # «изображение+текст». Для чисто текстовых чекпойнтов (например, в тестах)
    # откатываемся на обычный каузальный класс.
    try:
        model = AutoModelForImageTextToText.from_pretrained(
            args.model, revision=args.revision, dtype=torch.bfloat16, low_cpu_mem_usage=True,
        )
        print('  класс: AutoModelForImageTextToText', flush=True)
    except (ValueError, KeyError, OSError) as e:
        print('  мультимодальный класс не подошёл, беру текстовый:', type(e).__name__, flush=True)
        model = AutoModelForCausalLM.from_pretrained(
            args.model, revision=args.revision, dtype=torch.bfloat16, low_cpu_mem_usage=True,
        )
    model.gradient_checkpointing_enable(gradient_checkpointing_kwargs={'use_reentrant': False})
    model = get_peft_model(model, LoraConfig(
        r=args.rank, lora_alpha=args.rank * 2, lora_dropout=0.0,
        target_modules=[t.strip() for t in args.targets.split(',') if t.strip()], bias='none',
    ))
    trainable = sum(p.numel() for p in model.parameters() if p.requires_grad)
    if trainable == 0:
        raise ValueError('нет обучаемых параметров')
    print(f'обучаемых параметров: {trainable}', flush=True)

    validation = eval_enc[:max(1, args.eval_count)] if eval_enc else train_enc[:2]
    before = evaluate(model, validation)
    print(f'потеря до обучения: {before:.4f}', flush=True)

    optimizer = torch.optim.AdamW((p for p in model.parameters() if p.requires_grad), lr=args.lr)
    model.train()

    order = list(range(len(train_enc)))
    random.shuffle(order)
    losses = []
    started = time.monotonic()
    for step in range(args.steps):
        if step >= len(order):
            random.shuffle(order)
        encoded = train_enc[order[step % len(order)]]
        loss = example_loss(model, encoded)
        loss.backward()
        torch.nn.utils.clip_grad_norm_(
            [p for p in model.parameters() if p.requires_grad], 1.0,
        )
        optimizer.step()
        optimizer.zero_grad(set_to_none=True)
        losses.append(float(loss))
        if step == 0 or (step + 1) % 10 == 0:
            window = losses[-10:]
            print(f'шаг {step + 1}/{args.steps} · потеря {sum(window) / len(window):.4f} · '
                  f'{time.monotonic() - started:.0f} с', flush=True)

    after = evaluate(model, validation)
    print(f'потеря после обучения: {after:.4f}', flush=True)

    args.out.mkdir(parents=True, exist_ok=True)
    model.save_pretrained(args.out / 'adapter', safe_serialization=True)
    tokenizer.save_pretrained(args.out / 'adapter')

    report = {
        'purpose': 'LoRA на знаниях репозитория: правила игр, каталог багов, уроки по коду, '
                   'руководства «как играть». Это адаптер, а не готовая браузерная модель.',
        'base_model': args.model,
        'revision': args.revision,
        'dataset': {'train': len(train), 'eval': len(eval_rows),
                    'used_train': len(train_enc), 'used_eval': len(eval_enc)},
        'training': {
            'steps': len(losses),
            'lr': args.lr,
            'lora_rank': args.rank,
            'trainable_parameters': trainable,
            'loss_first10': sum(losses[:10]) / max(1, len(losses[:10])),
            'loss_last10': sum(losses[-10:]) / max(1, len(losses[-10:])),
            'seconds': round(time.monotonic() - started, 1),
        },
        'evaluation': {
            'method': 'средняя потеря на отложенной выборке (не входила в обучение)',
            'count': len(validation),
            'loss_before': before,
            'loss_after': after,
        },
    }
    (args.out / 'report.json').write_text(
        json.dumps(report, ensure_ascii=False, indent=2) + '\n', encoding='utf-8',
    )
    print(json.dumps(report['evaluation'], ensure_ascii=False), flush=True)


if __name__ == '__main__':
    main()
