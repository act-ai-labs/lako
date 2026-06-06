import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { AppNav } from '@/components/app-nav';
import { OfflineStatus } from '@/components/offline/offline-status';
import { ServiceWorkerRegistration } from '@/components/service-worker-registration';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'LAKO POS',
  description: 'Ledger-enabled AI Kiosk Operations — retail point of sale',
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'LAKO POS',
  },
};

export const viewport: Viewport = {
  themeColor: '#18181b',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-zinc-50 text-zinc-900">
        <AppNav />
        <OfflineStatus />
        <main className="flex-1">{children}</main>
        <ServiceWorkerRegistration />
      </body>
    </html>
  );
}
