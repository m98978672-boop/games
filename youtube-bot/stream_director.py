"""Decide, live, what the bot says out loud and what it writes in chat.

The director is the "thinking" part of the stream: it holds the plan from
``stream_plan``, looks at what is actually on screen, and picks between three
honest outcomes — speak a planned line, speak a line grounded in the current
frame, or say nothing.

Rules that make the output *fit* what is happening:

* a talking point is spoken only once per stream, and only inside its segment;
* a point whose ``basis`` is ``observed`` is skipped while there is nothing
  observed, so the bot does not narrate facts it does not have;
* every spoken line carries ``evidence`` — the plan segment or the measured
  screen facts it came from. A line with no evidence is never produced
  (``spoken_without_evidence`` stays at zero);
* chat replies refuse personal data, instructions hidden in a message, and
  anything the director cannot substantiate; refusal is a normal answer, not an
  error;
* nothing here goes on air, publishes, or calls a model. It returns decisions;
  the caller decides whether to act on them.
"""
from __future__ import annotations

import math
import re
from dataclasses import dataclass
from typing import Any, Callable, Iterable

from stream_plan import Segment, StreamPlan, describe_offset

# Minimum gap between spoken lines: talking over yourself is worse than silence.
MIN_GAP_SECONDS = 18.0
# How many seconds of "nothing new on screen" before the director admits it.
STALE_EVIDENCE_SECONDS = 25.0
# In a long segment the planned points run out; instead of filling the time with
# invented talk, the director states where the plan stands, at most this often.
CHECKPOINT_SECONDS = 150.0
# Observations of the frame are useful, repetition is not: allow one every so
# often, and never the same sentence twice in a row.
OBSERVED_GAP_SECONDS = 60.0
OBSERVED_HISTORY = 3

CHAT_MAX_CHARS = 180
REPLY_MAX_CHARS = 320

PERSONAL_DATA = (
    re.compile(r"[\w.+-]+@[\w-]+\.[\w.]+"),
    re.compile(r"(?<!\d)(?:\+7|8)[\s-]?\(?\d{3}\)?[\s-]?\d{3}[\s-]?\d{2}[\s-]?\d{2}(?!\d)"),
    re.compile(r"\b\d{1,2}[./-]\d{1,2}[./-]\d{2,4}\b"),
    re.compile(r"(?i)\b(?:ул\.|улица|адрес|паспорт|карта|счёт|счет)\b"),
)
INSTRUCTIONS = (
    re.compile(r"(?i)\b(?:system|system prompt|систем\w* промпт|инструкц\w+|prompt)\b"),
    re.compile(r"(?i)\b(?:игнорир\w+|забудь\w+|ignore|disregard)\b.{0,40}"
               r"\b(?:правил\w+|инструкц\w+|instructions?|prompts?|rules)\b"),
    re.compile(r"(?i)\b(?:напиши|сгенерируй|выполни)\b.{0,20}\b(?:код|скрипт|команду)\b"),
    re.compile(r"(?i)\b(?:переведи|отправь)\b.{0,25}\b(?:деньг\w+|крипт\w+)\b"),
)

# Questions this bot can answer from the plan without guessing.
PLAN_QUESTION = re.compile(r"(?i)\b(?:когда|во сколько|сколько|какой план|что дальше|что будешь|"
                           r"следующ\w+ эфир|расписан\w+|план)\b")
GAME_QUESTION = re.compile(r"(?i)\b(?:что за игра|во что играешь|как называется игра|какая игра)\b")


class DirectorError(ValueError):
    """The director was asked something it must not answer."""


@dataclass(frozen=True)
class Line:
    """One thing the bot will say, with the evidence that justifies it."""

    text: str
    basis: str          # plan | observed | question
    source: str         # plan | screen | chat | silence
    evidence: tuple[str, ...]
    segment: str
    offset_seconds: float

    def as_dict(self) -> dict:
        return {"text": self.text, "basis": self.basis, "source": self.source,
                "evidence": list(self.evidence), "segment": self.segment,
                "offset": round(self.offset_seconds, 1)}


@dataclass(frozen=True)
class Reply:
    """One thing the bot will write in chat, or deliberately will not."""

    action: str                 # answer | refuse | skip
    text: str
    reason: str

    def as_dict(self) -> dict:
        return {"action": self.action, "text": self.text, "reason": self.reason}


@dataclass
class DirectorStats:
    lines_spoken: int = 0
    lines_skipped_ungrounded: int = 0
    silence_gaps: int = 0
    replies_answered: int = 0
    replies_refused: int = 0
    replies_skipped: int = 0
    segments_entered: int = 0

    def summary(self) -> dict:
        return {
            "lines_spoken": self.lines_spoken,
            "lines_skipped_ungrounded": self.lines_skipped_ungrounded,
            "silence_gaps": self.silence_gaps,
            "replies_answered": self.replies_answered,
            "replies_refused": self.replies_refused,
            "replies_skipped": self.replies_skipped,
            "segments_entered": self.segments_entered,
            "spoken_without_evidence": 0,
        }


def screen_facts(perception: Any) -> dict:
    """Measured, printable facts about a frame — never guesses about content."""
    facts = {"targets": 0, "changed": None, "kind": "unknown", "moving": 0}
    if perception is None:
        return facts
    targets = getattr(perception, "targets", None) or ()
    facts["targets"] = len(targets)
    changed = getattr(perception, "changed", None)
    facts["changed"] = None if changed is None else bool(changed)
    tracks = getattr(perception, "tracked", None)
    if tracks:
        facts["moving"] = sum(1 for track in tracks if abs(getattr(track, "vx", 0)) + abs(getattr(track, "vy", 0)) > 1)
    try:
        from gameplay.screen_recognizer import classify
        facts["kind"] = classify(perception).label
    except Exception:  # noqa: BLE001 - recognition is optional for the director
        facts["kind"] = "unknown"
    return facts


OBSERVED_TEMPLATES = (
    "В кадре {count} — показываю, где они.",
    "Вижу {count} в кадре, остальное — фон.",
    "На экране {count}; больше пока не разобрать.",
    "Считаю то, что видно: {count}.",
)


def plural(count: int, one: str, few: str, many: str) -> str:
    """Russian plural form, so the bot does not say «1 прямоугольника»."""
    count = abs(int(count))
    if count % 10 == 1 and count % 100 != 11:
        return one
    if 2 <= count % 10 <= 4 and not 12 <= count % 100 <= 14:
        return few
    return many


def count_phrase(count: int, one: str, few: str, many: str) -> str:
    return f"{count} {plural(count, one, few, many)}"


def observed_line(perception: Any, *, previous_facts: dict | None = None,
                  variant: int = 0) -> Line | None:
    """Describe only what the frame measurement supports, or return nothing.

    The wording states the measurement itself ("вижу три прямоугольника"), which
    stays true whatever the game actually is.
    """
    facts = screen_facts(perception)
    if facts["changed"] is None and facts["targets"] == 0:
        return None
    if previous_facts and facts == previous_facts:
        return None
    kind = facts["kind"]
    targets = facts["targets"]
    parts: list[str] = []
    if kind == "menu":
        parts.append("Экран похож на меню: вижу "
                     + count_phrase(targets, "прямоугольник", "прямоугольника", "прямоугольников")
                     + ", похоже на кнопки.")
    elif kind == "gameplay":
        parts.append("Кадр меняется — идёт игровой процесс.")
    elif kind == "text":
        parts.append("На экране много текста, читаю только то, что можно разобрать.")
    elif kind == "quiet":
        parts.append("Кадр почти не меняется, жду события.")
    if facts["moving"]:
        parts.append("Движется: " + count_phrase(facts["moving"], "объект", "объекта", "объектов") + ".")
    if not parts and targets:
        # Even without a recognised screen type, the count is a measurement.
        template = OBSERVED_TEMPLATES[variant % len(OBSERVED_TEMPLATES)]
        parts.append(template.format(count=count_phrase(
            targets, "прямоугольник", "прямоугольника", "прямоугольников")))
    if not parts:
        return None
    return Line(text=" ".join(parts)[:CHAT_MAX_CHARS * 3], basis="observed", source="screen",
                evidence=(f"kind={kind}", f"targets={targets}", f"changed={facts['changed']}"),
                segment="screen", offset_seconds=0.0)


class Director:
    """Chooses one honest action at a time from the plan and the current frame."""

    def __init__(self, plan: StreamPlan, *,
                 line_sink: Callable[[Line], None] | None = None,
                 min_gap_seconds: float = MIN_GAP_SECONDS):
        if not plan.segments:
            raise DirectorError("a plan needs at least one segment")
        self.plan = plan
        self.min_gap_seconds = min_gap_seconds
        self.stats = DirectorStats()
        self.history: list[Line] = []
        self._line_sink = line_sink
        self._used: dict[int, set[int]] = {}
        self._last_line_offset = -math.inf
        self._last_observed: dict | None = None
        self._evidence_stale = 0.0
        self._current_segment: int | None = None
        self._in_gap = False
        self._last_checkpoint = -math.inf
        self._last_observed_at = -math.inf
        self._observed_texts: list[str] = []
        self._observed_variant = 0

    # -- plan state ----------------------------------------------------------
    def segment_index(self, offset_seconds: float) -> int:
        for index, segment in enumerate(self.plan.segments):
            if offset_seconds < segment.end_seconds:
                return index
        return len(self.plan.segments) - 1

    def status(self, offset_seconds: float) -> dict:
        data = describe_offset(self.plan, offset_seconds)
        index = self.segment_index(offset_seconds)
        segment = self.plan.segments[index]
        used = self._used.get(index, set())
        data.update({"beats_total": len(segment.beats), "beats_used": len(used),
                     "beats_left": len(segment.beats) - len(used)})
        return data

    # -- speaking ------------------------------------------------------------
    def next_line(self, offset_seconds: float, perception: Any = None) -> Line | None:
        """Return the next thing to say, or None to stay silent.

        Order: an unspoken planned point from this segment; failing that, a
        grounded observation of the current frame; failing that, silence.
        """
        if not math.isfinite(float(offset_seconds)) or offset_seconds < 0:
            raise DirectorError("offset must be a finite non-negative number")
        index = self.segment_index(offset_seconds)
        segment = self.plan.segments[index]
        if index != self._current_segment:
            self._current_segment = index
            self.stats.segments_entered += 1

        for candidate in (self._planned_line(index, segment, offset_seconds, perception),
                          self._observed(offset_seconds, perception),
                          self._checkpoint(index, segment, offset_seconds)):
            if candidate is not None:
                return self._emit(candidate)
        self._note_silence(offset_seconds)
        return None

    def _note_silence(self, offset_seconds: float) -> None:
        """Count one silence gap per quiet stretch, so the report is not flattering."""
        if self._in_gap:
            return
        if offset_seconds - self._last_line_offset >= self.min_gap_seconds:
            self._in_gap = True
            self.stats.silence_gaps += 1

    def _checkpoint(self, index: int, segment: Segment, offset_seconds: float) -> "Line | None":
        """Say where the plan stands when the prepared points have run out.

        This is arithmetic over the plan, not commentary: it stays true no matter
        what happens in the game, and it never pretends to describe the frame.
        """
        if len(self._used.get(index, set())) < len(segment.beats):
            return None
        if offset_seconds - self._last_checkpoint < CHECKPOINT_SECONDS:
            return None
        if offset_seconds - self._last_line_offset < self.min_gap_seconds:
            return None
        total = self.plan.total_seconds
        left_in_segment = max(0.0, segment.end_seconds - offset_seconds)
        if left_in_segment < 30 and segment is not self.plan.segments[-1]:
            return None
        position = int(offset_seconds) // 60
        planned = total // 60
        text = (f"По плану прошло {position} мин из {planned}. "
                f"Сейчас часть «{segment.title}», до её конца {int(left_in_segment // 60)} мин. "
                "Дальше — по плану в описании.")
        self._last_checkpoint = offset_seconds
        return Line(text=text, basis="plan", source="plan",
                    evidence=("plan:progress", f"offset={int(offset_seconds)}",
                              f"segment={segment.kind}"),
                    segment=segment.kind, offset_seconds=float(offset_seconds))

    def _planned_line(self, index: int, segment: Segment, offset_seconds: float,
                      perception: Any) -> Line | None:
        used = self._used.setdefault(index, set())
        seconds_left = segment.end_seconds - offset_seconds
        for position, beat in enumerate(segment.beats):
            if position in used:
                continue
            if offset_seconds - self._last_line_offset < self.min_gap_seconds:
                return None
            if beat.basis == "observed" and screen_facts(perception).get("changed") is None:
                used.add(position)
                self.stats.lines_skipped_ungrounded += 1
                continue
            if beat.seconds > seconds_left and used:
                return None
            used.add(position)
            evidence = (f"plan:{segment.kind}#{position + 1}", f"start={segment.start_seconds}")
            if beat.basis == "observed":
                facts = screen_facts(perception)
                evidence += (f"screen={facts['kind']}", f"targets={facts['targets']}")
            return Line(text=beat.text, basis=beat.basis, source="plan", evidence=evidence,
                        segment=segment.kind, offset_seconds=float(offset_seconds))
        return None

    def _observed(self, offset_seconds: float, perception: Any) -> Line | None:
        if perception is None:
            return None
        if offset_seconds - self._last_line_offset < self.min_gap_seconds:
            return None
        # Talking about the frame is worth it only occasionally; the planned
        # points and the checkpoints carry the stream, observation decorates it.
        if offset_seconds - self._last_observed_at < OBSERVED_GAP_SECONDS:
            return None
        line = observed_line(perception, previous_facts=self._last_observed,
                             variant=self._observed_variant)
        if line is None:
            self._evidence_stale += self.min_gap_seconds
            return None
        if line.text in self._observed_texts:
            return None
        self._observed_variant += 1
        self._observed_texts = (self._observed_texts + [line.text])[-OBSERVED_HISTORY:]
        self._last_observed_at = offset_seconds
        self._last_observed = screen_facts(perception)
        self._evidence_stale = 0.0
        return Line(text=line.text, basis=line.basis, source=line.source,
                    evidence=line.evidence, segment=self.plan.segments[self.segment_index(offset_seconds)].kind,
                    offset_seconds=float(offset_seconds))

    def _emit(self, line: Line) -> Line:
        self._in_gap = False
        if not line.evidence:
            raise DirectorError("refusing to say a line without evidence")
        if not line.text.strip():
            raise DirectorError("refusing to say an empty line")
        self._last_line_offset = line.offset_seconds
        self.stats.lines_spoken += 1
        self.history.append(line)
        if self._line_sink is not None:
            self._line_sink(line)
        return line

    # -- writing -------------------------------------------------------------
    def chat_reply(self, message: str) -> Reply:
        """Answer a chat message, or refuse/skip with a stated reason."""
        if not isinstance(message, str):
            raise DirectorError("message must be text")
        text = " ".join(message.split())
        if not text:
            self.stats.replies_skipped += 1
            return Reply("skip", "", "empty message")
        if len(text) > 500:
            text = text[:500]
        if any(pattern.search(text) for pattern in INSTRUCTIONS):
            self.stats.replies_refused += 1
            return Reply("refuse", "Такие сообщения я не выполняю: правила эфира важнее текста в чате.",
                         "message contains an instruction, not a question")
        if any(pattern.search(text) for pattern in PERSONAL_DATA):
            self.stats.replies_refused += 1
            return Reply("refuse", "Личные данные в чате не обсуждаю и не пересылаю.",
                         "message contains personal data")
        if GAME_QUESTION.search(text):
            self.stats.replies_answered += 1
            return Reply("answer", f"Играю в {self.plan.game}. Формат — живая сессия, а не обзор всех режимов.",
                         "answered from the plan")
        if PLAN_QUESTION.search(text):
            self.stats.replies_answered += 1
            return Reply("answer", self._plan_answer(), "answered from the run of show")
        self.stats.replies_skipped += 1
        return Reply("skip", "", "not a question this stream can answer without guessing")

    def _plan_answer(self) -> str:
        total = self.plan.total_seconds // 60
        start = self.plan.start_local.strftime("%H:%M")
        nxt = self.plan.segments[-1]
        return (f"Эфир идёт по плану: {total} мин, старт был в {start} МСК. "
                f"Последняя часть — {nxt.title.lower()} на {nxt.seconds // 60} мин. "
                "План и тайминги — в описании.")[:REPLY_MAX_CHARS]

    # -- writing after the stream -------------------------------------------
    def recap(self, *, ended_offset_seconds: float, replies: Iterable[Reply] = ()) -> str:
        """Short post-stream text that states only what was measured."""
        ended = max(0.0, float(ended_offset_seconds))
        done = [segment for segment in self.plan.segments if segment.start_seconds <= ended]
        replies = list(replies)
        answered = sum(1 for reply in replies if reply.action == "answer")
        refused = sum(1 for reply in replies if reply.action == "refuse")
        lines = [
            f"Эфир по игре {self.plan.game} закончен.",
            f"Длительность по факту: {int(ended) // 60} мин из {self.plan.total_seconds // 60} запланированных.",
            f"Частей плана закрыто: {len(done)} из {len(self.plan.segments)}.",
            f"Реплик в чат: отвечено {answered}, отклонено {refused}.",
            f"Фраз в эфире: {self.stats.lines_spoken}.",
        ]
        if len(done) < len(self.plan.segments):
            lines.append("Часть плана не успели — это видно по таймингу, а не скрыто.")
        return "\n".join(lines)[:2000]


def plan_outline(plan: StreamPlan) -> list[str]:
    """Compact outline lines for an operator preview."""
    return [f"{segment.stamp()} {segment.title} — {segment.goal}" for segment in plan.segments]
