# Backend Dockerfile
FROM node:18-alpine

WORKDIR /app

# Install dependencies (including prisma CLI for migrations during build)
COPY package*.json ./
RUN npm ci --silent

COPY . .

# Generate Prisma client
RUN npx prisma generate || true

ENV NODE_ENV=production
EXPOSE 4000

CMD ["npm", "start"]
