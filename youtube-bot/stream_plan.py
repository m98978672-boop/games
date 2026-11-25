"""Plan a live stream *before* it starts: run of show, chapters, checks, contingencies.

This module produces a reviewable plan, not a broadcast. It never goes on air and
never publishes anything. Every field is either supplied by the operator from a
trusted source or derived by arithmetic over the requested duration, so the plan
can be checked line by line before the stream begins.

Deliberate limits, kept visible:

* the total of all segments equals the requested length exactly — a plan that
  would need padding is rejected instead of filled with filler;
* every segment carries talking points marked with their ``basis``, so the speech
  layer can refuse to claim a fact that was never established;
* pre-flight ``checks`` start unverified and can only be confirmed by a human;
* links are accepted only from an allowlist of source hosts, and banned promises
  ("подпишись", "розыгрыш", "100%") are rejected, because they are claims about
  the future that this program cannot keep.
"""
from __future__ import annotations

import json
import math
import re
import uuid
from dataclasses import dataclass
from datetime import datetime, timedelta, timezone
from pathlib import Path
from urllib.parse import urlsplit
from zoneinfo import ZoneInfo

CHANNEL_TZ = ZoneInfo("Europe/Moscow")
MIN_LEAD = timedelta(minutes=45)
MIN_TOTAL_SECONDS = 5 * 60
MAX_TOTAL_SECONDS = 8 * 3600
MIN_SEGMENT_SECONDS = 30
MAX_SEGMENTS = 12
MAX_TEXT = 300

SEGMENT_KINDS = ("intro", "gameplay", "probe", "review", "chat", "wrap")

# Share of the stream each segment kind asks for when the operator does not pass
# an explicit list. ``gameplay`` dominates because this channel plays games.
DEFAULT_WEIGHTS = {
    "intro": 0.05,
    "gameplay": 0.52,
    "probe": 0.18,
    "review": 0.12,
    "chat": 0.06,
    "wrap": 0.07,
}

CHECKLIST = (
    ("rights", "Права на игру и запись подтверждены владельцем канала"),
    ("capture", "Захват экрана проверен на пустом прогоне"),
    ("audio", "Микрофон и уровень звука проверены"),
    ("music", "Музыки и чужих клипов в эфире нет"),
    ("captions", "Субтитры включаются и совпадают с речью"),
    ("plan", "Run of show прочитан, тайминги согласованы"),
    ("backup", "Запасной план на обрыв связи есть"),
)

# Promises about the future and engagement bait. They are rejected because a plan
# cannot guarantee them, and because the channel must not trade trust for clicks.
BANNED_PHRASES = (
    "подпишись", "подписывайтесь", "розыгрыш", "гарантирую", "100%", "бесплатно",
    "скидка", "промокод", "ставь лайк", "жми на колокол", "залетай",
)

# Only these hosts may appear in the plan's source links.
SOURCE_HOSTS = {"github.com", "store.steampowered.com", "www.youtube.com"}

BASIS_VALUES = ("plan", "observed", "question")


class PlanError(ValueError):
    """The plan cannot be built honestly from the given input."""


@dataclass(frozen=True)
class Beat:
    """One talking point: what to say, and on what basis it may be said."""

    text: str
    basis: str = "plan"
    seconds: float = 12.0

    def __post_init__(self):
        if self.basis not in BASIS_VALUES:
            raise PlanError("beat basis must be plan, observed or question")
        if not isinstance(self.text, str) or not self.text.strip():
            raise PlanError("beat text cannot be empty")
        if len(self.text) > MAX_TEXT:
            raise PlanError("beat text is too long")
        if (isinstance(self.seconds, bool) or not isinstance(self.seconds, (int, float))
                or not math.isfinite(self.seconds) or not 1 <= self.seconds <= 120):
            raise PlanError("beat seconds must be between 1 and 120")

    def as_dict(self) -> dict:
        return {"text": self.text, "basis": self.basis, "seconds": round(float(self.seconds), 1)}


@dataclass(frozen=True)
class Segment:
    kind: str
    start_seconds: int
    seconds: int
    title: str
    goal: str
    beats: tuple[Beat, ...]
    when_stuck: str

    def as_dict(self) -> dict:
        return {"kind": self.kind, "start": self.start_seconds, "seconds": self.seconds,
                "title": self.title, "goal": self.goal, "when_stuck": self.when_stuck,
                "beats": [beat.as_dict() for beat in self.beats]}

    @property
    def end_seconds(self) -> int:
        return self.start_seconds + self.seconds

    def stamp(self) -> str:
        return _stamp(self.start_seconds)


@dataclass(frozen=True)
class StreamPlan:
    stream_id: str
    title: str
    description: str
    start_utc: datetime
    start_local: datetime
    total_seconds: int
    segments: tuple[Segment, ...]
    checks: tuple[dict, ...]
    contingencies: tuple[str, ...]
    sources: tuple[str, ...]
    game: str
    author: str

    # -- views ---------------------------------------------------------------
    @property
    def chapters(self) -> list[tuple[str, str]]:
        """YouTube chapter marks: (timestamp, title), always starting at 00:00."""
        return [(segment.stamp(), segment.title) for segment in self.segments]

    @property
    def end_utc(self) -> datetime:
        return self.start_utc + timedelta(seconds=self.total_seconds)

    def segment_at(self, offset_seconds: float) -> Segment:
        """Which part of the run of show is on air at a given offset."""
        offset = max(0.0, float(offset_seconds))
        for segment in self.segments:
            if offset < segment.end_seconds:
                return segment
        return self.segments[-1]

    def as_dict(self) -> dict:
        return {
            "schema": 1,
            "stream_id": self.stream_id,
            "game": self.game,
            "author": self.author,
            "title": self.title,
            "description": self.description,
            "start_utc": self.start_utc.isoformat(),
            "start_local": self.start_local.isoformat(),
            "end_utc": self.end_utc.isoformat(),
            "total_seconds": self.total_seconds,
            "chapters": [{"at": stamp, "title": title} for stamp, title in self.chapters],
            "segments": [segment.as_dict() for segment in self.segments],
            "checks": [dict(check) for check in self.checks],
            "contingencies": list(self.contingencies),
            "sources": list(self.sources),
            "pinned_message": pinned_message(self),
            "on_air_description": on_air_description(self),
        }

    def save(self, path: str | Path) -> Path:
        """Write the plan as JSON next to a temporary file, then replace it."""
        target = Path(path)
        target.parent.mkdir(parents=True, exist_ok=True)
        temp = target.with_suffix(target.suffix + ".tmp")
        temp.write_text(json.dumps(self.as_dict(), ensure_ascii=False, indent=2), encoding="utf-8")
        temp.replace(target)
        return target

    def markdown(self) -> str:
        return render_markdown(self)


# --------------------------------------------------------------------------- #
# validation helpers
# --------------------------------------------------------------------------- #
def _stamp(seconds: int) -> str:
    seconds = max(0, int(seconds))
    hours, rest = divmod(seconds, 3600)
    minutes, sec = divmod(rest, 60)
    return f"{hours:02d}:{minutes:02d}:{sec:02d}" if hours else f"{minutes:02d}:{sec:02d}"


def _clean(text: str, *, limit: int = MAX_TEXT, what: str = "text") -> str:
    if not isinstance(text, str):
        raise PlanError(f"{what} must be text")
    value = " ".join(text.split())
    if any(ord(char) < 32 or ord(char) == 127 for char in value):
        raise PlanError(f"{what} contains control characters")
    if not value:
        raise PlanError(f"{what} cannot be empty")
    if len(value) > limit:
        raise PlanError(f"{what} is longer than {limit} characters")
    if re.search(r"https?://|www\.|@[\w.-]+", value, flags=re.IGNORECASE):
        raise PlanError(f"{what} cannot contain links or contact details")
    lowered = value.lower()
    for phrase in BANNED_PHRASES:
        if phrase in lowered:
            raise PlanError(f"{what} contains a promise the stream cannot keep: {phrase!r}")
    return value


def source_url(url: str) -> str:
    """Accept only an exact https URL on an allowlisted host."""
    if not isinstance(url, str):
        raise PlanError("source URL must be text")
    parts = urlsplit(url)
    if (parts.scheme != "https" or parts.hostname not in SOURCE_HOSTS
            or parts.query or parts.fragment or parts.username or parts.password):
        raise PlanError("use an exact https link on an allowed source host")
    if url != f"https://{parts.hostname}{parts.path}":
        raise PlanError("source link must be a plain https URL without extra parts")
    return url


def _timezone(value: datetime) -> datetime:
    if not isinstance(value, datetime) or value.tzinfo is None or value.utcoffset() is None:
        raise PlanError("start time must include a timezone")
    return value.astimezone(timezone.utc)


# --------------------------------------------------------------------------- #
# building a plan
# --------------------------------------------------------------------------- #
def allocate(minutes: float, kinds: tuple[str, ...] | None = None) -> list[tuple[str, int]]:
    """Split the requested length into whole seconds, spending every second once.

    Two honesty rules decide the shape:

    * the sum of the shares equals the requested length exactly, so no segment is
      stretched to fill a gap (largest-remainder rounding);
    * a share below :data:`MIN_SEGMENT_SECONDS` is not padded — that kind is
      dropped and its seconds go to the largest remaining segment, because a
      20-second "review" would be a label, not a review.
    """
    if isinstance(minutes, bool) or not isinstance(minutes, (int, float)) or not math.isfinite(minutes):
        raise PlanError("duration must be a finite number of minutes")
    total = int(round(float(minutes) * 60))
    if not MIN_TOTAL_SECONDS <= total <= MAX_TOTAL_SECONDS:
        raise PlanError(f"stream must last {MIN_TOTAL_SECONDS // 60} minutes to "
                        f"{MAX_TOTAL_SECONDS // 3600} hours")
    chosen = tuple(dict.fromkeys(kinds or tuple(DEFAULT_WEIGHTS)))
    if not chosen or len(chosen) > MAX_SEGMENTS:
        raise PlanError(f"a plan needs 1-{MAX_SEGMENTS} segments, each kind once")
    if any(kind not in SEGMENT_KINDS for kind in chosen):
        raise PlanError("unknown segment kind")

    weight_sum = sum(DEFAULT_WEIGHTS[kind] for kind in chosen)

    def shares_for(pool: tuple[str, ...]) -> dict[str, float]:
        pool_sum = sum(DEFAULT_WEIGHTS[kind] for kind in pool)
        return {kind: total * DEFAULT_WEIGHTS[kind] / pool_sum for kind in pool}

    pool = chosen
    quotas = shares_for(pool)
    while len(pool) > 1:
        smallest = min(pool, key=lambda kind: quotas[kind])
        if quotas[smallest] >= MIN_SEGMENT_SECONDS:
            break
        pool = tuple(kind for kind in pool if kind != smallest)
        quotas = shares_for(pool)
    if quotas[min(pool, key=lambda kind: quotas[kind])] < MIN_SEGMENT_SECONDS and len(pool) == 1:
        raise PlanError("the stream is too short for even one segment")

    ordered = [(kind, quotas[kind]) for kind in pool]
    shares = [(kind, int(math.floor(value))) for kind, value in ordered]
    remainder = total - sum(value for _, value in shares)
    order = sorted(range(len(ordered)), key=lambda i: (-(ordered[i][1] - shares[i][1]), i))
    for index in order[:remainder]:
        kind, value = shares[index]
        shares[index] = (kind, value + 1)
    return shares


def _default_beats(kind: str, game: str) -> tuple[Beat, ...]:
    """Talking points per segment kind, phrased so they stay true by construction."""
    if kind == "intro":
        return (
            Beat(f"Сегодня играем в {game}. Сначала покажу, что видно на экране, без оценок.", "plan", 11),
            Beat("План на эфир: короткое знакомство, игровая часть, разбор и итог.", "plan", 9),
            Beat("Если что-то пойдёт не по плану, скажу об этом прямо, а не сделаю вид, что так и задумано.",
                 "plan", 10),
        )
    if kind == "gameplay":
        return (
            Beat("Показываю первые минуты игры и комментирую только то, что видно на экране.", "plan", 10),
            Beat("Что происходит в кадре: разбираю по шагам, без догадок о том, чего не видно.", "observed", 11),
            Beat("Проверяю управление по одному действию и называю результат каждого.", "plan", 10),
            Beat("Что из увиденного стоит проверить дальше?", "question", 7),
            Beat("Если действие не сработало так, как я ожидал, скажу об этом сразу.", "plan", 9),
        )
    if kind == "probe":
        return (
            Beat("Проверяю по одному изменению за раз, чтобы было понятно, что именно дало результат.",
                 "plan", 11),
            Beat("Если действие ничего не изменило, так и скажу: без догадок.", "plan", 9),
        )
    if kind == "review":
        return (
            Beat("Разбираю только то, что было в эфире: что получилось, что нет.", "plan", 10),
            Beat("Оценку даю как впечатление от сессии, а не как тест или обзор по всем режимам.", "plan", 12),
        )
    if kind == "chat":
        return (
            Beat("Читаю вопросы и отвечаю коротко; на то, чего не знаю, отвечаю, что не знаю.", "plan", 11),
        )
    return (
        Beat("Итог эфира: что успели, что не успели и почему.", "plan", 10),
        Beat("Следующий эфир запланирую заранее и покажу план.", "plan", 8),
    )


def _default_goal(kind: str, game: str) -> str:
    return {
        "intro": "объяснить, во что играем, и назвать план эфира",
        "gameplay": f"показать {game} в деле и не потерять зрителя",
        "probe": "разобраться в управлении и механиках по одному шагу",
        "review": "честно подытожить увиденное в этой сессии",
        "chat": "ответить на вопросы, не выдумывая фактов",
        "wrap": "закрыть эфир без обещаний, которые нельзя выполнить",
    }[kind]


def _default_stuck(kind: str) -> str:
    return {
        "intro": "Если звук не пошёл, остановить эфир и проверить оборудование, а не говорить в тишину.",
        "gameplay": "Если застрял, назвать это вслух, показать экран и перейти к следующему шагу плана.",
        "probe": "Если три попытки ничего не изменили, честно сказать это и сменить подход.",
        "review": "Если аргументов мало, сказать, что впечатление неполное, и не додумывать.",
        "chat": "Если вопрос требует личных данных, не отвечать на него.",
        "wrap": "Если время вышло, закончить на середине фразы плана и не тянуть эфир.",
    }[kind]


def build_plan(
    *,
    game: str,
    author: str,
    start: datetime,
    minutes: float,
    sources: tuple[str, ...] = (),
    kinds: tuple[str, ...] | None = None,
    beats: dict[str, tuple[Beat, ...]] | None = None,
    on_air_title: str | None = None,
    stream_id: str | None = None,
) -> StreamPlan:
    """Build a run of show that adds up exactly and can be reviewed before going live."""
    game = _clean(game, limit=80, what="game name")
    author = _clean(author, limit=120, what="author")
    start_utc = _timezone(start)
    checked_sources = tuple(source_url(url) for url in sources)
    if len(set(checked_sources)) != len(checked_sources):
        raise PlanError("duplicate source links")

    allocation = allocate(minutes, kinds)
    total = sum(seconds for _, seconds in allocation)
    custom = beats or {}
    segments: list[Segment] = []
    offset = 0
    for index, (kind, seconds) in enumerate(allocation, 1):
        points = tuple(custom.get(kind) or _default_beats(kind, game))
        if not points:
            raise PlanError("every segment needs at least one talking point")
        for beat in points:
            if not isinstance(beat, Beat):
                raise PlanError("talking points must be Beat objects")
        if sum(beat.seconds for beat in points) > seconds:
            raise PlanError(f"talking points for {kind} do not fit in {seconds} seconds")
        title = _segment_title(kind, game)
        segments.append(Segment(
            kind=kind,
            start_seconds=offset,
            seconds=seconds,
            title=title,
            goal=_default_goal(kind, game),
            beats=points,
            when_stuck=_default_stuck(kind),
        ))
        offset += seconds
    assert offset == total

    title = _clean(on_air_title or f"Играем в {game}: живой эфир по плану", limit=100, what="stream title")
    identifier = stream_id or uuid.uuid4().hex[:12]
    if not re.fullmatch(r"[a-z0-9-]{6,32}", identifier):
        raise PlanError("stream_id must be 6-32 lowercase letters, digits or dashes")

    plan = StreamPlan(
        stream_id=identifier,
        title=title,
        description="",
        start_utc=start_utc,
        start_local=start_utc.astimezone(CHANNEL_TZ),
        total_seconds=total,
        segments=tuple(segments),
        checks=tuple({"id": key, "label": label, "verified": False} for key, label in CHECKLIST),
        contingencies=(
            "Отставание от плана: сокращать разбор, а не растягивать игру.",
            "Опережение плана: заканчивать раньше, а не добивать эфир пустыми минутами.",
            "Обрыв связи: вернуться и назвать время простоя, без притворства, что эфир шёл.",
            "Проблема с правами: остановить эфир и разобраться до следующего.",
        ),
        sources=checked_sources,
        game=game,
        author=author,
    )
    return plan


def _segment_title(kind: str, game: str) -> str:
    return {
        "intro": f"Вступление: знакомство с {game}",
        "gameplay": "Игровая часть",
        "probe": "Разбираемся в управлении и механике",
        "review": "Разбор сессии",
        "chat": "Вопросы и ответы",
        "wrap": "Итог эфира",
    }[kind]


def describe_offset(plan: StreamPlan, offset_seconds: float) -> dict:
    """Where we are in the plan vs where the plan says we should be."""
    segment = plan.segment_at(offset_seconds)
    elapsed_in_segment = max(0.0, float(offset_seconds) - segment.start_seconds)
    remaining = max(0.0, plan.total_seconds - float(offset_seconds))
    return {
        "segment": segment.kind,
        "segment_title": segment.title,
        "into_segment_seconds": round(elapsed_in_segment, 1),
        "segment_seconds": segment.seconds,
        "segment_share": round(min(1.0, elapsed_in_segment / segment.seconds), 3),
        "remaining_seconds": round(remaining, 1),
        "over_plan": float(offset_seconds) > plan.total_seconds,
    }


def on_air_description(plan: StreamPlan) -> str:
    """Description text built only from fields the plan actually verified."""
    lines = [
        f"Живой эфир: {plan.game}.",
        f"Автор / источник: {plan.author}.",
        "Формат: играю и комментирую то, что видно на экране. Это не обзор всех режимов "
        "и не тест игры.",
        "",
        "План эфира:",
    ]
    lines += [f"{stamp} {title}" for stamp, title in plan.chapters]
    if plan.sources:
        lines.append("")
        lines.append("Ссылки:")
        lines += [f"- {url}" for url in plan.sources]
    return "\n".join(lines)[:5000]


def pinned_message(plan: StreamPlan) -> str:
    """Pinned chat message: plan, rules, no promises."""
    return (
        f"Эфир: {plan.game}. План — в описании. "
        "Отвечаю на вопросы по игре; на то, чего не знаю, отвечаю прямо. "
        "Спойлеры по сюжету прошу не писать."
    )[:500]


def render_markdown(plan: StreamPlan) -> str:
    """Human-readable run of show for review before going live."""
    start = plan.start_local.strftime("%d.%m.%Y %H:%M")
    lines = [
        f"# План эфира: {plan.title}",
        "",
        f"- Начало: {start} МСК ({plan.start_utc.isoformat()})",
        f"- Длительность: {plan.total_seconds // 60} мин, конец в "
        f"{plan.end_utc.astimezone(CHANNEL_TZ).strftime('%H:%M')} МСК",
        f"- Игра: {plan.game} · автор/источник: {plan.author}",
        "",
        "## Тайминг",
    ]
    for segment in plan.segments:
        lines.append(f"### {segment.stamp()} · {segment.title} ({segment.seconds // 60} мин)")
        lines.append(f"Цель: {segment.goal}")
        lines.append("")
        for beat in segment.beats:
            lines.append(f"- [{beat.basis}] {beat.text} (~{beat.seconds:.0f} c)")
        lines.append(f"- Если застрял: {segment.when_stuck}")
        lines.append("")
    lines.append("## Предполётные проверки (не подтверждены, пока человек не проверит)")
    lines += [f"- [ ] {check['label']}" for check in plan.checks]
    lines.append("")
    lines.append("## Что делать при отклонении от плана")
    lines += [f"- {item}" for item in plan.contingencies]
    if plan.sources:
        lines.append("")
        lines.append("## Источники")
        lines += [f"- {url}" for url in plan.sources]
    return "\n".join(lines).rstrip() + "\n"


def issues(plan: StreamPlan) -> list[str]:
    """Self-check used before going live; an empty list means the plan is coherent."""
    problems: list[str] = []
    if not plan.segments:
        return ["plan has no segments"]
    if sum(segment.seconds for segment in plan.segments) != plan.total_seconds:
        problems.append("segments do not add up to the planned length")
    expected = 0
    for segment in plan.segments:
        if segment.start_seconds != expected:
            problems.append(f"segment {segment.title} does not start where the previous ended")
        expected = segment.end_seconds
        if segment.seconds < MIN_SEGMENT_SECONDS:
            problems.append(f"segment {segment.title} is too short to be honest content")
        if not segment.beats:
            problems.append(f"segment {segment.title} has no talking points")
        if sum(beat.seconds for beat in segment.beats) > segment.seconds:
            problems.append(f"talking points for {segment.title} exceed the segment")
    if expected != plan.total_seconds:
        problems.append("last segment does not end at the planned finish")
    if not 1 <= len(plan.segments) <= MAX_SEGMENTS:
        problems.append("impossible number of segments")
    if plan.total_seconds > MAX_TOTAL_SECONDS:
        problems.append("stream is longer than the maximum")
    for check in plan.checks:
        if check.get("verified"):
            problems.append("checks must be verified by a human, not by this module")
    return problems
