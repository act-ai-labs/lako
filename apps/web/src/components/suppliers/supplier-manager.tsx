'use client';

import { FormEvent, useCallback, useEffect, useState } from 'react';

interface Supplier {
  id: string;
  name: string;
  contact: string | null;
  paymentTerms: string | null;
  notes: string | null;
}

interface Product {
  id: string;
  name: string;
}

interface PurchaseOrder {
  id: string;
  status: string;
  expectedDate: string | null;
  supplier: Supplier;
  items: Array<{ orderedQty: number; receivedQty: number; unitCost: string; product: Product }>;
}

interface Delivery {
  id: string;
  receivedAt: string;
  notes: string | null;
  discrepancyNotes: string | null;
  supplier: Supplier;
  purchaseOrder: PurchaseOrder | null;
  items: Array<{ receivedQty: number; product: Product }>;
}

const emptySupplier = { name: '', contact: '', paymentTerms: '', notes: '' };

export function SupplierManager() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [supplierForm, setSupplierForm] = useState(emptySupplier);
  const [editingSupplierId, setEditingSupplierId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [poForm, setPoForm] = useState({
    supplierId: '',
    productId: '',
    orderedQty: 1,
    unitCost: '0',
    expectedDate: '',
  });
  const [deliveryForm, setDeliveryForm] = useState({
    supplierId: '',
    poId: '',
    productId: '',
    receivedQty: 1,
    notes: '',
    discrepancyNotes: '',
  });
  const [message, setMessage] = useState<string | null>(null);

  const loadAll = useCallback(async () => {
    const [supplierResponse, productResponse, poResponse, deliveryResponse] = await Promise.all([
      fetch(`/api/suppliers${search ? `?search=${encodeURIComponent(search)}` : ''}`),
      fetch('/api/inventory/products'),
      fetch(`/api/purchase-orders${status ? `?status=${status}` : ''}`),
      fetch('/api/deliveries'),
    ]);
    if (supplierResponse.ok) setSuppliers((await supplierResponse.json()) as Supplier[]);
    if (productResponse.ok) setProducts((await productResponse.json()) as Product[]);
    if (poResponse.ok) setPurchaseOrders((await poResponse.json()) as PurchaseOrder[]);
    if (deliveryResponse.ok) setDeliveries((await deliveryResponse.json()) as Delivery[]);
  }, [search, status]);

  useEffect(() => {
    // Supplier and PO lists are client-owned state synchronized from the API.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadAll();
  }, [loadAll]);

  async function saveSupplier(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const response = await fetch(
      editingSupplierId ? `/api/suppliers/${editingSupplierId}` : '/api/suppliers',
      {
        method: editingSupplierId ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(supplierForm),
      },
    );
    setMessage(response.ok ? 'Supplier saved.' : 'Unable to save supplier.');
    if (response.ok) {
      setSupplierForm(emptySupplier);
      setEditingSupplierId(null);
      await loadAll();
    }
  }

  async function createPurchaseOrder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const response = await fetch('/api/purchase-orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        supplierId: poForm.supplierId,
        expectedDate: poForm.expectedDate || undefined,
        items: [
          {
            productId: poForm.productId,
            orderedQty: poForm.orderedQty,
            unitCost: poForm.unitCost,
          },
        ],
      }),
    });
    setMessage(response.ok ? 'Purchase order created.' : 'Unable to create purchase order.');
    if (response.ok) await loadAll();
  }

  async function receiveDelivery(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const response = await fetch('/api/deliveries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        supplierId: deliveryForm.supplierId,
        poId: deliveryForm.poId || undefined,
        notes: deliveryForm.notes || undefined,
        discrepancyNotes: deliveryForm.discrepancyNotes || undefined,
        items: [{ productId: deliveryForm.productId, receivedQty: deliveryForm.receivedQty }],
      }),
    });
    setMessage(response.ok ? 'Delivery received and stock updated.' : 'Unable to receive delivery.');
    if (response.ok) await loadAll();
  }

  function editSupplier(supplier: Supplier) {
    setEditingSupplierId(supplier.id);
    setSupplierForm({
      name: supplier.name,
      contact: supplier.contact ?? '',
      paymentTerms: supplier.paymentTerms ?? '',
      notes: supplier.notes ?? '',
    });
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_420px]">
      <section className="rounded-xl border bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search suppliers"
            className="flex-1 rounded border px-3 py-2"
          />
          <select value={status} onChange={(event) => setStatus(event.target.value)} className="rounded border px-3 py-2">
            <option value="">All PO statuses</option>
            <option value="pending">Pending</option>
            <option value="partially_received">Partially received</option>
            <option value="received">Received</option>
          </select>
        </div>

        <h2 className="mt-6 font-semibold">Suppliers</h2>
        <div className="mt-3 space-y-2">
          {suppliers.map((supplier) => (
            <button key={supplier.id} onClick={() => editSupplier(supplier)} className="w-full rounded border p-3 text-left">
              <div className="font-medium">{supplier.name}</div>
              <div className="text-sm text-zinc-500">{supplier.contact ?? 'No contact'}</div>
              <div className="text-sm text-zinc-500">Payment terms: {supplier.paymentTerms ?? 'Not set'}</div>
            </button>
          ))}
        </div>

        <h2 className="mt-6 font-semibold">Purchase Orders</h2>
        <div className="mt-3 space-y-2">
          {purchaseOrders.map((po) => (
            <div key={po.id} className="rounded border p-3 text-sm">
              <div className="flex justify-between">
                <span className="font-medium">{po.supplier.name}</span>
                <span>{po.status}</span>
              </div>
              <div className="text-zinc-500">Supplier terms: {po.supplier.paymentTerms ?? 'Not set'}</div>
              <div className="text-zinc-500">Expected: {po.expectedDate ?? '-'}</div>
              {po.items.map((item, index) => (
                <div key={`${po.id}-${index}`} className="mt-1">
                  {item.product.name}: {item.orderedQty} ordered, {item.receivedQty} received @ PHP {item.unitCost}
                </div>
              ))}
            </div>
          ))}
        </div>

        <h2 className="mt-6 font-semibold">Delivery History</h2>
        <div className="mt-3 space-y-2">
          {deliveries.map((delivery) => (
            <div key={delivery.id} className="rounded border p-3 text-sm">
              <div className="flex justify-between">
                <span className="font-medium">{delivery.supplier.name}</span>
                <span>{new Date(delivery.receivedAt).toLocaleDateString()}</span>
              </div>
              <div className="text-zinc-500">
                PO: {delivery.purchaseOrder?.id.slice(0, 8) ?? 'Walk-in delivery'}
              </div>
              {delivery.items.map((item, index) => (
                <div key={`${delivery.id}-${index}`}>
                  {item.product.name}: {item.receivedQty} received
                </div>
              ))}
              {delivery.discrepancyNotes ? (
                <div className="mt-1 text-amber-700">Discrepancy: {delivery.discrepancyNotes}</div>
              ) : null}
            </div>
          ))}
        </div>
      </section>

      <aside className="space-y-6">
        <form onSubmit={saveSupplier} className="rounded-xl border bg-white p-4 shadow-sm">
          <h2 className="font-semibold">{editingSupplierId ? 'Edit Supplier' : 'Add Supplier'}</h2>
          <div className="mt-3 grid gap-3">
            <input className="rounded border px-3 py-2" placeholder="Name" value={supplierForm.name} onChange={(event) => setSupplierForm({ ...supplierForm, name: event.target.value })} required />
            <input className="rounded border px-3 py-2" placeholder="Contact" value={supplierForm.contact} onChange={(event) => setSupplierForm({ ...supplierForm, contact: event.target.value })} />
            <input className="rounded border px-3 py-2" placeholder="Payment terms" value={supplierForm.paymentTerms} onChange={(event) => setSupplierForm({ ...supplierForm, paymentTerms: event.target.value })} />
            <textarea className="rounded border px-3 py-2" placeholder="Notes" value={supplierForm.notes} onChange={(event) => setSupplierForm({ ...supplierForm, notes: event.target.value })} />
          </div>
          <button className="mt-3 w-full rounded bg-zinc-900 px-4 py-2 text-sm font-semibold text-white">
            Save Supplier
          </button>
        </form>

        <form onSubmit={createPurchaseOrder} className="rounded-xl border bg-white p-4 shadow-sm">
          <h2 className="font-semibold">Create Purchase Order</h2>
          <div className="mt-3 grid gap-3">
            <select className="rounded border px-3 py-2" value={poForm.supplierId} onChange={(event) => setPoForm({ ...poForm, supplierId: event.target.value })} required>
              <option value="">Select supplier</option>
              {suppliers.map((supplier) => <option key={supplier.id} value={supplier.id}>{supplier.name}</option>)}
            </select>
            <select className="rounded border px-3 py-2" value={poForm.productId} onChange={(event) => setPoForm({ ...poForm, productId: event.target.value })} required>
              <option value="">Select product</option>
              {products.map((product) => <option key={product.id} value={product.id}>{product.name}</option>)}
            </select>
            <input type="number" className="rounded border px-3 py-2" value={poForm.orderedQty} onChange={(event) => setPoForm({ ...poForm, orderedQty: Number(event.target.value) })} min={1} />
            <input className="rounded border px-3 py-2" value={poForm.unitCost} onChange={(event) => setPoForm({ ...poForm, unitCost: event.target.value })} placeholder="Unit cost" />
            <input type="date" className="rounded border px-3 py-2" value={poForm.expectedDate} onChange={(event) => setPoForm({ ...poForm, expectedDate: event.target.value })} />
          </div>
          <button className="mt-3 w-full rounded bg-zinc-900 px-4 py-2 text-sm font-semibold text-white">
            Create PO
          </button>
        </form>

        <form onSubmit={receiveDelivery} className="rounded-xl border bg-white p-4 shadow-sm">
          <h2 className="font-semibold">Receive Delivery</h2>
          <div className="mt-3 grid gap-3">
            <select className="rounded border px-3 py-2" value={deliveryForm.supplierId} onChange={(event) => setDeliveryForm({ ...deliveryForm, supplierId: event.target.value })} required>
              <option value="">Select supplier</option>
              {suppliers.map((supplier) => <option key={supplier.id} value={supplier.id}>{supplier.name}</option>)}
            </select>
            <select className="rounded border px-3 py-2" value={deliveryForm.poId} onChange={(event) => setDeliveryForm({ ...deliveryForm, poId: event.target.value })}>
              <option value="">Walk-in delivery (no PO)</option>
              {purchaseOrders.map((po) => <option key={po.id} value={po.id}>{po.supplier.name} PO {po.id.slice(0, 8)}</option>)}
            </select>
            <select className="rounded border px-3 py-2" value={deliveryForm.productId} onChange={(event) => setDeliveryForm({ ...deliveryForm, productId: event.target.value })} required>
              <option value="">Select product</option>
              {products.map((product) => <option key={product.id} value={product.id}>{product.name}</option>)}
            </select>
            <input type="number" min={1} className="rounded border px-3 py-2" value={deliveryForm.receivedQty} onChange={(event) => setDeliveryForm({ ...deliveryForm, receivedQty: Number(event.target.value) })} />
            <textarea className="rounded border px-3 py-2" placeholder="Notes" value={deliveryForm.notes} onChange={(event) => setDeliveryForm({ ...deliveryForm, notes: event.target.value })} />
            <textarea className="rounded border px-3 py-2" placeholder="Discrepancy notes" value={deliveryForm.discrepancyNotes} onChange={(event) => setDeliveryForm({ ...deliveryForm, discrepancyNotes: event.target.value })} />
          </div>
          <button className="mt-3 w-full rounded bg-zinc-900 px-4 py-2 text-sm font-semibold text-white">
            Confirm Delivery
          </button>
        </form>
        {message ? <p className="rounded bg-zinc-100 p-3 text-sm">{message}</p> : null}
      </aside>
    </div>
  );
}
