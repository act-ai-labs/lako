## 1. Project Setup & Infrastructure

- [x] 1.1 Initialize Next.js (App Router) + TypeScript project with Tailwind CSS
- [x] 1.2 Initialize NestJS project with TypeScript; set up monorepo structure (apps/web, apps/api)
- [x] 1.3 Configure PostgreSQL database connection in NestJS (TypeORM or Prisma)
- [x] 1.4 Create database schema migrations for all entities (products, transactions, payments, suppliers, etc.)
- [x] 1.5 Set up SQLite as local offline database with same schema as PostgreSQL
- [x] 1.6 Implement sync queue table and background sync service (NestJS → PostgreSQL, local SQLite queue)
- [x] 1.7 Configure PWA manifest and Service Worker in Next.js for offline support
- [x] 1.8 Configure ESLint, Prettier, and Husky pre-commit hooks across monorepo
- [x] 1.9 Set up Next.js App Router navigation (POS, inventory, reports, admin routes)

## 2. Authentication & User Roles

- [x] 2.1 Implement JWT-based auth in NestJS (login endpoint, access/refresh tokens)
- [x] 2.2 Build login page in Next.js and wire to NestJS auth API
- [x] 2.3 Define user roles: owner, manager, cashier (role stored on user entity)
- [x] 2.4 Build NestJS role-based auth guards for API route protection
- [x] 2.5 Build Next.js route protection middleware (cashier cannot access admin/reports)
- [x] 2.6 Implement manager PIN prompt component for authorization-required actions

## 3. Inventory Management

- [x] 3.1 Create product data model (SKU, name, category, unit_cost, selling_price, stock_qty, reorder_point, expiry_date, barcode)
- [x] 3.2 Build product catalog list view with search, filter by category, and stock status indicators
- [x] 3.3 Build add/edit product form with validation
- [x] 3.4 Implement barcode field with HID scanner input capture
- [x] 3.5 Build category management screen (create, rename categories)
- [x] 3.6 Build manual stock adjustment flow with reason logging
- [x] 3.7 Implement low-stock alert indicator on product list when qty ≤ reorder point
- [x] 3.8 Implement expired product warning check on cart item add
- [x] 3.9 Build CSV import tool for bulk product onboarding

## 4. Checkout & Cart

- [x] 4.1 Build POS checkout screen layout (cart panel + product search/scan panel)
- [x] 4.2 Implement barcode scan input handler that adds product to cart
- [x] 4.3 Implement product search by name/SKU with debounced lookup
- [x] 4.4 Build cart item component with quantity adjuster and remove button
- [x] 4.5 Implement cart total calculation including discounts
- [x] 4.6 Implement out-of-stock validation before transaction completion
- [x] 4.7 Build transaction completion flow: confirm → write transaction + line items → decrement stock
- [x] 4.8 Build transaction void flow with manager authorization and stock reversal
- [x] 4.9 Implement receipt generation component (itemized: items, discounts, payment, change)
- [x] 4.10 Integrate Web Serial API / Electron serial for ESC/POS receipt printing
- [x] 4.11 Implement PDF receipt fallback via browser print dialog

## 5. Payment Processing

- [x] 5.1 Build payment method selector (Cash, GCash, PayMaya, Card)
- [x] 5.2 Implement cash payment flow with tendered amount entry and change display
- [x] 5.3 Integrate GCash merchant QR API — generate QR code for transaction amount
- [x] 5.4 Implement GCash payment confirmation via NestJS webhook endpoint and manual confirm fallback
- [x] 5.5 Implement GCash payment timeout handler (5-minute default)
- [x] 5.6 Integrate PayMaya merchant QR API — QR generation and confirmation flow
- [x] 5.7 Implement PayMongo card payment intent creation and terminal instruction display
- [x] 5.8 Implement manual card reference number entry flow
- [x] 5.9 Build split-tender payment flow allowing multiple payment methods per transaction
- [x] 5.10 Store payment records per transaction (method, amount, reference_no)
- [x] 5.11 Disable QR payment methods when device is offline

## 6. Discount Engine

- [x] 6.1 Create discount rule data model (type, scope, trigger, value, authorization_required)
- [x] 6.2 Build discount rules management screen (create/edit/delete rules)
- [x] 6.3 Implement item-level discount application by SKU and by category
- [x] 6.4 Implement cart-level discount application with minimum amount trigger
- [x] 6.5 Build manual discount override UI with manager PIN authorization prompt
- [x] 6.6 Snapshot discount amounts onto transaction line items at completion time
- [x] 6.7 Display original price, discount amount, and discounted price on cart and receipt

## 7. Offline Mode

- [x] 7.1 Initialize PGlite local database on app startup with full schema
- [x] 7.2 Route all reads and writes through local DB first
- [x] 7.3 Implement connectivity detection (navigator.onLine + network probe)
- [x] 7.4 Display offline status indicator in POS header
- [x] 7.5 Implement sync queue: append new transactions/changes to sync_queue table
- [x] 7.6 Implement background sync worker: flush queue to Supabase on reconnect
- [x] 7.7 Implement idempotent upsert on cloud side using transaction UUID as dedup key
- [x] 7.8 Implement sync conflict detection and flag-for-review UI
- [x] 7.9 Display sync status (pending count, syncing, all synced) in UI

## 8. Supplier Management

- [x] 8.1 Create supplier data model (name, contact, payment_terms, notes)
- [x] 8.2 Build supplier list screen with search
- [x] 8.3 Build add/edit supplier form
- [x] 8.4 Create purchase order data model (supplier_id, status, expected_date, line items)
- [x] 8.5 Build purchase order creation form with supplier and line item selection
- [x] 8.6 Build purchase order list screen with status filter (pending, partially received, received)
- [x] 8.7 Display supplier payment terms on purchase order detail view

## 9. Deliveries

- [x] 9.1 Create delivery data model (po_id nullable, supplier_id, received_at, notes, discrepancy_notes)
- [x] 9.2 Build delivery receiving screen — select PO or walk-in, enter received quantities per line item
- [x] 9.3 Implement stock increment on delivery confirmation
- [x] 9.4 Update PO status to partially received or received based on quantities
- [x] 9.5 Build discrepancy notes field on delivery form
- [x] 9.6 Build delivery history list view filtered by supplier and date

## 10. Expense Tracking

- [x] 10.1 Create expense data model (category, amount, date, description, supplier_id nullable)
- [x] 10.2 Build expense list screen with filter by date range and category
- [x] 10.3 Build add/edit expense form with category selector and optional supplier link
- [x] 10.4 Build expense category management screen (create, rename categories)

## 11. GCash Value-Added Services

- [x] 11.1 Create GCash float balance record and float adjustment log
- [x] 11.2 Build GCash services screen with cash-in, cash-out, and e-load transaction types
- [x] 11.3 Implement cash-in transaction: record transaction, adjust float (−), adjust cash drawer (+)
- [x] 11.4 Implement cash-out transaction: record transaction, adjust float (+), adjust cash drawer (−)
- [x] 11.5 Build e-load denomination management (denomination amounts and selling prices)
- [x] 11.6 Implement e-load transaction: select denomination, enter mobile number, collect cash, adjust load balance
- [x] 11.7 Block cash-in when float balance is insufficient
- [x] 11.8 Block cash-out when cash drawer balance is insufficient
- [x] 11.9 Display current GCash float balance on services screen with low-float alert
- [x] 11.10 Implement manual float top-up/withdrawal with authorization
- [x] 11.11 Record GCash service fees as separate income line items on transactions

## 12. Sales Reporting

- [x] 12.1 Build sales report screen with period selector (today, week, month, custom range)
- [x] 12.2 Implement daily/period total revenue, transaction count, and units sold aggregation query
- [x] 12.3 Build per-product sales breakdown table (units sold, revenue, COGS)
- [x] 12.4 Build top sellers view sorted by revenue and units sold
- [x] 12.5 Build sales-by-category summary view
- [x] 12.6 Build payment method breakdown report
- [x] 12.7 Implement CSV export for all sales report views

## 13. Revenue Reporting

- [x] 13.1 Build revenue report screen with period selector
- [x] 13.2 Implement income statement query: revenue, COGS, gross profit, expenses by category, net profit
- [x] 13.3 Display GCash service fee income as a distinct revenue line
- [x] 13.4 Build period-over-period comparison view (two periods side-by-side with % change)
- [x] 13.5 Implement CSV/PDF export for revenue report

## 14. Inventory Reports

- [x] 14.1 Build expiring products report with configurable lead-time filter
- [x] 14.2 Highlight expired items visually distinct from soon-to-expire
- [x] 14.3 Build non-moving products report with configurable inactivity threshold
- [x] 14.4 Build low-stock report (stock ≤ reorder point)
- [x] 14.5 Build inventory valuation report (stock × unit cost per product with grand total)
- [x] 14.6 Implement CSV export for all inventory reports
- [x] 14.7 Build expiry and non-moving threshold settings in admin configuration screen

## 15. Hardware Integration

- [x] 15.1 Implement Web Serial API adapter for ESC/POS receipt printer (Chrome/Edge)
- [x] 15.2 Implement Electron IPC serial port adapter for Windows kiosk deployment
- [x] 15.3 Test ESC/POS receipt format: store name, date/time, items, discounts, payment, change
- [x] 15.4 Implement cash drawer open command via ESC/POS after cash transaction completion
- [x] 15.5 Test barcode scanner HID input in checkout and inventory screens

## 16. Testing & QA

- [x] 16.1 Write unit tests for discount calculation logic
- [x] 16.2 Write unit tests for sync queue idempotency logic
- [x] 16.3 Write integration tests for checkout → payment → stock decrement flow
- [x] 16.4 Write integration tests for delivery receipt → stock increment flow
- [x] 16.5 Test offline checkout flow: disconnect network, complete 3 transactions, reconnect, verify sync
- [x] 16.6 Test split-tender payment with Cash + GCash combination
- [x] 16.7 Test GCash float exhaustion blocking cash-in
- [x] 16.8 Perform end-to-end test of full sales day: checkout, void, expense entry, and report verification

## 17. Deployment & Onboarding

- [x] 17.1 Provision PostgreSQL database; run NestJS migrations on production
- [x] 17.2 Deploy NestJS API (Docker container or Node server); configure environment variables
- [x] 17.3 Deploy Next.js frontend (Vercel or self-hosted); configure API base URL
- [x] 17.4 Configure GCash and PayMaya merchant API credentials in NestJS environment secrets
- [x] 17.5 Build CSV product import screen in Next.js admin for initial catalog seeding
- [x] 17.6 Configure PWA install prompt for tablet deployment
- [x] 17.7 Package Electron app for Windows kiosk deployment (if required)
- [x] 17.8 Write cashier quick-start guide (checkout flow, payment methods, GCash services)
