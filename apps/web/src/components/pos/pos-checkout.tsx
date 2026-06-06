'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Receipt, ReceiptData, printReceiptFallback } from '../receipts/receipt';
import { openCashDrawerWebSerial, printEscPosReceipt } from '@/lib/escpos';
import { openCashDrawerViaElectron, printReceiptViaElectron } from '@/lib/electron-escpos';
import {
  cacheProducts,
  flushSyncQueue,
  saveOfflineTransaction,
  searchOfflineProducts,
} from '@/lib/offline-db';

interface Product {
  id: string;
  sku: string;
  name: string;
  categoryId: string | null;
  sellingPrice: string;
  stockQty: number;
  expiryDate: string | null;
  barcode: string | null;
}

interface DiscountRule {
  id: string;
  name: string;
  type: 'percentage' | 'fixed';
  scope: 'item' | 'cart';
  trigger: 'manual' | 'sku' | 'category' | 'minimum_amount';
  value: string;
  triggerValue: string | null;
  authorizationRequired: boolean;
}

interface CartItem {
  product: Product;
  qty: number;
  discountAmount: number;
  discountLabel?: string;
}

interface Tender {
  method: 'cash' | 'gcash' | 'paymaya' | 'card';
  amount: string;
  referenceNo: string;
}

interface PendingProviderPayment {
  provider: Tender['method'];
  amount: string;
  referenceNo: string;
  qrPayload?: string;
  expiresAt?: string;
  instructions?: string;
  manualConfirmationRequired?: boolean;
}

function isExpired(product: Product) {
  return product.expiryDate ? new Date(product.expiryDate) <= new Date() : false;
}

export function PosCheckout() {
  const [query, setQuery] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [discountRules, setDiscountRules] = useState<DiscountRule[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [manualCartDiscount, setManualCartDiscount] = useState(0);
  const [message, setMessage] = useState<string | null>(null);
  const [payment, setPayment] = useState<Tender>({ method: 'cash', amount: '', referenceNo: '' });
  const [payments, setPayments] = useState<Tender[]>([]);
  const [receipt, setReceipt] = useState<ReceiptData | null>(null);
  const [pendingProviderPayment, setPendingProviderPayment] =
    useState<PendingProviderPayment | null>(null);
  const [isOnline, setIsOnline] = useState(
    typeof navigator === 'undefined' ? true : navigator.onLine,
  );

  const subtotal = useMemo(
    () => cart.reduce((sum, item) => sum + Number(item.product.sellingPrice) * item.qty, 0),
    [cart],
  );
  const automaticCartDiscount = useMemo(
    () =>
      discountRules
        .filter((rule) => rule.scope === 'cart' && rule.trigger === 'minimum_amount')
        .filter((rule) => subtotal >= Number(rule.triggerValue ?? 0))
        .reduce((sum, rule) => sum + calculateDiscount(subtotal, rule), 0),
    [discountRules, subtotal],
  );
  const total = useMemo(() => {
    const discountedTotal =
      cart.reduce(
        (sum, item) => sum + Number(item.product.sellingPrice) * item.qty - item.discountAmount,
        0,
      ) -
      automaticCartDiscount -
      manualCartDiscount;

    return Math.max(discountedTotal, 0);
  }, [automaticCartDiscount, cart, manualCartDiscount]);
  const paid = useMemo(() => payments.reduce((sum, tender) => sum + Number(tender.amount), 0), [payments]);
  const remaining = Math.max(total - paid, 0);

  async function searchProducts(nextQuery = query) {
    if (!isOnline) {
      setProducts(await searchOfflineProducts(nextQuery));
      return;
    }

    const response = await fetch(`/api/inventory/products?search=${encodeURIComponent(nextQuery)}`);
    if (response.ok) {
      const nextProducts = (await response.json()) as Product[];
      setProducts(nextProducts);
      await cacheProducts(nextProducts);
    }
  }

  useEffect(() => {
    async function loadDiscounts() {
      const response = await fetch('/api/discounts');
      if (response.ok) {
        setDiscountRules((await response.json()) as DiscountRule[]);
      }
    }

    void loadDiscounts();
  }, []);

  useEffect(() => {
    function handleOnline() {
      setIsOnline(true);
    }
    function handleOffline() {
      setIsOnline(false);
    }

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    if (!pendingProviderPayment?.expiresAt) return;

    const expiresIn = new Date(pendingProviderPayment.expiresAt).getTime() - Date.now();
    const timeout = window.setTimeout(() => {
      setPendingProviderPayment(null);
      setMessage('QR payment timed out. Select a payment method again.');
    }, Math.max(expiresIn, 0));

    return () => window.clearTimeout(timeout);
  }, [pendingProviderPayment]);

  async function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await searchProducts();
  }

  function addToCart(product: Product) {
    if (isExpired(product)) {
      const confirmed = window.confirm(
        `${product.name} is expired or expires today. Add it to the cart anyway?`,
      );
      if (!confirmed) {
        return;
      }
    }

    setCart((items) => {
      const existing = items.find((item) => item.product.id === product.id);
      if (existing) {
        return items.map((item) =>
          item.product.id === product.id ? withItemDiscount(item, item.qty + 1) : item,
        );
      }
      return [...items, withItemDiscount({ product, qty: 1, discountAmount: 0 }, 1)];
    });
    setMessage(`${product.name} added to cart.`);
  }

  function updateQty(productId: string, qty: number) {
    setCart((items) =>
      items.flatMap((item) => {
        if (item.product.id !== productId) return item;
        return qty <= 0 ? [] : [withItemDiscount(item, qty)];
      }),
    );
  }

  function calculateDiscount(baseAmount: number, rule: DiscountRule) {
    if (rule.type === 'percentage') {
      return Math.min(baseAmount, (baseAmount * Number(rule.value)) / 100);
    }
    return Math.min(baseAmount, Number(rule.value));
  }

  function findItemDiscount(product: Product) {
    const baseAmount = Number(product.sellingPrice);
    const rule = discountRules.find((candidate) => {
      if (candidate.scope !== 'item') return false;
      if (candidate.trigger === 'sku') return candidate.triggerValue === product.sku;
      if (candidate.trigger === 'category') return candidate.triggerValue === product.categoryId;
      return false;
    });

    return rule
      ? { amount: calculateDiscount(baseAmount, rule), label: rule.name }
      : { amount: 0, label: undefined };
  }

  function withItemDiscount(item: CartItem, qty: number): CartItem {
    const discount = findItemDiscount(item.product);
    return {
      ...item,
      qty,
      discountAmount: discount.amount * qty,
      discountLabel: discount.label,
    };
  }

  function discountSnapshotForItem(item: CartItem) {
    const cartDiscount = automaticCartDiscount + manualCartDiscount;
    const itemSubtotal = Number(item.product.sellingPrice) * item.qty;
    const cartShare = subtotal > 0 ? (itemSubtotal / subtotal) * cartDiscount : 0;
    return item.discountAmount + cartShare;
  }

  async function applyManualDiscount() {
    const rule = discountRules.find((candidate) => candidate.trigger === 'manual');
    if (!rule) {
      setMessage('Create a manual discount rule first.');
      return;
    }

    if (rule.authorizationRequired) {
      const pin = window.prompt('Manager PIN');
      if (!pin) return;
      const response = await fetch('/api/auth/manager-pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin }),
      });
      if (!response.ok) {
        setMessage('Manager authorization failed.');
        return;
      }
    }

    setManualCartDiscount(calculateDiscount(subtotal, rule));
    setMessage(`Manual discount applied: ${rule.name}`);
  }

  async function completeTransaction() {
    const outOfStock = cart.find((item) => item.qty > item.product.stockQty);
    if (outOfStock) {
      setMessage(
        `${outOfStock.product.name} has only ${outOfStock.product.stockQty} available. Reduce quantity before completing.`,
      );
      return;
    }

    if (cart.length === 0) {
      setMessage('Cart is empty.');
      return;
    }

    if (paid < total) {
      setMessage('Payment total is less than the cart total.');
      return;
    }

    const transactionPayload = {
      transactionId: crypto.randomUUID(),
      items: cart.map((item) => ({
        productId: item.product.id,
        qty: item.qty,
        unitPrice: item.product.sellingPrice,
        discountAmount: discountSnapshotForItem(item).toFixed(2),
      })),
      payments: payments.map((tender) => ({
        method: tender.method,
        amount: Number(tender.amount).toFixed(2),
        referenceNo: tender.referenceNo || undefined,
      })),
    };

    await saveOfflineTransaction(transactionPayload);
    if (isOnline) {
      await flushSyncQueue();
    }

    setReceipt({
      id: transactionPayload.transactionId,
      total: total.toFixed(2),
      tendered: paid.toFixed(2),
      change: Math.max(paid - total, 0).toFixed(2),
      createdAt: new Date().toISOString(),
      items: cart.map((item) => ({
        name: item.product.name,
        qty: item.qty,
        unitPrice: item.product.sellingPrice,
        discountAmount: discountSnapshotForItem(item).toFixed(2),
      })),
      payments: transactionPayload.payments,
    });
    setCart([]);
    setPayments([]);
    setPayment({ method: 'cash', amount: '', referenceNo: '' });
    if (transactionPayload.payments.some((tender) => tender.method === 'cash')) {
      const opened = await openCashDrawerViaElectron().catch(() => false);
      if (!opened) {
        await openCashDrawerWebSerial().catch(() => false);
      }
    }
    setMessage(isOnline ? 'Transaction saved locally and synced.' : 'Offline transaction saved and queued for sync.');
  }

  function addPayment() {
    if ((payment.method === 'gcash' || payment.method === 'paymaya') && !isOnline) {
      setMessage('GCash and PayMaya QR payments require an internet connection.');
      return;
    }
    if (Number(payment.amount) <= 0) {
      setMessage('Enter a payment amount.');
      return;
    }
    if (payment.method === 'card' && !payment.referenceNo) {
      setMessage('Enter the card approval reference number.');
      return;
    }
    setPayments((items) => [...items, payment]);
    setPayment({ method: 'cash', amount: remaining.toFixed(2), referenceNo: '' });
  }

  async function generateProviderPayment() {
    if (payment.method === 'gcash' || payment.method === 'paymaya') {
      const response = await fetch('/api/payments/qr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: payment.method,
          amount: payment.amount || remaining.toFixed(2),
        }),
      });

      if (!response.ok) {
        setMessage('Unable to generate QR payment.');
        return;
      }

      const result = (await response.json()) as PendingProviderPayment;
      setPendingProviderPayment(result);
      setPayment({ ...payment, amount: result.amount, referenceNo: result.referenceNo });
      setMessage(
        result.manualConfirmationRequired
          ? 'Provider credentials are empty. Use manual confirmation after verifying payment.'
          : 'QR payment generated. Awaiting confirmation.',
      );
      return;
    }

    if (payment.method === 'card') {
      const response = await fetch('/api/payments/card-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: payment.amount || remaining.toFixed(2) }),
      });

      if (!response.ok) {
        setMessage('Unable to create card payment intent.');
        return;
      }

      const result = (await response.json()) as PendingProviderPayment;
      setPendingProviderPayment({ ...result, provider: 'card' });
      setPayment({ ...payment, amount: result.amount, referenceNo: result.referenceNo });
      setMessage(result.instructions ?? 'Follow card terminal instructions.');
    }
  }

  async function confirmProviderPayment() {
    if (!pendingProviderPayment) return;

    const referenceNo =
      window.prompt('Payment reference number', pendingProviderPayment.referenceNo) ??
      pendingProviderPayment.referenceNo;

    const response = await fetch('/api/payments/manual-confirm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        provider: pendingProviderPayment.provider,
        amount: pendingProviderPayment.amount,
        referenceNo,
      }),
    });

    if (!response.ok) {
      setMessage('Unable to confirm payment.');
      return;
    }

    const result = (await response.json()) as { amount: string; referenceNo: string };
    setPayments((items) => [
      ...items,
      {
        method: pendingProviderPayment.provider,
        amount: result.amount,
        referenceNo: result.referenceNo,
      },
    ]);
    setPendingProviderPayment(null);
    setPayment({ method: 'cash', amount: remaining.toFixed(2), referenceNo: '' });
    setMessage('Payment confirmed.');
  }

  async function printReceipt() {
    if (!receipt) return;
    const printed =
      (await printReceiptViaElectron(receipt).catch(() => false)) ||
      (await printEscPosReceipt(receipt).catch(() => false));
    if (!printed) {
      printReceiptFallback();
    }
  }

  async function voidLastTransaction() {
    if (!receipt) return;
    const reason = window.prompt('Void reason');
    if (!reason) return;
    const managerPin = window.prompt('Manager PIN');
    if (!managerPin) return;

    const response = await fetch(`/api/transactions/${receipt.id}/void`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason, managerPin }),
    });

    setMessage(response.ok ? 'Transaction voided and stock restored.' : 'Unable to void transaction.');
    if (response.ok) {
      setReceipt(null);
      await searchProducts();
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
      <section className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search or scan barcode/SKU"
            className="min-w-0 flex-1 rounded-lg border border-zinc-300 px-3 py-2 text-sm"
            autoFocus
          />
          <button className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white">
            Search
          </button>
        </form>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {products.map((product) => (
            <button
              key={product.id}
              onClick={() => addToCart(product)}
              className="rounded-lg border border-zinc-200 p-4 text-left hover:border-zinc-400"
            >
              <div className="font-medium">{product.name}</div>
              <div className="mt-1 text-xs text-zinc-500">
                {product.sku} {product.barcode ? `- ${product.barcode}` : ''}
              </div>
              <div className="mt-3 flex items-center justify-between text-sm">
                <span>PHP {product.sellingPrice}</span>
                <span className={product.stockQty <= 0 ? 'font-semibold text-red-600' : ''}>
                  Stock {product.stockQty}
                </span>
              </div>
              {isExpired(product) ? (
                <div className="mt-2 text-xs font-semibold text-red-600">Expired warning</div>
              ) : null}
            </button>
          ))}
        </div>
      </section>

      <aside className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">Cart</h2>
          <button onClick={() => setCart([])} className="text-sm text-zinc-500 hover:text-zinc-900">
            Clear
          </button>
        </div>

        <div className="mt-4 space-y-3">
          {cart.map((item) => (
            <div key={item.product.id} className="rounded-lg border border-zinc-200 p-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-medium">{item.product.name}</div>
                  <div className="text-xs text-zinc-500">
                    Original PHP {(Number(item.product.sellingPrice) * item.qty).toFixed(2)}
                    {item.discountAmount > 0
                      ? ` less PHP ${item.discountAmount.toFixed(2)} (${item.discountLabel ?? 'discount'})`
                      : ''}
                  </div>
                </div>
                <button
                  onClick={() => updateQty(item.product.id, 0)}
                  className="text-xs text-red-600"
                >
                  Remove
                </button>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateQty(item.product.id, item.qty - 1)}
                    className="rounded border px-2"
                  >
                    -
                  </button>
                  <span>{item.qty}</span>
                  <button
                    onClick={() => updateQty(item.product.id, item.qty + 1)}
                    className="rounded border px-2"
                  >
                    +
                  </button>
                </div>
                <div className="font-semibold">
                  PHP {(Number(item.product.sellingPrice) * item.qty - item.discountAmount).toFixed(2)}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 border-t pt-4">
          <div className="flex justify-between text-sm text-zinc-600">
            <span>Subtotal</span>
            <span>PHP {subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm text-zinc-600">
            <span>Discounts</span>
            <span>PHP {(automaticCartDiscount + manualCartDiscount + cart.reduce((sum, item) => sum + item.discountAmount, 0)).toFixed(2)}</span>
          </div>
          <button
            onClick={() => void applyManualDiscount()}
            className="mt-2 w-full rounded-lg border border-zinc-300 px-4 py-2 text-sm font-semibold"
          >
            Apply Manual Discount
          </button>
          <div className="mt-2 flex justify-between text-xl font-bold">
            <span>Total</span>
            <span>PHP {total.toFixed(2)}</span>
          </div>
          <label className="mt-4 block text-sm font-medium text-zinc-700" htmlFor="paymentMethod">
            Payment Method
          </label>
          <select
            id="paymentMethod"
            value={payment.method}
            onChange={(event) =>
              setPayment({ ...payment, method: event.target.value as Tender['method'] })
            }
            className="mt-2 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
          >
            <option value="cash">Cash</option>
            <option value="gcash" disabled={!isOnline}>
              GCash QR {!isOnline ? '(offline)' : ''}
            </option>
            <option value="paymaya" disabled={!isOnline}>
              PayMaya QR {!isOnline ? '(offline)' : ''}
            </option>
            <option value="card">Card / terminal reference</option>
          </select>
          {(payment.method === 'gcash' || payment.method === 'paymaya') && isOnline ? (
            <div className="mt-3 rounded-lg border border-dashed border-zinc-300 p-4 text-center text-sm">
              Generate a merchant QR payment. Empty credentials use manual confirmation fallback.
            </div>
          ) : null}
          <input
            type="number"
            min="0"
            step="0.01"
            value={payment.amount}
            onChange={(event) => setPayment({ ...payment, amount: event.target.value })}
            placeholder="Amount"
            className="mt-2 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
          />
          {payment.method !== 'cash' ? (
            <input
              value={payment.referenceNo}
              onChange={(event) => setPayment({ ...payment, referenceNo: event.target.value })}
              placeholder="Reference number"
              className="mt-2 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
            />
          ) : null}
          {payment.method !== 'cash' ? (
            <button
              onClick={() => void generateProviderPayment()}
              className="mt-2 w-full rounded-lg border border-zinc-300 px-4 py-2 text-sm font-semibold"
            >
              {payment.method === 'card' ? 'Create Card Intent' : 'Generate QR'}
            </button>
          ) : null}
          {pendingProviderPayment ? (
            <div className="mt-3 rounded-lg border border-zinc-200 bg-zinc-50 p-3 text-sm">
              <div className="font-semibold">{pendingProviderPayment.provider.toUpperCase()} Pending</div>
              {pendingProviderPayment.qrPayload ? (
                <div className="mt-2 rounded bg-white p-3 font-mono text-xs break-all">
                  {pendingProviderPayment.qrPayload}
                </div>
              ) : null}
              {pendingProviderPayment.instructions ? (
                <p className="mt-2 text-zinc-600">{pendingProviderPayment.instructions}</p>
              ) : null}
              {pendingProviderPayment.expiresAt ? (
                <p className="mt-2 text-xs text-zinc-500">
                  Expires {new Date(pendingProviderPayment.expiresAt).toLocaleTimeString()}
                </p>
              ) : null}
              <button
                onClick={() => void confirmProviderPayment()}
                className="mt-3 w-full rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white"
              >
                Manual Confirm
              </button>
            </div>
          ) : null}
          <button
            onClick={addPayment}
            className="mt-2 w-full rounded-lg border border-zinc-300 px-4 py-2 text-sm font-semibold"
          >
            Add Tender
          </button>
          <div className="mt-3 space-y-1 text-sm">
            {payments.map((tender, index) => (
              <div key={`${tender.method}-${index}`} className="flex justify-between text-zinc-600">
                <span>{tender.method.toUpperCase()}</span>
                <span>PHP {Number(tender.amount).toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div className="mt-2 flex justify-between text-sm text-zinc-600">
            <span>Remaining</span>
            <span>PHP {remaining.toFixed(2)}</span>
          </div>
          <div className="mt-2 flex justify-between text-sm text-zinc-600">
            <span>Change</span>
            <span>PHP {Math.max(paid - total, 0).toFixed(2)}</span>
          </div>
          <button
            onClick={() => void completeTransaction()}
            className="mt-4 w-full rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white"
          >
            Complete Cash Sale
          </button>
        </div>
        {message ? <p className="mt-4 rounded-lg bg-zinc-100 p-3 text-sm">{message}</p> : null}
        {receipt ? (
          <div className="mt-4">
            <Receipt receipt={receipt} />
            <button
              onClick={() => void printReceipt()}
              className="mt-3 w-full rounded-lg border border-zinc-300 px-4 py-2 text-sm font-semibold"
            >
              Print / Save PDF
            </button>
            <button
              onClick={() => void voidLastTransaction()}
              className="mt-2 w-full rounded-lg border border-red-300 px-4 py-2 text-sm font-semibold text-red-700"
            >
              Void Last Transaction
            </button>
          </div>
        ) : null}
      </aside>
    </div>
  );
}
