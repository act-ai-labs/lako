# LAKO POS

Ledger-enabled AI Kiosk Operations, a retail point-of-sale system for Philippine stores.

## Stack

- Frontend: Next.js App Router, TypeScript, Tailwind CSS, PWA
- Backend: NestJS, TypeORM
- Databases: PostgreSQL for cloud storage, SQLite for offline local storage

## Getting Started

```bash
npm install
cp .env.example .env
npm run dev
```

- Web: http://localhost:3000
- API: http://localhost:3001/api

## Structure

```text
apps/
  web/   Next.js frontend
  api/   NestJS backend
openspec/
  changes/lako-pos/   OpenSpec artifacts
```

## Database

Run PostgreSQL migrations from the repo root:

```bash
npm run migration:run
```

The API also initializes a SQLite offline database at `SQLITE_PATH` for local-first storage and sync queue persistence.
