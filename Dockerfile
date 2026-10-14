FROM node:22-alpine AS builder

WORKDIR /wedding

RUN apk add --no-cache \
  python3 \
  make \
  g++ \
  libc6-compat

RUN node -v && npm -v


# =========================================================
# Shared Nuxt module
# =========================================================

COPY NUXT_MODULES/WEBAPP_NUXT_MODULE \
  ./NUXT_MODULES/WEBAPP_NUXT_MODULE


# =========================================================
# Dependency files
# =========================================================

COPY CEREMONY_WEBAPP_NUXT/package.json \
  CEREMONY_WEBAPP_NUXT/package-lock.json \
  ./CEREMONY_WEBAPP_NUXT/

WORKDIR /wedding/CEREMONY_WEBAPP_NUXT


# =========================================================
# Install dependencies
# =========================================================

RUN npm i \
  --no-audit \
  --no-fund \
  --fetch-retries=5 \
  --fetch-retry-factor=2 \
  --fetch-retry-mintimeout=20000 \
  --fetch-retry-maxtimeout=120000 \
  --fetch-timeout=300000


# =========================================================
# Application
# =========================================================

COPY CEREMONY_WEBAPP_NUXT .


# =========================================================
# Rebuild native modules for Linux/Alpine
# =========================================================

RUN npm rebuild better-sqlite3 --build-from-source


# =========================================================
# Verify better-sqlite3
# =========================================================

RUN node -e "\
  const Database = require('better-sqlite3'); \
  const db = new Database(':memory:'); \
  console.log('better-sqlite3 native binding OK'); \
  db.close(); \
  "


# =========================================================
# Verify shared module
# =========================================================

RUN ls -la /wedding/NUXT_MODULES/WEBAPP_NUXT_MODULE

RUN ls -la /wedding/NUXT_MODULES/WEBAPP_NUXT_MODULE/src


# =========================================================
# Build Nuxt
# =========================================================
ENV NODE_OPTIONS="--max-old-space-size=4096"

RUN npm run build


# =========================================================
# Production
# =========================================================

FROM node:22-alpine AS production

WORKDIR /app

COPY --from=builder \
  /wedding/CEREMONY_WEBAPP_NUXT/.output \
  ./.output

EXPOSE 3000

CMD ["node", ".output/server/index.mjs"]
