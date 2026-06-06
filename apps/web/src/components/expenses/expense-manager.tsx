'use client';

import { FormEvent, useCallback, useEffect, useState } from 'react';

interface ExpenseCategory {
  id: string;
  name: string;
}

interface Supplier {
  id: string;
  name: string;
}

interface Expense {
  id: string;
  amount: string;
  date: string;
  description: string | null;
  category: ExpenseCategory;
  supplier: Supplier | null;
}

const today = new Date().toISOString().slice(0, 10);
const emptyExpense = { categoryId: '', amount: '', date: today, description: '', supplierId: '' };

export function ExpenseManager() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [form, setForm] = useState(emptyExpense);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [categoryName, setCategoryName] = useState('');
  const [filters, setFilters] = useState({ startDate: '', endDate: '', categoryId: '' });
  const [message, setMessage] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    const params = new URLSearchParams();
    if (filters.startDate) params.set('startDate', filters.startDate);
    if (filters.endDate) params.set('endDate', filters.endDate);
    if (filters.categoryId) params.set('categoryId', filters.categoryId);
    const [expenseResponse, categoryResponse, supplierResponse] = await Promise.all([
      fetch(`/api/expenses${params.toString() ? `?${params}` : ''}`),
      fetch('/api/expense-categories'),
      fetch('/api/suppliers'),
    ]);
    if (expenseResponse.ok) setExpenses((await expenseResponse.json()) as Expense[]);
    if (categoryResponse.ok) setCategories((await categoryResponse.json()) as ExpenseCategory[]);
    if (supplierResponse.ok) setSuppliers((await supplierResponse.json()) as Supplier[]);
  }, [filters]);

  useEffect(() => {
    // Expense lists are client-owned state synchronized from the API.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadData();
  }, [loadData]);

  async function saveExpense(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const response = await fetch(editingId ? `/api/expenses/${editingId}` : '/api/expenses', {
      method: editingId ? 'PATCH' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        supplierId: form.supplierId || undefined,
        description: form.description || undefined,
      }),
    });
    setMessage(response.ok ? 'Expense saved.' : 'Unable to save expense.');
    if (response.ok) {
      setForm(emptyExpense);
      setEditingId(null);
      await loadData();
    }
  }

  async function saveCategory(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const response = await fetch('/api/expense-categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: categoryName }),
    });
    setMessage(response.ok ? 'Expense category saved.' : 'Unable to save category.');
    if (response.ok) {
      setCategoryName('');
      await loadData();
    }
  }

  async function renameCategory(category: ExpenseCategory) {
    const name = window.prompt('Rename expense category', category.name);
    if (!name) return;
    const response = await fetch(`/api/expense-categories/${category.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    });
    setMessage(response.ok ? 'Expense category renamed.' : 'Unable to rename category.');
    if (response.ok) await loadData();
  }

  function editExpense(expense: Expense) {
    setEditingId(expense.id);
    setForm({
      categoryId: expense.category.id,
      amount: expense.amount,
      date: expense.date,
      description: expense.description ?? '',
      supplierId: expense.supplier?.id ?? '',
    });
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <section className="rounded-xl border bg-white p-4 shadow-sm">
        <div className="flex flex-wrap gap-2">
          <input type="date" value={filters.startDate} onChange={(event) => setFilters({ ...filters, startDate: event.target.value })} className="rounded border px-3 py-2" />
          <input type="date" value={filters.endDate} onChange={(event) => setFilters({ ...filters, endDate: event.target.value })} className="rounded border px-3 py-2" />
          <select value={filters.categoryId} onChange={(event) => setFilters({ ...filters, categoryId: event.target.value })} className="rounded border px-3 py-2">
            <option value="">All categories</option>
            {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
          </select>
        </div>
        <div className="mt-4 space-y-2">
          {expenses.map((expense) => (
            <button key={expense.id} onClick={() => editExpense(expense)} className="w-full rounded border p-3 text-left text-sm">
              <div className="flex justify-between">
                <span className="font-medium">{expense.category.name}</span>
                <span>PHP {expense.amount}</span>
              </div>
              <div className="text-zinc-500">{expense.date} | {expense.supplier?.name ?? 'No supplier'}</div>
              <div>{expense.description}</div>
            </button>
          ))}
        </div>
      </section>
      <aside className="space-y-6">
        <form onSubmit={saveExpense} className="rounded-xl border bg-white p-4 shadow-sm">
          <h2 className="font-semibold">{editingId ? 'Edit Expense' : 'Add Expense'}</h2>
          <div className="mt-3 grid gap-3">
            <select value={form.categoryId} onChange={(event) => setForm({ ...form, categoryId: event.target.value })} className="rounded border px-3 py-2" required>
              <option value="">Select category</option>
              {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
            </select>
            <input value={form.amount} onChange={(event) => setForm({ ...form, amount: event.target.value })} placeholder="Amount" className="rounded border px-3 py-2" required />
            <input type="date" value={form.date} onChange={(event) => setForm({ ...form, date: event.target.value })} className="rounded border px-3 py-2" required />
            <select value={form.supplierId} onChange={(event) => setForm({ ...form, supplierId: event.target.value })} className="rounded border px-3 py-2">
              <option value="">Optional supplier</option>
              {suppliers.map((supplier) => <option key={supplier.id} value={supplier.id}>{supplier.name}</option>)}
            </select>
            <textarea value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} placeholder="Description" className="rounded border px-3 py-2" />
          </div>
          <button className="mt-3 w-full rounded bg-zinc-900 px-4 py-2 text-sm font-semibold text-white">Save Expense</button>
        </form>
        <form onSubmit={saveCategory} className="rounded-xl border bg-white p-4 shadow-sm">
          <h2 className="font-semibold">Expense Categories</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {categories.map((category) => <button type="button" key={category.id} onClick={() => void renameCategory(category)} className="rounded-full border px-3 py-1 text-xs">{category.name}</button>)}
          </div>
          <div className="mt-3 flex gap-2">
            <input value={categoryName} onChange={(event) => setCategoryName(event.target.value)} placeholder="New category" className="min-w-0 flex-1 rounded border px-3 py-2" required />
            <button className="rounded bg-zinc-900 px-3 py-2 text-sm font-semibold text-white">Add</button>
          </div>
        </form>
        {message ? <p className="rounded bg-zinc-100 p-3 text-sm">{message}</p> : null}
      </aside>
    </div>
  );
}
