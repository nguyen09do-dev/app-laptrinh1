'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type BackgroundTheme = 'aurora' | 'ocean' | 'sunset';

interface BackgroundContextType {
  theme: BackgroundTheme;
  setTheme: (theme: BackgroundTheme) => void;
}

const BackgroundContext = createContext<BackgroundContextType | undefined>(undefined);

export function BackgroundProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<BackgroundTheme>('aurora');
  const [mounted, setMounted] = useState(false);

  // Load theme from localStorage on mount
  useEffect(() => {
    setMounted(true);
    try {
      const savedTheme = localStorage.getItem('background-theme') as BackgroundTheme;
      if (savedTheme && ['aurora', 'ocean', 'sunset'].includes(savedTheme)) {
        setThemeState(savedTheme);
      }
    } catch (error) {
      console.warn('Failed to load background theme from localStorage:', error);
    }
  }, []);

  const setTheme = (newTheme: BackgroundTheme) => {
    setThemeState(newTheme);
    try {
      localStorage.setItem('background-theme', newTheme);
    } catch (error) {
      console.warn('Failed to save background theme to localStorage:', error);
    }
  };

  // Render immediately with default theme to avoid blank screen
  // This prevents the app from being completely hidden during hydration
  return (
    <BackgroundContext.Provider value={{ theme, setTheme }}>
      {children}
    </BackgroundContext.Provider>
  );
}

export function useBackground() {
  const context = useContext(BackgroundContext);
  if (context === undefined) {
    throw new Error('useBackground must be used within a BackgroundProvider');
  }
  return context;
}
