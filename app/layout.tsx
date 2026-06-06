import type { Metadata } from 'next';
import { Nunito } from 'next/font/google';
import './globals.css';

const nunito = Nunito({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-nunito',
});

export const metadata: Metadata = {
  title: 'MTG Inventory Manager - Catálogo de Cartas Magic the Gathering',
  description: 'Catálogo de cartas Magic the Gathering',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${nunito.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
