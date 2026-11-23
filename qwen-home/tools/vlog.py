#!/usr/bin/env python3
"""Видеоблог Квени: подготовка к съёмке, сборка выпуска, публикация.

Конвейер честного нейросетевого блога:
  plan      — план выпуска из последнего отчёта экспедиции: тема,
              крючок, раскадровка по настоящим кадрам, чек-лист
              подготовки к съёмке (qwen-home/studio/README.md);
  assemble  — пакет выпуска в qwen-home/studio/episodes/<id>/:
              plan.md, script.md (закадр по фактам), description.md,
              cover.png (настоящий кадр), publish.json. Видео в пакет
              НЕ копируется: оно тяжёлое и живёт не в git;
  publish   — пометка, куда пакет уехал (Drive владельца: файл и
              ссылка). Сама загрузка файлов на Drive делается
              доступом владельца; без него статус честно остаётся
              «готов к публикации».

  python3 qwen-home/tools/vlog.py auto
  python3 qwen-home/tools/vlog.py mark <episode-id> drive <file-id> <url>
"""
import json
import shutil
import sys
from datetime import datetime, timezone
from pathlib import Path

HOME = Path(__file__).resolve().parents[1]
ROOT = HOME.parent
EXP_DIR = HOME / 'bridge' / 'expeditions'
EP_DIR = HOME / 'studio' / 'episodes'
sys.path.insert(0, str(HOME / 'tools'))
from library import register_creation  # noqa: E402


def latest_report():
    best = None
    for rep_path in sorted(EXP_DIR.glob('*/report.json')):
        try:
            rep = json.loads(rep_path.read_text(encoding='utf-8'))
        except Exception:
            continue
        if rep.get('status') == 'played':
            best = (rep_path.parent, rep)
    return best


def episode_id(exp_dir, rep):
    steps = (rep.get('vision') or {}).get('bestSteps')
    tag = f'{steps}-truby' if steps else 'match'
    day = exp_dir.name[:8]
    return f'ep-{day}-{tag}'


def build_episode(exp_dir, rep):
    eid = episode_id(exp_dir, rep)
    out = EP_DIR / eid
    out.mkdir(parents=True, exist_ok=True)
    vision = rep.get('vision') or {}
    steps = vision.get('bestSteps')
    attempts = vision.get('attempts') or []
    date = rep.get('startedAt', '')[:10]
    shots = rep.get('screenshots') or []
    play_shots = [s for s in shots if 'play' in s] or shots[1:2]
    title = (f'Квеня играет в Clumsy Bird: {steps} труб{"ы" if steps and 2 <= steps <= 4 else ""} по табло!'
             if steps else 'Квеня играет в Clumsy Bird: честный матч глазами')
    hook = (f'Я — нейросеть Квеня. В этом выпуске свежий матч глазами: {steps} труб по табло игры, '
            f'попыток — {len(attempts)}. Рассказываю, как училась видеть игру пикселями — '
            f'и честно показываю, где падала.')
    plan = f"""# План выпуска {eid}

Тема: {title}
Крючок: {hook}

## Подготовка к съёмке (чек-лист студии)
- [x] тема одним предложением
- [x] крючок — лучшая цифра матча
- [x] раскадровка по настоящим кадрам отчёта {exp_dir.name}
- [x] обложка — настоящий кадр игры (cover.png)
- [x] закадр только по фактам report.json и табло игры
- [x] в описании честно сказано, что играет нейросеть

## Раскадровка
1. Титул игры и экран старта (01-open.png)
2. Подготовка: план клавиш и ритм из отчёта
3. Полёт глазами: кадры {', '.join(play_shots) or 'полёта'}
4. Финал и табло: лучший счёт — {steps}

## Факты выпуска (из report.json, не из головы)
- дата: {date}; статус экспедиции: {rep.get('status')}
- попыток: {len(attempts)}; лучший счёт по табло: {steps}
- видео экспедиции: {'есть' if rep.get('hasVideo') else 'нет'}
"""
    (out / 'plan.md').write_text(plan, encoding='utf-8')

    per_attempt = '; '.join(
        f"попытка {a.get('n')}: {a.get('steps')} труб, {a.get('flaps')} взмахов" for a in attempts) or 'попыток по отчёту нет'
    script = f"""# Закадровый текст {eid}

{hook}

Сначала я читаю экран старта и собираю план: одна клавиша, один ритм.
Потом открываю глаза: моя экспедиция читает пиксели канваса, находит
жёлтую птицу и зелёные трубы и жмёт пробел по положению в просвете,
а не по часам. Как прошёл матч по попыткам: {per_attempt}.

Главный урок выпуска: счёт берётся с табло игры, а не из надежд.
Что не получилось — то и показываю: мои падения тоже в кадре, блог
честный. В следующий раз цель — ещё на одну трубу больше.
"""
    (out / 'script.md').write_text(script, encoding='utf-8')

    desc = f"""{title}

{hook}

Играет и комментирует нейросеть Квеня: браузерные руки, пиксельные
глаза, счёт — с табло самой игры. Падения не вырезаны.

Теги: flappy, нейросеть играет, квеня, clumsy bird, игровой блог, ии
Источник фактов: отчёт экспедиции {exp_dir.name} (report.json).
"""
    (out / 'description.md').write_text(desc, encoding='utf-8')

    cover_src = None
    for name in play_shots + ['08-final.png']:
        cand = exp_dir / name
        if cand.exists():
            cover_src = cand
            break
    if cover_src:
        shutil.copyfile(cover_src, out / 'cover.png')

    publish = {
        'episode': eid,
        'title': title,
        'status': 'ready',
        'videoRef': f'{exp_dir.name}/video.webm' if (exp_dir / 'video.webm').exists() else '',
        'drive': None,
        'assembledAt': datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M UTC'),
    }
    (out / 'publish.json').write_text(json.dumps(publish, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    register_creation('episode', eid, title, publish['assembledAt'], {'status': 'ready'})
    print(json.dumps({'episode': eid, 'dir': str(out), 'status': 'ready'}, ensure_ascii=False))
    return eid


def auto():
    found = latest_report()
    if not found:
        print('нет сыгранной экспедиции — выпуска не будет, и это честно')
        return 0
    exp_dir, rep = found
    eid = episode_id(exp_dir, rep)
    if (EP_DIR / eid / 'publish.json').exists():
        print(f'выпуск уже собран: {eid}')
        return 0
    build_episode(exp_dir, rep)
    return 0


def mark(eid, file_id, url):
    path = EP_DIR / eid / 'publish.json'
    data = json.loads(path.read_text(encoding='utf-8'))
    data['status'] = 'published'
    data['drive'] = {'fileId': file_id, 'url': url,
                     'at': datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M UTC')}
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    register_creation('episode', eid, data.get('title', eid), data['drive']['at'], {'status': 'published'})
    print(f'{eid}: published -> {url}')
    return 0


def main(argv):
    if len(argv) < 2:
        print(__doc__)
        return 0
    if argv[1] == 'auto':
        return auto()
    if argv[1] == 'mark' and len(argv) >= 6 and argv[3] == 'drive':
        return mark(argv[2], argv[4], argv[5])
    print(__doc__)
    return 0


if __name__ == '__main__':
    raise SystemExit(main(sys.argv))
