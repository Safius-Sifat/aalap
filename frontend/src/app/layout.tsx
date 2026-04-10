import type { Metadata } from 'next';
import { Space_Grotesk, Space_Mono } from 'next/font/google';
import './globals.css';
import { AppProviders } from '@/components/providers/AppProviders';

const bodyFont = Space_Grotesk({
  variable: '--font-space-body',
  subsets: ['latin'],
});

const monoFont = Space_Mono({
  variable: '--font-space-mono',
  subsets: ['latin'],
  weight: ['400', '700'],
});

export const metadata: Metadata = {
  title: 'Aalap',
  description: 'WhatsApp style realtime chat app',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${bodyFont.variable} ${monoFont.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
