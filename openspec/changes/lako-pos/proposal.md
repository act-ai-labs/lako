## Why

LAKO POS (Ledger-enabled AI Kiosk Operations) needs a complete retail point-of-sale system that handles inventory, multi-tender checkouts, financial reporting, and value-added services (GCash cash-in/out/load) in a single unified platform — enabling store operators to run their entire retail business including supplier management, expense tracking, and compliance-ready reporting without juggling separate tools.

## What Changes

- **NEW**: Full inventory management with product catalog, stock tracking, expiry dates, and reorder alerts
- **NEW**: Checkout flow with barcode scanning, discounts, and multi-tender payment processing
- **NEW**: Payment acceptance: Cash, GCash, PayMaya, and card payments
- **NEW**: Offline-first mode with local data sync when connectivity is restored
- **NEW**: Supplier management — supplier list, purchase orders, and delivery tracking
- **NEW**: Expense recording and categorization
- **NEW**: Revenue reporting — sales vs. expenses, profitability by period
- **NEW**: Inventory reports — expiring products, non-moving (slow) products
- **NEW**: GCash value-added services — cash-in, cash-out, and e-load top-up as sellable service transactions
- **NEW**: Discount engine — percentage, fixed-amount, item-level, and transaction-level discounts

## Capabilities

### New Capabilities

- `inventory-management`: Product catalog with SKUs, categories, stock levels, expiry dates, reorder points, and barcode support
- `checkout-and-cart`: POS checkout flow with cart management, item scanning, quantity adjustments, and receipt generation
- `payment-processing`: Multi-tender payment collection — Cash, GCash, PayMaya, and card; change computation and split-tender support
- `discount-engine`: Discount rules — percentage off, fixed amount off, item-level and cart-level; manual override with authorization
- `offline-mode`: Local-first data persistence using SQLite/IndexedDB; sync queue for offline transactions; conflict resolution on reconnect
- `supplier-management`: Supplier directory, contact info, payment terms, and purchase order creation
- `deliveries`: Receive deliveries against purchase orders; update stock on receipt; track delivery status and discrepancies
- `expense-tracking`: Record operating expenses by category (utilities, rent, supplies); link to supplier payments
- `sales-reporting`: Daily/weekly/monthly sales summaries; per-product and per-category breakdowns; top sellers
- `revenue-reporting`: Income vs. expense statements; gross/net profit by period; cash flow overview
- `inventory-reports`: Expiring products report with configurable lead-time; non-moving products by velocity threshold
- `gcash-services`: GCash cash-in, cash-out, and e-load as service transactions with fee tracking and float management

### Modified Capabilities

## Impact

- **New application**: Greenfield LAKO POS — no existing production code impacted
- **Database**: Local SQLite (offline) + cloud sync (PostgreSQL or Supabase); schema covers products, transactions, payments, suppliers, deliveries, expenses
- **External integrations**: GCash and PayMaya payment APIs; optional card terminal SDK (e.g., PayMongo); GCash load/remittance partner API
- **Platform targets**: Tablet/desktop web app (React PWA) with offline capability via Service Worker; optionally Electron wrapper for kiosk mode
- **Hardware**: Thermal receipt printer (ESC/POS), barcode scanner (HID), cash drawer integration
