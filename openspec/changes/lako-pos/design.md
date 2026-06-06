## Context

LAKO POS (Ledger-enabled AI Kiosk Operations) is a greenfield retail point-of-sale system for Philippine small-to-medium retail stores. Stores commonly face: multi-payment tender (cash, GCash, PayMaya, cards), poor internet connectivity (requiring offline capability), and side-businesses like GCash remittance services. The system must work reliably as a daily driver in a low-bandwidth or intermittent-connectivity environment while producing financial reports that store owners can act on.

Stack context: Next.js (frontend), NestJS (backend API), PostgreSQL (primary cloud DB), SQLite (offline local DB), TypeScript throughout. AI assistance via Qwen Coder (local builder) and Claude (architect/reviewer). Development in Cursor.

## Goals / Non-Goals

**Goals:**
- Offline-first POS with full checkout, payment, and inventory capability when disconnected
- Multi-tender payments: Cash, GCash, PayMaya, and card (via payment terminal or PayMongo)
- Complete inventory lifecycle: catalog, stock-in via deliveries, stock adjustments, expiry tracking
- Supplier and purchase-order workflow integrated with delivery receiving
- Expense recording to enable gross-profit reporting
- GCash value-added services (cash-in, cash-out, e-load) as first-class transactions
- Flexible discount engine supporting item-level and cart-level discounts
- Report suite: sales, revenue (sales vs expenses), inventory health (expiring, non-moving)

**Non-Goals:**
- Multi-branch / multi-store consolidation (single store for v1)
- E-commerce / online storefront
- Accounting-grade double-entry bookkeeping
- Payroll or HR features
- Customer loyalty / CRM beyond basic purchase history
- Integration with BIR e-invoicing (future phase)

## Decisions

### D1: Offline-First Architecture with Sync Queue

**Decision**: Use a local SQLite database as the primary data store on the device. All writes go local first. A background sync process pushes completed transactions to the PostgreSQL backend (via NestJS API) when online.

**Rationale**: Philippine retail stores frequently lose internet for minutes to hours. The POS must never block on connectivity. A sync queue with idempotent upserts avoids double-counting. The NestJS API exposes a `/sync` endpoint that accepts batched queue payloads and deduplicates by transaction UUID.

**Alternatives considered**:
- *Optimistic UI with remote DB*: Any network hiccup interrupts checkout — unacceptable.
- *Service Worker cache only*: Cannot handle write-heavy POS workloads; no structured query support.

### D2: Next.js Frontend

**Decision**: Build the frontend as a Next.js application (App Router, TypeScript, Tailwind CSS). Deployed as a PWA for tablet use and optionally wrapped in Electron for Windows kiosk terminals.

**Rationale**: Next.js provides SSR for report pages (faster initial load), API routes for lightweight BFF needs, and strong TypeScript support. The same codebase works as a PWA on tablets and inside Electron on desktop terminals with peripheral access (receipt printer, cash drawer).

**Alternatives considered**:
- *Vite + React SPA*: No SSR benefit for reports; no file-system API access pattern for Electron; separate routing setup needed.
- *Native mobile app*: Higher development cost, slower iteration.

### D3: NestJS Backend API

**Decision**: Use NestJS (TypeScript) as the backend API layer, connecting to PostgreSQL. NestJS handles business logic, payment webhook processing, sync endpoint, and authentication (JWT).

**Rationale**: NestJS's module/service architecture maps cleanly to LAKO's capability boundaries (inventory module, transactions module, reports module, etc.). TypeScript end-to-end reduces contract drift between frontend and backend. Decorators simplify validation and auth guards.

**Alternatives considered**:
- *Supabase Edge Functions*: Vendor lock-in; less control over business logic; harder to test locally.
- *Express*: Less structure; no built-in DI or module system; grows unwieldy for a system this size.

### D4: PostgreSQL as Cloud Database

**Decision**: PostgreSQL is the primary cloud database, accessed via the NestJS API. Schema managed with TypeORM or Prisma migrations. SQLite on-device mirrors the same schema for offline use.

**Rationale**: PostgreSQL's relational model suits POS data (transactions, line items, inventory, reporting aggregations). Shared schema between PostgreSQL and SQLite minimizes sync complexity — the same query logic runs against both databases. No vendor-specific features used so schema is portable.

**Alternatives considered**:
- *MongoDB*: NoSQL is a poor fit for relational POS data and financial reporting queries.
- *Supabase managed Postgres*: Adds a vendor dependency; NestJS + self-hosted/managed Postgres gives full control.

### D5: Payment Processing Strategy

**Decision**:
- **Cash**: Computed locally, no external API.
- **GCash / PayMaya**: QR code generation via their merchant APIs; cashier confirms payment on notification (webhook via NestJS) or manual confirm fallback.
- **Cards**: PayMongo API or physical terminal via serial/USB with fallback manual reference entry.
- **GCash Services (cash-in/out/load)**: Separate service transaction type; fee and float tracked separately from product sales.

**Rationale**: QR-based payments dominate PH retail. Card terminals vary by store; PayMongo provides a software fallback. GCash services require float management (store's GCash balance) distinct from sales revenue. NestJS webhook handlers process async payment confirmations reliably.

**Alternatives considered**:
- *PayMongo for all e-payments*: Doesn't support GCash load/remittance service transactions.

### D6: Discount Engine Design

**Decision**: Discounts are stored as rules with `type` (percentage | fixed), `scope` (item | cart), `trigger` (manual | sku | category | minimum_amount), and an optional `authorization_required` flag. Applied discounts are snapshot-stored on transaction line items (not re-computed from rules) to preserve historical accuracy.

**Rationale**: Snapshotting prevents retroactive discount recalculation when rules change. Authorization flag enforces manager approval for ad-hoc discounts.

### D7: Data Model Key Entities

```
products          — sku, name, category, unit_cost, selling_price, stock_qty, expiry_date, reorder_point
transactions      — id, type (sale|gcash_in|gcash_out|load), total, tendered, change, status, synced_at
transaction_items — transaction_id, product_id, qty, unit_price, discount_amount
payments          — transaction_id, method (cash|gcash|paymaya|card), amount, reference_no
suppliers         — id, name, contact, payment_terms
purchase_orders   — id, supplier_id, status, expected_date
po_items          — po_id, product_id, ordered_qty, received_qty, unit_cost
deliveries        — id, po_id, received_at, notes
expenses          — id, category, amount, date, supplier_id (nullable), notes
discounts         — id, name, type, scope, trigger, value, authorization_required
sync_queue        — id, table_name, operation, payload, synced_at
```

### D8: Reporting Architecture

**Decision**: Reports are computed queries against local SQLite for speed during offline use; the same queries run against PostgreSQL via NestJS API when online for historical and cross-device access. No separate BI layer for v1.

**Report types**:
- **Sales report**: GROUP BY date/product/category with revenue, qty, cost
- **Revenue report**: JOIN transactions + expenses by period; gross profit = total_sales - COGS - expenses
- **Expiring products**: products WHERE expiry_date BETWEEN now AND now+threshold
- **Non-moving products**: products WHERE last_sold_date < now - velocity_threshold OR never sold

## Risks / Trade-offs

- **Sync conflicts** → Mitigation: Last-write-wins with server timestamp; NestJS sync endpoint flags conflicting transactions for manual review. Sales transactions are append-only (never update, only void+reissue).
- **GCash/PayMaya API availability** → Mitigation: Fallback to manual reference number entry; cashier verifies payment in GCash app. Transaction held in "pending confirmation" state.
- **Float exhaustion for GCash services** → Mitigation: Real-time float balance display; low-float alert; system blocks cash-out if float insufficient.
- **Receipt printer compatibility** → Mitigation: ESC/POS is the standard; support Web Serial API (Chrome/Edge) and Electron serial port. Fallback to PDF/print dialog.
- **Offline data volume** → Mitigation: Local SQLite pruned after successful sync; keep 90 days local, full history in PostgreSQL.
- **Data loss on device failure** → Mitigation: Sync on every transaction completion (if online); unsynced queue survives app restarts via persistent SQLite file.
- **SQLite ↔ PostgreSQL schema drift** → Mitigation: Single source-of-truth schema definition (TypeORM entities or Prisma schema); SQLite DDL generated from the same models.

## Migration Plan

1. Provision PostgreSQL database, run NestJS TypeORM/Prisma migrations
2. Deploy NestJS API (Docker or Node server); configure environment variables
3. Deploy Next.js frontend (Vercel or self-hosted)
4. Seed with store's existing product catalog (CSV import via Next.js admin page → NestJS API)
5. Configure payment credentials (GCash merchant key, PayMaya, PayMongo) in NestJS env
6. Connect receipt printer and test ESC/POS output from Next.js PWA
7. Parallel run: staff use new system; supervisor cross-checks against manual records for 1 week
8. Full cutover; old system archived

**Rollback**: Since this is greenfield, rollback means reverting to the previous manual/existing system. Local SQLite data exportable as CSV from the NestJS API for continuity.

## Open Questions

- Which GCash load partner API will be used (GCash Business API, load aggregator like Magnet/GIGA)?
- Will card payments use a specific physical terminal brand, or PayMongo software-only?
- Is Electron packaging required at launch or can v1 be Next.js PWA-only?
- Desired sync strategy: real-time per-transaction or batch-on-interval?
- Should the discount authorization workflow require a separate manager PIN or is a role-based UI lock sufficient?
- ORM preference: TypeORM or Prisma for NestJS?
