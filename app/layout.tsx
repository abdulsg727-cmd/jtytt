import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { AuthProvider } from './lib/AuthContext';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'JETT - Jordan Express Tourist Transportation',
  description: 'Jordan Express Tourist Transportation - JETT',
  openGraph: {
    images: [
      {
        url: '/static/og_default.png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/static/og_default.png'],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}