'use client';

import { FormEvent, useCallback, useEffect, useState } from 'react';

interface Balance {
  balance: string;
  loadBalance: string;
  cashDrawerBalance: string;
  lowFloatThreshold: string;
}

interface Denomination {
  id: string;
  amount: string;
  sellingPrice: string;
}

export function GcashServices() {
  const [balance, setBalance] = useState<Balance | null>(null);
  const [denominations, setDenominations] = useState<Denomination[]>([]);
  const [tx, setTx] = useState({ type: 'cash_in', amount: '', fee: '0', mobileNumber: '', denominationId: '' });
  const [denomination, setDenomination] = useState({ amount: '', sellingPrice: '' });
  const [adjustment, setAdjustment] = useState({ type: 'top_up', amount: '', notes: '' });
  const [message, setMessage] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    const [balanceResponse, denominationResponse] = await Promise.all([
      fetch('/api/gcash/balance'),
      fetch('/api/gcash/denominations'),
    ]);
    if (balanceResponse.ok) setBalance((await balanceResponse.json()) as Balance);
    if (denominationResponse.ok) setDenominations((await denominationResponse.json()) as Denomination[]);
  }, []);

  useEffect(() => {
    // GCash balances are synchronized from the API.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadData();
  }, [loadData]);

  async function processTransaction(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const response = await fetch('/api/gcash/transactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(tx),
    });
    setMessage(response.ok ? 'GCash service transaction recorded.' : 'Unable to process transaction.');
    if (response.ok) await loadData();
  }

  async function saveDenomination(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const response = await fetch('/api/gcash/denominations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(denomination),
    });
    setMessage(response.ok ? 'E-load denomination saved.' : 'Unable to save denomination.');
    if (response.ok) {
      setDenomination({ amount: '', sellingPrice: '' });
      await loadData();
    }
  }

  async function adjustFloat(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const pin = window.prompt('Manager PIN');
    if (!pin) return;
    const auth = await fetch('/api/auth/manager-pin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pin }),
    });
    if (!auth.ok) {
      setMessage('Manager authorization failed.');
      return;
    }
    const response = await fetch('/api/gcash/float-adjustments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(adjustment),
    });
    setMessage(response.ok ? 'Float adjusted.' : 'Unable to adjust float.');
    if (response.ok) await loadData();
  }

  const lowFloat = balance ? Number(balance.balance) <= Number(balance.lowFloatThreshold) : false;

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
      <section className="rounded-xl border bg-white p-4 shadow-sm">
        <h2 className="font-semibold">Float Balances</h2>
        {balance ? (
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <div className={`rounded border p-3 ${lowFloat ? 'border-red-300 bg-red-50' : ''}`}>
              <div className="text-sm text-zinc-500">GCash Float</div>
              <div className="text-xl font-bold">PHP {balance.balance}</div>
              {lowFloat ? <div className="text-xs text-red-700">Low float alert</div> : null}
            </div>
            <div className="rounded border p-3">
              <div className="text-sm text-zinc-500">Load Balance</div>
              <div className="text-xl font-bold">PHP {balance.loadBalance}</div>
            </div>
            <div className="rounded border p-3">
              <div className="text-sm text-zinc-500">Cash Drawer</div>
              <div className="text-xl font-bold">PHP {balance.cashDrawerBalance}</div>
            </div>
          </div>
        ) : null}

        <h2 className="mt-6 font-semibold">E-load Denominations</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {denominations.map((item) => (
            <button key={item.id} onClick={() => setTx({ ...tx, type: 'load', denominationId: item.id, amount: item.amount })} className="rounded border px-3 py-2 text-sm">
              PHP {item.amount} sell PHP {item.sellingPrice}
            </button>
          ))}
        </div>
      </section>

      <aside className="space-y-6">
        <form onSubmit={processTransaction} className="rounded-xl border bg-white p-4 shadow-sm">
          <h2 className="font-semibold">GCash Service Transaction</h2>
          <div className="mt-3 grid gap-3">
            <select value={tx.type} onChange={(event) => setTx({ ...tx, type: event.target.value })} className="rounded border px-3 py-2">
              <option value="cash_in">Cash-in</option>
              <option value="cash_out">Cash-out</option>
              <option value="load">E-load</option>
            </select>
            <input value={tx.amount} onChange={(event) => setTx({ ...tx, amount: event.target.value })} placeholder="Amount" className="rounded border px-3 py-2" required />
            <input value={tx.fee} onChange={(event) => setTx({ ...tx, fee: event.target.value })} placeholder="Service fee" className="rounded border px-3 py-2" />
            <input value={tx.mobileNumber} onChange={(event) => setTx({ ...tx, mobileNumber: event.target.value })} placeholder="Mobile/reference number" className="rounded border px-3 py-2" />
          </div>
          <button className="mt-3 w-full rounded bg-zinc-900 px-4 py-2 text-sm font-semibold text-white">Process</button>
        </form>

        <form onSubmit={saveDenomination} className="rounded-xl border bg-white p-4 shadow-sm">
          <h2 className="font-semibold">Add E-load Denomination</h2>
          <div className="mt-3 grid gap-3">
            <input value={denomination.amount} onChange={(event) => setDenomination({ ...denomination, amount: event.target.value })} placeholder="Denomination amount" className="rounded border px-3 py-2" required />
            <input value={denomination.sellingPrice} onChange={(event) => setDenomination({ ...denomination, sellingPrice: event.target.value })} placeholder="Selling price" className="rounded border px-3 py-2" required />
          </div>
          <button className="mt-3 w-full rounded bg-zinc-900 px-4 py-2 text-sm font-semibold text-white">Save Denomination</button>
        </form>

        <form onSubmit={adjustFloat} className="rounded-xl border bg-white p-4 shadow-sm">
          <h2 className="font-semibold">Manual Float Adjustment</h2>
          <div className="mt-3 grid gap-3">
            <select value={adjustment.type} onChange={(event) => setAdjustment({ ...adjustment, type: event.target.value })} className="rounded border px-3 py-2">
              <option value="top_up">Top-up</option>
              <option value="withdrawal">Withdrawal</option>
            </select>
            <input value={adjustment.amount} onChange={(event) => setAdjustment({ ...adjustment, amount: event.target.value })} placeholder="Amount" className="rounded border px-3 py-2" required />
            <textarea value={adjustment.notes} onChange={(event) => setAdjustment({ ...adjustment, notes: event.target.value })} placeholder="Notes" className="rounded border px-3 py-2" />
          </div>
          <button className="mt-3 w-full rounded bg-zinc-900 px-4 py-2 text-sm font-semibold text-white">Adjust Float</button>
        </form>
        {message ? <p className="rounded bg-zinc-100 p-3 text-sm">{message}</p> : null}
      </aside>
    </div>
  );
}
