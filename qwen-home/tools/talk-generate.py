#!/usr/bin/env python3
"""Kvenya answers in the dialogue file with her own model.

Reads qwen-home/talk/dialogue.md, finds the last owner message without
her reply, generates one with the base model + home adapter and appends
it to the same file. Persona comes from qwen-home/talk/persona.md.

She can search: before answering, the model decides whether it needs
facts (or the owner explicitly asks to search). Then this script —
her "hands" — queries the Russian Wikipedia API, puts the found text
into her context and logs the search to memory/search-log.md. She
answers from the found text and names the article. That is the whole
internet she has: Russian Wikipedia, searched on demand.

Runs in GitHub Actions (the sandbox has no model access); the workflow
commits the updated dialogue back to the branch.

Usage: python3 talk-generate.py --adapter PATH_TO_ADAPTER (optional)
"""
import argparse
import json
import re
import urllib.parse
import urllib.request
from datetime import datetime, timezone
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
SEARCH_LOG = HOME / 'memory' / 'search-log.md'
WIKI_API = 'https://ru.wikipedia.org/w/api.php'

SEARCH_WORDS = re.compile(r'(поищи|найди|узнай|погугли|загугли|поиск)', re.I)
STRIP_WORDS = re.compile(r'(квеня|поищи|найди|узнай|посмотри|пожалуйста|в википедии|в интернете|поиске|мне)', re.I)


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


def generate(model, tokenizer, messages, max_new, sample):
    prompt = tokenizer.apply_chat_template(messages, tokenize=False, add_generation_prompt=True, enable_thinking=False)
    inputs = tokenizer(prompt, return_tensors='pt')
    kwargs = dict(max_new_tokens=max_new, pad_token_id=tokenizer.eos_token_id)
    if sample:
        kwargs.update(do_sample=True, temperature=0.7, top_p=0.9)
    else:
        kwargs.update(do_sample=False)
    with torch.no_grad():
        out = model.generate(**inputs, **kwargs)
    return tokenizer.decode(out[0][inputs['input_ids'].shape[1]:], skip_special_tokens=True).strip()


def forced_query(owner_text):
    """The owner explicitly asked to search: build a query from the words."""
    if not SEARCH_WORDS.search(owner_text):
        return None
    query = STRIP_WORDS.sub(' ', owner_text)
    query = re.sub(r'[^\w\s\-\u0400-\u04FF]', ' ', query)
    query = re.sub(r'\s+', ' ', query).strip()
    return query or owner_text


def decide_search(model, tokenizer, owner_text):
    """Ask the model itself: does this need a Wikipedia search?"""
    messages = [
        {'role': 'system', 'content': 'Ты решаешь, нужен ли поиск в русской Википедии для ответа на сообщение. Отвечай ТОЛЬКО одной строкой: «ПОИСК: короткий запрос» — если спрашивают факт, дату, имя, место, событие или просят найти информацию; или «БЕЗ ПОИСКА» — если это обычный разговор, приветствие или вопрос о самой Квене.'},
        {'role': 'user', 'content': owner_text},
    ]
    raw = generate(model, tokenizer, messages, max_new=48, sample=False)
    print(f'Решение о поиске: {raw!r}', flush=True)
    if 'ПОИСК' in raw.upper() and 'БЕЗ ПОИСКА' not in raw.upper():
        query = raw.split(':', 1)[1].strip() if ':' in raw else ''
        return query or owner_text
    return None


def search_wikipedia(query, limit=3):
    """Her hands: query Russian Wikipedia, return title/url/extract list."""
    params = urllib.parse.urlencode({
        'action': 'query', 'format': 'json', 'formatversion': '2',
        'generator': 'search', 'gsrnamespace': '0', 'gsrsearch': query,
        'gsrlimit': str(limit), 'prop': 'extracts|info', 'inprop': 'url',
        'explaintext': '1',
    })
    request = urllib.request.Request(f'{WIKI_API}?{params}', headers={'User-Agent': 'KvenyaHome/1.0 (qwen-home talk search)'})
    try:
        with urllib.request.urlopen(request, timeout=30) as response:
            data = json.load(response)
    except Exception as error:
        print(f'Поиск не удался: {error}', flush=True)
        return []
    pages = data.get('query', {}).get('pages', [])
    results = []
    for page in sorted(pages, key=lambda p: p.get('index', 99)):
        extract = re.sub(r'\s+', ' ', page.get('extract', '')).strip()
        if page.get('title') and extract:
            results.append({'title': page['title'], 'url': page.get('fullurl', ''), 'extract': extract[:1200]})
    return results


def log_search(query, results):
    stamp = datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M UTC')
    lines = [f'## {stamp} — «{query}»', '']
    if results:
        lines += [f'- [{r["title"]}]({r["url"]})' for r in results]
    else:
        lines.append('- Ничего не нашлось.')
    lines.append('')
    SEARCH_LOG.parent.mkdir(parents=True, exist_ok=True)
    old = SEARCH_LOG.read_text(encoding='utf-8') if SEARCH_LOG.exists() else '# Журнал поисков Квени\n\nЗдесь записано, что она искала в русской Википедии во время разговоров.\n\n'
    SEARCH_LOG.write_text(old.rstrip() + '\n\n' + '\n'.join(lines), encoding='utf-8')


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
    owner_text = turns[-1][1]
    persona = PERSONA.read_text(encoding='utf-8').strip()
    tokenizer = AutoTokenizer.from_pretrained(MODEL, revision=REVISION)
    model = AutoModelForImageTextToText.from_pretrained(MODEL, revision=REVISION, dtype=torch.bfloat16, low_cpu_mem_usage=True)
    if args.adapter and args.adapter.exists():
        model = PeftModel.from_pretrained(model, args.adapter)
        print(f'Адаптер подключён: {args.adapter}', flush=True)
    else:
        print('ВНИМАНИЕ: отвечаю базовой моделью без домашнего адаптера', flush=True)
    model.eval()
    # Сначала она решает, нужен ли поиск, потом дом ищет за неё.
    query = forced_query(owner_text)
    if query:
        print(f'Владелец прямо попросил поиск, запрос: {query!r}', flush=True)
    else:
        query = decide_search(model, tokenizer, owner_text)
    results = search_wikipedia(query) if query else []
    if query:
        log_search(query, results)
        print(f'Поиск «{query}»: найдено статей: {len(results)}', flush=True)
        if results:
            found = '\n\n'.join(f'[{i}] Статья «{r["title"]}» ({r["url"]}):\n{r["extract"]}' for i, r in enumerate(results, 1))
            persona += f'\n\nДом уже поискал за тебя в русской Википедии по запросу «{query}». Вот найденное:\n{found}\nОтвечай владельцу по этому тексту: скажи, что поискала, назови статью и дай ответ из неё. Если ответа в тексте нет — честно скажи, что в найденном этого нет.'
        else:
            persona += f'\n\nТы попросила поиск в Википедии по запросу «{query}», но ничего не нашлось. Честно скажи владельцу, что поискала и не нашла.'
    history = turns[-(9):-1] if len(turns) > 1 else []
    messages = [{'role': 'system', 'content': persona}]
    for role, body in history:
        messages.append({'role': role, 'content': body})
    messages.append({'role': 'user', 'content': owner_text})
    torch.manual_seed(42 + len(turns))
    reply = clean_reply(generate(model, tokenizer, messages, max_new=args.max_new, sample=True))
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
