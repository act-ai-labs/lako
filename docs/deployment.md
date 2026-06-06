# Deployment Guide

## PostgreSQL

Provision a PostgreSQL database, enable `uuid-ossp`, and configure:

```env
DATABASE_HOST=
DATABASE_PORT=5432
DATABASE_USER=
DATABASE_PASSWORD=
DATABASE_NAME=
```

Run migrations:

```bash
npm run migration:run
```

## NestJS API

Deploy `apps/api` as a Node service or Docker container.

Required environment:

```env
API_PORT=3001
WEB_ORIGIN=
JWT_ACCESS_SECRET=
JWT_REFRESH_SECRET=
GCASH_MERCHANT_ID=
GCASH_MERCHANT_KEY=
PAYMAYA_MERCHANT_ID=
PAYMAYA_MERCHANT_KEY=
PAYMONGO_PUBLIC_KEY=
PAYMONGO_SECRET_KEY=
```

Payment credentials may remain empty for manual confirmation mode.

## Next.js Frontend

Deploy `apps/web` to Vercel or a self-hosted Node server.

```env
NEXT_PUBLIC_API_URL=
API_INTERNAL_URL=
```

## Product Onboarding

Use `/inventory` CSV import with headers:

```text
sku,name,sellingPrice,unitCost,stockQty,reorderPoint,barcode,expiryDate
```

## PWA Tablet Install

Open the deployed site in Chrome/Edge, sign in once, then use the browser install prompt.
