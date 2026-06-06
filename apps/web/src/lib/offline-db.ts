import { PGlite } from '@electric-sql/pglite';

export interface OfflineProduct {
  id: string;
  sku: string;
  name: string;
  categoryId: string | null;
  sellingPrice: string;
  stockQty: number;
  expiryDate: string | null;
  barcode: string | null;
}

export interface OfflineTransactionPayload {
  transactionId: string;
  items: Array<{
    productId: string;
    qty: number;
    unitPrice: string;
    discountAmount: string;
  }>;
  payments: Array<{
    method: string;
    amount: string;
    referenceNo?: string;
  }>;
}

let dbPromise: Promise<PGlite> | null = null;

export function getOfflineDb() {
  dbPromise ??= initOfflineDb();
  return dbPromise;
}

async function initOfflineDb() {
  const db = new PGlite('idb://lako-pos');
  await db.exec(`
    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      sku TEXT NOT NULL,
      name TEXT NOT NULL,
      category_id TEXT,
      selling_price TEXT NOT NULL,
      stock_qty INTEGER NOT NULL DEFAULT 0,
      expiry_date TEXT,
      barcode TEXT,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS transactions (
      id TEXT PRIMARY KEY,
      total TEXT NOT NULL,
      status TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS transaction_items (
      id TEXT PRIMARY KEY,
      transaction_id TEXT NOT NULL,
      product_id TEXT NOT NULL,
      qty INTEGER NOT NULL,
      unit_price TEXT NOT NULL,
      discount_amount TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS payments (
      id TEXT PRIMARY KEY,
      transaction_id TEXT NOT NULL,
      method TEXT NOT NULL,
      amount TEXT NOT NULL,
      reference_no TEXT
    );

    CREATE TABLE IF NOT EXISTS sync_queue (
      id TEXT PRIMARY KEY,
      operation TEXT NOT NULL,
      payload TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      error_message TEXT,
      created_at TEXT NOT NULL,
      synced_at TEXT
    );

    CREATE TABLE IF NOT EXISTS sync_conflicts (
      id TEXT PRIMARY KEY,
      queue_id TEXT NOT NULL,
      reason TEXT NOT NULL,
      payload TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
  `);
  return db;
}

export async function cacheProducts(products: OfflineProduct[]) {
  const db = await getOfflineDb();
  for (const product of products) {
    await db.query(
      `INSERT INTO products (id, sku, name, category_id, selling_price, stock_qty, expiry_date, barcode, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       ON CONFLICT (id) DO UPDATE SET
         sku = EXCLUDED.sku,
         name = EXCLUDED.name,
         category_id = EXCLUDED.category_id,
         selling_price = EXCLUDED.selling_price,
         stock_qty = EXCLUDED.stock_qty,
         expiry_date = EXCLUDED.expiry_date,
         barcode = EXCLUDED.barcode,
         updated_at = EXCLUDED.updated_at`,
      [
        product.id,
        product.sku,
        product.name,
        product.categoryId,
        product.sellingPrice,
        product.stockQty,
        product.expiryDate,
        product.barcode,
        new Date().toISOString(),
      ],
    );
  }
}

export async function searchOfflineProducts(search: string): Promise<OfflineProduct[]> {
  const db = await getOfflineDb();
  const pattern = `%${search.toLowerCase()}%`;
  const result = await db.query<{
    id: string;
    sku: string;
    name: string;
    category_id: string | null;
    selling_price: string;
    stock_qty: number;
    expiry_date: string | null;
    barcode: string | null;
  }>(
    `SELECT * FROM products
     WHERE lower(name) LIKE $1 OR lower(sku) LIKE $1 OR lower(coalesce(barcode, '')) LIKE $1
     ORDER BY name ASC`,
    [pattern],
  );

  return result.rows.map((row) => ({
    id: row.id,
    sku: row.sku,
    name: row.name,
    categoryId: row.category_id,
    sellingPrice: row.selling_price,
    stockQty: row.stock_qty,
    expiryDate: row.expiry_date,
    barcode: row.barcode,
  }));
}

export async function saveOfflineTransaction(payload: OfflineTransactionPayload) {
  const db = await getOfflineDb();
  const total = payload.items.reduce(
    (sum, item) => sum + Number(item.unitPrice) * item.qty - Number(item.discountAmount),
    0,
  );

  await db.transaction(async (tx) => {
    await tx.query(`INSERT INTO transactions (id, total, status, created_at) VALUES ($1, $2, $3, $4)`, [
      payload.transactionId,
      total.toFixed(2),
      'completed',
      new Date().toISOString(),
    ]);

    for (const item of payload.items) {
      const stock = await tx.query<{ stock_qty: number }>(`SELECT stock_qty FROM products WHERE id = $1`, [
        item.productId,
      ]);
      const available = stock.rows[0]?.stock_qty ?? 0;
      if (available < item.qty) {
        throw new Error(`Offline stock conflict for product ${item.productId}`);
      }
      await tx.query(`UPDATE products SET stock_qty = stock_qty - $1 WHERE id = $2`, [
        item.qty,
        item.productId,
      ]);
      await tx.query(
        `INSERT INTO transaction_items (id, transaction_id, product_id, qty, unit_price, discount_amount)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [crypto.randomUUID(), payload.transactionId, item.productId, item.qty, item.unitPrice, item.discountAmount],
      );
    }

    for (const payment of payload.payments) {
      await tx.query(
        `INSERT INTO payments (id, transaction_id, method, amount, reference_no)
         VALUES ($1, $2, $3, $4, $5)`,
        [crypto.randomUUID(), payload.transactionId, payment.method, payment.amount, payment.referenceNo ?? null],
      );
    }

    await tx.query(
      `INSERT INTO sync_queue (id, operation, payload, status, created_at)
       VALUES ($1, $2, $3, $4, $5)`,
      [crypto.randomUUID(), 'complete_transaction', JSON.stringify(payload), 'pending', new Date().toISOString()],
    );
  });
}

export async function getSyncStatus() {
  const db = await getOfflineDb();
  const pending = await db.query<{ count: number }>(
    `SELECT count(*)::int AS count FROM sync_queue WHERE status = 'pending'`,
  );
  const conflicts = await db.query<{ count: number }>(`SELECT count(*)::int AS count FROM sync_conflicts`);
  return {
    pending: pending.rows[0]?.count ?? 0,
    conflicts: conflicts.rows[0]?.count ?? 0,
  };
}

export async function flushSyncQueue() {
  const db = await getOfflineDb();
  const result = await db.query<{ id: string; payload: string }>(
    `SELECT id, payload FROM sync_queue WHERE status = 'pending' ORDER BY created_at ASC`,
  );

  for (const row of result.rows) {
    const response = await fetch('/api/transactions/complete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: row.payload,
    });

    if (response.ok) {
      await db.query(`UPDATE sync_queue SET status = 'synced', synced_at = $1 WHERE id = $2`, [
        new Date().toISOString(),
        row.id,
      ]);
      continue;
    }

    const error = await response.text();
    await db.query(`UPDATE sync_queue SET status = 'conflict', error_message = $1 WHERE id = $2`, [
      error,
      row.id,
    ]);
    await db.query(
      `INSERT INTO sync_conflicts (id, queue_id, reason, payload, created_at)
       VALUES ($1, $2, $3, $4, $5)`,
      [crypto.randomUUID(), row.id, error || 'Sync conflict', row.payload, new Date().toISOString()],
    );
  }
}
