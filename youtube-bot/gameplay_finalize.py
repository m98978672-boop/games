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
    text = narration(report)
    wav = root / "recap.wav"
    subprocess.run(["espeak-ng", "-v", "ru", "-s", "145", "-w", str(wav), text], check=True)
    with wave.open(str(wav), "rb") as stream:
        speech_seconds = stream.getnframes() / stream.getframerate()
    if not 1 <= speech_seconds <= 120:
        raise ValueError("Invalid recap duration")
    outro_seconds = speech_seconds + 1.5
    output = root / "gameplay-with-recap.mp4"
    # The black outro is deliberately a separate recap, never looped gameplay.
    filters = (f"[0:v]fps=25,scale=1280:720,setsar=1,format=yuv420p,setpts=PTS-STARTPTS[game];"
               f"[1:v]trim=duration={outro_seconds:.3f},setpts=PTS-STARTPTS,format=yuv420p[outro];"
               "[game][outro]concat=n=2:v=1:a=0[v];"
               f"anullsrc=r=48000:cl=stereo,atrim=duration={duration:.3f},asetpts=PTS-STARTPTS[silence];"
               f"[2:a]aresample=48000,aformat=channel_layouts=stereo,apad,atrim=duration={outro_seconds:.3f},asetpts=PTS-STARTPTS[voice];"
               "[silence][voice]concat=n=2:v=0:a=1[a]")
    subprocess.run(["ffmpeg", "-nostdin", "-y", "-i", str(video), "-f", "lavfi", "-i", "color=c=0x172033:s=1280x720:r=25",
                    "-i", str(wav), "-filter_complex", filters, "-map", "[v]", "-map", "[a]", "-c:v", "libx264",
                    "-preset", "veryfast", "-crf", "23", "-c:a", "aac", "-b:a", "128k", "-movflags", "+faststart", str(output)],
                   check=True, stdout=subprocess.DEVNULL, stderr=subprocess.PIPE)
    summary = {"capture_seconds": round(duration, 2), "recap_seconds": round(outro_seconds, 2),
               "outcome": report["outcome"], "moves": report["moves"], "score": report["score"],
               "max_tile": report["max_tile"], "video": output.name, "uploaded": False,
               "voice": "espeak-ng Russian; deterministic factual recap", "game_audio": False}
    (root / "final-report.json").write_text(json.dumps(summary, ensure_ascii=False, indent=2), encoding="utf-8")
    print(json.dumps(summary, ensure_ascii=False))


if __name__ == "__main__":
    main()
