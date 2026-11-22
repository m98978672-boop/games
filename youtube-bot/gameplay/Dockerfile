# Experimental recorder. Build on a trusted isolated host; do not give it secrets.
# The version of Playwright must match the browser bundled in this image.
FROM mcr.microsoft.com/playwright:v1.51.1-noble
WORKDIR /runner
RUN npm install --omit=dev --no-audit --no-fund playwright@1.51.1
COPY solver2048.cjs simulator2048.cjs play2048.cjs browser_bridge.cjs ./
ENV HOME=/tmp
ENTRYPOINT ["node", "/runner/play2048.cjs"]
