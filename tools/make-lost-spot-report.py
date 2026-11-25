#!/usr/bin/env python3
"""Собрать одностраничный отчёт о прохождении сюжетной игры Квенией.

Читает report.json одной экспедиции и делает HTML: кадры, карта, весь путь.
Ничего не придумывает — только то, что лежит в отчёте прогона.

    python3 tools/make-lost-spot-report.py \
        qwen-home/bridge/expeditions/<STAMP>-<HOST> deliverables/kvenya-lost-spot.html
"""
import base64
import json
import sys
from pathlib import Path

SRC = Path(sys.argv[1]) if len(sys.argv) > 1 else None
OUT = Path(sys.argv[2]) if len(sys.argv) > 2 else Path('deliverables/kvenya-lost-spot.html')
if SRC is None:
    raise SystemExit('нужен путь к каталогу экспедиции')

report = json.loads((SRC / 'report.json').read_text(encoding='utf-8'))
story = report.get('story') or {}
m = story.get('map') or {}
path = story.get('path') or []


def img(name):
    p = SRC / name
    if not p.exists():
        return ''
    return 'data:image/png;base64,' + base64.b64encode(p.read_bytes()).decode()


# Что она нашла в истории: ищем в пройденных пассажах ключевые события пути.
MILESTONES = (
    ('кусты с псом', 'spots fur'),
    ('нашла пса', 'found you'),
    ('лабиринт в кустах', 'maze in here'),
    ('качели и горка', 'play on the swings'),
    ('под площадкой', 'playground structure'),
    ('магазин: чипсы', 'favorite chips'),
    ('магазин: бананы', 'bananas are all perfectly'),
    ('больница', 'receptionist'),
    ('ресторан', 'go here with your Mom'),
    ('кухня: пёс дома', 'sits in the kitchen'),
    ('улица, бетон', 'block of concrete'),
)
seen = {}
for p in path:
    low = (p.get('text') or '').lower()
    for title, needle in MILESTONES:
        if needle in low and title not in seen:
            seen[title] = p
milestones = ''.join('<li><b>%s</b> — заход %s, ход %s: %s</li>' % (
    t, v.get('run', 1), v.get('n', 0), (v.get('text') or '')[:110].replace('<', '&lt;'))
    for t, v in seen.items())

rows = '\n'.join(
    '<tr><td>%s·%s</td><td>%s</td><td class="%s">%s</td><td>%s</td><td>%s</td></tr>' % (
        p.get('run', 1), p.get('n', 0), p.get('choice', ''),
        'new' if p.get('fresh') else 'rep',
        'новое' if p.get('fresh') else '—',
        ('⚡%+d' % p['energy']) if p.get('energy') else '',
        (p.get('text') or '')[:100].replace('<', '&lt;'))
    for p in path)

figs = ''.join(
    '<figure><img src="%s" alt="%s"><figcaption>%s</figcaption></figure>' % (img(f), cap, cap)
    for f, cap in (('03-story-01.png', 'Ход 1: история спрашивает имя — жмёт «OK»'),
                   ('05-story-16.png', 'Дом: «You are well rested» — можно идти искать'),
                   ('07-story-32.png', 'Город: школа, магазин, больница, парк')))

endings = story.get('endings') or []
endings_html = ''.join(
    '<div class="end"><b>заход %s</b> · %s<br><span class="lead">%s</span></div>' % (
        e.get('run', '?'),
        ' → '.join(str(x) for x in (e.get('route') or []) if x) if isinstance(e.get('route'), list)
        else (e.get('route') or '—'),
        (e.get('text') or '').replace('<', '&lt;'))
    for e in endings)

runs = story.get('runs') or []
runs_html = ''.join(
    '<li>заход %s: <b>%s</b> выборов, новых мест %s</li>' % (r['run'], r['moves'], r['newPlaces'])
    for r in runs)

html = """<!doctype html><html lang="ru"><head><meta charset="utf-8">
<title>Квеня прошла Lost Spot</title>
<style>
body{background:#0d1117;color:#e6edf3;font:16px/1.55 system-ui,Segoe UI,Roboto,sans-serif;max-width:1080px;margin:auto;padding:36px 24px}
h1{font-size:28px;margin:0 0 6px} h2{font-size:20px;margin:32px 0 10px;color:#9ecbff}
.lead{color:#9aa7b4} img{width:100%;border-radius:12px;border:1px solid #25303b;display:block}
figure{margin:0;flex:1 1 300px} figcaption{color:#8b949e;font-size:13px;margin-top:6px}
.grid{display:flex;gap:14px;flex-wrap:wrap}
table{border-collapse:collapse;width:100%;font-size:13px}
th,td{border-bottom:1px solid #21262d;padding:6px 8px;text-align:left;vertical-align:top}
th{color:#9ecbff;position:sticky;top:0;background:#0d1117} .new{color:#3fb950} .rep{color:#6e7681}
.kpi{display:flex;gap:12px;flex-wrap:wrap;margin:18px 0}
.kpi div{background:#161b22;border:1px solid #25303b;border-radius:12px;padding:12px 16px;flex:1 1 130px}
.kpi b{display:block;font-size:24px;color:#58a6ff}
.end{background:#161b22;border-left:3px solid #3fb950;padding:12px 16px;border-radius:8px;margin:12px 0}
</style></head><body>
<h1>Квеня прошла Lost Spot</h1>
<p class="lead">Сюжетная игра не из нашего репозитория: Twine/Harlowe, 75 пассажей, 10 концовок.
Она читает текст, видит силы и находки, ведёт карту мест и после финала начинает заново, чтобы добрать непройденные ветки.</p>
<div class="kpi">
<div><b>{{moves}}</b>выборов</div><div><b>{{nruns}}</b>захода</div><div><b>{{places}}</b>мест в карте</div>
<div><b>{{links}}</b>переходов</div><div><b>{{finds}}</b>находок</div>
</div>
<h2>Найденные финалы ({{nend}})</h2>{{endings}}
<h2>Заходы</h2><ul>{{runs}}</ul>
<h2>Что было на экране</h2>
<div class="grid">{{figs}}</div>
<h2>Что она нашла по дороге</h2><ul>{{milestones}}</ul>
<h2>Что она поняла про игру (карта)</h2>
<p>Мест <b>{{places}}</b>, переходов <b>{{links}}</b>, нажато вариантов {{tried}}.
Усталых мест {{tired}}, бодрых {{energetic}}. Находки: {{finds_list}}.</p>
<h2>Весь путь</h2>
<table><thead><tr><th>заход·ход</th><th>выбор</th><th>место</th><th>силы</th><th>что было на экране</th></tr></thead>
<tbody>{{rows}}</tbody></table>
<p class="lead" style="margin-top:18px">Данные — из report.json этого прогона, без дописок.</p>
</body></html>"""

values = {
    'moves': story.get('moves', 0), 'nruns': len(runs), 'places': m.get('places', 0),
    'links': m.get('links', 0), 'finds': len(m.get('finds') or []), 'runs': runs_html,
    'figs': figs, 'tried': m.get('tried', 0), 'tired': m.get('tired', 0),
    'energetic': m.get('energetic', 0), 'finds_list': ', '.join(m.get('finds') or []) or '—',
    'rows': rows, 'milestones': milestones, 'endings': endings_html or '<p class="lead">финалов не было</p>',
    'nend': len(endings),
}

for k, v in values.items():
    html = html.replace('{{' + k + '}}', str(v))


OUT.parent.mkdir(parents=True, exist_ok=True)
OUT.write_text(html, encoding='utf-8')
print('отчёт:', OUT, '|', len(path), 'шагов |', round(OUT.stat().st_size / 1024), 'КБ')
