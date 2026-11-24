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


def target_assistance(allowed, target, *, health):
    """Gate mining on the pinned game's untrusted crosshair diagnostic.

    This is privileged outside help, not the vision policy or learned knowledge.
    Unknown diagnostics fail closed for mining, rather than inventing a target.
    """
    if target not in ('log', 'other', 'none', 'unknown'):
        target = 'unknown'
    if health <= 8:
        return allowed, (), 'Reported health is low. Avoid hazards and move cautiously.'
    if target == 'log':
        return allowed, (), 'Game diagnostic reports a log at the crosshair within reach. Hold MINE to break it.'
    blocked = ('MINE',) if 'MINE' in allowed and len(allowed) > 1 else ()
    rest = tuple(a for a in allowed if a not in blocked)
    return rest, blocked, 'No reachable log reported. Find a tree, approach and aim at its trunk.'


def exploration_assistance(allowed, recent, target):
    """External one-step intervention after six looks without finding a log."""
    last = recent[-6:]
    looks = {'LOOKLEFT','LOOKRIGHT','LOOKUP','LOOKDOWN'}
    moves = {'FORWARD','BACK','STRAFELEFT','STRAFERIGHT'}
    if target == 'log' or len(last) < 6 or not all(r.get('action') in looks for r in last):
        return allowed, (), None
    remaining = tuple(a for a in allowed if a in moves)
    if not remaining:
        return allowed, (), None
    return remaining, tuple(a for a in allowed if a not in moves), (
        'Six looks found no log. Move cautiously to explore instead of continuing to look.')


def initial_tree_approach(allowed, recent, target, *, health):
    """Bounded scripted help, relying on this pinned game's spawn-facing behavior.

    Not a learned action: at most two forward moves, only before any camera turn,
    and only while healthy, without a reachable log or failed movement. The game
    may not have found a tree at spawn, so the result must be observed, not assumed.
    """
    if health <= 8 or target not in ('none', 'other') or 'FORWARD' not in allowed or len(recent) >= 2:
        return allowed, (), None
    if any(r.get('action') != 'FORWARD' or type(r.get('game_reported_displacement')) not in (int, float)
           or not math.isfinite(r['game_reported_displacement']) or r['game_reported_displacement'] < .15
           for r in recent):
        return allowed, (), None
    return ('FORWARD',), tuple(a for a in allowed if a != 'FORWARD'), (
        'Scripted experiment: cautiously approach the initial view; stop if movement fails or health falls.')


def measured_feedback(before, after, action):
    """Experimental session score; not reinforcement learning or a weight update.

    Reward only a newly reported wood milestone. Penalize measured health loss
    or repeated mining without reaching a log. Never reward mere movement or
    a changed image; telemetry is game-reported and may be wrong.
    """
    if assess(before, [])['reason'] == 'telemetry_missing_or_invalid' or assess(after, [])['reason'] == 'telemetry_missing_or_invalid':
        return {'score': 0, 'reason': 'unknown', 'hint': None}
    if after['health'] < before['health']:
        return {'score': -2, 'reason': 'health_decreased',
                'hint': 'Penalty: reported health fell. Avoid the last danger and seek a safer action.'}
    if not before['wood'] and after['wood']:
        return {'score': 10, 'reason': 'wood_reported',
                'hint': 'Bonus: the game reports wood obtained; verify the inventory before crafting.'}
    if action == 'MINE' and not after['wood']:
        return {'score': -1, 'reason': 'wood_not_reported',
                'hint': 'Penalty: this mining attempt did not yield reported wood. Recheck the target.'}
    return {'score': 0, 'reason': 'no_verified_change', 'hint': None}
