"""One-off official Minecraft Classic experiment; not the networkless bridge.

Browser routing is not a network firewall and Docker is not a security boundary.
Run only on an ephemeral dedicated host with no secrets, never on a personal host.
"""
import os
import shutil
import subprocess
import time
import uuid
from pathlib import Path
from gameplay_bridge import BrowserBridge, IMAGE


def minecraft_command(name: str) -> list[str]:
    import re
    if not re.fullmatch(r'games-bridge-[a-f0-9]{32}', name):
        raise ValueError('Invalid container name')
    return ['docker','run','--rm','-i','--name',name,'--network','bridge','--read-only',
            '--cap-drop','ALL','--security-opt','no-new-privileges','--pids-limit','256',
            '--memory','2g','--cpus','2','--user',f'{os.getuid()}:{os.getgid()}',
            '--tmpfs','/tmp:rw,nosuid,nodev,size=512m','--shm-size','256m',
            '--entrypoint','node',IMAGE,'/runner/minecraft_bridge.cjs']


class MinecraftBridge(BrowserBridge):
    def __init__(self):
        if shutil.which('docker') is None:
            raise RuntimeError('Docker is required on an ephemeral host')
        self.name = 'games-bridge-' + uuid.uuid4().hex
        self.process = subprocess.Popen(minecraft_command(self.name), stdin=subprocess.PIPE,
                                        stdout=subprocess.PIPE, stderr=subprocess.DEVNULL, bufsize=0)
        self.record_dir = None
        self.recording_finalized = False
        self.buffer = b''
        self.started = time.monotonic()
