'use client';

import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';

interface Category {
  id: string;
  name: string;
}

interface Product {
  id: string;
  sku: string;
  name: string;
  categoryId: string | null;
  category?: Category | null;
  unitCost: string;
  sellingPrice: string;
  stockQty: number;
  reorderPoint: number;
  expiryDate: string | null;
  barcode: string | null;
}

const emptyProduct = {
  sku: '',
  name: '',
  categoryId: '',
  unitCost: '0',
  sellingPrice: '',
  stockQty: 0,
  reorderPoint: 0,
  expiryDate: '',
  barcode: '',
};

export function InventoryManager() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState(emptyProduct);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [categoryName, setCategoryName] = useState('');
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [csv, setCsv] = useState('');
  const [message, setMessage] = useState<string | null>(null);

  const query = useMemo(() => {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (categoryFilter) params.set('categoryId', categoryFilter);
    return params.toString();
  }, [categoryFilter, search]);

  const loadInventory = useCallback(async () => {
    const [productResponse, categoryResponse] = await Promise.all([
      fetch(`/api/inventory/products${query ? `?${query}` : ''}`),
      fetch('/api/inventory/categories'),
    ]);

    if (productResponse.ok) {
      setProducts((await productResponse.json()) as Product[]);
    }
    if (categoryResponse.ok) {
      setCategories((await categoryResponse.json()) as Category[]);
    }
  }, [query]);

  useEffect(() => {
    // The inventory list is client-owned state synchronized from the API.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadInventory();
  }, [loadInventory]);

  async function submitProduct(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);

    const response = await fetch(
      editingId ? `/api/inventory/products/${editingId}` : '/api/inventory/products',
      {
        method: editingId ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          categoryId: form.categoryId || undefined,
          expiryDate: form.expiryDate || undefined,
          barcode: form.barcode || undefined,
          stockQty: Number(form.stockQty),
          reorderPoint: Number(form.reorderPoint),
        }),
      },
    );

    setMessage(response.ok ? 'Product saved.' : 'Unable to save product.');
    if (response.ok) {
      setForm(emptyProduct);
      setEditingId(null);
      await loadInventory();
    }
  }

  function editProduct(product: Product) {
    setEditingId(product.id);
    setForm({
      sku: product.sku,
      name: product.name,
      categoryId: product.categoryId ?? '',
      unitCost: product.unitCost,
      sellingPrice: product.sellingPrice,
      stockQty: product.stockQty,
      reorderPoint: product.reorderPoint,
      expiryDate: product.expiryDate ?? '',
      barcode: product.barcode ?? '',
    });
  }

  async function renameCategory(category: Category) {
    const name = window.prompt('Rename category', category.name);
    if (!name) return;

    const response = await fetch(`/api/inventory/categories/${category.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    });

    setMessage(response.ok ? 'Category renamed.' : 'Unable to rename category.');
    if (response.ok) {
      await loadInventory();
    }
  }

  async function createCategory(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const response = await fetch('/api/inventory/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: categoryName }),
    });

    setMessage(response.ok ? 'Category saved.' : 'Unable to save category.');
    if (response.ok) {
      setCategoryName('');
      await loadInventory();
    }
  }

  async function adjustStock(product: Product, qtyChange: number) {
    const reason = window.prompt('Reason for stock adjustment');
    if (!reason) return;

    const response = await fetch(`/api/inventory/products/${product.id}/stock-adjustments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ qtyChange, reason }),
    });

    setMessage(response.ok ? 'Stock adjusted.' : 'Unable to adjust stock.');
    if (response.ok) {
      await loadInventory();
    }
  }

  async function importCsv(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const response = await fetch('/api/inventory/products/import-csv', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ csv }),
    });
    const result = (await response.json()) as { imported?: number; skipped?: number };
    setMessage(
      response.ok
        ? `CSV import complete: ${result.imported ?? 0} imported, ${result.skipped ?? 0} skipped.`
        : 'CSV import failed.',
    );
    if (response.ok) {
      setCsv('');
      await loadInventory();
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <section className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by name, SKU, or barcode"
            className="flex-1 rounded-lg border border-zinc-300 px-3 py-2 text-sm"
          />
          <select
            value={categoryFilter}
            onChange={(event) => setCategoryFilter(event.target.value)}
            className="rounded-lg border border-zinc-300 px-3 py-2 text-sm"
          >
            <option value="">All categories</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="border-b border-zinc-200 text-zinc-500">
              <tr>
                <th className="py-2">Product</th>
                <th>SKU / Barcode</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Expiry</th>
                <th>Adjust</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => {
                const expired = product.expiryDate
                  ? new Date(product.expiryDate) <= new Date()
                  : false;
                const lowStock = product.stockQty <= product.reorderPoint;
                return (
                  <tr key={product.id} className="border-b border-zinc-100">
                    <td className="py-3 font-medium">{product.name}</td>
                    <td>
                      <div>{product.sku}</div>
                      <div className="text-xs text-zinc-500">{product.barcode ?? 'No barcode'}</div>
                    </td>
                    <td>{product.category?.name ?? 'Uncategorized'}</td>
                    <td>PHP {product.sellingPrice}</td>
                    <td>
                      <span className={lowStock ? 'font-semibold text-red-600' : ''}>
                        {product.stockQty}
                      </span>
                      <span className="text-zinc-500"> / reorder {product.reorderPoint}</span>
                    </td>
                    <td className={expired ? 'font-semibold text-red-600' : ''}>
                      {product.expiryDate ?? '-'}
                    </td>
                    <td>
                      <div className="flex gap-2">
                        <button
                          onClick={() => editProduct(product)}
                          className="rounded border px-2 py-1"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => void adjustStock(product, 1)}
                          className="rounded border px-2 py-1"
                        >
                          +1
                        </button>
                        <button
                          onClick={() => void adjustStock(product, -1)}
                          className="rounded border px-2 py-1"
                        >
                          -1
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <aside className="space-y-6">
        <form onSubmit={submitProduct} className="rounded-xl border bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">{editingId ? 'Edit Product' : 'Add Product'}</h2>
            {editingId ? (
              <button
                type="button"
                onClick={() => {
                  setEditingId(null);
                  setForm(emptyProduct);
                }}
                className="text-sm text-zinc-500 hover:text-zinc-900"
              >
                Cancel
              </button>
            ) : null}
          </div>
          <div className="mt-4 grid gap-3">
            <input className="rounded border px-3 py-2" placeholder="SKU" value={form.sku} onChange={(event) => setForm({ ...form, sku: event.target.value })} required />
            <input className="rounded border px-3 py-2" placeholder="Name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required />
            <select className="rounded border px-3 py-2" value={form.categoryId} onChange={(event) => setForm({ ...form, categoryId: event.target.value })}>
              <option value="">Uncategorized</option>
              {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
            </select>
            <input className="rounded border px-3 py-2" placeholder="Barcode / scan HID input" value={form.barcode} onChange={(event) => setForm({ ...form, barcode: event.target.value })} />
            <input className="rounded border px-3 py-2" placeholder="Unit cost" value={form.unitCost} onChange={(event) => setForm({ ...form, unitCost: event.target.value })} required />
            <input className="rounded border px-3 py-2" placeholder="Selling price" value={form.sellingPrice} onChange={(event) => setForm({ ...form, sellingPrice: event.target.value })} required />
            <input type="number" className="rounded border px-3 py-2" placeholder="Initial stock" value={form.stockQty} onChange={(event) => setForm({ ...form, stockQty: Number(event.target.value) })} />
            <input type="number" className="rounded border px-3 py-2" placeholder="Reorder point" value={form.reorderPoint} onChange={(event) => setForm({ ...form, reorderPoint: Number(event.target.value) })} />
            <input type="date" className="rounded border px-3 py-2" value={form.expiryDate} onChange={(event) => setForm({ ...form, expiryDate: event.target.value })} />
          </div>
          <button className="mt-4 w-full rounded bg-zinc-900 px-4 py-2 text-sm font-semibold text-white">
            Save Product
          </button>
        </form>

        <form onSubmit={createCategory} className="rounded-xl border bg-white p-4 shadow-sm">
          <h2 className="font-semibold">Categories</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category.id}
                type="button"
                onClick={() => void renameCategory(category)}
                className="rounded-full border border-zinc-300 px-3 py-1 text-xs"
              >
                {category.name}
              </button>
            ))}
          </div>
          <div className="mt-3 flex gap-2">
            <input className="min-w-0 flex-1 rounded border px-3 py-2" value={categoryName} onChange={(event) => setCategoryName(event.target.value)} placeholder="New category" required />
            <button className="rounded bg-zinc-900 px-3 py-2 text-sm font-semibold text-white">Add</button>
          </div>
        </form>

        <form onSubmit={importCsv} className="rounded-xl border bg-white p-4 shadow-sm">
          <h2 className="font-semibold">CSV Import</h2>
          <p className="mt-1 text-xs text-zinc-500">
            Headers: sku,name,sellingPrice,unitCost,stockQty,reorderPoint,barcode,expiryDate
          </p>
          <textarea className="mt-3 h-32 w-full rounded border px-3 py-2 text-sm" value={csv} onChange={(event) => setCsv(event.target.value)} />
          <button className="mt-3 w-full rounded bg-zinc-900 px-4 py-2 text-sm font-semibold text-white">
            Import CSV
          </button>
        </form>

        {message ? <p className="rounded-lg bg-zinc-100 p-3 text-sm">{message}</p> : null}
      </aside>
    </div>
  );
}
