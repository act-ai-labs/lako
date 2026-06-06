'use client';

import { FormEvent, useEffect, useState } from 'react';

interface DiscountRule {
  id: string;
  name: string;
  type: 'percentage' | 'fixed';
  scope: 'item' | 'cart';
  trigger: 'manual' | 'sku' | 'category' | 'minimum_amount';
  value: string;
  triggerValue: string | null;
  authorizationRequired: boolean;
}

type DiscountRuleForm = Omit<DiscountRule, 'id' | 'triggerValue'> & {
  triggerValue: string;
};

const emptyRule: DiscountRuleForm = {
  name: '',
  type: 'percentage',
  scope: 'item',
  trigger: 'sku',
  value: '',
  triggerValue: '',
  authorizationRequired: false,
};

export function DiscountRulesManager() {
  const [rules, setRules] = useState<DiscountRule[]>([]);
  const [form, setForm] = useState(emptyRule);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    void loadRules();
  }, []);

  async function loadRules() {
    const response = await fetch('/api/discounts');
    if (response.ok) {
      setRules((await response.json()) as DiscountRule[]);
    }
  }

  async function saveRule(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const response = await fetch(editingId ? `/api/discounts/${editingId}` : '/api/discounts', {
      method: editingId ? 'PATCH' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        triggerValue: form.triggerValue || undefined,
      }),
    });

    setMessage(response.ok ? 'Discount rule saved.' : 'Unable to save discount rule.');
    if (response.ok) {
      setForm(emptyRule);
      setEditingId(null);
      await loadRules();
    }
  }

  async function deleteRule(id: string) {
    const response = await fetch(`/api/discounts/${id}`, { method: 'DELETE' });
    setMessage(response.ok ? 'Discount rule deleted.' : 'Unable to delete discount rule.');
    if (response.ok) {
      await loadRules();
    }
  }

  function editRule(rule: DiscountRule) {
    setEditingId(rule.id);
    setForm({
      name: rule.name,
      type: rule.type,
      scope: rule.scope,
      trigger: rule.trigger,
      value: rule.value,
      triggerValue: rule.triggerValue ?? '',
      authorizationRequired: rule.authorizationRequired,
    });
  }

  return (
    <section className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
      <h2 className="text-lg font-semibold">Discount Rules</h2>
      <form onSubmit={saveRule} className="mt-4 grid gap-3 md:grid-cols-2">
        <input className="rounded border px-3 py-2" placeholder="Rule name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required />
        <input className="rounded border px-3 py-2" placeholder="Value" value={form.value} onChange={(event) => setForm({ ...form, value: event.target.value })} required />
        <select className="rounded border px-3 py-2" value={form.type} onChange={(event) => setForm({ ...form, type: event.target.value as DiscountRule['type'] })}>
          <option value="percentage">Percentage</option>
          <option value="fixed">Fixed amount</option>
        </select>
        <select className="rounded border px-3 py-2" value={form.scope} onChange={(event) => setForm({ ...form, scope: event.target.value as DiscountRule['scope'] })}>
          <option value="item">Item</option>
          <option value="cart">Cart</option>
        </select>
        <select className="rounded border px-3 py-2" value={form.trigger} onChange={(event) => setForm({ ...form, trigger: event.target.value as DiscountRule['trigger'] })}>
          <option value="sku">SKU</option>
          <option value="category">Category ID</option>
          <option value="minimum_amount">Minimum amount</option>
          <option value="manual">Manual</option>
        </select>
        <input className="rounded border px-3 py-2" placeholder="Trigger value" value={form.triggerValue} onChange={(event) => setForm({ ...form, triggerValue: event.target.value })} />
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={form.authorizationRequired} onChange={(event) => setForm({ ...form, authorizationRequired: event.target.checked })} />
          Manager authorization required
        </label>
        <button className="rounded bg-zinc-900 px-4 py-2 text-sm font-semibold text-white">
          {editingId ? 'Update Rule' : 'Create Rule'}
        </button>
      </form>

      <div className="mt-4 space-y-2">
        {rules.map((rule) => (
          <div key={rule.id} className="flex flex-wrap items-center justify-between gap-3 rounded border p-3 text-sm">
            <div>
              <div className="font-medium">{rule.name}</div>
              <div className="text-zinc-500">
                {rule.type} {rule.value} | {rule.scope} | {rule.trigger} {rule.triggerValue ?? ''}
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => editRule(rule)} className="rounded border px-3 py-1">
                Edit
              </button>
              <button onClick={() => void deleteRule(rule.id)} className="rounded border border-red-300 px-3 py-1 text-red-700">
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
      {message ? <p className="mt-3 rounded bg-zinc-100 p-3 text-sm">{message}</p> : null}
    </section>
  );
}
