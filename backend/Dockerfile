# ─── Stage 1: Dependencies ────────────────────────────────────────────────────
FROM node:18-alpine AS deps
WORKDIR /app

# Install only production deps first (layer caching)
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# ─── Stage 2: Builder (includes devDeps for any build step) ───────────────────
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .

# ─── Stage 3: Production image ────────────────────────────────────────────────
FROM node:18-alpine AS production
WORKDIR /app

# Security: run as non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser  -S nodeuser -u 1001

# Copy production node_modules from deps stage
COPY --from=deps    /app/node_modules ./node_modules
COPY --from=builder /app .

# Remove devDependency-related files
RUN rm -rf tests __tests__ *.test.js *.spec.js

USER nodeuser

EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD wget -qO- http://localhost:5000/health || exit 1

CMD ["node", "server.js"]
