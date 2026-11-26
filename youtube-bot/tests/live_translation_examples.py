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

MULTILINGUAL = [
    ('fr', 'Il fallait partir avant que la porte ne se ferme.', 'Нужно было уйти до того, как дверь закроется.'),
    ('es', 'No abras la puerta hasta que vuelva.', 'Не открывай дверь, пока я не вернусь.'),
    ('de', 'Du musst hier nicht warten.', 'Тебе не обязательно ждать здесь.'),
    ('pt-BR', 'Se ele vier amanhã, abra o portão.', 'Если он придёт завтра, открой ворота.'),
    ('ja', 'まだ扉を開けていない。', 'Дверь ещё не открыли.'),
    ('zh-Hans', '他已经找到钥匙了。', 'Он уже нашёл ключ.'),
    ('ko', '아직 문을 열지 마세요.', 'Пока не открывайте дверь.'),
    ('uk', 'Ти вже відімкнув браму?', 'Ты уже отпер ворота?'),
    ('tr', 'Kapıyı açmış ama kimse görmemiş.', 'Говорят, он открыл дверь, но никто этого не видел.'),
    ('ar', 'لا تفتح الباب حتى أعود.', 'Не открывай дверь, пока я не вернусь.'),
]

if __name__ == '__main__':
    engine = sys.argv[2] if len(sys.argv) > 2 else 'qwen'
    if engine == 'm2m':
        from multilingual_translation import _load_runtime, m2m_russian_text
        _load_runtime()
        translate = lambda source, lang: m2m_russian_text(source, source_language=lang or 'en')
    elif engine == 'qwen':
        from script_contract import _load_qwen_runtime
        _load_qwen_runtime()
        translate = lambda source, lang: russian_game_text(source, source_language=lang)
    else:
        raise ValueError('Unknown translation engine')
    rows = [dict(source=source, reference=reference, actual=translate(source, 'en'))
            for source, reference in EXAMPLES]
    rows += [dict(language=lang, source=source, reference=reference,
                  actual=translate(source, lang))
             for lang, source, reference in MULTILINGUAL]
    Path(sys.argv[1]).write_text(json.dumps(rows, ensure_ascii=False, indent=2), encoding='utf-8')
    # Fixed, non-sensitive fixtures only. Annotations remain available to review
    # even in environments that cannot download Actions artifacts.
    for row in rows:
        print('::notice title=Translation example::' + json.dumps(row, ensure_ascii=False), flush=True)
    print(f'Usable outputs: {sum(row["actual"] is not None for row in rows)}/{len(rows)}; semantic accuracy not automatically scored.')
    if not any(row['actual'] is not None for row in rows):
        raise RuntimeError('The loaded model produced no valid translations')
