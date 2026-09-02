import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export const ThemeToggle: React.FC = () => {
  const { isDark, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(isDark ? 'light' : 'dark');
  };

  return (
    <button
      onClick={toggleTheme}
      type="button"
      className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center justify-center shadow-sm cursor-pointer"
      title={isDark ? 'Chuyển sang giao diện Sáng' : 'Chuyển sang giao diện Tối'}
      aria-label="Toggle theme mode"
    >
      {isDark ? (
        <Moon className="w-4 h-4 text-sky-400" />
      ) : (
        <Sun className="w-4 h-4 text-amber-500" />
      )}
    </button>
  );
};
