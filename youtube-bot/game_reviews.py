"""Grounded game-review Shorts built only from the Games community catalog.

Qwen chooses which game and catalog features to highlight. The renderer narrates
those exact source strings rather than trusting the model to invent game facts.
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
SYSTEM_PROMPT = """Ты — редактор русскоязычного канала Games: короткие ИИ-разборы игр и игровых проектов.
Выбери одну игру из переданного каталога и ровно две её сильные стороны (только точные
feature_id из каталога). Не выдумывай игровой процесс, отзывы игроков, производительность,
доступность, цены, платформы, сюжет или факты, которых нет в каталоге. Оценка — только
впечатление от описания/идеи, не оценка прохождения. Укажи возможный минус именно как
гипотезу («может не подойти…»), привяжи его к одному feature_id. Не заявляй, что ты
лично играл. Пиши по-русски, без оскорблений, кликбейта, чужих персонажей, ссылок и
призывов, вводящих зрителя в заблуждение. Не выбирай игру из recent_game_ids, если есть
другие варианты. Верни только JSON по схеме:
{"schema_version":1,"game_id":"id из каталога","selected_feature_ids":["feature-id-1","feature-id-2"],"possible_minus":"короткая осторожная гипотеза до 100 символов","minus_feature_id":"feature-id из каталога","idea_score":7,"hook":"короткий крючок до 100 символов"}
"""


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
            "Сделай редакционный план одного Shorts. Сильные стороны будут озвучены дословно "
            "из каталога; выбери две feature_id. Возможный минус — только осторожная гипотеза, "
            "не утверждение о фактическом качестве. Не повторяй недавнюю игру, кроме случая, "
            "когда в каталоге нет альтернатив. Оценка — субъективная оценка идеи по описанию."
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
        raise ValueError("Qwen selected a game that is not in the Games catalog")

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
    if not 8 <= len(hook) <= 100:
        raise ValueError("hook must be 8–100 characters")
    possible_minus = str(data.get("possible_minus", "")).strip()
    if not 10 <= len(possible_minus) <= 100 or re.search(r"https?://|www\.|@[\w.-]+", possible_minus, re.I):
        raise ValueError("possible_minus must be a short, non-link hypothesis")
    if not re.search(r"может|возможно|похоже|вероятно", possible_minus, re.I):
        raise ValueError("possible_minus must be clearly marked as a hypothesis")
    recent = set(recent_game_ids)
    if game_id in recent and (set(catalog) - recent):
        raise ValueError("Qwen repeated a recently reviewed game while alternatives remain")

    pros = [feature_ids[str(item)] for item in selected]
    minus_evidence = feature_ids[minus_feature_id]
    return {
        "schema_version": 1,
        "format": "game-review",
        "game_id": game_id,
        "game_title": game["title"],
        "game_version": game["version"],
        "source": game["source"],
        "title": f"ИИ-разбор: {game['title']} — плюс и возможный минус"[:100],
        "hook": hook,
        "pros": pros,
        "possible_minus": possible_minus,
        "minus_evidence": minus_evidence,
        "idea_score": score,
        "scenes": [
            {"speaker": "Games AI", "dialogue": speech_excerpt(hook, 78), "visual": f"ИИ-разбор проекта {game['title']}", "emotion": "curious", "label": "ПЕРВЫЙ ВЗГЛЯД"},
            {"speaker": "Games AI", "dialogue": f"Плюс по каталогу: «{speech_excerpt(pros[0], 76)}».", "visual": pros[0], "emotion": "happy", "label": "ПЛЮС"},
            {"speaker": "Games AI", "dialogue": f"Ещё плюс: «{speech_excerpt(pros[1], 76)}».", "visual": pros[1], "emotion": "happy", "label": "ЕЩЁ ПЛЮС"},
            {"speaker": "Games AI", "dialogue": f"Возможный минус: {speech_excerpt(possible_minus, 76)}.", "visual": f"Основание из каталога: {minus_evidence}", "emotion": "curious", "label": "ВОЗМОЖНЫЙ МИНУС"},
            {"speaker": "Games AI", "dialogue": f"Оценка идеи по описанию — {score} из 10. Это не личное прохождение.", "visual": "Оценка идеи, не тест геймплея", "emotion": "calm", "label": "ВЕРДИКТ"},
        ],
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
    if not 8 <= len(hook) <= 100:
        hook = f"Что предлагает игра {game.get('title', 'Games')}?"[:100]
        if len(hook) < 8:
            hook = "Коротко об игре Games!"

    possible_minus = str(data.get("possible_minus", "")).strip()
    if (
        not 10 <= len(possible_minus) <= 100
        or re.search(r"https?://|www\\.|@[\\w.-]+", possible_minus, re.I)
        or not re.search(r"может|возможно|похоже|вероятно", possible_minus, re.I)
    ):
        evidence = features[int(minus_id.rsplit("-f", 1)[1]) - 1][:45]
        possible_minus = f"Возможно, акцент на «{evidence}» подойдёт не всем."

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


def youtube_description(review: Mapping[str, Any]) -> str:
    return (
        f"Короткий ИИ-разбор проекта {review['game_title']} ({review['game_version'] or 'версия не указана'}).\n"
        f"Плюсы взяты из публичного каталога Games: {review['pros'][0]}; {review['pros'][1]}.\n"
        f"Возможный минус — гипотеза ИИ: {review['possible_minus']}.\n\n"
        "Это оценка идеи по описанию проекта, а не личное прохождение или независимое тестирование. "
        "Сведения проверены по каталогу проекта на момент генерации."
    )[:5000]
