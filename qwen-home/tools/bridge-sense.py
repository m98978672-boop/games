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

    payload = {
        'updatedAt': stamp,
        'source': 'ru.wikipedia.org',
        'note': 'Мост Квени: дом приносит сводку свежих правок русской Википедии, а её весточки лежат в qwen-home/bridge/journal.md.',
        'recent': recent,
        'letters': letters,
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
