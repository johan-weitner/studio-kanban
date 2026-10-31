FROM node:20-bookworm-slim AS frontend-builder
WORKDIR /app/frontend
ARG VITE_APP_MODE
ENV VITE_APP_MODE=$VITE_APP_MODE
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

FROM node:20-bookworm-slim AS backend-builder
RUN apt-get update \
  && apt-get install -y --no-install-recommends python3 make g++ \
  && rm -rf /var/lib/apt/lists/*
WORKDIR /app/backend
COPY backend/package*.json backend/.npmrc ./
RUN npm ci
COPY backend/ ./
RUN npm run build && npm prune --omit=dev

FROM node:20-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=8080
ENV DATABASE_URL=/data/studio-kanban.db
RUN apt-get update \
  && apt-get install -y --no-install-recommends gosu \
  && rm -rf /var/lib/apt/lists/* \
  && mkdir /data \
  && chown node:node /data
COPY --chown=node:node --from=backend-builder /app/backend/package*.json ./
COPY --chown=node:node --from=backend-builder /app/backend/node_modules ./node_modules
COPY --chown=node:node --from=backend-builder /app/backend/dist ./dist
COPY --chown=node:node --from=frontend-builder /app/frontend/dist ./public
COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint
RUN chmod +x /usr/local/bin/docker-entrypoint
EXPOSE 8080
ENTRYPOINT ["docker-entrypoint"]
CMD ["node", "dist/index.js"]
