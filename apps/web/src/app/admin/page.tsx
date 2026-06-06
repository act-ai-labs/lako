import { DiscountRulesManager } from '@/components/discounts/discount-rules-manager';

export default function AdminPage() {
  return (
    <div className="px-6 py-8">
      <h1 className="text-2xl font-bold">Admin</h1>
      <p className="mt-2 text-zinc-600">Settings, users, discounts, and configuration.</p>
      <div className="mt-6">
        <DiscountRulesManager />
      </div>
    </div>
  );
}
