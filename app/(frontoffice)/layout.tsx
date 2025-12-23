import { ThemeProvider } from 'flowbite-react';
import themeVG from '@/themeVG';
import TopBar from './components/layout/TopBar';
import HeaderWrapper from './components/layout/HeaderWrapper';
import Footer from './components/layout/Footer';
import '@/app/globals.css';

export default function FrontofficeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider theme={themeVG}>
      <TopBar />
      <HeaderWrapper />
      {children}
      <Footer />
    </ThemeProvider>
  );
}
