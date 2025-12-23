import type { Metadata } from 'next';
import { ThemeModeScript } from 'flowbite-react';
import { ThemeInit } from '@/.flowbite-react/init';

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
    <html suppressHydrationWarning>
      <head>
        <ThemeModeScript mode="light" defaultMode="light" />
      </head>
      <ThemeInit />
      <body>{children}</body>
    </html>
  );
}
