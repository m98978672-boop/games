#!/usr/bin/env python3
"""Библиотека Квени: поиск по полкам, список и добавление кирпичей.

Её правило: сначала поищи в своей библиотеке (здесь лежат кирпичи
из её же опыта), потом создавай; получилось новое — положи обратно.

  python3 qwen-home/tools/library.py search труба
  python3 qwen-home/tools/library.py list
  python3 qwen-home/tools/library.py add code "Название" "слова,ключевые" "где код" "чем проверено"
"""
import json
import sys
from pathlib import Path

HOME = Path(__file__).resolve().parents[1]
SHELVES = HOME / 'library' / 'shelves'
CREATIONS = HOME / 'library' / 'creations.jsonl'


def load_shelf(name):
    path = SHELVES / f'{name}.jsonl'
    if not path.exists():
        return []
    return [json.loads(l) for l in path.read_text(encoding='utf-8').splitlines() if l.strip()]


def all_bricks():
    rows = []
    for shelf in ('code', 'games', 'video'):
        rows += load_shelf(shelf)
    return rows


def search(query):
    q = (query or '').lower()
    hits = []
    for b in all_bricks():
        hay = ' '.join([b.get('title', ''), ' '.join(b.get('keywords', [])), b.get('summary', '')]).lower()
        if q in hay:
            hits.append(b)
    return hits


def add(shelf, title, keywords, ref, summary):
    rows = load_shelf(shelf)
    slug = 'brick-' + str(len(rows) + 1)
    row = {'id': slug, 'shelf': shelf, 'title': title,
           'keywords': [k.strip() for k in keywords.split(',') if k.strip()],
           'ref': ref, 'summary': summary}
    with (SHELVES / f'{shelf}.jsonl').open('a', encoding='utf-8') as fh:
        fh.write(json.dumps(row, ensure_ascii=False) + '\n')
    return row


def register_creation(kind, slug, title, at, extra=None):
    """Творения (игры и выпуски) пишутся в реестр библиотеки."""
    row = {'kind': kind, 'slug': slug, 'title': title, 'at': at}
    if extra:
        row.update(extra)
    CREATIONS.parent.mkdir(parents=True, exist_ok=True)
    existing = []
    if CREATIONS.exists():
        existing = [json.loads(l) for l in CREATIONS.read_text(encoding='utf-8').splitlines() if l.strip()]
    for c in existing:
        if c.get('kind') == kind and c.get('slug') == slug:
            c.update(row)  # статус растёт: collected -> published
            CREATIONS.write_text(''.join(json.dumps(x, ensure_ascii=False) + '\n' for x in existing),
                                 encoding='utf-8')
            return c
    with CREATIONS.open('a', encoding='utf-8') as fh:
        fh.write(json.dumps(row, ensure_ascii=False) + '\n')
    return row


def load_creations():
    if not CREATIONS.exists():
        return []
    return [json.loads(l) for l in CREATIONS.read_text(encoding='utf-8').splitlines() if l.strip()]


def main(argv):
    if len(argv) < 2:
        print(__doc__)
        return 0
    cmd = argv[1]
    if cmd == 'search':
        hits = search(' '.join(argv[2:]))
        for b in hits:
            print(f"[{b['shelf']}] {b['title']} — {b['ref']}")
            print(f"    {b['summary']}")
        print(f'нашлось кирпичей: {len(hits)}')
        return 0
    if cmd == 'list':
        for b in all_bricks():
            print(f"[{b['shelf']}] {b['id']}: {b['title']}")
        print(f'всего кирпичей: {len(all_bricks())}, творений: {len(load_creations())}')
        return 0
    if cmd == 'add' and len(argv) >= 7:
        row = add(argv[2], argv[3], argv[4], argv[5], argv[6])
        print(f"кирпич на полке: {row['id']}")
        return 0
    print(__doc__)
    return 0


if __name__ == '__main__':
    raise SystemExit(main(sys.argv))
