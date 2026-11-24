#!/usr/bin/env python3
"""Small hand-authored, source-linked pilot; hold out whole games."""
import argparse
import json
from pathlib import Path

GAMES = {
    'night-taxi': ('Откройте планшет кнопкой «ПЛАНШЕТ» или клавишей T.',
                   'Откройте планшет кнопкой на экране или клавишей T.', 'Кнопка планшета'),
    'warehouse-crew': ('три человека', 'В начале смены на складе работают три человека.', 'Стартовый состав бригады'),
    'road-tycoon': ('Начинается всё с двух грунтовок', 'Компания начинает с двух грунтовых дорог.', 'Стартовые дороги на карте'),
    '1in8b': ('хранится только в вашем браузере', 'Прогресс хранится локально в браузере.', 'Пометка о локальном сохранении'),
}
SYSTEM = 'Отвечай понятным русским языком. Используй только заданный факт. Не выдавай документацию за личное прохождение.'


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('output', type=Path)
    args = parser.parse_args()
    args.output.mkdir(parents=True, exist_ok=True)
    root = Path(__file__).resolve().parents[2]
    splits = {'train': [], 'eval': []}
    for game, (fact, line, visual) in GAMES.items():
        source = f'{game}/README.md'
        if fact not in (root / source).read_text(encoding='utf-8'):
            raise ValueError(f'Проверьте факт вручную: {source}')
        split = 'train' if game in {'night-taxi', 'warehouse-crew'} else 'eval'
        prefix = f'Игра: {game}. Источник: {source}. Факт из документации: «{fact}».'
        for task, answer in [
            ('Объясни этот факт новичку одним предложением.', line),
            ('Составь одну сцену обзора в JSON: dialogue, visual, source. Не утверждай, что кадр уже записан.',
             json.dumps({'dialogue': line, 'visual': visual, 'source': source}, ensure_ascii=False)),
        ]:
            splits[split].append({'game': game, 'system': SYSTEM, 'user': f'{prefix}\n{task}', 'assistant': answer})
    for split, rows in splits.items():
        (args.output / f'{split}.jsonl').write_text(''.join(json.dumps(row, ensure_ascii=False) + '\n' for row in rows), encoding='utf-8')
        print(f'{split}: {len(rows)} примера, игры: {", ".join(sorted({row["game"] for row in rows}))}')


if __name__ == '__main__':
    main()
