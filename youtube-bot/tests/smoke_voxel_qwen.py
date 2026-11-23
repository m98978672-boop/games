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

root = Path(os.environ['VOXEL_GAME_DIST'])
agent = QwenVisionAgent('Survival world: try walking to explore. FORWARD is W, BACK is S, STRAFELEFT is A, STRAFERIGHT is D, SPACE jumps, WAIT does nothing.',
                        ('FORWARD','BACK','STRAFELEFT','STRAFERIGHT','SPACE','WAIT'), avoid_stalled_actions=True)
trace=[]
with BrowserBridge(root, rights_acknowledged=True, telemetry='voxel', bootstrap='voxel') as bridge:
    # Bootstrap is scripted setup, not a model action or rights clearance.
    obs=bridge.receive(timeout=180)
    for step in range(12):
        if obs.get('type') != 'observation' or obs.get('step') != step:
            raise RuntimeError('Invalid observation')
        before=obs.get('voxel_telemetry')
        png=base64.b64decode(obs['screenshot_png_base64'], validate=True)
        action=agent(png, step)
        obs=bridge.step(action)
        if obs.get('type') != 'observation' or obs.get('step') != step+1:
            raise RuntimeError('Invalid action response')
        after=obs.get('voxel_telemetry')
        after_png=base64.b64decode(obs['screenshot_png_base64'], validate=True)
        with Image.open(io.BytesIO(png)) as a, Image.open(io.BytesIO(after_png)) as b:
            delta=sum(ImageStat.Stat(ImageChops.difference(a.convert('RGB'),b.convert('RGB'))).mean)/3
        distance=None
        if before and after:
            distance=round(math.sqrt(sum((after[k]-before[k])**2 for k in ('x','y','z'))),3)
        trace.append({'action':agent.decisions[-1], 'game_reported_screen':after.get('screen') if after else None,
                      'game_reported_displacement':distance,'coarse_frame_change':round(delta,2)})
result={'game':'Independent Minecraft Web Recreation, not Minecraft', 'source':'https://github.com/nightdong/minecraft-web-recreation',
        'commit':'85f63c01a5b67120badc57e70115a7644c361679', 'model_variant':'home-adapter',
        'setup':'scripted survival world setup via UI', 'model_actions':trace, 'filtered_steps':agent.filtered_steps,
        'telemetry_is_untrusted_game_report':True,'world_entered_verified':False,'victory_verified':False,
        'recorded':False,'trained':False,'published':False}
print('::notice title=Kvenya independent voxel survival test::'+json.dumps(result))
