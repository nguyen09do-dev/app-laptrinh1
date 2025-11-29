import type { Metadata } from 'next';
import './globals.css';
import TopNav from './components/TopNav';

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
    <html lang="vi">
      <body className="antialiased">
        {/* Background decoration */}
        <div className="fixed inset-0 -z-10 overflow-hidden">
          {/* Gradient orbs */}
          <div className="absolute top-1/4 -left-20 w-96 h-96 bg-midnight-600/30 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-coral-500/20 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-midnight-700/20 rounded-full blur-3xl" />

          {/* Grid pattern overlay */}
          <div
            className="absolute inset-0 opacity-[0.02]"
            style={{
              backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                               linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
              backgroundSize: '50px 50px',
            }}
          />
        </div>

        <TopNav />
        {children}
      </body>
    </html>
  );
}



