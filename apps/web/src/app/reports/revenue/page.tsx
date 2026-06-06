import { RevenueReport } from '@/components/reports/revenue-report';

export default function RevenueReportPage() {
  return (
    <div className="px-6 py-8">
      <h1 className="text-2xl font-bold">Revenue Report</h1>
      <p className="mt-2 text-zinc-600">Income statement with sales, GCash services, COGS, expenses, and profit.</p>
      <div className="mt-6">
        <RevenueReport />
      </div>
    </div>
  );
}
