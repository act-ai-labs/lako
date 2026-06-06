'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { href: '/pos', label: 'POS' },
  { href: '/gcash', label: 'GCash' },
  { href: '/inventory', label: 'Inventory' },
  { href: '/suppliers', label: 'Suppliers' },
  { href: '/expenses', label: 'Expenses' },
  { href: '/reports', label: 'Reports' },
  { href: '/admin', label: 'Admin' },
];

export function AppNav() {
  const pathname = usePathname();

  return (
    <nav className="flex items-center gap-1 border-b border-zinc-200 bg-white px-4 py-2">
      <Link href="/" className="mr-4 text-sm font-semibold text-zinc-900">
        LAKO POS
      </Link>
      {navItems.map((item) => {
        const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
              active
                ? 'bg-zinc-900 text-white'
                : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900'
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
