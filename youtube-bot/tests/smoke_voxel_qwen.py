"""Private Kvenya probe of an independent Minecraft-like game, no training/upload."""
import base64
import io
import json
import math
import os
import sys
from pathlib import Path
from PIL import Image, ImageChops, ImageStat
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from gameplay_bridge import BrowserBridge
from gameplay_qwen import QwenVisionAgent
from voxel_supervisor import assess, assisted_actions, target_assistance, exploration_assistance, initial_tree_approach

root = Path(os.environ['VOXEL_GAME_DIST'])
base_goal = 'Get wood in survival: find a tree, aim at its trunk and use MINE to hold left click. WASD actions move, LOOK actions turn, SPACE jumps. Stay safe.'
agent = QwenVisionAgent(base_goal,
                        ('FORWARD','BACK','STRAFELEFT','STRAFERIGHT','SPACE','LOOKLEFT','LOOKRIGHT','LOOKUP','LOOKDOWN','MINE','WAIT'), avoid_stalled_actions=True)
base_actions=agent.allowed
trace=[]
interventions=[]
stop_reason='step_limit'
with BrowserBridge(root, rights_acknowledged=True, telemetry='voxel', bootstrap='voxel') as bridge:
    # Bootstrap is scripted setup, not a model action or rights clearance.
    obs=bridge.receive(timeout=180)
    for step in range(48):
        if obs.get('type') != 'observation' or obs.get('step') != step:
            raise RuntimeError('Invalid observation')
        before=obs.get('voxel_telemetry')
        orientation_before=obs.get('voxel_orientation')
        supervision = assess(before, trace)
        if supervision['decision'] == 'stop':
            stop_reason=supervision['reason']
            event={'step':step,'type':'stop','reason':stop_reason}
            interventions.append(event)
            print('VOXEL_SUPERVISOR='+json.dumps(event), flush=True)
            break
        if supervision['hint']:
            event={'step':step,'type':'hint','reason':supervision['reason']}
            interventions.append(event)
            print('VOXEL_SUPERVISOR='+json.dumps(event), flush=True)
        agent.allowed, excluded = assisted_actions(base_actions, trace, supervision['reason'])
        if excluded:
            event={'step':step,'type':'action_exclusion','actions':excluded}
            interventions.append(event)
            print('VOXEL_SUPERVISOR='+json.dumps(event), flush=True)
        # Diagnostic-assisted experiment: the game, not Qwen's vision, tells
        # us whether the crosshair currently hits a log; no state is modified.
        target = obs.get('voxel_target')
        agent.allowed, target_excluded, target_hint = target_assistance(agent.allowed, target, health=before['health'])
        if target_excluded:
            interventions.append({'step':step,'type':'target_action_exclusion','actions':target_excluded})
        agent.allowed, explore_excluded, explore_hint = exploration_assistance(agent.allowed, trace, target) if before['health'] > 8 else (agent.allowed, (), None)
        if explore_excluded:
            interventions.append({'step':step,'type':'exploration_action_exclusion','actions':explore_excluded})
        agent.allowed, approach_excluded, approach_hint = initial_tree_approach(agent.allowed, trace, target, health=before['health'])
        if approach_hint:
            interventions.append({'step':step,'type':'scripted_initial_approach', 'forced_action':'FORWARD'})
            print('VOXEL_SUPERVISOR='+json.dumps(interventions[-1]), flush=True)
        agent.objective=base_goal + ' ' + (approach_hint or explore_hint or target_hint)
        if supervision['hint'] and len(agent.objective) + len(supervision['hint']) + 1 <= 300:
            agent.objective += ' ' + supervision['hint']
        png=base64.b64decode(obs['screenshot_png_base64'], validate=True)
        action=agent(png, step)
        obs=bridge.step(action)
        if obs.get('type') != 'observation' or obs.get('step') != step+1:
            raise RuntimeError('Invalid action response')
        after=obs.get('voxel_telemetry')
        orientation_after=obs.get('voxel_orientation')
        camera_delta = None
        if orientation_before and orientation_after:
            camera_delta=round(math.hypot(orientation_after['yaw']-orientation_before['yaw'], orientation_after['pitch']-orientation_before['pitch']), 5)
        after_png=base64.b64decode(obs['screenshot_png_base64'], validate=True)
        with Image.open(io.BytesIO(png)) as a, Image.open(io.BytesIO(after_png)) as b:
            delta=sum(ImageStat.Stat(ImageChops.difference(a.convert('RGB'),b.convert('RGB'))).mean)/3
        distance=None
        if before and after:
            distance=round(math.sqrt(sum((after[k]-before[k])**2 for k in ('x','y','z'))),3)
        if after and after.get('wood'):
            stop_reason='game_reported_wood_obtained'
        trace.append({'action':agent.decisions[-1], 'game_reported_target_before':target, 'game_reported_screen':after.get('screen') if after else None,
                      'game_reported_displacement':distance,'game_reported_camera_delta':camera_delta,'game_reported_health':after.get('health') if after else None, 'game_reported_hunger':after.get('hunger') if after else None,'game_reported_wood':after.get('wood') if after else None,'coarse_frame_change':round(delta,2)})
        print('VOXEL_STEP='+json.dumps({'step':step+1, **trace[-1]}), flush=True)
        if stop_reason == 'game_reported_wood_obtained': break
result={'game':'Independent Minecraft Web Recreation, not Minecraft', 'source':'https://github.com/nightdong/minecraft-web-recreation',
        'commit':'85f63c01a5b67120badc57e70115a7644c361679', 'model_variant':'home-adapter',
        'setup':'scripted survival world setup via UI', 'model_actions':trace, 'filtered_steps':agent.filtered_steps, 'supervisor_interventions':interventions, 'stop_reason':stop_reason,
        'telemetry_is_untrusted_game_report':True,'world_entered_verified':False,'victory_verified':False,
        'recorded':False,'trained':False,'published':False}
print('::notice title=Kvenya independent voxel survival test::'+json.dumps(result))

summary={'steps':len(trace),'stop_reason':stop_reason,'hint_count':sum(i['type']=='hint' for i in interventions),
         'assisted_action_exclusions':sum(i['type']=='action_exclusion' for i in interventions),
         'filtered_steps':agent.filtered_steps,'last_action':trace[-1] if trace else None,
         'exploration_action_exclusions':sum(i['type']=='exploration_action_exclusion' for i in interventions),
         'scripted_initial_approach_steps':sum(i['type']=='scripted_initial_approach' for i in interventions),
         'target_help':True, 'target_action_exclusions':sum(i['type']=='target_action_exclusion' for i in interventions),
         'log_target_observations':sum(t['game_reported_target_before']=='log' for t in trace),
         'look_actions':sum(t['action'].startswith('LOOK') for t in trace),
         'look_actions_with_game_reported_rotation':sum(t['action'].startswith('LOOK') and t['game_reported_camera_delta'] is not None and t['game_reported_camera_delta'] > 0.001 for t in trace),
         'game_reported_wood_obtained':stop_reason == 'game_reported_wood_obtained', 'victory_verified':False,'trained':False,'published':False}
print('::notice title=Kvenya survival supervision summary::'+json.dumps(summary))
