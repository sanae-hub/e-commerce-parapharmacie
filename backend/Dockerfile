# ── Stage 1 : dépendances ────────────────────────────────────────────────────
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev

# ── Stage 2 : build (génère Prisma client) ───────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npx prisma generate

# ── Stage 3 : image finale ───────────────────────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app

RUN addgroup -S appgroup && adduser -S appuser -G appgroup

COPY --from=deps    /app/node_modules ./node_modules
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY . .
COPY docker-entrypoint.sh /docker-entrypoint.sh

RUN mkdir -p uploads/products uploads/profiles logs && \
    chown -R appuser:appgroup /app && \
    chmod +x /docker-entrypoint.sh

USER appuser

EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD wget -qO- http://localhost:5000/api/health || exit 1

CMD ["/docker-entrypoint.sh"]
