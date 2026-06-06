'use client';

import { useEffect, useState } from 'react';
import { downloadCsv } from './report-utils';

interface SalesReportData {
  totals: { revenue: string; transactions: number; averageTransaction: string; unitsSold: number };
  byProduct: Array<{ product: string; units: number; revenue: number; cogs: number }>;
  byCategory: Array<{ category: string; units: number; revenue: number }>;
  byPayment: Array<{ method: string; amount: string }>;
}

export function SalesReport() {
  const [data, setData] = useState<SalesReportData | null>(null);

  useEffect(() => {
    void fetch('/api/reports/sales').then(async (response) => setData((await response.json()) as SalesReportData));
  }, []);

  if (!data) return <p>Loading sales report...</p>;

  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-4">
        <Metric label="Revenue" value={`PHP ${data.totals.revenue}`} />
        <Metric label="Transactions" value={data.totals.transactions} />
        <Metric label="Avg Transaction" value={`PHP ${data.totals.averageTransaction}`} />
        <Metric label="Units Sold" value={data.totals.unitsSold} />
      </div>
      <button onClick={() => downloadCsv('sales-products.csv', data.byProduct)} className="rounded border px-3 py-2 text-sm">Export Product CSV</button>
      <ReportList title="Per Product" rows={data.byProduct.map((row) => `${row.product}: ${row.units} units, PHP ${row.revenue.toFixed(2)}, COGS PHP ${row.cogs.toFixed(2)}`)} />
      <ReportList title="Top Sellers" rows={[...data.byProduct].sort((a, b) => b.units - a.units).map((row) => `${row.product}: ${row.units} units`)} />
      <ReportList title="By Category" rows={data.byCategory.map((row) => `${row.category}: ${row.units} units, PHP ${row.revenue.toFixed(2)}`)} />
      <ReportList title="By Payment Method" rows={data.byPayment.map((row) => `${row.method}: PHP ${row.amount}`)} />
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return <div className="rounded border bg-white p-4"><div className="text-sm text-zinc-500">{label}</div><div className="text-xl font-bold">{value}</div></div>;
}

function ReportList({ title, rows }: { title: string; rows: string[] }) {
  return <section className="rounded border bg-white p-4"><h2 className="font-semibold">{title}</h2><ul className="mt-2 list-disc pl-5 text-sm">{rows.map((row) => <li key={row}>{row}</li>)}</ul></section>;
}
