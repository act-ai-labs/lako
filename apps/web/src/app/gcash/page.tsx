import { GcashServices } from '@/components/gcash/gcash-services';

export default function GcashPage() {
  return (
    <div className="px-6 py-8">
      <h1 className="text-2xl font-bold">GCash Services</h1>
      <p className="mt-2 text-zinc-600">Cash-in, cash-out, e-load, float, and fees.</p>
      <div className="mt-6">
        <GcashServices />
      </div>
    </div>
  );
}
