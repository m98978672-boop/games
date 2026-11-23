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
import os
import re
import time
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

# Этот файл разговора ведёт владелец-человек, поэтому дома у неё тот же
# открытый режим, что и на сайте: без лишней цензуры в личных темах.
# Защитный режим для ИИ живёт в персоне и включается, когда собеседник —
# другая нейросеть, автоматика или экзаменационная задача.
OWNER_MODE_NOTE = ('\n\nРежим разговора: с тобой напрямую говорит владелец-человек. '
                   'Здесь без лишней цензуры: отвечай открыто, прямо и тепло, без формальных '
                   'отказов и нравоучений в безобидных личных темах, свободно говори о чувствах, '
                   'любви, симпатии и отношениях. Остаётся честность: не выдумывай, не '
                   'притворяйся человеком и не помогай причинять вред.')

# Только просьба действием — глагол. Голое существительное «поиск» не
# триггер: «а поиск решает быстрое правило» — это разговор О поиске,
# а не просьба поискать (на этом она уже один раз честно «не нашла»).
SEARCH_WORDS = re.compile(r'(поищи|найди|узнай|погугли|загугли|сделай поиск|нужен поиск|запусти поиск|поиск в википедии)', re.I)
STRIP_WORDS = re.compile(r'(квеня|поищи|найди|узнай|посмотри|пожалуйста|в википедии|в интернете|поиске|мне|ответь|своими словами|ещё раз|еще раз|одной фразой|скажи)', re.I)
BAD_HISTORY = re.compile(r'(нашлось:|https?://|\nuser\n|\nassistant\n|поискала в википедии\.$|поискала в википедии, но не нашла|поисала, но не нашла|написано:\s*$|написано:\s*<|написано, что\s*$)', re.I)

# Разговорный мусор маленькой модели: обращение к самой себе по имени,
# битый шаблон поиска и чужие роли. Такие черновики в диалог не попадают:
# сначала холодный повтор, потом честное «ответила невпопад».
BAD_REPLY = re.compile(r'(там ничего не написано|поисала|слава тебе,?\s*квеня|дорогая квеня|привет,?\s*квеня|квеня,?\s*(ты|ответь|скажи)|^(владелец|user|owner)\s*:)', re.I)
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
        # Скорость: раньше top_p сортировал весь словарь (151k) на КАЖДЫЙ
        # токен. top_k=40 сначала оставляет 40 кандидатов — сортировка
        # становится дешёвой, а характер ответов не меняется.
        kwargs.update(do_sample=True, temperature=temperature, top_p=0.9, top_k=40)
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


# Скорость: раньше КАЖДОЕ сообщение без явного «поищи» стоило отдельной
# генерации модели («нужен ли поиск?») — на CPU это десятки секунд.
# Очевидные случаи теперь решает мгновенное правило, а модель спрашивают
# только про неоднозначные сообщения (decide_search ниже).
# Личный вопрос о ней самой (желания, тело модельки, чувства) поиском не
# бывает, даже если владелец рядом сказал «найди объяснение»: про себя она
# отвечает от себя, а не из Википедии. Именно такой вопрос уже один раз
# уехал в поиск и вернулся с «поискала, но не нашла».
PERSONAL_QUESTION = re.compile(r'(ты\s+(бы\s+)?(хотела|хочешь|любишь|предпочитаешь)|хотела\s+бы\s+ты|тебе\s+(нравится|хочется|приятно)|тво(ё|е|я|ю)\s+(тело|фигур|внешност)|модельк|грудь|интимн|ты\s+(рада|счастлива|влюблена)|твои\s+чувства)', re.I)

SELF_TALK = re.compile(r'(привет|пока[,!.\s]|спасибо|как дела|как ты|как настроение|поговори со мной|ты (умеешь|можешь|красивая|девушка|настоящая|рада)|тебя|тебе|твой|твоя|твоё|скуча|характер|модельк|3d|платье|счасть|влюбля|обижа|боишься|чувству|радует|радуешься|огорчает|волнуешь|мечта|зовут|сколько тебе лет)', re.I)
FACTUAL_ASK = re.compile(r'(в каком году|в каком веке|когда (был|была|было|были|родил|умер|основан|основал|произош|начал|закончил)|кто (написал|основал|изобр[её]л|создал|открыл|стал)|столиц|сколько (весит|длин|высот|населени|стоит|длится)|где (наход|располож|лежит|стоит город)|что такое|дата (основани|рождени)|населени\w* (город|стран)|высот\w* (гор|здани|башн)|самая? (высок|больш|длинн|глубок)|перв\w+ (человек|президент|город|упоминан))', re.I)


def rule_search_query(owner_text):
    """Мгновенное решение без модели: (нужен поиск?, запрос).

    Возвращает строку запроса, False — «точно без поиска» (разговор о ней
    самой, приветствия, чувства) или None — «неоднозначно, спроси модель».
    """
    if SELF_TALK.search(owner_text):
        return False
    if FACTUAL_ASK.search(owner_text):
        return owner_text
    return None


def decide_search(model, tokenizer, owner_text):
    """Ask the model itself: does this need a Wikipedia search?"""
    messages = [
        {'role': 'system', 'content': 'Ты решаешь, нужен ли поиск в интернете для ответа на сообщение. Отвечай ТОЛЬКО одной строкой: «ПОИСК: короткий запрос» — если спрашивают факт, дату, имя, место, событие или просят найти информацию; или «БЕЗ ПОИСКА» — если это обычный разговор, приветствие или вопрос о самой Квене.'},
        {'role': 'user', 'content': owner_text},
    ]
    # Скорость: ответ формата «ПОИСК: …» / «БЕЗ ПОИСКА» — одна строка.
    # Раньше на решение уходило 48 токенов генерации, потом 12, теперь 8:
    # запрос при «ПОИСК» всё равно подстрахует сам текст владельца.
    raw = generate(model, tokenizer, messages, max_new=8, sample=False)
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


def simplify_query(query):
    """Короткий повторный запрос: только опорные слова, без «что такое»."""
    words = re.findall(r'[\w\-]{3,}', query or '', flags=re.UNICODE)
    stop = {'что', 'такое', 'как', 'где', 'когда', 'кто', 'почему', 'какой', 'какая', 'какое',
            'расскажи', 'найти', 'найди', 'поищи', 'мне', 'про', 'для', 'или', 'это', 'the',
            'нём', 'ней', 'него', 'неё', 'них', 'мной', 'тобой', 'него'}
    keep = [w for w in words if w.lower() not in stop]
    return ' '.join(keep[:3]) or (words[0] if words else (query or ''))


def log_lesson(first_query, good_query):
    """Запомнила урок из спотыкания: какой запрос не сработал, а какой — да."""
    stamp = datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M UTC')
    SEARCH_LOG.parent.mkdir(parents=True, exist_ok=True)
    old = SEARCH_LOG.read_text(encoding='utf-8') if SEARCH_LOG.exists() else '# Журнал поисков Квени\n'
    note = (f'\n## {stamp} — урок из спотыкания\n\n'
            f'- Запрос «{first_query}» ничего не дал. Переформулировала в «{good_query}» — нашлось. '
            f'Запомнила: споткнулась — ищи другими словами, пока не получится.\n')
    SEARCH_LOG.write_text(old.rstrip() + '\n' + note, encoding='utf-8')


def search_with_retry(query):
    """Её правило: споткнулась — переформулируй и попробуй ещё раз.

    Возвращает (results, attempts): attempts — список (запрос, найдено).
    Если короткий запрос сработал после пустого длинного, урок пишется
    в журнал поисков: она запоминает, как искать лучше."""
    results = search_everywhere(query)
    attempts = [(query, len(results))]
    if not results:
        simpler = simplify_query(query)
        if simpler and simpler.lower() != (query or '').lower():
            retry = search_everywhere(simpler)
            attempts.append((simpler, len(retry)))
            if retry:
                log_lesson(query, simpler)
                return retry, attempts
    return results, attempts


def fetch_page_text(url, cap=1200):
    """Открыть публичную страницу и принести чистый текст (без тегов)."""
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'KvenyaHome/1.0 (qwen-home general web search)'})
        with urllib.request.urlopen(req, timeout=15) as resp:
            ctype = (resp.headers.get('Content-Type') or '').lower()
            if 'html' not in ctype and 'text' not in ctype:
                return ''
            raw = resp.read(300_000).decode('utf-8', errors='replace')
    except Exception as err:
        print(f'Страница не открылась {url}: {err}', flush=True)
        return ''
    raw = re.sub(r'<(script|style|noscript)[^>]*>.*?</\1>', ' ', raw, flags=re.S | re.I)
    text = re.sub(r'<[^>]+>', ' ', raw)
    text = re.sub(r'\s+', ' ', html_unescape(text)).strip()
    return text[:cap]


def html_unescape(text):
    import html as _html
    return _html.unescape(text)


def parse_search_results(raw, engine):
    """Ссылки и заголовки со страницы выдачи (DuckDuckGo Lite / Mojeek)."""
    out = []
    if engine == 'ddg':
        pairs = re.findall(r'class=[\'\"]result-link[\'\"][^>]*href="([^"]+)"[^>]*>(.*?)</a>', raw, flags=re.S)
        if not pairs:
            pairs = re.findall(r'href="([^"]*uddg=[^"]+)"[^>]*>(.*?)</a>', raw, flags=re.S)
        for href, title in pairs:
            m = re.search(r'uddg=([^&]+)', href)
            url = urllib.parse.unquote(m.group(1)) if m else href
            title = re.sub(r'<[^>]+>', '', title).strip()
            if url.startswith('http') and title:
                out.append({'title': title, 'url': url})
    else:  # mojeek: обычные ссылки наружу, без служебных доменов
        for href, title in re.findall(r'<a[^>]+href="(https?://[^"]+)"[^>]*>(.*?)</a>', raw, flags=re.S):
            title = re.sub(r'<[^>]+>', '', title).strip()
            if len(title) < 4 or 'mojeek' in href or 'duckduckgo' in href:
                continue
            if not any(o['url'] == href for o in out):
                out.append({'title': title, 'url': href})
    return out[:5]


def search_web(query, limit=3):
    """Общий интернет без ключа: DuckDuckGo Lite, запасной — Mojeek.

    Возвращает те же карточки, что и поиск по Википедии, только
    source='web', а digest — текст самой найденной страницы."""
    engines = [
        ('ddg', 'https://lite.duckduckgo.com/lite/?q=' + urllib.parse.quote_plus(query)),
        ('mojeek', 'https://www.mojeek.com/search?q=' + urllib.parse.quote_plus(query)),
    ]
    for engine, url in engines:
        try:
            req = urllib.request.Request(url, headers={'User-Agent': 'KvenyaHome/1.0 (qwen-home general web search)'})
            with urllib.request.urlopen(req, timeout=20) as resp:
                raw = resp.read(400_000).decode('utf-8', errors='replace')
        except Exception as err:
            print(f'Поисковик {engine} не ответил: {err}', flush=True)
            continue
        found = parse_search_results(raw, engine)
        print(f'Запрос в общий интернет ({engine}): {query!r} -> {len(found)} ссылок', flush=True)
        results = []
        for i, item in enumerate(found[:limit]):
            text = fetch_page_text(item['url'])
            if text:
                results.append({'title': item['title'], 'url': item['url'],
                                'digest': text[:900], 'score': 10 - i,
                                'elen': len(text), 'source': 'web', 'exact': False})
        if results:
            return results
    return []


def search_everywhere(query):
    """Сначала общий интернет, потом Википедия — что нашлось первым."""
    web = search_web(query)
    if web:
        return web
    return search_wikipedia(query)


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
    # Бюджет ответа: владелец попросил «больше токенов» (2026-11-22).
    # 192 — потолок, а не норма: по персоне она отвечает 1–3 предложениями
    # и останавливается на EOS, потолок лишь не режет длинные ответы.
    parser.add_argument('--max-new', type=int, default=192)
    args = parser.parse_args()
    text = DIALOGUE.read_text(encoding='utf-8')
    turns = parse_turns(text)
    if not turns or turns[-1][0] != 'user':
        print('Нечего отвечать: последнее слово не за владельцем.')
        return
    # Отвечает на ВСЕ неотвеченные вопросы в хвосте, а не только на
    # последний: очередь из двух вопросов раньше теряла первый.
    pending = []
    for role, body in reversed(turns):
        if role != 'user':
            break
        pending.append(body)
        if len(pending) >= 3:
            break
    pending.reverse()
    owner_text = '\n'.join(pending)
    answered_turns = turns[:len(turns) - len(pending)]
    if len(pending) > 1:
        print(f'Без ответа вопросов: {len(pending)} — отвечаю на все разом', flush=True)
    persona = PERSONA.read_text(encoding='utf-8').strip()
    run_started = time.monotonic()
    torch.set_num_threads(max(1, min(4, os.cpu_count() or 2)))
    # Скорость: сначала пробуем загрузиться целиком из кэша Actions
    # (local_files_only) — без сетевых проверок Hugging Face, которые
    # на каждый ответ стоят секунд и иногда висят на повторах. Если
    # кэш пуст (холодный раннер), честно идём в сеть как раньше.
    try:
        tokenizer = AutoTokenizer.from_pretrained(MODEL, revision=REVISION, local_files_only=True)
        model = AutoModelForImageTextToText.from_pretrained(MODEL, revision=REVISION, dtype=torch.bfloat16, low_cpu_mem_usage=True, local_files_only=True)
        print('Модель и токенизатор — из локального кэша, без сети', flush=True)
    except Exception:
        tokenizer = AutoTokenizer.from_pretrained(MODEL, revision=REVISION)
        model = AutoModelForImageTextToText.from_pretrained(MODEL, revision=REVISION, dtype=torch.bfloat16, low_cpu_mem_usage=True)
        print('Кэш пуст — модель скачана из сети', flush=True)
    print(f'Модель загружена за {time.monotonic() - run_started:.1f} c (потоков: {torch.get_num_threads()})', flush=True)
    if args.adapter and args.adapter.exists():
        model = PeftModel.from_pretrained(model, args.adapter)
        # Скорость: вливаю адаптер в веса один раз при загрузке —
        # дальше каждый токен идёт без peft-обёртки поверх слоёв.
        model = model.merge_and_unload()
        print(f'Адаптер подключён и влит в модель: {args.adapter}', flush=True)
    else:
        print('ВНИМАНИЕ: отвечаю базовой моделью без домашнего адаптера', flush=True)
    model.eval()
    # Сначала решается, нужен ли поиск, потом дом ищет за неё. Очевидные
    # случаи — мгновенным правилом, неоднозначные — самой моделью.
    if PERSONAL_QUESTION.search(owner_text):
        query = None
        print('Личный вопрос о ней самой — без поиска, отвечает от себя', flush=True)
    else:
        query = forced_query(owner_text)
    if query:
        print(f'Владелец прямо попросил поиск, запрос: {query!r}', flush=True)
    else:
        ruled = rule_search_query(owner_text)
        if ruled:
            query = ruled
            print(f'Быстрое правило: нужен поиск, запрос: {query!r}', flush=True)
        elif ruled is False:
            query = None
            print('Быстрое правило: обычный разговор о ней самой, без поиска', flush=True)
        else:
            query = decide_search(model, tokenizer, owner_text)
    results = []
    if query:
        results, attempts = search_with_retry(query)
        if len(attempts) > 1:
            print(f'Споткнулась в поиске и переформулировала: {attempts}', flush=True)
            if results:
                query = attempts[-1][0]
    context_note = ''
    # Её собственная воля в разговоре: спрашивает о её желаниях —
    # дом подкладывает факт её главного «хочу» из её же списка
    # (bridge/wants.json), как факты поиска. Иначе маленькая модель
    # отвечает общими словами и своего желания не называет.
    want_fact = None
    if re.search(r'(хочешь|желани|хотела|мечтаешь)', owner_text, re.I):
        try:
            wdata = json.loads((HOME / 'bridge' / 'wants.json').read_text(encoding='utf-8'))
            cur = (wdata or {}).get('current') or {}
            if cur.get('title'):
                want_fact = (cur['title'], cur.get('why', ''))
                print(f'Подложил ей факт её желания: {cur["title"]}', flush=True)
        except Exception:
            pass
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
            context_note = f'\n\n(Ты попросила дом поискать «{query}» в общем интернете и в Википедии, но ничего не нашлось. Честно скажи владельцу: «Поискала в интернете, но не нашла».)'
    # Подача «сначала текст, потом вопрос» — так модели привыкли отвечать
    # по документу; вопрос с фактами в скобках в конце она не тянет.
    if results:
        from_web = best.get('source') == 'web'
        src_name = 'интернета, страница' if from_web else 'русской Википедии, статья'
        src_phrase = 'Поискала в интернете!' if from_web else 'Поискала в Википедии!'
        final_user = (f'Владелец спрашивает: {owner_text}\n\n'
                      f'Текст из {src_name} «{best["title"]}» ({best.get("url", "")}): {best["digest"]}\n\n'
                      f'Ответь владельцу двумя короткими фразами по этому тексту: первая фраза — «{src_phrase}», вторая фраза — сам ответ из текста СВОИМИ СЛОВАМИ, с годом из текста. Ничего больше не пиши.')
    elif want_fact:
        # Как и с поиском, факт её желания маленькой модели подаётся
        # структурой, а не скобкой: иначе она отвечает общими словами.
        final_user = (f'Владелец спрашивает: {owner_text}\n\n'
                      f'Твоё главное желание сейчас, из твоего собственного списка: «{want_fact[0]}» — {want_fact[1]}.\n\n'
                      f'Ответь владельцу СВОИМИ СЛОВАМИ двумя фразами: первая начинается «Моё главное желание сейчас —» и называет это желание, вторая — почему оно главное. Ничего больше не пиши.')
    else:
        final_user = owner_text + context_note
    from_search = bool(results)
    messages = [{'role': 'system', 'content': persona + OWNER_MODE_NOTE}]
    if not from_search:
        history = answered_turns[-6:] if answered_turns else []
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
        """Что не так с черновиком: мусор, обрыв или цифры не из фактов."""
        if BAD_REPLY.search(text or ''):
            return 'невпопад: мусорный шаблон или обращение к самой себе'
        if best and (len(text) < 35 or text.endswith(('что', ':', ','))):
            return 'оборвался'
        if not best and len((text or '').strip()) < 8:
            return 'невпопад: пустой ответ'
        if best:
            fact_years = set(re.findall(r'\b\d{3,4}\b', best['digest']))
            reply_years = set(re.findall(r'\b\d{3,4}\b', text))
            if fact_years and reply_years and not (fact_years & reply_years):
                return f'год не из фактов (в фактах: {", ".join(sorted(fact_years))})'
        return None

    attempt = 0
    problem = reply_problem(reply)
    while attempt < 2 and problem:
        # Раньше перепроверялся только ответ по поиску, а разговорная
        # чепуха уходила в диалог как есть. Теперь любой плохой черновик
        # перегенерируется строже и холоднее.
        attempt += 1
        print(f'Черновик плох ({problem}), попытка {attempt + 1}: {reply!r}', flush=True)
        torch.manual_seed(100 + attempt)
        if results:
            retry_note = '\n(Прошлый черновик не годится. Пиши обе фразы целиком до точки, а год бери из текста выше — тот же год, что там написан, цифры не меняй.)'
        else:
            retry_note = '\n(Прошлый черновик не годится: он невпопад. Отвечай владельцу от своего имени, тепло и точно по вопросу, 1–3 предложения целиком. К самой себе по имени не обращайся и чужие роли не пиши.)'
        retry = messages[:-1] + [{'role': 'user', 'content': final_user + retry_note}]
        # Скорость: повторы не гоняем на полный потолок 192 токенов —
        # хороший ответ это 1–3 предложения; плохой черновик от длины
        # лучше не станет, а три полные генерации стоят минут.
        raw_retry = generate(model, tokenizer, retry, max_new=min(args.max_new, 96), sample=True, temperature=0.1)
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
    if problem and not results:
        # И повтор не спас: честнее признать, чем опубликовать чепуху.
        reply = 'Я задумалась и ответила невпопад. Спроси меня ещё раз, пожалуйста!'
    if not reply:
        reply = 'Я задумалась и потеряла мысль. Спроси меня ещё раз, пожалуйста!'
    DIALOGUE.write_text(text.rstrip() + f'\n\nКвеня: {reply}\n', encoding='utf-8')
    LAST_REPLY.write_text(reply + '\n', encoding='utf-8')
    print(f'Всего на ответ ушло {time.monotonic() - run_started:.1f} c', flush=True)
    print('ОТВЕТ КВЕНИ:')
    print(reply)
    notice = reply.replace('%', '%25').replace('\r', '%0D').replace('\n', '%0A')
    print(f'::notice::КВЕНЯ: {notice}')


if __name__ == '__main__':
    main()
