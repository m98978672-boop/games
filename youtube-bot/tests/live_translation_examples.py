"""Record actual model outputs alongside reference translations for human review."""
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from game_text_translation import russian_game_text

EXAMPLES = [
    ('When the guard arrived, I had already unlocked the gate.', 'Когда страж пришёл, я уже отпер ворота.'),
    ('I was unlocking the gate when the alarm went off.', 'Я отпирал ворота, когда сработала тревога.'),
    ('I had been waiting for 3 hours before she found me.', 'Я ждал уже 3 часа, прежде чем она меня нашла.'),
    ('We will have crossed the bridge by dawn.', 'К рассвету мы уже перейдём мост.'),
    ('I used to guard the gate, but I am not used to this cold.', 'Раньше я охранял ворота, но к такому холоду не привык.'),
    ('You must not touch the lever. You do not have to wait here.', 'Рычаг трогать нельзя. Ждать здесь необязательно.'),
    ('If you had found the key, we could have escaped.', 'Если бы ты нашёл ключ, мы могли бы сбежать.'),
    ('Press [E] to give {player} 4 keys.', 'Нажми [E], чтобы отдать {player} 4 ключа.'),
]

if __name__ == '__main__':
    rows = [dict(source=source, reference=reference, actual=russian_game_text(source, context='Реплики и подсказки сюжетной игры.'))
            for source, reference in EXAMPLES]
    Path(sys.argv[1]).write_text(json.dumps(rows, ensure_ascii=False, indent=2), encoding='utf-8')
    print(f'Usable outputs: {sum(row["actual"] is not None for row in rows)}/{len(rows)}; semantic accuracy not automatically scored.')
