"""One-off 12-decision online Minecraft Classic probe, never publishes/trains."""
import base64
import json
import os
from pathlib import Path
import sys
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from gameplay_minecraft_bridge import MinecraftBridge
from gameplay_qwen import QwenVisionAgent

agent = QwenVisionAgent(
    'Minecraft Classic: try to enter the world and explore. INTERACT clicks the screen center; '
    'FORWARD moves, SPACE jumps, LOOK actions turn, INVENTORY opens blocks. '
    'Do not claim progress if the screen is unclear.',
    ('INTERACT', 'FORWARD', 'BACK', 'STRAFELEFT', 'STRAFERIGHT', 'SPACE',
     'LOOKLEFT', 'LOOKRIGHT', 'LOOKUP', 'LOOKDOWN', 'INVENTORY', 'WAIT'))
actions=[]
with MinecraftBridge() as bridge:
    obs=bridge.receive(timeout=60)
    for step in range(12):
        if obs.get('type') != 'observation' or obs.get('step') != step:
            raise RuntimeError('Bad observation from online bridge')
        png=base64.b64decode(obs['screenshot_png_base64'], validate=True)
        action=agent(png, step)
        obs=bridge.step(action)
        if obs.get('type') != 'observation' or obs.get('step') != step+1:
            raise RuntimeError('Bad action response from online bridge')
        actions.append(agent.decisions[-1])
result={'source':'https://classic.minecraft.net/','model_variant':'home-adapter' if os.environ.get('QWEN_GAME_ADAPTER_PATH') else 'base',
        'actions':actions,'world_entered_verified':False,'gameplay_verified':False,'recorded':False,'trained':False,'published':False}
print('::notice title=Minecraft Classic experimental probe::'+json.dumps(result))
