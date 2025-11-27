import type { Metadata } from 'next';
import { ThemeModeScript, ThemeProvider } from 'flowbite-react';

import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import themeVG from '@/themeVG';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'VuduGaming - Catálogo de Cartas Magic the Gathering',
  description: 'Catálogo de cartas Magic the Gathering - VuduGaming.cl',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <head>
        <ThemeModeScript />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider theme={themeVG}>{children}</ThemeProvider>
      </body>
    </html>
  );
}
