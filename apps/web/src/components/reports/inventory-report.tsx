'use client';

import { FormEvent, useCallback, useEffect, useState } from 'react';
import { downloadCsv } from './report-utils';

interface ProductRow {
  id: string;
  sku: string;
  name: string;
  stockQty: number;
  reorderPoint?: number;
  expiryDate?: string | null;
  unitCost?: string;
  totalValue?: string;
}

interface InventoryReportData {
  expiring: ProductRow[];
  lowStock: ProductRow[];
  nonMoving: ProductRow[];
  valuation: ProductRow[];
  grandTotal: string;
}

export function InventoryReport() {
  const [leadDays, setLeadDays] = useState(30);
  const [inactivityDays, setInactivityDays] = useState(30);
  const [data, setData] = useState<InventoryReportData | null>(null);

  const loadReport = useCallback(async () => {
    const response = await fetch(`/api/reports/inventory?leadDays=${leadDays}&inactivityDays=${inactivityDays}`);
    if (response.ok) setData((await response.json()) as InventoryReportData);
  }, [inactivityDays, leadDays]);

  useEffect(() => {
    // Inventory report data is synchronized from the API.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadReport();
  }, [loadReport]);

  function applySettings(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void loadReport();
  }

  if (!data) return <p>Loading inventory report...</p>;

  return (
    <div className="space-y-6">
      <form onSubmit={applySettings} className="flex flex-wrap gap-2 rounded border bg-white p-4">
        <input type="number" value={leadDays} onChange={(event) => setLeadDays(Number(event.target.value))} className="rounded border px-3 py-2" />
        <input type="number" value={inactivityDays} onChange={(event) => setInactivityDays(Number(event.target.value))} className="rounded border px-3 py-2" />
        <button className="rounded bg-zinc-900 px-3 py-2 text-sm font-semibold text-white">Apply thresholds</button>
      </form>
      <button
        onClick={() =>
          downloadCsv(
            'inventory-valuation.csv',
            data.valuation.map((row) => ({
              sku: row.sku,
              name: row.name,
              stockQty: row.stockQty,
              unitCost: row.unitCost ?? '',
              totalValue: row.totalValue ?? '',
            })),
          )
        }
        className="rounded border px-3 py-2 text-sm"
      >
        Export CSV
      </button>
      <ReportList title="Expiring Products" rows={data.expiring.map((row) => `${row.name}: ${row.expiryDate} (${row.stockQty} stock)`)} danger />
      <ReportList title="Non-moving Products" rows={data.nonMoving.map((row) => `${row.name}: ${row.stockQty} stock`)} />
      <ReportList title="Low Stock" rows={data.lowStock.map((row) => `${row.name}: ${row.stockQty}/${row.reorderPoint}`)} />
      <ReportList title={`Inventory Valuation (Grand Total PHP ${data.grandTotal})`} rows={data.valuation.map((row) => `${row.name}: ${row.stockQty} x PHP ${row.unitCost} = PHP ${row.totalValue}`)} />
    </div>
  );
}

function ReportList({ title, rows, danger = false }: { title: string; rows: string[]; danger?: boolean }) {
  return <section className="rounded border bg-white p-4"><h2 className="font-semibold">{title}</h2><ul className="mt-2 list-disc pl-5 text-sm">{rows.map((row) => <li className={danger && row.includes(new Date().getFullYear().toString()) ? 'text-red-700' : ''} key={row}>{row}</li>)}</ul></section>;
}
