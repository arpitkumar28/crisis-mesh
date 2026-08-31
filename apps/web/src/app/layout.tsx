import type { Metadata } from 'next';
import './globals.css';
import { AuthInitializer } from '@/components/auth-initializer';

export const metadata: Metadata = {
  title: 'CrisisMesh - Disaster Intelligence Platform',
  description: 'AI-powered disaster intelligence, early-warning, and emergency response platform',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <AuthInitializer />
        {children}
      </body>
    </html>
  );
}
