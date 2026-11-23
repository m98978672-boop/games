"""Experiment-only survival pause while the vision model chooses an action.

Escape is sent through the normal game input; this is external assistance, not
an agent action or a realtime playthrough. Diagnostics are untrusted and the
probe aborts if the expected transitions are missing. A paused recording may
contain pause menus and cannot be treated as uninterrupted real-time play.
"""
from __future__ import annotations

import math
import time


def _state(obs, expected):
    state = obs.get('voxel_telemetry') if isinstance(obs, dict) else None
    if not isinstance(state, dict) or state.get('screen') != expected:
        raise RuntimeError('Game did not report expected pause transition')
    for key in ('health', 'x', 'y', 'z'):
        value = state.get(key)
        if type(value) not in (int, float) or not math.isfinite(value):
            raise RuntimeError('Invalid pause telemetry')
    if not 0 <= state['health'] <= 20:
        raise RuntimeError('Invalid pause health')
    return state


def decide_with_game_paused(bridge, agent, png, step, observation, *, clock=time.monotonic):
    """Pause using Escape, infer on the pre-pause image, then resume safely.

    Returns (action, next bridge step, measured inference seconds). Exceptions
    leave the game paused or abort the probe; no action is executed on failure.
    """
    before = _state(observation, 'playing')
    if before['health'] <= 4:
        raise RuntimeError('Critical health before pause')
    pause = bridge.step({'keys':['Escape'], 'duration_ms':100})
    paused = _state(pause, 'pause')
    expected_step = observation.get('step')
    if type(expected_step) is not int or pause.get('step') != expected_step + 1:
        raise RuntimeError('Out-of-order pause observation')
    if paused['health'] < before['health'] or paused['health'] <= 4:
        raise RuntimeError('Health fell while pausing; stale observation discarded')
    displacement = math.sqrt(sum((paused[k] - before[k]) ** 2 for k in ('x', 'y', 'z')))
    if displacement > .5:
        raise RuntimeError('Player moved during pause; stale observation discarded')
    start = clock()
    action = agent(png, step)
    elapsed = clock() - start
    if not math.isfinite(elapsed) or not 0 <= elapsed <= 3600:
        raise RuntimeError('Invalid model inference duration')
    resumed = bridge.step({'keys':['Escape'], 'duration_ms':100})
    playing = _state(resumed, 'playing')
    if resumed.get('step') != expected_step + 2:
        raise RuntimeError('Out-of-order resume observation')
    if playing['health'] < paused['health'] or playing['health'] <= 4:
        raise RuntimeError('Health fell while resuming; stale action discarded')
    return action, resumed, elapsed


def summarize_performance(trace):
    """Report only observed values, never infer a graphics bottleneck from FPS."""
    import statistics
    def values(key):
        return [row[key] for row in trace if type(row.get(key)) in (int, float)
                and math.isfinite(row[key]) and 0 <= row[key] <= 3600]
    fps, inference = values('game_reported_fps'), values('model_inference_seconds')
    return {'fps_samples':len(fps), 'median_game_reported_fps':round(statistics.median(fps),2) if fps else None,
            'inference_samples':len(inference), 'median_inference_seconds':round(statistics.median(inference),2) if inference else None}
