"""Render a short, original dialogue cartoon to vertical MP4.

Uses simple vector-like characters drawn by Pillow and local eSpeak-NG Russian
speech. It downloads no images, music, or third-party footage.
"""
from __future__ import annotations

import hashlib
import json
import math
import os
import re
import tempfile
from concurrent.futures import ThreadPoolExecutor
from functools import lru_cache
import subprocess
import wave
from fractions import Fraction
from pathlib import Path
from typing import Any

from PIL import Image, ImageDraw, ImageFont, ImageOps

from speech_policy import fit_speech_text
from speech_pronunciation import pronunciation_text, SPOKEN_ALIASES
from speech_synthesis import validate_spoken_text

WIDTH, HEIGHT = 720, 1280
OUTPUT_WIDTH, OUTPUT_HEIGHT = 1080, 1920
# Shorts are drawn directly at the delivery rate. Every frame is a still card
# with at most a slow progress-bar step, so interpolation adds nothing while
# costing minutes: measured 681 s to encode 36 s of video with minterpolate
# versus 23.5 s for frame duplication at the same 1080p50 profile.
SOURCE_FPS, OUTPUT_FPS = 50, 50
# A scene's progress bar stops moving after its first 25 source seconds, so the
# remaining frames are pixel-identical. Draw each distinct frame once and link
# the duplicates; only the genuine animation frames differ.
ANIMATED_FRAMES_PER_SCENE = 25
PALETTE = ["#68a8ff", "#ff8c69", "#9c7af2", "#53cba5", "#f4bd4f", "#f078a2"]
FONT_PATHS = [
    "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
    "/usr/share/fonts/truetype/liberation2/LiberationSans-Regular.ttf",
]


@lru_cache(maxsize=32)
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


def normalize_narration(source: Path, output: Path) -> None:
    """Apply restrained speech filtering and loudness control without changing pitch."""
    subprocess.run([
        ffmpeg_executable(), "-nostdin", "-y", "-i", str(source), "-vn",
        "-af", "highpass=f=75,lowpass=f=10000,acompressor=threshold=0.125:ratio=2:attack=20:release=120,loudnorm=I=-16:TP=-2:LRA=11",
        "-ar", "24000", "-ac", "1", "-c:a", "pcm_s16le", str(output),
    ], check=True, stdout=subprocess.DEVNULL, stderr=subprocess.PIPE)




def synthesize(text: str, output: Path, voice: str = "ru", *, style: str = "neutral") -> float:
    """Produce locally synthesized Russian speech with consistent voice dynamics."""
    import os
    profiles = {"neutral": ("1.03", "0.60", "0.78", "0.18"),
                "bright": ("0.99", "0.65", "0.82", "0.16"),
                "reflective": ("1.07", "0.55", "0.73", "0.21")}
    if style not in profiles:
        raise ValueError("Unsupported narration style")
    length, noise, noise_w, pause = profiles[style]
    if not any("\u0400" <= char <= "\u04ff" for char in text):
        raise ValueError("Narration must contain Russian Cyrillic; refusing accidental English TTS.")
    output.parent.mkdir(parents=True, exist_ok=True)
    configured_model = os.environ.get("PIPER_MODEL_PATH", "").strip()
    with tempfile.TemporaryDirectory(prefix="voice-", dir=output.parent) as temp:
        raw, processed = Path(temp) / "raw.wav", Path(temp) / "processed.wav"
        spoken_text = validate_spoken_text(pronunciation_text(text))
        if configured_model:
            model_path = Path(configured_model)
            if not model_path.is_file():
                raise RuntimeError("Configured Russian Piper voice model is missing; refusing broken fallback audio.")
            subprocess.run(
                ["piper", "--model", str(model_path), "--output_file", str(raw),
                 "--length_scale", length, "--noise_scale", noise, "--noise_w_scale", noise_w, "--sentence_silence", pause],
                input=spoken_text, text=True, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.PIPE,
            )
        else:
            subprocess.run(
                ["espeak-ng", "-v", voice, "-s", "145", "-a", "165", "-w", str(raw), "--stdin"],
                input=spoken_text, text=True, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.PIPE,
            )
        normalize_narration(raw, processed)
        with wave.open(str(processed), "rb") as stream:
            if stream.getnframes() <= 0 or stream.getframerate() <= 0:
                raise RuntimeError("TTS produced an empty or invalid WAV file.")
            duration = stream.getnframes() / stream.getframerate()
        processed.replace(output)
    return duration


MASCOT_PATH = Path(__file__).resolve().parent / "assets" / "rat-mascot-avatar.png"


@lru_cache(maxsize=32)
def _fitted_asset(path: str, width: int, height: int) -> Image.Image:
    with Image.open(path) as source:
        return ImageOps.fit(source.convert("RGB"), (width, height), method=Image.Resampling.LANCZOS)


def _round_image(image: Image.Image, photo: Image.Image, xy: tuple[int, int], radius: int) -> None:
    mask = Image.new("L", photo.size, 0)
    ImageDraw.Draw(mask).rounded_rectangle((0, 0, photo.width - 1, photo.height - 1), radius=radius, fill=255)
    image.paste(photo, xy, mask)


def _mascot(image: Image.Image, x: int, y: int, size: int) -> None:
    try:
        picture = _fitted_asset(str(MASCOT_PATH), size, size)
        _round_image(image, picture, (x, y), size // 2)
        ImageDraw.Draw(image).ellipse((x, y, x + size - 1, y + size - 1), outline="#f6cc76", width=3)
    except (OSError, ValueError):
        pass  # branding is optional; never prevent a valid review from rendering


def _fitted_lines(draw: ImageDraw.ImageDraw, text: str, *, width: int, max_lines: int,
                  sizes: tuple[int, ...]) -> tuple[ImageFont.ImageFont, list[str]]:
    for size in sizes:
        selected = font(size)
        lines = wrap_text(draw, text, selected, width)
        if len(lines) <= max_lines and all(draw.textlength(line, font=selected) <= width for line in lines):
            return selected, lines
    selected = font(sizes[-1])
    lines = wrap_text(draw, text, selected, width)
    truncated = len(lines) > max_lines
    lines = lines[:max_lines]
    for i, line in enumerate(lines):
        too_wide = draw.textlength(line, font=selected) > width
        if too_wide or (truncated and i == len(lines) - 1):
            line = line.rstrip(" .…")
            while line and draw.textlength(line + "…", font=selected) > width:
                line = line[:-1]
            lines[i] = line.rstrip() + "…"
    return selected, lines


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
    if script.get("format") == "game-review":
        # Steam screenshots remain explicitly labelled source material, not gameplay.
        for y in range(HEIGHT):
            blend = y / HEIGHT
            draw.line((0, y, WIDTH, y), fill=(int(13 + 8*blend), int(20 + 8*blend), int(32 + 12*blend)))
        draw.ellipse((450, -230, 1000, 340), fill="#273545")
        draw.ellipse((-310, 820, 420, 1600), fill="#1b3637")
        draw.rounded_rectangle((32, 34, 688, 120), radius=25, fill="#243443", outline="#405565", width=2)
        _mascot(image, 46, 43, 68)
        draw.text((132, 54), "GAMES / ИИ-РАЗБОР", font=font(25), fill="#f5e5ba")
        draw.text((134, 84), "ФАКТЫ ИЗ STEAM", font=font(15), fill="#9eb1b9")
        score = int(script.get("idea_score", 0))
        draw.rounded_rectangle((544, 50, 671, 105), radius=18, fill="#f3c76e")
        draw.text((563, 58), f"{score}/10", font=font(30), fill="#28241c")
        draw.text((551, 110), "ОЦЕНКА ИДЕИ", font=font(12), fill="#e7d2a0")
        title = str(script.get("game_title", "Игра"))[:100]
        title_font, title_lines = _fitted_lines(draw, title, width=630, max_lines=2, sizes=(42, 38, 34, 30))
        for i, line in enumerate(title_lines):
            draw.text((44, 147 + i * 52), line, font=title_font, fill="#ffffff")
        draw.rounded_rectangle((40, 267, 680, 679), radius=28, fill="#253345", outline="#52697a", width=2)
        shots = script.get("screenshot_paths") or []
        shot_path = shots[scene_index % len(shots)] if shots else ""
        if shot_path:
            try:
                screenshot = _fitted_asset(str(shot_path), 624, 350)
                _round_image(image, screenshot, (48, 275), 22)
            except (OSError, ValueError):
                shot_path = ""
        if not shot_path:
            draw.rounded_rectangle((48, 275, 672, 625), radius=22, fill="#344a53")
            draw.text((84, 415), "ИГРА ПО ИСТОЧНИКАМ", font=font(32), fill="#d4e9df")
        draw.text((62, 640), "СКРИНШОТ ИЗ STEAM" if shot_path else "ИЗОБРАЖЕНИЕ НЕДОСТУПНО", font=font(15), fill="#c8d7da")
        label = str(scene.get("label", "РАЗБОР"))[:28]
        draw.rounded_rectangle((40, 704, 680, 1037), radius=28, fill="#f4f0e6")
        draw.rounded_rectangle((60, 726, 660, 779), radius=17, fill="#ad5260" if "МИНУС" in label else "#3f6c70")
        label_font, label_lines = _fitted_lines(draw, label, width=550, max_lines=1, sizes=(24, 21, 18))
        draw.text((82, 740), label_lines[0], font=label_font, fill="#ffffff")
        visual = str(scene.get("visual", ""))[:160]
        visual_font, visual_lines = _fitted_lines(draw, visual, width=570, max_lines=4, sizes=(28, 25, 22))
        for i, line in enumerate(visual_lines):
            draw.text((68, 805 + i * 38), line, font=visual_font, fill="#253039")
        dialogue = str(scene.get("dialogue", ""))[:200]
        caption_font, caption_lines = _fitted_lines(draw, dialogue, width=615, max_lines=3, sizes=(23, 21, 19))
        for i, line in enumerate(caption_lines):
            draw.text((50, 1060 + i * 30), line, font=caption_font, fill="#f5f8fa")
        draw.rounded_rectangle((50, 1160, 670, 1167), radius=4, fill="#42505b")
        completed = min(len(script.get("scenes", [])), scene_index + min(1.0, (frame + 1) / 25.0))
        fraction = completed / max(1, len(script.get("scenes", [])))
        draw.rounded_rectangle((50, 1160, max(55, 50 + int(620 * fraction)), 1167), radius=4, fill="#f3c76e")
        draw.text((50, 1186), "Оценка идеи по источникам · не личное прохождение", font=font(15), fill="#c0cdd0")
        draw.text((50, 1210), "Источники и ссылки — в описании", font=font(15), fill="#c0cdd0")
    else:
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
    # These PNGs are temporary FFmpeg inputs that are deleted after encoding.
    # PNG stays lossless at every compression level, and FFmpeg re-encodes the
    # pixels anyway, so the smallest file is not worth the slowest writer:
    # level 6 costs 49.3 ms per frame, level 3 costs 33.5 ms for the same
    # pixels and a 12% larger temporary file.
    image.resize((OUTPUT_WIDTH, OUTPUT_HEIGHT), Image.Resampling.LANCZOS).save(
        out, optimize=False, compress_level=3)


def ffmpeg_executable() -> str:
    system_ffmpeg = subprocess.run(["which", "ffmpeg"], capture_output=True, text=True).stdout.strip()
    if system_ffmpeg:
        return system_ffmpeg
    try:
        import imageio_ffmpeg
        return imageio_ffmpeg.get_ffmpeg_exe()
    except (ImportError, RuntimeError) as exc:
        raise RuntimeError("FFmpeg is required; install ffmpeg or the imageio-ffmpeg Python package.") from exc


def verify_video_profile(path: Path) -> dict[str, Any]:
    """Fail closed unless the encoded file is truly 1080p and at least 50 fps."""
    ffprobe = subprocess.run(["which", "ffprobe"], capture_output=True, text=True).stdout.strip()
    if not ffprobe:
        raise RuntimeError("ffprobe is required to verify output resolution and frame rate.")
    probe = subprocess.run([
        ffprobe, "-v", "error", "-select_streams", "v:0", "-show_entries",
        "stream=width,height,avg_frame_rate,r_frame_rate", "-of", "json", str(path),
    ], check=True, capture_output=True, text=True)
    payload = json.loads(probe.stdout)
    streams = payload.get("streams", [])
    if not streams:
        raise RuntimeError("Encoded video contains no video stream.")
    stream = streams[0]
    rate = Fraction(stream.get("avg_frame_rate") or stream.get("r_frame_rate") or "0/1")
    if int(stream.get("width", 0)) < 1080 or int(stream.get("height", 0)) < 1080 or rate < 50:
        raise RuntimeError(
            f"Encoded profile is below requirement: {stream.get('width')}x{stream.get('height')} at {float(rate):.2f} fps."
        )
    return {"fps": float(rate), "width": int(stream["width"]), "height": int(stream["height"])}


def render_silent_short(script: dict[str, Any], output: Path, workdir: Path, *, seconds_per_scene: float = 5.0) -> dict[str, Any]:
    """Render a speech-bubble-only test Short; useful when a TTS engine isn't installed."""
    ffmpeg = ffmpeg_executable()
    if not 1.0 <= seconds_per_scene <= 10.0:
        raise ValueError("seconds_per_scene must be from 1 to 10")
    frames_dir = workdir / "frames"
    frames_dir.mkdir(parents=True, exist_ok=True)
    frame_count = 0
    for scene_index, scene in enumerate(script["scenes"]):
        for frame in range(math.ceil(seconds_per_scene * SOURCE_FPS)):
            path = frames_dir / f"frame-{frame_count:06d}.png"
            render_frame(script, scene, scene_index, frame, path)
            frame_count += 1
    duration = frame_count / SOURCE_FPS
    if not 15 <= duration <= 60:
        raise ValueError(f"Short duration must be 15–60 seconds; rendered duration is {duration:.1f}s.")
    output.parent.mkdir(parents=True, exist_ok=True)
    pattern = str(frames_dir / "frame-%06d.png")
    process = subprocess.run([
        ffmpeg, "-y", "-framerate", str(SOURCE_FPS), "-i", pattern,
        "-vf", f"fps={OUTPUT_FPS},scale={OUTPUT_WIDTH}:{OUTPUT_HEIGHT}:flags=lanczos,format=yuv420p",
        "-c:v", "libx264", "-preset", "medium", "-crf", "19", "-maxrate", "12M", "-bufsize", "24M",
        "-r", str(OUTPUT_FPS), "-fps_mode", "cfr", "-an", "-movflags", "+faststart", str(output),
    ], stdout=subprocess.DEVNULL, stderr=subprocess.PIPE, text=True)
    if process.returncode:
        raise RuntimeError(f"FFmpeg could not encode the test Short: {process.stderr[-1200:]}")
    profile = verify_video_profile(output)
    return {"path": str(output), "duration_seconds": round(duration, 2), "frames": round(duration * OUTPUT_FPS), **profile, "audio": False}


def _scene_worker_count(scenes: int) -> int:
    """Bounded parallelism that always exceeds one worker when possible.

    Narration is an external process, so the work is spread across scenes rather
    than cores; drawing frames is CPU-bound and is kept to cores - 1. A cap of
    4 prevents a wide runner from spawning a burst of TTS processes.
    """
    cores = os.cpu_count() or 1
    return max(1, min(scenes, max(2, cores), 4))


def prepare_scene_narration(scene: dict[str, Any], scene_index: int, audio_dir: Path, *,
                            is_review: bool = False, fallback: str | None = "Короткий разбор игрового проекта.") -> tuple[str, float]:
    """Synthesize one scene's line and pad it; safe to run for several scenes at once.

    Each call owns its own wav path and Piper/espeak process, so concurrent
    scenes cannot interleave. Only the scene's own ``dialogue`` key is written.
    """
    audio_path = audio_dir / f"line-{scene_index:02d}.wav"
    style = {"happy": "bright", "curious": "neutral", "calm": "reflective"}.get(scene.get("emotion"), "neutral")
    dialogue, seconds = fit_speech_text(
        str(scene["dialogue"]),
        lambda candidate: synthesize(candidate, audio_path, style=style),
        max_seconds=12.0, preserve_full=is_review, fallback=fallback,
    )
    # Hold each card long enough to read the speech bubble. Silence is appended
    # after the spoken line rather than stretching or speeding up speech.
    with wave.open(str(audio_path), "rb") as source:
        params = source.getparams()
        spoken = source.readframes(source.getnframes())
    scene_seconds = max(5.0, seconds)
    silence_frames = max(0, math.ceil(scene_seconds * params.framerate) - len(spoken) // params.sampwidth // params.nchannels)
    with wave.open(str(audio_path), "wb") as target:
        target.setparams(params)
        target.writeframes(spoken)
        target.writeframes(b"\0" * silence_frames * params.sampwidth * params.nchannels)
    return dialogue, scene_seconds


def prepare_all_scenes(scenes: list[dict[str, Any]], audio_dir: Path, *,
                       is_review: bool = False, review_score: Any = None) -> list[tuple[str, float]]:
    """Synthesize every scene's narration, several at once, in scene order.

    Each scene is an independent external process, so running them together
    turns a sum of synthesis times into roughly the slowest one. The returned
    list keeps scene order so audio and frames still line up exactly.
    """
    if not scenes:
        return []
    def prepare(index: int) -> tuple[str, float]:
        fallback = "Короткий разбор игрового проекта."
        if is_review:
            fallback = None
            if index == len(scenes) - 1 and type(review_score) in (int, float) and 1 <= review_score <= 10:
                fallback = f"Оценка идеи по описанию — {format(review_score, '.1f').replace('.', ',')} из 10. Я не играла."
        return prepare_scene_narration(scenes[index], index, audio_dir, is_review=is_review, fallback=fallback)
    if len(scenes) == 1:
        return [prepare(0)]
    with ThreadPoolExecutor(max_workers=_scene_worker_count(len(scenes)),
                            thread_name_prefix="narration") as pool:
        futures = [pool.submit(prepare, index) for index in range(len(scenes))]
        return [future.result() for future in futures]


def render_scene_frames(script: dict[str, Any], scene: dict[str, Any], scene_index: int,
                        frames_dir: Path, first_index: int, nframes: int) -> int:
    """Draw one scene's frames, reusing still frames instead of redrawing them.

    Returns the number of frames written to ``frames_dir``. A frame is drawn
    only while the progress bar is still moving (see ANIMATED_FRAMES_PER_SCENE);
    every later frame in the scene is pixel-identical to the first still one and
    is hard-linked to it, which keeps FFmpeg's %06d sequence intact.
    """
    still: Path | None = None
    drawn = 0
    for frame in range(nframes):
        path = frames_dir / f"frame-{first_index + frame:06d}.png"
        if still is not None and frame >= ANIMATED_FRAMES_PER_SCENE:
            path.hardlink_to(still)
            continue
        render_frame(script, scene, scene_index, frame, path)
        drawn += 1
        if frame == ANIMATED_FRAMES_PER_SCENE - 1:
            still = path
    return drawn


def render_short(script: dict[str, Any], output: Path, workdir: Path) -> dict[str, Any]:
    import time
    stage = time.perf_counter()
    if os.environ.get("PIPER_MODEL_PATH"):
        if not Path(os.environ["PIPER_MODEL_PATH"]).is_file():
            raise RuntimeError("Configured Russian Piper voice model is missing.")
    elif not Path("/usr/bin/espeak-ng").exists() and not subprocess.run(["which", "espeak-ng"], capture_output=True).stdout:
        raise RuntimeError("A Russian TTS engine is required; install Piper voice or eSpeak-NG ru.")
    ffmpeg = ffmpeg_executable()
    frames_dir = workdir / "frames"
    audio_dir = workdir / "audio"
    frames_dir.mkdir(parents=True, exist_ok=True)
    audio_dir.mkdir(parents=True, exist_ok=True)
    scenes = script["scenes"]

    # Stage: narration. Every scene is an independent external TTS process, so
    # all of them start at once instead of waiting for their turn. Results are
    # consumed in scene order, which keeps the audio and frame order unchanged.
    narrate_start = time.perf_counter()
    prepared = prepare_all_scenes(scenes, audio_dir, is_review=script.get("format") == "game-review",
                                  review_score=script.get("idea_score"))
    wavs: list[Path] = []
    scene_seconds_list: list[float] = []
    for scene_index, (dialogue, scene_seconds) in enumerate(prepared):
        # Keep the bubble, recorded review, and final audio in sync after any safe shortening.
        scenes[scene_index]["dialogue"] = dialogue
        wavs.append(audio_dir / f"line-{scene_index:02d}.wav")
        scene_seconds_list.append(scene_seconds)
    narration_seconds = time.perf_counter() - narrate_start

    # Stage: frames. Offsets are computed first, so several scenes can be drawn
    # at once without ever racing on the global frame number.
    frames_start = time.perf_counter()
    counts = [max(SOURCE_FPS, math.ceil(seconds * SOURCE_FPS)) for seconds in scene_seconds_list]
    offsets: list[int] = []
    running = 0
    for count in counts:
        offsets.append(running)
        running += count
    total_seconds = sum(scene_seconds_list)
    if not 15 <= total_seconds <= 60:
        raise ValueError(f"Short duration must be 15–60 seconds; generated speech is {total_seconds:.1f}s.")
    work = list(zip(scenes, range(len(scenes)), offsets, counts))
    if len(work) > 1:
        with ThreadPoolExecutor(max_workers=_scene_worker_count(len(work)),
                                thread_name_prefix="frames") as pool:
            drawn = sum(pool.map(lambda item: render_scene_frames(script, item[0], item[1], frames_dir, item[2], item[3]), work))
    else:
        drawn = sum(render_scene_frames(script, scene, index, frames_dir, offset, count)
                    for scene, index, offset, count in work)
    frames_seconds = time.perf_counter() - frames_start

    concat_audio = workdir / "audio-list.txt"
    concat_audio.write_text("".join(f"file '{p.resolve()}'\n" for p in wavs), encoding="utf-8")
    full_audio = workdir / "narration.wav"
    subprocess.run([ffmpeg, "-y", "-f", "concat", "-safe", "0", "-i", str(concat_audio), "-c:a", "pcm_s16le", str(full_audio)],
                   check=True, stdout=subprocess.DEVNULL, stderr=subprocess.PIPE)
    output.parent.mkdir(parents=True, exist_ok=True)
    pattern = str(frames_dir / "frame-%06d.png")
    # Frame rate is already the delivery rate, so repeating frames is enough:
    # there is no generated motion for an optical-flow interpolator to smooth.
    subprocess.run([
        ffmpeg, "-y", "-framerate", str(SOURCE_FPS), "-i", pattern, "-i", str(full_audio),
        "-vf", f"fps={OUTPUT_FPS},scale={OUTPUT_WIDTH}:{OUTPUT_HEIGHT}:flags=lanczos,format=yuv420p",
        "-c:v", "libx264", "-preset", "medium", "-crf", "19", "-maxrate", "12M", "-bufsize", "24M",
        "-r", str(OUTPUT_FPS), "-fps_mode", "cfr", "-c:a", "aac", "-b:a", "192k", "-shortest", "-movflags", "+faststart", str(output),
    ], check=True, stdout=subprocess.DEVNULL, stderr=subprocess.PIPE)
    encode_seconds = time.perf_counter() - stage - narration_seconds - frames_seconds
    print(f"Short narration: {narration_seconds:.1f}s for {len(scenes)} scenes", flush=True)
    print(f"Short frames: {frames_seconds:.1f}s; drew {drawn} of {running}"
          f" ({running - drawn} still frames reused)", flush=True)
    print(f"Short encode and verification: {encode_seconds:.1f}s", flush=True)
    profile = verify_video_profile(output)
    return {"path": str(output), "duration_seconds": round(total_seconds, 2), "frames": round(total_seconds * OUTPUT_FPS), **profile}


def _render_long_card(script: dict[str, Any], scene: dict[str, Any], scene_index: int, out: Path) -> None:
    """Create an editorial 16:9 source-review card with a clear image/text hierarchy."""
    width, height = 1920, 1080
    image = Image.new("RGB", (width, height), "#111c2a")
    draw = ImageDraw.Draw(image)
    for y in range(height):
        blend = y / height
        draw.line((0, y, width, y), fill=(int(14+8*blend), int(23+9*blend), int(34+10*blend)))
    draw.ellipse((1300, -350, 2150, 500), fill="#293b49")
    draw.rounded_rectangle((65, 42, 1855, 145), radius=30, fill="#243542", outline="#405565", width=2)
    _mascot(image, 81, 50, 87)
    draw.text((190, 59), "GAMES / ИИ-РАЗБОР", font=font(31), fill="#f5e5ba")
    draw.text((190, 104), "ОБЗОР ПО ОПУБЛИКОВАННЫМ ИСТОЧНИКАМ", font=font(19), fill="#bacbc9")
    chapter = f"ГЛАВА {scene_index + 1:02d} / {len(script['scenes']):02d}"
    draw.text((1500, 77), chapter, font=font(26), fill="#c9dddd")
    draw.rounded_rectangle((65, 185, 1195, 919), radius=34, fill="#f4f0e6")
    title = str(script.get("game_title", "Игра"))[:100]
    title_font, title_lines = _fitted_lines(draw, title, width=1010, max_lines=2, sizes=(49, 43, 38, 32))
    for i, line in enumerate(title_lines):
        draw.text((115, 218 + i * 58), line, font=title_font, fill="#202f39")
    draw.rounded_rectangle((111, 345, 1149, 423), radius=20, fill="#3f6c70")
    visual = str(scene.get("visual", ""))[:160]
    visual_font, visual_lines = _fitted_lines(draw, visual, width=970, max_lines=2, sizes=(28, 25, 22))
    for i, line in enumerate(visual_lines):
        draw.text((138, 355 + i * 29), line, font=visual_font, fill="#ffffff")
    dialogue = str(scene.get("dialogue", ""))
    body_font, body_lines = _fitted_lines(draw, dialogue, width=1000, max_lines=10, sizes=(32, 29, 27, 25))
    line_height = body_font.size + 13
    for i, line in enumerate(body_lines):
        draw.text((116, 455 + i * line_height), line, font=body_font, fill="#25313b")
    draw.rounded_rectangle((1230, 185, 1855, 919), radius=34, fill="#253643", outline="#4a626e", width=2)
    shots = script.get("screenshot_paths") or []
    shot_path = shots[scene_index % len(shots)] if shots else ""
    if shot_path:
        try:
            screenshot = _fitted_asset(str(shot_path), 575, 406)
            _round_image(image, screenshot, (1255, 210), 24)
        except (OSError, ValueError):
            shot_path = ""
    if not shot_path:
        draw.rounded_rectangle((1255, 210, 1830, 616), radius=24, fill="#344a53")
        draw.text((1290, 385), "ИЗОБРАЖЕНИЕ", font=font(31), fill="#d4e9df")
        draw.text((1290, 430), "НЕДОСТУПНО", font=font(31), fill="#d4e9df")
    draw.text((1262, 645), "СКРИНШОТ ИЗ STEAM" if shot_path else "ОБЗОР ПО ИСТОЧНИКАМ", font=font(23), fill="#c8d7da")
    draw.text((1262, 690), "НЕ ЛИЧНОЕ ПРОХОЖДЕНИЕ", font=font(21), fill="#c8d7da")
    draw.rounded_rectangle((1260, 757, 1817, 849), radius=23, fill="#f3c76e")
    draw.text((1290, 778), f"ОЦЕНКА ИДЕИ: {script.get('idea_score', '—')}/10", font=font(30), fill="#28241c")
    draw.rounded_rectangle((70, 978, 1850, 989), radius=5, fill="#42505b")
    count = max(1, len(script.get("scenes", [])))
    fraction = min(1.0, (scene_index + 1) / count)
    draw.rounded_rectangle((70, 978, max(78, 70 + int(1780*fraction)), 989), radius=5, fill="#f3c76e")
    draw.text((75, 1010), "Ссылки на источники — в описании видео", font=font(23), fill="#bacbc9")
    out.parent.mkdir(parents=True, exist_ok=True)
    image.save(out, optimize=True)



def concat_long_segments(ffmpeg: str, segment_paths: list[Path], output: Path, workdir: Path) -> None:
    """Rebuild continuous 50-fps timestamps after concatenating A/V chapters.

    A concat-demuxer stream copy keeps AAC padding at chapter boundaries and
    creates tiny video timestamp gaps; ffprobe then reports e.g. 49.99 fps.
    Re-encoding the video with an fps filter creates genuinely constant 50-fps
    timestamps rather than merely changing metadata. The audio is not re-encoded.
    """
    if not segment_paths:
        raise ValueError("No chapter segments to concatenate")
    concat_list = workdir / "video-list.txt"
    concat_list.write_text("".join("file '" + str(p.resolve()).replace("'", "'\\''") + "'\n" for p in segment_paths), encoding="utf-8")
    output.parent.mkdir(parents=True, exist_ok=True)
    subprocess.run([
        ffmpeg, "-y", "-f", "concat", "-safe", "0", "-i", str(concat_list),
        "-vf", f"fps={OUTPUT_FPS},format=yuv420p", "-c:v", "libx264", "-preset", "veryfast", "-crf", "20",
        "-r", str(OUTPUT_FPS), "-fps_mode", "cfr", "-video_track_timescale", "12800",
        "-c:a", "copy", "-movflags", "+faststart", str(output),
    ], check=True, stdout=subprocess.DEVNULL, stderr=subprocess.PIPE)


def render_long_review(script: dict[str, Any], output: Path, workdir: Path) -> dict[str, Any]:
    """Render a landscape 3–10 minute sourced review at 1080p and constant 50 fps."""
    if len(script.get("scenes", [])) != 10:
        raise ValueError("A long-form review must contain ten validated chapters.")
    ffmpeg = ffmpeg_executable()
    cards = workdir / "cards"
    audio_dir = workdir / "audio"
    segments = workdir / "segments"
    for directory in (cards, audio_dir, segments):
        directory.mkdir(parents=True, exist_ok=True)
    scenes = script['scenes']

    def prepare_chapter(scene_index: int) -> tuple[str, float]:
        scene = scenes[scene_index]
        wav = audio_dir / f"chapter-{scene_index:02d}.wav"
        # Gentle chapter-level cadence variation, not a claim of human expression.
        style = ("bright", "neutral", "neutral", "reflective")[scene_index % 4]
        dialogue, seconds = fit_speech_text(
            str(scene["dialogue"]), lambda candidate: synthesize(candidate, wav, style=style),
            max_seconds=40.0, attempts=6, preserve_full=True, fallback=None,
        )
        with wave.open(str(wav), "rb") as source:
            params = source.getparams()
            speech = source.readframes(source.getnframes())
        scene_seconds = max(8.0, seconds + 1.2)
        pad_frames = max(0, math.ceil(scene_seconds * params.framerate) - len(speech) // params.sampwidth // params.nchannels)
        with wave.open(str(wav), "wb") as target:
            target.setparams(params)
            target.writeframes(speech)
            target.writeframes(b"\0" * pad_frames * params.sampwidth * params.nchannels)
        return dialogue, scene_seconds

    # Submit the whole stage together. Validate all audio before any video encoding.
    with ThreadPoolExecutor(max_workers=_scene_worker_count(len(scenes)), thread_name_prefix='long-voice') as pool:
        prepared = list(pool.map(prepare_chapter, range(len(scenes))))
    total_seconds = sum(seconds for _, seconds in prepared)
    if not 180 <= total_seconds <= 600:
        raise ValueError(f"Long review must be 3–10 minutes; generated duration is {total_seconds:.1f}s.")
    for scene, (dialogue, _) in zip(scenes, prepared):
        scene['dialogue'] = dialogue

    def encode_chapter(scene_index: int) -> Path:
        scene = scenes[scene_index]
        wav = audio_dir / f"chapter-{scene_index:02d}.wav"
        scene_seconds = prepared[scene_index][1]
        card = cards / f"chapter-{scene_index:02d}.png"
        _render_long_card(script, scene, scene_index, card)
        segment = segments / f"chapter-{scene_index:02d}.mp4"
        subprocess.run([
            ffmpeg, "-y", "-loop", "1", "-framerate", str(OUTPUT_FPS), "-i", str(card),
            "-i", str(wav), "-t", f"{scene_seconds:.3f}",
            "-vf", f"zoompan=z='min(zoom+0.00015,1.035)':d=1:s=1920x1080:fps={OUTPUT_FPS},format=yuv420p",
            "-c:v", "libx264", "-preset", "medium", "-crf", "20", "-maxrate", "12M", "-bufsize", "24M",
            "-r", str(OUTPUT_FPS), "-fps_mode", "cfr", "-c:a", "aac", "-b:a", "192k", "-shortest",
            "-movflags", "+faststart", str(segment),
        ], check=True, stdout=subprocess.DEVNULL, stderr=subprocess.PIPE)
        return segment

    # FFmpeg already uses multiple threads. Two independent encodes are enough
    # to overlap work without launching ten encoders on the same runner.
    encode_workers = min(2, _scene_worker_count(len(scenes)))
    with ThreadPoolExecutor(max_workers=encode_workers, thread_name_prefix='long-video') as pool:
        segment_paths = list(pool.map(encode_chapter, range(len(scenes))))
    concat_long_segments(ffmpeg, segment_paths, output, workdir)
    profile = verify_video_profile(output)
    return {
        "path": str(output), "duration_seconds": round(total_seconds, 2),
        "frames": round(total_seconds * OUTPUT_FPS), **profile, "format": "long-form",
    }
