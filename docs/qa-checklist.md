# QA Checklist

## Offline Checkout

1. Sign in and search products while online so they are cached locally.
2. Disconnect network.
3. Complete three cash transactions from `/pos`.
4. Confirm the offline status bar shows pending sync items.
5. Reconnect network and confirm pending count returns to zero.

## Split Tender

1. Add at least one item to cart.
2. Add partial Cash tender.
3. Add GCash tender for the remaining amount using manual confirmation.
4. Complete transaction and verify receipt lists both tenders.

## GCash Float Exhaustion

1. Open `/gcash`.
2. Set GCash float lower than a planned cash-in amount.
3. Attempt cash-in for more than available float.
4. Confirm the transaction is blocked.

## Full Sales Day

1. Checkout a sale.
2. Void the sale with manager PIN.
3. Record an expense.
4. Receive a delivery.
5. Verify sales, revenue, and inventory reports update.
