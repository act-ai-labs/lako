# Cashier Quick Start

## Checkout

1. Open `/pos`.
2. Scan a barcode or search by SKU/name.
3. Add quantity and review discounts.
4. Add one or more payments.
5. Complete sale and print receipt.

## Payment Methods

- Cash: enter tendered amount and return displayed change.
- GCash/PayMaya: generate QR when online or use manual confirmation mode.
- Card: enter terminal reference when credentials are not configured.
- Split tender: add each payment until the balance is covered.

## Voids

Use `Void Last Transaction`, then ask a manager to enter their PIN.

## GCash Services

Open `/gcash` for cash-in, cash-out, and e-load. The screen shows float, load balance, cash drawer balance, and low-float warnings.

## Offline Mode

If the connection drops, continue cash checkout. Transactions are queued and sync automatically when the connection returns.
