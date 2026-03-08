import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Daily Mentor AI',
  description: 'Your premium, privacy-focused daily growth companion.',
  manifest: '/manifest.json',
  themeColor: '#000000'
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-black text-white min-h-screen selection:bg-white/30`}>
        {children}
      </body>
    </html>
  );
}
