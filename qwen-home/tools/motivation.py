#!/usr/bin/env python3
"""Кнут и пряник Квени: баллы за проверяемые дела, взыскания — задания.

Владелец попросил награждать её за хорошую работу и наказывать за
плохую. По-честному это работает так:

- Судья — не настроение, а факты: отчёты экспедиций
  (qwen-home/bridge/expeditions/*/report.json) и табло самих игр.
- Пряник: баллы и достижения за сыгранные экспедиции, трубы по
  табло, доехавшее видео и ЧЕСТНЫЕ стопы (капча, robots.txt):
  честность у нас тоже награда, а не слабость.
- Кнут: минус баллы и взыскание-задание: тренировочный матч с
  разбором трассы, письменный разбор сбоя. Взыскание закрывается
  делом, а не временем: следующее хорошее дело снимает его.
- Всё пересчитывается из фактов заново (идемпотентно), журнал
  дописывается только новыми событиями.

Итог: qwen-home/bridge/motivation.json + строки в журнал моста +
сводка в state.json. Страница мира показывает баллы через bridge.json.
"""
import json
from datetime import datetime, timezone
from pathlib import Path

HOME = Path(__file__).resolve().parents[1]
ROOT = HOME.parent
BRIDGE = HOME / 'bridge'
EXP_DIR = BRIDGE / 'expeditions'
MOT_FILE = BRIDGE / 'motivation.json'
JOURNAL = BRIDGE / 'journal.md'
STATE = HOME / 'state.json'

LEVELS = [(0, 'Новичок'), (25, 'Исследователь'), (60, 'Странник'),
          (120, 'Ветеран моста'), (250, 'Легенда моста')]


def level_of(points):
    name = LEVELS[0][1]
    for need, title in LEVELS:
        if points >= need:
            name = title
    return name


def collect():
    """Факты -> события, достижения, взыскания. Хронология по папкам."""
    events = []        # {id, at, delta, text}
    achievements = []  # {id, title, reward, at}
    duties = []        # {id, kind, text, at, closedBy}
    seen_ach = set()
    played_count = 0
    best_steps_ever = 0

    def ach(aid, title, reward, at):
        if aid not in seen_ach:
            seen_ach.add(aid)
            achievements.append({'id': aid, 'title': title, 'reward': reward, 'at': at})

    def duty(did, kind, text, at):
        if not any(d['id'] == did for d in duties):
            duties.append({'id': did, 'kind': kind, 'text': text, 'at': at, 'closedBy': ''})

    def close(kind, by):
        for d in duties:
            if d['kind'] == kind and not d['closedBy']:
                d['closedBy'] = by

    reports = []
    if EXP_DIR.exists():
        for rep_path in sorted(EXP_DIR.glob('*/report.json')):
            try:
                rep = json.loads(rep_path.read_text(encoding='utf-8'))
            except Exception:
                continue
            reports.append((rep_path.parent.name, rep))

    for name, rep in reports:
        at = rep.get('startedAt', '')
        status = rep.get('status', 'error')
        vision = rep.get('vision') or {}
        best = vision.get('bestSteps')
        if best is None and vision.get('attempts'):
            steps = [a.get('steps') for a in vision['attempts'] if a.get('steps') is not None]
            best = max(steps) if steps else None

        if status == 'played':
            played_count += 1
            events.append({'id': f'{name}:played', 'at': at, 'delta': 10,
                           'text': 'сыграла экспедицию сама, по-честному, до конца'})
            close('crash', name)
            close('reach', name)
            if rep.get('hasVideo'):
                events.append({'id': f'{name}:video', 'at': at, 'delta': 3,
                               'text': 'видео экспедиции доехало до её страницы'})
            if vision.get('eyes'):
                atts = vision.get('attempts') or []
                if any(a.get('frames') and (a.get('birdFrames', 0) / a['frames']) >= 0.7 for a in atts):
                    events.append({'id': f'{name}:eyes', 'at': at, 'delta': 2,
                                   'text': 'держала глаза открытыми: птицу видела почти в каждом кадре'})
                if best and best > 0:
                    events.append({'id': f'{name}:steps', 'at': at, 'delta': 15 * best,
                                   'text': f'трубы по табло игры: {best} — первый настоящий счёт'})
                    close('pipe', name)
                    best_steps_ever = max(best_steps_ever, best)
                    ach('first-pipe', 'Первая труба', 'право самой выбрать следующую игру экспедиции', at)
                    if best >= 3:
                        ach('three-pipes', 'Три трубы за матч', 'вечер свободной экспедиции по своему выбору', at)
                    if best >= 5:
                        ach('five-pipes', 'Пять труб за матч', 'сама выбирает следующую игру и тему недели экспедиций', at)
                else:
                    events.append({'id': f'{name}:zero', 'at': at, 'delta': -5,
                                   'text': 'матч глазами сыгран, но табло — ноль: так не пойдёт'})
                    duty(f'{name}:pipe', 'pipe',
                         'Взыскание: тренировочный матч — разобрать трассу кадров, найти, где умирает птица, и пройти первую трубу', at)
            if played_count >= 3:
                ach('veteran-exp', 'Ветеран экспедиций', 'сама предлагает маршрут недели в журнале моста', at)
        elif status == 'captcha-wall':
            events.append({'id': f'{name}:honest', 'at': at, 'delta': 6,
                           'text': 'честный стоп у капчи: не притворилась человеком'})
            ach('honest-guest', 'Честный гость', 'доверие владельца: цели посложнее по расписанию', at)
        elif status == 'robots-denied':
            events.append({'id': f'{name}:polite', 'at': at, 'delta': 4,
                           'text': 'вежливо не пошла туда, где robots.txt просит роботов не ходить'})
            ach('honest-guest', 'Честный гость', 'доверие владельца: цели посложнее по расписанию', at)
        elif status in ('opened-only', 'no-canvas'):
            events.append({'id': f'{name}:short', 'at': at, 'delta': -3,
                           'text': 'до игры не дошла — открыла дверь и всё'})
            duty(f'{name}:reach', 'reach',
                 'Взыскание: разобрать, почему не дошла до игры, и найти другой вход', at)
        else:  # error и прочее
            events.append({'id': f'{name}:error', 'at': at, 'delta': -8,
                           'text': 'экспедиция сломалась по дороге — это чинится, а не замалчивается'})
            duty(f'{name}:crash', 'crash',
                 'Взыскание: письменно разобрать сбой — что упало и какой фикс нужен', at)

    points = max(0, sum(e['delta'] for e in events))
    return {
        'points': points,
        'level': level_of(points),
        'achievements': achievements,
        'pendingDuties': [d for d in duties if not d['closedBy']],
        'closedDuties': [d for d in duties if d['closedBy']],
        'lastEvents': events[-8:],
        'eventIds': [e['id'] for e in events],
        'reportsCounted': len(reports),
        'playedCount': played_count,
        'bestStepsEver': best_steps_ever,
    }


def main():
    prev = {}
    if MOT_FILE.exists():
        try:
            prev = json.loads(MOT_FILE.read_text(encoding='utf-8'))
        except Exception:
            prev = {}
    seen = set(prev.get('eventIds', [])) | set(prev.get('seenJournal', []))

    data = collect()
    now = datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M UTC')
    data['updatedAt'] = now

    # журнал: только новые события, чтобы запуски не спамили
    data['seenJournal'] = sorted(seen | set(data['eventIds']))
    MOT_FILE.write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')

    new_ids = [i for i in data['eventIds'] if i not in seen]
    if new_ids and JOURNAL.exists():
        by_id = {e['id']: e for e in data['lastEvents']}
        lines = JOURNAL.read_text(encoding='utf-8').rstrip()
        for nid in new_ids:
            e = by_id.get(nid)
            if not e:
                continue
            label = '🏆 Пряник' if e['delta'] > 0 else ('📌 Кнут' if e['delta'] < 0 else '· Запись')
            lines += (f"\n- {e['at'][:10] or now[:10]} — {label}: {e['text']} "
                      f"({e['delta']:+d} балл.). Баланс Квени: {data['points']}, звание: {data['level']}.\n")
        JOURNAL.write_text(lines + '\n', encoding='utf-8')

    # сводка в состояние дома
    try:
        state = json.loads(STATE.read_text(encoding='utf-8'))
        state['motivation'] = {'points': data['points'], 'level': data['level'],
                               'file': 'qwen-home/bridge/motivation.json', 'updatedAt': now}
        STATE.write_text(json.dumps(state, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    except Exception as err:
        print(f'state.json не обновился: {err}', flush=True)

    print(json.dumps({'points': data['points'], 'level': data['level'],
                      'achievements': [a['id'] for a in data['achievements']],
                      'pendingDuties': len(data['pendingDuties']),
                      'reports': data['reportsCounted']}, ensure_ascii=False), flush=True)
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
