import { InventoryManager } from '@/components/inventory/inventory-manager';

export default function InventoryPage() {
  return (
    <div className="px-6 py-8">
      <h1 className="text-2xl font-bold">Inventory</h1>
      <p className="mt-2 text-zinc-600">
        Product catalog, categories, stock adjustments, barcode lookup, and CSV import.
      </p>
      <div className="mt-6">
        <InventoryManager />
      </div>
    </div>
  );
}
