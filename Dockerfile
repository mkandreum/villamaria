# Multi-stage Dockerfile for Villa Maria App
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Generate Prisma Client & Build Vite application
RUN npx prisma generate
RUN npm run build

# Server Build / TypeScript compile
RUN npm install -g tsx

# Production Stage
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Copy node_modules & build artifacts from builder
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server ./server
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/src ./src

# Create upload directory
RUN mkdir -p /app/uploads

EXPOSE 3000

# Entrypoint script: Detects PostgreSQL vs SQLite automatically based on DATABASE_URL
CMD ["sh", "-c", "if [ -n \"$DATABASE_URL\" ] && (echo \"$DATABASE_URL\" | grep -qi \"postgres\"); then echo '[DB Init] Detected PostgreSQL. Updating schema provider...'; sed -i 's/provider = \"sqlite\"/provider = \"postgresql\"/g' prisma/schema.prisma; else echo '[DB Init] Using SQLite database...'; export DATABASE_URL=\"${DATABASE_URL:-file:./dev.db}\"; fi && npx prisma generate && npx prisma db push && npx tsx server/index.ts"]
