import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { Globe } from 'lucide-react';

export const LangToggle: React.FC = () => {
  const { language, setLanguage } = useLanguage();

  const toggleLanguage = () => {
    setLanguage(language === 'vi' ? 'en' : 'vi');
  };

  return (
    <button
      onClick={toggleLanguage}
      type="button"
      className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all inline-flex items-center gap-1.5 text-xs font-extrabold shadow-sm"
      title={`Current: ${language.toUpperCase()} - Click to switch`}
      aria-label="Toggle language"
    >
      <Globe className="w-4 h-4 text-sky-500" />
      <span className="uppercase text-sky-600 dark:text-sky-400">{language}</span>
    </button>
  );
};
