import type { Metadata } from 'next';
import './globals.css';
import TopNav from './components/TopNav';
import DynamicBackground from './components/DynamicBackground';
import { BackgroundProvider } from './contexts/BackgroundContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { ThemeProvider } from '@/components/theme-provider';
import { ToastProvider } from '@/components/ui/toast-provider';

export const metadata: Metadata = {
  title: 'AI Content Studio',
  description: 'Generate creative content ideas powered by AI',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body className="antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange={false}
        >
          <LanguageProvider>
            <BackgroundProvider>
              <DynamicBackground />

              <TopNav />
              {children}
              <ToastProvider />
            </BackgroundProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}









