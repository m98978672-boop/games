# -*- coding: utf-8 -*-
"""Долгое видео с монтажом: Квеня играет всю партию в шахматы (chess.js, чужой репозиторий),
Зуза-маскот комментирует каждый ход. Монтаж: главкарточки, врезухи Зузы крупным планом,
повторы с замедлением, зум-камера на ходы, REC-индикатор записи сессии.
Проходы: timeline -> (rat3d.py seq) -> video."""
import json
import math
import os
import subprocess
import sys
import wave

import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter

HERE = os.path.dirname(os.path.abspath(__file__))
BUILD = os.path.join(HERE, 'build')
AUDIO = os.path.join(HERE, 'audio')
sys.path.insert(0, HERE)
from script import SEGMENTS  # noqa: E402

FPS = 50
W, H = 1920, 1080
SR = 22050
LAV = (154, 123, 255)
GLYPH = {'k': '♚', 'q': '♛', 'r': '♜', 'b': '♝', 'n': '♞', 'p': '♟'}
FFMPEG = None

CARDS = {3: 'МИТТЕЛЬШПИЛЬ · РАЗМЕНЫ И РЕЙДЫ', 9: 'АТАКА НА КОРОЛЯ', 10: 'МАТОВАЯ АТАКА'}
CUTS = {4: 2.3, 9: 2.3, 12: 2.3}
REPLAYS = {4: (25, 30, 1.35), 12: (77, 81, 1.7)}


def font(sz, bold=False):
    p = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf' if bold else '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'
    return ImageFont.truetype(p, sz) if os.path.isfile(p) else ImageFont.load_default()


def wav_dur(path):
    with wave.open(path) as w:
        return w.getnframes() / w.getframerate()


def load_moves():
    return [json.loads(l) for l in open(os.path.join(BUILD, 'moves.jsonl'))]


def wrap(dr, text, fnt, maxw):
    lines, cur = [], ''
    for word in text.split():
        c = (cur + ' ' + word).strip()
        if cur and dr.textlength(c, font=fnt) > maxw:
            lines.append(cur)
            cur = word
        else:
            cur = c
    if cur:
        lines.append(cur)
    return lines


def parse_fen(fen):
    board = {}
    for r, row in enumerate(fen.split()[0].split('/')):
        f = 0
        for ch in row:
            if ch.isdigit():
                f += int(ch)
            else:
                board[(f, r)] = ch
                f += 1
    return board


def render_board(board, last, check_sq, arrow_t, cap_at, cap_t, pw, ph, zoom=1.0, focus=None, sq=96, coords=False):
    """Доска с камерой: zoom вокруг focus (f,r) -> картинка pw x ph."""
    im = Image.new('RGB', (pw, ph), (38, 40, 36))
    dr = ImageDraw.Draw(im)
    s = sq * zoom
    if focus:
        ox = pw / 2 - (focus[0] + 0.5) * s
        oy = ph / 2 - (focus[1] + 0.5) * s
    else:
        ox = (pw - 8 * s) / 2
        oy = (ph - 8 * s) / 2
    f0, f1 = int(-ox // s) - 1, int((pw - ox) // s) + 1
    r0, r1 = int(-oy // s) - 1, int((ph - oy) // s) + 1
    for r in range(max(0, r0), min(8, r1)):
        for f in range(max(0, f0), min(8, f1)):
            light = (f + r) % 2 == 0
            col = (238, 232, 208) if light else (122, 152, 102)
            if last and ((f, r) == last[0] or (f, r) == last[1]):
                col = (240, 214, 96) if light else (206, 176, 74)
            x, y = ox + f * s, oy + r * s
            dr.rectangle([x, y, x + s + 1, y + s + 1], fill=col)
    if check_sq:
        x, y = ox + check_sq[0] * s, oy + check_sq[1] * s
        dr.rectangle([x + s * 0.05, y + s * 0.05, x + s * 0.95, y + s * 0.95], outline=(226, 60, 48), width=max(3, int(s * 0.06)))
    if coords and zoom <= 1.01:
        fs = font(max(14, int(s * 0.2)))
        for f in range(8):
            dr.text((ox + f * s + s * 0.06, oy + 8 * s + 4), 'abcdefgh'[f], font=fs, fill=(205, 200, 185))
        for r in range(8):
            dr.text((ox - s * 0.26, oy + r * s + s * 0.06), str(8 - r), font=fs, fill=(205, 200, 185))
    fp = font(int(s * 0.8), True)
    for (f, r), ch in board.items():
        x, y = ox + f * s, oy + r * s
        if x < -s or y < -s or x > pw or y > ph:
            continue
        white = ch.isupper()
        dr.text((x + s / 2, y + s / 2 + s * 0.04), GLYPH[ch.lower()], font=fp, anchor='mm',
                fill=(250, 250, 246) if white else (42, 38, 36),
                stroke_width=max(2, int(s * 0.03)), stroke_fill=(30, 28, 26) if white else (232, 230, 222))
    if last and arrow_t is not None and 0 <= arrow_t < 1.0:
        (fa, ra), (fb, rb) = last
        x0, y0 = ox + (fa + 0.5) * s, oy + (ra + 0.5) * s
        x1, y1 = ox + (fb + 0.5) * s, oy + (rb + 0.5) * s
        dr.line([(x0, y0), (x1, y1)], fill=(238, 90, 60), width=max(4, int(s * 0.09)))
        ang = math.atan2(y1 - y0, x1 - x0)
        for da in (2.6, -2.6):
            dr.line([(x1, y1), (x1 + s * 0.28 * math.cos(ang + da), y1 + s * 0.28 * math.sin(ang + da))],
                    fill=(238, 90, 60), width=max(4, int(s * 0.09)))
    if cap_at and cap_t is not None and 0 <= cap_t < 0.6:
        x, y = ox + (cap_at[0] + 0.5) * s, oy + (cap_at[1] + 0.5) * s
        k = 1 - cap_t / 0.6
        for a in range(8):
            aa = a * math.pi / 4 + 0.3
            dr.line([(x + s * 0.2 * math.cos(aa), y + s * 0.2 * math.sin(aa)),
                     (x + (0.28 + 0.25 * k) * s * math.cos(aa), y + (0.28 + 0.25 * k) * s * math.sin(aa))],
                    fill=(250, 220, 90), width=max(3, int(s * 0.05)))
    return im


def build_timeline():
    moves = load_moves()
    tl, cur = [], 0.0
    for i, seg in enumerate(SEGMENTS):
        d = wav_dur(os.path.join(AUDIO, f'k{i + 1:02d}.wav')) + 0.6
        tl.append(dict(i=i, key=seg['key'], mood=seg['mood'], win=seg['win'], start=cur, dur=d, text=seg['text']))
        cur += d
    tl.append(dict(i=len(SEGMENTS), key='card', mood='laugh', win=(81, 81), start=cur, dur=6.0, text=''))
    total = cur + 6.0
    json.dump(dict(tl=tl, total=total), open(os.path.join(BUILD, 'timeline.json'), 'w'), ensure_ascii=False)
    json.dump([dict(dur=s['dur'], mood=s['mood'], t0=s['start']) for s in tl],
              open(os.path.join(BUILD, 'rat_timeline.json'), 'w'))
    for s in tl:
        print(f"{s['key']:>5} start {s['start']:6.1f} dur {s['dur']:5.1f} ply {s['win']}")
    print('total', round(total, 1))


def build_edl(tl):
    """Монтажный список шотов."""
    edl = [dict(type='title', dur=3.2)]
    for s in tl:
        i = s['i']
        if s['key'] == 'card':
            edl.append(dict(type='verdict', dur=s['dur'], seg=s))
            continue
        if i in CARDS:
            edl.append(dict(type='chapter', dur=1.7, label=CARDS[i]))
        cut = CUTS.get(i, 0.0)
        if cut:
            edl.append(dict(type='cutaway', dur=cut, seg=s, mood=s['mood']))
        gd = s['dur'] - cut
        edl.append(dict(type='game', dur=gd, seg=s, audio_at=cut > 0))
        if i in REPLAYS:
            a, b, pace = REPLAYS[i]
            edl.append(dict(type='replay', dur=(b - a) * pace, win=(a, b), pace=pace))
    t = 0.0
    for sh in edl:
        sh['start'] = t
        t += sh['dur']
    return edl, t


def main():
    global FFMPEG
    import imageio_ffmpeg
    FFMPEG = imageio_ffmpeg.get_ffmpeg_exe()
    mode = sys.argv[1] if len(sys.argv) > 1 else 'timeline'
    if mode == 'timeline':
        build_timeline()
        return
    moves = load_moves()
    tld = json.load(open(os.path.join(BUILD, 'timeline.json')))
    tl = tld['tl']
    edl, total = build_edl(tl)
    start_fen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'
    rat_dir = os.path.join(BUILD, 'rat')
    n_rat = len([f for f in os.listdir(rat_dir) if f.endswith('.png')])
    nframes = int(total * FPS)
    print('EDL shots:', len(edl), 'total', round(total, 1), 's', flush=True)
    ff = subprocess.Popen([FFMPEG, '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}',
                           '-r', str(FPS), '-i', '-', '-an', '-c:v', 'libx264', '-preset', 'fast',
                           '-crf', '20', '-pix_fmt', 'yuv420p', os.path.join(HERE, 'video_silent.mp4')],
                          stdin=subprocess.PIPE, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    f_sub, f_hud, f_big, f_mid, f_sm = font(34), font(26, True), font(64, True), font(40, True), font(22)
    f_piece = font(40)
    rat_cache = {}
    rng = np.random.default_rng(11)
    conf = [(rng.uniform(0, W), rng.uniform(0, H), int(rng.integers(0, 3))) for _ in range(90)]

    def rat_frame(ri, size):
        key = (ri, size)
        if key not in rat_cache:
            rat_cache.clear()
            rat_cache[key] = Image.open(os.path.join(rat_dir, f'{ri:05d}.png')).resize((size, size))
        return rat_cache[key]

    def hud(dr, tau):
        dr.rectangle([0, 0, W, 64], fill=(16, 18, 16))
        if int(tau * 1.6) % 2 == 0:
            dr.ellipse([20, 22, 40, 42], fill=(226, 50, 40))
        mm, ss = int(tau // 60), int(tau % 60)
        dr.text((50, 16), f'ЗАПИСЬ СЕССИИ {mm:02d}:{ss:02d} · ЗУЗА КОММЕНТИРУЕТ, КВЕНЯ ИГРАЕТ', font=f_hud, fill=(226, 222, 245))
        credit = 'chess.js · Jeff Hlywa · BSD-2-Clause'
        dr.text((W - dr.textlength(credit, font=f_hud) - 18, 16), credit, font=f_hud, fill=(168, 168, 162))

    def subs(dr, seg):
        if not seg or not seg.get('text'):
            return
        lines = wrap(dr, seg['text'], f_sub, 1400)[-2:]
        bh = 24 + len(lines) * 44
        dr.rectangle([W / 2 - 780, H - bh - 20, W / 2 + 780, H - 20], fill=(12, 12, 14))
        dr.rectangle([W / 2 - 780, H - bh - 20, W / 2 - 772, H - 20], fill=LAV)
        dr.text((W / 2 - 750, H - bh - 12), 'ЗУЗА', font=f_hud, fill=LAV)
        for li, ln in enumerate(lines):
            dr.text((W / 2 - dr.textlength(ln, font=f_sub) / 2, H - bh + 10 + li * 44), ln, font=f_sub, fill=(242, 242, 236))

    def move_meta(idx):
        mv = moves[idx - 1] if idx >= 1 else None
        board = parse_fen(mv['fen'] if mv else start_fen)
        last = check_sq = None
        if mv:
            last = ((ord(mv['from'][0]) - 97, 8 - int(mv['from'][1])), (ord(mv['to'][0]) - 97, 8 - int(mv['to'][1])))
            if mv['check'] or mv['mate']:
                side = 'w' if mv['side'] == 'b' else 'b'
                for (f, r), ch in board.items():
                    if ch == ('k' if side == 'b' else 'K'):
                        check_sq = (f, r)
        return mv, board, last, check_sq

    for fi in range(nframes):
        tau = fi / FPS
        sh = next((q for q in edl if q['start'] <= tau < q['start'] + q['dur']), edl[-1])
        lt = tau - sh['start']
        im = Image.new('RGB', (W, H), (24, 26, 24))
        dr = ImageDraw.Draw(im)
        if sh['type'] == 'title':
            dr.rectangle([0, 0, W, H], fill=(12, 12, 14))
            dr.rectangle([W / 2 - 700, 320, W / 2 + 700, 700], fill=(20, 22, 20))
            dr.rectangle([W / 2 - 700, 320, W / 2 + 700, 330], fill=LAV)
            dr.text((W / 2, 400), 'КВЕНЯ ИГРАЕТ · ЗУЗА КОММЕНТИРУЕТ', font=f_big, anchor='mm', fill=(245, 245, 240))
            dr.text((W / 2, 480), 'ШАХМАТЫ · ВСЯ ПАРТИЯ БЕЗ ПЕРЕМОТОК', font=f_mid, anchor='mm', fill=(200, 200, 195))
            dr.text((W / 2, 560), 'движок партии: chess.js из чужого репозитория · BSD-2-Clause', font=f_sub, anchor='mm', fill=(170, 170, 165))
            dr.text((W / 2, 630), 'каждый ход показан и прокомментирован', font=f_sub, anchor='mm', fill=LAV)
            k = min(1.0, lt / 1.2)
            dr.text((W / 2, 800), '♞', font=font(int(120 + 60 * k)), anchor='mm', fill=(90, 88, 84))
            hud(dr, tau)
        elif sh['type'] == 'chapter':
            dr.rectangle([0, 0, W, H], fill=(14, 14, 16))
            a = min(1.0, lt / 0.35)
            dr.rectangle([W / 2 - 640 * a, 440, W / 2 + 640 * a, 620], fill=(26, 28, 26))
            dr.rectangle([W / 2 - 640 * a, 440, W / 2 - 630 * a, 620], fill=LAV)
            if a > 0.6:
                dr.text((W / 2, 530), sh['label'], font=f_big, anchor='mm', fill=(242, 242, 236))
            hud(dr, tau)
        elif sh['type'] == 'cutaway':
            seg = sh['seg']
            rim = rat_frame(int(min(n_rat - 1, tau * 12.5)), 1240)
            bw = rim.crop((80, 80, 1160, 1160)).resize((W, H))
            bw = bw.filter(ImageFilter.SMOOTH)
            im.paste(bw, (0, 0))
            dr = ImageDraw.Draw(im)
            for i in range(90):
                a = int(120 * (1 - i / 90))
                dr.rectangle([i, i, W - i, H - i], outline=(12 + a // 6, 12 + a // 6, 14 + a // 6))
            rim2 = rat_frame(int(min(n_rat - 1, tau * 12.5)), 620)
            im.paste(rim2, (W - 660, H - 660))
            dr = ImageDraw.Draw(im)
            dr.rectangle([W - 664, H - 664, W - 36, H - 36], outline=(18, 18, 20), width=4)
            dr.rectangle([40, 90, 470, 150], fill=(18, 18, 20))
            dr.text((56, 102), 'ЗУЗА · КРУПНЫЙ ПЛАН', font=f_hud, fill=(232, 228, 216))
            hud(dr, tau)
            subs(dr, seg)
        elif sh['type'] in ('game', 'replay'):
            seg = sh.get('seg')
            if sh['type'] == 'game':
                w0, w1 = seg['win']
                u = min(1.0, lt / sh['dur'])
                ply_f = w0 + (w1 - w0) * u
                pace = sh['dur'] / max(0.001, w1 - w0)
            else:
                w0, w1 = sh['win']
                ply_f = w0 + lt / sh['pace']
                pace = sh['pace']
            idx = max(0, min(len(moves), int(ply_f)))
            t_in = (ply_f - idx) * pace
            mv, board, last, check_sq = move_meta(idx)
            cap_at = cap_t = None
            if mv and mv['cap']:
                cap_at, cap_t = last[1], t_in
            zoom, focus = 1.0, None
            if sh['type'] == 'replay':
                zoom = 1.45
                focus = last[1] if last else (4, 4)
            elif seg and seg['i'] >= 10 and seg['i'] <= 12:
                for (f, r), ch in board.items():
                    if ch == 'k':
                        focus = (f, r)
                zoom = 1.22
            elif last and t_in < 1.5:
                x = math.sin(math.pi * min(1.0, t_in / 1.5))
                zoom = 1.0 + 0.5 * x
                focus = ((last[0][0] + last[1][0]) / 2, (last[0][1] + last[1][1]) / 2)
            if sh['type'] == 'game':
                pw, ph, px0, py0 = 768, 768, 70, 110
                dr.rectangle([px0 - 12, py0 - 12, px0 + pw + 12, py0 + ph + 34], fill=(38, 40, 36))
                bim = render_board(board, last, check_sq, t_in, cap_at, cap_t, pw, ph, zoom, focus, sq=96, coords=True)
                im.paste(bim, (px0, py0))
                dr = ImageDraw.Draw(im)
                if w1 > w0 and t_in < 1.0:
                    thinker = 'КВЕНЯ ДУМАЕТ' if idx % 2 == 0 else 'ФЕРЗЬ-3000 ДУМАЕТ'
                    dots = '.' * (1 + int(t_in * 3) % 3)
                    dr.rectangle([px0 + 150, py0 + ph - 74, px0 + pw - 150, py0 + ph - 22], fill=(14, 14, 16))
                    dr.text((px0 + pw / 2, py0 + ph - 48), thinker + dots, font=f_mid, anchor='mm', fill=(240, 230, 170))
                # правая панель
                px = 900
                dr.rectangle([px, 98, W - 40, 912], fill=(30, 32, 30))
                dr.rectangle([px, 98, px + 6, 912], fill=LAV)
                dr.text((px + 26, 106), 'КВЕНЯ · играет белыми', font=f_mid, fill=(240, 240, 235))
                dr.text((px + 26, 158), 'ФЕРЗЬ-3000 · чёрные, спарринг-скрипт', font=f_sm, fill=(190, 190, 185))
                dr.text((px + 26, 202), 'ПОСЛЕДНИЕ ХОДЫ', font=f_hud, fill=(170, 170, 165))
                for li, m in enumerate(moves[max(0, idx - 8):idx]):
                    yy = 238 + li * 30
                    num = (m['n'] + 1) // 2
                    pre = f'{num}.' if m['side'] == 'w' else '   …'
                    col = (235, 235, 228) if m['side'] == 'w' else (226, 160, 130)
                    dr.text((px + 30, yy), pre + m['san'], font=f_hud, fill=col)
                ey = 510
                got = [m['cap'] for m in moves[:idx] if m['side'] == 'w' and m['cap']]
                lost = [m['cap'] for m in moves[:idx] if m['side'] == 'b' and m['cap']]
                dr.text((px + 26, ey), 'КВЕНЯ СЪЕЛА:', font=f_hud, fill=(170, 170, 165))
                for i2, p in enumerate(got):
                    dr.text((px + 210 + i2 * 34, ey - 6), GLYPH[p], font=f_piece, fill=(60, 56, 54), stroke_width=2, stroke_fill=(230, 230, 224))
                dr.text((px + 26, ey + 46), 'КВЕНЯ ОТДАЛА:', font=f_hud, fill=(170, 170, 165))
                for i2, p in enumerate(lost):
                    dr.text((px + 230 + i2 * 34, ey + 40), GLYPH[p], font=f_piece, fill=(248, 248, 244), stroke_width=2, stroke_fill=(30, 30, 30))
                mat = mv['mat'] if mv else 0.0
                ey2 = ey + 110
                dr.text((px + 26, ey2), f'ОЦЕНКА: {mat:+.1f} в пользу Квени', font=f_hud, fill=(220, 220, 214))
                bw = 700
                dr.rectangle([px + 26, ey2 + 36, px + 26 + bw, ey2 + 62], fill=(70, 40, 38))
                half = bw / 2
                fillw = max(-half, min(half, mat / 25.0 * half))
                x0 = px + 26 + half
                dr.rectangle([min(x0, x0 + fillw), ey2 + 36, max(x0, x0 + fillw), ey2 + 62], fill=(110, 163, 220))
                dr.line([(x0, ey2 + 32), (x0, ey2 + 66)], fill=(230, 230, 224), width=3)
                rw = 340
                rx0, ry0 = W - rw - 60, 940 - rw
                ri = int(min(n_rat - 1, tau * 12.5))
                dr.rectangle([rx0 - 4, ry0 - 4, rx0 + rw + 4, ry0 + rw + 4], outline=(18, 18, 20), width=4)
                im.paste(rat_frame(ri, rw), (rx0, ry0))
                dr = ImageDraw.Draw(im)
                dr.rectangle([rx0 - 4, ry0 - 36, rx0 + 268, ry0 - 4], fill=(18, 18, 20))
                dr.text((rx0 + 6, ry0 - 32), 'ЗУЗА · маскот канала комментирует', font=f_sm, fill=(232, 228, 216))
                hud(dr, tau)
                subs(dr, seg)
            else:
                pw, ph, px0, py0 = 940, 940, 60, 70
                bim = render_board(board, last, check_sq, t_in, cap_at, cap_t, pw, ph, zoom, focus, sq=110)
                im.paste(bim, (px0, py0))
                dr = ImageDraw.Draw(im)
                dr.rectangle([px0 - 6, py0 - 6, px0 + pw + 6, py0 + ph + 6], outline=(240, 240, 235), width=6)
                dr.rectangle([px0 + 20, py0 + 20, px0 + 420, py0 + 84], fill=(180, 40, 32))
                dr.text((px0 + 40, py0 + 52), 'ПОВТОР · замедленно', font=f_mid, anchor='lm', fill=(250, 250, 245))
                dr.text((px0 + pw + 40, 140), 'КВЕНЯ ИГРАЕТ', font=f_big, fill=(240, 240, 235))
                dr.text((px0 + pw + 40, 230), 'Зуза комментирует', font=f_mid, fill=LAV)
                dr.text((px0 + pw + 40, 320), 'каждый ход партии —', font=f_sub, fill=(200, 200, 195))
                dr.text((px0 + pw + 40, 360), 'без перемоток', font=f_sub, fill=(200, 200, 195))
                mvno = (idx + 1) // 2 + (1 if idx % 2 else 0)
                dr.text((px0 + pw + 40, 440), f'ХОД {min(41, mvno)}/41', font=f_mid, fill=(240, 230, 180))
                hud(dr, tau)
        elif sh['type'] == 'verdict':
            dr.rectangle([0, 0, W, H], fill=(10, 10, 12))
            fb = parse_fen(moves[-1]['fen'])
            bim = render_board(fb, None, None, None, None, None, 620, 620, 1.0, None, sq=77)
            im.paste(bim, (70, 170))
            dr = ImageDraw.Draw(im)
            dr.rectangle([64, 164, 696, 796], outline=(60, 62, 58), width=4)
            dr.text((70, 120), 'ФИНАЛЬНАЯ ПОЗИЦИЯ · МАТ', font=f_hud, fill=(200, 200, 195))
            cx0 = 760
            dr.rectangle([cx0, 150, W - 60, 860], fill=(20, 22, 20))
            dr.rectangle([cx0, 150, W - 60, 160], fill=LAV)
            dr.text((cx0 + 40, 210), 'ПОБЕДА КВЕНИ · 41 ХОД', font=f_big, fill=(240, 240, 235))
            dr.text((cx0 + 40, 300), 'ФЕРЗЬ-3000 матован ферзём на f7', font=f_mid, fill=(200, 200, 195))
            dr.text((cx0 + 40, 380), '16 шахов · 13 взятий · один конь-герой', font=f_sub, fill=(214, 214, 206))
            dr.text((cx0 + 40, 430), 'и один гуляющий король', font=f_sub, fill=(214, 214, 206))
            dr.text((cx0 + 40, 500), 'Вся партия записана без перемоток,', font=f_sub, fill=(190, 190, 185))
            dr.text((cx0 + 40, 540), 'каждый ход прокомментирован', font=f_sub, fill=(190, 190, 185))
            dr.text((cx0 + 40, 610), 'Играла Квеня · Комментировала Зуза, маскот канала', font=f_sub, fill=LAV)
            dr.text((cx0 + 40, 675), 'Игра из чужого репозитория: chess.js, Jeff Hlywa,', font=f_sub, fill=(178, 178, 172))
            dr.text((cx0 + 40, 710), 'BSD-2-Clause · github.com/jhlywa/chess.js · спасибо, Джеф!', font=f_sub, fill=(178, 178, 172))
            dr.text((cx0 + 40, 775), 'До следующего стрима. Сыр не забудьте.', font=f_mid, fill=(230, 226, 214))
            hud(dr, tau)
            subs(dr, tl[-2])
        # МАТ-штамп и конфетти в конце последнего гейм-шота и в вердикте? только в s13
        if sh['type'] == 'game' and sh['seg']['key'] == 'L13' and lt > sh['dur'] - 6.0:
            stamp = Image.new('RGBA', (700, 260), (0, 0, 0, 0))
            sd = ImageDraw.Draw(stamp)
            sd.text((350, 130), 'МАТ!', font=font(170, True), anchor='mm', fill=(236, 66, 54, 255), stroke_width=8, stroke_fill=(250, 248, 240, 255))
            stamp = stamp.rotate(-8, expand=True)
            im.paste(stamp, (W // 2 - stamp.width // 2 - 200, 300), stamp)
            dr = ImageDraw.Draw(im)
            for cx, cy, ck in conf:
                yy = (cy + tau * 160) % H
                dr.ellipse([cx, yy, cx + 8, yy + 8], fill=[(240, 200, 90), (154, 123, 255), (110, 163, 220)][ck])
        ff.stdin.write(im.tobytes())
    ff.stdin.close()
    ff.wait()
    print('video_silent.mp4 done', nframes, 'frames', flush=True)
    mix_audio(edl, total, moves)


def mix_audio(edl, total, moves):
    n = int(total * SR)
    mix = np.zeros(n, dtype=np.float32)

    def add_wav(path, t0, vol=1.0):
        with wave.open(path) as w:
            raw = w.readframes(w.getnframes())
            sr = w.getframerate()
        a = np.frombuffer(raw, dtype=np.int16).astype(np.float32) / 32768.0
        if sr != SR:
            a = np.interp(np.linspace(0, len(a) - 1, int(len(a) * SR / sr)), np.arange(len(a)), a)
        i0 = int(t0 * SR)
        i1 = min(n, i0 + len(a))
        if i1 > i0:
            mix[i0:i1] += a[:i1 - i0] * vol

    def blip(t0, f0, dur, vol, decay=14.0):
        i0 = int(t0 * SR)
        tt = np.arange(int(dur * SR)) / SR
        s = np.sin(2 * np.pi * f0 * tt) * np.exp(-tt * decay)
        i1 = min(n, i0 + len(s))
        if i1 > i0:
            mix[i0:i1] += s[:i1 - i0] * vol

    def whoosh(t0):
        i0 = int(t0 * SR)
        tt = np.arange(int(0.4 * SR)) / SR
        nz = np.random.default_rng(int(t0 * 100)).standard_normal(len(tt)).astype(np.float32)
        k = np.ones(240, dtype=np.float32) / 240
        sm = np.convolve(nz, k, 'same')
        env = np.sin(np.pi * np.clip(tt / 0.4, 0, 1)) ** 2
        s = sm * env * 0.5
        i1 = min(n, i0 + len(s))
        if i1 > i0:
            mix[i0:i1] += s[:i1 - i0] * 0.22

    seg_start = {}
    for sh in edl:
        if sh['type'] in ('cutaway', 'game') and sh.get('seg'):
            seg_start.setdefault(sh['seg']['i'], sh['start'])
    for i, st in seg_start.items():
        add_wav(os.path.join(AUDIO, f'k{i + 1:02d}.wav'), st + 0.15)
    for sh in edl:
        if sh['type'] in ('chapter', 'cutaway', 'replay'):
            whoosh(sh['start'])
        if sh['type'] == 'game':
            seg = sh['seg']
            w0, w1 = seg['win']
            pace = sh['dur'] / max(0.001, w1 - w0)
            for p in range(max(1, int(w0) + (1 if w0 == int(w0) else 0)), min(len(moves), int(w1)) + 1):
                vt = sh['start'] + (p - w0) * pace
                m = moves[p - 1]
                blip(vt, 1500, 0.05, 0.05, decay=60)
                if m['cap']:
                    blip(vt + 0.05, 150, 0.22, 0.16, decay=12)
                if m['check']:
                    blip(vt + 0.05, 880, 0.18, 0.10, decay=10)
                if m['mate']:
                    for k, f in enumerate((523, 659, 784, 1046, 1318)):
                        blip(vt + 0.15 + k * 0.12, f, 0.5, 0.12, decay=4)
        if sh['type'] == 'replay':
            w0, w1 = sh['win']
            for p in range(int(w0) + 1, int(w1) + 1):
                vt = sh['start'] + (p - w0) * sh['pace']
                blip(vt, 900, 0.06, 0.04, decay=50)
    rng = np.random.default_rng(3)
    mix += rng.standard_normal(n).astype(np.float32) * 0.004
    peak = np.max(np.abs(mix)) or 1.0
    mix = mix / peak * 0.86
    with wave.open(os.path.join(BUILD, 'mix.wav'), 'wb') as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes((mix * 32767).astype(np.int16).tobytes())
    subprocess.run([FFMPEG, '-y', '-i', os.path.join(HERE, 'video_silent.mp4'), '-i', os.path.join(BUILD, 'mix.wav'),
                    '-filter_complex', '[1:a]loudnorm=I=-14:TP=-1.5:LRA=11[a]', '-map', '0:v', '-map', '[a]',
                    '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-shortest',
                    os.path.join(HERE, 'kvenya_chess_letsplay.mp4')], check=True, capture_output=True)
    print('kvenya_chess_letsplay.mp4 done', flush=True)


if __name__ == '__main__':
    main()
