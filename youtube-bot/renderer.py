"""Render a short, original dialogue cartoon to vertical MP4.

Uses simple vector-like characters drawn by Pillow and local eSpeak-NG Russian
speech. It downloads no images, music, or third-party footage.
"""
from __future__ import annotations

import hashlib
import math
import subprocess
import wave
from pathlib import Path
from typing import Any

from PIL import Image, ImageDraw, ImageFont

WIDTH, HEIGHT, FPS = 720, 1280, 12
PALETTE = ["#68a8ff", "#ff8c69", "#9c7af2", "#53cba5", "#f4bd4f", "#f078a2"]
FONT_PATHS = [
    "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
    "/usr/share/fonts/truetype/liberation2/LiberationSans-Regular.ttf",
]


def font(size: int) -> ImageFont.FreeTypeFont | ImageFont.ImageFont:
    for candidate in FONT_PATHS:
        if Path(candidate).is_file():
            return ImageFont.truetype(candidate, size)
    raise RuntimeError("A Cyrillic font is required; install fonts-dejavu-core.")


def wrap_text(draw: ImageDraw.ImageDraw, text: str, selected_font: ImageFont.ImageFont, max_width: int) -> list[str]:
    lines: list[str] = []
    current = ""
    for word in text.split():
        candidate = (current + " " + word).strip()
        if current and draw.textlength(candidate, font=selected_font) > max_width:
            lines.append(current)
            current = word
        else:
            current = candidate
    if current:
        lines.append(current)
    return lines or [""]


def color_for(name: str) -> str:
    index = hashlib.sha256(name.encode("utf-8")).digest()[0] % len(PALETTE)
    return PALETTE[index]


def synthesize(text: str, output: Path, voice: str = "ru") -> float:
    output.parent.mkdir(parents=True, exist_ok=True)
    subprocess.run(
        ["espeak-ng", "-v", voice, "-s", "158", "-a", "165", "-w", str(output), text],
        check=True, stdout=subprocess.DEVNULL, stderr=subprocess.PIPE,
    )
    with wave.open(str(output), "rb") as stream:
        return stream.getnframes() / stream.getframerate()


def draw_character(draw: ImageDraw.ImageDraw, name: str, x: int, y: int, color: str, active: bool,
                   emotion: str, frame: int) -> None:
    bob = 5 * math.sin(frame / 2.5) if active else 0
    y = int(y + bob)
    # Rounded, original mascot silhouette; no licensed character assets.
    draw.ellipse((x - 82, y - 88, x + 82, y + 76), fill=color, outline="#172033", width=5)
    draw.ellipse((x - 43, y - 15, x - 25, y + 7), fill="#101522")
    draw.ellipse((x + 25, y - 15, x + 43, y + 7), fill="#101522")
    if active and frame % 4 < 2:
        draw.ellipse((x - 13, y + 21, x + 13, y + 44), fill="#412433")
    elif emotion == "happy":
        draw.arc((x - 22, y + 10, x + 22, y + 45), start=0, end=180, fill="#412433", width=5)
    else:
        draw.line((x - 12, y + 31, x + 12, y + 31), fill="#412433", width=4)
    # Simple body and nameplate.
    draw.rounded_rectangle((x - 48, y + 75, x + 48, y + 175), radius=30, fill=color, outline="#172033", width=4)
    label_font = font(22)
    label = name[:14]
    box = draw.textbbox((0, 0), label, font=label_font)
    draw.rounded_rectangle((x - 78, y + 185, x + 78, y + 222), radius=16, fill="#111827")
    draw.text((x - (box[2] - box[0]) / 2, y + 190), label, font=label_font, fill="#ffffff")


def draw_bubble(image: Image.Image, text: str, speaker_side: str) -> None:
    draw = ImageDraw.Draw(image)
    bubble_font = font(36)
    lines = wrap_text(draw, text, bubble_font, 555)
    line_height = 48
    bubble_h = min(330, max(112, 34 + line_height * len(lines)))
    x0, y0, x1, y1 = 48, 236, 672, 236 + bubble_h
    draw.rounded_rectangle((x0, y0, x1, y1), radius=30, fill="#ffffff", outline="#142033", width=5)
    tail_x = 190 if speaker_side == "left" else 530
    draw.polygon([(tail_x - 20, y1 - 4), (tail_x + 23, y1 - 4), (tail_x - 3, y1 + 43)], fill="#ffffff")
    draw.line([(tail_x - 20, y1 - 4), (tail_x - 3, y1 + 43), (tail_x + 23, y1 - 4)], fill="#142033", width=4)
    y = y0 + 19
    for line in lines:
        draw.text((x0 + 26, y), line, font=bubble_font, fill="#121826", stroke_width=0)
        y += line_height


def render_frame(script: dict[str, Any], scene: dict[str, Any], scene_index: int, frame: int,
                 out: Path) -> None:
    image = Image.new("RGB", (WIDTH, HEIGHT), "#e8f3ff")
    draw = ImageDraw.Draw(image)
    # Warm, simple background with a small decorative horizon.
    for y in range(0, HEIGHT, 4):
        blend = y / HEIGHT
        r = int(235 - 23 * blend); g = int(244 - 20 * blend); b = int(255 - 8 * blend)
        draw.rectangle((0, y, WIDTH, y + 4), fill=(r, g, b))
    draw.ellipse((-120, 840, 840, 1520), fill="#d5eddb")
    title_font = font(26)
    title = script["title"][:58]
    title_lines = wrap_text(draw, title, title_font, 640)
    draw.text((40, 48), "КРАТКАЯ ИСТОРИЯ", font=font(18), fill="#49566b")
    for i, line in enumerate(title_lines[:2]):
        draw.text((40, 82 + i * 35), line, font=title_font, fill="#172033")
    if scene_index == 0:
        draw.rounded_rectangle((38, 164, 682, 214), radius=18, fill="#fff4c2")
        hook_lines = wrap_text(draw, script["hook"][:100], font(22), 600)
        draw.text((54, 177), hook_lines[0][:80], font=font(22), fill="#5e4b16")
    left_name = str(scene.get("speaker", "Герой"))
    right_name = str(scene.get("listener", "Друг"))
    left_color, right_color = color_for(left_name), color_for(right_name)
    active_left = str(scene.get("speaker", "")) != right_name
    draw_character(draw, left_name, 190, 770, left_color, active_left, str(scene.get("emotion", "calm")), frame)
    draw_character(draw, right_name, 530, 770, right_color, not active_left, "calm", frame)
    draw_bubble(image, str(scene["dialogue"]), "left" if active_left else "right")
    visual = str(scene.get("visual", ""))[:120]
    if visual:
        caption_font = font(18)
        caption_lines = wrap_text(draw, visual, caption_font, 600)[:2]
        caption_y = 1120 - 23 * len(caption_lines)
        draw.rounded_rectangle((44, caption_y - 10, 676, 1190), radius=16, fill="#ffffff", outline="#9aa8bd", width=2)
        for line in caption_lines:
            draw.text((60, caption_y), line, font=caption_font, fill="#37445a")
            caption_y += 24
    out.parent.mkdir(parents=True, exist_ok=True)
    image.save(out, optimize=True)


def render_short(script: dict[str, Any], output: Path, workdir: Path) -> dict[str, Any]:
    if not Path("/usr/bin/espeak-ng").exists() and not subprocess.run(["which", "espeak-ng"], capture_output=True).stdout:
        raise RuntimeError("eSpeak-NG is required; install it with the espeak-ng system package.")
    ffmpeg = subprocess.run(["which", "ffmpeg"], check=True, capture_output=True, text=True).stdout.strip()
    if not ffmpeg:
        raise RuntimeError("FFmpeg is required to render MP4.")
    frames_dir = workdir / "frames"
    audio_dir = workdir / "audio"
    frames_dir.mkdir(parents=True, exist_ok=True)
    audio_dir.mkdir(parents=True, exist_ok=True)
    all_frames: list[Path] = []
    wavs: list[Path] = []
    total_seconds = 0.0
    for scene_index, scene in enumerate(script["scenes"]):
        audio_path = audio_dir / f"line-{scene_index:02d}.wav"
        seconds = synthesize(scene["dialogue"], audio_path)
        if seconds > 12:
            raise ValueError("A scene line is too long for a short; shorten the dialogue.")
        # Hold each cartoon scene long enough to read the speech bubble. Silence is
        # appended after the spoken line rather than stretching or speeding up speech.
        with wave.open(str(audio_path), "rb") as source:
            params = source.getparams()
            spoken = source.readframes(source.getnframes())
        scene_seconds = max(5.0, seconds)
        silence_frames = max(0, math.ceil(scene_seconds * params.framerate) - len(spoken) // params.sampwidth // params.nchannels)
        with wave.open(str(audio_path), "wb") as target:
            target.setparams(params)
            target.writeframes(spoken)
            target.writeframes(b"\0" * silence_frames * params.sampwidth * params.nchannels)
        wavs.append(audio_path)
        nframes = max(12, math.ceil(scene_seconds * FPS))
        for frame in range(nframes):
            path = frames_dir / f"frame-{len(all_frames):06d}.png"
            render_frame(script, scene, scene_index, frame, path)
            all_frames.append(path)
        total_seconds += scene_seconds
    if not 15 <= total_seconds <= 60:
        raise ValueError(f"Short duration must be 15–60 seconds; generated speech is {total_seconds:.1f}s.")
    concat_audio = workdir / "audio-list.txt"
    concat_audio.write_text("".join(f"file '{p.resolve()}'\n" for p in wavs), encoding="utf-8")
    full_audio = workdir / "narration.wav"
    subprocess.run([ffmpeg, "-y", "-f", "concat", "-safe", "0", "-i", str(concat_audio), "-c:a", "pcm_s16le", str(full_audio)],
                   check=True, stdout=subprocess.DEVNULL, stderr=subprocess.PIPE)
    output.parent.mkdir(parents=True, exist_ok=True)
    pattern = str(frames_dir / "frame-%06d.png")
    subprocess.run([
        ffmpeg, "-y", "-framerate", str(FPS), "-i", pattern, "-i", str(full_audio),
        "-vf", "scale=720:1280,fps=24,format=yuv420p", "-c:v", "libx264", "-preset", "veryfast",
        "-crf", "22", "-c:a", "aac", "-b:a", "128k", "-shortest", "-movflags", "+faststart", str(output),
    ], check=True, stdout=subprocess.DEVNULL, stderr=subprocess.PIPE)
    return {"path": str(output), "duration_seconds": round(total_seconds, 2), "frames": len(all_frames)}
