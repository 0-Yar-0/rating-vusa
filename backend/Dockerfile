# Backend Dockerfile
# Multi-stage build using Ubuntu base and NodeSource for Node 18.
# This avoids relying on docker image mirrors and ensures native libs (OpenSSL) are present for Prisma.

FROM ubuntu:22.04 AS builder
ENV DEBIAN_FRONTEND=noninteractive
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl ca-certificates gnupg build-essential python3 python3-dev libssl-dev \
  && rm -rf /var/lib/apt/lists/*

# Install Node 18 from NodeSource
RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash - && apt-get install -y nodejs && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY package*.json ./
# Install all deps (including dev deps needed for prisma CLI).
RUN npm ci --silent

COPY . .
# Generate Prisma client (if present)
RUN npx prisma generate || true
# Remove dev dependencies to keep production image smaller
RUN npm prune --production --silent

FROM ubuntu:22.04 AS production
ENV DEBIAN_FRONTEND=noninteractive
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl ca-certificates libssl-dev \
  && rm -rf /var/lib/apt/lists/*
RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash - && apt-get install -y nodejs && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY --from=builder /app /app
ENV NODE_ENV=production
EXPOSE 4000
CMD ["npm", "run", "start:prod"]
