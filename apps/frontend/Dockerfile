# Multi-stage Dockerfile for Next.js frontend in a monorepo

# Stage 1: Build
FROM node:20-alpine AS builder
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy package configurations for monorepo resolution
COPY package.json package-lock.json ./
COPY apps/frontend/package.json ./apps/frontend/

# Install dependencies
RUN npm ci

# Copy codebase
COPY apps/frontend/ ./apps/frontend/

# Build Next.js app
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build:frontend

# Stage 2: Production runner
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy static assets and standalone server output
COPY --from=builder /app/apps/frontend/public ./apps/frontend/public
COPY --from=builder --chown=nextjs:nodejs /app/apps/frontend/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/frontend/.next/static ./apps/frontend/.next/static

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "apps/frontend/server.js"]