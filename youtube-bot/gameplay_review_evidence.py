"""Evidence and release gate for private voiced voxel gameplay reviews.

All telemetry is a report from the game, not independent verification. This
module never calls a game bug from a lack of agent progress and never pads a
recording to meet a duration requirement. Passing is necessary, not sufficient:
rights, factual accuracy and subjective voice quality still need review.
"""
from __future__ import annotations

import math
from typing import Any


def _number(value: Any) -> bool:
    return type(value) in (float, int) and math.isfinite(value)


def session_evidence(report: dict[str, Any]) -> dict[str, Any]:
    if (not isinstance(report, dict) or report.get('recorded') is not True
            or report.get('published') is not False or report.get('trained') is not False):
        raise ValueError('Expected a recorded, unpublished, untrained session')
    steps = report.get('model_actions')
    if not isinstance(steps, list) or not 1 <= len(steps) <= 1000:
        raise ValueError('Missing bounded model action observations')
    previous = -1
    turns = 0
    log_seen = 0
    assisted = 0
    timestamps = []
    wood = False
    unknown_target = 0
    missing_wood = 0
    for index, step in enumerate(steps, 1):
        if not isinstance(step, dict) or type(step.get('step')) is not int or step['step'] != index:
            raise ValueError('Invalid action sequence')
        ms = step.get('recording_elapsed_ms')
        if type(ms) is not int or ms < 0 or ms <= previous:
            raise ValueError('Invalid action clock')
        previous = ms
        timestamps.append(ms)
        action = step.get('action')
        if not isinstance(action, str) or action not in {
            'FORWARD', 'BACK', 'STRAFELEFT', 'STRAFERIGHT', 'SPACE',
            'LOOKLEFT', 'LOOKRIGHT', 'LOOKUP', 'LOOKDOWN', 'MINE', 'WAIT',
        }:
            raise ValueError('Invalid action')
        delta = step.get('game_reported_camera_delta')
        if delta is not None and (not _number(delta) or not 0 <= delta < 1_000_000):
            raise ValueError('Invalid camera observation')
        if action.startswith('LOOK') and delta is not None and delta > .001:
            turns += 1
        target = step.get('game_reported_target_before')
        if target not in ('log', 'other', 'none', 'unknown', None):
            raise ValueError('Invalid target observation')
        log_seen += target == 'log'
        unknown_target += target in ('unknown', None)
        was_assisted = step.get('scripted_initial_approach')
        if type(was_assisted) is not bool:
            raise ValueError('Missing assistance marker')
        assisted += was_assisted
        got_wood = step.get('game_reported_wood')
        if got_wood is not None and type(got_wood) is not bool:
            raise ValueError('Invalid wood observation')
        wood = wood or got_wood is True
        missing_wood += got_wood is None
    intervention_events = report.get('supervisor_interventions')
    if not isinstance(intervention_events, list):
        raise ValueError('Missing intervention log')
    return {'steps':len(steps), 'first_action_ms':timestamps[0], 'last_action_ms':timestamps[-1],
            'game_reported_rotations':turns, 'game_reported_log_targets':log_seen,
            'game_reported_wood':wood, 'unknown_target_observations':unknown_target,
            'missing_wood_observations':missing_wood, 'scripted_actions':assisted,
            'supervisor_interventions':len(intervention_events),
            'bug_verified':False, 'outcome':str(report.get('stop_reason', 'unknown'))}


def spoken_review(evidence: dict[str, Any]) -> str:
    """Conservative, deterministic summary; not a verified personal opinion."""
    parts = ['Итог: мы использовали внешние подсказки и ограничения действий.']
    if evidence['game_reported_rotations']:
        parts.append('Плюс: по диагностике игры камера поворачивалась.')
    if evidence['game_reported_wood']:
        parts.append('Игра сообщила о получении дерева, но это не подтверждает прохождение.')
    elif not evidence['game_reported_log_targets'] and not evidence['unknown_target_observations']:
        parts.append('Ограничение опыта: ближайший ствол и добыча дерева не подтверждены.')
    elif evidence['game_reported_log_targets']:
        parts.append('Ствол был отмечен диагностикой игры, но получение дерева не подтверждено.')
    else:
        parts.append('Диагностики недостаточно, чтобы судить о стволах или добыче дерева.')
    if evidence['outcome'] == 'game_reported_death':
        parts.append('Игра сообщила о гибели.')
    parts.append('Баг не подтверждён: застревание агента не доказывает ошибку игры.')
    return ' '.join(parts)


def release_gate(evidence: dict[str, Any], voiced: dict[str, Any]) -> list[str]:
    """Return blockers rather than padding, fabricating claims or publishing."""
    blockers = []
    duration = voiced.get('duration_seconds')
    gap = voiced.get('max_silence_seconds')
    speech = voiced.get('spoken_seconds')
    if not _number(duration) or not 420 <= duration <= 3600:
        blockers.append('video_shorter_than_seven_minutes_or_invalid')
    if not _number(gap) or gap > 25 or gap < 0:
        blockers.append('long_silence_or_invalid_measurement')
    if not _number(speech) or not _number(duration) or not 0 < speech <= duration or speech < duration * .35:
        blockers.append('insufficient_measured_narration')
    if evidence['steps'] < 8 or evidence['last_action_ms'] - evidence['first_action_ms'] < 420_000:
        blockers.append('insufficient_observed_gameplay_span')
    if _number(duration) and evidence['last_action_ms'] / 1000 > duration + 2:
        blockers.append('action_clock_does_not_match_video')
    # A private mechanical action recap is not a full independently verified review.
    blockers.append('rights_fact_and_editorial_review_required')
    return blockers
