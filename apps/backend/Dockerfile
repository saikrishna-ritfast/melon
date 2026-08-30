# Multi-stage Dockerfile for Express backend in a monorepo

# Stage 1: Build
FROM node:20-alpine AS builder
WORKDIR /app

# Copy package configurations for monorepo resolution
COPY package.json package-lock.json ./
COPY apps/backend/package.json ./apps/backend/

# Install all dependencies (including devDependencies for compiling)
RUN npm ci

# Copy codebase
COPY apps/backend/ ./apps/backend/

# Generate Prisma Schema mappings (crucial for compiling Backend TS code)
WORKDIR /app/apps/backend
RUN npx prisma generate

# Compile Express Typescript app
RUN npm run build

# Stage 2: Production runner
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# Copy configuration files
COPY package.json package-lock.json ./
COPY apps/backend/package.json ./apps/backend/

# Install only production dependencies to minimize image size
RUN npm ci --omit=dev

# Copy compiled resources and client outputs from builder
COPY --from=builder /app/apps/backend/dist ./apps/backend/dist
COPY --from=builder /app/apps/backend/prisma ./apps/backend/prisma
COPY --from=builder /app/apps/backend/node_modules/.prisma ./apps/backend/node_modules/.prisma
COPY --from=builder /app/apps/backend/node_modules/@prisma/client ./apps/backend/node_modules/@prisma/client

EXPOSE 5000
ENV PORT=5000

CMD ["node", "apps/backend/dist/server.js"]
