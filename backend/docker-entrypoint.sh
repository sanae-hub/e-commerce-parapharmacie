#!/bin/sh
# backend/docker-entrypoint.sh
set -e

echo "[entrypoint] Attente de PostgreSQL..."
until node -e "
const { Client } = await import('pg');
const c = new Client({ connectionString: process.env.DATABASE_URL });
await c.connect(); await c.end(); console.log('ok');
" 2>/dev/null; do
  sleep 2
done

echo "[entrypoint] PostgreSQL prêt — migration Prisma..."
npx prisma db push --skip-generate

echo "[entrypoint] Démarrage du serveur..."
exec node src/server.js
