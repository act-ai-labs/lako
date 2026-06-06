import { SalesReport } from '@/components/reports/sales-report';

export default function SalesReportPage() {
  return (
    <div className="px-6 py-8">
      <h1 className="text-2xl font-bold">Sales Report</h1>
      <p className="mt-2 text-zinc-600">Revenue, transaction count, products, categories, top sellers, and tenders.</p>
      <div className="mt-6">
        <SalesReport />
      </div>
    </div>
  );
}
