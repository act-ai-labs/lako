import Link from 'next/link';

const reportLinks = [
  { href: '/reports/sales', label: 'Sales Report' },
  { href: '/reports/revenue', label: 'Revenue Report' },
  { href: '/reports/inventory', label: 'Inventory Reports' },
];

export default function ReportsPage() {
  return (
    <div className="px-6 py-8">
      <h1 className="text-2xl font-bold">Reports</h1>
      <p className="mt-2 text-zinc-600">Financial and inventory reporting.</p>
      <ul className="mt-6 flex flex-col gap-2">
        {reportLinks.map((link) => (
          <li key={link.href}>
            <Link href={link.href} className="text-blue-600 hover:underline">
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
