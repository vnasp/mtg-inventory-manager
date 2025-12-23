import { ThemeProvider } from 'flowbite-react';
import themeBackoffice from '@/themeBackoffice';
import './backoffice.css';

export default function BackofficeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider theme={themeBackoffice}>
      <div className="backoffice-layout">{children}</div>
    </ThemeProvider>
  );
}
