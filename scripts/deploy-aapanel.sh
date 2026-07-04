#!/usr/bin/env bash
set -e

# AAPanel deployment helper for Cosmatics ERP & POS
# Run this script on the AAPanel server after uploading the project.

PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
BACKEND_DIR="$PROJECT_DIR/packages/backend"
FRONTEND_DIR="$PROJECT_DIR/packages/frontend"

echo "==> Installing dependencies"
pnpm install --no-frozen-lockfile

echo "==> Generating Prisma client"
pnpm --filter backend db:generate

echo "==> Building backend"
pnpm --filter backend build

echo "==> Deploying database migrations"
pnpm --filter backend db:deploy

echo "==> Seeding demo data"
pnpm --filter backend db:seed

echo "==> Building frontend (static export)"
cd "$FRONTEND_DIR"
export NEXT_PUBLIC_API_URL="${NEXT_PUBLIC_API_URL:-https://your-api-domain.com}"
pnpm build:static

echo "==> Deployment artifacts ready"
echo "Backend: $BACKEND_DIR/dist"
echo "Frontend static: $FRONTEND_DIR/dist"
echo ""
echo "Next steps in AAPanel:"
echo "1. Create Node.js site for backend, startup file: dist/src/main.js"
echo "2. Upload $FRONTEND_DIR/dist to your AAPanel website root for the frontend"
