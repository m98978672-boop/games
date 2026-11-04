FROM node:22-alpine

ENV NODE_ENV=production PORT=4174
WORKDIR /app
COPY server.mjs index.html styles.css app.js sw.js manifest.webmanifest cover.svg README.md ./
COPY icons ./icons
USER node
EXPOSE 4174
CMD ["node", "server.mjs"]
