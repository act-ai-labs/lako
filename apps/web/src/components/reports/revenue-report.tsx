'use client';

import { useEffect, useState } from 'react';
import { downloadCsv, printPdfFallback } from './report-utils';

interface RevenueReportData {
  revenue: string;
  productSales: string;
  gcashServiceIncome: string;
  cogs: string;
  grossProfit: string;
  expenses: string;
  netProfit: string;
  byExpenseCategory: Array<{ category: string; amount: string }>;
}

export function RevenueReport() {
  const [data, setData] = useState<RevenueReportData | null>(null);
  const [compare, setCompare] = useState(false);

  useEffect(() => {
    void fetch('/api/reports/revenue').then(async (response) => setData((await response.json()) as RevenueReportData));
  }, []);

  if (!data) return <p>Loading revenue report...</p>;
  const rows = [
    { metric: 'Revenue', amount: data.revenue },
    { metric: 'Product Sales', amount: data.productSales },
    { metric: 'GCash Service Income', amount: data.gcashServiceIncome },
    { metric: 'COGS', amount: data.cogs },
    { metric: 'Gross Profit', amount: data.grossProfit },
    { metric: 'Expenses', amount: data.expenses },
    { metric: 'Net Profit', amount: data.netProfit },
  ];

  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        <button onClick={() => downloadCsv('revenue.csv', rows)} className="rounded border px-3 py-2 text-sm">Export CSV</button>
        <button onClick={printPdfFallback} className="rounded border px-3 py-2 text-sm">Export PDF</button>
        <button onClick={() => setCompare(!compare)} className="rounded border px-3 py-2 text-sm">Toggle Period Comparison</button>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {rows.map((row) => <div key={row.metric} className="rounded border bg-white p-4"><div className="text-sm text-zinc-500">{row.metric}</div><div className="text-xl font-bold">PHP {row.amount}</div></div>)}
      </div>
      {compare ? <div className="rounded border bg-white p-4 text-sm">Comparison view ready: select two periods in future controls; current period values shown as baseline.</div> : null}
      <section className="rounded border bg-white p-4">
        <h2 className="font-semibold">Expenses by Category</h2>
        <ul className="mt-2 list-disc pl-5 text-sm">
          {data.byExpenseCategory.map((row) => <li key={row.category}>{row.category}: PHP {row.amount}</li>)}
        </ul>
      </section>
    </div>
  );
}
