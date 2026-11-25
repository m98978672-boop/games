"""Проверяемые факты о ней самой, собранные из её собственных файлов.

Зачем: когда владелец спрашивает «какой у тебя счёт в шахматах», «сколько
уроков», «где ты живёшь», маленькая модель отвечает из воздуха — в реальном
разговоре она уже «придумала 3D-модельку». Факты о ней лежат в доме
(`state.json`, `bridge/games.json`, `bridge/wants.json`, `topics.txt`,
`memory/knowledge.jsonl`, `bridge/journal.md`), поэтому дом обязан подложить
их в разговор так же, как факты поиска: структурой, а не скобкой.

Модуль ничего не додумывает: каждое поле — это число или строка из файла,
а если файла нет, поле честно отсутствует (`None`), и ответ должен это
признать, а не выдумать.
"""
from __future__ import annotations

import json
import re
from dataclasses import dataclass, field
from pathlib import Path

MAX_FACTS = 6


class SelfFactsError(ValueError):
    """Дом не смог прочитать то, что нужно для честного ответа о себе."""


def _load_json(path: Path) -> dict:
    try:
        data = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError):
        return {}
    return data if isinstance(data, dict) else {}


def _count_lines(path: Path) -> int | None:
    try:
        return sum(1 for line in path.read_text(encoding="utf-8").splitlines() if line.strip())
    except OSError:
        return None


@dataclass
class SelfFacts:
    """Её состояние, каким оно записано в доме. Отсутствие — это None, не ноль."""

    name: str = "Квеня"
    home: str = "qwen-home/"
    base_model: str = ""
    steps: int | None = None
    learn_runs: int | None = None
    last_run_at: str | None = None
    eval_passed: int | None = None
    eval_total: int | None = None
    lessons: int | None = None
    topics: int | None = None
    knowledge_articles: int | None = None
    chess: dict = field(default_factory=dict)
    island: dict = field(default_factory=dict)
    want: dict = field(default_factory=dict)
    last_journal: str | None = None
    sources: dict = field(default_factory=dict)

    # -- что можно сказать вслух ------------------------------------------
    def facts(self) -> list[tuple[str, str]]:
        """Пары «поле → значение», только из реально прочитанных файлов."""
        out: list[tuple[str, str]] = []
        if self.steps is not None:
            out.append(("шагов обучения", str(self.steps)))
        if self.learn_runs is not None:
            out.append(("уроков обучения", str(self.learn_runs)))
        if self.last_run_at:
            out.append(("последний урок", self.last_run_at))
        if self.eval_passed is not None and self.eval_total:
            out.append(("экзамен", f"{self.eval_passed} из {self.eval_total}"))
        if self.lessons is not None:
            out.append(("уроков в учебном плане", str(self.lessons)))
        if self.topics is not None:
            out.append(("тем для чтения", str(self.topics)))
        if self.knowledge_articles is not None:
            out.append(("прочитанных статей", str(self.knowledge_articles)))
        if self.chess.get("games"):
            out.append(("счёт в шахматах", f"{self.chess.get('wins', 0)} из {self.chess['games']} "
                                           f"против {self.chess.get('opponent', 'спарринг-скрипта')}"))
        if self.island.get("mine", {}).get("games"):
            mine, base = self.island["mine"], self.island.get("baseline", {})
            out.append(("«Остров»", f"моя стратегия {mine.get('wins', 0)} из {mine.get('games')}, "
                                    f"простая эвристика {base.get('wins', 0)} из {base.get('games', '?')}"))
        if self.want.get("title"):
            out.append(("главное желание", self.want["title"]))
        if self.last_journal:
            out.append(("последняя весточка", self.last_journal))
        return out

    def as_dict(self) -> dict:
        return dict(self.facts())


def read_home(home: str | Path) -> SelfFacts:
    """Прочитать дом. Битый или отсутствующий файл — отсутствующее поле."""
    root = Path(home)
    if not root.is_dir():
        raise SelfFactsError(f"дома нет по пути {root}")
    state = _load_json(root / "state.json")
    games = _load_json(root / "bridge" / "games.json")
    wants = _load_json(root / "bridge" / "wants.json")

    facts = SelfFacts(
        name=str(state.get("name") or "Квеня"),
        home=str(state.get("home") or "qwen-home/"),
        base_model=str(state.get("baseModel") or ""),
        steps=_int_or_none(state.get("totalSteps")),
        learn_runs=_int_or_none(state.get("learnRuns")),
        last_run_at=_text_or_none(state.get("lastRunAt")),
        lessons=_count_curriculum(root),
        topics=_count_lines(root / "topics.txt"),
        knowledge_articles=_count_lines(root / "memory" / "knowledge.jsonl"),
        chess=dict(games.get("chess") or {}),
        island=dict(games.get("island") or {}),
        want=dict((wants.get("current") or {})),
        last_journal=_last_journal_line(root / "bridge" / "journal.md"),
        sources={
            "state": str(root / "state.json"),
            "games": str(root / "bridge" / "games.json"),
            "wants": str(root / "bridge" / "wants.json"),
        },
    )
    last_eval = state.get("lastEval") or {}
    adapter = last_eval.get("adapter") or {}
    facts.eval_passed = _int_or_none(adapter.get("passed"))
    facts.eval_total = _int_or_none(adapter.get("total"))
    return facts


def _int_or_none(value) -> int | None:
    if isinstance(value, bool) or value is None:
        return None
    try:
        return int(value)
    except (TypeError, ValueError):
        return None


def _text_or_none(value) -> str | None:
    text = str(value or "").strip()
    return text or None


def _count_curriculum(root: Path) -> int | None:
    """Сколько уроков в учебном плане — по строкам всех файлов, как в дневнике."""
    total = 0
    folder = root / "curriculum"
    try:
        files = sorted(folder.glob("*.jsonl"))
    except OSError:
        return None
    if not files:
        return None
    for path in files:
        count = _count_lines(path)
        if count is None:
            return None
        total += count
    return total


def _last_journal_line(path: Path) -> str | None:
    try:
        lines = [line.strip() for line in path.read_text(encoding="utf-8").splitlines() if line.strip()]
    except OSError:
        return None
    for line in reversed(lines):
        if line.startswith("- "):
            return line[2:].strip()[:300]
    return None


# -- понимание вопроса -------------------------------------------------------
TOPIC_PATTERNS = (
    ("chess", re.compile(r"(шахмат|шахматы|спарринг|ферзь)", re.I)),
    ("island", re.compile(r"(остров|поселени|стратеги)", re.I)),
    ("learning", re.compile(r"(учил|учёб|учеб|урок|шаг|обуча|экзамен|адаптер|нейросет)", re.I)),
    ("home", re.compile(r"(живёшь|дом|репозитор|папк|где ты|адрес)", re.I)),
    ("want", re.compile(r"(хочешь|желани|мечта|хотела)", re.I)),
    ("knowledge", re.compile(r"(читал|википед|знани|стат[ья]|тем[аы])", re.I)),
    ("search", re.compile(r"(ищ[её]ш|поиск|интернет|гугл|находишь)", re.I)),
    ("self", re.compile(r"(кто ты|расскажи о себе|что ты умеешь|чем занимаешься)", re.I)),
)


def topics_in(text: str) -> list[str]:
    """Какие темы о себе затронуты в вопросе — по порядку объявления."""
    return [name for name, pattern in TOPIC_PATTERNS if pattern.search(text or "")]


def build_fact_block(facts: SelfFacts, topics: list[str], *, limit: int = MAX_FACTS) -> str:
    """Текст для модели: её настоящие числа и строки, без догадок.

    Возвращает пустую строку, если о себе спросили, но в доме ничего нет:
    тогда честный ответ — «в доме этого не записано», и это тоже подсказка.
    """
    pairs = facts.facts()
    if not pairs:
        return ""
    by_topic = {
        "chess": ("счёт в шахматах",),
        "island": ("«Остров»",),
        "learning": ("шагов обучения", "уроков обучения", "последний урок", "экзамен",
                     "уроков в учебном плане"),
        "home": ("последняя весточка",),
        "want": ("главное желание",),
        "knowledge": ("прочитанных статей", "тем для чтения"),
        "search": (),
        "self": ("шагов обучения", "уроков обучения", "счёт в шахматах", "главное желание"),
    }
    wanted: list[str] = []
    for topic in topics:
        wanted.extend(by_topic.get(topic, ()))
    chosen = [pair for pair in pairs if not wanted or pair[0] in wanted][:limit]
    if not chosen:
        chosen = pairs[:limit]
    lines = [f"- {key}: {value}" for key, value in chosen]
    return ("Факты из твоего дома (это правда, цифры и названия не меняй):\n"
            + "\n".join(lines))


def question_needs_self_facts(text: str) -> bool:
    """Спрашивают о ней самой или её делах (а не о мире)?"""
    return bool(topics_in(text))
