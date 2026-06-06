import { SupplierManager } from '@/components/suppliers/supplier-manager';

export default function SuppliersPage() {
  return (
    <div className="px-6 py-8">
      <h1 className="text-2xl font-bold">Suppliers</h1>
      <p className="mt-2 text-zinc-600">
        Supplier directory, payment terms, purchase orders, and receiving readiness.
      </p>
      <div className="mt-6">
        <SupplierManager />
      </div>
    </div>
  );
}
