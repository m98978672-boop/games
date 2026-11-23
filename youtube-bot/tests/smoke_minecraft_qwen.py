"""One-off 12-decision online Minecraft Classic probe, never publishes/trains."""
import base64
import json
import io
import os
from PIL import Image, ImageFilter, ImageChops, ImageStat
from pathlib import Path
import sys
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from gameplay_minecraft_bridge import MinecraftBridge
from gameplay_qwen import QwenVisionAgent

# Stage one is a separate operator-defined focus task. Stage two excludes clicks
# and lets the model choose movement/look actions itself; this is not training.
focus_agent = QwenVisionAgent('Focus the game by clicking the screen center.', ('INTERACT', 'WAIT'))
move_agent = QwenVisionAgent(
    'Explore the 3D scene using WASD: FORWARD walks ahead, BACK walks backwards, '
    'STRAFELEFT and STRAFERIGHT move sideways, SPACE jumps, LOOK actions turn. '
    'Choose a movement to explore. WAIT does nothing.',
    ('FORWARD', 'BACK', 'STRAFELEFT', 'STRAFERIGHT', 'SPACE', 'LOOKLEFT', 'LOOKRIGHT', 'WAIT'),
    avoid_stalled_actions=True)
actions=[]
visual_changes=[]
with MinecraftBridge() as bridge:
    obs=bridge.receive(timeout=60)
    setup = obs.get('setup')
    diagnostic = obs.get('diagnostic')
    # Highly pixelated preview only: do not retain readable world invite URLs.
    if os.environ.get('RUNNER_TEMP'):
        frame = Image.open(io.BytesIO(base64.b64decode(obs['screenshot_png_base64'], validate=True))).convert('RGB')
        preview = frame.resize((80, 60), Image.Resampling.BOX).filter(ImageFilter.GaussianBlur(1)).resize((800, 600), Image.Resampling.NEAREST)
        preview.save(Path(os.environ['RUNNER_TEMP']) / 'minecraft-pixelated-preview.png')
        # Low-resolution diagnostic, not a raw screenshot or readable invite link.
        buf = io.BytesIO()
        preview.resize((80, 60), Image.Resampling.BOX).save(buf, format='JPEG', quality=35)
        print('::notice title=Minecraft startup pixelated diagnostic::'+base64.b64encode(buf.getvalue()).decode('ascii'))
    if setup not in ('start_form_not_found', 'start_form_not_found_or_timeout', 'start_clicked_not_verified'):
        raise RuntimeError('Unexpected startup result')
    for step in range(12):
        if obs.get('type') != 'observation' or obs.get('step') != step:
            raise RuntimeError('Bad observation from online bridge')
        png=base64.b64decode(obs['screenshot_png_base64'], validate=True)
        agent = focus_agent if step == 0 else move_agent
        action=agent(png, step)
        obs=bridge.step(action)
        if obs.get('type') != 'observation' or obs.get('step') != step+1:
            raise RuntimeError('Bad action response from online bridge')
        actions.append(agent.decisions[-1])
        after_png=base64.b64decode(obs['screenshot_png_base64'], validate=True)
        with Image.open(io.BytesIO(png)) as before, Image.open(io.BytesIO(after_png)) as after:
            delta=sum(ImageStat.Stat(ImageChops.difference(before.convert('RGB'),after.convert('RGB'))).mean)/3
        visual_changes.append(round(delta, 2))
result={'source':'https://classic.minecraft.net/','model_variant':'home-adapter' if os.environ.get('QWEN_GAME_ADAPTER_PATH') else 'base',
        'setup':setup,'diagnostic':diagnostic,'actions':actions,'coarse_frame_changes':visual_changes,'stage_policy':'model focus then model movement; external stall filter removes a repeated action after two nearly unchanged screens','filtered_steps':move_agent.filtered_steps,'world_entered_verified':False,'gameplay_verified':False,'recorded':False,'trained':False,'published':False}
print('::notice title=Minecraft Classic experimental probe::'+json.dumps(result))
