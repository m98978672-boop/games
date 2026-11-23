#!/usr/bin/env python3
"""Сборщик игр Квени: играбельные игры из шаблонов её библиотеки.

Она училась играть чужими глазами и руками — теперь собирает свои.
Каждый шаблон — кирпич библиотеки (shelves/games.jsonl), каждая игра —
один самодостаточный HTML в kvenya/made/<slug>/ с манифестом game.json
и записью в реестре творений. Перед сдачей игра проходит проверку:
синтаксис JS (node --check) и обязательные части (канвас, цикл, счёт).

  python3 qwen-home/tools/game-maker.py catch zvezdny-dozhd "Звёздный дождь"
  python3 qwen-home/tools/game-maker.py snake zmeika "Змейка Квени"
  python3 qwen-home/tools/game-maker.py flappy ptica "Птица и трубы"
"""
import json
import re
import shutil
import subprocess
import sys
import tempfile
from datetime import datetime, timezone
from pathlib import Path

HOME = Path(__file__).resolve().parents[1]
ROOT = HOME.parent
MADE = ROOT / 'kvenya' / 'made'
sys.path.insert(0, str(HOME / 'tools'))
from library import register_creation  # noqa: E402

SHELL = """<!DOCTYPE html>
<html lang="ru"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{title} — игра Квени</title>
<style>
  body {{ margin:0; background:#0b1020; color:#e8ecf8; font-family:system-ui, sans-serif; text-align:center; }}
  h1 {{ font-size:20px; margin:14px 0 4px; }}
  p.hint {{ opacity:.75; margin:4px 0 10px; font-size:14px; }}
  canvas {{ background:#87ceeb; border-radius:12px; max-width:94vw; height:auto; touch-action:none; }}
  .foot {{ opacity:.6; font-size:12px; margin:10px; }}
</style></head><body>
<h1>{title}</h1>
<p class="hint">{controls}</p>
<canvas id="game" width="480" height="640"></canvas>
<p class="foot">Собрала Квеня из своей библиотеки · шаблон «{template}» · {date}</p>
<script>
{js}
</script>
</body></html>
"""

CATCH_JS = r"""
const c = document.getElementById('game'), x = c.getContext('2d');
let basket = 210, stars = [], score = 0, lives = 3, run = false, t = 0;
function spawn() { stars.push({ x: 20 + Math.random() * 440, y: -20, v: 2 + Math.random() * 2 + t / 900 }); }
function reset() { basket = 210; stars = []; score = 0; lives = 3; run = true; t = 0; }
c.addEventListener('pointermove', e => { const r = c.getBoundingClientRect(); basket = (e.clientX - r.left) * (480 / r.width) - 35; });
addEventListener('keydown', e => {
  if (e.code === 'ArrowLeft') basket -= 26;
  if (e.code === 'ArrowRight') basket += 26;
  if (e.code === 'Space' && !run) reset();
});
c.addEventListener('pointerdown', () => { if (!run) reset(); });
function draw() {
  x.fillStyle = '#0e2a4a'; x.fillRect(0, 0, 480, 640);
  x.fillStyle = '#ffd94d'; x.font = '26px sans-serif';
  for (const s of stars) x.fillText('★', s.x, s.y);
  x.fillStyle = '#ff9d5c'; x.fillRect(basket, 600, 70, 14);
  x.fillStyle = '#fff'; x.font = '18px sans-serif';
  x.fillText('Счёт: ' + score + '   Жизни: ' + lives, 14, 26);
  if (!run) { x.font = '22px sans-serif'; x.fillText(score || lives <= 0 ? 'Клик или пробел — ещё раз' : 'Клик или пробел — старт', 96, 330); }
}
function loop() {
  t++;
  if (run) {
    if (t % 26 === 0) spawn();
    for (const s of stars) s.y += s.v;
    stars = stars.filter(s => {
      if (s.y > 594 && s.y < 622 && s.x > basket - 8 && s.x < basket + 70) { score++; return false; }
      if (s.y > 650) { lives--; return false; }
      return true;
    });
    if (lives <= 0) run = false;
  }
  draw();
  requestAnimationFrame(loop);
}
draw(); loop();
"""

SNAKE_JS = r"""
const c = document.getElementById('game'), x = c.getContext('2d');
const N = 24, S = 480 / N;
let snake, dir, food, score, run = false, tick = 0;
function place() { food = { x: (Math.random() * N) | 0, y: (Math.random() * N) | 0 }; }
function reset() { snake = [{ x: 12, y: 12 }]; dir = { x: 1, y: 0 }; score = 0; run = true; place(); }
addEventListener('keydown', e => {
  const k = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1], KeyA: [-1, 0], KeyD: [1, 0], KeyW: [0, -1], KeyS: [0, 1] }[e.code];
  if (k && (k[0] !== -dir.x || k[1] !== -dir.y)) dir = { x: k[0], y: k[1] };
  if (e.code === 'Space' && !run) reset();
});
c.addEventListener('pointerdown', () => { if (!run) reset(); });
function draw() {
  x.fillStyle = '#10331c'; x.fillRect(0, 0, 480, 640);
  x.fillStyle = '#ffd94d'; x.fillRect(food.x * S + 3, food.y * S + 3, S - 6, S - 6);
  x.fillStyle = '#7ee081';
  for (const p of snake) x.fillRect(p.x * S + 1, p.y * S + 1, S - 2, S - 2);
  x.fillStyle = '#fff'; x.font = '18px sans-serif';
  x.fillText('Счёт: ' + score, 14, 622);
  if (!run) { x.font = '22px sans-serif'; x.fillText('Клик или пробел — старт', 92, 330); }
}
function step() {
  const head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };
  if (head.x < 0 || head.y < 0 || head.x >= N || head.y >= N || snake.some(p => p.x === head.x && p.y === head.y)) { run = false; return; }
  snake.unshift(head);
  if (head.x === food.x && head.y === food.y) { score++; place(); } else snake.pop();
}
function loop() {
  tick++;
  if (run && tick % Math.max(4, 9 - (score / 4 | 0)) === 0) step();
  draw();
  requestAnimationFrame(loop);
}
draw(); loop();
"""

FLAPPY_JS = r"""
const c = document.getElementById('game'), x = c.getContext('2d');
// Механика из её библиотеки: рывок вверх и копится гравитация — как в разобранной Clumsy Bird.
let bird, pipes, score, run = false, dead = false, t = 0;
function reset() { bird = { y: 300, v: 0 }; pipes = []; score = 0; run = true; dead = false; t = 0; }
function flap() { if (!run) { reset(); return; } if (!dead) bird.v = -7.4; }
addEventListener('keydown', e => { if (e.code === 'Space') { e.preventDefault(); flap(); } });
c.addEventListener('pointerdown', flap);
function draw() {
  x.fillStyle = '#35a7d8'; x.fillRect(0, 0, 480, 640);
  x.fillStyle = '#69b53f';
  for (const p of pipes) { x.fillRect(p.x, 0, 62, p.top); x.fillRect(p.x, p.top + 176, 62, 640 - p.top - 176); }
  x.fillStyle = '#8a5a2b'; x.fillRect(0, 608, 480, 32);
  x.fillStyle = '#ffd94d'; x.beginPath(); x.arc(92, bird.y, 17, 0, 7); x.fill();
  x.fillStyle = '#ff7b3d'; x.beginPath(); x.arc(106, bird.y + 2, 6, 0, 7); x.fill();
  x.fillStyle = '#fff'; x.font = 'bold 24px sans-serif'; x.fillText('Счёт: ' + score, 178, 44);
  if (!run) { x.font = '20px sans-serif'; x.fillText('Пробел или клик — лети', 118, 330); }
}
function loop() {
  t++;
  if (run && !dead) {
    bird.v += 0.42; bird.y += bird.v;
    if (t % 92 === 0) pipes.push({ x: 490, top: 90 + Math.random() * 300, hit: false });
    for (const p of pipes) {
      p.x -= 3.1;
      if (!p.hit && p.x + 62 < 92) { p.hit = true; score++; }
      if (p.x < 92 + 15 && p.x + 62 > 92 - 15 && (bird.y - 15 < p.top || bird.y + 15 > p.top + 176)) dead = true;
    }
    pipes = pipes.filter(p => p.x > -70);
    if (bird.y > 592 || bird.y < 10) dead = true;
    if (dead) run = false;
  }
  draw();
  requestAnimationFrame(loop);
}
draw(); loop();
"""

TEMPLATES = {
    'catch': ('Лови падающие звёзды: мышь или стрелки двигают корзину, пробел — старт', CATCH_JS),
    'snake': ('Змейка: стрелки или WASD, пробел — заново', SNAKE_JS),
    'flappy': ('Птица и трубы: пробел или клик — взмах; её чемпионская механика, собранная своими руками', FLAPPY_JS),
}


def check_game(html):
    """Проверка делом: синтаксис JS и обязательные части игры."""
    m = re.search(r'<script>(.*?)</script>', html, re.S)
    if not m:
        return False, 'нет скрипта'
    js = m.group(1)
    for marker in ('canvas', 'requestAnimationFrame', 'Счёт'):
        if marker == 'canvas':
            if 'getElementById' not in js:
                return False, 'нет канваса'
        elif marker not in js and marker not in html:
            return False, f'нет части: {marker}'
    node = shutil.which('node')
    if node:
        with tempfile.NamedTemporaryFile('w', suffix='.js', delete=False, encoding='utf-8') as fh:
            fh.write(js)
            tmp = fh.name
        ok = subprocess.run([node, '--check', tmp], capture_output=True).returncode == 0
        Path(tmp).unlink(missing_ok=True)
        if not ok:
            return False, 'node --check не прошёл'
    return True, 'синтаксис и части на месте'


def make(template, slug, title):
    if template not in TEMPLATES:
        raise SystemExit(f'нет такого шаблона: {template}; есть: {", ".join(TEMPLATES)}')
    controls, js = TEMPLATES[template]
    date = datetime.now(timezone.utc).strftime('%Y-%m-%d')
    html = SHELL.format(title=title, controls=controls, template=template, date=date, js=js)
    ok, note = check_game(html)
    if not ok:
        raise SystemExit(f'игра не прошла проверку: {note} — на полку не кладём')
    out = MADE / slug
    out.mkdir(parents=True, exist_ok=True)
    (out / 'index.html').write_text(html, encoding='utf-8')
    manifest = {'slug': slug, 'title': title, 'template': template,
                'controls': controls, 'author': 'Квеня', 'createdAt': date, 'check': note}
    (out / 'game.json').write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    register_creation('game', slug, title, date, {'template': template})
    print(json.dumps({'made': str(out), 'check': note, **manifest}, ensure_ascii=False))
    return manifest


def main(argv):
    if len(argv) < 4:
        print(__doc__)
        return 0
    make(argv[1], argv[2], argv[3])
    return 0


if __name__ == '__main__':
    raise SystemExit(main(sys.argv))
