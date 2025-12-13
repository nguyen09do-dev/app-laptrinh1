'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { useLanguage } from '@/app/contexts/LanguageContext';
import { Languages } from 'lucide-react';

export default function TopNav() {
  const pathname = usePathname();
  const { language, setLanguage } = useLanguage();

  const navItems = [
    { name: 'Welcome', path: '/welcome' },
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Ideas', path: '/ideas' },
    { name: 'Briefs', path: '/briefs' },
    { name: 'Content Studio', path: '/studio' },
    { name: 'Library', path: '/library' },
    { name: 'Publisher', path: '/publisher' },
    { name: 'Analytics', path: '/analytics' },
    { name: 'Settings', path: '/settings' },
  ];

  const languageOptions = [
    { value: 'vi' as const, label: '🇻🇳 VN', fullLabel: 'Tiếng Việt' },
    { value: 'en' as const, label: '🇬🇧 EN', fullLabel: 'English' },
    { value: 'vi-en' as const, label: '🌐 Both', fullLabel: 'Bilingual' },
  ];

  return (
    <nav className="bg-gradient-to-r from-blue-600 to-purple-600 dark:from-midnight-700 dark:to-purple-800 text-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-2">
            <span className="text-2xl font-bold">AI Content Studio</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="flex space-x-1">
              {navItems.map((item) => {
                const isActive = pathname === item.path || (item.path === '/ideas' && pathname === '/');
                return (
                  <Link
                    key={item.path}
                    href={item.path}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                      isActive
                        ? 'bg-white text-blue-600 dark:text-midnight-700 shadow-md'
                        : 'hover:bg-white/10'
                    }`}
                  >
                    {item.name}
                  </Link>
                );
              })}
            </div>

            {/* Language Selector */}
            <div className="flex items-center gap-1 bg-white/10 rounded-lg p-1">
              {languageOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setLanguage(option.value)}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                    language === option.value
                      ? 'bg-white text-blue-600 dark:text-midnight-700 shadow-md'
                      : 'hover:bg-white/10 text-white/90'
                  }`}
                  title={option.fullLabel}
                >
                  {option.label}
                </button>
              ))}
            </div>

            <ThemeToggle />
          </div>
        </div>
      </div>
    </nav>
  );
}
