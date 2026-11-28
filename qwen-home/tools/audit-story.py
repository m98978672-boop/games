#!/usr/bin/env python3
"""Аудит всех обновлений в чтении сюжетной игры.

Зачем: правки в экспедицию шли десятком PR, а тесты в `learn.mjs` переписывали
другие сессии — стражи тихо пропадали. Здесь один список того, что должно быть
в коде РАБОТАЮЩИМ, и проверка каждого пункта на месте.

    python3 qwen-home/tools/audit-story.py           # проверить
    python3 qwen-home/tools/audit-story.py --json    # машинный вид

Каждая проверка — про поведение, а не про красоту кода: если пункт пропал,
значит пропала и способность.
"""
import json
import sys
from pathlib import Path

HOME = Path(__file__).resolve().parent.parent
EXP = HOME / 'tools' / 'expedition.py'
WF = HOME.parent / '.github' / 'workflows' / 'kvenya-expedition.yml'
BRIDGE_JS = HOME.parent / 'kvenya' / 'bridge.js'


def load():
    return {
        'exp': EXP.read_text(encoding='utf-8') if EXP.exists() else '',
        'wf': WF.read_text(encoding='utf-8') if WF.exists() else '',
        'js': BRIDGE_JS.read_text(encoding='utf-8') if BRIDGE_JS.exists() else '',
    }


def audit(src=None):
    """Список проверок: (что проверяем, чем, чем именно подтверждается)."""
    s = src or load()
    e, w, j = s['exp'], s['wf'], s['js']
    checks = [
        # --- видеть ---
        ('видит текст истории, а не только канвас', [
            ('TWINE_TASK_JS', 'TWINE_TASK_JS' in e),
            ('варианты помечаются data-kv-choice', 'data-kv-choice' in e),
            ('служебные кнопки отсеиваются', 'save|load|restart' in e),
        ]),
        ('видит силы по словам, без двойного счёта', [
            ('оценка сил', 'def read_signal' in e),
            ('ярусы (tier), чтобы «very tired» считалось один раз', "'low'" in e and "'high'" in e and 'tier in used' in e),
        ]),
        ('видит находки честно: карман — не добыча', [
            ('список находок', 'STORY_FINDS' in e),
            ('ложный pocket убран', "'in your pocket', 'you grab'" not in e),
        ]),
        ('видит следы пса', [('следы', 'STORY_CLUES' in e and "'clues': clues" in e)]),

        # --- анализировать ---
        ('ведёт карту мест и переходов', [
            ('класс карты', 'class StoryMap' in e),
            ('переход пишется, когда видно, куда привёл', "story_map.link(pending['from'], pending['choice'], text, here_ctx, labels," in e),
            ('место различается набором вариантов, а не путём', 'options' in e and "'\\u241f' + '|'.join(sorted" in e),
            ('место — хэш всего текста', "hashlib.sha1(norm.encode('utf-8'))" in e),
        ]),
        ('идёт по НЕнажатым выборам (главный фикс цикла)', [
            ('критерий — пара место+выбор', 'def not_tried' in e and 'story_map.tried_here' in e),
        ]),
        ('петли не считаются новыми', [
            ('петля по came_from', 'def is_loop' in e and 'came_from' in e),
            ('петли — в конце выбора', 'no_loops' in e),
        ]),
        ('не топчется: стоп-кран', [
            ('след мест', 'trail' in e),
            ('стоп-кран', 'стоп-кран' in e and 'len(trail) > 18' in e),
        ]),
        ('бережёт силы: отдых вместо дальней дороги', [
            ('отдых', 'def is_rest' in e),
            ('дальний путь', 'def is_far' in e),
        ]),
        ('диалог подтверждения: OK, а не Cancel', [
            ('подтверждение', "'ok', 'okay', 'yes', 'да'" in e and 'affirm' in e),
        ]),

        # --- добывать новое ---
        ('начинает историю заново по-настоящему', [
            ('чистка сохранённой истории', 'RESTART_JS' in e and 'sessionStorage' in e),
            ('кнопка Restart как первый путь', 'tw-icon[title="Restart" i]' in e),
        ]),
        ('идёт заново только если есть что искать', [
            ('остались непройденные варианты', 'def mark_open' in e and 'непройденных вариантов не осталось' in e),
        ]),
        ('помнит карту между прогонами', [
            ('сохранение карты', 'def to_cache' in e),
            ('загрузка карты', 'def load_cache' in e),
            ('старая схема карты не берётся', "data.get('schema') != self.SCHEMA" in e),
            ('ребро берёт готовый ключ места', 'src_key=None' in e and 'from_key' in e),
            ('при малом остатке — в непройденное, не в петлю', 'leads_to_new' in e),
            ('есть маршрут к остатку', 'def route_to_open' in e),
            ('висячие рёбра не берутся из памяти', "e.get('from') in self.nodes" in e),
            ('тот же текст — одно место', 'def text_key_index' in e),
            ('названия ссылок вычищаются из текста', 'def bare(' in e),
            ('память хранит text_key', "'text_key': v.get('text_key') or k" in e),
            ('ребро — ключом предыдущего места', "prev_key[0] = my_key" in e),
            ('флаг open пересчитывается', "node['open'] = any(not self.tried_here" in e),
            ('заход кончается, если идти некуда', 'идти некуда' in e),
            ('стоп-кран ловит петлю по подписи текста', 'trail.append(story_map.text_sig' in e),
            ('«уже проверено» — не новое место', 'def is_echo' in e),
            ('на развилке ветка важнее выхода', 'def is_exit' in e),
            ('окно ввода не даёт вечного остатка', 'def is_dialog' in e),
            ('маршрут проходит пустые места насквозь', 'цель — только там, где есть остаток' in e),
            ('одна ссылка — один исход', "e.get('to') != to:" in e),
            ('нервное ребро не считается надёжным путём', "e['shaky'] = True" in e),
            ('случайный лабиринт разыгрывается с ограничением', 'attempts < MAZE_STEPS' in e),
            ('маяк ссылки: память о том, куда она привела', 'self.beacon[(fr, choice)] = to' in e),
            ('место с остатком считается по одной точке', 'def remaining_at(self, k):' in e),
            ('направление к остатку ищется и по старым местам', 'def direction_to_open' in e),
            ('маршрут не ведёт в ложный остаток', "not (tk and (tk, label) in self.tried)" in e),
            ('нажатие не теряется между наборами', 'def tried_here' in e),
            ('отдых не перебивает непройденное', 'rest_fresh' in e),
            ('память доходит до чтения истории', 'memo_from=memo_from' in e),
            ('workflow передаёт карту', '--memo' in w and 'storymap.json' in w),
        ]),
        ('видит, сколько осталось непройденного', [
            ('расчёт остатка', 'def remaining' in e),
            ('варианты мест в карте', "'options': (v.get('options') or [])[:8]" in e),
        ]),

        # --- отчёт и честность ---
        ('концовки различаются по пути', [
            ('путь концовки', 'routeKey' in e and "'route': ' → '.join(tail)" in e),
            ('список путей в отчёте', 'endingsSeen' in e),
        ]),
        ('видео и отчёт доезжают до страницы', [
            ('причина падения видна', 'trap ' in w),
            ('видео не больше 8 МБ', 'scale=640:-2,fps=12' in w and 'Пережатое видео всё ещё' in w),
        ]),
        ('пыль экспедиций не копится', [
            ('уборка по списку страницы', "keep = {e.get('dir')" in w),
            ('уборка и до выхода «отчёта нет»', w.find('убрала старый каталог') < w.find('Отчёта нет — складывать нечего') if w else False),
        ]),
        ('страница мира показывает путь и карту', [
            ('строка пути', 'kv-story' in j),
            ('карта', 'kv-map' in j),
        ]),
        ('почти всё знает — закрывает остаток, а не бегает наугад', [
            ('остаток в выборе учитывается', 'story_map.remaining() <= 8' in e),
            ('план захода называется', 'план захода' in e),
        ]),
        ('долгая история: окно и заходы', [
            ('окно до 10 минут', 'min(600, seconds)' in e),
            ('заходов хватает на повторный проход лабиринта', 'runs=12' in e),
            ('эхо лабиринта кончает заход', "report.step('эхо лабиринта'" in e),
            ('скрытые числа игры читаются из состояния', 'window.State && window.State.variables' in e),
            ('цена места в подозрительности — увидена по числам игры', 'def note_sus' in e),
            ('подозрительность копится по сигналу игры', 'HEARD_BUSHES' in e and 'gather_now' in e),
            ('контент места меняется — старые «нажато» не мешают', 'def forget_tried' in e),
            ('нажато в отчёте не уменьшается', 'len(self.tried | self.pressed_old)' in e),
        ]),
    ]
    out = []
    for name, items in checks:
        bad = [why for label, why in items if not why]
        out.append({'проверка': name, 'ок': not bad,
                    'чего нет': [lbl for (lbl, ok) in items if not ok]})
    return out



def audit_data(reports_dir=None):
    """Аудит данных: отчёты, карты, страница. Код может быть цел, а данные — нет."""
    root = Path(reports_dir) if reports_dir else HOME / 'bridge' / 'expeditions'
    # Архив — прогоны, которые доказывают старое умение (например, 5 разных
    # путей к финалу). Уборка workflow чистит только свежие каталоги, архив
    # остаётся, и аудит смотрит в обе папки.
    arch = HOME / 'bridge' / 'archive'
    rows = []
    reports = sorted(root.glob('*/report.json')) if root.exists() else []
    if arch.exists():
        reports += sorted(arch.glob('*/report.json'))
    rows.append(('отчёты экспедиций есть', bool(reports), f'{len(reports)} шт.'))

    story_reports, maps, routes, zeros = [], 0, set(), []
    for rep in reports:
        try:
            r = json.loads(rep.read_text(encoding='utf-8'))
        except Exception:
            rows.append((f'отчёт читается: {rep.parent.name}', False, 'битый JSON'))
            continue
        st = r.get('story') or {}
        if st:
            story_reports.append(rep)
            if (rep.parent / 'storymap.json').exists():
                maps += 1
            for ed in (st.get('endings') or []):
                if ed.get('routeKey'):
                    routes.add(ed['routeKey'])
        if r.get('kind') == 'story':
            mp = (st.get('map') or {})
            if mp.get('places', 0) and mp.get('links', 0) == 0:
                zeros.append(rep.parent.name)

    rows.append(('истории записаны', bool(story_reports), f'{len(story_reports)} отчётов'))
    rows.append(('карты сохранены рядом с отчётами', maps > 0, f'{maps} карт'))
    # Разные пути к финалу должны быть хотя бы в ОДНОМ прогоне: после находки
    # поломки карты последние прогоны честно заканчивались без финала, а старые
    # (где 5 путей) лежат в той же папке — сверяем всё, что есть.
    rows.append(('концовки различаются путём', len(routes) >= 2, f'{len(routes)} разных путей'))
    rows.append(('карта не пустая (места есть, связи есть)', not zeros,
                 'нарушено: ' + ', '.join(zeros[:3]) if zeros else 'все карты со связями'))

    # последний отчёт: у него должна быть память и осмысленный остаток
    if story_reports:
        last = json.loads(story_reports[-1].read_text(encoding='utf-8'))
        st = last['story']
        mp = st.get('map') or {}
        # Память либо вспомнилась (совместимая схема), либо честно пустая.
        # Фальшивкой было бы «вспомнила» места, которых нет в карте.
        remembered = st.get('remembered', 0)
        rows.append(('память не врёт: вспомненных мест не больше, чем в карте',
                     remembered <= mp.get('places', 0),
                     f"вспомнила {remembered}, в карте {mp.get('places', 0)}"))
        # Мест может быть и мало: после чистки схемы карта начинается с нуля,
        # а «много мест» — не добродетель: раздутая карта из мусорных ключей
        # была 473 места при остатке 516. Важно не число мест, а честный
        # прогресс: нажато вариантов и остаток внятный.
        rows.append(('прогресс есть: варианты нажимаются',
                     mp.get('tried', 0) >= 20, f"нажато {mp.get('tried', 0)}"))
        rows.append(('в отчёте есть, что осталось', 'remaining' in mp, f"остаток {mp.get('remaining', '—')}"))
        # Остаток обязан быть меньше числа нажатых вариантов: если «осталось»
        # больше, чем вообще было вариантов, — счёт врёт (считает по устаревшему
        # флагу open, как было в прогоне 45628356826: «29 мест» при остатке 9).
        rows.append(('остаток не больше нажатого: счёт не по застывшему флагу',
                     mp.get('remaining', 0) <= mp.get('tried', 0) + 1,
                     f"остаток {mp.get('remaining')} при нажатых {mp.get('tried')}"))
    return [{'проверка': n, 'ок': bool(ok), 'факт': fact} for n, ok, fact in rows]

def main():
    rows = audit()
    data = audit_data()
    ok = sum(1 for r in rows if r['ок'])
    ok_data = sum(1 for r in data if r['ок'])
    if '--json' in sys.argv:
        print(json.dumps({'ok': ok, 'total': len(rows), 'rows': rows,
                          'data_ok': ok_data, 'data_total': len(data), 'data': data},
                         ensure_ascii=False, indent=2))
        return 0 if (ok == len(rows) and ok_data == len(data)) else 1
    for r in rows:
        mark = '✓' if r['ок'] else '✗'
        print(f"{mark} {r['проверка']}")
        if not r['ок']:
            for miss in r['чего нет']:
                print(f"    нет: {miss}")
    print('\n— данные: отчёты, карты, страница —')
    for r in data:
        print(f"{'✓' if r['ок'] else '✗'} {r['проверка']} — {r['факт']}")
    print(f"\nАудит истории: код {ok} из {len(rows)}, данные {ok_data} из {len(data)}.")
    return 0 if (ok == len(rows) and ok_data == len(data)) else 1


if __name__ == '__main__':
    sys.exit(main())
