"""A coarse pixel-change diagnostic. Not evidence of an action outcome."""
import io
from PIL import Image, ImageChops, ImageStat


def compare_frames(before, after):
    frames = []
    for png in (before, after):
        if not isinstance(png, bytes) or not 0 < len(png) <= 2_000_000:
            raise ValueError('Expected a bounded PNG screenshot')
        with Image.open(io.BytesIO(png)) as im:
            if im.format != 'PNG' or im.size != (800, 600):
                raise ValueError('Expected an 800x600 PNG screenshot')
            # Exclude the lower HUD with its timer and transient messages.
            frames.append(im.convert('L').crop((0, 0, 800, 440)).resize((200,110)))
    change = ImageStat.Stat(ImageChops.difference(*frames)).mean[0]
    return {'mean_luma_delta': round(change, 3),
            'assessment': 'little_visible_change' if change < 1.5 else 'visible_change',
            'action_success_verified': False}
