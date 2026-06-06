import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-8 px-6 py-12">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">LAKO POS</h1>
        <p className="mt-2 text-zinc-600">
          Ledger-enabled AI Kiosk Operations for Philippine retail stores.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {[
          { href: '/pos', title: 'Point of Sale', desc: 'Checkout, payments, and receipts' },
          { href: '/gcash', title: 'GCash Services', desc: 'Cash-in, cash-out, and e-load' },
          { href: '/inventory', title: 'Inventory', desc: 'Products, stock, and categories' },
          { href: '/suppliers', title: 'Suppliers', desc: 'Supplier directory and purchase orders' },
          { href: '/expenses', title: 'Expenses', desc: 'Operating expenses and categories' },
          { href: '/reports', title: 'Reports', desc: 'Sales, revenue, and inventory health' },
          { href: '/admin', title: 'Admin', desc: 'Settings, users, and configuration' },
        ].map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm transition hover:border-zinc-300 hover:shadow"
          >
            <h2 className="font-semibold">{item.title}</h2>
            <p className="mt-1 text-sm text-zinc-600">{item.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
