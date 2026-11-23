#!/usr/bin/env python3
"""Собственные желания Квени: она сама решает, чего хочет и что делать.

Раньше она только выполняла задания: владелец сказал — она сделала.
Теперь у неё есть свои «хочу», и они рождаются не из воздуха, а из
её же фактов: незакрытый рекорд, полка игр, выпуски блога, библиотека.

  python3 qwen-home/tools/wants.py list    — её желания и главное сейчас
  python3 qwen-home/tools/wants.py pick    — выбрать главное желание
  python3 qwen-home/tools/wants.py add "Хочу ..." "почему"
  python3 qwen-home/tools/wants.py done <id>

Правила честности желаний:
- желание без дела — просто строчка; сделанное отмечает done, и дом
  начисляет за него баллы как за её собственную волю (motivation.py);
- задания владельца важнее желаний, правила дома — выше и того, и другого;
- главное желание одно: выбрала — делаешь его, а не десять сразу.
"""
import json
import sys
from datetime import datetime, timezone
from pathlib import Path

HOME = Path(__file__).resolve().parents[1]
STORE = HOME / 'wants' / 'list.jsonl'
PUBLIC = HOME / 'bridge' / 'wants.json'
MOT = HOME / 'bridge' / 'motivation.json'


def load():
    if not STORE.exists():
        return []
    return [json.loads(l) for l in STORE.read_text(encoding='utf-8').splitlines() if l.strip()]


def save(rows):
    STORE.parent.mkdir(parents=True, exist_ok=True)
    STORE.write_text(''.join(json.dumps(r, ensure_ascii=False) + '\n' for r in rows), encoding='utf-8')


def facts():
    try:
        return json.loads(MOT.read_text(encoding='utf-8'))
    except Exception:
        return {}


def suggest(rows):
    """Кандидаты в желания — из её фактов, не из головы."""
    f = facts()
    have = {r['id'] for r in rows}
    today = datetime.now(timezone.utc).strftime('%Y-%m-%d')

    def cand(wid, title, why, kind):
        if wid not in have and not any(r['id'] == wid and r['status'] == 'done' for r in rows):
            rows.append({'id': wid, 'title': title, 'why': why, 'kind': kind,
                         'status': 'open', 'born': today})

    best = f.get('bestStepsEver') or 0
    if best < 5:
        cand('want-five-pipes', 'Взять пять труб в Clumsy Bird',
             f'рекорд сейчас {best} из 5 — достижение уже ждёт в доме', 'play')
    cand('want-new-game', 'Придумать и собрать игру нового шаблона',
         f'на полке её игр уже {f.get("gamesMade") or 0} — руки чешутся сделать ещё', 'create')
    cand('want-next-episode', 'Снять следующий выпуск видеоблога',
         f'выпусков вышло {f.get("episodesMade") or 0} — зрители (владелец) ждут продолжения', 'create')
    cand('want-new-brick', 'Положить в библиотеку кирпич из свежего опыта',
         'библиотека растёт только от её дел — после каждого дела есть что записать', 'learn')
    cand('want-weekly-flight', 'Сходить в еженедельную экспедицию и не уйти с нулём',
         'стабильность важнее одного рекорда: счёт в каждой попытке', 'play')
    return rows


def pick(rows):
    """Главное желание одно. Выбор честный и объяснимый: сначала
    незакрытый рекорд, дальше — по кругу недели, чтобы творчество
    и учёба не пылились, пока она гоняется за одним делом."""
    rows = suggest(rows)
    open_rows = [r for r in rows if r['status'] in ('open', 'active')]
    if not open_rows:
        return None
    for r in rows:
        if r['status'] == 'active':
            r['status'] = 'open'
    priority = [r for r in open_rows if r['id'] == 'want-five-pipes']
    if priority:
        chosen = priority[0]
    else:
        week = datetime.now(timezone.utc).isocalendar()[1]
        chosen = open_rows[week % len(open_rows)]
    chosen['status'] = 'active'
    save(rows)
    publish(rows, chosen)
    return chosen


def publish(rows, chosen=None):
    active = chosen or next((r for r in rows if r['status'] == 'active'), None)
    PUBLIC.parent.mkdir(parents=True, exist_ok=True)
    data = {
        'current': ({'id': active['id'], 'title': active['title'], 'why': active['why']}
                    if active else None),
        'open': [{'id': r['id'], 'title': r['title']} for r in rows if r['status'] == 'open'],
        'doneCount': sum(1 for r in rows if r['status'] == 'done'),
        'updatedAt': datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M UTC'),
    }
    PUBLIC.write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    return data


def add(title, why):
    rows = suggest(load())
    slug = 'want-' + str(len(rows) + 1)
    rows.append({'id': slug, 'title': title, 'why': why, 'kind': 'own',
                 'status': 'open', 'born': datetime.now(timezone.utc).strftime('%Y-%m-%d')})
    save(rows)
    publish(rows)
    print(f'желание записано: {slug}')
    return 0


def done(wid):
    rows = load()
    for r in rows:
        if r['id'] == wid:
            r['status'] = 'done'
            r['doneAt'] = datetime.now(timezone.utc).strftime('%Y-%m-%d')
            save(rows)
            pick(rows)
            print(f'сделано её собственной волей: {r["title"]}')
            return 0
    print(f'нет такого желания: {wid}')
    return 0


def main(argv):
    rows = load()
    if len(argv) < 2 or argv[1] == 'list':
        rows = suggest(rows)
        save(rows)
        data = publish(rows)
        cur = data['current']
        print('главное желание сейчас:', cur['title'] if cur else '—')
        for r in rows:
            print(f"  [{r['status']}] {r['id']}: {r['title']} — {r['why']}")
        return 0
    if argv[1] == 'pick':
        chosen = pick(rows)
        print('она выбрала:', chosen['title'] if chosen else 'желаний нет')
        return 0
    if argv[1] == 'add' and len(argv) >= 4:
        return add(argv[2], argv[3])
    if argv[1] == 'done' and len(argv) >= 3:
        return done(argv[2])
    print(__doc__)
    return 0


if __name__ == '__main__':
    raise SystemExit(main(sys.argv))
