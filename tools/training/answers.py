"""Разбор ответов модели. Отдельный модуль без torch — чтобы его можно было
проверять тестом в CI, где тяжёлых библиотек нет.

Модель может ответить чистым JSON, JSON с мусором вокруг или просто словами.
Здесь всё это приводится к одному из трёх значений: True, False или None
(не разобрали — это отдельная метрика, а не «нет бага»).
"""
import json
import re


def parse_answer(raw):
    """Вернуть True (баг есть), False (чисто) или None (не поняли ответ)."""
    if not isinstance(raw, str):
        return None

    for m in re.finditer(r'\{[^{}]*"bug"[^{}]*\}', raw):
        try:
            obj = json.loads(m.group(0))
        except json.JSONDecodeError:
            continue
        if isinstance(obj.get('bug'), bool):
            return obj['bug']

    low = raw.lower()
    # Сначала отрицание: «нет багов» содержит слово «баг», порядок важен.
    if re.search(r'\b(false|чист\w*|нет багов|всё в порядке|все в порядке)\b', low):
        return False
    if re.search(r'\b(true|баг|сломан|дефект)\b', low):
        return True
    return None


def parse_action(raw):
    """Разбор решения командира: вернуть dict действия или None.

    Нужен для оценки «играет по правилам»: ответ должен быть ровно тем
    JSON-объектом, который принимает игра.
    """
    if not isinstance(raw, str):
        return None
    raw = raw.strip()
    for m in re.finditer(r'\{[^{}]*\}', raw):
        try:
            obj = json.loads(m.group(0))
        except json.JSONDecodeError:
            continue
        if isinstance(obj, dict) and isinstance(obj.get('action'), str):
            return obj
    return None
