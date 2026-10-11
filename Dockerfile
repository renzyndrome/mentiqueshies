# Quest Respond: one Bun process serves /api and the built client.
# Build context = repo root. Dokploy: Build Type "Dockerfile", port 3000, volume at /data.

FROM oven/bun:1.3-slim AS build
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile
COPY . .
RUN bun run build

FROM oven/bun:1.3-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production \
    PORT=3000 \
    DATA_DIR=/data
# Runtime needs only the server dependencies (hono, zod). The client is prebuilt in dist/.
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile --production && rm -rf /root/.bun/install/cache
COPY server ./server
COPY shared ./shared
COPY --from=build /app/dist ./dist
# A named volume mounted at /data inherits this ownership on first use.
RUN mkdir -p /data && chown -R bun:bun /data
USER bun
VOLUME ["/data"]
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD ["bun", "-e", "fetch('http://127.0.0.1:' + (process.env.PORT || 3000) + '/api/health').then((r) => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"]
CMD ["bun", "server/index.ts"]
