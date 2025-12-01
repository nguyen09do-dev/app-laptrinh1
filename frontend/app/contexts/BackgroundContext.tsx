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

  // Load theme from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('background-theme') as BackgroundTheme;
    if (savedTheme && ['aurora', 'ocean', 'sunset'].includes(savedTheme)) {
      setThemeState(savedTheme);
    }
  }, []);

  const setTheme = (newTheme: BackgroundTheme) => {
    setThemeState(newTheme);
    localStorage.setItem('background-theme', newTheme);
  };

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
