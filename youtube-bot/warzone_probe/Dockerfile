FROM ubuntu:24.04
ENV DEBIAN_FRONTEND=noninteractive
RUN apt-get update && apt-get install -y --no-install-recommends warzone2100 xvfb xdotool ffmpeg python3 python3-pil x11-utils ca-certificates && rm -rf /var/lib/apt/lists/* \
    && mkdir -p /tmp/.X11-unix && chmod 1777 /tmp/.X11-unix \
    && useradd --create-home --uid 10001 player && mkdir /out && chown player:player /out
COPY strategy_desktop.py /app/strategy_desktop.py
COPY warzone_probe/container.py /app/container.py
USER player
ENV HOME=/home/player DISPLAY=:93 LIBGL_ALWAYS_SOFTWARE=1
WORKDIR /home/player
CMD ["python3", "-u", "/app/container.py", "serve"]
