import { InventoryReport } from '@/components/reports/inventory-report';

export default function InventoryReportsPage() {
  return (
    <div className="px-6 py-8">
      <h1 className="text-2xl font-bold">Inventory Reports</h1>
      <p className="mt-2 text-zinc-600">Expiring, non-moving, low-stock, and inventory valuation reports.</p>
      <div className="mt-6">
        <InventoryReport />
      </div>
    </div>
  );
}
