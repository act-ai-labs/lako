import { PosCheckout } from '@/components/pos/pos-checkout';

export default function PosPage() {
  return (
    <div className="px-6 py-8">
      <h1 className="text-2xl font-bold">Point of Sale</h1>
      <p className="mt-2 text-zinc-600">Search or scan products, manage a cart, and review totals.</p>
      <div className="mt-6">
        <PosCheckout />
      </div>
    </div>
  );
}
