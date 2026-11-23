"""Bounded experimental survival monitor; game telemetry is untrusted.

It may pause on danger, or add an operator hint when repeated moves show no
reported progress. It never invents success, injects game state or takes actions.
"""
from __future__ import annotations
import math

SCREENS = {'playing', 'ready', 'pause', 'inventory', 'title', 'error', 'death', 'credits'}


def assess(state, recent):
    if not isinstance(state, dict) or set(state) != {'screen','x','y','z','health','hunger','wood'}:
        return {'decision':'stop', 'reason':'telemetry_missing_or_invalid', 'hint':None}
    if type(state['wood']) is not bool:
        return {'decision':'stop', 'reason':'telemetry_missing_or_invalid', 'hint':None}
    if state['screen'] not in SCREENS:
        return {'decision':'stop', 'reason':'telemetry_missing_or_invalid', 'hint':None}
    for key in ('x','y','z','health','hunger'):
        n = state[key]
        if type(n) not in (int,float) or not math.isfinite(n) or abs(n) >= 1_000_000:
            return {'decision':'stop', 'reason':'telemetry_missing_or_invalid', 'hint':None}
    if not 0 <= state['health'] <= 20 or not 0 <= state['hunger'] <= 20:
        return {'decision':'stop', 'reason':'telemetry_missing_or_invalid', 'hint':None}
    if state['screen'] != 'playing':
        return {'decision':'stop', 'reason':'game_reported_'+state['screen'], 'hint':None}
    if state['health'] <= 4:
        return {'decision':'stop', 'reason':'game_reported_critical_health', 'hint':None}
    if not isinstance(recent, list) or len(recent) > 1000:
        raise ValueError('Invalid action history')
    if state['health'] <= 8:
        return {'decision':'continue', 'reason':'game_reported_low_health',
                'hint':'Reported health is low. Avoid hazards and move cautiously; do not assume you are safe.'}
    last = recent[-3:]
    if (len(last) == 3 and last[0].get('action') in {'LOOKLEFT','LOOKRIGHT','LOOKUP','LOOKDOWN'}
            and all(x.get('action') == last[0]['action'] and type(x.get('game_reported_camera_delta')) in (int,float)
                    and math.isfinite(x['game_reported_camera_delta']) and 0 <= x['game_reported_camera_delta'] < .001 for x in last)):
        return {'decision':'continue', 'reason':'game_reported_camera_stagnation',
                'hint':'Repeated looking did not rotate the camera. Try a different direction or move toward a visible tree.'}
    if len(last) == 3 and all(x.get('action') == 'MINE' and x.get('game_reported_wood') is False for x in last):
        return {'decision':'continue', 'reason':'mining_without_wood',
                'hint':'Three mining attempts have not yielded wood yet. Look for a tree and aim at its trunk before mining again.'}
    if len(last) == 3 and all(x.get('action') in {'FORWARD','BACK','STRAFELEFT','STRAFERIGHT','SPACE'} and type(x.get('game_reported_displacement')) in (int,float) and math.isfinite(x['game_reported_displacement']) and 0 <= x['game_reported_displacement'] < .15 for x in last):
        return {'decision':'continue', 'reason':'game_reported_stagnation',
                'hint':'Recent movement did not noticeably change reported position. Try a different safe movement; screen changes alone do not prove progress.'}
    return {'decision':'continue', 'reason':'no_alert', 'hint':None}


def assisted_actions(allowed, recent, reason):
    """On measured stagnation, exclude recently ineffective moves for one decision.

    This is an external intervention, not learned policy or proof a new action works.
    """
    movement = {'FORWARD','BACK','STRAFELEFT','STRAFERIGHT','SPACE'}
    if reason == 'game_reported_camera_stagnation':
        blocked = {r.get('action') for r in recent[-3:] if r.get('action') in {'LOOKLEFT','LOOKRIGHT','LOOKUP','LOOKDOWN'}}
        remaining = tuple(a for a in allowed if a not in blocked)
        if remaining:
            return remaining, tuple(a for a in allowed if a in blocked)
    if reason == 'mining_without_wood' and 'MINE' in allowed and len(allowed) > 1:
        return tuple(a for a in allowed if a != 'MINE'), ('MINE',)
    if reason != 'game_reported_stagnation':
        return allowed, ()
    blocked = {r.get('action') for r in recent[-3:] if r.get('action') in movement}
    remaining = tuple(a for a in allowed if a not in blocked)
    if not remaining:
        return allowed, ()
    return remaining, tuple(a for a in allowed if a in blocked)
