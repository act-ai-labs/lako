import { ExpenseManager } from '@/components/expenses/expense-manager';

export default function ExpensesPage() {
  return (
    <div className="px-6 py-8">
      <h1 className="text-2xl font-bold">Expenses</h1>
      <p className="mt-2 text-zinc-600">Record and categorize operating expenses.</p>
      <div className="mt-6">
        <ExpenseManager />
      </div>
    </div>
  );
}
