"""Verify an isolated 2048 recording and append a truthful spoken session recap.

No uploads. This deterministic recap is not an AI's personal review and never
presents an unfinished game as won or pads gameplay to a target duration.
"""
from __future__ import annotations

import argparse
import json
import re
import subprocess
import wave
from pathlib import Path
from typing import Any

from gameplay_2048 import COMMIT

OUTCOMES = {"won": "Партия выиграна.", "lost": "Партия завершилась поражением.",
            "no_legal_move": "Допустимых ходов больше не найдено.",
            "time_limit": "Лимит времени сессии истёк; партия не завершена."}


def validate_report(report: Any) -> dict[str, Any]:
    if not isinstance(report, dict) or report.get("game") != "2048" or report.get("commit") != COMMIT:
        raise ValueError("Unexpected game or source commit")
    if report.get("outcome") not in OUTCOMES or report.get("uploaded") is not False or report.get("audio") is not False:
        raise ValueError("Unexpected capture outcome")
    for key, max_value in (("moves", 5000), ("score", 10_000_000), ("max_tile", 2**30), ("elapsed_seconds", 3660)):
        if type(report.get(key)) is not int or not 0 <= report[key] <= max_value:
            raise ValueError(f"Invalid capture field: {key}")
    if report["moves"] < 1 or report["elapsed_seconds"] < 10:
        raise ValueError("Capture is too short or has no real moves")
    if not isinstance(report.get("video"), str) or not re.fullmatch(r"[a-f0-9]{32}\.webm", report["video"]):
        raise ValueError("Invalid capture video filename")
    return report


def narration(report: dict[str, Any]) -> str:
    return (f"Итог игровой сессии в две тысячи сорок восемь. {OUTCOMES[report['outcome']]} "
            f"Сделано ходов: {report['moves']}. Счёт: {report['score']}. "
            f"Самая большая достигнутая плитка: {report['max_tile']}. "
            "Игра управлялась программой с простой стратегией. Звук игры не записывался. "
            + ("Победа достигнута в этой сессии." if report["outcome"] == "won" else "Это результат сессии, а не завершённое прохождение."))


def commentary_events(root: Path, report: dict[str, Any], duration: float) -> list[dict[str, Any]]:
    """Accept only bounded measured telemetry; never speak untrusted arbitrary text."""
    path = root / "commentary-events.json"
    if not path.exists():
        return []  # Older captures have no telemetry.
    if path.is_symlink() or not path.is_file() or path.stat().st_size > 100_000:
        raise ValueError("Invalid commentary events file")
    events = json.loads(path.read_text(encoding="utf-8"))
    if not isinstance(events, list) or len(events) > 150:
        raise ValueError("Invalid commentary events")
    previous = None
    for event in events:
        if not isinstance(event, dict) or set(event) != {"at", "moves", "score", "max_tile"}:
            raise ValueError("Invalid commentary event")
        at = event["at"]
        if (type(at) not in (int, float) or not 0 <= at < duration
                or (previous is not None and at < previous + 24)):
            raise ValueError("Invalid commentary timing")
        for key in ("moves", "score", "max_tile"):
            if type(event[key]) is not int or not 0 <= event[key] <= report[key]:
                raise ValueError("Invalid commentary data")
        previous = at
    return events


def commentary_text(event: dict[str, Any]) -> str:
    if event["moves"] == 0:
        return "Начинаем сессию в две тысячи сорок восемь. Программа выбирает ходы по простой стратегии."
    return (f"Сделано ходов: {event['moves']}. Счёт: {event['score']}. "
            f"Самая большая плитка сейчас: {event['max_tile']}.")


def main() -> None:
    parser = argparse.ArgumentParser(description="Prepare a local recording with a spoken factual recap; no upload.")
    parser.add_argument("output_dir", type=Path)
    args = parser.parse_args()
    root = args.output_dir.resolve(strict=True)
    report_path = root / "report.json"
    if report_path.is_symlink() or not report_path.is_file() or report_path.stat().st_size > 50_000:
        raise ValueError("Invalid report file")
    report = validate_report(json.loads(report_path.read_text(encoding="utf-8")))
    video = root / report["video"]
    if video.is_symlink() or not video.is_file() or video.stat().st_size < 1000:
        raise ValueError("Missing actual recording")
    probe = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "json", str(video)], check=True, capture_output=True, text=True)
    duration = float(json.loads(probe.stdout)["format"]["duration"])
    if not 10 <= duration <= 3665 or abs(duration - report["elapsed_seconds"]) > 20:
        raise ValueError("Video duration does not match capture report")
    events = commentary_events(root, report, duration)
    text = narration(report)
    wav = root / "recap.wav"
    subprocess.run(["espeak-ng", "-v", "ru", "-s", "145", "-w", str(wav), text], check=True)
    with wave.open(str(wav), "rb") as stream:
        speech_seconds = stream.getnframes() / stream.getframerate()
    if not 1 <= speech_seconds <= 120:
        raise ValueError("Invalid recap duration")
    outro_seconds = speech_seconds + 1.5
    # The recap is visibly separated from gameplay and uses only measured data.
    from PIL import Image, ImageDraw, ImageFont
    card = Image.new("RGB", (1280, 720), "#172033")
    draw = ImageDraw.Draw(card)
    font_path = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
    heading = ImageFont.truetype(font_path, 44)
    body = ImageFont.truetype(font_path, 34)
    draw.text((80, 85), "ИТОГ ИГРОВОЙ СЕССИИ — 2048", font=heading, fill="#a8d8ff")
    draw.text((80, 185), OUTCOMES[report["outcome"]], font=body, fill="white")
    draw.text((80, 255), f"Ходов: {report['moves']}    Счёт: {report['score']}", font=body, fill="white")
    draw.text((80, 325), f"Самая большая плитка: {report['max_tile']}", font=body, fill="white")
    draw.text((80, 480), "Игра без звука · итог озвучен отдельно", font=body, fill="#a8d8ff")
    card_path = root / "recap.png"
    card.save(card_path)
    output = root / "gameplay-with-recap.mp4"
    # Commentary is synthesized after capture from timestamped game observations;
    # it is not generated live and cannot access credentials or game code.
    audio_inputs = []
    audio_filters = []
    labels = ["[silence]"]
    spoken = 0
    for event in events:
        clip = root / f"commentary-{spoken:03d}.wav"
        subprocess.run(["espeak-ng", "-v", "ru", "-s", "145", "-w", str(clip), commentary_text(event)], check=True)
        with wave.open(str(clip), "rb") as stream:
            clip_seconds = stream.getnframes() / stream.getframerate()
        # Do not cut a sentence or let commentary overlap the recap.
        if not 0 < clip_seconds <= 20 or event["at"] + clip_seconds > duration:
            clip.unlink()
            continue
        index = 3 + spoken
        audio_inputs.extend(["-i", str(clip)])
        audio_filters.append(f"[{index}:a]aresample=48000,aformat=channel_layouts=stereo,adelay={int(event['at'] * 1000)}:all=1[c{spoken}]")
        labels.append(f"[c{spoken}]")
        spoken += 1
    # The outro is deliberately a separate recap, never looped gameplay.
    filters = (f"[0:v]fps=25,scale=1280:720,setsar=1,format=yuv420p,setpts=PTS-STARTPTS[game];"
               f"[1:v]trim=duration={outro_seconds:.3f},setpts=PTS-STARTPTS,format=yuv420p[outro];"
               "[game][outro]concat=n=2:v=1:a=0[v];"
               f"anullsrc=r=48000:cl=stereo,atrim=duration={duration:.3f},asetpts=PTS-STARTPTS[silence]"
               + (";" + ";".join(audio_filters) if audio_filters else "")
               + ";" + "".join(labels) + f"amix=inputs={len(labels)}:duration=first:normalize=0[gameaudio];"
               + f"[2:a]aresample=48000,aformat=channel_layouts=stereo,apad,atrim=duration={outro_seconds:.3f},asetpts=PTS-STARTPTS[voice];"
               "[gameaudio][voice]concat=n=2:v=0:a=1[a]")
    subprocess.run(["ffmpeg", "-nostdin", "-y", "-i", str(video), "-loop", "1", "-framerate", "25", "-i", str(card_path),
                    "-i", str(wav), *audio_inputs, "-filter_complex", filters, "-map", "[v]", "-map", "[a]", "-c:v", "libx264",
                    "-preset", "veryfast", "-crf", "23", "-c:a", "aac", "-b:a", "128k", "-movflags", "+faststart", str(output)],
                   check=True, stdout=subprocess.DEVNULL, stderr=subprocess.PIPE)
    summary = {"capture_seconds": round(duration, 2), "recap_seconds": round(outro_seconds, 2),
               "outcome": report["outcome"], "moves": report["moves"], "score": report["score"],
               "max_tile": report["max_tile"], "video": output.name, "uploaded": False,
               "commentary_clips": spoken, "voice": "espeak-ng Russian; deterministic timed commentary and recap", "game_audio": False}
    (root / "final-report.json").write_text(json.dumps(summary, ensure_ascii=False, indent=2), encoding="utf-8")
    print(json.dumps(summary, ensure_ascii=False))


if __name__ == "__main__":
    main()
