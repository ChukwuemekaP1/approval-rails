import type { Metadata, Viewport } from 'next';
import './globals.css';
import { ClientProviders } from '@/ui/providers/ClientProviders';

export const metadata: Metadata = {
  title: 'ApproveRail | AI-Assisted Purchasing with Human Consent',
  description:
    'Secure, policy-controlled purchasing platform where AI recommends, deterministic policies verify, and humans authorize exact terms.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 dark:bg-gray-950 font-sans antialiased">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:px-4 focus:py-2 focus:bg-sky-600 focus:text-white focus:rounded-md focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-white"
        >
          Skip to main content
        </a>
        <ClientProviders>{children}</ClientProviders>
      </body>
    </html>
  );
}
