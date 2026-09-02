import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ThemeMode } from '../types';
import { DB } from '../services/db';

interface ThemeContextType {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeMode>('dark');
  const [isDark, setIsDark] = useState<boolean>(false);

  useEffect(() => {
    const syncDefaultTheme = () => {
      DB.getSiteSettings().then(settings => {
        if (settings?.defaultTheme) {
          setThemeState(settings.defaultTheme);
        }
      });
    };

    syncDefaultTheme();
    window.addEventListener('site-settings-updated', syncDefaultTheme);
    return () => window.removeEventListener('site-settings-updated', syncDefaultTheme);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;

    const applyDark = (dark: boolean) => {
      setIsDark(dark);
      if (dark) {
        root.classList.add('dark');
        body.classList.add('dark');
        root.style.colorScheme = 'dark';
      } else {
        root.classList.remove('dark');
        body.classList.remove('dark');
        root.style.colorScheme = 'light';
      }
    };

    if (theme === 'dark') {
      applyDark(true);
    } else if (theme === 'light') {
      applyDark(false);
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      applyDark(prefersDark);
    }

    localStorage.setItem('teacher_app_theme', theme);
  }, [theme]);

  const setTheme = (mode: ThemeMode) => {
    setThemeState(mode);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, isDark }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};
