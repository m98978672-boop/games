"""Source-grounded reviews of real games using public external store/review data.

Qwen chooses which externally sourced game and verified facts to discuss. The
rendered description carries the URLs so viewers can copy and inspect them.
"""
from __future__ import annotations

import json
import re
import sys
from pathlib import Path
from typing import Any, Iterable, Mapping

from script_contract import _extract_json, generate_with_qwen
from speech_policy import speech_excerpt

ROOT = Path(__file__).resolve().parents[1]
CATALOG_PATH = ROOT / "site" / "community-games.json"
SYSTEM_PROMPT = """Ты — редактор русскоязычного канала об играх из Steam и других внешних источников.
Выбери одну реальную игру из переданного списка Steam и ровно две особенности (только точные
feature_id из внешних источников). Не выдумывай игровой процесс, отзывы, производительность,
доступность, цены, платформы, сюжет или другие факты, которых нет в источниках. Оценка —
субъективная оценка по опубликованным данным, а не результат личного прохождения. Укажи
возможный минус только как гипотезу («может не подойти…») и привяжи к одному feature_id.
Озвучиваемый текст напиши естественным русским языком кириллицей; английское название игры
не вставляй в реплики, если можно произнести его русским описанием. Не заявляй, что ты лично
играл. Пиши без оскорблений и кликбейта. Ссылки на источники добавит программа отдельно.
Не выбирай игру из recent_game_ids, если есть другие варианты. Верни только JSON по схеме:
{"schema_version":1,"game_id":"id из списка Steam","selected_feature_ids":["точные feature-id","точные feature-id"],"possible_minus":"короткая осторожная гипотеза до 100 символов","minus_feature_id":"точный feature-id","idea_score":7,"hook":"короткий крючок до 100 символов"}
"""


def _russian_ratio(text: str) -> float:
    letters = [char for char in text if char.isalpha()]
    return sum("\u0400" <= char <= "\u04ff" for char in letters) / len(letters) if letters else 0.0


def load_game_catalog(path: Path = CATALOG_PATH) -> list[dict[str, Any]]:
    """Read the public site catalog; reject malformed/duplicate game records."""
    try:
        payload = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as exc:
        raise RuntimeError(f"Games catalog could not be read: {path}") from exc
    games = payload.get("games") if isinstance(payload, dict) else None
    if not isinstance(games, list) or not games:
        raise ValueError("Games catalog has no games")
    result: list[dict[str, Any]] = []
    seen: set[str] = set()
    for entry in games:
        if not isinstance(entry, dict):
            continue
        game_id = str(entry.get("id", "")).strip()
        title = str(entry.get("title", "")).strip()
        features = entry.get("features")
        if not game_id or game_id in seen or not title or not isinstance(features, list) or not features:
            continue
        clean_features = [str(feature).strip() for feature in features if str(feature).strip()]
        if len(clean_features) < 2:
            continue
        seen.add(game_id)
        result.append({
            "id": game_id,
            "title": title[:100],
            "subtitle": str(entry.get("subtitle", ""))[:300],
            "description": str(entry.get("description", ""))[:1400],
            "version": str(entry.get("version", ""))[:80],
            "features": clean_features[:12],
            "source": f"site/community-games.json#{game_id}",
            "public_url": f"https://m98978672-boop.github.io/games/{game_id}/",
        })
    if not result:
        raise ValueError("Games catalog contains no valid game entries")
    return result


def build_review_messages(
    games: Iterable[Mapping[str, Any]],
    *,
    recent_game_ids: Iterable[str] = (),
    seed: str = "",
) -> list[dict[str, str]]:
    candidates = []
    for game in games:
        features = game.get("features", [])
        candidates.append({
            "id": str(game.get("id", "")),
            "title": str(game.get("title", "")),
            "subtitle": str(game.get("subtitle", "")),
            "description": str(game.get("description", ""))[:1400],
            "version": str(game.get("version", "")),
            "price_context": steam_price_note(game),
            "release_context": steam_release_note(game),
            "features": [
                {"feature_id": f"{game['id']}-f{i + 1}", "text": str(feature)}
                for i, feature in enumerate(features[:12])
            ],
        })
    request = {
        "catalog": candidates,
        "recent_game_ids": list(recent_game_ids)[-12:],
        "seed": seed[:80],
        "instructions": (
            "Сделай редакционный план русскоязычного обзора одной внешней игры. Выбери две "
            "feature_id из предоставленных источников; не подменяй реальные игры локальным каталогом. "
            "Возможный минус — только осторожная гипотеза, не утверждение о тестировании. "
            "Не повторяй недавнюю игру, кроме случая, когда источник не дал альтернатив. "
            "Объясни, что предлагает игра, только по описанию. При оценке идеи учитывай доступные "
            "описание, отзывы, цену и дату, но не выдумывай недостающие данные и не заявляй, "
            "что проверил соотношение цены и качества без игрового опыта. Оценка субъективна и предварительна. "
            "Все реплики — по-русски."
        ),
    }
    return [
        {"role": "system", "content": SYSTEM_PROMPT},
        {"role": "user", "content": json.dumps(request, ensure_ascii=False)},
    ]


def review_opening(title: str) -> str:
    """A short host introduction; game name is a source-provided title, not a claim."""
    title = re.sub(r'\s+', ' ', str(title)).strip()
    if not title:
        raise ValueError('A game title is required for the introduction')
    title = speech_excerpt(title, 45)
    return f'Привет! Сегодня разбираем {title}: что это за игра и кому она может подойти.'


def ensure_editorial_quality(scenes: list[dict[str, str]]) -> None:
    """Reject known generic/repeated long scripts before production rendering.

    This is a limited heuristic, not verification of facts, voice quality or rights.
    """
    from difflib import SequenceMatcher
    if len(scenes) != 10 or any(scene.get('generation') == 'source-template' for scene in scenes):
        raise ValueError('Long review rejected: generic fallback or missing chapters; no video uploaded')
    texts = [re.sub(r'\s+', ' ', str(s.get('dialogue', '')).lower()).strip() for s in scenes]
    if any(len(t) < 120 for t in texts):
        raise ValueError('Long review rejected: insufficient chapter content')
    for i, left in enumerate(texts):
        for right in texts[i + 1:]:
            if SequenceMatcher(None, left, right, autojunk=False).ratio() > .78:
                raise ValueError('Long review rejected: repetitive chapters; no video uploaded')
    stock = ('описание помогает увидеть', 'не заменяет личную игровую сессию',
             'предпочтения у игроков разные', 'отправную точку для собственного знакомства')
    if sum(any(phrase in text for phrase in stock) for text in texts) >= 2:
        raise ValueError('Long review rejected: generic filler; no video uploaded')


def validate_review(raw: str | dict[str, Any], games: Iterable[Mapping[str, Any]], *, recent_game_ids: Iterable[str] = ()) -> dict[str, Any]:
    data = _extract_json(raw) if isinstance(raw, str) else dict(raw)
    if data.get("schema_version") != 1:
        raise ValueError("unsupported game-review schema")
    catalog = {str(game["id"]): dict(game) for game in games}
    game_id = str(data.get("game_id", ""))
    game = catalog.get(game_id)
    if game is None:
        raise ValueError("Qwen selected a game that is not in the external Steam source list")

    feature_ids = {f"{game_id}-f{i + 1}": str(feature) for i, feature in enumerate(game["features"][:12])}
    selected = data.get("selected_feature_ids")
    if (not isinstance(selected, list) or len(selected) != 2 or selected[0] == selected[1]
            or any(str(item) not in feature_ids for item in selected)):
        raise ValueError("Qwen must choose exactly two source-backed catalog features")
    minus_feature_id = str(data.get("minus_feature_id", ""))
    if minus_feature_id not in feature_ids:
        raise ValueError("possible minus must cite an existing catalog feature")

    raw_score = data.get("idea_score")
    if type(raw_score) is int:
        score = raw_score
    elif isinstance(raw_score, str) and re.fullmatch(r"[0-9]{1,2}", raw_score.strip()):
        score = int(raw_score.strip())
    else:
        raise ValueError("idea_score must be an integer from 1 to 10")
    if not 1 <= score <= 10:
        raise ValueError("idea_score must be an integer from 1 to 10")
    hook = str(data.get("hook", "")).strip()
    if not 8 <= len(hook) <= 100 or _russian_ratio(hook) < 0.5:
        raise ValueError("hook must be 8–100 characters of Russian narration")
    possible_minus = str(data.get("possible_minus", "")).strip()
    if not 10 <= len(possible_minus) <= 100 or re.search(r"https?://|www\.|@[\w.-]+", possible_minus, re.I):
        raise ValueError("possible_minus must be a short, non-link hypothesis")
    if not re.search(r"может|возможно|похоже|вероятно", possible_minus, re.I):
        raise ValueError("possible_minus must be clearly marked as a hypothesis")
    if _russian_ratio(possible_minus) < 0.5:
        raise ValueError("possible_minus must be Russian narration")
    recent = set(recent_game_ids)
    if game_id in recent and (set(catalog) - recent):
        raise ValueError("Qwen repeated a recently reviewed game while alternatives remain")

    pros = [feature_ids[str(item)] for item in selected]
    minus_evidence = feature_ids[minus_feature_id]
    description = str(game.get('description') or pros[0]).strip()
    description = re.sub(r'^Описание Steam:\s*', '', description, flags=re.I)
    scenes = [
        {"speaker": "Games AI", "dialogue": review_opening(game['title']), "visual": f"Обзор: {game['title']}", "emotion": "happy", "label": "ПРИВЕТ!"},
        {"speaker": "Games AI", "dialogue": f"О чём игра? По описанию авторов: {speech_excerpt(description, 90)}", "visual": description, "emotion": "curious", "label": "О ЧЁМ ИГРА"},
        {"speaker": "Games AI", "dialogue": f"Ещё одна деталь: {speech_excerpt(pros[1], 76)}", "visual": pros[1], "emotion": "happy", "label": "ОСОБЕННОСТИ"},
        {"speaker": "Games AI", "dialogue": f"А что может не понравиться? {speech_excerpt(possible_minus, 76)}", "visual": f"Основание: {minus_evidence}", "emotion": "curious", "label": "ВОЗМОЖНЫЙ МИНУС"},
        {"speaker": "Games AI", "dialogue": f"Итог: по описанию оценка идеи — {score} из 10. Я ещё не играла, поэтому оценка предварительная.", "visual": f"ИТОГ ПО ИСТОЧНИКАМ · {score}/10 · НЕ ЛИЧНОЕ ПРОХОЖДЕНИЕ", "emotion": "calm", "label": "ИТОГ"},
    ]
    if any(_russian_ratio(scene["dialogue"]) < 0.45 for scene in scenes):
        raise ValueError("A fact cannot be safely narrated in Russian; refusing English or mixed-language audio.")
    return {
        "schema_version": 1,
        "format": "game-review",
        "game_id": game_id,
        "game_title": game["title"],
        "game_version": game.get("version", ""),
        "source": game.get("source", ""),
        "public_url": game.get("public_url", ""),
        "sources": list(game.get("sources", [])),
        "screenshots": list(game.get("screenshots", [])),
        "source_facts": dict(game.get("source_facts", {})),
        "evidence": {f"{game_id}-f{i + 1}": str(feature) for i, feature in enumerate(game["features"][:12])},
        "title": f"ИИ-разбор: {game['title']} — плюс и возможный минус"[:100],
        "hook": hook,
        "pros": pros,
        "possible_minus": possible_minus,
        "minus_evidence": minus_evidence,
        "idea_score": score,
        "scenes": scenes,
    }


def _catalog_only_fallback(
    raw: str,
    games: list[Mapping[str, Any]],
    recent_game_ids: Iterable[str],
) -> dict[str, Any]:
    """Keep a bad model feature-ID choice from stopping a safe, source-grounded episode."""
    try:
        data = _extract_json(raw)
    except (TypeError, ValueError):
        data = {}
    catalog = {str(game["id"]): game for game in games}
    recent = set(recent_game_ids)
    fallback_game = next((game for game in games if str(game["id"]) not in recent), games[0])
    game = catalog.get(str(data.get("game_id", "")), fallback_game)
    if str(game["id"]) in recent and any(str(item["id"]) not in recent for item in games):
        game = fallback_game
    game_id = str(game["id"])
    features = [str(feature) for feature in game.get("features", [])[:12]]
    feature_ids = [f"{game_id}-f{i + 1}" for i in range(len(features))]
    if len(feature_ids) < 2:
        raise ValueError(f"Catalog game {game_id!r} has fewer than two usable features")

    proposed = data.get("selected_feature_ids")
    valid_proposed = (
        [str(item) for item in proposed]
        if isinstance(proposed, list)
        and len(proposed) == 2
        and proposed[0] != proposed[1]
        and all(str(item) in feature_ids for item in proposed)
        else feature_ids[:2]
    )
    minus_id = str(data.get("minus_feature_id", ""))
    if minus_id not in feature_ids:
        minus_id = valid_proposed[0]

    raw_score = data.get("idea_score")
    if type(raw_score) is int:
        score = raw_score
    elif isinstance(raw_score, str) and re.fullmatch(r"[0-9]{1,2}", raw_score.strip()):
        score = int(raw_score.strip())
    else:
        raise ValueError("No valid model assessment; refusing to invent a numeric rating")
    if not 1 <= score <= 10:
        raise ValueError("No valid model assessment; refusing to invent a numeric rating")

    hook = str(data.get("hook", "")).strip()
    if not 8 <= len(hook) <= 100 or _russian_ratio(hook) < 0.5:
        hook = "Что интересного предлагает эта игра?"

    possible_minus = str(data.get("possible_minus", "")).strip()
    if (
        not 10 <= len(possible_minus) <= 100
        or re.search(r"https?://|www\.|@[\w.-]+", possible_minus, re.I)
        or not re.search(r"может|возможно|похоже|вероятно", possible_minus, re.I)
        or _russian_ratio(possible_minus) < 0.5
    ):
        raise ValueError("No specific grounded possible limitation; refusing generic filler")

    repaired = {
        "schema_version": 1,
        "game_id": game_id,
        "selected_feature_ids": valid_proposed,
        "possible_minus": possible_minus,
        "minus_feature_id": minus_id,
        "idea_score": score,
        "hook": hook,
    }
    return validate_review(repaired, games, recent_game_ids=recent)


def generate_game_review(games: Iterable[Mapping[str, Any]], *, recent_game_ids: Iterable[str] = (), seed: str = "") -> dict[str, Any]:
    game_list = list(games)
    recent = list(recent_game_ids)
    messages = build_review_messages(game_list, recent_game_ids=recent, seed=seed)
    last_raw = ""
    last_error: ValueError | None = None

    # Give Qwen one constrained correction pass before falling back to exact
    # catalogue feature IDs. The final fallback never invents source facts.
    for attempt in range(2):
        attempt_messages = messages
        if attempt and last_error:
            allowed = {
                str(game["id"]): [f"{game['id']}-f{i + 1}" for i, _ in enumerate(game["features"][:12])]
                for game in game_list
            }
            attempt_messages = [
                *messages,
                {"role": "assistant", "content": "Я подготовил редакционный план и проверяю его формат."},
                {
                    "role": "user",
                    "content": (
                        f"Предыдущий план не прошёл проверку: {last_error}. Исправь его и верни только JSON. "
                        "Для selected_feature_ids укажи ровно два различных идентификатора из списка ниже; "
                        "minus_feature_id тоже должен точно совпадать с идентификатором из списка. "
                        "Не пиши названия функций вместо ID. Список допустимых ID: "
                        + json.dumps(allowed, ensure_ascii=False)
                    ),
                },
            ]
        last_raw = generate_with_qwen(attempt_messages, max_new_tokens=900 if attempt == 0 else 500)
        try:
            return validate_review(last_raw, game_list, recent_game_ids=recent)
        except ValueError as exc:
            last_error = exc

    print(
        f"Qwen plan failed validation twice ({last_error}); using a catalogue-only safe fallback.",
        file=sys.stderr,
    )
    try:
        return _catalog_only_fallback(last_raw, game_list, recent)
    except ValueError as exc:
        if 'No specific grounded possible limitation' not in str(exc):
            raise
        # Repair only the failing field, with the selected game's own facts.
        # Do not transfer an assessment to another game or invent a rating.
        try:
            draft = _extract_json(last_raw)
        except (TypeError, ValueError):
            raise exc
        chosen = next((g for g in game_list if str(g['id']) == str(draft.get('game_id', ''))), None)
        if chosen is None or (str(chosen['id']) in recent and any(str(g['id']) not in recent for g in game_list)):
            raise exc
        facts = {f"{chosen['id']}-f{i+1}": str(f) for i, f in enumerate(chosen.get('features', [])[:12])}
        for _ in range(2):
            repair_messages = [
                {'role':'system', 'content':(
                    'Исправь только возможный минус для обзора по источнику. '
                    'Не утверждай, что играл, и не выдумывай баги или свойства игры. '
                    'Назови конкретное предпочтение игрока, связанное с одним из указанных фактов; '
                    'это предположение, а не установленный недостаток. '
                    'По-русски, 10–100 символов, без ссылок, с обязательным словом «возможно» или «может». '
                    'Верни только JSON с полями possible_minus и minus_feature_id.')},
                {'role':'user', 'content':json.dumps({'game_id':str(chosen['id']), 'source_facts':facts}, ensure_ascii=False)},
            ]
            correction = generate_with_qwen(repair_messages, max_new_tokens=220)
            try:
                fields = _extract_json(correction)
                minus_id = str(fields.get('minus_feature_id', ''))
                if minus_id not in facts:
                    raise ValueError('Repair cites a fact outside the selected game')
                fixed = dict(draft, possible_minus=fields.get('possible_minus'), minus_feature_id=minus_id)
                return _catalog_only_fallback(json.dumps(fixed, ensure_ascii=False), game_list, recent)
            except (TypeError, ValueError) as repair_error:
                print(f"Possible limitation repair rejected ({repair_error}); not publishing unsupported claims.", file=sys.stderr)
        # A deterministic fallback is allowed only for an explicit negative
        # platform flag from Steam, not absence of a field or inferred bugs.
        # The wording describes the store card and a relevant player preference.
        reported = chosen.get('source_facts', {}).get('platforms_not_marked_supported', [])
        if isinstance(reported, list):
            for platform in ('Linux', 'macOS'):
                expected = f'Карточка Steam не отмечает поддержку {platform}'
                if platform not in reported or expected not in facts.values():
                    continue
                feature_id = next(k for k,v in facts.items() if v == expected)
                fixed = dict(draft, possible_minus=f'Возможно, игра не подойдёт тем, кому нужна поддержка {platform} в Steam.',
                             minus_feature_id=feature_id)
                try:
                    result = _catalog_only_fallback(json.dumps(fixed, ensure_ascii=False), game_list, recent)
                except ValueError:
                    continue
                result['limitation_generation'] = 'explicit_steam_platform_flag_template'
                return result
        raise ValueError('Could not produce a source-linked possible limitation after targeted retries; no upload') from exc


def generate_long_narration(review: Mapping[str, Any]) -> list[dict[str, str]]:
    """Write a source-constrained 3–5 minute Russian narration for a normal video."""
    evidence = review.get("evidence", {})
    if not isinstance(evidence, Mapping) or len(evidence) < 2:
        raise ValueError("long review requires at least two source-backed facts")
    messages = [
        {
            "role": "system",
            "content": (
                "Ты пишешь длинный русскоязычный видеообзор игры только по предоставленным фактам Steam. "
                "Ведущий уже поздоровался и назвал игру: не повторяй приветствие, сразу переходи к сути. "
                "Затем объясни, что игра предлагает и что в ней нужно делать только по описанию источника. "
                "Разнообразь длину фраз и переходы; избегай канцелярита и повторяющихся оговорок. "
                "Далее обсуждай конкретные особенности и возможные ограничения, затем итог. "
                "Не говори, что играл, не выдумывай механику, сюжет, производительность или отзывы. "
                "Отделяй факты из источника от субъективного мнения словами «по моему впечатлению от описания». "
                "Все реплики должны быть естественным русским языком; не вставляй английские предложения. "
                'Верни только JSON: {"scenes":[{"fact_id":"ID","dialogue":"русская реплика","visual":"идея карточки"}]}'
            ),
        },
        {
            "role": "user",
            "content": json.dumps({
                "game": review["game_title"],
                "score": review["idea_score"],
                "short_review": {
                    "hook": review["hook"], "pros": review["pros"],
                    "possible_minus": review["possible_minus"],
                },
                "sources": evidence,
                "task": (
                    "Напиши ровно 10 разных глав для ролика 3–5 минут. Для каждой главы выбери один точный fact_id "
                    "и напиши dialogue от 220 до 320 знаков по-русски. Всего не менее 2400 знаков. "
                    "Развивай анализ по главам, не повторяй одну мысль; не добавляй фактов, не подтверждённых источниками."
                ),
            }, ensure_ascii=False),
        },
    ]
    last_error: ValueError | None = None
    for attempt in range(1):
        raw = generate_with_qwen(messages, max_new_tokens=2400)
        try:
            data = _extract_json(raw)
            scenes = data.get("scenes")
            if not isinstance(scenes, list) or len(scenes) != 10:
                raise ValueError("long narration must contain exactly 10 chapters")
            clean: list[dict[str, str]] = []
            allowed = {str(key) for key in evidence}
            for scene in scenes:
                if not isinstance(scene, dict):
                    raise ValueError("long narration chapter must be an object")
                fact_id = str(scene.get("fact_id", ""))
                dialogue = fit_complete_chapter(str(scene.get('dialogue', '')))
                visual = re.sub(r'\s+', ' ', str(scene.get('visual', ''))).strip()
                cyrillic = sum('\u0400' <= char <= '\u04ff' for char in dialogue)
                letters = sum(char.isalpha() for char in dialogue)
                if fact_id not in allowed:
                    raise ValueError("long narration fact id is invalid")
                if not 220 <= len(dialogue) <= 320:
                    raise ValueError(f"long narration chapter length is {len(dialogue)} (required 220–320)")
                if not letters or cyrillic / letters < 0.7:
                    raise ValueError("long narration must be Russian, not English text")
                if not visual or len(visual) > 120 or re.search(r'https?://|www\.|@[\w.-]+', dialogue, re.I):
                    raise ValueError("long narration visuals or spoken dialogue are invalid")
                clean.append({"fact_id": fact_id, "dialogue": dialogue, "visual": visual})
            if sum(len(scene["dialogue"]) for scene in clean) < 2400:
                raise ValueError("long narration is too short to count as a full video")
            clean[-1]["dialogue"] += _source_verdict(review)
            clean[-1]["visual"] = f"ИТОГ ПО ИСТОЧНИКАМ · {review['idea_score']}/10"
            return with_store_context(clean, review)
        except ValueError as exc:
            last_error = exc
            messages.append({
                "role": "user",
                "content": f"Предыдущий JSON не прошёл проверку: {exc}. Исправь его точно по требованиям, верни только JSON.",
            })
    print(f"Qwen could not produce ten chapters at once ({last_error}); trying smaller batches.", file=sys.stderr)
    return _generate_long_in_batches(review)


def fit_complete_chapter(text: str, *, minimum: int = 220, maximum: int = 320) -> str:
    """Shorten a verbose response only at a full sentence boundary, or reject it."""
    text = re.sub(r"\s+", " ", str(text)).strip()
    ends = [m.end() for m in re.finditer(r"[.!?](?=\s|$)", text[:maximum + 1]) if m.end() <= maximum]
    if ends and ends[-1] >= minimum:
        return text[:ends[-1]].strip()
    raise ValueError(f"long narration chapter length is {len(text)} with no safe sentence boundary")


def _source_verdict(review: Mapping[str, Any]) -> str:
    """Add a conclusion without clipping the model's final sentence or a source fact."""
    return f" Итог по источникам: оценка идеи по описанию — {review['idea_score']} из 10. Лично я не играл."



def _generate_long_in_batches(review: Mapping[str, Any]) -> list[dict[str, str]]:
    """Ask for one bounded chapter at a time and reject malformed model output.

    Shorter completions reduce truncation. Each plain-text chapter is attached
    to the single supplied source by the program; this is provenance, not a
    guarantee that the model did not invent a claim. Fallback is never published.
    """
    evidence = review["evidence"]
    allowed = {str(key) for key in evidence}
    clean: list[dict[str, str]] = []
    evidence_ids = tuple(str(key) for key in evidence)
    for index in range(10):
        # Bind the source ourselves: the small model often emits prose instead
        # of JSON or invents IDs. This does not prove the prose entails the fact.
        selected_id = evidence_ids[index % len(evidence_ids)]
        messages = [
            {"role": "system", "content": (
                "Напиши один абзац для русскоязычного обзора игры на основе предоставленного факта. "
                "Не добавляй фактов, не заявляй личное прохождение. "
                "Мнение помечай как впечатление от описания. "
                "Используй несколько коротких законченных предложений с точками. "
                "Верни только текст абзаца, без JSON, заголовка, кавычек и пояснений."
            )},
            {"role": "user", "content": json.dumps({
                "chapter": index + 1, "total_chapters": 10,
                "game": review["game_title"],
                "role": ["что за игра и её цель без приветствия", "суть игрового процесса", "ключевое действие игрока",
                         "мир и контекст", "другая подтверждённая особенность", "какому игроку это может подойти",
                         "возможное ограничение как гипотеза", "цена и условия только по фактам", "что пока неизвестно",
                         "осмысленный итог"][index],
                "previous_chapters": [s['dialogue'] for s in clean[-2:]],
                "source_fact": evidence[selected_id],
                "task": "Один содержательный абзац от 220 до 320 символов по-русски, без ссылок. Не повторяй предыдущие главы.",
            }, ensure_ascii=False)},
        ]
        last_error: ValueError | None = None
        for _ in range(2):
            raw = generate_with_qwen(messages, max_new_tokens=700)
            try:
                if '{' in str(raw) or '}' in str(raw):
                    scene = _extract_json(raw)
                    fact_id = str(scene.get("fact_id", ""))
                    dialogue = re.sub(r"\s+", " ", str(scene.get("dialogue", ""))).strip()
                    visual = re.sub(r"\s+", " ", str(scene.get("visual", ""))).strip()
                else:
                    fact_id = selected_id
                    dialogue = re.sub(r"\s+", " ", str(raw)).strip()
                    if re.search(r'<[^>]*>|```|^извините|^я не могу', dialogue, re.I):
                        raise ValueError("long narration contains markup or a refusal")
                    visual = speech_excerpt(str(evidence[selected_id]), 100)
                if fact_id not in allowed or fact_id != selected_id:
                    raise ValueError("long narration fact id does not match the supplied source")
                dialogue = fit_complete_chapter(dialogue)
                if not 220 <= len(dialogue) <= 320:
                    raise ValueError(f"long narration chapter length is {len(dialogue)} (required 220–320)")
                if _russian_ratio(dialogue) < 0.7:
                    raise ValueError("long narration must be Russian, not English text")
                if not visual or len(visual) > 120 or re.search(r"https?://|www\.|@[\w.-]+", dialogue, re.I):
                    raise ValueError("long narration visuals or spoken dialogue are invalid")
                clean.append({"fact_id": fact_id, "dialogue": dialogue, "visual": visual})
                break
            except ValueError as exc:
                last_error = exc
                messages.append({"role": "user", "content": f"Предыдущий ответ не подошёл: {exc}. Верни только один абзац из 220–320 символов."})
        else:
            print(f"Qwen could not produce chapter {index + 1}: {last_error}; using clearly labelled source-based template.", file=sys.stderr)
            return _source_template_long_narration(review, reason=f"chapter {index + 1}: {last_error}")
    if sum(len(scene["dialogue"]) for scene in clean) < 2400:
        print("Qwen chapter total too short; using clearly labelled source-based template.", file=sys.stderr)
        return _source_template_long_narration(review, reason="chapters too short")
    clean[-1]["dialogue"] += _source_verdict(review)
    clean[-1]["visual"] = f"ИТОГ ПО ИСТОЧНИКАМ · {review['idea_score']}/10"
    return with_store_context(clean, review)



def _source_template_long_narration(review: Mapping[str, Any], *, reason: str = "unknown") -> list[dict[str, str]]:
    """A transparent source-only fallback when the model cannot follow its schema.

    This deliberately avoids treating catalog copy as firsthand evidence or
    invented gameplay; it fails closed when there aren't two narratable facts.
    It may be less engaging than a model-written review.
    """
    usable = []
    for key, value in review["evidence"].items():
        text = re.sub(r"\s+", " ", str(value)).strip()
        if len(text) < 10 or _russian_ratio(text) < 0.5 or re.search(r"https?://|www\.|@[\w.-]+", text, re.I):
            continue
        usable.append((str(key), speech_excerpt(text, 90)))
    if len(usable) < 2:
        raise ValueError("Template review requires two Russian source facts without links")
    commentary = [
        "Начнём с того, что это обзор открытой карточки, а не рассказ о личном прохождении. Описание помогает увидеть заявленную концепцию, но само по себе не подтверждает, насколько она хорошо реализована. За подробностями и актуальной информацией стоит обратиться к первоисточнику.",
        "Теперь обратим внимание на ещё один пункт карточки. Он помогает составить первое впечатление о проекте и понять, на что авторы обращают внимание в опубликованных материалах. Это не независимый тест: впечатление от реальной игры может отличаться от того, что обещает описание.",
        "Первую из указанных особенностей полезно рассматривать как ориентир, а не как гарантию качества. Из короткой карточки нельзя уверенно определить сложность, удобство или стабильность игры. Такие выводы требуют отдельной проверки, которой в этом обзоре не было.",
        "Второй пункт даёт ещё одну точку отсчёта для знакомства с проектом. Кому-то такой акцент может показаться интересным, а кому-то не подойти: предпочтения у игроков разные. По одному опубликованному описанию мы не можем предсказать личные впечатления каждого зрителя.",
        "Отдельно отмечу пределы этого разбора. Данные взяты из открытой карточки, поэтому мы пересказываем только опубликованные сведения. Здесь нет собственных измерений производительности, проверки управления или заключения о техническом состоянии игры на конкретном устройстве.",
        "Возможный минус здесь рассматривается как гипотеза, а не как обнаруженный недостаток. Даже интересная на бумаге идея не обязательно понравится каждому. Если особенность важна именно вам, лучше изучить подробности в источнике и проверить актуальные материалы перед выбором.",
        "При знакомстве с проектом важно различать слова авторов и независимый опыт игроков. Описание позволяет увидеть заявленный замысел, но не заменяет личную игровую сессию. В этом выпуске мы не приписываем себе прохождение и не придумываем впечатления от игры.",
        "Этот выпуск можно использовать как отправную точку для собственного знакомства. Ознакомьтесь со страницей игры, обратите внимание на доступные сведения и решите, какие особенности важны именно вам. Ссылки на использованные источники приведены в описании ролика.",
        "Напомню, что информация на странице со временем может измениться. Дата, режимы или другие характеристики стоит сверять непосредственно в источнике на момент просмотра. Мы обсуждаем опубликованную карточку, а не гарантируем, что все её детали останутся прежними.",
        "Подведём итог: представленные сведения помогают оценить замысел, но этого недостаточно для окончательного вывода об игре. Это осторожная оценка идеи по открытым данным, а не результат тестирования. Личный опыт и актуальную информацию нужно проверять отдельно.",
    ]
    scenes = []
    for index, paragraph in enumerate(commentary):
        fact_id, fact = usable[index % len(usable)]
        prefix = "В источнике указано: " + fact.rstrip(". ") + ". "
        scenes.append({"fact_id": fact_id, "dialogue": prefix + paragraph,
                       "visual": "ОПИСАНИЕ ИЗ ИСТОЧНИКА", "generation": "source-template", "fallback_reason": reason})
    summary = speech_excerpt(str(review["pros"][0]), 50)
    scenes[-1]["dialogue"] += f" Итог по источникам: {summary}. Оценка идеи — {review['idea_score']} из 10. Лично я не играл."
    scenes[-1]["visual"] = f"ИТОГ ПО ИСТОЧНИКАМ · {review['idea_score']}/10"
    return with_store_context(scenes, review)


def steam_price_note(review: Mapping[str, Any]) -> str:
    """Describe only validated Steam NL price data; never infer a missing price."""
    facts = review.get("source_facts")
    price = facts.get("price") if isinstance(facts, Mapping) else None
    if not isinstance(price, Mapping) or price.get("region") != "NL":
        return "Цена не подтверждена; проверьте страницу игры."
    checked = price.get("checked_at")
    if not isinstance(checked, str) or not re.fullmatch(r"\d{4}-\d{2}-\d{2}", checked):
        return "Цена не подтверждена; проверьте страницу игры."
    if price.get("kind") == "free_to_play":
        return f"По Steam, базовая игра бесплатна в Нидерландах на {checked}; возможны дополнительные покупки."
    cents = price.get("minor_units")
    if price.get("kind") == "paid" and price.get("currency") == "EUR" and type(cents) is int and 0 < cents <= 10_000_000:
        return f"Цена Steam для Нидерландов на {checked}: {cents // 100} евро {cents % 100:02d} центов; цена может измениться."
    return "Цена не подтверждена; проверьте страницу игры."


def steam_release_note(review: Mapping[str, Any]) -> str:
    """Do not present a future or unverified date as an already released game."""
    facts = review.get("source_facts")
    if not isinstance(facts, Mapping):
        return "Дата выхода не подтверждена; проверьте страницу игры."
    value = facts.get("release_date")
    coming = facts.get("release_coming_soon")
    if (not isinstance(value, str) or not value.strip() or len(value) > 80
            or re.search(r"https?://|www\.|[<>\r\n]", value, re.I)):
        return "Дата выхода не подтверждена; проверьте страницу игры."
    date = speech_excerpt(value.strip(), 60)
    if coming is True:
        return f"По Steam, выход ожидается: {date}. Дата может измениться."
    if coming is False:
        return f"Дата выхода по Steam: {date}."
    return f"В карточке Steam указана дата: {date}; статус выхода не подтверждён."


def with_store_context(scenes: list[dict[str, str]], review: Mapping[str, Any]) -> list[dict[str, str]]:
    """Add only observed store facts, including region and observation date.

    Price is displayed, not silently turned into a subjective value-for-money
    score. A source's listing does not prove gameplay quality.
    """
    if len(scenes) < 2:
        raise ValueError("At least two scenes are required for store context")
    result = [dict(scene) for scene in scenes]
    result[0]["dialogue"] = review_opening(str(review["game_title"])) + " " + result[0]["dialogue"].rstrip() + " " + steam_release_note(review)
    result[1]["dialogue"] = result[1]["dialogue"].rstrip() + " " + steam_price_note(review)
    return result


def youtube_description(review: Mapping[str, Any]) -> str:
    sources = review.get("sources") or []
    if not sources and review.get("public_url"):
        sources = [{"name": "Страница игры", "url": review["public_url"]}]
    source_lines = [
        f"- {str(source.get('name', 'Источник'))}: {str(source.get('url', ''))}"
        for source in sources
        if isinstance(source, Mapping) and str(source.get("url", "")).startswith("https://")
    ]
    provenance = "\n".join(source_lines) if source_lines else "Внешние ссылки на источники не получены."
    return (
        f"Русскоязычный ИИ-разбор внешней игры {review['game_title']} "
        f"({review.get('game_version') or 'дата/версия не указана'}).\n"
        f"Сильные стороны, отмеченные по источникам: {review['pros'][0]}; {review['pros'][1]}.\n"
        f"Возможный минус — гипотеза ИИ, не результат личного тестирования: {review['possible_minus']}.\n"
        f"{steam_release_note(review)}\n{steam_price_note(review)}\n\n"
        "Это обзор по опубликованным материалам, а не личное прохождение или независимый тест. "
        "Ссылки можно скопировать ниже:\n"
        f"{provenance}"
    )[:5000]
