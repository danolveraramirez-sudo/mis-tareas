FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production PORT=8000 DATA_DIR=/data
COPY package.json server.js ./
COPY public ./public
RUN mkdir -p /data && chown -R node:node /data
USER node
VOLUME ["/data"]
EXPOSE 8000
HEALTHCHECK --interval=30s --timeout=5s --retries=3 CMD wget -qO- http://127.0.0.1:${PORT}/api/tareas >/dev/null || exit 1
CMD ["node", "server.js"]
