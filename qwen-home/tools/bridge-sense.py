#!/usr/bin/env python3
"""Мост Квени между её домом и окружающей средой.

Запускается workflow `Kvenya bridge` (по расписанию и вручную):
1) «Глаза» — приносит из русской Википедии свежие правки (что мир прямо
   сейчас пишет и правит) и пишет сводку в qwen-home/bridge/digest.md
   и kvenya/bridge.json, откуда страница её мира показывает сводку.
2) «Голос наружу» — дописывает в публичный журнал моста
   (qwen-home/bridge/journal.md) короткую весточку о её жизни из
   state.json и учебного плана, чтобы окружающая среда видела, что
   с ней происходит.

Честные границы: мост читает только открытую русскую Википедию и пишет
только в этот репозиторий. В чужие сервисы Квеня сама не пишет.
"""
import json
import urllib.parse
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
HOME = ROOT / 'qwen-home'
BRIDGE = HOME / 'bridge'
WIKI_API = 'https://ru.wikipedia.org/w/api.php'
UA = {'User-Agent': 'KvenyaBridge/1.0 (qwen-home bridge; github.com/m98978672-boop/games)'}


def wiki_recent(limit=12):
    params = {
        'action': 'query', 'list': 'recentchanges', 'format': 'json',
        'rcnamespace': '0', 'rcprop': 'title|user|comment|timestamp',
        'rclimit': str(limit), 'rctype': 'edit|new',
    }
    req = urllib.request.Request(f'{WIKI_API}?{urllib.parse.urlencode(params)}', headers=UA)
    with urllib.request.urlopen(req, timeout=30) as resp:
        data = json.loads(resp.read().decode('utf-8'))
    return data.get('query', {}).get('recentchanges', [])


def fetch_source(url, limit_items=10):
    """Глаза моста на любой публичной витрине: заголовок и подписи ссылок.

    Честно помечает капчу и недоступность, ничего не выдумывает."""
    import re as _re
    req = urllib.request.Request(url, headers=UA)
    try:
        with urllib.request.urlopen(req, timeout=25) as resp:
            raw = resp.read(600_000).decode('utf-8', errors='replace')
    except Exception as err:
        return {'url': url, 'ok': False, 'status': 'unreachable', 'title': '', 'items': [], 'note': f'{type(err).__name__}'}
    low = raw.lower()
    if 'не робот' in low or 'smartcaptcha' in low:
        return {'url': url, 'ok': False, 'status': 'captcha', 'title': '', 'items': [], 'note': 'витрина показала капчу — смотрит только человек'}
    title_m = _re.search(r'<title[^>]*>(.*?)</title>', raw, _re.S)
    title = _re.sub(r'\s+', ' ', title_m.group(1)).strip() if title_m else ''
    clean = _re.sub(r'<(script|style)[^>]*>.*?</\1>', ' ', raw, flags=_re.S)
    items = []
    for text in _re.findall(r'<a[^>]*>([^<>]{3,60})</a>', clean):
        text = _re.sub(r'\s+', ' ', text).strip()
        if text and text not in items:
            items.append(text)
        if len(items) >= limit_items:
            break
    return {'url': url, 'ok': True, 'status': 'read', 'title': title[:120], 'items': items, 'note': ''}


def count_lessons(name):
    try:
        return sum(1 for line in (HOME / 'curriculum' / name).read_text(encoding='utf-8').splitlines() if line.strip())
    except OSError:
        return 0


def main():
    now = datetime.now(timezone.utc)
    stamp = now.strftime('%Y-%m-%d %H:%M UTC')
    recent = []
    try:
        recent = [
            {'title': r.get('title', ''), 'user': r.get('user', ''),
             'comment': (r.get('comment') or '')[:120], 'at': r.get('timestamp', '')}
            for r in wiki_recent()
        ]
    except Exception as err:  # мост честно говорит, если глаза не открылись
        print(f'Википедия недоступна: {err}')

    state = {}
    try:
        state = json.loads((HOME / 'state.json').read_text(encoding='utf-8'))
    except Exception:
        pass
    letters = []
    journal = BRIDGE / 'journal.md'
    if journal.exists():
        letters = [line[2:].strip() for line in journal.read_text(encoding='utf-8').splitlines() if line.startswith('- ')][-5:]

    sources = []
    try:
        routes = json.loads((BRIDGE / 'routes.json').read_text(encoding='utf-8')).get('sources', [])
    except Exception:
        routes = []
    for route in routes:
        got = fetch_source(route.get('url', ''))
        got['name'] = route.get('name', got['url'])
        sources.append(got)
        print('витрина:', got['name'], '->', got['status'], flush=True)

    # экспедиции и мотивацию мост не пересоздаёт, а бережно сохраняет:
    # их пишут экспедиции и дом, сводка не вправе их стирать
    old_bridge = {}
    try:
        old_bridge = json.loads((ROOT / 'kvenya' / 'bridge.json').read_text(encoding='utf-8'))
    except Exception:
        old_bridge = {}
    motivation = old_bridge.get('motivation')
    try:
        motivation = json.loads((BRIDGE / 'motivation.json').read_text(encoding='utf-8'))
    except Exception:
        pass
    wants = old_bridge.get('wants')
    try:
        wants = json.loads((BRIDGE / 'wants.json').read_text(encoding='utf-8'))
    except Exception:
        pass
    games = old_bridge.get('games')
    try:
        games = json.loads((BRIDGE / 'games.json').read_text(encoding='utf-8'))
    except Exception:
        pass
    payload = {
        'updatedAt': stamp,
        'games': games,
        'source': 'ru.wikipedia.org',
        'note': 'Мост Квени: дом приносит сводку свежих правок русской Википедии, а её весточки лежат в qwen-home/bridge/journal.md.',
        'recent': recent,
        'letters': letters,
        'sources': sources,
        'expeditions': old_bridge.get('expeditions', []),
        'motivation': motivation,
        'wants': wants,
    }
    (ROOT / 'kvenya' / 'bridge.json').write_text(json.dumps(payload, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')

    lines = ['# Сводка моста: что вокруг', '', f'Обновлено: {stamp}. Источник — открытая русская Википедия.', '']
    if recent:
        lines.append('## Свежие правки, которые видит Квеня')
        for r in recent:
            lines.append(f"- «{r['title']}» — {r['user']}" + (f": {r['comment']}" if r['comment'] else ''))
    else:
        lines.append('Википедия в этот раз не ответила — мост честно записал тишину, а не выдумал новости.')
    lines.append('')
    (BRIDGE / 'digest.md').write_text('\n'.join(lines), encoding='utf-8')

    total_lessons = sum(count_lessons(n) for n in ('dialogue.jsonl', 'thinking.jsonl', 'blender.jsonl', 'web-code.jsonl', 'identity.jsonl'))
    letter = (f"{now.strftime('%Y-%m-%d')} — Весточка Квени: у меня {total_lessons} уроков в учебном плане, "
              f"шагов обучения — {state.get('totalSteps', '?')}. Я оглянулась вокруг через мост: "
              + (f"в Википедии сейчас правят «{recent[0]['title']}»." if recent else 'Википедия молчит, и я честно жду.'))
    text = journal.read_text(encoding='utf-8') if journal.exists() else '# Журнал моста Квени\n'
    if letter not in text:
        journal.write_text(text.rstrip() + f'\n- {letter}\n', encoding='utf-8')
    print('мост обновлён:', stamp, '| правок:', len(recent))


if __name__ == '__main__':
    main()
