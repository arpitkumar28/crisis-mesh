import type { Metadata } from 'next';
import './globals.css';

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
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
