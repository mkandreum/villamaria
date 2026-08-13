#!/bin/sh
set -e

echo "========================================="
echo "  Villa María Docker Container Starting  "
echo "========================================="

# 1. Detect PostgreSQL vs SQLite from DATABASE_URL
if [ -n "$DATABASE_URL" ] && echo "$DATABASE_URL" | grep -qi "postgres"; then
  echo "[DB] Detected PostgreSQL DATABASE_URL. Setting schema provider to postgresql..."
  sed -i 's/provider = "sqlite"/provider = "postgresql"/g' prisma/schema.prisma
else
  echo "[DB] Using SQLite DATABASE_URL."
  export DATABASE_URL="${DATABASE_URL:-file:./dev.db}"
fi

# 2. Generate Prisma Client to match provider
echo "[DB] Generating Prisma Client..."
npx prisma generate

# 3. Synchronize database schema
echo "[DB] Pushing database schema..."
npx prisma db push --accept-data-loss || true

# 4. Start Node.js production server
echo "[Server] Starting Villa María server on port ${PORT:-3000}..."
exec npx tsx server/index.ts
