#!/usr/bin/env python3
"""Regression test for train-learn.encode() without torch or a real model.

The Qwen chat template normalizes <think> blocks in assistant content
(newlines inside the block), so a naive string-prefix split between the
generation prompt and the full render breaks. A fake tokenizer mimics
that normalization; encode() must still split at the assistant turn and
keep the think content in the target.

Run: python3 qwen-home/tests/test_encode.py
"""
import importlib.util
import re
import sys
from pathlib import Path

spec = importlib.util.spec_from_file_location('train_learn', Path(__file__).parent.parent / 'tools' / 'train-learn.py')
# train-learn.py imports torch/peft/transformers at module level; stub them.
import types
for name in ('torch', 'torch.nn', 'torch.nn.functional', 'peft', 'transformers', 'huggingface_hub'):
    sys.modules.setdefault(name, types.ModuleType(name))
sys.modules['torch'].nn = sys.modules['torch.nn']
for mod, names in {
    'peft': ('LoraConfig', 'PeftModel', 'get_peft_model'),
    'transformers': ('AutoModelForImageTextToText', 'AutoTokenizer'),
    'huggingface_hub': ('hf_hub_download',),
}.items():
    for attr in names:
        setattr(sys.modules[mod], attr, object)
trainer = importlib.util.module_from_spec(spec)
spec.loader.exec_module(trainer)


class FakeTokenizer:
    """Renders like the Qwen template, including think normalization."""

    def apply_chat_template(self, messages, tokenize=False, add_generation_prompt=False, enable_thinking=True):
        out = ''
        for m in messages:
            content = m['content']
            if m['role'] == 'assistant':
                think = re.search(r'<think>(.*?)</think>\s*', content, re.S)
                if think:
                    rest = content[think.end():]
                    content = f"<think>\n{think.group(1)}\n</think>\n\n{rest}"
            out += f"<|im_start|>{m['role']}\n{content}<|im_end|>\n"
        if add_generation_prompt:
            out += '<|im_start|>assistant\n'
        return out

    def encode(self, text, add_special_tokens=False):
        return [ord(c) for c in text]


def main():
    tok = FakeTokenizer()
    # 1) Think-leading response: template normalization must not break it.
    prefix, target = trainer.encode(tok, 'SYS', {
        'instruction': 'Подумай и ответь.',
        'response': '<think>Считаю: 7 + 5 = 12.</think>\nСтало 12.',
    })
    head = ''.join(map(chr, prefix))
    tail = ''.join(map(chr, target))
    assert head.endswith('<|im_start|>assistant\n'), head[-40:]
    assert 'Считаю: 7 + 5 = 12.' in tail and 'Стало 12.' in tail, tail
    # 2) Plain response still uses the direct prefix path.
    prefix2, target2 = trainer.encode(tok, 'SYS', {
        'instruction': 'Что такое HTML?',
        'response': 'HTML — язык разметки.',
    })
    tail2 = ''.join(map(chr, target2))
    assert tail2.startswith('HTML — язык разметки.'), tail2
    # 3) Overlong example is skipped (None), not an exception.
    long_row = {'instruction': 'Вопрос', 'response': 'Длинный ответ. ' * 400}
    assert trainer.encode(tok, 'SYS', long_row) is None
    print('test_encode: OK (think split, plain split, length budget)')


if __name__ == '__main__':
    main()
