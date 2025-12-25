# Backend Dockerfile
# Use Debian-based node image to ensure OpenSSL and native libraries are available for Prisma
FROM node:18-bullseye-slim

WORKDIR /app

# Install build dependencies required by some native modules and ensure SSL libs are present
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential python3 ca-certificates \
  && rm -rf /var/lib/apt/lists/*

# Install dependencies (including prisma CLI for migrations during build)
COPY package*.json ./
# Use npm install to ensure devDependencies (like prisma CLI) are available during image build.
# If you prefer reproducible installs, add a package-lock.json and switch back to `npm ci`.
RUN npm install --silent || npm install --production --silent

COPY . .

# Generate Prisma client
RUN npx prisma generate || true

ENV NODE_ENV=production
EXPOSE 4000

CMD ["npm", "run", "start:prod"]
