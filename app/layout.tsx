// ============================================================
// app/layout.tsx — Global root layout
// Global Toast container and theme injection without hardcoded global nav.
// Navigation is strictly isolated per role layout.
// ============================================================

import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '@/components/ThemeProvider';
import { ToastContainer } from '@/components/ui/ToastNotification';
import { AuthModal } from '@/components/auth/AuthModal';
import { SessionProvider } from '@/components/SessionProvider';

export const metadata: Metadata = {
  title: 'COE Portal — Community of Employees',
  description:
    'The enterprise B2B live reverse-bidding marketplace connecting corporate teams with verified vendors for sports, events, offsites, gifts, and merchandise.',
  keywords: 'corporate events, employee benefits, B2B marketplace, reverse bidding, DLF Cyber City',
  openGraph: {
    title: 'COE Portal — Community of Employees',
    description: 'Enterprise corporate procurement marketplace',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#FFF7EC" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500;12..96,700;12..96,800&family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <ThemeProvider>
          <SessionProvider />
          {children}
          <ToastContainer />
          <AuthModal />
        </ThemeProvider>
      </body>
    </html>
  );
}
