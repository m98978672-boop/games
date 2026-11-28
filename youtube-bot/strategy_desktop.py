"""Bounded desktop input for an isolated 800x600 Warzone 2100 experiment.

A disposable container/VM with its own X server, no credentials and no network is
mandatory. The acknowledgement flag is NOT isolation. This module neither starts
the game nor model, records, verifies outcomes, comments nor publishes.
"""
from __future__ import annotations
import io
import re
import subprocess
import time
from typing import Any

WIDTH, HEIGHT = 800, 600
KEYS = {'escape': 'Escape', 'enter': 'Return', 'space': 'space',
        'up': 'Up', 'down': 'Down', 'left': 'Left', 'right': 'Right',
        'pause': 'Pause'}


def _point(value: Any) -> tuple[int, int]:
    if (not isinstance(value, (tuple, list)) or len(value) != 2
        or any(type(x) is not int for x in value)
        or not 0 <= value[0] < WIDTH or not 0 <= value[1] < HEIGHT):
        raise ValueError('Coordinates must be inside the 800x600 viewport')
    return value[0], value[1]


def validate_action(action: Any) -> dict:
    if not isinstance(action, dict):
        raise ValueError('An action object is required')
    kind = action.get('type')
    if kind == 'click' and set(action) == {'type', 'at', 'button'}:
        point = _point(action['at'])
        if action['button'] not in ('left', 'right'):
            raise ValueError('Invalid button')
        return {'type': kind, 'at': point, 'button': action['button']}
    if kind == 'drag' and set(action) == {'type', 'start', 'end'}:
        return {'type': kind, 'start': _point(action['start']), 'end': _point(action['end'])}
    if kind == 'key' and set(action) == {'type', 'key'} and action['key'] in KEYS:
        return {'type': kind, 'key': action['key']}
    if kind == 'wait' and set(action) == {'type'}:
        return {'type': kind}
    raise ValueError('Unsupported desktop action')


class IsolatedStrategyDesktop:
    """Input is targeted to a checked window on a dedicated, private X display."""
    def __init__(self, *, display: str, window_id: int, game_pid: int, isolation_acknowledged: bool = False):
        if isolation_acknowledged is not True:
            raise ValueError('A disposable isolated desktop is mandatory')
        if not isinstance(display, str) or not re.fullmatch(r':[1-9][0-9]{0,2}', display):
            raise ValueError('Use a dedicated local X display, not the default desktop')
        if type(window_id) is not int or window_id <= 0 or type(game_pid) is not int or game_pid <= 1:
            raise ValueError('A game window and process ID are required')
        self.window_id = window_id
        self.game_pid = game_pid
        self.env = {'DISPLAY': display, 'PATH': '/usr/bin:/bin', 'HOME': '/tmp'}
        self._verify_window()

    def _run(self, *arguments: str, capture: bool = False) -> str:
        result = subprocess.run(['xdotool', *arguments], env=self.env, check=True,
                                capture_output=True, text=True, timeout=5)
        return result.stdout.strip() if capture else ''

    def _verify_window(self) -> None:
        raw = self._run('getwindowpid', str(self.window_id), capture=True)
        if not raw.isdecimal() or int(raw) != self.game_pid:
            raise RuntimeError('Game window no longer belongs to the expected process')
        geometry = self._run('getwindowgeometry', '--shell', str(self.window_id), capture=True)
        fields = dict(line.split('=', 1) for line in geometry.splitlines() if '=' in line)
        if (fields.get('WIDTH') != str(WIDTH) or fields.get('HEIGHT') != str(HEIGHT)
                or fields.get('X') != '0' or fields.get('Y') != '0'):
            raise RuntimeError('Expected an 800x600 game window at display origin')

    def act(self, raw: Any) -> None:
        action = validate_action(raw)
        self._verify_window()
        window = str(self.window_id)
        if action['type'] == 'click':
            self._run('mousemove', '--window', window, *map(str, action['at']))
            self._run('click', '--window', window, '1' if action['button'] == 'left' else '3')
        elif action['type'] == 'drag':
            self._run('mousemove', '--window', window, *map(str, action['start']))
            self._run('mousedown', '1')
            try:
                self._run('mousemove', '--window', window, *map(str, action['end']))
            finally:
                self._run('mouseup', '1')
        elif action['type'] == 'key':
            self._run('key', '--window', window, '--clearmodifiers', KEYS[action['key']])
        else:
            time.sleep(.25)

    def screenshot(self) -> bytes:
        self._verify_window()
        from PIL import ImageGrab
        frame = ImageGrab.grab(xdisplay=self.env['DISPLAY'])
        if frame.size != (WIDTH, HEIGHT):
            raise RuntimeError('Unexpected isolated display dimensions')
        buffer = io.BytesIO()
        frame.convert('RGB').save(buffer, format='PNG')
        image = buffer.getvalue()
        if not 0 < len(image) <= 2_000_000:
            raise RuntimeError('Invalid screenshot size')
        return image
