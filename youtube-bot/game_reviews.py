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
            "Оценка — субъективное мнение только по опубликованным сведениям. Все реплики — по-русски."
        ),
    }
    return [
        {"role": "system", "content": SYSTEM_PROMPT},
        {"role": "user", "content": json.dumps(request, ensure_ascii=False)},
    ]


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

    try:
        score = int(data.get("idea_score"))
    except (TypeError, ValueError) as exc:
        raise ValueError("idea_score must be an integer from 1 to 10") from exc
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
    scenes = [
        {"speaker": "Games AI", "dialogue": speech_excerpt(hook, 78), "visual": f"ИИ-разбор проекта {game['title']}", "emotion": "curious", "label": "ПЕРВЫЙ ВЗГЛЯД"},
        {"speaker": "Games AI", "dialogue": f"По Steam, сильная сторона: «{speech_excerpt(pros[0], 76)}».", "visual": pros[0], "emotion": "happy", "label": "ФАКТ ИЗ STEAM"},
        {"speaker": "Games AI", "dialogue": f"Ещё один факт Steam: «{speech_excerpt(pros[1], 76)}».", "visual": pros[1], "emotion": "happy", "label": "ЕЩЁ ФАКТ STEAM"},
        {"speaker": "Games AI", "dialogue": f"Возможный минус: {speech_excerpt(possible_minus, 76)}.", "visual": f"Основание из Steam: {minus_evidence}", "emotion": "curious", "label": "ВОЗМОЖНЫЙ МИНУС"},
        {"speaker": "Games AI", "dialogue": f"Итог по Steam: {speech_excerpt(pros[0], 40)}. Оценка идеи — {score} из 10. Без личной игры.", "visual": f"ИТОГ ПО ИСТОЧНИКАМ · {score}/10 · НЕ ЛИЧНОЕ ПРОХОЖДЕНИЕ", "emotion": "calm", "label": "ИТОГ"},
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

    try:
        score = int(data.get("idea_score", 7))
    except (TypeError, ValueError):
        score = 7
    score = min(10, max(1, score))

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
        possible_minus = "Возможно, описанная особенность подойдёт не каждому игроку."

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
    return _catalog_only_fallback(last_raw, game_list, recent)


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
                dialogue = re.sub(r'\s+', ' ', str(scene.get('dialogue', ''))).strip()
                visual = re.sub(r'\s+', ' ', str(scene.get('visual', ''))).strip()
                cyrillic = sum('\u0400' <= char <= '\u04ff' for char in dialogue)
                letters = sum(char.isalpha() for char in dialogue)
                if fact_id not in allowed or not 220 <= len(dialogue) <= 320:
                    raise ValueError("long narration fact id or chapter length is invalid")
                if not letters or cyrillic / letters < 0.7:
                    raise ValueError("long narration must be Russian, not English text")
                if not visual or len(visual) > 120 or re.search(r'https?://|www\.|@[\w.-]+', dialogue, re.I):
                    raise ValueError("long narration visuals or spoken dialogue are invalid")
                clean.append({"fact_id": fact_id, "dialogue": dialogue, "visual": visual})
            if sum(len(scene["dialogue"]) for scene in clean) < 2400:
                raise ValueError("long narration is too short to count as a full video")
            # Put a deterministic, source-limited verdict at the end even when
            # the model's final chapter forgot one. Keep it short enough for TTS.
            summary = speech_excerpt(str(review["pros"][0]), 50)
            verdict = f"Итог по источникам: {summary}. Оценка идеи — {review['idea_score']} из 10. Лично я не играл."
            clean[-1]["dialogue"] = f"{speech_excerpt(clean[-1]['dialogue'], 200)} {verdict}"
            clean[-1]["visual"] = f"ИТОГ ПО ИСТОЧНИКАМ · {review['idea_score']}/10"
            return clean
        except ValueError as exc:
            last_error = exc
            messages.append({
                "role": "user",
                "content": f"Предыдущий JSON не прошёл проверку: {exc}. Исправь его точно по требованиям, верни только JSON.",
            })
    print(f"Qwen could not produce ten chapters at once ({last_error}); trying smaller batches.", file=sys.stderr)
    return _generate_long_in_batches(review)


def _generate_long_in_batches(review: Mapping[str, Any]) -> list[dict[str, str]]:
    """Ask for one bounded chapter at a time and reject malformed model output.

    Shorter completions reduce truncation and count errors from small models. No
    model text is accepted without the same language, length and source-ID checks.
    If a chapter still fails twice, stop rather than fabricate material.
    """
    evidence = review["evidence"]
    allowed = {str(key) for key in evidence}
    clean: list[dict[str, str]] = []
    for index in range(10):
        messages = [
            {"role": "system", "content": (
                "Напиши одну главу для русскоязычного обзора игры на основе источников. "
                "Не добавляй фактов, не заявляй личное прохождение. "
                "Мнение помечай как впечатление от описания. "
                'Верни один JSON: {"fact_id":"точный ID", "dialogue":"текст", "visual":"короткая подпись"}.'
            )},
            {"role": "user", "content": json.dumps({
                "chapter": index + 1, "total_chapters": 10,
                "sources": evidence,
                "task": "Одна глава, dialogue от 220 до 320 символов по-русски; используй точный fact_id из sources. Без ссылок в тексте.",
            }, ensure_ascii=False)},
        ]
        last_error: ValueError | None = None
        for _ in range(2):
            raw = generate_with_qwen(messages, max_new_tokens=700)
            try:
                scene = _extract_json(raw)
                fact_id = str(scene.get("fact_id", ""))
                dialogue = re.sub(r"\s+", " ", str(scene.get("dialogue", ""))).strip()
                visual = re.sub(r"\s+", " ", str(scene.get("visual", ""))).strip()
                if fact_id not in allowed or not 220 <= len(dialogue) <= 320:
                    raise ValueError("long narration fact id or chapter length is invalid")
                if _russian_ratio(dialogue) < 0.7:
                    raise ValueError("long narration must be Russian, not English text")
                if not visual or len(visual) > 120 or re.search(r"https?://|www\.|@[\w.-]+", dialogue, re.I):
                    raise ValueError("long narration visuals or spoken dialogue are invalid")
                clean.append({"fact_id": fact_id, "dialogue": dialogue, "visual": visual})
                break
            except ValueError as exc:
                last_error = exc
                messages.append({"role": "user", "content": f"Ошибка формата: {exc}. Верни один исправленный JSON, dialogue 220–320 символов."})
        else:
            raise ValueError(f"Qwen could not produce chapter {index + 1}: {last_error}")
    if sum(len(scene["dialogue"]) for scene in clean) < 2400:
        raise ValueError("long narration is too short to count as a full video")
    summary = speech_excerpt(str(review["pros"][0]), 50)
    verdict = f"Итог по источникам: {summary}. Оценка идеи — {review['idea_score']} из 10. Лично я не играл."
    clean[-1]["dialogue"] = f"{speech_excerpt(clean[-1]['dialogue'], 200)} {verdict}"
    clean[-1]["visual"] = f"ИТОГ ПО ИСТОЧНИКАМ · {review['idea_score']}/10"
    return clean


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
        f"Возможный минус — гипотеза ИИ, не результат личного тестирования: {review['possible_minus']}.\n\n"
        "Это обзор по опубликованным материалам, а не личное прохождение или независимый тест. "
        "Ссылки можно скопировать ниже:\n"
        f"{provenance}"
    )[:5000]
