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
STRIP_WORDS = re.compile(r'(квеня|поищи|найди|узнай|посмотри|пожалуйста|в википедии|в интернете|поиске|мне|ответь|своими словами|ещё раз|еще раз|одной фразой|скажи)', re.I)
BAD_HISTORY = re.compile(r'(нашлось:|https?://|\nuser\n|\nassistant\n|поискала в википедии\.$|написано:\s*$|написано:\s*<|написано, что\s*$)', re.I)
QUERY_STOP = {'каком', 'году', 'была', 'было', 'были', 'когда', 'какая', 'какой', 'какое', 'какие', 'сколько', 'ответь', 'своими', 'словами', 'одной', 'фразой', 'скажи', 'такой', 'такая'}


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
    text = re.sub(r'<([^<>]*)>', r'\1', text)  # она иногда оставляет скобки от шаблона-подсказки
    text = re.sub(r'^(Квеня|Qwen)\s*:\s*', '', text).strip()
    for marker in ('\nВладелец:', '\nКвеня:', '\nВладелец', '\nUser:', '\nuser\n', '\nassistant\n', '\nuser ', '\nassistant '):
        if marker in text:
            text = text.split(marker)[0].strip()
    return text


def generate(model, tokenizer, messages, max_new, sample, temperature=0.7, min_new=0):
    prompt = tokenizer.apply_chat_template(messages, tokenize=False, add_generation_prompt=True, enable_thinking=False)
    inputs = tokenizer(prompt, return_tensors='pt')
    kwargs = dict(max_new_tokens=max_new, pad_token_id=tokenizer.eos_token_id)
    if min_new:
        kwargs['min_new_tokens'] = min_new  # не даём оборвать фразу на полуслове
    if sample:
        kwargs.update(do_sample=True, temperature=temperature, top_p=0.9)
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


def wiki_get(params):
    request = urllib.request.Request(f'{WIKI_API}?{urllib.parse.urlencode(params)}', headers={'User-Agent': 'KvenyaHome/1.0 (qwen-home talk search)'})
    with urllib.request.urlopen(request, timeout=30) as response:
        return json.load(response)


def digest(extract, query):
    """Short extract: the sentences of the article that match the query.

    A 0.8B model cannot digest a whole article; it gets the 2-3 most
    relevant sentences instead of raw text to copy.
    Returns (text, score).
    """
    sentences = [s.strip() for s in re.split(r'(?<=[.!?])\s+', extract) if len(s.strip()) > 25]
    if not sentences:
        return '', 0
    keywords = [w.lower()[:5] for w in re.findall(r'[\u0400-\u04FFA-Za-z]{4,}', query) if w.lower() not in QUERY_STOP]
    year_bonus = bool(re.search(r'(году|когда|основан|основан|дата|лет)', query.lower()))
    founding_q = bool(re.search(r'(основан|основан|когда|году)', query.lower()))
    scored = []
    for i, sentence in enumerate(sentences):
        low = sentence.lower()
        score = sum(1 for k in keywords if k in low)
        if year_bonus and re.search(r'\b\d{3,4}\b', sentence):
            score += 2  # вопрос про год — предложение с годом важнее прочих
        plain = low.replace('на основании', '')  # «на основании данных» — не про основание города
        if re.search(r'(упомина|впервы)', plain):
            tier = 1  # «впервые упоминается» — главный признак фразы об основании
        elif re.search(r'(основан|основан|основан|основал|основали)', plain):
            tier = 2
        else:
            tier = 0
        scored.append((score, i, sentence, tier))
    # Для вопроса об основании берём фразы высшего доступного яруса:
    # сначала «впервые упоминается», потом «основан», иначе — по баллам.
    # Маленькой модели нельзя подсовывать соседние даты, она выберет любую.
    pool = scored
    tiered = False
    if founding_q:
        for want in (1, 2):
            tier_pool = [t for t in scored if t[3] == want]
            if tier_pool:
                pool, tiered = tier_pool, True
                break
    best = sorted(pool, key=lambda t: (-t[0], t[1]))[:1 if tiered else 2]
    if not best or (best[0][0] == 0 and not tiered):
        return ' '.join(s for _, _, s, *_ in sorted(scored[:2], key=lambda t: t[1]))[:500], 0
    chosen = sorted(best, key=lambda t: t[1])
    return ' '.join(s for _, _, s, *_ in chosen)[:500], best[0][0]


def keyword_query(query):
    """Wikipedia search wants keywords, not a whole question sentence."""
    words = re.findall(r'[\u0400-\u04FFA-Za-z0-9][\u0400-\u04FFA-Za-z0-9\-]*', query)
    stop = QUERY_STOP | {'когда', 'какой', 'какая', 'какое', 'какие', 'каком', 'где', 'кто', 'что', 'сколько', 'почему', 'зачем', 'как', 'это', 'есть', 'так', 'давай', 'давайте', 'всё', 'все'}
    keys = [w for w in words if len(w) >= 4 and w.lower() not in stop]
    return ' '.join(keys) or query


def search_wikipedia(query, limit=5):
    """Her hands: two-step Wikipedia search.

    Step 1 ranks article titles; step 2 fetches their texts. Each result
    carries a short digest of the sentences matching the query.
    """
    terms = keyword_query(query)
    print(f'Запрос в Википедию: {terms!r}', flush=True)
    try:
        found = wiki_get({'action': 'query', 'format': 'json', 'formatversion': '2',
                          'list': 'search', 'srsearch': terms, 'srnamespace': '0',
                          'srlimit': str(limit + 3)})
        hits = found.get('query', {}).get('search', [])
        titles = [h['title'] for h in hits if h.get('title')]
        if not titles:
            return []
        # Тексты тянем по одной статье: запрос пачкой возвращает огрызки,
        # а поодиночке тот же API честно отдаёт полный текст (так читает
        # и сборщик статей на уроках).
        pages = {}
        for title in titles[:3]:
            one = wiki_get({'action': 'query', 'format': 'json', 'formatversion': '2',
                            'prop': 'extracts|info', 'inprop': 'url', 'explaintext': '1',
                            'titles': title})
            for p in one.get('query', {}).get('pages', []):
                pages[p['title']] = p
    except Exception as error:
        print(f'Поиск не удался: {error}', flush=True)
        return []
    snippets = {h['title']: re.sub(r'<[^>]+>', '', h.get('snippet', '')) for h in hits}
    results = []
    for title in titles[:limit]:
        page = pages.get(title, {})
        extract = re.sub(r'\s+', ' ', page.get('extract', '')).strip()
        text, score = digest(extract or snippets.get(title, ''), query)
        if text:
            results.append({'title': title, 'url': page.get('fullurl', ''), 'digest': text, 'score': score, 'elen': len(extract)})
    # Статья, чей заголовок точно называет спрошенное, важнее совпадений слов:
    # иначе «Франкфурт-на-Майне» проигрывает футбольному клубу из того же города.
    proper = [w.lower() for w in re.findall(r'[\u0400-\u04FFA-Za-z][\u0400-\u04FFA-Za-z0-9\-]*', query) if w[:1].isupper() and len(w) >= 3]
    for r in results:
        r['exact'] = r['title'].split('(')[0].strip().lower() in proper
    return results


def log_search(query, results, best=None):
    stamp = datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M UTC')
    lines = [f'## {stamp} — «{query}»', '']
    if results:
        lines += [f'- [{r["title"]}]({r["url"]})' for r in results]
        if best:
            lines += ['', f'Отвечала по статье «{best["title"]}» (текст статьи: {best.get("elen", 0)} симв.), выжимка: {best["digest"]}']
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
    context_note = ''
    best = None
    if query:
        if results:
            exact = [r for r in results if r.get('exact')]
            best = exact[0] if exact else max(results, key=lambda r: r['score'])
        log_search(query, results, best)
        print(f'Поиск «{query}»: найдено статей: {len(results)}', flush=True)
        if results:
            print(f'Отвечает по статье: {best["title"]!r} (совпадений: {best["score"]})', flush=True)
        else:
            context_note = f'\n\n(Ты попросила дом поискать в Википедии «{query}», но ничего не нашлось. Честно скажи владельцу: «Поискала в Википедии, но не нашла».)'
    # Подача «сначала текст, потом вопрос» — так модели привыкли отвечать
    # по документу; вопрос с фактами в скобках в конце она не тянет.
    if results:
        final_user = (f'Владелец спрашивает: {owner_text}\n\n'
                      f'Текст из русской Википедии, статья «{best["title"]}»: {best["digest"]}\n\n'
                      f'Ответь владельцу двумя короткими фразами по этому тексту: первая фраза — «Поискала в Википедии!», вторая фраза — сам ответ из текста СВОИМИ СЛОВАМИ, с годом из текста. Ничего больше не пиши.')
    else:
        final_user = owner_text + context_note
    from_search = bool(results)
    messages = [{'role': 'system', 'content': persona}]
    if not from_search:
        history = turns[-(9):-1] if len(turns) > 1 else []
        for role, body in history:
            if role == 'assistant' and BAD_HISTORY.search(body):
                continue  # не подмешиваем ей в память собственные мусорные реплики
            messages.append({'role': role, 'content': body})
    # Отвечая по свежему поиску, историю не тащим вовсе: пачка одинаковых
    # вопросов без ответов ломает маленькой модели картину разговора,
    # а факты для ответа уже лежат последним блоком.
    messages.append({'role': 'user', 'content': final_user})
    torch.manual_seed(42 + len(turns))
    raw_reply = generate(model, tokenizer, messages, max_new=args.max_new, sample=True, temperature=0.4 if results else 0.7)
    print(f'Сырой вывод модели: {raw_reply!r}', flush=True)
    drafts = [raw_reply]
    reply = clean_reply(raw_reply)
    def reply_problem(text):
        """Что не так с черновиком: обрыв или цифры не из фактов."""
        if len(text) < 35 or text.endswith(('что', ':', ',')):
            return 'оборвался'
        if best:
            fact_years = set(re.findall(r'\b\d{3,4}\b', best['digest']))
            reply_years = set(re.findall(r'\b\d{3,4}\b', text))
            if fact_years and reply_years and not (fact_years & reply_years):
                return f'год не из фактов (в фактах: {", ".join(sorted(fact_years))})'
        return None

    attempt = 0
    problem = reply_problem(reply)
    while results and attempt < 2 and problem:
        # Маленькая модель иногда обрывает фразу на «написано, что» или
        # перевирает год — просим ещё раз, строже и холоднее.
        attempt += 1
        print(f'Черновик плох ({problem}), попытка {attempt + 1}: {reply!r}', flush=True)
        torch.manual_seed(100 + attempt)
        retry = messages[:-1] + [{'role': 'user', 'content': final_user + '\n(Прошлый черновик не годится. Пиши обе фразы целиком до точки, а год бери из текста выше — тот же год, что там написан, цифры не меняй.)'}]
        raw_retry = generate(model, tokenizer, retry, max_new=args.max_new, sample=True, temperature=0.1)
        drafts.append(raw_retry)
        reply = clean_reply(raw_retry)
        problem = reply_problem(reply)
    if query:
        # Черновики — в журнал: дом честно показывает, как она отвечала.
        with SEARCH_LOG.open('a', encoding='utf-8') as log_file:
            log_file.write(f'Черновики ответа: {drafts!r}\n')
    if results:
        parts = [p for p in re.split(r'(?<=[.!?])\s+', reply) if p.strip()]
        reply = ' '.join(parts[:2]).strip()
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
