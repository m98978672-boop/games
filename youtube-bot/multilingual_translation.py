"""Local M2M-100 translation backend. The caller must review the result."""
import json
from functools import lru_cache

from game_text_translation import russian_game_text

MODEL = 'facebook/m2m100_418M'
REVISION = 'a84767a43c9159c5c15eb3964dce2179684647f6'
# Explicit aliases, not automatic language detection.
ALIASES = {'zh-hans': 'zh', 'zh-hant': 'zh', 'pt-br': 'pt', 'pt-pt': 'pt'}


@lru_cache(maxsize=1)
def _load_runtime():
    try:
        import torch
        from transformers import M2M100ForConditionalGeneration, M2M100Tokenizer
    except ImportError as exc:
        raise RuntimeError('M2M-100 requires torch, transformers and sentencepiece') from exc
    tokenizer = M2M100Tokenizer.from_pretrained(MODEL, revision=REVISION)
    model = M2M100ForConditionalGeneration.from_pretrained(MODEL, revision=REVISION)
    model.eval()
    return torch, tokenizer, model


def m2m_russian_text(text, *, source_language='en', context='', glossary=None):
    """Translate a known source language to Russian; context/glossary unsupported."""
    if context or glossary:
        raise ValueError('M2M-100 does not support context or glossary constraints')
    if not isinstance(source_language, str) or not source_language:
        raise ValueError('M2M-100 requires an explicit source language')
    lang = source_language.lower().replace('_', '-')
    lang = ALIASES.get(lang, lang)

    def generate(messages, **kwargs):
        torch, tokenizer, model = _load_runtime()
        if lang not in tokenizer.lang_code_to_id or lang == 'ru':
            raise ValueError('Unsupported M2M source language')
        tokenizer.src_lang = lang
        source = json.loads(messages[1]['content'])['source_text']
        encoded = tokenizer(source, return_tensors='pt', truncation=False)
        if encoded['input_ids'].shape[1] > 512:
            return ''
        with torch.inference_mode():
            tokens = model.generate(**encoded, forced_bos_token_id=tokenizer.get_lang_id('ru'),
                                    num_beams=4, max_new_tokens=512)
        if tokens[0, -1].item() != tokenizer.eos_token_id:
            return ''
        return json.dumps({'ru': tokenizer.decode(tokens[0], skip_special_tokens=True)}, ensure_ascii=False)

    # Reuse segmentation, bounded retry and number/token integrity checks.
    return russian_game_text(text, generate, source_language=lang)
